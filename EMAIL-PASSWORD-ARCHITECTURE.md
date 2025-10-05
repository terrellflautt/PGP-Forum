# 🔐 Email & Password Architecture - ProtonMail-Style Security

**Philosophy**: Zero-knowledge encryption means if you lose your password, your data is gone forever.
**Motto**: "Your privacy is so secure, even we can't recover it."

---

## 🎯 Authentication Flow

### Current (Phase 1) - Google OAuth Only ✅
```
User signs in → Google OAuth → JWT token → Access granted
- No password needed
- Gmail linked to account
- Can't change username (permanent)
- 1 account per Gmail
- Username = unique identifier
```

### Future (Phase 2) - Email Backup Option

```
User wants to disconnect Gmail:
1. Must set backup email + password
2. System sends verification email
3. User creates strong password
4. Password encrypts their private PGP key
5. Now can login with email/password instead of Google
```

---

## 🔑 Password Security Model (ProtonMail-Style)

### How It Works

#### Step 1: User Sets Password
```typescript
// User creates password
const password = 'user-chosen-password';
const email = 'backup@example.com';

// Derive encryption key from password
const salt = generateSalt(); // Random salt per user
const encryptionKey = deriveKey(password, salt); // PBKDF2 or Argon2

// Encrypt private PGP key with password-derived key
const encryptedPrivateKey = encrypt(userPGPPrivateKey, encryptionKey);

// Store in DynamoDB
await dynamodb.put({
  userId,
  backupEmail: email,
  salt, // Store salt (needed for decryption)
  encryptedPrivateKey, // Encrypted with password
  passwordHash: hash(password) // For login verification only
});
```

#### Step 2: Login with Password
```typescript
// User enters password
const password = 'user-chosen-password';

// Retrieve user data
const user = await dynamodb.get({ userId });

// Verify password
if (hash(password) !== user.passwordHash) {
  throw new Error('Invalid password');
}

// Derive same encryption key
const encryptionKey = deriveKey(password, user.salt);

// Decrypt private PGP key
const privateKey = decrypt(user.encryptedPrivateKey, encryptionKey);

// User can now decrypt messages
```

#### Step 3: Password Reset (IMPOSSIBLE!)
```
User: "I forgot my password!"
System: "Sorry, your data is encrypted with your password.
        We CANNOT recover it. All your encrypted messages
        are permanently lost."

Options:
1. Create new account (lose all data)
2. If you have PGP private key backed up locally, import it
3. Otherwise: Data is gone forever (this is the price of privacy)
```

---

## 📧 Email Verification Flow

### Purpose
- Verify backup email ownership
- Enable password recovery for account ACCESS (not data recovery)
- Send important notifications

### Implementation

#### 1. User Adds Backup Email
```typescript
// Frontend
const addBackupEmail = async (email: string) => {
  const response = await fetch(`${API_BASE_URL}/users/me/backup-email`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });

  // System sends verification email via SES
  alert('Verification email sent! Check your inbox.');
};
```

#### 2. Send Verification Email (Lambda + SES)
```javascript
// Backend: src/handlers/users.js
const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-east-1' });

exports.addBackupEmail = async (event) => {
  const userId = event.requestContext.authorizer.userId;
  const { email } = JSON.parse(event.body);

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

  // Save to DynamoDB
  await dynamodb.update({
    TableName: USERS_TABLE,
    Key: { userId },
    UpdateExpression: 'SET backupEmail = :email, emailVerificationToken = :token, emailVerificationExpiry = :expiry, emailVerified = :false',
    ExpressionAttributeValues: {
      ':email': email,
      ':token': verificationToken,
      ':expiry': expiresAt,
      ':false': false
    }
  }).promise();

  // Send verification email via SES
  await ses.sendEmail({
    Source: 'noreply@snapitsoftware.com',
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: 'Verify your SnapIT Forum backup email' },
      Body: {
        Html: {
          Data: `
            <h2>Verify Your Email</h2>
            <p>Click the link below to verify your backup email:</p>
            <a href="https://forum.snapitsoftware.com/verify-email?token=${verificationToken}">
              Verify Email
            </a>
            <p>This link expires in 24 hours.</p>
            <p><strong>Important:</strong> If you forget your password, your encrypted data CANNOT be recovered.
            This email is only for account access recovery, not data recovery.</p>
          `
        }
      }
    }
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
};
```

#### 3. Verify Email Token
```javascript
exports.verifyEmail = async (event) => {
  const { token } = event.queryStringParameters;

  // Find user with this token
  const users = await dynamodb.scan({
    TableName: USERS_TABLE,
    FilterExpression: 'emailVerificationToken = :token AND emailVerificationExpiry > :now',
    ExpressionAttributeValues: {
      ':token': token,
      ':now': Date.now()
    }
  }).promise();

  if (users.Items.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid or expired token' })
    };
  }

  const user = users.Items[0];

  // Mark email as verified
  await dynamodb.update({
    TableName: USERS_TABLE,
    Key: { userId: user.userId },
    UpdateExpression: 'SET emailVerified = :true, emailVerificationToken = :null',
    ExpressionAttributeValues: {
      ':true': true,
      ':null': null
    }
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
};
```

---

## 🔐 Password Reset Flow (Account Access Only)

### Important: Data is NOT Recoverable

```
┌─────────────────────────────────────────────────────────┐
│  User Forgets Password                                  │
├─────────────────────────────────────────────────────────┤
│  1. Click "Forgot Password"                             │
│  2. Enter backup email                                  │
│  3. Receive reset link via SES                          │
│  4. Click link → Create NEW password                    │
│  5. ⚠️  ALL ENCRYPTED DATA IS LOST                      │
│  6. Can create new PGP key pair                         │
│  7. Start fresh (account intact, data gone)             │
└─────────────────────────────────────────────────────────┘
```

### Implementation

#### 1. Request Password Reset
```javascript
exports.requestPasswordReset = async (event) => {
  const { email } = JSON.parse(event.body);

  // Find user by backup email
  const users = await dynamodb.scan({
    TableName: USERS_TABLE,
    FilterExpression: 'backupEmail = :email AND emailVerified = :true',
    ExpressionAttributeValues: {
      ':email': email,
      ':true': true
    }
  }).promise();

  if (users.Items.length === 0) {
    // Don't reveal if email exists (security)
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  }

  const user = users.Items[0];

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + (1 * 60 * 60 * 1000); // 1 hour

  await dynamodb.update({
    TableName: USERS_TABLE,
    Key: { userId: user.userId },
    UpdateExpression: 'SET passwordResetToken = :token, passwordResetExpiry = :expiry',
    ExpressionAttributeValues: {
      ':token': resetToken,
      ':expiry': expiresAt
    }
  }).promise();

  // Send reset email via SES
  await ses.sendEmail({
    Source: 'noreply@snapitsoftware.com',
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: 'Reset your SnapIT Forum password' },
      Body: {
        Html: {
          Data: `
            <h2>Reset Your Password</h2>
            <p>Click the link below to reset your password:</p>
            <a href="https://forum.snapitsoftware.com/reset-password?token=${resetToken}">
              Reset Password
            </a>
            <p>This link expires in 1 hour.</p>
            <p><strong>⚠️ CRITICAL WARNING:</strong></p>
            <p>Resetting your password will <strong>PERMANENTLY DELETE</strong> all your encrypted messages.</p>
            <p>We use zero-knowledge encryption. Without your old password, your data CANNOT be recovered.</p>
            <p>You will be able to access your account, but all previous encrypted messages will be lost.</p>
            <p>If you did not request this, ignore this email.</p>
          `
        }
      }
    }
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
};
```

#### 2. Reset Password (Data Loss)
```javascript
exports.resetPassword = async (event) => {
  const { token, newPassword } = JSON.parse(event.body);

  // Find user with valid reset token
  const users = await dynamodb.scan({
    TableName: USERS_TABLE,
    FilterExpression: 'passwordResetToken = :token AND passwordResetExpiry > :now',
    ExpressionAttributeValues: {
      ':token': token,
      ':now': Date.now()
    }
  }).promise();

  if (users.Items.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid or expired token' })
    };
  }

  const user = users.Items[0];

  // Generate new salt
  const newSalt = crypto.randomBytes(16).toString('hex');
  const newPasswordHash = await hash(newPassword);

  // ⚠️ CRITICAL: Delete old encrypted private key
  // User must generate NEW PGP key pair
  await dynamodb.update({
    TableName: USERS_TABLE,
    Key: { userId: user.userId },
    UpdateExpression: 'SET passwordHash = :hash, salt = :salt, encryptedPrivateKey = :null, passwordResetToken = :null, pgpPublicKey = :null REMOVE passwordResetExpiry',
    ExpressionAttributeValues: {
      ':hash': newPasswordHash,
      ':salt': newSalt,
      ':null': null
    }
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      warning: 'All encrypted data has been permanently deleted. You must generate a new PGP key pair.'
    })
  };
};
```

---

## 🗑️ Data Destruction Policy

### What Gets Deleted on Password Reset

```
✅ PRESERVED (Account Info):
- User ID (UUID)
- Gmail address
- Username
- Backup email
- Account creation date
- Forum ownership
- Subscription tier

❌ PERMANENTLY DELETED (Encrypted Data):
- Private PGP key
- Public PGP key (must regenerate)
- All encrypted messages (unrecoverable)
- Dead Man's Switch encrypted payloads
- Any saved encrypted files
```

### Why This Happens
```
Password Reset Flow:
1. Old password encrypted your private PGP key
2. New password creates NEW encryption key
3. Can't decrypt old key without old password
4. Without private key, can't decrypt messages
5. Messages encrypted with old public key are now useless
6. Must generate NEW key pair and start fresh
```

---

## 📱 Amazon SES Configuration

### Setup for Email Services

#### 1. Verify Domain
```bash
# Add DNS records to snapitsoftware.com in IONOS
# SES will provide TXT, CNAME, and MX records
aws ses verify-domain-identity --domain snapitsoftware.com --region us-east-1
```

#### 2. Configure Sending Email
```bash
# Verify sender email
aws ses verify-email-identity --email-address noreply@snapitsoftware.com --region us-east-1

# Move out of sandbox (production)
# Submit request in AWS SES console
```

#### 3. Set Up DKIM/SPF
```
Add to IONOS DNS for snapitsoftware.com:

TXT Record:
Host: @
Value: "v=spf1 include:amazonses.com ~all"

CNAME Records (from SES verification):
Host: abc123._domainkey
Value: abc123.dkim.amazonses.com
```

---

## 🔐 User Data Storage Schema

### users Table (DynamoDB)
```javascript
{
  userId: "uuid-12345", // Primary key
  email: "user@gmail.com", // Google OAuth email
  username: "johndoe", // Permanent, cannot change
  name: "John Doe",
  picture: "https://...",

  // PGP Keys (encrypted with password)
  pgpPublicKey: "-----BEGIN PGP PUBLIC KEY BLOCK-----...",
  encryptedPrivateKey: "encrypted_blob", // Encrypted with password-derived key
  salt: "random_salt", // For password key derivation

  // Password Authentication (optional)
  passwordHash: "hashed_password", // For login verification
  backupEmail: "backup@example.com", // Optional backup email
  emailVerified: true, // Email verification status
  emailVerificationToken: null,
  emailVerificationExpiry: null,

  // Password Reset
  passwordResetToken: null,
  passwordResetExpiry: null,

  // Account Info
  createdAt: 1696003200000,
  tier: "free",
  forumId: "johndoe-forum",

  // One account per Gmail
  googleId: "google-oauth-id" // Unique constraint
}
```

---

## ⚠️ User Warnings & Education

### On Password Setup
```
┌─────────────────────────────────────────────────────────┐
│  ⚠️  IMPORTANT: Read Carefully                          │
├─────────────────────────────────────────────────────────┤
│  Your password encrypts your private PGP key.           │
│                                                         │
│  If you forget it, ALL your encrypted data is           │
│  PERMANENTLY LOST. We CANNOT recover it.                │
│                                                         │
│  This is the cost of true privacy:                      │
│  - We can't read your messages                          │
│  - Authorities can't force us to decrypt                │
│  - But you MUST remember your password                  │
│                                                         │
│  💡 Recommendations:                                    │
│  - Use a password manager                               │
│  - Write it down in a safe place                        │
│  - Use a passphrase you'll remember                     │
│  - Export your private key as backup                    │
│                                                         │
│  [ ] I understand and accept the risk                   │
│  [Create Password]  [Cancel]                            │
└─────────────────────────────────────────────────────────┘
```

### On Password Reset
```
┌─────────────────────────────────────────────────────────┐
│  🚨 DATA DESTRUCTION WARNING                            │
├─────────────────────────────────────────────────────────┤
│  Resetting your password will:                          │
│                                                         │
│  ❌ Delete ALL encrypted messages (unrecoverable)       │
│  ❌ Delete your PGP key pair                            │
│  ❌ Delete Dead Man's Switch encrypted data             │
│  ✅ Preserve your account, username, forums             │
│                                                         │
│  You will need to:                                      │
│  - Generate new PGP keys                                │
│  - Start fresh with new messages                        │
│  - Re-configure Dead Man's Switch                       │
│                                                         │
│  This CANNOT be undone!                                 │
│                                                         │
│  Type "DELETE MY DATA" to confirm:                      │
│  [__________________________]                           │
│                                                         │
│  [Cancel]  [I Understand, Reset Password]               │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Implementation Phases

### Phase 1: Current (Google OAuth Only) ✅
- ✅ Google OAuth working
- ✅ Username creation
- ✅ PGP key generation
- ✅ One account per Gmail

### Phase 2: Email Backup (Next)
- [ ] Add backup email field
- [ ] Email verification via SES
- [ ] Password creation flow
- [ ] Encrypt private key with password
- [ ] ProtonMail-style warnings

### Phase 3: Password Reset (After Phase 2)
- [ ] Forgot password flow
- [ ] Reset email via SES
- [ ] Data destruction warnings
- [ ] New key generation

### Phase 4: Local Key Export (Future)
- [ ] Export private key to file
- [ ] Import private key from file
- [ ] Backup recommendations
- [ ] Key management tools

---

## 📊 SES Subdomain Strategy

### Use ses.snapitsoftware.com for Email API

```
Current:
- mail.snapitsoftware.com → Email receiving (not yet configured)
- ses.snapitsoftware.com → Available for SES API

Recommendation:
- Use SES directly (no custom subdomain needed)
- Configure noreply@snapitsoftware.com as sender
- Add SPF/DKIM to main domain
```

---

## 🔒 Security Summary

| Feature | Status | Privacy Level |
|---------|--------|---------------|
| **Zero-Knowledge** | ✅ Implemented | Maximum |
| **Password Encryption** | 🔄 Planned | Maximum |
| **Email Verification** | 🔄 Planned | Standard |
| **Password Reset** | 🔄 Planned | Data Loss |
| **Account Recovery** | ✅ Yes | Account only |
| **Data Recovery** | ❌ Impossible | By design |

**Result**: Same privacy guarantee as ProtonMail - we literally CANNOT access your data, even if we wanted to.

---

**Status**: Architecture defined ✅
**Next Steps**: Implement email verification + password encryption
**Priority**: Medium (after Stripe LIVE mode tested)

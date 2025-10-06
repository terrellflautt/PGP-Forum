# 🔐 Authentication Enhancement Roadmap

## Current State (October 6, 2025)

### ✅ What's Working
- **Google OAuth 2.0** - Primary authentication method
- **Unique User System**:
  - `userId`: Unique identifier (currently `google_{sub}`)
  - `email`: Unique per user (EmailIndex GSI)
  - `username`: Unique public identifier (UsernameIndex GSI)
- **PGP Key Management** - 4096-bit RSA keys tied to userId
- **Cross-Device Login** - JWT tokens work from any browser
- **Session Management** - 7-day token expiration

### 📊 Current User Data Structure
```javascript
{
  userId: "google_102847562183746521983",  // Primary Key
  email: "user@gmail.com",                  // Unique (GSI)
  username: "whistleblower-reporter",       // Unique (GSI)
  name: "John Doe",                         // Display name from OAuth
  picture: "https://...",                   // Profile picture
  pgpPublicKey: "-----BEGIN PGP...",       // Public key
  pgpPrivateKeyEncrypted: "...",           // Encrypted private key
  passwordHash: null,                       // Not yet used
  backupEmail: null,                        // Not yet implemented
  emailVerified: true,                      // From Google OAuth
  createdAt: 1728234567890
}
```

---

## 🎯 Enhancement Goals

### 1. **Display @username Instead of Google Name**
**Status**: ✅ COMPLETED (October 6, 2025)

**Changes Made**:
- Updated `Header.tsx` to display `@{username}` instead of Google name
- Falls back to `name` if username not yet set

**Code**:
```tsx
<p className="text-sm font-semibold text-secondary-900">@{user?.username || user?.name}</p>
```

---

### 2. **ProtonMail & GMX Email Support**
**Status**: 📋 PLANNED

**Requirements**:
- Support email/password registration for ProtonMail users
- Support email/password registration for GMX users
- Maintain same security standards (PGP, encryption)
- Ensure unique email enforcement

**Implementation Plan**:

#### A. Add Email/Password Registration Endpoint
```javascript
// src/handlers/auth.js - New function
exports.registerWithEmail = async (event) => {
  const { email, password, username } = JSON.parse(event.body);

  // Validate email domain (allow any domain)
  // ProtonMail: @protonmail.com, @pm.me, @proton.me
  // GMX: @gmx.com, @gmx.net, @gmx.us

  // Check if email already exists
  // Hash password with crypto.pbkdf2
  // Generate verification token
  // Send verification email via SES
  // Create user with emailVerified: false
  // Return success message
};
```

#### B. Email Verification Flow
```javascript
exports.verifyEmail = async (event) => {
  const { token } = event.queryStringParameters;

  // Validate token
  // Update user: emailVerified = true
  // Generate JWT for auto-login
  // Redirect to app with token
};
```

#### C. Email/Password Login
```javascript
exports.loginWithEmail = async (event) => {
  const { email, password } = JSON.parse(event.body);

  // Look up user by email
  // Verify password hash
  // Check emailVerified = true
  // Generate JWT token
  // Return token
};
```

#### D. Required Changes
1. **Update serverless.yml**: Add new endpoints
   - `POST /auth/register` - Email registration
   - `POST /auth/login` - Email login
   - `GET /auth/verify-email?token=...` - Email verification

2. **Update LoginModal.tsx**: Add email/password form
   - Email input
   - Password input (min 12 chars, complexity requirements)
   - "Sign up with Email" button
   - "Login with Email" button

3. **Add to config.ts**:
   ```typescript
   export const ALLOWED_EMAIL_PROVIDERS = [
     // Google
     'gmail.com', 'googlemail.com',
     // ProtonMail
     'protonmail.com', 'proton.me', 'pm.me',
     // GMX
     'gmx.com', 'gmx.net', 'gmx.us', 'gmx.de', 'gmx.at', 'gmx.ch'
   ];
   ```

---

### 3. **Email-Only Login (Disconnect from OAuth)**
**Status**: 📋 PLANNED

**Requirements**:
- Allow users who signed up with Google to add a password
- Let users disconnect Google OAuth
- Maintain account access via email/password only
- Keep PGP keys and all data intact

**Implementation Plan**:

#### A. Add Password to Google OAuth Accounts
```javascript
// src/handlers/auth.js
exports.addPassword = async (event) => {
  const userId = event.requestContext.authorizer.userId;
  const { password } = JSON.parse(event.body);

  // Validate password strength
  // Hash password
  // Update user record
  // Return success
};
```

#### B. Disconnect OAuth
```javascript
exports.disconnectOAuth = async (event) => {
  const userId = event.requestContext.authorizer.userId;

  // Verify user has password set
  // Update userId from "google_XXX" to "email_XXX"
  // Remove OAuth picture URL (optional)
  // Return success
};
```

#### C. UI Changes
Add to **SettingsView.tsx**:
```tsx
<div className="bg-white rounded-xl p-6 border border-secondary-200">
  <h3 className="text-lg font-bold mb-4">Authentication Methods</h3>

  {user.userId.startsWith('google_') && (
    <div className="mb-4">
      <p className="text-sm text-secondary-600 mb-2">
        Currently signed in with Google OAuth
      </p>

      {!user.passwordHash ? (
        <>
          <input type="password" placeholder="Set password" />
          <button>Add Password</button>
        </>
      ) : (
        <button onClick={disconnectGoogle}>
          Disconnect Google (use email/password only)
        </button>
      )}
    </div>
  )}
</div>
```

---

### 4. **Unique Username + UUID System**
**Status**: ✅ ALREADY IMPLEMENTED

**Current Implementation**:
- **userId**: Unique identifier (currently `google_{sub}` or can be UUID)
- **username**: Unique public identifier for anonymous messaging
- **email**: Unique account identifier

**How It Works**:
1. User signs in with Google → gets `userId: google_{googleSub}`
2. User sets username → stored in DynamoDB with UsernameIndex GSI
3. PGP keypair is generated and tied to userId
4. Username is used for public profile: `forum.snapitsoftware.com/@username`

**Cross-Device Access**:
- User logs in from any device → receives JWT token
- Token contains userId → can decrypt PGP private key
- All messages, forums, and data accessible via userId

**Recommendation**: When adding email registration, use UUID v4:
```javascript
const { v4: uuidv4 } = require('uuid');

// For email registrations
userId: `email_${uuidv4()}`

// For Google OAuth (keep current)
userId: `google_${googleUser.sub}`
```

---

### 5. **Amazon SES Email Notifications**
**Status**: ⚠️ PARTIALLY CONFIGURED

**Current SES Setup**:
- ✅ SES permissions in IAM role
- ✅ S3 bucket for email receiving: `snapitsoftware-ses-emails`
- ✅ Email forwarder Lambda function
- ❌ Not yet sending notifications

**Required Notifications**:

#### A. New Encrypted Message Notification
```javascript
// src/handlers/messages.js - Update sendMessage function
exports.sendMessage = async (event) => {
  // ... existing message sending code ...

  // After message is saved
  const recipient = await getUser(recipientUserId);

  if (recipient.emailNotifications?.newMessages !== false) {
    await ses.sendEmail({
      Source: 'SnapIT Forums <noreply@snapitsoftware.com>',
      Destination: { ToAddresses: [recipient.email] },
      Message: {
        Subject: { Data: '🔒 New Encrypted Message' },
        Body: {
          Html: {
            Data: `
              <h2>You have a new encrypted message</h2>
              <p>Someone sent you an anonymous, PGP-encrypted message.</p>
              <p><a href="https://forum.snapitsoftware.com">View Message</a></p>
              <p style="color: #666; font-size: 12px;">
                This message is encrypted. Only you can decrypt it with your private key.
              </p>
            `
          }
        }
      }
    }).promise();
  }
};
```

#### B. Dead Man's Switch Notifications
```javascript
// src/handlers/deadman.js - New Lambda function
exports.checkDeadManSwitches = async (event) => {
  // Scheduled CloudWatch Event (daily)

  const now = Date.now();

  // Query all active Dead Man's Switches
  const switches = await dynamodb.scan({
    TableName: DEADMAN_TABLE,
    FilterExpression: 'active = :active AND nextCheckIn < :now',
    ExpressionAttributeValues: {
      ':active': true,
      ':now': now
    }
  }).promise();

  for (const dmSwitch of switches.Items) {
    // Send warning email
    const user = await getUser(dmSwitch.userId);

    await ses.sendEmail({
      Source: 'SnapIT Dead Man\'s Switch <alert@snapitsoftware.com>',
      Destination: { ToAddresses: [user.email] },
      Message: {
        Subject: { Data: '⚠️ Dead Man\'s Switch Check-In Required' },
        Body: {
          Html: {
            Data: `
              <h2>Check-In Required</h2>
              <p>Your Dead Man's Switch needs to be reset.</p>
              <p>Time remaining: ${getTimeRemaining(dmSwitch.triggerAt)}</p>
              <p><a href="https://forum.snapitsoftware.com/deadman">Check In Now</a></p>
              <p style="color: red;">
                If you don't check in by ${new Date(dmSwitch.triggerAt).toLocaleString()},
                your encrypted messages will be sent to your designated recipients.
              </p>
            `
          }
        }
      }
    }).promise();
  }
};
```

#### C. Email Preferences in Settings
Update **SettingsView.tsx**:
```tsx
<div className="bg-white rounded-xl p-6 border border-secondary-200">
  <h3 className="text-lg font-bold mb-4">Email Notifications</h3>

  <label className="flex items-center space-x-2 mb-2">
    <input
      type="checkbox"
      checked={emailPrefs.newMessages}
      onChange={() => updatePref('newMessages')}
    />
    <span>New encrypted messages</span>
  </label>

  <label className="flex items-center space-x-2 mb-2">
    <input
      type="checkbox"
      checked={emailPrefs.deadManSwitch}
      onChange={() => updatePref('deadManSwitch')}
    />
    <span>Dead Man's Switch alerts</span>
  </label>

  <label className="flex items-center space-x-2">
    <input
      type="checkbox"
      checked={emailPrefs.forumActivity}
      onChange={() => updatePref('forumActivity')}
    />
    <span>Forum mentions and replies</span>
  </label>
</div>
```

#### D. SES Configuration Steps
1. **Verify sender domain** in SES console:
   - Domain: `snapitsoftware.com`
   - Add TXT, CNAME, MX records to IONOS DNS
   - Enable DKIM signing

2. **Move out of SES Sandbox**:
   - Request production access in AWS console
   - Provide use case: "Encrypted messaging notifications"
   - Estimated volume: 10,000 emails/month

3. **Create email templates**:
   ```bash
   aws ses create-template --cli-input-json file://templates/new-message.json
   aws ses create-template --cli-input-json file://templates/deadman-alert.json
   ```

4. **Add CloudWatch Event for Dead Man's Switch**:
   ```yaml
   # serverless.yml
   checkDeadManSwitches:
     handler: src/handlers/deadman.checkSwitches
     events:
       - schedule: rate(1 hour)
   ```

---

## 🗓️ Implementation Timeline

### Phase 1: Immediate (This Week)
- ✅ Display @username in header (DONE)
- 🔄 Rebuild and deploy with username fix

### Phase 2: Email Authentication (Week 2-3)
- [ ] Add email/password registration endpoint
- [ ] Implement email verification flow
- [ ] Update LoginModal with email/password forms
- [ ] Add password strength validation
- [ ] Test with ProtonMail and GMX accounts

### Phase 3: OAuth Disconnect (Week 3-4)
- [ ] Add "Set Password" feature for Google users
- [ ] Implement OAuth disconnect functionality
- [ ] Update SettingsView UI
- [ ] Test account continuity after disconnect

### Phase 4: SES Notifications (Week 4-5)
- [ ] Verify domain in SES
- [ ] Move out of SES sandbox
- [ ] Create email templates
- [ ] Implement new message notifications
- [ ] Implement Dead Man's Switch alerts
- [ ] Add email preferences to settings
- [ ] Test notification delivery

---

## 🔒 Security Considerations

### Password Requirements
- Minimum 12 characters
- Must include: uppercase, lowercase, number, special char
- Hashed with PBKDF2 (100,000 iterations)
- Salt stored separately

### Email Verification
- Time-limited tokens (24 hours)
- One-time use tokens
- Secure random generation (crypto.randomBytes)

### PGP Key Protection
- Private keys remain encrypted with user password
- Never transmitted in plaintext
- Stored encrypted in DynamoDB

### Session Management
- JWT tokens expire after 7 days
- Refresh tokens for extended sessions
- Logout invalidates tokens (blacklist in DynamoDB)

---

## 📊 Database Schema Updates

### Users Table (Add Fields)
```javascript
{
  // ... existing fields ...
  passwordHash: "salt:hash",                   // PBKDF2 hash
  backupEmail: "backup@protonmail.com",       // Optional backup
  emailNotifications: {
    newMessages: true,
    deadManSwitch: true,
    forumActivity: false
  },
  authProviders: ["google", "email"],         // Can have multiple
  lastLogin: 1728234567890,
  loginCount: 42
}
```

### Email Verification Tokens Table (New)
```yaml
EmailVerificationTable:
  Type: AWS::DynamoDB::Table
  Properties:
    TableName: snapit-forum-email-verifications-prod
    BillingMode: PAY_PER_REQUEST
    AttributeDefinitions:
      - AttributeName: token
        AttributeType: S
    KeySchema:
      - AttributeName: token
        KeyType: HASH
    TimeToLiveSpecification:
      Enabled: true
      AttributeName: expiresAt
```

---

## 🎯 Success Metrics

### User Experience
- [ ] Users see @username instead of Google name
- [ ] ProtonMail users can register and login
- [ ] GMX users can register and login
- [ ] Google users can add password and disconnect OAuth
- [ ] Users receive email notifications within 1 minute

### Technical
- [ ] Zero authentication errors in CloudWatch
- [ ] Email delivery rate > 98%
- [ ] Password reset flow < 2 minutes
- [ ] Cross-device login works 100% of the time

### Security
- [ ] All passwords hashed with PBKDF2
- [ ] PGP private keys remain encrypted
- [ ] Email verification required before messaging
- [ ] No plaintext credentials in logs

---

**Last Updated**: October 6, 2025
**Status**: Phase 1 in progress
**Next Action**: Deploy @username display change

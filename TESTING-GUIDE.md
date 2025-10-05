# 🧪 SnapIT Forum - Testing Guide

**Last Updated**: October 5, 2025

---

## 🎯 Testing Priorities

### Critical (Must Work for Launch)
1. ✅ **User Sign Up** - Google OAuth → Account creation
2. ✅ **Forum Creation** - Free tier auto-granted (1,500 users)
3. ✅ **Basic Messenger** - Send/receive encrypted messages
4. ⚠️ **Stripe Checkout** - Upgrade to Pro/Business/Enterprise (TEST MODE)

### Important (Nice to Have)
5. ✅ **Forum Posts** - Create threads, reply, upvote
6. ✅ **User Profiles** - Username setup, public profiles
7. 🔄 **PGP Auto-generation** - Keys generated on first message
8. 🔄 **Real-time Updates** - WebSocket for live messages

### Future (Post-Launch)
9. 📋 **Anonymous Inbox** - Receive anonymous messages
10. 📋 **Dead Man's Switch** - Auto-release functionality
11. 📋 **WebRTC Relay** - Anonymous peer-to-peer routing
12. 📋 **File Uploads** - Encrypted file sharing

---

## 🔐 Test Account Setup

### 1. Sign Up with Google OAuth

**URL**: https://forum.snapitsoftware.com

1. Click **"Start Your Free Forum"** or **"Sign In"**
2. Redirects to: `https://auth.snapitsoftware.com/auth/google`
3. Choose Google account
4. OAuth callback → JWT token in URL
5. Redirected back to app with `?token=...`

**Expected Result**:
- ✅ User account created in DynamoDB `users` table
- ✅ JWT token saved to localStorage
- ✅ User sees username setup screen (if first login)

**Verify**:
```bash
# Check DynamoDB for user
aws dynamodb scan --table-name snapit-forum-api-users-prod \
  --filter-expression "email = :email" \
  --expression-attribute-values '{":email":{"S":"YOUR_EMAIL@gmail.com"}}' \
  --query 'Items[0]'
```

---

### 2. Username Setup

**Screen**: Shown after first login

1. Enter unique username (e.g., `johndoe123`)
2. Click "Check Availability"
3. If available, click "Save"

**Expected Result**:
- ✅ Username saved to DynamoDB
- ✅ Redirected to main app

**Verify**:
```bash
# Check username
aws dynamodb get-item --table-name snapit-forum-api-users-prod \
  --key '{"userId":{"S":"YOUR_USER_ID"}}'
```

---

### 3. Forum Creation (Free Tier)

**Flow**: Auto-created on signup OR manual creation

#### Option A: Auto-Created (Default)
- On first login, user's forum is auto-created
- Forum ID = username
- Tier = `free` (1,500 users max)

#### Option B: Manual Creation
1. Click **"Create Forum"** button
2. Enter forum name (e.g., "My Community")
3. Choose subdomain (e.g., `johndoe-forum`)
4. Click "Create"

**Expected Result**:
- ✅ Forum created in DynamoDB `forums` table
- ✅ User added to `forum-members` table as admin
- ✅ Default categories created

**Verify**:
```bash
# List all forums
aws dynamodb scan --table-name snapit-forum-api-forums-prod --query 'Items'

# Check forum membership
aws dynamodb query --table-name snapit-forum-api-forum-members-prod \
  --key-condition-expression "forumId = :fid" \
  --expression-attribute-values '{":fid":{"S":"YOUR_FORUM_ID"}}'
```

---

### 4. Forum Features Test

#### Create Thread
1. Navigate to **Forums** tab
2. Select a category (e.g., "General")
3. Click **"New Thread"**
4. Enter title and content
5. Click "Post"

**Expected Result**:
- ✅ Thread created in `threads` table
- ✅ Appears in category thread list

#### Reply to Thread
1. Click on a thread
2. Enter reply content
3. Click "Post Reply"

**Expected Result**:
- ✅ Post created in `posts` table
- ✅ Thread's `lastPostAt` updated

#### Upvote Post
1. Click upvote arrow on any post
2. Vote count increases

**Expected Result**:
- ✅ Vote recorded in `votes` table
- ✅ Post `voteScore` updated

**API Test**:
```bash
# Create thread
curl -X POST https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/forums/FORUM_ID/categories/CATEGORY_ID/threads \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Thread","content":"This is a test post"}'

# List threads
curl https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/forums/FORUM_ID/categories/CATEGORY_ID/threads
```

---

### 5. Messenger Test (PGP Encrypted)

#### First Message Flow
1. Click **"Messenger"** in sidebar
2. Click **"New Conversation"**
3. Search for user by username
4. Type message: "Hello, this is a test!"
5. Click "Send"

**Expected Result**:
- ✅ PGP keys auto-generated (if not exists)
- ✅ Message encrypted with recipient's public key
- ✅ Encrypted ciphertext stored in `messages` table
- ✅ Message appears in conversation

**Behind the Scenes**:
```javascript
// Frontend automatically:
1. Checks if user has PGP keys (localStorage)
2. If not, generates 4096-bit RSA key pair
3. Fetches recipient's public key from API
4. Encrypts message with openpgp.js
5. Sends encrypted ciphertext to API
6. Server stores ciphertext (can't decrypt!)
```

#### Receive Message
1. Recipient opens messenger
2. Sees new message indicator
3. Clicks conversation
4. Message auto-decrypted with private key

**Expected Result**:
- ✅ Message decrypted client-side
- ✅ Plaintext shown in chat interface

**API Test**:
```bash
# Send message (encrypted content)
curl -X POST https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "toUserId":"RECIPIENT_USER_ID",
    "encryptedContent":"-----BEGIN PGP MESSAGE-----..."
  }'

# List messages
curl "https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/messages?otherUserId=OTHER_USER_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Verify Encryption
1. Open DynamoDB console
2. View `messages` table
3. Check `encryptedContent` field

**Expected**:
- ❌ Should NOT be readable plaintext
- ✅ Should be PGP armored ciphertext:
```
-----BEGIN PGP MESSAGE-----
Version: OpenPGP.js v5.11.0
...encrypted gibberish...
-----END PGP MESSAGE-----
```

---

### 6. Stripe Checkout Test (TEST MODE)

⚠️ **Important**: Currently in TEST mode. Use Stripe test card numbers only.

#### Upgrade to Pro ($29/month)
1. Click **"Upgrade"** button in sidebar
2. Select **Pro** tier
3. Redirected to Stripe Checkout
4. Use test card: `4242 4242 4242 4242`
5. Enter any future expiry date (e.g., 12/34)
6. Enter any CVC (e.g., 123)
7. Click "Subscribe"

**Expected Result**:
- ✅ Stripe subscription created
- ✅ Webhook triggers
- ✅ User's forum tier updated to `pro`
- ✅ `maxUsers` increased to 10,000

**Verify**:
```bash
# Check forum tier
aws dynamodb get-item --table-name snapit-forum-api-forums-prod \
  --key '{"forumId":{"S":"YOUR_FORUM_ID"}}' \
  --query 'Item.tier.S'

# Should return: "pro"
```

#### Test Stripe Webhooks
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local dev
stripe listen --forward-to https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/webhooks/stripe

# Trigger test event
stripe trigger customer.subscription.created
```

**Webhook Events to Test**:
- `customer.subscription.created` → Upgrade forum
- `customer.subscription.updated` → Change tier
- `customer.subscription.deleted` → Downgrade to free
- `invoice.payment_succeeded` → Confirm payment
- `invoice.payment_failed` → Handle failed payment

---

## 🐛 Known Issues & Workarounds

### Issue 1: PGP Keys Not Auto-Generated
**Symptom**: First message fails with "No PGP keys found"

**Workaround**:
```javascript
// Manually trigger key generation
import { pgp } from './utils/pgp';
await pgp.generateKeyPair('Your Name', 'email@example.com', 'strong-passphrase');
```

**Fix Required**: Add auto-generation on first login

---

### Issue 2: Messages Not Updating in Real-Time
**Symptom**: Must refresh page to see new messages

**Workaround**: Click "Refresh" button or press F5

**Fix Required**: Implement WebSocket updates

---

### Issue 3: Search Bar Not Functional
**Symptom**: Search bar in header does nothing

**Workaround**: Navigate manually via sidebar

**Fix Required**: Implement search API and UI

---

## 📊 Test Data Setup

### Create Test Users
```bash
# User 1: alice@example.com
# User 2: bob@example.com
# User 3: charlie@example.com
```

### Create Test Forums
```bash
# Forum 1: "Tech Community" (alice's forum)
# Forum 2: "Gaming Hub" (bob's forum)
# Forum 3: "News & Politics" (charlie's forum)
```

### Seed Test Messages
```bash
# Alice → Bob: "Hey, want to collaborate?"
# Bob → Alice: "Sure! Let's discuss on encrypted channel"
# Alice → Charlie: "Check out my new forum"
```

---

## 🔒 Security Validation

### ✅ Zero-Knowledge Test
1. Send encrypted message
2. Open AWS Console → DynamoDB → `messages` table
3. View message item
4. **Verify**: `encryptedContent` is NOT readable plaintext

### ✅ JWT Token Validation
1. Copy JWT token from localStorage
2. Paste into https://jwt.io
3. **Verify**:
   - Header: `alg: HS256`
   - Payload contains: `userId`, `email`, `exp`
   - Signature validates

### ✅ Google OAuth Flow
1. Sign out completely
2. Click "Sign In"
3. **Verify**:
   - Redirects to Google OAuth consent screen
   - After approval, redirects back with token
   - No password required

---

## 🚀 Performance Tests

### API Response Times (Target: <500ms)
```bash
# Test forum list
time curl https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/forums

# Test message send
time curl -X POST https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/messages \
  -H "Authorization: Bearer TOKEN" \
  -d '{"toUserId":"USER_ID","encryptedContent":"TEST"}'
```

### CloudFront Cache Hit Rate
```bash
# Check CloudFront metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name CacheHitRate \
  --dimensions Name=DistributionId,Value=E1X8SJIRPSICZ4 \
  --start-time 2025-10-05T00:00:00Z \
  --end-time 2025-10-05T23:59:59Z \
  --period 3600 \
  --statistics Average
```

### DynamoDB Throttling
```bash
# Check for throttled requests
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name UserErrors \
  --dimensions Name=TableName,Value=snapit-forum-api-messages-prod \
  --start-time 2025-10-05T00:00:00Z \
  --end-time 2025-10-05T23:59:59Z \
  --period 3600 \
  --statistics Sum
```

---

## ✅ Pre-Launch Checklist

### Before Going Live
- [ ] Switch Stripe to LIVE mode
- [ ] Create Stripe products (Pro, Business, Enterprise) in live mode
- [ ] Update SSM parameters with live Stripe keys
- [ ] Test full payment flow with real card
- [ ] Set up Stripe webhook endpoint
- [ ] Configure CloudWatch alarms for errors
- [ ] Enable DynamoDB point-in-time recovery
- [ ] Test disaster recovery (restore from backup)
- [ ] Verify SSL certificate on forum.snapitsoftware.com
- [ ] Test mobile responsiveness
- [ ] Run security audit (OWASP top 10)
- [ ] Load test with 100 concurrent users
- [ ] Create monitoring dashboard (CloudWatch/Grafana)
- [ ] Set up error tracking (Sentry/Rollbar)
- [ ] Configure email notifications (SES)
- [ ] Create admin panel for moderation
- [ ] Document API (Swagger/OpenAPI)
- [ ] Write user guide / FAQ
- [ ] Create demo video
- [ ] Announce on social media / Product Hunt

---

## 🎉 Success Criteria

A successful test means:

1. ✅ User can sign up via Google OAuth
2. ✅ User can create forum (free tier)
3. ✅ User can post threads and replies
4. ✅ User can send encrypted messages
5. ✅ Messages are unreadable in database
6. ✅ User can upgrade to Pro tier (test mode)
7. ✅ Stripe webhook updates forum tier
8. ✅ No errors in CloudWatch logs
9. ✅ API response times < 500ms
10. ✅ SSL/HTTPS works correctly

---

**Next Step**: Run through all tests above and document any failures.

**Report Issues**: https://github.com/terrellflautt/PGP-Forum/issues

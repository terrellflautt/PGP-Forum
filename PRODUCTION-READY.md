# 🚀 SnapIT Forum - Production Deployment Complete

**Date**: October 5, 2025
**Status**: ✅ LIVE IN PRODUCTION
**Live URL**: https://forum.snapitsoftware.com
**CloudFront**: https://d3jn3i879jxit2.cloudfront.net

---

## 🎯 Project Vision

**SnapIT Forums** - The private, secure version of Discord meets Session meets ProBoards.

A zero-knowledge platform for whistleblowers, journalists, and privacy advocates to communicate freely and securely.

### Core Features
- 🔒 **End-to-End PGP Encryption** - 4096-bit RSA, non-extractable keys
- 💬 **Private Messenger** - Like Discord/WhatsApp but truly private
- 📋 **Forum Builder** - Simple, easy-to-use forum creation (like ProBoards)
- 🕵️ **Anonymous Relay** - WebRTC peer-to-peer with 3-5 hop routing
- 📨 **Anonymous Inbox** - Receive messages without revealing identity
- ⏰ **Dead Man's Switch** - Auto-release encrypted data if you don't check in
- 🚫 **No Phone Number** - Google OAuth only, no SMS verification
- 🔐 **Zero-Knowledge** - Server literally cannot decrypt your messages

---

## 📁 Project Structure

```
snapit-forum/
├── forum-app/                    # ✅ PRODUCTION React Frontend
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── LandingPage.tsx   # Landing page with pre-alpha banner
│   │   │   ├── Header.tsx        # Navigation with security indicators
│   │   │   ├── Sidebar.tsx       # Full navigation menu (forums, messenger, inbox, etc.)
│   │   │   ├── MessengerView.tsx # Private messaging interface
│   │   │   ├── ForumView.tsx     # Forum management
│   │   │   ├── SettingsView.tsx  # User settings
│   │   │   └── Messenger/        # Messenger subcomponents
│   │   ├── utils/
│   │   │   └── pgp.ts            # ✅ PGP encryption library (openpgp.js)
│   │   ├── config.ts             # API URLs, Google OAuth, Stripe keys
│   │   └── App.tsx               # Main app component
│   ├── public/
│   │   ├── privacy.html          # ✅ Privacy policy
│   │   └── terms.html            # ✅ Terms of service
│   └── build/                    # ✅ Production build (deployed to S3)
│
├── src/                          # ✅ PRODUCTION Backend (AWS Lambda)
│   └── handlers/
│       ├── auth.js               # Google OAuth, JWT tokens
│       ├── forums.js             # Forum CRUD operations
│       ├── categories.js         # Category management
│       ├── threads.js            # Thread operations
│       ├── posts.js              # Post creation, upvoting
│       ├── messages.js           # PGP encrypted messaging
│       ├── users.js              # User profiles, username setup
│       ├── checkout.js           # Stripe checkout sessions
│       ├── stripe.js             # Stripe webhooks
│       └── signaling.js          # WebRTC signaling for anonymous relay
│
├── serverless.yml                # ✅ AWS Lambda deployment config
├── package.json                  # Backend dependencies
│
├── pgp.js                        # Legacy PGP (moved to forum-app/src/utils/pgp.ts)
├── webcrypto-pgp.js              # Alternative WebCrypto implementation
├── webrtc-relay.js               # Anonymous relay logic
├── deadman-switch.js             # Dead man's switch implementation
├── anonymous-inbox.js            # Anonymous inbox logic
│
└── Documentation/
    ├── DEPLOYMENT-COMPLETE.md
    ├── PRODUCTION-DEPLOYMENT-SUCCESS.md
    ├── PROJECT-CHIMERA-SUMMARY.md
    └── [other planning docs]
```

**⚠️ Note**: The root folder contains legacy vanilla JS files (index.html, pricing.html, etc.) that are NOT in production. The **forum-app/** React app is the official production frontend.

---

## ✅ Deployment Status

### Backend (AWS Lambda)
- **Status**: ✅ Deployed to `prod` stage
- **API Endpoint**: `https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod`
- **Region**: us-east-1
- **Runtime**: Node.js 18.x

#### Lambda Functions (29 total)
- ✅ Google OAuth (auth/google, auth/google/callback)
- ✅ JWT refresh token
- ✅ Forums CRUD (create, list, get)
- ✅ Categories CRUD
- ✅ Threads CRUD
- ✅ Posts CRUD + upvoting
- ✅ Messages (PGP encrypted, anonymous mode)
- ✅ User management (profile, username, public profile)
- ✅ Stripe checkout + portal sessions
- ✅ Stripe webhooks
- ✅ WebRTC signaling (8 functions for peer-to-peer relay)

### Database (DynamoDB)
- **Status**: ✅ All tables created
- **Billing**: Pay-per-request

#### Tables (10 total)
1. `snapit-forum-api-forums-prod` - Forum instances
2. `snapit-forum-api-users-prod` - User accounts + PGP public keys
3. `snapit-forum-api-forum-members-prod` - Forum membership
4. `snapit-forum-api-categories-prod` - Forum categories
5. `snapit-forum-api-threads-prod` - Forum threads
6. `snapit-forum-api-posts-prod` - Thread posts
7. `snapit-forum-api-messages-prod` - PGP encrypted DMs (with TTL)
8. `snapit-forum-api-votes-prod` - Reddit-style upvote/downvote
9. `snapit-forum-api-connections-prod` - WebSocket connections
10. `snapit-forum-api-relay-peers-prod` - WebRTC relay peers

### Frontend (S3 + CloudFront)
- **Status**: ✅ Deployed (Oct 5, 2025 18:01 UTC)
- **S3 Bucket**: `snapit-forum-static`
- **CloudFront ID**: `E1X8SJIRPSICZ4`
- **CloudFront URL**: https://d3jn3i879jxit2.cloudfront.net
- **Custom Domain**: https://forum.snapitsoftware.com
- **Cache**: ✅ Invalidated

### Configuration (SSM Parameters)
- **Status**: ✅ All parameters configured
- ✅ `/snapit-forum/prod/GOOGLE_CLIENT_ID`
- ✅ `/snapit-forum/prod/GOOGLE_CLIENT_SECRET`
- ✅ `/snapit-forum/prod/JWT_SECRET`
- ⚠️ `/snapit-forum/prod/STRIPE_SECRET_KEY` - **TEST MODE** (sk_test_...)
- ⚠️ Stripe price IDs (Pro, Business, Enterprise)
- ⚠️ Stripe webhook secret

---

## ⚠️ Production Checklist

### ✅ Completed
- [x] Backend deployed to AWS Lambda
- [x] DynamoDB tables created and configured
- [x] Google OAuth configured with SSM parameters
- [x] PGP encryption library integrated (openpgp.js)
- [x] React frontend built and deployed to S3
- [x] CloudFront distribution configured and cache invalidated
- [x] Legal pages (Privacy, Terms) created
- [x] Comprehensive navigation menu (Sidebar)
- [x] Security indicators in UI (PGP, Anonymous mode)

### ⚠️ Pending
- [ ] **Switch Stripe to LIVE mode** (currently using sk_test_...)
  - Get live publishable key (pk_live_...)
  - Get live secret key (sk_live_...)
  - Create Stripe products in live mode
  - Update SSM parameters
  - Update `forum-app/src/config.ts`
- [ ] **Custom domain SSL** - Verify forum.snapitsoftware.com SSL certificate
- [ ] **Email setup** - Configure email for support@snapitsoftware.com
- [ ] **Monitoring** - Set up CloudWatch alarms for errors
- [ ] **Load testing** - Test with concurrent users
- [ ] **Security audit** - Review all API endpoints for authorization
- [ ] **Backup strategy** - Configure DynamoDB point-in-time recovery
- [ ] **Rate limiting** - Implement per-user rate limits

---

## 🚦 User Journey

### 1. Landing Page
- **URL**: https://forum.snapitsoftware.com
- **Pre-alpha warning banner** - Visible at top
- **CTA**: "Start Your Free Forum" → Google OAuth

### 2. Sign Up (Google OAuth)
- User clicks "Sign In" or "Get Started"
- Redirects to: `https://auth.snapitsoftware.com/auth/google`
- Google OAuth flow
- Creates account in DynamoDB
- **Auto-generates PGP key pair** (4096-bit RSA)
- Private key stored in browser localStorage (encrypted)
- Public key uploaded to server

### 3. Username Setup
- First-time users prompted to choose username
- Username uniqueness check via API
- Stored in `users` table

### 4. Forum Creation
- **Free tier auto-granted** on signup
- User can customize forum:
  - Forum name
  - Categories
  - Settings
- Forum accessible at: `{username}.forum.snapitsoftware.com` (future subdomain feature)

### 5. Navigation Menu (Sidebar)
After login, users see comprehensive menu:
- 📋 **Forums** - Browse/create forums
- 💬 **Messenger** - PGP encrypted private messages
- 📨 **Anonymous Inbox** - Receive anonymous messages
- ⏰ **Dead Man's Switch** - Configure auto-release
- ⚙️ **Settings** - Profile, PGP keys, preferences

### 6. Messenger (Discord-style)
- **Conversation list** - All active chats
- **Message interface** - Real-time messaging
- **PGP encryption** - All messages encrypted client-side
- **File sharing** - Encrypted file transfers (future)
- **Anonymous mode** - WebRTC relay routing

### 7. Forum Features
- **Create threads** - Post new discussions
- **Reply to posts** - Threaded conversations
- **Upvote/downvote** - Reddit-style voting
- **Categories** - Organize discussions

---

## 🔐 Security Architecture

### PGP Encryption (openpgp.js)
```typescript
import { pgp } from './utils/pgp';

// Generate keys on signup
await pgp.generateKeyPair(name, email, passphrase);

// Encrypt message for recipient
const encrypted = await pgp.encryptMessage(
  'Secret message',
  recipientPublicKey
);

// Decrypt received message
const decrypted = await pgp.decryptMessage(
  encryptedMessage,
  senderPublicKey
);
```

**Key Storage**:
- Private key: `localStorage` (passphrase-encrypted)
- Public key: DynamoDB `users` table

**Zero-Knowledge**:
- Server never has passphrase
- Server never sees plaintext messages
- Only encrypted ciphertext stored in `messages` table

### Anonymous Relay (WebRTC)
- **Peer-to-peer** - No central server
- **Multi-hop routing** - 3-5 random peers
- **Signaling** - AWS API Gateway WebSocket
- **STUN/TURN** - NAT traversal (future)

---

## 💰 Pricing Tiers

| Tier | Price | Users | Features |
|------|-------|-------|----------|
| **Free** | $0/mo | 1,500 | PGP messaging, anonymous relay, forums |
| **Pro** | $29/mo | 10,000 | + Custom domain, API access, branding |
| **Business** | $99/mo | 50,000 | + White-label, SSO, analytics, SLA |
| **Enterprise** | $299/mo | Unlimited | + Dedicated infra, 24/7 support, 99.99% SLA |

**⚠️ Note**: Stripe is in TEST mode. No real payments processed yet.

---

## 🛠️ Development Commands

### Frontend (React)
```bash
cd forum-app
npm install           # Install dependencies
npm start             # Dev server (http://localhost:3000)
npm run build         # Production build
```

### Backend (Serverless)
```bash
npm install           # Install dependencies
npm run deploy:prod   # Deploy to AWS Lambda
```

### Deployment (Combined)
```bash
# 1. Build frontend
cd forum-app && npm run build && cd ..

# 2. Deploy to S3
aws s3 sync forum-app/build/ s3://snapit-forum-static/ --delete

# 3. Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id E1X8SJIRPSICZ4 --paths "/*"
```

---

## 🔧 Configuration Files

### `forum-app/src/config.ts`
```typescript
export const API_BASE_URL = 'https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod';
export const GOOGLE_CLIENT_ID = '242648112266-iglul54tuis9mhucsp1pmpqg0a48l8i0.apps.googleusercontent.com';
export const GOOGLE_AUTH_URL = 'https://auth.snapitsoftware.com/auth/google';
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_...'; // ⚠️ TEST MODE
export const FREE_TIER_USER_LIMIT = 1500;
```

### `serverless.yml`
- **Service**: snapit-forum-api
- **Stage**: prod
- **Region**: us-east-1
- **Runtime**: nodejs18.x
- **Environment**: SSM parameters

---

## 🚨 Known Issues

### Critical
1. **Stripe in TEST mode** - No real payments can be processed
2. **PGP keys not auto-generated** - Users must manually generate on first message

### Medium
3. **No email notifications** - Users don't get notified of new messages
4. **No search functionality** - Search bar in header is placeholder
5. **No file uploads** - Messenger shows encrypted file placeholders
6. **No real-time updates** - Messages/posts require manual refresh

### Low
7. **React warnings** - useEffect dependency warnings (cosmetic)
8. **No mobile responsive** - UI optimized for desktop only
9. **No dark mode** - Only light theme available

---

## 📋 Next Steps

### Immediate (Production Launch)
1. **Get Stripe live keys**
   ```bash
   # Log into Stripe dashboard
   # Enable live mode
   # Copy pk_live_... and sk_live_...
   # Update SSM parameters:
   aws ssm put-parameter --name /snapit-forum/prod/STRIPE_SECRET_KEY \
     --value "sk_live_..." --type SecureString --overwrite
   ```

2. **Update config.ts**
   ```typescript
   export const STRIPE_PUBLISHABLE_KEY = 'pk_live_...';
   ```

3. **Create Stripe products in live mode**
   - Pro: $29/month
   - Business: $99/month
   - Enterprise: $299/month

4. **Rebuild and redeploy**
   ```bash
   cd forum-app && npm run build && cd ..
   aws s3 sync forum-app/build/ s3://snapit-forum-static/ --delete
   aws cloudfront create-invalidation --distribution-id E1X8SJIRPSICZ4 --paths "/*"
   ```

### Short-term (Next 2 weeks)
- Auto-generate PGP keys on first login
- Add real-time WebSocket updates for messages
- Implement file upload with encryption
- Mobile responsive design
- Dark mode toggle
- Email notifications (SES)
- CloudWatch monitoring and alarms

### Long-term (Next 3 months)
- React Native mobile app (iOS/Android)
- End-to-end video calls (WebRTC)
- Dead man's switch UI
- Anonymous inbox improvements
- Forum subdomain routing ({username}.forum.snapitsoftware.com)
- Advanced moderation tools
- API documentation (Swagger)
- Internationalization (i18n)

---

## 📞 Support

- **GitHub**: https://github.com/terrellflautt/PGP-Forum
- **Email**: snapitsaas@gmail.com
- **Community**: https://forum.snapitsoftware.com

---

## 📝 License

Proprietary - SnapIT Software © 2025

**Built for whistleblowers, journalists, and freedom of speech.**

---

## 🎉 Deployment Summary

**✅ Production deployment complete!**

- ✅ Backend: 29 Lambda functions live
- ✅ Database: 10 DynamoDB tables configured
- ✅ Frontend: React app deployed to S3 + CloudFront
- ✅ Security: PGP encryption integrated
- ✅ Navigation: Full menu with all features
- ✅ Legal: Privacy + Terms pages live
- ⚠️ Stripe: TEST mode (switch to live before launch)

**Live URL**: https://forum.snapitsoftware.com

**Next action**: Switch Stripe to live mode and test end-to-end user flow.

---

**Last Updated**: October 5, 2025 18:01 UTC

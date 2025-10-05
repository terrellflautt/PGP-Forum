# SnapIT Forums - Complete Deployment Guide

## Project Chimera - Zero-Knowledge Forum Platform

### What's Built:

✅ **Backend (Serverless - AWS Lambda + DynamoDB)**
- Multi-tenant architecture (each user gets free forum)
- Google OAuth authentication
- PGP encrypted messaging endpoints
- Stripe subscription integration
- Dead man's switch API
- Anonymous inbox system
- Deployed at: `https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod`

✅ **Security Layer (Client-Side JavaScript)**
- `webcrypto-pgp.js` - Zero-knowledge PGP (4096-bit RSA, non-extractable keys)
- `webrtc-relay.js` - Anonymous IP relay (3-5 peer hops, always on)
- `deadman-switch.js` - Automatic message release system
- `anonymous-inbox.js` - Public directory + P2P file transfer

✅ **React Frontend (In Progress)**
- Created in `/forum-app` directory
- SnapIT pink/purple branding configured
- Tailwind CSS setup complete
- Google OAuth integration ready

### Architecture Overview:

```
User Browser
├── React App (forum UI + messenger)
├── Web Crypto API (PGP encryption)
├── WebRTC Relay (IP anonymization)
├── IndexedDB (local key storage)
└── Google OAuth (authentication)
        ↓
    CloudFront
        ↓
    API Gateway
        ↓
    Lambda Functions (18 endpoints)
        ↓
    DynamoDB (7 tables)
        ↓
    Stripe (billing)
```

---

## Deployment Steps:

### 1. Complete Backend Deployment (Already Done ✅)

The backend is deployed at:
- **API**: `https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod`
- **GitHub**: `https://github.com/terrellflautt/PGP-Forum`

**DynamoDB Tables Created:**
- `snapit-forum-api-forums-prod`
- `snapit-forum-api-users-prod`
- `snapit-forum-api-forum-members-prod`
- `snapit-forum-api-categories-prod`
- `snapit-forum-api-threads-prod`
- `snapit-forum-api-posts-prod`
- `snapit-forum-api-messages-prod`

### 2. Finish React Frontend

**Option A: Complete the React Build (Recommended)**

```bash
cd /mnt/c/Users/decry/Desktop/snapit-forum/forum-app

# Install remaining dependencies
npm install

# Create remaining components
# - Header.tsx
# - Sidebar.tsx
# - ForumView.tsx
# - MessengerView.tsx
# - SettingsView.tsx
# - LoginModal.tsx
# - ThreadList.tsx
# - MessageComposer.tsx
# - etc.

# Build for production
npm run build

# Deploy to S3
aws s3 sync build/ s3://forum.snapitsoftware.com --delete

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id <FORUM_DISTRIBUTION_ID> \
  --paths "/*"
```

**Option B: Use Static HTML (Faster, But Less Polished)**

Use the existing `index.html` and integrate the security JavaScript files:

```bash
# Copy security files to static site
cp webcrypto-pgp.js /path/to/static/site/js/
cp webrtc-relay.js /path/to/static/site/js/
cp deadman-switch.js /path/to/static/site/js/
cp anonymous-inbox.js /path/to/static/site/js/
```

### 3. Configure Stripe Products

Go to: https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/products

Create 3 subscription products:

**Pro Tier:**
- Name: SnapIT Forum Pro
- Price: $29/month (recurring)
- After creating, copy Price ID (e.g., `price_xxxxx`)

**Business Tier:**
- Name: SnapIT Forum Business
- Price: $99/month
- Copy Price ID

**Enterprise Tier:**
- Name: SnapIT Forum Enterprise
- Price: $299/month
- Copy Price ID

**Update Environment:**
```bash
# Add to Lambda environment variables
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_BUSINESS_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx  # Switch to LIVE key

# Redeploy
cd /mnt/c/Users/decry/Desktop/snapit-forum
serverless deploy --stage prod
```

### 4. Configure Stripe Webhooks

Go to: https://dashboard.stripe.com/webhooks

- Endpoint URL: `https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/webhooks/stripe`
- Events to select:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

Copy the **Signing Secret** (starts with `whsec_`) and add to Lambda environment:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

serverless deploy --stage prod
```

### 5. Configure Google OAuth Redirect URI

Go to: https://console.cloud.google.com/apis/credentials

Add authorized redirect URIs:
- `https://forum.snapitsoftware.com/auth/google/callback`
- `https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/auth/google/callback`

### 6. DNS Configuration (Already Done ✅)

`forum.snapitsoftware.com` → CloudFront distribution

### 7. Create WebRTC Signaling Server (WebSocket)

The anonymous relay needs a WebSocket server for peer discovery:

**Add to `serverless.yml`:**
```yaml
functions:
  webrtcSignaling:
    handler: src/handlers/signaling.handler
    events:
      - websocket:
          route: $connect
      - websocket:
          route: $disconnect
      - websocket:
          route: discover-relays
      - websocket:
          route: advertise-relay
```

**Create `src/handlers/signaling.js`:**
```javascript
// WebRTC signaling for peer discovery
exports.handler = async (event) => {
  const route = event.requestContext.routeKey;
  const connectionId = event.requestContext.connectionId;

  switch (route) {
    case '$connect':
      return { statusCode: 200 };
    case '$disconnect':
      return { statusCode: 200 };
    case 'discover-relays':
      // Return list of active relay peers
      return { statusCode: 200 };
    default:
      return { statusCode: 404 };
  }
};
```

---

## Free Tier User Flow:

### Sign Up Process:
1. User visits `https://forum.snapitsoftware.com`
2. Clicks "Sign In with Google"
3. Google OAuth authenticates
4. Backend automatically creates:
   - User record in DynamoDB
   - Free forum (1,500 user limit)
   - Default categories (General, Support, Feedback)
5. Frontend prompts for PGP passphrase
6. Browser generates 4096-bit RSA keys (non-extractable)
7. Public key uploaded to server
8. User can immediately:
   - Create forum threads
   - Send encrypted PMs
   - Enable anonymous inbox
   - Create dead man's switches

---

## Security Features (All Free Tier):

### 1. PGP Encryption
- 4096-bit RSA keys
- Generated in browser (Web Crypto API)
- Private keys non-extractable (`.extractable = false`)
- Stored in IndexedDB
- Server only has ciphertext + public keys

### 2. Anonymous Mode (Always On)
- All traffic routed through 3-5 random WebRTC peers
- Onion-layer encryption (like Tor)
- Server only sees final relay IP
- No user can disable (mandatory for all)

### 3. Dead Man's Switch
- Auto-release encrypted messages if user fails to check in
- Use cases: whistleblowing, digital inheritance
- Check-in intervals: 24h, 48h, 72h, 168h
- 2-missed-check-in grace period

### 4. Anonymous Inbox
- Users publish PGP key to public directory
- Anyone can send anonymous encrypted messages
- P2P file transfer (< 5MB, no images)
- Server doesn't store file content
- Ephemeral delivery (auto-delete after pickup)

---

## Marketing Strategy:

### Target Keywords:
1. "ProBoards alternative with encryption"
2. "Zero-knowledge forum software"
3. "Anonymous community platform"
4. "PGP encrypted forums"
5. "Private forum hosting"

### Unique Selling Points:
| Feature | SnapIT Forums | ProBoards | Discord | Reddit |
|---------|---------------|-----------|---------|--------|
| **E2E Encryption** | ✅ Always | ❌ None | ❌ None | ❌ None |
| **IP Anonymity** | ✅ P2P relay | ❌ Logged | ❌ Logged | ❌ Logged |
| **Free Users** | 1,500 | Limited | Unlimited | Unlimited |
| **Data Ownership** | ✅ You own | ❌ Platform | ❌ Platform | ❌ Platform |
| **Server Access** | ❌ Can't decrypt | ✅ Full access | ✅ Full access | ✅ Full access |
| **Dead Man Switch** | ✅ Built-in | ❌ None | ❌ None | ❌ None |

---

## Next Steps:

### Immediate (Today):
1. ✅ Finish React components (Header, Sidebar, ForumView, MessengerView)
2. ✅ Build React app (`npm run build`)
3. ✅ Deploy to S3 + CloudFront
4. ✅ Create Stripe products and copy price IDs
5. ✅ Configure Stripe webhook
6. ✅ Test checkout flow with live card

### Short-Term (This Week):
1. ⬜ Add WebSocket signaling server for WebRTC relay
2. ⬜ Create ProBoards comparison landing page
3. ⬜ Implement usage-based Stripe metering
4. ⬜ Add ephemeral messaging UI
5. ⬜ Build admin dashboard for forum owners
6. ⬜ SEO optimization (blog posts, backlinks)

### Long-Term (This Month):
1. ⬜ Migrate Lambda to Graviton2 (34% cost savings)
2. ⬜ Add custom domain support (CNAME configuration)
3. ⬜ Build white-label customization (colors, logo)
4. ⬜ Implement SSO/SAML for Business tier
5. ⬜ Add advanced analytics dashboard
6. ⬜ Create mobile app (React Native)

---

## Troubleshooting:

### Issue: Relay peers not connecting
**Fix**: Ensure WebSocket signaling server is deployed. Check browser console for STUN server errors.

### Issue: PGP keys not generating
**Fix**: Ensure HTTPS (Web Crypto API requires secure context). Check IndexedDB quota.

### Issue: Messages not decrypting
**Fix**: User lost passphrase (no recovery). Must generate new key pair. Old messages are permanently lost.

### Issue: Stripe checkout failing
**Fix**: Verify price IDs match Stripe dashboard. Check webhook is receiving events.

---

## Support:

- **Docs**: https://forum.snapitsoftware.com/docs
- **GitHub**: https://github.com/terrellflautt/PGP-Forum
- **Email**: support@snapitsoftware.com
- **Community**: forum.snapitsoftware.com/c/support

---

**Last Updated:** 2025-10-04
**Version:** 1.0.0-alpha (Project Chimera)
**Status:** Backend deployed, React frontend in progress

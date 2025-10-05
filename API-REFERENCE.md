# 🚀 SnapIT Forum - Complete API Reference

**Base URL**: `https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod`
**Auth**: Bearer JWT token (from Google OAuth)
**Last Updated**: October 5, 2025

---

## 📋 API Endpoint Summary

**Total Endpoints**: 29 Lambda functions
**Auth Required**: 🔒 (JWT token)
**Public**: 🌐 (no auth)

| Category | Endpoint | Method | Auth | Lambda Function |
|----------|----------|--------|------|-----------------|
| **Auth** | `/auth/google` | GET | 🌐 | `googleAuth` |
| **Auth** | `/auth/google/callback` | GET | 🌐 | `googleCallback` |
| **Auth** | `/auth/refresh` | POST | 🌐 | `refreshToken` |
| **Forums** | `/forums` | GET | 🌐 | `getForums` |
| **Forums** | `/forums` | POST | 🔒 | `createForum` |
| **Forums** | `/forums/{forumId}` | GET | 🌐 | `getForum` |
| **Categories** | `/forums/{forumId}/categories` | GET | 🌐 | `getCategories` |
| **Categories** | `/forums/{forumId}/categories` | POST | 🔒 | `createCategory` |
| **Threads** | `/forums/{forumId}/categories/{categoryId}/threads` | GET | 🌐 | `getThreads` |
| **Threads** | `/forums/{forumId}/categories/{categoryId}/threads` | POST | 🔒 | `createThread` |
| **Threads** | `/forums/{forumId}/threads/{threadId}` | GET | 🌐 | `getThread` |
| **Posts** | `/forums/{forumId}/threads/{threadId}/posts` | GET | 🌐 | `getPosts` |
| **Posts** | `/forums/{forumId}/threads/{threadId}/posts` | POST | 🔒 | `createPost` |
| **Posts** | `/posts/{postId}/vote` | POST | 🔒 | `votePost` |
| **Messages** | `/messages` | GET | 🔒 | `getMessages` |
| **Messages** | `/messages` | POST | 🔒 | `sendMessage` |
| **Messages** | `/messages/anonymous` | POST | 🌐 | `sendAnonymousMessage` |
| **Messages** | `/conversations` | GET | 🔒 | `getConversations` |
| **Users** | `/users/me` | GET | 🔒 | `getMe` |
| **Users** | `/users/me` | PUT | 🔒 | `updateUser` |
| **Users** | `/users/me/username` | PUT | 🔒 | `setUsername` |
| **Users** | `/users/check-username` | GET | 🔒 | `checkUsername` |
| **Users** | `/users/{userId}` | GET | 🌐 | `getUser` |
| **Users** | `/users/profile/{username}` | GET | 🌐 | `getPublicProfile` |
| **Stripe** | `/create-checkout-session` | POST | 🔒 | `createCheckoutSession` |
| **Stripe** | `/create-portal-session` | POST | 🔒 | `createPortalSession` |
| **Stripe** | `/webhooks/stripe` | POST | 🌐 | `stripeWebhook` |
| **WebRTC** | `$connect` | WS | 🔒 | `webrtcConnect` |
| **WebRTC** | `$disconnect` | WS | 🔒 | `webrtcDisconnect` |

---

## 🔐 Authentication

### Google OAuth Flow

#### 1. Initiate Login
```http
GET https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/auth/google
```

**Lambda**: `src/handlers/auth.js → googleAuth`

**What it does**:
1. Redirects to Google OAuth consent screen
2. User approves access
3. Google returns authorization code

**Response**: `302 Redirect` to Google

---

#### 2. OAuth Callback
```http
GET https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/auth/google/callback?code=AUTHORIZATION_CODE
```

**Lambda**: `src/handlers/auth.js → googleCallback`

**What it does**:
1. Exchanges authorization code for Google access token
2. Fetches user info from Google
3. Creates or updates user in DynamoDB
4. Issues JWT token
5. Redirects to frontend with token

**Response**: `302 Redirect` to `https://forum.snapitsoftware.com/?token=JWT_TOKEN`

---

#### 3. Refresh Token
```http
POST https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/auth/refresh
Authorization: Bearer OLD_JWT_TOKEN
```

**Lambda**: `src/handlers/auth.js → refreshToken`

**Request Body**: (empty)

**Response**:
```json
{
  "token": "new_jwt_token_here",
  "user": {
    "userId": "user_abc123",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

---

## 👥 User Management

### Get Current User
```http
GET https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/users/me
Authorization: Bearer JWT_TOKEN
```

**Lambda**: `src/handlers/users.js → getMe`

**Response**:
```json
{
  "userId": "user_abc123",
  "email": "john@example.com",
  "username": "johndoe",
  "name": "John Doe",
  "picture": "https://lh3.googleusercontent.com/...",
  "pgpPublicKey": "-----BEGIN PGP PUBLIC KEY BLOCK-----...",
  "tier": "free",
  "forumId": "johndoe-forum"
}
```

---

### Update User Profile
```http
PUT https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/users/me
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "name": "John Doe Jr.",
  "bio": "Privacy advocate",
  "pgpPublicKey": "-----BEGIN PGP PUBLIC KEY BLOCK-----..."
}
```

**Lambda**: `src/handlers/users.js → update`

**Response**:
```json
{
  "success": true,
  "user": { /* updated user object */ }
}
```

---

### Set Username (First-time Setup)
```http
PUT https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/users/me/username
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "username": "johndoe"
}
```

**Lambda**: `src/handlers/users.js → setUsername`

**What it does**:
1. Validates username (alphanumeric, 3-20 chars)
2. Checks availability
3. Creates user's forum (free tier)
4. Updates user record

**Response**:
```json
{
  "success": true,
  "username": "johndoe",
  "forumId": "johndoe-forum"
}
```

---

### Check Username Availability
```http
GET https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/users/check-username?username=johndoe
Authorization: Bearer JWT_TOKEN
```

**Lambda**: `src/handlers/users.js → checkUsername`

**Response**:
```json
{
  "available": true
}
```

---

### Get Public Profile
```http
GET https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/users/profile/johndoe
```

**Lambda**: `src/handlers/users.js → getPublicProfile`

**Response**:
```json
{
  "username": "johndoe",
  "name": "John Doe",
  "bio": "Privacy advocate",
  "pgpPublicKey": "-----BEGIN PGP PUBLIC KEY BLOCK-----...",
  "forumId": "johndoe-forum",
  "memberSince": 1696003200000
}
```

---

## 📋 Forum Management

### List All Forums
```http
GET https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/forums
```

**Lambda**: `src/handlers/forums.js → list`

**Response**:
```json
[
  {
    "forumId": "johndoe-forum",
    "name": "John's Community",
    "tier": "pro",
    "maxUsers": 10000,
    "userCount": 142,
    "createdAt": 1696003200000
  }
]
```

---

### Create Forum
```http
POST https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/forums
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "name": "My Awesome Community",
  "subdomain": "awesome-community",
  "tier": "free"
}
```

**Lambda**: `src/handlers/forums.js → create`

**What it does**:
1. Validates subdomain availability
2. Creates forum in DynamoDB
3. Adds user as admin in `forum-members` table
4. Creates default categories

**Response**:
```json
{
  "forumId": "awesome-community",
  "name": "My Awesome Community",
  "tier": "free",
  "maxUsers": 1500,
  "userCount": 1,
  "createdAt": 1696003200000
}
```

---

### Get Forum Details
```http
GET https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/forums/johndoe-forum
```

**Lambda**: `src/handlers/forums.js → get`

**Response**:
```json
{
  "forumId": "johndoe-forum",
  "name": "John's Community",
  "ownerUserId": "user_abc123",
  "tier": "pro",
  "maxUsers": 10000,
  "userCount": 142,
  "customDomain": null,
  "stripeSubscriptionId": "sub_xxx"
}
```

---

## 📂 Categories

### List Categories
```http
GET https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/forums/johndoe-forum/categories
```

**Lambda**: `src/handlers/categories.js → list`

**Response**:
```json
[
  {
    "categoryId": "cat_general",
    "name": "General Discussion",
    "description": "Talk about anything",
    "position": 0,
    "threadCount": 42
  },
  {
    "categoryId": "cat_support",
    "name": "Support",
    "description": "Get help",
    "position": 1,
    "threadCount": 18
  }
]
```

---

### Create Category
```http
POST https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/forums/johndoe-forum/categories
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "name": "Feature Requests",
  "description": "Suggest new features"
}
```

**Lambda**: `src/handlers/categories.js → create`

**Requires**: Admin role in forum

---

## 💬 Threads

### List Threads in Category
```http
GET https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/forums/johndoe-forum/categories/cat_general/threads
```

**Lambda**: `src/handlers/threads.js → list`

**Query Params**:
- `limit` (optional): Number of threads (default: 50)
- `startKey` (optional): For pagination

**Response**:
```json
{
  "threads": [
    {
      "threadId": "thread_abc",
      "title": "Welcome to the forum!",
      "authorUserId": "user_abc123",
      "postCount": 12,
      "viewCount": 156,
      "lastPostAt": 1696003200000,
      "createdAt": 1696000000000
    }
  ],
  "nextKey": "thread_xyz"
}
```

---

### Create Thread
```http
POST https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/forums/johndoe-forum/categories/cat_general/threads
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "title": "My first thread",
  "content": "Hello everyone!"
}
```

**Lambda**: `src/handlers/threads.js → create`

**What it does**:
1. Creates thread in `threads` table
2. Creates first post in `posts` table
3. Updates category `threadCount`

---

### Get Thread Details
```http
GET https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/forums/johndoe-forum/threads/thread_abc
```

**Lambda**: `src/handlers/threads.js → get`

---

## 📝 Posts

### List Posts in Thread
```http
GET https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/forums/johndoe-forum/threads/thread_abc/posts
```

**Lambda**: `src/handlers/posts.js → list`

**Response**:
```json
{
  "posts": [
    {
      "postId": "post_123",
      "authorUserId": "user_abc123",
      "content": "This is my reply",
      "voteScore": 42,
      "createdAt": 1696003200000
    }
  ]
}
```

---

### Create Post (Reply)
```http
POST https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/forums/johndoe-forum/threads/thread_abc/posts
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "content": "Great thread!"
}
```

**Lambda**: `src/handlers/posts.js → create`

---

### Vote on Post (Upvote/Downvote)
```http
POST https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/posts/post_123/vote
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "vote": 1  // 1 = upvote, -1 = downvote, 0 = remove vote
}
```

**Lambda**: `src/handlers/posts.js → vote`

**What it does**:
1. Checks if user already voted
2. Updates or creates vote in `votes` table
3. Recalculates post `voteScore`
4. Returns new score

**Response**:
```json
{
  "success": true,
  "voteScore": 43
}
```

---

## 💬 Private Messages (PGP Encrypted)

### Get Messages (Conversation)
```http
GET https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/messages?otherUserId=user_xyz789
Authorization: Bearer JWT_TOKEN
```

**Lambda**: `src/handlers/messages.js → list`

**Response**:
```json
[
  {
    "conversationId": "user_abc123#user_xyz789",
    "timestamp": 1696003200000,
    "fromUserId": "user_abc123",
    "toUserId": "user_xyz789",
    "encryptedContent": "-----BEGIN PGP MESSAGE-----\nwcBMA...",
    "read": false
  }
]
```

**Note**: Content is **encrypted** - frontend decrypts with user's private key

---

### Send Message
```http
POST https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/messages
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "toUserId": "user_xyz789",
  "encryptedContent": "-----BEGIN PGP MESSAGE-----\nwcBMA...",
  "encryptedSubject": "-----BEGIN PGP MESSAGE-----..."
}
```

**Lambda**: `src/handlers/messages.js → send`

**Important**: Frontend encrypts message **before** sending!

---

### Send Anonymous Message
```http
POST https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/messages/anonymous
Content-Type: application/json

{
  "recipientUsername": "johndoe",
  "encryptedContent": "-----BEGIN PGP MESSAGE-----...",
  "autoDeleteMinutes": 60
}
```

**Lambda**: `src/handlers/messages.js → sendAnonymous`

**Features**:
- No auth required (anonymous!)
- Auto-delete with TTL
- Encrypted to recipient's public key

---

### Get Conversations
```http
GET https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/conversations
Authorization: Bearer JWT_TOKEN
```

**Lambda**: `src/handlers/messages.js → getConversations`

**Response**: List of all conversations with unread counts

---

## 💳 Stripe Integration

### Create Checkout Session
```http
POST https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/create-checkout-session
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "priceId": "price_1SEwg1IKz9wDf9qXRK0BlB3H",
  "tier": "pro"
}
```

**Lambda**: `src/handlers/checkout.js → createSession`

**Response**:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

---

### Create Billing Portal Session
```http
POST https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/create-portal-session
Authorization: Bearer JWT_TOKEN
```

**Lambda**: `src/handlers/checkout.js → createPortalSession`

**Response**:
```json
{
  "url": "https://billing.stripe.com/p/session/test_..."
}
```

---

### Stripe Webhook
```http
POST https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/webhooks/stripe
Stripe-Signature: t=...,v1=...

{
  "type": "customer.subscription.created",
  "data": { ... }
}
```

**Lambda**: `src/handlers/stripe.js → webhook`

**Events Handled**:
- `customer.subscription.created` → Upgrade forum tier
- `customer.subscription.updated` → Change tier
- `customer.subscription.deleted` → Downgrade to free
- `invoice.payment_succeeded` → Confirm payment
- `invoice.payment_failed` → Handle failure

---

## 🌐 WebRTC Signaling (WebSocket)

### Connect
```
wss://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod?token=JWT_TOKEN
```

**Lambda**: `src/handlers/signaling.js → connect`

---

### Discover Relays
```json
{
  "action": "discover-relays"
}
```

**Lambda**: `src/handlers/signaling.js → discoverRelays`

---

### Advertise as Relay
```json
{
  "action": "advertise-relay",
  "capacity": 5
}
```

**Lambda**: `src/handlers/signaling.js → advertiseRelay`

---

## 🔒 Authorization

### JWT Token Structure
```json
{
  "userId": "user_abc123",
  "email": "john@example.com",
  "iat": 1696003200,
  "exp": 1696089600
}
```

### Authorizer Lambda
**Lambda**: `src/handlers/auth.js → authorizer`

**What it does**:
1. Validates JWT signature
2. Checks expiration
3. Returns IAM policy (Allow/Deny)

---

## 📊 Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (invalid/missing JWT) |
| 403 | Forbidden (not admin) |
| 404 | Not Found |
| 409 | Conflict (username taken) |
| 500 | Internal Server Error |

---

## 🚀 Example: Complete User Flow

### 1. Sign Up
```bash
curl https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/auth/google
# Redirects to Google → Back with token
```

### 2. Set Username
```bash
curl -X PUT https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/users/me/username \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe"}'
```

### 3. Send Message
```bash
# Frontend encrypts with openpgp.js first
curl -X POST https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/messages \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"toUserId":"user_xyz","encryptedContent":"-----BEGIN PGP MESSAGE-----..."}'
```

---

**Last Updated**: October 5, 2025

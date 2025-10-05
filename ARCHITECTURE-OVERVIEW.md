# 🏗️ SnapIT Forum - Architecture Overview

**Last Updated**: October 5, 2025
**Status**: Production

---

## 🌐 Domain & API Configuration

### Production Domains
```
Custom Domains (IONOS DNS):
├── forum.snapitsoftware.com          ✅ Frontend (S3 + CloudFront)
├── auth.snapitsoftware.com           ✅ OAuth service
└── api.snapitsoftware.com            ⚠️  API Gateway (can map here)

Current API Endpoint:
└── u25qbry7za.execute-api.us-east-1.amazonaws.com/prod
```

### Current Configuration
**Frontend URL**: `https://forum.snapitsoftware.com`
**API URL**: `https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod`
**OAuth URL**: `https://auth.snapitsoftware.com/auth/google`

---

## 📊 Data Storage Architecture

### DynamoDB Tables (10 Total)

#### 1. **forums** Table
```javascript
Primary Key: forumId (String)
Sort Key: None
GSI: OwnerIndex (ownerUserId)

Example Item:
{
  forumId: "johndoe-forum",
  ownerUserId: "user_abc123",
  name: "John's Community",
  tier: "free",
  maxUsers: 1500,
  userCount: 42,
  createdAt: 1696003200000,
  stripeCustomerId: "cus_xxx",
  stripeSubscriptionId: "sub_xxx"
}
```

**Used For**: Forum metadata, tier limits, Stripe subscriptions

#### 2. **users** Table
```javascript
Primary Key: userId (String)
GSI: EmailIndex (email)
GSI: UsernameIndex (username)

Example Item:
{
  userId: "user_abc123",
  email: "john@example.com",
  username: "johndoe",
  name: "John Doe",
  picture: "https://lh3.googleusercontent.com/...",
  pgpPublicKey: "-----BEGIN PGP PUBLIC KEY BLOCK-----...",
  createdAt: 1696003200000,
  tier: "free",
  forumId: "johndoe-forum"
}
```

**Used For**: User profiles, PGP public keys, authentication

#### 3. **messages** Table
```javascript
Primary Key: conversationId (String)  // sorted user IDs: "user1#user2"
Sort Key: timestamp (Number)
TTL: ttl (optional - auto-delete ephemeral messages)

Example Item:
{
  conversationId: "user_abc123#user_xyz789",
  timestamp: 1696003200000,
  fromUserId: "user_abc123",
  toUserId: "user_xyz789",
  encryptedContent: "-----BEGIN PGP MESSAGE-----\nwcBMA...",
  encryptedSubject: "-----BEGIN PGP MESSAGE-----...",
  read: false,
  ttl: 1696089600  // Auto-delete after 1 day (optional)
}
```

**Used For**: PGP encrypted private messages
**Key Feature**: Server stores **encrypted ciphertext only** - zero-knowledge!

#### 4. **posts** Table
```javascript
Primary Key: threadIdPostId (String)  // "thread_abc#post_123"
Sort Key: createdAt (Number)

Example Item:
{
  threadIdPostId: "thread_abc#post_123",
  postId: "post_123",
  threadId: "thread_abc",
  forumId: "johndoe-forum",
  authorUserId: "user_abc123",
  content: "This is my post content",
  voteScore: 42,
  createdAt: 1696003200000
}
```

**Used For**: Forum thread posts, Reddit-style discussions

#### 5. **threads** Table
```javascript
Primary Key: forumIdThreadId (String)
Sort Key: createdAt (Number)
GSI: CategoryIndex (forumIdCategoryId, lastPostAt)

Example Item:
{
  forumIdThreadId: "johndoe-forum#thread_abc",
  threadId: "thread_abc",
  forumId: "johndoe-forum",
  categoryId: "cat_general",
  title: "Welcome to the forum!",
  authorUserId: "user_abc123",
  postCount: 12,
  viewCount: 156,
  lastPostAt: 1696003200000,
  createdAt: 1696000000000
}
```

**Used For**: Forum threads, organizing discussions

#### 6. **categories** Table
```javascript
Primary Key: forumIdCategoryId (String)
Sort Key: position (Number)

Example Item:
{
  forumIdCategoryId: "johndoe-forum#cat_general",
  categoryId: "cat_general",
  forumId: "johndoe-forum",
  name: "General Discussion",
  description: "General topics",
  position: 0,
  threadCount: 42
}
```

**Used For**: Forum categories/sections

#### 7. **forum-members** Table
```javascript
Primary Key: forumIdUserId (String)
Sort Key: joinedAt (Number)
GSI: ForumIndex (forumId, joinedAt)

Example Item:
{
  forumIdUserId: "johndoe-forum#user_abc123",
  forumId: "johndoe-forum",
  userId: "user_abc123",
  role: "admin",  // admin, moderator, member
  joinedAt: 1696003200000
}
```

**Used For**: Forum membership, permissions

#### 8. **votes** Table
```javascript
Primary Key: voteId (String)  // "user_abc123#post_123"

Example Item:
{
  voteId: "user_abc123#post_123",
  userId: "user_abc123",
  postId: "post_123",
  vote: 1,  // 1 = upvote, -1 = downvote
  createdAt: 1696003200000
}
```

**Used For**: Reddit-style upvote/downvote

#### 9. **connections** Table (WebSocket)
```javascript
Primary Key: connectionId (String)
TTL: ttl (auto-expire after disconnect)

Example Item:
{
  connectionId: "abc123def456",
  userId: "user_abc123",
  connectedAt: 1696003200000,
  ttl: 1696006800  // Auto-expire after 1 hour
}
```

**Used For**: WebRTC signaling, real-time features

#### 10. **relay-peers** Table (WebRTC)
```javascript
Primary Key: connectionId (String)
GSI: PeerIdIndex (peerId)
TTL: ttl

Example Item:
{
  connectionId: "abc123def456",
  peerId: "peer_xyz789",
  userId: "user_abc123",
  relayCapacity: 5,
  currentLoad: 2,
  ttl: 1696006800
}
```

**Used For**: Anonymous relay routing (Tor-like P2P)

---

## 🔄 Data Flow

### Message Flow (PGP Encrypted)
```
Alice                    Frontend                Backend (Lambda)         DynamoDB
  │                         │                          │                     │
  ├─ Type message ─────────►│                          │                     │
  │                         │                          │                     │
  │                         ├─ Fetch Bob's PGP key ───►│                     │
  │                         │                          │                     │
  │                         │◄──── Public key ─────────┤◄─── users table ────┤
  │                         │                          │                     │
  │                         ├─ Encrypt with openpgp.js│                     │
  │                         │  (client-side!)          │                     │
  │                         │                          │                     │
  │                         ├─ POST /messages ────────►│                     │
  │                         │  {                       │                     │
  │                         │    encryptedContent:     │                     │
  │                         │    "-----BEGIN PGP---"   │                     │
  │                         │  }                       │                     │
  │                         │                          │                     │
  │                         │                          ├─ Store ciphertext ─►│
  │                         │                          │   (CANNOT DECRYPT!) │
  │                         │                          │                     │
  │                         │◄──── Success ────────────┤                     │
```

**Key Point**: Lambda **never** sees plaintext! Only encrypted PGP armor.

### Forum Post Flow (Plaintext)
```
User                     Frontend                Backend (Lambda)         DynamoDB
  │                         │                          │                     │
  ├─ Write post ───────────►│                          │                     │
  │                         │                          │                     │
  │                         ├─ POST /posts ───────────►│                     │
  │                         │  {                       │                     │
  │                         │    content: "Hello!"     │                     │
  │                         │  }                       │                     │
  │                         │                          │                     │
  │                         │                          ├─ Validate ──────────┤
  │                         │                          │                     │
  │                         │                          ├─ Store post ───────►│
  │                         │                          │   posts table       │
  │                         │                          │                     │
  │                         │                          ├─ Update thread ────►│
  │                         │                          │   threadCount++     │
  │                         │                          │                     │
  │                         │◄──── Success ────────────┤                     │
```

**Note**: Forum posts are **NOT** encrypted (public discussions).
Only **private messages** are PGP encrypted.

---

## ⚡ Is DynamoDB Efficient?

### ✅ Pros
1. **Auto-scaling**: Handles millions of requests without configuration
2. **Low latency**: Single-digit millisecond reads/writes
3. **Pay-per-request**: Only pay for what you use (no idle costs)
4. **No maintenance**: Fully managed, auto-backups
5. **Global tables**: Can replicate across regions easily
6. **TTL support**: Auto-delete ephemeral messages (privacy!)

### ⚠️ Cons & Optimizations
1. **No full-text search** → Solution: Use OpenSearch/Elasticsearch for search
2. **Limited queries** → Solution: Use GSIs (already implemented)
3. **Cost at scale** → Solution: Use DAX (DynamoDB Accelerator) caching

### Alternative Approaches

#### Option 1: RDS (Postgres/MySQL)
**Pros**: Full SQL, complex queries, transactions
**Cons**: Need to manage scaling, higher latency, more expensive

**Verdict**: ❌ Not needed - DynamoDB is better for this use case

#### Option 2: MongoDB/DocumentDB
**Pros**: Flexible schema, JSON-native
**Cons**: Need to manage, more expensive, not fully serverless

**Verdict**: ❌ DynamoDB is more cost-effective

#### Option 3: Hybrid Approach
**Use case**: Forum posts in DynamoDB, full-text search in OpenSearch

```javascript
// When creating post:
await dynamodb.put({ TableName: 'posts', Item: post });
await opensearch.index({ index: 'posts', body: post });

// Search:
const results = await opensearch.search({
  index: 'posts',
  body: {
    query: { match: { content: 'search term' } }
  }
});
```

**Verdict**: ✅ Good for future (when search is needed)

---

## 🚀 Performance Optimization

### Current Setup
- **API Gateway**: Handles HTTP requests, CORS, throttling
- **Lambda**: Stateless functions, auto-scale to thousands of concurrent requests
- **DynamoDB**: On-demand billing, no capacity planning needed
- **CloudFront**: Global CDN, caches static assets

### Optimization Strategies

#### 1. Add DynamoDB DAX (Caching)
```javascript
// Before (direct DynamoDB)
const result = await dynamodb.get({ TableName: 'posts', Key: { postId } });

// After (with DAX cache)
const result = await dax.get({ TableName: 'posts', Key: { postId } });
// 10x faster, reduces DynamoDB reads by 90%
```

**Cost**: ~$0.12/hour (~$87/month) for smallest instance
**Benefit**: 10x faster reads, 90% cost reduction on reads

#### 2. Use Lambda@Edge for Personalization
```javascript
// Route users to nearest Lambda based on location
// Example: EU users → Lambda in eu-west-1
```

#### 3. Enable API Gateway Caching
```bash
# Cache GET /forums for 5 minutes
aws apigateway put-method-response \
  --cache-ttl-in-seconds 300 \
  --cache-key-parameters method.request.path.forumId
```

**Cost**: ~$0.02/hour (~$15/month) for 0.5GB cache
**Benefit**: 50% reduction in Lambda invocations

---

## 💰 Cost Breakdown (Estimated)

### Low Usage (~100 active users)
```
Service                Monthly Cost
CloudFront            $1 - $5
DynamoDB (on-demand)  $0.50 - $2
Lambda                $0 - $1 (mostly free tier)
S3                    $0.10
API Gateway           $0.50 - $2
Total:                ~$2 - $10/month
```

### Medium Usage (~1,000 active users)
```
Service                Monthly Cost
CloudFront            $10 - $30
DynamoDB (on-demand)  $5 - $20
Lambda                $2 - $10
S3                    $0.50
API Gateway           $5 - $20
Total:                ~$22 - $80/month
```

### High Usage (~10,000 active users)
```
Service                Monthly Cost
CloudFront            $50 - $150
DynamoDB (on-demand)  $50 - $200
Lambda                $20 - $100
S3                    $2
API Gateway           $50 - $200
DAX (recommended)     $87
Total:                ~$259 - $739/month
```

**Revenue Potential** (from Stripe subscriptions):
- 100 Pro users @ $29/mo = $2,900/mo
- 50 Business @ $99/mo = $4,950/mo
- Total: **$7,850/mo** revenue vs **~$80/mo** costs = **98.5% profit margin**

---

## 🔐 Security Best Practices

### ✅ Already Implemented
1. **PGP encryption** - Messages encrypted client-side
2. **JWT authentication** - Secure API access
3. **SSM parameters** - Secrets encrypted at rest
4. **HTTPS everywhere** - TLS 1.2+ required
5. **CORS** - Restricted to forum.snapitsoftware.com
6. **Rate limiting** - API Gateway throttling

### 🔄 Recommended Additions
1. **WAF (Web Application Firewall)** - Block malicious requests
2. **CloudWatch alarms** - Alert on errors/anomalies
3. **DynamoDB encryption** - Enable at-rest encryption
4. **VPC endpoints** - Private Lambda → DynamoDB connection
5. **Secrets rotation** - Auto-rotate JWT secrets

---

## 📊 Monitoring & Debugging

### CloudWatch Logs
```bash
# View Lambda logs
aws logs tail /aws/lambda/snapit-forum-api-prod-sendMessage --follow

# View API Gateway access logs
aws logs tail /aws/api-gateway/snapit-forum-api-prod --follow

# Search for errors
aws logs filter-pattern "ERROR" \
  --log-group-name /aws/lambda/snapit-forum-api-prod-sendMessage \
  --start-time $(date -d '1 hour ago' +%s)000
```

### DynamoDB Metrics
```bash
# Check read/write capacity
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedReadCapacityUnits \
  --dimensions Name=TableName,Value=snapit-forum-api-messages-prod \
  --start-time 2025-10-05T00:00:00Z \
  --end-time 2025-10-05T23:59:59Z \
  --period 3600 \
  --statistics Sum
```

### Lambda Performance
```bash
# Check cold start duration
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=snapit-forum-api-prod-sendMessage \
  --start-time 2025-10-05T00:00:00Z \
  --end-time 2025-10-05T23:59:59Z \
  --period 300 \
  --statistics Average,Maximum
```

---

## 🎯 Recommendations

### Immediate (Week 1)
1. ✅ Enable CloudWatch alarms for Lambda errors
2. ✅ Set up DynamoDB point-in-time recovery
3. ✅ Enable API Gateway access logging
4. ✅ Add custom domain for API (api.forum.snapitsoftware.com)

### Short-term (Month 1)
1. Add full-text search (OpenSearch) for forum posts
2. Implement real-time updates (WebSocket for messages)
3. Add DynamoDB DAX caching for hot posts
4. Enable WAF for API Gateway

### Long-term (Quarter 1)
1. Multi-region deployment (DynamoDB global tables)
2. Advanced analytics (user behavior, engagement)
3. Machine learning (spam detection, content moderation)
4. Mobile app (React Native)

---

## ✅ Summary

**Current Architecture**: ✅ **Production-ready and efficient!**

- **Data**: DynamoDB (optimal for this use case)
- **API**: Lambda + API Gateway (serverless, auto-scaling)
- **Frontend**: S3 + CloudFront (global CDN)
- **Security**: PGP + JWT + SSM (zero-knowledge)

**Is DynamoDB the right choice?** **YES!**
- Auto-scales seamlessly
- Low latency (<10ms)
- Pay-per-request (cost-effective)
- No maintenance overhead

**Next Steps**:
1. Test production site: https://forum.snapitsoftware.com
2. Monitor CloudWatch logs for errors
3. Consider adding search (OpenSearch) when needed
4. Scale horizontally as users grow

---

**Last Updated**: October 5, 2025 18:40 UTC

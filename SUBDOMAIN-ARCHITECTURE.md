# 🌐 SnapIT Software - Subdomain Architecture

**Domain**: snapitsoftware.com
**Status**: All subdomains available ✅
**Last Updated**: October 5, 2025

---

## 🎯 Proposed Subdomain Structure

### **Current Active Subdomains**

#### 1. **forum.snapitsoftware.com** ✅ **ACTIVE**
**Purpose**: Main forum/messenger application
**Infrastructure**: S3 + CloudFront (E1X8SJIRPSICZ4)
**SSL**: ACM certificate
**Content**: React frontend (forum builder + messenger)

**DNS Record (IONOS)**:
```
Type: CNAME
Host: forum
Value: d3jn3i879jxit2.cloudfront.net
TTL: 3600
```

---

#### 2. **auth.snapitsoftware.com** ✅ **ACTIVE**
**Purpose**: OAuth authentication service
**Infrastructure**: API Gateway
**Content**: Google OAuth redirect endpoint

**DNS Record (IONOS)**:
```
Type: CNAME
Host: auth
Value: u25qbry7za.execute-api.us-east-1.amazonaws.com
TTL: 3600
```

---

### **Recommended New Subdomains**

#### 3. **api.snapitsoftware.com** 🆕 **RECOMMENDED**
**Purpose**: REST API endpoint (cleaner than default API Gateway URL)
**Infrastructure**: API Gateway custom domain
**Benefits**:
- Professional URL (api.snapitsoftware.com/messages vs u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/messages)
- Better branding
- Can version APIs (api.snapitsoftware.com/v1, /v2)
- Easier to remember for developers

**Setup**:
```bash
# Create custom domain in API Gateway
aws apigateway create-domain-name \
  --domain-name api.snapitsoftware.com \
  --certificate-arn arn:aws:acm:us-east-1:692859945539:certificate/d8cd260b-b196-4d65-9b92-1e58b9a1422b \
  --endpoint-configuration types=EDGE

# Map to prod stage
aws apigateway create-base-path-mapping \
  --domain-name api.snapitsoftware.com \
  --rest-api-id u25qbry7za \
  --stage prod
```

**DNS Record (IONOS)**:
```
Type: CNAME
Host: api
Value: d-xxxxxxxxxx.execute-api.us-east-1.amazonaws.com (from create-domain-name output)
TTL: 3600
```

---

#### 4. **ws.snapitsoftware.com** 🆕 **RECOMMENDED**
**Purpose**: WebSocket connections (real-time messaging, typing indicators)
**Infrastructure**: API Gateway WebSocket API custom domain
**Benefits**:
- Dedicated WebSocket endpoint
- Separate from REST API
- Better performance monitoring
- Scalable real-time features

**Current WebSocket**: `wss://ju482kcu0a.execute-api.us-east-1.amazonaws.com/prod`
**New WebSocket**: `wss://ws.snapitsoftware.com`

**Setup**:
```bash
# Create custom domain for WebSocket API
aws apigatewayv2 create-domain-name \
  --domain-name ws.snapitsoftware.com \
  --domain-name-configurations CertificateArn=arn:aws:acm:us-east-1:692859945539:certificate/d8cd260b-b196-4d65-9b92-1e58b9a1422b

# Map to WebSocket API
aws apigatewayv2 create-api-mapping \
  --domain-name ws.snapitsoftware.com \
  --api-id ju482kcu0a \
  --stage prod
```

**DNS Record (IONOS)**:
```
Type: CNAME
Host: ws
Value: d-xxxxxxxxxx.execute-api.us-east-1.amazonaws.com
TTL: 3600
```

---

#### 5. **app.snapitsoftware.com** 🆕 **OPTIONAL**
**Purpose**: Main application (alternative to forum.snapitsoftware.com)
**Use Case**: Could redirect to forum.snapitsoftware.com OR host separate app version
**Benefits**:
- Generic "app" branding
- Could host mobile web app variant
- Future-proof for other apps

**Option A**: Redirect to forum.snapitsoftware.com
```
Type: CNAME
Host: app
Value: forum.snapitsoftware.com
TTL: 3600
```

**Option B**: Separate CloudFront distribution
```
Type: CNAME
Host: app
Value: dxxxxxxxxxx.cloudfront.net
TTL: 3600
```

---

#### 6. **cdn.snapitsoftware.com** 🆕 **RECOMMENDED**
**Purpose**: Static assets (images, CSS, JS, fonts)
**Infrastructure**: S3 + CloudFront
**Benefits**:
- Faster loading (cookieless domain)
- Better caching
- Separate from main app
- CDN optimization

**Setup**:
1. Create new S3 bucket: `snapit-cdn`
2. Create new CloudFront distribution
3. Point subdomain to CloudFront

**DNS Record (IONOS)**:
```
Type: CNAME
Host: cdn
Value: dxxxxxxxxxx.cloudfront.net
TTL: 86400 (24 hours - longer cache)
```

---

#### 7. **docs.snapitsoftware.com** 🆕 **RECOMMENDED**
**Purpose**: Documentation site (API docs, user guides, tutorials)
**Infrastructure**: S3 + CloudFront OR GitHub Pages
**Benefits**:
- Separate documentation from main app
- Better SEO
- Easy to update
- Professional appearance

**Option A**: S3 + CloudFront (static site)
**Option B**: GitHub Pages (markdown-based)

**DNS Record (IONOS)**:
```
Type: CNAME
Host: docs
Value: dxxxxxxxxxx.cloudfront.net
TTL: 3600
```

---

#### 8. **status.snapitsoftware.com** 🆕 **OPTIONAL**
**Purpose**: System status page (uptime, incidents)
**Infrastructure**: External service (StatusPage.io, UptimeRobot) OR custom
**Benefits**:
- Transparency for users
- Real-time uptime monitoring
- Incident communication

**DNS Record (IONOS)**:
```
Type: CNAME
Host: status
Value: statuspage.io OR custom CloudFront
TTL: 3600
```

---

#### 9. **blog.snapitsoftware.com** 🆕 **OPTIONAL**
**Purpose**: Company blog (product updates, privacy news)
**Infrastructure**: WordPress, Ghost, or static site
**Benefits**:
- Content marketing
- SEO benefits
- Community engagement

**DNS Record (IONOS)**:
```
Type: CNAME
Host: blog
Value: wordpress.com OR ghost.io OR custom
TTL: 3600
```

---

#### 10. **mail.snapitsoftware.com** 🆕 **FUTURE**
**Purpose**: Custom email (support@snapitsoftware.com)
**Infrastructure**: Google Workspace, AWS SES, or ProtonMail
**Benefits**:
- Professional email addresses
- Better branding than @gmail.com
- Encrypted email options

**DNS Records (MX)**:
```
Type: MX
Host: @
Priority: 10
Value: mail.snapitsoftware.com
TTL: 3600
```

---

## 🏗️ Recommended Implementation Order

### **Phase 1: Critical (Week 1)** ✅
1. ✅ forum.snapitsoftware.com (DONE)
2. ✅ auth.snapitsoftware.com (DONE)
3. 🆕 api.snapitsoftware.com (replaces ugly API Gateway URL)
4. 🆕 ws.snapitsoftware.com (WebSocket endpoint)

### **Phase 2: Important (Week 2)**
5. cdn.snapitsoftware.com (static assets)
6. docs.snapitsoftware.com (documentation)

### **Phase 3: Nice to Have (Month 1)**
7. app.snapitsoftware.com (redirect or separate app)
8. status.snapitsoftware.com (status page)
9. blog.snapitsoftware.com (content marketing)

### **Phase 4: Future**
10. mail.snapitsoftware.com (custom email)

---

## 📊 Updated Architecture Diagram

```
User Browser
     │
     ├─► forum.snapitsoftware.com ──► CloudFront ──► S3 (React App)
     │                                     │
     │                                     └─► cdn.snapitsoftware.com (Static Assets)
     │
     ├─► api.snapitsoftware.com ───► API Gateway ──► Lambda Functions
     │                                     │
     │                                     └─► DynamoDB
     │
     ├─► ws.snapitsoftware.com ────► WebSocket API ──► Lambda (Real-time)
     │
     ├─► auth.snapitsoftware.com ──► API Gateway ──► Lambda (OAuth)
     │                                     │
     │                                     └─► Google OAuth
     │
     ├─► docs.snapitsoftware.com ──► CloudFront ──► S3 (Docs)
     │
     ├─► status.snapitsoftware.com ─► StatusPage.io
     │
     └─► blog.snapitsoftware.com ───► Ghost/WordPress
```

---

## 🚀 Quick Setup: API Subdomain

Let's set up **api.snapitsoftware.com** first (highest priority):

### Step 1: Create API Gateway Custom Domain
```bash
# Create custom domain
aws apigateway create-domain-name \
  --domain-name api.snapitsoftware.com \
  --regional-certificate-arn arn:aws:acm:us-east-1:692859945539:certificate/d8cd260b-b196-4d65-9b92-1e58b9a1422b \
  --endpoint-configuration types=REGIONAL \
  --region us-east-1

# Note the distributionDomainName from output (e.g., d-abc123xyz.execute-api.us-east-1.amazonaws.com)
```

### Step 2: Map to Your API
```bash
# Create base path mapping
aws apigateway create-base-path-mapping \
  --domain-name api.snapitsoftware.com \
  --rest-api-id u25qbry7za \
  --stage prod \
  --region us-east-1
```

### Step 3: Add DNS Record in IONOS
```
Type: CNAME
Host: api
Value: d-abc123xyz.execute-api.us-east-1.amazonaws.com (from Step 1 output)
TTL: 3600
```

### Step 4: Update Frontend Config
Edit `forum-app/src/config.ts`:
```typescript
// Change from:
export const API_BASE_URL = 'https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod';

// To:
export const API_BASE_URL = 'https://api.snapitsoftware.com';
```

### Step 5: Rebuild & Deploy
```bash
cd forum-app
npm run build
aws s3 sync build/ s3://snapit-forum-static/ --delete
aws cloudfront create-invalidation --distribution-id E1X8SJIRPSICZ4 --paths "/*"
```

---

## 🔒 SSL Certificate Management

### Current Certificate
```
ARN: arn:aws:acm:us-east-1:692859945539:certificate/d8cd260b-b196-4d65-9b92-1e58b9a1422b
Domain: *.snapitsoftware.com (wildcard)
Status: Issued ✅
```

**Good news**: Your wildcard certificate (`*.snapitsoftware.com`) covers ALL subdomains!
- forum.snapitsoftware.com ✅
- api.snapitsoftware.com ✅
- ws.snapitsoftware.com ✅
- cdn.snapitsoftware.com ✅
- docs.snapitsoftware.com ✅
- Any other subdomain you create ✅

---

## 💡 Benefits of Subdomain Architecture

### 1. **Scalability**
- Each subdomain can scale independently
- WebSocket traffic doesn't affect REST API
- CDN assets don't impact app performance

### 2. **Security**
- Separate domains for different concerns
- Can apply different security policies
- CORS management easier

### 3. **Performance**
- Cookieless CDN domain (cdn.snapitsoftware.com)
- Regional WebSocket endpoints
- Caching strategies per subdomain

### 4. **Professionalism**
- Clean, memorable URLs
- Better branding
- Easier to communicate to developers

### 5. **Monitoring**
- Track metrics per subdomain
- Separate CloudWatch logs
- Easier debugging

---

## 📝 DNS Configuration Summary

Copy this to IONOS DNS settings:

| Type | Host | Value | TTL | Priority |
|------|------|-------|-----|----------|
| CNAME | forum | d3jn3i879jxit2.cloudfront.net | 3600 | - |
| CNAME | auth | u25qbry7za.execute-api.us-east-1.amazonaws.com | 3600 | - |
| CNAME | api | [from create-domain-name] | 3600 | - |
| CNAME | ws | [from create-domain-name] | 3600 | - |
| CNAME | cdn | [new CloudFront distribution] | 86400 | - |
| CNAME | docs | [new CloudFront distribution] | 3600 | - |
| CNAME | app | forum.snapitsoftware.com | 3600 | - |

---

## 🎯 Next Steps

### Immediate (Today)
1. Set up **api.snapitsoftware.com** (cleaner API URL)
2. Set up **ws.snapitsoftware.com** (WebSocket endpoint)
3. Update frontend config to use new API URL
4. Test all endpoints with new subdomain

### This Week
5. Set up **cdn.snapitsoftware.com** for static assets
6. Set up **docs.snapitsoftware.com** for documentation
7. Create status page at **status.snapitsoftware.com**

### This Month
8. Launch blog at **blog.snapitsoftware.com**
9. Set up custom email (support@snapitsoftware.com)
10. Add more regional endpoints if needed

---

## 🔍 Testing After Setup

### Test API Subdomain
```bash
# Old URL
curl https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/forums

# New URL (should return same response)
curl https://api.snapitsoftware.com/forums
```

### Test WebSocket Subdomain
```javascript
// Old WebSocket
const ws = new WebSocket('wss://ju482kcu0a.execute-api.us-east-1.amazonaws.com/prod');

// New WebSocket
const ws = new WebSocket('wss://ws.snapitsoftware.com');
```

---

## 📚 References

- [AWS API Gateway Custom Domains](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-custom-domains.html)
- [CloudFront Custom Domains](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html)
- [ACM Wildcard Certificates](https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-request-public.html)

---

**Status**: Ready to implement ✅
**Priority**: High 🔥
**Impact**: Professional branding + Better performance 🚀

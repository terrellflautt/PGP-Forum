# 🌐 snapitsoft.com - Backup/Alternative Domain Strategy

**Primary Domain**: snapitsoftware.com
**Backup Domain**: snapitsoft.com (shorter, easier to remember)
**Last Updated**: October 5, 2025

---

## 🎯 Purpose of snapitsoft.com

### Why Keep Two Domains?

1. **Brand Flexibility**
   - snapitsoft.com is shorter (saves typing)
   - snapitsoftware.com is more descriptive
   - Can use both for different purposes

2. **Redundancy**
   - If one domain has DNS issues, use the other
   - Domain migration safety net
   - A/B testing different branding

3. **Geographic/Market Segmentation**
   - snapitsoftware.com → North America
   - snapitsoft.com → International/Europe
   - Different marketing campaigns

4. **Service Separation**
   - snapitsoftware.com → Main forum/messenger platform
   - snapitsoft.com → Corporate site, API, developer tools

---

## 📊 Recommended Usage Strategy

### Option 1: Mirror Setup (Recommended)
**Use snapitsoft.com as exact mirror of snapitsoftware.com**

**Benefits**:
- Users can access via either domain
- SEO boost (more inbound links)
- Easier to remember short domain

**Setup**:
```bash
# Point all snapitsoft.com subdomains to same infrastructure
forum.snapitsoft.com → Same CloudFront as forum.snapitsoftware.com
api.snapitsoft.com → Same API Gateway as api.snapitsoftware.com
auth.snapitsoft.com → Same OAuth service as auth.snapitsoftware.com
```

---

### Option 2: Service Separation (Advanced)
**Use snapitsoft.com for developer/API services**

**snapitsoftware.com** (User-facing):
- forum.snapitsoftware.com → Main app
- auth.snapitsoftware.com → OAuth
- blog.snapitsoftware.com → Marketing blog
- status.snapitsoftware.com → Status page

**snapitsoft.com** (Developer-facing):
- api.snapitsoft.com → Public API
- docs.snapitsoft.com → API documentation
- dev.snapitsoft.com → Developer portal
- playground.snapitsoft.com → API playground

---

### Option 3: Corporate vs Product
**Use snapitsoft.com for corporate, snapitsoftware.com for product**

**snapitsoft.com** (Corporate):
- www.snapitsoft.com → Company homepage
- about.snapitsoft.com → About us
- careers.snapitsoft.com → Job listings
- contact.snapitsoft.com → Contact form

**snapitsoftware.com** (Product):
- forum.snapitsoftware.com → Forum product
- messenger.snapitsoftware.com → Messenger product
- enterprise.snapitsoftware.com → Enterprise solutions

---

## 🏗️ Proposed Subdomain Allocation

### snapitsoftware.com (Primary - User Product)
| Subdomain | Purpose | Status |
|-----------|---------|--------|
| forum | Main forum/messenger app | ✅ Active |
| auth | OAuth authentication | ✅ Active |
| api | REST API endpoint | ✅ Active |
| ws | WebSocket connections | 🔄 Pending |
| cdn | Static assets (images, CSS, JS) | ✅ Configured |
| ai | AI services integration | ✅ Configured |
| dev | Development environment | ✅ Configured |
| mail | Email services | ✅ Configured |
| pdf | PDF generation service | ✅ Configured |
| www | Redirect to forum | 🔄 Pending |

### snapitsoft.com (Secondary - Developer/Corporate)
| Subdomain | Purpose | Status | Notes |
|-----------|---------|--------|-------|
| www | Corporate homepage | 🆕 Available | Company info, about us |
| api | Public API (mirror or separate) | 🆕 Available | Developer API access |
| docs | API documentation | 🆕 Available | Swagger, tutorials |
| dev | Developer portal | 🆕 Available | API keys, dashboards |
| playground | API testing playground | 🆕 Available | Interactive API explorer |
| status | Uptime status page | 🆕 Available | UptimeRobot integration |
| blog | Developer blog | 🆕 Available | Technical posts, updates |
| cdn | CDN mirror | 🆕 Available | Redundancy for assets |
| download | Software downloads | 🆕 Available | Desktop apps, mobile APKs |
| support | Support center | 🆕 Available | Help docs, ticketing |

---

## 🎨 Branding Considerations

### Domain Names
- **snapitsoftware.com**:
  - Longer but more descriptive
  - Better for SEO (has "software" keyword)
  - More professional/corporate

- **snapitsoft.com**:
  - Shorter, easier to type
  - Better for mobile users
  - More modern/startup vibe

### Recommendation
**Use BOTH strategically**:
1. **Primary**: snapitsoftware.com (main product)
2. **Short URL**: snapitsoft.com (redirects, marketing, QR codes)
3. **SEO**: Keep both for backlinks

---

## 🔒 SSL Certificate Strategy

### Option 1: Separate Certificates
```bash
# snapitsoftware.com
Certificate: *.snapitsoftware.com (wildcard)
ARN: arn:aws:acm:us-east-1:692859945539:certificate/d8cd260b-b196-4d65-9b92-1e58b9a1422b

# snapitsoft.com
Certificate: *.snapitsoft.com (wildcard)
ARN: [Create new wildcard cert]
```

### Option 2: Multi-Domain Certificate (SAN)
```bash
# Single certificate covering both domains
Subject Alternative Names (SAN):
- *.snapitsoftware.com
- snapitsoftware.com
- *.snapitsoft.com
- snapitsoft.com
```

**Recommendation**: Keep separate wildcard certificates (easier management)

---

## 📝 DNS Setup Examples

### Example 1: Mirror Setup (Simple)
```bash
# IONOS DNS for snapitsoft.com

# Forum (mirror)
Type: CNAME
Host: forum
Value: d3jn3i879jxit2.cloudfront.net
TTL: 3600

# API (mirror)
Type: CNAME
Host: api
Value: daihvltpekgq9.cloudfront.net
TTL: 3600

# Root domain redirect
Type: A
Host: @
Value: [IP of redirect service or CloudFront]
TTL: 3600
```

### Example 2: Separate Services
```bash
# snapitsoft.com - Developer Portal

# API Docs
Type: CNAME
Host: docs
Value: [CloudFront distribution for docs site]
TTL: 3600

# Developer Portal
Type: CNAME
Host: dev
Value: [CloudFront distribution for dev portal]
TTL: 3600

# API Playground
Type: CNAME
Host: playground
Value: [CloudFront distribution for API explorer]
TTL: 3600
```

---

## 💡 Use Cases for snapitsoft.com

### 1. Marketing Campaign Short Links
```
Instead of: https://forum.snapitsoftware.com/signup?ref=twitter
Use: https://forum.snapitsoft.com/signup?ref=twitter
```

### 2. QR Codes
```
Shorter domain = simpler QR code
https://snapitsoft.com/app
```

### 3. Social Media Handles
```
Twitter: @snapitsoft (if available, shorter than @snapitsoftware)
GitHub: github.com/snapitsoft
```

### 4. Email Addresses
```
Shorter: support@snapitsoft.com
Longer: support@snapitsoftware.com

Use both, forward to same inbox
```

### 5. App Store Listings
```
Developer: SnapIT Software
Website: snapitsoft.com (shorter for mobile displays)
Support: https://support.snapitsoft.com
```

---

## 🚀 Implementation Roadmap

### Phase 1: Basic Setup (This Week)
1. ✅ Keep snapitsoftware.com as primary
2. 🆕 Set up snapitsoft.com DNS in IONOS
3. 🆕 Create wildcard SSL cert for snapitsoft.com
4. 🆕 Set up forum.snapitsoft.com as redirect to forum.snapitsoftware.com

### Phase 2: Developer Portal (This Month)
5. 🆕 Create docs.snapitsoft.com (API documentation)
6. 🆕 Create dev.snapitsoft.com (developer dashboard)
7. 🆕 Create playground.snapitsoft.com (API tester)

### Phase 3: Corporate Site (Next Month)
8. 🆕 Create www.snapitsoft.com (company homepage)
9. 🆕 Create blog.snapitsoft.com (technical blog)
10. 🆕 Create status.snapitsoft.com (uptime status)

---

## 📊 Cost Analysis

### DNS Hosting (IONOS)
- snapitsoftware.com: Included with domain
- snapitsoft.com: Included with domain
**Cost**: $0 extra

### SSL Certificates (AWS ACM)
- *.snapitsoftware.com: FREE (ACM)
- *.snapitsoft.com: FREE (ACM)
**Cost**: $0

### CloudFront Distributions
- Can reuse same distributions for both domains
- OR create separate for better analytics
**Cost**: ~$0.01 per 10,000 requests (negligible)

### Total Additional Cost
**$0-5 per month** (only if creating duplicate infrastructure)

---

## 🎯 Recommendation

### Immediate Action
**Use snapitsoftware.com as PRIMARY, snapitsoft.com as BACKUP**

1. **Keep all current infrastructure on snapitsoftware.com**
2. **Set up basic redirects on snapitsoft.com**
   - www.snapitsoft.com → forum.snapitsoftware.com
   - forum.snapitsoft.com → forum.snapitsoftware.com
   - api.snapitsoft.com → api.snapitsoftware.com

3. **Future: Expand snapitsoft.com for developer services**
   - docs.snapitsoft.com (API docs)
   - dev.snapitsoft.com (Developer portal)
   - playground.snapitsoft.com (API playground)

### Benefits
- ✅ No wasted domain
- ✅ Backup in case of DNS issues
- ✅ Shorter URLs for marketing
- ✅ Future-proof for service separation

---

## 🔧 Quick Setup Commands

### Create Wildcard SSL for snapitsoft.com
```bash
# Request certificate in ACM
aws acm request-certificate \
  --domain-name "*.snapitsoft.com" \
  --subject-alternative-names "snapitsoft.com" \
  --validation-method DNS \
  --region us-east-1
```

### Set up Simple Redirects
```bash
# Create S3 bucket for redirects
aws s3 mb s3://snapitsoft-redirect --region us-east-1

# Configure as website with redirect
aws s3 website s3://snapitsoft-redirect \
  --index-document index.html \
  --redirect-all-requests-to "https://forum.snapitsoftware.com"

# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name snapitsoft-redirect.s3-website-us-east-1.amazonaws.com \
  --default-root-object index.html
```

---

## 📚 Summary

| Aspect | snapitsoftware.com | snapitsoft.com |
|--------|-------------------|----------------|
| **Purpose** | Primary product domain | Backup/developer domain |
| **Status** | ✅ Fully configured | 🆕 Available for setup |
| **SSL** | ✅ Wildcard cert active | 🆕 Needs cert request |
| **Subdomains** | 10+ configured | All available |
| **Use Case** | User-facing product | Developer tools, corporate |
| **Priority** | PRIMARY | SECONDARY |

---

**Next Step**: Set up basic redirects from snapitsoft.com to snapitsoftware.com as backup, then expand later for developer portal.

**Time Estimate**: 30 minutes
**Cost**: $0 (all AWS free tier)
**Risk**: None (doesn't affect current production)

# 🌐 Custom Domain Mapping - SnapIT Forum

**Current Status**: ✅ **forum.snapitsoftware.com is WORKING**
**DNS Provider**: IONOS
**Last Updated**: October 5, 2025

---

## ✅ Current Configuration

### CloudFront Distribution
- **Distribution ID**: `E1X8SJIRPSICZ4`
- **Default Domain**: `d3jn3i879jxit2.cloudfront.net`
- **Custom Domain**: `forum.snapitsoftware.com` ✅
- **SSL Certificate**: ACM (AWS Certificate Manager)
  - ARN: `arn:aws:acm:us-east-1:692859945539:certificate/d8cd260b-b196-4d65-9b92-1e58b9a1422b`
  - Protocol: TLS 1.2+
  - Status: ✅ Active

### DNS Records (IONOS)
**Current A Records** pointing to CloudFront:
```
forum.snapitsoftware.com → 18.160.152.207
forum.snapitsoftware.com → 18.160.152.147
forum.snapitsoftware.com → 18.160.152.82
forum.snapitsoftware.com → 18.160.152.177
```

**Status**: ✅ **Working correctly**

---

## 🎯 Domain Architecture

### SnapIT Software Domains
```
snapitsoftware.com/
├── www.snapitsoftware.com          # Main website
├── forum.snapitsoftware.com        # ✅ Forum platform (this project)
├── api.snapitsoftware.com          # API endpoints (requires auth)
├── auth.snapitsoftware.com         # OAuth service
└── [other subdomains...]
```

### Forum-Specific Domains
```
forum.snapitsoftware.com
    ├── Frontend: S3 + CloudFront (current)
    ├── API: u25qbry7za.execute-api.us-east-1.amazonaws.com/prod
    └── Future: User subdomains (username.forum.snapitsoftware.com)
```

---

## 🔧 Current Setup (Already Configured)

### 1. CloudFront Configuration ✅
```json
{
  "Aliases": {
    "Quantity": 1,
    "Items": ["forum.snapitsoftware.com"]
  },
  "ViewerCertificate": {
    "ACMCertificateArn": "arn:aws:acm:us-east-1:692859945539:certificate/d8cd260b-b196-4d65-9b92-1e58b9a1422b",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  }
}
```

### 2. IONOS DNS Configuration ✅
**Type**: A Record (Alias to CloudFront)
**Name**: `forum`
**Points to**: CloudFront distribution IPs

---

## 🚀 Future Custom Domain Features

### User Forum Subdomains
**Goal**: Each user gets their own subdomain for their forum

**Example**:
```
alice.forum.snapitsoftware.com  → Alice's forum
bob.forum.snapitsoftware.com    → Bob's forum
company.forum.snapitsoftware.com → Company's forum
```

### Implementation Steps (Future)

#### Option 1: Wildcard Certificate + CloudFront
```bash
# 1. Request wildcard cert in ACM
aws acm request-certificate \
  --domain-name "*.forum.snapitsoftware.com" \
  --validation-method DNS \
  --region us-east-1

# 2. Add CNAME validation record in IONOS
# (AWS will provide the validation record)

# 3. Update CloudFront to use wildcard alias
aws cloudfront update-distribution \
  --id E1X8SJIRPSICZ4 \
  --aliases "*.forum.snapitsoftware.com"
```

#### Option 2: Custom Domain Mapping (Per User)
```bash
# 1. User adds their own domain (e.g., community.example.com)
# 2. We generate SSL cert via ACM
# 3. Create new CloudFront distribution OR use Lambda@Edge for routing
# 4. User updates their DNS to point to CloudFront
```

#### Option 3: Route53 Programmatic DNS (Recommended)
```bash
# 1. Migrate DNS from IONOS to Route53
# 2. Use Lambda to programmatically create DNS records
# 3. Auto-provision SSL certs via ACM
# 4. Scale to thousands of subdomains automatically
```

---

## 📋 IONOS DNS Management

### Access IONOS
1. Login: https://www.ionos.com/
2. Navigate to: Domains & SSL → snapitsoftware.com → DNS

### Current Records (Example)
```
Type    Name    Value                               TTL
A       forum   18.160.152.207                      3600
A       forum   18.160.152.147                      3600
A       forum   18.160.152.82                       3600
A       forum   18.160.152.177                      3600
CNAME   www     snapitsoftware.com                  3600
```

### Add New Subdomain (If Needed)
```
Type: CNAME
Name: newsubdomain
Value: d3jn3i879jxit2.cloudfront.net
TTL: 3600
```

Or use A records to CloudFront IPs (current setup).

---

## 🔐 SSL Certificate Details

### Current Certificate (ACM)
```
ARN: arn:aws:acm:us-east-1:692859945539:certificate/d8cd260b-b196-4d65-9b92-1e58b9a1422b
Status: Issued ✅
Domain: forum.snapitsoftware.com
Validation: DNS (via IONOS)
Auto-renewal: Yes (AWS handles automatically)
```

### Check Certificate Status
```bash
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:692859945539:certificate/d8cd260b-b196-4d65-9b92-1e58b9a1422b \
  --region us-east-1
```

### Request New Certificate (If Needed)
```bash
# For wildcard subdomain support
aws acm request-certificate \
  --domain-name "*.forum.snapitsoftware.com" \
  --domain-name "forum.snapitsoftware.com" \
  --validation-method DNS \
  --region us-east-1

# AWS will output CNAME records to add in IONOS
```

---

## 🧪 Testing Custom Domain

### Test HTTPS
```bash
# Should return 200 OK
curl -I https://forum.snapitsoftware.com

# Check SSL certificate
openssl s_client -connect forum.snapitsoftware.com:443 -servername forum.snapitsoftware.com < /dev/null
```

### Test DNS Resolution
```bash
# Should resolve to CloudFront IPs
nslookup forum.snapitsoftware.com

# Trace DNS path
dig forum.snapitsoftware.com +trace
```

### Test CloudFront Distribution
```bash
# Should match custom domain
curl -I https://d3jn3i879jxit2.cloudfront.net \
  -H "Host: forum.snapitsoftware.com"
```

---

## 🔄 API Custom Domain (api.snapitsoftware.com)

### Current API Endpoint
```
https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod
```

### Future: Custom API Domain
```
https://api.forum.snapitsoftware.com
```

**Benefits**:
- Branded API endpoint
- Better security (hide AWS endpoint)
- Easier to remember

**Setup Steps**:
```bash
# 1. Create custom domain in API Gateway
aws apigateway create-domain-name \
  --domain-name api.forum.snapitsoftware.com \
  --regional-certificate-arn arn:aws:acm:us-east-1:...:certificate/... \
  --endpoint-configuration types=REGIONAL

# 2. Create base path mapping
aws apigateway create-base-path-mapping \
  --domain-name api.forum.snapitsoftware.com \
  --rest-api-id u25qbry7za \
  --stage prod

# 3. Add CNAME in IONOS
# Type: CNAME
# Name: api.forum
# Value: <API Gateway regional domain>
```

---

## 🌍 Multi-Region Setup (Future)

### Global CDN with CloudFront
```
Users                  CloudFront Edge Locations           Origin (S3)
  │                              │                              │
  ├─ US East     ──────────────► Edge: Virginia ──────────────► S3: us-east-1
  ├─ Europe      ──────────────► Edge: Frankfurt ──────────────► (cached)
  ├─ Asia        ──────────────► Edge: Tokyo ─────────────────► (cached)
  └─ Australia   ──────────────► Edge: Sydney ────────────────► (cached)
```

**Already configured!** CloudFront automatically serves from nearest edge.

---

## 📊 DNS Propagation

### After DNS Changes
- **IONOS TTL**: 3600 seconds (1 hour)
- **Global propagation**: 24-48 hours (usually faster)
- **CloudFront cache**: 5-10 minutes

### Check Propagation Status
```bash
# Check from multiple locations
https://dnschecker.org/#A/forum.snapitsoftware.com

# Or use dig from different servers
dig @8.8.8.8 forum.snapitsoftware.com
dig @1.1.1.1 forum.snapitsoftware.com
```

---

## 🚨 Troubleshooting

### Issue 1: Certificate Mismatch
**Symptom**: "Your connection is not private" error

**Solution**:
```bash
# Verify cert includes domain
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:692859945539:certificate/d8cd260b-b196-4d65-9b92-1e58b9a1422b \
  --query 'Certificate.DomainValidationOptions[*].DomainName'

# Should output: ["forum.snapitsoftware.com"]
```

### Issue 2: DNS Not Resolving
**Symptom**: `nslookup` fails or returns wrong IP

**Solution**:
```bash
# 1. Check IONOS DNS settings
# 2. Verify CNAME/A records point to CloudFront
# 3. Wait for TTL expiration (1 hour)
# 4. Clear local DNS cache:
ipconfig /flushdns  # Windows
sudo dscacheutil -flushcache  # Mac
```

### Issue 3: 403 Forbidden
**Symptom**: Page loads but shows CloudFront error

**Solution**:
```bash
# Check S3 bucket policy allows CloudFront
aws s3api get-bucket-policy --bucket snapit-forum-static

# Verify CloudFront origin settings
aws cloudfront get-distribution --id E1X8SJIRPSICZ4 \
  --query 'Distribution.DistributionConfig.Origins'
```

---

## 📝 Custom Domain Checklist

### For forum.snapitsoftware.com ✅
- [x] CloudFront distribution created
- [x] Custom domain alias added
- [x] SSL certificate issued (ACM)
- [x] DNS A records configured (IONOS)
- [x] Certificate validated
- [x] HTTPS working
- [x] Site accessible

### For User Subdomains (Future) 📋
- [ ] Request wildcard SSL (*.forum.snapitsoftware.com)
- [ ] Update CloudFront aliases
- [ ] Add wildcard DNS record in IONOS
- [ ] Implement Lambda@Edge for routing
- [ ] Test subdomain provisioning
- [ ] Add user dashboard for custom domains

### For API Custom Domain (Future) 📋
- [ ] Create API Gateway custom domain
- [ ] Request SSL cert for api.forum.snapitsoftware.com
- [ ] Add CNAME in IONOS
- [ ] Update frontend to use custom API URL
- [ ] Test all API endpoints

---

## 💡 Recommendations

### 1. Migrate to Route53 (Optional)
**Benefits**:
- Programmatic DNS updates (Lambda)
- Auto-scaling subdomains
- Integrated with AWS
- Better automation

**Cost**: ~$0.50/month per hosted zone + $0.40 per million queries

### 2. Use CloudFront Functions
**For**: User subdomain routing without Lambda@Edge

```javascript
// CloudFront Function (cheaper than Lambda@Edge)
function handler(event) {
    var request = event.request;
    var host = request.headers.host.value;

    // Extract subdomain
    var subdomain = host.split('.')[0];

    // Route to S3 path
    request.uri = `/${subdomain}${request.uri}`;

    return request;
}
```

### 3. CDN Optimization
**Already configured!** CloudFront caches at 400+ edge locations globally.

---

## 🎉 Summary

**Current Status**: ✅ **PRODUCTION READY**

- **Main Domain**: https://forum.snapitsoftware.com
- **SSL**: ✅ Valid (TLS 1.2+)
- **DNS**: ✅ Configured in IONOS
- **CDN**: ✅ CloudFront global distribution
- **Performance**: ✅ Optimized with caching

**Next Steps**:
1. Test live site: https://forum.snapitsoftware.com
2. Consider wildcard cert for user subdomains
3. Optionally migrate DNS to Route53 for automation

---

**Last Verified**: October 5, 2025 18:35 UTC

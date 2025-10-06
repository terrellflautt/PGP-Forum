# 🌐 IONOS DNS Configuration - Complete Guide
**Date**: October 6, 2025
**Status**: Ready for DNS Updates

---

## 📋 Quick Copy-Paste CNAME Records

### **SnapIT Forums Ecosystem**

```
# Frontend (Already Configured ✅)
forum.snapitsoftware.com    CNAME    d3jn3i879jxit2.cloudfront.net    3600

# Polls API (NEW - Configure Now)
polls.snapitsoftware.com    CNAME    7nbqiasg8i.execute-api.us-east-1.amazonaws.com    3600

# Burn API (NEW - Configure Now)
burn.snapitsoftware.com     CNAME    gavcsyy3ka.execute-api.us-east-1.amazonaws.com    3600

# Auth API (Optional - Currently using direct endpoint)
auth.snapitsoftware.com     CNAME    u25qbry7za.execute-api.us-east-1.amazonaws.com    3600
```

---

## 🎯 Complete AWS Infrastructure Audit

### **1. Forum Service** ✅ LIVE
**API Gateway ID**: u25qbry7za
**Endpoints**:
- REST API: `https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod`
- WebSocket: `wss://ju482kcu0a.execute-api.us-east-1.amazonaws.com/prod`

**CloudFront**:
- Distribution ID: E1X8SJIRPSICZ4
- Domain: d3jn3i879jxit2.cloudfront.net
- Alias: forum.snapitsoftware.com ✅
- Origin: snapit-forum-static.s3-website-us-east-1.amazonaws.com

**Lambda Functions** (48 total):
- Authentication: googleAuth, googleCallback, refreshToken, **registerWithEmail** (NEW)
- Email Auth: verifyEmail, setPassword, emailPasswordLogin, requestPasswordReset, resetPassword
- Forums: getForums, createForum, getForum, getCategories, createCategory
- Threads: getThreads, createThread, getThread, getPosts, createPost, votePost
- Messages: getMessages, sendMessage, sendAnonymousMessage, getConversations
- Users: getMe, getUser, updateUser, setUsername, checkUsername, getPublicProfile
- Payments: createCheckoutSession, createPortalSession, createDonationSession, stripeWebhook
- WebRTC: webrtcConnect, webrtcDisconnect, webrtcDiscoverRelays, webrtcAdvertiseRelay, webrtcIceCandidate, webrtcOffer, webrtcAnswer, webrtcGetPeerKey, webrtcDefault
- Utilities: authorizer, emailForwarder

**DynamoDB Tables**:
- snapit-forum-users-prod
- snapit-forum-forums-prod
- snapit-forum-members-prod
- snapit-forum-categories-prod
- snapit-forum-threads-prod
- snapit-forum-posts-prod
- snapit-forum-messages-prod

**S3 Buckets**:
- snapit-forum-static (React frontend)
- snapitsoftware-ses-emails (Email forwarding)

---

### **2. Polls Service** ✅ DEPLOYED (Needs DNS)
**API Gateway ID**: 7nbqiasg8i
**Endpoint**: `https://7nbqiasg8i.execute-api.us-east-1.amazonaws.com/prod`

**Lambda Functions** (7):
- authorizer
- createPoll
- getPoll
- listPolls
- deletePoll
- vote
- getResults

**DynamoDB Tables**:
- snapit-polls-api-polls-prod
- snapit-polls-api-votes-prod

**Available Routes**:
```
POST   /polls                 - Create poll (auth required)
GET    /polls/{pollId}        - Get poll details
GET    /polls                 - List user's polls (auth required)
DELETE /polls/{pollId}        - Delete poll (auth required)
POST   /polls/{pollId}/vote   - Cast vote (auth required)
GET    /polls/{pollId}/results - Get results
```

**DNS Configuration Needed**:
```
Type: CNAME
Name: polls
Value: 7nbqiasg8i.execute-api.us-east-1.amazonaws.com
TTL: 3600
```

---

### **3. Burn Service** ✅ DEPLOYED (Needs DNS)
**API Gateway ID**: gavcsyy3ka
**Endpoint**: `https://gavcsyy3ka.execute-api.us-east-1.amazonaws.com/prod`

**Lambda Functions** (6):
- authorizer
- upload
- getBurn
- download
- listBurns
- deleteBurn

**DynamoDB Tables**:
- snapit-burn-api-burns-prod
- snapit-burn-api-downloads-prod

**S3 Bucket**:
- snapit-burn-api-files-prod

**Available Routes**:
```
POST   /upload                - Upload file (generates presigned S3 URL)
GET    /burns/{burnId}        - Get file metadata
POST   /burns/{burnId}/download - Download file (password check)
GET    /burns                 - List user's burns (auth required)
DELETE /burns/{burnId}        - Delete burn (auth required)
```

**DNS Configuration Needed**:
```
Type: CNAME
Name: burn
Value: gavcsyy3ka.execute-api.us-east-1.amazonaws.com
TTL: 3600
```

---

## 🔧 Step-by-Step IONOS Configuration

### **Option 1: Quick Setup (Recommended)**
Use direct API Gateway CNAMEs for immediate functionality.

#### **1. Log into IONOS DNS Management**
- Go to domains.ionos.com
- Select snapitsoftware.com
- Click DNS Settings

#### **2. Add Polls CNAME**
```
Type: CNAME
Name: polls
Points to: 7nbqiasg8i.execute-api.us-east-1.amazonaws.com
TTL: 1 Hour (3600)
```

#### **3. Add Burn CNAME**
```
Type: CNAME
Name: burn
Points to: gavcsyy3ka.execute-api.us-east-1.amazonaws.com
TTL: 1 Hour (3600)
```

#### **4. (Optional) Update Auth CNAME**
```
Type: CNAME
Name: auth
Points to: u25qbry7za.execute-api.us-east-1.amazonaws.com
TTL: 1 Hour (3600)
```

**Wait Time**: 5-15 minutes for DNS propagation

---

### **Option 2: Custom Domain with ACM Certificate (Professional)**
Better for production, requires more setup.

#### **Step 1: Request ACM Certificates**
```bash
# Polls certificate
aws acm request-certificate \
  --domain-name polls.snapitsoftware.com \
  --validation-method DNS \
  --region us-east-1

# Burn certificate
aws acm request-certificate \
  --domain-name burn.snapitsoftware.com \
  --validation-method DNS \
  --region us-east-1
```

#### **Step 2: Validate Certificates in IONOS**
AWS will provide CNAME records for validation. Add them to IONOS DNS.

#### **Step 3: Create API Gateway Custom Domains**
```bash
# Get certificate ARN from AWS Console or:
aws acm list-certificates --region us-east-1

# Create custom domain for Polls
aws apigateway create-domain-name \
  --domain-name polls.snapitsoftware.com \
  --regional-certificate-arn arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT_ID \
  --endpoint-configuration types=REGIONAL \
  --region us-east-1

# Create custom domain for Burn
aws apigateway create-domain-name \
  --domain-name burn.snapitsoftware.com \
  --regional-certificate-arn arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT_ID \
  --endpoint-configuration types=REGIONAL \
  --region us-east-1
```

#### **Step 4: Get Target Domain Names**
```bash
aws apigateway get-domain-name \
  --domain-name polls.snapitsoftware.com \
  --region us-east-1

aws apigateway get-domain-name \
  --domain-name burn.snapitsoftware.com \
  --region us-east-1
```

Use the `regionalDomainName` values in IONOS.

---

## 🔍 Verify Configuration

### **Test Polls API**
```bash
# Should return 401 (correct - auth required)
curl https://polls.snapitsoftware.com/polls

# With token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://polls.snapitsoftware.com/polls
```

### **Test Burn API**
```bash
# Should return 401 (correct - auth required)
curl https://burn.snapitsoftware.com/burns

# With token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://burn.snapitsoftware.com/burns
```

### **Test Forum (Already Working)**
```bash
# Should return HTML
curl https://forum.snapitsoftware.com

# Test API endpoint
curl https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/users/check-username?username=test
```

---

## 📊 Current DNS Records (Before Changes)

From your IONOS account:

### **Already Configured ✅**
```
forum.snapitsoftware.com      → CloudFront (E1X8SJIRPSICZ4)
poll.snapitsoftware.com       → 18.160.152.82 (Old IP - can remove)
polls.snapitsoftware.com      → 18.160.152.82 (Old IP - needs update)
burn.snapitsoftware.com       → 18.160.152.82 (Old IP - needs update)
```

### **Recommended Changes**
```
# Keep this (Forum frontend)
forum.snapitsoftware.com      CNAME    d3jn3i879jxit2.cloudfront.net

# Update these
polls.snapitsoftware.com      CNAME    7nbqiasg8i.execute-api.us-east-1.amazonaws.com
burn.snapitsoftware.com       CNAME    gavcsyy3ka.execute-api.us-east-1.amazonaws.com

# Optional: Remove poll (singular) subdomain if not needed
poll.snapitsoftware.com       (delete or change to polls CNAME)
```

---

## 🔐 Authentication Flow

All three services use **shared JWT authentication**:

1. User signs in at `forum.snapitsoftware.com`
2. Receives JWT token (7-day expiry)
3. Token works across all services:
   - Forum: u25qbry7za.execute-api.us-east-1.amazonaws.com
   - Polls: 7nbqiasg8i.execute-api.us-east-1.amazonaws.com
   - Burn: gavcsyy3ka.execute-api.us-east-1.amazonaws.com
4. Same @username namespace across all services

**Token Format**:
```json
{
  "userId": "google_102847562183746521983",
  "email": "user@gmail.com",
  "exp": 1696789234
}
```

**Validation**: Each service has its own `authorizer` Lambda that validates the JWT using the shared `JWT_SECRET` from SSM Parameter Store.

---

## 🚀 Deployment Timeline

### **Today (October 6, 2025)**

**✅ Completed**:
1. Forum backend deployed (48 Lambda functions)
2. Email registration endpoint added
3. Polls backend deployed (7 Lambda functions)
4. Burn backend deployed (6 Lambda functions)
5. React frontend rebuilt with @username display
6. Landing page updated with Polls/Burn cards
7. GitHub repos updated (main + production branches)

**🔄 In Progress**:
- DNS configuration (awaiting IONOS updates)

**⏳ Pending**:
- Test email registration with ProtonMail
- Build Polls React frontend
- Build Burn React frontend
- Configure Amazon SES domain verification
- Move SES out of sandbox mode

---

## 📝 Next Steps Checklist

### **Immediate (Next 5 minutes)**
- [ ] Log into IONOS DNS management
- [ ] Add `polls` CNAME record
- [ ] Add `burn` CNAME record
- [ ] Save DNS changes

### **Short Term (Next 30 minutes)**
- [ ] Wait for DNS propagation (5-15 minutes)
- [ ] Test polls.snapitsoftware.com endpoint
- [ ] Test burn.snapitsoftware.com endpoint
- [ ] Verify forum.snapitsoftware.com still works

### **Medium Term (Next Week)**
- [ ] Build Polls React frontend
- [ ] Build Burn React frontend
- [ ] Test email registration with ProtonMail account
- [ ] Configure SES domain verification
- [ ] Request SES production access

### **Long Term (Future)**
- [ ] Add Dead Man's Switch notifications
- [ ] Implement email notifications for new messages
- [ ] Add email preferences to user settings
- [ ] Create API documentation portal
- [ ] Set up monitoring and alerting

---

## 🎯 Success Criteria

After DNS configuration:

✅ **Forum**: https://forum.snapitsoftware.com
- Landing page visible
- User can sign in with Google
- User can register with email
- User can set @username
- Forum auto-created

✅ **Polls**: https://polls.snapitsoftware.com
- Endpoint responds (401 without auth)
- Can create poll with token
- Can vote on poll
- Results displayed

✅ **Burn**: https://burn.snapitsoftware.com
- Endpoint responds (401 without auth)
- Can upload file with token
- File auto-deletes after download
- Password protection works

---

## 🔧 Troubleshooting

### **"DNS_PROBE_FINISHED_NXDOMAIN"**
- DNS hasn't propagated yet (wait 15 min)
- CNAME record incorrect (double-check spelling)
- TTL too high (use 3600 or lower)

### **"SSL Certificate Error"**
- Using Option 1 (direct CNAME): API Gateway provides valid cert automatically
- Using Option 2 (custom domain): Need ACM certificate first

### **"403 Forbidden"**
- Correct! Means endpoint is working but needs authentication
- Get JWT token from forum.snapitsoftware.com login
- Include in request: `Authorization: Bearer TOKEN`

### **"502 Bad Gateway"**
- Lambda cold start (wait 5-10 seconds, retry)
- Check CloudWatch Logs for Lambda errors
- Verify authorizer Lambda has correct JWT_SECRET

---

## 📞 Support Resources

**AWS Resources**:
- CloudWatch Logs: Monitor Lambda errors
- API Gateway Console: Check endpoint configuration
- CloudFront Console: Verify distribution settings
- ACM Console: Manage SSL certificates

**DNS Tools**:
- `dig polls.snapitsoftware.com` - Check DNS resolution
- `nslookup burn.snapitsoftware.com` - Verify CNAME
- https://dnschecker.org - Global DNS propagation

**Contact**:
- Email: snapitsoft@gmail.com
- Support: support@snapitsoftware.com
- GitHub: https://github.com/terrellflautt/PGP-Forum

---

**Last Updated**: October 6, 2025 at 4:25 PM EST
**Prepared By**: Claude Code
**Status**: Ready for IONOS DNS configuration

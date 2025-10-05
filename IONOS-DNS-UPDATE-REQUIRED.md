# 🌐 IONOS DNS Updates Required

**Issue**: Currently using A records (IP addresses) instead of CNAME records
**Impact**: API subdomain won't work correctly
**Fix Time**: 5 minutes

---

## ⚠️ Current Problem

Your IONOS DNS is configured with **A records** (IP addresses):
```
api.snapitsoftware.com → 18.160.152.147, 18.160.152.82, etc.
```

But it should use **CNAME records** (domain names) to point to AWS services:
```
api.snapitsoftware.com → daihvltpekgq9.cloudfront.net
```

---

## 🔧 Required DNS Changes in IONOS

Login to IONOS DNS management for **snapitsoftware.com**:

### 1. **api.snapitsoftware.com** ⚠️ NEEDS UPDATE

**Current**: A record pointing to IP addresses
**Should be**: CNAME record

**Delete**:
```
Type: A
Host: api
Value: 18.160.152.177 (and other IPs)
```

**Add**:
```
Type: CNAME
Host: api
Value: daihvltpekgq9.cloudfront.net
TTL: 3600
```

---

### 2. **forum.snapitsoftware.com** ✅ CHECK IF CORRECT

**Should be** (not IP addresses):
```
Type: CNAME
Host: forum
Value: d3jn3i879jxit2.cloudfront.net
TTL: 3600
```

**If it's currently A records**, delete them and add CNAME above.

---

### 3. **auth.snapitsoftware.com** ✅ ALREADY WORKING

According to your earlier screenshot, this is already set up correctly:
```
Type: CNAME
Host: auth
Value: d3subwck9bx4ea.cloudfront.net
TTL: 3600
```

Keep this as is! ✅

---

### 4. **cdn.snapitsoftware.com** ⚠️ CHECK CURRENT SETUP

If it shows IP addresses, change to CNAME.

We'll need to create a CloudFront distribution for CDN later, but for now you can:
- **Option A**: Point to same as forum: `d3jn3i879jxit2.cloudfront.net`
- **Option B**: Leave as is until we set up dedicated CDN

---

### 5. **Other Subdomains** (Optional)

These can stay as-is for now:
- **ai.snapitsoftware.com** - Keep current config
- **dev.snapitsoftware.com** - Keep current config
- **mail.snapitsoftware.com** - Keep current config
- **pdf.snapitsoftware.com** - Keep current config
- **www.snapitsoftware.com** - Keep current config

---

## 📋 Step-by-Step: Update DNS in IONOS

### Step 1: Login to IONOS
1. Go to https://www.ionos.com/
2. Login to your account
3. Navigate to **Domains & SSL**
4. Click on **snapitsoftware.com**
5. Click **DNS** or **Manage DNS**

---

### Step 2: Update api.snapitsoftware.com

#### Delete Old A Records
1. Find **api** subdomain
2. Look for **A** records with IP addresses
3. Click **Delete** or trash icon for each one:
   - 18.160.152.147
   - 18.160.152.82
   - 18.160.152.177
   - 18.160.152.207

#### Add New CNAME Record
1. Click **Add Record** or **+ Add DNS Record**
2. Fill in:
   ```
   Type: CNAME
   Host/Name: api
   Points to/Value: daihvltpekgq9.cloudfront.net
   TTL: 3600 (or Auto)
   ```
3. Click **Save**

---

### Step 3: Update forum.snapitsoftware.com (if needed)

#### Check Current Setup
- If it's **A records** with IP addresses → Delete them
- If it's **CNAME** to `d3jn3i879jxit2.cloudfront.net` → Keep it! ✅

#### If A Records (needs fixing):
1. Delete all A records for **forum**
2. Add new CNAME:
   ```
   Type: CNAME
   Host: forum
   Value: d3jn3i879jxit2.cloudfront.net
   TTL: 3600
   ```

---

### Step 4: Verify auth.snapitsoftware.com

Should already be correct:
```
Type: CNAME
Host: auth
Value: d3subwck9bx4ea.cloudfront.net
```

If it's A records, fix it to match above.

---

## ⏱️ DNS Propagation

After making changes:
- **Immediate**: IONOS updates (1-5 minutes)
- **Full propagation**: 10-60 minutes worldwide
- **TTL**: If old TTL was 3600 (1 hour), may take up to 1 hour

---

## ✅ How to Test After Changes

### Test 1: Check DNS Resolution
```bash
# Should return CloudFront domain, not IP addresses
dig api.snapitsoftware.com +short

# Expected output:
# daihvltpekgq9.cloudfront.net
# 13.x.x.x (CloudFront IP - changes dynamically)
# 13.x.x.x
# 13.x.x.x
```

### Test 2: Check API Endpoint
```bash
# Should return 403 (forbidden without auth token) - this is GOOD
curl -I https://api.snapitsoftware.com/forums

# Expected:
# HTTP/2 403
# x-amz-apigw-id: ...
```

### Test 3: Check Forum
```bash
# Should load the frontend
curl -I https://forum.snapitsoftware.com

# Expected:
# HTTP/2 200
# content-type: text/html
```

---

## 🎯 Summary: What to Change

| Subdomain | Current (Wrong) | Should Be (Correct) |
|-----------|----------------|---------------------|
| **api** | A → 18.160.152.177 | CNAME → daihvltpekgq9.cloudfront.net |
| **forum** | A → 18.160.152.147 | CNAME → d3jn3i879jxit2.cloudfront.net |
| **auth** | ✅ CNAME (correct) | No change needed |

---

## 🤔 Why CNAME Instead of A Records?

### A Records (IP Addresses)
- ❌ AWS IPs change dynamically
- ❌ If AWS changes IP, your site breaks
- ❌ Can't use CloudFront features
- ❌ No automatic failover

### CNAME Records (Domain Names)
- ✅ AWS manages IP changes automatically
- ✅ CloudFront handles failover
- ✅ Better performance (global CDN)
- ✅ Automatic SSL/TLS

---

## 📸 Screenshot Guide

When you're in IONOS DNS management, you should see:

**Before (Wrong)**:
```
Type    Host    Value                TTL
A       api     18.160.152.177       3600
A       api     18.160.152.82        3600
A       api     18.160.152.147       3600
```

**After (Correct)**:
```
Type    Host    Value                              TTL
CNAME   api     daihvltpekgq9.cloudfront.net      3600
CNAME   forum   d3jn3i879jxit2.cloudfront.net     3600
CNAME   auth    d3subwck9bx4ea.cloudfront.net     3600
```

---

## 🚨 Common Mistakes to Avoid

1. **Don't add "https://" in CNAME value**
   - ❌ Wrong: `https://daihvltpekgq9.cloudfront.net`
   - ✅ Right: `daihvltpekgq9.cloudfront.net`

2. **Don't add trailing dot unless IONOS requires it**
   - ❌ Wrong: `daihvltpekgq9.cloudfront.net.`
   - ✅ Right: `daihvltpekgq9.cloudfront.net`
   - (Some DNS systems auto-add the dot)

3. **Don't mix A and CNAME records for same host**
   - ❌ Wrong: Both A and CNAME for api.snapitsoftware.com
   - ✅ Right: Only CNAME for api.snapitsoftware.com

4. **Don't forget to delete old A records**
   - Delete ALL A records before adding CNAME

---

## 🆘 If Something Goes Wrong

### Site stops working after DNS change
**Wait 10-60 minutes for DNS propagation**

### Still not working after 1 hour
```bash
# Check what DNS is returning
dig api.snapitsoftware.com

# Check if CloudFront is responding
curl -I https://daihvltpekgq9.cloudfront.net

# Check CloudWatch logs
aws logs tail /aws/lambda/snapit-forum-api-prod-getForums --follow
```

### Need to rollback
1. Go back to IONOS DNS
2. Delete CNAME record
3. Re-add the old A records (write them down first!)

---

## ⏰ Timeline

| Time | Action |
|------|--------|
| **Now** | Update DNS in IONOS (5 mins) |
| **+5 mins** | IONOS updates their nameservers |
| **+10 mins** | Test with `dig` command |
| **+30 mins** | Should be working globally |
| **+60 mins** | Fully propagated worldwide |

---

## ✅ Final Checklist

Before making changes:
- [ ] Write down current A record IPs (backup)
- [ ] Have CNAME values ready (see summary above)
- [ ] Know how to access IONOS DNS management

Making changes:
- [ ] Delete ALL A records for api subdomain
- [ ] Add CNAME record for api → daihvltpekgq9.cloudfront.net
- [ ] Check forum subdomain (should be CNAME to d3jn3i879jxit2.cloudfront.net)
- [ ] Verify auth subdomain is still correct
- [ ] Save all changes

After changes:
- [ ] Wait 10 minutes
- [ ] Test with `dig api.snapitsoftware.com`
- [ ] Test API: `curl -I https://api.snapitsoftware.com/forums`
- [ ] Test forum: Visit https://forum.snapitsoftware.com
- [ ] Verify everything works

---

**Once you update the DNS, it should "just work" after 10-60 minutes of propagation!** 🎉

The reason you're seeing IP addresses now is that IONOS added A records instead of CNAME records when you created the subdomains. This is a common default behavior, but for AWS services (CloudFront, API Gateway) you **must** use CNAME records.

---

**Need help?** Let me know which subdomains show A records vs CNAME records and I can give you the exact values to change!

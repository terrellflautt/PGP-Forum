# 🌐 Route 53 DNS Migration for snapitsoftware.com

**Created**: October 6, 2025
**Status**: Route 53 configured, awaiting nameserver update in IONOS

---

## ✅ **What's Been Done**

1. **Created Route 53 Hosted Zone**: `Z03819772WUPF0F3UBSSR`
2. **Added DNS Records**:
   - ✅ `snapitsoftware.com` → ALIAS to CloudFront (d2vn5kjriuo02i.cloudfront.net)
   - ✅ `www.snapitsoftware.com` → ALIAS to CloudFront
   - ✅ `forum.snapitsoftware.com` → CNAME to CloudFront (d3jn3i879jxit2.cloudfront.net)
   - ✅ `polls.snapitsoftware.com` → CNAME to API Gateway
   - ✅ `poll.snapitsoftware.com` → CNAME to API Gateway
   - ✅ `burn.snapitsoftware.com` → CNAME to API Gateway

---

## 📋 **Next Steps: Update Nameservers in IONOS**

### **IMPORTANT: Update these nameservers in IONOS DNS:**

```
ns-19.awsdns-02.com
ns-596.awsdns-10.net
ns-1203.awsdns-22.org
ns-1771.awsdns-29.co.uk
```

### **How to Update in IONOS:**

1. Log into your IONOS account
2. Go to **Domains & SSL**
3. Click on **snapitsoftware.com**
4. Find **Nameservers** section
5. Click **Edit** or **Change Nameservers**
6. Select **Custom Nameservers** (not IONOS nameservers)
7. Enter the 4 nameservers above (one per line)
8. Save changes

---

## ⏱️ **DNS Propagation Timeline**

- **Immediate**: Route 53 records are live
- **1-2 hours**: Most users will see new DNS
- **24-48 hours**: Full global propagation
- **Old DNS TTL**: Current records may cache for up to 24 hours

---

## 🎯 **Benefits of Route 53**

✅ **No more downtime** - ALIAS records automatically track CloudFront IPs
✅ **Root domain support** - ALIAS works on @ record (not possible with IONOS)
✅ **Automatic failover** - AWS handles CloudFront IP rotation
✅ **Cost**: ~$0.50/month + $0.40 per million queries
✅ **AWS integration** - Native support for CloudFront, API Gateway, etc.

---

## 🔍 **How to Verify It's Working**

After updating nameservers, check:

```bash
# Check nameservers (should show awsdns servers)
dig NS snapitsoftware.com +short

# Check main site resolves
dig snapitsoftware.com +short

# Check forum subdomain
dig forum.snapitsoftware.com +short
```

Or use online tool: https://dnschecker.org

---

## 🚨 **Important Notes**

1. **Don't delete IONOS DNS yet** - Wait until propagation completes (48 hours)
2. **Email records** - If you have MX/TXT records in IONOS, we need to add them to Route 53
3. **Subdomains** - Any other subdomains in IONOS need to be migrated to Route 53
4. **Certificate validation** - If using SSL cert verification via DNS, those TXT records need migration

---

## 📊 **Current Route 53 Configuration**

### Root Domain (snapitsoftware.com)
- **Type**: A (ALIAS)
- **Target**: d2vn5kjriuo02i.cloudfront.net
- **CloudFront Distribution**: E7K3NM4P1LTYR
- **S3 Origin**: snapitsoftware-com bucket

### Subdomains
| Subdomain | Type | Target | Purpose |
|-----------|------|--------|---------|
| www | A (ALIAS) | d2vn5kjriuo02i.cloudfront.net | Main site |
| forum | CNAME | d3jn3i879jxit2.cloudfront.net | Forum app |
| polls | CNAME | 7nbqiasg8i.execute-api... | Polls API |
| poll | CNAME | 7nbqiasg8i.execute-api... | Polls API (alias) |
| burn | CNAME | gavcsyy3ka.execute-api... | Burn API |

---

## 🔄 **Future Subdomains to Add**

When ready, add these via Route 53:

```bash
# Forums SaaS management
forums.snapitsoftware.com → CNAME → d3jn3i879jxit2.cloudfront.net

# PGP Messenger standalone
chimera.snapitsoftware.com → CNAME → [TBD - new CloudFront]

# Main API
api.snapitsoftware.com → CNAME → u25qbry7za.execute-api.us-east-1.amazonaws.com

# Unified app (future)
app.snapitsoftware.com → CNAME → [TBD]

# Wildcard for user forums
*.snapitsoftware.com → CNAME → d3jn3i879jxit2.cloudfront.net
```

---

## 💰 **Route 53 Pricing**

- **Hosted Zone**: $0.50/month
- **Queries**: $0.40 per million queries
  - First billion queries: $0.40 per million
  - After 1 billion: decreasing rates

**Estimated Cost**: $1-2/month for typical usage

---

## 🛠️ **Troubleshooting**

### If snapitsoftware.com still doesn't work after 48 hours:

1. **Verify nameservers updated**:
   ```bash
   dig NS snapitsoftware.com +short
   ```
   Should show `awsdns` servers

2. **Check DNS propagation**:
   https://www.whatsmydns.net/#NS/snapitsoftware.com

3. **CloudFront certificate**:
   - Ensure E7K3NM4P1LTYR has valid SSL cert
   - Certificate must include snapitsoftware.com and www.snapitsoftware.com

4. **S3 bucket permissions**:
   - Verify bucket policy allows CloudFront access

---

## ✅ **Completed**

- [x] Created Route 53 hosted zone
- [x] Added ALIAS records for root domain
- [x] Added CNAME records for subdomains
- [x] Documented nameserver update process

## ⏳ **Pending**

- [ ] Update nameservers in IONOS (USER ACTION REQUIRED)
- [ ] Wait for DNS propagation (24-48 hours)
- [ ] Verify all domains working
- [ ] Delete old IONOS DNS records (after verification)

---

**Questions?** The nameservers are ready, just need to be updated in IONOS!

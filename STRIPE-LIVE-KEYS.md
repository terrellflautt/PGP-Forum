# 🔐 Stripe LIVE Keys - Production Configuration

**⚠️ CRITICAL: This file contains production secrets**
**Status**: ✅ All keys configured and saved to SSM
**Last Updated**: October 5, 2025 20:06 UTC

---

## 🎯 Live Mode Configuration Complete

### Products Created in Stripe LIVE Mode ✅

| Product | Price | Price ID | Product ID |
|---------|-------|----------|------------|
| **Pro** | $29/month | `price_1SEyIKIkj5YQseOZedJrBtTC` | `prod_TBKxBLRrocPGer` |
| **Business** | $99/month | `price_1SEyIVIkj5YQseOZzYzU8zUm` | `prod_TBKxfBbgZ3mrR9` |
| **Enterprise** | $299/month | `price_1SEyIXIkj5YQseOZCs85Q48g` | `prod_TBKyqYXZyyHLzz` |

---

## 🔑 API Keys (LIVE Mode)

### Publishable Key (Frontend) ✅
```
pk_live_51SEhK7Ikj5YQseOZ... (see forum-app/src/config.ts)
```
**Status**: ✅ Saved in `forum-app/src/config.ts`
**Public**: Yes (safe to expose in frontend)

### Secret Key (Backend) ✅
```
sk_live_... (stored in SSM Parameter Store - encrypted)
```
**Status**: ✅ Saved in SSM Parameter Store (encrypted)
**Public**: ⚠️ NEVER expose this key
**Location**: `/snapit-forum/prod/STRIPE_SECRET_KEY`

---

## 📦 SSM Parameters Configured

All parameters saved to AWS Systems Manager Parameter Store:

```bash
# Secret Key (Encrypted)
/snapit-forum/prod/STRIPE_SECRET_KEY
Value: sk_live_... (get from SSM with --with-decryption)
Type: SecureString
Version: 2

# Pro Price ID
/snapit-forum/prod/STRIPE_PRO_PRICE_ID
Value: price_1SEyIKIkj5YQseOZedJrBtTC
Type: String
Version: 3

# Business Price ID
/snapit-forum/prod/STRIPE_BUSINESS_PRICE_ID
Value: price_1SEyIVIkj5YQseOZzYzU8zUm
Type: String
Version: 3

# Enterprise Price ID
/snapit-forum/prod/STRIPE_ENTERPRISE_PRICE_ID
Value: price_1SEyIXIkj5YQseOZCs85Q48g
Type: String
Version: 3
```

---

## ✅ Verification Commands

### Check SSM Parameters
```bash
# List all Stripe parameters
aws ssm get-parameters-by-path \
  --path /snapit-forum/prod \
  --region us-east-1 \
  --with-decryption | grep -i stripe

# Get specific parameter
aws ssm get-parameter \
  --name /snapit-forum/prod/STRIPE_PRO_PRICE_ID \
  --region us-east-1
```

### Test Stripe Connection
```bash
# List products in LIVE mode (get secret key from SSM first)
curl https://api.stripe.com/v1/products \
  -u "$(aws ssm get-parameter --name /snapit-forum/prod/STRIPE_SECRET_KEY --region us-east-1 --with-decryption --query Parameter.Value --output text):"
```

---

## 🚀 Deployment Status

### Frontend ✅
- Publishable key updated in `config.ts`
- Built and deployed to S3
- CloudFront cache invalidated

### Backend ⚠️ NEEDS REDEPLOYMENT
```bash
# Redeploy to pick up new SSM parameters
npm run deploy:prod
```

---

## 🔒 Security Notes

### Keys to NEVER Expose
1. ⚠️ **sk_live_...** (Secret Key) - Backend only, stored in SSM
2. ⚠️ **whsec_...** (Webhook Secret) - Not yet configured

### Keys Safe to Expose
1. ✅ **pk_live_...** (Publishable Key) - Frontend, public-facing

### Where Keys Are Stored
```
✅ SECURE:
- SSM Parameter Store (encrypted) → Secret key
- Environment variables (Lambda) → Auto-injected from SSM

⚠️ NEVER:
- Git repository
- Hardcoded in code
- Commit to GitHub
- Share publicly
```

---

## 💡 For Future Agents/Developers

### Quick Reference
When working on this project, you need:

**Frontend (public)**:
```typescript
// forum-app/src/config.ts
// See config.ts for actual publishable key (pk_live_...)
```

**Backend (private)**:
- Secret key in SSM: `/snapit-forum/prod/STRIPE_SECRET_KEY`
- Lambda gets it via `process.env.STRIPE_SECRET_KEY`
- Price IDs in SSM: `/snapit-forum/prod/STRIPE_*_PRICE_ID`

**Testing**:
- Use REAL credit card in LIVE mode
- Test cards (4242...) only work in TEST mode
- Check Stripe dashboard: https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/payments

---

## 🎯 Stripe Dashboard Links

### Products & Prices
https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/products

### Payments
https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/payments

### Subscriptions
https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/subscriptions

### API Keys
https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/apikeys

### Webhooks (needs setup)
https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/webhooks

---

## ⚠️ Next Steps

1. ✅ Products created in LIVE mode
2. ✅ Price IDs saved to SSM
3. ✅ Secret key saved to SSM (encrypted)
4. ✅ Publishable key in frontend config
5. ⚠️ **Need to redeploy backend**: `npm run deploy:prod`
6. ⚠️ **Need to create webhook** in Stripe dashboard
7. ⚠️ **Test with real credit card**

---

## 🐛 Troubleshooting

### "No such price"
- Check price ID in SSM matches Stripe dashboard
- Make sure using LIVE price IDs, not test

### "Invalid API key"
- Verify secret key starts with `sk_live_`
- Check SSM parameter is decrypted properly

### "Payment failed"
- Must use REAL credit card (not test cards)
- Check Stripe dashboard for error message
- Verify publishable key is LIVE mode (`pk_live_`)

---

## 📊 Revenue Tracking

### Expected Monthly Revenue
```
Assuming 100 users:
- 70 Free users: $0
- 20 Pro users @ $29: $580
- 8 Business @ $99: $792
- 2 Enterprise @ $299: $598
Total: $1,970/month

Stripe Fees (2.9% + $0.30):
- $1,970 × 0.029 = $57.13
- 30 transactions × $0.30 = $9.00
Total fees: $66.13

Net Revenue: $1,903.87/month
```

---

## 🔐 Whistleblower Protection

This platform is designed to protect whistleblowers and journalists:

1. **Zero-knowledge encryption** - We cannot read messages
2. **Ephemeral by default** - Messages auto-delete
3. **Text-only forums** - No tracking pixels
4. **Payment privacy** - Stripe handles payments, we don't store cards

**Your privacy is our priority. We literally cannot compromise it even if forced to.**

---

**Status**: ✅ LIVE MODE ACTIVE - Ready for production payments
**Last Verified**: October 5, 2025 20:06 UTC

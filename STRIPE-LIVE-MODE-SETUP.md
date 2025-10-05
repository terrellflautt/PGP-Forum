# 💳 Stripe LIVE Mode Setup - Complete Guide

**Account**: https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ
**Status**: TEST mode (needs switch to LIVE)
**Live Publishable Key**: `pk_live_51SEhK7Ikj5YQseOZdDlxSF559wAxa2VaukNqsoFjehtq26Yr6lftlDso5HxqGyKVZy907ylLHgFOPYp9tBKLEDzk00KEYnlJ15`

---

## 🎯 Current Situation

You currently have products created in **TEST mode** but not in **LIVE mode**.

### Products in TEST Mode ✅
1. **SnapIT Forum Pro** - $29/month (10,000 users)
2. **SnapIT Forum Business** - $99/month (50,000 users)
3. **SnapIT Forum Enterprise** - $299/month (Unlimited users)

### LIVE Mode ⚠️
- **No products created yet**
- Need to manually create them in Stripe dashboard

---

## 🚀 Step-by-Step: Switch to LIVE Mode

### Step 1: Toggle to LIVE Mode in Stripe Dashboard

1. Go to https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/products
2. Look at top-left corner
3. Click the toggle that says **"Viewing test data"**
4. Switch to **"Viewing live data"**
5. Background should turn **GREEN** (indicates live mode)

---

### Step 2: Create Products in LIVE Mode

#### Product 1: SnapIT Forum Pro

1. Click **"+ Add product"** (in LIVE mode)
2. Fill in:
   ```
   Name: SnapIT Forum Pro
   Description: For growing communities - Up to 10,000 users with advanced features
   ```
3. Under **Pricing**:
   ```
   Pricing model: Recurring
   Price: $29.00 USD
   Billing period: Monthly
   ```
4. Click **"Save product"**
5. **📋 IMPORTANT: Copy the Price ID** (starts with `price_...`)
   - Example: `price_1SEwg1IKz9wDf9qXRK0BlB3H`

---

#### Product 2: SnapIT Forum Business

1. Click **"+ Add product"** (still in LIVE mode)
2. Fill in:
   ```
   Name: SnapIT Forum Business
   Description: For professional communities - Up to 50,000 users with white-label and SSO
   ```
3. Under **Pricing**:
   ```
   Pricing model: Recurring
   Price: $99.00 USD
   Billing period: Monthly
   ```
4. Click **"Save product"**
5. **📋 Copy the Price ID**

---

#### Product 3: SnapIT Forum Enterprise

1. Click **"+ Add product"** (still in LIVE mode)
2. Fill in:
   ```
   Name: SnapIT Forum Enterprise
   Description: For large organizations - Unlimited users with dedicated infrastructure and 24/7 support
   ```
3. Under **Pricing**:
   ```
   Pricing model: Recurring
   Price: $299.00 USD
   Billing period: Monthly
   ```
4. Click **"Save product"**
5. **📋 Copy the Price ID**

---

### Step 3: Get LIVE Secret Key

1. Still in LIVE mode (green background)
2. Go to https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/apikeys
3. Find **"Secret key"** in the **"Standard keys"** section
4. Click **"Reveal live key"**
5. **📋 Copy the secret key** (starts with `sk_live_...`)
   - **⚠️ NEVER share this publicly or commit to git!**

---

### Step 4: Update AWS SSM Parameters

Run these commands with your ACTUAL price IDs and secret key:

```bash
# Pro tier (replace price_XXX with your actual price ID from Step 2)
aws ssm put-parameter \
  --name /snapit-forum/prod/STRIPE_PRO_PRICE_ID \
  --value "price_XXXXXXXXXXXXX" \
  --type String \
  --overwrite \
  --region us-east-1

# Business tier
aws ssm put-parameter \
  --name /snapit-forum/prod/STRIPE_BUSINESS_PRICE_ID \
  --value "price_XXXXXXXXXXXXX" \
  --type String \
  --overwrite \
  --region us-east-1

# Enterprise tier
aws ssm put-parameter \
  --name /snapit-forum/prod/STRIPE_ENTERPRISE_PRICE_ID \
  --value "price_XXXXXXXXXXXXX" \
  --type String \
  --overwrite \
  --region us-east-1

# LIVE secret key (replace sk_live_XXX with your actual secret key)
aws ssm put-parameter \
  --name /snapit-forum/prod/STRIPE_SECRET_KEY \
  --value "sk_live_XXXXXXXXXXXXX" \
  --type SecureString \
  --overwrite \
  --region us-east-1
```

---

### Step 5: Verify SSM Parameters

```bash
# Check that they're saved correctly
aws ssm get-parameter --name /snapit-forum/prod/STRIPE_PRO_PRICE_ID --region us-east-1
aws ssm get-parameter --name /snapit-forum/prod/STRIPE_BUSINESS_PRICE_ID --region us-east-1
aws ssm get-parameter --name /snapit-forum/prod/STRIPE_ENTERPRISE_PRICE_ID --region us-east-1

# Secret key (will show encrypted)
aws ssm get-parameter --name /snapit-forum/prod/STRIPE_SECRET_KEY --region us-east-1 --with-decryption
```

---

### Step 6: Update Frontend (Already Done ✅)

The frontend config has been updated with your LIVE publishable key:

```typescript
// forum-app/src/config.ts
export const STRIPE_PUBLISHABLE_KEY = 'pk_live_51SEhK7Ikj5YQseOZdDlxSF559wAxa2VaukNqsoFjehtq26Yr6lftlDso5HxqGyKVZy907ylLHgFOPYp9tBKLEDzk00KEYnlJ15';
```

---

### Step 7: Redeploy Everything

```bash
# Rebuild frontend
cd forum-app
npm run build
cd ..

# Deploy frontend to S3
aws s3 sync forum-app/build/ s3://snapit-forum-static/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id E1X8SJIRPSICZ4 --paths "/*"

# Redeploy backend (to pick up new SSM parameters)
npm run deploy:prod
```

---

### Step 8: Set Up Webhook in LIVE Mode

1. Go to: https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/webhooks
2. Make sure **"Viewing live data"** is ON (green)
3. Click **"+ Add endpoint"**
4. Enter:
   ```
   Endpoint URL: https://api.snapitsoftware.com/webhooks/stripe
   Description: SnapIT Forum - Production
   ```
5. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click **"Add endpoint"**
7. **📋 Copy the Signing Secret** (starts with `whsec_...`)

Update SSM:
```bash
aws ssm put-parameter \
  --name /snapit-forum/prod/STRIPE_WEBHOOK_SECRET \
  --value "whsec_XXXXXXXXXXXXX" \
  --type SecureString \
  --overwrite \
  --region us-east-1
```

---

## ✅ Testing LIVE Mode

### ⚠️ IMPORTANT: Use REAL Credit Card

In LIVE mode, you CANNOT use test cards (4242 4242 4242 4242).
You must use a real credit card.

### Test Flow

1. Visit https://forum.snapitsoftware.com
2. Sign in with Google
3. Click **"Upgrade"** or navigate to settings
4. Select **Pro tier** ($29/month)
5. Click **"Subscribe"**
6. Stripe checkout opens
7. Enter **REAL** credit card details
8. Complete payment
9. Verify webhook receives event
10. Check DynamoDB - user tier should update to "pro"

### Check Stripe Dashboard

1. Go to https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/payments
2. Make sure in LIVE mode (green)
3. Should see your test payment
4. Click on payment to see details

---

## 🔒 Security Checklist

### Keys to Protect
- ✅ `pk_live_...` (publishable key) - **OK to expose** in frontend
- ⚠️ `sk_live_...` (secret key) - **NEVER expose**, only in SSM/backend
- ⚠️ `whsec_...` (webhook secret) - **NEVER expose**, only in SSM

### Where Keys Are Stored
```
Frontend (PUBLIC):
- pk_live_... in forum-app/src/config.ts ✅ (public key, safe)

Backend (PRIVATE):
- sk_live_... in SSM Parameter Store ✅ (encrypted)
- whsec_... in SSM Parameter Store ✅ (encrypted)
- All price IDs in SSM Parameter Store ✅ (not sensitive)
```

---

## 💰 Revenue Tracking

### Dashboard Links
- **Payments**: https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/payments
- **Subscriptions**: https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/subscriptions
- **Customers**: https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/customers
- **Revenue**: https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/revenue

### Expected Revenue (Example)
```
Month 1:
- 10 Pro users @ $29/mo = $290
- 2 Business @ $99/mo = $198
- 0 Enterprise @ $299/mo = $0
Total: $488/month

Stripe Fees (2.9% + $0.30):
- $488 × 0.029 = $14.15
- 12 transactions × $0.30 = $3.60
- Total fees: $17.75

Net Revenue: $470.25/month
```

---

## 🐛 Troubleshooting

### "No products found in live mode"
- **Solution**: You're in test mode. Toggle to live mode (green).

### "Invalid API key"
- **Solution**: Make sure you copied the LIVE secret key (sk_live_...), not test key (sk_test_...).

### "Price not found"
- **Solution**: Double-check price IDs in SSM match the IDs from Stripe dashboard.

### Webhook not receiving events
- **Solution**:
  1. Check endpoint URL: `https://api.snapitsoftware.com/webhooks/stripe`
  2. Verify webhook secret in SSM
  3. Check CloudWatch logs: `/aws/lambda/snapit-forum-api-prod-stripeWebhook`

### Payment failed
- **Solution**:
  1. Check Stripe dashboard for error message
  2. Verify credit card is valid
  3. Check CloudWatch logs for backend errors

---

## 📊 Monitoring

### CloudWatch Logs
```bash
# Watch Stripe webhook events
aws logs tail /aws/lambda/snapit-forum-api-prod-stripeWebhook --follow

# Watch checkout session creation
aws logs tail /aws/lambda/snapit-forum-api-prod-createCheckoutSession --follow
```

### Stripe Dashboard Notifications
- Enable email notifications for:
  - Failed payments
  - Successful subscriptions
  - Canceled subscriptions
  - Disputes/chargebacks

---

## 🎯 Quick Reference

| Item | Test Mode | Live Mode |
|------|-----------|-----------|
| **Publishable Key** | pk_test_... | pk_live_51SEhK7Ikj5YQseOZ... ✅ |
| **Secret Key** | sk_test_... | sk_live_... (get from dashboard) |
| **Products** | ✅ Created | ⚠️ Need to create |
| **Webhook** | Configured | ⚠️ Need to create |
| **Frontend** | ✅ Updated | ✅ Updated |
| **SSM Params** | Test values | ⚠️ Need to update |

---

## 🚀 Summary: What You Need to Do

1. ✅ **Frontend updated** with LIVE publishable key
2. ⚠️ **Go to Stripe dashboard** (LIVE mode)
3. ⚠️ **Create 3 products** manually (Pro, Business, Enterprise)
4. ⚠️ **Copy 3 price IDs**
5. ⚠️ **Get LIVE secret key**
6. ⚠️ **Update 4 SSM parameters** (3 price IDs + 1 secret key)
7. ⚠️ **Create webhook** in LIVE mode
8. ⚠️ **Update webhook secret** in SSM
9. ✅ **Rebuild frontend** (ready to go)
10. ✅ **Redeploy backend** (after SSM updates)
11. ⚠️ **Test with real credit card**

---

**Time Estimate**: 20-30 minutes
**Difficulty**: Easy (mostly copy-paste)
**Risk**: Low (doesn't affect test mode)
**Result**: Ready to accept real payments! 💰

---

**Last Updated**: October 5, 2025
**Status**: Frontend ready, waiting for Stripe LIVE products

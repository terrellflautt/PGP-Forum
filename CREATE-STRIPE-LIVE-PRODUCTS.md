# 💳 Create Stripe Products in LIVE Mode

**Dashboard**: https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/products

---

## ⚠️ Important: Switch to LIVE Mode

1. Go to Stripe Dashboard
2. Toggle **"Viewing test data"** to **"Viewing live data"**
3. Background should turn **GREEN** (live mode)

---

## 📦 Create Products & Prices

### Product 1: SnapIT Forum Pro

1. Click **"+ Add product"**
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
5. **Copy the Price ID** (starts with `price_...`)

---

### Product 2: SnapIT Forum Business

1. Click **"+ Add product"**
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
5. **Copy the Price ID**

---

### Product 3: SnapIT Forum Enterprise

1. Click **"+ Add product"**
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
5. **Copy the Price ID**

---

## 🔧 Update SSM Parameters with LIVE Price IDs

After creating the products, update the price IDs in AWS:

```bash
# Pro tier (replace with your actual price ID)
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
```

---

## 🔑 Update Stripe Secret Key to LIVE

```bash
# Get your LIVE secret key from:
# https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/apikeys
# (Make sure you're in LIVE mode - green background)

aws ssm put-parameter \
  --name /snapit-forum/prod/STRIPE_SECRET_KEY \
  --value "sk_live_XXXXXXXXXXXXX" \
  --type SecureString \
  --overwrite \
  --region us-east-1
```

---

## 🎨 Update Frontend Config

Edit `forum-app/src/config.ts`:

```typescript
// Change from:
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_...';

// To (get from dashboard):
export const STRIPE_PUBLISHABLE_KEY = 'pk_live_51SEhK7Ikj5YQseOZ...';
```

---

## 🚀 Redeploy

```bash
# Rebuild frontend
cd forum-app
npm run build
cd ..

# Deploy to S3
aws s3 sync forum-app/build/ s3://snapit-forum-static/ --delete

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id E1X8SJIRPSICZ4 --paths "/*"

# Redeploy backend (to pick up new SSM parameters)
npm run deploy:prod
```

---

## ✅ Verify

1. Visit https://forum.snapitsoftware.com
2. Sign in
3. Click "Upgrade"
4. Should see:
   - Pro: $29/month
   - Business: $99/month
   - Enterprise: $299/month
5. Use **REAL credit card** (or test card if still in test mode)

---

## 🔒 Webhook Setup (LIVE Mode)

1. Go to: https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/webhooks
2. Make sure **"Viewing live data"** is ON
3. Click **"+ Add endpoint"**
4. Enter:
   ```
   Endpoint URL: https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/webhooks/stripe
   Description: SnapIT Forum - Live
   ```
5. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click **"Add endpoint"**
7. **Copy the Signing Secret** (starts with `whsec_...`)

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

## 📊 Quick Summary

**What you need to do**:

1. ✅ Create 3 products in Stripe (LIVE mode)
2. ✅ Copy the 3 price IDs
3. ✅ Update SSM with price IDs
4. ✅ Get LIVE secret key (sk_live_...)
5. ✅ Update SSM with secret key
6. ✅ Get LIVE publishable key (pk_live_...)
7. ✅ Update `forum-app/src/config.ts`
8. ✅ Rebuild and deploy frontend
9. ✅ Redeploy backend
10. ✅ Set up webhook in LIVE mode
11. ✅ Test with real credit card

---

**Time Estimate**: 15-20 minutes

**Result**: Ready to accept real payments! 💰

# 💳 Stripe Live Mode Setup Guide

**Status**: ⚠️ Currently in TEST mode
**Stripe Dashboard**: https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/dashboard

---

## 🎯 Overview

This guide walks through switching SnapIT Forum from **Stripe Test Mode** to **Stripe Live Mode** for accepting real payments.

**Current State**:
- ✅ Test keys configured in SSM
- ✅ Checkout flow working with test cards
- ✅ Webhooks configured
- ⚠️ No live products created
- ⚠️ No live keys in production

---

## 📋 Prerequisites

Before switching to live mode:

1. ✅ **Business Verification** - Stripe account fully verified
2. ✅ **Bank Account** - Connected for payouts
3. ✅ **Tax Settings** - Configured for your jurisdiction
4. ✅ **Terms of Service** - Published at https://forum.snapitsoftware.com/terms.html
5. ✅ **Privacy Policy** - Published at https://forum.snapitsoftware.com/privacy.html
6. ✅ **Support Email** - snapitsaas@gmail.com configured

---

## 🔑 Step 1: Get Live API Keys

### 1.1 Navigate to Stripe Dashboard
```
https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/apikeys
```

### 1.2 Switch to Live Mode
- Click **"View live data"** toggle in top-right corner
- Dashboard background should turn **green** (live mode)

### 1.3 Reveal Secret Key
1. Scroll to **"Secret key"** section
2. Click **"Reveal live key"**
3. Copy the key starting with `sk_live_...`

**⚠️ CRITICAL**: Never commit this key to git or share publicly!

### 1.4 Copy Publishable Key
1. Find **"Publishable key"** section
2. Copy the key starting with `pk_live_...`

**Sample Keys** (these are fake - use your real keys):
```
Publishable key: pk_live_51SEhK7Ikj5YQseOZ...
Secret key:      sk_live_51SEhK7Ikj5YQseOZ...
```

---

## 🛍️ Step 2: Create Live Products

### 2.1 Navigate to Products
```
https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/products
```

### 2.2 Create Pro Tier Product

1. Click **"+ Add product"**
2. Fill in details:
   ```
   Name: SnapIT Forums - Pro
   Description: Up to 10,000 users, custom domain, API access
   ```
3. Under **Pricing**:
   ```
   Pricing model: Recurring
   Price: $29.00 USD
   Billing period: Monthly
   ```
4. Click **"Save product"**
5. Copy the **Price ID** (starts with `price_...`)

### 2.3 Create Business Tier Product

1. Click **"+ Add product"**
2. Fill in details:
   ```
   Name: SnapIT Forums - Business
   Description: Up to 50,000 users, white-label, SSO/SAML
   ```
3. Under **Pricing**:
   ```
   Pricing model: Recurring
   Price: $99.00 USD
   Billing period: Monthly
   ```
4. Click **"Save product"**
5. Copy the **Price ID**

### 2.4 Create Enterprise Tier Product

1. Click **"+ Add product"**
2. Fill in details:
   ```
   Name: SnapIT Forums - Enterprise
   Description: Unlimited users, dedicated infrastructure, 24/7 support
   ```
3. Under **Pricing**:
   ```
   Pricing model: Recurring
   Price: $299.00 USD
   Billing period: Monthly
   ```
4. Click **"Save product"**
5. Copy the **Price ID**

**Example Price IDs**:
```
Pro:        price_1QRAbCIkj5YQseOZpro29monthly
Business:   price_1QRAbCIkj5YQseOZbus99monthly
Enterprise: price_1QRAbCIkj5YQseOZent299monthly
```

---

## 🔐 Step 3: Update SSM Parameters

### 3.1 Update Stripe Secret Key

```bash
aws ssm put-parameter \
  --name /snapit-forum/prod/STRIPE_SECRET_KEY \
  --value "sk_live_YOUR_ACTUAL_SECRET_KEY" \
  --type SecureString \
  --overwrite \
  --region us-east-1
```

### 3.2 Update Price IDs

```bash
# Pro tier
aws ssm put-parameter \
  --name /snapit-forum/prod/STRIPE_PRO_PRICE_ID \
  --value "price_1QRAbCIkj5YQseOZpro29monthly" \
  --type String \
  --overwrite \
  --region us-east-1

# Business tier
aws ssm put-parameter \
  --name /snapit-forum/prod/STRIPE_BUSINESS_PRICE_ID \
  --value "price_1QRAbCIkj5YQseOZbus99monthly" \
  --type String \
  --overwrite \
  --region us-east-1

# Enterprise tier
aws ssm put-parameter \
  --name /snapit-forum/prod/STRIPE_ENTERPRISE_PRICE_ID \
  --value "price_1QRAbCIkj5YQseOZent299monthly" \
  --type String \
  --overwrite \
  --region us-east-1
```

### 3.3 Verify Parameters

```bash
aws ssm get-parameters \
  --names \
    /snapit-forum/prod/STRIPE_SECRET_KEY \
    /snapit-forum/prod/STRIPE_PRO_PRICE_ID \
    /snapit-forum/prod/STRIPE_BUSINESS_PRICE_ID \
    /snapit-forum/prod/STRIPE_ENTERPRISE_PRICE_ID \
  --with-decryption \
  --query 'Parameters[*].[Name,Value]' \
  --output table
```

---

## 🌐 Step 4: Update Frontend Config

### 4.1 Edit `forum-app/src/config.ts`

```typescript
// Change this line:
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SEhKnEn5tPJtShN...'; // ❌ TEST

// To this (your live key):
export const STRIPE_PUBLISHABLE_KEY = 'pk_live_51SEhK7Ikj5YQseOZ...'; // ✅ LIVE
```

### 4.2 Rebuild Frontend

```bash
cd forum-app
npm run build
```

### 4.3 Deploy to S3

```bash
cd ..
aws s3 sync forum-app/build/ s3://snapit-forum-static/ --delete
```

### 4.4 Invalidate CloudFront

```bash
aws cloudfront create-invalidation \
  --distribution-id E1X8SJIRPSICZ4 \
  --paths "/*"
```

**Or use the deployment script**:
```bash
./deploy-production.sh
```

---

## 🪝 Step 5: Configure Webhooks

### 5.1 Create Webhook Endpoint

1. Go to: https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/webhooks
2. Make sure **"Viewing live data"** is enabled
3. Click **"+ Add endpoint"**
4. Enter endpoint URL:
   ```
   https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/webhooks/stripe
   ```
5. Select events to listen for:
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `invoice.upcoming`
6. Click **"Add endpoint"**

### 5.2 Get Webhook Signing Secret

1. Click on the newly created webhook
2. Reveal **"Signing secret"**
3. Copy the value (starts with `whsec_...`)

### 5.3 Update SSM Parameter

```bash
aws ssm put-parameter \
  --name /snapit-forum/prod/STRIPE_WEBHOOK_SECRET \
  --value "whsec_YOUR_WEBHOOK_SIGNING_SECRET" \
  --type SecureString \
  --overwrite \
  --region us-east-1
```

### 5.4 Redeploy Backend (to pick up new webhook secret)

```bash
npm run deploy:prod
```

---

## 🧪 Step 6: Test Live Mode

### 6.1 Use Real Credit Card (Small Amount)

1. Open https://forum.snapitsoftware.com
2. Sign in with Google
3. Click **"Upgrade"** → **Pro** ($29/month)
4. Enter **REAL credit card** (or use Stripe test mode one more time)
5. Complete checkout

**⚠️ WARNING**: This will charge your card! Use test mode first.

### 6.2 Test Mode First (Recommended)

Before going live, test one more time with test card:
```
Card number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

### 6.3 Verify Subscription Created

```bash
# Check Stripe dashboard
https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/subscriptions

# Check DynamoDB
aws dynamodb scan --table-name snapit-forum-api-forums-prod \
  --filter-expression "attribute_exists(stripeSubscriptionId)" \
  --query 'Items[*].[forumId.S,tier.S,stripeSubscriptionId.S]' \
  --output table
```

---

## 🔔 Step 7: Monitor & Alerts

### 7.1 Set Up Stripe Email Alerts

1. Go to: https://dashboard.stripe.com/settings/user
2. Under **Email notifications**, enable:
   - ✅ Payment failures
   - ✅ Successful payments
   - ✅ Disputes
   - ✅ Refunds

### 7.2 CloudWatch Alarms for Failed Payments

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name SnapITForum-StripePaymentFailure \
  --alarm-description "Alert on Stripe payment failure" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --dimensions Name=FunctionName,Value=snapit-forum-api-prod-stripeWebhook \
  --alarm-actions arn:aws:sns:us-east-1:YOUR_ACCOUNT_ID:AlertTopic
```

---

## 📊 Step 8: Revenue Dashboard

### 8.1 Stripe Dashboard

Monitor revenue in real-time:
```
https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/dashboard
```

**Key Metrics**:
- Gross volume (total revenue)
- Net volume (after Stripe fees)
- Active subscriptions
- Churn rate
- MRR (Monthly Recurring Revenue)

### 8.2 Create Custom Dashboard (Optional)

Use Stripe API to build custom analytics:

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Get subscription stats
const subscriptions = await stripe.subscriptions.list({
  status: 'active',
  limit: 100
});

// Calculate MRR
const mrr = subscriptions.data.reduce((sum, sub) => {
  return sum + (sub.items.data[0].price.unit_amount / 100);
}, 0);

console.log(`Monthly Recurring Revenue: $${mrr}`);
```

---

## ⚠️ Important Notes

### Stripe Fees
- **Standard**: 2.9% + $0.30 per successful charge
- **International cards**: +1.5%
- **Currency conversion**: +1%

**Example**: $29 Pro subscription
- Gross: $29.00
- Stripe fee: $1.14 (2.9% + $0.30)
- **Net**: $27.86

### Refund Policy
- Full refund within 7 days
- Prorated refund after 7 days
- Configure in Stripe dashboard

### Tax Handling
- Stripe Tax (automatic): +0.5% of transaction
- Manual tax collection: Configure tax rates
- W-9 form required for US businesses

### PCI Compliance
- ✅ Stripe handles all card data (PCI Level 1 certified)
- ✅ No card numbers stored in your database
- ✅ Use Stripe.js for tokenization

---

## 🚨 Rollback Plan

If something goes wrong after switching to live mode:

### 1. Switch Back to Test Mode

```bash
# Revert SSM parameters
aws ssm put-parameter \
  --name /snapit-forum/prod/STRIPE_SECRET_KEY \
  --value "sk_test_YOUR_TEST_KEY" \
  --type SecureString \
  --overwrite
```

### 2. Revert Frontend

```typescript
// config.ts
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_...';
```

### 3. Rebuild and Deploy

```bash
cd forum-app && npm run build && cd ..
aws s3 sync forum-app/build/ s3://snapit-forum-static/ --delete
aws cloudfront create-invalidation --distribution-id E1X8SJIRPSICZ4 --paths "/*"
```

### 4. Notify Affected Users

If any real payments were processed, notify users via email:
```
Subject: SnapIT Forum Billing Update

We experienced a temporary billing issue. If you were charged,
you will receive a full refund within 5-10 business days.

We apologize for the inconvenience.

- SnapIT Team
```

---

## ✅ Post-Launch Checklist

After switching to live mode:

- [ ] Process test payment with real card
- [ ] Verify webhook events received
- [ ] Check CloudWatch logs for errors
- [ ] Monitor Stripe dashboard for 24 hours
- [ ] Set up weekly revenue reports
- [ ] Create customer support email template for billing
- [ ] Document refund process
- [ ] Train support team on billing issues
- [ ] Set up automated payment failure emails
- [ ] Configure subscription cancellation flow
- [ ] Create customer portal link (Stripe billing portal)
- [ ] Test all edge cases:
  - Failed payment
  - Card decline
  - Subscription downgrade
  - Subscription upgrade
  - Cancellation
  - Reactivation

---

## 🎉 You're Live!

Once all steps are complete, your SnapIT Forum will be accepting real payments!

**Next Steps**:
1. Announce to users via email/social media
2. Monitor first week closely
3. Collect feedback on pricing
4. Optimize conversion funnel
5. A/B test pricing tiers

**Support**:
- Stripe docs: https://stripe.com/docs
- Stripe support: https://support.stripe.com
- SnapIT support: snapitsaas@gmail.com

---

**Last Updated**: October 5, 2025

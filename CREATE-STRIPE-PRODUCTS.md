# Create Stripe Products for SnapIT Forums

Go to: https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/products?active=true

---

## Product 1: SnapIT Forum Pro

**Click "Add product" → Fill in:**

- **Name:** SnapIT Forum Pro
- **Description:** For growing communities
- **Pricing:** Recurring
  - **Price:** $29.00 USD
  - **Billing period:** Monthly
- **Features (add these in description or metadata):**
  - Up to 10,000 users
  - PGP encrypted messaging
  - Anonymous IP relay
  - Custom domain support
  - Advanced moderation tools
  - API access
  - Email support
  - Custom branding

**Click "Save product"**

**Copy the Price ID** (starts with `price_`) → You'll need this

---

## Product 2: SnapIT Forum Business

**Click "Add product" → Fill in:**

- **Name:** SnapIT Forum Business
- **Description:** For professional communities
- **Pricing:** Recurring
  - **Price:** $99.00 USD
  - **Billing period:** Monthly
- **Features:**
  - Up to 50,000 users
  - Everything in Pro
  - White-label branding
  - SSO/SAML integration
  - Advanced analytics dashboard
  - Priority support
  - SLA guarantee (99.9% uptime)
  - Dedicated account manager

**Click "Save product"**

**Copy the Price ID** (starts with `price_`) → You'll need this

---

## Product 3: SnapIT Forum Enterprise

**Click "Add product" → Fill in:**

- **Name:** SnapIT Forum Enterprise
- **Description:** For large-scale organizations
- **Pricing:** Recurring
  - **Price:** $299.00 USD
  - **Billing period:** Monthly
- **Features:**
  - Unlimited users
  - Everything in Business
  - Dedicated infrastructure (isolated AWS resources)
  - Custom integrations
  - On-premise deployment option
  - 24/7 phone support
  - 99.99% uptime SLA
  - Security audit & compliance certification
  - Technical account manager

**Click "Save product"**

**Copy the Price ID** (starts with `price_`) → You'll need this

---

## After Creating Products

You'll have 3 Price IDs that look like:
```
price_1Abc123...  (Pro)
price_1Def456...  (Business)
price_1Ghi789...  (Enterprise)
```

### Update Environment Variables

You need to add these to your Lambda functions. You can do this in two ways:

#### Option 1: Update `.env` file (Local)

Create `/mnt/c/Users/decry/Desktop/snapit-forum/.env`:
```bash
GOOGLE_CLIENT_ID=242648112266-iglul54tuis9mhucsp1pmpqg0a48l8i0.apps.googleusercontent.com
JWT_SECRET=your-jwt-secret-here
STRIPE_SECRET_KEY=sk_live_...  # Your live secret key from Stripe
STRIPE_PRO_PRICE_ID=price_1Abc123...
STRIPE_BUSINESS_PRICE_ID=price_1Def456...
STRIPE_ENTERPRISE_PRICE_ID=price_1Ghi789...
STRIPE_WEBHOOK_SECRET=whsec_...  # Will get this after creating webhook
```

Then redeploy:
```bash
cd /mnt/c/Users/decry/Desktop/snapit-forum
serverless deploy --stage prod
```

#### Option 2: Update Directly in AWS Lambda Console

1. Go to: https://console.aws.amazon.com/lambda
2. Find function: `snapit-forum-api-createCheckoutSession-prod`
3. Configuration → Environment variables
4. Edit and add:
   - `STRIPE_PRO_PRICE_ID = price_1Abc123...`
   - `STRIPE_BUSINESS_PRICE_ID = price_1Def456...`
   - `STRIPE_ENTERPRISE_PRICE_ID = price_1Ghi789...`
   - `STRIPE_SECRET_KEY = sk_live_...`

5. Repeat for all Stripe-related functions

---

## Setup Stripe Webhook

### Step 1: Create Webhook Endpoint

Go to: https://dashboard.stripe.com/webhooks

Click "Add endpoint":

- **Endpoint URL:** `https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/webhooks/stripe`
- **Description:** SnapIT Forums subscription webhooks
- **Events to send:**
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `customer.subscription.trial_will_end`

Click "Add endpoint"

### Step 2: Copy Webhook Secret

After creating, you'll see a **Signing secret** (starts with `whsec_`)

Copy this and add to environment variables:
```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

Redeploy Lambda to pick up the new environment variable.

---

## Test the Integration

### 1. Test Checkout Flow

```bash
curl -X POST https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/create-checkout-session \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier": "pro"}'
```

Should return:
```json
{
  "sessionId": "cs_test_..."
}
```

### 2. Test Webhook

Go to: https://dashboard.stripe.com/webhooks

Click on your webhook → "Send test webhook"

Select event: `customer.subscription.created`

Check CloudWatch logs for your `stripeWebhook` Lambda function to see if it received the event.

---

## Update React App with Price IDs

Edit `/forum-app/src/config.ts`:

```typescript
export const STRIPE_PRICE_IDS = {
  pro: 'price_1Abc123...',
  business: 'price_1Def456...',
  enterprise: 'price_1Ghi789...',
};
```

---

## Pricing Page Integration

The pricing page needs to redirect to Stripe Checkout. Update the upgrade buttons to call:

```javascript
async function handleUpgrade(tier) {
  const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tier }),
  });

  const { sessionId } = await response.json();

  // Redirect to Stripe Checkout
  const stripe = Stripe('pk_live_...');  // Your live publishable key
  await stripe.redirectToCheckout({ sessionId });
}
```

---

## Summary Checklist

- [ ] Create Pro product ($29/mo) → Copy Price ID
- [ ] Create Business product ($99/mo) → Copy Price ID
- [ ] Create Enterprise product ($299/mo) → Copy Price ID
- [ ] Add Price IDs to Lambda environment variables
- [ ] Get Stripe Secret Key (sk_live_...) → Add to Lambda
- [ ] Create webhook endpoint
- [ ] Copy webhook secret → Add to Lambda
- [ ] Test checkout flow
- [ ] Test webhook delivery
- [ ] Update React app with Price IDs
- [ ] Deploy React app with pricing integration

---

**Once complete, your forum will have:**
- Free tier: 1,500 users (auto-granted on signup)
- Pro tier: 10,000 users ($29/mo)
- Business tier: 50,000 users ($99/mo)
- Enterprise tier: Unlimited ($299/mo)

All tiers include PGP encryption, anonymous mode, dead man's switch, and anonymous inbox. Paid tiers add custom domains, white-label, SSO, analytics, and premium support.

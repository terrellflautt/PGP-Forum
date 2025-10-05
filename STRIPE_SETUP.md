# Stripe Setup for SnapIT Forum

## Overview
Competing with ProBoards - offering a superior forum platform with PGP encryption, multi-tenant architecture, and transparent pricing.

## Products to Create in Stripe

Go to: https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/products

### 1. Pro Tier
- **Name:** SnapIT Forum Pro
- **Price:** $29/month (recurring)
- **Description:** Up to 10,000 users, custom domain, advanced moderation, API access
- **After creating, copy the Price ID** (starts with `price_`)

### 2. Business Tier
- **Name:** SnapIT Forum Business
- **Price:** $99/month (recurring)
- **Description:** Up to 50,000 users, white-label, SSO/SAML, advanced analytics
- **After creating, copy the Price ID**

### 3. Enterprise Tier
- **Name:** SnapIT Forum Enterprise
- **Price:** $299/month (recurring)
- **Description:** Unlimited users, dedicated infrastructure, custom integrations, SLA
- **After creating, copy the Price ID**

## Update Environment Variables

Once you have the Price IDs, update `.env`:

```bash
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_BUSINESS_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx  # Use LIVE key when ready
```

Then redeploy:
```bash
serverless deploy --stage prod
```

## Webhook Configuration

### Step 1: Create Webhook
Go to: https://dashboard.stripe.com/webhooks

- **Endpoint URL:** `https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/webhooks/stripe`
- **Events to select:**
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

### Step 2: Get Webhook Secret
After creating the webhook, copy the **Signing secret** (starts with `whsec_`)

Update `.env`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

Redeploy:
```bash
serverless deploy --stage prod
```

## Competitive Positioning vs ProBoards

| Feature | SnapIT Forum | ProBoards |
|---------|--------------|-----------|
| **Free Tier** | 1,500 users | Limited features |
| **PGP Messaging** | ✅ Built-in | ❌ Not available |
| **Custom Domain** | ✅ $29/mo | ✅ $9.99/mo |
| **White Label** | ✅ $99/mo | ✅ $14.99/mo |
| **Multi-Tenant** | ✅ Auto-create forums | ❌ Single forum |
| **API Access** | ✅ Full REST API | ❌ Limited |
| **Data Ownership** | ✅ Full export | ❌ Proprietary |
| **Encryption** | ✅ E2E PGP | ❌ None |
| **Serverless** | ✅ Unlimited scale | ❌ Shared hosting |

## Pricing Strategy

**ProBoards Pricing:**
- Free: Basic features
- Plus: $6.99/mo
- Deluxe: $9.99/mo
- Premium: $14.99/mo

**SnapIT Forum Pricing (Premium Value):**
- Free: 1,500 users (more generous)
- Pro: $29/mo (10K users - better for growth)
- Business: $99/mo (50K users - enterprise features)
- Enterprise: $299/mo (unlimited - white glove service)

## Value Proposition

**Why SnapIT Forum beats ProBoards:**

1. **Security First:** PGP encrypted messages (ProBoards has none)
2. **Auto-Scaling:** Serverless architecture (ProBoards is shared hosting)
3. **Multi-Tenant:** Every user gets a free forum (ProBoards = one forum per account)
4. **Modern Stack:** React/serverless (ProBoards is legacy tech)
5. **Full API:** Build custom integrations (ProBoards API is limited)
6. **Data Freedom:** Export everything (ProBoards locks you in)

## Go-Live Checklist

- [ ] Create 3 products in Stripe (Pro, Business, Enterprise)
- [ ] Copy Price IDs to `.env`
- [ ] Switch to live Stripe secret key (`sk_live_`)
- [ ] Create webhook endpoint in Stripe
- [ ] Copy webhook secret to `.env`
- [ ] Redeploy with `serverless deploy --stage prod`
- [ ] Test checkout flow with live card
- [ ] Monitor first subscription in Stripe dashboard

## Support

For Stripe issues:
- Stripe Docs: https://stripe.com/docs/billing/subscriptions/overview
- SnapIT Support: support@snapitsoftware.com

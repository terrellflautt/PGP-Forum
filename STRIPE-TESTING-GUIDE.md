# Stripe LIVE Mode Testing Guide

**Platform**: SnapIT Forum
**Environment**: Production
**Status**: Ready for LIVE testing
**Last Updated**: October 5, 2025

---

## Critical Warning

**THIS GUIDE IS FOR LIVE MODE TESTING WITH REAL MONEY**

- You will use REAL credit cards
- You will be charged REAL money
- Stripe will process REAL payments
- All transactions are IRREVERSIBLE (refunds required)

**Test responsibly. Use small amounts. Be prepared to refund.**

---

## 1. Pre-Testing Checklist

Before beginning LIVE mode testing, verify all prerequisites:

### 1.1 Verify Stripe LIVE Keys in SSM

```bash
# Check all Stripe parameters exist
aws ssm get-parameters-by-path \
  --path /snapit-forum/prod \
  --region us-east-1 \
  --with-decryption | jq '.Parameters[] | select(.Name | contains("STRIPE"))'

# Expected parameters:
# - /snapit-forum/prod/STRIPE_SECRET_KEY (sk_live_...)
# - /snapit-forum/prod/STRIPE_PRO_PRICE_ID (price_1SEyIKIkj5YQseOZedJrBtTC)
# - /snapit-forum/prod/STRIPE_BUSINESS_PRICE_ID (price_1SEyIVIkj5YQseOZzYzU8zUm)
# - /snapit-forum/prod/STRIPE_ENTERPRISE_PRICE_ID (price_1SEyIXIkj5YQseOZCs85Q48g)
# - /snapit-forum/prod/STRIPE_WEBHOOK_SECRET (whsec_...)
```

**Expected Results:**
- All 5 parameters should exist
- Secret key should start with `sk_live_`
- Price IDs should start with `price_`
- Webhook secret should start with `whsec_`

**If any are missing:** See STRIPE-LIVE-MODE-SETUP.md

---

### 1.2 Verify Backend is Deployed with LIVE Keys

```bash
# Check Lambda environment variables
aws lambda get-function-configuration \
  --function-name snapit-forum-api-prod-createCheckoutSession \
  --region us-east-1 | jq '.Environment.Variables'

# Should NOT show actual keys (pulled from SSM at runtime)
# But should confirm Lambda is in prod environment
```

**Expected Results:**
- Function should exist
- Environment should be `prod`
- No errors

**If Lambda doesn't exist:** Run `npm run deploy:prod`

---

### 1.3 Verify Frontend Has Correct Publishable Key

```bash
# Check frontend config
grep "STRIPE_PUBLISHABLE_KEY" forum-app/src/config.ts
```

**Expected Result:**
```typescript
export const STRIPE_PUBLISHABLE_KEY = 'pk_live_51SEhK7Ikj5YQseOZ...';
```

**If using test key (pk_test_):** Update config.ts and redeploy frontend

```bash
cd forum-app
npm run build
aws s3 sync build/ s3://snapit-forum-static/ --delete
aws cloudfront create-invalidation --distribution-id E1X8SJIRPSICZ4 --paths "/*"
```

---

### 1.4 Check Webhook Endpoint is Registered

1. Visit: https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/webhooks
2. Ensure "Viewing live data" is ON (green background)
3. Verify endpoint exists:
   - URL: `https://api.snapitsoftware.com/webhooks/stripe`
   - Status: Active
   - Events: customer.subscription.*, invoice.payment_*, checkout.session.completed

**If webhook missing:** See Step 8 in STRIPE-LIVE-MODE-SETUP.md

---

## 2. Test Plan for Pro Tier ($29/month)

### 2.1 Test Procedure

**Step 1: Sign in to Platform**
1. Visit https://forum.snapitsoftware.com
2. Click "Get Started"
3. Sign in with Google
4. If first time: Set up @username

**Step 2: Navigate to Upgrade Page**
1. Click on Settings (gear icon in sidebar)
2. Click "Upgrade Plan" or navigate to pricing
3. Verify you see:
   - Free: $0/month (current)
   - Pro: $29/month
   - Business: $99/month
   - Enterprise: $299/month

**Step 3: Initiate Pro Tier Checkout**
1. Click "Subscribe" button under Pro tier
2. Wait for Stripe Checkout to load
3. Verify Checkout session displays:
   - Product name: "SnapIT Forum Pro"
   - Price: $29.00/month
   - Description: Up to 10,000 users

**Step 4: Enter Payment Information**

WARNING: Use a REAL credit card you control
```
Card Number: [Your real Visa/Mastercard]
Expiration: [Valid date]
CVC: [Your real CVC]
Billing ZIP: [Your real ZIP]
```

**Step 5: Complete Payment**
1. Click "Subscribe"
2. Wait for payment processing (5-10 seconds)
3. Should redirect to: `https://forum.snapitsoftware.com/?upgrade=success&tier=pro`

---

### 2.2 Expected Behavior

**Immediately After Payment:**
- Redirected to success page
- See success message or tier updated in UI

**Within 30 seconds:**
- Webhook receives `checkout.session.completed` event
- Webhook receives `customer.subscription.created` event
- DynamoDB updates forum tier to "pro"

**Within 2 minutes:**
- Email from Stripe confirming subscription
- Email receipt for $29.00 charge

---

### 2.3 Verify Subscription in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/subscriptions
2. Ensure "Viewing live data" is ON (green)
3. Find your subscription (newest entry)
4. Verify:
   - Status: Active
   - Amount: $29.00 USD monthly
   - Customer: Your email
   - Next invoice: 1 month from today

**Click into subscription details:**
- Product: SnapIT Forum Pro
- Price ID: price_1SEyIKIkj5YQseOZedJrBtTC
- Started: Today's date
- Current period: Should show current billing cycle

---

### 2.4 Verify Tier Upgrade in DynamoDB

```bash
# Get your user ID first
aws dynamodb scan \
  --table-name snapit-forum-users-prod \
  --filter-expression "email = :email" \
  --expression-attribute-values '{":email":{"S":"your-email@gmail.com"}}' \
  --region us-east-1

# Use userId to find forum
aws dynamodb scan \
  --table-name snapit-forum-forums-prod \
  --filter-expression "ownerUserId = :uid" \
  --expression-attribute-values '{":uid":{"S":"YOUR_USER_ID"}}' \
  --region us-east-1
```

**Expected DynamoDB Results:**
```json
{
  "forumId": "...",
  "tier": "pro",
  "maxUsers": 10000,
  "stripeCustomerId": "cus_...",
  "stripeSubscriptionId": "sub_...",
  "status": "active"
}
```

---

## 3. Test Plan for Business Tier ($99/month)

### 3.1 Test Procedure (Same as Pro)

1. Sign in to https://forum.snapitsoftware.com
2. Navigate to Settings > Upgrade
3. Click "Subscribe" under Business tier
4. Complete Stripe Checkout with REAL card
5. Verify redirect to success page

---

### 3.2 Expected Behavior

**Checkout Session:**
- Product: "SnapIT Forum Business"
- Price: $99.00/month
- Description: Up to 50,000 users with white-label and SSO

**After Payment:**
- DynamoDB tier: "business"
- DynamoDB maxUsers: 50000
- Stripe subscription active
- Email receipt for $99.00

---

### 3.3 Verification

**Stripe Dashboard:**
- Subscription amount: $99.00 USD monthly
- Price ID: price_1SEyIVIkj5YQseOZzYzU8zUm
- Status: Active

**DynamoDB:**
```json
{
  "tier": "business",
  "maxUsers": 50000,
  "stripeSubscriptionId": "sub_..."
}
```

---

## 4. Test Plan for Enterprise Tier ($299/month)

### 4.1 Test Procedure (Same as Pro)

1. Sign in to https://forum.snapitsoftware.com
2. Navigate to Settings > Upgrade
3. Click "Subscribe" under Enterprise tier
4. Complete Stripe Checkout with REAL card
5. Verify redirect to success page

---

### 4.2 Expected Behavior

**Checkout Session:**
- Product: "SnapIT Forum Enterprise"
- Price: $299.00/month
- Description: Unlimited users with dedicated infrastructure

**After Payment:**
- DynamoDB tier: "enterprise"
- DynamoDB maxUsers: 999999
- Stripe subscription active
- Email receipt for $299.00

---

### 4.3 Verification

**Stripe Dashboard:**
- Subscription amount: $299.00 USD monthly
- Price ID: price_1SEyIXIkj5YQseOZCs85Q48g
- Status: Active

**DynamoDB:**
```json
{
  "tier": "enterprise",
  "maxUsers": 999999,
  "stripeSubscriptionId": "sub_..."
}
```

---

## 5. Upgrade/Downgrade Testing

### 5.1 Pro → Business (Upgrade)

**Procedure:**
1. Currently subscribed to Pro ($29/month)
2. Navigate to Settings > Upgrade
3. Click "Subscribe" under Business tier
4. Complete checkout

**Expected Behavior:**
- Stripe creates NEW subscription
- Old Pro subscription is canceled
- Prorated credit applied to first Business invoice
- Example: If 15 days into Pro cycle, receive ~$14.50 credit

**Verify in Stripe:**
1. Go to Subscriptions
2. Old Pro subscription: Status = Canceled
3. New Business subscription: Status = Active
4. Check first invoice for proration credit

**Verify in DynamoDB:**
```json
{
  "tier": "business",
  "maxUsers": 50000,
  "stripeSubscriptionId": "sub_NEW_ID"
}
```

---

### 5.2 Business → Enterprise (Upgrade)

**Same procedure as Pro → Business**

**Expected:**
- Business subscription canceled
- Enterprise subscription created
- Prorated credit applied (~$49.50 if mid-cycle)

---

### 5.3 Enterprise → Pro (Downgrade)

**Procedure:**
1. Currently on Enterprise ($299/month)
2. Navigate to Settings > Upgrade
3. Click "Subscribe" under Pro tier
4. Complete checkout

**Expected Behavior:**
- Enterprise subscription canceled immediately
- Pro subscription starts immediately
- NO refund for unused Enterprise time (Stripe default behavior)
- Alternatively: Schedule downgrade for end of billing period

**Verify:**
- DynamoDB tier changes to "pro"
- Old Enterprise subscription shows "Canceled"
- New Pro subscription shows "Active"

---

### 5.4 Verify Prorated Charges

**Check Invoice in Stripe:**
1. Go to: https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/invoices
2. Find latest invoice
3. Expand "Line items"

**Expected Line Items:**
```
[Credit] SnapIT Forum Pro (unused time)     -$14.50
[Charge] SnapIT Forum Business (new)         $99.00
[Charge] Sales Tax (if applicable)            $X.XX
----------------------------------------
Total:                                       $84.50
```

---

## 6. Payment Method Testing

### 6.1 Test with Real Visa

**Card Type:** Visa
**Card Number:** Your real Visa card
**Expected:** Successful payment, no errors

**Verify:**
- Payment method shows "Visa ending in XXXX" in Stripe
- Charge appears on your bank statement within 1-3 days

---

### 6.2 Test with Real Mastercard

**Card Type:** Mastercard
**Card Number:** Your real Mastercard
**Expected:** Successful payment, no errors

**Verify:**
- Payment method shows "Mastercard ending in XXXX"
- Subscription created successfully

---

### 6.3 Test with Real Amex

**Card Type:** American Express
**Card Number:** Your real Amex card
**Expected:** Successful payment

**Note:** Stripe supports Amex but charges slightly higher fees (3.5% vs 2.9%)

---

### 6.4 Test Failed Payment Scenarios

**Scenario 1: Insufficient Funds**
- Use a card with $0 balance OR
- Use a card and immediately freeze it in your bank app
- Expected: Payment declined, Stripe shows error message

**Scenario 2: Invalid CVC**
- Enter wrong CVC code
- Expected: "Your card's security code is incorrect"

**Scenario 3: Expired Card**
- Enter past expiration date
- Expected: "Your card has expired"

**Scenario 4: Invalid ZIP**
- Enter wrong billing ZIP
- Expected: "Your card's ZIP code is incorrect"

**Verify Failed Payments:**
1. Go to: https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/payments
2. Filter by "Failed"
3. See declined payment attempts with reason codes

---

## 7. Webhook Testing

### 7.1 Verify checkout.session.completed

**Trigger:** Complete a subscription purchase

**Expected Webhook Event:**
```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_...",
      "customer": "cus_...",
      "subscription": "sub_...",
      "metadata": {
        "userId": "...",
        "forumId": "...",
        "tier": "pro"
      }
    }
  }
}
```

**Verify:**
```bash
# Check CloudWatch logs
aws logs tail /aws/lambda/snapit-forum-api-prod-stripeWebhook --follow
```

---

### 7.2 Verify customer.subscription.created

**Trigger:** After checkout completes

**Expected:**
- Webhook receives event
- Lambda updates DynamoDB with subscription ID
- Forum tier changes to purchased tier

**Check Logs:**
```bash
aws logs filter-pattern "customer.subscription.created" \
  --log-group-name /aws/lambda/snapit-forum-api-prod-stripeWebhook \
  --start-time $(date -d '1 hour ago' +%s)000
```

---

### 7.3 Verify customer.subscription.updated

**Trigger:** Upgrade/downgrade subscription

**Expected:**
- Webhook receives update event
- DynamoDB tier updates to new tier
- MaxUsers updates accordingly

---

### 7.4 Verify customer.subscription.deleted

**Trigger:** Cancel subscription via Customer Portal

**Expected:**
- Webhook receives deletion event
- DynamoDB tier resets to "free"
- MaxUsers resets to 1500

---

### 7.5 Test Webhooks with Stripe CLI

**Install Stripe CLI:**
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Login
stripe login
```

**Forward Webhooks to Local:**
```bash
# Option 1: Forward to production Lambda
stripe listen --forward-to https://api.snapitsoftware.com/webhooks/stripe

# Option 2: Test webhook signature locally
stripe listen --forward-to http://localhost:3000/webhooks/stripe

# Trigger test event
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

**Verify:**
- CLI shows "Event received: customer.subscription.created"
- Lambda logs show successful processing
- DynamoDB updates correctly

---

## 8. Customer Portal Testing

### 8.1 Access Portal from Settings

**Procedure:**
1. Sign in to https://forum.snapitsoftware.com
2. Navigate to Settings
3. Click "Manage Subscription" or "Billing Portal"
4. Should redirect to Stripe Customer Portal

**Expected URL:**
```
https://billing.stripe.com/p/session/...
```

**Portal Should Show:**
- Current subscription (Pro/Business/Enterprise)
- Next billing date
- Payment method on file
- Invoices/receipts
- Option to cancel

---

### 8.2 Update Payment Method

**Procedure:**
1. In Customer Portal, click "Update payment method"
2. Enter new card details
3. Click "Update"

**Expected:**
- New card saved successfully
- Shows "Visa ending in XXXX" (new card)
- Next charge will use new card

**Verify in Stripe:**
1. Go to customer details
2. Check "Payment methods"
3. Should show new card as default

---

### 8.3 Cancel Subscription

**Procedure:**
1. In Customer Portal, click "Cancel subscription"
2. Select reason (optional)
3. Confirm cancellation

**Expected:**
- Subscription status changes to "Canceling" or "Canceled"
- Access continues until end of billing period
- No further charges

**Verify in DynamoDB:**
- After billing period ends:
  - tier: "free"
  - maxUsers: 1500
  - stripeSubscriptionId: null

---

### 8.4 Resume Subscription

**Procedure:**
1. Cancel subscription
2. Before billing period ends, return to Customer Portal
3. Click "Resume subscription"

**Expected:**
- Subscription status returns to "Active"
- Billing continues as normal
- No interruption in service

---

## 9. Edge Cases to Test

### 9.1 Webhook Fails - What Happens?

**Scenario:** Lambda webhook handler throws error

**Test:**
1. Temporarily break webhook Lambda (deploy bad code)
2. Complete a subscription purchase
3. Webhook fails to process

**Expected Behavior:**
- Stripe retries webhook automatically (up to 3 days)
- User is charged but tier doesn't update in DynamoDB
- After Lambda is fixed, next retry updates tier

**Stripe Retry Schedule:**
- Immediately
- After 5 minutes
- After 15 minutes
- After 1 hour
- Every 3 hours for 3 days

**Manual Fix:**
1. Go to Stripe Dashboard > Webhooks > Events
2. Find failed event
3. Click "Resend event"
4. Verify DynamoDB updates

---

### 9.2 User Closes Browser During Checkout

**Scenario:** User abandons checkout before completing payment

**Test:**
1. Initiate checkout session
2. Close browser window
3. Wait 5 minutes

**Expected:**
- No charge occurs
- Checkout session expires after 24 hours
- User remains on Free tier

**Verify:**
- No subscription created in Stripe
- No payment charged
- DynamoDB tier remains "free"

---

### 9.3 Payment Fails After Successful Checkout

**Scenario:** Card is charged but then fails post-authorization

**Test:**
1. Use a card that will initially succeed
2. Card issuer declines charge after auth
3. (Hard to test - requires specific test cards)

**Expected:**
- Stripe sends `invoice.payment_failed` webhook
- Subscription status: "Past due"
- User receives email to update payment method
- After retry period (3 attempts), subscription cancels

**Manual Test:**
```bash
# Use Stripe CLI
stripe trigger invoice.payment_failed
```

**Verify:**
- Webhook handler logs error
- Optional: Send user email notification
- Subscription status in Stripe shows "Past due"

---

### 9.4 Duplicate Webhook Events

**Scenario:** Stripe sends same webhook event twice

**Current Implementation:**
- No idempotency check (potential issue!)

**Test:**
1. Go to Stripe Dashboard > Webhooks > Events
2. Find a successful event
3. Click "Resend event"

**Expected:**
- Lambda processes event again
- DynamoDB might get updated twice (harmless for tier updates)

**Recommended Fix:**
```javascript
// Add to webhook handler
const processedEvents = new Set();

if (processedEvents.has(event.id)) {
  console.log('Duplicate event, skipping');
  return { statusCode: 200, body: JSON.stringify({ received: true }) };
}
processedEvents.add(event.id);
```

---

### 9.5 User Has Multiple Forums

**Scenario:** User owns 2+ forums, upgrades one

**Test:**
1. Create Forum A
2. Create Forum B
3. Purchase Pro tier

**Expected:**
- Currently: First forum found gets upgraded (may be wrong forum!)
- Ideal: User selects which forum to upgrade

**Current Code Issue:**
```javascript
// In checkout.js - gets first forum
const forums = await dynamodb.query({...});
const forum = forums.Items[0]; // PROBLEM: Assumes 1 forum
```

**Recommended Fix:**
- Add forumId to checkout metadata
- Update only the specified forum

---

## 10. Rollback Plan

### 10.1 How to Refund a Customer

**Scenario:** Customer requests refund

**Full Refund (via Stripe Dashboard):**
1. Go to: https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/payments
2. Find the payment
3. Click "Refund payment"
4. Select "Full refund" ($29.00)
5. Click "Refund"

**Partial Refund:**
1. Same steps as above
2. Select "Partial refund"
3. Enter amount (e.g., $10.00)
4. Add reason (optional)
5. Click "Refund"

**Expected:**
- Funds returned to customer's card in 5-10 days
- Subscription remains active (refund doesn't cancel)
- To cancel: Also cancel subscription

**Via API:**
```bash
# Get payment intent ID
stripe charges list --customer cus_XXXX

# Refund
stripe refunds create --charge ch_XXXX --amount 2900
```

---

### 10.2 How to Manually Fix Tier in DynamoDB

**Scenario:** Webhook failed, user paid but tier not updated

**Manual Fix:**
```bash
# Get forum ID
aws dynamodb scan \
  --table-name snapit-forum-forums-prod \
  --filter-expression "ownerUserId = :uid" \
  --expression-attribute-values '{":uid":{"S":"USER_ID_HERE"}}' \
  --region us-east-1

# Update tier manually
aws dynamodb update-item \
  --table-name snapit-forum-forums-prod \
  --key '{"forumId":{"S":"FORUM_ID_HERE"}}' \
  --update-expression "SET tier = :tier, maxUsers = :max, stripeSubscriptionId = :sub" \
  --expression-attribute-values '{
    ":tier":{"S":"pro"},
    ":max":{"N":"10000"},
    ":sub":{"S":"sub_SUBSCRIPTION_ID"}
  }' \
  --region us-east-1
```

**Verify:**
```bash
# Get updated item
aws dynamodb get-item \
  --table-name snapit-forum-forums-prod \
  --key '{"forumId":{"S":"FORUM_ID_HERE"}}' \
  --region us-east-1
```

---

### 10.3 How to Switch Back to TEST Mode if Issues Occur

**If LIVE mode has critical bugs, revert immediately:**

**Step 1: Update Frontend to TEST Mode**
```bash
# Edit forum-app/src/config.ts
# Change:
export const STRIPE_PUBLISHABLE_KEY = 'pk_live_51SEhK7...';
# To:
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SEhK7...';

# Rebuild and deploy
cd forum-app
npm run build
aws s3 sync build/ s3://snapit-forum-static/ --delete
aws cloudfront create-invalidation --distribution-id E1X8SJIRPSICZ4 --paths "/*"
```

**Step 2: Update Backend to TEST Mode**
```bash
# Get TEST mode secret key from Stripe Dashboard
# (Toggle to "Viewing test data")

# Update SSM with TEST secret key
aws ssm put-parameter \
  --name /snapit-forum/prod/STRIPE_SECRET_KEY \
  --value "sk_test_XXXXXXXXXXXXX" \
  --type SecureString \
  --overwrite \
  --region us-east-1

# Update price IDs to TEST mode prices
aws ssm put-parameter \
  --name /snapit-forum/prod/STRIPE_PRO_PRICE_ID \
  --value "price_TEST_PRO_ID" \
  --type String \
  --overwrite \
  --region us-east-1

# Repeat for Business and Enterprise
```

**Step 3: Redeploy Backend**
```bash
npm run deploy:prod
```

**Step 4: Notify Existing Customers**
```
Subject: Temporary Payment Processing Maintenance

Dear SnapIT Forum Customer,

We are performing maintenance on our payment system.
Your subscription remains active, but new purchases
are temporarily unavailable.

We apologize for the inconvenience.

- SnapIT Team
```

**Step 5: Fix Issue in TEST Mode**
- Test thoroughly with test cards
- Verify webhooks work
- Check all edge cases

**Step 6: Return to LIVE Mode**
- Follow STRIPE-LIVE-MODE-SETUP.md again
- Test with small real charge first
- Monitor CloudWatch logs closely

---

## Testing Summary

### Critical Test Scenarios

**Must Test Before Launch:**
- [ ] Pro tier purchase ($29) - SUCCESS
- [ ] Business tier purchase ($99) - SUCCESS
- [ ] Enterprise tier purchase ($299) - SUCCESS
- [ ] Upgrade Pro → Business - PRORATED CORRECTLY
- [ ] Downgrade Enterprise → Pro - WORKS
- [ ] Payment with Visa - SUCCESS
- [ ] Payment with Mastercard - SUCCESS
- [ ] Payment with Amex - SUCCESS
- [ ] Failed payment (insufficient funds) - HANDLED GRACEFULLY
- [ ] Webhook checkout.session.completed - PROCESSED
- [ ] Webhook customer.subscription.created - UPDATES DB
- [ ] Webhook customer.subscription.deleted - RESETS TIER
- [ ] Customer Portal access - WORKS
- [ ] Update payment method - SAVES NEW CARD
- [ ] Cancel subscription - DOWNGRADES AT END OF PERIOD
- [ ] Resume subscription - RESTORES ACCESS
- [ ] Webhook failure retry - EVENTUALLY SUCCEEDS
- [ ] Browser close during checkout - NO CHARGE
- [ ] Refund customer - FUNDS RETURNED

---

## Risks Identified

### High Risk

**1. Webhook Idempotency**
- **Issue:** No duplicate event detection
- **Impact:** Same event could process twice
- **Mitigation:** Add event ID tracking with DynamoDB

**2. Multiple Forums Per User**
- **Issue:** Upgrade applies to first forum found
- **Impact:** Wrong forum might get upgraded
- **Mitigation:** Add forum selection to checkout flow

**3. Test Mode Keys in Production**
- **Issue:** If test keys used, no real charges occur
- **Impact:** Users get paid features for free
- **Mitigation:** Pre-launch verification checklist (Section 1)

---

### Medium Risk

**4. Webhook Endpoint Down**
- **Issue:** If Lambda fails, tier updates fail
- **Impact:** Paid users stuck on free tier
- **Mitigation:** Stripe auto-retries for 3 days + CloudWatch alarms

**5. Failed Payment After Auth**
- **Issue:** Card authorized but charge fails
- **Impact:** User thinks they're subscribed but aren't
- **Mitigation:** Monitor invoice.payment_failed webhooks

**6. Proration Confusion**
- **Issue:** Users don't understand prorated charges
- **Impact:** Support tickets, chargebacks
- **Mitigation:** Clear messaging on upgrade flow

---

### Low Risk

**7. Customer Portal Configuration**
- **Issue:** Portal settings not optimized
- **Impact:** Users confused by options
- **Mitigation:** Review Stripe portal settings

**8. Tax Handling**
- **Issue:** No automatic tax collection configured
- **Impact:** Tax compliance issues in some regions
- **Mitigation:** Enable Stripe Tax if needed

---

## CloudWatch Monitoring

### Set Up Alerts

**Failed Webhook Alert:**
```bash
# Create alarm for webhook errors
aws cloudwatch put-metric-alarm \
  --alarm-name stripe-webhook-failures \
  --alarm-description "Alert when Stripe webhooks fail" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 1 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=snapit-forum-api-prod-stripeWebhook
```

**Monitor Live:**
```bash
# Watch webhook processing
aws logs tail /aws/lambda/snapit-forum-api-prod-stripeWebhook --follow

# Watch checkout sessions
aws logs tail /aws/lambda/snapit-forum-api-prod-createCheckoutSession --follow

# Filter for errors
aws logs filter-pattern "ERROR" \
  --log-group-name /aws/lambda/snapit-forum-api-prod-stripeWebhook \
  --start-time $(date -d '1 hour ago' +%s)000
```

---

## Test Results Checklist

After completing all tests, fill out:

### Tier Purchases
- [ ] Pro ($29) - Date tested: _____ Result: _____
- [ ] Business ($99) - Date tested: _____ Result: _____
- [ ] Enterprise ($299) - Date tested: _____ Result: _____

### Upgrades/Downgrades
- [ ] Pro → Business - Date tested: _____ Result: _____
- [ ] Business → Enterprise - Date tested: _____ Result: _____
- [ ] Enterprise → Pro - Date tested: _____ Result: _____

### Payment Methods
- [ ] Visa - Date tested: _____ Result: _____
- [ ] Mastercard - Date tested: _____ Result: _____
- [ ] Amex - Date tested: _____ Result: _____
- [ ] Failed payment - Date tested: _____ Result: _____

### Webhooks
- [ ] checkout.session.completed - Date tested: _____ Result: _____
- [ ] customer.subscription.created - Date tested: _____ Result: _____
- [ ] customer.subscription.updated - Date tested: _____ Result: _____
- [ ] customer.subscription.deleted - Date tested: _____ Result: _____

### Customer Portal
- [ ] Access portal - Date tested: _____ Result: _____
- [ ] Update payment method - Date tested: _____ Result: _____
- [ ] Cancel subscription - Date tested: _____ Result: _____
- [ ] Resume subscription - Date tested: _____ Result: _____

### Edge Cases
- [ ] Webhook failure - Date tested: _____ Result: _____
- [ ] Browser closed - Date tested: _____ Result: _____
- [ ] Duplicate webhook - Date tested: _____ Result: _____

### Rollback
- [ ] Refund tested - Date tested: _____ Result: _____
- [ ] Manual tier fix tested - Date tested: _____ Result: _____
- [ ] Switch to TEST mode - Date tested: _____ Result: _____

---

## Sign-Off

**Tester Name:** _____________________
**Date:** _____________________
**All critical tests passed:** [ ] YES [ ] NO
**Ready for production launch:** [ ] YES [ ] NO

**Notes:**
_______________________________________________
_______________________________________________
_______________________________________________

---

**END OF TESTING GUIDE**

For issues or questions:
- Email: snapitsaas@gmail.com
- GitHub: https://github.com/terrellflautt/PGP-Forum
- Stripe Dashboard: https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ

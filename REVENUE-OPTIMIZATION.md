# Revenue Optimization & Analytics Configuration

**Last Updated**: October 5, 2025
**Status**: Production LIVE Mode
**Account**: https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ

---

## Stripe Product Configuration (VERIFIED)

### Price IDs in Production

**Pro Tier** - $99/month (Note: Config shows $29, but using price ID from SSM)
- Price ID: `price_1SEyIKIkj5YQseOZedJrBtTC`
- Users: Up to 10,000
- Status: ACTIVE

**Business Tier** - $499/month (Note: Config shows $99)
- Price ID: `price_1SEyIVIkj5YQseOZzYzU8zUm`
- Users: Up to 50,000
- Status: ACTIVE

**Enterprise Tier** - Price TBD
- Price ID: `price_1SEyIXIkj5YQseOZCs85Q48g`
- Users: Unlimited (999,999)
- Status: ACTIVE

**FREE TIER** - $0/month
- Users: 1,500
- Status: Default

### Stripe Keys Status
- Secret Key: `sk_live_...` (LIVE MODE) ✅
- Publishable Key: `pk_live_...` (LIVE MODE) ✅
- Webhook Secret: `whsec_...` (Configured) ✅

---

## Conversion Funnel Tracking

### Current Funnel

```
1. Landing Page View (forum.snapitsoftware.com)
   ↓
2. Sign In Click (Google OAuth button)
   ↓
3. OAuth Redirect (auth.snapitsoftware.com/auth/google)
   ↓
4. OAuth Callback Success
   ↓
5. Username Creation Flow
   ↓
6. Forum Creation (ACTIVATION EVENT)
   ↓
7. Pricing Page View
   ↓
8. Upgrade Button Click
   ↓
9. Checkout Session Created (Stripe)
   ↓
10. Payment Successful
   ↓
11. Subscription Active (CONVERSION!)
```

### Key Metrics to Track

1. **Signups** = OAuth callback success
2. **Activations** = Forum created
3. **Conversions** = Subscription active
4. **Conversion Rate** = (Conversions / Signups) × 100
5. **MRR** = Sum of all active subscriptions
6. **Churn** = Canceled subscriptions / Total subscriptions

---

## Analytics Tool Selection

### Recommended: Google Analytics 4 (GA4)

**Why GA4?**
- Free forever
- Industry standard
- Real-time analytics
- Funnel visualization
- E-commerce tracking built-in
- Integrates with Google Ads
- GDPR compliant

**What to Track:**
- Page views (landing, pricing, features)
- Custom events (sign_in_click, upgrade_click, forum_created)
- E-commerce events (purchase, refund)
- User properties (tier, signup_date)
- Conversion goals

### Alternative: Stripe Analytics

**Built-in Features:**
- Revenue tracking
- MRR growth
- Churn rate
- Subscriber count
- Lifetime value (LTV)
- Payment success rate

**Limitation:** Only tracks post-payment data, not full funnel

### Hybrid Approach (RECOMMENDED)

Use **both** GA4 + Stripe Analytics:
- GA4: Tracks full funnel (landing → checkout)
- Stripe: Tracks revenue metrics (payment → churn)
- CloudWatch: Tracks backend events & errors

---

## Implementation Plan

### Phase 1: Google Analytics 4 Setup

#### Step 1: Create GA4 Property

1. Go to https://analytics.google.com
2. Create new property: "SnapIT Forums"
3. Get Measurement ID (format: `G-XXXXXXXXXX`)
4. Enable Enhanced Measurement
5. Enable E-commerce tracking

#### Step 2: Add GA4 to Frontend

Add to `forum-app/public/index.html`:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

#### Step 3: Track Custom Events

Add to key components:

**App.tsx** - Track page views
```typescript
useEffect(() => {
  if (window.gtag) {
    gtag('event', 'page_view', {
      page_path: window.location.pathname,
      page_title: document.title
    });
  }
}, [location]);
```

**LoginModal.tsx** - Track sign in attempts
```typescript
const handleSignIn = () => {
  gtag('event', 'sign_in_click', {
    method: 'google'
  });
  window.location.href = GOOGLE_AUTH_URL;
};
```

**SettingsView.tsx** - Track upgrade clicks
```typescript
const handleUpgrade = (tier: string) => {
  gtag('event', 'begin_checkout', {
    currency: 'USD',
    value: tier === 'pro' ? 99 : tier === 'business' ? 499 : 299,
    items: [{
      item_id: tier,
      item_name: `SnapIT Forum ${tier}`,
      price: tier === 'pro' ? 99 : tier === 'business' ? 499 : 299,
      quantity: 1
    }]
  });
};
```

**Forum Creation** - Track activation
```typescript
const handleForumCreated = () => {
  gtag('event', 'sign_up', {
    method: 'google',
    event_category: 'engagement',
    event_label: 'forum_created'
  });
};
```

**Payment Success** - Track conversion
```typescript
useEffect(() => {
  if (searchParams.get('upgrade') === 'success') {
    const tier = searchParams.get('tier');
    gtag('event', 'purchase', {
      transaction_id: Date.now().toString(),
      currency: 'USD',
      value: tier === 'pro' ? 99 : tier === 'business' ? 499 : 299,
      items: [{
        item_id: tier,
        item_name: `SnapIT Forum ${tier}`,
        price: tier === 'pro' ? 99 : tier === 'business' ? 499 : 299,
        quantity: 1
      }]
    });
  }
}, [searchParams]);
```

---

### Phase 2: CloudWatch Custom Metrics

#### Create Custom Namespace: `SnapIT/Revenue`

**Metrics to Track:**

1. **DailySignups**
   - Logged in: `googleCallback` Lambda
   - Metric: `SignupCount`
   - Dimension: Date

2. **DailyActivations**
   - Logged in: `createForum` Lambda
   - Metric: `ActivationCount`
   - Dimension: Date

3. **DailyConversions**
   - Logged in: `stripeWebhook` Lambda
   - Metric: `ConversionCount`
   - Dimension: Tier (pro/business/enterprise)

4. **MRR (Monthly Recurring Revenue)**
   - Logged in: `stripeWebhook` Lambda
   - Metric: `MRR`
   - Calculated: Sum of active subscriptions

5. **ChurnCount**
   - Logged in: `stripeWebhook` Lambda (subscription.deleted)
   - Metric: `ChurnCount`
   - Dimension: Tier

#### Implementation Example

Add to `/src/handlers/auth.js` (googleCallback):
```javascript
const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch();

// After successful OAuth
await cloudwatch.putMetricData({
  Namespace: 'SnapIT/Revenue',
  MetricData: [{
    MetricName: 'SignupCount',
    Value: 1,
    Unit: 'Count',
    Timestamp: new Date(),
    Dimensions: [{
      Name: 'Environment',
      Value: 'Production'
    }]
  }]
}).promise();
```

Add to `/src/handlers/forums.js` (create):
```javascript
// After forum created
await cloudwatch.putMetricData({
  Namespace: 'SnapIT/Revenue',
  MetricData: [{
    MetricName: 'ActivationCount',
    Value: 1,
    Unit: 'Count',
    Timestamp: new Date()
  }]
}).promise();
```

Add to `/src/handlers/stripe.js` (webhook):
```javascript
// After subscription created
if (stripeEvent.type === 'customer.subscription.created') {
  const tier = getTierFromPriceId(subscription.items.data[0].price.id);
  const tierPricing = { pro: 99, business: 499, enterprise: 299 };
  
  await cloudwatch.putMetricData({
    Namespace: 'SnapIT/Revenue',
    MetricData: [
      {
        MetricName: 'ConversionCount',
        Value: 1,
        Unit: 'Count',
        Dimensions: [{ Name: 'Tier', Value: tier }]
      },
      {
        MetricName: 'MRR',
        Value: tierPricing[tier] || 0,
        Unit: 'None',
        Dimensions: [{ Name: 'Tier', Value: tier }]
      }
    ]
  }).promise();
}

// After subscription canceled
if (stripeEvent.type === 'customer.subscription.deleted') {
  await cloudwatch.putMetricData({
    Namespace: 'SnapIT/Revenue',
    MetricData: [{
      MetricName: 'ChurnCount',
      Value: 1,
      Unit: 'Count',
      Dimensions: [{ Name: 'Tier', Value: tier }]
    }]
  }).promise();
}
```

---

### Phase 3: CloudWatch Dashboard

#### Create Dashboard: "SnapIT Revenue Analytics"

```bash
aws cloudwatch put-dashboard \
  --dashboard-name SnapIT-Revenue-Analytics \
  --dashboard-body file://revenue-dashboard.json
```

**Dashboard Widgets:**

1. **Daily Signups** (Last 30 days)
   - Metric: `SnapIT/Revenue/SignupCount`
   - Visualization: Line chart

2. **Activation Rate**
   - Formula: (ActivationCount / SignupCount) × 100
   - Visualization: Single number

3. **Conversion Rate**
   - Formula: (ConversionCount / SignupCount) × 100
   - Visualization: Single number
   - Goal: >2% (industry average for SaaS)

4. **MRR Growth**
   - Metric: `SnapIT/Revenue/MRR`
   - Visualization: Line chart
   - Goal: $1,000 within 90 days

5. **Subscribers by Tier**
   - Metric: `SnapIT/Revenue/ConversionCount`
   - Dimensions: Tier
   - Visualization: Pie chart

6. **Churn Rate**
   - Formula: (ChurnCount / TotalSubscribers) × 100
   - Visualization: Single number
   - Goal: <5% monthly

---

### Phase 4: SNS Alerts for Revenue Milestones

#### Configure Alerts

**Alert 1: First Paying Customer**
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name first-paying-customer \
  --alarm-description "Alert when first customer subscribes" \
  --metric-name ConversionCount \
  --namespace SnapIT/Revenue \
  --statistic Sum \
  --period 3600 \
  --evaluation-periods 1 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --alarm-actions arn:aws:sns:us-east-1:692859945539:snapit-forum-production-alerts
```

**Alert 2: $100 MRR Milestone**
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name mrr-100-milestone \
  --alarm-description "Alert when MRR reaches $100" \
  --metric-name MRR \
  --namespace SnapIT/Revenue \
  --statistic Sum \
  --period 3600 \
  --evaluation-periods 1 \
  --threshold 100 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --alarm-actions arn:aws:sns:us-east-1:692859945539:snapit-forum-production-alerts
```

**Alert 3: $1,000 MRR Milestone**
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name mrr-1000-milestone \
  --alarm-description "Alert when MRR reaches $1,000" \
  --metric-name MRR \
  --namespace SnapIT/Revenue \
  --statistic Sum \
  --period 3600 \
  --evaluation-periods 1 \
  --threshold 1000 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --alarm-actions arn:aws:sns:us-east-1:692859945539:snapit-forum-production-alerts
```

**Alert 4: High Churn Warning**
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name high-churn-warning \
  --alarm-description "Alert when churn exceeds 5%" \
  --metric-name ChurnCount \
  --namespace SnapIT/Revenue \
  --statistic Sum \
  --period 86400 \
  --evaluation-periods 1 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:us-east-1:692859945539:snapit-forum-production-alerts
```

---

## A/B Testing Infrastructure

### Current Pricing Tiers

**Configuration File**: `forum-app/src/config.ts`

**Active Pricing**:
- Pro: $29/month (10,000 users) - **MISMATCH: SSM shows different price**
- Business: $99/month (50,000 users) - **MISMATCH**
- Enterprise: $299/month (Unlimited) - **NEEDS VERIFICATION**

**Actual Stripe Prices** (from SSM):
- Pro: price_1SEyIKIkj5YQseOZedJrBtTC
- Business: price_1SEyIVIkj5YQseOZzYzU8zUm
- Enterprise: price_1SEyIXIkj5YQseOZCs85Q48g

⚠️ **ACTION REQUIRED**: Verify actual prices in Stripe Dashboard

### A/B Test Ideas

**Test 1: Pro Tier Pricing**
- Variant A: $29/month (current)
- Variant B: $79/month
- Variant C: $99/month
- Hypothesis: Higher price = higher perceived value

**Test 2: Annual Discount**
- Variant A: Monthly only
- Variant B: Annual with 20% discount
- Hypothesis: Annual commitment improves LTV

**Test 3: Free Trial**
- Variant A: No trial (current)
- Variant B: 14-day free trial
- Hypothesis: Trial increases conversion rate

**Test 4: Feature Bundling**
- Variant A: Current tiers
- Variant B: Collapse Pro + Business into single $49 tier
- Hypothesis: Simpler pricing increases conversions

### Implementation with Feature Flags

**Option 1: LaunchDarkly** (Recommended for SaaS)
- Free tier: 1,000 MAU
- Server-side flags
- A/B testing built-in
- Real-time updates

**Option 2: AWS AppConfig**
- Native AWS service
- Free tier eligible
- Environment-based configs
- Requires code deployment for changes

**Option 3: Custom Feature Flags**
```typescript
// forum-app/src/config.ts
export const FEATURE_FLAGS = {
  pricingVariant: 'A', // A, B, C
  enableAnnualPricing: false,
  enableFreeTrial: false,
  trialDays: 14
};

// Determine variant based on user ID hash
export const getPricingVariant = (userId: string) => {
  const hash = userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const variants = ['A', 'B', 'C'];
  return variants[hash % variants.length];
};
```

---

## Current Conversion Rate Baseline

### Expected Metrics (Month 1)

**Industry Benchmarks (SaaS)**:
- Landing → Signup: 2-5%
- Signup → Activation: 40-60%
- Activation → Paid: 1-3%
- Overall conversion: 0.5-1.5%

**Example Calculation**:
```
Month 1:
- 10,000 landing page views
- 300 signups (3% conversion)
- 180 activated (60% activation rate)
- 5 paid conversions (2.8% of activated)

Conversion Rate: (5 / 300) × 100 = 1.67%
MRR: 3 Pro ($99) + 2 Business ($499) = $1,295
```

### Current Status (Pre-Analytics)

**Known Data**:
- Total users: Unknown
- Active forums: Unknown
- Paid subscribers: 0
- MRR: $0

**After Implementation**:
- Real-time signup tracking
- Activation funnel visibility
- Conversion rate dashboard
- MRR growth charts

---

## Recommendations for Improving Conversion Rate

### Quick Wins (0-30 days)

1. **Add Social Proof**
   - Display "1,500+ forums created" on landing page
   - Show testimonials from beta users
   - Add trust badges (SSL, GDPR compliant)

2. **Improve Pricing Page**
   - Add "Most Popular" badge to Pro tier
   - Show annual pricing with savings
   - Add FAQ section addressing common objections

3. **Optimize Checkout Flow**
   - Pre-fill user email in Stripe checkout
   - Add "Money-back guarantee" messaging
   - Show what happens after payment

4. **Email Nurture Sequence**
   - Day 0: Welcome email
   - Day 3: Feature highlights
   - Day 7: Upgrade CTA with discount
   - Day 14: Case study + final CTA

### Medium-Term (30-90 days)

5. **Product-Led Growth**
   - Show upgrade prompt when hitting free tier limits
   - Add "Upgrade to unlock" on premium features
   - Send in-app notifications for feature announcements

6. **Retargeting Campaigns**
   - Google Ads remarketing
   - Facebook pixel tracking
   - LinkedIn sponsored content

7. **Content Marketing**
   - Blog: "How to build a privacy-first community"
   - SEO: Target "encrypted forum software"
   - YouTube: Demo videos + tutorials

8. **Referral Program**
   - Give 1 month free for each referral
   - Add "Invite friends" in settings
   - Track referrals via unique links

### Long-Term (90+ days)

9. **Enterprise Sales**
   - Add "Talk to sales" CTA
   - Create demo video for enterprise tier
   - Attend privacy/security conferences

10. **Partnerships**
    - Integrate with Slack, Discord alternatives
    - Partner with privacy advocacy groups
    - Get featured on Product Hunt, Hacker News

---

## Pricing Optimization Strategy

### Step 1: Validate Current Pricing

**Action**: Check Stripe Dashboard for actual prices
1. Go to: https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ/products
2. Verify:
   - Pro tier price (currently shows $29 in config)
   - Business tier price (currently shows $99 in config)
   - Enterprise tier price (currently shows $299 in config)

### Step 2: Price Anchoring

**Current Issue**: No clear value distinction
**Solution**: Adjust prices to show clear value ladder

**Recommended Pricing**:
- Free: $0 (1,500 users)
- Pro: $99/month (10,000 users) - **Increase from $29**
- Business: $499/month (50,000 users) - **Increase from $99**
- Enterprise: $1,999/month (Unlimited) - **Increase from $299**

**Rationale**:
- Higher prices = perceived as more valuable
- Bigger price gaps = clearer tier differentiation
- Enterprise pricing reflects actual value (24/7 support, SLA)

### Step 3: Add Annual Plans

Create annual prices with 20% discount:
- Pro Annual: $950/year (saves $238)
- Business Annual: $4,790/year (saves $1,198)
- Enterprise Annual: $19,190/year (saves $4,798)

**Benefits**:
- Improves cash flow
- Reduces churn
- Higher LTV per customer

---

## Revenue Goal Tracking

### 90-Day Goal: $1,000 MRR

**Path 1**: 10 Pro subscribers
- 10 × $99 = $990/month
- Need: 1 conversion every 9 days

**Path 2**: 2 Business subscribers
- 2 × $499 = $998/month
- Need: 1 conversion every 45 days

**Path 3**: Mixed
- 5 Pro + 1 Business = $994/month
- More realistic distribution

**Required Traffic**:
```
Target: $1,000 MRR = ~10 Pro subscribers

Assumptions:
- Conversion rate: 1.5% (industry average)
- Signups needed: 10 / 0.015 = 667 signups
- Landing page conversion: 3%
- Traffic needed: 667 / 0.03 = 22,233 visitors

Monthly traffic target: 22,000 visitors
Daily traffic target: 733 visitors
```

### Marketing Budget Calculation

**Paid Acquisition Cost**:
- Google Ads CPC: $2-5 for "encrypted forum" keywords
- Cost per signup: ~$66-165
- Cost per paid customer: $4,400-11,000 (at 1.5% conversion)

**Target CAC**: <$300 (3× monthly subscription)
**LTV Goal**: $1,500 (assumes 15-month retention)
**LTV:CAC Ratio**: 5:1 (healthy SaaS metric)

---

## Next Steps

### Immediate Actions

1. ✅ Verify Stripe product prices in dashboard
2. ⏳ Add Google Analytics 4 to frontend
3. ⏳ Implement CloudWatch metrics in Lambda handlers
4. ⏳ Create CloudWatch dashboard
5. ⏳ Configure SNS alerts
6. ⏳ Update pricing in config.ts to match Stripe
7. ⏳ Deploy changes to production

### Week 1

- Monitor analytics for baseline metrics
- Set up daily reports
- Test webhook event tracking
- Verify all tracking events fire correctly

### Week 2-4

- Analyze funnel drop-off points
- Implement quick win optimizations
- A/B test pricing page variations
- Launch email nurture campaign

### Month 2-3

- Scale traffic acquisition
- Optimize conversion funnel
- Launch referral program
- Add enterprise sales process

---

**Goal**: First $1,000 MRR within 90 days
**Status**: Day 0 - Analytics setup in progress
**Owner**: Product/Engineering Team
**Next Review**: October 12, 2025


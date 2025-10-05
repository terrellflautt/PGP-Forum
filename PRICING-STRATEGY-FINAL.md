# SnapIT Forums + Messenger - Strategic Pricing Model
## Freemium + Usage-Based Billing (Serverless Architecture)

**Philosophy:** Every scaling decision must be profitable. Pricing is the ultimate expression of serverless architecture.

---

## I. Strategic Pricing Philosophy

### Three Target Segments:

1. **The Acquired User (Free Tier):** Maximize sign-ups up to 1,500-user limit, competing with ProBoards' ease of entry
2. **The Scaled Community (Pro Tier):** Monetize customers exceeding 1,500 users or needing professional admin features
3. **The Enterprise/Security Buyer (Business Tier):** Capture high-value organizations requiring compliance, PGP/E2EE, superior controls

### Critical Upgrade Triggers:

| Trigger Mechanism | Tier | Rationale |
|---|---|---|
| **User Capacity Limit (1,500)** | Pro/Business | Primary paywall driver - security guarantee + scale |
| **Moderator/Staff Seats** | Pro/Business | Free tier: 1-2 admins; Professional communities need team moderation (Discourse model) |
| **Data Storage (DynamoDB)** | Pro/Business | Free: 25GB (AWS Free Tier), Paid: Per GB above baseline |
| **API Requests (Activity)** | Pro/Business | Free: 1M calls/month, Paid: Per 1M above baseline |
| **Advanced PGP Features** | Pro/Business | Secure Shredder, Custom Ephemeral Timers, Key Management |

---

## II. Tiered Pricing Structure

### Tier 1: FREE (Acquisition Engine)

**Price:** $0/month (Utilizes AWS Free Tier)

**Forum Features:**
- ✅ Maximum 1,500 registered members
- ✅ 1 Admin/Moderator seat (maximum)
- ✅ Basic forum (categories, threads, posts)
- ✅ Community support
- ❌ No custom domain
- ❌ No custom themes
- ❌ No SSO

**Messenger Features:**
- ✅ End-to-End Encrypted (E2EE) text chat
- ✅ Basic ephemeral messaging (1-hour self-destruct)
- ✅ 1-on-1 messaging (unlimited)
- ✅ Group chats (up to 25 members)
- ✅ File sharing (5MB, P2P only)
- ❌ No voice/video calls
- ❌ No multimedia E2EE
- ❌ No secure shredder
- ❌ No custom ephemeral timers

**Resource Limits:**
- Storage: 25 GB (DynamoDB + S3 combined)
- API Requests: 1 Million/month
- Dead Man's Switches: 1 active

**Competitive Positioning:**
- More generous than ProBoards (1,500 users vs limited features)
- Superior security (PGP by default vs none)
- Free tier includes messaging (competitors charge extra)

---

### Tier 2: PRO ($99/month)

**Price:** $99/month (Undercuts Discourse's $100/month entry price)

**Forum Features:**
- ✅ **Unlimited members** (subject to usage metering)
- ✅ Up to 5 Staff/Moderator seats (add-ons: $10/seat/month above 5)
- ✅ Custom domain integration
- ✅ Custom themes and branding
- ✅ Advanced moderation tools
- ✅ API access (full REST API)
- ✅ Email support
- ✅ Plugin marketplace access

**Messenger Features:**
- ✅ E2EE for **voice, video, and file sharing**
- ✅ **Secure Shredder** (7-pass DoD overwrite)
- ✅ **Custom ephemeral timers** (5 seconds to 30 days)
- ✅ Group chats (up to 100 members)
- ✅ File sharing (100MB, P2P + server fallback)
- ✅ Voice/video calls (up to 8 participants)
- ✅ PGP key management (multiple keys, backup)
- ✅ Contact verification (QR codes, fingerprints)
- ✅ Disappearing media (view-once photos)

**Resource Baselines (Included):**
- Storage: 500 GB/month (pooled DynamoDB + S3)
- API Requests: 5 Million/month
- Dead Man's Switches: 10 active

**Usage Overages:**
- Storage: $0.25 per GB above 500GB
- API Requests: $1.50 per 1M above 5M

**Target Customer:**
- Growing communities (1,500-10,000 members)
- Professional moderators needing team access
- Security-conscious users wanting advanced PGP features

---

### Tier 3: BUSINESS ($499/month or Custom Quote)

**Price:** $499/month (base) + usage overages

**Forum Features:**
- ✅ Unlimited members
- ✅ Up to 25 Staff/Moderator seats (add-ons: $10/seat)
- ✅ Everything in Pro +
- ✅ **Dedicated migration service**
- ✅ **Priority 24/7 support**
- ✅ **Single Sign-On (SSO)** - SAML/OAuth
- ✅ **Full audit logs** (compliance reporting)
- ✅ **White-label branding** (remove SnapIT logos)
- ✅ **SLA guarantee** (99.9% uptime)
- ✅ **Dedicated account manager**

**Messenger Features:**
- ✅ Everything in Pro +
- ✅ **Consistent metadata restraint** (no connection logs)
- ✅ **Zero-knowledge verification** (ZKP for passwordless login)
- ✅ Group chats (up to 500 members)
- ✅ File sharing (1GB, unlimited P2P)
- ✅ Voice/video calls (up to 50 participants)
- ✅ **Compliance certifications** (GDPR, HIPAA-ready, SOC 2)
- ✅ **On-premise deployment option** (Enterprise add-on)

**Resource Baselines (Included):**
- Storage: 2 TB/month
- API Requests: 50 Million/month
- Dead Man's Switches: Unlimited

**Usage Overages:**
- Storage: $0.20 per GB above 2TB (volume discount)
- API Requests: $1.00 per 1M above 50M (volume discount)

**Target Customer:**
- Large organizations (10,000+ members)
- Compliance-driven industries (finance, healthcare, legal)
- Government agencies needing certified security
- Enterprises with SSO/SAML requirements

---

## III. Advanced Paid Features Matrix

### Messenger Features by Tier

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| **E2EE Text Chat** | ✅ | ✅ | ✅ |
| **E2EE Voice/Video** | ❌ | ✅ | ✅ |
| **E2EE File Sharing** | ⚠️ 5MB | ✅ 100MB | ✅ 1GB+ |
| **Secure Shredder** | ❌ | ✅ | ✅ |
| **Custom Ephemeral Timers** | ⚠️ 1 hour only | ✅ 5 sec - 30 days | ✅ Custom |
| **Group Chat Size** | 25 members | 100 members | 500 members |
| **Voice/Video Calls** | ❌ | ✅ Up to 8 | ✅ Up to 50 |
| **PGP Key Management** | ⚠️ Basic | ✅ Advanced | ✅ Enterprise |
| **Disappearing Media** | ❌ | ✅ | ✅ |
| **Contact Verification** | ⚠️ Manual | ✅ QR code | ✅ ZKP |
| **Metadata Restraint** | ⚠️ Basic | ⚠️ Basic | ✅ Guaranteed |
| **Dead Man's Switch** | 1 active | 10 active | Unlimited |

### Forum Features by Tier

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| **Max Members** | 1,500 | Unlimited* | Unlimited* |
| **Admin/Mod Seats** | 1 | 5 (+$10/seat) | 25 (+$10/seat) |
| **Custom Domain** | ❌ | ✅ | ✅ |
| **Custom Themes** | ❌ | ✅ | ✅ |
| **White-Label** | ❌ | ❌ | ✅ |
| **SSO/SAML** | ❌ | ❌ | ✅ |
| **API Access** | ❌ | ✅ | ✅ |
| **Audit Logs** | ❌ | ⚠️ Basic | ✅ Full |
| **Migration Service** | ❌ | ⚠️ Self-service | ✅ Dedicated |
| **Support** | Community | Email | 24/7 Priority |
| **SLA** | ❌ | ⚠️ Best effort | ✅ 99.9% |

\* Subject to usage metering overages

---

## IV. Usage-Based Metering (Financial Firewall)

### Stripe Metered Billing Implementation

**Purpose:** Protect infrastructure costs while enabling unlimited scale

**Metered Resources:**

#### 1. Storage (DynamoDB + S3)

**Unit:** Per GB/month

**Pricing:**
- **Pro Tier:** $0.25/GB above 500GB baseline
- **Business Tier:** $0.20/GB above 2TB baseline (volume discount)

**Cost Driver:**
- Multimedia uploads (images, videos, files)
- Attachment storage in messenger
- Long message history retention

**Example Calculation:**
```
Pro customer uses 750GB in a month:
  Baseline: 500GB (included)
  Overage: 250GB × $0.25 = $62.50

Total Bill: $99 (base) + $62.50 (storage) = $161.50
```

**Stripe Implementation:**
```javascript
// Track storage usage
await stripe.subscriptionItems.createUsageRecord(
  subscriptionItemId,
  {
    quantity: storageGB,
    timestamp: Math.floor(Date.now() / 1000),
    action: 'set',
  }
);
```

#### 2. API Gateway Requests

**Unit:** Per 1 Million requests

**Pricing:**
- **Pro Tier:** $1.50 per 1M above 5M baseline
- **Business Tier:** $1.00 per 1M above 50M baseline

**Cost Driver:**
- High-frequency messaging
- Real-time chat activity
- Viral community growth
- Bot/automation usage

**Example Calculation:**
```
Pro customer generates 12M API requests in a month:
  Baseline: 5M (included)
  Overage: 7M × $1.50 = $10.50

Total Bill: $99 (base) + $10.50 (API) = $109.50
```

**Stripe Implementation:**
```javascript
// Track API requests
await stripe.subscriptionItems.createUsageRecord(
  subscriptionItemId,
  {
    quantity: apiRequestsInMillions,
    timestamp: Math.floor(Date.now() / 1000),
    action: 'increment',
  }
);
```

### Monitoring & Alerts

**Customer Dashboard:**
- Real-time usage graph (storage, API requests)
- Projected monthly cost
- Alerts at 80%, 90%, 100% of baseline
- Download detailed usage reports

**Admin Controls:**
- Set usage caps (prevent bill shock)
- Auto-upgrade to higher tier when consistently over baseline
- Pay-as-you-go option (no tier subscription, just usage fees)

---

## V. Global Payment Workaround (Pix, UPI)

### The Problem

Pix (Brazil) and UPI (India) are **real-time payment methods** that do NOT support recurring subscriptions.

**Impact:**
- Cannot charge $99/month automatically via Pix/UPI
- Must implement alternative billing flow

### Solution: Fixed-Term Pre-Paid Subscriptions

**Offer Multi-Month Plans:**

| Plan | Monthly Equivalent | Total Price (USD) | Total Price (BRL) | Total Price (INR) | Discount |
|------|-------------------|-------------------|-------------------|-------------------|----------|
| **1 Month** | $99/mo | $99 | R$169 | ₹1,699 | 0% |
| **3 Months** | $89/mo | $267 | R$456 | ₹4,599 | 10% |
| **6 Months** | $79/mo | $474 | R$810 | ₹8,199 | 20% |
| **12 Months** | $69/mo | $828 | R$1,416 | ₹14,299 | 30% |

**Implementation:**

1. **Pix (Brazil):**
   - User selects "6 months Pro"
   - Stripe generates Pix QR code for R$810
   - User scans QR in banking app → instant payment
   - Account upgraded to Pro for 6 months
   - 7 days before expiry: Email/push notification with new Pix QR

2. **UPI (India):**
   - User selects "3 months Pro"
   - Stripe generates UPI payment link (₹4,599)
   - User clicks link → Opens UPI app → Approves payment
   - Account upgraded to Pro for 3 months
   - 7 days before expiry: Notification with new UPI link

**Renewal Automation:**
```javascript
// 7 days before expiration
const renewalDate = subscriptionEndDate - (7 * 24 * 60 * 60 * 1000);

// Send email + push notification
await sendRenewalNotification({
  user,
  plan: 'Pro 6 Months',
  price: 'R$810',
  paymentMethod: 'Pix',
  qrCode: generatePixQR(amount),
  expiresIn: '7 days'
});
```

**User Experience:**
- Week before expiry: "Your Pro plan expires in 7 days. Renew now with Pix!"
- Click notification → Opens renewal page with QR code
- Scan → Pay → Instant renewal (seamless)

**Benefits:**
- No payment failures (real-time confirmation)
- Lower transaction fees (Pix: ~0.5% vs card: 2.9%)
- Aligns with local payment preferences
- Discount incentivizes longer commitments

---

## VI. Competitive Pricing Analysis

### vs. ProBoards

| Feature | ProBoards | SnapIT Forums |
|---------|-----------|---------------|
| **Free Tier** | Limited features | 1,500 users, full PGP |
| **Paid Entry** | $6.99/mo (Plus) | $99/mo (Pro) |
| **E2EE Messaging** | ❌ None | ✅ Default |
| **Custom Domain** | $9.99/mo | ✅ Included in Pro |
| **White-Label** | $14.99/mo | ✅ Business tier |
| **Max Users** | Unlimited | Unlimited (with metering) |

**Our Advantage:** Superior security (PGP, anonymous mode) justifies premium pricing. Free tier more generous.

### vs. Discourse

| Feature | Discourse | SnapIT Forums |
|---------|-----------|---------------|
| **Managed Hosting** | $100/mo (Basic) | $99/mo (Pro) |
| **Self-Hosted** | Free (DIY) | N/A (SaaS only) |
| **Moderator Seats** | Unlimited | 5 (Pro), 25 (Business) |
| **Storage** | 100GB | 500GB (Pro) |
| **SSO** | ✅ Basic plan | ✅ Business tier |
| **Messenger** | ❌ None | ✅ Included |

**Our Advantage:** Bundled messenger (PGP encrypted) + more storage. Competitive pricing.

### vs. Mighty Networks

| Feature | Mighty Networks | SnapIT Forums |
|---------|-----------------|---------------|
| **Community Plan** | $39/mo | $99/mo (Pro) |
| **Business Plan** | $99/mo | $499/mo (Business) |
| **Messenger** | ⚠️ Basic chat | ✅ E2EE PGP |
| **White-Label** | ✅ Business plan | ✅ Business tier |
| **Transaction Fees** | 2% + Stripe | ❌ None |

**Our Advantage:** Zero-knowledge security. No transaction fees. Superior privacy.

---

## VII. Pricing Psychology & Conversion Tactics

### Anchor Pricing

**Display Business tier first** to make Pro seem affordable:

```
Business: $499/mo ← Anchor (expensive)
Pro: $99/mo       ← Target (seems reasonable)
Free: $0/mo       ← Entry point
```

### Feature-Based Upselling

**Show locked features in free tier:**
- "Secure Shredder 🔒 Upgrade to Pro"
- "Voice Calls 🔒 Upgrade to Pro"
- "100 Member Groups 🔒 Upgrade to Pro"

### Usage-Based Prompts

**When approaching limits:**
- "You're at 1,400 / 1,500 members. Upgrade to Pro for unlimited users!"
- "Storage: 23 GB / 25 GB. Upgrade to Pro for 500 GB + overages."

### Social Proof

**Show tier distribution:**
- "Join 12,000+ Pro communities"
- "Trusted by Fortune 500 companies (Business tier)"

### Limited-Time Offers

**Launch promotion:**
- "50% off first 3 months (Pro tier)" → $49.50/mo
- Creates urgency, reduces barrier to entry

---

## VIII. Revenue Projections

### Conservative Scenario (Year 1)

**Assumptions:**
- 10,000 free tier signups
- 5% conversion to Pro ($99/mo)
- 0.5% conversion to Business ($499/mo)

**Calculations:**
```
Free: 9,450 users × $0 = $0
Pro: 500 users × $99 = $49,500/mo
Business: 50 users × $499 = $24,950/mo

MRR: $74,450
ARR: $893,400

Usage overages (estimated 20% of base):
$74,450 × 0.20 = $14,890/mo

Total MRR: $89,340
Total ARR: $1,072,080
```

### Optimistic Scenario (Year 2)

**Assumptions:**
- 100,000 free tier signups
- 10% conversion to Pro
- 2% conversion to Business

**Calculations:**
```
Free: 88,000 users × $0 = $0
Pro: 10,000 users × $99 = $990,000/mo
Business: 2,000 users × $499 = $998,000/mo

MRR: $1,988,000
ARR: $23,856,000

Usage overages (30% of base at scale):
$1,988,000 × 0.30 = $596,400/mo

Total MRR: $2,584,400
Total ARR: $31,012,800
```

### Infrastructure Costs (AWS)

**At 100,000 users:**
- DynamoDB (On-Demand): ~$5,000/mo
- Lambda invocations: ~$3,000/mo
- API Gateway: ~$2,000/mo
- S3 storage: ~$1,000/mo
- CloudFront: ~$2,000/mo

**Total: ~$13,000/mo**

**Gross Margin:** ($2,584,400 - $13,000) / $2,584,400 = **99.5%**

**Serverless architecture ensures profits scale exponentially.**

---

## IX. Implementation Checklist

### Phase 1: Stripe Setup
- [ ] Create Pro product ($99/mo recurring)
- [ ] Create Business product ($499/mo recurring)
- [ ] Create metered billing for storage ($0.25/GB)
- [ ] Create metered billing for API requests ($1.50/1M)
- [ ] Configure webhook for subscription events
- [ ] Add Pix/UPI payment methods (regional)

### Phase 2: Usage Tracking
- [ ] Implement DynamoDB storage tracking (Lambda)
- [ ] Implement API Gateway request counting (CloudWatch)
- [ ] Send usage data to Stripe (daily batch)
- [ ] Build customer usage dashboard
- [ ] Set up billing alerts (80%, 90%, 100% of baseline)

### Phase 3: Localization
- [ ] Create fixed-term subscription SKUs (3/6/12 months)
- [ ] Integrate Stripe Pix (Brazil)
- [ ] Integrate Stripe UPI (India)
- [ ] Build renewal notification system
- [ ] Test payment flows in sandbox

### Phase 4: Conversion Optimization
- [ ] Add "Upgrade" CTAs throughout app
- [ ] Show locked features in free tier
- [ ] Display usage meters (members, storage, API)
- [ ] Implement limit warnings (approaching cap)
- [ ] A/B test pricing page designs

---

## X. Summary

**Pricing Model:**
- **Free:** 1,500 users, basic PGP messaging, 25GB, 1M API/mo → Acquisition engine
- **Pro:** $99/mo, unlimited users, advanced PGP features, 500GB + overages → Standard scaling
- **Business:** $499/mo, SSO/SAML, white-label, 2TB + overages → Enterprise compliance

**Monetization Strategy:**
- Freemium drives acquisition (compete with ProBoards' ease of entry)
- Staff seats force team upgrade (Discourse model)
- Usage metering protects infrastructure costs (serverless alignment)
- Advanced security features create differentiation (Secure Shredder, ZKP)

**Global Payments:**
- Pix/UPI: Fixed-term subscriptions (3/6/12 months)
- Automated renewal notifications (7 days before expiry)
- Volume discounts incentivize longer commitments

**Financial Projection:**
- Year 1: $1M ARR (conservative)
- Year 2: $31M ARR (optimistic with 100K users, 10% conversion)
- Gross Margin: 99.5% (serverless architecture)

**Competitive Advantage:**
- Superior security (non-extractable keys, zero-knowledge)
- Bundled messenger (E2EE, PGP, anonymous mode)
- Generous free tier (1,500 users vs ProBoards limitations)
- Transparent usage-based pricing (no hidden costs)

**This pricing model is the ultimate expression of serverless architecture - every scaling decision is profitable.**

---

**Status:** 🟢 **READY FOR STRIPE IMPLEMENTATION**

**Next Action:** Create Stripe products and configure metered billing.

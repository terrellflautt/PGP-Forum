# Quick Start: Revenue Tracking Setup

**Goal**: Get revenue analytics running in 30 minutes

---

## 1. Deploy CloudWatch Dashboard & Alarms (5 minutes)

```bash
cd /mnt/c/Users/decry/Desktop/snapit-forum
chmod +x setup-revenue-analytics.sh
./setup-revenue-analytics.sh
```

Expected output:
```
✓ Dashboard created
✓ First customer alarm created
✓ $100 MRR alarm created
✓ $1,000 MRR goal alarm created
✓ High churn alarm created
✓ Payment failure alarm created
```

View dashboard:
https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=SnapIT-Revenue-Analytics

---

## 2. Deploy Enhanced Backend (10 minutes)

```bash
npm run deploy:prod
```

This deploys:
- Enhanced Stripe webhook handler
- CloudWatch metrics tracking
- SNS notifications
- Updated IAM permissions

Verify:
```bash
aws lambda get-function --function-name snapit-forum-api-prod-stripeWebhook --region us-east-1
```

---

## 3. Test Webhook (5 minutes)

```bash
# Watch logs
aws logs tail /aws/lambda/snapit-forum-api-prod-stripeWebhook --follow --region us-east-1
```

In another terminal:
```bash
# Trigger test event
stripe trigger customer.subscription.created
```

You should see:
```
[SUBSCRIPTION CREATED] subscriptionId: sub_xxx, tier: pro
[METRIC] ConversionCount: 1
[METRIC] MRR: 99
```

---

## 4. Check CloudWatch Metrics (2 minutes)

```bash
aws cloudwatch list-metrics --namespace SnapIT/Revenue --region us-east-1
```

Expected metrics:
- ConversionCount
- MRR
- ChurnCount
- Revenue
- PaymentFailed
- CheckoutCompleted

---

## 5. Subscribe to SNS Alerts (3 minutes)

```bash
# Get topic ARN
aws sns list-topics --region us-east-1 | grep snapit-forum-production-alerts

# Subscribe your email
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:692859945539:snapit-forum-production-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com \
  --region us-east-1
```

Check email and confirm subscription.

You'll receive alerts for:
- First paying customer
- $100 MRR milestone
- $1,000 MRR goal achieved
- High churn warnings
- Payment failures

---

## 6. Setup Google Analytics 4 (Optional - 1-2 hours)

Follow: `/mnt/c/Users/decry/Desktop/snapit-forum/GOOGLE-ANALYTICS-4-SETUP.md`

Quick version:
1. Create GA4 property at https://analytics.google.com
2. Get Measurement ID (G-XXXXXXXXXX)
3. Add to `forum-app/public/index.html`
4. Rebuild and redeploy frontend

---

## What You Get

### Real-Time Metrics

**CloudWatch Dashboard**:
- Daily conversions by tier
- MRR growth chart
- Conversion rate
- Churn tracking
- Payment failures

**SNS Notifications**:
- Email alerts for milestones
- Payment failure warnings
- Churn alerts

**Stripe Webhook Logs**:
- Detailed subscription events
- Payment tracking
- Error monitoring

---

## Quick Commands

### View Dashboard
```bash
open "https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=SnapIT-Revenue-Analytics"
```

### Watch Live Logs
```bash
aws logs tail /aws/lambda/snapit-forum-api-prod-stripeWebhook --follow
```

### Check Current MRR
```bash
aws cloudwatch get-metric-statistics \
  --namespace SnapIT/Revenue \
  --metric-name MRR \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum \
  --region us-east-1
```

### List Alarms
```bash
aws cloudwatch describe-alarms --alarm-name-prefix snapit --region us-east-1
```

---

## Verify It's Working

1. Open Stripe Dashboard (LIVE mode)
2. Create a test subscription
3. Check CloudWatch Dashboard - see metrics update
4. Check email - receive first customer notification
5. View Lambda logs - see webhook processing

---

## Troubleshooting

### Metrics not appearing
```bash
# Check Lambda has permissions
aws lambda get-function-configuration \
  --function-name snapit-forum-api-prod-stripeWebhook \
  --region us-east-1 | grep cloudwatch
```

### SNS not sending emails
```bash
# Verify subscription
aws sns list-subscriptions-by-topic \
  --topic-arn arn:aws:sns:us-east-1:692859945539:snapit-forum-production-alerts \
  --region us-east-1
```

### Webhook not triggering
```bash
# Test locally
stripe listen --forward-to https://api.snapitsoftware.com/webhooks/stripe
stripe trigger customer.subscription.created
```

---

## Next Steps

1. Monitor dashboard daily
2. Analyze conversion funnel
3. Optimize pricing
4. Scale traffic
5. Hit $1,000 MRR goal!

---

**Total Setup Time**: ~30 minutes
**Difficulty**: Easy
**Prerequisites**: AWS CLI, Stripe CLI (for testing)

Ready to track your revenue? Run the commands above!


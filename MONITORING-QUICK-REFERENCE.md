# Production Monitoring Quick Reference

## Subscribe to Alerts (DO THIS FIRST!)

```bash
# Replace with your actual email
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:692859945539:snapit-forum-production-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com
```

Then check your email and click the confirmation link.

---

## Quick Access Links

### CloudWatch Dashboard
https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards/dashboard/snapit-forum-production

### All Alarms
https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#alarmsV2:?search=snapit-forum

### SNS Topic
https://console.aws.amazon.com/sns/v3/home?region=us-east-1#/topic/arn:aws:sns:us-east-1:692859945539:snapit-forum-production-alerts

---

## CLI Commands

### Check All Alarm States
```bash
aws cloudwatch describe-alarms \
  --query 'MetricAlarms[?contains(AlarmName, `snapit-forum`)].{Name:AlarmName,State:StateValue}' \
  --output table
```

### View Recent Errors (Critical Functions)
```bash
# OAuth errors
aws logs tail /aws/lambda/snapit-forum-api-prod-googleCallback --since 1h --filter-pattern "ERROR"

# Payment errors
aws logs tail /aws/lambda/snapit-forum-api-prod-stripeWebhook --since 1h --filter-pattern "ERROR"

# Signup errors
aws logs tail /aws/lambda/snapit-forum-api-prod-setUsername --since 1h --filter-pattern "ERROR"
```

### Check Current Free Tier Usage
```bash
# DynamoDB table sizes
aws dynamodb describe-table --table-name snapit-forum-api-users-prod \
  --query 'Table.{Size:TableSizeBytes,ItemCount:ItemCount}'

# Lambda invocations (last 24h)
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 86400 \
  --statistics Sum
```

### Test Alert System
```bash
aws sns publish \
  --topic-arn arn:aws:sns:us-east-1:692859945539:snapit-forum-production-alerts \
  --subject "Test Alert" \
  --message "Testing monitoring system"
```

---

## What Each Alarm Protects

### Revenue-Critical Paths
- **googleCallback-errors**: Blocks all OAuth signups if failing
- **googleAuth-errors**: Blocks authentication flow
- **setUsername-errors**: Blocks user onboarding after OAuth
- **stripeWebhook-errors**: Payment confirmations not processing
- **createCheckoutSession-errors**: Users can't start paying
- **createPortalSession-errors**: Customers can't manage subscriptions

### Infrastructure Health
- **api-5xx-errors**: Your API is down/broken
- **api-high-latency**: Performance degradation
- **lambda-concurrent-executions**: Approaching AWS limits
- **dynamodb-*-throttles**: Database can't handle load

### Cost Protection
- **estimated-charges**: Monthly bill exceeds $10
- **api-high-request-rate**: Unusual traffic spike
- **dynamodb-high-read-capacity**: Database usage spike

---

## Interpreting Alarm States

### OK (Green)
✓ Everything working normally

### INSUFFICIENT_DATA (Gray)
- No traffic yet (normal for new deployment)
- Metric not being generated
- Wait 24-48 hours for data

### ALARM (Red)
⚠️ Action required:
1. Check CloudWatch dashboard
2. View logs for the failing function
3. If revenue-critical: investigate immediately
4. If infrastructure: may auto-recover, monitor
5. If cost: review what changed

---

## Common Scenarios

### Scenario: "authorizer-errors" firing
**Cause:** Users with invalid/expired tokens (normal)
**Action:** No action needed unless >10 errors/5min

### Scenario: "stripeWebhook-errors" firing
**Cause:** Payment processing broken
**Action:** URGENT - check Stripe dashboard and webhook logs

### Scenario: "api-5xx-errors" firing
**Cause:** Infrastructure issue
**Action:** Check Lambda logs, DynamoDB status

### Scenario: "estimated-charges" firing
**Cause:** Monthly bill > $10
**Action:** Review CloudWatch Billing dashboard, check for traffic spike

---

## Monitoring Checklist

### Daily (First Week)
- [ ] Open CloudWatch dashboard
- [ ] Verify no alarms in ALARM state
- [ ] Check signup trend (OAuth invocations)

### Weekly (After First Week)
- [ ] Review dashboard for trends
- [ ] Check free tier usage percentages
- [ ] Verify all alarms still OK

### Monthly
- [ ] Review billing
- [ ] Check log retention is working
- [ ] Test alert system with SNS publish

---

## Emergency Contacts

**SNS Topic ARN:** arn:aws:sns:us-east-1:692859945539:snapit-forum-production-alerts

**Dashboard:** snapit-forum-production

**Region:** us-east-1

**Account:** 692859945539

---

## Scaling Triggers

Alert thresholds to watch:

| Metric | Current | Warning | Action Needed |
|--------|---------|---------|---------------|
| Lambda invocations/month | ~31K | 800K | Prepare to scale beyond free tier |
| API requests/month | <1K | 800K | Prepare to scale beyond free tier |
| DynamoDB storage | ~0 GB | 20 GB | Plan data archival strategy |
| Lambda concurrent | <10 | 800 | Increase concurrency limits |
| Monthly bill | $0 | $10 | Review cost optimization |

When any metric hits 80% of its threshold, you have ~1 week to plan scaling strategy.

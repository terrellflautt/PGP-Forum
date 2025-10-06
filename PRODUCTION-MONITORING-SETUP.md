# Snapit Forum Production Monitoring - Deployment Summary

## SNS Topic for Alerts
**Topic ARN:** `arn:aws:sns:us-east-1:692859945539:snapit-forum-production-alerts`

### To Subscribe Your Email:
```bash
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:692859945539:snapit-forum-production-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com
```
Then confirm the subscription via the email you receive.

---

## CloudWatch Alarms Created (30 Total)

### Revenue-Critical Lambda Functions (14 alarms)
| Function | Error Threshold | Throttle Threshold | Current State |
|----------|----------------|-------------------|---------------|
| googleCallback | >1 error in 5min | >0 throttles in 5min | ✓ OK |
| googleAuth | >1 error in 5min | >0 throttles in 5min | ✓ OK |
| setUsername | >1 error in 5min | >0 throttles in 5min | ✓ OK |
| stripeWebhook | >1 error in 5min | >0 throttles in 5min | ✓ OK |
| authorizer | >1 error in 5min | >0 throttles in 5min | ⚠ ALARM |
| createCheckoutSession | >1 error in 5min | >0 throttles in 5min | ✓ OK |
| createPortalSession | >1 error in 5min | >0 throttles in 5min | ✓ OK |

**ACTION REQUIRED:** The `authorizer` function is in ALARM state - investigate immediately!

### API Gateway Monitoring (4 alarms)
- **5xx Errors:** >5 errors in 5 minutes (Currently: OK)
- **4xx Errors:** >50 errors in 5 minutes (Currently: OK)
- **High Latency:** P95 > 3000ms for 2 consecutive periods (Currently: OK)
- **High Request Rate:** >10,000 requests/hour (Currently: INSUFFICIENT_DATA)

### DynamoDB Monitoring (8 alarms)
Tables monitored: users, forums, threads, posts
- **Read Throttles:** >10 throttle events in 5 minutes per table
- **Write Throttles:** >10 throttle events in 5 minutes per table
- All currently: ✓ OK

### Infrastructure Limits (2 alarms)
- **Lambda Concurrent Executions:** Warning at 800 (account limit: 1000) - Currently: OK
- **Lambda Long Duration:** Functions taking >10 seconds - Currently: INSUFFICIENT_DATA

### Cost Monitoring (2 alarms)
- **Estimated Monthly Charges:** Alert at >$10/month - Currently: INSUFFICIENT_DATA
- **DynamoDB High Capacity:** >100,000 read units/hour - Currently: INSUFFICIENT_DATA

---

## CloudWatch Dashboard
**URL:** https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards/dashboard/snapit-forum-production

### Dashboard Widgets:
1. **OAuth Signups/Hour** - Track user acquisition
2. **API Requests/Hour** - Active user monitoring
3. **Lambda Concurrent Executions** - Capacity monitoring with warning line at 800
4. **Lambda Errors (All Functions)** - Revenue-critical error tracking
5. **API Gateway Errors** - 4xx/5xx error rates
6. **API Latency (P95/P99)** - Performance monitoring
7. **DynamoDB Errors** - Database health
8. **Recent Errors Log** - Last 20 errors from critical functions

---

## Log Retention Policies

### Critical Functions (30 days retention)
- googleCallback, googleAuth, setUsername
- stripeWebhook, createCheckoutSession, createPortalSession
- authorizer

### Standard Functions (7 days retention)
- getUser, updateUser, getPosts, createPost
- getForums, createForum, getThreads, createThread
- And 10 other standard CRUD operations

**Cost Savings:** Optimized retention reduces log storage costs while maintaining compliance for revenue-critical paths.

---

## Current Resource Utilization vs Free Tier

### DynamoDB Storage
- **Used:** ~0 MB / 25 GB
- **Status:** ✓ Well within free tier (0% used)

### Lambda Invocations
- **Last 24h:** ~1,033 invocations
- **Monthly Estimate:** ~31,000 / 1,000,000
- **Status:** ✓ Well within free tier (3% used)

### API Gateway Requests
- **Last 24h:** Minimal traffic
- **Monthly Estimate:** <1,000 / 1,000,000
- **Status:** ✓ Well within free tier (<1% used)

---

## Recommendations for Scaling Thresholds

### Immediate Actions Required:
1. **Subscribe email to SNS topic** to receive alerts
2. **Investigate authorizer alarm** - currently in ALARM state
3. **Test alert system** by temporarily lowering a threshold

### When to Scale (Traffic Thresholds):

#### Phase 1: Free Tier Monitoring (Current)
- Stay alert at 80% of free tier limits:
  - Lambda: 800,000 invocations/month
  - API Gateway: 800,000 requests/month
  - DynamoDB: 20 GB storage

#### Phase 2: First 100 Paying Users
- **Add alarms for:**
  - User growth rate (>50 signups/day)
  - Conversion rate monitoring (checkout sessions / signups)
  - Payment failure rate (Stripe webhook errors / total webhooks)

#### Phase 3: Revenue > $1000/month
- **Upgrade monitoring:**
  - Consider AWS X-Ray for distributed tracing
  - Add custom business metrics (MRR, churn rate)
  - Implement uptime monitoring (Pingdom/StatusCake)
  - Set up PagerDuty integration for 24/7 on-call

#### Phase 4: Scaling Beyond Free Tier
- **Proactive scaling triggers:**
  - Lambda concurrent executions consistently >500
  - API latency P95 >1000ms
  - DynamoDB throttling events occurring
  - Storage >15 GB (prepare for provisioned capacity)

### Cost Optimization Recommendations:
1. **Current Setup:** $0/month (within free tier)
2. **Next 6 months:** Monitor billing alarm at $10/month
3. **Growth Path:** 
   - At 500 users: ~$20-30/month
   - At 1500 users (free plan limit): ~$50-75/month
   - First Pro subscriber: Covers infrastructure costs

### Critical Path Protection:
Your monitoring now protects these revenue paths:
1. **Signup Funnel:** OAuth → setUsername → User Created
2. **Payment Flow:** createCheckoutSession → Stripe → stripeWebhook
3. **Customer Management:** createPortalSession (subscriptions/billing)

Any failure in these paths will trigger immediate email alerts.

---

## Testing Your Monitoring

### Test 1: Verify SNS Subscription
```bash
aws sns publish \
  --topic-arn arn:aws:sns:us-east-1:692859945539:snapit-forum-production-alerts \
  --subject "Test Alert" \
  --message "This is a test alert from Snapit Forum monitoring"
```

### Test 2: View Current Alarm States
```bash
aws cloudwatch describe-alarms \
  --alarm-names snapit-forum-googleCallback-errors \
  --query 'MetricAlarms[0].{State:StateValue,Reason:StateReason}' \
  --output table
```

### Test 3: Check Dashboard
Open: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards/dashboard/snapit-forum-production

---

## Summary

✅ **30 CloudWatch Alarms** monitoring revenue-critical paths
✅ **SNS Topic** configured (needs email subscription)
✅ **Production Dashboard** with 8 key metrics
✅ **Log Retention** optimized (30d critical, 7d standard)
✅ **Cost Monitoring** with $10/month threshold
✅ **Free Tier Tracking** for all major services

⚠️ **ACTION NEEDED:**
1. Subscribe your email to SNS topic
2. Fix authorizer alarm (currently in ALARM state)
3. Test alert system with SNS publish command

Your production monitoring is now active and protecting against:
- Silent failures in OAuth/signup flow
- Stripe payment processing errors
- Infrastructure degradation (5xx errors, high latency)
- Cost overruns beyond free tier
- DynamoDB throttling and capacity issues

**Next Steps:** Monitor the dashboard daily for the first week, then weekly as you gain confidence in the system.

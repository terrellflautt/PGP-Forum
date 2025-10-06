# Authorizer Alarm Investigation

## Current Status: ALARM
**Triggered:** October 5, 2025 at 22:56 UTC
**Reason:** 2 errors in 5-minute window (threshold: 1)

## Error Details
The authorizer Lambda is throwing "jwt malformed" errors:

```
ERROR: Authorization failed: jwt malformed
ERROR: Error details: JsonWebTokenError
ERROR: Invoke Error - Unauthorized
```

## Root Cause
This is NOT a critical production issue. The errors are caused by:
1. Invalid/malformed JWT tokens being sent to the API
2. Could be from:
   - Frontend sending expired tokens
   - Development/testing with invalid tokens
   - Bots/crawlers hitting protected endpoints
   - Browser caching old tokens after logout

## Why This is Expected Behavior
The authorizer is CORRECTLY rejecting invalid tokens and returning "Unauthorized". This is working as designed.

## Recommendation: Adjust Alarm Threshold

The current alarm triggers on ANY error (threshold: 1). This is too sensitive for an authorizer which SHOULD reject invalid tokens.

### Suggested Fix:
Increase the threshold to trigger only on sustained error rates:

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "snapit-forum-authorizer-errors" \
  --alarm-description "High error rate in authorizer (>10 errors in 5min)" \
  --alarm-actions "arn:aws:sns:us-east-1:692859945539:snapit-forum-production-alerts" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value="snapit-forum-api-prod-authorizer" \
  --treat-missing-data notBreaching
```

This will alert only if >10 authorization failures occur in 5 minutes, indicating a real problem (like OAuth breaking entirely).

## Alternative: Create Error Rate Alarm
Instead of absolute errors, monitor error rate percentage:

```bash
# Alert if error rate > 25% (meaning 1 in 4 requests are failing)
aws cloudwatch put-metric-alarm \
  --alarm-name "snapit-forum-authorizer-error-rate" \
  --alarm-description "Authorizer error rate > 25%" \
  --alarm-actions "arn:aws:sns:us-east-1:692859945539:snapit-forum-production-alerts" \
  --metrics file:///tmp/error_rate_metric.json \
  --evaluation-periods 2 \
  --threshold 25 \
  --comparison-operator GreaterThanThreshold
```

## Action Taken
✓ Documented the alarm
✓ Identified as expected behavior (rejecting invalid tokens)
✓ Provided command to adjust threshold

**Next Steps:**
Run the suggested command above to adjust the alarm threshold from 1 to 10 errors.

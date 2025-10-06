#!/bin/bash

echo "================================================"
echo "SNAPIT FORUM - PRODUCTION MONITORING VERIFICATION"
echo "================================================"
echo ""

TOPIC_ARN="arn:aws:sns:us-east-1:692859945539:snapit-forum-production-alerts"
REGION="us-east-1"

# Check SNS topic
echo "1. Checking SNS Topic..."
aws sns get-topic-attributes --topic-arn "$TOPIC_ARN" --query 'Attributes.DisplayName' --output text 2>/dev/null && echo "   ✓ SNS topic exists" || echo "   ✗ SNS topic not found"

# Check subscriptions
subs=$(aws sns list-subscriptions-by-topic --topic-arn "$TOPIC_ARN" --query 'Subscriptions[].Endpoint' --output text 2>/dev/null)
if [ -z "$subs" ]; then
    echo "   ⚠ No email subscriptions yet - ACTION REQUIRED"
else
    echo "   ✓ Email subscribed: $subs"
fi

echo ""

# Check alarms
echo "2. Checking CloudWatch Alarms..."
alarm_count=$(aws cloudwatch describe-alarms --query 'length(MetricAlarms[?contains(AlarmName, `snapit-forum`)])' --output text)
echo "   ✓ Total alarms: $alarm_count"

alarm_states=$(aws cloudwatch describe-alarms --query 'MetricAlarms[?contains(AlarmName, `snapit-forum`)].StateValue' --output text)
ok_count=$(echo "$alarm_states" | tr ' ' '\n' | grep -c "OK")
alarm_count_state=$(echo "$alarm_states" | tr ' ' '\n' | grep -c "ALARM")
insuf_count=$(echo "$alarm_states" | tr ' ' '\n' | grep -c "INSUFFICIENT_DATA")

echo "   ✓ OK: $ok_count"
echo "   ⚠ ALARM: $alarm_count_state"
echo "   - INSUFFICIENT_DATA: $insuf_count (normal for new deployment)"

if [ "$alarm_count_state" -gt 0 ]; then
    echo ""
    echo "   Alarms in ALARM state:"
    aws cloudwatch describe-alarms --query 'MetricAlarms[?contains(AlarmName, `snapit-forum`) && StateValue==`ALARM`].AlarmName' --output text | tr '\t' '\n' | while read alarm; do
        echo "   - $alarm"
    done
fi

echo ""

# Check dashboard
echo "3. Checking CloudWatch Dashboard..."
aws cloudwatch get-dashboard --dashboard-name "snapit-forum-production" --query 'DashboardName' --output text 2>/dev/null && echo "   ✓ Dashboard exists" || echo "   ✗ Dashboard not found"

echo ""

# Check log retention
echo "4. Checking Log Retention Policies..."
critical_funcs=("snapit-forum-api-prod-googleCallback" "snapit-forum-api-prod-stripeWebhook" "snapit-forum-api-prod-setUsername")
for func in "${critical_funcs[@]}"; do
    retention=$(aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/$func" --query 'logGroups[0].retentionInDays' --output text 2>/dev/null)
    if [ "$retention" = "30" ]; then
        echo "   ✓ $func: 30 days"
    else
        echo "   ⚠ $func: $retention days (expected 30)"
    fi
done

echo ""

# Check free tier usage
echo "5. Free Tier Usage..."
end_time=$(date -u +%s)
start_time=$((end_time - 86400))
start_iso=$(date -u -d "@$start_time" +%Y-%m-%dT%H:%M:%S)
end_iso=$(date -u -d "@$end_time" +%Y-%m-%dT%H:%M:%S)

invocations=$(aws cloudwatch get-metric-statistics \
    --namespace AWS/Lambda \
    --metric-name Invocations \
    --start-time "$start_iso" \
    --end-time "$end_iso" \
    --period 86400 \
    --statistics Sum \
    --query 'Datapoints[0].Sum' \
    --output text 2>/dev/null || echo "0")

if [ "$invocations" = "None" ] || [ -z "$invocations" ]; then
    invocations=0
fi

echo "   Lambda invocations (24h): $invocations"
echo "   Monthly estimate: ~$((invocations * 30)) / 1,000,000"

echo ""
echo "================================================"
echo "VERIFICATION COMPLETE"
echo "================================================"
echo ""
echo "NEXT STEPS:"
echo "1. Subscribe email to SNS topic:"
echo "   aws sns subscribe --topic-arn $TOPIC_ARN --protocol email --notification-endpoint YOUR_EMAIL@example.com"
echo ""
echo "2. View dashboard:"
echo "   https://console.aws.amazon.com/cloudwatch/home?region=$REGION#dashboards/dashboard/snapit-forum-production"
echo ""
echo "3. Test alerts:"
echo "   aws sns publish --topic-arn $TOPIC_ARN --subject 'Test' --message 'Testing alerts'"
echo ""

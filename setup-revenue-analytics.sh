#!/bin/bash

set -e

echo "=== Setting up Revenue Analytics Infrastructure ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Create CloudWatch Dashboard
echo -e "${YELLOW}Creating CloudWatch Dashboard...${NC}"
aws cloudwatch put-dashboard \
  --dashboard-name SnapIT-Revenue-Analytics \
  --dashboard-body file://revenue-dashboard.json \
  --region us-east-1

echo -e "${GREEN}✓ Dashboard created${NC}"
echo "View at: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=SnapIT-Revenue-Analytics"
echo ""

# 2. Create CloudWatch Alarms
echo -e "${YELLOW}Creating CloudWatch Alarms...${NC}"

# Alert for first paying customer
aws cloudwatch put-metric-alarm \
  --alarm-name snapit-first-paying-customer \
  --alarm-description "Alert when first customer subscribes" \
  --metric-name ConversionCount \
  --namespace SnapIT/Revenue \
  --statistic Sum \
  --period 3600 \
  --evaluation-periods 1 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --alarm-actions arn:aws:sns:us-east-1:692859945539:snapit-forum-production-alerts \
  --region us-east-1

echo -e "${GREEN}✓ First customer alarm created${NC}"

# Alert for $100 MRR milestone
aws cloudwatch put-metric-alarm \
  --alarm-name snapit-mrr-100-milestone \
  --alarm-description "Alert when MRR reaches $100" \
  --metric-name MRR \
  --namespace SnapIT/Revenue \
  --statistic Sum \
  --period 3600 \
  --evaluation-periods 1 \
  --threshold 100 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --alarm-actions arn:aws:sns:us-east-1:692859945539:snapit-forum-production-alerts \
  --region us-east-1

echo -e "${GREEN}✓ $100 MRR alarm created${NC}"

# Alert for $1,000 MRR milestone
aws cloudwatch put-metric-alarm \
  --alarm-name snapit-mrr-1000-goal \
  --alarm-description "Alert when MRR reaches $1,000 (GOAL!)" \
  --metric-name MRR \
  --namespace SnapIT/Revenue \
  --statistic Sum \
  --period 3600 \
  --evaluation-periods 1 \
  --threshold 1000 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --alarm-actions arn:aws:sns:us-east-1:692859945539:snapit-forum-production-alerts \
  --region us-east-1

echo -e "${GREEN}✓ $1,000 MRR goal alarm created${NC}"

# Alert for high churn rate
aws cloudwatch put-metric-alarm \
  --alarm-name snapit-high-churn-warning \
  --alarm-description "Alert when churn count exceeds threshold" \
  --metric-name ChurnCount \
  --namespace SnapIT/Revenue \
  --statistic Sum \
  --period 86400 \
  --evaluation-periods 1 \
  --threshold 3 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:us-east-1:692859945539:snapit-forum-production-alerts \
  --region us-east-1

echo -e "${GREEN}✓ High churn alarm created${NC}"

# Alert for payment failures
aws cloudwatch put-metric-alarm \
  --alarm-name snapit-payment-failures \
  --alarm-description "Alert when payment failures occur" \
  --metric-name PaymentFailed \
  --namespace SnapIT/Revenue \
  --statistic Sum \
  --period 3600 \
  --evaluation-periods 1 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --alarm-actions arn:aws:sns:us-east-1:692859945539:snapit-forum-production-alerts \
  --region us-east-1

echo -e "${GREEN}✓ Payment failure alarm created${NC}"

echo ""
echo -e "${GREEN}=== Revenue Analytics Setup Complete! ===${NC}"
echo ""
echo "Next steps:"
echo "1. Deploy backend: npm run deploy:prod"
echo "2. View dashboard: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=SnapIT-Revenue-Analytics"
echo "3. Check SNS subscriptions: https://console.aws.amazon.com/sns/v3/home?region=us-east-1#/topic/arn:aws:sns:us-east-1:692859945539:snapit-forum-production-alerts"
echo ""
echo "Metrics being tracked:"
echo "  - ConversionCount (new subscribers)"
echo "  - MRR (Monthly Recurring Revenue)"
echo "  - ChurnCount (canceled subscriptions)"
echo "  - Revenue (daily revenue)"
echo "  - PaymentFailed (failed payments)"
echo "  - CheckoutCompleted (successful checkouts)"
echo ""

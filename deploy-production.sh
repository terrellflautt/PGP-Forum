#!/bin/bash

################################################################################
# SnapIT Forum - Production Deployment Script
# Deploys React frontend to S3 + CloudFront and backend to AWS Lambda
################################################################################

set -e  # Exit on error

echo "🚀 SnapIT Forum - Production Deployment"
echo "========================================"
echo ""

# Configuration
S3_BUCKET="snapit-forum-static"
CLOUDFRONT_ID="E1X8SJIRPSICZ4"
REGION="us-east-1"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if AWS CLI is configured
echo "Checking AWS credentials..."
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    print_error "AWS credentials not configured. Run 'aws configure' first."
    exit 1
fi
print_status "AWS credentials verified"
echo ""

# Ask for confirmation
echo "This will deploy to PRODUCTION:"
echo "  • S3 Bucket: s3://$S3_BUCKET"
echo "  • CloudFront: $CLOUDFRONT_ID"
echo "  • Region: $REGION"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi
echo ""

################################################################################
# Step 1: Build React Frontend
################################################################################
echo "📦 Building React frontend..."
cd forum-app

if ! npm run build > /dev/null 2>&1; then
    print_error "Frontend build failed!"
    exit 1
fi

print_status "Frontend built successfully"
echo ""
cd ..

################################################################################
# Step 2: Deploy Backend (Optional - only if serverless.yml changed)
################################################################################
read -p "Deploy backend Lambda functions? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔧 Deploying backend to AWS Lambda..."

    if ! npm run deploy:prod > /dev/null 2>&1; then
        print_error "Backend deployment failed!"
        exit 1
    fi

    print_status "Backend deployed successfully"
    echo ""
fi

################################################################################
# Step 3: Deploy Frontend to S3
################################################################################
echo "☁️  Uploading to S3..."

if ! aws s3 sync forum-app/build/ s3://$S3_BUCKET/ --delete --region $REGION > /dev/null 2>&1; then
    print_error "S3 upload failed!"
    exit 1
fi

print_status "Files uploaded to S3"
echo ""

################################################################################
# Step 4: Invalidate CloudFront Cache
################################################################################
echo "🔄 Invalidating CloudFront cache..."

INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_ID \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text 2>&1)

if [ $? -ne 0 ]; then
    print_error "CloudFront invalidation failed!"
    exit 1
fi

print_status "CloudFront cache invalidated (ID: $INVALIDATION_ID)"
echo ""

################################################################################
# Step 5: Verify Deployment
################################################################################
echo "🔍 Verifying deployment..."

# Check S3 bucket
S3_COUNT=$(aws s3 ls s3://$S3_BUCKET/ --recursive | wc -l)
print_status "S3 files: $S3_COUNT"

# Check CloudFront status
CF_STATUS=$(aws cloudfront get-distribution --id $CLOUDFRONT_ID --query 'Distribution.Status' --output text)
print_status "CloudFront status: $CF_STATUS"

# Check API Gateway
API_ID=$(aws apigateway get-rest-apis --query 'items[?name==`snapit-forum-api-prod`].id' --output text)
if [ -n "$API_ID" ]; then
    print_status "API Gateway: $API_ID"
else
    print_warning "API Gateway not found"
fi

echo ""

################################################################################
# Summary
################################################################################
echo "✅ Deployment Complete!"
echo "========================"
echo ""
echo "Production URLs:"
echo "  • Website: https://forum.snapitsoftware.com"
echo "  • CloudFront: https://d3jn3i879jxit2.cloudfront.net"
echo "  • API: https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod"
echo ""
echo "⚠️  CloudFront cache invalidation may take 5-10 minutes to propagate."
echo ""
echo "Next steps:"
echo "  1. Test the website: https://forum.snapitsoftware.com"
echo "  2. Check CloudWatch logs for errors"
echo "  3. Monitor Stripe webhooks (if enabled)"
echo ""
print_warning "Remember: Stripe is in TEST mode. Switch to live keys before accepting real payments."
echo ""

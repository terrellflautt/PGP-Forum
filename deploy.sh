#!/bin/bash

set -e

echo "🚀 Deploying SnapIT Forum..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed"
    exit 1
fi

if ! command -v serverless &> /dev/null; then
    echo "⚠️  Serverless Framework not found, installing..."
    npm install -g serverless
fi

# Check environment variables
if [ -z "$GOOGLE_CLIENT_ID" ]; then
    echo "❌ GOOGLE_CLIENT_ID environment variable not set"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET environment variable not set"
    exit 1
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Deploy backend
echo -e "${BLUE}☁️  Deploying backend to AWS Lambda...${NC}"
serverless deploy --stage prod

# Get API endpoint
API_ENDPOINT=$(serverless info --stage prod | grep "ServiceEndpoint:" | awk '{print $2}')
echo -e "${GREEN}✅ Backend deployed: ${API_ENDPOINT}${NC}"

# Update frontend config
echo -e "${BLUE}🔧 Updating frontend config...${NC}"
sed -i "s|const API_BASE = '.*'|const API_BASE = '${API_ENDPOINT}'|g" index.html

# Deploy frontend to S3
echo -e "${BLUE}📤 Deploying frontend to S3...${NC}"
aws s3 sync . s3://snapit-forum-static \
    --exclude "node_modules/*" \
    --exclude "src/*" \
    --exclude ".git/*" \
    --exclude ".*" \
    --exclude "*.sh" \
    --exclude "serverless.yml" \
    --exclude "package*.json" \
    --exclude "README.md"

# Invalidate CloudFront cache
echo -e "${BLUE}🔄 Invalidating CloudFront cache...${NC}"
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id E1X8SJIRPSICZ4 \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)

echo -e "${GREEN}✅ CloudFront invalidation created: ${INVALIDATION_ID}${NC}"

# Summary
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   🎉 Deployment Successful! 🎉       ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
echo ""
echo -e "Frontend:  ${BLUE}https://forum.snapitsoftware.com${NC}"
echo -e "API:       ${BLUE}${API_ENDPOINT}${NC}"
echo ""
echo -e "Next steps:"
echo "1. Set up Stripe webhook: ${API_ENDPOINT}/webhooks/stripe"
echo "2. Configure Google OAuth redirect: ${API_ENDPOINT}/auth/google/callback"
echo "3. Test the forum!"
echo ""

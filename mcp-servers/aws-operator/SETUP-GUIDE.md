# AWS Operator MCP Server - Setup Guide

## Quick Start

### 1. Installation Complete

The AWS Operator MCP Server has been successfully installed at:
```
/mnt/c/Users/decry/Desktop/snapit-forum/mcp-servers/aws-operator/
```

**Files created:**
- `index.js` - Main MCP server implementation (766 lines)
- `package.json` - Node.js dependencies
- `README.md` - Comprehensive documentation (603 lines)
- `.gitignore` - Git ignore patterns
- `claude-desktop-config-example.json` - Example configuration

**Dependencies installed:**
- `@modelcontextprotocol/sdk` v1.0.4
- 89 total packages
- 0 vulnerabilities found

### 2. Configure Claude Desktop

#### macOS/Linux

Edit: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "snapit-aws-operator": {
      "command": "node",
      "args": [
        "/mnt/c/Users/decry/Desktop/snapit-forum/mcp-servers/aws-operator/index.js"
      ],
      "env": {
        "AWS_PROFILE": "default",
        "AWS_REGION": "us-east-1"
      }
    }
  }
}
```

#### Windows (WSL)

Edit: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "snapit-aws-operator": {
      "command": "node",
      "args": [
        "C:\\Users\\decry\\Desktop\\snapit-forum\\mcp-servers\\aws-operator\\index.js"
      ],
      "env": {
        "AWS_PROFILE": "default",
        "AWS_REGION": "us-east-1"
      }
    }
  }
}
```

**Important:** Replace the path with your actual absolute path.

### 3. Restart Claude Desktop

After editing the configuration:
1. Save the file
2. Completely quit Claude Desktop
3. Restart Claude Desktop
4. The MCP server will be loaded automatically

### 4. Verify Installation

In Claude Desktop, you should see 8 new tools available:

1. deploy_backend
2. deploy_frontend
3. tail_logs
4. check_dynamodb_tables
5. get_ssm_parameters
6. check_ses_status
7. create_cloudfront_invalidation
8. run_stripe_command

## Usage Examples

### Deploy Backend

Ask Claude:
```
"Deploy the backend to production"
```

Claude will use the `deploy_backend` tool to:
- Run `npm run deploy:prod`
- Deploy all Lambda functions
- Update API Gateway
- Stream output in real-time

### Deploy Frontend

Ask Claude:
```
"Build and deploy the frontend"
```

Claude will use the `deploy_frontend` tool to:
- Build React app
- Sync to S3
- Invalidate CloudFront cache

### Monitor Logs

Ask Claude:
```
"Show me the logs for the googleAuth function from the last 30 minutes"
```

Claude will use the `tail_logs` tool with:
```json
{
  "functionName": "googleAuth",
  "startTime": "30m"
}
```

### Check Infrastructure

Ask Claude:
```
"What's the status of our DynamoDB tables?"
```

Claude will use the `check_dynamodb_tables` tool.

### Check Stripe

Ask Claude:
```
"List all Stripe products"
```

Claude will use the `run_stripe_command` tool with:
```json
{
  "command": "products",
  "args": ["list"]
}
```

## Prerequisites

### 1. AWS CLI Configuration

The MCP server requires AWS CLI to be configured:

```bash
aws configure
```

Enter:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: us-east-1
- Default output format: json

**Verify:**
```bash
aws sts get-caller-identity
```

Should show your AWS account ID.

### 2. Required AWS Permissions

Your AWS user/role needs these permissions:

**Lambda & API Gateway:**
- `lambda:*`
- `apigateway:*`
- `iam:PassRole`, `iam:CreateRole`, `iam:AttachRolePolicy`
- `cloudformation:*`

**S3 & CloudFront:**
- `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket`
- `cloudfront:CreateInvalidation`, `cloudfront:GetInvalidation`

**Monitoring:**
- `dynamodb:DescribeTable`, `dynamodb:ListTables`
- `logs:FilterLogEvents`, `logs:TailLogs`
- `ssm:DescribeParameters`
- `ses:GetSendStatistics`, `ses:ListVerifiedEmailAddresses`

### 3. Optional: Stripe CLI

For Stripe commands, install Stripe CLI:

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
stripe login
```

**Linux:**
```bash
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
stripe login
```

**Windows:**
```bash
scoop install stripe
stripe login
```

## Architecture

```
Claude Desktop
    |
    | (MCP Protocol via stdio)
    |
    v
AWS Operator MCP Server (Node.js)
    |
    +-- deploy_backend() -----> npm run deploy:prod
    |                               |
    |                               v
    |                           Serverless Framework
    |                               |
    |                               v
    |                           AWS CloudFormation
    |                               |
    |                               v
    |                           Lambda, API Gateway, DynamoDB
    |
    +-- deploy_frontend() ----> npm run build
    |                               |
    |                               v
    |                           React Build
    |                               |
    |                               +---> aws s3 sync
    |                               |
    |                               +---> aws cloudfront create-invalidation
    |
    +-- tail_logs() ----------> aws logs tail
    |
    +-- check_dynamodb_tables() -> aws dynamodb list-tables + describe-table
    |
    +-- get_ssm_parameters() --> aws ssm describe-parameters
    |
    +-- check_ses_status() ----> aws ses list-verified-email-addresses
    |
    +-- create_cloudfront_invalidation() -> aws cloudfront create-invalidation
    |
    +-- run_stripe_command() --> stripe <command> <args>
```

## Security Best Practices

### 1. AWS Credentials

- The MCP server NEVER stores credentials
- It uses your existing AWS CLI configuration
- Credentials are read from `~/.aws/credentials`
- Consider using AWS SSO for enhanced security
- Enable MFA on your AWS account

### 2. SSM Parameter Protection

- `get_ssm_parameters` lists names only, NOT values
- This prevents accidental exposure of:
  - Stripe API keys
  - Google OAuth secrets
  - JWT secrets
  - Database passwords

### 3. Least Privilege

- Create an IAM user specifically for deployments
- Grant only required permissions
- Use separate AWS accounts for dev/prod
- Rotate credentials regularly

### 4. Monitoring

- All AWS API calls are logged to CloudTrail
- Monitor CloudWatch for unusual activity
- Set up billing alerts
- Review IAM access regularly

## Troubleshooting

### MCP Server Not Visible in Claude Desktop

**Solutions:**
1. Check JSON syntax in config file (use jsonlint.com)
2. Verify absolute path to index.js
3. Ensure Node.js is installed (node --version)
4. Check Claude Desktop logs
5. Restart Claude Desktop completely

**macOS logs:**
```bash
tail -f ~/Library/Logs/Claude/mcp*.log
```

### AWS Credential Errors

**Error:** "Unable to locate credentials"

**Solution:**
```bash
# Configure AWS CLI
aws configure

# Or set environment variables
export AWS_ACCESS_KEY_ID=your-key-id
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_DEFAULT_REGION=us-east-1
```

### Permission Denied Errors

**Error:** "User is not authorized to perform: lambda:UpdateFunctionCode"

**Solution:**
Your AWS user needs additional IAM permissions. Contact your AWS administrator or add required policies.

### Stripe CLI Not Found

**Error:** "Command not found: stripe"

**Solution:**
Install Stripe CLI (see Prerequisites section) and ensure it's in your PATH:

```bash
which stripe
stripe --version
```

### Deployment Failures

**Error:** "npm run deploy:prod failed"

**Common causes:**
1. Missing SSM parameters
2. Invalid serverless.yml
3. AWS service limits reached
4. Insufficient permissions

**Debug:**
```bash
cd /mnt/c/Users/decry/Desktop/snapit-forum
npm run deploy:prod -- --verbose
```

## Project Context

This MCP server is configured for the **SnapIT Forum** project:

**Configuration:**
- S3 Bucket: `snapit-forum-static`
- CloudFront ID: `E1X8SJIRPSICZ4`
- AWS Region: `us-east-1`
- Stage: `prod`
- Service: `snapit-forum-api`

**Infrastructure:**
- 24 Lambda functions
- 7 DynamoDB tables (PAY_PER_REQUEST)
- 1 API Gateway (REST + WebSocket)
- 1 CloudFront distribution
- 8 SSM parameters
- SES for email sending

**Domains:**
- Frontend: https://forum.snapitsoftware.com
- CloudFront: https://d3jn3i879jxit2.cloudfront.net
- API: https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod

## Testing

### Manual Testing

Test the MCP server using the MCP Inspector:

```bash
cd /mnt/c/Users/decry/Desktop/snapit-forum/mcp-servers/aws-operator
npx @modelcontextprotocol/inspector node index.js
```

This opens a web UI to test all tools interactively.

### Test in Claude Desktop

Ask Claude to:
1. "Check the DynamoDB tables" - Should list all tables
2. "List SSM parameters" - Should show parameter names
3. "What's the SES status?" - Should show verified emails
4. "Create a CloudFront invalidation for /index.html" - Should create invalidation

## Next Steps

1. Configure Claude Desktop (see section 2)
2. Restart Claude Desktop
3. Verify tools are available
4. Try a simple command like "Check DynamoDB tables"
5. Deploy frontend or backend when ready

## Resources

- **MCP Documentation:** https://modelcontextprotocol.io/
- **MCP SDK:** https://github.com/modelcontextprotocol/sdk
- **AWS CLI Reference:** https://docs.aws.amazon.com/cli/
- **Serverless Framework:** https://www.serverless.com/
- **Stripe CLI:** https://stripe.com/docs/stripe-cli

## Support

For issues:

1. Check this guide first
2. Review README.md for detailed tool documentation
3. Check AWS CloudWatch logs
4. Review Claude Desktop logs
5. Verify AWS credentials and permissions

For SnapIT Forum infrastructure:
- See `PROJECT-STATUS-OCT-5-2025.md`
- See `DEPLOYMENT-GUIDE.md`
- See `QUICK-START.md`

## Version

**AWS Operator MCP Server v1.0.0**
- Created: October 5, 2025
- Node.js: 18+
- MCP SDK: 1.0.4
- Project: SnapIT Forum

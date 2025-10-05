# SnapIT Forum - AWS Operator MCP Server

A Model Context Protocol (MCP) server that provides AWS operations tooling specifically for the SnapIT Forum project. This server enables Claude Desktop and other MCP clients to perform AWS deployments, monitor infrastructure, and manage cloud resources.

## Features

This MCP server provides 8 specialized tools for managing the SnapIT Forum infrastructure:

### 1. deploy_backend
Deploy the serverless backend to AWS Lambda.

**What it does:**
- Runs `npm run deploy:prod` in the project root
- Deploys all Lambda functions using Serverless Framework
- Updates API Gateway endpoints
- Updates DynamoDB tables (if schema changed)
- Streams deployment output in real-time

**Usage:**
```json
{
  "name": "deploy_backend"
}
```

**Example output:**
```
Backend deployment completed successfully!

Deploying snapit-forum-api to stage prod (us-east-1)
✓ Service deployed to stack snapit-forum-api-prod
```

### 2. deploy_frontend
Build and deploy the React frontend to S3 with CloudFront invalidation.

**What it does:**
- Builds the React app (`npm run build`)
- Syncs build files to S3 bucket
- Creates CloudFront cache invalidation
- Optionally builds only (without deployment)
- Optionally skips CloudFront invalidation

**Parameters:**
- `buildOnly` (boolean): Only build without deploying - default: false
- `skipInvalidation` (boolean): Skip CloudFront cache invalidation - default: false

**Usage:**
```json
{
  "name": "deploy_frontend",
  "arguments": {
    "buildOnly": false,
    "skipInvalidation": false
  }
}
```

**Example output:**
```
Frontend deployment completed successfully!

Build: ✓
S3 Sync: ✓
CloudFront Invalidation: ✓ (I2ABCDEFGHIJKL)

Frontend URL: https://forum.snapitsoftware.com
CloudFront URL: https://d3jn3i879jxit2.cloudfront.net

Note: CloudFront cache invalidation may take 5-10 minutes to propagate.
```

### 3. tail_logs
Stream CloudWatch logs for Lambda functions in real-time.

**What it does:**
- Tails CloudWatch logs for specified Lambda function
- Streams logs continuously
- Supports time-based filtering
- Supports CloudWatch filter patterns

**Parameters:**
- `functionName` (string, required): Handler name (e.g., "googleAuth", "createForum")
- `startTime` (string): How far back to start (e.g., "10m", "1h", "3d") - default: "10m"
- `filter` (string): CloudWatch Logs filter pattern

**Usage:**
```json
{
  "name": "tail_logs",
  "arguments": {
    "functionName": "googleAuth",
    "startTime": "30m",
    "filter": "ERROR"
  }
}
```

**Example output:**
```
Tailing logs for googleAuth...

2025-10-05 15:30:45 START RequestId: abc-123
2025-10-05 15:30:45 Google auth initiated for user@example.com
2025-10-05 15:30:46 END RequestId: abc-123
```

### 4. check_dynamodb_tables
List all DynamoDB tables with status and metrics.

**What it does:**
- Lists all SnapIT Forum DynamoDB tables
- Shows table status, item counts, and sizes
- Displays billing mode (PAY_PER_REQUEST)

**Usage:**
```json
{
  "name": "check_dynamodb_tables"
}
```

**Example output:**
```
DynamoDB Tables for SnapIT Forum (7 tables)

- snapit-forum-api-forums-prod
  Status: ACTIVE
  Items: 42
  Size: 15.23 KB
  Billing: PAY_PER_REQUEST

- snapit-forum-api-users-prod
  Status: ACTIVE
  Items: 156
  Size: 47.89 KB
  Billing: PAY_PER_REQUEST
```

### 5. get_ssm_parameters
List SSM Parameter Store parameters (names only, not values).

**What it does:**
- Lists all SSM parameters for SnapIT Forum
- Shows parameter types and last modified dates
- Does NOT expose parameter values for security

**Usage:**
```json
{
  "name": "get_ssm_parameters"
}
```

**Example output:**
```
SSM Parameters for SnapIT Forum (8 parameters)

- /snapit-forum/prod/GOOGLE_CLIENT_ID
  Type: SecureString
  Last Modified: 10/4/2025, 2:15:30 PM
  Version: 2

- /snapit-forum/prod/JWT_SECRET
  Type: SecureString
  Last Modified: 10/4/2025, 2:15:31 PM
  Version: 1

Note: Parameter values are hidden for security. Use AWS Console or CLI to view values.
```

### 6. check_ses_status
Check SES domain verification and email sending statistics.

**What it does:**
- Lists verified email addresses
- Shows sending statistics for last 24 hours
- Reports bounces and complaints

**Usage:**
```json
{
  "name": "check_ses_status"
}
```

**Example output:**
```
SES Status for SnapIT Forum

Verified Email Addresses:
noreply@snapitsoftware.com
support@snapitsoftware.com

Sending Statistics (Last 24 hours):
- Emails Sent: 234
- Bounces: 2
- Complaints: 0

Note: Check AWS SES Console for domain verification and sending limits.
```

### 7. create_cloudfront_invalidation
Create CloudFront cache invalidation to refresh content.

**What it does:**
- Creates cache invalidation for specified paths
- Returns invalidation ID for tracking
- Default invalidates all paths (/*)

**Parameters:**
- `paths` (string): Paths to invalidate - default: "/*"

**Usage:**
```json
{
  "name": "create_cloudfront_invalidation",
  "arguments": {
    "paths": "/*"
  }
}
```

**Example output:**
```
CloudFront cache invalidation created successfully!

Invalidation ID: I2ABCDEFGHIJKL
Distribution: E1X8SJIRPSICZ4
Paths: /*

Status: The invalidation is in progress and may take 5-10 minutes to complete.

Check status with:
aws cloudfront get-invalidation --distribution-id E1X8SJIRPSICZ4 --id I2ABCDEFGHIJKL
```

### 8. run_stripe_command
Execute Stripe CLI commands.

**What it does:**
- Runs Stripe CLI commands
- Supports all Stripe CLI operations
- Streams command output

**Parameters:**
- `command` (string, required): Stripe CLI command (e.g., "products", "prices", "webhooks")
- `args` (array): Additional arguments

**Usage:**
```json
{
  "name": "run_stripe_command",
  "arguments": {
    "command": "products",
    "args": ["list", "--limit", "10"]
  }
}
```

**Example output:**
```
Stripe command executed successfully!

Command: stripe products list --limit 10

Output:
ID                     NAME
prod_xxxxxxxxxxxxx     SnapIT Forum Pro
prod_yyyyyyyyyyyyy     SnapIT Forum Business
prod_zzzzzzzzzzzzz     SnapIT Forum Enterprise
```

## Installation

### Prerequisites

1. Node.js 18 or higher
2. AWS CLI configured with credentials
3. Stripe CLI (optional, for Stripe commands)

### Install Dependencies

```bash
cd /mnt/c/Users/decry/Desktop/snapit-forum/mcp-servers/aws-operator
npm install
```

### Make Executable

```bash
chmod +x index.js
```

## Configuration for Claude Desktop

Add this configuration to your Claude Desktop config file:

**macOS/Linux:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

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

**Windows specific path:**
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

### Restart Claude Desktop

After adding the configuration, restart Claude Desktop to load the MCP server.

## Security Considerations

### AWS Credentials

**How credentials are handled:**
- This MCP server uses the AWS CLI under the hood
- It does NOT store or transmit AWS credentials
- It relies on your existing AWS CLI configuration
- Credentials are read from `~/.aws/credentials` or environment variables
- Uses the AWS profile specified in the config (default: "default")

**Best practices:**
1. Use AWS IAM users with least-privilege permissions
2. Never share your AWS credentials
3. Rotate credentials regularly
4. Use MFA for production AWS accounts
5. Consider using AWS SSO for better security

### Required AWS Permissions

The AWS credentials need the following permissions:

**For backend deployment:**
- `lambda:*` - Create/update Lambda functions
- `apigateway:*` - Manage API Gateway
- `dynamodb:*` - Create/manage DynamoDB tables
- `iam:*` - Create IAM roles for Lambda
- `cloudformation:*` - Serverless framework uses CloudFormation
- `s3:*` - Upload Lambda deployment packages
- `logs:*` - CloudWatch Logs access

**For frontend deployment:**
- `s3:PutObject` - Upload files to S3
- `s3:DeleteObject` - Delete old files from S3
- `s3:ListBucket` - List S3 bucket contents
- `cloudfront:CreateInvalidation` - Invalidate CloudFront cache
- `cloudfront:GetInvalidation` - Check invalidation status

**For monitoring:**
- `dynamodb:DescribeTable` - Get table information
- `logs:FilterLogEvents` - Read CloudWatch logs
- `logs:TailLogs` - Stream logs
- `ssm:DescribeParameters` - List SSM parameters (not values)
- `ses:ListVerifiedEmailAddresses` - Check SES status
- `ses:GetSendStatistics` - Get email statistics

### Sensitive Data Protection

**SSM Parameters:**
- The `get_ssm_parameters` tool lists parameter NAMES only
- It does NOT expose parameter VALUES
- This prevents accidental exposure of secrets like:
  - Stripe API keys
  - Google OAuth secrets
  - JWT signing keys
  - Database credentials

**Logs:**
- Be careful when tailing logs that might contain sensitive data
- Lambda logs should NOT log sensitive information
- Use CloudWatch filter patterns to exclude PII

**Stripe CLI:**
- Stripe commands use your Stripe CLI authentication
- Never share your Stripe API keys
- Use test mode for development
- Switch to live mode only in production

## Project Configuration

The server is configured for the SnapIT Forum project with these defaults:

```javascript
const CONFIG = {
  projectRoot: '/mnt/c/Users/decry/Desktop/snapit-forum',
  s3Bucket: 'snapit-forum-static',
  cloudfrontId: 'E1X8SJIRPSICZ4',
  region: 'us-east-1',
  stage: 'prod',
  servicePrefix: 'snapit-forum-api',
};
```

These values match your current deployment setup as documented in:
- `deploy-production.sh`
- `serverless.yml`
- AWS infrastructure

## Troubleshooting

### Error: "AWS credentials not configured"

**Solution:**
```bash
aws configure
```

Enter your AWS Access Key ID, Secret Access Key, and region.

### Error: "Command not found: stripe"

**Solution:**
Install Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.0/stripe_1.19.0_linux_x86_64.tar.gz
tar -xvf stripe_1.19.0_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/

# Windows
scoop install stripe
```

Then authenticate:
```bash
stripe login
```

### Error: "npm run deploy:prod failed"

**Common causes:**
1. Missing environment variables in SSM Parameter Store
2. Invalid serverless.yml syntax
3. AWS permission issues
4. Node modules not installed

**Solution:**
```bash
cd /mnt/c/Users/decry/Desktop/snapit-forum
npm install
serverless deploy --stage prod --verbose
```

### Error: "CloudFront invalidation failed"

**Common causes:**
1. Invalid distribution ID
2. Missing CloudFront permissions
3. Too many invalidations (AWS limit: 3000/month free, then $0.005 per path)

**Solution:**
Check your CloudFront distribution ID:
```bash
aws cloudfront list-distributions --query 'DistributionList.Items[*].[Id,DomainName]' --output table
```

### MCP Server Not Showing in Claude Desktop

**Solutions:**
1. Verify the config file path is correct
2. Check JSON syntax is valid (use a JSON validator)
3. Ensure file paths use correct separators (\ for Windows, / for Unix)
4. Restart Claude Desktop completely
5. Check Claude Desktop logs for errors

## Development

### Testing the MCP Server

You can test the server using the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node index.js
```

This opens a web interface to test all tools interactively.

### Adding New Tools

To add a new tool:

1. Add the tool definition in `ListToolsRequestSchema` handler
2. Implement the tool function
3. Add the case in `CallToolRequestSchema` handler
4. Update this README with documentation

### Debugging

Enable verbose logging by setting environment variable:

```bash
export DEBUG=mcp:*
node index.js
```

## Architecture

```
┌─────────────────────────────────────────────┐
│          Claude Desktop (MCP Client)        │
└────────────────┬────────────────────────────┘
                 │ MCP Protocol (stdio)
                 │
┌────────────────▼────────────────────────────┐
│      SnapIT AWS Operator MCP Server         │
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │  Tool Handlers                      │  │
│  │  - deploy_backend()                 │  │
│  │  - deploy_frontend()                │  │
│  │  - tail_logs()                      │  │
│  │  - check_dynamodb_tables()          │  │
│  │  - get_ssm_parameters()             │  │
│  │  - check_ses_status()               │  │
│  │  - create_cloudfront_invalidation() │  │
│  │  - run_stripe_command()             │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │  Command Executor                   │  │
│  │  - Spawns child processes           │  │
│  │  - Streams output                   │  │
│  │  - Error handling                   │  │
│  └─────────────────────────────────────┘  │
└────────────────┬────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
┌───────┐   ┌────────┐   ┌────────┐
│AWS CLI│   │npm/node│   │Stripe  │
└───┬───┘   └───┬────┘   └───┬────┘
    │           │            │
    ▼           ▼            ▼
┌─────────────────────────────────┐
│     AWS Services                │
│  - Lambda                       │
│  - S3                           │
│  - CloudFront                   │
│  - DynamoDB                     │
│  - CloudWatch                   │
│  - SSM Parameter Store          │
│  - SES                          │
└─────────────────────────────────┘
```

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [MCP SDK for Node.js](https://github.com/modelcontextprotocol/sdk)
- [AWS CLI Documentation](https://docs.aws.amazon.com/cli/)
- [Serverless Framework](https://www.serverless.com/)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

## License

MIT License - SnapIT Software

## Support

For issues specific to this MCP server, check:
1. AWS credentials are configured correctly
2. All required CLIs are installed (aws, stripe)
3. Node.js version is 18 or higher
4. Claude Desktop config is valid JSON

For SnapIT Forum infrastructure issues, see:
- `PROJECT-STATUS-OCT-5-2025.md`
- `DEPLOYMENT-GUIDE.md`
- `QUICK-START.md`

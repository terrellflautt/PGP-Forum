# Quick Start Guide - SnapIT Forum MCP Server

## Installation (One-time Setup)

1. **Install dependencies:**
   ```bash
   cd /mnt/c/Users/decry/Desktop/snapit-forum/mcp-servers/project-manager
   npm install
   ```

2. **Test the server:**
   ```bash
   node test.js
   ```

3. **Configure Claude Desktop:**

   Open Claude Desktop configuration file:
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Linux:** `~/.config/Claude/claude_desktop_config.json`

   Add this configuration:
   ```json
   {
     "mcpServers": {
       "snapit-forum": {
         "command": "node",
         "args": [
           "/mnt/c/Users/decry/Desktop/snapit-forum/mcp-servers/project-manager/index.js"
         ]
       }
     }
   }
   ```

   **Note:** Adjust the path based on your operating system:
   - **Windows (CMD/PowerShell):** `C:\\Users\\decry\\Desktop\\snapit-forum\\mcp-servers\\project-manager\\index.js`
   - **WSL/Linux/macOS:** `/mnt/c/Users/decry/Desktop/snapit-forum/mcp-servers/project-manager/index.js`

4. **Restart Claude Desktop**

## Available Tools

Once configured, you can use these commands in Claude Desktop:

### 1. Check Project Status
```
What's the current status of the SnapIT Forum project?
```
Returns complete project overview, features, deployment status, and next steps.

### 2. Get Architecture Details
```
Show me the database architecture and data flow.
```
Returns DynamoDB table structures, domain configuration, and performance details.

### 3. View Implementation Roadmap
```
What are the next implementation priorities?
```
Returns TODO list, file structure, and development tasks.

### 4. Get API Documentation
```
List all API endpoints for user management.
```
Returns all 29 Lambda endpoints with examples and authentication details.

### 5. Check Deployment Status
```
What Lambda functions are currently deployed?
```
Runs AWS CLI to list all deployed functions (requires AWS credentials).

### 6. Get Stripe Configuration
```
What are the pricing tiers and Stripe setup?
```
Returns pricing details, product configuration, and revenue calculations.

## Example Queries

### Development Tasks
```
What messenger features need to be implemented?
```

### Technical Questions
```
How does the PGP encryption work in the messaging system?
```

### Deployment Information
```
What's the current CloudFront distribution ID?
```

### Business Information
```
What's the cost breakdown for 10,000 users?
```

## Troubleshooting

### Server won't start
```bash
# Check Node.js version (need 18+)
node --version

# Reinstall dependencies
npm install

# Run test
node test.js
```

### AWS CLI not working
```bash
# Install AWS CLI
# Windows: choco install awscli
# macOS: brew install awscli
# Linux: sudo apt install awscli

# Configure credentials
aws configure
```

### Claude Desktop not seeing the server
1. Check the configuration file path is correct
2. Ensure the JSON is valid (no trailing commas)
3. Restart Claude Desktop completely
4. Check Claude Desktop logs for errors

## File Structure

```
project-manager/
├── index.js                              # MCP server implementation
├── package.json                          # Dependencies
├── README.md                             # Full documentation
├── QUICK-START.md                        # This file
├── test.js                               # Test script
└── claude_desktop_config.example.json    # Config template
```

## What This Does

The MCP server provides Claude Desktop with direct access to:

1. **Project Documentation** - All markdown files in the project
2. **AWS Status** - Live Lambda function deployment info
3. **Structured Data** - Pricing, architecture, API specs
4. **Development Tasks** - Roadmap and TODO items

This makes it easy for Claude to:
- Answer questions about the project
- Help with development tasks
- Provide accurate status updates
- Access real-time deployment information

## Next Steps

After configuration:

1. Ask Claude about the project status
2. Request help with specific implementation tasks
3. Get deployment information
4. Review API documentation
5. Check Stripe configuration

The MCP server makes all project information instantly available to Claude!

---

**Need Help?**
- Check the full README.md for detailed documentation
- Run `node test.js` to verify setup
- Email: snapitsaas@gmail.com

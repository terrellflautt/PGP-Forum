# SnapIT Forum MCP Server

A Model Context Protocol (MCP) server for managing the SnapIT Forum project. This server provides tools for accessing project documentation, checking deployment status, and managing project workflows.

## Overview

This MCP server gives Claude Desktop (and other MCP clients) direct access to:

- Project status and roadmap
- Architecture documentation
- API reference documentation
- AWS Lambda deployment status
- Stripe configuration details

## Installation

### Prerequisites

- Node.js 18.0.0 or higher
- AWS CLI configured with credentials (for deployment checks)
- Access to the SnapIT Forum project directory

### Setup

1. Navigate to the server directory:
   ```bash
   cd /mnt/c/Users/decry/Desktop/snapit-forum/mcp-servers/project-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Test the server:
   ```bash
   npm start
   ```

## Available Tools

### 1. `get_project_status`
Returns the current project status from `PROJECT-STATUS-OCT-5-2025.md`.

**Returns:**
- Complete feature list
- Technical architecture overview
- Deployment status
- Testing checklist
- Next steps and roadmap

**Usage:**
```json
{
  "name": "get_project_status"
}
```

### 2. `get_architecture`
Returns architecture overview from `ARCHITECTURE-OVERVIEW.md`.

**Returns:**
- Domain and API configuration
- DynamoDB table structures
- Data flow diagrams
- Performance optimization strategies
- Cost breakdown by usage tier

**Usage:**
```json
{
  "name": "get_architecture"
}
```

### 3. `list_todos`
Returns implementation roadmap from `IMPLEMENTATION-ROADMAP.md`.

**Returns:**
- Current implementation priorities
- File structure and component breakdown
- Backend endpoint status
- Testing checklist
- Success metrics

**Usage:**
```json
{
  "name": "list_todos"
}
```

### 4. `get_api_docs`
Returns API reference documentation from `API-REFERENCE.md`.

**Returns:**
- All 29 Lambda endpoints
- Request/response examples
- Authentication requirements
- Usage patterns and examples

**Usage:**
```json
{
  "name": "get_api_docs"
}
```

### 5. `check_deployment_status`
Runs `aws lambda list-functions` to check deployed Lambda functions.

**Returns:**
- List of all deployed functions
- Runtime information
- Last modified timestamps
- Function count and status

**Usage:**
```json
{
  "name": "check_deployment_status"
}
```

**Note:** Requires AWS CLI configured with proper credentials.

### 6. `get_stripe_config`
Returns Stripe configuration status from multiple documentation files.

**Returns:**
- Pricing tier breakdown
- Product setup instructions
- Live/test mode configuration
- Revenue calculations
- Integration status

**Usage:**
```json
{
  "name": "get_stripe_config"
}
```

## Configuration for Claude Desktop

Add this server to your Claude Desktop configuration file.

### macOS/Linux

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

### Windows

Edit `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "snapit-forum": {
      "command": "node",
      "args": [
        "C:\\Users\\decry\\Desktop\\snapit-forum\\mcp-servers\\project-manager\\index.js"
      ]
    }
  }
}
```

### WSL (Windows Subsystem for Linux)

If you're using WSL, use the WSL path:

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

## Usage in Claude Desktop

Once configured, you can ask Claude to use these tools:

### Example Queries

**Check project status:**
```
What's the current status of the SnapIT Forum project?
```

**Review architecture:**
```
Show me the database architecture and explain the data flow.
```

**Check deployment:**
```
What Lambda functions are currently deployed?
```

**Review API endpoints:**
```
List all available API endpoints for user management.
```

**Check Stripe setup:**
```
What are the pricing tiers and how is Stripe configured?
```

**Get implementation tasks:**
```
What are the next implementation priorities?
```

## Development

### Project Structure

```
project-manager/
├── index.js           # Main MCP server implementation
├── package.json       # Node.js dependencies
└── README.md          # This file
```

### Extending the Server

To add new tools:

1. Add the tool definition in `ListToolsRequestSchema` handler
2. Add the tool implementation in `CallToolRequestSchema` handler
3. Update this README with the new tool documentation

### Testing

Test the server by running:
```bash
npm start
```

The server communicates via stdio, so you'll need to send MCP protocol messages to test individual tools.

## Dependencies

- `@modelcontextprotocol/sdk` - MCP SDK for building servers
- Built-in Node.js modules: `fs/promises`, `child_process`, `util`, `path`

## Troubleshooting

### Server won't start
- Ensure Node.js 18+ is installed: `node --version`
- Check all dependencies are installed: `npm install`
- Verify project paths are correct

### AWS CLI commands fail
- Ensure AWS CLI is installed: `aws --version`
- Configure credentials: `aws configure`
- Test access: `aws lambda list-functions`

### File not found errors
- Verify you're in the correct project directory
- Check that documentation files exist in the project root
- Ensure paths in the configuration are absolute

## License

MIT License - Part of the SnapIT Forum project

## Support

For issues or questions:
- Email: snapitsaas@gmail.com
- GitHub: https://github.com/terrellflautt/PGP-Forum

---

**Last Updated:** October 5, 2025
**Version:** 1.0.0
**Status:** Production Ready

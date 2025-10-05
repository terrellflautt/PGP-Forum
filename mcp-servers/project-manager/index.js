#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

// Get the project root directory (2 levels up from this file)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// Helper function to read markdown files
async function readMarkdownFile(filename) {
  try {
    const filePath = path.join(PROJECT_ROOT, filename);
    const content = await readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(`Failed to read ${filename}: ${error.message}`);
  }
}

// Helper function to execute AWS CLI commands
async function executeAWSCommand(command) {
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stderr && !stderr.includes('Warning')) {
      console.error('AWS CLI stderr:', stderr);
    }
    return stdout;
  } catch (error) {
    throw new Error(`AWS CLI error: ${error.message}`);
  }
}

// Create server instance
const server = new Server(
  {
    name: 'snapit-forum-project-manager',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_project_status',
        description: 'Get the current project status from PROJECT-STATUS-OCT-5-2025.md. Returns complete overview of features, architecture, deployment status, and next steps.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'get_architecture',
        description: 'Get the architecture overview from ARCHITECTURE-OVERVIEW.md. Returns details about domain configuration, DynamoDB tables, data flow, performance optimization, and cost breakdown.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'list_todos',
        description: 'Get the implementation roadmap from IMPLEMENTATION-ROADMAP.md. Returns current task priorities, file structure, backend endpoint status, and testing checklist.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'get_api_docs',
        description: 'Get API reference documentation from API-REFERENCE.md. Returns all 29 Lambda endpoints with request/response examples, authentication details, and usage patterns.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'check_deployment_status',
        description: 'Check AWS Lambda deployment status by running "aws lambda list-functions". Returns list of all deployed Lambda functions with runtime information.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'get_stripe_config',
        description: 'Get Stripe configuration status from multiple docs. Returns pricing tiers, product setup, live/test mode configuration, and integration details.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;

  try {
    switch (name) {
      case 'get_project_status': {
        const content = await readMarkdownFile('PROJECT-STATUS-OCT-5-2025.md');
        return {
          content: [
            {
              type: 'text',
              text: `# SnapIT Forum - Project Status\n\n${content}`,
            },
          ],
        };
      }

      case 'get_architecture': {
        const content = await readMarkdownFile('ARCHITECTURE-OVERVIEW.md');
        return {
          content: [
            {
              type: 'text',
              text: `# SnapIT Forum - Architecture Overview\n\n${content}`,
            },
          ],
        };
      }

      case 'list_todos': {
        const content = await readMarkdownFile('IMPLEMENTATION-ROADMAP.md');
        return {
          content: [
            {
              type: 'text',
              text: `# SnapIT Forum - Implementation Roadmap\n\n${content}`,
            },
          ],
        };
      }

      case 'get_api_docs': {
        const content = await readMarkdownFile('API-REFERENCE.md');
        return {
          content: [
            {
              type: 'text',
              text: `# SnapIT Forum - API Reference\n\n${content}`,
            },
          ],
        };
      }

      case 'check_deployment_status': {
        const output = await executeAWSCommand(
          'aws lambda list-functions --query "Functions[?contains(FunctionName, \'snapit-forum\')].{Name:FunctionName, Runtime:Runtime, LastModified:LastModified}" --output json'
        );

        const functions = JSON.parse(output);
        const functionCount = functions.length;

        let report = `# AWS Lambda Deployment Status\n\n`;
        report += `**Total Functions Deployed**: ${functionCount}\n`;
        report += `**Filter**: snapit-forum*\n\n`;
        report += `## Deployed Functions:\n\n`;

        if (functionCount === 0) {
          report += `No Lambda functions found matching 'snapit-forum'.\n`;
        } else {
          functions.forEach((fn, index) => {
            report += `${index + 1}. **${fn.Name}**\n`;
            report += `   - Runtime: ${fn.Runtime}\n`;
            report += `   - Last Modified: ${fn.LastModified}\n\n`;
          });
        }

        return {
          content: [
            {
              type: 'text',
              text: report,
            },
          ],
        };
      }

      case 'get_stripe_config': {
        const statusDoc = await readMarkdownFile('PROJECT-STATUS-OCT-5-2025.md');
        const liveSetupDoc = await readMarkdownFile('STRIPE-LIVE-MODE-SETUP.md');

        // Extract pricing section from status doc
        const pricingMatch = statusDoc.match(/## 💰 Monetization \(Stripe\)([\s\S]*?)(?=##|$)/);
        const pricingSection = pricingMatch ? pricingMatch[0] : 'Pricing information not found';

        let report = `# Stripe Configuration Status\n\n`;
        report += `## Pricing Tiers\n\n${pricingSection}\n\n`;
        report += `## Live Mode Setup\n\n`;
        report += `${liveSetupDoc}\n`;

        return {
          content: [
            {
              type: 'text',
              text: report,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SnapIT Forum MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});

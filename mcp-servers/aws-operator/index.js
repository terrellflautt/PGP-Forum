#!/usr/bin/env node

/**
 * SnapIT Forum - AWS Operations MCP Server
 *
 * Model Context Protocol server that provides AWS operations tooling
 * for the SnapIT Forum project.
 *
 * Tools provided:
 * - deploy_backend: Deploy serverless backend to AWS Lambda
 * - deploy_frontend: Deploy frontend to S3 and invalidate CloudFront
 * - tail_logs: Stream Lambda function logs
 * - check_dynamodb_tables: List all DynamoDB tables
 * - get_ssm_parameters: List SSM parameters (not values)
 * - check_ses_status: Check SES domain verification
 * - create_cloudfront_invalidation: Invalidate CloudFront cache
 * - run_stripe_command: Execute Stripe CLI commands
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';

const exec = promisify(execCallback);

// Configuration
const CONFIG = {
  projectRoot: '/mnt/c/Users/decry/Desktop/snapit-forum',
  s3Bucket: 'snapit-forum-static',
  cloudfrontId: 'E1X8SJIRPSICZ4',
  region: 'us-east-1',
  stage: 'prod',
  servicePrefix: 'snapit-forum-api',
};

/**
 * Execute a command and stream output
 */
async function executeCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd: options.cwd || CONFIG.projectRoot,
      shell: true,
      env: { ...process.env, ...options.env },
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      if (options.stream) {
        process.stderr.write(output); // Stream to stderr for MCP
      }
    });

    proc.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      if (options.stream) {
        process.stderr.write(output);
      }
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, exitCode: code });
      } else {
        reject(new Error(`Command failed with exit code ${code}\n${stderr}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Deploy backend to AWS Lambda
 */
async function deployBackend() {
  try {
    const result = await executeCommand('npm', ['run', 'deploy:prod'], {
      cwd: CONFIG.projectRoot,
      stream: true,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Backend deployment completed successfully!\n\nOutput:\n${result.stdout}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Backend deployment failed: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Deploy frontend to S3 and invalidate CloudFront
 */
async function deployFrontend(options = {}) {
  try {
    const buildOnly = options.buildOnly || false;
    const skipInvalidation = options.skipInvalidation || false;

    // Step 1: Build React app
    const buildResult = await executeCommand('npm', ['run', 'build'], {
      cwd: `${CONFIG.projectRoot}/forum-app`,
      stream: true,
    });

    if (buildOnly) {
      return {
        content: [
          {
            type: 'text',
            text: `Frontend build completed successfully!\n\nOutput:\n${buildResult.stdout}`,
          },
        ],
      };
    }

    // Step 2: Sync to S3
    const syncResult = await executeCommand(
      'aws',
      [
        's3',
        'sync',
        'forum-app/build/',
        `s3://${CONFIG.s3Bucket}/`,
        '--delete',
        '--region',
        CONFIG.region,
      ],
      {
        stream: true,
      }
    );

    let invalidationId = null;

    // Step 3: Invalidate CloudFront (unless skipped)
    if (!skipInvalidation) {
      const invalidateResult = await executeCommand(
        'aws',
        [
          'cloudfront',
          'create-invalidation',
          '--distribution-id',
          CONFIG.cloudfrontId,
          '--paths',
          '/*',
          '--query',
          'Invalidation.Id',
          '--output',
          'text',
        ],
        {
          stream: false,
        }
      );

      invalidationId = invalidateResult.stdout.trim();
    }

    return {
      content: [
        {
          type: 'text',
          text: `Frontend deployment completed successfully!\n\n` +
            `Build: ✓\n` +
            `S3 Sync: ✓\n` +
            `CloudFront Invalidation: ${invalidationId ? `✓ (${invalidationId})` : 'Skipped'}\n\n` +
            `Frontend URL: https://forum.snapitsoftware.com\n` +
            `CloudFront URL: https://d3jn3i879jxit2.cloudfront.net\n\n` +
            `Note: CloudFront cache invalidation may take 5-10 minutes to propagate.`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Frontend deployment failed: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Tail Lambda function logs
 */
async function tailLogs(functionName, options = {}) {
  try {
    const startTime = options.startTime || '10m';
    const filter = options.filter || '';

    // Get log group name
    const logGroup = `/aws/lambda/${CONFIG.servicePrefix}-${functionName}-${CONFIG.stage}`;

    // Build command
    const args = [
      'logs',
      'tail',
      logGroup,
      '--follow',
      '--since',
      startTime,
      '--region',
      CONFIG.region,
    ];

    if (filter) {
      args.push('--filter-pattern', filter);
    }

    // Note: This will stream logs continuously
    const result = await executeCommand('aws', args, {
      stream: true,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Tailing logs for ${functionName}...\n\n${result.stdout}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to tail logs: ${error.message}\n\nMake sure the function name is correct. Format: <handler-name> (e.g., "googleAuth", "createForum")`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Check DynamoDB tables
 */
async function checkDynamoDBTables() {
  try {
    // List all tables
    const listResult = await executeCommand(
      'aws',
      [
        'dynamodb',
        'list-tables',
        '--region',
        CONFIG.region,
        '--output',
        'json',
      ]
    );

    const allTables = JSON.parse(listResult.stdout);

    // Filter tables for this project
    const projectTables = allTables.TableNames.filter((name) =>
      name.startsWith(CONFIG.servicePrefix)
    );

    // Get details for each table
    const tableDetails = await Promise.all(
      projectTables.map(async (tableName) => {
        try {
          const describeResult = await executeCommand('aws', [
            'dynamodb',
            'describe-table',
            '--table-name',
            tableName,
            '--region',
            CONFIG.region,
            '--output',
            'json',
          ]);

          const tableInfo = JSON.parse(describeResult.stdout);
          const table = tableInfo.Table;

          return {
            name: tableName,
            status: table.TableStatus,
            itemCount: table.ItemCount,
            sizeBytes: table.TableSizeBytes,
            billingMode: table.BillingModeSummary?.BillingMode || 'PROVISIONED',
          };
        } catch (error) {
          return {
            name: tableName,
            error: error.message,
          };
        }
      })
    );

    const summary = tableDetails
      .map(
        (t) =>
          `- ${t.name}\n` +
          `  Status: ${t.status || 'ERROR'}\n` +
          `  Items: ${t.itemCount || 'N/A'}\n` +
          `  Size: ${t.sizeBytes ? (t.sizeBytes / 1024).toFixed(2) + ' KB' : 'N/A'}\n` +
          `  Billing: ${t.billingMode || 'N/A'}`
      )
      .join('\n\n');

    return {
      content: [
        {
          type: 'text',
          text: `DynamoDB Tables for SnapIT Forum (${projectTables.length} tables)\n\n${summary}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to check DynamoDB tables: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Get SSM parameters (names only, not values)
 */
async function getSSMParameters() {
  try {
    const result = await executeCommand('aws', [
      'ssm',
      'describe-parameters',
      '--region',
      CONFIG.region,
      '--output',
      'json',
    ]);

    const params = JSON.parse(result.stdout);

    // Filter parameters for this project
    const projectParams = params.Parameters.filter((p) =>
      p.Name.startsWith('/snapit-forum/')
    );

    const summary = projectParams
      .map(
        (p) =>
          `- ${p.Name}\n` +
          `  Type: ${p.Type}\n` +
          `  Last Modified: ${new Date(p.LastModifiedDate).toLocaleString()}\n` +
          `  Version: ${p.Version}`
      )
      .join('\n\n');

    return {
      content: [
        {
          type: 'text',
          text: `SSM Parameters for SnapIT Forum (${projectParams.length} parameters)\n\n${summary}\n\n` +
            `Note: Parameter values are hidden for security. Use AWS Console or CLI to view values.`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to get SSM parameters: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Check SES domain verification status
 */
async function checkSESStatus() {
  try {
    // Get verified identities
    const identitiesResult = await executeCommand('aws', [
      'ses',
      'list-verified-email-addresses',
      '--region',
      CONFIG.region,
      '--output',
      'json',
    ]);

    const identities = JSON.parse(identitiesResult.stdout);

    // Get sending statistics
    const statsResult = await executeCommand('aws', [
      'ses',
      'get-send-statistics',
      '--region',
      CONFIG.region,
      '--output',
      'json',
    ]);

    const stats = JSON.parse(statsResult.stdout);

    // Calculate totals from last 24 hours
    const recentStats = stats.SendDataPoints.slice(0, 24);
    const totalSent = recentStats.reduce((sum, dp) => sum + dp.DeliveryAttempts, 0);
    const totalBounces = recentStats.reduce((sum, dp) => sum + dp.Bounces, 0);
    const totalComplaints = recentStats.reduce((sum, dp) => sum + dp.Complaints, 0);

    return {
      content: [
        {
          type: 'text',
          text: `SES Status for SnapIT Forum\n\n` +
            `Verified Email Addresses:\n${identities.VerifiedEmailAddresses.join('\n') || 'None'}\n\n` +
            `Sending Statistics (Last 24 hours):\n` +
            `- Emails Sent: ${totalSent}\n` +
            `- Bounces: ${totalBounces}\n` +
            `- Complaints: ${totalComplaints}\n\n` +
            `Note: Check AWS SES Console for domain verification and sending limits.`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to check SES status: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Create CloudFront invalidation
 */
async function createCloudfrontInvalidation(options = {}) {
  try {
    const paths = options.paths || '/*';

    const result = await executeCommand('aws', [
      'cloudfront',
      'create-invalidation',
      '--distribution-id',
      CONFIG.cloudfrontId,
      '--paths',
      paths,
      '--query',
      'Invalidation.Id',
      '--output',
      'text',
    ]);

    const invalidationId = result.stdout.trim();

    return {
      content: [
        {
          type: 'text',
          text: `CloudFront cache invalidation created successfully!\n\n` +
            `Invalidation ID: ${invalidationId}\n` +
            `Distribution: ${CONFIG.cloudfrontId}\n` +
            `Paths: ${paths}\n\n` +
            `Status: The invalidation is in progress and may take 5-10 minutes to complete.\n\n` +
            `Check status with:\n` +
            `aws cloudfront get-invalidation --distribution-id ${CONFIG.cloudfrontId} --id ${invalidationId}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to create CloudFront invalidation: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Run Stripe CLI command
 */
async function runStripeCommand(command, args = []) {
  try {
    const result = await executeCommand('stripe', [command, ...args], {
      stream: true,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Stripe command executed successfully!\n\nCommand: stripe ${command} ${args.join(' ')}\n\nOutput:\n${result.stdout}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to run Stripe command: ${error.message}\n\n` +
            `Make sure Stripe CLI is installed and authenticated.\n` +
            `Install: https://stripe.com/docs/stripe-cli\n` +
            `Login: stripe login`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Initialize MCP Server
 */
const server = new Server(
  {
    name: 'snapit-aws-operator',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'deploy_backend',
        description:
          'Deploy the SnapIT Forum backend to AWS Lambda using serverless framework. Runs npm run deploy:prod in the project root.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'deploy_frontend',
        description:
          'Deploy the SnapIT Forum frontend to S3 and invalidate CloudFront cache. Builds React app, syncs to S3, and creates CloudFront invalidation.',
        inputSchema: {
          type: 'object',
          properties: {
            buildOnly: {
              type: 'boolean',
              description: 'Only build the frontend without deploying to S3',
              default: false,
            },
            skipInvalidation: {
              type: 'boolean',
              description: 'Skip CloudFront cache invalidation after S3 sync',
              default: false,
            },
          },
        },
      },
      {
        name: 'tail_logs',
        description:
          'Stream CloudWatch logs for a Lambda function in real-time. Use function handler name (e.g., "googleAuth", "createForum").',
        inputSchema: {
          type: 'object',
          properties: {
            functionName: {
              type: 'string',
              description: 'Lambda function handler name (e.g., googleAuth, createForum)',
            },
            startTime: {
              type: 'string',
              description: 'How far back to start tailing (e.g., 10m, 1h, 3d)',
              default: '10m',
            },
            filter: {
              type: 'string',
              description: 'CloudWatch Logs filter pattern',
            },
          },
          required: ['functionName'],
        },
      },
      {
        name: 'check_dynamodb_tables',
        description:
          'List all DynamoDB tables for the SnapIT Forum project with status, item counts, and size information.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_ssm_parameters',
        description:
          'List all SSM Parameter Store parameters for SnapIT Forum (names only, not values). Shows parameter names, types, and last modified dates.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'check_ses_status',
        description:
          'Check AWS SES domain verification status and email sending statistics for the last 24 hours.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'create_cloudfront_invalidation',
        description:
          'Create a CloudFront cache invalidation to refresh cached content. Use this after deploying new frontend code.',
        inputSchema: {
          type: 'object',
          properties: {
            paths: {
              type: 'string',
              description: 'Paths to invalidate (e.g., "/*" for all, "/index.html" for specific file)',
              default: '/*',
            },
          },
        },
      },
      {
        name: 'run_stripe_command',
        description:
          'Execute Stripe CLI commands (e.g., list products, create webhooks, listen to events). Requires Stripe CLI to be installed and authenticated.',
        inputSchema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'Stripe CLI command (e.g., "products", "prices", "webhooks")',
            },
            args: {
              type: 'array',
              description: 'Additional arguments for the command',
              items: {
                type: 'string',
              },
              default: [],
            },
          },
          required: ['command'],
        },
      },
    ],
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'deploy_backend':
        return await deployBackend();

      case 'deploy_frontend':
        return await deployFrontend(args);

      case 'tail_logs':
        return await tailLogs(args.functionName, args);

      case 'check_dynamodb_tables':
        return await checkDynamoDBTables();

      case 'get_ssm_parameters':
        return await getSSMParameters();

      case 'check_ses_status':
        return await checkSESStatus();

      case 'create_cloudfront_invalidation':
        return await createCloudfrontInvalidation(args);

      case 'run_stripe_command':
        return await runStripeCommand(args.command, args.args || []);

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error executing ${name}: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (stdout is reserved for MCP protocol)
  console.error('SnapIT Forum AWS Operator MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});

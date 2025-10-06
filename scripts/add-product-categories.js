#!/usr/bin/env node
/**
 * Add Product Categories to SnapIT Community
 */

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

const CATEGORIES_TABLE = 'snapit-forum-api-categories-prod';
const COMMUNITY_FORUM_ID = 'snapit-community';

const categories = [
  // Core Products
  { id: 'messenger', name: '💬 Messenger', description: 'PGP encrypted messaging - Help, tips, and discussion', position: 5 },
  { id: 'forum-builder', name: '🏗️ Forum Builder', description: 'Create and manage your own forums', position: 6 },
  { id: 'polls', name: '📊 Polls & Surveys', description: 'Anonymous polling and survey tools', position: 7 },
  { id: 'burn', name: '🔥 Burn (File Sharing)', description: 'Self-destructing file sharing', position: 8 },

  // Additional SnapIT Products
  { id: 'snapit-qr', name: '📱 SnapIT QR', description: 'QR code generator and scanner', position: 9 },
  { id: 'snapit-url', name: '🔗 SnapIT URL', description: 'URL shortener and link management', position: 10 },
  { id: 'url-status-checker', name: '✅ URL Status Checker', description: 'Monitor website uptime and status', position: 11 },
  { id: 'pdf-tools', name: '📄 PDF Tools', description: 'PDF conversion and manipulation tools', position: 12 },
  { id: 'snapit-agent', name: '🤖 SnapIT Agent', description: 'AI-powered automation and assistance', position: 13 },
  { id: 'snapit-analytics', name: '📈 SnapIT Analytics', description: 'Privacy-focused analytics platform', position: 14 },

  // Technical Discussions
  { id: 'ai-ml', name: '🧠 AI & Machine Learning', description: 'Discuss AI, ML, and automation', position: 15 },
  { id: 'web-design', name: '🎨 Web Design', description: 'UI/UX, design patterns, and best practices', position: 16 },
  { id: 'serverless', name: '☁️ Serverless Architecture', description: 'AWS Lambda, serverless patterns, and cloud', position: 17 },
  { id: 'web-security', name: '🔒 Web Security', description: 'Security best practices, encryption, and privacy', position: 18 },
  { id: 'devops', name: '⚙️ DevOps & CI/CD', description: 'Deployment, automation, and infrastructure', position: 19 }
];

async function addCategories() {
  console.log('🚀 Adding Product Categories to SnapIT Community...\n');

  for (const cat of categories) {
    const category = {
      forumIdCategoryId: `${COMMUNITY_FORUM_ID}#${cat.id}`,
      forumId: COMMUNITY_FORUM_ID,
      categoryId: cat.id,
      name: cat.name,
      description: cat.description,
      position: cat.position,
      threadCount: 0
    };

    try {
      await dynamodb.put({
        TableName: CATEGORIES_TABLE,
        Item: category,
        ConditionExpression: 'attribute_not_exists(forumIdCategoryId)'
      }).promise();
      console.log(`✅ Created: ${cat.name}`);
    } catch (error) {
      if (error.code === 'ConditionalCheckFailedException') {
        console.log(`ℹ️  Already exists: ${cat.name}`);
      } else {
        console.error(`❌ Failed to create ${cat.name}:`, error.message);
      }
    }
  }

  console.log(`\n✨ Category setup complete! Added ${categories.length} categories.\n`);
}

addCategories()
  .then(() => {
    console.log('✅ Setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });

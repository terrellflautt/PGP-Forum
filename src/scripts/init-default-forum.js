const { DynamoDB } = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new DynamoDB.DocumentClient({ region: 'us-east-1' });

const FORUMS_TABLE = 'snapit-forum-forums-prod';
const CATEGORIES_TABLE = 'snapit-forum-categories-prod';
const USERS_TABLE = 'snapit-forum-users-prod';

const ADMIN_EMAIL = 'snapitsaas@gmail.com';

async function initDefaultForum() {
  try {
    // Check if admin user exists
    const adminResult = await dynamodb.query({
      TableName: USERS_TABLE,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': ADMIN_EMAIL
      }
    }).promise();

    let adminUserId;
    if (!adminResult.Items || adminResult.Items.length === 0) {
      console.log('Admin user not found - will be created on first Google OAuth login');
      adminUserId = 'admin-placeholder'; // Will be replaced when admin logs in
    } else {
      adminUserId = adminResult.Items[0].userId;
      console.log(`Admin user found: ${adminUserId}`);
    }

    // Create default forum
    const forumId = uuidv4();
    const timestamp = Date.now();

    const forum = {
      forumId,
      ownerId: adminUserId,
      name: 'SnapIT Software',
      description: 'The simplest, most secure, privacy-first forum on the internet - Discuss our web apps, AI, security, and more',
      isPublic: true,
      encrypted: true,
      maxMembers: 1500,
      memberCount: 0,
      createdAt: timestamp,
      tier: 'free',
      minPowerToCreateShard: 10, // Need 10 Power (upvotes) to create a shard
      minAccountAgeDays: 7 // Account must be 7 days old
    };

    await dynamodb.put({
      TableName: FORUMS_TABLE,
      Item: forum
    }).promise();

    console.log(`✓ Created default forum: ${forumId}`);

    // Create shards (like subreddits)
    const shards = [
      {
        name: 'SnapIT Web Apps',
        description: 'Discuss SnapIT Forms, Analytics, QR, URL Shortener, Status Checker, and SaaS',
        icon: '🚀'
      },
      {
        name: 'New App Ideas',
        description: 'Share and discuss ideas for new privacy-focused web applications',
        icon: '💡'
      },
      {
        name: 'AI & Machine Learning',
        description: 'Discuss AI tools, models, privacy concerns, and implementations',
        icon: '🤖'
      },
      {
        name: 'Privacy & Anonymity',
        description: 'Best practices for digital privacy, anonymity networks, and data protection',
        icon: '🔐'
      },
      {
        name: 'Security & OpSec',
        description: 'Operational security, encryption, whistleblower protection, and threat modeling',
        icon: '🛡️'
      },
      {
        name: 'Web Design & Animation',
        description: 'UI/UX design, animations, CSS, Tailwind, and frontend techniques',
        icon: '🎨'
      },
      {
        name: 'Serverless Architecture',
        description: 'AWS Lambda, API Gateway, DynamoDB, CloudFront, and serverless patterns',
        icon: '☁️'
      },
      {
        name: 'Messenger & Communications',
        description: 'Secure messaging, PGP encryption, anonymous inboxes, and whistleblower tools',
        icon: '💬'
      }
    ];

    for (const shard of shards) {
      const categoryId = uuidv4();

      const shardItem = {
        categoryId, // Keep database field name for compatibility
        forumId,
        name: shard.name,
        description: shard.description,
        icon: shard.icon,
        threadCount: 0,
        createdAt: timestamp,
        order: shards.indexOf(shard),
        type: 'shard' // Mark as shard instead of category
      };

      await dynamodb.put({
        TableName: CATEGORIES_TABLE,
        Item: shardItem
      }).promise();

      console.log(`✓ Created shard: ${shard.name}`);
    }

    console.log('\n✅ Default forum initialized successfully!');
    console.log(`Forum ID: ${forumId}`);
    console.log(`Admin Email: ${ADMIN_EMAIL}`);
    console.log(`Shards Created: ${shards.length}`);
    console.log('\nShard Creation Requirements:');
    console.log('- 10 Power (upvotes) minimum');
    console.log('- Account at least 7 days old');
    console.log('\nNext steps:');
    console.log('1. Login with snapitsaas@gmail.com via Google OAuth');
    console.log('2. Set username for admin account');
    console.log('3. Admin can moderate, add mods, ban users');

    return { forumId, shards: shards.length };
  } catch (error) {
    console.error('Error initializing default forum:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  initDefaultForum()
    .then(result => {
      console.log('\nResult:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('\nFailed:', error);
      process.exit(1);
    });
}

module.exports = { initDefaultForum };

#!/usr/bin/env node
/**
 * Create SnapIT Community Forum
 *
 * This script creates the official SnapIT Community Forum that all users
 * automatically join when they sign up. Run once during initial setup.
 */

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

const FORUMS_TABLE = 'snapit-forum-api-forums-prod';
const CATEGORIES_TABLE = 'snapit-forum-api-categories-prod';

const COMMUNITY_FORUM_ID = 'snapit-community';

async function createCommunityForum() {
  console.log('🚀 Creating SnapIT Community Forum...\n');

  // 1. Create the forum
  const forum = {
    forumId: COMMUNITY_FORUM_ID,
    name: 'SnapIT Community',
    subdomain: 'forum',
    customDomain: 'forum.snapitsoftware.com',
    ownerUserId: 'system',
    tier: 'community',
    maxUsers: 999999, // Unlimited for community forum
    userCount: 0,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    createdAt: Date.now()
  };

  try {
    await dynamodb.put({
      TableName: FORUMS_TABLE,
      Item: forum,
      ConditionExpression: 'attribute_not_exists(forumId)'
    }).promise();
    console.log('✅ Forum created:', forum.name);
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
      console.log('ℹ️  Forum already exists, skipping...');
    } else {
      throw error;
    }
  }

  // 2. Create default categories
  const categories = [
    {
      categoryId: 'announcements',
      forumId: COMMUNITY_FORUM_ID,
      forumIdCategoryId: `${COMMUNITY_FORUM_ID}#announcements`,
      name: 'Announcements',
      description: 'Official announcements from the SnapIT team',
      position: 1,
      threadCount: 0
    },
    {
      categoryId: `${COMMUNITY_FORUM_ID}-general`,
      forumId: COMMUNITY_FORUM_ID,
      name: 'General Discussion',
      description: 'General discussions about SnapIT products and privacy',
      slug: 'general',
      icon: '💬',
      color: '#4361ee',
      order: 2,
      permissions: {
        createThreads: ['admin', 'moderator', 'member'],
        createPosts: ['admin', 'moderator', 'member'],
        viewThreads: ['admin', 'moderator', 'member', 'guest']
      },
      stats: {
        totalThreads: 0,
        totalPosts: 0,
        lastActivity: null
      },
      createdAt: Date.now()
    },
    {
      categoryId: `${COMMUNITY_FORUM_ID}-support`,
      forumId: COMMUNITY_FORUM_ID,
      name: 'Support',
      description: 'Get help with SnapIT products',
      slug: 'support',
      icon: '🛟',
      color: '#06d6a0',
      order: 3,
      permissions: {
        createThreads: ['admin', 'moderator', 'member'],
        createPosts: ['admin', 'moderator', 'member'],
        viewThreads: ['admin', 'moderator', 'member', 'guest']
      },
      stats: {
        totalThreads: 0,
        totalPosts: 0,
        lastActivity: null
      },
      createdAt: Date.now()
    },
    {
      categoryId: `${COMMUNITY_FORUM_ID}-feature-requests`,
      forumId: COMMUNITY_FORUM_ID,
      name: 'Feature Requests',
      description: 'Suggest new features and improvements',
      slug: 'feature-requests',
      icon: '💡',
      color: '#f72585',
      order: 4,
      permissions: {
        createThreads: ['admin', 'moderator', 'member'],
        createPosts: ['admin', 'moderator', 'member'],
        viewThreads: ['admin', 'moderator', 'member', 'guest']
      },
      stats: {
        totalThreads: 0,
        totalPosts: 0,
        lastActivity: null
      },
      createdAt: Date.now()
    },
    {
      categoryId: `${COMMUNITY_FORUM_ID}-polls`,
      forumId: COMMUNITY_FORUM_ID,
      name: 'Polls & Surveys',
      description: 'Community polls and feedback',
      slug: 'polls',
      icon: '📊',
      color: '#7209b7',
      order: 5,
      permissions: {
        createThreads: ['admin', 'moderator', 'member'],
        createPosts: ['admin', 'moderator', 'member'],
        viewThreads: ['admin', 'moderator', 'member', 'guest']
      },
      stats: {
        totalThreads: 0,
        totalPosts: 0,
        lastActivity: null
      },
      createdAt: Date.now()
    },
    {
      categoryId: `${COMMUNITY_FORUM_ID}-burn`,
      forumId: COMMUNITY_FORUM_ID,
      name: 'Burn (File Sharing)',
      description: 'Discuss secure file sharing with SnapIT Burn',
      slug: 'burn',
      icon: '🔥',
      color: '#fb5607',
      order: 6,
      permissions: {
        createThreads: ['admin', 'moderator', 'member'],
        createPosts: ['admin', 'moderator', 'member'],
        viewThreads: ['admin', 'moderator', 'member', 'guest']
      },
      stats: {
        totalThreads: 0,
        totalPosts: 0,
        lastActivity: null
      },
      createdAt: Date.now()
    }
  ];

  for (const category of categories) {
    try {
      await dynamodb.put({
        TableName: CATEGORIES_TABLE,
        Item: category,
        ConditionExpression: 'attribute_not_exists(categoryId)'
      }).promise();
      console.log(`✅ Category created: ${category.icon} ${category.name}`);
    } catch (error) {
      if (error.code === 'ConditionalCheckFailedException') {
        console.log(`ℹ️  Category already exists: ${category.name}`);
      } else {
        throw error;
      }
    }
  }

  console.log('\n✨ SnapIT Community Forum setup complete!\n');
  console.log('Forum ID:', COMMUNITY_FORUM_ID);
  console.log('URL: https://forum.snapitsoftware.com');
  console.log('Categories:', categories.length);
  console.log('\nNext steps:');
  console.log('1. Update auth handlers to auto-join users to this forum');
  console.log('2. Update frontend to load this forum by default');
  console.log('3. Create welcome thread in Announcements category');
}

// Run the script
createCommunityForum()
  .then(() => {
    console.log('✅ Setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });

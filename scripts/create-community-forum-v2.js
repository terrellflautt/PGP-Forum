#!/usr/bin/env node
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
    customDomain: null,
    ownerUserId: 'system',
    tier: 'community',
    maxUsers: 999999,
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
      categoryId: 'general',
      forumId: COMMUNITY_FORUM_ID,
      forumIdCategoryId: `${COMMUNITY_FORUM_ID}#general`,
      name: 'General Discussion',
      description: 'Talk about anything SnapIT',
      position: 2,
      threadCount: 0
    },
    {
      categoryId: 'support',
      forumId: COMMUNITY_FORUM_ID,
      forumIdCategoryId: `${COMMUNITY_FORUM_ID}#support`,
      name: 'Support',
      description: 'Get help with SnapIT products',
      position: 3,
      threadCount: 0
    },
    {
      categoryId: 'feedback',
      forumId: COMMUNITY_FORUM_ID,
      forumIdCategoryId: `${COMMUNITY_FORUM_ID}#feedback`,
      name: 'Feedback & Feature Requests',
      description: 'Suggest improvements and new features',
      position: 4,
      threadCount: 0
    }
  ];

  for (const category of categories) {
    try {
      await dynamodb.put({
        TableName: CATEGORIES_TABLE,
        Item: category,
        ConditionExpression: 'attribute_not_exists(forumIdCategoryId)'
      }).promise();
      console.log(`✅ Category created: ${category.name}`);
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
}

createCommunityForum()
  .then(() => {
    console.log('\n✅ Setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  });

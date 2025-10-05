const { DynamoDB } = require('aws-sdk');
const dynamodb = new DynamoDB.DocumentClient();

const FORUMS_TABLE = process.env.FORUMS_TABLE;
const FORUM_MEMBERS_TABLE = process.env.FORUM_MEMBERS_TABLE;

// List forums
exports.list = async (event) => {
  try {
    const result = await dynamodb.scan({
      TableName: FORUMS_TABLE,
      Limit: 50
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(result.Items)
    };
  } catch (error) {
    console.error('List forums error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to list forums' })
    };
  }
};

// Get forum
exports.get = async (event) => {
  try {
    const { forumId } = event.pathParameters;

    const result = await dynamodb.get({
      TableName: FORUMS_TABLE,
      Key: { forumId }
    }).promise();

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Forum not found' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(result.Item)
    };
  } catch (error) {
    console.error('Get forum error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get forum' })
    };
  }
};

// Create forum (upgrade from free)
exports.create = async (event) => {
  try {
    const userId = event.requestContext.authorizer.userId;
    const { name, subdomain, tier = 'free' } = JSON.parse(event.body);

    if (!name || !subdomain) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Check if subdomain is available
    const existing = await dynamodb.get({
      TableName: FORUMS_TABLE,
      Key: { forumId: subdomain }
    }).promise();

    if (existing.Item) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: 'Subdomain already taken' })
      };
    }

    const forum = {
      forumId: subdomain,
      ownerUserId: userId,
      name,
      subdomain,
      customDomain: null,
      tier,
      maxUsers: tier === 'free' ? 1500 : tier === 'pro' ? 10000 : tier === 'business' ? 50000 : 999999,
      userCount: 1,
      createdAt: Date.now(),
      stripeCustomerId: null,
      stripeSubscriptionId: null
    };

    await dynamodb.put({
      TableName: FORUMS_TABLE,
      Item: forum
    }).promise();

    // Add creator as admin
    await dynamodb.put({
      TableName: FORUM_MEMBERS_TABLE,
      Item: {
        forumIdUserId: `${subdomain}#${userId}`,
        forumId: subdomain,
        userId,
        role: 'admin',
        joinedAt: Date.now()
      }
    }).promise();

    return {
      statusCode: 201,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(forum)
    };
  } catch (error) {
    console.error('Create forum error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create forum' })
    };
  }
};

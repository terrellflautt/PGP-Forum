const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { DynamoDB } = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new DynamoDB.DocumentClient();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const USERS_TABLE = process.env.USERS_TABLE;
const FORUMS_TABLE = process.env.FORUMS_TABLE;
const FORUM_MEMBERS_TABLE = process.env.FORUM_MEMBERS_TABLE;
const JWT_SECRET = process.env.JWT_SECRET;

// Google OAuth Callback
exports.googleCallback = async (event) => {
  try {
    const { code, state } = event.queryStringParameters;

    if (!code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing authorization code' })
      };
    }

    // Exchange code for tokens (this would integrate with your auth-service)
    // For now, simulate the process
    const googleUser = {
      sub: 'google-' + uuidv4(),
      email: 'user@example.com',
      name: 'John Doe',
      picture: 'https://via.placeholder.com/150'
    };

    // Check if user exists
    let user = await getUserByEmail(googleUser.email);

    if (!user) {
      // Create new user
      user = {
        userId: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        createdAt: Date.now(),
        pgpPublicKey: null
      };

      await dynamodb.put({
        TableName: USERS_TABLE,
        Item: user
      }).promise();

      // Create user's free forum
      await createUserForum(user);
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token
    return {
      statusCode: 302,
      headers: {
        Location: `https://forum.snapitsoftware.com/?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`
      }
    };

  } catch (error) {
    console.error('Google auth error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Authentication failed' })
    };
  }
};

// Create user's free forum
async function createUserForum(user) {
  const forumId = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
  const timestamp = Date.now();

  // Create forum
  const forum = {
    forumId,
    ownerUserId: user.userId,
    name: `${user.name}'s Forum`,
    subdomain: forumId,
    customDomain: null,
    tier: 'free',
    maxUsers: 1500,
    userCount: 1,
    createdAt: timestamp,
    stripeCustomerId: null,
    stripeSubscriptionId: null
  };

  await dynamodb.put({
    TableName: FORUMS_TABLE,
    Item: forum
  }).promise();

  // Add user as forum admin
  await dynamodb.put({
    TableName: FORUM_MEMBERS_TABLE,
    Item: {
      forumIdUserId: `${forumId}#${user.userId}`,
      forumId,
      userId: user.userId,
      role: 'admin',
      joinedAt: timestamp
    }
  }).promise();

  // Create default categories
  const categories = [
    { id: 'general', name: 'General Discussion', description: 'General chat', position: 1 },
    { id: 'support', name: 'Support', description: 'Get help', position: 2 },
    { id: 'feedback', name: 'Feedback', description: 'Share your thoughts', position: 3 }
  ];

  await Promise.all(categories.map(cat =>
    dynamodb.put({
      TableName: process.env.CATEGORIES_TABLE,
      Item: {
        forumIdCategoryId: `${forumId}#${cat.id}`,
        forumId,
        categoryId: cat.id,
        name: cat.name,
        description: cat.description,
        position: cat.position,
        threadCount: 0
      }
    }).promise()
  ));

  return forum;
}

// Get user by email
async function getUserByEmail(email) {
  const result = await dynamodb.query({
    TableName: USERS_TABLE,
    IndexName: 'EmailIndex',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email
    }
  }).promise();

  return result.Items && result.Items[0];
}

// JWT Authorizer
exports.authorizer = async (event) => {
  try {
    const token = event.authorizationToken.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);

    return {
      principalId: decoded.userId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [{
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: event.methodArn
        }]
      },
      context: {
        userId: decoded.userId,
        email: decoded.email
      }
    };
  } catch (error) {
    throw new Error('Unauthorized');
  }
};

// Refresh Token
exports.refreshToken = async (event) => {
  try {
    const { refreshToken } = JSON.parse(event.body);

    if (!refreshToken) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing refresh token' })
      };
    }

    // Verify and generate new token
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const newToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ token: newToken })
    };

  } catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid refresh token' })
    };
  }
};

const { DynamoDB } = require('aws-sdk');
const dynamodb = new DynamoDB.DocumentClient();

const USERS_TABLE = process.env.USERS_TABLE;
const MESSAGES_TABLE = process.env.MESSAGES_TABLE || 'snapit-forum-messages-prod';

// Get current user (authenticated)
exports.getMe = async (event) => {
  try {
    const userId = event.requestContext.authorizer.userId;

    const result = await dynamodb.get({
      TableName: USERS_TABLE,
      Key: { userId }
    }).promise();

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    // Return full user data for authenticated user
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(result.Item)
    };
  } catch (error) {
    console.error('Get me error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to get user' })
    };
  }
};

// Get user
exports.get = async (event) => {
  try {
    const { userId } = event.pathParameters;

    const result = await dynamodb.get({
      TableName: USERS_TABLE,
      Key: { userId }
    }).promise();

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    // Don't return sensitive data
    const { userId: id, email, name, picture, pgpPublicKey, createdAt } = result.Item;

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ userId: id, email, name, picture, pgpPublicKey, createdAt })
    };
  } catch (error) {
    console.error('Get user error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get user' })
    };
  }
};

// Update user
exports.update = async (event) => {
  try {
    const userId = event.requestContext.authorizer.userId;
    const { name, pgpPublicKey } = JSON.parse(event.body);

    const updateExpression = [];
    const expressionAttributeValues = {};

    if (name) {
      updateExpression.push('name = :name');
      expressionAttributeValues[':name'] = name;
    }

    if (pgpPublicKey) {
      updateExpression.push('pgpPublicKey = :key');
      expressionAttributeValues[':key'] = pgpPublicKey;
    }

    if (updateExpression.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No fields to update' })
      };
    }

    await dynamodb.update({
      TableName: USERS_TABLE,
      Key: { userId },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Update user error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update user' })
    };
  }
};

// Set username (first time)
exports.setUsername = async (event) => {
  try {
    const userId = event.requestContext.authorizer.userId;
    const { username } = JSON.parse(event.body);

    // Validate username
    if (!username || username.length < 3) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Username must be at least 3 characters' })
      };
    }

    const usernameRegex = /^[a-z0-9-]+$/;
    if (!usernameRegex.test(username)) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Username can only contain lowercase letters, numbers, and hyphens' })
      };
    }

    // Check if username is already taken
    const existingUser = await dynamodb.query({
      TableName: USERS_TABLE,
      IndexName: 'UsernameIndex',
      KeyConditionExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': username
      }
    }).promise();

    if (existingUser.Items && existingUser.Items.length > 0) {
      return {
        statusCode: 409,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Username already taken' })
      };
    }

    // Update user with username
    await dynamodb.update({
      TableName: USERS_TABLE,
      Key: { userId },
      UpdateExpression: 'SET username = :username',
      ExpressionAttributeValues: {
        ':username': username
      }
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, username })
    };
  } catch (error) {
    console.error('Set username error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to set username' })
    };
  }
};

// Check username availability
exports.checkUsername = async (event) => {
  try {
    const { username } = event.queryStringParameters || {};

    if (!username) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Username required' })
      };
    }

    const result = await dynamodb.query({
      TableName: USERS_TABLE,
      IndexName: 'UsernameIndex',
      KeyConditionExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': username
      }
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        available: !result.Items || result.Items.length === 0
      })
    };
  } catch (error) {
    console.error('Check username error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to check username' })
    };
  }
};

// Get public profile by username
exports.getPublicProfile = async (event) => {
  try {
    const { username } = event.pathParameters;

    const result = await dynamodb.query({
      TableName: USERS_TABLE,
      IndexName: 'UsernameIndex',
      KeyConditionExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': username
      }
    }).promise();

    if (!result.Items || result.Items.length === 0) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    const user = result.Items[0];

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        profile: {
          username: user.username,
          displayName: user.name,
          bio: user.bio || '',
          publicKey: user.pgpPublicKey || '',
          createdAt: user.createdAt,
          verified: user.verified || false
        }
      })
    };
  } catch (error) {
    console.error('Get public profile error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to get profile' })
    };
  }
};

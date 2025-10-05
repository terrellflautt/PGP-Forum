const { DynamoDB } = require('aws-sdk');
const dynamodb = new DynamoDB.DocumentClient();

const USERS_TABLE = process.env.USERS_TABLE;

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

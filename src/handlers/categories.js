const { DynamoDB } = require('aws-sdk');
const dynamodb = new DynamoDB.DocumentClient();

const CATEGORIES_TABLE = process.env.CATEGORIES_TABLE;

// List categories
exports.list = async (event) => {
  try {
    const { forumId } = event.pathParameters;

    const result = await dynamodb.scan({
      TableName: CATEGORIES_TABLE,
      FilterExpression: 'forumId = :fid',
      ExpressionAttributeValues: {
        ':fid': forumId
      }
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(result.Items)
    };
  } catch (error) {
    console.error('List categories error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to list categories' })
    };
  }
};

// Create category (admin only)
exports.create = async (event) => {
  try {
    const userId = event.requestContext.authorizer.userId;
    const { forumId } = event.pathParameters;
    const { categoryId, name, description, position } = JSON.parse(event.body);

    if (!categoryId || !name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // TODO: Check if user is admin of this forum

    const category = {
      forumIdCategoryId: `${forumId}#${categoryId}`,
      forumId,
      categoryId,
      name,
      description: description || '',
      position: position || 99,
      threadCount: 0,
      createdAt: Date.now()
    };

    await dynamodb.put({
      TableName: CATEGORIES_TABLE,
      Item: category
    }).promise();

    return {
      statusCode: 201,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(category)
    };
  } catch (error) {
    console.error('Create category error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create category' })
    };
  }
};

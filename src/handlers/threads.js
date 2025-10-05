const { DynamoDB } = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamodb = new DynamoDB.DocumentClient();

const THREADS_TABLE = process.env.THREADS_TABLE;
const CATEGORIES_TABLE = process.env.CATEGORIES_TABLE;

// List threads
exports.list = async (event) => {
  try {
    const { forumId, categoryId } = event.pathParameters;
    const limit = parseInt(event.queryStringParameters?.limit || '25');

    const result = await dynamodb.query({
      TableName: THREADS_TABLE,
      IndexName: 'CategoryIndex',
      KeyConditionExpression: 'forumIdCategoryId = :fid',
      ExpressionAttributeValues: {
        ':fid': `${forumId}#${categoryId}`
      },
      ScanIndexForward: false,
      Limit: limit
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(result.Items)
    };
  } catch (error) {
    console.error('List threads error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to list threads' })
    };
  }
};

// Get thread
exports.get = async (event) => {
  try {
    const { forumId, threadId } = event.pathParameters;

    const result = await dynamodb.query({
      TableName: THREADS_TABLE,
      KeyConditionExpression: 'forumIdThreadId = :ftid',
      ExpressionAttributeValues: {
        ':ftid': `${forumId}#${threadId}`
      }
    }).promise();

    if (!result.Items || result.Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Thread not found' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(result.Items[0])
    };
  } catch (error) {
    console.error('Get thread error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get thread' })
    };
  }
};

// Create thread
exports.create = async (event) => {
  try {
    const userId = event.requestContext.authorizer.userId;
    const { forumId, categoryId } = event.pathParameters;
    const { title, content } = JSON.parse(event.body);

    if (!title || !content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const threadId = uuidv4();
    const timestamp = Date.now();

    const thread = {
      forumIdThreadId: `${forumId}#${threadId}`,
      forumIdCategoryId: `${forumId}#${categoryId}`,
      forumId,
      threadId,
      categoryId,
      authorId: userId,
      title,
      content,
      createdAt: timestamp,
      lastPostAt: timestamp,
      postCount: 0,
      isPinned: false,
      isLocked: false
    };

    await dynamodb.put({
      TableName: THREADS_TABLE,
      Item: thread
    }).promise();

    // Update category thread count
    await dynamodb.update({
      TableName: CATEGORIES_TABLE,
      Key: {
        forumIdCategoryId: `${forumId}#${categoryId}`,
        position: 1 // You'll need to get the actual position
      },
      UpdateExpression: 'ADD threadCount :inc',
      ExpressionAttributeValues: {
        ':inc': 1
      }
    }).promise();

    return {
      statusCode: 201,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(thread)
    };
  } catch (error) {
    console.error('Create thread error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create thread' })
    };
  }
};

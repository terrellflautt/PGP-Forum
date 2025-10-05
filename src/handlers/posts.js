const { DynamoDB } = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamodb = new DynamoDB.DocumentClient();

const POSTS_TABLE = process.env.POSTS_TABLE;
const THREADS_TABLE = process.env.THREADS_TABLE;

// List posts
exports.list = async (event) => {
  try {
    const { forumId, threadId } = event.pathParameters;
    const limit = parseInt(event.queryStringParameters?.limit || '50');

    const result = await dynamodb.query({
      TableName: POSTS_TABLE,
      KeyConditionExpression: 'threadIdPostId BEGINS_WITH :tid',
      ExpressionAttributeValues: {
        ':tid': `${threadId}#`
      },
      ScanIndexForward: true,
      Limit: limit
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(result.Items)
    };
  } catch (error) {
    console.error('List posts error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to list posts' })
    };
  }
};

// Create post
exports.create = async (event) => {
  try {
    const userId = event.requestContext.authorizer.userId;
    const { forumId, threadId } = event.pathParameters;
    const { content } = JSON.parse(event.body);

    if (!content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing content' })
      };
    }

    const postId = uuidv4();
    const timestamp = Date.now();

    const post = {
      threadIdPostId: `${threadId}#${postId}`,
      threadId,
      postId,
      authorId: userId,
      content,
      createdAt: timestamp,
      edited: false,
      editedAt: null
    };

    await dynamodb.put({
      TableName: POSTS_TABLE,
      Item: post
    }).promise();

    // Update thread stats
    await dynamodb.update({
      TableName: THREADS_TABLE,
      Key: {
        forumIdThreadId: `${forumId}#${threadId}`,
        createdAt: 0 // You'll need to get actual createdAt
      },
      UpdateExpression: 'SET lastPostAt = :now ADD postCount :inc',
      ExpressionAttributeValues: {
        ':now': timestamp,
        ':inc': 1
      }
    }).promise();

    return {
      statusCode: 201,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(post)
    };
  } catch (error) {
    console.error('Create post error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create post' })
    };
  }
};

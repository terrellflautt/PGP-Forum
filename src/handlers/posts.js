const { DynamoDB } = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamodb = new DynamoDB.DocumentClient();

const POSTS_TABLE = process.env.POSTS_TABLE;
const THREADS_TABLE = process.env.THREADS_TABLE;
const VOTES_TABLE = process.env.VOTES_TABLE || 'snapit-forum-votes-prod';

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

/**
 * Validate that content is text-only (no media)
 * Prevents tracking via images, EXIF metadata, etc.
 */
function validateTextOnly(content) {
  // Check for image/video file extensions in URLs
  const mediaExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg|mp4|webm|avi|mov|mkv|flv|wmv|m4v|mpg|mpeg|3gp|pdf|zip|rar|7z|tar|gz)/i;
  if (mediaExtensions.test(content)) {
    return { valid: false, error: 'Media file links are not allowed in public posts. Text only.' };
  }

  // Check for base64 encoded images
  if (/data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,/i.test(content)) {
    return { valid: false, error: 'Embedded images are not allowed in public posts. Text only.' };
  }

  // Check for base64 encoded videos
  if (/data:video\/(mp4|webm|ogg);base64,/i.test(content)) {
    return { valid: false, error: 'Embedded videos are not allowed in public posts. Text only.' };
  }

  // Check for common image hosting domains
  const imageHostingDomains = /(imgur\.com|imgbb\.com|postimages\.org|i\.redd\.it|pbs\.twimg\.com)\/[^\s]*\.(jpg|jpeg|png|gif|webp)/i;
  if (imageHostingDomains.test(content)) {
    return { valid: false, error: 'Image hosting links are not allowed. Text only.' };
  }

  return { valid: true };
}

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

    // Validate text-only content (privacy feature)
    const validation = validateTextOnly(content);
    if (!validation.valid) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: validation.error })
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
      editedAt: null,
      upvotes: 0,
      downvotes: 0,
      score: 0
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

// Vote on post (upvote/downvote like Reddit)
exports.vote = async (event) => {
  try {
    const userId = event.requestContext.authorizer.userId;
    const { postId } = event.pathParameters;
    const { vote } = JSON.parse(event.body); // 1 for upvote, -1 for downvote, 0 to remove vote

    if (![1, -1, 0].includes(vote)) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid vote value' })
      };
    }

    const voteId = `${postId}#${userId}`;

    // Get existing vote
    const existingVote = await dynamodb.get({
      TableName: VOTES_TABLE,
      Key: { voteId }
    }).promise();

    const oldVote = existingVote.Item?.vote || 0;

    // Update or delete vote
    if (vote === 0) {
      // Remove vote
      await dynamodb.delete({
        TableName: VOTES_TABLE,
        Key: { voteId }
      }).promise();
    } else {
      // Update vote
      await dynamodb.put({
        TableName: VOTES_TABLE,
        Item: {
          voteId,
          postId,
          userId,
          vote,
          timestamp: Date.now()
        }
      }).promise();
    }

    // Calculate delta for post score
    const delta = vote - oldVote;

    // Update post score
    await dynamodb.update({
      TableName: POSTS_TABLE,
      Key: { threadIdPostId: postId }, // Adjust based on your key structure
      UpdateExpression: 'ADD score :delta, upvotes :upDelta, downvotes :downDelta',
      ExpressionAttributeValues: {
        ':delta': delta,
        ':upDelta': vote === 1 ? 1 : (oldVote === 1 ? -1 : 0),
        ':downDelta': vote === -1 ? 1 : (oldVote === -1 ? -1 : 0)
      }
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, vote, delta })
    };
  } catch (error) {
    console.error('Vote error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to vote' })
    };
  }
};

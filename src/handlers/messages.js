const { DynamoDB } = require('aws-sdk');
const dynamodb = new DynamoDB.DocumentClient();

const MESSAGES_TABLE = process.env.MESSAGES_TABLE;

// List messages (for a conversation)
exports.list = async (event) => {
  try {
    const userId = event.requestContext.authorizer.userId;
    const { otherUserId } = event.queryStringParameters;

    if (!otherUserId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing otherUserId' })
      };
    }

    // Create conversation ID (sorted user IDs)
    const conversationId = [userId, otherUserId].sort().join('#');

    const result = await dynamodb.query({
      TableName: MESSAGES_TABLE,
      KeyConditionExpression: 'conversationId = :cid',
      ExpressionAttributeValues: {
        ':cid': conversationId
      },
      ScanIndexForward: true,
      Limit: 100
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(result.Items)
    };
  } catch (error) {
    console.error('List messages error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to list messages' })
    };
  }
};

// Send message (PGP encrypted on client)
exports.send = async (event) => {
  try {
    const fromUserId = event.requestContext.authorizer.userId;
    const { toUserId, encryptedContent, encryptedSubject } = JSON.parse(event.body);

    if (!toUserId || !encryptedContent) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const conversationId = [fromUserId, toUserId].sort().join('#');
    const timestamp = Date.now();

    const message = {
      conversationId,
      timestamp,
      fromUserId,
      toUserId,
      encryptedContent, // PGP encrypted with recipient's public key
      encryptedSubject, // Optional encrypted subject
      read: false
    };

    await dynamodb.put({
      TableName: MESSAGES_TABLE,
      Item: message
    }).promise();

    return {
      statusCode: 201,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, timestamp })
    };
  } catch (error) {
    console.error('Send message error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send message' })
    };
  }
};

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

    // Mark messages as delivered and set TTL for auto-delete
    const currentTime = Math.floor(Date.now() / 1000);
    const updatePromises = result.Items
      .filter(msg => msg.toUserId === userId && !msg.delivered)
      .map(msg =>
        dynamodb.update({
          TableName: MESSAGES_TABLE,
          Key: {
            conversationId: msg.conversationId,
            timestamp: msg.timestamp
          },
          UpdateExpression: 'SET delivered = :true, #ttl = :ttl',
          ExpressionAttributeNames: {
            '#ttl': 'ttl'
          },
          ExpressionAttributeValues: {
            ':true': true,
            ':ttl': currentTime + 60 // Delete 60 seconds after delivery
          }
        }).promise()
      );

    await Promise.all(updatePromises);

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
    const currentTimeSeconds = Math.floor(timestamp / 1000);

    const message = {
      conversationId,
      timestamp,
      fromUserId,
      toUserId,
      encryptedContent, // PGP encrypted with recipient's public key
      encryptedSubject, // Optional encrypted subject
      read: false,
      delivered: false, // NEW: Track delivery status
      ttl: currentTimeSeconds + (24 * 60 * 60), // NEW: Auto-delete after 24 hours if not delivered
      expiresAt: timestamp + (24 * 60 * 60 * 1000) // NEW: Explicit expiration timestamp
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

// Send anonymous message to @username
exports.sendAnonymous = async (event) => {
  try {
    const { recipientUsername, encryptedContent, autoDeleteMinutes } = JSON.parse(event.body);

    if (!recipientUsername || !encryptedContent) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Look up recipient by username
    const USERS_TABLE = process.env.USERS_TABLE || 'snapit-forum-users-prod';
    const userResult = await dynamodb.query({
      TableName: USERS_TABLE,
      IndexName: 'UsernameIndex',
      KeyConditionExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': recipientUsername
      }
    }).promise();

    if (!userResult.Items || userResult.Items.length === 0) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    const recipient = userResult.Items[0];
    const messageId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();

    const message = {
      messageId,
      recipientId: recipient.userId,
      fromAnonymous: true,
      encryptedContent, // Already encrypted with recipient's public key
      timestamp,
      read: false,
      ttl: autoDeleteMinutes ? Math.floor((Date.now() + (autoDeleteMinutes * 60 * 1000)) / 1000) : undefined
    };

    await dynamodb.put({
      TableName: MESSAGES_TABLE,
      Item: message
    }).promise();

    return {
      statusCode: 201,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, messageId })
    };
  } catch (error) {
    console.error('Send anonymous message error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to send anonymous message' })
    };
  }
};

// Get conversations list
exports.getConversations = async (event) => {
  try {
    const userId = event.requestContext.authorizer.userId;

    // Query messages where user is sender or recipient
    const result = await dynamodb.query({
      TableName: MESSAGES_TABLE,
      IndexName: 'RecipientIndex',
      KeyConditionExpression: 'recipientId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false,
      Limit: 50
    }).promise();

    // Group by conversation and get last message
    const conversations = {};
    for (const msg of result.Items) {
      const otherUserId = msg.fromUserId === userId ? msg.toUserId : msg.fromUserId;
      if (!conversations[otherUserId] || msg.timestamp > conversations[otherUserId].lastMessageTime) {
        conversations[otherUserId] = {
          conversationId: otherUserId,
          recipientId: otherUserId,
          lastMessage: msg.encryptedContent ? '[Encrypted]' : '',
          lastMessageTime: msg.timestamp,
          unreadCount: msg.read ? 0 : 1,
          typing: false,
          online: false
        };
      }
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        conversations: Object.values(conversations)
      })
    };
  } catch (error) {
    console.error('Get conversations error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to get conversations' })
    };
  }
};

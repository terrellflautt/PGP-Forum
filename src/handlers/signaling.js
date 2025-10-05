const { DynamoDB } = require('aws-sdk');

const dynamodb = new DynamoDB.DocumentClient();
const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE || 'snapit-forum-api-connections-prod';
const RELAY_PEERS_TABLE = process.env.RELAY_PEERS_TABLE || 'snapit-forum-api-relay-peers-prod';

/**
 * WebRTC Signaling Server for Anonymous Relay
 * Handles peer discovery and WebRTC connection establishment
 */

// Handle WebSocket connection
exports.connect = async (event) => {
  const connectionId = event.requestContext.connectionId;

  try {
    // Store connection in DynamoDB
    await dynamodb.put({
      TableName: CONNECTIONS_TABLE,
      Item: {
        connectionId,
        connectedAt: Date.now(),
        ttl: Math.floor(Date.now() / 1000) + 3600 // 1 hour TTL
      }
    }).promise();

    return { statusCode: 200, body: 'Connected' };
  } catch (error) {
    console.error('Connection error:', error);
    return { statusCode: 500, body: 'Failed to connect' };
  }
};

// Handle WebSocket disconnection
exports.disconnect = async (event) => {
  const connectionId = event.requestContext.connectionId;

  try {
    // Remove connection from DynamoDB
    await dynamodb.delete({
      TableName: CONNECTIONS_TABLE,
      Key: { connectionId }
    }).promise();

    // Remove from relay peers if registered
    await dynamodb.delete({
      TableName: RELAY_PEERS_TABLE,
      Key: { connectionId }
    }).promise();

    return { statusCode: 200, body: 'Disconnected' };
  } catch (error) {
    console.error('Disconnection error:', error);
    return { statusCode: 500, body: 'Failed to disconnect' };
  }
};

// Handle peer discovery requests
exports.discoverRelays = async (event) => {
  const connectionId = event.requestContext.connectionId;

  try {
    // Get all active relay peers
    const result = await dynamodb.scan({
      TableName: RELAY_PEERS_TABLE,
      FilterExpression: 'enabled = :enabled AND expiresAt > :now',
      ExpressionAttributeValues: {
        ':enabled': true,
        ':now': Date.now()
      }
    }).promise();

    const peers = result.Items || [];

    // Send peer list back to requester
    await sendMessage(connectionId, {
      type: 'relay-list',
      peers: peers.map(p => ({
        id: p.peerId,
        capabilities: p.capabilities,
        connectedAt: p.connectedAt
      }))
    });

    return { statusCode: 200, body: 'Peers sent' };
  } catch (error) {
    console.error('Discover relays error:', error);
    return { statusCode: 500, body: 'Failed to discover relays' };
  }
};

// Handle relay advertisement (peer becomes relay node)
exports.advertiseRelay = async (event) => {
  const connectionId = event.requestContext.connectionId;

  try {
    const body = JSON.parse(event.body);
    const { peerId, capabilities } = body;

    // Register as relay peer
    await dynamodb.put({
      TableName: RELAY_PEERS_TABLE,
      Item: {
        connectionId,
        peerId,
        capabilities: capabilities || {},
        enabled: true,
        connectedAt: Date.now(),
        expiresAt: Date.now() + (30 * 60 * 1000), // 30 minute expiry
        relayCount: 0,
        ttl: Math.floor(Date.now() / 1000) + 1800
      }
    }).promise();

    await sendMessage(connectionId, {
      type: 'relay-registered',
      peerId,
      status: 'active'
    });

    return { statusCode: 200, body: 'Relay registered' };
  } catch (error) {
    console.error('Advertise relay error:', error);
    return { statusCode: 500, body: 'Failed to register relay' };
  }
};

// Handle ICE candidate exchange
exports.iceCandidate = async (event) => {
  const connectionId = event.requestContext.connectionId;

  try {
    const body = JSON.parse(event.body);
    const { candidate, targetPeer } = body;

    // Find target peer's connection
    const targetConnection = await findPeerConnection(targetPeer);

    if (targetConnection) {
      await sendMessage(targetConnection.connectionId, {
        type: 'ice-candidate',
        candidate,
        fromPeer: connectionId
      });
    }

    return { statusCode: 200, body: 'Candidate sent' };
  } catch (error) {
    console.error('ICE candidate error:', error);
    return { statusCode: 500, body: 'Failed to send candidate' };
  }
};

// Handle WebRTC offer
exports.offer = async (event) => {
  const connectionId = event.requestContext.connectionId;

  try {
    const body = JSON.parse(event.body);
    const { offer, targetPeer } = body;

    const targetConnection = await findPeerConnection(targetPeer);

    if (targetConnection) {
      await sendMessage(targetConnection.connectionId, {
        type: 'offer',
        offer,
        fromPeer: connectionId
      });
    }

    return { statusCode: 200, body: 'Offer sent' };
  } catch (error) {
    console.error('Offer error:', error);
    return { statusCode: 500, body: 'Failed to send offer' };
  }
};

// Handle WebRTC answer
exports.answer = async (event) => {
  const connectionId = event.requestContext.connectionId;

  try {
    const body = JSON.parse(event.body);
    const { answer, targetPeer } = body;

    const targetConnection = await findPeerConnection(targetPeer);

    if (targetConnection) {
      await sendMessage(targetConnection.connectionId, {
        type: 'answer',
        answer,
        fromPeer: connectionId
      });
    }

    return { statusCode: 200, body: 'Answer sent' };
  } catch (error) {
    console.error('Answer error:', error);
    return { statusCode: 500, body: 'Failed to send answer' };
  }
};

// Get peer's public key for encryption
exports.getPeerKey = async (event) => {
  const connectionId = event.requestContext.connectionId;

  try {
    const body = JSON.parse(event.body);
    const { peerId } = body;

    // Look up peer's public key from users table
    const USERS_TABLE = process.env.USERS_TABLE;
    const user = await dynamodb.get({
      TableName: USERS_TABLE,
      Key: { userId: peerId }
    }).promise();

    if (user.Item && user.Item.publicKey) {
      await sendMessage(connectionId, {
        type: 'peer-key',
        peerId,
        publicKey: user.Item.publicKey
      });
    }

    return { statusCode: 200, body: 'Key sent' };
  } catch (error) {
    console.error('Get peer key error:', error);
    return { statusCode: 500, body: 'Failed to get key' };
  }
};

// Default handler
exports.default = async (event) => {
  return {
    statusCode: 400,
    body: JSON.stringify({ error: 'Unknown route' })
  };
};

// Helper: Send message to WebSocket connection
async function sendMessage(connectionId, data) {
  const apiGatewayManagementApi = new AWS.ApiGatewayManagementApi({
    endpoint: process.env.WEBSOCKET_ENDPOINT
  });

  try {
    await apiGatewayManagementApi.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify(data)
    }).promise();
  } catch (error) {
    if (error.statusCode === 410) {
      // Connection is stale, remove it
      await dynamodb.delete({
        TableName: CONNECTIONS_TABLE,
        Key: { connectionId }
      }).promise();
    }
    throw error;
  }
}

// Helper: Find peer connection by peer ID
async function findPeerConnection(peerId) {
  const result = await dynamodb.query({
    TableName: RELAY_PEERS_TABLE,
    IndexName: 'PeerIdIndex',
    KeyConditionExpression: 'peerId = :pid',
    ExpressionAttributeValues: {
      ':pid': peerId
    },
    Limit: 1
  }).promise();

  return result.Items && result.Items.length > 0 ? result.Items[0] : null;
}

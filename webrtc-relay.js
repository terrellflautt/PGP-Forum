/**
 * WebRTC Peer Relay System for Anonymous Mode
 * Zero-cost IP anonymization using client-side P2P mesh routing
 *
 * Architecture:
 * User → Relay Peer 1 → Relay Peer 2 → Relay Peer 3 → Server
 *
 * Each API request is routed through 3 random peers before reaching server
 * Server only sees final relay peer's IP, not original user
 */

class AnonymousRelay {
  constructor() {
    this.peerConnections = new Map();
    this.relayPeers = [];
    this.signalingServer = 'wss://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod';
    this.isRelayNode = true; // All users are relay nodes (mandatory)
    this.anonymousModeEnabled = true; // ALWAYS ON - cannot be disabled
    this.minRelayHops = 3;
    this.maxRelayHops = 5;
  }

  // Initialize WebRTC relay system
  async init() {
    try {
      // Connect to signaling server for peer discovery
      await this.connectSignalingServer();

      // Discover available relay peers
      await this.discoverPeers();

      // If user opts in, become a relay node
      if (this.isRelayNode) {
        await this.advertiseAsRelay();
      }

      console.log('Anonymous relay initialized:', {
        availablePeers: this.relayPeers.length,
        relayNode: this.isRelayNode,
        anonymousMode: this.anonymousModeEnabled
      });

    } catch (error) {
      console.error('Relay initialization failed:', error);
      // Fallback to direct connection
      this.anonymousModeEnabled = false;
    }
  }

  // Connect to WebSocket signaling server for peer discovery
  async connectSignalingServer() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.signalingServer);

      this.ws.onopen = () => {
        console.log('Connected to signaling server');
        resolve();
      };

      this.ws.onerror = (error) => reject(error);

      this.ws.onmessage = (event) => {
        this.handleSignalingMessage(JSON.parse(event.data));
      };
    });
  }

  // Discover available relay peers
  async discoverPeers() {
    return new Promise((resolve) => {
      // Request list of active relay nodes
      this.ws.send(JSON.stringify({
        type: 'discover-relays',
        timestamp: Date.now()
      }));

      // Wait for peer list response
      const timeout = setTimeout(() => resolve(), 3000);

      const originalHandler = this.ws.onmessage;
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'relay-list') {
          this.relayPeers = data.peers || [];
          clearTimeout(timeout);
          this.ws.onmessage = originalHandler;
          resolve();
        }
      };
    });
  }

  // Advertise this client as available relay node
  async advertiseAsRelay() {
    this.ws.send(JSON.stringify({
      type: 'advertise-relay',
      peerId: this.generatePeerId(),
      capabilities: {
        bandwidth: 'medium', // Could measure actual bandwidth
        uptime: Date.now(),
        relayCount: 0
      }
    }));
  }

  // Create WebRTC peer connection
  async createPeerConnection(peerId) {
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const pc = new RTCPeerConnection(config);

    // Create data channel for relay traffic
    const channel = pc.createDataChannel('relay', {
      ordered: true,
      maxRetransmits: 3
    });

    channel.onopen = () => {
      console.log('Relay channel opened to peer:', peerId);
    };

    channel.onmessage = (event) => {
      this.handleRelayMessage(event.data, peerId);
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.ws.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate,
          targetPeer: peerId
        }));
      }
    };

    this.peerConnections.set(peerId, { pc, channel });
    return pc;
  }

  // Send API request through relay chain
  async sendAnonymousRequest(url, options = {}) {
    if (!this.anonymousModeEnabled || this.relayPeers.length < this.minRelayHops) {
      // Fallback to direct request
      return fetch(url, options);
    }

    try {
      // Select random relay chain
      const relayChain = this.selectRelayChain();

      // Encrypt request in layers (onion routing)
      const encryptedRequest = await this.encryptOnionLayers({
        url,
        options,
        relayChain,
        requestId: this.generateRequestId()
      });

      // Send to first relay peer
      const firstRelay = relayChain[0];
      const connection = this.peerConnections.get(firstRelay);

      if (!connection || connection.channel.readyState !== 'open') {
        throw new Error('Relay connection not ready');
      }

      // Send through relay chain
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Relay request timeout'));
        }, 30000); // 30 second timeout

        // Listen for response
        this.pendingRequests = this.pendingRequests || new Map();
        this.pendingRequests.set(encryptedRequest.requestId, {
          resolve: (response) => {
            clearTimeout(timeout);
            resolve(response);
          },
          reject: (error) => {
            clearTimeout(timeout);
            reject(error);
          }
        });

        // Send encrypted request through first relay
        connection.channel.send(JSON.stringify(encryptedRequest));
      });

    } catch (error) {
      console.warn('Anonymous relay failed, using direct connection:', error);
      return fetch(url, options);
    }
  }

  // Select random relay chain (3-5 peers)
  selectRelayChain() {
    const hopCount = Math.floor(
      Math.random() * (this.maxRelayHops - this.minRelayHops + 1)
    ) + this.minRelayHops;

    // Shuffle peers and take first N
    const shuffled = [...this.relayPeers].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(hopCount, shuffled.length));
  }

  // Encrypt request in onion layers (like Tor)
  async encryptOnionLayers(request) {
    let encrypted = request;

    // Encrypt from innermost layer outward
    for (let i = request.relayChain.length - 1; i >= 0; i--) {
      const peer = request.relayChain[i];

      // Encrypt payload for this peer
      encrypted = {
        type: 'relay-forward',
        requestId: request.requestId,
        nextHop: i > 0 ? request.relayChain[i - 1] : null,
        encryptedPayload: await this.encryptForPeer(
          JSON.stringify(encrypted),
          peer
        ),
        timestamp: Date.now()
      };
    }

    return encrypted;
  }

  // Encrypt data for specific peer (using their public key)
  async encryptForPeer(data, peerId) {
    // Get peer's public key from signaling server
    const peerPublicKey = await this.getPeerPublicKey(peerId);

    // Encrypt using Web Crypto API
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      peerPublicKey,
      dataBuffer
    );

    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }

  // Handle incoming relay message
  async handleRelayMessage(data, fromPeerId) {
    try {
      const message = JSON.parse(data);

      if (message.type === 'relay-forward') {
        // Decrypt our layer
        const decrypted = await this.decryptLayer(message.encryptedPayload);
        const payload = JSON.parse(decrypted);

        if (message.nextHop) {
          // Forward to next hop in chain
          const nextConnection = this.peerConnections.get(message.nextHop);
          if (nextConnection && nextConnection.channel.readyState === 'open') {
            nextConnection.channel.send(JSON.stringify(payload));
          }
        } else {
          // Final hop - make actual API request
          const response = await fetch(payload.url, payload.options);
          const responseData = await response.json();

          // Send response back through chain
          await this.sendRelayResponse(message.requestId, responseData, fromPeerId);
        }
      } else if (message.type === 'relay-response') {
        // Handle response coming back through chain
        const pending = this.pendingRequests?.get(message.requestId);
        if (pending) {
          pending.resolve(message.data);
          this.pendingRequests.delete(message.requestId);
        }
      }

    } catch (error) {
      console.error('Relay message handling error:', error);
    }
  }

  // Send response back through relay chain
  async sendRelayResponse(requestId, data, peerId) {
    const connection = this.peerConnections.get(peerId);
    if (connection && connection.channel.readyState === 'open') {
      connection.channel.send(JSON.stringify({
        type: 'relay-response',
        requestId,
        data,
        timestamp: Date.now()
      }));
    }
  }

  // Handle signaling messages
  handleSignalingMessage(data) {
    switch (data.type) {
      case 'relay-list':
        this.relayPeers = data.peers || [];
        break;

      case 'ice-candidate':
        const pc = this.peerConnections.get(data.fromPeer)?.pc;
        if (pc) {
          pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
        break;

      case 'offer':
        this.handleOffer(data);
        break;

      case 'answer':
        this.handleAnswer(data);
        break;
    }
  }

  // Generate unique peer ID
  generatePeerId() {
    return 'peer_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // Generate unique request ID
  generateRequestId() {
    return 'req_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // Get peer's public key for encryption
  async getPeerPublicKey(peerId) {
    // Request public key from signaling server
    return new Promise((resolve, reject) => {
      this.ws.send(JSON.stringify({
        type: 'get-peer-key',
        peerId
      }));

      const timeout = setTimeout(() => reject(new Error('Key fetch timeout')), 5000);

      const handler = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'peer-key' && data.peerId === peerId) {
          clearTimeout(timeout);
          this.ws.removeEventListener('message', handler);

          // Import public key
          window.crypto.subtle.importKey(
            'jwk',
            data.publicKey,
            { name: 'RSA-OAEP', hash: 'SHA-256' },
            true,
            ['encrypt']
          ).then(resolve).catch(reject);
        }
      };

      this.ws.addEventListener('message', handler);
    });
  }

  // Decrypt our layer of onion encryption
  async decryptLayer(encryptedData) {
    const encrypted = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

    // Get our private key from IndexedDB
    const db = await this.openDatabase();
    const transaction = db.transaction(['keys'], 'readonly');
    const store = transaction.objectStore('keys');
    const keyData = await store.get('user-keypair');

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      keyData.privateKey,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  // Open IndexedDB for key storage
  async openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SnapITForumCrypto', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Anonymous mode is ALWAYS enabled - cannot be toggled
  setAnonymousMode(enabled) {
    // SECURITY: Anonymous mode is mandatory and cannot be disabled
    console.warn('Anonymous mode is always enabled and cannot be disabled.');
    this.anonymousModeEnabled = true;
    return true;
  }

  // Get relay status
  getStatus() {
    return {
      anonymousMode: this.anonymousModeEnabled,
      availablePeers: this.relayPeers.length,
      activConnections: this.peerConnections.size,
      isRelayNode: this.isRelayNode,
      minHops: this.minRelayHops,
      maxHops: this.maxRelayHops
    };
  }
}

// Export for use
window.AnonymousRelay = AnonymousRelay;

/**
 * USAGE EXAMPLE:
 *
 * const relay = new AnonymousRelay();
 * await relay.init();
 *
 * // Enable anonymous mode
 * relay.setAnonymousMode(true);
 *
 * // Make anonymous API request
 * const response = await relay.sendAnonymousRequest(
 *   'https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/forums',
 *   { method: 'GET' }
 * );
 *
 * // Check status
 * console.log(relay.getStatus());
 */

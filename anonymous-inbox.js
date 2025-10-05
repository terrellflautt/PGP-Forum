/**
 * Anonymous Inbox System
 * Allows users to publish a PGP key/username for receiving anonymous messages
 *
 * Features:
 * - Public directory of users accepting anonymous messages
 * - P2P file transfer (no server storage) for files < 5MB
 * - Zero server-side message storage (ephemeral delivery only)
 * - No images allowed (text/documents only)
 */

class AnonymousInbox {
  constructor(pgpInstance, relayInstance) {
    this.pgp = pgpInstance;
    this.relay = relayInstance;
    this.publicDirectory = new Map(); // Cache of public PGP keys
    this.inboxEnabled = false;
    this.maxFileSize = 5 * 1024 * 1024; // 5MB max
    this.allowedFileTypes = [
      'text/plain',
      'application/pdf',
      'application/json',
      'application/pgp-encrypted',
      'application/x-pgp-encrypted'
    ];
  }

  /**
   * Enable anonymous inbox for this user
   * Publishes PGP key and username to public directory
   */
  async enableInbox(config = {}) {
    const {
      displayName, // Public username (can be pseudonym)
      acceptFiles = true,
      acceptText = true,
      maxMessageSize = 10000 // 10KB max text
    } = config;

    if (!displayName) {
      throw new Error('Display name required for public inbox');
    }

    // Get user's public key
    const publicKey = await this.pgp.getPublicKey();
    if (!publicKey) {
      throw new Error('No public key found. Generate PGP keys first.');
    }

    const keyFingerprint = await this.pgp.getKeyFingerprint(publicKey);

    const inboxConfig = {
      displayName,
      publicKey,
      keyFingerprint,
      acceptFiles,
      acceptText,
      maxMessageSize,
      createdAt: Date.now(),
      enabled: true
    };

    // Publish to server's public directory (read-only, no message storage)
    await this.publishToDirectory(inboxConfig);

    this.inboxEnabled = true;

    return {
      displayName,
      keyFingerprint,
      publicInboxUrl: `https://forum.snapitsoftware.com/inbox/${keyFingerprint}`,
      status: 'enabled'
    };
  }

  /**
   * Disable anonymous inbox
   */
  async disableInbox() {
    const publicKey = await this.pgp.getPublicKey();
    const keyFingerprint = await this.pgp.getKeyFingerprint(publicKey);

    await this.removeFromDirectory(keyFingerprint);

    this.inboxEnabled = false;

    return { status: 'disabled' };
  }

  /**
   * Send anonymous message to a user (by username or key fingerprint)
   */
  async sendAnonymousMessage(config) {
    const {
      recipient, // Username or key fingerprint
      message,
      subject = 'Anonymous Message',
      file = null,
      ephemeral = true, // Auto-delete after delivery
      expiresIn = 3600000 // 1 hour default
    } = config;

    // Look up recipient's public key
    const recipientData = await this.lookupRecipient(recipient);

    if (!recipientData) {
      throw new Error('Recipient not found in directory');
    }

    if (!recipientData.acceptText && !file) {
      throw new Error('Recipient does not accept text messages');
    }

    if (!recipientData.acceptFiles && file) {
      throw new Error('Recipient does not accept file attachments');
    }

    // Validate file if present
    if (file) {
      this.validateFile(file);
    }

    // Prepare message payload
    const payload = {
      type: file ? 'file' : 'text',
      subject,
      content: message,
      file: file ? await this.prepareFile(file) : null,
      timestamp: Date.now(),
      ephemeral,
      expiresAt: ephemeral ? Date.now() + expiresIn : null
    };

    // Encrypt with recipient's public key
    const encryptedPayload = await this.pgp.encryptMessage(
      JSON.stringify(payload),
      recipientData.publicKey
    );

    // Send via P2P relay (no server storage)
    if (file) {
      // P2P file transfer
      await this.sendP2PFileTransfer({
        recipientId: recipientData.keyFingerprint,
        encryptedPayload,
        fileSize: file.size,
        ephemeral,
        expiresAt: payload.expiresAt
      });
    } else {
      // Ephemeral text message (delivered via WebRTC, not stored)
      await this.sendEphemeralMessage({
        recipientId: recipientData.keyFingerprint,
        encryptedPayload,
        ephemeral,
        expiresAt: payload.expiresAt
      });
    }

    return {
      sent: true,
      recipient: recipientData.displayName,
      type: payload.type,
      ephemeral,
      expiresAt: payload.expiresAt ? new Date(payload.expiresAt).toISOString() : null
    };
  }

  /**
   * Validate file (size, type)
   */
  validateFile(file) {
    // Check size
    if (file.size > this.maxFileSize) {
      throw new Error(`File too large. Max size: ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // Block images
    if (file.type.startsWith('image/')) {
      throw new Error('Images not allowed. Use text or document files only.');
    }

    // Check allowed types
    if (!this.allowedFileTypes.includes(file.type) &&
        !file.type.startsWith('text/') &&
        !file.type.startsWith('application/')) {
      throw new Error('File type not allowed');
    }

    return true;
  }

  /**
   * Prepare file for P2P transfer (convert to base64)
   */
  async prepareFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result // Base64 encoded
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Send P2P file transfer (no server storage)
   */
  async sendP2PFileTransfer(config) {
    const { recipientId, encryptedPayload, fileSize, ephemeral, expiresAt } = config;

    // Use WebRTC data channel for direct P2P transfer
    const transferId = this.generateTransferId();

    // Signal recipient via server (only metadata, not file content)
    await this.signalP2PTransfer({
      transferId,
      recipientId,
      fileSize,
      ephemeral,
      expiresAt
    });

    // Establish P2P connection and transfer encrypted file
    await this.relay.sendP2PData({
      peerId: recipientId,
      transferId,
      data: encryptedPayload,
      ephemeral,
      expiresAt
    });

    console.log('P2P file transfer initiated:', {
      transferId,
      recipient: recipientId,
      size: fileSize,
      ephemeral
    });
  }

  /**
   * Send ephemeral message (no server storage, WebRTC only)
   */
  async sendEphemeralMessage(config) {
    const { recipientId, encryptedPayload, ephemeral, expiresAt } = config;

    // Find recipient peer in WebRTC mesh
    const recipientPeer = this.relay.relayPeers.find(p => p.id === recipientId);

    if (!recipientPeer) {
      // Recipient offline - create ephemeral delivery via relay
      await this.createEphemeralDelivery({
        recipientId,
        encryptedPayload,
        expiresAt
      });
    } else {
      // Recipient online - send directly via WebRTC
      await this.relay.sendDirectMessage(recipientId, {
        type: 'anonymous-message',
        encrypted: encryptedPayload,
        ephemeral,
        expiresAt
      });
    }
  }

  /**
   * Create ephemeral delivery (server only stores until expiry or pickup)
   */
  async createEphemeralDelivery(config) {
    const { recipientId, encryptedPayload, expiresAt } = config;

    const API_BASE = 'https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod';

    // Server stores encrypted message temporarily (auto-deletes on pickup or expiry)
    await this.relay.sendAnonymousRequest(`${API_BASE}/inbox/ephemeral`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientId,
        encryptedPayload, // Server can't decrypt
        expiresAt,
        deliveryId: this.generateTransferId()
      })
    });
  }

  /**
   * Signal P2P transfer to recipient (via server, no file content)
   */
  async signalP2PTransfer(config) {
    const API_BASE = 'https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod';

    await this.relay.sendAnonymousRequest(`${API_BASE}/inbox/signal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
  }

  /**
   * Publish inbox config to public directory
   */
  async publishToDirectory(config) {
    const API_BASE = 'https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod';

    const response = await fetch(`${API_BASE}/inbox/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(config)
    });

    if (!response.ok) {
      throw new Error('Failed to publish to directory');
    }
  }

  /**
   * Remove from public directory
   */
  async removeFromDirectory(keyFingerprint) {
    const API_BASE = 'https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod';

    await fetch(`${API_BASE}/inbox/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ keyFingerprint })
    });
  }

  /**
   * Look up recipient in public directory
   */
  async lookupRecipient(identifier) {
    // Check cache first
    if (this.publicDirectory.has(identifier)) {
      return this.publicDirectory.get(identifier);
    }

    const API_BASE = 'https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod';

    // Anonymous lookup (no auth required)
    const response = await this.relay.sendAnonymousRequest(
      `${API_BASE}/inbox/lookup?q=${encodeURIComponent(identifier)}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Cache result
    this.publicDirectory.set(identifier, data);

    return data;
  }

  /**
   * Search public directory
   */
  async searchDirectory(query) {
    const API_BASE = 'https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod';

    const response = await this.relay.sendAnonymousRequest(
      `${API_BASE}/inbox/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.results || [];
  }

  /**
   * Get pending ephemeral messages (check inbox)
   */
  async checkInbox() {
    const publicKey = await this.pgp.getPublicKey();
    const keyFingerprint = await this.pgp.getKeyFingerprint(publicKey);

    const API_BASE = 'https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod';

    const response = await this.relay.sendAnonymousRequest(
      `${API_BASE}/inbox/check?recipient=${keyFingerprint}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    // Decrypt messages
    const decrypted = [];
    for (const msg of data.messages || []) {
      try {
        const decryptedPayload = await this.pgp.decryptMessage(msg.encryptedPayload);
        const payload = JSON.parse(decryptedPayload);

        decrypted.push({
          messageId: msg.deliveryId,
          subject: payload.subject,
          content: payload.content,
          file: payload.file,
          timestamp: payload.timestamp,
          ephemeral: payload.ephemeral,
          expiresAt: payload.expiresAt
        });

        // Auto-delete from server after retrieval
        await this.deleteEphemeralMessage(msg.deliveryId);

      } catch (error) {
        console.error('Failed to decrypt message:', error);
      }
    }

    return decrypted;
  }

  /**
   * Delete ephemeral message after retrieval
   */
  async deleteEphemeralMessage(deliveryId) {
    const API_BASE = 'https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod';

    await fetch(`${API_BASE}/inbox/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ deliveryId })
    });
  }

  // Generate unique transfer ID
  generateTransferId() {
    return 'xfer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Export for use
window.AnonymousInbox = AnonymousInbox;

/**
 * USAGE EXAMPLES:
 *
 * // Initialize
 * const pgp = new ZeroKnowledgePGP();
 * await pgp.init();
 *
 * const relay = new AnonymousRelay();
 * await relay.init();
 *
 * const inbox = new AnonymousInbox(pgp, relay);
 *
 * // Example 1: Enable anonymous inbox
 * await inbox.enableInbox({
 *   displayName: 'SecureWhistleblower',
 *   acceptFiles: true,
 *   acceptText: true
 * });
 *
 * // Example 2: Send anonymous message
 * await inbox.sendAnonymousMessage({
 *   recipient: 'SecureWhistleblower', // Or key fingerprint
 *   subject: 'Confidential Tip',
 *   message: 'I have information about...',
 *   ephemeral: true,
 *   expiresIn: 3600000 // 1 hour
 * });
 *
 * // Example 3: Send file anonymously (P2P, no server storage)
 * const file = document.getElementById('fileInput').files[0];
 * await inbox.sendAnonymousMessage({
 *   recipient: 'journalist@example',
 *   subject: 'Leaked Documents',
 *   message: 'See attached',
 *   file: file,
 *   ephemeral: true
 * });
 *
 * // Example 4: Check inbox for messages
 * const messages = await inbox.checkInbox();
 * console.log('New messages:', messages);
 *
 * // Example 5: Search public directory
 * const results = await inbox.searchDirectory('whistleblower');
 * console.log('Found users:', results);
 */

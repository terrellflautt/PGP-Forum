/**
 * Dead Man's Switch System
 * Automatically release encrypted messages/files if user fails to check in
 *
 * Use Cases:
 * - Whistleblower protection (release documents if compromised)
 * - Digital inheritance (share passwords/assets with family after death)
 * - Backup key recovery (release recovery key if primary access lost)
 * - Investigative journalism (auto-publish if journalist goes missing)
 */

class DeadManSwitch {
  constructor(pgpInstance) {
    this.pgp = pgpInstance; // ZeroKnowledgePGP instance
    this.db = null;
  }

  // Initialize IndexedDB for dead man switches
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SnapITDeadManSwitch', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('switches')) {
          const store = db.createObjectStore('switches', { keyPath: 'id' });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('nextCheckIn', 'nextCheckIn', { unique: false });
        }
      };
    });
  }

  /**
   * Create a dead man's switch
   * @param {Object} config
   * @param {string} config.name - User-friendly name (e.g., "Whistleblower Documents")
   * @param {number} config.checkInInterval - Hours between check-ins (24, 48, 72, 168)
   * @param {Array} config.recipients - Array of recipient email/userId
   * @param {string} config.encryptedPayload - The encrypted data to release
   * @param {string} config.publicMessage - Unencrypted message explaining the release
   */
  async createSwitch(config) {
    const {
      name,
      checkInInterval = 72, // Default: 3 days
      recipients,
      encryptedPayload,
      publicMessage,
      autoRenew = false
    } = config;

    // Validate inputs
    if (!name || !recipients || recipients.length === 0) {
      throw new Error('Name and at least one recipient required');
    }

    if (!encryptedPayload) {
      throw new Error('Encrypted payload required');
    }

    const switchId = this.generateSwitchId();
    const now = Date.now();

    const deadManSwitch = {
      id: switchId,
      name,
      status: 'active',
      checkInInterval: checkInInterval * 60 * 60 * 1000, // Convert hours to ms
      nextCheckIn: now + (checkInInterval * 60 * 60 * 1000),
      recipients: recipients.map(r => ({
        userId: r.userId || null,
        email: r.email || null,
        publicKey: r.publicKey // Encrypt payload for each recipient
      })),
      encryptedPayload, // The encrypted data to release
      publicMessage, // Unencrypted explanation
      autoRenew, // Auto-renew after each check-in
      createdAt: now,
      lastCheckIn: now,
      checkInCount: 0,
      missedCheckIns: 0,
      triggered: false,
      releasedAt: null
    };

    // Store switch locally
    await this.storeSwitch(deadManSwitch);

    // Register switch with server (for check-in monitoring)
    await this.registerServerMonitoring(deadManSwitch);

    return {
      switchId,
      name,
      nextCheckIn: new Date(deadManSwitch.nextCheckIn).toISOString(),
      recipients: recipients.length,
      status: 'active'
    };
  }

  // Check in to reset the timer
  async checkIn(switchId) {
    const transaction = this.db.transaction(['switches'], 'readwrite');
    const store = transaction.objectStore('switches');
    const switchData = await store.get(switchId);

    if (!switchData) {
      throw new Error('Switch not found');
    }

    if (switchData.status !== 'active') {
      throw new Error('Switch is not active');
    }

    const now = Date.now();

    // Update check-in data
    switchData.lastCheckIn = now;
    switchData.nextCheckIn = now + switchData.checkInInterval;
    switchData.checkInCount++;
    switchData.missedCheckIns = 0;

    await store.put(switchData);

    // Notify server of check-in
    await this.sendCheckInToServer(switchId);

    return {
      switchId,
      nextCheckIn: new Date(switchData.nextCheckIn).toISOString(),
      checkInCount: switchData.checkInCount
    };
  }

  // Cancel a dead man's switch (before it triggers)
  async cancelSwitch(switchId) {
    const transaction = this.db.transaction(['switches'], 'readwrite');
    const store = transaction.objectStore('switches');
    const switchData = await store.get(switchId);

    if (!switchData) {
      throw new Error('Switch not found');
    }

    // Mark as cancelled
    switchData.status = 'cancelled';
    switchData.cancelledAt = Date.now();

    await store.put(switchData);

    // Notify server to stop monitoring
    await this.cancelServerMonitoring(switchId);

    return { switchId, status: 'cancelled' };
  }

  // Manually trigger switch (emergency release)
  async triggerNow(switchId) {
    const transaction = this.db.transaction(['switches'], 'readwrite');
    const store = transaction.objectStore('switches');
    const switchData = await store.get(switchId);

    if (!switchData) {
      throw new Error('Switch not found');
    }

    // Trigger release
    await this.releasePayload(switchData);

    switchData.status = 'triggered';
    switchData.triggered = true;
    switchData.releasedAt = Date.now();

    await store.put(switchData);

    return { switchId, status: 'released', releasedAt: switchData.releasedAt };
  }

  // Check for overdue switches (called periodically)
  async checkOverdueSwitches() {
    const transaction = this.db.transaction(['switches'], 'readwrite');
    const store = transaction.objectStore('switches');
    const index = store.index('status');
    const activeSwitches = await index.getAll('active');

    const now = Date.now();
    const triggered = [];

    for (const switchData of activeSwitches) {
      if (now > switchData.nextCheckIn) {
        // Missed check-in
        switchData.missedCheckIns++;

        // Grace period: 2 missed check-ins before triggering
        if (switchData.missedCheckIns >= 2) {
          // TRIGGER SWITCH
          await this.releasePayload(switchData);

          switchData.status = 'triggered';
          switchData.triggered = true;
          switchData.releasedAt = now;

          triggered.push({
            switchId: switchData.id,
            name: switchData.name,
            recipients: switchData.recipients.length
          });
        }

        await store.put(switchData);
      }
    }

    return triggered;
  }

  // Release encrypted payload to recipients
  async releasePayload(switchData) {
    // Send encrypted payload to each recipient
    for (const recipient of switchData.recipients) {
      try {
        // Encrypt payload for recipient using their public key
        const encryptedForRecipient = await this.pgp.encryptMessage(
          switchData.encryptedPayload,
          recipient.publicKey
        );

        // Send via server (as encrypted PM)
        await this.sendReleaseMessage({
          toUserId: recipient.userId,
          toEmail: recipient.email,
          subject: `Dead Man's Switch Triggered: ${switchData.name}`,
          encryptedContent: encryptedForRecipient,
          publicMessage: switchData.publicMessage,
          switchId: switchData.id,
          triggeredAt: switchData.releasedAt || Date.now()
        });

      } catch (error) {
        console.error('Failed to release to recipient:', recipient, error);
      }
    }
  }

  // Send release message to recipient
  async sendReleaseMessage(data) {
    const API_BASE = 'https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod';

    // Use anonymous relay if available
    const relay = window.anonymousRelay;
    const fetchFn = relay ? relay.sendAnonymousRequest.bind(relay) : fetch;

    const response = await fetchFn(`${API_BASE}/deadman/release`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to send release message');
    }

    return await response.json();
  }

  // Register switch with server for monitoring
  async registerServerMonitoring(switchData) {
    const API_BASE = 'https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod';

    const response = await fetch(`${API_BASE}/deadman/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        switchId: switchData.id,
        checkInInterval: switchData.checkInInterval,
        nextCheckIn: switchData.nextCheckIn,
        recipients: switchData.recipients.map(r => ({
          userId: r.userId,
          email: r.email
        }))
      })
    });

    if (!response.ok) {
      throw new Error('Failed to register switch monitoring');
    }
  }

  // Send check-in to server
  async sendCheckInToServer(switchId) {
    const API_BASE = 'https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod';

    await fetch(`${API_BASE}/deadman/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ switchId })
    });
  }

  // Cancel server monitoring
  async cancelServerMonitoring(switchId) {
    const API_BASE = 'https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod';

    await fetch(`${API_BASE}/deadman/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ switchId })
    });
  }

  // Store switch in IndexedDB
  async storeSwitch(switchData) {
    const transaction = this.db.transaction(['switches'], 'readwrite');
    const store = transaction.objectStore('switches');
    await store.put(switchData);
  }

  // Get all user's switches
  async getAllSwitches() {
    const transaction = this.db.transaction(['switches'], 'readonly');
    const store = transaction.objectStore('switches');
    const switches = await store.getAll();

    return switches.map(s => ({
      id: s.id,
      name: s.name,
      status: s.status,
      nextCheckIn: new Date(s.nextCheckIn).toISOString(),
      recipients: s.recipients.length,
      checkInCount: s.checkInCount,
      missedCheckIns: s.missedCheckIns,
      createdAt: new Date(s.createdAt).toISOString()
    }));
  }

  // Get switch details
  async getSwitch(switchId) {
    const transaction = this.db.transaction(['switches'], 'readonly');
    const store = transaction.objectStore('switches');
    return await store.get(switchId);
  }

  // Generate unique switch ID
  generateSwitchId() {
    return 'dms_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Helper: Create switch with file attachment
  async createSwitchWithFile(config) {
    const { file, ...switchConfig } = config;

    // Read file
    const fileData = await this.readFile(file);

    // Encrypt file with user's own public key (they decrypt and re-encrypt for recipients)
    const encryptedFile = await this.pgp.encryptMessage(
      fileData,
      await this.pgp.getPublicKey()
    );

    // Create switch with encrypted file as payload
    return await this.createSwitch({
      ...switchConfig,
      encryptedPayload: JSON.stringify({
        type: 'file',
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        encrypted: encryptedFile
      })
    });
  }

  // Helper: Read file as base64
  async readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// Export for use
window.DeadManSwitch = DeadManSwitch;

/**
 * USAGE EXAMPLES:
 *
 * // Initialize
 * const pgp = new ZeroKnowledgePGP();
 * await pgp.init();
 *
 * const dms = new DeadManSwitch(pgp);
 * await dms.init();
 *
 * // Example 1: Whistleblower protection
 * await dms.createSwitch({
 *   name: 'Confidential Documents',
 *   checkInInterval: 48, // Check in every 48 hours
 *   recipients: [
 *     { email: 'journalist@nytimes.com', publicKey: journalistKey }
 *   ],
 *   encryptedPayload: encryptedDocs,
 *   publicMessage: 'If you receive this, I have been compromised. Please publish.'
 * });
 *
 * // Example 2: Digital inheritance
 * await dms.createSwitch({
 *   name: 'Bitcoin Wallet Recovery',
 *   checkInInterval: 168, // Check in weekly
 *   recipients: [
 *     { email: 'spouse@example.com', publicKey: spouseKey },
 *     { email: 'lawyer@firm.com', publicKey: lawyerKey }
 *   ],
 *   encryptedPayload: JSON.stringify({ seed: '12 word seed phrase...' }),
 *   publicMessage: 'This contains my cryptocurrency recovery information.'
 * });
 *
 * // Example 3: Check in (reset timer)
 * await dms.checkIn('dms_12345_abc');
 *
 * // Example 4: Emergency release
 * await dms.triggerNow('dms_12345_abc');
 *
 * // Example 5: View all switches
 * const switches = await dms.getAllSwitches();
 * console.log(switches);
 */

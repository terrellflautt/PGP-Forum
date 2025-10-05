/**
 * PGP Encryption Library for SnapIT Forum
 * Client-side PGP encryption using OpenPGP.js
 *
 * Include in HTML:
 * <script src="https://unpkg.com/openpgp@5.11.0/dist/openpgp.min.js"></script>
 */

class ForumPGP {
  constructor() {
    this.privateKey = null;
    this.publicKey = null;
  }

  // Generate new PGP key pair
  async generateKeyPair(name, email, passphrase) {
    try {
      const { privateKey, publicKey } = await openpgp.generateKey({
        type: 'rsa',
        rsaBits: 4096,
        userIDs: [{ name, email }],
        passphrase
      });

      this.privateKey = await openpgp.readPrivateKey({ armoredKey: privateKey });
      this.publicKey = await openpgp.readKey({ armoredKey: publicKey });

      // Store encrypted private key in localStorage
      localStorage.setItem('forum_pgp_private', privateKey);
      localStorage.setItem('forum_pgp_public', publicKey);

      return {
        privateKey,
        publicKey
      };
    } catch (error) {
      console.error('Key generation error:', error);
      throw error;
    }
  }

  // Load keys from localStorage
  async loadKeys(passphrase) {
    try {
      const privateKeyArmored = localStorage.getItem('forum_pgp_private');
      const publicKeyArmored = localStorage.getItem('forum_pgp_public');

      if (!privateKeyArmored || !publicKeyArmored) {
        return false;
      }

      this.privateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyArmored }),
        passphrase
      });

      this.publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });

      return true;
    } catch (error) {
      console.error('Key loading error:', error);
      return false;
    }
  }

  // Encrypt message for recipient
  async encryptMessage(message, recipientPublicKeyArmored) {
    try {
      const recipientPublicKey = await openpgp.readKey({ armoredKey: recipientPublicKeyArmored });

      const encrypted = await openpgp.encrypt({
        message: await openpgp.createMessage({ text: message }),
        encryptionKeys: recipientPublicKey,
        signingKeys: this.privateKey
      });

      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw error;
    }
  }

  // Decrypt message
  async decryptMessage(encryptedMessage, senderPublicKeyArmored) {
    try {
      const senderPublicKey = await openpgp.readKey({ armoredKey: senderPublicKeyArmored });

      const message = await openpgp.readMessage({
        armoredMessage: encryptedMessage
      });

      const { data: decrypted, signatures } = await openpgp.decrypt({
        message,
        decryptionKeys: this.privateKey,
        verificationKeys: senderPublicKey
      });

      // Verify signature
      try {
        await signatures[0].verified;
        console.log('Signature verified');
      } catch (e) {
        console.warn('Signature verification failed:', e);
      }

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw error;
    }
  }

  // Export public key (to share with others)
  getPublicKey() {
    return this.publicKey ? this.publicKey.armor() : null;
  }

  // Check if keys exist
  hasKeys() {
    return localStorage.getItem('forum_pgp_private') !== null;
  }

  // Clear keys (logout)
  clearKeys() {
    localStorage.removeItem('forum_pgp_private');
    localStorage.removeItem('forum_pgp_public');
    this.privateKey = null;
    this.publicKey = null;
  }
}

// Export for use in forum
window.ForumPGP = ForumPGP;

/**
 * PGP Encryption Library for SnapIT Forum
 * Client-side PGP encryption using OpenPGP.js
 *
 * Install: npm install openpgp
 */

import * as openpgp from 'openpgp';

export interface KeyPair {
  privateKey: string;
  publicKey: string;
}

export interface EncryptedMessage {
  ciphertext: string;
  timestamp: number;
  senderPublicKeyFingerprint?: string;
}

export class ForumPGP {
  private privateKey: openpgp.PrivateKey | null = null;
  private publicKey: openpgp.PublicKey | null = null;

  /**
   * Generate new PGP key pair
   * CRITICAL: Store passphrase securely - cannot be recovered!
   */
  async generateKeyPair(name: string, email: string, passphrase: string): Promise<KeyPair> {
    try {
      const { privateKey, publicKey } = await openpgp.generateKey({
        type: 'rsa',
        rsaBits: 4096,
        userIDs: [{ name, email }],
        passphrase,
      });

      this.privateKey = await openpgp.readPrivateKey({ armoredKey: privateKey });
      this.publicKey = await openpgp.readKey({ armoredKey: publicKey });

      // Store encrypted private key in localStorage
      localStorage.setItem('forum_pgp_private', privateKey);
      localStorage.setItem('forum_pgp_public', publicKey);

      return {
        privateKey,
        publicKey,
      };
    } catch (error) {
      console.error('Key generation error:', error);
      throw new Error('Failed to generate PGP key pair');
    }
  }

  /**
   * Load keys from localStorage
   */
  async loadKeys(passphrase: string): Promise<boolean> {
    try {
      const privateKeyArmored = localStorage.getItem('forum_pgp_private');
      const publicKeyArmored = localStorage.getItem('forum_pgp_public');

      if (!privateKeyArmored || !publicKeyArmored) {
        return false;
      }

      this.privateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyArmored }),
        passphrase,
      });

      this.publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });

      return true;
    } catch (error) {
      console.error('Key loading error:', error);
      return false;
    }
  }

  /**
   * Encrypt message for recipient
   */
  async encryptMessage(message: string, recipientPublicKeyArmored: string): Promise<string> {
    try {
      const recipientPublicKey = await openpgp.readKey({ armoredKey: recipientPublicKeyArmored });

      const encrypted = await openpgp.encrypt({
        message: await openpgp.createMessage({ text: message }),
        encryptionKeys: recipientPublicKey,
        signingKeys: this.privateKey || undefined,
      });

      return encrypted as string;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt message');
    }
  }

  /**
   * Decrypt received message
   */
  async decryptMessage(encryptedMessage: string, senderPublicKeyArmored?: string): Promise<string> {
    try {
      if (!this.privateKey) {
        throw new Error('Private key not loaded');
      }

      const message = await openpgp.readMessage({
        armoredMessage: encryptedMessage,
      });

      const verificationKeys = senderPublicKeyArmored
        ? [await openpgp.readKey({ armoredKey: senderPublicKeyArmored })]
        : undefined;

      const { data: decrypted } = await openpgp.decrypt({
        message,
        decryptionKeys: this.privateKey,
        verificationKeys,
      });

      return decrypted as string;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt message');
    }
  }

  /**
   * Get public key armored format
   */
  getPublicKey(): string | null {
    if (!this.publicKey) {
      return localStorage.getItem('forum_pgp_public');
    }
    return this.publicKey.armor();
  }

  /**
   * Check if keys exist
   */
  hasKeys(): boolean {
    return !!(localStorage.getItem('forum_pgp_private') && localStorage.getItem('forum_pgp_public'));
  }

  /**
   * Clear all keys (logout)
   */
  clearKeys(): void {
    localStorage.removeItem('forum_pgp_private');
    localStorage.removeItem('forum_pgp_public');
    this.privateKey = null;
    this.publicKey = null;
  }

  /**
   * Export public key fingerprint for verification
   */
  async getPublicKeyFingerprint(): Promise<string | null> {
    if (!this.publicKey) {
      return null;
    }
    return this.publicKey.getFingerprint();
  }
}

// Singleton instance
export const pgp = new ForumPGP();

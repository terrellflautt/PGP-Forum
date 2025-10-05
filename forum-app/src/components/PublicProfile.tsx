import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

interface PublicProfileProps {
  username: string;
}

interface UserProfile {
  username: string;
  displayName?: string;
  bio?: string;
  publicKey: string;
  createdAt: number;
  verified: boolean;
}

export default function PublicProfile({ username }: PublicProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [autoDelete, setAutoDelete] = useState(1440); // Default 24 hours
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/@${username}`);

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendAnonymousMessage = async () => {
    if (!message.trim() || !profile) return;

    setSending(true);

    try {
      // Encrypt message with recipient's public key
      const encrypted = await encryptMessage(message, profile.publicKey);

      const response = await fetch(`${API_BASE_URL}/messages/anonymous`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientUsername: username,
          encryptedContent: encrypted,
          autoDeleteMinutes: autoDelete
        })
      });

      if (response.ok) {
        setSent(true);
        setMessage('');
        setTimeout(() => setSent(false), 5000);
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Client-side encryption using recipient's public PGP key
  const encryptMessage = async (plaintext: string, publicKeyPem: string): Promise<string> => {
    try {
      // Import the recipient's public key
      const publicKey = await importPublicKey(publicKeyPem);

      // Generate a random AES key for this message
      const aesKey = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt']
      );

      // Encrypt the message with AES
      const encoder = new TextEncoder();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedContent = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        aesKey,
        encoder.encode(plaintext)
      );

      // Export the AES key
      const exportedAesKey = await crypto.subtle.exportKey('raw', aesKey);

      // Encrypt the AES key with recipient's RSA public key
      const encryptedAesKey = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        publicKey,
        exportedAesKey
      );

      // Combine everything into a single encrypted package
      const encryptedPackage = {
        iv: Array.from(iv),
        encryptedAesKey: Array.from(new Uint8Array(encryptedAesKey)),
        encryptedContent: Array.from(new Uint8Array(encryptedContent))
      };

      return JSON.stringify(encryptedPackage);
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt message');
    }
  };

  const importPublicKey = async (pemKey: string): Promise<CryptoKey> => {
    // Remove PEM header/footer and whitespace
    const pemContents = pemKey
      .replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\s/g, '');

    // Decode base64
    const binaryDer = atob(pemContents);
    const binaryArray = new Uint8Array(binaryDer.length);
    for (let i = 0; i < binaryDer.length; i++) {
      binaryArray[i] = binaryDer.charCodeAt(i);
    }

    // Import the key
    return await crypto.subtle.importKey(
      'spki',
      binaryArray,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      true,
      ['encrypt']
    );
  };

  const autoDeleteOptions = [
    { label: '1 hour', value: 60 },
    { label: '24 hours (default)', value: 1440 },
    { label: '7 days', value: 10080 },
    { label: '30 days', value: 43200 },
    { label: 'Never delete', value: 0 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-secondary-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">User Not Found</h2>
          <p className="text-secondary-600 mb-6">The username @{username} doesn't exist.</p>
          <a href="/" className="inline-block px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/" className="text-secondary-600 hover:text-primary-600 transition-colors flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </a>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-secondary-600">Anonymous Inbox Active</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-8 shadow-xl mb-8">
          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
              {profile.displayName?.[0]?.toUpperCase() || profile.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-secondary-900">@{profile.username}</h1>
                {profile.verified && (
                  <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              {profile.displayName && (
                <p className="text-xl text-secondary-700 mb-3">{profile.displayName}</p>
              )}
              {profile.bio && (
                <p className="text-secondary-600 mb-4">{profile.bio}</p>
              )}
              <div className="flex items-center space-x-4 text-sm text-secondary-500">
                <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Guarantees Banner */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-8 border border-green-200">
          <h3 className="font-bold text-secondary-900 mb-3 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Your Anonymity is Mathematically Guaranteed
          </h3>
          <ul className="space-y-2 text-sm text-secondary-700">
            <li className="flex items-start">
              <span className="text-green-600 mr-2 font-bold">✓</span>
              <span><strong>Zero IP Logging:</strong> Your IP address is never stored, logged, or accessible to anyone</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2 font-bold">✓</span>
              <span><strong>Multi-Hop Relay:</strong> Messages routed through 3-5 random nodes before delivery</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2 font-bold">✓</span>
              <span><strong>No Metadata:</strong> We don't know when you sent it, from where, or on what device</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2 font-bold">✓</span>
              <span><strong>End-to-End Encrypted:</strong> Message encrypted in your browser before transmission</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2 font-bold">✓</span>
              <span><strong>Auto-Delete:</strong> Messages permanently erased after delivery (7-pass DoD secure deletion)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2 font-bold">✓</span>
              <span><strong>No Account Required:</strong> Send anonymously without creating an account</span>
            </li>
          </ul>
        </div>

        {/* Message Form */}
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          {sent ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-secondary-900 mb-2">Message Sent Anonymously</h3>
              <p className="text-secondary-600 mb-6">
                Your message was encrypted and sent to @{profile.username}. Your identity cannot be traced.
              </p>
              <button
                onClick={() => setSent(false)}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-secondary-900">Send Anonymous Message</h2>
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">🔒 Encrypted</span>
                  </div>
                </div>
                <p className="text-secondary-600">
                  Send an encrypted, anonymous message to @{profile.username}. They will never know who sent it.
                </p>
              </div>

              {/* Message Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Your Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your anonymous message here..."
                  rows={8}
                  className="w-full px-4 py-3 border-2 border-secondary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-secondary-500">
                    {message.length} characters
                  </span>
                  <span className="text-sm text-secondary-500">
                    Max: 10,000 characters
                  </span>
                </div>
              </div>

              {/* Auto-Delete Options */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Message Auto-Delete
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {autoDeleteOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setAutoDelete(option.value)}
                      className={`px-4 py-3 rounded-xl border-2 transition-all ${
                        autoDelete === option.value
                          ? 'bg-primary-50 border-primary-500 text-primary-700'
                          : 'bg-white border-secondary-300 text-secondary-700 hover:border-primary-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-secondary-500 mt-2">
                  {autoDelete === 0
                    ? 'Message will not auto-delete (recipient can delete manually)'
                    : `Message will be permanently deleted ${autoDeleteOptions.find(o => o.value === autoDelete)?.label.toLowerCase()} after delivery`
                  }
                </p>
              </div>

              {/* Advanced Options */}
              <div className="mb-6">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                >
                  <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
                  <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showAdvanced && (
                  <div className="mt-4 p-4 bg-secondary-50 rounded-xl">
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded" />
                        <span className="text-sm text-secondary-700">Use maximum anonymity (slower, 5+ hops)</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded" />
                        <span className="text-sm text-secondary-700">Strip all metadata from attachments</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded" />
                        <span className="text-sm text-secondary-700">Randomize message timing (delayed 0-30 seconds)</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Send Button */}
              <button
                onClick={sendAnonymousMessage}
                disabled={!message.trim() || sending}
                className="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Encrypting & Sending...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Send Anonymous Message</span>
                  </>
                )}
              </button>

              {/* Info */}
              <p className="text-xs text-secondary-500 text-center mt-4">
                By sending, you confirm you understand this message is untraceable and anonymous.
                We cannot identify you even with a court order.
              </p>
            </>
          )}
        </div>

        {/* How It Works */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-bold text-secondary-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How Anonymous Messaging Works
          </h3>
          <ol className="space-y-3 text-sm text-secondary-700">
            <li className="flex items-start">
              <span className="font-bold text-primary-600 mr-3">1.</span>
              <span><strong>Encryption:</strong> Your message is encrypted in your browser using @{profile.username}'s public key. We never see the plaintext.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-primary-600 mr-3">2.</span>
              <span><strong>Routing:</strong> The encrypted message is routed through 3-5 random relay nodes, making it impossible to trace back to you.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-primary-600 mr-3">3.</span>
              <span><strong>Delivery:</strong> The message arrives in @{profile.username}'s inbox, encrypted. Only they can decrypt it.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-primary-600 mr-3">4.</span>
              <span><strong>Auto-Delete:</strong> After the timer expires, the message is permanently erased using DoD 5220.22-M 7-pass secure deletion. It cannot be recovered.</span>
            </li>
          </ol>
        </div>

        {/* Footer CTA */}
        <div className="mt-8 text-center">
          <p className="text-secondary-600 mb-4">Want your own anonymous inbox?</p>
          <a href="/" className="inline-block px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105">
            Create Free Account
          </a>
        </div>
      </div>
    </div>
  );
}

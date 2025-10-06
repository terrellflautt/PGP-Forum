import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

interface UsernameSetupProps {
  onComplete: (username: string) => void;
  userEmail?: string;
  userName?: string;
}

export default function UsernameSetup({ onComplete, userEmail, userName }: UsernameSetupProps) {
  const [username, setUsername] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [suggestedUsername, setSuggestedUsername] = useState('');
  const [showingProgress, setShowingProgress] = useState(true);

  // Generate smart username suggestion from Google name
  useEffect(() => {
    if (userName) {
      const suggested = userName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 20);
      setSuggestedUsername(suggested);
      // Auto-fill with suggestion
      setUsername(suggested);
      // Auto-check availability
      checkAvailability(suggested);
    }

    // Hide progress indicator after 2 seconds
    setTimeout(() => setShowingProgress(false), 2000);
  }, [userName]);

  const generateRandomUsername = () => {
    const adjectives = ['secure', 'anonymous', 'private', 'encrypted', 'hidden', 'shadow', 'ghost', 'silent', 'stealth', 'cipher'];
    const nouns = ['whistleblower', 'journalist', 'reporter', 'source', 'insider', 'witness', 'informant', 'analyst', 'investigator', 'truth'];

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 999);

    return `${adj}-${noun}-${num}`;
  };

  const handleRandomize = () => {
    const random = generateRandomUsername();
    setUsername(random);
    checkAvailability(random);
  };

  const checkAvailability = async (usernameToCheck: string, retries = 3): Promise<void> => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setAvailable(null);
      setError('Username must be at least 3 characters');
      return;
    }

    // Validate format
    const usernameRegex = /^[a-z0-9-]+$/;
    if (!usernameRegex.test(usernameToCheck)) {
      setAvailable(false);
      setError('Username can only contain lowercase letters, numbers, and hyphens');
      return;
    }

    setChecking(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/users/check-username?username=${encodeURIComponent(usernameToCheck)}`);

      // Handle cold start or temporary errors with retry
      if (response.status === 503 || response.status === 502) {
        if (retries > 0) {
          // Wait 1 second and retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          return checkAvailability(usernameToCheck, retries - 1);
        } else {
          setError('Service temporarily unavailable. Please try again in a moment.');
          setChecking(false);
          return;
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setAvailable(data.available);

      if (!data.available) {
        setError('This username is already taken');
      }
    } catch (err) {
      console.error('Username check error:', err);
      setError('Unable to check availability. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (!available || !username) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/me/username`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
      });

      if (response.ok) {
        onComplete(username);
      } else if (response.status === 401 || response.status === 403) {
        // Token is invalid/expired - clear it and force re-login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError('Your session has expired. Please refresh the page and sign in again.');
      } else {
        setError('Failed to set username. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  // Quick suggestion button
  const handleUseSuggestion = () => {
    if (suggestedUsername) {
      setUsername(suggestedUsername);
      checkAvailability(suggestedUsername);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl animate-slide-up">
        {/* Progress Indicator */}
        {showingProgress && (
          <div className="mb-6 bg-primary-50 border border-primary-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-primary-900">Step 2 of 2: Choose username</p>
                <div className="w-full bg-primary-200 rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 transform hover:rotate-12 transition-transform duration-300">
            <span className="text-white text-4xl">@</span>
          </div>
          <h2 className="text-3xl font-bold text-secondary-900 mb-2">Choose Your Username</h2>
          <p className="text-secondary-600">
            Almost done! This will be your public identifier for receiving anonymous messages
          </p>
        </div>

        {/* Smart Suggestion Banner */}
        {suggestedUsername && username === suggestedUsername && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-green-900">We pre-filled a suggestion for you</p>
                  <p className="text-xs text-green-700">Based on your name: {userName}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Username input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Username
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-secondary-400">@</span>
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                  setUsername(val);
                  if (val.length >= 3) {
                    checkAvailability(val);
                  } else {
                    setAvailable(null);
                    setError(val.length > 0 ? 'Username must be at least 3 characters' : '');
                  }
                }}
                placeholder="whistleblower-reporter"
                className="w-full pl-8 pr-12 py-3 border-2 border-secondary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                {checking ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                ) : available === true ? (
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : available === false ? (
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : null}
              </div>
            </div>
            <button
              onClick={handleRandomize}
              className="px-4 py-3 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Preview */}
        {username && available && (
          <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-6 mb-6 border border-primary-200">
            <p className="text-sm text-secondary-600 mb-2">Your public profile will be:</p>
            <code className="text-lg text-primary-700 font-mono">
              forum.snapitsoftware.com/@{username}
            </code>
            <p className="text-sm text-secondary-600 mt-4">
              Anyone can send you encrypted, anonymous messages at this URL.
            </p>
          </div>
        )}

        {/* Features explanation */}
        <div className="bg-secondary-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-secondary-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            What you get:
          </h3>
          <ul className="space-y-2 text-sm text-secondary-700">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span><strong>Anonymous Inbox:</strong> Receive encrypted messages from anyone</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span><strong>Source Protection:</strong> Senders stay completely anonymous</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span><strong>PGP Encrypted:</strong> Only you can decrypt messages</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span><strong>IP Anonymized:</strong> All messages routed through P2P relay</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleSubmit}
            disabled={!available || !username}
            className="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold text-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
          >
            {available && username ? (
              <>
                <span>Continue to Your Forum</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            ) : (
              <span>Enter a valid username to continue</span>
            )}
          </button>

          {/* Character counter */}
          {username && (
            <p className="text-xs text-center text-secondary-500">
              {username.length} characters {username.length < 3 && '(minimum 3 required)'}
            </p>
          )}
        </div>

        {/* Estimated time remaining */}
        <div className="mt-6 text-center">
          <p className="text-sm text-secondary-500">
            <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Less than 30 seconds remaining
          </p>
        </div>
      </div>
    </div>
  );
}

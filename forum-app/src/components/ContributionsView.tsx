import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

interface User {
  userId: string;
  email: string;
  username: string;
  name: string;
  picture?: string;
}

interface ContributionsViewProps {
  user: User | null;
  onLogout: () => void;
}

export default function ContributionsView({ user }: ContributionsViewProps) {
  const [donationType, setDonationType] = useState<'one-time' | 'recurring'>('one-time');
  const [amount, setAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const predefinedAmounts = [5, 10, 25, 50, 100];

  const handleDonation = async () => {
    if (!user) {
      alert('Please sign in to make a donation');
      return;
    }

    setIsProcessing(true);

    try {
      const finalAmount = customAmount ? parseFloat(customAmount) : amount;

      if (finalAmount < 1) {
        alert('Minimum donation amount is $1');
        setIsProcessing(false);
        return;
      }

      // Create Stripe checkout session for donation
      const response = await fetch(`${API_BASE_URL}/create-donation-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount: Math.round(finalAmount * 100), // Convert to cents
          type: donationType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create donation session');
      }

      const { sessionUrl } = await response.json();
      window.location.href = sessionUrl;
    } catch (error) {
      console.error('Donation error:', error);
      alert('Failed to process donation. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 pt-16 pl-64">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-secondary-900 mb-4">
            Support Our Mission
          </h1>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            Help us build a better, more private internet. Your contributions support the development of open-source privacy tools for whistleblowers, journalists, and freedom-loving people everywhere.
          </p>
        </div>

        {/* Donation Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-secondary-900 mb-6 text-center">
            Make a Donation
          </h2>

          {/* Donation Type Selector */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setDonationType('one-time')}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
                donationType === 'one-time'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              One-Time
            </button>
            <button
              onClick={() => setDonationType('recurring')}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
                donationType === 'recurring'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              Monthly
            </button>
          </div>

          {/* Amount Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-secondary-700 mb-3">
              Select Amount
            </label>
            <div className="grid grid-cols-5 gap-3 mb-4">
              {predefinedAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    setAmount(amt);
                    setCustomAmount('');
                  }}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    amount === amt && !customAmount
                      ? 'bg-primary-500 text-white'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Or enter custom amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-500 text-lg">
                  $
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full pl-8 pr-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Donation Button */}
          <button
            onClick={handleDonation}
            disabled={isProcessing || !user}
            className="w-full py-4 px-8 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-primary-500/50 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isProcessing ? (
              'Processing...'
            ) : (
              <>
                Donate ${customAmount || amount} {donationType === 'recurring' && '/month'}
              </>
            )}
          </button>

          {!user && (
            <p className="text-center text-sm text-secondary-600 mt-4">
              Please sign in to make a donation
            </p>
          )}
        </div>

        {/* Impact Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold text-secondary-900 mb-2">
              Privacy Tools
            </h3>
            <p className="text-secondary-600">
              Fund development of PGP encryption, anonymous messaging, and secure communication tools
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-xl font-bold text-secondary-900 mb-2">
              Free Speech
            </h3>
            <p className="text-secondary-600">
              Support whistleblowers and journalists fighting for freedom of press and expression
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">💻</div>
            <h3 className="text-xl font-bold text-secondary-900 mb-2">
              Open Source
            </h3>
            <p className="text-secondary-600">
              Keep our codebase free, transparent, and accessible to everyone worldwide
            </p>
          </div>
        </div>

        {/* Code Contributions Section */}
        <div className="bg-gradient-to-br from-secondary-900 to-secondary-800 rounded-2xl shadow-xl p-8 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-5xl mb-4">👨‍💻</div>
            <h2 className="text-3xl font-bold mb-4">
              Contribute Code
            </h2>
            <p className="text-lg text-secondary-300 mb-6">
              Developers can contribute to our open-source mission! Check out our GitHub repository, submit pull requests, report bugs, or suggest new features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/terrellflautt/PGP-Forum"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-secondary-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                View on GitHub
              </a>
              <a
                href="https://github.com/terrellflautt/PGP-Forum/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-primary-500/50 transform hover:scale-105 transition-all duration-200"
              >
                Report an Issue
              </a>
            </div>

            {/* Contributor Stats */}
            <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-secondary-700">
              <div>
                <div className="text-3xl font-bold text-primary-400 mb-1">100%</div>
                <div className="text-sm text-secondary-400">Open Source</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-400 mb-1">MIT</div>
                <div className="text-sm text-secondary-400">License</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-400 mb-1">24/7</div>
                <div className="text-sm text-secondary-400">Community</div>
              </div>
            </div>
          </div>
        </div>

        {/* Thank You Section */}
        <div className="text-center mt-12">
          <p className="text-lg text-secondary-600">
            Every contribution, big or small, helps us build a safer internet for everyone. Thank you for your support! 🙏
          </p>
        </div>
      </div>
    </div>
  );
}

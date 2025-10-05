import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function ResetPasswordView() {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Extract token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    if (resetToken) {
      setToken(resetToken);
    } else {
      setError('Invalid or missing reset token');
    }
  }, []);

  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    return Math.min(strength, 4);
  };

  const handlePasswordChange = (pwd: string) => {
    setNewPassword(pwd);
    setPasswordStrength(calculatePasswordStrength(pwd));
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200';
    if (passwordStrength === 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-orange-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return 'Too weak';
    if (passwordStrength === 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordStrength < 3) {
      setError('Password is too weak. Use at least 12 characters with mixed case, numbers, and symbols.');
      return;
    }

    if (confirmText !== 'DELETE MY DATA') {
      setError('You must type "DELETE MY DATA" to confirm this action');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">Password Reset Complete</h2>
            <p className="text-secondary-600 mb-4">
              Your password has been reset successfully. All previous encrypted data has been destroyed.
            </p>
            <p className="text-sm text-secondary-500">
              Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Reset Your Password</h1>
          <p className="text-secondary-600">Create a new password for your account</p>
        </div>

        {/* CRITICAL WARNING */}
        <div className="bg-red-50 border-4 border-red-400 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <svg className="w-12 h-12 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-xl font-black text-red-900 mb-3">
                CRITICAL WARNING: PERMANENT DATA DESTRUCTION
              </h3>
              <p className="text-red-800 font-semibold mb-3">
                Resetting your password will PERMANENTLY and IRREVERSIBLY destroy:
              </p>
              <ul className="space-y-2 text-red-800 mb-3">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>ALL PGP encrypted messages</strong> (impossible to decrypt)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>ALL private encryption keys</strong> (non-recoverable)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>ALL encrypted files and attachments</strong> (permanent loss)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>ALL forum posts and user data</strong> (complete wipe)</span>
                </li>
              </ul>
              <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4">
                <p className="text-red-900 font-bold text-center text-lg">
                  THIS ACTION CANNOT BE UNDONE
                </p>
                <p className="text-red-800 text-center mt-1">
                  Zero-knowledge encryption means even we cannot recover your data
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-secondary-900 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter a strong password"
            />

            {/* Password Strength Indicator */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-secondary-700">Password Strength:</span>
                <span className={`text-sm font-bold ${passwordStrength >= 3 ? 'text-green-600' : 'text-orange-600'}`}>
                  {getStrengthText()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                  style={{ width: `${(passwordStrength / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-secondary-900 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Confirm your password"
            />
          </div>

          {/* Confirmation Text Input */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
            <label className="block text-sm font-bold text-yellow-900 mb-3">
              To confirm data destruction, type exactly: <span className="font-mono bg-yellow-200 px-2 py-1 rounded">DELETE MY DATA</span>
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-mono"
              placeholder="Type: DELETE MY DATA"
            />
            {confirmText && confirmText !== 'DELETE MY DATA' && (
              <p className="text-sm text-red-600 mt-2 font-semibold">
                Text must match exactly: "DELETE MY DATA"
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => window.location.href = '/'}
              className="flex-1 px-6 py-4 bg-secondary-200 hover:bg-secondary-300 text-secondary-900 rounded-lg font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || confirmText !== 'DELETE MY DATA'}
              className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'Resetting Password...' : 'DESTROY DATA & RESET PASSWORD'}
            </button>
          </div>

          <p className="text-center text-xs text-secondary-500 mt-4">
            By clicking "DESTROY DATA & RESET PASSWORD", you acknowledge that all encrypted data will be permanently lost
          </p>
        </form>
      </div>
    </div>
  );
}

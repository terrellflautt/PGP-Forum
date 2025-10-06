import React, { useState, useEffect } from 'react';

interface CelebrationModalProps {
  type: 'username' | 'first-message' | 'first-thread' | 'welcome';
  username?: string;
  forumUrl?: string;
  onClose: () => void;
  onNextAction?: () => void;
}

export default function CelebrationModal({ type, username, forumUrl, onClose, onNextAction }: CelebrationModalProps) {
  const [confetti, setConfetti] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Stop confetti after 3 seconds
    const timer = setTimeout(() => setConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyLink = () => {
    if (username) {
      const profileUrl = `https://forum.snapitsoftware.com/@${username}`;
      navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getCelebrationContent = () => {
    switch (type) {
      case 'username':
        return {
          icon: '🎉',
          title: 'Your username is reserved!',
          message: `You're now @${username}. Anyone can send you anonymous encrypted messages at your public profile.`,
          primaryAction: 'Continue to Dashboard',
          secondaryAction: 'Copy Profile Link',
          showCopy: true,
        };
      case 'first-message':
        return {
          icon: '💬',
          title: 'First message sent!',
          message: 'Your message was encrypted with 4096-bit PGP and sent through anonymous IP relay.',
          primaryAction: 'Send Another',
          secondaryAction: 'Back to Dashboard',
          showCopy: false,
        };
      case 'first-thread':
        return {
          icon: '📝',
          title: 'Your first thread is live!',
          message: 'Great start! Your community is growing. Invite members to join the conversation.',
          primaryAction: 'Invite Members',
          secondaryAction: 'View Thread',
          showCopy: false,
        };
      case 'welcome':
        return {
          icon: '🚀',
          title: `Welcome to SnapIT Forums!`,
          message: 'You have full access to encrypted forums, private messaging, and anonymous inbox.',
          primaryAction: 'Explore Features',
          secondaryAction: 'Skip Tour',
          showCopy: false,
        };
      default:
        return {
          icon: '✨',
          title: 'Success!',
          message: 'Action completed successfully.',
          primaryAction: 'Continue',
          secondaryAction: 'Close',
          showCopy: false,
        };
    }
  };

  const content = getCelebrationContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      {/* Confetti Effect */}
      {confetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                backgroundColor: ['#ff006e', '#8338ec', '#3a0ca3', '#4895ef', '#4cc9f0'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            ></div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl animate-scale-in relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-secondary-400 hover:text-secondary-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="text-center mb-6">
          <div className="text-8xl mb-4 animate-bounce-slow">{content.icon}</div>
          <h2 className="text-3xl font-bold text-secondary-900 mb-3">
            {content.title}
          </h2>
          <p className="text-lg text-secondary-600">
            {content.message}
          </p>
        </div>

        {/* Username Profile Card (for username celebration) */}
        {type === 'username' && username && (
          <div className="mb-6 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-6 border border-primary-200">
            <p className="text-sm text-secondary-600 mb-2">Your public profile:</p>
            <div className="bg-white rounded-lg p-3 mb-3">
              <code className="text-primary-700 font-mono text-sm break-all">
                https://forum.snapitsoftware.com/@{username}
              </code>
            </div>
            <p className="text-xs text-secondary-600">
              Share this link publicly so sources can send you encrypted, anonymous messages
            </p>
          </div>
        )}

        {/* Feature Highlights */}
        {type === 'username' && (
          <div className="mb-6 bg-secondary-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-secondary-900 mb-3">What's Next?</h3>
            <ul className="space-y-2 text-sm text-secondary-700">
              <li className="flex items-start space-x-2">
                <span className="text-primary-600 mt-0.5">→</span>
                <span>Create your first forum or thread</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-600 mt-0.5">→</span>
                <span>Send encrypted messages to other users</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-600 mt-0.5">→</span>
                <span>Set up your dead man's switch</span>
              </li>
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={onNextAction || onClose}
            className="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>{content.primaryAction}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          {content.showCopy ? (
            <button
              onClick={handleCopyLink}
              className="w-full py-3 px-6 bg-white border-2 border-secondary-200 text-secondary-700 rounded-xl font-semibold hover:border-primary-500 hover:text-primary-700 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>{content.secondaryAction}</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 px-6 bg-white border-2 border-secondary-200 text-secondary-700 rounded-xl font-semibold hover:border-secondary-300 transition-all duration-200"
            >
              {content.secondaryAction}
            </button>
          )}
        </div>

        {/* Time saved indicator */}
        <div className="mt-6 text-center">
          <p className="text-xs text-secondary-500">
            <svg className="w-4 h-4 inline-block mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Setup completed in record time
          </p>
        </div>
      </div>

      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotateZ(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotateZ(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        @keyframes scale-in {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

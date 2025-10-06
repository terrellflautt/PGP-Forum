import React, { useState, useEffect } from 'react';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      setShowIndicator(true);

      // Hide reconnection message after 3 seconds
      setTimeout(() => {
        setShowIndicator(false);
        setJustReconnected(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
      setJustReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show indicator initially if offline
    if (!navigator.onLine) {
      setShowIndicator(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator) {
    return null;
  }

  return (
    <div
      className={`fixed top-20 right-4 z-50 max-w-sm transition-all duration-300 ${
        showIndicator ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div
        className={`rounded-lg shadow-lg border p-4 backdrop-blur-sm ${
          isOnline
            ? 'bg-green-500/90 border-green-400 text-white'
            : 'bg-gray-900/90 border-gray-700 text-white'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 ${
              isOnline ? 'text-white' : 'text-pink-500'
            }`}
          >
            {isOnline ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
              </svg>
            )}
          </div>

          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">
              {isOnline ? 'Back Online' : 'You\'re Offline'}
            </h4>
            <p className="text-xs opacity-90">
              {isOnline
                ? justReconnected
                  ? 'Connection restored. Syncing data...'
                  : 'You\'re connected to the internet'
                : 'You can still view cached messages and forums'}
            </p>
          </div>

          {!isOnline && (
            <button
              onClick={() => window.location.reload()}
              className="text-white hover:text-pink-300 transition-colors"
              title="Retry connection"
              aria-label="Retry connection"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>

        {isOnline && justReconnected && (
          <div className="mt-3 flex items-center gap-2 text-xs opacity-90">
            <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Syncing pending changes...</span>
          </div>
        )}

        {!isOnline && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="text-xs space-y-1 opacity-80">
              <p>✓ View cached content</p>
              <p>✓ Compose messages (sent when online)</p>
              <p>✓ Browse forums</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;

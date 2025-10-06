import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [userDismissed, setUserDismissed] = useState(false);
  const [installCount, setInstallCount] = useState(0);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = (window.navigator as any).standalone || standalone;

    setIsStandalone(isInStandaloneMode);

    // Don't show prompt if already installed
    if (isInStandaloneMode) {
      return;
    }

    // Check if user already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed === 'true') {
      setUserDismissed(true);
      return;
    }

    // Track page visits
    const visitCount = parseInt(localStorage.getItem('pwa-visit-count') || '0', 10);
    const newVisitCount = visitCount + 1;
    localStorage.setItem('pwa-visit-count', newVisitCount.toString());

    // Get install count for tracking
    const installs = parseInt(localStorage.getItem('pwa-install-attempts') || '0', 10);
    setInstallCount(installs);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after 2nd visit or after user interaction
      if (newVisitCount >= 2) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully');
      setShowPrompt(false);
      localStorage.setItem('pwa-installed', 'true');

      // Track install
      const currentInstalls = parseInt(localStorage.getItem('pwa-install-attempts') || '0', 10);
      localStorage.setItem('pwa-install-attempts', (currentInstalls + 1).toString());
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for user choice
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`User ${outcome} the install prompt`);

      if (outcome === 'accepted') {
        setShowPrompt(false);
      }

      // Clear the deferred prompt
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Clear dismissed flag so it shows again on next visit
    localStorage.removeItem('pwa-install-dismissed');
  };

  // Don't show if already installed, dismissed, or no prompt available
  if (isStandalone || userDismissed || !showPrompt) {
    return null;
  }

  // Detect platform for custom messaging
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-pink-500/20 rounded-2xl shadow-2xl max-w-md w-full animate-slideUp">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                {isMobile ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Install SnapIT Forums</h3>
                <p className="text-sm text-gray-400">Get the app experience</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-pink-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-pink-500 text-xs">✓</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Works offline</p>
                <p className="text-gray-400 text-xs">Access cached messages without internet</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-pink-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-pink-500 text-xs">✓</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Faster loading</p>
                <p className="text-gray-400 text-xs">Native app-like performance</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-pink-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-pink-500 text-xs">✓</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Add to home screen</p>
                <p className="text-gray-400 text-xs">Quick access from your device</p>
              </div>
            </div>

            {!isIOS && (
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-pink-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-pink-500 text-xs">✓</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Push notifications</p>
                  <p className="text-gray-400 text-xs">Stay updated with new messages</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-800 p-4 space-y-2">
          {isIOS ? (
            // iOS Instructions
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm text-blue-400 font-medium mb-2">iOS Installation:</p>
              <ol className="text-xs text-gray-300 space-y-1 list-decimal list-inside">
                <li>Tap the Share button below</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" in the top right</li>
              </ol>
            </div>
          ) : deferredPrompt ? (
            // Chrome/Android Install Button
            <button
              onClick={handleInstallClick}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Install App
            </button>
          ) : (
            // Fallback for browsers without install support
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-xs text-yellow-400">
                Your browser doesn't support automatic installation. Add this page to your home
                screen manually for the best experience.
              </p>
            </div>
          )}

          <button
            onClick={handleRemindLater}
            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            Remind Me Later
          </button>
        </div>

        {/* Install Stats (for debugging) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="border-t border-gray-800 p-3 bg-gray-900/50">
            <p className="text-xs text-gray-500">
              Debug: Visits - {localStorage.getItem('pwa-visit-count')} | Installs - {installCount}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallPrompt;

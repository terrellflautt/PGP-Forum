import React, { useState, useEffect } from 'react';

interface OnboardingTooltipProps {
  target: 'create-forum' | 'new-thread' | 'messenger' | 'settings';
  message: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  onDismiss: () => void;
  highlightPulse?: boolean;
}

export default function OnboardingTooltip({
  target,
  message,
  position = 'bottom',
  onDismiss,
  highlightPulse = true,
}: OnboardingTooltipProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show tooltip after brief delay
    const timer = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  if (!visible) return null;

  return (
    <>
      {/* Tooltip */}
      <div
        className={`fixed z-50 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 rounded-xl shadow-2xl max-w-xs animate-fade-in ${
          position === 'bottom' ? 'tooltip-arrow-top' : ''
        }`}
        style={{
          // Position would be calculated based on target element
          // For now, using fixed positions as placeholders
        }}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button
          onClick={handleDismiss}
          className="mt-2 text-xs text-white/90 hover:text-white font-semibold underline"
        >
          Got it!
        </button>
      </div>

      {/* Pulse Highlight (optional) */}
      {highlightPulse && (
        <div className="fixed z-40 pointer-events-none">
          <div className="w-16 h-16 bg-primary-500/30 rounded-full animate-ping"></div>
        </div>
      )}

      <style>{`
        .tooltip-arrow-top::before {
          content: '';
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-bottom: 8px solid #7c3aed;
        }
      `}</style>
    </>
  );
}

import React, { useState, useEffect } from 'react';

interface Message {
  messageId: string;
  senderId: string;
  content: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  encrypted: boolean;
  autoDeleteAt?: number;
  autoDeleteEnabled: boolean;
  isFile?: boolean;
  fileName?: string;
  fileSize?: number;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  // Auto-delete countdown
  useEffect(() => {
    if (!message.autoDeleteEnabled || !message.autoDeleteAt) return;

    const interval = setInterval(() => {
      const remaining = message.autoDeleteAt! - Date.now();

      if (remaining <= 0) {
        setTimeLeft('Deleting...');
        clearInterval(interval);
      } else {
        const hours = Math.floor(remaining / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);

        if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setTimeLeft(`${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${seconds}s`);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [message.autoDeleteEnabled, message.autoDeleteAt]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return (
          <svg className="w-4 h-4 text-secondary-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'sent':
        return (
          <svg className="w-4 h-4 text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'delivered':
        return (
          <div className="flex -space-x-1">
            <svg className="w-4 h-4 text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <svg className="w-4 h-4 text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'read':
        return (
          <div className="flex -space-x-1">
            <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs md:max-w-md lg:max-w-lg ${isOwn ? 'order-2' : 'order-1'}`}>
        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isOwn
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
              : 'bg-white text-secondary-900 border border-secondary-200'
          } shadow-sm`}
        >
          {/* File preview if applicable */}
          {message.isFile && (
            <div className={`flex items-center space-x-2 mb-2 pb-2 border-b ${isOwn ? 'border-primary-400' : 'border-secondary-200'}`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="font-medium text-sm">{message.fileName}</p>
                <p className="text-xs opacity-75">{(message.fileSize! / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          )}

          {/* Message Content */}
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

          {/* Auto-delete timer */}
          {message.autoDeleteEnabled && timeLeft && (
            <div className={`mt-2 pt-2 border-t ${isOwn ? 'border-primary-400' : 'border-secondary-200'} flex items-center space-x-1`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs opacity-75">Self-destructs in {timeLeft}</span>
            </div>
          )}
        </div>

        {/* Metadata row */}
        <div className={`flex items-center space-x-2 mt-1 px-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-secondary-500">{formatTime(message.timestamp)}</span>

          {/* Encryption indicator */}
          {message.encrypted && (
            <span className="text-xs text-green-600 flex items-center space-x-0.5">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </span>
          )}

          {/* Status indicator (only for own messages) */}
          {isOwn && getStatusIcon()}
        </div>
      </div>
    </div>
  );
}

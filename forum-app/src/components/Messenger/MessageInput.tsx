import React, { useState, useRef, useEffect } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string, autoDeleteMinutes?: number) => void;
  onTyping: (typing: boolean) => void;
}

export default function MessageInput({ onSendMessage, onTyping }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [autoDelete, setAutoDelete] = useState<number | undefined>(undefined);
  const [showAutoDeleteMenu, setShowAutoDeleteMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Send typing indicator
    onTyping(true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  };

  const handleSend = () => {
    if (!message.trim()) return;

    onSendMessage(message.trim(), autoDelete);
    setMessage('');
    onTyping(false);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoDeleteOptions = [
    { label: 'Never', value: undefined },
    { label: '1 hour', value: 60 },
    { label: '1 day', value: 1440 },
    { label: '1 week', value: 10080 },
    { label: '1 month', value: 43200 },
  ];

  const getAutoDeleteLabel = () => {
    if (!autoDelete) return 'Never delete';
    const option = autoDeleteOptions.find(opt => opt.value === autoDelete);
    return option ? `Delete after ${option.label.toLowerCase()}` : 'Custom';
  };

  return (
    <div className="bg-white border-t border-secondary-200 p-4">
      <div className="flex items-end space-x-3">
        {/* File upload */}
        <button className="p-2 text-secondary-500 hover:text-primary-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full px-4 py-3 pr-12 border border-secondary-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent max-h-32"
          />

          {/* Auto-delete dropdown */}
          <div className="absolute right-2 bottom-2">
            <div className="relative">
              <button
                onClick={() => setShowAutoDeleteMenu(!showAutoDeleteMenu)}
                className="p-1.5 text-secondary-500 hover:text-primary-600 transition-colors"
                title="Auto-delete timer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {showAutoDeleteMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1">
                  <div className="px-3 py-2 border-b border-secondary-200">
                    <p className="text-xs font-semibold text-secondary-600 uppercase">Auto-Delete</p>
                  </div>
                  {autoDeleteOptions.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => {
                        setAutoDelete(option.value);
                        setShowAutoDeleteMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-secondary-50 transition-colors ${
                        autoDelete === option.value ? 'bg-primary-50 text-primary-700' : 'text-secondary-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{option.label}</span>
                        {autoDelete === option.value && (
                          <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="p-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>

      {/* Auto-delete indicator */}
      {autoDelete && (
        <div className="mt-2 flex items-center justify-between px-2">
          <span className="text-xs text-secondary-500 flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{getAutoDeleteLabel()}</span>
          </span>
          <button
            onClick={() => setAutoDelete(undefined)}
            className="text-xs text-primary-600 hover:text-primary-700"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

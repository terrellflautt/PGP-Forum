import React from 'react';

interface Conversation {
  conversationId: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  typing: boolean;
  online: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
}

export default function ConversationList({
  conversations,
  activeConversation,
  onSelectConversation
}: ConversationListProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins < 1 ? 'Just now' : `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full px-4 text-center">
          <svg className="w-16 h-16 text-secondary-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-secondary-500 text-sm">No conversations yet</p>
          <p className="text-secondary-400 text-xs mt-1">Start messaging to see conversations here</p>
        </div>
      ) : (
        <div className="divide-y divide-secondary-100">
          {conversations.map((conversation) => (
            <button
              key={conversation.conversationId}
              onClick={() => onSelectConversation(conversation.conversationId)}
              className={`w-full p-4 hover:bg-secondary-50 transition-colors text-left ${
                activeConversation === conversation.conversationId ? 'bg-primary-50' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Avatar with online status */}
                <div className="relative flex-shrink-0">
                  <img
                    src={conversation.recipientAvatar || '/default-avatar.png'}
                    alt={conversation.recipientName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {conversation.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                {/* Conversation info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-secondary-900 truncate">
                      {conversation.recipientName}
                    </h4>
                    <span className="text-xs text-secondary-500 flex-shrink-0 ml-2">
                      {formatTime(conversation.lastMessageTime)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${
                      conversation.unreadCount > 0 ? 'font-medium text-secondary-900' : 'text-secondary-500'
                    }`}>
                      {conversation.typing ? (
                        <span className="text-primary-600 italic">typing...</span>
                      ) : (
                        conversation.lastMessage || 'No messages yet'
                      )}
                    </p>

                    {/* Unread badge */}
                    {conversation.unreadCount > 0 && (
                      <span className="ml-2 flex-shrink-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary-600 rounded-full">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

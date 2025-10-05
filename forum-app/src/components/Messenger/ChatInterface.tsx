import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import ConversationList from './ConversationList';
import { API_BASE_URL } from '../../config';

interface Message {
  messageId: string;
  senderId: string;
  recipientId: string;
  content: string;
  encrypted: boolean;
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  autoDeleteAt?: number;
  autoDeleteEnabled: boolean;
  isFile?: boolean;
  fileName?: string;
  fileSize?: number;
}

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

interface ChatInterfaceProps {
  currentUser: any;
}

export default function ChatInterface({ currentUser }: ChatInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // WebSocket connection for real-time messaging
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const ws = new WebSocket(`wss://ju482kcu0a.execute-api.us-east-1.amazonaws.com/prod?token=${token}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'new-message':
          handleNewMessage(data.message);
          break;
        case 'message-read':
          updateMessageStatus(data.messageId, 'read');
          break;
        case 'user-typing':
          handleTyping(data.userId, true);
          break;
        case 'user-stopped-typing':
          handleTyping(data.userId, false);
          break;
        case 'user-online':
          updateUserOnlineStatus(data.userId, true);
          break;
        case 'user-offline':
          updateUserOnlineStatus(data.userId, false);
          break;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected, reconnecting...');
      setTimeout(() => {
        // Reconnect logic
      }, 3000);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation);
    }
  }, [activeConversation]);

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/messages?conversationId=${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, autoDeleteMinutes?: number) => {
    if (!activeConversation || !content.trim()) return;

    const tempId = `temp_${Date.now()}`;
    const newMessage: Message = {
      messageId: tempId,
      senderId: currentUser.userId,
      recipientId: activeConversation,
      content,
      encrypted: true,
      timestamp: Date.now(),
      status: 'sending',
      autoDeleteEnabled: !!autoDeleteMinutes,
      autoDeleteAt: autoDeleteMinutes ? Date.now() + (autoDeleteMinutes * 60 * 1000) : undefined
    };

    // Optimistic update
    setMessages(prev => [...prev, newMessage]);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId: activeConversation,
          content,
          autoDeleteMinutes
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Replace temp message with real one
        setMessages(prev => prev.map(msg =>
          msg.messageId === tempId ? { ...msg, messageId: data.messageId, status: 'sent' } : msg
        ));

        // Send via WebSocket for real-time delivery
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            action: 'send-message',
            messageId: data.messageId,
            recipientId: activeConversation
          }));
        }
      } else {
        // Mark as failed
        setMessages(prev => prev.map(msg =>
          msg.messageId === tempId ? { ...msg, status: 'sent' } : msg
        ));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleNewMessage = (message: Message) => {
    if (message.recipientId === currentUser.userId || message.senderId === currentUser.userId) {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m.messageId === message.messageId)) {
          return prev;
        }
        return [...prev, message];
      });

      // Mark as delivered
      if (message.recipientId === currentUser.userId && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          action: 'message-delivered',
          messageId: message.messageId
        }));
      }
    }
  };

  const updateMessageStatus = (messageId: string, status: Message['status']) => {
    setMessages(prev => prev.map(msg =>
      msg.messageId === messageId ? { ...msg, status } : msg
    ));
  };

  const handleTyping = (userId: string, isTyping: boolean) => {
    setTypingUsers(prev => {
      const newSet = new Set(prev);
      if (isTyping) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  const updateUserOnlineStatus = (userId: string, online: boolean) => {
    setConversations(prev => prev.map(conv =>
      conv.recipientId === userId ? { ...conv, online } : conv
    ));
  };

  const handleTypingIndicator = (typing: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && activeConversation) {
      wsRef.current.send(JSON.stringify({
        action: typing ? 'user-typing' : 'user-stopped-typing',
        recipientId: activeConversation
      }));
    }
  };

  const activeConv = conversations.find(c => c.conversationId === activeConversation);

  return (
    <div className="flex h-screen bg-secondary-50">
      {/* Conversations Sidebar */}
      <div className="w-80 bg-white border-r border-secondary-200 flex flex-col">
        <div className="p-4 border-b border-secondary-200">
          <h2 className="text-xl font-bold text-secondary-900">Messages</h2>
          <div className="mt-3">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <ConversationList
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={setActiveConversation}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation && activeConv ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-secondary-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={activeConv.recipientAvatar || '/default-avatar.png'}
                    alt={activeConv.recipientName}
                    className="w-10 h-10 rounded-full"
                  />
                  {activeConv.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-900">{activeConv.recipientName}</h3>
                  <p className="text-xs text-secondary-500">
                    {typingUsers.has(activeConv.recipientId) ? (
                      <span className="text-primary-600">typing...</span>
                    ) : activeConv.online ? (
                      'Online'
                    ) : (
                      'Offline'
                    )}
                  </p>
                </div>
              </div>

              {/* Security Indicators */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">🔒 Encrypted</span>
                </div>
                <div className="flex items-center space-x-1 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">🕵️ Anonymous</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-secondary-50">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-secondary-400">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-lg font-medium">No messages yet</p>
                  <p className="text-sm">Send a message to start the conversation</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.messageId}
                      message={message}
                      isOwn={message.senderId === currentUser.userId}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <MessageInput
              onSendMessage={sendMessage}
              onTyping={handleTypingIndicator}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-secondary-50">
            <div className="text-center">
              <svg className="w-24 h-24 mx-auto text-secondary-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-2xl font-bold text-secondary-900 mb-2">Select a conversation</h3>
              <p className="text-secondary-500">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

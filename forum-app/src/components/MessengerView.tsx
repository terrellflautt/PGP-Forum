import React, { useState } from 'react';

interface MessengerViewProps {
  user: any;
}

export default function MessengerView({ user }: MessengerViewProps) {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1);
  const [message, setMessage] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'Alice Johnson',
      avatar: 'https://i.pravatar.cc/150?img=1',
      lastMessage: 'Thanks for the encrypted file!',
      timestamp: '2 min ago',
      unread: 2,
      encrypted: true,
    },
    {
      id: 2,
      name: 'Bob Smith',
      avatar: 'https://i.pravatar.cc/150?img=2',
      lastMessage: 'Check out this dead man\'s switch setup',
      timestamp: '1 hour ago',
      unread: 0,
      encrypted: true,
    },
    {
      id: 3,
      name: 'Anonymous User',
      avatar: 'https://i.pravatar.cc/150?img=3',
      lastMessage: 'Message will auto-delete in 1 hour',
      timestamp: '3 hours ago',
      unread: 1,
      encrypted: true,
    },
  ];

  const messages = [
    {
      id: 1,
      sender: 'Alice Johnson',
      content: 'Hey! I need to send you something confidential.',
      timestamp: '10:30 AM',
      isMine: false,
      encrypted: true,
    },
    {
      id: 2,
      sender: 'You',
      content: 'Sure! Send it over. Everything is PGP encrypted here.',
      timestamp: '10:32 AM',
      isMine: true,
      encrypted: true,
    },
    {
      id: 3,
      sender: 'Alice Johnson',
      content: '[Encrypted File: confidential_docs.pdf - 2.4 MB]',
      timestamp: '10:35 AM',
      isMine: false,
      encrypted: true,
      isFile: true,
    },
    {
      id: 4,
      sender: 'You',
      content: 'Thanks for the encrypted file!',
      timestamp: '10:38 AM',
      isMine: true,
      encrypted: true,
    },
  ];

  return (
    <div className="min-h-screen bg-secondary-50 pt-16 pl-64">
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Conversations List */}
        <div className="w-80 bg-white border-r border-secondary-200 flex flex-col">
          <div className="p-4 border-b border-secondary-200">
            <h2 className="text-xl font-bold text-secondary-900 mb-3">Messages</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full px-4 py-2 pl-10 bg-secondary-50 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full p-4 flex items-start space-x-3 hover:bg-secondary-50 transition-colors border-b border-secondary-100 ${
                  selectedConversation === conv.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="relative">
                  <img src={conv.avatar} alt={conv.name} className="w-12 h-12 rounded-full" />
                  {conv.encrypted && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-xs">🔒</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-secondary-900">{conv.name}</span>
                    <span className="text-xs text-secondary-500">{conv.timestamp}</span>
                  </div>
                  <p className="text-sm text-secondary-600 truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {conv.unread}
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-secondary-200">
            <button className="w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
              + New Message
            </button>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-secondary-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={conversations.find(c => c.id === selectedConversation)?.avatar}
                    alt="User"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-secondary-900">
                      {conversations.find(c => c.id === selectedConversation)?.name}
                    </h3>
                    <div className="flex items-center space-x-1 text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Encrypted • 4096-bit PGP</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 rounded-lg transition-colors" title="Dead Man's Switch">
                    ⏰
                  </button>
                  <button className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 rounded-lg transition-colors" title="Send Ephemeral Message">
                    ⏱️
                  </button>
                  <button className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 rounded-lg transition-colors" title="More Options">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-lg ${msg.isMine ? 'order-2' : 'order-1'}`}>
                      <div className={`rounded-2xl px-4 py-3 ${
                        msg.isMine
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                          : 'bg-secondary-100 text-secondary-900'
                      }`}>
                        {msg.isFile ? (
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                              📄
                            </div>
                            <div>
                              <p className="font-semibold text-sm">confidential_docs.pdf</p>
                              <p className={`text-xs ${msg.isMine ? 'text-white/70' : 'text-secondary-600'}`}>
                                2.4 MB • Encrypted
                              </p>
                            </div>
                            <button className={`text-sm font-semibold ${msg.isMine ? 'text-white' : 'text-primary-600'}`}>
                              Download
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm">{msg.content}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1 px-2">
                        <span className={`text-xs ${msg.isMine ? 'text-secondary-500' : 'text-secondary-500'}`}>
                          {msg.timestamp}
                        </span>
                        {msg.encrypted && (
                          <span className="text-xs text-green-600">🔒</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-secondary-200">
                <div className="flex items-end space-x-3">
                  <button className="p-3 text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 rounded-lg transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>

                  <div className="flex-1 relative">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message... (PGP encrypted)"
                      rows={1}
                      className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                    <div className="absolute bottom-3 right-3 flex items-center space-x-2 text-xs text-secondary-500">
                      <span className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Encrypted</span>
                      </span>
                    </div>
                  </div>

                  <button className="p-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-2xl font-bold text-secondary-900 mb-2">Select a conversation</h3>
                <p className="text-secondary-600">Choose a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

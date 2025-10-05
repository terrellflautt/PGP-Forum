import React, { useState } from 'react';

interface ForumViewProps {
  user: any;
  forum: any;
}

export default function ForumView({ user, forum }: ForumViewProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const threads = [
    {
      id: 1,
      title: 'Welcome to SnapIT Forums!',
      author: 'Admin',
      category: 'announcements',
      replies: 24,
      views: 342,
      lastActivity: '2 hours ago',
      isPinned: true,
      isLocked: false,
    },
    {
      id: 2,
      title: 'How to use PGP encryption for private messages',
      author: 'SecurityBot',
      category: 'support',
      replies: 15,
      views: 189,
      lastActivity: '3 hours ago',
      isPinned: true,
      isLocked: false,
    },
    {
      id: 3,
      title: 'Feature Request: Custom themes',
      author: 'User123',
      category: 'feedback',
      replies: 8,
      views: 67,
      lastActivity: '5 hours ago',
      isPinned: false,
      isLocked: false,
    },
    {
      id: 4,
      title: 'Dead Man\'s Switch setup guide',
      author: 'TechGuru',
      category: 'general',
      replies: 12,
      views: 145,
      lastActivity: '1 day ago',
      isPinned: false,
      isLocked: false,
    },
  ];

  return (
    <div className="min-h-screen bg-secondary-50 pt-16 pl-64">
      <div className="max-w-7xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-black text-secondary-900 mb-1">Forum</h1>
              <p className="text-secondary-600">
                Welcome back, <span className="font-semibold text-primary-600">{user?.name}</span>!
              </p>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              + New Thread
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <FilterButton label="All" active={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')} />
            <FilterButton label="Announcements" active={selectedCategory === 'announcements'} onClick={() => setSelectedCategory('announcements')} />
            <FilterButton label="General" active={selectedCategory === 'general'} onClick={() => setSelectedCategory('general')} />
            <FilterButton label="Support" active={selectedCategory === 'support'} onClick={() => setSelectedCategory('support')} />
            <FilterButton label="Feedback" active={selectedCategory === 'feedback'} onClick={() => setSelectedCategory('feedback')} />
          </div>
        </div>

        {/* Threads List */}
        <div className="space-y-3">
          {threads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} />
          ))}
        </div>

        {/* Empty State */}
        {threads.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-secondary-900 mb-2">No threads yet</h3>
            <p className="text-secondary-600 mb-6">Be the first to start a discussion!</p>
            <button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              Create First Thread
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface FilterButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function FilterButton({ label, active, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
        active
          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
          : 'bg-white text-secondary-700 hover:bg-secondary-50 border border-secondary-200'
      }`}
    >
      {label}
    </button>
  );
}

interface ThreadCardProps {
  thread: any;
}

function ThreadCard({ thread }: ThreadCardProps) {
  const categoryColors: { [key: string]: string } = {
    announcements: 'bg-pink-100 text-pink-700',
    general: 'bg-blue-100 text-blue-700',
    support: 'bg-green-100 text-green-700',
    feedback: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-lg border border-secondary-100 transition-all duration-200 group cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {thread.isPinned && (
              <span className="text-primary-500" title="Pinned">📌</span>
            )}
            {thread.isLocked && (
              <span className="text-secondary-500" title="Locked">🔒</span>
            )}
            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${categoryColors[thread.category]}`}>
              {thread.category}
            </span>
          </div>

          <h3 className="text-lg font-bold text-secondary-900 mb-1 group-hover:text-primary-600 transition-colors">
            {thread.title}
          </h3>

          <div className="flex items-center space-x-4 text-sm text-secondary-600">
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{thread.author}</span>
            </span>
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{thread.lastActivity}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-6 ml-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary-900">{thread.replies}</div>
            <div className="text-xs text-secondary-500 uppercase tracking-wide">Replies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary-900">{thread.views}</div>
            <div className="text-xs text-secondary-500 uppercase tracking-wide">Views</div>
          </div>
        </div>
      </div>
    </div>
  );
}

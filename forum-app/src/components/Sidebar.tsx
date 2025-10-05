import React from 'react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  forum: any;
}

export default function Sidebar({ currentView, onViewChange, forum }: SidebarProps) {
  const menuItems = [
    { id: 'forums', label: 'Forums', icon: '📋', badge: null },
    { id: 'messenger', label: 'Messenger', icon: '💬', badge: '3' },
    { id: 'anonymous-inbox', label: 'Anonymous Inbox', icon: '📨', badge: '1' },
    { id: 'deadman', label: 'Dead Man\'s Switch', icon: '⏰', badge: null },
    { id: 'contributions', label: 'Contributions', icon: '💝', badge: null },
    { id: 'settings', label: 'Settings', icon: '⚙️', badge: null },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-secondary-200 overflow-y-auto">
      {/* Forum Info */}
      <div className="p-4 border-b border-secondary-200">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">
              {forum?.tier || 'Free'} Tier
            </span>
            {forum?.tier === 'free' && (
              <button className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                Upgrade
              </button>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary-600">Users</span>
              <span className="font-bold text-secondary-900">
                {forum?.userCount || 0} / {forum?.maxUsers || 1500}
              </span>
            </div>
            <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                style={{ width: `${((forum?.userCount || 0) / (forum?.maxUsers || 1500)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${
              currentView === item.id
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                : 'text-secondary-700 hover:bg-secondary-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </div>
            {item.badge && (
              <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                currentView === item.id
                  ? 'bg-white/20 text-white'
                  : 'bg-primary-100 text-primary-700'
              }`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Categories */}
      <div className="p-4 border-t border-secondary-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-secondary-500 uppercase tracking-wide">Categories</h3>
          <button className="text-primary-600 hover:text-primary-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <div className="space-y-1">
          <CategoryItem name="General" count={42} color="blue" />
          <CategoryItem name="Support" count={18} color="green" />
          <CategoryItem name="Feedback" count={7} color="purple" />
          <CategoryItem name="Announcements" count={3} color="pink" />
        </div>
      </div>

      {/* Security Info */}
      <div className="p-4 border-t border-secondary-200">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-start space-x-2 mb-2">
            <span className="text-lg">🔐</span>
            <div>
              <p className="text-xs font-bold text-green-900">Zero-Knowledge</p>
              <p className="text-xs text-green-700">Server can't decrypt</p>
            </div>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-green-700">Encryption</span>
              <span className="font-semibold text-green-900">4096-bit</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-green-700">Relay Hops</span>
              <span className="font-semibold text-green-900">3-5 peers</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

interface CategoryItemProps {
  name: string;
  count: number;
  color: string;
}

function CategoryItem({ name, count, color }: CategoryItemProps) {
  const colorMap: { [key: string]: string } = {
    blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    green: 'bg-green-100 text-green-700 hover:bg-green-200',
    purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    pink: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
  };

  return (
    <button className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${colorMap[color]}`}>
      <span className="text-sm font-medium">{name}</span>
      <span className="text-xs font-bold">{count}</span>
    </button>
  );
}

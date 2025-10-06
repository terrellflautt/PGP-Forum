import React from 'react';

interface HeaderProps {
  user: any;
  forum: any;
  onLogout: () => void;
}

export default function Header({ user, forum, onLogout }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-secondary-200 shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              {forum?.name || 'My Forum'}
            </h1>
            <p className="text-xs text-secondary-500">
              {forum?.tier === 'free' ? `${forum?.userCount || 0} / 1,500 users` : `${forum?.tier} tier`}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-4 md:mx-8">
          <div className="relative w-full">
            <input
              type="search"
              placeholder="Search threads, posts, users..."
              className="w-full px-4 py-2 pl-10 bg-secondary-50 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              style={{ fontSize: '16px' }}
              aria-label="Search"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          {/* Security Indicators */}
          <div className="flex items-center space-x-2">
            <div className="group relative">
              <div className="flex items-center space-x-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>🔒 PGP</span>
              </div>
              <div className="absolute top-full mt-2 right-0 w-64 bg-secondary-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl">
                <p className="font-semibold mb-1">PGP Encryption Active</p>
                <p className="text-secondary-300">4096-bit RSA, non-extractable keys</p>
              </div>
            </div>

            <div className="group relative">
              <div className="flex items-center space-x-1 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span>🕵️ Anonymous</span>
              </div>
              <div className="absolute top-full mt-2 right-0 w-64 bg-secondary-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl">
                <p className="font-semibold mb-1">Anonymous Mode Active</p>
                <p className="text-secondary-300">WebRTC relay: 3-5 peer hops</p>
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3 pl-4 border-l border-secondary-200">
            <img
              src={user?.picture || 'https://via.placeholder.com/40'}
              alt={user?.name}
              className="w-10 h-10 rounded-full border-2 border-primary-500"
            />
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-secondary-900">{user?.name}</p>
              <p className="text-xs text-secondary-500">{user?.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="px-3 py-2 min-h-[44px] text-sm font-medium text-secondary-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-secondary-50"
              aria-label="Logout"
            >
              <span className="hidden md:inline">Logout</span>
              <svg className="md:hidden w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

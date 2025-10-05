import React, { useState, useEffect } from 'react';
import './App.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID, BRAND_CONFIG } from './config';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ForumView from './components/ForumView';
import MessengerView from './components/MessengerView';
import SettingsView from './components/SettingsView';
import LoginModal from './components/LoginModal';
import LandingPage from './components/LandingPage';
import UsernameSetup from './components/UsernameSetup';
import PublicProfile from './components/PublicProfile';
import ChatInterface from './components/Messenger/ChatInterface';

type View = 'forums' | 'messenger' | 'settings' | 'anonymous-inbox' | 'deadman';

function App() {
  const [currentView, setCurrentView] = useState<View>('forums');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [needsUsername, setNeedsUsername] = useState(false);
  const [publicProfileUsername, setPublicProfileUsername] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Check if user needs to set username
      if (!parsedUser.username) {
        setNeedsUsername(true);
      }
    }

    // Check for public profile route (/@username)
    const path = window.location.pathname;
    if (path.startsWith('/@')) {
      const username = path.substring(2);
      setPublicProfileUsername(username);
    }
  }, []);

  const handleLogin = (userData: any, forumData: any) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('forum', JSON.stringify(forumData));
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('forum');
  };

  // Public profile route (accessible without login)
  if (publicProfileUsername) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <PublicProfile username={publicProfileUsername} />
        {showLoginModal && (
          <LoginModal
            onLogin={handleLogin}
            onClose={() => setShowLoginModal(false)}
          />
        )}
      </GoogleOAuthProvider>
    );
  }

  // Landing page for non-logged-in users
  if (!isLoggedIn) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <LandingPage onGetStarted={() => setShowLoginModal(true)} />
        {showLoginModal && (
          <LoginModal
            onLogin={handleLogin}
            onClose={() => setShowLoginModal(false)}
          />
        )}
      </GoogleOAuthProvider>
    );
  }

  // Username setup for first-time users
  if (needsUsername) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <UsernameSetup
          onComplete={(username: string) => {
            const updatedUser = { ...user, username };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setNeedsUsername(false);
          }}
        />
      </GoogleOAuthProvider>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'forums':
        return <ForumView user={user} forum={null} />;
      case 'messenger':
        return <ChatInterface currentUser={user} />;
      case 'settings':
        return <SettingsView user={user} forum={null} onLogout={handleLogout} />;
      default:
        return <ForumView user={user} forum={null} />;
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="App min-h-screen bg-secondary-50">
        {isLoggedIn && (
          <>
            <Header user={user} forum={null} onLogout={handleLogout} />
            <Sidebar currentView={currentView} onViewChange={setCurrentView as any} forum={null} />
          </>
        )}

        <main className={isLoggedIn ? '' : ''}>
          {renderView()}
        </main>

        {showLoginModal && (
          <LoginModal
            onLogin={handleLogin}
            onClose={() => setShowLoginModal(false)}
          />
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;

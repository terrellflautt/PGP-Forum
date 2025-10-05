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

type View = 'forums' | 'messenger' | 'settings' | 'anonymous-inbox' | 'deadman';

function App() {
  const [currentView, setCurrentView] = useState<View>('forums');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

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
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!isLoggedIn) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
          {/* Animated background orbs */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 -left-4 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-96 h-96 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>

          {/* Hero Section */}
          <div className="relative z-10">
            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
              <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                    <span className="text-white font-bold text-xl">S</span>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    {BRAND_CONFIG.name}
                  </span>
                </div>
                <div className="flex items-center space-x-6">
                  <a href="#features" className="text-secondary-700 hover:text-primary-600 transition-colors font-medium">Features</a>
                  <a href="#pricing" className="text-secondary-700 hover:text-primary-600 transition-colors font-medium">Pricing</a>
                  <a href="#security" className="text-secondary-700 hover:text-primary-600 transition-colors font-medium">Security</a>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-2.5 rounded-lg font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </nav>

            {/* Hero Content */}
            <div className="pt-32 pb-20 px-6">
              <div className="max-w-7xl mx-auto text-center">
                <div className="inline-block animate-fade-in-up">
                  <div className="inline-flex items-center bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></span>
                    Zero-Knowledge Community Platform
                  </div>
                </div>

                <h1 className="text-6xl md:text-7xl font-black text-secondary-900 mb-6 animate-fade-in-up animation-delay-200">
                  Own Your
                  <span className="block bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 bg-clip-text text-transparent animate-gradient-x">
                    Digital Privacy
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-secondary-600 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
                  The world's first forum platform with military-grade PGP encryption,
                  anonymous IP relay, and zero-knowledge architecture.
                  <span className="font-semibold text-primary-600"> Server can't read your messages.</span>
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up animation-delay-600">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="group relative px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold text-lg shadow-2xl hover:shadow-primary-500/50 transform hover:scale-105 transition-all duration-300"
                  >
                    <span className="relative z-10">Start Free Forum</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>

                  <a
                    href="#features"
                    className="px-8 py-4 bg-white text-secondary-900 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-secondary-200"
                  >
                    See How It Works
                  </a>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-20 animate-fade-in-up animation-delay-800">
                  <div className="text-center">
                    <div className="text-4xl font-black bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
                      1,500
                    </div>
                    <div className="text-secondary-600 font-medium">Free Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
                      4096-bit
                    </div>
                    <div className="text-secondary-600 font-medium">PGP Encryption</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
                      100%
                    </div>
                    <div className="text-secondary-600 font-medium">Private</div>
                  </div>
                </div>

                {/* Feature Cards */}
                <div id="features" className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  <FeatureCard
                    icon="🔒"
                    title="PGP Encrypted"
                    description="4096-bit RSA end-to-end encryption. Private keys never leave your browser."
                    delay={1000}
                  />
                  <FeatureCard
                    icon="🕵️"
                    title="Anonymous Mode"
                    description="WebRTC peer relay routes traffic through 3-5 random hops. Server only sees relay IP."
                    delay={1200}
                  />
                  <FeatureCard
                    icon="💾"
                    title="Zero-Knowledge"
                    description="Server stores only encrypted ciphertext. We literally cannot decrypt your messages."
                    delay={1400}
                  />
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div id="security" className="py-20 px-6 bg-white/50 backdrop-blur-sm">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-5xl font-black text-center text-secondary-900 mb-4">
                  Security That
                  <span className="block bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                    Actually Works
                  </span>
                </h2>
                <p className="text-center text-secondary-600 text-xl mb-16 max-w-3xl mx-auto">
                  Unlike other platforms that claim "encryption", we use true zero-knowledge architecture
                  where even we can't access your data.
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                  <SecurityFeature
                    title="Non-Extractable Keys"
                    description="Private keys generated with .extractable = false flag. Literally impossible for JavaScript to export them. Browser API enforces this at the hardware level."
                  />
                  <SecurityFeature
                    title="Ephemeral Messages"
                    description="Auto-delete with 7-pass overwrite (DoD 5220.22-M). After deletion, messages are forensically unrecoverable."
                  />
                  <SecurityFeature
                    title="Dead Man's Switch"
                    description="Auto-release encrypted data if you fail to check in. Perfect for whistleblowers and digital inheritance."
                  />
                  <SecurityFeature
                    title="P2P File Transfer"
                    description="Files never touch our servers. Direct peer-to-peer WebRTC transfer with end-to-end encryption."
                  />
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="py-20 px-6">
              <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl p-12 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                  Ready to Take Back Your Privacy?
                </h2>
                <p className="text-primary-100 text-xl mb-8 max-w-2xl mx-auto">
                  Sign up free with Google. Get your own forum with 1,500 users,
                  PGP messaging, and anonymous mode. No credit card required.
                </p>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-white text-primary-600 px-10 py-5 rounded-xl font-black text-xl shadow-2xl hover:shadow-white/50 transform hover:scale-110 transition-all duration-300"
                >
                  Create Free Forum →
                </button>
              </div>
            </div>
          </div>
        </div>
      </GoogleOAuthProvider>
    );
  }

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

  const renderView = () => {
    switch (currentView) {
      case 'forums':
        return <ForumView user={user} forum={null} />;
      case 'messenger':
        return <MessengerView user={user} />;
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

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  delay: number;
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <div
      className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-secondary-100 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-6xl mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-secondary-900 mb-3">{title}</h3>
      <p className="text-secondary-600 leading-relaxed">{description}</p>
    </div>
  );
}

interface SecurityFeatureProps {
  title: string;
  description: string;
}

function SecurityFeature({ title, description }: SecurityFeatureProps) {
  return (
    <div className="bg-gradient-to-br from-white to-primary-50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-primary-100">
      <div className="flex items-start">
        <div className="w-3 h-3 bg-primary-500 rounded-full mt-2 mr-4 flex-shrink-0 animate-pulse"></div>
        <div>
          <h4 className="text-xl font-bold text-secondary-900 mb-2">{title}</h4>
          <p className="text-secondary-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default App;

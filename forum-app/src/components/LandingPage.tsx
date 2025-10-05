import React, { useState } from 'react';
import { GOOGLE_AUTH_URL, BRAND_CONFIG } from '../config';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-primary-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">SnapIT Forums</h1>
                <p className="text-primary-300 text-sm">Zero-Knowledge Platform</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = GOOGLE_AUTH_URL}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg border border-white/20 transition-all duration-200"
            >
              Sign In
            </button>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-500/20 backdrop-blur-sm rounded-full border border-primary-400/30 mb-8 animate-fade-in">
              <span className="text-2xl">🔒</span>
              <span className="text-primary-200 font-semibold">For Whistleblowers • Journalists • Privacy Advocates</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in-up">
              Speak Truth to Power
              <br />
              <span className="text-gradient-animate bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent">
                Anonymously & Securely
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-secondary-300 mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              Build your own private community. Share information securely.
              <strong className="text-white"> We literally cannot read your messages.</strong>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up animation-delay-400">
              <button
                onClick={() => window.location.href = GOOGLE_AUTH_URL}
                className="group px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-lg font-semibold rounded-xl shadow-2xl hover:shadow-primary-500/50 transform hover:scale-105 transition-all duration-200"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>Start Your Free Forum</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              <a
                href="#how-it-works"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white text-lg font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200"
              >
                How It Works
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-8 text-secondary-400 animate-fade-in-up animation-delay-600">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Non-extractable encryption</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Anonymous IP relay</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free forever (1,500 users)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div id="use-cases" className="py-24 bg-secondary-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Built for Truth Tellers</h2>
            <p className="text-xl text-secondary-400">Secure communication for those who need it most</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Whistleblowers */}
            <div className="bg-secondary-800/50 backdrop-blur-sm rounded-2xl p-8 border border-primary-500/20 hover:border-primary-500/50 transition-all duration-200 animate-fade-in-up">
              <div className="text-5xl mb-4">📢</div>
              <h3 className="text-2xl font-bold text-white mb-4">Whistleblowers</h3>
              <p className="text-secondary-300 mb-6">
                Expose corruption without fear. Your identity is protected by mathematics, not promises.
              </p>
              <ul className="space-y-3 text-secondary-400">
                <li className="flex items-start space-x-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Dead man's switch auto-release</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Anonymous document sharing</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>IP address anonymization</span>
                </li>
              </ul>
            </div>

            {/* Journalists */}
            <div className="bg-secondary-800/50 backdrop-blur-sm rounded-2xl p-8 border border-primary-500/20 hover:border-primary-500/50 transition-all duration-200 animate-fade-in-up animation-delay-200">
              <div className="text-5xl mb-4">📰</div>
              <h3 className="text-2xl font-bold text-white mb-4">Journalists</h3>
              <p className="text-secondary-300 mb-6">
                Protect your sources. Communicate securely. Build private communities for investigations.
              </p>
              <ul className="space-y-3 text-secondary-400">
                <li className="flex items-start space-x-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Source protection guaranteed</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Encrypted file transfers (P2P)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Anonymous tip inbox</span>
                </li>
              </ul>
            </div>

            {/* Privacy Advocates */}
            <div className="bg-secondary-800/50 backdrop-blur-sm rounded-2xl p-8 border border-primary-500/20 hover:border-primary-500/50 transition-all duration-200 animate-fade-in-up animation-delay-400">
              <div className="text-5xl mb-4">🛡️</div>
              <h3 className="text-2xl font-bold text-white mb-4">Privacy Advocates</h3>
              <p className="text-secondary-300 mb-6">
                Build communities that respect user privacy. No tracking. No data mining. No backdoors.
              </p>
              <ul className="space-y-3 text-secondary-400">
                <li className="flex items-start space-x-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Zero metadata logging</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Non-extractable encryption keys</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Open-source security model</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Simple for You, Impossible for Them</h2>
            <p className="text-xl text-secondary-400">Get started in 3 clicks. No technical knowledge required.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Sign In with Google</h3>
              <p className="text-secondary-400">
                One click. Your email stays private. We only use it for account recovery.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Choose Your Username</h3>
              <p className="text-secondary-400">
                Pick a memorable name or randomize one. Share it publicly so sources can contact you anonymously.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Start Communicating</h3>
              <p className="text-secondary-400">
                Build your forum, send encrypted messages, or set up an anonymous inbox. All free.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Guarantees */}
      <div className="py-24 bg-secondary-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              We Can't Read Your Messages
              <br />
              <span className="text-primary-400">(Even If We Wanted To)</span>
            </h2>
            <p className="text-xl text-secondary-400 max-w-3xl mx-auto">
              Your encryption keys never leave your device. They're stored in your browser's secure keystore with the <code className="text-primary-400">.extractable = false</code> flag. Mathematically impossible for us to access.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                What We DON'T Have
              </h3>
              <ul className="space-y-2 text-secondary-300">
                <li>✗ Your private encryption keys</li>
                <li>✗ Your message content</li>
                <li>✗ Your IP address (anonymized)</li>
                <li>✗ Metadata logs</li>
                <li>✗ Backdoors or key escrow</li>
              </ul>
            </div>

            <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                What You GET
              </h3>
              <ul className="space-y-2 text-secondary-300">
                <li>✓ 4096-bit RSA encryption</li>
                <li>✓ Anonymous IP relay (3-5 hops)</li>
                <li>✓ Dead man's switch</li>
                <li>✓ Anonymous inbox</li>
                <li>✓ P2P file transfers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Public Username Feature */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-900/50 to-secondary-900/50 backdrop-blur-sm rounded-3xl p-12 border border-primary-500/20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="text-5xl mb-6">📬</div>
                <h2 className="text-4xl font-bold text-white mb-6">
                  Receive Anonymous Tips
                </h2>
                <p className="text-xl text-secondary-300 mb-6">
                  Share your username publicly. Anyone can send you encrypted messages without revealing their identity.
                </p>
                <div className="bg-secondary-800/50 rounded-xl p-6 border border-secondary-700">
                  <p className="text-secondary-400 text-sm mb-2">Example:</p>
                  <code className="text-primary-400 text-lg">
                    https://forum.snapitsoftware.com/@whistleblower-reporter
                  </code>
                  <p className="text-secondary-500 text-sm mt-4">
                    Sources can send you encrypted files and messages. You receive them securely. They stay anonymous.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-secondary-800/50 rounded-xl p-6 border border-primary-500/20">
                  <h4 className="font-semibold text-white mb-2">🔒 For the sender:</h4>
                  <ul className="text-secondary-400 space-y-1 text-sm">
                    <li>• No account needed</li>
                    <li>• IP anonymized through relay</li>
                    <li>• Message encrypted before sending</li>
                    <li>• No metadata collected</li>
                  </ul>
                </div>
                <div className="bg-secondary-800/50 rounded-xl p-6 border border-primary-500/20">
                  <h4 className="font-semibold text-white mb-2">📨 For you:</h4>
                  <ul className="text-secondary-400 space-y-1 text-sm">
                    <li>• Receive tips 24/7</li>
                    <li>• Message decrypted on your device</li>
                    <li>• Optional auto-delete</li>
                    <li>• Spam protection built-in</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-24 bg-gradient-to-br from-primary-900 to-secondary-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to Speak Freely?
          </h2>
          <p className="text-2xl text-secondary-300 mb-12">
            Join thousands of journalists, whistleblowers, and privacy advocates.
          </p>
          <button
            onClick={() => window.location.href = GOOGLE_AUTH_URL}
            className="px-12 py-5 bg-white text-primary-900 text-xl font-bold rounded-xl shadow-2xl hover:shadow-white/50 transform hover:scale-105 transition-all duration-200"
          >
            Get Your Free Forum Now
          </button>
          <p className="text-secondary-500 mt-6">
            No credit card. No installation. Just privacy.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-secondary-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-secondary-400">
                <li><a href="#" className="hover:text-primary-400">Forums</a></li>
                <li><a href="#" className="hover:text-primary-400">Messenger</a></li>
                <li><a href="#" className="hover:text-primary-400">Anonymous Inbox</a></li>
                <li><a href="#pricing" className="hover:text-primary-400">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Security</h4>
              <ul className="space-y-2 text-secondary-400">
                <li><a href="#" className="hover:text-primary-400">How It Works</a></li>
                <li><a href="#" className="hover:text-primary-400">Encryption</a></li>
                <li><a href="#" className="hover:text-primary-400">Anonymity</a></li>
                <li><a href={BRAND_CONFIG.github} className="hover:text-primary-400">Open Source</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-secondary-400">
                <li><a href="#" className="hover:text-primary-400">Documentation</a></li>
                <li><a href="#" className="hover:text-primary-400">User Guide</a></li>
                <li><a href="#" className="hover:text-primary-400">Security Guide</a></li>
                <li><a href="#" className="hover:text-primary-400">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-secondary-400">
                <li><a href="/privacy" className="hover:text-primary-400">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-primary-400">Terms of Service</a></li>
                <li><a href="/cookies" className="hover:text-primary-400">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-secondary-800 pt-8 text-center text-secondary-500">
            <p>&copy; 2025 SnapIT Software. Built for whistleblowers, journalists, and freedom of speech.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

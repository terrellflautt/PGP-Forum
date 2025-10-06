import React, { useState, useEffect } from 'react';

interface WelcomeOnboardingProps {
  userName: string;
  onComplete: () => void;
}

export default function WelcomeOnboarding({ userName, onComplete }: WelcomeOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  const firstName = userName?.split(' ')[0] || 'there';

  useEffect(() => {
    // Show tooltip after brief delay
    const timer = setTimeout(() => setShowTooltip(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const steps = [
    {
      title: `Welcome, ${firstName}!`,
      message: "You're all set up! Let's take a quick tour of what you can do.",
      icon: '👋',
      action: 'Start Tour',
    },
    {
      title: 'Create Your Forum',
      message: "Build encrypted communities with up to 1,500 members. It's completely free!",
      icon: '📋',
      action: 'Got it',
    },
    {
      title: 'Send Encrypted Messages',
      message: 'Private messenger with PGP encryption. Your keys never leave your device.',
      icon: '💬',
      action: 'Next',
    },
    {
      title: 'Receive Anonymous Tips',
      message: 'Share your @username publicly. Sources can send you encrypted messages anonymously.',
      icon: '📨',
      action: 'Finish Tour',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save that user has seen onboarding
      localStorage.setItem('onboarding_completed', 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    onComplete();
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl animate-slide-up">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-secondary-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-sm text-secondary-500 hover:text-secondary-700 transition-colors"
            >
              Skip tour
            </button>
          </div>
          <div className="w-full bg-secondary-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Icon */}
        <div className="text-center mb-6">
          <div className="text-7xl mb-4 animate-bounce-slow">{currentStepData.icon}</div>
          <h2 className="text-3xl font-bold text-secondary-900 mb-3">
            {currentStepData.title}
          </h2>
          <p className="text-lg text-secondary-600">
            {currentStepData.message}
          </p>
        </div>

        {/* Feature Preview Cards (for specific steps) */}
        {currentStep === 1 && (
          <div className="mb-6 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-4 border border-primary-200">
            <ul className="space-y-2 text-sm text-secondary-700">
              <li className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Unlimited forums and threads</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Categories and moderation tools</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Reputation system with upvotes</span>
              </li>
            </ul>
          </div>
        )}

        {currentStep === 2 && (
          <div className="mb-6 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-4 border border-primary-200">
            <ul className="space-y-2 text-sm text-secondary-700">
              <li className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>4096-bit RSA encryption</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Anonymous IP relay (3-5 hops)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Self-destructing messages</span>
              </li>
            </ul>
          </div>
        )}

        {currentStep === 3 && (
          <div className="mb-6 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-4 border border-primary-200">
            <p className="text-sm text-secondary-600 mb-2">Your anonymous inbox URL:</p>
            <code className="text-sm text-primary-700 font-mono bg-white px-3 py-2 rounded-lg block">
              forum.snapitsoftware.com/@your-username
            </code>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleNext}
            className="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>{currentStepData.action}</span>
            {currentStep < steps.length - 1 ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Step indicators */}
          <div className="flex justify-center space-x-2 pt-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-gradient-to-r from-primary-500 to-primary-600'
                    : 'w-2 bg-secondary-300'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

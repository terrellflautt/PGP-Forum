import React, { useState } from 'react';

interface FeedbackModalProps {
  onClose: () => void;
}

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [foundUs, setFoundUs] = useState('');
  const [useCase, setUseCase] = useState('');
  const [easeOfUse, setEaseOfUse] = useState(5);
  const [improvements, setImprovements] = useState('');
  const [nextFeatures, setNextFeatures] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: 'ebfa8f9b-ca95-40f0-abeb-23155a5a0c9c',
          name,
          email,
          subject: `User Feedback - Ease of Use: ${easeOfUse}/5`,
          message: `
=== USER FEEDBACK ===

How did you find us?
${foundUs}

What did you use us for?
${useCase}

How easy was it to use? ${easeOfUse}/5

What could be better?
${improvements}

What features/web apps do you want us to build next?
${nextFeatures}
`,
          from_name: 'SnapIT Forum Feedback Form',
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        // Clear form
        setName('');
        setEmail('');
        setFoundUs('');
        setUseCase('');
        setEaseOfUse(5);
        setImprovements('');
        setNextFeatures('');
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Feedback form error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-gradient-to-br from-[#1a0a2e]/95 to-[#0f0520]/95 backdrop-blur-xl border border-[#ff006e]/20 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl shadow-[#ff006e]/20 animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#ff006e] to-[#ff5eb3] bg-clip-text text-transparent">Share Your Feedback</h2>
            <p className="text-gray-400 mt-1">Help us improve SnapIT Forums</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#ff006e] transition-all duration-300 transform hover:scale-110 hover:rotate-90"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Success Message */}
        {submitStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg animate-fade-in">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-400 font-semibold">Thank you for your feedback! We appreciate your input.</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg animate-fade-in">
            <p className="text-red-400">Failed to submit feedback. Please try again or email us directly.</p>
          </div>
        )}

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="feedback-name" className="block text-sm font-semibold text-white mb-2">
                Your Name
              </label>
              <input
                id="feedback-name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#0a0012]/50 border border-[#ff006e]/20 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff006e]/50 focus:border-[#ff006e] transition-all duration-300"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="feedback-email" className="block text-sm font-semibold text-white mb-2">
                Your Email
              </label>
              <input
                id="feedback-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#0a0012]/50 border border-[#ff006e]/20 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff006e]/50 focus:border-[#ff006e] transition-all duration-300"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="found-us" className="block text-sm font-semibold text-white mb-2">
              1. How did you find us?
            </label>
            <input
              id="found-us"
              name="foundUs"
              type="text"
              value={foundUs}
              onChange={(e) => setFoundUs(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#0a0012]/50 border border-[#ff006e]/20 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff006e]/50 focus:border-[#ff006e] transition-all duration-300"
              placeholder="Google search, Reddit, friend recommendation, etc."
            />
          </div>

          <div>
            <label htmlFor="use-case" className="block text-sm font-semibold text-white mb-2">
              2. What did you use us for?
            </label>
            <textarea
              id="use-case"
              name="useCase"
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-3 bg-[#0a0012]/50 border border-[#ff006e]/20 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff006e]/50 focus:border-[#ff006e] transition-all duration-300 resize-none"
              placeholder="Private messaging, whistleblowing, secure forum, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              3. How easy was it to use? ({easeOfUse}/5)
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setEaseOfUse(star)}
                  className="text-3xl transition-all duration-200 hover:scale-125"
                >
                  {star <= easeOfUse ? (
                    <span className="text-[#ff006e]">★</span>
                  ) : (
                    <span className="text-gray-600">☆</span>
                  )}
                </button>
              ))}
              <span className="ml-4 text-white font-semibold">{easeOfUse} Star{easeOfUse !== 1 ? 's' : ''}</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">1 = Very difficult, 5 = Very easy</p>
          </div>

          <div>
            <label htmlFor="improvements" className="block text-sm font-semibold text-white mb-2">
              4. What could be better?
            </label>
            <textarea
              id="improvements"
              name="improvements"
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3 bg-[#0a0012]/50 border border-[#ff006e]/20 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff006e]/50 focus:border-[#ff006e] transition-all duration-300 resize-none"
              placeholder="UI improvements, missing features, bugs, performance issues, etc."
            />
          </div>

          <div>
            <label htmlFor="next-features" className="block text-sm font-semibold text-white mb-2">
              5. What web apps or features do you want us to build next?
            </label>
            <textarea
              id="next-features"
              name="nextFeatures"
              value={nextFeatures}
              onChange={(e) => setNextFeatures(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3 bg-[#0a0012]/50 border border-[#ff006e]/20 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff006e]/50 focus:border-[#ff006e] transition-all duration-300 resize-none"
              placeholder="Mobile app, file sharing, video calls, analytics dashboard, etc."
            />
          </div>

          {/* Privacy Notice */}
          <div className="bg-[#0a0012]/30 border border-[#8338ec]/20 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-[#8338ec] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-sm text-gray-400">
                Your feedback is valuable to us. We'll use it to improve our platform. Your email will only be used to follow up on your feedback if needed.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-4 bg-gradient-to-r from-[#ff006e] to-[#8338ec] hover:from-[#ff1a7f] hover:to-[#9145ff] text-white text-lg font-semibold rounded-xl shadow-lg shadow-[#ff006e]/30 hover:shadow-2xl hover:shadow-[#ff006e]/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Submitting...</span>
              </span>
            ) : (
              'Submit Feedback'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

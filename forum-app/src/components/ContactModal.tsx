import React, { useState } from 'react';

interface ContactModalProps {
  onClose: () => void;
}

export default function ContactModal({ onClose }: ContactModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
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
          subject,
          message,
          from_name: 'SnapIT Forum Contact Form',
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        // Clear form
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Contact form error:', error);
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
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#ff006e] to-[#ff5eb3] bg-clip-text text-transparent">Contact Us</h2>
            <p className="text-gray-400 mt-1">We'd love to hear from you</p>
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
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Message Sent!</h3>
                <p className="text-sm text-green-800">
                  Thank you for reaching out. We'll get back to you as soon as possible.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitStatus === 'error' && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Failed to Send</h3>
                <p className="text-sm text-red-800">
                  Something went wrong. Please try again or email us directly at snapitsoft@gmail.com
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-semibold text-white mb-2">
                Your Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-3 bg-[#0a0012]/50 border border-[#ff006e]/20 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff006e]/50 focus:border-[#ff006e] transition-all duration-300"
                placeholder="John Doe"
                style={{ fontSize: '16px' }}
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-sm font-semibold text-white mb-2">
                Your Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#0a0012]/50 border border-[#ff006e]/20 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff006e]/50 focus:border-[#ff006e] transition-all duration-300"
                placeholder="you@example.com"
                style={{ fontSize: '16px' }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="contact-subject" className="block text-sm font-semibold text-white mb-2">
              Subject
            </label>
            <input
              id="contact-subject"
              name="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#0a0012]/50 border border-[#ff006e]/20 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff006e]/50 focus:border-[#ff006e] transition-all duration-300"
              placeholder="How can we help?"
              style={{ fontSize: '16px' }}
            />
          </div>

          <div>
            <label htmlFor="contact-message" className="block text-sm font-semibold text-white mb-2">
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={6}
              className="w-full px-4 py-3 bg-[#0a0012]/50 border border-[#ff006e]/20 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff006e]/50 focus:border-[#ff006e] transition-all duration-300 resize-none"
              placeholder="Tell us what's on your mind..."
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Privacy Notice */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-primary-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-sm text-primary-900">
                <strong>Privacy Protected:</strong> Your contact information is sent securely via Web3Forms and will only be used to respond to your inquiry.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-4 min-h-[52px] bg-gradient-to-r from-[#ff006e] to-[#8338ec] hover:from-[#ff1a7f] hover:to-[#9145ff] text-white text-lg font-semibold rounded-xl shadow-lg shadow-[#ff006e]/30 hover:shadow-2xl hover:shadow-[#ff006e]/50 transform hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Sending...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <span>Send Message</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </span>
            )}
          </button>
        </form>

        {/* Alternative Contact Info */}
        <div className="mt-6 pt-6 border-t border-secondary-200">
          <p className="text-sm text-secondary-600 text-center">
            Prefer email? Reach us at{' '}
            <span className="font-semibold text-primary-600">snapitsoft@gmail.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}

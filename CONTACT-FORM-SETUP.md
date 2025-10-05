# 📧 Contact/Feedback Form Setup

**Service**: Web3Forms
**Access Key**: `941dde05-6699-4793-b170-fb81b1659e32`
**Purpose**: Contact form submissions without backend infrastructure

---

## 🎯 Overview

Web3Forms allows form submissions to be sent to your email without needing a backend server. Perfect for contact/feedback forms.

---

## 🔧 Implementation

### Option 1: Add to Landing Page Footer

Edit `forum-app/src/components/LandingPage.tsx` and add a contact section:

```tsx
{/* Contact Section */}
<div className="py-24 bg-secondary-900">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="max-w-3xl mx-auto text-center mb-12">
      <h2 className="text-4xl font-bold text-white mb-4">
        Get in Touch
      </h2>
      <p className="text-xl text-secondary-300">
        Have questions? Need help? We're here for you.
      </p>
    </div>

    <form
      action="https://api.web3forms.com/submit"
      method="POST"
      className="max-w-xl mx-auto"
    >
      {/* Web3Forms Access Key */}
      <input
        type="hidden"
        name="access_key"
        value="941dde05-6699-4793-b170-fb81b1659e32"
      />

      {/* Honeypot Spam Protection */}
      <input
        type="checkbox"
        name="botcheck"
        className="hidden"
        style={{ display: 'none' }}
      />

      {/* Redirect after submission */}
      <input
        type="hidden"
        name="redirect"
        value="https://forum.snapitsoftware.com/?contact=success"
      />

      {/* Form Fields */}
      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            className="w-full px-4 py-3 bg-secondary-800 border border-secondary-700 rounded-lg text-white placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            className="w-full px-4 py-3 bg-secondary-800 border border-secondary-700 rounded-lg text-white placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
            Message
          </label>
          <textarea
            name="message"
            id="message"
            rows={5}
            required
            className="w-full px-4 py-3 bg-secondary-800 border border-secondary-700 rounded-lg text-white placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="How can we help you?"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-primary-500/50 transform hover:scale-105 transition-all duration-200"
        >
          Send Message
        </button>
      </div>
    </form>
  </div>
</div>
```

---

### Option 2: Dedicated Contact Page Component

Create `forum-app/src/components/ContactView.tsx`:

```tsx
import React, { useState } from 'react';

export default function ContactView() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(form)
      });

      if (response.ok) {
        setSubmitted(true);
        form.reset();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 pt-16 pl-64">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-secondary-900 mb-4">
          Contact Us
        </h1>
        <p className="text-lg text-secondary-600 mb-8">
          Have questions or feedback? We'd love to hear from you.
        </p>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-green-900 mb-2">
              Message Sent!
            </h3>
            <p className="text-green-700">
              We'll get back to you as soon as possible.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
            {/* Web3Forms Access Key */}
            <input
              type="hidden"
              name="access_key"
              value="941dde05-6699-4793-b170-fb81b1659e32"
            />

            {/* Honeypot */}
            <input
              type="checkbox"
              name="botcheck"
              className="hidden"
            />

            {/* Custom Subject */}
            <input
              type="hidden"
              name="subject"
              value="New SnapIT Forum Contact Form Submission"
            />

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="billing">Billing Question</option>
                  <option value="feedback">Feedback</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  rows={6}
                  required
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Tell us more..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-primary-500/50 transform hover:scale-105 transition-all duration-200"
              >
                Send Message
              </button>
            </div>
          </form>
        )}

        {/* Alternative Contact Methods */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-2">📧</div>
            <h3 className="font-semibold text-secondary-900 mb-1">Email</h3>
            <a href="mailto:snapitsaas@gmail.com" className="text-primary-600 hover:underline">
              snapitsaas@gmail.com
            </a>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-2">💻</div>
            <h3 className="font-semibold text-secondary-900 mb-1">GitHub</h3>
            <a
              href="https://github.com/terrellflautt/PGP-Forum/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              Report an Issue
            </a>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-2">📚</div>
            <h3 className="font-semibold text-secondary-900 mb-1">Docs</h3>
            <a
              href="https://github.com/terrellflautt/PGP-Forum"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### Option 3: Add to Sidebar Menu

Edit `forum-app/src/components/Sidebar.tsx`:

```tsx
const menuItems = [
  { id: 'forums', label: 'Forums', icon: '📋', badge: null },
  { id: 'messenger', label: 'Messenger', icon: '💬', badge: '3' },
  { id: 'anonymous-inbox', label: 'Anonymous Inbox', icon: '📨', badge: '1' },
  { id: 'deadman', label: 'Dead Man\'s Switch', icon: '⏰', badge: null },
  { id: 'contact', label: 'Contact Support', icon: '💬', badge: null }, // NEW
  { id: 'settings', label: 'Settings', icon: '⚙️', badge: null },
];
```

---

## 🎨 Footer Link

Update `LandingPage.tsx` footer to include contact link:

```tsx
<div>
  <h4 className="font-semibold text-white mb-4">Legal</h4>
  <ul className="space-y-2 text-secondary-400">
    <li><a href="/privacy.html" className="hover:text-primary-400">Privacy Policy</a></li>
    <li><a href="/terms.html" className="hover:text-primary-400">Terms of Service</a></li>
    <li><a href="#contact" className="hover:text-primary-400">Contact Us</a></li>
    <li><a href="mailto:snapitsaas@gmail.com" className="hover:text-primary-400">snapitsaas@gmail.com</a></li>
  </ul>
</div>
```

---

## ⚙️ Web3Forms Configuration

### Dashboard Access
https://web3forms.com/

### Features Included
- ✅ Email notifications
- ✅ Spam protection (honeypot)
- ✅ File uploads (if needed)
- ✅ Custom redirects
- ✅ Webhook support
- ✅ Email replies

### Email Settings
Configure where submissions go:
1. Login to Web3Forms
2. Go to Access Key: `941dde05-6699-4793-b170-fb81b1659e32`
3. Set email to: `snapitsaas@gmail.com`

### Custom Email Template
```html
Subject: New Contact Form Submission from {{name}}

Name: {{name}}
Email: {{email}}
Category: {{category}}

Message:
{{message}}

---
Sent from: SnapIT Forum Contact Form
Time: {{timestamp}}
```

---

## 🧪 Testing

### Test Submission
```bash
curl -X POST https://api.web3forms.com/submit \
  -H "Content-Type: application/json" \
  -d '{
    "access_key": "941dde05-6699-4793-b170-fb81b1659e32",
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message"
  }'
```

### Expected Response
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

---

## 🔒 Security Features

### Spam Protection
```html
<!-- Honeypot field (bots will fill this, humans won't see it) -->
<input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />
```

### Rate Limiting
Web3Forms automatically limits submissions per IP to prevent abuse.

### Email Validation
Built-in email validation on the server side.

---

## 📊 Analytics

### Track Submissions
Add hidden fields for tracking:

```html
<input type="hidden" name="page" value="landing_page" />
<input type="hidden" name="utm_source" value="organic" />
```

### Google Analytics Event
```javascript
// On form submission success
gtag('event', 'form_submission', {
  'event_category': 'Contact',
  'event_label': 'Landing Page Form'
});
```

---

## 🎯 Recommended Implementation

**Best approach**: Add contact form to footer of `LandingPage.tsx`

**Why**:
- Users can contact you before signing up
- Visible on main page
- No extra routing needed
- Clean user experience

**Estimated time**: 10-15 minutes

---

## 🚀 Quick Deploy

1. Add contact form to `LandingPage.tsx` (see Option 1)
2. Rebuild frontend:
   ```bash
   cd forum-app && npm run build
   ```
3. Deploy:
   ```bash
   aws s3 sync build/ s3://snapit-forum-static/ --delete
   aws cloudfront create-invalidation --distribution-id E1X8SJIRPSICZ4 --paths "/*"
   ```
4. Test at: https://forum.snapitsoftware.com

---

**Access Key**: `941dde05-6699-4793-b170-fb81b1659e32`
**Destination**: snapitsaas@gmail.com
**Status**: Ready to use ✅

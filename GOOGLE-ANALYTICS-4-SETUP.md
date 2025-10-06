# Google Analytics 4 (GA4) Setup Guide

**Platform**: SnapIT Forums
**Goal**: Track complete conversion funnel from landing → paid subscriber
**Last Updated**: October 5, 2025

---

## Why Google Analytics 4?

**Benefits:**
- Free forever (no data limits)
- Real-time analytics
- E-commerce tracking built-in
- Funnel visualization
- Cross-device tracking
- GDPR compliant
- Integration with Google Ads
- Machine learning insights

**What We'll Track:**
1. Page views (landing, pricing, features)
2. User interactions (sign in click, upgrade click)
3. Conversions (signup, forum created, subscription purchased)
4. E-commerce events (checkout initiated, purchase completed)

---

## Step 1: Create GA4 Property

### 1.1 Access Google Analytics

1. Go to: https://analytics.google.com
2. Sign in with Google account
3. Click "Admin" (bottom left)

### 1.2 Create New Property

1. Click "+ Create Property"
2. Enter property details:
   ```
   Property name: SnapIT Forums
   Time zone: (Your timezone)
   Currency: USD
   ```
3. Click "Next"

### 1.3 Configure Business Details

1. Industry category: "Technology"
2. Business size: "Small (1-10 employees)" or appropriate
3. Usage intent:
   - ☑ Measure customer engagement
   - ☑ Measure advertising effectiveness
   - ☑ Optimize your product or service
4. Click "Create"

### 1.4 Accept Terms of Service

1. Read and accept Terms of Service
2. Click "I Accept"

### 1.5 Get Measurement ID

1. You'll see "Web stream details"
2. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)
3. Save this for next step

**Example:** `G-AB12CD34EF`

---

## Step 2: Install GA4 on Frontend

### 2.1 Add GA4 Script to index.html

Edit `/mnt/c/Users/decry/Desktop/snapit-forum/forum-app/public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="SnapIT Forums - Zero-Knowledge Community Platform"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>SnapIT Forums - Privacy-First Communities</title>
    
    <!-- Google tag (gtag.js) - REPLACE G-XXXXXXXXXX WITH YOUR ID -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX', {
        'send_page_view': false // We'll track manually
      });
    </script>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

**Important:** Replace `G-XXXXXXXXXX` with your actual Measurement ID!

---

## Step 3: Add TypeScript Type Definitions

### 3.1 Create analytics types file

Create `/mnt/c/Users/decry/Desktop/snapit-forum/forum-app/src/types/gtag.d.ts`:

```typescript
// Google Analytics gtag.js type definitions

interface GtagCommands {
  'config': [targetId: string, config?: object];
  'set': [config: object];
  'event': [eventName: string, eventParams?: object];
}

declare global {
  interface Window {
    dataLayer: any[];
    gtag: <Command extends keyof GtagCommands>(
      command: Command,
      ...args: GtagCommands[Command]
    ) => void;
  }
}

export {};
```

### 3.2 Create analytics utility

Create `/mnt/c/Users/decry/Desktop/snapit-forum/forum-app/src/utils/analytics.ts`:

```typescript
// Google Analytics 4 tracking utilities

export const trackPageView = (path: string, title: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
      page_location: window.location.href
    });
    console.log('[GA4] Page view:', path, title);
  }
};

export const trackSignInClick = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'login_attempt', {
      method: 'google',
      event_category: 'engagement',
      event_label: 'sign_in_button'
    });
    console.log('[GA4] Sign in click');
  }
};

export const trackSignUp = (userId: string, method: string = 'google') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'sign_up', {
      method: method,
      user_id: userId
    });
    console.log('[GA4] Sign up:', userId);
  }
};

export const trackForumCreated = (forumId: string, forumName: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'forum_created', {
      event_category: 'engagement',
      event_label: forumName,
      forum_id: forumId
    });
    console.log('[GA4] Forum created:', forumId, forumName);
  }
};

export const trackUpgradeClick = (tier: string) => {
  const prices: Record<string, number> = {
    pro: 99,
    business: 499,
    enterprise: 299
  };

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'USD',
      value: prices[tier] || 0,
      items: [{
        item_id: tier,
        item_name: `SnapIT Forum ${tier}`,
        item_category: 'subscription',
        price: prices[tier] || 0,
        quantity: 1
      }]
    });
    console.log('[GA4] Upgrade click:', tier);
  }
};

export const trackPurchase = (
  tier: string,
  transactionId: string,
  revenue: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      currency: 'USD',
      value: revenue,
      items: [{
        item_id: tier,
        item_name: `SnapIT Forum ${tier}`,
        item_category: 'subscription',
        price: revenue,
        quantity: 1
      }]
    });
    console.log('[GA4] Purchase:', tier, revenue);
  }
};

export const trackCancelSubscription = (tier: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'cancel_subscription', {
      event_category: 'engagement',
      event_label: tier,
      tier: tier
    });
    console.log('[GA4] Cancel subscription:', tier);
  }
};
```

---

## Step 4: Integrate Tracking into Components

### 4.1 Track Page Views in App.tsx

Add to `forum-app/src/App.tsx`:

```typescript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from './utils/analytics';

function App() {
  const location = useLocation();

  // Track page views on route change
  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location]);

  // ... rest of component
}
```

### 4.2 Track Sign In Click in LoginModal.tsx

Add to `forum-app/src/components/LoginModal.tsx`:

```typescript
import { trackSignInClick } from '../utils/analytics';

const handleGoogleSignIn = () => {
  trackSignInClick();
  window.location.href = GOOGLE_AUTH_URL;
};
```

### 4.3 Track Sign Up in Auth Callback

Add to `forum-app/src/App.tsx` (OAuth callback handler):

```typescript
import { trackSignUp } from './utils/analytics';

// After successful OAuth
useEffect(() => {
  if (user && !hasTrackedSignup.current) {
    trackSignUp(user.userId, 'google');
    hasTrackedSignup.current = true;
  }
}, [user]);
```

### 4.4 Track Forum Creation

Add to the component that handles forum creation:

```typescript
import { trackForumCreated } from '../utils/analytics';

const handleForumCreated = async (forumData: any) => {
  // ... create forum logic
  
  if (response.forumId) {
    trackForumCreated(response.forumId, response.name);
  }
};
```

### 4.5 Track Upgrade Clicks in SettingsView.tsx

Add to `forum-app/src/components/SettingsView.tsx`:

```typescript
import { trackUpgradeClick } from '../utils/analytics';

const handleUpgradeClick = async (tier: string) => {
  trackUpgradeClick(tier);
  
  // ... existing checkout logic
};
```

### 4.6 Track Purchase Success

Add to success page or App.tsx:

```typescript
import { trackPurchase } from '../utils/analytics';
import { useSearchParams } from 'react-router-dom';

const [searchParams] = useSearchParams();

useEffect(() => {
  if (searchParams.get('upgrade') === 'success') {
    const tier = searchParams.get('tier');
    const prices: Record<string, number> = {
      pro: 99,
      business: 499,
      enterprise: 299
    };
    
    if (tier) {
      trackPurchase(
        tier,
        `txn_${Date.now()}`,
        prices[tier] || 0
      );
    }
  }
}, [searchParams]);
```

---

## Step 5: Enable Enhanced Measurement

### 5.1 Configure Data Streams

1. Go to GA4 Admin > Data Streams
2. Click on your Web stream
3. Enable "Enhanced measurement"
4. Ensure these are enabled:
   - ☑ Page views
   - ☑ Scrolls
   - ☑ Outbound clicks
   - ☑ Site search
   - ☑ Video engagement
   - ☑ File downloads

---

## Step 6: Create Custom Conversions

### 6.1 Access Conversions

1. Go to Admin > Events
2. Click "Create event"

### 6.2 Create Conversion Events

Create these custom events as conversions:

**Event 1: sign_up**
- Mark as conversion
- Tracks user registration

**Event 2: forum_created**
- Mark as conversion
- Tracks activation (key metric!)

**Event 3: purchase**
- Already marked as conversion by default
- Tracks paid subscriptions

**Event 4: begin_checkout**
- Mark as conversion
- Tracks upgrade intent

---

## Step 7: Create Exploration Reports

### 7.1 Funnel Exploration

1. Go to Explore > Funnel exploration
2. Create funnel:
   ```
   Step 1: page_view (landing page)
   Step 2: login_attempt
   Step 3: sign_up
   Step 4: forum_created
   Step 5: begin_checkout
   Step 6: purchase
   ```
3. Save as "Conversion Funnel"

### 7.2 E-commerce Report

1. Go to Reports > Monetization > Ecommerce purchases
2. See purchase data, revenue, items purchased

---

## Step 8: Set Up Audiences

### 8.1 Create Audience: "Free Tier Users"

1. Go to Admin > Audiences
2. Create new audience:
   - Name: "Free Tier Users"
   - Condition: `event_name = forum_created AND event_name != purchase`
   - Lookback: 30 days

### 8.2 Create Audience: "Upgrade Intent"

1. Create new audience:
   - Name: "Upgrade Intent"
   - Condition: `event_name = begin_checkout AND event_name != purchase`
   - Lookback: 7 days

### 8.3 Create Audience: "Paying Customers"

1. Create new audience:
   - Name: "Paying Customers"
   - Condition: `event_name = purchase`
   - Lookback: 90 days

---

## Step 9: Link to Google Ads (Optional)

If running paid ads:

1. Go to Admin > Google Ads Links
2. Click "Link"
3. Select Google Ads account
4. Enable auto-tagging
5. Import conversions to Google Ads

**Benefits:**
- Track ad performance
- Optimize for conversions
- See ROI per campaign

---

## Step 10: Verify Installation

### 10.1 Use GA4 DebugView

1. Go to Admin > DebugView
2. Install Chrome extension: "Google Analytics Debugger"
3. Visit your site with extension enabled
4. See real-time events in DebugView

### 10.2 Test Each Event

1. **Page view**: Load homepage
2. **login_attempt**: Click "Sign In"
3. **sign_up**: Complete OAuth
4. **forum_created**: Create a forum
5. **begin_checkout**: Click "Upgrade"
6. **purchase**: Complete checkout (use test mode!)

### 10.3 Verify in Realtime Report

1. Go to Reports > Realtime
2. Perform actions on site
3. See events appear within 30 seconds

---

## Conversion Funnel Metrics

### Expected Results (Industry Benchmarks)

```
Landing Page Views:     10,000
↓ 3% conversion
Sign In Clicks:         300
↓ 90% completion
Sign Ups:               270
↓ 60% activation
Forums Created:         162
↓ 10% upgrade intent
Upgrade Clicks:         16
↓ 50% completion
Purchases:              8

Overall Conversion:     0.08% (8 / 10,000)
Activation Rate:        60% (162 / 270)
Purchase Rate:          5% (8 / 162)
```

### How to Improve

**Improve Landing → Sign In (Target: 5%)**
- Add social proof
- Show value proposition clearly
- Reduce friction

**Improve Sign Up → Forum Created (Target: 80%)**
- Streamline onboarding
- Add guided tour
- Show examples

**Improve Forum Created → Purchase (Target: 3%)**
- Highlight upgrade benefits
- Show usage limits
- Offer trial or discount

---

## Privacy & GDPR Compliance

### 10.1 Update Privacy Policy

Add to privacy policy:

```
We use Google Analytics to analyze website usage and improve user experience.
Google Analytics may collect:
- Pages viewed
- Time on site
- Device and browser information
- Geographic location (city level)

We do NOT track personally identifiable information (PII) without consent.

You can opt out: https://tools.google.com/dlpage/gaoptout
```

### 10.2 Cookie Consent (Optional)

If targeting EU users, add cookie consent banner:

```typescript
// forum-app/src/components/CookieConsent.tsx
import { useState, useEffect } from 'react';

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('ga_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('ga_consent', 'granted');
    setShowBanner(false);
    
    // Grant consent to GA4
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <p className="text-sm">
          We use cookies to improve your experience. 
          <a href="/privacy" className="underline ml-1">Learn more</a>
        </p>
        <button
          onClick={acceptCookies}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Accept
        </button>
      </div>
    </div>
  );
};
```

---

## Troubleshooting

### Events Not Appearing

1. Check browser console for errors
2. Verify Measurement ID is correct
3. Check ad blockers (disable for testing)
4. Use DebugView to see raw events

### Duplicate Events

1. Check for multiple gtag() calls
2. Ensure `send_page_view: false` in config
3. Track manually instead of auto

### Wrong Conversion Values

1. Verify price mapping is correct
2. Check currency is set to USD
3. Ensure `value` field is a number

---

## Next Steps After Setup

1. ✅ Install GA4 tracking code
2. ✅ Add tracking to all key events
3. ✅ Test in DebugView
4. ✅ Create conversion events
5. ✅ Set up funnel exploration
6. ⏳ Monitor for 1 week to establish baseline
7. ⏳ Set up weekly reports
8. ⏳ Create A/B tests based on data
9. ⏳ Optimize low-performing funnel steps
10. ⏳ Scale traffic once funnel is optimized

---

## Useful Links

- **GA4 Dashboard**: https://analytics.google.com
- **DebugView**: Admin > DebugView
- **Realtime Report**: Reports > Realtime
- **Conversions**: Admin > Events (mark as conversion)
- **Audiences**: Admin > Audiences
- **GA4 Documentation**: https://support.google.com/analytics/answer/10089681

---

**Status**: Ready to implement
**Time to Setup**: 1-2 hours
**Next Review**: After 1 week of data collection


// API Configuration
export const API_BASE_URL = 'https://api.snapitsoftware.com';

// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = '242648112266-iglul54tuis9mhucsp1pmpqg0a48l8i0.apps.googleusercontent.com';
export const GOOGLE_AUTH_URL = 'https://auth.snapitsoftware.com/auth/google'; // Use custom domain

// Stripe Configuration
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SEhKnEn5tPJtShN6vDBKCkJ7duYQyEuGTW2pefHTrrz2Ap3haoD5jPqHupI2JwYa8cHkerbAny8zWoaHTjb72Ge00Yt8YykcF';

// Free Tier Configuration
export const FREE_TIER_USER_LIMIT = 1500;

// Pricing Tiers
export const PRICING_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    users: 1500,
    features: [
      'Up to 1,500 users',
      'PGP encrypted messaging',
      'Anonymous relay (WebRTC)',
      'Basic forums',
      'Community support',
      'Dead man\'s switch',
      'Anonymous inbox'
    ]
  },
  pro: {
    name: 'Pro',
    price: 29,
    users: 10000,
    features: [
      'Up to 10,000 users',
      'Everything in Free',
      'Custom domain',
      'Advanced moderation',
      'API access',
      'Email support',
      'Custom branding'
    ]
  },
  business: {
    name: 'Business',
    price: 99,
    users: 50000,
    features: [
      'Up to 50,000 users',
      'Everything in Pro',
      'White-label',
      'SSO/SAML',
      'Advanced analytics',
      'Priority support',
      'SLA guarantee'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 299,
    users: 999999,
    features: [
      'Unlimited users',
      'Everything in Business',
      'Dedicated infrastructure',
      'Custom integrations',
      'Account manager',
      '24/7 phone support',
      '99.99% uptime SLA'
    ]
  }
};

// Security Configuration
export const SECURITY_CONFIG = {
  // PGP
  rsaKeySize: 4096,
  keyExtractable: false,

  // Anonymous Relay
  minRelayHops: 3,
  maxRelayHops: 5,
  anonymousModeDefault: true,

  // Ephemeral Messages
  defaultExpiry: 3600000, // 1 hour
  maxExpiry: 2592000000, // 30 days
  shredPasses: 7, // DoD 5220.22-M standard

  // File Transfers
  maxFileSize: 5242880, // 5MB
  allowedFileTypes: [
    'text/plain',
    'application/pdf',
    'application/json',
    'application/pgp-encrypted'
  ],

  // Dead Man's Switch
  minCheckInInterval: 24, // hours
  defaultCheckInInterval: 72, // hours
  maxCheckInInterval: 168 // hours (1 week)
};

// Brand Configuration
export const BRAND_CONFIG = {
  name: 'SnapIT Forums',
  tagline: 'Zero-Knowledge Community Platform',
  description: 'Secure, private, and anonymous forums with PGP encryption',
  website: 'https://forum.snapitsoftware.com',
  parentSite: 'https://snapitsoftware.com',
  github: 'https://github.com/terrellflautt/PGP-Forum',
  support: 'support@snapitsoftware.com'
};

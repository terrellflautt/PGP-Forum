# Onboarding Flow Diagram - Visual Reference

## Complete User Journey (Target: <60 seconds)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OPTIMIZED ONBOARDING FLOW                            │
│                        (Landing to First Action: ~45s)                       │
└─────────────────────────────────────────────────────────────────────────────┘

START: User lands on homepage (0s)
   │
   ├─> View: LandingPage.tsx
   │   ├─> Hero section with value proposition
   │   ├─> "Start Your Free Forum" CTA button
   │   └─> Analytics: LANDING_VIEW
   │
   ↓ User clicks "Sign In" (3s)
   │
   ├─> Analytics: LANDING_SIGN_IN_CLICK
   │
   ↓ Opens Google OAuth popup (3-8s)
   │
   ├─> Analytics: AUTH_GOOGLE_START
   │   ├─> Success → AUTH_GOOGLE_SUCCESS
   │   └─> Failure → AUTH_GOOGLE_FAILURE (show error, retry)
   │
   ↓ Redirect with token (8-11s)
   │
   ├─> App.tsx: Fetch user data from API
   │   ├─> Decode JWT token
   │   ├─> GET /users/{userId}
   │   └─> Store user in localStorage
   │
   ↓ Check if username exists (11-13s)
   │
   ├─> Decision: Has username?
   │   ├─> YES → Skip to Dashboard (returning user)
   │   └─> NO → Continue to Username Setup (new user)
   │
   ↓ NEW USER: Username Setup Screen (13s)
   │
   ├─> View: UsernameSetup.tsx
   │   ├─> Analytics: USERNAME_VIEW
   │   │
   │   ├─> AUTO-GENERATE SUGGESTION ✨
   │   │   ├─> Extract name from Google: "John Smith"
   │   │   ├─> Convert to username: "john-smith"
   │   │   ├─> Pre-fill input field
   │   │   └─> Analytics: USERNAME_SUGGESTION_SHOWN
   │   │
   │   ├─> AUTO-CHECK AVAILABILITY ✨
   │   │   ├─> API: GET /users/check-username?username=john-smith
   │   │   ├─> Response: { available: true }
   │   │   ├─> Show green checkmark ✓
   │   │   └─> Analytics: USERNAME_AVAILABLE
   │   │
   │   ├─> DISPLAY UI ELEMENTS
   │   │   ├─> Progress bar: "Step 2 of 2" (100%)
   │   │   ├─> Green banner: "We pre-filled a suggestion for you"
   │   │   ├─> Input field with suggestion: @john-smith ✓
   │   │   ├─> Character counter: "10 characters"
   │   │   ├─> Time estimate: "Less than 30 seconds remaining"
   │   │   └─> Button: "Continue to Your Forum" (enabled!)
   │   │
   │   └─> USER ACTIONS
   │       ├─> Option A: Click "Continue" immediately (most users) ✨
   │       │   └─> Analytics: USERNAME_SUGGESTION_ACCEPTED
   │       │
   │       ├─> Option B: Type custom username
   │       │   ├─> Real-time validation as they type
   │       │   ├─> Analytics: USERNAME_MANUAL_ENTRY
   │       │   └─> Check availability on blur
   │       │
   │       └─> Option C: Click "Randomize" button
   │           ├─> Generate: "shadow-journalist-742"
   │           ├─> Analytics: USERNAME_RANDOMIZE_CLICK
   │           └─> Auto-check availability
   │
   ↓ User clicks "Continue to Your Forum" (15s)
   │
   ├─> API: PUT /users/me/username { username: "john-smith" }
   │   ├─> Success → USERNAME_SUBMIT_SUCCESS
   │   └─> Failure → USERNAME_SUBMIT_FAILURE (show error)
   │
   ↓ Username created successfully (17s)
   │
   ├─> Update user object in state
   ├─> Update localStorage
   └─> Trigger celebration flow
   │
   ↓ CELEBRATION MODAL APPEARS ✨ (17s)
   │
   ├─> View: CelebrationModal.tsx (type: 'username')
   │   ├─> Analytics: CELEBRATION_VIEW
   │   │
   │   ├─> CONFETTI ANIMATION 🎉
   │   │   ├─> 50 colored particles
   │   │   ├─> 3-second duration
   │   │   └─> Random colors (primary palette)
   │   │
   │   ├─> CONTENT
   │   │   ├─> Icon: 🎉
   │   │   ├─> Title: "Your username is reserved!"
   │   │   ├─> Message: "You're now @john-smith..."
   │   │   ├─> Profile URL: forum.snapitsoftware.com/@john-smith
   │   │   └─> "What's Next?" checklist
   │   │
   │   └─> ACTIONS
   │       ├─> Button 1: "Continue to Dashboard" (primary)
   │       └─> Button 2: "Copy Profile Link"
   │           └─> Analytics: CELEBRATION_COPY_LINK
   │
   ↓ User clicks "Continue" or auto-close after 4s (21s)
   │
   ├─> Check: Has user seen onboarding?
   │   ├─> localStorage.getItem('onboarding_completed')
   │   ├─> YES → Go straight to Dashboard
   │   └─> NO → Show Welcome Onboarding
   │
   ↓ WELCOME ONBOARDING TOUR (21s)
   │
   ├─> View: WelcomeOnboarding.tsx
   │   ├─> Analytics: WELCOME_VIEW
   │   │
   │   ├─> STEP 1/4: Welcome (23s)
   │   │   ├─> Icon: 👋
   │   │   ├─> Title: "Welcome, John!"
   │   │   ├─> Message: "You're all set up! Let's take a quick tour."
   │   │   ├─> Progress: 25% (1 of 4)
   │   │   ├─> Button: "Start Tour"
   │   │   └─> Top-right: "Skip tour" link
   │   │
   │   ├─> STEP 2/4: Create Forums (28s)
   │   │   ├─> Icon: 📋
   │   │   ├─> Title: "Create Your Forum"
   │   │   ├─> Message: "Build encrypted communities..."
   │   │   ├─> Feature preview card:
   │   │   │   ✓ Unlimited forums and threads
   │   │   │   ✓ Categories and moderation
   │   │   │   ✓ Reputation system
   │   │   ├─> Progress: 50% (2 of 4)
   │   │   └─> Button: "Got it"
   │   │
   │   ├─> STEP 3/4: Encrypted Messaging (33s)
   │   │   ├─> Icon: 💬
   │   │   ├─> Title: "Send Encrypted Messages"
   │   │   ├─> Message: "Private messenger with PGP..."
   │   │   ├─> Feature preview card:
   │   │   │   ✓ 4096-bit RSA encryption
   │   │   │   ✓ Anonymous IP relay
   │   │   │   ✓ Self-destructing messages
   │   │   ├─> Progress: 75% (3 of 4)
   │   │   └─> Button: "Next"
   │   │
   │   ├─> STEP 4/4: Anonymous Inbox (38s)
   │   │   ├─> Icon: 📨
   │   │   ├─> Title: "Receive Anonymous Tips"
   │   │   ├─> Message: "Share your @username publicly..."
   │   │   ├─> Profile URL preview card
   │   │   ├─> Progress: 100% (4 of 4)
   │   │   └─> Button: "Finish Tour"
   │   │
   │   └─> USER ACTIONS
   │       ├─> Complete all steps → WELCOME_COMPLETE
   │       └─> Click "Skip tour" → WELCOME_SKIP
   │
   ↓ User completes tour or skips (40s)
   │
   ├─> Set: localStorage.setItem('onboarding_completed', 'true')
   └─> Navigate to Dashboard
   │
   ↓ DASHBOARD LOADED (40s)
   │
   ├─> View: ForumView.tsx
   │   ├─> Analytics: FIRST_FORUM_VIEW
   │   │
   │   ├─> HEADER
   │   │   ├─> Welcome message: "Welcome back, John!"
   │   │   └─> Primary CTA: "+ New Thread" button ✨
   │   │       └─> PULSE ANIMATION (for first-time users)
   │   │
   │   ├─> CONTEXTUAL TOOLTIPS (optional, future)
   │   │   ├─> Tooltip on "+ New Thread" button:
   │   │   │   "Create your first thread to start building your community"
   │   │   └─> Dismiss: "Got it!"
   │   │
   │   └─> EMPTY STATE
   │       ├─> Icon: 📋
   │       ├─> Message: "No threads yet"
   │       ├─> CTA: "Be the first to start a discussion!"
   │       └─> Button: "Create First Thread"
   │
   ↓ User clicks "+ New Thread" (45s)
   │
   ├─> Analytics: FIRST_THREAD_CREATE
   ├─> Open thread composer modal
   └─> User types first message
   │
   ↓ FIRST ACTION COMPLETED! 🎉 (50-60s)
   │
   └─> END OF ONBOARDING FUNNEL
       ├─> Analytics: Calculate time-to-value
       ├─> Total time: ~45-60 seconds ✅
       └─> User is now ACTIVE and ENGAGED


═══════════════════════════════════════════════════════════════════════════════
                              ALTERNATIVE PATHS
═══════════════════════════════════════════════════════════════════════════════

PATH A: POWER USER (Skips tour)
├─> Username setup (15s)
├─> Click "Continue"
├─> See celebration modal (2s)
├─> Click "Skip tour" immediately
└─> Dashboard (20s total) ⚡ FASTEST PATH

PATH B: RETURNING USER
├─> OAuth redirect (10s)
├─> Username already exists
├─> Skip username setup
├─> Skip welcome tour (already completed)
└─> Dashboard immediately (10s total) ⚡ INSTANT

PATH C: USERNAME TAKEN
├─> Auto-suggestion fails (not available)
├─> Show red X icon
├─> Suggest alternative: "john-smith-2"
├─> User modifies or accepts
└─> Continue flow (+5-10s penalty)

PATH D: OAUTH FAILURE
├─> Google OAuth fails/cancelled
├─> Show error modal: "Sign-in was cancelled"
├─> Button: "Try Again"
└─> Return to landing page

PATH E: MOBILE USER
├─> All screens full-height (no distractions)
├─> Larger touch targets (44px minimum)
├─> Auto-focus disabled (no keyboard jump)
├─> Swipe gestures for welcome tour
└─> Same flow, mobile-optimized UX


═══════════════════════════════════════════════════════════════════════════════
                           ANALYTICS FUNNEL STEPS
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────┐
│ STEP                          │ EVENT                           │
├───────────────────────────────┼─────────────────────────────────┤
│ 1. Landing Page View          │ LANDING_VIEW                    │
│ 2. Sign In Click              │ LANDING_SIGN_IN_CLICK          │
│ 3. OAuth Start                │ AUTH_GOOGLE_START               │
│ 4. OAuth Success              │ AUTH_GOOGLE_SUCCESS             │
│ 5. Username View              │ funnel:username_view            │
│ 6. Username Created           │ funnel:username_created         │
│ 7. Celebration View           │ CELEBRATION_VIEW                │
│ 8. Welcome Tour Start         │ funnel:welcome_tour_start       │
│ 9. Welcome Tour Complete      │ funnel:welcome_tour_complete    │
│ 10. First Forum View          │ funnel:first_forum_view         │
│ 11. First Thread Create       │ funnel:first_thread_create      │
└───────────────────────────────┴─────────────────────────────────┘

EXPECTED CONVERSION RATES (TARGETS):
├─> Landing → Sign In: 30-40%
├─> Sign In → OAuth Success: 85-90%
├─> OAuth → Username Created: 90-95% ✨ (Smart defaults help!)
├─> Username → Welcome Tour: 95-98%
├─> Welcome Tour → Complete: 60-70% (skip option)
└─> Complete → First Thread: 40-50%

HIGHEST EXPECTED DROPOFF POINTS:
├─> Landing → Sign In (decision to commit)
├─> Welcome Tour (skip option)
└─> First Thread (content creation barrier)


═══════════════════════════════════════════════════════════════════════════════
                              SUCCESS METRICS
═══════════════════════════════════════════════════════════════════════════════

TIME-TO-VALUE BENCHMARKS:
├─> Landing → Sign In Click: <5s ✅
├─> OAuth Complete: <10s ✅
├─> Username Created: <20s ✅
├─> Welcome Tour Complete: <45s ✅
└─> First Thread Created: <60s ✅ TARGET ACHIEVED

CONVERSION RATE GOALS:
├─> Sign In → Username Created: >85%
├─> Username → First Action: >40%
└─> Overall Landing → Active: >15%

USER SATISFACTION:
├─> "Easy to use" rating: >8/10
├─> "Clear what to do next": >9/10
├─> Would recommend: >80%
└─> Support tickets: <5%


═══════════════════════════════════════════════════════════════════════════════
                         TECHNICAL IMPLEMENTATION
═══════════════════════════════════════════════════════════════════════════════

COMPONENT HIERARCHY:

App.tsx (root)
├─> LandingPage.tsx (unauthenticated)
│   └─> LoginModal.tsx (OAuth trigger)
│
├─> UsernameSetup.tsx (first-time users)
│   ├─> Pre-fill logic (useEffect)
│   ├─> Real-time validation
│   └─> Analytics hooks
│
├─> CelebrationModal.tsx (after username)
│   ├─> Confetti animation
│   ├─> Copy link functionality
│   └─> Auto-dismiss timer
│
├─> WelcomeOnboarding.tsx (guided tour)
│   ├─> 4-step wizard
│   ├─> Progress tracking
│   └─> Skip option
│
└─> ForumView.tsx (main dashboard)
    ├─> Contextual tooltips (optional)
    └─> Empty state with CTA

HOOKS & UTILITIES:
├─> useOnboardingAnalytics.ts
│   ├─> trackEvent()
│   ├─> trackFunnelStep()
│   ├─> getFunnelMetrics()
│   └─> calculateTimeToValue()
│
└─> OnboardingTooltip.tsx (reusable)
    ├─> Positioning logic
    ├─> Pulse animation
    └─> Dismiss tracking

STATE MANAGEMENT:
├─> localStorage keys:
│   ├─> 'onboarding_completed': 'true' | null
│   ├─> 'onboarding_events': Event[]
│   ├─> 'onboarding_start_time': timestamp
│   └─> 'user': { username, email, name, ... }
│
└─> React state:
    ├─> needsUsername: boolean
    ├─> showWelcomeOnboarding: boolean
    ├─> showCelebration: boolean
    └─> celebrationType: string


═══════════════════════════════════════════════════════════════════════════════

END OF FLOW DIAGRAM
Last Updated: 2025-10-05
Target: <60 seconds (Currently: ~45 seconds ✅)

═══════════════════════════════════════════════════════════════════════════════
```

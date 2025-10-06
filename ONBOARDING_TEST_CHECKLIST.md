# Onboarding Optimization - Test Checklist

## Pre-Deployment Testing

### 1. Username Setup Component
- [ ] Pre-fill works with Google name
  - [ ] "John Smith" → "john-smith"
  - [ ] "John O'Brien" → "john-obrien" (removes special chars)
  - [ ] "José García" → "jose-garcia" (handles accents)
  - [ ] Empty name → shows empty field (graceful fallback)

- [ ] Auto-check availability on mount
  - [ ] Shows spinner while checking
  - [ ] Shows green checkmark if available
  - [ ] Shows red X if taken
  - [ ] Handles API errors gracefully

- [ ] Real-time validation
  - [ ] Typing updates availability check (debounced)
  - [ ] Character counter updates
  - [ ] Error messages appear inline
  - [ ] Button disables when invalid

- [ ] Progress indicator
  - [ ] Shows "Step 2 of 2"
  - [ ] Progress bar at 100%
  - [ ] Hides after 2 seconds

- [ ] Randomize button
  - [ ] Generates valid username
  - [ ] Auto-checks availability
  - [ ] Format: adjective-noun-number

- [ ] Submit success
  - [ ] Triggers celebration modal
  - [ ] Updates user in localStorage
  - [ ] Clears needsUsername flag

- [ ] Error handling
  - [ ] Session expired message
  - [ ] Network error message
  - [ ] Invalid format message
  - [ ] Username taken message

### 2. Celebration Modal
- [ ] Confetti animation
  - [ ] 50 particles fall from top
  - [ ] Multiple colors (primary palette)
  - [ ] Stops after 3 seconds

- [ ] Content display
  - [ ] Shows correct icon for type
  - [ ] Username displayed correctly
  - [ ] Profile URL formatted properly

- [ ] Copy link button
  - [ ] Copies to clipboard
  - [ ] Shows "Copied!" confirmation
  - [ ] Resets after 2 seconds

- [ ] Auto-dismiss
  - [ ] Closes after 4 seconds (if configured)
  - [ ] Can manually close before timer

- [ ] Multiple celebration types
  - [ ] Username creation
  - [ ] First message sent
  - [ ] First thread created
  - [ ] Welcome message

### 3. Welcome Onboarding Tour
- [ ] Step progression
  - [ ] 4 steps total
  - [ ] Progress bar updates
  - [ ] Smooth transitions
  - [ ] Step indicators at bottom

- [ ] Content for each step
  - [ ] Step 1: Welcome with user's first name
  - [ ] Step 2: Forum features with preview card
  - [ ] Step 3: Messaging features with preview card
  - [ ] Step 4: Anonymous inbox with URL preview

- [ ] Navigation
  - [ ] "Next" button advances
  - [ ] Last step shows "Finish Tour"
  - [ ] "Skip tour" link works from any step

- [ ] Completion tracking
  - [ ] Sets onboarding_completed in localStorage
  - [ ] Doesn't show again on return visit
  - [ ] Can be reset for testing

### 4. Analytics Tracking
- [ ] Events are logged
  - [ ] Landing page view
  - [ ] Sign in click
  - [ ] OAuth success/failure
  - [ ] Username view
  - [ ] Username created
  - [ ] Celebration view
  - [ ] Welcome tour start/skip/complete

- [ ] Funnel metrics
  - [ ] getFunnelMetrics() returns data
  - [ ] Time calculations are accurate
  - [ ] Conversion rates calculated correctly

- [ ] Data persistence
  - [ ] Events stored in localStorage
  - [ ] Start time tracked
  - [ ] Can be exported/analyzed

### 5. Mobile Testing
- [ ] Responsive design
  - [ ] Full-screen modals on mobile
  - [ ] No horizontal scroll
  - [ ] Touch targets ≥44px
  - [ ] Text readable without zoom

- [ ] Mobile-specific behavior
  - [ ] Auto-focus disabled (no keyboard jump)
  - [ ] Font size ≥16px (no iOS zoom)
  - [ ] Buttons sized for thumbs

- [ ] Gestures (future)
  - [ ] Swipe to advance tour
  - [ ] Pull to dismiss modals

### 6. Error Scenarios
- [ ] Network failures
  - [ ] OAuth timeout
  - [ ] Username check API down
  - [ ] Username submit fails
  - [ ] User-friendly error messages

- [ ] Session issues
  - [ ] Token expired during username setup
  - [ ] Token missing after OAuth
  - [ ] Refresh required message

- [ ] Data validation
  - [ ] Empty username blocked
  - [ ] Too short (< 3 chars) blocked
  - [ ] Invalid characters blocked
  - [ ] Already taken username handled

### 7. Integration Testing
- [ ] Complete flow (happy path)
  1. [ ] Land on homepage
  2. [ ] Click "Sign In with Google"
  3. [ ] Complete OAuth
  4. [ ] See username pre-filled
  5. [ ] Click "Continue" (1 click)
  6. [ ] See celebration modal
  7. [ ] Close celebration
  8. [ ] See welcome tour
  9. [ ] Complete tour (4 steps)
  10. [ ] Reach dashboard
  11. [ ] Total time < 60 seconds ✅

- [ ] Power user flow
  - [ ] Skip welcome tour immediately
  - [ ] Reach dashboard in <30 seconds

- [ ] Returning user flow
  - [ ] Skip username setup
  - [ ] Skip welcome tour
  - [ ] Straight to dashboard

---

## Manual Testing Steps

### Test 1: New User (Google Name: "John Smith")
```
1. Clear localStorage
2. Go to landing page
3. Click "Sign In with Google"
4. Authenticate
5. EXPECT: Username field shows "john-smith"
6. EXPECT: Green checkmark appears
7. EXPECT: Progress shows "Step 2 of 2"
8. Click "Continue to Your Forum"
9. EXPECT: Celebration modal with confetti
10. EXPECT: Profile URL: forum.snapitsoftware.com/@john-smith
11. Click "Continue to Dashboard" or wait 4s
12. EXPECT: Welcome tour step 1
13. Click through all 4 steps
14. EXPECT: Dashboard loads
15. CHECK: Time from step 3 to step 14 < 60 seconds
```

### Test 2: Username Already Taken
```
1. Repeat Test 1 but username "john-smith" is taken
2. EXPECT: Red X icon appears
3. EXPECT: Error: "This username is already taken"
4. Modify to "john-smith-2"
5. EXPECT: Green checkmark appears
6. Continue flow normally
```

### Test 3: Skip Welcome Tour
```
1. Complete Test 1 through step 11
2. On welcome tour step 1, click "Skip tour"
3. EXPECT: Immediately go to dashboard
4. CHECK: Total time < 30 seconds (power user)
```

### Test 4: Custom Username Entry
```
1. Complete Test 1 through step 5
2. Clear the pre-filled username
3. Type custom username: "my-custom-name"
4. EXPECT: Real-time validation as you type
5. EXPECT: Character counter updates
6. EXPECT: Green checkmark when valid
7. Continue flow normally
```

### Test 5: Randomize Username
```
1. Complete Test 1 through step 5
2. Click randomize button (↻ icon)
3. EXPECT: Random username like "shadow-journalist-742"
4. EXPECT: Auto-check availability
5. EXPECT: Green checkmark if available
6. Continue flow normally
```

### Test 6: Mobile Experience
```
1. Open Chrome DevTools
2. Toggle device emulation (iPhone 13 Pro)
3. Repeat Test 1 (complete flow)
4. CHECK: No horizontal scroll
5. CHECK: All buttons easily tappable
6. CHECK: Text readable without zoom
7. CHECK: Modals are full-screen
```

### Test 7: Analytics Verification
```
1. Complete Test 1 (full flow)
2. Open browser console
3. Run: JSON.parse(localStorage.getItem('onboarding_events'))
4. EXPECT: Array of events with timestamps
5. CHECK: All funnel steps logged
6. CHECK: Time calculations accurate
7. Run: calculateTimeToValue(events)
8. EXPECT: Metrics object with times
```

### Test 8: Returning User
```
1. Complete Test 1 (full flow)
2. Refresh page
3. EXPECT: Skip username setup
4. EXPECT: Skip welcome tour
5. EXPECT: Go straight to dashboard
6. CHECK: onboarding_completed = "true" in localStorage
```

### Test 9: Session Expiry
```
1. Start Test 1
2. At username setup, delete token from localStorage
3. Try to submit username
4. EXPECT: Friendly error message
5. EXPECT: Instruction to refresh and sign in again
```

### Test 10: Offline/Network Error
```
1. Start Test 1
2. At username setup, go offline (DevTools)
3. Try to submit username
4. EXPECT: Network error message (not technical)
5. EXPECT: Suggestion to check connection
```

---

## Performance Testing

### Page Load Times
- [ ] Landing page: <2 seconds
- [ ] OAuth redirect: <3 seconds
- [ ] Username setup: <1 second
- [ ] Dashboard: <2 seconds

### Component Render Times
- [ ] UsernameSetup mounts in <500ms
- [ ] CelebrationModal animates smoothly (60fps)
- [ ] WelcomeOnboarding transitions smoothly

### API Response Times
- [ ] Check username availability: <500ms
- [ ] Submit username: <1 second
- [ ] Fetch user data: <1 second

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all inputs
- [ ] Enter key submits forms
- [ ] Escape key closes modals
- [ ] Focus indicators visible

### Screen Reader
- [ ] ARIA labels on buttons
- [ ] Alt text on images/icons
- [ ] Form labels associated
- [ ] Error messages announced

### Color Contrast
- [ ] Text meets WCAG AA (4.5:1)
- [ ] Button text meets standards
- [ ] Error messages visible
- [ ] Success indicators clear

---

## Browser Compatibility

### Desktop Browsers
- [ ] Chrome 90+ (primary)
- [ ] Firefox 88+
- [ ] Safari 14+
- [ ] Edge 90+

### Mobile Browsers
- [ ] iOS Safari 14+
- [ ] Chrome Android 90+
- [ ] Samsung Internet

---

## Analytics Dashboard Testing

### View Metrics
```javascript
// In browser console after onboarding

// 1. Get all events
const events = JSON.parse(localStorage.getItem('onboarding_events') || '[]')
console.table(events)

// 2. Calculate funnel metrics
import { calculateFunnelMetrics } from './hooks/useOnboardingAnalytics'
const metrics = calculateFunnelMetrics(events)
console.log('Conversion rates:', metrics.conversions)
console.log('Total users:', metrics.totalUsers)

// 3. Calculate time-to-value
import { calculateTimeToValue } from './hooks/useOnboardingAnalytics'
const timeMetrics = calculateTimeToValue(events)
console.log('Username setup time:', timeMetrics.usernameSetupTime, 's')
console.log('Total onboarding time:', timeMetrics.onboardingTime, 's')
console.log('Time to first action:', timeMetrics.timeToFirstAction, 's')

// 4. Expected results
// - Username setup: 10-20s
// - Total onboarding: 40-60s
// - Time to first action: 50-70s
```

---

## Reset for Testing
```javascript
// Run in browser console to reset onboarding state

localStorage.removeItem('onboarding_completed')
localStorage.removeItem('onboarding_events')
localStorage.removeItem('onboarding_start_time')
localStorage.removeItem('user')
localStorage.removeItem('token')
location.reload()
```

---

## Expected Results Summary

### Timing Benchmarks
- **Username setup:** 10-20 seconds (with pre-fill)
- **Celebration modal:** 2-4 seconds
- **Welcome tour:** 20-30 seconds (or skip in 2s)
- **Total onboarding:** 30-60 seconds ✅

### Conversion Expectations
- **OAuth → Username created:** >90%
- **Username → Tour complete:** >60%
- **Tour → First action:** >40%

### User Sentiment
- **Confusion:** Minimal (clear instructions)
- **Frustration:** Low (smart defaults)
- **Delight:** High (celebrations, smooth flow)

---

## Issue Reporting Template

When reporting issues, include:
```
**Issue:** Brief description

**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**


**Actual Behavior:**


**Screenshot/Video:** (if applicable)

**Browser/Device:**
- Browser:
- Version:
- OS:
- Mobile/Desktop:

**Console Errors:** (check DevTools)


**LocalStorage State:**
```
localStorage.getItem('user')
localStorage.getItem('onboarding_events')
localStorage.getItem('onboarding_completed')
```

**Severity:** Critical | High | Medium | Low
```

---

## Sign-Off Checklist

Before deploying to production:
- [ ] All critical tests passed
- [ ] Mobile experience verified
- [ ] Analytics tracking confirmed
- [ ] Error handling tested
- [ ] Performance acceptable (<60s)
- [ ] Accessibility validated
- [ ] Browser compatibility checked
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Staging environment tested

**Signed off by:** _______________
**Date:** _______________
**Deployment approved:** [ ] Yes [ ] No

---

*Last Updated: 2025-10-05*
*Version: 1.0*

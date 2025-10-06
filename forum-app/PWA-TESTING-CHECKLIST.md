# PWA Testing Checklist

## 📋 Pre-Deployment Testing

### ✅ Service Worker

- [ ] Service worker registers successfully
- [ ] Service worker activates without errors
- [ ] Cache names are correct and versioned
- [ ] Static assets are cached on install
- [ ] Dynamic caching works for API calls
- [ ] Image caching functions properly
- [ ] Cache size limits are enforced
- [ ] Old caches are deleted on update

**Test Command:**
```bash
npm run build
npm run serve
# Open http://localhost:3000
# DevTools → Application → Service Workers
```

---

### ✅ Manifest.json

- [ ] Manifest is valid JSON
- [ ] All required fields present
- [ ] Icons paths are correct
- [ ] Theme colors match design
- [ ] Start URL is correct
- [ ] Display mode is "standalone"
- [ ] Shortcuts work (if supported)

**Test Command:**
```bash
# Visit site, then:
# DevTools → Application → Manifest
```

**Validation:**
```bash
# Use https://manifest-validator.appspot.com/
```

---

### ✅ Icons

- [ ] Favicon (16x16, 32x32) loads
- [ ] PWA icon 192x192 exists
- [ ] PWA icon 512x512 exists
- [ ] Maskable icons have safe zone
- [ ] Apple touch icon loads
- [ ] All icons are optimized (file size)

**Files to Check:**
- `/public/favicon.ico`
- `/public/icon-192.png`
- `/public/icon-512.png`
- `/public/icon-192-maskable.png`
- `/public/icon-512-maskable.png`
- `/public/apple-touch-icon.png`

---

### ✅ Offline Support

- [ ] Offline page loads when disconnected
- [ ] Cached pages load without network
- [ ] Offline indicator appears
- [ ] Reconnection is detected automatically
- [ ] Background sync triggers on reconnect
- [ ] Failed requests are retried

**Test:**
1. Load site while online
2. Navigate to multiple pages
3. Go offline (DevTools → Network → Offline)
4. Try loading cached pages
5. Try loading new pages (should show offline page)
6. Go back online
7. Verify sync happens

---

### ✅ Install Prompt

- [ ] Prompt appears after 2nd visit
- [ ] Prompt doesn't show if already installed
- [ ] Dismiss works and sets flag
- [ ] Remind later works
- [ ] iOS shows correct instructions
- [ ] Android/Chrome shows install button
- [ ] Install tracking works

**Test:**
1. Visit site in incognito mode
2. Refresh page (2nd visit)
3. Wait 3 seconds
4. Prompt should appear
5. Test dismiss and remind later
6. Clear localStorage and retry

---

### ✅ Platform-Specific

#### Chrome (Desktop/Android)
- [ ] beforeinstallprompt event fires
- [ ] Install button works
- [ ] Opens in standalone mode
- [ ] Icon appears on home screen/taskbar
- [ ] App can be uninstalled

#### Safari (iOS)
- [ ] Add to Home Screen works
- [ ] Apple touch icon loads
- [ ] Status bar style applied
- [ ] Opens full-screen
- [ ] Splash screen shows (if configured)

#### Edge (Desktop)
- [ ] Install prompt appears
- [ ] Taskbar integration works
- [ ] Start menu shortcut created

#### Firefox (Desktop)
- [ ] Manual install option available
- [ ] Offline mode works
- [ ] Cache functions properly

---

### ✅ Lighthouse Audit

Run Lighthouse in Chrome DevTools:

**Required Scores:**
- [ ] PWA: ≥90
- [ ] Performance: ≥80
- [ ] Accessibility: ≥90
- [ ] Best Practices: ≥90
- [ ] SEO: ≥90

**PWA Checklist (must all pass):**
- [ ] Installable
- [ ] Page load fast on mobile networks
- [ ] Configured for custom splash screen
- [ ] Sets theme color
- [ ] Contains some content when offline
- [ ] Uses HTTPS
- [ ] Redirects HTTP to HTTPS
- [ ] Has viewport meta tag
- [ ] Content sized correctly for viewport

**Run:**
```bash
# Build production version
npm run build
npm run serve

# Open DevTools → Lighthouse
# Select "Progressive Web App" category
# Click "Generate report"
```

---

### ✅ Network Conditions

Test under various network conditions:

- [ ] Fast 3G (DevTools → Network → Fast 3G)
- [ ] Slow 3G
- [ ] Offline
- [ ] Variable (flaky connection)

**Expected:**
- Content loads from cache
- Offline page shows when appropriate
- No errors in console
- Graceful degradation

---

### ✅ Update Flow

Test service worker updates:

1. [ ] Deploy new SW version
2. [ ] Update detected
3. [ ] User prompted to refresh
4. [ ] Accept update → Page reloads
5. [ ] New SW activates
6. [ ] Old caches cleared

**Test:**
```javascript
// In sw.js, change:
const CACHE_VERSION = 'v1.0.1'; // increment version

// Deploy and test update flow
```

---

### ✅ Security

- [ ] HTTPS enforced
- [ ] HTTP redirects to HTTPS
- [ ] Content Security Policy set
- [ ] No mixed content warnings
- [ ] Service worker only on HTTPS/localhost

---

### ✅ Performance

- [ ] First Contentful Paint <2s
- [ ] Largest Contentful Paint <2.5s
- [ ] Time to Interactive <3.8s
- [ ] Cumulative Layout Shift <0.1
- [ ] First Input Delay <100ms

**Tools:**
- Chrome DevTools → Performance
- Web Vitals extension
- PageSpeed Insights

---

### ✅ Cross-Browser Testing

#### Chrome
- [ ] Desktop install works
- [ ] Android install works
- [ ] Service worker active
- [ ] Offline mode functional

#### Safari
- [ ] iOS Add to Home Screen
- [ ] macOS Add to Dock
- [ ] Meta tags respected
- [ ] Offline support

#### Edge
- [ ] Desktop install
- [ ] PWA features work
- [ ] Same as Chrome behavior

#### Firefox
- [ ] Manual install option
- [ ] Service worker active
- [ ] Offline capabilities

---

### ✅ Device Testing

Test on actual devices (not just emulators):

#### Mobile
- [ ] iPhone (iOS Safari)
- [ ] Android (Chrome)
- [ ] Android (Samsung Internet)
- [ ] Tablet (iOS)
- [ ] Tablet (Android)

#### Desktop
- [ ] Windows (Chrome)
- [ ] Windows (Edge)
- [ ] macOS (Safari)
- [ ] macOS (Chrome)
- [ ] Linux (Chrome/Firefox)

---

### ✅ User Experience

- [ ] Install prompt is not annoying
- [ ] Offline indicator is clear
- [ ] Loading states work
- [ ] Error messages are helpful
- [ ] Smooth transitions
- [ ] No layout shifts

---

### ✅ Analytics & Tracking

- [ ] Install events tracked
- [ ] Standalone mode detected
- [ ] Offline visits logged
- [ ] Service worker errors reported
- [ ] Update acceptance tracked

**Verify in console:**
```javascript
// Check if events fire
window.addEventListener('appinstalled', (e) => {
  console.log('PWA installed!', e);
});
```

---

### ✅ Console Checks

Check browser console for:

- [ ] No errors
- [ ] Service worker logs present
- [ ] PWA registration success
- [ ] No 404s for assets
- [ ] No CORS issues

---

### ✅ Storage & Cache

Verify in DevTools → Application:

- [ ] Service Worker registered
- [ ] Cache Storage populated
- [ ] IndexedDB (if used) working
- [ ] LocalStorage has install flags
- [ ] Cookies (if used) set correctly

---

## 🚀 Deployment Checklist

Before going live:

- [ ] All tests above pass
- [ ] Production build created
- [ ] Service worker version updated
- [ ] Lighthouse score >90
- [ ] Tested on real devices
- [ ] Analytics configured
- [ ] Backup plan if SW fails
- [ ] Documentation updated

---

## 🐛 Common Issues & Fixes

### Issue: Service Worker Won't Register
**Fix:**
- Ensure HTTPS or localhost
- Check sw.js path is correct
- Clear browser cache
- Check console for errors

### Issue: Install Prompt Not Showing
**Fix:**
- Visit site twice
- Check beforeinstallprompt fires
- Verify manifest.json is valid
- Ensure not already installed

### Issue: Offline Page Not Loading
**Fix:**
- Check offline.html is cached
- Verify service worker fetch handler
- Test with DevTools offline mode

### Issue: Icons Not Loading
**Fix:**
- Run `npm run generate-icons`
- Check file paths in manifest
- Verify icons exist in /public/
- Clear cache and reload

### Issue: Updates Not Working
**Fix:**
- Increment CACHE_VERSION
- Clear old caches
- Force refresh (Ctrl+Shift+R)
- Check updatefound event

---

## 📊 Success Metrics

Track these metrics after deployment:

- **Install Rate**: Installs / Total Visitors
- **Standalone Mode Usage**: % using app vs browser
- **Offline Engagement**: Offline visits / Total visits
- **Cache Hit Rate**: Cached requests / Total requests
- **Update Acceptance**: % accepting SW updates
- **Retention**: 7-day/30-day return rate

**Target Goals:**
- Install rate: >5%
- Standalone usage: >50%
- Offline engagement: >10%
- Cache hit rate: >80%
- Update acceptance: >70%

---

## ✅ Final Sign-Off

Before marking complete:

- [ ] All checkboxes above checked
- [ ] Tested on 3+ devices
- [ ] Lighthouse PWA score >90
- [ ] No console errors
- [ ] Offline mode works
- [ ] Install flow smooth
- [ ] Updates work correctly
- [ ] Analytics tracking
- [ ] Documentation complete
- [ ] Stakeholder approval

---

**Tester:** _______________
**Date:** _______________
**Build Version:** _______________
**Sign-off:** _______________

---

**Remember:** PWAs are progressive! They enhance the experience but shouldn't break basic functionality.

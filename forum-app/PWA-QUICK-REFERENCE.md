# PWA Quick Reference Card

## 🚀 Commands

```bash
# Generate PWA icons
npm run generate-icons

# Build for production
npm run build

# Test PWA locally (with HTTPS)
npm run pwa-test
# Then visit http://localhost:3000

# Start development server
npm start
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `/public/sw.js` | Service Worker (caching & offline) |
| `/public/manifest.json` | PWA configuration |
| `/public/offline.html` | Offline fallback page |
| `/src/components/InstallPrompt.tsx` | Install UI |
| `/src/components/OfflineIndicator.tsx` | Connection status |
| `/src/index.tsx` | SW registration |

---

## 🧪 Testing

### Chrome DevTools:
1. F12 → **Application** tab
2. Check **Service Workers** (should be activated)
3. Check **Manifest** (should be valid)
4. Check **Cache Storage** (should have caches)

### Test Offline:
1. Load site while online
2. DevTools → **Network** → **Offline**
3. Reload page (should show offline page or cached content)

### Test Install:
1. Visit site in **incognito mode**
2. Refresh page (2nd visit)
3. Wait **3 seconds**
4. Install prompt should appear

### Lighthouse Audit:
1. DevTools → **Lighthouse**
2. Select **Progressive Web App**
3. Click **Generate report**
4. Should score **>90**

---

## 🔧 Troubleshooting

### Service Worker Issues:
```javascript
// Clear all caches
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});

// Unregister all service workers
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(r => r.unregister());
});
```

### Common Fixes:
- ❌ SW not registering → Ensure HTTPS or localhost
- ❌ Install prompt missing → Visit 2+ times
- ❌ Offline not working → Cache pages online first
- ❌ Icons not loading → Run `npm run generate-icons`

---

## 📊 Cache Strategy

| Resource Type | Strategy | Max Items |
|--------------|----------|-----------|
| **API Calls** | Network-first | 30 |
| **Static Assets** | Cache-first | No limit |
| **Images** | Cache-first | 60 |
| **Dynamic Pages** | Network-first | 50 |

---

## 📱 Platform Support

| Platform | Install Method | Icon Size |
|----------|---------------|-----------|
| **Chrome (Android)** | Auto prompt | 192x192, 512x512 |
| **Safari (iOS)** | Add to Home Screen | 180x180 |
| **Edge (Desktop)** | Install button | 192x192, 512x512 |
| **Firefox** | Manual install | 192x192 |

---

## ✅ PWA Checklist

- [x] Service worker registered
- [x] Manifest.json valid
- [x] HTTPS enabled
- [x] Offline page works
- [x] Icons all sizes
- [x] Lighthouse score >90
- [x] Install prompt appears
- [x] Standalone mode works

---

## 🔄 Update Service Worker

1. Edit `/public/sw.js`
2. Increment version:
   ```javascript
   const CACHE_VERSION = 'v1.0.1'; // Change this
   ```
3. Build and deploy:
   ```bash
   npm run build
   # Deploy to production
   ```
4. Users get update prompt automatically

---

## 📈 Metrics to Track

- **Install Rate**: Installs / Visitors
- **Standalone Usage**: % using app vs browser
- **Offline Visits**: Offline loads / Total loads
- **Cache Hit Rate**: Cached / Total requests
- **7-Day Retention**: Return rate for installed users

---

## 🎯 Install Triggers

| Event | Action |
|-------|--------|
| **1st visit** | Cache assets, track visit |
| **2nd visit** | Show install prompt (after 3s) |
| **Already installed** | Hide prompt |
| **User dismisses** | Don't show again |
| **Remind Later** | Show on next visit |

---

## 💾 Storage Used

| Cache | Purpose | Size Limit |
|-------|---------|------------|
| `snapit-static-v1.0.0` | Static assets | Unlimited |
| `snapit-dynamic-v1.0.0` | Pages | 50 items |
| `snapit-api-v1.0.0` | API responses | 30 items |
| `snapit-images-v1.0.0` | Images | 60 items |

---

## 🔐 Security Notes

- ✅ HTTPS enforced (required for SW)
- ✅ Same E2EE as web version
- ✅ Service worker on secure origin only
- ✅ No sensitive data in caches
- ✅ OAuth still requires online

---

## 📝 User Instructions

### iOS Install:
1. Safari → Share → Add to Home Screen

### Android Install:
1. Chrome → Menu → Install app

### Desktop Install:
1. Address bar → Install icon (⊕)

---

## 🚨 Emergency Procedures

### Disable Service Worker:
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(r => {
  r.forEach(reg => reg.unregister());
  location.reload();
});
```

### Clear All PWA Data:
1. DevTools → **Application**
2. **Clear storage** → Select all
3. **Clear site data**

### Force Update:
1. DevTools → **Application** → **Service Workers**
2. Check **Update on reload**
3. Click **skipWaiting** if shown
4. Reload page (Ctrl+Shift+R)

---

## 📚 Documentation

- **Full Guide**: `PWA-IMPLEMENTATION.md`
- **Testing**: `PWA-TESTING-CHECKLIST.md`
- **User Guide**: `USER-INSTALL-GUIDE.md`
- **Summary**: `PWA-SUMMARY.md`
- **This Card**: `PWA-QUICK-REFERENCE.md`

---

## 🎯 Quick Wins

✅ **Faster Loading**: 80%+ from cache
✅ **Offline Access**: View cached content
✅ **Home Screen**: One-tap access
✅ **No App Store**: Direct install
✅ **Auto Updates**: No review process
✅ **Cross-Platform**: One codebase

---

**Last Updated**: October 5, 2025
**PWA Version**: 1.0.0
**Status**: Production Ready ✅

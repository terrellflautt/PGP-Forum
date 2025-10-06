// SnapIT Forums - Service Worker
// PWA with advanced caching and offline support

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `snapit-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `snapit-dynamic-${CACHE_VERSION}`;
const API_CACHE = `snapit-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `snapit-images-${CACHE_VERSION}`;

// Files to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico',
  '/offline.html'
];

// Maximum cache sizes
const MAX_DYNAMIC_ITEMS = 50;
const MAX_API_ITEMS = 30;
const MAX_IMAGE_ITEMS = 60;

// API endpoint base
const API_BASE = 'https://forum.snapitsoftware.com/api';

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        // Don't fail if some assets aren't available yet
        return cache.addAll(STATIC_ASSETS.filter(url => !url.includes('main.css') && !url.includes('main.js')))
          .catch(err => console.log('[SW] Some assets not yet available:', err));
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE &&
                          key !== API_CACHE && key !== IMAGE_CACHE)
            .map(key => {
              console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // API requests - Network first, cache fallback
  if (url.href.includes('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Images - Cache first, network fallback
  if (request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE, MAX_IMAGE_ITEMS));
    return;
  }

  // Static assets - Cache first
  if (STATIC_ASSETS.some(asset => url.pathname.includes(asset)) ||
      url.pathname.includes('/static/')) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // Everything else - Network first with cache fallback
  event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE, MAX_DYNAMIC_ITEMS));
});

// Network-first strategy (for API calls and dynamic content)
async function networkFirstStrategy(request, cacheName, maxItems = null) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    // Clone response before caching
    const responseClone = networkResponse.clone();

    // Cache the response
    caches.open(cacheName).then(cache => {
      cache.put(request, responseClone);

      // Limit cache size if specified
      if (maxItems) {
        limitCacheSize(cacheName, maxItems);
      }
    });

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // If HTML page, return offline page
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/offline.html');
    }

    // Return offline response
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

// Cache-first strategy (for static assets and images)
async function cacheFirstStrategy(request, cacheName, maxItems = null) {
  // Try cache first
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Return cached version and update in background
    fetchAndCache(request, cacheName, maxItems);
    return cachedResponse;
  }

  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    const responseClone = networkResponse.clone();

    caches.open(cacheName).then(cache => {
      cache.put(request, responseClone);

      if (maxItems) {
        limitCacheSize(cacheName, maxItems);
      }
    });

    return networkResponse;
  } catch (error) {
    console.log('[SW] Cache and network both failed:', request.url);

    // Return offline fallback
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/offline.html');
    }

    return new Response('Offline', { status: 503 });
  }
}

// Background fetch and cache update
async function fetchAndCache(request, cacheName, maxItems = null) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse.clone());

    if (maxItems) {
      limitCacheSize(cacheName, maxItems);
    }
  } catch (error) {
    // Silent fail for background updates
    console.log('[SW] Background update failed:', request.url);
  }
}

// Limit cache size
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxItems) {
    // Delete oldest items
    const itemsToDelete = keys.length - maxItems;
    for (let i = 0; i < itemsToDelete; i++) {
      await cache.delete(keys[i]);
    }
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }

  if (event.tag === 'sync-forums') {
    event.waitUntil(syncForums());
  }
});

// Sync pending messages
async function syncMessages() {
  try {
    // Get pending messages from IndexedDB (would need to implement)
    console.log('[SW] Syncing pending messages...');

    // Send pending messages to server
    // Update UI with sync status

    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Message sync failed:', error);
    return Promise.reject(error);
  }
}

// Sync pending forum actions
async function syncForums() {
  try {
    console.log('[SW] Syncing pending forum actions...');

    // Sync any pending forum posts/comments

    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Forum sync failed:', error);
    return Promise.reject(error);
  }
}

// Handle push notifications (future feature)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const data = event.data ? event.data.json() : {};
  const title = data.title || 'SnapIT Forums';
  const options = {
    body: data.body || 'You have a new message',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Open',
        icon: '/logo192.png'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data.url || '/';

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if window is already open
          for (let client of clientList) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }

          // Open new window
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Message handler for client communication
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls || [];
    caches.open(DYNAMIC_CACHE).then(cache => {
      cache.addAll(urls);
    });
  }

  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(keys => {
      keys.forEach(key => caches.delete(key));
    });
  }
});

console.log('[SW] Service Worker loaded successfully');

const CACHE_NAME = 'gvp-marks-cache-v2';
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'logo.svg',
  'manifest.json',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
];

// Install Event - Caching Assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static shell and dependencies');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network First for local assets, Cache First for external CDN dependencies
self.addEventListener('fetch', (e) => {
  // Only handle GET requests
  if (e.request.method !== 'GET') return;

  const isLocal = e.request.url.startsWith(self.location.origin);

  if (isLocal) {
    // Network First strategy: always try network first to get latest updates, fallback to cache if offline
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          // If valid response, clone and update cache
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails (offline), load from cache
          return caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Offline fallback for index.html
            if (e.request.url.includes('.html') || e.request.url === self.location.origin || e.request.url === self.location.origin + '/') {
              return caches.match('index.html');
            }
          });
        })
    );
  } else {
    // Cache First strategy for CDN dependencies (like SheetJS xlsx library)
    e.respondWith(
      caches.match(e.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(e.request).then((response) => {
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(e.request, responseClone);
              });
            }
            return response;
          });
        })
    );
  }
});

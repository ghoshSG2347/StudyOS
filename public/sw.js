const CACHE_NAME = 'studyos-pwa-v2';
const STATIC_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon-32x32.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/apple-touch-icon.png',
  '/logo-cropped.png'
];

// Install: Pre-cache static shell & activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE).catch((err) => {
        console.warn('[SW] Pre-caching non-fatal warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up stale caches & take control of clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Smart caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (e.g. POST/PUT to Supabase)
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension requests and non-http(s)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Bypass API requests to Supabase (Auth, DB REST queries) to always fetch live
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  // 1. Navigation requests (HTML pages) -> Network-first with Cache fallback to /index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const fallback = await caches.match('/index.html');
          return fallback || new Response('Offline: StudyOS is loading from offline storage.', {
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // 2. Static Vite Assets & Google Fonts -> Cache-First with Stale-While-Revalidate
  const isStaticAsset = (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.json' ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('cdnjs.cloudflare.com')
  );

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. All other requests -> Network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});

// Support manual skip waiting message from app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

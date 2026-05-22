// Service Worker Version - update to force cache refresh
const SW_VERSION = '2.19.0'; // x-release-please-version
const CACHE_NAME = `padel-buddy-${SW_VERSION}`;

const PRECACHE_URLS = ['/index.html', '/icon.png', '/manifest.json', '/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      await Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)));

      try {
        const manifestResponse = await fetch('/precache-manifest.json');
        if (manifestResponse.ok) {
          const manifest = await manifestResponse.json();
          if (manifest && Array.isArray(manifest.assets)) {
            await Promise.allSettled(
              manifest.assets.map((url) => cache.add(url).catch(() => null))
            );
          }
        }
      } catch (e) {
        console.warn('[SW] Failed to precache from manifest:', e);
      }

      return self.skipWaiting();
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old cache versions
              return cacheName.startsWith('padel-buddy-') && cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Only cache static asset paths
const STATIC_ASSET_PATTERN = /^\/(assets|icon|[\w-]+\.js|[\w-]+\.css|[\w-]+\.png|[\w-]+\.ico)/;
const isStaticAsset = (url) => STATIC_ASSET_PATTERN.test(url.pathname);

// Fetch event - cache-first strategy for static assets, network-first for navigation
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle navigation requests (SPA routes) with network-first + offline fallback
  // This must come BEFORE the static asset check because navigation URLs aren't static assets
  if (
    event.request.mode === 'navigate' ||
    event.request.headers.get('Accept')?.includes('text/html')
  ) {
    event.respondWith(
      fetch(event.request).catch(async () => {
        async function getCachedContent(url) {
          const cache = await caches.open(CACHE_NAME);
          const response = await cache.match(url);
          if (!response) return null;
          if (response.status === 301 || response.status === 302) {
            const location = response.headers.get('Location');
            if (location) {
              return getCachedContent(location);
            }
            return null;
          }
          if (response.status >= 300 && response.status < 400 && response.status !== 304) {
            const location = response.headers.get('Location');
            if (location) {
              return getCachedContent(location);
            }
            return null;
          }
          const body = await response.text();
          return new Response(body, {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
          });
        }
        const response = await getCachedContent('/index.html');
        if (response) return response;
        return new Response(
          '<!DOCTYPE html><html><head><title>Offline</title></head><body><p>You are offline. Please connect to the internet to load this page.</p></body></html>',
          {
            headers: { 'Content-Type': 'text/html' },
            status: 200
          }
        );
      })
    );
    return;
  }

  // Only cache static assets - defensive check to prevent API calls from being cached
  // if the app ever adds them in the future
  const url = new URL(event.request.url);

  // Guard: only handle same-origin requests to avoid caching cross-origin assets
  if (url.origin !== self.location.origin) {
    return;
  }

  if (!isStaticAsset(url)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            return caches
              .open(CACHE_NAME)
              .then((cache) =>
                cache.put(event.request, responseToCache).then(() => networkResponse)
              );
          }
          return networkResponse;
        })
        .catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    if (event.ports[0]) {
      event.ports[0].postMessage({ acknowledged: true });
    }
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    if (event.ports[0]) {
      event.ports[0].postMessage({ version: SW_VERSION, cacheName: CACHE_NAME });
    }
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    if (!event.ports[0]) {
      return; // Can't respond, but don't crash
    }
    void caches
      .delete(CACHE_NAME)
      .then(() => {
        event.ports[0]?.postMessage({ success: true });
        return undefined;
      })
      .catch((err) => {
        console.warn('[SW] Failed to clear cache:', err);
        event.ports[0]?.postMessage({ success: false, error: String(err) });
        return undefined;
      });
  }
});

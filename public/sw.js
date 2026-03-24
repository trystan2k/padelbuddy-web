// Service Worker Version - update to force cache refresh
const SW_VERSION = '1.0.0'
const CACHE_NAME = `padel-buddy-${SW_VERSION}`

// Assets to precache for full offline support
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/icon.png',
  '/locales/en.json',
  '/locales/es.json',
  '/locales/pt.json',
  '/manifest.json'
]

// Install event - precache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.allSettled(
      PRECACHE_URLS.map((url) => caches.open(CACHE_NAME).then((cache) => cache.add(url)))
    ).then(() => {
      // Skip waiting to activate immediately
      return self.skipWaiting()
    })
  )
})

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
              return cacheName.startsWith('padel-buddy-') && cacheName !== CACHE_NAME
            })
            .map((cacheName) => {
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim()
      })
  )
})

// Only cache static asset paths
const STATIC_ASSET_PATTERN = /^\/(assets|locales|icon|\w+\.js|\w+\.css|\w+\.png|\w+\.ico)/
const isStaticAsset = (url) => STATIC_ASSET_PATTERN.test(url.pathname)

// Fetch event - cache-first strategy for static assets, network-first for navigation
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Handle navigation requests (SPA routes) with network-first + offline fallback
  // This must come BEFORE the static asset check because navigation URLs aren't static assets
  if (
    event.request.mode === 'navigate' ||
    event.request.headers.get('Accept')?.includes('text/html')
  ) {
    event.respondWith(fetch(event.request).catch(() => caches.match('/index.html')))
    return
  }

  // Only cache static assets - defensive check to prevent API calls from being cached
  // if the app ever adds them in the future
  const url = new URL(event.request.url)

  // Guard: only handle same-origin requests to avoid caching cross-origin assets
  if (url.origin !== self.location.origin) {
    return
  }

  if (!isStaticAsset(url)) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response
        return cachedResponse
      }

      // Not in cache, fetch from network
      return fetch(event.request)
        .then((networkResponse) => {
          // Don't cache non-successful responses
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse
          }

          // Clone the response before caching
          const responseToCache = networkResponse.clone()

          caches
            .open(CACHE_NAME)
            .then((cache) => {
              return cache.put(event.request, responseToCache)
            })
            .catch((err) => {
              console.warn('[SW] Failed to cache response:', err)
            })

          return networkResponse
        })
        .catch(() => {
          // Network failed and not in cache - return error for static assets
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
        })
    })
  )
})

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    if (event.ports[0]) {
      event.ports[0].postMessage({ acknowledged: true })
    }
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    if (event.ports[0]) {
      event.ports[0].postMessage({ version: SW_VERSION, cacheName: CACHE_NAME })
    }
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    if (!event.ports[0]) {
      return // Can't respond, but don't crash
    }
    void caches
      .delete(CACHE_NAME)
      .then(() => {
        event.ports[0]?.postMessage({ success: true })
        return undefined
      })
      .catch((err) => {
        console.warn('[SW] Failed to clear cache:', err)
        event.ports[0]?.postMessage({ success: false, error: String(err) })
        return undefined
      })
  }
})

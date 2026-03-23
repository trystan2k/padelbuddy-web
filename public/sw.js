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
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_URLS)
      })
      .then(() => {
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

// Fetch event - cache-first strategy for all requests
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
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
          // Network failed and not in cache
          // For HTML requests, return the offline page
          if (event.request.headers.get('Accept')?.includes('text/html')) {
            return caches.match('/index.html')
          }
          // For other requests, just fail
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
    event.ports[0].postMessage({ version: SW_VERSION, cacheName: CACHE_NAME })
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    void caches
      .delete(CACHE_NAME)
      .then(() => {
        event.ports[0].postMessage({ success: true })
        return undefined
      })
      .catch((err) => {
        console.warn('[SW] Failed to clear cache:', err)
        event.ports[0].postMessage({ success: false, error: String(err) })
        return undefined
      })
  }
})

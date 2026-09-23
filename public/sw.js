const CACHE_NAME = 'metro2033-v1'

const PRECACHE = [
  '/audio/Main-Theme.mp3',
  '/audio/End-Credits.mp3',
  '/audio/Metro-2033-Ghost-Tunnel.mp3',
  '/metro2039-imgs/metro2039type.otf',
]

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  if (url.pathname.startsWith('/audio/')) {
    e.respondWith(cacheFirst(e.request))
    return
  }

  if (
    url.pathname.endsWith('.otf') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff')
  ) {
    e.respondWith(cacheFirst(e.request))
    return
  }

  if (
    url.pathname.startsWith('/metro2039-imgs/') ||
    url.pathname.startsWith('/book-art/')
  ) {
    e.respondWith(staleWhileRevalidate(e.request))
    return
  }
})

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME)
    cache.put(request, response.clone())
  }
  return response
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)
  const fetching = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone())
    return response
  })
  return cached || fetching
}

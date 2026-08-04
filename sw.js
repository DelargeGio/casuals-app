const CACHE_NAME = 'casuals-v4-hd';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './chat.js',
  './feed.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache).catch(err => console.log("Cache error:", err)))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondswidth ? event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  ) : event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

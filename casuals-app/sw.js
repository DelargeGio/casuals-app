const CACHE_NAME = 'casuals-v5-hd';

self.addEventListener('install', event => {
    self.skipWaiting();
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

// Red primero, caché solo como respaldo si no hay conexión —
// así nunca te quedás pegado en una versión vieja de un archivo.
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                const clonada = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clonada));
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});

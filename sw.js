// sw.js

const CACHE_NAME = 'quran-quiz-pwa-v1';
const OFFLINE_URLS = ['/', '/index.html', '/style.css', '/app.js', '/manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(OFFLINE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.map(key => key !== CACHE_NAME && caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  event.respondWith(
    caches.match(req)
      .then(cached => cached || fetch(req)
        .then(fresh => {
          if (req.method === 'GET') {
            const clone = fresh.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
          }
          return fresh;
        })
      )
      .catch(() => caches.match('index.html'))
  );
});

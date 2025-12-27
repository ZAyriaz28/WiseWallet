// sw.js
const CACHE_NAME = 'wisewallet-v1';
const assets = [
  './',
  './index.html',
  './dashboard.html',
  './style.css',
  './dashboard.js',
  './manifest.json'
];

// Instalar el Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Responder desde la caché cuando no hay internet
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
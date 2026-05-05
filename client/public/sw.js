const CACHE = 'waaah-v1';
const PRECACHE = [
  '/',
  '/index.html',
  '/fonts/LithoDemo.ttf',
  '/fonts/Montserrat-Regular.ttf',
  '/fonts/Montserrat-Medium.ttf',
  '/fonts/Montserrat-Bold.ttf',
  '/blobs/Hunger.png',
  '/blobs/Tired.png',
  '/blobs/Gas.png',
  '/blobs/Pain.png',
  '/blobs/Comfort.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Network first for API calls
  if (e.request.url.includes('/api/')) {
    e.respondWith(fetch(e.request));
    return;
  }
  // Cache first for everything else
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE)
            .then(cache => cache.put(e.request, clone));
          return res;
        })
      )
  );
});

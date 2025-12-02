const CACHE_VERSION = 'v1.0.3';
const CACHE_NAME = `hoc-tu-vung-v1.0.3`;
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './src/assets/css/common.css',
  './src/assets/css/loading.css',
  './src/assets/css/update-notification.css',
  './src/assets/css/home.css',
  './src/assets/css/practice-menu.css',
  './src/assets/css/practice.css',
  './src/assets/css/flashcard.css',
  './src/assets/data/vocabulary.json',
  './src/assets/icon/icon-72x72.png',
  './src/assets/icon/icon-96x96.png',
  './src/assets/icon/icon-128x128.png',
  './src/assets/icon/icon-144x144.png',
  './src/assets/icon/icon-152x152.png',
  './src/assets/icon/icon-192x192.png',
  './src/components/LoadingScreen.js',
  './src/components/UpdateNotification.js',
  './src/components/PracticeComponent.js',
  './src/components/FlashcardComponent.js',
  './src/views/Home.js',
  './src/views/PracticeMenu.js',
  './src/views/Practice.js',
  './src/views/Flashcard.js',
  './src/views/NotFound.js',
  './src/router/index.js',
  './src/App.js',
  './src/main.js',
  'https://unpkg.com/vue@3/dist/vue.global.js',
  'https://unpkg.com/vue-router@4/dist/vue-router.global.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache install failed:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        });
      })
      .catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
  );
});


// Service Worker for offline support and ultra-fast performance
const CACHE_NAME = 'chat-app-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Network request for Firebase and dynamic content
        return fetch(event.request).then(response => {
          // Cache successful responses
          if (response.ok && event.request.url.includes('localhost')) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseClone);
              });
          }
          return response;
        });
      })
      .catch(() => {
        // Fallback for network failures
        return new Response('Offline - Please check your connection', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});

// Background sync for offline messages
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync pending messages when back online
      syncPendingMessages()
    );
  }
});

// Sync pending messages
const syncPendingMessages = async () => {
  try {
    const pendingMessages = await getPendingMessages();
    for (const message of pendingMessages) {
      await sendMessage(message.chatId, message.text, message.senderId, message.senderName);
    }
    await clearPendingMessages();
  } catch (error) {
    console.error('Background sync failed:', error);
  }
};

// Get pending messages from IndexedDB
const getPendingMessages = () => {
  return new Promise((resolve) => {
    const request = indexedDB.open('ChatDB', 1);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingMessages'], 'readonly');
      const store = transaction.objectStore('pendingMessages');
      const getRequest = store.getAll();
      getRequest.onsuccess = () => resolve(getRequest.result);
    };
  });
};

// Clear pending messages
const clearPendingMessages = () => {
  return new Promise((resolve) => {
    const request = indexedDB.open('ChatDB', 1);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingMessages'], 'readwrite');
      const store = transaction.objectStore('pendingMessages');
      store.clear();
      transaction.oncomplete = () => resolve();
    };
  });
};

// Service Worker registration for ultra-fast performance
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content available, show update notification
                  showUpdateNotification();
                }
              });
            }
          });
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
};

// Show update notification
const showUpdateNotification = () => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Chat App Update', {
      body: 'A new version is available. Click to refresh.',
      icon: '/favicon.ico'
    });
  }
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

// Background sync for offline actions
export const syncOfflineActions = async (chatId: string, message: string, senderId: string, senderName: string) => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    
    // Store message in IndexedDB for background sync
    await storePendingMessage(chatId, message, senderId, senderName);
    
    // Register background sync (if supported)
    if (registration && 'sync' in registration) {
      const syncReg = registration as any;
      await syncReg.sync.register('background-sync');
    }
  }
};

// Store pending message in IndexedDB
const storePendingMessage = (chatId: string, message: string, senderId: string, senderName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ChatDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingMessages'], 'readwrite');
      const store = transaction.objectStore('pendingMessages');
      const addRequest = store.add({
        chatId,
        message,
        senderId,
        senderName,
        timestamp: Date.now()
      });
      addRequest.onsuccess = () => resolve();
      addRequest.onerror = () => reject(addRequest.error);
    };
  });
};

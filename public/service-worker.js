// PWA Installation Support - Minimal setup without caching
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Activated');
  // Take control of all clients immediately
  event.waitUntil(self.clients.claim());
});

// Your existing push notification code
self.addEventListener('push', event => {
  console.log('[Service Worker] Push received');
  
  try {
    const payload = event.data?.json() || {
      title: 'New Notification',
      body: 'You have a new update',
      badge: '/logo.png',
      icon: '/logo.png',
      data: { url: '/notifications' }
    };

    event.waitUntil(
      self.registration.showNotification(payload.title, {
        body: payload.body,
        badge: '/logo.png',
        icon: '/logo.png',
        data: payload.data,
        vibrate: [200, 100, 200] // Vibration pattern
      })
    );
  } catch (error) {
    console.error('Push handling failed:', error);
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      const url = event.notification.data?.url || '/dashboard';
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

// Optional: Add fetch event for basic offline detection (no caching)
self.addEventListener('fetch', event => {
  // This empty fetch handler helps with installability
  // but doesn't implement any caching
  // You can add basic offline page logic here if needed
});
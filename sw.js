// Quill-Q Service Worker
// Enables reliable push notifications and background alerts on mobile devices (Android & iOS PWA)

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push notification listener for incoming Web Push events
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || 'Quill-Q Notification';
  const options = {
    body: data.body || data.desc || data.message || '',
    icon: data.icon || 'assets/icon-192.png',
    badge: data.badge || 'assets/favicon-32x32-light.png',
    tag: data.tag || ('quill-notif-' + Date.now()),
    data: data.data || { url: './index.html', targetView: data.targetView || 'home' },
    vibrate: [150, 80, 150],
    renotify: true
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle user tapping on notification on mobile devices
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const notifData = event.notification.data || {};
  const targetView = notifData.targetView || 'home';
  const targetUrl = new URL(notifData.url || './index.html', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If an existing Quill-Q window/tab is open, focus it and switch to the target view
      for (const client of windowClients) {
        if ('focus' in client) {
          client.postMessage({
            type: 'NAVIGATE_VIEW',
            view: targetView
          });
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

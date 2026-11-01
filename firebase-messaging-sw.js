// Firebase Cloud Messaging Background Service Worker
// Automatically loaded by Firebase Messaging SDK for background and locked-screen push notifications

importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

// Initialize Firebase in worker context
firebase.initializeApp({
  projectId: "quill-q-dodch",
  appId: "1:648049411331:web:880ce305ebe145df9e9536",
  storageBucket: "quill-q-dodch.firebasestorage.app",
  apiKey: "AIzaSyBhOd39WoozsZBCrCRjQt1D23uoTJqqZgk",
  authDomain: "quill-q-dodch.firebaseapp.com",
  messagingSenderId: "648049411331",
  projectNumber: "648049411331"
});

const messaging = firebase.messaging();

// Handle background messages delivered when browser/app is closed or phone is locked
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notification = payload.notification || {};
  const data = payload.data || {};
  const notificationTitle = notification.title || data.title || 'Quill-Q Notification';
  const notificationOptions = {
    body: notification.body || data.body || data.desc || data.message || '',
    icon: notification.icon || data.icon || 'assets/icon-192.png',
    badge: notification.badge || data.badge || 'assets/favicon-32x32-light.png',
    tag: data.tag || ('quill-bg-' + Date.now()),
    data: {
      url: data.url || './index.html',
      targetView: data.targetView || 'home'
    },
    vibrate: [150, 80, 150],
    renotify: true
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// User taps on notification when app was closed
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const notifData = event.notification.data || {};
  const targetView = notifData.targetView || 'home';
  const targetUrl = new URL(notifData.url || './index.html', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.postMessage({
            type: 'NAVIGATE_VIEW',
            view: targetView
          });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

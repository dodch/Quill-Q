// Firebase Cloud Messaging Background Service Worker
// Automatically loaded by Firebase Messaging SDK for background and locked-screen push notifications

importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

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

function formatAndShowNotification(payload) {
  const notification = (payload && payload.notification) || {};
  const data = (payload && payload.data) || {};
  const notificationTitle = notification.title || data.title || 'Quill-Q Notification';
  const targetView = data.targetView || 'home';
  const baseScope = self.registration ? self.registration.scope : self.location.href;
  let resolvedUrl = data.url || './index.html';

  try {
    const parsed = new URL(resolvedUrl, baseScope);
    if (targetView && targetView !== 'home' && !parsed.searchParams.has('view')) {
      parsed.searchParams.set('view', targetView);
    }
    resolvedUrl = parsed.href;
  } catch (e) {
    resolvedUrl = baseScope;
  }

  const notificationOptions = {
    body: notification.body || data.body || data.desc || data.message || '',
    icon: notification.icon || data.icon || 'assets/icon-192.png',
    badge: notification.badge || data.badge || 'assets/favicon-32x32-light.png',
    tag: data.tag || ('quill-bg-' + Date.now()),
    data: {
      url: resolvedUrl,
      targetView: targetView
    },
    vibrate: [150, 80, 150],
    renotify: true
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
}

// Handle background messages delivered when browser/app is closed or phone is locked
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  return formatAndShowNotification(payload);
});

// Fallback for standard Web Push events
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let parsed = null;
  try {
    parsed = event.data.json();
  } catch (e) {
    parsed = { notification: { body: event.data.text() } };
  }

  // If FCM SDK already processed it, don't duplicate
  if (parsed && (parsed.fcmMessageId || parsed['google.c.sender.id'] || parsed.from)) {
    return;
  }

  event.waitUntil(formatAndShowNotification(parsed));
});

// User taps on notification when app was closed
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const notifData = event.notification.data || {};
  const targetView = notifData.targetView || 'home';
  const baseScope = self.registration ? self.registration.scope : self.location.href;
  let targetUrl = notifData.url || './index.html';

  try {
    const parsed = new URL(targetUrl, baseScope);
    if (targetView && targetView !== 'home' && !parsed.searchParams.has('view')) {
      parsed.searchParams.set('view', targetView);
    }
    targetUrl = parsed.href;
  } catch (e) {
    targetUrl = baseScope;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.postMessage({
            type: 'NAVIGATE_VIEW',
            view: targetView,
            url: targetUrl
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

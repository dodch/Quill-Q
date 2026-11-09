// Firebase Cloud Messaging Background Service Worker
// Automatically loaded by Firebase Messaging SDK for background and locked-screen push notifications

importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

const CACHE_NAME = 'quill-q-static-v2';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './styles.min.css',
  './academic-config.js',
  './profile-manager.js',
  './app.min.js',
  './manifest.json',
  './assets/favicon.svg',
  './assets/icon-192.png',
  './assets/landingpageuni.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('PWA Precache partial note:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Stale-While-Revalidate caching: 0ms instant loads from local cache + background updates
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Never cache Firestore / Firebase Auth / Cloudflare Worker / Analytics / SW itself
  if (
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('identitytoolkit') ||
    url.hostname.includes('workers.dev') ||
    url.pathname.endsWith('firebase-messaging-sw.js') ||
    url.pathname.endsWith('sw.js') ||
    url.protocol.startsWith('chrome-extension')
  ) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(req);

      const fetchPromise = fetch(req).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          cache.put(req, networkRes.clone());
        }
        return networkRes;
      }).catch(() => {
        return cached;
      });

      return cached || fetchPromise;
    })
  );
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

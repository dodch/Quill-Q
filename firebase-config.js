/**
 * firebase-config.js - Shared Firebase Credentials & Init for Quill-Q
 */
var firebaseConfig = window.firebaseConfig || {
  projectId: "quill-q-dodch",
  appId: "1:648049411331:web:880ce305ebe145df9e9536",
  storageBucket: "quill-q-dodch.firebasestorage.app",
  apiKey: "AIzaSyBhOd39WoozsZBCrCRjQt1D23uoTJqqZgk",
  authDomain: "quill-q-dodch.firebaseapp.com",
  messagingSenderId: "648049411331",
  projectNumber: "648049411331",
  vapidKey: "BFYzADoTQ1yCuaWyT00HXmt06FFxJ1xgW8Af7xrskV3-i51JYoL6idPnTnPqZAMRuyMl6D5tYebZ5ZWGmGcIyYw",
  // Cloudflare Worker Push Dispatcher URL
  pushEndpoint: "https://quill-push-dispatcher.dodchadam.workers.dev"
};
window.firebaseConfig = firebaseConfig;

function initFirebase() {
  if (typeof firebase !== "undefined" && !firebase.apps.length) {
    try {
      firebase.initializeApp(firebaseConfig);
    } catch (e) {
      console.warn("Firebase initialization warning:", e);
    }
  }
  return {
    auth: typeof firebase !== "undefined" ? firebase.auth() : null,
    db: typeof firebase !== "undefined" ? firebase.firestore() : null,
    storage: typeof firebase !== "undefined" && typeof firebase.storage === "function" ? firebase.storage() : null
  };
}

/**
 * Universal background push notification dispatcher.
 * Sends payload to Cloudflare Worker, which delivers to Google FCM
 * even when users have closed their browser tabs and locked devices.
 */
async function broadcastPushNotification({ title, body, url, targetView, tag }) {
  const endpoint = (typeof firebaseConfig !== "undefined" && firebaseConfig.pushEndpoint)
    ? firebaseConfig.pushEndpoint
    : (typeof localStorage !== "undefined" ? (localStorage.getItem("quill_push_endpoint") || "") : "");

  if (!endpoint) {
    // Worker not configured yet; silences until configured
    return;
  }

  try {
    let senderId = null;
    let senderName = null;
    if (typeof firebase !== "undefined" && firebase.auth && firebase.auth().currentUser) {
      const u = firebase.auth().currentUser;
      senderId = u.uid;
      senderName = u.displayName || null;
    }

    const payload = {
      title: title || "Quill-Q Notification",
      body: body || "",
      url: url || "./index.html",
      targetView: targetView || "home",
      tag: tag || ("quill-" + Date.now()),
      senderId,
      senderName
    };

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch((err) => console.warn("Push dispatch error:", err));
  } catch (e) {
    console.warn("Could not dispatch push notification:", e);
  }
}

if (typeof window !== "undefined") {
  window.firebaseConfig = firebaseConfig;
  window.initFirebase = initFirebase;
  window.broadcastPushNotification = broadcastPushNotification;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { firebaseConfig, initFirebase, broadcastPushNotification };
}

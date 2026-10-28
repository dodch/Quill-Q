/**
 * firebase-config.js - Shared Firebase Credentials & Init for Quill-Q
 */
const firebaseConfig = {
  projectId: "quill-q-dodch",
  appId: "1:648049411331:web:880ce305ebe145df9e9536",
  storageBucket: "quill-q-dodch.firebasestorage.app",
  apiKey: "AIzaSyBhOd39WoozsZBCrCRjQt1D23uoTJqqZgk",
  authDomain: "quill-q-dodch.firebaseapp.com",
  messagingSenderId: "648049411331",
  projectNumber: "648049411331"
};

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

if (typeof window !== "undefined") {
  window.firebaseConfig = firebaseConfig;
  window.initFirebase = initFirebase;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { firebaseConfig, initFirebase };
}

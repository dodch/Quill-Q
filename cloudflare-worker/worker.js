/**
 * Quill-Q FCM Push Dispatcher - Cloudflare Worker
 * 100% Free on Cloudflare Workers (Up to 100,000 requests/day)
 * 
 * Securely communicates with Google Firebase Cloud Messaging (FCM HTTP v1)
 * to deliver background push notifications even when tabs/browsers are closed.
 */

// In Cloudflare Dashboard, set these Environment Variables / Secrets:
// - FIREBASE_PROJECT_ID: "quill-q-dodch"
// - FIREBASE_CLIENT_EMAIL: (from your service account json)
// - FIREBASE_PRIVATE_KEY: (from your service account json, including -----BEGIN PRIVATE KEY-----)

let cachedAccessToken = null;
let tokenExpiresAt = 0;

export default {
  async fetch(request, env) {
    // Enable CORS for Quill-Q domain
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400"
        }
      });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    try {
      const payload = await request.json();
      const { title, body, url, targetView, tag, senderId, targetGroup } = payload;

      if (!title) {
        return new Response(JSON.stringify({ error: "Missing notification title" }), {
          status: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }

      let projectId = env.FIREBASE_PROJECT_ID;
      if (!projectId || projectId.includes("@")) {
        projectId = "quill-q-dodch";
      }
      const clientEmail = env.FIREBASE_CLIENT_EMAIL;
      const rawPrivateKey = env.FIREBASE_PRIVATE_KEY;

      if (!clientEmail || !rawPrivateKey) {
        return new Response(JSON.stringify({
          error: "Cloudflare Worker environment variables missing. Please set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY."
        }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }

      // 1. Get or reuse OAuth2 Google Access Token
      const accessToken = await getGoogleOAuth2Token(clientEmail, rawPrivateKey);

      // 2. Fetch all registered subscriber device tokens from Firestore matching group isolation
      const tokens = await fetchSubscriberTokens(projectId, accessToken, senderId, targetGroup);

      if (tokens.length === 0) {
        return new Response(JSON.stringify({ success: true, message: "No registered device tokens found.", delivered: 0 }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }

      // 3. Dispatch multicast push via Google FCM HTTP v1 API
      const results = await Promise.allSettled(
        tokens.map((token) => sendFcmPush(projectId, accessToken, token, {
          title,
          body,
          url: url || "./index.html",
          targetView: targetView || "home",
          tag: tag || ("quill-" + Date.now())
        }))
      );

      const deliveredCount = results.filter(r => r.status === "fulfilled" && r.value === true).length;

      return new Response(JSON.stringify({
        success: true,
        totalSubscribers: tokens.length,
        delivered: deliveredCount
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || "Push dispatch failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
  }
};

/**
 * Generates an OAuth2 JWT and exchanges it for a Google Access Token
 */
async function getGoogleOAuth2Token(clientEmail, privateKeyPem) {
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && now < tokenExpiresAt - 60) {
    return cachedAccessToken;
  }

  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/firebase.messaging https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaim = base64UrlEncode(JSON.stringify(claimSet));
  const signatureInput = `${encodedHeader}.${encodedClaim}`;

  const binaryKey = pemToBinary(privateKeyPem);
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signatureInput)
  );

  const jwt = `${signatureInput}.${base64UrlEncodeBytes(new Uint8Array(signature))}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google OAuth2 Token error: ${errText}`);
  }

  const data = await res.json();
  cachedAccessToken = data.access_token;
  tokenExpiresAt = now + (data.expires_in || 3600);
  return cachedAccessToken;
}

/**
 * Queries Firestore REST API for user device tokens in /users/{uid}/fcmTokens
 * Applies group isolation:
 * - If targetGroup is specified, students from other groups are filtered out.
 * - Teachers and Admins receive all group notifications.
 */
async function fetchSubscriberTokens(projectId, accessToken, excludeUserId, targetGroup) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
  const query = {
    structuredQuery: {
      from: [{ collectionId: "fcmTokens", allDescendants: true }]
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(query)
  });

  if (!res.ok) {
    return [];
  }

  const list = await res.json();
  const tokenSet = new Set();

  for (const item of list) {
    const doc = item.document;
    if (!doc || !doc.fields) continue;
    
    const tokenVal = doc.fields.token?.stringValue;
    const userIdVal = doc.fields.userId?.stringValue;
    const userRole = doc.fields.userRole?.stringValue || "student";
    const tokenGroup = doc.fields.group?.stringValue || "grp1";

    // Don't send push notification to the author that created the item
    if (excludeUserId && userIdVal === excludeUserId) continue;

    // Group isolation filter:
    // If targetGroup is provided and recipient is a student whose group differs, skip!
    // Teachers and Admins always receive notifications across both groups.
    if (targetGroup && userRole === "student" && tokenGroup !== targetGroup) {
      continue;
    }

    if (tokenVal) {
      tokenSet.add(tokenVal);
    }
  }

  return Array.from(tokenSet);
}

/**
 * Sends a push notification to an individual device token using FCM HTTP v1
 */
async function sendFcmPush(projectId, accessToken, token, { title, body, url, targetView, tag }) {
  const fcmUrl = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
  const payload = {
    message: {
      token: token,
      notification: {
        title: title,
        body: body
      },
      data: {
        url: url,
        targetView: targetView,
        tag: tag
      },
      webpush: {
        headers: {
          Urgency: "high"
        },
        notification: {
          icon: "assets/icon-192.png",
          badge: "assets/favicon-32x32-light.png",
          tag: tag,
          renotify: true
        }
      }
    }
  };

  const res = await fetch(fcmUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return res.ok;
}

function pemToBinary(pem) {
  const cleaned = pem
    .replace(/-----BEGIN[ A-Z_-]+-----/g, "")
    .replace(/-----END[ A-Z_-]+-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function base64UrlEncode(str) {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlEncodeBytes(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

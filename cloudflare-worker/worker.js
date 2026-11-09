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
    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-Action, X-Filename",
      "Access-Control-Max-Age": "86400"
    };

    // Enable CORS for Quill-Q domain
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    // 1. Serve Media directly from Cloudflare R2: GET /media/*
    if (request.method === "GET" && url.pathname.startsWith("/media/")) {
      const key = decodeURIComponent(url.pathname.replace(/^\/media\//, ""));
      if (!key) {
        return new Response("Media key missing", { status: 400, headers: corsHeaders });
      }
      if (!env.MEDIA_BUCKET) {
        return new Response("MEDIA_BUCKET R2 binding is not configured in Cloudflare.", { status: 500, headers: corsHeaders });
      }

      const object = await env.MEDIA_BUCKET.get(key);
      if (!object) {
        return new Response("File not found", { status: 404, headers: corsHeaders });
      }

      const headers = new Headers();
      if (typeof object.writeHttpMetadata === "function") {
        object.writeHttpMetadata(headers);
      } else if (object.httpMetadata?.contentType) {
        headers.set("Content-Type", object.httpMetadata.contentType);
      }
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      if (object.httpEtag) headers.set("ETag", object.httpEtag);
      return new Response(object.body, { headers });
    }

    // 2. Upload Media to Cloudflare R2: POST /upload
    if (request.method === "POST" && (url.pathname === "/upload" || url.pathname.endsWith("/upload"))) {
      if (!env.MEDIA_BUCKET) {
        return new Response(JSON.stringify({
          error: "Cloudflare R2 MEDIA_BUCKET binding missing. Please bind R2 bucket 'quill-media' to variable 'MEDIA_BUCKET'."
        }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      try {
        let fileBuffer = null;
        let mimeType = "image/webp";
        let fileName = "upload.webp";

        const contentType = request.headers.get("content-type") || "";

        if (contentType.includes("multipart/form-data")) {
          const formData = await request.formData();
          const file = formData.get("file");
          if (!file || typeof file === "string") {
            return new Response(JSON.stringify({ error: "No file found in form data" }), {
              status: 400,
              headers: { "Content-Type": "application/json", ...corsHeaders }
            });
          }
          fileBuffer = await file.arrayBuffer();
          mimeType = file.type || "application/octet-stream";
          fileName = file.name || "upload";
        } else if (contentType.includes("application/json")) {
          const body = await request.json();
          if (body.dataUrl) {
            const match = body.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
            if (!match) throw new Error("Invalid dataUrl format");
            mimeType = match[1];
            const binary = atob(match[2]);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            fileBuffer = bytes.buffer;
          } else {
            throw new Error("Missing dataUrl in JSON body");
          }
          fileName = body.filename || `image.${mimeType.split("/")[1] || "webp"}`;
        } else {
          fileBuffer = await request.arrayBuffer();
          mimeType = contentType || "application/octet-stream";
          fileName = request.headers.get("x-filename") || "upload";
        }

        if (!fileBuffer || fileBuffer.byteLength === 0) {
          return new Response(JSON.stringify({ error: "Empty file received" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }

        const ext = fileName.includes(".") ? fileName.substring(fileName.lastIndexOf(".")) : ("." + (mimeType.split("/")[1] || "bin"));
        const randomId = Math.random().toString(36).substring(2, 10);
        const key = `uploads/${Date.now()}-${randomId}${ext.toLowerCase()}`;

        await env.MEDIA_BUCKET.put(key, fileBuffer, {
          httpMetadata: {
            contentType: mimeType,
            cacheControl: "public, max-age=31536000, immutable"
          }
        });

        const publicUrl = env.MEDIA_PUBLIC_URL 
          ? `${env.MEDIA_PUBLIC_URL.replace(/\/+$/, '')}/${key}` 
          : `${url.origin}/media/${key}`;

        return new Response(JSON.stringify({
          success: true,
          url: publicUrl,
          key: key,
          size: fileBuffer.byteLength,
          mimeType: mimeType
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      } catch (uploadErr) {
        return new Response(JSON.stringify({ error: uploadErr.message || "Upload failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // 3. FCM Push Notifications (Existing Dispatcher)
    try {
      const payload = await request.json();
      const { title, body, url: notifUrl, targetView, tag, senderId, targetGroup, targetRole } = payload;

      if (!title) {
        return new Response(JSON.stringify({ error: "Missing notification title" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
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
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      // 1. Get or reuse OAuth2 Google Access Token
      const accessToken = await getGoogleOAuth2Token(clientEmail, rawPrivateKey);

      // 2. Fetch all registered subscriber device tokens from Firestore matching role and group isolation
      const tokens = await fetchSubscriberTokens(projectId, accessToken, senderId, targetGroup, targetRole, targetView);

      if (tokens.length === 0) {
        return new Response(JSON.stringify({ success: true, message: "No registered device tokens found.", delivered: 0 }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      // 3. Dispatch multicast push via Google FCM HTTP v1 API
      const results = await Promise.allSettled(
        tokens.map((token) => sendFcmPush(projectId, accessToken, token, {
          title,
          body,
          url: notifUrl || "./index.html",
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
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || "Push dispatch failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
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
async function fetchSubscriberTokens(projectId, accessToken, excludeUserId, targetGroup, targetRole, targetView) {
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

  const isApprovalNotification = (targetView === "approvals" || targetRole === "teacher" || targetRole === "admin");
  const normalizedTargetRole = (targetRole || "").toLowerCase();

  for (const item of list) {
    const doc = item.document;
    if (!doc || !doc.fields) continue;
    
    const tokenVal = doc.fields.token?.stringValue;
    const userIdVal = doc.fields.userId?.stringValue;
    const userRole = (doc.fields.userRole?.stringValue || "student").toLowerCase();
    const tokenGroup = doc.fields.group?.stringValue || "grp1";

    // 1. Don't send push notification to the author that created the item
    if (excludeUserId && userIdVal === excludeUserId) continue;

    // 2. Strict Role & Approvals Filter:
    // If targetRole is "admin": ONLY admins receive it!
    if (normalizedTargetRole === "admin") {
      if (userRole !== "admin") continue;
    }
    // If targetView === "approvals" or targetRole === "teacher":
    // ONLY teachers and admins receive it! Students are STRICTLY excluded!
    else if (isApprovalNotification || normalizedTargetRole === "teacher") {
      if (userRole !== "teacher" && userRole !== "admin") {
        continue;
      }
    }

    // 3. Group isolation filter for students:
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
  const isHttpsLink = (typeof url === "string" && url.startsWith("https://"));

  const payload = {
    message: {
      token: token,
      notification: {
        title: title,
        body: body
      },
      data: {
        url: url || "./index.html",
        targetView: targetView || "home",
        tag: tag || ("quill-" + Date.now())
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
        },
        ...(isHttpsLink ? { fcm_options: { link: url } } : {})
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

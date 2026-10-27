/**
 * editor.js - Full-Page React BlockNote Editor Controller for Quill-Q
 * Uses @blocknote/react, @blocknote/core, and @blocknote/mantine with full Notion-style
 * slash command menu (/), formatting toolbar, block drag handles, and JSON import/export.
 */

(function () {
  let db = null;
  let auth = null;
  let currentUser = null;
  let currentProfile = null;
  let currentSubject = null;
  let currentDocId = null;
  let reactEditorBridge = null;
  let isSaving = false;
  let hasPendingChanges = false;
  let autosaveTimer = null;

  const SUPER_ADMIN_EMAILS = ["dodchadam@gmail.com", "dotchadam@gmail.com"];

  // DOM Elements
  const titleInput = document.getElementById("doc-title-input");
  const editorContainer = document.getElementById("blocknote-editor-container");
  const backBtn = document.getElementById("editor-back-btn");
  const backLabel = document.getElementById("editor-back-label");
  const subjectBadge = document.getElementById("editor-subject-badge");
  const subjectName = document.getElementById("editor-subject-name");
  const saveStatus = document.getElementById("editor-save-status");
  const saveStatusIcon = document.getElementById("save-status-icon");
  const saveStatusText = document.getElementById("save-status-text");
  const btnSaveDoc = document.getElementById("btn-save-doc");
  const btnExportMd = document.getElementById("btn-export-md");
  const btnPrintDoc = document.getElementById("btn-print-doc");

  function getQueryParam(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  }

  function isSuperAdminUser(profile, user) {
    if (user && user.email && SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase().trim())) return true;
    if (profile && profile.email && SUPER_ADMIN_EMAILS.includes(profile.email.toLowerCase().trim())) return true;
    if (profile && profile.role === "admin") return true;
    return false;
  }

  function extractExcerpt(blocks, maxLen = 140) {
    if (!blocks || !Array.isArray(blocks)) return "";
    let text = "";
    for (const b of blocks) {
      if (b.content && Array.isArray(b.content)) {
        for (const c of b.content) {
          if (c.text) text += c.text + " ";
        }
      }
      if (text.length >= maxLen) break;
    }
    return text.trim().slice(0, maxLen);
  }

  function updateSaveStatus(status) {
    if (!saveStatus || !saveStatusIcon || !saveStatusText) return;

    if (status === "saving") {
      saveStatus.className = "editor-save-status status-saving";
      saveStatus.style.color = "";
      saveStatusIcon.className = "fi fi-rr-spinner";
      saveStatusText.textContent = "Saving...";
    } else if (status === "saved") {
      saveStatus.className = "editor-save-status status-saved";
      saveStatus.style.color = "";
      saveStatusIcon.className = "fi fi-rr-check";
      saveStatusText.textContent = "Saved";
    } else if (status === "unsaved") {
      saveStatus.className = "editor-save-status";
      saveStatus.style.color = "";
      saveStatusIcon.className = "fi fi-rr-pencil";
      saveStatusText.textContent = "Unsaved changes";
    } else if (status === "error") {
      saveStatus.className = "editor-save-status";
      saveStatus.style.color = "#c92a2a";
      saveStatusIcon.className = "fi fi-rr-cross";
      saveStatusText.textContent = "Save failed";
    }
  }

  function triggerAutosaveDebounced() {
    hasPendingChanges = true;
    updateSaveStatus("unsaved");

    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      saveDocumentToFirestore(false);
    }, 1500);
  }

  async function saveDocumentToFirestore(manual = false) {
    if (isSaving || !db || !currentUser || !currentSubject) return;

    const isSuperAdmin = isSuperAdminUser(currentProfile, currentUser);
    const isApproved = currentProfile && (currentProfile.status === "approved" || isSuperAdmin);

    if (!isApproved) {
      showToast("Cannot save: Account pending administrator approval", "error");
      updateSaveStatus("error");
      return;
    }

    isSaving = true;
    updateSaveStatus("saving");

    try {
      const docTitle = (titleInput ? titleInput.value : "").trim() || "Untitled Document";
      const pages = reactEditorBridge && typeof reactEditorBridge.getPages === "function" ? reactEditorBridge.getPages() : [];
      const blocks = reactEditorBridge && typeof reactEditorBridge.getAllBlocks === "function" ? reactEditorBridge.getAllBlocks() : (reactEditorBridge ? reactEditorBridge.getJSON() : []);
      const jsonString = reactEditorBridge && typeof reactEditorBridge.getJSONString === "function" ? reactEditorBridge.getJSONString() : "{}";
      const excerpt = extractExcerpt(blocks, 150) || "Empty document...";
      const pageCount = pages.length || 1;

      const collectionRef = db.collection("subjects").doc(currentSubject.id).collection("documents");

      const docPayload = {
        subjectId: currentSubject.id,
        subjectName: currentSubject.name,
        title: docTitle,
        content: jsonString,
        excerpt: excerpt,
        pageCount: pageCount,
        authorId: currentUser.uid,
        authorName: currentProfile?.displayName || currentUser.displayName || "Student",
        authorRole: currentProfile?.role || "student",
        authorAvatar: currentProfile?.avatarUrl || "assets/avatars/avatar-1.svg",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      if (!currentDocId) {
        // Create new Firestore document
        docPayload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        const newDocRef = await collectionRef.add(docPayload);
        currentDocId = newDocRef.id;

        // Update URL query params without reloading
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("docId", currentDocId);
        newUrl.searchParams.delete("action");
        window.history.replaceState({}, "", newUrl.toString());

        if (manual) showToast("Document created and saved!");
      } else {
        // Update existing document
        await collectionRef.doc(currentDocId).update(docPayload);
        if (manual) showToast("Document saved successfully!");
      }

      hasPendingChanges = false;
      updateSaveStatus("saved");
    } catch (err) {
      console.error("Firestore save error:", err);
      updateSaveStatus("error");
      showToast("Save failed: " + err.message, "error");
    } finally {
      isSaving = false;
    }
  }

  async function loadExistingDocument(docId) {
    try {
      const docRef = db.collection("subjects").doc(currentSubject.id).collection("documents").doc(docId);
      const snapshot = await docRef.get();

      if (!snapshot.exists) {
        showToast("Document not found. Creating a fresh document.", "error");
        mountReactBlockNote();
        return;
      }

      const data = snapshot.data();
      if (titleInput && data.title) {
        titleInput.value = data.title;
        document.title = `${data.title} – Quill-Q Editor`;
      }

      mountReactBlockNote(data.content);
      updateSaveStatus("saved");
    } catch (err) {
      console.error("Error loading document:", err);
      showToast("Error loading document: " + err.message, "error");
      mountReactBlockNote();
    }
  }

  function mountReactBlockNote(initialContent) {
    if (!editorContainer) return;

    const renderFn = window.renderMultiPageBlockNote || window.renderBlockNoteReact;
    if (typeof renderFn !== "function") {
      editorContainer.innerHTML = `<div style="padding: 30px; text-align: center; color: #c92a2a; font-family: Outfit, sans-serif;">
        BlockNote React bundle is still initializing or unavailable. Please reload the page.
      </div>`;
      return;
    }

    try {
      const docTitle = titleInput ? titleInput.value : "";
      const subjName = currentSubject ? currentSubject.name : "";

      reactEditorBridge = renderFn(editorContainer, {
        initialContent: initialContent || undefined,
        docTitle: docTitle,
        subjectName: subjName,
        onChange: () => {
          triggerAutosaveDebounced();
        },
        onBridgeReady: (bridge) => {
          reactEditorBridge = bridge;
        }
      });
    } catch (err) {
      console.error("Error rendering React BlockNote:", err);
      editorContainer.innerHTML = `<div style="padding: 20px; color: #c92a2a;">Failed to mount BlockNote: ${err.message}</div>`;
    }
  }

  function setupSubjectContext() {
    const subjectParam = getQueryParam("subject") || getQueryParam("id") || "writing";
    currentSubject = typeof getSubjectById === "function" ? getSubjectById(subjectParam) : null;

    if (!currentSubject) {
      currentSubject = {
        id: "writing",
        name: "Writing",
        code: "ENG-202",
        bgClass: "card-blue"
      };
    }

    if (backBtn) {
      backBtn.href = `subject.html?id=${encodeURIComponent(currentSubject.id)}`;
    }
    if (backLabel) {
      backLabel.textContent = currentSubject.shortName || currentSubject.name;
    }
    if (subjectBadge) {
      subjectBadge.className = `editor-subject-badge ${currentSubject.bgClass || "card-peach"}`;
    }
    if (subjectName) {
      subjectName.textContent = currentSubject.name;
    }

    document.title = `Editor – ${currentSubject.name} – Quill-Q`;
  }

  function setupExportHandlers() {
    // Export to Markdown
    if (btnExportMd) {
      btnExportMd.addEventListener("click", async () => {
        if (!reactEditorBridge) return;
        try {
          const md = await reactEditorBridge.getMarkdown();
          const docTitle = (titleInput.value || "document").trim().replace(/[^a-z0-9_-]/gi, "_");
          downloadTextFile(`${docTitle}.md`, md, "text/markdown");
          showToast("Exported to Markdown file!");
        } catch (err) {
          console.error("Markdown export error:", err);
          showToast("Markdown export failed: " + err.message, "error");
        }
      });
    }

    // Print / PDF
    if (btnPrintDoc) {
      btnPrintDoc.addEventListener("click", () => {
        window.print();
      });
    }

    // Manual Save Button
    if (btnSaveDoc) {
      btnSaveDoc.addEventListener("click", () => {
        saveDocumentToFirestore(true);
      });
    }

    // Title input changes trigger autosave and update running headers live
    if (titleInput) {
      titleInput.addEventListener("input", () => {
        const titleVal = titleInput.value;
        if (reactEditorBridge && typeof reactEditorBridge.setDocTitle === "function") {
          reactEditorBridge.setDocTitle(titleVal);
        }
        document.title = `${titleVal.trim() || "Untitled"} – Quill-Q Editor`;
        triggerAutosaveDebounced();
      });
    }

    // Keyboard shortcut: Ctrl+S / Cmd+S
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveDocumentToFirestore(true);
      }
    });

    // Warn on leaving with pending changes
    window.addEventListener("beforeunload", (e) => {
      if (hasPendingChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      }
    });
  }

  function downloadTextFile(filename, text, mimeType = "text/plain") {
    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 150);
  }

  function showToast(msg, type = "success") {
    const container = document.getElementById("inapp-toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `inapp-toast ${type === "error" ? "toast-error" : ""}`;
    toast.innerHTML = `<span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-10px)";
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  }

  // Initialization
  document.addEventListener("DOMContentLoaded", () => {
    setupSubjectContext();
    setupExportHandlers();

    currentDocId = getQueryParam("docId");

    // Initialize Firebase
    if (typeof initFirebase === "function") {
      const fb = initFirebase();
      auth = fb.auth;
      db = fb.db;
    }

    if (auth) {
      auth.onAuthStateChanged(async (user) => {
        if (!user) {
          window.location.href = "index.html";
          return;
        }

        currentUser = user;

        // Fetch user profile
        try {
          const userDoc = await db.collection("users").doc(user.uid).get();
          if (userDoc.exists) {
            currentProfile = userDoc.data();
          } else {
            currentProfile = {
              displayName: user.displayName || user.email.split("@")[0],
              email: user.email,
              role: isSuperAdminUser(null, user) ? "admin" : "student",
              status: isSuperAdminUser(null, user) ? "approved" : "pending"
            };
          }
        } catch (e) {
          console.warn("Could not load user profile:", e);
          currentProfile = {
            email: user.email,
            role: isSuperAdminUser(null, user) ? "admin" : "student",
            status: isSuperAdminUser(null, user) ? "approved" : "pending"
          };
        }

        // Load document if docId is provided, otherwise initialize fresh editor
        if (currentDocId) {
          await loadExistingDocument(currentDocId);
        } else {
          mountReactBlockNote();
          if (titleInput) titleInput.focus();
        }
      });
    }
  });
})();

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
    if (!canEditDocument) return;
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
        pinnedNotes: pinnedNotesCache || [],
        authorId: currentUser.uid,
        authorName: currentProfile?.displayName || currentUser.displayName || "Student",
        authorRole: currentProfile?.role || "student",
        authorAvatar: currentProfile?.photoURL || currentProfile?.avatarUrl || currentUser?.photoURL || "assets/avatar.jpg",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      if (!currentDocId) {
        // Create new Firestore document
        docPayload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        const newDocRef = await collectionRef.add(docPayload);
        const prevDraftKey = getPinnedNotesStorageKey();
        currentDocId = newDocRef.id;

        // Migrate local storage key from draft to new docId
        savePinnedNotes();
        try { localStorage.removeItem(prevDraftKey); } catch (e) {}

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

  let canEditDocument = true;

  async function loadExistingDocument(docId) {
    try {
      const docRef = db.collection("subjects").doc(currentSubject.id).collection("documents").doc(docId);
      const snapshot = await docRef.get();

      if (!snapshot.exists) {
        showToast("Document not found. Creating a fresh document.", "error");
        canEditDocument = true;
        applyEditingPermissions(true);
        mountReactBlockNote(undefined, true);
        return;
      }

      const data = snapshot.data();
      const isSuperAdmin = isSuperAdminUser(currentProfile, currentUser);
      canEditDocument = isSuperAdmin || (currentUser && data.authorId === currentUser.uid);

      applyEditingPermissions(canEditDocument, data.authorName);

      if (titleInput && data.title) {
        titleInput.value = data.title;
        document.title = `${data.title} – Quill-Q ${canEditDocument ? "Editor" : "Reader"}`;
      }

      // Load saved pinned notes from Firestore document
      if (Array.isArray(data.pinnedNotes)) {
        pinnedNotesCache = data.pinnedNotes;
        savePinnedNotes();
        renderPinnedNotes();
      } else {
        loadPinnedNotes();
      }

      mountReactBlockNote(data.content, canEditDocument);
      if (canEditDocument) {
        updateSaveStatus("saved");
      }
    } catch (err) {
      console.error("Error loading document:", err);
      showToast("Error loading document: " + err.message, "error");
      canEditDocument = true;
      applyEditingPermissions(true);
      loadPinnedNotes();
      mountReactBlockNote(undefined, true);
    }
  }

  function applyEditingPermissions(canEdit, authorName = "") {
    if (!canEdit) {
      // Viewer Mode: Hide manual save button and save status indicator
      if (btnSaveDoc) btnSaveDoc.style.display = "none";
      if (saveStatus) {
        saveStatus.className = "editor-save-status";
        saveStatus.style.color = "#7d756d";
        if (saveStatusIcon) saveStatusIcon.className = "fi fi-rr-eye";
        if (saveStatusText) saveStatusText.textContent = authorName ? `By ${authorName}` : "Read only";
      }

      // Title input is read-only for viewer
      if (titleInput) {
        titleInput.readOnly = true;
        titleInput.style.cursor = "default";
      }
    } else {
      // Editor Mode: Show save button
      if (btnSaveDoc) btnSaveDoc.style.display = "inline-flex";
      if (titleInput) {
        titleInput.readOnly = false;
        titleInput.style.cursor = "text";
      }
    }
  }

  function mountReactBlockNote(initialContent, editable = true) {
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
        editable: editable,
        onChange: () => {
          if (editable) {
            triggerAutosaveDebounced();
          }
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
    if (subjectBadge) {
      subjectBadge.className = `editor-subject-badge ${currentSubject.bgClass || "card-peach"}`;
    }
    if (subjectName) {
      subjectName.textContent = currentSubject.name;
    }

    document.title = `Editor – ${currentSubject.name} – Quill-Q`;
  }

  function setupExportHandlers() {
    // More Options Dropdown Toggle (Markdown, Print)
    const btnMore = document.getElementById("btn-editor-more");
    const moreMenu = document.getElementById("editor-more-menu");
    const moreWrap = document.getElementById("editor-more-dropdown-wrap");

    if (btnMore && moreMenu) {
      btnMore.addEventListener("click", (e) => {
        e.stopPropagation();
        moreMenu.classList.toggle("view-hidden");
      });

      document.addEventListener("click", (e) => {
        if (moreWrap && !moreWrap.contains(e.target)) {
          moreMenu.classList.add("view-hidden");
        }
      });
    }

    // Export to Markdown
    if (btnExportMd) {
      btnExportMd.addEventListener("click", async () => {
        if (moreMenu) moreMenu.classList.add("view-hidden");
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
        if (moreMenu) moreMenu.classList.add("view-hidden");
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

    initSmartStickyNavbar();
  }

  // Smart Sticky Navbar: slides up when scrolling down, reappears immediately when scrolling up
  function initSmartStickyNavbar() {
    const topBar = document.querySelector(".editor-top-bar");
    if (!topBar) return;

    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    let ticking = false;
    const hideThreshold = 8; // Pixels down before hiding
    const showThreshold = 4; // Pixels up before revealing

    const getScrollY = () => Math.max(0, window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);

    const onScroll = () => {
      const currentScrollY = getScrollY();
      const delta = currentScrollY - lastScrollY;

      // Always show at or near the top
      if (currentScrollY <= 40) {
        topBar.classList.remove("nav-hidden");
        topBar.classList.add("nav-visible");
      } else if (delta > hideThreshold) {
        // Scrolling DOWN -> hide bar smoothly
        if (!topBar.classList.contains("nav-hidden")) {
          topBar.classList.add("nav-hidden");
          topBar.classList.remove("nav-visible");
          const moreMenu = document.getElementById("editor-more-menu");
          if (moreMenu) moreMenu.classList.add("view-hidden");
        }
      } else if (delta < -showThreshold) {
        // Scrolling UP -> reveal bar immediately wherever the user is
        if (topBar.classList.contains("nav-hidden") || !topBar.classList.contains("nav-visible")) {
          topBar.classList.remove("nav-hidden");
          topBar.classList.add("nav-visible");
        }
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScrollEvent = () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScrollEvent, { passive: true });
    document.addEventListener("scroll", handleScrollEvent, { passive: true });

    // Wheel detection (instant on mouse/trackpad)
    window.addEventListener("wheel", (e) => {
      if (e.deltaY < -4) {
        // Scrolling up -> show immediately
        topBar.classList.remove("nav-hidden");
        topBar.classList.add("nav-visible");
      } else if (e.deltaY > 6 && getScrollY() > 50) {
        // Scrolling down -> hide smoothly
        topBar.classList.add("nav-hidden");
        topBar.classList.remove("nav-visible");
        const moreMenu = document.getElementById("editor-more-menu");
        if (moreMenu) moreMenu.classList.add("view-hidden");
      }
    }, { passive: true });

    let touchStartY = 0;
    window.addEventListener("touchstart", (e) => {
      if (e.touches && e.touches[0]) {
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener("touchmove", (e) => {
      if (!e.touches || !e.touches[0]) return;
      const touchY = e.touches[0].clientY;
      const touchDelta = touchY - touchStartY;
      if (touchDelta > 12) {
        // Swiping downwards (page scrolls UP) -> reveal navbar
        topBar.classList.remove("nav-hidden");
        topBar.classList.add("nav-visible");
      } else if (touchDelta < -15 && getScrollY() > 50) {
        // Swiping upwards (page scrolls DOWN) -> hide navbar
        topBar.classList.add("nav-hidden");
        topBar.classList.remove("nav-visible");
        const moreMenu = document.getElementById("editor-more-menu");
        if (moreMenu) moreMenu.classList.add("view-hidden");
      }
    }, { passive: true });
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

  // =========================================================
  // ===== PINNED PAPER NOTES MANAGER (STATIC SIDE NOTES) ====
  // =========================================================
  const MAX_PINNED_NOTES = 2; // Maximum 2 pinned notes
  const MAX_PINNED_NOTE_WORDS = 18; // Maximum 18 words per pinned note
  let pinnedNotesCache = [];

  function countWords(str) {
    if (!str || !str.trim()) return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
  }

  function getPinnedNotesStorageKey() {
    const docKey = currentDocId || "draft";
    const subjKey = currentSubject ? currentSubject.id : "gen";
    return `quill_q_pinned_notes_${subjKey}_${docKey}`;
  }

  function loadPinnedNotes() {
    try {
      const saved = localStorage.getItem(getPinnedNotesStorageKey());
      pinnedNotesCache = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(pinnedNotesCache)) pinnedNotesCache = [];
    } catch (e) {
      pinnedNotesCache = [];
    }
    renderPinnedNotes();
  }

  function savePinnedNotes() {
    try {
      localStorage.setItem(getPinnedNotesStorageKey(), JSON.stringify(pinnedNotesCache));
    } catch (e) {}
  }

  function renderPinnedNotes() {
    const listEl = document.getElementById("pinned-notes-list") || document.getElementById("pinned-notes-sidebar");
    const addBtn = document.getElementById("btn-create-pinned-note");
    const mobileTrigger = document.getElementById("mobile-pinned-notes-trigger");
    const mobileBadge = document.getElementById("mobile-pin-badge");
    if (!listEl) return;

    const count = pinnedNotesCache.length;

    // Update desktop Add Note button
    if (addBtn) {
      if (count >= MAX_PINNED_NOTES) {
        addBtn.disabled = true;
        addBtn.title = "Maximum 3 pinned notes reached";
        addBtn.style.opacity = "0.55";
        addBtn.style.cursor = "not-allowed";
      } else {
        addBtn.disabled = false;
        addBtn.title = `Add a pinned note (${count}/${MAX_PINNED_NOTES})`;
        addBtn.style.opacity = "1";
        addBtn.style.cursor = "pointer";
      }
    }

    // Update mobile pin button visibility and count badge
    if (mobileTrigger) {
      if (count > 0) {
        mobileTrigger.classList.remove("view-hidden");
        if (mobileBadge) mobileBadge.textContent = String(count);
      } else {
        mobileTrigger.classList.add("view-hidden");
      }
    }

    if (count === 0) {
      listEl.innerHTML = `
        <div style="font-family: 'Caveat', cursive; font-size: 1.3rem; color: #8e8579; text-align: center; padding: 24px 10px;">
          No notes pinned yet.<br/>Tap "+ Add Note" to pin one!
        </div>
      `;
      closeMobilePinnedDrawer();
      return;
    }

    listEl.innerHTML = pinnedNotesCache
      .map((note, index) => {
        const color = note.color || "pink";
        // Alternate tape styles: Corner tapes or top horizontal tape
        const isTopTape = note.tapeStyle === "top";
        const tapeHtml = isTopTape
          ? `<div class="pinned-top-tape"></div>`
          : `
            <div class="pinned-tape-section"></div>
            <div class="pinned-tape-section"></div>
          `;

        const escapedText = String(note.text || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        return `
          <div class="pinned-paper-note ${color}" data-note-id="${note.id}">
            ${tapeHtml}
            <button type="button" class="pinned-note-delete" data-del-id="${note.id}" title="Remove note" aria-label="Remove note">
              <i class="fi fi-rr-cross"></i>
            </button>
            <p>${escapedText}</p>
          </div>
        `;
      })
      .join("");

    // Bind delete buttons
    listEl.querySelectorAll(".pinned-note-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-del-id");
        deletePinnedNote(id);
      });
    });
  }

  function openMobilePinnedDrawer() {
    const sidebar = document.getElementById("pinned-notes-sidebar");
    const backdrop = document.getElementById("pinned-drawer-backdrop");
    if (sidebar) sidebar.classList.add("drawer-open");
    if (backdrop) backdrop.classList.remove("view-hidden");
  }

  function closeMobilePinnedDrawer() {
    const sidebar = document.getElementById("pinned-notes-sidebar");
    const backdrop = document.getElementById("pinned-drawer-backdrop");
    if (sidebar) sidebar.classList.remove("drawer-open");
    if (backdrop) backdrop.classList.add("view-hidden");
  }

  function deletePinnedNote(id) {
    pinnedNotesCache = pinnedNotesCache.filter((n) => n.id !== id);
    savePinnedNotes();
    renderPinnedNotes();
    showToast("Pinned note removed");
    if (canEditDocument) {
      triggerAutosaveDebounced();
    }
  }

  function initPinnedNotesManager() {
    const addBtn = document.getElementById("btn-create-pinned-note");
    const modal = document.getElementById("pinned-note-modal");
    const closeBtn = document.getElementById("modal-pinned-note-close");
    const cancelBtn = document.getElementById("btn-cancel-pinned-note");
    const form = document.getElementById("pinned-note-form");
    const textarea = document.getElementById("pinned-note-text");
    const wordCountEl = document.getElementById("pinned-note-word-count");

    // Mobile Drawer Controls
    const mobileTrigger = document.getElementById("mobile-pinned-notes-trigger");
    const closeDrawerBtn = document.getElementById("btn-close-pinned-drawer");
    const backdrop = document.getElementById("pinned-drawer-backdrop");

    if (mobileTrigger) {
      mobileTrigger.addEventListener("click", openMobilePinnedDrawer);
    }
    if (closeDrawerBtn) {
      closeDrawerBtn.addEventListener("click", closeMobilePinnedDrawer);
    }
    if (backdrop) {
      backdrop.addEventListener("click", closeMobilePinnedDrawer);
    }

    // Live word count updater
    function updateWordCounter() {
      if (!textarea || !wordCountEl) return;
      const words = countWords(textarea.value);
      wordCountEl.textContent = `${words} / ${MAX_PINNED_NOTE_WORDS} words`;
      if (words > MAX_PINNED_NOTE_WORDS) {
        wordCountEl.style.color = "#c92a2a";
        wordCountEl.style.fontWeight = "700";
      } else {
        wordCountEl.style.color = "#7d756d";
        wordCountEl.style.fontWeight = "600";
      }
    }

    if (textarea) {
      textarea.addEventListener("input", updateWordCounter);
    }

    loadPinnedNotes();

    function openModal() {
      if (pinnedNotesCache.length >= MAX_PINNED_NOTES) {
        showToast("Maximum of 2 pinned notes reached. Delete one first.", "error");
        return;
      }
      if (form) form.reset();
      updateWordCounter();
      if (modal) modal.classList.remove("view-hidden");
      if (textarea) setTimeout(() => textarea.focus(), 60);
    }

    function closeModal() {
      if (modal) modal.classList.add("view-hidden");
    }

    if (addBtn) addBtn.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = textarea ? textarea.value.trim() : "";
        if (!text) return;

        if (pinnedNotesCache.length >= MAX_PINNED_NOTES) {
          showToast("Maximum of 2 pinned notes allowed.", "error");
          closeModal();
          return;
        }

        const words = countWords(text);
        if (words > MAX_PINNED_NOTE_WORDS) {
          showToast(`Note is too long (${words} words). Maximum is ${MAX_PINNED_NOTE_WORDS} words.`, "error");
          if (textarea) textarea.focus();
          return;
        }

        const colorInput = form.querySelector('input[name="pinned-color"]:checked');
        const color = colorInput ? colorInput.value : "pink";

        // Alternate tape style: first note corner tapes, second top tape
        const tapeStyle = pinnedNotesCache.length % 2 === 1 ? "top" : "corners";

        const newNote = {
          id: "pin-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
          text: text,
          color: color,
          tapeStyle: tapeStyle,
          createdAt: Date.now()
        };

        pinnedNotesCache.push(newNote);
        savePinnedNotes();
        renderPinnedNotes();
        closeModal();
        showToast("Note pinned to side!");

        // Trigger autosave to sync with Firestore
        if (canEditDocument) {
          triggerAutosaveDebounced();
        }

        // On mobile, open drawer to show the newly pinned card
        if (window.innerWidth <= 1220) {
          openMobilePinnedDrawer();
        }
      });
    }
  }

  // Initialization
  document.addEventListener("DOMContentLoaded", () => {
    currentDocId = getQueryParam("docId");
    setupSubjectContext();
    setupExportHandlers();
    initPinnedNotesManager();

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

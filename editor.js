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
  let loadedDocumentData = null;
  let reactEditorBridge = null;
  let isSaving = false;
  let hasPendingChanges = false;
  let autosaveTimer = null;
  let currentDocType = "document"; // "document" | "exercise"
  let isStudentWorksheet = false;
  let currentStudentSubmission = null;
  let reviewingStudent = null;
  let masterExerciseBlocks = null;
  let submissionsUnsubscribe = null;

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  const SUPER_ADMIN_EMAILS = ["dodchadam@gmail.com", "dotchadam@gmail.com"];

  // DOM Elements
  const titleInput = document.getElementById("doc-title-input");
  const editorContainer = document.getElementById("blocknote-editor-container");
  const backBtn = document.getElementById("editor-back-btn");
  const backLabel = document.getElementById("editor-back-label");
  const subjectBadge = document.getElementById("editor-subject-badge");
  const subjectName = document.getElementById("editor-subject-name");
  const btnSaveDoc = document.getElementById("btn-save-doc");
  const btnSaveIcon = document.getElementById("btn-save-icon");
  const btnSaveText = document.getElementById("btn-save-text");
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
    if (!btnSaveDoc) return;
    const icon = btnSaveIcon || btnSaveDoc.querySelector("i");
    const text = btnSaveText || btnSaveDoc.querySelector("span");

    btnSaveDoc.classList.remove("state-saved", "state-unsaved", "state-saving", "state-error");

    if (status === "saving") {
      btnSaveDoc.classList.add("state-saving");
      btnSaveDoc.title = "Saving changes...";
      if (icon) icon.className = "fi fi-rr-spinner editor-spin-icon";
      if (text) text.textContent = "Saving...";
    } else if (status === "saved") {
      btnSaveDoc.classList.add("state-saved");
      btnSaveDoc.title = "All changes saved (Ctrl+S)";
      if (icon) icon.className = "fi fi-rr-check";
      if (text) text.textContent = "Saved";
    } else if (status === "unsaved") {
      btnSaveDoc.classList.add("state-unsaved");
      btnSaveDoc.title = "Unsaved changes (Click or Ctrl+S to save)";
      if (icon) icon.className = "fi fi-rr-disk";
      if (text) text.textContent = "Unsaved";
    } else if (status === "error") {
      btnSaveDoc.classList.add("state-error");
      btnSaveDoc.title = "Save failed. Click to retry.";
      if (icon) icon.className = "fi fi-rr-cross";
      if (text) text.textContent = "Save Failed";
    }
  }

  function syncTopBarSpacer() {
    const topBar = document.querySelector(".editor-top-bar");
    const spacer = document.querySelector(".editor-top-bar-spacer");
    if (topBar && spacer) {
      const h = topBar.offsetHeight;
      if (h > 0) {
        spacer.style.height = `${h}px`;
        document.documentElement.style.setProperty("--editor-topbar-height", `${h}px`);
      }
    }
  }

  function initTopBarObserver() {
    const topBar = document.querySelector(".editor-top-bar");
    if (!topBar) return;
    syncTopBarSpacer();

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => syncTopBarSpacer());
      ro.observe(topBar);
    }
    window.addEventListener("resize", syncTopBarSpacer);
    window.addEventListener("orientationchange", syncTopBarSpacer);
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

      // 1. If student is working on an exercise worksheet, save to their personal submission subcollection!
      if (isStudentWorksheet) {
        const subDocRef = collectionRef.doc(currentDocId).collection("submissions").doc(currentUser.uid);
        await subDocRef.set({
          studentId: currentUser.uid,
          studentName: currentProfile?.displayName || currentUser.displayName || "Student",
          studentAvatar: currentProfile?.photoURL || currentProfile?.avatarUrl || currentUser?.photoURL || "assets/avatar.jpg",
          studentEmail: currentUser.email,
          content: jsonString,
          pageCount: pageCount,
          status: currentStudentSubmission?.status || "in-progress",
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        hasPendingChanges = false;
        updateSaveStatus("saved");
        if (manual) showToast("Worksheet draft saved!");
        return;
      }

      // 2. If teacher is reviewing a student submission, protect master document from overwriting
      if (reviewingStudent) {
        if (manual) showToast("Viewing student submission (Read-only review mode)");
        updateSaveStatus("saved");
        return;
      }

      const docPayload = {
        subjectId: currentSubject.id,
        subjectName: currentSubject.name,
        title: docTitle,
        docType: loadedDocumentData?.docType || currentDocType,
        content: jsonString,
        excerpt: excerpt,
        pageCount: pageCount,
        pinnedNotes: pinnedNotesCache || [],
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      const isSuperAdmin = isSuperAdminUser(currentProfile, currentUser);

      if (!currentDocId) {
        // Create new Firestore document: Record Original Author
        docPayload.authorId = currentUser.uid;
        docPayload.authorName = currentProfile?.displayName || currentUser.displayName || "Student";
        docPayload.authorRole = currentProfile?.role || "student";
        docPayload.authorAvatar = currentProfile?.photoURL || currentProfile?.avatarUrl || currentUser?.photoURL || "assets/avatar.jpg";
        docPayload.createdAt = firebase.firestore.FieldValue.serverTimestamp();

        const newDocRef = await collectionRef.add(docPayload);
        const prevDraftKey = getPinnedNotesStorageKey();
        currentDocId = newDocRef.id;
        loadedDocumentData = { id: currentDocId, ...docPayload };
        renderAuthorBadge(loadedDocumentData);

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
        // Update existing document: NEVER OVERWRITE ORIGINAL AUTHOR!
        const origAuthorId = loadedDocumentData ? loadedDocumentData.authorId : null;
        const currentUserId = currentUser.uid;

        if (origAuthorId && origAuthorId !== currentUserId) {
          // Document edited by someone else (Admin, Teacher, or Contributor)
          docPayload.lastEditorId = currentUserId;
          docPayload.lastEditorName = currentProfile?.displayName || currentUser.displayName || (isSuperAdmin ? "Admin" : "Editor");
          docPayload.lastEditorRole = currentProfile?.role || (isSuperAdmin ? "admin" : "editor");
          docPayload.lastEditorAvatar = currentProfile?.photoURL || currentProfile?.avatarUrl || currentUser?.photoURL || "assets/avatar.jpg";
          docPayload.lastEditedAt = firebase.firestore.FieldValue.serverTimestamp();

          if (loadedDocumentData) {
            loadedDocumentData.lastEditorId = docPayload.lastEditorId;
            loadedDocumentData.lastEditorName = docPayload.lastEditorName;
            loadedDocumentData.lastEditorRole = docPayload.lastEditorRole;
            loadedDocumentData.lastEditorAvatar = docPayload.lastEditorAvatar;
          }
        } else if (origAuthorId && origAuthorId === currentUserId) {
          // Author editing their own document: update profile changes if any
          if (currentProfile?.displayName) docPayload.authorName = currentProfile.displayName;
          if (currentProfile?.photoURL) docPayload.authorAvatar = currentProfile.photoURL;
        }

        await collectionRef.doc(currentDocId).update(docPayload);
        if (loadedDocumentData) {
          renderAuthorBadge(loadedDocumentData);
        }
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
      loadedDocumentData = { id: snapshot.id, ...data };
      currentDocType = data.docType || "document";

      const isSuperAdmin = isSuperAdminUser(currentProfile, currentUser);
      const isTeacher = currentProfile && (currentProfile.role === "teacher" || isSuperAdmin);
      const isAuthor = currentUser && data.authorId === currentUser.uid;

      setupDocTypeUI();

      // STUDENT EXERCISE FLOW:
      // If document is an Exercise and current user is a Student (not author/teacher):
      if (currentDocType === "exercise" && !isTeacher && !isAuthor) {
        isStudentWorksheet = true;

        const subDocRef = db.collection("subjects").doc(currentSubject.id).collection("documents").doc(docId).collection("submissions").doc(currentUser.uid);
        const subSnap = await subDocRef.get();

        let initialContent = data.content;
        let subStatus = "in-progress";

        if (subSnap.exists) {
          currentStudentSubmission = subSnap.data();
          subStatus = currentStudentSubmission.status || "in-progress";
          if (currentStudentSubmission.content) {
            initialContent = currentStudentSubmission.content;
          }
        } else {
          // Initialize student personal worksheet with teacher's exercise blocks
          currentStudentSubmission = {
            studentId: currentUser.uid,
            studentName: currentProfile?.displayName || currentUser.displayName || "Student",
            studentAvatar: currentProfile?.photoURL || currentProfile?.avatarUrl || currentUser?.photoURL || "assets/avatar.jpg",
            studentEmail: currentUser.email,
            status: "in-progress",
            content: data.content,
            startedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          };
          try {
            await subDocRef.set(currentStudentSubmission);
          } catch (e) {
            console.warn("Could not pre-seed student submission:", e);
          }
        }

        canEditDocument = true;
        renderAuthorBadge(loadedDocumentData);
        setupStudentExerciseUI(subStatus);

        if (titleInput && data.title) {
          titleInput.value = data.title;
          titleInput.readOnly = true;
          document.title = `${data.title} (Your Worksheet) – Quill-Q`;
        }

        // Load teacher's pinned notes from the exercise document
        if (Array.isArray(data.pinnedNotes)) {
          pinnedNotesCache = data.pinnedNotes;
        } else {
          pinnedNotesCache = [];
        }
        renderPinnedNotes();

        mountReactBlockNote(initialContent, true);
        updateSaveStatus("saved");
        return;
      }

      canEditDocument = isSuperAdmin || (currentUser && data.authorId === currentUser.uid);

      renderAuthorBadge(loadedDocumentData);
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
      // Viewer Mode: Hide manual save button
      if (btnSaveDoc) btnSaveDoc.style.display = "none";

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

  function renderAuthorBadge(data) {
    const chip = document.getElementById("editor-author-chip");
    const avatarsContainer = document.getElementById("editor-author-avatars");
    const authorBy = document.getElementById("editor-author-by");
    const authorEdited = document.getElementById("editor-author-edited");
    const authorEditedWrap = document.getElementById("editor-author-edited-wrap");

    if (!chip || !data) return;

    const authorName = data.authorName || "Student";
    const authorAvatar = data.authorAvatar || data.authorPhotoURL || "assets/avatar.jpg";
    const lastEditorName = data.lastEditorName || null;
    const lastEditorAvatar = data.lastEditorAvatar || "assets/avatar.jpg";
    const isEditedByOther = Boolean(lastEditorName && data.lastEditorId !== data.authorId && lastEditorName !== authorName);

    if (avatarsContainer) {
      avatarsContainer.innerHTML = `
        <img src="${escapeHtml(authorAvatar)}" alt="${escapeHtml(authorName)}" class="editor-author-avatar-img" referrerpolicy="no-referrer" onerror="this.src='assets/avatar.jpg'" />
        ${isEditedByOther ? `
          <img src="${escapeHtml(lastEditorAvatar)}" alt="${escapeHtml(lastEditorName)}" class="editor-author-avatar-img is-editor" referrerpolicy="no-referrer" onerror="this.src='assets/avatar.jpg'" />
        ` : ""}
      `;
    }

    if (authorBy) {
      authorBy.textContent = authorName;
    }

    if (authorEdited) {
      if (isEditedByOther) {
        authorEdited.textContent = lastEditorName;
        if (authorEditedWrap) authorEditedWrap.style.display = "flex";
      } else {
        authorEdited.textContent = "";
        if (authorEditedWrap) authorEditedWrap.style.display = "none";
      }
    }

    const ariaText = isEditedByOther 
      ? `Written by: ${authorName}, Edited by: ${lastEditorName}`
      : `Written by: ${authorName}`;
    chip.setAttribute("aria-label", ariaText);

    chip.classList.remove("view-hidden");
  }

  /* ==========================================================================
     INTERACTIVE EXERCISE & SUBMISSIONS SYSTEM
     ========================================================================== */

  function setupDocTypeUI() {
    const isSuperAdmin = isSuperAdminUser(currentProfile, currentUser);
    const isTeacher = currentProfile && (currentProfile.role === "teacher" || isSuperAdmin);
    const typeBadge = document.getElementById("editor-type-badge");
    const btnToggleType = document.getElementById("btn-toggle-type");
    const btnToggleTypeText = document.getElementById("btn-toggle-type-text");
    const btnViewSubmissions = document.getElementById("btn-view-submissions");

    if (currentDocType === "exercise") {
      if (typeBadge) typeBadge.classList.remove("view-hidden");
      if (isTeacher && currentDocId) {
        if (btnViewSubmissions) btnViewSubmissions.classList.remove("view-hidden");
        listenToSubmissionsCount();
      }
    } else {
      if (typeBadge) typeBadge.classList.add("view-hidden");
      if (btnViewSubmissions) btnViewSubmissions.classList.add("view-hidden");
    }

    if (btnToggleType) {
      if (isSuperAdmin && currentDocId) {
        btnToggleType.classList.remove("view-hidden");
        if (btnToggleTypeText) {
          btnToggleTypeText.textContent = currentDocType === "exercise" ? "Convert to Lesson Doc" : "Convert to Exercise";
        }
      } else {
        btnToggleType.classList.add("view-hidden");
      }
    }
  }

  function setupStudentExerciseUI(status = "in-progress") {
    const banner = document.getElementById("exercise-student-banner");
    const btnSubmit = document.getElementById("btn-submit-exercise");
    const btnBannerSubmit = document.getElementById("btn-banner-submit");
    const statusBadge = document.getElementById("exercise-status-badge");
    const statusDesc = document.getElementById("exercise-status-desc");
    const btnSubmitText = document.getElementById("btn-submit-exercise-text");
    const btnBannerSubmitText = document.getElementById("btn-banner-submit-text");

    if (banner) banner.classList.remove("view-hidden");
    if (btnSubmit) btnSubmit.classList.remove("view-hidden");

    // Students only read the teacher's pinned notes (cannot add or delete notes)
    const addNoteBtn = document.getElementById("btn-create-pinned-note");
    if (addNoteBtn) addNoteBtn.classList.add("view-hidden");

    const isSubmitted = status === "submitted";
    if (statusBadge) {
      statusBadge.textContent = isSubmitted ? "🟢 Submitted" : "🟡 In Progress";
      statusBadge.style.color = isSubmitted ? "#2b8a3e" : "#d9480f";
      statusBadge.style.borderColor = isSubmitted ? "#2b8a3e" : "#d9480f";
    }
    if (statusDesc) {
      statusDesc.innerHTML = isSubmitted
        ? "Your worksheet has been turned in to your teacher. You can click <strong>Unsubmit</strong> if you need to make changes."
        : "This is your personal worksheet. Answers auto-save as you type. When finished, click <strong>Turn In</strong>!";
    }
    if (btnSubmitText) btnSubmitText.textContent = isSubmitted ? "Unsubmit" : "Turn In";
    if (btnBannerSubmitText) btnBannerSubmitText.textContent = isSubmitted ? "Unsubmit" : "Turn In";
  }

  async function toggleStudentSubmission() {
    if (!currentDocId || !isStudentWorksheet || !currentUser) return;
    const isCurrentlySubmitted = currentStudentSubmission?.status === "submitted";
    const newStatus = isCurrentlySubmitted ? "in-progress" : "submitted";

    try {
      const subDocRef = db.collection("subjects").doc(currentSubject.id).collection("documents").doc(currentDocId).collection("submissions").doc(currentUser.uid);
      
      const jsonString = reactEditorBridge && typeof reactEditorBridge.getJSONString === "function" ? reactEditorBridge.getJSONString() : "{}";

      await subDocRef.set({
        status: newStatus,
        content: jsonString,
        studentName: currentProfile?.displayName || currentUser.displayName || "Student",
        studentAvatar: currentProfile?.photoURL || currentProfile?.avatarUrl || currentUser?.photoURL || "assets/avatar.jpg",
        submittedAt: newStatus === "submitted" ? firebase.firestore.FieldValue.serverTimestamp() : null,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      if (currentStudentSubmission) {
        currentStudentSubmission.status = newStatus;
        currentStudentSubmission.content = jsonString;
      }

      setupStudentExerciseUI(newStatus);
      showToast(newStatus === "submitted" ? "🎉 Worksheet turned in to teacher!" : "Worksheet reopened for editing.");
    } catch (e) {
      console.error("Submission toggle error:", e);
      showToast("Error updating submission: " + e.message, "error");
    }
  }

  function listenToSubmissionsCount() {
    if (!currentDocId || !db || !currentSubject) return;
    if (submissionsUnsubscribe) {
      try { submissionsUnsubscribe(); } catch (e) {}
      submissionsUnsubscribe = null;
    }

    const subCol = db.collection("subjects").doc(currentSubject.id).collection("documents").doc(currentDocId).collection("submissions");
    submissionsUnsubscribe = subCol.onSnapshot((snap) => {
      const count = snap.size;
      const btnText = document.getElementById("submissions-btn-text");
      if (btnText) {
        btnText.textContent = `Submissions (${count})`;
      }
    }, (err) => {
      console.warn("Submissions count listener error:", err);
    });
  }

  async function openSubmissionsDrawer() {
    const drawer = document.getElementById("submissions-drawer");
    const backdrop = document.getElementById("submissions-drawer-backdrop");
    if (drawer) drawer.classList.remove("view-hidden");
    if (backdrop) backdrop.classList.remove("view-hidden");
    await loadSubmissionsList();
  }

  function closeSubmissionsDrawer() {
    const drawer = document.getElementById("submissions-drawer");
    const backdrop = document.getElementById("submissions-drawer-backdrop");
    if (drawer) drawer.classList.add("view-hidden");
    if (backdrop) backdrop.classList.add("view-hidden");
  }

  async function loadSubmissionsList() {
    if (!currentDocId || !db || !currentSubject) return;
    const listContainer = document.getElementById("submissions-students-list");
    const summaryCount = document.getElementById("submissions-summary-count");
    if (!listContainer) return;

    listContainer.innerHTML = '<div style="text-align:center; padding: 20px; color: #8c8275;">Loading submissions...</div>';

    try {
      // 1. Fetch approved students
      const usersSnap = await db.collection("users").get();
      const students = [];
      usersSnap.forEach((u) => {
        const uData = u.data();
        if (uData.role === "student" || uData.role === "Student") {
          students.push({ uid: u.id, ...uData });
        }
      });

      // 2. Fetch submissions for this exercise
      const subSnap = await db.collection("subjects").doc(currentSubject.id).collection("documents").doc(currentDocId).collection("submissions").get();
      const submissionsMap = {};
      subSnap.forEach((s) => {
        submissionsMap[s.id] = s.data();
      });

      const submittedCount = Object.values(submissionsMap).filter(s => s.status === "submitted").length;
      if (summaryCount) {
        summaryCount.textContent = `${submittedCount} of ${students.length} students turned in`;
      }

      if (students.length === 0) {
        listContainer.innerHTML = '<div style="text-align:center; padding: 20px; color: #8c8275;">No students registered yet.</div>';
        return;
      }

      listContainer.innerHTML = "";
      students.forEach((st) => {
        const sub = submissionsMap[st.uid];
        const status = sub ? sub.status : "not-started";
        const hasWork = Boolean(sub && sub.content);

        let statusBadge = '<span class="student-card-status-pill" style="background:#f1f3f5; color:#868e96;">⚪ Not Started</span>';
        if (status === "submitted") {
          statusBadge = '<span class="student-card-status-pill" style="background:#d3f9d8; color:#2b8a3e;">🟢 Submitted</span>';
        } else if (status === "in-progress") {
          statusBadge = '<span class="student-card-status-pill" style="background:#fff3bf; color:#d9480f;">🟡 In Progress</span>';
        }

        const card = document.createElement("div");
        card.className = "submission-student-card";
        const avatarUrl = st.photoURL || st.avatarUrl || "assets/avatar.jpg";
        const studentName = st.displayName || st.name || st.email.split("@")[0];

        card.innerHTML = `
          <div class="student-card-left">
            <img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(studentName)}" class="student-card-avatar" referrerpolicy="no-referrer" onerror="this.src='assets/avatar.jpg'" />
            <div>
              <div class="student-card-name">${escapeHtml(studentName)}</div>
              <div class="student-card-subtext">${hasWork ? (status === 'submitted' ? 'Turned in • Click to review' : 'Draft in progress') : 'Has not started yet'}</div>
            </div>
          </div>
          <div class="student-card-right">
            ${statusBadge}
          </div>
        `;

        card.addEventListener("click", () => {
          if (!hasWork) {
            showToast(`${studentName} hasn't started this exercise yet.`, "info");
            return;
          }
          reviewStudentSubmission({
            id: st.uid,
            studentName: studentName,
            studentAvatar: avatarUrl,
            status: status,
            content: sub.content
          });
        });

        listContainer.appendChild(card);
      });
    } catch (e) {
      console.error("Error loading submissions:", e);
      listContainer.innerHTML = `<div style="color: #c92a2a; padding: 16px;">Failed to load submissions: ${escapeHtml(e.message)}</div>`;
    }
  }

  async function reviewStudentSubmission(student) {
    closeSubmissionsDrawer();
    reviewingStudent = student;

    // Cache teacher's master blocks before loading student work
    if (!masterExerciseBlocks && reactEditorBridge && typeof reactEditorBridge.getJSONString === "function") {
      masterExerciseBlocks = reactEditorBridge.getJSONString();
    }

    // Load student's worksheet content
    const studentContent = student.content || masterExerciseBlocks || "{}";

    // Cleanly unmount previous BlockNote editor instance and mount student's worksheet
    if (reactEditorBridge && reactEditorBridge.root && typeof reactEditorBridge.root.unmount === "function") {
      try {
        reactEditorBridge.root.unmount();
      } catch (e) {
        console.warn("Could not unmount root:", e);
      }
    }
    if (editorContainer) {
      editorContainer.innerHTML = "";
    }
    mountReactBlockNote(studentContent, false);

    const banner = document.getElementById("exercise-review-banner");
    const nameEl = document.getElementById("exercise-review-student-name");
    const statusEl = document.getElementById("exercise-review-status");
    const avatarEl = document.getElementById("exercise-review-avatar");

    if (nameEl) nameEl.textContent = student.studentName || "Student";
    if (statusEl) statusEl.textContent = student.status === "submitted" ? "🟢 Submitted" : (student.status === "in-progress" ? "🟡 In Progress" : "⚪ Not Started");
    if (avatarEl && student.studentAvatar) avatarEl.src = student.studentAvatar;
    if (banner) banner.classList.remove("view-hidden");

    if (titleInput) titleInput.readOnly = true;
    renderPinnedNotes();
    showToast(`Viewing ${student.studentName}'s worksheet (Review Mode)`);
  }

  function exitStudentReview() {
    reviewingStudent = null;
    const banner = document.getElementById("exercise-review-banner");
    if (banner) banner.classList.add("view-hidden");

    // Cleanly unmount student worksheet and restore teacher's master blocks
    if (reactEditorBridge && reactEditorBridge.root && typeof reactEditorBridge.root.unmount === "function") {
      try {
        reactEditorBridge.root.unmount();
      } catch (e) {
        console.warn("Could not unmount review root:", e);
      }
    }
    if (editorContainer) {
      editorContainer.innerHTML = "";
    }
    mountReactBlockNote(masterExerciseBlocks || undefined, canEditDocument);

    if (titleInput && canEditDocument) titleInput.readOnly = false;
    renderPinnedNotes();
    showToast("Returned to Master Exercise");
  }

  async function toggleDocumentType() {
    if (!currentDocId || !isSuperAdminUser(currentProfile, currentUser) || !currentSubject) return;
    const newType = currentDocType === "exercise" ? "document" : "exercise";
    try {
      await db.collection("subjects").doc(currentSubject.id).collection("documents").doc(currentDocId).update({
        docType: newType,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      currentDocType = newType;
      if (loadedDocumentData) loadedDocumentData.docType = newType;
      setupDocTypeUI();
      showToast(`Converted document to ${newType === "exercise" ? "Exercise" : "Lesson Doc"}!`);
    } catch (e) {
      console.error("Error converting doc type:", e);
      showToast("Conversion failed: " + e.message, "error");
    }
  }

  /**
   * Compresses an image file in the browser using HTML5 Canvas.
   * Scales down to max 1280px (crisp for A4 & Retina) and encodes to WebP/JPEG (~60KB - 95KB).
   * This completely bypasses Firebase Storage and fits safely into Firestore for free!
   */
  async function compressImageToDataUrl(file, maxWidth = 1280, maxHeight = 1280, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            let width = img.width;
            let height = img.height;

            // Proportional resize if larger than maximum dimensions
            if (width > maxWidth || height > maxHeight) {
              if (width / height > maxWidth / maxHeight) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              } else {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, width, height);

            // Encode to modern WebP (or JPEG fallback)
            let dataUrl = canvas.toDataURL("image/webp", quality);
            if (!dataUrl || !dataUrl.startsWith("data:image/webp")) {
              dataUrl = canvas.toDataURL("image/jpeg", quality);
            }

            resolve(dataUrl);
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error("Could not decode image file."));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error("Could not read image file."));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Direct File Upload Handler for BlockNote (Images, Audio, PDF, etc.)
   * Automatically compresses images in-browser to WebP (~70KB) so they save
   * permanently in Firestore with zero Blaze plan or storage bucket needed!
   */
  async function handleEditorFileUpload(file) {
    if (!file) throw new Error("No file selected.");

    const isImage = file.type ? file.type.startsWith("image/") : false;
    const isAudio = file.type ? file.type.startsWith("audio/") : false;

    // 1. Handle Images with in-browser auto-compression
    if (isImage) {
      try {
        if (typeof showToast === "function") {
          showToast(`Optimizing ${file.name}...`);
        }

        const compressedDataUrl = await compressImageToDataUrl(file);
        const approxKb = Math.round((compressedDataUrl.length * 0.75) / 1024);

        if (typeof showToast === "function") {
          showToast(`Image added successfully (~${approxKb} KB)!`);
        }

        return compressedDataUrl;
      } catch (imgErr) {
        console.error("Image compression error:", imgErr);
        const failMsg = "Could not process image. Please try a different image.";
        if (typeof showToast === "function") showToast(failMsg);
        throw new Error(failMsg);
      }
    }

    // 2. Handle Audio Clips (under 400KB as Data URL, larger via embed link)
    if (isAudio) {
      if (file.size <= 400 * 1024) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof showToast === "function") showToast("Audio note added!");
            resolve(reader.result);
          };
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(file);
        });
      } else {
        const msg = "Audio file is larger than 400KB. For long recordings, please use the 'Embed' tab with a link (e.g. Google Drive or SoundCloud).";
        if (typeof showToast === "function") showToast(msg);
        throw new Error(msg);
      }
    }

    // 3. Other files
    const generalMsg = "Please use the 'Embed' tab to link external files, or select an image to upload directly.";
    if (typeof showToast === "function") showToast(generalMsg);
    throw new Error(generalMsg);
  }

  // Also bind to global for BlockNote bundle fallback
  if (typeof window !== "undefined") {
    window.handleBlockNoteUploadFile = handleEditorFileUpload;
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
        uploadFile: handleEditorFileUpload,
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

    // Toggle Document Type (SuperAdmin only)
    const btnToggleType = document.getElementById("btn-toggle-type");
    if (btnToggleType) {
      btnToggleType.addEventListener("click", () => {
        if (moreMenu) moreMenu.classList.add("view-hidden");
        toggleDocumentType();
      });
    }

    // View Submissions (Teacher / Admin)
    const btnViewSubmissions = document.getElementById("btn-view-submissions");
    if (btnViewSubmissions) {
      btnViewSubmissions.addEventListener("click", openSubmissionsDrawer);
    }

    const btnCloseSubDrawer = document.getElementById("btn-close-submissions-drawer");
    const subBackdrop = document.getElementById("submissions-drawer-backdrop");
    if (btnCloseSubDrawer) btnCloseSubDrawer.addEventListener("click", closeSubmissionsDrawer);
    if (subBackdrop) subBackdrop.addEventListener("click", closeSubmissionsDrawer);

    // Student Submit Buttons
    const btnSubmitExercise = document.getElementById("btn-submit-exercise");
    const btnBannerSubmit = document.getElementById("btn-banner-submit");
    if (btnSubmitExercise) btnSubmitExercise.addEventListener("click", toggleStudentSubmission);
    if (btnBannerSubmit) btnBannerSubmit.addEventListener("click", toggleStudentSubmission);

    // Exit Review Mode
    const btnExitReview = document.getElementById("btn-exit-review");
    if (btnExitReview) btnExitReview.addEventListener("click", exitStudentReview);

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

  function canCurrentUserManageNotes() {
    if (isStudentWorksheet || reviewingStudent) return false;
    const isSuperAdmin = isSuperAdminUser(currentProfile, currentUser);
    const isAuthor = currentUser && loadedDocumentData && loadedDocumentData.authorId === currentUser.uid;
    return Boolean(isSuperAdmin || isAuthor);
  }

  function renderPinnedNotes() {
    const listEl = document.getElementById("pinned-notes-list") || document.getElementById("pinned-notes-sidebar");
    const addBtn = document.getElementById("btn-create-pinned-note");
    const mobileTrigger = document.getElementById("mobile-pinned-notes-trigger");
    const mobileBadge = document.getElementById("mobile-pin-badge");
    if (!listEl) return;

    const count = pinnedNotesCache.length;
    const canManageNotes = canCurrentUserManageNotes();

    // Update desktop Add Note button
    if (addBtn) {
      if (!canManageNotes) {
        addBtn.classList.add("view-hidden");
      } else {
        addBtn.classList.remove("view-hidden");
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
      const emptyMsg = canManageNotes
        ? `No notes pinned yet.<br/>Tap "+ Note" to pin one!`
        : `No notes pinned by teacher.`;
      listEl.innerHTML = `
        <div style="font-family: 'Caveat', cursive; font-size: 1.3rem; color: #8e8579; text-align: center; padding: 24px 10px;">
          ${emptyMsg}
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

        const deleteBtn = canManageNotes
          ? `<button type="button" class="pinned-note-delete" data-del-id="${note.id}" title="Remove note" aria-label="Remove note">
              <i class="fi fi-rr-cross"></i>
            </button>`
          : "";

        return `
          <div class="pinned-paper-note ${color}" data-note-id="${note.id}">
            ${tapeHtml}
            ${deleteBtn}
            <p>${escapedText}</p>
          </div>
        `;
      })
      .join("");

    // Bind delete buttons if permitted
    if (canManageNotes) {
      listEl.querySelectorAll(".pinned-note-delete").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = btn.getAttribute("data-del-id");
          deletePinnedNote(id);
        });
      });
    }
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
    initTopBarObserver();
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
          const typeParam = getQueryParam("type");
          currentDocType = typeParam === "exercise" ? "exercise" : "document";
          setupDocTypeUI();
          mountReactBlockNote();
          if (titleInput) {
            titleInput.placeholder = currentDocType === "exercise" ? "Exercise Title (e.g. Punctuation Practice)..." : "Untitled Document...";
            titleInput.focus();
          }
        }
      });
    }
  });
})();

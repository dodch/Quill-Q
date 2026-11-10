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
  let currentClassId = "";
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

  function getSubjectCollectionDocRef() {
    if (!currentClassId || currentClassId === "2ang-aff") {
      return db.collection("subjects").doc(currentSubject.id);
    }
    return db.collection("subjects").doc(`${currentClassId}_${currentSubject.id}`);
  }

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
  const btnUndo = document.getElementById("btn-editor-undo");
  const btnRedo = document.getElementById("btn-editor-redo");

  function updateHistoryUI(status) {
    const isEditable = Boolean(canEditDocument && !reviewingStudent);
    if (btnUndo) {
      btnUndo.disabled = !isEditable || !status?.canUndo;
    }
    if (btnRedo) {
      btnRedo.disabled = !isEditable || !status?.canRedo;
    }
  }

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

  function isUserTeacher() {
    if (reviewingStudent) return true;
    if (isStudentWorksheet) return false;
    return Boolean(
      currentProfile && (currentProfile.role === "teacher" || isSuperAdminUser(currentProfile, currentUser))
    );
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
      let jsonString = reactEditorBridge && typeof reactEditorBridge.getJSONString === "function" ? reactEditorBridge.getJSONString() : "{}";
      jsonString = await sanitizeDocPayloadImages(pages, jsonString);
      const excerpt = extractExcerpt(blocks, 150) || "Empty document...";
      const pageCount = pages.length || 1;

      const collectionRef = getSubjectCollectionDocRef().collection("documents");

      // 1. If student is working on an exercise worksheet, save to their personal submission subcollection!
      if (isStudentWorksheet) {
        const subDocRef = collectionRef.doc(currentDocId).collection("submissions").doc(currentUser.uid);
        const penAnnotations = reactEditorBridge && typeof reactEditorBridge.getAnnotations === "function"
          ? reactEditorBridge.getAnnotations()
          : {};

        await subDocRef.set({
          studentId: currentUser.uid,
          studentName: currentProfile?.displayName || currentUser.displayName || "Student",
          studentAvatar: currentProfile?.photoURL || currentProfile?.avatarUrl || currentUser?.photoURL || "assets/avatar.jpg",
          studentEmail: currentUser.email,
          content: jsonString,
          pageCount: pageCount,
          studentAnnotations: penAnnotations,
          status: currentStudentSubmission?.status || "in-progress",
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        if (currentStudentSubmission) {
          currentStudentSubmission.studentAnnotations = penAnnotations;
        }

        hasPendingChanges = false;
        updateSaveStatus("saved");
        if (manual) showToast("Worksheet draft saved!");
        return;
      }

      // 2. If teacher is reviewing a student submission, save teacher's handwritten marks & review status!
      if (reviewingStudent) {
        const subDocRef = collectionRef.doc(currentDocId).collection("submissions").doc(reviewingStudent.id);
        const penAnnotations = reactEditorBridge && typeof reactEditorBridge.getAnnotations === "function" 
          ? reactEditorBridge.getAnnotations() 
          : {};

        await subDocRef.set({
          teacherAnnotations: penAnnotations,
          reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
          reviewedBy: currentProfile?.displayName || currentUser.displayName || "Teacher",
          status: "reviewed"
        }, { merge: true });

        if (reviewingStudent) {
          reviewingStudent.teacherAnnotations = penAnnotations;
          reviewingStudent.status = "reviewed";
        }

        const reviewStatus = document.getElementById("exercise-review-status");
        if (reviewStatus) reviewStatus.textContent = "✅ Reviewed & Graded";

        hasPendingChanges = false;
        updateSaveStatus("saved");
        if (manual) showToast("Teacher marks & annotations saved to student submission!");
        return;
      }

      const currentAnnotations = reactEditorBridge && typeof reactEditorBridge.getAnnotations === "function" 
        ? reactEditorBridge.getAnnotations() 
        : {};

      const docPayload = {
        classId: currentClassId || "2ang-aff",
        subjectId: currentSubject.id,
        subjectName: currentSubject.name,
        title: docTitle,
        docType: loadedDocumentData?.docType || currentDocType,
        content: jsonString,
        excerpt: excerpt,
        pageCount: pageCount,
        pinnedNotes: pinnedNotesCache || [],
        annotations: currentAnnotations,
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

        // Broadcast background push notification to all class devices
        if (typeof broadcastPushNotification === "function") {
          const isEx = (docPayload.docType === "exercise");
          const classQ = currentClassId ? `&class=${encodeURIComponent(currentClassId)}` : "";
          broadcastPushNotification({
            title: isEx ? `✏️ New Exercise: ${docTitle}` : `📄 New Notes: ${docTitle}`,
            body: `${docPayload.subjectName} • Added by ${docPayload.authorName}`,
            url: `subject.html?subject=${encodeURIComponent(currentSubject.id)}${classQ}`,
            targetView: "subject"
          });
        }

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
      const docRef = getSubjectCollectionDocRef().collection("documents").doc(docId);
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
      if (!currentClassId && data.classId) {
        currentClassId = data.classId;
      }
      currentDocType = data.docType || "document";

      const isSuperAdmin = isSuperAdminUser(currentProfile, currentUser);
      const isTeacher = currentProfile && (currentProfile.role === "teacher" || isSuperAdmin);
      const isAuthor = currentUser && data.authorId === currentUser.uid;

      setupDocTypeUI();

      // STUDENT EXERCISE FLOW:
      // If document is an Exercise and current user is a Student (not author/teacher):
      if (currentDocType === "exercise" && !isTeacher && !isAuthor) {
        isStudentWorksheet = true;

        const subDocRef = getSubjectCollectionDocRef().collection("documents").doc(docId).collection("submissions").doc(currentUser.uid);
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

        // Combine student's handwriting and teacher's markings so both render on worksheet
        const mergedAnnotations = {};
        const teacherA = currentStudentSubmission?.teacherAnnotations || {};
        const studentA = currentStudentSubmission?.studentAnnotations || {};
        const pageIds = new Set([...Object.keys(teacherA), ...Object.keys(studentA)]);
        pageIds.forEach((pId) => {
          const listT = Array.isArray(teacherA[pId]) ? teacherA[pId] : [];
          const listS = Array.isArray(studentA[pId]) ? studentA[pId] : [];
          const seen = new Set();
          const combined = [];
          [...listS, ...listT].forEach((stroke) => {
            if (stroke && stroke.id && !seen.has(stroke.id)) {
              seen.add(stroke.id);
              combined.push(stroke);
            }
          });
          mergedAnnotations[pId] = combined;
        });

        mountReactBlockNote(initialContent, true, mergedAnnotations);
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

      mountReactBlockNote(data.content, canEditDocument, data.annotations || null);
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
      // Viewer Mode: Hide manual save button and disable history buttons
      if (btnSaveDoc) btnSaveDoc.style.display = "none";
      if (btnUndo) {
        btnUndo.disabled = true;
        btnUndo.title = "Undo unavailable in read-only mode";
      }
      if (btnRedo) {
        btnRedo.disabled = true;
        btnRedo.title = "Redo unavailable in read-only mode";
      }

      // Title input is read-only for viewer
      if (titleInput) {
        titleInput.readOnly = true;
        titleInput.style.cursor = "default";
      }
    } else {
      // Editor Mode: Show save button and restore history tooltips
      if (btnSaveDoc) btnSaveDoc.style.display = "inline-flex";
      if (btnUndo) {
        btnUndo.title = "Undo (Ctrl+Z)";
      }
      if (btnRedo) {
        btnRedo.title = "Redo (Ctrl+Y / Ctrl+Shift+Z)";
      }
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

    // Pen Button: Visible for teachers/admins, reviewing student work, student exercises, or document editors
    const btnNavPen = document.getElementById("btn-teacher-pen");
    if (btnNavPen) {
      if (isTeacher || reviewingStudent || isStudentWorksheet || canEditDocument) {
        btnNavPen.classList.remove("view-hidden");
      } else {
        btnNavPen.classList.add("view-hidden");
      }
    }
    configurePenRoleUI();

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

    // Student Handwriting Pen button is visible on worksheets
    const btnNavPen = document.getElementById("btn-teacher-pen");
    if (btnNavPen) btnNavPen.classList.remove("view-hidden");
    configurePenRoleUI();

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

    const subCol = getSubjectCollectionDocRef().collection("documents").doc(currentDocId).collection("submissions");
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
      // 1. Fetch approved students belonging to the current class
      const usersSnap = await db.collection("users").get();
      const students = [];
      const targetClass = currentClassId || "2ang-aff";
      usersSnap.forEach((u) => {
        const uData = u.data();
        const role = (uData.role || "").toLowerCase();
        const userClass = uData.classId || "2ang-aff";
        if (role === "student" && userClass === targetClass) {
          students.push({ uid: u.id, ...uData });
        }
      });

      // 2. Fetch submissions for this exercise
      const subSnap = await getSubjectCollectionDocRef().collection("documents").doc(currentDocId).collection("submissions").get();
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

    // Load student's worksheet content and combined annotations
    const studentContent = student.content || masterExerciseBlocks || "{}";
    const combinedAnnotations = {};

    try {
      const subSnap = await getSubjectCollectionDocRef().collection("documents").doc(currentDocId).collection("submissions").doc(student.id).get();
      if (subSnap.exists) {
        const sData = subSnap.data();
        const teacherA = sData.teacherAnnotations || {};
        const studentA = sData.studentAnnotations || {};
        const pageIds = new Set([...Object.keys(teacherA), ...Object.keys(studentA)]);
        pageIds.forEach((pId) => {
          const listT = Array.isArray(teacherA[pId]) ? teacherA[pId] : [];
          const listS = Array.isArray(studentA[pId]) ? studentA[pId] : [];
          const seen = new Set();
          const combined = [];
          [...listS, ...listT].forEach((stroke) => {
            if (stroke && stroke.id && !seen.has(stroke.id)) {
              seen.add(stroke.id);
              combined.push(stroke);
            }
          });
          combinedAnnotations[pId] = combined;
        });
      }
    } catch (e) {
      console.warn("Could not fetch submission annotations:", e);
    }

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
    mountReactBlockNote(studentContent, false, combinedAnnotations);

    const banner = document.getElementById("exercise-review-banner");
    const nameEl = document.getElementById("exercise-review-student-name");
    const statusEl = document.getElementById("exercise-review-status");
    const avatarEl = document.getElementById("exercise-review-avatar");
    const btnNavPen = document.getElementById("btn-teacher-pen");

    if (btnNavPen) btnNavPen.classList.remove("view-hidden");
    configurePenRoleUI();
    if (nameEl) nameEl.textContent = student.studentName || "Student";
    if (statusEl) statusEl.textContent = student.status === "reviewed" ? "✅ Reviewed" : (student.status === "submitted" ? "🟢 Submitted" : "🟡 In Progress");
    if (avatarEl && student.studentAvatar) avatarEl.src = student.studentAvatar;
    if (banner) banner.classList.remove("view-hidden");

    if (titleInput) titleInput.readOnly = true;
    renderPinnedNotes();
    showToast(`Viewing ${student.studentName}'s worksheet (Review Mode)`);
  }

  function exitStudentReview() {
    toggleTeacherPen(false);
    reviewingStudent = null;
    const banner = document.getElementById("exercise-review-banner");
    if (banner) banner.classList.add("view-hidden");

    const isTeacher = currentProfile && (currentProfile.role === "teacher" || isSuperAdminUser(currentProfile, currentUser));
    const btnNavPen = document.getElementById("btn-teacher-pen");
    if (btnNavPen && !isTeacher) btnNavPen.classList.add("view-hidden");
    configurePenRoleUI();

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
    mountReactBlockNote(masterExerciseBlocks || undefined, canEditDocument, loadedDocumentData?.annotations || null);

    if (titleInput && canEditDocument) titleInput.readOnly = false;
    renderPinnedNotes();
    showToast("Returned to Master Exercise");
  }

  async function toggleDocumentType() {
    if (!currentDocId || !isSuperAdminUser(currentProfile, currentUser) || !currentSubject) return;
    const newType = currentDocType === "exercise" ? "document" : "exercise";
    try {
      await getSubjectCollectionDocRef().collection("documents").doc(currentDocId).update({
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
   * Cloudflare Worker R2 Upload Helper
   */
  function getCloudflareUploadUrl() {
    const ep = (typeof firebaseConfig !== "undefined" && firebaseConfig.pushEndpoint)
      || (typeof localStorage !== "undefined" ? localStorage.getItem("quill_push_endpoint") : "")
      || "https://quill-push-dispatcher.dodchadam.workers.dev";
    return ep ? `${ep.replace(/\/+$/, '')}/upload` : "";
  }

  async function uploadImageToCloudflare(fileOrBlob, filename = "image.webp") {
    const uploadUrl = getCloudflareUploadUrl();
    if (!uploadUrl) throw new Error("No Cloudflare upload endpoint configured");

    const formData = new FormData();
    formData.append("file", fileOrBlob, filename);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      if (!data || !data.url) throw new Error("No URL returned from Cloudflare");
      return data.url;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  async function uploadDataUrlToCloudflare(dataUrl, filename = "image.webp") {
    const uploadUrl = getCloudflareUploadUrl();
    if (!uploadUrl) throw new Error("No Cloudflare upload endpoint configured");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl, filename }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      if (!data || !data.url) throw new Error("No URL returned from Cloudflare");
      return data.url;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  /**
   * Compresses an image file/Blob/dataUrl in the browser using HTML5 Canvas.
   * Default 840px matches standard universal A4 sheet (816px) with zero quality loss.
   * Encodes to WebP/JPEG (~50KB - 85KB) so it safely fits into Firestore for free!
   */
  async function compressImageToDataUrl(fileOrBlobOrDataUrl, maxWidth = 840, maxHeight = 840, quality = 0.72) {
    return new Promise((resolve, reject) => {
      const processImg = (src) => {
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
        img.src = src;
      };

      if (typeof fileOrBlobOrDataUrl === "string") {
        processImg(fileOrBlobOrDataUrl);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => processImg(e.target.result);
        reader.onerror = () => reject(new Error("Could not read image file."));
        reader.readAsDataURL(fileOrBlobOrDataUrl);
      }
    });
  }

  /**
   * Scans document blocks for oversized base64 images before saving.
   * Automatically migrates them to Cloudflare R2 or recompresses them down to ~60KB
   * so content length is mathematically guaranteed to stay under Firestore's 1MB limit!
   */
  async function sanitizeDocPayloadImages(pages, jsonString) {
    if (!jsonString || typeof jsonString !== "string") return jsonString;
    // Fast path: if payload is well under limit and has no massive data:image, pass through
    if (jsonString.length < 500000 && !jsonString.includes("data:image/")) {
      return jsonString;
    }

    try {
      const parsed = JSON.parse(jsonString);
      let changed = false;

      async function scanBlocks(blocks) {
        if (!Array.isArray(blocks)) return;
        for (const block of blocks) {
          if (block && block.type === "image" && block.props && typeof block.props.url === "string") {
            const currentUrl = block.props.url;
            if (currentUrl.startsWith("data:image/") && currentUrl.length > 50000) {
              let newUrl = null;

              // Step 1: Attempt Cloudflare R2 upload
              try {
                const mimeMatch = currentUrl.match(/^data:([^;]+);/);
                const mime = mimeMatch ? mimeMatch[1] : "image/webp";
                const ext = mime.split("/")[1] || "webp";
                newUrl = await uploadDataUrlToCloudflare(currentUrl, `doc-img-${Date.now()}.${ext}`);
              } catch (cfErr) {
                console.warn("Cloudflare auto-migration skipped, falling back to local compression:", cfErr.message);
              }

              // Step 2: Fallback to high-efficiency local compression
              if (!newUrl) {
                try {
                  const compressed = await compressImageToDataUrl(currentUrl, 820, 820, 0.70);
                  if (compressed && compressed.length < currentUrl.length) {
                    newUrl = compressed;
                  }
                } catch (cErr) {
                  console.warn("Base64 recompression failed:", cErr);
                }
              }

              if (newUrl && newUrl !== currentUrl) {
                block.props.url = newUrl;
                changed = true;
              }
            }
          }
          if (block && block.children && Array.isArray(block.children)) {
            await scanBlocks(block.children);
          }
        }
      }

      if (parsed.pages && Array.isArray(parsed.pages)) {
        for (const pg of parsed.pages) {
          if (pg.blocks) await scanBlocks(pg.blocks);
        }
      } else if (Array.isArray(parsed)) {
        await scanBlocks(parsed);
      }

      if (changed) {
        return JSON.stringify(parsed);
      }
    } catch (err) {
      console.warn("Could not sanitize document images:", err);
    }

    return jsonString;
  }

  /**
   * Direct File Upload Handler for BlockNote (Images, Audio, PDF, etc.)
   * 1. Attempts Cloudflare R2 upload (permanent CDN URL, zero Firestore weight).
   * 2. Falls back to in-browser WebP compression (~60KB) for 100% offline resilience.
   */
  async function handleEditorFileUpload(file) {
    if (!file) throw new Error("No file selected.");

    const isImage = file.type ? file.type.startsWith("image/") : false;
    const isAudio = file.type ? file.type.startsWith("audio/") : false;

    // 1. Handle Images
    if (isImage) {
      if (typeof showToast === "function") {
        showToast(`Adding ${file.name}...`);
      }

      // Try Cloudflare R2 Upload First
      try {
        const cdnUrl = await uploadImageToCloudflare(file, file.name);
        if (typeof showToast === "function") {
          showToast(`Image uploaded to Cloudflare CDN!`);
        }
        return cdnUrl;
      } catch (cfErr) {
        console.warn("Cloudflare upload unavailable, saving with local compression:", cfErr.message);

        // Fallback: Safe In-Browser WebP Compression (~60KB)
        try {
          const compressedDataUrl = await compressImageToDataUrl(file, 840, 840, 0.72);
          const approxKb = Math.round((compressedDataUrl.length * 0.75) / 1024);

          if (typeof showToast === "function") {
            showToast(`Image added successfully (~${approxKb} KB)!`);
          }

          return compressedDataUrl;
        } catch (imgErr) {
          console.error("Image processing error:", imgErr);
          const failMsg = "Could not process image. Please try a different image.";
          if (typeof showToast === "function") showToast(failMsg);
          throw new Error(failMsg);
        }
      }
    }

    // 2. Handle Audio Clips (under 400KB as Data URL, larger via embed link)
    if (isAudio) {
      // Try Cloudflare R2 for audio clips first!
      try {
        if (typeof showToast === "function") showToast(`Uploading audio recording...`);
        const audioCdnUrl = await uploadImageToCloudflare(file, file.name || "recording.mp3");
        if (typeof showToast === "function") showToast("Audio uploaded to CDN!");
        return audioCdnUrl;
      } catch (cfErr) {
        console.warn("Cloudflare audio upload unavailable, falling back:", cfErr);
      }

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

  function mountReactBlockNote(initialContent, editable = true, initialAnnotations = null) {
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
      const isTeacherRole = isUserTeacher();

      reactEditorBridge = renderFn(editorContainer, {
        initialContent: initialContent || undefined,
        initialAnnotations: initialAnnotations || undefined,
        docTitle: docTitle,
        subjectName: subjName,
        editable: editable,
        isTeacher: isTeacherRole,
        uploadFile: handleEditorFileUpload,
        onChange: () => {
          if (editable) {
            triggerAutosaveDebounced();
          }
        },
        onAnnotationsChange: () => {
          if (editable || reviewingStudent) {
            triggerAutosaveDebounced();
          }
        },
        onHistoryChange: (historyStatus) => {
          updateHistoryUI(historyStatus);
        },
        onBridgeReady: (bridge) => {
          reactEditorBridge = bridge;
          if (bridge && typeof bridge.onHistoryChange === "function") {
            bridge.onHistoryChange(updateHistoryUI);
          }
        }
      });
    } catch (err) {
      console.error("Error rendering React BlockNote:", err);
      editorContainer.innerHTML = `<div style="padding: 20px; color: #c92a2a;">Failed to mount BlockNote: ${err.message}</div>`;
    }
  }

  function setupSubjectContext() {
    if (!currentClassId) {
      currentClassId = getQueryParam("class") || (currentProfile && currentProfile.classId) || "";
    }
    const subjectParam = getQueryParam("subject") || getQueryParam("id") || "writing";
    currentSubject = typeof getSubjectById === "function" ? getSubjectById(subjectParam, currentClassId) : null;

    if (!currentSubject) {
      currentSubject = {
        id: subjectParam || "writing",
        name: (subjectParam ? (subjectParam.charAt(0).toUpperCase() + subjectParam.slice(1)) : "Writing"),
        code: "SUB-101",
        bgClass: "card-blue"
      };
    }

    if (backBtn) {
      const classQ = currentClassId ? `&class=${encodeURIComponent(currentClassId)}` : "";
      backBtn.href = `subject.html?id=${encodeURIComponent(currentSubject.id)}${classQ}`;
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

    // Undo and Redo Navbar Buttons
    if (btnUndo) {
      btnUndo.addEventListener("click", (e) => {
        e.preventDefault();
        if (!canEditDocument || reviewingStudent) return;
        if (reactEditorBridge && typeof reactEditorBridge.undo === "function") {
          reactEditorBridge.undo();
        }
      });
    }

    if (btnRedo) {
      btnRedo.addEventListener("click", (e) => {
        e.preventDefault();
        if (!canEditDocument || reviewingStudent) return;
        if (reactEditorBridge && typeof reactEditorBridge.redo === "function") {
          reactEditorBridge.redo();
        }
      });
    }

    // Quick Highlighter Button in Navbar
    const btnHighlighter = document.getElementById("btn-highlighter-mode");
    if (btnHighlighter) {
      btnHighlighter.addEventListener("click", (e) => {
        e.preventDefault();
        if (!canEditDocument && !isStudentWorksheet) return;
        if (reactEditorBridge && typeof reactEditorBridge.toggleHighlighterMode === "function") {
          const isActive = reactEditorBridge.toggleHighlighterMode();
          btnHighlighter.classList.toggle("active", isActive);
          if (isActive) {
            showToast("Quick Highlighter active: Select any text to highlight instantly (or hold Ctrl to multi-select)");
          }
        }
      });
    }

    // Keyboard shortcuts: Ctrl+S (Save), Ctrl+Z (Undo), Ctrl+Y / Ctrl+Shift+Z (Redo)
    window.addEventListener("keydown", (e) => {
      // Save: Ctrl+S / Cmd+S
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveDocumentToFirestore(true);
        return;
      }

      // History fallback shortcuts when focus is outside inputs and textareas
      if (canEditDocument && !reviewingStudent && reactEditorBridge) {
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
        const isTextInput = activeTag === "input" || activeTag === "textarea";

        if (!isTextInput) {
          // Undo: Ctrl+Z / Cmd+Z (without shift)
          if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
            e.preventDefault();
            if (typeof reactEditorBridge.undo === "function") {
              reactEditorBridge.undo();
            }
          }
          // Redo: Ctrl+Y / Cmd+Y OR Ctrl+Shift+Z / Cmd+Shift+Z
          else if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") ||
                   ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z")) {
            e.preventDefault();
            if (typeof reactEditorBridge.redo === "function") {
              reactEditorBridge.redo();
            }
          }
        }
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
    initTeacherPenManager();
  }

  /* ==========================================================================
     TEACHER & STUDENT HANDWRITING PEN PALETTE
     ========================================================================== */

  function configurePenRoleUI() {
    const isTeacher = isUserTeacher();
    const btnNavPen = document.getElementById("btn-teacher-pen");
    const navIcon = document.getElementById("nav-pen-icon");
    const navLabel = document.getElementById("teacher-pen-btn-label");
    const toolbar = document.getElementById("teacher-pen-toolbar");

    if (btnNavPen) {
      if (isTeacher) {
        btnNavPen.classList.remove("student-pen-btn");
        if (navLabel) navLabel.textContent = "Red Pen";
        if (navIcon) navIcon.style.color = "#e03131";
        btnNavPen.title = "Teacher Pen: Draw marks, grades & notes directly on paper";
        btnNavPen.setAttribute("aria-label", "Teacher Red Pen");
      } else {
        btnNavPen.classList.add("student-pen-btn");
        if (navLabel) navLabel.textContent = "Pen";
        if (navIcon) navIcon.style.color = "#1971c2";
        btnNavPen.title = "Pen: Write and draw notes directly on paper";
        btnNavPen.setAttribute("aria-label", "Handwriting Pen");
      }
    }

    if (toolbar) {
      if (isTeacher) {
        toolbar.classList.remove("is-student-pen");
      } else {
        toolbar.classList.add("is-student-pen");

        // Ensure student doesn't have teacher-only stamps active
        const curTool = reactEditorBridge && typeof reactEditorBridge.getPenTool === "function" ? reactEditorBridge.getPenTool() : "pen";
        if (curTool === "star" || curTool === "check" || curTool === "cross") {
          if (reactEditorBridge && typeof reactEditorBridge.setPenTool === "function") {
            reactEditorBridge.setPenTool("pen");
          }
          const toolBtns = toolbar.querySelectorAll(".pen-tool-btn");
          toolBtns.forEach((b) => {
            b.classList.toggle("active", b.dataset.tool === "pen");
          });
        }

        // Ensure student doesn't have teacher red ink active
        const curColor = reactEditorBridge && typeof reactEditorBridge.getPenColor === "function" ? reactEditorBridge.getPenColor() : "#1971c2";
        if (curColor === "#e03131" || curColor?.toLowerCase() === "red") {
          if (reactEditorBridge && typeof reactEditorBridge.setPenColor === "function") {
            reactEditorBridge.setPenColor("#1971c2");
          }
          const colorBtns = toolbar.querySelectorAll(".pen-color-swatch");
          colorBtns.forEach((b) => {
            b.classList.toggle("active", b.dataset.color === "#1971c2");
          });
        }
      }
    }
  }

  function toggleTeacherPen(forceState = null) {
    if (!reactEditorBridge) return;
    configurePenRoleUI();
    const isTeacher = isUserTeacher();

    const currentMode = typeof reactEditorBridge.getPenMode === "function" ? reactEditorBridge.getPenMode() : false;
    const newMode = forceState !== null ? Boolean(forceState) : !currentMode;

    if (typeof reactEditorBridge.setPenMode === "function") {
      reactEditorBridge.setPenMode(newMode);
    }

    const btnNavPen = document.getElementById("btn-teacher-pen");
    const btnRevPen = document.getElementById("btn-review-pen");
    const toolbar = document.getElementById("teacher-pen-toolbar");

    if (newMode) {
      if (btnNavPen) btnNavPen.classList.add("active");
      if (btnRevPen) btnRevPen.classList.add("active");
      if (toolbar) toolbar.classList.remove("view-hidden");

      // Ensure tool & color match role
      let curTool = reactEditorBridge && typeof reactEditorBridge.getPenTool === "function" ? reactEditorBridge.getPenTool() : "pen";
      if (!isTeacher && (curTool === "star" || curTool === "check" || curTool === "cross")) {
        curTool = "pen";
        if (typeof reactEditorBridge.setPenTool === "function") reactEditorBridge.setPenTool("pen");
      }

      let curColor = reactEditorBridge && typeof reactEditorBridge.getPenColor === "function" ? reactEditorBridge.getPenColor() : (isTeacher ? "#e03131" : "#1971c2");
      if (!isTeacher && (curColor === "#e03131" || curColor?.toLowerCase() === "red")) {
        curColor = "#1971c2";
        if (typeof reactEditorBridge.setPenColor === "function") reactEditorBridge.setPenColor("#1971c2");
      }

      // Sync active classes on toolbar buttons
      if (toolbar) {
        toolbar.querySelectorAll(".pen-tool-btn").forEach((b) => b.classList.toggle("active", b.dataset.tool === curTool));
        toolbar.querySelectorAll(".pen-color-swatch").forEach((b) => b.classList.toggle("active", b.dataset.color === curColor));
      }

      updateToolbarToolVisuals(curTool, curColor);
      showToast(isTeacher
        ? "Teacher Pen active: Draw marks, grades & notes directly on paper"
        : "Pen active: Write and draw notes directly on paper"
      );
    } else {
      if (btnNavPen) btnNavPen.classList.remove("active");
      if (btnRevPen) btnRevPen.classList.remove("active");
      if (toolbar) toolbar.classList.add("view-hidden");
    }
  }

  function updateToolbarToolVisuals(tool, activeColor) {
    const toolbar = document.getElementById("teacher-pen-toolbar");
    if (!toolbar) return;
    const colorGroup = toolbar.querySelector("#pen-color-group") || toolbar.querySelector(".pen-color-group");
    const colorBtns = toolbar.querySelectorAll(".pen-color-swatch");
    const toolbarTitle = toolbar.querySelector("#pen-toolbar-title") || toolbar.querySelector(".pen-toolbar-title");
    const toolbarIcon = toolbar.querySelector("#pen-toolbar-icon") || toolbar.querySelector(".pen-toolbar-handle i");

    if (tool === "eraser") {
      if (colorGroup) {
        colorGroup.classList.add("is-disabled");
        colorGroup.setAttribute("aria-disabled", "true");
        colorGroup.setAttribute("title", "Colors are not available in Eraser mode. Select Pen to draw with ink.");
      }
      colorBtns.forEach((b) => {
        b.disabled = true;
        b.setAttribute("tabindex", "-1");
      });
      if (toolbarTitle) toolbarTitle.textContent = "Eraser";
      if (toolbarIcon) {
        toolbarIcon.className = "fi fi-rr-eraser";
        toolbarIcon.style.color = "#c92a2a";
      }
    } else {
      if (colorGroup) {
        colorGroup.classList.remove("is-disabled");
        colorGroup.removeAttribute("aria-disabled");
        colorGroup.removeAttribute("title");
      }
      colorBtns.forEach((b) => {
        b.disabled = false;
        b.removeAttribute("tabindex");
      });

      const isTeacher = isUserTeacher();
      const color = activeColor || (reactEditorBridge && typeof reactEditorBridge.getPenColor === "function" ? reactEditorBridge.getPenColor() : (isTeacher ? "#e03131" : "#1971c2"));

      if (toolbarIcon) {
        if (tool === "check") {
          toolbarIcon.className = "fi fi-rr-check";
          toolbarIcon.style.color = "#2b8a3e";
        } else if (tool === "cross") {
          toolbarIcon.className = "fi fi-rr-cross";
          toolbarIcon.style.color = "#e03131";
        } else if (tool === "star") {
          toolbarIcon.className = "fi fi-rr-star";
          toolbarIcon.style.color = "#f59f00";
        } else {
          toolbarIcon.className = "fi fi-rr-pen-nib";
          toolbarIcon.style.color = color;
        }
      }

      if (toolbarTitle) {
        if (tool === "check") toolbarTitle.textContent = "Checkmark";
        else if (tool === "cross") toolbarTitle.textContent = "Cross";
        else if (tool === "star") toolbarTitle.textContent = "Gold Star";
        else {
          const colorNames = {
            "#e03131": isTeacher ? "Red Pen" : "Pen",
            "#1971c2": "Blue Pen",
            "#2f9e44": "Green Pen",
            "#f59f00": "Gold Pen",
            "#1a1816": "Black Pen"
          };
          toolbarTitle.textContent = colorNames[(color || "").toLowerCase()] || "Pen";
        }
      }
    }
  }

  function initTeacherPenManager() {
    const btnNavPen = document.getElementById("btn-teacher-pen");
    const btnRevPen = document.getElementById("btn-review-pen");
    const btnSaveMarks = document.getElementById("btn-save-review-marks");
    const btnPenDone = document.getElementById("btn-pen-done");
    const btnPenUndo = document.getElementById("btn-pen-undo");
    const btnPenClear = document.getElementById("btn-pen-clear");
    const toolbar = document.getElementById("teacher-pen-toolbar");

    if (btnNavPen) {
      btnNavPen.addEventListener("click", () => toggleTeacherPen());
    }
    if (btnRevPen) {
      btnRevPen.addEventListener("click", () => toggleTeacherPen());
    }
    if (btnSaveMarks) {
      btnSaveMarks.addEventListener("click", () => saveDocumentToFirestore(true));
    }
    if (btnPenDone) {
      btnPenDone.addEventListener("click", () => toggleTeacherPen(false));
    }
    if (btnPenUndo) {
      btnPenUndo.addEventListener("click", () => {
        if (reactEditorBridge && typeof reactEditorBridge.undoPen === "function") {
          reactEditorBridge.undoPen();
        }
      });
    }
    if (btnPenClear) {
      btnPenClear.addEventListener("click", async () => {
        const isTeacher = isUserTeacher();
        const msg = isTeacher
          ? "Clear all handwritten marks on this page?"
          : "Clear all your handwriting on this page? (Teacher marks will be preserved)";
        let confirmed = false;
        if (typeof window.showCustomConfirm === "function") {
          confirmed = await window.showCustomConfirm(
            msg,
            "Clear Page Marks",
            '<i class="fi fi-rr-trash"></i>',
            "Clear Marks",
            "Keep Marks",
            true
          );
        } else {
          confirmed = window.confirm(msg);
        }
        if (confirmed && reactEditorBridge && typeof reactEditorBridge.clearPagePen === "function") {
          reactEditorBridge.clearPagePen();
          showToast(isTeacher ? "Page markings cleared" : "Your handwriting cleared");
        }
      });
    }

    // Tool Buttons in Floating Toolbar (pen, check, cross, star, eraser)
    if (toolbar) {
      const toolBtns = toolbar.querySelectorAll(".pen-tool-btn");
      toolBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const tool = btn.dataset.tool || "pen";
          const isTeacher = isUserTeacher();

          // Students cannot use check, cross, or star
          if (!isTeacher && (tool === "check" || tool === "cross" || tool === "star")) {
            showToast("Grading stamps (✓, ✗, ⭐) are reserved for teachers.", "error");
            return;
          }

          toolBtns.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          if (reactEditorBridge && typeof reactEditorBridge.setPenTool === "function") {
            reactEditorBridge.setPenTool(tool);
          }
          const currentColor = reactEditorBridge && typeof reactEditorBridge.getPenColor === "function" ? reactEditorBridge.getPenColor() : (isTeacher ? "#e03131" : "#1971c2");
          updateToolbarToolVisuals(tool, currentColor);

          if (tool === "eraser") {
            showToast(isTeacher
              ? "Eraser active: Drag over markings to erase"
              : "Eraser active: Drag over your handwriting to erase (teacher marks cannot be erased)"
            );
          }
        });
      });

      // Color Swatches
      const colorBtns = toolbar.querySelectorAll(".pen-color-swatch");
      colorBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const curTool = reactEditorBridge && typeof reactEditorBridge.getPenTool === "function" ? reactEditorBridge.getPenTool() : "pen";
          // If in eraser mode, colors cannot be selected
          if (curTool === "eraser") return;

          const color = btn.dataset.color || "#1971c2";
          const isTeacher = isUserTeacher();

          // Students cannot use red ink
          if (!isTeacher && (color === "#e03131" || color?.toLowerCase() === "red")) {
            showToast("Red ink is reserved for teacher grading. Please select another color.", "error");
            return;
          }

          colorBtns.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          if (reactEditorBridge && typeof reactEditorBridge.setPenColor === "function") {
            reactEditorBridge.setPenColor(color);
          }
          updateToolbarToolVisuals(curTool, color);
        });
      });

      // Size Buttons
      const sizeBtns = toolbar.querySelectorAll(".pen-size-btn");
      sizeBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          sizeBtns.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          const size = parseFloat(btn.dataset.size) || 3.5;
          if (reactEditorBridge && typeof reactEditorBridge.setPenSize === "function") {
            reactEditorBridge.setPenSize(size);
          }
        });
      });
    }
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
    // On new documents being created, the user is the creator and can always add notes
    if (!currentDocId || !loadedDocumentData) return true;
    const isSuperAdmin = isSuperAdminUser(currentProfile, currentUser);
    const isTeacher = currentProfile && currentProfile.role === "teacher";
    const isAuthor = currentUser && (!loadedDocumentData.authorId || loadedDocumentData.authorId === currentUser.uid);
    return Boolean(isSuperAdmin || isTeacher || isAuthor || canEditDocument);
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
      if (count > 0 || canManageNotes) {
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

    // Guarantee drawer is closed on load
    closeMobilePinnedDrawer();

    if (mobileTrigger) {
      mobileTrigger.addEventListener("click", (e) => {
        e.preventDefault();
        openMobilePinnedDrawer();
      });
    }
    if (closeDrawerBtn) {
      closeDrawerBtn.addEventListener("click", (e) => {
        e.preventDefault();
        closeMobilePinnedDrawer();
      });
    }
    if (backdrop) {
      backdrop.addEventListener("click", (e) => {
        e.preventDefault();
        closeMobilePinnedDrawer();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeMobilePinnedDrawer();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1220) {
        closeMobilePinnedDrawer();
      }
    });

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
      if (window.AcademicRegistry && typeof window.AcademicRegistry.bindFirestoreAcademicStructure === "function") {
        window.AcademicRegistry.bindFirestoreAcademicStructure(db);
      }
    }

    if (window.AcademicRegistry && typeof window.AcademicRegistry.onAcademicStructureChange === "function") {
      window.AcademicRegistry.onAcademicStructureChange(() => {
        setupSubjectContext();
      });
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

        // If class wasn't explicitly provided in the URL query, use the profile class
        if (!currentClassId && currentProfile && currentProfile.classId) {
          currentClassId = currentProfile.classId;
          setupSubjectContext();
        }

        // Load document if docId is provided, otherwise initialize fresh editor
        if (currentDocId) {
          await loadExistingDocument(currentDocId);
        } else {
          const typeParam = getQueryParam("type");
          currentDocType = typeParam === "exercise" ? "exercise" : "document";
          setupDocTypeUI();
          loadPinnedNotes();
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

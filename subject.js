/**
 * subject.js - Unified Subject Hub Controller for Quill-Q
 * Handles subject metadata rendering, real-time Firestore sync, client-side filtering,
 * and navigation to the BlockNote full-page editor.
 */

(function () {
  let db = null;
  let auth = null;
  let currentUser = null;
  let currentProfile = null;
  let currentSubjectId = "writing";
  let documentsUnsubscribe = null;
  let allDocumentsCache = [];

  const SUPER_ADMIN_EMAILS = ["dodchadam@gmail.com", "dotchadam@gmail.com"];

  // DOM Elements
  const heroCard = document.getElementById("subject-hero-card");
  const heroIcon = document.getElementById("subject-hero-icon");
  const heroCode = document.getElementById("subject-code-pill");
  const heroTitle = document.getElementById("subject-hero-title");
  const heroDesc = document.getElementById("subject-hero-desc");
  const heroProf = document.getElementById("subject-prof-name");
  const heroRoom = document.getElementById("subject-room-name");
  const heroSchedule = document.getElementById("subject-schedule-name");
  const subjectSelect = document.getElementById("subject-select");
  const btnCreateDoc = document.getElementById("btn-create-document");
  const btnCreateLabel = document.getElementById("btn-create-label");
  const tabBtnDocs = document.getElementById("tab-btn-docs");
  const tabBtnExercises = document.getElementById("tab-btn-exercises");
  const tabCountDocs = document.getElementById("tab-count-docs");
  const tabCountExercises = document.getElementById("tab-count-exercises");
  const docsGrid = document.getElementById("docs-grid");
  const searchInput = document.getElementById("docs-search-input");
  const navAvatar = document.getElementById("nav-user-avatar");
  const navName = document.getElementById("nav-user-name");
  const navRole = document.getElementById("nav-user-role");

  let activeTab = "docs"; // "docs" | "exercises"

  function isSuperAdminUser(profile, user) {
    if (user && user.email && SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase().trim())) return true;
    if (profile && profile.email && SUPER_ADMIN_EMAILS.includes(profile.email.toLowerCase().trim())) return true;
    if (profile && profile.role === "admin") return true;
    return false;
  }

  function getQueryParam(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  }

  function formatTimeAgo(timestamp) {
    if (!timestamp) return "Recently";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffSecs = Math.floor((now - date) / 1000);

    if (diffSecs < 60) return "Just now";
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    if (diffSecs < 604800) return `${Math.floor(diffSecs / 86400)}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function initSubjectDropdown() {
    if (!subjectSelect || typeof getAllSubjects !== "function") return;
    const subjects = getAllSubjects();
    subjectSelect.innerHTML = "";

    subjects.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = s.name;
      if (s.id === currentSubjectId) opt.selected = true;
      subjectSelect.appendChild(opt);
    });

    subjectSelect.addEventListener("change", (e) => {
      switchSubject(e.target.value);
    });
  }

  function renderSubjectHero(subjectId) {
    const subject = typeof getSubjectById === "function" ? getSubjectById(subjectId) : null;
    if (!subject) return;

    currentSubjectId = subject.id;
    document.title = `${subject.name} – Quill-Q Document Library`;

    // Apply color class
    if (heroCard) {
      heroCard.className = `subject-hero-card ${subject.bgClass || "card-peach"}`;
    }

    if (heroTitle) heroTitle.textContent = subject.name;
    if (heroDesc) heroDesc.textContent = subject.description;

    if (heroIcon && typeof getSubjectIconSvg === "function") {
      heroIcon.innerHTML = getSubjectIconSvg(subject.icon);
    }

    updateCreateBtn();

    if (subjectSelect) {
      subjectSelect.value = currentSubjectId;
    }
  }

  function updateCreateBtn() {
    if (!btnCreateDoc) return;
    const isExercise = activeTab === "exercises";
    btnCreateDoc.href = `editor.html?subject=${encodeURIComponent(currentSubjectId)}&action=new&type=${isExercise ? "exercise" : "doc"}`;
    if (btnCreateLabel) {
      btnCreateLabel.textContent = isExercise ? "Create Exercise" : "Create Document";
    }
    if (searchInput) {
      searchInput.placeholder = isExercise 
        ? "Search exercises, practice worksheets, tasks..." 
        : "Search lesson notes, summaries, topics...";
    }
  }

  function switchTab(newTab) {
    if (activeTab === newTab) return;
    activeTab = newTab;
    if (tabBtnDocs) {
      tabBtnDocs.classList.toggle("active", activeTab === "docs");
      tabBtnDocs.setAttribute("aria-selected", activeTab === "docs");
    }
    if (tabBtnExercises) {
      tabBtnExercises.classList.toggle("active", activeTab === "exercises");
      tabBtnExercises.setAttribute("aria-selected", activeTab === "exercises");
    }
    updateCreateBtn();
    filterAndRenderDocs();
  }

  function switchSubject(newSubjectId) {
    if (newSubjectId === currentSubjectId) return;

    // Update URL query parameter without full reload
    const url = new URL(window.location.href);
    url.searchParams.set("id", newSubjectId);
    window.history.replaceState({}, "", url.toString());

    renderSubjectHero(newSubjectId);
    bindDocumentsListener();
  }

  function renderDocumentCards(docs) {
    if (!docsGrid) return;
    docsGrid.innerHTML = "";

    if (!docs || docs.length === 0) {
      const isSearch = searchInput && searchInput.value.trim().length > 0;
      const isExerciseTab = activeTab === "exercises";
      docsGrid.innerHTML = `
        <div class="docs-empty-state">
          <div class="docs-empty-icon" style="${isExerciseTab ? 'background: #f0e6ff;' : ''}">
            <i class="fi ${isExerciseTab ? 'fi-rr-edit' : 'fi-rr-document'}" style="${isExerciseTab ? 'color: #7934c9;' : ''}"></i>
          </div>
          <h2 class="docs-empty-title">
            ${isSearch ? "No matching results found" : (isExerciseTab ? "No exercises yet for this subject" : "No lesson documents yet")}
          </h2>
          <p class="docs-empty-desc">
            ${isSearch ? "Try searching with different keywords." : (isExerciseTab ? "Create interactive worksheets and practice tasks for students to answer!" : "Be the first to capture lecture notes, study guides, and summaries!")}
          </p>
          ${!isSearch ? `
            <a href="editor.html?subject=${encodeURIComponent(currentSubjectId)}&action=new&type=${isExerciseTab ? 'exercise' : 'doc'}" class="btn-create-doc" style="margin-top: 8px;">
              <i class="fi fi-sr-add"></i>
              <span>${isExerciseTab ? 'Create First Exercise' : 'Create First Document'}</span>
            </a>
          ` : ""}
        </div>
      `;
      return;
    }

    const isSuperAdmin = isSuperAdminUser(currentProfile, currentUser);

    docs.forEach((doc, index) => {
      const card = document.createElement("article");
      card.className = "doc-card";
      card.style.animationDelay = `${index * 0.06 + 0.18}s`;
      card.tabIndex = 0;

      const title = doc.title || "Untitled Document";
      const excerpt = doc.excerpt || "Empty document...";
      const isExercise = doc.docType === "exercise";
      const authorName = doc.authorName || "Student";
      const authorRole = doc.authorRole || "Student";
      const authorAvatar = doc.authorAvatar || doc.authorPhotoURL || "assets/avatar.jpg";
      const lastEditorName = doc.lastEditorName || null;
      const lastEditorAvatar = doc.lastEditorAvatar || "assets/avatar.jpg";
      const isEditedByOther = Boolean(lastEditorName && doc.lastEditorId !== doc.authorId && lastEditorName !== authorName);
      const timeAgo = formatTimeAgo(doc.updatedAt || doc.createdAt);
      const canDelete = isSuperAdmin || (currentUser && doc.authorId === currentUser.uid);

      card.innerHTML = `
        <div class="doc-card-top">
          <span class="doc-card-badge ${isExercise ? 'doc-badge-exercise' : ''}">
            <i class="fi ${isExercise ? 'fi-rr-edit' : 'fi-rr-file-edit'}"></i>
            <span>${isExercise ? 'Exercise' : 'Notes'}</span>
          </span>
          <div class="doc-card-actions">
            <a href="editor.html?subject=${encodeURIComponent(currentSubjectId)}&docId=${encodeURIComponent(doc.id)}" 
               class="doc-btn-icon" title="Open in Full-Page Editor" aria-label="Open editor">
              <i class="fi fi-rr-arrow-up-right"></i>
            </a>
            ${canDelete ? `
              <button class="doc-btn-icon doc-btn-delete" data-doc-id="${doc.id}" title="Delete Document" aria-label="Delete document">
                <i class="fi fi-rr-trash"></i>
              </button>
            ` : ""}
          </div>
        </div>

        <h3 class="doc-card-title">${escapeHtml(title)}</h3>
        <p class="doc-card-excerpt">${escapeHtml(excerpt)}</p>

        <div class="doc-card-footer">
          <div class="doc-card-author">
            <div class="doc-card-avatars-wrap">
              <img src="${escapeHtml(authorAvatar)}" alt="${escapeHtml(authorName)}" class="doc-card-avatar doc-avatar-author" title="Author: ${escapeHtml(authorName)}" referrerpolicy="no-referrer" onerror="this.src='assets/avatar.jpg'" />
              ${isEditedByOther ? `
                <img src="${escapeHtml(lastEditorAvatar)}" alt="${escapeHtml(lastEditorName)}" class="doc-card-avatar doc-avatar-editor" title="Edited by: ${escapeHtml(lastEditorName)}" referrerpolicy="no-referrer" onerror="this.src='assets/avatar.jpg'" />
              ` : ""}
            </div>
            <div class="doc-card-meta">
              <div class="doc-card-author-row">
                <span class="doc-card-author-name">${escapeHtml(authorName)}</span>
                ${isEditedByOther ? `
                  <span class="doc-card-editor-badge" title="Edited by ${escapeHtml(lastEditorName)}"><i class="fi fi-rr-edit"></i> Edited by ${escapeHtml(lastEditorName)}</span>
                ` : ""}
              </div>
              <span class="doc-card-time">${timeAgo}</span>
            </div>
          </div>
        </div>
      `;

      // Entire card clicks open the editor (unless clicking the delete button)
      card.addEventListener("click", (e) => {
        if (e.target.closest(".doc-btn-delete")) return;
        window.location.href = `editor.html?subject=${encodeURIComponent(currentSubjectId)}&docId=${encodeURIComponent(doc.id)}`;
      });

      // Handle delete
      const delBtn = card.querySelector(".doc-btn-delete");
      if (delBtn) {
        delBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          deleteDocument(doc.id, title);
        });
      }

      docsGrid.appendChild(card);
    });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function deleteDocument(docId, docTitle) {
    let confirmed = false;
    if (typeof window.showCustomConfirm === "function") {
      confirmed = await window.showCustomConfirm(
        `Are you sure you want to delete "${docTitle}"? All lecture notes and pages in this document will be permanently removed.`,
        "Delete Document?",
        '<i class="fi fi-rr-trash"></i>',
        "Delete Document",
        "Keep Document",
        true
      );
    } else {
      confirmed = window.confirm(`Are you sure you want to delete "${docTitle}"? This cannot be undone.`);
    }

    if (!confirmed) return;

    try {
      if (!db) return;
      await db.collection("subjects").doc(currentSubjectId).collection("documents").doc(docId).delete();
      showToast("Document deleted successfully");
    } catch (err) {
      console.error("Error deleting document:", err);
      showToast("Failed to delete document: " + err.message, "error");
    }
  }

  function bindDocumentsListener() {
    if (documentsUnsubscribe) {
      try { documentsUnsubscribe(); } catch (e) {}
      documentsUnsubscribe = null;
    }

    if (!db || !currentUser) return;

    const isSuperAdmin = isSuperAdminUser(currentProfile, currentUser);
    const isApproved = currentProfile && (currentProfile.status === "approved" || isSuperAdmin);

    if (!isApproved) {
      if (docsGrid) {
        docsGrid.innerHTML = `
          <div class="docs-empty-state">
            <div class="docs-empty-icon" style="background: #ffe3e3;">
              <i class="fi fi-rr-lock" style="color: #c92a2a;"></i>
            </div>
            <h2 class="docs-empty-title">Pending Administrator Approval</h2>
            <p class="docs-empty-desc">
              Your account is currently waiting for admin approval. Once approved, you will have access to all subject documents and rich text editors.
            </p>
          </div>
        `;
      }
      return;
    }

    // Show loading state
    if (docsGrid) {
      docsGrid.innerHTML = `
        <div class="doc-card" style="opacity: 0.6; pointer-events: none;">
          <div class="doc-card-top">
            <span class="doc-card-badge">Loading...</span>
          </div>
          <h3 class="doc-card-title">Fetching subject documents...</h3>
          <p class="doc-card-excerpt">Synchronizing with Quill-Q server...</p>
        </div>
      `;
    }

    const docRef = db.collection("subjects").doc(currentSubjectId).collection("documents");

    documentsUnsubscribe = docRef.onSnapshot(
      (snapshot) => {
        const docs = [];
        snapshot.forEach((d) => {
          docs.push({ id: d.id, ...d.data() });
        });

        // Sort by updatedAt descending
        docs.sort((a, b) => {
          const tA = a.updatedAt ? (a.updatedAt.toMillis ? a.updatedAt.toMillis() : new Date(a.updatedAt).getTime()) : 0;
          const tB = b.updatedAt ? (b.updatedAt.toMillis ? b.updatedAt.toMillis() : new Date(b.updatedAt).getTime()) : 0;
          return tB - tA;
        });

        allDocumentsCache = docs;
        filterAndRenderDocs();
      },
      (error) => {
        console.error("Firestore document listener error:", error);
        if (docsGrid) {
          docsGrid.innerHTML = `
            <div class="docs-empty-state">
              <div class="docs-empty-icon" style="background: #ffe3e3;">
                <i class="fi fi-rr-cross-circle" style="color: #c92a2a;"></i>
              </div>
              <h2 class="docs-empty-title">Could not load documents</h2>
              <p class="docs-empty-desc">${error.message}</p>
            </div>
          `;
        }
      }
    );
  }

  function filterAndRenderDocs() {
    // 1. Update live counters for both tabs
    const docsList = allDocumentsCache.filter((d) => (d.docType || "document") !== "exercise");
    const exercisesList = allDocumentsCache.filter((d) => (d.docType || "document") === "exercise");

    if (tabCountDocs) tabCountDocs.textContent = docsList.length;
    if (tabCountExercises) tabCountExercises.textContent = exercisesList.length;

    // 2. Select target list based on active tab
    const targetList = activeTab === "exercises" ? exercisesList : docsList;

    // 3. Search query filtering
    const q = searchInput ? searchInput.value.toLowerCase().trim() : "";
    if (!q) {
      renderDocumentCards(targetList);
      return;
    }

    const filtered = targetList.filter((doc) => {
      const titleMatch = (doc.title || "").toLowerCase().includes(q);
      const excerptMatch = (doc.excerpt || "").toLowerCase().includes(q);
      const authorMatch = (doc.authorName || "").toLowerCase().includes(q);
      return titleMatch || excerptMatch || authorMatch;
    });

    renderDocumentCards(filtered);
  }

  function showToast(msg, type = "success") {
    const container = document.getElementById("inapp-toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `inapp-toast ${type === "error" ? "toast-error" : ""}`;
    toast.innerHTML = `<span>${escapeHtml(msg)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-10px)";
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  }

  // Live search filtering
  if (searchInput) {
    searchInput.addEventListener("input", filterAndRenderDocs);
  }

  // Initialization lifecycle
  document.addEventListener("DOMContentLoaded", () => {
    // Bind Tab Switching Events
    if (tabBtnDocs) {
      tabBtnDocs.addEventListener("click", () => switchTab("docs"));
    }
    if (tabBtnExercises) {
      tabBtnExercises.addEventListener("click", () => switchTab("exercises"));
    }

    // 1. Determine subject from query parameter
    const querySub = getQueryParam("id") || getQueryParam("subject");
    if (querySub && typeof getSubjectById === "function" && getSubjectById(querySub)) {
      currentSubjectId = getSubjectById(querySub).id;
    }

    initSubjectDropdown();
    renderSubjectHero(currentSubjectId);

    // 2. Initialize Firebase
    if (typeof initFirebase === "function") {
      const fb = initFirebase();
      auth = fb.auth;
      db = fb.db;
    }

    // 3. Auth state listener
    if (auth) {
      auth.onAuthStateChanged(async (user) => {
        if (!user) {
          // Not signed in -> return to main index dashboard
          window.location.href = "index.html";
          return;
        }

        currentUser = user;

        // Fetch User Profile from Firestore
        try {
          const userDoc = await db.collection("users").doc(user.uid).get();
          if (userDoc.exists) {
            currentProfile = userDoc.data();
          } else {
            currentProfile = {
              displayName: user.displayName || user.email.split("@")[0],
              email: user.email,
              role: "student",
              status: "pending"
            };
          }
        } catch (e) {
          console.warn("Could not load user profile:", e);
          currentProfile = { email: user.email, role: "student", status: "pending" };
        }

        // Update nav bar user info
        if (navName) navName.textContent = currentProfile.displayName || user.displayName || "Student";
        if (navRole) navRole.textContent = currentProfile.role || "Student";
        if (navAvatar) {
          const avatarUrl = currentProfile?.photoURL || currentProfile?.avatarUrl || user.photoURL || "assets/avatar.jpg";
          navAvatar.src = avatarUrl;
          navAvatar.referrerPolicy = "no-referrer";
          navAvatar.onerror = () => { navAvatar.src = "assets/avatar.jpg"; };
        }

        // Bind real-time documents listener
        bindDocumentsListener();
      });
    }
  });
})();

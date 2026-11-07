/**
 * admin.js - Standalone Admin Portal & Timetable Schedule Editor for Quill-Q
 * Handles member approvals, role management, and live schedule CRUD.
 */

(function () {
  "use strict";

  const SUPER_ADMIN_EMAILS = ["dodchadam@gmail.com", "dotchadam@gmail.com"];

  // Default seed timetable for fallback & reset
  const DEFAULT_SEED_SCHEDULE = {
    Mon: {
      dayName: "Monday",
      dateLabel: "Monday, Oct 19",
      activeClassIndex: 1,
      items: [
        { time: "08:30 AM – 10:00 AM", subject: "Entrepreneurial Skills (Droit)", prof: "شابي علي صلاح", room: "Salle-14", type: "TD", color: "#e8987a", icon: "law" },
        { time: "10:00 AM – 11:30 AM", subject: "Writing", prof: "نسرين بن الصادق", room: "Salle-15", type: "TD", color: "#f6cf7c", current: true, icon: "writing" },
        { time: "11:30 AM – 01:00 PM", subject: "British History", prof: "عيادي روضة", room: "Amphi 1", type: "C", color: "#a9c6ec", icon: "history" },
        { time: "01:30 PM – 02:30 PM", subject: "Financial English 1", prof: "غربي إيمان", room: "Amphi 6", type: "C", color: "#5bae86", icon: "finance" }
      ]
    },
    Tue: {
      dayName: "Tuesday",
      dateLabel: "Tuesday, Oct 20",
      activeClassIndex: 1,
      items: [
        { time: "08:30 AM – 10:00 AM", subject: "Other Languages (French)", prof: "بن علي حافظ", room: "Salle-14", type: "TD", color: "#e8987a", icon: "language" },
        { time: "10:00 AM – 11:30 AM", subject: "Other Languages (Arabic for specific purposes)", prof: "جهاد معلى", room: "lab-3", type: "TD", color: "#f6cf7c", current: true, icon: "language" },
        { time: "11:30 AM – 01:00 PM", subject: "Grammar in Context", prof: "العفاس نجلاء", room: "Amphi 4", type: "C", color: "#a9c6ec", icon: "grammar" },
        { time: "01:00 PM – 02:30 PM", subject: "Grammar in Context", prof: "العفاس نجلاء", room: "Salle-18", type: "TD", color: "#5bae86", icon: "grammar" },
        { time: "02:30 PM – 04:00 PM", subject: "Drama/Poetry/Novel :Poetry", prof: "بن شهيدة مريم", room: "lab-3", type: "CI", color: "#e0835f", icon: "theater" }
      ]
    },
    Wed: {
      dayName: "Wednesday",
      dateLabel: "Wednesday, Oct 21",
      activeClassIndex: 1,
      items: [
        { time: "08:30 AM – 10:00 AM", subject: "Drama/Poetry/Novel :Drama", prof: "غمامي سناء", room: "Salle-15", type: "CI", color: "#e8987a", icon: "theater" },
        { time: "10:00 AM – 11:30 AM", subject: "Literary Trends", prof: "منيف حافظ", room: "Amphi 1", type: "C", color: "#f6cf7c", current: true, icon: "literature" },
        { time: "01:30 PM – 03:00 PM", subject: "Financial English 1", prof: "غربي أحمد عبد العزيز", room: "Salle-15", type: "TD", color: "#a9c6ec", icon: "finance" },
        { time: "03:00 PM – 04:30 PM", subject: "Drama/Poetry/Novel :Novel", prof: "كلثوم بالوافي", room: "Salle-16", type: "CI", color: "#5bae86", icon: "theater" }
      ]
    },
    Thu: {
      dayName: "Thursday",
      dateLabel: "Thursday, Oct 22",
      activeClassIndex: 0,
      items: [
        { time: "09:30 AM – 11:00 AM", subject: "Introduction to Linguistics", prof: "رانية الدريسي", room: "Amphi 3", type: "C", color: "#f6cf7c", current: true, icon: "linguistics" },
        { time: "11:00 AM – 12:30 PM", subject: "Introduction to Linguistics", prof: "رانية الدريسي", room: "Salle-10", type: "TD", color: "#e8987a", icon: "linguistics" },
        { time: "01:30 PM – 03:00 PM", subject: "US History", prof: "كعمون وسيم", room: "Amphi 4", type: "C", color: "#a9c6ec", icon: "history" },
        { time: "03:00 PM – 04:30 PM", subject: "US History", prof: "كعمون وسيم", room: "Salle-12", type: "TD", color: "#5bae86", icon: "history" }
      ]
    },
    Fri: {
      dayName: "Friday",
      dateLabel: "Friday, Oct 23",
      activeClassIndex: 1,
      items: [
        { time: "08:30 AM – 10:00 AM", subject: "British History", prof: "عيادي روضة", room: "Salle-13", type: "TD", color: "#e8987a", icon: "history" },
        { time: "10:00 AM – 11:30 AM", subject: "Commercial English 1", prof: "الشرقي سهلة", room: "Amphi 4", type: "C", color: "#f6cf7c", current: true, icon: "business" },
        { time: "11:30 AM – 01:00 PM", subject: "Commercial English 1", prof: "الشرقي سهلة", room: "Salle-10", type: "TD", color: "#a9c6ec", icon: "business" },
        { time: "02:00 PM – 03:30 PM", subject: "Entrepreneurial Skills", prof: "الغندري أحلام", room: "Salle-12", type: "TD", color: "#5bae86", icon: "law" },
        { time: "04:00 PM – 05:30 PM", subject: "Activités pratiques (TEFL)", prof: "رانية الدريسي", room: "Salle-11", type: "TD", color: "#e0835f", icon: "tefl" }
      ]
    },
    Sat: { dayName: "Saturday", dateLabel: "Saturday, Oct 24", activeClassIndex: -1, items: [] },
    Sun: { dayName: "Sunday", dateLabel: "Sunday, Oct 25", activeClassIndex: -1, items: [] }
  };

  const DEFAULT_SEED_SCHEDULE_GRP2 = {
    Mon: {
      dayName: "Monday",
      dateLabel: "Monday, Oct 19",
      activeClassIndex: 1,
      items: [
        { time: "08:30 AM – 10:00 AM", subject: "Writing", prof: "نسرين بن الصادق", room: "Salle 15", type: "C", color: "#f6cf7c", icon: "writing" },
        { time: "10:00 AM – 11:30 AM", subject: "Entrepreneurial Skills (Droit)", prof: "سابي علي صلاح", room: "Salle 14", type: "TD", color: "#e8987a", current: true, icon: "law" },
        { time: "11:30 AM – 12:30 PM", subject: "British History", prof: "عيادي روضة", room: "Amphi 6", type: "C", color: "#a9c6ec", icon: "history" },
        { time: "12:30 PM – 01:30 PM", subject: "Financial English 1", prof: "غريس إيمان", room: "Amphi 6", type: "C", color: "#5bae86", icon: "finance" }
      ]
    },
    Tue: {
      dayName: "Tuesday",
      dateLabel: "Tuesday, Oct 20",
      activeClassIndex: 1,
      items: [
        { time: "08:30 AM – 10:00 AM", subject: "Grammar in Context", prof: "العفاس نجلاء", room: "Amphi 4", type: "C", color: "#a9c6ec", icon: "grammar" },
        { time: "10:00 AM – 11:30 AM", subject: "Other Languages (French)", prof: "بن علي حافظ", room: "Salle 14", type: "TD", color: "#e8987a", current: true, icon: "language" },
        { time: "11:30 AM – 01:00 PM", subject: "Other Languages (Arabic for specific purposes)", prof: "مريم الهماصي", room: "lab 3", type: "TD", color: "#f6cf7c", icon: "language" },
        { time: "01:00 PM – 02:30 PM", subject: "Drama/Poetry/Novel (Poetry)", prof: "بن شهيدة مريم", room: "lab 3", type: "CI", color: "#e0835f", icon: "theater" },
        { time: "02:30 PM – 04:00 PM", subject: "Grammar in Context", prof: "العفاس نجلاء", room: "Salle 18", type: "TD", color: "#5bae86", icon: "grammar" }
      ]
    },
    Wed: {
      dayName: "Wednesday",
      dateLabel: "Wednesday, Oct 21",
      activeClassIndex: 1,
      items: [
        { time: "08:30 AM – 10:00 AM", subject: "Financial English 1", prof: "غريس إيمان", room: "Salle 15", type: "TD", color: "#5bae86", icon: "finance" },
        { time: "10:00 AM – 11:30 AM", subject: "Literary Trends", prof: "عنيف حافظ", room: "Amphi 1", type: "C", color: "#f6cf7c", current: true, icon: "literature" },
        { time: "11:30 AM – 01:00 PM", subject: "Drama/Poetry/Novel (Novel)", prof: "كلثوم بالوافي", room: "Salle 16", type: "CI", color: "#a9c6ec", icon: "theater" },
        { time: "01:00 PM – 02:30 PM", subject: "Drama/Poetry/Novel (Drama)", prof: "غمامي سناء", room: "Salle 15", type: "CI", color: "#e8987a", icon: "theater" }
      ]
    },
    Thu: {
      dayName: "Thursday",
      dateLabel: "Thursday, Oct 22",
      activeClassIndex: 0,
      items: [
        { time: "09:30 AM – 11:00 AM", subject: "Introduction to Linguistics", prof: "رانية الإدريسي", room: "Amphi 3", type: "C", color: "#f6cf7c", current: true, icon: "linguistics" },
        { time: "11:00 AM – 12:30 PM", subject: "US History", prof: "كعمون وسيم", room: "Amphi 4", type: "C", color: "#a9c6ec", icon: "history" },
        { time: "12:30 PM – 02:00 PM", subject: "US History", prof: "كعمون وسيم", room: "Salle 12", type: "TD", color: "#5bae86", icon: "history" },
        { time: "02:00 PM – 03:30 PM", subject: "Introduction to Linguistics", prof: "رانية الإدريسي", room: "Salle 10", type: "TD", color: "#e0835f", icon: "linguistics" }
      ]
    },
    Fri: {
      dayName: "Friday",
      dateLabel: "Friday, Oct 23",
      activeClassIndex: 0,
      items: [
        { time: "08:30 AM – 10:00 AM", subject: "Commercial English 1", prof: "الشرقي سهلة", room: "Salle 10", type: "TD", color: "#a9c6ec", icon: "business" },
        { time: "10:00 AM – 11:30 AM", subject: "Commercial English 1", prof: "الشرقي سهلة", room: "Amphi 4", type: "C", color: "#f6cf7c", current: true, icon: "business" },
        { time: "11:30 AM – 01:00 PM", subject: "Entrepreneurial Skills (Droit)", prof: "الغندري أحلام", room: "Salle 12", type: "TD", color: "#5bae86", icon: "law" },
        { time: "01:00 PM – 02:30 PM", subject: "British History", prof: "عيادي روضة", room: "Salle 13", type: "TD", color: "#e8987a", icon: "history" },
        { time: "02:30 PM – 04:00 PM", subject: "Activités pratiques (TEFL)", prof: "رانية الإدريسي", room: "Salle 11", type: "TD", color: "#e0835f", icon: "tefl" }
      ]
    },
    Sat: { dayName: "Saturday", dateLabel: "Saturday, Oct 24", activeClassIndex: -1, items: [] },
    Sun: { dayName: "Sunday", dateLabel: "Sunday, Oct 25", activeClassIndex: -1, items: [] }
  };

  // Official Subject Presets
  const UNIVERSITY_SUBJECTS = [
    { name: "Writing", icon: "writing", color: "#f6cf7c" },
    { name: "British History", icon: "history", color: "#a9c6ec" },
    { name: "US History", icon: "history", color: "#a9c6ec" },
    { name: "Financial English 1", icon: "finance", color: "#5bae86" },
    { name: "Grammar in Context", icon: "grammar", color: "#a9c6ec" },
    { name: "Commercial English 1", icon: "business", color: "#f6cf7c" },
    { name: "Entrepreneurial Skills (Droit)", icon: "law", color: "#e8987a" },
    { name: "Other Languages (French)", icon: "language", color: "#e8987a" },
    { name: "Other Languages (Arabic for specific purposes)", icon: "language", color: "#f6cf7c" },
    { name: "Drama/Poetry/Novel :Drama", icon: "theater", color: "#e8987a" },
    { name: "Drama/Poetry/Novel :Poetry", icon: "theater", color: "#e0835f" },
    { name: "Drama/Poetry/Novel :Novel", icon: "theater", color: "#5bae86" },
    { name: "Literary Trends", icon: "literature", color: "#f6cf7c" },
    { name: "Introduction to Linguistics", icon: "linguistics", color: "#f6cf7c" },
    { name: "Activités pratiques (TEFL)", icon: "tefl", color: "#e0835f" }
  ];

  // Official Faculty Teachers
  const FACULTY_TEACHERS = [
    "نسرين بن الصادق",
    "شابي علي صلاح",
    "سابي علي صلاح",
    "عيادي روضة",
    "غربي إيمان",
    "غريس إيمان",
    "بن علي حافظ",
    "جهاد معلى",
    "العفاس نجلاء",
    "بن شهيدة مريم",
    "غمامي سناء",
    "منيف حافظ",
    "عنيف حافظ",
    "غربي أحمد عبد العزيز",
    "كلثوم بالوافي",
    "رانية الدريسي",
    "رانية الإدريسي",
    "كعمون وسيم",
    "الشرقي سهلة",
    "الغندري أحلام",
    "مريم الهماصي"
  ];

  let auth = null;
  let db = null;
  let currentUser = null;
  let currentProfile = null;

  // Schedule Editor State (Multi-class & multi-group)
  let currentAdminClass = "2ang-aff";
  let currentAdminGroup = "grp1";
  let adminTimetables = {
    "2ang-aff_grp1": JSON.parse(JSON.stringify(DEFAULT_SEED_SCHEDULE)),
    "2ang-aff_grp2": JSON.parse(JSON.stringify(DEFAULT_SEED_SCHEDULE_GRP2)),
    grp1: JSON.parse(JSON.stringify(DEFAULT_SEED_SCHEDULE)),
    grp2: JSON.parse(JSON.stringify(DEFAULT_SEED_SCHEDULE_GRP2))
  };
  let currentScheduleDay = "Mon";
  let workingTimetable = adminTimetables["2ang-aff_grp1"];
  let hasUnsavedScheduleChanges = false;

  function createBlankTimetable(dayDateLabel = "") {
    return {
      Mon: { dayName: "Monday", dateLabel: dayDateLabel || "Monday, Oct 19", activeClassIndex: -1, items: [] },
      Tue: { dayName: "Tuesday", dateLabel: dayDateLabel || "Tuesday, Oct 20", activeClassIndex: -1, items: [] },
      Wed: { dayName: "Wednesday", dateLabel: dayDateLabel || "Wednesday, Oct 21", activeClassIndex: -1, items: [] },
      Thu: { dayName: "Thursday", dateLabel: dayDateLabel || "Thursday, Oct 22", activeClassIndex: -1, items: [] },
      Fri: { dayName: "Friday", dateLabel: dayDateLabel || "Friday, Oct 23", activeClassIndex: -1, items: [] },
      Sat: { dayName: "Saturday", dateLabel: dayDateLabel || "Saturday, Oct 24", activeClassIndex: -1, items: [] },
      Sun: { dayName: "Sunday", dateLabel: dayDateLabel || "Sunday, Oct 25", activeClassIndex: -1, items: [] }
    };
  }

  function getTimetableKey(classId, groupId) {
    return `${classId || "2ang-aff"}_${groupId || "grp1"}`;
  }

  function getOrCreateTimetable(classId, groupId) {
    const key = getTimetableKey(classId, groupId);
    if (adminTimetables[key]) return adminTimetables[key];

    // Check localStorage cache
    try {
      const local = localStorage.getItem("quill_q_server_schedule_" + key);
      if (local) {
        adminTimetables[key] = JSON.parse(local);
        return adminTimetables[key];
      }
    } catch (e) {}

    // Seed defaults for English Business
    if ((classId === "2ang-aff" || !classId) && groupId === "grp2") {
      adminTimetables[key] = JSON.parse(JSON.stringify(DEFAULT_SEED_SCHEDULE_GRP2));
      return adminTimetables[key];
    }
    if ((classId === "2ang-aff" || !classId) && (groupId === "grp1" || !groupId)) {
      adminTimetables[key] = JSON.parse(JSON.stringify(DEFAULT_SEED_SCHEDULE));
      return adminTimetables[key];
    }

    // Blank template for other classes / groups
    adminTimetables[key] = createBlankTimetable();
    return adminTimetables[key];
  }

  // Member Management State
  let currentMemberTab = "pending";
  let cachedMembers = [];
  let membersListener = null;

  // Escape HTML helper
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // In-App Toast Notification
  function showToast(message, type = "info") {
    let container = document.getElementById("inapp-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "inapp-toast-container";
      container.className = "inapp-toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `inapp-toast toast-${type}`;

    let iconClass = "fi fi-rr-info";
    if (type === "success") iconClass = "fi fi-rr-check";
    else if (type === "error") iconClass = "fi fi-rr-cross-circle";
    else if (type === "warning") iconClass = "fi fi-rr-triangle-warning";

    toast.innerHTML = `
      <div class="inapp-toast-icon-wrap"><i class="${iconClass}"></i></div>
      <div class="inapp-toast-body">
        <div class="inapp-toast-title">${escapeHtml(message)}</div>
      </div>
    `;

    toast.addEventListener("click", () => {
      dismissToast(toast);
    });

    container.appendChild(toast);

    const timer = setTimeout(() => {
      dismissToast(toast);
    }, 3800);

    function dismissToast(el) {
      clearTimeout(timer);
      if (el.classList.contains("is-leaving")) return;
      el.classList.add("is-leaving");
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 260);
    }
  }

  function playAdminNotificationChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = "sine";
      osc2.type = "triangle";
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.28);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime + 0.12);
      osc1.stop(ctx.currentTime + 0.14);
      osc2.stop(ctx.currentTime + 0.45);
    } catch (e) {
      console.warn("Audio chime failed:", e);
    }
  }

  function sendAdminSystemNotification(title, body) {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      try { Notification.requestPermission(); } catch (e) {}
    }
    if (Notification.permission !== "granted") return;
    try {
      new Notification(title, {
        body: body,
        icon: "assets/icon-192.png",
        badge: "assets/favicon-32x32-light.png"
      });
    } catch (e) {
      console.warn("Admin notification dispatch failed:", e);
    }
  }

  function isSuperAdminUser(profile, user) {
    const userEmail = (user && user.email) ? user.email.toLowerCase().trim() : "";
    const profEmail = (profile && profile.email) ? profile.email.toLowerCase().trim() : "";
    if (SUPER_ADMIN_EMAILS.includes(userEmail) || SUPER_ADMIN_EMAILS.includes(profEmail)) return true;
    if (profile && profile.role === "admin") return true;
    return false;
  }

  /* ==========================================================================
     INITIALIZATION & AUTH CHECK
     ========================================================================== */

  document.addEventListener("DOMContentLoaded", () => {
    if (typeof initFirebase === "function") {
      const fb = initFirebase();
      auth = fb.auth;
      db = fb.db;
      if (window.AcademicRegistry && typeof window.AcademicRegistry.bindFirestoreAcademicStructure === "function") {
        window.AcademicRegistry.bindFirestoreAcademicStructure(db);
      }
    }

    if (!auth) {
      showAccessDenied();
      return;
    }

    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        showAccessDenied();
        return;
      }

      currentUser = user;

      // Load User Profile from Firestore
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
      } catch (err) {
        console.warn("Could not load user profile:", err);
      }

      // Check Admin Authorization
      if (!isSuperAdminUser(currentProfile, currentUser)) {
        showAccessDenied();
        return;
      }

      // Authorized Super Admin! Show Admin Portal
      showAdminPortal();
      bindHeaderEvents();
      initMainTabs();
      initScheduleEditor();
      initClassesManager();
      initMemberManagement();
    });
  });

  function showAccessDenied() {
    const deniedBox = document.getElementById("access-denied-box");
    const adminMain = document.getElementById("admin-main-container");
    if (deniedBox) deniedBox.classList.remove("view-hidden");
    if (adminMain) adminMain.classList.add("view-hidden");
  }

  function showAdminPortal() {
    const deniedBox = document.getElementById("access-denied-box");
    const adminMain = document.getElementById("admin-main-container");
    const navName = document.getElementById("admin-nav-name");
    const navAvatar = document.getElementById("admin-nav-avatar");

    if (deniedBox) deniedBox.classList.add("view-hidden");
    if (adminMain) adminMain.classList.remove("view-hidden");

    if (navName) {
      navName.textContent = (currentProfile && currentProfile.displayName) || (currentUser && currentUser.displayName) || "Admin";
    }
    if (navAvatar) {
      navAvatar.src = (currentProfile && currentProfile.photoURL) || (currentUser && currentUser.photoURL) || "assets/avatar.jpg";
    }
  }

  function bindHeaderEvents() {
    const btnLogout = document.getElementById("btn-admin-logout");
    if (btnLogout) {
      btnLogout.addEventListener("click", async () => {
        const confirmed = await showCustomConfirm(
          "Are you sure you want to sign out of the Quill-Q Admin Portal?",
          "Sign Out",
          '<i class="fi fi-rr-sign-out-alt"></i>',
          "Sign Out",
          "Cancel"
        );
        if (confirmed && auth) {
          try {
            await auth.signOut();
            window.location.href = "index.html";
          } catch (e) {
            console.error("Logout error:", e);
          }
        }
      });
    }
  }

  /* ==========================================================================
     SECTION TABS: SCHEDULE EDITOR vs CLASSES & GROUPS vs MEMBER APPROVALS
     ========================================================================== */

  function initMainTabs() {
    const tabSched = document.getElementById("btn-tab-schedule");
    const tabClasses = document.getElementById("btn-tab-classes");
    const tabMembers = document.getElementById("btn-tab-members");
    const panelSched = document.getElementById("panel-schedule");
    const panelClasses = document.getElementById("panel-classes");
    const panelMembers = document.getElementById("panel-members");

    function switchAdminTab(targetTab) {
      if (tabSched) tabSched.classList.toggle("active", targetTab === "schedule");
      if (tabClasses) tabClasses.classList.toggle("active", targetTab === "classes");
      if (tabMembers) tabMembers.classList.toggle("active", targetTab === "members");

      if (panelSched) panelSched.classList.toggle("view-hidden", targetTab !== "schedule");
      if (panelClasses) panelClasses.classList.toggle("view-hidden", targetTab !== "classes");
      if (panelMembers) panelMembers.classList.toggle("view-hidden", targetTab !== "members");
    }

    if (tabSched) tabSched.addEventListener("click", () => switchAdminTab("schedule"));
    if (tabClasses) tabClasses.addEventListener("click", () => switchAdminTab("classes"));
    if (tabMembers) tabMembers.addEventListener("click", () => switchAdminTab("members"));
  }

  /* ==========================================================================
     WEEKLY SCHEDULE EDITOR SYSTEM (Multi-Class & Multi-Group)
     ========================================================================== */

  async function initScheduleEditor() {
    populateModalPresets();
    bindScheduleActionButtons();
    bindDayTabs();
    bindClassAndGroupSelectors();
    bindModalForm();

    // Fetch existing live schedule from Firestore or local cache
    await loadScheduleFromServer();
    renderScheduleDayView();
  }

  function bindClassAndGroupSelectors() {
    const classSel = document.getElementById("admin-select-schedule-class");
    const groupSel = document.getElementById("admin-select-schedule-group");
    const classes = window.AcademicRegistry ? window.AcademicRegistry.getAllClasses() : [];

    function populateClassSelect() {
      if (!classSel) return;
      const prev = classSel.value || currentAdminClass;
      classSel.innerHTML = classes.map((c) => `<option value="${c.id}" ${c.id === prev ? "selected" : ""}>${c.name} (${c.code})</option>`).join("");
      if (!classSel.value && classes.length > 0) classSel.value = classes[0].id;
      currentAdminClass = classSel.value || "2ang-aff";
    }

    function populateGroupSelect() {
      if (!groupSel) return;
      const groups = window.AcademicRegistry ? window.AcademicRegistry.getGroupsForClass(currentAdminClass) : [];
      const prev = groupSel.value || currentAdminGroup;
      groupSel.innerHTML = groups.map((g) => `<option value="${g.id}" ${g.id === prev ? "selected" : ""}>${g.name} (${g.code})</option>`).join("");
      if (!groupSel.value && groups.length > 0) groupSel.value = groups[0].id;
      currentAdminGroup = groupSel.value || "grp1";
    }

    populateClassSelect();
    populateGroupSelect();

    if (classSel && !classSel.dataset.bound) {
      classSel.dataset.bound = "true";
      classSel.addEventListener("change", (e) => {
        currentAdminClass = e.target.value;
        populateGroupSelect();
        workingTimetable = getOrCreateTimetable(currentAdminClass, currentAdminGroup);
        renderScheduleDayView();
      });
    }

    if (groupSel && !groupSel.dataset.bound) {
      groupSel.dataset.bound = "true";
      groupSel.addEventListener("change", (e) => {
        currentAdminGroup = e.target.value;
        workingTimetable = getOrCreateTimetable(currentAdminClass, currentAdminGroup);
        renderScheduleDayView();
      });
    }
  }

  async function loadScheduleFromServer() {
    // 1. Immediately restore local storage cache
    try {
      const localGrp1 = localStorage.getItem("quill_q_server_schedule_grp1") || localStorage.getItem("quill_q_server_schedule");
      if (localGrp1) {
        adminTimetables["2ang-aff_grp1"] = JSON.parse(localGrp1);
        adminTimetables.grp1 = JSON.parse(localGrp1);
      }
      const localGrp2 = localStorage.getItem("quill_q_server_schedule_grp2");
      if (localGrp2) {
        adminTimetables["2ang-aff_grp2"] = JSON.parse(localGrp2);
        adminTimetables.grp2 = JSON.parse(localGrp2);
      }
      workingTimetable = getOrCreateTimetable(currentAdminClass, currentAdminGroup);
      renderScheduleDayView();
    } catch (e) {}

    if (!db) return;

    // 2. Fetch live data from Firestore server
    try {
      const snapshot = await db.collection("schedules").get();
      if (!snapshot.empty) {
        snapshot.forEach((doc) => {
          if (doc.exists) {
            const docId = doc.id;
            const data = doc.data();

            let targetClass = "2ang-aff";
            let targetGroup = "grp1";
            let dayKey = docId;

            // Pattern: {classId}_{groupId}_{dayId}
            const parts = docId.split("_");
            if (parts.length >= 3) {
              targetClass = parts[0];
              targetGroup = parts[1];
              dayKey = parts.slice(2).join("_");
            } else if (docId.startsWith("grp2_")) {
              targetClass = "2ang-aff";
              targetGroup = "grp2";
              dayKey = docId.replace("grp2_", "");
            } else if (docId.startsWith("grp1_")) {
              targetClass = "2ang-aff";
              targetGroup = "grp1";
              dayKey = docId.replace("grp1_", "");
            }

            const tKey = getTimetableKey(targetClass, targetGroup);
            if (!adminTimetables[tKey]) {
              adminTimetables[tKey] = createBlankTimetable();
            }

            adminTimetables[tKey][dayKey] = {
              dayName: data.dayName || dayKey,
              dateLabel: data.dateLabel || "",
              activeClassIndex: data.activeClassIndex ?? -1,
              scheduleVersion: data.scheduleVersion || Date.now(),
              items: data.items || []
            };

            // Mirror to legacy keys for 2ang-aff
            if (targetClass === "2ang-aff") {
              if (targetGroup === "grp2") {
                adminTimetables.grp2[dayKey] = adminTimetables[tKey][dayKey];
              } else {
                adminTimetables.grp1[dayKey] = adminTimetables[tKey][dayKey];
              }
            }
          }
        });

        workingTimetable = getOrCreateTimetable(currentAdminClass, currentAdminGroup);
        renderScheduleDayView();
      }
    } catch (err) {
      console.warn("Could not fetch schedules from Firestore, using local/seed:", err);
    }
  }

  function bindDayTabs() {
    const dayTabsContainer = document.getElementById("schedule-day-tabs");
    if (!dayTabsContainer) return;

    dayTabsContainer.querySelectorAll(".sched-day-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        const day = pill.dataset.day;
        if (!day || day === currentScheduleDay) return;

        dayTabsContainer.querySelectorAll(".sched-day-pill").forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");

        currentScheduleDay = day;
        renderScheduleDayView();
      });
    });

    // Date Label Input Change Listener with Auto-save debounce
    let dateDebounce = null;
    const dateInput = document.getElementById("input-day-date-label");
    if (dateInput) {
      dateInput.addEventListener("input", (e) => {
        if (workingTimetable[currentScheduleDay]) {
          workingTimetable[currentScheduleDay].dateLabel = e.target.value.trim();
          markScheduleChanged();
          clearTimeout(dateDebounce);
          dateDebounce = setTimeout(() => {
            saveScheduleToServer(false);
          }, 600);
        }
      });
    }
  }

  function renderScheduleDayView() {
    const headingEl = document.getElementById("selected-day-heading");
    const dateInput = document.getElementById("input-day-date-label");
    const slotsList = document.getElementById("schedule-slots-list");

    const dayData = workingTimetable[currentScheduleDay] || { dayName: currentScheduleDay, dateLabel: "", items: [] };

    if (headingEl) {
      headingEl.textContent = `${dayData.dayName || currentScheduleDay}'s Schedule`;
    }

    if (dateInput) {
      dateInput.value = dayData.dateLabel || "";
    }

    if (!slotsList) return;

    const items = dayData.items || [];

    if (items.length === 0) {
      slotsList.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; background: #faf6ee; border: 2px dashed #ded6c5; border-radius: 16px;">
          <div style="font-size: 32px; margin-bottom: 8px;">🌴</div>
          <h3 style="font-family: 'Patrick Hand', cursive; font-size: 24px; margin: 0 0 6px; color: #1a1816;">No Classes on ${dayData.dayName || currentScheduleDay}</h3>
          <p style="color: #6d6357; font-size: 14px; margin: 0 0 16px;">There are no classes scheduled for this day yet.</p>
          <button type="button" class="btn-create-account btn-add-first-slot" style="background: #e89838; padding: 8px 18px; font-size: 14px; display: inline-flex; align-items: center; gap: 6px;">
            <i class="fi fi-rr-plus"></i>
            <span>Add First Class Slot</span>
          </button>
        </div>
      `;

      const addBtn = slotsList.querySelector(".btn-add-first-slot");
      if (addBtn) {
        addBtn.addEventListener("click", () => openSlotModal(-1));
      }
      return;
    }

    slotsList.innerHTML = items.map((item, idx) => {
      const subjectName = escapeHtml(item.subject || "Class");
      const profName = escapeHtml(item.prof || "Professor");
      const room = escapeHtml(item.room || "Classroom");
      const time = escapeHtml(item.time || "08:30 AM – 10:00 AM");
      const type = escapeHtml(item.type || "TD");
      const color = item.color || "#f6cf7c";

      return `
        <div class="schedule-slot-item" data-index="${idx}">
          <div class="slot-left">
            <div class="slot-order-tools">
              <button type="button" class="btn-slot-move btn-move-up" data-index="${idx}" ${idx === 0 ? "disabled" : ""} title="Move Up">▲</button>
              <button type="button" class="btn-slot-move btn-move-down" data-index="${idx}" ${idx === items.length - 1 ? "disabled" : ""} title="Move Down">▼</button>
            </div>

            <div class="slot-time-badge">${time}</div>

            <div class="slot-info-block">
              <h4 class="slot-subject-title">
                <span class="slot-subject-dot" style="background: ${color};"></span>
                <span>${subjectName}</span>
              </h4>
              <div class="slot-sub-meta">
                <span class="slot-prof-name"><i class="fi fi-rr-chalkboard-user"></i> ${profName}</span>
                <span class="slot-pill-badge"><i class="fi fi-rr-marker"></i> ${room}</span>
                <span class="slot-pill-badge" style="background: #e8daf8; color: #5c2799;">${type}</span>
              </div>
            </div>
          </div>

          <div class="slot-actions">
            <button type="button" class="btn-slot-edit" data-index="${idx}" title="Edit Class Slot">
              <i class="fi fi-rr-edit"></i> Edit
            </button>
            <button type="button" class="btn-slot-delete" data-index="${idx}" title="Delete Class Slot">
              <i class="fi fi-rr-trash"></i> Delete
            </button>
          </div>
        </div>
      `;
    }).join("");

    // Attach Event Listeners to slot buttons
    slotsList.querySelectorAll(".btn-slot-edit").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.index, 10);
        openSlotModal(index);
      });
    });

    slotsList.querySelectorAll(".btn-slot-delete").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const index = parseInt(btn.dataset.index, 10);
        const slot = items[index];
        const confirmed = await showCustomConfirm(
          `Remove "${slot.subject || 'this class'}" (${slot.time}) from ${dayData.dayName}'s schedule?`,
          "Delete Class Slot",
          '<i class="fi fi-rr-trash"></i>',
          "Delete",
          "Cancel",
          true
        );

        if (confirmed) {
          items.splice(index, 1);
          renderScheduleDayView();
          await saveScheduleToServer(true);
        }
      });
    });

    slotsList.querySelectorAll(".btn-move-up").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.index, 10);
        if (index > 0) {
          const temp = items[index - 1];
          items[index - 1] = items[index];
          items[index] = temp;
          renderScheduleDayView();
          saveScheduleToServer(false);
        }
      });
    });

    slotsList.querySelectorAll(".btn-move-down").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.index, 10);
        if (index < items.length - 1) {
          const temp = items[index + 1];
          items[index + 1] = items[index];
          items[index] = temp;
          renderScheduleDayView();
          saveScheduleToServer(false);
        }
      });
    });
  }

  function markScheduleChanged() {
    hasUnsavedScheduleChanges = true;
    const saveBtn = document.getElementById("btn-save-schedule");
    const saveBtnText = document.getElementById("btn-save-schedule-text");
    if (saveBtn) {
      saveBtn.style.background = "#e89838";
      if (saveBtnText) saveBtnText.textContent = "Save Changes to Server *";
    }
  }

  function markScheduleSaved() {
    hasUnsavedScheduleChanges = false;
    const saveBtn = document.getElementById("btn-save-schedule");
    const saveBtnText = document.getElementById("btn-save-schedule-text");
    if (saveBtn) {
      saveBtn.style.background = "#5bae86";
      if (saveBtnText) saveBtnText.textContent = "Save Changes to Server";
    }
  }

  function bindScheduleActionButtons() {
    const btnAdd = document.getElementById("btn-add-class-slot");
    const btnSave = document.getElementById("btn-save-schedule");
    const btnReset = document.getElementById("btn-reset-default-schedule");

    if (btnAdd) {
      btnAdd.addEventListener("click", () => openSlotModal(-1));
    }

    if (btnSave) {
      btnSave.addEventListener("click", async () => {
        await saveScheduleToServer();
      });
    }

    if (btnReset) {
      btnReset.addEventListener("click", async () => {
        const confirmed = await showCustomConfirm(
          "Reset the working schedule back to the university's official default seed? (Unsaved custom edits will be replaced)",
          "Reset Schedule",
          '<i class="fi fi-rr-refresh"></i>',
          "Reset Seed",
          "Cancel",
          true
        );

        if (confirmed) {
          workingTimetable = (currentAdminClass === "2ang-aff")
            ? JSON.parse(JSON.stringify(currentAdminGroup === "grp2" ? DEFAULT_SEED_SCHEDULE_GRP2 : DEFAULT_SEED_SCHEDULE))
            : createBlankTimetable();
          const tKey = getTimetableKey(currentAdminClass, currentAdminGroup);
          adminTimetables[tKey] = workingTimetable;
          markScheduleChanged();
          renderScheduleDayView();
          showToast(`Schedule reset. Click 'Save Changes' to push to live server.`, "info");
        }
      });
    }
  }

  async function saveScheduleToServer(showFeedback = true) {
    const tKey = getTimetableKey(currentAdminClass, currentAdminGroup);
    // 1. Immediately persist to localStorage
    try {
      localStorage.setItem("quill_q_server_schedule_" + tKey, JSON.stringify(workingTimetable));
      if (currentAdminClass === "2ang-aff") {
        localStorage.setItem("quill_q_server_schedule_" + currentAdminGroup, JSON.stringify(workingTimetable));
        if (currentAdminGroup === "grp1") {
          localStorage.setItem("quill_q_server_schedule", JSON.stringify(workingTimetable));
        }
      }
    } catch (e) {}

    if (!db) {
      if (showFeedback) showToast("Saved locally (offline mode).", "warning");
      return;
    }

    const saveBtn = document.getElementById("btn-save-schedule");
    const saveBtnText = document.getElementById("btn-save-schedule-text");
    if (saveBtn) saveBtn.disabled = true;
    if (saveBtnText) saveBtnText.textContent = "Syncing to Server...";

    try {
      const batch = db.batch();
      const currentVersion = Date.now();

      Object.keys(workingTimetable).forEach((dayKey) => {
        const docName = `${currentAdminClass}_${currentAdminGroup}_${dayKey}`;
        const ref = db.collection("schedules").doc(docName);
        const dayData = workingTimetable[dayKey];
        const payload = {
          dayName: dayData.dayName || dayKey,
          dateLabel: dayData.dateLabel || "",
          activeClassIndex: dayData.activeClassIndex ?? -1,
          scheduleVersion: currentVersion,
          items: dayData.items || []
        };
        batch.set(ref, payload);

        // Backward compatibility for English Business
        if (currentAdminClass === "2ang-aff") {
          const legacyName = currentAdminGroup === "grp2" ? `grp2_${dayKey}` : `grp1_${dayKey}`;
          batch.set(db.collection("schedules").doc(legacyName), payload);
          if (currentAdminGroup === "grp1") {
            batch.set(db.collection("schedules").doc(dayKey), payload);
          }
        }
      });

      await batch.commit();

      markScheduleSaved();
      const cls = window.AcademicRegistry ? window.AcademicRegistry.getClassById(currentAdminClass) : null;
      const groups = window.AcademicRegistry ? window.AcademicRegistry.getGroupsForClass(currentAdminClass) : [];
      const grp = groups.find((g) => g.id === currentAdminGroup);
      const label = `${cls ? cls.shortName || cls.name : currentAdminClass} - ${grp ? grp.name : currentAdminGroup}`;

      if (showFeedback) {
        showToast(`Weekly schedule for ${label} saved and synced!`, "success");
      }
    } catch (err) {
      console.error("Save schedule error:", err);
      if (showFeedback) {
        showToast("Failed to save schedule: " + (err.message || "Permission denied"), "error");
      }
    } finally {
      if (saveBtn) saveBtn.disabled = false;
      if (saveBtnText) saveBtnText.textContent = hasUnsavedScheduleChanges ? "Save Changes to Server *" : "Save Changes to Server";
    }
  }

  /* ==========================================================================
     CLASS SLOT MODAL & PRESETS
     ========================================================================== */

  function populateModalPresets() {
    // Subject presets
    const subContainer = document.getElementById("subject-presets-container");
    if (subContainer) {
      subContainer.innerHTML = UNIVERSITY_SUBJECTS.map((s) => `
        <span class="preset-chip subject-preset-chip" data-name="${escapeHtml(s.name)}" data-color="${s.color}" data-icon="${s.icon}">
          ${escapeHtml(s.name)}
        </span>
      `).join("");

      subContainer.querySelectorAll(".subject-preset-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
          const nameInput = document.getElementById("slot-input-subject");
          const colorInput = document.getElementById("slot-input-color");
          if (nameInput) nameInput.value = chip.dataset.name;
          if (colorInput) {
            colorInput.value = chip.dataset.color;
            updateColorSwatchSelection(chip.dataset.color);
          }
        });
      });
    }

    // Teacher presets
    const teachContainer = document.getElementById("teacher-presets-container");
    if (teachContainer) {
      teachContainer.innerHTML = FACULTY_TEACHERS.map((name) => `
        <span class="preset-chip teacher-preset-chip" data-name="${escapeHtml(name)}">
          ${escapeHtml(name)}
        </span>
      `).join("");

      teachContainer.querySelectorAll(".teacher-preset-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
          const profInput = document.getElementById("slot-input-prof");
          if (profInput) profInput.value = chip.dataset.name;
        });
      });
    }

    // Time presets
    document.querySelectorAll(".time-preset").forEach((chip) => {
      chip.addEventListener("click", () => {
        const timeInput = document.getElementById("slot-input-time");
        if (timeInput) timeInput.value = chip.textContent.trim();
      });
    });

    // Room presets
    document.querySelectorAll(".room-preset").forEach((chip) => {
      chip.addEventListener("click", () => {
        const roomInput = document.getElementById("slot-input-room");
        if (roomInput) roomInput.value = chip.textContent.trim();
      });
    });

    // Color Swatches
    document.querySelectorAll(".color-swatch-btn").forEach((swatch) => {
      swatch.addEventListener("click", () => {
        const color = swatch.dataset.color;
        const colorInput = document.getElementById("slot-input-color");
        if (colorInput) colorInput.value = color;
        updateColorSwatchSelection(color);
      });
    });
  }

  function updateColorSwatchSelection(selectedColor) {
    document.querySelectorAll(".color-swatch-btn").forEach((btn) => {
      if (btn.dataset.color === selectedColor) {
        btn.classList.add("selected");
      } else {
        btn.classList.remove("selected");
      }
    });
  }

  function openSlotModal(slotIndex = -1) {
    const modal = document.getElementById("modal-class-slot");
    const modalTitle = document.getElementById("modal-slot-title");
    const editIndexInput = document.getElementById("slot-edit-index");
    const timeInput = document.getElementById("slot-input-time");
    const subjectInput = document.getElementById("slot-input-subject");
    const profInput = document.getElementById("slot-input-prof");
    const roomInput = document.getElementById("slot-input-room");
    const typeSelect = document.getElementById("slot-select-type");
    const colorInput = document.getElementById("slot-input-color");

    if (!modal) return;

    if (editIndexInput) editIndexInput.value = slotIndex;

    const items = (workingTimetable[currentScheduleDay] && workingTimetable[currentScheduleDay].items) || [];

    if (slotIndex >= 0 && items[slotIndex]) {
      const slot = items[slotIndex];
      if (modalTitle) modalTitle.textContent = `Edit Class Slot: ${slot.subject || ""}`;
      if (timeInput) timeInput.value = slot.time || "";
      if (subjectInput) subjectInput.value = slot.subject || "";
      if (profInput) profInput.value = slot.prof || "";
      if (roomInput) roomInput.value = slot.room || "";
      if (typeSelect) typeSelect.value = slot.type || "TD";
      if (colorInput) {
        colorInput.value = slot.color || "#f6cf7c";
        updateColorSwatchSelection(slot.color || "#f6cf7c");
      }
    } else {
      if (modalTitle) modalTitle.textContent = `Add Class Slot to ${workingTimetable[currentScheduleDay]?.dayName || currentScheduleDay}`;
      if (timeInput) timeInput.value = "08:30 AM – 10:00 AM";
      if (subjectInput) subjectInput.value = "";
      if (profInput) profInput.value = "";
      if (roomInput) roomInput.value = "Salle-14";
      if (typeSelect) typeSelect.value = "TD";
      if (colorInput) {
        colorInput.value = "#f6cf7c";
        updateColorSwatchSelection("#f6cf7c");
      }
    }

    modal.classList.remove("view-hidden");
    if (subjectInput) subjectInput.focus();
  }

  function closeSlotModal() {
    const modal = document.getElementById("modal-class-slot");
    if (modal) modal.classList.add("view-hidden");
  }

  function bindModalForm() {
    const modal = document.getElementById("modal-class-slot");
    const btnClose = document.getElementById("btn-close-slot-modal");
    const btnCancel = document.getElementById("btn-cancel-slot");
    const form = document.getElementById("form-class-slot");

    if (btnClose) btnClose.addEventListener("click", closeSlotModal);
    if (btnCancel) btnCancel.addEventListener("click", closeSlotModal);

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeSlotModal();
      });
    }

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const editIndex = parseInt(document.getElementById("slot-edit-index").value, 10);
        const time = document.getElementById("slot-input-time").value.trim();
        const subject = document.getElementById("slot-input-subject").value.trim();
        const prof = document.getElementById("slot-input-prof").value.trim();
        const room = document.getElementById("slot-input-room").value.trim();
        const type = document.getElementById("slot-select-type").value;
        const color = document.getElementById("slot-input-color").value || "#f6cf7c";

        if (!time || !subject || !prof || !room) {
          showToast("Please fill in all class details.", "warning");
          return;
        }

        // Match subject icon if available
        const matchedSub = UNIVERSITY_SUBJECTS.find((s) => s.name.toLowerCase() === subject.toLowerCase());
        const icon = matchedSub ? matchedSub.icon : "writing";

        const newSlot = { time, subject, prof, room, type, color, icon };

        if (!workingTimetable[currentScheduleDay]) {
          workingTimetable[currentScheduleDay] = {
            dayName: currentScheduleDay,
            dateLabel: "",
            items: []
          };
        }

        const items = workingTimetable[currentScheduleDay].items;

        if (editIndex >= 0 && editIndex < items.length) {
          items[editIndex] = newSlot;
        } else {
          items.push(newSlot);
        }

        closeSlotModal();
        renderScheduleDayView();
        // Immediately persist to localStorage and sync live to Firestore
        await saveScheduleToServer(true);
      });
    }
  }

  /* ==========================================================================
     CLASSES & GROUPS MANAGEMENT SYSTEM
     ========================================================================== */

  function initClassesManager() {
    const grid = document.getElementById("admin-classes-grid");
    const badgeTotal = document.getElementById("badge-total-classes");
    const btnCreateModal = document.getElementById("btn-create-class-modal-trigger");
    const modalCreate = document.getElementById("modal-class-create");
    const formCreate = document.getElementById("form-create-class");
    const btnCancelCreate = document.getElementById("btn-cancel-create-class");
    const btnCloseCreate = document.getElementById("btn-close-class-modal");

    const modalAddGroup = document.getElementById("modal-add-group");
    const formAddGroup = document.getElementById("form-add-group");
    const btnCancelAddGroup = document.getElementById("btn-cancel-add-group");
    const btnCloseAddGroup = document.getElementById("btn-close-group-modal");

    function renderClassesGrid() {
      const classes = window.AcademicRegistry ? window.AcademicRegistry.getAllClasses() : [];
      if (badgeTotal) badgeTotal.textContent = classes.length;

      if (!grid) return;
      if (classes.length === 0) {
        grid.innerHTML = `<p style="text-align:center; color:#72685d; grid-column: 1/-1;">No classes configured. Click '+ Create New Class' above.</p>`;
        return;
      }

      grid.innerHTML = classes.map((c) => {
        const groups = c.groups || [];
        return `
          <div class="admin-class-card" style="background: #ffffff; border: 2.5px solid #1a1816; border-radius: 18px; padding: 20px; box-shadow: 3px 4px 0px #1a1816; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 8px;">
                <div>
                  <h3 style="margin: 0; font-family: 'Patrick Hand', cursive; font-size: 22px; color: #1a1816;">${escapeHtml(c.name)}</h3>
                  <div style="display: flex; gap: 6px; align-items: center; margin-top: 4px;">
                    <span style="font-size: 11px; font-weight: 800; background: #e89838; color: #1a1816; border: 1.5px solid #1a1816; border-radius: 8px; padding: 2px 7px;">${escapeHtml(c.code)}</span>
                    <span style="font-size: 11.5px; font-weight: 600; color: #72685d;">${escapeHtml(c.year || '2nd Year')}</span>
                  </div>
                </div>
                <button type="button" class="btn-slot-move btn-edit-class" data-id="${c.id}" title="Edit Class Details" style="width: 32px; height: 32px;">
                  <i class="fi fi-rr-edit"></i>
                </button>
              </div>

              <p style="font-size: 13.5px; color: #63594e; margin: 8px 0 16px; line-height: 1.4;">${escapeHtml(c.description || 'No description provided.')}</p>

              <!-- Groups inside this class -->
              <div style="border-top: 2px dashed #ded6c5; padding-top: 12px; margin-bottom: 14px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                  <strong style="font-size: 13px; color: #1a1816; text-transform: uppercase; letter-spacing: 0.5px;">Groups (${groups.length}):</strong>
                  <button type="button" class="btn-create-account btn-add-group-to-class" data-id="${c.id}" style="background: #fdfaf3; color: #1a1816; padding: 3px 8px; font-size: 11.5px; box-shadow: 1px 2px 0px #1a1816;">
                    + Add Group
                  </button>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                  ${groups.map((g) => `
                    <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; background: #fdfaf3; border: 1.5px solid #1a1816; border-radius: 10px; padding: 4px 10px; box-shadow: 1.5px 1.5px 0px #1a1816;">
                      <span>${escapeHtml(g.name)}</span>
                      <span style="font-size: 10px; color: #72685d; font-weight: 600;">(${escapeHtml(g.code || g.id)})</span>
                    </span>
                  `).join("")}
                </div>
              </div>

              <!-- Subjects inside this class -->
              <div style="border-top: 2px dashed #ded6c5; padding-top: 12px; margin-bottom: 14px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                  <strong style="font-size: 13px; color: #1a1816; text-transform: uppercase; letter-spacing: 0.5px;">Subjects (${(c.subjects || []).length}):</strong>
                  <button type="button" class="btn-create-account btn-manage-subjects" data-id="${c.id}" style="background: #fef08a; color: #1a1816; padding: 3px 8px; font-size: 11.5px; box-shadow: 1px 2px 0px #1a1816;">
                    ⚙️ Manage Subjects
                  </button>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                  ${(!c.subjects || c.subjects.length === 0) 
                    ? `<span style="font-size: 12px; color: #8c7e71; font-style: italic;">No subjects added yet.</span>` 
                    : c.subjects.map((s) => `
                    <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 700; background: #fffdf8; border: 1.5px solid #1a1816; border-radius: 8px; padding: 3px 8px; box-shadow: 1px 1px 0px #1a1816;">
                      <span>${escapeHtml(s.name)}</span>
                    </span>
                  `).join("")}
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 8px; margin-top: 10px; border-top: 1.5px solid #eee; padding-top: 12px;">
              <button type="button" class="btn-create-account btn-goto-class-schedule" data-id="${c.id}" style="background: #5bae86; flex: 1; padding: 7px 12px; font-size: 13px;">
                <i class="fi fi-rr-calendar"></i>
                <span>Edit Schedule</span>
              </button>
              ${classes.length > 1 ? `
                <button type="button" class="btn-slot-delete btn-delete-class" data-id="${c.id}" data-name="${escapeHtml(c.name)}" title="Delete Class" style="padding: 7px 12px;">
                  <i class="fi fi-rr-trash"></i>
                </button>
              ` : ""}
            </div>
          </div>
        `;
      }).join("");

      // Bind buttons
      grid.querySelectorAll(".btn-edit-class").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          const cls = window.AcademicRegistry.getClassById(id);
          if (!cls) return;
          document.getElementById("class-edit-id").value = cls.id;
          document.getElementById("input-class-name").value = cls.name;
          document.getElementById("input-class-code").value = cls.code;
          document.getElementById("input-class-year").value = cls.year || "2nd Year";
          document.getElementById("input-class-desc").value = cls.description || "";
          document.getElementById("modal-class-title").textContent = "Edit Academic Class";
          modalCreate.classList.remove("view-hidden");
        });
      });

      grid.querySelectorAll(".btn-add-group-to-class").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          const cls = window.AcademicRegistry.getClassById(id);
          if (!cls) return;
          document.getElementById("group-target-class-id").value = id;
          const nextIndex = (cls.groups || []).length + 1;
          document.getElementById("input-group-name").value = `Group ${nextIndex}`;
          document.getElementById("input-group-code").value = `${cls.code} ${nextIndex}`;
          modalAddGroup.classList.remove("view-hidden");
        });
      });

      grid.querySelectorAll(".btn-goto-class-schedule").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          const tabSched = document.getElementById("btn-tab-schedule");
          if (tabSched) tabSched.click();
          const classSel = document.getElementById("admin-select-schedule-class");
          if (classSel) {
            classSel.value = id;
            classSel.dispatchEvent(new Event("change"));
          }
        });
      });

      grid.querySelectorAll(".btn-manage-subjects").forEach((btn) => {
        btn.addEventListener("click", () => {
          openManageSubjectsModal(btn.dataset.id);
        });
      });

      grid.querySelectorAll(".btn-delete-class").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          const name = btn.dataset.name;
          const confirmed = await showCustomConfirm(
            `Are you sure you want to remove the class "${name}"? Existing students may need to be reassigned.`,
            "Delete Class",
            '<i class="fi fi-rr-trash"></i>',
            "Delete Class",
            "Cancel",
            true
          );
          if (confirmed) {
            const currentClasses = window.AcademicRegistry.getAllClasses().filter((c) => c.id !== id);
            await window.AcademicRegistry.saveAcademicStructureToServer(db, currentClasses);
            showToast(`Class "${name}" removed.`, "info");
            renderClassesGrid();
            bindClassAndGroupSelectors();
          }
        });
      });
    }

    // Modal: Manage Class Subjects
    const modalSubjects = document.getElementById("modal-manage-subjects");
    const subjectsListEl = document.getElementById("modal-class-subjects-list");
    const subjectsCountEl = document.getElementById("modal-subjects-count");
    const subjectsTitleEl = document.getElementById("modal-subjects-class-title");
    const btnCloseSubjects = document.getElementById("btn-close-manage-subjects-modal");
    const btnDoneSubjects = document.getElementById("btn-done-manage-subjects");
    const btnShowAddSubject = document.getElementById("btn-show-add-subject-form");
    const formSubject = document.getElementById("form-class-subject");
    const btnCancelSubjectForm = document.getElementById("btn-cancel-subject-form");

    let currentManagingClassId = null;

    function renderModalSubjectsList() {
      if (!currentManagingClassId || !subjectsListEl) return;
      const subjects = window.AcademicRegistry ? window.AcademicRegistry.getSubjectsForClass(currentManagingClassId) : [];
      if (subjectsCountEl) subjectsCountEl.textContent = subjects.length;

      if (subjects.length === 0) {
        subjectsListEl.innerHTML = `
          <div style="padding: 20px; text-align: center; color: #72685d; font-size: 13.5px; background: #fffdf8; border: 1.5px dashed #ded6c5; border-radius: 10px;">
            No subjects added to this class yet. Click "+ Add New Subject" to create one.
          </div>
        `;
        return;
      }

      subjectsListEl.innerHTML = subjects.map((s) => {
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; background: #ffffff; border: 1.5px solid #1a1816; border-radius: 10px; padding: 8px 12px; box-shadow: 1.5px 1.5px 0px #1a1816;">
            <div>
              <div style="font-size: 14px; font-weight: 800; color: #1a1816; display: flex; align-items: center; gap: 6px;">
                <span>${escapeHtml(s.name)}</span>
                ${s.code ? `<span style="font-size: 10.5px; font-weight: 700; background: #e0f2fe; color: #0369a1; border: 1px solid #1a1816; border-radius: 5px; padding: 1px 5px;">${escapeHtml(s.code)}</span>` : ""}
              </div>
              <div style="font-size: 12px; color: #72685d; margin-top: 2px;">
                ${s.prof ? `<span>Prof: ${escapeHtml(s.prof)}</span> • ` : ""}${s.room ? `<span>Room: ${escapeHtml(s.room)}</span>` : ""}
              </div>
            </div>
            <div style="display: flex; gap: 6px;">
              <button type="button" class="btn-slot-move btn-edit-subject" data-id="${s.id}" title="Edit Subject" style="width: 28px; height: 28px; font-size: 12px;">
                <i class="fi fi-rr-edit"></i>
              </button>
              <button type="button" class="btn-slot-delete btn-delete-subject" data-id="${s.id}" data-name="${escapeHtml(s.name)}" title="Delete Subject" style="width: 28px; height: 28px; font-size: 12px;">
                <i class="fi fi-rr-trash"></i>
              </button>
            </div>
          </div>
        `;
      }).join("");

      // Bind edit subject
      subjectsListEl.querySelectorAll(".btn-edit-subject").forEach((btn) => {
        btn.addEventListener("click", () => {
          const sId = btn.dataset.id;
          const subjects = window.AcademicRegistry ? window.AcademicRegistry.getSubjectsForClass(currentManagingClassId) : [];
          const subj = subjects.find((s) => s.id === sId);
          if (!subj) return;

          document.getElementById("subject-target-class-id").value = currentManagingClassId;
          document.getElementById("subject-edit-id").value = subj.id;
          document.getElementById("input-subject-name").value = subj.name || "";
          document.getElementById("input-subject-code").value = subj.code || "";
          document.getElementById("input-subject-room").value = subj.room || "";
          document.getElementById("select-subject-icon").value = subj.icon || "writing";
          document.getElementById("select-subject-color").value = subj.bgClass || "card-peach";
          document.getElementById("form-subject-title").textContent = "Edit Subject: " + subj.name;
          formSubject.style.display = "block";
        });
      });

      // Bind delete subject
      subjectsListEl.querySelectorAll(".btn-delete-subject").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const sId = btn.dataset.id;
          const sName = btn.dataset.name;
          const confirmed = await showCustomConfirm(
            `Remove subject "${sName}" from this class?`,
            "Delete Subject",
            '<i class="fi fi-rr-trash"></i>',
            "Delete",
            "Cancel",
            true
          );
          if (confirmed) {
            try {
              if (window.AcademicRegistry) {
                await window.AcademicRegistry.deleteSubjectFromClass(db, currentManagingClassId, sId);
              }
              showToast(`Subject "${sName}" removed!`, "info");
              renderModalSubjectsList();
              renderClassesGrid();
            } catch (err) {
              showToast("Could not delete subject: " + err.message, "error");
            }
          }
        });
      });
    }

    function openManageSubjectsModal(classId) {
      currentManagingClassId = classId;
      const cls = window.AcademicRegistry ? window.AcademicRegistry.getClassById(classId) : null;
      if (subjectsTitleEl) subjectsTitleEl.textContent = `Manage Subjects: ${cls ? cls.name : classId}`;
      if (formSubject) formSubject.style.display = "none";
      renderModalSubjectsList();
      if (modalSubjects) modalSubjects.classList.remove("view-hidden");
    }

    if (btnCloseSubjects) btnCloseSubjects.addEventListener("click", () => modalSubjects.classList.add("view-hidden"));
    if (btnDoneSubjects) btnDoneSubjects.addEventListener("click", () => modalSubjects.classList.add("view-hidden"));

    if (btnShowAddSubject) {
      btnShowAddSubject.addEventListener("click", () => {
        document.getElementById("subject-target-class-id").value = currentManagingClassId;
        document.getElementById("subject-edit-id").value = "";
        document.getElementById("input-subject-name").value = "";
        document.getElementById("input-subject-code").value = "";
        document.getElementById("input-subject-room").value = "";
        document.getElementById("select-subject-icon").value = "language";
        document.getElementById("select-subject-color").value = "card-peach";
        document.getElementById("form-subject-title").textContent = "Add New Subject";
        formSubject.style.display = "block";
      });
    }

    if (btnCancelSubjectForm) {
      btnCancelSubjectForm.addEventListener("click", () => {
        if (formSubject) formSubject.style.display = "none";
      });
    }

    if (formSubject) {
      formSubject.addEventListener("submit", async (e) => {
        e.preventDefault();
        const classId = document.getElementById("subject-target-class-id").value;
        const editId = document.getElementById("subject-edit-id").value;
        const name = document.getElementById("input-subject-name").value.trim();
        const code = document.getElementById("input-subject-code").value.trim();
        const room = document.getElementById("input-subject-room").value.trim();
        const icon = document.getElementById("select-subject-icon").value;
        const bgClass = document.getElementById("select-subject-color").value;

        if (!name) {
          showToast("Subject Name is required", "error");
          return;
        }

        const colorMap = {
          "card-peach": "#e0835f",
          "card-yellow": "#f6cf7c",
          "card-green": "#5bae86",
          "card-blue": "#5b8fc9",
          "card-purple": "#ba90e8"
        };

        const subjectPayload = {
          name,
          code,
          room,
          icon,
          bgClass,
          color: colorMap[bgClass] || "#5bae86"
        };

        try {
          if (editId) {
            await window.AcademicRegistry.updateSubjectInClass(db, classId, editId, subjectPayload);
            showToast(`Subject "${name}" updated!`, "success");
          } else {
            await window.AcademicRegistry.addSubjectToClass(db, classId, subjectPayload);
            showToast(`Subject "${name}" added to class!`, "success");
          }
          formSubject.style.display = "none";
          renderModalSubjectsList();
          renderClassesGrid();
        } catch (err) {
          showToast("Failed to save subject: " + err.message, "error");
        }
      });
    }

    if (btnCreateModal) {
      btnCreateModal.addEventListener("click", () => {
        document.getElementById("class-edit-id").value = "";
        document.getElementById("input-class-name").value = "";
        document.getElementById("input-class-code").value = "";
        document.getElementById("input-class-year").value = "2nd Year";
        document.getElementById("input-class-desc").value = "";
        document.getElementById("modal-class-title").textContent = "Create New Academic Class";
        modalCreate.classList.remove("view-hidden");
      });
    }

    if (btnCancelCreate) btnCancelCreate.addEventListener("click", () => modalCreate.classList.add("view-hidden"));
    if (btnCloseCreate) btnCloseCreate.addEventListener("click", () => modalCreate.classList.add("view-hidden"));

    if (formCreate) {
      formCreate.addEventListener("submit", async (e) => {
        e.preventDefault();
        const editId = document.getElementById("class-edit-id").value.trim();
        const name = document.getElementById("input-class-name").value.trim();
        const code = document.getElementById("input-class-code").value.trim().toUpperCase();
        const year = document.getElementById("input-class-year").value.trim() || "2nd Year";
        const desc = document.getElementById("input-class-desc").value.trim();

        if (!name || !code) {
          showToast("Please provide Class Name and Code", "error");
          return;
        }

        const classes = [...window.AcademicRegistry.getAllClasses()];
        if (editId) {
          const idx = classes.findIndex((c) => c.id === editId);
          if (idx !== -1) {
            classes[idx].name = name;
            classes[idx].code = code;
            classes[idx].year = year;
            classes[idx].description = desc;
          }
        } else {
          const slugId = code.toLowerCase().replace(/[^a-z0-9]/g, "-") || `class-${Date.now()}`;
          const newClass = {
            id: slugId,
            name: name,
            code: code,
            shortName: name.split("(")[0].trim(),
            year: year,
            description: desc,
            groups: [
              { id: "grp1", name: "Group 1", code: `${code} 1` },
              { id: "grp2", name: "Group 2", code: `${code} 2` }
            ]
          };
          classes.push(newClass);
        }

        try {
          await window.AcademicRegistry.saveAcademicStructureToServer(db, classes);
          modalCreate.classList.add("view-hidden");
          showToast(editId ? "Class details updated!" : `Class "${name}" created with 2 default groups!`, "success");
          renderClassesGrid();
          bindClassAndGroupSelectors();
        } catch (err) {
          showToast("Failed to save class: " + err.message, "error");
        }
      });
    }

    if (btnCancelAddGroup) btnCancelAddGroup.addEventListener("click", () => modalAddGroup.classList.add("view-hidden"));
    if (btnCloseAddGroup) btnCloseAddGroup.addEventListener("click", () => modalAddGroup.classList.add("view-hidden"));

    if (formAddGroup) {
      formAddGroup.addEventListener("submit", async (e) => {
        e.preventDefault();
        const classId = document.getElementById("group-target-class-id").value.trim();
        const gName = document.getElementById("input-group-name").value.trim();
        const gCode = document.getElementById("input-group-code").value.trim();

        if (!classId || !gName) return;

        const classes = [...window.AcademicRegistry.getAllClasses()];
        const cls = classes.find((c) => c.id === classId);
        if (!cls) return;

        cls.groups = cls.groups || [];
        const nextId = "grp" + (cls.groups.length + 1);
        cls.groups.push({ id: nextId, name: gName, code: gCode });

        try {
          await window.AcademicRegistry.saveAcademicStructureToServer(db, classes);
          modalAddGroup.classList.add("view-hidden");
          showToast(`Added ${gName} to ${cls.name}!`, "success");
          renderClassesGrid();
          bindClassAndGroupSelectors();
        } catch (err) {
          showToast("Failed to add group: " + err.message, "error");
        }
      });
    }

    renderClassesGrid();
    if (window.AcademicRegistry && typeof window.AcademicRegistry.onAcademicStructureChange === "function") {
      window.AcademicRegistry.onAcademicStructureChange(() => {
        renderClassesGrid();
      });
    }
  }

  /* ==========================================================================
     MEMBER APPROVALS & ROLES SYSTEM
     ========================================================================== */

  function initMemberManagement() {
    const tabPending = document.getElementById("tab-members-pending");
    const tabApproved = document.getElementById("tab-members-approved");
    const btnRefresh = document.getElementById("btn-refresh-members");
    const searchInput = document.getElementById("input-search-members");

    if (tabPending && tabApproved) {
      tabPending.addEventListener("click", () => {
        currentMemberTab = "pending";
        tabPending.style.background = "#e89838";
        tabApproved.style.background = "#f4efe4";
        renderMembersList();
      });

      tabApproved.addEventListener("click", () => {
        currentMemberTab = "approved";
        tabApproved.style.background = "#e89838";
        tabPending.style.background = "#f4efe4";
        renderMembersList();
      });
    }

    if (btnRefresh) {
      btnRefresh.addEventListener("click", () => {
        fetchMembers();
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        renderMembersList();
      });
    }

    fetchMembers();
  }

  let isFirstMembersSnapshot = true;

  function fetchMembers() {
    if (!db) return;

    const listEl = document.getElementById("admin-members-list");
    if (listEl) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 30px; color: #72685d;">
          <div style="font-size: 26px; margin-bottom: 6px;"><i class="fi fi-rr-spinner" style="display:inline-block; animation: spin 1s infinite linear;"></i></div>
          <div>Loading member registrations from server...</div>
        </div>
      `;
    }

    if (membersListener) {
      try { membersListener(); } catch (e) {}
    }

    isFirstMembersSnapshot = true;

    try {
      membersListener = db.collection("users").onSnapshot((snapshot) => {
        if (!isFirstMembersSnapshot && snapshot.docChanges) {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const uData = change.doc.data();
              if (uData && uData.status === "pending" && !isSuperAdminUser(uData)) {
                playAdminNotificationChime();
                const roleLabel = uData.role === "teacher" ? "Teacher" : "Student";
                const uName = uData.displayName || "New user";
                showToast(`🎓 New ${roleLabel} Registration: ${uName}`, "info");
                sendAdminSystemNotification(`🎓 New ${roleLabel} Registration Request`, `${uName} has registered and is waiting for your approval.`);
              }
            }
          });
        }
        isFirstMembersSnapshot = false;

        const users = [];
        snapshot.forEach((doc) => {
          users.push({ id: doc.id, ...doc.data() });
        });
        cachedMembers = users;
        updateMemberCounts();
        renderMembersList();
      }, (err) => {
        console.warn("Members snapshot error:", err);
        if (listEl) {
          listEl.innerHTML = `<div style="text-align:center; padding:20px; color:#dc2626;">Error loading members: ${err.message}</div>`;
        }
      });
    } catch (e) {
      console.error("Members listener init error:", e);
    }
  }

  function updateMemberCounts() {
    const countPendingEl = document.getElementById("members-pending-count");
    const countApprovedEl = document.getElementById("members-approved-count");
    const badgeTotalPending = document.getElementById("badge-total-pending");
    const pendingDot = document.getElementById("admin-pending-dot");

    const pending = cachedMembers.filter((u) => u.status === "pending" && !isSuperAdminUser(u));
    const approved = cachedMembers.filter((u) => u.status === "approved" || isSuperAdminUser(u));

    if (countPendingEl) countPendingEl.textContent = pending.length;
    if (countApprovedEl) countApprovedEl.textContent = approved.length;
    if (badgeTotalPending) badgeTotalPending.textContent = pending.length;

    if (pendingDot) {
      if (pending.length > 0) {
        pendingDot.classList.remove("view-hidden");
      } else {
        pendingDot.classList.add("view-hidden");
      }
    }
  }

  function renderMembersList() {
    const listEl = document.getElementById("admin-members-list");
    const searchInput = document.getElementById("input-search-members");
    if (!listEl) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

    let users = cachedMembers.filter((u) => {
      const isPending = u.status === "pending" && !isSuperAdminUser(u);
      return currentMemberTab === "pending" ? isPending : !isPending;
    });

    if (query) {
      users = users.filter((u) => {
        const name = (u.displayName || u.firstName || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        const role = (u.role || "").toLowerCase();
        return name.includes(query) || email.includes(query) || role.includes(query);
      });
    }

    if (users.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; background: #faf6ee; border-radius: 16px; border: 2px dashed #ded6c5;">
          <div style="font-size: 32px; margin-bottom: 6px;">✨</div>
          <strong style="color: #1a1816; font-size: 16px;">No ${currentMemberTab} members found</strong>
          <p style="color: #72685d; font-size: 14px; margin: 4px 0 0;">All requests have been handled or no records match your filter.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = users.map((user) => {
      const isTeacher = user.role === "teacher";
      const isAdmin = isSuperAdminUser(user);
      const roleBadge = isAdmin ? "Admin" : (isTeacher ? "Teacher" : "Student");
      const name = user.displayName || user.firstName || "Member";
      const status = user.status || "pending";
      const avatar = user.photoURL || "assets/avatar.jpg";

      let academicDetail = user.academicDetail || (isTeacher ? "Teaching Faculty" : "English Business Grp 1");
      let classGroupBadges = "";

      if (isTeacher) {
        const teaching = user.teachingClasses || [];
        if (teaching.length > 0) {
          const names = teaching.map((id) => {
            const c = window.AcademicRegistry ? window.AcademicRegistry.getClassById(id) : null;
            return c ? c.code : id;
          });
          classGroupBadges = `<span style="font-size: 11.5px; font-weight: 700; color: #1e3a8a; background: #dbeafe; padding: 2px 7px; border-radius: 6px; border: 1px solid #bfdbfe;">Teaches: ${names.join(", ")}</span>`;
        } else {
          classGroupBadges = `<span style="font-size: 11.5px; font-weight: 700; color: #1e3a8a; background: #dbeafe; padding: 2px 7px; border-radius: 6px; border: 1px solid #bfdbfe;">Teaches: All Classes</span>`;
        }
      } else {
        const norm = window.AcademicRegistry ? window.AcademicRegistry.normalizeProfileAcademic(user) : null;
        if (norm) {
          academicDetail = norm.academicDetail;
          classGroupBadges = `<span style="font-size: 11.5px; font-weight: 700; color: #065f46; background: #d1fae5; padding: 2px 7px; border-radius: 6px; border: 1px solid #a7f3d0;">${escapeHtml(norm.className)} - ${escapeHtml(norm.groupName)}</span>`;
        }
      }

      return `
        <div class="schedule-slot-item" data-id="${user.id}" style="align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 14px; flex: 1 1 300px;">
            <img src="${avatar}" style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid #1a1816; object-fit: cover;" alt="${escapeHtml(name)}" onerror="this.onerror=null;this.src='assets/avatar.jpg';" />
            <div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 3px;">
                <strong style="font-size: 1.1rem; color: #1a1816;">${escapeHtml(name)}</strong>
                <span style="font-size: 11px; padding: 2px 7px; border-radius: 6px; border: 1px solid #1a1816; font-weight: 700; background: ${isAdmin ? '#e89838' : (isTeacher ? '#a9c6ec' : '#d1fae5')};">
                  ${roleBadge}
                </span>
                <span style="font-size: 11px; padding: 2px 7px; border-radius: 6px; font-weight: 600; background: ${status === 'approved' ? '#dcfce7' : '#fef3c7'}; color: ${status === 'approved' ? '#15803d' : '#b45309'};">
                  ● ${status === 'approved' ? 'Approved' : 'Pending'}
                </span>
                ${classGroupBadges}
              </div>
              <div style="font-size: 0.9rem; color: #5a5148;">
                <span>${escapeHtml(user.email || 'No email')}</span> • <span>${escapeHtml(academicDetail)}</span>
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            ${status === 'pending' ? `
              <button type="button" class="btn-create-account btn-approve-user" data-id="${user.id}" data-name="${escapeHtml(name)}" style="background: #5bae86; padding: 6px 14px; font-size: 13.5px;">
                Approve ✓
              </button>
              <button type="button" class="btn-create-account btn-decline-user" data-id="${user.id}" data-name="${escapeHtml(name)}" style="background: #ffc9c9; color: #991b1b; padding: 6px 14px; font-size: 13.5px;">
                Decline ✕
              </button>
            ` : ""}

            ${isTeacher ? `
              <button type="button" class="btn-create-account btn-assign-classes" data-id="${user.id}" data-name="${escapeHtml(name)}" style="background: #fdfaf3; color: #1a1816; padding: 6px 12px; font-size: 13px; box-shadow: 1.5px 2px 0px #1a1816;">
                Assign Classes
              </button>
            ` : ""}

            ${(!isAdmin && !isTeacher) ? `
              <button type="button" class="btn-create-account btn-reassign-student" data-id="${user.id}" data-name="${escapeHtml(name)}" data-class="${user.classId || '2ang-aff'}" data-group="${user.group || 'grp1'}" style="background: #fdfaf3; color: #1a1816; padding: 6px 12px; font-size: 13px; box-shadow: 1.5px 2px 0px #1a1816;">
                Reassign Class
              </button>
            ` : ""}

            ${!isAdmin && status === 'approved' ? `
              <button type="button" class="btn-slot-edit btn-toggle-role" data-id="${user.id}" data-role="${user.role || 'student'}" data-name="${escapeHtml(name)}" title="Change Role">
                ${isTeacher ? "Switch to Student" : "Switch to Teacher"}
              </button>
              <button type="button" class="btn-slot-delete btn-revoke-user" data-id="${user.id}" data-name="${escapeHtml(name)}" title="Revoke Approval">
                Revoke
              </button>
            ` : ""}

            ${isAdmin ? `
              <span style="font-size: 13px; font-weight: 700; color: #b45309; padding: 4px 10px; background: #fef3c7; border-radius: 8px; border: 1px solid #d97706;">
                Super Admin 👑
              </span>
            ` : ""}
          </div>
        </div>
      `;
    }).join("");

    // Attach Event Handlers
    listEl.querySelectorAll(".btn-approve-user").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const uid = btn.dataset.id;
        const name = btn.dataset.name;
        const confirmed = await showCustomConfirm(
          `Approve registration for ${name}? They will immediately receive access to Quill-Q lectures, timetables, and homework.`,
          "Approve Member",
          '<i class="fi fi-rr-check"></i>',
          "Approve",
          "Cancel"
        );

        if (confirmed) {
          try {
            await db.collection("users").doc(uid).update({
              status: "approved",
              approvedAt: new Date().toISOString()
            });
            showToast(`${name} has been approved!`, "success");
          } catch (e) {
            showToast("Approval failed: " + e.message, "error");
          }
        }
      });
    });

    listEl.querySelectorAll(".btn-decline-user").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const uid = btn.dataset.id;
        const name = btn.dataset.name;
        const confirmed = await showCustomConfirm(
          `Decline registration for ${name}?`,
          "Decline Member",
          '<i class="fi fi-rr-cross"></i>',
          "Decline",
          "Cancel",
          true
        );

        if (confirmed) {
          try {
            await db.collection("users").doc(uid).delete();
            showToast(`${name} registration declined and removed.`, "info");
          } catch (e) {
            showToast("Action failed: " + e.message, "error");
          }
        }
      });
    });

    listEl.querySelectorAll(".btn-toggle-role").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const uid = btn.dataset.id;
        const currentRole = btn.dataset.role;
        const name = btn.dataset.name;
        const newRole = currentRole === "teacher" ? "student" : "teacher";

        const confirmed = await showCustomConfirm(
          `Change ${name}'s role from ${currentRole.toUpperCase()} to ${newRole.toUpperCase()}?`,
          "Change Role",
          '<i class="fi fi-rr-exchange"></i>',
          "Change Role",
          "Cancel"
        );

        if (confirmed) {
          try {
            await db.collection("users").doc(uid).update({
              role: newRole
            });
            showToast(`${name} is now a ${newRole}.`, "success");
          } catch (e) {
            showToast("Role update failed: " + e.message, "error");
          }
        }
      });
    });

    listEl.querySelectorAll(".btn-revoke-user").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const uid = btn.dataset.id;
        const name = btn.dataset.name;
        const confirmed = await showCustomConfirm(
          `Revoke access for ${name}? Their account will return to pending approval status.`,
          "Revoke Access",
          '<i class="fi fi-rr-exclamation"></i>',
          "Revoke",
          "Cancel",
          true
        );

        if (confirmed) {
          try {
            await db.collection("users").doc(uid).update({
              status: "pending"
            });
            showToast(`Access revoked for ${name}.`, "warning");
          } catch (e) {
            showToast("Revoke failed: " + e.message, "error");
          }
        }
      });
    });

    // TEACHER CLASSES ASSIGNMENT MODAL BINDINGS
    const modalTeacherClasses = document.getElementById("modal-teacher-classes");
    const formTeacherClasses = document.getElementById("form-teacher-classes");
    const containerTeacherCheckboxes = document.getElementById("teacher-classes-checkboxes-container");
    const btnCancelTeacherClasses = document.getElementById("btn-cancel-teacher-classes");
    const btnCloseTeacherClasses = document.getElementById("btn-close-teacher-classes-modal");

    listEl.querySelectorAll(".btn-assign-classes").forEach((btn) => {
      btn.addEventListener("click", () => {
        const uid = btn.dataset.id;
        const name = btn.dataset.name;
        const user = cachedMembers.find((u) => u.id === uid);
        if (!user || !modalTeacherClasses) return;

        document.getElementById("target-teacher-id").value = uid;
        const subtitle = document.getElementById("teacher-modal-subtitle");
        if (subtitle) subtitle.textContent = `Select which classes ${name} teaches:`;

        const userTeaching = user.teachingClasses || [];
        const classes = window.AcademicRegistry ? window.AcademicRegistry.getAllClasses() : [];

        if (containerTeacherCheckboxes) {
          containerTeacherCheckboxes.innerHTML = classes.map((c) => {
            const isChecked = userTeaching.includes(c.id) || userTeaching.length === 0;
            return `
              <label style="display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; color: #1a1816; cursor: pointer; padding: 8px 12px; background: #fffdf8; border: 1.5px solid #1a1816; border-radius: 10px; box-shadow: 1.5px 1.5px 0px #1a1816;">
                <input type="checkbox" name="teacher_class" value="${c.id}" ${isChecked ? "checked" : ""} style="width: 18px; height: 18px; cursor: pointer;" />
                <span>${escapeHtml(c.name)} <span style="font-size: 11px; color: #72685d;">(${escapeHtml(c.code)})</span></span>
              </label>
            `;
          }).join("");
        }

        modalTeacherClasses.classList.remove("view-hidden");
      });
    });

    if (btnCancelTeacherClasses) btnCancelTeacherClasses.addEventListener("click", () => modalTeacherClasses.classList.add("view-hidden"));
    if (btnCloseTeacherClasses) btnCloseTeacherClasses.addEventListener("click", () => modalTeacherClasses.classList.add("view-hidden"));

    if (formTeacherClasses && !formTeacherClasses.dataset.bound) {
      formTeacherClasses.dataset.bound = "true";
      formTeacherClasses.addEventListener("submit", async (e) => {
        e.preventDefault();
        const teacherUid = document.getElementById("target-teacher-id").value;
        if (!teacherUid) return;

        const checkedInputs = formTeacherClasses.querySelectorAll("input[name='teacher_class']:checked");
        const selectedClasses = [];
        checkedInputs.forEach((inp) => selectedClasses.push(inp.value));

        try {
          await db.collection("users").doc(teacherUid).update({
            teachingClasses: selectedClasses,
            updatedAt: new Date().toISOString()
          });
          modalTeacherClasses.classList.add("view-hidden");
          showToast("Teacher classes updated successfully!", "success");
        } catch (err) {
          showToast("Failed to update teacher classes: " + err.message, "error");
        }
      });
    }

    // STUDENT REASSIGN MODAL BINDINGS
    const modalReassign = document.getElementById("modal-reassign-student");
    const formReassign = document.getElementById("form-reassign-student");
    const selectReassignClass = document.getElementById("reassign-select-class");
    const selectReassignGroup = document.getElementById("reassign-select-group");
    const btnCancelReassign = document.getElementById("btn-cancel-reassign");
    const btnCloseReassign = document.getElementById("btn-close-reassign-modal");

    function syncReassignGroups() {
      if (!selectReassignGroup || !selectReassignClass) return;
      const classId = selectReassignClass.value;
      const groups = window.AcademicRegistry ? window.AcademicRegistry.getGroupsForClass(classId) : [];
      selectReassignGroup.innerHTML = groups.map((g) => `<option value="${g.id}">${g.name} (${g.code})</option>`).join("");
    }

    if (selectReassignClass && !selectReassignClass.dataset.bound) {
      selectReassignClass.dataset.bound = "true";
      selectReassignClass.addEventListener("change", syncReassignGroups);
    }

    listEl.querySelectorAll(".btn-reassign-student").forEach((btn) => {
      btn.addEventListener("click", () => {
        const uid = btn.dataset.id;
        const name = btn.dataset.name;
        const userClass = btn.dataset.class || "2ang-aff";
        const userGroup = btn.dataset.group || "grp1";

        document.getElementById("reassign-student-id").value = uid;
        const subtitle = document.getElementById("reassign-student-subtitle");
        if (subtitle) subtitle.textContent = `Change class and group for ${name}:`;

        const classes = window.AcademicRegistry ? window.AcademicRegistry.getAllClasses() : [];
        if (selectReassignClass) {
          selectReassignClass.innerHTML = classes.map((c) => `<option value="${c.id}" ${c.id === userClass ? "selected" : ""}>${c.name} (${c.code})</option>`).join("");
          syncReassignGroups();
          if (selectReassignGroup) selectReassignGroup.value = userGroup;
        }

        modalReassign.classList.remove("view-hidden");
      });
    });

    if (btnCancelReassign) btnCancelReassign.addEventListener("click", () => modalReassign.classList.add("view-hidden"));
    if (btnCloseReassign) btnCloseReassign.addEventListener("click", () => modalReassign.classList.add("view-hidden"));

    if (formReassign && !formReassign.dataset.bound) {
      formReassign.dataset.bound = "true";
      formReassign.addEventListener("submit", async (e) => {
        e.preventDefault();
        const studentUid = document.getElementById("reassign-student-id").value;
        const newClassId = selectReassignClass ? selectReassignClass.value : "2ang-aff";
        const newGroupId = selectReassignGroup ? selectReassignGroup.value : "grp1";

        if (!studentUid) return;

        try {
          await window.ProfileManager.reassignStudentClassGroup(db, studentUid, newClassId, newGroupId);
          modalReassign.classList.add("view-hidden");
          showToast("Student class and group updated!", "success");
        } catch (err) {
          showToast("Failed to reassign student: " + err.message, "error");
        }
      });
    }
  }

})();

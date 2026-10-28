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
    "عيادي روضة",
    "غربي إيمان",
    "بن علي حافظ",
    "جهاد معلى",
    "العفاس نجلاء",
    "بن شهيدة مريم",
    "غمامي سناء",
    "منيف حافظ",
    "غربي أحمد عبد العزيز",
    "كلثوم بالوافي",
    "رانية الدريسي",
    "كعمون وسيم",
    "الشرقي سهلة",
    "الغندري أحلام"
  ];

  let auth = null;
  let db = null;
  let currentUser = null;
  let currentProfile = null;

  // Schedule Editor State
  let currentScheduleDay = "Mon";
  let workingTimetable = JSON.parse(JSON.stringify(DEFAULT_SEED_SCHEDULE));
  let hasUnsavedScheduleChanges = false;

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
     SECTION TABS: SCHEDULE EDITOR vs MEMBER APPROVALS
     ========================================================================== */

  function initMainTabs() {
    const tabSched = document.getElementById("btn-tab-schedule");
    const tabMembers = document.getElementById("btn-tab-members");
    const panelSched = document.getElementById("panel-schedule");
    const panelMembers = document.getElementById("panel-members");

    if (tabSched && tabMembers && panelSched && panelMembers) {
      tabSched.addEventListener("click", () => {
        tabSched.classList.add("active");
        tabMembers.classList.remove("active");
        panelSched.classList.remove("view-hidden");
        panelMembers.classList.add("view-hidden");
      });

      tabMembers.addEventListener("click", () => {
        tabMembers.classList.add("active");
        tabSched.classList.remove("active");
        panelMembers.classList.remove("view-hidden");
        panelSched.classList.add("view-hidden");
      });
    }
  }

  /* ==========================================================================
     WEEKLY SCHEDULE EDITOR SYSTEM
     ========================================================================== */

  async function initScheduleEditor() {
    populateModalPresets();
    bindScheduleActionButtons();
    bindDayTabs();
    bindModalForm();

    // Fetch existing live schedule from Firestore or local cache
    await loadScheduleFromServer();
    renderScheduleDayView();
  }

  async function loadScheduleFromServer() {
    // 1. Immediately restore local storage cache so there is zero reset flicker on refresh
    const localSched = localStorage.getItem("quill_q_server_schedule");
    if (localSched) {
      try {
        const parsed = JSON.parse(localSched);
        if (parsed && (parsed.Mon || parsed.Tue)) {
          workingTimetable = parsed;
          renderScheduleDayView();
        }
      } catch (e) {}
    }

    if (!db) return;

    // 2. Fetch live data from Firestore server
    try {
      const snapshot = await db.collection("schedules").get();
      if (!snapshot.empty) {
        snapshot.forEach((doc) => {
          if (doc.exists) {
            const data = doc.data();
            workingTimetable[doc.id] = {
              dayName: data.dayName || DEFAULT_SEED_SCHEDULE[doc.id]?.dayName || doc.id,
              dateLabel: data.dateLabel || DEFAULT_SEED_SCHEDULE[doc.id]?.dateLabel || "",
              activeClassIndex: data.activeClassIndex ?? -1,
              scheduleVersion: data.scheduleVersion || Date.now(),
              items: data.items || []
            };
          }
        });
        localStorage.setItem("quill_q_server_schedule", JSON.stringify(workingTimetable));
        renderScheduleDayView();
      } else {
        // If empty on server, push seed
        await saveScheduleToServer(false);
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
          workingTimetable = JSON.parse(JSON.stringify(DEFAULT_SEED_SCHEDULE));
          markScheduleChanged();
          renderScheduleDayView();
          showToast("Schedule reset to official seed. Click 'Save Changes' to push to live server.", "info");
        }
      });
    }
  }

  async function saveScheduleToServer(showFeedback = true) {
    // 1. Always immediately persist to localStorage so it can never be lost on refresh
    try {
      localStorage.setItem("quill_q_server_schedule", JSON.stringify(workingTimetable));
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
        const ref = db.collection("schedules").doc(dayKey);
        const dayData = workingTimetable[dayKey];
        batch.set(ref, {
          dayName: dayData.dayName || dayKey,
          dateLabel: dayData.dateLabel || "",
          activeClassIndex: dayData.activeClassIndex ?? -1,
          scheduleVersion: currentVersion,
          items: dayData.items || []
        });
      });

      await batch.commit();

      localStorage.setItem("quill_q_server_schedule", JSON.stringify(workingTimetable));
      markScheduleSaved();
      if (showFeedback) {
        showToast("Weekly schedule synced and saved to server!", "success");
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

    try {
      membersListener = db.collection("users").onSnapshot((snapshot) => {
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

    const pending = cachedMembers.filter((u) => u.status === "pending" && !isSuperAdminUser(u));
    const approved = cachedMembers.filter((u) => u.status === "approved" || isSuperAdminUser(u));

    if (countPendingEl) countPendingEl.textContent = pending.length;
    if (countApprovedEl) countApprovedEl.textContent = approved.length;
    if (badgeTotalPending) badgeTotalPending.textContent = pending.length;
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
      const academicDetail = user.academicDetail || (isTeacher ? "Teaching Faculty" : "English Business Grp 1");
      const name = user.displayName || user.firstName || "Member";
      const status = user.status || "pending";
      const avatar = user.photoURL || "assets/avatar.jpg";

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
            ` : `
              ${!isAdmin ? `
                <button type="button" class="btn-slot-edit btn-toggle-role" data-id="${user.id}" data-role="${user.role || 'student'}" data-name="${escapeHtml(name)}" title="Change Role">
                  ${isTeacher ? "Switch to Student" : "Switch to Teacher"}
                </button>
                <button type="button" class="btn-slot-delete btn-revoke-user" data-id="${user.id}" data-name="${escapeHtml(name)}" title="Revoke Approval">
                  Revoke
                </button>
              ` : `
                <span style="font-size: 13px; font-weight: 700; color: #b45309; padding: 4px 10px; background: #fef3c7; border-radius: 8px; border: 1px solid #d97706;">
                  Super Admin 👑
                </span>
              `}
            `}
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
  }

})();

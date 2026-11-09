// ===== School-Q Dashboard =====
// Dynamic Server-Synced Schedule (Protected by Firestore Security Rules)

// Current Version of the Official Schedule (Groupe: 2ANG-AFF 1, 26/10/26)
const OFFICIAL_SCHEDULE_VERSION = 3;

// Default seed data matching the official university timetable (Groupe: 2ANG-AFF 1)
const DEFAULT_TIMETABLE_SEED = {
  Mon: {
    dayName: "Monday",
    dateLabel: "Monday, Oct 19",
    activeClassIndex: 1,
    scheduleVersion: OFFICIAL_SCHEDULE_VERSION,
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
    scheduleVersion: OFFICIAL_SCHEDULE_VERSION,
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
    scheduleVersion: OFFICIAL_SCHEDULE_VERSION,
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
    scheduleVersion: OFFICIAL_SCHEDULE_VERSION,
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
    scheduleVersion: OFFICIAL_SCHEDULE_VERSION,
    items: [
      { time: "08:30 AM – 10:00 AM", subject: "British History", prof: "عيادي روضة", room: "Salle-13", type: "TD", color: "#e8987a", icon: "history" },
      { time: "10:00 AM – 11:30 AM", subject: "Commercial English 1", prof: "الشرقي سهلة", room: "Amphi 4", type: "C", color: "#f6cf7c", current: true, icon: "business" },
      { time: "11:30 AM – 01:00 PM", subject: "Commercial English 1", prof: "الشرقي سهلة", room: "Salle-10", type: "TD", color: "#a9c6ec", icon: "business" },
      { time: "02:00 PM – 03:30 PM", subject: "Entrepreneurial Skills", prof: "الغندري أحلام", room: "Salle-12", type: "TD", color: "#5bae86", icon: "law" },
      { time: "04:00 PM – 05:30 PM", subject: "Activités pratiques (TEFL)", prof: "رانية الدريسي", room: "Salle-11", type: "TD", color: "#e0835f", icon: "tefl" }
    ]
  },
  Sat: { dayName: "Saturday", dateLabel: "Saturday, Oct 24", activeClassIndex: -1, scheduleVersion: OFFICIAL_SCHEDULE_VERSION, items: [] },
  Sun: { dayName: "Sunday", dateLabel: "Sunday, Oct 25", activeClassIndex: -1, scheduleVersion: OFFICIAL_SCHEDULE_VERSION, items: [] }
};

const DEFAULT_TIMETABLE_SEED_GRP2 = {
  Mon: {
    dayName: "Monday",
    dateLabel: "Monday, Oct 19",
    activeClassIndex: 1,
    scheduleVersion: OFFICIAL_SCHEDULE_VERSION,
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
    scheduleVersion: OFFICIAL_SCHEDULE_VERSION,
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
    scheduleVersion: OFFICIAL_SCHEDULE_VERSION,
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
    scheduleVersion: OFFICIAL_SCHEDULE_VERSION,
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
    scheduleVersion: OFFICIAL_SCHEDULE_VERSION,
    items: [
      { time: "08:30 AM – 10:00 AM", subject: "Commercial English 1", prof: "الشرقي سهلة", room: "Salle 10", type: "TD", color: "#a9c6ec", icon: "business" },
      { time: "10:00 AM – 11:30 AM", subject: "Commercial English 1", prof: "الشرقي سهلة", room: "Amphi 4", type: "C", color: "#f6cf7c", current: true, icon: "business" },
      { time: "11:30 AM – 01:00 PM", subject: "Entrepreneurial Skills (Droit)", prof: "الغندري أحلام", room: "Salle 12", type: "TD", color: "#5bae86", icon: "law" },
      { time: "01:00 PM – 02:30 PM", subject: "British History", prof: "عيادي روضة", room: "Salle 13", type: "TD", color: "#e8987a", icon: "history" },
      { time: "02:30 PM – 04:00 PM", subject: "Activités pratiques (TEFL)", prof: "رانية الإدريسي", room: "Salle 11", type: "TD", color: "#e0835f", icon: "tefl" }
    ]
  },
  Sat: { dayName: "Saturday", dateLabel: "Saturday, Oct 24", activeClassIndex: -1, scheduleVersion: OFFICIAL_SCHEDULE_VERSION, items: [] },
  Sun: { dayName: "Sunday", dateLabel: "Sunday, Oct 25", activeClassIndex: -1, scheduleVersion: OFFICIAL_SCHEDULE_VERSION, items: [] }
};

function getUserClassId(profile) {
  if (!profile) return "2ang-aff";
  if (profile.classId) return profile.classId;
  if (window.AcademicRegistry) {
    const norm = window.AcademicRegistry.normalizeProfileAcademic(profile);
    return norm.classId || "2ang-aff";
  }
  return "2ang-aff";
}

function getUserGroup(profile) {
  if (!profile) return "grp1";
  if (profile.group) return profile.group;
  if (window.AcademicRegistry) {
    const norm = window.AcademicRegistry.normalizeProfileAcademic(profile);
    return norm.group || "grp1";
  }
  const detail = String(profile.academicDetail || "").toLowerCase();
  if (detail.includes("grp 2") || detail.includes("grp2") || detail.includes("group 2") || detail.includes("2ang-aff 2") || detail.includes("2ang-trad 2")) {
    return "grp2";
  }
  return "grp1";
}

let allSchedulesCache = {
  "2ang-aff_grp1": JSON.parse(JSON.stringify(DEFAULT_TIMETABLE_SEED)),
  "2ang-aff_grp2": JSON.parse(JSON.stringify(DEFAULT_TIMETABLE_SEED_GRP2)),
  "grp1": JSON.parse(JSON.stringify(DEFAULT_TIMETABLE_SEED)),
  "grp2": JSON.parse(JSON.stringify(DEFAULT_TIMETABLE_SEED_GRP2))
};

let currentActiveScheduleClass = "2ang-aff";
let currentActiveScheduleGroup = "grp1";
let TIMETABLE = JSON.parse(JSON.stringify(DEFAULT_TIMETABLE_SEED));
let scheduleUnsubscribe = null;

function setScheduleGroup(group) {
  setScheduleClassAndGroup(currentActiveScheduleClass, group);
}

function setScheduleClassAndGroup(classId, groupId) {
  currentActiveScheduleClass = classId || "2ang-aff";
  currentActiveScheduleGroup = groupId || "grp1";
  const scheduleKey = `${currentActiveScheduleClass}_${currentActiveScheduleGroup}`;

  if (allSchedulesCache[scheduleKey]) {
    TIMETABLE = allSchedulesCache[scheduleKey];
  } else if (currentActiveScheduleClass === "2ang-aff" && allSchedulesCache[currentActiveScheduleGroup]) {
    TIMETABLE = allSchedulesCache[currentActiveScheduleGroup];
  } else if (currentActiveScheduleClass === "2ang-aff") {
    TIMETABLE = currentActiveScheduleGroup === "grp2" ? DEFAULT_TIMETABLE_SEED_GRP2 : DEFAULT_TIMETABLE_SEED;
  } else {
    // Generate blank days for unconfigured classes / groups
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayNames = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };
    TIMETABLE = {};
    days.forEach((d, i) => {
      TIMETABLE[d] = {
        dayName: dayNames[d],
        dateLabel: `${dayNames[d]}, Oct ${19 + i}`,
        activeClassIndex: -1,
        scheduleVersion: OFFICIAL_SCHEDULE_VERSION,
        items: []
      };
    });
  }

  updateScheduleGroupUIState();
  updateTodayStatus();
  renderDetailedSchedule(currentSelectedDay);
  renderSchedule();
  renderHomeworksView();
  syncHomeHomeworkNote();
}

function updateScheduleGroupUIState() {
  const btnGrp1 = document.getElementById("btn-sched-grp1");
  const btnGrp2 = document.getElementById("btn-sched-grp2");
  const btnHomeGrp1 = document.getElementById("btn-home-sched-grp1");
  const btnHomeGrp2 = document.getElementById("btn-home-sched-grp2");
  const btnHwGrp1 = document.getElementById("btn-hw-sched-grp1");
  const btnHwGrp2 = document.getElementById("btn-hw-sched-grp2");
  const badge = document.getElementById("schedule-active-group-badge");
  const homeBadge = document.getElementById("home-schedule-active-badge");
  const hwBadge = document.getElementById("hw-active-group-badge");
  const switcher = document.querySelector(".schedule-group-switcher");
  const homeHeader = document.getElementById("home-schedule-preview-header");
  const hwSwitcher = document.getElementById("hw-group-switcher");

  const classSwitcherWrap = document.getElementById("schedule-class-switcher-wrap");
  const classSelect = document.getElementById("schedule-class-select");
  const homeClassSelect = document.getElementById("home-schedule-class-select");

  const profile = currentProfile;
  const canSwitch = isSuperAdminUser(profile) || (profile && profile.role === "teacher");

  if (switcher) switcher.style.display = canSwitch ? "inline-flex" : "none";
  if (homeHeader) homeHeader.style.display = canSwitch ? "flex" : "none";
  if (hwSwitcher) hwSwitcher.style.display = canSwitch ? "inline-flex" : "none";
  if (classSwitcherWrap) classSwitcherWrap.style.display = canSwitch ? "inline-flex" : "none";

  // Populate & sync class select dropdowns for teacher/admin
  if (canSwitch && window.AcademicRegistry) {
    const allClasses = window.AcademicRegistry.getAllClasses();
    const availableClasses = isSuperAdminUser(profile) ? allClasses : allClasses.filter(c => window.ProfileManager ? window.ProfileManager.teacherTeachesClass(profile, c.id) : true);
    const classesToRender = availableClasses.length ? availableClasses : allClasses;

    if (classSelect) {
      if (classSelect.options.length !== classesToRender.length) {
        classSelect.innerHTML = classesToRender.map(c => `<option value="${c.id}" ${c.id === currentActiveScheduleClass ? "selected" : ""}>${c.shortName || c.name}</option>`).join("");
      }
      classSelect.value = currentActiveScheduleClass;
    }

    if (homeClassSelect) {
      if (homeClassSelect.options.length !== classesToRender.length) {
        homeClassSelect.innerHTML = classesToRender.map(c => `<option value="${c.id}" ${c.id === currentActiveScheduleClass ? "selected" : ""}>${c.shortName || c.name}</option>`).join("");
      }
      homeClassSelect.value = currentActiveScheduleClass;
    }
  }

  const isGrp1 = currentActiveScheduleGroup === "grp1";
  const isGrp2 = currentActiveScheduleGroup === "grp2";

  if (btnGrp1) btnGrp1.classList.toggle("active", isGrp1);
  if (btnGrp2) btnGrp2.classList.toggle("active", isGrp2);
  if (btnHomeGrp1) btnHomeGrp1.classList.toggle("active", isGrp1);
  if (btnHomeGrp2) btnHomeGrp2.classList.toggle("active", isGrp2);
  if (btnHwGrp1) btnHwGrp1.classList.toggle("active", isGrp1);
  if (btnHwGrp2) btnHwGrp2.classList.toggle("active", isGrp2);

  // Group label with class name
  const clsObj = (window.AcademicRegistry && typeof window.AcademicRegistry.getClassById === "function") ? window.AcademicRegistry.getClassById(currentActiveScheduleClass) : null;
  const grpObj = (window.AcademicRegistry && typeof window.AcademicRegistry.getGroup === "function") ? window.AcademicRegistry.getGroup(currentActiveScheduleClass, currentActiveScheduleGroup) : null;
  const clsCode = clsObj ? clsObj.code : (currentActiveScheduleClass === "2ang-trad" ? "2ANG-TRAD" : "2ANG-AFF");
  const grpName = grpObj ? grpObj.name : (isGrp2 ? "Group 2" : "Group 1");
  const groupLabel = `${grpName} (${clsCode} ${isGrp2 ? "2" : "1"})`;

  if (badge) badge.textContent = groupLabel;
  if (homeBadge) homeBadge.textContent = groupLabel;
  if (hwBadge) hwBadge.textContent = groupLabel;
}

function bindServerSchedule(user) {
  if (scheduleUnsubscribe) {
    try { scheduleUnsubscribe(); } catch (e) {}
    scheduleUnsubscribe = null;
  }

  const profile = currentProfile;
  const isSuperAdmin = isSuperAdminUser(profile);
  const isApproved = profile && (profile.status === "approved" || isSuperAdmin);
  const userGrp = getUserGroup(profile);
  const userClass = getUserClassId(profile);

  // If regular student, strictly lock their active class and group to their assigned values
  if (!isSuperAdmin && (!profile || profile.role !== "teacher")) {
    currentActiveScheduleClass = userClass;
    currentActiveScheduleGroup = userGrp;
  }

  // Bind Class Selectors
  const classSelect = document.getElementById("schedule-class-select");
  if (classSelect && !classSelect.dataset.bound) {
    classSelect.dataset.bound = "true";
    classSelect.addEventListener("change", (e) => {
      setScheduleClassAndGroup(e.target.value, currentActiveScheduleGroup);
    });
  }

  const homeClassSelect = document.getElementById("home-schedule-class-select");
  if (homeClassSelect && !homeClassSelect.dataset.bound) {
    homeClassSelect.dataset.bound = "true";
    homeClassSelect.addEventListener("change", (e) => {
      setScheduleClassAndGroup(e.target.value, currentActiveScheduleGroup);
    });
  }

  // Bind Schedule View Switcher Buttons
  const btnGrp1 = document.getElementById("btn-sched-grp1");
  const btnGrp2 = document.getElementById("btn-sched-grp2");
  if (btnGrp1 && !btnGrp1.dataset.bound) {
    btnGrp1.dataset.bound = "true";
    btnGrp1.addEventListener("click", () => setScheduleGroup("grp1"));
  }
  if (btnGrp2 && !btnGrp2.dataset.bound) {
    btnGrp2.dataset.bound = "true";
    btnGrp2.addEventListener("click", () => setScheduleGroup("grp2"));
  }

  // Bind Home View Switcher Buttons
  const btnHomeGrp1 = document.getElementById("btn-home-sched-grp1");
  const btnHomeGrp2 = document.getElementById("btn-home-sched-grp2");
  if (btnHomeGrp1 && !btnHomeGrp1.dataset.bound) {
    btnHomeGrp1.dataset.bound = "true";
    btnHomeGrp1.addEventListener("click", () => setScheduleGroup("grp1"));
  }
  if (btnHomeGrp2 && !btnHomeGrp2.dataset.bound) {
    btnHomeGrp2.dataset.bound = "true";
    btnHomeGrp2.addEventListener("click", () => setScheduleGroup("grp2"));
  }

  // Bind Homework View Switcher Buttons
  const btnHwGrp1 = document.getElementById("btn-hw-sched-grp1");
  const btnHwGrp2 = document.getElementById("btn-hw-sched-grp2");
  if (btnHwGrp1 && !btnHwGrp1.dataset.bound) {
    btnHwGrp1.dataset.bound = "true";
    btnHwGrp1.addEventListener("click", () => setScheduleGroup("grp1"));
  }
  if (btnHwGrp2 && !btnHwGrp2.dataset.bound) {
    btnHwGrp2.dataset.bound = "true";
    btnHwGrp2.addEventListener("click", () => setScheduleGroup("grp2"));
  }

  updateScheduleGroupUIState();

  // Unapproved users cannot fetch schedule
  if (!user || !isApproved) {
    TIMETABLE = {
      Mon: { dayName: "Monday", dateLabel: "Monday, Oct 19", activeClassIndex: -1, items: [] },
      Tue: { dayName: "Tuesday", dateLabel: "Tuesday, Oct 20", activeClassIndex: -1, items: [] },
      Wed: { dayName: "Wednesday", dateLabel: "Wednesday, Oct 21", activeClassIndex: -1, items: [] },
      Thu: { dayName: "Thursday", dateLabel: "Thursday, Oct 22", activeClassIndex: -1, items: [] },
      Fri: { dayName: "Friday", dateLabel: "Friday, Oct 23", activeClassIndex: -1, items: [] },
      Sat: { dayName: "Saturday", dateLabel: "Saturday, Oct 24", activeClassIndex: -1, items: [] },
      Sun: { dayName: "Sunday", dateLabel: "Sunday, Oct 25", activeClassIndex: -1, items: [] }
    };
    updateScheduleGroupUIState();
    updateTodayStatus();
    renderDetailedSchedule(currentSelectedDay);
    renderSchedule();
    return;
  }

  // Load cached multi-group schedule if present
  try {
    const localGrp1 = localStorage.getItem("quill_q_server_schedule_grp1") || localStorage.getItem("quill_q_server_schedule");
    if (localGrp1) {
      allSchedulesCache.grp1 = JSON.parse(localGrp1);
      allSchedulesCache["2ang-aff_grp1"] = allSchedulesCache.grp1;
    }
    const localGrp2 = localStorage.getItem("quill_q_server_schedule_grp2");
    if (localGrp2) {
      allSchedulesCache.grp2 = JSON.parse(localGrp2);
      allSchedulesCache["2ang-aff_grp2"] = allSchedulesCache.grp2;
    }
  } catch (e) {}

  setScheduleClassAndGroup(currentActiveScheduleClass, currentActiveScheduleGroup);

  if (db) {
    try {
      scheduleUnsubscribe = db.collection("schedules").onSnapshot(async (snapshot) => {
        if (!snapshot.empty) {
          snapshot.forEach((doc) => {
            if (doc.exists) {
              const docId = doc.id;
              const data = doc.data();

              if (docId.includes("_")) {
                const parts = docId.split("_");
                if (parts.length === 3) {
                  // e.g. 2ang-trad_grp1_Mon
                  const [cId, gId, dKey] = parts;
                  const sKey = `${cId}_${gId}`;
                  if (!allSchedulesCache[sKey]) allSchedulesCache[sKey] = {};
                  allSchedulesCache[sKey][dKey] = data;

                  // Backward compatibility for 2ang-aff
                  if (cId === "2ang-aff") {
                    if (!allSchedulesCache[gId]) allSchedulesCache[gId] = {};
                    allSchedulesCache[gId][dKey] = data;
                  }
                } else if (parts.length === 2) {
                  // e.g. grp1_Mon
                  const [gId, dKey] = parts;
                  if (!allSchedulesCache[gId]) allSchedulesCache[gId] = {};
                  allSchedulesCache[gId][dKey] = data;

                  const sKey = `2ang-aff_${gId}`;
                  if (!allSchedulesCache[sKey]) allSchedulesCache[sKey] = {};
                  allSchedulesCache[sKey][dKey] = data;
                }
              } else {
                // legacy docId (Mon, Tue) defaults to 2ang-aff grp1
                if (!allSchedulesCache.grp1) allSchedulesCache.grp1 = {};
                allSchedulesCache.grp1[docId] = data;
                if (!allSchedulesCache["2ang-aff_grp1"]) allSchedulesCache["2ang-aff_grp1"] = {};
                allSchedulesCache["2ang-aff_grp1"][docId] = data;
              }
            }
          });

          try {
            if (allSchedulesCache.grp1) localStorage.setItem("quill_q_server_schedule_grp1", JSON.stringify(allSchedulesCache.grp1));
            if (allSchedulesCache.grp2) localStorage.setItem("quill_q_server_schedule_grp2", JSON.stringify(allSchedulesCache.grp2));
          } catch (e) {}

          setScheduleClassAndGroup(currentActiveScheduleClass, currentActiveScheduleGroup);
        }
      }, (err) => {
        console.warn("Firestore schedule listener warning:", err);
      });
    } catch (err) {
      console.warn("Could not bind server schedule:", err);
    }
  }
}

let currentSelectedDay = "Mon";

function getSubjectIcon(type) {
  switch (type) {
    case "break":
    case "coffee":
      // Recess / Break - Steaming coffee mug sketch doodle
      return `
        <svg viewBox="0 0 34 34" class="sched-subject-icon icon-break" fill="none">
          <rect x="7" y="10" width="16" height="15" rx="3.5" fill="#ece6db" stroke="#25211e" stroke-width="1.7" />
          <path d="M23 13h2.5a3 3 0 0 1 0 6H23" stroke="#25211e" stroke-width="1.7" stroke-linecap="round" />
          <path d="M10 5.5c0 1.2 1 1.8 1 2.8M15 5.5c0 1.2 1 1.8 1 2.8M20 5.5c0 1.2 1 1.8 1 2.8" stroke="#8a7c6d" stroke-width="1.3" stroke-linecap="round" />
          <line x1="5" y1="27" x2="25" y2="27" stroke="#25211e" stroke-width="1.7" stroke-linecap="round" />
        </svg>`;

    case "law":
    case "scroll":
      // Entrepreneurial Skills (Droit) - Legal Scroll with wax seal
      return `
        <svg viewBox="0 0 34 34" class="sched-subject-icon icon-law" fill="none">
          <path d="M8 8 C8 6 10 5 13 5 H23 C26 5 28 6.5 28 9 C28 11.5 26 12 24 12 H10 C8 12 7 13 7 15 V25 C7 27 8.5 28 11 28 H21 C24 28 26 27 26 25" stroke="#25211e" stroke-width="1.7" stroke-linecap="round" fill="#fcf8f0"/>
          <line x1="11" y1="17" x2="21" y2="17" stroke="#25211e" stroke-width="1.3" stroke-linecap="round"/>
          <line x1="11" y1="21" x2="18" y2="21" stroke="#25211e" stroke-width="1.3" stroke-linecap="round"/>
          <circle cx="21" cy="24" r="3" fill="#e0835f" stroke="#25211e" stroke-width="1.3"/>
        </svg>`;

    case "writing":
      // Writing - Tilted pencil with eraser and sharp tip
      return `
        <svg viewBox="0 0 34 34" class="sched-subject-icon icon-writing" fill="none">
          <g transform="rotate(-45 17 15)">
            <path d="M12 24 H22 V28 C22 29.5 20.5 30 17 30 C13.5 30 12 29.5 12 28 Z" fill="#e88971" stroke="#25211e" stroke-width="1.6" stroke-linejoin="round" />
            <rect x="12" y="21" width="10" height="3" fill="#cfcbc0" stroke="#25211e" stroke-width="1.4" />
            <rect x="12" y="7" width="10" height="14" fill="#f8cd62" stroke="#25211e" stroke-width="1.6" />
            <line x1="15.5" y1="7" x2="15.5" y2="21" stroke="#e0a936" stroke-width="1.2" />
            <line x1="18.5" y1="7" x2="18.5" y2="21" stroke="#e0a936" stroke-width="1.2" />
            <polygon points="12,7 22,7 17,-1" fill="#fdf2d8" stroke="#25211e" stroke-width="1.6" stroke-linejoin="round" />
            <polygon points="15.2,1.8 18.8,1.8 17,-1" fill="#25211e" />
          </g>
          <line x1="8" y1="28" x2="28" y2="28" stroke="#25211e" stroke-width="1.6" stroke-linecap="round" />
        </svg>`;

    case "history":
      // British & US History - Classic Roman/Ionic Pillar Column with archival bookmark
      return `
        <svg viewBox="0 0 34 34" class="sched-subject-icon icon-history" fill="none">
          <path d="M6 7 H28 V10 H6 Z" fill="#faf6ed" stroke="#25211e" stroke-width="1.7" stroke-linejoin="round"/>
          <path d="M9 10 V24 M14.3 10 V24 M19.7 10 V24 M25 10 V24" stroke="#25211e" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M5 24 H29 V28 H5 Z" fill="#faf6ed" stroke="#25211e" stroke-width="1.7" stroke-linejoin="round"/>
          <circle cx="17" cy="8.5" r="1.2" fill="#5b8fc9"/>
        </svg>`;

    case "finance":
    case "math":
      // Financial English & Numbers - Vintage accounting abacus / coin growth balance
      return `
        <svg viewBox="0 0 34 34" class="sched-subject-icon icon-finance" fill="none">
          <circle cx="17" cy="17" r="11" fill="#fcfaf2" stroke="#25211e" stroke-width="1.8"/>
          <circle cx="17" cy="17" r="8" stroke="#5bae86" stroke-width="1.4" stroke-dasharray="2 2"/>
          <path d="M17 11 V23 M14 14 H19.5 C20.5 14 21 14.8 21 15.5 C21 16.5 20 17 17 17 C14 17 13 17.5 13 18.5 C13 19.5 14 20 15 20 H20" stroke="#25211e" stroke-width="1.7" stroke-linecap="round"/>
        </svg>`;

    case "theater":
      // Drama - Comedy & Drama Masks with ribbon
      return `
        <svg viewBox="0 0 34 34" class="sched-subject-icon icon-theater" fill="none">
          <path d="M7 8 C7 5 11 5 17 5 C23 5 27 5 27 8 C27 15 24 23 17 26 C10 23 7 15 7 8 Z" fill="#faeee9" stroke="#25211e" stroke-width="1.8" stroke-linejoin="round"/>
          <!-- Eyes -->
          <ellipse cx="13" cy="12" rx="2" ry="3" fill="#25211e"/>
          <ellipse cx="21" cy="12" rx="2" ry="3" fill="#25211e"/>
          <!-- Theatrical curved smile -->
          <path d="M12 18 C14 22 20 22 22 18" stroke="#25211e" stroke-width="1.8" stroke-linecap="round" fill="none"/>
        </svg>`;

    case "poetry":
      // Poetry - Quill Feather & Inkpot
      return `
        <svg viewBox="0 0 34 34" class="sched-subject-icon icon-poetry" fill="none">
          <path d="M9 25 C12 25 15 23 18 20 C22 16 26 10 27 5 C23 7 17 11 14 15 C11 19 9 22 9 25 Z" fill="#faeee9" stroke="#25211e" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M12 22 L24 10" stroke="#f6cf7c" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M6 28 C6 26 8 25 11 25 C14 25 16 26 16 28 Z" fill="#25211e"/>
          <path d="M7 29 H15" stroke="#25211e" stroke-width="1.8" stroke-linecap="round"/>
        </svg>`;

    case "novel":
      // Novel - Hardcover Book with Ribbon Bookmark
      return `
        <svg viewBox="0 0 34 34" class="sched-subject-icon icon-novel" fill="none">
          <path d="M7 7 C7 5.5 8.5 4 10.5 4 H25 C26.5 4 27.5 5 27.5 6.5 V24 C27.5 25.5 26.5 26.5 25 26.5 H10.5 C8.5 26.5 7 28 7 28 Z" fill="#dcf2e3" stroke="#25211e" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M7 7 V28 H25" stroke="#25211e" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M11 4 V15 L14 12 L17 15 V4" fill="#e0835f" stroke="#25211e" stroke-width="1.3" stroke-linejoin="round"/>
          <line x1="12" y1="20" x2="22" y2="20" stroke="#25211e" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="12" y1="23.5" x2="19" y2="23.5" stroke="#25211e" stroke-width="1.5" stroke-linecap="round"/>
        </svg>`;

    case "language":
      // Other Languages (French / Arabic) - Conversational speech dialogue glyphs
      return `
        <svg viewBox="0 0 34 34" class="sched-subject-icon icon-language" fill="none">
          <path d="M5 8 C5 6 7 4 10 4 H21 C24 4 26 6 26 8 V16 C26 18 24 20 21 20 H12 L6 24 V20 C5 20 5 19 5 18 Z" fill="#fdfaf2" stroke="#25211e" stroke-width="1.7" stroke-linejoin="round"/>
          <path d="M10 11 H21 M10 15 H17" stroke="#5b8fc9" stroke-width="1.6" stroke-linecap="round"/>
          <circle cx="25" cy="23" r="4.5" fill="#e8987a" stroke="#25211e" stroke-width="1.4"/>
          <text x="23" y="25" font-size="6" font-weight="bold" fill="#fff" font-family="sans-serif">A</text>
        </svg>`;

    case "grammar":
      // Grammar in Context - Quotation marks & grammatical structure bracket
      return `
        <svg viewBox="0 0 34 34" class="sched-subject-icon icon-grammar" fill="none">
          <rect x="5" y="6" width="24" height="22" rx="3.5" fill="#f4f9f7" stroke="#25211e" stroke-width="1.7"/>
          <!-- Big stylized quote glyphs -->
          <path d="M10 13 C10 11 11.5 10 13.5 10 C14.5 10 15 11 15 12 C15 14.5 12 16.5 10.5 17" stroke="#5bae86" stroke-width="2" stroke-linecap="round"/>
          <path d="M17 13 C17 11 18.5 10 20.5 10 C21.5 10 22 11 22 12 C22 14.5 19 16.5 17.5 17" stroke="#5bae86" stroke-width="2" stroke-linecap="round"/>
          <line x1="10" y1="21" x2="24" y2="21" stroke="#25211e" stroke-width="1.4" stroke-linecap="round"/>
        </svg>`;

    case "linguistics":
      // Linguistics - Speech soundwave / phonetics vocal frequency icon
      return `
        <svg viewBox="0 0 34 34" class="sched-subject-icon icon-linguistics" fill="none">
          <circle cx="17" cy="17" r="12" fill="#faf6ed" stroke="#25211e" stroke-width="1.7"/>
          <line x1="8" y1="17" x2="10" y2="17" stroke="#25211e" stroke-width="2" stroke-linecap="round"/>
          <line x1="12" y1="13" x2="12" y2="21" stroke="#e0835f" stroke-width="2" stroke-linecap="round"/>
          <line x1="16" y1="9" x2="16" y2="25" stroke="#25211e" stroke-width="2" stroke-linecap="round"/>
          <line x1="20" y1="12" x2="20" y2="22" stroke="#e0835f" stroke-width="2" stroke-linecap="round"/>
          <line x1="24" y1="15" x2="24" y2="19" stroke="#25211e" stroke-width="2" stroke-linecap="round"/>
        </svg>`;

    case "literature":
      // Literary Trends - Open illustrated storybook
      return `
        <svg viewBox="0 0 34 34" class="sched-subject-icon icon-literature" fill="none">
          <path d="M17 10 C19 8 23 8 28 9 V23 C23 22 19 23 17 25 C15 23 11 22 6 23 V9 C11 8 15 8 17 10 Z" fill="#faf5ec" stroke="#25211e" stroke-width="1.8" stroke-linejoin="round"/>
          <line x1="17" y1="10" x2="17" y2="25" stroke="#25211e" stroke-width="1.6"/>
          <path d="M20 13 H25 M20 17 H24" stroke="#7a6fc4" stroke-width="1.2" stroke-linecap="round"/>
          <path d="M9 13 H14 M10 17 H14" stroke="#7a6fc4" stroke-width="1.2" stroke-linecap="round"/>
        </svg>`;

    case "business":
      // Commercial English - Executive briefcase with gold buckle
      return `
        <svg viewBox="0 0 34 34" class="sched-subject-icon icon-business" fill="none">
          <rect x="5" y="11" width="24" height="17" rx="3" fill="#faf6ed" stroke="#25211e" stroke-width="1.8"/>
          <path d="M12 11 V8 C12 7 13 6 14 6 H20 C21 6 22 7 22 8 V11" stroke="#25211e" stroke-width="1.7"/>
          <line x1="5" y1="17" x2="29" y2="17" stroke="#25211e" stroke-width="1.3"/>
          <rect x="15" y="15" width="4" height="4" rx="1" fill="#f8cd62" stroke="#25211e" stroke-width="1.2"/>
        </svg>`;

    case "tefl":
      // TEFL - Graduation cap & teaching whiteboard
      return `
        <svg viewBox="0 0 34 34" class="sched-subject-icon icon-tefl" fill="none">
          <polygon points="17,6 29,12 17,18 5,12" fill="#faf6ed" stroke="#25211e" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M9 14.5 V21 C9 23 12 25 17 25 C22 25 25 23 25 21 V14.5" stroke="#25211e" stroke-width="1.6"/>
          <path d="M29 12 V20" stroke="#e0835f" stroke-width="1.6" stroke-linecap="round"/>
          <circle cx="29" cy="21" r="1.3" fill="#e0835f"/>
        </svg>`;

    case "reading":
    default:
      return `
        <svg viewBox="0 0 32 36" class="sched-subject-icon icon-reading" fill="none">
          <rect x="5" y="3" width="22" height="30" rx="3.5" fill="#e5987d" stroke="#25211e" stroke-width="1.8" />
          <line x1="11" y1="3" x2="11" y2="33" stroke="#25211e" stroke-width="1.5" />
          <circle cx="8" cy="10" r="1.2" fill="#25211e" />
          <circle cx="8" cy="18" r="1.2" fill="#25211e" />
          <circle cx="8" cy="26" r="1.2" fill="#25211e" />
          <rect x="15" y="12" width="8" height="12" rx="1.5" fill="#faf6ed" stroke="#25211e" stroke-width="1.3" />
          <line x1="17" y1="16" x2="21" y2="16" stroke="#25211e" stroke-width="1" />
          <line x1="17" y1="19" x2="21" y2="19" stroke="#25211e" stroke-width="1" />
        </svg>`;
  }
}

// --- Time Parsing Helper (Supports 12-hour AM/PM & 24-hour) ---
function parseTimeToMinutes(timeStr) {
  const clean = timeStr.trim();
  const isPM = /pm/i.test(clean);
  const isAM = /am/i.test(clean);
  const timeOnly = clean.replace(/[^\d:]/g, "");
  const parts = timeOnly.split(":");
  if (parts.length < 2) return 0;
  let hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

function parseTimeRange(rangeStr) {
  // e.g. "08:30 AM – 10:00 AM" or "08:30 - 10:00"
  const pieces = rangeStr.split(/–|-/);
  if (pieces.length < 2) return { start: 0, end: 0 };
  return {
    start: parseTimeToMinutes(pieces[0]),
    end: parseTimeToMinutes(pieces[1])
  };
}

function formatBreakDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} min break`;
  }
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0) {
    return hours === 1 ? "1 hour break" : `${hours} hours break`;
  }
  return `${hours}h ${remaining}m break`;
}

// Get day abbreviation from Date object (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
function getDayKey(date = new Date()) {
  const map = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return map[date.getDay()];
}

// Get tomorrow's day key
function getNextDayKey(dayKey) {
  const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const idx = order.indexOf(dayKey);
  return order[(idx + 1) % order.length];
}

// --- Dynamic Today's Status calculation ---
function updateTodayStatus() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayKey = getDayKey(now);
  const dayData = TIMETABLE[todayKey] || { dayName: todayKey, items: [] };
  const items = dayData.items || [];

  const nowLabelEl = document.getElementById("status-now-label");
  const nextLabelEl = document.getElementById("status-next-label");
  const nowSubjectEl = document.getElementById("now-subject");
  const nowTimeEl = document.getElementById("now-time");
  const nowRoomEl = document.getElementById("now-room");
  const nowRoomWrap = document.getElementById("now-room-wrap");
  const liveDotEl = document.getElementById("live-dot");
  const progressBarEl = document.getElementById("progress-bar");
  const nextSubjectEl = document.getElementById("next-subject");
  const nextTimeEl = document.getElementById("next-time");

  // Reset classes and innerHTML on live dot
  if (liveDotEl) {
    liveDotEl.className = "live-dot";
    liveDotEl.innerHTML = "<span></span>";
  }

  // 1. Weekend / Day with no classes
  if (items.length === 0) {
    if (nowLabelEl) nowLabelEl.textContent = "Today's Status";
    if (nextLabelEl) nextLabelEl.textContent = "Coming Up";
    if (nowSubjectEl) nowSubjectEl.textContent = "Day Off • Rest";
    if (nowTimeEl) nowTimeEl.textContent = "No classes scheduled today";
    if (liveDotEl) {
      liveDotEl.classList.add("weekend");
      liveDotEl.innerHTML = `
        <svg viewBox="0 0 50 50" class="wink-face" aria-label="Winking and smiling face">
          <!-- Left Eye (Open and blinking) -->
          <circle cx="18" cy="21" r="3.2" class="wink-left-eye" />
          <!-- Right Eye (Winking arc) -->
          <path d="M28 21.5 C29.5 19 33.5 19 35 21.5" class="wink-right-eye" />
          <!-- Friendly Smile Arc -->
          <path d="M17 29 C21 37 31 37 35 29" class="wink-smile" />
          <!-- Rosy Cheek Blush -->
          <circle cx="14" cy="27" r="2.5" class="wink-blush" />
          <circle cx="37" cy="27" r="2.5" class="wink-blush" />
        </svg>`;
    }
    if (nowRoomWrap) nowRoomWrap.style.display = "none";
    if (progressBarEl) progressBarEl.style.width = "100%";

    // Look for next scheduled day
    let checkKey = getNextDayKey(todayKey);
    let nextDayData = null;
    for (let i = 0; i < 7; i++) {
      if (TIMETABLE[checkKey] && TIMETABLE[checkKey].items.length > 0) {
        nextDayData = TIMETABLE[checkKey];
        break;
      }
      checkKey = getNextDayKey(checkKey);
    }

    if (nextDayData && nextDayData.items.length > 0) {
      const firstClass = nextDayData.items[0];
      if (nextSubjectEl) nextSubjectEl.textContent = `${nextDayData.dayName}: ${firstClass.subject}`;
      if (nextTimeEl) nextTimeEl.textContent = `${firstClass.time} • ${firstClass.room}`;
    } else {
      if (nextSubjectEl) nextSubjectEl.textContent = "No upcoming classes";
      if (nextTimeEl) nextTimeEl.textContent = "Rest / No classes scheduled";
    }
    return;
  }

  if (nowRoomWrap) nowRoomWrap.style.display = "flex";

  // Find active, upcoming, or past classes today
  let activeIndex = -1;
  let nextIndex = -1;

  for (let i = 0; i < items.length; i++) {
    const { start, end } = parseTimeRange(items[i].time);
    if (currentMinutes >= start && currentMinutes < end) {
      activeIndex = i;
      nextIndex = i + 1 < items.length ? i + 1 : -1;
      break;
    } else if (currentMinutes < start) {
      if (nextIndex === -1) {
        nextIndex = i;
      }
    }
  }

  // Case A: A class is actively in progress right now
  if (activeIndex !== -1) {
    const activeClass = items[activeIndex];
    const { start, end } = parseTimeRange(activeClass.time);
    const duration = end - start;
    const elapsed = Math.max(0, currentMinutes - start);
    const pct = Math.min(100, Math.round((elapsed / duration) * 100));

    if (nowLabelEl) nowLabelEl.textContent = "Happening Now";
    if (nowSubjectEl) nowSubjectEl.textContent = activeClass.subject;
    if (nowTimeEl) nowTimeEl.textContent = activeClass.time;
    if (nowRoomEl) nowRoomEl.textContent = activeClass.room;
    if (nowRoomWrap) nowRoomWrap.style.display = "flex";
    if (progressBarEl) progressBarEl.style.width = `${pct}%`;

    if (nextIndex !== -1) {
      const nextClass = items[nextIndex];
      if (nextLabelEl) nextLabelEl.textContent = "Up Next";
      if (nextSubjectEl) nextSubjectEl.textContent = nextClass.subject;
      if (nextTimeEl) nextTimeEl.textContent = `${nextClass.time} • ${nextClass.room}`;
    } else {
      if (nextLabelEl) nextLabelEl.textContent = "Up Next";
      if (nextSubjectEl) nextSubjectEl.textContent = "End of Day";
      if (nextTimeEl) nextTimeEl.textContent = "No more classes today!";
    }
    return;
  }

  // Case B: Before classes have started today
  const firstClass = items[0];
  const firstRange = parseTimeRange(firstClass.time);
  if (currentMinutes < firstRange.start) {
    if (nowLabelEl) nowLabelEl.textContent = "Morning Preparation";
    if (nextLabelEl) nextLabelEl.textContent = "First Class";
    if (nowSubjectEl) nowSubjectEl.textContent = "Pre-class Study";
    if (nowTimeEl) nowTimeEl.textContent = `Starts at ${firstClass.time.split(/–|-/)[0].trim()}`;
    if (nowRoomWrap) nowRoomWrap.style.display = "none";
    if (liveDotEl) liveDotEl.classList.add("rest");
    if (progressBarEl) progressBarEl.style.width = "0%";

    if (nextSubjectEl) nextSubjectEl.textContent = firstClass.subject;
    if (nextTimeEl) nextTimeEl.textContent = `${firstClass.time} • ${firstClass.room}`;
    return;
  }

  // Case C: Between classes (break/rest period)
  if (nextIndex !== -1) {
    const prevClass = items[nextIndex - 1];
    const nextClass = items[nextIndex];
    const prevRange = parseTimeRange(prevClass.time);
    const nextRange = parseTimeRange(nextClass.time);

    const breakDuration = nextRange.start - prevRange.end;
    const elapsedBreak = currentMinutes - prevRange.end;
    const pct = breakDuration > 0 ? Math.min(100, Math.round((elapsedBreak / breakDuration) * 100)) : 50;

    if (nowLabelEl) nowLabelEl.textContent = "Break Time";
    if (nextLabelEl) nextLabelEl.textContent = "Next Class";
    if (nowSubjectEl) nowSubjectEl.textContent = "Break & Rest";
    if (nowTimeEl) nowTimeEl.textContent = `Until ${nextClass.time.split(/–|-/)[0].trim()}`;
    if (nowRoomWrap) nowRoomWrap.style.display = "none";
    if (liveDotEl) liveDotEl.classList.add("rest");
    if (progressBarEl) progressBarEl.style.width = `${pct}%`;

    if (nextSubjectEl) nextSubjectEl.textContent = nextClass.subject;
    if (nextTimeEl) nextTimeEl.textContent = `${nextClass.time} • ${nextClass.room}`;
    return;
  }

  // Case D: After all classes ended for today
  if (nowLabelEl) nowLabelEl.textContent = "Day Completed";
  if (nextLabelEl) nextLabelEl.textContent = "Tomorrow";
  if (nowSubjectEl) nowSubjectEl.textContent = "End of Day";
  if (nowTimeEl) nowTimeEl.textContent = "All classes done for today!";
  if (nowRoomWrap) nowRoomWrap.style.display = "none";
  if (liveDotEl) liveDotEl.classList.add("rest");
  if (progressBarEl) progressBarEl.style.width = "100%";

  const tomorrowKey = getNextDayKey(todayKey);
  const tomData = TIMETABLE[tomorrowKey];
  if (tomData && tomData.items.length > 0) {
    const tomFirst = tomData.items[0];
    if (nextSubjectEl) nextSubjectEl.textContent = `${tomData.dayName}: ${tomFirst.subject}`;
    if (nextTimeEl) nextTimeEl.textContent = `${tomFirst.time} • ${tomFirst.room}`;
  } else {
    if (nextSubjectEl) nextSubjectEl.textContent = `${tomorrowKey}: Day Off`;
    if (nextTimeEl) nextTimeEl.textContent = "Rest & homework time";
  }
}

// --- Render Home Quick Timeline (Today's Schedule or Tomorrow's Schedule when End of Day) ---
function renderSchedule() {
  const timelineEl = document.getElementById("timeline");
  const scheduleTitleEl = document.getElementById("schedule-title");
  if (!timelineEl) return;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayKey = getDayKey(now);
  const todayData = TIMETABLE[todayKey] || { dayName: now.toLocaleDateString("en-US", { weekday: "long" }), items: [] };
  const todayItems = todayData.items || [];

  // Determine if all classes for today are completed (or if today is a day off)
  let isDayDone = false;
  if (todayItems.length === 0) {
    isDayDone = true;
  } else {
    const lastClass = todayItems[todayItems.length - 1];
    const { end } = parseTimeRange(lastClass.time);
    if (currentMinutes >= end) {
      isDayDone = true;
    }
  }

  // If today's classes have finished (or today is a free day), display tomorrow's schedule!
  const showingTomorrow = isDayDone;
  let targetKey = todayKey;
  let targetData = todayData;

  if (showingTomorrow) {
    targetKey = getNextDayKey(todayKey);
    targetData = TIMETABLE[targetKey] || { dayName: targetKey, items: [] };
  }

  if (scheduleTitleEl) {
    scheduleTitleEl.textContent = showingTomorrow ? "Tomorrow's Schedule" : "Today's Schedule";
  }

  const itemsToRender = targetData.items || [];

  if (itemsToRender.length === 0) {
    timelineEl.innerHTML = `
      <li class="tl-item" style="color: #7b7268; padding: 16px 8px; list-style: none; font-size: 13.5px;">
        No classes scheduled for ${showingTomorrow ? "tomorrow" : "today"} (${targetData.dayName || targetKey}).
      </li>`;
    return;
  }

  // Build unified entries (classes and break cutouts)
  const entries = [];
  itemsToRender.forEach((item, idx) => {
    entries.push({
      type: "class",
      item: item,
      classIndex: idx
    });

    if (idx < itemsToRender.length - 1) {
      const nextItem = itemsToRender[idx + 1];
      const currRange = parseTimeRange(item.time);
      const nextRange = parseTimeRange(nextItem.time);
      const breakMinutes = nextRange.start - currRange.end;

      if (breakMinutes > 0) {
        const breakStart = item.time.split(/–|-/)[1].trim();
        const breakEnd = nextItem.time.split(/–|-/)[0].trim();
        entries.push({
          type: "break",
          durationMinutes: breakMinutes,
          durationText: formatBreakDuration(breakMinutes),
          time: `${breakStart} – ${breakEnd}`,
          startMinutes: currRange.end,
          endMinutes: nextRange.start
        });
      }
    }
  });

  timelineEl.innerHTML = entries
    .map((entry, idx) => {
      if (entry.type === "break") {
        const isBreakCurrent = !showingTomorrow && currentMinutes >= entry.startMinutes && currentMinutes < entry.endMinutes;

        return `
          <li class="tl-item tl-item-break${isBreakCurrent ? " current-break" : ""}" style="--item-idx: ${idx};">
            <span class="tl-dot tl-dot-break"></span>
            <span class="tl-text tl-break-cutout">
              <span class="tl-content">
                <span class="tl-break-pill"><i class="fi fi-rr-coffee"></i> ${entry.durationText}</span>
                <span class="tl-break-time">${entry.time}</span>
                <span class="tl-break-label">${isBreakCurrent ? "Break in Progress" : "Recess / Free Time"}</span>
              </span>
            </span>
          </li>`;
      }

      const x = entry.item;
      const { start, end } = parseTimeRange(x.time);
      const isCurrent = !showingTomorrow && currentMinutes >= start && currentMinutes < end;

      const fullText = `${x.time} — ${x.subject} • ${x.room}`;
      return `
        <li class="tl-item${isCurrent ? " current" : ""}" style="--dot:${x.color}; --item-idx: ${idx};">
          <span class="tl-dot"></span>
          <span class="tl-text">
            <span class="tl-content">${fullText}</span>
          </span>
        </li>`;
    })
    .join("");

  checkTimelineMarquees();
}

function checkTimelineMarquees() {
  requestAnimationFrame(() => {
    document.querySelectorAll(".tl-text").forEach((el) => {
      const content = el.querySelector(".tl-content");
      if (!content) return;
      if (el.clientWidth === 0) return; // avoid zeroing when hidden

      // Exact overflow difference between text width and parent container
      const overflow = content.scrollWidth - el.clientWidth;
      if (overflow > 4) {
        el.classList.add("has-overflow");
        // Extra 14px cushion so the entire room name and last character are fully visible
        const targetDist = overflow + 14;
        el.style.setProperty("--marquee-dist", `-${targetDist}px`);

        // Natural smooth reading speed: ~60px per second, min 2s, max 5s
        const duration = Math.min(5, Math.max(2, (targetDist / 55).toFixed(2)));
        el.style.setProperty("--marquee-dur", `${duration}s`);
      } else {
        el.classList.remove("has-overflow");
        el.style.removeProperty("--marquee-dist");
        el.style.removeProperty("--marquee-dur");
      }
    });
  });
}

window.addEventListener("resize", () => {
  checkTimelineMarquees();
  checkDtlMarquees();
});

if (typeof ResizeObserver !== "undefined") {
  const ro = new ResizeObserver(() => {
    checkTimelineMarquees();
    checkDtlMarquees();
  });
  const dash = document.getElementById("dashboard-app");
  const tl = document.getElementById("timeline");
  const dtl = document.getElementById("detailed-timeline");
  if (dash) ro.observe(dash);
  if (tl) ro.observe(tl);
  if (dtl) ro.observe(dtl);
}

// --- Render Detailed Schedule in #view-schedule ---
function renderDetailedSchedule(dayKey = currentSelectedDay) {
  const dayData = TIMETABLE[dayKey] || TIMETABLE["Mon"];
  const detailedEl = document.getElementById("detailed-timeline");
  const subheadingEl = document.getElementById("detailed-sched-subheading");

  const now = new Date();
  const todayKey = getDayKey(now);
  const isActualToday = dayKey === todayKey;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (subheadingEl) {
    const grpName = currentActiveScheduleGroup === "grp2" ? "2ANG-AFF 2" : "2ANG-AFF 1";
    subheadingEl.innerHTML = `${dayData.dayName}'s Schedule (${dayData.dateLabel}) — <span style="font-weight: 500; font-size: 14.5px; color: #786e63;">Groupe: ${grpName}</span>`;
  }

  if (!detailedEl) return;

  if (dayData.items.length === 0) {
    detailedEl.innerHTML = `
      <div class="dtl-empty-card">
        <svg viewBox="0 0 48 48" class="dtl-empty-icon" fill="none" stroke="#a09485" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="24" cy="24" r="20" stroke="#d5cbbb" stroke-width="2.2" class="sm-ring" />
          <path d="M16 28 C20 34, 28 34, 32 28" class="sm-mouth" />
          <circle cx="18" cy="20" r="2.2" fill="#a09485" stroke="none" class="sm-eye sm-eye-left" />
          <circle cx="30" cy="20" r="2.2" fill="#a09485" stroke="none" class="sm-eye sm-eye-right" />
        </svg>
        <p class="dtl-empty-title">No classes scheduled on ${dayData.dayName}</p>
        <p class="dtl-empty-desc">Enjoy your weekend or use this time for study review!</p>
      </div>`;
    return;
  }

  // Build unified timeline entries (classes and dynamic inter-class break cutouts)
  const entries = [];
  dayData.items.forEach((item, idx) => {
    entries.push({
      type: "class",
      item: item,
      classIndex: idx
    });

    if (idx < dayData.items.length - 1) {
      const nextItem = dayData.items[idx + 1];
      const currRange = parseTimeRange(item.time);
      const nextRange = parseTimeRange(nextItem.time);
      const breakMinutes = nextRange.start - currRange.end;

      if (breakMinutes > 0) {
        const breakStart = item.time.split(/–|-/)[1].trim();
        const breakEnd = nextItem.time.split(/–|-/)[0].trim();
        entries.push({
          type: "break",
          durationMinutes: breakMinutes,
          durationText: formatBreakDuration(breakMinutes),
          time: `${breakStart} – ${breakEnd}`,
          startMinutes: currRange.end,
          endMinutes: nextRange.start
        });
      }
    }
  });

  const totalEntries = entries.length;
  detailedEl.innerHTML = entries
    .map((entry, idx) => {
      const isLast = idx === totalEntries - 1;

      if (entry.type === "break") {
        let isBreakActive = false;
        if (isActualToday) {
          isBreakActive = currentMinutes >= entry.startMinutes && currentMinutes < entry.endMinutes;
        }

        return `
          <div class="dtl-row dtl-row-break${isBreakActive ? " dtl-break-active" : ""}" style="--row-idx: ${idx};">
            <div class="dtl-side-connector dtl-break-connector">
              <div class="dtl-node-box dtl-break-node">
                ${getSubjectIcon("break")}
              </div>
              <svg class="svg-branch-line" viewBox="0 0 20 6" fill="none">
                <path d="M 1 2.9 L 5.5 3.1 M 8.5 2.9 L 13.5 3.0 M 16.5 3.1 L 20 2.9" stroke="#786f63" stroke-width="1.8" stroke-linecap="round" />
              </svg>
              ${
                !isLast
                  ? `<svg class="svg-stem-down" viewBox="0 0 8 46" fill="none">
                       <path d="M 4 2.5 L 3.9 8.1 
                                M 4.1 13.1 L 3.8 19.3 
                                M 4.2 24.3 L 4.0 30.9 
                                M 3.9 35.9 L 4.1 42.5" stroke="#786f63" stroke-width="1.8" stroke-linecap="round" />
                     </svg>`
                  : ""
              }
            </div>
            <div class="dtl-card dtl-break-card">
              <div class="dtl-break-info">
                <span class="break-pill-tag">☕ ${entry.durationText}</span>
                <span class="dtl-dash">—</span>
                <span class="dtl-time break-time">${entry.time}</span>
                <span class="dtl-bullet">•</span>
                <span class="break-status-note">${isBreakActive ? "Break in Progress" : "Recess / Free Time"}</span>
              </div>
              <div class="dtl-break-badge-wrap">
                <span class="break-cutout-tag">Empty Slot</span>
              </div>
            </div>
          </div>
        `;
      }

      const item = entry.item;
      let isActive = false;
      if (isActualToday) {
        const { start, end } = parseTimeRange(item.time);
        isActive = currentMinutes >= start && currentMinutes < end;
      }

      const sideConnectorHTML = `
        <div class="dtl-side-connector">
          ${
            isActive
              ? `<div class="dtl-node-box pulse-node-box">
                   <span class="pulse-aura"></span>
                   <span class="pulse-center"></span>
                 </div>`
              : `<div class="dtl-node-box">
                   ${getSubjectIcon(item.icon)}
                 </div>`
          }
          <svg class="svg-branch-line" viewBox="0 0 20 6" fill="none">
            <path d="M 1 2.9 L 5.5 3.1 M 8.5 2.9 L 13.5 3.0 M 16.5 3.1 L 20 2.9" stroke="#4a423a" stroke-width="2" stroke-linecap="round" />
          </svg>
          ${
            !isLast
              ? `<svg class="svg-stem-down" viewBox="0 0 8 46" fill="none">
                   <path d="M 4 2.5 L 3.9 8.1 
                            M 4.1 13.1 L 3.8 19.3 
                            M 4.2 24.3 L 4.0 30.9 
                            M 3.9 35.9 L 4.1 42.5" stroke="#4a423a" stroke-width="2" stroke-linecap="round" />
                 </svg>`
              : ""
          }
        </div>
      `;

      if (isActive) {
        return `
          <div class="dtl-row dtl-row-active" style="--row-idx: ${idx};">
            ${sideConnectorHTML}
            <div class="dtl-card active-card">
              <svg class="doodle-sound-left" viewBox="0 0 24 24" fill="none">
                <path d="M5 21 C 2 13, 8 5, 20 2" stroke="#df8e66" stroke-width="2.2" stroke-linecap="round" />
                <path d="M12 23 C 9 17, 13 10, 22 7" stroke="#df8e66" stroke-width="2.2" stroke-linecap="round" />
              </svg>
              <svg class="doodle-sound-right" viewBox="0 0 24 24" fill="none">
                <path d="M19 21 C 22 13, 16 5, 4 2" stroke="#df8e66" stroke-width="2.2" stroke-linecap="round" />
                <path d="M12 23 C 15 17, 11 10, 2 7" stroke="#df8e66" stroke-width="2.2" stroke-linecap="round" />
              </svg>

              <div class="dtl-active-inner">
                <div class="dtl-active-top">
                  <div class="dtl-info-wrap">
                    <div class="dtl-main-info dtl-slide-content">
                      <span class="dtl-subject">${item.subject}</span>
                    </div>
                  </div>
                </div>
                <div class="dtl-active-meta-row">
                  <span class="active-now-tag">Active Now</span>
                  <span class="active-meta-room">${item.room}</span>
                  <span class="meta-pipe">|</span>
                  <span class="active-timespan">${item.time}</span>
                </div>
              </div>
              <div class="dtl-active-right-art">
                <svg viewBox="0 0 54 40" class="sched-open-book-svg" fill="none">
                  <path d="M27 34 C19 32 9 32 2 34 L2 10 C9 8 19 8 27 10 C35 8 45 8 52 10 L52 34 C45 32 35 32 27 34 Z" fill="#9cb7cb" stroke="#25211e" stroke-width="1.8" stroke-linejoin="round"/>
                  <path d="M27 31 C19 29 10 29 4 31 L4 8 C10 6 19 6 27 8 Z" fill="#ffffff" stroke="#25211e" stroke-width="1.6" stroke-linejoin="round"/>
                  <path d="M27 31 C35 29 44 29 50 31 L50 8 C44 6 35 6 27 8 Z" fill="#ffffff" stroke="#25211e" stroke-width="1.6" stroke-linejoin="round"/>
                  <line x1="27" y1="8" x2="27" y2="31" stroke="#25211e" stroke-width="1.8" stroke-linecap="round"/>
                  <rect x="8" y="11" width="7" height="6" rx="1" fill="#e8cfbf" stroke="#25211e" stroke-width="1" />
                  <line x1="18" y1="13" x2="23" y2="13" stroke="#25211e" stroke-width="1.2" stroke-linecap="round"/>
                  <line x1="8" y1="21" x2="23" y2="21" stroke="#25211e" stroke-width="1.2" stroke-linecap="round"/>
                  <line x1="8" y1="25" x2="20" y2="25" stroke="#25211e" stroke-width="1.2" stroke-linecap="round"/>
                  <line x1="31" y1="13" x2="46" y2="13" stroke="#25211e" stroke-width="1.2" stroke-linecap="round"/>
                  <line x1="31" y1="17" x2="46" y2="17" stroke="#25211e" stroke-width="1.2" stroke-linecap="round"/>
                  <line x1="31" y1="21" x2="46" y2="21" stroke="#25211e" stroke-width="1.2" stroke-linecap="round"/>
                  <line x1="31" y1="25" x2="43" y2="25" stroke="#25211e" stroke-width="1.2" stroke-linecap="round"/>
                </svg>
                <span class="active-prof-name" dir="rtl">${item.prof}</span>
              </div>
            </div>
          </div>
        `;
      }

      return `
        <div class="dtl-row" style="--row-idx: ${idx};">
          ${sideConnectorHTML}
          <div class="dtl-card standard-card">
            <div class="dtl-info-wrap">
              <div class="dtl-main-info dtl-slide-content">
                <span class="dtl-time">${item.time}</span>
                <span class="dtl-dash">—</span>
                <span class="dtl-subject">${item.subject}</span>
                <span class="dtl-bullet">•</span>
                <span class="dtl-room">${item.room}</span>
              </div>
            </div>
            <div class="dtl-prof-info">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="#2b2623" stroke-width="1.6" stroke-linecap="round">
                <circle cx="10" cy="6" r="3.2" fill="#ffd8c2" stroke="#2b2623"/>
                <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" />
              </svg>
              <span class="dtl-prof-name" dir="rtl">${item.prof}</span>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  checkDtlMarquees();
}

function checkDtlMarquees() {
  requestAnimationFrame(() => {
    document.querySelectorAll(".dtl-info-wrap").forEach((wrap) => {
      const content = wrap.querySelector(".dtl-slide-content");
      if (!content) return;
      if (wrap.clientWidth === 0) return;

      const overflow = content.scrollWidth - wrap.clientWidth;
      if (overflow > 2) {
        wrap.classList.add("has-overflow");
        const targetDist = overflow;
        wrap.style.setProperty("--slide-dist", `-${targetDist}px`);
        const duration = Math.min(5, Math.max(1.8, (targetDist / 45).toFixed(2)));
        wrap.style.setProperty("--slide-dur", `${duration}s`);
      } else {
        wrap.classList.remove("has-overflow");
        wrap.style.removeProperty("--slide-dist");
        wrap.style.removeProperty("--slide-dur");
      }
    });
  });
}

// --- Today's date in header ---
function renderDate() {
  const now = new Date();
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
  const month = now.toLocaleDateString("en-US", { month: "short" });
  const dateEl = document.getElementById("today-date");
  if (dateEl) {
    dateEl.textContent = `${weekday}, ${month} ${now.getDate()}, ${now.getFullYear()}`;
  }
}

// --- Sidebar navigation & View switching ---
function switchView(page) {
  const performSwitch = () => {
    const viewHome = document.getElementById("view-home");
    const viewSchedule = document.getElementById("view-schedule");
    const viewSubjects = document.getElementById("view-subjects");
    const viewHomeworks = document.getElementById("view-homeworks");
    const viewProfile = document.getElementById("view-profile");
    const viewChat = document.getElementById("view-chat");
    const viewApprovals = document.getElementById("view-approvals");
    const hwNote = document.getElementById("sticky-homework-note");
    const subjectsSide = document.getElementById("subjects-side-wrap");
    const homeworksSide = document.getElementById("homeworks-side-wrap");
    const mainEl = document.querySelector(".main");

    // Hide all view panels first
    if (viewHome) viewHome.classList.add("view-hidden");
    if (viewSchedule) viewSchedule.classList.add("view-hidden");
    if (viewSubjects) viewSubjects.classList.add("view-hidden");
    if (viewHomeworks) viewHomeworks.classList.add("view-hidden");
    if (viewProfile) viewProfile.classList.add("view-hidden");
    if (viewChat) viewChat.classList.add("view-hidden");
    if (viewApprovals) viewApprovals.classList.add("view-hidden");

    if (mainEl) {
      mainEl.setAttribute("data-current-page", page || "home");
    }

    // Toggle Subjects icon between regular outline and solid filled
    const subjIcon = document.querySelector("#nav-subjects i");
    if (subjIcon) {
      if (page === "subjects") {
        subjIcon.classList.remove("fi-rr-books");
        subjIcon.classList.add("fi-sr-books");
      } else {
        subjIcon.classList.remove("fi-sr-books");
        subjIcon.classList.add("fi-rr-books");
      }
    }

    // Toggle Chat icon between regular outline and solid filled
    const chatIcon = document.getElementById("nav-chat-icon");
    if (chatIcon) {
      if (page === "chat") {
        chatIcon.classList.remove("fi-rr-comment-alt-dots");
        chatIcon.classList.add("fi-sr-comment-alt-dots");
      } else {
        chatIcon.classList.remove("fi-sr-comment-alt-dots");
        chatIcon.classList.add("fi-rr-comment-alt-dots");
      }
    }

    if (page === "schedule") {
      if (viewSchedule) viewSchedule.classList.remove("view-hidden");
      if (mainEl) mainEl.classList.add("on-schedule-view");
      if (hwNote) hwNote.classList.remove("view-hidden");
      if (subjectsSide) subjectsSide.classList.add("view-hidden");
      if (homeworksSide) homeworksSide.classList.add("view-hidden");
      renderDetailedSchedule(currentSelectedDay);
    } else if (page === "subjects") {
      if (viewSubjects) viewSubjects.classList.remove("view-hidden");
      if (mainEl) mainEl.classList.remove("on-schedule-view");
      // In subjects view: show notes.png paperclip note & hide homework pin note
      if (hwNote) hwNote.classList.add("view-hidden");
      if (subjectsSide) subjectsSide.classList.remove("view-hidden");
      if (homeworksSide) homeworksSide.classList.add("view-hidden");
      renderSubjectsView();
    } else if (page === "homeworks") {
      if (viewHomeworks) viewHomeworks.classList.remove("view-hidden");
      if (mainEl) mainEl.classList.remove("on-schedule-view");
      if (hwNote) hwNote.classList.add("view-hidden");
      if (subjectsSide) subjectsSide.classList.add("view-hidden");
      if (homeworksSide) homeworksSide.classList.remove("view-hidden");
      renderHomeworksView();
    } else if (page === "profile") {
      const viewProfile = document.getElementById("view-profile");
      if (viewProfile) viewProfile.classList.remove("view-hidden");
      if (mainEl) mainEl.classList.remove("on-schedule-view");
      if (hwNote) hwNote.classList.remove("view-hidden");
      if (subjectsSide) subjectsSide.classList.add("view-hidden");
      if (homeworksSide) homeworksSide.classList.add("view-hidden");
      renderProfileView();
    } else if (page === "approvals") {
      if (viewApprovals) viewApprovals.classList.remove("view-hidden");
      if (mainEl) mainEl.classList.remove("on-schedule-view");
      if (hwNote) hwNote.classList.add("view-hidden");
      if (subjectsSide) subjectsSide.classList.add("view-hidden");
      if (homeworksSide) homeworksSide.classList.add("view-hidden");
      renderTeacherApprovalsView();
    } else if (page === "chat") {
      if (viewChat) viewChat.classList.remove("view-hidden");
      if (mainEl) mainEl.classList.remove("on-schedule-view");
      // Completely hide homework note, search bar, and side cards in Chat view
      if (hwNote) hwNote.classList.add("view-hidden");
      if (subjectsSide) subjectsSide.classList.add("view-hidden");
      if (homeworksSide) homeworksSide.classList.add("view-hidden");
      if (typeof onChatViewOpened === "function") {
        onChatViewOpened();
      }
    } else {
      // Default Home view: homework note stays as is
      if (viewHome) viewHome.classList.remove("view-hidden");
      if (mainEl) mainEl.classList.remove("on-schedule-view");
      if (hwNote) hwNote.classList.remove("view-hidden");
      if (subjectsSide) subjectsSide.classList.add("view-hidden");
      if (homeworksSide) homeworksSide.classList.add("view-hidden");
      updateTodayStatus();
      renderSchedule();
    }

    // Re-apply any active search filter to freshly displayed view
    if (typeof reapplySearchFilter === "function") {
      reapplySearchFilter();
    }
  };

  if (document.startViewTransition) {
    document.startViewTransition(() => performSwitch());
  } else {
    performSwitch();
  }
}

function initSubjectFilters() {
  const filterBtns = document.querySelectorAll(".subj-filter-pill");
  if (!filterBtns.length) return;
  const cards = document.querySelectorAll(".bento-subject-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter || "all";

      cards.forEach((card, idx) => {
        const cat = card.dataset.category || "core";
        if (filter === "all" || cat === filter) {
          card.style.display = "flex";
          card.style.animation = `dtl-stagger-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.05}s forwards`;
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}

function initNav() {
  const sidebar = document.querySelector(".sidebar");
  const sidebarBackdrop = document.getElementById("sidebar-backdrop");
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");

  const closeMobileSidebar = () => {
    if (sidebar) sidebar.classList.remove("mobile-open");
    if (sidebarBackdrop) sidebarBackdrop.classList.remove("active");
  };

  const toggleMobileSidebar = () => {
    if (sidebar) sidebar.classList.toggle("mobile-open");
    if (sidebarBackdrop) sidebarBackdrop.classList.toggle("active");
  };

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMobileSidebar();
    });
  }

  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener("click", () => {
      closeMobileSidebar();
    });
  }

  const items = document.querySelectorAll(".nav-item");
  items.forEach((item) =>
    item.addEventListener("click", (e) => {
      e.preventDefault();
      items.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      const page = item.dataset.page || "home";
      switchView(page);
      closeMobileSidebar();
    })
  );

  // Weekly day card click interaction (Schedule view only - never alters Home schedule)
  const dayCards = document.querySelectorAll(".week-paper-card");
  dayCards.forEach((card) => {
    card.addEventListener("click", () => {
      dayCards.forEach((c) => c.classList.remove("active-day"));
      card.classList.add("active-day");
      currentSelectedDay = card.dataset.day || "Mon";
      renderDetailedSchedule(currentSelectedDay);
      if (typeof reapplySearchFilter === "function") {
        reapplySearchFilter();
      }
    });
  });

  // Clicking pinned homework note on home view navigates to Homeworks view
  const hwHeader = document.querySelector("#sticky-homework-note .sticky-header");
  if (hwHeader) {
    hwHeader.style.cursor = "pointer";
    hwHeader.addEventListener("click", () => {
      items.forEach((i) => i.classList.remove("active"));
      const navHw = document.getElementById("nav-homeworks");
      if (navHw) navHw.classList.add("active");
      switchView("homeworks");
      closeMobileSidebar();
    });
  }

  // Clicking sidebar user card (avatar or name) navigates to Profile & Admin view
  const sidebarUserCard = document.getElementById("sidebar-user-card");
  if (sidebarUserCard) {
    sidebarUserCard.addEventListener("click", (e) => {
      // Don't trigger if logout button was clicked
      if (e.target.closest("#btn-sidebar-logout")) return;
      items.forEach((i) => i.classList.remove("active"));
      const navProf = document.getElementById("nav-profile");
      if (navProf) navProf.classList.add("active");
      switchView("profile");
      closeMobileSidebar();
    });
  }

  // Dynamic slide-out on scroll down, slide-in on scroll up for mobile top bar
  const mobileTopBar = document.getElementById("mobile-top-bar");
  if (mobileTopBar) {
    let lastScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    let ticking = false;

    const onScroll = () => {
      const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const mobileSearchWrap = document.getElementById("mobile-search-expand-wrap");
      const isSearchOpen = mobileSearchWrap && mobileSearchWrap.classList.contains("open");
      const isSidebarOpen = sidebar && sidebar.classList.contains("mobile-open");

      // Always keep visible if drawer or search input is open
      if (isSearchOpen || isSidebarOpen) {
        mobileTopBar.classList.remove("nav-hidden");
        lastScrollY = currentScrollY;
        ticking = false;
        return;
      }

      const diff = currentScrollY - lastScrollY;

      // Scroll Down (threshold of 8px to prevent jitter) -> slide out
      if (diff > 8 && currentScrollY > 60) {
        mobileTopBar.classList.add("nav-hidden");
      }
      // Scroll Up -> slide back in immediately
      else if (diff < -8 || currentScrollY <= 15) {
        mobileTopBar.classList.remove("nav-hidden");
      }

      lastScrollY = Math.max(0, currentScrollY);
      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });
  }
}

// --- Homework & Reminders Manager (Server-Synced via Firestore, Auth-Protected, No Hardcoded Tasks) ---
const HW_KEY = "quill-q-homework-reminders-v8";
const DEFAULT_TASKS = [];

let currentTasks = [];
let tasksUnsubscribe = null;

function isTaskDueReached(task) {
  if (!task || !task.due) return false;

  // 1. If ISO date string YYYY-MM-DD
  const m = String(task.due).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const endOfDay = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10), 23, 59, 59, 999);
    return Date.now() > endOfDay.getTime();
  }

  // 2. If parseable by Date()
  const d = new Date(task.due);
  if (!isNaN(d.getTime())) {
    if (d.getHours() === 0 && d.getMinutes() === 0) {
      d.setHours(23, 59, 59, 999);
    }
    return Date.now() > d.getTime();
  }

  // 3. If text format like "Due Mon, Oct 26"
  const cleaned = String(task.due).replace(/^due\s*/i, "").trim();
  const withYear = new Date(`${cleaned}, ${new Date().getFullYear()}`);
  if (!isNaN(withYear.getTime())) {
    withYear.setHours(23, 59, 59, 999);
    return Date.now() > withYear.getTime();
  }

  return false;
}

function isMyTask(task) {
  if (!task) return false;
  const myUid = currentUser ? currentUser.uid : (currentProfile ? currentProfile.uid : null);
  return !!(myUid && task.userId && task.userId === myUid);
}

function isTaskCompletedByMe(task) {
  if (!task) return false;
  const myUid = currentUser ? currentUser.uid : (currentProfile ? currentProfile.uid : null);
  if (myUid && task.completedBy && typeof task.completedBy[myUid] !== "undefined") {
    return !!task.completedBy[myUid];
  }
  return !!task.completed;
}

function getStoredTasks() {
  return currentTasks.filter((t) => !isTaskDueReached(t));
}

let isFirstHomeworkSnapshot = true;
const locallyCreatedTaskIds = new Set();

let sharedAudioCtx = null;

function getSharedAudioContext() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
    sharedAudioCtx = new AudioCtx();
  }
  return sharedAudioCtx;
}

// Unlock audio on first user touch/click (essential for iOS Safari and mobile Chrome)
function unlockAudioOnMobile() {
  const unlock = () => {
    const ctx = getSharedAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().then(() => {
        document.removeEventListener("touchstart", unlock);
        document.removeEventListener("touchend", unlock);
        document.removeEventListener("click", unlock);
      }).catch(() => {});
    } else if (ctx && ctx.state === "running") {
      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("touchend", unlock);
      document.removeEventListener("click", unlock);
    }
  };
  document.addEventListener("touchstart", unlock, { passive: true });
  document.addEventListener("touchend", unlock, { passive: true });
  document.addEventListener("click", unlock, { passive: true });
}

function playNotificationChime() {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;
    
    // Harmonic note 1 (D5 -> A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.55);

    // Harmonic note 2 (A5 -> D6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(880, now + 0.08);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.22);
    gain2.gain.setValueAtTime(0.08, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.7);
  } catch (e) {
    // Autoplay restrictions or audio unsupported
  }
}

function isIOSDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isStandalonePWA() {
  return window.navigator.standalone === true || 
    window.matchMedia('(display-mode: standalone)').matches;
}

function showInAppToast(data) {
  const container = document.getElementById("inapp-toast-container");
  if (!container || !data) return;

  // Check if caller passed a homework/reminder task or a general notification object
  const isTask = !!(data.desc || data.due || data.subject);
  let typeClass = "toast-info";
  let badgeText = "Notification";
  let iconHtml = '<i class="fi fi-rr-bell"></i>';
  let title = data.title || "Notification";
  let desc = data.message || data.desc || "";
  let metaHtml = "";
  let isNavigatableToHw = false;

  if (isTask) {
    const isReminder = data.type === "reminder";
    typeClass = isReminder ? "toast-rem" : "toast-hw";
    badgeText = isReminder ? "Reminder" : (data.subject || "Homework");
    iconHtml = `<i class="fi ${isReminder ? "fi-rr-bookmark" : "fi-rr-book-alt"}"></i>`;
    const author = data.userName || "Classmate";
    const isMine = isMyTask(data);
    title = isReminder 
      ? (isMine ? "📌 Reminder Added" : "📌 New Reminder")
      : (isMine ? `📚 Homework Added: ${escapeHtml(data.subject || "General")}` : `📚 New Homework: ${escapeHtml(data.subject || "General")}`);
    desc = data.desc || "";
    metaHtml = `<div class="inapp-toast-meta">By ${escapeHtml(author)}${isMine ? ' (You)' : ''} • Due ${escapeHtml(formatDueDisplay(data.due))}</div>`;
    isNavigatableToHw = true;
  } else {
    // Custom alert/toast (e.g. Chat, Connection, Error, Warning)
    const toastType = data.type || "info";
    if (toastType === "error") {
      typeClass = "toast-error";
      badgeText = "Error";
      iconHtml = '<i class="fi fi-rr-cross-circle"></i>';
    } else if (toastType === "warning") {
      typeClass = "toast-warning";
      badgeText = "Notice";
      iconHtml = '<i class="fi fi-rr-info"></i>';
    } else if (toastType === "chat") {
      typeClass = "toast-chat";
      badgeText = "Class Chat";
      iconHtml = '<i class="fi fi-rr-comment-alt-dots"></i>';
    } else if (toastType === "exercise") {
      typeClass = "toast-exercise";
      badgeText = data.badge || "Exercise";
      iconHtml = '<i class="fi fi-rr-edit"></i>';
    } else if (toastType === "approval") {
      typeClass = "toast-warning";
      badgeText = data.badge || "Approval Request";
      iconHtml = '<i class="fi fi-rr-user-add"></i>';
    } else if (toastType === "doc") {
      typeClass = "toast-doc";
      badgeText = data.badge || "Document";
      iconHtml = '<i class="fi fi-rr-document"></i>';
    } else {
      typeClass = "toast-info";
      badgeText = data.badge || "Notice";
      iconHtml = data.icon || '<i class="fi fi-rr-comment-alt-dots"></i>';
    }
    if (data.meta) {
      metaHtml = `<div class="inapp-toast-meta">${escapeHtml(data.meta)}</div>`;
    }
  }

  const toast = document.createElement("div");
  toast.className = `inapp-toast ${typeClass}`;
  toast.setAttribute("role", "alert");
  toast.innerHTML = `
    <div class="inapp-toast-icon-wrap">
      ${iconHtml}
    </div>
    <div class="inapp-toast-body">
      <div class="inapp-toast-header">
        <span class="inapp-toast-badge">${escapeHtml(badgeText)}</span>
      </div>
      <div class="inapp-toast-title">${title}</div>
      ${desc ? `<div class="inapp-toast-desc">${escapeHtml(desc)}</div>` : ''}
      ${metaHtml}
    </div>
    <button type="button" class="inapp-toast-close" aria-label="Dismiss">&times;</button>
  `;

  // Clicking toast opens appropriate section
  toast.addEventListener("click", (e) => {
    if (e.target.closest(".inapp-toast-close")) return;
    if (isNavigatableToHw) {
      const items = document.querySelectorAll(".nav-item");
      items.forEach((i) => i.classList.remove("active"));
      const navHw = document.getElementById("nav-homeworks");
      if (navHw) navHw.classList.add("active");
      switchView("homeworks");
    } else if (data.type === "chat") {
      const items = document.querySelectorAll(".nav-item");
      items.forEach((i) => i.classList.remove("active"));
      const navChat = document.getElementById("nav-chat");
      if (navChat) navChat.classList.add("active");
      switchView("chat");
    } else if (data.type === "approval" || data.targetView === "approvals") {
      const items = document.querySelectorAll(".nav-item");
      items.forEach((i) => i.classList.remove("active"));
      const navApprovals = document.getElementById("nav-approvals");
      if (navApprovals) navApprovals.classList.add("active");
      switchView("approvals");
    } else if (data.type === "doc" || data.type === "exercise") {
      if (data.url) {
        window.location.href = data.url;
      } else if (data.subjectId) {
        window.location.href = `subject.html?id=${encodeURIComponent(data.subjectId)}`;
      }
    }
    closeToast();
  });

  const closeBtn = toast.querySelector(".inapp-toast-close");
  const closeToast = () => {
    toast.classList.add("is-leaving");
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 240);
  };

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeToast();
    });
  }

  // Auto-dismiss after 6.5s
  setTimeout(closeToast, 6500);

  container.appendChild(toast);
}

// Register Service Worker for mobile device notifications (Android & iOS PWA)
async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register("./firebase-messaging-sw.js");
    console.log("Quill-Q Service Worker registered:", reg.scope);

    // Listen for navigation messages sent when user taps on mobile notification
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "NAVIGATE_VIEW") {
        const view = event.data.view;
        if (view) {
          const navItem = document.getElementById(`nav-${view}`);
          if (navItem) {
            document.querySelectorAll(".nav-item").forEach((i) => i.classList.remove("active"));
            navItem.classList.add("active");
          }
          switchView(view);
        }
      }
    });
  } catch (err) {
    console.warn("Service Worker registration failed:", err);
  }
}

// Universal notification dispatcher (supports mobile Service Worker + desktop Notification fallback)
async function sendSystemNotification(title, options = {}, onClick = null) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const defaultOptions = {
    icon: "assets/icon-192.png",
    badge: "assets/favicon-32x32-light.png",
    ...options
  };

  // 1. Try Service Worker showNotification first (Required for Android & iOS PWA)
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && typeof reg.showNotification === "function") {
        await reg.showNotification(title, defaultOptions);
        return;
      }
    } catch (swErr) {
      console.warn("ServiceWorker showNotification failed, trying fallback:", swErr);
    }
  }

  // 2. Desktop fallback: new Notification() constructor
  try {
    const notif = new Notification(title, defaultOptions);
    if (onClick && typeof onClick === "function") {
      notif.onclick = (e) => {
        window.focus();
        onClick(e);
        try { notif.close(); } catch (err) {}
      };
    }
  } catch (notifErr) {
    console.warn("Direct Notification constructor failed:", notifErr);
  }
}

function showBrowserNotification(task) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  try {
    const isReminder = task.type === "reminder";
    const isMine = isMyTask(task);
    const title = isReminder 
      ? (isMine ? "📌 Reminder Added" : "📌 New Study Reminder")
      : (isMine ? `📚 Homework Added: ${task.subject || "General"}` : `📚 New Homework: ${task.subject || "General"}`);
    const author = task.userName || "Classmate";
    const body = `"${task.desc}"\nBy ${author}${isMine ? ' (You)' : ''} • Due ${formatDueDisplay(task.due)}`;

    sendSystemNotification(title, {
      body: body,
      icon: "assets/icon-192.png",
      badge: "assets/favicon-32x32-light.png",
      tag: "quill-task-" + (task.id || Date.now()),
      data: {
        url: "./index.html",
        targetView: "homeworks"
      }
    }, () => {
      const items = document.querySelectorAll(".nav-item");
      items.forEach((i) => i.classList.remove("active"));
      const navHw = document.getElementById("nav-homeworks");
      if (navHw) navHw.classList.add("active");
      switchView("homeworks");
    });
  } catch (e) {
    console.warn("Browser notification dispatch failed:", e);
  }
}

function triggerNewTaskNotification(task) {
  playNotificationChime();
  showInAppToast(task);
  showBrowserNotification(task);
}

function updateNotificationUIState() {
  const section = document.getElementById("home-notif-section");
  const btn = document.getElementById("btn-enable-notifs");
  const text = document.getElementById("btn-enable-notifs-text");

  if (!section) return;

  // If notifications are not supported by the browser: hide grid
  if (!("Notification" in window)) {
    if (isIOSDevice() && !isStandalonePWA()) {
      // Keep visible so iOS user can see setup guide
      section.style.display = "";
    } else {
      section.style.display = "none";
    }
    return;
  }

  // If permission is already granted (ACTIVE): cleanly remove/hide notification grid!
  if (Notification.permission === "granted") {
    section.style.display = "none";
    return;
  }

  // If NOT active (default) or BLOCKED (denied): show the grid again so user can activate or unblock
  section.style.display = "";
  if (text) {
    if (Notification.permission === "denied") {
      text.textContent = "Unblock in Settings";
    } else {
      text.textContent = "Enable Notifications";
    }
  }
}

function openIosPwaModal() {
  const modal = document.getElementById("ios-pwa-modal");
  if (modal) modal.classList.remove("view-hidden");
}

function closeIosPwaModal() {
  const modal = document.getElementById("ios-pwa-modal");
  if (modal) modal.classList.add("view-hidden");
}

// Helper to request notification permission supporting both Promises and older callback syntax
async function askNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  try {
    const p = Notification.requestPermission();
    if (p && typeof p.then === "function") {
      return await p;
    }
  } catch (e) {}
  return new Promise((resolve) => {
    try {
      Notification.requestPermission((res) => resolve(res));
    } catch (e) {
      resolve(Notification.permission || "default");
    }
  });
}

async function requestNotificationAccess() {
  // If user is on an iOS device (iPhone/iPad) and NOT running in standalone PWA mode
  if (isIOSDevice() && !isStandalonePWA()) {
    openIosPwaModal();
    return;
  }

  if (!("Notification" in window)) {
    if (isIOSDevice()) {
      openIosPwaModal();
    } else {
      await showCustomAlert("This browser does not support web notifications.", "Notice", '<i class="fi fi-rr-info"></i>');
    }
    return;
  }

  if (Notification.permission === "denied") {
    await showCustomAlert(
      "Notifications are blocked in your browser settings. Please click the tune/padlock icon in your address bar to allow notifications for Quill-Q.",
      "Permission Needed",
      '<i class="fi fi-rr-settings"></i>'
    );
    return;
  }

  try {
    const permission = await askNotificationPermission();
    updateNotificationUIState();
    if (permission === "granted") {
      playNotificationChime();
      await sendSystemNotification("🔔 Live Notifications Enabled!", {
        body: "Quill-Q is ready. You will receive live homework and chat alerts on this device.",
        tag: "quill-welcome"
      });

      // Register device FCM push token into Firestore subscribers list
      await registerDeviceFCMToken();

      await showCustomAlert("Notifications enabled successfully on this device!", "All Set", '<i class="fi fi-rr-bell-ring"></i>');
    }
  } catch (err) {
    console.warn("Notification request permission failed:", err);
  }
}

// Universal background push notification dispatcher
async function broadcastPushNotification({ title, body, url, targetView, tag, targetGroup, targetRole }) {
  const endpoint = (typeof firebaseConfig !== "undefined" && firebaseConfig.pushEndpoint)
    ? firebaseConfig.pushEndpoint
    : "https://quill-push-dispatcher.dodchadam.workers.dev";

  if (!endpoint) return;

  try {
    const user = currentUser || (typeof firebase !== "undefined" && firebase.auth && firebase.auth().currentUser);
    const profile = currentProfile;
    const defaultGroup = targetGroup || (profile ? getUserGroup(profile) : "grp1");
    const isApproval = (targetView === "approvals");

    // Resolve full absolute URL with subpath so GitHub Pages never 404s
    let resolvedUrl = url || "./index.html";
    if (typeof window !== "undefined" && window.location) {
      try {
        const base = window.location.href.split("?")[0].split("#")[0];
        const parsed = new URL(resolvedUrl, base);
        if (targetView && targetView !== "home" && !parsed.searchParams.has("view") && !parsed.pathname.includes(".html#")) {
          parsed.searchParams.set("view", targetView);
        }
        resolvedUrl = parsed.href;
      } catch (e) {
        resolvedUrl = window.location.href;
      }
    }

    const payload = {
      title: title || "Quill-Q Notification",
      body: body || "",
      url: resolvedUrl,
      targetView: targetView || "home",
      targetGroup: isApproval ? null : defaultGroup,
      targetRole: targetRole || (isApproval ? "teacher" : null),
      tag: tag || ("quill-" + Date.now()),
      senderId: user ? user.uid : null,
      senderName: user ? (user.displayName || null) : null
    };

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch((err) => console.warn("Push dispatch error:", err));
  } catch (e) {
    console.warn("Could not dispatch push notification:", e);
  }
}

// Registers this device's FCM push token in Firestore under /users/{uid}/fcmTokens
async function registerDeviceFCMToken() {
  if (typeof firebase === "undefined" || typeof firebase.messaging !== "function") return;
  try {
    const messaging = firebase.messaging();
    const vKey = (typeof firebaseConfig !== "undefined" && firebaseConfig.vapidKey)
      ? firebaseConfig.vapidKey
      : "BFYzADoTQ1yCuaWyT00HXmt06FFxJ1xgW8Af7xrskV3-i51JYoL6idPnTnPqZAMRuyMl6D5tYebZ5ZWGmGcIyYw";

    let serviceWorkerRegistration = null;
    if ("serviceWorker" in navigator) {
      try {
        serviceWorkerRegistration = await navigator.serviceWorker.register('./firebase-messaging-sw.js');
      } catch (e) {
        serviceWorkerRegistration = await navigator.serviceWorker.ready;
      }
    }

    const currentToken = await messaging.getToken({
      vapidKey: vKey,
      serviceWorkerRegistration: serviceWorkerRegistration || undefined
    });

    const user = currentUser || (typeof firebase !== "undefined" && firebase.auth && firebase.auth().currentUser);
    if (currentToken && user && db) {
      console.log("FCM Device Token acquired successfully:", currentToken);
      const tokenDocId = btoa(currentToken.slice(-32)).replace(/[/+=]/g, "_");
      const userGroup = getUserGroup(currentProfile);
      const userRole = currentProfile ? currentProfile.role : "student";
      await db.collection("users").doc(user.uid).collection("fcmTokens").doc(tokenDocId).set({
        token: currentToken,
        userId: user.uid,
        userRole: userRole,
        group: userGroup,
        platform: isIOSDevice() ? "ios" : (navigator.userAgent.includes("Android") ? "android" : "desktop"),
        userAgent: navigator.userAgent,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      await db.collection("users").doc(user.uid).set({
        fcmToken: currentToken,
        fcmUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }
  } catch (fcmErr) {
    console.warn("Could not register FCM Device Token:", fcmErr);
  }
}

function initNotificationCenter() {
  const btnEnable = document.getElementById("btn-enable-notifs");
  const btnIosGuide = document.getElementById("btn-open-ios-guide");
  const modalClose = document.getElementById("ios-modal-close");
  const modalGotIt = document.getElementById("ios-modal-got-it");
  const modalBackdrop = document.getElementById("ios-pwa-modal");

  if (btnEnable) {
    btnEnable.addEventListener("click", () => {
      requestNotificationAccess();
    });
  }

  if (btnIosGuide) {
    btnIosGuide.addEventListener("click", () => {
      openIosPwaModal();
    });
  }

  if (modalClose) modalClose.addEventListener("click", closeIosPwaModal);
  if (modalGotIt) modalGotIt.addEventListener("click", closeIosPwaModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeIosPwaModal();
    });
  }

  updateNotificationUIState();
}

function bindUserTasks(user) {
  if (tasksUnsubscribe) {
    tasksUnsubscribe();
    tasksUnsubscribe = null;
  }

  isFirstHomeworkSnapshot = true;

  if (user) {
    const profile = currentProfile;
    const isSuperAdmin = isSuperAdminUser(profile);
    const isTeacher = profile && profile.role === "teacher";
    const myGroup = getUserGroup(profile);
    const userClass = getUserClassId(profile);

    // 1. Instant local read for snappy UI
    const local = localStorage.getItem("quill_q_shared_tasks");
    if (local) {
      try {
        currentTasks = JSON.parse(local).filter((t) => {
          if (isTaskDueReached(t)) return false;
          if (!isSuperAdmin && !isTeacher) {
            const taskGroup = t.group || "grp1";
            const taskClass = t.classId || "2ang-aff";
            return taskGroup === myGroup && taskClass === userClass;
          }
          return true;
        });
      } catch (e) {
        currentTasks = [];
      }
    } else {
      currentTasks = [];
    }
    renderHomeworksView();
    syncHomeHomeworkNote();

    // 2. Server-side real-time listener from Firestore shared collection
    if (db) {
      try {
        let query = db.collection("homeworks");
        // For students, filter strictly by their assigned class & group
        if (!isSuperAdmin && !isTeacher) {
          if (userClass && userClass !== "2ang-aff") {
            query = query.where("classId", "==", userClass).where("group", "==", myGroup);
          } else {
            query = query.where("group", "==", myGroup);
          }
        }

        tasksUnsubscribe = query.onSnapshot((snapshot) => {
          // Check for new additions added by other users or across tabs
          if (!isFirstHomeworkSnapshot) {
            snapshot.docChanges().forEach((change) => {
              if (change.type === "added") {
                const docData = change.doc.data();
                const taskClass = docData.classId || "2ang-aff";
                const taskGroup = docData.group || "grp1";
                if (!isSuperAdmin && !isTeacher && (taskClass !== userClass || taskGroup !== myGroup)) {
                  return;
                }
                // Trigger alert if task wasn't initiated in this exact tab session
                if (!locallyCreatedTaskIds.has(change.doc.id) && !isTaskDueReached(docData)) {
                  triggerNewTaskNotification({ id: change.doc.id, ...docData });
                }
              }
            });
          }
          isFirstHomeworkSnapshot = false;

          const list = [];
          snapshot.forEach((doc) => {
            const docData = doc.data();
            const taskClass = docData.classId || "2ang-aff";
            const taskGroup = docData.group || "grp1";
            if (!isSuperAdmin && !isTeacher && (taskClass !== userClass || taskGroup !== myGroup)) {
              return;
            }
            list.push({ id: doc.id, ...docData });
          });
          list.sort((a, b) => (a.due || "").localeCompare(b.due || ""));

          const active = [];
          list.forEach((t) => {
            if (isTaskDueReached(t)) {
              // Auto-cleanup: only delete on server if this user is the author
              if (isMyTask(t) && db) {
                db.collection("homeworks").doc(t.id).delete().catch(console.warn);
              }
            } else {
              active.push(t);
            }
          });

          currentTasks = active;
          try {
            localStorage.setItem("quill_q_shared_tasks", JSON.stringify(active));
          } catch (e) {}
          renderHomeworksView();
          syncHomeHomeworkNote();
        }, (err) => {
          console.warn("Firestore homeworks real-time sync warning:", err);
        });
      } catch (subErr) {
        console.warn("Could not attach homeworks listener:", subErr);
      }
    }
  } else {
    currentTasks = [];
    renderHomeworksView();
    syncHomeHomeworkNote();
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// ===== Custom Popups (Alert & Confirm Dialogs) =====
let dialogResolveFn = null;

function showCustomAlert(message, title = "Notice", iconHtml = '<i class="fi fi-rr-info"></i>') {
  return new Promise((resolve) => {
    const modal = document.getElementById("custom-dialog-modal");
    const iconEl = document.getElementById("custom-dialog-icon");
    const titleEl = document.getElementById("custom-dialog-title");
    const msgEl = document.getElementById("custom-dialog-message");
    const cancelBtn = document.getElementById("custom-dialog-cancel");
    const confirmBtn = document.getElementById("custom-dialog-confirm");
    const confirmText = document.getElementById("custom-dialog-confirm-text");

    if (!modal) {
      window.alert(message);
      resolve(true);
      return;
    }

    if (iconEl) iconEl.innerHTML = iconHtml;
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    if (confirmText) confirmText.textContent = "OK";
    if (confirmBtn) {
      confirmBtn.classList.remove("btn-danger");
      confirmBtn.className = "task-btn-save";
    }
    if (cancelBtn) cancelBtn.style.display = "none";

    dialogResolveFn = () => {
      modal.classList.add("view-hidden");
      dialogResolveFn = null;
      resolve(true);
    };

    modal.classList.remove("view-hidden");
  });
}

function showCustomConfirm(message, title = "Are you sure?", iconHtml = '<i class="fi fi-rr-interrogation"></i>', confirmBtnLabel = "Confirm", cancelBtnLabel = "Cancel", isDanger = false) {
  // Support options object signature: showCustomConfirm({ message, title, confirmText, ... }) or (message, title, iconHtml, ...)
  let opt = {};
  if (typeof message === "object" && message !== null) {
    opt = message;
    message = opt.message || "";
    title = opt.title || "Are you sure?";
    iconHtml = opt.iconHtml || '<i class="fi fi-rr-interrogation"></i>';
    confirmBtnLabel = opt.confirmText || opt.confirmBtnLabel || "Confirm";
    cancelBtnLabel = opt.cancelText || opt.cancelBtnLabel || "Cancel";
    isDanger = !!(opt.isDanger || opt.danger);
  } else {
    // If the 3rd argument is NOT html/icon (i.e. caller passed confirmBtnLabel like "Delete"), adjust arguments
    if (typeof iconHtml === "string" && !iconHtml.includes("<") && !iconHtml.includes("fi-") && iconHtml.length < 20) {
      // Caller called: showCustomConfirm(msg, title, confirmBtnLabel, cancelBtnLabel, isDanger)
      isDanger = Boolean(confirmBtnLabel);
      cancelBtnLabel = typeof confirmBtnLabel === "string" ? confirmBtnLabel : "Cancel";
      confirmBtnLabel = iconHtml;
      iconHtml = '<i class="fi fi-rr-trash"></i>';
    }
  }

  return new Promise((resolve) => {
    const modal = document.getElementById("custom-dialog-modal");
    const iconEl = document.getElementById("custom-dialog-icon");
    const titleEl = document.getElementById("custom-dialog-title");
    const msgEl = document.getElementById("custom-dialog-message");
    const cancelBtn = document.getElementById("custom-dialog-cancel");
    const confirmBtn = document.getElementById("custom-dialog-confirm");
    const confirmText = document.getElementById("custom-dialog-confirm-text");

    if (!modal) {
      const res = window.confirm(message);
      resolve(res);
      return;
    }

    if (iconEl) iconEl.innerHTML = iconHtml;
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    if (confirmText) confirmText.textContent = confirmBtnLabel;
    if (confirmBtn) {
      confirmBtn.className = isDanger ? "task-btn-save btn-danger" : "task-btn-save";
    }
    if (cancelBtn) {
      cancelBtn.textContent = cancelBtnLabel;
      cancelBtn.style.display = "inline-flex";
    }

    dialogResolveFn = (result) => {
      modal.classList.add("view-hidden");
      dialogResolveFn = null;
      resolve(!!result);
    };

    modal.classList.remove("view-hidden");
  });
}

// Global modal event listeners for custom dialog
(function initCustomDialogListeners() {
  const modal = document.getElementById("custom-dialog-modal");
  const cancelBtn = document.getElementById("custom-dialog-cancel");
  const confirmBtn = document.getElementById("custom-dialog-confirm");

  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      if (dialogResolveFn) dialogResolveFn(true);
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      if (dialogResolveFn) dialogResolveFn(false);
    });
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        if (dialogResolveFn) dialogResolveFn(false);
      }
    });
  }

  // Intercept standard window.alert calls
  window.alert = function (msg) {
    return showCustomAlert(String(msg || ""), "Notice", "💡");
  };
})();


function formatDueDisplay(dueStr) {
  if (!dueStr) return "";
  const m = String(dueStr).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const d = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Due Today";
    if (diffDays === 1) return "Due Tomorrow";
    if (diffDays > 1 && diffDays <= 6) {
      return `Due ${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`;
    }
    return `Due ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  }
  return dueStr.startsWith("Due") ? dueStr : `Due ${dueStr}`;
}

// ===== Reusable Searchable Subject Dropdown Helper =====
function setupSearchableDropdown({
  wrapEl,
  triggerEl,
  labelEl,
  menuEl,
  searchEl,
  optionsEl,
  hiddenInput,
  getItems,
  placeholder = "Select Subject...",
  onSelect
}) {
  let items = [];
  let selectedValue = (hiddenInput && hiddenInput.value) || "";

  function renderOptions(filterText = "") {
    if (!optionsEl) return;
    const q = filterText.toLowerCase().trim();
    const filtered = items.filter(it => (it.name && it.name.toLowerCase().includes(q)) || (it.code && it.code.toLowerCase().includes(q)));
    if (!filtered.length) {
      optionsEl.innerHTML = `<div class="searchable-empty-hint">${items.length === 0 ? "No subjects configured for this class" : "No matching subjects found"}</div>`;
      return;
    }
    optionsEl.innerHTML = filtered.map(it => `
      <div class="searchable-option-item ${it.name === selectedValue ? "is-selected" : ""}" data-val="${escapeHtml(it.name)}" data-id="${escapeHtml(it.id)}">
        <span>${escapeHtml(it.name)}</span>
        ${it.code ? `<span class="searchable-option-code">${escapeHtml(it.code)}</span>` : ""}
      </div>
    `).join("");

    optionsEl.querySelectorAll(".searchable-option-item").forEach(itemEl => {
      itemEl.addEventListener("click", () => {
        const val = itemEl.dataset.val;
        selectedValue = val;
        if (hiddenInput) hiddenInput.value = val;
        if (labelEl) labelEl.textContent = val;
        closeMenu();
        if (typeof onSelect === "function") onSelect(val, itemEl.dataset.id);
      });
    });
  }

  function openMenu() {
    items = typeof getItems === "function" ? getItems() : [];
    if (searchEl) searchEl.value = "";
    renderOptions("");
    if (menuEl) menuEl.classList.add("is-open");
    if (triggerEl) {
      triggerEl.classList.add("is-open");
      triggerEl.setAttribute("aria-expanded", "true");
    }
    if (searchEl) setTimeout(() => searchEl.focus(), 50);
  }

  function closeMenu() {
    if (menuEl) menuEl.classList.remove("is-open");
    if (triggerEl) {
      triggerEl.classList.remove("is-open");
      triggerEl.setAttribute("aria-expanded", "false");
    }
  }

  if (triggerEl) {
    triggerEl.addEventListener("click", (e) => {
      e.stopPropagation();
      if (menuEl && menuEl.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (menuEl) {
    menuEl.addEventListener("click", (e) => e.stopPropagation());
  }

  if (searchEl) {
    searchEl.addEventListener("input", (e) => {
      renderOptions(e.target.value);
    });
  }

  document.addEventListener("click", () => closeMenu());

  return {
    setValue: (val) => {
      selectedValue = val || "";
      if (hiddenInput) hiddenInput.value = selectedValue;
      if (labelEl) labelEl.textContent = selectedValue || placeholder;
    },
    refresh: () => {
      items = typeof getItems === "function" ? getItems() : [];
      if (selectedValue && !items.some(it => it.name === selectedValue)) {
        selectedValue = items[0] ? items[0].name : "";
        if (hiddenInput) hiddenInput.value = selectedValue;
        if (labelEl) labelEl.textContent = selectedValue || placeholder;
      }
      if (menuEl && menuEl.classList.contains("is-open")) {
        renderOptions(searchEl ? searchEl.value : "");
      }
    }
  };
}

// ===== Dynamic Bento Subjects View =====
let currentSubjectsViewClass = "2ang-aff";

function renderSubjectsView(targetClassId) {
  const container = document.getElementById("subjects-bento-grid");
  if (!container) return;

  const profile = currentProfile;
  const isSuperAdmin = isSuperAdminUser(profile);
  const isTeacher = profile && profile.role === "teacher";
  const canSwitchClass = isSuperAdmin || isTeacher;
  const userClass = getUserClassId(profile);

  // If student, strictly locked to their own class
  const activeClass = canSwitchClass ? (targetClassId || currentSubjectsViewClass || userClass) : userClass;
  currentSubjectsViewClass = activeClass;

  // Class Switcher in Subjects Header
  const switcherWrap = document.getElementById("subjects-class-switcher-wrap");
  const classSelect = document.getElementById("subjects-class-select");
  if (switcherWrap) switcherWrap.style.display = canSwitchClass ? "inline-flex" : "none";

  if (canSwitchClass && classSelect && window.AcademicRegistry) {
    const allClasses = window.AcademicRegistry.getAllClasses();
    const available = isSuperAdmin ? allClasses : allClasses.filter(c => window.ProfileManager ? window.ProfileManager.teacherTeachesClass(profile, c.id) : true);
    const classesToRender = available.length ? available : allClasses;
    if (classSelect.options.length !== classesToRender.length) {
      classSelect.innerHTML = classesToRender.map(c => `<option value="${c.id}" ${c.id === activeClass ? "selected" : ""}>${c.shortName || c.name}</option>`).join("");
    }
    classSelect.value = activeClass;
    if (!classSelect.dataset.bound) {
      classSelect.dataset.bound = "true";
      classSelect.addEventListener("change", (e) => {
        renderSubjectsView(e.target.value);
      });
    }
  }

  // Get subjects for active class
  const subjects = (window.AcademicRegistry && typeof window.AcademicRegistry.getSubjectsForClass === "function")
    ? window.AcademicRegistry.getSubjectsForClass(activeClass)
    : [];

  const clsObj = window.AcademicRegistry ? window.AcademicRegistry.getClassById(activeClass) : null;
  const className = clsObj ? clsObj.name : "Class";

  if (!subjects || subjects.length === 0) {
    const emptyHint = isSuperAdmin
      ? `No subjects configured for ${className} yet. Go to Admin Panel to add subjects for this class.`
      : `No subjects configured for ${className} yet. Only Super Admin can add subjects.`;
    container.innerHTML = `
      <div class="empty-state-card" style="grid-column: 1 / -1; padding: 48px 24px; text-align: center; background: #fffdf8; border: 2.5px dashed #1a1816; border-radius: 20px; box-shadow: 4px 6px 0 #1a1816;">
        <div style="font-size: 42px; margin-bottom: 12px;">📚</div>
        <h3 style="font-family: 'Patrick Hand', cursive; font-size: 26px; color: #1a1816; margin: 0 0 8px;">No Subjects Added Yet</h3>
        <p style="font-size: 14.5px; color: #72685d; max-width: 440px; margin: 0 auto;">${emptyHint}</p>
      </div>`;
    return;
  }

  container.innerHTML = subjects.map((s) => {
    const iconSvg = typeof getSubjectIconSvg === "function" ? getSubjectIconSvg(s.icon) : (typeof getSubjectIcon === "function" ? getSubjectIcon(s.icon) : "");
    const bgClass = s.bgClass || "card-peach";
    return `
      <a href="subject.html?id=${encodeURIComponent(s.id)}&class=${encodeURIComponent(activeClass)}" class="bento-subject-card ${bgClass}">
        <div class="bento-card-top">
          <div class="bento-card-text">
            <h3 class="bento-card-title">${escapeHtml(s.name)}</h3>
            ${s.code ? `<span style="font-size: 11px; font-weight: 700; color: #72685d; text-transform: uppercase;">${escapeHtml(s.code)}</span>` : ""}
          </div>
          <div class="bento-card-art">
            ${iconSvg}
          </div>
        </div>
      </a>`;
  }).join("");
}

function renderHomeworksView() {
  const container = document.getElementById("hw-tasks-list");
  if (!container) return;

  const isLoggedIn = !!currentUser || (currentProfile && currentProfile.profileCompleted);

  if (!isLoggedIn) {
    container.innerHTML = `
      <div class="hw-empty-state" style="grid-column: 1 / -1; padding: 40px 20px; text-align: center;">
        <div class="hw-empty-icon" style="font-size:36px; margin-bottom:12px;">🔒</div>
        <h4 class="hw-empty-text" style="font-size:20px; font-weight:700; color:#1a1816; margin:0 0 6px;">Sign in required</h4>
        <p class="hw-empty-hint" style="font-size:14px; color:#786e63; margin:0 0 16px;">Sign in with Google to create, view, and server-sync your homework and reminders.</p>
        <button type="button" class="btn-create-account" id="btn-hw-login-trigger" style="max-width: 220px; margin: 0 auto; display: inline-flex;">Sign In to Quill-Q →</button>
      </div>`;
    const btnLoginTrigger = document.getElementById("btn-hw-login-trigger");
    if (btnLoginTrigger) {
      btnLoginTrigger.addEventListener("click", navigateToAuth);
    }
    return;
  }

  const profile = currentProfile;
  const isTeacherOrAdmin = isSuperAdminUser(profile) || (profile && profile.role === "teacher");
  const userClass = getUserClassId(profile);
  const myGroup = getUserGroup(profile);

  let tasks = getStoredTasks();
  if (isTeacherOrAdmin) {
    tasks = tasks.filter((t) => {
      const tClass = t.classId || "2ang-aff";
      const tGroup = t.group || "grp1";
      return (!currentActiveScheduleClass || tClass === currentActiveScheduleClass) &&
             (!currentActiveScheduleGroup || tGroup === currentActiveScheduleGroup);
    });
  } else {
    tasks = tasks.filter((t) => {
      const tClass = t.classId || "2ang-aff";
      const tGroup = t.group || "grp1";
      return tClass === userClass && tGroup === myGroup;
    });
  }

  if (!tasks.length) {
    const activeGrp = isTeacherOrAdmin ? currentActiveScheduleGroup : myGroup;
    const grpName = activeGrp === "grp2" ? "Group 2" : "Group 1";
    const emptyMsg = isTeacherOrAdmin
      ? `No active homework or reminders for ${grpName}. Click Add Task on the side to post one.`
      : "No active homework or reminders. Use Quick Actions on the side to add one.";
    container.innerHTML = `
      <div class="hw-empty-state" style="grid-column: 1 / -1; padding: 40px 20px; text-align: center;">
        <div class="hw-empty-icon" style="font-size:36px; margin-bottom:12px;">✨</div>
        <h4 class="hw-empty-text" style="font-size:20px; font-weight:700; color:#1a1816; margin:0 0 6px;">All clear!</h4>
        <p class="hw-empty-hint" style="font-size:14px; color:#786e63; margin:0;">${emptyMsg}</p>
      </div>`;
    return;
  }

  container.innerHTML = tasks.map((task) => {
    const isCompleted = isTaskCompletedByMe(task);
    const isMine = isMyTask(task);
    const authorName = task.userName || "Student";
    const authorRole = task.userRole || "student";

    return `
    <div class="hw-paper-item">
      <div class="hw-paper-shadow" aria-hidden="true"></div>
      <article class="hw-task-card hw-card-${task.type} ${isCompleted ? "is-completed" : ""}" data-id="${task.id}" data-type="${task.type}">
        <div class="hw-paper-top">
          <div class="hw-paper-meta">
            ${task.type === "reminder"
              ? `<span class="hw-paper-type">Reminder</span>`
              : `<span class="hw-paper-subject">${escapeHtml(task.subject)}</span>
                 <span class="hw-paper-sep">•</span>
                 <span class="hw-paper-type">Homework</span>`
            }
          </div>
          ${isMine ? `
            <button type="button" class="hw-del-btn" data-id="${task.id}" title="Delete (Added by you)" aria-label="Delete task">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          ` : `<div style="width:20px;"></div>`}
        </div>
        <div class="hw-paper-body">
          <p class="hw-paper-desc">${escapeHtml(task.desc)}</p>
        </div>
        <div class="hw-paper-footer">
          <div class="hw-paper-info">
            <span class="hw-paper-due">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              ${escapeHtml(formatDueDisplay(task.due))}
            </span>
            <span class="hw-paper-sep">•</span>
            <span class="hw-paper-author-simple">${escapeHtml(authorName)}${isMine ? ' <span class="hw-author-you">(You)</span>' : ''}</span>
          </div>
          <button type="button" class="hw-chk-btn" data-id="${task.id}" aria-label="Toggle completed" title="${isCompleted ? 'Mark incomplete' : 'Mark completed'}">
            <span class="hw-chk-box">
              <svg viewBox="0 0 16 16" class="hw-chk-svg">
                <path d="M3 8.5 L6.5 12 L13 4" />
              </svg>
            </span>
          </button>
        </div>
      </article>
    </div>
  `}).join("");

  // Attach event listeners for checkboxes
  container.querySelectorAll(".hw-chk-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!currentUser && auth && auth.currentUser) {
        currentUser = auth.currentUser;
      }
      if (!currentUser && currentProfile && currentProfile.uid) {
        currentUser = { uid: currentProfile.uid, displayName: currentProfile.displayName };
      }
      if (!currentUser) {
        alert("Please sign in to update tasks.");
        navigateToAuth();
        return;
      }
      const id = btn.dataset.id;
      const item = currentTasks.find((t) => t.id === id);
      if (item) {
        const myUid = currentUser.uid;
        if (!item.completedBy) item.completedBy = {};
        const nextState = !item.completedBy[myUid];
        item.completedBy[myUid] = nextState;
        item.completed = nextState;

        try {
          localStorage.setItem("quill_q_shared_tasks", JSON.stringify(currentTasks));
        } catch (e) {}
        renderHomeworksView();
        syncHomeHomeworkNote();

        if (db) {
          try {
            await db.collection("homeworks").doc(id).update({
              [`completedBy.${myUid}`]: nextState,
              updatedAt: new Date().toISOString()
            });
          } catch (e) {
            console.warn("Firestore task update error:", e);
          }
        }
      }
    });
  });

  // Attach delete handlers - user can ONLY delete tasks created by them
  container.querySelectorAll(".hw-del-btn").forEach((delBtn) => {
    delBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = delBtn.dataset.id;
      const targetTask = currentTasks.find((t) => t.id === id);
      if (targetTask && !isMyTask(targetTask)) {
        await showCustomAlert("You can only delete reminders or homework added by you.", "Permission Denied", '<i class="fi fi-rr-lock"></i>');
        return;
      }
      const confirmed = await showCustomConfirm(
        "Delete this task permanently from the schedule?",
        "Delete Task",
        '<i class="fi fi-rr-trash"></i>',
        "Delete",
        "Cancel",
        true
      );
      if (confirmed) {
        if (!currentUser && auth && auth.currentUser) {
          currentUser = auth.currentUser;
        }
        if (!currentUser && currentProfile && currentProfile.uid) {
          currentUser = { uid: currentProfile.uid, displayName: currentProfile.displayName };
        }
        currentTasks = currentTasks.filter((t) => t.id !== id);
        try {
          localStorage.setItem("quill_q_shared_tasks", JSON.stringify(currentTasks));
        } catch (err) {}
        renderHomeworksView();
        syncHomeHomeworkNote();

        if (db) {
          try {
            await db.collection("homeworks").doc(id).delete();
          } catch (e) {
            console.error("Error deleting task from server:", e);
            await showCustomAlert("Could not delete from server: " + (e.message || "Permission denied"), "Delete Failed", '<i class="fi fi-rr-cross-circle"></i>');
          }
        }
      }
    });
  });
}

function syncHomeHomeworkNote() {
  const hwList = document.getElementById("hw-list");
  if (!hwList) return;

  const isLoggedIn = !!currentUser || (currentProfile && currentProfile.profileCompleted);
  if (!isLoggedIn) {
    hwList.innerHTML = `<li style="list-style:none; padding:10px 0; color:#7d756c; font-size:13px;">
      <a href="#" id="hw-home-signin-link" style="text-decoration:underline; font-weight:700; color:#1a1816;">Sign in</a> to view homework & reminders
    </li>`;
    const link = document.getElementById("hw-home-signin-link");
    if (link) {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        navigateToAuth();
      });
    }
    return;
  }

  const profile = currentProfile;
  const isTeacherOrAdmin = isSuperAdminUser(profile) || (profile && profile.role === "teacher");
  const userClass = getUserClassId(profile);
  const myGroup = getUserGroup(profile);

  let allTasks = getStoredTasks();
  if (isTeacherOrAdmin) {
    allTasks = allTasks.filter((t) => {
      const tClass = t.classId || "2ang-aff";
      const tGroup = t.group || "grp1";
      return (!currentActiveScheduleClass || tClass === currentActiveScheduleClass) &&
             (!currentActiveScheduleGroup || tGroup === currentActiveScheduleGroup);
    });
  } else {
    allTasks = allTasks.filter((t) => {
      const tClass = t.classId || "2ang-aff";
      const tGroup = t.group || "grp1";
      return tClass === userClass && tGroup === myGroup;
    });
  }
  const tasks = allTasks.slice(0, 5); // top 5
  if (!tasks.length) {
    const grpLabel = (isTeacherOrAdmin ? currentActiveScheduleGroup : myGroup) === "grp2" ? "Group 2" : "Group 1";
    hwList.innerHTML = `<li style="list-style:none; padding:10px 0; color:#7d756c; font-size:14px;">No upcoming homework for ${grpLabel}!</li>`;
    return;
  }

  hwList.innerHTML = tasks.map((t, idx) => {
    const isCompleted = isTaskCompletedByMe(t);
    const isMine = isMyTask(t);
    const authorName = t.userName || "Student";

    return `
    <li>
      <label>
        <input type="checkbox" id="hw-home-chk-${idx}" ${isCompleted ? "checked" : ""} data-id="${t.id}" />
        <span class="custom-chk">
          <svg viewBox="0 0 20 20" class="chk-svg">
            <rect x="2" y="2" width="16" height="16" rx="2.5" class="box-stroke" />
            <path d="M4 9.5 L8 14.5 L16.5 2.5" class="tick-stroke" />
          </svg>
        </span>
        <span class="hw-text">
          ${escapeHtml(t.desc)}
          <small class="hw-note-sub">
            (${escapeHtml(formatDueDisplay(t.due) || (t.type === "reminder" ? "Reminder" : t.subject))} • by ${escapeHtml(authorName)}${isMine ? ' (You)' : ''})
          </small>
        </span>
      </label>
    </li>
  `}).join("");

  hwList.querySelectorAll("input[type=checkbox]").forEach((chk) => {
    chk.addEventListener("change", async () => {
      if (!currentUser && auth && auth.currentUser) {
        currentUser = auth.currentUser;
      }
      if (!currentUser && currentProfile && currentProfile.uid) {
        currentUser = { uid: currentProfile.uid, displayName: currentProfile.displayName };
      }
      if (!currentUser) {
        alert("Please sign in to update tasks.");
        navigateToAuth();
        return;
      }
      const id = chk.dataset.id;
      const item = currentTasks.find((t) => t.id === id);
      if (item) {
        const myUid = currentUser.uid;
        if (!item.completedBy) item.completedBy = {};
        const nextState = chk.checked;
        item.completedBy[myUid] = nextState;
        item.completed = nextState;

        try {
          localStorage.setItem("quill_q_shared_tasks", JSON.stringify(currentTasks));
        } catch (e) {}
        renderHomeworksView();

        if (db) {
          try {
            await db.collection("homeworks").doc(id).update({
              [`completedBy.${myUid}`]: nextState,
              updatedAt: new Date().toISOString()
            });
          } catch (e) {
            console.warn("Firestore task update error:", e);
          }
        }
      }
    });
  });
}

function initHomeworksManager() {
  // Modal elements
  const modal = document.getElementById("task-modal");
  const modalTitle = document.getElementById("modal-task-title");
  const modalTypeInput = document.getElementById("modal-task-type");
  const modalGroupSubject = document.getElementById("modal-group-subject");
  const modalClose = document.getElementById("modal-task-close");
  const modalCancel = document.getElementById("modal-task-cancel");
  const modalForm = document.getElementById("task-modal-form");
  const modalSubject = document.getElementById("modal-task-subject");
  const modalDesc = document.getElementById("modal-task-desc");
  const modalDue = document.getElementById("modal-task-due");
  const modalSubmitText = document.getElementById("modal-submit-text");

  // Initialize Searchable Subject Dropdown
  const taskSubjectDropdownHelper = setupSearchableDropdown({
    wrapEl: document.getElementById("modal-subject-dropdown-wrap"),
    triggerEl: document.getElementById("modal-task-subject-trigger"),
    labelEl: document.getElementById("modal-task-subject-label"),
    menuEl: document.getElementById("modal-task-subject-menu"),
    searchEl: document.getElementById("modal-task-subject-search"),
    optionsEl: document.getElementById("modal-task-subject-options"),
    hiddenInput: document.getElementById("modal-task-subject"),
    getItems: () => {
      const isTeacherOrAdmin = isSuperAdminUser(currentProfile) || (currentProfile && currentProfile.role === "teacher");
      const modalTaskClass = document.getElementById("modal-task-class");
      const targetClass = (isTeacherOrAdmin && modalTaskClass && modalTaskClass.value) ? modalTaskClass.value : (currentActiveScheduleClass || getUserClassId(currentProfile));
      const subs = (window.AcademicRegistry && typeof window.AcademicRegistry.getSubjectsForClass === "function")
        ? window.AcademicRegistry.getSubjectsForClass(targetClass)
        : [];
      return subs.map(s => ({ id: s.id, name: s.name, code: s.code }));
    },
    placeholder: "Select Subject...",
    onSelect: (val) => {}
  });

  function openModal(type) {
    if (!currentUser && (!currentProfile || !currentProfile.profileCompleted)) {
      alert("Please sign in to add homework and study reminders.");
      navigateToAuth();
      return;
    }
    if (!modal) return;
    modalTypeInput.value = type;
    if (type === "reminder") {
      modalTitle.textContent = "Add Reminder";
      modalSubmitText.textContent = "Add Reminder";
      modalDesc.placeholder = "e.g. Bring grammar notes to Amphi 4";
      if (modalGroupSubject) modalGroupSubject.style.display = "none";
      if (modalSubject) modalSubject.removeAttribute("required");
    } else {
      modalTitle.textContent = "Add Homework";
      modalSubmitText.textContent = "Add Homework";
      modalDesc.placeholder = "e.g. Read chapters 1 & 2 of Drama";
      if (modalGroupSubject) modalGroupSubject.style.display = "";
      if (modalSubject) modalSubject.setAttribute("required", "required");
    }

    const modalGroupTargetWrap = document.getElementById("modal-group-target-wrap");
    const modalClassTargetWrap = document.getElementById("modal-class-target-wrap");
    const modalTaskClass = document.getElementById("modal-task-class");
    const modalTaskGroup = document.getElementById("modal-task-group");
    const isTeacherOrAdmin = isSuperAdminUser(currentProfile) || (currentProfile && currentProfile.role === "teacher");

    if (modalClassTargetWrap) {
      modalClassTargetWrap.style.display = isTeacherOrAdmin ? "" : "none";
    }
    if (modalGroupTargetWrap) {
      modalGroupTargetWrap.style.display = isTeacherOrAdmin ? "" : "none";
    }

    let activeModalClass = isTeacherOrAdmin ? (currentActiveScheduleClass || "2ang-aff") : getUserClassId(currentProfile);

    function updateModalGroupsForClass(cId) {
      if (!modalTaskGroup || !window.AcademicRegistry) return;
      const groups = window.AcademicRegistry.getGroupsForClass(cId);
      modalTaskGroup.innerHTML = groups.map((g) => `<option value="${g.id}">${g.name} (${g.code || g.name})</option>`).join("");
      modalTaskGroup.value = currentActiveScheduleGroup === "grp2" ? "grp2" : "grp1";
    }

    if (isTeacherOrAdmin && modalTaskClass && window.AcademicRegistry) {
      const allClasses = window.AcademicRegistry.getAllClasses();
      const available = isSuperAdminUser(currentProfile) ? allClasses : allClasses.filter(c => window.ProfileManager ? window.ProfileManager.teacherTeachesClass(currentProfile, c.id) : true);
      const classesToRender = available.length ? available : allClasses;
      modalTaskClass.innerHTML = classesToRender.map(c => `<option value="${c.id}" ${c.id === activeModalClass ? "selected" : ""}>${c.shortName || c.name}</option>`).join("");
      modalTaskClass.value = activeModalClass;
      updateModalGroupsForClass(activeModalClass);

      if (!modalTaskClass.dataset.bound) {
        modalTaskClass.dataset.bound = "true";
        modalTaskClass.addEventListener("change", (e) => {
          activeModalClass = e.target.value;
          updateModalGroupsForClass(activeModalClass);
          if (taskSubjectDropdownHelper) {
            taskSubjectDropdownHelper.setValue("");
            taskSubjectDropdownHelper.refresh();
          }
        });
      }
    } else {
      updateModalGroupsForClass(activeModalClass);
    }

    if (taskSubjectDropdownHelper) {
      taskSubjectDropdownHelper.setValue("");
      taskSubjectDropdownHelper.refresh();
    }

    modalDesc.value = "";
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (modalDue) {
      modalDue.value = tomorrow.toISOString().split("T")[0];
    }
    modal.classList.remove("view-hidden");
    setTimeout(() => modalDesc.focus(), 60);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.add("view-hidden");
  }

  // Quick Action Buttons on notes.png
  const btnAddHw = document.getElementById("btn-quick-add-hw");
  const btnAddRem = document.getElementById("btn-quick-add-rem");

  if (btnAddHw) {
    btnAddHw.addEventListener("click", (e) => {
      e.preventDefault();
      openModal("homework");
    });
  }
  if (btnAddRem) {
    btnAddRem.addEventListener("click", (e) => {
      e.preventDefault();
      openModal("reminder");
    });
  }

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalCancel) modalCancel.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Form submission
  if (modalForm) {
    modalForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!currentUser && auth && auth.currentUser) {
        currentUser = auth.currentUser;
      }
      if (!currentUser && currentProfile && currentProfile.uid) {
        currentUser = { uid: currentProfile.uid, displayName: currentProfile.displayName };
      }
      if (!currentUser) {
        alert("Please sign in to save your homework and reminders.");
        closeModal();
        navigateToAuth();
        return;
      }

      const desc = modalDesc.value.trim();
      if (!desc) return;

      const type = modalTypeInput.value || "homework";
      const subject = type === "reminder" ? "" : (modalSubject.value || "General");
      const due = modalDue.value.trim() || new Date(Date.now() + 86400000).toISOString().split("T")[0];

      const myUid = currentUser.uid;
      const myName = currentProfile
        ? (currentProfile.role === "teacher"
            ? (currentProfile.displayName.startsWith("Prof") ? currentProfile.displayName : `Prof. ${currentProfile.displayName}`)
            : (currentProfile.displayName || currentUser.displayName || "Student"))
        : (currentUser.displayName || "Student");
      const myRole = currentProfile ? currentProfile.role : "student";

      const isTeacherOrAdmin = isSuperAdminUser(currentProfile) || (currentProfile && currentProfile.role === "teacher");
      const modalTaskClass = document.getElementById("modal-task-class");
      const modalTaskGroup = document.getElementById("modal-task-group");
      const assignedClass = (isTeacherOrAdmin && modalTaskClass && modalTaskClass.value) ? modalTaskClass.value : getUserClassId(currentProfile);
      const assignedGroup = (isTeacherOrAdmin && modalTaskGroup) ? modalTaskGroup.value : getUserGroup(currentProfile);

      const taskId = "task-" + Date.now();
      const newTask = {
        id: taskId,
        classId: assignedClass,
        group: assignedGroup,
        subject,
        desc,
        due,
        type,
        completed: false,
        completedBy: {},
        userId: myUid,
        userName: myName,
        userRole: myRole,
        createdAt: new Date().toISOString()
      };

      currentTasks.unshift(newTask);
      try {
        localStorage.setItem("quill_q_shared_tasks", JSON.stringify(currentTasks));
      } catch (e) {}
      renderHomeworksView();
      syncHomeHomeworkNote();
      closeModal();

      // Trigger instant notification and chime for the creator
      locallyCreatedTaskIds.add(taskId);
      triggerNewTaskNotification(newTask);

      if (db) {
        try {
          await db.collection("homeworks").doc(taskId).set(newTask);
          if (typeof broadcastPushNotification === "function") {
            broadcastPushNotification({
              title: `📝 New Homework: ${newTask.subject || "Assignment"}`,
              body: `${newTask.title || newTask.desc || ""}${newTask.due ? ` (Due: ${newTask.due})` : ""}`,
              targetView: "homeworks",
              targetGroup: newTask.group || "grp1"
            });
          }
        } catch (dbErr) {
          console.error("Error saving task to server:", dbErr);
          alert("Error saving to server: " + (dbErr.message || "Permission denied"));
        }
      }
    });
  }

  // Periodic auto-cleanup: checks every 30 seconds for expired tasks and auto-prunes
  setInterval(() => {
    const active = currentTasks.filter((t) => {
      if (isTaskDueReached(t)) {
        if (db && isMyTask(t)) {
          db.collection("homeworks").doc(t.id).delete().catch(console.warn);
        }
        return false;
      }
      return true;
    });
    if (active.length !== currentTasks.length) {
      currentTasks = active;
      try {
        localStorage.setItem("quill_q_shared_tasks", JSON.stringify(active));
      } catch (e) {}
      renderHomeworksView();
      syncHomeHomeworkNote();
    }
  }, 30000);

  // Initial render
  renderHomeworksView();
  syncHomeHomeworkNote();
}

// ===== Quick Notes Manager (Subjects View Paperclip Note) =====
let currentQuickNotes = [];
let quickNotesUnsubscribe = null;
let isFirstQuickNotesSnapshot = true;

function isNoteExpired(note) {
  if (!note || !note.expiresAt) return false;
  // Parse expiration date as end-of-day in local time
  const parts = note.expiresAt.split("-");
  if (parts.length === 3) {
    const expDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 23, 59, 59);
    return new Date() > expDate;
  }
  return false;
}

function formatExpirationDate(expStr) {
  if (!expStr) return "";
  const parts = expStr.split("-");
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return expStr;
}

function isQuickNotesDismissed(validNotes) {
  try {
    const dismissed = localStorage.getItem("quill_q_notes_dismissed");
    if (!dismissed) return false;
    const dismissedCount = localStorage.getItem("quill_q_notes_dismissed_count");
    const currentCount = validNotes ? validNotes.length : 0;
    // If user marked dismissed and no new notes have been added, keep dismissed
    if (dismissed === "true" && (!dismissedCount || parseInt(dismissedCount, 10) >= currentCount)) {
      return true;
    }
  } catch (e) {}
  return false;
}

function updateMobileQuickNotesTrigger(validNotes) {
  const triggerBtn = document.getElementById("mobile-quick-notes-trigger");
  const iconEmpty = document.getElementById("mobile-notes-icon-empty");
  const iconNote = document.getElementById("mobile-notes-icon-note");
  const badge = document.getElementById("mobile-notes-badge");
  if (!triggerBtn) return;

  const count = validNotes ? validNotes.length : 0;
  const isDismissed = isQuickNotesDismissed(validNotes);

  if (count > 0) {
    if (iconEmpty) iconEmpty.style.display = "none";
    if (iconNote) iconNote.style.display = "inline-flex";

    if (!isDismissed) {
      // Unread: show red notification badge
      triggerBtn.classList.add("has-unread-notes");
      triggerBtn.classList.remove("notes-dismissed");
      if (badge) {
        badge.textContent = count > 9 ? "9+" : count;
        badge.title = `${count} quick note${count > 1 ? "s" : ""}`;
      }
    } else {
      // Dismissed: hide red badge, keep note icon visible
      triggerBtn.classList.remove("has-unread-notes");
      triggerBtn.classList.add("notes-dismissed");
      if (badge) badge.textContent = "";
    }
    triggerBtn.classList.add("has-notes");
  } else {
    // No notes: empty plus icon, badge completely hidden
    if (iconEmpty) iconEmpty.style.display = "inline-flex";
    if (iconNote) iconNote.style.display = "none";
    if (badge) badge.textContent = "";
    triggerBtn.classList.remove("has-notes", "notes-dismissed", "has-unread-notes");
  }
}

function renderQuickNotes() {
  const container = document.getElementById("paperclip-notes-list");
  const validNotes = currentQuickNotes.filter((n) => !isNoteExpired(n));

  updateMobileQuickNotesTrigger(validNotes);

  if (!container) return;

  if (validNotes.length === 0) {
    container.innerHTML = `<div class="paperclip-empty-msg">No quick notes yet. Click "+ Add Note" to post one!</div>`;
    return;
  }

  const isSuperAdmin = currentUser && (currentUser.email === "dodchadam@gmail.com" || currentUser.email === "dotchadam@gmail.com");

  container.innerHTML = validNotes.map((note) => {
    const canDelete = isSuperAdmin || (currentUser && note.userId === currentUser.uid);
    const expLabel = formatExpirationDate(note.expiresAt);
    const authorName = note.authorName || "Student";

    return `
      <div class="paperclip-note-entry" data-note-id="${escapeHtml(note.id)}">
        <div class="paperclip-note-top">
          <p class="paperclip-note-text">${escapeHtml(note.text)}</p>
          ${canDelete ? `
            <button type="button" class="paperclip-note-btn-del" data-note-id="${escapeHtml(note.id)}" title="Delete Note" aria-label="Delete note">
              <i class="fi fi-rr-trash"></i>
            </button>
          ` : ""}
        </div>
        <div class="paperclip-note-footer">
          <span class="paperclip-note-author" title="${escapeHtml(authorName)}">By ${escapeHtml(authorName)}</span>
          <span class="paperclip-note-exp" title="Expires at end of day">
            <i class="fi fi-rr-clock"></i> Exp: ${expLabel}
          </span>
        </div>
      </div>
    `;
  }).join("");

  // Attach delete handlers with confirmation
  container.querySelectorAll(".paperclip-note-btn-del").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const noteId = btn.dataset.noteId;
      if (!noteId) return;

      const confirmed = await showCustomConfirm(
        "Are you sure you want to delete this quick note?",
        "Delete Note",
        '<i class="fi fi-rr-trash"></i>',
        "Delete",
        "Cancel",
        true
      );
      if (!confirmed) return;

      // Optimistically remove
      currentQuickNotes = currentQuickNotes.filter((n) => n.id !== noteId);
      renderQuickNotes();
      try {
        localStorage.setItem("quill_q_quick_notes", JSON.stringify(currentQuickNotes));
      } catch (err) {}

      if (db) {
        try {
          await db.collection("quickNotes").doc(noteId).delete();
        } catch (dbErr) {
          console.warn("Could not delete quick note from Firestore:", dbErr);
        }
      }
    });
  });
}

function initQuickNotesManager() {
  const btnAdd = document.getElementById("btn-add-quick-note");
  const modal = document.getElementById("quick-note-modal");
  const modalClose = document.getElementById("modal-quick-note-close");
  const modalCancel = document.getElementById("modal-quick-note-cancel");
  const form = document.getElementById("quick-note-modal-form");
  const inputContent = document.getElementById("quick-note-text");
  const inputExpires = document.getElementById("quick-note-expires");

  // Mobile drawer elements
  const mobileTrigger = document.getElementById("mobile-quick-notes-trigger");
  const mobileClose = document.getElementById("mobile-notes-close-btn");
  const mobileBackdrop = document.getElementById("mobile-notes-backdrop");
  const subjectsSideWrap = document.getElementById("subjects-side-wrap");

  function openMobileQuickNotesModal() {
    if (subjectsSideWrap) subjectsSideWrap.classList.add("mobile-drawer-open");
    if (mobileBackdrop) mobileBackdrop.classList.add("active");
    if (mobileTrigger) mobileTrigger.classList.add("is-drawer-open");
    document.body.style.overflow = "hidden";

    // Mark notes as seen/read so red notification dot dismisses and note icon shows permanently
    const validNotes = currentQuickNotes.filter((n) => !isNoteExpired(n));
    try {
      localStorage.setItem("quill_q_notes_dismissed", "true");
      localStorage.setItem("quill_q_notes_dismissed_count", String(validNotes.length));
    } catch (e) {}

    updateMobileQuickNotesTrigger(validNotes);
  }

  function closeMobileQuickNotesModal() {
    if (subjectsSideWrap) subjectsSideWrap.classList.remove("mobile-drawer-open");
    if (mobileBackdrop) mobileBackdrop.classList.remove("active");
    if (mobileTrigger) mobileTrigger.classList.remove("is-drawer-open");
    document.body.style.overflow = "";

    const validNotes = currentQuickNotes.filter((n) => !isNoteExpired(n));
    updateMobileQuickNotesTrigger(validNotes);
  }

  if (mobileTrigger) {
    mobileTrigger.addEventListener("click", () => {
      if (subjectsSideWrap && subjectsSideWrap.classList.contains("mobile-drawer-open")) {
        closeMobileQuickNotesModal();
      } else {
        openMobileQuickNotesModal();
      }
    });
  }

  if (mobileClose) mobileClose.addEventListener("click", closeMobileQuickNotesModal);
  if (mobileBackdrop) mobileBackdrop.addEventListener("click", closeMobileQuickNotesModal);

  function openQuickNoteModal() {
    if (!modal) return;
    if (inputContent) inputContent.value = "";
    if (inputExpires) {
      // Default to 3 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 3);
      inputExpires.value = defaultDate.toISOString().split("T")[0];
      // Min date is today
      inputExpires.min = new Date().toISOString().split("T")[0];
    }
    modal.classList.remove("view-hidden");
    setTimeout(() => {
      if (inputContent) inputContent.focus();
    }, 60);
  }

  function closeQuickNoteModal() {
    if (modal) modal.classList.add("view-hidden");
  }

  if (btnAdd) btnAdd.addEventListener("click", openQuickNoteModal);
  if (modalClose) modalClose.addEventListener("click", closeQuickNoteModal);
  if (modalCancel) modalCancel.addEventListener("click", closeQuickNoteModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeQuickNoteModal();
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = inputContent ? inputContent.value.trim() : "";
      const expiresAt = inputExpires ? inputExpires.value : "";

      if (!text || !expiresAt) return;

      const user = currentUser || (auth && auth.currentUser);
      if (!user) {
        showCustomAlert("Please sign in to post a quick note.", "Sign In Required");
        return;
      }

      closeQuickNoteModal();

      const myGroup = getUserGroup(currentProfile);
      const myClass = getUserClassId(currentProfile);
      const noteId = "note_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
      const newNote = {
        id: noteId,
        classId: myClass,
        group: myGroup,
        text: text,
        expiresAt: expiresAt,
        userId: user.uid,
        authorName: (currentProfile && currentProfile.displayName) || user.displayName || user.email.split("@")[0],
        createdAt: new Date().toISOString()
      };

      // Optimistic update
      currentQuickNotes.unshift(newNote);
      renderQuickNotes();
      try {
        localStorage.setItem("quill_q_quick_notes", JSON.stringify(currentQuickNotes));
      } catch (err) {}

      if (db) {
        try {
          await db.collection("quickNotes").doc(noteId).set(newNote);
          if (typeof broadcastPushNotification === "function") {
            broadcastPushNotification({
              title: `📌 Pinned Note from ${newNote.authorName || "Classmate"}`,
              body: newNote.text || "Check the latest pinned note",
              targetView: "home",
              targetGroup: newNote.group || "grp1"
            });
          }
        } catch (dbErr) {
          console.error("Error creating quick note:", dbErr);
          showCustomAlert("Error saving quick note: " + (dbErr.message || "Permission denied"));
        }
      }
    });
  }

  // Local storage cached load
  const cached = localStorage.getItem("quill_q_quick_notes");
  if (cached) {
    try {
      const profile = currentProfile;
      const isSuperAdmin = isSuperAdminUser(profile);
      const isTeacher = profile && profile.role === "teacher";
      const myGroup = getUserGroup(profile);
      const userClass = getUserClassId(profile);
      currentQuickNotes = JSON.parse(cached).filter((n) => {
        if (isNoteExpired(n)) return false;
        if (!isSuperAdmin && !isTeacher) {
          const noteGroup = n.group || "grp1";
          const noteClass = n.classId || "2ang-aff";
          return noteGroup === myGroup && noteClass === userClass;
        }
        return true;
      });
      renderQuickNotes();
    } catch (e) {
      currentQuickNotes = [];
    }
  }

  // Periodic expiration prune every 30s
  setInterval(() => {
    const unexpired = currentQuickNotes.filter((n) => {
      if (isNoteExpired(n)) {
        if (db && currentUser && (n.userId === currentUser.uid || currentUser.email === "dodchadam@gmail.com")) {
          db.collection("quickNotes").doc(n.id).delete().catch(console.warn);
        }
        return false;
      }
      return true;
    });

    if (unexpired.length !== currentQuickNotes.length) {
      currentQuickNotes = unexpired;
      try {
        localStorage.setItem("quill_q_quick_notes", JSON.stringify(unexpired));
      } catch (err) {}
      renderQuickNotes();
    }
  }, 30000);
}

// Attaches real-time listener to /quickNotes collection once user is authenticated
function bindQuickNotesListener(user) {
  if (quickNotesUnsubscribe) {
    quickNotesUnsubscribe();
    quickNotesUnsubscribe = null;
  }

  isFirstQuickNotesSnapshot = true;

  if (user && db) {
    const profile = currentProfile;
    const isSuperAdmin = isSuperAdminUser(profile);
    const isTeacher = profile && profile.role === "teacher";
    const myGroup = getUserGroup(profile);
    const userClass = getUserClassId(profile);

    try {
      let query = db.collection("quickNotes");
      if (!isSuperAdmin && !isTeacher) {
        if (userClass && userClass !== "2ang-aff") {
          query = query.where("classId", "==", userClass).where("group", "==", myGroup);
        } else {
          query = query.where("group", "==", myGroup);
        }
      }
      quickNotesUnsubscribe = query.onSnapshot((snapshot) => {
          // Detect new notes added by classmates/teachers
          if (!isFirstQuickNotesSnapshot) {
            snapshot.docChanges().forEach((change) => {
              if (change.type === "added") {
                const noteData = change.doc.data();
                const noteClass = noteData.classId || "2ang-aff";
                const noteGroup = noteData.group || "grp1";
                if (!isSuperAdmin && !isTeacher && (noteClass !== userClass || noteGroup !== myGroup)) {
                  return;
                }
                if (noteData && noteData.userId !== (currentUser ? currentUser.uid : null) && !isNoteExpired(noteData)) {
                  playNotificationChime();
                  showInAppToast({
                    type: "info",
                    badge: "Quick Note",
                    icon: '<i class="fi fi-rr-clip"></i>',
                    title: `📌 Note from ${noteData.authorName || "Classmate"}`,
                    message: noteData.text || "",
                    meta: noteData.expiresAt ? `Expires: ${formatExpirationDate(noteData.expiresAt)}` : ""
                  });
                  sendSystemNotification(`📌 New Note from ${noteData.authorName || "Classmate"}`, {
                    body: noteData.text || "Added a quick note",
                    icon: "assets/icon-192.png",
                    badge: "assets/favicon-32x32-light.png",
                    tag: "quick-note-" + change.doc.id,
                    data: { url: "./index.html", targetView: "subjects" }
                  });
                }
              }
            });
          }
          isFirstQuickNotesSnapshot = false;

          const list = [];
          snapshot.forEach((doc) => {
            const noteData = doc.data();
            const noteClass = noteData.classId || "2ang-aff";
            const noteGroup = noteData.group || "grp1";
            if (!isSuperAdmin && !isTeacher && (noteClass !== userClass || noteGroup !== myGroup)) {
              return;
            }
            list.push({ id: doc.id, ...noteData });
          });

          // Sort by creation time newest first
          list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

          const active = [];
          list.forEach((n) => {
            if (isNoteExpired(n)) {
              if (currentUser && (n.userId === currentUser.uid || currentUser.email === "dodchadam@gmail.com")) {
                db.collection("quickNotes").doc(n.id).delete().catch(console.warn);
              }
            } else {
              active.push(n);
            }
          });

          currentQuickNotes = active;
          try {
            localStorage.setItem("quill_q_quick_notes", JSON.stringify(active));
          } catch (err) {}
          renderQuickNotes();
        }, (err) => {
          console.warn("Firestore quickNotes sync warning:", err);
        });
    } catch (e) {
      console.warn("Could not attach quickNotes listener:", e);
    }
  }
}

// --- Course search filters timelines, subjects, homework, and status cards ---
let currentSearchQuery = "";

function reapplySearchFilter() {
  if (typeof window.executeSearchFilter === "function") {
    window.executeSearchFilter(currentSearchQuery);
  }
}

function initSearch() {
  const desktopInput = document.getElementById("search-input");
  const mobileInput = document.getElementById("mobile-search-input");
  const mobileSearchToggleBtn = document.getElementById("mobile-search-toggle-btn");
  const mobileSearchCloseBtn = document.getElementById("mobile-search-close-btn");
  const mobileSearchWrap = document.getElementById("mobile-search-expand-wrap");
  const mobileTopBar = document.getElementById("mobile-top-bar");

  const openMobileSearch = () => {
    if (!mobileSearchWrap) return;
    mobileSearchWrap.classList.add("open");
    if (mobileTopBar) {
      mobileTopBar.classList.remove("nav-hidden");
    }
    if (mobileInput) {
      setTimeout(() => {
        mobileInput.focus();
      }, 50);
    }
  };

  const closeMobileSearch = () => {
    if (!mobileSearchWrap) return;
    mobileSearchWrap.classList.remove("open");
    if (mobileInput) {
      mobileInput.value = "";
    }
    if (desktopInput) {
      desktopInput.value = "";
    }
    executeFilter("");
  };

  if (mobileSearchToggleBtn && mobileSearchWrap) {
    mobileSearchToggleBtn.addEventListener("click", () => {
      if (mobileSearchWrap.classList.contains("open")) {
        closeMobileSearch();
      } else {
        openMobileSearch();
      }
    });
  }

  if (mobileSearchCloseBtn && mobileSearchWrap) {
    mobileSearchCloseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeMobileSearch();
    });
  }

  // Close search with Esc key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileSearchWrap && mobileSearchWrap.classList.contains("open")) {
      closeMobileSearch();
    }
  });

  const executeFilter = (rawQ) => {
    const q = (rawQ || "").trim().toLowerCase();
    currentSearchQuery = q;

    // 1. Quick timeline on Home page
    const items = document.querySelectorAll(".timeline .tl-item");
    items.forEach((item) => {
      const text = item.textContent.toLowerCase();
      if (q && !text.includes(q)) {
        item.style.setProperty("display", "none", "important");
      } else {
        item.style.removeProperty("display");
      }
    });

    // 2. Status card on Home page (Happening Now & Up Next)
    const statusCard = document.getElementById("status-card");
    if (statusCard) {
      const statusText = statusCard.textContent.toLowerCase();
      if (q && !statusText.includes(q)) {
        statusCard.style.setProperty("display", "none", "important");
      } else {
        statusCard.style.removeProperty("display");
      }
    }

    // 3. Detailed timeline in Schedule View
    const dtlRows = document.querySelectorAll(".detailed-timeline .dtl-row");
    dtlRows.forEach((row) => {
      let match = false;
      if (row.classList.contains("dtl-row-break")) {
        match = "break".includes(q) || "recess".includes(q) || "free".includes(q);
      } else {
        const text = row.textContent.toLowerCase();
        match = text.includes(q);
      }
      if (q && !match) {
        row.style.setProperty("display", "none", "important");
      } else {
        row.style.removeProperty("display");
      }
    });

    // 4. Bento cards in Subjects View
    const bentoCards = document.querySelectorAll(".bento-subject-card");
    bentoCards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      if (q && !text.includes(q)) {
        card.style.setProperty("display", "none", "important");
      } else {
        card.style.removeProperty("display");
      }
    });

    // 5. Homework cards in Homework View
    const hwItems = document.querySelectorAll(".hw-paper-item");
    hwItems.forEach((item) => {
      const text = item.textContent.toLowerCase();
      if (q && !text.includes(q)) {
        item.style.setProperty("display", "none", "important");
      } else {
        item.style.removeProperty("display");
      }
    });

    // 6. Pinned Homework Note items (on Home & Side wrap)
    const hwListItems = document.querySelectorAll("#hw-list li");
    hwListItems.forEach((item) => {
      const text = item.textContent.toLowerCase();
      if (q && !text.includes(q)) {
        item.style.setProperty("display", "none", "important");
      } else {
        item.style.removeProperty("display");
      }
    });
  };

  window.executeSearchFilter = executeFilter;

  const handleInput = (sourceInput, targetInput) => {
    const val = sourceInput.value;
    if (targetInput && targetInput.value !== val) {
      targetInput.value = val;
    }
    executeFilter(val);
  };

  if (desktopInput) {
    desktopInput.addEventListener("input", () => handleInput(desktopInput, mobileInput));
    desktopInput.addEventListener("search", () => handleInput(desktopInput, mobileInput));
  }

  if (mobileInput) {
    mobileInput.addEventListener("input", () => handleInput(mobileInput, desktopInput));
    mobileInput.addEventListener("search", () => handleInput(mobileInput, desktopInput));
    mobileInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        mobileInput.blur();
      }
    });
  }
}

// --- Firebase & User Profile Management ---
var firebaseConfig = window.firebaseConfig || {
  projectId: "quill-q-dodch",
  appId: "1:648049411331:web:880ce305ebe145df9e9536",
  storageBucket: "quill-q-dodch.firebasestorage.app",
  apiKey: "AIzaSyBhOd39WoozsZBCrCRjQt1D23uoTJqqZgk",
  authDomain: "quill-q-dodch.firebaseapp.com",
  messagingSenderId: "648049411331",
  projectNumber: "648049411331",
  vapidKey: "BFYzADoTQ1yCuaWyT00HXmt06FFxJ1xgW8Af7xrskV3-i51JYoL6idPnTnPqZAMRuyMl6D5tYebZ5ZWGmGcIyYw",
  pushEndpoint: "https://quill-push-dispatcher.dodchadam.workers.dev"
};
window.firebaseConfig = firebaseConfig;

let auth = null;
let db = null;
let currentUser = null;
let currentProfile = null;

function navigateToDashboard() {
  const profile = currentProfile;
  const isSuperAdmin = isSuperAdminUser(profile);
  const isApproved = profile && (profile.status === "approved" || isSuperAdmin);

  // Hard barrier: if not approved and not super admin, route immediately to pending page
  if (profile && !isApproved) {
    navigateToPendingApproval(profile);
    return;
  }

  document.documentElement.classList.add("authed-start");
  const landingPage = document.getElementById("landing-page");
  const authPage = document.getElementById("auth-page");
  const pendingPage = document.getElementById("pending-approval-page");
  const dashboardApp = document.getElementById("dashboard-app");

  if (landingPage) landingPage.classList.add("landing-hidden");
  if (authPage) authPage.classList.add("landing-hidden");
  if (pendingPage) pendingPage.classList.add("view-hidden");
  if (dashboardApp) {
    dashboardApp.classList.remove("dashboard-hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      checkTimelineMarquees();
      updateTodayStatus();

      // Auto-switch to view specified in URL query param (e.g. ?view=chat, ?view=homeworks, ?view=approvals)
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const targetViewParam = urlParams.get("view") || urlParams.get("targetView");
        if (targetViewParam && typeof switchView === "function") {
          const navItem = document.getElementById(`nav-${targetViewParam}`);
          if (navItem) {
            document.querySelectorAll(".nav-item").forEach((i) => i.classList.remove("active"));
            navItem.classList.add("active");
          }
          switchView(targetViewParam);
        }
      } catch (e) {}
    }, 50);
  }
}

function navigateToLanding() {
  document.documentElement.classList.remove("authed-start");
  const landingPage = document.getElementById("landing-page");
  const authPage = document.getElementById("auth-page");
  const pendingPage = document.getElementById("pending-approval-page");
  const dashboardApp = document.getElementById("dashboard-app");

  if (authPage) authPage.classList.add("landing-hidden");
  if (pendingPage) pendingPage.classList.add("view-hidden");
  if (dashboardApp) dashboardApp.classList.add("dashboard-hidden");
  if (landingPage) {
    landingPage.classList.remove("landing-hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function navigateToAuth() {
  document.documentElement.classList.remove("authed-start");
  const landingPage = document.getElementById("landing-page");
  const authPage = document.getElementById("auth-page");
  const pendingPage = document.getElementById("pending-approval-page");
  const dashboardApp = document.getElementById("dashboard-app");

  if (landingPage) landingPage.classList.add("landing-hidden");
  if (pendingPage) pendingPage.classList.add("view-hidden");
  if (dashboardApp) dashboardApp.classList.add("dashboard-hidden");
  if (authPage) {
    authPage.classList.remove("landing-hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Show Step 1 (Sign in) by default unless user is already in onboarding
  const stepSignin = document.getElementById("auth-step-signin");
  const stepOnboarding = document.getElementById("auth-step-onboarding");
  if (stepSignin) stepSignin.classList.remove("view-hidden");
  if (stepOnboarding) stepOnboarding.classList.add("view-hidden");
}

function navigateToPendingApproval(profile) {
  document.documentElement.classList.remove("authed-start");
  const landingPage = document.getElementById("landing-page");
  const authPage = document.getElementById("auth-page");
  const pendingPage = document.getElementById("pending-approval-page");
  const dashboardApp = document.getElementById("dashboard-app");

  if (landingPage) landingPage.classList.add("landing-hidden");
  if (authPage) authPage.classList.add("landing-hidden");
  if (dashboardApp) dashboardApp.classList.add("dashboard-hidden");

  if (pendingPage) {
    pendingPage.classList.remove("view-hidden");
    const pName = document.getElementById("pending-user-name");
    const pFullName = document.getElementById("pending-user-fullname");
    const pRoleBadge = document.getElementById("pending-user-role-badge");
    const pAvatar = document.getElementById("pending-user-avatar");

    const displayName = profile ? (profile.displayName || profile.firstName || "there") : "there";
    const firstName = displayName.split(" ")[0];
    const roleText = (profile && profile.role === "teacher") ? "Teacher" : "Student";
    const academicText = profile ? (profile.academicDetail || "English Business Grp 1") : "English Business Grp 1";

    if (pName) pName.textContent = firstName;
    if (pFullName) pFullName.textContent = displayName;
    if (pRoleBadge) pRoleBadge.textContent = `${roleText} • ${academicText}`;
    if (pAvatar && profile && profile.photoURL) pAvatar.src = profile.photoURL;

    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function applyProfileToUI(profile) {
  const homeAvatar = document.getElementById("home-greeting-avatar");
  const homeName = document.getElementById("home-greeting-name");
  const homeRoleIcon = document.getElementById("home-user-role-icon");
  const homeRoleText = document.getElementById("home-user-role-text");
  const homeRoleAcademic = document.getElementById("home-user-academic");
  const sideAvatar = document.getElementById("sidebar-user-avatar");
  const sideName = document.getElementById("sidebar-user-name");
  const sideRole = document.getElementById("sidebar-user-role");
  const btnGetStarted = document.getElementById("btn-get-started");

  if (!profile) {
    if (homeAvatar) {
      homeAvatar.src = "assets/avatar.jpg";
      homeAvatar.alt = "Default avatar";
    }
    if (homeName) homeName.textContent = "Student";
    if (homeRoleIcon) homeRoleIcon.innerHTML = '<i class="fi fi-ss-student"></i>';
    if (homeRoleText) homeRoleText.textContent = "Student";
    if (homeRoleAcademic) homeRoleAcademic.textContent = "English Business Grp 1";
    if (sideAvatar) {
      sideAvatar.src = "assets/avatar.jpg";
      sideAvatar.alt = "Default avatar";
    }
    if (sideName) sideName.textContent = "Student";
    if (sideRole) sideRole.textContent = "Student • English Business Grp 1";
    if (btnGetStarted) btnGetStarted.textContent = "Get Started";
    const navAdmin = document.getElementById("nav-admin");
    if (navAdmin) navAdmin.classList.add("view-hidden");
    const navApprovals = document.getElementById("nav-approvals");
    if (navApprovals) navApprovals.classList.add("view-hidden");
    if (typeof bindTeacherApprovalsListener === "function") {
      bindTeacherApprovalsListener(null, null);
    }
    const adminCta = document.getElementById("profile-admin-cta");
    if (adminCta) adminCta.classList.add("view-hidden");
    return;
  }

  const isAdmin = isSuperAdminUser(profile);
  const isTeacher = profile.role === "teacher";
  const roleDisplay = isAdmin ? "Admin" : (isTeacher ? "Teacher" : "Student");
  const academicDisplay = isAdmin ? "Administrator" : (profile.academicDetail || (isTeacher ? "Teaching Faculty" : "English Business Grp 1"));
  const displayName = (profile.displayName || (profile.firstName ? `${profile.firstName} ${profile.surname || ""}`.trim() : "") || (isAdmin ? "Adam" : (isTeacher ? "Professor" : "Student"))).trim();
  const firstName = profile.firstName || displayName.split(" ")[0] || displayName;
  const greetingName = isAdmin ? displayName : (isTeacher ? (displayName.startsWith("Prof") ? displayName : `Prof. ${displayName}`) : firstName);
  const avatarUrl = profile.photoURL || "assets/avatar.jpg";

  // Update Home Greeting
  if (homeAvatar) {
    homeAvatar.src = avatarUrl;
    homeAvatar.alt = displayName;
  }
  if (homeName) homeName.textContent = greetingName;
  if (homeRoleIcon) {
    homeRoleIcon.innerHTML = isAdmin ? '<i class="fi fi-sr-shield-check"></i>' : (isTeacher ? '<i class="fi fi-sr-chalkboard-user"></i>' : '<i class="fi fi-ss-student"></i>');
  }
  if (homeRoleText) homeRoleText.textContent = roleDisplay;
  if (homeRoleAcademic) homeRoleAcademic.textContent = academicDisplay;

  // Update Sidebar User Card
  if (sideAvatar) {
    sideAvatar.src = avatarUrl;
    sideAvatar.alt = displayName;
  }
  if (sideName) sideName.textContent = displayName;
  if (sideRole) sideRole.textContent = `${roleDisplay} • ${academicDisplay}`;

  // Update Teacher Student Approvals nav item & live notifications listener
  const navApprovals = document.getElementById("nav-approvals");
  if (navApprovals) {
    if ((isAdmin || isTeacher) && (profile.status === "approved" || isAdmin)) {
      navApprovals.classList.remove("view-hidden");
      if (typeof bindTeacherApprovalsListener === "function") {
        bindTeacherApprovalsListener(currentUser, profile);
      }
    } else {
      navApprovals.classList.add("view-hidden");
      if (typeof bindTeacherApprovalsListener === "function") {
        bindTeacherApprovalsListener(null, null);
      }
    }
  } else {
    if (typeof bindTeacherApprovalsListener === "function") {
      bindTeacherApprovalsListener(null, null);
    }
  }

  // Update Profile page & Admin dashboard if present
  renderProfileView();

  // Update Landing button text
  if (btnGetStarted) btnGetStarted.textContent = "Enter Dashboard →";
}

function initFirebaseAuthAndProfile() {
  // 1. Initialize Firebase if available
  if (typeof firebase !== "undefined") {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      auth = firebase.auth();
      db = firebase.firestore();
      if (db && typeof window !== "undefined" && !window._firestorePersistenceInitialized) {
        window._firestorePersistenceInitialized = true;
        try {
          db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
            if (err.code === "failed-precondition") {
              console.log("Firestore persistence: active in primary tab.");
            } else if (err.code === "unimplemented") {
              console.log("Firestore persistence: browser does not support persistence.");
            }
          });
        } catch (pErr) {}
      }
      if (window.AcademicRegistry && typeof window.AcademicRegistry.bindFirestoreAcademicStructure === "function") {
        window.AcademicRegistry.bindFirestoreAcademicStructure(db);
      }
    } catch (e) {
      console.warn("Firebase initialization warning:", e);
    }
  }

  // 2. Load cached profile immediately
  const cachedProfileStr = localStorage.getItem("quill_q_profile");
  if (cachedProfileStr) {
    try {
      currentProfile = JSON.parse(cachedProfileStr);
      if (isSuperAdminUser(currentProfile)) {
        currentProfile.role = "admin";
        currentProfile.status = "approved";
        currentProfile.academicDetail = "Super Admin";
        localStorage.setItem("quill_q_profile", JSON.stringify(currentProfile));
        if (db && currentProfile.uid) {
          try {
            db.collection("users").doc(currentProfile.uid).update({
              role: "admin",
              status: "approved",
              academicDetail: "Super Admin"
            }).catch(() => {});
          } catch (e) {}
        }
      }
      applyProfileToUI(currentProfile);
      if (currentProfile && currentProfile.uid) {
        if (!currentUser) {
          currentUser = {
            uid: currentProfile.uid,
            displayName: currentProfile.displayName || currentProfile.fullName || "Student",
            email: currentProfile.email || "",
            photoURL: currentProfile.photoURL || "assets/avatar.jpg"
          };
        }
        bindUserTasks(currentUser);
        bindServerSchedule(currentUser);
        bindServerChat(currentUser);
      }
      if (currentProfile && currentProfile.profileCompleted) {
        if (isSuperAdminUser(currentProfile) || currentProfile.status === "approved") {
          navigateToDashboard();
        } else {
          navigateToPendingApproval(currentProfile);
        }
      }
    } catch (e) {
      console.warn("Failed parsing cached profile", e);
    }
  }

  // DOM Elements
  const btnGetStarted = document.getElementById("btn-get-started");
  const btnAuthBack = document.getElementById("btn-auth-back");
  const btnGoogleSignin = document.getElementById("btn-google-signin");
  const stepSignin = document.getElementById("auth-step-signin");
  const stepOnboarding = document.getElementById("auth-step-onboarding");

  const onboardingForm = document.getElementById("onboarding-form");
  const onboardingPreviewAvatar = document.getElementById("onboarding-preview-avatar");
  const onboardingAvatarInitial = document.getElementById("onboarding-avatar-initial");
  const onboardingAvatarBadge = document.getElementById("onboarding-avatar-badge");
  const rowStudentName = document.getElementById("row-student-name");
  const groupTeacherName = document.getElementById("group-teacher-name");
  const onboardingTeacherSelect = document.getElementById("onboarding-teacher-select");
  const onboardingName = document.getElementById("onboarding-name");
  const onboardingSurname = document.getElementById("onboarding-surname");
  const onboardingGender = document.getElementById("onboarding-gender");
  const onboardingGroupAcademic = document.getElementById("onboarding-group-academic");
  const onboardingAcademicSelect = document.getElementById("onboarding-academic-select");
  const onboardingGroupTeacherSubject = document.getElementById("onboarding-group-teacher-subject");
  const onboardingTeacherSubjectVal = document.getElementById("onboarding-teacher-subject-val");
  const roleLabelStudent = document.getElementById("role-label-student");
  const roleLabelTeacher = document.getElementById("role-label-teacher");
  const roleSelectedVal = document.getElementById("role-selected-val");
  const btnSubmitOnboarding = document.getElementById("btn-submit-onboarding");
  const btnSubmitOnboardingText = document.getElementById("btn-submit-onboarding-text");
  const btnSidebarLogout = document.getElementById("btn-sidebar-logout");

  const onboardingSubjectDropdownHelper = setupSearchableDropdown({
    wrapEl: document.getElementById("onboarding-subject-dropdown-wrap"),
    triggerEl: document.getElementById("onboarding-teacher-subject-trigger"),
    labelEl: document.getElementById("onboarding-teacher-subject-label"),
    menuEl: document.getElementById("onboarding-teacher-subject-menu"),
    searchEl: document.getElementById("onboarding-teacher-subject-search"),
    optionsEl: document.getElementById("onboarding-teacher-subject-options"),
    hiddenInput: document.getElementById("onboarding-teacher-subject-val"),
    getItems: () => {
      const selectedClassIds = (window.ProfileManager && typeof window.ProfileManager.getSelectedTeacherClasses === "function")
        ? window.ProfileManager.getSelectedTeacherClasses()
        : ["2ang-aff"];
      const uniqueSubs = [];
      const seen = new Set();
      selectedClassIds.forEach((cId) => {
        const subs = window.AcademicRegistry ? window.AcademicRegistry.getSubjectsForClass(cId) : [];
        subs.forEach((s) => {
          if (!seen.has(s.name.toLowerCase())) {
            seen.add(s.name.toLowerCase());
            uniqueSubs.push({ id: s.id, name: s.name, code: s.code });
          }
        });
      });
      return uniqueSubs;
    },
    placeholder: "Select from curriculum subjects...",
    onSelect: (val) => {}
  });

  window.onTeacherSelectedClassesChanged = () => {
    if (onboardingSubjectDropdownHelper) {
      onboardingSubjectDropdownHelper.refresh();
    }
  };

  const SCHEDULE_TEACHERS = [
    { name: "نسرين بن الصادق", subject: "Writing", gender: "Female" },
    { name: "عيادي روضة", subject: "British History", gender: "Female" },
    { name: "غربي إيمان", subject: "Financial English 1", gender: "Female" },
    { name: "بن شهيدة مريم", subject: "Drama / Poetry / Novel", gender: "Female" },
    { name: "شنيس علي صلاح", subject: "Entrepreneurial Skills (Droit)", gender: "Male" },
    { name: "الشرقي سهلة", subject: "Commercial English 1", gender: "Female" },
    { name: "رانية الإدريس", subject: "Introduction to Linguistics", gender: "Female" },
    { name: "عنيف حافظ", subject: "Literary Trends", gender: "Male" },
    { name: "كعمون وسيم", subject: "US History", gender: "Male" },
    { name: "العفاس نجلاء", subject: "Grammar in Context", gender: "Female" },
    { name: "بن علي حافظ", subject: "Other Languages (French)", gender: "Male" },
    { name: "مريم الهماصي", subject: "Other Languages (Arabic)", gender: "Female" },
    { name: "غمامي سناء", subject: "Drama / Poetry / Novel", gender: "Female" },
    { name: "كلثوم بالوافي", subject: "Drama / Poetry / Novel", gender: "Female" },
    { name: "غربي أحمد عبد العزيز", subject: "Financial English 1", gender: "Male" },
    { name: "الغندري أحلام", subject: "Entrepreneurial Skills", gender: "Female" }
  ];

  function showOnboardingStep(user) {
    if (stepSignin) stepSignin.classList.add("view-hidden");
    if (stepOnboarding) stepOnboarding.classList.remove("view-hidden");

    if (user) {
      const initialChar = (user.displayName || "Q").trim().charAt(0).toUpperCase() || "Q";
      if (onboardingAvatarInitial) onboardingAvatarInitial.textContent = initialChar;

      if (onboardingPreviewAvatar) {
        if (user.photoURL) {
          onboardingPreviewAvatar.style.display = "block";
          onboardingPreviewAvatar.src = user.photoURL;
        } else {
          onboardingPreviewAvatar.src = "assets/avatar.jpg";
        }
      }

      if (user.displayName) {
        const parts = user.displayName.trim().split(" ");
        const first = parts[0] || "";
        const sur = parts.slice(1).join(" ") || "";
        if (onboardingName && !onboardingName.value) onboardingName.value = first;
        if (onboardingSurname && !onboardingSurname.value) onboardingSurname.value = sur;
      }
    }

    if (window.ProfileManager && typeof window.ProfileManager.populateOnboardingAcademicSelectors === "function") {
      window.ProfileManager.populateOnboardingAcademicSelectors();
    }

    selectRole("student");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function syncTeacherDetails() {
    if (!onboardingTeacherSelect) return;
    const selectedName = onboardingTeacherSelect.value;
    const matchedTeacher = SCHEDULE_TEACHERS.find((t) => t.name === selectedName);
    if (matchedTeacher) {
      if (onboardingTeacherSubjectVal) {
        onboardingTeacherSubjectVal.value = matchedTeacher.subject;
      }
      if (onboardingGender) {
        onboardingGender.value = matchedTeacher.gender;
      }
    }
  }

  function selectRole(role) {
    const isTeacher = role === "teacher";
    if (roleSelectedVal) roleSelectedVal.value = role;

    const rowStudentAcademic = document.getElementById("row-student-academic");
    const teacherSection = document.getElementById("onboarding-group-teacher-section");
    const onboardingClassSelect = document.getElementById("onboarding-class-select");
    const onboardingGroupSelect = document.getElementById("onboarding-group-select");

    if (isTeacher) {
      if (roleLabelTeacher) roleLabelTeacher.classList.add("selected");
      if (roleLabelStudent) roleLabelStudent.classList.remove("selected");
      if (onboardingAvatarBadge) onboardingAvatarBadge.innerHTML = '<i class="fi fi-sr-chalkboard-user"></i>';

      // For teacher: show First Name & Surname inputs, show Teacher section (Subject & Multi-Classes chips), hide student class/group dropdowns
      if (rowStudentName) rowStudentName.classList.remove("view-hidden");
      if (groupTeacherName) groupTeacherName.classList.add("view-hidden");
      if (rowStudentAcademic) rowStudentAcademic.classList.add("view-hidden");
      if (onboardingGroupAcademic) onboardingGroupAcademic.classList.add("view-hidden");
      if (teacherSection) teacherSection.classList.remove("view-hidden");
      if (onboardingGroupTeacherSubject) onboardingGroupTeacherSubject.classList.add("view-hidden");

      if (onboardingClassSelect) onboardingClassSelect.disabled = true;
      if (onboardingGroupSelect) onboardingGroupSelect.disabled = true;
      if (onboardingTeacherSubjectVal) {
        onboardingTeacherSubjectVal.required = true;
        onboardingTeacherSubjectVal.disabled = false;
      }
      if (onboardingName) {
        onboardingName.required = true;
        onboardingName.disabled = false;
      }
      if (onboardingSurname) {
        onboardingSurname.required = false;
        onboardingSurname.disabled = false;
      }
      if (onboardingTeacherSelect) {
        onboardingTeacherSelect.required = false;
        onboardingTeacherSelect.disabled = true;
      }
      if (onboardingSubjectDropdownHelper) {
        onboardingSubjectDropdownHelper.refresh();
      }
    } else {
      if (roleLabelStudent) roleLabelStudent.classList.add("selected");
      if (roleLabelTeacher) roleLabelTeacher.classList.remove("selected");
      if (onboardingAvatarBadge) onboardingAvatarBadge.innerHTML = '<i class="fi fi-ss-student"></i>';

      // For student: show First Name & Surname inputs, show student class/group dropdowns, hide teacher section
      if (rowStudentName) rowStudentName.classList.remove("view-hidden");
      if (groupTeacherName) groupTeacherName.classList.add("view-hidden");
      if (rowStudentAcademic) rowStudentAcademic.classList.remove("view-hidden");
      if (onboardingGroupAcademic) onboardingGroupAcademic.classList.remove("view-hidden");
      if (teacherSection) teacherSection.classList.add("view-hidden");
      if (onboardingGroupTeacherSubject) onboardingGroupTeacherSubject.classList.add("view-hidden");

      if (onboardingClassSelect) onboardingClassSelect.disabled = false;
      if (onboardingGroupSelect) onboardingGroupSelect.disabled = false;
      if (onboardingTeacherSubjectVal) {
        onboardingTeacherSubjectVal.required = false;
        onboardingTeacherSubjectVal.disabled = true;
      }
      if (onboardingName) {
        onboardingName.required = true;
        onboardingName.disabled = false;
      }
      if (onboardingSurname) {
        onboardingSurname.required = false;
        onboardingSurname.disabled = false;
      }
      if (onboardingTeacherSelect) {
        onboardingTeacherSelect.required = false;
        onboardingTeacherSelect.disabled = true;
      }
    }
  }

  // Role card clicking
  if (roleLabelStudent) {
    roleLabelStudent.addEventListener("click", () => selectRole("student"));
  }
  if (roleLabelTeacher) {
    roleLabelTeacher.addEventListener("click", () => selectRole("teacher"));
  }

  // Back button on Auth Page
  if (btnAuthBack) {
    btnAuthBack.addEventListener("click", navigateToLanding);
  }

  // "Get Started" Click Handler
  if (btnGetStarted) {
    btnGetStarted.addEventListener("click", () => {
      if (currentProfile && currentProfile.profileCompleted) {
        navigateToDashboard();
        return;
      }

      if (currentUser && (!currentProfile || !currentProfile.profileCompleted)) {
        navigateToAuth();
        showOnboardingStep(currentUser);
        return;
      }

      // Not authenticated -> show the Auth page with Google Sign In
      navigateToAuth();
    });
  }

  // Google Sign-In button
  if (btnGoogleSignin) {
    btnGoogleSignin.addEventListener("click", async () => {
      if (!auth) {
        alert("Firebase is initializing. Please try again in a few moments.");
        return;
      }

      const googleBtnText = document.getElementById("google-btn-text");
      const originalText = googleBtnText ? googleBtnText.textContent : "Continue with Google";

      try {
        if (googleBtnText) googleBtnText.textContent = "Connecting to Google...";
        btnGoogleSignin.disabled = true;

        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        currentUser = user;

        // Check if user already exists with completed profile
        let profileData = null;
        if (db) {
          try {
            const userDoc = await db.collection("users").doc(user.uid).get();
            if (userDoc.exists) {
              profileData = userDoc.data();
            }
          } catch (docErr) {
            console.warn("Firestore lookup error:", docErr);
          }
        }

        if (profileData && profileData.profileCompleted) {
          currentProfile = profileData;
          localStorage.setItem("quill_q_profile", JSON.stringify(profileData));
          applyProfileToUI(profileData);

          const isAdmin = isSuperAdminUser(profileData);
          const isApproved = profileData.status === "approved" || isAdmin;

          if (isApproved) {
            bindUserTasks(user);
            navigateToDashboard();
          } else {
            bindUserTasks(null);
            navigateToPendingApproval(profileData);
          }
        } else {
          // New user -> reveal Role selection and profile creation form right on page!
          showOnboardingStep(user);
        }
      } catch (err) {
        console.error("Google sign-in error:", err);
        if (err.code !== "auth/popup-closed-by-user") {
          alert("Could not complete Google sign-in: " + (err.message || "Unknown error"));
        }
      } finally {
        if (googleBtnText) googleBtnText.textContent = originalText;
        btnGoogleSignin.disabled = false;
      }
    });
  }

  // Handle Onboarding Profile Form Submission
  if (onboardingForm) {
    onboardingForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!currentUser && auth && auth.currentUser) {
        currentUser = auth.currentUser;
      }

      if (!currentUser) {
        alert("Session expired. Please sign in with Google again.");
        navigateToAuth();
        return;
      }

      const userEmail = (currentUser.email || "").toLowerCase().trim();
      const isAdminAccount = userEmail === "dodchadam@gmail.com" || userEmail === "dotchadam@gmail.com";
      const selectedRole = isAdminAccount ? "admin" : (roleSelectedVal ? roleSelectedVal.value : "student");
      firstName = onboardingName ? onboardingName.value.trim() : "";
      surname = onboardingSurname ? onboardingSurname.value.trim() : "";
      fullName = (firstName && surname) ? `${firstName} ${surname}` : (firstName || surname || currentUser.displayName || (isAdminAccount ? "Adam" : (selectedRole === "teacher" ? "Professor" : "Student")));

      const gender = onboardingGender ? onboardingGender.value : "Male";
      let academicDetail = "";
      let userGroup = "grp1";
      let userClassId = "2ang-aff";
      let userClassName = "2nd Year Business English";
      let userGroupName = "Group 1";
      let teachingClasses = [];
      let teachingSubjects = [];

      const onboardingClassSelect = document.getElementById("onboarding-class-select");
      const onboardingGroupSelect = document.getElementById("onboarding-group-select");

      if (isAdminAccount) {
        academicDetail = "Super Admin";
        userGroup = "grp1";
        userClassId = "2ang-aff";
        userClassName = "2nd Year Business English";
        userGroupName = "Group 1";
        teachingClasses = window.AcademicRegistry ? window.AcademicRegistry.getAllClasses().map(c => c.id) : ["2ang-aff", "2ang-trad"];
      } else if (selectedRole === "teacher") {
        const subjectVal = (onboardingTeacherSubjectVal && onboardingTeacherSubjectVal.value.trim()) || "Teaching Faculty";
        teachingClasses = (window.ProfileManager && window.ProfileManager.getSelectedTeacherClasses()) || ["2ang-aff"];
        teachingSubjects = [subjectVal];
        const classCount = teachingClasses.length;
        academicDetail = `${subjectVal} • ${classCount} ${classCount === 1 ? "Class" : "Classes"}`;
        userGroup = "grp1";
        userClassId = teachingClasses[0] || "2ang-aff";
        const clsObj = window.AcademicRegistry ? window.AcademicRegistry.getClassById(userClassId) : null;
        userClassName = clsObj ? clsObj.name : "Class";
      } else {
        // Student
        userClassId = (onboardingClassSelect && onboardingClassSelect.value) || "2ang-aff";
        const clsObj = window.AcademicRegistry ? window.AcademicRegistry.getClassById(userClassId) : null;
        userClassName = clsObj ? clsObj.name : "2nd Year Business English";
        const classCode = clsObj ? clsObj.code : "2ANG-AFF";

        userGroup = (onboardingGroupSelect && onboardingGroupSelect.value) || "grp1";
        const grpObj = (window.AcademicRegistry && typeof window.AcademicRegistry.getGroup === "function") ? window.AcademicRegistry.getGroup(userClassId, userGroup) : null;
        userGroupName = grpObj ? grpObj.name : (userGroup === "grp2" ? "Group 2" : "Group 1");

        academicDetail = `${classCode} (${userGroupName})`;
      }

      const userStatus = isAdminAccount ? "approved" : "pending";

      const profilePayload = {
        uid: currentUser.uid,
        displayName: fullName,
        firstName: firstName,
        surname: surname,
        email: userEmail,
        photoURL: currentUser.photoURL || "assets/avatar.jpg",
        role: selectedRole,
        gender: gender,
        classId: userClassId,
        className: userClassName,
        group: userGroup,
        groupName: userGroupName,
        teachingClasses: teachingClasses,
        teachingSubjects: teachingSubjects,
        academicDetail: academicDetail,
        status: userStatus,
        profileCompleted: true,
        updatedAt: new Date().toISOString()
      };

      try {
        if (btnSubmitOnboardingText) btnSubmitOnboardingText.textContent = "Setting up account...";
        if (btnSubmitOnboarding) btnSubmitOnboarding.disabled = true;

        if (db) {
          try {
            await db.collection("users").doc(currentUser.uid).set(profilePayload, { merge: true });
          } catch (dbErr) {
            console.warn("Firestore save warning (cached locally):", dbErr);
          }
        }

        if (userStatus === "pending" && typeof broadcastPushNotification === "function") {
          const isTeacherReg = profilePayload.role === "teacher";
          const roleLabel = isTeacherReg ? "Teacher" : "Student";
          const academicInfo = isTeacherReg
            ? "Teaching Faculty"
            : `${profilePayload.className || "Class"} (${profilePayload.groupName || (profilePayload.group === "grp2" ? "Group 2" : "Group 1")})`;
          broadcastPushNotification({
            title: `🎓 New ${roleLabel} Registration Request`,
            body: `${profilePayload.displayName || "Someone"} requested approval for ${academicInfo}. Tap to review.`,
            targetView: "approvals",
            targetRole: isTeacherReg ? "admin" : "teacher",
            tag: `approval-request-${currentUser.uid}`
          });
        }

        currentProfile = profilePayload;
        localStorage.setItem("quill_q_profile", JSON.stringify(profilePayload));
        applyProfileToUI(profilePayload);

        if (userStatus === "approved" || isAdminAccount) {
          bindUserTasks(currentUser);
          navigateToDashboard();
        } else {
          bindUserTasks(null);
          navigateToPendingApproval(profilePayload);
        }
      } catch (saveErr) {
        console.error("Error saving profile:", saveErr);
        currentProfile = profilePayload;
        localStorage.setItem("quill_q_profile", JSON.stringify(profilePayload));
        applyProfileToUI(profilePayload);
        if (userStatus === "approved" || isAdminAccount) {
          bindUserTasks(currentUser);
          navigateToDashboard();
        } else {
          bindUserTasks(null);
          navigateToPendingApproval(profilePayload);
        }
      } finally {
        if (btnSubmitOnboardingText) btnSubmitOnboardingText.textContent = "Create Account & Enter Dashboard";
        if (btnSubmitOnboarding) btnSubmitOnboarding.disabled = false;
      }
    });

    if (btnSubmitOnboarding) {
      btnSubmitOnboarding.addEventListener("click", () => {
        if (typeof onboardingForm.requestSubmit === "function") {
          onboardingForm.requestSubmit();
        }
      });
    }
  }

  // Pending Approval page buttons (Check status & Sign out)
  const btnPendingRefresh = document.getElementById("btn-pending-refresh");
  if (btnPendingRefresh) {
    btnPendingRefresh.addEventListener("click", async () => {
      if (!currentUser && auth && auth.currentUser) {
        currentUser = auth.currentUser;
      }
      if (!currentUser) {
        navigateToAuth();
        return;
      }
      if (db) {
        btnPendingRefresh.disabled = true;
        btnPendingRefresh.innerHTML = "<span>Checking...</span>";
        try {
          const snap = await db.collection("users").doc(currentUser.uid).get();
          if (snap.exists && snap.data()) {
            const data = snap.data();
            currentProfile = data;
            localStorage.setItem("quill_q_profile", JSON.stringify(data));
            applyProfileToUI(data);

            if (data.status === "approved" || isSuperAdminUser(data)) {
              bindUserTasks(currentUser);
              await showCustomAlert("Congratulations! Your account has been approved by the admin.", "Approved", '<i class="fi fi-rr-badge-check"></i>');
              navigateToDashboard();
              return;
            } else if (data.status === "declined") {
              await showCustomAlert("Your account registration request has not been approved. Please contact the administrator.", "Registration Status", '<i class="fi fi-rr-cross-circle"></i>');
            } else {
              await showCustomAlert("Your profile is still awaiting review by the administrator.", "Pending Review", '<i class="fi fi-rr-time-quarter-to"></i>');
            }
          }
        } catch (e) {
          console.warn("Status check error", e);
        } finally {
          btnPendingRefresh.disabled = false;
          btnPendingRefresh.innerHTML = '<span>Check Status</span> <i class="fi fi-rr-refresh" style="font-size: 14px;"></i>';
        }
      }
    });
  }

  const btnPendingSignout = document.getElementById("btn-pending-signout");
  if (btnPendingSignout) {
    btnPendingSignout.addEventListener("click", async () => {
      if (auth) {
        try { await auth.signOut(); } catch (e) {}
      }
      currentUser = null;
      currentProfile = null;
      localStorage.removeItem("quill_q_profile");
      applyProfileToUI(null);
      navigateToLanding();
    });
  }

  // Sidebar Logout
  if (btnSidebarLogout) {
    btnSidebarLogout.addEventListener("click", async () => {
      const confirmed = await showCustomConfirm(
        "Are you sure you want to sign out of Quill-Q?",
        "Sign Out",
        '<i class="fi fi-rr-sign-out-alt"></i>',
        "Sign Out",
        "Cancel",
        false
      );
      if (confirmed) {
        if (auth) {
          try {
            await auth.signOut();
          } catch (e) {
            console.warn("Sign out error", e);
          }
        }
        currentUser = null;
        currentProfile = null;
        localStorage.removeItem("quill_q_profile");
        bindUserTasks(null);
        bindServerSchedule(null);
        bindServerChat(null);
        applyProfileToUI(null);
        navigateToLanding();
      }
    });
  }

  // Firebase Auth State Listener
  if (auth) {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        currentUser = user;
        let profile = currentProfile;
        if (!profile || profile.uid !== user.uid) {
          if (db) {
            try {
              const snap = await db.collection("users").doc(user.uid).get();
              if (snap.exists && snap.data() && snap.data().profileCompleted) {
                profile = snap.data();
                currentProfile = profile;
                localStorage.setItem("quill_q_profile", JSON.stringify(profile));
              }
            } catch (err) {
              console.warn("Auth state profile fetch error:", err);
            }
          }
        }

        if (profile && profile.profileCompleted) {
          applyProfileToUI(profile);
          const isAdmin = isSuperAdminUser(profile);
          const isApproved = profile.status === "approved" || isAdmin;

          if (isApproved) {
            bindUserTasks(user);
            bindServerSchedule(user);
            bindServerChat(user);
            bindQuickNotesListener(user);
            if (typeof Notification !== "undefined" && Notification.permission === "granted") {
              registerDeviceFCMToken().catch(console.warn);
            }
            navigateToDashboard();
            renderSubjectsView();
          } else {
            bindUserTasks(null);
            bindServerSchedule(null);
            bindServerChat(null);
            bindQuickNotesListener(null);
            navigateToPendingApproval(profile);
          }
        }
      } else {
        currentUser = null;
        currentProfile = null;
        localStorage.removeItem("quill_q_profile");
        bindUserTasks(null);
        bindServerSchedule(null);
        bindServerChat(null);
        bindQuickNotesListener(null);
        applyProfileToUI(null);
      }
    });
  }

  // Live real-time updates when academic classes or subjects change
  if (window.AcademicRegistry && typeof window.AcademicRegistry.onAcademicStructureChange === "function") {
    window.AcademicRegistry.onAcademicStructureChange(() => {
      renderSubjectsView();
    });
  }
}

// ===== Profile View & Admin Dashboard Management =====
let adminUsersListener = null;
let currentAdminTab = "pending";
let cachedAdminUsers = [];

function isSuperAdminUser(profile) {
  if (!profile) return false;
  const email = (profile.email || "").toLowerCase().trim();
  return profile.role === "admin" || email === "dodchadam@gmail.com" || email === "dotchadam@gmail.com";
}

function renderProfileView() {
  const pAvatar = document.getElementById("profile-page-avatar");
  const pBadge = document.getElementById("profile-page-badge");
  const pFullName = document.getElementById("profile-page-fullname");
  const pRolePill = document.getElementById("profile-page-role-pill");
  const pEmail = document.getElementById("profile-page-email");
  const pRoleText = document.getElementById("profile-page-role-text");
  const pAcademicText = document.getElementById("profile-page-academic-text");
  const pStatusText = document.getElementById("profile-page-status-text");
  const adminPanel = document.getElementById("admin-management-panel");

  const profile = currentProfile;
  if (!profile) return;

  const isAdmin = isSuperAdminUser(profile);
  const isTeacher = profile.role === "teacher";
  const displayName = profile.displayName || profile.firstName || (isAdmin ? "Adam" : "Student");

  if (pAvatar) pAvatar.src = profile.photoURL || "assets/avatar.jpg";
  if (pBadge) {
    pBadge.innerHTML = isAdmin ? '<i class="fi fi-sr-shield-check"></i>' : (isTeacher ? '<i class="fi fi-sr-chalkboard-user"></i>' : '<i class="fi fi-ss-student"></i>');
  }
  if (pFullName) pFullName.textContent = displayName;
  if (pEmail) pEmail.textContent = profile.email || "No email";
  if (pRolePill) {
    pRolePill.textContent = isAdmin ? "ADMIN" : (isTeacher ? "TEACHER" : "STUDENT");
    pRolePill.style.background = isAdmin ? "#e89838" : (isTeacher ? "#a9c6ec" : "#98d6aa");
  }
  if (pRoleText) pRoleText.textContent = isAdmin ? "Administrator" : (isTeacher ? "Teacher" : "Student");
  if (pAcademicText) pAcademicText.textContent = isAdmin ? "Super Admin" : (profile.academicDetail || "English Business Grp 1");
  if (pStatusText) {
    const isApproved = profile.status === "approved" || isAdmin;
    pStatusText.textContent = isApproved ? "Approved" : "Pending Approval";
    pStatusText.style.color = isApproved ? "#166534" : "#b45309";
  }

  // Admin Portal entry points: visible strictly to dotchadam@gmail.com / admin role
  const adminHeroBtn = document.getElementById("profile-admin-btn-wrap");
  const adminHeaderBtn = document.getElementById("profile-header-admin-btn-wrap");
  const adminCta = document.getElementById("profile-admin-cta");

  if (adminHeroBtn) {
    if (isAdmin) adminHeroBtn.classList.remove("view-hidden");
    else adminHeroBtn.classList.add("view-hidden");
  }
  if (adminHeaderBtn) {
    if (isAdmin) adminHeaderBtn.classList.remove("view-hidden");
    else adminHeaderBtn.classList.add("view-hidden");
  }
  if (adminCta) {
    if (isAdmin) adminCta.classList.remove("view-hidden");
    else adminCta.classList.add("view-hidden");
  }

  if (adminPanel) {
    if (isAdmin) {
      adminPanel.classList.remove("view-hidden");
      initAdminDashboard();
    } else {
      adminPanel.classList.add("view-hidden");
    }
  }
}

let teacherApprovalsFilterClass = "all";
let teacherApprovalsUnsubscribe = null;
let isFirstApprovalsSnapshot = true;

function updateTeacherApprovalsBadgeUI(count) {
  const badge = document.getElementById("nav-approvals-badge");
  const mobileDot = document.getElementById("mobile-approvals-dot");
  if (badge) {
    if (count > 0) {
      badge.textContent = count > 99 ? "99+" : String(count);
      badge.classList.remove("view-hidden");
      badge.classList.add("badge-live-pulse");
    } else {
      badge.classList.add("view-hidden");
      badge.classList.remove("badge-live-pulse");
      badge.textContent = "0";
    }
  }
  if (mobileDot) {
    if (count > 0) {
      mobileDot.classList.remove("view-hidden");
    } else {
      mobileDot.classList.add("view-hidden");
    }
  }
}

async function updateTeacherApprovalsBadge(profile) {
  if (!profile || !db) return;
  if (!isSuperAdminUser(profile) && profile.role !== "teacher") {
    updateTeacherApprovalsBadgeUI(0);
    return;
  }
  try {
    const pending = window.ProfileManager ? await window.ProfileManager.fetchTeacherPendingStudents(db, profile) : [];
    updateTeacherApprovalsBadgeUI(pending.length);
  } catch (e) {
    console.warn("Approvals badge error:", e);
  }
}

function bindTeacherApprovalsListener(user, profile) {
  if (teacherApprovalsUnsubscribe) {
    try { teacherApprovalsUnsubscribe(); } catch (e) {}
    teacherApprovalsUnsubscribe = null;
  }

  if (!user || !profile || !db) {
    updateTeacherApprovalsBadgeUI(0);
    return;
  }

  const isTeacher = profile.role === "teacher";
  const isAdmin = isSuperAdminUser(profile);

  if (!isAdmin && !isTeacher) {
    updateTeacherApprovalsBadgeUI(0);
    return;
  }

  isFirstApprovalsSnapshot = true;

  try {
    teacherApprovalsUnsubscribe = db.collection("users")
      .where("status", "==", "pending")
      .onSnapshot((snapshot) => {
        const pendingForMe = [];

        snapshot.forEach((doc) => {
          const student = { id: doc.id, ...doc.data() };
          if (isSuperAdminUser(student)) return;

          if (isAdmin) {
            pendingForMe.push(student);
          } else if (isTeacher) {
            const teacherClasses = Array.isArray(profile.teachingClasses) && profile.teachingClasses.length > 0
              ? profile.teachingClasses
              : (profile.classId ? [profile.classId] : ["business_2"]);
            const studentClass = student.classId || "business_2";
            if (student.role !== "teacher" && teacherClasses.includes(studentClass)) {
              pendingForMe.push(student);
            }
          }
        });

        updateTeacherApprovalsBadgeUI(pendingForMe.length);

        // Notify on live real-time additions (brand new registrations)
        if (!isFirstApprovalsSnapshot && snapshot.docChanges) {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const uData = change.doc.data();
              if (uData && uData.status === "pending" && !isSuperAdminUser(uData)) {
                const isRelevant = isAdmin || (
                  isTeacher &&
                  uData.role !== "teacher" &&
                  (Array.isArray(profile.teachingClasses) && profile.teachingClasses.length > 0
                    ? profile.teachingClasses.includes(uData.classId || "business_2")
                    : (profile.classId || "business_2") === (uData.classId || "business_2"))
                );

                if (isRelevant) {
                  // 1. Play audible chime
                  playNotificationChime();

                  // 2. Class & student display names
                  const studentName = uData.displayName || uData.firstName || "A student";
                  const clsObj = window.AcademicRegistry ? window.AcademicRegistry.getClassById(uData.classId) : null;
                  const grpObj = (window.AcademicRegistry && typeof window.AcademicRegistry.getGroup === "function") ? window.AcademicRegistry.getGroup(uData.classId, uData.group) : null;
                  const classDisplayName = clsObj ? clsObj.name : (uData.className || "Class");
                  const groupDisplayName = grpObj ? grpObj.name : (uData.group === "grp2" ? "Group 2" : "Group 1");

                  // 3. In-App Toast
                  showInAppToast({
                    type: "approval",
                    targetView: "approvals",
                    title: "🎓 New Approval Request",
                    message: `${studentName} requested approval for ${classDisplayName} (${groupDisplayName}). Tap to review.`
                  });

                  // 4. System / Browser Desktop Notification
                  sendSystemNotification("🎓 New Student Approval Request", {
                    body: `${studentName} requested approval for ${classDisplayName} (${groupDisplayName}). Tap to review.`,
                    tag: `approval-${change.doc.id}`
                  }, () => {
                    const items = document.querySelectorAll(".nav-item");
                    items.forEach((i) => i.classList.remove("active"));
                    const navAppr = document.getElementById("nav-approvals");
                    if (navAppr) navAppr.classList.add("active");
                    switchView("approvals");
                  });
                }
              }
            }
          });
        }

        isFirstApprovalsSnapshot = false;

        // If currently on the Approvals tab, refresh its data in real time
        const activeNav = document.querySelector(".nav-item.active");
        if (activeNav && activeNav.dataset.page === "approvals") {
          renderTeacherApprovalsView();
        }
      }, (err) => {
        console.warn("Teacher approvals live listener error:", err);
      });
  } catch (err) {
    console.error("bindTeacherApprovalsListener error:", err);
  }
}

async function renderTeacherApprovalsView() {
  const profile = currentProfile;
  if (!profile) return;
  const isTeacherOrAdmin = isSuperAdminUser(profile) || profile.role === "teacher";
  if (!isTeacherOrAdmin) return;

  const tabsContainer = document.getElementById("teacher-approval-class-tabs");
  const pendingCountEl = document.getElementById("teacher-pending-count");
  const pendingListEl = document.getElementById("teacher-pending-students-list");
  const enrolledCountEl = document.getElementById("teacher-enrolled-count");
  const enrolledListEl = document.getElementById("teacher-enrolled-students-list");
  const btnRefresh = document.getElementById("btn-refresh-teacher-approvals");

  if (btnRefresh && !btnRefresh.dataset.bound) {
    btnRefresh.dataset.bound = "true";
    btnRefresh.addEventListener("click", () => renderTeacherApprovalsView());
  }

  // Render Class Filter Tabs
  if (tabsContainer && window.AcademicRegistry) {
    const allClasses = window.AcademicRegistry.getAllClasses();
    const classes = isSuperAdminUser(profile) ? allClasses : allClasses.filter(c => window.ProfileManager ? window.ProfileManager.teacherTeachesClass(profile, c.id) : true);

    let tabsHtml = `<button type="button" class="group-tab-btn ${teacherApprovalsFilterClass === "all" ? "active" : ""}" data-class-filter="all">All Classes</button>`;
    classes.forEach(c => {
      tabsHtml += `<button type="button" class="group-tab-btn ${teacherApprovalsFilterClass === c.id ? "active" : ""}" data-class-filter="${c.id}">${c.shortName || c.name}</button>`;
    });
    tabsContainer.innerHTML = tabsHtml;

    tabsContainer.querySelectorAll(".group-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        teacherApprovalsFilterClass = btn.dataset.classFilter || "all";
        renderTeacherApprovalsView();
      });
    });
  }

  if (pendingListEl) {
    pendingListEl.innerHTML = `<div style="padding: 20px; text-align: center; color: #72685d; font-size: 14px;">Loading pending students...</div>`;
  }

  try {
    const pendingStudents = window.ProfileManager ? await window.ProfileManager.fetchTeacherPendingStudents(db, profile) : [];
    const enrolledStudents = window.ProfileManager ? await window.ProfileManager.fetchTeacherEnrolledStudents(db, profile) : [];

    // Filter by selected tab
    const filteredPending = teacherApprovalsFilterClass === "all" ? pendingStudents : pendingStudents.filter(s => s.classId === teacherApprovalsFilterClass);
    const filteredEnrolled = teacherApprovalsFilterClass === "all" ? enrolledStudents : enrolledStudents.filter(s => s.classId === teacherApprovalsFilterClass);

    // Update counts & badges
    if (pendingCountEl) pendingCountEl.textContent = String(filteredPending.length);
    if (enrolledCountEl) enrolledCountEl.textContent = String(filteredEnrolled.length);
    updateTeacherApprovalsBadge(profile);

    // Render Pending List
    if (pendingListEl) {
      if (filteredPending.length === 0) {
        pendingListEl.innerHTML = `
          <div style="padding: 30px 20px; text-align: center; background: #faf6ee; border: 2px dashed #ded6c5; border-radius: 14px;">
            <div style="font-size: 28px; margin-bottom: 6px;">🎉</div>
            <p style="margin: 0; font-weight: 700; color: #1a1816; font-size: 15px;">All clear! No pending student registrations.</p>
            <p style="margin: 4px 0 0; font-size: 13px; color: #72685d;">When new students register for your classes, they will appear here for your review.</p>
          </div>
        `;
      } else {
        pendingListEl.innerHTML = filteredPending.map(student => {
          const clsObj = window.AcademicRegistry ? window.AcademicRegistry.getClassById(student.classId) : null;
          const grpObj = (window.AcademicRegistry && typeof window.AcademicRegistry.getGroup === "function") ? window.AcademicRegistry.getGroup(student.classId, student.group) : null;
          const classDisplayName = clsObj ? clsObj.name : (student.className || "Class");
          const groupDisplayName = grpObj ? grpObj.name : (student.groupName || (student.group === "grp2" ? "Group 2" : "Group 1"));
          const initials = (student.displayName || student.firstName || "S").trim().charAt(0).toUpperCase();

          return `
            <div class="pending-student-card" style="
              display: flex; align-items: center; justify-content: space-between; gap: 14px;
              background: #fffdf8; border: 2px solid #1a1816; border-radius: 14px; padding: 14px 18px;
              box-shadow: 2px 3px 0px #1a1816; flex-wrap: wrap;
            ">
              <div style="display: flex; align-items: center; gap: 12px; min-width: 220px;">
                <div style="
                  width: 44px; height: 44px; border-radius: 50%; border: 2px solid #1a1816;
                  background: #fdf2d8; display: flex; align-items: center; justify-content: center;
                  font-family: 'Patrick Hand', cursive; font-size: 22px; font-weight: 700; color: #1a1816;
                  overflow: hidden; flex-shrink: 0;
                ">
                  ${student.photoURL ? `<img src="${escapeHtml(student.photoURL)}" alt="Avatar" style="width:100%; height:100%; object-fit:cover;" />` : initials}
                </div>
                <div>
                  <h4 style="margin: 0; font-size: 15.5px; font-weight: 800; color: #1a1816;">${escapeHtml(student.displayName || `${student.firstName || ""} ${student.surname || ""}`.trim() || "Student")}</h4>
                  <p style="margin: 2px 0 0; font-size: 12.5px; color: #72685d;">${escapeHtml(student.email || "")}</p>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span style="font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 10px; border: 1.5px solid #1a1816; background: #e0f2fe; color: #0369a1;">
                  📚 ${escapeHtml(classDisplayName)}
                </span>
                <span style="font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 10px; border: 1.5px solid #1a1816; background: #fef3c7; color: #92400e;">
                  👥 ${escapeHtml(groupDisplayName)}
                </span>
              </div>

              <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                <button type="button" class="btn-approve-student" data-id="${student.id}" data-name="${escapeHtml(student.displayName || "Student")}" style="
                  display: inline-flex; align-items: center; gap: 5px; padding: 7px 14px;
                  background: #dcfce7; color: #15803d; border: 2px solid #1a1816; border-radius: 10px;
                  font-weight: 800; font-size: 13px; cursor: pointer; box-shadow: 2px 2px 0px #1a1816;
                  transition: transform 0.1s ease;
                ">
                  <span>Approve</span> <span>✓</span>
                </button>
                <button type="button" class="btn-decline-student" data-id="${student.id}" data-name="${escapeHtml(student.displayName || "Student")}" style="
                  display: inline-flex; align-items: center; gap: 5px; padding: 7px 12px;
                  background: #fee2e2; color: #b91c1c; border: 2px solid #1a1816; border-radius: 10px;
                  font-weight: 700; font-size: 13px; cursor: pointer; box-shadow: 2px 2px 0px #1a1816;
                  transition: transform 0.1s ease;
                ">
                  <span>Decline</span> <span>✕</span>
                </button>
              </div>
            </div>
          `;
        }).join("");

        // Bind Approve buttons
        pendingListEl.querySelectorAll(".btn-approve-student").forEach(btn => {
          btn.addEventListener("click", async () => {
            const studentId = btn.dataset.id;
            const studentName = btn.dataset.name;
            btn.disabled = true;
            btn.innerHTML = `<span>Approving...</span>`;
            try {
              if (window.ProfileManager) {
                await window.ProfileManager.approveStudent(db, studentId, currentProfile);
              }
              await showCustomAlert(`${studentName} has been approved and enrolled in class!`, "Student Approved", '<i class="fi fi-rr-badge-check"></i>');
              renderTeacherApprovalsView();
            } catch (err) {
              console.error("Approve student error:", err);
              await showCustomAlert("Could not approve student: " + (err.message || "Permission denied"), "Error", '<i class="fi fi-rr-cross-circle"></i>');
              btn.disabled = false;
              btn.innerHTML = `<span>Approve</span> <span>✓</span>`;
            }
          });
        });

        // Bind Decline buttons
        pendingListEl.querySelectorAll(".btn-decline-student").forEach(btn => {
          btn.addEventListener("click", async () => {
            const studentId = btn.dataset.id;
            const studentName = btn.dataset.name;
            const confirmed = await showCustomConfirm(
              `Decline registration request from ${studentName}?`,
              "Decline Student",
              '<i class="fi fi-rr-cross-circle"></i>',
              "Decline",
              "Cancel",
              true
            );
            if (!confirmed) return;
            btn.disabled = true;
            try {
              if (window.ProfileManager) {
                await window.ProfileManager.declineStudent(db, studentId, currentProfile);
              }
              renderTeacherApprovalsView();
            } catch (err) {
              console.error("Decline student error:", err);
              await showCustomAlert("Could not decline student: " + (err.message || "Permission denied"), "Error");
              btn.disabled = false;
            }
          });
        });
      }
    }

    // Render Enrolled List
    if (enrolledListEl) {
      if (filteredEnrolled.length === 0) {
        enrolledListEl.innerHTML = `
          <div style="padding: 20px; text-align: center; color: #72685d; font-size: 14px;">
            No enrolled students yet for the selected class.
          </div>
        `;
      } else {
        enrolledListEl.innerHTML = filteredEnrolled.map(student => {
          const clsObj = window.AcademicRegistry ? window.AcademicRegistry.getClassById(student.classId) : null;
          const grpObj = (window.AcademicRegistry && typeof window.AcademicRegistry.getGroup === "function") ? window.AcademicRegistry.getGroup(student.classId, student.group) : null;
          const classDisplayName = clsObj ? clsObj.name : (student.className || "Class");
          const groupDisplayName = grpObj ? grpObj.name : (student.groupName || (student.group === "grp2" ? "Group 2" : "Group 1"));
          const initials = (student.displayName || student.firstName || "S").trim().charAt(0).toUpperCase();

          return `
            <div style="
              display: flex; align-items: center; justify-content: space-between; gap: 12px;
              background: #fffdf8; border: 2px solid #1a1816; border-radius: 12px; padding: 12px 16px;
              box-shadow: 1.5px 2px 0px #1a1816; flex-wrap: wrap;
            ">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="
                  width: 38px; height: 38px; border-radius: 50%; border: 2px solid #1a1816;
                  background: #dcfce7; display: flex; align-items: center; justify-content: center;
                  font-family: 'Patrick Hand', cursive; font-size: 18px; font-weight: 700; color: #15803d;
                  overflow: hidden; flex-shrink: 0;
                ">
                  ${student.photoURL ? `<img src="${escapeHtml(student.photoURL)}" alt="Avatar" style="width:100%; height:100%; object-fit:cover;" />` : initials}
                </div>
                <div>
                  <h4 style="margin: 0; font-size: 14.5px; font-weight: 700; color: #1a1816;">${escapeHtml(student.displayName || "Student")}</h4>
                  <p style="margin: 1px 0 0; font-size: 12px; color: #72685d;">${escapeHtml(student.email || "")}</p>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span style="font-size: 11.5px; font-weight: 700; padding: 3px 8px; border-radius: 8px; border: 1.5px solid #1a1816; background: #e0f2fe; color: #0369a1;">
                  ${escapeHtml(classDisplayName)}
                </span>
                <span style="font-size: 11.5px; font-weight: 700; padding: 3px 8px; border-radius: 8px; border: 1.5px solid #1a1816; background: #fdfaf3; color: #1a1816;">
                  ${escapeHtml(groupDisplayName)}
                </span>
                <span style="font-size: 11px; font-weight: 800; padding: 2px 7px; border-radius: 6px; background: #dcfce7; color: #15803d; border: 1px solid #15803d;">
                  Active
                </span>
              </div>
            </div>
          `;
        }).join("");
      }
    }
  } catch (err) {
    console.error("renderTeacherApprovalsView error:", err);
    if (pendingListEl) pendingListEl.innerHTML = `<div style="padding: 20px; color: #b91c1c;">Could not load pending students: ${escapeHtml(err.message)}</div>`;
  }
}

function initAdminDashboard() {
  const tabPending = document.getElementById("tab-admin-pending");
  const tabApproved = document.getElementById("tab-admin-approved");
  const btnRefresh = document.getElementById("btn-refresh-admin-users");

  if (tabPending && !tabPending.dataset.bound) {
    tabPending.dataset.bound = "true";
    tabPending.addEventListener("click", () => {
      currentAdminTab = "pending";
      tabPending.style.background = "#e89838";
      if (tabApproved) tabApproved.style.background = "#f4efe4";
      renderAdminUsersList();
    });
  }

  if (tabApproved && !tabApproved.dataset.bound) {
    tabApproved.dataset.bound = "true";
    tabApproved.addEventListener("click", () => {
      currentAdminTab = "approved";
      tabApproved.style.background = "#e89838";
      if (tabPending) tabPending.style.background = "#f4efe4";
      renderAdminUsersList();
    });
  }

  if (btnRefresh && !btnRefresh.dataset.bound) {
    btnRefresh.dataset.bound = "true";
    btnRefresh.addEventListener("click", () => {
      fetchAdminUsers();
    });
  }

  fetchAdminUsers();
}

function fetchAdminUsers() {
  if (!db) return;
  const listEl = document.getElementById("admin-users-list");
  if (listEl) {
    listEl.innerHTML = `
      <div style="text-align: center; padding: 24px; color: #7a7063;">
        <div style="font-size: 22px; margin-bottom: 6px;"><i class="fi fi-rr-refresh" style="display:inline-block; animation: spin 1s infinite linear;"></i></div>
        <div>Fetching member registrations...</div>
      </div>`;
  }

  if (adminUsersListener) {
    try { adminUsersListener(); } catch (e) {}
  }

  try {
    adminUsersListener = db.collection("users").onSnapshot((snapshot) => {
      const users = [];
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      cachedAdminUsers = users;
      updateAdminCounts();
      renderAdminUsersList();
    }, (err) => {
      console.warn("Admin users fetch error:", err);
      if (listEl) {
        listEl.innerHTML = `<div style="text-align:center; padding:18px; color:#dc2626;">Could not fetch members: ${err.message}</div>`;
      }
    });
  } catch (err) {
    console.error("Admin listener init error:", err);
  }
}

function updateAdminCounts() {
  const pendingCountEl = document.getElementById("admin-pending-count");
  const approvedCountEl = document.getElementById("admin-approved-count");

  const pending = cachedAdminUsers.filter((u) => u.status === "pending" && !isSuperAdminUser(u));
  const approved = cachedAdminUsers.filter((u) => u.status === "approved" || isSuperAdminUser(u));

  if (pendingCountEl) pendingCountEl.textContent = pending.length;
  if (approvedCountEl) approvedCountEl.textContent = approved.length;
}

function renderAdminUsersList() {
  const listEl = document.getElementById("admin-users-list");
  if (!listEl) return;

  const users = cachedAdminUsers.filter((u) => {
    if (currentAdminTab === "pending") {
      return u.status === "pending" && !isSuperAdminUser(u);
    } else {
      return u.status === "approved" || isSuperAdminUser(u);
    }
  });

  if (!users.length) {
    listEl.innerHTML = `
      <div style="text-align: center; padding: 30px; background: #faf6ed; border-radius: 14px; border: 2px dashed #ded6c5;">
        <div style="font-size: 24px; margin-bottom: 6px; color: #1a1816;"><i class="fi fi-rr-check-circle"></i></div>
        <strong style="color: #1a1816; font-size: 15px;">No ${currentAdminTab} users</strong>
        <p style="color: #7a7063; font-size: 13.5px; margin: 4px 0 0;">All registrations have been processed.</p>
      </div>`;
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
      <div class="admin-user-row" data-id="${user.id}">
        <div class="admin-user-meta">
          <img src="${avatar}" class="admin-user-avatar" alt="${escapeHtml(name)}" onerror="this.onerror=null;this.src='assets/avatar.jpg';" />
          <div>
            <div class="admin-user-title">
              <span>${escapeHtml(name)}</span>
              <span class="user-role-badge" style="font-size: 10px; padding: 1px 6px; border-radius: 6px; border: 1px solid #1a1816; background: ${isAdmin ? '#e89838' : (isTeacher ? '#a9c6ec' : '#d1fae5')};">
                ${roleBadge}
              </span>
              <span class="${status === 'approved' ? 'status-badge-approved' : 'status-badge-pending'}">
                ● ${status === 'approved' ? 'Approved' : 'Pending'}
              </span>
            </div>
            <div class="admin-user-sub">
              <span>${escapeHtml(user.email || 'No email')}</span> • <span>${escapeHtml(academicDetail)}</span>
            </div>
          </div>
        </div>

        <div class="admin-user-actions">
          ${status === 'pending' ? `
            <button type="button" class="btn-admin-approve" data-id="${user.id}" data-name="${escapeHtml(name)}" title="Approve member">
              Approve ✓
            </button>
            <button type="button" class="btn-admin-decline" data-id="${user.id}" data-name="${escapeHtml(name)}" title="Decline member">
              Decline ✕
            </button>
          ` : `
            ${!isAdmin ? `
              <button type="button" class="btn-admin-decline" data-id="${user.id}" data-action="revoke" data-name="${escapeHtml(name)}" title="Revoke approval">
                Revoke Access
              </button>
            ` : `<span style="font-size: 12px; font-weight: 700; color: #b45309;">Super Admin</span>`}
          `}
        </div>
      </div>
    `;
  }).join("");

  // Attach button events
  listEl.querySelectorAll(".btn-admin-approve").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const uid = btn.dataset.id;
      const userName = btn.dataset.name;
      const confirmed = await showCustomConfirm(
        `Approve ${userName} to join Quill-Q? They will immediately receive access to timetable & homework.`,
        "Approve Member",
        '<i class="fi fi-rr-check"></i>',
        "Approve",
        "Cancel",
        false
      );
      if (confirmed) {
        try {
          await db.collection("users").doc(uid).update({
            status: "approved",
            approvedAt: new Date().toISOString()
          });
          await showCustomAlert(`${userName} has been approved successfully!`, "Success", '<i class="fi fi-rr-badge-check"></i>');
        } catch (e) {
          await showCustomAlert("Could not approve user: " + (e.message || "Permission denied"), "Error", '<i class="fi fi-rr-cross-circle"></i>');
        }
      }
    });
  });

  listEl.querySelectorAll(".btn-admin-decline").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const uid = btn.dataset.id;
      const userName = btn.dataset.name;
      const isRevoke = btn.dataset.action === "revoke";
      const actionPrompt = isRevoke
        ? `Revoke access for ${userName}? They will be placed back into pending approval.`
        : `Decline registration for ${userName}?`;
      
      const confirmed = await showCustomConfirm(
        actionPrompt,
        isRevoke ? "Revoke Access" : "Decline Member",
        '<i class="fi fi-rr-exclamation"></i>',
        isRevoke ? "Revoke" : "Decline",
        "Cancel",
        true
      );
      if (confirmed) {
        try {
          await db.collection("users").doc(uid).update({
            status: "declined",
            declinedAt: new Date().toISOString()
          });
          await showCustomAlert(`Access status updated for ${userName}.`, "Updated", '<i class="fi fi-rr-info"></i>');
        } catch (e) {
          await showCustomAlert("Could not update user: " + (e.message || "Permission denied"), "Error", '<i class="fi fi-rr-cross-circle"></i>');
        }
      }
    });
  });
}

// Navigate to Home view inside Dashboard
function navigateToHome() {
  const items = document.querySelectorAll(".nav-item");
  items.forEach((i) => i.classList.remove("active"));
  const navHome = document.getElementById("nav-home") || document.querySelector('.nav-item[data-page="home"]');
  if (navHome) {
    navHome.classList.add("active");
  }
  switchView("home");

  // Close mobile sidebar if open
  const sidebar = document.querySelector(".sidebar");
  const sidebarBackdrop = document.getElementById("sidebar-backdrop");
  if (sidebar) sidebar.classList.remove("mobile-open");
  if (sidebarBackdrop) sidebarBackdrop.classList.remove("active");

  const mainEl = document.querySelector(".main");
  if (mainEl) mainEl.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Brand Logo Click Handler: Go Home if logged in, otherwise go to Welcome/Landing
function handleBrandLogoClick() {
  const dashboardApp = document.getElementById("dashboard-app");
  const isDashboardVisible = dashboardApp && !dashboardApp.classList.contains("dashboard-hidden");
  const isLoggedIn = (currentUser || currentProfile) && isDashboardVisible;

  if (isLoggedIn) {
    navigateToHome();
  } else {
    navigateToLanding();
  }
}

// --- Page Navigation (Brand Logo -> Home if logged in, Landing if not) ---
function initPageNavigation() {
  const sidebarBrand = document.querySelector(".sidebar .brand");
  if (sidebarBrand) {
    sidebarBrand.style.cursor = "pointer";
    sidebarBrand.addEventListener("click", (e) => {
      e.preventDefault();
      handleBrandLogoClick();
    });
  }

  const mobileBarBrand = document.getElementById("mobile-bar-brand") || document.querySelector(".mobile-bar-brand");
  if (mobileBarBrand) {
    mobileBarBrand.style.cursor = "pointer";
    mobileBarBrand.addEventListener("click", (e) => {
      e.preventDefault();
      handleBrandLogoClick();
    });
  }
}

// Sync default day with actual current day
function syncDefaultDay() {
  const todayKey = getDayKey();
  if (TIMETABLE[todayKey] && TIMETABLE[todayKey].items && TIMETABLE[todayKey].items.length > 0) {
    currentSelectedDay = todayKey;
  } else {
    currentSelectedDay = "Mon";
  }

  // Update week cards active class
  const dayCards = document.querySelectorAll(".week-paper-card");
  dayCards.forEach((c) => {
    c.classList.toggle("active-day", c.dataset.day === currentSelectedDay);
  });
}

// =========================================================
// ===== QUILL-Q CHAT SYSTEM (REAL-TIME, SEEN, DATES) =====
let currentChatGroup = "grp1";

function switchChatGroup(group) {
  currentChatGroup = group === "grp2" ? "grp2" : "grp1";
  updateChatGroupUIState();
  if (currentUser) {
    bindServerChat(currentUser);
  }
}

function updateChatGroupUIState() {
  const btnChatGrp1 = document.getElementById("btn-chat-grp1");
  const btnChatGrp2 = document.getElementById("btn-chat-grp2");
  const switcher = document.querySelector(".chat-group-switcher");
  const profile = currentProfile;
  const canSwitch = isSuperAdminUser(profile) || (profile && profile.role === "teacher");

  if (switcher) {
    switcher.style.display = canSwitch ? "inline-flex" : "none";
  }
  if (btnChatGrp1) btnChatGrp1.classList.toggle("active", currentChatGroup === "grp1");
  if (btnChatGrp2) btnChatGrp2.classList.toggle("active", currentChatGroup === "grp2");
}

let chatMessagesUnsubscribe = null;
let chatMessagesCache = [];
let chatSoundMuted = false;
let chatUnreadCount = 0;
let lastSeenMessageTimestamp = 0;
let isChatViewActive = false;
const locallyMarkedSeenIds = new Set();
let chatBatchLimit = 15; // Load only the latest 15 messages initially to minimize Firestore reads & server load
let oldestChatDoc = null; // Earliest DocumentSnapshot loaded for cursor-based pagination
let hasMoreOldMessages = false;
let isLoadingOlderMessages = false;

// Format Chat Message Time (e.g., 10:45 AM)
function formatChatTime(date) {
  if (!date || isNaN(date.getTime())) return "";
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? "0" + minutes : minutes;
  return `${hours}:${minutesStr} ${ampm}`;
}

// Format Date Header Label (e.g. Today, Yesterday, or Friday, Oct 24)
function formatChatDateLabel(date) {
  if (!date || isNaN(date.getTime())) return "";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today - target) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// Get standard date key (YYYY-MM-DD) for grouping messages by day
function getChatDateKey(date) {
  if (!date || isNaN(date.getTime())) return "unknown";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Escape HTML utility for safe chat rendering
function escapeChatHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Render Chat Messages stream with date dividers, seen indicators, and lazy-loading top button
function renderChatMessages(preserveScroll = false) {
  const container = document.getElementById("chat-messages-container");
  if (!container) return;

  const previousScrollHeight = container.scrollHeight;
  const previousScrollTop = container.scrollTop;

  if (!chatMessagesCache || chatMessagesCache.length === 0) {
    container.innerHTML = `
      <div class="chat-empty-state" id="chat-empty-state">
        <div class="chat-empty-illustration">💬</div>
        <h3>Welcome to the Class Chat!</h3>
        <p>Say hello to your classmates or ask a question about today's subjects.</p>
      </div>
    `;
    return;
  }

  const myUid = (currentProfile && currentProfile.uid) || (currentUser && currentUser.uid) || "";
  let html = "";

  // 1. Lazy Loading Bar at top of messages container if earlier messages exist
  if (hasMoreOldMessages) {
    html += `
      <div class="chat-load-more-wrap" id="chat-load-more-wrap">
        <button type="button" class="btn-chat-load-more" id="btn-chat-load-more" ${isLoadingOlderMessages ? "disabled" : ""}>
          <i class="${isLoadingOlderMessages ? "fi fi-rr-spinner" : "fi fi-rr-time-past"}"></i>
          <span>${isLoadingOlderMessages ? "Loading older messages..." : "Load previous messages"}</span>
        </button>
      </div>
    `;
  }

  let lastDateKey = null;

  chatMessagesCache.forEach((msg) => {
    let msgDate = null;
    if (msg.createdAt && typeof msg.createdAt.toDate === "function") {
      msgDate = msg.createdAt.toDate();
    } else if (msg.createdAt && msg.createdAt.seconds) {
      msgDate = new Date(msg.createdAt.seconds * 1000);
    } else if (typeof msg.createdAt === "number") {
      msgDate = new Date(msg.createdAt);
    } else {
      msgDate = new Date();
    }

    const dateKey = getChatDateKey(msgDate);
    if (dateKey !== lastDateKey) {
      const dateLabel = formatChatDateLabel(msgDate);
      html += `
        <div class="chat-date-divider" role="separator" aria-label="${dateLabel}">
          <span class="chat-date-pill">${dateLabel}</span>
        </div>
      `;
      lastDateKey = dateKey;
    }

    const isMine = myUid && msg.userId === myUid;
    const timeFormatted = formatChatTime(msgDate);

    // Extract Seen By list (readers excluding author)
    const seenByRaw = msg.seenBy || {};
    const readersList = [];
    Object.keys(seenByRaw).forEach((uid) => {
      if (uid === msg.userId) return; // don't list author viewing their own message
      const val = seenByRaw[uid];
      if (typeof val === "object" && val !== null) {
        readersList.push({
          uid: uid,
          name: val.name || "Classmate",
          avatar: val.avatar || "assets/avatar.jpg",
          role: val.role || "student",
          time: val.at ? new Date(val.at) : null
        });
      } else if (typeof val === "number") {
        readersList.push({
          uid: uid,
          name: (myUid && uid === myUid) ? (currentProfile ? (currentProfile.displayName || "You") : "You") : "Classmate",
          avatar: (myUid && uid === myUid) ? (currentProfile ? (currentProfile.photoURL || "assets/avatar.jpg") : "assets/avatar.jpg") : "assets/avatar.jpg",
          role: (myUid && uid === myUid) ? (currentProfile ? (currentProfile.role || "student") : "student") : "student",
          time: new Date(val)
        });
      }
    });

    // Sort viewers by most recently seen
    readersList.sort((a, b) => (b.time ? b.time.getTime() : 0) - (a.time ? a.time.getTime() : 0));

    // Mini Avatars Cluster for Seen By
    let seenAvatarsHtml = "";
    if (readersList.length > 0) {
      const maxVisible = 2;
      const topReaders = readersList.slice(0, maxVisible);
      const remainingCount = readersList.length - topReaders.length;
      const avatarImgs = topReaders.map((r) => {
        const safeAvatar = (r.avatar && typeof r.avatar === "string" && r.avatar.trim().length > 5) ? r.avatar : "assets/avatar.jpg";
        return `<img src="${safeAvatar}" alt="${escapeChatHTML(r.name)}" class="chat-seen-mini-img" title="Seen by ${escapeChatHTML(r.name)}" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='assets/avatar.jpg';" />`;
      }).join("");

      const countBadge = remainingCount > 0 ? `<span class="chat-seen-count-tag">+${remainingCount}</span>` : "";
      const countLabel = readersList.length === 1 ? "1 person" : `${readersList.length} people`;

      seenAvatarsHtml = `
        <div class="chat-seen-avatars-wrap" data-msg-id="${msg.id}" title="Seen by ${countLabel} (click to view)">
          ${avatarImgs}
          ${countBadge}
        </div>
      `;
    }

    const senderName = escapeChatHTML(msg.userName || "Student");
    const role = (msg.userRole || "student").toLowerCase();
    let roleBadgeHtml = "";
    if (role === "admin") {
      roleBadgeHtml = `<span class="chat-sender-badge badge-admin">Admin</span>`;
    } else if (role === "teacher") {
      roleBadgeHtml = `<span class="chat-sender-badge badge-teacher">Teacher</span>`;
    } else {
      roleBadgeHtml = `<span class="chat-sender-badge badge-student">Student</span>`;
    }

    const avatarSrc = (msg.userAvatar && typeof msg.userAvatar === "string" && msg.userAvatar.trim().length > 5) ? msg.userAvatar : "assets/avatar.jpg";
    const textEscaped = escapeChatHTML(msg.text || "");

    if (isMine) {
      html += `
        <div class="chat-msg-row msg-mine" data-id="${msg.id}">
          <div class="chat-msg-content">
            <div class="chat-msg-bubble">${textEscaped}</div>
            <div class="chat-msg-meta">
              <span class="chat-msg-time">${timeFormatted}</span>
              ${seenAvatarsHtml}
            </div>
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="chat-msg-row msg-other" data-id="${msg.id}">
          <img src="${avatarSrc}" alt="${senderName}" class="chat-msg-avatar" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='assets/avatar.jpg';" />
          <div class="chat-msg-content">
            <div class="chat-msg-sender">
              <span>${senderName}</span>
              ${roleBadgeHtml}
            </div>
            <div class="chat-msg-bubble">${textEscaped}</div>
            <div class="chat-msg-meta">
              <span class="chat-msg-time">${timeFormatted}</span>
              ${seenAvatarsHtml}
            </div>
          </div>
        </div>
      `;
    }
  });

  container.innerHTML = html;

  // Bind click event to "Load previous messages" button
  const loadMoreBtn = document.getElementById("btn-chat-load-more");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", (e) => {
      e.preventDefault();
      loadOlderChatMessages();
    });
  }

  // Bind click event to all seen-avatars clusters
  container.querySelectorAll(".chat-seen-avatars-wrap").forEach((cluster) => {
    cluster.addEventListener("click", (e) => {
      e.stopPropagation();
      const msgId = cluster.getAttribute("data-msg-id");
      openSeenByModal(msgId);
    });
  });

  // Preserve scroll position if loading older messages above, otherwise scroll to latest bottom
  if (preserveScroll) {
    const scrollDiff = container.scrollHeight - previousScrollHeight;
    container.scrollTop = previousScrollTop + scrollDiff;
  } else {
    container.scrollTop = container.scrollHeight;
  }
}

// Get active class-namespaced chat channel ID
function getActiveChatChannelId() {
  const profile = currentProfile;
  const userClass = getUserClassId(profile);
  const grp = currentChatGroup || "grp1";
  if (!userClass || userClass === "2ang-aff") {
    return grp;
  }
  return `${userClass}_${grp}`;
}

// Lazy Load Older Messages from Firestore (Cursor pagination using startAt / endBefore)
async function loadOlderChatMessages() {
  if (isLoadingOlderMessages || !hasMoreOldMessages || !oldestChatDoc || !db) return;

  isLoadingOlderMessages = true;
  renderChatMessages(true);

  try {
    const channelId = getActiveChatChannelId();
    const olderQuery = db
      .collection("chats")
      .doc(channelId)
      .collection("messages")
      .orderBy("createdAt", "desc")
      .startAfter(oldestChatDoc)
      .limit(chatBatchLimit);

    const snapshot = await olderQuery.get();

    if (snapshot.empty) {
      hasMoreOldMessages = false;
    } else {
      const olderMessages = [];
      snapshot.forEach((doc) => {
        olderMessages.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Update oldest document cursor
      oldestChatDoc = snapshot.docs[snapshot.docs.length - 1];

      // Since olderQuery was ordered descending, reverse to chronological ascending order
      olderMessages.reverse();

      // Filter out duplicates (if any) and prepend to cache
      const existingIds = new Set(chatMessagesCache.map((m) => m.id));
      const filteredOlder = olderMessages.filter((m) => !existingIds.has(m.id));

      if (filteredOlder.length > 0) {
        chatMessagesCache = [...filteredOlder, ...chatMessagesCache];
        try {
          localStorage.setItem("quill_q_chat_cache", JSON.stringify(chatMessagesCache.slice(-50)));
        } catch (e) {}
      }

      // If fetched less than the limit, no more older messages remain
      hasMoreOldMessages = snapshot.docs.length >= chatBatchLimit;
    }
  } catch (err) {
    console.warn("Failed loading older chat messages:", err);
    showInAppToast({
      title: "Chat Error",
      message: "Could not load previous messages.",
      type: "warning"
    });
  } finally {
    isLoadingOlderMessages = false;
    renderChatMessages(true);
  }
}

// Open Seen By Modal dialog listing all viewers
function openSeenByModal(msgId) {
  const modal = document.getElementById("chat-seen-modal");
  const listEl = document.getElementById("chat-seen-list");
  if (!modal || !listEl) return;

  const msg = chatMessagesCache.find((m) => m.id === msgId);
  if (!msg) return;

  const myUid = (currentProfile && currentProfile.uid) || (currentUser && currentUser.uid) || "";
  const seenByRaw = msg.seenBy || {};
  const readersList = [];

  Object.keys(seenByRaw).forEach((uid) => {
    if (uid === msg.userId) return;
    const val = seenByRaw[uid];
    if (typeof val === "object" && val !== null) {
      readersList.push({
        uid: uid,
        name: val.name || "Classmate",
        avatar: val.avatar || "assets/avatar.jpg",
        role: val.role || "student",
        time: val.at ? new Date(val.at) : null
      });
    } else if (typeof val === "number") {
      readersList.push({
        uid: uid,
        name: (myUid && uid === myUid) ? (currentProfile ? (currentProfile.displayName || "You") : "You") : "Classmate",
        avatar: (myUid && uid === myUid) ? (currentProfile ? (currentProfile.photoURL || "assets/avatar.jpg") : "assets/avatar.jpg") : "assets/avatar.jpg",
        role: (myUid && uid === myUid) ? (currentProfile ? (currentProfile.role || "student") : "student") : "student",
        time: new Date(val)
      });
    }
  });

  readersList.sort((a, b) => (b.time ? b.time.getTime() : 0) - (a.time ? a.time.getTime() : 0));

  if (readersList.length === 0) {
    listEl.innerHTML = `<li style="text-align:center; padding: 20px; color:#8c8276; font-size:14px;">Delivered • Not seen yet</li>`;
  } else {
    listEl.innerHTML = readersList.map((r) => {
      const timeStr = r.time ? formatChatTime(r.time) : "Just now";
      const dateStr = r.time ? formatChatDateLabel(r.time) : "Today";
      const displayTime = dateStr === "Today" ? timeStr : `${dateStr}, ${timeStr}`;
      const roleCapitalized = (r.role || "Student").charAt(0).toUpperCase() + (r.role || "Student").slice(1);
      const safeAvatar = (r.avatar && typeof r.avatar === "string" && r.avatar.trim().length > 5) ? r.avatar : "assets/avatar.jpg";

      return `
        <li class="chat-seen-item">
          <div class="chat-seen-user-left">
            <img src="${safeAvatar}" alt="${escapeChatHTML(r.name)}" class="chat-seen-user-avatar" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='assets/avatar.jpg';" />
            <div>
              <div class="chat-seen-user-name">${escapeChatHTML(r.name)}</div>
              <div style="font-size:11px; color:#8c8276; font-weight:600;">${roleCapitalized}</div>
            </div>
          </div>
          <div class="chat-seen-time-tag">${displayTime}</div>
        </li>
      `;
    }).join("");
  }

  modal.classList.remove("view-hidden");
}

function closeSeenByModal() {
  const modal = document.getElementById("chat-seen-modal");
  if (modal) {
    modal.classList.add("view-hidden");
  }
}

// Mark recent messages from other users as seen by current user
function markMessagesAsSeen() {
  if (!db) return;
  const myUid = (currentProfile && currentProfile.uid) || (currentUser && currentUser.uid) || "";
  if (!myUid) return;

  const myName = (currentProfile && (currentProfile.displayName || currentProfile.fullName)) || (currentUser && currentUser.displayName) || "Student";
  const myAvatar = (currentProfile && currentProfile.photoURL) || (currentUser && currentUser.photoURL) || "assets/avatar.jpg";
  const myRole = (currentProfile && currentProfile.role) || "student";

  const unreadMessages = chatMessagesCache.filter((msg) => {
    if (msg.userId === myUid) return false;
    if (locallyMarkedSeenIds.has(msg.id)) return false;
    const seenBy = msg.seenBy || {};
    return !seenBy[myUid];
  });

  if (unreadMessages.length === 0) {
    updateChatBadge(0);
    return;
  }

  const batch = db.batch();
  const nowMs = Date.now();
  const seenPayload = {
    at: nowMs,
    name: myName,
    avatar: myAvatar,
    role: myRole
  };
  let count = 0;

  unreadMessages.slice(-25).forEach((msg) => {
    locallyMarkedSeenIds.add(msg.id);
    // Also update locally in cache immediately
    if (!msg.seenBy) msg.seenBy = {};
    msg.seenBy[myUid] = seenPayload;

    const activeChannel = getActiveChatChannelId();
    const ref = db.collection("chats").doc(activeChannel).collection("messages").doc(msg.id);
    batch.update(ref, {
      [`seenBy.${myUid}`]: seenPayload
    });
    count++;
  });

  try {
    localStorage.setItem("quill_q_chat_cache_" + getActiveChatChannelId(), JSON.stringify(chatMessagesCache));
  } catch (e) {}

  if (count > 0) {
    batch.commit().catch((err) => {
      console.warn("Failed marking messages as seen:", err);
    });
  }

  updateChatBadge(0);
}

// Update Chat Badge on Sidebar
function updateChatBadge(count) {
  chatUnreadCount = Math.max(0, count);
  const badge = document.getElementById("nav-chat-badge");
  if (!badge) return;

  if (chatUnreadCount > 0) {
    badge.textContent = chatUnreadCount > 99 ? "99+" : String(chatUnreadCount);
    badge.classList.remove("view-hidden");
  } else {
    badge.classList.add("view-hidden");
    badge.textContent = "0";
  }
}

// Handler when user opens Chat view
function onChatViewOpened() {
  isChatViewActive = true;
  markMessagesAsSeen();
  const container = document.getElementById("chat-messages-container");
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
  const input = document.getElementById("chat-text-input");
  if (input) {
    setTimeout(() => input.focus(), 80);
  }
}

// Send a new message to Firestore
async function sendChatMessage(text) {
  if (!text || !text.trim()) return;
  const cleanText = text.trim();
  const myUid = (currentProfile && currentProfile.uid) || (currentUser && currentUser.uid) || (auth && auth.currentUser && auth.currentUser.uid) || "";
  
  if (!myUid) {
    showInAppToast({
      title: "Cannot send message",
      message: "Please sign in to join the class chat.",
      type: "warning"
    });
    return;
  }

  const senderName = (currentProfile && (currentProfile.displayName || currentProfile.fullName)) || (currentUser && currentUser.displayName) || "Student";
  const userRole = (currentProfile && currentProfile.role) || "student";
  const userAvatar = (currentProfile && currentProfile.photoURL) || (currentUser && currentUser.photoURL) || "assets/avatar.jpg";

  const localMsgId = "local-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
  const nowMs = Date.now();

  const messageDoc = {
    text: cleanText,
    userId: myUid,
    userName: senderName,
    userRole: userRole,
    userAvatar: userAvatar,
    createdAt: new Date(nowMs),
    seenBy: {
      [myUid]: nowMs
    }
  };

  // 1. Optimistic Local Append: Show message immediately in the UI
  const optimisticMsg = {
    id: localMsgId,
    ...messageDoc
  };
  chatMessagesCache.push(optimisticMsg);
  const activeChannel = getActiveChatChannelId();
  try {
    localStorage.setItem("quill_q_chat_cache_" + activeChannel, JSON.stringify(chatMessagesCache.slice(-60)));
  } catch (e) {}
  renderChatMessages();

  // Clear text input immediately
  const input = document.getElementById("chat-text-input");
  if (input) {
    input.value = "";
    input.style.height = "auto";
  }

  // 2. Server Persistence: write to Firestore
  if (db) {
    try {
      const serverPayload = {
        ...messageDoc,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      const docRef = await db.collection("chats").doc(activeChannel).collection("messages").add(serverPayload);
      // Replace temporary local ID with server doc ID
      const idx = chatMessagesCache.findIndex((m) => m.id === localMsgId);
      if (idx !== -1) {
        chatMessagesCache[idx].id = docRef.id;
      }

      // Broadcast background push notification to all class devices
      if (typeof broadcastPushNotification === "function") {
        const groupLabel = (currentChatGroup || "grp1") === "grp2" ? "Group 2 Chat" : "Group 1 Chat";
        broadcastPushNotification({
          title: `💬 ${senderName} (${groupLabel})`,
          body: cleanText,
          targetView: "chat",
          targetGroup: currentChatGroup || "grp1",
          url: "./index.html",
          tag: "chat-msg-" + docRef.id
        });
      }
    } catch (err) {
      console.warn("Failed syncing chat message to server:", err);
      // Message is kept locally in cache so user does not lose their chat
    }
  }
}

// Real-Time Chat Listener
function bindServerChat(user) {
  if (chatMessagesUnsubscribe) {
    try { chatMessagesUnsubscribe(); } catch (e) {}
    chatMessagesUnsubscribe = null;
  }

  const profile = currentProfile;
  const isSuperAdmin = isSuperAdminUser(profile);
  const isTeacher = profile && profile.role === "teacher";
  const isApproved = profile && (profile.status === "approved" || isSuperAdmin);

  // If regular student, strictly lock chat group to assigned group
  if (!isSuperAdmin && !isTeacher) {
    currentChatGroup = getUserGroup(profile);
  }

  // Bind group switcher chips in class chat header
  const btnChatGrp1 = document.getElementById("btn-chat-grp1");
  const btnChatGrp2 = document.getElementById("btn-chat-grp2");
  if (btnChatGrp1 && !btnChatGrp1.dataset.bound) {
    btnChatGrp1.dataset.bound = "true";
    btnChatGrp1.addEventListener("click", () => switchChatGroup("grp1"));
  }
  if (btnChatGrp2 && !btnChatGrp2.dataset.bound) {
    btnChatGrp2.dataset.bound = "true";
    btnChatGrp2.addEventListener("click", () => switchChatGroup("grp2"));
  }
  updateChatGroupUIState();

  const activeChannel = getActiveChatChannelId();

  // Restore cached messages from local storage first
  try {
    const localCached = JSON.parse(localStorage.getItem("quill_q_chat_cache_" + activeChannel) || "[]");
    if (localCached && localCached.length > 0) {
      chatMessagesCache = localCached;
      renderChatMessages();
    } else {
      chatMessagesCache = [];
      renderChatMessages();
    }
  } catch (e) {
    chatMessagesCache = [];
  }

  if (!user || !isApproved || !db) {
    if (!chatMessagesCache || chatMessagesCache.length === 0) {
      chatMessagesCache = [];
      renderChatMessages();
    }
    updateChatBadge(0);
    return;
  }

  const myUid = (profile && profile.uid) || (user && user.uid) || "";

  // Query only the couple latest messages (e.g. 15 messages) to save server reads and memory
  const query = db
    .collection("chats")
    .doc(activeChannel)
    .collection("messages")
    .orderBy("createdAt", "asc")
    .limitToLast(chatBatchLimit);

  let initialLoad = true;

  chatMessagesUnsubscribe = query.onSnapshot(
    (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        });
      });

      if (snapshot.docs.length > 0) {
        // Store oldest document snapshot from the active stream for cursor pagination
        oldestChatDoc = snapshot.docs[0];
        // If we received a full initial batch equal to the limit, assume older messages exist
        if (initialLoad) {
          hasMoreOldMessages = snapshot.docs.length >= chatBatchLimit;
        }

        chatMessagesCache = messages;
        try {
          localStorage.setItem("quill_q_chat_cache_" + activeChannel, JSON.stringify(chatMessagesCache));
        } catch (e) {}
        renderChatMessages();
      } else {
        hasMoreOldMessages = false;
        chatMessagesCache = [];
        renderChatMessages();
      }

      // Check current page
      const mainEl = document.querySelector(".main");
      const currentPage = mainEl ? mainEl.getAttribute("data-current-page") : "home";
      isChatViewActive = currentPage === "chat";

      // Calculate unread count
      const unread = chatMessagesCache.filter((m) => {
        if (m.userId === myUid) return false;
        const seenBy = m.seenBy || {};
        return !seenBy[myUid];
      });

      if (isChatViewActive) {
        markMessagesAsSeen();
      } else {
        updateChatBadge(unread.length);
      }

      // Notify on brand new incoming messages (not initial batch)
      if (!initialLoad && snapshot.docChanges) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const newMsg = change.doc.data();
            if (newMsg && newMsg.userId !== myUid) {
              // Play incoming message notification chime if sound is enabled
              if (!chatSoundMuted) {
                playNotificationChime();
              }

              // In-App Toast Alert if user is on any other view (Home, Schedule, Subjects, Homeworks)
              if (!isChatViewActive) {
                showInAppToast({
                  title: `${newMsg.userName || "Classmate"} (Class Chat)`,
                  message: newMsg.text || "Sent a message",
                  type: "chat"
                });
              }

              // System / Browser Notification (plays when backgrounded or active)
              if (typeof Notification !== "undefined" && Notification.permission === "granted") {
                if (document.hidden || !isChatViewActive) {
                  sendSystemNotification(`${newMsg.userName || "Classmate"} (Class Chat)`, {
                    body: newMsg.text || "Sent a message",
                    icon: "assets/icon-192.png",
                    badge: "assets/favicon-32x32-light.png",
                    tag: "chat-msg-" + (change.doc.id || Date.now()),
                    data: {
                      url: "./index.html",
                      targetView: "chat"
                    }
                  }, () => {
                    window.focus();
                    const navChat = document.getElementById("nav-chat");
                    if (navChat) navChat.click();
                  });
                }
              }
            }
          }
        });
      }

      initialLoad = false;
    },
    (err) => {
      console.warn("Chat listener snapshot error:", err);
    }
  );
}

// Initialize Chat Form & Controls
function initChatManager() {
  const form = document.getElementById("chat-message-form");
  const textarea = document.getElementById("chat-text-input");
  const btnSound = document.getElementById("btn-chat-toggle-sound");
  const soundIcon = document.getElementById("chat-sound-icon");
  const soundText = document.getElementById("chat-sound-text");

  // Load sound mute preference
  try {
    chatSoundMuted = localStorage.getItem("quill_q_chat_mute") === "true";
    if (chatSoundMuted) {
      if (soundIcon) soundIcon.className = "fi fi-rr-bell-slash";
      if (soundText) soundText.textContent = "Unmute";
    }
  } catch (e) {}

  if (btnSound) {
    btnSound.addEventListener("click", () => {
      chatSoundMuted = !chatSoundMuted;
      try { localStorage.setItem("quill_q_chat_mute", String(chatSoundMuted)); } catch (e) {}
      if (soundIcon) soundIcon.className = chatSoundMuted ? "fi fi-rr-bell-slash" : "fi fi-rr-bell";
      if (soundText) soundText.textContent = chatSoundMuted ? "Unmute" : "Mute";
    });
  }

  if (textarea) {
    // Auto resize height as user types
    textarea.addEventListener("input", () => {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 100) + "px";
    });

    // Enter to submit (Shift+Enter for newline)
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const text = textarea.value;
        if (text && text.trim()) {
          sendChatMessage(text);
        }
      }
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (textarea) {
        const text = textarea.value;
        if (text && text.trim()) {
          sendChatMessage(text);
        }
      }
    });
  }

  // Quick Emoji Buttons
  const btnThumbs = document.getElementById("chat-btn-thumbs");
  const btnHeart = document.getElementById("chat-btn-heart");
  const btnHands = document.getElementById("chat-btn-hands");

  if (btnThumbs) btnThumbs.addEventListener("click", () => sendChatMessage("👍"));
  if (btnHeart) btnHeart.addEventListener("click", () => sendChatMessage("❤️"));
  if (btnHands) btnHands.addEventListener("click", () => sendChatMessage("🙋‍♂️"));

  // Seen By Modal Close Handlers
  const seenModal = document.getElementById("chat-seen-modal");
  const seenCloseBtn = document.getElementById("chat-seen-modal-close");
  if (seenCloseBtn) {
    seenCloseBtn.addEventListener("click", closeSeenByModal);
  }
  if (seenModal) {
    seenModal.addEventListener("click", (e) => {
      if (e.target === seenModal) closeSeenByModal();
    });
  }
}

const yieldToMain = () => {
  if (typeof window !== "undefined" && window.scheduler && typeof window.scheduler.yield === "function") {
    return window.scheduler.yield();
  }
  return new Promise((resolve) => setTimeout(resolve, 0));
};

document.addEventListener("DOMContentLoaded", async () => {
  // Phase 1: Critical layout & primary render (immediate synchronous paint)
  initPageNavigation();
  initFirebaseAuthAndProfile();
  syncDefaultDay();
  updateTodayStatus();
  renderDetailedSchedule(currentSelectedDay);
  renderSchedule();
  renderDate();
  initNav();

  // Yield to main thread so UI renders immediately without blocking FCP / INP
  await yieldToMain();

  // Phase 2: Secondary managers & event listeners
  initHomeworksManager();
  initQuickNotesManager();
  initChatManager();
  initNotificationCenter();
  initSearch();
  initSubjectFilters();

  await yieldToMain();

  // Phase 3: Background services & worker registration
  unlockAudioOnMobile();
  registerServiceWorker();

  // Refresh dynamic status, schedule, and time every 30 seconds
  setInterval(() => {
    updateTodayStatus();
    renderSchedule();
    renderDate();
  }, 30000);
});



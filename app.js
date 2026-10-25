// ===== School-Q Dashboard =====
// Groupe: 2ANG-AFF 1 Timetable

const TIMETABLE = {
  Mon: {
    dayName: "Monday",
    dateLabel: "Monday, Oct 19",
    activeClassIndex: 1, // Writing as current active class
    items: [
      {
        time: "08:30 AM – 10:00 AM",
        subject: "Entrepreneurial Skills (Droit)",
        prof: "شنيس علي صلاح",
        room: "Salle-14",
        color: "#e8987a",
        icon: "law"
      },
      {
        time: "10:00 AM – 11:30 AM",
        subject: "Writing",
        prof: "نسرين بن الصادق",
        room: "Salle-15",
        color: "#f6cf7c",
        current: true,
        icon: "writing"
      },
      {
        time: "11:30 AM – 01:00 PM",
        subject: "British History",
        prof: "عيادي روضة",
        room: "Amphi 1",
        color: "#a9c6ec",
        icon: "history"
      },
      {
        time: "01:30 PM – 02:30 PM",
        subject: "Financial English 1",
        prof: "غربي إيمان",
        room: "Amphi 6",
        color: "#5bae86",
        icon: "finance"
      },
      {
        time: "02:30 PM – 04:00 PM",
        subject: "Drama / Poetry / Novel",
        prof: "بن شهيدة مريم",
        room: "lab-3",
        color: "#e0835f",
        icon: "theater"
      }
    ]
  },
  Tue: {
    dayName: "Tuesday",
    dateLabel: "Tuesday, Oct 20",
    activeClassIndex: 1,
    items: [
      {
        time: "08:30 AM – 10:00 AM",
        subject: "Other Languages (French)",
        prof: "بن علي حافظ",
        room: "Salle-14",
        color: "#e8987a",
        icon: "language"
      },
      {
        time: "10:00 AM – 11:30 AM",
        subject: "Other Languages (Arabic)",
        prof: "مريم الهماصي",
        room: "Salle-02",
        color: "#f6cf7c",
        current: true,
        icon: "language"
      },
      {
        time: "12:30 PM – 02:00 PM",
        subject: "Grammar in Context",
        prof: "العفاس نجلاء",
        room: "Amphi 4",
        color: "#a9c6ec",
        icon: "grammar"
      },
      {
        time: "02:00 PM – 03:30 PM",
        subject: "Grammar in Context",
        prof: "العفاس نجلاء",
        room: "Salle-18",
        color: "#5bae86",
        icon: "grammar"
      }
    ]
  },
  Wed: {
    dayName: "Wednesday",
    dateLabel: "Wednesday, Oct 21",
    activeClassIndex: 1,
    items: [
      {
        time: "08:30 AM – 10:00 AM",
        subject: "Drama / Poetry / Novel",
        prof: "غمامي سناء",
        room: "Salle-15",
        color: "#e8987a",
        icon: "theater"
      },
      {
        time: "10:00 AM – 11:30 AM",
        subject: "Literary Trends",
        prof: "عنيف حافظ",
        room: "Amphi 1",
        color: "#f6cf7c",
        current: true,
        icon: "literature"
      },
      {
        time: "01:00 PM – 02:30 PM",
        subject: "Financial English 1",
        prof: "غربي أحمد عبد العزيز",
        room: "Salle-15",
        color: "#a9c6ec",
        icon: "finance"
      },
      {
        time: "02:30 PM – 04:00 PM",
        subject: "Drama / Poetry / Novel",
        prof: "كلثوم بالوافي",
        room: "Salle-16",
        color: "#5bae86",
        icon: "theater"
      }
    ]
  },
  Thu: {
    dayName: "Thursday",
    dateLabel: "Thursday, Oct 22",
    activeClassIndex: 0,
    items: [
      {
        time: "09:30 AM – 11:00 AM",
        subject: "Introduction to Linguistics",
        prof: "رانية الإدريس",
        room: "Amphi 3",
        color: "#f6cf7c",
        current: true,
        icon: "linguistics"
      },
      {
        time: "11:00 AM – 12:30 PM",
        subject: "Introduction to Linguistics",
        prof: "رانية الإدريس",
        room: "Salle-10",
        color: "#e8987a",
        icon: "linguistics"
      },
      {
        time: "01:30 PM – 03:00 PM",
        subject: "US History",
        prof: "كعمون وسيم",
        room: "Amphi 4",
        color: "#a9c6ec",
        icon: "history"
      },
      {
        time: "03:00 PM – 04:30 PM",
        subject: "US History",
        prof: "كعمون وسيم",
        room: "Salle-12",
        color: "#5bae86",
        icon: "history"
      }
    ]
  },
  Fri: {
    dayName: "Friday",
    dateLabel: "Friday, Oct 23",
    activeClassIndex: 1,
    items: [
      {
        time: "08:30 AM – 10:00 AM",
        subject: "British History",
        prof: "عيادي روضة",
        room: "Salle-13",
        color: "#e8987a",
        icon: "history"
      },
      {
        time: "10:00 AM – 11:30 AM",
        subject: "Commercial English 1",
        prof: "الشرقي سهلة",
        room: "Amphi 4",
        color: "#f6cf7c",
        current: true,
        icon: "business"
      },
      {
        time: "11:30 AM – 01:00 PM",
        subject: "Commercial English 1",
        prof: "الشرقي سهلة",
        room: "Salle-10",
        color: "#a9c6ec",
        icon: "business"
      },
      {
        time: "01:30 PM – 03:00 PM",
        subject: "Entrepreneurial Skills",
        prof: "الغندري أحلام",
        room: "Salle-12",
        color: "#5bae86",
        icon: "law"
      },
      {
        time: "04:00 PM – 05:30 PM",
        subject: "Activités pratiques (TEFL)",
        prof: "رانية الإدريس",
        room: "Salle-11",
        color: "#e0835f",
        icon: "tefl"
      }
    ]
  },
  Sat: {
    dayName: "Saturday",
    dateLabel: "Saturday, Oct 24",
    activeClassIndex: -1,
    items: []
  }
};

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
      // Drama / Poetry / Novel - Comedy & Drama Masks with ribbon
      return `
        <svg viewBox="0 0 34 34" class="sched-subject-icon icon-theater" fill="none">
          <path d="M7 8 C7 5 11 5 17 5 C23 5 27 5 27 8 C27 15 24 23 17 26 C10 23 7 15 7 8 Z" fill="#faeee9" stroke="#25211e" stroke-width="1.8" stroke-linejoin="round"/>
          <!-- Eyes -->
          <ellipse cx="13" cy="12" rx="2" ry="3" fill="#25211e"/>
          <ellipse cx="21" cy="12" rx="2" ry="3" fill="#25211e"/>
          <!-- Theatrical curved smile -->
          <path d="M12 18 C14 22 20 22 22 18" stroke="#25211e" stroke-width="1.8" stroke-linecap="round" fill="none"/>
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
      if (nextSubjectEl) nextSubjectEl.textContent = "Enjoy your weekend!";
      if (nextTimeEl) nextTimeEl.textContent = "Review study materials";
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

// --- Render Right Sidebar Quick Timeline ---
function renderSchedule(dayKey = currentSelectedDay) {
  const dayData = TIMETABLE[dayKey] || TIMETABLE["Mon"];
  const timelineEl = document.getElementById("timeline");
  const scheduleTitleEl = document.getElementById("schedule-title");
  if (!timelineEl) return;

  const now = new Date();
  const todayKey = getDayKey(now);
  const isActualToday = dayKey === todayKey;

  if (scheduleTitleEl) {
    scheduleTitleEl.textContent = isActualToday ? "Today's Schedule" : `${dayData.dayName}'s Schedule`;
  }

  if (dayData.items.length === 0) {
    timelineEl.innerHTML = `
      <li class="tl-item" style="color: #7b7268; padding: 12px 4px;">
        No classes scheduled for ${dayData.dayName}.
      </li>`;
    return;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Build unified entries (classes and break cutouts)
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

  timelineEl.innerHTML = entries
    .map((entry, idx) => {
      if (entry.type === "break") {
        let isBreakCurrent = false;
        if (isActualToday) {
          isBreakCurrent = currentMinutes >= entry.startMinutes && currentMinutes < entry.endMinutes;
        }

        return `
          <li class="tl-item tl-item-break${isBreakCurrent ? " current-break" : ""}" style="--item-idx: ${idx};">
            <span class="tl-dot tl-dot-break"></span>
            <span class="tl-text tl-break-cutout">
              <span class="tl-content">
                <span class="tl-break-pill">☕ ${entry.durationText}</span>
                <span class="tl-break-time">${entry.time}</span>
                <span class="tl-break-label">${isBreakCurrent ? "Break in Progress" : "Recess / Free Time"}</span>
              </span>
            </span>
          </li>`;
      }

      const x = entry.item;
      let isCurrent = false;
      if (isActualToday) {
        const { start, end } = parseTimeRange(x.time);
        isCurrent = currentMinutes >= start && currentMinutes < end;
      }

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
    subheadingEl.innerHTML = `${dayData.dayName}'s Schedule (${dayData.dateLabel}) — <span style="font-weight: 500; font-size: 14.5px; color: #786e63;">Groupe: 2ANG-AFF 1</span>`;
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
  const viewHome = document.getElementById("view-home");
  const viewSchedule = document.getElementById("view-schedule");
  const viewSubjects = document.getElementById("view-subjects");
  const viewHomeworks = document.getElementById("view-homeworks");
  const hwNote = document.getElementById("sticky-homework-note");
  const subjectsSide = document.getElementById("subjects-side-wrap");
  const homeworksSide = document.getElementById("homeworks-side-wrap");
  const mainEl = document.querySelector(".main");

  // Hide all view panels first
  if (viewHome) viewHome.classList.add("view-hidden");
  if (viewSchedule) viewSchedule.classList.add("view-hidden");
  if (viewSubjects) viewSubjects.classList.add("view-hidden");
  if (viewHomeworks) viewHomeworks.classList.add("view-hidden");

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
  } else if (page === "homeworks") {
    if (viewHomeworks) viewHomeworks.classList.remove("view-hidden");
    if (mainEl) mainEl.classList.remove("on-schedule-view");
    if (hwNote) hwNote.classList.add("view-hidden");
    if (subjectsSide) subjectsSide.classList.add("view-hidden");
    if (homeworksSide) homeworksSide.classList.remove("view-hidden");
    renderHomeworksView();
  } else {
    // Default Home view: homework note stays as is
    if (viewHome) viewHome.classList.remove("view-hidden");
    if (mainEl) mainEl.classList.remove("on-schedule-view");
    if (hwNote) hwNote.classList.remove("view-hidden");
    if (subjectsSide) subjectsSide.classList.add("view-hidden");
    if (homeworksSide) homeworksSide.classList.add("view-hidden");
    updateTodayStatus();
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
  const items = document.querySelectorAll(".nav-item");
  items.forEach((item) =>
    item.addEventListener("click", (e) => {
      e.preventDefault();
      items.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      const page = item.dataset.page || "home";
      switchView(page);
    })
  );

  // Weekly day card click interaction
  const dayCards = document.querySelectorAll(".week-paper-card");
  dayCards.forEach((card) => {
    card.addEventListener("click", () => {
      dayCards.forEach((c) => c.classList.remove("active-day"));
      card.classList.add("active-day");
      currentSelectedDay = card.dataset.day || "Mon";
      renderDetailedSchedule(currentSelectedDay);
      renderSchedule(currentSelectedDay);
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
    });
  }
}

// --- Homework & Reminders Manager (Paper Cards, Baby Pink & Sky Blue, Auto-deletes on Due Date) ---
const HW_KEY = "quill-q-homework-reminders-v7";

const DEFAULT_TASKS = [
  { id: "task-1", subject: "Writing", desc: "Read Act 1 & 2 of Drama", due: "2026-10-26", type: "homework", completed: true },
  { id: "task-2", subject: "Entrepreneurial Skills (Droit)", desc: "Essay: Entrepreneurial Skills draft", due: "2026-10-27", type: "homework", completed: false },
  { id: "task-3", subject: "", desc: "Review terminology & definitions for Amphi 6", due: "2026-10-28", type: "reminder", completed: false },
  { id: "task-4", subject: "British History", desc: "Prepare presentation slides on Roman Britain", due: "2026-10-29", type: "homework", completed: false },
  { id: "task-5", subject: "Commercial English 1", desc: "Submit trade terminology vocabulary list", due: "2026-10-30", type: "homework", completed: false },
  { id: "task-6", subject: "", desc: "Library book return deadline", due: "2026-10-31", type: "reminder", completed: false }
];

function isTaskDueReached(task) {
  if (!task || !task.due) return false;

  // 1. If ISO date string YYYY-MM-DD
  const m = String(task.due).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    // Expires after the end of the due day: 23:59:59.999
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

function getStoredTasks() {
  let list = [];
  try {
    const raw = localStorage.getItem(HW_KEY);
    if (raw) {
      list = JSON.parse(raw);
    } else {
      list = [...DEFAULT_TASKS];
    }
  } catch (e) {
    console.error("Error reading tasks from storage:", e);
    list = [...DEFAULT_TASKS];
  }

  // Auto-delete: filter out any tasks that have reached their due date
  const active = list.filter((t) => !isTaskDueReached(t));
  if (active.length !== list.length) {
    saveStoredTasks(active);
  }
  return active;
}

function saveStoredTasks(tasks) {
  try {
    localStorage.setItem(HW_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error("Error saving tasks to storage:", e);
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

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

function renderHomeworksView() {
  const container = document.getElementById("hw-tasks-list");
  if (!container) return;

  const tasks = getStoredTasks();

  if (!tasks.length) {
    container.innerHTML = `
      <div class="hw-empty-state" style="grid-column: 1 / -1;">
        <div class="hw-empty-icon" style="font-size:36px; margin-bottom:12px;">✨</div>
        <h4 class="hw-empty-text" style="font-size:20px; font-weight:700; color:#1a1816; margin:0 0 6px;">All clear!</h4>
        <p class="hw-empty-hint" style="font-size:14px; color:#786e63; margin:0;">No active homework or reminders. Use Quick Actions on the side to add one.</p>
      </div>`;
    return;
  }

  container.innerHTML = tasks.map((task) => `
    <div class="hw-paper-item">
      <div class="hw-paper-shadow" aria-hidden="true"></div>
      <article class="hw-task-card hw-card-${task.type} ${task.completed ? "is-completed" : ""}" data-id="${task.id}" data-type="${task.type}">
        <div class="hw-paper-top">
          <div class="hw-paper-meta">
            ${task.type === "reminder"
              ? `<span class="hw-paper-type">Reminder</span>`
              : `<span class="hw-paper-subject">${escapeHtml(task.subject)}</span>
                 <span class="hw-paper-sep">•</span>
                 <span class="hw-paper-type">Homework</span>`
            }
          </div>
          <button type="button" class="hw-chk-btn" data-id="${task.id}" aria-label="Toggle completed">
            <span class="hw-chk-box">
              <svg viewBox="0 0 16 16" class="hw-chk-svg">
                <path d="M3 8.5 L6.5 12 L13 4" />
              </svg>
            </span>
          </button>
        </div>
        <div class="hw-paper-body">
          <p class="hw-paper-desc">${escapeHtml(task.desc)}</p>
        </div>
        <div class="hw-paper-footer">
          <span class="hw-paper-due">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${escapeHtml(formatDueDisplay(task.due))}
          </span>
        </div>
      </article>
    </div>
  `).join("");

  // Attach event listeners for checkboxes
  container.querySelectorAll(".hw-chk-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const all = getStoredTasks();
      const item = all.find((t) => t.id === id);
      if (item) {
        item.completed = !item.completed;
        saveStoredTasks(all);
        renderHomeworksView();
        syncHomeHomeworkNote();
      }
    });
  });
}

function syncHomeHomeworkNote() {
  const hwList = document.getElementById("hw-list");
  if (!hwList) return;
  const tasks = getStoredTasks().slice(0, 5); // top 5
  if (!tasks.length) {
    hwList.innerHTML = `<li style="list-style:none; padding:10px 0; color:#7d756c; font-size:14px;">No upcoming homework!</li>`;
    return;
  }

  hwList.innerHTML = tasks.map((t, idx) => `
    <li>
      <label>
        <input type="checkbox" id="hw-home-chk-${idx}" ${t.completed ? "checked" : ""} data-id="${t.id}" />
        <span class="custom-chk">
          <svg viewBox="0 0 20 20" class="chk-svg">
            <rect x="2" y="2" width="16" height="16" rx="2.5" class="box-stroke" />
            <path d="M4 9.5 L8 14.5 L16.5 2.5" class="tick-stroke" />
          </svg>
        </span>
        <span class="hw-text">${escapeHtml(t.desc)} <small style="opacity:0.8">(${escapeHtml(formatDueDisplay(t.due) || (t.type === "reminder" ? "Reminder" : t.subject))})</small></span>
      </label>
    </li>
  `).join("");

  hwList.querySelectorAll("input[type=checkbox]").forEach((chk) => {
    chk.addEventListener("change", () => {
      const id = chk.dataset.id;
      const all = getStoredTasks();
      const item = all.find((t) => t.id === id);
      if (item) {
        item.completed = chk.checked;
        saveStoredTasks(all);
        renderHomeworksView();
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

  function openModal(type) {
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
    modalDesc.value = "";
    // Default due date to tomorrow
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
    modalForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const desc = modalDesc.value.trim();
      if (!desc) return;

      const type = modalTypeInput.value || "homework";
      const subject = type === "reminder" ? "" : (modalSubject.value || "General");
      const due = modalDue.value.trim() || new Date(Date.now() + 86400000).toISOString().split("T")[0];

      const newTask = {
        id: "task-" + Date.now(),
        subject,
        desc,
        due,
        type,
        completed: false
      };

      const tasks = getStoredTasks();
      tasks.unshift(newTask); // add to top
      saveStoredTasks(tasks);

      renderHomeworksView();
      syncHomeHomeworkNote();
      closeModal();
    });
  }

  // Periodic auto-cleanup: checks every 30 seconds for expired tasks and auto-prunes
  setInterval(() => {
    renderHomeworksView();
    syncHomeHomeworkNote();
  }, 30000);

  // Initial render
  renderHomeworksView();
  syncHomeHomeworkNote();
}

// --- Course search filters timelines and homework tasks ---
function initSearch() {
  const input = document.getElementById("search-input");
  if (!input) return;
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    // Quick timeline on Home page
    const items = document.querySelectorAll(".timeline .tl-item");
    items.forEach((item) => {
      const text = item.textContent.toLowerCase();
      item.style.display = q && !text.includes(q) ? "none" : "";
    });
    // Detailed timeline in Schedule View
    const dtlRows = document.querySelectorAll(".detailed-timeline .dtl-row");
    dtlRows.forEach((row) => {
      if (row.classList.contains("dtl-row-break")) {
        row.style.display = q && !("break".includes(q) || "recess".includes(q) || "free".includes(q)) ? "none" : "";
      } else {
        const text = row.textContent.toLowerCase();
        row.style.display = q && !text.includes(q) ? "none" : "";
      }
    });

    // Bento cards in Subjects View
    const bentoCards = document.querySelectorAll(".bento-subject-card");
    bentoCards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      card.style.display = q && !text.includes(q) ? "none" : "";
    });

    // Homework cards in Homework View
    const hwItems = document.querySelectorAll(".hw-paper-item");
    hwItems.forEach((item) => {
      const text = item.textContent.toLowerCase();
      item.style.display = q && !text.includes(q) ? "none" : "";
    });
  });
}

// --- Firebase & User Profile Management ---
const firebaseConfig = {
  projectId: "quill-q-dodch",
  appId: "1:648049411331:web:880ce305ebe145df9e9536",
  storageBucket: "quill-q-dodch.firebasestorage.app",
  apiKey: "AIzaSyBhOd39WoozsZBCrCRjQt1D23uoTJqqZgk",
  authDomain: "quill-q-dodch.firebaseapp.com",
  messagingSenderId: "648049411331",
  projectNumber: "648049411331"
};

let auth = null;
let db = null;
let currentUser = null;
let currentProfile = null;

function navigateToDashboard() {
  const landingPage = document.getElementById("landing-page");
  const authPage = document.getElementById("auth-page");
  const dashboardApp = document.getElementById("dashboard-app");

  if (landingPage) landingPage.classList.add("landing-hidden");
  if (authPage) authPage.classList.add("landing-hidden");
  if (dashboardApp) {
    dashboardApp.classList.remove("dashboard-hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      checkTimelineMarquees();
      updateTodayStatus();
    }, 50);
  }
}

function navigateToLanding() {
  const landingPage = document.getElementById("landing-page");
  const authPage = document.getElementById("auth-page");
  const dashboardApp = document.getElementById("dashboard-app");

  if (authPage) authPage.classList.add("landing-hidden");
  if (dashboardApp) dashboardApp.classList.add("dashboard-hidden");
  if (landingPage) {
    landingPage.classList.remove("landing-hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function navigateToAuth() {
  const landingPage = document.getElementById("landing-page");
  const authPage = document.getElementById("auth-page");
  const dashboardApp = document.getElementById("dashboard-app");

  if (landingPage) landingPage.classList.add("landing-hidden");
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

function applyProfileToUI(profile) {
  if (!profile) {
    // Default guest profile
    const homeAvatar = document.getElementById("home-greeting-avatar");
    const homeName = document.getElementById("home-greeting-name");
    const homeRoleChip = document.getElementById("home-user-role-chip");
    const homeRoleText = document.getElementById("home-user-role-text");
    const homeRoleAcademic = document.getElementById("home-user-academic");
    const sideAvatar = document.getElementById("sidebar-user-avatar");
    const sideName = document.getElementById("sidebar-user-name");
    const sideRole = document.getElementById("sidebar-user-role");

    if (homeAvatar) homeAvatar.src = "assets/avatar.jpg";
    if (homeName) homeName.textContent = "Roberta";
    if (homeRoleText) homeRoleText.textContent = "Student";
    if (homeRoleAcademic) homeRoleAcademic.textContent = "Year 2";
    if (sideAvatar) sideAvatar.src = "assets/avatar.jpg";
    if (sideName) sideName.textContent = "Roberta";
    if (sideRole) sideRole.textContent = "Student";

    const btnGetStarted = document.getElementById("btn-get-started");
    if (btnGetStarted) btnGetStarted.textContent = "Get Started";
    return;
  }

  const isTeacher = profile.role === "teacher";
  const roleDisplay = isTeacher ? "Teacher" : "Student";
  const academicDisplay = profile.academicDetail || (isTeacher ? "Faculty" : "Undergrad");
  const avatarUrl = profile.photoURL || "assets/avatar.jpg";
  const firstName = (profile.displayName || "Roberta").split(" ")[0];

  // Update Home Greeting
  const homeAvatar = document.getElementById("home-greeting-avatar");
  const homeName = document.getElementById("home-greeting-name");
  const homeRoleIcon = document.getElementById("home-user-role-icon");
  const homeRoleText = document.getElementById("home-user-role-text");
  const homeRoleAcademic = document.getElementById("home-user-academic");

  if (homeAvatar) homeAvatar.src = avatarUrl;
  if (homeName) homeName.textContent = firstName;
  if (homeRoleIcon) homeRoleIcon.textContent = isTeacher ? "👨‍🏫" : "🎓";
  if (homeRoleText) homeRoleText.textContent = roleDisplay;
  if (homeRoleAcademic) homeRoleAcademic.textContent = academicDisplay;

  // Update Sidebar User Card
  const sideAvatar = document.getElementById("sidebar-user-avatar");
  const sideName = document.getElementById("sidebar-user-name");
  const sideRole = document.getElementById("sidebar-user-role");

  if (sideAvatar) sideAvatar.src = avatarUrl;
  if (sideName) sideName.textContent = profile.displayName || firstName;
  if (sideRole) sideRole.textContent = `${roleDisplay} • ${academicDisplay}`;

  // Update Landing button text
  const btnGetStarted = document.getElementById("btn-get-started");
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
    } catch (e) {
      console.warn("Firebase initialization warning:", e);
    }
  }

  // 2. Load cached profile immediately
  const cachedProfileStr = localStorage.getItem("quill_q_profile");
  if (cachedProfileStr) {
    try {
      currentProfile = JSON.parse(cachedProfileStr);
      applyProfileToUI(currentProfile);
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
  const onboardingAvatarBadge = document.getElementById("onboarding-avatar-badge");
  const onboardingName = document.getElementById("onboarding-name");
  const onboardingAge = document.getElementById("onboarding-age");
  const onboardingGender = document.getElementById("onboarding-gender");
  const onboardingAcademicLabel = document.getElementById("onboarding-academic-label");
  const onboardingAcademicInput = document.getElementById("onboarding-academic-input");
  const onboardingAcademicHint = document.getElementById("onboarding-academic-hint");
  const roleLabelStudent = document.getElementById("role-label-student");
  const roleLabelTeacher = document.getElementById("role-label-teacher");
  const roleRadioStudent = document.getElementById("role-radio-student");
  const roleRadioTeacher = document.getElementById("role-radio-teacher");
  const btnSubmitOnboarding = document.getElementById("btn-submit-onboarding");
  const btnSubmitOnboardingText = document.getElementById("btn-submit-onboarding-text");
  const btnSidebarLogout = document.getElementById("btn-sidebar-logout");

  function showOnboardingStep(user) {
    if (stepSignin) stepSignin.classList.add("view-hidden");
    if (stepOnboarding) stepOnboarding.classList.remove("view-hidden");

    if (user) {
      if (onboardingPreviewAvatar) {
        onboardingPreviewAvatar.src = user.photoURL || "assets/avatar.jpg";
      }
      if (onboardingName && !onboardingName.value) {
        onboardingName.value = user.displayName || "";
      }
    }

    selectRole("student");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectRole(role) {
    if (role === "teacher") {
      if (roleRadioTeacher) roleRadioTeacher.checked = true;
      if (roleLabelTeacher) roleLabelTeacher.classList.add("selected");
      if (roleLabelStudent) roleLabelStudent.classList.remove("selected");
      if (onboardingAvatarBadge) onboardingAvatarBadge.textContent = "👨‍🏫";
      if (onboardingAcademicLabel) onboardingAcademicLabel.innerHTML = 'Department / Subject Taught <span class="required-star">*</span>';
      if (onboardingAcademicInput) {
        onboardingAcademicInput.placeholder = "e.g. Department of English Literature";
      }
      if (onboardingAcademicHint) {
        onboardingAcademicHint.textContent = "Enter your department, faculty, or course specialty.";
      }
    } else {
      if (roleRadioStudent) roleRadioStudent.checked = true;
      if (roleLabelStudent) roleLabelStudent.classList.add("selected");
      if (roleLabelTeacher) roleLabelTeacher.classList.remove("selected");
      if (onboardingAvatarBadge) onboardingAvatarBadge.textContent = "🎓";
      if (onboardingAcademicLabel) onboardingAcademicLabel.innerHTML = 'Class / Year / Grade <span class="required-star">*</span>';
      if (onboardingAcademicInput) {
        onboardingAcademicInput.placeholder = "e.g. Year 2 - British Studies, Class 3B";
      }
      if (onboardingAcademicHint) {
        onboardingAcademicHint.textContent = "Enter your class, cohort, or academic year.";
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
      if (currentUser && currentProfile && currentProfile.profileCompleted) {
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
          navigateToDashboard();
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

      const selectedRole = roleRadioTeacher && roleRadioTeacher.checked ? "teacher" : "student";
      const name = (onboardingName ? onboardingName.value.trim() : "") || currentUser.displayName || "Student";
      const age = onboardingAge ? parseInt(onboardingAge.value, 10) : 20;
      const gender = onboardingGender ? onboardingGender.value : "prefer-not-to-say";
      const academicDetail = onboardingAcademicInput ? onboardingAcademicInput.value.trim() : "";

      const profilePayload = {
        uid: currentUser.uid,
        displayName: name,
        email: currentUser.email || "",
        photoURL: currentUser.photoURL || "assets/avatar.jpg",
        role: selectedRole,
        age: age || null,
        gender: gender,
        academicDetail: academicDetail,
        profileCompleted: true,
        updatedAt: firebase.firestore ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
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

        currentProfile = profilePayload;
        localStorage.setItem("quill_q_profile", JSON.stringify(profilePayload));
        applyProfileToUI(profilePayload);

        navigateToDashboard();
      } catch (saveErr) {
        console.error("Error saving profile:", saveErr);
        currentProfile = profilePayload;
        localStorage.setItem("quill_q_profile", JSON.stringify(profilePayload));
        applyProfileToUI(profilePayload);
        navigateToDashboard();
      } finally {
        if (btnSubmitOnboardingText) btnSubmitOnboardingText.textContent = "Create Account & Enter Dashboard";
        if (btnSubmitOnboarding) btnSubmitOnboarding.disabled = false;
      }
    });
  }

  // Sidebar Logout
  if (btnSidebarLogout) {
    btnSidebarLogout.addEventListener("click", async () => {
      if (confirm("Are you sure you want to sign out of Quill-Q?")) {
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
        if (!currentProfile || currentProfile.uid !== user.uid) {
          if (db) {
            try {
              const snap = await db.collection("users").doc(user.uid).get();
              if (snap.exists && snap.data() && snap.data().profileCompleted) {
                currentProfile = snap.data();
                localStorage.setItem("quill_q_profile", JSON.stringify(currentProfile));
                applyProfileToUI(currentProfile);
              }
            } catch (err) {
              console.warn("Auth state profile fetch error:", err);
            }
          }
        } else {
          applyProfileToUI(currentProfile);
        }
      } else {
        currentUser = null;
        currentProfile = null;
        localStorage.removeItem("quill_q_profile");
        applyProfileToUI(null);
      }
    });
  }
}

// --- Page Navigation (Brand Logo -> Landing) ---
function initPageNavigation() {
  const brandLogo = document.querySelector(".sidebar .brand");
  if (brandLogo) {
    brandLogo.style.cursor = "pointer";
    brandLogo.addEventListener("click", () => {
      navigateToLanding();
    });
  }
}

// Sync default day with actual current day
function syncDefaultDay() {
  const todayKey = getDayKey();
  if (TIMETABLE[todayKey]) {
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

document.addEventListener("DOMContentLoaded", () => {
  initPageNavigation();
  initFirebaseAuthAndProfile();
  syncDefaultDay();
  updateTodayStatus();
  renderDetailedSchedule(currentSelectedDay);
  renderSchedule(currentSelectedDay);
  renderDate();
  initNav();
  initHomeworksManager();
  initSearch();
  initSubjectFilters();

  // Refresh dynamic status and time every 30 seconds
  setInterval(() => {
    updateTodayStatus();
    renderDate();
  }, 30000);
});


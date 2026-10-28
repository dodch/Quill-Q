/**
 * subjects-config.js - Unified Subject Registry for Quill-Q
 * Contains metadata, professor details, icons, and themes for all subjects.
 */

const SUBJECTS_REGISTRY = {
  "drama": {
    id: "drama",
    name: "Drama",
    shortName: "Drama",
    code: "LIT-201A",
    prof: "بن شهيدة مريم",
    secondaryProfs: ["غمامي سناء", "كلثوم بالوافي"],
    room: "Lab 3",
    color: "#e0835f",
    bgClass: "card-peach",
    icon: "theater",
    description: "Classical and modern dramatic literature, theatrical performance analysis, and play scripts.",
    schedule: "Mon 13:30 (Lab 3)"
  },
  "poetry": {
    id: "poetry",
    name: "Poetry",
    shortName: "Poetry",
    code: "LIT-201B",
    prof: "غمامي سناء",
    secondaryProfs: ["بن شهيدة مريم"],
    room: "Salle 15",
    color: "#f6cf7c",
    bgClass: "card-yellow",
    icon: "poetry",
    description: "Poetic forms, meter, verse analysis, and critical appreciation of English poetry across eras.",
    schedule: "Wed 08:30 (Salle 15)"
  },
  "novel": {
    id: "novel",
    name: "Novel",
    shortName: "Novel",
    code: "LIT-201C",
    prof: "كلثوم بالوافي",
    secondaryProfs: [],
    room: "Salle 16",
    color: "#5bae86",
    bgClass: "card-green",
    icon: "novel",
    description: "Foundational English and world novels, narrative structures, thematic depth, and prose fiction.",
    schedule: "Wed 14:30 (Salle 16)"
  },
  "drama-poetry-novel": {
    id: "drama-poetry-novel",
    name: "Drama / Poetry / Novel",
    shortName: "Drama & Poetry",
    code: "LIT-201",
    prof: "بن شهيدة مريم",
    secondaryProfs: ["غمامي سناء", "كلثوم بالوافي"],
    room: "Lab 3 / Salle 15 / Salle 16",
    color: "#e0835f",
    bgClass: "card-peach",
    icon: "theater",
    description: "Exploration of classical and modern drama, poetic forms, and foundational English novels.",
    schedule: "Tue 14:30 (Poetry, Lab 3) • Wed 08:30 (Drama, Salle 15) • Wed 15:00 (Novel, Salle 16)"
  },
  "writing": {
    id: "writing",
    name: "Writing",
    shortName: "Writing",
    code: "ENG-202",
    prof: "نسرين بن الصادق",
    secondaryProfs: [],
    room: "Salle 15",
    color: "#f6cf7c",
    bgClass: "card-blue",
    icon: "writing",
    description: "Academic and professional essay construction, thesis formulation, and rhetoric.",
    schedule: "Mon 10:00 – 11:30 (Salle 15)"
  },
  "british-history": {
    id: "british-history",
    name: "British History",
    shortName: "British History",
    code: "HIS-203",
    prof: "عيادي روضة",
    secondaryProfs: [],
    room: "Amphi 1 / Salle 13",
    color: "#a9c6ec",
    bgClass: "card-green",
    icon: "history",
    description: "Political, cultural, and constitutional evolution of the British Isles from monarchy to empire.",
    schedule: "Mon 11:30 (Amphi 1) • Fri 08:30 (Salle 13)"
  },
  "financial-english-1": {
    id: "financial-english-1",
    name: "Financial English 1",
    shortName: "Financial English",
    code: "FIN-204",
    prof: "غربي إيمان",
    secondaryProfs: ["غربي أحمد عبد العزيز"],
    room: "Amphi 6 / Salle 15",
    color: "#5bae86",
    bgClass: "card-purple",
    icon: "finance",
    description: "Financial terminology, corporate accounting narratives, banking communication, and fiscal analysis.",
    schedule: "Mon 13:30 (Amphi 6) • Wed 13:30 (Salle 15)"
  },
  "entrepreneurial-skills": {
    id: "entrepreneurial-skills",
    name: "Entrepreneurial Skills (Droit)",
    shortName: "Entrepreneurship",
    code: "LAW-205",
    prof: "شابي علي صلاح",
    secondaryProfs: ["الغندري أحلام"],
    room: "Salle 14 / Salle 12",
    color: "#e8987a",
    bgClass: "card-peach",
    icon: "law",
    description: "Legal foundations of business creation, contracts, IP, and venture development.",
    schedule: "Mon 08:30 (Salle 14) • Fri 14:00 (Salle 12)"
  },
  "commercial-english-1": {
    id: "commercial-english-1",
    name: "Commercial English 1",
    shortName: "Commercial English",
    code: "COM-206",
    prof: "الشرقي سهلة",
    secondaryProfs: [],
    room: "Amphi 4 / Salle 10",
    color: "#7ab8ea",
    bgClass: "card-blue",
    icon: "business",
    description: "Global business correspondence, negotiation registers, trade terminology, and executive briefings.",
    schedule: "Fri 10:00 (Amphi 4) • Fri 11:30 (Salle 10)"
  },
  "introduction-to-linguistics": {
    id: "introduction-to-linguistics",
    name: "Introduction to Linguistics",
    shortName: "Linguistics",
    code: "LIN-207",
    prof: "رانية الدريسي",
    secondaryProfs: [],
    room: "Amphi 3 / Salle 10",
    color: "#f6cf7c",
    bgClass: "card-green",
    icon: "linguistics",
    description: "Phonetics, morphology, syntax, semantic structures, and linguistic cognition.",
    schedule: "Thu 09:30 (Amphi 3) • Thu 11:00 (Salle 10)"
  },
  "literary-trends": {
    id: "literary-trends",
    name: "Literary Trends",
    shortName: "Literary Trends",
    code: "LIT-208",
    prof: "منيف حافظ",
    secondaryProfs: [],
    room: "Amphi 1",
    color: "#ba90e8",
    bgClass: "card-purple",
    icon: "literature",
    description: "Critical survey of major literary movements: Romanticism, Realism, Modernism, and Postmodernism.",
    schedule: "Wed 10:00 – 11:30 (Amphi 1)"
  },
  "us-history": {
    id: "us-history",
    name: "US History",
    shortName: "US History",
    code: "HIS-209",
    prof: "كعمون وسيم",
    secondaryProfs: [],
    room: "Amphi 4 / Salle 12",
    color: "#e0835f",
    bgClass: "card-peach",
    icon: "history",
    description: "From colonial revolutions and the Civil War to 20th century civil rights and geopolitical hegemony.",
    schedule: "Thu 13:30 (Amphi 4) • Thu 15:00 (Salle 12)"
  },
  "grammar-in-context": {
    id: "grammar-in-context",
    name: "Grammar in Context",
    shortName: "Grammar",
    code: "GRM-210",
    prof: "العفاس نجلاء",
    secondaryProfs: [],
    room: "Amphi 4 / Salle 18",
    color: "#5bae86",
    bgClass: "card-blue",
    icon: "grammar",
    description: "Advanced structural analysis, syntactic cohesion, complex sentence crafting, and discourse syntax.",
    schedule: "Tue 11:30 (Amphi 4) • Tue 13:00 (Salle 18)"
  },
  "other-languages": {
    id: "other-languages",
    name: "Other Languages (French & Arabic)",
    shortName: "Other Languages",
    code: "LANG-211",
    prof: "بن علي حافظ / جهاد معلى",
    secondaryProfs: [],
    room: "Salle 14 / Lab 3",
    color: "#f6cf7c",
    bgClass: "card-green",
    icon: "language",
    description: "Comparative translation, cross-linguistic semantics, and advanced bilingual expression.",
    schedule: "Tue 08:30 (French, Salle 14) • Tue 10:00 (Arabic, Lab 3)"
  },
  "activites-pratiques-tefl": {
    id: "activites-pratiques-tefl",
    name: "Activités pratiques (TEFL)",
    shortName: "TEFL Practicum",
    code: "TEFL-212",
    prof: "رانية الدريسي",
    secondaryProfs: [],
    room: "Salle 11",
    color: "#e8987a",
    bgClass: "card-purple",
    icon: "tefl",
    description: "Practical methodology for teaching English as a foreign language: lesson planning and classroom tactics.",
    schedule: "Fri 16:00 – 17:30 (Salle 11)"
  }
};

/**
 * Subject Icon SVGs matching Quill-Q's hand-crafted paper aesthetic
 */
const SUBJECT_ICONS = {
  theater: `<svg viewBox="0 0 34 34" class="sched-subject-icon icon-theater" fill="none">
    <path d="M7 8 C7 5 11 5 17 5 C23 5 27 5 27 8 C27 15 24 23 17 26 C10 23 7 15 7 8 Z" fill="#faeee9" stroke="#25211e" stroke-width="1.8" stroke-linejoin="round"/>
    <ellipse cx="13" cy="12" rx="2" ry="3" fill="#25211e"/>
    <ellipse cx="21" cy="12" rx="2" ry="3" fill="#25211e"/>
    <path d="M12 18 C14 22 20 22 22 18" stroke="#25211e" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  </svg>`,
  writing: `<svg viewBox="0 0 34 34" class="sched-subject-icon icon-writing" fill="none">
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
  </svg>`,
  history: `<svg viewBox="0 0 34 34" class="sched-subject-icon icon-history" fill="none">
    <path d="M6 7 H28 V10 H6 Z" fill="#faf6ed" stroke="#25211e" stroke-width="1.7" stroke-linejoin="round"/>
    <path d="M9 10 V24 M14.3 10 V24 M19.7 10 V24 M25 10 V24" stroke="#25211e" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M5 24 H29 V28 H5 Z" fill="#faf6ed" stroke="#25211e" stroke-width="1.7" stroke-linejoin="round"/>
    <circle cx="17" cy="8.5" r="1.2" fill="#5b8fc9"/>
  </svg>`,
  finance: `<svg viewBox="0 0 34 34" class="sched-subject-icon icon-finance" fill="none">
    <circle cx="17" cy="17" r="11" fill="#fcfaf2" stroke="#25211e" stroke-width="1.8"/>
    <circle cx="17" cy="17" r="8" stroke="#5bae86" stroke-width="1.4" stroke-dasharray="2 2"/>
    <path d="M17 11 V23 M14 14 H19.5 C20.5 14 21 14.8 21 15.5 C21 16.5 20 17 17 17 C14 17 13 17.5 13 18.5 C13 19.5 14 20 15 20 H20" stroke="#25211e" stroke-width="1.7" stroke-linecap="round"/>
  </svg>`,
  law: `<svg viewBox="0 0 34 34" class="sched-subject-icon icon-law" fill="none">
    <path d="M8 8 C8 6 10 5 13 5 H23 C26 5 28 6.5 28 9 C28 11.5 26 12 24 12 H10 C8 12 7 13 7 15 V25 C7 27 8.5 28 11 28 H21 C24 28 26 27 26 25" stroke="#25211e" stroke-width="1.7" stroke-linecap="round" fill="#fcf8f0"/>
    <line x1="11" y1="17" x2="21" y2="17" stroke="#25211e" stroke-width="1.3" stroke-linecap="round"/>
    <line x1="11" y1="21" x2="18" y2="21" stroke="#25211e" stroke-width="1.3" stroke-linecap="round"/>
    <circle cx="21" cy="24" r="3" fill="#e0835f" stroke="#25211e" stroke-width="1.3"/>
  </svg>`,
  business: `<svg viewBox="0 0 34 34" class="sched-subject-icon icon-business" fill="none">
    <rect x="5" y="11" width="24" height="17" rx="3" fill="#faf6ed" stroke="#25211e" stroke-width="1.8"/>
    <path d="M12 11 V8 C12 7 13 6 14 6 H20 C21 6 22 7 22 8 V11" stroke="#25211e" stroke-width="1.7"/>
    <line x1="5" y1="17" x2="29" y2="17" stroke="#25211e" stroke-width="1.3"/>
    <rect x="15" y="15" width="4" height="4" rx="1" fill="#f8cd62" stroke="#25211e" stroke-width="1.2"/>
  </svg>`,
  linguistics: `<svg viewBox="0 0 34 34" class="sched-subject-icon icon-linguistics" fill="none">
    <circle cx="17" cy="17" r="12" fill="#faf6ed" stroke="#25211e" stroke-width="1.7"/>
    <line x1="8" y1="17" x2="10" y2="17" stroke="#25211e" stroke-width="2" stroke-linecap="round"/>
    <line x1="12" y1="13" x2="12" y2="21" stroke="#e0835f" stroke-width="2" stroke-linecap="round"/>
    <line x1="16" y1="9" x2="16" y2="25" stroke="#25211e" stroke-width="2" stroke-linecap="round"/>
    <line x1="20" y1="12" x2="20" y2="22" stroke="#e0835f" stroke-width="2" stroke-linecap="round"/>
    <line x1="24" y1="15" x2="24" y2="19" stroke="#25211e" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  literature: `<svg viewBox="0 0 34 34" class="sched-subject-icon icon-literature" fill="none">
    <path d="M17 10 C19 8 23 8 28 9 V23 C23 22 19 23 17 25 C15 23 11 22 6 23 V9 C11 8 15 8 17 10 Z" fill="#faf5ec" stroke="#25211e" stroke-width="1.8" stroke-linejoin="round"/>
    <line x1="17" y1="10" x2="17" y2="25" stroke="#25211e" stroke-width="1.6"/>
    <path d="M20 13 H25 M20 17 H24" stroke="#7a6fc4" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M9 13 H14 M10 17 H14" stroke="#7a6fc4" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`,
  grammar: `<svg viewBox="0 0 34 34" class="sched-subject-icon icon-grammar" fill="none">
    <rect x="5" y="6" width="24" height="22" rx="3.5" fill="#f4f9f7" stroke="#25211e" stroke-width="1.7"/>
    <path d="M10 13 C10 11 11.5 10 13.5 10 C14.5 10 15 11 15 12 C15 14.5 12 16.5 10.5 17" stroke="#5bae86" stroke-width="2" stroke-linecap="round"/>
    <path d="M17 13 C17 11 18.5 10 20.5 10 C21.5 10 22 11 22 12 C22 14.5 19 16.5 17.5 17" stroke="#5bae86" stroke-width="2" stroke-linecap="round"/>
    <line x1="10" y1="21" x2="24" y2="21" stroke="#25211e" stroke-width="1.4" stroke-linecap="round"/>
  </svg>`,
  language: `<svg viewBox="0 0 34 34" class="sched-subject-icon icon-language" fill="none">
    <path d="M5 8 C5 6 7 4 10 4 H21 C24 4 26 6 26 8 V16 C26 18 24 20 21 20 H12 L6 24 V20 C5 20 5 19 5 18 Z" fill="#fdfaf2" stroke="#25211e" stroke-width="1.7" stroke-linejoin="round"/>
    <path d="M10 11 H21 M10 15 H17" stroke="#5b8fc9" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="25" cy="23" r="4.5" fill="#e8987a" stroke="#25211e" stroke-width="1.4"/>
    <text x="23" y="25" font-size="6" font-weight="bold" fill="#fff" font-family="sans-serif">A</text>
  </svg>`,
  tefl: `<svg viewBox="0 0 34 34" class="sched-subject-icon icon-tefl" fill="none">
    <polygon points="17,6 29,12 17,18 5,12" fill="#faf6ed" stroke="#25211e" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M9 14.5 V21 C9 23 12 25 17 25 C22 25 25 23 25 21 V14.5" stroke="#25211e" stroke-width="1.6"/>
    <path d="M29 12 V20" stroke="#e0835f" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="29" cy="21" r="1.3" fill="#e0835f"/>
  </svg>`,
  poetry: `<svg viewBox="0 0 34 34" class="sched-subject-icon icon-poetry" fill="none">
    <!-- Quill Feather & Inkpot for Poetry -->
    <path d="M9 25 C12 25 15 23 18 20 C22 16 26 10 27 5 C23 7 17 11 14 15 C11 19 9 22 9 25 Z" fill="#faeee9" stroke="#25211e" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M12 22 L24 10" stroke="#f6cf7c" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M6 28 C6 26 8 25 11 25 C14 25 16 26 16 28 Z" fill="#25211e"/>
    <path d="M7 29 H15" stroke="#25211e" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`,
  novel: `<svg viewBox="0 0 34 34" class="sched-subject-icon icon-novel" fill="none">
    <!-- Thick Hardcover Book & Ribbon Bookmark for Novel -->
    <path d="M7 7 C7 5.5 8.5 4 10.5 4 H25 C26.5 4 27.5 5 27.5 6.5 V24 C27.5 25.5 26.5 26.5 25 26.5 H10.5 C8.5 26.5 7 28 7 28 Z" fill="#dcf2e3" stroke="#25211e" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M7 7 V28 H25" stroke="#25211e" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M11 4 V15 L14 12 L17 15 V4" fill="#e0835f" stroke="#25211e" stroke-width="1.3" stroke-linejoin="round"/>
    <line x1="12" y1="20" x2="22" y2="20" stroke="#25211e" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="12" y1="23.5" x2="19" y2="23.5" stroke="#25211e" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`
};

function getSubjectById(id) {
  if (!id) return null;
  const normalized = id.toLowerCase().trim();
  if (SUBJECTS_REGISTRY[normalized]) return SUBJECTS_REGISTRY[normalized];

  // Try matching by alias or fuzzy key
  for (const key in SUBJECTS_REGISTRY) {
    const s = SUBJECTS_REGISTRY[key];
    if (s.name.toLowerCase() === normalized || s.shortName.toLowerCase() === normalized) {
      return s;
    }
  }
  return null;
}

function getAllSubjects() {
  return Object.values(SUBJECTS_REGISTRY);
}

function getSubjectIconSvg(iconKey) {
  return SUBJECT_ICONS[iconKey] || SUBJECT_ICONS["writing"];
}

// Export for module systems (if used in modules) or assign to window
if (typeof window !== "undefined") {
  window.SUBJECTS_REGISTRY = SUBJECTS_REGISTRY;
  window.SUBJECT_ICONS = SUBJECT_ICONS;
  window.getSubjectById = getSubjectById;
  window.getAllSubjects = getAllSubjects;
  window.getSubjectIconSvg = getSubjectIconSvg;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SUBJECTS_REGISTRY,
    SUBJECT_ICONS,
    getSubjectById,
    getAllSubjects,
    getSubjectIconSvg
  };
}

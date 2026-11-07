/**
 * academic-config.js - Centralized Academic Classes & Groups Registry for Quill-Q
 * Handles dynamic classes, groups, and synchronization with Firestore config.
 */

(function () {
  "use strict";

  // Default seed classes (offline fallback & initial setup)
  const BUSINESS_SUBJECTS = [
    { id: "drama", name: "Drama", code: "LIT-201A", room: "Lab 3", color: "#e0835f", bgClass: "card-peach", icon: "theater", description: "Classical and modern dramatic literature, theatrical performance analysis, and play scripts." },
    { id: "poetry", name: "Poetry", code: "LIT-201B", room: "Salle 15", color: "#f6cf7c", bgClass: "card-yellow", icon: "poetry", description: "Poetic forms, meter, verse analysis, and critical appreciation of English poetry across eras." },
    { id: "novel", name: "Novel", code: "LIT-201C", room: "Salle 16", color: "#5bae86", bgClass: "card-green", icon: "novel", description: "Foundational English and world novels, narrative structures, thematic depth, and prose fiction." },
    { id: "writing", name: "Writing", code: "ENG-202", room: "Salle 15", color: "#f6cf7c", bgClass: "card-blue", icon: "writing", description: "Academic and professional essay construction, thesis formulation, and rhetoric." },
    { id: "british-history", name: "British History", code: "HIS-203", room: "Amphi 1 / Salle 13", color: "#a9c6ec", bgClass: "card-green", icon: "history", description: "Political, cultural, and constitutional evolution of the British Isles from monarchy to empire." },
    { id: "financial-english-1", name: "Financial English 1", code: "FIN-204", room: "Amphi 6 / Salle 15", color: "#5bae86", bgClass: "card-purple", icon: "finance", description: "Financial terminology, corporate accounting narratives, banking communication, and fiscal analysis." },
    { id: "entrepreneurial-skills", name: "Entrepreneurial Skills (Droit)", code: "LAW-205", room: "Salle 14 / Salle 12", color: "#e8987a", bgClass: "card-peach", icon: "law", description: "Legal foundations of business creation, contracts, IP, and venture development." },
    { id: "commercial-english-1", name: "Commercial English 1", code: "COM-206", room: "Amphi 4 / Salle 10", color: "#7ab8ea", bgClass: "card-blue", icon: "business", description: "Global business correspondence, negotiation registers, trade terminology, and executive briefings." },
    { id: "introduction-to-linguistics", name: "Introduction to Linguistics", code: "LIN-207", room: "Amphi 3 / Salle 10", color: "#f6cf7c", bgClass: "card-green", icon: "linguistics", description: "Phonetics, morphology, syntax, semantic structures, and linguistic cognition." },
    { id: "literary-trends", name: "Literary Trends", code: "LIT-208", room: "Amphi 1", color: "#ba90e8", bgClass: "card-purple", icon: "literature", description: "Critical survey of major literary movements: Romanticism, Realism, Modernism, and Postmodernism." },
    { id: "us-history", name: "US History", code: "HIS-209", room: "Amphi 4 / Salle 12", color: "#e0835f", bgClass: "card-peach", icon: "history", description: "From colonial revolutions and the Civil War to 20th century civil rights and geopolitical hegemony." },
    { id: "grammar-in-context", name: "Grammar in Context", code: "GRM-210", room: "Amphi 4 / Salle 18", color: "#5bae86", bgClass: "card-blue", icon: "grammar", description: "Advanced structural analysis, syntactic cohesion, complex sentence crafting, and discourse syntax." },
    { id: "other-languages", name: "Other Languages (French & Arabic)", code: "LANG-211", room: "Salle 14 / Lab 3", color: "#f6cf7c", bgClass: "card-green", icon: "language", description: "Comparative translation, cross-linguistic semantics, and advanced bilingual expression." },
    { id: "activites-pratiques-tefl", name: "Activités pratiques (TEFL)", code: "TEFL-212", room: "Salle 11", color: "#e8987a", bgClass: "card-purple", icon: "tefl", description: "Practical methodology for teaching English as a foreign language: lesson planning and classroom tactics." }
  ];

  // Default seed classes (offline fallback & initial setup)
  const DEFAULT_ACADEMIC_CLASSES = [
    {
      id: "2ang-aff",
      code: "2ANG-AFF",
      name: "2nd Year Business English",
      shortName: "Business English",
      year: "2nd Year",
      description: "Business English, financial terminology, and commercial communication.",
      groups: [
        { id: "grp1", name: "Group 1", code: "2ANG-AFF 1" },
        { id: "grp2", name: "Group 2", code: "2ANG-AFF 2" }
      ],
      subjects: BUSINESS_SUBJECTS
    },
    {
      id: "2ang-trad",
      code: "2ANG-TRAD",
      name: "2nd Year Translation (Traduction)",
      shortName: "Translation",
      year: "2nd Year",
      description: "Comparative translation, translation techniques, cross-linguistic linguistics.",
      groups: [
        { id: "grp1", name: "Group 1", code: "2ANG-TRAD 1" },
        { id: "grp2", name: "Group 2", code: "2ANG-TRAD 2" }
      ],
      subjects: []
    }
  ];

  const STORAGE_KEY = "quill_q_academic_structure";
  let activeClasses = [];
  let listeners = [];
  let structureUnsubscribe = null;

  // Initialize from cache or fallback
  function initClassesFromCache() {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          activeClasses = parsed;
          // Ensure 2ang-aff has subjects if old cache didn't have subjects property
          const affCls = activeClasses.find((c) => c.id === "2ang-aff");
          if (affCls && (!Array.isArray(affCls.subjects) || affCls.subjects.length === 0)) {
            affCls.subjects = JSON.parse(JSON.stringify(BUSINESS_SUBJECTS));
          }
          const tradCls = activeClasses.find((c) => c.id === "2ang-trad");
          if (tradCls && !Array.isArray(tradCls.subjects)) {
            tradCls.subjects = [];
          }
          return;
        }
      }
    } catch (e) {
      console.warn("Could not read academic cache:", e);
    }
    activeClasses = JSON.parse(JSON.stringify(DEFAULT_ACADEMIC_CLASSES));
  }

  initClassesFromCache();

  function saveToLocalCache() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeClasses));
    } catch (e) {
      console.warn("Could not save academic cache:", e);
    }
  }

  function notifyListeners() {
    listeners.forEach((fn) => {
      try {
        fn(activeClasses);
      } catch (err) {
        console.error("Academic listener error:", err);
      }
    });
  }

  function onAcademicStructureChange(fn) {
    if (typeof fn === "function") {
      listeners.push(fn);
      // Call immediately with current active classes
      fn(activeClasses);
    }
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  }

  /**
   * Sync classes with Firestore document config/academic_structure
   */
  function bindFirestoreAcademicStructure(db) {
    if (!db) return;
    if (structureUnsubscribe) {
      try { structureUnsubscribe(); } catch (e) {}
      structureUnsubscribe = null;
    }

    try {
      const docRef = db.collection("config").doc("academic_structure");
      structureUnsubscribe = docRef.onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data();
          if (data && Array.isArray(data.classes) && data.classes.length > 0) {
            activeClasses = data.classes.map(c => {
              if (c.id === "2ang-aff" && (!Array.isArray(c.subjects) || c.subjects.length === 0)) {
                return { ...c, subjects: BUSINESS_SUBJECTS };
              }
              if (!Array.isArray(c.subjects)) {
                return { ...c, subjects: [] };
              }
              return c;
            });
            saveToLocalCache();
            notifyListeners();
            return;
          }
        }
      }, (err) => {
        console.warn("Firestore academic structure listener warning:", err);
      });
    } catch (err) {
      console.warn("Error binding academic structure:", err);
    }
  }

  async function refreshAcademicStructure(db) {
    if (!db) return activeClasses;
    try {
      const doc = await db.collection("config").doc("academic_structure").get();
      if (doc.exists) {
        const data = doc.data();
        if (data && Array.isArray(data.classes) && data.classes.length > 0) {
          activeClasses = data.classes.map(c => {
            if (c.id === "2ang-aff" && (!Array.isArray(c.subjects) || c.subjects.length === 0)) {
              return { ...c, subjects: BUSINESS_SUBJECTS };
            }
            if (!Array.isArray(c.subjects)) {
              return { ...c, subjects: [] };
            }
            return c;
          });
          saveToLocalCache();
          notifyListeners();
        }
      }
    } catch (e) {
      console.warn("Could not refresh academic structure:", e);
    }
    return activeClasses;
  }

  /**
   * Admin method: Save classes structure to Firestore
   */
  async function saveAcademicStructureToServer(db, classesArray) {
    if (!Array.isArray(classesArray) || classesArray.length === 0) {
      throw new Error("Invalid classes array");
    }
    activeClasses = JSON.parse(JSON.stringify(classesArray));
    saveToLocalCache();
    notifyListeners();

    if (db) {
      await db.collection("config").doc("academic_structure").set({
        classes: activeClasses,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
    return activeClasses;
  }

  // Get all active classes
  function getAllClasses() {
    return activeClasses;
  }

  // Find class by ID or Code
  function getClassById(classId) {
    if (!classId) return activeClasses[0] || null;
    const clean = String(classId).toLowerCase().trim();
    return activeClasses.find((c) => c.id.toLowerCase() === clean || c.code.toLowerCase() === clean) || activeClasses[0];
  }

  // Get groups for a specific class ID
  function getGroupsForClass(classId) {
    const cls = getClassById(classId);
    if (cls && Array.isArray(cls.groups) && cls.groups.length > 0) {
      return cls.groups;
    }
    return [
      { id: "grp1", name: "Group 1", code: (cls ? cls.code : "CLASS") + " 1" },
      { id: "grp2", name: "Group 2", code: (cls ? cls.code : "CLASS") + " 2" }
    ];
  }

  // Get a single group object for a specific class ID and group ID
  function getGroup(classId, groupId) {
    const groups = getGroupsForClass(classId);
    if (!groupId) return groups[0] || { id: "grp1", name: "Group 1", code: "GRP 1" };
    const cleanGroup = String(groupId).toLowerCase().trim();
    return groups.find((g) => g.id.toLowerCase() === cleanGroup) || groups[0] || { id: groupId, name: "Group 1", code: "GRP 1" };
  }

  // Normalize legacy profile (for backwards compatibility)
  function normalizeProfileAcademic(profile) {
    if (!profile) return { classId: "2ang-aff", className: "2nd Year Business English", group: "grp1", groupName: "Group 1", academicDetail: "2ANG-AFF 1" };

    let classId = profile.classId;
    let className = profile.className;
    let group = profile.group;
    let groupName = profile.groupName;
    const detail = String(profile.academicDetail || "").toLowerCase();

    // Detect class if not explicitly stored
    if (!classId) {
      if (detail.includes("trad") || detail.includes("trans")) {
        classId = "2ang-trad";
      } else {
        classId = "2ang-aff";
      }
    }

    const cls = getClassById(classId);
    className = className || (cls ? cls.name : "2nd Year Business English");

    // Detect group if not explicitly stored
    if (!group) {
      if (detail.includes("grp 2") || detail.includes("grp2") || detail.includes("group 2") || detail.includes("2ang-aff 2") || detail.includes("2ang-trad 2")) {
        group = "grp2";
      } else {
        group = "grp1";
      }
    }

    const groups = getGroupsForClass(classId);
    const matchedGroup = groups.find((g) => g.id === group);
    groupName = groupName || (matchedGroup ? matchedGroup.name : (group === "grp2" ? "Group 2" : "Group 1"));

    return {
      classId,
      className,
      group,
      groupName,
      academicDetail: profile.academicDetail || `${cls ? cls.code : "CLASS"} ${group === "grp2" ? "2" : "1"}`
    };
  }

  // Get subjects for a specific class ID
  function getSubjectsForClass(classId) {
    const cls = getClassById(classId);
    if (cls && Array.isArray(cls.subjects)) {
      return cls.subjects;
    }
    // Backward compatibility: 2ang-aff defaults to BUSINESS_SUBJECTS
    if (!cls || cls.id === "2ang-aff") {
      return BUSINESS_SUBJECTS;
    }
    return [];
  }

  // Find a subject by ID in a class or across all classes
  function findSubjectById(subjectId, classId) {
    if (!subjectId) return null;
    const cleanId = String(subjectId).toLowerCase().trim();
    if (classId) {
      const subs = getSubjectsForClass(classId);
      const found = subs.find((s) => s.id.toLowerCase() === cleanId || s.name.toLowerCase() === cleanId);
      if (found) return found;
    }
    // Search across all classes
    for (const cls of activeClasses) {
      if (Array.isArray(cls.subjects)) {
        const found = cls.subjects.find((s) => s.id.toLowerCase() === cleanId || s.name.toLowerCase() === cleanId);
        if (found) return found;
      }
    }
    // Fallback to BUSINESS_SUBJECTS
    return BUSINESS_SUBJECTS.find((s) => s.id.toLowerCase() === cleanId || s.name.toLowerCase() === cleanId) || null;
  }

  // Add subject to a class (Admin action)
  async function addSubjectToClass(db, classId, subjectObj) {
    const cls = getClassById(classId);
    if (!cls) throw new Error("Class not found: " + classId);
    if (!Array.isArray(cls.subjects)) cls.subjects = [];

    const baseId = (subjectObj.name || "subject").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    let sId = subjectObj.id || baseId;
    let count = 1;
    while (cls.subjects.some((s) => s.id === sId)) {
      sId = `${baseId}-${count++}`;
    }
    const newSubject = { ...subjectObj, id: sId };
    cls.subjects.push(newSubject);
    saveToLocalCache();
    notifyListeners();

    if (db) {
      await saveAcademicStructureToServer(db, activeClasses);
    }
    return newSubject;
  }

  // Update subject in a class (Admin action)
  async function updateSubjectInClass(db, classId, subjectId, updatedObj) {
    const cls = getClassById(classId);
    if (!cls) throw new Error("Class not found: " + classId);
    if (!Array.isArray(cls.subjects)) cls.subjects = [];

    const idx = cls.subjects.findIndex((s) => s.id === subjectId);
    if (idx === -1) throw new Error("Subject not found: " + subjectId);

    cls.subjects[idx] = { ...cls.subjects[idx], ...updatedObj, id: subjectId };
    saveToLocalCache();
    notifyListeners();

    if (db) {
      await saveAcademicStructureToServer(db, activeClasses);
    }
    return cls.subjects[idx];
  }

  // Delete subject from a class (Admin action)
  async function deleteSubjectFromClass(db, classId, subjectId) {
    const cls = getClassById(classId);
    if (!cls) throw new Error("Class not found: " + classId);
    if (!Array.isArray(cls.subjects)) return;

    cls.subjects = cls.subjects.filter((s) => s.id !== subjectId);
    saveToLocalCache();
    notifyListeners();

    if (db) {
      await saveAcademicStructureToServer(db, activeClasses);
    }
  }

  const AcademicRegistry = {
    DEFAULT_CLASSES: DEFAULT_ACADEMIC_CLASSES,
    BUSINESS_SUBJECTS,
    getAllClasses,
    getClass: getClassById,
    getClassById,
    getGroupsForClass,
    getGroup,
    getSubjectsForClass,
    findSubjectById,
    addSubjectToClass,
    updateSubjectInClass,
    deleteSubjectFromClass,
    normalizeProfileAcademic,
    bindFirestoreAcademicStructure,
    refreshAcademicStructure,
    saveAcademicStructureToServer,
    onAcademicStructureChange
  };

  // Attach to window and export if module
  if (typeof window !== "undefined") {
    window.AcademicRegistry = AcademicRegistry;

    // Auto-connect when Firebase becomes available in the browser
    const attemptAutoBind = () => {
      if (typeof firebase !== "undefined" && firebase.apps && firebase.apps.length) {
        try {
          bindFirestoreAcademicStructure(firebase.firestore());
        } catch (e) {}
      }
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", attemptAutoBind);
    } else {
      attemptAutoBind();
    }
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = AcademicRegistry;
  }
})();

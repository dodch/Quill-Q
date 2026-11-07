/**
 * academic-config.js - Centralized Academic Classes & Groups Registry for Quill-Q
 * Handles dynamic classes, groups, and synchronization with Firestore config.
 */

(function () {
  "use strict";

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
      ]
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
      ]
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
            activeClasses = data.classes;
            saveToLocalCache();
            notifyListeners();
            return;
          }
        }
        // If doc doesn't exist yet, seed it once
        docRef.set({ classes: DEFAULT_ACADEMIC_CLASSES, updatedAt: new Date().toISOString() }, { merge: true })
          .catch((err) => console.warn("Could not auto-seed academic structure:", err));
      }, (err) => {
        console.warn("Firestore academic structure listener warning:", err);
      });
    } catch (err) {
      console.warn("Error binding academic structure:", err);
    }
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

  const AcademicRegistry = {
    DEFAULT_CLASSES: DEFAULT_ACADEMIC_CLASSES,
    getAllClasses,
    getClass: getClassById,
    getClassById,
    getGroupsForClass,
    getGroup,
    normalizeProfileAcademic,
    bindFirestoreAcademicStructure,
    saveAcademicStructureToServer,
    onAcademicStructureChange
  };

  // Attach to window and export if module
  if (typeof window !== "undefined") {
    window.AcademicRegistry = AcademicRegistry;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = AcademicRegistry;
  }
})();

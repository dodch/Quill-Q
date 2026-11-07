/**
 * profile-manager.js - Centralized Profile & Onboarding Controller for Quill-Q
 * Manages user identity, multi-class onboarding, teacher approvals, and profile settings.
 */

(function () {
  "use strict";

  const SUPER_ADMIN_EMAILS = ["dodchadam@gmail.com", "dotchadam@gmail.com"];
  const STORAGE_KEY = "quill_q_profile";

  let currentUser = null;
  let currentProfile = null;
  let profileListeners = [];

  function isSuperAdminUser(profile, user) {
    const userEmail = (user && user.email) ? user.email.toLowerCase().trim() : "";
    const profEmail = (profile && profile.email) ? profile.email.toLowerCase().trim() : "";
    if (SUPER_ADMIN_EMAILS.includes(userEmail) || SUPER_ADMIN_EMAILS.includes(profEmail)) return true;
    if (profile && profile.role === "admin") return true;
    return false;
  }

  function isTeacherUser(profile) {
    return profile && profile.role === "teacher";
  }

  function isStudentUser(profile) {
    return profile && (profile.role === "student" || (!profile.role && !isSuperAdminUser(profile)));
  }

  function getCurrentProfile() {
    if (!currentProfile) {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) currentProfile = JSON.parse(cached);
      } catch (e) {}
    }
    return currentProfile;
  }

  function setCurrentProfile(profile) {
    currentProfile = profile;
    try {
      if (profile) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {}
    notifyProfileListeners(currentProfile);
  }

  function onProfileChange(fn) {
    if (typeof fn === "function") {
      profileListeners.push(fn);
      if (currentProfile) fn(currentProfile);
    }
    return () => {
      profileListeners = profileListeners.filter((l) => l !== fn);
    };
  }

  function notifyProfileListeners(prof) {
    profileListeners.forEach((fn) => {
      try { fn(prof); } catch (e) { console.error("Profile listener error:", e); }
    });
  }

  /**
   * Populate Onboarding Class and Group dropdowns dynamically
   */
  function populateOnboardingAcademicSelectors() {
    const classSelect = document.getElementById("onboarding-class-select");
    const groupSelect = document.getElementById("onboarding-group-select");
    const teacherChipsContainer = document.getElementById("onboarding-teacher-classes-chips");
    const classes = window.AcademicRegistry ? window.AcademicRegistry.getAllClasses() : [];

    // Populate Student Class Dropdown
    if (classSelect) {
      const prevVal = classSelect.value;
      classSelect.innerHTML = `<option value="" disabled ${!prevVal ? "selected" : ""}>Select your class</option>` +
        classes.map((c) => `<option value="${c.id}" ${prevVal === c.id ? "selected" : ""}>${c.name} (${c.code})</option>`).join("");

      if (!classSelect.value && classes.length > 0) {
        classSelect.value = classes[0].id;
      }

      // Sync Groups when class changes
      function syncGroups() {
        if (!groupSelect) return;
        const selectedClassId = classSelect.value || (classes[0] ? classes[0].id : "2ang-aff");
        const groups = window.AcademicRegistry ? window.AcademicRegistry.getGroupsForClass(selectedClassId) : [];
        const prevGroup = groupSelect.value;

        groupSelect.innerHTML = `<option value="" disabled ${!prevGroup ? "selected" : ""}>Select your group</option>` +
          groups.map((g) => `<option value="${g.id}" ${prevGroup === g.id ? "selected" : ""}>${g.name} (${g.code})</option>`).join("");

        if (!groupSelect.value && groups.length > 0) {
          groupSelect.value = groups[0].id;
        }
      }

      if (!classSelect.dataset.bound) {
        classSelect.dataset.bound = "true";
        classSelect.addEventListener("change", syncGroups);
      }
      syncGroups();
    }

    // Populate Teacher Classes Multi-Select Chips
    if (teacherChipsContainer) {
      teacherChipsContainer.innerHTML = classes.map((c) => {
        return `
          <button type="button" class="teacher-class-chip selected" data-class-id="${c.id}" style="
            display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px;
            background: #fdfaf3; border: 2px solid #1a1816; border-radius: 12px;
            cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13.5px;
            font-weight: 700; color: #1a1816; box-shadow: 2px 3px 0px #1a1816;
            transition: all 0.15s ease; margin: 4px;
          ">
            <span class="chip-check-icon" style="color: #15803d; font-weight: 900;">✓</span>
            <span>${c.shortName || c.name}</span>
            <span style="font-size: 11px; color: #72685d; font-weight: 600;">(${c.code})</span>
          </button>
        `;
      }).join("");

      // Bind click toggles
      const chips = teacherChipsContainer.querySelectorAll(".teacher-class-chip");
      chips.forEach((chip) => {
        chip.addEventListener("click", () => {
          chip.classList.toggle("selected");
          const isSelected = chip.classList.contains("selected");
          chip.style.background = isSelected ? "#fdfaf3" : "#f1ece1";
          chip.style.opacity = isSelected ? "1" : "0.65";
          const check = chip.querySelector(".chip-check-icon");
          if (check) check.textContent = isSelected ? "✓" : "○";
        });
      });
    }
  }

  /**
   * Get selected classes for teacher from onboarding chips
   */
  function getSelectedTeacherClasses() {
    const container = document.getElementById("onboarding-teacher-classes-chips");
    if (!container) return ["2ang-aff", "2ang-trad"];
    const selectedChips = container.querySelectorAll(".teacher-class-chip.selected");
    const classIds = [];
    selectedChips.forEach((chip) => {
      const id = chip.dataset.classId;
      if (id) classIds.push(id);
    });
    // Fallback if teacher unselected everything
    if (classIds.length === 0 && window.AcademicRegistry) {
      const all = window.AcademicRegistry.getAllClasses();
      return all.map((c) => c.id);
    }
    return classIds;
  }

  /**
   * Helper to check if a teacher teaches a specific class
   */
  function teacherTeachesClass(teacherProfile, classId) {
    if (!teacherProfile || !classId) return false;
    if (isSuperAdminUser(teacherProfile)) return true;
    if (teacherProfile.role !== "teacher") return false;
    const teaching = teacherProfile.teachingClasses || [];
    return teaching.includes(classId) || teaching.length === 0;
  }

  /**
   * Teacher Student Approvals: Fetch pending students for classes taught by this teacher
   */
  async function fetchTeacherPendingStudents(db, teacherProfile) {
    if (!db || !teacherProfile) return [];
    const isSuperAdmin = isSuperAdminUser(teacherProfile);
    const teachingClasses = teacherProfile.teachingClasses || [];

    try {
      const snapshot = await db.collection("users")
        .where("role", "==", "student")
        .where("status", "==", "pending")
        .get();

      const pending = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;

        // Normalize student class
        const norm = window.AcademicRegistry ? window.AcademicRegistry.normalizeProfileAcademic(data) : { classId: "2ang-aff" };
        data.classId = data.classId || norm.classId;
        data.group = data.group || norm.group;
        data.academicDetail = data.academicDetail || norm.academicDetail;

        // If Super Admin, sees all pending students. If Teacher, only sees students in their teaching classes.
        if (isSuperAdmin || teachingClasses.includes(data.classId) || teachingClasses.length === 0) {
          pending.push(data);
        }
      });

      return pending;
    } catch (err) {
      console.warn("Error fetching teacher pending students:", err);
      return [];
    }
  }

  /**
   * Teacher Student Approvals: Fetch enrolled/approved students for classes taught by this teacher
   */
  async function fetchTeacherEnrolledStudents(db, teacherProfile) {
    if (!db || !teacherProfile) return [];
    const isSuperAdmin = isSuperAdminUser(teacherProfile);
    const teachingClasses = teacherProfile.teachingClasses || [];

    try {
      const snapshot = await db.collection("users")
        .where("role", "==", "student")
        .where("status", "==", "approved")
        .get();

      const enrolled = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;

        const norm = window.AcademicRegistry ? window.AcademicRegistry.normalizeProfileAcademic(data) : { classId: "2ang-aff" };
        data.classId = data.classId || norm.classId;
        data.group = data.group || norm.group;
        data.academicDetail = data.academicDetail || norm.academicDetail;

        if (isSuperAdmin || teachingClasses.includes(data.classId) || teachingClasses.length === 0) {
          enrolled.push(data);
        }
      });

      return enrolled;
    } catch (err) {
      console.warn("Error fetching teacher enrolled students:", err);
      return [];
    }
  }

  /**
   * Update teacher's assigned classes
   */
  async function updateTeacherTeachingClasses(db, teacherId, classIds, subject) {
    if (!db || !teacherId) throw new Error("Missing parameters");
    const count = classIds ? classIds.length : 0;
    const academicDetail = `${subject || "Teaching Faculty"} • ${count} ${count === 1 ? "Class" : "Classes"}`;
    const updateData = {
      teachingClasses: classIds || [],
      teachingSubjects: subject ? [subject] : ["Teaching Faculty"],
      academicDetail: academicDetail,
      updatedAt: new Date().toISOString()
    };
    await db.collection("users").doc(teacherId).update(updateData);

    if (currentProfile && currentProfile.uid === teacherId) {
      Object.assign(currentProfile, updateData);
      setCurrentProfile(currentProfile);
    }
    return updateData;
  }

  /**
   * Approve a student
   */
  async function approveStudent(db, studentId, approverProfile) {
    if (!db || !studentId) throw new Error("Missing parameters");
    const updateData = {
      status: "approved",
      approvedBy: approverProfile ? approverProfile.uid : "admin",
      approvedByName: approverProfile ? approverProfile.displayName : "Faculty",
      approvedAt: new Date().toISOString()
    };
    await db.collection("users").doc(studentId).update(updateData);
    return updateData;
  }

  /**
   * Decline a student
   */
  async function declineStudent(db, studentId, approverProfile) {
    if (!db || !studentId) throw new Error("Missing parameters");
    const updateData = {
      status: "declined",
      declinedBy: approverProfile ? approverProfile.uid : "admin",
      declinedAt: new Date().toISOString()
    };
    await db.collection("users").doc(studentId).update(updateData);
    return updateData;
  }

  /**
   * Reassign a student to a different class / group
   */
  async function reassignStudentClassGroup(db, studentId, classId, groupId) {
    if (!db || !studentId) throw new Error("Missing parameters");
    const cls = window.AcademicRegistry ? window.AcademicRegistry.getClassById(classId) : null;
    const groups = window.AcademicRegistry ? window.AcademicRegistry.getGroupsForClass(classId) : [];
    const grp = groups.find((g) => g.id === groupId);

    const updateData = {
      classId: classId,
      className: cls ? cls.name : "Class",
      group: groupId,
      groupName: grp ? grp.name : (groupId === "grp2" ? "Group 2" : "Group 1"),
      academicDetail: `${cls ? cls.code : "CLASS"} ${grp ? grp.name : groupId}`,
      updatedAt: new Date().toISOString()
    };

    await db.collection("users").doc(studentId).update(updateData);
    return updateData;
  }

  const ProfileManager = {
    isSuperAdminUser,
    isTeacherUser,
    isStudentUser,
    getCurrentProfile,
    setCurrentProfile,
    onProfileChange,
    populateOnboardingAcademicSelectors,
    getSelectedTeacherClasses,
    teacherTeachesClass,
    fetchTeacherPendingStudents,
    fetchTeacherEnrolledStudents,
    updateTeacherTeachingClasses,
    approveStudent,
    declineStudent,
    reassignStudentClassGroup
  };

  if (typeof window !== "undefined") {
    window.ProfileManager = ProfileManager;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = ProfileManager;
  }
})();

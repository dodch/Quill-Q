/**
 * custom-dialog.js - Shared Custom Popup (Alert & Confirm Dialogs) for Quill-Q
 * Provides bespoke hand-drawn modals matching Quill-Q design system across all pages.
 */

(function () {
  let dialogResolveFn = null;

  function ensureModalInDOM() {
    let modal = document.getElementById("custom-dialog-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.className = "task-modal-backdrop view-hidden";
      modal.id = "custom-dialog-modal";
      modal.style.zIndex = "99999";
      modal.innerHTML = `
        <div class="task-modal-card custom-dialog-card" role="alertdialog" aria-modal="true">
          <div class="custom-dialog-body">
            <div class="custom-dialog-icon" id="custom-dialog-icon">ℹ️</div>
            <div class="custom-dialog-text-wrap">
              <h4 class="custom-dialog-title" id="custom-dialog-title">Notice</h4>
              <p class="custom-dialog-message" id="custom-dialog-message"></p>
            </div>
          </div>
          <div class="task-modal-actions custom-dialog-actions" id="custom-dialog-actions">
            <button type="button" class="task-btn-cancel" id="custom-dialog-cancel" style="display:none;">Cancel</button>
            <button type="button" class="task-btn-save" id="custom-dialog-confirm">
              <span id="custom-dialog-confirm-text">OK</span>
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      bindModalEvents(modal);
    }
    return modal;
  }

  function bindModalEvents(modal) {
    const cancelBtn = modal.querySelector("#custom-dialog-cancel");
    const confirmBtn = modal.querySelector("#custom-dialog-confirm");

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

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        if (dialogResolveFn) dialogResolveFn(false);
      }
    });

    // Keyboard support: Escape cancels, Enter confirms
    window.addEventListener("keydown", (e) => {
      if (modal.classList.contains("view-hidden")) return;

      if (e.key === "Escape") {
        e.preventDefault();
        if (dialogResolveFn) dialogResolveFn(false);
      } else if (e.key === "Enter" && !e.shiftKey) {
        // Prevent accidental triggers if typing in another input
        if (document.activeElement && document.activeElement.tagName === "INPUT") return;
        e.preventDefault();
        if (dialogResolveFn) dialogResolveFn(true);
      }
    });
  }

  function showCustomAlert(message, title = "Notice", iconHtml = '<i class="fi fi-rr-info"></i>') {
    return new Promise((resolve) => {
      const modal = ensureModalInDOM();
      const iconEl = modal.querySelector("#custom-dialog-icon");
      const titleEl = modal.querySelector("#custom-dialog-title");
      const msgEl = modal.querySelector("#custom-dialog-message");
      const cancelBtn = modal.querySelector("#custom-dialog-cancel");
      const confirmBtn = modal.querySelector("#custom-dialog-confirm");
      const confirmText = modal.querySelector("#custom-dialog-confirm-text");

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
      if (confirmBtn) confirmBtn.focus();
    });
  }

  function showCustomConfirm(
    message,
    title = "Are you sure?",
    iconHtml = '<i class="fi fi-rr-interrogation"></i>',
    confirmBtnLabel = "Confirm",
    cancelBtnLabel = "Cancel",
    isDanger = false
  ) {
    return new Promise((resolve) => {
      const modal = ensureModalInDOM();
      const iconEl = modal.querySelector("#custom-dialog-icon");
      const titleEl = modal.querySelector("#custom-dialog-title");
      const msgEl = modal.querySelector("#custom-dialog-message");
      const cancelBtn = modal.querySelector("#custom-dialog-cancel");
      const confirmBtn = modal.querySelector("#custom-dialog-confirm");
      const confirmText = modal.querySelector("#custom-dialog-confirm-text");

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
      if (confirmBtn) confirmBtn.focus();
    });
  }

  // Bind existing modal in DOM if loaded statically
  document.addEventListener("DOMContentLoaded", () => {
    const existing = document.getElementById("custom-dialog-modal");
    if (existing) {
      bindModalEvents(existing);
    }
  });

  // Intercept window.alert
  window.alert = function (msg) {
    return showCustomAlert(String(msg || ""), "Notice", '<i class="fi fi-rr-info"></i>');
  };

  // Expose to window
  window.showCustomAlert = showCustomAlert;
  window.showCustomConfirm = showCustomConfirm;
})();

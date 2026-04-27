/* ============================================================
   SIMBIOTIC · Theme toggle
   Default: LIGHT.
   El usuario solo cambia a dark con click manual; queda
   guardado en localStorage. No seguimos prefers-color-scheme
   del OS por decisión de marca.

   Anti-FOUC: hay un micro-script inline en <head> que aplica
   data-theme="dark" antes de renderizar si corresponde.
   Este archivo se ocupa del UI del botón.
   ============================================================ */

(function () {
  const STORAGE_KEY = "simbiotic-theme";
  const ROOT = document.documentElement;

  function getStored() {
    try { return localStorage.getItem(STORAGE_KEY); }
    catch (_) { return null; }
  }
  function setStored(value) {
    try {
      if (value === null) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {}
  }

  function currentTheme() {
    return ROOT.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function applyTheme(value) {
    if (value === "dark") {
      ROOT.setAttribute("data-theme", "dark");
    } else {
      ROOT.removeAttribute("data-theme");
    }
  }

  function bindToggle() {
    const buttons = document.querySelectorAll("[data-theme-toggle]");
    if (!buttons.length) return;

    function syncLabel(btn) {
      const t = currentTheme();
      btn.setAttribute("aria-label",
        t === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
    }

    buttons.forEach(btn => {
      syncLabel(btn);
      btn.addEventListener("click", () => {
        const next = currentTheme() === "dark" ? "light" : "dark";
        applyTheme(next);
        setStored(next);
        buttons.forEach(syncLabel);
      });
    });
  }

  // Public API for advanced use
  window.SIMBIOTIC_theme = {
    set: (v) => { applyTheme(v); setStored(v === "light" ? null : v); },
    get: () => getStored() || "light",
    current: currentTheme,
  };

  document.addEventListener("DOMContentLoaded", bindToggle);
})();

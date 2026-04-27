/* ============================================================
   SIMBIOTIC · Theme toggle
   Modo: Auto (sigue OS) + Override (guarda en localStorage).
   Para evitar FOUC, hay un micro-script en <head> que aplica
   el tema antes de renderizar; este archivo se ocupa del UI.
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

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function currentEffectiveTheme() {
    const explicit = ROOT.getAttribute("data-theme");
    if (explicit) return explicit;
    return systemPrefersDark() ? "dark" : "light";
  }

  function applyTheme(value) {
    if (value === "auto" || value === null) {
      ROOT.removeAttribute("data-theme");
    } else {
      ROOT.setAttribute("data-theme", value);
    }
  }

  // Toggle behavior: clicking flips the *effective* current theme
  // and persists the explicit choice to localStorage.
  function bindToggle() {
    const buttons = document.querySelectorAll("[data-theme-toggle]");
    if (!buttons.length) return;

    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const next = currentEffectiveTheme() === "dark" ? "light" : "dark";
        applyTheme(next);
        setStored(next);
        btn.setAttribute("aria-label",
          next === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
      });
    });
  }

  // If the user hasn't set an explicit preference, follow OS changes live.
  function watchSystem() {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (!getStored()) applyTheme("auto");
    };
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else if (mq.addListener) mq.addListener(handler);  // legacy Safari
  }

  // Public API for advanced use (e.g. settings page)
  window.SIMBIOTIC_theme = {
    set: (v) => { applyTheme(v); setStored(v === "auto" ? null : v); },
    get: () => getStored() || "auto",
    effective: currentEffectiveTheme,
  };

  document.addEventListener("DOMContentLoaded", () => {
    bindToggle();
    watchSystem();
  });
})();

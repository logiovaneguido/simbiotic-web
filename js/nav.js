/* ============================================================
   SIMBIOTIC · Nav (mobile drawer + mega-menu)
   - Desktop: hover abre mega-menu (con intent-delay anti-flicker)
   - Mobile/keyboard: click abre/cierra acordeón
   - Escape cierra todo, outside-click cierra todo
   - ARIA: aria-expanded en triggers, role=region en panels
   ============================================================ */

(function () {
  const HOVER_INTENT_OPEN_MS  = 80;   // pequeño delay para no abrir si solo se cruza
  const HOVER_INTENT_CLOSE_MS = 200;  // delay para cerrar = "puente" hacia el panel

  document.addEventListener("DOMContentLoaded", () => {
    const nav  = document.querySelector(".nav");
    if (!nav) return;

    const navToggle = nav.querySelector(".nav-toggle");

    // ----- Mobile drawer toggle -----
    if (navToggle) {
      navToggle.addEventListener("click", () => {
        const open = !nav.classList.contains("is-open");
        nav.classList.toggle("is-open", open);
        navToggle.classList.toggle("is-open", open);
        navToggle.setAttribute("aria-expanded", String(open));
        document.body.style.overflow = open ? "hidden" : "";
        if (!open) closeAllMega();
      });
    }

    // ----- Mega menus -----
    const megaItems = nav.querySelectorAll(".nav-item--mega");
    if (!megaItems.length) return;

    let openTimer = null;
    let closeTimer = null;
    let backdrop = document.querySelector(".nav-mega-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "nav-mega-backdrop";
      document.body.appendChild(backdrop);
    }

    function setBodyState() {
      const anyOpen = nav.querySelector(".nav-item--mega.is-open");
      document.body.classList.toggle("has-mega-open", !!anyOpen);
      nav.classList.toggle("has-mega-open", !!anyOpen);
    }

    function closeAllMega(except) {
      megaItems.forEach(item => {
        if (item === except) return;
        if (item.classList.contains("is-open")) {
          item.classList.remove("is-open");
          const btn = item.querySelector(".nav-link");
          if (btn) btn.setAttribute("aria-expanded", "false");
        }
      });
      setBodyState();
    }

    function openMega(item) {
      clearTimeout(closeTimer);
      closeAllMega(item);
      item.classList.add("is-open");
      const btn = item.querySelector(".nav-link");
      if (btn) btn.setAttribute("aria-expanded", "true");
      setBodyState();
    }

    function closeMega(item) {
      item.classList.remove("is-open");
      const btn = item.querySelector(".nav-link");
      if (btn) btn.setAttribute("aria-expanded", "false");
      setBodyState();
    }

    const isDesktop = () => window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 769px)").matches;

    megaItems.forEach(item => {
      const trigger = item.querySelector(".nav-link");
      if (!trigger) return;

      // Set initial ARIA
      trigger.setAttribute("aria-haspopup", "true");
      trigger.setAttribute("aria-expanded", "false");
      const panelId = "mega-" + Math.random().toString(36).slice(2, 8);
      const panel = item.querySelector(".nav-mega");
      if (panel) {
        panel.id = panelId;
        panel.setAttribute("role", "region");
        trigger.setAttribute("aria-controls", panelId);
      }

      // ---- Desktop: hover with intent ----
      item.addEventListener("mouseenter", () => {
        if (!isDesktop()) return;
        clearTimeout(closeTimer);
        clearTimeout(openTimer);
        openTimer = setTimeout(() => openMega(item), HOVER_INTENT_OPEN_MS);
      });
      item.addEventListener("mouseleave", () => {
        if (!isDesktop()) return;
        clearTimeout(openTimer);
        clearTimeout(closeTimer);
        closeTimer = setTimeout(() => closeMega(item), HOVER_INTENT_CLOSE_MS);
      });

      // ---- Click (mobile / keyboard) ----
      trigger.addEventListener("click", (e) => {
        // En desktop, el click también funciona como toggle (útil con keyboard).
        e.preventDefault();
        const isOpen = item.classList.contains("is-open");
        clearTimeout(openTimer); clearTimeout(closeTimer);
        if (isOpen) closeMega(item);
        else openMega(item);
      });

      // ---- Keyboard nav within mega ----
      trigger.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openMega(item);
          const firstLink = item.querySelector(".nav-mega a, .nav-mega button");
          if (firstLink) firstLink.focus();
        }
      });
    });

    // ---- Global: Escape closes all ----
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeAllMega();
        if (nav.classList.contains("is-open")) {
          nav.classList.remove("is-open");
          if (navToggle) {
            navToggle.classList.remove("is-open");
            navToggle.setAttribute("aria-expanded", "false");
          }
          document.body.style.overflow = "";
        }
      }
    });

    // ---- Outside click closes ----
    document.addEventListener("click", (e) => {
      if (!nav.contains(e.target)) closeAllMega();
    });

    // Backdrop click closes
    backdrop.addEventListener("click", () => closeAllMega());
  });
})();

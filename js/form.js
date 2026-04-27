/**
 * SIMBIOTIC · Contact form (progressive enhancement)
 *
 * - Sin JS: el form usa action="mailto:..." y abre el cliente de email.
 * - Con JS: intercepta submit, hace POST a /api/contact, muestra estado inline.
 * - Si /api/contact falla (no configurado, error de red, 503): cae al fallback
 *   mailto automáticamente con un mensaje al usuario.
 */

(function () {
  const ENDPOINT = "/api/contact";
  const FALLBACK_EMAIL = "hola@simbiotic.io";

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const status = document.getElementById("cf-status");
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Construir payload desde el form
      const fd = new FormData(form);
      const payload = {
        name:    (fd.get("name") || "").toString().trim(),
        email:   (fd.get("email") || "").toString().trim(),
        company: (fd.get("company") || "").toString().trim(),
        message: (fd.get("message") || "").toString().trim(),
        website: (fd.get("website") || "").toString(), // honeypot
      };

      // Honeypot client-side: si está lleno, no hacer nada
      // (un bot probablemente no entra acá, pero igual)
      if (payload.website) return;

      // Validación básica antes de pegarle al servidor
      if (!payload.name || !payload.email || !payload.message) {
        setStatus("Completá los campos requeridos.", "error");
        return;
      }

      setStatus("Enviando…", "loading");
      submitBtn.disabled = true;

      try {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        // 503 = backend no configurado todavía → fallback mailto
        if (res.status === 503) {
          fallbackToMailto(payload);
          return;
        }

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          setStatus(json.error || "No pudimos enviar el mensaje.", "error");
          submitBtn.disabled = false;
          return;
        }

        // ¡Éxito!
        setStatus("Recibido. Te respondemos en menos de 48 horas.", "success");
        form.reset();
        submitBtn.disabled = false;
      } catch (err) {
        // Error de red, 404 (function aún no deployed), etc → fallback
        fallbackToMailto(payload);
      }
    });

    function setStatus(msg, kind) {
      if (!status) return;
      status.textContent = msg;
      status.dataset.kind = kind || "";
    }

    function fallbackToMailto(payload) {
      setStatus(
        "Estamos terminando la integración del form. Te abrimos tu cliente de email…",
        "warning",
      );
      const subject = `Contacto desde simbiotic.io · ${payload.name}`;
      const body = [
        `Nombre:  ${payload.name}`,
        `Email:   ${payload.email}`,
        `Empresa: ${payload.company || "—"}`,
        ``,
        `Mensaje:`,
        payload.message,
      ].join("\n");
      const url = `mailto:${FALLBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setTimeout(() => { window.location.href = url; }, 1200);
    }
  });
})();

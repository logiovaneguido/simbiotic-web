/**
 * SIMBIOTIC · Contact form serverless function
 *
 * Endpoint: POST /api/contact
 * Runs on Cloudflare Pages Functions (free tier).
 *
 * Environment variables (configurar en Cloudflare Pages → Settings → Environment):
 *   RESEND_API_KEY  - clave de Resend (free tier: 100 emails/día)
 *   CONTACT_TO      - destinatario (default: hola@simbiotic.io)
 *   CONTACT_FROM    - sender verificado en Resend (default: hola@simbiotic.io)
 *
 * Si RESEND_API_KEY no está configurada, devuelve 503 y el frontend
 * cae al fallback mailto. Esto permite deploy gradual.
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  // 1. Parsear body
  let data;
  try {
    data = await request.json();
  } catch (_) {
    return jsonResp({ error: "Body inválido (esperaba JSON)." }, 400);
  }

  const { name, email, company, message, website } = data;

  // 2. Honeypot: si el bot llenó el campo oculto, devolver 200 silencioso
  //    (no le damos pistas de que detectamos el bot, pero tampoco enviamos email)
  if (website && website.trim() !== "") {
    return jsonResp({ ok: true });
  }

  // 3. Validación básica
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return jsonResp({ error: "Nombre requerido." }, 400);
  }
  if (!email || !isValidEmail(email)) {
    return jsonResp({ error: "Email inválido." }, 400);
  }
  if (!message || typeof message !== "string" || message.trim().length < 10) {
    return jsonResp({ error: "Contanos un poco más en el mensaje." }, 400);
  }
  if (message.length > 5000) {
    return jsonResp({ error: "Mensaje demasiado largo." }, 400);
  }

  // 4. Verificar configuración
  if (!env.RESEND_API_KEY) {
    // Modo no configurado: el frontend hará fallback a mailto.
    return jsonResp(
      { error: "Servicio de email no configurado todavía." },
      503,
    );
  }

  const to = env.CONTACT_TO || "hola@simbiotic.io";
  const from = env.CONTACT_FROM || "SIMBIOTIC <hola@simbiotic.io>";

  // 5. Armar el email
  const subject = `Nuevo contacto · ${name.trim()}${company ? ` (${company.trim()})` : ""}`;
  const textBody = [
    `Nuevo contacto desde simbiotic.io`,
    ``,
    `Nombre:   ${name.trim()}`,
    `Email:    ${email.trim()}`,
    `Empresa:  ${company?.trim() || "—"}`,
    ``,
    `Mensaje:`,
    message.trim(),
    ``,
    `---`,
    `IP: ${request.headers.get("CF-Connecting-IP") || "—"}`,
    `User-Agent: ${request.headers.get("User-Agent") || "—"}`,
  ].join("\n");

  // 6. Enviar via Resend API
  let resendResp;
  try {
    resendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: email.trim(),
        subject,
        text: textBody,
      }),
    });
  } catch (err) {
    return jsonResp({ error: "No pudimos contactar al servicio de email." }, 502);
  }

  if (!resendResp.ok) {
    const detail = await resendResp.text().catch(() => "");
    console.error("Resend error:", resendResp.status, detail);
    return jsonResp({ error: "Hubo un problema enviando el mensaje." }, 502);
  }

  // 7. ¡Éxito!
  return jsonResp({ ok: true });
}

// Bloqueamos otros métodos
export async function onRequest(context) {
  return new Response("Method not allowed", {
    status: 405,
    headers: { "Allow": "POST" },
  });
}

// ---------- helpers ----------
function jsonResp(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function isValidEmail(s) {
  if (typeof s !== "string") return false;
  if (s.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

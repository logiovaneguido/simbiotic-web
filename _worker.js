/**
 * SIMBIOTIC · Worker entry point
 *
 * Routes:
 *   POST /api/contact  →  functions/api/contact.js (envía email via Resend)
 *   *                  →  static asset (HTML, CSS, JS, imágenes desde el repo)
 *
 * Cloudflare auto-detecta el archivo `_worker.js` como entrypoint del Worker
 * cuando la opción `main` apunta acá en wrangler.jsonc.
 */

import * as contactHandlers from "./functions/api/contact.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ------- Rutas dinámicas -------
    if (url.pathname === "/api/contact") {
      if (request.method === "POST" && contactHandlers.onRequestPost) {
        return contactHandlers.onRequestPost({ request, env, ctx });
      }
      return new Response("Method not allowed", {
        status: 405,
        headers: { "Allow": "POST", "Content-Type": "text/plain" },
      });
    }

    // ------- Bloqueo explícito: no servir el código fuente del worker -------
    // (defensa profunda; aunque el binding ASSETS no debería exponerlo,
    //  por las dudas devolvemos 404 si alguien intenta acceder).
    if (
      url.pathname.startsWith("/functions/") ||
      url.pathname === "/_worker.js" ||
      url.pathname === "/wrangler.jsonc"
    ) {
      return new Response("Not Found", { status: 404 });
    }

    // ------- Fallback: servir asset estático -------
    return env.ASSETS.fetch(request);
  },
};

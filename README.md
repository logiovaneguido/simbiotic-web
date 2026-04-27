# SIMBIOTIC · simbiotic.io

Sitio web de **SIMBIOTIC** — consultora de AI & Martech con base en Buenos Aires.

## Estructura

```
simbiotic-web/
├── index.html                       # Home (hero, KPIs, servicios, proyectos, equipo, clientes, contacto)
├── design-system.html               # Página interna de validación de componentes (noindex)
├── casos/
│   ├── fravega-retail-media.html    # Caso 01
│   ├── fravega-media-mix.html       # Caso 02 (atribución con GEO experiments)
│   └── bierhaus-pagos.html          # Caso 03 (agente autónomo back-office)
├── css/
│   ├── tokens.css                   # Design tokens (colores, type, spacing, motion)
│   ├── base.css                     # Reset + tipografía + utilidades
│   ├── components.css               # Botones, cards, nav, mega-menu, form, etc.
│   └── main.css                     # Imports + layouts page-level
├── js/
│   ├── theme-toggle.js              # Light/dark toggle (default: light)
│   ├── nav.js                       # Mobile drawer + mega-menu con hover-intent
│   └── form.js                      # Form de contacto con progressive enhancement
├── functions/
│   └── api/
│       └── contact.js               # Cloudflare Pages Function (envía via Resend)
├── assets/
│   ├── img/
│   │   ├── simbiotic-logo-{blanco,negro}.{webp,png}
│   │   ├── team/                    # guido, francisco, manuel (.webp)
│   │   ├── clients/                 # 6 logos: fravega, fmf, banhi, kuati, trent, bierhaus
│   │   └── cases/                   # (vacío — placeholders gradient por ahora)
│   └── SIMBIOTIC_Brand_Kit_v2.pdf
└── public/
    ├── favicon-16.png
    └── pwa-512.png
```

## Stack

- **HTML5 + CSS3 + JS vanilla**, sin frameworks ni build tooling
- **Tipografía**: [Geist](https://vercel.com/font) + Geist Mono (Google Fonts CDN)
- **Hosting**: Cloudflare Pages (deploy automático desde GitHub)
- **Backend del form**: Cloudflare Pages Functions + [Resend](https://resend.com) para emails

## Theme system

- **Default: light mode** (off-white #fafaf7 con accent olive oscuro)
- **Dark mode opcional** via toggle (sun/moon icon en el nav)
- La preferencia se guarda en `localStorage` (key: `simbiotic-theme`)
- No se sigue `prefers-color-scheme` del OS por decisión de marca

## Desarrollo local

```bash
# Servir con Python (sin npm, sin nada)
python -m http.server 4321

# Visitar
http://localhost:4321/
http://localhost:4321/design-system.html  # Preview de componentes
```

> ⚠️ **Limitación local**: el form de contacto hace fetch a `/api/contact` que es una
> Cloudflare Pages Function. Localmente no corre (devuelve 404), por lo que el form
> cae al fallback `mailto:` automáticamente. Para probar la function localmente,
> instalar [`wrangler`](https://developers.cloudflare.com/workers/wrangler/) y correr
> `npx wrangler pages dev .`

## Deploy a Cloudflare Pages

1. Push del repo a GitHub
2. Cloudflare Pages → "Create project" → conectar repo
3. **Build settings**:
   - Build command: *(vacío)*
   - Build output directory: `/`
4. **Environment variables** (Settings → Environment variables):
   - `RESEND_API_KEY` — clave de Resend
   - `CONTACT_TO` — email destinatario (default: hola@simbiotic.io)
   - `CONTACT_FROM` — sender verificado en Resend (default: hola@simbiotic.io)
5. Apuntar dominio simbiotic.io → Pages project (Cloudflare Dashboard → Custom domains)

## Setup de Resend (form de contacto)

1. Crear cuenta gratis en [resend.com](https://resend.com)
2. Verificar dominio simbiotic.io agregando los registros DNS que indica Resend
   en Cloudflare Dashboard
3. Generar API key y guardarla como variable `RESEND_API_KEY` en Cloudflare Pages
4. Free tier: 100 emails/día, 3000/mes — más que suficiente para una landing

Si `RESEND_API_KEY` no está configurada, la function devuelve `503` y el frontend
cae automáticamente al fallback `mailto:`. Esto permite deploy gradual.

## Equipo

- **Guido Logiovane** — Director Product & Marketing
- **Francisco de Villalobos** — Director AI & Machine Learning
- **Manuel Massonneau** — Director Creativo

## Estado del proyecto

- ✅ Sistema de diseño + componentes (light/dark, mega-menu, form)
- ✅ Home con 8 secciones
- ✅ 3 páginas de casos individuales
- ✅ Form de contacto con backend + fallback mailto
- ⏳ SEO completo + favicons branded + analytics → Fase 6
- ⏳ Deploy a producción → Fase 7
- ⏳ Verificación end-to-end (Lighthouse) → Fase 8
- ⏳ Pendiente: métricas reales en casos Bierhaus y Frávega Atribución
- ⏳ Pendiente: SVG del logo (exportar desde `.ai` con Illustrator)

# KAIU Website (React + Vite)

A React recreation of the KAIU wood veneer marketing site, styled per the KAIU Design System (Gothic A1 + Inter, warm brown palette, pill buttons).

## Run it

```
npm install
cp .env.example .env      # then fill in CONTACT_SHEET_ENDPOINT
npm run dev
```

Then open the printed localhost URL. `npm run build` produces a static `dist/` folder plus the serverless functions in `api/`.

The dev server runs the `api/` functions itself (see the `kaiu-api-routes` plugin in `vite.config.js`), so the contact form works locally without the Vercel CLI.

## Structure

- `src/App.jsx` is the shell (header/footer) plus `react-router-dom` routes.
- `src/pages/` holds one `.jsx` and matching `.css` per page: `Home`, `About`, `Products`, `ProductDetail`, `Projects`, `ProjectDetail`, `Services`, `Contact`, `NotFound`.
- `src/data.js` holds the veneer products, Mercure Hotel project rooms, and services list. Edit copy and colors here.
- `src/components/` holds `Header`, `Footer`, `Component1` (nav link), `LanguageSwitch`, `RoomGallery`, `WhatsAppButton`, and `Shared.jsx` (Swatch, ProjectCard, woodgrain filter).
- `src/index.css` holds the design tokens (colors, type, spacing scale) plus shared classes (`.eyebrow`, `.pill-btn`, `.swatch`, `.project-card`, `.page-section`, etc.) reused across pages.
- `api/` holds the server-side functions. They run on Vercel in production and inside the dev server locally.
- `public/assets/` holds the logo, icons, and veneer imagery.

Every page and component owns its own CSS file, imported at the top of its `.jsx`. Only truly per-item dynamic values (a product's swatch color, a project's gradient) stay as inline `style`, since those come from data, not design.

## Spacing

All page padding, section rhythm, and grid gutters come from tokens defined once in `src/index.css`:

`--page-x`, `--page-top`, `--page-bottom`, `--section-y`, `--stack`, `--gap-grid`, `--gap-split`, `--header-y`, `--footer-y`, and the `--space-xs` through `--space-xl` scale.

Those tokens are redefined at two breakpoints (900px and 640px) and nowhere else, so a page CSS file never hardcodes a pixel gutter and never needs its own padding media query. Pages apply padding through the shared `.page-section`, `.page-section-head`, and `.page-section-body` classes.

## Routes

`/` `/about` `/products` `/products/:id` `/projects` `/projects/:id` `/services` `/contact`

Anything else renders the custom 404 page (`src/pages/NotFound.jsx`). `vercel.json` rewrites unknown paths to `index.html` so the router can handle them, while leaving `/api/*` alone.

## Contact form and secrets

The form posts to `/api/contact` on this same origin. That function validates the submission and forwards it to the Google Apps Script endpoint, which writes a row to the connected Google Sheet.

The Apps Script URL lives in the `CONTACT_SHEET_ENDPOINT` environment variable and is only ever read on the server, so it never ships in the browser bundle. Set it in the Vercel project settings (Production, Preview, and Development) and in a local `.env` for development. `ALLOWED_ORIGINS` is optional and defaults to the deployment's own origin.

Never commit a real `.env`. Only `.env.example` is tracked.

## Notes

- Products list paginates with a "Show More" button, and can be filtered by collection or searched.
- Clicking any product or project card opens a detail page; use the back link to return.
- Site copy is bilingual (EN/ID) via `src/LanguageContext.jsx`, toggled by the pill in the header.

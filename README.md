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
- `src/components/` holds `Header`, `Footer`, `Component1` (nav link), `LanguageSwitch`, `RoomViewer3D`, `WhatsAppButton`, and `Shared.jsx` (Swatch, ProjectCard, woodgrain filter).
- `src/index.css` holds the design tokens (colors, type, spacing scale) plus shared classes (`.eyebrow`, `.pill-btn`, `.swatch`, `.project-card`, `.page-section`, etc.) reused across pages.
- `scripts/build-room-model.mjs` turns the Blender export into the web-ready room model (`npm run model`).
- `scripts/build-veneer-textures.mjs` makes web copies of the hi-res sheets for the 3D room (`npm run textures`).
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

## 3D room viewer

The 3D room is the only room view on the site; the old per-veneer room photos are gone. A product page shows a **View in 3D Room** button once that product has a hi-res sheet (`hiResImage` in `src/data.js`). It opens one shared room (`public/models/room.glb`) and lays that sheet on the veneer wall, so every veneer uses a single model. Visitors can step between four fixed camera angles and a close-up; there is no free orbit.

### Adding a hi-res sheet

1. Put the full-sheet photo in `public/assets/hires/`, named exactly like the product's swatch in `public/assets/image/` (e.g. `ATHENS ALMOND OAK.png` for `ATHENS ALMOND OAK.webp`).
2. Add `hiResImage: '/assets/hires/ATHENS ALMOND OAK.png'` to that product in `src/data.js`. That file is what "Download Hi-Res" serves.
3. Run `npm run textures`. It writes a light WebP copy to `public/assets/hires-web/`, which the 3D room and the page preview use. Without it the site still works, just slower, because it falls back to the full sheet.

The viewer lives in `src/components/RoomViewer3D.jsx` and is lazy-loaded, so three.js and the model download only when someone clicks the button.

### Updating the room from Blender

1. Give the veneer wall faces their own material. Name it `KAIU_Veneer` (the script also accepts the current `Material.001`). The wall does not need to be a separate object; a separate material is enough.
2. Add your cameras. The first four, in name order, become the angles (name them `View 1` to `View 4`). Optionally add one with "close" in its name, e.g. `Closeup`, for the close-up; otherwise it is placed automatically in front of the wall.
3. File > Export > glTF 2.0 (.glb). Under **Include**, tick **Cameras**. Save to `models-src/kaiu new model.glb`.
4. Run `npm run model`. It writes `public/models/room.glb` and prints what it kept.

The build script (`scripts/build-room-model.mjs`) keeps only the room holding the wall and drops anything outside it, simplifies dense meshes, converts textures to 1K WebP, and records the wall's real size so veneer is laid at true scale. If the export has no cameras, the viewer falls back to four built-in angles around the wall.

`models-src/` is git-ignored: raw exports are far over GitHub's 100 MB file limit. Commit only the optimised `public/models/room.glb`.

Lighting is set in code, not taken from Blender. Each sheet is laid at true 2440 x 640 mm (short side 640 mm, long side by the photo's aspect ratio), sheets are mirrored where they meet like book-matched leaves, and the photo's uneven lighting is flattened so seams don't show. Tune `SHEET_SHORT_M` in the viewer to change the scale.

## Notes

- Products list paginates with a "Show More" button, and can be filtered by collection or searched.
- Clicking any product or project card opens a detail page; use the back link to return.
- Site copy is bilingual (EN/ID) via `src/LanguageContext.jsx`, toggled by the pill in the header.

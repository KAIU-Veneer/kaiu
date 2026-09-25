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
- `src/data.js` holds the veneer products, the projects, and the services list. Edit copy and colors here.
- `src/components/` holds `Header`, `Footer`, `Component1` (nav link), `LanguageSwitch`, `ProductVisual`, `RoomViews`, `WhatsAppButton`, and `Shared.jsx` (Swatch, ProjectCard, woodgrain filter).
- `src/index.css` holds the design tokens (colors, type, spacing scale) plus shared classes (`.eyebrow`, `.pill-btn`, `.swatch`, `.project-card`, `.page-section`, etc.) reused across pages.
- `scripts/build-room-renders.mjs` publishes the room renders you make by hand (`npm run rooms:renders`).
- `scripts/build-room-views.mjs` renders and composites room images for veneers you have not rendered (`npm run rooms`, `npm run rooms:render`), using the Blender scripts in `scripts/blender/`.
- `scripts/build-veneer-textures.mjs` makes web copies of the hi-res sheets for the page preview (`npm run textures`).
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

## Room views

A product page shows a **View in Room** button once that veneer has room images. They are Cycles renders of one shared room with the veneer on the feature wall, and visitors step between the camera angles, one image per view.

Images come from either of two places, and hand renders always win:

1. **Renders you make** (`npm run rooms:renders`). Put the PNGs in `photos-src/room-renders`, named `<VENEER NAME> <n>.png` (`ATHENS CIDER OAK 1.png`, `... 2.png`, ...). The numbers are the order the views appear; a veneer can have any number of them. The folder sits outside `public/` because the PNGs are hundreds of megabytes and only the WebPs belong in the site.
2. **Composites** (`npm run rooms`), for veneers with a hi-res sheet but no render of their own. Rendering every veneer from every camera would take hours, so the room is rendered once and each sheet is composited onto it:
   - **Render once** (`npm run rooms:render`, a few minutes on the GPU). Blender opens the room `.blend` in the background, never saving it, and renders every camera twice: once with the wall a dark grey and once a light grey. It also saves the texture coordinates the wall's Mapping node produces, and a mask of where the wall is. Because light scales with a surface's colour, the two renders give how much light each pixel receives per unit of wall colour: the sun streak, shadows, and the wall's bounce light.
   - **Composite per veneer** (a few seconds each). The sheet is sampled exactly as Blender's Image Texture node would, multiplied by that light, and passed through the `.blend`'s own colour settings (AgX, exposure). The only thing a composite can't reproduce is a veneer's colour being reflected in shiny objects; bounce light onto the floor and ceiling uses the sheet's average colour.

Both write `public/assets/room-views/<VENEER NAME>/<n>.webp` and then rebuild `src/roomViews.json`, which lists each veneer and how many views it has. A product finds its folder by its hi-res sheet name, or failing that by its own name in capitals. The viewer is `src/components/RoomViews.jsx`.

### Adding a veneer

1. Put the full-sheet photo in `public/assets/hires/`, named exactly like the product's swatch in `public/assets/image/` (e.g. `ATHENS ALMOND OAK.png` for `ATHENS ALMOND OAK.webp`).
2. Add `hiResImage: '/assets/hires/ATHENS ALMOND OAK.png'` to that product in `src/data.js`. That file is what "Download Hi-Res" serves.
3. Run `npm run textures` (the page's hi-res preview) and `npm run rooms` (the room images). Both only process what's new. If you rendered the veneer yourself, run `npm run rooms:renders` instead of `npm run rooms`.

### Changing the room

Edit the room `.blend` (cameras, lighting, furniture), then run `npm run rooms:render`. It re-renders the passes and re-composites every veneer that has no hand render.

- The veneer wall needs its own material (`Material.001`, or `KAIU_Veneer`) with an Image Texture fed through a Mapping node. Sheet placement and scale come from that Mapping node.
- Every camera in the file becomes a view. Set their order on the site with `VIEW_ORDER` in `scripts/build-room-views.mjs`.
- The `.blend` is read from `ROOM_BLEND` (default: two folders above this repo) and Blender from `BLENDER` (default: the Blender 5.2 install path). Render passes go to `models-src/room-passes/`, which is git-ignored.

## Notes

- Products list paginates with a "Show More" button, and can be filtered by collection or searched.
- Clicking any product or project card opens a detail page; use the back link to return.
- Site copy is bilingual (EN/ID) via `src/LanguageContext.jsx`, toggled by the pill in the header.

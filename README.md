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
- `scripts/build-image-sizes.mjs` writes the narrow display copies of the swatches and project photographs (`npm run images`). `src/imageSrc.js` is what the pages use to offer them.
- `scripts/build-sitemap.mjs` writes `public/sitemap.xml` and `public/robots.txt` from the catalogue (`npm run sitemap`, and the first half of `npm run build`).
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

### Giving a veneer its sheet and room images

Everything is keyed on the veneer's name in capitals. A file called
`BERLIN PEARL STRIPES.png` belongs to the product named `Berlin Pearl Stripes`,
and nothing matches up if the two disagree, so start by checking the name
against `src/data.js`.

Say you shot `BERLIN PEARL STRIPES` and rendered it from three cameras:

1. **The sheet.** Copy the plank photo into `public/assets/hires/`:

   ```
   cp "../image components/photo plank/BERLIN PEARL STRIPES.png" "public/assets/hires/"
   ```

2. **Point the product at it.** In `src/data.js`, find that product and add one
   line above its `image:` line:

   ```js
   hiResImage: '/assets/hires/BERLIN PEARL STRIPES.png',
   ```

   This is what "Download Hi-Res" serves and what the preview below the swatch
   shows. A product with no `hiResImage` simply has neither.

3. **The renders.** Copy them into `photos-src/room-renders/`, keeping the
   `<VENEER NAME> <n>.png` naming. The numbers are the order the views appear on
   the site, and a veneer can have as many or as few as you rendered:

   ```
   cp "../image components/new model/BERLIN PEARL STRIPES "*.png photos-src/room-renders/
   ```

4. **Build the images.** Each command only processes what is new:

   ```
   npm run textures
   npm run rooms:renders
   npm run images
   ```

   The first makes the web-sized copy of the sheet; the second converts the
   renders to WebP and rewrites `src/roomViews.json`, which is how a product page
   knows it has a **View in Room** button; the third writes the narrow copies of
   the swatch that the card grids display.

5. **Look at it.** `npm run dev`, then open the product page and click through
   the room views.

6. **Ship it.** Commit `src/data.js`, `src/roomViews.json` and the new files
   under `public/assets/`, then push. Vercel deploys from `main`.

Nothing here needs Blender. `npm run rooms` is only for veneers you have *not*
rendered: it composites the sheet onto the room instead, and it skips any veneer
that has renders of its own.

Source photographs stay out of `public/`, which is copied into the build as is.
Keep the originals in `photos-src/` (git-ignored) or in your own folders outside
the repo.

### Changing the room

Edit the room `.blend` (cameras, lighting, furniture), then run `npm run rooms:render`. It re-renders the passes and re-composites every veneer that has no hand render.

- The veneer wall needs its own material (`Material.001`, or `KAIU_Veneer`) with an Image Texture fed through a Mapping node. Sheet placement and scale come from that Mapping node.
- Every camera in the file becomes a view. Set their order on the site with `VIEW_ORDER` in `scripts/build-room-views.mjs`.
- The `.blend` is read from `ROOM_BLEND` (default: two folders above this repo) and Blender from `BLENDER` (default: the Blender 5.2 install path). Render passes go to `models-src/room-passes/`, which is git-ignored.

## Photographs on the page

Every photograph is stored once at full size and displayed through smaller
copies. A swatch original is about 2160px wide because that is what **Download
Hi-Res** hands over for a veneer with no separate hi-res sheet, and a project
photograph is 1600px so it still holds up opened large — but a card draws them
at two or three hundred pixels, so sending the original costs several times the
bytes it needs.

`npm run images` writes the narrow copies beside each original, in a folder
named for their width:

```
public/assets/image/w400/<NAME>.webp
public/assets/image/w800/<NAME>.webp
public/assets/projects/<project>/w800/<n>.webp
```

The pages never name those paths themselves. `src/imageSrc.js` builds the
`src` and `srcset` for each place a photograph appears, and the browser takes
the small copy on an ordinary screen and a larger one on a dense screen. So:

- **Adding a swatch or a project photograph.** Drop the full-size WebP in
  `public/assets/image/` or `public/assets/projects/<project>/`, run
  `npm run images`, and commit the originals together with the new `w400`/`w800`
  files. The command only touches what is new or changed.
- **Replacing one under a name that already exists.** Run `npm run images`
  again, and add a `?v=2` (then `?v=3`, ...) to that photograph's `src` in
  `src/data.js`. Anyone who has already seen the old one is holding it in their
  browser cache for a day, and the query is what tells them to fetch yours.

## What a search engine sees

Every route is served the same `index.html`, so without help all 225 pages
would carry one title and one description. `src/useDocumentMeta.js` gives each
page its own, and the wording lives in two places:

- the fixed pages take theirs from `meta` in `src/LanguageContext.jsx`, in both
  languages;
- a veneer and a project take theirs from their own record in `src/data.js`,
  through the helpers in `src/siteMeta.js`.

The hook also writes the canonical link, which names the one address a page
should be known by. `SITE_URL` in `src/siteMeta.js` is that address, and it has
to stay as the host that answers rather than the one that redirects — the apex
`kaiuveneer.co.id` sends a 308 to `www.kaiuveneer.co.id`, so `www` is what
belongs there. Change it in that one file and the sitemap follows.

`npm run sitemap` writes `public/sitemap.xml` and `public/robots.txt`, and
`npm run build` runs it first so a deploy cannot ship a sitemap that disagrees
with the catalogue. Both files are generated but committed, so `npm run dev`
serves them and a change to either shows up in review.

The sitemap earns its place here more than on most sites: the collections page
shows four veneers and keeps the rest behind a **Show more** button, and a
crawler does not press buttons. Four of 216 veneers are reachable by following
links; the sitemap is what tells a search engine about the other 212.

Still to do, in the order worth doing it:

1. Verify the domain in Google Search Console and submit the sitemap. Until
   that is connected, nothing here can be measured.
2. A Google Business Profile for the Pluit studio.
3. Open Graph and Twitter tags, so a link shared on WhatsApp or Instagram
   carries a picture and a title.
4. `/id/` URLs and `hreflang`. The language switch is state on one address, so
   only one version of each page can be indexed.

## Notes

- Products list paginates with a "Show More" button, and can be filtered by collection or searched.
- Clicking any product or project card opens a detail page; use the back link to return.
- Site copy is bilingual (EN/ID) via `src/LanguageContext.jsx`, toggled by the pill in the header.

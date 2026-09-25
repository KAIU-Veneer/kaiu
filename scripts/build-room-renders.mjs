/**
 * Publishes the room renders you make in Blender.
 *
 *   npm run rooms:renders            convert the ones that are new or changed
 *   npm run rooms:renders -- --force redo all of them
 *
 * Put the renders in photos-src/room-renders (set RENDERS to use another
 * folder), named after the veneer and the camera:
 *
 *   ATHENS CIDER OAK 1.png
 *   ATHENS CIDER OAK 2.png
 *   ATHENS CIDER OAK 3.png
 *
 * The numbers are the order the views appear on the site; a veneer can have
 * any number of them. They are converted to
 * public/assets/room-views/<VENEER>/<n>.webp and listed in src/roomViews.json,
 * which is what tells a product page it has room images.
 *
 * The folder sits outside public/ on purpose: the PNGs are hundreds of
 * megabytes and only the WebPs belong in the site.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { OUT, writeManifest } from './lib/roomViews.mjs';

const RENDERS = process.env.RENDERS || 'photos-src/room-renders';
const WEBP_QUALITY = 84;

const force = process.argv.includes('--force');
const mtime = (f) => (fs.existsSync(f) ? fs.statSync(f).mtimeMs : 0);

if (!fs.existsSync(RENDERS)) {
  console.error(`No renders folder at ${path.resolve(RENDERS)}. Set RENDERS.`);
  process.exit(1);
}

/* ---- 1. Group the files by veneer ---------------------------------- */
// "<VENEER NAME> <n>.png". The numbers need not be contiguous; they are
// renumbered from 1 in the order they sort.
const veneers = new Map();
for (const file of fs.readdirSync(RENDERS)) {
  const match = /^(.+?)\s+(\d+)\.(png|jpe?g|webp)$/i.exec(file);
  if (!match) continue;
  const [, name, index] = match;
  if (!veneers.has(name)) veneers.set(name, []);
  veneers.get(name).push({ file: path.join(RENDERS, file), index: Number(index) });
}
for (const views of veneers.values()) views.sort((a, b) => a.index - b.index);

console.log(`\nRoom renders: ${veneers.size} veneers in ${RENDERS}`);

/* ---- 2. Convert the ones that changed ------------------------------ */
let done = 0;
for (const [name, views] of [...veneers].sort(([a], [b]) => a.localeCompare(b))) {
  const dest = path.join(OUT, name);
  const stale =
    force ||
    views.some(({ file }, i) => mtime(path.join(dest, `${i + 1}.webp`)) < mtime(file)) ||
    fs.existsSync(path.join(dest, `${views.length + 1}.webp`));
  if (!stale) continue;

  fs.mkdirSync(dest, { recursive: true });
  for (const [i, view] of views.entries()) {
    await sharp(view.file).webp({ quality: WEBP_QUALITY, effort: 5 }).toFile(path.join(dest, `${i + 1}.webp`));
  }
  // Drop views left over from a previous run with more renders.
  for (let n = views.length + 1; fs.existsSync(path.join(dest, `${n}.webp`)); n += 1) {
    fs.rmSync(path.join(dest, `${n}.webp`));
  }
  console.log(`  ${name} (${views.length})`);
  done += 1;
}
console.log(`${done} veneer${done === 1 ? '' : 's'} converted`);

/* ---- 3. Manifest the site reads ------------------------------------ */
await writeManifest();

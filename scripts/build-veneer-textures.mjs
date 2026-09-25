/**
 * Makes web-weight copies of the hi-res veneer sheets for the 3D room.
 *
 *   npm run textures
 *
 * Reads  public/assets/hires/*.png|jpg|jpeg|webp   (full sheets, 3-10 MB; the
 *                                                  "Download Hi-Res" files)
 * Writes public/assets/hires-web/<same name>.webp  (long side 3072 px)
 *
 * Only files that are new or changed since their last conversion are
 * processed. Run it after adding hi-res sheets; if a sheet has no web copy
 * yet, the site falls back to the original, which works but loads slower.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { HIRES_DIR, HIRES_WEB_DIR } from '../src/hiRes.js';
import { mb } from './lib/format.mjs';

const SRC = path.join('public', HIRES_DIR);
const OUT = path.join('public', HIRES_WEB_DIR);
const LONG_SIDE = 3072; // ~1.25 px per mm across a 2440 mm sheet
const QUALITY = 82;

const isUpToDate = (src, out) => fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs;

async function convert(src, out) {
  await sharp(src)
    .rotate() // honour EXIF orientation
    .resize({ width: LONG_SIDE, height: LONG_SIDE, fit: 'inside', withoutEnlargement: true })
    .removeAlpha() // sheets are opaque; alpha only costs bytes
    .webp({ quality: QUALITY, effort: 5 })
    .toFile(out);
}

fs.mkdirSync(OUT, { recursive: true });

const sheets = fs.readdirSync(SRC).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
const stats = { converted: 0, skipped: 0, before: 0, after: 0 };

for (const name of sheets) {
  const src = path.join(SRC, name);
  const out = path.join(OUT, name.replace(/\.[^.]+$/, '.webp'));
  if (isUpToDate(src, out)) {
    stats.skipped++;
    continue;
  }
  await convert(src, out);
  stats.converted++;
  stats.before += fs.statSync(src).size;
  stats.after += fs.statSync(out).size;
}

console.log(`\nVeneer textures: ${stats.converted} converted, ${stats.skipped} already up to date`);
if (stats.converted) console.log(`  ${mb(stats.before)} MB of sheets -> ${mb(stats.after)} MB of web textures\n`);

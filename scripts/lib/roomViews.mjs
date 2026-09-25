/**
 * The manifest the site reads to know which veneers have room images and how
 * many views each one has. Both room-view builders write it through here, so
 * it always describes what is actually on disk.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { ROOM_VIEWS_DIR } from '../../src/roomViewPaths.js';

export const OUT = path.join('public', ROOM_VIEWS_DIR);
export const MANIFEST = 'src/roomViews.json';

/** Views present for one veneer: 1.webp, 2.webp, ... counted until a gap. */
export function viewCount(name) {
  let n = 0;
  while (fs.existsSync(path.join(OUT, name, `${n + 1}.webp`))) n += 1;
  return n;
}

/** Every veneer folder that holds at least one view, sorted by name. */
export function veneersOnDisk() {
  if (!fs.existsSync(OUT)) return [];
  return fs
    .readdirSync(OUT, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

/** Writes src/roomViews.json from the folders in public/assets/room-views. */
export async function writeManifest() {
  const veneers = {};
  let newest = 0;
  for (const name of veneersOnDisk()) {
    const views = viewCount(name);
    if (!views) continue;
    veneers[name] = views;
    for (let i = 1; i <= views; i += 1) {
      newest = Math.max(newest, fs.statSync(path.join(OUT, name, `${i}.webp`)).mtimeMs);
    }
  }
  const [first] = Object.keys(veneers);
  const size = first ? await sharp(path.join(OUT, first, '1.webp')).metadata() : { width: 0, height: 0 };

  const manifest = {
    // Changes whenever an image does, so browsers fetch the fresh ones.
    version: Math.round(newest).toString(36),
    size: [size.width, size.height],
    veneers,
  };
  fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  const total = Object.values(veneers).reduce((a, b) => a + b, 0);
  console.log(`Wrote ${MANIFEST}: ${Object.keys(veneers).length} veneers, ${total} images\n`);
}

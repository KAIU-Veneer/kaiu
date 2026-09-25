/**
 * Builds room images for veneers you have not rendered by hand, by putting
 * their hi-res sheet onto pre-rendered passes of the room.
 *
 *   npm run rooms            composite veneers that are new or changed
 *   npm run rooms -- --force redo all of them
 *   npm run rooms:render     re-render the room in Cycles first (several
 *                            minutes), then composite every veneer
 *
 * Veneers with renders in photos-src/room-renders are left alone; those are
 * published by build-room-renders.mjs, which always wins.
 *
 * Rendering reads the room .blend (ROOM_BLEND, default: two folders above the
 * repo) and writes passes to models-src/room-passes. Compositing needs those
 * passes. Both run through Blender; set BLENDER if it isn't at the default
 * Windows install path.
 *
 * Writes public/assets/room-views/<SHEET NAME>/<n>.webp and src/roomViews.json,
 * which tells the site which veneers have room images and in what order the
 * views appear.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';
import { PRODUCTS } from '../src/data.js';
import { sheetName } from '../src/roomViewPaths.js';
import { OUT, writeManifest } from './lib/roomViews.mjs';

const PASSES = 'models-src/room-passes';
const RENDERS = process.env.RENDERS || 'photos-src/room-renders';
const BLENDER = process.env.BLENDER || 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe';
const ROOM_BLEND = process.env.ROOM_BLEND || '../../kaiu new model.blend';
const WEBP_QUALITY = 84;

// Site order of the cameras, first to last. Anything not listed follows in
// render order.
const VIEW_ORDER = ['Camera', 'Camera.001', 'Camera.003', 'Camera.002'];

const render = process.argv.includes('--render');
const force = render || process.argv.includes('--force');
const mtime = (f) => (fs.existsSync(f) ? fs.statSync(f).mtimeMs : 0);

/** Runs Blender with the given arguments; exits with its errors if it fails. */
function blender(args) {
  const run = spawnSync(BLENDER, args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  const output = `${run.stdout || ''}${run.stderr || ''}`;
  const lines = output.split(/\r?\n/).filter((l) => /KAIU|Error|Traceback|line \d+/.test(l));
  if (run.status !== 0 || output.includes('Traceback')) {
    console.error(lines.join('\n') || run.error || output.slice(-2000));
    process.exit(1);
  }
  return lines;
}

/* ---- 1. Render passes (only with --render) ------------------------ */
const passesFile = path.join(PASSES, 'passes.json');

if (render) {
  if (!fs.existsSync(ROOM_BLEND)) {
    console.error(`Room .blend not found at ${path.resolve(ROOM_BLEND)}. Set ROOM_BLEND.`);
    process.exit(1);
  }
  console.log(`\nRendering room passes from ${path.resolve(ROOM_BLEND)}`);
  blender(['-b', path.resolve(ROOM_BLEND), '--python', path.resolve('scripts/blender/render-room-passes.py'), '--', '--out', path.resolve(PASSES)])
    .filter((l) => l.startsWith('KAIU rendered'))
    .forEach((l) => console.log(`  ${l.slice(5)}`));
}

if (!fs.existsSync(passesFile)) {
  console.error(`No render passes in ${PASSES}. Run "npm run rooms:render" first.`);
  process.exit(1);
}

/* ---- 2. Work out views and which veneers need compositing --------- */
const passes = JSON.parse(fs.readFileSync(passesFile, 'utf8'));
const rank = (name) => (VIEW_ORDER.includes(name) ? VIEW_ORDER.indexOf(name) : VIEW_ORDER.length);
const cameras = [...passes.cameras].sort((a, b) => rank(a.name) - rank(b.name));
const views = cameras.map((cam, i) => ({ camera: cam.name, file: `${i + 1}.webp` }));

// One job per distinct sheet; several products could share one. Veneers you
// rendered by hand win, so compositing never overwrites them (see
// build-room-renders.mjs).
const rendered = new Set(
  fs.existsSync(RENDERS)
    ? fs.readdirSync(RENDERS).map((f) => /^(.+?)\s+\d+\.\w+$/.exec(f)?.[1]).filter(Boolean)
    : [],
);
const sheets = new Map();
for (const p of PRODUCTS) {
  const name = p.hiResImage && sheetName(p.hiResImage);
  if (name && !rendered.has(name)) sheets.set(name, path.join('public', p.hiResImage));
}

const isStale = (name, sheet) => {
  const oldest = Math.min(...views.map((v) => mtime(path.join(OUT, name, v.file))));
  return force || oldest < mtime(sheet) || oldest < mtime(passesFile);
};
const jobs = [...sheets].filter(([name, sheet]) => isStale(name, sheet)).map(([name, sheet]) => ({ name, sheet: path.resolve(sheet) }));

console.log(`\nRoom views: ${sheets.size} veneers, ${jobs.length} to composite, ${views.length} views each`);

/* ---- 3. Composite and convert ------------------------------------- */
if (jobs.length) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kaiu-rooms-'));
  const jobsFile = path.join(tmp, 'jobs.json');
  fs.writeFileSync(jobsFile, JSON.stringify({ passes: path.resolve(PASSES), out: tmp, jobs }));

  blender(['-b', '--factory-startup', '--python', path.resolve('scripts/blender/composite-veneers.py'), '--', '--jobs', jobsFile]);

  for (const { name } of jobs) {
    const dest = path.join(OUT, name);
    fs.mkdirSync(dest, { recursive: true });
    for (const view of views) {
      await sharp(path.join(tmp, name, `${view.camera}.png`))
        .webp({ quality: WEBP_QUALITY, effort: 5 })
        .toFile(path.join(dest, view.file));
    }
    console.log(`  ${name}`);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
}

/* ---- 4. Manifest the site reads ----------------------------------- */
await writeManifest();

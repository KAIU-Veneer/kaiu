/**
 * Turns the Blender export into a web-ready room model.
 *
 *   npm run model
 *
 * Reads  models-src/kaiu new model.glb   (the raw Blender export, not in git)
 * Writes public/models/room.glb          (what the site loads)
 *
 * Re-run this whenever you re-export from Blender. What it does:
 *   1. Keeps only the room that holds the veneer wall. Anything whose centre
 *      sits outside that room (a duplicate room, stray imports far away) is
 *      dropped. Cameras are always kept.
 *   2. Renames the wall material to KAIU_Veneer, removes its baked texture
 *      (the site paints each product's veneer on at runtime), and rewrites
 *      the wall's UVs to span 0..1 across its width and height. The wall's
 *      real size in metres goes into the material's extras so the site can
 *      lay veneer sheets at true scale.
 *   3. Simplifies very dense meshes, shrinks textures to 1K WebP, and
 *      quantizes positions/normals. No Draco or Meshopt, so the browser
 *      needs no WebAssembly decoder.
 */
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO, getBounds } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, simplify, quantize, textureCompress } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
import { MODEL_URL, VENEER_MATERIAL, VENEER_FLAG } from '../src/components/room3d/contract.js';
import { fileMb } from './lib/format.mjs';

const SRC = process.argv[2] || 'models-src/kaiu new model.glb';
const OUT = path.join('public', MODEL_URL);

// The wall's material in Blender. The current export uses Material.001;
// renaming it to KAIU_Veneer in Blender works too.
const WALL_MATERIAL_NAMES = [VENEER_MATERIAL, 'Material.001'];

// How far outside the room an object's centre may sit and still be kept.
const ROOM_MARGIN_M = 0.5;

const log = (...a) => console.log('  ', ...a);

/* ------------------------------------------------------------------ */
/* Small vector helpers (plain [x, y, z] arrays)                         */
/* ------------------------------------------------------------------ */
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const normalize = (a) => { const l = Math.hypot(...a) || 1; return a.map((v) => v / l); };
const negate = (a) => a.map((v) => -v);
const sub = (a, b) => a.map((v, i) => v - b[i]);
const centerOf = ({ min, max }) => min.map((v, i) => (v + max[i]) / 2);

/* ------------------------------------------------------------------ */
/* 1. Find the wall and drop everything outside its room                 */
/* ------------------------------------------------------------------ */
function findWall(root) {
  const material = WALL_MATERIAL_NAMES
    .map((name) => root.listMaterials().find((m) => m.getName() === name))
    .find(Boolean);
  if (!material) {
    throw new Error(`No wall material found. Expected one named: ${WALL_MATERIAL_NAMES.join(' or ')}`);
  }
  const node = root.listNodes().find((n) => n.getMesh()?.listPrimitives().some((p) => p.getMaterial() === material));
  return { material, node };
}

const topAncestor = (node) => {
  let n = node;
  while (n.getParentNode()) n = n.getParentNode();
  return n;
};

const containsCamera = (node) => {
  let found = false;
  node.traverse((n) => { if (n.getCamera()) found = true; });
  return found;
};

/** Removes top-level objects centred outside the room. Returns how many. */
function dropObjectsOutside(scene, roomRoot, room) {
  const inside = (bounds) =>
    centerOf(bounds).every((v, i) => v >= room.min[i] - ROOM_MARGIN_M && v <= room.max[i] + ROOM_MARGIN_M);

  let dropped = 0;
  for (const node of scene.listChildren()) {
    if (node === roomRoot || containsCamera(node)) continue;
    const bounds = getBounds(node);
    if (!Number.isFinite(bounds.min[0]) || !inside(bounds)) {
      node.traverse((n) => n.dispose());
      dropped++;
    }
  }
  return dropped;
}

/* ------------------------------------------------------------------ */
/* 2. Normalise the veneer wall                                          */
/* ------------------------------------------------------------------ */
/**
 * Rewrites a wall primitive's UVs to span 0..1 across its width and height,
 * as seen from inside the room. Returns the wall's size in metres.
 */
function remapWallUVs(doc, prim, roomCenter) {
  const pos = prim.getAttribute('POSITION');
  const nrm = prim.getAttribute('NORMAL');
  const count = pos.getCount();
  const points = Array.from({ length: count }, (_, i) => pos.getElement(i, []));

  // Facing direction = average vertex normal, flipped if needed so it points
  // into the room. (Blender cube normals face outward; the room only looks
  // right from inside because its materials are double-sided.) Viewers look
  // against it, so "right" on the wall is forward x up: veneer stays unmirrored.
  const summed = Array.from({ length: count }, (_, i) => nrm.getElement(i, []))
    .reduce((acc, v) => acc.map((x, k) => x + v[k]), [0, 0, 0]);
  const up = [0, 1, 0];
  let facing = normalize([summed[0], 0, summed[2]]);
  const wallCenter = [0, 1, 2].map((k) => points.reduce((s, p) => s + p[k], 0) / count);
  if (dot(sub(roomCenter, wallCenter), facing) < 0) facing = negate(facing);
  const right = normalize(cross(negate(facing), up));

  const us = points.map((p) => dot(p, right));
  const vs = points.map((p) => dot(p, up));
  const u0 = Math.min(...us);
  const v0 = Math.min(...vs);
  const width = Math.max(...us) - u0;
  const height = Math.max(...vs) - v0;

  const uv = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    uv[i * 2] = (us[i] - u0) / width;
    uv[i * 2 + 1] = 1 - (vs[i] - v0) / height; // glTF UV origin is top-left
  }
  prim.setAttribute('TEXCOORD_0', doc.createAccessor().setType('VEC2').setArray(uv).setBuffer(pos.getBuffer()));
  return { width, height };
}

function normaliseWall(doc, { material, node }, room) {
  let size = { width: 0, height: 0 };
  for (const prim of node.getMesh().listPrimitives()) {
    if (prim.getMaterial() === material) size = remapWallUVs(doc, prim, centerOf(room));
  }

  material
    .setName(VENEER_MATERIAL)
    .setBaseColorTexture(null)
    .setBaseColorFactor([0.8, 0.68, 0.52, 1])
    .setMetallicFactor(0)
    .setRoughnessFactor(0.55)
    .setExtras({ [VENEER_FLAG]: true, widthM: +size.width.toFixed(4), heightM: +size.height.toFixed(4) });
  return size;
}

/* ------------------------------------------------------------------ */
/* 3. Slim it down                                                       */
/* ------------------------------------------------------------------ */
function slim(doc) {
  // keepAttributes: the wall's UVs look unused here (its texture arrives at
  // runtime), and prune() would otherwise strip them.
  const pruneOpts = { keepAttributes: true };
  return doc.transform(
    prune(pruneOpts),
    dedup(),
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.1, error: 0.001 }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 82 }),
    // UVs stay float: quantizing them can add a texture transform, which would
    // fight the veneer texture the site swaps in.
    quantize({ pattern: /^(POSITION|NORMAL)$/ }),
    prune(pruneOpts),
  );
}

/* ------------------------------------------------------------------ */
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
console.log(`\nReading ${SRC} (${fileMb(SRC)} MB)`);
const doc = await io.read(SRC);
const root = doc.getRoot();
const scene = root.getDefaultScene() || root.listScenes()[0];

const wall = findWall(root);
const roomRoot = topAncestor(wall.node);
const room = getBounds(roomRoot);
const dropped = dropObjectsOutside(scene, roomRoot, room);
log(`kept the room around "${wall.node.getName()}", dropped ${dropped} objects outside it`);

const { width, height } = normaliseWall(doc, wall, room);
log(`veneer wall: ${width.toFixed(2)} m wide x ${height.toFixed(2)} m tall`);

const cameras = root.listNodes().filter((n) => n.getCamera()).map((n) => n.getName());
log(cameras.length ? `cameras: ${cameras.join(', ')}` : 'cameras: none in this export (the site will use its built-in angles)');

await slim(doc);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
await io.write(OUT, doc);
console.log(`\nWrote ${OUT} (${fileMb(OUT)} MB)\n`);

import * as THREE from 'three';

// Each hi-res photo is one standard 2440 x 640 mm sheet. Its short side is
// laid at 640 mm and the long side follows the photo's aspect ratio, so the
// grain is never stretched and sheets stay the way they were photographed
// (landscape sheets run across the wall, portrait ones stand up). Sheets are
// mirrored where they meet, the way veneer leaves are book-matched on site.
export const SHEET_SHORT_M = 0.64;

const EDGE_TRIM = 0.025; // sheet photos carry bright/dark strips at the edges

/** Loads an image, trying fallbackUrl if the first one fails. */
export function loadImage(url, fallbackUrl) {
  const loader = new THREE.ImageLoader();
  return loader.loadAsync(url).catch((err) => {
    if (!fallbackUrl) throw err;
    return loader.loadAsync(fallbackUrl);
  });
}

/**
 * Sheet photos are lit unevenly and have edge artefacts. Tiled as-is, every
 * seam shows. This trims the edges and divides out the photo's low-frequency
 * lighting, so mirrored sheets meet at matching brightness and read as one
 * continuous surface. Grain detail and overall colour are untouched.
 */
function flattenedSheet(img, maxSize) {
  const sx = Math.round(img.width * EDGE_TRIM);
  const sy = Math.round(img.height * EDGE_TRIM);
  const sw = img.width - sx * 2;
  const sh = img.height - sy * 2;
  const scale = Math.min(1, maxSize / Math.max(sw, sh));
  const w = Math.round(sw * scale);
  const h = Math.round(sh * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

  // Lighting field: shrink to a few pixels, then blow back up smoothly.
  const tiny = document.createElement('canvas');
  tiny.width = 6;
  tiny.height = Math.max(2, Math.round((6 * h) / w));
  const tctx = tiny.getContext('2d');
  tctx.imageSmoothingQuality = 'high';
  tctx.drawImage(canvas, 0, 0, tiny.width, tiny.height);
  const blur = document.createElement('canvas');
  blur.width = w;
  blur.height = h;
  const bctx = blur.getContext('2d', { willReadFrequently: true });
  bctx.imageSmoothingQuality = 'high';
  bctx.drawImage(tiny, 0, 0, w, h);

  const px = ctx.getImageData(0, 0, w, h);
  const low = bctx.getImageData(0, 0, w, h).data;
  const d = px.data;
  const lum = (a, i) => 0.2126 * a[i] + 0.7152 * a[i + 1] + 0.0722 * a[i + 2];
  let mean = 0;
  for (let i = 0; i < low.length; i += 4) mean += lum(low, i);
  mean /= low.length / 4;
  for (let i = 0; i < d.length; i += 4) {
    const k = mean / Math.max(1, lum(low, i));
    d[i] = Math.min(255, d[i] * k);
    d[i + 1] = Math.min(255, d[i + 1] * k);
    d[i + 2] = Math.min(255, d[i + 2] * k);
  }
  ctx.putImageData(px, 0, 0);
  return canvas;
}

/**
 * A wall-ready texture from a sheet photo: flattened, book-matched, and
 * repeated so each sheet covers 2440 x 640 mm of a wall `wall.widthM` by
 * `wall.heightM`.
 */
export function createVeneerTexture(img, { wall, maxSize, anisotropy }) {
  const tex = new THREE.CanvasTexture(flattenedSheet(img, maxSize));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = false; // matches glTF UV orientation
  tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping;
  tex.anisotropy = anisotropy;

  const aspect = img.width / img.height;
  const sheetW = aspect >= 1 ? SHEET_SHORT_M * aspect : SHEET_SHORT_M;
  const sheetH = aspect >= 1 ? SHEET_SHORT_M : SHEET_SHORT_M / aspect;
  tex.repeat.set(wall.widthM / sheetW, wall.heightM / sheetH);
  return tex;
}

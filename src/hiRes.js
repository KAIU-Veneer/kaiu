/**
 * Hi-res veneer sheets live in HIRES_DIR (the "Download Hi-Res" files).
 * `npm run textures` writes a light WebP copy of each into HIRES_WEB_DIR,
 * under the same name, for the 3D room and the on-page preview.
 * Plain values only, so scripts/build-veneer-textures.mjs can import this too.
 */
export const HIRES_DIR = '/assets/hires/';
export const HIRES_WEB_DIR = '/assets/hires-web/';

/** '/assets/hires/NAME.png' -> '/assets/hires-web/NAME.webp' */
export const webSheetUrl = (hiResUrl) =>
  hiResUrl.replace(HIRES_DIR, HIRES_WEB_DIR).replace(/\.[^./]+$/, '.webp');

/** <img onError>: if the web copy hasn't been generated yet, show the original. */
export const fallBackTo = (originalUrl) => (e) => {
  const img = e.currentTarget;
  if (img.src !== new URL(originalUrl, window.location.href).href) img.src = originalUrl;
};

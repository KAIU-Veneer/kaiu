/**
 * Rendered room images live in ROOM_VIEWS_DIR/<sheet name>/<n>.webp, published
 * by `npm run rooms:renders` from the Blender renders (or by `npm run rooms`
 * for veneers with no render of their own). Plain values only, so the Node
 * build scripts can import this too.
 */
export const ROOM_VIEWS_DIR = '/assets/room-views/';

/** '/assets/hires/ATHENS ALMOND OAK.png' -> 'ATHENS ALMOND OAK' */
export const sheetName = (hiResUrl) => decodeURIComponent(hiResUrl.split('/').pop()).replace(/\.[^.]+$/, '');

export const roomViewUrl = (name, view, version) => `${ROOM_VIEWS_DIR}${name}/${view}.webp?v=${version}`;

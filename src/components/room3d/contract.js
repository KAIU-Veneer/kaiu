/**
 * What scripts/build-room-model.mjs writes and the 3D viewer reads.
 * Plain values only, so the Node build script can import this file too.
 */

/** Where the site loads the optimised room from (under public/). */
export const MODEL_URL = '/models/room.glb';

/** Material name the build script gives the veneer wall. */
export const VENEER_MATERIAL = 'KAIU_Veneer';

/**
 * Keys in the wall material's glTF extras:
 *   { [VENEER_FLAG]: true, widthM, heightM }   wall size in metres
 */
export const VENEER_FLAG = 'kaiuVeneer';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MODEL_URL, VENEER_FLAG, VENEER_MATERIAL } from './contract.js';

let modelPromise = null;
const progressListeners = new Set();

/**
 * Downloads the shared room once. Every later call, including from other
 * product pages, gets the same promise. A failed download is forgotten so
 * the next attempt retries.
 */
export function preloadRoomModel() {
  if (!modelPromise) {
    modelPromise = new GLTFLoader()
      .loadAsync(MODEL_URL, (e) => {
        if (e.total) progressListeners.forEach((fn) => fn(e.loaded / e.total));
      })
      .catch((err) => {
        modelPromise = null;
        throw err;
      });
  }
  return modelPromise;
}

/** Download progress (0..1) while the room is loading. Returns an unsubscribe. */
export function onModelProgress(fn) {
  progressListeners.add(fn);
  return () => progressListeners.delete(fn);
}

/** The mesh carrying the veneer wall material, as tagged by the build script. */
export function findVeneerWall(root) {
  let wall = null;
  root.traverse((o) => {
    if (o.isMesh && (o.material?.userData?.[VENEER_FLAG] || o.material?.name === VENEER_MATERIAL)) wall = o;
  });
  if (!wall) throw new Error(`Room model has no "${VENEER_MATERIAL}" wall`);
  return wall;
}

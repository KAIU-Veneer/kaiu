import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { preloadRoomModel, onModelProgress, findVeneerWall } from './model.js';
import { buildViews, toVFov, wallFrame, ROOM_FOV } from './views.js';
import { createVeneerTexture, loadImage } from './veneerTexture.js';

const TWEEN_MS = 900;
const easeInOutCubic = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

/**
 * Renders the shared room into `host` and keeps it in sync with what the UI
 * asks for. Rendering is on demand (load, resize, veneer swap, camera move),
 * so nothing runs while the view is still.
 *
 * Throws if WebGL is unavailable.
 *
 *   const room = createRoomScene(host, { onProgress, onReady, onError });
 *   room.setVeneer(url, fallbackUrl);      // latest call wins
 *   room.show({ angle: 2, closeUp: false });
 *   room.dispose();
 *
 * onReady({ angleCount }) fires once the model is in and the first view drawn.
 * Calls made before that are remembered and applied then.
 */
export function createRoomScene(host, { onProgress, onReady, onError } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.NeutralToneMapping; // keeps veneer colours true to the sheet
  renderer.toneMappingExposure = 1.0;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#EFE7D8');
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envMap;
  scene.environmentIntensity = 0.85;

  // Neutral white so the veneer keeps its catalogue colour; the hemisphere
  // fill lifts the ceiling and the undersides of furniture.
  const key = new THREE.DirectionalLight('#ffffff', 1.1);
  const fill = new THREE.HemisphereLight('#ffffff', '#e6dccd', 0.55);
  scene.add(key, key.target, fill);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.05, 60);
  let hFov = ROOM_FOV;

  let disposed = false;
  let raf = 0;
  let room = null; // { root, wallMaterial, wallSize, views } once loaded
  let veneerTexture = null;
  let veneerRequest = { url: null, fallbackUrl: null, id: 0 };
  let selection = { angle: 0, closeUp: false };

  const maxTextureSize = Math.min(4096, renderer.capabilities.maxTextureSize);
  const anisotropy = renderer.capabilities.getMaxAnisotropy();
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  /* ---- drawing ---------------------------------------------------- */
  const render = () => renderer.render(scene, camera);

  const applyFov = () => {
    camera.fov = toVFov(hFov, camera.aspect);
    camera.updateProjectionMatrix();
  };

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = host;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    applyFov();
    render();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);

  /* ---- camera ----------------------------------------------------- */
  const placeCamera = (view) => {
    camera.position.copy(view.position);
    camera.quaternion.copy(view.quaternion);
    hFov = view.hFov;
    applyFov();
    render();
  };

  const moveCamera = (view) => {
    cancelAnimationFrame(raf);
    if (reduceMotion) return placeCamera(view);

    const p0 = camera.position.clone();
    const q0 = camera.quaternion.clone();
    const f0 = hFov;
    const start = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - start) / TWEEN_MS);
      const e = easeInOutCubic(k);
      camera.position.lerpVectors(p0, view.position, e);
      camera.quaternion.slerpQuaternions(q0, view.quaternion, e);
      hFov = f0 + (view.hFov - f0) * e;
      applyFov();
      render();
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };

  const selectedView = () =>
    selection.closeUp ? room.views.close : room.views.angles[selection.angle % room.views.angles.length];

  /* ---- veneer ----------------------------------------------------- */
  const loadVeneer = () => {
    const { url, fallbackUrl, id } = veneerRequest;
    if (!room || !url) return;
    loadImage(url, fallbackUrl)
      .then((img) => {
        if (disposed || id !== veneerRequest.id) return; // a newer product was picked meanwhile
        const tex = createVeneerTexture(img, { wall: room.wallSize, maxSize: maxTextureSize, anisotropy });
        veneerTexture?.dispose();
        veneerTexture = tex;
        room.wallMaterial.map = tex;
        room.wallMaterial.color.set('#ffffff');
        room.wallMaterial.needsUpdate = true;
        render();
      })
      .catch((err) => console.error('Veneer sheet failed to load:', err));
  };

  /* ---- loading ---------------------------------------------------- */
  const stopProgress = onModelProgress((p) => onProgress?.(p));

  preloadRoomModel()
    .then((gltf) => {
      if (disposed) return;
      const root = gltf.scene;
      scene.add(root);

      const wallMesh = findVeneerWall(root);
      const wall = wallFrame(wallMesh, root);
      const { widthM = 1, heightM = 1 } = wallMesh.material.userData;

      // Soft key light from the room side, raking slightly across the wall
      // so the grain reads.
      key.position.copy(wall.center)
        .addScaledVector(wall.normal, 3)
        .addScaledVector(wall.right, -2.2)
        .setY(wall.floorY + 2.6);
      key.target.position.copy(wall.center);

      room = { root, wallMaterial: wallMesh.material, wallSize: { widthM, heightM }, views: buildViews(gltf, root, wall) };
      resize();
      placeCamera(selectedView());
      loadVeneer();
      onReady?.({ angleCount: room.views.angles.length });
    })
    .catch((err) => {
      if (disposed) return;
      console.error('Room viewer failed to load:', err);
      onError?.(err);
    })
    .finally(stopProgress);

  /* ---- public API ------------------------------------------------- */
  return {
    setVeneer(url, fallbackUrl) {
      veneerRequest = { url, fallbackUrl, id: veneerRequest.id + 1 };
      loadVeneer();
    },

    show({ angle = 0, closeUp = false }) {
      selection = { angle, closeUp };
      if (room) moveCamera(selectedView());
    },

    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      stopProgress();
      if (room) {
        // The model is cached for the next product page; detach, don't destroy.
        scene.remove(room.root);
        room.wallMaterial.map = null;
        room.wallMaterial.needsUpdate = true;
      }
      veneerTexture?.dispose();
      envMap.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}

import * as THREE from 'three';

export const ROOM_FOV = 72; // horizontal degrees; kept constant across screen shapes
const CLOSE_FOV = 42;
const UP = new THREE.Vector3(0, 1, 0);

/**
 * A camera pose: { position, quaternion, hFov }. hFov is horizontal so the
 * wall stays framed whatever the screen shape; see toVFov.
 */

// Hold the horizontal FOV so the wall stays framed on any screen shape, but
// cap the vertical so a portrait phone in fullscreen doesn't turn fisheye.
export const toVFov = (hFovDeg, aspect) =>
  Math.min(80, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(hFovDeg) / 2) / aspect)));

function lookFrom(position, target, hFov) {
  const m = new THREE.Matrix4().lookAt(position, target, UP);
  return { position: position.clone(), quaternion: new THREE.Quaternion().setFromRotationMatrix(m), hFov };
}

/** Frame of the veneer wall: centre, into-room normal, right, width, floor height. */
export function wallFrame(wallMesh, root) {
  wallMesh.updateWorldMatrix(true, false);
  const box = new THREE.Box3().setFromObject(wallMesh);
  const center = box.getCenter(new THREE.Vector3());

  const normal = new THREE.Vector3();
  const normals = wallMesh.geometry.attributes.normal;
  for (let i = 0; i < normals.count; i++) {
    normal.x += normals.getX(i);
    normal.y += normals.getY(i);
    normal.z += normals.getZ(i);
  }
  normal.transformDirection(wallMesh.matrixWorld).setY(0).normalize();
  // Blender cube normals face outward; point this one into the room instead.
  const roomCenter = new THREE.Box3().setFromObject(root).getCenter(new THREE.Vector3());
  if (roomCenter.sub(center).dot(normal) < 0) normal.negate();

  const right = new THREE.Vector3().crossVectors(normal.clone().negate(), UP).normalize();
  const size = box.getSize(new THREE.Vector3());
  return { center, normal, right, width: Math.abs(size.dot(right)), floorY: box.min.y };
}

function closeUpView({ center, normal, right, floorY, width }) {
  const target = new THREE.Vector3(center.x, floorY + 1.45, center.z).addScaledVector(right, width * 0.18);
  return lookFrom(target.clone().addScaledVector(normal, 1.0), target, CLOSE_FOV);
}

function cameraView(cam) {
  const hFov = THREE.MathUtils.radToDeg(
    2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * (cam.aspect || 16 / 9))
  );
  return {
    position: cam.getWorldPosition(new THREE.Vector3()),
    quaternion: cam.getWorldQuaternion(new THREE.Quaternion()),
    hFov,
  };
}

/** Four angles laid out around the wall, for exports without cameras. */
function builtInAngles(root, { center, normal, right, width, floorY }) {
  const roomBox = new THREE.Box3().setFromObject(root);
  const eye = floorY + 1.6;
  const at = (side) => new THREE.Vector3(center.x, floorY + 1.2, center.z).addScaledVector(right, side);
  const from = (out, side, y) =>
    new THREE.Vector3(center.x, y, center.z).addScaledVector(normal, out).addScaledVector(right, side);

  // How far the room reaches out from the wall, and to either side of it.
  const corners = [];
  for (const x of [roomBox.min.x, roomBox.max.x]) {
    for (const z of [roomBox.min.z, roomBox.max.z]) corners.push(new THREE.Vector3(x, 0, z).sub(center));
  }
  const depth = Math.max(...corners.map((c) => c.dot(normal))) - 0.45;
  const halfSpan = Math.min(...[1, -1].map((s) => Math.max(...corners.map((c) => s * c.dot(right))))) - 0.45;

  return [
    lookFrom(from(depth, width * 0.2, eye), at(-width * 0.04), ROOM_FOV),
    lookFrom(from(depth * 0.8, -halfSpan * 0.85, eye), at(width * 0.12), ROOM_FOV),
    lookFrom(from(depth * 0.8, halfSpan * 0.85, eye), at(-width * 0.12), ROOM_FOV),
    lookFrom(from(1.9, width * 0.46, floorY + 1.35), at(-width * 0.18), 64),
  ];
}

/**
 * { angles: [pose x up to 4], close: pose }.
 * Cameras exported from Blender win when present: up to four are used as the
 * room angles (in name order), and one whose name contains "close" becomes the
 * close-up. Otherwise the angles are laid out around the veneer wall.
 */
export function buildViews(gltf, root, wall) {
  const cams = [...(gltf.cameras || [])].sort((a, b) => a.name.localeCompare(b.name));
  const closeCam = cams.find((c) => /close/i.test(c.name));
  const angleCams = cams.filter((c) => c !== closeCam).slice(0, 4);

  root.updateMatrixWorld(true);
  return {
    angles: angleCams.length ? angleCams.map(cameraView) : builtInAngles(root, wall),
    close: closeCam ? cameraView(closeCam) : closeUpView(wall),
  };
}

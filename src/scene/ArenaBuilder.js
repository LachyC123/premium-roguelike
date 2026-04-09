import * as THREE from 'https://unpkg.com/three@0.162.0/build/three.module.js';

function makeCover(color = '#2e3b6a') {
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 1.1, 0.9),
    new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.1 })
  );
  base.position.y = 0.55;

  const top = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.35, 1.2),
    new THREE.MeshStandardMaterial({ color: '#495ea0', roughness: 0.45, metalness: 0.12 })
  );
  top.position.y = 1.2;

  group.add(base, top);
  return group;
}

export function buildArena(scene, size) {
  const root = new THREE.Group();
  root.name = 'arena';

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size, 1, 1),
    new THREE.MeshStandardMaterial({
      color: '#111b33',
      roughness: 0.82,
      metalness: 0.05,
      emissive: '#0a1325',
      emissiveIntensity: 0.25,
    })
  );
  floor.rotation.x = -Math.PI * 0.5;
  root.add(floor);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(2.8, 3.2, 64),
    new THREE.MeshBasicMaterial({ color: '#5d9fff', transparent: true, opacity: 0.45, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI * 0.5;
  ring.position.y = 0.02;
  root.add(ring);

  const coverLayout = [
    [-5.5, -4],
    [5.5, -3.3],
    [-4.7, 4.5],
    [4.8, 4.2],
  ];

  coverLayout.forEach(([x, z], index) => {
    const cover = makeCover(index % 2 === 0 ? '#3557b8' : '#355f9c');
    cover.position.set(x, 0, z);
    cover.rotation.y = index * 0.35;
    root.add(cover);
  });

  const boundary = size * 0.5 - 0.5;
  const wallMaterial = new THREE.MeshStandardMaterial({ color: '#1f2f55', roughness: 0.55, metalness: 0.08 });
  const wallGeoLong = new THREE.BoxGeometry(size, 2.5, 1);
  const wallGeoSide = new THREE.BoxGeometry(1, 2.5, size - 2);

  const north = new THREE.Mesh(wallGeoLong, wallMaterial);
  north.position.set(0, 1.25, -boundary);
  const south = north.clone();
  south.position.z = boundary;

  const west = new THREE.Mesh(wallGeoSide, wallMaterial);
  west.position.set(-boundary, 1.25, 0);
  const east = west.clone();
  east.position.x = boundary;

  root.add(north, south, west, east);

  const hemi = new THREE.HemisphereLight('#78bfff', '#1a1f3d', 0.86);
  const directional = new THREE.DirectionalLight('#c4e5ff', 1.1);
  directional.position.set(6, 10, 4);

  root.add(hemi, directional);

  scene.add(root);
  return { root, boundary: boundary - 0.8 };
}

import * as THREE from 'https://unpkg.com/three@0.162.0/build/three.module.js';

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#060912');
  scene.fog = new THREE.Fog('#060912', 20, 55);
  return scene;
}

export function createCamera(width, height) {
  const camera = new THREE.PerspectiveCamera(62, width / height, 0.1, 150);
  camera.position.set(0, 3, 8);
  return camera;
}

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  });

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = false;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  return renderer;
}

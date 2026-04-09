import * as THREE from 'https://unpkg.com/three@0.162.0/build/three.module.js';
import { dampVector3 } from '../utils/math.js';

export class CameraController {
  constructor(camera, config) {
    this.camera = camera;
    this.config = config;
    this.desiredPos = new THREE.Vector3();
    this.lookTarget = new THREE.Vector3();
    this.yaw = 0;
  }

  tick(deltaSec, hero, lookInput) {
    this.yaw -= lookInput.lookX * deltaSec * 2.1;

    const distance = this.config.followDistance;
    const height = this.config.followHeight;

    const x = Math.sin(this.yaw) * distance;
    const z = Math.cos(this.yaw) * distance;

    this.desiredPos.set(
      hero.root.position.x + x,
      hero.root.position.y + height,
      hero.root.position.z + z
    );

    dampVector3(this.camera.position, this.desiredPos, this.config.smoothFactor, deltaSec);

    this.lookTarget.set(hero.root.position.x, hero.root.position.y + this.config.lookHeight, hero.root.position.z);
    this.camera.lookAt(this.lookTarget);
  }
}

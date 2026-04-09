import * as THREE from 'https://unpkg.com/three@0.162.0/build/three.module.js';

export class PlayerController {
  constructor(cameraController) {
    this.cameraController = cameraController;
    this.worldMove = new THREE.Vector2();
  }

  tick(hero, inputState) {
    const localX = inputState.moveX;
    const localY = inputState.moveY;

    const yaw = this.cameraController.yaw;
    const sin = Math.sin(yaw);
    const cos = Math.cos(yaw);

    const worldX = localX * cos + localY * sin;
    const worldY = localY * cos - localX * sin;

    this.worldMove.set(worldX, worldY);
    hero.applyMoveInput(this.worldMove.x, this.worldMove.y);
  }
}

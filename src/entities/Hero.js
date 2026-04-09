import * as THREE from 'https://unpkg.com/three@0.162.0/build/three.module.js';

export class Hero {
  constructor({ name, teamColor = '#6de9ff', maxHealth = 100, speed = 6.5, radius = 0.45 }) {
    this.name = name;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
    this.speed = speed;
    this.radius = radius;

    this.root = new THREE.Group();
    this.root.name = `hero-${name.toLowerCase()}`;

    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.42, 0.8, 8, 16),
      new THREE.MeshStandardMaterial({ color: teamColor, roughness: 0.34, metalness: 0.1, emissive: '#16374f', emissiveIntensity: 0.45 })
    );
    body.position.y = 1;

    const visor = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 12, 12),
      new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#8cd9ff', emissiveIntensity: 0.7 })
    );
    visor.position.set(0, 1.28, 0.32);

    this.root.add(body, visor);

    this.velocity = new THREE.Vector3();
    this.moveVector = new THREE.Vector2();
    this.facingYaw = 0;
  }

  setPosition(x, y, z) {
    this.root.position.set(x, y, z);
  }

  applyMoveInput(x, y) {
    this.moveVector.set(x, y);
  }

  tick(deltaSec, boundary) {
    const moveX = this.moveVector.x;
    const moveY = this.moveVector.y;
    const length = Math.hypot(moveX, moveY) || 1;

    const nx = moveX / length;
    const ny = moveY / length;

    this.velocity.set(nx * this.speed, 0, ny * this.speed);

    if (Math.abs(moveX) > 0.1 || Math.abs(moveY) > 0.1) {
      this.facingYaw = Math.atan2(nx, ny);
      this.root.rotation.y = this.facingYaw;
    } else {
      this.velocity.multiplyScalar(0);
    }

    this.root.position.addScaledVector(this.velocity, deltaSec);

    this.root.position.x = Math.max(-boundary, Math.min(boundary, this.root.position.x));
    this.root.position.z = Math.max(-boundary, Math.min(boundary, this.root.position.z));
  }
}

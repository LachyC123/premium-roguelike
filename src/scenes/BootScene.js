import { setupAudio } from "../systems/audio.js";

const PLACEHOLDER_TEXTURES = [
  { key: "player", color: 0x38bdf8 },
  { key: "enemy", color: 0xf87171 },
  { key: "projectile", color: 0xfacc15 },
];

function createPlaceholderTexture(scene, key, color) {
  if (scene.textures.exists(key)) {
    return;
  }

  const graphics = scene.add.graphics();
  graphics.fillStyle(color, 1);
  graphics.fillRoundedRect(0, 0, 32, 32, 6);
  graphics.generateTexture(key, 32, 32);
  graphics.destroy();
}

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    this.load.on("loaderror", (file) => {
      console.warn(`Missing asset: ${file.key}`);
    });

    this.load.image("player", "assets/player.png");
    this.load.image("enemy", "assets/enemy.png");
    this.load.image("projectile", "assets/projectile.png");
    this.load.audio("dash", "assets/dash.wav");
  }

  create() {
    PLACEHOLDER_TEXTURES.forEach((texture) => {
      createPlaceholderTexture(this, texture.key, texture.color);
    });

    setupAudio(this);

    this.scene.start("MenuScene");
  }
}

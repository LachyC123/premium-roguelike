import { createInputSystem } from "../systems/input.js";
import { createFxSystem } from "../systems/fx.js";
import { createAudioSystem } from "../systems/audio.js";
import { createBalance } from "../systems/balance.js";
import { createPlayer } from "../entities/player.js";
import { createEnemy } from "../entities/enemy.js";
import { createProjectiles } from "../entities/projectiles.js";
import { createLootChoice } from "../ui/lootChoice.js";

export default class RunScene extends Phaser.Scene {
  constructor() {
    super({ key: "RunScene" });
  }

  create() {
    this.balance = createBalance();
    this.inputSystem = createInputSystem(this);
    this.fx = createFxSystem(this);
    this.audio = createAudioSystem(this);

    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0b1120, 1);

    this.player = createPlayer(this, width / 2, height / 2, this.balance);
    this.enemies = this.add.group();
    this.projectiles = createProjectiles(this);

    this.spawnTimer = this.time.addEvent({
      delay: 2400,
      loop: true,
      callback: () => {
        const spawnX = Phaser.Math.Between(80, width - 80);
        const spawnY = Phaser.Math.Between(80, height - 80);
        const enemy = createEnemy(this, spawnX, spawnY, this.balance);
        this.enemies.add(enemy);
      },
    });

    this.camera = this.cameras.main;
    this.camera.startFollow(this.player.sprite);
    this.camera.setBounds(0, 0, width, height);

    this.add
      .text(20, 16, "Run: survive and farm upgrades", {
        fontSize: "16px",
        color: "#e2e8f0",
      })
      .setScrollFactor(0);

    this.lootChoice = createLootChoice(this, width - 200, 120);
  }

  update(time, delta) {
    if (!this.player) {
      return;
    }

    this.player.update(this.inputSystem, time, delta, this.audio, this.fx);

    this.enemies.getChildren().forEach((enemy) => {
      enemy.update(this.player.sprite, delta);
    });

    this.projectiles.update(delta, this.enemies);
  }
}

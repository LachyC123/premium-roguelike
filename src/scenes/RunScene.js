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
    this.projectiles = createProjectiles(this, this.balance);

    this.spawnTimer = this.time.addEvent({
      delay: 2200,
      loop: true,
      callback: () => {
        const spawnX = Phaser.Math.Between(80, width - 80);
        const spawnY = Phaser.Math.Between(80, height - 80);
        const enemy = createEnemy(this, spawnX, spawnY, this.balance);
        enemy.sprite.setData("controller", enemy);
        this.enemies.add(enemy.sprite);
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
    this.dashUi = this.createDashIndicator(40, height - 48);

    this.physics.add.overlap(this.player.sprite, this.enemies, (player, enemy) => {
      if (this.player.state.isDashing) {
        return;
      }
      this.handlePlayerHit(player, enemy);
    });
  }

  createDashIndicator(x, y) {
    const container = this.add.container(x, y).setScrollFactor(0);
    const label = this.add.text(0, -18, "Dash", {
      fontSize: "12px",
      color: "#94a3b8",
    });
    label.setOrigin(0.5);

    const background = this.add.rectangle(0, 0, 60, 10, 0x1f2937, 0.9);
    background.setStrokeStyle(1, 0x334155, 1);

    const fill = this.add.rectangle(-30, 0, 60, 10, 0x38bdf8, 0.95);
    fill.setOrigin(0, 0.5);

    container.add([background, fill, label]);
    return { container, fill };
  }

  handlePlayerHit(player, enemy) {
    this.fx.hitstop(80);
    this.fx.cameraShake(0.012, 140);
    this.fx.screenFlash(0xef4444, 0.25, 160);
    this.fx.damageNumber(player.x, player.y - 24, "-1");
  }

  handleEnemyHit(enemySprite) {
    const enemy = enemySprite.getData("controller");
    if (!enemy) return;

    const killed = enemy.takeDamage(1);
    if (!killed) {
      enemySprite.setTint(0xfbbf24);
      return;
    }

    this.fx.burstParticles(enemySprite.x, enemySprite.y, { color: 0xfbbf24, count: 16 });
    this.fx.damageNumber(enemySprite.x, enemySprite.y, "KO", { color: "#facc15" });
    this.fx.screenFlash(0xfacc15, 0.15, 120);

    this.time.timeScale = 0.8;
    this.time.delayedCall(140, () => {
      this.time.timeScale = 1;
    });

    this.tweens.add({
      targets: enemySprite,
      scale: 0,
      duration: 160,
      ease: "Back.easeIn",
      onComplete: () => enemySprite.destroy(),
    });
  }

  update(time) {
    if (!this.player) {
      return;
    }

    this.player.update(this.inputSystem, time, this.audio, this.fx);

    this.enemies.getChildren().forEach((enemySprite) => {
      const controller = enemySprite.getData("controller");
      if (controller) {
        controller.update(this.player.sprite);
      }
    });

    this.projectiles.update(this.enemies, (enemySprite) => {
      this.handleEnemyHit(enemySprite);
    });

    if (this.dashUi) {
      const percent = this.player.dashCooldownPercent(time);
      this.dashUi.fill.width = 60 * percent;
    }
  }
}

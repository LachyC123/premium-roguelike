export function createFxSystem(scene) {
  const overlay = scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, 0xffffff, 0.0);
  overlay.setOrigin(0, 0).setScrollFactor(0).setDepth(200);

  return {
    hitstop(durationMs = 80) {
      scene.time.timeScale = 0.001;
      scene.tweens.timeScale = 0.001;
      scene.physics.world.timeScale = 0.001;

      scene.time.delayedCall(durationMs, () => {
        scene.time.timeScale = 1;
        scene.tweens.timeScale = 1;
        scene.physics.world.timeScale = 1;
      });
    },

    cameraShake(intensity = 0.008, durationMs = 120) {
      scene.cameras.main.shake(durationMs, intensity);
    },

    damageNumber(x, y, text, style = {}) {
      const label = scene.add.text(x, y, text, {
        fontSize: "16px",
        color: "#f87171",
        fontStyle: "bold",
        stroke: "#0f172a",
        strokeThickness: 3,
        ...style,
      });
      label.setOrigin(0.5);
      scene.tweens.add({
        targets: label,
        y: y - 20,
        alpha: 0,
        duration: 650,
        ease: "Sine.easeOut",
        onComplete: () => label.destroy(),
      });
    },

    burstParticles(x, y, options = {}) {
      const {
        color = 0xfbbf24,
        count = 12,
        speed = 180,
        lifespan = 400,
      } = options;

      const particles = scene.add.group();

      for (let i = 0; i < count; i += 1) {
        const particle = scene.add.circle(x, y, 3, color, 1);
        particles.add(particle);
        const angle = Phaser.Math.DegToRad(Phaser.Math.Between(0, 360));
        const velocity = new Phaser.Math.Vector2(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed
        );

        scene.tweens.add({
          targets: particle,
          x: x + velocity.x,
          y: y + velocity.y,
          alpha: 0,
          duration: lifespan,
          ease: "Cubic.easeOut",
          onComplete: () => particle.destroy(),
        });
      }
    },

    screenFlash(color = 0xffffff, alpha = 0.3, durationMs = 120) {
      overlay.fillColor = color;
      overlay.alpha = alpha;
      scene.tweens.add({
        targets: overlay,
        alpha: 0,
        duration: durationMs,
        ease: "Sine.easeOut",
      });
    },
  };
}

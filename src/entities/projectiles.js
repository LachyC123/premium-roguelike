export function createProjectiles(scene, balance) {
  const group = scene.physics.add.group({
    defaultKey: "projectile",
    maxSize: 50,
  });

  scene.time.addEvent({
    delay: 900,
    loop: true,
    callback: () => {
      const projectile = group.get(scene.scale.width / 2, scene.scale.height / 2);
      if (!projectile) return;
      projectile.setActive(true).setVisible(true);
      projectile.setTint(0xfacc15);
      const angle = Phaser.Math.DegToRad(Phaser.Math.Between(0, 360));
      scene.physics.velocityFromRotation(angle, balance.projectileSpeed, projectile.body.velocity);
    },
  });

  return {
    group,
    update(enemies, onHit, delta) {
      group.children.each((projectile) => {
        if (!projectile.active) return;
        if (
          projectile.x < -20 ||
          projectile.x > scene.scale.width + 20 ||
          projectile.y < -20 ||
          projectile.y > scene.scale.height + 20
        ) {
          projectile.setActive(false).setVisible(false);
        }
      });

      if (enemies) {
        scene.physics.overlap(group, enemies, (projectile, enemy) => {
          projectile.setActive(false).setVisible(false);
          if (onHit) {
            onHit(enemy);
          }
        });
      }
    },
  };
}

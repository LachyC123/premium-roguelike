export function createEnemy(scene, x, y, balance) {
  const sprite = scene.physics.add.sprite(x, y, "enemy");
  sprite.setTint(0xf87171);
  sprite.setCollideWorldBounds(true);

  return {
    sprite,
    update(target, delta) {
      if (!target) return;
      const direction = new Phaser.Math.Vector2(
        target.x - sprite.x,
        target.y - sprite.y
      ).normalize();

      sprite.setVelocity(direction.x * balance.enemySpeed, direction.y * balance.enemySpeed);
    },
  };
}

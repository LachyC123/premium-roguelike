export function createEnemy(scene, x, y, balance) {
  const sprite = scene.physics.add.sprite(x, y, "enemy");
  sprite.setTint(0xf87171);
  sprite.setCollideWorldBounds(true);

  const state = {
    hp: 2,
  };

  return {
    sprite,
    state,
    update(target) {
      if (!target) return;
      const direction = new Phaser.Math.Vector2(
        target.x - sprite.x,
        target.y - sprite.y
      ).normalize();

      sprite.setVelocity(direction.x * balance.enemySpeed, direction.y * balance.enemySpeed);
    },
    takeDamage(amount = 1) {
      state.hp -= amount;
      return state.hp <= 0;
    },
  };
}

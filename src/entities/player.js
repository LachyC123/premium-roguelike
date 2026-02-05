export function createPlayer(scene, x, y, balance) {
  const sprite = scene.physics.add.sprite(x, y, "player");
  sprite.setCollideWorldBounds(true);
  sprite.setDrag(600, 600);

  const state = {
    lastDashTime: -balance.dashCooldown,
  };

  return {
    sprite,
    update(inputSystem, time, delta, audio, fx) {
      const movement = inputSystem.getMovementVector();
      const speed = balance.playerSpeed;

      sprite.setVelocity(movement.x * speed, movement.y * speed);

      if (inputSystem.dash.isDown && time - state.lastDashTime > balance.dashCooldown) {
        state.lastDashTime = time;
        sprite.setVelocity(movement.x * balance.dashSpeed, movement.y * balance.dashSpeed);
        audio.play("dash");
        fx.dashFlash();
      }

      if (movement.lengthSq() === 0) {
        sprite.setVelocity(0, 0);
      }
    },
  };
}

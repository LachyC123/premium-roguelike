export function createPlayer(scene, x, y, balance) {
  const sprite = scene.physics.add.sprite(x, y, "player");
  sprite.setCollideWorldBounds(true);
  sprite.setDrag(600, 600);

  const state = {
    lastDashTime: -balance.dashCooldown,
    isDashing: false,
  };

  return {
    sprite,
    state,
    update(inputSystem, time, audio, fx) {
      const movement = inputSystem.getMovementVector();
      const speed = balance.playerSpeed;

      sprite.setVelocity(movement.x * speed, movement.y * speed);

      const canDash = time - state.lastDashTime > balance.dashCooldown;
      if (inputSystem.dash.isDown && canDash) {
        state.lastDashTime = time;
        state.isDashing = true;
        sprite.setVelocity(movement.x * balance.dashSpeed, movement.y * balance.dashSpeed);
        audio.play("dash");
        fx.screenFlash(0x38bdf8, 0.2, 120);
      }

      if (movement.lengthSq() === 0) {
        sprite.setVelocity(0, 0);
      }

      state.isDashing = time - state.lastDashTime < 150;
    },
    dashCooldownPercent(time) {
      const elapsed = time - state.lastDashTime;
      return Phaser.Math.Clamp(elapsed / balance.dashCooldown, 0, 1);
    },
  };
}

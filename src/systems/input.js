export function createInputSystem(scene) {
  const cursors = scene.input.keyboard.createCursorKeys();
  const wasd = scene.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D,
  });

  return {
    cursors,
    wasd,
    dash: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    getMovementVector() {
      const left = cursors.left.isDown || wasd.left.isDown;
      const right = cursors.right.isDown || wasd.right.isDown;
      const up = cursors.up.isDown || wasd.up.isDown;
      const down = cursors.down.isDown || wasd.down.isDown;

      const vector = new Phaser.Math.Vector2(
        (right ? 1 : 0) - (left ? 1 : 0),
        (down ? 1 : 0) - (up ? 1 : 0)
      );

      return vector.normalize();
    },
  };
}

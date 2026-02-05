export function createFxSystem(scene) {
  const flash = scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, 0xffffff, 0.0);
  flash.setOrigin(0, 0).setScrollFactor(0).setDepth(100);

  return {
    dashFlash() {
      flash.alpha = 0.25;
      scene.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 200,
        ease: "Sine.easeOut",
      });
    },
  };
}

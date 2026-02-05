export function createButton(scene, x, y, label, onClick) {
  const width = 200;
  const height = 44;

  const container = scene.add.container(x, y);
  container.setScale(0.92);
  container.alpha = 0;

  const glow = scene.add.rectangle(0, 0, width + 8, height + 8, 0x38bdf8, 0.15);
  glow.setStrokeStyle(2, 0x60a5fa, 0.4);
  glow.setVisible(false);

  const button = scene.add.rectangle(0, 0, width, height, 0x2563eb, 0.95);
  button.setInteractive({ useHandCursor: true });

  const text = scene.add
    .text(0, 0, label, {
      fontSize: "18px",
      color: "#f8fafc",
      fontStyle: "bold",
    })
    .setOrigin(0.5);

  container.add([glow, button, text]);

  scene.tweens.add({
    targets: container,
    scale: 1,
    alpha: 1,
    duration: 300,
    ease: "Back.easeOut",
  });

  button.on("pointerover", () => {
    glow.setVisible(true);
    button.setFillStyle(0x1d4ed8, 1);
    scene.tweens.add({ targets: container, scale: 1.03, duration: 120, ease: "Sine.easeOut" });
  });

  button.on("pointerout", () => {
    glow.setVisible(false);
    button.setFillStyle(0x2563eb, 0.95);
    scene.tweens.add({ targets: container, scale: 1, duration: 140, ease: "Sine.easeOut" });
  });

  button.on("pointerdown", () => {
    scene.tweens.add({ targets: container, scale: 0.96, duration: 80, ease: "Sine.easeOut" });
    onClick();
  });

  button.on("pointerup", () => {
    scene.tweens.add({ targets: container, scale: 1, duration: 120, ease: "Sine.easeOut" });
  });

  return { container, button, text, glow };
}

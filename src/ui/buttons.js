export function createButton(scene, x, y, label, onClick) {
  const width = 200;
  const height = 44;

  const button = scene.add.rectangle(x, y, width, height, 0x2563eb, 0.9);
  button.setInteractive({ useHandCursor: true });

  const text = scene.add
    .text(x, y, label, {
      fontSize: "18px",
      color: "#f8fafc",
      fontStyle: "bold",
    })
    .setOrigin(0.5);

  button.on("pointerover", () => {
    button.setFillStyle(0x1d4ed8, 1);
  });

  button.on("pointerout", () => {
    button.setFillStyle(0x2563eb, 0.9);
  });

  button.on("pointerdown", () => {
    onClick();
  });

  return { button, text };
}

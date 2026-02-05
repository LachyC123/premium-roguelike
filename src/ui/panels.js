export function createPanel(scene, x, y, width, height, color) {
  const panel = scene.add.rectangle(x, y, width, height, Phaser.Display.Color.HexStringToColor(color).color, 0.9);
  panel.setStrokeStyle(2, 0x334155, 1);
  return panel;
}

export function createLootChoice(scene, x, y) {
  const container = scene.add.container(x, y);
  const card = scene.add.rectangle(0, 0, 180, 120, 0x1f2937, 0.9);
  card.setStrokeStyle(1, 0x475569, 1);

  const title = scene.add.text(0, -40, "Loot", {
    fontSize: "16px",
    color: "#f8fafc",
    fontStyle: "bold",
  });
  title.setOrigin(0.5);

  const body = scene.add.text(0, 0, "Pickups drop here.\nSoon: perks!", {
    fontSize: "12px",
    color: "#cbd5f5",
    align: "center",
  });
  body.setOrigin(0.5);

  container.add([card, title, body]);
  container.setScrollFactor(0);
  return container;
}

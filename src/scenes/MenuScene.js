import { createButton } from "../ui/buttons.js";
import { createPanel } from "../ui/panels.js";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  create() {
    const { width, height } = this.scale;

    createPanel(this, width / 2, height / 2, 420, 320, "#111827");

    this.add
      .text(width / 2, height / 2 - 110, "Premium Roguelike", {
        fontSize: "32px",
        color: "#f8fafc",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    createButton(this, width / 2, height / 2 - 10, "Play", () => {
      this.scene.start("RunScene");
    });

    createButton(this, width / 2, height / 2 + 70, "Upgrades", () => {
      this.scene.start("UpgradeScene");
    });

    this.add
      .text(width / 2, height - 40, "WASD / Arrows to move · Space to dash", {
        fontSize: "14px",
        color: "#94a3b8",
      })
      .setOrigin(0.5);
  }
}

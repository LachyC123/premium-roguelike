import { createPanel } from "../ui/panels.js";
import { createButton } from "../ui/buttons.js";
import { loadSave, saveRun } from "../systems/save.js";

export default class UpgradeScene extends Phaser.Scene {
  constructor() {
    super({ key: "UpgradeScene" });
  }

  create() {
    const { width, height } = this.scale;
    const saveData = loadSave();

    createPanel(this, width / 2, height / 2, 520, 360, "#0f172a");

    this.add
      .text(width / 2, height / 2 - 120, "Upgrades", {
        fontSize: "28px",
        color: "#f8fafc",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 40, `Currency: ${saveData.currency}`, {
        fontSize: "18px",
        color: "#cbd5f5",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 10, "Upgrade shop coming soon.", {
        fontSize: "16px",
        color: "#94a3b8",
      })
      .setOrigin(0.5);

    createButton(this, width / 2, height / 2 + 90, "Back", () => {
      saveRun({ currency: saveData.currency });
      this.scene.start("MenuScene");
    });
  }
}

import BootScene from "./scenes/BootScene.js";
import MenuScene from "./scenes/MenuScene.js";
import RunScene from "./scenes/RunScene.js";
import UpgradeScene from "./scenes/UpgradeScene.js";

export function createGame() {
  const config = {
    type: Phaser.AUTO,
    parent: "game",
    width: 960,
    height: 540,
    backgroundColor: "#0f172a",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    scene: [BootScene, MenuScene, RunScene, UpgradeScene],
  };

  return new Phaser.Game(config);
}

export class UI {
  constructor(game) {
    this.game = game;
    this.weaponSlots = document.getElementById("weaponSlots");
    this.aliveCounter = document.getElementById("aliveCounter");
    this.healthBar = document.getElementById("healthBar");
    this.armorText = document.getElementById("armorText");
    this.ammoReadout = document.getElementById("ammoReadout");
    this.gameUI = document.getElementById("gameUI");
    this.title = document.getElementById("titleScreen");
    this.end = document.getElementById("endScreen");
    this.endTitle = document.getElementById("endTitle");
    this.endSub = document.getElementById("endSub");
    this.inventoryPanel = document.getElementById("inventoryPanel");
    this.groundLootList = document.getElementById("groundLootList");
    this.backpackList = document.getElementById("backpackList");
    this.equippedList = document.getElementById("equippedList");
    this._bind();
  }
  _bind() {
    document.getElementById("playBtn").onclick = () => this.game.startMatch();
    document.getElementById("restartBtn").onclick = () => this.game.startMatch();
    document.getElementById("closeInv").onclick = () => this.setInventory(false);
    document.getElementById("pauseBtn").onclick = () => this.game.paused = !this.game.paused;
  }
  showGame() {
    this.title.classList.add("hidden");
    this.end.classList.add("hidden");
    this.gameUI.classList.remove("hidden");
  }
  showEnd(win, rank) {
    this.endTitle.textContent = win ? "VICTORY" : "ELIMINATED";
    this.endSub.textContent = win ? "You survived the desert." : `Final rank #${rank}`;
    this.end.classList.remove("hidden");
  }
  setInventory(open) { this.inventoryPanel.classList.toggle("hidden", !open); this.game.inventoryOpen = open; }
  renderInventory(nearLoot, player) {
    const draw = (el, items, handler) => {
      el.innerHTML = "";
      items.forEach((it, i) => {
        const li = document.createElement("li");
        li.textContent = it.label;
        li.onclick = () => handler(i);
        el.appendChild(li);
      });
    };
    draw(this.groundLootList, nearLoot.map(l => ({ label: l.uiName })), (i) => this.game.pickLootByIndex(i));
    draw(this.backpackList, player.backpack.map((b) => ({ label: b.label })), (i) => this.game.useBackpackItem(i));
    draw(this.equippedList, player.weaponSlots.map((w, idx) => ({ label: `Slot ${idx + 1}: ${w ? w.name : "Empty"}` })), (i) => this.game.selectWeapon(i));
  }
  updateHUD(player, alive) {
    this.weaponSlots.innerHTML = "";
    for (let i = 0; i < 5; i++) {
      const s = document.createElement("div");
      s.className = `slot ${i === player.activeSlot ? "active" : ""}`;
      s.textContent = i + 1;
      s.onclick = () => this.game.selectWeapon(i);
      this.weaponSlots.appendChild(s);
    }
    this.aliveCounter.textContent = `${alive} ALIVE`;
    this.healthBar.style.width = `${Math.max(0, player.health)}%`;
    this.armorText.textContent = `Armor: ${Math.round(player.armor)}`;
    const w = player.weaponSlots[player.activeSlot];
    this.ammoReadout.textContent = w ? `${w.ammoInMag} / ${w.reserveAmmo}` : "NONE";
  }
}

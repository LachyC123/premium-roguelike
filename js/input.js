export class InputController {
  constructor() {
    this.move = { x: 0, y: 0 };
    this.aimHeld = false;
    this.fireHeld = false;
    this.jumpPressed = false;
    this.inventoryToggle = false;
    this.look = { x: 0, y: 0 };
    this.slotSelect = null;
    this._setupTouch();
  }
  _setupTouch() {
    const base = document.getElementById("joystickBase");
    const knob = document.getElementById("joystickKnob");
    let joyId = null;
    const center = () => {
      const r = base.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, rad: r.width * 0.4 };
    };
    const updateJoy = (x, y) => {
      const c = center();
      const dx = x - c.x, dy = y - c.y;
      const d = Math.hypot(dx, dy);
      const m = Math.min(d, c.rad);
      const nx = d > 0 ? dx / d : 0, ny = d > 0 ? dy / d : 0;
      this.move.x = nx * (m / c.rad);
      this.move.y = ny * (m / c.rad);
      knob.style.left = `${30 + this.move.x * 30}px`;
      knob.style.top = `${30 + this.move.y * 30}px`;
    };
    window.addEventListener("touchstart", (e) => {
      for (const t of e.changedTouches) {
        const r = base.getBoundingClientRect();
        if (t.clientX >= r.left && t.clientX <= r.right && t.clientY >= r.top && t.clientY <= r.bottom && joyId == null) {
          joyId = t.identifier; updateJoy(t.clientX, t.clientY);
        }
      }
    }, { passive: false });
    window.addEventListener("touchmove", (e) => {
      for (const t of e.changedTouches) if (t.identifier === joyId) updateJoy(t.clientX, t.clientY);
      e.preventDefault();
    }, { passive: false });
    window.addEventListener("touchend", (e) => {
      for (const t of e.changedTouches) if (t.identifier === joyId) {
        joyId = null; this.move.x = 0; this.move.y = 0; knob.style.left = "30px"; knob.style.top = "30px";
      }
    });

    const hold = (id, field) => {
      const btn = document.getElementById(id);
      btn.addEventListener("touchstart", () => this[field] = true, { passive: true });
      btn.addEventListener("touchend", () => this[field] = false, { passive: true });
      btn.addEventListener("mousedown", () => this[field] = true);
      window.addEventListener("mouseup", () => this[field] = false);
    };
    hold("btnAim", "aimHeld");
    hold("btnFire", "fireHeld");

    const jumpBtn = document.getElementById("btnJump");
    jumpBtn.addEventListener("touchstart", () => this.jumpPressed = true, { passive: true });
    jumpBtn.addEventListener("mousedown", () => this.jumpPressed = true);

    const invBtn = document.getElementById("btnInv");
    invBtn.addEventListener("click", () => this.inventoryToggle = true);

    let lookId = null;
    let lx = 0, ly = 0;
    window.addEventListener("touchstart", (e) => {
      for (const t of e.changedTouches) {
        if (t.clientX > window.innerWidth * 0.45 && t.identifier !== joyId && lookId == null) {
          lookId = t.identifier;
          lx = t.clientX; ly = t.clientY;
        }
      }
    });
    window.addEventListener("touchmove", (e) => {
      for (const t of e.changedTouches) if (t.identifier === lookId) {
        this.look.x += (t.clientX - lx) * 0.006;
        this.look.y += (t.clientY - ly) * 0.004;
        lx = t.clientX; ly = t.clientY;
      }
    });
    window.addEventListener("touchend", (e) => {
      for (const t of e.changedTouches) if (t.identifier === lookId) lookId = null;
    });

    const canvas = document.getElementById("gameCanvas");
    let md = false;
    canvas.addEventListener("mousedown", (e) => { md = true; lx = e.clientX; ly = e.clientY; });
    window.addEventListener("mousemove", (e) => {
      if (!md) return;
      this.look.x += (e.clientX - lx) * 0.006;
      this.look.y += (e.clientY - ly) * 0.004;
      lx = e.clientX; ly = e.clientY;
    });
    window.addEventListener("mouseup", () => md = false);

    window.addEventListener("keydown", (e) => {
      if (e.key === "i") this.inventoryToggle = true;
      if (e.key >= "1" && e.key <= "5") this.slotSelect = Number(e.key) - 1;
      if (e.key === "r") this.reloadPressed = true;
    });
  }
  consumeJump() { const v = this.jumpPressed; this.jumpPressed = false; return v; }
  consumeInventoryToggle() { const v = this.inventoryToggle; this.inventoryToggle = false; return v; }
  consumeSlotSelect() { const v = this.slotSelect; this.slotSelect = null; return v; }
  consumeReload() { const v = this.reloadPressed; this.reloadPressed = false; return v; }
}

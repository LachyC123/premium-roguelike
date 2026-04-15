export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.enabled = false;
  }
  unlock() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.enabled = true;
  }
  tone(freq = 440, dur = 0.05, type = "square", gain = 0.04) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.ctx.destination);
    osc.start(t); osc.stop(t + dur);
  }
  gun(weaponId) {
    const base = { pistol: 260, smg: 320, rifle: 180, shotgun: 110, marksman: 95, hammer: 75 }[weaponId] ?? 220;
    this.tone(base, 0.06, "sawtooth", 0.05);
  }
  reload() { this.tone(540, 0.08, "triangle", 0.03); this.tone(420, 0.08, "triangle", 0.03); }
  hit() { this.tone(760, 0.04, "square", 0.04); }
  pickup() { this.tone(840, 0.06, "triangle", 0.035); }
  zoneWarn() { this.tone(210, 0.16, "sine", 0.04); }
}

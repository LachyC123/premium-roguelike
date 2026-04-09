export class GameState {
  constructor() {
    this.modeName = 'Prototype: Movement';
    this.matchTimeSec = 0;
    this.heroName = 'Vanguard';
    this.heroHealth = 100;
  }

  tick(deltaSec) {
    this.matchTimeSec += deltaSec;
  }

  getTimeLabel() {
    const totalSeconds = Math.floor(this.matchTimeSec);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }
}

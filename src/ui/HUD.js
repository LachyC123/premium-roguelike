export class HUD {
  constructor(gameState) {
    this.gameState = gameState;
    this.mode = document.getElementById('mode-name');
    this.timer = document.getElementById('match-timer');
    this.heroName = document.getElementById('hero-name');
    this.heroHealth = document.getElementById('hero-health');
  }

  render() {
    this.mode.textContent = this.gameState.modeName;
    this.timer.textContent = this.gameState.getTimeLabel();
    this.heroName.textContent = this.gameState.heroName;
    this.heroHealth.style.width = `${this.gameState.heroHealth}%`;
  }
}

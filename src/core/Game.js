import { CONFIG } from './config.js';
import { GameState } from './GameState.js';
import { createCamera, createRenderer, createScene } from '../scene/SceneFactory.js';
import { buildArena } from '../scene/ArenaBuilder.js';
import { Hero } from '../entities/Hero.js';
import { TouchInput } from '../input/TouchInput.js';
import { CameraController } from '../systems/CameraController.js';
import { PlayerController } from '../systems/PlayerController.js';
import { HUD } from '../ui/HUD.js';

export class Game {
  constructor({ canvas }) {
    this.canvas = canvas;
    this.state = new GameState();

    this.scene = createScene();
    this.camera = createCamera(window.innerWidth, window.innerHeight);
    this.renderer = createRenderer(canvas);

    const { boundary } = buildArena(this.scene, CONFIG.arena.size);
    this.arenaBoundary = boundary;

    this.hero = new Hero({
      name: this.state.heroName,
      maxHealth: CONFIG.hero.maxHealth,
      speed: CONFIG.hero.speed,
      radius: CONFIG.hero.radius,
    });
    this.hero.setPosition(0, 0, 8);
    this.scene.add(this.hero.root);

    this.touchInput = new TouchInput({
      moveZone: document.getElementById('move-zone'),
      aimZone: document.getElementById('aim-zone'),
      moveStick: document.getElementById('move-stick'),
      aimStick: document.getElementById('aim-stick'),
    });

    this.cameraController = new CameraController(this.camera, CONFIG.camera);
    this.playerController = new PlayerController(this.cameraController);
    this.hud = new HUD(this.state);

    this.lastTime = 0;

    this.handleResize = this.handleResize.bind(this);
    this.loop = this.loop.bind(this);
  }

  start() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    requestAnimationFrame(this.loop);
  }

  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }

  loop(nowMs) {
    const nowSec = nowMs * 0.001;
    const deltaSec = Math.min(0.033, Math.max(0.001, nowSec - this.lastTime || 0.016));
    this.lastTime = nowSec;

    this.state.tick(deltaSec);

    this.playerController.tick(this.hero, this.touchInput.state);
    this.hero.tick(deltaSec, this.arenaBoundary);
    this.cameraController.tick(deltaSec, this.hero, this.touchInput.state);

    this.hud.render();
    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.loop);
  }
}

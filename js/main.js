import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";
import { AudioSystem } from "./audio.js";
import { InputController } from "./input.js";
import { UI } from "./ui.js";
import { MAP_RADIUS, START_BOT_COUNT, MATCH_SECONDS, GRAVITY, WEAPONS, LOOT_TABLE, AMMO_BY_WEAPON } from "./config.js";

const rand = (a, b) => a + Math.random() * (b - a);
const cloneEntry = (value) => {
  if (typeof globalThis.structuredClone === "function") return globalThis.structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};
const pickWeighted = (table) => {
  const total = table.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * total;
  for (const e of table) { r -= e.weight; if (r <= 0) return cloneEntry(e); }
  return cloneEntry(table[0]);
};

class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x86b8ef);
    this.camera = new THREE.PerspectiveCamera(66, window.innerWidth / window.innerHeight, 0.1, 1200);
    this.clock = new THREE.Clock();
    this.input = new InputController();
    this.audio = new AudioSystem();
    this.ui = new UI(this);
    this.paused = false;
    this.inventoryOpen = false;
    this.running = false;

    this._buildWorld();
    this._wireButtons();
    this.loop();
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  _buildWorld() {
    const sun = new THREE.DirectionalLight(0xfff2d0, 1.1); sun.position.set(120, 180, 90); this.scene.add(sun);
    this.scene.add(new THREE.AmbientLight(0xe8d7be, 0.65));

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(MAP_RADIUS * 2.8, MAP_RADIUS * 2.8, 48, 48), new THREE.MeshLambertMaterial({ color: 0xbf8f64 }));
    ground.rotation.x = -Math.PI / 2;
    const pos = ground.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getY(i);
      const h = Math.sin(x * 0.015) * 3 + Math.cos(z * 0.02) * 2 + Math.sin((x + z) * 0.01) * 2;
      pos.setZ(i, h);
    }
    ground.geometry.computeVertexNormals();
    this.scene.add(ground);

    this.world = { ground, houses: [], loot: [], bullets: [], blood: [] };

    const water = new THREE.Mesh(new THREE.RingGeometry(MAP_RADIUS * 1.05, MAP_RADIUS * 1.28, 48), new THREE.MeshBasicMaterial({ color: 0x508eb6, side: THREE.DoubleSide }));
    water.rotation.x = -Math.PI / 2; water.position.y = -1.8; this.scene.add(water);

    const houseMat = new THREE.MeshLambertMaterial({ color: 0xd7c4a5 });
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x9f6d4e });
    for (let i = 0; i < 20; i++) {
      const gx = rand(-MAP_RADIUS + 25, MAP_RADIUS - 25), gz = rand(-MAP_RADIUS + 25, MAP_RADIUS - 25);
      const g = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 8), houseMat);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(7.8, 3, 4), roofMat);
      roof.position.y = 4.3; roof.rotation.y = Math.PI / 4;
      g.add(base, roof); g.position.set(gx, 3, gz);
      this.scene.add(g); this.world.houses.push({ x: gx, z: gz, r: 8.5, mesh: g });
    }

    const grassGeo = new THREE.BoxGeometry(0.4, 1.1, 0.4);
    const grassMat = new THREE.MeshLambertMaterial({ color: 0xc3ad67 });
    for (let i = 0; i < 700; i++) {
      const m = new THREE.Mesh(grassGeo, grassMat);
      m.position.set(rand(-MAP_RADIUS, MAP_RADIUS), 0.4, rand(-MAP_RADIUS, MAP_RADIUS));
      m.rotation.y = rand(0, Math.PI * 2); this.scene.add(m);
    }
  }

  _wireButtons() {
    ["btnFire", "btnAim", "btnJump", "btnInv", "playBtn", "restartBtn"].forEach(id => {
      const el = document.getElementById(id);
      el.addEventListener("touchstart", () => this.audio.unlock(), { once: true });
      el.addEventListener("mousedown", () => this.audio.unlock(), { once: true });
    });
  }

  createActor(isPlayer, x, y, z) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2, 0.9), new THREE.MeshLambertMaterial({ color: isPlayer ? 0x232323 : 0x744f40 }));
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), new THREE.MeshLambertMaterial({ color: 0xd79b6b }));
    const gun = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.22), new THREE.MeshLambertMaterial({ color: 0x2a2a2a }));
    head.position.y = 1.45; gun.position.set(0.78, 0.5, 0);
    g.add(body, head, gun); g.position.set(x, y, z); this.scene.add(g);
    return {
      mesh: g,
      isPlayer,
      health: 100,
      armor: 0,
      velocityY: 0,
      alive: true,
      onGround: false,
      isParachuting: true,
      parachuteMesh: null,
      ai: { state: "roam", timer: rand(1, 4), target: null, shootCd: rand(0.2, 0.6), reaction: rand(0.1, 0.45) },
      activeSlot: 0,
      weaponSlots: [this.makeWeapon("pistol"), null, null, null, null],
      backpack: [{ kind: "bandage", label: "Bandage x1", amount: 1 }],
      ammoPool: { light: 24, heavy: 0, shell: 0 },
      rank: 0,
      fireCd: 0,
      reloadT: 0,
    };
  }

  makeWeapon(id) {
    const w = WEAPONS[id];
    return { ...w, ammoInMag: w.mag, reserveAmmo: w.reserve };
  }

  spawnParachute(actor) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(4, 0.45, 3.5), new THREE.MeshLambertMaterial({ color: 0x5d8f5d }));
    p.position.set(0, 6, 0);
    actor.mesh.add(p); actor.parachuteMesh = p;
  }

  startMatch() {
    this.running = true;
    this.paused = false;
    this.ui.showGame();
    this.ui.setInventory(false);

    if (this.player) this.scene.remove(this.player.mesh);
    for (const b of this.bots || []) this.scene.remove(b.mesh);
    for (const l of this.world.loot) this.scene.remove(l.mesh);

    this.player = this.createActor(true, 0, 58, 0);
    this.spawnParachute(this.player);

    this.bots = [];
    for (let i = 0; i < START_BOT_COUNT; i++) {
      const bot = this.createActor(false, rand(-MAP_RADIUS + 30, MAP_RADIUS - 30), rand(35, 62), rand(-MAP_RADIUS + 30, MAP_RADIUS - 30));
      this.spawnParachute(bot);
      if (Math.random() < 0.75) bot.weaponSlots[1] = this.makeWeapon(["smg", "rifle", "shotgun"][Math.floor(rand(0, 3))]);
      this.bots.push(bot);
    }

    this.zone = {
      center: new THREE.Vector2(0, 0),
      radius: MAP_RADIUS * 0.95,
      targetCenter: new THREE.Vector2(rand(-35, 35), rand(-35, 35)),
      targetRadius: MAP_RADIUS * 0.2,
      step: 0, timer: 0
    };
    this.matchTimer = MATCH_SECONDS;
    this.populateLoot(160);
  }

  populateLoot(n) {
    this.world.loot.length = 0;
    const geo = new THREE.BoxGeometry(0.8, 0.4, 0.8);
    for (let i = 0; i < n; i++) {
      const spec = pickWeighted(LOOT_TABLE);
      const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: spec.kind === "weapon" ? WEAPONS[spec.weaponId].color : spec.kind === "armor" ? 0x7cb0d8 : 0xb4d35f }));
      const x = rand(-MAP_RADIUS + 16, MAP_RADIUS - 16), z = rand(-MAP_RADIUS + 16, MAP_RADIUS - 16);
      mesh.position.set(x, 0.4, z);
      this.scene.add(mesh);
      const uiName = spec.kind === "weapon" ? WEAPONS[spec.weaponId].name : spec.kind === "ammo" ? `${spec.ammoType} ammo +${spec.amount}` : spec.kind === "armor" ? `Armor +${spec.amount}` : "Bandage";
      this.world.loot.push({ ...spec, mesh, x, z, uiName });
    }
  }

  selectWeapon(slot) { this.player.activeSlot = Math.max(0, Math.min(4, slot)); }

  nearbyLoot(limit = 3.5) {
    const p = this.player.mesh.position;
    return this.world.loot.filter(l => Math.hypot(l.x - p.x, l.z - p.z) < limit);
  }

  pickLootByIndex(i) {
    const items = this.nearbyLoot();
    const item = items[i]; if (!item) return;
    this.giveItem(this.player, item);
    this.scene.remove(item.mesh);
    this.world.loot = this.world.loot.filter(l => l !== item);
    this.audio.pickup();
    this.ui.renderInventory(this.nearbyLoot(), this.player);
  }

  giveItem(actor, item) {
    if (item.kind === "weapon") {
      const empty = actor.weaponSlots.findIndex(s => !s);
      const idx = empty >= 0 ? empty : Math.floor(rand(1, 5));
      actor.weaponSlots[idx] = this.makeWeapon(item.weaponId);
    } else if (item.kind === "ammo") {
      actor.ammoPool[item.ammoType] = (actor.ammoPool[item.ammoType] || 0) + item.amount;
    } else if (item.kind === "armor") {
      actor.armor = Math.min(100, actor.armor + item.amount);
    } else if (item.kind === "bandage") {
      const f = actor.backpack.find(b => b.kind === "bandage");
      if (f) { f.amount += 1; f.label = `Bandage x${f.amount}`; }
      else actor.backpack.push({ kind: "bandage", amount: 1, label: "Bandage x1" });
    }
  }

  useBackpackItem(i) {
    const b = this.player.backpack[i];
    if (!b) return;
    if (b.kind === "bandage") {
      this.player.health = Math.min(100, this.player.health + 30);
      b.amount -= 1; b.label = `Bandage x${b.amount}`;
      if (b.amount <= 0) this.player.backpack.splice(i, 1);
    }
    this.ui.renderInventory(this.nearbyLoot(), this.player);
  }

  _moveActor(a, dt, inputVec, speed) {
    const dir = new THREE.Vector3(inputVec.x, 0, inputVec.y);
    if (dir.lengthSq() > 0.001) {
      dir.normalize().multiplyScalar(speed * dt);
      const nx = a.mesh.position.x + dir.x, nz = a.mesh.position.z + dir.z;
      if (!this.collidesHouse(nx, nz, 1.1)) {
        a.mesh.position.x = nx; a.mesh.position.z = nz;
        a.mesh.rotation.y = Math.atan2(dir.x, dir.z);
      }
    }
  }

  collidesHouse(x, z, radius) {
    return this.world.houses.some(h => Math.abs(x - h.x) < h.r + radius && Math.abs(z - h.z) < h.r + radius);
  }

  shoot(shooter, targetPos = null) {
    const w = shooter.weaponSlots[shooter.activeSlot];
    if (!w || shooter.fireCd > 0 || shooter.reloadT > 0) return;
    if (w.id !== "hammer" && w.ammoInMag <= 0) {
      this.tryReload(shooter); return;
    }
    shooter.fireCd = w.fireDelay;
    if (w.id !== "hammer") w.ammoInMag--;
    this.audio.gun(w.id);

    const baseDir = targetPos ? new THREE.Vector3(targetPos.x - shooter.mesh.position.x, 0, targetPos.z - shooter.mesh.position.z).normalize() : new THREE.Vector3(Math.sin(shooter.mesh.rotation.y), 0, Math.cos(shooter.mesh.rotation.y));
    const pellets = w.pellets || 1;
    for (let p = 0; p < pellets; p++) {
      const spread = w.spread;
      const dx = baseDir.x + rand(-spread, spread), dz = baseDir.z + rand(-spread, spread);
      const dir = new THREE.Vector3(dx, 0, dz).normalize();
      this.raycastHit(shooter, dir, w);
    }
  }

  raycastHit(shooter, dir, w) {
    const origin = shooter.mesh.position;
    let nearest = null;
    const candidates = [this.player, ...this.bots].filter(a => a.alive && a !== shooter);
    for (const t of candidates) {
      const to = new THREE.Vector3(t.mesh.position.x - origin.x, 0, t.mesh.position.z - origin.z);
      const d = to.length();
      if (d > w.range) continue;
      const nd = to.clone().normalize();
      const alignment = nd.dot(dir);
      if (alignment > 0.985 - w.spread * 0.45) {
        if (!nearest || d < nearest.d) nearest = { actor: t, d };
      }
    }
    if (nearest) this.damageActor(nearest.actor, w.damage, shooter);
  }

  damageActor(target, dmg, source) {
    if (!target.alive) return;
    const armorCut = Math.min(target.armor, dmg * 0.45);
    target.armor -= armorCut;
    target.health -= (dmg - armorCut);
    this.audio.hit();
    if (target.health <= 0) {
      target.alive = false;
      target.mesh.visible = false;
      target.rank = this.aliveCount();
      if (target.isPlayer) this.end(false, target.rank + 1);
    }
  }

  tryReload(actor) {
    const w = actor.weaponSlots[actor.activeSlot];
    if (!w || w.id === "hammer" || w.reload <= 0 || actor.reloadT > 0) return;
    const ammoType = AMMO_BY_WEAPON[w.id];
    const pool = actor.ammoPool[ammoType] || 0;
    if (pool <= 0 || w.ammoInMag >= w.mag) return;
    actor.reloadT = w.reload; this.audio.reload();
  }

  updateWeaponState(actor, dt) {
    actor.fireCd = Math.max(0, actor.fireCd - dt);
    if (actor.reloadT > 0) {
      actor.reloadT -= dt;
      if (actor.reloadT <= 0) {
        const w = actor.weaponSlots[actor.activeSlot];
        if (!w) return;
        const ammoType = AMMO_BY_WEAPON[w.id];
        const pool = actor.ammoPool[ammoType] || 0;
        const need = w.mag - w.ammoInMag;
        const give = Math.min(need, pool);
        w.ammoInMag += give;
        actor.ammoPool[ammoType] -= give;
      }
    }
  }

  updateParachute(actor, dt) {
    if (!actor.isParachuting) return;
    actor.mesh.position.y -= dt * 8;
    actor.mesh.rotation.y += dt * 0.6;
    if (actor.mesh.position.y <= 1) {
      actor.mesh.position.y = 1;
      actor.isParachuting = false;
      if (actor.parachuteMesh) actor.mesh.remove(actor.parachuteMesh);
    }
  }

  updateActorPhysics(actor, dt) {
    if (actor.isParachuting) return;
    actor.velocityY -= GRAVITY * dt;
    actor.mesh.position.y += actor.velocityY * dt;
    if (actor.mesh.position.y <= 1) {
      actor.mesh.position.y = 1;
      actor.velocityY = 0;
      actor.onGround = true;
    }
  }

  updatePlayer(dt) {
    const p = this.player;
    if (!p.alive) return;
    this.updateParachute(p, dt);
    this.updateActorPhysics(p, dt);

    p.mesh.rotation.y -= this.input.look.x;
    this.input.look.x *= 0.5;
    const speed = this.input.aimHeld ? 9 : 12;
    this._moveActor(p, dt, { x: this.input.move.x, y: this.input.move.y }, speed);
    if (this.input.consumeJump() && p.onGround && !p.isParachuting) { p.velocityY = 11; p.onGround = false; }

    if (this.input.fireHeld && !this.inventoryOpen) this.shoot(p);
    if (this.input.consumeReload()) this.tryReload(p);
    if (this.input.consumeInventoryToggle()) this.ui.setInventory(!this.inventoryOpen);
    const slot = this.input.consumeSlotSelect(); if (slot != null) this.selectWeapon(slot);

    if (this.inventoryOpen) this.ui.renderInventory(this.nearbyLoot(), p);
    if (p.fireCd <= 0 && this.input.aimHeld && p.weaponSlots[p.activeSlot]?.ammoInMag === 0) this.tryReload(p);
    this.updateWeaponState(p, dt);
  }

  botLogic(bot, dt) {
    if (!bot.alive) return;
    this.updateParachute(bot, dt);
    this.updateActorPhysics(bot, dt);
    this.updateWeaponState(bot, dt);
    if (bot.isParachuting) return;

    const enemies = [this.player, ...this.bots].filter(o => o !== bot && o.alive);
    let nearEnemy = null, nearDist = 999;
    for (const e of enemies) {
      const d = bot.mesh.position.distanceTo(e.mesh.position);
      if (d < nearDist) { nearDist = d; nearEnemy = e; }
    }
    const zoneVec = new THREE.Vector2(bot.mesh.position.x - this.zone.center.x, bot.mesh.position.z - this.zone.center.y);
    if (zoneVec.length() > this.zone.radius - 12) bot.ai.state = "retreat";
    else if (nearEnemy && nearDist < 60) bot.ai.state = nearDist < 27 ? "attack" : "chase";
    else bot.ai.state = "roam";

    bot.ai.timer -= dt;
    if (bot.ai.state === "roam") {
      if (!bot.ai.target || bot.ai.timer <= 0) {
        bot.ai.target = new THREE.Vector3(bot.mesh.position.x + rand(-25, 25), 1, bot.mesh.position.z + rand(-25, 25));
        bot.ai.timer = rand(1.8, 4.2);
      }
      const v = new THREE.Vector2(bot.ai.target.x - bot.mesh.position.x, bot.ai.target.z - bot.mesh.position.z);
      const n = v.length() > 0 ? v.normalize() : new THREE.Vector2();
      this._moveActor(bot, dt, { x: n.x, y: n.y }, 8.5);
      this.botTryLoot(bot);
    }
    if (bot.ai.state === "retreat") {
      const to = new THREE.Vector2(this.zone.center.x - bot.mesh.position.x, this.zone.center.y - bot.mesh.position.z).normalize();
      this._moveActor(bot, dt, { x: to.x, y: to.y }, 10.8);
    }
    if (bot.ai.state === "chase" && nearEnemy) {
      const to = new THREE.Vector2(nearEnemy.mesh.position.x - bot.mesh.position.x, nearEnemy.mesh.position.z - bot.mesh.position.z).normalize();
      this._moveActor(bot, dt, { x: to.x, y: to.y }, 11.4);
      if (Math.random() < 0.02) this.tryReload(bot);
    }
    if (bot.ai.state === "attack" && nearEnemy) {
      bot.mesh.lookAt(nearEnemy.mesh.position.x, bot.mesh.position.y, nearEnemy.mesh.position.z);
      bot.ai.shootCd -= dt;
      if (bot.ai.shootCd <= 0) {
        bot.ai.shootCd = (bot.weaponSlots[bot.activeSlot]?.fireDelay || 0.4) + rand(0.02, 0.2);
        if (Math.random() > 0.16) this.shoot(bot, nearEnemy.mesh.position);
      }
      if (Math.random() < 0.007) this._moveActor(bot, dt, { x: rand(-1, 1), y: rand(-1, 1) }, 8);
    }
  }

  botTryLoot(bot) {
    for (const loot of this.world.loot) {
      if (Math.hypot(loot.x - bot.mesh.position.x, loot.z - bot.mesh.position.z) < 1.9) {
        this.giveItem(bot, loot);
        this.scene.remove(loot.mesh);
        this.world.loot = this.world.loot.filter(l => l !== loot);
        if (loot.kind === "weapon") {
          const slot = bot.weaponSlots.findIndex(w => !w);
          bot.activeSlot = slot >= 0 ? slot : Math.floor(rand(0, 5));
        }
        break;
      }
    }
  }

  updateZone(dt) {
    this.zone.timer += dt;
    const phaseDur = 54;
    const t = Math.min(1, this.zone.timer / phaseDur);
    this.zone.radius = THREE.MathUtils.lerp(this.zone.radius, this.zone.targetRadius, t * 0.006);
    this.zone.center.lerp(this.zone.targetCenter, t * 0.004);
    if (this.zone.timer >= phaseDur) {
      this.zone.step += 1;
      this.zone.timer = 0;
      this.zone.targetRadius = Math.max(14, this.zone.radius * 0.66);
      this.zone.targetCenter = new THREE.Vector2(rand(-80, 80), rand(-80, 80));
      this.audio.zoneWarn();
    }

    for (const actor of [this.player, ...this.bots]) {
      if (!actor.alive || actor.isParachuting) continue;
      const d = Math.hypot(actor.mesh.position.x - this.zone.center.x, actor.mesh.position.z - this.zone.center.y);
      if (d > this.zone.radius) this.damageActor(actor, dt * 8.5, null);
    }
  }

  aliveCount() {
    return [this.player, ...this.bots].filter(a => a.alive).length;
  }

  updateCamera(dt) {
    const p = this.player.mesh.position;
    const forward = new THREE.Vector3(Math.sin(this.player.mesh.rotation.y), 0, Math.cos(this.player.mesh.rotation.y));
    const right = new THREE.Vector3(forward.z, 0, -forward.x);
    const aim = this.input.aimHeld;
    if (aim) {
      this.camera.position.lerp(new THREE.Vector3(p.x + right.x * 0.35 + forward.x * 0.4, p.y + 1.55, p.z + right.z * 0.35 + forward.z * 0.4), dt * 10);
      this.camera.lookAt(p.x + forward.x * 12, p.y + 1.45, p.z + forward.z * 12);
    } else {
      this.camera.position.lerp(new THREE.Vector3(p.x - forward.x * 6 + right.x * 2.1, p.y + 4.4, p.z - forward.z * 6 + right.z * 2.1), dt * 5.5);
      this.camera.lookAt(p.x + forward.x * 7, p.y + 1.1, p.z + forward.z * 7);
    }
  }

  drawMinimap() {
    const c = document.getElementById("miniMap");
    const ctx = c.getContext("2d");
    const s = c.width;
    ctx.fillStyle = "#9b8a6f"; ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = "#fff"; ctx.strokeRect(0, 0, s, s);
    const toMap = (x, z) => ({ x: (x / (MAP_RADIUS * 2) + 0.5) * s, y: (z / (MAP_RADIUS * 2) + 0.5) * s });

    const zc = toMap(this.zone.center.x, this.zone.center.y);
    ctx.strokeStyle = "#4ea3ff"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(zc.x, zc.y, this.zone.radius / (MAP_RADIUS * 2) * s, 0, Math.PI * 2); ctx.stroke();

    for (const bot of this.bots) {
      if (!bot.alive) continue;
      const p = toMap(bot.mesh.position.x, bot.mesh.position.z);
      ctx.fillStyle = "#d25353"; ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    }
    const pp = toMap(this.player.mesh.position.x, this.player.mesh.position.z);
    ctx.fillStyle = "#fff"; ctx.fillRect(pp.x - 3, pp.y - 3, 6, 6);
  }

  end(win, rank = 1) {
    this.running = false;
    this.ui.showEnd(win, rank);
  }

  loop() {
    requestAnimationFrame(() => this.loop());
    const dt = Math.min(0.05, this.clock.getDelta());
    if (!this.running || this.paused) { this.renderer.render(this.scene, this.camera); return; }

    this.matchTimer -= dt;
    this.updatePlayer(dt);
    for (const b of this.bots) this.botLogic(b, dt);
    this.updateZone(dt);
    this.updateCamera(dt);
    this.drawMinimap();

    const alive = this.aliveCount();
    this.ui.updateHUD(this.player, alive);

    if (alive <= 1 && this.player.alive) this.end(true, 1);
    if (this.matchTimer <= 0 && this.player.alive) this.end(this.player.alive, this.player.alive ? 1 : this.player.rank + 1);

    this.renderer.render(this.scene, this.camera);
  }
}

new Game();

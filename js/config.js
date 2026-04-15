export const MAP_RADIUS = 260;
export const START_BOT_COUNT = 24;
export const MATCH_SECONDS = 300;
export const GRAVITY = 30;

export const WEAPONS = {
  pistol: { id: "pistol", name: "Pistol", slotType: "sidearm", damage: 16, fireDelay: 0.29, mag: 12, reserve: 36, range: 65, spread: 0.045, reload: 1.2, color: 0x333333 },
  smg: { id: "smg", name: "SMG", slotType: "primary", damage: 11, fireDelay: 0.09, mag: 26, reserve: 90, range: 55, spread: 0.085, reload: 1.4, color: 0x464646 },
  rifle: { id: "rifle", name: "Rifle", slotType: "primary", damage: 20, fireDelay: 0.14, mag: 30, reserve: 90, range: 95, spread: 0.06, reload: 1.6, color: 0x525252 },
  shotgun: { id: "shotgun", name: "Shotgun", slotType: "primary", damage: 13, pellets: 6, fireDelay: 0.82, mag: 6, reserve: 24, range: 32, spread: 0.2, reload: 1.7, color: 0x5b4b3f },
  marksman: { id: "marksman", name: "Marksman", slotType: "primary", damage: 42, fireDelay: 0.9, mag: 5, reserve: 20, range: 130, spread: 0.02, reload: 2.1, color: 0x444f39 },
  hammer: { id: "hammer", name: "Hammer", slotType: "melee", damage: 35, fireDelay: 0.7, mag: 1, reserve: 0, range: 3.3, spread: 0, reload: 0, color: 0x6f5238 }
};

export const LOOT_TABLE = [
  { kind: "weapon", weaponId: "pistol", weight: 16 },
  { kind: "weapon", weaponId: "smg", weight: 15 },
  { kind: "weapon", weaponId: "rifle", weight: 13 },
  { kind: "weapon", weaponId: "shotgun", weight: 10 },
  { kind: "weapon", weaponId: "marksman", weight: 7 },
  { kind: "weapon", weaponId: "hammer", weight: 6 },
  { kind: "ammo", ammoType: "light", amount: 30, weight: 17 },
  { kind: "ammo", ammoType: "heavy", amount: 18, weight: 10 },
  { kind: "armor", amount: 25, weight: 9 },
  { kind: "bandage", amount: 1, weight: 13 }
];

export const AMMO_BY_WEAPON = {
  pistol: "light", smg: "light", shotgun: "shell", rifle: "heavy", marksman: "heavy", hammer: "none"
};

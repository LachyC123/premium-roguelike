# Dustfall Royale (GitHub Pages)

A mobile-first, original low-poly browser battle royale inspired by classic lightweight desert survival shooters. Built with **HTML + CSS + JavaScript + Three.js** only.

## Features

- Title screen + instant Play button
- Parachute match start for player and bots
- Third-person over-the-shoulder combat (aim button gives tighter camera)
- Desert map with hills, houses, sparse vegetation, and loot pickups
- Weapons: pistol, SMG, rifle, shotgun, marksman rifle, hammer
- Inventory panel with ground loot / backpack / equipped slots
- AI bots that roam, loot, chase, fight each other, and respect safe zone
- Shrinking safe circle + zone damage
- Alive counter, weapon slots, minimap, health/armor HUD, mobile circular controls
- Short match pacing (about 3–6 minutes)
- Lightweight synthesized placeholder audio (gun/reload/pickup/hit/zone warning)

## Project Structure

```
.
├── index.html
├── style.css
├── README.md
└── js/
    ├── main.js
    ├── config.js
    ├── input.js
    ├── ui.js
    └── audio.js
```

## Controls

### Mobile
- **Left joystick:** move
- **FIRE:** shoot
- **AIM:** tighter over-shoulder / pseudo first-person aim
- **JUMP:** jump
- **BAG:** open inventory panel
- **Weapon slots 1–5 (top-left):** switch weapon

### Desktop fallback
- Drag on canvas: rotate camera/aim direction
- Hold mouse on Fire button: shoot
- `1–5`: weapon slot
- `I`: inventory
- `R`: reload

## Run Locally

Because this uses ES modules, use a simple static server:

```bash
python3 -m http.server 8080
```

Then open: `http://localhost:8080`

## Deploy to GitHub Pages

1. Push files to your GitHub repository root (or `docs/` if preferred).
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select your branch (e.g. `main`) and folder:
   - `/ (root)` if files are in repo root, or
   - `/docs` if you moved project into docs.
5. Save and wait for Pages publish.
6. Open your Pages URL and play.

## Notes

- Everything is static and GitHub Pages compatible.
- No server/backend/build tooling required.
- All game names/assets are original and unbranded.

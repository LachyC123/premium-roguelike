# Neon Arena (Phase 1 Foundation)

Mobile-first 3D arena shooter foundation designed for GitHub Pages and fast iteration in Cursor.

## Tech Choice

- **Three.js (ES Modules via CDN)** for lightweight, browser-native 3D setup without build tooling.
- **Vanilla HTML/CSS/JS** for portability, readability, and easy deployment.

## Current Phase Scope

- Stylized compact 3D arena with cover blocks and clear boundaries.
- One controllable third-person hero.
- Dual touch controls:
  - left virtual stick = movement
  - right virtual stick = look/camera yaw
- Smooth third-person follow camera.
- Placeholder HUD with mode, timer, hero name, and health.

## Local Run

From repository root:

```bash
python3 -m http.server 8080
```

Then open:

- `http://localhost:8080`

## Deploy (GitHub Pages)

This project is static. Push to GitHub and enable Pages from the default branch root.

## Next Planned Phases

1. Shooting and impact feedback.
2. Teammate/enemy spawn framework (3v3).
3. AI behavior layer (objective-aware).
4. Hero swap system with polished camera transitions.
5. Objective mode systems (capture point / hill / rotating hardpoint).
6. UI polish, VFX, and game-feel improvements.

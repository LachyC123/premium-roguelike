import { clamp } from '../utils/math.js';

export class TouchInput {
  constructor({ moveZone, aimZone, moveStick, aimStick }) {
    this.state = {
      moveX: 0,
      moveY: 0,
      lookX: 0,
      lookY: 0,
    };

    this.maxRadius = 55;

    this.bindZone(moveZone, moveStick, 'move');
    this.bindZone(aimZone, aimStick, 'look');
  }

  bindZone(zone, stick, prefix) {
    const pointer = { id: null };

    const reset = () => {
      if (prefix === 'move') {
        this.state.moveX = 0;
        this.state.moveY = 0;
      } else {
        this.state.lookX = 0;
        this.state.lookY = 0;
      }
      stick.style.transform = 'translate(0px, 0px)';
      pointer.id = null;
    };

    const updateFromPoint = (clientX, clientY) => {
      const rect = zone.getBoundingClientRect();
      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * 0.5;
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const mag = Math.hypot(dx, dy) || 1;

      const clampedMag = Math.min(mag, this.maxRadius);
      const nx = dx / mag;
      const ny = dy / mag;

      const sx = nx * clampedMag;
      const sy = ny * clampedMag;

      stick.style.transform = `translate(${sx}px, ${sy}px)`;

      const normalizedX = clamp(sx / this.maxRadius, -1, 1);
      const normalizedY = clamp(sy / this.maxRadius, -1, 1);

      if (prefix === 'move') {
        this.state.moveX = normalizedX;
        this.state.moveY = normalizedY;
      } else {
        this.state.lookX = normalizedX;
        this.state.lookY = normalizedY;
      }
    };

    zone.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      if (pointer.id !== null) return;
      pointer.id = event.pointerId;
      zone.setPointerCapture(pointer.id);
      updateFromPoint(event.clientX, event.clientY);
    });

    zone.addEventListener('pointermove', (event) => {
      if (event.pointerId !== pointer.id) return;
      event.preventDefault();
      updateFromPoint(event.clientX, event.clientY);
    });

    zone.addEventListener('pointerup', (event) => {
      if (event.pointerId !== pointer.id) return;
      event.preventDefault();
      reset();
    });

    zone.addEventListener('pointercancel', (event) => {
      if (event.pointerId !== pointer.id) return;
      event.preventDefault();
      reset();
    });
  }
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function dampVector3(current, target, smoothFactor, deltaSec) {
  const t = 1 - Math.exp(-smoothFactor * deltaSec);
  current.lerp(target, t);
}

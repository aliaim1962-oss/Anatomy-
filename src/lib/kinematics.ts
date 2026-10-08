import type { Pathology } from './knee';

// UI teaching parameters, not clinical norms or patient-specific measurements.
export const DEMO_MAX = 135;
export const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
export function movementLimits(pathology: Pathology, restriction: number, contracture: number) {
  return pathology === 'contracture'
    ? { min: clamp(contracture, 5, 60), max: 110 }
    : { min: 0, max: clamp(restriction, 30, 120) };
}
export function actualAngle(requested: number, limits: { min: number; max: number }) {
  return clamp(requested, limits.min, limits.max);
}
export function advancePlayback(
  angle: number,
  direction: 1 | -1,
  dt: number,
  speed: number,
  min = 0,
  max = DEMO_MAX,
) {
  // Reflect overshoot at boundaries, including long frames, without frame-rate dependence.
  const width = max - min;
  if (width <= 0) return { angle: min, direction: 1 as const };
  const initial = clamp(angle, min, max) - min;
  const phase = direction === 1 ? initial : 2 * width - initial;
  const next = (phase + Math.max(0, dt) * 32 * speed) % (2 * width);
  return next < width
    ? { angle: min + next, direction: 1 as const }
    : { angle: min + 2 * width - next, direction: -1 as const };
}
export function tibialOffset(angle: number): [number, number, number] {
  // Geometry-specific clearance heuristic, not a physiological roll/slide law.
  // Keeps the schematic plateau below the ellipsoidal condyles' support plane.
  const r = (angle * Math.PI) / 180,
    c = Math.cos(r),
    s = Math.sin(r);
  const clearance = Math.hypot(0.43 * c, 0.55 * s) + 0.23 + 0.02;
  return [
    0,
    0.12 - clearance * c + 0.47 * c - 0.06 * s,
    -0.13 - clearance * s + 0.47 * s + 0.06 * c,
  ];
}
export function tibialPoint(
  point: [number, number, number],
  angle: number,
): [number, number, number] {
  const r = (angle * Math.PI) / 180;
  const offset = tibialOffset(angle);
  return [
    point[0],
    point[1] * Math.cos(r) - point[2] * Math.sin(r) + offset[1],
    point[1] * Math.sin(r) + point[2] * Math.cos(r) + offset[2],
  ];
}
export function patellaPoint(angle: number): [number, number, number] {
  const r = (angle * Math.PI) / 180;
  return [0, 0.2 - 0.7 * Math.sin(r * 0.65), 0.74 * Math.cos(r * 0.42)];
}

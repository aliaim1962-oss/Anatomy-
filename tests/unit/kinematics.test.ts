import { describe, expect, it } from 'vitest';
import {
  actualAngle,
  advancePlayback,
  clamp,
  movementLimits,
  patellaPoint,
  tibialPoint,
} from '../../src/lib/kinematics';

describe('educational motion constraints', () => {
  it('keeps reference extension at zero and limits restricted flexion', () => {
    const limits = movementLimits('restricted', 90, 25);
    expect(actualAngle(0, limits)).toBe(0);
    expect(actualAngle(65, limits)).toBe(65);
    expect(actualAngle(135, limits)).toBe(90);
  });
  it('preserves an extension deficit in the contracture model', () => {
    const limits = movementLimits('contracture', 90, 25);
    expect(actualAngle(0, limits)).toBe(25);
    expect(actualAngle(35, limits)).toBe(35);
    expect(actualAngle(135, limits)).toBe(110);
  });
  it('clamps configurable teaching parameters', () => {
    expect(movementLimits('restricted', 999, 0)).toEqual({ min: 0, max: 120 });
    expect(movementLimits('contracture', 0, -10)).toEqual({ min: 5, max: 110 });
    expect(clamp(NaN, 0, 135)).toBe(0);
    expect(clamp(Infinity, 0, 135)).toBe(0);
  });
});

describe('frame-independent playback', () => {
  it('reflects overshoot at maximum flexion', () => {
    expect(advancePlayback(134, 1, 0.1, 1)).toEqual({ angle: 132.8, direction: -1 });
  });
  it('reflects at extension without a negative angle', () => {
    const result = advancePlayback(1, -1, 0.1, 1);
    expect(result.angle).toBeCloseTo(2.2);
    expect(result.direction).toBe(1);
  });
  it('produces equivalent motion at different frame rates', () => {
    let state: { angle: number; direction: 1 | -1 } = { angle: 100, direction: 1 };
    for (let i = 0; i < 120; i++)
      state = advancePlayback(state.angle, state.direction, 1 / 60, 1.5);
    const single = advancePlayback(100, 1, 2, 1.5);
    expect(state.angle).toBeCloseTo(single.angle, 8);
    expect(state.direction).toBe(single.direction);
  });
  it('handles long frames and zero-width intervals', () => {
    const result = advancePlayback(30, -1, 600, 2);
    expect(result.angle).toBeGreaterThanOrEqual(0);
    expect(result.angle).toBeLessThanOrEqual(135);
    expect(advancePlayback(30, 1, 1, 1, 25, 25)).toEqual({ angle: 25, direction: 1 });
  });
  it('responds proportionately to speed controls', () => {
    expect(advancePlayback(0, 1, 1, 2).angle).toBe(64);
    expect(advancePlayback(0, 1, 1, 0.5).angle).toBe(16);
  });
});

describe('anatomically oriented schematic kinematics', () => {
  it('places the moving segment posteriorly during flexion', () => {
    const extended = tibialPoint([0, -2, 0], 0);
    expect(extended[1]).toBeLessThan(-2);
    const flexed = tibialPoint([0, -2, 0], 90);
    expect(flexed[1]).toBeCloseTo(0.06);
    expect(flexed[2]).toBeLessThan(-2);
  });
  it('maintains a schematic clearance plane across the motion interval', () => {
    for (const angle of [0, 30, 60, 90, 110, 135]) {
      const center = tibialPoint([0, -0.47, -0.06], angle);
      const r = (angle * Math.PI) / 180,
        c = Math.cos(r),
        s = Math.sin(r);
      const distance = (0.12 - center[1]) * c + (-0.13 - center[2]) * s;
      expect(distance - 0.23 - Math.hypot(0.43 * c, 0.55 * s)).toBeCloseTo(0.02);
    }
  });
  it('keeps the patella anterior and moves it inferiorly in the teaching path', () => {
    const start = patellaPoint(0),
      flexed = patellaPoint(135);
    expect(flexed[1]).toBeLessThan(start[1]);
    expect(flexed[2]).toBeGreaterThan(0);
    expect(flexed.every(Number.isFinite)).toBe(true);
  });
});

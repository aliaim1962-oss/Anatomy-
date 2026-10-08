import { beforeEach, describe, expect, it } from 'vitest';
import { useKneeStore } from '../../src/store/use-knee-store';

beforeEach(() => {
  useKneeStore.setState(useKneeStore.getInitialState(), true);
});

describe('knee interaction state', () => {
  it('does not advance while paused', () => {
    useKneeStore.getState().tick(1);
    expect(useKneeStore.getState().angle).toBe(35);
  });
  it('advances playback and pauses on manual angle changes', () => {
    useKneeStore.getState().togglePlay();
    useKneeStore.getState().tick(1);
    expect(useKneeStore.getState().angle).toBe(67);
    useKneeStore.getState().setAngle(100);
    expect(useKneeStore.getState().playing).toBe(false);
  });
  it('opens the selected structure layer and anatomy panel', () => {
    useKneeStore.getState().setTab('sources');
    useKneeStore.getState().select('hamstrings');
    expect(useKneeStore.getState().selected).toBe('hamstrings');
    expect(useKneeStore.getState().layers.muscles).toBe(true);
    expect(useKneeStore.getState().tab).toBe('anatomy');
  });
  it('switches modes without persisting incompatible static imports', () => {
    useKneeStore.getState().setModelUrl('blob:example');
    useKneeStore.getState().setMode('compare');
    expect(useKneeStore.getState().modelUrl).toBeNull();
    expect(useKneeStore.getState().tab).toBe('pathology');
  });
  it('resets movement without altering comparison parameters', () => {
    useKneeStore.getState().setContracture(40);
    useKneeStore.getState().resetMotion();
    expect(useKneeStore.getState().angle).toBe(0);
    expect(useKneeStore.getState().contracture).toBe(40);
  });
  it('toggles layer visibility independently', () => {
    useKneeStore.getState().toggleLayer('bones');
    expect(useKneeStore.getState().layers.bones).toBe(false);
    expect(useKneeStore.getState().layers.ligaments).toBe(true);
  });
});

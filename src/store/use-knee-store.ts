import { create } from 'zustand';
import { advancePlayback, clamp, DEMO_MAX } from '@/lib/kinematics';
import type { Layer, Locale, Mode, Pathology, StructureId, Tab } from '@/lib/knee';

export type CameraPose = {
  position: [number, number, number];
  target: [number, number, number];
  owner: string;
};
export const DEFAULT_CAMERA: CameraPose = {
  position: [7, 2.8, 10],
  target: [0, 0, 0],
  owner: 'preset',
};
type KneeState = {
  locale: Locale;
  mode: Mode;
  tab: Tab;
  angle: number;
  playing: boolean;
  speed: number;
  direction: 1 | -1;
  pathology: Pathology;
  restriction: number;
  contracture: number;
  selected: StructureId | null;
  layers: Record<Layer, boolean>;
  phase: number;
  camera: CameraPose;
  modelUrl: string | null;
  setLocale: (locale: Locale) => void;
  setMode: (mode: Mode) => void;
  setTab: (tab: Tab) => void;
  setAngle: (angle: number) => void;
  togglePlay: () => void;
  setSpeed: (speed: number) => void;
  tick: (dt: number) => void;
  setPathology: (pathology: Pathology) => void;
  setRestriction: (n: number) => void;
  setContracture: (n: number) => void;
  select: (id: StructureId | null) => void;
  toggleLayer: (id: Layer) => void;
  setPhase: (n: number) => void;
  setCamera: (pose: CameraPose) => void;
  setModelUrl: (url: string | null) => void;
  resetMotion: () => void;
};
export const useKneeStore = create<KneeState>((set, get) => ({
  locale: 'en',
  mode: 'explore',
  tab: 'anatomy',
  angle: 35,
  playing: false,
  speed: 1,
  direction: 1,
  pathology: 'restricted',
  restriction: 90,
  contracture: 25,
  selected: 'femur',
  layers: { bones: true, muscles: false, ligaments: true, labels: false, axis: false },
  phase: 0,
  camera: DEFAULT_CAMERA,
  modelUrl: null,
  setLocale: (locale) => set({ locale }),
  setMode: (mode) =>
    set({
      mode,
      playing: false,
      tab: mode === 'compare' ? 'pathology' : mode === 'rehab' ? 'rehabilitation' : 'anatomy',
      modelUrl: null,
    }),
  setTab: (tab) => set({ tab }),
  setAngle: (angle) => set({ angle: clamp(angle, 0, DEMO_MAX), playing: false }),
  togglePlay: () => set({ playing: !get().playing }),
  setSpeed: (speed) => set({ speed: clamp(speed, 0.25, 2) }),
  tick: (dt) => {
    const s = get();
    if (s.playing) set(advancePlayback(s.angle, s.direction, dt, s.speed));
  },
  setPathology: (pathology) => set({ pathology }),
  setRestriction: (restriction) => set({ restriction: clamp(restriction, 30, 120) }),
  setContracture: (contracture) => set({ contracture: clamp(contracture, 5, 60) }),
  select: (selected) =>
    set({
      selected,
      tab: 'anatomy',
      layers: selected
        ? {
            ...get().layers,
            [selected === 'quadriceps' || selected === 'hamstrings'
              ? 'muscles'
              : ['acl', 'pcl', 'mcl', 'lcl'].includes(selected)
                ? 'ligaments'
                : 'bones']: true,
          }
        : get().layers,
    }),
  toggleLayer: (id) => set({ layers: { ...get().layers, [id]: !get().layers[id] } }),
  setPhase: (phase) => set({ phase: clamp(phase, 0, 2), playing: false }),
  setCamera: (camera) => set({ camera }),
  setModelUrl: (modelUrl) => set({ modelUrl, playing: false }),
  resetMotion: () => set({ angle: 0, playing: false, direction: 1 }),
}));

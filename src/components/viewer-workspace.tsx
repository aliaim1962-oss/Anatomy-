'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  ChevronRight,
  CircleHelp,
  Expand,
  Link2,
  LoaderCircle,
  Move3D,
  Plus,
  Minus,
  RotateCcw,
  Upload,
  X,
  Info,
} from 'lucide-react';
import { dictionary } from '@/lib/i18n';
import { useKneeStore, DEFAULT_CAMERA } from '@/store/use-knee-store';
import { MovementControls } from './movement-controls';

const Viewer = dynamic(() => import('./viewer').then((m) => m.KneeViewer), {
  ssr: false,
  loading: () => (
    <div className="scene scene-loading">
      <LoaderCircle className="spin" size={25} />
    </div>
  ),
});

export function ViewerWorkspace() {
  const s = useKneeStore(
    useShallow((state) => ({
      locale: state.locale,
      mode: state.mode,
      modelUrl: state.modelUrl,
      camera: state.camera,
      layers: state.layers,
      direction: state.direction,
      playing: state.playing,
      setCamera: state.setCamera,
      setModelUrl: state.setModelUrl,
    })),
  );
  const t = dictionary(s.locale);
  const container = useRef<HTMLDivElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const [help, setHelp] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState(false);
  const [fullError, setFullError] = useState(false);
  const [view, setView] = useState('');
  const oldUrl = useRef<string | null>(null);
  useEffect(() => {
    if (oldUrl.current && oldUrl.current !== s.modelUrl) URL.revokeObjectURL(oldUrl.current);
    oldUrl.current = s.modelUrl;
  }, [s.modelUrl]);
  useEffect(
    () => () => {
      if (oldUrl.current) URL.revokeObjectURL(oldUrl.current);
    },
    [],
  );
  useEffect(() => {
    if (!help) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setHelp(false);
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [help]);
  const preset = (id: string) => {
    setView(id);
    s.setCamera({
      position: id === 'anterior' ? [0, 0.4, 12] : id === 'lateral' ? [12, 0.4, 0] : [0, 0.4, -12],
      target: [0, 0, 0],
      owner: 'preset',
    });
  };
  const zoom = (factor: number) => {
    const { position, target } = s.camera;
    const offset = position.map((value, i) => value - target[i]);
    const distance = Math.hypot(...offset);
    const next = Math.min(19, Math.max(5.5, distance * factor));
    s.setCamera({
      position: offset.map((value, i) => target[i] + (value * next) / distance) as [
        number,
        number,
        number,
      ],
      target,
      owner: 'preset',
    });
  };
  const importFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setImporting(true);
    setImportError(false);
    try {
      const { readModelFile } = await import('@/lib/model-import');
      const url = await readModelFile(selectedFile);
      s.setModelUrl(url);
    } catch {
      setImportError(true);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };
  return (
    <main className="main-workspace">
      <div className="workspace-heading">
        <div className="breadcrumb">
          {t.lowerLimb}
          <ChevronRight size={12} />
          {t.knee}
          <span className="module-number">01</span>
        </div>
        <div className="workspace-title">
          <div>
            <h1>
              {s.mode === 'explore'
                ? t.exploreTitle
                : s.mode === 'compare'
                  ? t.compareTitle
                  : t.rehabTitle}
            </h1>
            <p>
              {s.mode === 'explore'
                ? t.exploreSub
                : s.mode === 'compare'
                  ? t.compareSub
                  : t.rehabSub}
            </p>
          </div>
          <button
            className="icon-button"
            aria-label={t.help}
            title={t.help}
            onClick={() => setHelp(!help)}
          >
            <CircleHelp size={19} />
          </button>
        </div>
      </div>
      <div className="viewer-container" ref={container}>
        <div className="viewer-topline">
          <span>
            <span className="status-dot" />
            {s.modelUrl ? t.imported : t.original}
          </span>
          <div>
            {s.mode === 'compare' && (
              <span className="sync-label">
                <Link2 size={12} />
                {t.synchronized}
              </span>
            )}
            <button
              className="icon-button"
              title={t.fullscreen}
              aria-label={t.fullscreen}
              onClick={async () => {
                try {
                  if (document.fullscreenElement) await document.exitFullscreen();
                  else await container.current?.requestFullscreen();
                } catch {
                  setFullError(true);
                }
              }}
            >
              <Expand size={16} />
            </button>
          </div>
        </div>
        <div className={`viewers ${s.mode === 'compare' ? 'comparison-viewers' : ''}`}>
          <Viewer id="reference" />
          {s.mode === 'compare' && <Viewer id="pathology" comparison />}
        </div>
        <div className="viewer-tools">
          <button
            className="icon-button"
            title={t.zoomIn}
            aria-label={t.zoomIn}
            onClick={() => zoom(0.86)}
          >
            <Plus size={17} />
          </button>
          <button
            className="icon-button"
            title={t.zoomOut}
            aria-label={t.zoomOut}
            onClick={() => zoom(1.16)}
          >
            <Minus size={17} />
          </button>
          <span />
          <button
            className="icon-button"
            title={t.resetView}
            aria-label={t.resetView}
            onClick={() => {
              s.setCamera(DEFAULT_CAMERA);
              setView('');
            }}
          >
            <RotateCcw size={16} />
          </button>
        </div>
        {s.modelUrl && (
          <div className="imported-notice">
            <Info size={14} />
            {t.importedNote}
          </div>
        )}
        {importError && (
          <div className="import-error" role="alert">
            {t.importError}
            <button aria-label={t.dismiss} onClick={() => setImportError(false)}>
              <X size={15} />
            </button>
          </div>
        )}
        {fullError && (
          <div className="import-error" role="alert">
            {s.locale === 'en'
              ? 'Fullscreen is not available in this browser context.'
              : 'Полноэкранный режим недоступен в этом браузере.'}
            <button aria-label={t.dismiss} onClick={() => setFullError(false)}>
              <X size={15} />
            </button>
          </div>
        )}
        {help && (
          <div className="help-card" role="dialog" aria-label={t.help}>
            <div>
              <h3>{t.help}</h3>
              <button
                className="icon-button"
                aria-label={t.dismiss}
                onClick={() => setHelp(false)}
                autoFocus
              >
                <X size={17} />
              </button>
            </div>
            <p>{t.helpBody}</p>
          </div>
        )}
        <div className="viewer-bottomline">
          <div className="view-presets">
            {(['anterior', 'lateral', 'posterior'] as const).map((id) => (
              <button
                key={id}
                aria-pressed={view === id}
                className={view === id ? 'active' : ''}
                onClick={() => preset(id)}
              >
                {t[id]}
              </button>
            ))}
          </div>
          <input
            className="sr-only"
            ref={file}
            type="file"
            accept=".glb,.gltf"
            onChange={importFile}
            aria-label={t.import}
          />
          <button
            className="import-button"
            title={t.importHint}
            disabled={importing || s.mode === 'compare'}
            onClick={() => (s.modelUrl ? s.setModelUrl(null) : file.current?.click())}
          >
            {importing ? (
              <LoaderCircle className="spin" size={13} />
            ) : s.modelUrl ? (
              <X size={13} />
            ) : (
              <Upload size={13} />
            )}
            <span>{s.modelUrl ? t.removeModel : t.import}</span>
          </button>
        </div>
      </div>
      <div className="viewer-caption">
        <span>
          <Move3D size={12} />
          {t.drag}
          <i />
          {t.scroll}
          <i />
          {t.select}
        </span>
        <span>{t.modelNote}</span>
      </div>
      {s.layers.muscles && !s.modelUrl && (
        <div className="muscle-legend">
          <span className="layer-dot muscles" />
          {t.action}: {s.playing ? (s.direction === 1 ? t.flexors : t.extensors) : t.musclePaused}
        </div>
      )}
      <MovementControls />
    </main>
  );
}

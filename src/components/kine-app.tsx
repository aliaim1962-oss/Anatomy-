'use client';

import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Activity, Compass, GitCompareArrows, Stethoscope } from 'lucide-react';
import { dictionary } from '@/lib/i18n';
import type { Mode } from '@/lib/knee';
import { useKneeStore } from '@/store/use-knee-store';
import { Sidebar } from './sidebar';
import { DetailsPanel } from './education-panels';
import { ViewerWorkspace } from './viewer-workspace';

function usePlayback() {
  const playing = useKneeStore((s) => s.playing);
  useEffect(() => {
    if (!playing) return;
    let frame = 0,
      last = 0;
    const step = (now: number) => {
      if (last) useKneeStore.getState().tick(Math.min((now - last) / 1000, 0.1));
      last = now;
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [playing]);
}

export function KineApp() {
  const s = useKneeStore(
    useShallow((state) => ({
      locale: state.locale,
      mode: state.mode,
      setMode: state.setMode,
      setLocale: state.setLocale,
    })),
  );
  const t = dictionary(s.locale);
  usePlayback();
  useEffect(() => {
    document.documentElement.lang = s.locale;
  }, [s.locale]);
  const modes: { id: Mode; icon: typeof Compass; label: string }[] = [
    { id: 'explore', icon: Compass, label: t.explore },
    { id: 'compare', icon: GitCompareArrows, label: t.compare },
    { id: 'rehab', icon: Stethoscope, label: t.rehab },
  ];
  return (
    <div className="kine-app">
      <header className="app-header">
        <button className="brand" aria-label="KINE3D" onClick={() => s.setMode('explore')}>
          <span className="brand-icon">
            <Activity size={24} strokeWidth={1.8} />
          </span>
          <span className="brand-word">
            KINE<span>3D</span>
            <small>{t.tagline}</small>
          </span>
        </button>
        <nav className="mode-nav" aria-label={t.workspace}>
          {modes.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={s.mode === id ? 'active' : ''}
              onClick={() => s.setMode(id)}
              aria-pressed={s.mode === id}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="header-right">
          <span className="module-badge">
            <span className="status-dot" />
            {t.moduleLabel}
          </span>
          <div className="language-switch" role="group" aria-label={t.language}>
            {(['en', 'ru'] as const).map((locale) => (
              <button
                key={locale}
                className={s.locale === locale ? 'active' : ''}
                aria-pressed={s.locale === locale}
                onClick={() => s.setLocale(locale)}
              >
                {locale.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>
      <div className="workspace-layout">
        <Sidebar />
        <ViewerWorkspace />
        <DetailsPanel />
      </div>
      <footer className="app-footer">
        <span>
          <span className="status-dot" />
          KINE3D<span className="footer-separator">/</span>
          {t.footer}
        </span>
        <span>
          {t.sourceNote}
          <span className="footer-separator">·</span>v0.1
        </span>
      </footer>
    </div>
  );
}

'use client';

import { RotateCcw, Pause, Play, SlidersHorizontal } from 'lucide-react';
import { dictionary } from '@/lib/i18n';
import { DEMO_MAX } from '@/lib/kinematics';
import { useKneeStore } from '@/store/use-knee-store';

export function MovementControls() {
  const s = useKneeStore();
  const t = dictionary(s.locale);
  return (
    <section className="movement-controls" aria-label={t.motion}>
      <div className="motion-top">
        <div>
          <span className="eyebrow">{t.motion}</span>
          <h3>
            {t.flexion}
            <span>{t.interval}</span>
          </h3>
        </div>
        <div className="angle-readout">
          <input
            type="number"
            min={0}
            max={DEMO_MAX}
            step={0.5}
            value={Number(s.angle.toFixed(1))}
            onChange={(e) => s.setAngle(Number(e.target.value))}
            aria-label={t.inputAngle}
            disabled={!!s.modelUrl}
          />
          <span>°</span>
        </div>
      </div>
      <div className="motion-bottom">
        <button
          className={`play-button ${s.playing ? 'playing' : ''}`}
          aria-label={s.playing ? t.pause : t.play}
          onClick={s.togglePlay}
          disabled={!!s.modelUrl}
        >
          {s.playing ? (
            <Pause size={18} fill="currentColor" />
          ) : (
            <Play size={18} fill="currentColor" />
          )}
        </button>
        <div className="angle-slider">
          <input
            style={{ '--range-progress': `${(s.angle / DEMO_MAX) * 100}%` } as React.CSSProperties}
            type="range"
            min={0}
            max={DEMO_MAX}
            step={0.5}
            value={s.angle}
            onChange={(e) => s.setAngle(Number(e.target.value))}
            aria-label={t.angle}
            disabled={!!s.modelUrl}
          />
          <div className="slider-ticks">
            <span>0°</span>
            <span>45°</span>
            <span>90°</span>
            <span>135°</span>
          </div>
        </div>
        <div className="playback-speed">
          <label htmlFor="speed">
            <SlidersHorizontal size={14} />
            <span>{t.speed}</span>
          </label>
          <select
            id="speed"
            aria-label={t.speed}
            value={s.speed}
            onChange={(e) => s.setSpeed(Number(e.target.value))}
            disabled={!!s.modelUrl}
          >
            {[0.25, 0.5, 1, 1.5, 2].map((speed) => (
              <option key={speed} value={speed}>
                {speed}×
              </option>
            ))}
          </select>
        </div>
        <button
          className="icon-button motion-reset"
          title={t.reset}
          aria-label={t.reset}
          onClick={s.resetMotion}
          disabled={!!s.modelUrl}
        >
          <RotateCcw size={17} />
        </button>
      </div>
    </section>
  );
}

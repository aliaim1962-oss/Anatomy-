'use client';

import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  Activity,
  ChevronDown,
  ChevronRight,
  Move3D,
  Focus,
  Eye,
  EyeOff,
  Search,
  Layers3,
  X,
} from 'lucide-react';
import { dictionary } from '@/lib/i18n';
import { structures, type Layer } from '@/lib/knee';
import { useKneeStore } from '@/store/use-knee-store';

export function Sidebar() {
  const s = useKneeStore(
    useShallow((state) => ({
      locale: state.locale,
      selected: state.selected,
      layers: state.layers,
      modelUrl: state.modelUrl,
      select: state.select,
      toggleLayer: state.toggleLayer,
      setMode: state.setMode,
      setModelUrl: state.setModelUrl,
    })),
  );
  const t = dictionary(s.locale);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(true);
  const matches = structures.filter((item) =>
    `${item.name.en} ${item.name.ru} ${item.id}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <span className="eyebrow">{t.workspace}</span>
        <span className="workspace-dot" />
      </div>
      <section className="region-section">
        <h2 className="section-label">{t.region}</h2>
        <button
          className="region-button"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          <Move3D size={18} />
          {t.lowerLimb}
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {expanded && (
          <button
            className="joint-button"
            onClick={() => {
              s.setMode('explore');
              setQuery('');
            }}
          >
            <span className="tree-line" />
            <span className="status-dot" />
            {t.knee}
            <span className="tiny-tag">3D</span>
          </button>
        )}
      </section>
      <section className="structure-section">
        <h2 className="section-label">
          {t.structures}
          <span>{structures.length.toString().padStart(2, '0')}</span>
        </h2>
        <label className="search-box">
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search}
            aria-label={t.search}
          />
          {query && (
            <button aria-label={t.reset} onClick={() => setQuery('')}>
              <X size={12} />
            </button>
          )}
        </label>
        <div className="structure-list">
          {(['bones', 'muscles', 'ligaments'] as Layer[]).map((layer) => {
            const items = matches.filter((i) => i.layer === layer);
            return (
              items.length > 0 && (
                <div className="structure-group" key={layer}>
                  <div className="group-label">
                    <span className={`layer-dot ${layer}`} />
                    {t[layer]}
                    <span>{items.length}</span>
                  </div>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      className={`structure-button ${s.selected === item.id ? 'selected' : ''}`}
                      onClick={() => {
                        if (s.modelUrl) s.setModelUrl(null);
                        s.select(item.id);
                      }}
                      aria-pressed={s.selected === item.id}
                    >
                      <span>{item.name[s.locale]}</span>
                      {s.selected === item.id ? <Focus size={14} /> : <ChevronRight size={12} />}
                    </button>
                  ))}
                </div>
              )
            );
          })}
          {!matches.length && <p className="no-results">{t.noResults}</p>}
        </div>
      </section>
      <section className="layers-section">
        <h2 className="section-label">
          {t.layers}
          <Layers3 size={13} />
        </h2>
        {(['bones', 'muscles', 'ligaments', 'labels', 'axis'] as Layer[]).map((layer) => (
          <button
            key={layer}
            className="layer-toggle"
            disabled={!!s.modelUrl}
            onClick={() => s.toggleLayer(layer)}
            role="switch"
            aria-checked={s.layers[layer]}
            aria-label={t[layer]}
          >
            <span>
              {s.layers[layer] ? <Eye size={15} /> : <EyeOff size={15} />}
              {t[layer]}
            </span>
            <span className={`switch-track ${s.layers[layer] ? 'on' : ''}`}>
              <i />
            </span>
          </button>
        ))}
      </section>
      <div className="sidebar-learning">
        <div className="learning-icon">
          <Activity size={20} />
        </div>
        <h3>{t.learnTitle}</h3>
        <p>{t.learnBody}</p>
        <span>
          KINE3D <span>LEARNING LAB</span>
        </span>
      </div>
    </aside>
  );
}

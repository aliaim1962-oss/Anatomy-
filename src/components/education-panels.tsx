'use client';

import { useShallow } from 'zustand/react/shallow';
import {
  Activity,
  ArrowRight,
  Bone,
  BookOpen,
  Check,
  GitCompareArrows,
  Info,
  Pause,
  Play,
  ShieldCheck,
  Stethoscope,
  AlertTriangle,
} from 'lucide-react';
import { dictionary } from '@/lib/i18n';
import { actualAngle, movementLimits } from '@/lib/kinematics';
import { biomechanics, rehabPhases, sources, structures, type Tab } from '@/lib/knee';
import { useKneeStore } from '@/store/use-knee-store';

function SourceLink({ source = 'kapandji' }: { source?: string }) {
  const locale = useKneeStore((s) => s.locale);
  const setTab = useKneeStore((s) => s.setTab);
  const t = dictionary(locale);
  return (
    <button className="source-link" onClick={() => setTab('sources')} aria-label={t.sourceButton}>
      <BookOpen size={13} />
      <span>{source === 'maxey' ? 'Maxey & Magnusson' : 'Kapandji · Vol. 2'}</span>
      <ArrowRight size={13} />
    </button>
  );
}

function AnatomyPanel() {
  const locale = useKneeStore((s) => s.locale);
  const selected = useKneeStore((s) => s.selected);
  const t = dictionary(locale);
  const item = structures.find((i) => i.id === selected);
  if (!item) return <p>{t.emptySelection}</p>;
  return (
    <>
      <span className="eyebrow">{t.structure}</span>
      <div className="structure-heading">
        <div className={`anatomy-symbol ${item.layer}`}>
          <Bone size={28} strokeWidth={1.3} />
        </div>
        <div>
          <span className="micro-tag">{t[item.layer]}</span>
          <h2>{item.name[locale]}</h2>
        </div>
      </div>
      <p className="panel-description">{item.description[locale]}</p>
      <div className="function-card">
        <span className="eyebrow">
          <Activity size={13} />
          {t.function}
        </span>
        <p>{item.function[locale]}</p>
      </div>
      <SourceLink source={item.source} />
      <div className="panel-divider" />
      <h3 className="small-heading">{t.physiology}</h3>
      <KinematicsDiagram />
      <p className="muted-note">{t.axisDescription}</p>
      <div className="note-card">
        <Info size={15} />
        <div>
          <h4>{t.limitationTitle}</h4>
          <p>{t.limitationBody}</p>
        </div>
      </div>
    </>
  );
}

function KinematicsDiagram() {
  const angle = useKneeStore((s) => s.angle);
  const locale = useKneeStore((s) => s.locale);
  const t = dictionary(locale);
  return (
    <div className="kinematics-diagram">
      <svg viewBox="0 0 240 140" role="img" aria-label={`${t.flexion}: ${angle.toFixed(1)}°`}>
        <defs>
          <pattern id="diagram-grid" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.7" fill="#293441" />
          </pattern>
        </defs>
        <rect width="240" height="140" fill="url(#diagram-grid)" />
        <line
          x1="118"
          y1="22"
          x2="118"
          y2="72"
          stroke="#788995"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <line
          x1="118"
          y1="72"
          x2="118"
          y2="123"
          stroke="#34444f"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray="4 5"
        />
        <g transform={`rotate(${angle} 118 72)`}>
          <line
            x1="118"
            y1="72"
            x2="118"
            y2="123"
            stroke="#60d7ca"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </g>
        <circle cx="118" cy="72" r="8" fill="#17282d" stroke="#78e4d6" strokeWidth="2" />
        <path
          d="M118 103 A31 31 0 0 1 88 79"
          fill="none"
          stroke="#4dafa8"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <text x="172" y="83" fill="#74dcd0" fontFamily="monospace" fontSize="15">
          {angle.toFixed(0)}°
        </text>
      </svg>
    </div>
  );
}

function BiomechanicsPanel() {
  const locale = useKneeStore((s) => s.locale);
  const t = dictionary(locale);
  return (
    <>
      <span className="eyebrow">{t.biomechanics}</span>
      <h2>{t.biomechanicsHeading}</h2>
      <KinematicsDiagram />
      {biomechanics.map((item, i) => (
        <article className="education-article" key={i}>
          <span className="article-number">0{i + 1}</span>
          <h3>{item.title[locale]}</h3>
          <p>{item.body[locale]}</p>
        </article>
      ))}
      <SourceLink />
    </>
  );
}

function PathologyPanel() {
  const s = useKneeStore();
  const t = dictionary(s.locale);
  const limits = movementLimits(s.pathology, s.restriction, s.contracture);
  const shown = actualAngle(s.angle, limits);
  return (
    <>
      <span className="eyebrow">{t.pathology}</span>
      <h2>{t.pathologyHeading}</h2>
      <p className="panel-description">{t.pathologyBody}</p>
      <div className="pathology-selector">
        {(['restricted', 'contracture'] as const).map((id) => (
          <button
            key={id}
            onClick={() => {
              s.setPathology(id);
              if (s.mode !== 'compare') s.setMode('compare');
            }}
            aria-pressed={s.pathology === id}
            className={s.pathology === id ? 'active' : ''}
          >
            <span className="pathology-radio">{s.pathology === id && <i />}</span>
            {t[id]}
          </button>
        ))}
      </div>
      <p className="panel-description">
        {s.pathology === 'restricted' ? t.restrictedBody : t.contractureBody}
      </p>
      <div className="parameter-card">
        <span className="eyebrow">{t.parameters}</span>
        <div className="parameter-heading">
          <label htmlFor="pathology-limit">
            {s.pathology === 'restricted' ? t.flexionCeiling : t.extensionDeficit}
          </label>
          <strong>{s.pathology === 'restricted' ? s.restriction : s.contracture}°</strong>
        </div>
        <input
          id="pathology-limit"
          aria-label={s.pathology === 'restricted' ? t.flexionCeiling : t.extensionDeficit}
          type="range"
          min={s.pathology === 'restricted' ? 30 : 5}
          max={s.pathology === 'restricted' ? 120 : 60}
          value={s.pathology === 'restricted' ? s.restriction : s.contracture}
          onChange={(e) =>
            s.pathology === 'restricted'
              ? s.setRestriction(Number(e.target.value))
              : s.setContracture(Number(e.target.value))
          }
        />
        <div className="parameter-range">
          <span>{s.pathology === 'restricted' ? '30°' : '5°'}</span>
          <span>{s.pathology === 'restricted' ? '120°' : '60°'}</span>
        </div>
      </div>
      <div className="comparison-stats">
        <div>
          <span>{t.requested}</span>
          <strong>{s.angle.toFixed(1)}°</strong>
        </div>
        <div>
          <span>{t.actual}</span>
          <strong className="amber-text">{shown.toFixed(1)}°</strong>
        </div>
        <div>
          <span>{t.deficit}</span>
          <strong>{Math.abs(s.angle - shown).toFixed(1)}°</strong>
        </div>
      </div>
      <SourceLink />
    </>
  );
}

function RehabilitationPanel() {
  const s = useKneeStore(
    useShallow((state) => ({
      locale: state.locale,
      phase: state.phase,
      playing: state.playing,
      mode: state.mode,
      setPhase: state.setPhase,
      setMode: state.setMode,
      togglePlay: state.togglePlay,
    })),
  );
  const t = dictionary(s.locale);
  const phase = rehabPhases[s.phase];
  return (
    <>
      <span className="eyebrow">{t.rehabilitation}</span>
      <h2>{t.rehabHeading}</h2>
      <p className="panel-description">{t.rehabIntro}</p>
      <div className="phase-list">
        {rehabPhases.map((phase, i) => (
          <button
            key={phase.id}
            className={`phase-button ${s.phase === i ? 'active' : ''}`}
            onClick={() => {
              s.setPhase(i);
              if (s.mode !== 'rehab') s.setMode('rehab');
            }}
            aria-pressed={s.phase === i}
          >
            <span className="phase-number">{i + 1}</span>
            <span>
              <strong>{phase.title[s.locale]}</strong>
              <small>{phase.subtitle[s.locale]}</small>
            </span>
            {s.phase === i && <Check size={14} />}
          </button>
        ))}
      </div>
      <article className="phase-detail">
        <span className="eyebrow">
          {t.phase} 0{s.phase + 1}
        </span>
        <h3>{phase.title[s.locale]}</h3>
        <p>{phase.body[s.locale]}</p>
        <div className="phase-focus">
          <span>{t.focus}</span>
          <p>{phase.focus[s.locale]}</p>
        </div>
      </article>
      <button
        className="secondary-button demo-button"
        onClick={() => {
          if (s.mode !== 'rehab') s.setMode('rehab');
          s.togglePlay();
        }}
      >
        {s.playing ? <Pause size={14} /> : <Play size={14} />}
        {s.playing ? t.pauseDemo : t.demonstrate}
      </button>
      <div className="note-card amber-note">
        <ShieldCheck size={17} />
        <div>
          <h4>{t.precautionTitle}</h4>
          <p>{t.precautionBody}</p>
        </div>
      </div>
      <SourceLink source="maxey" />
    </>
  );
}

function SourcesPanel() {
  const locale = useKneeStore((s) => s.locale);
  const t = dictionary(locale);
  return (
    <>
      <span className="eyebrow">{t.sources}</span>
      <h2>{t.verification}</h2>
      <div className="verification-notice">
        <AlertTriangle size={19} />
        <span>{t.sourceStatus}</span>
      </div>
      <p className="panel-description">{t.verificationBody}</p>
      {sources.map((source) => (
        <article className="source-card" key={source.id}>
          <BookOpen size={19} />
          <span className="source-author">{source.author}</span>
          <h3>{source.title[locale]}</h3>
          <p>{source.scope[locale]}</p>
          <span className="pending-status">{t.sourceStatus}</span>
        </article>
      ))}
      <p className="muted-note">{t.claims}</p>
    </>
  );
}

export function DetailsPanel() {
  const s = useKneeStore(
    useShallow((state) => ({ locale: state.locale, tab: state.tab, setTab: state.setTab })),
  );
  const t = dictionary(s.locale);
  const tabs: { id: Tab; icon: typeof Bone }[] = [
    { id: 'anatomy', icon: Bone },
    { id: 'biomechanics', icon: Activity },
    { id: 'pathology', icon: GitCompareArrows },
    { id: 'rehabilitation', icon: Stethoscope },
    { id: 'sources', icon: BookOpen },
  ];
  return (
    <aside className="details-panel">
      <div className="details-header">
        <BookOpen size={16} />
        <span>{t[s.tab]}</span>
        <span className="tiny-tag">LEARN</span>
      </div>
      <div className="details-tabs" role="tablist" aria-label={t.workspace}>
        {tabs.map(({ id, icon: Icon }) => (
          <button
            key={id}
            title={t[id]}
            role="tab"
            aria-selected={s.tab === id}
            aria-controls="education-panel"
            aria-label={t[id]}
            className={s.tab === id ? 'active' : ''}
            onClick={() => s.setTab(id)}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>
      <div id="education-panel" className="details-content" role="tabpanel" aria-label={t[s.tab]}>
        {s.tab === 'anatomy' ? (
          <AnatomyPanel />
        ) : s.tab === 'biomechanics' ? (
          <BiomechanicsPanel />
        ) : s.tab === 'pathology' ? (
          <PathologyPanel />
        ) : s.tab === 'rehabilitation' ? (
          <RehabilitationPanel />
        ) : (
          <SourcesPanel />
        )}
      </div>
      <button className="verification-footer" onClick={() => s.setTab('sources')}>
        <Info size={13} />
        {t.sourceNote}
        <ArrowRight size={12} />
      </button>
    </aside>
  );
}

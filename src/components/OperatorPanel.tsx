import type { RefObject } from 'react';
import { DECK, POSITIONS, STAGES, STAGE_LABELS, type CardId, type StageId } from '../content';
import type { Sensed } from '../logic/reading';

export type Pace = 'Calm' | 'Normal' | 'Quick';

export interface OperatorSettings {
  /** Speed of the word-by-word reveal and delayed elements. */
  pace: Pace;
  /** Show the "How did you know?" reveal after the reading. */
  showReveal: boolean;
  /** Show the A2 explanatory notes on screen (for markers / demos). */
  showNotes: boolean;
}

const SLIDERS: { key: keyof Sensed; label: string; unit: string; min: number; max: number }[] = [
  { key: 'glances', label: 'Glances away', unit: '/min', min: 0, max: 10 },
  { key: 'pace', label: 'Speaking pace', unit: 'wpm', min: 90, max: 190 },
  { key: 'volume', label: 'Volume', unit: 'dB', min: 45, max: 75 },
  { key: 'companions', label: 'Others in frame', unit: '', min: 0, max: 4 },
];

interface Props {
  stage: StageId;
  drawIdx: number;
  name: string;
  onName: (n: string) => void;
  sensed: Sensed;
  onSensed: (key: keyof Sensed, value: number) => void;
  cards: (CardId | null)[];
  onSetCard: (slot: number, id: CardId | null) => void;
  onRandomCard: (slot: number) => void;
  onJump: (stage: StageId) => void;
  onReset: () => void;
  onPersonDetected: () => void;
  settings: OperatorSettings;
  onSettings: (patch: Partial<OperatorSettings>) => void;
  webcam: { on: boolean; error: string; toggle: () => void; videoRef: RefObject<HTMLVideoElement> };
}

/**
 * Hidden control panel (press O). In A2 a teammate fakes all sensing from here
 * ("Wizard of Oz"). In A3 it stays as the fallback when a model misbehaves.
 */
export function OperatorPanel(p: Props) {
  return (
    <aside className="operator" aria-label="Operator panel">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: '#f3ece4' }}>Operator</span>
        <span className="muted" style={{ fontWeight: 300 }}>
          Hidden from visitors. Press O.
        </span>
      </div>

      <div className="op-section">
        <span className="op-heading">Person camera</span>
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 10',
            borderRadius: 12,
            overflow: 'hidden',
            background: '#000',
            border: '1px solid rgba(243,236,228,0.1)',
            display: p.webcam.on ? 'block' : 'none',
          }}
        >
          <video
            ref={p.webcam.videoRef}
            autoPlay
            muted
            playsInline
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
          />
        </div>
        <button type="button" className="op-btn solid" onClick={p.onPersonDetected}>
          Person detected → start
        </button>
        <button type="button" className="op-btn" onClick={p.webcam.toggle}>
          {p.webcam.on ? 'Turn webcam off' : 'Show live webcam'}
        </button>
        {p.webcam.error && <span style={{ color: '#e59a8a' }}>{p.webcam.error}</span>}
        <input className="op-field" value={p.name} onChange={(e) => p.onName(e.target.value)} placeholder="Name heard" />
      </div>

      <div className="op-section" style={{ gap: 12 }}>
        <span className="op-heading">Sensed values</span>
        {SLIDERS.map((s) => (
          <label key={s.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{s.label}</span>
              <span style={{ color: '#f3ece4' }}>
                {p.sensed[s.key]} {s.unit}
              </span>
            </span>
            <input
              type="range"
              min={s.min}
              max={s.max}
              value={p.sensed[s.key]}
              onChange={(e) => p.onSensed(s.key, +e.target.value)}
            />
          </label>
        ))}
      </div>

      <div className="op-section" style={{ gap: 10 }}>
        <span className="op-heading">Table camera</span>
        {POSITIONS.map((pos, i) => {
          const usedElsewhere = new Set(p.cards.filter((c, j) => c && j !== i));
          const current = p.stage === 'draw' && i === p.drawIdx;
          return (
            <div key={pos} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ width: 62, flexShrink: 0, color: current ? '#e39a6f' : '#c9c1b9' }}>{pos}</span>
              <select
                className="op-select"
                value={p.cards[i] ?? ''}
                onChange={(e) => p.onSetCard(i, e.target.value || null)}
                aria-label={`${pos} card`}
              >
                <option value="">none</option>
                {DECK.map((d) => (
                  <option key={d.id} value={d.id} disabled={usedElsewhere.has(d.id)}>
                    {d.label}
                  </option>
                ))}
              </select>
              <button type="button" className="op-pill" style={{ fontSize: 11, padding: '8px 9px', borderRadius: 10 }} onClick={() => p.onRandomCard(i)}>
                rnd
              </button>
            </div>
          );
        })}
      </div>

      <div className="op-section">
        <span className="op-heading">Jump to</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {STAGES.map((s, i) => (
            <button key={s} type="button" className="op-pill" onClick={() => p.onJump(s)}>
              {STAGE_LABELS[i]}
            </button>
          ))}
        </div>
        <button type="button" className="op-btn danger" onClick={p.onReset}>
          Reset session
        </button>
      </div>

      <div className="op-section">
        <span className="op-heading">Experience</span>
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span>Reading pace</span>
          <select
            className="op-select"
            style={{ flex: '0 0 auto' }}
            value={p.settings.pace}
            onChange={(e) => p.onSettings({ pace: e.target.value as Pace })}
          >
            <option>Calm</option>
            <option>Normal</option>
            <option>Quick</option>
          </select>
        </label>
        <label className="op-check">
          <input type="checkbox" checked={p.settings.showReveal} onChange={(e) => p.onSettings({ showReveal: e.target.checked })} />
          Show the reveal (“How did you know?”)
        </label>
        <label className="op-check">
          <input type="checkbox" checked={p.settings.showNotes} onChange={(e) => p.onSettings({ showNotes: e.target.checked })} />
          Show A2 notes on screen
        </label>
      </div>
    </aside>
  );
}

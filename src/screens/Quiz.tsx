import { QUESTIONS } from '../content';

const SCALE = [
  { value: 1, label: 'Strongly disagree', size: 72, color: '#b6a6e6' },
  { value: 2, label: 'Disagree', size: 56, color: '#b6a6e6' },
  { value: 3, label: 'Neutral', size: 42, color: '#9a948f' },
  { value: 4, label: 'Agree', size: 56, color: '#e39a6f' },
  { value: 5, label: 'Strongly agree', size: 72, color: '#e39a6f' },
];

interface Props {
  qi: number;
  name: string;
  selected: number | null;
  onAnswer: (v: number) => void;
  showNotes: boolean;
}

export function Quiz({ qi, name, selected, onAnswer, showNotes }: Props) {
  const nm = name.trim();
  return (
    <div className="stack">
      <span data-rise className="eyebrow">
        {(nm ? `${nm} · ` : '') + `${qi + 1} / 8`}
      </span>
      <h2
        data-rise
        className="display balance"
        style={{ margin: '22px 0 0', fontSize: 'clamp(38px,4.4vw,62px)', lineHeight: 1.12, maxWidth: '17em' }}
      >
        {QUESTIONS[qi]}
      </h2>
      <div
        data-rise
        style={{ marginTop: 64, width: '100%', maxWidth: 660, display: 'flex', flexDirection: 'column', gap: 18 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {SCALE.map((s) => {
            const on = selected === s.value;
            return (
              <button
                key={s.value}
                type="button"
                aria-label={s.label}
                aria-pressed={on}
                className={'answer' + (on ? ' selected' : '')}
                onClick={() => onAnswer(s.value)}
                style={{
                  width: s.size,
                  height: s.size,
                  border: `1.5px solid ${s.color}`,
                  background: on ? s.color : 'transparent',
                }}
              />
            );
          })}
        </div>
        <div className="muted" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
          <span>Disagree</span>
          <span>Agree</span>
        </div>
      </div>
      {showNotes && (
        <p className="note" style={{ margin: '40px 0 0', maxWidth: '38em', lineHeight: 1.5 }}>
          A2 note: keys 1–5 answer. Q5–8 choose the archetype. Q1–4 are compared with what the sensors measured.
        </p>
      )}
    </div>
  );
}

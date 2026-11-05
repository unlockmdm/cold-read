import { PrimaryButton } from '../components/Buttons';
import { ARCHETYPES } from '../content';
import type { RevealRow } from '../logic/reading';

const EASE = 'cubic-bezier(.2,.7,.2,1)';
const pct = (n: number) => `${((n - 1) / 4) * 100}%`;

/* ------------------------------------------------------------------ */
/* Step 1: "How I read you" — what you said vs. what I saw             */
/* ------------------------------------------------------------------ */

export function RevealCompare({
  name,
  rows,
  animate,
  onNext,
}: {
  name: string;
  rows: RevealRow[];
  /** false on enter, true 450ms later so the dots glide from the centre. */
  animate: boolean;
  onNext: () => void;
}) {
  const nm = name.trim();
  return (
    <div className="stack">
      <span data-rise className="eyebrow">
        Behind the curtain
      </span>
      <h2 data-rise className="display" style={{ margin: '16px 0 0', fontSize: 'clamp(48px,6vw,84px)', lineHeight: 1 }}>
        How I read you
      </h2>
      <p data-rise className="muted" style={{ margin: '16px 0 0', fontSize: 19 }}>
        {nm ? `What you told me, ${nm}, and what I saw.` : 'What you told me, and what I saw.'}
      </p>

      <div
        data-rise
        style={{ marginTop: 52, width: '100%', maxWidth: 880, display: 'flex', flexDirection: 'column', gap: 30, textAlign: 'left' }}
      >
        <div className="reveal-grid reveal-legend muted" style={{ fontSize: 13 }}>
          <span />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Low</span>
            <span style={{ display: 'flex', gap: 18 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'block', width: 9, height: 9, borderRadius: '50%', background: '#f3ece4' }} />
                You said
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{ display: 'block', width: 9, height: 9, borderRadius: '50%', background: '#e39a6f', boxShadow: '0 0 10px #e39a6f' }}
                />
                I saw
              </span>
            </span>
            <span>High</span>
          </div>
          <span />
        </div>

        {rows.map((r, i) => {
          const me = r.measured;
          const lo = me == null ? r.answer : Math.min(r.answer, me);
          const hi = me == null ? r.answer : Math.max(r.answer, me);
          const delay = `${i * 0.12}s`;
          const shown = animate && me != null;
          const vColor = r.verdict === 'Agrees' ? '#bcd6c2' : r.verdict === 'Disagrees' ? '#f0b28f' : '#9a948f';
          return (
            <div key={r.trait} className="reveal-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span className="display" style={{ fontSize: 28, lineHeight: 1.1 }}>
                  {r.trait}
                </span>
                <span className="muted" style={{ fontSize: 13 }}>
                  {r.caption}
                </span>
              </div>
              <div style={{ position: 'relative', height: 40 }}>
                <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: 'rgba(243,236,228,0.14)' }} />
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '50%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    transform: 'translateY(-50%)',
                  }}
                >
                  {[0, 1, 2, 3, 4].map((t) => (
                    <span key={t} style={{ display: 'block', width: 1, height: 8, background: 'rgba(243,236,228,0.2)' }} />
                  ))}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    height: 2,
                    marginTop: -1,
                    borderRadius: 2,
                    transition: `left 1.3s ${EASE}, width 1.3s ${EASE}`,
                    transitionDelay: delay,
                    left: shown ? pct(lo) : '50%',
                    width: shown ? `${((hi - lo) / 4) * 100}%` : '0%',
                    background: me != null && Math.abs(me - r.answer) > 1 ? 'rgba(240,178,143,0.7)' : 'rgba(188,214,194,0.6)',
                  }}
                />
                <div
                  className="track-dot"
                  aria-label={`You said ${r.answer} of 5`}
                  style={{ background: '#f3ece4', transitionDelay: delay, left: animate ? pct(r.answer) : '50%', opacity: animate ? 1 : 0 }}
                />
                <div
                  className="track-dot"
                  aria-label={me != null ? `I measured ${me} of 5` : undefined}
                  style={{
                    background: '#e39a6f',
                    boxShadow: '0 0 16px #e39a6f',
                    transitionDelay: delay,
                    left: shown ? pct(me) : '50%',
                    opacity: shown ? 1 : 0,
                  }}
                />
              </div>
              <span style={{ justifySelf: 'end', fontSize: 14, fontWeight: 400, color: vColor }}>{r.verdict}</span>
            </div>
          );
        })}

        <p className="muted" style={{ margin: '6px 0 0', fontSize: 15, lineHeight: 1.5, textAlign: 'center' }}>
          Appearance, feelings and planning were never measured. I took your word for those.
        </p>
      </div>

      <div data-rise style={{ marginTop: 44 }}>
        <PrimaryButton onClick={onNext}>And my type?</PrimaryButton>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2: "Four answers chose your type"                              */
/* ------------------------------------------------------------------ */

export function RevealType({
  name,
  scores,
  best,
  animate,
  onFinish,
}: {
  name: string;
  scores: number[];
  best: number;
  animate: boolean;
  onFinish: () => void;
}) {
  const nm = name.trim();
  return (
    <div className="stack">
      <h2
        data-rise
        className="display"
        style={{ margin: 0, fontSize: 'clamp(44px,5.4vw,76px)', lineHeight: 1.02, maxWidth: '13em' }}
      >
        Four answers chose your type
      </h2>
      <p data-rise className="muted" style={{ margin: '16px 0 0', fontSize: 19 }}>
        Questions 5 to 8 only. The highest score won.
      </p>

      <div
        data-rise
        style={{
          marginTop: 48,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: 'clamp(16px,3.5vw,52px)',
          flexWrap: 'wrap',
        }}
      >
        {ARCHETYPES.map((a, i) => {
          const win = i === best;
          const score = scores[i];
          const size = animate ? Math.round(34 + Math.max(0, Math.min(1, (score + 6) / 12)) * 106) : 12;
          return (
            <div key={a.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: 128 }}>
              <div style={{ height: 150, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div
                  style={{
                    borderRadius: '50%',
                    transition: `width 1.4s ${EASE}, height 1.4s ${EASE}, box-shadow 1.4s`,
                    transitionDelay: `${i * 0.12}s`,
                    width: size,
                    height: size,
                    background: win
                      ? 'radial-gradient(circle at 50% 75%, #f0a272 0%, #c4606a 35%, #5b3c78 75%, #1d1826 100%)'
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${win ? 'rgba(255,255,255,0.35)' : 'rgba(243,236,228,0.2)'}`,
                    boxShadow: win && animate ? '0 0 70px rgba(227,154,111,0.55)' : 'none',
                  }}
                />
              </div>
              <span className="display" style={{ fontSize: 26, lineHeight: 1, color: win ? '#f3ece4' : '#9a948f' }}>
                {a.name.replace('The ', '')}
              </span>
              <span className="muted" style={{ fontSize: 13 }}>
                {(score >= 0 ? '+' : '') + score.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>

      <p data-rise style={{ margin: '52px 0 0', fontSize: 19, lineHeight: 1.55, color: '#c9c1b9', maxWidth: '30em' }}>
        Your cards came from the shuffle. The rest was written to fit almost anyone.
      </p>
      <p
        data-rise
        className="display"
        style={{ margin: '18px 0 0', fontSize: 'clamp(34px,3.6vw,50px)', lineHeight: 1.15, color: '#e39a6f' }}
      >
        {nm ? `Which part felt like being known, ${nm}?` : 'Which part felt like being known?'}
      </p>
      <div data-rise style={{ marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <PrimaryButton onClick={onFinish} arrow={false}>
          Finish &amp; erase
        </PrimaryButton>
        <span className="muted" style={{ fontSize: 13 }}>
          Saved: nothing
        </span>
      </div>
    </div>
  );
}

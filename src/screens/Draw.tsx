import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { CardFace } from '../components/PlayingCard';
import { DRAW_PROMPTS, POSITIONS, getCard, matchConfidence, type Card, type CardId } from '../content';

export type ScanState = 'wait' | 'scan' | 'seen';

interface Props {
  drawIdx: number;
  cards: (CardId | null)[];
  scan: ScanState;
  name: string;
  /** Last recognised card — kept so the face stays drawn while the frame flips back. */
  lastCard: Card | null;
  onSimulate: () => void;
  onNext: () => void;
  onReject: () => void;
  showNotes: boolean;
}

const INK = '#f3ece4';
const COPPER = '#e39a6f';
const MUTED = '#9a948f';

const BRACKETS = [
  { left: 16, top: 16, borderLeftWidth: 1.5, borderTopWidth: 1.5, borderRadius: '10px 0 0 0' },
  { right: 16, top: 16, borderRightWidth: 1.5, borderTopWidth: 1.5, borderRadius: '0 10px 0 0' },
  { left: 16, bottom: 16, borderLeftWidth: 1.5, borderBottomWidth: 1.5, borderRadius: '0 0 0 10px' },
  { right: 16, bottom: 16, borderRightWidth: 1.5, borderBottomWidth: 1.5, borderRadius: '0 0 10px 0' },
];

export function Draw({ drawIdx, cards, scan, name, lastCard, onSimulate, onNext, onReject, showNotes }: Props) {
  const nm = name.trim();
  const seen = scan === 'seen';
  const prompt = DRAW_PROMPTS[drawIdx];
  const curId = cards[drawIdx];

  const frameTransform = seen ? 'rotateY(180deg)' : scan === 'scan' ? 'rotateY(0deg) scale(1.03)' : 'rotateY(0deg)';
  const status =
    scan === 'wait'
      ? 'Waiting for your card'
      : scan === 'scan'
        ? 'Recognizing'
        : `${lastCard?.label ?? ''} · ${matchConfidence(curId ?? 'x')}% match`;
  const statusColor = scan === 'wait' ? MUTED : scan === 'scan' ? COPPER : INK;

  return (
    <div className="draw-grid">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span data-rise className="eyebrow">
          Card {drawIdx + 1} of 3
        </span>
        <h2 data-rise className="display" style={{ margin: '18px 0 0', fontSize: 'clamp(64px,8vw,124px)', lineHeight: 0.92 }}>
          Your {POSITIONS[drawIdx].toLowerCase()}
        </h2>
        <p data-rise className="muted pretty" style={{ margin: '22px 0 0', fontSize: 20, lineHeight: 1.5, maxWidth: '20em' }}>
          {nm ? `${nm}, ${prompt.charAt(0).toLowerCase()}${prompt.slice(1)}` : prompt}
        </p>

        <div data-rise style={{ marginTop: 36, display: 'flex', gap: 22, flexWrap: 'wrap' }}>
          {POSITIONS.map((pos, i) => {
            const id = cards[i];
            const c = id && (i < drawIdx || (i === drawIdx && seen)) ? getCard(id) : null;
            const current = i === drawIdx;
            return (
              <div key={pos} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 30,
                    height: 42,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 500,
                    transition: 'all 0.4s',
                    background: c ? INK : 'transparent',
                    border: `1px solid ${current ? COPPER : 'rgba(243,236,228,0.2)'}`,
                    color: c ? c.color : INK,
                  }}
                >
                  {c ? c.display + c.glyph : ''}
                </div>
                <span style={{ fontSize: 14, color: current ? INK : MUTED }}>{pos}</span>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 36, minHeight: 56 }}>
          {seen && (
            <div className="btn-row">
              <PrimaryButton onClick={onNext}>
                {drawIdx < 2 ? `Next: your ${POSITIONS[drawIdx + 1].toLowerCase()}` : 'Read my cards'}
              </PrimaryButton>
              <SecondaryButton onClick={onReject}>Not my card</SecondaryButton>
            </div>
          )}
        </div>
        {showNotes && (
          <p className="note" style={{ margin: '12px 0 0', maxWidth: '32em' }}>
            A2 note: a teammate picks the drawn card in the operator panel (or press Space). In A3 a classifier
            trained on photos of our deck does this.
          </p>
        )}
      </div>

      <div data-rise style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
        <div style={{ position: 'relative', width: 'min(300px,70vw)', aspectRatio: '2.5 / 3.5', perspective: 1600 }}>
          <div className="flip-inner" style={{ transform: frameTransform }}>
            {/* No backdrop-filter on flip faces — it breaks 3D rendering. */}
            <div
              className="flip-face scan-frame"
              onClick={() => scan === 'wait' && onSimulate()}
              role="button"
              aria-label="Card slot"
            >
              {BRACKETS.map((b, i) => (
                <div key={i} className="bracket" style={b} />
              ))}
              {scan !== 'seen' && <div className={'scan-line' + (scan === 'scan' ? ' fast' : '')} />}
              <span
                className="muted"
                style={{ position: 'relative', fontSize: 15, textAlign: 'center', maxWidth: '10em', lineHeight: 1.5 }}
              >
                {scan === 'scan' ? 'Reading the card…' : 'Place your card here'}
              </span>
            </div>
            <CardFace card={lastCard} large />
          </div>
        </div>
        <div
          aria-live="polite"
          style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, minHeight: 22, color: statusColor }}
        >
          {scan === 'scan' && <span className="pulse-dot" />}
          <span>{status}</span>
        </div>
      </div>
    </div>
  );
}

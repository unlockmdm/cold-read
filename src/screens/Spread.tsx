import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { CardBack, CardFace } from '../components/PlayingCard';
import { POSITIONS, getCard, type CardId } from '../content';
import { adviceText, fortuneText, type Reading } from '../logic/reading';

interface Props {
  cards: (CardId | null)[];
  /** 1–3: which card is being read. */
  readStep: number;
  /** How many cards are face up (lags readStep so the flip can play). */
  flipped: number;
  name: string;
  reading: Reading;
  paceFactor: number;
  showReveal: boolean;
  onNext: () => void;
  onReveal: () => void;
  onFinish: () => void;
}

/** The fortune, revealed word by word. Re-mounts (and re-animates) per card via `key`. */
function Story({ text, delay, paceFactor }: { text: string; delay: number; paceFactor: number }) {
  const words = text.split(' ');
  return (
    <p
      className="display pretty"
      style={{ margin: 0, fontSize: 'clamp(24px, 2.3vw, 32px)', lineHeight: 1.38, maxWidth: '27em' }}
    >
      {words.map((w, i) => (
        <span key={i}>
          <span className="word" style={{ animationDelay: `${((delay + i * 0.028) * paceFactor).toFixed(3)}s` }}>
            {w}
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </p>
  );
}

export function Spread({
  cards,
  readStep,
  flipped,
  name,
  reading,
  paceFactor,
  showReveal,
  onNext,
  onReveal,
  onFinish,
}: Props) {
  const nm = name.trim();
  const k = readStep - 1;
  const cardId = cards[k];
  const isLast = readStep >= 3;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
      <div data-rise style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 'clamp(18px,3vw,44px)' }}>
        {POSITIONS.map((pos, i) => {
          const id = cards[i];
          const c = id ? getCard(id) : null;
          const active = i === k;
          return (
            <div
              key={pos}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                transition: 'opacity 0.8s, transform 0.9s cubic-bezier(.3,.7,.15,1)',
                opacity: active ? 1 : i < k ? 0.7 : 0.45,
                transform: active ? 'translateY(-14px) scale(1.07)' : 'translateY(0) scale(1)',
              }}
            >
              <div style={{ position: 'relative', width: 'clamp(118px,12vw,172px)', aspectRatio: '2.5 / 3.5', perspective: 1400 }}>
                <div className="flip-inner" style={{ transform: i < flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                  <CardBack />
                  <CardFace card={c} />
                </div>
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 400,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  transition: 'color 0.6s',
                  color: active ? '#e39a6f' : '#9a948f',
                }}
              >
                {pos}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16, maxWidth: 880 }}>
        <h2 data-rt="0.55" className="display" style={{ margin: 0, fontSize: 'clamp(34px,3.4vw,50px)', lineHeight: 1 }}>
          {cardId ? getCard(cardId).label : ''}
        </h2>
        {cardId && (
          <Story
            key={`story${k}${cardId}`}
            text={fortuneText(k, cardId, reading.archetype, reading.personal, nm)}
            delay={readStep === 1 ? 1.2 : 0.85}
            paceFactor={paceFactor}
          />
        )}
        {k === 2 && (
          <p data-rt="2.4" style={{ margin: '4px 0 0', fontSize: 18, lineHeight: 1.5, color: '#e39a6f' }}>
            {adviceText(reading.archetype, nm)}
          </p>
        )}
        <div data-rt="1.3" className="btn-row" style={{ marginTop: 16, justifyContent: 'center' }}>
          {!isLast && <PrimaryButton onClick={onNext}>Turn the next card</PrimaryButton>}
          {isLast && (
            <>
              {showReveal && <PrimaryButton onClick={onReveal}>How did you know?</PrimaryButton>}
              <SecondaryButton onClick={onFinish}>Finish</SecondaryButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

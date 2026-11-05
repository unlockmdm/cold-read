import { CARD_BLACK, type Card } from '../content';

type FaceCard = Pick<Card, 'display' | 'glyph' | 'color'>;

const BLANK: FaceCard = { display: '', glyph: '', color: CARD_BLACK };

/**
 * The cream card face. Always sits on the *rear* of a flip container
 * (rotated 180°), so it shows when the container turns over.
 * `large` = draw-screen frame (300px); otherwise the smaller spread card.
 */
export function CardFace({ card, large = false }: { card: FaceCard | null; large?: boolean }) {
  const c = card ?? BLANK;
  const radius = large ? 20 : 14;
  const inset = large ? 9 : 7;
  const innerRadius = large ? 13 : 9;
  const indexSize = large ? '7cqw' : '9cqw';
  const side = large ? '8%' : '9%';
  const shadow = large
    ? '0 30px 80px rgba(0,0,0,0.55), 0 0 90px rgba(227,154,111,0.3)'
    : '0 24px 60px rgba(0,0,0,0.55), 0 0 70px rgba(227,154,111,0.28)';

  return (
    <div className="flip-face flip-rear card-face" style={{ borderRadius: radius, boxShadow: shadow, color: c.color }}>
      <div
        style={{
          position: 'absolute',
          inset,
          border: '1px solid rgba(176,100,62,0.35)',
          borderRadius: innerRadius,
        }}
      />
      <div className="card-index" style={{ left: side, top: '6%', fontSize: indexSize }}>
        <span>{c.display}</span>
        <span>{c.glyph}</span>
      </div>
      <div
        className="card-index"
        style={{ right: side, bottom: '6%', fontSize: indexSize, transform: 'rotate(180deg)' }}
      >
        <span>{c.display}</span>
        <span>{c.glyph}</span>
      </div>
      <div className="card-centre">
        <span className="display" style={{ fontSize: '26cqw', lineHeight: 0.85 }}>
          {c.display}
        </span>
        <span style={{ fontSize: '10cqw', lineHeight: 1 }}>{c.glyph}</span>
      </div>
      <div className="card-sheen" />
    </div>
  );
}

/** The plum card back with copper rays and rings. Front side of the spread flip. */
export function CardBack() {
  return (
    <div className="flip-face card-back">
      <div
        style={{
          position: 'absolute',
          inset: 7,
          border: '1px solid rgba(227,154,111,0.3)',
          borderRadius: 9,
        }}
      />
      <div className="card-back-rays" />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '52%',
          aspectRatio: '1',
          transform: 'translate(-50%,-50%)',
          borderRadius: '50%',
          border: '1px solid rgba(227,154,111,0.55)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '30%',
          aspectRatio: '1',
          transform: 'translate(-50%,-50%)',
          borderRadius: '50%',
          background: '#1b1621',
          border: '1px solid rgba(227,154,111,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#e39a6f',
          fontSize: 16,
        }}
      >
        ✦
      </div>
    </div>
  );
}

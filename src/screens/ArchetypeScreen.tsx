import { PrimaryButton } from '../components/Buttons';
import type { Archetype } from '../content';

export function ArchetypeScreen({ name, archetype, onNext }: { name: string; archetype: Archetype; onNext: () => void }) {
  const nm = name.trim();
  return (
    <div className="stack">
      <span data-rise className="eyebrow">
        {nm ? `A reading for ${nm}` : 'Your reading'}
      </span>
      <p data-rise className="muted" style={{ margin: '28px 0 0', fontSize: 20 }}>
        The cards will speak to
      </p>
      <h2
        data-rise
        className="display"
        style={{
          margin: '10px 0 0',
          fontSize: 'clamp(84px,12vw,180px)',
          lineHeight: 0.9,
          letterSpacing: '-0.01em',
          textShadow: '0 0 90px rgba(227,154,111,0.4)',
        }}
      >
        {archetype.name}
      </h2>
      <p data-rise style={{ margin: '26px 0 0', fontSize: 20, lineHeight: 1.5, color: '#c9c1b9', maxWidth: '26em' }}>
        {archetype.description}
      </p>
      <div data-rise style={{ marginTop: 44 }}>
        <PrimaryButton onClick={onNext}>Turn the cards</PrimaryButton>
      </div>
    </div>
  );
}

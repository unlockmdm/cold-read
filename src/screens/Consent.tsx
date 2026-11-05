import { PrimaryButton, SecondaryButton } from '../components/Buttons';

const ITEMS = [
  { title: 'Camera on you', body: 'Whether you are here, where you look, who is with you.' },
  { title: 'Microphone', body: 'How loud and how fast you speak. Never your words.' },
  { title: 'Camera on the table', body: 'Only the three cards you draw.' },
  { title: 'Timer', body: 'How long each answer takes you.' },
];

/** Must appear before any sensing starts. The opt-out path keeps every sensor off. */
export function Consent({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  return (
    <div className="stack">
      <span data-rise className="eyebrow">
        Before we begin
      </span>
      <h2 data-rise className="display" style={{ margin: '16px 0 0', fontSize: 'clamp(48px,6vw,84px)', lineHeight: 1 }}>
        What I notice
      </h2>
      <div data-rise className="consent-grid">
        {ITEMS.map((it) => (
          <div key={it.title} className="consent-item">
            <span style={{ fontSize: 16, fontWeight: 500 }}>{it.title}</span>
            <span className="muted" style={{ fontSize: 16, lineHeight: 1.5 }}>
              {it.body}
            </span>
          </div>
        ))}
      </div>
      <p data-rise className="muted" style={{ margin: '28px 0 0', fontSize: 15 }}>
        Nothing is recorded. Everything is erased when you finish.
      </p>
      <div data-rise className="btn-row" style={{ marginTop: 32, justifyContent: 'center' }}>
        <PrimaryButton onClick={onYes}>Read me</PrimaryButton>
        <SecondaryButton onClick={onNo} style={{ paddingInline: 26 }}>
          Without camera &amp; mic
        </SecondaryButton>
      </div>
    </div>
  );
}

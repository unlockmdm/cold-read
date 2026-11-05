import { PrimaryButton } from '../components/Buttons';
import { Orb } from '../components/Orb';

export function Attract({ onBegin, showNotes }: { onBegin: () => void; showNotes: boolean }) {
  return (
    <div className="stack">
      <div data-rise>
        <Orb size={230} />
      </div>
      <h1
        data-rise
        className="display"
        style={{ margin: '36px 0 0', fontSize: 'clamp(64px,9vw,136px)', lineHeight: 0.92, letterSpacing: '-0.01em' }}
      >
        Come closer
      </h1>
      <p data-rise className="muted" style={{ margin: '18px 0 0', fontSize: 20 }}>
        The cards have been waiting for you.
      </p>
      <div data-rise style={{ marginTop: 36 }}>
        <PrimaryButton onClick={onBegin}>Begin your reading</PrimaryButton>
      </div>
      {showNotes && (
        <p className="note" style={{ margin: '28px 0 0', maxWidth: '36em' }}>
          A2 note: the person camera opens this screen when someone steps onto the floor mark. Here a teammate
          presses “Person detected”, or the visitor taps the button.
        </p>
      )}
    </div>
  );
}

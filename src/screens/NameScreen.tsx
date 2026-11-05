import { PrimaryButton } from '../components/Buttons';

interface Props {
  name: string;
  mode: 'voice' | 'text';
  listening: boolean;
  onMode: (m: 'voice' | 'text') => void;
  onToggleListen: () => void;
  onName: (name: string) => void;
  onContinue: () => void;
}

export function NameScreen({ name, mode, listening, onMode, onToggleListen, onName, onContinue }: Props) {
  const nm = name.trim();
  const caption = listening ? 'Listening…' : nm ? `I heard “${nm}”` : 'Tap and say your name';

  return (
    <div className="stack">
      <h2 data-rise className="display" style={{ margin: 0, fontSize: 'clamp(48px,6vw,84px)', lineHeight: 1 }}>
        Who am I reading?
      </h2>

      <div data-rise className="segmented" role="tablist">
        <button type="button" className={mode === 'voice' ? 'active' : ''} onClick={() => onMode('voice')}>
          Voice
        </button>
        <button type="button" className={mode === 'text' ? 'active' : ''} onClick={() => onMode('text')}>
          Text
        </button>
      </div>

      <div
        data-rise
        style={{
          marginTop: 44,
          minHeight: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          width: '100%',
        }}
      >
        {mode === 'voice' ? (
          <>
            <div
              style={{
                position: 'relative',
                width: 140,
                height: 140,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {listening && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {[0, 0.8, 1.6].map((d) => (
                    <div key={d} className="mic-ring" style={{ animationDelay: `${d}s` }} />
                  ))}
                </div>
              )}
              <button type="button" className="mic-btn" onClick={onToggleListen} aria-label="Speak">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <rect x="9" y="3" width="6" height="11" rx="3" />
                  <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                </svg>
              </button>
            </div>
            <div className="display" style={{ fontSize: 32, minHeight: 40 }} aria-live="polite">
              {caption}
            </div>
          </>
        ) : (
          <input
            className="name-input"
            value={name}
            onChange={(e) => onName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onContinue()}
            placeholder="Your name"
            aria-label="Your name"
            autoFocus
          />
        )}
      </div>

      <div data-rise style={{ marginTop: 36 }}>
        <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
      </div>
    </div>
  );
}

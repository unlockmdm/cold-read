import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Background } from './components/Background';
import { BackButton } from './components/Buttons';
import { OperatorPanel, type OperatorSettings } from './components/OperatorPanel';
import { DECK, STAGES, getCard, type Card, type CardId, type StageId } from './content';
import { useSpeechName } from './hooks/useSpeechName';
import { useWebcam } from './hooks/useWebcam';
import { computeReading, revealRows, type Sensed } from './logic/reading';
import { ArchetypeScreen } from './screens/ArchetypeScreen';
import { Attract } from './screens/Attract';
import { Consent } from './screens/Consent';
import { Draw, type ScanState } from './screens/Draw';
import { NameScreen } from './screens/NameScreen';
import { Quiz } from './screens/Quiz';
import { RevealCompare, RevealType } from './screens/Reveal';
import { Spread } from './screens/Spread';

/* ------------------------------------------------------------------ */
/* Session state — everything here is wiped by "Finish".               */
/* ------------------------------------------------------------------ */

interface Session {
  stage: StageId;
  name: string;
  nameMode: 'voice' | 'text';
  answers: (number | null)[];
  /** Seconds from question shown to answered. */
  times: (number | null)[];
  qi: number;
  cards: (CardId | null)[];
  drawIdx: number;
  scan: ScanState;
  sensingOn: boolean;
  /** 0 = archetype screen, 1–3 = spread cards. */
  readStep: number;
  /** How many spread cards are face up (lags readStep for the flip). */
  flipped: number;
  revealStep: 0 | 1;
  revAnim: boolean;
}

const fresh = (): Session => ({
  stage: 'attract',
  name: '',
  nameMode: 'voice',
  answers: Array(8).fill(null),
  times: Array(8).fill(null),
  qi: 0,
  cards: [null, null, null],
  drawIdx: 0,
  scan: 'wait',
  sensingOn: true,
  readStep: 0,
  flipped: 0,
  revealStep: 0,
  revAnim: false,
});

const EASE = 'cubic-bezier(.2,.7,.2,1)';
const PACE_FACTOR = { Calm: 1.4, Normal: 1, Quick: 0.6 } as const;

function screenKey(s: Session): string {
  if (s.stage === 'quiz') return 'quiz' + s.qi;
  if (s.stage === 'draw') return 'draw' + s.drawIdx;
  if (s.stage === 'reading') return s.readStep === 0 ? 'arch' : 'spread';
  if (s.stage === 'reveal') return 'rev' + s.revealStep;
  return s.stage;
}

function pickRandom(cards: (CardId | null)[]): CardId {
  const used = cards.filter(Boolean);
  const pool = DECK.filter((d) => !used.includes(d.id));
  return pool[Math.floor(Math.random() * pool.length)].id;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function App() {
  const [s, setS] = useState<Session>(fresh);
  // Latest state for timers and the keyboard handler (avoids stale closures).
  const sRef = useRef(s);
  sRef.current = s;
  const patch = (p: Partial<Session>) => setS((prev) => ({ ...prev, ...p }));

  // Operator-side state — survives "Finish".
  const [opOpen, setOpOpen] = useState(false);
  const [sensed, setSensed] = useState<Sensed>({ glances: 5, pace: 140, volume: 60, companions: 0 });
  const [settings, setSettings] = useState<OperatorSettings>({ pace: 'Normal', showReveal: true, showNotes: false });
  const paceFactor = PACE_FACTOR[settings.pace];

  const timers = useRef<Record<'answer' | 'scan' | 'flip' | 'rev', number | undefined>>({
    answer: undefined,
    scan: undefined,
    flip: undefined,
    rev: undefined,
  });
  const clear = (k: keyof typeof timers.current) => window.clearTimeout(timers.current[k]);
  const clearAll = () => (Object.keys(timers.current) as (keyof typeof timers.current)[]).forEach(clear);
  useEffect(() => clearAll, []);

  const qShownAt = useRef(Date.now());
  const speech = useSpeechName((name) => patch({ name }));
  const webcam = useWebcam();

  /* ---------------- actions ---------------- */

  const kickRev = () => {
    clear('rev');
    timers.current.rev = window.setTimeout(() => patch({ revAnim: true }), 450);
  };

  const go = (stage: StageId) => {
    const cur = sRef.current;
    const p: Partial<Session> = { stage };
    if (stage === 'quiz') qShownAt.current = Date.now();
    if (stage === 'draw') {
      p.drawIdx = 0;
      p.scan = cur.cards[0] ? 'seen' : 'wait';
    }
    if (stage === 'reading') {
      // Operator safety: fill any empty slot so the reading never breaks.
      const cards = [...cur.cards];
      cards.forEach((c, i) => {
        if (!c) cards[i] = pickRandom(cards);
      });
      p.cards = cards;
      p.readStep = 0;
      p.flipped = 0;
    }
    if (stage === 'reveal') {
      p.revealStep = 0;
      p.revAnim = false;
      kickRev();
    }
    speech.stop();
    patch(p);
  };

  const setRead = (step: number) => {
    clear('flip');
    const cur = sRef.current;
    const forward = step > cur.readStep;
    patch({ readStep: step, flipped: forward ? Math.min(cur.flipped, step - 1) : step });
    if (forward && step >= 1) {
      timers.current.flip = window.setTimeout(() => patch({ flipped: step }), step === 1 ? 650 : 250);
    }
  };

  const answer = (v: number) => {
    const { qi, answers, times } = sRef.current;
    const a = [...answers];
    const t = [...times];
    a[qi] = v;
    t[qi] = (Date.now() - qShownAt.current) / 1000;
    patch({ answers: a, times: t });
    clear('answer');
    timers.current.answer = window.setTimeout(() => {
      if (qi < 7) {
        qShownAt.current = Date.now();
        patch({ qi: qi + 1 });
      } else go('draw');
    }, 420);
  };

  const placeCard = (id: CardId) => {
    const cur = sRef.current;
    const cards = [...cur.cards];
    cards[cur.drawIdx] = id;
    clear('scan');
    patch({ cards, scan: 'scan' });
    timers.current.scan = window.setTimeout(() => patch({ scan: 'seen' }), 1800);
  };

  const simulate = () => {
    const cur = sRef.current;
    placeCard(pickRandom(cur.cards.map((c, i) => (i === cur.drawIdx ? null : c))));
  };

  const rejectCard = () => {
    clear('scan');
    const cur = sRef.current;
    const cards = [...cur.cards];
    cards[cur.drawIdx] = null;
    patch({ cards, scan: 'wait' });
  };

  const setCardAt = (i: number, id: CardId | null) => {
    const cur = sRef.current;
    if (cur.stage === 'draw' && i === cur.drawIdx) {
      if (id) placeCard(id);
      else rejectCard();
      return;
    }
    const cards = [...cur.cards];
    cards[i] = id;
    patch({ cards });
  };

  const nextDraw = () => {
    const { drawIdx: i, cards } = sRef.current;
    if (i < 2) patch({ drawIdx: i + 1, scan: cards[i + 1] ? 'seen' : 'wait' });
    else go('reading');
  };

  const back = () => {
    const st = sRef.current;
    clear('answer');
    switch (st.stage) {
      case 'consent':
        return go('attract');
      case 'name':
        return go('consent');
      case 'quiz':
        qShownAt.current = Date.now();
        if (st.qi > 0) return patch({ qi: st.qi - 1 });
        return go('name');
      case 'draw':
        clear('scan');
        if (st.drawIdx > 0) return patch({ drawIdx: st.drawIdx - 1, scan: 'seen' });
        qShownAt.current = Date.now();
        return patch({ stage: 'quiz', qi: 7 });
      case 'reading':
        if (st.readStep > 0) return setRead(st.readStep - 1);
        return patch({ stage: 'draw', drawIdx: 2, scan: st.cards[2] ? 'seen' : 'wait' });
      case 'reveal':
        if (st.revealStep > 0) {
          kickRev();
          return patch({ revealStep: 0, revAnim: false });
        }
        return patch({ stage: 'reading', readStep: 3, flipped: 3 });
    }
  };

  /** Wipe the visitor's session. Operator settings are kept. */
  const finish = () => {
    clearAll();
    speech.stop();
    setS(fresh());
  };

  /* ---------------- keyboard ---------------- */

  const onKey = useRef<(e: KeyboardEvent) => void>(() => {});
  onKey.current = (e) => {
    const target = e.target as HTMLElement | null;
    if (target && /INPUT|SELECT|TEXTAREA/.test(target.tagName)) return;
    const st = sRef.current;
    if (e.key === 'o' || e.key === 'O') setOpOpen((o) => !o);
    if (st.stage === 'quiz' && /^[1-5]$/.test(e.key)) answer(+e.key);
    if (st.stage === 'draw' && e.key === ' ' && st.scan === 'wait') {
      e.preventDefault();
      simulate();
    }
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => onKey.current(e);
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  /* ---------------- entrance motion ---------------- */

  const mainRef = useRef<HTMLDivElement>(null);
  const lastKey = useRef<string | null>(null);
  const lastReadStep = useRef(s.readStep);

  useLayoutEffect(() => {
    const key = screenKey(s);
    const stepChanged = s.stage === 'reading' && lastReadStep.current !== s.readStep && s.readStep > 0;
    lastReadStep.current = s.readStep;
    const root = mainRef.current;
    const rise = key !== lastKey.current;
    lastKey.current = key;
    if (!root || typeof root.animate !== 'function' || prefersReducedMotion()) return;
    if (!rise && !stepChanged) return;

    const kf: Keyframe[] = [
      { opacity: 0, transform: 'translateY(22px)', filter: 'blur(8px)' },
      { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' },
    ];
    if (rise) {
      root.querySelectorAll<HTMLElement>('[data-rise]').forEach((el, i) =>
        el.animate(kf, { duration: 900, delay: i * 90, easing: EASE, fill: 'backwards' }),
      );
    }
    root.querySelectorAll<HTMLElement>('[data-rt]').forEach((el) =>
      el.animate(kf, {
        duration: 800,
        delay: (parseFloat(el.dataset.rt ?? '0') || 0) * 1000 * paceFactor,
        easing: EASE,
        fill: 'backwards',
      }),
    );
  });

  /* ---------------- derived values ---------------- */

  const reading = computeReading(s.answers);
  const stageIdx = STAGES.indexOf(s.stage);
  const sub =
    s.stage === 'quiz'
      ? s.qi / 8
      : s.stage === 'draw'
        ? s.drawIdx / 3
        : s.stage === 'reading'
          ? s.readStep / 4
          : s.stage === 'reveal'
            ? s.revealStep / 2
            : 0;
  const progress = Math.max(2, ((stageIdx + sub) / 6.6) * 100);

  const lastCard = useRef<Card | null>(null);
  const curId = s.cards[s.drawIdx];
  if (curId) lastCard.current = getCard(curId);

  /* ---------------- render ---------------- */

  let screen: JSX.Element | null = null;
  switch (s.stage) {
    case 'attract':
      screen = <Attract onBegin={() => go('consent')} showNotes={settings.showNotes} />;
      break;
    case 'consent':
      screen = (
        <Consent
          onYes={() => {
            patch({ sensingOn: true });
            go('name');
          }}
          onNo={() => {
            patch({ sensingOn: false });
            go('name');
          }}
        />
      );
      break;
    case 'name':
      screen = (
        <NameScreen
          name={s.name}
          mode={s.nameMode}
          listening={speech.listening}
          onMode={(m) => {
            if (m === 'text') speech.stop();
            patch({ nameMode: m });
          }}
          onToggleListen={speech.toggle}
          onName={(name) => patch({ name })}
          onContinue={() => {
            patch({ qi: 0 });
            go('quiz');
          }}
        />
      );
      break;
    case 'quiz':
      screen = (
        <Quiz qi={s.qi} name={s.name} selected={s.answers[s.qi]} onAnswer={answer} showNotes={settings.showNotes} />
      );
      break;
    case 'draw':
      screen = (
        <Draw
          drawIdx={s.drawIdx}
          cards={s.cards}
          scan={s.scan}
          name={s.name}
          lastCard={lastCard.current}
          onSimulate={simulate}
          onNext={nextDraw}
          onReject={rejectCard}
          showNotes={settings.showNotes}
        />
      );
      break;
    case 'reading':
      screen =
        s.readStep === 0 ? (
          <ArchetypeScreen name={s.name} archetype={reading.archetype} onNext={() => setRead(1)} />
        ) : (
          <Spread
            cards={s.cards}
            readStep={s.readStep}
            flipped={s.flipped}
            name={s.name}
            reading={reading}
            paceFactor={paceFactor}
            showReveal={settings.showReveal}
            onNext={() => setRead(s.readStep + 1)}
            onReveal={() => go('reveal')}
            onFinish={finish}
          />
        );
      break;
    case 'reveal':
      screen =
        s.revealStep === 0 ? (
          <RevealCompare
            name={s.name}
            rows={revealRows(reading.a, sensed, s.sensingOn, s.times)}
            animate={s.revAnim}
            onNext={() => {
              kickRev();
              patch({ revealStep: 1, revAnim: false });
            }}
          />
        ) : (
          <RevealType name={s.name} scores={reading.scores} best={reading.best} animate={s.revAnim} onFinish={finish} />
        );
      break;
  }

  return (
    <div className="station">
      <Background stage={s.stage} />
      <div className="progress" style={{ width: `${progress}%` }} />

      <div className="column">
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center' }}>{stageIdx > 0 && <BackButton onClick={back} />}</div>
          <div className="wordmark">Cold Read</div>
          <div />
        </header>
        <main className="main">
          <div ref={mainRef} className="inner">
            {screen}
          </div>
        </main>
      </div>

      {opOpen && (
        <OperatorPanel
          stage={s.stage}
          drawIdx={s.drawIdx}
          name={s.name}
          onName={(name) => patch({ name })}
          sensed={sensed}
          onSensed={(key, value) => setSensed((x) => ({ ...x, [key]: value }))}
          cards={s.cards}
          onSetCard={setCardAt}
          onRandomCard={(i) => setCardAt(i, pickRandom(s.cards.map((c, j) => (j === i ? null : c))))}
          onJump={go}
          onReset={finish}
          onPersonDetected={() => go('consent')}
          settings={settings}
          onSettings={(p) => setSettings((x) => ({ ...x, ...p }))}
          webcam={webcam}
        />
      )}

      <button type="button" className="op-toggle" onClick={() => setOpOpen((o) => !o)}>
        {opOpen ? 'Hide operator' : 'Operator'}
      </button>
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';

/** Minimal typing for the (still prefixed in Chrome) Web Speech API. */
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognizer(): SpeechRecognitionCtor | undefined {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/** "my name is maya" → "Maya". Only the first word is kept. */
export function extractName(transcript: string): string {
  const t = transcript.trim().replace(/^(my name is|i'm|i am|it's|this is)\s+/i, '');
  const w = t.split(/\s+/)[0] ?? '';
  return w ? w.charAt(0).toUpperCase() + w.slice(1) : '';
}

/**
 * Listens for the visitor's name. Only the name is ever transcribed; nothing
 * is stored. If the browser has no speech API, "listening" still shows so the
 * operator can type the name they heard.
 */
export function useSpeechName(onName: (name: string) => void) {
  const [listening, setListening] = useState(false);
  const recog = useRef<SpeechRecognitionLike | null>(null);
  const listeningRef = useRef(false);
  const onNameRef = useRef(onName);
  onNameRef.current = onName;

  const set = (v: boolean) => {
    listeningRef.current = v;
    setListening(v);
  };

  const stop = useCallback(() => {
    if (recog.current) {
      try {
        recog.current.stop();
      } catch {
        /* already stopped */
      }
      recog.current = null;
    }
    if (listeningRef.current) set(false);
  }, []);

  const toggle = useCallback(() => {
    if (listeningRef.current) return stop();
    const SR = getRecognizer();
    if (SR) {
      try {
        const r = new SR();
        r.lang = 'en-US';
        r.interimResults = false;
        r.maxAlternatives = 1;
        r.onresult = (e) => {
          const name = extractName(e.results[0]?.[0]?.transcript ?? '');
          if (name) onNameRef.current(name);
        };
        r.onend = () => {
          recog.current = null;
          set(false);
        };
        r.onerror = () => {};
        r.start();
        recog.current = r;
      } catch {
        /* mic blocked — operator can type the name */
      }
    }
    set(true);
  }, [stop]);

  useEffect(() => stop, [stop]);

  return { listening, toggle, stop };
}

/**
 * The "reading" — every rule that turns quiz answers, cards and sensor values
 * into a fortune and into the reveal. Pure functions, no React, fully tested.
 *
 * This is the critical point of the project: the machine only categorises you
 * (5 archetypes from 4 questions) and then wraps that category in wording loose
 * enough to fit almost anyone (the Barnum effect / cold reading).
 */
import {
  ARCHETYPES,
  OPENERS,
  PERSONAL_LINES,
  PHRASE_OVERRIDES,
  SUIT_POSITION,
  getCard,
  type Archetype,
  type CardId,
} from '../content';

/** One slot per question; 1–5 on the Likert scale, null if unanswered. */
export type Answers = (number | null)[];

export interface Reading {
  /** Answers with unanswered questions filled in as neutral (3). */
  a: number[];
  /** Score per archetype, in ARCHETYPES order. */
  scores: number[];
  /** Index of the winning archetype. */
  best: number;
  archetype: Archetype;
  /** Line chosen from Q1–Q4, or '' when every answer was neutral. */
  personal: string;
}

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** Archetype scores from Q5–Q8 (E, A, F, J). */
export function scoreArchetypes(a: number[]): number[] {
  const [E, A, F, J] = [a[4], a[5], a[6], a[7]];
  return [
    E - 3 + (A - 3) + 0.7 * (3 - J), // Trailblazer
    F - 3 + (3 - J) + 0.3 * (3 - E), // Dreamer
    3 - E + (3 - A) + 0.3 * (J - 3), // Oracle
    J - 3 + (3 - F) + 0.7 * (A - 3), // Architect
    F - 3 + (3 - A) + 0.5 * (3 - E), // Guardian
  ];
}

/** Highest score wins; ties go to the archetype listed first. */
export function pickBest(scores: number[]): number {
  let best = 0;
  scores.forEach((s, i) => {
    if (s > scores[best]) best = i;
  });
  return best;
}

/**
 * Personal line from Q1–Q4: the answer furthest from neutral wins
 * (earlier question on a tie). Above 3 → high line, below 3 → low line.
 */
export function personalLine(a: number[]): string {
  let pick = -1;
  let dist = 0;
  for (let i = 0; i < 4; i++) {
    const d = Math.abs(a[i] - 3);
    if (d > dist) {
      dist = d;
      pick = i;
    }
  }
  if (pick < 0) return '';
  return a[pick] > 3 ? PERSONAL_LINES[pick].high : PERSONAL_LINES[pick].low;
}

export function computeReading(answers: Answers): Reading {
  const a = answers.map((x) => x ?? 3);
  const scores = scoreArchetypes(a);
  const best = pickBest(scores);
  return { a, scores, best, archetype: ARCHETYPES[best], personal: personalLine(a) };
}

/**
 * Fortune paragraph for card k (0 = Past, 1 = Present, 2 = Future):
 * opener + cardLabel + " speaks of " + phrase + ". " + suitSentence + " " + tail
 */
export function fortuneText(
  k: number,
  cardId: CardId,
  archetype: Archetype,
  personal: string,
  name: string,
): string {
  const card = getCard(cardId);
  const phrase = PHRASE_OVERRIDES[cardId] ?? lowerFirst(card.meaning);
  const opener = name ? OPENERS.with_name[k].replace('{name}', name) : OPENERS.default[k];
  const tail =
    k === 0
      ? archetype.lens_past
      : k === 1
        ? archetype.lens_present + (personal ? ' ' + personal : '')
        : archetype.fortune;
  return `${opener}${card.label} speaks of ${phrase}. ${SUIT_POSITION[card.suit][k]} ${tail}`;
}

/** Advice line shown under the Future card. */
export function adviceText(archetype: Archetype, name: string): string {
  return name ? `${name}, ${lowerFirst(archetype.advice)}` : archetype.advice;
}

/* ------------------------------------------------------------------ */
/* Reveal: what you said vs. what the sensors measured                 */
/* ------------------------------------------------------------------ */

/** Values from the sensors (A3) or the operator's sliders (A2). */
export interface Sensed {
  /** Glances away per minute (person camera), 0–10. */
  glances: number;
  /** Speaking pace in words per minute (mic), 90–190. */
  pace: number;
  /** Average loudness in dB (mic), 45–75. */
  volume: number;
  /** Other people in frame (person camera), 0–4. */
  companions: number;
}

/** Map a measured value onto the 1–5 answer scale. */
export function level(v: number, min: number, max: number): number {
  return Math.max(1, Math.min(5, 1 + Math.round(((v - min) / (max - min)) * 4)));
}

export function companionLevel(n: number): number {
  return [2, 3, 4, 5, 5][Math.min(Math.max(n, 0), 4)];
}

/** Fast answers read as "taking charge". */
export function answerTimeLevel(avgSeconds: number): number {
  if (avgSeconds <= 1.5) return 5;
  if (avgSeconds <= 3) return 4;
  if (avgSeconds <= 5) return 3;
  if (avgSeconds <= 8) return 2;
  return 1;
}

export type Verdict = 'Agrees' | 'Disagrees' | 'Not measured';

export interface RevealRow {
  trait: string;
  /** Visitor's answer (1–5) to the compared question. */
  answer: number;
  /** Measured level (1–5), or null when not measured. */
  measured: number | null;
  /** Small caption under the trait name. */
  caption: string;
  verdict: Verdict;
}

export function revealRows(
  a: number[],
  sensed: Sensed,
  sensingOn: boolean,
  times: (number | null)[],
): RevealRow[] {
  const t = times.filter((x): x is number => x != null);
  const avg = t.length ? t.reduce((x, y) => x + y, 0) / t.length : 0;

  const row = (trait: string, q: number, caption: string, measured: number | null): RevealRow => {
    let verdict: Verdict = 'Not measured';
    if (measured != null) verdict = Math.abs(measured - a[q]) <= 1 ? 'Agrees' : 'Disagrees';
    return { trait, answer: a[q], measured, caption: measured == null ? 'Sensors off' : caption, verdict };
  };
  const ifOn = (v: number) => (sensingOn ? v : null);

  const timing = row('Taking charge', 5, `${avg.toFixed(1)} s per answer`, t.length ? answerTimeLevel(avg) : null);
  if (!t.length) timing.caption = 'No timing yet';

  return [
    row('Noticing others', 0, `${sensed.glances} glances away a minute`, ifOn(level(sensed.glances, 0, 10))),
    row('Speaking fast', 2, `${sensed.pace} words a minute`, ifOn(level(sensed.pace, 90, 190))),
    row('Speaking loudly', 3, `${sensed.volume} dB on average`, ifOn(level(sensed.volume, 45, 75))),
    row('Social energy', 4, `${sensed.companions} other people with you`, ifOn(companionLevel(sensed.companions))),
    timing,
  ];
}

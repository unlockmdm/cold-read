import { describe, expect, it } from 'vitest';
import { ARCHETYPES, DECK, getCard, matchConfidence } from '../content';
import {
  adviceText,
  answerTimeLevel,
  companionLevel,
  computeReading,
  fortuneText,
  level,
  personalLine,
  revealRows,
} from './reading';

const answers = (...a: (number | null)[]) => a;

describe('deck', () => {
  it('has 52 unique cards', () => {
    expect(DECK).toHaveLength(52);
    expect(new Set(DECK.map((d) => d.id)).size).toBe(52);
  });

  it('labels and colours cards', () => {
    expect(getCard('Q|Hearts')).toMatchObject({ label: 'Queen of Hearts', display: 'Q', color: '#b4482a' });
    expect(getCard('1|Spades')).toMatchObject({ label: 'Ace of Spades', display: 'A', color: '#231f27' });
    expect(getCard('2|Clubs').label).toBe('2 of Clubs');
  });

  it('gives a stable 86–98% match', () => {
    for (const { id } of DECK) {
      const c = matchConfidence(id);
      expect(c).toBeGreaterThanOrEqual(86);
      expect(c).toBeLessThanOrEqual(98);
      expect(matchConfidence(id)).toBe(c);
    }
  });
});

describe('archetype', () => {
  it('breaks ties toward the first archetype (all neutral → Trailblazer)', () => {
    const r = computeReading(Array(8).fill(null));
    expect(r.scores.every((s) => s === 0)).toBe(true);
    expect(r.archetype.name).toBe('The Trailblazer');
  });

  it('picks the Oracle for a quiet, independent, planned visitor', () => {
    // E=1, A=1, F=3, J=5
    const r = computeReading(answers(3, 3, 3, 3, 1, 1, 3, 5));
    expect(r.archetype.name).toBe('The Oracle');
    expect(r.scores[2]).toBeCloseTo(4.6);
  });

  it('picks the Dreamer for a feeling, unplanned visitor', () => {
    const r = computeReading(answers(3, 3, 3, 3, 3, 3, 5, 1));
    expect(r.archetype.name).toBe('The Dreamer');
  });

  it('picks the Architect and Guardian when expected', () => {
    expect(computeReading(answers(3, 3, 3, 3, 3, 4, 1, 5)).archetype.name).toBe('The Architect');
    expect(computeReading(answers(3, 3, 3, 3, 2, 1, 5, 3)).archetype.name).toBe('The Guardian');
  });
});

describe('personal line', () => {
  it('is empty when Q1–Q4 are all neutral', () => {
    expect(personalLine([3, 3, 3, 3, 5, 5, 5, 5])).toBe('');
  });

  it('uses the answer furthest from 3, earlier question on a tie', () => {
    expect(personalLine([4, 1, 3, 3, 3, 3, 3, 3])).toMatch(/^Comfort suits you/); // Q2 low
    expect(personalLine([5, 1, 3, 3, 3, 3, 3, 3])).toMatch(/^You notice what others miss/); // tie → Q1 high
  });
});

describe('fortune text', () => {
  const architect = ARCHETYPES[3];

  it('builds the Past sentence with the name', () => {
    expect(fortuneText(0, '9|Hearts', architect, '', 'Maya')).toBe(
      'Maya, in your past, the 9 of Hearts speaks of a desire for deeper connection or family expansion. ' +
        'Something in your heart, a bond or a feeling, shaped who you are now. You built something around this.',
    );
  });

  it('adds the personal line on Present only', () => {
    const s = fortuneText(1, '2|Clubs', architect, 'Extra line.', 'Maya');
    expect(s.startsWith('In your present, the 2 of Clubs speaks of the importance of communication.')).toBe(true);
    expect(s.endsWith('It already fits into a plan you are making. Extra line.')).toBe(true);
  });

  it('ends the Future sentence with the archetype fortune', () => {
    const s = fortuneText(2, 'K|Spades', architect, '', '');
    expect(s.startsWith('Ahead of you, the King of Spades speaks of an authoritarian man')).toBe(true);
    expect(s.endsWith(architect.fortune)).toBe(true);
  });

  it('personalises advice', () => {
    expect(adviceText(architect, 'Maya')).toBe('Maya, leave one part of the plan unplanned.');
    expect(adviceText(architect, '')).toBe('Leave one part of the plan unplanned.');
  });
});

describe('reveal', () => {
  it('maps measurements onto 1–5', () => {
    expect(level(0, 0, 10)).toBe(1);
    expect(level(5, 0, 10)).toBe(3);
    expect(level(10, 0, 10)).toBe(5);
    expect(level(500, 90, 190)).toBe(5);
    expect(companionLevel(0)).toBe(2);
    expect(companionLevel(9)).toBe(5);
    expect(answerTimeLevel(1.5)).toBe(5);
    expect(answerTimeLevel(9)).toBe(1);
  });

  const a = [3, 3, 5, 1, 3, 3, 3, 3];
  const sensed = { glances: 5, pace: 190, volume: 75, companions: 0 };

  it('agrees within one step and disagrees beyond', () => {
    // 9 s per answer → level 1, compared with Q6 = 3 → disagrees
    const rows = revealRows(a, sensed, true, Array(8).fill(9));
    expect(rows.map((r) => r.verdict)).toEqual(['Agrees', 'Agrees', 'Disagrees', 'Agrees', 'Disagrees']);
  });

  it('marks sensor rows "Sensors off" when the visitor opted out, but keeps the timer', () => {
    const rows = revealRows(a, sensed, false, Array(8).fill(2));
    expect(rows.slice(0, 4).every((r) => r.caption === 'Sensors off' && r.verdict === 'Not measured')).toBe(true);
    expect(rows[4].measured).toBe(4);
  });

  it('says "No timing yet" with no answer times', () => {
    expect(revealRows(a, sensed, true, Array(8).fill(null))[4]).toMatchObject({
      caption: 'No timing yet',
      verdict: 'Not measured',
    });
  });
});

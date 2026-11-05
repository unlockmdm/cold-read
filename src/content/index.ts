/**
 * Typed access to content.json — every question, archetype, card meaning and
 * sentence fragment lives there, copied verbatim from the design prototype.
 * Edit the copy in content.json, not here.
 */
import raw from './content.json';

export type StageId = 'attract' | 'consent' | 'name' | 'quiz' | 'draw' | 'reading' | 'reveal';
export type Suit = 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades';

export const SUITS: Suit[] = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
export const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
export type Rank = (typeof RANKS)[number];

/** Card ids look like "Q|Hearts", "10|Spades", "1|Clubs" (1 = Ace). */
export type CardId = string;

export interface Archetype {
  name: string;
  description: string;
  fortune: string;
  lens_past: string;
  lens_present: string;
  advice: string;
}

export const QUESTIONS: string[] = raw.questions.map((q) => q.text);
export const ARCHETYPES: Archetype[] = raw.archetypes;
export const PERSONAL_LINES: { low: string; high: string }[] = raw.personal_lines;
export const PHRASE_OVERRIDES = raw.sentence_phrase_overrides as Record<string, string>;
export const SUIT_POSITION = raw.suit_position_sentences as Record<Suit, string[]>;
export const OPENERS = raw.story_openers;
export const POSITIONS: string[] = raw.positions;
export const DRAW_PROMPTS: string[] = raw.draw_prompts;
export const STAGES = raw.stages.map((s) => s.id) as StageId[];
export const STAGE_LABELS: string[] = raw.stages.map((s) => s.label);
export const AURA = raw.background_aura as Record<StageId, number[]>;
export const LAVENDER = raw.background_lavender as Record<StageId, number[]>;

const MEANINGS = raw.card_meanings as Record<Suit, Record<Rank, string>>;

const RANK_NAME: Partial<Record<Rank, string>> = { '1': 'Ace', J: 'Jack', Q: 'Queen', K: 'King' };

/** U+FE0E forces text presentation so suits never render as emoji. */
export const GLYPH: Record<Suit, string> = {
  Hearts: '♥︎',
  Diamonds: '♦︎',
  Clubs: '♣︎',
  Spades: '♠︎',
};

export const CARD_RED = '#b4482a';
export const CARD_BLACK = '#231f27';

export interface Card {
  id: CardId;
  rank: Rank;
  suit: Suit;
  /** "Queen of Hearts", "2 of Spades", "Ace of Clubs" */
  label: string;
  meaning: string;
  /** Rank as printed on the card ("A" for Ace). */
  display: string;
  glyph: string;
  color: string;
}

export function getCard(id: CardId): Card {
  const [rank, suit] = id.split('|') as [Rank, Suit];
  return {
    id,
    rank,
    suit,
    label: `${RANK_NAME[rank] ?? rank} of ${suit}`,
    meaning: MEANINGS[suit][rank],
    display: rank === '1' ? 'A' : rank,
    glyph: GLYPH[suit],
    color: suit === 'Hearts' || suit === 'Diamonds' ? CARD_RED : CARD_BLACK,
  };
}

/** The full 52-card deck (no jokers). */
export const DECK: { id: CardId; label: string }[] = SUITS.flatMap((suit) =>
  RANKS.map((rank) => ({ id: `${rank}|${suit}`, label: `${RANK_NAME[rank] ?? rank} of ${suit}` })),
);

/**
 * Fake but stable "% match" for the Wizard-of-Oz build (86–98%).
 * In A3 this is replaced by the card classifier's real confidence.
 */
export function matchConfidence(id: CardId): number {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return 86 + (h % 13);
}

// Full 78-card Rider-Waite tarot deck with suit metadata for the
// interactive spread builder. "Major" = Major Arcana (no elemental suit).

export type TarotSuit = "Major" | "Wands" | "Cups" | "Swords" | "Pentacles";

export interface TarotCard {
  name: string;
  suit: TarotSuit;
}

const MAJOR_ARCANA: string[] = [
  "The Fool",
  "The Magician",
  "The High Priestess",
  "The Empress",
  "The Emperor",
  "The Hierophant",
  "The Lovers",
  "The Chariot",
  "Strength",
  "The Hermit",
  "Wheel of Fortune",
  "Justice",
  "The Hanged Man",
  "Death",
  "Temperance",
  "The Devil",
  "The Tower",
  "The Star",
  "The Moon",
  "The Sun",
  "Judgement",
  "The World",
];

const RANKS = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];

function buildSuit(suit: Exclude<TarotSuit, "Major">): TarotCard[] {
  return RANKS.map((rank) => ({ name: `${rank} of ${suit}`, suit }));
}

export const TAROT_DECK: TarotCard[] = [
  ...MAJOR_ARCANA.map<TarotCard>((name) => ({ name, suit: "Major" })),
  ...buildSuit("Wands"),
  ...buildSuit("Cups"),
  ...buildSuit("Swords"),
  ...buildSuit("Pentacles"),
];

export const SUIT_EMOJI: Record<TarotSuit, string> = {
  Major: "✨",
  Wands: "🔥",
  Cups: "💧",
  Swords: "🗡️",
  Pentacles: "🪙",
};

export const SUIT_BADGE: Record<TarotSuit, string> = {
  Major: "bg-purple-500/10 text-purple-700 border-purple-300",
  Wands: "bg-red-500/10 text-red-700 border-red-300",
  Cups: "bg-blue-500/10 text-blue-700 border-blue-300",
  Swords: "bg-yellow-500/10 text-yellow-700 border-yellow-300",
  Pentacles: "bg-green-500/10 text-green-700 border-green-300",
};

export function findCard(name: string): TarotCard | undefined {
  return TAROT_DECK.find((c) => c.name === name);
}

export const THREE_CARD_POSITIONS: { label: string; meaning: string }[] = [
  { label: "Past / Foundation", meaning: "what led you here" },
  { label: "Present / Challenge", meaning: "what you're navigating now" },
  { label: "Future / Outcome", meaning: "where this is headed" },
];

export const CELTIC_CROSS_POSITIONS: { label: string; meaning: string }[] = [
  { label: "1. Present Situation", meaning: "the heart of the matter right now" },
  { label: "2. Crossing Challenge", meaning: "what's working against (or with) you" },
  { label: "3. Foundation", meaning: "the root or unconscious basis" },
  { label: "4. Recent Past", meaning: "what's just leaving" },
  { label: "5. Crown / Best Outcome", meaning: "the highest potential" },
  { label: "6. Near Future", meaning: "what's approaching" },
  { label: "7. Your Attitude", meaning: "how you're showing up" },
  { label: "8. Others / Environment", meaning: "external influences" },
  { label: "9. Hopes & Fears", meaning: "what you secretly want or dread" },
  { label: "10. Outcome", meaning: "where this all lands" },
];

/**
 * Interpretation guardrail layer for the Vedic tab.
 *
 * Two jobs:
 *  1. hedge(): turn an absolute second-person claim into an interpretive one.
 *     Astrology describes a symbolic tendency. It does not diagnose a person,
 *     so "You read people fast" becomes "You may read people fast". Only the
 *     first claim in a sentence is softened, and sentences that already carry a
 *     qualifier (may, tends, can, often, usually) are left alone, so the copy
 *     stays readable instead of collapsing into mush.
 *  2. guard(): strips or rewrites deterministic statements about the topics the
 *     app is not allowed to predict (death, disease, divorce, guaranteed wealth,
 *     guaranteed children, diagnoses, morality).
 */

const HEDGE_PRESENT: Record<string, string> = {
  are: 'may be',
  'aren\u2019t': 'may not be',
  "aren't": 'may not be',
  is: 'may be',
  have: 'may have',
  will: 'may',
  'won\u2019t': 'may not',
  "won't": 'may not',
  cannot: 'may not',
  "can't": 'may not',
  'can\u2019t': 'may not',
  do: 'may',
  'don\u2019t': 'may not',
  "don't": 'may not',
};

const ALREADY_HEDGED = /\b(may|might|can|could|tend|tends|often|usually|sometimes|traditionally|possible|possibly|likely|suggests?)\b/i;

// Only the grammatical subject at the start of the sentence is softened.
// Matching "you" anywhere produced things like "People register you may as".
const HEDGE_TARGET = /^\s*(You)\s+([A-Za-z\u2019']+)/;

// "People register you as ..." style sentences: soften the third-person verb.
const OTHERS_TARGET = /^\s*(People|Others|Family|Colleagues|Partners)\s+(register|see|read|treat|expect|assume|notice|hand|give|describe|experience)\b/;

function hedgeSentence(sentence: string): string {
  if (!sentence.trim()) return sentence;
  if (ALREADY_HEDGED.test(sentence)) return sentence;

  const m = sentence.match(HEDGE_TARGET);
  if (m) {
    const [full, subj, verb] = m;
    const mapped = HEDGE_PRESENT[verb.toLowerCase()];
    const replacement = mapped ? `${subj} ${mapped}` : `${subj} may ${verb}`;
    return sentence.replace(full, replacement);
  }

  const othersMatch = sentence.match(OTHERS_TARGET);
  if (othersMatch) {
    return sentence.replace(othersMatch[0], `${othersMatch[1]} may ${othersMatch[2]}`);
  }

  // "Your voice carries authority" style claims.
  const yourMatch = sentence.match(/\b(Your|your)\s+([A-Za-z\u2019' ]{2,24}?)\s+(is|are|carries|comes|shows|depends|rises)\b/);
  if (yourMatch) {
    const verb = yourMatch[3];
    const softened = verb === 'is' ? 'may be' : verb === 'are' ? 'may be' : `may ${verb.replace(/s$/, '')}`;
    return sentence.replace(yourMatch[0], `${yourMatch[1]} ${yourMatch[2]} ${softened}`);
  }

  return sentence;
}

/** Softens absolute claims while keeping the copy specific and readable. */
export function hedge(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .split(/(?<=[.!?])\s+/)
    .map(hedgeSentence)
    .join(' ');
}

/**
 * Topics the generation logic must never state deterministically. If a copy
 * string ever drifts into one of these, it is dropped rather than shown.
 */
const FORBIDDEN = [
  /\b(will|going to) (die|divorce|cheat|be barren|never marry|never have children)\b/i,
  /\bguaranteed (wealth|riches|success|marriage|children)\b/i,
  /\byou will (be rich|become wealthy|get cancer|be diagnosed)\b/i,
  /\b(certain|inevitable) (divorce|death|illness|bankruptcy)\b/i,
  /\byou are (a narcissist|bipolar|autistic|depressed|an addict|immoral|a criminal)\b/i,
];

export function guard(text: string | null | undefined): string {
  if (!text) return '';
  return FORBIDDEN.some(rx => rx.test(text)) ? '' : text;
}

/** hedge + guard in one call. Use this on every library copy string. */
export function interpretive(text: string | null | undefined): string {
  return hedge(guard(text));
}

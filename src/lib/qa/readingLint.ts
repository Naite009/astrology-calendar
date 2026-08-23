/**
 * Reading lint: grades generated copy against the house rules.
 *
 * Every rule here exists because it was asked for at some point, so a
 * regression shows up as a numbered finding instead of a vibe.
 */

export type LintSeverity = 'error' | 'warning';

export interface LintFinding {
  rule: string;
  severity: LintSeverity;
  message: string;
  excerpt: string;
}

export interface LintResult {
  source: string;
  charCount: number;
  findings: LintFinding[];
  errorCount: number;
  warningCount: number;
  /** 0..1, errors cost more than warnings. */
  score: number;
}

export interface LintContext {
  /** Name of the person the copy is about, for name-spam checks. */
  name?: string;
  /** Expected pronouns, when the copy is third person. */
  pronouns?: { subject: string; object: string; possessive: string };
  /** Pronouns that must never appear (the other person's set). */
  forbiddenPronouns?: string[];
}

const excerptAround = (text: string, index: number, len = 0): string => {
  const start = Math.max(0, index - 45);
  const end = Math.min(text.length, index + len + 45);
  return `${start > 0 ? '…' : ''}${text.slice(start, end).replace(/\s+/g, ' ').trim()}${end < text.length ? '…' : ''}`;
};

/** Openers that carry no information. */
const CHITCHAT_OPENERS = [
  'hey, you', 'hey you', 'okay so', 'ok so', 'alright', 'all right,', 'buckle up',
  'real talk', "let's talk about", 'lets talk about', 'this is a big one',
  'welcome back', 'good news', 'here\u2019s the deal', "here's the deal",
  'let me tell you', 'first things first', 'so, ', 'well, ',
];

/** Vague words that were explicitly banned as personality labels. */
const BANNED_VAGUE = [
  'people-pleasing', 'people pleasing', 'difficult', 'dreamer', 'weird',
  'scattered', 'moody', 'unusual angles', 'intense', 'fairness',
  'deepest wound', 'greatest healing gift', 'feeling the unseen',
  'dissolving edges', 'dissolves edges', 'rebuilds from within',
  'this energy invites you to', 'trust what cannot be proven',
  'the universe is asking', 'cosmic download', 'divine timing',
];

/** Engineering vocabulary that reads like a spec sheet. */
const MACHINE_WORDS = ['mechanism', 'mechanisms', 'inputs', 'outputs', 'operating system', 'wiring diagram', 'data point'];

const JARGON_NEEDING_TRANSLATION = [
  'stellium', 'cazimi', 'combust', 'peregrine', 'antiscia', 'decan ruler',
  'dispositor', 'almuten', 'oriental', 'occidental',
];

const SIGN_NAMES = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra',
  'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

/** Run every lint rule over one block of generated copy. */
export function lintReading(text: string, source: string, ctx: LintContext = {}): LintResult {
  const findings: LintFinding[] = [];
  const lower = text.toLowerCase();
  const add = (rule: string, severity: LintSeverity, message: string, index: number, len = 0) =>
    findings.push({ rule, severity, message, excerpt: excerptAround(text, index, len) });

  // 1. Em dashes are banned outright.
  let emIdx = text.indexOf('\u2014');
  while (emIdx !== -1) {
    add('no-em-dash', 'error', 'Em dash in user-facing copy. Use a comma, period, colon, or parentheses.', emIdx, 1);
    emIdx = text.indexOf('\u2014', emIdx + 1);
  }

  // 2. No chitchat or hype opener. The first sentence must carry a fact.
  const firstSentence = text.trim().split(/(?<=[.!?])\s/)[0] ?? '';
  const firstLower = firstSentence.toLowerCase();
  for (const opener of CHITCHAT_OPENERS) {
    if (firstLower.startsWith(opener)) {
      add('no-chitchat-opener', 'error', `Opens with filler ("${opener}"). The first sentence must carry a real fact.`, 0, firstSentence.length);
      break;
    }
  }
  if (/^(hi|hello|hey|greetings)\b/i.test(firstSentence)) {
    add('no-chitchat-opener', 'error', 'Opens with a greeting instead of information.', 0, firstSentence.length);
  }

  // 3. Banned vague personality words.
  for (const word of BANNED_VAGUE) {
    const i = lower.indexOf(word);
    if (i !== -1) add('no-vague-labels', 'error', `Banned vague phrasing: "${word}".`, i, word.length);
  }

  // 4. Machine vocabulary.
  for (const word of MACHINE_WORDS) {
    const m = new RegExp(`\\b${word}\\b`, 'i').exec(text);
    if (m) add('human-vocabulary', 'warning', `Engineering word "${word}" in copy meant to sound human.`, m.index, word.length);
  }

  // 5. Name spam.
  if (ctx.name) {
    const first = ctx.name.split(/\s+/)[0];
    if (first.length > 2) {
      const hits = [...text.matchAll(new RegExp(`\\b${first}\\b`, 'gi'))];
      if (hits.length > 3) {
        add('no-name-spam', 'warning', `Uses the name "${first}" ${hits.length} times. Three is the ceiling for one reading.`, hits[3].index ?? 0, first.length);
      }
    }
  }

  // 6. Pronoun correctness.
  if (ctx.forbiddenPronouns?.length) {
    for (const p of ctx.forbiddenPronouns) {
      const m = new RegExp(`\\b${p}\\b`, 'i').exec(text);
      if (m) add('pronoun-accuracy', 'error', `Uses "${p}", which is not this person\u2019s pronoun set.`, m.index, p.length);
    }
  }

  // 7. Sign and house must never be conflated.
  const conflation = /\b(\d{1,2})(?:st|nd|rd|th)\s+(?:house\s+)?(?:in\s+)?(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)\s+house\b/i.exec(text);
  if (conflation) {
    add('sign-is-not-house', 'error', 'A sign name is being used as a house name.', conflation.index, conflation[0].length);
  }
  const signHouseSwap = /\bhouse of (aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)\b/i.exec(text);
  if (signHouseSwap) {
    add('sign-is-not-house', 'error', 'Houses are numbered, not named after signs.', signHouseSwap.index, signHouseSwap[0].length);
  }

  // 8. Glyphs must carry a transit or natal prefix and a sign.
  const bareGlyph = /(?<![tn]\.)(?<!sky )([\u2609\u263D\u263F\u2640\u2642\u2643\u2644\u2645\u2646\u2647\u2648])\s*(?:[\u260C\u260D\u25A1\u25B3\u26B9\u26BB\u269A]|conjunct|square|trine|opposite)/u.exec(text);
  if (bareGlyph) {
    add('aspect-notation', 'warning', 'Aspect glyph without a t. / n. / sky prefix, so it is unclear which chart it belongs to.', bareGlyph.index, bareGlyph[0].length);
  }

  // 9. Undefined jargon.
  for (const term of JARGON_NEEDING_TRANSLATION) {
    const i = lower.indexOf(term);
    if (i !== -1) add('translate-jargon', 'warning', `Technical term "${term}" appears without a plain-language translation.`, i, term.length);
  }

  // 10. Sign as a standalone personality label (Vedic rule, applies everywhere).
  const standalone = new RegExp(`\\byou (?:are|'re) (?:a |an )?(${SIGN_NAMES.join('|')})\\b[^,.]{0,12}[.,]`, 'i').exec(text);
  if (standalone) {
    add('no-standalone-sign-label', 'warning', 'A sign is used as a whole personality label with no house, ruler, or aspect behind it.', standalone.index, standalone[0].length);
  }

  // 11. Deterministic fortune-telling.
  const predictive = /\b(you will (?:meet|marry|get|receive|lose|move)|is guaranteed|destined to|you must not)\b/i.exec(text);
  if (predictive) {
    add('no-fortune-telling', 'warning', 'Deterministic prediction. Describe the pressure and the choice, not a fixed outcome.', predictive.index, predictive[0].length);
  }

  // 12. Sentence length: readable at a third-grade level.
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  const longest = sentences.reduce((acc, s) => (s.split(/\s+/).length > acc.split(/\s+/).length ? s : acc), '');
  if (longest.split(/\s+/).length > 45) {
    add('readable-sentences', 'warning', `Longest sentence runs ${longest.split(/\s+/).length} words. Break it up.`, text.indexOf(longest), 60);
  }

  // 13. Placeholder leakage.
  const placeholder = /(undefined|null|NaN|\[object Object\]|\{\{|\$\{)/.exec(text);
  if (placeholder) {
    add('no-placeholder-leak', 'error', `Template or placeholder leaked into copy: "${placeholder[0]}".`, placeholder.index, placeholder[0].length);
  }

  // 14. Duplicated sentences.
  const seen = new Map<string, number>();
  for (const s of sentences) {
    const key = s.trim().toLowerCase();
    if (key.length < 25) continue;
    if (seen.has(key)) {
      add('no-repeated-sentences', 'error', 'The same sentence appears twice in one reading.', text.indexOf(s), 60);
      break;
    }
    seen.set(key, 1);
  }

  const errorCount = findings.filter((f) => f.severity === 'error').length;
  const warningCount = findings.length - errorCount;
  const score = Math.max(0, 1 - (errorCount * 0.2 + warningCount * 0.05));

  return { source, charCount: text.length, findings, errorCount, warningCount, score };
}

/** Total lint rules in the suite, for reporting coverage. */
export const LINT_RULES = [
  'no-em-dash', 'no-chitchat-opener', 'no-vague-labels', 'human-vocabulary',
  'no-name-spam', 'pronoun-accuracy', 'sign-is-not-house', 'aspect-notation',
  'translate-jargon', 'no-standalone-sign-label', 'no-fortune-telling',
  'readable-sentences', 'no-placeholder-leak', 'no-repeated-sentences',
] as const;

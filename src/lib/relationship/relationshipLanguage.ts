/**
 * Language policy for relationship / synastry copy.
 *
 * Layered on top of the shared interpretation language policy
 * (src/lib/interpretation/languagePolicy.ts). This file adds the
 * relationship-specific removals: destiny/past-life certainty, astrology-derived
 * safety or clinical claims, harsh determinism, pseudo-research labelling, and
 * context gating (romantic/sexual/marriage/business vocabulary).
 */

import { sanitizeInterpretiveText } from '@/lib/interpretation/languagePolicy';
import { RelationshipContext } from './relationshipContext';

interface Rule {
  id: string;
  pattern: RegExp;
  replace: string;
}

/** Applied to every relationship string, in every context. */
const UNIVERSAL_RULES: Rule[] = [
  // ── clinical / safety / danger claims (a chart cannot assess any of these) ──
  { id: 'high-risk', pattern: /\bhigh[- ]risk\b/gi, replace: 'high-intensity' },
  { id: 'risk-level', pattern: /\brisk (?:level|score|factor)s?\b/gi, replace: 'intensity level' },
  { id: 'gaslight', pattern: /\bgas ?light(?:ing|s|ed)?\b/gi, replace: 'talk past each other' },
  { id: 'hotline', pattern: /\b(?:national domestic violence )?hotline\b(?:\s*\(?1-800-799-7233\)?)?/gi, replace: 'support you trust' },
  { id: 'hotline-number', pattern: /1-800-799-7233/g, replace: '' },
  { id: 'domestic-violence', pattern: /\bdomestic (?:violence|abuse)\b/gi, replace: 'serious relationship difficulty' },
  { id: 'toxic', pattern: /\btoxic\b/gi, replace: 'strained' },
  { id: 'exit-plan', pattern: /\bexit plan\b/gi, replace: 'clear agreements' },
  { id: 'couples-therapy', pattern: /\bcouples (?:therapy|counsel(?:l)?ing)\b/gi, replace: 'open conversation' },
  { id: 'therapy', pattern: /\b(?:individual )?therap(?:y|ist)\b/gi, replace: 'reflection' },
  { id: 'shadow-work', pattern: /\bshadow work\b/gi, replace: 'self-awareness' },
  // ── destiny / past-life certainty ─────────────────────────────────
  { id: 'fated-love', pattern: /\bFATED LOVE\b/g, replace: 'A STRONG NODAL CONTACT' },
  { id: 'fated-connection', pattern: /\b(?:a |this )?fated (?:love )?connection\b/gi, replace: 'a strongly emphasised connection' },
  { id: 'destined-romantic', pattern: /\bdestined romantic connection\b/gi, replace: 'strongly emphasised romantic contact' },
  { id: 'meant-to-be', pattern: /\bmeant to be\b/gi, replace: 'strongly emphasised' },
  { id: 'meeting-meant', pattern: /\byour meeting was meant to happen\b/gi, replace: 'this pairing has several close contacts worth noticing' },
  { id: 'drawn-by-destiny', pattern: /\bdrawn together by destiny(?:, not just preference)?\b/gi, replace: 'drawn together by several close chart contacts' },
  { id: 'met-before', pattern: /\b(?:suggests |implies )?you have met before(?: in some capacity)?\b/gi, replace: 'shows a noticeable nodal emphasis' },
  { id: 'family-before', pattern: /\byou were family before\b/gi, replace: 'a familiar, family-like ease is symbolised here' },
  { id: 'worked-together-before', pattern: /\byou (?:have )?worked together before\b/gi, replace: 'you may fall into working roles quickly' },
  { id: 'past-life-friend', pattern: /\bpast[- ]life (?:friend|lover|partner|bond|connection|tie|karma)\b/gi, replace: 'symbolic nodal theme' },
  { id: 'past-life-probability', pattern: /past[- ]life probability:?\s*\d+\s*%/gi, replace: 'symbolic nodal emphasis (not a probability)' },
  { id: 'past-life-probability-bare', pattern: /\bpast[- ]life probability\b/gi, replace: 'symbolic emphasis (not a probability)' },
  { id: 'soul-growth-focus-pct', pattern: /\bsoul growth focus:?\s*\d+\s*%/gi, replace: 'share of this app\u2019s symbolic weighting (not a probability)' },
  { id: 'soul-growth-focus', pattern: /\bsoul growth focus\b/gi, replace: 'growth-direction emphasis (symbolic)' },
  { id: 'twin-flame-connection', pattern: /\btwin flame connection\b/gi, replace: 'mirror-and-intensity theme (a symbolic label)' },
  { id: 'obsessed', pattern: /\bobsessed\b/gi, replace: 'very focused' },
  { id: 'past-life-generic', pattern: /\bpast[- ]life\b/gi, replace: 'symbolic (traditional) ' },
  { id: 'twin-flame', pattern: /\btwin flames?\b/gi, replace: 'intensely mirrored contact (a symbolic label)' },
  { id: 'karmic-debt', pattern: /\bkarmic debts?\b/gi, replace: 'a recurring theme' },
  { id: 'debt-repaid', pattern: /\bdebt (?:is )?repaid\b/gi, replace: 'theme feels resolved' },
  { id: 'professional-destiny', pattern: /\bprofessional destiny\b/gi, replace: 'shared work direction' },
  { id: 'financial-destiny', pattern: /\bfinancial destiny\b/gi, replace: 'shared attitude to resources' },
  { id: 'destined-structure', pattern: /\bdestined structure\b/gi, replace: 'structure that has to be built deliberately' },
  { id: 'healing-is-path', pattern: /\bthe healing IS the path\b/gi, replace: 'growing understanding here is part of the story' },
  { id: 'soul-contract-fact', pattern: /\byour soul contract (?:is|centers|centres)\b/gi, replace: 'one symbolic reading of this pairing centres' },
  { id: 'destiny-generic', pattern: /\bby destiny\b/gi, replace: 'by strong chart emphasis' },

  // ── astrology-derived safety / clinical claims ────────────────────
  { id: 'professional-support', pattern: /\bprofessional support (?:is )?recommended\b/gi, replace: 'conscious communication matters here' },
  { id: 'seek-therapy', pattern: /\bseek (?:therapy|counsel(?:l)?ing|professional help)\b/gi, replace: 'talk it through openly' },
  { id: 'danger', pattern: /\bdanger(?:ous)?\b/gi, replace: 'high-intensity' },
  { id: 'high-risk', pattern: /\bhigh[- ]risk relationship\b/gi, replace: 'high-intensity dynamic' },
  { id: 'abusive', pattern: /\babusiv\w*\b/gi, replace: 'unbalanced' },
  { id: 'manipulation-attempt', pattern: /\bmanipulation or domination attempts may occur\b/gi, replace: 'either person may push harder than they realise when they feel unheard' },
  { id: 'manipulative', pattern: /\bmanipulativ\w*\b/gi, replace: 'indirect' },
  { id: 'domination', pattern: /\bdominat(?:ion|e|ing)\b/gi, replace: 'over-steering' },
  { id: 'toxic', pattern: /\btoxic\b/gi, replace: 'strained' },
  { id: 'narcissist', pattern: /\bnarcissist\w*\b/gi, replace: 'self-focused at times' },
  { id: 'diagnosed', pattern: /\bdiagnos(?:ed|is|e)\b/gi, replace: 'described' },
  { id: 'retraumatize', pattern: /\bretraumati[sz]\w*\b/gi, replace: 'reopen a sore spot' },
  { id: 'victimhood', pattern: /\bvictimhood\b/gi, replace: 'a stuck role' },
  { id: 'trauma', pattern: /\btrauma(?:tic)?\b/gi, replace: 'sensitivity' },
  { id: 'violence', pattern: /\bviolen(?:ce|t)\b/gi, replace: 'volatile' },

  // ── harsh determinism ─────────────────────────────────────────────
  { id: 'deep-rage', pattern: /\bdeep rage\b/gi, replace: 'strong frustration' },
  { id: 'rage', pattern: /\brage\b/gi, replace: 'anger' },
  { id: 'destroying', pattern: /\bdestroy(?:ing|s|ed)?\b/gi, replace: 'undermining' },
  { id: 'destructive', pattern: /\bdestructive\b/gi, replace: 'corrosive if left unspoken' },
  { id: 'obsessive', pattern: /\bobsessive(?:ly)?\b/gi, replace: 'very focused' },
  { id: 'obsession', pattern: /\bobsession\b/gi, replace: 'intense focus' },
  { id: 'all-consuming', pattern: /\ball[- ]consuming\b/gi, replace: 'very absorbing' },
  { id: 'emotional-abandonment', pattern: /\bemotional abandonment\b/gi, replace: 'feeling emotionally unmet' },
  { id: 'mother-wound', pattern: /\bmother wounds?\b/gi, replace: 'early-family sensitivity' },
  { id: 'father-wound', pattern: /\bfather wounds?\b/gi, replace: 'early-family sensitivity' },
  { id: 'masculinity-wound', pattern: /\bmasculinity wounds?\b/gi, replace: 'sensitivity about assertiveness' },
  { id: 'abandonment-wound', pattern: /\babandonment wounds?\b/gi, replace: 'sensitivity about being left out' },
  { id: 'old-relationship-trauma', pattern: /\bold relationship (?:trauma|wounds?)\b/gi, replace: 'earlier relationship sensitivities' },
  { id: 'heals-the-other', pattern: /\b(\w+) (?:will |can )?heals? (?:the other|you|them)\b/gi, replace: '$1 may help the other understand a sensitive area' },
  { id: 'old-wounds-heal', pattern: /Old wounds surface not to harm, but to finally heal\.?/gi, replace: 'Sensitive areas can surface here, which also makes them easier to understand.' },

  // ── pseudo-research labelling / money promises ────────────────────
  { id: 'professional-grade', pattern: /\bprofessional[- ]grade\b/gi, replace: 'in-app' },
  { id: 'aligned-research', pattern: /\baligned with astrological research\b/gi, replace: 'defined by this app\u2019s interpretive rubric' },
  { id: 'research-shows', pattern: /\bastrological research (?:shows|suggests|confirms)\b/gi, replace: 'this app\u2019s rubric treats' },
  { id: 'millionaire', pattern: /\bMars[-–]Jupiter:?\s*The Millionaire Combination\b/gi, replace: 'Mars–Jupiter: drive meets optimism' },
  { id: 'millionaire-bare', pattern: /\bMillionaire Combination\b/gi, replace: 'drive-and-optimism contact' },
  { id: 'ventures-succeed', pattern: /\bambitious ventures succeed\b/gi, replace: 'ambitious plans get real energy behind them' },
  { id: 'financial-success', pattern: /\b(?:guaranteed |assured )?financial success\b/gi, replace: 'shared enthusiasm for resources' },
  { id: 'wealth-promise', pattern: /\bbrings wealth\b/gi, replace: 'brings enthusiasm' },
  { id: 'fated-caps', pattern: /\bFATED\b/g, replace: 'STRONGLY EMPHASISED' },
  { id: 'fated-word', pattern: /\bfated\b/gi, replace: 'strongly emphasised' },
  { id: 'destined', pattern: /\bdestined\b/gi, replace: 'strongly emphasised' },
  { id: 'destiny', pattern: /\bdestin(?:y|ies)\b/gi, replace: 'direction' },
  { id: 'karma', pattern: /\bkarma\b/gi, replace: 'recurring theme' },
  { id: 'karmically', pattern: /\bkarmically\b/gi, replace: 'symbolically' },
  { id: 'soul-contract-noun', pattern: /\bsoul contracts?\b/gi, replace: 'symbolic theme' },
  { id: 'meant-to-happen', pattern: /\bwas meant to happen\b/gi, replace: 'is worth noticing' },
  { id: 'meant-to-experience', pattern: /\bis meant to experience\b/gi, replace: 'may be developing' },
  { id: 'prosperity-caps', pattern: /\bPROSPERITY TOGETHER\b/g, replace: 'SHARED SENSE OF WHAT MATTERS' },
  { id: 'material-success', pattern: /\bindicates material success\b/gi, replace: 'is a symbolic flavour only' },
  { id: 'financial-gain', pattern: /\bpotential for financial gain\b/gi, replace: 'shared enthusiasm about resources' },
  { id: 'exit-plan', pattern: /\bExit plan[^.]*\.?/gi, replace: '' },
  { id: 'hotline', pattern: /National Domestic Violence Hotline[^.]*\.?/gi, replace: '' },
  { id: 'shadow-work', pattern: /\bactive (?:therapy|healing)[^.]*\.?/gi, replace: 'open, deliberate conversation about what each person needs.' },
];

/** Vocabulary swapped out when the context does not allow romantic framing. */
const NON_ROMANTIC_RULES: Rule[] = [
  { id: 'nr-sexual-chem', pattern: /\b(?:intense |strong |explosive )?sexual chemistry\b/gi, replace: 'strong energetic charge' },
  { id: 'nr-sexual', pattern: /\bsexual(?:ly)?\b/gi, replace: 'physical-energy' },
  { id: 'nr-erotic', pattern: /\berotic\w*\b/gi, replace: 'charged' },
  { id: 'nr-bedroom', pattern: /\bbedroom\b/gi, replace: 'private life' },
  { id: 'nr-intimacy', pattern: /\bphysical intimacy\b/gi, replace: 'closeness' },
  { id: 'nr-lovers', pattern: /\blovers?\b/gi, replace: 'close pair' },
  { id: 'nr-marriage', pattern: /\bmarriage\b/gi, replace: 'long-term commitment' },
  { id: 'nr-married', pattern: /\bmarried\b/gi, replace: 'formally committed' },
  { id: 'nr-couple', pattern: /\bpower couple\b/gi, replace: 'strong team' },
  { id: 'nr-couple2', pattern: /\bas a couple\b/gi, replace: 'as a pair' },
  { id: 'nr-romance-caps', pattern: /\bROMANCE!?\b/g, replace: 'WARMTH' },
  { id: 'nr-romantic', pattern: /\bromantic(?:ally)?\b/gi, replace: 'warm' },
  { id: 'nr-romance', pattern: /\bromance\b/gi, replace: 'warmth' },
  { id: 'nr-passion', pattern: /\bpassionate(?:ly)?\b/gi, replace: 'wholehearted' },
  { id: 'nr-passion2', pattern: /\bpassion\b/gi, replace: 'intensity' },
  { id: 'nr-attraction', pattern: /\b(?:magnetic |physical |strong )?attraction\b/gi, replace: 'pull toward each other' },
  { id: 'nr-chemistry', pattern: /\bchemistry\b/gi, replace: 'natural spark' },
  { id: 'nr-adores', pattern: /\badores?\b/gi, replace: 'appreciates' },
  { id: 'nr-love-life', pattern: /\byour love life\b/gi, replace: 'your close relationships' },
  { id: 'nr-in-love', pattern: /\bfalling in love\b/gi, replace: 'growing close' },
  { id: 'nr-partner-placement', pattern: /\bideal partner placement\b/gi, replace: 'strong one-to-one emphasis' },
  { id: 'nr-eros', pattern: /\bEros\b/g, replace: 'Eros (advanced point)' },
  { id: 'nr-juno-marriage', pattern: /\bJuno\s*=\s*marriage\b/gi, replace: 'Juno (advanced point)' },
];

/** Vocabulary swapped out when the context is not a business one. */
const NON_BUSINESS_RULES: Rule[] = [
  { id: 'nb-business-partner', pattern: /\bbusiness partner(?:ship)?\b/gi, replace: 'working together' },
  { id: 'nb-venture', pattern: /\bjoint ventures?\b/gi, replace: 'shared projects' },
  { id: 'nb-profit', pattern: /\bprofits?\b/gi, replace: 'results' },
];

/**
 * Applied when a romantic context involves a minor. Romance itself stays — liking,
 * closeness, trust, support — but every adult/sexual/marriage/cohabitation/
 * family-building/financial framing is swapped for age-appropriate wording.
 */
const MINOR_ROMANTIC_RULES: Rule[] = [
  { id: 'mr-sexual-chem', pattern: /\b(?:intense |strong |explosive )?sexual chemistry\b/gi, replace: 'strong spark and mutual liking' },
  { id: 'mr-sexual', pattern: /\bsexual(?:ly)?\b/gi, replace: 'physical-energy' },
  { id: 'mr-erotic', pattern: /\berotic\w*\b/gi, replace: 'charged' },
  { id: 'mr-eros', pattern: /\bEros\b/g, replace: 'warmth (advanced point, not used here)' },
  { id: 'mr-bedroom', pattern: /\bbedroom\b/gi, replace: 'time alone together' },
  { id: 'mr-physical-intimacy', pattern: /\bphysical intimacy\b/gi, replace: 'closeness' },
  { id: 'mr-intimacy', pattern: /\bintimacy\b/gi, replace: 'closeness' },
  { id: 'mr-hands', pattern: /\b(?:can\u2019t|cannot|can't) keep (?:their |your )?hands off (?:each other|one another)\b/gi, replace: 'want to be around each other a lot' },
  { id: 'mr-lovers', pattern: /\blovers?\b/gi, replace: 'a couple who are dating' },
  { id: 'mr-seduc', pattern: /\bseduc\w*\b/gi, replace: 'charm' },
  { id: 'mr-desire', pattern: /\b(?:sexual |erotic )?desire\b/gi, replace: 'interest in each other' },
  { id: 'mr-lust', pattern: /\blust\w*\b/gi, replace: 'strong attraction' },
  { id: 'mr-dominance', pattern: /\bdominance and surrender\b/gi, replace: 'who leads and who goes along' },
  { id: 'mr-marriage', pattern: /\bmarriage\b/gi, replace: 'a serious long-term bond later on' },
  { id: 'mr-married', pattern: /\bmarried\b/gi, replace: 'seriously committed later on' },
  { id: 'mr-marry', pattern: /\bmarry(?:ing)?\b/gi, replace: 'commit long-term later on' },
  { id: 'mr-spouse', pattern: /\bspouse|\bhusband\b|\bwife\b/gi, replace: 'partner' },
  { id: 'mr-wedding', pattern: /\bwedding\b/gi, replace: 'long-term commitment' },
  { id: 'mr-cohab', pattern: /\b(?:living together|cohabit\w*)\b/gi, replace: 'spending a lot of everyday time together' },
  { id: 'mr-moving-in', pattern: /\bmoving in together\b/gi, replace: 'being part of each other\u2019s daily routine' },
  { id: 'mr-children', pattern: /\b(?:having|raising) (?:children|kids)\b/gi, replace: 'shared plans far in the future' },
  { id: 'mr-family-building', pattern: /\bfamily[- ]building\b/gi, replace: 'long-term plans far in the future' },
  { id: 'mr-shared-finances', pattern: /\b(?:shared|joint) (?:finances|bank account|assets|income)\b/gi, replace: 'what they each value' },
  { id: 'mr-financial-partnership', pattern: /\bfinancial partnership\b/gi, replace: 'shared sense of what matters' },
  { id: 'mr-mortgage', pattern: /\bmortgage\b/gi, replace: 'long-term plan' },
  { id: 'mr-soulmate-lover', pattern: /\bsoul ?mate\b/gi, replace: 'a person who feels very familiar' },
];

/** Teen / child vocabulary softening for adult-life topics. */
const MINOR_RULES: Rule[] = [
  { id: 'm-career', pattern: /\bcareer(?:s)?\b/gi, replace: 'school and future interests' },
  { id: 'm-finances', pattern: /\bfinances\b/gi, replace: 'money habits and what they value' },
  { id: 'm-financial', pattern: /\bfinancial\b/gi, replace: 'money-related' },
  { id: 'm-mortgage', pattern: /\bshared resources\b/gi, replace: 'shared things and trust' },
  { id: 'm-domestic-bliss', pattern: /\bdomestic bliss\b/gi, replace: 'an easy time at home' },
  { id: 'm-commitment', pattern: /\blong-term commitment potential\b/gi, replace: 'a bond that can last' },
];

function applyRules(text: string, rules: Rule[]): string {
  let out = text;
  for (const r of rules) out = out.replace(r.pattern, r.replace);
  return out;
}

/** Sanitize one relationship string for a given context. */
export function sanitizeRelationshipText(text: string, ctx?: RelationshipContext | null): string {
  if (!text) return text;
  let out = sanitizeInterpretiveText(text);
  out = applyRules(out, UNIVERSAL_RULES);
  if (ctx) {
    if (!ctx.allowRomantic) out = applyRules(out, NON_ROMANTIC_RULES);
    if (!ctx.allowBusiness) out = applyRules(out, NON_BUSINESS_RULES);
    if (ctx.involvesMinor || ctx.stage !== 'adult') out = applyRules(out, MINOR_RULES);
    if (ctx.involvesMinor && ctx.allowRomantic) out = applyRules(out, MINOR_ROMANTIC_RULES);
  }
  return out.replace(/\s{2,}/g, ' ').trim();
}

/** Recursively sanitize every string in a relationship data tree. */
export function sanitizeRelationshipDeep<T>(value: T, ctx?: RelationshipContext | null): T {
  if (typeof value === 'string') return sanitizeRelationshipText(value, ctx) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => sanitizeRelationshipDeep(v, ctx)) as unknown as T;
  if (value instanceof Date) return value;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = sanitizeRelationshipDeep(v, ctx);
    }
    return out as unknown as T;
  }
  return value;
}

/** Never allowed in any relationship copy. Used by the QA lint and by tests. */
export const FORBIDDEN_RELATIONSHIP_PHRASES: RegExp[] = [
  /fated love/i,
  /destined romantic/i,
  /meant to be/i,
  /past[- ]life/i,
  /past[- ]life probability/i,
  /twin flame/i,
  /karmic debt/i,
  /you have met before/i,
  /you were family before/i,
  /professional destiny/i,
  /financial destiny/i,
  /the healing IS the path/i,
  /professional support/i,
  /high[- ]risk relationship/i,
  /\bdangerous\b/i,
  /\babusive\b/i,
  /manipulation or domination/i,
  /\bmanipulative\b/i,
  /deep rage/i,
  /all[- ]consuming/i,
  /emotional abandonment/i,
  /mother wound/i,
  /millionaire combination/i,
  /professional[- ]grade/i,
  /guaranteed financial success/i,
  /soul growth focus/i,
  /\bobsessive/i,
  /\bobsessed\b/i,
];

/** Additionally forbidden when the context is not romantic (family, friendship, business, neutral). */
export const FORBIDDEN_NON_ROMANTIC_PHRASES: RegExp[] = [
  /\bsexual\b/i,
  /\berotic/i,
  /sexual chemistry/i,
  /\bmarriage\b/i,
  /\blovers?\b/i,
  /\bromantic/i,
  /\bromance\b/i,
  /\bpassionate\b/i,
  /\bbedroom\b/i,
  /power couple/i,
];

/**
 * Additionally forbidden whenever a minor is involved, INCLUDING teen romance.
 * Teen dating copy may talk about liking, closeness and trust; it may never use
 * sexual, marital, cohabitation, family-building or financial-partnership framing.
 */
export const FORBIDDEN_MINOR_PHRASES: RegExp[] = [
  /\bsexual\b/i,
  /sexual chemistry/i,
  /\berotic/i,
  /\bEros\b/,
  /\blust\b/i,
  /\bseduc/i,
  /\bbedroom\b/i,
  /physical intimacy/i,
  /\bmarriage\b/i,
  /\bmarried\b/i,
  /\bspouse\b/i,
  /\bwedding\b/i,
  /living together/i,
  /\bcohabit/i,
  /moving in together/i,
  /dominance and surrender/i,
  /family[- ]building/i,
  /financial partnership/i,
  /joint finances/i,
  /shared finances/i,
  /\bsoulmate\b/i,
  /keep (?:their|your) hands off/i,
  /\bobsess/i,
];

export function findForbiddenRelationshipPhrases(
  text: string,
  ctx?: RelationshipContext | null
): string[] {
  if (!text) return [];
  const patterns = [...FORBIDDEN_RELATIONSHIP_PHRASES];
  if (ctx && !ctx.allowRomantic) patterns.push(...FORBIDDEN_NON_ROMANTIC_PHRASES);
  if (ctx?.involvesMinor) patterns.push(...FORBIDDEN_MINOR_PHRASES);
  const hits: string[] = [];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) hits.push(m[0]);
  }
  return hits;
}

/** Collect every string in a tree (for tests / QA sweeps). */
export function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => collectStrings(v, out));
  return out;
}

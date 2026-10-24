/**
 * Validator for the "Who this person is" natal reading.
 * Dependency-free so the edge function and the browser share one copy.
 */

export interface PersonSignature {
  name: string;
  chainIds: string[];
  evidenceIds: string[];
  /** What the combination does, following the chain step by step. */
  howItWorks: string;
  inWork: string;
  inRelationships: string;
  underStress: string;
  strength: string;
  stuckPoint: string;
}

export interface PersonCollision {
  between: string[]; // signature names
  description: string;
  evidenceIds: string[];
}

export interface PersonTransitNote {
  transitId: string;
  signatureName: string;
  meaning: string;
}

export interface PersonReading {
  headline: string;
  centralTension: string;
  signatures: PersonSignature[];
  collisions: PersonCollision[];
  whenLost: string;
  whatSteadies: string;
  transitsNow: PersonTransitNote[];
  clientQuestions: string[];
}

export interface ValidationContext {
  evidenceIds: string[];
  chainIds: string[];
  transitIds: string[];
  allowedAspects: { a: string; b: string; type: string }[];
}

const BODIES = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'North Node', 'South Node', 'Ascendant', 'Midheaven', 'MC'];
const ASPECT_WORDS: Record<string, string> = {
  conjunct: 'conjunction', conjunction: 'conjunction', 'conjoined with': 'conjunction',
  square: 'square', squares: 'square', squaring: 'square',
  opposite: 'opposition', opposes: 'opposition', opposition: 'opposition', opposing: 'opposition',
  trine: 'trine', trines: 'trine', sextile: 'sextile', sextiles: 'sextile',
  quincunx: 'quincunx', inconjunct: 'quincunx',
};

const DETERMINISM = [
  /\byou will\b/i, /\bdestined\b/i, /\bfated\b/i, /\bguarantee/i, /\bdoomed\b/i,
  /\byou are (?:not )?meant (?:to|for)\b/i, /\b(?:you are|is|are) built (?:for|to be)\b/i, /\bnever able\b/i,
];
const PATHOLOGY = [
  /\btrauma/i, /\bnarcissis/i, /\bdisorder\b/i, /\bADHD\b/, /\bautis/i, /\bbipolar\b/i,
  /\bdepress(?:ion|ed)\b/i, /\babuse/i, /\baddict/i, /\bmanipulative\b/i, /\btoxic\b/i, /\bdiagnos/i,
];

const canonBody = (s: string) => (s === 'MC' ? 'Midheaven' : s.replace(' ', ''));

function allText(r: PersonReading): string[] {
  return [
    r.headline, r.centralTension, r.whenLost, r.whatSteadies,
    ...r.signatures.flatMap((s) => [s.name, s.plainMeaning ?? '', s.howItWorks, s.inWork, s.inRelationships, s.underStress, s.strength, s.stuckPoint]),
    ...r.collisions.map((c) => c.description),
    ...r.transitsNow.map((t) => t.meaning),
    ...r.clientQuestions,
  ].filter((x): x is string => typeof x === 'string');
}

/** Light, safe cleanup: em/en dashes to commas, collapse doubled words. */
export function cleanPersonText(text: string): string {
  return text
    .replace(/\s*[\u2014\u2013]\s*/g, ', ')
    .replace(/\b(\w+)\s+\1\b/gi, '$1')
    .replace(/,\s*,/g, ',')
    .trim();
}

export function cleanPersonReading(r: PersonReading): PersonReading {
  const c = cleanPersonText;
  return {
    headline: c(r.headline), centralTension: c(r.centralTension), whenLost: c(r.whenLost), whatSteadies: c(r.whatSteadies),
    signatures: r.signatures.map((s) => ({ ...s, name: c(s.name), plainMeaning: s.plainMeaning ? c(s.plainMeaning) : s.plainMeaning, howItWorks: c(s.howItWorks), inWork: c(s.inWork), inRelationships: c(s.inRelationships), underStress: c(s.underStress), strength: c(s.strength), stuckPoint: c(s.stuckPoint) })),
    collisions: r.collisions.map((x) => ({ ...x, description: c(x.description) })),
    transitsNow: r.transitsNow.map((t) => ({ ...t, meaning: c(t.meaning) })),
    clientQuestions: r.clientQuestions.map(c),
  };
}

/** Find every "<Body> <aspect word> <Body>" mention in a text. */
export function findAspectMentions(text: string): { a: string; b: string; type: string; raw: string }[] {
  const body = BODIES.map((b) => b.replace(' ', '\\s')).join('|');
  const word = Object.keys(ASPECT_WORDS).sort((x, y) => y.length - x.length).join('|');
  const re = new RegExp(`\\b(${body})(?:'s)?\\s+(?:(?:is|are|sits|in a)\\s+)?(?:tightly\\s+|closely\\s+|exactly\\s+)?(${word})\\s+(?:to\\s+|with\\s+)?(?:your\\s+|natal\\s+|the\\s+)?(${body})\\b`, 'gi');
  const out: { a: string; b: string; type: string; raw: string }[] = [];
  for (const m of text.matchAll(re)) {
    const norm = (s: string) => BODIES.find((b) => b.toLowerCase() === s.toLowerCase().replace(/\s+/g, ' ')) ?? s;
    out.push({ a: canonBody(norm(m[1])), b: canonBody(norm(m[3])), type: ASPECT_WORDS[m[2].toLowerCase()], raw: m[0] });
  }
  return out;
}

export function validatePersonReading(r: unknown, ctx: ValidationContext): string[] {
  const errors: string[] = [];
  const x = r as PersonReading;
  if (!x || typeof x !== 'object') return ['Reading is not an object'];
  for (const k of ['headline', 'centralTension', 'whenLost', 'whatSteadies'] as const) {
    if (typeof x[k] !== 'string' || !x[k].trim()) errors.push(`Missing ${k}`);
  }
  if (!Array.isArray(x.signatures) || x.signatures.length < 3 || x.signatures.length > 6) errors.push('Need 3 to 6 signatures');
  if (!Array.isArray(x.collisions)) errors.push('collisions must be an array');
  if (!Array.isArray(x.transitsNow)) errors.push('transitsNow must be an array');
  if (!Array.isArray(x.clientQuestions)) errors.push('clientQuestions must be an array');
  if (errors.length) return errors;

  const ev = new Set(ctx.evidenceIds), ch = new Set(ctx.chainIds), tr = new Set(ctx.transitIds);
  const names = new Set(x.signatures.map((s) => s.name));
  x.signatures.forEach((s, i) => {
    if (!s.name?.trim()) errors.push(`Signature ${i + 1} has no name`);
    if (/\b(velvet|silk|silken|glass|mirror|storm|shadow|garden|alchemist|labyrinth|cathedral|tapestry|ember|tide)\b/i.test(s.name ?? '')) errors.push(`"${s.name}" uses a metaphor name; use a plain literal title`);
    if (!Array.isArray(s.evidenceIds) || s.evidenceIds.length < 2) errors.push(`"${s.name}" must cite at least 2 evidence ids`);
    for (const id of s.evidenceIds ?? []) if (!ev.has(id)) errors.push(`"${s.name}" cites unknown evidence ${id}`);
    for (const id of s.chainIds ?? []) if (!ch.has(id)) errors.push(`"${s.name}" cites unknown chain ${id}`);
    for (const k of ['howItWorks', 'inWork', 'inRelationships', 'underStress', 'strength', 'stuckPoint'] as const) {
      if (typeof s[k] !== 'string' || !s[k].trim()) errors.push(`"${s.name}" missing ${k}`);
    }
  });
  for (const c of x.collisions) for (const id of c.evidenceIds ?? []) if (!ev.has(id)) errors.push(`Collision cites unknown evidence ${id}`);
  for (const t of x.transitsNow) {
    if (!tr.has(t.transitId)) errors.push(`Unknown transit ${t.transitId}`);
    if (!names.has(t.signatureName)) errors.push(`Transit note links to unknown signature "${t.signatureName}"`);
  }

  const allowed = ctx.allowedAspects.map((a) => `${a.type}|${[a.a, a.b].sort().join('|')}`);
  for (const text of allText(x)) {
    for (const re of DETERMINISM) if (re.test(text)) errors.push(`Fixed-fate wording: "${text.match(re)?.[0]}"`);
    for (const re of PATHOLOGY) if (re.test(text)) errors.push(`Diagnostic wording: "${text.match(re)?.[0]}"`);
    for (const m of findAspectMentions(text)) {
      if (m.a === m.b) continue;
      if (!allowed.includes(`${m.type}|${[m.a, m.b].sort().join('|')}`)) errors.push(`Aspect not in the chart: "${m.raw}"`);
    }
  }
  return [...new Set(errors)];
}

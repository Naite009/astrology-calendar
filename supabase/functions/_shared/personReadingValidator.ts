/**
 * Validator for the "Who this person is" natal reading.
 * Dependency-free so the edge function and the browser share one copy.
 *
 * Fails the reading when it:
 *  - cites unknown evidence / chains / transits
 *  - names an aspect (incl. "X and Y are square") that is not a verified aspect object
 *  - states an orb that differs from the verified orb
 *  - puts a body in a sign, degree or house that differs from the deterministic placement
 *  - names a house ruler / chart ruler that is not the computed ruler
 *  - names a signature without at least 2 independent evidence chains
 *  - makes a life-purpose claim without a full chain (placement + ruler + aspect)
 *  - ignores a salient contradiction marked mustAddress
 *  - uses fixed-fate or diagnostic wording
 */

export interface PersonSignature {
  name: string;
  chainIds: string[];
  evidenceIds: string[];
  /** WHAT IT MEANS IN NORMAL LANGUAGE: 1-2 sentences, pattern or contradiction. */
  plainMeaning: string;
  /** THE ASTROLOGY: walkthrough "Because X... then Y... but Z...". */
  howItWorks: string;
  /** HOW IT SHOWS UP. */
  inLife?: string;
  inWork: string;
  inRelationships: string;
  underStress: string;
  inDecisions?: string;
  /** THE TENSION: what competing placement wants something else. */
  tension?: string;
  tensionEvidenceIds?: string[];
  /** HEALTHY EXPRESSION. */
  healthyExpression?: string;
  /** Legacy (v2 cache) fields. */
  strength?: string;
  stuckPoint?: string;
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
  allowedAspects: { a: string; b: string; type: string; orb?: number }[];
  /** Body -> sign / absolute longitude / house (planets and angles). */
  placements?: Record<string, { sign: string; longitude: number; house: number | null }>;
  /** House -> traditional ruler (+ modern co-ruler). */
  houseRulers?: Record<number, { traditional: string; modern?: string }>;
  /** Evidence id -> chain ids containing it (for independence checks). */
  evidenceChains?: Record<string, string[]>;
  /** Evidence id -> bodies. */
  evidenceBodies?: Record<string, string[]>;
  /** Salient tensions the reading must address: each needs one of its key ids cited. */
  mustAddress?: { id: string; fact: string; keyEvidenceId: string }[];
  /** Require the v3 signature fields (tension, healthyExpression). */
  requireFullSignature?: boolean;
}

const BODIES = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'North Node', 'South Node', 'Ascendant', 'Descendant', 'Midheaven', 'MC', 'IC'];
const PLANET_SET = new Set(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'NorthNode', 'SouthNode']);
const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const ASPECT_WORDS: Record<string, string> = {
  conjunct: 'conjunction', conjunction: 'conjunction', 'conjoined with': 'conjunction', conjuncts: 'conjunction',
  square: 'square', squares: 'square', squaring: 'square',
  opposite: 'opposition', opposes: 'opposition', opposition: 'opposition', opposing: 'opposition',
  trine: 'trine', trines: 'trine', sextile: 'sextile', sextiles: 'sextile',
  quincunx: 'quincunx', inconjunct: 'quincunx',
};

const DETERMINISM = [
  /\b(?:you|she|he|they) will\b/i, /\blifelong\b/i, /\bdestined\b/i, /\bfated\b/i, /\bguarantee/i, /\bdoomed\b/i,
  /\byou are (?:not )?meant (?:to|for)\b/i, /\b(?:you are|is|are) built (?:for|to be)\b/i, /\bnever able\b/i,
];
const PATHOLOGY = [
  /\btrauma/i, /\bnarcissis/i, /\bdisorder\b/i, /\bADHD\b/, /\bautis/i, /\bbipolar\b/i,
  /\bdepress(?:ion|ed)\b/i, /\babuse/i, /\baddict/i, /\bmanipulative\b/i, /\btoxic\b/i, /\bdiagnos/i,
];
/** Big life-purpose claims that need a complete chain. */
const BIG_CLAIM = [
  /\bhere to (?:change|heal|teach|lead|save|transform)\b/i, /\blife(?:'s)? purpose\b/i, /\bsoul(?:'s)? (?:mission|purpose)\b/i,
  /\bchange the world\b/i, /\bhigher calling\b/i, /\blife mission\b/i, /\bdestiny\b/i,
];

const canonBody = (s: string) => {
  const n = BODIES.find((b) => b.toLowerCase() === s.toLowerCase().replace(/\s+/g, ' ')) ?? s;
  return n === 'MC' ? 'Midheaven' : n.replace(' ', '');
};
const BODY_RE = BODIES.map((b) => b.replace(' ', '\\s')).join('|');
const SIGN_RE = SIGNS.join('|');
const ORD_WORDS: Record<string, number> = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12 };
const ORD = `(\\d{1,2}(?:st|nd|rd|th)|${Object.keys(ORD_WORDS).join('|')})`;
const ordNum = (s: string) => { const w = s.toLowerCase().split(/[- ]/)[0]; return ORD_WORDS[w] ?? parseInt(w, 10); };
/** House mention in a placement claim: numerals may omit "house"; spelled ordinals must say "house". */
const HOUSE_ORD = `(\\d{1,2}(?:st|nd|rd|th)|(?:${Object.keys(ORD_WORDS).join('|')})[- ]house)`;

function allText(r: PersonReading): { text: string; transit: boolean }[] {
  const plain = [
    r.headline, r.centralTension, r.whenLost, r.whatSteadies,
    ...r.signatures.flatMap((s) => [s.name, s.plainMeaning, s.howItWorks, s.inLife, s.inWork, s.inRelationships, s.underStress, s.inDecisions, s.tension, s.healthyExpression, s.strength, s.stuckPoint]),
    ...r.collisions.map((c) => c.description),
    ...r.clientQuestions,
  ].filter((x): x is string => typeof x === 'string').map((text) => ({ text, transit: false }));
  return [...plain, ...r.transitsNow.map((t) => ({ text: t.meaning, transit: true }))];
}

const sentences = (t: string) => t.split(/(?<=[.!?])\s+/);
const isTransitSentence = (s: string) => /\btransit|\bcurrently\b|\bright now\b|\bthis (?:year|month|season)\b|\bmoving (?:through|across|over)\b/i.test(s);

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
  const o = (v?: string) => (typeof v === 'string' ? c(v) : v);
  return {
    headline: c(r.headline), centralTension: c(r.centralTension), whenLost: c(r.whenLost), whatSteadies: c(r.whatSteadies),
    signatures: r.signatures.map((s) => ({ ...s, name: c(s.name), plainMeaning: o(s.plainMeaning) as string, howItWorks: c(s.howItWorks), inLife: o(s.inLife), inWork: c(s.inWork), inRelationships: c(s.inRelationships), underStress: c(s.underStress), inDecisions: o(s.inDecisions), tension: o(s.tension), healthyExpression: o(s.healthyExpression), strength: o(s.strength), stuckPoint: o(s.stuckPoint) })),
    collisions: r.collisions.map((x) => ({ ...x, description: c(x.description) })),
    transitsNow: r.transitsNow.map((t) => ({ ...t, meaning: c(t.meaning) })),
    clientQuestions: r.clientQuestions.map(c),
  };
}

/** Find every aspect claim: "<Body> <aspect word> <Body>" and "<Body> and <Body> are/form a <aspect>". */
export function findAspectMentions(text: string): { a: string; b: string; type: string; raw: string; index: number }[] {
  const word = Object.keys(ASPECT_WORDS).sort((x, y) => y.length - x.length).join('|');
  const re1 = new RegExp(`\\b(${BODY_RE})(?:'s)?\\s+(?:(?:is|are|sits|in a|forms? an?|makes? an?)\\s+)?(?:tight(?:ly)?\\s+|close(?:ly)?\\s+|exact(?:ly)?\\s+|wide\\s+)?(${word})\\s+(?:to\\s+|with\\s+)?(?:your\\s+|natal\\s+|the\\s+|her\\s+|his\\s+|their\\s+)?(${BODY_RE})\\b`, 'gi');
  const re2 = new RegExp(`\\b(${BODY_RE})\\s+and\\s+(?:the\\s+|natal\\s+)?(${BODY_RE})\\s+(?:are|form|make|sit)\\s+(?:in\\s+)?(?:an?\\s+)?(?:tight\\s+|close\\s+|exact\\s+|wide\\s+)?(${word})\\b`, 'gi');
  const out: { a: string; b: string; type: string; raw: string; index: number }[] = [];
  for (const m of text.matchAll(re1)) out.push({ a: canonBody(m[1]), b: canonBody(m[3]), type: ASPECT_WORDS[m[2].toLowerCase()], raw: m[0], index: m.index ?? 0 });
  for (const m of text.matchAll(re2)) out.push({ a: canonBody(m[1]), b: canonBody(m[2]), type: ASPECT_WORDS[m[3].toLowerCase()], raw: m[0], index: m.index ?? 0 });
  // "Mars-Uranus conjunction", "Sun/Moon square"
  const re3 = new RegExp(`\\b(${BODY_RE})\\s*[-/\u2013]\\s*(${BODY_RE})\\s+(?:tight\\s+|close\\s+|exact\\s+|wide\\s+)?(${word})\\b`, 'gi');
  for (const m of text.matchAll(re3)) out.push({ a: canonBody(m[1]), b: canonBody(m[2]), type: ASPECT_WORDS[m[3].toLowerCase()], raw: m[0], index: m.index ?? 0 });
  // Loose form with words in between: "Mars in its home sign of Scorpio exactly conjunct unpredictable Uranus".
  const tok = new RegExp(`\\b(${BODY_RE})\\b|\\b(${word})\\b`, 'gi');
  const toks = [...text.matchAll(tok)].map((m) => ({ body: m[1] ? canonBody(m[1]) : null, aspect: m[2] ? ASPECT_WORDS[m[2].toLowerCase()] : null, at: m.index ?? 0, len: m[0].length }));
  toks.forEach((t, i) => {
    if (!t.aspect) return;
    const prev = [...toks.slice(0, i)].reverse().find((x) => x.body);
    const next = toks.slice(i + 1).find((x) => x.body || x.aspect);
    if (!prev || !next?.body || t.at - prev.at > 70 || next.at - (t.at + t.len) > 30) return;
    out.push({ a: prev.body!, b: next.body, type: t.aspect, raw: text.slice(prev.at, next.at + next.len), index: prev.at });
  });
  const seen = new Set<string>();
  return out.filter((m) => { const k = `${m.type}|${[m.a, m.b].sort().join('|')}`; if (seen.has(k)) return false; seen.add(k); return true; });
}

/** Placement claims: body followed (same clause, no other body between) by a degree+sign, "in <Sign>", or "in the Nth". */
export function findPlacementClaims(text: string): { body: string; sign?: string; degree?: number; house?: number; raw: string }[] {
  const out: { body: string; sign?: string; degree?: number; house?: number; raw: string }[] = [];
  const token = new RegExp(`\\b(${BODY_RE})\\b|(?:\\bat\\s+)?\\b(\\d{1,2})°\\s*(?:(\\d{1,2})\\s*['′]\\s*)?(${SIGN_RE})\\b|\\bin\\s+(${SIGN_RE})\\b|\\bin\\s+(?:the|your|her|his|their)\\s+(?:hidden\\s+|private\\s+)?${HOUSE_ORD}(?:[- ]house)?\\b|[.;:!?]|\\b(?:ruled by|rules|ruler|whose ruler|dispositor|while|but|and|with|opposite|square|trine|sextile|conjunct)\\b`, 'gi');
  let last: { body: string; at: number } | null = null;
  for (const m of text.matchAll(token)) {
    const at = m.index ?? 0;
    if (m[1]) { last = { body: canonBody(m[1]), at }; continue; }
    if (!m[2] && !m[5] && !m[6] && !m[4]) { last = null; continue; } // clause break
    if (!last || at - last.at > 40) continue;
    if (m[4]) out.push({ body: last.body, sign: m[4], degree: Number(m[2]) + (m[3] ? Number(m[3]) / 60 : 0), raw: text.slice(last.at, at + m[0].length) });
    else if (m[5]) out.push({ body: last.body, sign: m[5], raw: text.slice(last.at, at + m[0].length) });
    else if (m[6]) out.push({ body: last.body, house: ordNum(m[6]), raw: text.slice(last.at, at + m[0].length) });
  }
  return out;
}

/** Ruler claims: "<Nth> house ruler <Body>", "<Body> rules the <Nth>", "<Body>, the chart ruler", "chart ruler <Body>". */
export function findRulerClaims(text: string): { house: number; body: string; modernOk: boolean; raw: string }[] {
  const out: { house: number; body: string; modernOk: boolean; raw: string }[] = [];
  const modernOk = /\bco-?ruler|\bmodern\b/i.test(text);
  const pats: [RegExp, (m: RegExpMatchArray) => [number, string]][] = [
    [new RegExp(`\\b${ORD}[- ]house ruler,?\\s+(?:is\\s+)?(${BODY_RE})\\b`, 'gi'), (m) => [ordNum(m[1]), m[2]]],
    [new RegExp(`\\b${ORD}[- ]house (?:is )?ruled by\\s+(${BODY_RE})\\b`, 'gi'), (m) => [ordNum(m[1]), m[2]]],
    [new RegExp(`\\b(${BODY_RE}),?\\s+(?:which |who )?(?:rules|ruler of)\\s+(?:the |your |her |his |their )?${ORD}\\b`, 'gi'), (m) => [ordNum(m[2]), m[1]]],
    [new RegExp(`\\bchart ruler,?\\s+(?:is\\s+)?(${BODY_RE})\\b`, 'gi'), (m) => [1, m[1]]],
    [new RegExp(`\\b(${BODY_RE}),?\\s+(?:is\\s+)?(?:the|her|his|their|your)\\s+chart ruler\\b`, 'gi'), (m) => [1, m[1]]],
  ];
  for (const [re, f] of pats) for (const m of text.matchAll(re)) { const [house, body] = f(m); out.push({ house, body: canonBody(body), modernOk, raw: m[0] }); }
  return out;
}

const lonDiff = (a: number, b: number) => { const d = Math.abs(((a - b) % 360 + 360) % 360); return d > 180 ? 360 - d : d; };

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
  const cited = new Set<string>();
  x.signatures.forEach((s, i) => {
    if (!s.name?.trim()) errors.push(`Signature ${i + 1} has no name`);
    if (/\b(velvet|silk|silken|glass|mirror|storm|shadow|garden|alchemist|labyrinth|cathedral|tapestry|ember|tide)\b/i.test(s.name ?? '')) errors.push(`"${s.name}" uses a metaphor name; use a plain literal title`);
    if (typeof s.plainMeaning !== 'string' || s.plainMeaning.trim().length < 30) errors.push(`"${s.name}" needs a plain-language meaning sentence right under the name`);
    else if (sentences(s.plainMeaning.trim()).length > 2) errors.push(`"${s.name}" plain meaning must be 1-2 sentences`);
    if (!Array.isArray(s.evidenceIds) || s.evidenceIds.length < 3) errors.push(`"${s.name}" must cite at least 3 concrete evidence items`);
    for (const id of s.evidenceIds ?? []) { if (!ev.has(id)) errors.push(`"${s.name}" cites unknown evidence ${id}`); cited.add(id); }
    for (const id of s.tensionEvidenceIds ?? []) { if (!ev.has(id)) errors.push(`"${s.name}" tension cites unknown evidence ${id}`); cited.add(id); }
    for (const id of s.chainIds ?? []) if (!ch.has(id)) errors.push(`"${s.name}" cites unknown chain ${id}`);
    for (const k of ['howItWorks', 'inWork', 'inRelationships', 'underStress'] as const) {
      if (typeof s[k] !== 'string' || !s[k].trim()) errors.push(`"${s.name}" missing ${k}`);
    }
    if (ctx.requireFullSignature) {
      for (const k of ['tension', 'healthyExpression'] as const) if (typeof s[k] !== 'string' || !s[k]!.trim()) errors.push(`"${s.name}" missing ${k}`);
      if (!s.tensionEvidenceIds?.length) errors.push(`"${s.name}" tension must cite the competing placement's evidence id`);
    }
    // Independence: at least 2 distinct chains and 2 distinct bodies behind the signature.
    if (ctx.evidenceChains) {
      const chainSet = new Set<string>([...(s.chainIds ?? []).filter((c) => ch.has(c))]);
      for (const id of s.evidenceIds ?? []) for (const c of ctx.evidenceChains[id] ?? []) chainSet.add(c);
      const bodySet = new Set<string>((s.evidenceIds ?? []).flatMap((id) => ctx.evidenceBodies?.[id] ?? []));
      if (chainSet.size < 2 || bodySet.size < 2) errors.push(`"${s.name}" needs at least 2 independent supporting evidence chains (different chains and bodies)`);
    }
    // Big claims need a full chain: placement + rulership + aspect, 4+ ids.
    const sigText = [s.plainMeaning, s.howItWorks, s.inLife, s.inWork, s.inRelationships, s.underStress, s.inDecisions, s.healthyExpression].filter(Boolean).join(' ');
    for (const re of BIG_CLAIM) {
      if (!re.test(sigText)) continue;
      const ids = s.evidenceIds ?? [];
      const full = ids.length >= 4 && ids.some((e) => e.startsWith('placement:')) && ids.some((e) => e.startsWith('rulership:')) && ids.some((e) => e.startsWith('aspect:'));
      if (!full) errors.push(`"${s.name}" makes a large life-purpose claim ("${sigText.match(re)?.[0]}") without a full placement, ruler and aspect chain`);
    }
  });
  for (const c of x.collisions) for (const id of c.evidenceIds ?? []) { if (!ev.has(id)) errors.push(`Collision cites unknown evidence ${id}`); cited.add(id); }
  for (const t of x.transitsNow) {
    if (!tr.has(t.transitId)) errors.push(`Unknown transit ${t.transitId}`);
    if (!names.has(t.signatureName)) errors.push(`Transit note links to unknown signature "${t.signatureName}"`);
  }
  for (const m of ctx.mustAddress ?? []) {
    if (!cited.has(m.keyEvidenceId)) errors.push(`Ignores a salient contradiction: ${m.fact}. Cite ${m.keyEvidenceId} in a signature tension or collision`);
  }

  const allowed = new Map(ctx.allowedAspects.map((a) => [`${a.type}|${[a.a, a.b].sort().join('|')}`, a]));
  for (const { text, transit } of allText(x)) {
    for (const re of DETERMINISM) if (re.test(text)) errors.push(`Fixed-fate wording: "${text.match(re)?.[0]}"`);
    for (const re of PATHOLOGY) if (re.test(text)) errors.push(`Diagnostic wording: "${text.match(re)?.[0]}"`);
    for (const re of BIG_CLAIM) if (!x.signatures.some((s) => s.plainMeaning === text || s.howItWorks === text) && [x.headline, x.centralTension, x.whenLost, x.whatSteadies].includes(text) && re.test(text)) errors.push(`Large life-purpose claim outside a fully evidenced signature: "${text.match(re)?.[0]}"`);
    for (const sentence of sentences(text)) {
      const transitish = transit || isTransitSentence(sentence);
      const mentions = transitish ? [] : findAspectMentions(sentence);
      for (const m of mentions) {
        if (m.a === m.b) continue;
        const a = allowed.get(`${m.type}|${[m.a, m.b].sort().join('|')}`);
        if (!a) { errors.push(`Aspect not in the chart: "${m.raw}"`); continue; }
        const orb = sentence.slice(m.index).match(/\(?\s*(\d{1,2}(?:\.\d+)?)°\s*(?:\d{1,2}['′]\s*)?orb/i) ?? sentence.slice(m.index).match(/\bwithin\s+(\d{1,2}(?:\.\d+)?)°/i);
        if (orb && typeof a.orb === 'number' && mentions.length === 1 && Math.abs(Number(orb[1]) - a.orb) > 0.25) errors.push(`Wrong orb for "${m.raw}": said ${orb[1]}°, verified ${a.orb.toFixed(1)}°`);
      }
      if (/\btight(?:ly|est)?\b/i.test(sentence) && !transitish) {
        for (const m of mentions) { const a = allowed.get(`${m.type}|${[m.a, m.b].sort().join('|')}`); if (a && typeof a.orb === 'number' && a.orb >= 2.5 && mentions.length === 1) errors.push(`"tight" used for a ${a.orb.toFixed(1)}° orb: "${m.raw}"`); }
      }
      if (/\bexact(?:ly)?\b/i.test(sentence) && !transitish) {
        for (const m of mentions) { const a = allowed.get(`${m.type}|${[m.a, m.b].sort().join('|')}`); if (a && typeof a.orb === 'number' && a.orb >= 1) errors.push(`"exact" used for a ${a.orb.toFixed(1)}° orb: "${m.raw}"`); }
      }
      if (ctx.placements && !transitish) {
        for (const p of findPlacementClaims(sentence)) {
          const real = ctx.placements[p.body];
          if (!real) { if (PLANET_SET.has(p.body)) errors.push(`Placement not in the chart: "${p.raw}"`); continue; }
          if (p.sign && p.sign !== real.sign) errors.push(`Wrong sign: "${p.raw}" (verified ${real.sign})`);
          if (p.sign && p.degree != null && p.sign === real.sign && Math.abs(p.degree - (real.longitude % 30)) > 1.05) errors.push(`Wrong degree: "${p.raw}" (verified ${Math.floor(real.longitude % 30)}° ${real.sign})`);
          if (p.house && PLANET_SET.has(p.body) && real.house !== p.house) errors.push(`Wrong house: "${p.raw}" (verified ${real.house ? `house ${real.house}` : 'no house: cusps unavailable'})`);
        }
      }
      if (ctx.houseRulers && !transitish) {
        for (const rc of findRulerClaims(sentence)) {
          const hr = ctx.houseRulers[rc.house];
          if (!hr) { errors.push(`Ruler claim without house data: "${rc.raw}"`); continue; }
          if (rc.body !== hr.traditional && !(rc.modernOk && rc.body === hr.modern)) errors.push(`Wrong ruler: "${rc.raw}" (verified ${hr.traditional}${hr.modern ? `, modern co-ruler ${hr.modern}` : ''})`);
        }
      }
    }
  }
  return [...new Set(errors)];
}

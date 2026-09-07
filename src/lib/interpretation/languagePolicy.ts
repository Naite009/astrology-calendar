/**
 * Deterministic language policy for generated interpretive copy.
 *
 * This is the single place that removes:
 *  - fixed-fate / deterministic wording,
 *  - accusatory personality verdicts (manipulative, controlling, obsessive...),
 *  - medical / physiological claims,
 *  - "deepest wound" / "wounded healer" certainties,
 *  - node language that frames the South Node as a defect,
 *  - unsupported superlatives and hype.
 *
 * Every generator (natal portrait, pattern engine, dominant planets, PDFs, reports)
 * runs its output through `sanitizeInterpretiveText` / `sanitizeInterpretiveDeep`,
 * so the phrasing standard cannot drift screen by screen.
 */

interface Rule {
  id: string;
  pattern: RegExp;
  replace: string | ((m: string, ...rest: string[]) => string);
}

const RULES: Rule[] = [
  // ── Chiron / wounding ──────────────────────────────────────────────
  { id: 'chiron-deepest-wound-possessive', pattern: /\byour deepest wounds?\b/gi, replace: 'an area of deep sensitivity for you' },
  { id: 'chiron-deepest-wound', pattern: /\bthe deepest wounds?\b/gi, replace: 'a tender, sensitive area' },
  { id: 'chiron-deepest-wound-bare', pattern: /\bdeepest wounds?\b/gi, replace: 'area of deep sensitivity' },
  { id: 'chiron-wounded-healer', pattern: /\bwounded healer\b/gi, replace: 'healing-through-understanding' },
  { id: 'chiron-whole-body', pattern: /healing here transforms your whole body/gi, replace: 'attention here often changes how you relate to your own limits' },
  { id: 'chiron-becomes-teaching', pattern: /\s*—\s*and becomes your teaching/gi, replace: ' — and can become a source of insight' },

  // ── Medical / physiological claims ─────────────────────────────────
  { id: 'medical-immune', pattern: /\bimmune (?:response|function|system)\b/gi, replace: 'energy and recovery rhythm' },
  { id: 'medical-health-blueprint', pattern: /reveal your health blueprint/gi, replace: 'describe how you tend to organise energy, routine, and rest (symbolically, not medically)' },

  // ── Nodes ──────────────────────────────────────────────────────────
  {
    id: 'nodes-keeps-you-small',
    pattern: /The South Node shows what comes easily but keeps you small\. The North Node shows what'?s scary but makes you grow\.\s*Lean toward the fear\.?/gi,
    replace:
      'The South Node describes skills and habits you already have in reserve. The North Node describes qualities worth developing alongside them. Growth here usually means widening your range, not abandoning what you are already good at.',
  },
  { id: 'nodes-keeps-small', pattern: /keeps? you small/gi, replace: 'is already well-practised' },
  { id: 'nodes-scary', pattern: /\bwhat'?s scary\b/gi, replace: 'what is less practised' },
  { id: 'nodes-lean-fear', pattern: /\blean (?:toward|into) the fear\b/gi, replace: 'stretch gently toward the less familiar side' },

  // ── Accusatory / pathologising verdicts ────────────────────────────
  { id: 'pluto-dominate', pattern: /drive to control, transform, or dominate/gi, replace: 'strong pull toward depth, change, and having real influence' },
  {
    id: 'pluto-overdrive',
    pattern: /Power struggles, obsession, manipulation, or destroying what you love\.?/gi,
    replace: 'Under strain, this can show up as holding on too tightly, or turning a disagreement into a contest of wills.',
  },
  { id: 'chronic-stress', pattern: /\bchronic stress\b/gi, replace: 'a sense of ongoing pressure' },
  { id: 'manipulation-list', pattern: /\bobsession, manipulation\b/gi, replace: 'over-intensity' },

  // ── Unsupported superlatives / hype ────────────────────────────────
  { id: 'hype-structural-genius', pattern: /\bstructural genius\b/gi, replace: 'strong instinct for structure' },
  { id: 'hype-genius-disruption', pattern: /Your genius is in disruption and innovation\.?/gi, replace: 'One expression of this is a talent for questioning systems and trying a different way.' },
  { id: 'hype-genius-disruption-2', pattern: /\byour genius is disruption\b/gi, replace: 'one of your strengths can be questioning the default' },
  { id: 'hype-break-others', pattern: /Optimism carries you through what would break others\.?/gi, replace: 'A sense of possibility often helps you keep going when a situation looks discouraging.' },
  { id: 'hype-surface-level', pattern: /You don'?t do surface-level anything\.?/gi, replace: 'You often prefer depth to small talk.' },
  { id: 'hype-extraordinary', pattern: /\bextraordinar(?:y|ily)\b/gi, replace: (m) => (m[0] === 'E' ? 'Notable' : 'notable') },
  { id: 'hype-superpower', pattern: /\b(?:is|are) (?:your|a) superpower\b/gi, replace: 'can be a real strength' },
  { id: 'hype-birthright', pattern: /\bis your birthright\b/gi, replace: 'is a recurring theme in your chart' },

  // ── Determinism ────────────────────────────────────────────────────
  { id: 'det-destined', pattern: /\bdestined to\b/gi, replace: 'well placed to' },
  { id: 'det-guarantees', pattern: /\bguarantees\b/gi, replace: 'often supports' },
  { id: 'det-this-means-you-will', pattern: /\bthis means you will\b/gi, replace: 'this can show up as you' },
  { id: 'det-you-must', pattern: /\bYou must CONSCIOUSLY develop\b/g, replace: 'It helps to consciously develop' },
  { id: 'det-you-must-2', pattern: /\byou must CONSCIOUSLY develop\b/g, replace: 'it helps to consciously develop' },
];

/** Phrases that must never appear in generated interpretive copy. Used by tests + QA. */
export const FORBIDDEN_INTERPRETIVE_PHRASES: RegExp[] = [
  /deepest wound/i,
  /wounded healer/i,
  /immune (?:response|function|system)/i,
  /keeps? you small/i,
  /lean (?:toward|into) the fear/i,
  /chronic stress/i,
  /drive to control, transform, or dominate/i,
  /obsession, manipulation/i,
  /destroying what you love/i,
  /structural genius/i,
  /genius is (?:in )?disruption/i,
  /would break others/i,
  /don'?t do surface-level anything/i,
  /destined to/i,
];

export function sanitizeInterpretiveText(text: string): string {
  if (!text) return text;
  let out = text;
  for (const rule of RULES) {
    out = out.replace(rule.pattern, rule.replace as string);
  }
  return out;
}

export function findForbiddenPhrases(text: string): string[] {
  if (!text) return [];
  const hits: string[] = [];
  for (const re of FORBIDDEN_INTERPRETIVE_PHRASES) {
    const m = text.match(re);
    if (m) hits.push(m[0]);
  }
  return hits;
}

/** Recursively sanitize every string in an object/array tree (structure preserved). */
export function sanitizeInterpretiveDeep<T>(value: T): T {
  if (typeof value === 'string') return sanitizeInterpretiveText(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => sanitizeInterpretiveDeep(v)) as unknown as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = sanitizeInterpretiveDeep(v);
    }
    return out as unknown as T;
  }
  return value;
}

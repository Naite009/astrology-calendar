/**
 * THE SHARED INTERPRETATION STANDARD
 * ==================================
 *
 * Single source of truth for HOW this app is allowed to interpret a chart.
 * Every path that produces interpretive text about a person — edge function
 * prompts, client-side copy generators, report/PDF builders, learning views —
 * must inherit this block instead of restating its own rules.
 *
 * This file is intentionally dependency-free plain TypeScript so that it can be
 * imported by Deno edge functions (`../_shared/interpretationStandard.ts`) and
 * by the Vite/browser bundle (`@/lib/interpretation/interpretationStandard`).
 *
 * Adding a rule here changes every downstream feature at once. That is the point.
 */

/** Requirement ids used by the deterministic guard + regression tests. */
export type InterpretationRequirementId =
  | 'chart_grounding'
  | 'constructive_first'
  | 'tendency_phrasing'
  | 'no_pathology'
  | 'no_determinism'
  | 'four_levels'
  | 'synthesis_over_lists'
  | 'hold_tension'
  | 'evidence_weight'
  | 'cite_factors'
  | 'teaching_traceability'
  | 'translate_jargon'
  | 'tone_standard'
  | 'no_flattening';

export interface InterpretationRequirement {
  id: InterpretationRequirementId;
  label: string;
  /** Must match the assembled prompt for the requirement to count as present. */
  pattern: RegExp;
}

/**
 * THE CORE RULE BLOCK.
 *
 * Wording matters: the guard below asserts that each requirement is still
 * literally present, so a future edit cannot quietly drop one of them.
 */
export const INTERPRETATION_STANDARD = `INTERPRETATION STANDARD — MANDATORY, APPLIES TO EVERY INTERPRETIVE SENTENCE YOU WRITE:

1. CHART GROUNDING: every meaningful statement must be traceable to a specific placement, aspect, house, dignity, or pattern in the data you were given. No free-floating personality claims. If the data does not support a claim, do not make it.
2. CONSTRUCTIVE FIRST: describe the functional, working expression of a placement BEFORE any challenge, tension, or growth edge. Never open a placement with what is wrong.
3. TENDENCY PHRASING: growth edges are possibilities, tendencies, or situational patterns — never fixed defects. Write "may over-analyze when uncertain", "can become especially sensitive to how they are perceived", "may need more reassurance when a relationship feels unclear". Never write "you are controlling", "you have identity wounds", "you are emotionally unstable", "you sabotage relationships".
4. NO PATHOLOGY: never turn ordinary astrological tension into pathology, trauma, abuse, addiction, neurodivergence, mental illness, personality disorder, attachment diagnosis, sexuality, criminality, or definitive family-history claims. Never state that a chart proves someone is narcissistic, manipulative, abusive, toxic, obsessive, controlling, or deceptive. You may only reference such context if the user explicitly supplied it as fact.
5. NO DETERMINISM: no "this means you will", "you are destined to", "this guarantees", "you always", "you never". Absolute language is allowed only when describing an astronomical calculation (a date, a degree, a direction of motion), never a human trait.
6. FOUR LEVELS: keep these distinct and label them in the reading where it helps — core temperament or baseline pattern; context-dependent expression; possible shadow or growth edge; mature or integrated expression.
7. SYNTHESIZE, DO NOT LIST: when several placements point the same direction, combine them into one pattern and explain why the combination matters. Do not restate each placement separately.
8. HOLD TENSION: when placements pull in different directions, show the tension instead of forcing one simplistic label. Structure it as "part of them seeks X, while another part needs Y, and growth usually comes from learning to do both".
9. EVIDENCE WEIGHT: do not manufacture certainty from weak evidence. One isolated placement cannot carry a sweeping conclusion unless the rest of the chart reinforces it. Say "one thread of the chart suggests" when the support is thin.
10. CITE THE FACTORS: state the underlying chart factors inside the narrative where practical — "with Moon in Capricorn plus Saturn strongly placed", "Venus square Pluto adds intensity to the relationship theme".
11. TEACHING TRACEABILITY: when a why-this-interpretation, learning, or teaching layer is requested, name the exact placements and aspects that produced each statement.
12. TRANSLATE JARGON: keep the language readable for a learner. Translate every technical term the moment you use it, in the same sentence.
13. MULTIPLE EXPRESSIONS: when a challenging configuration could manifest several ways, present the plausible range rather than selecting the harshest one.
14. NO ESSENTIALIZING: avoid "this is who you are". Prefer "this can show up as", "you may notice", "this often looks like".
15. NO FLATTENING: never reduce a whole person to their Sun sign, Moon sign, rising sign, one aspect, or one house. A conclusion about the person must draw on several independent chart factors.

TONE STANDARD: candid, nuanced, compassionate, concrete. Insightful without being mystical for its own sake. No canned therapy language. No generic "you are powerful / sensitive / intuitive" filler unless the chart supports it and you say which factors do. Warm, but never alarming or accusatory just to sound profound. Never simplify away real astrological depth — precision and kindness together.`;

/**
 * Preferred section order for any FULL chart interpretation. Features may rename
 * the labels to fit their surface, but the interpretive sequence stays the same.
 */
export const INTERPRETATION_OUTPUT_STRUCTURE = `FULL-CHART OUTPUT STRUCTURE — use this sequence whenever you produce a complete interpretation of a person (labels may be adapted to the feature, the interpretive order may not):
- Core temperament: how the person tends to operate
- Emotional style
- Communication and thinking
- Relationships and connection
- Motivation and drive
- Strengths and natural assets
- Growth edges: what becomes harder under stress
- Integrated or mature expression
- Final synthesis

FINAL SYNTHESIS BAR: the closing synthesis must read as a single coherent portrait of a real person, drawn from at least three independent chart factors, naming how they are most likely to grow. Quality target for depth and tone (never copy these words or traits — generate from the actual chart): "His chart suggests a very perceptive, emotionally invested, thoughtful person who takes relationships seriously. He is likely to grow most through staying curious, expressing himself more freely, trusting his own identity, and allowing relationships to be deep without needing every interaction to be completely figured out."`;

/** Requirements the guard asserts are present in any assembled prompt. */
export const INTERPRETATION_REQUIREMENTS: InterpretationRequirement[] = [
  { id: 'chart_grounding', label: 'Statements traceable to chart factors', pattern: /CHART GROUNDING/ },
  { id: 'constructive_first', label: 'Constructive expression before challenge', pattern: /CONSTRUCTIVE FIRST/ },
  { id: 'tendency_phrasing', label: 'Growth edges phrased as tendencies', pattern: /TENDENCY PHRASING/ },
  { id: 'no_pathology', label: 'No pathology, trauma or diagnosis claims', pattern: /NO PATHOLOGY/ },
  { id: 'no_determinism', label: 'No deterministic or fatalistic wording', pattern: /NO DETERMINISM/ },
  { id: 'four_levels', label: 'Baseline / contextual / shadow / mature levels', pattern: /FOUR LEVELS/ },
  { id: 'synthesis_over_lists', label: 'Synthesis instead of placement lists', pattern: /SYNTHESIZE, DO NOT LIST/ },
  { id: 'hold_tension', label: 'Contradictions held as tension', pattern: /HOLD TENSION/ },
  { id: 'evidence_weight', label: 'No certainty from weak evidence', pattern: /EVIDENCE WEIGHT/ },
  { id: 'cite_factors', label: 'Chart factors cited in the narrative', pattern: /CITE THE FACTORS/ },
  { id: 'teaching_traceability', label: 'Teaching layer names its sources', pattern: /TEACHING TRACEABILITY/ },
  { id: 'translate_jargon', label: 'Jargon translated for learners', pattern: /TRANSLATE JARGON/ },
  { id: 'tone_standard', label: 'Tone standard present', pattern: /TONE STANDARD/ },
  { id: 'no_flattening', label: 'No flattening to one placement', pattern: /NO FLATTENING/ },
];

export interface StandardAudit {
  ok: boolean;
  missing: InterpretationRequirement[];
  /** True when the full-chart structure block is also present. */
  hasOutputStructure: boolean;
}

/** Deterministic check that an assembled prompt still carries the standard. */
export function auditInterpretationStandard(prompt: string): StandardAudit {
  const text = prompt || '';
  const missing = INTERPRETATION_REQUIREMENTS.filter(r => !r.pattern.test(text));
  return {
    ok: missing.length === 0,
    missing,
    hasOutputStructure: /FULL-CHART OUTPUT STRUCTURE/.test(text) && /FINAL SYNTHESIS BAR/.test(text),
  };
}

export interface StandardOptions {
  /**
   * Include the full-chart section sequence + synthesis bar. Use for complete
   * portraits/reports; leave off for narrow surfaces (a daily line, one card).
   */
  fullChart?: boolean;
  /** Extra feature-specific rules appended after the shared standard. */
  extra?: string;
}

/**
 * Wrap any feature prompt with the shared standard. The standard is appended
 * last so it wins over anything a feature prompt said earlier.
 */
export function withInterpretationStandard(prompt: string, opts: StandardOptions = {}): string {
  const parts = [prompt.trim(), INTERPRETATION_STANDARD];
  if (opts.fullChart) parts.push(INTERPRETATION_OUTPUT_STRUCTURE);
  if (opts.extra?.trim()) parts.push(opts.extra.trim());
  return parts.join('\n\n');
}

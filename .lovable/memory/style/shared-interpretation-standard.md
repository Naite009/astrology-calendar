---
name: Shared Interpretation Standard
description: One canonical rule block governs ALL interpretive text (prompts, reports, PDFs, learning views); never restate or fork these rules per feature
type: preference
---

# Shared Interpretation Standard

Canonical text: `supabase/functions/_shared/interpretationStandard.ts`
Client entry: `src/lib/interpretation/` (re-export, never a second copy)

Every new AI prompt or copy generator that says anything about a person MUST wrap
its prompt with `withInterpretationStandard(prompt, { fullChart })`. Use
`fullChart: true` for complete portraits/reports so the nine-section structure and
final-synthesis bar are included.

## The rules (summary; the file is authoritative)
1. Chart grounding: every claim traceable to a placement/aspect/house/pattern.
2. Constructive expression BEFORE challenge or growth edge.
3. Growth edges as tendencies ("may", "can"), never fixed defects.
4. No pathology: no trauma, abuse, addiction, neurodivergence, mental illness,
   personality disorder, attachment diagnosis, sexuality, criminality, or family
   history inferred from a chart. Never "proves narcissistic/manipulative/toxic".
5. No determinism: absolutes only for astronomical calculations, never traits.
6. Keep four levels distinct: baseline, context-dependent, shadow, mature.
7. Synthesize agreeing placements; do not list them one by one.
8. Hold contradictions as tension ("part of them seeks X, another part needs Y").
9. No certainty from weak evidence.
10. Cite chart factors inside the narrative.
11. Teaching views name the exact placements behind each statement.
12. Translate jargon in the same sentence.
13. Present the plausible range for hard configurations, not the harshest reading.
14. No "this is who you are"; prefer "this can show up as".
15. Never flatten a person to one sign, aspect, or house.

## Enforcement
- `auditInterpretationStandard(prompt)` — deterministic check that a prompt still
  carries every rule.
- `lintInterpretiveText(text)` — checks the produced copy; pathology and
  determinism are hard errors. Folded into `src/lib/qa/readingLint.ts` as
  `interpretation-standard:*` rules, so the QA suite covers all surfaces.
- `src/lib/__tests__/interpretationStandard.test.ts` — asserts the rule text,
  that every interpretive edge function imports and applies the standard, and
  that no interpretive function passes a bare system prompt to a model.

This is a quality upgrade, never a simplification: do not strip astrological depth
or the app's teaching function to satisfy these rules.

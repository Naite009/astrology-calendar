# Shared Natal Synthesis Quality Pass

## Goal
Add a prominent **What This Chart Is Really Saying** section near the top of Natal Portrait and Chart Walkthrough. It will prioritize two to four chart-specific dynamics, explain the evidence, show how conflicting factors modify each other, and translate the result into ordinary life.

## Implementation
1. Create one shared deterministic synthesis engine used by both reading areas.
   - Consume existing verified chart positions, houses, canonical aspects, chart-ruler rules, psychological-function language, house descriptions, and element/modality interpretations.
   - Rank primary evidence first: Big Three relationships, chart ruler, angular planets, real three-major-planet stelliums, tight major aspects, and repeated sign/house themes.
   - Admit Nodes or Chiron only when angular or tightly linked to a primary factor.
   - Select two to four non-duplicative dynamics rather than walking through every section.

2. Give every selected dynamic the same transparent structure.
   - Exact evidence and why it carries weight.
   - Strongest pattern and concrete real-life translation.
   - A modifying or contradicting factor when one exists.
   - A practical takeaway.
   - The overall section will produce five to eight concise sentences, two or three recognition bullets, and one optional “What helps” line.

3. Integrate the same model into both interfaces.
   - Place it directly below each chart header and before the current detailed sections.
   - Keep all current tabs, cards, sections, calculations, and age controls intact.
   - Apply the existing age-aware voice in Chart Walkthrough and the shared language guard everywhere.

4. Add quality regressions using three structurally different chart fixtures.
   - Verify outputs differ, quote actual evidence, include lived examples and modifiers, avoid section-header recaps, unsupported biography, internal authoring guidance, and deterministic claims.
   - Preserve aspect, house, ruler, body-taxonomy, and element-count conventions.

## Technical Details
- Add a shared `chartSynthesis` interpretation module and model, with no new chart calculations.
- Reuse canonical `computeRankedAspects`, `getChartRulers`, `psychologicalFunctions`, `elementBalance`, and existing house/body taxonomy helpers.
- Attach the generated synthesis to `NatalPortrait` and `ReadingGuide`, then render it through one shared presentation component.
- Record the shared-source rule in the architecture guide and complete the roadmap only after validation.

## Validation
- Inspect generated output for at least Ava, Harrison, and a third contrasting fixture.
- Run focused synthesis and existing portrait/walkthrough tests.
- Run the full test suite, TypeScript check, production build, and desktop/mobile preview checks.
- Report changed files plus one concrete before/after chart example.

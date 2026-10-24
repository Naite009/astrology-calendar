# Roadmap

## Gina Solar Return and relationship accuracy
- [ ] Route every structured topic explicitly by ID/category through submission, regeneration and server pipeline; keywords only for free-form questions.
- [ ] Supply structured natal/SR relationship facts and require local checks regardless of external gate availability.
- [ ] Verify Gina relationship output contains Moon square DSC and Jupiter trine DSC, and Saturn opposite Mars near miss; do not close rebuild before numerical and output checks both pass.
- [x] Preserve precision and repair same-engine Solar Return solving and location gating.
- [x] Add deterministic relationship evidence, ruler chains, exact/near-miss distinction and fail-only validation of explicit claims.
- [x] 629 tests pass; Gina saved-chart automatic generation verified signed-in on desktop/mobile without saving test data. Exact-target return is 22:24:21.909 UT; saved-chart recomputation is 22:24:26.749 UT.
- [ ] Complete arbitrary-prose claim coverage and full Node/eclipse relationship timing scan; existing explicit-claim validator and Jupiter-to-Pluto scan do not establish universal coverage.
- [ ] Certify Gina angles at the source coordinates and a newly generated AI relationship reading. Exact Astro.com coordinates are missing; live regenerated reading was not exercised.

## Comprehensive Solar Return repair
- [x] Repair phase classification, distinct rulers, disclosed return metadata, planetary hours, progression context, and structured export integrity.
- [x] Validate exported major-aspect geometry, calculate eclipse contacts and activation windows, remove assumed Metonic repeats, prioritize major evidence, upgrade and live-test the reading model, and reject old-version inputs.
- [ ] Independent astronomical certification of imported positions/cusps, VOC, all advanced timing techniques, and comprehensive PDF prose remains incomplete; imported calculation metadata is missing.
- [x] 557 tests pass; automatic type/build checks pass. Lauren reference-chart desktop/mobile view, JSON, and live AI response verified.
- [ ] Regenerate Lauren in the actual signed-in account: preview-session minting is unavailable. The local reference verification is not a saved-account regeneration.

## Deeper Chart Walkthrough natal synthesis
- [x] Structurally deepen evidence-linked identity themes, developmental possibilities, inner/outer contrasts, internalized rules, and central tensions without invented history or coaching.
- [x] Preserve deeper schema-4 JSON output and add evidence, safety, distinct-chart, age, sparse-input, and non-Libra regressions.
- [x] Full suite: 533 tests pass; automatic build OK. Local reference reading and downloaded JSON verified in desktop/mobile browser, with resolved evidence and no overflow or page errors.
- [ ] Signed-in saved-chart recheck blocked: no active preview session and no matching account available for automatic sign-in. Requires the user to sign in in the preview.

## Chart Walkthrough natal identity correction
- [x] Replace action-oriented output with integrated temperament, modified expression, inside/outside distinctions, and evidence-backed repeating identity themes.
- [x] Remove coaching fields from practitioner JSON and ending; preserve separate Natal takeaway actions.
- [x] Add template-leakage/evidence regressions and verify saved Lauren, Ava, Max, Harrison, and Karina readings and schema-3 downloads; full tests and automatic type/build checks pass.

## Sign-expression contrasts
- [x] Add conditional full-chart modifier synthesis and per-conclusion evidence to Chart Walkthrough and JSON.
- [x] Verify private Leo, modified Libra, tight/wide contacts, ruler and configuration evidence, empty states, and saved Ava, Max, Harrison, and Karina output; 521 tests passed and automatic build OK.

## Practitioner Chart Walkthrough rebuild
- [x] Replace the planet-by-planet presentation with evidence-ranked themes, ruler connections, tensions, configurations, integration, and practitioner questions.
- [x] Preserve JSON parity; 515 regression tests and automatic builds pass. Verified saved Ava Kravitz, Max Levin, Harrison Bates, and Karina Client readings, JSON downloads, expanded evidence, and desktop/mobile rendering.

## Actionable Natal takeaways
- [x] Add shared theme-aware weekly actions to Natal takeaway generators, views, and report exports.
- [x] Add regression coverage and verify tests, types, and rendered takeaways.

## Done: birth-chart time/place/ephemeris repair (verified 2026-09)
- [x] Shared zone math (Intl based, exact historical offsets, ambiguous/nonexistent detection)
- [x] Birthplace resolution (precise coordinates + IANA zone, confidence levels, cache)
- [x] Single normalized birth moment API used by every calculator
- [x] Single ephemeris engine (apparent geocentric, true ecliptic of date, Placidus, true node, mean Lilith)
- [x] Fix Vertex formula and Part of Fortune sect test
- [x] Asteroids: JPL table 1920-01-01..2059-12-27, no extrapolation, endpoint interpolation fixed
- [x] Verification panel: audit trail, disambiguation, no auto-overwrite, angles gated on precise coordinates
- [x] Chart Library: remove -5 default; paste import records Mean/True Node and warns on true Lilith
- [x] Migrate progressions, solar arcs, Davison, sidereal, astrocartography, Human Design, forms
- [x] Human Design: Sun frame fix (v2) and Rave wheel start fix (v3, Gate 41 at 2° Aquarius); stored engine charts recomputed on load
- [x] Regression tests (129 passing) incl. DST, fractional zones, date line, circular compare, wheel anchors

## Ready
- West Hills Ascendant: app 7°45' Scorpio vs imported 7°09' (35'); Moon agrees to 0.7'. Swiss Ephemeris reproduces the app. Confirm the source chart's coordinates/time before trusting either.
- Background upgrade of stored natal charts lacking place metadata (geocode once, persist, never touch positions)
- Osculating (true) Lilith as a labeled optional variant
- Human Design: cross-check one published chart end to end (type, authority, profile, cross) once a trusted reference with exact birth data is available
- Mean node as a selectable natal setting in the Chart Library form (currently set only by paste import)

## Done: shared interpretation standard (2026-09)
- [x] Canonical rule block in supabase/functions/_shared/interpretationStandard.ts (chart grounding, constructive-first, tendency phrasing, no pathology, no determinism, four levels, synthesis over lists, tension held, evidence weight, cited factors, teaching traceability, jargon translation, no essentializing, no flattening)
- [x] Full-chart section sequence + final-synthesis quality bar
- [x] All 20 interpretive edge functions wrapped with withInterpretationStandard and deployed
- [x] Client re-export at src/lib/interpretation/ (standard + guard + softenClaim + section order)
- [x] lintInterpretiveText folded into src/lib/qa/readingLint.ts as interpretation-standard:* rules
- [x] 48 regression tests (222 total passing), typecheck + build clean

## Ready (interpretation quality)
- Deterministic copy banks in src/lib (aspect/house/planet libraries, Solar Return, synastry, family, HD) still carry hand-written phrasing; they inherit the QA lint but not the prompt rules. Sweep them through softenClaim/lintInterpretiveText bank by bank.
- Run lintInterpretiveText on AI output at request time (currently QA-suite only) once error budgets are agreed per surface.

## Chart Walkthrough tab (done)
- Reading Guide engine at src/lib/readingGuide/* (age context, factor meanings, engine) + ReadingGuideView tab.
- Regression suite: src/lib/__tests__/readingGuide.test.ts (Ava 2011-05-19, teen framing, low Water, Earth/6th blend, reasoning chain).
- Future option: advanced toggle for asteroids/extra points (deliberately excluded from the core flow).

## Done: psychological-function interpretation layer
- [x] Added one shared planet-function, sign-style, house-arena, and aspect-synthesis source of truth.
- [x] Upgraded Natal Portrait Big Three, element/modality, domains, and important-aspect explanations.
- [x] Upgraded Story of Self and Chart Walkthrough with psychological jobs, maps, and core dynamics.
- [x] Audited saved-chart output in the rendered Natal Portrait and Chart Walkthrough; removed malformed grammar, generic labels, and repeated aspect geometry.
- [x] Preserved age-aware and interpretation-safety rules; 423 tests, typecheck, and production build pass.

## Done: concrete natal house language
- [x] Replaced vague house emphasis with shared lived descriptions for all twelve houses: attention, repeated choices, what others notice, and a recurring question.
- [x] Kept exact house, planet count, named planets, and stellium evidence visible across Natal Portrait and Chart Walkthrough.
- [x] Added regression guards against vague house phrases without changing chart calculations.

## Done: concrete element and modality balance
- [x] Replaced leaked authoring guidance and abstract low-count wording with everyday behavior, alternative processing, practical supports, and chart-specific compensation.
- [x] Added combined two-light-element synthesis and concrete dominant/light modality behavior across Natal Portrait, Chart Walkthrough, and Foundations.

## Done: shared natal synthesis
- [x] Build one deterministic, evidence-ranked synthesis shared by Natal Portrait and Chart Walkthrough.
- [x] Place “What This Chart Is Really Saying” near the top of both reading surfaces without replacing detailed sections.
- [x] Validated distinct Ava, Max, and Harrison outputs; focused/full tests, typecheck, build, and rendered UI checks pass.

## Done: synthesis data-integrity audit
- [x] Enforce exact shared chart identity across Natal Portrait and Chart Walkthrough without silent fallback or stale output.
- [x] Align positions, houses, aspects, rulers, concentrations, and element/modality counts with canonical helpers.
- [x] Prevent duplicate evidence from occupying multiple top dynamics and verify age changes affect wording only.
- [x] Added boundary, fixture, cross-surface, selection, and provenance regressions; full checks and rendered QA pass.

## Done: Big Three synthesis correction
- [x] Replace generic sign-style templates with repeated-sign or mixed-pattern synthesis using Big Three elements, modalities, houses, and canonical aspects.
- [x] Keep whole-chart ten-planet element and modality counts separate, using them only as factual modifiers.
- [x] Add all-same-sign, same-element, mixed-pattern, house-contrast, and banned-phrase regressions.
- [x] Run full tests, TypeScript, production build, and rendered QA.

- [x] Natal Portrait "Who this person is" whole-chart narrative (chained evidence + named signatures + current transits).

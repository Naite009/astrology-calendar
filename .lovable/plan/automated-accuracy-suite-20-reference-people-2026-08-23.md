# Automated Accuracy Suite: 20 Reference People

Goal: a repeatable test suite that runs 20 reference birth charts with known published positions, scores both the chart math and the writing quality of the readings, and produces one report you can read.

## 1. The 20 reference people

A fixture file holds 20 birth data sets with expected positions. They are chosen to stress the parts most likely to break:

- Era spread: 1930s, 1950s, 1970s, 1980s, 1995, 2000s, 2010s, 2020s (asteroid table edges, node models).
- Timezone and DST edges: US pre-1966 local time, DST changeover days, half-hour zones (India, Adelaide), southern hemisphere (Sydney, Buenos Aires, Cape Town), near-equator and high-latitude births (Reykjavik) where house math strains.
- Time edge cases: midnight, noon, 23:59, and one chart with an unknown/approximate time.
- Known public figures plus synthetic charts, each with expected sign, degree and minute for the 10 planets, North Node, Chiron, Ascendant, MC, and the four angles.

Each expected value is stored with its source and tolerance so a small model difference does not read as a failure.

## 2. What gets scored

**A. Chart math accuracy**
- Recompute every chart from birth data only and compare to expected values in arc-minutes.
- Tiers: tight bodies (Sun through Pluto, North Node) must land inside a few arc-minutes; loose bodies (Chiron, asteroids, Lilith, Vertex, Part of Fortune) use the wider tolerance already defined in the verification engine.
- Extra invariants checked per person: Ascendant and Descendant exactly 180 degrees apart, MC/IC opposite, house cusps in ascending order, sign of each body derived from its own longitude, retrograde flags matching computed motion, Vertex not swapped with Antivertex.
- Cross-check the second path: solar return Vertex, live sky node, and astrocartography Ascendant math must agree with the main engine for the same moment.

**B. Reading quality**
Readings are generated for each of the 20 people and checked against your standing rules, entirely offline (deterministic composers, no AI call needed for the rule checks):
- No em dashes anywhere in user-facing copy.
- No chitchat or hype openers ("Hey, you.", "Let's talk about", "Alright", "Buckle up", etc.).
- No name repetition beyond the allowed count; pronouns correct for the person's saved pronouns and name-safe fallback when unset.
- Sign is never presented as house and house never as sign; every house claim traces to the computed cusps.
- Notation rule: transit and natal glyphs carry the t. / n. prefix and both signs.
- Banned vague words list (people-pleasing, difficult, dreamer, weird, scattered, moody, and the abstract-verb list).
- Structure rules: only `##` headers in plain readings, word and sentence caps per section, "What the chart is showing" box present with a single integrated paragraph underneath.
- Depth rules: no single-trait person descriptions, felt-sense copy standard, no standalone sidereal Sun label.

Every check reports which person and which sentence failed, not just a count.

## 3. The output

**Markdown report** written to a documents path and shown to you in chat:
- Header scorecard: overall pass rate, math accuracy percent, writing compliance percent.
- Per-person table: name, birth data, points verified out of total, worst delta, writing violations count.
- Per-body accuracy table aggregated across all 20 (which body drifts most).
- A failures section listing every violation with the exact offending text.

**In-app QA page** at a hidden route: runs the same suite in the browser and renders the scorecard with green/amber/red rows, expandable per person to see each body's delta and each writing violation. Uses the existing design tokens, no new styling language.

**Test runner**: the same suite as vitest specs so a regression fails the build, with the report generation as a script you can re-run anytime.

## Technical notes

- New `src/test/fixtures/referencePeople.ts` for the 20 data sets and expected values.
- New `src/lib/qa/accuracyAudit.ts` (math scoring, reuses `verifyChartAgainstEphemeris` and `autoFillChartBodies`) and `src/lib/qa/readingLint.ts` (writing-rule checks, one rule per function so rules are easy to add).
- New `src/lib/qa/runAccuracySuite.ts` returning a typed report object consumed by all three outputs.
- Specs under `src/lib/__tests__/accuracySuite.test.ts` and `readingLint.test.ts`.
- New route `/qa/accuracy` rendering `src/pages/QaAccuracy.tsx`, not linked from the main nav.
- No changes to calculation engines in this pass. If the suite exposes a math bug, I report it and we fix it as a separate approved change.

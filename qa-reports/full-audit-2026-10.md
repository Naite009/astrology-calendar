# Full accuracy + Natal Portrait depth audit (2026-10-24)

## 1. Single source of truth map

| Fact | Canonical source | Notes |
|---|---|---|
| Planet / Moon / Node / Chiron longitudes | `src/lib/ephemerisEngine.ts` (astronomy-engine 2.1.19 apparent geocentric, true equinox of date; Chiron from sampled JPL Horizons; true node) | Callers must read `.longitude` first (`signPositionToLongitude`, `toAbsoluteLongitude`). |
| Placidus cusps / ASC / MC | `src/lib/placidusHouses.ts`; ASC = `houseCusps.house1`, MC = `house10`; DSC/IC = exact opposites | |
| House of a longitude | `src/lib/houseForLongitude.ts` | `houseCalculations.getHouseForLongitude` now delegates (was a second implementation with a silent "1st house" fallback). |
| Aspect type + orb | `src/lib/aspects/classifyAspect.ts` + `src/lib/aspectOrbs.ts`; natal ranking `src/lib/aspectRanking.ts` | `aspectRanking` now uses full-precision longitudes (was degree+minute only). |
| Rulers / chart ruler | `src/lib/interpretation/chartRuler.ts` (traditional; modern co-ruler second) | |
| Ruler chains / dispositors | `src/lib/rulerChains.ts`; Natal Portrait evidence via `chartStoryMap.ts` | |
| Natal transits (exact dates) | `src/lib/transits/majorTransits.ts` (residual <= 1e-6°) | |
| Future relationship transits, exact vs near miss | `src/lib/futureTransitScanner.ts` | |
| Solar Return | `src/lib/solarReturnAutoCalculator.ts` (same Sun as ephemeris, 1e-6° residual, houses only with explicit return location) | |
| Progressions | `src/lib/secondaryProgressions.ts` | not re-audited in this pass |
| Topic routing | `quickTopicRouting.ts` by topic ID | `finding_partner` -> relationship regardless of prompt keywords (test). |
| Natal Portrait evidence | `src/lib/interpretation/chartStoryMap.ts` v2 | |
| Natal Portrait prose gate | `supabase/functions/_shared/personReadingValidator.ts` + `personReadingContext.ts` (server and browser) | Internal, no external dependency. |
| Ask / SR prose gate | `supabase/functions/_shared/verifiedReadingFacts.ts` (fail-only final gate) | Runs even when the external Replit checker is down. |

## 2. Why correct chart positions still produced wrong readings (root causes)
1. **Story map was anchors-only.** Only Rising, MC, Sun, Moon and concentrations had chains; Mercury, Mars, Saturn etc. appeared only if they touched an anchor, so the writer was blind to them.
2. **Angle contacts to DSC/IC did not exist as evidence.** Only ASC/MC were in aspect discovery, so "Moon square Descendant" (Gina, ~0.2°) could not be cited or validated. Derived DSC/IC contacts are now explicit.
3. **Precision loss in aspect discovery.** `aspectRanking` rebuilt longitudes from degree+minute, so boundary aspects (e.g. 8.01° read as 8°00′) were misclassified.
4. **Duplicate house helper** defaulted to the 1st house on failure.
5. **ASC-MC treated as an aspect/tension** (house-system geometry, not an aspect).
6. **Validator gaps:** only adjacent "X square Y" phrasing was checked; signs, degrees, houses, rulers, orbs, "exact"/"tight" wording, spelled ordinals, hyphenated "Mars-Uranus conjunction", third-person "she will", single-chain signatures, unearned life-purpose claims and ignored contradictions all passed. Found live: "Mars ... exactly conjunct ... Uranus" for a 1.7° orb.
7. **Timeouts:** two model passes exceeded the function time limit (504). The repair pass now runs as a second call.
8. **External gate dependency:** handled previously; local gates are authoritative and fail-only.

## 3. Remaining duplicated calculators (not yet consolidated)
Independent aspect angle tables / separation math still exist in roughly 40 files, including
`yearlyTransitCalculator.ts`, `electionalCalendar.ts`, `bestTimes.ts`, `voidOfCourseMoon.ts`, `familyAstrology.ts`, `familySystemSynastry.ts`, `childPortrait.ts`, `lifePatternAnalysis.ts`, `astrology.ts`, `detailedInterpretations.ts`, `pdfSections/keyDates*.ts`, `ComprehensiveTransitAnalysis.tsx`, `RelationshipTimingCalculator.tsx`, `SynastryTransitTimeline.tsx`, `MoonTransitCalendar.tsx`, `TimingView.tsx`, `LunarCycleView.tsx`, `health/*Card.tsx`, and `ask-astrology/crossChartActivations.ts`.
Own house functions remain in `AskView.tsx`, `askValidationFacts.ts`, `buildChartContext.ts`, `portraitComposer.ts`, `personalDailyGuidance.ts`, `parentChildSynastry.ts`, `LunarCycleView.tsx`, `SymptomAnalyzerCard.tsx`.
These surfaces are not covered by the new end-to-end gate.

## 4. Limitations
- No independent Swiss Ephemeris cross-check this pass. Cusp tests check internal consistency (opposite cusps exactly 180°, on-cusp boundaries), not Astro.com values for every cusp.
- Gina's Solar Return: the deterministic regression passes. Return time is about 21 s from Astro.com with assumed Mount Pocono coordinates; angles are within 0.1°.
- The prose gate is pattern-based. Claims phrased outside the recognised grammar are not certified.
- The live Gina Ask relationship reading was last withheld by the local gate. It has not been shown passing.

## 5. Why `accuracy.md` showed 100% and still missed real reading errors
- **Chart math** compared positions with reference values. It never looked at which facts reached the reading, so the anchors-only map, missing DSC/IC contacts and minute-rounded aspect inputs were all invisible to it.
- **Invariants** checked the chart's internal structure (opposite cusps and similar). They didn't check the evidence map or the prose.
- **Reading voice** linted local template text for banned words and readability. It never ran the AI reading or checked claims against the chart, so invented aspects, wrong houses, "exact" on wide orbs and one-placement life-purpose claims all scored 100%.
- **Upgrade:** `accuracySuite.test.ts` now adds an end-to-end semantic section. For each of the 20 reference charts it checks that all 10 planets have chains and all 12 house rulers are present, plants an invented aspect, and plants a single-placement life-purpose claim. Both planted errors must be rejected. Results are appended to `accuracy.md`. Live AI prose quality is still judged by hand (section 6).

## 6. Live Natal Portrait check (signed-in preview, Lauren Newman, 2026-10-24)
- The preview wrote 4 signatures, each with a plain meaning, a causal astrology walkthrough, five life areas, tension and healthy expression. Both gates passed.
- I hand-checked the cited facts against the saved chart:
  - Sun in fall, conjunct the ASC (3.3°)
  - Mars in domicile in the 1st, conjunct Uranus (1.7°)
  - Venus opposite Jupiter (1.3°, out of sign) in mutual reception
  - Sun square MC (0.7°), with the MC ruled by the 12th-house Moon
  - Saturn in Leo, in detriment in the 10th, sextile Mercury in the 12th (1.3°)
- The first preview draft used "will cause her to rebel", "irreversibly", "absolute independence" and "massive concentration". These are now rejected and covered by tests.

## 7. Model evaluation (same verified Lauren map)
- **gemini-3.1-pro-preview** (default): causal "Because… then… but…" walkthroughs, 4–5 evidence items per signature. Needed one correction pass for fate wording.
- **gpt-5:** denser evidence (6–9 items) and broader coverage (Neptune–Pluto, angle contacts), but reads more like a fact list than a walkthrough. Also needed one correction pass.
- **gpt-5.2:** failed twice on "she will" and invalid tension citations.
- **Decision:** keep Gemini. GPT-5 is not a material synthesis gain. `evalModel` stays in the function for evaluation requests only; the app never sends it.

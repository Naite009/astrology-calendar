---
name: Canonical fact-enforcement layer for Ask readings
description: Single source of truth for natal/SR retrograde, sign, degree, AND house. House/sign/retrograde drift is caught by one final validator; do not add prose house rewrites.
type: feature
---

The recurring SR house mismatches (e.g. Ask saying "SR Mercury in the 5th house" when the birthday SR JSON has Mercury in 8th) trace back to two places that disagreed:

1. The Ask edge function previously parsed SR house numbers ONLY from the `SR Planetary Positions:` text block in the chart context, which AskView built using a Whole Sign shortcut from the SR Ascendant. That shortcut disagreed with the cusp-based engine in `src/lib/solarReturnAnalysis.ts` that powers the user-facing birthday Solar Return PDF/JSON.
2. The model would then write whatever house it inferred, and the post-processor verified it against the same wrong text block, so nothing caught the error.

Permanent fix:

- `src/components/AskView.tsx#buildChartContext` builds SR houses with the SAME cusp logic the birthday engine uses (`findSRHouse` style — walk the 12 SR house cusps, pick the one whose range contains the planet's absolute longitude). Whole Sign is removed.
- `src/components/AskView.tsx#buildSolarReturnAnalysisBlock` injects an explicit `srPlanetPlacements` map (planet → {sign, degree, minutes, retrograde, srHouse, natalHouse}) built from the deterministic `analyzeSolarReturn` houseOverlays. The block prose tells the model this is the single source of truth for SR planet houses and forbids re-deriving from sign / Whole Sign / natal copy.
- `supabase/functions/ask-astrology/index.ts#parseSrAnalysisInjection` parses the `--- SOLAR RETURN ANALYSIS ---` block out of the chart context. Returns `{ srHouse, srRetro, source }` where source is `srPlanetPlacements | houseOverlays | none`.
- SR placement tables use this injection FIRST and only fall back to the text positions block via `overrideSRHouseNumbersFromContext`.
- Prose house claims must NOT be rewritten by regex sweeps. The final `runPlacementTableValidator` compares every explicit natal/SR house/sign/retrograde prose claim against the placement tables and fails loud on mismatch.
- `_validation_log` carries `facts_aware_retrograde_sweep_house_source` only as source diagnostics; it must not report house rewrites.

Rule for future failures:
- If SR houses disagree with the birthday report, FIRST check whether `runPlacementTableValidator` flagged drift and whether the placement table itself matches `srPlanetPlacements` / `houseOverlays`.
- Never add per-section correctors or broad regex rewrites for house claims. Fix upstream generation/interpolation, or let the final validator fail the job with a precise logged error.

Retrograde policy is unchanged (see prior notes): chart-context truth maps + BASE RULE 9 (UNIVERSAL SR RETROGRADE ACKNOWLEDGMENT) on the prompt side; sweep handles strip/flip wherever the model says the wrong thing.

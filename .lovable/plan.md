I confirmed the problem path: the Ask solar_return prompt is injecting SR data, but the SR Planetary Positions block is currently deriving houses from a Whole Sign shortcut in `AskView.tsx`, while the birthday Solar Return JSON/analysis uses the actual SR cusp-based house engine. That mismatch can feed the AI the wrong SR houses before the backend sweep ever sees the text. The existing `factsAwareRetrogradeSweep` then verifies prose against the same wrong chart-context SR house map, so it cannot catch this case.

Plan:

1. Fix SR house injection at the source
   - In `src/components/AskView.tsx`, stop calculating SR houses for the Ask prompt with the Whole Sign `calcSRHouse` shortcut.
   - Use the same cusp-based house calculation used by the birthday Solar Return analysis/PDF path so the `SR Planetary Positions:` block carries the birthday JSON truth.
   - For Nicki Newman’s 2026 SR, this should make the injected Ask context say Mercury 8th, Mars 8th, Saturn 8th, Neptune 7th, Pluto 5th, and the House 8 stellium.

2. Inject an explicit authoritative SR placement map into the Solar Return analysis block
   - Extend `buildSolarReturnAnalysisBlock()` to include a compact `srPlanetPlacements` array/map with each SR planet’s sign, degree, retrograde flag, and authoritative SR house.
   - Include `sunHouse`, `moonHouse`, `stelliums`, and house overlays as already intended, but make the planet-by-planet placement map impossible for the model to miss.
   - Add prompt wording that for SR planet house claims, `srPlanetPlacements` and the `SR Planetary Positions` block override any model inference.

3. Harden `factsAwareRetrogradeSweep` so it verifies against the injected SR placement map, not only the text `SR Planetary Positions` parser
   - Add a parser in `supabase/functions/ask-astrology/index.ts` for the `SOLAR RETURN ANALYSIS` JSON block to extract `srPlanetPlacements` and/or `houseOverlays`.
   - Build SR house truth maps with priority:
     1. injected `srPlanetPlacements`
     2. injected birthday-analysis `houseOverlays`
     3. fallback `SR Planetary Positions` block
   - Keep natal house truth from natal chart context as-is.

4. Broaden prose house-claim detection without changing unrelated behavior
   - Keep the current retrograde logic intact.
   - Extend the house verification inside `factsAwareRetrogradeSweep` to catch multi-planet claims such as “SR Mercury, SR Mars, SR Saturn, and SR Neptune are all in the 5th house,” not just single “Planet in the 5th house” claims.
   - Rewrite every named planet’s incorrect house claim to the deterministic truth, including central theme, closing message, subtitles/body/bullets, and any other prose field currently visited by the sweep.
   - Do not modify placement tables except through the existing deterministic placement-table correction paths.

5. Add diagnostics so the next JSON proves the fix ran
   - Log which SR house source was used (`srPlanetPlacements`, `houseOverlays`, or fallback context).
   - Keep logging `corrected_house_claims` and `house_examples` in `_validation_log` so any future correction is visible in the export.

6. Validate before saying it is fixed
   - Run a targeted type/build check if available.
   - Deploy the `ask-astrology` function.
   - Do not generate a new Ask solar_return reading as part of the fix.
   - After deployment, the next user-generated solar_return reading should be safe to send through the external gate; if it still produces any SR house mismatch, the diagnostic log will show whether the prompt source or the sweep source failed.
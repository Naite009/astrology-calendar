# Limited house-sensitivity phase: executed QA

## Scope
Kept every tab and name. No database edits, chart recalculations saved over imported data, tab merges, bulk prose rewrite, or changes to astronomical placement formulas. Combos and Sacred Script remain separate; their broader role/content changes are outside this phase.

## Exact modifications
- `src/lib/chartSignificance/birthTimeSensitivity.ts`: verified input, fractional-minute search endpoints, sub-millisecond bisection bracket and fail-closed residual check (0.00001°). Corrected a newly identified whole-sign issue: a house jump at a rising-sign change verifies that sign boundary, not an imaginary body-cusp conjunction. A house-system fallback change inside the interval is withheld.
- `src/lib/chartSignificance/cuspSensitivityRecord.ts`: one read-only record for precision policy, canonical birth moment, imported-coordinate precedence, actual earlier/later interval, computed/stored houses, solved crossings, nearest cusp and separate angle contacts. Verified time has no alternate-house interval. Rounded records provisionally use ±5 minutes, approximate records ±30, supplied asymmetric intervals override defaults. Unknown time strips time-dependent fields from reading copies only. Imported differences over 0.02° withhold alternate-house diagnostics rather than overwriting the source.
- `src/hooks/useNatalChart.ts`: optional reliability and actual interval metadata, no migration or default values written into existing records.
- `src/components/BirthTimeSensitivityNotice.tsx`: neutral shared notice, local boundary time with AM/PM and zone, residual, conditional life-area comparison, angle conjunction separate from occupied house, and explicit warning against establishing birth time by identification with prose.
- `src/components/ChartDecoderView.tsx`: notice on the actual selected chart; occupied houses now use canonical full-precision lookup instead of the removed rounded local calculator and silent house-1 fallback. Unknown-time reading input omits houses/angles.
- `src/components/NatalPortraitView.tsx`: shared notice and export record; unknown-time reading copies passed to Portrait, Who This Person Is and Soul Agreements, preserving stored values.
- `src/lib/interpretation/chartStoryMap.ts`: verified prior own-cusp correction, extracted its structured nearest-cusp calculation into the shared helper, removed the degree-only assertion that proximity proves time uncertainty, and suppressed precise houses for unknown-time reading inputs.
- `src/lib/readingGuide/readingGuideEngine.ts`, `src/components/ReadingGuideView.tsx`, `src/lib/readingGuide/downloadWalkthrough.tsx`: same record in Chart Walkthrough, readable HTML and JSON; unknown-time input excludes precise houses.
- `src/components/AskView.tsx`: same selected-natal-chart notice and conditional record in the shared chart context used by Ask requests. Unknown-time context has no precise houses. No Ask prose validator relaxed.
- `src/components/AstroCalendar.tsx`: existing primary-profile approximate-time toggle reaches these four views through an in-memory overlay, without overriding explicit chart reliability or saving changes.
- `AGENTS.md`: shared-record and whole-sign boundary rule documented.

## Executed tests
Full final command: `bunx vitest run --maxWorkers=2`.

**809 tests passed across 44 files**, including every pre-existing test. Final duration: 105.07 seconds. The prior 794-test baseline plus 15 added checks now passes. The suite regenerates the existing `qa-reports/accuracy.json` and `qa-reports/accuracy.md` reports.

New coverage is in `src/lib/chartSignificance/__tests__/cuspSensitivityRecord.test.ts`; existing Maria solver tests were tightened and executed. Includes verified/rounded/approximate/unknown policy, ±2-minute exclusion, asymmetric interval, source-coordinate precedence, imported-data mismatch preservation, profile-toggle compatibility, structured own-cusp label, Walkthrough record parity, and three near-cusp cases with four house systems.

### Maria: actual saved chart, not earlier approximate coordinates
Signed-in Maria Vezos: 1974-08-30, 04:10 local, Livingston NJ, imported latitude **40.8**, longitude **-74.31666666666666**, America/New_York, Placidus.

- Birth instant: **1974-08-30T08:10:00.000Z**, EDT (UTC-4).
- Recorded Moon house: **6**; nearest cusp **7**, about **0.419°** away.
- Boundary: **1974-08-30T08:07:46.294Z**, **4:07:46 AM EDT**, offset **-133.706 seconds**.
- Residual: **0.0000003659899903141195°**. Alternate house **7** is included only with an interval reaching this boundary; ±2 minutes excludes it.
- Maria's saved record contains no precision-source metadata. UI explicitly labels ±5 minutes provisional, not proof that her recorded time was rounded or wrong.
- The earlier approximate-coordinate fixture (40.7959, -74.3149) independently solves 08:07:46.453Z, offset -133.547 seconds. It is not substituted for her saved source.
- At 04:10, comparison fixtures in Placidus, Equal and Porphyry place Moon in house **6** with the same DSC boundary; Whole Sign puts it in house **7** without a ±5-minute jump. These are different techniques, not competing birth-time evidence.
- Own-cusp regression: 04:07 chart puts Moon in house **7**, nearest starting cusp **7**, never cusp 6 or 8.

### Two additional near-cusp cases (constructed, not saved client charts)
Sun and Venus use the historical Maria-date location fixture. Each boundary is solved, the birth instant shifted one minute after it, then solved again inside ±2 minutes. Ephemeris recomputation one second on either side confirms different houses; residual <0.00001°.

| Body | System | Boundary UTC | Houses immediately before/after |
|---|---|---|---|
| Sun | Placidus | 1974-08-30 06:47:24.939 | 3 → 2 |
| Sun | Equal | 1974-08-30 07:52:54.730 | 2 → 1 |
| Sun | Porphyry | 1974-08-30 06:25:45.928 | 3 → 2 |
| Sun | Whole Sign | 1974-08-30 07:19:41.833 | 3 → 2 |
| Venus | Placidus | 1974-08-30 07:13:21.679 | 2 → 1 |
| Venus | Equal | 1974-08-30 06:23:46.732 | 2 → 1 |
| Venus | Porphyry | 1974-08-30 06:51:50.878 | 2 → 1 |
| Venus | Whole Sign | 1974-08-30 07:19:41.833 | 2 → 1 |

Whole-sign rows verify the rising-sign boundary, not a planet touching a cusp.

## Live acceptance actually performed
- Fresh authenticated browser, actual account restored through the application's Cloud restore flow, Maria Vezos chosen via each page's picker.
- Identical neutral record visibly inspected in **Chart Walkthrough, Decoder, Natal Portrait and Ask**, with screenshots. No page exceptions captured.
- Both actual Walkthrough downloads inspected: HTML includes warning and conditional Moon comparison; JSON retains source coordinates, houses 6/7, exact UTC, offset and residual.
- Maria phone-sized Walkthrough check (390 × 844): notice visible, readable, no horizontal page overflow, no page exceptions. Desktop checked at 1280 × 1800.
- Latest automatic preview compilation: **build OK**, including type checks. No manual build/typecheck was run.

## Outstanding limits, not claimed complete
- This is the limited house-warning phase, not certification of all interpretation libraries, tab distinctiveness, all aspect tolerances, or the wider historical audit.
- Reliability/actual interval metadata is supported, and the existing primary-profile approximate toggle is connected. This phase adds **no new chart-edit precision selector**; older charts without a saved source explicitly show provisional checks rather than being called verified. Actual record precision still needs a real source.
- Two additional cases are constructed near-boundary Sun/Venus fixtures, not two separately authenticated saved clients.
- House-system comparisons use the app's deterministic engine. No new independent Swiss Ephemeris certification was performed.
- Ask's visible notice and shared request context were checked; a new model-generated Ask answer was **not** submitted or accepted as part of this QA. Natal Portrait's new warning was checked, not fresh AI authoring reliability.
- Scan finds the nearest boundary in each direction; no claim is made that a null crossing proves stability outside the requested interval. Extremely broad or exotic polar intervals are not comprehensively certified.
- All original saved chart positions and birth details remain unchanged by these diagnostics.
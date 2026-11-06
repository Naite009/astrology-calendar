# Audit: Tab Roles, Birth-Time Sensitivity, and Cross-Tab Accuracy

Read-only audit. Nothing was changed. "Confirmed in code" means it was traced to a file and line. "Needs live check" means it has not been run or compared numerically yet.

## 1. Maria's Moon test (key result)

- The "within 0.4° of the 7th House cusp, so the house is birth-time sensitive" note comes from `src/lib/interpretation/chartStoryMap.ts:209-218`. It fires whenever a planet is less than 1° from a cusp. **Confirmed in code.**
- It only measures **degrees**. Nothing in this path recalculates the chart at nearby birth times, so the app does not currently know whether the boundary is seconds, minutes, or an hour away. **Confirmed in code.**
- The ~4:07:46 AM crossing I gave earlier in chat came from a one-off calculation, not from the app. **Treat it as unverified** until a solver in the app reproduces it.
- **Wrong-cusp label bug (high):** if a planet sits just *inside* a house, near that house's own starting cusp, the code names the previous house's number (`chartStoryMap.ts:140-148`). Maria's Moon is at the *end* of the 6th, so her label happens to be correct, but other charts will be mislabeled. **Confirmed in code.**
- Angle vs house: the Descendant is treated as its own angle in the story map (`:277-284`) and in Ask (`AskView.tsx:856-875`), but "conjunct the Descendant" and "in the 7th house" are not kept separate everywhere.
- Spreading the uncertainty to other tabs: Natal Portrait shows the note. Chart Walkthrough (`practitionerSynthesis.ts:391`), Ask (`AskView.tsx:794-815`) and Solar Return (`solarReturnAnalysis.ts:80-114`) each work out houses separately and **do not show it**. So one tab can call her Moon "6th house, birth-time sensitive" while another states "6th house" as settled.
- Sign and aspects vs house: there is no shared rule that keeps the Moon's Aquarius and Saturn-ruled meaning, plus its aspects, stable while marking only the house-based (emotional-security setting) part as uncertain.

## 2. Calculation foundations

- House systems: Placidus, Whole Sign, Equal and Porphyry (`placidusHouses.ts:19-26`). Placidus uses semi-arc trisection and falls back to Porphyry near the poles, and it says so when it does. **Confirmed in code.**
- Time zones: historical IANA zones come from the browser's built-in time zone data (`time/zonedTime.ts:44-70`), with explicit handling for DST overlaps (`:208-238`). A fixed-offset fallback exists (`birthDataNormalization.ts:394-405`). 1974 New Jersey EDT (UTC-4) **needs a live check**.
- Coordinates: coordinates in an imported file win (`birthDataNormalization.ts:261-281`), then offline lookup, then geocoding.
- Rulership: traditional rulers are the default, and modern rulers are only an opt-in (`chartDecoderLogic.ts:167-188`). No modern-only text defect was found, but not every table has been checked.

## 3. Tab inventory (switcher: `src/components/AstroCalendar.tsx:992-1210`)

| Tab | What it does today | Overlap |
|---|---|---|
| Chart Decoder | Placements, aspects, dignity; own aspect math (`ChartDecoderView.tsx:159,205`) | Repeats aspect detection |
| Natal Portrait | Written "who this person is" reading | Shares synthesis with Walkthrough |
| Reading Guide / Walkthrough | Practitioner reading with evidence | Shares synthesis with Portrait (fine) |
| Patterns | Sky-wide stelliums, rare and node aspects | Own pattern orbs |
| Combos | Planet-combination write-ups from large tables | Reinterprets natal placements again |
| Aspects | Ranked natal aspects with copy | Overlaps Decoder and Combos |
| Ask | Question-driven AI readings | Own house lookup |
| Sacred Script | Element, Saturn and progression teachings | Separate natal reading again |
| Timing | Best times, void-of-course Moon, planetary hours | Distinct |
| Transit Calendar | Day-by-day personal transits | Same engine as Year Ahead |
| Year Ahead | Annual transit overview | Same engine as Transit Calendar |
| Solar Return | Birthday-year chart | Own aspect orb table |
| Timelord | Profections and timelords | Distinct |

## 4. Findings

**Critical:** none found in code.

**High**
1. Wrong-cusp label (`chartStoryMap.ts:140-148`).
2. Birth-time sensitivity is measured only in degrees. There is no time solver and no shared flag.
3. The near-cusp uncertainty is missing from Walkthrough, Ask and Solar Return.
4. Orb rules exist outside `aspectOrbs.ts`: `solarReturnAnalysis.ts:300-310`, `chartPatterns.ts` (several places), `chartShapes.ts:265-402`, `dominantPlanetsEngine.ts:276`. The same aspect can be "in" on one tab and "out" on another.

**Medium**
5. Six tabs reinterpret the same natal placements through different text tables (Combos, Sacred Script, Aspects, Decoder, Portrait, Walkthrough).
6. Large static copy libraries (`aspectModifiers.ts` 3,087 lines, `planetaryCombinations.ts` 2,752, `sacredScriptHelpers.ts` 1,564, `elementTeachings.ts` 1,250, and others) bypass the shared quality checks. They need a phrase and certainty scan.
7. Combos falls back to "closest matching building blocks" copy (`CombosView.tsx:458-459`), which tends toward generic filler.
8. Transit Calendar and Year Ahead overlap. That is acceptable if their roles are separated (day view vs year view).

## 5. Recommended architecture: one shared "chart significance" model

A new `src/lib/chartSignificance/` module, computed once per chart. Every tab reads from it:
- **Per planet:** sign, degree, house, distance to the nearest cusp **with the correct cusp number**, and conjunctions to angles (kept separate from house placement).
- **Birth-time sensitivity solver:** recalculate the houses and the planet at shifted birth times, then narrow down the exact moment the planet crosses the cusp (search outward, then bisection). This gives "house changes if born X min Y s earlier or later", with a check that the result actually lands on the cusp. If no crossing turns up within ±2 hours, it says "stable". This follows the exact-date rule: a solved crossing, never an estimate from motion speed.
- A **stability label** for each fact: sign, aspects and rulership are stable, while house, angle and house-ruler items are marked time-sensitive.
- **Shared orb policy:** every aspect, pattern and shape check uses `aspectOrbs.ts`. Wider pattern orbs become named options in that file, not local numbers.

## 6. Tab changes (for your review)

- **Keep, sharpened:**
  - Chart Decoder becomes the technical check: exact degrees, cusp distances, the solved crossing time, angle vs house.
  - Natal Portrait gives lived meaning and, only when a solved crossing is within the time-uncertainty window, an "if born a few minutes earlier" alternative.
  - Reading Guide offers open, non-leading questions and real-life examples, with a fixed note that a client relating to a description cannot prove a birth time.
  - Timing, Timelord and Solar Return stay as they are.
- **Merge:** Aspects into Chart Decoder as an "Aspects" section, since both list natal aspects. Combos and Sacred Script are a decision for you (see questions).
- **Rename:** Transit Calendar to "Day-by-Day Transits" and Year Ahead to "Year Overview", or merge them into one tab with Day and Year views.
- **Ask:** reads the shared model so it carries the same uncertainty notes.

## 7. Implementation order

1. Fix the wrong-cusp label and add a test.
2. Build the shared significance model and the time solver, with tests.
3. Verify Maria live (1974 EDT offset, Livingston coordinates, Placidus cusps, solved crossing) against an independent recalculation.
4. Route the cusp flags into Decoder, Portrait, Walkthrough, Ask and Solar Return.
5. Bring all orb rules into `aspectOrbs.ts`.
6. Scan the large copy libraries for banned phrases and overclaims, and fix or retire them.
7. Tab merges and renames once you approve them.

## 8. Tests and example expectations

- Cusp label: a planet 0.3° after the 8th cusp is labeled "8th cusp", not "7th".
- Maria: the Moon is in the 6th at 4:10 AM EDT, and the solver returns one crossing into the 7th at an earlier time, checked to land on the cusp (within 0.001°). The seconds come from the solver, not from chat.
- The same chart with the time shifted by an hour: Moon sign and aspects unchanged, only house-based items change.
- Angle vs house: a planet 2° *before* the Descendant (still in the 6th) is reported as "conjunct the Descendant" and "6th house", never "7th house".
- Orb parity: one aspect pair gives the same in/out answer in Decoder, Solar Return, Patterns and Walkthrough.
- Cross-tab: Maria's Moon house note reads the same in Decoder, Portrait, Walkthrough and Ask.
- Copy scan: the large tables contain no banned phrases or certainty-class wording.

## Needs live verification (not confirmed)
- Maria's actual crossing time and her UTC offset for 1974.
- The exact on-screen text in Decoder, Walkthrough and Ask for her chart.
- How accurate the house cusps are compared with an outside reference.

## Questions for you
- Combos and Sacred Script: keep each with one distinct purpose (Combos as "how two planets work together", Sacred Script as an "elements and Saturn teaching" guide), or merge them into the Portrait?
- How many minutes of birth-time uncertainty should trigger the alternative-house reading (suggested: ±5 min for a recorded time, ±30 min for a rounded one)?

## What I found in the PDF (full audit, not just the user's description)

I read every section of `reading_reading_report_37.pdf` against the natal & SR placement tables on page 1. Here is the actual error inventory:

### Confirmed natal-house bugs (the structural problem you flagged)
1. **Page 8** — "Your natal Saturn is in Aries in the **8th house**." Truth: natal Saturn is in **House 6**. SR Saturn is in House 8 — the SR house bled onto the natal sentence.
2. **Page 4** — "natal Lilith in Cancer in the **1st house**." Truth: natal Lilith is in **House 8**. (Page 9 gets it right in the same document.)
3. **Page 9** — "natal Uranus retrograde at 0°30' Libra **in the 9th house**." Truth: natal Uranus is in **House 11**. (Position 0°30' Libra is now correct — that fix held. The house is what's wrong.)

### Confirmed regression of last loop's fix
4. **Page 3 elemental balance prose.** Header correctly reads "Dominant Element: Earth · Dominant Modality: Mutable." But the body is verbatim Fire/Cardinal language: *"You live forward, you think out loud, act on instinct… your pace starts things, you get bored maintaining what is already running… you assert, initiate, and often process by doing."* The Earth/Mutable corrector we shipped last loop did not fire on this reading. Either the mismatch detector's trigger phrases missed this exact wording, or the section body isn't being passed through the corrector at all.

### What is actually working (do not touch)
- BASE RULE 10 retrograde carry-through: every retrograde planet (Venus, Mars, Jupiter, Uranus, Neptune, Pluto) carries the word "retrograde" in flowing prose. ✅
- Natal Uranus *position* (0°30' Libra) is correct everywhere. ✅
- No stray digits on ordinals. ✅
- Element parentheticals on page 3 (Fire = Venus/Mars/Saturn, all in fire signs). ✅
- SR house claims — every SR-house statement I cross-checked matched the SR table. The SR placement block is doing its job. ✅
- Timing windows table — positions match the natal table. ✅

So: the user is **exactly right** that the SR-house guardrail works and there is no natal equivalent. Three of the four real errors above are natal-house bleed; the fourth is a separate regression that needs its own fix.

---

## The plan

### File 1: `src/components/AskView.tsx` — add the natal truth block

Add a `NATAL PLANET HOUSE PLACEMENTS (USE THESE EXACTLY — DO NOT DERIVE):` block to `buildChartContext`, placed **immediately after** the existing `SR PLANET HOUSE PLACEMENTS` block. Format mirrors the SR block exactly.

Bodies included (driven by the natal placement table, not derived):
- Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
- Chiron, North Node, South Node
- **Lilith, Juno** (added to the user's original spec because error #2 above is on natal Lilith — Lilith is in the natal table, so it must be in the truth block)
- Ascendant (sign only), Midheaven (sign + House 10)

Each line is sourced directly from the same data structure that populates the page-1 natal table — never inferred from sign.

### File 2: `supabase/functions/ask-astrology/index.ts` — `factsAwareHouseSweep`

New deterministic post-processor, wired into `safeRun` immediately after `factsAwareRetrogradeSweep`:

1. Parse both truth blocks from the chart context: build `natalHouseByPlanet` and `srHouseByPlanet` maps.
2. Scan prose for house claims using two pattern families:
   - **Natal-qualified**: `(your )?natal <Planet>(?: retrograde)?(?: at [^.]*?)? in the (\d+)(st|nd|rd|th) house` — and also `<Planet>(?: retrograde)? at \d+°\d+' <Sign> in the (\d+)(st|nd|rd|th) house` when the surrounding sentence contains a natal qualifier (`natal`, `your natal`, `birth chart`, `at birth`).
   - **SR-qualified**: same but with `SR ` prefix or "this year's" qualifier.
3. For each match, compare the claimed house number to the truth map. If wrong, surgically rewrite to the correct ordinal (`6th`, `8th`, `11th`, etc.).
4. Emit a `facts_aware_house_sweep` log entry per rewrite (planet, claimed house, correct house, chart layer, snippet) — capped at 10 examples per run for log volume.
5. Do **not** rewrite when the planet is unqualified (e.g. "Mercury in the 7th" with no natal/SR context) — that ambiguity stays out of scope to avoid misfires on transit prose.

### File 3: `supabase/functions/ask-astrology/index.ts` — Earth/Mutable corrector regression

The `correctModalityElementBodyClaims` function shipped last loop did not catch this generation's prose. Two narrow fixes:

1. **Broaden the Fire/Cardinal trigger phrases**. Add: `act on instinct`, `pace starts things`, `new is being launched`, `assert, initiate`, `process by doing`, `live forward`, `think out loud`, `something new is being launched`. Anchor matching to the elemental-balance section specifically (detect by section header `Solar Return Elemental & Modal Balance` or the `Dominant Element:` / `Dominant Modality:` line in the same block) so the rewrite is scoped and won't accidentally rewrite prose elsewhere that legitimately uses these phrases.
2. **Hard-replace** the body paragraph (not append) when both:
   - The header line says `Dominant Element: Earth` AND `Dominant Modality: Mutable`, AND
   - The body contains ANY trigger phrase from the Fire/Cardinal list, OR is missing both an Earth keyword (`ground`, `patient`, `build`, `steady`, `solid`) and a Mutable keyword (`adapt`, `respond`, `flexib`, `shift`).
3. Add a `modality_element_body_rewrite` log entry that records: detected dominant element, detected dominant modality, the trigger that fired (which phrase / which missing-keyword), and the original sentence that was replaced — so future regressions are visible in the log without needing a fresh PDF.

### File 4: `supabase/functions/ask-astrology/index.ts` — verification only, no edits

- Confirm BASE RULE 10 (1–10 inheritance lines) and the natal Uranus position canonical-fact wiring are intact. (Verified in the PDF: both held this run; no edit needed.)

### Deployment

Redeploy the `ask-astrology` edge function after edits to files 2 and 3. File 1 is a frontend change that ships on the next Vite reload.

---

## Why this should hold

- The natal truth block is built from the same chart data as the page-1 table, so it cannot drift from what the report itself prints.
- `factsAwareHouseSweep` reads from the truth block, not from the AI's prose — same pattern as the working SR-house guardrail and `factsAwareRetrogradeSweep`. It can't be silently overwritten by an unrelated future fix because it lives in its own named function with its own log emissions.
- The elemental balance fix scopes itself to the elemental-balance section and only fires on Earth+Mutable charts with mismatched body language, so it won't bleed into other readings.

## What I am NOT doing

- Not changing the SR house corrector — it works.
- Not adding a per-user hardcoded constant for natal Uranus or any other planet — the truth block carries the data per-chart and is the right abstraction.
- Not touching the timing pipeline, retrograde sweep, element parenthetical scrubber, stray-digit scrubber, or BASE RULE 10 — all verified working in this PDF.
- Not rewriting unqualified house mentions (no natal/SR prefix) — out of scope to avoid false positives on transit prose.
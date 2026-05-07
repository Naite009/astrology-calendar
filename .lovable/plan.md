# Daily Cosmic Weather Email — Glance Rewrite

The structure is already 3 sections in `src/lib/emailReport.ts`, but each section is over-stuffed, the personal section repeats house-rulers in long sentences, the decoder uses generic templated lines ("Tension, short tempers, or things scraping in the world"), and the subject line + dividers don't match the spec. This plan tightens the existing builder to a true 400-word morning glance.

## What changes (single file: `src/lib/emailReport.ts`)

### 1. Subject line
Already close. Keep `[Day], [Date] · [Moon sign] Moon · [punch]`, but improve `dayPunch()` so the punch is specific (not "Capricorn Moon mood"). Priority: station > tightest <1° aspect > VOC > moon-sign collective verb.

### 2. SECTION 1 — THE SKY TODAY (cap at 80 words, prose, no bullets)
Rewrite to one short paragraph per item, in this fixed order:

1. **Moon line** — sign, phase, VOC window only if start is between 6am–midnight, plus one collective-mood phrase pulled from `signCollective()`. Trim to one sentence.
2. **Stations** — one sentence each: `Neptune stations retrograde at 3° Aries today — [collective meaning].` Use `STATION_MEANING` (already exists). No exact-time string here (move it out of Section 1 to keep tight).
3. **Sky-to-sky aspects under 2°** — only the tightest 2 (not 3). One sentence each, using `pairLived()` for the lived-experience phrase. Keep planet-name + sign + aspect, drop orb numbers from this section to read faster.
4. **Sun/season** — one short sentence using `sunSeasonBackdrop()`.

Add a real divider (`────────`) after this section.

### 3. SECTION 2 — YOUR CHART (synthesized, not listed facts)
Keep the existing data prep (stations + `personalTransits` filtered <2° via `calculateTransitAspects`), but rewrite the per-entry sentence builder so each transit reads as **one synthesized 2–3 sentence picture**, not stitched fragments. Pattern:

> `[Transit planet] [stationing/moving] at [deg sign] is moving through your [N]th house of [HOUSE_THEME], [aspect verb] your natal [planet] in [sign] in your [N]th house of [theme]. The ruler of your [N]th house is [ruler] sitting natally in your [N]th house in [sign], so this lands as [rulerExpression]. Do: [x]. Don't: [y].`

Improvements:
- Replace the generic `transitAdvice()` tone-only output with a small `concreteAdvice(transitPlanet, natalPlanet, aspect)` map keyed on the transit pair (Neptune-Moon → "rest, audit, review what you started in the last six months / don't launch, sign, or trust your read on people"; Uranus-Venus → "let what you've outgrown go / don't blow up the relationship today"; etc.). Fall back to tone-based copy.
- Strip the second ruler-line for personal transits (currently we print BOTH transit-house ruler chain AND natal-house — too much). Keep only the transit-house ruler routing, since that's what tells the reader HOW the energy lands.
- Use the verb forms "opposes / squares / trines / sextiles / joins" instead of `${aspect}s`.
- Always include do/don't on its own end-line.
- If `personalTransits.length === 0` and no stations hit the chart: print one short line ("No tight personal hits today — the collective weather above is the story.") and move on.

Divider after this section.

### 4. SECTION 3 — TODAY'S DECODER (6–8 short lines, `notice → why`)
The current generic templates ("Tension, short tempers...") violate the spec. Replace `aspectNoticeable()` and `personalNoticeable()` with a **pair-keyed** decoder map, e.g.:

- `mars-aries` (sky) → "Aggressive drivers, people cutting you off, short fuses everywhere → Mars in Aries, everyone is acting first and thinking later."
- `neptune-moon` (personal) → "Foggy, exhausted, or emotionally off for no clear reason → Neptune stationing on your Moon, your inner world is running the show."
- `uranus-venus` (personal) → "Restless about money or a relationship, urge to blow something up → Uranus on your Venus."
- `uranus-jupiter` (personal) → "Unexpected news about shared money or a financial agreement → Uranus on your Jupiter."
- `saturn-mercury` (sky/personal) → "Conversations feel heavier, words carry more weight."
- VOC → "Plans made after [time] go sideways → Moon void of course."
- Station (sky) → "Things you can't quite read or trust today → [Planet] station, perception is off."

Generic fallbacks only kick in if no pair-specific copy exists. Cap at 8 lines, sort: stations first, then personal transits tightest first, then tight sky aspects, VOC last. End on the last decoder line — no trailing blank text, no closing.

### 5. Hard rule enforcement
- Strip the `Hi [name],` greeting and any trailing closing — the spec forbids both. Keep `recipientName` only as a header label inside Section 2 ("YOUR CHART — Lauren").
- Banned words filter: scrub any output that contains `metabolize|archetypal|portal|liminal|wound\s+(you|me|us)|integrate` (post-build sweep) — replace with neutral language. None should appear from the new copy maps, but the filter is a safety net.
- Never call quincunx "friction" — update `pairLived()` and tone helpers so quincunx → "an awkward adjustment, something doesn't quite fit."
- Total word count check at the end: if body exceeds 400 words, drop sky aspects 3+, then drop the lowest-priority decoder lines until under 400.

### 6. Visual structure (plain-text email)
Use this exact divider pattern between sections:

```text
THE SKY TODAY
────────────────────────
[content]

────────────────────────
YOUR CHART — [Name]
────────────────────────
[content]

────────────────────────
TODAY'S DECODER
────────────────────────
[content]
```

This gives a clear visual break between collective / personal / decoder so the reader knows instantly which is which.

## Files touched
- `src/lib/emailReport.ts` — all edits inside the existing `buildEmail` and helpers below it. No new files. No changes to orb logic (that's already tight via `getTightTransitOrb`). No changes to the on-screen Cosmic Weather UI.

## What stays the same
- Data sources: `calculateDailyAspects`, `calculateTransitAspects`, `getVOCMoonDetails`, station detection, `findStationHits`, `HOUSE_THEME`, `STATION_MEANING`, `TRADITIONAL_RULER`, `getNatalHouseOf`.
- 2° orb cap on personal transits, station-always-included exception.
- The on-page "Daily Cosmic Weather" view is untouched — only the email output changes.

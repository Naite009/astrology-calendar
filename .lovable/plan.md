## Goal

When you open a day on the calendar, give you a fast, scannable "Today at a Glance" tab so you don't have to scroll through every slow planet definition every day. All existing detail stays exactly as-is on a second tab. Zero AI in the glance view — only deterministic ephemeris data we already calculate.

## UX

Add a tab strip at the top of the `DayDetail` modal (right under the date header):

```
[ Today at a Glance ]   [ Full Detail ]
```

- **Today at a Glance** — new, default tab. One screen, no AI.
- **Full Detail** — wraps the entire current modal body (Cosmic Weather, Personal Transits, Ingresses, Color Explanation, Comprehensive Transit Analysis, etc.) untouched. Nothing is removed or rewritten.

The close button, date heading, and chart selector stay above the tabs so they apply to both views.

## "Today at a Glance" — what it shows

Driven entirely by data already computed in `DayDetail` (`dayData`, `exactLunarPhase`, `voc`, `majorIngresses`, `transitAspects`, `mercuryRetro`, `getAllRetrogradePeriods`, `calculatePlanetaryHours`, `findNextMoonSignChange`). No new ephemeris work, no LLM call.

1. **Headline strip (1 line)**
   `Moon in {sign} · {phase emoji} {phase name} · {Day Type from getDayType}`

2. **What's actually changing today** (only show rows that exist — these are the things that DON'T happen every day):
   - Exact lunar phase moment (if `exactLunarPhase` truthy) — "Full Moon in Gemini at 7:14 PM ET", supermoon flag if present.
   - Planetary ingresses today (from `majorIngresses`) — "Venus enters Capricorn at 3:22 AM ET".
   - Moon sign change today (from `findNextMoonSignChange` if it falls on this date) — "Moon enters Leo at 11:08 AM ET".
   - Void-of-Course Moon window (from `voc`) — formatted with `formatVOCRange` + "avoid new starts".
   - Retrograde stations today (Mercury/Mars/Venus from `getAllRetrogradePeriods` when station date == today) — "Mercury stations Direct".
   - Mercury Rx phase status only if currently retrograde or in shadow (one-line summary, no long block).

3. **Top 3 personal transits for today** — pulled from the existing `transitAspects` array (already sorted by impact, already filtered to ≤5° orb, already prioritizing outer→personal). Slice to first 3. Each row:
   `☉ Sun ☌ natal Moon · 1.2° · applying` + the existing one-line `aspect.interpretation`.
   - Skip the felt-sense block and the entire expanded panel — that lives in Full Detail.
   - If a chart is active and there are zero ≤5° transits, show a small "No tight personal transits today" line.

4. **Sky right now (collapsed by default)** — a `<Collapsible>` titled "All planet positions" that lists each planet's sign and degree from `dayData.planets`. This is the only place slow planets like Pluto appear in the glance view, and it's hidden until you open it. No interpretive text, just `♇ Pluto 4°12′ Aquarius (R)`.

5. **Today's color band** — the existing `dayData.colors` strip / day-type pill, rendered compact. Reuses the data already in `DayOverviewSection`; we just render a slimmer version (color dots + label, no explanation paragraph — that stays in Full Detail).

What is intentionally NOT in the glance view:
- Cosmic Weather AI banner (lives in Full Detail).
- ComprehensiveTransitAnalysis expanded blocks.
- Daily-guidance prose paragraphs.
- Repeating outer-planet definitions (Pluto/Neptune/Uranus interpretive text). Those only appear in Full Detail or when the user opens "All planet positions".

## Anti-hallucination guarantees

- The glance tab renders only values from `dayData` and the deterministic helpers already imported in `DayDetail.tsx` (`getMercuryRetrogrades`, `getAllRetrogradePeriods`, `getRetrogradeStatus`, `findNextMoonSignChange`, `formatVOCRange`, `calculatePlanetaryHours`, `getDayType`).
- No `fetch`, no edge function, no `generate-narrative`, no `ask-astrology` call from this tab.
- All copy is either a fixed label (e.g. "Void-of-Course Moon") or a value formatted from astronomy-engine output. Memory rule "AI is forbidden from doing math" is preserved.

## Files to change

- `src/components/DayDetail.tsx` — wrap existing body in a `<Tabs>` from `@/components/ui/tabs`. Add a new `TodayAtAGlance` sub-component (in the same file or a sibling file `src/components/dayDetail/TodayAtAGlance.tsx` — sibling file preferred to keep `DayDetail.tsx` from growing). Pass `dayData`, `transitAspects`, `activeChart`, `exactLunarPhase` as props.
- No edits to `CosmicWeatherBanner`, `ComprehensiveTransitAnalysis`, transit math, or any edge function.

## Default tab

Default to **Today at a Glance**. A user who wants the deep dive clicks "Full Detail" once; selection is not persisted (each day opens fresh on the glance).

## Out of scope

- No changes to the calendar grid itself.
- No changes to Cosmic Weather generation.
- No new ephemeris calculations — strictly reuses what's already on `dayData`.

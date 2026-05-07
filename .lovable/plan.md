## Goal

Rewrite the **TODAY'S HEADLINES** section of the cosmic weather email so it does the astrologer-thinking for you instead of telling you to look at your own chart. Two specific items:

1. **Stations** (e.g. Neptune stationing retrograde at 3° Aries) — pull the user's chart, compute what house that degree falls in and what natal points it aspects (within tight orb), and write that into the line. Plus one short plain-English line on what a station of that planet generally feels like, and the date/time it's exact.
2. **Void-of-Course Moon** — drop the "(Moon enters Aquarius after)" parenthetical and instead name the **last aspect** the Moon makes before going void (e.g. "after Moon ☍ Venus at 10:19 AM"). Then the short "make a list / handle small things" guidance.

Everything stays in `src/lib/emailReport.ts` — no UI changes, no edge function changes.

## What changes in `src/lib/emailReport.ts`

### 1. Imports
- Add `getHouseForLongitude`, `signDegreesToLongitude` from `./houseCalculations`.
- Add `findNextMoonSignChange` from `./voidOfCourseMoon` (already exports `getVOCMoonDetails`; we'll also expose / reuse the last-aspect that VOC already computes — `voc.lastAspect` already has planet + aspectName + symbol + time, so no new export needed).

### 2. New helper: station exact date/time
Stations live across ~24h of near-zero motion. For each planet flagged as stationing today, binary-search the velocity zero-crossing in a ±3-day window around `anchor` to get the exact station moment. Format as `Wed Nov 6, 2:14 PM EDT`.

### 3. New helper: station meaning (one short line per planet)
Plain-language map, e.g.:
- Mercury: "communication, plans, and tech go under review for ~3 weeks."
- Venus: "love, money, and values get a rewind."
- Mars: "drive and action stall — don't push, regroup."
- Jupiter: "growth pulls inward, beliefs get re-examined."
- Saturn: "structure and responsibility loosen, then re-set."
- Uranus: "the disrupter quiets externally, internal change picks up."
- Neptune: "dreams, illusions, and the spiritual fog reset — what was hazy gets clearer over months."
- Pluto: "deep power themes turn inward."
(Direct stations get the inverse phrasing.)

### 4. Personal station line (when `natalChart` is provided)
For the stationing planet at, say, 3° Aries:
- Compute longitude (`signDegreesToLongitude('Aries', 3, 0)`).
- Compute house with `getHouseForLongitude(lon, natalChart)`.
- Scan natal points (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, Asc, MC, Nodes, Chiron) for major aspects (conj/opp/sq/tri/sex) within 3° orb to that station degree.
- Build the line:
  ```
  ✦ ♆ Neptune stations retrograde at 3° Aries — exact Wed Nov 6, 2:14 PM EDT.
    What it means: dreams, illusions, and the spiritual fog reset; what's been hazy starts to clarify over the coming months.
    For you: 3° Aries is in your 6th house (daily work, health, routines).
    Hits in your chart: opposition to your Moon in Libra (12th, orb 1.4°), square your natal Mercury (orb 2.1°).
  ```
- If natal chart has no `houseCusps`, omit the "For you" line.
- If no aspects in orb, say `Hits in your chart: nothing tight — the house placement is the main story.`
- If no `natalChart`, fall back to the current generic line but without "look at where X falls in your chart" (just state the station + meaning + exact time).

### 5. Rewrite the VOC line
Replace current line with:
```
✦ ☽ Moon is VOID OF COURSE from 10:19 AM EDT into tomorrow,
   after its last aspect (☽ ☍ ♀ at 10:19 AM) — make a list, handle small things, don't start anything new.
```
Pull `voc.lastAspect.{symbol,planet,time}`. If `lastAspect` is missing (Moon was already VOC at sign entry), say `(no major aspect made in this sign)`.

### 6. Tighten wording
- Remove the "approximate" / "look at where X falls in your chart" generic phrasings entirely — they're now replaced by the personalized lines.
- Keep headlines compact: each item is 2–4 short lines, not a paragraph.

## Out of scope
- No changes to the YOUR DAY section (already personal).
- No new files. No DB migrations. No edge function edits.
- No changes to the calendar UI.

## Files touched
- `src/lib/emailReport.ts` (only)

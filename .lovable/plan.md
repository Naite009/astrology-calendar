# Personalize the Guide: click any concept, see it in your chart

## What you're asking for

The Guide is currently a generic encyclopedia. You want every card / heading / concept to become clickable. When you click "North Node," "Chiron," "Juno," "Mercury Retrograde," "Fixed Stars," "Balsamic Moon," "Ceres," etc., a panel opens that reads *your* chart for that concept: sign, house, tight aspects, and one blended paragraph about what it means for you specifically. Same simplicity as the personalized North Node line I just wrote.

This is a big surface. I'll do it in tested waves rather than one giant push, so each wave can be verified against your chart before moving on.

## The pattern (used everywhere)

Every clickable concept opens the same modal shell, filled by a concept-specific "personalizer" function. Each personalizer follows the same 4-part structure so the voice stays consistent:

1. **Placement line** — the raw fact (e.g., "Your North Node is in Scorpio, in your 1st house").
2. **Aspect line** — tightest aspects to that point from your natal chart (conjunctions first, then squares/oppositions, then trines/sextiles), only within real orb.
3. **Blended reading** — one paragraph, plain English, that combines sign + house + tightest aspect into a single lived meaning ("Where you're headed in this lifetime is…").
4. **What to do with it** — one concrete behavioral line.

No new AI calls. All deterministic, calculated from the active chart, so the answer is the same every time and can be fact-checked.

## Waves (in build order)

**Wave 1 — Divine Feminine Bodies** (the page in your screenshot)
- North Node, South Node (as a pair)
- Chiron
- Lilith (Black Moon Lilith / mean apogee — flag if data missing)
- Ceres, Pallas, Juno, Vesta

**Wave 2 — Retrogrades**
- Each currently-retrograde planet personalized (sign + house + natal hits + sign-specific action). Same engine as the daily Mercury Rx line, extended to Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto.
- Also: your natal retrogrades (planets born retrograde in your chart) — what each means for you.

**Wave 3 — Moon Phases + VOC**
- Click your natal moon phase → what being born under that phase means for you.
- Click today's phase → what this phase is asking of you specifically (already partially built, will wire into the guide).
- VOC Moon → when the next one hits your chart and what house it lands in.

**Wave 4 — Dignities + Difficult Placements**
- Click any planet dignity row → your planet's dignity score, whether it's in domicile / exalted / detriment / fall, and what that means behaviorally.
- Difficult placements: list which of these you actually have and translate each.

**Wave 5 — Fixed Stars**
- Which major fixed stars conjunct your natal planets/angles within 1° orb, and what each one activates.

**Wave 6 — Venus Cycles, Solar Arc, Progressions, Life Cycles**
- Where you are in each cycle right now, next major hit date, plain-language meaning.

**Wave 7 — Aspects, Patterns & Cycles, Planetary Speeds, Dwarf Planets, Chart Decoder, Sacred Script, Cosmic Kitchen**
- Click each concept → your version. (Cosmic Kitchen uses your dominant element/dosha.)

**Wave 8 — Symbols, Colors, Planetary Hours, Timing & Electional, Biorhythms**
- Personalize where it makes sense (colors → your chart-ruler color; hours → your ruling planet's next hour today; biorhythms → today's values). Symbols stays as a legend.

## Accuracy & testing (per wave)

Before I say a wave is done, I will:
1. Open Lauren, Ben, and Ike in the preview and read each personalized entry.
2. Cross-check the placements against their raw chart data in the database (sign, degree, house, aspect orbs).
3. Fix any mismatch before moving to the next wave.
4. Report back with what I verified so you can spot-check.

Rule from your memory rules: all math is deterministic (`astronomy-engine` / stored chart cusps), no AI guessing signs or houses, orbs from `aspectOrbs.ts`, plain-language voice, no em dashes, no chitchat openers.

## Technical section (for reference)

- New module `src/lib/guidePersonalizers/` with one file per concept family (`divineFeminine.ts`, `retrogrades.ts`, `moonPhase.ts`, `dignities.ts`, `fixedStars.ts`, `cycles.ts`, `aspects.ts`, etc.). Each exports `personalize(chart, extraContext?)` returning `{ placement, aspects, reading, doThis }`.
- New shared UI component `GuideConceptModal` in `src/components/guide/`. Opens on click, renders the 4-part shape, closes on esc / backdrop.
- `GuideView.tsx` gets a small `<ConceptCard onClick=...>` wrapper. Existing static cards are wrapped, not rewritten, so the guide reads the same when the user isn't clicking.
- House lookup reuses the existing cusp logic in `mercuryRetroPersonal.ts` (extract to `src/lib/houseForLongitude.ts` and share).
- Aspect scan reuses `aspectOrbs.ts` and `calculateNatalAspects` so tightness / orb rules match the rest of the app.
- Missing data (e.g., Lilith degree not in chart) shows an honest "your chart doesn't have this body imported yet — add it in Chart Library" instead of faking a reading.

## What I need from you

Just confirm you want me to start with **Wave 1 (Divine Feminine)** and go wave by wave, verifying against Lauren / Ben / Ike between each. I won't batch the whole guide in one shot — that's how astrology bugs sneak in.

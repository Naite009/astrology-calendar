# Psychological-Function Layer for Natal Readings

## Goal
Upgrade Natal Portrait and Story of Self so each interpretation explains the chart as a psychological system: planet function, sign style, house arena, and relationships between inner functions. Keep every natal calculation and saved-chart path unchanged.

## What will change

### 1. Shared interpretation source
- Add one reusable psychological-function library for Sun through Pluto, Chiron, Nodes, Ascendant, and MC.
- Define each body's short job, clear function, healthy expression, protective expression, relationship expression, careful authority/parenting framing, and reflection questions.
- Add shared sign-style and house-arena helpers so both screens explain how and where a function operates.
- Add a generic aspect synthesizer covering conjunction, opposition, square, trine, sextile, quincunx, and supported minor hard aspects.
- Return structured output: both functions, aspect mechanism, sign/house context, ordinary-life expression, integration, watch-for language, reflection question, and exact evidence.

### 2. Natal Portrait
- Replace thin Big Three headings with Identity & Will, Emotional Safety & Attachment, and Interface With Life.
- Add concise function, style, arena, and “So this can look like…” text to each Big Three card.
- Add a Big Three Psychological Blend with an evidence-driven 2–4 word label, explicit function hierarchy, inner agreement/tension, and first-impression versus actual-needs comparison.
- Expand element and modality interpretation into default processing channels, strengths, needs, behavioral expression, and “less automatic” language for low counts.
- Add each Key Player’s psychological job to domain sections.
- Rebuild Relationship Blueprint around Venus, Mars, Moon, the 7th-house ruler and placements, plus Saturn only when tightly relevant.
- Add ranked important psychological aspects with expandable shared-engine explanations. Major planets, luminaries, chart ruler, and tight aspects remain above minor bodies.

### 3. Story of Self and Chart Walkthrough
- Show each planet’s psychological job before its sign and house detail in Cast Overview and Planet Detail.
- Replace separate canned aspect explanations with the shared aspect synthesizer in expandable aspect details.
- Make Cast Chemistry aspects expandable while retaining the existing visual grouping.
- Add a Psychological Map listing each body’s function, placement style, life arena, and strongest modifying aspects.
- Add Core Inner Dynamics using the strongest 3–5 valid chart factors, with concrete function-derived titles and visible evidence.
- Reuse this shared layer in the astrologer-facing Chart Walkthrough where matching Big Three and aspect material already appears.

### 4. Safety, age, and verification
- Keep child and teen language nonsexualized; translate Venus and Mars into relating, preference, motivation, boundaries, and age-appropriate attraction.
- Keep parenting and authority links as questions or possibilities, never claims about a specific parent or event.
- Preserve all existing forbidden-language, evidence hierarchy, and chart-grounding rules.
- Add tests for complete body coverage, Venus–Saturn opposition, Moon–Saturn distinction, Mercury–Jupiter trine versus square, sign/house context, and child/teen language.
- Extend Natal Portrait and Chart Walkthrough regressions, then run relevant tests, the full test suite, typecheck, and production build.

## Technical boundaries
- No changes to ephemeris calculations, birth-place handling, time zones, house calculations, aspect geometry, chart identity, or stored records.
- Existing calculated placements and aspects will be passed into the new interpretation functions without recalculation.
- The new structured interpretation objects will be deterministic and original, with the existing language-policy sanitizer and lint tests retained as final safeguards.

## Remaining design assumption
“Important Aspects” will be added inside Natal Portrait as a dedicated section because that view currently has patterns but no single canonical major-aspect panel. It will use existing calculated chart data and existing orb rules only.
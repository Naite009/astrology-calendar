# Natal Portrait: "Who Is This Person" deep reading + "What's Moving Now"

## Goal
A new section at the very top of Natal Portrait that reads like the example screenshots: it finds the real combinations in the chart, gives each one a name ("The Perpetual Student"), explains in plain words why it happens, shows how the combinations pull against each other, and then shows which current transits are activating those same combinations. It should go further than the other app: every claim checked against the real chart math, exact orbs shown, nothing stated as fate.

## What the reader will see
1. **The headline**: two or three sentences naming the central tension of this person (e.g. "a restless learner who needs to build something lasting").
2. **4 to 6 named signatures**: each one has:
   - a name in brackets, like the other app
   - the exact placements behind it (sign, degree, house, aspect, orb, out-of-sign flag)
   - how it shows up in daily life, in work, and in relationships
   - the strength it gives and the place it can get stuck
3. **How the signatures collide**: the two or three places where one part of the chart wants something the other part resists ("your Rising wants movement, your Taurus Sun wants roots").
4. **Life areas**: short, specific answers for work and calling (Midheaven, its ruler, aspects to the MC), relationships (Descendant, Venus, Moon), and money and security.
5. **What's moving now**: the Jupiter through Pluto transits currently hitting the planets and angles above, with real exact dates, linked by name to the signature they activate ("Saturn is crossing your Midheaven, which activates The Idealist's Dilemma").
6. **Questions to ask the client**: 3 to 5 recognition questions.

## How it works
- **Chart math picks the evidence first.** A new evidence builder ranks the factors that carry the most weight:
  - the Ascendant, and its ruler's sign, house, condition and tight aspects
  - the MC, its ruler, and every planet aspecting the Ascendant or the MC
  - the Sun's and Moon's houses
  - the tightest major aspects
  - real stelliums (3+ major planets) and validated patterns
  - element and modality extremes
  - current major transits from the existing transit calculator

  It also pairs factors that pull against each other. The AI gets only this checked list.
- **The AI writes from that list only**, using the existing reading model, and must quote each signature's evidence IDs. Any signature citing a placement or aspect that isn't on the list is thrown out before it is shown.
- **The usual standards still apply:** no fate wording, no diagnoses, no em dashes, constructive before challenging, age-aware for teens.
- **The reading is saved per chart and refreshed only on request**, so it doesn't cost credits on every visit. The transit part refreshes when the date changes.
- **JSON and PDF downloads** include the reading and its evidence.
- The existing sections stay below it unchanged.

## Technical details
- `src/lib/interpretation/personSignatureEvidence.ts`: a deterministic evidence pack. It uses `getChartRulers`, `computeRankedAspects` and `classifyAspect`, aspects to angles from cusps 1, 4, 7 and 10, the stellium and pattern helpers, `elementBalance`, and `majorTransits` filtered to signature bodies. Each item has a stable ID.
- `supabase/functions/natal-person-reading/index.ts`: wrapped with `withInterpretationStandard(..., { fullChart: true })`, returns structured JSON (signatures[] with evidenceIds), streamed, with gateway error handling.
- `src/lib/interpretation/personReadingValidator.ts`: rejects unknown evidence IDs, out-of-sign mislabels, banned wording and fate wording, with one repair attempt before falling back to deterministic text.
- `src/components/natal/WhoIsThisPerson.tsx`: rendered at the top of `NatalPortraitView.tsx`, with expandable evidence per signature and a "Regenerate" button. Results are cached per chart in local storage, keyed by chart identity and data hash.
- Tests:
  - the evidence builder on Ava, Max, Harrison and Karina (ASC/MC aspects, ruler, tension pairs, transit linkage)
  - the validator rejecting invented aspects, such as cross-sign "tight" conjunctions without degrees
- Record the new module rule in `AGENTS.md`.

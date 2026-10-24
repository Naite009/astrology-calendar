# Natal Portrait: one connected reading of the whole person

## Why the other reading was better
The other app wrote one story about one person. Your app builds many small pieces and joins them.

- **It follows chains, not lists.** Its first point goes: Gemini Rising, then Rising's ruler Mercury, then Mercury in Aries in the 11th, then Mercury's tight link to Venus and Mars. Each step explains the last. Your app describes Rising, Mercury and Venus/Mars in separate places, so the links never get made.
- **The patterns get named by combining things.** "The Perpetual Student" comes from Saturn in the 9th (structure around learning) plus a restless Rising (new things feel good at first). A lookup table can't produce that. It takes reading the factors together.
- **Each point ends in a behavior.** "Learning feels safe, so when you're lost you enrol in a course." Your pieces often end at a description of the placement.
- **Nothing was squeezing it.** Your plain readings are capped at 80 words per section with 3rd-grade wording and many banned phrases. Those caps stop a long chain from fitting.
- **It gives one answer.** Your page gives many sections that repeat each other, which is why it feels like patchwork.

It also has gaps your app can beat. It says "tightly conjunct" across Aries and Pisces without checking the degrees. It gives no orbs or Midheaven aspects. And it says "you are not meant for..." as if it were fixed.

## What I'll build
Not another section on the page. The top of Natal Portrait becomes one connected reading:

1. **Chart story map (calculated, no AI).** Starting from the Rising, Midheaven, Sun and Moon, the code follows each ruler to its sign and house, then to that planet's tightest aspects. It marks which links are real by exact angle and which only look close across signs. It also lists the places where two parts of the chart want opposite things. The result is a set of connected chains, each with exact evidence.
2. **A named reading written from those chains.** The AI gets only the chains and writes:
   - a central tension for the person
   - 4 to 6 named signatures, each following its chain (placement, then what it does, then what it looks like in work, love and stress, then where it can get stuck)
   - where the signatures pull against each other
   - what the person likely does when they feel lost, and what steadies them
3. **A check before anything is shown.** Every named pattern must cite chain IDs that exist. Invented placements, wrong aspect names, fate wording and diagnoses are rejected, with one retry.
4. **What's moving now.** Current Jupiter to Pluto transits are matched to the named signatures, so you read "Saturn is crossing your Midheaven, which presses on The Idealist's Dilemma" with exact dates from the existing transit calculator.
5. **Existing sections stay below.** They are no longer the first thing the client reads, and the portrait's duplicate openers are removed from the top.

The longer limits apply only to this reading. Short surfaces stay short.

## Technical details
- `src/lib/interpretation/chartStoryMap.ts`: builds the chains from `getChartRulers`, `computeRankedAspects` / `classifyAspect`, cusps 1, 4, 7 and 10, stellium and pattern helpers, and `outOfSign`. It outputs chains with stable IDs and a tension list.
- `supabase/functions/natal-person-reading/index.ts`: uses the existing model, wrapped in `withInterpretationStandard(..., { fullChart: true })`, with structured output citing chain IDs, streamed, and the gateway error rules applied.
- `src/lib/interpretation/personReadingValidator.ts`: the check described above. On failure it falls back to a deterministic version made of the chains only, labeled as such.
- `src/components/natal/WhoIsThisPerson.tsx`: the top of `NatalPortraitView.tsx`, with expandable evidence, regenerate, and JSON/PDF inclusion. The reading is cached per chart and the transit part refreshes daily.
- Tests: chains and tensions on Ava, Max, Harrison and Karina, and the validator rejecting an invented or cross-sign "tight" aspect. I'll also run the reading on a saved chart and show you the result before calling it done.
- Record the new module rule in `AGENTS.md`.

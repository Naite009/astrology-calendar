---
name: Ruler Chain Enrichment for Ask Readings
description: AskView pre-computes ruler chains and planets-by-house so AI can write "Capricorn 7th → Saturn in Cancer 1st conjunct Moon" depth without hallucinating
type: feature
---
The chart context built in `src/components/AskView.tsx` (`buildChartContext`) MUST include three pre-computed blocks that the `ask-astrology` edge function relies on for placement-rich, personal narratives:

1. **House Cusps (with traditional rulers)** — every house 1–12 with its cusp sign and traditional ruler resolved via TRADITIONAL_RULERS map.
2. **Planets In Each House** — planets grouped by the house they physically occupy (computed via `calcHouse(absDeg)`); empty houses listed as `(empty)`.
3. **Ruler Chains** — for houses 1, 4, 5, 7, 8, 12: cusp sign → ruler planet → ruler's sign/degree/house/retrograde → tight aspects (≤4° orb) to Sun, Moon, Venus, Mars, Saturn, Jupiter, Mercury, Pluto, Neptune, Uranus, Chiron, Juno. Aspect set: conj/sext/sq/tri/opp with planet-pair orbs (8/5/7/7/8).

The system prompt in `supabase/functions/ask-astrology/index.ts` enforces a "RULER CHAIN MANDATE" requiring the AI to trace the full ruler chain from these blocks for every relational house and to mention any tight aspects pre-computed there (and never invent ones not listed).

Why: prevents the AI from stopping at "your 7th is Capricorn so you like serious people" and forces the depth that makes the user say "you are describing me."

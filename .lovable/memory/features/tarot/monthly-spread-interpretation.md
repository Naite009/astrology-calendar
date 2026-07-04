---
name: Monthly tarot spread interpretation standard
description: 7-card Monthly spread positions, non-predictive tone, connected-story requirement, contextual reversals, hierarchy, silent Interpretation Check, and number-pattern math rules used by interpret-tarot-spread edge function.
type: feature
---

## Spread positions (source of truth: `MONTHLY_SPREAD_POSITIONS` in `src/lib/tarotDeck.ts`)
1. Foundation — what's carried in from last month (supporting)
2. The New Season — the entering theme (PRIMARY)
3. Your Inner Energy — how you feel internally (supporting)
4. Your Outer Energy — how you show up / how others respond (supporting)
5. What Needs Clearer Action or Awareness (PRIMARY)
6. Hidden Opportunity — not immediately obvious (supporting)
7. North Star — practical guide for the month (PRIMARY, drives practical guidance)

## Universal interpretation rules (all spread types)
- Never guarantee outcomes. Use "may / could / suggests / points toward / the invitation is."
- No generic advice ("pick a lane," "trust the universe," "manifest," "get your house in order"). Every action must be tied to a specific card + position.
- Cards must speak to one another — show transitions between cards, not isolated definitions.
- Reversed ≠ opposite. Choose contextually: blocked / internalized / excess / avoidance / delay / release / recovery / lesson-still-being-learned, and briefly justify.
- Hierarchy: name primary vs supporting cards; weight prose accordingly.
- Number patterns: only mention if actually present, and show the math. Justice = XI (11 → 2) in Rider-Waite-Smith; Judgement = XX (20 → 2); Strength = VIII.
- Never silently flip a card's orientation. Never invent a card.
- Hybrid clarity: (1) real-life situation, (2) how it feels, (3) briefly why. No em dashes.

## Structure for monthly (2,500–4,000 words)
Your Cards → The Overall Message (with "The central message for your month is …") → 7 per-position level-3 sections each including "What this card wants you to know" → How the Cards Work Together → What the Month May Feel Like → Practical Guidance (5–7 card-anchored actions) → Your Most Important Message → Closing (100–175 words).

## Structure for 3-card / Celtic Cross
Question → Overall Story → Card by Card (level-3 with orientation) → How the Cards Work Together → What This May Feel Like → What to Actually Do (3–5 card-anchored bullets).

## Silent Interpretation Check (performed by AI before returning)
Verifies: all cards + orientations match, meanings fit positions, no guaranteed outcomes, reversed cards justified, North Star used in guidance (monthly), overall message consistent with sections, no repeated advice.

## Pattern hints
Edge function pre-computes suit tally, reversed count, and reduced-number matches (with math) and passes to the model as `PATTERN HINTS` so the AI never invents a numeric pattern.

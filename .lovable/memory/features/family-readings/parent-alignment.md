---
name: Family Reading Parent Alignment Section
description: Layer 3 "What This Child Needs From You" — 3 mechanism-mapped recognition lines per child, gated on a valid childMechanism with internal conflict + cause→effect; emits null instead of generic parenting language
type: feature
---
Every family reading may include a `whatThisChildNeedsFromYou` (pair) or `whatEachChildNeedsFromYou` (system, one entry per child) block. This is the "kind of parent this specific child needs me to be" recognition layer (Question 3 of 3: how-they-work / where-they-stick / what-they-need).

## Shape
Exactly 3 lines per child, one per `tiedTo` slot in this order:
- `processing` ↔ childMechanism.corePattern (how they process internally)
- `stuckPoint` ↔ childMechanism.theConflict (where they get stuck)
- `pressure` ↔ childMechanism.underStress (how they react under pressure)

Optional 4th `specificFriction` line only when a named friction (Chiron contact, retrograde Mercury, Moon-Pluto) demands it. Each line ≤ 14 words, verb-first, completes "This child needs a parent who…".

## DEPENDENCY GATE (HARD)
Block is GATED on a valid mechanism. The mechanism is "valid" only if BOTH:
- `theConflict` matches a structural-mismatch pattern (e.g. "feels like X but has to Y", "wants A but is wired for B"), AND
- `inRealLife` AND `underStress` both contain cause→effect markers (`so`, `because`, `which makes`, `which means`, `this creates`, `so that`, `which is why`).

If invalid → emit `null` (pair) or `{ childName, opener: null, lines: null }` (per child in system). NEVER fall back to "be patient", "give space", etc.

## Banned phrases (deterministic regex strip)
- Therapy: hold space, attune, co-regulate, honor their feelings, validate their inner world, meet them where they are, safe container, be present with.
- Generic parenting: be patient, listen actively, set clear boundaries, be consistent, stay calm, model the behavior, lead by example.
- Instruction-mode line openers: ask, use, try, give, provide, do, make sure, remember, tell.

If fewer than 3 lines survive scrubbing → force section to null and log `needs_section_underfilled`. Gate failures log `needs_section_blocked_weak_mechanism` (pair) or `needs_blocked_weak_mechanism:<childName>` (system) on `payload._validation_log`.

## Differentiation (system reading only)
Across siblings, lines must not be swappable. If swapping child A's lines into child B's block still reads true, REWRITE.

## Files
- `supabase/functions/family-pair-reading/index.ts` — `whatThisChildNeedsFromYou` field, WHAT THIS CHILD NEEDS FROM YOU RULE block + DEPENDENCY GATE, post-parse validator.
- `supabase/functions/family-system-reading/index.ts` — `whatEachChildNeedsFromYou` array, WHAT EACH CHILD NEEDS FROM YOU RULE block + DEPENDENCY GATE, per-child post-parse validator keyed off `childMechanisms[].name`.

UI rendering is not yet wired; sections flow through the response and can be rendered as a quiet "What [Child]'s Wiring Asks of You" block when non-null.

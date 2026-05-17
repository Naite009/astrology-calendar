---
name: Family Reading No Generic Pair Fallbacks
description: family-system-reading must never emit shared template `dynamic` text across pairs; generic-template detector + Jaccard interchangeability check null offending pairs so UI prompts regenerate
type: constraint
---
The previous `fallbackPairDynamic(nameA, nameB)` template ("Different pacing — X reaches for clarity, Y needs room… One explains more, the other pulls away… One tries harder, the other shuts down…") was injected into every missing parent-child and sibling pair. That produced duplicated, interchangeable, empty-feeling sections.

## Rules now enforced in `supabase/functions/family-system-reading/index.ts`

1. **No generic template injection.** `ensurePairCoverage` only adds missing pair shells with `dynamic: null`. The UI already renders "Regenerate this reading to see how this relationship shows up day to day." for null dynamics.
2. **Generic-phrase scrub (`GENERIC_DYNAMIC_PATTERNS`).** Any `dynamic` containing "different pacing", "reaches for clarity", "needs room to respond", "one explains more … pulls away", "one tries harder … shuts down", "both feel missed", "short, low-pressure moments without a goal", "one stays simple … space to stay present" is nulled and logged as `*_generic_template:<pair>`.
3. **Interchangeability detector (`enforcePairUniqueness`).** For every pair of `dynamic` strings, strip participant names + section labels, build word 3-shingles, compute Jaccard similarity. If sim ≥ 0.5, BOTH pairs get `dynamic: null` and `*_interchangeable:<A><->B>(sim=…)` is logged.
4. Applied to `parentChildConnections` (scope `pc`) and `siblingConnections` (scope `sib`) BEFORE `ensurePairCoverage`, so coverage only fills genuinely missing pairs.
5. `_validation_log` on the payload aggregates needs-section + uniqueness logs for debugging.

## Why this works with the existing UI
`src/components/family/FamilyTab.tsx` PairCard treats `dynamic == null` as "show regenerate prompt", so nulled pairs surface as actionable empty states instead of fake content. Never reintroduce a template-based `dynamic` filler.

# Parent–Child Section: Audit Findings and Proposed Fixes

Inspection only so far. Nothing has been changed.

## How it works today

Three layers, in this order:

1. **Aspect math (deterministic, in the browser)** — `src/lib/parentChildSynastry.ts`
   - A curated list of 19 parent-to-child planet pairs (`PARENT_TO_CHILD_PAIRS`, lines 67-102): Sun↔Moon, Mars→Moon, Saturn→Sun/Moon, Pluto/Neptune/Chiron/NorthNode→Sun/Moon, Mercury→Moon, Jupiter→Sun, Ascendant→Sun, plus 10 sibling pairs.
   - Only the 5 major aspects are tested (conjunction, opposition, trine, square, sextile), lines 104-130. Orbs come from the shared table in `src/lib/aspectOrbs.ts` (conjunction 8°, opposition/trine/square 7°, sextile 5°, with luminaries +2° and two-"point" bodies tightened by 2°).
   - Ranking is **pure tightest-orb-first** (`rows.sort((a,b) => a.orb - b.orb)`, line 166). The top 3 become `essenceLines`; the top 12 are sent to the AI (`buildPairReadingPayload`, line 536).

2. **Narrative generation** — `supabase/functions/family-pair-reading/index.ts` (model `google/gemini-3.1-pro-preview`)
   - Re-ranks server-side with a weighting table (`scoreAspect`, lines 162-189: Saturn hard to Sun/Moon = 5, Chiron hard = 4, Pluto-Moon = 4, Node contacts = 2, soft aspects = 1, anything unlisted = 2), then keeps **at most 6** aspects (lines 199-214).
   - A second, tighter "citation gate" (lines 218-237) decides which aspects may be named at all in the pressure/repair/perception sections: Sun/Moon ≤10°, personal planets ≤6°, outers ≤5°, Chiron and Nodes ≤4°.
   - Output sections: `essence`, `ageNote`, `childMechanism`, `whatThisChildNeedsFromYou`, `sections[]`, `practice`, `respondsBestWhen`, `inTheMoment`, `whatMakesItWorse`, `whatAlreadyWorks`, `soulContract` (childLesson / parentLesson), `moonBridge`, `pressureProfile`, `repairProfile`, `perceptionTranslation`, `connectionMisfire`.
   - Code-enforced checks: a forbidden-vague-phrase scrub (lines 812-837) and a hard dependency gate on the child mechanism (lines 839-894).

3. **Rendering** — `src/components/family/FamilyTab.tsx` (`PairBlock` and the reading cards from ~line 1000 onward).

**Where your arrow shorthand comes from.** There is no literal template string like "Parent: talk → understand → restore equilibrium / Child: overwhelmed → retreat → regulate" anywhere in the code. That shape is produced live by the `connectionMisfire` block (parentIntent → childExperience → childProtection → whatHelpsInTheMoment, lines 606-635) and by `repairProfile`. So the style is a **prompt convention, not a fixed asset** — which means it can drift between generations. Any change must lock that shape in, not invent it.

## Issues found

1. **`whatThisChildNeedsFromYou` is generated but never rendered.** The field exists in the schema, has a full validator and dependency gate, and is returned to the client, but no component in `src/components/family/` displays it. The parent-guidance layer is currently invisible in the UI.
2. **One-sided by design.** There is a gated `childMechanism` and a "what this child needs from you" block, but no parent-side counterpart. The only reciprocal content is `soulContract.parentLesson`, which is poetic karmic framing, not behavioral guidance. Per your standing rule, the section currently reads as the parent accommodating the child, with no place stating that respectful behavior and a calm home are reasonable expectations.
3. **Tight aspects can be dropped three separate times.** Client keeps 12 of the curated matches, the edge function keeps 6, and the citation gate can then silence an aspect that survived both. A 4.5° Chiron-Moon contact passes the client orb but fails the ≤4° citation cap, so it is computed and then goes unmentioned with no note explaining why.
4. **Ranking is inconsistent between the two layers.** The client sorts by orb only; the server sorts by weight. A 0.5° Venus-Moon or Mercury-Mars contact defaults to weight 2 and can be pushed below a 6° Saturn aspect, so the tightest thing in the pair sometimes never gets discussed.
5. **Uranus is entirely absent** from the parent-child and sibling pair lists, even though it is tracked elsewhere in the app. Uranus-Moon and Uranus-Mercury contacts are common drivers of exactly the reactivity these readings are about.
6. **Vague claims are only prompt-restrained, not validated.** The inline-citation rule (line 753) is an instruction. Only `whatThisChildNeedsFromYou` and the phrase blacklist are code-enforced, so `essence` and `sections[].howItLands` can ship sentences with no placement attached.
7. **Quincunx and semisextile are never tested** for family pairs, so a tight 150° Moon-Saturn is invisible.

## Proposed changes (Parent–Child only)

**A. Balanced learning layer**
- Add a `whatEachOfYouLearns` block with two symmetrical halves: `parentLearns` (2-3 lines) and `childLearns` (2-3 lines), each line tied to a named placement or aspect.
- Frame the child side as reasonable expectation, not compliance training: what respectful behavior and repair look like from the child's side given their own wiring, explicitly not "the parent needs less."
- Gate it the same way the child mechanism is gated: if it cannot be tied to a real aspect, omit the block rather than shipping filler.

**B. Surface the existing parent guidance**
- Render `whatThisChildNeedsFromYou` in `FamilyTab.tsx` alongside the new balanced block, so the two sit side by side and neither reads as one-directional.

**C. Preserve the shorthand style explicitly**
- Add a formatting rule to the prompt that locks the arrow shorthand in `connectionMisfire` and `repairProfile` (Parent: verb → verb → outcome / Child: state → verb → verb → outcome), so it is a guarantee rather than a coincidence. No em dashes, plain-English verbs, no therapy vocabulary.

**D. Aspect selection fixes**
- Add Uranus→Moon, Uranus→Mercury, Uranus→Sun (and sibling equivalents) to the curated pair lists.
- Add quincunx and semisextile for luminary and Mercury/Mars pairings only, at tight orbs.
- Make the client sort match the server weighting so both layers agree on what matters, and raise the client slice from 12 to the full curated set (the server already caps at 6, so this only widens the candidate pool).
- Raise the section cap from 6 to 8 and add a rule that any aspect under 1° must appear in a section regardless of weight.
- Where the citation gate silences an aspect that was calculated, list it in a short "also present, wider orb" line rather than dropping it silently.

**E. Claim validation**
- Add a post-parse check that every `essence` line and every `sections[].howItLands` names a planet, sign, house, or aspect. Lines that fail get one repair pass, then are dropped.

## Technical notes

Files that would change: `src/lib/parentChildSynastry.ts` (pair lists, aspect set, ranking, payload size), `supabase/functions/family-pair-reading/index.ts` (schema field, prompt rules, section cap, validators), `src/components/family/FamilyTab.tsx` (render the two guidance blocks). `src/lib/aspectOrbs.ts` stays untouched so no other tab shifts. No database or other-tab changes.

Verification: run the pair reading for Lauren and Ben, then Lauren and Ike, and confirm the arrow shorthand is intact, the balanced block appears on both sides, and every claim names a placement.

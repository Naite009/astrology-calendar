# Phase 3: bounded interpretation accuracy and tab distinctiveness

## Scope and result

Implemented Combos display safeguards, a checked Sacred Script growth pathway and secondary Decoder personality references. All tabs remain. No saved birth data, chart records, authorization, edge functions or astronomical core formulas were edited. This is not whole-app certification; Phase 4 remains necessary.

## Exact pathways changed

### Combos

- `src/lib/planetaryCombinationsExpanded.ts`: removed the false Moon-in-Aquarius detriment statement and tag. Traditional lunar detriment is Capricorn; Aquarius is peregrine.
- `src/lib/interpretation/checkedCombination.ts`: card title, summary, dignity tags and ruler labels for single planet/sign entries derive from `essentialDignity.ts`, `psychologicalFunctions.ts` and `chartRuler.ts`. Traditional rulers and explicitly named modern co-rulers are separate.
- `src/lib/interpretation/legacyClaimGate.ts`: sentence-level display cloning rejects unsupported supernatural, medical, fate and inferred family-history claims and checks explicit essential-dignity assertions against the canonical source. IDs, matching factors and chart facts are retained; input objects are not mutated.
- `src/components/CombosView.tsx`: `renderCombinationCard`, classical statement display, aspect modifier display/coverage names, retrograde interpretation and Pattern Mirror card inputs now use the checked display pathway. Canonical placement interaction section and prior matching work remain. Added the same calculation-backed birth-time notice used elsewhere.
- `src/components/LifePatternsTab.tsx`: psychic, children, career, lucky-day, self-sabotage and guardian result display objects pass the same sentence gate. Analysis itself was not rewritten.
- `src/lib/planetDignities.ts`: cleared traditional dignity assignments for Uranus, Neptune and Pluto in the legacy data adapter. Existing modern co-rulers remain available through the explicitly labeled canonical chart-ruler helper. Its existing status function already withheld traditional dignity for these bodies, but raw table consumers could previously bypass that protection.

**Before:** “Moon in detriment in Aquarius” and catalog assertions of prophetic dreams, inherited trauma, psychic gifts and inferred parental history.

**After:** Moon Aquarius is identified as peregrine, Aquarius traditionally ruled by Saturn with Uranus named as modern co-ruler. Observable sign response is qualified rather than destiny. Unsupported sentences are withheld instead of repaired by inventing a different biography. Existing canonical paired-placement comparisons retain their specific example, tension and integration.

### Sacred Script

- `src/lib/interpretation/symbolicDevelopment.ts`: checked Saturn sign/house/dignity, two tight canonical Saturn contacts, canonical major-planet element balance, concrete practice, and degree-based 12th-house selection. Unknown-time reading copies omit houses; stored charts remain untouched.
- `src/components/sacredscript/SymbolicDevelopmentPanel.tsx`: prominent growth-through-practice section with source evidence, contact-specific integration, element supports and a manageable next step.
- `src/components/SacredScriptView.tsx`: preserves the source chart for the shared birth-time notice and uses its house-safe reading copy. Existing sections remain expandable rather than a second default-open portrait. Character, synthesis and final-directive display objects pass the claim gate. Section 8 now renders the checked development pathway instead of the former deterministic Saturn teaching block. Timing remains available in Section 2, which still uses its existing calculated cycles. Print and notes remain available.
- `src/components/sacredscript/PsychicGiftsCard.tsx`: replaces claimed ability scores and client assertions with optional labeled reflection; no “highly gifted,” reliable visions or childhood ability biography.
- `src/components/sacredscript/KarmicPastLifeCard.tsx`: keeps an optional spiritual reflection without inferred occupation, inherited trauma or karmic debt. Corrects its former same-sign-equals-12th-house assumption by using the shared degree-based house lookup.

**Live-discovered defect, fixed before acceptance:** opening Maria's former Saturn section still displayed “Something necessary for emotional development was missing,” “the entire psyche develops lopsided,” “nothing was given freely,” and fear of fate destroying the person. The entire active block was replaced, not merely collapsed or relabeled.

**After example:** Saturn in Cancer, House 12, traditional detriment remains factual. Practice asks for one responsibility the person can complete and one limit to state. Saturn contacts retain actual bodies, houses and orbs, with conditional observable responses and integration. No childhood deprivation is inferred.

### Decoder

- `src/components/ChartDecoderView.tsx`: technical title/description foreground placements, measured contacts and traditional dignities. Core Inner Dynamics, Your Chart in Simple Words, Reading Script Generator and Highest Potential Synthesis remain functional in secondary expandable references. Cast, dignity, birth conditions, psychological fact map, aspects, configurations and every existing internal tab remain.

## QA actually performed

- Full final suite: **843 tests passed, 46 files** (`bunx vitest run --maxWorkers=2`). Includes 22 Phase 3 semantic regressions and all prior precision-aware house tests.
- New tests: actual Moon Aquarius catalog entry, all seven traditional planets across the twelve signs, dignity assertion rejection, modern unassigned dignities including raw adapter fields, factor-order invariance, traditional/modern ruler labeling, unsupported ability/history/fate sentences, safe neighboring content preservation, all combination summaries/energy expressions, chart immutability, ten-major counts, different chart evidence, degree-based 12th-house boundary, unknown-time withholding and concrete Saturn integration.
- Signed-in browser acceptance used actual saved **Maria Vezos** and **Harrison Bates**, selected through the existing searchable picker, in Combos, Sacred Script and Decoder. Six view checks passed, all retained the birth-time house notice, both Script views showed the checked growth panel, both Decoder reference controls opened successfully, and no browser page errors were observed.
- Reopened Section 8 for each chart after replacement and searched saved rendered text for the false Moon dignity, prophetic-dream claim and the live-discovered unsupported Saturn history/fate sentences: no matches.
- Maria's rendered Combos retained Moon Aquarius House 6, opposition Ascendant Leo House 1, 0.417-degree orb, with the separate uncertainty notice. Chart geometry was not changed by this phase.
- Screenshots inspected for actual saved Maria Script and Harrison Decoder. Browser artifacts stayed under `/tmp/browser/phase3`, outside the repository. Desktop viewport was 1280 × 1800. Mobile and printed pagination were not tested in this phase.
- Latest preview diagnostic: **build OK**. `git diff --check` passed. No manual build/typecheck was run.

## Remaining limits for Phase 4

- The sentence gate is targeted protection, not a universal natural-language validator. Safe-sounding but vague or unsupported catalog prose can remain, particularly subordinate titles, tags and untouched libraries. It does not certify every interpretation in the app.
- Sacred Script still retains expandable Character, Mercury, Elemental Wisdom, Nodes, Midheaven and other references. These were not comprehensively rewritten or individually opened in this pass; residual overlap and independent prose remain there. Section 8 and default checked growth are repaired, not the entire reference library.
- Decoder secondary script and synthesis authors were demoted, not rewritten. The screenshot shows some generational/point aspects still in its inner-dynamics reference; priority and personalization need further review.
- Combos Life Patterns and Pattern Mirrors display filtering does not certify their underlying analysis or matching algorithms. In particular, compound catalog factor matching and isolated luck/children/guardian analyses need Phase 4 verification; no new calculations were added here.
- Optional supernatural reflection now avoids evidence-like ability claims, but its existence is a labeled spiritual option, not a scientific determination.
- Existing unresolved roadmap items from earlier phases are unchanged, including fresh Natal Portrait authoring reliability and remaining calculator consolidation. This phase does not claim they are fixed.

## Architecture record

`AGENTS.md` records the checked legacy display boundary and canonical Sacred Script development sources. Existing tab contracts and precision-aware house architecture were preserved.
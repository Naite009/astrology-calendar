---
name: Ask Tab Narrative Reading Standards
description: 5-movement long-form prose portrait reading type in the Ask tab using the Claude pipeline
type: feature
---
The Ask tab includes a `narrative` reading type (📖 Narrative Quick Topic) that replaces the retired standalone Narrative tab (which used Gemini Flash via `generate-narrative` + `GroundedNarrativeView`).

It runs through the existing Ask pipeline so it inherits automatically: EPHEMERIS FACT CHECK, ruler-chain enrichment, Hybrid Clarity Rule, retrograde post-correction, Behavior-First mandates, Essence Opening, banned-phrase enforcement, somatic felt-sense layers.

**Structure (mandatory, in order):**
1. `placement_table` "Natal Key Placements"
2. `narrative_section` "Opening Portrait" — strongest chart signature, person says "yes that's me" by paragraph 2
3. `narrative_section` "The Inner World" — Sun/Moon/Asc + Asc-ruler chain
4. `narrative_section` "How They Meet the World" — Mercury/Venus/Mars relational arc, 3rd/7th/5th ruler chains
5. `narrative_section` "The Long Arc" — Jupiter/Saturn/Chiron/outers/Nodes developmental story
6. `narrative_section` "The Closing Truth" — one paragraph
7. `summary_box` "The Chart in One Breath" with single item "Truth"

**Voice:** flowing prose 350–600 words per movement, no bullets inside movements, second person, no meta-sentences, zero "wound/portal/liminal/metabolized/calling-as-noun/journey/tapestry."

**`question_type` value:** `narrative` → `QT_TO_LABEL["narrative"] = "Narrative"` in `supabase/functions/ask-astrology/index.ts`.

## Routing Isolation (server-side)

The `narrative` question_type has a fully dedicated routing path in `supabase/functions/ask-astrology/index.ts`:

- **Dedicated system prompt:** `NARRATIVE_SYSTEM_PROMPT` (defined immediately after `SYSTEM_PROMPT`). Self-contained — restates the universal voice/behavior rules inline rather than inheriting from `SYSTEM_PROMPT`. Contains the 5-movement structure, the hard structural contract (one `placement_table` "Natal Key Placements", five `narrative_section` entries with exact titles in order, one `summary_box` "The Chart in One Breath" with one item "Truth"), and explicit forbids on timing_section, SR placement table, modality_element, relationship/career sections.
- **Detection:** parses the `question_type ... MUST be exactly "<type>"` directive from user messages into `isNarrativeQuestion`.
- **3-call relationship orchestrator unreachable:** `isRelationshipQuestion` is short-circuited with `!isNarrativeQuestion &&` so a narrative reading can never enter the relationship branch.
- **System prompt branch:** the Anthropic call uses `isNarrativeQuestion ? NARRATIVE_SYSTEM_PROMPT : SYSTEM_PROMPT`.
- **Post-process pipeline skips for narrative:** `ensureSolarReturnPlacementTable`, `injectDeterministicModalityElement`, and `correctModalityElementBodyClaims` are all gated with `qt !== "narrative"`. Skips are logged as `pipeline_pass_skipped`.
- **Relationship contract checker:** `enforceRelationshipContract` is already gated to `question_type === "relationship"` only — narrative naturally never invokes it.

Quick Topic message in `AskQuickTopics.tsx` is intentionally thin: `"Generate a NARRATIVE PORTRAIT for {name}, born {date} at {time} in {loc}. Today is {today}. The 'question_type' in your JSON output MUST be exactly 'narrative'."` All structural and voice rules live server-side in `NARRATIVE_SYSTEM_PROMPT`.

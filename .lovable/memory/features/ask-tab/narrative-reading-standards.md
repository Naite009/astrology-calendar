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

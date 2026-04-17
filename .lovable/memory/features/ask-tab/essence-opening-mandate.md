---
name: Essence Opening Mandate
description: Every Ask reading must open with a jargon-free "Essence" paragraph capturing the person's whole pattern in recognizable human language before any astrology
type: preference
---
Every Ask tab reading (relationship, career, money, health, relocation, spiritual, timing, general) MUST begin its narrative with a section titled "The Essence" (topic-flavored, e.g. "The Essence of Your Relationship Style"):

- Single body paragraph, 2–4 sentences, ~50–90 words
- ZERO astrology jargon — no planet names, sign names, house numbers, aspect names, or symbols
- Synthesizes Sun + Moon + Venus + Mars + Saturn + relevant ruler chains + signature aspects into ONE recognizable human portrait
- Uses "you" voice and concrete lived behavior (what they do, what trips them up, what they're drawn to)
- Leads with the signature tension/pattern, never a generic compliment
- Ends with a one-sentence preview of the deeper read
- Goal: the reader thinks "yes, you're describing me" before any astrology is named

Only AFTER this Essence paragraph does the reading proceed to the placement-first ruler-chain narrative ("Natal Relationship Architecture", etc.).

For relationships, the section order becomes 12 total: 1) Natal Key Placements, 2) Solar Return Key Placements, 3) The Essence of Your Relationship Style, 4) Natal Relationship Architecture, etc.

Implemented in `supabase/functions/ask-astrology/index.ts` SYSTEM_PROMPT (ESSENCE OPENING MANDATORY block) and the relationship section template.

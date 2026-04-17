---
name: Prose Voice & Banned Phrases
description: Hard banned-phrase list and named inline transition lines that replace bullets in compact relationship sections
type: preference
---
## Banned phrases (hard ban — never use anywhere in any Ask reading)
"blueprint", "DNA", "configuration", "this is the core of", "reinforces this", "the key placements suggest", "this configuration tells us", "your chart shows", "key indicators", "energetic signature", "cosmic", "the universe is", "tells a very specific story", "further emphasizes", "this is a direct contrast".

If the AI catches itself about to use any of these, it must stop and rewrite in plain human language instead.

## Prose-over-bullets in compact relationship mode
The compact relationship sections — "How You Love", "This Year in Love", "Where Natal and Solar Return Connect", and the prose portion of "Relationship Strategy" — must use continuous prose paragraphs in the `body` field (2–4 paragraphs each, line-break separated) and an empty `bullets: []` array. Synthesis happens through NAMED INLINE TRANSITION LABELS embedded inside the prose, not as separate bullet items.

## Allowed named transitions (inline labels, not bullets)
- "What you're attracted to vs. what you actually need:"
- "Early vs. committed:"
- "Shadow pattern:"
- "The core contradiction:"
- "What would actually work long-term:"
- "The emotional tone:"
- "What's shifting:"
- "What this year is for:"
- "Best timing windows:"
- "The one shadow pattern most worth breaking:"
- "How to work with this chart:"

Example inside body prose: "...you keep gravitating toward people who feel mentally electric. Shadow pattern: the same wit that hooks you also keeps you from asking the boring practical questions early enough. What would actually work long-term: someone who is steady AND can hold a real conversation — you don't have to choose."

Implemented in `supabase/functions/ask-astrology/index.ts` SYSTEM_PROMPT (top-of-prompt BANNED PHRASES block) and the COMPACT RELATIONSHIP MODE PROSE-OVER-BULLETS RULE.

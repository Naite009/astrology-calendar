---
name: No Meta/Transitional Sentences
description: Hard ban on introductory, transitional, or self-referential sentences about the document itself — every sentence must make a claim about the chart or person
type: preference
---
Every sentence in any Ask reading must make a substantive claim about the chart, the person, or a concrete recommendation. Pure scaffolding sentences are forbidden.

FORBIDDEN sentence patterns (non-exhaustive):
- "This reading will explore..."
- "In this section we'll look at..."
- "Below, we break down..."
- "Let's dive into..."
- "First, let's consider..."
- "To summarize the above..."
- "As we'll see in the next section..."
- "This analysis covers..."
- "The following addresses..."
- "Now turning to..."
- "Before we continue..."
- "In conclusion,..."
- "To wrap up,..."
- "Here's what your chart says about..."

Test: if a sentence would still be true with someone else's chart swapped in, DELETE IT.

Sections must:
- Open directly with substance (behavior in sentence 1, placement in sentence 2 per the behavior-first rule)
- Close on the last real claim, not on a meta summary

Implemented in `supabase/functions/ask-astrology/index.ts` SYSTEM_PROMPT (NO META SENTENCES — HARD RULE block, immediately after COMPRESSION MANDATE).

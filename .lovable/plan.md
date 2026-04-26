I agree: BASE RULE 9 is active, but it is still only an instruction, and the model is treating it as optional. The next fix should make SR Mercury retrograde an explicit required output slot inside the career JSON structure, while restoring the two career bullet definitions that started coming through empty.

## Plan

1. **Change the career template from “rule” to required output structure**
   - In `supabase/functions/ask-astrology/index.ts`, update the `question_type: "career"` template so `"Hidden Strengths"` has a mandatory labeled bullet:
     - `label: "SR Mercury Retrograde Review"`
     - `text: "SR Mercury is retrograde this year, so communication, decisions, and contracts at work will run on review..."`
   - This makes the acknowledgment part of the section shape the model must emit, not just a prose instruction it can ignore.

2. **Add an explicit career-section schema note**
   - Strengthen the career section definition so `"Hidden Strengths"` must include non-empty bullets with exact labels:
     - `Daily Work Superpower`
     - `Professional Tribe`
     - `SR Mercury Retrograde Review` when SR Mercury is retrograde
   - Each required bullet must have a non-empty `text` field of 1–3 sentences. Empty strings are forbidden.

3. **Restore the two broken bullet definitions**
   - Re-add/clarify the definitions that the prompt change weakened:
     - `Daily Work Superpower`: must explain the 6th-house daily work style in plain career language.
     - `Professional Tribe`: must explain the 11th-house/networking/community pattern in plain career language.
   - These will be defined as required bullet outputs, not optional concepts, so they stop being emitted with empty bodies and then dropped by cleanup.

4. **Keep scope tight**
   - Do not change `factsAwareRetrogradeSweep`.
   - Do not change the canonical SR fetch.
   - Do not change placement table serialization.
   - Do not add a post-processor injection step.
   - Do not touch unrelated reading types.

## Technical details

Current state verified in `supabase/functions/ask-astrology/index.ts`:
- `BASE RULE 9` exists at the universal base layer.
- `CAREER SR MERCURY RETROGRADE RULE` exists, but it is still prose guidance.
- The career section list currently defines `Hidden Strengths` only as a parenthetical topic list, not as a strict bullet schema.
- The cleanup pipeline drops empty sections/items, which explains why empty bullet bodies can disappear from output instead of being visibly flagged.

The targeted change is to make the model produce this shape in the career reading when SR Mercury is retrograde:

```text
narrative_section — "Hidden Strengths"
  body: non-empty career prose
  bullets:
    - label: "Daily Work Superpower"
      text: non-empty explanation of 6th-house daily work style
    - label: "Professional Tribe"
      text: non-empty explanation of 11th-house/networking fit
    - label: "SR Mercury Retrograde Review"
      text: one plain-English sentence explicitly saying SR Mercury is retrograde this year and explaining communication, decisions, and contracts at work
```

That addresses the actual failure mode: the prompt rule is being ignored, so the acknowledgment becomes a required field in the output format.
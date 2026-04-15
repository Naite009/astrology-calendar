

# Fix Elemental & Modal Balance Section

## Problems
1. **No chart label** — the section doesn't specify whether it's analyzing natal or solar return placements. Looking at the PDF output, it appears to use natal planets (Moon in Cancer, Venus in Taurus matches natal). It should explicitly say "Natal" since the relationship architecture is grounded in the natal chart.
2. **Generic filler interpretations** — every element/modality interpretation is a throwaway phrase ("Strong drive and initiative", "Practical grounding"). These tell the reader nothing they couldn't guess. Everyone has elements; the value is in what the *specific balance* means for *this person's question*.

## Solution

Update the `modality_element` schema and prompt instructions in `supabase/functions/ask-astrology/index.ts`:

### 1. Label it explicitly as Natal
- Change the title in the schema example to `"Natal Elemental & Modal Balance"`
- Add a prompt instruction: "This section analyzes the NATAL chart's elemental and modal distribution. Do not mix in Solar Return placements."

### 2. Kill the generic per-element interpretations
- Change each element/modality `interpretation` field from a generic label to a **question-specific behavioral sentence**. Update the example schema to show what good looks like:
  - Instead of: `"interpretation": "Strong drive and initiative."`
  - Require: `"interpretation": "1 sentence describing what THIS element count means for THIS person's specific question. For relationships: how does having 3 fire planets affect how they pursue or respond to attraction? Be concrete — describe a behavior or pattern, not a trait label."`
- Same for modalities: instead of "Leadership energy", require a sentence about what cardinal dominance means for how they *act* in the specific domain (relationships, career, etc.)

### 3. Make the balance_interpretation the anchor
- Keep the existing instruction for `balance_interpretation` but strengthen it: "This is the ONLY paragraph the reader will remember. It must name the specific tension or strength this balance creates. Example: 'Your heavy Water and Earth make you need proof before you trust, but your Mutable dominance means you keep giving chances to people who haven't earned them yet.' Do NOT write generic element descriptions."

### 4. Apply the Compression Rule
- Add instruction: "If the elemental/modal insight has already been covered in the Relationship Pattern or Contradiction Patterns sections, either skip this section entirely or reference only what's NEW. Do not repeat the same Earth-vs-Air tension if it was already explained."

## Files to edit
- `supabase/functions/ask-astrology/index.ts` — update schema example and prompt instructions for the `modality_element` section across all reading types

## What stays the same
- The JSON structure (elements array, modalities array, polarity array) stays identical
- The UI renderer doesn't need changes
- All other sections unaffected


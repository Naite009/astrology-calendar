
## Goal

Match the depth of the Ben / Max / Ike example. Current readings have many fields (essence, sections, pressureProfile, etc.) but no single field forces the AI to walk through the **mechanism**:

> placement A does X · placement B does Y · the gap between X and Y · how that gap shows up in real life · how it amplifies under stress · what this is not

That arc is what makes the ChatGPT version feel surgical. We will add it as a required, schema-enforced section.

## Approach

Add a required `childMechanism` object to both family edge functions. Schema-locking it is more reliable than another paragraph of prose instructions.

### New object shape

```text
childMechanism: {
  corePattern: [
    { placement: "Cancer Moon",      does: "feels everything immediately and personally; reactions are fast and body-based, not verbal" },
    { placement: "Aquarius Mercury", does: "processes through detachment and logic; wants to step back, does not naturally name feelings" }
    // optional 3rd entry ONLY if the real driving tension requires it (e.g. Moon vs Saturn AND Mercury)
  ],
  theConflict: "He feels like Cancer but has to explain like Aquarius. Feeling hits first (fast, intense, unclear); thinking arrives later (cool, removed). Logic is available before emotional language is.",
  inRealLife: "When you ask 'what's wrong?' the feeling is loud but not organized yet, and his brain is wired to respond with clean logic, so he literally has nothing usable to say. You get 'nothing,' silence, or a cold factual answer.",
  underStress: "Feeling gets stronger (Cancer) while the mind defends harder (Aquarius). He either shuts down or becomes sharp and dismissive.",
  whatThisIsNot: "Not coldness, not avoidance, not disrespect."
}
```

### Prompt rules added next to the schema

1. **`corePattern` length: 2 placements in most cases, max 3 only when a third is genuinely driving the tension.** Pick the placements that create the loudest internal contradiction (typically Moon + one of Mercury / Sun / Mars / Saturn / Ascendant). Never two harmonious placements.
2. **`does` describes an internal mechanism, not a trait.** Verbs like *processes, absorbs, scans, defends, regulates, organizes, releases*. Never adjectives like *sensitive, creative, fiery*.
3. **`theConflict` names the gap as a structural mismatch**, using the pattern "feels like X but has to [verb] like Y" or "wants A but is wired for B".
4. **`inRealLife` is a parent-recognizable scene** the parent has already lived (asking "what's wrong", giving an instruction, correcting in public, ending screen time). No abstract description.
5. **`underStress` must show both placements amplifying at once** — the Cancer feeling gets louder AND the Aquarius defense gets harder. Both, not one.
6. **`whatThisIsNot` is ONE short sentence only.** Three to five things it is not, separated by commas. No explanation, no therapy language, no "because" clause. If it grows past one sentence it becomes preachy and gets cut.
7. **MECHANISM DIFFERENTIATION RULE (system reading, multi-child)**: Each child must have a clearly different mechanism. Across siblings, the set of mechanisms must vary on at least two of these axes:
   - internal timing (fast vs slow)
   - processing style (internal vs external)
   - reaction pattern (withdraw vs push vs perform vs negotiate)
   If two children's `theConflict` sentences could be swapped without anyone noticing, rewrite the second one. No template reuse.
8. **Banned**: zodiac shorthand without mechanism, single-line summaries, "this means he is …" closures, any sentence that could be cut without losing the mechanism.

### Where it goes

- **`supabase/functions/family-pair-reading/index.ts`**
  - Add `childMechanism` to the JSON schema (between `essence` and `sections`).
  - Add a dedicated **MECHANISM PORTRAIT RULE** block to the system prompt, right after the existing DEPTH RULE. Include all 8 sub-rules above.
  - Update the closing "Write the reading" instruction to require `childMechanism` first.
  - When the recipient is the parent (not a child), still emit `childMechanism` for the child being analyzed.

- **`supabase/functions/family-system-reading/index.ts`**
  - Add a `childMechanisms` array (one entry per child) to the schema.
  - Reuse the same MECHANISM PORTRAIT RULE block, and explicitly include the **MECHANISM DIFFERENTIATION RULE** at the end with a sibling-comparison checklist the AI must run before emitting.
  - Leave `childMechanisms: []` as a safe default in sanitize logic.

- **No UI rendering yet.** Schema-first so the data exists; a "Mechanism" card on the reading display can come in a follow-up once we see real output.

### Validation / testing

1. Deploy both edge functions.
2. Run one pair reading against a known child profile (e.g. Cancer Moon + Aquarius Mercury) via `curl_edge_functions` and inspect `childMechanism` for the six-part shape and the one-sentence `whatThisIsNot`.
3. Run one system reading with 2–3 kids; confirm one mechanism per child, each picks a different driving tension, and the differentiation rule is visibly met (timing / processing / reaction axes differ).
4. If the AI flattens any field into a single trait, or two siblings sound interchangeable, tighten the prompt with one more forbidden-phrase example and redeploy.

### Memory update

After verification, add `mem://features/family-readings/mechanism-portrait`: *every family reading must produce a 6-part mechanism portrait per child (two placements with internal mechanism, the structural conflict, a real-life scene, under-stress amplification, and a one-sentence "what this is not" reframe). In system readings, every child's mechanism must differ from siblings on at least two axes: timing, processing style, reaction pattern.*

## Out of scope

- No UI changes yet.
- No changes to ask-astrology or cosmic-weather (the depth rule is already in place; we can port the mechanism portrait there in a follow-up if you want it for relationship/Ask readings too).

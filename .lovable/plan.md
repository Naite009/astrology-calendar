## The 3 questions the build must answer (per child)

Tara-Vogel-style parenting astrology readings answer three questions. Current engine answers 1 and 2 well. Question 3 is missing in *recognition* form.

1. **How does this child actually work?** (wiring / mechanism, not traits)
   Already covered: `childMechanism`, `essence`, `sections.howItLands`, `atAGlance`, MECHANISM-FIRST + DECISION LAYER rules.
2. **Where do they struggle / get stuck?** (friction points in the design)
   Already covered: `pressureProfile`, `perceptionTranslation`, `whatEscalates`, `inTheMoment`, `connectionMisfire`, `whatMakesItWorse`.
3. **What does this child need from me, specifically?** (translation of the wiring into parent alignment)
   **MISSING.** Closest fields (`respondsBestWhen`, `whatHelps`, `practice`) are instruction-shaped. None give the parent the recognition moment "this is the kind of parent my child needs me to be."

## What to add: `whatThisChildNeedsFromYou` (Layer 3)

A required, schema-locked section per child in BOTH edge functions. Generated **FROM** the child's `childMechanism` — not freestyle.

### Shape

```text
whatThisChildNeedsFromYou: {
  opener: "This child needs a parent who...",
  lines: [
    { text: string, tiedTo: "processing" },   // how they process internally
    { text: string, tiedTo: "stuckPoint" },   // where they get stuck
    { text: string, tiedTo: "pressure" }      // how they react under pressure
  ]
} | null
```

- Exactly 3 lines, one per `tiedTo` slot, in this order. Optional 4th line only for a specific named friction (Chiron contact, retrograde Mercury, Moon-Pluto), tagged `tiedTo: "specificFriction"`.
- Each line ≤ 14 words, verb-first, completing "…a parent who [verb]".
- Each line traceable to a mechanism element already named upstream.

### Hard rules (added next to existing MECHANISM / DECISION blocks)

1. **Mechanism mapping is mandatory.** Each line must map to a specific element of `childMechanism` (corePattern entry, theConflict, or underStress). If the model can't point to the source, REWRITE.
2. **"Because otherwise what happens?" test.** Each line must implicitly answer this. If removing the line costs the parent nothing specific to *this* child, REWRITE.
3. **Genericity test (HARD).** Strip the child's chart context. Re-read the 3 lines. If they still work for any child, the section is INVALID. Deterministic backstop enforces this with a banned-phrase regex.
4. **Recognition, not instruction.** No "do this", "try this", "make sure to", "remember to", numbered steps, scripts, or "tips". Phrased as a quality the parent must embody, not an action to perform.
5. **No therapy language.** Banned: "hold space", "attune", "co-regulate", "honor their feelings", "validate their inner world", "meet them where they are", "create a safe container", "be present with".
6. **No generic parenting advice.** Banned: "be patient", "listen actively", "set clear boundaries", "be consistent", "stay calm", "model the behavior", "lead by example".
7. **No "because" clauses in the line itself.** The mechanism is upstream. These lines are recognition, not explanation.

### Slot prompts

- **`processing` line** → translate `childMechanism.corePattern` into one quality the parent must embody so the child's internal processing can complete. (e.g. "does not force clarity before they are ready")
- **`stuckPoint` line** → translate `childMechanism.theConflict` into one quality that prevents the parent from misreading the stuck moment. (e.g. "understands that silence does not mean nothing is wrong")
- **`pressure` line** → translate `childMechanism.underStress` into one quality that keeps the parent steady when the child amplifies. (e.g. "stays steady when their volume rises instead of matching it")

### DEPENDENCY GATE (CRITICAL — added per latest feedback)

**`whatThisChildNeedsFromYou` can only be generated AFTER a valid `childMechanism` exists for the same child.**

A `childMechanism` is "valid" only if it contains BOTH:

- a clear **internal conflict** in `theConflict` (a structural mismatch phrased as "feels like X but has to Y" or "wants A but is wired for B"), AND
- a **cause → effect** explanation in `inRealLife` AND in `underStress` (the wiring producing the observable behavior in a parent-recognizable scene).

If either is missing, the model MUST emit `whatThisChildNeedsFromYou: null` and skip the section. Do NOT fall back to generic parenting language. The UI will simply not render the block in that case.

Generation order enforced in the prompt and verified deterministically:

1. Emit `childMechanism`.
2. Run validator (`isChildMechanismValid()` in sanitize.ts) that checks `theConflict` for the conflict pattern and `inRealLife`/`underStress` for cause→effect markers ("so", "because", "which makes", "which means", "this creates").
3. If invalid → set `whatThisChildNeedsFromYou = null`, log `_validation_log: needs_section_blocked_weak_mechanism`, move on.
4. If valid → emit the 3 mechanism-mapped lines.

This guarantees the section never appears unless there is real mechanism content to translate from.

### Where it goes

- **`supabase/functions/family-pair-reading/index.ts`**
  - Add `whatThisChildNeedsFromYou` to `ReadingPayload` and JSON schema, right after `childMechanism`, before `essence`.
  - Add `WHAT THIS CHILD NEEDS FROM YOU RULE` block in the system prompt immediately after `DECISION LAYER RULE`. Include the 7 rules + 3 slot prompts + the DEPENDENCY GATE.

- **`supabase/functions/family-system-reading/index.ts`**
  - Add `whatEachChildNeedsFromYou: { childName: string; opener: string; lines: {...}[] }[]` (or null per child), generated AFTER `childMechanisms` and mapped per child.
  - Reuse the same rule block + DEPENDENCY GATE applied per child.
  - Add a **DIFFERENTIATION RULE**: across children, the lines must not be swappable. If swapping child A's lines into child B's block still reads true, REWRITE.

### Sanitize + deterministic backstop

- Both sanitize files: default to safe empty shapes; allow `null` to flow through to the UI.
- `isChildMechanismValid(childMechanism)` enforces the dependency gate server-side; if invalid, force the section to `null` regardless of what the model emitted.
- `validateNeedsLines()` runs banned-phrase regex (therapy phrases, generic-parenting phrases, leading action verbs like "ask", "use", "try", "give", "provide"). Drop offending lines; if fewer than 3 remain, force the whole section to `null` and log `_validation_log: needs_section_underfilled`.

### UI (flagged, NOT in this change)

Quiet centered block on the reading display when present; nothing rendered when null.

```text
What [Child]'s Wiring Asks of You

This child needs a parent who…
  · does not force clarity before they are ready
  · understands that silence does not mean nothing is wrong
  · stays steady when their volume rises
```

### Verification

1. Deploy both functions.
2. Run a pair reading with a strong mechanism case (e.g. Cancer Moon + Aquarius Mercury) → confirm 3 mechanism-mapped lines, all slots filled, genericity test passes.
3. Run a pair reading with a deliberately weak mechanism case (sparse chart data) → confirm `whatThisChildNeedsFromYou` is `null` and `_validation_log` records `needs_section_blocked_weak_mechanism`.
4. Run a system reading with 2–3 children → confirm one block per child (or null where mechanism is weak), and the differentiation rule holds.

### Memory update (after verification)

Add `mem://features/family-readings/parent-alignment`: every family reading may include a `whatThisChildNeedsFromYou` block of exactly 3 mechanism-mapped recognition lines (processing / stuckPoint / pressure), each tied to a placement named in `childMechanism`. The section is GATED on a valid mechanism (clear internal conflict + cause→effect); if the mechanism is weak, the section is null, never filled with generic parenting language. Differentiated across siblings in system readings.

## Out of scope

- No UI rendering in this pass (schema + prompt only).
- No changes to ask-astrology, cosmic-weather, or solar-return readings.

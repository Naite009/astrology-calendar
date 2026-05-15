
# Goal

Rebuild the Family System reading to match the ChatGPT version's **shape AND voice**, so it works for any family added to the app. Two things change together:

1. **The 8-section output structure** (new)
2. **The 4-step pipeline + range-based output engine** that fills it (new enforcement)

Both are needed. Today the app has good rules but the wrong skeleton, so even when individual lines improve, the reading still doesn't read like the version you liked.

---

## Part 1 — The 8-Section Structure (NEW shape of the reading)

The edge function will return these sections in this order. Each one has a defined purpose and a defined voice. UI renders them in this order too.

### 1. How This Family Works at a Glance
One short line per family member (parents AND children, in input order). Plain English, observable behavior, concrete trigger.
Pattern: `<Name> → <what they do>, but <what happens when stressed>`.
Already exists as `atAGlance` — keep field, tighten format.

### 2. Parent as the Regulation Center  *(new section)*
One paragraph per parent. Frames the parent not as "in control" but as the one who sets emotional tone, and names how that tone breaks under pressure (retreats, goes quiet, gets sharp, over-explains, etc.). Ends with a "What this means in real life" line — one sentence of practical takeaway.
New field: `parentRegulationCenter: { name, body, whatThisMeansInRealLife }[]`.

### 3. Each Child's Adaptation
One block per child with three parts:
- **Adaptation paragraph** — how this child adapts to the family system (not just personality in a vacuum).
- **Responds best when** — one concrete sentence of what actually works for this child.
- **What makes it worse** — short bullets (already exists as `whatMakesItWorse`).
Replaces/expands current `childAdaptations`. New field shape: `{ name, adaptation, respondsBestWhen, whatMakesItWorse[] }`.

### 4. Parent ↔ Child Connections
One block per (parent, child) pair. Every pair must appear (relationship completeness rule already in place). Each block has:
- **Dynamic paragraph** — honest description, range-based.
- **What can feel hard** — one or two sentences of how it commonly breaks.
- **What helps** — one concrete sentence of what changes the dynamic.
Replaces current `parentChildConnections` shape. Keep `interactionPattern` as the underlying evidence anchor; surface it as the dynamic paragraph.

### 5. Sibling Dynamics
One block per sibling pair. Each block named as a **pattern type**, not a verdict:
- "translation problem" (different communication systems)
- "pacing friction" (different speeds)
- "competition risk" (similar drives)
- "quiet co-regulation" (low-aspect pair)
- etc.
Body: range-based description of how the pattern shows up. Shape: `{ siblingA, siblingB, patternType, body, whatHelps }`.

### 6. What Helps the Whole Family
A bulleted list of 5–8 concrete practices (e.g., "fewer group discussions", "movement before conversation", "private correction"). Tied to the actual chart signature of THIS family — fire-heavy families get different bullets than water-heavy ones. New field: `whatHelpsWholeFamily: string[]` plus `whatHelpsRationale: string` (one short sentence explaining why these specifically).

### 7. What to Avoid
A bulleted list of 5–8 concrete things to stop doing in THIS family. Mirrors the structure of section 6 but in the negative. New field: `whatToAvoid: string[]`.

### 8. Best Family Practice
A short, named, repeatable sequence — not a meeting. Default scaffold:
> **Pause → Separate → Regulate → Reconnect one-on-one.**
With 3–5 short bullets describing what each step looks like for THIS family (tone, length, who initiates). New field: `bestFamilyPractice: { sequence: string, steps: string[] }`.

---

## Part 2 — The 4-Step Pipeline (how every line above gets written)

This is the engine. The system prompt in `index.ts` is reorganized so the model must follow this order **internally** before writing anything in any section above.

**Step 1 — Pattern Extraction (astrology only)**
Per person: Moon (emotional style), Mercury (communication), Mars (reaction), Saturn/Chiron (sensitivity), Sect, dominant element, Ascendant. No interpretation yet.

**Step 2 — Behavioral Translation (pattern → observable action)**
Convert each pattern into something a parent could literally see:
- "needs validation" → "may get louder when not acknowledged"
- "processes internally" → "may go quiet, delay, or avoid"
- "action-oriented" → "may interrupt, act fast, resist waiting"
No abstract tone words alone ("intense", "weighty", "serious") — they must be paired with the concrete behavior they cause.

**Step 3 — Reality Filter**
Before any line ships:
- Do NOT assume positive outcomes.
- Do NOT assume connection exists.
- Do NOT assume the pattern expresses cleanly.
- Allow distortion, escalation, mismatch.
- Hard test: "If a real parent read this and said 'this is not my family,' rewrite it."

**Step 4 — Range-Based Output**
Every line that names an aspect, composite, or shared placement must express a range, not a verdict. Required shape (inline or as sub-bullets):
> "At its best: [connective] · More commonly: [neutral/everyday] · Under stress: [distorted/escalation]"
Or inline: "can show up as X, but can also Y depending on mood and regulation."

---

## Part 3 — Enforcement (so it works for every family, not just yours)

1. **System prompt rewrite** in `supabase/functions/family-system-reading/index.ts`. The 4 steps go FIRST as a numbered pipeline. Existing rules (coverage, no-config-vocab, distinct pattern, evidence gate, role-aware translation, dual expression, relationship completeness) get reorganized as enforcement clauses under the matching pipeline step instead of competing top-level paragraphs.

2. **Hard rules added to the prompt:**
   - Range marker required on every aspect/composite/placement line. Allow-list: "can show up as … but can also …", "may … though it can also …", "at its best … on a hard day …", "sometimes … and other times …", "tends to … but doesn't always …".
   - Verdict verbs forbidden: "creates", "brings", "gives", "results in", "leads to", "this is where it goes wrong", "this damages", "this is a strong bond".
   - Abstract tone words ("serious", "intense", "weighty") must be paired with the concrete behavior.
   - "What this means in real life" line required after each parent regulation paragraph.
   - "Responds best when" line required for every child.
   - "What can feel hard" + "What helps" pair required for every parent–child block.
   - Sibling blocks must be labeled with a `patternType` (translation problem, pacing friction, competition risk, quiet co-regulation, etc.) drawn from a fixed allow-list.
   - `whatHelpsWholeFamily`, `whatToAvoid`, `bestFamilyPractice` must reference THIS family's dominant element/sect/age mix — generic advice is invalid.

3. **Sanitizer / validator updates** in `supabase/functions/family-system-reading/sanitize.ts`:
   - Add `RANGE_MARKER_REGEX` allow-list and `VERDICT_PHRASES` deny-list — flag any pair line that fails.
   - Add validators for the new sections: parentRegulationCenter has `whatThisMeansInRealLife`; child blocks have `respondsBestWhen`; parent–child blocks have `whatHelps`; sibling blocks have a valid `patternType` from the allow-list; `bestFamilyPractice.sequence` is non-empty.
   - Strengthen `validatePairShape` so a pair entry without range markers or without `whatHelps` fails and forces regeneration.

4. **Type updates** in `src/lib/familySystemSynastry.ts` for the new fields, and **migration** in `src/lib/familySystemMigration.ts` so older cached readings without the new sections regenerate cleanly (drop, don't crash).

5. **Tests** in `supabase/functions/family-system-reading/sanitize_test.ts`:
   - Single-outcome line ("this creates connection through activity") → fails.
   - Range-form line → passes.
   - Abstract-only line ("this is intense") → fails.
   - Child block missing `respondsBestWhen` → fails.
   - Parent–child block missing `whatHelps` → fails.
   - Sibling block with unknown `patternType` → fails.
   - `bestFamilyPractice` without a sequence → fails.

6. **UI in `src/components/family/FamilyTab.tsx`** — render the new 8-section order:
   - Add components for sections 2 (Parent as Regulation Center), 6 (What Helps), 7 (What to Avoid), 8 (Best Family Practice).
   - Update existing pair/child blocks to render the new "What can feel hard" / "What helps" / "Responds best when" sub-rows.
   - Sibling blocks display the `patternType` as a small label above the body.
   - All visual styling uses existing semantic tokens.

---

## Why this generalizes to any family

The ChatGPT version felt right not because of your facts, but because:
- the **shape** acknowledged each relationship and each person separately,
- every line was framed as a **range, not a verdict**, so the reader could locate themselves in it,
- every pressure point was paired with **what helps**, and
- the closing **practice** was a real action sequence, not a meeting.

All four are structural, not per-family. Once the prompt + validator force them, every family added gets the same quality.

---

## Files to edit

- `supabase/functions/family-system-reading/index.ts` — new prompt around 4-step pipeline + 8-section schema.
- `supabase/functions/family-system-reading/sanitize.ts` — new validators, range/verdict regexes, section requirements.
- `supabase/functions/family-system-reading/sanitize_test.ts` — new tests.
- `src/lib/familySystemSynastry.ts` — new types for the 8 sections.
- `src/lib/familySystemMigration.ts` — migrate old cached readings cleanly.
- `src/components/family/FamilyTab.tsx` — render new sections + sub-rows.

## Out of scope

- New synastry math, new aspect detection, new orb thresholds.
- DB / schema changes.
- Per-user "lived experience" input field — range framing handles it.

## Open questions

1. For the **range** in each pair block, do you want it shown as **three explicit sub-bullets** ("At its best / More commonly / Under stress") in the UI, or kept **inline in prose** like the ChatGPT version you read? Default if you don't answer: inline prose for parent–child and sibling blocks (matches what you liked); explicit bullets only for the family-wide sections 6, 7, 8.
2. For the **sibling `patternType` allow-list**, the starter set is: *translation problem, pacing friction, competition risk, quiet co-regulation, mirror match, role split.* Want to add or remove any before I lock it in?

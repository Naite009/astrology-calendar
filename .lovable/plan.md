## Problem

Lauren ↔ Ben renders as nearly empty ("No tight aspects between personal planets in this pair") while Lauren ↔ Max and Lauren ↔ Ike get full content. The system currently equates **aspect density** with **relationship importance**, so low-aspect pairs get skipped and read as "no connection."

This is a structural rule problem in the prompt + schema, not a UI bug.

## Goal

Every parent ↔ child pair (and every sibling pair) renders a full block of equal weight, even when no tight (≤5°) personal-planet aspect exists. Aspect density may change *what* is cited, but never *how much* is written.

## Plan

### 1. Add a new RELATIONSHIP COMPLETENESS RULE (prompt)

In `supabase/functions/family-system-reading/index.ts`, add a hard rule above the JSON schema:

- Every parent–child and sibling pair MUST be filled in with substantive content of comparable length, regardless of aspect density.
- Forbidden: leaving a pair with only `composite` + `note: "No tight aspects..."`. That phrasing is banned outright.
- Forbidden: giving one child noticeably less content than the others. If pair lengths differ by more than ~30%, rewrite the short one.
- "Importance ≠ aspect count." Low-aspect pairs are often the most emotionally loaded and must be described from individual chart evidence.

### 2. Replace `note` with a required `interactionPattern` block

Schema change in the prompt (and mirrored in `sanitize.ts` allowed keys + types in `familySystemSynastry.ts`):

```text
parentChildConnections[i] = {
  parent, child,
  composite: { shared, feelsLikeForA, feelsLikeForB },   // already required
  bridge:   { aspect, forA, forB } | null,
  friction: { aspect, forA, forB } | null,
  interactionPattern: {                                   // NEW — REQUIRED, never null
    forA: string,   // how the parent tends to approach this child, behaviorally
    forB: string,   // how the child tends to experience the parent, behaviorally
    why:  string    // why it shows up that way, citing each person's Moon / Mercury / Mars / dominant element / sect, NOT requiring a synastry aspect
  }
}
```

Same `interactionPattern` block added to `siblingConnections[i]`.

The legacy `note` field is removed from the schema. The "No tight aspects between personal planets" sentence is added to the forbidden-phrase scrub list so it cannot leak through.

### 3. Evidence sources allowed for `interactionPattern`

The prompt explicitly authorizes these (so the AI stops defaulting to "no aspects → no content"):

- Each person's Moon sign + element (emotional style)
- Each person's Mercury sign + aspects (communication style)
- Each person's Mars sign + aspects (conflict / activation style)
- Element / modality mismatches between the two charts
- Sect difference (day vs. night chart)
- Developmental stage of the child
- Wider-orb (5–8°) cross-aspects, cited as "wider contact" (not as a tight bridge/friction)

The Dual Expression Rule and Role-Aware Rule still apply — `forA` and `forB` must be distinct, behavioral, and range-based.

### 4. Migration + sanitizer

In `supabase/functions/family-system-reading/sanitize.ts` and `src/lib/familySystemMigration.ts`:

- Add `interactionPattern` to `ALLOWED_PAIR_KEYS`.
- Drop legacy `note` (move to `FORBIDDEN_PAIR_KEYS` after migration window, or quietly discard).
- For cached entries that only have `note: "No tight aspects..."`, drop the note and leave `interactionPattern` undefined so the next regeneration fills it; the UI will show a regenerate hint rather than the dead "no aspects" line.

In `validatePairShape`: flag any pair where `interactionPattern` is missing or where `forA` / `forB` are identical / empty.

### 5. UI render (`src/components/family/FamilyTab.tsx`)

In `PairBlock`:

- Always render a "How this shows up day to day" section sourced from `interactionPattern` (forA labeled with the parent/older sibling name, forB labeled with the child/younger sibling name, then a short "Why" line).
- This section renders **whether or not** `bridge` / `friction` exist.
- Remove any branch that hides content when `bridge` and `friction` are both null.
- Remove rendering of the legacy `note` string entirely.

### 6. Tests

In `supabase/functions/family-system-reading/sanitize_test.ts`:

- Pair with no bridge/friction but a valid `interactionPattern` → passes validation.
- Pair with `note: "No tight aspects..."` and no `interactionPattern` → fails validation (forces regenerate).
- `interactionPattern.forA === interactionPattern.forB` → fails validation.

## Files to edit

- `supabase/functions/family-system-reading/index.ts` — new rule + schema + add forbidden phrase to scrub
- `supabase/functions/family-system-reading/sanitize.ts` — allowed keys, validator, migration of legacy `note`
- `src/lib/familySystemMigration.ts` — mirror sanitizer changes
- `src/lib/familySystemSynastry.ts` — type for `interactionPattern`
- `src/components/family/FamilyTab.tsx` — always-rendered "How this shows up" block, remove note rendering
- `supabase/functions/family-system-reading/sanitize_test.ts` — new tests

## Out of scope

- No changes to deterministic synastry math, orb thresholds, or aspect detection.
- No DB changes.
- No new astrology — only how existing chart data is narrated when aspects are sparse.

## Open question

For sibling pairs with no tight aspects, should `interactionPattern` use the same older=forA / younger=forB convention as the rest of the system? Default: **yes**, for consistency. Confirm before I implement if you'd prefer something else.

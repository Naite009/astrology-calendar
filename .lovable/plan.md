## Problem

Today, every pair (parent–child and sibling) renders one composite line, one bridge line, one friction line. That collapses two different people into a single abstract tone like "this relationship feels weighty," which is exactly the language ChatGPT flagged. It never says **who feels what** or **what it looks like in behavior**.

This is a narrative-shape fix, not new astrology. No new aspects, no new orbs, no DB changes. The same evidence gate (≤5° real synastry hit, real composite placement) and the existing ASPECT EXPRESSION RANGE rule both stay on.

## What changes

### 1. Every composite becomes a 3-perspective block

For each pair, the AI must return a **composite object** instead of a single string:

```
composite: {
  shared:        "What the pair's composite is doing — tone only, 1 sentence."
  feelsLikeForA: "How [Person A in their role] tends to experience that tone, in observable behavior."
  feelsLikeForB: "How [Person B in their role] tends to experience that tone, in observable behavior."
}
```

Rules baked into the prompt:
- `shared` may name the composite Sun / Moon / Asc + sign + plain tone. No advice.
- `feelsLikeForA` and `feelsLikeForB` MUST describe **what that specific person does or feels** in their role. No symbolic language.
- The two perspectives must be distinct. If they collapse into the same sentence, regenerate.
- Range rule still applies on each line ("can show up as ... but can also ...").
- Forbidden anywhere in the block: "this relationship feels X," "the bond is X," "there is a shared sense of X," "weighty," "intense," "serious vibe," "heavy energy" — unless immediately followed by a who-feels-what translation.

### 2. Same role-aware split on `bridge` and `friction`

Today these are strings. New shape:

```
bridge:   { aspect: "...", forA: "...", forB: "..." } | null
friction: { aspect: "...", forA: "...", forB: "..." } | null
```

- `aspect` keeps the existing evidence gate: real synastry aspect, ≤5° orb, planet–planet named with the orb. If no qualifying aspect exists, the field is `null` (no invented bridges/frictions).
- `forA` describes what the parent (or sibling A) tends to do or initiate.
- `forB` describes what the child (or sibling B) tends to do or feel in response.
- Range rule required on each side.

### 3. Consistent role labels across the family

To answer "be consistent with parent to 1st born / 2nd born / 3rd born":

- Parent–child pairs: `forA` = parent behavior (steering, correcting, fixing, pressuring, regulating, withdrawing). `forB` = child behavior at their developmental stage (defending, shutting down, escalating, going quiet, seeking space).
- Sibling pairs: `forA` = older sibling, `forB` = younger sibling, **always**, so the reading reads the same way every time across 1st↔2nd, 1st↔3rd, 2nd↔3rd. Birth order is used only as a stable label, not as a personality assumption — the actual behavior must come from the chart.
- If the chart gives no clear initiator between two siblings, both lines are still written, each describing the same dynamic from that sibling's side. They must not collapse into one sentence.

### 4. Same role-aware split on "What Already Works"

`whatAlreadyWorks` entries become:

```
{ pair: "Lauren ↔ Ben", aspect: "...", forA: "...", forB: "..." }
```

Same evidence gate, same renderer treatment as bridge/friction. Drops the current single-line format that hides who's doing what.

### 5. New hard prompt rule

Added alongside EVIDENCE GATE and ASPECT EXPRESSION RANGE:

```
ROLE-AWARE TRANSLATION RULE — HARD STOP
Every composite, bridge, friction, and what-already-works line MUST be
split into what the specific role experiences. Never describe a pair
tone in the abstract.

Parent–child:
  - Parent line = parental behavior in that moment.
  - Child line  = child behavior at their developmental stage.

Sibling:
  - forA is always the older sibling, forB the younger, for label
    consistency across the family. Behavior itself comes from the chart,
    not from birth-order stereotypes.
  - If the chart gives no clear initiator, write two distinct lines
    describing the same dynamic from each sibling's side.

Forbidden without an immediate who-feels-what translation:
  "this relationship feels X", "the bond is X",
  "there is a shared sense of X", "weighty", "intense", "serious vibe".
```

### 6. Renderer in `FamilyTab.tsx`

Each pair card renders like the corrected Lauren ↔ Ben example:

```text
[Pair name, e.g. Lauren ↔ Ben]

Shared tone
  composite.shared

What [Lauren] tends to feel
  composite.feelsLikeForA

What [Ben] tends to feel
  composite.feelsLikeForB

Where connection can happen
  bridge.aspect
  - For [Lauren]: bridge.forA
  - For [Ben]:    bridge.forB

Where it can feel hard
  friction.aspect
  - For [Lauren]: friction.forA
  - For [Ben]:    friction.forB
```

For siblings, the labels become the two children's names, in older→younger order. Any sub-line that is `null` is hidden. If both `bridge` and `friction` are null, keep the existing honest "no tight aspects in this pair" line.

### 7. Sanitizer + migration so old cached readings don't crash

- `sanitize.ts` `validatePairShape` accepts the new object form for `composite`, `bridge`, `friction`; flags identical `forA`/`forB`; allows missing sides as `null`.
- `familySystemMigration.ts` (client mirror): for cached readings still in the old shape, lift any existing `composite` string into `composite.shared` and leave the two perspective fields empty. Same lift for `bridge` / `friction` strings → `{ aspect: legacyString, forA: null, forB: null }`. Renderer already hides null sub-lines, so legacy readings still display gracefully without inventing perspective text.
- `sanitize_test.ts`: add tests for new shape, legacy migration, and identical-perspective rejection.

## Out of scope

- No changes to deterministic sections (At a Glance, How Each Child Adapts, When Pressure Builds, Responds Best When, Escalation, Household reset).
- No new astrology, no new aspects, no new orbs.
- No DB changes.

## Technical scope

```text
supabase/functions/family-system-reading/index.ts
  - update JSON schema for parentChildConnections, siblingConnections,
    whatAlreadyWorks (composite/bridge/friction become objects)
  - add ROLE-AWARE TRANSLATION RULE block
  - tighten composite section: forbid abstract tone-only lines

supabase/functions/family-system-reading/sanitize.ts
  - validatePairShape accepts new object shape
  - flag identical forA/forB
  - allow missing sides as null

supabase/functions/family-system-reading/sanitize_test.ts
  - tests for new shape, legacy string migration, dup detection

src/lib/familySystemMigration.ts
  - migrate legacy strings into new objects, leaving missing sides null

src/components/family/FamilyTab.tsx
  - render 3-perspective composite block per pair
  - render bridge/friction with per-person sub-lines
  - render whatAlreadyWorks with per-person sub-lines
  - graceful fallback when only `shared` or only `aspect` is present
```

## One open question

For siblings where the chart gives no clear initiator, do you want:
(a) one shared line phrased as "either of you may...", or
(b) two parallel lines, one per sibling, even if they're similar?

Default I'll use unless you say otherwise: **(b)** — always two distinct lines in older→younger order, regenerate if they collapse.
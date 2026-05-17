# The Family Web — Collision-Focused Upgrades (v2)

Adds a new collision layer to `family-system-reading` that moves beyond individual profiles into how members *collide, gridlock, and surrogate for each other*. All math is deterministic; AI is only used for short prose where the rule clearly requires it.

## New sections (added to system reading payload as `payload.familyWeb`)

### 1. Elemental Void + Natural Surrogate
- Tally Sun/Moon/Mercury/Venus/Mars elements across the whole family.
- Identify any element with count = 0 (or ≤1 relative to family size).
- **Surrogate check**: before declaring the void unfilled, scan all members for a placement that "acts" as the missing element:
  - Missing Earth → planet in 10th house, strong Saturn aspect to a luminary, or Capricorn/Virgo/Taurus rising
  - Missing Water → planet in 4th, 8th, or 12th house, or Cancer/Scorpio/Pisces rising/Moon
  - Missing Fire → planet in 1st, 5th, or 9th house, or Aries/Leo/Sagittarius rising/Mars
  - Missing Air → planet in 3rd, 7th, or 11th house, or Gemini/Libra/Aquarius rising/Mercury
- Output: `{ missingElement, surrogate: { name, why } | null, anchorSuggestion }`. When a surrogate exists, frame as "Natural Surrogate" instead of "missing."

### 2. Bridge Members + Shadow Bridge Warning
- For every pair of members who clash by element, find a third member who shares an element with BOTH.
- **Shadow Bridge rule**: if the bridge's shared element with the clashing pair is **Fire** (or the bridge has dominant Mars/Aries), the `howToUse` describes physical redirection / activity / movement — never "mediation" or "talking it out".
- Other shared elements:
  - Water bridge → emotional check-in / soft tone
  - Air bridge → naming what's happening / logic
  - Earth bridge → routine / practical task
- Output: `{ clashingPair, bridge, sharedElementWithA, sharedElementWithB, bridgeType: "fire-redirect" | "water-soothe" | "air-translate" | "earth-anchor", howToUse, withdrawalCaveat? }`.

### 3. Triangulation + Modality Gridlock Check
- For each loud-vs-quiet pair, check if a third member amplifies the loud side or triggers the withdrawer harder.
- **Modality pile-up scan**: tally Cardinal / Fixed / Mutable across Sun + Moon + Mars of every member.
  - 3+ Fixed → emit a `GRIDLOCK` warning with intervention "introduce a Mutable choice (offer two options instead of one demand)"
  - 3+ Cardinal → `START-WAR` warning ("everyone wants to lead the moment; assign turns")
  - 3+ Mutable → `DRIFT` warning ("plan keeps changing; one person must hold the frame")
- Output: `{ triangles: Triangulation[], modalityPattern: { dominant, count, label, intervention } | null }`.

### 4. Inherited Signatures (Family Mirrors)
- Scan parent↔child pairs for: same Sun/Moon/Mercury/Venus/Mars sign, same Rising, OR same element on a luminary, OR same modality on a luminary.
- Output: `{ parent, child, mirroredPlacement, sameTeamMessage }` framed as "same team, different volume/method."

### 5. Regulation Dashboard + Saturn Wall Sensitivity
- Per-member row from existing childMechanism + Mercury/Mars sign lookup: `{ name, triggeredBy, stressReaction, circuitBreaker }`.
- **Saturn Wall check**: for each child, compare the child's Saturn sign to every parent's Sun and Moon sign.
  - If a child's Saturn is in the same sign as a parent's Sun or Moon → append `sensitivityNote` to that **parent's** row: "You may feel more sensitive to [Child]'s silence; remember it is their boundary forming, not rejection of you."
- Output: `DashboardRow[]` with optional `sensitivityNotes: { aboutChild, note }[]` on parent rows.

## Files to change

### `src/lib/familySystemSynastry.ts` (new exports, deterministic)
- `computeElementalVoid(members)` → returns void + surrogate detection using house/aspect data
- `findBridgeMembers(members)` → emits `bridgeType` so the UI/text branches on Fire vs others
- `findTriangulations(members)` → returns triangles AND `modalityPattern` (Gridlock / Start-War / Drift)
- `findInheritedSignatures(members, parents, children)`
- `buildRegulationDashboard(members, childMechanisms, parents)` → includes Saturn-to-luminary sensitivity notes

All five compute from existing `members[]` chart data (signs + houses + aspects). No AI calls.

### `supabase/functions/family-system-reading/index.ts`
- Receive the 5 computed blocks from the client OR recompute server-side (recompute is safer — single source of truth).
- Attach as `payload.familyWeb = { elementalVoid, bridges, triangulations, mirrors, dashboard }`.
- No AI repair pass needed; deterministic outputs.

### `src/components/family/FamilyTab.tsx`
- New "The Family Feedback Loop" card containing all 5 sub-blocks.
- Regulation Dashboard rendered with `<Table>` from `@/components/ui/table`; sensitivity notes shown as subtle italic line under the parent row.
- Modality Gridlock callout shown as a small alert above the Triangulation list when present.
- Bump cache key to `system-pipeline-v6-web`.

### `.lovable/memory/features/family-readings/family-web.md` (new)
- Document the 5 sections, deterministic guarantee, the Shadow Bridge rule, the Modality Gridlock thresholds, the Saturn Wall check, and the Surrogate Element rules.

## Out of scope
- No changes to pair readings, parent-alignment, or childMechanism generation.
- No new AI calls — all five sections are fully computable from chart data.
- No PDF export changes in this pass.

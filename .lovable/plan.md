# Family System Reading

## What you'll get

A new flow on the Parent/Child tab that replaces the dropdown-driven pair selector as the primary action:

1. **Checkboxes beside each family member** in the "My Family" list.
2. **"Generate Family Reading" button directly under the list** with a count of selected members ("3 selected").
3. **One integrated reading** showing how the whole selected group functions as a unit, not a series of one-on-one pairings.
4. The existing pair reading (one-to-one) stays available below as a secondary option for when you want to zoom into a single relationship.

## How the integrated reading is structured

The combined reading needs to do something a pair reading cannot: show emergent family-system patterns. Here is the proposed structure of the output card stack:

1. **Family Essence** — 3 sentences naming the overall character of this group (e.g., "An emotionally heavy household with two fire-Moon kids and a water-Moon parent…")
2. **Roles in the System** — for each selected member, one line on the role they play in the group dynamic (the regulator, the spark, the peacemaker, the truth-teller, etc.)
3. **The Emotional Climate** — what it actually feels like to live in this household day-to-day, derived from a Moon-cluster analysis (count of fire/earth/air/water Moons, dominant element).
4. **Where Everyone Meets** — shared aspects, repeated signs, and stelliums across multiple charts (e.g., "Three of you have Mars in fire signs — conflict in this house is fast and loud.")
5. **Pressure Points** — the 2–3 cross-aspects most likely to create friction in the group, named by who is doing what to whom.
6. **Bridges** — the 2–3 cross-aspects most likely to provide ease and repair in the group.
7. **One Practice for the Whole Family** — a single concrete action the group can do together for the next 90 days.

Pair-level cards (Soul Contract, Moon Bridge, Where Your Contracts Meet) remain on the one-to-one pair reading. The integrated reading focuses on group-level patterns.

## UI changes

- Each row in "My Family" gets a checkbox on the left.
- "Select all" / "Clear" links above the list.
- New action bar under the list: `[Generate Family Reading]  3 of 4 selected` — disabled until 2+ are checked.
- A new results panel renders below "My Family" when the reading is ready, with the 7 cards above.
- The existing "Pair Reading" card below is renamed to **"Zoom in: One-on-One Reading"** so it is clearly the optional deep-dive, not the main flow.

## Technical plan

A short technical section for context — feel free to skip.

```text
src/lib/familySystemSynastry.ts   (new)
  - buildFamilySystem(members[], charts[])
      → returns deterministic system data:
        - moonElementBreakdown
        - sharedSigns / repeated placements
        - all pairwise cross-aspects (parent↔child, sibling↔sibling, parent↔parent)
        - top friction aspects (squares/oppositions, tightest orbs)
        - top bridge aspects (trines/sextiles/conjunctions, tightest orbs)
        - role assignments per member (rule-based: heaviest Saturn = anchor,
          tightest Moon-Sun = regulator, most personal planets in fire = spark, etc.)

supabase/functions/family-system-reading/index.ts   (new edge function)
  - takes the deterministic system data
  - returns the 7-card narrative payload
  - same voice rules as family-pair-reading: plain English, no jargon, no em dashes,
    behavioral language only

src/components/family/FamilyTab.tsx   (edit)
  - add `selectedIds: Set<string>` state
  - add checkbox column + select all/clear
  - add Generate Family Reading button + loading state
  - render new <FamilySystemReadingView /> when result arrives
  - rename pair section heading and move it below
```

No changes to existing pair-reading code, edge function, or aspect interpretation library. The new system reading is additive.

## What I need from you before building

1. **Confirm the 7-section structure above** or tell me what to add, drop, or rename.
2. **Role labels** — okay with my list (anchor, spark, peacemaker, regulator, truth-teller, mirror, wildcard) or want different ones?
3. **Selection minimum** — 2+ members (any combo), or require at least one parent + one child?
4. **Should the existing pair reading stay**, or do you want it removed entirely once the family reading exists?

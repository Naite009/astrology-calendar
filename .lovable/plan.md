# Advanced Family Synastry — 4 New Deterministic Layers

All four layers compute from existing `members[]` chart data. No AI calls. They render as new sub-sections inside the existing **"The Family Feedback Loop"** card in `FamilyTab.tsx`, under the current Elemental Void / Bridges / Triangulation / Mirrors / Dashboard blocks. Cache key bumps to `system-pipeline-v7-advanced`.

---

## 1. Karmic Custodian — 12th-House Mirror

**Logic** (per parent↔child pair):
- For each child planet in `[Sun, Moon, Mercury, Venus, Mars]`, compute which house it falls in inside the **parent's** chart (using `houseOfPlanet` against parent's `houseCusps`).
- If it lands in the parent's **12th house**, emit a mirror entry: `{ parent, child, childPlanet, parentHouse: 12 }`.
- Skip if parent has unreliable birth time (`chart.birthTimeUnknown`).

**Output text** (deterministic, planet-specific):
- Moon → "When you're carrying unspoken stress, {child} gets restless or clingy. They feel it before you name it."
- Sun → "{child} reflects the part of yourself you keep private. Be honest about what you want, so they don't carry the unspoken version."
- Mercury → "{child} voices thoughts you haven't said out loud. If they ask blunt questions, it's your own held-back words coming through them."
- Venus → "{child} picks up on relationship tension you're avoiding. Acknowledge it directly so they don't have to mirror it."
- Mars → "{child} acts out anger you're sitting on. Name your own frustration first; their reactivity will drop."

---

## 2. Midpoint Hotspots — with explicit table

**Logic** (per parent-pair, then check every other member):
- For each pair of parents `(P1, P2)`, compute the midpoint of every parent-planet combo across `[Sun, Moon, Mercury, Venus, Mars, Ascendant, MC]`. Midpoint of two ecliptic longitudes = `((λ1 + λ2)/2) mod 360`, plus the **opposite midpoint** `(midpoint + 180) mod 360`. Both are valid.
- For every other member (children + 3rd parent), check if any of their `[Sun, Moon, Mercury, Venus, Mars, Ascendant]` is within **1.5° orb** of either midpoint axis.
- Emit a hotspot: `{ parentA, parentB, parentPlanetA, parentPlanetB, midpointSign, midpointDegree, activator, activatorPlanet, orb }`.

**Rendered as a table** (the user explicitly asked for this):

| Parents | Parents' planets | Midpoint | Activated by | Their planet | Orb |
|---|---|---|---|---|---|
| Alex + Sam | Sun / Mars | 15°22' Taurus | Ben | Moon | 0.4° |
| Alex + Sam | Venus / Saturn | 03°10' Libra | Ike | Sun | 1.1° |

Below the table, a short deterministic interpretation line per row keyed off the parent-planet pair:
- Sun/Mars midpoint → "This child activates your shared drive. They feel most secure when you two are moving toward a goal together."
- Sun/Moon → "This child sits on your relationship's emotional center. Your mood as a couple sets theirs."
- Mars/Saturn → "This child triggers your shared frustration/discipline knot. Tighten the rules together or they'll exploit the gap."
- Venus/Mars → "This child activates the spark between you two. They thrive when you two are affectionate in front of them."
- Sun/Saturn → "This child carries your shared sense of duty. Don't over-task them."
- (fallback) "This child sits on the midpoint of your {planetA}/{planetB} energy. When you two are aligned around that theme, they amplify it."

**Constraints**:
- Only emit if there are ≥2 parents in the family.
- Cap at top **8 hotspots** sorted by tightest orb to keep the table readable.
- Hide whole section if no hotspots found.

---

## 3. T-Square Completion — "Missing Leg"

**Logic** (per parent, per child):
- Scan the parent's natal aspects for **applying squares** (90° ± 6°) between any two of `[Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn]`. Each square `(P1 sq P2)` defines a **missing apex** at the two points 90° from both (the two signs that would complete a T-square).
- For each child, check if any of their `[Sun, Moon, Mars, Ascendant]` falls within **3° orb** of either missing apex.
- Emit: `{ parent, parentSquare: [P1, P2], child, childPlanet, apexSign, apexDegree, orb }`.

**Output text**:
"{child}'s {childPlanet} at {apexSign} completes your {P1}–{P2} square. They don't just push your buttons — their existence is the catalyst that forces the growth this square has been demanding from you."

**Constraints**: max 1 completion per parent-child pair (tightest orb wins); hide section if empty.

---

## 4. Generational Outer-Planet Gap

**Logic** (per parent↔child pair):
- Compare signs of `Uranus`, `Neptune`, `Pluto` between parent and child.
- If different signs, emit `{ parent, child, planet, parentSign, childSign }`.

**Output text** uses a small lookup table for Pluto, Neptune, Uranus by sign (deterministic, ~30 hard-coded combinations for the realistic generational pairs — e.g. Pluto Virgo↔Scorpio, Scorpio↔Sagittarius, Sagittarius↔Capricorn, Capricorn↔Aquarius). Each entry gives a single "what feels invasive vs what they're built for" line.

Example: Pluto Scorpio (parent) ↔ Pluto Sagittarius (child) → "You value depth and privacy; {child}'s generation values bluntness and freedom. Their oversharing isn't disrespect — it's their generation's mission to refuse secrecy."

If no lookup entry exists for the specific sign pair, fall back to: "{planet} {parentSign} (you) vs {planet} {childSign} ({child}) — different generational values. The friction is generational, not personal."

---

## Files to change

### `src/lib/familySystemSynastry.ts`
Add deterministic exports:
- `findTwelfthHouseMirrors(members)` → `TwelfthHouseMirror[]`
- `findMidpointHotspots(members)` → `MidpointHotspot[]` (includes ecliptic-longitude helper)
- `findTSquareCompletions(members)` → `TSquareCompletion[]`
- `findGenerationalGaps(members)` → `GenerationalGap[]`
- Extend `FamilyWeb` interface + `buildFamilyWeb()` to include the 4 new arrays.

### `src/components/family/FamilyTab.tsx`
Inside the existing "The Family Feedback Loop" card, append 4 new sub-blocks after the Regulation Dashboard:
1. **12th-House Mirrors** — list grouped by parent.
2. **Midpoint Hotspots** — uses `<Table>` from `@/components/ui/table` (header row + one row per hotspot + interpretation line as sub-row or expandable).
3. **T-Square Completions** — list grouped by parent-child pair.
4. **Generational Gap** — list grouped by parent-child pair.

Card visibility condition expands to also show if any of the new arrays has content. Bump `systemCacheKey` to `system-pipeline-v7-advanced`.

### `.lovable/memory/features/family-readings/family-web.md`
Append sections 6–9 documenting the four new layers, their orbs, fallback rules, and the midpoint table format.

## Out of scope
- No new AI calls.
- No changes to pair readings, parent-alignment, childMechanism, or PDF export.
- No edge function changes (all four blocks are client-side; the existing `family-system-reading` function does not need to receive or echo them).

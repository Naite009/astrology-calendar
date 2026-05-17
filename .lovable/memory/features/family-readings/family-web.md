---
name: Family Web (collision layer)
description: Deterministic Family Feedback Loop with elemental void+surrogate, shadow bridges, modality gridlock, family mirrors, regulation dashboard with Saturn-wall sensitivity
type: feature
---

# The Family Web

Five deterministic, no-AI sections appended below the existing system reading sections. Computed in `src/lib/familySystemSynastry.ts` (`buildFamilyWeb`) and rendered in `FamilyTab.tsx` as the "The Family Feedback Loop" card. Cache key: `system-pipeline-v6-web`.

## 1. Elemental Void + Natural Surrogate
- Tally Sun/Moon/Mercury/Venus/Mars elements. Void if any element count == 0, OR ≤1 with family size ≥3.
- **Surrogate** check before declaring missing: Rising in element, planet in natural houses of element (Earth→2/6/10, Water→4/8/12, Fire→1/5/9, Air→3/7/11), or strong Saturn (Capricorn/Aquarius) for missing earth.
- When surrogate exists, frame as "Natural Surrogate" — element is technically missing but a member carries the function.

## 2. Bridge Members + Shadow Bridge
- For each clashing dominant-element pair (fire↔water, air↔earth), find a third member sharing both elements.
- **bridgeType** drives `howToUse`:
  - `fire-redirect` (bridge dominant fire OR Mars in fire/Aries): physical redirection — walk, move, cook. **Never** mediate verbally; the bridge would fan the fire.
  - `water-soothe`: soft tone, slower pace, name feelings.
  - `air-translate`: name what's happening in plain words.
  - `earth-anchor`: practical task, chore, food, routine.
- Fire bridges always include a `withdrawalCaveat` warning to keep the bridge active not seated.

## 3. Triangulation + Modality Pile-up
- Triangles: loud member (fire/air) + quiet member (water/earth) + amplifier (another loud). Intervention: remove the amplifier first.
- Modality pile-up tallies Sun+Moon+Mars+Rising across the family. Dominant modality with count ≥ max(3, ceil(total*0.5)) triggers:
  - **Fixed → GRIDLOCK**: introduce a Mutable choice (two options instead of one demand).
  - **Cardinal → START-WAR**: assign turns out loud.
  - **Mutable → DRIFT**: one person must hold the frame.

## 4. Inherited Signatures (Family Mirrors)
- For each parent↔child pair, check exact-sign match across Sun, Moon, Mercury, Venus, Mars, Rising. Falls back to element match on luminary.
- Frame: "Same team, different volume" — friction is method, not values.

## 5. Regulation Dashboard + Saturn Wall
- Per-member row from Mercury sign (triggeredBy) and Mars sign (stressReaction + circuitBreaker).
- **Saturn Wall**: if a child's Saturn sign == a parent's Sun or Moon sign, append a `sensitivityNote` to that parent's row: their silence will feel personal, but it is the child's boundary forming.

## Constraints
- No AI calls. All five sections compute from existing `members[]` chart data (signs + houses + Saturn).
- Houses derived from `chart.houseCusps` only — never invented.
- Section renders only if at least one sub-block has content; otherwise the card is hidden.

## 6. Karmic Custodian (12th-House Mirrors)
- For each child planet in [Sun, Moon, Mercury, Venus, Mars], compute which house it falls in inside the **parent's** chart via `houseOfPlanet` against parent's `houseCusps`.
- If house == 12, emit a mirror with a planet-specific deterministic line (Moon = restlessness/sensing stress, Sun = unspoken self, Mercury = unsaid words, Venus = avoided relationship tension, Mars = held anger).

## 7. Midpoint Hotspots (with table)
- Requires ≥2 parents. For each parent pair, compute short-arc midpoint and its opposition between every pair of [Sun, Moon, Mercury, Venus, Mars, Ascendant].
- Any other family member whose [Sun, Moon, Mercury, Venus, Mars, Ascendant] falls within **1.5°** of either axis = a hotspot.
- Rendered as a table: Parents | Parents' planets | Midpoint (sign+deg+min) | Activated by | Their planet | Orb. Deterministic interpretation row below.
- Dedupe by (parents, planet-pair, activator, activatorPlanet); cap at top 8 by tightest orb.

## 8. T-Square Completion (Missing Leg)
- Scan each parent's natal chart for squares (90° ± 6°) between any two of [Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn].
- Each square defines two apex points (90° from both, on the perpendicular axis).
- For each child, if any of [Sun, Moon, Mars, Ascendant] is within **3°** of either apex, emit ONE completion per parent-child pair (tightest orb wins).

## 9. Generational Outer-Planet Gap
- For each parent↔child pair, compare Uranus/Neptune/Pluto signs. Different sign = generational gap.
- Hard-coded lookup table covers ~17 realistic living combos (Pluto Virgo↔Libra, Scorpio↔Sagittarius, Capricorn↔Aquarius, etc.). Missing combos fall back to a neutral "friction is generational, not personal" line.

## Cache key
Bumped to `system-pipeline-v7-advanced` to force regeneration with the four new layers.

---
name: Chart Validator Guardrails
description: Mandatory chart-data validation that surfaces boundary planets, axis breaks, and missing/typo'd house cusps before any narrative is generated
type: feature
---
Every reading that depends on house placements MUST run `validateChart()` from `src/lib/chartValidator.ts` against the source chart and display the resulting `issues[]` as a visible amber/red banner in the UI.

Checks performed:
1. All 12 cusps present and parseable
2. Opposite cusps exactly 180° apart (axial symmetry). Off by >0.5° = ERROR.
3. Cusp span monotonic and within 1–90°
4. **Boundary planets**: any core planet within 1° of any cusp triggers a "verify the cusp" warning. This is the check that catches single-degree typos in entered cusp data (e.g. Aries 12°21' entered instead of Aries 22°21' flipping Sun from 5th to 6th house).

Rule: the engine NEVER silently guesses. If validation flags a boundary planet on a house the narrative depends on (Chart Ruler, 3rd-house Ruler, Sun/Mars/Moon house), the UI shows the warning above the reading so the user can verify against the source wheel before trusting the text.

Wired into: `src/components/family/ChildPortrait.tsx`. Extend to any other house-dependent narrative surface as it's built.

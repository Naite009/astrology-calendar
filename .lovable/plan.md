

## Plan: Reframe Astrocartography as Travel Guidance + Add Rich Line Breakdown

### What's Actually Happening Now

The calculation engine is already correct — it takes the SR chart planets as-is (not re-casting) and computes where each planet hits ASC/MC/DSC/IC at every city. The problem is twofold:

1. **Wrong framing**: The UI says "Where to Celebrate" (implying birthday relocation). It should say this is about where to **travel this year**.
2. **No transparency**: When a city is green, you can't see *why* — which planetary lines it's near, at what orb, and how those combine to produce the score.

### Changes

**File 1: `src/components/solarReturn/AstrocartographyMap.tsx`**

- Change header from "Astrocartography — Where to Celebrate" to "Astrocartography — Where to Travel This Year"
- Update the bottom-of-map helper text to reflect travel framing

- **Expand the `CityDetailCard`** with a new "Planetary Lines" section that shows:
  - Each angular planet with its glyph, the angle it's on (ASC/MC/DSC/IC), the exact orb in degrees
  - A color-coded benefic/malefic/neutral indicator per line
  - A "Score Breakdown" mini-table: for each angular planet, show `Planet × Angle = base score`, orb multiplier, and final contribution — so the user can see exactly why Jupiter on MC at 2° produces a green rating while Saturn on DSC at 1° drags it red
  - A "Lines Near This City" summary sentence like: "This city sits on the ♃ Jupiter MC line (2.1°) and near the ☉ Sun ASC line (5.8°)"
  - The existing deep interpretation (vibe, bestFor, watchFor, dayToDay) stays as-is beneath each line

- Add planet symbol mapping (♃ ♀ ☉ ♂ ♄ etc.) to the detail card for visual richness

**File 2: `src/lib/solarReturnAstrocartography.ts`**

- Update the `interpretation` string at the bottom to use travel language instead of birthday language
- No changes to scoring logic, weights, city list, or file name

### Technical Details

- Planet glyphs map: `{ Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇' }`
- Score breakdown per angular planet: `baseScore = PLANET_ANGLE_RATING[planet][angle]`, `orbMult = 1 - (orb² / 96)`, `contribution = baseScore × max(orbMult, 0.4)`
- The CityDetailCard already receives `angularPlanets` with planet, angle, and orb — all data needed is already available, just needs richer display

### What Does NOT Change
- `solarReturnAstrocartography.ts` scoring logic, weights, orb formulas
- City list, file names, intention tabs, WORLD_CITIES array
- Map SVG rendering, dot colors, projection functions


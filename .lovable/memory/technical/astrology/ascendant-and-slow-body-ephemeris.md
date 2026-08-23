---
name: Ascendant formula and slow-body ephemeris
description: Ascendant/Placidus/Vertex formulas were 180 degrees off and asteroid tables were extrapolated; both fixed with real JPL data
type: feature
---

Two calculation bugs were found and fixed by verifying an imported chart (Aug 13 1995, 08:08, NJ) against independent recomputation:

1. Ascendant was returning the Descendant. `calculateAscendant` in `src/lib/astrology.ts` and the ASC helper in `src/lib/placidusHouses.ts` added a bogus 180 degree "quadrant adjustment". Correct form, no adjustment beyond normalization:
   `asc = atan2(cos(RAMC), -(sin(e)*tan(lat) + cos(e)*sin(RAMC)))`
   The Vertex uses the same form with colatitude, then +180 (the raw result is the Antivertex).
2. Chiron, Ceres, Pallas, Juno, Vesta and Eris were extrapolated from a few anchor dates times an orbital period, drifting up to 95 degrees. They now come from real JPL Horizons samples: `src/lib/ephemeris/asteroidLongitudes.ts` (geocentric apparent longitude, every 10 days, 1920-2060, delta encoded base36) read through `src/lib/ephemeris/slowBodies.ts` with Catmull-Rom interpolation. `getAccurateAsteroidPosition` prefers the tables and only falls back to the old extrapolation outside that window.
3. North Node is now the true node, derived from the Moon's instantaneous orbital plane (`trueNodeLongitude`), matching what chart services print. Mean node is the fallback only.

Never reintroduce period-based extrapolation for these bodies, and never add a 180 degree correction to the Ascendant.

# Gina Solar Return and relationship accuracy

## Sources and tolerances
- Source of truth: astronomy-engine 2.1.19, apparent geocentric tropical positions of date; JPL Horizons interpolated tables for Chiron; osculating true Node; existing apparent-sidereal-time/true-obliquity Placidus implementation.
- Solar Return is bracketed against `computeBody('Sun')` and bisected to 1 ms, accepting residual <= 0.000001 degrees. Exact transit roots use the same angular residual, with duplicate endpoint suppression. Numerical solver precision is not independent astronomical accuracy.
- Astro.com reference acceptance: 30 seconds for return time, 0.02 degrees for planets/Node/Chiron, 0.1 degrees for ASC/MC/DSC using assumed town coordinates (41.122, -75.364).
- Natal aspects use canonical `classifyAspect` and `getEffectiveOrb`; relationship current-contact allowlist uses 3 degrees for major contacts, 1 degree for quincunxes; future scan uses 3 degrees conjunction/square/opposition and 2.5 degrees trine/sextile. Gate orb-quotation tolerance is 0.02 degrees.

## Numerical results
Using supplied natal target 226.52833333333334 degrees:
- Computed return 2026-11-08T22:24:21.909Z, 15.909 seconds after reference.
- Solar residual 0.00000000306 degrees.
- Maximum body difference 0.496 arcminutes (Mercury); all supplied body and motion tests pass.
- ASC 29 degrees 38 minutes 47 seconds Taurus (5.79 arcminutes from supplied ASC).
- MC 6 degrees 27 minutes 40 seconds Aquarius (4.67 arcminutes from supplied MC).
- DSC is opposite ASC. These angle checks pass the 6-arcminute town-coordinate tolerance, not a second-level certification. The exact coordinates printed by Astro.com were not supplied.

Actual signed-in saved Gina chart contained Sun 16 degrees 31 minutes Scorpio, seconds zero and no underlying longitude. It previously produced 22:07:38 UT. Recomputing its Sun from normalized 1985-11-09T00:01:00Z now produces 22:24:26.749 UT. No saved natal data was overwritten and no test return was saved.

## Verified regressions
629 tests passed across 35 files, including 43 new Gina/gate regressions. Automatic build/type checks report build OK. Desktop and 390px phone preview verified automatic planetary calculation without location, then houses with explicit coordinates, without horizontal overflow.
- Moon 26 degrees 29 minutes Virgo square DSC 26 degrees 39 minutes Sagittarius: 10 arcminute orb retained.
- Seventh ruler chain: Sagittarius -> Jupiter Aquarius -> Saturn Scorpio -> Mars Libra -> Venus Libra, self-dispositor.
- Jupiter trine DSC survives relationship-relevance selection.
- Saturn opposition Mars December 2026 approach has no exactDates and is labelled close-approach in scan context.

## Changes
- Solar Return solver and natal storage preserve full precision; minute-only natal imports recover Sun precision from verified birth time.
- Explicit physical return coordinates alone enable Placidus angles/houses; no birthplace fallback. Unknown/ambiguous entered places block location assignment; blank location allows planets only. Polar fallback is not labelled Placidus.
- Stored calculation target/residual/provenance and export wheel numbers preserve machine precision.
- Future scanner no longer converts sampled station minima into exact dates. Root motion and actual pass counts replace guessed labels.
- Deterministic traditional ruler chains and relationship target ranking feed Ask; finding-partner routing is explicit.
- Versioned structured placements, aspect pools, current contacts and future exact dates are sent to Ask. Fail-only explicit-claim gate runs in deployed Ask/SR functions and client before display; Solar Return streaming is withheld until complete validation. Unknown evidence, obvious false placements/aspects/orbs/exact dates and invented behavioral-history phrases are rejected.
- Source model unchanged; corrected misleading SR response model header.

## Limitations, not certified
The fail-only validator checks supported explicit claim grammar and evidence IDs, not every possible English paraphrase or implicit behavioral conclusion. Legacy Ask correction passes still exist. Future solver scans Jupiter through Pluto; transiting Nodes/eclipses and all fast-planet future relationship contacts are not comprehensively scanned. Missing SR is explicitly unavailable, not automatically fabricated inside Ask. SR automatic calculation is available in Solar Return -> Add SR Chart -> Auto-Calculate SR; it does not create yearly saved charts without user action. No newly generated live Gina AI reading was exercised, and the exact Astro.com location coordinates remain missing. The additional Swiss Ephemeris installation check was unsuccessful; independent reference comparison is against the supplied Astro.com values only.

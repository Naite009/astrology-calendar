# Roadmap

## Done: birth-chart time/place/ephemeris repair (verified 2026-09)
- [x] Shared zone math (Intl based, exact historical offsets, ambiguous/nonexistent detection)
- [x] Birthplace resolution (precise coordinates + IANA zone, confidence levels, cache)
- [x] Single normalized birth moment API used by every calculator
- [x] Single ephemeris engine (apparent geocentric, true ecliptic of date, Placidus, true node, mean Lilith)
- [x] Fix Vertex formula and Part of Fortune sect test
- [x] Asteroids: JPL table 1920-01-01..2059-12-27, no extrapolation, endpoint interpolation fixed
- [x] Verification panel: audit trail, disambiguation, no auto-overwrite, angles gated on precise coordinates
- [x] Chart Library: remove -5 default; paste import records Mean/True Node and warns on true Lilith
- [x] Migrate progressions, solar arcs, Davison, sidereal, astrocartography, Human Design, forms
- [x] Human Design: Sun frame fix (v2) and Rave wheel start fix (v3, Gate 41 at 2° Aquarius); stored engine charts recomputed on load
- [x] Regression tests (129 passing) incl. DST, fractional zones, date line, circular compare, wheel anchors

## Ready
- West Hills Ascendant: app 7°45' Scorpio vs imported 7°09' (35'); Moon agrees to 0.7'. Swiss Ephemeris reproduces the app. Confirm the source chart's coordinates/time before trusting either.
- Background upgrade of stored natal charts lacking place metadata (geocode once, persist, never touch positions)
- Osculating (true) Lilith as a labeled optional variant
- Human Design: cross-check one published chart end to end (type, authority, profile, cross) once a trusted reference with exact birth data is available
- Mean node as a selectable natal setting in the Chart Library form (currently set only by paste import)

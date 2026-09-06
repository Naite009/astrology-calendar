# Roadmap

## In progress: birth-chart time/place/ephemeris repair
- [ ] Shared zone math (Intl based, exact historical offsets, ambiguous/nonexistent detection)
- [ ] Birthplace resolution (precise coordinates + IANA zone, confidence levels, cache)
- [ ] Single normalized birth moment API used by every calculator
- [ ] Single ephemeris engine (apparent geocentric, true ecliptic of date, Placidus, true node, mean Lilith)
- [ ] Fix Vertex formula (Asc(RAMC+180, colatitude)) and Part of Fortune sect test
- [ ] Asteroids: fail transparently outside 1920-2060, no extrapolation
- [ ] Verification panel: audit trail, disambiguation, no auto-overwrite, angles gated on precise coordinates
- [ ] Chart Library: remove -5 default, resolve and persist place metadata, calculate from the shared engine
- [ ] Migrate progressions, sidereal, astrocartography, Human Design, user form, HD form
- [ ] Regression tests (West Hills, DST winter/summer, fall-back, spring-forward, non-DST, +05:30, +05:45, date line, southern DST, circular compare, shared instant)
- [ ] Update accuracy suite to the shared path; run all tests + typecheck

## Ready
- Background upgrade of stored charts lacking place metadata (geocode once, persist, never touch positions)
- Osculating (true) Lilith as a labeled optional variant

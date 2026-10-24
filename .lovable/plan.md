# Solar Return and relationship calculation repair

- Preserve full-precision longitudes through calculation, storage, and shared angle/house helpers.
- Solve Solar Returns against the same apparent Sun calculation used for positions. Calculate planets without a return location, withholding houses and angles; never substitute the birthplace.
- Add Gina's supplied Astro.com reference as an independent regression, with explicit tolerances and reported numerical differences.
- Supply deterministic traditional ruler chains and relevance-ranked relationship contacts, including exact solver passes and labelled near misses, to Ask.
- Validate cited calculation facts before displaying readings; stop missing Solar Return sections rather than manufacturing replacements.
- Run regression tests and verify automatic generation in the preview. Report remaining limitations explicitly.

## Technical details
Use the existing astronomy-engine/JPL-backed ephemeris engine, canonical aspect classification and Placidus house code. Root residual tolerance is 0.000001 degrees. Reference comparison tolerances are separate from solver precision. Existing imported charts and user data are preserved.
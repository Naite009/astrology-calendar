---
name: Minimal chart entry with auto-fill
description: Users only enter 10 planets + Asc + cusps + North Node + Chiron; all other bodies are derived deterministically
type: feature
---

Chart import only requires: 10 core planets, Ascendant, house cusps, North Node, Chiron.

`src/lib/chartAutoFill.ts` (`autoFillChartBodies`) derives the rest from birth date/time/place on load and on save (wired into `useNatalChart`): South Node (exact opposition), Lilith, Ceres, Pallas, Juno, Vesta, Eris, Vertex, Part of Fortune, and house cusps when missing.

Rules:
- Manually typed values always win. Never overwrite them.
- Placidus cusps are only used when they agree with a typed Ascendant within 2 degrees; otherwise equal houses from the typed Ascendant are used.
- Derived names are recorded in `chart.derivedBodies` (`houseCusps(equal)` marks equal-house fallback).
- All new report features must read bodies defensively, but can assume the derivable set is present for any chart with a birth date.

---
name: Vedic Classical Technique Depth
description: The classical Jyotish engines the Vedic tab must keep (drishti, condition index, yogas, arudha, panchanga, gochara, 16 vargas) and how each must be presented
type: feature
---

The Vedic tab is not allowed to be a template concatenator. It carries real classical technique, computed deterministically, with the evidence always visible.

Engines (all in `src/lib/vedic/`):
- `drishti.ts` graha glances by whole sign, special glances for Mars/Jupiter/Saturn, node convention labeled as a convention, mutual glances, parivartana.
- `strength.ts` CONDITION INDEX 0-100 from sign dignity, baladi avastha, varga bala, dig bala, drik, combustion, graha yuddha, cheshta. NEVER call it Shadbala; always display its components next to the number.
- `yogas.ts` Panchamahapurusha, Raja, Dhana, Gaja Kesari, Chandra Mangala, Budhaditya, Amala, Kemadruma with its cancellation, Saturn-Moon, vargottama, Venus-Jupiter. Every yoga must list the exact placements that triggered it and a behavioral meaning, never an event prediction.
- `arudha.ts` Jaimini image points AL, A2, A7, A10, UL. Framed as image versus reality, never as fact.
- `panchanga.ts` tithi, vara, nakshatra, nitya yoga, karana. Read as the birth day quality before any planet.
- `nakshatraDetail.ts` deity, gana, yoni, tara bala, pada note.
- `gochara.ts` transits by SIGN counted from the natal Moon and by whole-sign house, slow grahas plus the current dasha lord only, Moon as flavour only. Sade Sati described as a pressure and maturing period, never as disaster.
- `divisionalCharts.ts` full shodashavarga (16 charts). D27/D30/D40/D45/D60 must warn when the birth time is not exact.

Presentation rules:
- Live sky positions come from `buildLiveSkyChart`, which stores sign + degree, NOT a `longitude` field. Always rebuild the longitude before subtracting the ayanamsa.
- The node key in chart data is `NorthNode`; Ketu is derived as Rahu + 180.
- Conviction scales with evidence: multi-factor confirmation may be stated directly, single-factor stays hedged.
- Guardrails unchanged: never predict death, disease, divorce, accidents or financial ruin.

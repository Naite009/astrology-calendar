---
name: Vedic (Jyotish) Tab Standards
description: Sidereal engine rules, section list, and voice standards for the Vedic Astrology tab
type: feature
---

Tab: `🪔 VEDIC` in the top nav, view mode `vedic`, rendered by `src/components/vedic/VedicView.tsx`.

Engine (all deterministic, no AI math):
- Lahiri ayanamsa (`src/lib/vedic/ayanamsa.ts`) subtracted from tropical longitudes.
- Whole-sign houses from the sidereal lagna. Never Placidus in this tab.
- 9 grahas only: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rahu, Ketu. Ketu is always Rahu + 180.
- Vedic dignity table only (`vedicDignity.ts`). Western dignity rules do not apply here.
- Vimshottari dasha seeded from the sidereal Moon's nakshatra fraction, 120 years, with antardashas.
- Vargas built: D2 (wealth), D7 (children), D9 (purpose/marriage durability), D10 (career), D12 (past life/lineage).
- Chara karakas by highest degree within sign, Rahu counted in reverse.

Sections, in order: Vedic Snapshot, Life Timeline (dasha), Why You Came In (Ketu/D12), Purpose Gifts and Talents (Atmakaraka/D9), Money and Wealth (D2), Career and Work (D10), Partner and Marriage (Darakaraka/D9), Obstacles, Vedic and Western Side by Side.

Voice: each section = a "What the chart is showing" logic box (Sanskrit terms kept visible) plus one integrated felt-sense paragraph. No em dashes. Predictions are conditional, never fated. Grammar must agree with list length (one body "stays put", several "stay put").

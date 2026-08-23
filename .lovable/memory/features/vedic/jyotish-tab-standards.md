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

Revision standards (do not regress):
- Dasha engine: first mahadasha is the birth balance of the Moon-nakshatra lord (starts at birth, partial years), antardashas clipped at birth, chain continues from there. Exact dates, never year-only.
- Dignity: Own Sign and Exalted are separate conditions. Saturn in Aquarius is Own Sign, never "exalted".
- D12 = parents, ancestry, inherited family patterns. Vargas are magnifying lenses on one life, never separate personalities. D9 is not a "soul chart".
- Every Sanskrit or technical term must carry its plain translation inline via `glossary.ts` + `VedicTerm`.
- Interpretive hedging is mandatory (`hedge.ts`): "may", "tends to", "often". No guarantees. Hard guardrail: never predict death, disease, divorce, accidents, financial ruin.
- No single placement is a conclusion. Themes come from `themeSynthesis.ts` and require at least two independent pieces of Vedic evidence, with a "Why?" evidence trail and a separate Western evidence list. Western disagreement is framed as a different lens, never as contradiction.
- Tab order: One Minute summary, Western vs Vedic note, Vedic Big Three (lagna/Moon/Sun as three jobs), Repeating Themes, then sections, dasha timeline, remaining sections, vargas, guardrail footer.

# Vedic Astrology Tab (Jyotish)

A new top-level tab that adds the full Vedic layer your app is missing today: sidereal chart, nakshatras, dashas, and the divisional charts people post about (past life, marriage, career, wealth). Nothing currently in the project computes any of this, so this is a new engine plus a new view.

## What you get, in the order it appears in the tab

Person picker at the top (same searchable dropdown standard as everywhere else, you pinned on top with the amber star), then:

1. **Your Vedic Snapshot**
   Sidereal Sun, Moon, Rising and each planet, with the plain-language line on why the signs look "one back" from your Western chart. Moon nakshatra and pada named up front, because that is the single most-quoted piece of a Vedic chart.

2. **Your Life Timeline (Vimshottari Dasha)**
   Which planetary period you are living in now, when it started, when it ends, and the sub-period inside it. Shown as a scrollable timeline with the current window highlighted, plus a short felt-sense read of what this chapter tends to ask of you and what it tends to give.

3. **Why You Came In (D12 and Ketu)**
   The past-life and unfinished-business layer: Ketu placement, its house and nakshatra, and the D12 (Dwadashamsha) chart. Written as what you already over-rely on versus what you are here to learn.

4. **Purpose, Gifts and Talents (Atmakaraka and D9)**
   Your Atmakaraka (the "soul planet", the highest-degree planet) plus the D9 Navamsa placement of it. This is the standard Vedic answer to purpose and innate ability, and it also grades whether a placement gets stronger or weaker under pressure.

5. **Money and Wealth (D2, Dhana houses)**
   2nd, 11th and 9th house rulers, their condition, the D2 Hora chart. Framed as how money tends to arrive for you and what reliably drains it, with the obstacle pattern named.

6. **Career and Work (D10)**
   The D10 Dashamsha chart, 10th house ruler, Amatyakaraka (career indicator). What kind of work environment fits, what you keep getting pulled toward, and the mismatch that burns you out.

7. **Partner and Marriage (D9, 7th house, Darakaraka)**
   Your Darakaraka (partner significator), 7th house ruler and its nakshatra, plus the D9 read. What the person tends to be like in behavior (not adjectives alone), where and how meetings tend to happen for your indicators, and the dasha windows when partnership themes activate.

8. **Obstacles and How You Move Them**
   Saturn, Rahu, and any afflicted lagna ruler, read as the recurring block plus the specific counter-move. No "curse" language, no remedies you have to buy.

9. **Vedic vs Western: What Changed and What Didn't**
   A short side-by-side so it never feels like two apps arguing. Which of your placements shift signs, which hold, and what that actually means for reading yourself.

Every section gets the two-part structure you approved earlier: a small **What the chart is showing** box with the technical proof (Sanskrit terms visible: Rahu, Ketu, Atmakaraka, Darakaraka, Vimshottari, Navamsa), then one integrated human paragraph underneath in your felt-sense voice, so it lands as "yes, that is me". No em dashes, no chitchat openers, no jargon in the paragraph body.

Each section also gets the same **Download PDF / Download JSON** buttons already used on Natal Portrait.

## On predictions: my recommendation

Conditional, not fated. "You will be rich in 2029" is the thing that makes these posts feel like entertainment, and it is also the thing you will catch being wrong. Instead: name the classical verdict plainly and label it as classical ("Traditional texts read this as a strong wealth indicator"), then give the felt-sense translation and the timing window as a window, not a date. You still get the directness and specificity, without the app claiming to know the future. Wealth and marriage sections will follow this exactly unless you tell me otherwise.

## Technical approach

- **Sidereal conversion**: reuse existing `astronomy-engine` tropical longitudes, subtract the Lahiri ayanamsa computed for the birth date. Deterministic, no AI math, consistent with the project rule.
- **New library files** under `src/lib/vedic/`: `ayanamsa.ts`, `siderealChart.ts`, `nakshatras.ts` (27 nakshatras, 4 padas, lords), `vimshottariDasha.ts` (Moon-nakshatra seeded, Maha and Antar periods with real local dates via `formatLocalDateKey`), `divisionalCharts.ts` (D2, D7, D9, D10, D12 from sidereal longitudes), `karakas.ts` (Atmakaraka, Amatyakaraka, Darakaraka by Chara Karaka degree order), `vedicDignity.ts` (Vedic exaltation/debilitation and own-sign, kept separate from the Western dignity tables so nothing bleeds across).
- **Interpretation copy** in `src/lib/vedic/interpretations/` (nakshatra, dasha lord, karaka, divisional-chart libraries) so the readings are deterministic and specific, not AI-improvised. AI is used only for the optional longer synthesis, grounded with a fact-check block like the other prompts.
- **New view** `src/components/vedic/VedicView.tsx` with section components, registered as `viewMode: "vedic"` in `src/components/AstroCalendar.tsx` (nav button plus title entry), following the existing tab pattern.
- **Export**: reuse `src/lib/sectionExport.ts` and `SectionExportButtons.tsx`.
- Vedic houses use whole-sign (lagna sign = 1st house), which is correct for Jyotish and independent of the existing Placidus cusps. Birth-time uncertainty warnings apply, same as elsewhere.

## Build order

1. Sidereal engine, nakshatras, karakas, Vedic dignity, plus the snapshot section.
2. Vimshottari dasha timeline.
3. Divisional charts D9, D10, D12, D2, D7.
4. The seven reading sections with the chart-logic box plus felt-sense paragraph.
5. Vedic vs Western comparison, exports, then a full pass on your chart to check the voice lands.

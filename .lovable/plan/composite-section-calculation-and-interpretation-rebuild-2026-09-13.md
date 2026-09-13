# Composite section: calculation and interpretation rebuild

## What is wrong today

The Composite tab is built on `src/lib/compositeChart.ts`, whose `generateInterpretation()` is four sign lookup tables (Sun/Moon/Venus/Mars) plus a raw count of signs by element, with conclusions like "Deep emotional attunement", "profound intimacy", "Natural alignment of will and emotions" when Sun sign equals Moon sign. There are no composite aspects, no angles beyond a midpointed Ascendant, no houses, no evidence, no signal strength, no age or relationship-context awareness, and adult romance/marriage wording reaches teen pairs. The wheel draws signs and planets only. The printable report omits Composite entirely. A second, near-duplicate midpoint implementation exists in `src/lib/compositeAndDavison.ts`, and it midpoints all twelve house cusps, which is not valid geometry.

## Approach

One canonical composite engine, reusing the shared machinery already in place (aspect orbs, evidence hierarchy, signal strength, "what this does not mean", relationship context/age gating, language sanitiser, sign-vs-degree layer). Every composite surface renders that one model.

### 1. New `src/lib/relationship/compositeEngine.ts` (calculation)

- **Midpoints, documented.** Shorter-arc midpoint, normalised, with the ambiguity spelled out: at exactly 180° separation both midpoints are equally valid, so the convention is deterministic (take the midpoint on the arc measured forward from the lower longitude) and each position carries a flag when it was ambiguous. Wraparound (359°/1° → 0°) covered by tests.
- **Composite aspects** among Sun…Pluto plus Ascendant/MC when valid: conjunction, opposition, trine, square, sextile with configured orbs from the shared orb table, exact orb reported, ranked by body weight × aspect weight × closeness. Sign-vs-degree/out-of-sign analysis attached through the existing `analyzeSignVsDegree`.
- **Angles and houses, honestly.** Composite MC = midpoint of the two natal MCs. When both charts carry latitude and a valid MC, houses are *derived* Placidus-style from that composite MC and the mean birth latitude (new exported `ramcFromMc` + existing `houseCuspsFromBasis`), and the resulting Ascendant is reported alongside the midpoint-Ascendant with a note when they disagree. When latitude or MC is missing, `housesAvailable = false`, no house cusps are produced, and no house interpretation is generated. Nothing is invented.
- **Weighted element/modality balance.** Luminaries and angles weigh most, Mercury/Venus/Mars next, Jupiter/Saturn less, Uranus/Neptune/Pluto least. Counts are reported as a pattern with the weights shown; they never become a psychological verdict on their own.
- Same-sign coincidences (Sun/Moon, Venus/Mars) are recorded as observations only, never as a conclusion; conclusions require real aspects or several reinforcing factors.

### 2. Composite reading model (same file family, `compositeReading.ts`)

Sections in this order, each item carrying exact evidence, evidence tier, signal strength and clarifications:

1. **What this chart is** — a midpoint chart for the relationship as a third entity; explicitly not either person, and explicitly not synastry.
2. **Look here first** — composite Sun, Moon, Ascendant/MC when valid, house emphasis when valid, top major aspects; capped at the shared 5–8 top-factor bound.
3. **Core relationship themes** — 3 to 5 named blends, each with signal strength (Strong = several major factors, Moderate = 2–3, Single placement = not headlined).
4. **Why am I saying this** — the exact placements, aspects with orbs and houses behind each theme.
5. **How it may show up** — plain English, age and context aware.
6. **What this does not mean** — from the shared clarification set (Pluto, Saturn, Chiron/nodes, 8th/12th, tense aspects).
7. **Deeper technical view** — all positions and all aspects.

Context rules: composite never uses directional "A feels X, B feels Y" language; it says how the relationship tends to function. Teen pairs get friendship, affection, emotional tone, communication, fun, trust, pacing, conflict and repair, shared interests, day-to-day functioning; adult marriage, cohabitation, sexual and family-building framing is switched off. All output passes through the relationship language sanitiser, so "profound intimacy", "deeply merged", "the relationship is X" style wording is replaced with qualified, evidence-tied phrasing.

### 3. Surfaces

- `CompositeChartCard.tsx` and `RelationshipChartDisplay` in `SynastryView.tsx` both render a new shared `CompositeReadingView`, so the two screens cannot drift; the Davison card reuses the same view with its own method note.
- `RelationshipChartWheel.tsx` gains optional house cusps and major aspect lines. Without valid houses it renders as a sign-and-aspect wheel and says so in the caption.
- `FiveEssentialQuestions.tsx` keeps working through a thin legacy adapter that derives the old `CompositeInterpretation` shape from the new engine, so no screen keeps its own interpretation logic.
- `SynastryPDFExport.tsx` gains a concise Composite block: what the chart is, top factors, themes with signal strength and evidence, and the houses/angles caveat. A few lines, not a second report.
- Tab copy makes the distinction explicit: Synastry = how two people affect each other; Composite = the symbolic chart of the relationship itself, built from midpoints.
- `compositeAndDavison.ts` stops midpointing twelve cusps and delegates to the canonical engine.

### 4. Tests (`src/lib/__tests__/compositeChart.test.ts`)

Midpoint wraparound and the documented exact-opposition convention; aspect detection and orbs; weighted element balance not producing verdicts; houses absent when latitude is missing and derived when present; forbidden-language sweep; Ava + Max regression from their saved charts checking midpoint longitudes against their natal longitudes, top aspects, teen-appropriate output, no adult/sexual/marriage wording, and no interpretation hardcoded to them.

## Known limitation to report

Derived composite houses depend on stored latitude and a valid natal MC for both charts. Where either is missing the Composite section will show positions and aspects only, with houses explicitly unavailable rather than approximated.

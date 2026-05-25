# Aspects Tab — Personalized Aspect Decoder

A new top-level tab that turns every chart's aspect grid into a ranked, plain-language reading — including the dissociate (out-of-sign) aspects that Astro.com doesn't draw a line for. This is exactly the moment we just had with Nicki's Saturn ⚻ Uranus: the math is real, the line is missing, and nobody explains why or what it feels like in the body.

## What the user sees

1. **Person picker (top)** — same pattern as Lauren's starred dropdown:
   - Searchable Popover + Command
   - Alphabetical
   - Primary user pinned on top with amber star
   - Name-only (no role labels)

2. **Aspect-type tabs** — All · ☌ Conjunction · ☍ Opposition · △ Trine · □ Square · ⚹ Sextile · ⚻ Quincunx · (and minor: semi-sextile, sesquiquadrate if data present)

3. **Ranked list of that person's aspects.** Importance ranking (research-backed, not just orb):
   - **Planet weight** (Luminaries 10 > Personal 7 > Social 5 > Outer 4 > Points 3) — Sun/Moon contacts always rank above outers
   - **Aspect weight** (Conjunction 10 > Opposition 9 > Square 8 > Trine 7 > Sextile 5 > Quincunx 4 > minors 2)
   - **Orb tightness** (tighter = higher, scaled against the aspect's max orb from `aspectOrbs.ts`)
   - **Angularity bonus** (planets in 1/4/7/10 houses, or aspects to ASC/MC)
   - **Dissociate flag** — shown as a badge "Dissociate / Out-of-Sign" with a one-line explanation of why Astro.com doesn't draw the line
   - Final score = (planetA + planetB) × aspectWeight × tightnessFactor + angularityBonus
   - So **Sun ☌ Moon** outranks a tight **Saturn ⚻ Uranus** every time, as the user expected.

4. **Each aspect card has 3 layers** (matches our existing `aspect-narrative-growth-layers` standard):
   - **Headline:** Planet A [sign/house] [aspect] Planet B [sign/house] — orb · applying/separating · dissociate badge if applicable
   - **The mechanic** (1 sentence): what's structurally being negotiated
   - **How it feels in your chart** (2–3 sentences): grounded in the actual sign + house placements, ruler context, retrograde state, and any third planet stacked at the same degree (e.g. Uranus conj South Node + Jupiter + Moon → adds a "this contact is also wired into your karmic release point and your emotional body" line). No jargon, no generic trait words — felt-sense per our copy standard.

5. **"Why this isn't drawn on Astro.com" callout** — appears automatically on any dissociate aspect with a short, teaching-tone explanation (the exact thing we just discussed with the user). This is the section that "points out the knowledge" they want the app built around.

## Verification (Nicki's chart, before shipping)

Confirm the three aspects the user is seeing on Astro and currently can't identify:
- ⚻ ♆ → ♄ (Neptune quincunx Saturn) — verify by absolute degrees
- ♂ → ♄ (Mars to Saturn — likely square or trine, confirm aspect type)
- ☉ → ♇ or ☽ (Sun to Pluto vs Sun to Moon — confirm which by reading the chart data)
Surface all three in the ranked list with a "you spotted this on Astro" tone so the user can trust the engine.

## Technical section

**New files**
- `src/lib/aspectRanking.ts` — pure scoring function: takes `chart`, returns `RankedAspect[]` with score breakdown, dissociate flag, applying/separating, third-body stacks (any other planet within 3° of either endpoint).
- `src/lib/aspectPersonalization.ts` — generates the 3-layer felt-sense copy per aspect, pulling from existing `aspectMeaningLibrary.ts` / `aspectContextInterpreter.ts` and enriching with sign + house + ruler + retrograde + stack context. No new AI calls — deterministic templated copy following the felt-sense + no-single-traits memory rules.
- `src/components/AspectsView.tsx` — the tab UI: person picker, aspect-type tabs, ranked card list, dissociate callout.

**Wiring**
- Add an `aspects` tab to whatever top-level nav currently hosts Foundations / Moon Cycle / Ask (check `AstroCalendar` or wherever the main tabs live) — surface as its own tab, not nested under Foundations, since the user asked for it as a top-level destination.
- Reuse the existing person-picker component used for Lauren-starred dropdowns (per `dropdown-universal-standard` memory). Find the current implementation and reuse it directly rather than rebuilding.
- Use `aspectOrbs.ts` for all orb math. No new orb constants.
- Use `formatLocalDateKey` / `parseLocalDate` if any timing is shown.

**Out of scope (this pass)**
- Transit aspects to the natal chart (this tab is natal-only for now).
- Editing aspects.
- PDF export of the aspects view.

## Open question before I build

Where should the tab live? Top-level next to Foundations / Moon Cycle / Ask, or as a sub-tab inside Foundations next to "Aspects" (which currently shows the encyclopedia, not personalized)? I'd recommend **top-level** since you described it as its own destination, but say the word and I'll nest it instead.

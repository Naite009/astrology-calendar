
# Zodiac Foundations: Signs, Elements, Polarity & Questionnaire

## What We're Building

A rich, visual "Foundations" section in the Narrative tab that teaches the user about their chart from the ground up — clickable zodiac signs, element distribution with meaning, polarity (yin/yang), quadrant emphasis, and a self-assessment questionnaire to determine if a missing element is truly absent or already mastered.

---

## 1. Zodiac Sign Encyclopedia (New Data File)

Create `src/lib/zodiacSignEncyclopedia.ts` — a comprehensive data file for all 12 signs containing:

| Field | Example (Aries) |
|-------|-----------------|
| Glyph/Symbol | Ram icon |
| Element | Fire |
| Modality | Cardinal |
| Polarity | Yang / Masculine / Assertive |
| Ruling Planet + Symbol | Mars |
| Body Region | Head, face, eyes, brain |
| Mantra | "I take action" |
| Affirmation | "If it can be done, I can do it" |
| Shadow Mindset | "Faster is always better" |
| Mnemonic | "The first spark of the match — quick, bright, gone" |
| Essence (multi-paragraph) | Deep description of the sign's nature, needs, creative expression, body associations |
| Areas to Work On | Impatience, impulsivity |
| Superpower | Most spontaneous of the signs |

All 12 signs will have this full treatment.

---

## 2. Clickable Sign Grid Component

Create `src/components/narrative/ZodiacSignExplorer.tsx`:

- A 4x3 grid (or 6x2) of all 12 signs, each showing: glyph icon, sign name, element color-coded badge, modality badge
- Clicking a sign opens a detailed modal/expandable panel showing ALL the fields above
- Visual layout: icon + name at top, then polarity/element/modality/ruler row, then mantra, then mnemonic box, then multi-paragraph essence, then body region, then shadow/growth

---

## 3. Element Distribution with Deep Meaning

Create `src/components/narrative/ElementDistributionCard.tsx`:

- Shows the user's natal chart element counts with planet symbols (reusing the pattern from Solar Return)
- For each element: count, percentage bar, list of planets in that element
- **Key addition**: When an element has 0 or 1 planets, show what that means using the existing `lackSymptoms` data from `elementTeachings.ts`
- When an element has 4+, show the "overdominance" interpretation
- Includes the Debra Silverman insight: "Just because someone is missing an element does not mean they are out of balance"

---

## 4. Element Self-Assessment Questionnaire

Integrate the existing `ElementSelfAssessment` component (already built in `src/components/sacredscript/ElementSelfAssessment.tsx`) into the Narrative section, but enhanced:

- Automatically targets the user's weakest/absent elements
- After completing, shows interpretation: "You scored 8/10 on Water despite having no Water planets — you've already internalized this element" vs "You scored 2/10 — this is genuinely undeveloped territory"
- This directly addresses the astrology paradox: missing element = already mastered OR needs development

---

## 5. Polarity Balance Display

Add polarity (Yin/Yang) tracking to the element distribution:

- Count planets in Yang signs (Fire + Air) vs Yin signs (Earth + Water)
- Visual bar showing the balance
- Interpretation: "Yang-dominant charts are action-oriented, externally focused" / "Yin-dominant charts are receptive, internally focused"
- Show which planets contribute to each side

---

## 6. Quadrant Integration in Narrative

The quadrant analysis already exists in `src/lib/hemisphereAnalysis.ts` and `QuadrantAnalysisDisplay.tsx` (Chart Decoder). We'll bring a summary into the Narrative tab's Themes section:

- Add hemisphere/quadrant summary to `ThemesTab.tsx`
- Show dominant quadrant with its meaning
- Show hemisphere balance (upper/lower = public/private, eastern/western = self-initiated/responsive)

---

## 7. Narrative Tab Integration

In `GroundedNarrativeView.tsx`, add a new **"Foundations"** sub-section that appears below the narrative text (alongside Life Styles and What's Ahead):

- Zodiac Sign Explorer (clickable grid)
- Element Distribution Card (with interpretations)
- Polarity Balance
- Element Self-Assessment (collapsible)
- These are always visible once a chart is selected, even before generating an AI narrative

---

## Technical Details

**New files:**
- `src/lib/zodiacSignEncyclopedia.ts` — full 12-sign data
- `src/components/narrative/ZodiacSignExplorer.tsx` — clickable sign grid + detail modal
- `src/components/narrative/ElementDistributionCard.tsx` — element counts, polarity, missing element meaning
- `src/components/narrative/FoundationsSection.tsx` — wrapper combining all foundation components

**Modified files:**
- `src/components/GroundedNarrativeView.tsx` — add Foundations section to narrative tab
- `src/components/narrative/ThemesTab.tsx` — add quadrant/hemisphere summary
- `src/lib/narrativeAnalysisEngine.ts` — add polarity scores to SignalsData (yangCount, yinCount, polarityPlanets)

**Dependencies:** None new — uses existing UI components (Dialog, Badge, Progress, Tabs) and data (`elementTeachings.ts`, `hemisphereAnalysis.ts`, `planetDignities.ts`)

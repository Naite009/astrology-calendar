

# Eclipse Teaching Mode: Personalized Step-by-Step Walkthrough

## What This Builds

A new "Teaching Mode" component that replaces the current collapsible-module approach with a **linear, step-by-step guided walkthrough** that narrates the eclipse's meaning through the user's personal chart. Each step builds on the previous one, moving from universal → sign-specific → house-specific → natal-node-specific → pattern recognition → action items.

## The 7 Steps

```text
Step 1: What This Eclipse IS (type + meaning)
   "This is a total lunar eclipse. Lunar eclipses reveal what's hidden,
    outdated, or has run its course..."

Step 2: The Sign Filter (Virgo themes)
   "Because it's in Virgo, the themes are: perfectionism, worry,
    self-criticism, diet, health routines, analysis paralysis..."

Step 3: YOUR House (where it lands in your chart)
   "For you, this falls in your 11th house — community, friendships,
    hopes for the future. So the Virgo audit is happening in your
    social world and group commitments..."

Step 4: YOUR Natal Nodes (the karmic context)
   "Your North Node is in Scorpio (deep transformation, shared
    resources, emotional truth). Your South Node is in Taurus
    (comfort, material security, holding on). This eclipse asks:
    are your Virgo-style habits (diet, routines, perfectionism)
    keeping you stuck in Taurus comfort — or moving you toward
    Scorpio depth?"
   - Pulls from SPILLER_NODE_DATA for rich context
   - Connects eclipse sign to natal node axis explicitly

Step 5: The Pattern Mirror
   "Look for this pattern: 'I keep optimizing/fixing/perfecting X
    but nothing changes.' That's the South Node talking. The eclipse
    is showing you: the method isn't broken — the goal might be.
    Scorpio NN says: go deeper, not wider."

Step 6: Natal Planet Activations (aspects)
   "This eclipse at 12° Virgo makes a [trine/square/etc] to your
    natal [planet] — which adds [specific theme]..."

Step 7: Your Personal Action Plan
   - What to release (tied to SN + eclipse sign)
   - What to move toward (tied to NN)
   - Specific journal prompts synthesizing all steps
   - "Watch for this in the next 2 weeks..."
```

## How It Works Technically

### New Component: `EclipseTeachingMode.tsx`
- Receives: `eclipse: EclipseEvent`, `userNatalChart: NatalChart | null`
- State: `currentStep` (0-6), with Next/Back navigation
- Each step is a dedicated render function that pulls from existing data sources
- Step progression uses a progress bar showing "Step 3 of 7"
- Users can jump between steps via clickable step indicators

### Data Sources (all existing, no new data files needed)
- **Step 1**: Eclipse type/subtype from `EclipseEvent` + `nodalEducation` export
- **Step 2**: `buildSignTeaching()` from `signTeacher.ts` — element, modality, shadow, superpower
- **Step 3**: `getHouseForLongitude()` + `HOUSE_MEANINGS` from `houseCalculations.ts`
- **Step 4**: `SPILLER_NODE_DATA` from `nodeSpillerData.ts` — pastLifeStory, tendenciesToLeaveBehind, tendenciesToDevelop + a new **cross-reference function** that connects eclipse sign themes to natal node themes
- **Step 5**: New synthesis logic that generates "pattern sentences" by combining eclipse sign shadow + SN sign tendencies
- **Step 6**: `getEclipseAspectHits()` from `eclipseAspects.ts`
- **Step 7**: Enhanced `generateTakeaway()` that incorporates natal node data

### Cross-Reference Logic (the key new piece)
A function `synthesizeEclipseWithNodes()` that:
1. Takes eclipse sign, eclipse house, natal NN sign, natal SN sign, natal NN house, natal SN house
2. Determines if eclipse sign shares element/modality with NN or SN
3. Generates specific guidance: "This Virgo eclipse connects to your Taurus SN through the earth element — the pull to optimize your diet IS the South Node pattern. Your Scorpio NN says the real work is emotional, not logistical."
4. Pulls relevant `tendenciesToLeaveBehind` and `tendenciesToDevelop` from Spiller data

### Integration into EclipseEncyclopediaExplorer
- Add a toggle button: "📖 Teaching Mode" next to the existing interpretation layer
- When active, replaces the collapsible modules with the step-by-step walkthrough
- Falls back gracefully if no natal chart is loaded (Steps 1-2 work without a chart, Steps 3-7 show "Add your birth chart to personalize")

### UI Design
- Each step: full-width card with step number, title, and rich content
- Bottom nav: "← Previous Step" / "Next Step →" buttons
- Top: clickable step dots showing progress
- Current step highlighted, completed steps get checkmarks
- Smooth scroll-to-top on step change

## Files to Create/Edit

1. **Create** `src/components/narrative/EclipseTeachingMode.tsx` — the main 7-step component
2. **Create** `src/lib/eclipseNodeSynthesis.ts` — cross-reference logic connecting eclipse themes to natal nodes
3. **Edit** `src/components/narrative/EclipseEncyclopediaExplorer.tsx` — add Teaching Mode toggle and render the new component
4. **Edit** `src/components/narrative/EclipseInterpretationLayer.tsx` — minor: export the `generateTakeaway` function for reuse


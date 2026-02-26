

# New Moon Phases Tab

## What This Does
Creates a dedicated "Moon" tab in the main navigation that serves as a comprehensive moon phase encyclopedia and personal moon phase identifier. When you select a name from the dropdown, it calculates which of the 8 lunar phases you were born under, highlights it, and gives you a full description with your exact degree.

## The 8 Moon Phases (Corrected Degrees)
The existing code in `birthConditions.ts` already has all 8 phases with rich descriptions (archetype, soul purpose, gift, challenge, life theme). The degree ranges will be:

1. New Moon: 0-45 degrees
2. Waxing Crescent: 45-90 degrees
3. First Quarter: 90-135 degrees
4. Waxing Gibbous: 135-180 degrees
5. Full Moon: 180-225 degrees
6. Disseminating (Waning Gibbous): 225-270 degrees
7. Last Quarter: 270-315 degrees
8. Balsamic: 315-360 degrees

## Changes

### 1. Add "Moon" to the ViewMode type and navigation
**File: `src/components/AstroCalendar.tsx`**
- Add `"moon"` to the `ViewMode` type
- Add a Moon navigation button (using the Moon icon)
- Render the new `MoonPhaseEncyclopedia` component when `viewMode === "moon"`
- Pass `userNatalChart`, `savedCharts`, and allCharts to it

### 2. Create the Moon Phase Encyclopedia component
**New file: `src/components/MoonPhaseEncyclopedia.tsx`**

This component will contain:

- **Chart Selector dropdown** at the top ("Show my natal moon phase for:") using the existing `ChartSelector` component
- **8 clickable phase cards** arranged in a grid/circle layout, each showing:
  - Phase emoji/symbol
  - Phase name
  - Degree range (e.g., "0-45 degrees")
  - Archetype name (e.g., "The Pioneer")
- When a chart is selected, the person's natal moon phase card gets **highlighted** with a "Your Birth Phase" badge and their exact Sun-Moon separation degree
- **Clicking any phase card** expands it (or opens a detail section) showing:
  - Full soul purpose description
  - Expression style
  - Gift and Challenge
  - Life theme
  - The exact degree range and what it means to be in the early/middle/late portion of that phase

### 3. Natal Moon Phase Calculation
Reuses the existing `calculateBirthMoonPhase` function from `src/lib/birthConditions.ts`, which already computes the Sun-Moon angular separation and maps it to the correct phase. The exact degree will be displayed (e.g., "You were born at 127 degrees Sun-Moon separation -- Waxing Gibbous phase").

### Technical Notes
- The existing `BIRTH_MOON_PHASES` data in `birthConditions.ts` already contains all content (archetype, soulPurpose, expression, gift, challenge, lifeTheme) for all 8 phases
- The `calculateBirthMoonPhase` function already handles the degree calculation -- just need to also expose the raw `separation` degree alongside the phase name
- The `ChartSelector` component is already used throughout the app for personalization dropdowns
- No database changes needed -- all data is computed from natal chart positions already stored locally

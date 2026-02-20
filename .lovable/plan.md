

## Fix Biorhythm Colors: Physical Should Be Blue

### Problem
The circular gauges correctly use `bio.color` from `BIORHYTHM_CYCLES` (Physical = blue `hsl(210 90% 50%)`), but the wave charts in both components hardcode different colors:
- Physical is set to `hsl(var(--destructive))` (red) -- should be blue
- Emotional is set to `hsl(var(--primary))` (brown/earth) -- should be red

### Changes

**1. `src/components/BiorhythmCard.tsx` — BiorhythmWaveInline**
- Line 460: Change Physical color from `hsl(var(--destructive))` to `hsl(210 90% 50%)` (blue)
- Line 461: Change Emotional color from `hsl(var(--primary))` to `hsl(0 84% 60%)` (red)
- Line 491: Update the legend swatch for Physical from `bg-destructive` to a blue style
- Line 492: Update the legend swatch for Emotional from `bg-primary` to a red style

**2. `src/components/BiorhythmForecast.tsx` — WaveChart**
- Line 142: Change Physical path color from `hsl(var(--destructive))` to `hsl(210 90% 50%)`
- Line 143: Change Emotional path color from `hsl(var(--primary))` to `hsl(0 84% 60%)`

**3. `src/components/BiorhythmForecast.tsx` — Legend (if present)**
- Update any legend color swatches to match

This ensures all biorhythm visuals use consistent standard colors: Physical = Blue, Emotional = Red, Intellectual = Green.


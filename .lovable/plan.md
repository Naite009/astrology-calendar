

# Enrich Moon Phase Encyclopedia with Kaldera + Forrest + McCartney Content

## What the user is asking
Yes — the "Moon Phase Astrology" book by Raven Kaldera assigns a unique mythic archetype name to each combination of Moon phase + zodiac sign (8 phases × 12 signs = 96 "named Moons"). Examples: "Infant's Moon" (New Moon in Aries), "Warrior's Moon" (Full Moon in Aries), "Mystic's Moon" (Balsamic in Pisces). The user wants all of this plus Forrest and McCartney content integrated in a clickable, easy-to-understand way.

## Plan

### 1. Create data file: 96 Kaldera Moon Archetypes
**File:** `src/data/moonPhaseSignArchetypes.ts`

A lookup map: `phase × sign → { name, description }` for all 96 combinations extracted from the book's table of contents. Each entry gets the archetype name and a one-line essence. Structure:

```typescript
export const MOON_PHASE_SIGN_ARCHETYPES: Record<string, Record<string, { name: string; essence: string }>> = {
  'New Moon': {
    Aries: { name: "Infant's Moon", essence: "Pure impulse, the spark of new life..." },
    Taurus: { name: "Dryad's Moon", essence: "..." },
    // all 12 signs
  },
  'Waxing Crescent': { ... }, // Torch-Bearer's, Gardener's, etc.
  // all 8 phases
};
```

### 2. Create data file: Forrest Moon Signs + Houses
**File:** `src/data/moonForrestData.ts`

Contains Moon-in-sign (12 entries) and Moon-in-house (12 entries) from Steven Forrest's "Book of the Moon":

- **Moon Signs:** Evolutionary Goal, Mood, Reigning Need, Secret of Happiness & Healing, Shadow
- **Moon Houses:** Soul Intention, Mood Sensitivity, Reigning Need, Critical Whimsy, Soul-cage

### 3. Create data file: Forrest Phase Enrichments
**File:** `src/data/moonPhaseForrest.ts`

8 entries with Forrest's evolutionary keywords and insights per phase, complementing the existing `birthConditions.ts` data.

### 4. Create data file: Eclipse & Phase Timing Rules
**File:** `src/data/eclipseTimingRules.ts`

McCartney's practical timing data:
- New Moon influence = 1 month; Full Moon = 2 weeks; Quarter = 1 week
- Solar Eclipse = 1 year; Lunar Eclipse = 6 months
- Watch transiting planets aspecting eclipse degree
- VOC interpretive text

### 5. Enhance Moon Phase Encyclopedia UI
**File:** `src/components/MoonPhaseEncyclopedia.tsx`

When a phase card is expanded:
- **New section: "Your Moon Archetype"** — If a chart is selected, show the Kaldera archetype name for their phase+sign combo (e.g., "You are the Warrior's Moon — Full Moon in Aries") with a clickable card
- **New section: "All 12 Archetypes"** — Collapsible grid showing all 12 sign archetypes for that phase, each clickable to reveal the essence
- **New section: "Steven Forrest's Insight"** — Forrest's evolutionary keyword + paragraph for that phase
- If chart selected, also show Forrest's Moon-in-sign and Moon-in-house data below the natal phase banner

### 6. Add Kaldera Archetypes to Zodiac Sign Explorer
**File:** `src/components/narrative/ZodiacSignExplorer.tsx`

In the `SignDetailModal`, add a new collapsible section "☽ Moon Phase Archetypes" showing the 8 Kaldera archetype names for that sign (one per phase) as clickable badges.

### 7. Add McCartney timing to Eclipse Encyclopedia
**File:** `src/components/narrative/EclipseEncyclopediaExplorer.tsx`

Add a small info card or tooltip with the timing rules (Solar = 1 year, Lunar = 6 months) and the guidance about watching transiting planets aspecting eclipse degrees.

### 8. Enhance VOC display
**File:** `src/lib/voidOfCourseMoon.ts` + `src/components/DayDetail.tsx`

Add McCartney/Forrest interpretive text constants for VOC: "Moon's instincts are on hold — best for routine, meditation, reflection. Not ideal for initiating new plans."

## UI Design Principles
- Every archetype name is **clickable** to reveal its description
- Use the existing card/badge/collapsible patterns from the codebase
- Archetype names displayed as stylized badges with the moon phase emoji
- Source attribution shown as small text (e.g., "— Raven Kaldera")
- Keep the data browsable: users can explore all 96 moons without needing a chart selected

## Files Created
| File | Purpose |
|------|---------|
| `src/data/moonPhaseSignArchetypes.ts` | 96 Kaldera named Moons |
| `src/data/moonForrestData.ts` | Moon signs + houses from Forrest |
| `src/data/moonPhaseForrest.ts` | 8 phase enrichments from Forrest |
| `src/data/eclipseTimingRules.ts` | McCartney timing rules |

## Files Edited
| File | Changes |
|------|---------|
| `src/components/MoonPhaseEncyclopedia.tsx` | Add Kaldera archetypes + Forrest insights to expanded cards |
| `src/components/narrative/ZodiacSignExplorer.tsx` | Add Moon archetypes section per sign |
| `src/components/narrative/EclipseEncyclopediaExplorer.tsx` | Add timing rules |
| `src/lib/voidOfCourseMoon.ts` | Add interpretive text |
| `src/components/DayDetail.tsx` | Show VOC meaning text |


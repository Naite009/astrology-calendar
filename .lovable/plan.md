
# Plan: Structural Stress & Release Tab

## Overview
Create a new main navigation tab called "STRUCTURAL STRESS & RELEASE" that provides a trauma-informed, universal interpretation layer for major life transits. This feature explains "why periods felt binding" vs. "why periods enabled exit/rupture/closure" without predicting specific events.

## Core Concept
Transits describe **pressure dynamics**, not destiny:
- **Saturn** = containment, commitment pressure, responsibility, structures
- **Pluto** = unsustainable power pressure, control dynamics, irreversible change  
- **Uranus** = disruption, awakening, break conditions, liberation impulse
- **Mars** = activation/incident triggers (events, conflicts)
- **Nodes/Eclipses** = turning points, fated-feeling pivots

---

## Technical Implementation

### 1. Data Models (New File: `src/lib/structuralStressEngine.ts`)

**transit_event interface**
```typescript
interface TransitEvent {
  id: string;
  start_date: Date;
  end_date: Date;
  exact_dates: Date[];
  transiting_planet: 'Saturn' | 'Pluto' | 'Uranus' | 'Mars' | 'NorthNode' | 'SouthNode';
  aspect_type: 'conjunction' | 'square' | 'opposition' | 'trine' | 'sextile';
  natal_target: string; // planet or angle name
  orb_max_used: number;
  house_activated: { transit: number; natal: number };
  axis_activated: string; // e.g., "10th↔4th"
}
```

**chart_signature interface**
```typescript
interface ChartSignature {
  saturn_sign: string;
  saturn_house: number;
  saturn_dispositor: { planet: string; sign: string; house: number };
  top_saturn_aspects: NatalAspect[];
  libra_stellium_flag: boolean;
  relationship_sensitivity_flag: boolean;
  authority_axis_flag: boolean;
}
```

**structural_window interface**
```typescript
interface StructuralWindow {
  window_id: string;
  date_range: { start: Date; end: Date };
  events: TransitEvent[];
  phase_scores: {
    containment_score: number;  // Saturn-dominant
    stress_score: number;       // Pluto-dominant
    release_score: number;      // Uranus-dominant
    trigger_score: number;      // Mars/Eclipse activation
  };
  phase_label: 'Containment' | 'Structural Stress' | 'Release' | 'Activation' | 'Mixed';
  theme_badges: string[];
  axis_badge: string;
  user_context_tags: string[];
  meaning_dial_mode: 'Insight' | 'Practical' | 'Emotional Support' | 'Shadow Work';
  output_copy: GeneratedCopy;
  action_steps: string[];
}
```

**cycle_summary interface**
```typescript
interface CycleSummary {
  cycle_type: 'saturn_return' | 'saturn_opposition' | 'uranus_opposition' | 'pluto_square';
  story_summary: string;
  lessons: string[];
  next_steps: string[];
}
```

### 2. Interpretation Engine (New File: `src/lib/structuralStressEngine.ts`)

**Phase Score Calculation:**
- Containment score increases with: Saturn hard aspects to personal planets/angles, Saturn sign/house changes, Saturn transits to 4th/10th or 1st/7th axis
- Stress score increases with: Pluto hard aspects to personal planets, Pluto-Saturn clustering, 2nd/8th axis activation
- Release score increases with: Uranus hard aspects to personal planets, Uranus opposition/squares to 1st/7th or 4th/10th axis
- Trigger score increases with: Mars aspects to Saturn/Pluto/Uranus, Node/Eclipse activation within +/- 7 days

**Axis Interpreter:**
- 10th↔4th: Public role vs Private foundation/safety
- 7th↔1st: Partnership vs Self-definition
- 2nd↔8th: Self-worth/resources vs Shared power/intimacy
- 6th↔12th: Health/service vs Rest/psyche
- 9th↔3rd: Beliefs/meaning vs Daily mind/skills
- 11th↔5th: Community goals vs Personal joy/creativity

**Saturn Lens Cards (universal):**
- "Saturn in [SIGN] asks..." (sign meaning prompt)
- "Saturn in the [HOUSE] asks..." (domain prompt)
- "Saturn reports to [DISPOSITOR], so..." (how lesson travels)

**Copy Template System:**
Each window generates:
1. Structural Phase Summary (3-5 sentences)
2. Chart-Specific Explanation (bulleted)
3. Likely Manifestations (3-6 neutral examples)
4. Actions (2-4 concrete steps)
5. Meaning Dial Variants (tone adjustments)

### 3. UI Components

**New Component: `src/components/StructuralStressView.tsx`**

Structure:
```text
StructuralStressView
├── IntroSection (explanatory paragraph)
├── MeaningDial (mode selector)
├── ContextTagsPanel (optional enrichment dropdown)
├── TimelineView (scrollable window cards)
│   └── WindowCard (for each structural_window)
│       ├── DateRange + PhaseLabel
│       ├── AxisBadge + ThemeBadges
│       └── PhaseMeterBars (containment/stress/release/trigger)
└── WindowDetailModal (3-layer output)
    ├── Layer A: Universal Archetype
    ├── Layer B: Chart-Specific Houses/Aspects
    └── Layer C: Actions + Reflection Prompts
```

**Supporting Components:**
- `src/components/structural/WindowCard.tsx` - Timeline card display
- `src/components/structural/WindowDetailModal.tsx` - Detailed 3-layer view
- `src/components/structural/SaturnLensCards.tsx` - Universal Saturn interpretation
- `src/components/structural/MeaningDial.tsx` - Tone selector
- `src/components/structural/ContextTagsPanel.tsx` - Optional enrichment tags
- `src/components/structural/CycleSummaryCard.tsx` - End-of-cycle synthesis

### 4. Copy Templates (New File: `src/lib/structuralStressCopy.ts`)

**Saturn Sign Templates:**
```typescript
const SATURN_IN_SIGN: Record<string, { asks: string; quality: string; need: string }> = {
  Aries: { 
    asks: "Where are you seeking courage from others instead of building it in yourself?",
    quality: "self-reliance",
    need: "independence"
  },
  Libra: {
    asks: "Where have you been confusing obligation with love?",
    quality: "fairness",
    need: "balance"
  },
  // ... all 12 signs
};
```

**Saturn House Templates:**
```typescript
const SATURN_IN_HOUSE: Record<number, { asks: string; domain: string }> = {
  7: {
    asks: "What structures are you building in partnerships—and which ones are you maintaining out of obligation?",
    domain: "relationships and commitments"
  },
  // ... all 12 houses
};
```

**Phase Copy Templates:**
- Containment: "Saturn is emphasizing structure, duty, and long-term consequences..."
- Stress: "Pluto increases intensity and raises the cost of avoidance..."
- Release: "Uranus agitates what's stuck. You may feel restless, awakened..."
- Activation: "Mars and eclipse triggers tend to externalize what's been building internally..."

**Axis Headline Templates:**
```typescript
const AXIS_HEADLINES: Record<string, { tension: string; question: string }> = {
  "10th↔4th": {
    tension: "Public role vs Private foundation",
    question: "How do I balance career demands without sacrificing home safety?"
  },
  // ... all 6 axes
};
```

**Safety Guardrail Copy:**
If user selects "safety boundary" tag:
> "If you feel unsafe, prioritize real-world support and safety planning."

### 5. Integration Points

**A. Navigation (AstroCalendar.tsx)**
Add new ViewMode: `"structural"` 
Add new tab button between "Timeline" and "Health":
```tsx
<button onClick={() => setViewMode("structural")}>
  <Layers size={14} />
  Structural
</button>
```

**B. Saturn Cycle Integration**
Reference existing `calculateDetailedSaturnCycles()` from `saturnCycleCalculator.ts` as "cycle anchors"
Generate `cycle_summary` at the end of Saturn return/opposition windows

**C. Transit Detection**
Leverage existing `calculateTransitAlerts()` from `transitAlerts.ts`
Extend to scan for Pluto, Uranus, and Mars with clustering detection

### 6. Window Generation Algorithm

```text
1. Scan user's birth date + 5 years backward and 5 years forward
2. Find all Saturn, Pluto, Uranus, Mars, Node transits to personal points
3. Cluster events within 2-10 week windows
4. Calculate phase scores for each window
5. Assign phase_label based on dominant score
6. Generate axis_badge from primary house activation
7. Generate theme_badges from house meanings
8. Generate output_copy using templates + meaning_dial_mode
9. Store as structural_window objects
```

---

## File Structure Summary

**New Files:**
- `src/lib/structuralStressEngine.ts` - Core calculation logic + interfaces
- `src/lib/structuralStressCopy.ts` - All copy templates
- `src/components/StructuralStressView.tsx` - Main view component
- `src/components/structural/WindowCard.tsx` - Timeline card
- `src/components/structural/WindowDetailModal.tsx` - Detail view
- `src/components/structural/SaturnLensCards.tsx` - Saturn interpretation cards
- `src/components/structural/MeaningDial.tsx` - Tone selector
- `src/components/structural/ContextTagsPanel.tsx` - Optional tags
- `src/components/structural/CycleSummaryCard.tsx` - Cycle synthesis

**Modified Files:**
- `src/components/AstroCalendar.tsx` - Add new tab + ViewMode

---

## Language Guidelines (Trauma-Informed)

**Use:**
- "pressure," "intensity," "containment," "break conditions"
- "cost," "boundary," "authority," "agency," "support"
- "structure," "restructuring," "integration"

**Avoid:**
- "destiny," "meant to be," "soulmate," "required suffering"
- "you attracted," "you manifested"
- Any language implying obligation to endure harm

---

## Test Scenario (Dec 2020 Example)

Given: Uranus opposition + Pluto in Capricorn squaring Libra placements

Expected Output:
- High `release_score` (Uranus opposition)
- High `stress_score` (Pluto square personal planets)
- If Mars/Eclipse trigger nearby: elevated `trigger_score`
- Narrative about "containment vs break conditions" without predicting harm
- Axis badge: "7th↔1st" (Partnership vs Self-definition)
- Theme badges: ["relationship", "authority", "identity"]

---

## Intro Copy for Tab

> "This view explains pressure cycles—when life is in 'hold it together' mode vs 'something must change' mode. It doesn't predict specific events. It helps you understand what themes are active and what choices support you."

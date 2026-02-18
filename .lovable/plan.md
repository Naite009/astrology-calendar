

## Narrative Section: The Complete Portrait

### Goal
Transform the Narrative section into the definitive "everything about you" hub by adding what's missing: a visual summary card, transit forecast for what's coming, and extending Life Styles to HD/Combined modes.

---

### New Features (4 additions)

#### 1. "Your Chart at a Glance" Summary Card
A visual card that appears above the narrative text showing the person's key signatures at a glance:
- **Astrology mode**: Big Three (Sun, Moon, Rising), dominant element, chart shape, angular planets
- **HD mode**: Type, Authority, Profile, Definition, Cross name
- **Combined mode**: Both side by side

This gives an instant visual anchor before reading the narrative.

#### 2. "What's Ahead" Transit Forecast Panel
A collapsible section below the narrative showing the 5-8 most significant upcoming transits for the next 6 months:
- Uses existing transit calculation logic from `transitMath.ts` and `transitAlerts.ts`
- Shows: transit planet, aspect, natal point, exact date, and a one-sentence plain-language meaning
- Sorted by significance (outer planets to personal points first)
- Only appears for charts that have birth data sufficient for transit calculation
- For HD mode: shows transits to Incarnation Cross gate degrees
- For Combined mode: merges both

This directly addresses your request for "include some transits about what is to come."

#### 3. Life Styles for HD and Combined Modes
Currently the Education/Athletic/Career/Romance Life Styles cards only show in astrology mode. Extend them:
- **HD mode**: Add HD-specific lifestyle insights (e.g., Career style based on Type + defined channels to Throat, Romance style based on open/defined Solar Plexus + profile lines)
- **Combined mode**: Merge both astrology and HD insights into each card

#### 4. "Themes" Tab for All Modes
A new tab (alongside Narrative, Signals/Blueprint, etc.) that shows a visual summary of dominant life themes:
- Top 3 strengths/gifts (derived from chart data)
- Top 3 growth edges (from pressure points / not-self themes)
- Dominant life area (relationships, career, inner work, creativity) based on house emphasis
- For HD: shows circuit group emphasis (Individual, Tribal, Collective)

---

### Technical Approach

**Files to modify:**
- `src/components/GroundedNarrativeView.tsx` — Add the "At a Glance" card, "What's Ahead" panel, new "Themes" tab, and extend Life Styles visibility to HD/Combined
- `src/lib/narrativeAnalysisEngine.ts` — May need a helper to compute "top themes" from signals

**Files to reference (read-only, for transit data):**
- `src/lib/transitAlerts.ts` — Reuse transit significance scoring
- `src/lib/transitMath.ts` — Reuse exact transit date calculations
- `src/lib/personalizedTransitInterpretations.ts` — Reuse one-sentence meanings

**No database changes needed.** All data is derived from existing chart data already in memory.

**No new edge functions needed.** The transit calculations and theme summaries are all client-side logic.

---

### Tab Structure After Changes

**Astrology mode tabs:** Narrative | Signals | Source Map | Themes
**HD mode tabs:** Narrative | Blueprint | Cross | Themes  
**Combined mode tabs:** Narrative | Blueprint | Cross | Themes

The "At a Glance" card and "What's Ahead" panel appear within the Narrative tab itself (above and below the prose), not as separate tabs.

---

### Order of Implementation
1. "At a Glance" summary card (visual, quick win)
2. "What's Ahead" transit forecast panel (the feature you specifically asked for)
3. "Themes" tab with strengths/growth edges
4. Extend Life Styles to HD/Combined modes


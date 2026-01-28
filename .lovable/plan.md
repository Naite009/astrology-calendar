

# Plan: Restructure Structural Stress & Release Tab

## The Problem
The current implementation doesn't match the ChatGPT conversation's vision:
- Creates one giant 10-year timeline with massive clustered windows
- Windows span many months because transit clustering logic is too aggressive
- No way to explore specific life events or dates
- Clicking anywhere opens a generic modal for the whole window
- Missing the "story-based" approach (Saturn return in 2006 = relationship began, Dec 2020 = breaking point)

## What You Actually Wanted (from the ChatGPT conversation)

### Core Use Case
- **Look at specific life events** (met husband during Saturn return, violent episode Dec 2020)
- **See what transits were active** at that moment
- **Understand the pressure dynamics** - why you entered, why you couldn't leave, what changed

### The Real Flow
1. Select a date range OR a specific life event
2. See what Saturn/Pluto/Uranus/Mars/Nodes were doing to your chart during that time
3. Get the "Containment vs Release vs Stress vs Trigger" breakdown
4. Understand the pressure narrative without predicting events

---

## Proposed Restructure

### 1. Change the Primary Interface
**Current:** Timeline of auto-generated windows
**New:** Two modes of exploration

#### Mode A: Key Life Moments (Event Explorer)
- User enters a date or selects a milestone (Saturn return, Saturn square, Uranus opposition, etc.)
- App shows all transits active within +/- 6 weeks of that date
- Displays the phase scores and narrative for that specific window

#### Mode B: Major Transits Timeline
- Show discrete, focused transit periods (not giant clusters)
- Each card = ONE major transit (e.g., "Saturn conjunct Sun, Mar-Sep 2006")
- Clicking shows the interpretation for that specific transit
- Windows are 2-10 weeks around exact dates, not months of clustered events

### 2. Add Life Event Input (as discussed in ChatGPT)
Allow users to tag dates with context:
- "Relationship began"
- "Relationship ended"
- "Marriage/commitment"
- "Breakup/divorce"
- "Parent death / grief"
- "Job change"
- "Move / housing"
- "Health event"
- "Identity shift"
- "Safety boundary"
- "Other"

When tagged, the interpretation adjusts to speak to that context.

### 3. Fix Window Generation Logic
**Current:** Clusters all events within 14 days of each other into giant windows
**New:**
- Create separate windows for each major outer planet transit
- Only cluster if multiple planets hit the SAME natal point within 4 weeks
- Result: Many small, focused windows instead of few massive ones

### 4. Add "Explore a Date" Feature
- Date picker to enter a specific date (e.g., "Dec 20, 2020")
- Shows all transits active on that exact date
- Calculates orbs and shows applying/separating status
- Generates the phase narrative for that moment

### 5. Integrate with Saturn Cycle Milestones
Reference the Saturn returns, squares, and oppositions from Life Cycles Hub as anchor points the user can click to explore.

---

## Technical Changes

### File: `src/lib/structuralStressEngine.ts`
```text
Changes:
1. Add getTransitsForDate(chart, date) - returns all active transits for a specific date
2. Change clusterEventsIntoWindows() - create individual transit windows, only cluster same-target events
3. Add generateEventWindow(chart, date, contextTag?) - creates a focused window for a specific moment
4. Reduce default cluster threshold from 14 days to 4 weeks max per transit
```

### File: `src/components/StructuralStressView.tsx`
```text
Changes:
1. Add date picker component for "Explore a Date"
2. Add major milestones section (Saturn return dates, Uranus opposition, etc.)
3. Change timeline to show individual transits, not clusters
4. Add life event tagging dropdown when exploring a date
5. Remove the "click anywhere opens giant modal" behavior - each transit card is its own focused item
```

### File: `src/components/structural/WindowCard.tsx`
```text
Changes:
1. Show single transit information (not cluster of 10)
2. Display exact dates more prominently
3. Show orb and applying/separating status
```

### File: `src/components/structural/WindowDetailModal.tsx`
```text
Changes:
1. Show focused interpretation for ONE transit or one tight cluster
2. Include the life event context if user provided it
3. Add "story" framing: "During this [Saturn return], structures were forming..."
```

### New Component: `src/components/structural/DateExplorer.tsx`
```text
- Date picker input
- "What was happening on this date?" button
- Shows all active transits for that date
- Phase score breakdown
- Narrative interpretation
```

### New Component: `src/components/structural/LifeMilestones.tsx`
```text
- Shows calculated Saturn return, squares, oppositions
- Shows Uranus opposition (if reached)
- Each is clickable to explore that transit window
```

---

## Example User Flow (What You Described)

### Use Case 1: "I met my husband in April 2006"
1. Open Structural Stress tab
2. Click "Explore a Date" and enter April 2006
3. See: "Saturn conjunct natal Saturn (Saturn Return) - exact Aug 2006, applying in April"
4. See phase: "Containment" - high commitment pressure
5. See narrative: "Saturn returns create commitment pressure. Structures feel serious and binding..."
6. Optionally tag: "Relationship began"
7. Get contextualized interpretation about Saturn relationship patterns

### Use Case 2: "December 2020 something broke"
1. Click "Explore a Date" and enter Dec 20, 2020
2. See: "Uranus opposite natal Uranus (Uranus Opposition) - exact Dec 2020"
3. See: "Pluto square natal Libra placements"
4. See phase: "Release + Stress" - break conditions active
5. Narrative: "When containment meets unsustainable pressure, structures reach breaking points..."

---

## Summary of Deliverables

1. **Date Explorer** - Enter any date, see active transits
2. **Life Event Tags** - Optionally enrich interpretation
3. **Individual Transit Windows** - Not giant clusters
4. **Milestone Integration** - Saturn return, Uranus opposition as clickable anchors
5. **Focused Modals** - Show one transit's story, not 10 years of data
6. **Story-Based Copy** - "During your Saturn return..." not just phase scores


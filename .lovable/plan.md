
# Integrate Rich Eclipse Content from Uploaded Data

## What's Missing (confirmed by codebase search)
The current `ECLIPSE_SERIES` in `EclipseEncyclopediaExplorer.tsx` has only a `description` field per eclipse. The uploaded file contains 7 additional per-eclipse fields, series-level `bigPicture` narratives, a `nodalEducation` teaching object, and 8 detailed `signProfiles` -- none of which exist in the app yet.

## Plan

### Step 1: Expand the EclipseEvent interface and populate all 25 eclipses
**File:** `src/components/narrative/EclipseEncyclopediaExplorer.tsx`

- Add optional fields to `EclipseEvent`: `title`, `nodalTheme`, `releasingThemes`, `buildingThemes`, `reflectionQuestions`, `aspects`, `sarosNote`
- Add `bigPicture` to the series object type
- Copy all the rich content from the uploaded file into every eclipse entry and series
- This is the bulk of the work -- it's a large data paste

### Step 2: Add the `nodalEducation` object
**File:** `src/components/narrative/EclipseEncyclopediaExplorer.tsx`

Export the `nodalEducation` constant (north/south teachings with headline, shortMeaning, deeperMeaning, howItFeels, guidance) so Module 1 can use it.

### Step 3: Show the new content in the UI

**Timeline cards** (`EclipseEncyclopediaExplorer.tsx`):
- Display `title` as a bold headline on each card
- Show `bigPicture` at the top of each series tab

**Module 1 — Nodal Direction** (`EclipseInterpretationLayer.tsx`):
- Replace generic nodal copy with the per-eclipse `nodalTheme`
- Use `nodalEducation` for the deeper teaching (howItFeels bullets, guidance quote)
- Show `releasingThemes` and `buildingThemes` as labeled bullet lists

**Module 6 — What To Do** (`EclipseInterpretationLayer.tsx`):
- Use `reflectionQuestions` as the journal prompt section (show all 3 instead of the single generated one)

**Module 4 — Natal Activations** (`EclipseInterpretationLayer.tsx`):
- If the eclipse has pre-written `aspects[]`, show them as supplemental context below the computed natal hits

**Education accordion** (`EclipseEncyclopediaExplorer.tsx`):
- Surface `sarosNote` when viewing the relevant eclipse (link to the Saros cycle section)

### Step 4: Sign profiles -- skip duplication
Your `signTeacher.ts` already has element/modality data. The uploaded `signProfiles` adds `coreQuestion`, `superpower`, and `shadow` which are unique. Rather than duplicating the whole profile system, we'll add these 3 fields to the sign teaching used in Module 2 (Sign Mechanics), pulling from a small lookup.

### Files changed
- `src/components/narrative/EclipseEncyclopediaExplorer.tsx` (interface expansion + data population + card UI + bigPicture display)
- `src/components/narrative/EclipseInterpretationLayer.tsx` (Modules 1, 4, 6 enrichment)

### What stays untouched
- `eclipseNodalGuard.ts` (normalization still runs on the enriched data)
- `eclipseAspects.ts` (computed natal hits remain independent)
- All other modules (2, 3, 5) continue working as-is

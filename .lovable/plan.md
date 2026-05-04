# Phase 1 — Promote Ask, Retire the Weak Narrative Tab

Move all natal-chart prose generation onto the Ask tab's Claude pipeline. Keep Natal Portrait (deterministic), Decoder (interactive), Sacred Script (structured directive), Solar Return, and Human Design as separate tabs.

## What changes for the user

- **Ask tab** gets two new Quick Topics:
  - **📖 Narrative** — long-form prose reading in 5 movements (Opening Portrait, The Inner World, How They Meet the World, The Long Arc, The Closing Truth).
  - **🔮 Sacred Directive** — fortune-cookie synthesis of Big Three + Saturn + North Node, using the existing strict Sacred Script rules.
- **Narrative tab** in `AstroCalendar` is removed from the top-level navigation. The Gemini-Flash `generate-narrative` engine and `GroundedNarrativeView` files stay on disk for one release (so existing bookmarks don't 404), but the entry point and tab button are gone.
- Natal Portrait, Decoder, Sacred Script, Solar Return, Human Design tabs: **unchanged**.

## What changes technically

### `src/components/AskQuickTopics.tsx`
Add two entries to `QUICK_TOPICS`:

1. **`narrative`** — prompt instructs 5 prose "movements" (no section grid like Natal). Inherits all existing Ask rules automatically: EPHEMERIS FACT CHECK, ruler-chain enrichment, Hybrid Clarity Rule, retrograde post-correction, Behavior-First, Essence Opening, banned-phrase list, somatic felt-sense layers. Ends with the directive `The "question_type" in your JSON output MUST be exactly "narrative".`

2. **`sacred_directive`** — prompt mirrors the existing Sacred Script Final Directive synthesis logic (Big Three + Saturn + North Node fortune-cookie, ~120 words, plain language). Ends with `... MUST be exactly "sacred_directive".`

### `supabase/functions/ask-astrology/index.ts`
Register both new types in the `QT_TO_LABEL` map (line ~15291):
```
narrative: "Narrative",
sacred_directive: "Sacred Directive",
```
This makes PDF filenames + reading stamps correct. No other backend changes needed — the existing pipeline already handles arbitrary `question_type` values; the prompts carry their own structure.

### `src/components/AstroCalendar.tsx`
- Remove the "Narrative" tab button from the view-mode selector (~line 589).
- Remove the `viewMode === "narrative"` render branch (~line 1043).
- Remove the `viewMode === "narrative"` state/scroll branch (~line 198).
- Leave the `GroundedNarrativeView` lazy import file in place for one release; nothing references it after the tab button is gone.

### Memory updates
- New: `mem://features/ask-tab/narrative-reading-standards.md` — the 5-movement structure + voice rules.
- New: `mem://features/ask-tab/sacred-directive-reading-standards.md` — Big Three + Saturn + Node fortune-cookie rules.
- Update `mem://index.md` Memories list with both.

## Out of scope (Phase 2, only if you want it later)

A new Ask reading type **"Natal × Human Design"** that pulls the linked HD chart from `useUnifiedProfiles` (Type / Authority / Profile / defined centers) and weaves it into the natal narrative in one Claude call. This would deliver the "extra layer" without forcing HD into the natal hub UI. Not built in this phase.

## Files touched

- `src/components/AskQuickTopics.tsx` — add 2 QUICK_TOPICS entries
- `supabase/functions/ask-astrology/index.ts` — add 2 QT_TO_LABEL keys
- `src/components/AstroCalendar.tsx` — remove Narrative tab button + render branch
- `.lovable/memory/features/ask-tab/narrative-reading-standards.md` — new
- `.lovable/memory/features/ask-tab/sacred-directive-reading-standards.md` — new
- `.lovable/memory/index.md` — add 2 memory references

## Goal

Make the Ask tab work for two cases from a single, unified panel:
1. A question about a specific person's chart (current behavior).
2. A "General" question with no chart — just the live sky, optionally with a situation like "was driving to dinner, felt sudden dread, turned around."

Also: starting a new question must wipe the visible thread so the user only sees the answer to what they just asked.

## UI changes (`src/components/AskView.tsx`)

1. **Rename header**
   - "Ask About the Reading" → **"Ask a Question"**
   - Description: "Ask about a specific chart, or choose **General** for a no-chart reading of what the sky is doing right now."

2. **Add "General" to the chart dropdown** (top of the existing chart selector popover, above the starred user chart)
   - Label: `General — no chart, live sky only`
   - Selecting it sets `activeChartId = "general"`.
   - When `general` is active:
     - Hide the "Chart Context" gray box.
     - Hide `AskQuickTopics` (those are chart-specific).
     - Show a slim helper: "General mode — your question will be answered using only today's live sky (Moon, Void-of-Course, tightest aspects, fixed stars). Optionally describe what just happened."
     - The composer textarea placeholder becomes: *"What's going on? e.g. 'I was driving to dinner and suddenly felt I had to turn around.' Leave blank to just read today's sky."*
     - The Send button routes to the `ask-sky-today` edge function (same one already wired to "Read the Sky Right Now"), passing the textarea content as `userSituation`. The response is appended as an assistant entry in the normal chat thread.

3. **Remove the standalone amber "Today's Cosmic Weather (General)" card**
   - Its function is now folded into the General option of the unified Ask panel, which matches the user's mental model ("dropdown should include General").
   - Keep `handleSkyToday` and `skyReading` state, but render the result as a normal assistant chat entry instead of a separate amber card.

4. **Auto-clear thread on new question**
   - Today: submitting a question appends to `entries`, so the new answer shows below all old Q&A.
   - Change: before sending a new question (both chart questions and General), call the existing `startNewQuestion` flow (which archives the current thread to history and resets `entries = []`), then append the new user message and stream the answer.
   - Net effect: after submit, the panel shows only the latest question + its answer. Older threads remain accessible via the History button.
   - The existing manual "New" and "Clear" buttons stay for explicit control.

## Behavior matrix

| Dropdown selection | Quick Topics | Chart context box | Submit routes to |
|---|---|---|---|
| General | hidden | hidden | `ask-sky-today` |
| User / saved chart | shown | shown | `ask-astrology` (existing) |

## Out of scope

- No edge-function changes; `ask-sky-today` already accepts an optional situation.
- No history/storage schema changes.
- No styling overhaul beyond the rename, the new dropdown row, and removing the amber card.

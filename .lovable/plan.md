# Fix the "internal error" message

## What I checked first

- No errors were recorded in the app itself, and no failed requests were captured.
- The backend is healthy (sign-in and database both responding).
- Nothing was sent to the reading generator today, and no reading requests appear in the last 24 hours. Only chart saving and loading activity shows up.
- The words "internal error" do not exist anywhere in the app's own text.

So the message almost certainly comes from outside the app's own wording: either the reading service returning a raw failure, or the page failing before it can send anything. That needs to be pinned down before changing behavior, so step 1 is reproduction, not a guess.

## Plan

1. Reproduce it directly
   - Open the family / Parent-Child flow (the section most recently worked on) with two real saved people and run a reading, capturing the exact request and response.
   - If the reading succeeds, run the same check on the other generated readings (chart questions, birthday report, tarot, Vedic) until the exact failing screen is found.

2. Show the real reason instead of a bare error
   - Wherever a reading request fails, display the actual cause in plain words: out of credits, request timed out, missing birth time, or a service hiccup, plus a "Try again" button.
   - Keep a copy of the technical detail in the developer log so future failures are diagnosable in one step.

3. Fix the root cause found in step 1
   - If it is a timeout on long readings: retry automatically and keep the request under the time limit.
   - If it is missing or incomplete chart details: block the button with a clear note about what is missing rather than failing mid-generation.
   - If it is a credit or service limit: show that specific message with what to do next.

4. Retest
   - Re-run the same reading twice after the fix and confirm it completes, and confirm a deliberately broken request now shows a readable message rather than "internal error".

## Technical notes

- Client entry points: `src/components/family/FamilyTab.tsx` (invokes `family-pair-reading`), plus the other `supabase.functions.invoke` call sites for readings.
- `supabase/functions/family-pair-reading/index.ts` already returns structured JSON errors with status 402/500, so a literal "internal error" string points to a platform-level worker failure (boot/timeout) or an unhandled client exception, not to these handlers.
- Add a shared error mapper for `FunctionsHttpError` / `FunctionsFetchError` so status codes and JSON `error` fields surface in the toast instead of a generic fallback.
- Verification: live invoke with real `device_charts` rows, plus a typecheck.

## If you can tell me the screen

Naming the screen and the button you pressed would let me skip straight to step 3 instead of hunting through each reading type.

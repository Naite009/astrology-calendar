I agree this should not still be recurring. The uploaded JSON shows the current failure is not the old Solar Return-only report issue; it is the career reading's “Solar Return Career Indicators” section saying SR Jupiter and SR Mercury are retrograde while the exported placement table marks both direct. The post-gate safety pass only stripped one of the Jupiter instances, leaving other prose and bullet instances behind.

Plan:

1. Fix the SR retrograde prose cleaner so it catches this exact pattern
   - Target: `supabase/functions/ask-astrology/index.ts` only.
   - Update `fixSrRetrogradeMentionsInProse` so it removes false SR retrograde claims in all common forms:
     - `SR Jupiter at ... in SR House 10 retrograde`
     - `SR Jupiter ... in SR House 10 retrograde`
     - `Jupiter retrograde in the SR 10th house` inside an SR-titled section
     - bullet text like `(SR Jupiter retrograde at 15°06' Cancer...)`
     - bare `Mercury retrograde` inside “Solar Return Career Indicators” sections.
   - Keep the cleaner source-of-truth based on the SR placement table / SR context. It should strip retrograde only when that SR planet is direct.

2. Re-run the cleanup after every gate mutation, not only before/after the gate
   - The external gate can mutate wording and apply its own fixes, then the final payload is assembled.
   - Make sure the deterministic SR retrograde cleaner runs after the final gate verdict and before the exported result is saved.
   - This prevents a gate mutation or late retry path from reintroducing prose/table mismatch.

3. Stop relationship-only retrograde repair from touching non-relationship readings
   - The uploaded career JSON includes `_relationship_contract` and `_retrograde_repair`, which should not be running on a career reading.
   - Guard `acknowledgeRelationshipRetrogrades` and `enforceRelationshipContract` so they only run when `question_type === "relationship"`.
   - This prevents unrelated retrograde logic from injecting or auditing relationship rules into career/natal/SR reports.

4. Add one narrow timing description cleanup while we are in the same backend function
   - The uploaded JSON still shows timing descriptions repeating the same phrase:
     - “touches how you present…” then “A pattern around how you present…”
   - Expand the existing `dedupeTimingWindowRestatement` pattern to catch `A pattern around`, `Expansion around`, `Something concrete around`, `A small but real commitment around`, and similar second-sentence openers.
   - This is deterministic cleanup only; no UI or gate changes.

5. Verify against the uploaded failure shape
   - Confirm the code path will strip all three uploaded gate defects:
     - `$.sections[6].body` Jupiter
     - `$.sections[6].body` Mercury
     - `$.sections[6].bullets[0].text` Jupiter
   - Confirm the post-gate safety log would contain `sr_retrograde_corrected_in_prose` with more than one correction when this failure appears.
   - Deploy the `ask-astrology` backend function.

Scope limits:
- No UI changes.
- No database/schema changes.
- No external gate/validation pipeline changes.
- No prompt-only fix; this needs deterministic cleanup because the prompt has already failed multiple times.
- Do not change unrelated reading generation behavior beyond guarding relationship-only logic from non-relationship reports.
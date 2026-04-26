I agree: the repeated fixes are symptoms of the same architectural problem. The system has too many partial correctors, each trying to patch one wording pattern after generation. The permanent fix should be an audit plus a single canonical fact-enforcement layer that owns planet facts, table facts, prose facts, and gate readiness.

Plan:

1. Build a fact-flow audit for Ask readings
   - Trace every path that creates, mutates, or validates these facts:
     - natal/SR sign, degree, house, retrograde state
     - placement tables
     - timing window descriptions
     - gate result and post-gate safety pass
   - Confirm which logic runs client-side in `AskView.tsx` and which runs server-side in `ask-astrology`.
   - Produce an internal audit list of duplicated or drift-prone helpers so we stop adding one-off regex patches.

2. Create one canonical chart facts object in the backend function
   - In `supabase/functions/ask-astrology/index.ts`, derive a single `ChartFacts` object from `chartContext` once per reading:
     - `natal.planets[planet] = sign, degree, minutes, house, retrograde`
     - `solarReturn.planets[planet] = sign, degree, minutes, house, retrograde`
     - natal/SR angles and house cusps
   - Use this object as the only source of truth for downstream cleanup.
   - Include a small diagnostic summary in `_validation_log` when facts are incomplete, so missing SR context is visible instead of silently becoming false/direct.

3. Replace the whack-a-mole SR/natal retrograde cleaner with a fact-aware consistency pass
   - Instead of relying only on specific patterns like `SR Jupiter retrograde` or `SR Jupiter ... is retrograde`, walk every user-visible string field (`body`, `text`, `label`, `title`, `subtitle`, `heading`, summary items, timing descriptions).
   - Detect planet mentions with chart context:
     - explicit SR/Solar Return/this year = SR fact
     - explicit natal/your natal = natal fact
     - SR-titled sections = default to SR for bare planet mentions
     - otherwise default to natal
   - For every detected direct/retrograde claim:
     - strip false retrograde claims when the fact says direct
     - flip false direct claims when the fact says retrograde
     - normalize table rows to match the same fact object
   - This covers the current career failure (`SR Jupiter at ... retrograde`, `Jupiter retrograde in the SR 10th house`, bullet text) without adding another narrow regex-only patch.

4. Ensure required fact tables are present before the gate
   - If a reading discusses Solar Return planets and SR facts exist, deterministically inject or repair a `Solar Return Key Placements` table before the gate.
   - If a table already exists, overwrite its planet/sign/degree/house/retrograde fields from `ChartFacts`.
   - Fix the client-side `correctPlacementData` gap where it appends the `℞` glyph but does not set `row.retrograde = truth.isRetrograde`; that means exports can still contain visual/table boolean mismatches.

5. Add an internal pre-gate mirror audit for gate-style defects
   - Before calling the external gate, run a local audit for the recurring defect classes:
     - `RETROGRADE_STATE_MISMATCH`
     - natal/SR position bleed
     - missing SR placement table when SR prose exists
     - timing restatement pattern
     - relationship-only contract leaking into non-relationship readings
   - If the local audit finds deterministic fixable issues, repair once and re-audit before sending to the gate.
   - Do not rely on the external gate as the first time we discover these issues.

6. Consolidate cleanup ordering into one pipeline
   - Keep one shared pipeline that runs:
     - before gate
     - after any gate retry/mutation
     - immediately before persistence
   - Remove or stop using duplicate inline calls where possible so a fix cannot run on one path but not another.
   - Relationship-only logic remains hard-guarded to `question_type === "relationship"`.

7. Add targeted regression tests / scripts for the exact failure shapes
   - Add lightweight tests or a script fixture for the uploaded Ben career failure shape:
     - SR Jupiter direct/prose says retrograde
     - SR Mercury direct/prose says retrograde
     - bullet text says `(SR Jupiter retrograde...)`
     - SR section has no SR placement table
     - non-relationship reading contains `_relationship_contract`
   - Also test the opposite case from earlier: SR Mercury/Jupiter truly retrograde in source data must not be stripped.
   - These tests will fail before the fix and pass after it, preventing the same issue from returning.

Technical notes:
- Target files:
  - `supabase/functions/ask-astrology/index.ts`
  - `src/components/AskView.tsx` only for the client-side `row.retrograde` boolean correction gap
  - optional test/script file if the repo has an existing test pattern; otherwise a small local audit script can be added under a dev/test location
- No UI redesign.
- No database schema change.
- No external gate change.
- The goal is not a bigger prompt. Prompts can remain, but deterministic facts must be the final authority.

Expected outcome:
- New readings cannot ship prose/table retrograde disagreement when the chart facts are present.
- Career, solar_return, natal, money, health, relationship, relocation, and future reading types all pass through the same fact-enforcement layer.
- The next time a gate-style issue occurs, `_validation_log` / `_post_gate_safety` will show whether the fact source was missing or which deterministic repair ran, instead of leaving us guessing.
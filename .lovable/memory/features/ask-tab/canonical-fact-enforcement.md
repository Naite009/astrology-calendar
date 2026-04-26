---
name: Canonical fact-enforcement layer for Ask readings
description: Single source of truth for natal/SR retrograde, sign, degree, house. factsAwareRetrogradeSweep + runPreGateLocalAudit own prose ↔ chart-fact agreement. No more pattern-per-failure regex patches.
type: feature
---
The recurring `RETROGRADE_STATE_MISMATCH` defects from the external Replit gate were the result of pattern-by-pattern regex correctors (`fixSrRetrogradeMentionsInProse`, `fixNatalRetrogradeMentionsInProse`) that always lagged behind whatever new wording the model emitted. The permanent fix lives in `supabase/functions/ask-astrology/index.ts`:

1. **`factsAwareRetrogradeSweep(parsedContent, chartContext, log)`** is THE canonical retrograde reconciler. It:
   - Parses both NATAL and SR planetary positions from `chartContext` (via `parsePositionsFromContext`) into `natalRetro` and `srRetro` truth maps.
   - Walks every visible string field (skipping only structural keys: `type`/`id`/`planet`/`sign`/`house`/`degrees`/`aspect`/`symbol`/internal `_*` keys).
   - Splits each string into clauses on sentence terminators and em/en dashes.
   - For every clause that mentions a known planet, decides natal vs SR by: explicit `SR`/`Solar Return`/`this year('s)` qualifier → SR; explicit `natal`/`your natal` → natal; section title contains "Solar Return" or "SR " → SR; otherwise natal default.
   - If fact says direct, it strips false retrograde claims in any shape (`Planet retrograde`, `Planet Rx`, `Planet ℞`, `Planet ... is retrograde`, `Planet ... retrograde at <degree>`, `Planet ... retrograde in the Nth`).
   - If fact says retrograde, it flips false `Planet direct` / `Planet is direct` claims to `Planet retrograde`.

2. **`runPreGateLocalAudit(parsedContent, chartContext, log)`** mirrors the recurring external-gate defect classes (RETROGRADE_STATE_MISMATCH, MISSING_SR_PLACEMENT_TABLE, RELATIONSHIP_CONTRACT_ON_NON_RELATIONSHIP_READING) and writes findings to `_validation_log` with type `pre_gate_local_audit`. Diagnostic only — repair is the sweep's job.

3. Both run inside `runPostProcessingPipeline` (steps 5c and 12) so they execute at every site that pipeline runs: pre-gate AND post-gate. The legacy `fixSrRetrogradeMentionsInProse` / `fixNatalRetrogradeMentionsInProse` are kept as belt-and-braces but the canonical sweep gets the final say because it runs last.

4. **Client side**: `correctPlacementData` in `src/components/AskView.tsx` MUST set `row.retrograde = !!truth.isRetrograde` whenever it touches a placement_table row. Without this, the visual `℞` glyph and the JSON boolean can disagree — that disagreement is exactly the shape the gate raises.

Rule for future failures: do NOT add another narrow regex pattern to the legacy correctors. If a wording variant slips through, EITHER the chart facts are missing (check `pre_gate_local_audit` for `sr_facts_present: false`) OR the planet-detection regex in `factsAwareRetrogradeSweep` needs broadening — fix it in one place, not by adding another corrector.

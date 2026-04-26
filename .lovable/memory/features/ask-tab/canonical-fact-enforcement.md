---
name: Canonical fact-enforcement layer for Ask readings
description: Single source of truth for natal/SR retrograde, sign, degree, AND house. factsAwareRetrogradeSweep + runPreGateLocalAudit own prose ↔ chart-fact agreement. Sweep also rewrites wrong house claims (e.g. "SR Mercury in the 5th house" when fact says SR 6th).
type: feature
---
The recurring `RETROGRADE_STATE_MISMATCH` defects from the external Replit gate were the result of pattern-by-pattern regex correctors (`fixSrRetrogradeMentionsInProse`, `fixNatalRetrogradeMentionsInProse`) that always lagged behind whatever new wording the model emitted. The permanent fix lives in `supabase/functions/ask-astrology/index.ts`:

1. **`factsAwareRetrogradeSweep(parsedContent, chartContext, log)`** is THE canonical reconciler for retrograde AND house claims. It:
   - Parses both NATAL and SR planetary positions from `chartContext` (via `parsePositionsFromContext`) into `natalRetro`/`srRetro` truth maps AND `natalHouse`/`srHouse` truth maps. House maps only include planets whose chart-context line carried a house number (so we never invent a house when birth time is missing).
   - Walks every visible string field (skipping only structural keys: `type`/`id`/`planet`/`sign`/`house`/`degrees`/`aspect`/`symbol`/internal `_*` keys).
   - Splits each string into clauses on sentence terminators and em/en dashes.
   - For every clause that mentions a known planet, decides natal vs SR by: explicit `SR`/`Solar Return`/`this year('s)` qualifier → SR; explicit `natal`/`your natal` → natal; section title contains "Solar Return" or "SR " → SR; otherwise natal default.
   - **House verification** (runs first, regardless of retrograde state): three patterns cover the common house-claim shapes:
     - Pattern A: `"<Planet> ... in the [SR|natal]? <ord> house"` (e.g. "Mercury in the 5th house", "SR Mercury in the fifth house")
     - Pattern B: `"<Planet> ... house <number>"` (e.g. "Mercury ... house 5")
     - Pattern C: `"<Planet> ... in the <ord>"` terminal (e.g. "Mercury sits in the 5th") — only when not followed by `house`/`sign`
     If the claimed house disagrees with the truth map, the ordinal/number is rewritten in place to the correct house. Counter: `corrected_house_claims`. House examples logged to `_validation_log.facts_aware_retrograde_sweep.house_examples`.
   - **Retrograde verification** (runs after): if fact says direct, it strips false retrograde claims in any shape (`Planet retrograde`, `Planet Rx`, `Planet ℞`, `Planet ... is retrograde`, `Planet ... retrograde at <degree>`, `Planet ... retrograde in the Nth`). If fact says retrograde, it flips false `Planet direct` / `Planet is direct` claims to `Planet retrograde`.
   - The sweep ONLY repairs incorrect claims. It does NOT inject acknowledgment when the model is silent — that gap is closed by BASE RULE 9 in the prompt (see #5).

2. **`runPreGateLocalAudit(parsedContent, chartContext, log)`** mirrors the recurring external-gate defect classes (RETROGRADE_STATE_MISMATCH, MISSING_SR_PLACEMENT_TABLE, RELATIONSHIP_CONTRACT_ON_NON_RELATIONSHIP_READING) and writes findings to `_validation_log` with type `pre_gate_local_audit`. Diagnostic only — repair is the sweep's job.

3. Both run inside `runPostProcessingPipeline` (steps 5c and 12) so they execute at every site that pipeline runs: pre-gate AND post-gate. The legacy `fixSrRetrogradeMentionsInProse` / `fixNatalRetrogradeMentionsInProse` are kept as belt-and-braces but the canonical sweep gets the final say because it runs last.

4. **Client side**: `correctPlacementData` in `src/components/AskView.tsx` MUST set `row.retrograde = !!truth.isRetrograde` whenever it touches a placement_table row. Without this, the visual `℞` glyph and the JSON boolean can disagree — that disagreement is exactly the shape the gate raises.

5. **Prompt-side acknowledgment (BASE RULE 9)**: in the SYSTEM_PROMPT's UNIVERSAL READING TYPE BASE block, BASE RULE 9 (UNIVERSAL SR RETROGRADE ACKNOWLEDGMENT) requires every reading type — career, money, health, relationship, relocation, spiritual, timing, general, solar_return — to write one plain-English sentence acknowledging any SR planet marked retrograde in the SR placement table. The career, money, and health templates each carry a per-type reinforcement (e.g. "CAREER SR MERCURY RETROGRADE RULE") naming the canonical SR Mercury / SR Saturn / SR Jupiter / SR Mars / SR Venus cases and where the acknowledgment must land. This is the prompt-side pair to the post-processor sweep — together they guarantee the prose mentions retrograde when the table says retrograde, and never contradicts it.

Rule for future failures:
- If a wording variant says retrograde when the table says direct (or vice versa), do NOT add another narrow regex pattern to the legacy correctors. EITHER the chart facts are missing (check `pre_gate_local_audit` for `sr_facts_present: false`) OR the planet-detection regex in `factsAwareRetrogradeSweep` needs broadening — fix it in one place.
- If the prose names a wrong house number, do NOT add a per-section corrector — broaden one of the three house patterns (A/B/C) inside `factsAwareRetrogradeSweep`.
- If the prose silently OMITS a required retrograde acknowledgment, the fix is BASE RULE 9 (or its per-type reinforcement) — strengthen the rule, do not add a post-processor injection step.

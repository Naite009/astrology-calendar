## Goal

Give `question_type === "narrative"` its own dedicated system prompt and routing path inside `supabase/functions/ask-astrology/index.ts`, sharing nothing with the relationship 3-call orchestrator beyond BASE RULES 1–10 (the universal voice/behavior rules already at the top of `SYSTEM_PROMPT`) and the natal facts injection. The Quick Topic prompt that currently lives client-side moves server-side as the source of truth.

## Confirmed before starting

- `enforceRelationshipContract` is already gated by `isRelationshipReading === "relationship"` (line 14486) — narrative naturally never hits it. Existing positive check is sufficient.
- The 3-call relationship orchestrator (line 12837) is gated by `isRelationshipQuestion`, which is keyword-scored from the question text. Narrative Quick Topic text (`"NARRATIVE PORTRAIT"`) does not score on relationship keywords, so the 3-call path is already unreachable. We will additionally short-circuit explicitly for safety.
- `ensureSolarReturnPlacementTable` (line 8150) and `injectDeterministicModalityElement` (line 8168) currently run for every reading. These need explicit narrative skips.
- The system prompt sent to Anthropic is built at line 12774 (`text: SYSTEM_PROMPT`). This is where we branch.

## Changes

### 1. New `NARRATIVE_SYSTEM_PROMPT` constant — `supabase/functions/ask-astrology/index.ts`

Define it adjacent to `SYSTEM_PROMPT` (around line 10973). Initial body composition:

```text
[BASE_RULES_BLOCK from SYSTEM_PROMPT]   ← shared voice/behavior rules
+
[NARRATIVE-SPECIFIC BODY]               ← lifted verbatim from
                                          AskQuickTopics.tsx lines 88–110,
                                          rewritten as system-voice.
+
[HARD STRUCTURAL CONTRACT]              ← bullet list of the user's exact
                                          routing rules (5 narrative_section
                                          titles in order, single placement_table
                                          "Natal Key Placements", single
                                          summary_box "The Chart in One Breath"
                                          with one item "Truth", NO timing,
                                          NO SR sections, NO relationship
                                          sections, NO elemental balance,
                                          question_type MUST be "narrative").
```

Implementation: extract the BASE RULES block once into a `BASE_RULES_BLOCK` const, then both `SYSTEM_PROMPT` and `NARRATIVE_SYSTEM_PROMPT` reference it. (Concretely: BASE_RULES_BLOCK = lines 10973–11038 minus SR/career/timing-specific sentences; the SR-specific rule blocks stay in `SYSTEM_PROMPT` only.)

### 2. Early narrative detection + dispatcher branch

Around line 12379 (where `normalizedQuestion` and `isRelationshipQuestion` are derived), add:

```ts
// Read the explicit prompt directive — same regex used in the final-gate
// filename stamp (line 15318) so detection is consistent end-to-end.
const directiveRe = /question_type"?\s*[^"]{0,40}?MUST\s+be\s+exactly\s+"([a-z_]+)"/i;
let directiveQt: string | null = null;
for (const m of messages) {
  if (m?.role !== "user") continue;
  const dm = directiveRe.exec(typeof m.content === "string" ? m.content : "");
  if (dm?.[1]) directiveQt = dm[1].toLowerCase().trim();
}
const isNarrativeQuestion = directiveQt === "narrative";

// Hard short-circuit: narrative cannot enter the 3-call relationship path.
const isRelationshipQuestion =
  !isNarrativeQuestion && /* existing scoring expression */;
```

### 3. System-prompt branch at the Anthropic call site

At line 12774, replace the unconditional `text: SYSTEM_PROMPT` with:

```ts
systemBlocks.push({
  type: "text",
  text: isNarrativeQuestion ? NARRATIVE_SYSTEM_PROMPT : SYSTEM_PROMPT,
  cache_control: { type: "ephemeral" },
});
```

`perQuestionTail` and `chartScopedRules` already contain only generic chart-scoped guidance (no SR-specific or relationship-specific copy), so they remain compatible with the narrative branch and are kept as-is.

### 4. Gate post-processing passes that shouldn't run on narrative

In `runPostProcessingPipeline` (line 8126), thread the question_type through and skip the two passes that would inject forbidden sections:

```ts
const qt = String(parsedContent?.question_type || "").toLowerCase();

// 0. SR placement table injector — skip on narrative.
if (qt !== "narrative") {
  safeRun("ensureSolarReturnPlacementTable", () =>
    ensureSolarReturnPlacementTable(parsedContent, ctx, log));
}

// 2. Deterministic modality/element section — skip on narrative.
if (qt !== "narrative") {
  safeRun("injectDeterministicModalityElement", () => { ... });
  safeRun("correctModalityElementBodyClaims", () => ...);
}
```

All other passes (retrograde normalization, descendant cusp fixer, natal retrograde acknowledgment, dedupe, etc.) are universal cleanup and continue to run on narrative — they only repair what is already there, never inject forbidden sections.

### 5. QT_TO_LABEL — already correct

`QT_TO_LABEL["narrative"] = "Narrative"` already exists (line 15301). Final-gate filename stamp already handles narrative. No change.

### 6. Slim down the client-side Quick Topic — `src/components/AskQuickTopics.tsx`

Replace the 30-line narrative prompt body (lines 88–110) with a thin user message:

```text
Generate a NARRATIVE PORTRAIT for {name}, born {date} at {time} in {loc}.
Today is {today()}. The "question_type" in your JSON output MUST be exactly "narrative".
```

All structural + voice rules now live server-side in `NARRATIVE_SYSTEM_PROMPT`.

### 7. Memory update — `.lovable/memory/features/ask-tab/narrative-reading-standards.md`

Append a "Routing Isolation" section recording:
- Narrative has its own `NARRATIVE_SYSTEM_PROMPT` constant + dedicated dispatcher branch.
- `isRelationshipQuestion` is short-circuited to `false` when `isNarrativeQuestion` is true.
- `ensureSolarReturnPlacementTable` and `injectDeterministicModalityElement` are explicitly skipped for narrative.
- Shares only BASE_RULES_BLOCK + natal facts injection with other reading types.
- Quick Topic message is intentionally thin; rules live server-side.

## Confirmation grep before deploy

After implementing, I will run these greps and paste results back to you. All four conditions must be visibly proven in the diffs:

```text
1. enforceRelationshipContract gated to "relationship" only:
   rg -n 'enforceRelationshipContract\(' supabase/functions/ask-astrology/index.ts
   → must show single call site wrapped in `if (isRelationshipReading)` where
     isRelationshipReading === question_type === "relationship".

2. 3-call relationship orchestrator unreachable for narrative:
   rg -n 'if \(isRelationshipQuestion' supabase/functions/ask-astrology/index.ts
   → AND `isRelationshipQuestion` definition must include `!isNarrativeQuestion`.

3. SR placement table audit + timing/element pre-compute skipped:
   rg -n 'ensureSolarReturnPlacementTable\(|injectDeterministicModalityElement\('
   → both call sites must be inside `if (qt !== "narrative")`.

4. Narrative system prompt dispatch:
   rg -n 'NARRATIVE_SYSTEM_PROMPT' supabase/functions/ask-astrology/index.ts
   → must show the const definition AND the conditional in the systemBlocks
     push (`isNarrativeQuestion ? NARRATIVE_SYSTEM_PROMPT : SYSTEM_PROMPT`).
```

If any condition fails, I fix and re-grep before deploy. Only deploy after all four pass. After deploy I will report grep results and wait — no test request.

## Files touched

- `supabase/functions/ask-astrology/index.ts` — extract `BASE_RULES_BLOCK`, add `NARRATIVE_SYSTEM_PROMPT`, add `isNarrativeQuestion` detection + short-circuit, branch system-prompt selection, skip two post-process passes for narrative.
- `src/components/AskQuickTopics.tsx` — slim narrative Quick Topic prompt body.
- `.lovable/memory/features/ask-tab/narrative-reading-standards.md` — append Routing Isolation section.

## Not touching

- `enforceRelationshipContract` body (already correctly gated).
- `sacred_directive` routing.
- The 3-call relationship orchestrator code path itself.
- Any SR / timing / elemental computation modules.

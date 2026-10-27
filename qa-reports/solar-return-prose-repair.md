# Solar Return implementation audit, October 27, 2026

## Exact source and active paths

The reported paragraph was generated literally by `buildSolarReturnEvidenceSynthesis()` in `src/lib/solarReturnEvidenceSynthesis.ts`. It concatenated the natal house `attention` and `focus` fields from `psychologicalFunctions.ts`, then appended an invented conflict disclaimer. This was deterministic copy, not a spontaneous model sentence.

`VerifiedYearSynthesis` displays that helper's output. `buildFullJsonStandalone()` in `SolarReturnPDFExport.tsx` exports it as `prioritizedSynthesis`. `generate-sr-ai-reading` supplied those strings to the model and reused them as a fallback when model prose failed validation. Thus the same defect contaminated display, model context, JSON and fallback output.

The separate `SRNarrativeBox` called `generate-sr-narrative`, which had another prompt and explicitly demanded a profection/time-lord conflict, even without supporting evidence. That author also lacked the canonical report/fact validation. It now calls `fetchReading()` with the same full report as the modal and exports only accepted text to its narrative PDF. The legacy endpoint is a compatibility delegate requiring a full report, with no independent model prompt.

`solarReturnYearStory.ts` separately generated the opening, themes and closing in year-story PDFs. Its short keyword-only house summaries and meta-opening/closing now reuse the concrete client-meaning source. Calculation scoring remains unchanged.

## Changed files

- `src/lib/solarReturnClientMeaning.ts`: new reusable translation of verified house and time-lord routes into life areas, possible behaviors, change and relevance. Not a hard-coded client paragraph.
- `src/lib/solarReturnEvidenceSynthesis.ts`: removes keyword concatenation and conflict disclaimer; separates Sun/Moon meaning; includes angular emphasis; retains source labels, exact evidence, and separate progression context. Rejects deterministic meanings that fail the shared gate instead of replacing an aspect with a generic house claim.
- `src/lib/solarReturnYearStory.ts`: PDF opening, summary and closing use the shared concrete translations, preserving ranked evidence and calculation scoring.
- `supabase/functions/_shared/solarReturnProseQuality.ts`: single SR authoring contract, paragraph-level banned-language/second-person/observable-verb-object checks, and one regeneration with the same facts followed by fail-closed withholding.
- `supabase/functions/_shared/solarReturnReportValidation.ts`: adds quality validation to existing reading checks; factual report rules are unchanged.
- `supabase/functions/generate-sr-ai-reading/index.ts`: removes unused competing prompt builders, replaces active vague bridge instructions, removes deterministic fallback, checks facts and quality on both attempts, validates signed-in callers, retains Gemini 3.1 Pro Preview and source labels.
- `supabase/functions/generate-sr-narrative/index.ts`: compatibility delegate to canonical guarded author.
- `src/components/solarReturn/AiReadingModal.tsx`: sends current signed-in session; retains final browser fact and quality checks before display/download.
- `src/components/SolarReturnView.tsx`: standalone narrative uses the same full-report author and validation as modal/export readings.
- `src/lib/__tests__/solarReturnProseQuality.test.ts`: 34 cases, including reported paragraph, seven banned bridges, nine distinct profection/time-lord combinations, all twelve houses across ten planets, retry/fact rejection, Lauren UI/JSON/PDF parity.
- `src/lib/__tests__/interpretationStandard.test.ts`: classifies the retired author as plumbing and checks delegation instead of demanding a duplicate prompt.
- `AGENTS.md`, `roadmap.md`, existing Solar Return memory: canonical source and verification status.

## Before and after

Before: “Attention may return to questions, words, school or everyday information ... The point is how those areas meet in actual choices, not that one cancels the other.”

After, third-house profection with Jupiter in SR ninth: “This year, your conversations and everyday learning may need more attention. You might study a skill, write more, or ask clearer questions in a conversation; pursuing that could also lead you to take a course, plan a trip, or compare a belief with what you learn. You may want to learn more or take on a bigger plan here, with time and cost worth checking, helping you use what you learn to make better daily decisions.”

This is explicitly a deterministic possible-expression example, not a certified future event or accepted AI reading.

## Verification and limits

- Relevant suite passed: 167 tests across four files (quality, integrity, Gina, interpretation standard).
- Full suite passed: 737 tests across 40 files; final minor grammar/source refinements rerun in the same task.
- Deployed both reading functions; preview compilation logs showed `build OK`.
- Signed-in Lauren account: inspected actual saved 2026 Solar Return UI and screenshot. Corrected third/ninth-house text appears above the detailed tabs, with Whole Sign profection, Placidus note, source labels and exact evidence intact. Initial navigation was reset during cloud restoration; a second click reached the real page.
- Live authenticated client/function request with Lauren's reference fixture ran both generation attempts. Final text was withheld for incorrect mixed-layer position claims and two paragraphs without observable meaning. This verifies rejection/retry behavior, not successful AI authoring. No accepted fresh AI reading is claimed.
- The paragraph gate is a conservative lexical heuristic, not a universal semantic proof. It can reject legitimate unfamiliar expressions and cannot establish all causal meaning or catch every invented implication. Legacy detailed planet libraries and third-party PDF rendering have not been universally certified by this pass. No calculation engine, cusp, longitude, orb or source-label validation was relaxed.
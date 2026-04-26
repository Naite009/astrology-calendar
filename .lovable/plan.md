I agree with the direction, but not with a prompt-only version. The evidence shows the prompt already contains general SR bleed constraints and anti-restatement rules, yet the generated JSON still leaks. So the reliable fix should be narrow and deterministic where possible, limited to the Solar Return reading path/output cleanup.

Plan:

1. Keep scope to the ask-astrology backend only
   - No UI changes.
   - No gate/validator changes.
   - No schema changes.
   - No changes to unrelated reading types.
   - Target file: `supabase/functions/ask-astrology/index.ts`.

2. Strengthen the Solar Return prompt with Ben-specific hard constraints
   - In the `solar_return` prompt block, add explicit named values exactly as requested:
     - natal Venus = `0°54' Sagittarius`
     - natal Mercury = `16°56' Libra`
     - natal Jupiter = `29°34' Taurus`
   - Make clear these are chart-specific hard constraints for this report when those values appear in the natal table, and that SR values must never be substituted for natal values.
   - Keep the existing general table-verification rule for all other users/charts.

3. Add deterministic cleanup for natal/SR position bleed that catches the actual surviving phrasing
   - The current corrector only catches a narrow pattern like `natal Venus at 9°15' Libra`.
   - Expand it to also catch common prose variants such as:
     - `natal Venus is 9°15' Libra`
     - `your Venus is 9°15' Libra` in a solar_return comparison context
     - `Venus at 9°15' Libra` when the surrounding sentence clearly says natal/baseline/permanent chart
   - Rewrite the wrong degree/sign from the deterministic natal chart context, not from hardcoded text.
   - This is the real backstop for the gate repeatedly correcting lines 29, 32, 33, 34.

4. Add deterministic timing-window anti-restatement cleanup
   - Add a narrow post-processing pass for `timing_section` descriptions only.
   - Detect when sentence 2 repeats the key phrase from sentence 1 after words like `touches your...` / `Pressure builds around your...`.
   - Replace or trim the duplicate theme restatement so the entry keeps:
     - sentence 1: transit + natal point
     - sentence 2: concrete scenario only
   - Keep this pass limited to timing window descriptions so it cannot rewrite narrative sections broadly.

5. Add subtitle contamination cleanup
   - Add a small sanitizer for section `subtitle` fields.
   - Strip parenthetical interpretive/aspect-description fragments from subtitles, especially patterns like:
     - `SR Jupiter ( — meaning, faith, and growth get worked out privately before being expressed outwardly) in Cancer · SR 11th House`
   - Preserve only clean placement metadata: planet, sign, and house text.
   - Do not touch section bodies or titles for this fix.

6. Address SR retrograde omissions in Solar Return prose
   - The existing SR retrograde pass corrects false/direct contradictions, but it does not force acknowledgment when SR planets are retrograde.
   - Add a Solar Return prompt rule requiring retrograde acknowledgment for any SR planet marked retrograde in the SR placement table.
   - If a deterministic nudge is safe, add it only to SR planet-focal sections where the section is already about that planet; otherwise leave this as prompt-only to avoid injecting awkward text into unrelated sections.

7. Verify with targeted static checks after implementation
   - Confirm the prompt contains the explicit Ben values.
   - Confirm the new/expanded deterministic passes run in both pre-gate and post-gate cleanup paths.
   - Confirm no UI files, schema files, or validation/gate files were changed.

Expected result after regeneration:
- The gate should no longer need to correct natal Venus/Mercury/Jupiter SR-position bleed.
- Timing windows should stop duplicating the same phrase in sentence 2.
- SR subtitles should not contain interpretive parenthetical fragments.
- SR retrograde planets should be acknowledged in prose when marked retrograde in the SR table.
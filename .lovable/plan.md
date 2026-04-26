## What I found (read the code, not just the symptoms)

**BASE RULE 10 did NOT regress in code.** I verified directly:
- The rule text is still in the shared base block at `supabase/functions/ask-astrology/index.ts:9107–9108`.
- All 11 inheritance lines + the forward-compat clause still read **"BASE RULES 1–10"** (relationship, relocation, career, health, money, natal, solar_return, spiritual, timing, general, plus the "any new question_type" forward-compat clause). I grepped — there is not a single remaining `BASE RULES 1–9`.
- The deterministic corrector `acknowledgeNatalRetrogradesFromContext` is still defined (lines 3531–3607) and still wired into `safeRun` at line 6439–6440.

So the "regression" is not the rule disappearing. It's something subtler, and it's a real bug. Two real problems, distinct from each other:

### Problem 1 — `acknowledgeNatalRetrogradesFromContext` has a too-lenient gate

The corrector's `hasAcknowledgment` regex at line 3577–3581 treats **any of `retrograde | Rx | R | ℞`** within 160 chars of the planet name as "already acknowledged." But BASE RULE 10 explicitly says *"A bare ℞ symbol is not enough — write one sentence explaining what that natal retrograde means for this person specifically."*

So when the AI writes `"your natal Venus ℞ in Aries colors how you receive…"` the corrector sees the `℞` symbol and skips injection. The Replit gate, which evaluates the prose as a human reader would, correctly flags it as a missing plain-language acknowledgment — and the gate's auto-fix list shows up as "natal Venus / Jupiter / Uranus retrograde omissions" *fixed*. That's what the user is seeing in the gate JSON. The local corrector never injected the proper sentence because its detector was satisfied by the symbol.

This is why it appeared to work last reading and not this one: it depends on whether the AI happened to write `"is retrograde"` (which is a plain-language phrase the gate accepts) vs. just `"℞"` (which the gate rejects). The local guardrail was supposed to be a backstop and it isn't backing up correctly.

**Fix:** tighten `hasAcknowledgment` so it only counts as "acknowledged" if there is a plain-language phrase (`retrograde`, `Rx`, or `R`) within range AND the sentence containing that match is at least ~10 words long (i.e., not just a placement-table cell or a parenthetical glyph). The bare `℞` and standalone `Rx` glyph in a label/cell should NOT satisfy the gate. If the only mention of "retrograde" within range is a single word in a glyph-style fragment, treat it as unacknowledged and inject the sentence from `NATAL_RX_ACK_BY_PLANET`.

I'll also add an emission log entry (`natal_retrograde_acknowledgment_injected` is already there but currently silent when count=0) so the next run shows which planets were checked and which got injected vs. skipped — that way the next time the user asks "did this fire?" it's visible in the emission list.

### Problem 2 — Natal Uranus position keeps being written wrong, and the post-corrector isn't catching it

The validation facts already include the canonical natal Uranus position (`positions[]` in `ValidationFacts` carries sign + degree + abs_degree + house + retrograde for every planet — see `supabase/functions/ask-astrology/validationFacts.ts`). So the ground truth IS in the facts object — the user's premise that it's missing from canonical facts is wrong.

The actual issue is `correctNatalPlanetPositionsInProse` at line 4731 **isn't catching the Uranus case for this chart** because its prose pattern is too narrow. The AI is writing things like *"your natal Uranus at 0°09' Gemini"* — that's the SR Uranus position bleeding into a natal sentence. The corrector should:
- Identify the natal-qualified mention (`natal Uranus`, `your natal Uranus`, `your Uranus` in a natal context)
- Extract the degree+sign claim adjacent to it
- Compare against the natal facts position (`Libra 0°30'`)
- Surgically rewrite the degree/sign

I'll inspect the existing corrector's regex and broaden it to handle:
- `"your natal <Planet> at <deg>°<min>' <Sign>"` (already covered, presumably)
- `"<Planet> at <deg>°<min>' <Sign>"` when the surrounding sentence is in a natal-qualified context (currently the gap)
- `"natal <Planet> in <Sign>"` (sign-only claims with no degree)

I'll also add a log line that prints, for each planet checked, the natal facts truth value vs. what was found in prose, so future failures are diagnosable.

## Plan (small, targeted, no scope creep)

**File:** `supabase/functions/ask-astrology/index.ts` only.

1. **Tighten `hasAcknowledgment`** in `acknowledgeNatalRetrogradesFromContext` (around line 3576):
   - Require a plain-language word (`retrograde` | `Rx`) — drop `℞` and bare `R\b` from the satisfaction regex.
   - Additionally require the containing sentence to be ≥ 8 words (block satisfaction by a placement-table cell or parenthetical).
   - Add a `natal_retrograde_acknowledgment_checked` log entry when retrograde planets are present, listing planets checked, planets injected, and planets skipped-as-already-acknowledged. This makes regressions visible in logs even when injection count is 0.

2. **Broaden `correctNatalPlanetPositionsInProse`** (around line 4731):
   - Read existing patterns; widen so a `<Planet> at <deg>°<min>' <Sign>` claim inside a sentence that contains a natal qualifier (`natal`, `your natal`, `birth chart`, `at birth`) anywhere in the same sentence is rewritten using the canonical facts.
   - Add a "sign-only" branch: `natal <Planet> in <Sign>` rewrites the sign when wrong, leaving degree if not present.
   - Emit example diffs in the log for each rewrite (the function already logs counts; add up to 5 examples).

3. **Verification (no code change):**
   - Confirm BASE RULE 10 text and all 11 inheritance lines still read "BASE RULES 1–10" (already verified above — no edit needed).
   - Re-run `rg "BASE RULES 1.{0,3}9\b"` to ensure zero matches.

4. **Deploy** the `ask-astrology` edge function.

## What I am NOT doing

- Not touching the elemental-balance corrector, the SR house corrector, the cross-chart balance corrector, the timing pipeline, or the prompt body outside BASE RULE 10. Those are stable.
- Not adding a new "canonical natal Uranus" hardcoded constant for Nicki — the facts JSON already carries the truth for every chart, and a per-user hardcode would be the wrong abstraction. The fix is to make the existing corrector catch the existing wrong prose.
- Not changing `NATAL_RX_ACK_BY_PLANET` sentences.

## Why this should hold across deployments

The two changes are orthogonal to elemental balance and to the SR pipeline, so a future fix in either of those areas can't silently undo this. Both changes are inside their own named functions and have explicit emission logs, so a regression will be visible in the next run's log line list rather than silent.

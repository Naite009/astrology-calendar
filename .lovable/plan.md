
# Six Prompt Fixes — ask-astrology System Prompt

**Scope guardrails (per your instructions):**
- No code changes to UI, gates, validators, dedup pipeline, schema, or `correctPlacementData`.
- All edits in **one file**: `supabase/functions/ask-astrology/index.ts`.
- Edits are confined to the `SYSTEM_PROMPT` template literal (~lines 7464–8420) **plus** widening the existing `acknowledgeRelationshipRetrogrades` section-title filter so the *already-built* retrograde nudge fires on non-relationship readings too. That widening is a 1-line scope change to an existing pipeline pass — it does not add a new pipeline stage, does not change the gate, and does not change validation. If you'd rather I leave the retrograde nudge purely prompt-side and not touch that single regex, say so and I'll drop step 4 and rely on the prompt rule alone.

---

## Current state I confirmed in code

- A `UNIVERSAL READING TYPE BASE` block already exists (lines 7823–7862) with BASE RULES 1–7 covering timing personalization, pronoun voice, dedup, ground truth, retrograde, voice rules, and forward-compatible default. **Career and solar_return per-type rules currently restate or assume these but do not explicitly cite the base, and they have local language gaps.** Per Fix 5, I will tighten the base block AND make every per-type section open with an explicit "INHERITS UNIVERSAL BASE — non-overridable" line so future types cannot silently drift.
- Career section (line 8219) has its own `CAREER PROSE QUALITY RULE`, `CAREER TRANSIT FRAMING RULE`, etc., but **no explicit timing transit personalization clause** like the natal section's line 8310 has. This is the actual leak.
- Solar_return section (line 8312) **does** have a timing transit specificity rule (line 8343) and **does** declare "The SR House Emphasis" as Section 10 (line 8322). The user reports the section is missing in output and that you'd like it positioned as Section 8 (between "Where Pressure and Discipline Come In" and "Key SR-to-Natal Activations"). Currently it is positioned at slot 10, after "Where Pressure and Discipline Come In" (slot 9) and before "Key SR-to-Natal Activations" (slot 11) — so it is already in the requested position, just numbered 10 not 8. **I will renumber and add a `SECTION 8 IS MANDATORY — HARD FAIL IF MISSING` enforcement note that is impossible to miss.**
- Retrograde acknowledgment (lines 6564–6657) is **hard-scoped to relationship sections** by `RELATIONSHIP_SECTION_TITLE_RE_LOCAL`. Natal Venus retrograde never gets the nudge in a natal/career/SR reading.
- Solar_return ground truth rule (lines 8330–8334) is generic ("never copy SR sign into natal sentence") but does not pin the four specific Ben Levin values you listed. Per Fix 2, I will keep it generic (since this prompt is shared across users) **but also add a worked example showing the failure pattern** and explicitly pin the failure modes you listed (SR Venus 9°15' Libra written as natal Venus, etc.) as a **canonical anti-example** the model is shown so it learns the failure shape — not as a hardcoded user-specific rule.

---

## Fix-by-fix changes

### Fix 1 — Timing transit language not reaching career & solar_return

**Problem:** Career has no explicit per-type "name the natal point + concrete scenario" timing rule; SR has one but it's not being honored consistently.

**Edit:**
1. In the career section (after line 8243, before `CAREER NATAL-SR HOUSE BRIDGE RULE`), add a `CAREER TRANSIT SPECIFICITY RULE` mirroring line 8310's natal version, framed for career. It will (a) ban "this part of your chart" / "this part of your natal makeup" explicitly, (b) require naming the specific natal point with sign+degree+house, (c) require one concrete career-specific real-life scenario, (d) ban generic closers.
2. In the solar_return section, strengthen the existing line 8343 rule by appending: "This applies equally to every entry in the Solar Return Timing Windows section AND to every transit reference in the SR Strategy Summary 'When' / 'Best Windows' / 'Caution Windows' callouts. Empty placeholder language like 'this part of your chart' or 'this part of your natal makeup' is a HARD FAIL — the entry will be rejected."
3. In the universal base (BASE RULE 1, line 7828), add a final line: "(f) ENFORCEMENT: This rule is NON-NEGOTIABLE for every reading type without exception — including but not limited to natal, career, solar_return, money, health, spiritual, relocation, timing, general, and any future type. Per-type sections MAY add stricter framing but MAY NOT relax this rule."

### Fix 2 — SR position bleed on solar_return

**Edit:** In the `SOLAR RETURN GROUND-TRUTH CONSTRAINTS` block (line 8330), append a worked anti-example block:

> CANONICAL FAILURE PATTERNS — DO NOT REPEAT:
> - WRONG: writing natal Venus's sign/degree using the SR Venus sign/degree (e.g., natal Venus described as "9°15' Libra" when 9°15' Libra is the SR Venus position; the natal table shows a different sign).
> - WRONG: writing natal Mercury using the SR Mercury sign/degree (e.g., natal Mercury described as "20°32' Scorpio" when 20°32' Scorpio is SR Mercury; the natal table shows a different sign).
> - WRONG: writing natal Jupiter using the SR Jupiter sign/degree (e.g., natal Jupiter described as "24°24' Cancer" when 24°24' Cancer is SR Jupiter; the natal table shows a different sign).
> - WRONG: writing the SR North Node sign as anything other than what the SR table says (e.g., writing SR North Node in Scorpio when the SR table shows Pisces).
> Each of these is a 2-step verification failure. Before writing ANY natal planet's sign/degree, locate that planet in the "Natal Key Placements" table and copy from THAT row only. Before writing ANY SR planet's sign/degree (including Nodes), locate that planet in the "Solar Return Key Placements" table and copy from THAT row only. The two tables are independent — never let a value from one cross over into the other.

This frames the four specific failures as **patterns the model should recognize and refuse**, without hardcoding Ben's chart into the prompt (which would be wrong for every other user).

### Fix 3 — SR House Emphasis as Section 8

**Edit:** Renumber the solar_return section list so "The SR House Emphasis" becomes Section 8 (currently Section 10), shifting "Key SR-to-Natal Activations" → Section 9, "Solar Return Timing Windows" → Section 10, "What Is Being Left Behind" → Section 11, "The Year's Single Most Important Message" → Section 12, modality → 13, summary → 14.

Also add immediately above the section list: "SECTION 8 ('The SR House Emphasis') IS MANDATORY. If this section is missing from the output, the reading is incomplete and will be rejected. Do not skip this section under any circumstance, even if no SR house has 2+ planets — in that case, follow the fallback instructions inside the section spec."

### Fix 4 — Natal Venus retrograde acknowledged in all reading types

**Two-part edit:**

**Part A (prompt — required):** In the universal base block, add `BASE RULE 8 — NATAL RETROGRADE ACKNOWLEDGMENT (every reading type, every section):`

> If a natal planet is marked retrograde in the "Natal Key Placements" table (with R, Rx, ℞, or "retrograde"), then in EVERY narrative_section that interprets that planet (e.g., a Venus retrograde must be acknowledged in "How You Love" / "Your Earning Style" / "Love and Relationships This Year" / "Hidden Strengths" / wherever Venus is the focal planet of the section), you MUST acknowledge the retrograde status at least once in plain language — not just as a symbol after the planet name. Write a single sentence explaining what that natal retrograde means for THIS person specifically (e.g., for natal Venus retrograde: "Your Venus is retrograde, so love and value run on review for you — you revisit, second-guess, and need time before you trust what you actually want from a partner or a price tag.") The acknowledgment must be specific to the planet's domain and to the chart's other Venus context (sign, house, aspects), not a generic stock sentence. This rule applies to natal Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, and Chiron retrograde alike — every reading type, every section that takes that planet as its subject.

**Part B (one-line scope widening — optional safety net):** The existing `acknowledgeRelationshipRetrogrades` function at line 6575 already has the per-planet nudge phrasing built. It just refuses to fire outside relationship-titled sections because of `RELATIONSHIP_SECTION_TITLE_RE_LOCAL` at line 6573. I will widen this regex to also match section titles like "How You Love", "Your Earning Style", "Love and Relationships This Year", "Hidden Strengths", "Communication and Thinking This Year" — the canonical natal/SR/career/money sections where Mercury/Venus/Mars/Jupiter/Saturn/Chiron is the focal planet. This is a regex-only change to one constant and does NOT touch the gate, validator, dedup, or `correctPlacementData`. **If you want me to skip Part B and rely on the prompt rule alone, say so and I'll only do Part A.**

### Fix 5 — Shared base prompt inheritance enforcement

The base block already exists at lines 7823–7862. The leak is that per-type sections (career, money, health, spiritual, etc.) restate some rules locally and don't explicitly cite the base, so a future reading type added below them inherits nothing visible.

**Edit:**
1. Add a one-line header at the top of EVERY per-type section (`relationship`, `relocation`, `career`, `health`, `money`, `natal`, `solar_return`, `spiritual`, `timing`, `general`): `INHERITS UNIVERSAL BASE — BASE RULES 1–8 are non-overridable for this reading type.`
2. In BASE RULE 7 (forward-compatible default, line 7858), strengthen the language: "Any new question_type added in the future inherits BASE RULES 1–8 automatically, no exceptions. The base rules are NEVER opt-out and NEVER restate-required — they are always in force the moment a question_type is recognized OR defaulted."
3. Add a new BASE RULE 8 (Natal Retrograde Acknowledgment from Fix 4 above) so the base now covers: timing personalization, pronoun voice, dedup, ground truth, retrograde flag normalization, voice rules, default-for-unrecognized-types, and natal retrograde acknowledgment.

### Fix 6 — Double sentence pattern in timing windows

**Edit:** In BASE RULE 1 add subsection (g):

> ANTI-RESTATEMENT RULE FOR TIMING WINDOWS: A timing window description must contain at most ONE sentence that names the transit + natal point, and ONE sentence describing a concrete real-life scenario. The two sentences MUST add different information. The second sentence may NOT restate the first sentence's idea using different words (e.g., FORBIDDEN: "Jupiter squaring your natal Sun at 28°11' Libra touches your identity, vitality, and sense of purpose. You may catch yourself overcommitting around your identity, vitality, and sense of purpose." — both sentences say the same thing). The second sentence must instead describe a SPECIFIC scenario that could actually happen in this person's week or month — e.g., "You may catch yourself overcommitting to a project you can't realistically deliver on, or saying yes to a leadership role before checking whether your calendar can hold it." The test: if you delete sentence 1, sentence 2 must still convey new, scene-level information. If sentence 2 paraphrases sentence 1, rewrite sentence 2 as a concrete scene.

Also append to subsection (b) of BASE RULE 1: "The concrete scenario MUST be a recognizable scene from daily life (a work conversation, a money decision, a body sensation, a relationship moment) — not a restatement of the planet's symbolic meaning."

---

## Files touched

- `supabase/functions/ask-astrology/index.ts` — prompt edits in the SYSTEM_PROMPT block + (optional Fix 4 Part B) one regex widening at line 6573

## Files NOT touched

- No UI files
- No gate, validator, dedup, schema, or `correctPlacementData` changes
- No new pipeline stages
- No memory updates (the existing memory entries for ask-tab already cover the principles; if you want a memory update after the edit lands, I'll do it as a follow-up)

## Verification after deploy

Run a fresh career reading and a fresh solar_return reading on Ben's chart. Confirm:
1. Timing windows in both name the specific natal point with sign + house and a concrete scenario, no "this part of your chart" / "natal makeup" leakage.
2. Solar_return reading writes natal Venus / Mercury / Jupiter using the natal table values (not the SR Venus 9°15' Libra etc.), and SR North Node in Pisces.
3. "The SR House Emphasis" is present in the SR reading at slot 8.
4. Natal Venus retrograde gets one plain-language acknowledgment sentence in the Venus-focal section of every reading type.
5. No sentence pair in any timing window restates the same idea twice.

If any of those still fails after this prompt change, the failure is a model compliance issue, not a prompt content issue — and we should escalate to a deterministic post-validator pass for the failing rule rather than another round of prompt rewording. I will not propose a deterministic backstop in this plan because you asked for prompt-only fixes.

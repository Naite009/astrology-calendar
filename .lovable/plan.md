# Fix: SR Mercury retrograde missing from career prose

## What you confirmed is working
- `retrograde: true` is now correctly populated in the SR placement table.
- `factsAwareRetrogradeSweep` is parsing SR truth correctly.
- `correctPlacementData` in `AskView.tsx` keeps the JSON boolean and `℞` glyph in sync.

## The remaining gap (and why it's not the sweep)
The `factsAwareRetrogradeSweep` only **fixes false claims** about retrograde state — if the AI writes "SR Mercury direct" it flips it, and if it writes a phantom "SR Mercury retrograde" on a direct planet it strips it. It does **not** force the model to mention retrograde status when the model is silent about it. That's a prompt rule, not a post-processor job.

In `supabase/functions/ask-astrology/index.ts` the prompt has an **SR Retrograde Acknowledgment** rule at line 9012, but it's scoped only to `question_type: "solar_return"`. The career template (lines 8876–8910), money, and health templates have no equivalent rule. Career prose can mention SR Mercury sign/house and skip its retrograde status entirely without violating any prompt rule — exactly what's happening on Ben's reading.

## Single targeted change
Promote the existing SR Retrograde Acknowledgment rule from solar_return-only to a **UNIVERSAL BASE RULE** that applies to every reading type whenever any SR placement is referenced.

**File:** `supabase/functions/ask-astrology/index.ts`

**Edit 1 — Add a universal SR retrograde acknowledgment to the base rules block** (the section starting around line 8478 that already enumerates rules every reading type inherits). Add a new rule alongside BASE RULES 1–8 with this content:

> **UNIVERSAL SR RETROGRADE ACKNOWLEDGMENT (NON-NEGOTIABLE — applies to every reading type that references Solar Return placements: solar_return, career, money, health, relationship, relocation, spiritual, timing, general, and any future type):** For every SR planet marked retrograde in the "Solar Return Key Placements" table (R, Rx, ℞, or "retrograde"), the prose MUST acknowledge the retrograde status at least once in plain language in the section that takes that SR planet as its focal subject. For SR Mercury specifically, the acknowledgment MUST appear in whichever section discusses communication, thinking, decisions, contracts, negotiation, or networking for this reading type — e.g., in a career reading the SR Mercury retrograde acknowledgment lands in "Your Career Foundation", "Hidden Strengths", "11th House and Networking", or the Strategy Summary's "When to Act" / "What to Avoid" item. A bare "(R)" tag after the planet name is NOT enough — write a single sentence in plain English explaining what that SR retrograde means for this year framed in the reading's domain (career = "communication, decisions, and contracts will run on review this year — expect to revisit conversations and rework agreements you thought were settled"; money = "purchases, contracts, and pricing decisions will need a second pass"; health = "treatment plans and provider choices benefit from a second opinion"; relationship = "important conversations may need to be revisited and clarified"). Omitting acknowledgment for any SR planet that is retrograde in the SR table is a HARD FAIL on every reading type, not just solar_return.

**Edit 2 — Add a career-specific reinforcement** to the career template (lines 8876–8910) right after the existing CAREER PROSE QUALITY RULE, naming SR Mercury retrograde as the canonical case:

> **CAREER SR MERCURY RETROGRADE RULE:** If the "Solar Return Key Placements" table marks SR Mercury retrograde, the career reading MUST include exactly one plain-English sentence stating SR Mercury is retrograde this year and what that means for communication, decisions, and contracts in a work context, placed in either "Your Career Foundation", "Hidden Strengths", or the Strategy Summary's "When to Act"/"What to Avoid" — never silently dropped. The same rule fires for SR Saturn (long-term commitments under review), SR Jupiter (growth/expansion under review), and SR Mars (timing of action under review) when those planets are retrograde in the SR table.

**Edit 3 — Mirror the rule for money and health templates** (one line each, so the gap doesn't reappear there next time):
- Money template: same SR Mercury / Saturn retrograde rule, framed for purchases/contracts/pricing.
- Health template: same rule framed for treatment plans, provider choices, second opinions.

## What I am NOT changing
- No code changes to `factsAwareRetrogradeSweep`, `runPreGateLocalAudit`, or any post-processor.
- No changes to the chart context builder, the placement table serializer, or the frontend.
- No changes to the SR placement table data flow — that's working.

## After deployment
The next career reading on Ben's chart should include exactly one plain-English sentence about SR Mercury being retrograde this year somewhere in the communication/decisions/contracts territory (Career Foundation, Hidden Strengths, or Strategy Summary). If it does not, the gap is in prompt adherence, not the rule, and I'll inspect the actual emitted JSON to decide whether to add a post-processor injection step — but I expect the rule alone to close it because the analogous rule has held on solar_return readings for weeks.

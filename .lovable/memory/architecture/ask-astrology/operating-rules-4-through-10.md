---
name: ask-astrology Operating Rules 4–10
description: Permanent operating rules for ask-astrology and AskView covering cloud-vs-local data, placement-block injection, ephemeris override ban, base-prompt inheritance, regression coverage, gate failure handling, and confirmation discipline
type: constraint
---

# Operating Rules 4–10 for ask-astrology and AskView.tsx

These rules sit alongside Rules 1, 2, and 3 (see
`architecture/ask-astrology/no-prose-sweeps-placement-table-truth`). They
govern every future change to `ask-astrology`, `AskView.tsx`, and any
adjacent reading-generation surface. They cannot be quietly violated when
new features are built. Each one exists because a real failure today was
caused by a previous fix that did not account for what was already there.

---

## Rule 4 — Cloud always wins over localStorage for SR data

`fetchCanonicalSolarReturn` MUST be called before any reading generation
that touches SR data. localStorage is **never** the source of truth for SR
planet placements, retrograde flags, houses, or signs.

- The auto-resume / completed-job path is the most common offender; it must
  re-fetch canonical SR data, not replay the cached payload.
- If the cloud fetch fails, abort the generation with a clear error. Do
  not silently fall back to localStorage.
- localStorage may continue to be used for UI hints (last-viewed chart,
  filters), but never for the SR planet payload that feeds the prompt.

## Rule 5 — Explicit labeled placement blocks required in every reading context

Every reading-context string passed to the AI prompt MUST contain explicit
labeled placement lines for **both** the natal chart and (when SR is in
scope) the SR chart, before the AI is invoked. No exceptions, no reading
type opt-outs.

Required line shape:

```
Natal Sun: Taurus, House 6, Direct
SR Sun: Taurus, House 9, Direct
```

- Every prose-relevant body in scope (full classical set + nodes + Chiron +
  Lilith + Juno when applicable) gets one line per chart it appears in.
- Retrograde state is written as `Direct` or `Retrograde` (not `R`, `℞`, or
  `Rx` in the labeled block — those characters are fine in the placement
  table rows, but the labeled block uses words).
- The AI is forbidden from deriving any house number from a sign, from
  another planet's house, from an aspect pattern, or from "feel." Houses
  come from these labeled lines and from the placement tables — nowhere
  else. This is the upstream guarantee that the Rule 2 validator can
  enforce against.

## Rule 6 — No ephemeris override of verified chart data

The function `correctSrPlanetsRetrograde` (and any successor that
recomputes retrograde from ephemeris and overwrites the stored value) MUST
NOT be called anywhere in the codebase. Verified chart data from the
database is canonical.

- Image-uploaded charts in particular: the user has already verified the
  retrograde state. Ephemeris recalculation is allowed to *report*
  disagreement (as a diagnostic log entry), but it is never allowed to
  *overwrite* the stored value in either the chart payload or the prompt
  context.
- If a future contributor needs ephemeris data for a derived calculation
  (e.g. station detection for transit timing), they must read it into a
  separate scratch variable and not write it back into the SR/natal chart
  object.

## Rule 7 — All reading types inherit the full shared base prompt

BASE RULES 1 through 10 of the shared system prompt apply to every reading
type without exception. There is no per-type opt-out and no
"this reading type is too short to need them" carve-out.

- New reading types MUST explicitly inherit the full base ruleset by name
  in the prompt assembler. Inheritance must be visible in code review, not
  implicit.
- Every new reading type MUST be tested against both the **Ben Levin** and
  **Lauren Newman** charts before it is considered deployed. These two
  charts together cover the failure shapes that have actually shipped.
- A new reading type without both regression runs is treated as untested,
  regardless of how clean it looks on the contributor's own chart.

## Rule 8 — Regression tests required before any pipeline, prompt, or sweep change deploys

Every change to the post-processing pipeline, the system prompt, the
placement-context assembler, the validator, the gate-call wrapper, or any
sweep MUST be covered by regression tests against the failure shapes
listed below. All tests must pass before deploy.

When a new failure shape is discovered in production, it MUST be added to
this list **before** the corresponding fix is deployed, so the fix cannot
regress later.

### Retrograde failures
- SR planet marked retrograde in placement table but prose says direct.
- SR planet marked direct in placement table but prose says retrograde.
- Natal planet marked retrograde in placement table but the section
  discussing that planet never mentions retrograde status.
- SR retrograde value from an image-uploaded chart being overwritten by
  ephemeris recalculation.

### House placement failures
- Natal house number in prose contradicting the natal placement table.
- SR house number in prose contradicting the SR placement table.
- SR house sweep touching and correcting a natal planet reference (Rule 3
  scope violation).
- Natal house sweep correction being reversed by SR sweep running after it
  (the `Lilith H8 → H1` reversal pattern).
- AI deriving a house number from sign position instead of from the
  placement table.

### Position bleed failures
- SR planet position being written as a natal planet position in prose.
- Natal planet position being written as an SR planet position in prose.
- Closing message referencing the wrong house for any planet.
- AI confusing SR Venus house with SR Jupiter house in synthesis sections.

### Structural failures
- Non-relationship reading containing relationship contract fields.
- SR section missing SR placement table when SR planets are referenced in
  prose.
- Elemental balance prose claiming wrong dominant element or wrong
  dominant modality.
- Profection house theme being replaced by SR Sun house theme in the
  profection year interpretation.
- Stellium identified in wrong house — AI mapping sign stellium to wrong
  house.
- AI inventing a house concentration that does not exist in the SR
  placement table.

### Gate and pipeline failures
- Gate returning 404 and reading being marked "needs review" instead of
  `UNVALIDATED` (see Rule 9).
- Two pipeline corrections contradicting each other in the same generation
  (the architectural failure mode Rules 1–3 exist to end).
- Auto-resume completed-job path using stale localStorage SR data instead
  of canonical cloud data (see Rule 4).
- Balance claim being corrected in the headline but not in the description
  prose.
- Dedup pass missing duplicate sentences within a single bullet or body
  field.

## Rule 9 — Gate 404 means UNVALIDATED, not "needs review"

If the external Replit gate returns 404 or any non-200, the reading banner
MUST say:

> UNVALIDATED — external validation did not run

The banner must NOT say "needs review," "pending review," "under review,"
or any phrasing that implies a human or automated reviewer looked at the
reading. Export remains available, but the warning must be prominent and
unmistakable in the UI — not collapsed, not faded, not below the fold.

The same rule applies to gate timeouts and network errors. Anything
short of a clean 200 from the gate ⇒ `UNVALIDATED` banner.

## Rule 10 — One confirmation generation per fix

After any fix deploys, run **exactly one** test generation against the
specific chart that was failing.

- Clean gate response with no relevant defects ⇒ fix is confirmed.
- Gate still flags the defect ⇒ stop generating, investigate the code.

Repeated generations on a failing fix are forbidden. They mask the real
problem (variance in AI output hides systematic bugs) and burn API
credits. If the first confirmation run fails, the next action is a code
read, not another generation.

---

## Why these rules exist

Every architectural problem found today was caused by a previous fix that
did not account for what was already there:

- A new sweep was added without checking that an existing sweep would
  reverse it.
- A new reading type shipped without inheriting the base ruleset.
- A retrograde corrector was wired in without checking it would overwrite
  user-verified data.
- A localStorage-first resume path was added without checking that SR data
  drifts.
- A gate failure was caught without updating the user-facing banner.

Rules 4–10 close those exact paths. Rules 1–3 close the prose-drift path.
Together they end the audit cycle.

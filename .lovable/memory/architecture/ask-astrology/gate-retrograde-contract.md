---
name: Gate retrograde contract — symmetric escalation
description: Replit gate treats RETROGRADE_STATE_MISMATCH and RETROGRADE_OMISSION as symmetric 422 regen triggers — no silent prose patches on either side
type: constraint
---

# Gate retrograde contract (as of round-3 Replit deploy)

The external Replit gate enforces both retrograde failure shapes as
**HTTP 422 → regenerate**, with no silent patching:

1. **`RETROGRADE_STATE_MISMATCH`** — prose claims a retrograde state that
   contradicts the placement table (either direction).
2. **`RETROGRADE_OMISSION`** — placement table marks a planet retrograde,
   but prose mentions the planet in a position-verb context without the
   retrograde marker nearby (18-char neighborhood, per-site dedup,
   chart-scoped natal vs SR).

Both emit defects from `/generate-reading-pdf` (422) and `ok=False` from
`/check-reading`. The previous silent auto-injector for omissions has been
deleted from `template_reading.py`.

## Implication for our pipeline

This matches Rule 2 exactly: any prose↔table drift → regenerate, never
patch. Our existing correctors (`fixSrRetrogradeMentionsInProse`,
`fixNatalRetrogradeMentionsInProse`) remain in place as **upstream**
defenses that run before the gate sees the payload — they reduce regen
churn but are not the contract. The gate is now the symmetric
backstop.

## Do not

- Do not add a downstream "omission patcher" on our side to pre-empt the
  gate. That would re-introduce the silent-mutation pattern Rules 1–3
  forbid.
- Do not treat omission defects as lower-severity than state-mismatch.
  Both are 422 regens.

## Defect message shape (for regen prompt context)

Gate fix messages name: chart (natal/SR), planet, section title, JSON
path, and snippet. The regen prompt should pass these through verbatim so
the model knows exactly which mention is missing the marker or carries
the wrong state.

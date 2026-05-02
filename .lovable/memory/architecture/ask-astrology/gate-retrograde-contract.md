---
name: Gate retrograde contract — symmetric escalation (with observe-only carve-out)
description: Replit gate escalates RETROGRADE_STATE_MISMATCH strictly; RETROGRADE_OMISSION temporarily in warnings[] (observe-only) until our (a)+(b) enumeration fix lands
type: constraint
---

# Gate retrograde contract (round-3 + observe-only window)

## Current state (as of this round)

The external Replit gate enforces retrograde failures as **HTTP 422 →
regenerate**, with no silent patching — with one temporary asymmetry:

1. **`RETROGRADE_STATE_MISMATCH`** (prose claims a retrograde state that
   contradicts both chart tables) — **STRICT**: emits as a defect,
   `/generate-reading-pdf` → 422, `/check-reading` → `ok=False`.

2. **`RETROGRADE_OMISSION`** (table marks planet retrograde; prose
   mentions planet in position-verb context without the marker nearby —
   18-char neighborhood, per-site dedup, chart-scoped natal vs SR) —
   **OBSERVE-ONLY (temporary)**: detector still runs on every export,
   one entry per drift site emitted into `gate_report.warnings[]` with
   the same payload (chart, planet, section, JSON path, snippet, fix
   message). `/generate-reading-pdf` → 200 with valid PDF,
   `/check-reading` → `ok=True`.

The observe-only window is for us to ship and validate two layers
against real-world output:

- **(a)** Prompt rule: when the model writes "X planets at a glance"
  enumeration lists, include the retrograde marker (R) inline next to
  any retrograde planet, e.g. `"SR Saturn R in Pisces (House 4)"`.
- **(b)** Deterministic post-LLM corrector on our side: walk any
  `"SR/natal {Planet} in {Sign}"` enumeration in the assembled payload
  and stamp the retrograde marker from the placement-table truth before
  the payload reaches the gate. This is the same shape as the injector
  Replit just deleted on their side — but ours runs *upstream of the
  gate* in the prompt-assembly pipeline, not as a hidden downstream
  patch. That makes it the prompt's own corrector, not a silent
  post-validation mutation, so it's compatible with Rules 1–3.
- Single-prose case (defect 5, freeform paragraphs) is **prompt-only** —
  no deterministic corrector can catch it. Rely on prompt-context
  injection naming the retrograde planets in the section-context block.

When (a)+(b) is live and validated against the warnings[] stream,
Replit promotes `RETROGRADE_OMISSION` back to strict 422 — single-line
change on their side.

## Symmetry flag (open decision)

Replit has a longstanding **silent auto-stripper** for the inverse of
the deleted injector: when prose says "Mercury retrograde" but both
tables say Mercury direct, the gate silently strips "retrograde" → just
"Mercury". By a strict reading of Rule 2 this should also be flipped to
escalate `RETROGRADE_STATE_MISMATCH` instead of silently mutating prose.
Rare in practice (LLMs forget retrograde markers far more than they
invent them), but the asymmetric carve-out is on the table for the same
work window. No action requested from us — flagging here so the next
time we touch the contract we remember it exists.

## Implication for our pipeline

- Rule 2 holds: prose↔table drift → regenerate, never patch.
- Our existing correctors (`fixSrRetrogradeMentionsInProse`,
  `fixNatalRetrogradeMentionsInProse`) remain as upstream defenses.
- Build (a)+(b) for the enumeration list class. Validate against the
  `gate_report.warnings[]` stream Replit is now emitting.
- Do NOT add a downstream "omission patcher" that runs *after* the gate
  — that re-introduces the silent-mutation pattern.

## Defect/warning message shape (for regen prompt context)

Both defects[] and warnings[] entries name: chart (natal/SR), planet,
section title, JSON path, and snippet. Pass through verbatim in regen
prompts so the model knows which mention is missing the marker or
carries the wrong state.

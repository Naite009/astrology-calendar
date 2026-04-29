---
name: No Prose Sweeps — Placement Table is Truth
description: Architectural ban on regex prose-correction sweeps in ask-astrology / SR pipeline; placement tables are the only source of truth for house/sign/degree/retrograde
type: constraint
---

# Architectural rule for ask-astrology and the Solar Return reading pipeline

This rule overrides any prior pattern in the codebase. It exists because the
prose-correction sweep architecture produced sweeps that fought each other and
reversed correct fixes (natal Lilith H1 → H8 → H1, natal Chiron H5 → H1, natal
North Node H5 → H9, false-positive retrograde flags on SR Venus/Mars, false
natal_angle_mismatch on Asc).

## Rule 1 — Placement tables are the single source of truth

Every reference in body prose to a planet's **house number, sign, degree, or
retrograde state** MUST be interpolated at render time from the placement
table for that chart:

- Natal references → Natal Key Placements table.
- SR references → SR placement table.

No house number, sign, degree, or retrograde flag may be hardcoded into a
template string, prompt example, or static interpretation snippet that ends up
in user-facing prose. Authors write `{{ natal.lilith.house }}`, never `"1st"`.

## Rule 2 — One validator, no sweeps

The following are forbidden going forward:

- `factsAwareNatalHouseSweep` and any successor regex that rewrites planet
  houses in prose.
- `correctSrPlanetHousesInProse` and any SR-side equivalent.
- Any "accuracy review" pass that silently mutates AI output.
- Any balance-claim or element/modality rewriter that edits prose after the
  fact.

Replace the entire chain with **one** post-render validator that runs **once,
last**, and whose only job is to compare every house/sign/degree/retrograde
claim in the prose against the placement table and **fail the generation** on
mismatch. Failure triggers a re-run of the generator, not a downstream patch.

The Replit gate continues to act as a safety net. Our pipeline does not rely
on it.

## Rule 3 — Scope discipline for any transitional sweep

If a sweep cannot be removed in a single change, it must be scope-locked:

- A sweep operating on **natal** references MUST skip every sentence that does
  not contain the literal word `natal` before the planet name.
- A sweep operating on **SR** references MUST skip every sentence that does
  not contain `SR` or `Solar Return` before the planet name.
- Unprefixed mentions are ambiguous — never blind-edit them. They belong to
  the Rule 2 validator only.

## Why

Two sweeps overwriting each other on the same sentence is not a bug to patch.
It is proof the architecture is wrong. Every reading shipped under the
sweep-chain architecture must be assumed to contain at least one drift error
regardless of how many sweeps ran.

## Application

- Do not add new sweeps. If a fix is tempting as a regex, the correct fix is
  in the generator (template + interpolation) or the validator (fail loud).
- When touching `supabase/functions/ask-astrology/index.ts` or any
  `solarReturn*` library, check whether the change reintroduces hardcoded
  facts or adds a silent corrector. If it does, stop and refactor toward
  interpolation instead.

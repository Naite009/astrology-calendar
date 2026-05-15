## Diagnosis

ChatGPT's review confirms a clear pattern: the deterministic, behavior-only sections (At a Glance, How Each Child Adapts, When Pressure Builds, What To Do When Things Escalate) are working. The AI-narrative sections (What Already Works, Parent–Child Connections, Household Regulation, What Actually Helps) are inventing structure, idealizing bonds, and overfitting to fake configurations.

The fix is not "better prompting." It is **removing the AI's permission to narrate connection** in places where it has been hallucinating, and replacing those with deterministic, evidence-bound output — the same pattern that made the working sections trustworthy.

## What changes

### 1. Kill the hallucination sources outright

- **Remove all configuration labeling from prompts** (T-square, Grand Trine, Yod, apex, stellium-as-driver). Even with the validation rule added last round, the AI keeps reaching for these. The cleanest fix: strip the vocabulary entirely from the family-system prompts. If a real opposition+square exists, it gets described as "two tight tensions converging on [planet]" — never named.
- **Remove "composite as driver" language.** Composite stays as a one-line tone tag per pair (already required), but it can no longer be cited as the *cause* of any dynamic.

### 2. Rewrite "What Already Works" as evidence-gated

Currently the AI is free to invent positive bonds. New rule:

- For each pair, the AI may only cite a "what works" line if there is a **named, tight (≤4° orb) bridge aspect** between personal planets (Sun/Moon/Mercury/Venus/Mars) in that specific pair's synastry data.
- If no qualifying aspect exists, the pair is omitted from this section. No filler.
- Forbidden phrasings: "bond through [activity]", "connect over [topic]", "productive conversations", "shared interest in" — anything that names a real-world activity the AI cannot know.
- Allowed phrasings: behavioral tendencies only ("easier to sit in the same room", "less friction when tired", "can hear each other when neither is rushed").

### 3. Rebuild "Parent–Child Connections" as a 3-line structure (no story)

Each pair gets exactly three lines, in this order:

1. **Composite tone** (one sentence, already required): "The pair composite is [Sun/Moon/Asc] in [sign] — [one plain-language tone descriptor]."
2. **The strongest real bridge** (if any, ≤5° orb): "[Parent planet] [aspect] [child planet] — [behavioral effect, no scenario]."
3. **The strongest real friction** (if any, ≤5° orb): "[Parent planet] [aspect] [child planet] — [behavioral effect, no scenario]."

If no qualifying bridge or friction exists, that line is omitted with a single honest sentence: "No tight aspects between personal planets in this pair." No paragraph essays. No "container," "absorbs," "mirror," "regulator-of" language.

### 4. Remove "What Actually Helps"

This section is built on synthesizing the AI's own (often invented) reading. Replace with a deterministic **"What Each Person Responds Best To"** block, one line per member, built client-side from the same Mars/Moon/Mercury logic already used for "When Pressure Builds." No AI involvement.

### 5. Remove "Household Regulation Pattern" as a narrative section

Replace with a single deterministic line built from Moon-element tally: "[N] water moons, [N] fire moons — this household needs [calm/space/movement/structure] to reset." Nothing more.

### 6. Lock differentiation across all per-member sections

Extend the existing group-aware deduplication (currently in `buildPressurePatternsForGroup`) to:
- "How Each Child Adapts" lines
- "What Each Person Responds Best To" lines
- "At a Glance" per-person lines

Same tiebreaker: if two members share the primary signature, append a Moon or Mercury modifier until every line is unique. Done client-side, deterministic, no AI.

### 7. Tighten the "What Already Works" + "Parent–Child Connections" prompt with hard gates

Add to the prompt, in the same style as the asteroid data gate:

```
EVIDENCE GATE — HARD STOP
Before writing any line about a pair, you must cite the specific aspect from
the synastry data with both planets and the orb. If you cannot cite it,
you may not write the line. No exceptions. No softening with composite alone.
No reaching for sign-based or house-based reasoning.
```

## Sections after this pass

| Section | Source | Status |
|---|---|---|
| At a Glance | deterministic + dedup | keep, extend dedup |
| How Each Child Adapts | deterministic + dedup | keep, extend dedup |
| What Already Works | AI, evidence-gated, may be empty | rewrite |
| Parent–Child Connections | AI, 3-line structured, evidence-gated | rewrite |
| Sibling Connections | same 3-line structure as P–C | rewrite |
| When Pressure Builds | deterministic | keep as-is |
| What Each Person Responds Best To | deterministic (new, replaces "What Actually Helps") | new |
| When Things Escalate | deterministic conditional actions | keep as-is |
| Household reset line | deterministic one-liner (replaces Regulation Pattern) | new |

Removed: "What Already Works" filler, "Household Regulation Pattern" narrative, "What Actually Helps", any T-square/apex/Grand Trine vocabulary.

## Technical scope

```text
supabase/functions/family-system-reading/index.ts
  - strip config-naming vocabulary from prompt + JSON schema
  - rewrite parentChildConnections + siblingConnections schema to {composite, bridge?, friction?}
  - add EVIDENCE GATE block
  - rewrite whatAlreadyWorks as evidence-gated array (may be empty)
  - drop householdRegulation, whatActuallyHelps from schema

src/lib/familySystemSynastry.ts
  - extend buildPressurePatternsForGroup pattern to:
      buildAdaptationsForGroup, buildRespondsBestForGroup, buildAtAGlanceForGroup
  - add buildHouseholdResetLine(members) — Moon-element tally → one sentence

src/components/family/FamilyTab.tsx
  - render new 3-line pair structure
  - render "What Each Person Responds Best To" from deterministic helper
  - render household reset one-liner
  - remove householdRegulation + whatActuallyHelps cards
  - "What Already Works" renders only non-empty entries; if empty, hide section
```

No DB changes. No new edge functions.

## Open questions before I build

1. **"What Already Works" when empty across all pairs** — hide the whole section, or show a single honest line ("No tight bridge aspects between personal planets in this family")?
2. **Sibling Connections** — same 3-line structure as Parent–Child, or do you want siblings collapsed into one "How the kids interact" deterministic block instead of per-pair?
3. **Composite tone line** — keep it on every pair (per your earlier request for consistency), or only when it adds something the bridge/friction lines don't already say?

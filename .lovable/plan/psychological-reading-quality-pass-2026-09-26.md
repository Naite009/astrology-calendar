# Psychological Reading Quality Pass

## Goal
Audit the actual Ava, Max, and representative saved-chart readings, then replace generic or repetitive interpretation with concrete psychological synthesis across Natal Portrait, Story of Self, and Chart Walkthrough. Preserve all chart calculations, birth data, houses, aspect geometry, and chart identity.

## What will change

### 1. Audit real output
- Generate and inspect Natal Portrait and Chart Walkthrough data for Ava, Max, and at least one contrasting chart already available in the project.
- Inspect the rendered Natal Portrait, Story of Self, and Chart Walkthrough at desktop and mobile sizes.
- Record weak examples before editing so the final report can show direct before-and-after wording.

### 2. Strengthen the shared psychological engine
- Replace generic aspect templates with pair-specific function interactions that explain what each function protects, reaches for, interrupts, projects, or makes easy.
- Give Venus–Saturn, Moon–Saturn, Mercury–Jupiter, Mars–Pluto, Venus–Neptune, and Moon–Uranus clearly distinct mechanisms, lived examples, integration language, and reflection questions.
- Make titles function-derived and concrete rather than adjective-heavy.
- Keep sign and house context as modifiers of the psychological interaction, not standalone keyword definitions.
- Make child and teen output plain, age-natural, and non-clinical as well as nonsexualized.

### 3. Improve complete-chart synthesis
- Rework the Big Three blend to describe actual agreement, conflict, and modification among identity, emotional regulation, and first response.
- Replace abstract element and modality summaries with ordinary behavior, automatic coping or processing moves, strengths, needs, and possible overuse.
- Rebuild Relationship Blueprint prose from Moon, Venus, Mars, the 7th-house ruler and occupants, plus Saturn only when genuinely relevant.
- Remove remaining generic fallback lines and stale canned copy from the affected natal sections.

### 4. Use the richer output everywhere
- Ensure Natal Portrait, Story of Self, and Chart Walkthrough display the same improved shared synthesis.
- Expand Story of Self aspect groups so the psychological explanation is available in the rendered view, not only calculated in memory.
- Preserve exact evidence, aspect orbs, valid houses, ranking, and age context already supplied by the existing engines.

### 5. Regression coverage and verification
- Add snapshot-like content assertions for Ava, Max, and a contrasting chart without relying on live user tables.
- Add anti-template tests proving different planet pairs and aspect types produce meaningfully different narratives.
- Add checks against vague labels, repeated generic sentences, keyword-only synthesis, incomplete relationship evidence, and adult language in teen readings.
- Run focused tests, the full test suite, typecheck, production build, and browser checks of all three reading areas.

## Technical boundaries
- `psychologicalFunctions.ts` remains the single source of truth for natal psychological-function and aspect interpretation.
- Existing aspect and placement results are consumed as-is. No calculation or persistence paths will be changed.
- If signed-in saved charts cannot be accessed in the preview, fixed regression fixtures that faithfully mirror the saved charts will be used and that limitation will be reported.
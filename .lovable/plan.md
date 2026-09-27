# Concrete Natal House Interpretations

## Goal
Replace vague house-emphasis language with concrete, everyday descriptions across Natal Portrait, Story of Self, and Chart Walkthrough, without changing any chart calculations or stored chart data.

## What will change
- Add one shared twelve-house interpretation library covering attention, repeating choices or conflicts, what others may notice, and the recurring personal question for each house.
- Make the wording age-aware for child, teen, and adult readings while keeping the same underlying house meaning.
- Generate house-concentration text from the exact house, major-planet count, and named planets.
- Explain that three or more major planets form a stellium and why that concentration gives the house extra psychological weight.
- Replace vague labels such as “region of life” and “life arena” in the Natal Portrait, Psychological Map, and Chart Walkthrough with plain labels such as “What this affects in daily life.”
- Preserve visible evidence: house number, major-planet count, named planets, and separately listed additional bodies.

## Quality safeguards
- Add regression coverage for all twelve houses.
- Fail tests if banned vague phrases return in user-facing natal house copy.
- Verify representative 1st, 6th, and 12th-house concentrations are materially different and concrete.
- Run focused tests, the full test suite, typecheck, production build, and rendered desktop checks.

## Technical boundaries
- Keep `psychologicalFunctions.ts` as the shared source for natal house interpretation.
- Do not alter natal math, birth data, ephemeris logic, house calculation, aspects, or chart identity.

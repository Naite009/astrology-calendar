# Architecture Rules

- All natal psychological-function and aspect interpretation must use `psychologicalFunctions.ts`; this keeps Natal Portrait, Story of Self, and Chart Walkthrough consistent without changing chart calculations.
- All natal house interpretation must use the concrete twelve-house descriptions in `psychologicalFunctions.ts`; this prevents vague house keywords from drifting between reading surfaces.
- Chart ruler: Mars traditional + Pluto modern co-ruler for Scorpio rising; aspect type from separation only. `src/lib/interpretation/chartRuler.ts` and `src/lib/aspects/classifyAspect.ts` are the single sources.

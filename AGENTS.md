# Architecture Rules

- All natal psychological-function and aspect interpretation must use `psychologicalFunctions.ts`; this keeps Natal Portrait, Story of Self, and Chart Walkthrough consistent without changing chart calculations.
- All natal house interpretation must use the concrete twelve-house descriptions in `psychologicalFunctions.ts`; this prevents vague house keywords from drifting between reading surfaces.
- Chart ruler = traditional ruler (Mars/Saturn/Jupiter for Scorpio/Aquarius/Pisces), modern ruler named as co-ruler; aspect type = tightest match by true separation. Single sources: `src/lib/interpretation/chartRuler.ts`, `src/lib/aspects/classifyAspect.ts`; why: prevents mislabelled aspects and Pluto-only rulership.

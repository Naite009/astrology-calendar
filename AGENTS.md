# Architecture Rules

- All natal psychological-function and aspect interpretation must use `psychologicalFunctions.ts`; this keeps Natal Portrait, Story of Self, and Chart Walkthrough consistent without changing chart calculations.
- All natal house interpretation must use the concrete twelve-house descriptions in `psychologicalFunctions.ts`; this prevents vague house keywords from drifting between reading surfaces.
- Chart ruler = traditional ruler (Mars/Saturn/Jupiter for Scorpio/Aquarius/Pisces), modern ruler named as co-ruler; aspect type = tightest match by true separation. Single sources: `src/lib/interpretation/chartRuler.ts`, `src/lib/aspects/classifyAspect.ts`; why: prevents mislabelled aspects and Pluto-only rulership.
- Element and modality balance copy must use `src/lib/interpretation/elementBalance.ts`; why: keeps low-count behavior, alternatives, and compensation evidence concrete and consistent across natal surfaces.
- The high-level natal synthesis in Natal Portrait and Chart Walkthrough must use `src/lib/interpretation/chartSynthesis.ts`; why: keeps prioritization, evidence, modifiers, and practical translation consistent without changing chart math.

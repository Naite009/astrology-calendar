# Big Three Synthesis Correction

## Goal
Replace the weak “uses a sign style” wording with a chart-specific Big Three synthesis while preserving the shared synthesis architecture and all calculation safeguards.

## Implementation
1. Rewrite the Big Three branch in `chartSynthesis.ts` to:
   - keep exact Sun, Moon, and Ascendant placements;
   - name repeated signs, or describe same-element and mixed-element patterns accurately;
   - identify Big Three element and modality emphasis separately from whole-chart balance;
   - explain house contrasts and any canonical major Big Three aspect;
   - translate the combined pattern into ordinary behavior and a practical takeaway.
2. Use whole-chart ten-major-planet element and modality counts only as a factual modifier when they materially reinforce or contrast the Big Three.
3. Remove every generated “uses a [sign] style,” “emotional settling uses,” and “first impressions use” construction from this synthesis.
4. Add regressions for all-same-sign, same-element/different-sign, and mixed element/modality Big Three patterns, including house contrast and banned phrase checks.

## Validation
- Run focused synthesis tests, the full test suite, TypeScript checking, and the production build.
- Render the corrected Libra Sun/Moon/Ascendant example and report its exact output.

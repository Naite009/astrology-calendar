/** Eight equally sized sectors centred on the named lunar phases. */
export const LUNAR_PHASE_NAMES = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Balsamic'] as const;
export function lunarPhaseIndex(angle: number): number {
  const normalized = ((angle % 360) + 360) % 360;
  return Math.floor(((normalized + 22.5) % 360) / 45);
}
export function lunarPhaseName(angle: number) {
  return LUNAR_PHASE_NAMES[lunarPhaseIndex(angle)];
}
export const LUNAR_PHASE_MEANINGS = [
  'Starting something before every detail is clear may feel more natural. Check what you actually want to begin.',
  'Early effort may need patience. Notice which plans still matter when the initial excitement settles.',
  'Choices may need a concrete response. Decide what can be acted on without treating every disagreement as a crisis.',
  'You may notice what needs adjusting before sharing your work. Refinement matters more than rushing or starting over.',
  'Results and differing perspectives may be easier to see. Make room for feedback without assuming a promised outcome.',
  'You may want to explain or share what experience has taught you. Notice who can use it and what still needs review.',
  'You may question routines or commitments that once made sense. Separate useful changes from frustration with everything.',
  'Finishing, reflecting and leaving room between commitments may matter more. This does not predict isolation or low energy.',
] as const;
/**
 * Lunar phase conventions.
 *
 * Two different things are named here and must not be confused:
 *
 * 1. Astrological cycle phase (Rudhyar eight-stage convention). The Moon's
 *    elongation from the Sun is split into eight 45-degree sectors that START at
 *    0, 45, 90, 135, 180, 225, 270 and 315 degrees. This is the convention used
 *    for natal, Solar Return and progressed lunation-cycle labels. Under it,
 *    122.45 degrees is First Quarter and 221.98 degrees is Full.
 *
 * 2. Astronomical appearance. What the Moon looks like in the sky, using sectors
 *    centred on the exact New, Quarter and Full moments. 122.45 degrees looks
 *    waxing gibbous. This applies only to a real sky Moon, never to a
 *    progressed cycle, which has no visible appearance.
 */

export const LUNAR_PHASE_CONVENTION = 'Rudhyar eight-phase cycle, 45-degree sectors starting at 0 degrees (Moon minus Sun elongation)';

export const LUNAR_PHASE_NAMES = ['New Moon', 'Crescent', 'First Quarter', 'Gibbous', 'Full Moon', 'Disseminating', 'Last Quarter', 'Balsamic'] as const;

const norm = (angle: number) => ((angle % 360) + 360) % 360;

/** Astrological cycle phase index (Rudhyar), 0..7. */
export function lunarPhaseIndex(angle: number): number {
  return Math.min(7, Math.floor(norm(angle) / 45));
}
export function lunarPhaseName(angle: number) {
  return LUNAR_PHASE_NAMES[lunarPhaseIndex(angle)];
}

export const ASTRONOMICAL_APPEARANCE_NAMES = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'] as const;

/** Sky appearance index, centred sectors (New Moon spans 337.5 to 22.5 degrees). */
export function astronomicalAppearanceIndex(angle: number): number {
  return Math.floor(((norm(angle) + 22.5) % 360) / 45);
}
export function astronomicalAppearance(angle: number) {
  return ASTRONOMICAL_APPEARANCE_NAMES[astronomicalAppearanceIndex(angle)];
}

/** Plain, non-fatalistic meanings for each cycle phase (Rudhyar order). */
export const LUNAR_PHASE_MEANINGS = [
  'Starting something before every detail is clear may feel more natural. Check what you actually want to begin.',
  'Early effort may need patience. Notice which plans still matter when the initial excitement settles.',
  'Choices may ask for a concrete response. Decide what can be acted on now and what can wait.',
  'You may notice what needs adjusting before sharing your work. Refinement matters more than rushing or starting over.',
  'Results and differing perspectives may be easier to see. Make room for feedback without assuming a promised outcome.',
  'You may want to explain or share what experience has taught you. Notice who can use it and what still needs review.',
  'You may question routines or commitments that once made sense. Separate useful changes from frustration with everything.',
  'Finishing, reflecting and leaving room between commitments may matter more. This does not predict isolation or low energy.',
] as const;

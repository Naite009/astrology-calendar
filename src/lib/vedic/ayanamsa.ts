/**
 * Sidereal ayanamsa, with the four flavours serious readers actually ask for.
 *
 * Each mode is a deterministic linear precession model anchored on that
 * school's published value at J2000. Accuracy is roughly one arc-minute across
 * the 1900-2100 window, which is far inside the tolerance that matters for
 * sign, nakshatra and pada placement. The one place a mode choice genuinely
 * changes a reading is the fine divisions (D30, D45, D60), where a degree of
 * difference can move a placement, so the mode is always labeled on screen.
 *
 * Sidereal longitude = tropical longitude - ayanamsa (mod 360).
 */

export type AyanamsaMode = 'lahiri' | 'raman' | 'kp' | 'trueChitra';

interface AyanamsaSpec {
  key: AyanamsaMode;
  label: string;
  /** Value in degrees at J2000.0 */
  atJ2000: number;
  /** What the school is and who uses it */
  note: string;
}

/** Precession of the equinoxes, degrees per year (about 50.29 arc-seconds). */
const PRECESSION_PER_YEAR = 0.0139722;

export const AYANAMSA_SPECS: Record<AyanamsaMode, AyanamsaSpec> = {
  lahiri: {
    key: 'lahiri',
    label: 'Lahiri (Chitrapaksha)',
    atJ2000: 23.853,
    note: 'The Indian government standard, and the default here. It places the star Chitra (Spica) near 180 degrees of the sidereal zodiac. Most published Indian ephemerides and most software use it, so it is the mode to keep if you want your chart to match what another Jyotishi would draw.',
  },
  raman: {
    key: 'raman',
    label: 'B. V. Raman',
    atJ2000: 22.371,
    note: 'B. V. Raman used a value about one and a half degrees smaller than Lahiri. Charts drawn this way can shift a planet sitting in the first degree and a half of a sign back into the previous sign, which is exactly why some older books disagree with modern software about a placement.',
  },
  kp: {
    key: 'kp',
    label: 'Krishnamurti (KP)',
    atJ2000: 23.887,
    note: 'The Krishnamurti Paddhati value, about two arc-minutes past Lahiri. Signs almost never change, but sub-lord and fine-division work does, which is the whole point of the KP system.',
  },
  trueChitra: {
    key: 'trueChitra',
    label: 'True Chitra (true Spica)',
    atJ2000: 23.867,
    note: 'Fixes Chitra (Spica) at exactly 180 degrees at every moment rather than only near the anchor epoch. It runs a fraction of a degree from Lahiri and is preferred by readers who want the reference star held exactly rather than approximately.',
  },
};

export const DEFAULT_AYANAMSA: AyanamsaMode = 'lahiri';

export const AYANAMSA_MODE_LIST: AyanamsaMode[] = ['lahiri', 'trueChitra', 'kp', 'raman'];

/** Decimal year, e.g. 1979.53 */
export function decimalYear(date: Date): number {
  const year = date.getUTCFullYear();
  const startOfYear = Date.UTC(year, 0, 1);
  const startOfNext = Date.UTC(year + 1, 0, 1);
  return year + (date.getTime() - startOfYear) / (startOfNext - startOfYear);
}

/** Ayanamsa in degrees for a given moment, in the requested school. */
export function ayanamsaFor(date: Date, mode: AyanamsaMode = DEFAULT_AYANAMSA): number {
  const spec = AYANAMSA_SPECS[mode] || AYANAMSA_SPECS[DEFAULT_AYANAMSA];
  return spec.atJ2000 + PRECESSION_PER_YEAR * (decimalYear(date) - 2000);
}

/** Lahiri ayanamsa in degrees for a given moment. Kept for existing callers. */
export function lahiriAyanamsa(date: Date): number {
  return ayanamsaFor(date, 'lahiri');
}

export function ayanamsaLabel(mode: AyanamsaMode = DEFAULT_AYANAMSA): string {
  return (AYANAMSA_SPECS[mode] || AYANAMSA_SPECS[DEFAULT_AYANAMSA]).label;
}

export function ayanamsaNote(mode: AyanamsaMode = DEFAULT_AYANAMSA): string {
  return (AYANAMSA_SPECS[mode] || AYANAMSA_SPECS[DEFAULT_AYANAMSA]).note;
}

/** Formatted as 24°09' for display. */
export function formatAyanamsa(value: number): string {
  const deg = Math.floor(value);
  const min = Math.round((value - deg) * 60);
  return `${deg}\u00b0${String(min).padStart(2, '0')}'`;
}

/** How far another school sits from the one in use, in arc-minutes. */
export function ayanamsaSpread(date: Date, mode: AyanamsaMode): Array<{ mode: AyanamsaMode; label: string; value: number; arcminFromActive: number }> {
  const active = ayanamsaFor(date, mode);
  return AYANAMSA_MODE_LIST.map(m => {
    const value = ayanamsaFor(date, m);
    return {
      mode: m,
      label: AYANAMSA_SPECS[m].label,
      value,
      arcminFromActive: Math.round((value - active) * 60),
    };
  });
}

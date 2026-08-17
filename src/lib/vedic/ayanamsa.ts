/**
 * Lahiri (Chitrapaksha) ayanamsa.
 *
 * Deterministic linear precession model anchored on the Lahiri value at J2000.
 * Accurate to roughly one arc-minute across the 1900-2100 window, which is far
 * inside the tolerance that matters for sign, nakshatra and pada placement.
 *
 * Sidereal longitude = tropical longitude - ayanamsa (mod 360).
 */

const LAHIRI_AT_J2000 = 23.853;      // degrees
const PRECESSION_PER_YEAR = 0.0139722; // degrees per year (~50.29 arc-seconds)

/** Decimal year, e.g. 1979.53 */
export function decimalYear(date: Date): number {
  const year = date.getUTCFullYear();
  const startOfYear = Date.UTC(year, 0, 1);
  const startOfNext = Date.UTC(year + 1, 0, 1);
  return year + (date.getTime() - startOfYear) / (startOfNext - startOfYear);
}

/** Lahiri ayanamsa in degrees for a given moment. */
export function lahiriAyanamsa(date: Date): number {
  return LAHIRI_AT_J2000 + PRECESSION_PER_YEAR * (decimalYear(date) - 2000);
}

/** Formatted as 24°09' for display. */
export function formatAyanamsa(value: number): string {
  const deg = Math.floor(value);
  const min = Math.round((value - deg) * 60);
  return `${deg}\u00b0${String(min).padStart(2, '0')}'`;
}

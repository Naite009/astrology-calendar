/**
 * Vertex in Solar Return — Calculation and Interpretation
 * Sources: L. Edward Johndro, Charles Jayne, Brian Clark ("The Vertex-Anti-Vertex"),
 * Donna Henson, Erin Sullivan
 *
 * The Vertex is the intersection of the Prime Vertical with the Ecliptic in the west.
 * In moderate latitudes it typically falls in houses 5-8.
 * It represents significant-feeling encounters, destined events, and experiences beyond conscious control.
 */

import { NatalPlanetPosition } from '@/hooks/useNatalChart';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const toAbsDeg = (pos: { sign: string; degree: number; minutes?: number }): number => {
  const idx = SIGNS.indexOf(pos.sign);
  return idx * 30 + pos.degree + (pos.minutes || 0) / 60;
};

const fromAbsDeg = (absDeg: number): { sign: string; degree: number; minutes: number } => {
  let d = ((absDeg % 360) + 360) % 360;
  const signIdx = Math.floor(d / 30);
  const rem = d - signIdx * 30;
  return { sign: SIGNS[signIdx], degree: Math.floor(rem), minutes: Math.round((rem % 1) * 60) };
};

/**
 * Calculate the Vertex given the MC and geographic latitude.
 *
 * The Vertex is the Ascendant formula run with the colatitude (90 - latitude),
 * then rotated 180 degrees, because the raw result is the Antivertex (east).
 * The MC's ecliptic longitude must first be converted back to RAMC:
 *   RAMC = atan2(sin(mc) * cos(obliquity), cos(mc))
 * Feeding the ecliptic longitude straight in as RAMC skews the result by up to
 * a couple of degrees, so it is converted here.
 */
export function calculateVertex(
  mcSign: string, mcDegree: number, mcMinutes: number,
  latitude: number
): { sign: string; degree: number; minutes: number } | null {
  if (!mcSign || latitude === undefined) return null;

  const obliquity = 23.4392911; // mean obliquity of the ecliptic in degrees
  const toRad = (d: number) => d * Math.PI / 180;
  const toDeg = (r: number) => r * 180 / Math.PI;

  const mcAbsDeg = SIGNS.indexOf(mcSign) * 30 + mcDegree + (mcMinutes || 0) / 60;
  const oblRad = toRad(obliquity);
  const mcRad = toRad(mcAbsDeg);

  // Ecliptic longitude of the MC back to right ascension of the MC.
  const RAMC = Math.atan2(Math.sin(mcRad) * Math.cos(oblRad), Math.cos(mcRad));

  // Signed colatitude, so southern latitudes stay correct.
  const colatRad = toRad(90 - latitude);

  const y = Math.cos(RAMC);
  const x = -(Math.sin(oblRad) * Math.tan(colatRad) + Math.cos(oblRad) * Math.sin(RAMC));

  // atan2 here gives the Antivertex; the Vertex is the opposite point.
  const vertexLong = toDeg(Math.atan2(y, x)) + 180;

  return fromAbsDeg(vertexLong);
}


/**
 * Common city latitudes for fallback when location is a city name.
 * Covers major world cities and US cities commonly used in astrology software.
 */
const CITY_LATITUDES: Record<string, number> = {
  'new york': 40.71, 'los angeles': 33.94, 'chicago': 41.88, 'houston': 29.76,
  'phoenix': 33.45, 'philadelphia': 39.95, 'san antonio': 29.42, 'san diego': 32.72,
  'dallas': 32.78, 'san jose': 37.34, 'austin': 30.27, 'jacksonville': 30.33,
  'san francisco': 37.77, 'columbus': 39.96, 'charlotte': 35.23, 'indianapolis': 39.77,
  'seattle': 47.61, 'denver': 39.74, 'washington': 38.91, 'nashville': 36.16,
  'oklahoma city': 35.47, 'el paso': 31.76, 'boston': 42.36, 'portland': 45.52,
  'las vegas': 36.17, 'memphis': 35.15, 'louisville': 38.25, 'baltimore': 39.29,
  'milwaukee': 43.04, 'albuquerque': 35.08, 'tucson': 32.22, 'fresno': 36.74,
  'sacramento': 38.58, 'mesa': 33.42, 'kansas city': 39.10, 'atlanta': 33.75,
  'omaha': 41.26, 'colorado springs': 38.83, 'raleigh': 35.78, 'miami': 25.76,
  'cleveland': 41.50, 'tulsa': 36.15, 'oakland': 37.80, 'minneapolis': 44.98,
  'tampa': 27.95, 'arlington': 32.74, 'new orleans': 29.95, 'bakersfield': 35.37,
  'honolulu': 21.31, 'anaheim': 33.84, 'santa ana': 33.75, 'st louis': 38.63,
  'pittsburgh': 40.44, 'cincinnati': 39.10, 'orlando': 28.54, 'detroit': 42.33,
  'london': 51.51, 'paris': 48.86, 'berlin': 52.52, 'rome': 41.90, 'madrid': 40.42,
  'amsterdam': 52.37, 'vienna': 48.21, 'brussels': 50.85, 'zurich': 47.38,
  'stockholm': 59.33, 'oslo': 59.91, 'copenhagen': 55.68, 'dublin': 53.35,
  'lisbon': 38.72, 'prague': 50.08, 'warsaw': 52.23, 'budapest': 47.50,
  'athens': 37.98, 'barcelona': 41.39, 'munich': 48.14, 'milan': 45.46,
  'moscow': 55.76, 'istanbul': 41.01, 'cairo': 30.04, 'tel aviv': 32.09,
  'jerusalem': 31.77, 'dubai': 25.20, 'mumbai': 19.08, 'delhi': 28.61,
  'bangalore': 12.97, 'kolkata': 22.57, 'chennai': 13.08, 'tokyo': 35.68,
  'osaka': 34.69, 'beijing': 39.90, 'shanghai': 31.23, 'hong kong': 22.32,
  'singapore': 1.35, 'bangkok': 13.76, 'seoul': 37.57, 'taipei': 25.03,
  'sydney': -33.87, 'melbourne': -37.81, 'brisbane': -27.47, 'perth': -31.95,
  'auckland': -36.85, 'wellington': -41.29, 'toronto': 43.65, 'vancouver': 49.28,
  'montreal': 45.50, 'calgary': 51.05, 'ottawa': 45.42, 'mexico city': 19.43,
  'sao paulo': -23.55, 'rio de janeiro': -22.91, 'buenos aires': -34.60,
  'lima': -12.05, 'bogota': 4.71, 'santiago': -33.45, 'johannesburg': -26.20,
  'cape town': -33.93, 'nairobi': -1.29, 'lagos': 6.52, 'accra': 5.56,
};

/**
 * Parse latitude from a location string.
 * Handles: "40°42'N", decimal numbers, and city name lookups.
 * Returns null if unparseable.
 */
export function parseLatitudeFromLocation(location: string): number | null {
  if (!location) return null;

  // Try "40°42'N" format
  const dmsMatch = location.match(/(\d+)[°](\d*)[']?\s*(N|S)/i);
  if (dmsMatch) {
    const deg = parseInt(dmsMatch[1]) + (parseInt(dmsMatch[2] || '0') / 60);
    return dmsMatch[3].toUpperCase() === 'S' ? -deg : deg;
  }

  // Try "lat, lng" decimal pair (e.g. "40.71, -74.01")
  const pairMatch = location.match(/([-]?\d+\.\d+)\s*,\s*([-]?\d+\.\d+)/);
  if (pairMatch) {
    const lat = parseFloat(pairMatch[1]);
    if (lat >= -90 && lat <= 90) return lat;
  }

  // Try city name lookup (case-insensitive, ignore state/country suffixes)
  const lower = location.toLowerCase().trim();
  for (const [city, lat] of Object.entries(CITY_LATITUDES)) {
    if (lower.includes(city)) return lat;
  }

  // Try standalone decimal as last resort
  const decMatch = location.match(/([-]?\d+\.?\d*)/);
  if (decMatch) {
    const val = parseFloat(decMatch[1]);
    if (val >= -90 && val <= 90) return val;
  }

  return null;
}


import { solarReturnHouseMeaning } from './solarReturnClientMeaning';

// The Vertex is a secondary point. Sign alone cannot establish an encounter, event or lesson,
// so no sign-only client prose is published. House meaning uses the shared client-meaning gate.
export const vertexInSign: Record<string, { title: string; fatedTheme: string; encounters: string; lesson: string }> = {};

const HOUSE_TITLES = ['', 'Self-presentation', 'Income and spending', 'Conversations and learning', 'Home and private life', 'Enjoyment and creative work', 'Workload and routines', 'Close relationships and agreements', 'Shared money and responsibilities', 'Study and travel plans', 'Work and public responsibilities', 'Friendships and group plans', 'Private time and unfinished work'];
export const vertexInHouse: Record<number, { title: string; description: string; fatedArea: string }> = Object.fromEntries(
  Array.from({ length: 12 }, (_, i) => i + 1).map(h => [h, {
    title: `Vertex in ${HOUSE_TITLES[h]}`,
    description: solarReturnHouseMeaning(h, 'Vertex').replace(/^This year, /, 'This year, as a secondary point, the Vertex suggests '),
    fatedArea: HOUSE_TITLES[h].toLowerCase(),
  }]),
);

// Pair-only Vertex contact meanings lacked orbs, houses and chart layers; contacts are listed as evidence only.
export const vertexAspectMeanings: Record<string, string> = {};

import { computeBody, longitudeToSignPosition } from './ephemerisEngine';
/**
 * Solar Return Auto-Calculator
 *
 * Uses astronomy-engine to find the exact moment the Sun returns to its natal
 * longitude (the Solar Return), then calculates all planetary positions and
 * Placidus house cusps for that moment and location.
 *
 * This replaces manual data entry with real astronomical computation.
 */

import * as Astronomy from 'astronomy-engine';
import { calculatePlacidusHouses } from './placidusHouses';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

function lonToPos(lon: number): { sign: string; degree: number; minutes: number } {
  return longitudeToSignPosition(lon);
}

export interface AutoSRPlanet {
  sign: string;
  degree: number;
  minutes: number;
  isRetrograde?: boolean;
}

export interface AutoSRResult {
  /** Exact SR moment as ISO UTC string, e.g. "2025-04-15T18:42:17.000Z" */
  srDateTimeUTC: string;
  /** Human-readable local-time summary of SR moment (UTC) */
  srDateTimeLabel: string;
  planets: Record<string, AutoSRPlanet>;
  houseCusps: Record<string, { sign: string; degree: number; minutes: number }>;
}

/**
 * Calculate the solar return for a given natal Sun position, target year, and location.
 *
 * @param natalSunSign   - e.g. "Leo"
 * @param natalSunDeg    - integer degree within sign, 0-29
 * @param natalSunMin    - arc minutes 0-59
 * @param natalBirthDate - "YYYY-MM-DD" string used to seed the search window
 * @param targetYear     - the year of the SR (e.g. 2025)
 * @param lat            - geographic latitude of SR location
 * @param lng            - geographic longitude of SR location
 */
export function calculateSolarReturnAuto(
  natalSunSign: string,
  natalSunDeg: number,
  natalSunMin: number,
  natalBirthDate: string,
  targetYear: number,
  lat: number,
  lng: number,
): AutoSRResult {
  // 1. Natal Sun absolute longitude
  const signIdx = ZODIAC_SIGNS.indexOf(natalSunSign);
  if (signIdx < 0) throw new Error(`Unknown sign: ${natalSunSign}`);
  const natalSunLong = signIdx * 30 + natalSunDeg + natalSunMin / 60;

  // 2. Seed the search: start 15 days before the birthday in the target year
  const parts = natalBirthDate.split('-').map(Number);
  const bMonth = (parts[1] ?? 1) - 1; // 0-based month
  const bDay   = parts[2] ?? 1;
  const startDate = new Date(Date.UTC(targetYear, bMonth, bDay) - 15 * 86400000);

  // 3. Find exact SR moment (search up to 35 days forward)
  const srTime = Astronomy.SearchSunLongitude(natalSunLong, startDate, 35);
  if (!srTime) throw new Error('Could not find solar return moment — check natal Sun position and year');
  const srDate = srTime.date;

  // Canonical apparent positions and retrograde flags, without a parallel fallback engine.
  const planets: Record<string, AutoSRPlanet> = {};
  for (const name of ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'NorthNode', 'SouthNode', 'Chiron'] as const) {
    const body = computeBody(name, srDate);
    if (!body.ok) throw new Error(`Position unavailable for ${name}`);
    planets[name] = { ...lonToPos(body.longitude), isRetrograde: name === 'NorthNode' || name === 'SouthNode' ? undefined : body.retrograde };
  }

  // 5. Placidus house cusps
  const houses = calculatePlacidusHouses(srDate, lat, lng);
  const houseCusps: Record<string, { sign: string; degree: number; minutes: number }> = {};
  for (let i = 1; i <= 12; i++) {
    houseCusps[`house${i}`] = (houses as unknown as Record<string, { sign: string; degree: number; minutes: number }>)[`house${i}`];
  }

  // 6. Build human-readable label (UTC time)
  const h  = srDate.getUTCHours().toString().padStart(2, '0');
  const m  = srDate.getUTCMinutes().toString().padStart(2, '0');
  const mo = (srDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const dy = srDate.getUTCDate().toString().padStart(2, '0');
  const srDateTimeLabel = `${srDate.getUTCFullYear()}-${mo}-${dy} ${h}:${m} UTC`;

  return {
    srDateTimeUTC: srDate.toISOString(),
    srDateTimeLabel,
    planets,
    houseCusps,
  };
}

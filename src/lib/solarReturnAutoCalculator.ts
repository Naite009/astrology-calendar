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
import { getAccurateAsteroidPosition } from './asteroidEphemeris';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

function lonToPos(lon: number): { sign: string; degree: number; minutes: number } {
  const norm = ((lon % 360) + 360) % 360;
  const signIdx = Math.floor(norm / 30);
  const degFloat = norm % 30;
  const degree = Math.floor(degFloat);
  const minutes = Math.min(59, Math.round((degFloat - degree) * 60));
  return { sign: ZODIAC_SIGNS[signIdx], degree, minutes };
}

function isBodyRetrograde(body: Astronomy.Body, date: Date): boolean {
  const before = new Date(date.getTime() - 12 * 3600_000);
  const after  = new Date(date.getTime() + 12 * 3600_000);
  const lonBefore = Astronomy.Ecliptic(Astronomy.GeoVector(body, before, false)).elon;
  const lonAfter  = Astronomy.Ecliptic(Astronomy.GeoVector(body, after, false)).elon;
  let diff = lonAfter - lonBefore;
  if (diff >  180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

function getPlanetLon(body: Astronomy.Body, date: Date): number {
  if (body === Astronomy.Body.Moon) {
    return Astronomy.Ecliptic(Astronomy.GeoMoon(date)).elon;
  }
  return Astronomy.Ecliptic(Astronomy.GeoVector(body, date, false)).elon;
}

function getMeanNodeLon(date: Date): number {
  const jd = date.getTime() / 86_400_000 + 2_440_587.5;
  const T = (jd - 2_451_545.0) / 36_525;
  const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450_000;
  return ((omega % 360) + 360) % 360;
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
  const bDay   = Math.max(1, (parts[2] ?? 1) - 15);
  const startDate = new Date(Date.UTC(targetYear, bMonth, bDay));

  // 3. Find exact SR moment (search up to 35 days forward)
  const srTime = Astronomy.SearchSunLongitude(natalSunLong, startDate, 35);
  if (!srTime) throw new Error('Could not find solar return moment — check natal Sun position and year');
  const srDate = srTime.date;

  // 4. Planetary positions at SR moment
  const outerPlanets: Array<[string, Astronomy.Body]> = [
    ['Mercury', Astronomy.Body.Mercury],
    ['Venus',   Astronomy.Body.Venus],
    ['Mars',    Astronomy.Body.Mars],
    ['Jupiter', Astronomy.Body.Jupiter],
    ['Saturn',  Astronomy.Body.Saturn],
    ['Uranus',  Astronomy.Body.Uranus],
    ['Neptune', Astronomy.Body.Neptune],
    ['Pluto',   Astronomy.Body.Pluto],
  ];

  const planets: Record<string, AutoSRPlanet> = {
    Sun:  { ...lonToPos(getPlanetLon(Astronomy.Body.Sun,  srDate)) },
    Moon: { ...lonToPos(getPlanetLon(Astronomy.Body.Moon, srDate)) },
  };

  for (const [name, body] of outerPlanets) {
    planets[name] = {
      ...lonToPos(getPlanetLon(body, srDate)),
      isRetrograde: isBodyRetrograde(body, srDate),
    };
  }

  // North Node (mean)
  planets['NorthNode'] = { ...lonToPos(getMeanNodeLon(srDate)) };

  // Chiron from ephemeris lookup
  const chironRaw = getAccurateAsteroidPosition('chiron', srDate);
  planets['Chiron'] = { sign: chironRaw.sign, degree: chironRaw.degree, minutes: chironRaw.minutes };

  // 5. Placidus house cusps
  const houses = calculatePlacidusHouses(srDate, lat, lng);
  const houseCusps: Record<string, { sign: string; degree: number; minutes: number }> = {};
  for (let i = 1; i <= 12; i++) {
    houseCusps[`house${i}`] = (houses as Record<string, { sign: string; degree: number; minutes: number }>)[`house${i}`];
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

/**
 * Builds a sidereal (Jyotish) chart from a stored NatalChart.
 *
 * The stored chart holds tropical sign/degree/minute values. We convert those
 * to absolute tropical longitude, subtract the Lahiri ayanamsa for the birth
 * moment, and rebuild sign, nakshatra, pada and whole-sign house from there.
 * All math is deterministic. No AI is involved in any calculation.
 */

import { NatalChart } from '@/hooks/useNatalChart';
import { ayanamsaFor, ayanamsaLabel, AyanamsaMode, DEFAULT_AYANAMSA } from './ayanamsa';
import { getNakshatra, NakshatraInfo, VedicPlanet } from './nakshatras';
import { signFromIndex, signIndex, vedicDignity, VedicDignity, wholeSignHouse, SIGN_LORDS } from './vedicDignity';

export const JYOTISH_BODIES: VedicPlanet[] = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu',
];

export interface VedicBody {
  name: VedicPlanet;
  /** Absolute sidereal longitude 0-360 */
  longitude: number;
  sign: string;
  /** Degrees within the sidereal sign */
  degree: number;
  house: number | null;
  nakshatra: NakshatraInfo;
  dignity: VedicDignity;
  retrograde: boolean;
  /** Tropical sign it occupied in the Western chart, for the comparison view */
  tropicalSign: string;
}

export interface VedicChart {
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  ayanamsa: number;
  ayanamsaMode: AyanamsaMode;
  ayanamsaLabel: string;
  hasBirthTime: boolean;
  lagnaSign: string | null;
  lagnaDegree: number | null;
  lagnaNakshatra: NakshatraInfo | null;
  lagnaLord: VedicPlanet | null;
  bodies: VedicBody[];
  byName: Partial<Record<VedicPlanet, VedicBody>>;
  moonNakshatra: NakshatraInfo | null;
  /** UTC-ish Date used for the ayanamsa and the dasha seed */
  birthMoment: Date;
}

const TROPICAL_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

function toAbsolute(sign: string, degree: number, minutes = 0, seconds = 0): number | null {
  const idx = TROPICAL_SIGNS.indexOf(sign);
  if (idx === -1) return null;
  return idx * 30 + degree + minutes / 60 + seconds / 3600;
}

function norm360(v: number): number {
  return ((v % 360) + 360) % 360;
}

export function buildBirthMoment(chart: NatalChart): Date {
  const [y, m, d] = (chart.birthDate || '2000-01-01').split('-').map(Number);
  const [hh, mm] = (chart.birthTime || '12:00').split(':').map(Number);
  const offset = typeof chart.timezoneOffset === 'number' ? chart.timezoneOffset : 0;
  // Half-hour zones (+05:30, +07:30) need the offset in minutes, because
  // Date.UTC truncates a fractional hour argument.
  return new Date(Date.UTC(y || 2000, (m || 1) - 1, d || 1, hh || 12, (mm || 0) - Math.round(offset * 60)));
}

export function buildVedicChart(chart: NatalChart): VedicChart | null {
  if (!chart) return null;

  const birthMoment = buildBirthMoment(chart);
  const ayanamsa = lahiriAyanamsa(birthMoment);

  // Ascendant: houseCusps.house1 is the source of truth, then planets.Ascendant.
  const ascSource = chart.houseCusps?.house1 || chart.planets?.Ascendant;
  const ascTropical = ascSource
    ? toAbsolute(ascSource.sign, ascSource.degree, ascSource.minutes || 0)
    : null;
  const ascSidereal = ascTropical === null ? null : norm360(ascTropical - ayanamsa);
  const lagnaSign = ascSidereal === null ? null : signFromIndex(Math.floor(ascSidereal / 30));
  const lagnaDegree = ascSidereal === null ? null : ascSidereal % 30;

  const bodies: VedicBody[] = [];

  const push = (name: VedicPlanet, tropicalLon: number, tropicalSign: string, retro: boolean) => {
    const lon = norm360(tropicalLon - ayanamsa);
    const sign = signFromIndex(Math.floor(lon / 30));
    bodies.push({
      name,
      longitude: lon,
      sign,
      degree: lon % 30,
      house: lagnaSign ? wholeSignHouse(sign, lagnaSign) : null,
      nakshatra: getNakshatra(lon),
      dignity: vedicDignity(name, sign),
      retrograde: retro,
      tropicalSign,
    });
  };

  const planetKeyFor: Partial<Record<VedicPlanet, keyof NatalChart['planets']>> = {
    Sun: 'Sun', Moon: 'Moon', Mars: 'Mars', Mercury: 'Mercury',
    Jupiter: 'Jupiter', Venus: 'Venus', Saturn: 'Saturn',
    Rahu: 'NorthNode', Ketu: 'SouthNode',
  };

  for (const body of JYOTISH_BODIES) {
    const key = planetKeyFor[body];
    if (!key) continue;
    let pos = chart.planets?.[key];
    // Ketu is always exactly opposite Rahu; derive it when it is not stored.
    if (!pos && body === 'Ketu' && chart.planets?.NorthNode) {
      const nn = chart.planets.NorthNode;
      const abs = toAbsolute(nn.sign, nn.degree, nn.minutes || 0, nn.seconds || 0);
      if (abs !== null) {
        const opp = norm360(abs + 180);
        push('Ketu', opp, TROPICAL_SIGNS[Math.floor(opp / 30)], true);
      }
      continue;
    }
    if (!pos) continue;
    const abs = toAbsolute(pos.sign, pos.degree, pos.minutes || 0, pos.seconds || 0);
    if (abs === null) continue;
    const retro = body === 'Rahu' || body === 'Ketu' ? true : !!pos.isRetrograde;
    push(body, abs, pos.sign, retro);
  }

  const byName: Partial<Record<VedicPlanet, VedicBody>> = {};
  bodies.forEach(b => { byName[b.name] = b; });

  return {
    name: chart.name,
    birthDate: chart.birthDate,
    birthTime: chart.birthTime,
    birthLocation: chart.birthLocation,
    ayanamsa,
    hasBirthTime: !!chart.birthTime,
    lagnaSign,
    lagnaDegree,
    lagnaNakshatra: ascSidereal === null ? null : getNakshatra(ascSidereal),
    lagnaLord: lagnaSign ? SIGN_LORDS[lagnaSign] : null,
    bodies,
    byName,
    moonNakshatra: byName.Moon ? byName.Moon.nakshatra : null,
    birthMoment,
  };
}

/** Lord of a whole-sign house counted from the lagna. */
export function houseLord(chart: VedicChart, house: number): { sign: string; lord: VedicPlanet } | null {
  if (!chart.lagnaSign) return null;
  const sign = signFromIndex(signIndex(chart.lagnaSign) + (house - 1));
  return { sign, lord: SIGN_LORDS[sign] };
}

/** Bodies sitting in a given whole-sign house. */
export function bodiesInHouse(chart: VedicChart, house: number): VedicBody[] {
  return chart.bodies.filter(b => b.house === house);
}

export function formatDegree(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.round((deg - d) * 60);
  return `${d}\u00b0${String(m).padStart(2, '0')}'`;
}

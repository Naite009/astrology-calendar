/**
 * Tier 4 Solar Return Analysis
 * - Mutual Receptions
 * - Full Dignity Report
 * - Health Astrology Overlay
 * - Eclipse Sensitivity Check
 * - Enhanced Retrograde Analysis (with shadow periods)
 * - Quarterly Focus Breakdown
 */

import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const traditionalRuler: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};

const domicileSigns: Record<string, string[]> = {
  Sun: ['Leo'], Moon: ['Cancer'], Mercury: ['Gemini','Virgo'], Venus: ['Taurus','Libra'],
  Mars: ['Aries','Scorpio'], Jupiter: ['Sagittarius','Pisces'], Saturn: ['Capricorn','Aquarius'],
  Uranus: ['Aquarius'], Neptune: ['Pisces'], Pluto: ['Scorpio'],
};
const exaltationSigns: Record<string, string> = {
  Sun: 'Aries', Moon: 'Taurus', Mercury: 'Virgo', Venus: 'Pisces',
  Mars: 'Capricorn', Jupiter: 'Cancer', Saturn: 'Libra',
};
const detrimentSigns: Record<string, string[]> = {
  Sun: ['Aquarius'], Moon: ['Capricorn'], Mercury: ['Sagittarius','Pisces'], Venus: ['Aries','Scorpio'],
  Mars: ['Taurus','Libra'], Jupiter: ['Gemini','Virgo'], Saturn: ['Cancer','Leo'],
};
const fallSigns: Record<string, string> = {
  Sun: 'Libra', Moon: 'Scorpio', Mercury: 'Pisces', Venus: 'Virgo',
  Mars: 'Cancer', Jupiter: 'Capricorn', Saturn: 'Aries',
};

const getDignity = (planet: string, sign: string): string => {
  if (domicileSigns[planet]?.includes(sign)) return 'Domicile';
  if (exaltationSigns[planet] === sign) return 'Exaltation';
  if (detrimentSigns[planet]?.includes(sign)) return 'Detriment';
  if (fallSigns[planet] === sign) return 'Fall';
  return 'Peregrine';
};

const PLANETS_CORE = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];

const toAbsDeg = (pos: any): number | null => {
  if (!pos) return null;
  const idx = SIGNS.indexOf(pos.sign);
  if (idx < 0) return null;
  return idx * 30 + (pos.degree || 0) + ((pos as any).minutes || 0) / 60;
};

// ─── Types ──────────────────────────────────────────────────────────

export interface SRMutualReception {
  planet1: string;
  planet1Sign: string;
  planet2: string;
  planet2Sign: string;
  type: 'domicile' | 'exaltation' | 'mixed';
  interpretation: string;
}

export interface SRDignityEntry {
  planet: string;
  sign: string;
  dignity: string;
  score: number; // +5 domicile, +4 exaltation, -3 detriment, -4 fall, 0 peregrine
  isRetrograde: boolean;
  interpretation: string;
}

export interface SRDignityReport {
  entries: SRDignityEntry[];
  totalScore: number;
  /** Reframed as "Your Powerhouse" — the planet with highest dignity */
  strongestPlanet: string;
  /** Reframed as "Your Growth Edge" — the planet with lowest dignity (excluding Sun, which is always in fall in SR) */
  weakestPlanet: string;
  interpretation: string;
}

export interface SRHealthOverlay {
  planet: string;
  sign: string;
  house: number | null;
  bodyArea: string;
  vulnerability: string;
  isStressed: boolean; // detriment, fall, or hard aspects
  interpretation: string;
}

export interface SRHealthReport {
  overlays: SRHealthOverlay[];
  primaryConcerns: string[];
  supportiveFactors: string[];
  interpretation: string;
}

export interface SREclipseSensitivity {
  eclipseType: string; // 'Solar' or 'Lunar'
  eclipseSign: string;
  eclipseDegree: number;
  eclipseDate: string;
  sensitizedPlanet: string;
  sensitizedPlanetSource: 'SR' | 'Natal';
  orb: number;
  interpretation: string;
}

export interface SREnhancedRetrograde {
  planet: string;
  retrograde: boolean;
  sign: string;
  house: number | null;
  stationRetroDate: string;
  stationDirectDate: string;
  retroDegree: string;
  directDegree: string;
  shadowPreStart: string;
  shadowPostEnd: string;
  interpretation: string;
}

export interface SRQuarterlyFocus {
  quarter: 1 | 2 | 3 | 4;
  label: string;
  months: string;
  dominantThemes: string[];
  activePlanets: string[];
  interpretation: string;
  focus: string;
}

// ─── Planet body associations ───────────────────────────────────────

const PLANET_BODY: Record<string, { area: string; vulnerability: string }> = {
  Sun: { area: 'Heart, spine, overall vitality', vulnerability: 'Burnout, heart strain, back issues, low energy' },
  Moon: { area: 'Stomach, breasts, fluid balance, lymph', vulnerability: 'Digestive issues, water retention, emotional eating, sleep disruption' },
  Mercury: { area: 'Nervous system, hands, lungs, speech', vulnerability: 'Anxiety, respiratory issues, nerve pain, communication strain' },
  Venus: { area: 'Throat, kidneys, skin, hormonal balance', vulnerability: 'Throat infections, kidney issues, skin conditions, hormonal imbalance' },
  Mars: { area: 'Muscles, blood, adrenals, inflammation', vulnerability: 'Injuries, inflammation, headaches, adrenal fatigue, fever' },
  Jupiter: { area: 'Liver, hips, thighs, fat metabolism', vulnerability: 'Weight gain, liver strain, hip problems, overindulgence' },
  Saturn: { area: 'Bones, teeth, knees, joints, skin', vulnerability: 'Joint pain, dental issues, bone density, chronic conditions, depression' },
  Uranus: { area: 'Nervous system, circulation, ankles', vulnerability: 'Sudden spasms, circulatory issues, anxiety, erratic symptoms' },
  Neptune: { area: 'Immune system, feet, pineal gland', vulnerability: 'Immune weakness, allergies, foot problems, misdiagnosis, substance sensitivity' },
  Pluto: { area: 'Reproductive system, colon, detoxification', vulnerability: 'Reproductive issues, detox crises, obsessive health focus, hidden conditions' },
};

const SIGN_BODY: Record<string, string> = {
  Aries: 'head, face, brain',
  Taurus: 'throat, neck, thyroid',
  Gemini: 'lungs, arms, hands, nervous system',
  Cancer: 'chest, stomach, breasts',
  Leo: 'heart, spine, upper back',
  Virgo: 'intestines, digestive system',
  Libra: 'kidneys, lower back, skin',
  Scorpio: 'reproductive organs, colon',
  Sagittarius: 'hips, thighs, liver',
  Capricorn: 'knees, bones, joints, teeth',
  Aquarius: 'ankles, circulation, nervous system',
  Pisces: 'feet, immune system, lymphatic system',
};

// ─── Eclipse data for 2025-2027 (common SR years) ───────────────────

interface EclipseData {
  date: string;
  type: string;
  sign: string;
  degree: number;
}

const ECLIPSES_2025_2027: EclipseData[] = [
  { date: '2025-03-14', type: 'Lunar', sign: 'Virgo', degree: 23 },
  { date: '2025-03-29', type: 'Solar', sign: 'Aries', degree: 9 },
  { date: '2025-09-07', type: 'Lunar', sign: 'Pisces', degree: 15 },
  { date: '2025-09-21', type: 'Solar', sign: 'Virgo', degree: 29 },
  { date: '2026-02-17', type: 'Solar', sign: 'Aquarius', degree: 28 },
  { date: '2026-03-03', type: 'Lunar', sign: 'Virgo', degree: 12 },
  { date: '2026-08-12', type: 'Solar', sign: 'Leo', degree: 19 },
  { date: '2026-08-28', type: 'Lunar', sign: 'Pisces', degree: 4 },
  { date: '2027-02-06', type: 'Solar', sign: 'Aquarius', degree: 17 },
  { date: '2027-02-20', type: 'Lunar', sign: 'Virgo', degree: 2 },
  { date: '2027-07-18', type: 'Lunar', sign: 'Capricorn', degree: 25 },
  { date: '2027-08-02', type: 'Solar', sign: 'Leo', degree: 9 },
];

// ─── Retrograde periods 2025-2027 ──────────────────────────────────

interface RetroPeriod {
  planet: string;
  year: number;
  stationRx: string;
  stationDirect: string;
  rxDegree: string;
  directDegree: string;
  sign: string;
  shadowPre: string;
  shadowPost: string;
}

const RETRO_PERIODS: RetroPeriod[] = [
  // Mercury 2025
  { planet: 'Mercury', year: 2025, stationRx: '2025-03-15', stationDirect: '2025-04-07', rxDegree: '9° Aries', directDegree: '26° Pisces', sign: 'Aries/Pisces', shadowPre: '2025-02-25', shadowPost: '2025-04-24' },
  { planet: 'Mercury', year: 2025, stationRx: '2025-07-18', stationDirect: '2025-08-11', rxDegree: '15° Leo', directDegree: '4° Leo', sign: 'Leo', shadowPre: '2025-07-01', shadowPost: '2025-08-28' },
  { planet: 'Mercury', year: 2025, stationRx: '2025-11-09', stationDirect: '2025-11-29', rxDegree: '6° Sagittarius', directDegree: '20° Scorpio', sign: 'Sagittarius/Scorpio', shadowPre: '2025-10-22', shadowPost: '2025-12-15' },
  // Mercury 2026
  { planet: 'Mercury', year: 2026, stationRx: '2026-02-26', stationDirect: '2026-03-20', rxDegree: '22° Pisces', directDegree: '10° Pisces', sign: 'Pisces', shadowPre: '2026-02-09', shadowPost: '2026-04-06' },
  { planet: 'Mercury', year: 2026, stationRx: '2026-06-29', stationDirect: '2026-07-23', rxDegree: '26° Cancer', directDegree: '16° Cancer', sign: 'Cancer', shadowPre: '2026-06-12', shadowPost: '2026-08-09' },
  { planet: 'Mercury', year: 2026, stationRx: '2026-10-24', stationDirect: '2026-11-13', rxDegree: '19° Scorpio', directDegree: '4° Scorpio', sign: 'Scorpio', shadowPre: '2026-10-06', shadowPost: '2026-11-30' },
  // Venus 2026
  { planet: 'Venus', year: 2026, stationRx: '2026-03-02', stationDirect: '2026-04-13', rxDegree: '11° Aries', directDegree: '25° Pisces', sign: 'Aries/Pisces', shadowPre: '2026-01-28', shadowPost: '2026-05-17' },
  // Mars 2026
  { planet: 'Mars', year: 2026, stationRx: '2026-01-06', stationDirect: '2026-02-24', rxDegree: '6° Leo', directDegree: '17° Cancer', sign: 'Leo/Cancer', shadowPre: '2025-11-04', shadowPost: '2026-05-02' },
  // Jupiter
  { planet: 'Jupiter', year: 2025, stationRx: '2025-11-11', stationDirect: '2026-03-11', rxDegree: '20° Cancer', directDegree: '11° Cancer', sign: 'Cancer', shadowPre: '2025-08-05', shadowPost: '2026-06-10' },
  // Saturn
  { planet: 'Saturn', year: 2025, stationRx: '2025-07-13', stationDirect: '2025-11-28', rxDegree: '2° Aries', directDegree: '25° Pisces', sign: 'Aries/Pisces', shadowPre: '2025-04-08', shadowPost: '2026-02-20' },
  { planet: 'Saturn', year: 2026, stationRx: '2026-08-06', stationDirect: '2026-12-18', rxDegree: '12° Aries', directDegree: '3° Aries', sign: 'Aries', shadowPre: '2026-05-01', shadowPost: '2027-03-10' },
  // Uranus
  { planet: 'Uranus', year: 2025, stationRx: '2025-09-06', stationDirect: '2026-02-04', rxDegree: '1° Gemini', directDegree: '27° Taurus', sign: 'Gemini/Taurus', shadowPre: '2025-05-28', shadowPost: '2026-05-10' },
  // Neptune
  { planet: 'Neptune', year: 2025, stationRx: '2025-07-04', stationDirect: '2025-12-10', rxDegree: '2° Aries', directDegree: '27° Pisces', sign: 'Aries/Pisces', shadowPre: '2025-03-10', shadowPost: '2026-03-20' },
  // Pluto
  { planet: 'Pluto', year: 2025, stationRx: '2025-05-04', stationDirect: '2025-10-13', rxDegree: '4° Aquarius', directDegree: '1° Aquarius', sign: 'Aquarius', shadowPre: '2025-01-20', shadowPost: '2026-01-25' },
];

// ─── Calculations ───────────────────────────────────────────────────

export function calculateMutualReceptions(srChart: SolarReturnChart): SRMutualReception[] {
  const receptions: SRMutualReception[] = [];
  const planets = PLANETS_CORE;
  
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];
      const pos1 = srChart.planets[p1 as keyof typeof srChart.planets];
      const pos2 = srChart.planets[p2 as keyof typeof srChart.planets];
      if (!pos1 || !pos2) continue;

      // Domicile mutual reception: P1 in P2's domicile sign AND P2 in P1's domicile sign
      const p1InP2Domain = domicileSigns[p2]?.includes(pos1.sign);
      const p2InP1Domain = domicileSigns[p1]?.includes(pos2.sign);
      
      if (p1InP2Domain && p2InP1Domain) {
        receptions.push({
          planet1: p1, planet1Sign: pos1.sign,
          planet2: p2, planet2Sign: pos2.sign,
          type: 'domicile',
          interpretation: `${p1} in ${pos1.sign} and ${p2} in ${pos2.sign} form a domicile mutual reception — each planet is in the other's home sign. They support each other powerfully, creating a hidden channel of cooperation. ${p1}'s themes and ${p2}'s themes work as a team this year, even if they are in different houses.`,
        });
        continue;
      }

      // Exaltation mutual reception
      const p1InP2Exalt = exaltationSigns[p2] === pos1.sign;
      const p2InP1Exalt = exaltationSigns[p1] === pos2.sign;

      if (p1InP2Exalt && p2InP1Exalt) {
        receptions.push({
          planet1: p1, planet1Sign: pos1.sign,
          planet2: p2, planet2Sign: pos2.sign,
          type: 'exaltation',
          interpretation: `${p1} in ${pos1.sign} and ${p2} in ${pos2.sign} form an exaltation mutual reception — each planet is in the sign where the other is exalted. This creates a refined, elevated exchange of energy between ${p1} and ${p2} this year.`,
        });
        continue;
      }

      // Mixed reception (one domicile, one exaltation)
      if ((p1InP2Domain && p2InP1Exalt) || (p1InP2Exalt && p2InP1Domain)) {
        receptions.push({
          planet1: p1, planet1Sign: pos1.sign,
          planet2: p2, planet2Sign: pos2.sign,
          type: 'mixed',
          interpretation: `${p1} in ${pos1.sign} and ${p2} in ${pos2.sign} form a mixed mutual reception — one planet is in the other's domicile while the reverse is an exaltation. This creates a supportive but asymmetric exchange between ${p1} and ${p2}'s themes.`,
        });
      }
    }
  }
  return receptions;
}

export function calculateDignityReport(
  srChart: SolarReturnChart,
  planetSRHouses: Record<string, number | null>
): SRDignityReport {
  const scoreMap: Record<string, number> = {
    'Domicile': 5, 'Exaltation': 4, 'Peregrine': 0, 'Detriment': -3, 'Fall': -4,
  };

  const dignityInterps: Record<string, Record<string, string>> = {
    Domicile: {
      default: 'is in its home sign — operating at full strength, comfortable, and expressing its nature freely.',
    },
    Exaltation: {
      default: 'is elevated and honored — performing at its best, with enhanced clarity and purpose.',
    },
    Detriment: {
      default: 'is in the sign opposite its home — working against its natural grain. Extra effort is needed to express this energy constructively.',
    },
    Fall: {
      default: 'is in the sign opposite its exaltation — at its most challenged position. The planet\'s gifts are muted or misapplied without conscious work.',
    },
    Peregrine: {
      default: 'has no essential dignity here — it operates without special advantage or disadvantage, relying purely on aspects and house placement for expression.',
    },
  };

  const entries: SRDignityEntry[] = [];
  
  for (const planet of PLANETS_CORE) {
    const pos = srChart.planets[planet as keyof typeof srChart.planets];
    if (!pos) continue;
    const dignity = getDignity(planet, pos.sign);
    const score = scoreMap[dignity] || 0;
    const isRetrograde = !!(pos as any).isRetrograde;
    const baseInterp = dignityInterps[dignity]?.default || '';
    const rxNote = isRetrograde ? ` Being retrograde adds an inward, reflective quality — ${planet}'s expression turns internal before manifesting externally.` : '';
    
    entries.push({
      planet,
      sign: pos.sign,
      dignity,
      score: isRetrograde ? score - 1 : score,
      isRetrograde,
      interpretation: `${planet} in ${pos.sign} ${baseInterp}${rxNote}`,
    });
  }

  const totalScore = entries.reduce((s, e) => s + e.score, 0);
  const sorted = [...entries].sort((a, b) => b.score - a.score);
  const strongest = sorted[0]?.planet || '';
  // Exclude Sun from weakest consideration — Sun is always in fall in a Solar Return chart
  const nonSunSorted = sorted.filter(e => e.planet !== 'Sun');
  const weakest = nonSunSorted.length > 0 ? nonSunSorted[nonSunSorted.length - 1]?.planet || '' : sorted[sorted.length - 1]?.planet || '';

  const totalInterp = totalScore > 10
    ? 'The chart has strong essential dignity — multiple planets are well-placed, giving the year a sense of competence and natural flow.'
    : totalScore > 0
    ? 'The chart has moderate essential dignity — some planets are well-placed while others require more effort. A balanced year of both ease and challenge.'
    : totalScore > -5
    ? 'The chart has mixed dignity — several planets are in uncomfortable signs. Growth comes through working harder with less natural support.'
    : 'The chart has challenging essential dignity — many planets are in difficult positions. This is a year of building strength through adversity and conscious effort.';

  // Add note about Sun always being in fall in SR
  const sunEntry = entries.find(e => e.planet === 'Sun');
  if (sunEntry && sunEntry.dignity === 'Fall') {
    sunEntry.interpretation += ' Note: Sun is in fall in every Solar Return chart by definition — this is expected and does not indicate weakness.';
  }

  return {
    entries,
    totalScore,
    strongestPlanet: strongest,
    weakestPlanet: weakest,
    interpretation: totalInterp,
  };
}

export function calculateHealthOverlay(
  srChart: SolarReturnChart,
  natalChart: NatalChart,
  planetSRHouses: Record<string, number | null>,
  srInternalAspects: any[]
): SRHealthReport {
  const overlays: SRHealthOverlay[] = [];
  const primaryConcerns: string[] = [];
  const supportiveFactors: string[] = [];

  const HARD_ASPECTS = ['Conjunction', 'Square', 'Opposition'];

  for (const planet of PLANETS_CORE) {
    const pos = srChart.planets[planet as keyof typeof srChart.planets];
    if (!pos) continue;
    const body = PLANET_BODY[planet];
    if (!body) continue;
    const house = planetSRHouses[planet] ?? null;
    const dignity = getDignity(planet, pos.sign);
    const isStressed = dignity === 'Detriment' || dignity === 'Fall' ||
      srInternalAspects.some((a: any) => 
        (a.planet1 === planet || a.planet2 === planet) && HARD_ASPECTS.includes(a.type)
      );


    const BODY_PLAIN: Record<string, string> = {
      Sun: 'your overall vitality and energy levels',
      Moon: 'your emotional wellbeing and digestion',
      Mercury: 'your nervous system and mental clarity',
      Venus: 'your throat, skin, and hormonal balance',
      Mars: 'your physical energy, muscles, and inflammation',
      Jupiter: 'your liver, weight management, and circulation',
      Saturn: 'your bones, joints, teeth, and long-term stamina',
      Uranus: 'your nervous system and stress responses',
      Neptune: 'your immune system and sensitivity to substances',
      Pluto: 'your reproductive system and deep-body processes',
    };

    const plainPlanet = BODY_PLAIN[planet] || `your ${body.area.toLowerCase()}`;
    const houseNote = house === 6 ? ' Because this falls in your health and daily routine area, pay extra attention to wellness habits.' :
                      house === 12 ? ' This is in a quieter area of your chart, so health matters here may show up subtly — listen to what your body is telling you.' :
                      house === 1 ? ' This directly affects your physical vitality and how energized you feel day to day.' : '';

    overlays.push({
      planet,
      sign: pos.sign,
      house,
      bodyArea: body.area,
      vulnerability: body.vulnerability,
      isStressed,
      interpretation: isStressed
        ? `${plainPlanet.charAt(0).toUpperCase() + plainPlanet.slice(1)} may need extra attention this year. Your body could be signaling through ${body.vulnerability.toLowerCase()} — treat these as invitations to take better care of yourself.${houseNote}`
        : `${plainPlanet.charAt(0).toUpperCase() + plainPlanet.slice(1)} ${dignity === 'Domicile' || dignity === 'Exaltation' ? 'are well-supported this year — a great time to build healthy habits in this area' : 'are in a neutral zone — maintain your regular wellness routines'}.${houseNote}`,
    });

    if (isStressed) {
      primaryConcerns.push(`Your ${body.area.toLowerCase()} may need extra care — watch for ${body.vulnerability.toLowerCase()}`);
    }
    if (dignity === 'Domicile' || dignity === 'Exaltation') {
      supportiveFactors.push(`Your ${body.area.toLowerCase()} is well-supported — a great year to invest in ${body.area.toLowerCase()} wellness`);
    }
  }

  // Check 6th house emphasis
  const sixthHousePlanets = PLANETS_CORE.filter(p => planetSRHouses[p] === 6);
  if (sixthHousePlanets.length >= 2) {
    primaryConcerns.push('Your health and daily routine area is very active this year — make wellness habits a priority');
  }

  return {
    overlays,
    primaryConcerns,
    supportiveFactors,
    interpretation: primaryConcerns.length === 0
      ? 'No major health flags in your chart this year — maintain your regular wellness routines and listen to your body\'s signals.'
      : `${primaryConcerns.length} area${primaryConcerns.length > 1 ? 's' : ''} of your health may benefit from extra attention this year. These aren\'t predictions — they\'re gentle nudges to take care of yourself in specific ways.`,
  };
}

export function calculateEclipseSensitivity(
  srChart: SolarReturnChart,
  natalChart: NatalChart,
  srYear: number,
  solarReturnDateTime?: string,
  birthDate?: string,
): SREclipseSensitivity[] {
  const results: SREclipseSensitivity[] = [];
  const ORB = 5; // degrees

  const startDate = (() => {
    if (solarReturnDateTime) {
      const parsed = new Date(solarReturnDateTime);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }

    if (birthDate) {
      const [_, month, day] = birthDate.split('-').map(Number);
      if (month && day) {
        return new Date(Date.UTC(srYear, month - 1, day, 12, 0, 0));
      }
    }

    return new Date(Date.UTC(srYear, 0, 1, 0, 0, 0));
  })();

  const endDate = new Date(startDate);
  endDate.setUTCFullYear(endDate.getUTCFullYear() + 1);

  // Filter eclipses relevant to the Solar Return year window (birthday to birthday)
  const relevantEclipses = ECLIPSES_2025_2027.filter(e => {
    const eclipseDate = new Date(`${e.date}T00:00:00Z`);
    return eclipseDate >= startDate && eclipseDate < endDate;
  });

  for (const eclipse of relevantEclipses) {
    const eclipseAbsDeg = SIGNS.indexOf(eclipse.sign) * 30 + eclipse.degree;

    // Check SR planets
    for (const planet of PLANETS_CORE) {
      const pos = srChart.planets[planet as keyof typeof srChart.planets];
      if (!pos) continue;
      const pDeg = toAbsDeg(pos);
      if (pDeg === null) continue;
      let diff = Math.abs(pDeg - eclipseAbsDeg);
      if (diff > 180) diff = 360 - diff;
      if (diff <= ORB) {
        results.push({
          eclipseType: eclipse.type,
          eclipseSign: eclipse.sign,
          eclipseDegree: eclipse.degree,
          eclipseDate: eclipse.date,
          sensitizedPlanet: planet,
          sensitizedPlanetSource: 'SR',
          orb: Math.round(diff * 10) / 10,
          interpretation: `The ${eclipse.type} eclipse at ${eclipse.degree}° ${eclipse.sign} (${eclipse.date}) falls within ${Math.round(diff)}° of SR ${planet}. Eclipse activation of ${planet} brings sudden, fated shifts to ${planet}'s themes — events feel larger than ordinary life and may have lasting consequences.`,
        });
      }
    }

    // Check SR angles
    for (const angle of [
      { name: 'Ascendant', pos: srChart.houseCusps?.house1 },
      { name: 'Midheaven', pos: srChart.houseCusps?.house10 },
    ]) {
      const aDeg = toAbsDeg(angle.pos);
      if (aDeg === null) continue;
      let diff = Math.abs(aDeg - eclipseAbsDeg);
      if (diff > 180) diff = 360 - diff;
      if (diff <= ORB) {
        results.push({
          eclipseType: eclipse.type,
          eclipseSign: eclipse.sign,
          eclipseDegree: eclipse.degree,
          eclipseDate: eclipse.date,
          sensitizedPlanet: angle.name,
          sensitizedPlanetSource: 'SR',
          orb: Math.round(diff * 10) / 10,
          interpretation: `The ${eclipse.type} eclipse at ${eclipse.degree}° ${eclipse.sign} (${eclipse.date}) falls near your Solar Return ${angle.name}. This makes the eclipse highly visible in lived experience — identity shifts, directional pivots, and outer-life changes are more likely to show up around this eclipse window.`,
        });
      }
    }

    // Check natal planets
    for (const planet of PLANETS_CORE) {
      const pos = natalChart.planets[planet as keyof typeof natalChart.planets];
      if (!pos) continue;
      const pDeg = toAbsDeg(pos);
      if (pDeg === null) continue;
      let diff = Math.abs(pDeg - eclipseAbsDeg);
      if (diff > 180) diff = 360 - diff;
      if (diff <= ORB) {
        results.push({
          eclipseType: eclipse.type,
          eclipseSign: eclipse.sign,
          eclipseDegree: eclipse.degree,
          eclipseDate: eclipse.date,
          sensitizedPlanet: planet,
          sensitizedPlanetSource: 'Natal',
          orb: Math.round(diff * 10) / 10,
          interpretation: `The ${eclipse.type} eclipse at ${eclipse.degree}° ${eclipse.sign} (${eclipse.date}) activates your natal ${planet}. This triggers a deeper, more personal response — natal planets activated by eclipses mark turning points that connect to your lifelong patterns around ${planet}'s themes.`,
        });
      }
    }

    // Check natal angles. An eclipse at degree X is on the ASC/MC if it's
    // within orb of that angle, OR opposite (within orb of angle±180), which
    // means it activates the DSC/IC respectively.
    const ANGLE_THEMES: Record<string, string> = {
      Ascendant: 'identity, self-image, body, appearance, and personal initiative',
      Descendant: 'partnerships, marriage, contracts, one-on-one relationships, and how you meet "the other"',
      Midheaven: 'career, public reputation, authority, visibility, professional identity, and achievement',
      'Imum Coeli': 'home, family, roots, ancestry, private life, and inner foundations',
    };
    const ANGLE_OPPOSITES: Record<string, string> = {
      Ascendant: 'Descendant',
      Midheaven: 'Imum Coeli',
    };
    for (const angle of [
      { name: 'Ascendant', pos: natalChart.houseCusps?.house1 },
      { name: 'Midheaven', pos: natalChart.houseCusps?.house10 },
    ]) {
      const aDeg = toAbsDeg(angle.pos);
      if (aDeg === null) continue;
      let diff = Math.abs(aDeg - eclipseAbsDeg);
      if (diff > 180) diff = 360 - diff;
      // diff to angle directly = activates angle.name; diff close to 180 = activates opposite angle
      const directDiff = diff;
      const oppositeDiff = Math.abs(180 - diff);
      let hitName: string | null = null;
      let hitOrb = 0;
      if (directDiff <= ORB) { hitName = angle.name; hitOrb = directDiff; }
      else if (oppositeDiff <= ORB) { hitName = ANGLE_OPPOSITES[angle.name]; hitOrb = oppositeDiff; }
      if (hitName) {
        const themes = ANGLE_THEMES[hitName] || 'a key life area';
        results.push({
          eclipseType: eclipse.type,
          eclipseSign: eclipse.sign,
          eclipseDegree: eclipse.degree,
          eclipseDate: eclipse.date,
          sensitizedPlanet: hitName,
          sensitizedPlanetSource: 'Natal',
          orb: Math.round(hitOrb * 10) / 10,
          interpretation: `The ${eclipse.type} eclipse at ${eclipse.degree}° ${eclipse.sign} (${eclipse.date}) activates your natal ${hitName}. This points to an especially personal turning point in ${themes}.`,
        });
      }
    }
  }

  results.sort((a, b) => a.orb - b.orb);
  return results;
}

export function calculateEnhancedRetrogrades(
  srChart: SolarReturnChart,
  srYear: number
): SREnhancedRetrograde[] {
  const results: SREnhancedRetrograde[] = [];

  for (const planet of PLANETS_CORE) {
    if (planet === 'Sun' || planet === 'Moon') continue; // never retrograde
    const pos = srChart.planets[planet as keyof typeof srChart.planets];
    if (!pos || !(pos as any).isRetrograde) continue;

    // Find matching retrograde period
    const period = RETRO_PERIODS.find(r => 
      r.planet === planet && (r.year === srYear || r.year === srYear - 1)
    );

    const house = null; // will be filled by caller from planetSRHouses

    const RETRO_PLAIN: Record<string, string> = {
      Mercury: 'This is a period for slowing down communication, double-checking plans, and revisiting old ideas rather than launching new ones. Expect travel hiccups and contract delays. Use them as invitations to refine.',
      Venus: 'Your relationship and financial patterns are up for review. Old connections may reappear, giving you a chance to find closure or reconnect. Take your time with big purchases and romantic decisions.',
      Mars: 'Your drive and ambition are turned inward right now. You may feel frustrated that things aren\'t moving faster, but this is a powerful time for revising goals and redirecting energy toward what truly matters.',
      Jupiter: 'Growth is happening on the inside this year. Outer opportunities may slow down, but your inner wisdom and philosophical understanding are expanding in important ways.',
      Saturn: 'The structures and responsibilities in your life need internal reorganization. Progress feels slow because the real work is psychological. Reassess what commitments still serve you.',
      Uranus: 'You\'re quietly questioning where you\'ve been playing it safe or being inauthentic. The changes brewing inside will become visible later. For now, trust the inner restlessness.',
      Neptune: 'Your imagination, dreams, and intuition are especially vivid. Creative inspiration comes more easily, and your inner spiritual life deepens. Pay attention to what surfaces in quiet moments.',
      Pluto: 'Deep personal transformation is happening beneath the surface. Power dynamics in your relationships are shifting internally. You\'re processing changes that will become clear over time.',
    };

    const keyDates = period ? ` Key dates to watch: the review period begins around ${period.shadowPre}, the most intense reflection runs from ${period.stationRx} to ${period.stationDirect}, and things clear up by ${period.shadowPost}.` : '';

    results.push({
      planet,
      retrograde: true,
      sign: pos.sign,
      house,
      stationRetroDate: period?.stationRx || '',
      stationDirectDate: period?.stationDirect || '',
      retroDegree: period?.rxDegree || `${pos.degree}° ${pos.sign}`,
      directDegree: period?.directDegree || '',
      shadowPreStart: period?.shadowPre || '',
      shadowPostEnd: period?.shadowPost || '',
      interpretation: (RETRO_PLAIN[planet] || 'This area of your life is in a review and revision phase. Take your time before making big moves.') + keyDates,
    });
  }

  return results;
}

export function calculateQuarterlyFocus(
  srChart: SolarReturnChart,
  natalChart: NatalChart,
  planetSRHouses: Record<string, number | null>,
  srYear: number,
  birthMonth: number
): SRQuarterlyFocus[] {
  const quarters: SRQuarterlyFocus[] = [];
  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const houseThemes: Record<number, string> = {
    1: 'Identity & self-image', 2: 'Finances & values', 3: 'Communication & learning',
    4: 'Home & family', 5: 'Creativity & romance', 6: 'Health & daily work',
    7: 'Partnerships', 8: 'Transformation & shared resources', 9: 'Travel & philosophy',
    10: 'Career & reputation', 11: 'Community & future goals', 12: 'Spirituality & inner work',
  };

  // Quarter definitions based on angular houses:
  // Q1 (birthday + 0-3 months): Houses 10, 11, 12 (MC quadrant)
  // Q2 (birthday + 3-6 months): Houses 7, 8, 9 (DSC quadrant)
  // Q3 (birthday + 6-9 months): Houses 4, 5, 6 (IC quadrant)
  // Q4 (birthday + 9-12 months): Houses 1, 2, 3 (ASC quadrant)
  const quarterHouses: [number[], number[], number[], number[]] = [
    [10, 11, 12],
    [7, 8, 9],
    [4, 5, 6],
    [1, 2, 3],
  ];

  for (let q = 0; q < 4; q++) {
    const startMonth = (birthMonth + q * 3) % 12;
    const monthRange = [0, 1, 2].map(offset => MONTH_NAMES[(startMonth + offset) % 12]);
    const houses = quarterHouses[q];
    
    const activePlanets = PLANETS_CORE.filter(p => {
      const h = planetSRHouses[p];
      return h !== null && h !== undefined && houses.includes(h);
    });

    const themes = houses
      .filter(h => activePlanets.some(p => planetSRHouses[p] === h))
      .map(h => houseThemes[h] || `House ${h}`);

    if (themes.length === 0) {
      // Add default themes from the houses even without planets
      themes.push(...houses.map(h => houseThemes[h] || `House ${h}`));
    }

    const intensity = activePlanets.length >= 3 ? 'high' : activePlanets.length >= 1 ? 'moderate' : 'quiet';

    const focusSummary = intensity === 'high'
      ? `High-energy focus on ${themes.slice(0, 2).join(' and ').toLowerCase()}`
      : intensity === 'moderate'
      ? `Steady progress in ${themes.slice(0, 2).join(' and ').toLowerCase()}`
      : `Quieter period for reflection on ${themes.slice(0, 2).join(' and ').toLowerCase()}`;

    quarters.push({
      quarter: (q + 1) as 1 | 2 | 3 | 4,
      label: `Q${q + 1}`,
      months: monthRange.join(', '),
      dominantThemes: themes,
      activePlanets,
      interpretation: `${monthRange[0]}–${monthRange[2]}: ${
        intensity === 'high' ? `A highly active quarter with ${activePlanets.join(', ')} energizing` :
        intensity === 'moderate' ? `${activePlanets.join(', ')} activate${activePlanets.length === 1 ? 's' : ''}` :
        'A quieter quarter with focus on'
      } ${themes.slice(0, 2).join(' and ').toLowerCase()}. ${
        intensity === 'high' ? 'Multiple planetary energies converge. Expect significant developments.' :
        intensity === 'moderate' ? 'Steady progress in these life areas.' :
        'Use this time for reflection and preparation.'
      }`,
      focus: focusSummary,
    });
  }

  return quarters;
}

// ─── Dominant Planets Engine ────────────────────────────────────────

export interface SRDominantPlanetBreakdown {
  sign: number;
  house: number;
  angle: number;
  ruler: number;
  aspects: number;
}

export interface SRDominantPlanetEntry {
  planet: string;
  rank: number;
  totalScore: number;
  percentage: number;
  breakdown: SRDominantPlanetBreakdown;
  dignity: string;
  tags: string[];
}

export interface SRDominantPlanetsReport {
  entries: SRDominantPlanetEntry[];
  captain: string;      // highest total score = most dominant
  starPlayer: string;   // highest dignity score = most technically skilled
  billboard: string;    // closest to MC = most publicly visible
  captainScore: number;
  interpretation: string;
}

const DOMINANT_PLANETS = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','NorthNode'];

export function calculateDominantPlanets(
  srChart: SolarReturnChart,
  natalChart: NatalChart,
  planetSRHouses: Record<string, number | null>,
  angularPlanetsDetailed: { planet: string; angle: string; sign: string; house: number; orb: number }[],
  srToNatalAspects: { planet1: string; planet2: string; type: string; orb: number; importance?: number }[],
  srInternalAspects: { planet1: string; planet2: string; type: string; orb: number }[],
  timeLord?: string | null,
): SRDominantPlanetsReport {
  const results: { planet: string; breakdown: SRDominantPlanetBreakdown; dignity: string; tags: string[] }[] = [];

  // Determine ASC and MC signs for rulership scoring
  const ascSign = srChart.houseCusps?.house1?.sign || '';
  const mcSign = srChart.houseCusps?.house10?.sign || '';

  for (const planet of DOMINANT_PLANETS) {
    const pos = srChart.planets[planet as keyof typeof srChart.planets];
    if (!pos) continue;

    const tags: string[] = [];

    // 1. Sign dignity (0-5, no negatives)
    const dignity = getDignity(planet, pos.sign);
    const signScoreMap: Record<string, number> = { 'Domicile': 5, 'Exaltation': 4, 'Peregrine': 0, 'Detriment': 0, 'Fall': 0 };
    const signScore = signScoreMap[dignity] ?? 0;
    if (dignity === 'Domicile') tags.push('Domicile');
    if (dignity === 'Exaltation') tags.push('Exaltation');

    // 2. House placement (1-5)
    const house = planetSRHouses[planet];
    let houseScore = 1;
    if (house) {
      if ([1, 4, 7, 10].includes(house)) { houseScore = 5; tags.push('Angular'); }
      else if ([2, 5, 8, 11].includes(house)) houseScore = 3;
      else houseScore = 1;
    }

    // 3. Angle proximity (0-6)
    let angleScore = 0;
    const angleHits = angularPlanetsDetailed.filter(a => a.planet === planet);
    for (const hit of angleHits) {
      const score = Math.max(0, (8 - hit.orb) / 8 * 6);
      if (score > angleScore) angleScore = score;
    }
    if (angleScore > 3) tags.push('On Angle');
    angleScore = Math.round(angleScore * 10) / 10;

    // 4. Rulership (0-7)
    let rulerScore = 0;
    if (ascSign && traditionalRuler[ascSign] === planet) { rulerScore += 4; tags.push('Chart Ruler'); }
    if (mcSign && traditionalRuler[mcSign] === planet) { rulerScore += 3; tags.push('MC Ruler'); }
    // Hybrid bonus: Sun/Moon sign rulership (+1 each)
    const sunSign = srChart.planets.Sun?.sign;
    const moonSign = srChart.planets.Moon?.sign;
    if (sunSign && traditionalRuler[sunSign] === planet && planet !== 'Sun') rulerScore += 1;
    if (moonSign && traditionalRuler[moonSign] === planet && planet !== 'Moon') rulerScore += 1;

    // 5. Aspect count and weight (0-10, capped)
    let aspectScore = 0;
    const ASPECT_BASE: Record<string, number> = {
      'Conjunction': 2, 'Opposition': 1.5, 'Trine': 1.5, 'Square': 1.5, 'Sextile': 1.5,
      'Semi-Sextile': 0.5, 'Quincunx': 0.5, 'Semi-Square': 0.5, 'Sesquiquadrate': 0.5,
    };

    // SR internal aspects
    for (const asp of srInternalAspects) {
      if (asp.planet1 !== planet && asp.planet2 !== planet) continue;
      const base = ASPECT_BASE[asp.type] || 0.5;
      const orbFactor = Math.max(0.3, (8 - asp.orb) / 8);
      aspectScore += base * orbFactor;
    }

    // SR-to-natal aspects (weighted by importance)
    for (const asp of srToNatalAspects) {
      if (asp.planet1 !== planet && asp.planet2 !== planet) continue;
      const base = ASPECT_BASE[asp.type] || 0.5;
      const orbFactor = Math.max(0.3, (8 - asp.orb) / 8);
      const importanceFactor = asp.importance ? 1.5 * (asp.importance / 10) : 1;
      aspectScore += base * orbFactor * importanceFactor;
    }

    aspectScore = Math.min(10, Math.round(aspectScore * 10) / 10);
    if (aspectScore >= 7) tags.push('Highly Connected');

    results.push({
      planet,
      breakdown: { sign: signScore, house: houseScore, angle: angleScore, ruler: rulerScore, aspects: aspectScore },
      dignity,
      tags,
    });
  }

  // Calculate totals and rank.
  // Time Lord boost: the profection ruler is the year's "Lord of the Year" and
  // must rank highly. Without this, an undignified Sun/ruler can fall to the
  // bottom of the list while still being "the driving force" elsewhere in the report.
  const scored = results.map(r => {
    const isTimeLord = !!timeLord && r.planet === timeLord;
    if (isTimeLord && !r.tags.includes('Time Lord')) r.tags.push('Time Lord');
    const raw = r.breakdown.sign + r.breakdown.house + r.breakdown.angle + r.breakdown.ruler + r.breakdown.aspects;
    const boosted = isTimeLord ? raw * 2.0 : raw;
    return { ...r, totalScore: Math.round(boosted * 10) / 10 };
  });
  scored.sort((a, b) => b.totalScore - a.totalScore);

  const maxScore = scored[0]?.totalScore || 1;
  const entries: SRDominantPlanetEntry[] = scored.map((s, i) => ({
    planet: s.planet,
    rank: i + 1,
    totalScore: s.totalScore,
    percentage: Math.round((s.totalScore / maxScore) * 100),
    breakdown: s.breakdown,
    dignity: s.dignity,
    tags: s.tags,
  }));

  const captain = entries[0]?.planet || '';
  const starPlayer = [...entries].sort((a, b) => b.breakdown.sign - a.breakdown.sign)[0]?.planet || '';

  // Billboard = closest to MC
  let billboard = '';
  let closestMCOrb = 999;
  for (const ap of angularPlanetsDetailed) {
    if ((ap.angle === 'Midheaven' || ap.angle === 'MC') && ap.orb < closestMCOrb) {
      closestMCOrb = ap.orb;
      billboard = ap.planet;
    }
  }
  if (!billboard) billboard = entries[0]?.planet || '';

  const top3 = entries.slice(0, 3).map(e => e.planet);
  const interpretation = `${captain} is your most dominant planet this year with ${entries[0]?.totalScore} points — it has the most influence over your chart through a combination of ${entries[0]?.tags.length > 0 ? entries[0].tags.join(', ').toLowerCase() : 'placement and aspects'}. ${
    starPlayer !== captain ? `${starPlayer} is your strongest planet by dignity — most comfortable in its sign. ` : ''
  }${billboard !== captain ? `${billboard} is your most elevated planet (closest to the Midheaven) — what the world sees first. ` : ''
  }Your top three: ${top3.join(', ')}.`;

  return {
    entries,
    captain,
    starPlayer,
    billboard,
    captainScore: entries[0]?.totalScore || 0,
    interpretation,
  };
}

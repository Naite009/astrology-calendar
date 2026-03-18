/**
 * Tier 5 Solar Return Analysis
 * - Fixed Star Conjunctions
 * - Arabic Parts (Lots)
 * - Firdaria (Persian Time Lords)
 * - Antiscia & Contra-Antiscia
 * - Solar Arc Directions
 * - Synthesis Sections (Relationship, Career, Spiritual)
 */

import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const toAbsDeg = (pos: any): number | null => {
  if (!pos) return null;
  const idx = SIGNS.indexOf(pos.sign);
  if (idx < 0) return null;
  return idx * 30 + (pos.degree || 0) + ((pos as any).minutes || 0) / 60;
};

const degToSignPos = (deg: number): { sign: string; degree: number; minutes: number } => {
  let d = ((deg % 360) + 360) % 360;
  const signIdx = Math.floor(d / 30);
  const signDeg = d - signIdx * 30;
  return { sign: SIGNS[signIdx], degree: Math.floor(signDeg), minutes: Math.round((signDeg % 1) * 60) };
};

// ─── Types ──────────────────────────────────────────────────────────

export interface SRFixedStar {
  starName: string;
  magnitude: number;
  nature: string;
  starSign: string;
  starDegree: number;
  conjunctPlanet: string;
  conjunctPlanetSource: 'SR' | 'Natal';
  orb: number;
  interpretation: string;
}

export interface SRArabicPart {
  name: string;
  formula: string;
  sign: string;
  degree: number;
  minutes: number;
  house: number | null;
  interpretation: string;
}

export interface SRFirdariaEntry {
  mainLord: string;
  subLord: string;
  periodStart: number; // age
  periodEnd: number;
  isCurrent: boolean;
  interpretation: string;
}

export interface SRFirdariaReport {
  currentMainLord: string;
  currentSubLord: string;
  currentPeriodYears: string;
  entries: SRFirdariaEntry[];
  interpretation: string;
}

export interface SRAntisciaContact {
  planet1: string;
  planet1Source: 'SR' | 'Natal';
  planet1Degree: string;
  antisciaPoint: string;
  planet2: string;
  planet2Source: 'SR' | 'Natal';
  planet2Degree: string;
  orb: number;
  type: 'antiscia' | 'contra-antiscia';
  interpretation: string;
}

export interface SRSolarArc {
  natalPlanet: string;
  arcedSign: string;
  arcedDegree: number;
  aspectToSRPlanet: string;
  aspectType: string;
  orb: number;
  interpretation: string;
}

export interface SRSynthesisSection {
  title: string;
  theme: string;
  keyPlanets: string[];
  keyHouses: number[];
  strength: 'strong' | 'moderate' | 'quiet';
  highlights: string[];
  interpretation: string;
}

// ─── Fixed Stars Catalog (epoch 2000, precession ~1°/72yr) ──────────

interface StarData {
  name: string;
  longitude2000: number; // absolute ecliptic degrees
  magnitude: number;
  nature: string;
  interpretation: string;
}

const FIXED_STARS: StarData[] = [
  { name: 'Algol', longitude2000: 56.17, magnitude: 2.1, nature: 'Saturn-Jupiter', interpretation: 'The "Demon Star" — intense, transformative energy. Can indicate a year of facing shadows, power struggles, or breakthroughs through crisis. Associated with intense passion and the ability to literally "lose your head" over something.' },
  { name: 'Alcyone (Pleiades)', longitude2000: 60.0, magnitude: 2.9, nature: 'Moon-Mars', interpretation: 'The weeping sisters — emotional intensity, ambition, and dealing with loss or longing. A drive to achieve but with an undercurrent of sadness or nostalgia.' },
  { name: 'Aldebaran', longitude2000: 69.85, magnitude: 0.85, nature: 'Mars', interpretation: 'The "Eye of the Bull" — one of the four Royal Stars. Integrity, honor, and success through moral courage. A year of standing firm in your values and being tested for authenticity. Success comes when you refuse to compromise your principles.' },
  { name: 'Rigel', longitude2000: 76.97, magnitude: 0.12, nature: 'Jupiter-Saturn', interpretation: 'The "Foot of Orion" — ambition, education, and intellectual achievement. A year favoring teaching, publishing, or large-scale projects. Benevolent influence supporting growth through knowledge.' },
  { name: 'Sirius', longitude2000: 104.07, magnitude: -1.46, nature: 'Jupiter-Mars', interpretation: 'The brightest star — ambition, fame, honor, and high achievement. A year of burning brilliance, but also the risk of burning too hot. Associated with guardian spirits, devotion, and wealth. Success is amplified but so is scrutiny.' },
  { name: 'Castor', longitude2000: 110.2, magnitude: 1.6, nature: 'Mercury', interpretation: 'The mortal twin — intellectual brilliance, writing, and creative partnerships. Quick mind, versatility, but potential for sudden reversals or injuries.' },
  { name: 'Pollux', longitude2000: 113.22, magnitude: 1.14, nature: 'Mars', interpretation: 'The immortal twin — bold, athletic, and competitive energy. A year of courage and willingness to fight for what matters. Can also indicate cruelty if poorly channeled.' },
  { name: 'Regulus', longitude2000: 149.83, magnitude: 1.35, nature: 'Jupiter-Mars', interpretation: 'The "Heart of the Lion" — one of the four Royal Stars. Leadership, authority, and success through generosity. A year of commanding respect and stepping into power. The warning: success is lost through revenge or petty behavior.' },
  { name: 'Spica', longitude2000: 203.83, magnitude: 0.97, nature: 'Venus-Mercury', interpretation: 'The brightest star of Virgo — brilliance, gifts, and harvest. One of the most fortunate fixed stars. A year of reaping rewards, artistic talent, and receiving what you have earned. Associated with skill, craft, and excellence.' },
  { name: 'Arcturus', longitude2000: 204.15, magnitude: -0.04, nature: 'Jupiter-Mars', interpretation: 'The "Bear Guardian" — pathfinding, innovation, and doing things differently. A year of finding your own way, often through unconventional methods. Success through independence and original thinking.' },
  { name: 'Antares', longitude2000: 249.77, magnitude: 1.09, nature: 'Mars-Jupiter', interpretation: 'The "Heart of the Scorpion" — one of the four Royal Stars. Intensity, obsession, and strategic power. A year of high stakes, deep passion, and potential confrontation. Success through fearless engagement with what is difficult.' },
  { name: 'Vega', longitude2000: 285.27, magnitude: 0.03, nature: 'Venus-Mercury', interpretation: 'The "Harp Star" — charisma, artistic talent, and public appeal. A year of creativity, performance, and social magnetism. Associated with magic, music, and the ability to enchant others.' },
  { name: 'Fomalhaut', longitude2000: 333.87, magnitude: 1.16, nature: 'Venus-Mercury', interpretation: 'The "Mouth of the Fish" — one of the four Royal Stars. Dreams, idealism, and spiritual vision. A year of pursuing a high ideal, but the warning is that success only holds if you remain ethical. Fame, mysticism, and transcendence.' },
  { name: 'Scheat', longitude2000: 349.37, magnitude: 2.42, nature: 'Saturn-Mercury', interpretation: 'Associated with independent thinking but also potential misfortune through stubbornness. A year where going against the grain has both rewards and consequences.' },
];

// ─── Firdaria Sequence ──────────────────────────────────────────────

interface FirdariaPeriod {
  lord: string;
  years: number;
  startAge: number;
}

// Day birth firdaria sequence (most common)
const FIRDARIA_DAY: { lord: string; years: number }[] = [
  { lord: 'Sun', years: 10 },
  { lord: 'Venus', years: 8 },
  { lord: 'Mercury', years: 13 },
  { lord: 'Moon', years: 9 },
  { lord: 'Saturn', years: 11 },
  { lord: 'Jupiter', years: 12 },
  { lord: 'Mars', years: 7 },
  { lord: 'North Node', years: 3 },
  { lord: 'South Node', years: 2 },
];

// Sub-lords cycle through the Chaldean order starting from the main lord
const CHALDEAN_ORDER = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];

function getFirdariaSubLords(mainLord: string, periodYears: number): { lord: string; years: number }[] {
  // For nodes, no sub-lords
  if (mainLord === 'North Node' || mainLord === 'South Node') {
    return [{ lord: mainLord, years: periodYears }];
  }
  
  const startIdx = CHALDEAN_ORDER.indexOf(mainLord);
  if (startIdx < 0) return [{ lord: mainLord, years: periodYears }];
  
  const subPeriodLength = periodYears / 7;
  const subs: { lord: string; years: number }[] = [];
  for (let i = 0; i < 7; i++) {
    subs.push({
      lord: CHALDEAN_ORDER[(startIdx + i) % 7],
      years: subPeriodLength,
    });
  }
  return subs;
}

// ─── Calculations ───────────────────────────────────────────────────

export function calculateFixedStars(
  srChart: SolarReturnChart,
  natalChart: NatalChart,
  srYear: number
): SRFixedStar[] {
  const results: SRFixedStar[] = [];
  const ORB = 1.5; // tight orb for fixed stars
  
  // Precession correction: ~1° per 72 years from epoch 2000
  const precessionCorrection = (srYear - 2000) / 72;

  const PLANETS = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];

  for (const star of FIXED_STARS) {
    const starDeg = star.longitude2000 + precessionCorrection;

    // Check SR planets
    for (const planet of PLANETS) {
      const pos = srChart.planets[planet as keyof typeof srChart.planets];
      if (!pos) continue;
      const pDeg = toAbsDeg(pos);
      if (pDeg === null) continue;
      let diff = Math.abs(pDeg - starDeg);
      if (diff > 180) diff = 360 - diff;
      if (diff <= ORB) {
        const starPos = degToSignPos(starDeg);
        results.push({
          starName: star.name,
          magnitude: star.magnitude,
          nature: star.nature,
          starSign: starPos.sign,
          starDegree: Math.round(starDeg * 10) / 10,
          conjunctPlanet: planet,
          conjunctPlanetSource: 'SR',
          orb: Math.round(diff * 10) / 10,
          interpretation: `SR ${planet} conjunct ${star.name} (${Math.round(diff * 10) / 10}° orb): ${star.interpretation}`,
        });
      }
    }

    // Check natal planets
    for (const planet of PLANETS) {
      const pos = natalChart.planets[planet as keyof typeof natalChart.planets];
      if (!pos) continue;
      const pDeg = toAbsDeg(pos);
      if (pDeg === null) continue;
      let diff = Math.abs(pDeg - starDeg);
      if (diff > 180) diff = 360 - diff;
      if (diff <= ORB) {
        const starPos = degToSignPos(starDeg);
        results.push({
          starName: star.name,
          magnitude: star.magnitude,
          nature: star.nature,
          starSign: starPos.sign,
          starDegree: Math.round(starDeg * 10) / 10,
          conjunctPlanet: planet,
          conjunctPlanetSource: 'Natal',
          orb: Math.round(diff * 10) / 10,
          interpretation: `Natal ${planet} conjunct ${star.name} (${Math.round(diff * 10) / 10}° orb): This is a lifelong contact — ${star.interpretation} This year's Solar Return activates this natal star conjunction.`,
        });
      }
    }
  }

  results.sort((a, b) => a.orb - b.orb);
  return results;
}

export function calculateArabicParts(
  srChart: SolarReturnChart,
  findSRHouse: (deg: number) => number | null
): SRArabicPart[] {
  const results: SRArabicPart[] = [];
  
  const asc = srChart.houseCusps?.house1;
  const sun = srChart.planets.Sun;
  const moon = srChart.planets.Moon;
  const venus = srChart.planets.Venus;
  const mars = srChart.planets.Mars;
  const saturn = srChart.planets.Saturn;
  const jupiter = srChart.planets.Jupiter;
  const mercury = srChart.planets.Mercury;

  const ascDeg = asc ? toAbsDeg(asc) : null;
  const sunDeg = sun ? toAbsDeg(sun) : null;
  const moonDeg = moon ? toAbsDeg(moon) : null;
  const venusDeg = venus ? toAbsDeg(venus) : null;
  const marsDeg = mars ? toAbsDeg(mars) : null;
  const saturnDeg = saturn ? toAbsDeg(saturn) : null;
  const jupiterDeg = jupiter ? toAbsDeg(jupiter) : null;
  const mercDeg = mercury ? toAbsDeg(mercury) : null;

  if (ascDeg === null || sunDeg === null || moonDeg === null) return results;

  const PARTS: { name: string; formula: string; calc: () => number | null; interp: string }[] = [
    {
      name: 'Part of Fortune (Fortuna)',
      formula: 'ASC + Moon − Sun',
      calc: () => ((ascDeg + moonDeg - sunDeg) % 360 + 360) % 360,
      interp: 'Where prosperity, luck, and material well-being flow most naturally this year. The Part of Fortune marks the point where your emotional needs (Moon) and life purpose (Sun) align with your visible self (ASC). Planets aspecting this point amplify or challenge your access to fortune.',
    },
    {
      name: 'Part of Spirit (Daimon)',
      formula: 'ASC + Sun − Moon',
      calc: () => ((ascDeg + sunDeg - moonDeg) % 360 + 360) % 360,
      interp: 'Where your conscious will and spiritual agency are strongest this year. The Part of Spirit represents where you can most effectively direct your intentions. While Fortune shows what comes to you, Spirit shows what you can actively create.',
    },
    {
      name: 'Part of Eros',
      formula: 'ASC + Venus − Mars',
      calc: () => venusDeg !== null && marsDeg !== null ? ((ascDeg + venusDeg - marsDeg) % 360 + 360) % 360 : null,
      interp: 'The point of passionate desire and erotic connection this year. Where Venus (attraction) meets Mars (pursuit) through your rising sign. This shows where romantic and creative passion is most alive.',
    },
    {
      name: 'Part of Necessity (Ananke)',
      formula: 'ASC + Fortune − Spirit',
      calc: () => {
        const fortune = ((ascDeg + moonDeg - sunDeg) % 360 + 360) % 360;
        const spirit = ((ascDeg + sunDeg - moonDeg) % 360 + 360) % 360;
        return ((ascDeg + fortune - spirit) % 360 + 360) % 360;
      },
      interp: 'Where fate and unavoidable circumstance exert the strongest pull this year. The Part of Necessity shows what you must deal with whether you choose to or not — the non-negotiable themes of the year.',
    },
    {
      name: 'Part of Marriage',
      formula: 'ASC + Venus − Saturn',
      calc: () => venusDeg !== null && saturnDeg !== null ? ((ascDeg + venusDeg - saturnDeg) % 360 + 360) % 360 : null,
      interp: 'The point of committed partnership and formal bonds this year. Where Venus (love) is anchored by Saturn (commitment) through your visible self. Active when engagement, marriage, or formalization of relationships is in focus.',
    },
    {
      name: 'Part of Commerce',
      formula: 'ASC + Mercury − Sun',
      calc: () => mercDeg !== null ? ((ascDeg + mercDeg - sunDeg) % 360 + 360) % 360 : null,
      interp: 'Where business dealings, negotiations, and commercial activity thrive this year. Active in years focused on trade, sales, contracts, and practical communication.',
    },
  ];

  for (const part of PARTS) {
    const deg = part.calc();
    if (deg === null) continue;
    const pos = degToSignPos(deg);
    const house = findSRHouse(deg);
    results.push({
      name: part.name,
      formula: part.formula,
      sign: pos.sign,
      degree: pos.degree,
      minutes: pos.minutes,
      house,
      interpretation: part.interp,
    });
  }

  return results;
}

export function calculateFirdaria(age: number): SRFirdariaReport {
  // Build the full firdaria timeline
  let currentAge = 0;
  const entries: SRFirdariaEntry[] = [];
  let currentMainLord = '';
  let currentSubLord = '';
  let currentPeriodYears = '';

  // Firdaria repeats after 75 years
  const effectiveAge = age % 75;
  let cycleAge = 0;

  for (const period of FIRDARIA_DAY) {
    const periodStart = cycleAge;
    const periodEnd = cycleAge + period.years;
    
    const subLords = getFirdariaSubLords(period.lord, period.years);
    let subAge = periodStart;

    for (const sub of subLords) {
      const subStart = subAge;
      const subEnd = subAge + sub.years;
      const isCurrent = effectiveAge >= subStart && effectiveAge < subEnd;

      if (isCurrent) {
        currentMainLord = period.lord;
        currentSubLord = sub.lord;
        currentPeriodYears = `Age ${Math.floor(subStart)}–${Math.ceil(subEnd)}`;
      }

      // Only include entries near the current age for relevance
      if (Math.abs(effectiveAge - subStart) <= period.years) {
        entries.push({
          mainLord: period.lord,
          subLord: sub.lord,
          periodStart: Math.floor(subStart),
          periodEnd: Math.ceil(subEnd),
          isCurrent,
          interpretation: isCurrent
            ? `You are currently in a ${period.lord}/${sub.lord} firdaria period. ${period.lord} sets the overarching theme — ${getFirdariaLordMeaning(period.lord)}. ${sub.lord !== period.lord ? `${sub.lord} as sub-lord adds a layer of ${getFirdariaLordMeaning(sub.lord).toLowerCase()}.` : 'As both main and sub-lord, this planet\'s themes are doubled in intensity.'}`
            : `${period.lord}/${sub.lord} period (age ${Math.floor(subStart)}–${Math.ceil(subEnd)}).`,
        });
      }

      subAge = subEnd;
    }
    cycleAge = periodEnd;
  }

  return {
    currentMainLord,
    currentSubLord,
    currentPeriodYears,
    entries: entries.filter(e => e.isCurrent || Math.abs(age - e.periodStart) <= 5),
    interpretation: `Your current firdaria main lord is ${currentMainLord}, with ${currentSubLord} as sub-lord (${currentPeriodYears}). ${getFirdariaLordMeaning(currentMainLord)} ${currentSubLord !== currentMainLord ? `The ${currentSubLord} sub-period colors this with ${getFirdariaLordMeaning(currentSubLord).toLowerCase()}.` : ''}`,
  };
}

function getFirdariaLordMeaning(lord: string): string {
  const meanings: Record<string, string> = {
    Sun: 'A period of visibility, authority, and conscious purpose. You are center stage — leadership, recognition, and vitality define these years.',
    Moon: 'A period of emotional depth, nurturing, and inner life. Family, home, and instinctive responses guide your path. Sensitivity is heightened.',
    Mercury: 'A period of intellectual activity, communication, and learning. Writing, teaching, commerce, and social connections accelerate.',
    Venus: 'A period of pleasure, relationships, beauty, and values. Love, art, and financial growth are favored. Harmony is the priority.',
    Mars: 'A period of action, ambition, and assertive drive. Competition, courage, and physical energy are heightened. Conflicts may arise but so does achievement.',
    Jupiter: 'A period of expansion, opportunity, and spiritual growth. Travel, education, and generosity define these years. Faith in the process is rewarded.',
    Saturn: 'A period of discipline, responsibility, and structural building. Hard work pays off but the burden is real. Maturity is earned, not given.',
    'North Node': 'A brief period of karmic acceleration — fated encounters and growth opportunities appear rapidly.',
    'South Node': 'A brief period of karmic release — letting go of old patterns and completing unfinished business.',
  };
  return meanings[lord] || `${lord} themes are active.`;
}

export function calculateAntiscia(
  srChart: SolarReturnChart,
  natalChart: NatalChart
): SRAntisciaContact[] {
  const results: SRAntisciaContact[] = [];
  const ORB = 1.5;
  const PLANETS = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];

  // Antiscia: mirror across Cancer/Capricorn axis (0° Cancer = 90°)
  // Formula: antiscia of degree D = 180 - D (when measured from 0° Aries)
  // Actually: antiscia mirrors across 0° Cancer/0° Capricorn
  // If planet is at D degrees from 0° Aries, its antiscia is at (180 - D + 360) % 360... no.
  // Correct: Antiscia point = (180° - D) adjusted. The axis is the solstice axis.
  // For a planet at X° ecliptic longitude, its antiscia is at (Cancer 0° * 2 - X) = (180 - X)
  // Wait — antiscia mirrors across the 0 Cancer / 0 Capricorn axis:
  // Antiscia of X = (180 - X + 360) % 360 ... no.
  // Actually: antiscia mirrors through the axis connecting 0° Cancer and 0° Capricorn.
  // 0° Cancer = 90° ecliptic. The mirror: antiscia(D) = 180 - D
  // Example: 5° Gemini (65°) → antiscia at 180 - 65 = 115° = 25° Cancer ✓
  // Contra-antiscia mirrors across Aries/Libra: contra(D) = 360 - D = -D (mod 360)
  // Actually contra-antiscia: the point opposite the antiscia = antiscia + 180

  const getAntiscia = (deg: number): number => ((180 - deg) % 360 + 360) % 360;
  const getContraAntiscia = (deg: number): number => (getAntiscia(deg) + 180) % 360;

  // Check SR planet antiscia touching natal planets and vice versa
  for (const srPlanet of PLANETS) {
    const srPos = srChart.planets[srPlanet as keyof typeof srChart.planets];
    if (!srPos) continue;
    const srDeg = toAbsDeg(srPos);
    if (srDeg === null) continue;

    const antisciaPoint = getAntiscia(srDeg);
    const contraPoint = getContraAntiscia(srDeg);

    for (const natPlanet of PLANETS) {
      const natPos = natalChart.planets[natPlanet as keyof typeof natalChart.planets];
      if (!natPos) continue;
      const natDeg = toAbsDeg(natPos);
      if (natDeg === null) continue;

      // Check antiscia
      let diff = Math.abs(antisciaPoint - natDeg);
      if (diff > 180) diff = 360 - diff;
      if (diff <= ORB) {
        const antPos = degToSignPos(antisciaPoint);
        results.push({
          planet1: srPlanet,
          planet1Source: 'SR',
          planet1Degree: `${srPos.degree}° ${srPos.sign}`,
          antisciaPoint: `${antPos.degree}° ${antPos.sign}`,
          planet2: natPlanet,
          planet2Source: 'Natal',
          planet2Degree: `${natPos.degree}° ${natPos.sign}`,
          orb: Math.round(diff * 10) / 10,
          type: 'antiscia',
          interpretation: `SR ${srPlanet}'s antiscia (mirror point) at ${antPos.degree}° ${antPos.sign} contacts your natal ${natPlanet}. Antiscia connections are "hidden conjunctions" — the two planets share equal daylight and operate as a secret alliance. ${srPlanet}'s energy reaches ${natPlanet} through an invisible channel this year.`,
        });
      }

      // Check contra-antiscia
      diff = Math.abs(contraPoint - natDeg);
      if (diff > 180) diff = 360 - diff;
      if (diff <= ORB) {
        const contraPos = degToSignPos(contraPoint);
        results.push({
          planet1: srPlanet,
          planet1Source: 'SR',
          planet1Degree: `${srPos.degree}° ${srPos.sign}`,
          antisciaPoint: `${contraPos.degree}° ${contraPos.sign}`,
          planet2: natPlanet,
          planet2Source: 'Natal',
          planet2Degree: `${natPos.degree}° ${natPos.sign}`,
          orb: Math.round(diff * 10) / 10,
          type: 'contra-antiscia',
          interpretation: `SR ${srPlanet}'s contra-antiscia at ${contraPos.degree}° ${contraPos.sign} contacts your natal ${natPlanet}. Contra-antiscia functions like a hidden opposition — tension or awareness between ${srPlanet} and ${natPlanet} operates beneath the surface this year.`,
        });
      }
    }
  }

  results.sort((a, b) => a.orb - b.orb);
  return results;
}

export function calculateSolarArcs(
  srChart: SolarReturnChart,
  natalChart: NatalChart,
  age: number
): SRSolarArc[] {
  const results: SRSolarArc[] = [];
  const ORB = 1.5;
  const PLANETS = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
  
  // Solar arc = approximately 1° per year of life (Sun's annual motion)
  // More precise: use actual natal Sun progression, but ~1°/year is standard
  const arcDegrees = age; // 1° per year

  const ASPECT_ANGLES = [
    { name: 'Conjunction', angle: 0 },
    { name: 'Opposition', angle: 180 },
    { name: 'Square', angle: 90 },
    { name: 'Trine', angle: 120 },
    { name: 'Sextile', angle: 60 },
  ];

  for (const natPlanet of PLANETS) {
    const natPos = natalChart.planets[natPlanet as keyof typeof natalChart.planets];
    if (!natPos) continue;
    const natDeg = toAbsDeg(natPos);
    if (natDeg === null) continue;

    const arcedDeg = (natDeg + arcDegrees) % 360;
    const arcedPos = degToSignPos(arcedDeg);

    // Check against SR planets
    for (const srPlanet of PLANETS) {
      const srPos = srChart.planets[srPlanet as keyof typeof srChart.planets];
      if (!srPos) continue;
      const srDeg = toAbsDeg(srPos);
      if (srDeg === null) continue;

      for (const aspect of ASPECT_ANGLES) {
        let diff = Math.abs(arcedDeg - srDeg);
        if (diff > 180) diff = 360 - diff;
        const orbVal = Math.abs(diff - aspect.angle);
        if (orbVal <= ORB) {
          results.push({
            natalPlanet: natPlanet,
            arcedSign: arcedPos.sign,
            arcedDegree: Math.round(arcedDeg * 10) / 10,
            aspectToSRPlanet: srPlanet,
            aspectType: aspect.name,
            orb: Math.round(orbVal * 10) / 10,
            interpretation: `Solar Arc ${natPlanet} (advanced to ${arcedPos.degree}° ${arcedPos.sign}) ${aspect.name.toLowerCase()}s SR ${srPlanet}. Solar arcs represent the unfolding of natal potential over your lifetime — at age ${age}, your natal ${natPlanet} has matured to this degree. Its ${aspect.name.toLowerCase()} to SR ${srPlanet} means this year specifically activates that matured energy through ${srPlanet}'s current themes.`,
          });
        }
      }
    }
  }

  results.sort((a, b) => a.orb - b.orb);
  return results;
}

export function calculateSynthesisSections(
  srChart: SolarReturnChart,
  natalChart: NatalChart,
  planetSRHouses: Record<string, number | null>,
  srToNatalAspects: any[],
  houseOverlays: any[]
): SRSynthesisSection[] {
  const sections: SRSynthesisSection[] = [];
  const PLANETS = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];

  // Helper: count planets in given houses
  const planetsInHouses = (houses: number[]) => 
    PLANETS.filter(p => houses.includes(planetSRHouses[p] ?? -1));

  // Helper: count relevant aspects
  const aspectsInvolving = (planets: string[]) =>
    srToNatalAspects.filter((a: any) => planets.includes(a.planet1) || planets.includes(a.planet2));

  // 1. Relationship & Love Synthesis (Venus, 5H, 7H, 8H)
  const relationshipPlanets = planetsInHouses([5, 7, 8]);
  const venusPos = srChart.planets.Venus;
  const venusHouse = planetSRHouses['Venus'];
  const marsHouse = planetSRHouses['Mars'];
  const relationshipAspects = aspectsInvolving(['Venus', 'Mars']);
  const relStrength = relationshipPlanets.length >= 3 ? 'strong' : relationshipPlanets.length >= 1 ? 'moderate' : 'quiet';

  const relHighlights: string[] = [];
  if (venusPos) relHighlights.push(`Venus in ${venusPos.sign} (House ${venusHouse || '?'}) — your love language and attraction style this year`);
  if (marsHouse) relHighlights.push(`Mars in House ${marsHouse} — where desire and pursuit energy is directed`);
  if (relationshipPlanets.length > 0) relHighlights.push(`${relationshipPlanets.join(', ')} in relationship houses — amplified relational energy`);

  sections.push({
    title: 'Love & Relationship Synthesis',
    theme: 'relationship',
    keyPlanets: ['Venus', 'Mars', ...relationshipPlanets.filter(p => p !== 'Venus' && p !== 'Mars')],
    keyHouses: [5, 7, 8],
    strength: relStrength,
    highlights: relHighlights,
    interpretation: relStrength === 'strong'
      ? 'Relationships are a dominant theme this year. With significant planetary activity in your partnership and intimacy houses, love, commitment, and relational dynamics demand your attention and energy.'
      : relStrength === 'moderate'
      ? 'Relationships play an important supporting role this year. Venus and Mars set the tone for how you attract and pursue connection, but other life areas may compete for your focus.'
      : 'Relationships are a quieter theme this year. The energy is directed elsewhere, but Venus\'s sign and house still color your relational experience.',
  });

  // 2. Career & Purpose Synthesis (10H, MC, Saturn, Sun)
  const careerPlanets = planetsInHouses([10, 6, 2]);
  const sunHouse = planetSRHouses['Sun'];
  const saturnHouse = planetSRHouses['Saturn'];
  const carStrength = careerPlanets.length >= 3 ? 'strong' : careerPlanets.length >= 1 ? 'moderate' : 'quiet';

  const carHighlights: string[] = [];
  if (sunHouse) carHighlights.push(`Sun in House ${sunHouse} — where your core vitality and purpose focus`);
  if (saturnHouse) carHighlights.push(`Saturn in House ${saturnHouse} — where discipline and structure are demanded`);
  if (careerPlanets.length > 0) carHighlights.push(`${careerPlanets.join(', ')} in career/work houses`);

  sections.push({
    title: 'Career & Purpose Synthesis',
    theme: 'career',
    keyPlanets: ['Sun', 'Saturn', ...careerPlanets.filter(p => p !== 'Sun' && p !== 'Saturn')],
    keyHouses: [10, 6, 2],
    strength: carStrength,
    highlights: carHighlights,
    interpretation: carStrength === 'strong'
      ? 'Career and professional ambition are a central theme this year. Multiple planets in work and achievement houses create momentum — this is a year to build, climb, and make your mark publicly.'
      : carStrength === 'moderate'
      ? 'Career matters require attention but don\'t dominate the year. Strategic effort in your professional life will produce results, especially where Saturn demands discipline.'
      : 'Career is a background theme this year. Professional life continues but the year\'s energy is directed toward other areas of growth.',
  });

  // 3. Spiritual & Soul Growth Synthesis (12H, 9H, Neptune, Nodes)
  const spiritPlanets = planetsInHouses([9, 12]);
  const neptuneHouse = planetSRHouses['Neptune'];
  const spirStrength = spiritPlanets.length >= 2 ? 'strong' : spiritPlanets.length >= 1 || neptuneHouse === 12 || neptuneHouse === 9 ? 'moderate' : 'quiet';

  const spirHighlights: string[] = [];
  if (neptuneHouse) spirHighlights.push(`Neptune in House ${neptuneHouse} — where imagination, spirituality, and dissolution operate`);
  if (spiritPlanets.length > 0) spirHighlights.push(`${spiritPlanets.join(', ')} in spiritual houses (9th/12th)`);
  const nnHouse = planetSRHouses['NorthNode'] ?? planetSRHouses['Chiron'];
  if (nnHouse) spirHighlights.push(`Growth direction points to House ${nnHouse}`);

  sections.push({
    title: 'Spiritual & Soul Growth Synthesis',
    theme: 'spiritual',
    keyPlanets: ['Neptune', ...spiritPlanets.filter(p => p !== 'Neptune')],
    keyHouses: [9, 12],
    strength: spirStrength,
    highlights: spirHighlights,
    interpretation: spirStrength === 'strong'
      ? 'Spiritual growth and inner transformation are major themes this year. With planets in the 9th and 12th houses, your worldview is expanding while your inner life deepens. Dreams, meditation, and solitude are productive — not escapist.'
      : spirStrength === 'moderate'
      ? 'Spiritual themes run as an undercurrent this year. While not the headline story, inner growth, philosophical questioning, and intuitive development are quietly active.'
      : 'Spiritual themes are subtle this year. The focus is more on external world engagement, but Neptune\'s placement still influences where you need to surrender control and trust the process.',
  });

  // 4. Money & Resources Synthesis (2H, 8H, Venus, Jupiter)
  const moneyPlanets = planetsInHouses([2, 8]);
  const jupiterHouse = planetSRHouses['Jupiter'];
  const monStrength = moneyPlanets.length >= 2 ? 'strong' : moneyPlanets.length >= 1 ? 'moderate' : 'quiet';

  const monHighlights: string[] = [];
  if (venusHouse) monHighlights.push(`Venus in House ${venusHouse} — your financial attraction and spending style`);
  if (jupiterHouse) monHighlights.push(`Jupiter in House ${jupiterHouse} — where abundance and expansion flow`);
  if (moneyPlanets.length > 0) monHighlights.push(`${moneyPlanets.join(', ')} in financial houses (2nd/8th)`);

  sections.push({
    title: 'Money & Resources Synthesis',
    theme: 'money',
    keyPlanets: ['Venus', 'Jupiter', ...moneyPlanets.filter(p => p !== 'Venus' && p !== 'Jupiter')],
    keyHouses: [2, 8],
    strength: monStrength,
    highlights: monHighlights,
    interpretation: monStrength === 'strong'
      ? 'Financial matters are a major theme this year. Earning, spending, debt, investments, and shared resources all demand active attention. Both the 2nd house (your money) and 8th house (others\' money) are lit up.'
      : monStrength === 'moderate'
      ? 'Financial themes are active but manageable. Venus and Jupiter\'s placements guide where money flows and where opportunities for growth exist.'
      : 'Finances are a background theme this year — steady rather than dramatic. The focus is elsewhere, but Venus still colors your relationship with money and values.',
  });

  return sections;
}

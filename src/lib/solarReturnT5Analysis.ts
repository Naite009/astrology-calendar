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
  narrative: string; // personalized paragraph weaving all key planets together
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

  const planetsInHouses = (houses: number[]) => 
    PLANETS.filter(p => houses.includes(planetSRHouses[p] ?? -1));

  const aspectsInvolving = (planets: string[]) =>
    srToNatalAspects.filter((a: any) => planets.includes(a.planet1) || planets.includes(a.planet2));

  const getDignity = (planet: string): string => {
    const pos = srChart.planets[planet as keyof typeof srChart.planets];
    if (!pos) return '';
    const DOMICILE: Record<string, string[]> = {
      Sun: ['Leo'], Moon: ['Cancer'], Mercury: ['Gemini','Virgo'], Venus: ['Taurus','Libra'],
      Mars: ['Aries','Scorpio'], Jupiter: ['Sagittarius','Pisces'], Saturn: ['Capricorn','Aquarius'],
    };
    const DETRIMENT: Record<string, string[]> = {
      Sun: ['Aquarius'], Moon: ['Capricorn'], Mercury: ['Sagittarius','Pisces'], Venus: ['Aries','Scorpio'],
      Mars: ['Taurus','Libra'], Jupiter: ['Gemini','Virgo'], Saturn: ['Cancer','Leo'],
    };
    if (DOMICILE[planet]?.includes(pos.sign)) return 'Domicile';
    if (DETRIMENT[planet]?.includes(pos.sign)) return 'Detriment';
    return '';
  };

  const isRetro = (planet: string): boolean => {
    const pos = srChart.planets[planet as keyof typeof srChart.planets];
    return !!(pos as any)?.isRetrograde;
  };

  // Plain-language planet description for birthday gift (no jargon)
  const PLANET_PLAIN_ROLE: Record<string, string> = {
    Sun: 'your core energy and sense of purpose', Moon: 'your emotional needs and inner comfort',
    Mercury: 'how you think and communicate', Venus: 'your natural charm, social grace, and what you love',
    Mars: 'your drive, motivation, and physical energy', Jupiter: 'where you feel lucky and where doors open',
    Saturn: 'where you\'re building something lasting through commitment', Uranus: 'where exciting, unexpected changes happen',
    Neptune: 'your imagination, intuition, and creative vision', Pluto: 'where deep personal evolution is happening',
    Chiron: 'where your sensitive spots become your greatest strengths', NorthNode: 'the direction your life is naturally growing toward',
  };

  const HOUSE_PLAIN: Record<number, string> = {
    1: 'your personal identity and how you show up', 2: 'your money, income, and self-worth',
    3: 'your communication, learning, and daily connections', 4: 'your home, family, and emotional roots',
    5: 'your creativity, romance, and self-expression', 6: 'your daily routines, work habits, and health',
    7: 'your partnerships and closest relationships', 8: 'your shared finances, intimacy, and personal transformation',
    9: 'your travel, education, and big-picture beliefs', 10: 'your career, public reputation, and life direction',
    11: 'your friendships, community, and future goals', 12: 'your inner life, rest, and personal reflection',
  };

  const planetPlain = (planet: string): string => {
    return PLANET_PLAIN_ROLE[planet] || planet.toLowerCase();
  };

  const housePlain = (house: number | null): string => {
    if (!house) return '';
    return HOUSE_PLAIN[house] || `house ${house}`;
  };

  const ordSuf = (n: number): string => {
    const s = ['th','st','nd','rd'];
    const v = n % 100;
    return (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // 1. Love & Relationship Synthesis
  const relPlanets = planetsInHouses([5, 7, 8]);
  const venusPos = srChart.planets.Venus;
  const venusHouse = planetSRHouses['Venus'];
  const marsHouse = planetSRHouses['Mars'];
  const relStrength = relPlanets.length >= 3 ? 'strong' as const : relPlanets.length >= 1 ? 'moderate' as const : 'quiet' as const;

  const relHighlights: string[] = [];
  if (venusPos) relHighlights.push(`Venus in ${venusPos.sign} (House ${venusHouse || '?'}) — your love language and attraction style this year`);
  if (marsHouse) relHighlights.push(`Mars in House ${marsHouse} — where desire and pursuit energy is directed`);
  if (relPlanets.length > 0) relHighlights.push(`${relPlanets.join(', ')} in relationship houses — amplified relational energy`);

  // Build personalized narrative
  const relNarrParts: string[] = [];
  if (venusPos) {
    const vd = getDignity('Venus');
    const vr = isRetro('Venus');
    relNarrParts.push(`${planetDesc('Venus')} sets the tone for how you attract and give love this year${vd === 'Domicile' ? ' — Venus is at home here, giving you natural magnetism and ease in connection' : vd === 'Detriment' ? ' — Venus is uncomfortable in this sign, meaning love may feel like work or come through unconventional channels' : ''}.${vr ? ' Venus retrograde suggests old lovers, unfinished relationship business, or a reassessment of what you truly value in a partner.' : ''}`);
  }
  for (const p of ['Saturn', 'Neptune', 'Pluto', 'Uranus', 'Chiron']) {
    const h = planetSRHouses[p];
    if (h && [5, 7, 8].includes(h)) {
      const desc: Record<string, string> = {
        Saturn: `${planetDesc(p)} demands maturity, honest evaluation, and restructuring of ${h === 7 ? 'partnerships' : h === 5 ? 'creative and romantic expression' : 'intimate bonds and shared finances'}`,
        Neptune: `${planetDesc(p)} brings fog, idealization, and the need to see ${h === 7 ? 'partners' : 'relationships'} clearly rather than through a fantasy lens`,
        Pluto: `${planetDesc(p)} transforms ${h === 5 ? 'romance and creativity' : h === 7 ? 'committed partnerships' : 'intimacy and shared resources'} from the ground up — expect deep change that cannot be reversed`,
        Uranus: `${planetDesc(p)} brings sudden shifts and freedom needs to ${h === 7 ? 'partnerships' : h === 5 ? 'dating and creative life' : 'intimate arrangements'}`,
        Chiron: `${planetDesc(p)} surfaces old sore spots around ${h === 7 ? 'commitment' : h === 5 ? 'self-expression and romance' : 'trust and vulnerability'}`,
      };
      relNarrParts.push(desc[p] || '');
    }
  }
  const relNarrative = relNarrParts.length > 0
    ? relNarrParts.join('. ') + `. The overall picture: ${relStrength === 'strong' ? 'love is not background noise this year — it demands your full attention and honesty' : relStrength === 'moderate' ? 'relationships play a supporting role, but the placements that are active carry real weight' : 'relationships are quieter this year, giving you space to focus elsewhere while Venus still colors your experience'}.`
    : 'Relationship themes are present but driven mainly by Venus\'s sign and house placement rather than heavy planetary traffic through partnership houses.';

  sections.push({
    title: 'Love & Relationship Synthesis',
    theme: 'relationship',
    keyPlanets: ['Venus', 'Mars', ...relPlanets.filter(p => p !== 'Venus' && p !== 'Mars')],
    keyHouses: [5, 7, 8],
    strength: relStrength,
    highlights: relHighlights,
    interpretation: relStrength === 'strong'
      ? 'Relationships are a dominant theme this year with significant planetary activity in partnership and intimacy houses.'
      : relStrength === 'moderate'
      ? 'Relationships play an important supporting role this year.'
      : 'Relationships are a quieter theme this year.',
    narrative: relNarrative,
  });

  // 2. Career & Purpose Synthesis
  const carPlanets = planetsInHouses([10, 6, 2]);
  const sunHouse = planetSRHouses['Sun'];
  const saturnHouse = planetSRHouses['Saturn'];
  const carStrength = carPlanets.length >= 3 ? 'strong' as const : carPlanets.length >= 1 ? 'moderate' as const : 'quiet' as const;

  const carHighlights: string[] = [];
  if (sunHouse) carHighlights.push(`Sun in House ${sunHouse} — where your core vitality and purpose focus`);
  if (saturnHouse) carHighlights.push(`Saturn in House ${saturnHouse} — where discipline and structure are demanded`);
  if (carPlanets.length > 0) carHighlights.push(`${carPlanets.join(', ')} in career/work houses`);

  const carNarrParts: string[] = [];
  if (sunHouse) carNarrParts.push(`${planetDesc('Sun')} directs your core vitality and purpose toward ${sunHouse === 10 ? 'public achievement and career visibility' : sunHouse === 6 ? 'daily work, health routines, and being of service' : sunHouse === 2 ? 'building financial stability and self-worth' : `the ${sunHouse}${ordSuf(sunHouse)} house — career is not the headline, but identity still shapes professional choices`}`);
  if (saturnHouse) {
    const sr = isRetro('Saturn');
    carNarrParts.push(`${planetDesc('Saturn')} ${[10, 6, 2].includes(saturnHouse) ? `places heavy responsibility directly on ${saturnHouse === 10 ? 'your public role and reputation' : saturnHouse === 6 ? 'your daily workload and health habits' : 'your finances and material stability'}` : `demands discipline in the ${saturnHouse}${ordSuf(saturnHouse)} house, which indirectly shapes your professional decisions`}${sr ? ' — Saturn retrograde means the restructuring is internal, reviewing old commitments before building new ones' : ''}`);
  }
  for (const p of ['Jupiter', 'Pluto', 'Uranus', 'Neptune']) {
    const h = planetSRHouses[p];
    if (h && [10, 6, 2].includes(h)) {
      const desc: Record<string, string> = {
        Jupiter: `${planetDesc(p)} expands opportunities in ${h === 10 ? 'your career and public standing' : h === 6 ? 'your daily work — more projects, more demand' : 'your earning potential'}`,
        Pluto: `${planetDesc(p)} transforms ${h === 10 ? 'your professional identity from the foundation up' : h === 6 ? 'your work habits and possibly your job entirely' : 'your relationship with money and self-worth'}`,
        Uranus: `${planetDesc(p)} brings sudden, unexpected changes to ${h === 10 ? 'your career trajectory' : h === 6 ? 'your daily routine and health' : 'your financial situation'}`,
        Neptune: `${planetDesc(p)} brings confusion or inspiration to ${h === 10 ? 'your career direction — clarity about professional goals may be elusive' : h === 6 ? 'your daily routines — watch for misunderstandings at work' : 'your finances — budget carefully and avoid get-rich-quick schemes'}`,
      };
      carNarrParts.push(desc[p] || '');
    }
  }
  const carNarrative = carNarrParts.length > 0
    ? carNarrParts.join('. ') + '.'
    : 'Career continues in the background this year. The Sun\'s house placement guides where your vitality goes, but major career shifts are not indicated by the planetary lineup.';

  sections.push({
    title: 'Career & Purpose Synthesis',
    theme: 'career',
    keyPlanets: ['Sun', 'Saturn', ...carPlanets.filter(p => p !== 'Sun' && p !== 'Saturn')],
    keyHouses: [10, 6, 2],
    strength: carStrength,
    highlights: carHighlights,
    interpretation: carStrength === 'strong'
      ? 'Career and professional ambition are a central theme this year.'
      : carStrength === 'moderate'
      ? 'Career matters require attention but don\'t dominate the year.'
      : 'Career is a background theme this year.',
    narrative: carNarrative,
  });

  // 3. Inner Growth Synthesis
  const spirPlanets = planetsInHouses([9, 12]);
  const neptuneHouse = planetSRHouses['Neptune'];
  const spirStrength = spirPlanets.length >= 2 ? 'strong' as const : spirPlanets.length >= 1 || neptuneHouse === 12 || neptuneHouse === 9 ? 'moderate' as const : 'quiet' as const;

  const spirHighlights: string[] = [];
  if (neptuneHouse) spirHighlights.push(`Neptune in House ${neptuneHouse} — where imagination and sensitivity operate`);
  if (spirPlanets.length > 0) spirHighlights.push(`${spirPlanets.join(', ')} in 9th/12th houses`);
  const nnHouse = planetSRHouses['NorthNode'] ?? planetSRHouses['Chiron'];
  if (nnHouse) spirHighlights.push(`Growth direction points to House ${nnHouse}`);

  const spirNarrParts: string[] = [];
  if (neptuneHouse) {
    spirNarrParts.push(`${planetDesc('Neptune')} ${neptuneHouse === 12 ? 'is in its natural home — your inner life is vivid, dreams are meaningful, and solitude recharges you. The risk is escapism or ignoring practical matters' : neptuneHouse === 9 ? 'opens your worldview to new beliefs and experiences, but can also create confusion about what you actually believe versus what sounds appealing' : `colors house ${neptuneHouse} with sensitivity and fogginess`}`);
  }
  for (const p of spirPlanets) {
    if (p !== 'Neptune') spirNarrParts.push(`${planetDesc(p)} in a growth house adds ${p === 'Jupiter' ? 'expansion of beliefs and desire for meaning' : p === 'Saturn' ? 'serious commitment to inner work — this is not casual self-help but disciplined practice' : p === 'Pluto' ? 'profound inner transformation that may feel like losing an old version of yourself' : `${p}'s energy`} to your inner development`);
  }
  const spirNarrative = spirNarrParts.length > 0
    ? spirNarrParts.join('. ') + '.'
    : 'Inner growth themes are subtle this year. The focus is more on external world engagement, but Neptune\'s placement still influences where you need to trust your intuition and let go of rigid expectations.';

  sections.push({
    title: 'Inner Growth Synthesis',
    theme: 'spiritual',
    keyPlanets: ['Neptune', ...spirPlanets.filter(p => p !== 'Neptune')],
    keyHouses: [9, 12],
    strength: spirStrength,
    highlights: spirHighlights,
    interpretation: spirStrength === 'strong'
      ? 'Inner growth and personal transformation are major themes this year.'
      : spirStrength === 'moderate'
      ? 'Inner growth runs as a meaningful undercurrent this year.'
      : 'Inner growth themes are subtle this year.',
    narrative: spirNarrative,
  });

  // 4. Money & Resources Synthesis
  const monPlanets = planetsInHouses([2, 8]);
  const jupiterHouse = planetSRHouses['Jupiter'];
  const monStrength = monPlanets.length >= 2 ? 'strong' as const : monPlanets.length >= 1 ? 'moderate' as const : 'quiet' as const;

  const monHighlights: string[] = [];
  if (venusHouse) monHighlights.push(`Venus in House ${venusHouse} — your financial attraction and spending style`);
  if (jupiterHouse) monHighlights.push(`Jupiter in House ${jupiterHouse} — where abundance and expansion flow`);
  if (monPlanets.length > 0) monHighlights.push(`${monPlanets.join(', ')} in financial houses (2nd/8th)`);

  const monNarrParts: string[] = [];
  if (venusHouse) {
    const vd = getDignity('Venus');
    monNarrParts.push(`${planetDesc('Venus')} shapes your spending and earning patterns${vd === 'Domicile' ? ' — Venus at home means money flows more easily and you attract financial opportunities naturally' : vd === 'Detriment' ? ' — Venus is uncomfortable, meaning you may struggle with knowing what things are worth or overspending to compensate' : ''}`);
  }
  if (jupiterHouse) monNarrParts.push(`${planetDesc('Jupiter')} ${[2, 8].includes(jupiterHouse) ? `directly expands ${jupiterHouse === 2 ? 'your earning potential — income opportunities grow but so can overspending' : 'shared financial matters like inheritance, debt, or investment returns'}` : `brings growth energy to house ${jupiterHouse}, which indirectly supports financial confidence`}`);
  for (const p of ['Saturn', 'Pluto', 'Uranus', 'Neptune']) {
    const h = planetSRHouses[p];
    if (h && [2, 8].includes(h)) {
      const desc: Record<string, string> = {
        Saturn: `${planetDesc(p)} in the ${h}${ordSuf(h)} house means financial discipline is required — budgets tighten, but what you build now lasts`,
        Pluto: `${planetDesc(p)} transforms your ${h === 2 ? 'relationship with money and self-worth at a fundamental level' : 'shared financial arrangements — debts, taxes, or inheritance matters undergo deep change'}`,
        Uranus: `${planetDesc(p)} brings financial surprises — ${h === 2 ? 'income may be unpredictable but exciting' : 'shared resources or debts shift suddenly'}`,
        Neptune: `${planetDesc(p)} creates financial fog — ${h === 2 ? 'be extra careful with spending and verify all financial information' : 'shared money matters need clear documentation, not handshake deals'}`,
      };
      monNarrParts.push(desc[p] || '');
    }
  }
  const monNarrative = monNarrParts.length > 0
    ? monNarrParts.join('. ') + '.'
    : 'Finances are steady this year without dramatic planetary pressure on money houses. Venus and Jupiter\'s placements still guide where money flows and where opportunities for growth exist.';

  sections.push({
    title: 'Money & Resources Synthesis',
    theme: 'money',
    keyPlanets: ['Venus', 'Jupiter', ...monPlanets.filter(p => p !== 'Venus' && p !== 'Jupiter')],
    keyHouses: [2, 8],
    strength: monStrength,
    highlights: monHighlights,
    interpretation: monStrength === 'strong'
      ? 'Financial matters are a major theme this year.'
      : monStrength === 'moderate'
      ? 'Financial themes are active but manageable.'
      : 'Finances are a background theme this year — steady rather than dramatic.',
    narrative: monNarrative,
  });

  return sections;
}

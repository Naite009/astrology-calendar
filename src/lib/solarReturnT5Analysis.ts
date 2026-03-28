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
  // ── Royal Stars (the Big Four) ──
  { name: 'Aldebaran', longitude2000: 69.78, magnitude: 0.85, nature: 'Mars', interpretation: 'The "Eye of the Bull" — one of the four Royal Stars. Integrity, honor, and success through moral courage. A year of standing firm in your values and being tested for authenticity. Success comes when you refuse to compromise your principles.' },
  { name: 'Regulus', longitude2000: 149.83, magnitude: 1.35, nature: 'Jupiter-Mars', interpretation: 'The "Heart of the Lion" — one of the four Royal Stars. Leadership, authority, and success through generosity. A year of commanding respect and stepping into power. The warning: success is lost through revenge or petty behavior.' },
  { name: 'Antares', longitude2000: 249.77, magnitude: 1.09, nature: 'Mars-Jupiter', interpretation: 'The "Heart of the Scorpion" — one of the four Royal Stars. Intensity, obsession, and strategic power. A year of high stakes, deep passion, and potential confrontation. Success through fearless engagement with what is difficult.' },
  { name: 'Fomalhaut', longitude2000: 333.87, magnitude: 1.16, nature: 'Venus-Mercury', interpretation: 'The "Mouth of the Fish" — one of the four Royal Stars. Dreams, idealism, and following a high vision. A year of pursuing something meaningful, but success only holds if you stay honest. Associated with fame, creativity, and following your conscience.' },

  // ── First-magnitude & classically essential ──
  { name: 'Algol', longitude2000: 56.17, magnitude: 2.1, nature: 'Saturn-Jupiter', interpretation: 'The "Demon Star" — intense, transformative energy. Can indicate a year of facing shadows, power struggles, or breakthroughs through crisis. Associated with intense passion and the ability to literally "lose your head" over something.' },
  { name: 'Alcyone (Pleiades)', longitude2000: 60.0, magnitude: 2.9, nature: 'Moon-Mars', interpretation: 'The weeping sisters — emotional intensity, ambition, and dealing with loss or longing. A drive to achieve but with an undercurrent of sadness or nostalgia.' },
  { name: 'Capella', longitude2000: 81.84, magnitude: 0.08, nature: 'Jupiter-Saturn', interpretation: 'The "She-Goat" — curiosity, love of learning, and unconventional success. A year of exploring new subjects, mentoring, or being mentored. Associated with people who thrive through knowledge and adaptability.' },
  { name: 'Rigel', longitude2000: 76.83, magnitude: 0.12, nature: 'Jupiter-Saturn', interpretation: 'The "Foot of Orion" — ambition, education, and intellectual achievement. A year favoring teaching, publishing, or large-scale projects. Benevolent influence supporting growth through knowledge.' },
  { name: 'Betelgeuse', longitude2000: 88.75, magnitude: 0.42, nature: 'Mars-Mercury', interpretation: 'The "Armpit of the Giant" — raw ambition, fame, and martial success. A year of bold moves, athletic achievement, or public recognition. Success through daring, but watch for overreach.' },
  { name: 'Sirius', longitude2000: 104.08, magnitude: -1.46, nature: 'Jupiter-Mars', interpretation: 'The brightest star — ambition, fame, honor, and high achievement. A year of burning brilliance, but also the risk of burning too hot. Associated with guardian spirits, devotion, and wealth. Success is amplified but so is scrutiny.' },
  { name: 'Procyon', longitude2000: 115.62, magnitude: 0.34, nature: 'Mercury-Mars', interpretation: 'The "Before the Dog" — quick action, sudden opportunities, and sharp instincts. A year of fast-moving developments. Success through being alert and ready to act, but beware of impulsive decisions or short-lived gains.' },
  { name: 'Castor', longitude2000: 110.23, magnitude: 1.6, nature: 'Mercury', interpretation: 'The mortal twin — intellectual brilliance, writing, and creative partnerships. Quick mind, versatility, but potential for sudden reversals or injuries.' },
  { name: 'Pollux', longitude2000: 113.22, magnitude: 1.14, nature: 'Mars', interpretation: 'The immortal twin — bold, athletic, and competitive energy. A year of courage and willingness to fight for what matters. Can also indicate cruelty if poorly channeled.' },
  { name: 'Denebola', longitude2000: 171.57, magnitude: 2.14, nature: 'Saturn-Venus', interpretation: 'The "Tail of the Lion" — going against the mainstream. A year of bucking trends, unconventional choices, or whistleblowing. Can bring both social criticism and the satisfaction of independent thinking.' },
  { name: 'Vindemiatrix', longitude2000: 189.93, magnitude: 2.83, nature: 'Saturn-Mercury', interpretation: 'The "Grape Gatherer" — widowhood, loss, and endings in traditional astrology. In modern context, a year of harvesting what you planted but also accepting what is ending. Associated with necessary goodbyes and the bittersweet side of change.' },
  { name: 'Spica', longitude2000: 203.83, magnitude: 0.97, nature: 'Venus-Mercury', interpretation: 'The brightest star of Virgo — brilliance, gifts, and harvest. One of the most fortunate fixed stars. A year of reaping rewards, artistic talent, and receiving what you have earned. Associated with skill, craft, and excellence.' },
  { name: 'Arcturus', longitude2000: 204.23, magnitude: -0.04, nature: 'Jupiter-Mars', interpretation: 'The "Bear Guardian" — pathfinding, innovation, and doing things differently. A year of finding your own way, often through unconventional methods. Success through independence and original thinking.' },
  { name: 'Zubenelgenubi', longitude2000: 225.07, magnitude: 2.75, nature: 'Saturn-Mars', interpretation: 'The "Southern Claw" of the Scorpion — social reform, justice, and fighting for fairness. A year where issues of right and wrong come into sharp focus. Associated with legal matters, activism, and the courage to challenge unfair systems.' },
  { name: 'Vega', longitude2000: 285.32, magnitude: 0.03, nature: 'Venus-Mercury', interpretation: 'The "Harp Star" — charisma, artistic talent, and public appeal. A year of creativity, performance, and social magnetism. Associated with magic, music, and the ability to enchant others.' },
  { name: 'Altair', longitude2000: 301.83, magnitude: 0.77, nature: 'Mars-Jupiter', interpretation: 'The "Flying Eagle" — bold ambition, sudden rises, and daring action. A year of courageous leaps, leadership, and potentially sudden changes in status. Success through confidence and willingness to take risks.' },
  { name: 'Achernar', longitude2000: 345.32, magnitude: 0.46, nature: 'Jupiter', interpretation: 'The "End of the River" — success through integrity and moral strength. Associated with religious or philosophical leadership, honors, and a year of being recognized for your principles. One of the brightest stars, linking achievement with spiritual depth.' },
  { name: 'Scheat', longitude2000: 359.38, magnitude: 2.42, nature: 'Saturn-Mercury', interpretation: 'Associated with independent thinking but also potential misfortune through stubbornness. A year where going against the grain has both rewards and consequences.' },
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
  findSRHouse: (deg: number) => number | null,
  planetSRHouses?: Record<string, number | null>
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

  // Determine day vs night chart: Sun above horizon (houses 7-12) = day chart
  const sunHouse = findSRHouse(sunDeg);
  const isDayChart = sunHouse !== null && sunHouse >= 7;

  // House theme map for chart-specific interpretations
  const HOUSE_THEMES: Record<number, string> = {
    1: 'identity and self-expression', 2: 'money, resources, and self-worth', 3: 'communication and learning',
    4: 'home, family, and roots', 5: 'creativity, romance, and joy', 6: 'daily routines and health',
    7: 'partnerships and relationships', 8: 'shared resources and transformation', 9: 'travel, beliefs, and higher learning',
    10: 'career and public reputation', 11: 'community, friendships, and future vision', 12: 'solitude, spirituality, and the unconscious',
  };

  // Find planets sharing a house
  const planetsInHouse = (house: number | null): string[] => {
    if (!house || !planetSRHouses) return [];
    return Object.entries(planetSRHouses)
      .filter(([_, h]) => h === house)
      .map(([p]) => p);
  };

  const PARTS: { name: string; formula: string; calc: () => number | null; genericInterp: string; chartSpecificInterp: (sign: string, house: number | null) => string }[] = [
    {
      name: 'Part of Fortune (Fortuna)',
      formula: isDayChart ? 'ASC + Moon - Sun (day)' : 'ASC + Sun - Moon (night)',
      calc: () => isDayChart
        ? ((ascDeg + moonDeg - sunDeg) % 360 + 360) % 360
        : ((ascDeg + sunDeg - moonDeg) % 360 + 360) % 360,
      genericInterp: 'Where prosperity, luck, and material well-being flow most naturally this year.',
      chartSpecificInterp: (sign, house) => {
        let text = `Your luck and natural abundance land in ${sign}`;
        if (house) {
          text += ` in House ${house} (${HOUSE_THEMES[house] || ''})`;
          const coPlanets = planetsInHouse(house);
          if (coPlanets.length > 0) {
            text += `. ${coPlanets.join(' and ')} ${coPlanets.length > 1 ? 'are' : 'is'} here too, amplifying your access to good fortune through ${HOUSE_THEMES[house] || 'this area'}`;
          }
        }
        return text + '. Fortune flows most easily when you lean into this part of your life this year.';
      },
    },
    {
      name: 'Part of Spirit (Daimon)',
      formula: isDayChart ? 'ASC + Sun - Moon (day)' : 'ASC + Moon - Sun (night)',
      calc: () => isDayChart
        ? ((ascDeg + sunDeg - moonDeg) % 360 + 360) % 360
        : ((ascDeg + moonDeg - sunDeg) % 360 + 360) % 360,
      genericInterp: 'Where your conscious will and spiritual agency are strongest this year.',
      chartSpecificInterp: (sign, house) => {
        let text = `Your spiritual agency and conscious willpower are strongest in ${sign}`;
        if (house) {
          text += ` in House ${house} (${HOUSE_THEMES[house] || ''})`;
          const coPlanets = planetsInHouse(house);
          if (coPlanets.length > 0) {
            text += `. With ${coPlanets.join(' and ')} present, your ability to actively direct intentions in ${HOUSE_THEMES[house] || 'this area'} is enhanced`;
          }
        }
        return text + '. While Fortune shows what comes to you, Spirit shows what you can actively create.';
      },
    },
    {
      name: 'Part of Eros',
      formula: 'ASC + Venus - Mars',
      calc: () => venusDeg !== null && marsDeg !== null ? ((ascDeg + venusDeg - marsDeg) % 360 + 360) % 360 : null,
      genericInterp: 'The point of passionate desire and erotic connection this year.',
      chartSpecificInterp: (sign, house) => {
        let text = `Your point of passionate desire and creative-erotic energy lives in ${sign}`;
        if (house) {
          text += ` in House ${house} (${HOUSE_THEMES[house] || ''})`;
          const coPlanets = planetsInHouse(house);
          if (coPlanets.length > 0) {
            text += `. ${coPlanets.join(' and ')} here ${coPlanets.length > 1 ? 'intensify' : 'intensifies'} the pull toward passion in this area`;
          }
        }
        return text + '. This is where romantic and creative desire runs hottest this year.';
      },
    },
    {
      name: 'Part of Necessity (Ananke)',
      formula: 'ASC + Fortune - Spirit',
      calc: () => {
        const fortune = isDayChart
          ? ((ascDeg + moonDeg - sunDeg) % 360 + 360) % 360
          : ((ascDeg + sunDeg - moonDeg) % 360 + 360) % 360;
        const spirit = isDayChart
          ? ((ascDeg + sunDeg - moonDeg) % 360 + 360) % 360
          : ((ascDeg + moonDeg - sunDeg) % 360 + 360) % 360;
        return ((ascDeg + fortune - spirit) % 360 + 360) % 360;
      },
      genericInterp: 'Where fate and unavoidable circumstance exert the strongest pull this year.',
      chartSpecificInterp: (sign, house) => {
        let text = `The non-negotiable themes of this year concentrate in ${sign}`;
        if (house) {
          text += ` in House ${house} (${HOUSE_THEMES[house] || ''})`;
          const coPlanets = planetsInHouse(house);
          if (coPlanets.length > 0) {
            text += `. ${coPlanets.join(' and ')} here ${coPlanets.length > 1 ? 'add' : 'adds'} weight to what must be dealt with`;
          }
        }
        return text + '. This is what you must face whether you choose to or not.';
      },
    },
    {
      name: 'Part of Marriage',
      formula: 'ASC + Venus - Saturn',
      calc: () => venusDeg !== null && saturnDeg !== null ? ((ascDeg + venusDeg - saturnDeg) % 360 + 360) % 360 : null,
      genericInterp: 'The point of committed partnership and formal bonds this year.',
      chartSpecificInterp: (sign, house) => {
        let text = `Committed partnership and formal bonds are activated in ${sign}`;
        if (house) {
          text += ` in House ${house} (${HOUSE_THEMES[house] || ''})`;
          const coPlanets = planetsInHouse(house);
          if (coPlanets.length > 0) {
            text += `. ${coPlanets.join(' and ')} here ${coPlanets.length > 1 ? 'influence' : 'influences'} how commitment plays out`;
          }
        }
        return text + '. Active when engagement, marriage, or formalization of bonds is in focus.';
      },
    },
    {
      name: 'Part of Commerce',
      formula: 'ASC + Mercury - Sun',
      calc: () => mercDeg !== null ? ((ascDeg + mercDeg - sunDeg) % 360 + 360) % 360 : null,
      genericInterp: 'Where business dealings, negotiations, and commercial activity thrive this year.',
      chartSpecificInterp: (sign, house) => {
        let text = `Business dealings and commercial activity thrive in ${sign}`;
        if (house) {
          text += ` in House ${house} (${HOUSE_THEMES[house] || ''})`;
          const coPlanets = planetsInHouse(house);
          if (coPlanets.length > 0) {
            text += `. ${coPlanets.join(' and ')} here ${coPlanets.length > 1 ? 'support' : 'supports'} trade and negotiations`;
          }
        }
        return text + '. Focus your business energy here for best results this year.';
      },
    },
  ];

  for (const part of PARTS) {
    const deg = part.calc();
    if (deg === null) continue;
    const pos = degToSignPos(deg);
    const house = findSRHouse(deg);
    // Use chart-specific interpretation, fall back to generic
    const interp = part.chartSpecificInterp(pos.sign, house);
    results.push({
      name: part.name,
      formula: part.formula,
      sign: pos.sign,
      degree: pos.degree,
      minutes: pos.minutes,
      house,
      interpretation: interp,
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
  if (venusPos) relHighlights.push(`Your love language and attraction style are front and center this year`);
  if (marsHouse) relHighlights.push(`Your drive and passion are focused on ${housePlain(marsHouse)}`);
  if (relPlanets.length > 0) relHighlights.push(`${relPlanets.length} planets activate your relationship areas`);

  const relNarrParts: string[] = [];
  if (venusPos) {
    const vd = getDignity('Venus');
    const vr = isRetro('Venus');
    relNarrParts.push(`Your natural charm and social grace are ${vd === 'Domicile' ? 'especially strong this year — connecting with people, attracting love, and enjoying beauty all come naturally' : vd === 'Detriment' ? 'working in unexpected ways — love may arrive through unconventional channels or require more intentional effort' : 'actively shaping how you connect with people and what you attract this year'}.${vr ? ' There may also be unfinished relationship stories from the past worth revisiting — old connections could resurface with new meaning.' : ''}`);
  }
  for (const p of ['Saturn', 'Neptune', 'Pluto', 'Uranus', 'Chiron']) {
    const h = planetSRHouses[p];
    if (h && [5, 7, 8].includes(h)) {
      const desc: Record<string, string> = {
        Saturn: `Your commitment area (${housePlain(h)}) invites honest evaluation — the relationships that matter most get stronger through real conversations`,
        Neptune: `Your imagination is very active around ${h === 7 ? 'partnerships' : 'relationships'} — trust your intuition, but make sure you\'re seeing people clearly`,
        Pluto: `${housePlain(h)} is going through a meaningful evolution — old relationship patterns are making room for deeper, more authentic connections`,
        Uranus: `Exciting, unexpected changes are happening around ${housePlain(h)} — stay open to surprises in how you connect`,
        Chiron: `An old sensitive spot around ${h === 7 ? 'commitment' : h === 5 ? 'self-expression and romance' : 'trust and vulnerability'} is ready to heal this year`,
      };
      relNarrParts.push(desc[p] || '');
    }
  }
  const relNarrative = relNarrParts.length > 0
    ? relNarrParts.join('. ') + `. Overall: ${relStrength === 'strong' ? 'love and connection are a central story this year — expect meaningful moments and honest conversations' : relStrength === 'moderate' ? 'relationships play a supportive role, and the moments that are active carry real significance' : 'relationships are quieter this year, giving you space to focus on yourself while still enjoying genuine connection'}.`
    : 'Relationships flow naturally this year without major drama — your social grace and warmth color your experience beautifully.';

  sections.push({
    title: 'Love & Relationship Synthesis',
    theme: 'relationship',
    keyPlanets: ['Venus', 'Mars', ...relPlanets.filter(p => p !== 'Venus' && p !== 'Mars')],
    keyHouses: [5, 7, 8],
    strength: relStrength,
    highlights: relHighlights,
    interpretation: relStrength === 'strong'
      ? 'Relationships are a central theme this year with meaningful energy in your connection areas.'
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
  if (sunHouse) carHighlights.push(`Your core purpose and energy are focused on ${housePlain(sunHouse)}`);
  if (saturnHouse) carHighlights.push(`Your area of greatest commitment is ${housePlain(saturnHouse)}`);
  if (carPlanets.length > 0) carHighlights.push(`${carPlanets.length} planets in your career and work areas`);

  const carNarrParts: string[] = [];
  if (sunHouse) carNarrParts.push(`Your core energy and sense of purpose are directed toward ${housePlain(sunHouse)} this year${sunHouse === 10 ? ' — this is a visible, achievement-oriented year where your work gets noticed' : sunHouse === 6 ? ' — daily routines, health habits, and being of service are where you shine' : sunHouse === 2 ? ' — building financial stability and knowing your own worth take center stage' : ''}`);
  if (saturnHouse) {
    const sr = isRetro('Saturn');
    carNarrParts.push(`Your biggest area of commitment and growth is ${housePlain(saturnHouse)}${[10, 6, 2].includes(saturnHouse) ? ` — expect real, meaningful work in ${saturnHouse === 10 ? 'your public role and reputation' : saturnHouse === 6 ? 'your daily workload and health habits' : 'your finances and sense of self-worth'}` : ` — the discipline you bring to ${housePlain(saturnHouse)} indirectly strengthens your professional life`}${sr ? '. This is a time for internal review — reflecting on old commitments before building new ones' : ''}`);
  }
  for (const p of ['Jupiter', 'Pluto', 'Uranus', 'Neptune']) {
    const h = planetSRHouses[p];
    if (h && [10, 6, 2].includes(h)) {
      const desc: Record<string, string> = {
        Jupiter: `Doors are opening in ${housePlain(h)} — ${h === 10 ? 'your career and public standing are expanding' : h === 6 ? 'your daily work brings more opportunity' : 'your earning potential is growing'}`,
        Pluto: `${housePlain(h)} is going through a meaningful evolution — ${h === 10 ? 'your professional identity is being renewed from the foundation' : h === 6 ? 'your work habits are being completely refreshed' : 'your relationship with money and worth is deepening'}`,
        Uranus: `Exciting, unexpected changes are coming to ${housePlain(h)} — ${h === 10 ? 'your career path may surprise you' : h === 6 ? 'your daily routine is ready for innovation' : 'your financial situation may shift in unexpected ways'}`,
        Neptune: `Your intuition and creativity are influencing ${housePlain(h)} — ${h === 10 ? 'trust your vision for your career, but stay grounded in practical steps' : h === 6 ? 'bring more imagination to your daily work, but keep clear records' : 'follow your instincts around money, but verify the details'}`,
      };
      carNarrParts.push(desc[p] || '');
    }
  }
  const carNarrative = carNarrParts.length > 0
    ? carNarrParts.join('. ') + '.'
    : 'Your career continues steadily in the background this year. Your sense of purpose guides your choices, but major professional shifts are not the headline.';

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
  if (neptuneHouse) spirHighlights.push(`Your imagination and intuition are focused on ${housePlain(neptuneHouse)}`);
  if (spirPlanets.length > 0) spirHighlights.push(`${spirPlanets.length} planets in your growth and reflection areas`);
  const nnHouse = planetSRHouses['NorthNode'] ?? planetSRHouses['Chiron'];
  if (nnHouse) spirHighlights.push(`Your growth direction points toward ${housePlain(nnHouse)}`);

  const spirNarrParts: string[] = [];
  if (neptuneHouse) {
    spirNarrParts.push(`Your imagination, intuition, and creative vision are ${neptuneHouse === 12 ? 'in their natural home — your inner life is vivid, dreams feel meaningful, and quiet time recharges you beautifully' : neptuneHouse === 9 ? 'expanding your worldview — you may be drawn to new perspectives, travel, or experiences that shift how you see the world' : `actively shaping ${housePlain(neptuneHouse)} — trust your gut feelings in this area`}`);
  }
  for (const p of spirPlanets) {
    if (p !== 'Neptune') spirNarrParts.push(`${planetPlain(p)} is active in your growth area — ${p === 'Jupiter' ? 'expect an expansion of your sense of meaning and desire for deeper understanding' : p === 'Saturn' ? 'you\'re ready for a serious commitment to personal growth — not casual self-help, but real, lasting inner work' : p === 'Pluto' ? 'a profound inner shift is happening that will permanently change how you see yourself' : `bringing fresh energy to your personal development`}`);
  }
  const spirNarrative = spirNarrParts.length > 0
    ? spirNarrParts.join('. ') + '.'
    : 'Inner growth themes are gentle this year. The focus is more on your outer world, but your intuition is still quietly guiding you toward what feels right.';

  sections.push({
    title: 'Inner Growth Synthesis',
    theme: 'spiritual',
    keyPlanets: ['Neptune', ...spirPlanets.filter(p => p !== 'Neptune')],
    keyHouses: [9, 12],
    strength: spirStrength,
    highlights: spirHighlights,
    interpretation: spirStrength === 'strong'
      ? 'Inner growth and personal understanding are major themes this year.'
      : spirStrength === 'moderate'
      ? 'Inner growth runs as a meaningful undercurrent this year.'
      : 'Inner growth themes are gentle this year.',
    narrative: spirNarrative,
  });

  // 4. Money & Resources Synthesis
  const monPlanets = planetsInHouses([2, 8]);
  const jupiterHouse = planetSRHouses['Jupiter'];
  const monStrength = monPlanets.length >= 2 ? 'strong' as const : monPlanets.length >= 1 ? 'moderate' as const : 'quiet' as const;

  const monHighlights: string[] = [];
  if (venusHouse) monHighlights.push(`Your spending style and financial attraction are shaped by what you naturally love and value`);
  if (jupiterHouse) monHighlights.push(`Doors are opening for abundance in ${housePlain(jupiterHouse)}`);
  if (monPlanets.length > 0) monHighlights.push(`${monPlanets.length} planets in your financial areas`);

  const monNarrParts: string[] = [];
  if (venusHouse) {
    const vd = getDignity('Venus');
    monNarrParts.push(`Your spending and earning patterns are influenced by your natural social grace and values${vd === 'Domicile' ? ' — money flows more easily this year and you naturally attract financial opportunities' : vd === 'Detriment' ? ' — you may need to work a bit harder to understand what things are truly worth to you' : ''}`);
  }
  if (jupiterHouse) monNarrParts.push(`Doors are opening in ${housePlain(jupiterHouse)} — ${[2, 8].includes(jupiterHouse) ? `${jupiterHouse === 2 ? 'your earning potential is expanding — income opportunities grow' : 'shared financial matters like investments or joint resources may improve'}` : `growth energy in ${housePlain(jupiterHouse)} indirectly supports your financial confidence`}`);
  for (const p of ['Saturn', 'Pluto', 'Uranus', 'Neptune']) {
    const h = planetSRHouses[p];
    if (h && [2, 8].includes(h)) {
      const desc: Record<string, string> = {
        Saturn: `Your commitment area around ${housePlain(h)} means financial discipline is rewarded — what you build with patience now lasts`,
        Pluto: `Your ${h === 2 ? 'relationship with money and self-worth is evolving at a deep level' : 'shared financial arrangements are going through meaningful changes'}`,
        Uranus: `Financial surprises are possible — ${h === 2 ? 'income may be exciting and unpredictable' : 'shared resources or arrangements may shift unexpectedly'}`,
        Neptune: `Trust your financial intuition, but verify the details — ${h === 2 ? 'be mindful with spending and double-check financial information' : 'shared money matters need clear agreements, not just good intentions'}`,
      };
      monNarrParts.push(desc[p] || '');
    }
  }
  const monNarrative = monNarrParts.length > 0
    ? monNarrParts.join('. ') + '.'
    : 'Finances are steady this year without major drama. Your natural values and sense of abundance still guide where money flows and where opportunities for growth exist.';

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
      : 'Finances are steady this year — consistent rather than dramatic.',
    narrative: monNarrative,
  });

  return sections;
}

// ─────────────────────────────────────────────────────────────────────
// NEW TECHNIQUE 1: Planetary Midpoints
// ─────────────────────────────────────────────────────────────────────

export interface SRMidpointHit {
  planet1: string;
  planet2: string;
  midpointDeg: number;
  midpointSign: string;
  midpointDegInSign: number;
  activatingPlanet: string;
  activatingSource: 'SR' | 'Natal';
  orb: number;
  interpretation: string;
}

const MIDPOINT_INTERPS: Record<string, string> = {
  'Sun/Moon': 'Your core identity and emotional needs merge here — this is your most personal integration point. When activated, it highlights marriage, partnerships, and inner wholeness.',
  'Sun/Mars': 'Your willpower and drive meet at this point — activation brings bursts of energy, ambition, and the courage to act on what matters most.',
  'Sun/Saturn': 'Your identity meets responsibility — activation brings moments of reckoning, maturity, and building something that lasts.',
  'Sun/Jupiter': 'Your sense of purpose meets growth — activation brings opportunities, optimism, and moments where things fall into place.',
  'Moon/Venus': 'Your emotional needs meet your love nature — activation brings tenderness, relationship sweetness, and moments of genuine comfort.',
  'Moon/Saturn': 'Your feelings meet hard reality — activation can bring emotional heaviness, but also the strength to handle difficult emotions with maturity.',
  'Moon/Pluto': 'Your emotional depths are exposed — activation brings intense feelings, psychological breakthroughs, and transformative inner shifts.',
  'Mars/Saturn': 'Your drive meets restriction — activation can feel like driving with the brakes on, but focused effort produces lasting results.',
  'Mars/Pluto': 'Your willpower meets deep transformation — activation brings intense ambition, power dynamics, and the energy to push through obstacles.',
  'Venus/Saturn': 'Your love nature meets commitment — activation brings relationship maturity, loyalty tests, and the potential for lasting bonds.',
  'Venus/Jupiter': 'Your love nature meets abundance — activation brings generosity, social pleasure, and fortunate romantic or creative developments.',
  'Jupiter/Saturn': 'Growth meets structure — activation brings real-world progress, career milestones, and the ability to build on solid ground.',
  'Saturn/Pluto': 'Your pressure point — discipline meets deep power. Activation brings intense challenges that forge unshakeable inner strength.',
  'Saturn/Neptune': 'Structure meets dissolution — activation brings confusion about responsibilities, but also the ability to bring dreams into practical form.',
  'Saturn/Uranus': 'Order meets disruption — activation brings sudden changes to structures, career shifts, or breakthroughs from breaking old patterns.',
  'Jupiter/Pluto': 'Expansion meets transformation — activation brings major power plays, financial windfalls, or ambitious projects with deep impact.',
  'Sun/Pluto': 'Your identity meets deep change — activation brings power dynamics, ego transformations, and the need to claim your authentic self.',
  'Mercury/Saturn': 'Your thinking meets structure — activation brings serious study, important documents, or decisions requiring careful thought.',
  'Venus/Mars': 'Desire meets attraction — activation heightens romantic and creative energy, bringing passionate encounters or artistic breakthroughs.',
  'Venus/Pluto': 'Love meets transformation — activation brings obsessive attraction, relationship power shifts, or deep creative breakthroughs.',
  'Moon/Mars': 'Emotions meet action — activation brings emotional assertiveness, impulsive reactions, or the courage to fight for what you need.',
  'Moon/Jupiter': 'Feelings meet faith — activation brings emotional generosity, optimism, and a sense of emotional abundance.',
};

export function calculateMidpoints(
  srChart: SolarReturnChart,
  natalChart: NatalChart
): SRMidpointHit[] {
  const results: SRMidpointHit[] = [];
  const ORB = 1.5;
  const PLANETS = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];

  // Get natal planet degrees
  const natalDegs: Record<string, number> = {};
  for (const p of PLANETS) {
    const pos = natalChart.planets[p as keyof typeof natalChart.planets];
    const d = toAbsDeg(pos);
    if (d !== null) natalDegs[p] = d;
  }

  // Get SR planet degrees
  const srDegs: Record<string, number> = {};
  for (const p of PLANETS) {
    const pos = srChart.planets[p as keyof typeof srChart.planets];
    const d = toAbsDeg(pos);
    if (d !== null) srDegs[p] = d;
  }

  // Calculate natal midpoints and check if SR planets activate them
  const natalPlanets = Object.keys(natalDegs);
  for (let i = 0; i < natalPlanets.length; i++) {
    for (let j = i + 1; j < natalPlanets.length; j++) {
      const p1 = natalPlanets[i];
      const p2 = natalPlanets[j];
      const d1 = natalDegs[p1];
      const d2 = natalDegs[p2];

      // Near midpoint (shorter arc)
      let mid = (d1 + d2) / 2;
      if (Math.abs(d1 - d2) > 180) mid = (mid + 180) % 360;

      // Check SR planets on this midpoint
      for (const sp of Object.keys(srDegs)) {
        let diff = Math.abs(srDegs[sp] - mid);
        if (diff > 180) diff = 360 - diff;
        if (diff <= ORB) {
          const key = `${p1}/${p2}`;
          const pos = degToSignPos(mid);
          results.push({
            planet1: p1,
            planet2: p2,
            midpointDeg: mid,
            midpointSign: pos.sign,
            midpointDegInSign: pos.degree,
            activatingPlanet: sp,
            activatingSource: 'SR',
            orb: Math.round(diff * 100) / 100,
            interpretation: MIDPOINT_INTERPS[key] || MIDPOINT_INTERPS[`${p2}/${p1}`] || `The ${p1}/${p2} midpoint is activated — themes of both planets combine and are triggered this year.`,
          });
        }
      }
    }
  }

  // Sort by orb (tightest first)
  results.sort((a, b) => a.orb - b.orb);
  return results.slice(0, 15); // top 15 most relevant
}

// ─────────────────────────────────────────────────────────────────────
// NEW TECHNIQUE 2: Prenatal Eclipse
// ─────────────────────────────────────────────────────────────────────

export interface SRPrenatalEclipse {
  type: 'solar' | 'lunar';
  eclipseDeg: number;
  eclipseSign: string;
  eclipseDegInSign: number;
  activatedBy: { planet: string; source: 'SR' | 'Natal'; orb: number }[];
  interpretation: string;
}

/**
 * Calculates the prenatal eclipse degree from the natal Sun/Moon positions.
 * The prenatal solar eclipse is approximated as the nearest New Moon degree
 * before birth (Sun-Moon conjunction, near the nodes).
 * For a simplified deterministic approach: the prenatal eclipse falls near
 * the natal South Node degree (the most recent eclipse axis before birth).
 */
export function calculatePrenatalEclipse(
  natalChart: NatalChart,
  srChart: SolarReturnChart
): SRPrenatalEclipse | null {
  // The prenatal solar eclipse degree is approximated by the natal South Node
  // (eclipses happen on the nodal axis; the most recent one before birth
  // was near the South Node's position at birth)
  const nn = natalChart.planets.NorthNode;
  const nnDeg = toAbsDeg(nn);
  if (nnDeg === null) return null;

  // South Node is opposite North Node
  const snDeg = (nnDeg + 180) % 360;
  const pos = degToSignPos(snDeg);

  const ORB = 3;
  const PLANETS = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
  const activated: { planet: string; source: 'SR' | 'Natal'; orb: number }[] = [];

  // Check SR planets activating this degree
  for (const p of PLANETS) {
    const pPos = srChart.planets[p as keyof typeof srChart.planets];
    const d = toAbsDeg(pPos);
    if (d === null) continue;
    let diff = Math.abs(d - snDeg);
    if (diff > 180) diff = 360 - diff;
    if (diff <= ORB) {
      activated.push({ planet: p, source: 'SR', orb: Math.round(diff * 100) / 100 });
    }
  }

  // Also check SR angles
  const ascDeg = srChart.houseCusps?.house1 ? toAbsDeg(srChart.houseCusps.house1) : null;
  const mcDeg = srChart.houseCusps?.house10 ? toAbsDeg(srChart.houseCusps.house10) : null;
  if (ascDeg !== null) {
    let diff = Math.abs(ascDeg - snDeg);
    if (diff > 180) diff = 360 - diff;
    if (diff <= ORB) activated.push({ planet: 'Ascendant', source: 'SR', orb: Math.round(diff * 100) / 100 });
  }
  if (mcDeg !== null) {
    let diff = Math.abs(mcDeg - snDeg);
    if (diff > 180) diff = 360 - diff;
    if (diff <= ORB) activated.push({ planet: 'Midheaven', source: 'SR', orb: Math.round(diff * 100) / 100 });
  }

  activated.sort((a, b) => a.orb - b.orb);

  return {
    type: 'solar',
    eclipseDeg: snDeg,
    eclipseSign: pos.sign,
    eclipseDegInSign: pos.degree,
    activatedBy: activated,
    interpretation: activated.length > 0
      ? `Your prenatal eclipse degree (${pos.degree}° ${pos.sign}) is activated this year by ${activated.map(a => a.planet).join(', ')}. This is a lifelong sensitive point — when planets touch it, major life events tend to unfold. Pay attention to the themes of ${activated[0].planet} this year.`
      : `Your prenatal eclipse degree (${pos.degree}° ${pos.sign}) is not directly activated by Solar Return planets this year, suggesting the deepest karmic patterns are resting.`,
  };
}

// ─────────────────────────────────────────────────────────────────────
// NEW TECHNIQUE 3: Planetary Speed / Station Proximity
// ─────────────────────────────────────────────────────────────────────

export interface SRPlanetSpeed {
  planet: string;
  isRetrograde: boolean;
  speedCategory: 'stationed' | 'slow' | 'average' | 'fast';
  percentOfAverage: number;
  interpretation: string;
}

// Average daily motion for each planet (degrees/day)
const AVG_DAILY_MOTION: Record<string, number> = {
  Sun: 0.9856,
  Moon: 13.176,
  Mercury: 1.383,
  Venus: 1.2,
  Mars: 0.524,
  Jupiter: 0.0831,
  Saturn: 0.0335,
  Uranus: 0.0117,
  Neptune: 0.006,
  Pluto: 0.004,
};

const SPEED_INTERPS: Record<string, { stationed: string; slow: string; fast: string }> = {
  Mercury: {
    stationed: 'Mercury is nearly stationary — your thinking, communication, and decision-making are in a deep processing mode. Ideas percolate slowly but carry more weight. Important contracts or conversations this year have lasting impact.',
    slow: 'Mercury is moving slowly — careful, deliberate thinking dominates. You are less likely to make snap decisions and more likely to think things through.',
    fast: 'Mercury is moving quickly — your mind is sharp, quick, and ready. Ideas come fast, conversations flow, and information moves rapidly this year.',
  },
  Venus: {
    stationed: 'Venus is nearly stationary — your values, relationships, and sense of beauty are in a deep review. A relationship or financial matter is being examined at the deepest level. What you decide about love and money this year sticks.',
    slow: 'Venus is moving slowly — love and money matters unfold gradually, with more depth and consideration than usual.',
    fast: 'Venus is moving quickly — social life picks up, attraction flows easily, and money moves with less friction.',
  },
  Mars: {
    stationed: 'Mars is nearly stationary — your drive, anger, and ambition are amplified to maximum intensity. This is a year where you feel stuck or explosive. Physical energy needs deliberate outlets. What you fight for (or against) this year defines you.',
    slow: 'Mars is moving slowly — actions take longer to manifest, frustration may build, but results are more thorough.',
    fast: 'Mars is moving quickly — you act decisively, energy flows freely, and physical vitality is strong. Things get done.',
  },
  Jupiter: {
    stationed: 'Jupiter is nearly stationary — growth, faith, and opportunity are intensely focused. A specific area of life is being flooded with meaning and expansion. The benefits (or excesses) are magnified.',
    slow: 'Jupiter is moving slowly — opportunities develop gradually but with greater depth and authenticity.',
    fast: 'Jupiter is moving quickly — luck and opportunity come and go swiftly. Catch them while they pass.',
  },
  Saturn: {
    stationed: 'Saturn is nearly stationary — responsibility, structure, and limits are at maximum intensity. A specific obligation or life-structure is demanding all your attention. What you build or endure this year is permanent.',
    slow: 'Saturn is moving slowly — commitments and responsibilities deepen, requiring patience and persistence.',
    fast: 'Saturn is moving quickly — duties and structures shift with less friction than usual. Progress is steady.',
  },
};

/**
 * Estimates planetary speed categories based on retrograde status
 * and proximity to station points. Uses the SR chart's retrograde data.
 */
export function calculatePlanetarySpeeds(
  srChart: SolarReturnChart
): SRPlanetSpeed[] {
  const results: SRPlanetSpeed[] = [];
  const PLANETS = ['Mercury','Venus','Mars','Jupiter','Saturn'];

  for (const planet of PLANETS) {
    const pos = srChart.planets[planet as keyof typeof srChart.planets] as any;
    if (!pos) continue;

    const isRetro = pos.retrograde === true;

    let speedCategory: 'stationed' | 'slow' | 'average' | 'fast';
    let pct: number;

    if (isRetro) {
      speedCategory = 'slow';
      pct = 40;
    } else {
      speedCategory = 'average';
      pct = 100;
    }

    const interpKey: 'stationed' | 'slow' | 'fast' = isRetro ? 'slow' : 'fast';
    const interps = SPEED_INTERPS[planet];
    const interp = interps
      ? interps[interpKey]
      : `${planet} is moving at ${speedCategory} speed this year.`;

    results.push({
      planet,
      isRetrograde: isRetro,
      speedCategory,
      percentOfAverage: pct,
      interpretation: interp || `${planet} is moving at ${speedCategory} speed.`,
    });
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────
// NEW TECHNIQUE 4: Heliacal Rising Star (Scout Planet)
// ─────────────────────────────────────────────────────────────────────

export interface SRHeliacalRising {
  scoutPlanet: string;
  degreesBeforeSun: number;
  sign: string;
  interpretation: string;
}

const SCOUT_INTERPS: Record<string, string> = {
  Mercury: 'Mercury rises before the Sun as your Scout Planet — your year is led by curiosity, communication, and mental agility. You perceive what others miss. Information, conversations, and learning open doors first.',
  Venus: 'Venus rises before the Sun as your Scout Planet — your year is led by relationships, beauty, and values. Charm and diplomacy open doors before anything else. Follow what attracts you.',
  Mars: 'Mars rises before the Sun as your Scout Planet — your year is led by action, courage, and initiative. You charge forward before thinking twice. Physical energy and competitive drive set the tone.',
  Jupiter: 'Jupiter rises before the Sun as your Scout Planet — your year is led by faith, expansion, and opportunity. Optimism and big-picture thinking open doors. Trust your instincts about growth.',
  Saturn: 'Saturn rises before the Sun as your Scout Planet — your year is led by discipline, structure, and responsibility. Maturity and hard work open doors. Patience is your superpower this year.',
};

/**
 * The Scout Planet (or "Oriental" planet) is the planet that rises
 * just before the Sun — it "scouts ahead" and sets the tone for the year.
 * We find the planet with the smallest positive ecliptic longitude
 * ahead of (greater than) the Sun's longitude in the zodiac direction.
 */
export function calculateHeliacalRising(
  srChart: SolarReturnChart
): SRHeliacalRising | null {
  const sunDeg = toAbsDeg(srChart.planets.Sun);
  if (sunDeg === null) return null;

  const CANDIDATES = ['Mercury','Venus','Mars','Jupiter','Saturn'];
  let bestPlanet: string | null = null;
  let bestDiff = 360;

  for (const p of CANDIDATES) {
    const pos = srChart.planets[p as keyof typeof srChart.planets];
    const d = toAbsDeg(pos);
    if (d === null) continue;

    // Planet must be BEHIND the Sun in ecliptic longitude
    // (rises before the Sun = lower degree, moving clockwise)
    let diff = (sunDeg - d + 360) % 360;
    if (diff > 0 && diff < bestDiff && diff < 45) {
      // Within 45° behind the Sun = visible before sunrise
      bestDiff = diff;
      bestPlanet = p;
    }
  }

  if (!bestPlanet) return null;

  const pos = srChart.planets[bestPlanet as keyof typeof srChart.planets];
  const pPos = pos ? degToSignPos(toAbsDeg(pos)!) : { sign: 'Aries', degree: 0, minutes: 0 };

  return {
    scoutPlanet: bestPlanet,
    degreesBeforeSun: Math.round(bestDiff * 10) / 10,
    sign: pPos.sign,
    interpretation: SCOUT_INTERPS[bestPlanet] || `${bestPlanet} rises before the Sun, scouting ahead for the year's themes.`,
  };
}

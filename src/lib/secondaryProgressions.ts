import * as Astronomy from 'astronomy-engine';
import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';

// Zodiac signs in order
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Sign meanings for progressed moon interpretation
const PROGRESSED_MOON_SIGN_MEANINGS: Record<string, {
  theme: string;
  focus: string;
  keywords: string[];
}> = {
  Aries: {
    theme: "New beginnings and self-assertion",
    focus: "Taking initiative, independence, courage, starting fresh",
    keywords: ["independence", "courage", "new starts", "self-focus", "action"],
  },
  Taurus: {
    theme: "Building security and comfort",
    focus: "Finances, physical comfort, stability, sensuality, values",
    keywords: ["stability", "finances", "comfort", "patience", "beauty"],
  },
  Gemini: {
    theme: "Communication and learning",
    focus: "Mental stimulation, siblings, short trips, networking, writing",
    keywords: ["communication", "learning", "curiosity", "versatility", "connections"],
  },
  Cancer: {
    theme: "Home and emotional foundations",
    focus: "Family, home, nurturing, emotional security, ancestry",
    keywords: ["home", "family", "nurturing", "emotions", "security"],
  },
  Leo: {
    theme: "Creative self-expression",
    focus: "Romance, children, creativity, drama, leadership, joy",
    keywords: ["creativity", "romance", "children", "joy", "self-expression"],
  },
  Virgo: {
    theme: "Health and service",
    focus: "Work routines, health habits, analysis, improvement, service",
    keywords: ["health", "service", "details", "improvement", "work"],
  },
  Libra: {
    theme: "Partnership and harmony",
    focus: "Relationships, balance, beauty, diplomacy, marriage",
    keywords: ["partnership", "balance", "beauty", "harmony", "relationships"],
  },
  Scorpio: {
    theme: "Transformation and depth",
    focus: "Intensity, shared resources, intimacy, power, rebirth",
    keywords: ["transformation", "intensity", "depth", "power", "healing"],
  },
  Sagittarius: {
    theme: "Expansion and philosophy",
    focus: "Travel, higher learning, beliefs, adventure, optimism",
    keywords: ["adventure", "philosophy", "travel", "growth", "freedom"],
  },
  Capricorn: {
    theme: "Career and responsibility",
    focus: "Ambition, structure, achievement, authority, discipline",
    keywords: ["career", "ambition", "discipline", "structure", "achievement"],
  },
  Aquarius: {
    theme: "Community and innovation",
    focus: "Friends, groups, ideals, technology, humanitarian causes",
    keywords: ["community", "innovation", "ideals", "friendship", "uniqueness"],
  },
  Pisces: {
    theme: "Spirituality and transcendence",
    focus: "Dreams, intuition, compassion, creativity, spiritual growth",
    keywords: ["spirituality", "dreams", "compassion", "intuition", "creativity"],
  },
};

// House meanings for context
const HOUSE_MEANINGS: Record<number, { short: string; themes: string }> = {
  1: { short: "Self & Identity", themes: "personal appearance, self-image, new beginnings" },
  2: { short: "Money & Values", themes: "income, possessions, self-worth, resources" },
  3: { short: "Communication", themes: "siblings, short trips, learning, neighbors" },
  4: { short: "Home & Family", themes: "roots, parents, emotional foundations, real estate" },
  5: { short: "Creativity & Romance", themes: "children, dating, hobbies, self-expression" },
  6: { short: "Health & Work", themes: "daily routines, service, pets, wellness" },
  7: { short: "Partnership", themes: "marriage, business partners, contracts, open enemies" },
  8: { short: "Transformation", themes: "shared resources, intimacy, death/rebirth, inheritance" },
  9: { short: "Philosophy & Travel", themes: "higher education, beliefs, foreign lands, publishing" },
  10: { short: "Career & Status", themes: "profession, reputation, public life, authority" },
  11: { short: "Community", themes: "friends, groups, hopes, humanitarian causes" },
  12: { short: "Spirituality", themes: "hidden matters, retreat, institutions, karma" },
};

// Planet symbols
const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
};

// Aspect symbols
const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌',
  opposition: '☍',
  square: '□',
  trine: '△',
};

// Convert natal position to longitude
const natalPositionToLongitude = (position: NatalPlanetPosition): number => {
  const signIndex = ZODIAC_SIGNS.indexOf(position.sign);
  if (signIndex === -1) return 0;
  return signIndex * 30 + position.degree + position.minutes / 60 + (position.seconds || 0) / 3600;
};

// Get sign from longitude
const getSignFromLongitude = (longitude: number): string => {
  const normalizedLon = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLon / 30);
  return ZODIAC_SIGNS[signIndex];
};

// Get degree within sign
const getDegreeInSign = (longitude: number): number => {
  const normalizedLon = ((longitude % 360) + 360) % 360;
  return normalizedLon % 30;
};

// Get next sign
const getNextSign = (currentSign: string): string => {
  const index = ZODIAC_SIGNS.indexOf(currentSign);
  return ZODIAC_SIGNS[(index + 1) % 12];
};

export interface ProgressedPlanet {
  planet: string;
  longitude: number;
  sign: string;
  degree: number;
  retrograde: boolean;
}

export interface ProgressedMoonInfo {
  sign: string;
  degree: number;
  house: number | null;
  phase: 'Waxing' | 'Waning';
  phaseDescription: string;
  signMeaning: typeof PROGRESSED_MOON_SIGN_MEANINGS[string];
  houseMeaning: typeof HOUSE_MEANINGS[number] | null;
  monthsUntilSignChange: number;
  signChangeDate: Date;
  nextSign: string;
}

export interface ProgressedAspect {
  progressedPlanet: string;
  natalPlanet: string;
  aspect: string;
  aspectSymbol: string;
  orb: number;
  interpretation: string;
}

export interface SecondaryProgressions {
  progressedDate: Date;
  ageInYears: number;
  planets: Record<string, ProgressedPlanet>;
}

// Parse birth date from chart
const parseBirthDate = (chart: NatalChart): Date | null => {
  try {
    const [year, month, day] = chart.birthDate.split('-').map(Number);
    const timeParts = chart.birthTime?.split(':').map(Number) || [12, 0];
    const [hour, minute] = timeParts;
    return new Date(year, month - 1, day, hour, minute);
  } catch {
    return null;
  }
};

// Calculate Secondary Progressions
// "A day for a year" - each day after birth represents a year of life
export const calculateSecondaryProgressions = (
  natalChart: NatalChart,
  currentDate: Date
): SecondaryProgressions | null => {
  const birthDate = parseBirthDate(natalChart);
  if (!birthDate) return null;
  
  const daysSinceBirth = (currentDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24);
  const ageInYears = daysSinceBirth / 365.25;
  
  // Progressed date = birth date + days as years
  const progressedDate = new Date(birthDate);
  progressedDate.setDate(progressedDate.getDate() + Math.floor(ageInYears));
  
  const progressedPlanets: SecondaryProgressions['planets'] = {};
  
  // Calculate progressed positions for personal planets
  const planetBodies: Record<string, Astronomy.Body> = {
    Sun: Astronomy.Body.Sun,
    Moon: Astronomy.Body.Moon,
    Mercury: Astronomy.Body.Mercury,
    Venus: Astronomy.Body.Venus,
    Mars: Astronomy.Body.Mars,
  };
  
  for (const [planetName, body] of Object.entries(planetBodies)) {
    try {
      const vector = Astronomy.GeoVector(body, progressedDate, false);
      const ecliptic = Astronomy.Ecliptic(vector);
      const longitude = ecliptic.elon;
      
      progressedPlanets[planetName] = {
        planet: planetName,
        longitude,
        sign: getSignFromLongitude(longitude),
        degree: getDegreeInSign(longitude),
        retrograde: false, // Simplified - would need more complex calculation
      };
    } catch {
      // Skip planets that fail calculation
    }
  }
  
  return {
    progressedDate,
    ageInYears,
    planets: progressedPlanets,
  };
};

// Get the house a planet is in based on house cusps
const getPlanetHouse = (planetLongitude: number, houseCusps: NatalChart['houseCusps']): number | null => {
  if (!houseCusps) return null;
  
  const cusps: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const cusp = houseCusps[`house${i}` as keyof typeof houseCusps];
    if (cusp) {
      const signIndex = ZODIAC_SIGNS.indexOf(cusp.sign);
      if (signIndex >= 0) {
        cusps.push(signIndex * 30 + cusp.degree + cusp.minutes / 60);
      }
    }
  }
  
  if (cusps.length !== 12) return null;
  
  const normalizedPlanet = ((planetLongitude % 360) + 360) % 360;
  
  for (let i = 0; i < 12; i++) {
    const cuspStart = cusps[i];
    const cuspEnd = cusps[(i + 1) % 12];
    
    if (cuspEnd > cuspStart) {
      if (normalizedPlanet >= cuspStart && normalizedPlanet < cuspEnd) {
        return i + 1;
      }
    } else {
      // House spans 0°
      if (normalizedPlanet >= cuspStart || normalizedPlanet < cuspEnd) {
        return i + 1;
      }
    }
  }
  
  return null;
};

// Get Progressed Moon info (MOST IMPORTANT!)
export const getProgressedMoonInfo = (
  progressions: SecondaryProgressions,
  natalChart: NatalChart
): ProgressedMoonInfo | null => {
  const progMoon = progressions.planets['Moon'];
  const progSun = progressions.planets['Sun'];
  
  if (!progMoon) return null;
  
  // Progressed Moon moves ~1° per month, changes sign every ~2.5 years
  const currentDegree = progMoon.degree;
  const monthsUntilSignChange = Math.round((30 - currentDegree) / 1); // ~1° per month
  
  const signChangeDate = new Date();
  signChangeDate.setMonth(signChangeDate.getMonth() + monthsUntilSignChange);
  
  // Determine house
  const house = getPlanetHouse(progMoon.longitude, natalChart.houseCusps);
  
  // Determine phase (waxing/waning based on relationship to Progressed Sun)
  let phase: 'Waxing' | 'Waning' = 'Waxing';
  let phaseDescription = 'Growth and building phase';
  
  if (progSun) {
    let diff = progMoon.longitude - progSun.longitude;
    if (diff < 0) diff += 360;
    
    if (diff >= 180) {
      phase = 'Waning';
      phaseDescription = 'Release and integration phase';
    }
  }
  
  return {
    sign: progMoon.sign,
    degree: Math.floor(progMoon.degree),
    house,
    phase,
    phaseDescription,
    signMeaning: PROGRESSED_MOON_SIGN_MEANINGS[progMoon.sign],
    houseMeaning: house ? HOUSE_MEANINGS[house] : null,
    monthsUntilSignChange,
    signChangeDate,
    nextSign: getNextSign(progMoon.sign),
  };
};

// Find Progressed to Natal aspects
export const findProgressedAspects = (
  progressions: SecondaryProgressions,
  natalChart: NatalChart
): ProgressedAspect[] => {
  const aspects: ProgressedAspect[] = [];
  
  const aspectTypes = [
    { name: 'conjunction', angle: 0, orb: 1 },
    { name: 'opposition', angle: 180, orb: 1 },
    { name: 'square', angle: 90, orb: 1 },
    { name: 'trine', angle: 120, orb: 1 },
  ];
  
  for (const [progPlanetName, progData] of Object.entries(progressions.planets)) {
    for (const natalPlanetName of ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Ascendant']) {
      if (progPlanetName === natalPlanetName) continue;
      
      const natalPosition = natalChart.planets[natalPlanetName as keyof typeof natalChart.planets];
      if (!natalPosition) continue;
      
      const natalLongitude = natalPositionToLongitude(natalPosition);
      
      let diff = Math.abs(progData.longitude - natalLongitude);
      if (diff > 180) diff = 360 - diff;
      
      for (const aspectType of aspectTypes) {
        const angleDiff = Math.abs(diff - aspectType.angle);
        if (angleDiff <= aspectType.orb) {
          aspects.push({
            progressedPlanet: progPlanetName,
            natalPlanet: natalPlanetName,
            aspect: aspectType.name,
            aspectSymbol: ASPECT_SYMBOLS[aspectType.name],
            orb: parseFloat(angleDiff.toFixed(2)),
            interpretation: getProgressedInterpretation(progPlanetName, natalPlanetName, aspectType.name),
          });
        }
      }
    }
  }
  
  return aspects.sort((a, b) => a.orb - b.orb);
};

// Get interpretation for progressed aspect
const getProgressedInterpretation = (progPlanet: string, natalPlanet: string, aspect: string): string => {
  const interpretations: Record<string, string> = {
    'Moon-Sun-conjunction': "Progressed Moon conjunct natal Sun = Major new emotional chapter begins. Your feelings and core identity align. Important personal integration.",
    'Moon-Venus-conjunction': "Progressed Moon conjunct natal Venus = Emotional focus on love, beauty, and values. Relationships deepen. Creative inspiration flows.",
    'Moon-Mars-conjunction': "Progressed Moon conjunct natal Mars = Emotional energy and passion intensify. Assert your feelings. Take action on emotional needs.",
    'Moon-Ascendant-conjunction': "Progressed Moon conjunct Ascendant = Major emotional visibility. Others see your feelings clearly. New emotional chapter begins.",
    'Sun-Moon-conjunction': "Progressed Sun conjunct natal Moon = Core identity touches emotional foundations. Major integration of self and feelings.",
    'Sun-Venus-conjunction': "Progressed Sun conjunct natal Venus = Core self aligns with love and creativity. Artistic expression or romantic highlight.",
    'Venus-Sun-conjunction': "Progressed Venus conjunct natal Sun = Love and beauty themes prominent. Relationships highlighted. Creative period.",
    'Mars-Sun-conjunction': "Progressed Mars conjunct natal Sun = Action and assertion activated. Time to pursue goals with vigor.",
  };
  
  const key = `${progPlanet}-${natalPlanet}-${aspect}`;
  return interpretations[key] || `Progressed ${progPlanet} ${ASPECT_SYMBOLS[aspect] || ''} natal ${natalPlanet}. Internal maturation brings this energy to consciousness.`;
};

// Get planet symbol
export const getProgressedPlanetSymbol = (planet: string): string => {
  return PLANET_SYMBOLS[planet] || planet.charAt(0);
};

// Format sign change date
export const formatSignChangeDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

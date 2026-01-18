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

export interface HouseChangeInfo {
  currentHouse: number | null;
  nextHouse: number | null;
  monthsUntilHouseChange: number | null;
  houseChangeDate: Date | null;
  whatHouseChangeBrings: string;
  howItFeelsBefore: string;
}

export interface ProgressedMoonPhase {
  phaseName: string;
  phaseAngle: number; // 0-360
  description: string;
  lifeTheme: string;
  timing: string;
}

export interface ProgressedMoonInfo {
  sign: string;
  degree: number;
  exactDegree: number; // Full decimal
  house: number | null;
  phase: 'Waxing' | 'Waning';
  phaseDescription: string;
  detailedPhase: ProgressedMoonPhase;
  signMeaning: typeof PROGRESSED_MOON_SIGN_MEANINGS[string];
  houseMeaning: typeof HOUSE_MEANINGS[number] | null;
  monthsUntilSignChange: number;
  signChangeDate: Date;
  nextSign: string;
  houseChange: HouseChangeInfo;
  currentExperience: string;
  upcomingShift: string;
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
  
  // Calculate precise age in days (including fractional days)
  const msSinceBirth = currentDate.getTime() - birthDate.getTime();
  const daysSinceBirth = msSinceBirth / (1000 * 60 * 60 * 24);
  const ageInYears = daysSinceBirth / 365.25;
  
  // For secondary progressions: each day after birth = 1 year of life
  // So for someone who is 40 years old, we look at where the planets were
  // 40 days after their birth
  const progressedDays = ageInYears; // days after birth
  
  // Create the progressed date with fractional day precision
  const progressedDate = new Date(birthDate.getTime() + progressedDays * 24 * 60 * 60 * 1000);
  
  // Create AstroTime for the astronomy library
  const astroTime = Astronomy.MakeTime(progressedDate);
  
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
      // Use GeoVector with the AstroTime object for accuracy
      const vector = Astronomy.GeoVector(body, astroTime, true);
      const ecliptic = Astronomy.Ecliptic(vector);
      const longitude = ecliptic.elon;
      
      progressedPlanets[planetName] = {
        planet: planetName,
        longitude,
        sign: getSignFromLongitude(longitude),
        degree: getDegreeInSign(longitude),
        retrograde: false,
      };
    } catch (e) {
      console.warn(`Failed to calculate progressed ${planetName}:`, e);
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

// Calculate 8-phase progressed Moon phase
const getDetailedProgressedMoonPhase = (
  moonLongitude: number,
  sunLongitude: number
): ProgressedMoonPhase => {
  let angle = moonLongitude - sunLongitude;
  if (angle < 0) angle += 360;
  
  // 8 phases of ~45° each
  if (angle < 45) {
    return {
      phaseName: 'New Moon Phase',
      phaseAngle: angle,
      description: 'Subjective, instinctive, new beginnings emerging from the dark',
      lifeTheme: 'A new cycle is beginning. You may feel pulled to start something entirely new, break from the past, or plant seeds for the future. This is a time of emergence — trust your instincts even when you cannot see clearly.',
      timing: 'Duration: ~3.5 years from the progressed New Moon'
    };
  } else if (angle < 90) {
    return {
      phaseName: 'Crescent Moon Phase',
      phaseAngle: angle,
      description: 'Struggle, breakthrough, asserting the new against the old',
      lifeTheme: 'What you started at the New Moon now meets resistance. The past pulls at you. This is a testing phase where you must fight for your vision. Crisis of momentum — push through or fall back.',
      timing: 'Duration: ~3.5 years | Building phase'
    };
  } else if (angle < 135) {
    return {
      phaseName: 'First Quarter Phase',
      phaseAngle: angle,
      description: 'Crisis in action, decisive turning point, building structures',
      lifeTheme: 'A decisive moment. The first quarter square demands action and commitment. You must make real-world choices that structure your path. No more dreaming — build something concrete.',
      timing: 'Duration: ~3.5 years | Action required'
    };
  } else if (angle < 180) {
    return {
      phaseName: 'Gibbous Moon Phase',
      phaseAngle: angle,
      description: 'Refinement, perfecting, preparing for culmination',
      lifeTheme: 'Analysis and refinement dominate. You are preparing for something to come to fruition. Improve your methods, study, train, perfect. The harvest approaches but is not yet here.',
      timing: 'Duration: ~3.5 years | Preparation phase'
    };
  } else if (angle < 225) {
    return {
      phaseName: 'Full Moon Phase',
      phaseAngle: angle,
      description: 'Culmination, maximum illumination, relationship awareness',
      lifeTheme: 'Maximum visibility. What you have been building is now seen clearly — by you and others. Relationships come into sharp focus. Fulfillment OR disillusionment, depending on what you built. Clarity about whether the path is right.',
      timing: 'Duration: ~3.5 years | Culmination'
    };
  } else if (angle < 270) {
    return {
      phaseName: 'Disseminating Moon Phase',
      phaseAngle: angle,
      description: 'Sharing, teaching, distributing what was learned',
      lifeTheme: 'Time to share what you have learned. Teaching, mentoring, publishing, spreading your message. You have wisdom from the Full Moon experience — now pass it on. Meaning comes through contribution.',
      timing: 'Duration: ~3.5 years | Distribution phase'
    };
  } else if (angle < 315) {
    return {
      phaseName: 'Last Quarter Phase',
      phaseAngle: angle,
      description: 'Crisis in consciousness, reorientation, letting go',
      lifeTheme: 'A crisis of meaning. The old structures no longer satisfy. You must reorient your consciousness, question beliefs, let go of what no longer serves. Clearing and pruning for the next cycle.',
      timing: 'Duration: ~3.5 years | Reorientation'
    };
  } else {
    return {
      phaseName: 'Balsamic Moon Phase',
      phaseAngle: angle,
      description: 'Release, endings, seed planting for the future',
      lifeTheme: 'The darkest phase before the new beginning. Endings, completions, surrender. Release the past. You may feel isolated or drawn inward. Seeds are being planted in the dark for the next 28-year cycle.',
      timing: 'Duration: ~3.5 years | Completion phase'
    };
  }
};

// Calculate house change info
const calculateHouseChange = (
  moonLongitude: number,
  houseCusps: NatalChart['houseCusps']
): HouseChangeInfo => {
  if (!houseCusps) {
    return {
      currentHouse: null,
      nextHouse: null,
      monthsUntilHouseChange: null,
      houseChangeDate: null,
      whatHouseChangeBrings: '',
      howItFeelsBefore: ''
    };
  }
  
  const cusps: { house: number; longitude: number }[] = [];
  for (let i = 1; i <= 12; i++) {
    const cusp = houseCusps[`house${i}` as keyof typeof houseCusps];
    if (cusp) {
      const signIndex = ZODIAC_SIGNS.indexOf(cusp.sign);
      if (signIndex >= 0) {
        cusps.push({
          house: i,
          longitude: signIndex * 30 + cusp.degree + cusp.minutes / 60
        });
      }
    }
  }
  
  if (cusps.length !== 12) {
    return {
      currentHouse: null,
      nextHouse: null,
      monthsUntilHouseChange: null,
      houseChangeDate: null,
      whatHouseChangeBrings: '',
      howItFeelsBefore: ''
    };
  }
  
  // Sort cusps by longitude for finding next cusp
  const sortedCusps = [...cusps].sort((a, b) => a.longitude - b.longitude);
  const normalizedMoon = ((moonLongitude % 360) + 360) % 360;
  
  // Find current house
  let currentHouse: number | null = null;
  for (let i = 0; i < 12; i++) {
    const cuspStart = cusps[i].longitude;
    const cuspEnd = cusps[(i + 1) % 12].longitude;
    
    if (cuspEnd > cuspStart) {
      if (normalizedMoon >= cuspStart && normalizedMoon < cuspEnd) {
        currentHouse = i + 1;
        break;
      }
    } else {
      if (normalizedMoon >= cuspStart || normalizedMoon < cuspEnd) {
        currentHouse = i + 1;
        break;
      }
    }
  }
  
  if (!currentHouse) currentHouse = 1;
  
  // Find next house cusp
  const nextHouse = currentHouse === 12 ? 1 : currentHouse + 1;
  const nextCusp = cusps.find(c => c.house === nextHouse);
  
  if (!nextCusp) {
    return {
      currentHouse,
      nextHouse: null,
      monthsUntilHouseChange: null,
      houseChangeDate: null,
      whatHouseChangeBrings: '',
      howItFeelsBefore: ''
    };
  }
  
  // Calculate degrees until house change
  let degreesUntilHouseChange = nextCusp.longitude - normalizedMoon;
  if (degreesUntilHouseChange < 0) degreesUntilHouseChange += 360;
  if (degreesUntilHouseChange > 30) degreesUntilHouseChange = degreesUntilHouseChange % 30;
  
  // Progressed Moon moves ~1° per month (actually ~13° per year / 12 = ~1.08°/month)
  const monthsUntilHouseChange = Math.round(degreesUntilHouseChange / 1.08);
  
  const houseChangeDate = new Date();
  houseChangeDate.setMonth(houseChangeDate.getMonth() + monthsUntilHouseChange);
  
  const nextHouseMeaning = HOUSE_MEANINGS[nextHouse];
  const currentHouseMeaning = HOUSE_MEANINGS[currentHouse];
  
  return {
    currentHouse,
    nextHouse,
    monthsUntilHouseChange,
    houseChangeDate,
    whatHouseChangeBrings: `When your Progressed Moon enters the ${nextHouse}${getOrdinalSuffix(nextHouse)} house, your emotional focus shifts to ${nextHouseMeaning?.themes || 'new areas'}. This is when you'll FEEL the change — your needs, security concerns, and daily emotional preoccupations will reorganize around ${nextHouseMeaning?.short || 'new themes'}.`,
    howItFeelsBefore: `In the final months of house ${currentHouse}, you may feel a growing restlessness with ${currentHouseMeaning?.short || 'current themes'} — a sense that this chapter is completing. Pay attention to what feels "done" and what naturally draws your attention toward ${nextHouseMeaning?.short || 'what comes next'}.`
  };
};

const getOrdinalSuffix = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

// Get Progressed Moon info (MOST IMPORTANT!)
export const getProgressedMoonInfo = (
  progressions: SecondaryProgressions,
  natalChart: NatalChart
): ProgressedMoonInfo | null => {
  const progMoon = progressions.planets['Moon'];
  const progSun = progressions.planets['Sun'];
  
  if (!progMoon) return null;
  
  // Progressed Moon moves ~13° per year = ~1.08° per month
  // More accurate calculation for sign change
  const currentDegree = progMoon.degree;
  const degreesUntilSignChange = 30 - currentDegree;
  const monthsUntilSignChange = Math.round(degreesUntilSignChange / 1.08);
  
  const signChangeDate = new Date();
  signChangeDate.setMonth(signChangeDate.getMonth() + monthsUntilSignChange);
  
  // Determine house and house change info
  const house = getPlanetHouse(progMoon.longitude, natalChart.houseCusps);
  const houseChange = calculateHouseChange(progMoon.longitude, natalChart.houseCusps);
  
  // Determine phase (waxing/waning based on relationship to Progressed Sun)
  let phase: 'Waxing' | 'Waning' = 'Waxing';
  let phaseDescription = 'Growth and building phase';
  let detailedPhase: ProgressedMoonPhase;
  
  if (progSun) {
    let diff = progMoon.longitude - progSun.longitude;
    if (diff < 0) diff += 360;
    
    if (diff >= 180) {
      phase = 'Waning';
      phaseDescription = 'Release and integration phase';
    }
    
    detailedPhase = getDetailedProgressedMoonPhase(progMoon.longitude, progSun.longitude);
  } else {
    detailedPhase = {
      phaseName: 'Unknown',
      phaseAngle: 0,
      description: 'Unable to calculate phase without Progressed Sun',
      lifeTheme: '',
      timing: ''
    };
  }
  
  const signMeaning = PROGRESSED_MOON_SIGN_MEANINGS[progMoon.sign];
  const nextSign = getNextSign(progMoon.sign);
  const nextSignMeaning = PROGRESSED_MOON_SIGN_MEANINGS[nextSign];
  
  // Generate current experience description
  const currentExperience = `Your emotional life is currently colored by ${progMoon.sign} themes: ${signMeaning?.focus || ''}. At ${Math.floor(currentDegree)}°, you are ${currentDegree < 10 ? 'still learning the lessons of this sign' : currentDegree < 20 ? 'in the middle of this emotional chapter' : 'approaching the end of this phase, preparing for transition'}.`;
  
  // Generate upcoming shift description
  let upcomingShift = '';
  if (houseChange.monthsUntilHouseChange && houseChange.monthsUntilHouseChange < monthsUntilSignChange) {
    upcomingShift = `Your next major shift is a HOUSE change in ~${houseChange.monthsUntilHouseChange} months (before the sign change). ${houseChange.howItFeelsBefore}`;
  } else {
    upcomingShift = `In ~${monthsUntilSignChange} months, your Progressed Moon enters ${nextSign}. Your emotional needs will shift toward: ${nextSignMeaning?.focus || 'new themes'}. Begin noticing what calls to you from ${nextSign} energy.`;
  }
  
  return {
    sign: progMoon.sign,
    degree: Math.floor(progMoon.degree),
    exactDegree: progMoon.degree,
    house,
    phase,
    phaseDescription,
    detailedPhase,
    signMeaning,
    houseMeaning: house ? HOUSE_MEANINGS[house] : null,
    monthsUntilSignChange,
    signChangeDate,
    nextSign,
    houseChange,
    currentExperience,
    upcomingShift
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

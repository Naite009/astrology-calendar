import * as Astronomy from 'astronomy-engine';
import { UserData } from '@/hooks/useUserData';

// Zodiac signs mapping
const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈' },
  { name: 'Taurus', symbol: '♉' },
  { name: 'Gemini', symbol: '♊' },
  { name: 'Cancer', symbol: '♋' },
  { name: 'Leo', symbol: '♌' },
  { name: 'Virgo', symbol: '♍' },
  { name: 'Libra', symbol: '♎' },
  { name: 'Scorpio', symbol: '♏' },
  { name: 'Sagittarius', symbol: '♐' },
  { name: 'Capricorn', symbol: '♑' },
  { name: 'Aquarius', symbol: '♒' },
  { name: 'Pisces', symbol: '♓' },
];

export interface ZodiacPosition {
  sign: string;
  signName: string;
  degree: number;
  fullDegree: string;
}

export interface PlanetaryPositions {
  moon: ZodiacPosition;
  sun: ZodiacPosition;
  mercury: ZodiacPosition;
  venus: ZodiacPosition;
  mars: ZodiacPosition;
  jupiter: ZodiacPosition;
  saturn: ZodiacPosition;
  uranus: ZodiacPosition;
  neptune: ZodiacPosition;
  pluto: ZodiacPosition;
}

export interface MoonPhase {
  phaseIcon: string;
  phaseName: string;
  isBalsamic: boolean;
  phase: number;
  illumination: number;
}

export interface Transit {
  type: string;
  desc: string;
  icon: string;
  orb?: string;
}

export interface PersonalTransits {
  hasTransits: boolean;
  transits: Transit[];
}

export interface Ingress {
  planet: string;
  sign: string;
  icon: string;
  desc: string;
  entryDate?: Date;
  exitDate?: Date;
  durationDays?: number;
}

export type EnergyLevel = 'rest' | 'high' | 'caution' | 'moderate';

export interface EnergyRating {
  level: EnergyLevel;
  label: string;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  symbol: string;
  orb: string;
}

export interface VoidOfCourse {
  isVOC: boolean;
  start?: Date;
  end?: Date;
}

export interface DayColors {
  primary: string;
  secondary: string | null;
  label: string;
}

export interface ExactLunarPhase {
  type: 'New Moon' | 'Full Moon' | 'First Quarter' | 'Last Quarter';
  time: Date;
  position: string;
  sign: string; // Moon's zodiac sign at exact moment
  emoji: string;
  name: string | null; // Traditional moon name (Wolf Moon, Snow Moon, etc.)
  isSupermoon: boolean;
  distance: number; // km
  supermoonSequence?: string;
  sunPosition?: string; // Sun's position (for Full Moon opposition display)
  sunSign?: string; // Sun's sign (for Full Moon opposition display)
}

export interface DayData {
  date: Date;
  planets: PlanetaryPositions;
  moonPhase: MoonPhase;
  mercuryRetro: boolean;
  personalTransits: PersonalTransits;
  majorIngresses: Ingress[];
  exactLunarPhase?: ExactLunarPhase | null;
  energy: EnergyRating;
  aspects: Aspect[];
  voc: VoidOfCourse;
  dayColors: DayColors;
}

// Convert ecliptic longitude to zodiac sign and degree
export const longitudeToZodiac = (longitude: number): ZodiacPosition => {
  const normalizedLon = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLon / 30);
  const degree = Math.floor(normalizedLon % 30);

  return {
    sign: ZODIAC_SIGNS[signIndex].symbol,
    signName: ZODIAC_SIGNS[signIndex].name,
    degree,
    fullDegree: `${degree}° ${ZODIAC_SIGNS[signIndex].symbol}`,
  };
};

// Get all planetary positions for a date
export const getPlanetaryPositions = (date: Date): PlanetaryPositions => {
  const getPosition = (body: Astronomy.Body): ZodiacPosition => {
    try {
      if (body === Astronomy.Body.Moon) {
        const moon = Astronomy.GeoMoon(date);
        const ecliptic = Astronomy.Ecliptic(moon);
        return longitudeToZodiac(ecliptic.elon);
      }
      const vector = Astronomy.GeoVector(body, date, false);
      const ecliptic = Astronomy.Ecliptic(vector);
      return longitudeToZodiac(ecliptic.elon);
    } catch {
      return { sign: '♈', signName: 'Aries', degree: 0, fullDegree: '0° ♈' };
    }
  };

  return {
    moon: getPosition(Astronomy.Body.Moon),
    sun: getPosition(Astronomy.Body.Sun),
    mercury: getPosition(Astronomy.Body.Mercury),
    venus: getPosition(Astronomy.Body.Venus),
    mars: getPosition(Astronomy.Body.Mars),
    jupiter: getPosition(Astronomy.Body.Jupiter),
    saturn: getPosition(Astronomy.Body.Saturn),
    uranus: getPosition(Astronomy.Body.Uranus),
    neptune: getPosition(Astronomy.Body.Neptune),
    pluto: getPosition(Astronomy.Body.Pluto),
  };
};

// Check if Mercury is retrograde
export const isMercuryRetrograde = (date: Date): boolean => {
  try {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayMercury = Astronomy.GeoVector(Astronomy.Body.Mercury, date, false);
    const yesterdayMercury = Astronomy.GeoVector(Astronomy.Body.Mercury, yesterday, false);

    const todayEcliptic = Astronomy.Ecliptic(todayMercury);
    const yesterdayEcliptic = Astronomy.Ecliptic(yesterdayMercury);

    // If longitude is decreasing, Mercury is retrograde
    return todayEcliptic.elon < yesterdayEcliptic.elon;
  } catch {
    return false;
  }
};

// Get moon phase using astronomy-engine
export const getMoonPhase = (date: Date): MoonPhase => {
  const phase = Astronomy.MoonPhase(date);
  const illumination = Astronomy.Illumination(Astronomy.Body.Moon, date);

  let phaseIcon: string;
  let phaseName: string;

  if (phase < 22.5 || phase >= 337.5) {
    phaseIcon = '🌑'; phaseName = 'New Moon';
  } else if (phase < 67.5) {
    phaseIcon = '🌒'; phaseName = 'Waxing Crescent';
  } else if (phase < 112.5) {
    phaseIcon = '🌓'; phaseName = 'First Quarter';
  } else if (phase < 157.5) {
    phaseIcon = '🌔'; phaseName = 'Waxing Gibbous';
  } else if (phase < 202.5) {
    phaseIcon = '🌕'; phaseName = 'Full Moon';
  } else if (phase < 247.5) {
    phaseIcon = '🌖'; phaseName = 'Waning Gibbous';
  } else if (phase < 292.5) {
    phaseIcon = '🌗'; phaseName = 'Last Quarter';
  } else {
    phaseIcon = '🌘'; phaseName = 'Waning Crescent';
  }

  const isBalsamic = phase >= 315 || phase < 45;

  return {
    phaseIcon,
    phaseName,
    isBalsamic,
    phase,
    illumination: illumination.phase_fraction,
  };
};

// Traditional moon names by month
const MOON_NAMES: Record<number, string> = {
  0: 'Wolf Moon',
  1: 'Snow Moon',
  2: 'Worm Moon',
  3: 'Pink Moon',
  4: 'Flower Moon',
  5: 'Strawberry Moon',
  6: 'Buck Moon',
  7: 'Sturgeon Moon',
  8: 'Harvest Moon',
  9: "Hunter's Moon",
  10: 'Beaver Moon',
  11: 'Cold Moon',
};

// Get exact lunar phase time if New Moon, Full Moon, First Quarter, or Last Quarter occurs on this day
export const getExactLunarPhase = (date: Date): ExactLunarPhase | null => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Search for New Moon (phase 0)
    const newMoon = Astronomy.SearchMoonPhase(0, startOfDay, 1);
    if (newMoon && newMoon.date >= startOfDay && newMoon.date <= endOfDay) {
      const moonPos = Astronomy.GeoMoon(newMoon.date);
      const ecliptic = Astronomy.Ecliptic(moonPos);
      const zodiac = longitudeToZodiac(ecliptic.elon);
      const distance = moonPos.Length() * 149597870.7; // Convert AU to km
      const isSupermoon = distance < 361000;
      // Keep the exact event time as returned (UTC internally).
      // We'll format it for America/New_York at render time to handle DST correctly.

      return {
        type: 'New Moon',
        time: newMoon.date,
        position: zodiac.fullDegree,
        sign: zodiac.signName,
        emoji: '🌑',
        name: MOON_NAMES[date.getMonth()],
        isSupermoon,
        distance: Math.round(distance),
      };
    }

    // Search for Full Moon (phase 180)
    const fullMoon = Astronomy.SearchMoonPhase(180, startOfDay, 1);
    if (fullMoon && fullMoon.date >= startOfDay && fullMoon.date <= endOfDay) {
      const moonPos = Astronomy.GeoMoon(fullMoon.date);
      const ecliptic = Astronomy.Ecliptic(moonPos);
      const zodiac = longitudeToZodiac(ecliptic.elon);
      const distance = moonPos.Length() * 149597870.7; // Convert AU to km
      const isSupermoon = distance < 361000;
      
      // Get Sun position at same moment to show opposition
      const sunPos = Astronomy.GeoVector(Astronomy.Body.Sun, fullMoon.date, false);
      const sunEcliptic = Astronomy.Ecliptic(sunPos);
      const sunZodiac = longitudeToZodiac(sunEcliptic.elon);
      
      // Check supermoon sequence
      let supermoonSequence = '';
      if (isSupermoon) {
        const prevFullMoon = Astronomy.SearchMoonPhase(180, new Date(startOfDay.getTime() - 31 * 24 * 60 * 60 * 1000), 1);
        const nextFullMoon = Astronomy.SearchMoonPhase(180, new Date(startOfDay.getTime() + 31 * 24 * 60 * 60 * 1000), 1);
        
        const prevDistance = prevFullMoon ? Astronomy.GeoMoon(prevFullMoon.date).Length() * 149597870.7 : 999999;
        const nextDistance = nextFullMoon ? Astronomy.GeoMoon(nextFullMoon.date).Length() * 149597870.7 : 999999;
        
        const prevIsSuper = prevDistance < 361000;
        const nextIsSuper = nextDistance < 361000;
        
        if (prevIsSuper && !nextIsSuper) {
          supermoonSequence = 'Last of consecutive supermoons';
        } else if (!prevIsSuper && nextIsSuper) {
          supermoonSequence = 'First of consecutive supermoons';
        } else if (prevIsSuper && nextIsSuper) {
          supermoonSequence = 'Part of supermoon sequence';
        }
      }
      // Keep the exact event time as returned (UTC internally).
      // We'll format it for America/New_York at render time to handle DST correctly.

      return {
        type: 'Full Moon',
        time: fullMoon.date,
        position: zodiac.fullDegree,
        sign: zodiac.signName,
        sunPosition: sunZodiac.fullDegree,
        sunSign: sunZodiac.signName,
        emoji: '🌕',
        name: MOON_NAMES[date.getMonth()],
        isSupermoon,
        distance: Math.round(distance),
        supermoonSequence,
      };
    }

    // Search for First Quarter (phase 90)
    const firstQuarter = Astronomy.SearchMoonPhase(90, startOfDay, 1);
    if (firstQuarter && firstQuarter.date >= startOfDay && firstQuarter.date <= endOfDay) {
      const moonPos = Astronomy.GeoMoon(firstQuarter.date);
      const ecliptic = Astronomy.Ecliptic(moonPos);
      const zodiac = longitudeToZodiac(ecliptic.elon);
      const distance = moonPos.Length() * 149597870.7;
      
      return {
        type: 'First Quarter',
        time: firstQuarter.date,
        position: zodiac.fullDegree,
        sign: zodiac.signName,
        emoji: '🌓',
        name: null,
        isSupermoon: false,
        distance: Math.round(distance),
      };
    }

    // Search for Last Quarter (phase 270)
    const lastQuarter = Astronomy.SearchMoonPhase(270, startOfDay, 1);
    if (lastQuarter && lastQuarter.date >= startOfDay && lastQuarter.date <= endOfDay) {
      const moonPos = Astronomy.GeoMoon(lastQuarter.date);
      const ecliptic = Astronomy.Ecliptic(moonPos);
      const zodiac = longitudeToZodiac(ecliptic.elon);
      const distance = moonPos.Length() * 149597870.7;
      
      return {
        type: 'Last Quarter',
        time: lastQuarter.date,
        position: zodiac.fullDegree,
        sign: zodiac.signName,
        emoji: '🌗',
        name: null,
        isSupermoon: false,
        distance: Math.round(distance),
      };
    }

  } catch (error) {
    console.error('Error finding exact lunar phase:', error);
  }
  
  return null;
}

// Calculate aspects between two positions
const calculateAspect = (lon1: number, lon2: number) => {
  const diff = Math.abs(((lon2 - lon1 + 180) % 360) - 180);

  if (diff < 8) return { type: 'conjunction', symbol: '☌', orb: diff };
  if (Math.abs(diff - 60) < 6) return { type: 'sextile', symbol: '⚹', orb: Math.abs(diff - 60) };
  if (Math.abs(diff - 90) < 8) return { type: 'square', symbol: '□', orb: Math.abs(diff - 90) };
  if (Math.abs(diff - 120) < 8) return { type: 'trine', symbol: '△', orb: Math.abs(diff - 120) };
  if (Math.abs(diff - 180) < 8) return { type: 'opposition', symbol: '☍', orb: Math.abs(diff - 180) };

  return null;
};

const getSignIndex = (signName: string): number => {
  return ZODIAC_SIGNS.findIndex(s => s.name === signName);
};

const getMoonAspectDescription = (type: string): string => {
  const descriptions: Record<string, string> = {
    conjunction: 'Deep emotional connection to your core self',
    sextile: 'Harmonious flow of emotions',
    square: 'Tension between feelings and balance',
    trine: 'Easy emotional expression',
    opposition: 'Emotional awareness through relationships',
  };
  return descriptions[type] || '';
};

const getVenusAspectDescription = (type: string): string => {
  const descriptions: Record<string, string> = {
    conjunction: 'Love and beauty amplified',
    sextile: 'Harmonious connections',
    square: 'Relationship tensions to resolve',
    trine: 'Grace and ease in relationships',
    opposition: 'Balancing self and others in love',
  };
  return descriptions[type] || '';
};

// Get personal transits to natal chart
export const getPersonalTransits = (planets: PlanetaryPositions, userData: UserData | null): PersonalTransits => {
  if (!userData?.birthDate) return { hasTransits: false, transits: [] };

  const transits: Transit[] = [];

  // Simplified: Assuming Libra at 28° (user's Sun degree)
  const natalLibraDegree = 28 + 180; // 208° (28° Libra in ecliptic longitude)

  // Check Moon transits
  const moonLon = planets.moon.degree + getSignIndex(planets.moon.signName) * 30;
  const moonAspect = calculateAspect(natalLibraDegree, moonLon);

  if (moonAspect) {
    transits.push({
      type: `Moon ${moonAspect.type} natal Libra`,
      desc: getMoonAspectDescription(moonAspect.type),
      icon: '☽',
      orb: moonAspect.orb.toFixed(1),
    });
  }

  // Check Venus transits
  const venusLon = planets.venus.degree + getSignIndex(planets.venus.signName) * 30;
  const venusAspect = calculateAspect(natalLibraDegree, venusLon);

  if (venusAspect) {
    transits.push({
      type: `Venus ${venusAspect.type} natal Libra`,
      desc: getVenusAspectDescription(venusAspect.type),
      icon: '♀',
      orb: venusAspect.orb.toFixed(1),
    });
  }

  return { hasTransits: transits.length > 0, transits };
};

// Check for major ingresses
export const checkMajorIngresses = (planets: PlanetaryPositions): Ingress[] => {
  const ingresses: Ingress[] = [];

  if (planets.saturn.signName === 'Aries') {
    ingresses.push({
      planet: 'Saturn',
      sign: 'Aries',
      icon: '♄',
      desc: 'Major 2.5 year cycle begins',
    });
  }

  if (planets.neptune.signName === 'Aries') {
    ingresses.push({
      planet: 'Neptune',
      sign: 'Aries',
      icon: '♆',
      desc: 'Generational shift for 14 years',
    });
  }

  return ingresses;
};

// Get energy rating
export const getEnergyRating = (moonPhase: MoonPhase, mercuryRetro: boolean): EnergyRating => {
  if (moonPhase.isBalsamic) {
    return { level: 'rest', label: 'Rest/Balsamic' };
  }
  if (mercuryRetro) {
    return { level: 'caution', label: 'Mercury Rx' };
  }
  if (moonPhase.phaseName.includes('Waxing') && !mercuryRetro) {
    return { level: 'high', label: 'Productive' };
  }
  return { level: 'moderate', label: 'Moderate' };
};

// Daily motion for planets (average degrees per day)
const DAILY_MOTION: Record<string, number> = {
  moon: 13.2,
  mercury: 1.0,
  venus: 1.0,
  sun: 1.0,
  mars: 0.5,
  jupiter: 0.08,
  saturn: 0.03,
  uranus: 0.01,
  neptune: 0.006,
  pluto: 0.004,
};

// Determine if aspect is applying (building toward exact) or separating (moving away from exact)
export const determineApplying = (
  planet1: string,
  planet2: string,
  planet1Data: ZodiacPosition,
  planet2Data: ZodiacPosition,
  aspectType: string
): boolean => {
  const speed1 = DAILY_MOTION[planet1] || 0;
  const speed2 = DAILY_MOTION[planet2] || 0;

  // Get the faster and slower planet
  const fasterData = speed1 > speed2 ? planet1Data : planet2Data;
  const slowerData = speed1 > speed2 ? planet2Data : planet1Data;

  // Get longitudes
  const fasterLon = getSignIndex(fasterData.signName) * 30 + fasterData.degree;
  const slowerLon = getSignIndex(slowerData.signName) * 30 + slowerData.degree;

  // Calculate angular separation
  let separation = fasterLon - slowerLon;
  if (separation > 180) separation -= 360;
  if (separation < -180) separation += 360;

  // Get target angle for aspect type
  const aspectAngles: Record<string, number> = {
    conjunction: 0,
    sextile: 60,
    square: 90,
    trine: 120,
    opposition: 180,
  };

  const targetAngle = aspectAngles[aspectType] || 0;

  // Simplified: if faster planet hasn't reached target angle yet, it's applying
  return Math.abs(separation) < targetAngle;
};

// Ingress interpretations for Mercury, Venus, and Mars entering each sign
const INGRESS_INTERPRETATIONS: Record<string, Record<string, string>> = {
  mercury: {
    Capricorn: "Thinking becomes practical and goal-oriented. Communication takes on a serious, professional tone. Excellent for strategic planning, career discussions, and long-term goal setting. Mental discipline peaks.",
    Aquarius: "Mercury exalted - innovative thinking and original ideas flourish. Communication becomes unconventional and forward-thinking. Perfect for technology, group discussions, and humanitarian causes.",
    Pisces: "Mercury in detriment - thoughts become dreamy, intuitive, and artistic. Communication may be less precise but more imaginative. Great for poetry, music, and spiritual reflection. Pay extra attention to details.",
    Aries: "Quick, decisive thinking returns. Communication becomes direct and competitive. Great for debates, negotiations, and pioneering ideas. Watch for impulsive words.",
    Taurus: "Thoughts slow down and become more practical. Communication focuses on values and material matters. Excellent for financial planning and sensory experiences. Stubborn opinions may surface.",
    Gemini: "Mercury returns home - mental agility and curiosity peak. Communication flows easily with wit and versatility. Perfect for learning, networking, and multitasking. Watch for scattered focus.",
    Cancer: "Thoughts turn emotional and intuitive. Communication becomes nurturing but may be indirect. Excellent for family discussions, therapy, and expressing feelings. Memory sharpens, especially for emotional experiences.",
    Leo: "Mental expression becomes confident, dramatic, and creative. Communication demands attention and respect. Perfect for presentations, performances, and leadership announcements. Pride may affect objectivity.",
    Virgo: "Mercury returns home - analytical skills peak. Thinking becomes precise, critical, and service-oriented. Perfect for editing, health planning, and detailed work. Communication focuses on improvement and efficiency.",
    Libra: "Thoughts seek balance and harmony. Communication becomes diplomatic, fair, and relationship-focused. Excellent for negotiations, mediation, and partnership discussions. Decision-making may slow down weighing options.",
    Scorpio: "Mental energy intensifies - thoughts probe beneath surfaces. Communication becomes penetrating, strategic, and transformative. Perfect for research, psychology, and deep conversations. Secrets may be revealed or kept.",
    Sagittarius: "Thinking expands with optimism and philosophical bent. Communication becomes enthusiastic, honest, and truth-seeking. Perfect for teaching, travel planning, and big-picture discussions. May overcommit or exaggerate.",
  },
  venus: {
    Capricorn: "Love becomes serious, committed, and long-term focused. Affection expressed through acts of service and responsibility. Attraction to maturity, success, and stability. Good for defining relationships and business partnerships.",
    Aquarius: "Love energy shifts to friendship and intellectual connection. Attraction to uniqueness and independence. Relationships need freedom and mental stimulation. Great for unconventional partnerships and group social activities.",
    Pisces: "Venus exalted - love becomes deeply romantic, compassionate, and spiritual. Boundaries dissolve in relationships. Heightened artistic sensitivity and desire for soulmate connection. Watch for idealization or martyrdom.",
    Aries: "Passion ignites - love becomes bold, direct, and spontaneous. Attraction to confidence and initiative. Pursuit energy increases. Great for new relationships but may rush commitment. Independence remains important.",
    Taurus: "Venus returns home - sensuality and stability peak. Love expressed through physical affection, gifts, and building security. Slow but enduring attraction. Perfect for deepening commitments and enjoying pleasures.",
    Gemini: "Love becomes playful, communicative, and intellectually stimulating. Attraction to wit and variety. Social calendar fills up. Multiple interests or flirtations possible. Connection through conversation.",
    Cancer: "Affection becomes nurturing, protective, and family-oriented. Emotional security in relationships prioritized. Home becomes romantic sanctuary. Intuitive understanding of partner's needs. May become clingy.",
    Leo: "Love becomes grand, generous, and attention-seeking. Romance takes center stage with dramatic gestures. Loyalty and admiration important. Creative dates and public displays of affection increase. Pride in relationships.",
    Virgo: "Love expressed through helpful acts and thoughtful details. Attraction to health-consciousness and reliability. Perfectionist standards may increase. Analysis of relationships begins. Service becomes love language.",
    Libra: "Venus returns home - charm, grace, and partnership focus peak. Balance and harmony in relationships essential. Diplomacy in love. Perfect for commitments, weddings, and resolving conflicts. Indecision possible.",
    Scorpio: "Love intensifies with passion, depth, and transformation. Emotional and physical intimacy deepen. Jealousy or possessiveness may surface. Powerful magnetic attraction. Secrets and vulnerability in relationships.",
    Sagittarius: "Love becomes adventurous, optimistic, and freedom-loving. Attraction to honesty and shared philosophies. Relationships expand horizons. Great for travel with partners and exploring new experiences together.",
  },
  mars: {
    Capricorn: "Mars exalted - drive becomes strategic, disciplined, and achievement-oriented. Energy channeled into long-term goals and career advancement. Excellent for sustained effort and climbing ambitions. Authority and control increase.",
    Aquarius: "Action energy shifts to innovation and group causes. Drive directed toward progress and reform. Fighting for ideals and humanitarian goals. Energy works best in collaborative, unconventional approaches.",
    Pisces: "Energy becomes diffused and spiritually directed. Action motivated by compassion and artistic vision. Passive-aggressive tendencies increase. Excellent for creative pursuits and healing work. Boundaries around energy important.",
    Aries: "Mars returns home - physical energy and courage peak. Initiative, independence, and competitive drive surge. Perfect for starting new projects and athletic pursuits. Impulsiveness and anger flash quickly.",
    Taurus: "Action becomes steady, persistent, and focused on material security. Energy applied to building lasting value. Stubbornness increases. Excellent for physical work and sensual pleasures. Slow to anger but powerful when provoked.",
    Gemini: "Mental energy and restlessness increase. Drive directed toward communication, learning, and variety. Multi-tasking peaks. Scattered efforts possible. Great for debates, negotiations, and quick decisive action.",
    Cancer: "Action motivated by emotional security and family protection. Energy channeled into home and nurturing. Passive-aggressive tendencies increase. Excellent for domestic projects and defending loved ones.",
    Leo: "Energy becomes dramatic, confident, and creative. Drive for recognition and self-expression intensifies. Leadership abilities surge. Excellent for performance and courageous acts. Pride fuels action.",
    Virgo: "Energy directed toward service, health, and detailed work. Drive for perfection and improvement increases. Excellent for analytical work and health routines. Critical tendencies may spike.",
    Libra: "Mars in detriment - energy seeks partnership and harmony. Action becomes diplomatic but indecisive. Drive channeled into relationships and justice. Passive-aggressive tendencies increase. Good for collaborative action.",
    Scorpio: "Mars traditional ruler - intensity and strategic power peak. Energy becomes magnetic, transformative, and relentless. Excellent for research, crisis management, and deep transformative work. Control and privacy important.",
    Sagittarius: "Energy expands with enthusiasm and idealism. Action directed toward truth, adventure, and meaning. Drive for freedom and expansion. Excellent for travel, education, and philosophical pursuits. Over-extension possible.",
  },
};

// Get interpretation for a planet entering a sign
export const getIngressInterpretation = (planet: string, sign: string): string => {
  const planetLower = planet.toLowerCase();
  const interpretation = INGRESS_INTERPRETATIONS[planetLower]?.[sign];
  
  if (interpretation) {
    return interpretation;
  }
  
  // Default for planets not in the table (outer planets, etc.)
  return `${planet} enters ${sign} - a shift in how this planet's energy expresses itself.`;
};

// Calculate daily aspects between planets
export const calculateDailyAspects = (planets: PlanetaryPositions): Aspect[] => {
  const aspects: Aspect[] = [];
  const aspectTypes = [
    { angle: 0, name: 'conjunction', symbol: '☌', orb: 8 },
    { angle: 60, name: 'sextile', symbol: '⚹', orb: 6 },
    { angle: 90, name: 'square', symbol: '□', orb: 8 },
    { angle: 120, name: 'trine', symbol: '△', orb: 8 },
    { angle: 180, name: 'opposition', symbol: '☍', orb: 8 },
  ];

  const planetList: (keyof PlanetaryPositions)[] = ['moon', 'sun', 'mercury', 'venus', 'mars'];

  const getLongitude = (position: ZodiacPosition) => {
    const signIndex = getSignIndex(position.signName);
    return signIndex * 30 + position.degree;
  };

  for (let i = 0; i < planetList.length; i++) {
    for (let j = i + 1; j < planetList.length; j++) {
      const p1 = planetList[i];
      const p2 = planetList[j];
      const lon1 = getLongitude(planets[p1]);
      const lon2 = getLongitude(planets[p2]);

      const diff = Math.abs(((lon2 - lon1 + 180) % 360) - 180);

      for (const aspectType of aspectTypes) {
        const orb = Math.abs(diff - aspectType.angle);
        if (orb < aspectType.orb) {
          aspects.push({
            planet1: p1,
            planet2: p2,
            type: aspectType.name,
            symbol: aspectType.symbol,
            orb: orb.toFixed(1),
          });
        }
      }
    }
  }

  return aspects;
};

// Get void of course moon (simplified)
export const getVoidOfCourseMoon = (moonPhase: MoonPhase): VoidOfCourse => {
  // Simplified VOC calculation
  const isVOC = moonPhase.phase >= 25 && moonPhase.phase < 35;

  if (isVOC) {
    const now = new Date();
    const vocStart = new Date(now);
    vocStart.setHours(Math.floor(moonPhase.phase % 24), 0, 0);
    const vocEnd = new Date(now);
    vocEnd.setHours(Math.floor(moonPhase.phase % 24) + 2, 0, 0);

    return { isVOC: true, start: vocStart, end: vocEnd };
  }

  return { isVOC: false };
};

// Planet colors for day coloring with meanings
export interface PlanetColorInfo {
  color: string;
  name: string;
  meaning: string;
}

export const PLANET_COLORS: Record<string, PlanetColorInfo> = {
  mars: { color: '#C74E4E', name: 'Mars', meaning: 'Action, energy, drive, courage, assertiveness' },
  venus: { color: '#E8D5CC', name: 'Venus', meaning: 'Love, beauty, values, relationships, harmony' },
  sun: { color: '#F4D03F', name: 'Sun', meaning: 'Core self, vitality, life force, confidence' },
  moon: { color: '#7FA3C7', name: 'Moon', meaning: 'Emotions, intuition, rhythms, nurturing' },
  mercury: { color: '#E8A558', name: 'Mercury', meaning: 'Communication, thinking, learning, connections' },
  jupiter: { color: '#9B7EBD', name: 'Jupiter', meaning: 'Growth, expansion, wisdom, luck, optimism' },
  saturn: { color: '#8B7355', name: 'Saturn', meaning: 'Structure, discipline, responsibility, limits' },
  uranus: { color: '#5DADE2', name: 'Uranus', meaning: 'Change, innovation, revolution, freedom' },
  neptune: { color: '#A9CCE3', name: 'Neptune', meaning: 'Dreams, intuition, spirituality, imagination' },
  pluto: { color: '#5D6D7E', name: 'Pluto', meaning: 'Transformation, power, rebirth, depth' },
};

// Get day colors based on planetary activity
export const getDayColors = (aspects: Aspect[], moonPhase: MoonPhase): DayColors => {
  const activePlanets = new Set<string>();

  aspects.forEach((asp) => {
    activePlanets.add(asp.planet1);
    activePlanets.add(asp.planet2);
  });

  if (moonPhase.isBalsamic) {
    return { primary: '#D4C5E8', secondary: null, label: 'Balsamic Rest' };
  }

  const colors = Array.from(activePlanets)
    .map((p) => PLANET_COLORS[p]?.color)
    .filter(Boolean);

  if (colors.length === 0) {
    return { primary: PLANET_COLORS.moon.color, secondary: null, label: 'Moon Focus' };
  } else if (colors.length === 1) {
    return { primary: colors[0], secondary: null, label: 'Single Planet' };
  } else {
    return { primary: colors[0], secondary: colors[1], label: 'Multiple Aspects' };
  }
};

// Color explanation for day detail
export interface ColorExplanation {
  primary: {
    color: string;
    planet: string;
    meaning: string;
    reason: string;
    position?: string;
    aspects?: Aspect[];
  };
  secondary: {
    color: string;
    planet: string;
    meaning: string;
    reason: string;
    position?: string;
    aspects?: Aspect[];
  } | null;
}

export const getColorExplanation = (aspects: Aspect[], moonPhase: MoonPhase): ColorExplanation => {
  if (moonPhase.isBalsamic) {
    return {
      primary: {
        color: '#D4C5E8',
        planet: 'Balsamic Moon',
        meaning: 'Sacred rest phase before renewal',
        reason: 'Moon is in balsamic phase (315°-337.5°). This is a time for deep rest, meditation, and spiritual retreat before the next lunar cycle.',
      },
      secondary: null,
    };
  }

  const activePlanets = new Set<string>();
  const aspectsByPlanet: Record<string, Aspect[]> = {};

  aspects.forEach((asp) => {
    activePlanets.add(asp.planet1);
    activePlanets.add(asp.planet2);

    if (!aspectsByPlanet[asp.planet1]) aspectsByPlanet[asp.planet1] = [];
    if (!aspectsByPlanet[asp.planet2]) aspectsByPlanet[asp.planet2] = [];

    aspectsByPlanet[asp.planet1].push(asp);
    aspectsByPlanet[asp.planet2].push(asp);
  });

  const planetList = Array.from(activePlanets);

  if (planetList.length === 0) {
    return {
      primary: {
        color: PLANET_COLORS.moon.color,
        planet: PLANET_COLORS.moon.name,
        meaning: PLANET_COLORS.moon.meaning,
        reason: 'No major aspects today. Moon provides baseline emotional energy.',
      },
      secondary: null,
    };
  }

  if (planetList.length === 1) {
    const planet = planetList[0];
    const planetInfo = PLANET_COLORS[planet];
    return {
      primary: {
        color: planetInfo.color,
        planet: planetInfo.name,
        meaning: planetInfo.meaning,
        reason: `${planetInfo.name} is the most active planet today with ${aspectsByPlanet[planet]?.length || 0} aspect(s).`,
        aspects: aspectsByPlanet[planet],
      },
      secondary: null,
    };
  }

  // Two or more planets - split by time
  const planet1 = planetList[0];
  const planet2 = planetList[1];
  const info1 = PLANET_COLORS[planet1];
  const info2 = PLANET_COLORS[planet2];

  const aspects1 = aspectsByPlanet[planet1] || [];
  const aspects2 = aspectsByPlanet[planet2] || [];

  return {
    primary: {
      color: info1.color,
      planet: info1.name,
      meaning: info1.meaning,
      reason: `${info1.name} aspects are active with ${aspects1.length} aspect(s).`,
      position: 'Top (Morning/Afternoon)',
      aspects: aspects1,
    },
    secondary: {
      color: info2.color,
      planet: info2.name,
      meaning: info2.meaning,
      reason: `${info2.name} aspects are active with ${aspects2.length} aspect(s).`,
      position: 'Bottom (Afternoon/Evening)',
      aspects: aspects2,
    },
  };
};

// Get planet symbol
export const getPlanetSymbol = (planetName: string): string => {
  const symbols: Record<string, string> = {
    moon: '☽',
    sun: '☉',
    mercury: '☿',
    venus: '♀',
    mars: '♂',
    jupiter: '♃',
    saturn: '♄',
    uranus: '♅',
    neptune: '♆',
    pluto: '♇',
  };
  return symbols[planetName] || planetName;
};

// Detect planetary ingresses (sign changes)
export const detectPlanetaryIngresses = (date: Date, planets: PlanetaryPositions): Ingress[] => {
  const ingresses: Ingress[] = [];

  try {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayPlanets = getPlanetaryPositions(yesterday);

    const planetsToCheck: (keyof PlanetaryPositions)[] = ['mercury', 'venus', 'mars', 'jupiter', 'saturn'];

    planetsToCheck.forEach((planetName) => {
      const todaySign = planets[planetName].signName;
      const yesterdaySign = yesterdayPlanets[planetName].signName;

      if (todaySign !== yesterdaySign) {
        const isMajor = planetName === 'jupiter' || planetName === 'saturn';
        
        // Find when planet exits this sign (enters next sign)
        let exitDate: Date | undefined;
        let durationDays = 0;
        
        // Search forward up to 365 days for sign change
        for (let d = 1; d <= 365; d++) {
          const futureDate = new Date(date);
          futureDate.setDate(futureDate.getDate() + d);
          const futurePos = getPlanetaryPositions(futureDate);
          
          if (futurePos[planetName].signName !== todaySign) {
            exitDate = futureDate;
            durationDays = d;
            break;
          }
        }
        
        // Format the description with exact dates and duration
        const entryDateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const exitDateStr = exitDate 
          ? exitDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : 'unknown';
        
        let durationStr = '';
        if (durationDays > 0) {
          if (durationDays >= 30) {
            const months = (durationDays / 30).toFixed(1);
            durationStr = `${months} months`;
          } else if (durationDays >= 7) {
            const weeks = (durationDays / 7).toFixed(1);
            durationStr = `${weeks} weeks`;
          } else {
            durationStr = `${durationDays} days`;
          }
        }
        
        const desc = exitDate 
          ? `${entryDateStr} – ${exitDateStr} (${durationStr})`
          : isMajor ? 'Major shift - effects last months' : 'Personal planet shift';
        
        ingresses.push({
          planet: planetName.charAt(0).toUpperCase() + planetName.slice(1),
          sign: todaySign,
          icon: getPlanetSymbol(planetName),
          desc,
          entryDate: date,
          exitDate,
          durationDays,
        });
      }
    });
  } catch (error) {
    console.error('Error detecting ingresses:', error);
  }

  return ingresses;
};

// Export to iCal format
export const generateICalExport = (year: number, month: number, daysInMonth: number): string => {
  let ical = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Astro Calendar//EN\n';

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const planets = getPlanetaryPositions(date);
    const moonPhase = getMoonPhase(date);

    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');

    ical += `BEGIN:VEVENT\n`;
    ical += `DTSTART:${dateStr}\n`;
    ical += `SUMMARY:☽ ${planets.moon.signName} ${planets.moon.degree}° - ${moonPhase.phaseName}\n`;
    ical += `DESCRIPTION:Moon: ${planets.moon.fullDegree}\\nPhase: ${moonPhase.phaseName}\\nIllumination: ${(moonPhase.illumination * 100).toFixed(0)}%\n`;
    ical += `END:VEVENT\n`;
  }

  ical += 'END:VCALENDAR';
  return ical;
};

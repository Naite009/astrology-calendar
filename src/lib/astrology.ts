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

export interface ExtendedZodiacPosition extends ZodiacPosition {
  longitude: number;
  planetSymbol?: string;
  name?: string;
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
  northNode?: ExtendedZodiacPosition;
  southNode?: ExtendedZodiacPosition;
  chiron?: ExtendedZodiacPosition;
  lilith?: ExtendedZodiacPosition;
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
  entryTime?: string;
  exitDate?: Date;
  exitTime?: string;
  nextSign?: string;
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

// Calculate North and South Node positions (Mean Node)
export const getNodePositions = (date: Date): { north: ExtendedZodiacPosition; south: ExtendedZodiacPosition } => {
  const d = (date.getTime() - new Date('2000-01-01T12:00:00Z').getTime()) / (1000 * 60 * 60 * 24);
  const meanNode = 125.04452 - 0.0529921 * d; // degrees
  
  const normalizedNode = ((meanNode % 360) + 360) % 360;
  const northNode = longitudeToZodiac(normalizedNode);
  
  const southNodeLon = (normalizedNode + 180) % 360;
  const southNode = longitudeToZodiac(southNodeLon);
  
  return {
    north: { ...northNode, longitude: normalizedNode, planetSymbol: '☊', name: 'North Node' },
    south: { ...southNode, longitude: southNodeLon, planetSymbol: '☋', name: 'South Node' }
  };
};

// Calculate Chiron position (approximation - for accurate positions would need Swiss Ephemeris)
export const getChironPosition = (date: Date): ExtendedZodiacPosition => {
  // Chiron has ~50.7 year orbital period
  // J2000 epoch: Chiron at approximately 72° (12° Gemini)
  const d = (date.getTime() - new Date('2000-01-01T12:00:00Z').getTime()) / (1000 * 60 * 60 * 24);
  const meanMotion = 360 / (50.7 * 365.25); // degrees per day
  const longitude = (72 + d * meanMotion) % 360;
  const normalizedLon = ((longitude % 360) + 360) % 360;
  
  return {
    ...longitudeToZodiac(normalizedLon),
    longitude: normalizedLon,
    planetSymbol: '⚷',
    name: 'Chiron'
  };
};

// Calculate Black Moon Lilith position (Mean Lilith approximation)
export const getBlackMoonLilith = (date: Date): ExtendedZodiacPosition => {
  // Lilith has ~8.85 year cycle
  // J2000 epoch: Mean Lilith at approximately 121° (1° Leo)
  const d = (date.getTime() - new Date('2000-01-01T12:00:00Z').getTime()) / (1000 * 60 * 60 * 24);
  const meanMotion = 360 / (8.85 * 365.25); // degrees per day
  const longitude = (121 + d * meanMotion) % 360;
  const normalizedLon = ((longitude % 360) + 360) % 360;
  
  return {
    ...longitudeToZodiac(normalizedLon),
    longitude: normalizedLon,
    planetSymbol: '⚸',
    name: 'Black Moon Lilith'
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

  const nodes = getNodePositions(date);
  const chiron = getChironPosition(date);
  const lilith = getBlackMoonLilith(date);

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
    northNode: nodes.north,
    southNode: nodes.south,
    chiron,
    lilith,
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

// Get exact lunar phase time if New Moon, Full Moon, First Quarter, or Last Quarter occurs on this calendar day (Eastern Time).
// We search for the nearest event around the day, but ONLY return it if the event's ET date matches
// the day being rendered. IMPORTANT: We treat the incoming `date` as a calendar-day identifier
// (year/month/day), not as an instant in the user's local timezone.
export const getExactLunarPhase = (date: Date): ExactLunarPhase | null => {
  try {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Calendar day key (YYYY-MM-DD) for the day the user clicked in the calendar UI.
    const etDayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Start searching a bit before the day to ensure we catch events that occur early ET.
    // Use a stable midday UTC anchor derived from the calendar day to avoid user-timezone skew.
    const searchStart = new Date(Date.UTC(year, month, day - 2, 12, 0, 0));

    const getETKey = (d: Date) =>
      new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(d);

    const buildPhase = (
      type: ExactLunarPhase['type'],
      eventDate: Date,
      emoji: string,
    ): ExactLunarPhase => {
      const moonPos = Astronomy.GeoMoon(eventDate);
      const ecliptic = Astronomy.Ecliptic(moonPos);
      const zodiac = longitudeToZodiac(ecliptic.elon);
      const distance = moonPos.Length() * 149597870.7; // AU -> km

      const base: ExactLunarPhase = {
        type,
        time: eventDate,
        position: zodiac.fullDegree,
        sign: zodiac.signName,
        emoji,
        name: type === 'New Moon' || type === 'Full Moon' ? MOON_NAMES[date.getMonth()] : null,
        isSupermoon: false,
        distance: Math.round(distance),
      };

      if (type === 'Full Moon') {
        const sunPos = Astronomy.GeoVector(Astronomy.Body.Sun, eventDate, false);
        const sunEcliptic = Astronomy.Ecliptic(sunPos);
        const sunZodiac = longitudeToZodiac(sunEcliptic.elon);
        base.sunPosition = sunZodiac.fullDegree;
        base.sunSign = sunZodiac.signName;

        base.isSupermoon = distance < 361000;
        if (base.isSupermoon) {
          const prevFullMoon = Astronomy.SearchMoonPhase(180, new Date(eventDate.getTime() - 31 * 24 * 60 * 60 * 1000), 80);
          const nextFullMoon = Astronomy.SearchMoonPhase(180, new Date(eventDate.getTime() + 1 * 24 * 60 * 60 * 1000), 80);

          const prevDistance = prevFullMoon ? Astronomy.GeoMoon(prevFullMoon.date).Length() * 149597870.7 : 999999;
          const nextDistance = nextFullMoon ? Astronomy.GeoMoon(nextFullMoon.date).Length() * 149597870.7 : 999999;

          const prevIsSuper = prevDistance < 361000;
          const nextIsSuper = nextDistance < 361000;

          base.supermoonSequence = prevIsSuper && nextIsSuper
            ? 'Part of supermoon sequence'
            : (!prevIsSuper && nextIsSuper)
              ? 'First of consecutive supermoons'
              : (prevIsSuper && !nextIsSuper)
                ? 'Last of consecutive supermoons'
                : '';
        }
      }

      if (type === 'New Moon') {
        base.isSupermoon = distance < 361000;
      }

      return base;
    };

    const candidates: Array<{ type: ExactLunarPhase['type']; angle: number; emoji: string }> = [
      { type: 'New Moon', angle: 0, emoji: '🌑' },
      { type: 'Full Moon', angle: 180, emoji: '🌕' },
      { type: 'First Quarter', angle: 90, emoji: '🌓' },
      { type: 'Last Quarter', angle: 270, emoji: '🌗' },
    ];

    for (const c of candidates) {
      const evt = Astronomy.SearchMoonPhase(c.angle, searchStart, 120);
      if (!evt) continue;
      if (getETKey(evt.date) !== etDayKey) continue;
      return buildPhase(c.type, evt.date, c.emoji);
    }
  } catch (error) {
    console.error('Error finding exact lunar phase:', error);
  }

  return null;
};

// Calculate aspects between two longitudes (degrees)
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

// Detect planetary ingresses (sign changes) with exact times
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
        
        // Find exact entry time using binary search
        let entryTime: Date | undefined;
        let searchStart = new Date(yesterday);
        searchStart.setHours(0, 0, 0, 0);
        let searchEnd = new Date(date);
        searchEnd.setHours(23, 59, 59, 999);
        
        // Binary search for exact ingress time (1-minute precision)
        while (searchEnd.getTime() - searchStart.getTime() > 60000) {
          const mid = new Date((searchStart.getTime() + searchEnd.getTime()) / 2);
          const midPos = getPlanetaryPositions(mid);
          
          if (midPos[planetName].signName === todaySign) {
            searchEnd = mid;
          } else {
            searchStart = mid;
          }
        }
        entryTime = searchEnd;
        
        // Find when planet exits this sign (enters next sign)
        let exitDate: Date | undefined;
        let exitTime: Date | undefined;
        let nextSign: string | undefined;
        let durationDays = 0;
        
        // Search forward up to 365 days for sign change
        for (let d = 1; d <= 365; d++) {
          const futureDate = new Date(date);
          futureDate.setDate(futureDate.getDate() + d);
          const futurePos = getPlanetaryPositions(futureDate);
          
          if (futurePos[planetName].signName !== todaySign) {
            exitDate = futureDate;
            nextSign = futurePos[planetName].signName;
            durationDays = d;
            
            // Binary search for exact exit time
            let exitSearchStart = new Date(futureDate);
            exitSearchStart.setDate(exitSearchStart.getDate() - 1);
            exitSearchStart.setHours(0, 0, 0, 0);
            let exitSearchEnd = new Date(futureDate);
            exitSearchEnd.setHours(23, 59, 59, 999);
            
            while (exitSearchEnd.getTime() - exitSearchStart.getTime() > 60000) {
              const mid = new Date((exitSearchStart.getTime() + exitSearchEnd.getTime()) / 2);
              const midPos = getPlanetaryPositions(mid);
              
              if (midPos[planetName].signName === todaySign) {
                exitSearchStart = mid;
              } else {
                exitSearchEnd = mid;
              }
            }
            exitTime = exitSearchEnd;
            break;
          }
        }
        
        // Format times in Eastern timezone
        const entryTimeStr = entryTime?.toLocaleString('en-US', {
          timeZone: 'America/New_York',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }) + ' ET';
        
        const exitTimeStr = exitTime?.toLocaleString('en-US', {
          timeZone: 'America/New_York',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }) + ' ET';
        
        const desc = `Enters ${todaySign}: ${entryTimeStr}`;
        
        ingresses.push({
          planet: planetName.charAt(0).toUpperCase() + planetName.slice(1),
          sign: todaySign,
          icon: getPlanetSymbol(planetName),
          desc,
          entryDate: entryTime,
          entryTime: entryTimeStr,
          exitDate: exitTime,
          exitTime: exitTimeStr,
          nextSign,
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

// =========================================
// DIVINE FEMININE ASTROLOGY - PHASE 1
// =========================================

// Fixed Stars Database with their ecliptic positions
export const FIXED_STARS: Record<string, { name: string; longitude: number; orb: number; magnitude: number; meaning: string }> = {
  sirius: {
    name: 'Sirius',
    longitude: 104.0, // 14° Cancer
    orb: 2.0,
    magnitude: -1.46,
    meaning: "The Dog Star. Spiritual wisdom, success, fame. Ancient Egyptian sacred star. Divine downloads, kundalini awakening, connection to higher consciousness."
  },
  regulus: {
    name: 'Regulus',
    longitude: 149.0, // 29° Leo
    orb: 2.0,
    magnitude: 1.35,
    meaning: "Heart of the Lion. Royal power, leadership, fame, success. 'Success if revenge is avoided.' Military honors, nobility. Guardian of the North."
  },
  algol: {
    name: 'Algol',
    longitude: 56.0, // 26° Taurus
    orb: 2.0,
    magnitude: 2.1,
    meaning: "Medusa's Head. Transformation through facing shadow. Feminine rage transmuted to power. Passion, intensity, the demon lover."
  },
  spica: {
    name: 'Spica',
    longitude: 203.8, // 23° Libra
    orb: 2.0,
    magnitude: 0.97,
    meaning: "The Wheat Sheaf. Gifts, talents, protection. Venus-Jupiter nature. Artistic success, harvest of efforts. The priestess star."
  },
  antares: {
    name: 'Antares',
    longitude: 249.0, // 9° Sagittarius
    orb: 2.0,
    magnitude: 1.09,
    meaning: "Rival of Mars. Warrior spirit, obsession, intensity. Success through persistence. Heart of the Scorpion. Guardian of the West."
  },
  aldebaran: {
    name: 'Aldebaran',
    longitude: 69.5, // 9° Gemini
    orb: 2.0,
    magnitude: 0.85,
    meaning: "The Bull's Eye. Integrity, honor, eloquence. 'Success through integrity.' Military honors, courage. Guardian of the East."
  },
  fomalhaut: {
    name: 'Fomalhaut',
    longitude: 333.0, // 3° Pisces
    orb: 2.0,
    magnitude: 1.16,
    meaning: "The Mouth of the Fish. Idealism, mysticism, fame. Rise and fall. Charisma, magic, spiritual power. Guardian of the South."
  },
  alcyone: {
    name: 'Alcyone',
    longitude: 60.0, // 0° Gemini
    orb: 1.5,
    magnitude: 2.86,
    meaning: "Central star of Pleiades (Seven Sisters). Vision, mysticism, grief. Something to cry about. Ambition, mourning. Mystical sight."
  }
};

// Check if planet is conjunct a fixed star
export interface FixedStarConjunction {
  star: string;
  planet: string;
  orb: string;
  meaning: string;
}

export const getFixedStarConjunctions = (planets: PlanetaryPositions): FixedStarConjunction[] => {
  const conjunctions: FixedStarConjunction[] = [];
  
  const getLongitude = (position: ZodiacPosition): number => {
    const signIndex = ZODIAC_SIGNS.findIndex(s => s.name === position.signName);
    return signIndex * 30 + position.degree;
  };

  const planetEntries: [string, ZodiacPosition][] = [
    ['Moon', planets.moon],
    ['Sun', planets.sun],
    ['Mercury', planets.mercury],
    ['Venus', planets.venus],
    ['Mars', planets.mars],
    ['Jupiter', planets.jupiter],
    ['Saturn', planets.saturn],
  ];

  planetEntries.forEach(([planetName, position]) => {
    const planetLon = getLongitude(position);
    
    Object.values(FIXED_STARS).forEach((star) => {
      const orb = Math.abs(planetLon - star.longitude);
      const normalizedOrb = orb > 180 ? 360 - orb : orb;
      
      if (normalizedOrb <= star.orb) {
        conjunctions.push({
          star: star.name,
          planet: planetName,
          orb: normalizedOrb.toFixed(2),
          meaning: star.meaning
        });
      }
    });
  });
  
  return conjunctions;
};

// Chiron interpretations by sign
export const CHIRON_MEANINGS: Record<string, string> = {
  Aries: "Wound: Identity, self-assertion, independence. Healing: Courage to be yourself, warrior spirit, pioneering new paths.",
  Taurus: "Wound: Self-worth, material security, body image. Healing: Grounding, sensuality, valuing yourself.",
  Gemini: "Wound: Communication, learning, siblings. Healing: Voice, curiosity, connecting.",
  Cancer: "Wound: Emotions, family, belonging. Healing: Nurturing self and others, emotional safety.",
  Leo: "Wound: Self-expression, creativity, recognition. Healing: Authentic creativity, inner child joy.",
  Virgo: "Wound: Perfection, service, health. Healing: Accepting imperfection, holistic wellness.",
  Libra: "Wound: Relationships, balance, fairness. Healing: Healthy boundaries, partnership equality.",
  Scorpio: "Wound: Trust, intimacy, transformation. Healing: Deep emotional healing, empowerment.",
  Sagittarius: "Wound: Meaning, truth, freedom. Healing: Faith, philosophical understanding, adventure.",
  Capricorn: "Wound: Authority, achievement, structure. Healing: Building from wounds, mature success.",
  Aquarius: "Wound: Belonging, uniqueness, community. Healing: Embracing difference, humanitarian work.",
  Pisces: "Wound: Boundaries, escapism, spirituality. Healing: Compassion, mystical connection, service."
};

// Lilith interpretations by sign
export const LILITH_MEANINGS: Record<string, string> = {
  Aries: "Wild independence. Rage at being told who to be. Power: Fierce autonomy.",
  Taurus: "Sensual sovereignty. Rage at being owned. Power: Body as temple.",
  Gemini: "Voice as weapon. Rage at being silenced. Power: Speaking dangerous truths.",
  Cancer: "Primal mother. Rage at nurturing demands. Power: Emotional intensity.",
  Leo: "Creative fury. Rage at being unseen. Power: Shameless self-expression.",
  Virgo: "Perfect imperfection. Rage at criticism. Power: Sacred service.",
  Libra: "Relationship rebel. Rage at people-pleasing. Power: Authentic partnership.",
  Scorpio: "Sexual power. Rage at control. Power: Transformative intensity.",
  Sagittarius: "Wild freedom. Rage at cages. Power: Untamed spirit.",
  Capricorn: "Authority defiance. Rage at rules. Power: Building your empire.",
  Aquarius: "Radical uniqueness. Rage at conformity. Power: Revolutionary change.",
  Pisces: "Mystic wild. Rage at reality. Power: Spiritual rebellion."
};

// Stellium detection (3+ planets in same sign)
export interface Stellium {
  sign: string;
  planets: { name: string; symbol: string; degree: number }[];
  count: number;
}

// Stellium interpretations by sign
export const STELLIUM_MEANINGS: Record<string, string> = {
  Aries: 'Your willpower, identity, and values converge on courage and independence. This is a time of bold new beginnings. Initiative and self-assertion intensify.',
  Taurus: 'Stability, sensuality, and material focus converge. Build lasting value. Ground your energy. Pleasure and security matter.',
  Gemini: 'Communication, curiosity, and connection multiply. Information flows freely. Learn, teach, network. Mental energy peaks.',
  Cancer: 'Emotions, nurturing, and home life intensify. Family matters. Feelings run deep. Create emotional safety.',
  Leo: 'Creativity, self-expression, and leadership shine. Performance energy. Confidence soars. Share your gifts boldly.',
  Virgo: 'Analysis, service, and improvement focus intensifies. Perfect your craft. Health and daily routines matter. Organize life.',
  Libra: 'Relationships, balance, and harmony dominate. Partnership focus. Diplomatic energy. Beauty and justice matter.',
  Scorpio: 'Transformation, depth, and power converge. Intense emotional work. Shadow integration. Profound change possible.',
  Sagittarius: 'Expansion, truth, and adventure align. Philosophy matters. Travel beckons. Meaning and freedom call.',
  Capricorn: 'Your willpower, identity, and values converge on achievement and structure. This is a time of serious ambition and long-term planning. Professional focus intensifies.',
  Aquarius: 'Innovation, community, and future vision merge. Collective consciousness shifts. Revolutionary ideas and humanitarian impulses surge.',
  Pisces: 'Spirituality, compassion, and dissolution blend. Boundaries soften. Dreams intensify. Creative and mystical energy flows.',
};

export const getStelliumMeaning = (sign: string): string => {
  return STELLIUM_MEANINGS[sign] || `Concentrated energy in ${sign}. This sign's themes dominate your focus.`;
};

export const detectStelliums = (planets: PlanetaryPositions): Stellium[] => {
  const signGroups: Record<string, { name: string; symbol: string; degree: number }[]> = {};
  
  const planetEntries: [string, ZodiacPosition, string][] = [
    ['Moon', planets.moon, '☽'],
    ['Sun', planets.sun, '☉'],
    ['Mercury', planets.mercury, '☿'],
    ['Venus', planets.venus, '♀'],
    ['Mars', planets.mars, '♂'],
    ['Jupiter', planets.jupiter, '♃'],
    ['Saturn', planets.saturn, '♄'],
  ];

  planetEntries.forEach(([name, position, symbol]) => {
    if (!signGroups[position.signName]) {
      signGroups[position.signName] = [];
    }
    signGroups[position.signName].push({ name, symbol, degree: position.degree });
  });

  return Object.entries(signGroups)
    .filter(([, planetList]) => planetList.length >= 3)
    .map(([sign, planetList]) => ({
      sign,
      planets: planetList.sort((a, b) => a.degree - b.degree),
      count: planetList.length
    }));
};

// Rare aspect detection (quincunx, sesquiquadrate, quintile, bi-quintile)
export interface RareAspect {
  planet1: string;
  planet2: string;
  type: string;
  symbol: string;
  angle: number;
  orb: string;
  meaning: string;
}

export const detectRareAspects = (planets: PlanetaryPositions): RareAspect[] => {
  const rareAspects: RareAspect[] = [];
  
  const getLongitude = (position: ZodiacPosition): number => {
    const signIndex = ZODIAC_SIGNS.findIndex(s => s.name === position.signName);
    return signIndex * 30 + position.degree;
  };

  const planetList: [string, ZodiacPosition][] = [
    ['Moon', planets.moon],
    ['Sun', planets.sun],
    ['Mercury', planets.mercury],
    ['Venus', planets.venus],
    ['Mars', planets.mars],
    ['Jupiter', planets.jupiter],
    ['Saturn', planets.saturn],
  ];

  for (let i = 0; i < planetList.length; i++) {
    for (let j = i + 1; j < planetList.length; j++) {
      const [p1Name, p1Pos] = planetList[i];
      const [p2Name, p2Pos] = planetList[j];
      const lon1 = getLongitude(p1Pos);
      const lon2 = getLongitude(p2Pos);
      
      const diff = Math.abs(((lon2 - lon1 + 180) % 360) - 180);

      // Sesquiquadrate (135°)
      if (Math.abs(diff - 135) < 3) {
        rareAspects.push({
          planet1: p1Name,
          planet2: p2Name,
          type: 'sesquiquadrate',
          symbol: '⚼',
          angle: 135,
          orb: Math.abs(diff - 135).toFixed(1),
          meaning: 'Friction and adjustment needed. Creative tension requiring action.'
        });
      }
      
      // Quincunx/Inconjunct (150°)
      if (Math.abs(diff - 150) < 3) {
        rareAspects.push({
          planet1: p1Name,
          planet2: p2Name,
          type: 'quincunx',
          symbol: '⚻',
          angle: 150,
          orb: Math.abs(diff - 150).toFixed(1),
          meaning: 'Requires pivoting and adjustment. Incompatible energies seeking integration.'
        });
      }
      
      // Quintile (72°)
      if (Math.abs(diff - 72) < 2) {
        rareAspects.push({
          planet1: p1Name,
          planet2: p2Name,
          type: 'quintile',
          symbol: 'Q',
          angle: 72,
          orb: Math.abs(diff - 72).toFixed(1),
          meaning: 'Creative talent and gifts. Artistic expression.'
        });
      }
      
      // Bi-quintile (144°)
      if (Math.abs(diff - 144) < 2) {
        rareAspects.push({
          planet1: p1Name,
          planet2: p2Name,
          type: 'bi-quintile',
          symbol: 'bQ',
          angle: 144,
          orb: Math.abs(diff - 144).toFixed(1),
          meaning: 'Creative mastery. Exceptional talent ready to manifest.'
        });
      }
    }
  }

  return rareAspects;
};

// Node aspect detection
export interface NodeAspect {
  planet: string;
  node: 'North' | 'South';
  type: string;
  symbol: string;
  meaning: string;
}

export const detectNodeAspects = (planets: PlanetaryPositions): NodeAspect[] => {
  const nodeAspects: NodeAspect[] = [];
  
  if (!planets.northNode) return nodeAspects;
  
  const getLongitude = (position: ZodiacPosition): number => {
    const signIndex = ZODIAC_SIGNS.findIndex(s => s.name === position.signName);
    return signIndex * 30 + position.degree;
  };

  const planetList: [string, ZodiacPosition][] = [
    ['Moon', planets.moon],
    ['Sun', planets.sun],
    ['Mercury', planets.mercury],
    ['Venus', planets.venus],
    ['Mars', planets.mars],
    ['Jupiter', planets.jupiter],
    ['Saturn', planets.saturn],
  ];

  const northLon = planets.northNode.longitude;

  planetList.forEach(([planetName, position]) => {
    const planetLon = getLongitude(position);
    const diff = Math.abs(((planetLon - northLon + 180) % 360) - 180);

    // Conjunction to North Node
    if (diff < 8) {
      nodeAspects.push({
        planet: planetName,
        node: 'North',
        type: 'conjunction',
        symbol: '☌',
        meaning: 'Destined action. This planet supports your life purpose and future direction.'
      });
    }
    // Sextile to North Node (60°)
    else if (Math.abs(diff - 60) < 6) {
      nodeAspects.push({
        planet: planetName,
        node: 'North',
        type: 'sextile',
        symbol: '⚹',
        meaning: 'Opportunities aligned with destiny. Easy support for growth.'
      });
    }
    // Trine to North Node (120°)
    else if (Math.abs(diff - 120) < 8) {
      nodeAspects.push({
        planet: planetName,
        node: 'North',
        type: 'trine',
        symbol: '△',
        meaning: 'Flowing toward your purpose with ease and grace.'
      });
    }
    // Opposition (conjunct South Node)
    else if (Math.abs(diff - 180) < 8) {
      nodeAspects.push({
        planet: planetName,
        node: 'South',
        type: 'conjunction',
        symbol: '☌',
        meaning: 'Past-life activation. Familiar territory but may need to release attachment.'
      });
    }
  });

  return nodeAspects;
};

// Note: ZODIAC_SIGNS already defined at top of file

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
}

export type EnergyLevel = 'rest' | 'high' | 'caution' | 'moderate';

export interface EnergyRating {
  level: EnergyLevel;
  label: string;
}

export interface DayData {
  date: Date;
  planets: PlanetaryPositions;
  moonPhase: MoonPhase;
  mercuryRetro: boolean;
  personalTransits: PersonalTransits;
  majorIngresses: Ingress[];
  energy: EnergyRating;
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

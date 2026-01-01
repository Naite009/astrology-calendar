import { UserData } from "@/hooks/useUserData";

// Detailed Moon ephemeris with exact times and degrees for January 2026
export interface MoonEphemerisEntry {
  sign: string;
  name: string;
  degree: number;
  nextChange: string;
  vocStart?: string;
  fullMoon?: string;
  fullMoonDegree?: string;
  newMoon?: string;
  newMoonDegree?: string;
}

const MOON_EPHEMERIS: Record<string, MoonEphemerisEntry> = {
  '2026-01-01': { sign: '♊', name: 'Gemini', degree: 6, nextChange: '2026-01-02T13:09:00Z' },
  '2026-01-02': { sign: '♊', name: 'Gemini', degree: 21, nextChange: '2026-01-02T13:09:00Z', vocStart: '2026-01-02T07:23:00Z' },
  '2026-01-03': { sign: '♋', name: 'Cancer', degree: 6, nextChange: '2026-01-04T13:43:00Z', fullMoon: '2026-01-03T10:03:00Z', fullMoonDegree: "13°02' ♋" },
  '2026-01-04': { sign: '♋', name: 'Cancer', degree: 21, nextChange: '2026-01-04T13:43:00Z', vocStart: '2026-01-04T11:46:00Z' },
  '2026-01-05': { sign: '♌', name: 'Leo', degree: 6, nextChange: '2026-01-06T16:56:00Z' },
  '2026-01-06': { sign: '♌', name: 'Leo', degree: 21, nextChange: '2026-01-06T16:56:00Z', vocStart: '2026-01-06T08:33:00Z' },
  '2026-01-07': { sign: '♍', name: 'Virgo', degree: 6, nextChange: '2026-01-09T00:05:00Z' },
  '2026-01-08': { sign: '♍', name: 'Virgo', degree: 21, nextChange: '2026-01-09T00:05:00Z', vocStart: '2026-01-08T22:33:00Z' },
  '2026-01-09': { sign: '♎', name: 'Libra', degree: 6, nextChange: '2026-01-11T10:55:00Z' },
  '2026-01-10': { sign: '♎', name: 'Libra', degree: 21, nextChange: '2026-01-11T10:55:00Z', vocStart: '2026-01-11T08:48:00Z' },
  '2026-01-11': { sign: '♏', name: 'Scorpio', degree: 6, nextChange: '2026-01-13T23:33:00Z' },
  '2026-01-12': { sign: '♏', name: 'Scorpio', degree: 21, nextChange: '2026-01-13T23:33:00Z' },
  '2026-01-13': { sign: '♏', name: 'Scorpio', degree: 27, nextChange: '2026-01-13T23:33:00Z', vocStart: '2026-01-13T21:26:00Z' },
  '2026-01-14': { sign: '♐', name: 'Sagittarius', degree: 6, nextChange: '2026-01-16T11:47:00Z' },
  '2026-01-15': { sign: '♐', name: 'Sagittarius', degree: 21, nextChange: '2026-01-16T11:47:00Z' },
  '2026-01-16': { sign: '♐', name: 'Sagittarius', degree: 27, nextChange: '2026-01-16T11:47:00Z', vocStart: '2026-01-16T09:37:00Z' },
  '2026-01-17': { sign: '♑', name: 'Capricorn', degree: 6, nextChange: '2026-01-18T22:18:00Z' },
  '2026-01-18': { sign: '♑', name: 'Capricorn', degree: 21, nextChange: '2026-01-18T22:18:00Z', vocStart: '2026-01-18T21:24:00Z', newMoon: '2026-01-18T16:52:00Z', newMoonDegree: "28°43' ♑" },
  '2026-01-19': { sign: '♒', name: 'Aquarius', degree: 6, nextChange: '2026-01-21T06:49:00Z' },
  '2026-01-20': { sign: '♒', name: 'Aquarius', degree: 21, nextChange: '2026-01-21T06:49:00Z' },
  '2026-01-21': { sign: '♒', name: 'Aquarius', degree: 27, nextChange: '2026-01-21T06:49:00Z', vocStart: '2026-01-21T05:32:00Z' },
  '2026-01-22': { sign: '♓', name: 'Pisces', degree: 6, nextChange: '2026-01-23T13:25:00Z' },
  '2026-01-23': { sign: '♓', name: 'Pisces', degree: 21, nextChange: '2026-01-23T13:25:00Z', vocStart: '2026-01-23T13:19:00Z' },
  '2026-01-24': { sign: '♈', name: 'Aries', degree: 6, nextChange: '2026-01-25T18:05:00Z' },
  '2026-01-25': { sign: '♈', name: 'Aries', degree: 21, nextChange: '2026-01-25T18:05:00Z', vocStart: '2026-01-24T21:37:00Z' },
  '2026-01-26': { sign: '♉', name: 'Taurus', degree: 6, nextChange: '2026-01-27T20:55:00Z' },
  '2026-01-27': { sign: '♉', name: 'Taurus', degree: 21, nextChange: '2026-01-27T20:55:00Z', vocStart: '2026-01-27T18:10:00Z' },
  '2026-01-28': { sign: '♊', name: 'Gemini', degree: 6, nextChange: '2026-01-29T22:31:00Z' },
  '2026-01-29': { sign: '♊', name: 'Gemini', degree: 21, nextChange: '2026-01-29T22:31:00Z', vocStart: '2026-01-29T21:39:00Z' },
  '2026-01-30': { sign: '♋', name: 'Cancer', degree: 6, nextChange: '2026-02-01T00:09:00Z' },
  '2026-01-31': { sign: '♋', name: 'Cancer', degree: 21, nextChange: '2026-02-01T00:09:00Z' },
};

// Mercury retrograde periods in 2026
const MERCURY_RETROGRADE_2026 = [
  { start: new Date(2026, 2, 15), end: new Date(2026, 3, 7) },
  { start: new Date(2026, 6, 18), end: new Date(2026, 7, 11) },
  { start: new Date(2026, 10, 9), end: new Date(2026, 11, 1) },
];

export interface MoonData {
  phaseIcon: string;
  phaseName: string;
  isBalsamic: boolean;
  sign: string;
  name: string;
  degree: number;
  fullDegree: string;
  nextChange?: string;
  vocStart?: string;
  fullMoon?: string;
  fullMoonDegree?: string;
  newMoon?: string;
  newMoonDegree?: string;
}

export interface MercuryStatus {
  isRetrograde: boolean;
  isFavorable: boolean;
}

export interface VenusData {
  venusSign: string;
  venusDegree: number;
  hasVenusAspect: boolean;
}

export interface Transit {
  type: string;
  desc: string;
  icon: string;
}

export interface PersonalTransits {
  hasTransits: boolean;
  transits: Transit[];
}

export type EnergyLevel = 'void' | 'rest' | 'high' | 'caution' | 'moderate';

export interface EnergyRating {
  level: EnergyLevel;
  label: string;
}

export interface DayData {
  date: Date;
  moonData: MoonData;
  mercuryStatus: MercuryStatus;
  venusData: VenusData;
  personalTransits: PersonalTransits;
  vocData?: string;
  energy: EnergyRating;
}

export const getMoonData = (date: Date): MoonData => {
  const dateKey = date.toISOString().split('T')[0];
  const ephemerisData = MOON_EPHEMERIS[dateKey] || { sign: '♊', name: 'Gemini', degree: 0, nextChange: '' };

  // Moon phase calculation
  const lunationCycle = 29.530588853;
  const knownNewMoon = new Date(2000, 0, 6, 18, 14);
  const diff = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const phase = ((diff % lunationCycle) / lunationCycle);
  const normalizedPhase = phase < 0 ? phase + 1 : phase;

  let phaseIcon: string;
  let phaseName: string;

  if (normalizedPhase < 0.0625 || normalizedPhase >= 0.9375) {
    phaseIcon = '🌑'; phaseName = 'New Moon';
  } else if (normalizedPhase < 0.1875) {
    phaseIcon = '🌒'; phaseName = 'Waxing Crescent';
  } else if (normalizedPhase < 0.3125) {
    phaseIcon = '🌓'; phaseName = 'First Quarter';
  } else if (normalizedPhase < 0.4375) {
    phaseIcon = '🌔'; phaseName = 'Waxing Gibbous';
  } else if (normalizedPhase < 0.5625) {
    phaseIcon = '🌕'; phaseName = 'Full Moon';
  } else if (normalizedPhase < 0.6875) {
    phaseIcon = '🌖'; phaseName = 'Waning Gibbous';
  } else if (normalizedPhase < 0.8125) {
    phaseIcon = '🌗'; phaseName = 'Last Quarter';
  } else {
    phaseIcon = '🌘'; phaseName = 'Waning Crescent';
  }

  const isBalsamic = normalizedPhase >= 0.875 || normalizedPhase < 0.0625;

  return {
    phaseIcon,
    phaseName,
    isBalsamic,
    sign: ephemerisData.sign,
    name: ephemerisData.name,
    degree: ephemerisData.degree,
    fullDegree: `${ephemerisData.degree}° ${ephemerisData.sign}`,
    nextChange: ephemerisData.nextChange,
    vocStart: ephemerisData.vocStart,
    fullMoon: ephemerisData.fullMoon,
    fullMoonDegree: ephemerisData.fullMoonDegree,
    newMoon: ephemerisData.newMoon,
    newMoonDegree: ephemerisData.newMoonDegree,
  };
};

export const getMercuryStatus = (date: Date): MercuryStatus => {
  const isRetrograde = MERCURY_RETROGRADE_2026.some(
    period => date >= period.start && date <= period.end
  );

  return {
    isRetrograde,
    isFavorable: !isRetrograde,
  };
};

export const getVenusTransits = (date: Date, userData: UserData | null): VenusData => {
  // Venus transits for January 2026 (Venus in Capricorn)
  const venusSign = '♑';
  const venusDegree = 9 + Math.floor((date.getTime() - new Date(2026, 0, 1).getTime()) / (1000 * 60 * 60 * 24));

  // Check if Venus aspects user's Libra placements (if user data exists)
  let hasVenusAspect = false;
  if (userData?.birthDate) {
    // Simplified: Venus in Capricorn squares Libra placements
    if (venusDegree >= 27 && venusDegree <= 29) {
      hasVenusAspect = true;
    }
  }

  return { venusSign, venusDegree, hasVenusAspect };
};

export const getPersonalTransits = (moonData: MoonData, userData: UserData | null): PersonalTransits => {
  if (!userData?.birthDate) return { hasTransits: false, transits: [] };

  const transits: Transit[] = [];

  // Check if Moon transits Libra (important for triple Libra)
  if (moonData.name === 'Libra') {
    transits.push({
      type: 'Moon conjunct Sun/Moon/Rising',
      desc: 'Emotional peak - excellent for self-care',
      icon: '☽',
    });
  }

  // Check for Moon square/opposition to Libra
  if (['Capricorn', 'Cancer'].includes(moonData.name)) {
    transits.push({
      type: 'Moon square Libra placements',
      desc: 'Tension between emotions and balance',
      icon: '□',
    });
  }

  if (moonData.name === 'Aries') {
    transits.push({
      type: 'Moon opposite Libra placements',
      desc: 'Relationship dynamics highlighted',
      icon: '☍',
    });
  }

  return { hasTransits: transits.length > 0, transits };
};

export const getEnergyRating = (moonData: MoonData, mercuryStatus: MercuryStatus, vocData?: string): EnergyRating => {
  if (vocData) return { level: 'void', label: 'Void of Course' };
  if (moonData.isBalsamic) return { level: 'rest', label: 'Rest/Balsamic' };
  if (mercuryStatus.isFavorable && moonData.phaseName.includes('Waxing')) {
    return { level: 'high', label: 'Productive' };
  }
  if (mercuryStatus.isRetrograde) return { level: 'caution', label: 'Mercury Rx' };
  return { level: 'moderate', label: 'Moderate' };
};

export const formatTime = (isoString: string | undefined, timezone = 'America/New_York'): string => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

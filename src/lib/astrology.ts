// Moon sign ephemeris data for January 2026
const MOON_INGRESSES_2026 = [
  { date: new Date('2025-12-31T13:13:00Z'), sign: 'Gemini', symbol: '♊' },
  { date: new Date('2026-01-02T13:09:00Z'), sign: 'Cancer', symbol: '♋' },
  { date: new Date('2026-01-04T13:43:00Z'), sign: 'Leo', symbol: '♌' },
  { date: new Date('2026-01-06T16:56:00Z'), sign: 'Virgo', symbol: '♍' },
  { date: new Date('2026-01-09T00:05:00Z'), sign: 'Libra', symbol: '♎' },
  { date: new Date('2026-01-11T10:55:00Z'), sign: 'Scorpio', symbol: '♏' },
  { date: new Date('2026-01-13T23:33:00Z'), sign: 'Sagittarius', symbol: '♐' },
  { date: new Date('2026-01-16T11:47:00Z'), sign: 'Capricorn', symbol: '♑' },
  { date: new Date('2026-01-18T22:18:00Z'), sign: 'Aquarius', symbol: '♒' },
  { date: new Date('2026-01-21T06:49:00Z'), sign: 'Pisces', symbol: '♓' },
  { date: new Date('2026-01-23T13:25:00Z'), sign: 'Aries', symbol: '♈' },
  { date: new Date('2026-01-25T18:05:00Z'), sign: 'Taurus', symbol: '♉' },
  { date: new Date('2026-01-27T20:55:00Z'), sign: 'Gemini', symbol: '♊' },
  { date: new Date('2026-01-29T22:31:00Z'), sign: 'Cancer', symbol: '♋' },
  { date: new Date('2026-02-01T00:09:00Z'), sign: 'Leo', symbol: '♌' },
];

// Mercury retrograde periods in 2026
const MERCURY_RETROGRADE_2026 = [
  { start: new Date(2026, 2, 15), end: new Date(2026, 3, 7) },
  { start: new Date(2026, 6, 18), end: new Date(2026, 7, 11) },
  { start: new Date(2026, 10, 9), end: new Date(2026, 11, 1) },
];

export interface MoonSign {
  symbol: string;
  name: string;
}

export interface MoonData {
  phaseIcon: string;
  phaseName: string;
  isBalsamic: boolean;
  sign: MoonSign;
}

export interface MercuryStatus {
  isRetrograde: boolean;
  isFavorable: boolean;
}

export type EnergyLevel = 'rest' | 'high' | 'caution' | 'moderate';

export interface EnergyRating {
  level: EnergyLevel;
  label: string;
}

export const getMoonSign = (date: Date): MoonSign => {
  let currentSign = MOON_INGRESSES_2026[0];
  
  for (let i = 0; i < MOON_INGRESSES_2026.length - 1; i++) {
    if (date >= MOON_INGRESSES_2026[i].date && date < MOON_INGRESSES_2026[i + 1].date) {
      currentSign = MOON_INGRESSES_2026[i];
      break;
    }
  }

  return {
    symbol: currentSign.symbol,
    name: currentSign.sign,
  };
};

export const getMoonData = (date: Date): MoonData => {
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

  // Balsamic phase (last ~3.5 days before new moon)
  const isBalsamic = normalizedPhase >= 0.875 || normalizedPhase < 0.0625;

  return {
    phaseIcon,
    phaseName,
    isBalsamic,
    sign: getMoonSign(date),
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

export const getEnergyRating = (moonData: MoonData, mercuryStatus: MercuryStatus): EnergyRating => {
  if (moonData.isBalsamic) {
    return { level: 'rest', label: 'Rest' };
  }
  if (mercuryStatus.isFavorable && moonData.phaseName.includes('Waxing')) {
    return { level: 'high', label: 'Productive' };
  }
  if (mercuryStatus.isRetrograde) {
    return { level: 'caution', label: 'Caution' };
  }
  return { level: 'moderate', label: 'Moderate' };
};

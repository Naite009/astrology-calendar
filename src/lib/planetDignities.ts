// ============================================================================
// COMPLETE ASTROLOGICAL DATA FOR ENHANCED PLANET DETAILS
// ============================================================================

export const PLANET_DIGNITIES: Record<string, {
  rulership: string | string[];
  exaltation: string;
  detriment: string | string[];
  fall: string;
}> = {
  Sun: {
    rulership: 'Leo',
    exaltation: 'Aries (19°)',
    detriment: 'Aquarius',
    fall: 'Libra (19°)'
  },
  Moon: {
    rulership: 'Cancer',
    exaltation: 'Taurus (3°)',
    detriment: 'Capricorn',
    fall: 'Scorpio (3°)'
  },
  Mercury: {
    rulership: ['Gemini', 'Virgo'],
    exaltation: 'Virgo (15°)',
    detriment: ['Sagittarius', 'Pisces'],
    fall: 'Pisces (15°)'
  },
  Venus: {
    rulership: ['Taurus', 'Libra'],
    exaltation: 'Pisces (27°)',
    detriment: ['Scorpio', 'Aries'],
    fall: 'Virgo (27°)'
  },
  Mars: {
    rulership: ['Aries', 'Scorpio'],
    exaltation: 'Capricorn (28°)',
    detriment: ['Libra', 'Taurus'],
    fall: 'Cancer (28°)'
  },
  Jupiter: {
    rulership: ['Sagittarius', 'Pisces'],
    exaltation: 'Cancer (15°)',
    detriment: ['Gemini', 'Virgo'],
    fall: 'Capricorn (15°)'
  },
  Saturn: {
    rulership: ['Capricorn', 'Aquarius'],
    exaltation: 'Libra (21°)',
    detriment: ['Cancer', 'Leo'],
    fall: 'Aries (21°)'
  },
  Uranus: {
    rulership: 'Aquarius',
    exaltation: 'Scorpio',
    detriment: 'Leo',
    fall: 'Taurus'
  },
  Neptune: {
    rulership: 'Pisces',
    exaltation: 'Cancer',
    detriment: 'Virgo',
    fall: 'Capricorn'
  },
  Pluto: {
    rulership: 'Scorpio',
    exaltation: 'Aries',
    detriment: 'Taurus',
    fall: 'Libra'
  }
};

export const SIGN_PROPERTIES: Record<string, { element: string; mode: string; ruler: string }> = {
  Aries: { element: 'Fire', mode: 'Cardinal', ruler: 'Mars' },
  Taurus: { element: 'Earth', mode: 'Fixed', ruler: 'Venus' },
  Gemini: { element: 'Air', mode: 'Mutable', ruler: 'Mercury' },
  Cancer: { element: 'Water', mode: 'Cardinal', ruler: 'Moon' },
  Leo: { element: 'Fire', mode: 'Fixed', ruler: 'Sun' },
  Virgo: { element: 'Earth', mode: 'Mutable', ruler: 'Mercury' },
  Libra: { element: 'Air', mode: 'Cardinal', ruler: 'Venus' },
  Scorpio: { element: 'Water', mode: 'Fixed', ruler: 'Mars' },
  Sagittarius: { element: 'Fire', mode: 'Mutable', ruler: 'Jupiter' },
  Capricorn: { element: 'Earth', mode: 'Cardinal', ruler: 'Saturn' },
  Aquarius: { element: 'Air', mode: 'Fixed', ruler: 'Saturn' },
  Pisces: { element: 'Water', mode: 'Mutable', ruler: 'Jupiter' }
};

export const HOUSE_TYPES: Record<number, string> = {
  1: 'Angular', 2: 'Succedent', 3: 'Cadent',
  4: 'Angular', 5: 'Succedent', 6: 'Cadent',
  7: 'Angular', 8: 'Succedent', 9: 'Cadent',
  10: 'Angular', 11: 'Succedent', 12: 'Cadent'
};

export const TRIPLICITY_RULERS: Record<string, { day: string; night: string; participating: string }> = {
  Fire: { day: 'Sun', night: 'Jupiter', participating: 'Saturn' },
  Earth: { day: 'Venus', night: 'Moon', participating: 'Mars' },
  Air: { day: 'Saturn', night: 'Mercury', participating: 'Jupiter' },
  Water: { day: 'Venus', night: 'Mars', participating: 'Moon' }
};

export const DECAN_RULERS: Record<string, [string, string, string]> = {
  // Each sign divided into 3 decans (0-10°, 10-20°, 20-30°)
  Aries: ['Mars', 'Sun', 'Venus'],
  Taurus: ['Mercury', 'Moon', 'Saturn'],
  Gemini: ['Jupiter', 'Mars', 'Sun'],
  Cancer: ['Venus', 'Mercury', 'Moon'],
  Leo: ['Saturn', 'Jupiter', 'Mars'],
  Virgo: ['Sun', 'Venus', 'Mercury'],
  Libra: ['Moon', 'Saturn', 'Jupiter'],
  Scorpio: ['Mars', 'Sun', 'Venus'],
  Sagittarius: ['Mercury', 'Moon', 'Saturn'],
  Capricorn: ['Jupiter', 'Mars', 'Sun'],
  Aquarius: ['Venus', 'Mercury', 'Moon'],
  Pisces: ['Saturn', 'Jupiter', 'Mars']
};

// Egyptian Terms (Bounds) - Ptolemaic
export const EGYPTIAN_TERMS: Record<string, Array<{ ruler: string; end: number }>> = {
  Aries: [
    { ruler: 'Jupiter', end: 6 },
    { ruler: 'Venus', end: 12 },
    { ruler: 'Mercury', end: 20 },
    { ruler: 'Mars', end: 25 },
    { ruler: 'Saturn', end: 30 }
  ],
  Taurus: [
    { ruler: 'Venus', end: 8 },
    { ruler: 'Mercury', end: 14 },
    { ruler: 'Jupiter', end: 22 },
    { ruler: 'Saturn', end: 27 },
    { ruler: 'Mars', end: 30 }
  ],
  Gemini: [
    { ruler: 'Mercury', end: 6 },
    { ruler: 'Jupiter', end: 12 },
    { ruler: 'Venus', end: 17 },
    { ruler: 'Mars', end: 24 },
    { ruler: 'Saturn', end: 30 }
  ],
  Cancer: [
    { ruler: 'Mars', end: 7 },
    { ruler: 'Venus', end: 13 },
    { ruler: 'Mercury', end: 19 },
    { ruler: 'Jupiter', end: 26 },
    { ruler: 'Saturn', end: 30 }
  ],
  Leo: [
    { ruler: 'Jupiter', end: 6 },
    { ruler: 'Venus', end: 11 },
    { ruler: 'Saturn', end: 18 },
    { ruler: 'Mercury', end: 24 },
    { ruler: 'Mars', end: 30 }
  ],
  Virgo: [
    { ruler: 'Mercury', end: 7 },
    { ruler: 'Venus', end: 17 },
    { ruler: 'Jupiter', end: 21 },
    { ruler: 'Mars', end: 28 },
    { ruler: 'Saturn', end: 30 }
  ],
  Libra: [
    { ruler: 'Saturn', end: 6 },
    { ruler: 'Mercury', end: 14 },
    { ruler: 'Jupiter', end: 21 },
    { ruler: 'Venus', end: 28 },
    { ruler: 'Mars', end: 30 }
  ],
  Scorpio: [
    { ruler: 'Mars', end: 7 },
    { ruler: 'Venus', end: 11 },
    { ruler: 'Mercury', end: 19 },
    { ruler: 'Jupiter', end: 24 },
    { ruler: 'Saturn', end: 30 }
  ],
  Sagittarius: [
    { ruler: 'Jupiter', end: 12 },
    { ruler: 'Venus', end: 17 },
    { ruler: 'Mercury', end: 21 },
    { ruler: 'Saturn', end: 26 },
    { ruler: 'Mars', end: 30 }
  ],
  Capricorn: [
    { ruler: 'Mercury', end: 7 },
    { ruler: 'Jupiter', end: 14 },
    { ruler: 'Venus', end: 22 },
    { ruler: 'Saturn', end: 26 },
    { ruler: 'Mars', end: 30 }
  ],
  Aquarius: [
    { ruler: 'Mercury', end: 7 },
    { ruler: 'Venus', end: 13 },
    { ruler: 'Jupiter', end: 20 },
    { ruler: 'Mars', end: 25 },
    { ruler: 'Saturn', end: 30 }
  ],
  Pisces: [
    { ruler: 'Venus', end: 12 },
    { ruler: 'Jupiter', end: 16 },
    { ruler: 'Mercury', end: 19 },
    { ruler: 'Mars', end: 28 },
    { ruler: 'Saturn', end: 30 }
  ]
};

// Average planetary speeds (degrees per day)
export const AVERAGE_SPEEDS: Record<string, string> = {
  Sun: '0° 59\' / day',
  Moon: '13° 10\' / day',
  Mercury: '1° 23\' / day',
  Venus: '1° 12\' / day',
  Mars: '0° 31\' / day',
  Jupiter: '0° 5\' / day',
  Saturn: '0° 2\' / day',
  Uranus: '0° 0.5\' / day',
  Neptune: '0° 0.2\' / day',
  Pluto: '0° 0.1\' / day'
};

// Saturn symbols by sign
export const SATURN_SYMBOLS: Record<string, { symbol: string; meaning: string }> = {
  Libra: { 
    symbol: 'Scales ⚖️', 
    meaning: 'Humanity seeking to bridge the chasm of separate knowledge'
  },
  Capricorn: { 
    symbol: 'Goat 🐐', 
    meaning: 'Making of oneself the perfect instrument to construct a new future society'
  },
  Aquarius: { 
    symbol: 'Water Bearer 🏺', 
    meaning: 'Water of life - spiritual essence nourishing humanity'
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getElementSymbol = (element: string): string => {
  const symbols: Record<string, string> = { 
    Fire: '🔥', 
    Earth: '🌍', 
    Air: '💨', 
    Water: '💧' 
  };
  return symbols[element] || '';
};

export const getDecanName = (index: number): string => {
  return ['first', 'second', 'third'][index] || '';
};

export const getTermRuler = (sign: string, degree: number): string => {
  const terms = EGYPTIAN_TERMS[sign];
  if (!terms) return 'Unknown';
  
  for (const term of terms) {
    if (degree < term.end) {
      return term.ruler;
    }
  }
  return terms[terms.length - 1]?.ruler || 'Unknown';
};

export const getDecanRuler = (sign: string, degree: number): string => {
  const decans = DECAN_RULERS[sign];
  if (!decans) return 'Unknown';
  
  const decanIndex = Math.min(2, Math.floor(degree / 10));
  return decans[decanIndex];
};

export type DignityStatus = {
  type: 'Ruler' | 'Exaltation' | 'Detriment' | 'Fall' | 'Peregrine';
  color: string;
  bgColor: string;
};

export const getDignityStatus = (planetName: string, sign: string): DignityStatus => {
  const dignities = PLANET_DIGNITIES[planetName];
  if (!dignities) {
    return { type: 'Peregrine', color: 'hsl(var(--muted-foreground))', bgColor: 'hsl(var(--muted) / 0.3)' };
  }

  // Check rulership
  if (Array.isArray(dignities.rulership)) {
    if (dignities.rulership.includes(sign)) {
      return { type: 'Ruler', color: '#43A047', bgColor: 'rgba(67, 160, 71, 0.15)' };
    }
  } else {
    if (dignities.rulership === sign) {
      return { type: 'Ruler', color: '#43A047', bgColor: 'rgba(67, 160, 71, 0.15)' };
    }
  }

  // Check exaltation
  if (dignities.exaltation.includes(sign)) {
    return { type: 'Exaltation', color: '#1976D2', bgColor: 'rgba(25, 118, 210, 0.15)' };
  }

  // Check detriment
  if (Array.isArray(dignities.detriment)) {
    if (dignities.detriment.includes(sign)) {
      return { type: 'Detriment', color: '#FBC02D', bgColor: 'rgba(251, 192, 45, 0.15)' };
    }
  } else {
    if (dignities.detriment === sign) {
      return { type: 'Detriment', color: '#FBC02D', bgColor: 'rgba(251, 192, 45, 0.15)' };
    }
  }

  // Check fall
  if (dignities.fall.includes(sign)) {
    return { type: 'Fall', color: '#E53935', bgColor: 'rgba(229, 57, 53, 0.15)' };
  }

  return { type: 'Peregrine', color: 'hsl(var(--muted-foreground))', bgColor: 'hsl(var(--muted) / 0.3)' };
};

export const getSectStatus = (
  planetName: string, 
  sunHouse: number | null,
  isDayChart: boolean | null
): { status: string; description: string } => {
  if (isDayChart === null || sunHouse === null) {
    return { status: 'Unknown', description: 'Chart type could not be determined' };
  }

  const diurnalPlanets = ['Sun', 'Jupiter', 'Saturn'];
  const nocturnalPlanets = ['Moon', 'Venus', 'Mars'];

  if (diurnalPlanets.includes(planetName)) {
    if (isDayChart) {
      return { 
        status: 'In Sect (Day Chart)', 
        description: 'Planet functions well - in harmony with chart type'
      };
    }
    return { 
      status: 'Out of Sect (Night Chart)', 
      description: 'Planet challenged - out of harmony with chart type'
    };
  }

  if (nocturnalPlanets.includes(planetName)) {
    if (!isDayChart) {
      return { 
        status: 'In Sect (Night Chart)', 
        description: 'Planet functions well - in harmony with chart type'
      };
    }
    return { 
      status: 'Out of Sect (Day Chart)', 
      description: 'Planet challenged - out of harmony with chart type'
    };
  }

  return { status: 'Neutral', description: 'Mercury and outer planets are neutral regarding sect' };
};

export const getHousesRuled = (
  planetName: string,
  houseCusps: Record<string, { sign: string; degree: number; minutes?: number }> | undefined
): string => {
  if (!houseCusps) return 'Unknown';

  const ruledHouses: number[] = [];

  for (let i = 1; i <= 12; i++) {
    const cusp = houseCusps[`house${i}`];
    if (cusp?.sign) {
      const signProps = SIGN_PROPERTIES[cusp.sign];
      if (signProps?.ruler === planetName) {
        ruledHouses.push(i);
      }
    }
  }

  if (ruledHouses.length === 0) return 'None';
  
  return ruledHouses.map(h => {
    const suffix = h === 1 ? 'st' : h === 2 ? 'nd' : h === 3 ? 'rd' : 'th';
    return `${h}${suffix}`;
  }).join(', ');
};

// Calculate approximate declination based on zodiacal longitude
export const calculateDeclination = (sign: string, degree: number): string => {
  // Simplified calculation based on zodiacal position
  // Maximum declination is ~23.44° at 0° Cancer/Capricorn
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const signIndex = signs.indexOf(sign);
  if (signIndex === -1) return 'Unknown';

  const longitude = signIndex * 30 + degree;
  // Approximate declination using obliquity
  const obliquity = 23.44;
  const declination = Math.asin(Math.sin(longitude * Math.PI / 180) * Math.sin(obliquity * Math.PI / 180)) * 180 / Math.PI;
  
  const absDec = Math.abs(declination);
  const degrees = Math.floor(absDec);
  const minutes = Math.round((absDec - degrees) * 60);
  const direction = declination >= 0 ? 'N' : 'S';
  
  return `${degrees}° ${minutes}' ${direction}`;
};

// Planetary Decans - Traditional system dividing each sign into three 10° sections
// Each decan is ruled by a planet based on the triplicity (element) rulership

export interface Decan {
  number: 1 | 2 | 3;
  degrees: string;
  ruler: string;
  rulerSymbol: string;
  quality: string;
  description: string;
}

// Element triplicities and their sign order
const FIRE_SIGNS = ['Aries', 'Leo', 'Sagittarius'];
const EARTH_SIGNS = ['Taurus', 'Virgo', 'Capricorn'];
const AIR_SIGNS = ['Gemini', 'Libra', 'Aquarius'];
const WATER_SIGNS = ['Cancer', 'Scorpio', 'Pisces'];

// Traditional planetary rulers for each sign
const SIGN_RULERS: Record<string, { planet: string; symbol: string }> = {
  Aries: { planet: 'Mars', symbol: '♂' },
  Taurus: { planet: 'Venus', symbol: '♀' },
  Gemini: { planet: 'Mercury', symbol: '☿' },
  Cancer: { planet: 'Moon', symbol: '☽' },
  Leo: { planet: 'Sun', symbol: '☉' },
  Virgo: { planet: 'Mercury', symbol: '☿' },
  Libra: { planet: 'Venus', symbol: '♀' },
  Scorpio: { planet: 'Pluto', symbol: '♇' }, // Modern; traditional is Mars
  Sagittarius: { planet: 'Jupiter', symbol: '♃' },
  Capricorn: { planet: 'Saturn', symbol: '♄' },
  Aquarius: { planet: 'Uranus', symbol: '♅' }, // Modern; traditional is Saturn
  Pisces: { planet: 'Neptune', symbol: '♆' }, // Modern; traditional is Jupiter
};

// Get the triplicity (element group) for a sign
const getTriplicity = (sign: string): string[] => {
  if (FIRE_SIGNS.includes(sign)) return FIRE_SIGNS;
  if (EARTH_SIGNS.includes(sign)) return EARTH_SIGNS;
  if (AIR_SIGNS.includes(sign)) return AIR_SIGNS;
  if (WATER_SIGNS.includes(sign)) return WATER_SIGNS;
  return [sign, sign, sign];
};

// Decan qualities based on position
const DECAN_QUALITIES: Record<1 | 2 | 3, string> = {
  1: 'Cardinal/Initiating',
  2: 'Fixed/Stabilizing',
  3: 'Mutable/Adapting',
};

// Detailed decan descriptions for each sign
const DECAN_DESCRIPTIONS: Record<string, Record<1 | 2 | 3, string>> = {
  Aries: {
    1: 'Pure Aries fire — pioneering courage, raw initiative, the warrior spirit at its most direct.',
    2: 'Leo influence adds creativity and heart — leadership with warmth, dramatic self-expression.',
    3: 'Sagittarian fire brings vision — the philosopher-warrior seeking meaning in action.',
  },
  Taurus: {
    1: 'Pure Taurus earth — sensual stability, patient accumulation, unshakeable values.',
    2: 'Virgo influence adds discernment — practical refinement, health-conscious pleasures.',
    3: 'Capricorn earth brings ambition — building lasting structures, material mastery.',
  },
  Gemini: {
    1: 'Pure Gemini air — curious mind, quick wit, the eternal student gathering information.',
    2: 'Libra influence adds diplomacy — communication with grace, ideas shared harmoniously.',
    3: 'Aquarian air brings innovation — unconventional thinking, ideas ahead of their time.',
  },
  Cancer: {
    1: 'Pure Cancer water — deep nurturing, protective instincts, emotional foundations.',
    2: 'Scorpio influence adds intensity — feelings that transform, protective power.',
    3: 'Piscean water brings intuition — compassionate care, spiritual nurturing.',
  },
  Leo: {
    1: 'Pure Leo fire — radiant self-expression, creative heart, noble leadership.',
    2: 'Sagittarius influence adds wisdom — generous spirit, teaching through example.',
    3: 'Aries fire brings action — courageous creativity, pioneering self-expression.',
  },
  Virgo: {
    1: 'Pure Virgo earth — analytical precision, service-oriented, healing through order.',
    2: 'Capricorn influence adds structure — practical achievement, mastery through discipline.',
    3: 'Taurus earth brings sensuality — grounded service, appreciation for quality.',
  },
  Libra: {
    1: 'Pure Libra air — harmony-seeking, aesthetic refinement, partnership consciousness.',
    2: 'Aquarius influence adds idealism — relationships serving higher causes, social justice.',
    3: 'Gemini air brings versatility — communication in relationships, intellectual connection.',
  },
  Scorpio: {
    1: 'Pure Scorpio water — transformative depth, psychological power, regenerative force.',
    2: 'Pisces influence adds spirituality — transcendent transformation, healing through surrender.',
    3: 'Cancer water brings nurturing — protective transformation, emotional rebirth.',
  },
  Sagittarius: {
    1: 'Pure Sagittarius fire — philosophical quest, expansive vision, truth-seeking adventure.',
    2: 'Aries influence adds initiative — active pursuit of meaning, pioneering beliefs.',
    3: 'Leo fire brings creativity — self-expression through teaching, generous wisdom.',
  },
  Capricorn: {
    1: 'Pure Capricorn earth — ambitious structure, patient achievement, lasting authority.',
    2: 'Taurus influence adds stability — wealth-building, sensual appreciation of success.',
    3: 'Virgo earth brings service — achievement through excellence, practical mastery.',
  },
  Aquarius: {
    1: 'Pure Aquarius air — revolutionary vision, humanitarian ideals, authentic individuality.',
    2: 'Gemini influence adds communication — ideas spread widely, intellectual networks.',
    3: 'Libra air brings harmony — social change through partnership, balanced innovation.',
  },
  Pisces: {
    1: 'Pure Pisces water — mystical sensitivity, boundless compassion, spiritual dissolution.',
    2: 'Cancer influence adds nurturing — emotional sanctuary, protective intuition.',
    3: 'Scorpio water brings power — transformative spirituality, healing through depth.',
  },
};

/**
 * Get the decan information for a given degree and sign.
 * @param degree - The degree within the sign (0-29)
 * @param sign - The zodiac sign name
 */
export const getDecan = (degree: number, sign: string): Decan => {
  const deg = Math.floor(degree);
  const triplicity = getTriplicity(sign);
  const signIndex = triplicity.indexOf(sign);
  
  let decanNumber: 1 | 2 | 3;
  let rulerSign: string;
  
  if (deg < 10) {
    decanNumber = 1;
    // 1st decan ruled by the sign itself
    rulerSign = sign;
  } else if (deg < 20) {
    decanNumber = 2;
    // 2nd decan ruled by the next sign in the triplicity
    rulerSign = triplicity[(signIndex + 1) % 3];
  } else {
    decanNumber = 3;
    // 3rd decan ruled by the third sign in the triplicity
    rulerSign = triplicity[(signIndex + 2) % 3];
  }
  
  const ruler = SIGN_RULERS[rulerSign] || { planet: rulerSign, symbol: '?' };
  const descriptions = DECAN_DESCRIPTIONS[sign] || {
    1: `First decan of ${sign}`,
    2: `Second decan of ${sign}`,
    3: `Third decan of ${sign}`,
  };
  
  return {
    number: decanNumber,
    degrees: decanNumber === 1 ? '0°–9°' : decanNumber === 2 ? '10°–19°' : '20°–29°',
    ruler: ruler.planet,
    rulerSymbol: ruler.symbol,
    quality: DECAN_QUALITIES[decanNumber],
    description: descriptions[decanNumber],
  };
};

/**
 * Get a short label for a decan
 */
export const getDecanLabel = (degree: number, sign: string): string => {
  const decan = getDecan(degree, sign);
  return `${decan.number}${decan.number === 1 ? 'st' : decan.number === 2 ? 'nd' : 'rd'} Decan (${decan.rulerSymbol} ${decan.ruler})`;
};

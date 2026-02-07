// Lauren Newman's 2026 Transit Calendar Data
// Parsed from Astrodienst D4912 Transit Calendar
// Born: October 21, 1976, 7:12 AM, Washington DC

// Natal positions for reference
export const natalPositions = {
  Sun: { degree: 28.18, sign: 'Libra' },
  Moon: { degree: 3.56, sign: 'Scorpio' },
  Mercury: { degree: 16.94, sign: 'Scorpio' },
  Venus: { degree: 0.91, sign: 'Sagittarius' },
  Mars: { degree: 8.61, sign: 'Scorpio' },
  Jupiter: { degree: 29.57, sign: 'Taurus' },
  Saturn: { degree: 15.61, sign: 'Leo' },
  Chiron: { degree: 29.65, sign: 'Aries' },
  Uranus: { degree: 6.90, sign: 'Scorpio' },
  Neptune: { degree: 12.11, sign: 'Sagittarius' },
  Pluto: { degree: 12.24, sign: 'Libra' },
  Ascendant: { degree: 24.94, sign: 'Libra' },
  Midheaven: { degree: 28.86, sign: 'Cancer' }
};

// Planet codes used in Astrodienst notation
const planetCodes: Record<string, string> = {
  'A': 'Sun', 'B': 'Moon', 'C': 'Mercury', 'D': 'Venus', 'E': 'Mars',
  'F': 'Jupiter', 'G': 'Saturn', 'H': 'House Cusp', 'I': 'Neptune',
  'J': 'Pluto', 'N': 'Chiron', 'O': 'Uranus', 'Q': 'Ascendant', 'T': 'Midheaven'
};

// Aspect codes
const aspectCodes: Record<string, { name: string; symbol: string; angle: number }> = {
  'm': { name: 'Conjunction', symbol: '☌', angle: 0 },
  'n': { name: 'Opposition', symbol: '☍', angle: 180 },
  'o': { name: 'Square', symbol: '□', angle: 90 },
  'p': { name: 'Trine', symbol: '△', angle: 120 },
  'q': { name: 'Sextile', symbol: '⚹', angle: 60 },
  'r': { name: 'Semi-Sextile', symbol: '⚺', angle: 30 },
  's': { name: 'Quincunx', symbol: '⚻', angle: 150 },
  't': { name: 'Semi-Square', symbol: '∠', angle: 45 },
  'u': { name: 'Sesquiquadrate', symbol: '⚼', angle: 135 }
};

// Sign codes
const signCodes: Record<string, string> = {
  'a': 'Aries', 'b': 'Taurus', 'c': 'Gemini', 'd': 'Cancer',
  'e': 'Leo', 'f': 'Virgo', 'g': 'Libra', 'h': 'Scorpio',
  'i': 'Sagittarius', 'j': 'Capricorn', 'k': 'Aquarius', 'l': 'Pisces'
};

export interface TransitEvent {
  id: string;
  transitPlanet: string;
  aspect: string;
  aspectSymbol: string;
  natalPlanet: string;
  date: Date;
  time: string;
  transitSign: string;
  isExact: boolean;
  significance: 'major' | 'moderate' | 'minor';
  category: 'outer' | 'social' | 'personal';
}

// Helper to determine significance
function getSignificance(transitPlanet: string, natalPlanet: string, aspect: string): 'major' | 'moderate' | 'minor' {
  const outerPlanets = ['Pluto', 'Neptune', 'Uranus'];
  const majorAspects = ['Conjunction', 'Opposition', 'Square', 'Trine'];
  const personalPoints = ['Sun', 'Moon', 'Ascendant', 'Midheaven', 'Mercury', 'Venus', 'Mars'];
  
  if (outerPlanets.includes(transitPlanet) && personalPoints.includes(natalPlanet) && majorAspects.includes(aspect)) {
    return 'major';
  }
  if ((transitPlanet === 'Saturn' || transitPlanet === 'Jupiter') && personalPoints.includes(natalPlanet)) {
    return 'moderate';
  }
  return 'minor';
}

function getCategory(planet: string): 'outer' | 'social' | 'personal' {
  if (['Pluto', 'Neptune', 'Uranus'].includes(planet)) return 'outer';
  if (['Saturn', 'Jupiter', 'Chiron'].includes(planet)) return 'social';
  return 'personal';
}

// Parse a single transit notation like "JpB2713:40k"
function parseTransitNotation(notation: string, month: number, year: number): TransitEvent | null {
  // Remove any markers like « or # or trailing punctuation
  const cleaned = notation.replace(/[«»#]/g, '').trim();
  if (cleaned.length < 3) return null;
  
  // Pattern: TransitPlanet + Aspect + NatalPlanet + Day + Time + Sign
  // Example: JpB2713:40k = Pluto trine Moon on 27th at 13:40 in Aquarius
  const match = cleaned.match(/^([A-Z])([a-z])([A-Z])(\d{1,2})?(\d{2}:\d{2})?([a-l])?$/);
  if (!match) {
    // Try alternate pattern without time
    const altMatch = cleaned.match(/^([A-Z])([a-z])([A-Z])([a-l])?$/);
    if (altMatch) {
      const [, transitCode, aspectCode, natalCode, signCode] = altMatch;
      const transitPlanet = planetCodes[transitCode];
      const aspectInfo = aspectCodes[aspectCode];
      const natalPlanet = planetCodes[natalCode];
      const transitSign = signCode ? signCodes[signCode] : 'Unknown';
      
      if (!transitPlanet || !aspectInfo || !natalPlanet) return null;
      
      return {
        id: `${year}-${month}-ongoing-${notation}`,
        transitPlanet,
        aspect: aspectInfo.name,
        aspectSymbol: aspectInfo.symbol,
        natalPlanet,
        date: new Date(year, month, 15), // Middle of month for ongoing transits
        time: 'ongoing',
        transitSign,
        isExact: false,
        significance: getSignificance(transitPlanet, natalPlanet, aspectInfo.name),
        category: getCategory(transitPlanet)
      };
    }
    return null;
  }
  
  const [, transitCode, aspectCode, natalCode, dayStr, timeStr, signCode] = match;
  
  const transitPlanet = planetCodes[transitCode];
  const aspectInfo = aspectCodes[aspectCode];
  const natalPlanet = planetCodes[natalCode];
  const day = dayStr ? parseInt(dayStr) : 15;
  const time = timeStr || '';
  const transitSign = signCode ? signCodes[signCode] : 'Unknown';
  
  if (!transitPlanet || !aspectInfo || !natalPlanet) return null;
  
  return {
    id: `${year}-${month}-${day}-${notation}`,
    transitPlanet,
    aspect: aspectInfo.name,
    aspectSymbol: aspectInfo.symbol,
    natalPlanet,
    date: new Date(year, month, day),
    time,
    transitSign,
    isExact: !!timeStr,
    significance: getSignificance(transitPlanet, natalPlanet, aspectInfo.name),
    category: getCategory(transitPlanet)
  };
}

// Major transits for 2026 - manually extracted from the PDF for accuracy
export const majorTransits2026: TransitEvent[] = [
  // PLUTO transits (most significant)
  {
    id: 'pluto-trine-moon-jan',
    transitPlanet: 'Pluto',
    aspect: 'Trine',
    aspectSymbol: '△',
    natalPlanet: 'Moon',
    date: new Date(2026, 0, 27),
    time: '13:40',
    transitSign: 'Aquarius',
    isExact: true,
    significance: 'major',
    category: 'outer'
  },
  {
    id: 'pluto-trine-moon-jul',
    transitPlanet: 'Pluto',
    aspect: 'Trine',
    aspectSymbol: '△',
    natalPlanet: 'Moon',
    date: new Date(2026, 6, 29),
    time: '02:57',
    transitSign: 'Aquarius',
    isExact: true,
    significance: 'major',
    category: 'outer'
  },
  {
    id: 'pluto-trine-moon-oct',
    transitPlanet: 'Pluto',
    aspect: 'Trine',
    aspectSymbol: '△',
    natalPlanet: 'Moon',
    date: new Date(2026, 9, 30),
    time: '23:28',
    transitSign: 'Aquarius',
    isExact: true,
    significance: 'major',
    category: 'outer'
  },
  
  // NEPTUNE transits
  {
    id: 'neptune-trine-venus-jan',
    transitPlanet: 'Neptune',
    aspect: 'Trine',
    aspectSymbol: '△',
    natalPlanet: 'Venus',
    date: new Date(2026, 0, 24),
    time: '21:26',
    transitSign: 'Aries',
    isExact: true,
    significance: 'major',
    category: 'outer'
  },
  {
    id: 'neptune-conjunction-chiron',
    transitPlanet: 'Neptune',
    aspect: 'Conjunction',
    aspectSymbol: '☌',
    natalPlanet: 'Chiron',
    date: new Date(2026, 3, 10),
    time: '22:06',
    transitSign: 'Aries',
    isExact: true,
    significance: 'major',
    category: 'outer'
  },
  {
    id: 'neptune-conjunction-asc',
    transitPlanet: 'Neptune',
    aspect: 'Opposition',
    aspectSymbol: '☍',
    natalPlanet: 'Ascendant',
    date: new Date(2026, 0, 18),
    time: '07:16',
    transitSign: 'Aries',
    isExact: true,
    significance: 'major',
    category: 'outer'
  },
  {
    id: 'neptune-quincunx-neptune',
    transitPlanet: 'Neptune',
    aspect: 'Quincunx',
    aspectSymbol: '⚻',
    natalPlanet: 'Neptune',
    date: new Date(2026, 3, 24),
    time: '08:27',
    transitSign: 'Aries',
    isExact: true,
    significance: 'moderate',
    category: 'outer'
  },
  
  // URANUS transits
  {
    id: 'uranus-opposition-uranus',
    transitPlanet: 'Uranus',
    aspect: 'Opposition',
    aspectSymbol: '☍',
    natalPlanet: 'Uranus',
    date: new Date(2026, 3, 11),
    time: '22:34',
    transitSign: 'Gemini',
    isExact: true,
    significance: 'major',
    category: 'outer'
  },
  {
    id: 'uranus-opposition-venus',
    transitPlanet: 'Uranus',
    aspect: 'Opposition',
    aspectSymbol: '☍',
    natalPlanet: 'Venus',
    date: new Date(2026, 3, 11),
    time: '22:34',
    transitSign: 'Gemini',
    isExact: true,
    significance: 'major',
    category: 'outer'
  },
  {
    id: 'uranus-conjunction-jupiter',
    transitPlanet: 'Uranus',
    aspect: 'Conjunction',
    aspectSymbol: '☌',
    natalPlanet: 'Jupiter',
    date: new Date(2026, 3, 17),
    time: '19:01',
    transitSign: 'Taurus',
    isExact: true,
    significance: 'major',
    category: 'outer'
  },
  {
    id: 'uranus-trine-pluto',
    transitPlanet: 'Uranus',
    aspect: 'Sextile',
    aspectSymbol: '⚹',
    natalPlanet: 'Pluto',
    date: new Date(2026, 0, 27),
    time: '00:07',
    transitSign: 'Taurus',
    isExact: true,
    significance: 'major',
    category: 'outer'
  },
  
  // SATURN transits
  {
    id: 'saturn-trine-midheaven-jan',
    transitPlanet: 'Saturn',
    aspect: 'Trine',
    aspectSymbol: '△',
    natalPlanet: 'Midheaven',
    date: new Date(2026, 0, 2),
    time: '23:42',
    transitSign: 'Pisces',
    isExact: true,
    significance: 'major',
    category: 'social'
  },
  {
    id: 'saturn-opposition-moon',
    transitPlanet: 'Saturn',
    aspect: 'Opposition',
    aspectSymbol: '☍',
    natalPlanet: 'Moon',
    date: new Date(2026, 0, 15),
    time: '21:43',
    transitSign: 'Aries',
    isExact: true,
    significance: 'major',
    category: 'social'
  },
  {
    id: 'saturn-trine-venus',
    transitPlanet: 'Saturn',
    aspect: 'Trine',
    aspectSymbol: '△',
    natalPlanet: 'Venus',
    date: new Date(2026, 0, 21),
    time: '19:41',
    transitSign: 'Aries',
    isExact: true,
    significance: 'major',
    category: 'social'
  },
  {
    id: 'saturn-quincunx-sun',
    transitPlanet: 'Saturn',
    aspect: 'Quincunx',
    aspectSymbol: '⚻',
    natalPlanet: 'Sun',
    date: new Date(2026, 0, 27),
    time: '00:51',
    transitSign: 'Pisces',
    isExact: true,
    significance: 'moderate',
    category: 'social'
  },
  
  // FEBRUARY 2026 TRANSITS
  {
    id: 'saturn-sextile-jupiter-feb',
    transitPlanet: 'Saturn',
    aspect: 'Sextile',
    aspectSymbol: '⚹',
    natalPlanet: 'Jupiter',
    date: new Date(2026, 1, 5),
    time: '11:14',
    transitSign: 'Aries',
    isExact: true,
    significance: 'moderate',
    category: 'social'
  },
  {
    id: 'neptune-sextile-mars-feb',
    transitPlanet: 'Neptune',
    aspect: 'Sextile',
    aspectSymbol: '⚹',
    natalPlanet: 'Mars',
    date: new Date(2026, 1, 7),
    time: '23:16',
    transitSign: 'Aries',
    isExact: true,
    significance: 'moderate',
    category: 'outer'
  },
  {
    id: 'uranus-quincunx-mercury-feb',
    transitPlanet: 'Uranus',
    aspect: 'Quincunx',
    aspectSymbol: '⚻',
    natalPlanet: 'Mercury',
    date: new Date(2026, 1, 12),
    time: '07:33',
    transitSign: 'Taurus',
    isExact: true,
    significance: 'moderate',
    category: 'outer'
  },
  {
    id: 'jupiter-sextile-jupiter-feb',
    transitPlanet: 'Jupiter',
    aspect: 'Sextile',
    aspectSymbol: '⚹',
    natalPlanet: 'Jupiter',
    date: new Date(2026, 1, 20),
    time: '00:25',
    transitSign: 'Cancer',
    isExact: true,
    significance: 'moderate',
    category: 'social'
  },
  {
    id: 'saturn-opposition-uranus-feb',
    transitPlanet: 'Saturn',
    aspect: 'Opposition',
    aspectSymbol: '☍',
    natalPlanet: 'Uranus',
    date: new Date(2026, 1, 21),
    time: '01:33',
    transitSign: 'Aries',
    isExact: true,
    significance: 'major',
    category: 'social'
  },
  {
    id: 'uranus-opposition-mars-feb',
    transitPlanet: 'Uranus',
    aspect: 'Opposition',
    aspectSymbol: '☍',
    natalPlanet: 'Mars',
    date: new Date(2026, 1, 25),
    time: '07:11',
    transitSign: 'Taurus',
    isExact: true,
    significance: 'major',
    category: 'outer'
  },
  {
    id: 'neptune-quincunx-ascendant-feb',
    transitPlanet: 'Neptune',
    aspect: 'Quincunx',
    aspectSymbol: '⚻',
    natalPlanet: 'Ascendant',
    date: new Date(2026, 1, 28),
    time: '07:46',
    transitSign: 'Aries',
    isExact: true,
    significance: 'moderate',
    category: 'outer'
  },
  
  // MARCH 2026 TRANSITS
  {
    id: 'mercury-retrograde-begins',
    transitPlanet: 'Mercury',
    aspect: 'Station',
    aspectSymbol: '℞',
    natalPlanet: 'Pisces',
    date: new Date(2026, 2, 1),
    time: '00:00',
    transitSign: 'Pisces',
    isExact: true,
    significance: 'moderate',
    category: 'personal'
  },
  {
    id: 'saturn-quincunx-mercury-mar',
    transitPlanet: 'Saturn',
    aspect: 'Quincunx',
    aspectSymbol: '⚻',
    natalPlanet: 'Mercury',
    date: new Date(2026, 2, 7),
    time: '07:32',
    transitSign: 'Aries',
    isExact: true,
    significance: 'moderate',
    category: 'social'
  },
  {
    id: 'neptune-semi-sextile-chiron-mar',
    transitPlanet: 'Neptune',
    aspect: 'Semi-Sextile',
    aspectSymbol: '⚺',
    natalPlanet: 'Chiron',
    date: new Date(2026, 2, 10),
    time: '06:24',
    transitSign: 'Aries',
    isExact: true,
    significance: 'moderate',
    category: 'outer'
  },
  {
    id: 'jupiter-trine-uranus-mar',
    transitPlanet: 'Jupiter',
    aspect: 'Trine',
    aspectSymbol: '△',
    natalPlanet: 'Uranus',
    date: new Date(2026, 2, 18),
    time: '02:31',
    transitSign: 'Cancer',
    isExact: true,
    significance: 'major',
    category: 'social'
  },
  {
    id: 'saturn-quincunx-pluto-mar',
    transitPlanet: 'Saturn',
    aspect: 'Quincunx',
    aspectSymbol: '⚻',
    natalPlanet: 'Pluto',
    date: new Date(2026, 2, 14),
    time: '14:58',
    transitSign: 'Aries',
    isExact: true,
    significance: 'major',
    category: 'social'
  },
  {
    id: 'mercury-retrograde-ends',
    transitPlanet: 'Mercury',
    aspect: 'Station Direct',
    aspectSymbol: '℞D',
    natalPlanet: 'Pisces',
    date: new Date(2026, 2, 24),
    time: '00:00',
    transitSign: 'Pisces',
    isExact: true,
    significance: 'moderate',
    category: 'personal'
  },
  {
    id: 'uranus-opposition-midheaven-mar',
    transitPlanet: 'Uranus',
    aspect: 'Trine',
    aspectSymbol: '△',
    natalPlanet: 'Midheaven',
    date: new Date(2026, 2, 19),
    time: '07:14',
    transitSign: 'Taurus',
    isExact: true,
    significance: 'major',
    category: 'outer'
  },
  {
    id: 'saturn-opposition-pluto',
    transitPlanet: 'Saturn',
    aspect: 'Opposition',
    aspectSymbol: '☍',
    natalPlanet: 'Pluto',
    date: new Date(2026, 3, 31),
    time: '19:41',
    transitSign: 'Aries',
    isExact: true,
    significance: 'major',
    category: 'social'
  },
  {
    id: 'saturn-trine-neptune',
    transitPlanet: 'Saturn',
    aspect: 'Trine',
    aspectSymbol: '△',
    natalPlanet: 'Neptune',
    date: new Date(2026, 3, 30),
    time: '07:05',
    transitSign: 'Aries',
    isExact: true,
    significance: 'moderate',
    category: 'social'
  },
  
  // JUPITER transits  
  {
    id: 'jupiter-square-mercury',
    transitPlanet: 'Jupiter',
    aspect: 'Square',
    aspectSymbol: '□',
    natalPlanet: 'Mercury',
    date: new Date(2026, 0, 4),
    time: '16:40',
    transitSign: 'Cancer',
    isExact: true,
    significance: 'moderate',
    category: 'social'
  },
  {
    id: 'jupiter-square-ascendant',
    transitPlanet: 'Jupiter',
    aspect: 'Square',
    aspectSymbol: '□',
    natalPlanet: 'Ascendant',
    date: new Date(2026, 0, 20),
    time: '23:23',
    transitSign: 'Cancer',
    isExact: true,
    significance: 'moderate',
    category: 'social'
  },
  {
    id: 'jupiter-conjunction-midheaven',
    transitPlanet: 'Jupiter',
    aspect: 'Conjunction',
    aspectSymbol: '☌',
    natalPlanet: 'Midheaven',
    date: new Date(2026, 3, 24),
    time: '16:53',
    transitSign: 'Cancer',
    isExact: true,
    significance: 'major',
    category: 'social'
  },
  {
    id: 'jupiter-trine-sun',
    transitPlanet: 'Jupiter',
    aspect: 'Trine',
    aspectSymbol: '△',
    natalPlanet: 'Sun',
    date: new Date(2026, 3, 21),
    time: '11:31',
    transitSign: 'Cancer',
    isExact: true,
    significance: 'major',
    category: 'social'
  },
  {
    id: 'jupiter-square-venus',
    transitPlanet: 'Jupiter',
    aspect: 'Quincunx',
    aspectSymbol: '⚻',
    natalPlanet: 'Venus',
    date: new Date(2026, 0, 16),
    time: '11:11',
    transitSign: 'Cancer',
    isExact: true,
    significance: 'moderate',
    category: 'social'
  },
  
  // CHIRON transits
  {
    id: 'chiron-conjunction-chiron',
    transitPlanet: 'Chiron',
    aspect: 'Conjunction',
    aspectSymbol: '☌',
    natalPlanet: 'Chiron',
    date: new Date(2026, 3, 10),
    time: '22:06',
    transitSign: 'Aries',
    isExact: true,
    significance: 'major',
    category: 'social'
  },
  {
    id: 'chiron-opposition-ascendant',
    transitPlanet: 'Chiron',
    aspect: 'Opposition',
    aspectSymbol: '☍',
    natalPlanet: 'Ascendant',
    date: new Date(2026, 3, 12),
    time: '17:00',
    transitSign: 'Aries',
    isExact: true,
    significance: 'moderate',
    category: 'social'
  }
];

// Monthly breakdown of all transits
export const monthlyTransitSummary: Record<string, { month: string; majorCount: number; themes: string[] }> = {
  'January 2026': {
    month: 'January',
    majorCount: 8,
    themes: ['Pluto trine Moon begins', 'Saturn opposite Moon', 'Neptune entering new phase', 'Uranus sextile Pluto']
  },
  'February 2026': {
    month: 'February',
    majorCount: 5,
    themes: ['Mercury retrograde in Pisces (Mar 1-24)', 'Venus aspects intensify', 'Saturn continues']
  },
  'March 2026': {
    month: 'March',
    majorCount: 6,
    themes: ['Mercury retrograde mid-cycle', 'Neptune aspects build', 'Eclipse season approaching']
  },
  'April 2026': {
    month: 'April',
    majorCount: 10,
    themes: ['Chiron return exact', 'Neptune conjunct Chiron', 'Jupiter conjunct MC', 'Uranus opposite Venus']
  },
  'May 2026': {
    month: 'May',
    majorCount: 7,
    themes: ['Uranus ingress themes', 'Saturn aspects Neptune natal', 'Personal planet activations']
  },
  'June 2026': {
    month: 'June',
    majorCount: 5,
    themes: ['Summer gateway', 'Mars transits intensify', 'Jupiter themes continue']
  },
  'July 2026': {
    month: 'July',
    majorCount: 6,
    themes: ['Pluto trine Moon second pass', 'Outer planet retrogrades', 'Career focus']
  },
  'August 2026': {
    month: 'August',
    majorCount: 4,
    themes: ['Integration period', 'Personal planet aspects', 'Creative expression']
  },
  'September 2026': {
    month: 'September',
    majorCount: 5,
    themes: ['Eclipse season', 'Saturn station', 'Relationship themes']
  },
  'October 2026': {
    month: 'October',
    majorCount: 7,
    themes: ['Solar return month', 'Pluto trine Moon final pass', 'Birthday transits']
  },
  'November 2026': {
    month: 'November',
    majorCount: 5,
    themes: ['Post-birthday integration', 'Neptune themes', 'Year-end planning']
  },
  'December 2026': {
    month: 'December',
    majorCount: 4,
    themes: ['Year completion', 'Saturn ingress prep', 'Reflection period']
  }
};

// Key dates for the year
export const keyDates2026 = [
  { date: new Date(2026, 0, 15), event: 'Saturn opposite natal Moon', significance: 'major' as const },
  { date: new Date(2026, 0, 27), event: 'Pluto trine natal Moon (1st pass)', significance: 'major' as const },
  { date: new Date(2026, 1, 17), event: 'Solar Eclipse in Aquarius (28°49\')', significance: 'major' as const },
  { date: new Date(2026, 1, 21), event: 'Saturn opposite natal Uranus', significance: 'major' as const },
  { date: new Date(2026, 1, 25), event: 'Uranus opposite natal Mars', significance: 'major' as const },
  { date: new Date(2026, 2, 1), event: 'Mercury retrograde begins in Pisces', significance: 'moderate' as const },
  { date: new Date(2026, 2, 3), event: 'Lunar Eclipse in Virgo', significance: 'major' as const },
  { date: new Date(2026, 2, 18), event: 'Jupiter trine natal Uranus', significance: 'major' as const },
  { date: new Date(2026, 2, 24), event: 'Mercury retrograde ends', significance: 'moderate' as const },
  { date: new Date(2026, 3, 10), event: 'Chiron return exact + Neptune conjunct', significance: 'major' as const },
  { date: new Date(2026, 3, 11), event: 'Uranus opposite natal Venus & Uranus', significance: 'major' as const },
  { date: new Date(2026, 3, 17), event: 'Uranus conjunct natal Jupiter', significance: 'major' as const },
  { date: new Date(2026, 3, 24), event: 'Jupiter conjunct natal Midheaven', significance: 'major' as const },
  { date: new Date(2026, 3, 30), event: 'Saturn trine natal Neptune', significance: 'moderate' as const },
  { date: new Date(2026, 6, 29), event: 'Pluto trine natal Moon (2nd pass)', significance: 'major' as const },
  { date: new Date(2026, 9, 21), event: 'Solar Return', significance: 'major' as const },
  { date: new Date(2026, 9, 30), event: 'Pluto trine natal Moon (3rd pass)', significance: 'major' as const }
];

// Export utility functions
export function getTransitsForMonth(month: number, year: number = 2026): TransitEvent[] {
  return majorTransits2026.filter(t => 
    t.date.getMonth() === month && t.date.getFullYear() === year
  ).sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function getTransitsForDate(date: Date): TransitEvent[] {
  return majorTransits2026.filter(t => 
    t.date.getFullYear() === date.getFullYear() &&
    t.date.getMonth() === date.getMonth() &&
    t.date.getDate() === date.getDate()
  );
}

export function getMajorTransits(): TransitEvent[] {
  return majorTransits2026.filter(t => t.significance === 'major');
}

export function getTransitsByPlanet(planet: string): TransitEvent[] {
  return majorTransits2026.filter(t => t.transitPlanet === planet);
}

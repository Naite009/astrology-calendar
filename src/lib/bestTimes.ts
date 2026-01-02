import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { getPlanetaryPositions, isMercuryRetrograde, getVoidOfCourseMoon, getMoonPhase } from './astrology';

export type BestTimesCategory = 'love' | 'finance' | 'health' | 'beauty' | 'career' | 'travel';

export interface BestTimeResult {
  date: Date;
  score: number;
  reasons: string[];
  rating: string;
}

interface CategoryRules {
  favorablePlanets: string[];
  favorableAspects: string[];
  favorableSigns: string[];
  natalPlanetsToCheck: string[];
  avoidMercuryRetrograde?: boolean;
}

const CATEGORY_RULES: Record<BestTimesCategory, CategoryRules> = {
  love: {
    favorablePlanets: ['Venus', 'Moon'],
    favorableAspects: ['trine', 'sextile', 'conjunction'],
    favorableSigns: ['Libra', 'Taurus', 'Cancer', 'Pisces'],
    natalPlanetsToCheck: ['Sun', 'Venus', 'Moon', 'Ascendant'],
  },
  finance: {
    favorablePlanets: ['Jupiter', 'Sun', 'Venus'],
    favorableAspects: ['trine', 'sextile'],
    favorableSigns: ['Taurus', 'Capricorn', 'Virgo'],
    natalPlanetsToCheck: ['Sun', 'Jupiter', 'Saturn'],
  },
  health: {
    favorablePlanets: ['Mars', 'Sun'],
    favorableAspects: ['trine', 'sextile'],
    favorableSigns: ['Aries', 'Leo', 'Sagittarius'],
    natalPlanetsToCheck: ['Mars', 'Sun', 'Ascendant'],
  },
  beauty: {
    favorablePlanets: ['Venus', 'Moon'],
    favorableAspects: ['trine', 'sextile', 'conjunction'],
    favorableSigns: ['Taurus', 'Libra', 'Leo'],
    natalPlanetsToCheck: ['Venus', 'Ascendant'],
  },
  career: {
    favorablePlanets: ['Saturn', 'Sun', 'Jupiter'],
    favorableAspects: ['trine', 'sextile'],
    favorableSigns: ['Capricorn', 'Virgo', 'Leo'],
    natalPlanetsToCheck: ['Sun', 'Saturn', 'Mercury'],
  },
  travel: {
    favorablePlanets: ['Jupiter', 'Sun'],
    favorableAspects: ['trine', 'sextile'],
    favorableSigns: ['Sagittarius', 'Gemini', 'Aquarius'],
    natalPlanetsToCheck: ['Jupiter', 'Sun'],
    avoidMercuryRetrograde: true,
  },
};

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const degreesToLongitude = (degree: number, signName: string): number => {
  const signIndex = ZODIAC_SIGNS.indexOf(signName);
  return signIndex * 30 + degree;
};

interface AspectResult {
  type: string;
  symbol: string;
  orb: string;
  score: number;
}

const calculateAspectBetween = (planet1: NatalPlanetPosition, planet2Lon: number): AspectResult | null => {
  const lon1 = degreesToLongitude(planet1.degree + (planet1.minutes / 60), planet1.sign);
  const diff = Math.abs(((planet2Lon - lon1 + 180) % 360) - 180);

  const aspects = [
    { angle: 0, type: 'conjunction', symbol: '☌', orb: 8, score: 30 },
    { angle: 60, type: 'sextile', symbol: '⚹', orb: 6, score: 25 },
    { angle: 90, type: 'square', symbol: '□', orb: 8, score: -20 },
    { angle: 120, type: 'trine', symbol: '△', orb: 8, score: 35 },
    { angle: 180, type: 'opposition', symbol: '☍', orb: 8, score: -15 },
  ];

  for (const aspect of aspects) {
    const orbDiff = Math.abs(diff - aspect.angle);
    if (orbDiff < aspect.orb) {
      return { 
        type: aspect.type, 
        symbol: aspect.symbol, 
        orb: orbDiff.toFixed(1), 
        score: aspect.score 
      };
    }
  }

  return null;
};

export const calculateBestTimes = (
  category: BestTimesCategory,
  natalChart: NatalChart | null,
  startDate: Date,
  endDate: Date
): BestTimeResult[] => {
  const bestTimes: BestTimeResult[] = [];
  const rules = CATEGORY_RULES[category];

  // Sample every 4 hours instead of every hour for performance
  const hoursStep = 4;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    let score = 0;
    const reasons: string[] = [];

    const transitPlanets = getPlanetaryPositions(currentDate);
    const moonPhase = getMoonPhase(currentDate);

    // Check transits to natal planets
    if (natalChart && natalChart.planets) {
      rules.natalPlanetsToCheck.forEach(natalPlanetName => {
        const natalPos = natalChart.planets[natalPlanetName as keyof typeof natalChart.planets];
        if (!natalPos) return;

        rules.favorablePlanets.forEach(transitPlanetName => {
          const transitKey = transitPlanetName.toLowerCase() as keyof typeof transitPlanets;
          const transitPos = transitPlanets[transitKey];
          if (!transitPos) return;

          const transitLon = ZODIAC_SIGNS.indexOf(transitPos.signName) * 30 + transitPos.degree;
          const aspect = calculateAspectBetween(natalPos, transitLon);

          if (aspect && rules.favorableAspects.includes(aspect.type)) {
            score += aspect.score;
            reasons.push(`${transitPlanetName} ${aspect.symbol} Your ${natalPlanetName}`);
          }
        });
      });
    }

    // Check moon sign
    const moonSign = transitPlanets.moon.signName;
    if (rules.favorableSigns.includes(moonSign)) {
      score += 15;
      reasons.push(`Moon in ${moonSign}`);
    }

    // Check void of course (reduce score)
    const voc = getVoidOfCourseMoon(moonPhase);
    if (voc.isVOC) {
      score -= 20;
      reasons.push('Moon Void of Course (avoid)');
    }

    // Check mercury retrograde for travel
    if (rules.avoidMercuryRetrograde && isMercuryRetrograde(currentDate)) {
      score -= 25;
      reasons.push('Mercury Retrograde (avoid for travel)');
    }

    // Bonus for waxing moon (good for new beginnings)
    if (moonPhase.phaseName.includes('Waxing')) {
      score += 10;
      reasons.push('Waxing Moon (building energy)');
    }

    // Penalty for balsamic moon
    if (moonPhase.isBalsamic) {
      score -= 15;
      reasons.push('Balsamic Moon (rest period)');
    }

    if (score > 30) {
      bestTimes.push({
        date: new Date(currentDate),
        score,
        reasons,
        rating: score > 70 ? '★★★' : score > 50 ? '★★' : '★',
      });
    }

    currentDate.setHours(currentDate.getHours() + hoursStep);
  }

  // Sort by score and return top 15
  return bestTimes.sort((a, b) => b.score - a.score).slice(0, 15);
};

export const CATEGORY_INFO: Record<BestTimesCategory, { emoji: string; label: string }> = {
  love: { emoji: '💕', label: 'Love & Romance' },
  finance: { emoji: '💰', label: 'Finance' },
  health: { emoji: '🏃', label: 'Health & Exercise' },
  beauty: { emoji: '💅', label: 'Beauty & Self-Care' },
  career: { emoji: '💼', label: 'Career & Business' },
  travel: { emoji: '✈️', label: 'Travel' },
};

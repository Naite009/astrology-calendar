import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { getPlanetaryPositions, isMercuryRetrograde, getVoidOfCourseMoon, getMoonPhase } from './astrology';
import { isTimeVOC } from './voidOfCourseMoon';
import { getPlanetaryHourAt } from './planetaryHours';
import { getRetrogradeStatus, getMarsRetrogrades, getMercuryRetrogrades } from './retrogradePatterns';
import { calculateSolarArcChart, findSolarArcAspects, getExactSolarArcAspects } from './solarArcDirections';
import { calculateSecondaryProgressions, getProgressedMoonInfo } from './secondaryProgressions';

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

// Get transit planetary positions with actual longitudes for the wheel
export interface TransitPosition {
  name: string;
  longitude: number;
  sign: string;
  degree: number;
}

export const getTransitPositions = (date: Date): TransitPosition[] => {
  const planets = getPlanetaryPositions(date);
  
  return [
    { name: 'Sun', longitude: ZODIAC_SIGNS.indexOf(planets.sun.signName) * 30 + planets.sun.degree, sign: planets.sun.signName, degree: planets.sun.degree },
    { name: 'Moon', longitude: ZODIAC_SIGNS.indexOf(planets.moon.signName) * 30 + planets.moon.degree, sign: planets.moon.signName, degree: planets.moon.degree },
    { name: 'Mercury', longitude: ZODIAC_SIGNS.indexOf(planets.mercury.signName) * 30 + planets.mercury.degree, sign: planets.mercury.signName, degree: planets.mercury.degree },
    { name: 'Venus', longitude: ZODIAC_SIGNS.indexOf(planets.venus.signName) * 30 + planets.venus.degree, sign: planets.venus.signName, degree: planets.venus.degree },
    { name: 'Mars', longitude: ZODIAC_SIGNS.indexOf(planets.mars.signName) * 30 + planets.mars.degree, sign: planets.mars.signName, degree: planets.mars.degree },
    { name: 'Jupiter', longitude: ZODIAC_SIGNS.indexOf(planets.jupiter.signName) * 30 + planets.jupiter.degree, sign: planets.jupiter.signName, degree: planets.jupiter.degree },
    { name: 'Saturn', longitude: ZODIAC_SIGNS.indexOf(planets.saturn.signName) * 30 + planets.saturn.degree, sign: planets.saturn.signName, degree: planets.saturn.degree },
  ];
};

// Get current aspects for visualization
export interface CollectiveAspect {
  planet1: string;
  planet2: string;
  type: string;
  symbol: string;
  angle: number;
  description: string;
  orb: number;
  isExact: boolean; // within 1° orb
  isApplying: boolean; // true if orb is decreasing (aspect building)
  isSeparating: boolean; // true if orb is increasing (aspect waning)
  motion: 'applying' | 'separating' | 'stationary';
}

export const getCurrentAspects = (date: Date): CollectiveAspect[] => {
  const planets = getPlanetaryPositions(date);
  
  // Get positions 1 hour later to determine motion
  const futureDate = new Date(date.getTime() + 60 * 60 * 1000);
  const futurePlanets = getPlanetaryPositions(futureDate);
  
  const aspects: CollectiveAspect[] = [];
  
  const planetList = [
    { name: 'Sun', pos: planets.sun, futurePos: futurePlanets.sun },
    { name: 'Moon', pos: planets.moon, futurePos: futurePlanets.moon },
    { name: 'Mercury', pos: planets.mercury, futurePos: futurePlanets.mercury },
    { name: 'Venus', pos: planets.venus, futurePos: futurePlanets.venus },
    { name: 'Mars', pos: planets.mars, futurePos: futurePlanets.mars },
    { name: 'Jupiter', pos: planets.jupiter, futurePos: futurePlanets.jupiter },
    { name: 'Saturn', pos: planets.saturn, futurePos: futurePlanets.saturn },
    { name: 'Uranus', pos: planets.uranus, futurePos: futurePlanets.uranus },
    { name: 'Neptune', pos: planets.neptune, futurePos: futurePlanets.neptune },
    { name: 'Pluto', pos: planets.pluto, futurePos: futurePlanets.pluto },
    { name: 'Chiron', pos: planets.chiron, futurePos: futurePlanets.chiron },
  ];

  const aspectDefs = [
    { angle: 0, type: 'conjunction', symbol: '☌', orb: 8, desc: 'Planets merge energy - intensified power' },
    { angle: 60, type: 'sextile', symbol: '⚹', orb: 6, desc: 'Harmonious opportunity - easy flow' },
    { angle: 90, type: 'square', symbol: '□', orb: 8, desc: 'Tension & challenge - drives action' },
    { angle: 120, type: 'trine', symbol: '△', orb: 8, desc: 'Natural harmony - gifts & talents' },
    { angle: 180, type: 'opposition', symbol: '☍', orb: 8, desc: 'Polarity & awareness - balance needed' },
  ];

  for (let i = 0; i < planetList.length; i++) {
    for (let j = i + 1; j < planetList.length; j++) {
      const p1 = planetList[i];
      const p2 = planetList[j];
      
      // Skip if either planet position is missing
      if (!p1.pos || !p2.pos || !p1.futurePos || !p2.futurePos) continue;
      
      const lon1 = ZODIAC_SIGNS.indexOf(p1.pos.signName) * 30 + p1.pos.degree;
      const lon2 = ZODIAC_SIGNS.indexOf(p2.pos.signName) * 30 + p2.pos.degree;
      const diff = Math.abs(((lon2 - lon1 + 180) % 360) - 180);
      
      // Calculate future positions for motion detection
      const futureLon1 = ZODIAC_SIGNS.indexOf(p1.futurePos.signName) * 30 + p1.futurePos.degree;
      const futureLon2 = ZODIAC_SIGNS.indexOf(p2.futurePos.signName) * 30 + p2.futurePos.degree;
      const futureDiff = Math.abs(((futureLon2 - futureLon1 + 180) % 360) - 180);

      for (const aspectDef of aspectDefs) {
        const orbDiff = Math.abs(diff - aspectDef.angle);
        if (orbDiff < aspectDef.orb) {
          const isExact = orbDiff <= 1;
          
          // Determine if applying or separating
          const currentOrbToExact = Math.abs(diff - aspectDef.angle);
          const futureOrbToExact = Math.abs(futureDiff - aspectDef.angle);
          
          const isApplying = futureOrbToExact < currentOrbToExact;
          const isSeparating = futureOrbToExact > currentOrbToExact;
          const motion: 'applying' | 'separating' | 'stationary' = 
            isApplying ? 'applying' : 
            isSeparating ? 'separating' : 
            'stationary';
          
          aspects.push({
            planet1: p1.name,
            planet2: p2.name,
            type: aspectDef.type,
            symbol: aspectDef.symbol,
            angle: aspectDef.angle,
            description: isExact 
              ? `EXACT: ${aspectDef.desc}` 
              : aspectDef.desc,
            orb: Math.round(orbDiff * 10) / 10,
            isExact,
            isApplying,
            isSeparating,
            motion
          });
          break;
        }
      }
    }
  }

  // Sort by orb (tightest first) to prioritize exact aspects
  return aspects.sort((a, b) => a.orb - b.orb);
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

    // For personalized charts: Check transits to natal planets
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
    } else {
      // COLLECTIVE ASTROLOGY: Use current planetary transits and aspects between them
      
      // Check if Venus is in a favorable sign for love/beauty
      if ((category === 'love' || category === 'beauty') && rules.favorableSigns.includes(transitPlanets.venus.signName)) {
        score += 20;
        reasons.push(`Venus in ${transitPlanets.venus.signName}`);
      }
      
      // Check if Jupiter is in a favorable sign for finance/travel
      if ((category === 'finance' || category === 'travel') && rules.favorableSigns.includes(transitPlanets.jupiter.signName)) {
        score += 20;
        reasons.push(`Jupiter in ${transitPlanets.jupiter.signName}`);
      }
      
      // Check if Mars is in a favorable sign for health/career
      if ((category === 'health' || category === 'career') && rules.favorableSigns.includes(transitPlanets.mars.signName)) {
        score += 20;
        reasons.push(`Mars in ${transitPlanets.mars.signName}`);
      }
      
      // Check Sun position for career
      if (category === 'career' && rules.favorableSigns.includes(transitPlanets.sun.signName)) {
        score += 15;
        reasons.push(`Sun in ${transitPlanets.sun.signName}`);
      }
      
      // Check aspects between transiting planets (collective energy)
      const venusLon = ZODIAC_SIGNS.indexOf(transitPlanets.venus.signName) * 30 + transitPlanets.venus.degree;
      const jupiterLon = ZODIAC_SIGNS.indexOf(transitPlanets.jupiter.signName) * 30 + transitPlanets.jupiter.degree;
      const marsLon = ZODIAC_SIGNS.indexOf(transitPlanets.mars.signName) * 30 + transitPlanets.mars.degree;
      const sunLon = ZODIAC_SIGNS.indexOf(transitPlanets.sun.signName) * 30 + transitPlanets.sun.degree;
      const moonLon = ZODIAC_SIGNS.indexOf(transitPlanets.moon.signName) * 30 + transitPlanets.moon.degree;
      
      // Venus-Jupiter aspects (great for love, finance, beauty)
      const vjDiff = Math.abs(((venusLon - jupiterLon + 180) % 360) - 180);
      if (vjDiff < 8 || Math.abs(vjDiff - 120) < 8 || Math.abs(vjDiff - 60) < 6) {
        if (category === 'love' || category === 'finance' || category === 'beauty') {
          score += 25;
          reasons.push('Venus-Jupiter harmony');
        }
      }
      
      // Moon-Venus aspects (love, beauty)
      const mvDiff = Math.abs(((moonLon - venusLon + 180) % 360) - 180);
      if (mvDiff < 8 || Math.abs(mvDiff - 120) < 8 || Math.abs(mvDiff - 60) < 6) {
        if (category === 'love' || category === 'beauty') {
          score += 20;
          reasons.push('Moon-Venus harmony');
        }
      }
      
      // Sun-Mars aspects (health, career)
      const smDiff = Math.abs(((sunLon - marsLon + 180) % 360) - 180);
      if (Math.abs(smDiff - 120) < 8 || Math.abs(smDiff - 60) < 6) {
        if (category === 'health' || category === 'career') {
          score += 20;
          reasons.push('Sun-Mars energy boost');
        }
      }
      
      // Sun-Jupiter aspects (career, travel, finance)
      const sjDiff = Math.abs(((sunLon - jupiterLon + 180) % 360) - 180);
      if (sjDiff < 8 || Math.abs(sjDiff - 120) < 8 || Math.abs(sjDiff - 60) < 6) {
        if (category === 'career' || category === 'travel' || category === 'finance') {
          score += 25;
          reasons.push('Sun-Jupiter expansion');
        }
      }
    }

    // Check moon sign (applies to both personal and collective)
    const moonSign = transitPlanets.moon.signName;
    if (rules.favorableSigns.includes(moonSign)) {
      score += 15;
      reasons.push(`Moon in ${moonSign}`);
    }

    // Check void of course with enhanced calculation
    const vocCheck = isTimeVOC(currentDate);
    if (vocCheck) {
      score -= 25;
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

    // Check planetary hour bonus (for personal timing)
    const currentHour = getPlanetaryHourAt(currentDate);
    if (currentHour) {
      const hourPlanet = currentHour.planet;
      
      // Category-specific planetary hour bonuses
      if ((category === 'love' || category === 'beauty') && hourPlanet === 'Venus') {
        score += 20;
        reasons.push('♀ Venus Hour (perfect for love/beauty!)');
      } else if (category === 'finance' && (hourPlanet === 'Jupiter' || hourPlanet === 'Venus')) {
        score += 15;
        reasons.push(`${currentHour.symbol} ${hourPlanet} Hour (good for finances)`);
      } else if (category === 'career' && (hourPlanet === 'Sun' || hourPlanet === 'Saturn' || hourPlanet === 'Jupiter')) {
        score += 15;
        reasons.push(`${currentHour.symbol} ${hourPlanet} Hour (good for career)`);
      } else if (category === 'health' && (hourPlanet === 'Mars' || hourPlanet === 'Sun')) {
        score += 15;
        reasons.push(`${currentHour.symbol} ${hourPlanet} Hour (good for health/action)`);
      } else if (category === 'travel' && (hourPlanet === 'Mercury' || hourPlanet === 'Jupiter')) {
        score += 15;
        reasons.push(`${currentHour.symbol} ${hourPlanet} Hour (good for travel)`);
      }
    }

    // Check Mars retrograde (penalty for health/career/action)
    const marsRetro = getRetrogradeStatus(currentDate, getMarsRetrogrades(currentDate));
    if (marsRetro.isRetrograde) {
      if (category === 'health' || category === 'career') {
        score -= 15;
        reasons.push('♂ Mars Retrograde (avoid new starts)');
      }
    }

    // Check Mercury retrograde more broadly
    const mercuryRetro = getRetrogradeStatus(currentDate, getMercuryRetrogrades(currentDate));
    if (mercuryRetro.isRetrograde && category !== 'travel') {
      score -= 10;
      reasons.push('☿ Mercury Retrograde (review/revise)');
    }

    // Personal chart: Check Solar Arc aspects
    if (natalChart && natalChart.planets) {
      const solarArcChart = calculateSolarArcChart(natalChart, currentDate);
      if (solarArcChart) {
        const allSAspects = findSolarArcAspects(solarArcChart, natalChart);
        const exactSAspects = getExactSolarArcAspects(allSAspects);
        
        // If exact Solar Arc Venus aspects in a love context
        for (const aspect of exactSAspects) {
          if (category === 'love' && (aspect.solarArcPlanet === 'Venus' || aspect.natalPlanet === 'Venus')) {
            score += 15;
            reasons.push('SA Venus aspect exact (love year!)');
            break;
          }
          if (category === 'career' && (aspect.solarArcPlanet === 'Jupiter' || aspect.solarArcPlanet === 'Saturn')) {
            score += 15;
            reasons.push(`SA ${aspect.solarArcPlanet} aspect exact (career year!)`);
            break;
          }
        }
      }

      // Check Progressed Moon sign alignment
      const progressions = calculateSecondaryProgressions(natalChart, currentDate);
      if (progressions) {
        const moonInfo = getProgressedMoonInfo(progressions, natalChart);
        if (moonInfo && moonInfo.signMeaning) {
          // Check if progressed moon theme aligns with category
          const theme = moonInfo.signMeaning.theme.toLowerCase();
          if (category === 'love' && (theme.includes('partner') || theme.includes('love') || moonInfo.sign === 'Libra' || moonInfo.sign === 'Taurus')) {
            score += 10;
            reasons.push(`P.Moon in ${moonInfo.sign} (relationship focus)`);
          } else if (category === 'career' && (theme.includes('career') || theme.includes('ambition') || moonInfo.sign === 'Capricorn')) {
            score += 10;
            reasons.push(`P.Moon in ${moonInfo.sign} (career focus)`);
          } else if (category === 'travel' && (theme.includes('travel') || theme.includes('adventure') || moonInfo.sign === 'Sagittarius')) {
            score += 10;
            reasons.push(`P.Moon in ${moonInfo.sign} (travel focus)`);
          }
        }
      }
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

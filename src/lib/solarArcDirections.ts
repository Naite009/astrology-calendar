import * as Astronomy from 'astronomy-engine';
import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';

// Zodiac signs in order
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Convert natal position to longitude
const natalPositionToLongitude = (position: NatalPlanetPosition): number => {
  const signIndex = ZODIAC_SIGNS.indexOf(position.sign);
  if (signIndex === -1) return 0;
  return signIndex * 30 + position.degree + position.minutes / 60 + (position.seconds || 0) / 3600;
};

// Get sign from longitude
const getSignFromLongitude = (longitude: number): string => {
  const normalizedLon = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLon / 30);
  return ZODIAC_SIGNS[signIndex];
};

// Get degree within sign
const getDegreeInSign = (longitude: number): number => {
  const normalizedLon = ((longitude % 360) + 360) % 360;
  return normalizedLon % 30;
};

// Planet symbols
const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  Ascendant: 'AC',
  NorthNode: '☊',
  Chiron: '⚷',
};

// Aspect symbols
const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌',
  opposition: '☍',
  square: '□',
  trine: '△',
  sextile: '⚹',
};

export interface SolarArcAspect {
  solarArcPlanet: string;
  natalPlanet: string;
  aspect: string;
  aspectSymbol: string;
  orb: number;
  yearsUntilExact: number;
  currentAge: number;
  exactAge: number;
  interpretation: string;
  significance: 'major' | 'moderate' | 'minor';
}

export interface SolarArcChart {
  solarArc: number;
  ageInYears: number;
  ageYears: number;
  ageMonths: number;
  planets: Record<string, {
    natalLongitude: number;
    solarArcLongitude: number;
    solarArcSign: string;
    solarArcDegree: number;
  }>;
}

// Calculate Solar Arc for current age
// Solar Arc = ~1° per year of life (actually based on Sun's progressed motion)
export const calculateSolarArc = (birthDate: Date, currentDate: Date): number => {
  const ageInDays = (currentDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24);
  const ageInYears = ageInDays / 365.25;
  
  // Get Sun's motion: calculate the difference between Sun on progressed date and birth Sun
  // Progressed date = birthDate + ageInYears days
  const progressedDate = new Date(birthDate);
  progressedDate.setDate(progressedDate.getDate() + Math.floor(ageInYears));
  
  try {
    const birthSunVector = Astronomy.GeoVector(Astronomy.Body.Sun, birthDate, false);
    const birthSunEcliptic = Astronomy.Ecliptic(birthSunVector);
    
    const progressedSunVector = Astronomy.GeoVector(Astronomy.Body.Sun, progressedDate, false);
    const progressedSunEcliptic = Astronomy.Ecliptic(progressedSunVector);
    
    let arc = progressedSunEcliptic.elon - birthSunEcliptic.elon;
    if (arc < 0) arc += 360;
    
    return arc;
  } catch (e) {
    // Fallback: approximate 1° per year (astronomy-engine should not fail for Sun)
    console.warn('Solar arc calculation fell back to 1°/year approximation:', e);
    return ageInYears % 360;
  }
};

// Parse birth date from chart
const parseBirthDate = (chart: NatalChart): Date | null => {
  try {
    // birthDate format: "YYYY-MM-DD"
    const [year, month, day] = chart.birthDate.split('-').map(Number);
    
    // birthTime format: "HH:MM" or "HH:MM:SS"
    const timeParts = chart.birthTime?.split(':').map(Number) || [12, 0];
    const [hour, minute] = timeParts;
    
    return new Date(year, month - 1, day, hour, minute);
  } catch {
    return null;
  }
};

// Calculate Solar Arc chart (apply arc to all planets)
export const calculateSolarArcChart = (
  natalChart: NatalChart,
  currentDate: Date
): SolarArcChart | null => {
  const birthDate = parseBirthDate(natalChart);
  if (!birthDate) return null;
  
  const solarArc = calculateSolarArc(birthDate, currentDate);
  const ageInDays = (currentDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24);
  const ageInYears = ageInDays / 365.25;
  
  const solarArcPlanets: SolarArcChart['planets'] = {};
  
  const planetsToProcess = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Ascendant', 'NorthNode', 'Chiron'];
  
  for (const planetName of planetsToProcess) {
    const natalPosition = natalChart.planets[planetName as keyof typeof natalChart.planets];
    if (!natalPosition) continue;
    
    const natalLongitude = natalPositionToLongitude(natalPosition);
    const solarArcLongitude = (natalLongitude + solarArc) % 360;
    
    solarArcPlanets[planetName] = {
      natalLongitude,
      solarArcLongitude,
      solarArcSign: getSignFromLongitude(solarArcLongitude),
      solarArcDegree: getDegreeInSign(solarArcLongitude),
    };
  }
  
  return {
    solarArc,
    ageInYears,
    ageYears: Math.floor(ageInYears),
    ageMonths: Math.floor((ageInYears % 1) * 12),
    planets: solarArcPlanets,
  };
};

// Get interpretation for Solar Arc aspect
const getSolarArcInterpretation = (saPlanet: string, natalPlanet: string, aspect: string): string => {
  const interpretations: Record<string, string> = {
    // Venus aspects - relationships, love, money, values
    'Venus-Sun-conjunction': "Solar Arc Venus conjunct natal Sun = MAJOR relationship or creative breakthrough! Enhanced charm, love opportunities, possible marriage or significant partnership. Your ability to attract love and money is at a peak.",
    'Venus-Moon-conjunction': "Solar Arc Venus conjunct natal Moon = Deep emotional fulfillment in love. Home becomes beautiful. Strong mother/feminine connections. Possible pregnancy or birth of creative project.",
    'Venus-Mars-conjunction': "Solar Arc Venus conjunct natal Mars = Passion ignites! New romance, creative fire, sexual awakening. Take initiative in love. Assert your values.",
    'Venus-Ascendant-conjunction': "Solar Arc Venus conjunct Ascendant = You become magnetic! Physical beauty enhanced, new style, love enters your life visibly. Marriage possible.",
    
    // Sun aspects - identity, vitality, life direction
    'Sun-Moon-conjunction': "Solar Arc Sun conjunct natal Moon = New emotional chapter begins. Identity merges with feelings. Major life integration. Women or mother significant.",
    'Sun-Ascendant-conjunction': "Solar Arc Sun conjunct Ascendant = Major identity shift! You step into leadership. Visibility increases. New life chapter begins.",
    'Sun-Venus-conjunction': "Solar Arc Sun conjunct natal Venus = Love and creativity flourish. Your core self aligns with pleasure and beauty. Romance, art, or financial blessing.",
    
    // Mars aspects - action, energy, assertion
    'Mars-Sun-conjunction': "Solar Arc Mars conjunct natal Sun = Major drive and ambition activated! Time to go after what you want. Physical energy peaks. Possible surgery or physical challenge.",
    'Mars-Pluto-square': "Solar Arc Mars square natal Pluto = Power struggles intensify. Transformation through conflict. Channel this intense energy carefully. Major achievement possible through determined effort.",
    'Mars-Saturn-conjunction': "Solar Arc Mars conjunct natal Saturn = Disciplined action pays off. Hard work recognized. May feel blocked initially, then breakthrough. Patience required.",
    
    // Jupiter aspects - expansion, luck, growth
    'Jupiter-Sun-conjunction': "Solar Arc Jupiter conjunct natal Sun = Lucky year! Expansion, optimism, opportunities abound. Travel, education, or publishing success. Confidence soars.",
    'Jupiter-Ascendant-conjunction': "Solar Arc Jupiter conjunct Ascendant = Major expansion of life circumstances. Weight gain possible! Travel, education, or spiritual growth visible to all.",
    
    // Saturn aspects - structure, responsibility, maturation
    'Saturn-Sun-conjunction': "Solar Arc Saturn conjunct natal Sun = Major responsibility arrives. Career advancement through hard work. Authority tested. Maturation point.",
    'Saturn-Moon-conjunction': "Solar Arc Saturn conjunct natal Moon = Emotional maturation. Family responsibilities. Possible loss or ending that brings wisdom. Building emotional foundations.",
    
    // Pluto aspects - transformation, power, rebirth
    'Pluto-Sun-conjunction': "Solar Arc Pluto conjunct natal Sun = Complete life transformation! Rebirth of identity. Power dynamics shift. You emerge stronger. Nothing will be the same.",
    'Pluto-Ascendant-conjunction': "Solar Arc Pluto conjunct Ascendant = Profound personal transformation. Others see you differently. Power and magnetism increase. Possible crisis leads to rebirth.",
  };
  
  const key = `${saPlanet}-${natalPlanet}-${aspect}`;
  return interpretations[key] || `Solar Arc ${saPlanet} ${ASPECT_SYMBOLS[aspect] || ''} natal ${natalPlanet}. Personal timing activation bringing ${saPlanet} themes to ${natalPlanet} areas of life.`;
};

// Determine significance of aspect
const getAspectSignificance = (saPlanet: string, natalPlanet: string, aspect: string): 'major' | 'moderate' | 'minor' => {
  const majorPlanets = ['Sun', 'Moon', 'Ascendant', 'Venus', 'Mars'];
  const majorAspects = ['conjunction', 'opposition', 'square'];
  
  if (majorPlanets.includes(saPlanet) && majorPlanets.includes(natalPlanet) && majorAspects.includes(aspect)) {
    return 'major';
  }
  if (majorAspects.includes(aspect)) {
    return 'moderate';
  }
  return 'minor';
};

// Find Solar Arc aspects to natal chart
export const findSolarArcAspects = (
  solarArcChart: SolarArcChart,
  natalChart: NatalChart
): SolarArcAspect[] => {
  const aspects: SolarArcAspect[] = [];
  
  const aspectTypes = [
    { name: 'conjunction', angle: 0, orb: 1 },
    { name: 'opposition', angle: 180, orb: 1 },
    { name: 'square', angle: 90, orb: 1 },
    { name: 'trine', angle: 120, orb: 1 },
    { name: 'sextile', angle: 60, orb: 1 },
  ];
  
  for (const [saPlanetName, saData] of Object.entries(solarArcChart.planets)) {
    for (const natalPlanetName of Object.keys(solarArcChart.planets)) {
      if (saPlanetName === natalPlanetName) continue; // Skip same planet
      
      const natalPosition = natalChart.planets[natalPlanetName as keyof typeof natalChart.planets];
      if (!natalPosition) continue;
      
      const natalLongitude = natalPositionToLongitude(natalPosition);
      
      let diff = Math.abs(saData.solarArcLongitude - natalLongitude);
      if (diff > 180) diff = 360 - diff;
      
      for (const aspectType of aspectTypes) {
        const angleDiff = Math.abs(diff - aspectType.angle);
        if (angleDiff <= aspectType.orb) {
          const yearsUntilExact = angleDiff; // ~1° = 1 year
          
          aspects.push({
            solarArcPlanet: saPlanetName,
            natalPlanet: natalPlanetName,
            aspect: aspectType.name,
            aspectSymbol: ASPECT_SYMBOLS[aspectType.name],
            orb: parseFloat(angleDiff.toFixed(2)),
            yearsUntilExact,
            currentAge: solarArcChart.ageInYears,
            exactAge: solarArcChart.ageInYears + (diff < aspectType.angle ? -yearsUntilExact : yearsUntilExact),
            interpretation: getSolarArcInterpretation(saPlanetName, natalPlanetName, aspectType.name),
            significance: getAspectSignificance(saPlanetName, natalPlanetName, aspectType.name),
          });
        }
      }
    }
  }
  
  // Sort by orb (tightest first)
  return aspects.sort((a, b) => a.orb - b.orb);
};

// Get exact aspects (orb < 0.5°) - these are MAJOR life events!
export const getExactSolarArcAspects = (aspects: SolarArcAspect[]): SolarArcAspect[] => {
  return aspects.filter(a => a.orb < 0.5);
};

// Get upcoming aspects (next 3 years)
export const getUpcomingSolarArcAspects = (aspects: SolarArcAspect[]): SolarArcAspect[] => {
  return aspects.filter(a => a.orb >= 0.5 && a.yearsUntilExact <= 3);
};

// Get planet symbol
export const getSolarArcPlanetSymbol = (planet: string): string => {
  return PLANET_SYMBOLS[planet] || planet.charAt(0);
};

// Format age for display
export const formatSolarArcAge = (years: number, months: number): string => {
  if (months === 0) return `${years} years`;
  return `${years} years, ${months} months`;
};

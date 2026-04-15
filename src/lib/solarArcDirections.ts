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
    'Venus-Sun-conjunction': "Solar Arc Venus conjunct natal Sun = A time when you may meet someone important, fall in love, or finally feel good about who you are. People notice you more. Creative projects click into place. You might redecorate, change your style, or attract opportunities that feel like they found you.",
    'Venus-Moon-conjunction': "Solar Arc Venus conjunct natal Moon = You may feel more emotionally settled than you have in years. Home starts to feel like a real sanctuary. A close relationship with a woman or mother figure deepens. You might move somewhere beautiful, start nesting, or begin a creative project that comes from a deeply personal place.",
    'Venus-Mars-conjunction': "Solar Arc Venus conjunct natal Mars = You may suddenly know what you want — in love, in life, in bed. A new attraction shows up, or an existing relationship gets a second wind. You stop waiting for things to happen and start going after what matters to you.",
    'Venus-Ascendant-conjunction': "Solar Arc Venus conjunct Ascendant = People start treating you differently — you may hear 'you look great' more than usual. A new relationship may begin, or you change your appearance in a way that feels more like the real you. Doors open more easily during this period.",
    
    // Sun aspects - identity, vitality, life direction
    'Sun-Moon-conjunction': "Solar Arc Sun conjunct natal Moon = A new chapter begins that feels deeply personal. What you want and what you need start to line up. A woman or mother figure may play a key role. You might move, change your living situation, or finally feel at home in your own skin.",
    'Sun-Ascendant-conjunction': "Solar Arc Sun conjunct Ascendant = You step into a bigger version of yourself. People see you as a leader, or you take charge of something you'd been avoiding. A major new beginning — like starting a business, going public with something, or reinventing yourself.",
    'Sun-Venus-conjunction': "Solar Arc Sun conjunct natal Venus = A period where love, creativity, and pleasure come more naturally. You may start a romance, finish an art project, or receive money you didn't expect. Things that used to feel like work start to feel like play.",
    
    // Mars aspects - action, energy, assertion
    'Mars-Sun-conjunction': "Solar Arc Mars conjunct natal Sun = You feel a surge of motivation — like suddenly knowing it's time to act. You may take on a physical challenge, start a demanding project, or finally confront a situation you'd been tolerating. Energy is high but you may also feel more impatient than usual.",
    'Mars-Pluto-square': "Solar Arc Mars square natal Pluto = You may find yourself in a power struggle — at work, in a relationship, or with yourself. Something you've been pushing down demands to be dealt with. It can feel like hitting a wall, but breaking through it changes everything.",
    'Mars-Saturn-conjunction': "Solar Arc Mars conjunct natal Saturn = Hard work starts paying off, but not without frustration first. You may feel blocked or slowed down before a breakthrough. This is the period where discipline actually gets results — if you can resist quitting early.",
    
    // Jupiter aspects - expansion, luck, growth
    'Jupiter-Sun-conjunction': "Solar Arc Jupiter conjunct natal Sun = Things expand — your confidence, your opportunities, maybe your waistline. You may travel, go back to school, publish something, or take a leap of faith that works out. Optimism comes naturally and doors seem to open when you show up.",
    'Jupiter-Ascendant-conjunction': "Solar Arc Jupiter conjunct Ascendant = Your world gets bigger. You may travel, take on a new role, or start something ambitious. People see you as more capable and generous. Weight gain is common. Everything feels like it's growing — for better or worse.",
    
    // Saturn aspects - structure, responsibility, maturation
    'Saturn-Sun-conjunction': "Solar Arc Saturn conjunct natal Sun = Responsibility lands on your shoulders — a promotion, a loss, a test of character. You may feel the weight of adulting more than usual. This is when you become the person others rely on, whether you asked for it or not.",
    'Saturn-Moon-conjunction': "Solar Arc Saturn conjunct natal Moon = You may feel emotionally heavier — like carrying something you can't put down. A family responsibility may increase, or a relationship gets more serious. This is when you stop running from difficult feelings and build something solid with them.",
    
    // Pluto aspects - transformation, power, rebirth
    'Pluto-Sun-conjunction': "Solar Arc Pluto conjunct natal Sun = Something in your life ends so something else can begin. You may leave a job, end a relationship, or completely change how you see yourself. It doesn't happen gently — but you come out of it as a fundamentally different person.",
    'Pluto-Ascendant-conjunction': "Solar Arc Pluto conjunct Ascendant = Other people start seeing you differently, and you can't quite figure out why until you realize you've changed. You may go through a crisis that strips away the version of yourself that no longer fits. What remains is more honest and more powerful.",
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

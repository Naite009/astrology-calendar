/**
 * Composite Chart Calculator
 * 
 * Blends two natal charts into a single "relationship chart"
 * using the midpoint method to show the partnership's combined energy.
 */

import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';

// Zodiac signs in order
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export interface CompositePosition {
  sign: string;
  degree: number;
  minutes: number;
  longitude: number;
}

export interface CompositeChart {
  name: string;
  person1: string;
  person2: string;
  planets: Record<string, CompositePosition>;
  interpretation: CompositeInterpretation;
}

export interface CompositeInterpretation {
  sunSign: string;
  moonSign: string;
  venusSign: string;
  marsSign: string;
  relationshipStyle: string;
  emotionalCore: string;
  loveLanguage: string;
  passionStyle: string;
  challenges: string[];
  strengths: string[];
  overallTheme: string;
}

// Sign interpretations for composite planets
const SUN_INTERPRETATIONS: Record<string, string> = {
  'Aries': 'Your relationship is pioneering, competitive, and action-oriented. You inspire each other to be bold.',
  'Taurus': 'Stability, sensuality, and building lasting value together define your partnership.',
  'Gemini': 'Communication and mental stimulation are central. You keep each other curious and engaged.',
  'Cancer': 'Emotional security and nurturing are your foundation. Home and family are important.',
  'Leo': 'Your relationship is creative, dramatic, and seeks recognition. You bring out each other\'s shine.',
  'Virgo': 'Service, improvement, and practical support characterize your bond. You help each other grow.',
  'Libra': 'Balance, harmony, and partnership are your essence. You create beauty together.',
  'Scorpio': 'Deep transformation, intensity, and profound intimacy define your connection.',
  'Sagittarius': 'Adventure, growth, and shared philosophy drive your partnership. You expand together.',
  'Capricorn': 'Ambition, structure, and long-term goals unite you. You build something lasting.',
  'Aquarius': 'Innovation, friendship, and unconventional approaches define your bond.',
  'Pisces': 'Spiritual connection, empathy, and creative flow are your essence. Dreamy and intuitive.'
};

const MOON_INTERPRETATIONS: Record<string, string> = {
  'Aries': 'Emotionally direct and spontaneous. Needs excitement to feel alive together.',
  'Taurus': 'Emotionally steady and comfort-seeking. Security and sensory pleasure nurture you.',
  'Gemini': 'Emotionally curious and talkative. You process feelings through conversation.',
  'Cancer': 'Deeply nurturing and protective. Home is your emotional sanctuary.',
  'Leo': 'Emotionally expressive and dramatic. You need to feel special together.',
  'Virgo': 'Emotionally practical and helpful. Acts of service show care.',
  'Libra': 'Emotionally balanced and peace-seeking. Harmony is essential.',
  'Scorpio': 'Emotionally intense and private. Deep loyalty and transformation.',
  'Sagittarius': 'Emotionally adventurous and optimistic. Freedom within connection.',
  'Capricorn': 'Emotionally reserved but loyal. Security comes from achievement.',
  'Aquarius': 'Emotionally independent and unconventional. Friendship first.',
  'Pisces': 'Emotionally merged and intuitive. Profound empathy and spiritual connection.'
};

const VENUS_INTERPRETATIONS: Record<string, string> = {
  'Aries': 'Passionate, direct love. Pursuit and conquest energize romance.',
  'Taurus': 'Sensual, loyal love. Physical affection and material comfort matter.',
  'Gemini': 'Playful, communicative love. Flirtation and mental connection.',
  'Cancer': 'Nurturing, protective love. Emotional safety is paramount.',
  'Leo': 'Generous, dramatic love. Romance, appreciation, and fun.',
  'Virgo': 'Devoted, practical love. Love through acts of service.',
  'Libra': 'Harmonious, balanced love. Beauty, fairness, and partnership.',
  'Scorpio': 'Intense, transformative love. Deep bonding and passion.',
  'Sagittarius': 'Adventurous, free-spirited love. Growth and exploration.',
  'Capricorn': 'Committed, mature love. Building something lasting.',
  'Aquarius': 'Unconventional, friendly love. Independence and innovation.',
  'Pisces': 'Romantic, spiritual love. Empathy and transcendence.'
};

const MARS_INTERPRETATIONS: Record<string, string> = {
  'Aries': 'Direct, competitive drive. Quick to action, loves challenges.',
  'Taurus': 'Steady, determined drive. Slow but unstoppable when motivated.',
  'Gemini': 'Scattered, versatile drive. Multiple projects and mental energy.',
  'Cancer': 'Protective, indirect drive. Action motivated by emotional security.',
  'Leo': 'Creative, bold drive. Action for recognition and self-expression.',
  'Virgo': 'Precise, productive drive. Detailed and efficient action.',
  'Libra': 'Diplomatic, balanced drive. Action through partnership.',
  'Scorpio': 'Intense, strategic drive. Powerful and transformative action.',
  'Sagittarius': 'Adventurous, optimistic drive. Action toward expansion.',
  'Capricorn': 'Ambitious, disciplined drive. Action for achievement.',
  'Aquarius': 'Independent, innovative drive. Action for change.',
  'Pisces': 'Inspired, intuitive drive. Action guided by feeling.'
};

/**
 * Convert position to ecliptic longitude (0-360)
 */
function toAbsoluteLongitude(pos: NatalPlanetPosition): number {
  const signIndex = ZODIAC_SIGNS.indexOf(pos.sign);
  if (signIndex === -1) return 0;
  return signIndex * 30 + pos.degree + (pos.minutes || 0) / 60;
}

/**
 * Convert longitude back to sign/degree/minutes
 */
function fromLongitude(longitude: number): CompositePosition {
  // Normalize to 0-360
  longitude = ((longitude % 360) + 360) % 360;
  
  const signIndex = Math.floor(longitude / 30);
  const degreeWithDecimal = longitude % 30;
  const degree = Math.floor(degreeWithDecimal);
  const minutes = Math.round((degreeWithDecimal - degree) * 60);
  
  return {
    sign: ZODIAC_SIGNS[signIndex],
    degree,
    minutes,
    longitude
  };
}

/**
 * Calculate midpoint between two longitudes (shorter arc)
 */
function calculateMidpoint(lon1: number, lon2: number): number {
  // Normalize both to 0-360
  lon1 = ((lon1 % 360) + 360) % 360;
  lon2 = ((lon2 % 360) + 360) % 360;
  
  let diff = lon2 - lon1;
  
  // Use shorter arc
  if (Math.abs(diff) > 180) {
    if (diff > 0) {
      diff = diff - 360;
    } else {
      diff = diff + 360;
    }
  }
  
  let midpoint = lon1 + diff / 2;
  
  // Normalize result
  return ((midpoint % 360) + 360) % 360;
}

/**
 * Generate composite chart interpretation
 */
function generateInterpretation(planets: Record<string, CompositePosition>): CompositeInterpretation {
  const sunSign = planets['Sun']?.sign || 'Unknown';
  const moonSign = planets['Moon']?.sign || 'Unknown';
  const venusSign = planets['Venus']?.sign || 'Unknown';
  const marsSign = planets['Mars']?.sign || 'Unknown';
  
  const strengths: string[] = [];
  const challenges: string[] = [];
  
  // Check for element balance
  const elements: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  const fireSign = ['Aries', 'Leo', 'Sagittarius'];
  const earthSign = ['Taurus', 'Virgo', 'Capricorn'];
  const airSign = ['Gemini', 'Libra', 'Aquarius'];
  const waterSign = ['Cancer', 'Scorpio', 'Pisces'];
  
  Object.values(planets).forEach(pos => {
    if (fireSign.includes(pos.sign)) elements.fire++;
    else if (earthSign.includes(pos.sign)) elements.earth++;
    else if (airSign.includes(pos.sign)) elements.air++;
    else if (waterSign.includes(pos.sign)) elements.water++;
  });
  
  // Determine dominant element
  const dominantElement = Object.entries(elements).sort((a, b) => b[1] - a[1])[0][0];
  
  if (dominantElement === 'fire') {
    strengths.push('Passionate and inspiring energy');
    challenges.push('May burn too hot or fast');
  } else if (dominantElement === 'earth') {
    strengths.push('Stable and practical foundation');
    challenges.push('May become too routine');
  } else if (dominantElement === 'air') {
    strengths.push('Strong mental connection');
    challenges.push('May over-intellectualize feelings');
  } else {
    strengths.push('Deep emotional attunement');
    challenges.push('May become too emotionally merged');
  }
  
  // Sun-Moon compatibility
  if (sunSign === moonSign) {
    strengths.push('Natural alignment of will and emotions');
  }
  
  // Venus-Mars chemistry
  if (venusSign === marsSign) {
    strengths.push('Love and passion naturally aligned');
  }
  
  // Generate overall theme
  let overallTheme = '';
  if (elements.fire >= 3) {
    overallTheme = 'A dynamic, action-oriented partnership that inspires growth and adventure.';
  } else if (elements.earth >= 3) {
    overallTheme = 'A stable, grounded partnership focused on building something lasting.';
  } else if (elements.air >= 3) {
    overallTheme = 'An intellectually stimulating partnership with strong communication.';
  } else if (elements.water >= 3) {
    overallTheme = 'A deeply emotional, intuitive partnership with profound empathy.';
  } else {
    overallTheme = 'A well-balanced partnership with diverse strengths across elements.';
  }
  
  return {
    sunSign,
    moonSign,
    venusSign,
    marsSign,
    relationshipStyle: SUN_INTERPRETATIONS[sunSign] || 'Unique relationship energy.',
    emotionalCore: MOON_INTERPRETATIONS[moonSign] || 'Emotional patterns to explore.',
    loveLanguage: VENUS_INTERPRETATIONS[venusSign] || 'Affection style to discover.',
    passionStyle: MARS_INTERPRETATIONS[marsSign] || 'Drive and action to understand.',
    challenges,
    strengths,
    overallTheme
  };
}

/**
 * Calculate composite chart from two natal charts
 */
export function calculateCompositeChart(chart1: NatalChart, chart2: NatalChart): CompositeChart {
  const compositePlanets: Record<string, CompositePosition> = {};
  
  // List of planets to calculate
  const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  
  for (const planetName of planetNames) {
    const pos1 = chart1.planets[planetName as keyof typeof chart1.planets];
    const pos2 = chart2.planets[planetName as keyof typeof chart2.planets];
    
    if (pos1 && pos2) {
      const lon1 = toAbsoluteLongitude(pos1);
      const lon2 = toAbsoluteLongitude(pos2);
      const midpoint = calculateMidpoint(lon1, lon2);
      compositePlanets[planetName] = fromLongitude(midpoint);
    }
  }
  
  // Calculate Ascendant midpoint if available — prefer houseCusps.house1
  const compAsc1 = chart1.houseCusps?.house1 ? { sign: chart1.houseCusps.house1.sign, degree: chart1.houseCusps.house1.degree, minutes: chart1.houseCusps.house1.minutes || 0, seconds: 0 } : chart1.planets.Ascendant;
  const compAsc2 = chart2.houseCusps?.house1 ? { sign: chart2.houseCusps.house1.sign, degree: chart2.houseCusps.house1.degree, minutes: chart2.houseCusps.house1.minutes || 0, seconds: 0 } : chart2.planets.Ascendant;
  if (compAsc1 && compAsc2) {
    const lon1 = toAbsoluteLongitude(compAsc1);
    const lon2 = toAbsoluteLongitude(compAsc2);
    compositePlanets['Ascendant'] = fromLongitude(calculateMidpoint(lon1, lon2));
  }
  
  const interpretation = generateInterpretation(compositePlanets);
  
  return {
    name: `${chart1.name} & ${chart2.name} Composite`,
    person1: chart1.name,
    person2: chart2.name,
    planets: compositePlanets,
    interpretation
  };
}

import * as Astronomy from 'astronomy-engine';

/**
 * Calculate Davison chart (averaged birth data method)
 * Unlike Composite (midpoints), Davison uses the actual midpoint in TIME and SPACE
 * TRUE DAVISON: Uses astronomy-engine for precise ephemeris calculations
 */
export interface DavisonChart {
  name: string;
  person1: string;
  person2: string;
  averagedDate: Date;
  averagedLocation: string;
  planets: Record<string, CompositePosition>;
  interpretation: CompositeInterpretation;
  method: 'davison';
}

/**
 * Calculate averaged date between two birth dates
 */
function calculateAveragedDate(date1: Date, date2: Date): Date {
  const time1 = date1.getTime();
  const time2 = date2.getTime();
  const avgTime = (time1 + time2) / 2;
  return new Date(avgTime);
}

/**
 * Map planet names to astronomy-engine Body enum
 */
function getAstronomyBody(planetName: string): Astronomy.Body | null {
  const bodyMap: Record<string, Astronomy.Body> = {
    'Sun': Astronomy.Body.Sun,
    'Moon': Astronomy.Body.Moon,
    'Mercury': Astronomy.Body.Mercury,
    'Venus': Astronomy.Body.Venus,
    'Mars': Astronomy.Body.Mars,
    'Jupiter': Astronomy.Body.Jupiter,
    'Saturn': Astronomy.Body.Saturn,
    'Uranus': Astronomy.Body.Uranus,
    'Neptune': Astronomy.Body.Neptune,
    'Pluto': Astronomy.Body.Pluto
  };
  return bodyMap[planetName] || null;
}

/**
 * Get ecliptic longitude for a planet at a given date using astronomy-engine
 */
function getPlanetLongitudeAtDate(planetName: string, date: Date): number | null {
  const body = getAstronomyBody(planetName);
  if (!body) return null;
  
  try {
    const astroDate = Astronomy.MakeTime(date);
    
    if (body === Astronomy.Body.Sun) {
      // For Sun, use SunPosition which gives geocentric ecliptic coordinates
      const sunPos = Astronomy.SunPosition(astroDate);
      return sunPos.elon;
    } else if (body === Astronomy.Body.Moon) {
      // For Moon, use EclipticGeoMoon for precise geocentric ecliptic coordinates
      const moonPos = Astronomy.EclipticGeoMoon(astroDate);
      return moonPos.lon;
    } else {
      // For other planets, use GeoVector and convert to ecliptic
      const geoVector = Astronomy.GeoVector(body, astroDate, true);
      const ecliptic = Astronomy.Ecliptic(geoVector);
      return ecliptic.elon;
    }
  } catch (error) {
    console.error(`Error calculating ${planetName} position for Davison chart:`, error);
    return null;
  }
}

/**
 * Calculate Davison relationship chart using TRUE EPHEMERIS
 * This creates a chart for the "birth moment" of the relationship itself
 * Uses astronomy-engine for precise planetary positions at the averaged date
 */
export function calculateDavisonChart(chart1: NatalChart, chart2: NatalChart): DavisonChart {
  // Calculate averaged birth date
  const date1 = new Date(chart1.birthDate);
  const date2 = new Date(chart2.birthDate);
  const averagedDate = calculateAveragedDate(date1, date2);
  
  // For location, we note both locations (true Davison would need geocoding)
  const averagedLocation = `Between ${chart1.birthLocation} and ${chart2.birthLocation}`;
  
  // TRUE DAVISON: Calculate actual planetary positions for the averaged date using ephemeris
  const davisonPlanets: Record<string, CompositePosition> = {};
  const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  
  for (const planetName of planetNames) {
    // Use astronomy-engine to get precise position at averaged date
    const longitude = getPlanetLongitudeAtDate(planetName, averagedDate);
    
    if (longitude !== null) {
      davisonPlanets[planetName] = fromLongitude(longitude);
    } else {
      // Fallback to original projection method if ephemeris fails
      const pos1 = chart1.planets[planetName as keyof typeof chart1.planets];
      if (pos1) {
        const dailyMotion: Record<string, number> = {
          Sun: 0.9856, Moon: 13.176, Mercury: 1.383, Venus: 1.2, Mars: 0.524,
          Jupiter: 0.083, Saturn: 0.034, Uranus: 0.012, Neptune: 0.006, Pluto: 0.004
        };
        const daysDiff = (averagedDate.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24);
        const lon1 = toAbsoluteLongitude(pos1);
        const motion = dailyMotion[planetName] || 0.5;
        let projectedLon = lon1 + (motion * daysDiff);
        projectedLon = ((projectedLon % 360) + 360) % 360;
        davisonPlanets[planetName] = fromLongitude(projectedLon);
      }
    }
  }
  
  // Calculate additional points: Chiron, North Node
  try {
    // Chiron - approximate using mean motion (~50.7 year orbit)
    const pos1Chiron = chart1.planets.Chiron;
    const pos2Chiron = chart2.planets.Chiron;
    if (pos1Chiron && pos2Chiron) {
      const daysDiff = (averagedDate.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24);
      const chironDailyMotion = 360 / (50.7 * 365.25); // ~0.019 degrees per day
      const lon1 = toAbsoluteLongitude(pos1Chiron);
      let projectedLon = lon1 + (chironDailyMotion * daysDiff);
      projectedLon = ((projectedLon % 360) + 360) % 360;
      davisonPlanets['Chiron'] = fromLongitude(projectedLon);
    }
    
    // North Node - regresses about 19.3° per year
    const pos1Node = chart1.planets.NorthNode;
    const pos2Node = chart2.planets.NorthNode;
    if (pos1Node && pos2Node) {
      const daysDiff = (averagedDate.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24);
      const nodeDailyMotion = -19.3 / 365.25; // Retrograde motion
      const lon1 = toAbsoluteLongitude(pos1Node);
      let projectedLon = lon1 + (nodeDailyMotion * daysDiff);
      projectedLon = ((projectedLon % 360) + 360) % 360;
      davisonPlanets['NorthNode'] = fromLongitude(projectedLon);
    }
  } catch (error) {
    console.error('Error calculating Davison additional points:', error);
  }
  
  // For Ascendant, we'd need latitude/longitude for precise calculation
  // Using midpoint method as fallback for angles — prefer houseCusps.house1
  const davAsc1 = chart1.houseCusps?.house1 ? { sign: chart1.houseCusps.house1.sign, degree: chart1.houseCusps.house1.degree, minutes: chart1.houseCusps.house1.minutes || 0, seconds: 0 } : chart1.planets.Ascendant;
  const davAsc2 = chart2.houseCusps?.house1 ? { sign: chart2.houseCusps.house1.sign, degree: chart2.houseCusps.house1.degree, minutes: chart2.houseCusps.house1.minutes || 0, seconds: 0 } : chart2.planets.Ascendant;
  if (davAsc1 && davAsc2) {
    const lon1 = toAbsoluteLongitude(davAsc1);
    const lon2 = toAbsoluteLongitude(davAsc2);
    davisonPlanets['Ascendant'] = fromLongitude(calculateMidpoint(lon1, lon2));
  }
  
  const interpretation = generateDavisonInterpretation(davisonPlanets, averagedDate);
  
  return {
    name: `${chart1.name} & ${chart2.name} Davison`,
    person1: chart1.name,
    person2: chart2.name,
    averagedDate,
    averagedLocation,
    planets: davisonPlanets,
    interpretation,
    method: 'davison'
  };
}

/**
 * Generate Davison-specific interpretation (emphasizes timing and destiny)
 */
function generateDavisonInterpretation(planets: Record<string, CompositePosition>, averagedDate: Date): CompositeInterpretation {
  const baseInterpretation = generateInterpretation(planets);
  
  // Add Davison-specific flavor based on the relationship's "birth year"
  const year = averagedDate.getFullYear();
  const decade = Math.floor(year / 10) * 10;
  
  let generationalNote = '';
  if (decade <= 1960) {
    generationalNote = 'This relationship has roots in traditional values with transformation potential.';
  } else if (decade <= 1980) {
    generationalNote = 'Born in an era of social change, this relationship carries evolutionary energy.';
  } else if (decade <= 2000) {
    generationalNote = 'This relationship emerged in a time of technological and cultural shift.';
  } else {
    generationalNote = 'A relationship for the new millennium, carrying forward-looking energy.';
  }
  
  return {
    ...baseInterpretation,
    overallTheme: `${baseInterpretation.overallTheme} ${generationalNote}`
  };
}

/**
 * Get planet symbol
 */
export function getPlanetSymbol(planet: string): string {
  const symbols: Record<string, string> = {
    Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
    Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
    Ascendant: 'AC', NorthNode: '☊', Chiron: '⚷'
  };
  return symbols[planet] || planet.charAt(0);
}

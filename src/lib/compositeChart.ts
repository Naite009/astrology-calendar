/**
 * Composite Chart Calculator
 * 
 * Blends two natal charts into a single "relationship chart"
 * using the midpoint method to show the partnership's combined energy.
 */

import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { birthMomentOf } from './chartAutoFill';

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
/**
 * Sign-keyword tables used to live here: one canned sentence per composite Sun,
 * Moon, Venus and Mars sign, which let a single sign define a whole
 * relationship. They are gone. Every interpretation in this file now comes from
 * the canonical composite engine and reading, which weighs aspects, angles,
 * house emphasis and repeated themes before any sign placement.
 */


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
 * Interpretation now comes from the canonical composite reading: aspects with
 * exact orbs, angles, house emphasis and repeated themes are weighed first, and
 * the four sign fields are kept only so older screens keep working.
 */
function interpretationFromModel(
  model: CompositeModel,
  ctx?: RelationshipContext | null,
): CompositeInterpretation {
  const context = ctx ?? buildRelationshipContext({ kind: 'neutral' });
  const reading = buildCompositeReading(model, context);
  return legacyCompositeInterpretation(model, reading);
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
  /**
   * 'exact' when both birth instants came from the shared normalization
   * pipeline (local clock time at the birthplace, historical zone rules).
   * 'date-only' when at least one chart could not be normalized and local
   * noon was used instead; the Davison Moon can then be off by several degrees.
   */
  momentQuality: 'exact' | 'date-only';
  /** Plain-language note when the moment is not exact. */
  momentNote?: string;
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
 * The birth instant for one chart: the normalized UTC moment when the record
 * can be resolved, otherwise noon UTC on the birth date with `exact: false`.
 * Never `new Date("YYYY-MM-DD")`, which is midnight UTC and throws away the
 * birth time entirely (up to 13 degrees of Davison Moon).
 */
function davisonBirthInstant(chart: NatalChart): { date: Date; exact: boolean } {
  const exact = birthMomentOf(chart);
  if (exact) return { date: exact, exact: true };
  const [y, m, d] = String(chart.birthDate || '').split('-').map(Number);
  const fallback = y && m && d ? new Date(Date.UTC(y, m - 1, d, 12, 0, 0)) : new Date(NaN);
  return { date: fallback, exact: false };
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
  // Midpoint in time between the two normalized birth instants.
  const instant1 = davisonBirthInstant(chart1);
  const instant2 = davisonBirthInstant(chart2);
  const date1 = instant1.date;
  const date2 = instant2.date;
  const averagedDate = calculateAveragedDate(date1, date2);
  const momentQuality: DavisonChart['momentQuality'] = instant1.exact && instant2.exact ? 'exact' : 'date-only';
  const inexactNames = [!instant1.exact && chart1.name, !instant2.exact && chart2.name].filter(Boolean) as string[];
  const momentNote = momentQuality === 'exact'
    ? undefined
    : `Birth time and place could not be resolved for ${inexactNames.join(' and ')}, so noon was used. The Davison Moon and fast planets are approximate until that chart has a verified time zone.`;
  
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
  
  const interpretation = generateDavisonInterpretation(davisonPlanets, averagedDate, chart1.name, chart2.name, ctx);
  
  return {
    name: `${chart1.name} & ${chart2.name} Davison`,
    person1: chart1.name,
    person2: chart2.name,
    averagedDate,
    averagedLocation,
    planets: davisonPlanets,
    interpretation,
    method: 'davison',
    momentQuality,
    momentNote,
  };
}

/**
 * Davison interpretation. The old version added a "generational destiny" line
 * based on the decade of the midpoint date, which is not something a chart can
 * support. The Davison model is now read with the same evidence rules as the
 * composite model, and the only extra note is factual: the moment used.
 */
function generateDavisonInterpretation(
  planets: Record<string, CompositePosition>,
  averagedDate: Date,
  person1: string,
  person2: string,
  ctx?: RelationshipContext | null,
): CompositeInterpretation {
  const longitudes: Record<string, number> = {};
  for (const [body, pos] of Object.entries(planets)) longitudes[body] = pos.longitude;
  const model = davisonModelFromLongitudes(longitudes, person1, person2);
  const base = interpretationFromModel(model, ctx);
  const moment = `Midpoint moment used: ${averagedDate.toISOString().slice(0, 10)}.`;
  return { ...base, overallTheme: `${base.overallTheme} ${moment}` };
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

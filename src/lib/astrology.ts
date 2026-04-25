import * as Astronomy from 'astronomy-engine';
import { UserData } from '@/hooks/useUserData';
import { getAccurateAsteroidPosition } from './asteroidEphemeris';
import { calculatePlacidusHouses, getCoordinatesFromLocation as getExtendedCoordinates, PlacidusHouses } from './placidusHouses';
import { getEffectiveOrb as getOrbForPair } from './aspectOrbs';
// Zodiac signs mapping
const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈' },
  { name: 'Taurus', symbol: '♉' },
  { name: 'Gemini', symbol: '♊' },
  { name: 'Cancer', symbol: '♋' },
  { name: 'Leo', symbol: '♌' },
  { name: 'Virgo', symbol: '♍' },
  { name: 'Libra', symbol: '♎' },
  { name: 'Scorpio', symbol: '♏' },
  { name: 'Sagittarius', symbol: '♐' },
  { name: 'Capricorn', symbol: '♑' },
  { name: 'Aquarius', symbol: '♒' },
  { name: 'Pisces', symbol: '♓' },
];

export interface ZodiacPosition {
  sign: string;
  signName: string;
  degree: number;
  minutes: number; // 0-59 arc minutes
  fullDegree: string;
  rawDegree: number; // Full degree with decimals within sign (0-30)
}

export interface ExtendedZodiacPosition extends ZodiacPosition {
  longitude: number;
  planetSymbol?: string;
  name?: string;
}

export interface PlanetaryPositions {
  moon: ZodiacPosition;
  sun: ZodiacPosition;
  mercury: ZodiacPosition;
  venus: ZodiacPosition;
  mars: ZodiacPosition;
  jupiter: ZodiacPosition;
  saturn: ZodiacPosition;
  uranus: ZodiacPosition;
  neptune: ZodiacPosition;
  pluto: ZodiacPosition;
  northNode?: ExtendedZodiacPosition;
  southNode?: ExtendedZodiacPosition;
  chiron?: ExtendedZodiacPosition;
  lilith?: ExtendedZodiacPosition;
  eris?: ExtendedZodiacPosition;
}

export interface MoonPhase {
  phaseIcon: string;
  phaseName: string;
  isBalsamic: boolean;
  phase: number;
  illumination: number;
}

export interface Transit {
  type: string;
  desc: string;
  icon: string;
  orb?: string;
}

export interface PersonalTransits {
  hasTransits: boolean;
  transits: Transit[];
}

export interface Ingress {
  planet: string;
  sign: string;
  icon: string;
  desc: string;
  entryDate?: Date;
  entryTime?: string;
  exitDate?: Date;
  exitTime?: string;
  nextSign?: string;
  durationDays?: number;
}

export type EnergyLevel = 'rest' | 'high' | 'caution' | 'moderate';

export interface EnergyRating {
  level: EnergyLevel;
  label: string;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  symbol: string;
  orb: string;
  applying?: boolean; // true = aspect is building/exact soon, false = separating
}

export interface VoidOfCourse {
  isVOC: boolean;
  start?: Date;
  end?: Date;
}

export interface DayColors {
  primary: string;
  secondary: string | null;
  label: string;
}

export interface ExactLunarPhase {
  type: 'New Moon' | 'Full Moon' | 'First Quarter' | 'Last Quarter';
  time: Date;
  position: string;
  sign: string; // Moon's zodiac sign at exact moment
  emoji: string;
  name: string | null; // Traditional moon name (Wolf Moon, Snow Moon, etc.)
  isSupermoon: boolean;
  distance: number; // km
  supermoonSequence?: string;
  sunPosition?: string; // Sun's position (for Full Moon opposition display)
  sunSign?: string; // Sun's sign (for Full Moon opposition display)
}

export interface DayData {
  date: Date;
  planets: PlanetaryPositions;
  moonPhase: MoonPhase;
  mercuryRetro: boolean;
  personalTransits: PersonalTransits;
  majorIngresses: Ingress[];
  exactLunarPhase?: ExactLunarPhase | null;
  energy: EnergyRating;
  aspects: Aspect[];
  voc: VoidOfCourse;
  dayColors: DayColors;
}

// Convert ecliptic longitude to zodiac sign and degree
export const longitudeToZodiac = (longitude: number): ZodiacPosition => {
  const normalizedLon = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLon / 30);
  const rawDegree = normalizedLon % 30; // Full decimal degree within sign
  const degree = Math.floor(rawDegree);
  const minutes = Math.floor((rawDegree - degree) * 60);

  return {
    sign: ZODIAC_SIGNS[signIndex].symbol,
    signName: ZODIAC_SIGNS[signIndex].name,
    degree,
    minutes,
    rawDegree,
    fullDegree: `${degree}°${minutes.toString().padStart(2, '0')}' ${ZODIAC_SIGNS[signIndex].symbol}`,
  };
};

// Calculate North and South Node positions (Mean Node - more accurate formula)
export const getNodePositions = (date: Date): { north: ExtendedZodiacPosition; south: ExtendedZodiacPosition } => {
  // Julian centuries from J2000.0
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;
  
  // Mean longitude of ascending node (more accurate formula from Meeus)
  const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000;
  
  const normalizedNode = ((omega % 360) + 360) % 360;
  const northNode = longitudeToZodiac(normalizedNode);
  
  const southNodeLon = (normalizedNode + 180) % 360;
  const southNode = longitudeToZodiac(southNodeLon);
  
  return {
    north: { ...northNode, longitude: normalizedNode, planetSymbol: '☊', name: 'North Node' },
    south: { ...southNode, longitude: southNodeLon, planetSymbol: '☋', name: 'South Node' }
  };
};

// Get detailed North Node position for natal chart
export const getDetailedNodePosition = (date: Date): { sign: string; degree: number; minutes: number; seconds: number } => {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;
  const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000;
  const normalizedNode = ((omega % 360) + 360) % 360;
  return getDetailedPosition(normalizedNode);
};

// Calculate Chiron position using ephemeris lookup table (accurate interpolated data)
export const getChironPosition = (date: Date): ExtendedZodiacPosition => {
  const pos = getAccurateAsteroidPosition('chiron', date);
  const longitude = ZODIAC_SIGNS.findIndex(s => s.name === pos.sign) * 30 + pos.degree + pos.minutes / 60 + pos.seconds / 3600;
  return {
    ...longitudeToZodiac(longitude),
    longitude,
    planetSymbol: '⚷',
    name: 'Chiron'
  };
};

// Calculate Black Moon Lilith position using ephemeris lookup table (accurate interpolated data)
export const getBlackMoonLilith = (date: Date): ExtendedZodiacPosition => {
  const pos = getAccurateAsteroidPosition('lilith', date);
  const longitude = ZODIAC_SIGNS.findIndex(s => s.name === pos.sign) * 30 + pos.degree + pos.minutes / 60 + pos.seconds / 3600;
  return {
    ...longitudeToZodiac(longitude),
    longitude,
    planetSymbol: '⚸',
    name: 'Black Moon Lilith'
  };
};

// Calculate Eris position using ephemeris lookup table (accurate interpolated data)
export const getErisPosition = (date: Date): ExtendedZodiacPosition => {
  const pos = getAccurateAsteroidPosition('eris', date);
  const longitude = ZODIAC_SIGNS.findIndex(s => s.name === pos.sign) * 30 + pos.degree + pos.minutes / 60 + pos.seconds / 3600;
  return {
    ...longitudeToZodiac(longitude),
    longitude,
    planetSymbol: '⯰',
    name: 'Eris'
  };
};

// Get detailed position with degrees, minutes, seconds
export const getDetailedPosition = (longitude: number): { sign: string; degree: number; minutes: number; seconds: number; isRetrograde?: boolean } => {
  const normalizedLon = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLon / 30);
  const degreeFloat = normalizedLon % 30;
  let degree = Math.floor(degreeFloat);
  const minuteFloat = (degreeFloat - degree) * 60;
  let minutes = Math.floor(minuteFloat);
  let seconds = Math.round((minuteFloat - minutes) * 60);
  
  // Handle seconds rollover (60 seconds = 1 minute)
  if (seconds >= 60) {
    seconds = 0;
    minutes += 1;
  }
  // Handle minutes rollover (60 minutes = 1 degree)
  if (minutes >= 60) {
    minutes = 0;
    degree += 1;
  }
  
  return {
    sign: ZODIAC_SIGNS[signIndex].name,
    degree,
    minutes,
    seconds,
  };
};

// Check if a planet is retrograde at a given date
// Uses a forward-looking window to catch station days accurately:
// compares longitude at date vs date+1day. If longitude decreases, planet is retrograde.
export const isPlanetRetrograde = (body: Astronomy.Body, date: Date): boolean => {
  try {
    // Use a small forward+backward window to avoid station-day ambiguity
    const before = new Date(date.getTime() - 12 * 3600000); // 12h before
    const after = new Date(date.getTime() + 12 * 3600000);  // 12h after
    
    const beforeVector = Astronomy.GeoVector(body, before, false);
    const afterVector = Astronomy.GeoVector(body, after, false);
    
    const beforeEcliptic = Astronomy.Ecliptic(beforeVector);
    const afterEcliptic = Astronomy.Ecliptic(afterVector);
    
    // Handle wrap-around at 0/360
    let diff = afterEcliptic.elon - beforeEcliptic.elon;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    return diff < 0;
  } catch {
    return false;
  }
};

// Calculate Chiron detailed position for natal chart - NOW USES ACCURATE LOOKUP TABLES
export const getDetailedChironPosition = (date: Date): { sign: string; degree: number; minutes: number; seconds: number; isRetrograde: boolean } => {
  return getAccurateAsteroidPosition('chiron', date);
};

// Calculate Black Moon Lilith detailed position for natal chart - NOW USES ACCURATE LOOKUP TABLES
export const getDetailedLilithPosition = (date: Date): { sign: string; degree: number; minutes: number; seconds: number; isRetrograde?: boolean } => {
  const result = getAccurateAsteroidPosition('lilith', date);
  return { sign: result.sign, degree: result.degree, minutes: result.minutes, seconds: result.seconds };
};

// Calculate asteroid Ceres position - NOW USES ACCURATE LOOKUP TABLES
export const getDetailedCeresPosition = (date: Date): { sign: string; degree: number; minutes: number; seconds: number; isRetrograde: boolean } => {
  return getAccurateAsteroidPosition('ceres', date);
};

// Calculate asteroid Pallas position - NOW USES ACCURATE LOOKUP TABLES
export const getDetailedPallasPosition = (date: Date): { sign: string; degree: number; minutes: number; seconds: number; isRetrograde: boolean } => {
  return getAccurateAsteroidPosition('pallas', date);
};

// Calculate asteroid Juno position - NOW USES ACCURATE LOOKUP TABLES
export const getDetailedJunoPosition = (date: Date): { sign: string; degree: number; minutes: number; seconds: number; isRetrograde: boolean } => {
  return getAccurateAsteroidPosition('juno', date);
};

// Calculate asteroid Vesta position - NOW USES ACCURATE LOOKUP TABLES
export const getDetailedVestaPosition = (date: Date): { sign: string; degree: number; minutes: number; seconds: number; isRetrograde: boolean } => {
  return getAccurateAsteroidPosition('vesta', date);
};

// Calculate Placidus houses for a given date, latitude, and longitude
export const calculatePlacidusHouseCusps = (
  date: Date,
  latitude: number,
  longitude: number
): PlacidusHouses => {
  return calculatePlacidusHouses(date, latitude, longitude);
};

// City coordinates database for Ascendant calculation
export const CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  // US Cities - Eastern
  'new york': { lat: 40.7128, lon: -74.0060 },
  'boston': { lat: 42.3601, lon: -71.0589 },
  'philadelphia': { lat: 39.9526, lon: -75.1652 },
  'miami': { lat: 25.7617, lon: -80.1918 },
  'atlanta': { lat: 33.7490, lon: -84.3880 },
  'washington': { lat: 38.9072, lon: -77.0369 },
  'detroit': { lat: 42.3314, lon: -83.0458 },
  'cleveland': { lat: 41.4993, lon: -81.6944 },
  'pittsburgh': { lat: 40.4406, lon: -79.9959 },
  'charlotte': { lat: 35.2271, lon: -80.8431 },
  'orlando': { lat: 28.5383, lon: -81.3792 },
  'raleigh': { lat: 35.7796, lon: -78.6382 },
  'baltimore': { lat: 39.2904, lon: -76.6122 },
  'tampa': { lat: 27.9506, lon: -82.4572 },
  'jacksonville': { lat: 30.3322, lon: -81.6557 },
  // US Cities - Central
  'chicago': { lat: 41.8781, lon: -87.6298 },
  'houston': { lat: 29.7604, lon: -95.3698 },
  'dallas': { lat: 32.7767, lon: -96.7970 },
  'san antonio': { lat: 29.4241, lon: -98.4936 },
  'austin': { lat: 30.2672, lon: -97.7431 },
  'minneapolis': { lat: 44.9778, lon: -93.2650 },
  'milwaukee': { lat: 43.0389, lon: -87.9065 },
  'kansas city': { lat: 39.0997, lon: -94.5786 },
  'st louis': { lat: 38.6270, lon: -90.1994 },
  'new orleans': { lat: 29.9511, lon: -90.0715 },
  'nashville': { lat: 36.1627, lon: -86.7816 },
  'memphis': { lat: 35.1495, lon: -90.0490 },
  'oklahoma city': { lat: 35.4676, lon: -97.5164 },
  // US Cities - Mountain
  'denver': { lat: 39.7392, lon: -104.9903 },
  'phoenix': { lat: 33.4484, lon: -112.0740 },
  'albuquerque': { lat: 35.0844, lon: -106.6504 },
  'salt lake city': { lat: 40.7608, lon: -111.8910 },
  'tucson': { lat: 32.2226, lon: -110.9747 },
  'las vegas': { lat: 36.1699, lon: -115.1398 },
  'el paso': { lat: 31.7619, lon: -106.4850 },
  'boise': { lat: 43.6150, lon: -116.2023 },
  // US Cities - Pacific
  'los angeles': { lat: 34.0522, lon: -118.2437 },
  'san francisco': { lat: 37.7749, lon: -122.4194 },
  'san diego': { lat: 32.7157, lon: -117.1611 },
  'seattle': { lat: 47.6062, lon: -122.3321 },
  'portland': { lat: 45.5152, lon: -122.6784 },
  'sacramento': { lat: 38.5816, lon: -121.4944 },
  'san jose': { lat: 37.3382, lon: -121.8863 },
  'fresno': { lat: 36.7378, lon: -119.7871 },
  // Alaska & Hawaii
  'anchorage': { lat: 61.2181, lon: -149.9003 },
  'honolulu': { lat: 21.3069, lon: -157.8583 },
  // International Cities
  'london': { lat: 51.5074, lon: -0.1278 },
  'paris': { lat: 48.8566, lon: 2.3522 },
  'berlin': { lat: 52.5200, lon: 13.4050 },
  'rome': { lat: 41.9028, lon: 12.4964 },
  'madrid': { lat: 40.4168, lon: -3.7038 },
  'amsterdam': { lat: 52.3676, lon: 4.9041 },
  'brussels': { lat: 50.8503, lon: 4.3517 },
  'vienna': { lat: 48.2082, lon: 16.3738 },
  'zurich': { lat: 47.3769, lon: 8.5417 },
  'stockholm': { lat: 59.3293, lon: 18.0686 },
  'oslo': { lat: 59.9139, lon: 10.7522 },
  'copenhagen': { lat: 55.6761, lon: 12.5683 },
  'dublin': { lat: 53.3498, lon: -6.2603 },
  'lisbon': { lat: 38.7223, lon: -9.1393 },
  'moscow': { lat: 55.7558, lon: 37.6173 },
  'tokyo': { lat: 35.6762, lon: 139.6503 },
  'beijing': { lat: 39.9042, lon: 116.4074 },
  'shanghai': { lat: 31.2304, lon: 121.4737 },
  'hong kong': { lat: 22.3193, lon: 114.1694 },
  'singapore': { lat: 1.3521, lon: 103.8198 },
  'sydney': { lat: -33.8688, lon: 151.2093 },
  'melbourne': { lat: -37.8136, lon: 144.9631 },
  'toronto': { lat: 43.6532, lon: -79.3832 },
  'vancouver': { lat: 49.2827, lon: -123.1207 },
  'montreal': { lat: 45.5017, lon: -73.5673 },
  'mexico city': { lat: 19.4326, lon: -99.1332 },
  'sao paulo': { lat: -23.5505, lon: -46.6333 },
  'buenos aires': { lat: -34.6037, lon: -58.3816 },
  'mumbai': { lat: 19.0760, lon: 72.8777 },
  'delhi': { lat: 28.7041, lon: 77.1025 },
  'cairo': { lat: 30.0444, lon: 31.2357 },
  'johannesburg': { lat: -26.2041, lon: 28.0473 },
  'dubai': { lat: 25.2048, lon: 55.2708 },
  'tel aviv': { lat: 32.0853, lon: 34.7818 },
};

// Get coordinates from location string
export const getCoordinatesFromLocation = (location: string): { lat: number; lon: number } | null => {
  const lowerLocation = location.toLowerCase();
  
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    if (lowerLocation.includes(city)) {
      return coords;
    }
  }
  
  return null;
};

// Calculate Ascendant using sidereal time
export const calculateAscendant = (
  date: Date,
  latitude: number,
  longitude: number
): { sign: string; degree: number; minutes: number; seconds: number } => {
  // Get Greenwich Sidereal Time
  const gst = Astronomy.SiderealTime(date);
  
  // Convert GST to Local Sidereal Time (add longitude in hours)
  const localLST = (gst + longitude / 15 + 24) % 24;
  
  // Convert to degrees (RAMC - Right Ascension of Medium Coeli)
  const ramcDeg = localLST * 15;
  
  // Calculate obliquity of ecliptic (approximately 23.4°)
  const obliquity = 23.4392911; // degrees for J2000
  const obliqRad = obliquity * Math.PI / 180;
  const latRad = latitude * Math.PI / 180;
  
  // Calculate Ascendant longitude
  // Formula: tan(ASC) = cos(RAMC) / -(sin(ε) * tan(φ) + cos(ε) * sin(RAMC))
  const ramcRad = ramcDeg * Math.PI / 180;
  
  const y = Math.cos(ramcRad);
  const x = -(Math.sin(obliqRad) * Math.tan(latRad) + Math.cos(obliqRad) * Math.sin(ramcRad));
  
  let ascLon = Math.atan2(y, x) * 180 / Math.PI;
  
  // Adjust quadrant based on RAMC
  if (ramcDeg >= 0 && ramcDeg < 180) {
    ascLon = ascLon + 180;
  }
  if (ramcDeg >= 180 && ramcDeg < 360) {
    ascLon = ascLon + 360;
  }
  
  // Normalize to 0-360
  ascLon = ((ascLon % 360) + 360) % 360;
  
  return getDetailedPosition(ascLon);
};

/**
 * Calculate Vertex - The "fated encounter" point
 * The Vertex is the point where the prime vertical intersects the ecliptic on the western side
 * It represents fated encounters and destined meetings
 */
export const calculateVertex = (
  date: Date,
  latitude: number,
  longitude: number
): { sign: string; degree: number; minutes: number; seconds: number } => {
  const gst = Astronomy.SiderealTime(date);
  const localLST = (gst + longitude / 15 + 24) % 24;
  const ramcDeg = localLST * 15;
  
  const obliquity = 23.4392911;
  const obliqRad = obliquity * Math.PI / 180;
  
  // Vertex is calculated using colatitude (90 - latitude) as if looking from the equator
  const colatitude = 90 - latitude;
  const colatRad = colatitude * Math.PI / 180;
  
  const ramcRad = ramcDeg * Math.PI / 180;
  
  // Calculate anti-Ascendant (western horizon intersection)
  const y = Math.cos(ramcRad);
  const x = -(Math.sin(obliqRad) * Math.tan(colatRad) + Math.cos(obliqRad) * Math.sin(ramcRad));
  
  let vtxLon = Math.atan2(y, x) * 180 / Math.PI;
  
  // Adjust for western hemisphere (opposite the Ascendant calculation)
  if (ramcDeg >= 0 && ramcDeg < 180) {
    vtxLon = vtxLon + 180;
  }
  if (ramcDeg >= 180 && ramcDeg < 360) {
    vtxLon = vtxLon + 360;
  }
  
  // Normalize
  vtxLon = ((vtxLon % 360) + 360) % 360;
  
  return getDetailedPosition(vtxLon);
};

/**
 * Calculate Part of Fortune (Lot of Fortune)
 * Day births: ASC + Moon - Sun
 * Night births: ASC + Sun - Moon
 * Represents material fortune, prosperity, and where luck flows
 */
export const calculatePartOfFortune = (
  ascLongitude: number,
  sunLongitude: number,
  moonLongitude: number,
  date: Date,
  latitude: number
): { sign: string; degree: number; minutes: number; seconds: number } => {
  // Determine if day or night birth (Sun above/below horizon)
  // Simple approximation: if Sun's longitude is between 0-180° from ASC, it's above horizon
  let sunAbove = false;
  let diff = sunLongitude - ascLongitude;
  if (diff < 0) diff += 360;
  sunAbove = diff < 180;
  
  let pofLongitude: number;
  
  if (sunAbove) {
    // Day birth: ASC + Moon - Sun
    pofLongitude = ascLongitude + moonLongitude - sunLongitude;
  } else {
    // Night birth: ASC + Sun - Moon
    pofLongitude = ascLongitude + sunLongitude - moonLongitude;
  }
  
  // Normalize to 0-360
  pofLongitude = ((pofLongitude % 360) + 360) % 360;
  
  return getDetailedPosition(pofLongitude);
};

// US timezone regions for auto-detection
const US_TIMEZONE_REGIONS: Record<string, { standard: number; daylight: number; abbrevStandard: string; abbrevDaylight: string }> = {
  // Eastern
  'new york': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  'boston': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  'philadelphia': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  'miami': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  'atlanta': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  'washington': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  'detroit': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  'cleveland': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  'pittsburgh': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  'charlotte': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  'orlando': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  'raleigh': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  'hackensack': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  'newark': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  'jersey city': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  ', nj': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  ', ny': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  ', ma': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  ', ct': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  ', pa': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  ', fl': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  ', ga': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  ', nc': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  ', sc': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  ', va': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  ', md': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  ', dc': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  ', oh': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  ', mi': { standard: -5, daylight: -4, abbrevStandard: 'EST', abbrevDaylight: 'EDT' },
  // Central
  'chicago': { standard: -6, daylight: -5, abbrevStandard: 'CST', abbrevDaylight: 'CDT' },
  'houston': { standard: -6, daylight: -5, abbrevStandard: 'CST', abbrevDaylight: 'CDT' },
  'dallas': { standard: -6, daylight: -5, abbrevStandard: 'CST', abbrevDaylight: 'CDT' },
  'san antonio': { standard: -6, daylight: -5, abbrevStandard: 'CST', abbrevDaylight: 'CDT' },
  'austin': { standard: -6, daylight: -5, abbrevStandard: 'CST', abbrevDaylight: 'CDT' },
  'minneapolis': { standard: -6, daylight: -5, abbrevStandard: 'CST', abbrevDaylight: 'CDT' },
  'milwaukee': { standard: -6, daylight: -5, abbrevStandard: 'CST', abbrevDaylight: 'CDT' },
  'kansas city': { standard: -6, daylight: -5, abbrevStandard: 'CST', abbrevDaylight: 'CDT' },
  'st louis': { standard: -6, daylight: -5, abbrevStandard: 'CST', abbrevDaylight: 'CDT' },
  'new orleans': { standard: -6, daylight: -5, abbrevStandard: 'CST', abbrevDaylight: 'CDT' },
  'nashville': { standard: -6, daylight: -5, abbrevStandard: 'CST', abbrevDaylight: 'CDT' },
  'memphis': { standard: -6, daylight: -5, abbrevStandard: 'CST', abbrevDaylight: 'CDT' },
  'oklahoma city': { standard: -6, daylight: -5, abbrevStandard: 'CST', abbrevDaylight: 'CDT' },
  // Mountain
  'denver': { standard: -7, daylight: -6, abbrevStandard: 'MST', abbrevDaylight: 'MDT' },
  'phoenix': { standard: -7, daylight: -7, abbrevStandard: 'MST', abbrevDaylight: 'MST' }, // Arizona doesn't observe DST
  'albuquerque': { standard: -7, daylight: -6, abbrevStandard: 'MST', abbrevDaylight: 'MDT' },
  'salt lake city': { standard: -7, daylight: -6, abbrevStandard: 'MST', abbrevDaylight: 'MDT' },
  'tucson': { standard: -7, daylight: -7, abbrevStandard: 'MST', abbrevDaylight: 'MST' }, // Arizona
  'las vegas': { standard: -8, daylight: -7, abbrevStandard: 'PST', abbrevDaylight: 'PDT' },
  'el paso': { standard: -7, daylight: -6, abbrevStandard: 'MST', abbrevDaylight: 'MDT' },
  'boise': { standard: -7, daylight: -6, abbrevStandard: 'MST', abbrevDaylight: 'MDT' },
  // Pacific
  'los angeles': { standard: -8, daylight: -7, abbrevStandard: 'PST', abbrevDaylight: 'PDT' },
  'san francisco': { standard: -8, daylight: -7, abbrevStandard: 'PST', abbrevDaylight: 'PDT' },
  'san diego': { standard: -8, daylight: -7, abbrevStandard: 'PST', abbrevDaylight: 'PDT' },
  'seattle': { standard: -8, daylight: -7, abbrevStandard: 'PST', abbrevDaylight: 'PDT' },
  'portland': { standard: -8, daylight: -7, abbrevStandard: 'PST', abbrevDaylight: 'PDT' },
  'sacramento': { standard: -8, daylight: -7, abbrevStandard: 'PST', abbrevDaylight: 'PDT' },
  'san jose': { standard: -8, daylight: -7, abbrevStandard: 'PST', abbrevDaylight: 'PDT' },
  'fresno': { standard: -8, daylight: -7, abbrevStandard: 'PST', abbrevDaylight: 'PDT' },
  // Alaska
  'anchorage': { standard: -9, daylight: -8, abbrevStandard: 'AKST', abbrevDaylight: 'AKDT' },
  // Hawaii
  'honolulu': { standard: -10, daylight: -10, abbrevStandard: 'HST', abbrevDaylight: 'HST' }, // Hawaii doesn't observe DST
};

// Check if a date falls within US Daylight Saving Time
// US DST: 2nd Sunday of March to 1st Sunday of November (since 2007)
// Before 2007: 1st Sunday of April to last Sunday of October
export const isUSDaylightSavingTime = (date: Date): boolean => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  if (year >= 2007) {
    // Current rules: 2nd Sunday of March to 1st Sunday of November
    const marchSecondSunday = getNthSundayOfMonth(year, 2, 2); // March, 2nd Sunday
    const novemberFirstSunday = getNthSundayOfMonth(year, 10, 1); // November, 1st Sunday
    
    const dateNum = month * 100 + day;
    const dstStart = 2 * 100 + marchSecondSunday;
    const dstEnd = 10 * 100 + novemberFirstSunday;
    
    return dateNum >= dstStart && dateNum < dstEnd;
  } else {
    // Old rules: 1st Sunday of April to last Sunday of October
    const aprilFirstSunday = getNthSundayOfMonth(year, 3, 1); // April, 1st Sunday
    const octoberLastSunday = getLastSundayOfMonth(year, 9); // October, last Sunday
    
    const dateNum = month * 100 + day;
    const dstStart = 3 * 100 + aprilFirstSunday;
    const dstEnd = 9 * 100 + octoberLastSunday;
    
    return dateNum >= dstStart && dateNum < dstEnd;
  }
};

const getNthSundayOfMonth = (year: number, month: number, n: number): number => {
  const firstDay = new Date(year, month, 1);
  const firstSunday = 1 + (7 - firstDay.getDay()) % 7;
  return firstSunday + (n - 1) * 7;
};

const getLastSundayOfMonth = (year: number, month: number): number => {
  const lastDay = new Date(year, month + 1, 0);
  const daysToSubtract = lastDay.getDay();
  return lastDay.getDate() - daysToSubtract;
};

// Auto-detect timezone offset from location and date
export const detectTimezoneFromLocation = (location: string, date: Date): { offset: number; abbrev: string } | null => {
  const lowerLocation = location.toLowerCase();
  
  for (const [city, tz] of Object.entries(US_TIMEZONE_REGIONS)) {
    if (lowerLocation.includes(city)) {
      const isDST = isUSDaylightSavingTime(date);
      return {
        offset: isDST ? tz.daylight : tz.standard,
        abbrev: isDST ? tz.abbrevDaylight : tz.abbrevStandard,
      };
    }
  }
  
  return null;
};

// Calculate natal chart positions from birth date/time with timezone offset
export const calculateNatalChart = (
  birthDate: string, 
  birthTime: string,
  timezoneOffsetHours: number = 0, // e.g., -5 for EST, -8 for PST
  birthLocation: string = '' // Optional location for auto-detect
): Record<string, { sign: string; degree: number; minutes: number; seconds: number; isRetrograde?: boolean }> => {
  // Parse date and time
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hours, minutes] = birthTime ? birthTime.split(':').map(Number) : [12, 0];
  
  // Try to auto-detect timezone if location provided
  let finalOffset = timezoneOffsetHours;
  let coordinates: { lat: number; lon: number } | null = null;
  
  if (birthLocation) {
    const tempDate = new Date(year, month - 1, day);
    const detected = detectTimezoneFromLocation(birthLocation, tempDate);
    if (detected) {
      finalOffset = detected.offset;
    }
    // Get coordinates for Ascendant calculation
    coordinates = getCoordinatesFromLocation(birthLocation);
  }
  
  // Convert local time to UTC by subtracting the timezone offset
  // If someone was born at 10:00 AM in EST (-5), that's 15:00 UTC
  const utcHours = hours - finalOffset;
  
  const date = new Date(Date.UTC(year, month - 1, day, utcHours, minutes, 0));
  
  const getPosition = (body: Astronomy.Body): { sign: string; degree: number; minutes: number; seconds: number; isRetrograde?: boolean } => {
    try {
      let longitude: number;
      if (body === Astronomy.Body.Moon) {
        const moon = Astronomy.GeoMoon(date);
        const ecliptic = Astronomy.Ecliptic(moon);
        longitude = ecliptic.elon;
      } else {
        const vector = Astronomy.GeoVector(body, date, false);
        const ecliptic = Astronomy.Ecliptic(vector);
        longitude = ecliptic.elon;
      }
      
      const position = getDetailedPosition(longitude);
      
      // Check retrograde for applicable planets (not Sun or Moon)
      if (body !== Astronomy.Body.Sun && body !== Astronomy.Body.Moon) {
        const isRetro = isPlanetRetrograde(body, date);
        return { ...position, isRetrograde: isRetro };
      }
      
      return position;
    } catch {
      return { sign: 'Aries', degree: 0, minutes: 0, seconds: 0 };
    }
  };

  const northNode = getDetailedNodePosition(date);
  const chiron = getDetailedChironPosition(date);
  const lilith = getDetailedLilithPosition(date);
  const ceres = getDetailedCeresPosition(date);
  const pallas = getDetailedPallasPosition(date);
  const juno = getDetailedJunoPosition(date);
  const vesta = getDetailedVestaPosition(date);
  
  // Calculate Ascendant, Vertex, and Part of Fortune if we have coordinates
  let ascendant: { sign: string; degree: number; minutes: number; seconds: number } = { sign: '', degree: 0, minutes: 0, seconds: 0 };
  let vertex: { sign: string; degree: number; minutes: number; seconds: number } = { sign: '', degree: 0, minutes: 0, seconds: 0 };
  let partOfFortune: { sign: string; degree: number; minutes: number; seconds: number } = { sign: '', degree: 0, minutes: 0, seconds: 0 };
  
  // Get Sun and Moon longitudes for Part of Fortune
  const sunPos = getPosition(Astronomy.Body.Sun);
  const moonPos = getPosition(Astronomy.Body.Moon);
  const sunLongitude = ZODIAC_SIGNS.findIndex(s => s.name === sunPos.sign) * 30 + sunPos.degree + (sunPos.minutes / 60);
  const moonLongitude = ZODIAC_SIGNS.findIndex(s => s.name === moonPos.sign) * 30 + moonPos.degree + (moonPos.minutes / 60);
  
  if (coordinates) {
    try {
      ascendant = calculateAscendant(date, coordinates.lat, coordinates.lon);
      
      // Calculate Vertex (anti-Ascendant on the Western horizon)
      vertex = calculateVertex(date, coordinates.lat, coordinates.lon);
      
      // Calculate Part of Fortune
      const ascLongitude = ZODIAC_SIGNS.findIndex(s => s.name === ascendant.sign) * 30 + ascendant.degree + (ascendant.minutes / 60);
      partOfFortune = calculatePartOfFortune(ascLongitude, sunLongitude, moonLongitude, date, coordinates.lat);
    } catch {
      // If calculation fails, leave empty for manual entry
    }
  }
  
  return {
    Sun: sunPos,
    Moon: moonPos,
    Mercury: getPosition(Astronomy.Body.Mercury),
    Venus: getPosition(Astronomy.Body.Venus),
    Mars: getPosition(Astronomy.Body.Mars),
    Jupiter: getPosition(Astronomy.Body.Jupiter),
    Saturn: getPosition(Astronomy.Body.Saturn),
    Uranus: getPosition(Astronomy.Body.Uranus),
    Neptune: getPosition(Astronomy.Body.Neptune),
    Pluto: getPosition(Astronomy.Body.Pluto),
    NorthNode: northNode,
    Chiron: chiron,
    Lilith: lilith,
    Ceres: ceres,
    Pallas: pallas,
    Juno: juno,
    Vesta: vesta,
    Ascendant: ascendant,
    Vertex: vertex,
    PartOfFortune: partOfFortune,
  };
};

// Get all planetary positions for a date
// Global cache for planetary positions to avoid repeated heavy calculations
const POSITIONS_CACHE = new Map<string, PlanetaryPositions>();

export const getPlanetaryPositions = (date: Date): PlanetaryPositions => {
  // Cache key: round to nearest minute for reasonable caching
  const cacheKey = new Date(Math.floor(date.getTime() / 60000) * 60000).toISOString();
  const cached = POSITIONS_CACHE.get(cacheKey);
  if (cached) return cached;

  const getPosition = (body: Astronomy.Body): ZodiacPosition => {
    try {
      if (body === Astronomy.Body.Moon) {
        const moon = Astronomy.GeoMoon(date);
        const ecliptic = Astronomy.Ecliptic(moon);
        return longitudeToZodiac(ecliptic.elon);
      }
      const vector = Astronomy.GeoVector(body, date, false);
      const ecliptic = Astronomy.Ecliptic(vector);
      return longitudeToZodiac(ecliptic.elon);
    } catch {
      return { sign: '♈', signName: 'Aries', degree: 0, minutes: 0, rawDegree: 0, fullDegree: "0°00' ♈" };
    }
  };

  const nodes = getNodePositions(date);
  const chiron = getChironPosition(date);
  const lilith = getBlackMoonLilith(date);
  const eris = getErisPosition(date);

  const result: PlanetaryPositions = {
    moon: getPosition(Astronomy.Body.Moon),
    sun: getPosition(Astronomy.Body.Sun),
    mercury: getPosition(Astronomy.Body.Mercury),
    venus: getPosition(Astronomy.Body.Venus),
    mars: getPosition(Astronomy.Body.Mars),
    jupiter: getPosition(Astronomy.Body.Jupiter),
    saturn: getPosition(Astronomy.Body.Saturn),
    uranus: getPosition(Astronomy.Body.Uranus),
    neptune: getPosition(Astronomy.Body.Neptune),
    pluto: getPosition(Astronomy.Body.Pluto),
    northNode: nodes.north,
    southNode: nodes.south,
    chiron,
    lilith,
    eris,
  };

  POSITIONS_CACHE.set(cacheKey, result);
  return result;
};

// Check if Mercury is retrograde
export const isMercuryRetrograde = (date: Date): boolean => {
  try {
    // Use isPlanetRetrograde for consistency — it handles the zodiac wrap correctly
    return isPlanetRetrograde(Astronomy.Body.Mercury, date);
  } catch {
    return false;
  }
};

// Get moon phase using astronomy-engine
// Note: Major phases (New, Full, Quarter) are tightened to ~12 degree range (~1 day window)
// so we don't show "Full Moon" for days when the moon has clearly moved past that point
export const getMoonPhase = (date: Date): MoonPhase => {
  const phase = Astronomy.MoonPhase(date);
  const illumination = Astronomy.Illumination(Astronomy.Body.Moon, date);

  let phaseIcon: string;
  let phaseName: string;

  // Tighter ranges for major phases (~12 degrees = roughly 1 day)
  // New Moon: 0° (range: 354-6°)
  // First Quarter: 90° (range: 84-96°)  
  // Full Moon: 180° (range: 174-186°)
  // Last Quarter: 270° (range: 264-276°)
  
  if (phase >= 354 || phase < 6) {
    phaseIcon = '🌑'; phaseName = 'New Moon';
  } else if (phase >= 6 && phase < 84) {
    phaseIcon = '🌒'; phaseName = 'Waxing Crescent';
  } else if (phase >= 84 && phase < 96) {
    phaseIcon = '🌓'; phaseName = 'First Quarter';
  } else if (phase >= 96 && phase < 174) {
    phaseIcon = '🌔'; phaseName = 'Waxing Gibbous';
  } else if (phase >= 174 && phase < 186) {
    phaseIcon = '🌕'; phaseName = 'Full Moon';
  } else if (phase >= 186 && phase < 264) {
    phaseIcon = '🌖'; phaseName = 'Waning Gibbous';
  } else if (phase >= 264 && phase < 276) {
    phaseIcon = '🌗'; phaseName = 'Last Quarter';
  } else if (phase >= 276 && phase < 315) {
    phaseIcon = '🌘'; phaseName = 'Waning Crescent';
  } else {
    phaseIcon = '🌘'; phaseName = 'Balsamic';
  }

  const isBalsamic = phase >= 315 && phase < 354;

  return {
    phaseIcon,
    phaseName,
    isBalsamic,
    phase,
    illumination: illumination.phase_fraction,
  };
};

// Traditional moon names by month
const MOON_NAMES: Record<number, string> = {
  0: 'Wolf Moon',
  1: 'Snow Moon',
  2: 'Worm Moon',
  3: 'Pink Moon',
  4: 'Flower Moon',
  5: 'Strawberry Moon',
  6: 'Buck Moon',
  7: 'Sturgeon Moon',
  8: 'Harvest Moon',
  9: "Hunter's Moon",
  10: 'Beaver Moon',
  11: 'Cold Moon',
};

// Returns the calendar month (0-11) and year of a date in America/New_York time.
// Used to detect Blue Moons consistently with how phases are bucketed by ET day.
const getETMonthYear = (d: Date): { month: number; year: number } => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(d);
  const month = Number(parts.find((p) => p.type === 'month')?.value) - 1;
  const year = Number(parts.find((p) => p.type === 'year')?.value);
  return { month, year };
};

/**
 * Determine the traditional name for a Full Moon, with Blue Moon override.
 * A "calendar Blue Moon" is the second full moon within the same calendar month.
 * If an earlier full moon exists within the same ET calendar month as `fullMoonDate`,
 * this returns 'Blue Moon'; otherwise returns the traditional monthly name.
 */
export const getFullMoonName = (fullMoonDate: Date): string => {
  try {
    const { month, year } = getETMonthYear(fullMoonDate);
    // Look ~31 days back for a prior full moon (lunation ~29.5 days).
    const searchBack = new Date(fullMoonDate.getTime() - 31 * 24 * 60 * 60 * 1000);
    const prev = Astronomy.SearchMoonPhase(180, searchBack, 32);
    if (prev && prev.date.getTime() < fullMoonDate.getTime() - 60 * 1000) {
      const prevMY = getETMonthYear(prev.date);
      if (prevMY.month === month && prevMY.year === year) {
        return 'Blue Moon';
      }
    }
  } catch {
    // fall through to traditional name
  }
  return MOON_NAMES[getETMonthYear(fullMoonDate).month] || '';
};

// Get exact lunar phase time if New Moon, Full Moon, First Quarter, or Last Quarter occurs on this calendar day (Eastern Time).
// We search for the nearest event around the day, but ONLY return it if the event's ET date matches
// the day being rendered. IMPORTANT: We treat the incoming `date` as a calendar-day identifier
// (year/month/day), not as an instant in the user's local timezone.
export const getExactLunarPhase = (date: Date): ExactLunarPhase | null => {
  try {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Calendar day key (YYYY-MM-DD) for the day the user clicked in the calendar UI.
    const etDayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Start searching a bit before the day to ensure we catch events that occur early ET.
    // Use a stable midday UTC anchor derived from the calendar day to avoid user-timezone skew.
    const searchStart = new Date(Date.UTC(year, month, day - 2, 12, 0, 0));

    const getETKey = (d: Date) =>
      new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(d);

    const buildPhase = (
      type: ExactLunarPhase['type'],
      eventDate: Date,
      emoji: string,
    ): ExactLunarPhase => {
      const moonPos = Astronomy.GeoMoon(eventDate);
      const ecliptic = Astronomy.Ecliptic(moonPos);
      const zodiac = longitudeToZodiac(ecliptic.elon);
      const distance = moonPos.Length() * 149597870.7; // AU -> km

      const base: ExactLunarPhase = {
        type,
        time: eventDate,
        position: zodiac.fullDegree,
        sign: zodiac.signName,
        emoji,
        name: type === 'New Moon' || type === 'Full Moon' ? MOON_NAMES[date.getMonth()] : null,
        isSupermoon: false,
        distance: Math.round(distance),
      };

      if (type === 'Full Moon') {
        const sunPos = Astronomy.GeoVector(Astronomy.Body.Sun, eventDate, false);
        const sunEcliptic = Astronomy.Ecliptic(sunPos);
        const sunZodiac = longitudeToZodiac(sunEcliptic.elon);
        base.sunPosition = sunZodiac.fullDegree;
        base.sunSign = sunZodiac.signName;

        base.isSupermoon = distance < 361000;
        if (base.isSupermoon) {
          const prevFullMoon = Astronomy.SearchMoonPhase(180, new Date(eventDate.getTime() - 31 * 24 * 60 * 60 * 1000), 80);
          const nextFullMoon = Astronomy.SearchMoonPhase(180, new Date(eventDate.getTime() + 1 * 24 * 60 * 60 * 1000), 80);

          const prevDistance = prevFullMoon ? Astronomy.GeoMoon(prevFullMoon.date).Length() * 149597870.7 : 999999;
          const nextDistance = nextFullMoon ? Astronomy.GeoMoon(nextFullMoon.date).Length() * 149597870.7 : 999999;

          const prevIsSuper = prevDistance < 361000;
          const nextIsSuper = nextDistance < 361000;

          base.supermoonSequence = prevIsSuper && nextIsSuper
            ? 'Part of supermoon sequence'
            : (!prevIsSuper && nextIsSuper)
              ? 'First of consecutive supermoons'
              : (prevIsSuper && !nextIsSuper)
                ? 'Last of consecutive supermoons'
                : '';
        }
      }

      if (type === 'New Moon') {
        base.isSupermoon = distance < 361000;
      }

      return base;
    };

    const candidates: Array<{ type: ExactLunarPhase['type']; angle: number; emoji: string }> = [
      { type: 'New Moon', angle: 0, emoji: '🌑' },
      { type: 'Full Moon', angle: 180, emoji: '🌕' },
      { type: 'First Quarter', angle: 90, emoji: '🌓' },
      { type: 'Last Quarter', angle: 270, emoji: '🌗' },
    ];

    for (const c of candidates) {
      const evt = Astronomy.SearchMoonPhase(c.angle, searchStart, 120);
      if (!evt) continue;
      if (getETKey(evt.date) !== etDayKey) continue;
      return buildPhase(c.type, evt.date, c.emoji);
    }
  } catch (error) {
    console.error('Error finding exact lunar phase:', error);
  }

  return null;
};

// Find the nearest New Moon or Full Moon time to a given date
export const findNearestMajorPhaseTime = (date: Date, phaseName: string): { date: Date; type: string } | null => {
  try {
    const angle = phaseName === 'New Moon' ? 0 : phaseName === 'Full Moon' ? 180 : phaseName === 'First Quarter' ? 90 : 270;
    const nearby = Astronomy.SearchMoonPhase(angle, new Date(date.getTime() - 3 * 86400000), 6);
    if (nearby) {
      return { date: nearby.date, type: phaseName };
    }
  } catch {}
  return null;
};

// Calculate aspects between two longitudes (degrees)
const calculateAspect = (lon1: number, lon2: number) => {
  const diff = Math.abs(((lon2 - lon1 + 180) % 360) - 180);

  if (diff < 8) return { type: 'conjunction', symbol: '☌', orb: diff };
  if (Math.abs(diff - 60) < 6) return { type: 'sextile', symbol: '⚹', orb: Math.abs(diff - 60) };
  if (Math.abs(diff - 90) < 8) return { type: 'square', symbol: '□', orb: Math.abs(diff - 90) };
  if (Math.abs(diff - 120) < 8) return { type: 'trine', symbol: '△', orb: Math.abs(diff - 120) };
  if (Math.abs(diff - 180) < 8) return { type: 'opposition', symbol: '☍', orb: Math.abs(diff - 180) };

  return null;
};

const getSignIndex = (signName: string): number => {
  return ZODIAC_SIGNS.findIndex(s => s.name === signName);
};

const getMoonAspectDescription = (type: string): string => {
  const descriptions: Record<string, string> = {
    conjunction: 'Deep emotional connection to your core self',
    sextile: 'Harmonious flow of emotions',
    square: 'Tension between feelings and balance',
    trine: 'Easy emotional expression',
    opposition: 'Emotional awareness through relationships',
  };
  return descriptions[type] || '';
};

const getVenusAspectDescription = (type: string): string => {
  const descriptions: Record<string, string> = {
    conjunction: 'Love and beauty amplified',
    sextile: 'Harmonious connections',
    square: 'Relationship tensions to resolve',
    trine: 'Grace and ease in relationships',
    opposition: 'Balancing self and others in love',
  };
  return descriptions[type] || '';
};

/**
 * @deprecated Use TransitAlertsCard or calculatePersonalTransits from transitAlerts.ts for accurate natal chart-based transits
 * This function used hardcoded positions and is no longer accurate
 */
export const getPersonalTransits = (planets: PlanetaryPositions, userData: UserData | null): PersonalTransits => {
  return { hasTransits: false, transits: [] };
};

// Check for major ingresses — DEPRECATED: now handled by detectPlanetaryIngresses
// which checks actual sign changes day-over-day instead of "is planet in sign X"
export const checkMajorIngresses = (_planets: PlanetaryPositions): Ingress[] => {
  return [];
};

// Get energy rating
export const getEnergyRating = (moonPhase: MoonPhase, mercuryRetro: boolean): EnergyRating => {
  if (moonPhase.isBalsamic) {
    return { level: 'rest', label: 'Rest/Balsamic' };
  }
  if (mercuryRetro) {
    return { level: 'caution', label: 'Mercury Rx' };
  }
  if (moonPhase.phaseName.includes('Waxing') && !mercuryRetro) {
    return { level: 'high', label: 'Productive' };
  }
  return { level: 'moderate', label: 'Moderate' };
};

// Daily motion for planets (average degrees per day)
const DAILY_MOTION: Record<string, number> = {
  moon: 13.2,
  mercury: 1.0,
  venus: 1.0,
  sun: 1.0,
  mars: 0.5,
  jupiter: 0.08,
  saturn: 0.03,
  uranus: 0.01,
  neptune: 0.006,
  pluto: 0.004,
};

// Determine if aspect is applying (building toward exact) or separating (moving away from exact)
export const determineApplying = (
  planet1: string,
  planet2: string,
  planet1Data: ZodiacPosition,
  planet2Data: ZodiacPosition,
  aspectType: string
): boolean => {
  const speed1 = DAILY_MOTION[planet1] || 0;
  const speed2 = DAILY_MOTION[planet2] || 0;

  // Get longitudes
  const lon1 = getSignIndex(planet1Data.signName) * 30 + planet1Data.degree;
  const lon2 = getSignIndex(planet2Data.signName) * 30 + planet2Data.degree;

  // Get target angle for aspect type
  const aspectAngles: Record<string, number> = {
    conjunction: 0,
    sextile: 60,
    square: 90,
    trine: 120,
    opposition: 180,
  };
  const targetAngle = aspectAngles[aspectType] || 0;

  // Calculate current angular separation (normalized to 0-180)
  let separation = lon1 - lon2;
  if (separation > 180) separation -= 360;
  if (separation < -180) separation += 360;
  const currentOrb = Math.abs(Math.abs(separation) - targetAngle);

  // Calculate what the separation will be tomorrow based on speeds
  // Faster planet closes the gap if it's behind, or increases it if ahead
  const tomorrowLon1 = lon1 + speed1;
  const tomorrowLon2 = lon2 + speed2;
  let tomorrowSeparation = tomorrowLon1 - tomorrowLon2;
  if (tomorrowSeparation > 180) tomorrowSeparation -= 360;
  if (tomorrowSeparation < -180) tomorrowSeparation += 360;
  const tomorrowOrb = Math.abs(Math.abs(tomorrowSeparation) - targetAngle);

  // If orb is getting smaller, aspect is applying; if getting larger, separating
  return tomorrowOrb < currentOrb;
};

// Ingress interpretations for Mercury, Venus, and Mars entering each sign
const INGRESS_INTERPRETATIONS: Record<string, Record<string, string>> = {
  mercury: {
    Capricorn: "Thinking becomes practical and goal-oriented. Communication takes on a serious, professional tone. Excellent for strategic planning, career discussions, and long-term goal setting. Mental discipline peaks.",
    Aquarius: "Innovative thinking and original ideas flourish. Communication becomes unconventional and forward-thinking. Perfect for technology, group discussions, and humanitarian causes. Note: some modern sources call this Mercury's exaltation, but traditionally Mercury is exalted in Virgo.",
    Pisces: "Mercury in detriment AND fall — its hardest placement. Thoughts become dreamy, intuitive, and artistic. Communication may be less precise but deeply imaginative. Great for poetry, music, and spiritual reflection. Pay extra attention to details and contracts.",
    Aries: "Quick, decisive thinking returns. Communication becomes direct and competitive. Great for debates, negotiations, and pioneering ideas. Watch for impulsive words.",
    Taurus: "Thoughts slow down and become more practical. Communication focuses on values and material matters. Excellent for financial planning and sensory experiences. Stubborn opinions may surface.",
    Gemini: "Mercury returns home - mental agility and curiosity peak. Communication flows easily with wit and versatility. Perfect for learning, networking, and multitasking. Watch for scattered focus.",
    Cancer: "Thoughts turn emotional and intuitive. Communication becomes nurturing but may be indirect. Excellent for family discussions, therapy, and expressing feelings. Memory sharpens, especially for emotional experiences.",
    Leo: "Mental expression becomes confident, dramatic, and creative. Communication demands attention and respect. Perfect for presentations, performances, and leadership announcements. Pride may affect objectivity.",
    Virgo: "Mercury returns home - analytical skills peak. Thinking becomes precise, critical, and service-oriented. Perfect for editing, health planning, and detailed work. Communication focuses on improvement and efficiency.",
    Libra: "Thoughts seek balance and harmony. Communication becomes diplomatic, fair, and relationship-focused. Excellent for negotiations, mediation, and partnership discussions. Decision-making may slow down weighing options.",
    Scorpio: "Mental energy intensifies - thoughts probe beneath surfaces. Communication becomes penetrating, strategic, and transformative. Perfect for research, psychology, and deep conversations. Secrets may be revealed or kept.",
    Sagittarius: "Thinking expands with optimism and philosophical bent. Communication becomes enthusiastic, honest, and truth-seeking. Perfect for teaching, travel planning, and big-picture discussions. May overcommit or exaggerate.",
  },
  venus: {
    Capricorn: "Love becomes serious, committed, and long-term focused. Affection expressed through acts of service and responsibility. Attraction to maturity, success, and stability. Good for defining relationships and business partnerships.",
    Aquarius: "Love energy shifts to friendship and intellectual connection. Attraction to uniqueness and independence. Relationships need freedom and mental stimulation. Great for unconventional partnerships and group social activities.",
    Pisces: "Venus exalted - love becomes deeply romantic, compassionate, and spiritual. Boundaries dissolve in relationships. Heightened artistic sensitivity and desire for soulmate connection. Watch for idealization or martyrdom.",
    Aries: "Passion ignites - love becomes bold, direct, and spontaneous. Attraction to confidence and initiative. Pursuit energy increases. Great for new relationships but may rush commitment. Independence remains important.",
    Taurus: "Venus returns home - sensuality and stability peak. Love expressed through physical affection, gifts, and building security. Slow but enduring attraction. Perfect for deepening commitments and enjoying pleasures.",
    Gemini: "Love becomes playful, communicative, and intellectually stimulating. Attraction to wit and variety. Social calendar fills up. Multiple interests or flirtations possible. Connection through conversation.",
    Cancer: "Affection becomes nurturing, protective, and family-oriented. Emotional security in relationships prioritized. Home becomes romantic sanctuary. Intuitive understanding of partner's needs. May become clingy.",
    Leo: "Love becomes grand, generous, and attention-seeking. Romance takes center stage with dramatic gestures. Loyalty and admiration important. Creative dates and public displays of affection increase. Pride in relationships.",
    Virgo: "Love expressed through helpful acts and thoughtful details. Attraction to health-consciousness and reliability. Perfectionist standards may increase. Analysis of relationships begins. Service becomes love language.",
    Libra: "Venus returns home - charm, grace, and partnership focus peak. Balance and harmony in relationships essential. Diplomacy in love. Perfect for commitments, weddings, and resolving conflicts. Indecision possible.",
    Scorpio: "Love intensifies with passion, depth, and transformation. Emotional and physical intimacy deepen. Jealousy or possessiveness may surface. Powerful magnetic attraction. Secrets and vulnerability in relationships.",
    Sagittarius: "Love becomes adventurous, optimistic, and freedom-loving. Attraction to honesty and shared philosophies. Relationships expand horizons. Great for travel with partners and exploring new experiences together.",
  },
  mars: {
    Capricorn: "Mars exalted - drive becomes strategic, disciplined, and achievement-oriented. Energy channeled into long-term goals and career advancement. Excellent for sustained effort and climbing ambitions. Authority and control increase.",
    Aquarius: "Action energy shifts to innovation and group causes. Drive directed toward progress and reform. Fighting for ideals and humanitarian goals. Energy works best in collaborative, unconventional approaches.",
    Pisces: "Energy becomes diffused and spiritually directed. Action motivated by compassion and artistic vision. Passive-aggressive tendencies increase. Excellent for creative pursuits and healing work. Boundaries around energy important.",
    Aries: "Mars returns home - physical energy and courage peak. Initiative, independence, and competitive drive surge. Perfect for starting new projects and athletic pursuits. Impulsiveness and anger flash quickly.",
    Taurus: "Action becomes steady, persistent, and focused on material security. Energy applied to building lasting value. Stubbornness increases. Excellent for physical work and sensual pleasures. Slow to anger but powerful when provoked.",
    Gemini: "Mental energy and restlessness increase. Drive directed toward communication, learning, and variety. Multi-tasking peaks. Scattered efforts possible. Great for debates, negotiations, and quick decisive action.",
    Cancer: "Action motivated by emotional security and family protection. Energy channeled into home and nurturing. Passive-aggressive tendencies increase. Excellent for domestic projects and defending loved ones.",
    Leo: "Energy becomes dramatic, confident, and creative. Drive for recognition and self-expression intensifies. Leadership abilities surge. Excellent for performance and courageous acts. Pride fuels action.",
    Virgo: "Energy directed toward service, health, and detailed work. Drive for perfection and improvement increases. Excellent for analytical work and health routines. Critical tendencies may spike.",
    Libra: "Mars in detriment - energy seeks partnership and harmony. Action becomes diplomatic but indecisive. Drive channeled into relationships and justice. Passive-aggressive tendencies increase. Good for collaborative action.",
    Scorpio: "Mars traditional ruler - intensity and strategic power peak. Energy becomes magnetic, transformative, and relentless. Excellent for research, crisis management, and deep transformative work. Control and privacy important.",
    Sagittarius: "Energy expands with enthusiasm and idealism. Action directed toward truth, adventure, and meaning. Drive for freedom and expansion. Excellent for travel, education, and philosophical pursuits. Over-extension possible.",
  },
};

// Get interpretation for a planet entering a sign
export const getIngressInterpretation = (planet: string, sign: string): string => {
  const planetLower = planet.toLowerCase();
  const interpretation = INGRESS_INTERPRETATIONS[planetLower]?.[sign];
  
  if (interpretation) {
    return interpretation;
  }
  
  // Default for planets not in the table (outer planets, etc.)
  return `${planet} enters ${sign} - a shift in how this planet's energy expresses itself.`;
};

// Calculate daily aspects between planets
export const calculateDailyAspects = (planets: PlanetaryPositions): Aspect[] => {
  
  const aspects: Aspect[] = [];
  const aspectTypes = [
    { angle: 0, name: 'conjunction', symbol: '☌' },
    { angle: 60, name: 'sextile', symbol: '⚹' },
    { angle: 90, name: 'square', symbol: '□' },
    { angle: 120, name: 'trine', symbol: '△' },
    { angle: 150, name: 'quincunx', symbol: '⚻' },
    { angle: 30, name: 'semisextile', symbol: '⚺' },
    { angle: 180, name: 'opposition', symbol: '☍' },
  ];

  // Include ALL planets for comprehensive aspect detection
  const planetList: (keyof PlanetaryPositions)[] = [
    'moon', 'sun', 'mercury', 'venus', 'mars', 
    'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'
  ];

  const getLongitude = (position: ZodiacPosition) => {
    const signIndex = getSignIndex(position.signName);
    return signIndex * 30 + position.degree;
  };

  for (let i = 0; i < planetList.length; i++) {
    for (let j = i + 1; j < planetList.length; j++) {
      const p1 = planetList[i];
      const p2 = planetList[j];
      const lon1 = getLongitude(planets[p1]);
      const lon2 = getLongitude(planets[p2]);

      // Correctly calculate the shortest angular distance between two longitudes
      let rawDiff = lon2 - lon1;
      // Normalize to -180 to +180 range
      while (rawDiff > 180) rawDiff -= 360;
      while (rawDiff < -180) rawDiff += 360;
      const diff = Math.abs(rawDiff);

      for (const aspectType of aspectTypes) {
        const orb = Math.abs(diff - aspectType.angle);
        const effectiveOrb = getOrbForPair(p1, p2, aspectType.name);
        
        if (orb < effectiveOrb) {
          // Calculate if applying or separating
          const isApplying = determineApplying(p1, p2, planets[p1], planets[p2], aspectType.name);
          
          aspects.push({
            planet1: p1,
            planet2: p2,
            type: aspectType.name,
            symbol: aspectType.symbol,
            orb: orb.toFixed(1),
            applying: isApplying,
          });
        }
      }
    }
  }

  // Sort by orb (tightest first) to prioritize near-exact aspects
  aspects.sort((a, b) => parseFloat(a.orb) - parseFloat(b.orb));

  return aspects;
};

/**
 * @deprecated Use getVOCMoonDetails from voidOfCourseMoon.ts for accurate ephemeris-based VOC calculation
 * This function uses a simplified approximation and should not be used for precise timing
 */
export const getVoidOfCourseMoon = (moonPhase: MoonPhase): VoidOfCourse => {
  console.warn('getVoidOfCourseMoon is deprecated - use getVOCMoonDetails from voidOfCourseMoon.ts for accurate ephemeris-based calculation');
  // Return false to force callers to use the proper ephemeris-based function
  return { isVOC: false };
};

// Planet colors for day coloring with meanings
export interface PlanetColorInfo {
  color: string;
  name: string;
  meaning: string;
}

export const PLANET_COLORS: Record<string, PlanetColorInfo> = {
  mars: { color: '#C74E4E', name: 'Mars', meaning: 'Action, energy, drive, courage, assertiveness' },
  venus: { color: '#E8D5CC', name: 'Venus', meaning: 'Love, beauty, values, relationships, harmony' },
  sun: { color: '#F4D03F', name: 'Sun', meaning: 'Core self, vitality, life force, confidence' },
  moon: { color: '#7FA3C7', name: 'Moon', meaning: 'Emotions, intuition, rhythms, nurturing' },
  mercury: { color: '#E8A558', name: 'Mercury', meaning: 'Communication, thinking, learning, connections' },
  jupiter: { color: '#9B7EBD', name: 'Jupiter', meaning: 'Growth, expansion, wisdom, luck, optimism' },
  saturn: { color: '#8B7355', name: 'Saturn', meaning: 'Structure, discipline, responsibility, limits' },
  uranus: { color: '#5DADE2', name: 'Uranus', meaning: 'Change, innovation, revolution, freedom' },
  neptune: { color: '#A9CCE3', name: 'Neptune', meaning: 'Dreams, intuition, spirituality, imagination' },
  pluto: { color: '#5D6D7E', name: 'Pluto', meaning: 'Transformation, power, rebirth, depth' },
};

// Get day colors based on planetary activity
export const getDayColors = (aspects: Aspect[], moonPhase: MoonPhase): DayColors => {
  const activePlanets = new Set<string>();

  aspects.forEach((asp) => {
    activePlanets.add(asp.planet1);
    activePlanets.add(asp.planet2);
  });

  if (moonPhase.isBalsamic) {
    return { primary: '#D4C5E8', secondary: null, label: 'Balsamic Rest' };
  }

  const colors = Array.from(activePlanets)
    .map((p) => PLANET_COLORS[p]?.color)
    .filter(Boolean);

  if (colors.length === 0) {
    return { primary: PLANET_COLORS.moon.color, secondary: null, label: 'Moon Focus' };
  } else if (colors.length === 1) {
    return { primary: colors[0], secondary: null, label: 'Single Planet' };
  } else {
    return { primary: colors[0], secondary: colors[1], label: 'Multiple Aspects' };
  }
};

// Day type descriptions based on dominant planetary energy
export interface DayType {
  label: string;
  emoji: string;
  symbol: string; // Planet symbol for display
  description: string;
}

export const DAY_TYPE_MAP: Record<string, DayType> = {
  mercury: { label: 'Think & Talk', emoji: '🧠', symbol: '☿', description: 'Great for writing, meetings, learning, signing contracts' },
  venus: { label: 'Love & Beauty', emoji: '💗', symbol: '♀', description: 'Perfect for romance, art, shopping, self-care' },
  mars: { label: 'Go & Do', emoji: '🔥', symbol: '♂', description: 'Best for exercise, starting projects, asserting yourself' },
  sun: { label: 'Shine & Lead', emoji: '✨', symbol: '☉', description: 'Ideal for visibility, leadership, creative expression' },
  moon: { label: 'Feel & Nurture', emoji: '🌙', symbol: '☽', description: 'Focus on home, family, self-care, emotional processing' },
  jupiter: { label: 'Grow & Expand', emoji: '♃', symbol: '♃', description: 'Lucky for travel, education, taking risks, big decisions' },
  saturn: { label: 'Build & Focus', emoji: '🏛️', symbol: '♄', description: 'Good for hard work, long-term planning, responsibilities' },
  uranus: { label: 'Break & Change', emoji: '⚡', symbol: '♅', description: 'Expect surprises, try new things, embrace the unexpected' },
  neptune: { label: 'Dream & Imagine', emoji: '🌊', symbol: '♆', description: 'Best for creativity, meditation, spiritual practices' },
  pluto: { label: 'Transform & Heal', emoji: '🦋', symbol: '♇', description: 'Deep inner work, letting go, psychological breakthroughs' },
};

// Lucky day indicators based on beneficial aspects
export const LUCKY_ASPECTS = ['trine', 'sextile', 'conjunction'];
export const CHALLENGING_ASPECTS = ['square', 'opposition'];

// Day quality ratings
export interface DayQuality {
  isLucky: boolean;
  isChallenging: boolean;
  luckyScore: number; // 0-10
  dominantPlanet: string;
  dominantAspectType: 'harmonious' | 'challenging' | 'mixed';
}

// Benefic planets that bring luck
const BENEFIC_PLANETS = ['venus', 'jupiter'];
const MALEFIC_PLANETS = ['mars', 'saturn', 'pluto'];

export const getDayType = (aspects: Aspect[], moonPhase: MoonPhase): DayType => {
  // Balsamic moon = rest/dream day
  if (moonPhase.isBalsamic) {
    return { label: 'Rest & Release', emoji: '🌘', symbol: '☽', description: 'Let go of what no longer serves you, recharge' };
  }

  // Full moon = emotional peak
  if (moonPhase.phaseName === 'Full Moon') {
    return { label: 'Harvest', emoji: '🌕', symbol: '☽', description: 'See results, gain clarity, celebrate achievements' };
  }

  // New moon = intention day
  if (moonPhase.phaseName === 'New Moon') {
    return { label: 'Plant Seeds', emoji: '🌑', symbol: '☽', description: 'Set intentions, start fresh, new beginnings' };
  }

  // Find tightest orb aspect to determine dominant energy
  if (aspects.length === 0) {
    return DAY_TYPE_MAP.moon;
  }

  // Sort by orb (tightest first) - orb is a string, need to parse
  const sortedByOrb = [...aspects].sort((a, b) => parseFloat(a.orb) - parseFloat(b.orb));
  const tightestAspect = sortedByOrb[0];
  
  // Use the first planet from the tightest aspect (typically the faster-moving planet)
  const dominant = tightestAspect.planet1.toLowerCase();

  return DAY_TYPE_MAP[dominant] || DAY_TYPE_MAP.moon;
};

// Get personal day type based on transit aspects to YOUR natal chart
export interface PersonalDayType extends DayType {
  luckyScore: number; // 0-10
  isLucky: boolean;
  isChallenging: boolean;
  topNatalPlanet?: string; // The natal planet being activated (determines label)
  topTransitPlanet?: string; // The transiting planet (for context)
  tightestAspectType?: 'flowing' | 'challenging' | 'conjunction'; // Type of tightest aspect
  reason?: string; // The aspect symbols e.g. "♃ □ ☿"
}

// Slow-moving planets count less for daily luck - they're long-term transits
const SLOW_PLANETS = ['pluto', 'neptune', 'uranus'];
const MEDIUM_PLANETS = ['saturn', 'jupiter', 'chiron'];
const FAST_PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars'];

export const getPersonalDayType = (transitAspects: Array<{
  transitPlanet: string;
  natalPlanet: string;
  aspect: string;
  orb: string;
}>): PersonalDayType => {
  if (!transitAspects || transitAspects.length === 0) {
    return { 
      label: 'Neutral Day', 
      emoji: '○', 
      symbol: '○',
      description: 'No major transits to your chart today',
      luckyScore: 5,
      isLucky: false,
      isChallenging: false
    };
  }

  // Calculate luck score based on all transits
  let luckyPoints = 0;
  let challengingPoints = 0;

  transitAspects.forEach((asp) => {
    const transitPlanet = asp.transitPlanet.toLowerCase();
    const natalPlanet = asp.natalPlanet.toLowerCase();
    const aspectName = asp.aspect.toLowerCase();
    const orb = parseFloat(asp.orb);
    
    // Weight by orb - tighter orbs count more
    const orbWeight = orb <= 1 ? 1.5 : orb <= 2 ? 1.0 : 0.5;
    
    // Slow-moving planets get reduced weight for daily luck
    let speedWeight = 1.0;
    if (SLOW_PLANETS.includes(transitPlanet)) {
      speedWeight = 0.25;
    } else if (MEDIUM_PLANETS.includes(transitPlanet)) {
      speedWeight = 0.5;
    }
    
    // Calculate luck score based on aspect type
    const isHarmonious = ['trine', 'sextile'].includes(aspectName);
    const isChallenging = ['square', 'opposition'].includes(aspectName);
    const isConjunction = aspectName === 'conjunction';
    
    // Benefic planets in harmonious aspects = lucky
    if (BENEFIC_PLANETS.includes(transitPlanet)) {
      if (isHarmonious) luckyPoints += 3 * speedWeight;
      else if (isConjunction) luckyPoints += 2 * speedWeight;
      else if (isChallenging) luckyPoints += 0.5 * speedWeight;
    }
    
    // Malefic planets in challenging aspects = difficult
    if (MALEFIC_PLANETS.includes(transitPlanet)) {
      if (isChallenging) challengingPoints += 2 * speedWeight;
      else if (isConjunction) challengingPoints += 1 * speedWeight;
    }
    
    // Fast planet aspects felt more
    if (transitPlanet === 'sun' && isHarmonious) luckyPoints += 2;
    if (transitPlanet === 'moon' && isHarmonious) luckyPoints += 1.5;
    if (FAST_PLANETS.includes(transitPlanet) && isChallenging) {
      challengingPoints += 1;
    }
    
    // Harmonious aspects to natal benefics = luck amplified
    if (BENEFIC_PLANETS.includes(natalPlanet) && isHarmonious) {
      luckyPoints += 1.5 * speedWeight;
    }
  });

  // Calculate final luck score (0-10)
  const rawScore = 5 + luckyPoints - challengingPoints;
  const luckyScore = Math.max(0, Math.min(10, Math.round(rawScore)));
  
  // Thresholds based on overall score (not just tightest aspect)
  const isLucky = luckyScore >= 7;
  const isChallenging = luckyScore <= 3;

  // Find the TIGHTEST ORB aspect - this determines the day's theme
  const sortedByOrb = [...transitAspects].sort((a, b) => parseFloat(a.orb) - parseFloat(b.orb));
  const tightestAspect = sortedByOrb[0];
  const tightestAspectName = tightestAspect?.aspect?.toLowerCase() || '';
  
  // Determine the type of the tightest aspect
  const isTightestFlowing = ['trine', 'sextile'].includes(tightestAspectName);
  const isTightestChallenging = ['square', 'opposition'].includes(tightestAspectName);
  const tightestAspectType: 'flowing' | 'challenging' | 'conjunction' = 
    isTightestFlowing ? 'flowing' : 
    isTightestChallenging ? 'challenging' : 'conjunction';

  // KEY FIX: Use the NATAL PLANET being hit to determine the label
  // If Jupiter squares your Mercury, the label is "Think & Talk" (Mercury theme)
  // NOT "Grow & Expand" (Jupiter theme)
  const natalPlanetHit = tightestAspect?.natalPlanet?.toLowerCase() || 'moon';
  const transitPlanet = tightestAspect?.transitPlanet?.toLowerCase() || 'moon';
  
  // Get the day type based on NATAL planet being activated
  const baseType = DAY_TYPE_MAP[natalPlanetHit] || DAY_TYPE_MAP.moon;
  
  // Build reason string showing the actual aspect
  const aspectSymbol = tightestAspectName === 'trine' ? '△' : 
                       tightestAspectName === 'sextile' ? '⚹' :
                       tightestAspectName === 'square' ? '□' :
                       tightestAspectName === 'opposition' ? '☍' :
                       tightestAspectName === 'conjunction' ? '☌' : '';
  
  let reason = '';
  if (tightestAspect) {
    const transitSym = getPlanetSymbol(tightestAspect.transitPlanet);
    const natalSym = getPlanetSymbol(tightestAspect.natalPlanet);
    reason = `${transitSym} ${aspectSymbol} ${natalSym}`;
  }

  // Build description that includes the aspect context
  let description = baseType.description;
  if (isTightestChallenging) {
    const transitPlanetName = tightestAspect?.transitPlanet || 'Planet';
    description = `${transitPlanetName} ${tightestAspectName} your ${tightestAspect?.natalPlanet || 'planet'} — patience with ${baseType.label.toLowerCase()}`;
  } else if (isTightestFlowing) {
    const transitPlanetName = tightestAspect?.transitPlanet || 'Planet';
    description = `${transitPlanetName} ${tightestAspectName} your ${tightestAspect?.natalPlanet || 'planet'} — ease with ${baseType.label.toLowerCase()}`;
  }

  return {
    ...baseType,
    description,
    luckyScore,
    isLucky,
    isChallenging,
    topNatalPlanet: natalPlanetHit,
    topTransitPlanet: transitPlanet,
    tightestAspectType,
    reason
  };
};

// Color explanation for day detail
export interface ColorExplanation {
  primary: {
    color: string;
    planet: string;
    meaning: string;
    reason: string;
    position?: string;
    aspects?: Aspect[];
  };
  secondary: {
    color: string;
    planet: string;
    meaning: string;
    reason: string;
    position?: string;
    aspects?: Aspect[];
  } | null;
}

export const getColorExplanation = (aspects: Aspect[], moonPhase: MoonPhase): ColorExplanation => {
  if (moonPhase.isBalsamic) {
    return {
      primary: {
        color: '#D4C5E8',
        planet: 'Balsamic Moon',
        meaning: 'Sacred rest phase before renewal',
        reason: 'Moon is in balsamic phase (315°-337.5°). This is a time for deep rest, meditation, and spiritual retreat before the next lunar cycle.',
      },
      secondary: null,
    };
  }

  const activePlanets = new Set<string>();
  const aspectsByPlanet: Record<string, Aspect[]> = {};

  aspects.forEach((asp) => {
    activePlanets.add(asp.planet1);
    activePlanets.add(asp.planet2);

    if (!aspectsByPlanet[asp.planet1]) aspectsByPlanet[asp.planet1] = [];
    if (!aspectsByPlanet[asp.planet2]) aspectsByPlanet[asp.planet2] = [];

    aspectsByPlanet[asp.planet1].push(asp);
    aspectsByPlanet[asp.planet2].push(asp);
  });

  const planetList = Array.from(activePlanets);

  if (planetList.length === 0) {
    return {
      primary: {
        color: PLANET_COLORS.moon.color,
        planet: PLANET_COLORS.moon.name,
        meaning: PLANET_COLORS.moon.meaning,
        reason: 'No major aspects today. Moon provides baseline emotional energy.',
      },
      secondary: null,
    };
  }

  if (planetList.length === 1) {
    const planet = planetList[0];
    const planetInfo = PLANET_COLORS[planet];
    return {
      primary: {
        color: planetInfo.color,
        planet: planetInfo.name,
        meaning: planetInfo.meaning,
        reason: `${planetInfo.name} is the most active planet today with ${aspectsByPlanet[planet]?.length || 0} aspect(s).`,
        aspects: aspectsByPlanet[planet],
      },
      secondary: null,
    };
  }

  // Two or more planets - split by time
  const planet1 = planetList[0];
  const planet2 = planetList[1];
  const info1 = PLANET_COLORS[planet1];
  const info2 = PLANET_COLORS[planet2];

  const aspects1 = aspectsByPlanet[planet1] || [];
  const aspects2 = aspectsByPlanet[planet2] || [];

  return {
    primary: {
      color: info1.color,
      planet: info1.name,
      meaning: info1.meaning,
      reason: `${info1.name} aspects are active with ${aspects1.length} aspect(s).`,
      position: 'Top (Morning/Afternoon)',
      aspects: aspects1,
    },
    secondary: {
      color: info2.color,
      planet: info2.name,
      meaning: info2.meaning,
      reason: `${info2.name} aspects are active with ${aspects2.length} aspect(s).`,
      position: 'Bottom (Afternoon/Evening)',
      aspects: aspects2,
    },
  };
};

// Get planet symbol
export const getPlanetSymbol = (planetName: string): string => {
  const symbols: Record<string, string> = {
    moon: '☽',
    sun: '☉',
    mercury: '☿',
    venus: '♀',
    mars: '♂',
    jupiter: '♃',
    saturn: '♄',
    uranus: '♅',
    neptune: '♆',
    pluto: '♇',
    ascendant: 'ASC',
    northnode: '☊',
  };
  return symbols[planetName] || planetName;
};

// Simple cache for ingress detection to avoid repeated heavy calculations
const INGRESS_CACHE = new Map<string, Ingress[]>();

// Detect planetary ingresses (sign changes) - SIMPLIFIED for performance
// Only checks if sign changed from yesterday, no binary search or forward lookup
export const detectPlanetaryIngresses = (date: Date, planets: PlanetaryPositions): Ingress[] => {
  // Use date string as cache key
  const cacheKey = date.toISOString().split('T')[0];
  const cached = INGRESS_CACHE.get(cacheKey);
  if (cached) return cached;

  const ingresses: Ingress[] = [];

  try {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Use a simple cache for yesterday's positions too
    const yesterdayCacheKey = yesterday.toISOString().split('T')[0] + '_positions';
    let yesterdayPlanets = INGRESS_CACHE.get(yesterdayCacheKey) as unknown as PlanetaryPositions | undefined;
    if (!yesterdayPlanets) {
      yesterdayPlanets = getPlanetaryPositions(yesterday);
      // Store for potential reuse (cast to any since we're reusing the cache)
    }

    // Check ALL planets including outers
    const planetsToCheck: (keyof PlanetaryPositions)[] = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

    // Display windows: how many days to show the ingress badge after the actual sign change
    const INGRESS_WINDOW_DAYS: Record<string, number> = {
      mercury: 1, venus: 1, mars: 2,
      jupiter: 3, saturn: 3, uranus: 3, neptune: 3, pluto: 3,
    };

    const INGRESS_DESCRIPTIONS: Record<string, (sign: string) => string> = {
      mercury: (s) => `Enters ${s} — shifts in thinking & communication`,
      venus: (s) => `Enters ${s} — new tone in love & values`,
      mars: (s) => `Enters ${s} — drive & action change style`,
      jupiter: (s) => `Enters ${s} — expansion focus shifts (1 year)`,
      saturn: (s) => `Enters ${s} — new 2.5-year structural chapter`,
      uranus: (s) => `Enters ${s} — 7-year revolution begins`,
      neptune: (s) => `Enters ${s} — generational shift (14 years)`,
      pluto: (s) => `Enters ${s} — transformative era (12-20 years)`,
    };

    planetsToCheck.forEach((planetName) => {
      const todaySign = planets[planetName].signName;
      const yesterdaySign = yesterdayPlanets![planetName].signName;

      if (todaySign !== yesterdaySign) {
        const icon = getPlanetSymbol(planetName);
        const descFn = INGRESS_DESCRIPTIONS[planetName];
        
        ingresses.push({
          planet: planetName.charAt(0).toUpperCase() + planetName.slice(1),
          sign: todaySign,
          icon,
          desc: descFn ? descFn(todaySign) : `Enters ${todaySign}`,
        });
      }
    });

    // If no ingress today, check if we're within the display window of a recent ingress
    // (so slow-planet ingresses show for a few days, not just 1 day)
    if (ingresses.length === 0) {
      planetsToCheck.forEach((planetName) => {
        const windowDays = INGRESS_WINDOW_DAYS[planetName] || 1;
        if (windowDays <= 1) return; // fast planets only show on exact day
        
        const todaySign = planets[planetName].signName;
        
        // Check days back within the window
        for (let daysBack = 1; daysBack < windowDays; daysBack++) {
          const checkDate = new Date(date);
          checkDate.setDate(checkDate.getDate() - daysBack);
          try {
            const checkPlanets = getPlanetaryPositions(checkDate);
            const prevDay = new Date(checkDate);
            prevDay.setDate(prevDay.getDate() - 1);
            const prevPlanets = getPlanetaryPositions(prevDay);
            
            if (checkPlanets[planetName].signName === todaySign && 
                prevPlanets[planetName].signName !== todaySign) {
              // Found the actual ingress date within our window
              const icon = getPlanetSymbol(planetName);
              const ingressDate = checkDate;
              const dateStr = `${ingressDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
              ingresses.push({
                planet: planetName.charAt(0).toUpperCase() + planetName.slice(1),
                sign: todaySign,
                icon,
                desc: `Entered ${todaySign} on ${dateStr}`,
              });
              break;
            }
          } catch { /* skip */ }
        }
      });
    }
  } catch (error) {
    console.error('Error detecting ingresses:', error);
  }

  // Cache the result
  INGRESS_CACHE.set(cacheKey, ingresses);
  return ingresses;
};

// Export to iCal format
export const generateICalExport = (year: number, month: number, daysInMonth: number): string => {
  let ical = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Astro Calendar//EN\n';

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const planets = getPlanetaryPositions(date);
    const moonPhase = getMoonPhase(date);

    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');

    ical += `BEGIN:VEVENT\n`;
    ical += `DTSTART:${dateStr}\n`;
    ical += `SUMMARY:☽ ${planets.moon.signName} ${planets.moon.degree}° - ${moonPhase.phaseName}\n`;
    ical += `DESCRIPTION:Moon: ${planets.moon.fullDegree}\\nPhase: ${moonPhase.phaseName}\\nIllumination: ${(moonPhase.illumination * 100).toFixed(0)}%\n`;
    ical += `END:VEVENT\n`;
  }

  ical += 'END:VCALENDAR';
  return ical;
};

// =========================================
// DIVINE FEMININE ASTROLOGY - PHASE 1
// =========================================

// Fixed Stars Database with their ecliptic positions
export const FIXED_STARS: Record<string, { name: string; longitude: number; orb: number; magnitude: number; meaning: string }> = {
  sirius: {
    name: 'Sirius',
    longitude: 104.0, // 14° Cancer
    orb: 2.0,
    magnitude: -1.46,
    meaning: "The Dog Star. Spiritual wisdom, success, fame. Ancient Egyptian sacred star. Divine downloads, kundalini awakening, connection to higher consciousness."
  },
  regulus: {
    name: 'Regulus',
    longitude: 149.0, // 29° Leo
    orb: 2.0,
    magnitude: 1.35,
    meaning: "Heart of the Lion. Royal power, leadership, fame, success. 'Success if revenge is avoided.' Military honors, nobility. Guardian of the North."
  },
  algol: {
    name: 'Algol',
    longitude: 56.0, // 26° Taurus
    orb: 2.0,
    magnitude: 2.1,
    meaning: "Medusa's Head. Transformation through facing shadow. Feminine rage transmuted to power. Passion, intensity, the demon lover."
  },
  spica: {
    name: 'Spica',
    longitude: 203.8, // 23° Libra
    orb: 2.0,
    magnitude: 0.97,
    meaning: "The Wheat Sheaf. Gifts, talents, protection. Venus-Jupiter nature. Artistic success, harvest of efforts. The priestess star."
  },
  antares: {
    name: 'Antares',
    longitude: 249.0, // 9° Sagittarius
    orb: 2.0,
    magnitude: 1.09,
    meaning: "Rival of Mars. Warrior spirit, obsession, intensity. Success through persistence. Heart of the Scorpion. Guardian of the West."
  },
  aldebaran: {
    name: 'Aldebaran',
    longitude: 69.5, // 9° Gemini
    orb: 2.0,
    magnitude: 0.85,
    meaning: "The Bull's Eye. Integrity, honor, eloquence. 'Success through integrity.' Military honors, courage. Guardian of the East."
  },
  fomalhaut: {
    name: 'Fomalhaut',
    longitude: 333.0, // 3° Pisces
    orb: 2.0,
    magnitude: 1.16,
    meaning: "The Mouth of the Fish. Idealism, mysticism, fame. Rise and fall. Charisma, magic, spiritual power. Guardian of the South."
  },
  alcyone: {
    name: 'Alcyone',
    longitude: 60.0, // 0° Gemini
    orb: 1.5,
    magnitude: 2.86,
    meaning: "Central star of Pleiades (Seven Sisters). Vision, mysticism, grief. Something to cry about. Ambition, mourning. Mystical sight."
  }
};

// Check if planet is conjunct a fixed star
export interface FixedStarConjunction {
  star: string;
  planet: string;
  orb: string;
  meaning: string;
}

export const getFixedStarConjunctions = (planets: PlanetaryPositions): FixedStarConjunction[] => {
  const conjunctions: FixedStarConjunction[] = [];
  
  const getLongitude = (position: ZodiacPosition): number => {
    const signIndex = ZODIAC_SIGNS.findIndex(s => s.name === position.signName);
    return signIndex * 30 + position.degree;
  };

  const planetEntries: [string, ZodiacPosition][] = [
    ['Moon', planets.moon],
    ['Sun', planets.sun],
    ['Mercury', planets.mercury],
    ['Venus', planets.venus],
    ['Mars', planets.mars],
    ['Jupiter', planets.jupiter],
    ['Saturn', planets.saturn],
  ];

  planetEntries.forEach(([planetName, position]) => {
    const planetLon = getLongitude(position);
    
    Object.values(FIXED_STARS).forEach((star) => {
      const orb = Math.abs(planetLon - star.longitude);
      const normalizedOrb = orb > 180 ? 360 - orb : orb;
      
      if (normalizedOrb <= star.orb) {
        conjunctions.push({
          star: star.name,
          planet: planetName,
          orb: normalizedOrb.toFixed(2),
          meaning: star.meaning
        });
      }
    });
  });
  
  return conjunctions;
};

// Chiron interpretations by sign
export const CHIRON_MEANINGS: Record<string, string> = {
  Aries: "Wound: Identity, self-assertion, independence. Healing: Courage to be yourself, warrior spirit, pioneering new paths.",
  Taurus: "Wound: Self-worth, material security, body image. Healing: Grounding, sensuality, valuing yourself.",
  Gemini: "Wound: Communication, learning, siblings. Healing: Voice, curiosity, connecting.",
  Cancer: "Wound: Emotions, family, belonging. Healing: Nurturing self and others, emotional safety.",
  Leo: "Wound: Self-expression, creativity, recognition. Healing: Authentic creativity, inner child joy.",
  Virgo: "Wound: Perfection, service, health. Healing: Accepting imperfection, holistic wellness.",
  Libra: "Wound: Relationships, balance, fairness. Healing: Healthy boundaries, partnership equality.",
  Scorpio: "Wound: Trust, intimacy, transformation. Healing: Deep emotional healing, empowerment.",
  Sagittarius: "Wound: Meaning, truth, freedom. Healing: Faith, philosophical understanding, adventure.",
  Capricorn: "Wound: Authority, achievement, structure. Healing: Building from wounds, mature success.",
  Aquarius: "Wound: Belonging, uniqueness, community. Healing: Embracing difference, humanitarian work.",
  Pisces: "Wound: Boundaries, escapism, spirituality. Healing: Compassion, mystical connection, service."
};

// Lilith interpretations by sign
export const LILITH_MEANINGS: Record<string, string> = {
  Aries: "Wild independence. Rage at being told who to be. Power: Fierce autonomy.",
  Taurus: "Sensual sovereignty. Rage at being owned. Power: Body as temple.",
  Gemini: "Voice as weapon. Rage at being silenced. Power: Speaking dangerous truths.",
  Cancer: "Primal mother. Rage at nurturing demands. Power: Emotional intensity.",
  Leo: "Creative fury. Rage at being unseen. Power: Shameless self-expression.",
  Virgo: "Perfect imperfection. Rage at criticism. Power: Sacred service.",
  Libra: "Relationship rebel. Rage at people-pleasing. Power: Authentic partnership.",
  Scorpio: "Sexual power. Rage at control. Power: Transformative intensity.",
  Sagittarius: "Wild freedom. Rage at cages. Power: Untamed spirit.",
  Capricorn: "Authority defiance. Rage at rules. Power: Building your empire.",
  Aquarius: "Radical uniqueness. Rage at conformity. Power: Revolutionary change.",
  Pisces: "Mystic wild. Rage at reality. Power: Spiritual rebellion."
};

// Stellium detection (3+ planets in same sign)
export interface Stellium {
  sign: string;
  planets: { name: string; symbol: string; degree: number }[];
  count: number;
}

// Stellium interpretations by sign
export const STELLIUM_MEANINGS: Record<string, string> = {
  Aries: 'Your willpower, identity, and values converge on courage and independence. This is a time of bold new beginnings. Initiative and self-assertion intensify.',
  Taurus: 'Stability, sensuality, and material focus converge. Build lasting value. Ground your energy. Pleasure and security matter.',
  Gemini: 'Communication, curiosity, and connection multiply. Information flows freely. Learn, teach, network. Mental energy peaks.',
  Cancer: 'Emotions, nurturing, and home life intensify. Family matters. Feelings run deep. Create emotional safety.',
  Leo: 'Creativity, self-expression, and leadership shine. Performance energy. Confidence soars. Share your gifts boldly.',
  Virgo: 'Analysis, service, and improvement focus intensifies. Perfect your craft. Health and daily routines matter. Organize life.',
  Libra: 'Relationships, balance, and harmony dominate. Partnership focus. Diplomatic energy. Beauty and justice matter.',
  Scorpio: 'Transformation, depth, and power converge. Intense emotional work. Shadow integration. Profound change possible.',
  Sagittarius: 'Expansion, truth, and adventure align. Philosophy matters. Travel beckons. Meaning and freedom call.',
  Capricorn: 'Your willpower, identity, and values converge on achievement and structure. This is a time of serious ambition and long-term planning. Professional focus intensifies.',
  Aquarius: 'Innovation, community, and future vision merge. Collective consciousness shifts. Revolutionary ideas and humanitarian impulses surge.',
  Pisces: 'Spirituality, compassion, and dissolution blend. Boundaries soften. Dreams intensify. Creative and mystical energy flows.',
};

export const getStelliumMeaning = (sign: string): string => {
  return STELLIUM_MEANINGS[sign] || `Concentrated energy in ${sign}. This sign's themes dominate your focus.`;
};

export const detectStelliums = (planets: PlanetaryPositions): Stellium[] => {
  const signGroups: Record<string, { name: string; symbol: string; degree: number }[]> = {};
  
  const planetEntries: [string, ZodiacPosition, string][] = [
    ['Moon', planets.moon, '☽'],
    ['Sun', planets.sun, '☉'],
    ['Mercury', planets.mercury, '☿'],
    ['Venus', planets.venus, '♀'],
    ['Mars', planets.mars, '♂'],
    ['Jupiter', planets.jupiter, '♃'],
    ['Saturn', planets.saturn, '♄'],
  ];

  planetEntries.forEach(([name, position, symbol]) => {
    if (!signGroups[position.signName]) {
      signGroups[position.signName] = [];
    }
    signGroups[position.signName].push({ name, symbol, degree: position.degree });
  });

  return Object.entries(signGroups)
    .filter(([, planetList]) => planetList.length >= 3)
    .map(([sign, planetList]) => ({
      sign,
      planets: planetList.sort((a, b) => a.degree - b.degree),
      count: planetList.length
    }));
};

// Rare aspect detection (quincunx, sesquiquadrate, quintile, bi-quintile)
export interface RareAspect {
  planet1: string;
  planet2: string;
  type: string;
  symbol: string;
  angle: number;
  orb: string;
  meaning: string;
}

export const detectRareAspects = (planets: PlanetaryPositions): RareAspect[] => {
  const rareAspects: RareAspect[] = [];
  
  const getLongitude = (position: ZodiacPosition): number => {
    const signIndex = ZODIAC_SIGNS.findIndex(s => s.name === position.signName);
    return signIndex * 30 + position.degree;
  };

  const planetList: [string, ZodiacPosition][] = [
    ['Moon', planets.moon],
    ['Sun', planets.sun],
    ['Mercury', planets.mercury],
    ['Venus', planets.venus],
    ['Mars', planets.mars],
    ['Jupiter', planets.jupiter],
    ['Saturn', planets.saturn],
    ['Uranus', planets.uranus],
    ['Neptune', planets.neptune],
    ['Pluto', planets.pluto],
  ];

  // Also detect major outer planet conjunctions (generational events)
  const outerPlanets = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  for (let i = 0; i < planetList.length; i++) {
    for (let j = i + 1; j < planetList.length; j++) {
      const [p1Name, p1Pos] = planetList[i];
      const [p2Name, p2Pos] = planetList[j];
      // Only flag conjunctions between outer planets as "rare"
      if (outerPlanets.includes(p1Name) && outerPlanets.includes(p2Name)) {
        const lon1 = getLongitude(p1Pos);
        const lon2 = getLongitude(p2Pos);
        const diff = Math.abs(((lon2 - lon1 + 180) % 360) - 180);
        if (diff < 3) {
          rareAspects.push({
            planet1: p1Name,
            planet2: p2Name,
            type: 'conjunction',
            symbol: '☌',
            angle: 0,
            orb: diff.toFixed(1),
            meaning: `MAJOR: ${p1Name}-${p2Name} conjunction — a generational event that reshapes collective reality. This happens only once every several decades.`
          });
        }
      }
    }
  }

  for (let i = 0; i < planetList.length; i++) {
    for (let j = i + 1; j < planetList.length; j++) {
      const [p1Name, p1Pos] = planetList[i];
      const [p2Name, p2Pos] = planetList[j];
      const lon1 = getLongitude(p1Pos);
      const lon2 = getLongitude(p2Pos);
      
      const diff = Math.abs(((lon2 - lon1 + 180) % 360) - 180);

      // Sesquiquadrate (135°)
      if (Math.abs(diff - 135) < 3) {
        rareAspects.push({
          planet1: p1Name,
          planet2: p2Name,
          type: 'sesquiquadrate',
          symbol: '⚼',
          angle: 135,
          orb: Math.abs(diff - 135).toFixed(1),
          meaning: 'Friction and adjustment needed. Creative tension requiring action.'
        });
      }
      
      // Quincunx/Inconjunct (150°)
      if (Math.abs(diff - 150) < 3) {
        rareAspects.push({
          planet1: p1Name,
          planet2: p2Name,
          type: 'quincunx',
          symbol: '⚻',
          angle: 150,
          orb: Math.abs(diff - 150).toFixed(1),
          meaning: 'Requires pivoting and adjustment. Incompatible energies seeking integration.'
        });
      }
      
      // Quintile (72°)
      if (Math.abs(diff - 72) < 2) {
        rareAspects.push({
          planet1: p1Name,
          planet2: p2Name,
          type: 'quintile',
          symbol: 'Q',
          angle: 72,
          orb: Math.abs(diff - 72).toFixed(1),
          meaning: 'Creative talent and gifts. Artistic expression.'
        });
      }
      
      // Bi-quintile (144°)
      if (Math.abs(diff - 144) < 2) {
        rareAspects.push({
          planet1: p1Name,
          planet2: p2Name,
          type: 'bi-quintile',
          symbol: 'bQ',
          angle: 144,
          orb: Math.abs(diff - 144).toFixed(1),
          meaning: 'Creative mastery. Exceptional talent ready to manifest.'
        });
      }
    }
  }

  return rareAspects;
};

// Node aspect detection
export interface NodeAspect {
  planet: string;
  node: 'North' | 'South';
  type: string;
  symbol: string;
  meaning: string;
}

export const detectNodeAspects = (planets: PlanetaryPositions): NodeAspect[] => {
  const nodeAspects: NodeAspect[] = [];
  
  if (!planets.northNode) return nodeAspects;
  
  const getLongitude = (position: ZodiacPosition): number => {
    const signIndex = ZODIAC_SIGNS.findIndex(s => s.name === position.signName);
    return signIndex * 30 + position.degree;
  };

  const planetList: [string, ZodiacPosition][] = [
    ['Moon', planets.moon],
    ['Sun', planets.sun],
    ['Mercury', planets.mercury],
    ['Venus', planets.venus],
    ['Mars', planets.mars],
    ['Jupiter', planets.jupiter],
    ['Saturn', planets.saturn],
  ];

  const northLon = planets.northNode.longitude;

  planetList.forEach(([planetName, position]) => {
    const planetLon = getLongitude(position);
    const diff = Math.abs(((planetLon - northLon + 180) % 360) - 180);

    // Conjunction to North Node
    if (diff < 8) {
      nodeAspects.push({
        planet: planetName,
        node: 'North',
        type: 'conjunction',
        symbol: '☌',
        meaning: 'Destined action. This planet supports your life purpose and future direction.'
      });
    }
    // Sextile to North Node (60°)
    else if (Math.abs(diff - 60) < 6) {
      nodeAspects.push({
        planet: planetName,
        node: 'North',
        type: 'sextile',
        symbol: '⚹',
        meaning: 'Opportunities aligned with destiny. Easy support for growth.'
      });
    }
    // Trine to North Node (120°)
    else if (Math.abs(diff - 120) < 8) {
      nodeAspects.push({
        planet: planetName,
        node: 'North',
        type: 'trine',
        symbol: '△',
        meaning: 'Flowing toward your purpose with ease and grace.'
      });
    }
    // Opposition (conjunct South Node)
    else if (Math.abs(diff - 180) < 8) {
      nodeAspects.push({
        planet: planetName,
        node: 'South',
        type: 'conjunction',
        symbol: '☌',
        meaning: 'Past-life activation. Familiar territory but may need to release attachment.'
      });
    }
  });

  return nodeAspects;
};

// Note: ZODIAC_SIGNS already defined at top of file

// Placidus House System Calculation
// Mathematical implementation of the Placidus house system

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

// Obliquity of the ecliptic (mean value for J2000.0)
const OBLIQUITY = 23.4392911;

// Zodiac signs
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Convert Julian Day to centuries from J2000.0
const julianCenturies = (jd: number): number => {
  return (jd - 2451545.0) / 36525;
};

// Date to Julian Day
const dateToJD = (date: Date): number => {
  return date.getTime() / 86400000 + 2440587.5;
};

// Calculate Greenwich Sidereal Time in degrees
const greenwichSiderealTime = (jd: number): number => {
  const T = julianCenturies(jd);
  // Formula from the Astronomical Almanac
  let gst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 
            0.000387933 * T * T - T * T * T / 38710000;
  return ((gst % 360) + 360) % 360;
};

// Calculate Local Sidereal Time in degrees
const localSiderealTime = (jd: number, longitude: number): number => {
  const gst = greenwichSiderealTime(jd);
  return ((gst + longitude) % 360 + 360) % 360;
};

// Convert longitude to sign + degree
const longitudeToPosition = (longitude: number): { sign: string; degree: number; minutes: number } => {
  const normalizedLon = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLon / 30);
  const degreeFloat = normalizedLon % 30;
  const degree = Math.floor(degreeFloat);
  const minutes = Math.round((degreeFloat - degree) * 60);
  
  return { 
    sign: ZODIAC_SIGNS[signIndex], 
    degree, 
    minutes: minutes >= 60 ? 59 : minutes 
  };
};

// Calculate Ascendant
const calculateAscendant = (lst: number, latitude: number, obliquity: number): number => {
  const lstRad = lst * DEG_TO_RAD;
  const latRad = latitude * DEG_TO_RAD;
  const obliqRad = obliquity * DEG_TO_RAD;
  
  const y = Math.cos(lstRad);
  const x = -(Math.sin(obliqRad) * Math.tan(latRad) + Math.cos(obliqRad) * Math.sin(lstRad));
  
  let asc = Math.atan2(y, x) * RAD_TO_DEG;
  
  // Adjust quadrant
  if (lst >= 0 && lst < 180) {
    asc += 180;
  } else {
    asc += 360;
  }
  
  return ((asc % 360) + 360) % 360;
};

// Calculate MC (Medium Coeli / Midheaven)
const calculateMC = (lst: number, obliquity: number): number => {
  const lstRad = lst * DEG_TO_RAD;
  const obliqRad = obliquity * DEG_TO_RAD;
  
  let mc = Math.atan2(Math.sin(lstRad), Math.cos(lstRad) * Math.cos(obliqRad)) * RAD_TO_DEG;
  
  // MC should be in the upper hemisphere
  if (mc < 0) mc += 360;
  
  // Adjust based on LST quadrant
  if (lst >= 0 && lst < 90) {
    // MC in Q1
  } else if (lst >= 90 && lst < 180) {
    mc = mc < 90 ? mc + 180 : mc;
  } else if (lst >= 180 && lst < 270) {
    mc = mc < 180 ? mc + 180 : mc;
  } else {
    mc = mc < 270 ? mc + 180 : mc;
  }
  
  return ((mc % 360) + 360) % 360;
};

// Placidus cusp calculation using semi-arc method
// This is the complex part that makes Placidus different from other systems
const calculatePlacidusHouseCusp = (
  houseNumber: number,
  mc: number,
  asc: number,
  lst: number,
  latitude: number,
  obliquity: number
): number => {
  // Houses 1 and 10 are always ASC and MC
  if (houseNumber === 1) return asc;
  if (houseNumber === 10) return mc;
  
  // Houses 4 and 7 are opposite to 10 and 1
  if (houseNumber === 4) return (mc + 180) % 360;
  if (houseNumber === 7) return (asc + 180) % 360;
  
  const latRad = latitude * DEG_TO_RAD;
  const obliqRad = obliquity * DEG_TO_RAD;
  
  // Determine which quadrant and fraction
  let fraction: number;
  let startRA: number;
  let endRA: number;
  
  // RAMC (Right Ascension of MC)
  const ramc = lst;
  
  // Calculate semi-arcs
  // The Placidus system divides the semi-arc of the ecliptic into three equal parts
  
  if (houseNumber === 11 || houseNumber === 12 || houseNumber === 2 || houseNumber === 3) {
    // Eastern houses (above horizon to MC, or below horizon to IC)
    if (houseNumber === 11) fraction = 1/3;
    else if (houseNumber === 12) fraction = 2/3;
    else if (houseNumber === 2) fraction = 1/3;
    else fraction = 2/3; // house 3
    
    if (houseNumber === 11 || houseNumber === 12) {
      // Above horizon, between ASC and MC
      startRA = asc;
      endRA = mc;
    } else {
      // Below horizon, between IC and ASC
      startRA = (mc + 180) % 360;
      endRA = asc;
    }
  } else {
    // Western houses (5, 6, 8, 9)
    if (houseNumber === 5) fraction = 2/3;
    else if (houseNumber === 6) fraction = 1/3;
    else if (houseNumber === 8) fraction = 1/3;
    else fraction = 2/3; // house 9
    
    if (houseNumber === 8 || houseNumber === 9) {
      // Above horizon, between MC and DSC
      startRA = mc;
      endRA = (asc + 180) % 360;
    } else {
      // Below horizon, between DSC and IC
      startRA = (asc + 180) % 360;
      endRA = (mc + 180) % 360;
    }
  }
  
  // Handle wrap-around
  let arcLength = endRA - startRA;
  if (arcLength < 0) arcLength += 360;
  if (arcLength > 180) arcLength = 360 - arcLength;
  
  // Calculate the cusp position
  let cuspRA = startRA + fraction * arcLength;
  if (cuspRA >= 360) cuspRA -= 360;
  if (cuspRA < 0) cuspRA += 360;
  
  // Convert RA to ecliptic longitude using iterative method
  // This is a simplified approximation - true Placidus requires iteration
  const cuspRArad = cuspRA * DEG_TO_RAD;
  
  // Calculate declination at this RA point
  const declination = Math.asin(Math.sin(obliqRad) * Math.sin(cuspRArad));
  
  // Convert RA and Dec to ecliptic longitude
  let eclLon = Math.atan2(
    Math.sin(cuspRArad) * Math.cos(obliqRad) + Math.tan(declination) * Math.sin(obliqRad),
    Math.cos(cuspRArad)
  ) * RAD_TO_DEG;
  
  // Normalize to 0-360
  eclLon = ((eclLon % 360) + 360) % 360;
  
  // Adjust for hemisphere
  if (houseNumber === 11 || houseNumber === 12) {
    // Should be between ASC and MC
    while (eclLon < asc - 90) eclLon += 180;
    while (eclLon > mc + 90) eclLon -= 180;
  } else if (houseNumber === 2 || houseNumber === 3) {
    // Should be between IC and ASC
    const ic = (mc + 180) % 360;
    while (eclLon < ic - 90) eclLon += 180;
  }
  
  return ((eclLon % 360) + 360) % 360;
};

// Main function to calculate all Placidus house cusps
export interface PlacidusHouses {
  house1: { sign: string; degree: number; minutes: number };
  house2: { sign: string; degree: number; minutes: number };
  house3: { sign: string; degree: number; minutes: number };
  house4: { sign: string; degree: number; minutes: number };
  house5: { sign: string; degree: number; minutes: number };
  house6: { sign: string; degree: number; minutes: number };
  house7: { sign: string; degree: number; minutes: number };
  house8: { sign: string; degree: number; minutes: number };
  house9: { sign: string; degree: number; minutes: number };
  house10: { sign: string; degree: number; minutes: number };
  house11: { sign: string; degree: number; minutes: number };
  house12: { sign: string; degree: number; minutes: number };
  ascendantLongitude: number;
  mcLongitude: number;
}

export const calculatePlacidusHouses = (
  date: Date,
  latitude: number,
  longitude: number
): PlacidusHouses => {
  // Get Julian Day
  const jd = dateToJD(date);
  
  // Calculate Local Sidereal Time
  const lst = localSiderealTime(jd, longitude);
  
  // Calculate ASC and MC
  const asc = calculateAscendant(lst, latitude, OBLIQUITY);
  const mc = calculateMC(lst, OBLIQUITY);
  
  // Calculate all 12 house cusps
  const cusps: number[] = [];
  for (let i = 1; i <= 12; i++) {
    cusps[i] = calculatePlacidusHouseCusp(i, mc, asc, lst, latitude, OBLIQUITY);
  }
  
  return {
    house1: longitudeToPosition(cusps[1]),
    house2: longitudeToPosition(cusps[2]),
    house3: longitudeToPosition(cusps[3]),
    house4: longitudeToPosition(cusps[4]),
    house5: longitudeToPosition(cusps[5]),
    house6: longitudeToPosition(cusps[6]),
    house7: longitudeToPosition(cusps[7]),
    house8: longitudeToPosition(cusps[8]),
    house9: longitudeToPosition(cusps[9]),
    house10: longitudeToPosition(cusps[10]),
    house11: longitudeToPosition(cusps[11]),
    house12: longitudeToPosition(cusps[12]),
    ascendantLongitude: asc,
    mcLongitude: mc,
  };
};

// Extended city coordinates database
export const EXTENDED_CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  // US Cities - Major metros
  'new york': { lat: 40.7128, lon: -74.0060 },
  'brooklyn': { lat: 40.6782, lon: -73.9442 },
  'manhattan': { lat: 40.7831, lon: -73.9712 },
  'queens': { lat: 40.7282, lon: -73.7949 },
  'bronx': { lat: 40.8448, lon: -73.8648 },
  'staten island': { lat: 40.5795, lon: -74.1502 },
  'los angeles': { lat: 34.0522, lon: -118.2437 },
  'hollywood': { lat: 34.0928, lon: -118.3287 },
  'beverly hills': { lat: 34.0736, lon: -118.4004 },
  'santa monica': { lat: 34.0195, lon: -118.4912 },
  'pasadena': { lat: 34.1478, lon: -118.1445 },
  'chicago': { lat: 41.8781, lon: -87.6298 },
  'houston': { lat: 29.7604, lon: -95.3698 },
  'phoenix': { lat: 33.4484, lon: -112.0740 },
  'philadelphia': { lat: 39.9526, lon: -75.1652 },
  'san antonio': { lat: 29.4241, lon: -98.4936 },
  'san diego': { lat: 32.7157, lon: -117.1611 },
  'dallas': { lat: 32.7767, lon: -96.7970 },
  'san jose': { lat: 37.3382, lon: -121.8863 },
  'austin': { lat: 30.2672, lon: -97.7431 },
  'jacksonville': { lat: 30.3322, lon: -81.6557 },
  'fort worth': { lat: 32.7555, lon: -97.3308 },
  'columbus': { lat: 39.9612, lon: -82.9988 },
  'charlotte': { lat: 35.2271, lon: -80.8431 },
  'san francisco': { lat: 37.7749, lon: -122.4194 },
  'indianapolis': { lat: 39.7684, lon: -86.1581 },
  'seattle': { lat: 47.6062, lon: -122.3321 },
  'denver': { lat: 39.7392, lon: -104.9903 },
  'boston': { lat: 42.3601, lon: -71.0589 },
  'el paso': { lat: 31.7619, lon: -106.4850 },
  'detroit': { lat: 42.3314, lon: -83.0458 },
  'nashville': { lat: 36.1627, lon: -86.7816 },
  'portland': { lat: 45.5152, lon: -122.6784 },
  'memphis': { lat: 35.1495, lon: -90.0490 },
  'oklahoma city': { lat: 35.4676, lon: -97.5164 },
  'las vegas': { lat: 36.1699, lon: -115.1398 },
  'louisville': { lat: 38.2527, lon: -85.7585 },
  'baltimore': { lat: 39.2904, lon: -76.6122 },
  'milwaukee': { lat: 43.0389, lon: -87.9065 },
  'albuquerque': { lat: 35.0844, lon: -106.6504 },
  'tucson': { lat: 32.2226, lon: -110.9747 },
  'fresno': { lat: 36.7378, lon: -119.7871 },
  'sacramento': { lat: 38.5816, lon: -121.4944 },
  'mesa': { lat: 33.4152, lon: -111.8315 },
  'kansas city': { lat: 39.0997, lon: -94.5786 },
  'atlanta': { lat: 33.7490, lon: -84.3880 },
  'long beach': { lat: 33.7701, lon: -118.1937 },
  'omaha': { lat: 41.2565, lon: -95.9345 },
  'raleigh': { lat: 35.7796, lon: -78.6382 },
  'miami': { lat: 25.7617, lon: -80.1918 },
  'oakland': { lat: 37.8044, lon: -122.2712 },
  'minneapolis': { lat: 44.9778, lon: -93.2650 },
  'tulsa': { lat: 36.1540, lon: -95.9928 },
  'cleveland': { lat: 41.4993, lon: -81.6944 },
  'new orleans': { lat: 29.9511, lon: -90.0715 },
  'honolulu': { lat: 21.3069, lon: -157.8583 },
  'anchorage': { lat: 61.2181, lon: -149.9003 },
  'tampa': { lat: 27.9506, lon: -82.4572 },
  'orlando': { lat: 28.5383, lon: -81.3792 },
  'pittsburgh': { lat: 40.4406, lon: -79.9959 },
  'st louis': { lat: 38.6270, lon: -90.1994 },
  'cincinnati': { lat: 39.1031, lon: -84.5120 },
  'washington': { lat: 38.9072, lon: -77.0369 },
  'washington dc': { lat: 38.9072, lon: -77.0369 },
  'salt lake city': { lat: 40.7608, lon: -111.8910 },
  'boise': { lat: 43.6150, lon: -116.2023 },
  'richmond': { lat: 37.5407, lon: -77.4360 },
  'hartford': { lat: 41.7658, lon: -72.6734 },
  'providence': { lat: 41.8240, lon: -71.4128 },
  'buffalo': { lat: 42.8864, lon: -78.8784 },
  'rochester': { lat: 43.1566, lon: -77.6088 },
  'grand rapids': { lat: 42.9634, lon: -85.6681 },
  'des moines': { lat: 41.5868, lon: -93.6250 },
  'madison': { lat: 43.0731, lon: -89.4012 },
  
  // Canada
  'toronto': { lat: 43.6532, lon: -79.3832 },
  'vancouver': { lat: 49.2827, lon: -123.1207 },
  'montreal': { lat: 45.5017, lon: -73.5673 },
  'calgary': { lat: 51.0447, lon: -114.0719 },
  'edmonton': { lat: 53.5461, lon: -113.4938 },
  'ottawa': { lat: 45.4215, lon: -75.6972 },
  'winnipeg': { lat: 49.8951, lon: -97.1384 },
  'quebec city': { lat: 46.8139, lon: -71.2080 },
  'halifax': { lat: 44.6488, lon: -63.5752 },
  'victoria': { lat: 48.4284, lon: -123.3656 },
  
  // Europe
  'london': { lat: 51.5074, lon: -0.1278 },
  'paris': { lat: 48.8566, lon: 2.3522 },
  'berlin': { lat: 52.5200, lon: 13.4050 },
  'rome': { lat: 41.9028, lon: 12.4964 },
  'madrid': { lat: 40.4168, lon: -3.7038 },
  'barcelona': { lat: 41.3851, lon: 2.1734 },
  'amsterdam': { lat: 52.3676, lon: 4.9041 },
  'brussels': { lat: 50.8503, lon: 4.3517 },
  'vienna': { lat: 48.2082, lon: 16.3738 },
  'zurich': { lat: 47.3769, lon: 8.5417 },
  'geneva': { lat: 46.2044, lon: 6.1432 },
  'stockholm': { lat: 59.3293, lon: 18.0686 },
  'oslo': { lat: 59.9139, lon: 10.7522 },
  'copenhagen': { lat: 55.6761, lon: 12.5683 },
  'dublin': { lat: 53.3498, lon: -6.2603 },
  'lisbon': { lat: 38.7223, lon: -9.1393 },
  'athens': { lat: 37.9838, lon: 23.7275 },
  'prague': { lat: 50.0755, lon: 14.4378 },
  'budapest': { lat: 47.4979, lon: 19.0402 },
  'warsaw': { lat: 52.2297, lon: 21.0122 },
  'moscow': { lat: 55.7558, lon: 37.6173 },
  'st petersburg': { lat: 59.9311, lon: 30.3609 },
  'munich': { lat: 48.1351, lon: 11.5820 },
  'frankfurt': { lat: 50.1109, lon: 8.6821 },
  'hamburg': { lat: 53.5511, lon: 9.9937 },
  'milan': { lat: 45.4642, lon: 9.1900 },
  'naples': { lat: 40.8518, lon: 14.2681 },
  'florence': { lat: 43.7696, lon: 11.2558 },
  'venice': { lat: 45.4408, lon: 12.3155 },
  'manchester': { lat: 53.4808, lon: -2.2426 },
  'birmingham': { lat: 52.4862, lon: -1.8904 },
  'glasgow': { lat: 55.8642, lon: -4.2518 },
  'edinburgh': { lat: 55.9533, lon: -3.1883 },
  'liverpool': { lat: 53.4084, lon: -2.9916 },
  
  // Asia
  'tokyo': { lat: 35.6762, lon: 139.6503 },
  'beijing': { lat: 39.9042, lon: 116.4074 },
  'shanghai': { lat: 31.2304, lon: 121.4737 },
  'hong kong': { lat: 22.3193, lon: 114.1694 },
  'singapore': { lat: 1.3521, lon: 103.8198 },
  'seoul': { lat: 37.5665, lon: 126.9780 },
  'taipei': { lat: 25.0330, lon: 121.5654 },
  'bangkok': { lat: 13.7563, lon: 100.5018 },
  'mumbai': { lat: 19.0760, lon: 72.8777 },
  'delhi': { lat: 28.7041, lon: 77.1025 },
  'new delhi': { lat: 28.6139, lon: 77.2090 },
  'bangalore': { lat: 12.9716, lon: 77.5946 },
  'chennai': { lat: 13.0827, lon: 80.2707 },
  'kolkata': { lat: 22.5726, lon: 88.3639 },
  'dubai': { lat: 25.2048, lon: 55.2708 },
  'abu dhabi': { lat: 24.4539, lon: 54.3773 },
  'tel aviv': { lat: 32.0853, lon: 34.7818 },
  'jerusalem': { lat: 31.7683, lon: 35.2137 },
  'istanbul': { lat: 41.0082, lon: 28.9784 },
  'manila': { lat: 14.5995, lon: 120.9842 },
  'jakarta': { lat: -6.2088, lon: 106.8456 },
  'kuala lumpur': { lat: 3.1390, lon: 101.6869 },
  'osaka': { lat: 34.6937, lon: 135.5023 },
  'kyoto': { lat: 35.0116, lon: 135.7681 },
  
  // Australia & New Zealand
  'sydney': { lat: -33.8688, lon: 151.2093 },
  'melbourne': { lat: -37.8136, lon: 144.9631 },
  'brisbane': { lat: -27.4698, lon: 153.0251 },
  'perth': { lat: -31.9505, lon: 115.8605 },
  'adelaide': { lat: -34.9285, lon: 138.6007 },
  'auckland': { lat: -36.8485, lon: 174.7633 },
  'wellington': { lat: -41.2865, lon: 174.7762 },
  
  // South America
  'mexico city': { lat: 19.4326, lon: -99.1332 },
  'sao paulo': { lat: -23.5505, lon: -46.6333 },
  'rio de janeiro': { lat: -22.9068, lon: -43.1729 },
  'buenos aires': { lat: -34.6037, lon: -58.3816 },
  'bogota': { lat: 4.7110, lon: -74.0721 },
  'lima': { lat: -12.0464, lon: -77.0428 },
  'santiago': { lat: -33.4489, lon: -70.6693 },
  'caracas': { lat: 10.4806, lon: -66.9036 },
  
  // Africa
  'cairo': { lat: 30.0444, lon: 31.2357 },
  'johannesburg': { lat: -26.2041, lon: 28.0473 },
  'cape town': { lat: -33.9249, lon: 18.4241 },
  'lagos': { lat: 6.5244, lon: 3.3792 },
  'nairobi': { lat: -1.2921, lon: 36.8219 },
  'casablanca': { lat: 33.5731, lon: -7.5898 },
  'marrakech': { lat: 31.6295, lon: -7.9811 },
};

// Get coordinates from location string (enhanced)
export const getCoordinatesFromLocation = (location: string): { lat: number; lon: number } | null => {
  const lowerLocation = location.toLowerCase().trim();
  
  // Try exact match first
  if (EXTENDED_CITY_COORDINATES[lowerLocation]) {
    return EXTENDED_CITY_COORDINATES[lowerLocation];
  }
  
  // Try partial match
  for (const [city, coords] of Object.entries(EXTENDED_CITY_COORDINATES)) {
    if (lowerLocation.includes(city) || city.includes(lowerLocation)) {
      return coords;
    }
  }
  
  return null;
};

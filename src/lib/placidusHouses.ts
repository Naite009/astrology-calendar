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

// Mean obliquity of the ecliptic for the date (Laskar), in degrees.
const obliquityOfDate = (jd: number): number => {
  const t = julianCenturies(jd);
  const sec = 21.448 - t * (46.8150 + t * (0.00059 - t * 0.001813));
  return 23 + (26 + sec / 60) / 60;
};

// Ecliptic longitude of the point on the ecliptic with this right ascension.
const raToEclipticLongitude = (raDeg: number, obliquity: number): number => {
  const ra = raDeg * DEG_TO_RAD;
  const obl = obliquity * DEG_TO_RAD;
  let lon = Math.atan2(Math.sin(ra), Math.cos(ra) * Math.cos(obl)) * RAD_TO_DEG;
  lon = ((lon % 360) + 360) % 360;
  // atan2 loses the half-turn, so keep the longitude in the same half of the
  // sky as the right ascension it came from.
  const raNorm = ((raDeg % 360) + 360) % 360;
  if (Math.abs(((lon - raNorm + 540) % 360) - 180) > 90) lon = (lon + 180) % 360;
  return lon;
};

// Calculate Ascendant from local sidereal time.
const calculateAscendant = (lst: number, latitude: number, obliquity: number): number => {
  const lstRad = lst * DEG_TO_RAD;
  const latRad = latitude * DEG_TO_RAD;
  const obliqRad = obliquity * DEG_TO_RAD;

  // Standard formula for the rising degree (not its opposite).
  const y = Math.cos(lstRad);
  const x = -(Math.sin(obliqRad) * Math.tan(latRad) + Math.cos(obliqRad) * Math.sin(lstRad));

  let asc = Math.atan2(y, x) * RAD_TO_DEG;
  asc = ((asc % 360) + 360) % 360;
  return asc;
};

// Calculate MC (Medium Coeli / Midheaven): the ecliptic degree on the meridian.
const calculateMC = (lst: number, obliquity: number): number =>
  raToEclipticLongitude(lst, obliquity);

/**
 * Placidus intermediate cusps by true semi-arc trisection.
 *
 * Each of cusps 11, 12, 2 and 3 sits at a fixed fraction of its own
 * semi-diurnal or semi-nocturnal arc, measured from the meridian:
 *
 *   RA(11) = RAMC + (90 + AD) / 3          RA(12) = RAMC + 2 (90 + AD) / 3
 *   RA(2)  = RAMC + 180 - 2 (90 - AD) / 3  RA(3)  = RAMC + 180 - (90 - AD) / 3
 *
 * where AD is the ascensional difference of the cusp itself, so the equation
 * has to be solved by iteration. The remaining cusps are the oppositions.
 * At AD = 0 (equator) this collapses to even 30 degree steps, which is the
 * check that the fractions are the right way round.
 */
const placidusIntermediateCusp = (
  houseNumber: 11 | 12 | 2 | 3,
  ramc: number,
  latitude: number,
  obliquity: number,
): number | null => {
  const latRad = latitude * DEG_TO_RAD;
  const obliqRad = obliquity * DEG_TO_RAD;
  const offset = { 11: 30, 12: 60, 2: 120, 3: 150 }[houseNumber];

  let ra = ramc + offset;
  for (let i = 0; i < 30; i++) {
    const raRad = ra * DEG_TO_RAD;
    // Declination of the ecliptic point at this right ascension.
    const dec = Math.atan(Math.tan(obliqRad) * Math.sin(raRad));
    const sinAD = Math.tan(dec) * Math.tan(latRad);
    // Circumpolar: the cusp has no rising arc, so Placidus is undefined here.
    if (Math.abs(sinAD) >= 1) return null;
    const ad = Math.asin(sinAD) * RAD_TO_DEG;

    let next: number;
    if (houseNumber === 11) next = ramc + (90 + ad) / 3;
    else if (houseNumber === 12) next = ramc + (2 * (90 + ad)) / 3;
    else if (houseNumber === 2) next = ramc + 180 - (2 * (90 - ad)) / 3;
    else next = ramc + 180 - (90 - ad) / 3;

    if (Math.abs(next - ra) < 1e-9) {
      ra = next;
      break;
    }
    ra = next;
  }

  return raToEclipticLongitude(ra, obliquity);
};

/** Porphyry fallback: trisect each ecliptic quadrant. Used above the polar circle. */
const porphyryCusps = (asc: number, mc: number): number[] => {
  const cusps: number[] = [];
  const arc = (from: number, to: number) => ((to - from) % 360 + 360) % 360;
  const q1 = arc(mc, asc); // MC to Ascendant, houses 11 and 12
  const q2 = arc(asc, (mc + 180) % 360); // Ascendant to IC, houses 2 and 3
  cusps[1] = asc;
  cusps[10] = mc;
  cusps[4] = (mc + 180) % 360;
  cusps[7] = (asc + 180) % 360;
  cusps[11] = (mc + q1 / 3) % 360;
  cusps[12] = (mc + (2 * q1) / 3) % 360;
  cusps[2] = (asc + q2 / 3) % 360;
  cusps[3] = (asc + (2 * q2) / 3) % 360;
  for (const h of [11, 12, 2, 3]) cusps[(h + 6) > 12 ? h - 6 : h + 6] = (cusps[h] + 180) % 360;
  return cusps;
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
  const jd = dateToJD(date);
  const lst = localSiderealTime(jd, longitude);
  const obliquity = obliquityOfDate(jd);

  const asc = calculateAscendant(lst, latitude, obliquity);
  const mc = calculateMC(lst, obliquity);

  // Placidus proper, with a Porphyry fallback for latitudes where a cusp
  // never rises (above roughly 66 degrees) so the chart still has 12 houses.
  const cusps: number[] = [];
  cusps[1] = asc;
  cusps[10] = mc;
  cusps[4] = (mc + 180) % 360;
  cusps[7] = (asc + 180) % 360;

  let usedPorphyry = false;
  for (const h of [11, 12, 2, 3] as const) {
    const value = placidusIntermediateCusp(h, lst, latitude, obliquity);
    if (value === null) {
      usedPorphyry = true;
      break;
    }
    cusps[h] = value;
  }

  if (usedPorphyry) {
    const fallback = porphyryCusps(asc, mc);
    for (let i = 1; i <= 12; i++) cusps[i] = fallback[i];
  } else {
    cusps[5] = (cusps[11] + 180) % 360;
    cusps[6] = (cusps[12] + 180) % 360;
    cusps[8] = (cusps[2] + 180) % 360;
    cusps[9] = (cusps[3] + 180) % 360;
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
  // New Jersey (common birth cities, so angles are exact rather than state-level)
  'newton, nj': { lat: 41.0581, lon: -74.7529 },
  'denville': { lat: 40.8918, lon: -74.4815 },
  'passaic': { lat: 40.8568, lon: -74.1285 },
  'clifton': { lat: 40.8584, lon: -74.1638 },
  'union': { lat: 40.6976, lon: -74.2632 },
  'hoboken': { lat: 40.7439, lon: -74.0324 },
  'bayonne': { lat: 40.6687, lon: -74.1143 },
  'dover, nj': { lat: 40.8840, lon: -74.5621 },
  // Pennsylvania and Maryland suburbs that appear in these charts
  'wynnewood': { lat: 40.0087, lon: -75.2860 },
  'bryn mawr': { lat: 40.0223, lon: -75.3157 },
  'ardmore': { lat: 40.0068, lon: -75.2871 },
  'narberth': { lat: 40.0134, lon: -75.2610 },
  'bala cynwyd': { lat: 40.0068, lon: -75.2338 },
  'abington': { lat: 40.1201, lon: -75.1180 },
  'bethesda': { lat: 38.9807, lon: -77.1003 },
  'silver spring': { lat: 38.9907, lon: -77.0261 },
  'rockville': { lat: 39.0840, lon: -77.1528 },
  'chevy chase': { lat: 38.9686, lon: -77.0872 },

  'hackensack': { lat: 40.8859, lon: -74.0435 },
  'newark': { lat: 40.7357, lon: -74.1724 },
  'jersey city': { lat: 40.7178, lon: -74.0431 },
  'paterson': { lat: 40.9168, lon: -74.1718 },
  'trenton': { lat: 40.2171, lon: -74.7429 },
  'elizabeth': { lat: 40.6639, lon: -74.2107 },
  'edison': { lat: 40.5187, lon: -74.4121 },
  'morristown': { lat: 40.7968, lon: -74.4815 },
  'ridgewood': { lat: 40.9793, lon: -74.1165 },
  'englewood': { lat: 40.8929, lon: -73.9726 },
  'teaneck': { lat: 40.8976, lon: -74.0160 },
  'montclair': { lat: 40.8259, lon: -74.2090 },
  'new brunswick': { lat: 40.4862, lon: -74.4518 },
  'camden': { lat: 39.9259, lon: -75.1196 },
  'atlantic city': { lat: 39.3643, lon: -74.4229 },
  'long branch': { lat: 40.3043, lon: -73.9924 },
  'toms river': { lat: 39.9537, lon: -74.1979 },
  'livingston': { lat: 40.7959, lon: -74.3149 },
  'summit': { lat: 40.7156, lon: -74.3646 },
  'princeton': { lat: 40.3573, lon: -74.6672 },
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

  // Longest partial match, so a specific city beats a shorter name that
  // happens to be contained in the same string.
  let best: { lat: number; lon: number } | null = null;
  let bestLength = 0;
  for (const [city, coords] of Object.entries(EXTENDED_CITY_COORDINATES)) {
    if (lowerLocation.includes(city) && city.length > bestLength) {
      best = coords;
      bestLength = city.length;
    }
  }
  if (best) return best;

  // Last resort: the stored city name contains the queried fragment.
  for (const [city, coords] of Object.entries(EXTENDED_CITY_COORDINATES)) {
    if (city.includes(lowerLocation)) return coords;
  }

  return null;
};


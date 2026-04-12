/**
 * Natal Astrocartography — Planetary Line Calculator
 * 
 * Calculates where each NATAL planet would be angular (conjunct ASC, MC, DSC, IC)
 * at different geographic locations for the birth moment.
 * 
 * Unlike Solar Return astrocartography (which changes yearly), natal lines are
 * PERMANENT and deterministic — same birth data always produces the same lines.
 */

import * as Astronomy from 'astronomy-engine';
import { NatalChart } from '@/hooks/useNatalChart';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const PLANETS_CORE = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'] as const;

const toRad = (d: number) => d * Math.PI / 180;
const toDeg = (r: number) => r * 180 / Math.PI;

const toAbsDeg = (pos: any): number | null => {
  if (!pos?.sign) return null;
  const idx = SIGNS.indexOf(pos.sign);
  if (idx < 0) return null;
  return idx * 30 + (pos.degree || 0) + ((pos as any).minutes || 0) / 60;
};

// ─── Types ──────────────────────────────────────────────────────────

export interface NatalAstrocartoCity {
  city: string;
  country: string;
  state?: string;
  lat: number;
  lng: number;
  angularPlanets: { planet: string; angle: string; orb: number; lineLatitude: number }[];
  rating: number; // 0-10
  summary: string;
  isBenefic: boolean;
  isMalefic: boolean;
}

export interface NatalAstrocartographyResult {
  topBeneficCities: NatalAstrocartoCity[];
  cautionCities: NatalAstrocartoCity[];
  contextString: string; // Pre-formatted string to inject into AI prompt
}

// ─── Major Cities (reuse from SR module) ────────────────────────────

interface CityData { city: string; country: string; state?: string; lat: number; lng: number; }

const WORLD_CITIES: CityData[] = [
  // USA
  { city: 'New York', country: 'USA', state: 'NY', lat: 40.71, lng: -74.01 },
  { city: 'Los Angeles', country: 'USA', state: 'CA', lat: 33.94, lng: -118.24 },
  { city: 'Chicago', country: 'USA', state: 'IL', lat: 41.88, lng: -87.63 },
  { city: 'Miami', country: 'USA', state: 'FL', lat: 25.76, lng: -80.19 },
  { city: 'San Francisco', country: 'USA', state: 'CA', lat: 37.77, lng: -122.42 },
  { city: 'Denver', country: 'USA', state: 'CO', lat: 39.74, lng: -104.98 },
  { city: 'Austin', country: 'USA', state: 'TX', lat: 30.27, lng: -97.74 },
  { city: 'Seattle', country: 'USA', state: 'WA', lat: 47.61, lng: -122.33 },
  { city: 'Nashville', country: 'USA', state: 'TN', lat: 36.16, lng: -86.78 },
  { city: 'Honolulu', country: 'USA', state: 'HI', lat: 21.31, lng: -157.86 },
  { city: 'Phoenix', country: 'USA', state: 'AZ', lat: 33.45, lng: -112.07 },
  { city: 'Atlanta', country: 'USA', state: 'GA', lat: 33.75, lng: -84.39 },
  { city: 'Boston', country: 'USA', state: 'MA', lat: 42.36, lng: -71.06 },
  { city: 'Dallas', country: 'USA', state: 'TX', lat: 32.78, lng: -96.80 },
  { city: 'Houston', country: 'USA', state: 'TX', lat: 29.76, lng: -95.37 },
  { city: 'New Orleans', country: 'USA', state: 'LA', lat: 29.95, lng: -90.07 },
  { city: 'Las Vegas', country: 'USA', state: 'NV', lat: 36.17, lng: -115.14 },
  { city: 'San Diego', country: 'USA', state: 'CA', lat: 32.72, lng: -117.16 },
  { city: 'Minneapolis', country: 'USA', state: 'MN', lat: 44.98, lng: -93.27 },
  { city: 'Washington DC', country: 'USA', state: 'DC', lat: 38.91, lng: -77.04 },
  { city: 'Portland', country: 'USA', state: 'OR', lat: 45.52, lng: -122.68 },
  { city: 'Philadelphia', country: 'USA', state: 'PA', lat: 39.95, lng: -75.17 },
  { city: 'Salt Lake City', country: 'USA', state: 'UT', lat: 40.76, lng: -111.89 },
  { city: 'Charlotte', country: 'USA', state: 'NC', lat: 35.23, lng: -80.84 },
  { city: 'Tampa', country: 'USA', state: 'FL', lat: 27.95, lng: -82.46 },
  { city: 'San Antonio', country: 'USA', state: 'TX', lat: 29.42, lng: -98.49 },
  { city: 'Savannah', country: 'USA', state: 'GA', lat: 32.08, lng: -81.09 },
  { city: 'Asheville', country: 'USA', state: 'NC', lat: 35.60, lng: -82.55 },
  { city: 'Santa Fe', country: 'USA', state: 'NM', lat: 35.69, lng: -105.94 },
  { city: 'Sedona', country: 'USA', state: 'AZ', lat: 34.87, lng: -111.76 },
  // More USA
  { city: 'Raleigh', country: 'USA', state: 'NC', lat: 35.78, lng: -78.64 },
  { city: 'Pittsburgh', country: 'USA', state: 'PA', lat: 40.44, lng: -79.99 },
  { city: 'Columbus', country: 'USA', state: 'OH', lat: 39.96, lng: -82.99 },
  { city: 'Cleveland', country: 'USA', state: 'OH', lat: 41.50, lng: -81.69 },
  { city: 'St. Louis', country: 'USA', state: 'MO', lat: 38.63, lng: -90.20 },
  { city: 'Kansas City', country: 'USA', state: 'MO', lat: 39.10, lng: -94.58 },
  { city: 'Indianapolis', country: 'USA', state: 'IN', lat: 39.77, lng: -86.16 },
  { city: 'Detroit', country: 'USA', state: 'MI', lat: 42.33, lng: -83.05 },
  { city: 'Milwaukee', country: 'USA', state: 'WI', lat: 43.04, lng: -87.91 },
  { city: 'Tucson', country: 'USA', state: 'AZ', lat: 32.22, lng: -110.93 },
  { city: 'Albuquerque', country: 'USA', state: 'NM', lat: 35.08, lng: -106.65 },
  { city: 'Boise', country: 'USA', state: 'ID', lat: 43.62, lng: -116.21 },
  { city: 'Anchorage', country: 'USA', state: 'AK', lat: 61.22, lng: -149.90 },
  { city: 'Maui', country: 'USA', state: 'HI', lat: 20.80, lng: -156.32 },
  { city: 'Jacksonville', country: 'USA', state: 'FL', lat: 30.33, lng: -81.66 },
  { city: 'Richmond', country: 'USA', state: 'VA', lat: 37.54, lng: -77.44 },
  { city: 'Charleston', country: 'USA', state: 'SC', lat: 32.78, lng: -79.93 },
  { city: 'Oklahoma City', country: 'USA', state: 'OK', lat: 35.47, lng: -97.52 },
  { city: 'Memphis', country: 'USA', state: 'TN', lat: 35.15, lng: -90.05 },
  { city: 'Louisville', country: 'USA', state: 'KY', lat: 38.25, lng: -85.76 },
  { city: 'Sacramento', country: 'USA', state: 'CA', lat: 38.58, lng: -121.49 },
  { city: 'Baltimore', country: 'USA', state: 'MD', lat: 39.29, lng: -76.61 },
  { city: 'Hartford', country: 'USA', state: 'CT', lat: 41.76, lng: -72.68 },
  { city: 'Burlington', country: 'USA', state: 'VT', lat: 44.48, lng: -73.21 },
  // International — Americas
  { city: 'Mexico City', country: 'Mexico', lat: 19.43, lng: -99.13 },
  { city: 'Cancún', country: 'Mexico', lat: 21.16, lng: -86.85 },
  { city: 'Tulum', country: 'Mexico', lat: 20.21, lng: -87.46 },
  { city: 'Guadalajara', country: 'Mexico', lat: 20.67, lng: -103.35 },
  { city: 'São Paulo', country: 'Brazil', lat: -23.55, lng: -46.63 },
  { city: 'Rio de Janeiro', country: 'Brazil', lat: -22.91, lng: -43.17 },
  { city: 'Buenos Aires', country: 'Argentina', lat: -34.60, lng: -58.38 },
  { city: 'Lima', country: 'Peru', lat: -12.05, lng: -77.04 },
  { city: 'Bogotá', country: 'Colombia', lat: 4.71, lng: -74.07 },
  { city: 'Medellín', country: 'Colombia', lat: 6.25, lng: -75.56 },
  { city: 'Santiago', country: 'Chile', lat: -33.45, lng: -70.67 },
  { city: 'Havana', country: 'Cuba', lat: 23.11, lng: -82.37 },
  { city: 'San José', country: 'Costa Rica', lat: 9.93, lng: -84.08 },
  { city: 'Toronto', country: 'Canada', lat: 43.65, lng: -79.38 },
  { city: 'Vancouver', country: 'Canada', lat: 49.28, lng: -123.12 },
  { city: 'Montreal', country: 'Canada', lat: 45.50, lng: -73.57 },
  { city: 'Calgary', country: 'Canada', lat: 51.05, lng: -114.07 },
  // International — Europe
  { city: 'London', country: 'UK', lat: 51.51, lng: -0.13 },
  { city: 'Paris', country: 'France', lat: 48.86, lng: 2.35 },
  { city: 'Rome', country: 'Italy', lat: 41.90, lng: 12.50 },
  { city: 'Barcelona', country: 'Spain', lat: 41.39, lng: 2.17 },
  { city: 'Madrid', country: 'Spain', lat: 40.42, lng: -3.70 },
  { city: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.41 },
  { city: 'Munich', country: 'Germany', lat: 48.14, lng: 11.58 },
  { city: 'Amsterdam', country: 'Netherlands', lat: 52.37, lng: 4.90 },
  { city: 'Lisbon', country: 'Portugal', lat: 38.72, lng: -9.14 },
  { city: 'Athens', country: 'Greece', lat: 37.98, lng: 23.73 },
  { city: 'Istanbul', country: 'Turkey', lat: 41.01, lng: 28.98 },
  { city: 'Dublin', country: 'Ireland', lat: 53.35, lng: -6.26 },
  { city: 'Edinburgh', country: 'UK', lat: 55.95, lng: -3.19 },
  { city: 'Florence', country: 'Italy', lat: 43.77, lng: 11.25 },
  { city: 'Prague', country: 'Czech Republic', lat: 50.08, lng: 14.44 },
  { city: 'Vienna', country: 'Austria', lat: 48.21, lng: 16.37 },
  { city: 'Copenhagen', country: 'Denmark', lat: 55.68, lng: 12.57 },
  { city: 'Stockholm', country: 'Sweden', lat: 59.33, lng: 18.07 },
  { city: 'Oslo', country: 'Norway', lat: 59.91, lng: 10.75 },
  { city: 'Helsinki', country: 'Finland', lat: 60.17, lng: 24.94 },
  { city: 'Zurich', country: 'Switzerland', lat: 47.37, lng: 8.54 },
  { city: 'Budapest', country: 'Hungary', lat: 47.50, lng: 19.04 },
  { city: 'Warsaw', country: 'Poland', lat: 52.23, lng: 21.01 },
  { city: 'Reykjavik', country: 'Iceland', lat: 64.15, lng: -21.94 },
  { city: 'Dubrovnik', country: 'Croatia', lat: 42.65, lng: 18.09 },
  { city: 'Nice', country: 'France', lat: 43.71, lng: 7.26 },
  { city: 'Marseille', country: 'France', lat: 43.30, lng: 5.37 },
  // International — Asia & Pacific
  { city: 'Dubai', country: 'UAE', lat: 25.20, lng: 55.27 },
  { city: 'Mumbai', country: 'India', lat: 19.08, lng: 72.88 },
  { city: 'Delhi', country: 'India', lat: 28.61, lng: 77.21 },
  { city: 'Bangkok', country: 'Thailand', lat: 13.76, lng: 100.50 },
  { city: 'Chiang Mai', country: 'Thailand', lat: 18.79, lng: 98.98 },
  { city: 'Bali', country: 'Indonesia', lat: -8.41, lng: 115.19 },
  { city: 'Tokyo', country: 'Japan', lat: 35.68, lng: 139.69 },
  { city: 'Kyoto', country: 'Japan', lat: 35.01, lng: 135.77 },
  { city: 'Seoul', country: 'South Korea', lat: 37.57, lng: 126.98 },
  { city: 'Singapore', country: 'Singapore', lat: 1.35, lng: 103.82 },
  { city: 'Hong Kong', country: 'China', lat: 22.32, lng: 114.17 },
  { city: 'Shanghai', country: 'China', lat: 31.23, lng: 121.47 },
  { city: 'Taipei', country: 'Taiwan', lat: 25.03, lng: 121.57 },
  { city: 'Ho Chi Minh City', country: 'Vietnam', lat: 10.82, lng: 106.63 },
  { city: 'Sydney', country: 'Australia', lat: -33.87, lng: 151.21 },
  { city: 'Melbourne', country: 'Australia', lat: -37.81, lng: 144.96 },
  { city: 'Auckland', country: 'New Zealand', lat: -36.85, lng: 174.76 },
  // International — Africa & Middle East
  { city: 'Cape Town', country: 'South Africa', lat: -33.93, lng: 18.42 },
  { city: 'Marrakech', country: 'Morocco', lat: 31.63, lng: -8.01 },
  { city: 'Nairobi', country: 'Kenya', lat: -1.29, lng: 36.82 },
  { city: 'Cairo', country: 'Egypt', lat: 30.04, lng: 31.24 },
  { city: 'Tel Aviv', country: 'Israel', lat: 32.09, lng: 34.78 },
];

const BENEFIC_SET = new Set(['Sun', 'Moon', 'Venus', 'Jupiter']);
const MALEFIC_SET = new Set(['Saturn', 'Mars', 'Pluto']);

const OBLIQUITY = 23.4392911;

// ─── Core Calculation (identical math to SR version) ────────────────

function calculateMCAtLongitude(gst: number, geoLongitude: number): number {
  const LST = ((gst + geoLongitude) % 360 + 360) % 360;
  const RAMC = toRad(LST);
  const oblRad = toRad(OBLIQUITY);
  let mcLong = toDeg(Math.atan2(Math.sin(RAMC), Math.cos(RAMC) * Math.cos(oblRad)));
  return ((mcLong % 360) + 360) % 360;
}

function calculateASCAtLocation(gst: number, geoLongitude: number, geoLatitude: number): number {
  const LST = ((gst + geoLongitude) % 360 + 360) % 360;
  const RAMC = toRad(LST);
  const oblRad = toRad(OBLIQUITY);
  const latRad = toRad(geoLatitude);
  const y = Math.cos(RAMC);
  const x = -(Math.sin(RAMC) * Math.cos(oblRad)) - (Math.tan(latRad) * Math.sin(oblRad));
  let ascLong = toDeg(Math.atan2(y, x));
  return ((ascLong % 360) + 360) % 360;
}

/**
 * Derive GST from natal chart's MC and birth location.
 * If we have birthDate + birthTime + timezone, we can compute it precisely.
 */
function getGSTFromChart(chart: NatalChart): number | null {
  // Try to compute from birth date/time first (most precise)
  if (chart.birthDate && chart.birthTime) {
    try {
      // Parse birth date: could be "YYYY-MM-DD", "MM/DD/YYYY", etc.
      const dateStr = chart.birthDate;
      const timeStr = chart.birthTime;
      
      // Try to build a UTC date from birth date + time + timezone offset
      const timeParts = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (timeParts) {
        let hours = parseInt(timeParts[1]);
        const mins = parseInt(timeParts[2]);
        const ampm = timeParts[3];
        if (ampm) {
          if (ampm.toUpperCase() === 'PM' && hours !== 12) hours += 12;
          if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
        }
        
        // Try to parse date
        let d: Date | null = null;
        const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
        const usMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        
        if (isoMatch) {
          d = new Date(Date.UTC(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]), hours, mins));
        } else if (usMatch) {
          d = new Date(Date.UTC(parseInt(usMatch[3]), parseInt(usMatch[1]) - 1, parseInt(usMatch[2]), hours, mins));
        }
        
        if (d && !isNaN(d.getTime())) {
          // Apply timezone offset if available
          const tzOffset = chart.timezoneOffset ?? -6; // default CST
          d = new Date(d.getTime() - tzOffset * 3600000);
          
          const gastHours = Astronomy.SiderealTime(d);
          return ((gastHours * 15) % 360 + 360) % 360;
        }
      }
    } catch {
      // Fall through to MC-based estimation
    }
  }
  
  // Fallback: derive GST from the MC position and birth location
  const mc = chart.houseCusps?.house10;
  if (!mc || !('sign' in mc)) return null;
  
  const mcPos = mc as { sign: string; degree: number; minutes?: number };
  const mcIdx = SIGNS.indexOf(mcPos.sign);
  if (mcIdx < 0) return null;
  const mcLong = mcIdx * 30 + mcPos.degree + ((mcPos as any).minutes || 0) / 60;
  
  // Parse birth location longitude
  let birthLng = -95.37; // default Houston
  const locStr = chart.birthLocation || '';
  const coordMatch = locStr.match(/([-]?\d+\.?\d*)\s*[°]?\s*[NS]?\s*,?\s*([-]?\d+\.?\d*)/);
  if (coordMatch) {
    birthLng = parseFloat(coordMatch[2]);
  }
  
  const oblRad = toRad(OBLIQUITY);
  const mcRad = toRad(mcLong);
  let RAMC = toDeg(Math.atan2(Math.sin(mcRad) * Math.cos(oblRad), Math.cos(mcRad)));
  RAMC = ((RAMC % 360) + 360) % 360;
  return ((RAMC - birthLng) % 360 + 360) % 360;
}

// ─── Angle descriptions ─────────────────────────────────────────────

const ANGLE_LABELS: Record<string, string> = {
  ASC: 'Ascendant',
  MC: 'Midheaven',
  DSC: 'Descendant',
  IC: 'Imum Coeli',
};

// ─── Main Calculator ────────────────────────────────────────────────

export function calculateNatalAstrocartography(chart: NatalChart): NatalAstrocartographyResult | null {
  const GST = getGSTFromChart(chart);
  if (GST === null) return null;

  const ORB = 2.0; // Strict 2° orb as user requested
  const cityResults: NatalAstrocartoCity[] = [];

  for (const cityData of WORLD_CITIES) {
    const mc = calculateMCAtLongitude(GST, cityData.lng);
    const ic = (mc + 180) % 360;
    const asc = calculateASCAtLocation(GST, cityData.lng, cityData.lat);
    const dsc = (asc + 180) % 360;

    const angles = [
      { name: 'ASC', deg: asc },
      { name: 'MC', deg: mc },
      { name: 'DSC', deg: dsc },
      { name: 'IC', deg: ic },
    ];

    const angularPlanets: { planet: string; angle: string; orb: number; lineLatitude: number }[] = [];

    for (const planet of PLANETS_CORE) {
      const pos = chart.planets[planet as keyof typeof chart.planets];
      if (!pos) continue;
      const planetDeg = toAbsDeg(pos);
      if (planetDeg === null) continue;

      for (const angle of angles) {
        let diff = Math.abs(planetDeg - angle.deg);
        if (diff > 180) diff = 360 - diff;
        if (diff <= ORB) {
          angularPlanets.push({
            planet,
            angle: angle.name,
            orb: Math.round(diff * 100) / 100,
            lineLatitude: cityData.lat,
          });
        }
      }
    }

    if (angularPlanets.length === 0) continue;

    const hasBenefic = angularPlanets.some(ap => BENEFIC_SET.has(ap.planet));
    const hasMalefic = angularPlanets.some(ap => MALEFIC_SET.has(ap.planet));

    // Simple rating: benefics boost, malefics reduce
    let rating = 5;
    for (const ap of angularPlanets) {
      if (BENEFIC_SET.has(ap.planet)) rating += (2 - ap.orb) * 1.2;
      else if (MALEFIC_SET.has(ap.planet)) rating -= (2 - ap.orb) * 0.8;
    }
    rating = Math.min(10, Math.max(1, Math.round(rating * 10) / 10));

    const lineDescs = angularPlanets.map(ap =>
      `${ap.planet} ${ap.angle} line (${ap.orb.toFixed(1)}° orb at ${cityData.lat.toFixed(1)}°N)`
    );

    cityResults.push({
      city: cityData.city,
      country: cityData.country,
      state: cityData.state,
      lat: cityData.lat,
      lng: cityData.lng,
      angularPlanets,
      rating,
      summary: lineDescs.join('; '),
      isBenefic: hasBenefic && !hasMalefic,
      isMalefic: hasMalefic && !hasBenefic,
    });
  }

  // Sort: benefic cities first by rating desc, then malefic by rating asc
  const beneficCities = cityResults
    .filter(c => c.isBenefic)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);
  
  const cautionCities = cityResults
    .filter(c => c.isMalefic)
    .sort((a, b) => a.rating - b.rating)
    .slice(0, 5);

  // Mixed cities (both benefic and malefic lines)
  const mixedCities = cityResults
    .filter(c => !c.isBenefic && !c.isMalefic && c.angularPlanets.length > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  // Build context string for AI prompt
  let contextString = '--- NATAL ASTROCARTOGRAPHY (deterministic, math-based) ---\n';
  contextString += 'These planetary lines are calculated from exact birth data and are FIXED. Do NOT change, add, or remove cities.\n\n';

  if (beneficCities.length > 0) {
    contextString += 'BENEFIC CITIES (Venus, Jupiter, Sun, or Moon within 2° of an angle):\n';
    for (const c of beneficCities) {
      const label = c.state ? `${c.city}, ${c.state}, ${c.country}` : `${c.city}, ${c.country}`;
      contextString += `• ${label} — ${c.summary} — Rating: ${c.rating}/10\n`;
    }
    contextString += '\n';
  }

  if (cautionCities.length > 0) {
    contextString += 'CAUTION CITIES (Saturn, Mars, or Pluto within 2° of an angle):\n';
    for (const c of cautionCities) {
      const label = c.state ? `${c.city}, ${c.state}, ${c.country}` : `${c.city}, ${c.country}`;
      contextString += `• ${label} — ${c.summary} — Rating: ${c.rating}/10\n`;
    }
    contextString += '\n';
  }

  if (mixedCities.length > 0) {
    contextString += 'MIXED CITIES (both benefic and malefic lines):\n';
    for (const c of mixedCities) {
      const label = c.state ? `${c.city}, ${c.state}, ${c.country}` : `${c.city}, ${c.country}`;
      contextString += `• ${label} — ${c.summary} — Rating: ${c.rating}/10\n`;
    }
    contextString += '\n';
  }

  if (beneficCities.length === 0 && cautionCities.length === 0 && mixedCities.length === 0) {
    contextString += 'No major cities have natal planetary lines within 2° orb. Use relocated chart angles instead.\n';
  }

  return {
    topBeneficCities: beneficCities,
    cautionCities,
    contextString,
  };
}

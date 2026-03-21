/**
 * Solar Return Astrocartography — Planetary Line Calculator
 * 
 * Calculates where each planet would be angular (conjunct ASC, MC, DSC, IC)
 * at different geographic longitudes for the Solar Return moment.
 * 
 * This enables "where should I spend my birthday?" analysis by showing
 * which cities put benefics (Venus, Jupiter, Sun) on powerful angles.
 */

import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
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

export interface AstrocartoLine {
  planet: string;
  lineType: 'ASC' | 'MC' | 'DSC' | 'IC';
  longitude: number;  // geographic longitude where this line falls
  interpretation: string;
}

export interface AstrocartoCity {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  angularPlanets: { planet: string; angle: string; orb: number }[];
  rating: number;       // 0-10 desirability
  summary: string;
}

export interface SRAstrocartography {
  lines: AstrocartoLine[];
  topCities: AstrocartoCity[];
  bestBeneficCity: string | null;
  worstMaleficCity: string | null;
  currentLocationRating: number;
  interpretation: string;
}

// ─── Major Cities Database ──────────────────────────────────────────

interface CityData { city: string; country: string; lat: number; lng: number; }

const WORLD_CITIES: CityData[] = [
  { city: 'New York', country: 'USA', lat: 40.71, lng: -74.01 },
  { city: 'Los Angeles', country: 'USA', lat: 33.94, lng: -118.24 },
  { city: 'Chicago', country: 'USA', lat: 41.88, lng: -87.63 },
  { city: 'Miami', country: 'USA', lat: 25.76, lng: -80.19 },
  { city: 'San Francisco', country: 'USA', lat: 37.77, lng: -122.42 },
  { city: 'Denver', country: 'USA', lat: 39.74, lng: -104.98 },
  { city: 'Austin', country: 'USA', lat: 30.27, lng: -97.74 },
  { city: 'Seattle', country: 'USA', lat: 47.61, lng: -122.33 },
  { city: 'Nashville', country: 'USA', lat: 36.16, lng: -86.78 },
  { city: 'Honolulu', country: 'USA', lat: 21.31, lng: -157.86 },
  { city: 'London', country: 'UK', lat: 51.51, lng: -0.13 },
  { city: 'Paris', country: 'France', lat: 48.86, lng: 2.35 },
  { city: 'Rome', country: 'Italy', lat: 41.90, lng: 12.50 },
  { city: 'Barcelona', country: 'Spain', lat: 41.39, lng: 2.17 },
  { city: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.41 },
  { city: 'Amsterdam', country: 'Netherlands', lat: 52.37, lng: 4.90 },
  { city: 'Lisbon', country: 'Portugal', lat: 38.72, lng: -9.14 },
  { city: 'Athens', country: 'Greece', lat: 37.98, lng: 23.73 },
  { city: 'Istanbul', country: 'Turkey', lat: 41.01, lng: 28.98 },
  { city: 'Dubai', country: 'UAE', lat: 25.20, lng: 55.27 },
  { city: 'Mumbai', country: 'India', lat: 19.08, lng: 72.88 },
  { city: 'Bangkok', country: 'Thailand', lat: 13.76, lng: 100.50 },
  { city: 'Bali', country: 'Indonesia', lat: -8.41, lng: 115.19 },
  { city: 'Tokyo', country: 'Japan', lat: 35.68, lng: 139.69 },
  { city: 'Sydney', country: 'Australia', lat: -33.87, lng: 151.21 },
  { city: 'Mexico City', country: 'Mexico', lat: 19.43, lng: -99.13 },
  { city: 'São Paulo', country: 'Brazil', lat: -23.55, lng: -46.63 },
  { city: 'Buenos Aires', country: 'Argentina', lat: -34.60, lng: -58.38 },
  { city: 'Cape Town', country: 'South Africa', lat: -33.93, lng: 18.42 },
  { city: 'Marrakech', country: 'Morocco', lat: 31.63, lng: -8.01 },
  { city: 'Reykjavik', country: 'Iceland', lat: 64.15, lng: -21.94 },
  { city: 'Toronto', country: 'Canada', lat: 43.65, lng: -79.38 },
  { city: 'Vancouver', country: 'Canada', lat: 49.28, lng: -123.12 },
  { city: 'Cancún', country: 'Mexico', lat: 21.16, lng: -86.85 },
  { city: 'Tulum', country: 'Mexico', lat: 20.21, lng: -87.46 },
  { city: 'Sedona', country: 'USA', lat: 34.87, lng: -111.76 },
];

// ─── Planet Benefic/Malefic Ratings ─────────────────────────────────

const PLANET_ANGLE_RATING: Record<string, Record<string, number>> = {
  Sun:     { ASC: 8, MC: 9, DSC: 5, IC: 4 },
  Moon:    { ASC: 7, MC: 5, DSC: 6, IC: 8 },
  Mercury: { ASC: 6, MC: 7, DSC: 5, IC: 4 },
  Venus:   { ASC: 9, MC: 8, DSC: 9, IC: 7 },
  Mars:    { ASC: 4, MC: 5, DSC: 2, IC: 3 },
  Jupiter: { ASC: 9, MC: 10, DSC: 8, IC: 7 },
  Saturn:  { ASC: 3, MC: 5, DSC: 2, IC: 2 },
  Uranus:  { ASC: 4, MC: 4, DSC: 3, IC: 3 },
  Neptune: { ASC: 5, MC: 3, DSC: 4, IC: 5 },
  Pluto:   { ASC: 3, MC: 4, DSC: 2, IC: 3 },
};

const PLANET_LINE_INTERPS: Record<string, Record<string, string>> = {
  Sun: {
    ASC: 'The Sun on the Ascendant gives maximum visibility, confidence, and personal vitality. You shine brightly and attract attention effortlessly. Excellent for self-reinvention.',
    MC: 'The Sun on the Midheaven puts career, public reputation, and achievement in the spotlight. A power location for professional recognition.',
    DSC: 'The Sun on the Descendant attracts powerful partners and significant others. Relationships become defining experiences.',
    IC: 'The Sun on the IC deepens connection to home, family, and roots. A year of building inner security and private happiness.',
  },
  Moon: {
    ASC: 'The Moon on the Ascendant heightens emotional sensitivity and intuition. You feel everything more deeply and others sense your emotional state.',
    MC: 'The Moon on the Midheaven brings public emotional visibility. Career may involve nurturing, counseling, or working with women/families.',
    DSC: 'The Moon on the Descendant draws emotionally significant relationships. Deep bonding and domestic partnership are highlighted.',
    IC: 'The Moon on the IC is its most natural placement — profound emotional security, family healing, and feeling truly at home.',
  },
  Venus: {
    ASC: 'Venus on the Ascendant is the ultimate beauty and magnetism line. You radiate charm, attract love, and everything feels aesthetically harmonious.',
    MC: 'Venus on the Midheaven brings professional success through creativity, diplomacy, and social grace. Excellent for artists and anyone in beauty/luxury industries.',
    DSC: 'Venus on the Descendant is the classic love line — attracts harmonious partnerships, romantic encounters, and pleasant social connections.',
    IC: 'Venus on the IC creates a beautiful, harmonious home life. Domestic happiness, comfort, and pleasure in private spaces.',
  },
  Mars: {
    ASC: 'Mars on the Ascendant gives boldness, physical energy, and assertiveness — but also attracts conflict and accidents. Handle with care.',
    MC: 'Mars on the Midheaven drives career ambition and competitive success — but can also mean professional conflicts or burnout.',
    DSC: 'Mars on the Descendant attracts passionate but contentious relationships. Arguments, competition, and sexual intensity in partnerships.',
    IC: 'Mars on the IC creates restlessness at home, family conflicts, or major home renovations. Unsettled domestic energy.',
  },
  Jupiter: {
    ASC: 'Jupiter on the Ascendant brings optimism, generosity, and lucky breaks. You feel larger than life and opportunities find you.',
    MC: 'Jupiter on the Midheaven is the best career line — recognition, promotion, expansion, and professional abundance.',
    DSC: 'Jupiter on the Descendant attracts generous, wise, or wealthy partners and beneficial business partnerships.',
    IC: 'Jupiter on the IC expands home life — bigger house, more family gatherings, or emotional abundance and security.',
  },
  Saturn: {
    ASC: 'Saturn on the Ascendant brings seriousness, responsibility, and visible aging. You appear more authoritative but also more burdened.',
    MC: 'Saturn on the Midheaven demands professional accountability. Hard work is required, but lasting career structures are built.',
    DSC: 'Saturn on the Descendant brings relationship tests and commitments. Serious partnerships, but also loneliness or delays in love.',
    IC: 'Saturn on the IC weighs on home and family life — obligations, restrictions, or dealing with aging parents.',
  },
  Uranus: {
    ASC: 'Uranus on the Ascendant brings sudden identity changes, excitement, and unpredictability. Liberation from old patterns.',
    MC: 'Uranus on the Midheaven disrupts career — sudden job changes, unconventional career moves, or technology breakthroughs.',
    DSC: 'Uranus on the Descendant attracts unusual partners and sudden relationship changes. Freedom-seeking in love.',
    IC: 'Uranus on the IC disrupts domestic stability — sudden moves, household changes, or emotional liberation from family patterns.',
  },
  Neptune: {
    ASC: 'Neptune on the Ascendant heightens intuition and creativity but blurs personal boundaries. Chameleon energy.',
    MC: 'Neptune on the Midheaven brings artistic/spiritual career potential but also professional confusion and unrealistic expectations.',
    DSC: 'Neptune on the Descendant idealizes partners — soulmate feelings but also deception risk. See partners clearly.',
    IC: 'Neptune on the IC creates a dreamy, spiritual home atmosphere but can mean domestic confusion or escapism.',
  },
  Pluto: {
    ASC: 'Pluto on the Ascendant triggers deep personal transformation. Intense, magnetic presence but also power struggles.',
    MC: 'Pluto on the Midheaven brings career power plays, transformation of public role, and encounters with institutional power.',
    DSC: 'Pluto on the Descendant attracts intense, transformative relationships. Power dynamics in partnerships are magnified.',
    IC: 'Pluto on the IC transforms family dynamics and emotional foundations. Deep psychological excavation of roots.',
  },
  Mercury: {
    ASC: 'Mercury on the Ascendant sharpens communication, wit, and intellectual presence. You come across as articulate and curious.',
    MC: 'Mercury on the Midheaven favors communication-based careers — writing, teaching, speaking, media, commerce.',
    DSC: 'Mercury on the Descendant stimulates intellectual partnerships and important conversations with significant others.',
    IC: 'Mercury on the IC activates mental activity at home — studying, writing from home, or important family communications.',
  },
};

// ─── Core Calculation ───────────────────────────────────────────────

/**
 * Calculate MC (Midheaven) ecliptic longitude for a given geographic longitude.
 * RAMC = Local Sidereal Time * 15
 * MC longitude = atan2(sin(RAMC), cos(RAMC) * cos(obliquity))
 */
function calculateMCAtLongitude(
  greenwichSiderealTime: number, // in degrees (0-360)
  geoLongitude: number,          // geographic longitude
  obliquity: number = 23.44      // ecliptic obliquity
): number {
  // Local Sidereal Time = GST + geographic longitude
  const LST = ((greenwichSiderealTime + geoLongitude) % 360 + 360) % 360;
  const RAMC = toRad(LST);
  const oblRad = toRad(obliquity);

  let mcLong = toDeg(Math.atan2(Math.sin(RAMC), Math.cos(RAMC) * Math.cos(oblRad)));
  mcLong = ((mcLong % 360) + 360) % 360;
  return mcLong;
}

/**
 * Calculate ASC (Ascendant) ecliptic longitude for given geographic coords.
 */
function calculateASCAtLocation(
  greenwichSiderealTime: number,
  geoLongitude: number,
  geoLatitude: number,
  obliquity: number = 23.44
): number {
  const LST = ((greenwichSiderealTime + geoLongitude) % 360 + 360) % 360;
  const RAMC = toRad(LST);
  const oblRad = toRad(obliquity);
  const latRad = toRad(geoLatitude);

  const y = Math.cos(RAMC);
  const x = -(Math.sin(RAMC) * Math.cos(oblRad)) - (Math.tan(latRad) * Math.sin(oblRad));
  let ascLong = toDeg(Math.atan2(y, x));
  ascLong = ((ascLong % 360) + 360) % 360;
  return ascLong;
}

/**
 * Estimate Greenwich Sidereal Time from the SR chart's MC position and location.
 * If MC and location are known, we can reverse-calculate GST.
 */
function estimateGST(mcSign: string, mcDegree: number, mcMinutes: number, geoLongitude: number, obliquity: number = 23.44): number {
  const mcIdx = SIGNS.indexOf(mcSign);
  if (mcIdx < 0) return 0;
  const mcLong = mcIdx * 30 + mcDegree + mcMinutes / 60;

  // MC longitude = atan2(sin(RAMC), cos(RAMC)*cos(obl))
  // So RAMC = atan2(sin(mcLong), cos(mcLong)*cos(obl))
  // Actually this is approximate — MC ≈ RAMC for small obliquity effect
  const oblRad = toRad(obliquity);
  const mcRad = toRad(mcLong);
  let RAMC = toDeg(Math.atan2(Math.sin(mcRad) * Math.cos(oblRad), Math.cos(mcRad)));
  RAMC = ((RAMC % 360) + 360) % 360;

  // LST = RAMC (in degrees), GST = LST - geoLongitude
  const GST = ((RAMC - geoLongitude) % 360 + 360) % 360;
  return GST;
}

// ─── Main Calculator ────────────────────────────────────────────────

export function calculateAstrocartography(
  srChart: SolarReturnChart,
  natalChart: NatalChart
): SRAstrocartography {
  const lines: AstrocartoLine[] = [];
  const cityResults: AstrocartoCity[] = [];

  // Get SR MC for GST estimation
  const srMC = srChart.houseCusps?.house10;
  const locationStr = srChart.solarReturnLocation || srChart.birthLocation || '';

  // Parse current location longitude
  let currentLng = 0;
  let currentLat = 40; // default mid-latitude
  const coordMatch = locationStr.match(/([-]?\d+\.?\d*)\s*,\s*([-]?\d+\.?\d*)/);
  if (coordMatch) {
    currentLat = parseFloat(coordMatch[1]);
    currentLng = parseFloat(coordMatch[2]);
  }

  if (!srMC) {
    return {
      lines: [],
      topCities: [],
      bestBeneficCity: null,
      worstMaleficCity: null,
      currentLocationRating: 5,
      interpretation: 'Astrocartography requires house cusp data (MC) to calculate planetary lines.',
    };
  }

  const GST = estimateGST(srMC.sign, srMC.degree, (srMC as any).minutes || 0, currentLng);

  // For each planet, find the longitude where it hits each angle
  for (const planet of PLANETS_CORE) {
    const pos = srChart.planets[planet as keyof typeof srChart.planets];
    if (!pos) continue;
    const planetDeg = toAbsDeg(pos);
    if (planetDeg === null) continue;

    // MC line: find longitude where MC = planet degree
    // MC at longitude L = f(GST, L). We solve for L.
    // Sweep longitudes in 1° increments and find where MC ≈ planetDeg
    for (let lng = -180; lng < 180; lng += 1) {
      const mc = calculateMCAtLongitude(GST, lng);
      let diffMC = Math.abs(mc - planetDeg);
      if (diffMC > 180) diffMC = 360 - diffMC;
      if (diffMC <= 1.5) {
        lines.push({
          planet,
          lineType: 'MC',
          longitude: lng,
          interpretation: PLANET_LINE_INTERPS[planet]?.MC || `${planet} on the MC at longitude ${lng}°`,
        });
      }

      // IC line (opposite MC)
      const ic = (mc + 180) % 360;
      let diffIC = Math.abs(ic - planetDeg);
      if (diffIC > 180) diffIC = 360 - diffIC;
      if (diffIC <= 1.5) {
        lines.push({
          planet,
          lineType: 'IC',
          longitude: lng,
          interpretation: PLANET_LINE_INTERPS[planet]?.IC || `${planet} on the IC at longitude ${lng}°`,
        });
      }
    }

    // ASC/DSC lines depend on latitude too — calculate for a reference latitude band
    const refLatitudes = [25, 35, 45, 55]; // cover common habitable latitudes
    for (const refLat of refLatitudes) {
      for (let lng = -180; lng < 180; lng += 2) {
        const asc = calculateASCAtLocation(GST, lng, refLat);
        let diffASC = Math.abs(asc - planetDeg);
        if (diffASC > 180) diffASC = 360 - diffASC;
        if (diffASC <= 2) {
          // Only add if we don't already have a nearby ASC line for this planet
          const existing = lines.find(l => l.planet === planet && l.lineType === 'ASC' && Math.abs(l.longitude - lng) < 5);
          if (!existing) {
            lines.push({
              planet,
              lineType: 'ASC',
              longitude: lng,
              interpretation: PLANET_LINE_INTERPS[planet]?.ASC || `${planet} on the ASC at longitude ${lng}°`,
            });
          }
        }

        const dsc = (asc + 180) % 360;
        let diffDSC = Math.abs(dsc - planetDeg);
        if (diffDSC > 180) diffDSC = 360 - diffDSC;
        if (diffDSC <= 2) {
          const existing = lines.find(l => l.planet === planet && l.lineType === 'DSC' && Math.abs(l.longitude - lng) < 5);
          if (!existing) {
            lines.push({
              planet,
              lineType: 'DSC',
              longitude: lng,
              interpretation: PLANET_LINE_INTERPS[planet]?.DSC || `${planet} on the DSC at longitude ${lng}°`,
            });
          }
        }
      }
    }
  }

  // ─── Evaluate Each City ─────────────────────────────────────────────

  for (const cityData of WORLD_CITIES) {
    const mc = calculateMCAtLongitude(GST, cityData.lng);
    const ic = (mc + 180) % 360;
    const asc = calculateASCAtLocation(GST, cityData.lng, cityData.lat);
    const dsc = (asc + 180) % 360;

    const angles: { name: string; deg: number }[] = [
      { name: 'ASC', deg: asc },
      { name: 'MC', deg: mc },
      { name: 'DSC', deg: dsc },
      { name: 'IC', deg: ic },
    ];

    const angularPlanets: { planet: string; angle: string; orb: number }[] = [];
    let totalRating = 0;
    let ratingCount = 0;

    for (const planet of PLANETS_CORE) {
      const pos = srChart.planets[planet as keyof typeof srChart.planets];
      if (!pos) continue;
      const planetDeg = toAbsDeg(pos);
      if (planetDeg === null) continue;

      for (const angle of angles) {
        let diff = Math.abs(planetDeg - angle.deg);
        if (diff > 180) diff = 360 - diff;
        if (diff <= 8) { // 8° orb for angular planets
          angularPlanets.push({ planet, angle: angle.name, orb: Math.round(diff * 10) / 10 });
          const baseRating = PLANET_ANGLE_RATING[planet]?.[angle.name] || 5;
          // Tighter orb = stronger effect
          const orbMultiplier = 1 - (diff / 12);
          totalRating += baseRating * orbMultiplier;
          ratingCount++;
        }
      }
    }

    if (angularPlanets.length === 0) continue;

    const avgRating = ratingCount > 0 ? Math.min(10, Math.round((totalRating / ratingCount) * 10) / 10) : 5;

    // Build summary
    const benefics = angularPlanets.filter(ap => ['Venus', 'Jupiter', 'Sun'].includes(ap.planet));
    const malefics = angularPlanets.filter(ap => ['Saturn', 'Mars', 'Pluto'].includes(ap.planet));
    
    let summary = '';
    if (benefics.length > 0 && malefics.length === 0) {
      summary = `Excellent location — ${benefics.map(b => `${b.planet} on ${b.angle}`).join(', ')}. Benefic energy dominates.`;
    } else if (malefics.length > 0 && benefics.length === 0) {
      summary = `Challenging location — ${malefics.map(m => `${m.planet} on ${m.angle}`).join(', ')}. Expect pressure and tests.`;
    } else if (benefics.length > 0 && malefics.length > 0) {
      summary = `Mixed energy — ${angularPlanets.map(ap => `${ap.planet} on ${ap.angle}`).join(', ')}. Both opportunity and challenge are amplified.`;
    } else {
      summary = `${angularPlanets.map(ap => `${ap.planet} on ${ap.angle}`).join(', ')}. Moderate planetary influence on the angles.`;
    }

    cityResults.push({
      city: cityData.city,
      country: cityData.country,
      latitude: cityData.lat,
      longitude: cityData.lng,
      angularPlanets,
      rating: avgRating,
      summary,
    });
  }

  // Sort by rating
  cityResults.sort((a, b) => b.rating - a.rating);

  // Find best benefic and worst malefic cities
  const bestBeneficCity = cityResults.find(c => 
    c.angularPlanets.some(ap => ['Venus', 'Jupiter'].includes(ap.planet) && ['ASC', 'MC'].includes(ap.angle))
  );
  const worstMaleficCity = [...cityResults].reverse().find(c =>
    c.angularPlanets.some(ap => ['Saturn', 'Mars', 'Pluto'].includes(ap.planet) && ['ASC', 'DSC'].includes(ap.angle))
  );

  // Rate current location
  const currentMC = calculateMCAtLongitude(GST, currentLng);
  const currentASC = calculateASCAtLocation(GST, currentLng, currentLat);
  let currentRating = 5;
  const currentAngular: string[] = [];
  for (const planet of PLANETS_CORE) {
    const pos = srChart.planets[planet as keyof typeof srChart.planets];
    if (!pos) continue;
    const planetDeg = toAbsDeg(pos);
    if (planetDeg === null) continue;
    for (const [name, deg] of [['MC', currentMC], ['ASC', currentASC]] as [string, number][]) {
      let diff = Math.abs(planetDeg - deg);
      if (diff > 180) diff = 360 - diff;
      if (diff <= 8) {
        currentAngular.push(`${planet} on ${name}`);
        const r = PLANET_ANGLE_RATING[planet]?.[name] || 5;
        currentRating = Math.max(currentRating, r);
      }
    }
  }

  const topCities = cityResults.slice(0, 15);

  const interpretation = topCities.length > 0
    ? `Your Solar Return astrocartography shows ${lines.length} planetary lines across the globe. ${bestBeneficCity ? `The most favorable location is ${bestBeneficCity.city}, ${bestBeneficCity.country} (${bestBeneficCity.summary}).` : ''} ${worstMaleficCity ? `Exercise caution around ${worstMaleficCity.city}, ${worstMaleficCity.country} (${worstMaleficCity.summary}).` : ''} ${currentAngular.length > 0 ? `Your current location has ${currentAngular.join(' and ')} angular.` : 'Your current location has no planets tightly angular — a neutral position.'}`
    : 'Astrocartography data could not be calculated for this chart.';

  return {
    lines,
    topCities,
    bestBeneficCity: bestBeneficCity ? `${bestBeneficCity.city}, ${bestBeneficCity.country}` : null,
    worstMaleficCity: worstMaleficCity ? `${worstMaleficCity.city}, ${worstMaleficCity.country}` : null,
    currentLocationRating: currentRating,
    interpretation,
  };
}

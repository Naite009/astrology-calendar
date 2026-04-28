/**
 * Solar Return Astrocartography — Planetary Line Calculator
 * 
 * Calculates where each planet would be angular (conjunct ASC, MC, DSC, IC)
 * at different geographic longitudes for the Solar Return moment.
 * 
 * This enables "where should I travel this year?" analysis by showing
 * which cities put benefics (Venus, Jupiter, Sun) on powerful angles.
 */

import * as Astronomy from 'astronomy-engine';
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

export type AstrocartoIntention = 'overall' | 'love' | 'career' | 'vitality' | 'healing' | 'adventure' | 'creativity';

export const INTENTION_LABELS: Record<AstrocartoIntention, string> = {
  overall: 'Overall',
  love: 'Love & Romance',
  career: 'Career & Success',
  vitality: 'Vitality & Confidence',
  healing: 'Healing & Rest',
  adventure: 'Adventure & Growth',
  creativity: 'Creativity & Inspiration',
};

export const INTENTION_EMOJIS: Record<AstrocartoIntention, string> = {
  overall: '🌐',
  love: '💕',
  career: '🏆',
  vitality: '🔥',
  healing: '🌿',
  adventure: '✈️',
  creativity: '🎨',
};

// Planet weights per intention (0 = irrelevant, 1 = normal, 2 = high, 3 = primary driver)
const INTENTION_PLANET_WEIGHTS: Record<AstrocartoIntention, Record<string, number>> = {
  overall:    { Sun: 1, Moon: 1, Mercury: 1, Venus: 1, Mars: 1, Jupiter: 1, Saturn: 1, Uranus: 1, Neptune: 1, Pluto: 1 },
  love:       { Sun: 0.5, Moon: 2, Mercury: 0.3, Venus: 3, Mars: 2, Jupiter: 1, Saturn: 0.2, Uranus: 0.5, Neptune: 1.5, Pluto: 0.5 },
  career:     { Sun: 3, Moon: 0.3, Mercury: 1.5, Venus: 0.5, Mars: 1.5, Jupiter: 3, Saturn: 2, Uranus: 0.5, Neptune: 0.2, Pluto: 1 },
  vitality:   { Sun: 3, Moon: 1, Mercury: 0.5, Venus: 1, Mars: 3, Jupiter: 2, Saturn: 0.3, Uranus: 1, Neptune: 0.3, Pluto: 0.5 },
  healing:    { Sun: 0.5, Moon: 3, Mercury: 0.5, Venus: 2, Mars: 0.2, Jupiter: 1.5, Saturn: 0.5, Uranus: 0.3, Neptune: 3, Pluto: 1.5 },
  adventure:  { Sun: 1, Moon: 0.5, Mercury: 1, Venus: 0.5, Mars: 2.5, Jupiter: 3, Saturn: 0.2, Uranus: 2.5, Neptune: 0.5, Pluto: 0.5 },
  creativity: { Sun: 1, Moon: 2, Mercury: 1.5, Venus: 3, Mars: 0.5, Jupiter: 1.5, Saturn: 0.3, Uranus: 2, Neptune: 3, Pluto: 0.5 },
};

// Angle preference per intention (some intentions favor ASC/DSC, others MC)
const INTENTION_ANGLE_BONUS: Record<AstrocartoIntention, Record<string, number>> = {
  overall:    { ASC: 1, MC: 1, DSC: 1, IC: 1 },
  love:       { ASC: 1.3, MC: 0.6, DSC: 1.5, IC: 1.2 },
  career:     { ASC: 1, MC: 1.5, DSC: 0.5, IC: 0.5 },
  vitality:   { ASC: 1.5, MC: 1.2, DSC: 0.6, IC: 0.5 },
  healing:    { ASC: 0.8, MC: 0.5, DSC: 0.8, IC: 1.5 },
  adventure:  { ASC: 1.3, MC: 1, DSC: 1, IC: 0.6 },
  creativity: { ASC: 1.2, MC: 1.3, DSC: 0.8, IC: 1 },
};

export interface AstrocartoLine {
  planet: string;
  lineType: 'ASC' | 'MC' | 'DSC' | 'IC';
  longitude: number;
  interpretation: string;
}

export interface AstrocartoCity {
  city: string;
  country: string;
  state?: string;       // US state abbreviation (e.g. "NC", "PA")
  latitude: number;
  longitude: number;
  angularPlanets: { planet: string; angle: string; orb: number }[];
  rating: number;       // 0-10 overall desirability
  intentionRatings: Record<AstrocartoIntention, number>; // per-intention 0-10
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

interface CityData { city: string; country: string; state?: string; lat: number; lng: number; }

const WORLD_CITIES: CityData[] = [
  // ── USA (comprehensive) ──
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
  { city: 'Sedona', country: 'USA', state: 'AZ', lat: 34.87, lng: -111.76 },
  { city: 'Indianapolis', country: 'USA', state: 'IN', lat: 39.77, lng: -86.16 },
  { city: 'Ann Arbor', country: 'USA', state: 'MI', lat: 42.28, lng: -83.74 },
  { city: 'Detroit', country: 'USA', state: 'MI', lat: 42.33, lng: -83.05 },
  { city: 'Portland', country: 'USA', state: 'OR', lat: 45.52, lng: -122.68 },
  { city: 'Phoenix', country: 'USA', state: 'AZ', lat: 33.45, lng: -112.07 },
  { city: 'Atlanta', country: 'USA', state: 'GA', lat: 33.75, lng: -84.39 },
  { city: 'Boston', country: 'USA', state: 'MA', lat: 42.36, lng: -71.06 },
  { city: 'Dallas', country: 'USA', state: 'TX', lat: 32.78, lng: -96.80 },
  { city: 'Houston', country: 'USA', state: 'TX', lat: 29.76, lng: -95.37 },
  { city: 'New Orleans', country: 'USA', state: 'LA', lat: 29.95, lng: -90.07 },
  { city: 'Las Vegas', country: 'USA', state: 'NV', lat: 36.17, lng: -115.14 },
  { city: 'San Diego', country: 'USA', state: 'CA', lat: 32.72, lng: -117.16 },
  { city: 'Minneapolis', country: 'USA', state: 'MN', lat: 44.98, lng: -93.27 },
  { city: 'Charlotte', country: 'USA', state: 'NC', lat: 35.23, lng: -80.84 },
  { city: 'Salt Lake City', country: 'USA', state: 'UT', lat: 40.76, lng: -111.89 },
  { city: 'Savannah', country: 'USA', state: 'GA', lat: 32.08, lng: -81.09 },
  { city: 'Asheville', country: 'USA', state: 'NC', lat: 35.60, lng: -82.55 },
  { city: 'Maui', country: 'USA', state: 'HI', lat: 20.80, lng: -156.32 },
  { city: 'Anchorage', country: 'USA', state: 'AK', lat: 61.22, lng: -149.90 },
  { city: 'Philadelphia', country: 'USA', state: 'PA', lat: 39.95, lng: -75.17 },
  { city: 'Portland ME', country: 'USA', state: 'ME', lat: 43.66, lng: -70.26 },
  { city: 'Washington DC', country: 'USA', state: 'DC', lat: 38.91, lng: -77.04 },
  { city: 'Richmond', country: 'USA', state: 'VA', lat: 37.54, lng: -77.43 },
  { city: 'Pittsburgh', country: 'USA', state: 'PA', lat: 40.44, lng: -79.99 },
  { city: 'Cleveland', country: 'USA', state: 'OH', lat: 41.50, lng: -81.69 },
  { city: 'Columbus', country: 'USA', state: 'OH', lat: 39.96, lng: -82.99 },
  { city: 'Cincinnati', country: 'USA', state: 'OH', lat: 39.10, lng: -84.51 },
  { city: 'St. Louis', country: 'USA', state: 'MO', lat: 38.63, lng: -90.20 },
  { city: 'Kansas City', country: 'USA', state: 'MO', lat: 39.10, lng: -94.58 },
  { city: 'Raleigh', country: 'USA', state: 'NC', lat: 35.78, lng: -78.64 },
  { city: 'Tampa', country: 'USA', state: 'FL', lat: 27.95, lng: -82.46 },
  { city: 'Orlando', country: 'USA', state: 'FL', lat: 28.54, lng: -81.38 },
  { city: 'Jacksonville', country: 'USA', state: 'FL', lat: 30.33, lng: -81.66 },
  { city: 'Charleston', country: 'USA', state: 'SC', lat: 32.78, lng: -79.93 },
  { city: 'Memphis', country: 'USA', state: 'TN', lat: 35.15, lng: -90.05 },
  { city: 'Albuquerque', country: 'USA', state: 'NM', lat: 35.08, lng: -106.65 },
  { city: 'Tucson', country: 'USA', state: 'AZ', lat: 32.22, lng: -110.97 },
  { city: 'Milwaukee', country: 'USA', state: 'WI', lat: 43.04, lng: -87.91 },
  { city: 'Boise', country: 'USA', state: 'ID', lat: 43.62, lng: -116.21 },
  { city: 'Burlington VT', country: 'USA', state: 'VT', lat: 44.48, lng: -73.21 },
  { city: 'Santa Fe', country: 'USA', state: 'NM', lat: 35.69, lng: -105.94 },
  { city: 'San Antonio', country: 'USA', state: 'TX', lat: 29.42, lng: -98.49 },
  { city: 'Bloomington', country: 'USA', state: 'IN', lat: 39.17, lng: -86.53 },
  { city: 'Boulder', country: 'USA', state: 'CO', lat: 40.01, lng: -105.27 },
  // ── Canada ──
  { city: 'Toronto', country: 'Canada', lat: 43.65, lng: -79.38 },
  { city: 'Vancouver', country: 'Canada', lat: 49.28, lng: -123.12 },
  { city: 'Montreal', country: 'Canada', lat: 45.50, lng: -73.57 },
  // ── International — Major Destinations ──
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
  { city: 'Cancún', country: 'Mexico', lat: 21.16, lng: -86.85 },
  { city: 'Tulum', country: 'Mexico', lat: 20.21, lng: -87.46 },
  // ── Additional Travel Destinations ──
  { city: 'Edinburgh', country: 'UK', lat: 55.95, lng: -3.19 },
  { city: 'Dublin', country: 'Ireland', lat: 53.35, lng: -6.26 },
  { city: 'Florence', country: 'Italy', lat: 43.77, lng: 11.25 },
  { city: 'Amalfi', country: 'Italy', lat: 40.63, lng: 14.60 },
  { city: 'Santorini', country: 'Greece', lat: 36.39, lng: 25.46 },
  { city: 'Prague', country: 'Czech Republic', lat: 50.08, lng: 14.44 },
  { city: 'Vienna', country: 'Austria', lat: 48.21, lng: 16.37 },
  { city: 'Copenhagen', country: 'Denmark', lat: 55.68, lng: 12.57 },
  { city: 'Stockholm', country: 'Sweden', lat: 59.33, lng: 18.07 },
  { city: 'Zurich', country: 'Switzerland', lat: 47.38, lng: 8.54 },
  { city: 'Nice', country: 'France', lat: 43.71, lng: 7.26 },
  { city: 'Seville', country: 'Spain', lat: 37.39, lng: -5.98 },
  { city: 'Dubrovnik', country: 'Croatia', lat: 42.65, lng: 18.09 },
  { city: 'Mykonos', country: 'Greece', lat: 37.45, lng: 25.33 },
  { city: 'Cartagena', country: 'Colombia', lat: 10.39, lng: -75.51 },
  { city: 'Medellín', country: 'Colombia', lat: 6.25, lng: -75.56 },
  { city: 'Lima', country: 'Peru', lat: -12.05, lng: -77.04 },
  { city: 'Cusco', country: 'Peru', lat: -13.52, lng: -71.97 },
  { city: 'Rio de Janeiro', country: 'Brazil', lat: -22.91, lng: -43.17 },
  { city: 'Playa del Carmen', country: 'Mexico', lat: 20.63, lng: -87.08 },
  { city: 'San Juan', country: 'Puerto Rico', lat: 18.47, lng: -66.11 },
  { city: 'Phuket', country: 'Thailand', lat: 7.88, lng: 98.39 },
  { city: 'Singapore', country: 'Singapore', lat: 1.35, lng: 103.82 },
  { city: 'Seoul', country: 'South Korea', lat: 37.57, lng: 126.98 },
  { city: 'Kyoto', country: 'Japan', lat: 35.01, lng: 135.77 },
  { city: 'Melbourne', country: 'Australia', lat: -37.81, lng: 144.96 },
  { city: 'Auckland', country: 'New Zealand', lat: -36.85, lng: 174.76 },
  { city: 'Queenstown', country: 'New Zealand', lat: -45.03, lng: 168.66 },
  { city: 'Nairobi', country: 'Kenya', lat: -1.29, lng: 36.82 },
  { city: 'Cairo', country: 'Egypt', lat: 30.04, lng: 31.24 },
  { city: 'Tel Aviv', country: 'Israel', lat: 32.09, lng: 34.78 },
  { city: 'Petra', country: 'Jordan', lat: 30.33, lng: 35.44 },
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

const NEUTRAL_RATING = 5;
const roundRating = (value: number) => Math.round(value * 10) / 10;
const clampRating = (value: number) => Math.min(10, Math.max(0, roundRating(value)));

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
 * Derive Greenwich Sidereal Time from the SR chart's MC position and location.
 *
 * The exact relationship between MC ecliptic longitude (λ) and RAMC is:
 *   tan(RAMC) = tan(λ) * cos(obliquity)
 *   ⟹  RAMC = atan2(sin(λ)*cos(obl), cos(λ))
 *
 * Then LST = RAMC and GST = LST − geoLongitude.
 */
function estimateGST(mcSign: string, mcDegree: number, mcMinutes: number, geoLongitude: number, obliquity: number = 23.44): number {
  const mcIdx = SIGNS.indexOf(mcSign);
  if (mcIdx < 0) return 0;
  const mcLong = mcIdx * 30 + mcDegree + mcMinutes / 60;

  const oblRad = toRad(obliquity);
  const mcRad = toRad(mcLong);
  // Exact formula: RAMC = atan2(sin(MC)*cos(obl), cos(MC))
  let RAMC = toDeg(Math.atan2(Math.sin(mcRad) * Math.cos(oblRad), Math.cos(mcRad)));
  RAMC = ((RAMC % 360) + 360) % 360;

  // LST = RAMC, GST = LST − geoLongitude
  const GST = ((RAMC - geoLongitude) % 360 + 360) % 360;
  return GST;
}

/**
 * Get precise GST from a stored SR datetime string (ISO or "YYYY-MM-DD HH:MM").
 * Returns null if the string cannot be parsed to a valid date.
 */
function gstFromDateTimeString(dtStr: string): number | null {
  if (!dtStr) return null;
  const d = new Date(dtStr);
  if (isNaN(d.getTime())) return null;
  // astronomy-engine SiderealTime returns GAST in hours; convert to degrees
  const gastHours = Astronomy.SiderealTime(d);
  return ((gastHours * 15) % 360 + 360) % 360;
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

  // Fix 2: Use astronomy-engine SiderealTime when SR datetime is stored (precise).
  // Fall back to MC-based estimation when no datetime is available.
  const srDateTime = (srChart as any).solarReturnDateTime as string | undefined;
  const GST = gstFromDateTimeString(srDateTime || '')
    ?? estimateGST(srMC.sign, srMC.degree, (srMC as any).minutes || 0, currentLng);

  const OBLIQUITY = 23.4392911;
  const oblRad = toRad(OBLIQUITY);

  // For each planet, find where it hits each angle
  for (const planet of PLANETS_CORE) {
    const pos = srChart.planets[planet as keyof typeof srChart.planets];
    if (!pos) continue;
    const planetDeg = toAbsDeg(pos);
    if (planetDeg === null) continue;

    // ── Fix 3a: Analytical MC/IC line calculation ──────────────────────
    // Given MC longitude λ, RAMC = atan2(sin(λ)*cos(obl), cos(λ))
    // Then geographic longitude = RAMC − GST (mod 360), normalized to ±180.
    const pRad = toRad(planetDeg);
    const ramc = ((toDeg(Math.atan2(Math.sin(pRad) * Math.cos(oblRad), Math.cos(pRad))) % 360) + 360) % 360;
    const mcLngRaw = ((ramc - GST) % 360 + 360) % 360;
    const mcLng = mcLngRaw > 180 ? mcLngRaw - 360 : mcLngRaw;

    lines.push({
      planet,
      lineType: 'MC',
      longitude: Math.round(mcLng * 10) / 10,
      interpretation: PLANET_LINE_INTERPS[planet]?.MC || `${planet} on the MC at longitude ${mcLng.toFixed(1)}°`,
    });

    // IC is exactly 180° away
    const icLng = mcLng > 0 ? mcLng - 180 : mcLng + 180;
    lines.push({
      planet,
      lineType: 'IC',
      longitude: Math.round(icLng * 10) / 10,
      interpretation: PLANET_LINE_INTERPS[planet]?.IC || `${planet} on the IC at longitude ${icLng.toFixed(1)}°`,
    });

    // ── Fix 1 + 3b: ASC/DSC lines with full-globe latitude coverage ────
    // Cover southern hemisphere, equatorial, northern, and subarctic latitudes.
    // Use 1° longitude steps for precise line placement.
    const refLatitudes = [-58, -48, -38, -28, -18, -8, 2, 12, 22, 32, 42, 52, 62];
    for (const refLat of refLatitudes) {
      for (let lng = -180; lng < 180; lng += 1) {
        const asc = calculateASCAtLocation(GST, lng, refLat, OBLIQUITY);
        let diffASC = Math.abs(asc - planetDeg);
        if (diffASC > 180) diffASC = 360 - diffASC;
        if (diffASC <= 1.0) {
          // Deduplicate: skip if we already have an ASC line within 3° for this planet
          const existing = lines.find(l => l.planet === planet && l.lineType === 'ASC' && Math.abs(l.longitude - lng) < 3);
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
        if (diffDSC <= 1.0) {
          const existing = lines.find(l => l.planet === planet && l.lineType === 'DSC' && Math.abs(l.longitude - lng) < 3);
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

  // ─── Intention Rating Calculator ────────────────────────────────────

  function calculateIntentionRatings(
    angularPlanets: Array<{ planet: string; angle: string }>,
    overallRating: number
  ): Record<string, number> {
    // Scale: 0 = terrible, 5 = neutral, 10 = excellent
    // Malefics score BELOW 5 to genuinely penalize cities where they're angular
    const ANGLE_SCORES: Record<string, Record<string, number>> = {
      Sun:       { ASC: 8, MC: 9, DSC: 6, IC: 5 },
      Moon:      { ASC: 7, MC: 5, DSC: 7, IC: 9 },
      Mercury:   { ASC: 6, MC: 7, DSC: 6, IC: 5 },
      Venus:     { ASC: 9, MC: 8, DSC: 10, IC: 7 },
      Mars:      { ASC: 4, MC: 4, DSC: 1, IC: 2 },
      Jupiter:   { ASC: 9, MC: 10, DSC: 8, IC: 7 },
      Saturn:    { ASC: 2, MC: 3, DSC: 1, IC: 1 },
      Uranus:    { ASC: 4, MC: 4, DSC: 3, IC: 3 },
      Neptune:   { ASC: 5, MC: 3, DSC: 4, IC: 6 },
      Pluto:     { ASC: 3, MC: 3, DSC: 1, IC: 2 },
      Chiron:    { ASC: 5, MC: 4, DSC: 5, IC: 7 },
      NorthNode: { ASC: 7, MC: 7, DSC: 7, IC: 6 },
    };

    const INTENTION_WEIGHTS: Record<string, Record<string, number>> = {
      love:       { Venus: 3.0, Moon: 2.5, Jupiter: 1.5, Mars: 1.2, Neptune: 1.5, Sun: 0.8, Mercury: 0.6, Saturn: 0.4, Uranus: 0.5, Pluto: 0.5, Chiron: 0.6, NorthNode: 0.8 },
      career:     { Jupiter: 3.0, Sun: 3.0, Saturn: 2.0, Mars: 1.8, Mercury: 1.5, Moon: 0.5, Venus: 0.7, Uranus: 1.2, Neptune: 0.3, Pluto: 1.3, Chiron: 0.5, NorthNode: 1.0 },
      vitality:   { Sun: 3.0, Mars: 3.0, Jupiter: 2.0, Moon: 1.0, Mercury: 0.5, Venus: 1.0, Saturn: 0.3, Uranus: 1.0, Neptune: 0.3, Pluto: 0.5, Chiron: 0.4, NorthNode: 0.8 },
      healing:    { Moon: 3.0, Neptune: 3.0, Chiron: 2.5, Venus: 1.5, Jupiter: 1.5, Saturn: 1.0, Sun: 0.8, Mercury: 0.7, Mars: 0.3, Pluto: 1.2, Uranus: 0.5, NorthNode: 1.0 },
      adventure:  { Mars: 3.0, Jupiter: 3.0, Uranus: 2.5, Sun: 1.5, Mercury: 1.0, Moon: 0.5, Venus: 0.6, Saturn: 0.2, Neptune: 0.6, Pluto: 0.8, Chiron: 0.4, NorthNode: 0.9 },
      creativity: { Venus: 2.5, Neptune: 2.5, Mercury: 2.0, Moon: 1.8, Sun: 1.5, Jupiter: 1.2, Mars: 1.0, Uranus: 1.5, Saturn: 0.6, Pluto: 0.8, Chiron: 0.7, NorthNode: 0.8 },
      spiritual:  { Neptune: 3.0, Moon: 2.0, Chiron: 2.0, Jupiter: 1.8, Pluto: 1.5, Saturn: 1.0, Sun: 0.8, Venus: 1.0, Uranus: 1.2, Mercury: 0.6, Mars: 0.4, NorthNode: 1.5 },
      family:     { Moon: 3.0, Venus: 2.0, Jupiter: 1.8, Saturn: 1.5, Sun: 1.2, Chiron: 1.5, Mercury: 0.8, Mars: 0.5, Neptune: 0.8, Pluto: 0.7, Uranus: 0.4, NorthNode: 1.0 },
      wealth:     { Jupiter: 3.0, Sun: 2.0, Venus: 1.8, Saturn: 1.8, Mars: 1.5, Mercury: 1.3, Pluto: 1.2, Moon: 0.7, Neptune: 0.4, Uranus: 1.0, Chiron: 0.5, NorthNode: 1.0 },
    };

    // Per-intention angle multipliers so each intention rewards the right planet+angle combos
    // e.g. career heavily rewards MC (public status), healing rewards IC (rest/home), adventure rewards ASC
    const INTENTION_ANGLE_IMPORTANCE: Record<string, Record<string, number>> = {
      love:       { ASC: 1.2, MC: 0.6, DSC: 1.5, IC: 1.2 },
      career:     { ASC: 0.3, MC: 2.5, DSC: 0.2, IC: 0.1 },
      vitality:   { ASC: 2.2, MC: 0.6, DSC: 0.4, IC: 0.3 },
      healing:    { ASC: 0.7, MC: 0.4, DSC: 0.7, IC: 2.0 },
      adventure:  { ASC: 1.8, MC: 1.0, DSC: 0.8, IC: 0.4 },
      creativity: { ASC: 1.2, MC: 1.3, DSC: 0.8, IC: 1.0 },
      spiritual:  { ASC: 0.8, MC: 0.5, DSC: 0.8, IC: 1.6 },
      family:     { ASC: 0.9, MC: 0.6, DSC: 1.0, IC: 2.0 },
      wealth:     { ASC: 0.9, MC: 1.6, DSC: 0.8, IC: 0.6 },
    };

    const intentions = ['love', 'career', 'vitality', 'healing', 'adventure', 'creativity', 'spiritual', 'family', 'wealth'];

    const ratings: Record<string, number> = { overall: overallRating };

    for (const intention of intentions) {
      const weights = INTENTION_WEIGHTS[intention];
      const angleImportanceMap = INTENTION_ANGLE_IMPORTANCE[intention] ?? { ASC: 1.0, MC: 1.0, DSC: 0.85, IC: 0.75 };

      if (angularPlanets.length === 0) {
        const variance = ({ love: -0.3, career: -0.5, vitality: -0.4, healing: 0.2, adventure: -0.7, creativity: 0.1, spiritual: 0.3, family: 0.1, wealth: -0.4 } as Record<string, number>)[intention] ?? 0;
        ratings[intention] = Math.min(10, Math.max(1, Math.round((overallRating + variance) * 10) / 10));
        continue;
      }

      let scaledSum = 0;

      for (const ap of angularPlanets) {
        const baseScore = ANGLE_SCORES[ap.planet]?.[ap.angle] ?? 5;
        const planetWeight = weights[ap.planet] ?? 0.5;
        const angleImportance = angleImportanceMap[ap.angle] ?? 0.8;
        // Use the full base score scaled by relevance instead of centering on 5,
        // so high-scoring combos (Jupiter on MC for career) can actually reach green
        const relevance = Math.min(planetWeight * angleImportance, 6.0) / 3.0;
        // Weighted interpolation: move from neutral (5) toward baseScore proportional to relevance
        scaledSum += 5 + (baseScore - 5) * Math.min(relevance, 1.8);
      }

      const rawScore = angularPlanets.length > 0 ? scaledSum / angularPlanets.length : overallRating;
      // Do NOT blend with overallRating — a high overall score (e.g. Jupiter line city) would
      // anchor every intention and prevent intention-specific winners from rising.
      ratings[intention] = Math.min(10, Math.max(1, Math.round(rawScore * 10) / 10));
    }

    return ratings;
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
    const BENEFIC_PLANETS = new Set(['Sun', 'Venus', 'Jupiter']);
    const MALEFIC_PLANETS = new Set(['Saturn', 'Mars', 'Pluto']);
    let beneficTotal = 0;
    let beneficCount = 0;
    let maleficTotal = 0;
    let maleficCount = 0;
    let neutralTotal = 0;
    let neutralCount = 0;

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
          // Gentler orb decay: tight orbs (0-2°) keep ~90-100% of score,
          // wider orbs (6-8°) still keep ~60-70%. Previous formula was too aggressive.
          const orbMultiplier = 1 - (diff * diff) / (8 * 8 * 1.5);  // quadratic decay, ~100% at 0°, ~74% at 5°, ~58% at 8°
          const score = baseRating * Math.max(orbMultiplier, 0.4);
          if (BENEFIC_PLANETS.has(planet)) {
            beneficTotal += score;
            beneficCount++;
          } else if (MALEFIC_PLANETS.has(planet)) {
            maleficTotal += score;
            maleficCount++;
          } else {
            neutralTotal += score;
            neutralCount++;
          }
        }
      }
    }

    // Natal planet on SR angle detection (3° orb)
    for (const planet of PLANETS_CORE) {
      const natalPos = natalChart.planets[planet as keyof typeof natalChart.planets];
      if (!natalPos) continue;
      const natalDeg = toAbsDeg(natalPos);
      if (natalDeg === null) continue;
      for (const angleDeg of [asc, mc]) {
        let diff = Math.abs(natalDeg - angleDeg);
        if (diff > 180) diff = 360 - diff;
        if (diff <= 3) {
          if (BENEFIC_PLANETS.has(planet)) {
            beneficTotal += 1.5;
            beneficCount = Math.max(beneficCount, 1); // ensure we have at least 1
          } else if (MALEFIC_PLANETS.has(planet)) {
            maleficTotal -= 1.5; // will reduce finalRating below
            maleficCount = Math.max(maleficCount, 1);
          }
        }
      }
    }

    if (angularPlanets.length === 0) continue;

    const beneficScore = beneficCount > 0 ? beneficTotal / beneficCount : NEUTRAL_RATING;
    const maleficPenalty = maleficCount > 0 ? maleficTotal / maleficCount : NEUTRAL_RATING;
    const neutralScore = neutralCount > 0 ? neutralTotal / neutralCount : NEUTRAL_RATING;

    // Only apply malefic penalty when malefics are actually present
    let finalRating: number;
    if (maleficCount > 0 && beneficCount > 0) {
      // Mixed: benefic score minus malefic drag
      finalRating = beneficScore - (10 - maleficPenalty) * 0.4;
    } else if (maleficCount > 0) {
      // Pure malefic: use malefic score directly (will be low)
      finalRating = maleficPenalty;
    } else {
      // Pure benefic or neutral only: no penalty
      finalRating = beneficScore;
    }
    // Blend in neutral planets if present
    if (neutralCount > 0) {
      const bmCount = beneficCount + maleficCount;
      const totalCount = bmCount + neutralCount;
      if (bmCount > 0) {
        finalRating = finalRating * (bmCount / totalCount) + neutralScore * (neutralCount / totalCount);
      } else {
        finalRating = neutralScore;
      }
    }
    const avgRating = clampRating(finalRating);

    const intentionRatings = calculateIntentionRatings(angularPlanets, avgRating) as Record<AstrocartoIntention, number>;

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
      ...(cityData.state ? { state: cityData.state } : {}),
      latitude: cityData.lat,
      longitude: cityData.lng,
      angularPlanets,
      rating: avgRating,
      intentionRatings,
      summary,
    });
  }

  // Sort by rating
  cityResults.sort((a, b) => b.rating - a.rating);

  // Find best/worst per category from intentionRatings
  const findBestForIntention = (intent: AstrocartoIntention) => {
    const sorted = [...cityResults].sort((a, b) => (b.intentionRatings[intent] ?? 0) - (a.intentionRatings[intent] ?? 0));
    return sorted[0] || null;
  };
  const findWorstForIntention = (intent: AstrocartoIntention) => {
    const sorted = [...cityResults].sort((a, b) => (a.intentionRatings[intent] ?? 10) - (b.intentionRatings[intent] ?? 10));
    return sorted[0] || null;
  };

  // ── Score the current location using the SAME blended pipeline as candidate cities,
  //    so "Best Overall" is directly comparable to "Current location rating". ──
  const currentMC = calculateMCAtLongitude(GST, currentLng);
  const currentASC = calculateASCAtLocation(GST, currentLng, currentLat);
  const currentAngles = [
    { name: 'MC', deg: currentMC },
    { name: 'IC', deg: (currentMC + 180) % 360 },
    { name: 'ASC', deg: currentASC },
    { name: 'DSC', deg: (currentASC + 180) % 360 },
  ];
  const currentAngular: { planet: string; angle: string; orb: number }[] = [];
  const BENEFIC_PLANETS = new Set(['Sun', 'Venus', 'Jupiter']);
  const MALEFIC_PLANETS = new Set(['Saturn', 'Mars', 'Pluto']);
  let cBenT = 0, cBenC = 0, cMalT = 0, cMalC = 0, cNeuT = 0, cNeuC = 0;
  for (const planet of PLANETS_CORE) {
    const pos = srChart.planets[planet as keyof typeof srChart.planets];
    if (!pos) continue;
    const planetDeg = toAbsDeg(pos);
    if (planetDeg === null) continue;
    for (const angle of currentAngles) {
      let diff = Math.abs(planetDeg - angle.deg);
      if (diff > 180) diff = 360 - diff;
      if (diff <= 8) {
        currentAngular.push({ planet, angle: angle.name, orb: Math.round(diff * 10) / 10 });
        const baseRating = PLANET_ANGLE_RATING[planet]?.[angle.name] || 5;
        const orbMultiplier = 1 - (diff * diff) / (8 * 8 * 1.5);
        const score = baseRating * Math.max(orbMultiplier, 0.4);
        if (BENEFIC_PLANETS.has(planet)) { cBenT += score; cBenC++; }
        else if (MALEFIC_PLANETS.has(planet)) { cMalT += score; cMalC++; }
        else { cNeuT += score; cNeuC++; }
      }
    }
  }
  const cBenScore = cBenC > 0 ? cBenT / cBenC : NEUTRAL_RATING;
  const cMalPenalty = cMalC > 0 ? cMalT / cMalC : NEUTRAL_RATING;
  const cNeuScore = cNeuC > 0 ? cNeuT / cNeuC : NEUTRAL_RATING;
  let currentFinal: number;
  if (cMalC > 0 && cBenC > 0) currentFinal = cBenScore - (10 - cMalPenalty) * 0.4;
  else if (cMalC > 0) currentFinal = cMalPenalty;
  else if (cBenC > 0) currentFinal = cBenScore;
  else currentFinal = NEUTRAL_RATING;
  if (cNeuC > 0) {
    const bm = cBenC + cMalC;
    const tot = bm + cNeuC;
    if (bm > 0) currentFinal = currentFinal * (bm / tot) + cNeuScore * (cNeuC / tot);
    else currentFinal = cNeuScore;
  }
  const currentRating = clampRating(currentFinal);

  // ── If current location outscores every evaluated city, IT is the best overall. ──
  const topCity = cityResults[0] || null;
  const currentBeatsAll = topCity ? currentRating >= topCity.rating : true;

  // Build topCities with US city cap: max 12 US cities total across all intentions,
  // to prevent mediocre US cities from flooding every category.
  const SCORED_INTENTIONS: AstrocartoIntention[] = ['overall', 'love', 'career', 'vitality', 'healing', 'adventure', 'creativity'];
  const MAX_US_CITIES = 12;
  const topCitySet = new Set<string>();
  const topCitiesArr: AstrocartoCity[] = [];
  let usCityCount = 0;

  const tryAddCity = (c: AstrocartoCity): boolean => {
    if (topCitySet.has(c.city)) return false;
    if (c.country === 'USA') {
      if (usCityCount >= MAX_US_CITIES) return false;
      usCityCount++;
    }
    topCitySet.add(c.city);
    topCitiesArr.push(c);
    return true;
  };

  // Top 15 by overall rating first
  for (const c of cityResults.slice(0, 30)) {
    tryAddCity(c);
  }
  // Top 5 per specific intention (so the best city per tab is always represented)
  for (const intent of SCORED_INTENTIONS.filter(i => i !== 'overall')) {
    const byIntent = [...cityResults].sort((a, b) => (b.intentionRatings[intent] ?? 0) - (a.intentionRatings[intent] ?? 0));
    for (const c of byIntent.slice(0, 5)) {
      tryAddCity(c);
    }
  }
  const topCities = topCitiesArr;

  // Use the legitimately-best result (current vs candidates) for the headline.
  const bestBeneficLabel = currentBeatsAll
    ? `your current city (rating ${currentRating}/10)`
    : bestBeneficCity ? `${bestBeneficCity.city}, ${bestBeneficCity.country} — ${bestBeneficCity.summary}` : '';

  const interpretation = topCities.length > 0
    ? `Your Solar Return planetary lines reveal the best travel destinations for this year. ${bestBeneficLabel ? `Top pick: ${bestBeneficLabel}` : ''} ${worstMaleficCity ? `Use caution traveling near ${worstMaleficCity.city}, ${worstMaleficCity.country} — ${worstMaleficCity.summary}` : ''} ${currentAngular.length > 0 ? `Your current location has ${currentAngular.map(a => `${a.planet} on ${a.angle}`).join(' and ')} angular.` : 'Your current location has no planets tightly angular — a neutral baseline.'}`
    : 'Astrocartography data could not be calculated for this chart.';

  return {
    lines,
    topCities,
    bestBeneficCity: currentBeatsAll
      ? `Your current city (rating ${currentRating}/10 — higher than any evaluated destination)`
      : bestBeneficCity ? `${bestBeneficCity.city}, ${bestBeneficCity.country}` : null,
    worstMaleficCity: worstMaleficCity ? `${worstMaleficCity.city}, ${worstMaleficCity.country}` : null,
    currentLocationRating: currentRating,
    interpretation,
  };
}

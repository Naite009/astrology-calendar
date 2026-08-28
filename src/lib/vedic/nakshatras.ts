/**
 * The 27 nakshatras (lunar mansions), their padas and ruling planets.
 * Each nakshatra spans 13°20'; each pada spans 3°20'.
 */

export type VedicPlanet =
  | 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu';

export interface NakshatraInfo {
  index: number;          // 1-27
  name: string;
  lord: VedicPlanet;
  symbol: string;
  pada: number;           // 1-4
  degreeInNakshatra: number;
  /** Absolute sidereal longitude used for the lookup */
  longitude: number;
}

export const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
] as const;

/** Vimshottari lord order, repeating three times across the 27 nakshatras. */
export const NAKSHATRA_LORD_CYCLE: VedicPlanet[] = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
];

export const NAKSHATRA_SYMBOLS: Record<string, string> = {
  Ashwini: "horse's head", Bharani: 'yoni, the bearer', Krittika: 'blade and flame',
  Rohini: 'ox cart', Mrigashira: "deer's head", Ardra: 'teardrop',
  Punarvasu: 'quiver of arrows', Pushya: 'cow udder, nourishment', Ashlesha: 'coiled serpent',
  Magha: 'royal throne', 'Purva Phalguni': 'front of a hammock', 'Uttara Phalguni': 'back of a hammock',
  Hasta: 'open hand', Chitra: 'bright jewel', Swati: 'young shoot in wind',
  Vishakha: 'forked branch', Anuradha: 'lotus, the following spark', Jyeshtha: 'earring, the elder',
  Mula: 'tied roots', 'Purva Ashadha': 'winnowing fan', 'Uttara Ashadha': 'elephant tusk',
  Shravana: 'ear, the listener', Dhanishta: 'drum', Shatabhisha: 'empty circle, one hundred healers',
  'Purva Bhadrapada': 'front legs of a funeral cot', 'Uttara Bhadrapada': 'back legs of a funeral cot',
  Revati: 'fish, the safe passage',
};

export const NAKSHATRA_SPAN = 360 / 27;      // 13.3333...
export const PADA_SPAN = NAKSHATRA_SPAN / 4; // 3.3333...

export function getNakshatra(siderealLongitude: number): NakshatraInfo {
  const lon = ((siderealLongitude % 360) + 360) % 360;
  const idx = Math.floor(lon / NAKSHATRA_SPAN);         // 0-26
  const degreeInNakshatra = lon - idx * NAKSHATRA_SPAN;
  const pada = Math.floor(degreeInNakshatra / PADA_SPAN) + 1;
  const name = NAKSHATRA_NAMES[idx];
  return {
    index: idx + 1,
    name,
    lord: NAKSHATRA_LORD_CYCLE[idx % 9],
    symbol: NAKSHATRA_SYMBOLS[name] || '',
    pada,
    degreeInNakshatra,
    longitude: lon,
  };
}

/** Fraction of the nakshatra already traveled (0-1). Seeds the dasha start. */
export function nakshatraElapsedFraction(siderealLongitude: number): number {
  const info = getNakshatra(siderealLongitude);
  return info.degreeInNakshatra / NAKSHATRA_SPAN;
}

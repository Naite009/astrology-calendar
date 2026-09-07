/**
 * Coarse bounding boxes for US states and common countries.
 *
 * They are NOT used to locate anything. They exist so a place that was
 * matched by name can be sanity-checked against the state or country the
 * source text named: a "Franklin" at 35.9N 86.9W cannot be in New Jersey,
 * and a "Paris" at 48.9N 2.3E cannot be in Texas. A hit outside the named
 * region is rejected instead of being silently accepted.
 *
 * Boxes are padded generously; the point is to catch a different state or
 * country, not to adjudicate a border town.
 */

export interface LatLonBox { minLat: number; maxLat: number; minLon: number; maxLon: number }

/** Approximate US state boxes keyed by two-letter code. */
export const US_STATE_BOUNDS: Record<string, LatLonBox> = {
  AL: { minLat: 30.1, maxLat: 35.1, minLon: -88.6, maxLon: -84.8 },
  AK: { minLat: 51.0, maxLat: 71.5, minLon: -180, maxLon: -129.9 },
  AZ: { minLat: 31.2, maxLat: 37.1, minLon: -115.0, maxLon: -108.9 },
  AR: { minLat: 32.9, maxLat: 36.6, minLon: -94.7, maxLon: -89.5 },
  CA: { minLat: 32.4, maxLat: 42.1, minLon: -124.6, maxLon: -114.0 },
  CO: { minLat: 36.9, maxLat: 41.1, minLon: -109.2, maxLon: -101.9 },
  CT: { minLat: 40.9, maxLat: 42.2, minLon: -73.9, maxLon: -71.7 },
  DE: { minLat: 38.3, maxLat: 40.0, minLon: -75.9, maxLon: -74.8 },
  DC: { minLat: 38.7, maxLat: 39.1, minLon: -77.2, maxLon: -76.8 },
  FL: { minLat: 24.3, maxLat: 31.1, minLon: -87.8, maxLon: -79.8 },
  GA: { minLat: 30.2, maxLat: 35.1, minLon: -85.8, maxLon: -80.7 },
  HI: { minLat: 18.8, maxLat: 22.4, minLon: -160.4, maxLon: -154.6 },
  ID: { minLat: 41.9, maxLat: 49.1, minLon: -117.4, maxLon: -110.9 },
  IL: { minLat: 36.9, maxLat: 42.6, minLon: -91.7, maxLon: -87.0 },
  IN: { minLat: 37.7, maxLat: 41.9, minLon: -88.2, maxLon: -84.7 },
  IA: { minLat: 40.3, maxLat: 43.6, minLon: -96.8, maxLon: -90.0 },
  KS: { minLat: 36.9, maxLat: 40.1, minLon: -102.2, maxLon: -94.5 },
  KY: { minLat: 36.4, maxLat: 39.2, minLon: -89.7, maxLon: -81.8 },
  LA: { minLat: 28.8, maxLat: 33.1, minLon: -94.2, maxLon: -88.7 },
  ME: { minLat: 42.9, maxLat: 47.6, minLon: -71.2, maxLon: -66.8 },
  MD: { minLat: 37.8, maxLat: 39.8, minLon: -79.6, maxLon: -74.9 },
  MA: { minLat: 41.1, maxLat: 43.0, minLon: -73.7, maxLon: -69.7 },
  MI: { minLat: 41.6, maxLat: 48.4, minLon: -90.6, maxLon: -82.0 },
  MN: { minLat: 43.4, maxLat: 49.5, minLon: -97.4, maxLon: -89.3 },
  MS: { minLat: 30.0, maxLat: 35.1, minLon: -91.8, maxLon: -87.9 },
  MO: { minLat: 35.9, maxLat: 40.7, minLon: -95.9, maxLon: -88.9 },
  MT: { minLat: 44.2, maxLat: 49.1, minLon: -116.2, maxLon: -103.9 },
  NE: { minLat: 39.9, maxLat: 43.1, minLon: -104.2, maxLon: -95.2 },
  NV: { minLat: 34.9, maxLat: 42.1, minLon: -120.2, maxLon: -113.9 },
  NH: { minLat: 42.6, maxLat: 45.4, minLon: -72.7, maxLon: -70.4 },
  NJ: { minLat: 38.8, maxLat: 41.5, minLon: -75.7, maxLon: -73.7 },
  NM: { minLat: 31.2, maxLat: 37.1, minLon: -109.2, maxLon: -102.9 },
  NY: { minLat: 40.4, maxLat: 45.1, minLon: -79.9, maxLon: -71.7 },
  NC: { minLat: 33.7, maxLat: 36.7, minLon: -84.5, maxLon: -75.3 },
  ND: { minLat: 45.8, maxLat: 49.1, minLon: -104.2, maxLon: -96.4 },
  OH: { minLat: 38.3, maxLat: 42.1, minLon: -85.0, maxLon: -80.4 },
  OK: { minLat: 33.5, maxLat: 37.1, minLon: -103.2, maxLon: -94.3 },
  OR: { minLat: 41.9, maxLat: 46.4, minLon: -124.8, maxLon: -116.3 },
  PA: { minLat: 39.6, maxLat: 42.4, minLon: -80.7, maxLon: -74.5 },
  RI: { minLat: 41.0, maxLat: 42.1, minLon: -72.0, maxLon: -71.0 },
  SC: { minLat: 31.9, maxLat: 35.3, minLon: -83.5, maxLon: -78.4 },
  SD: { minLat: 42.4, maxLat: 46.0, minLon: -104.2, maxLon: -96.3 },
  TN: { minLat: 34.9, maxLat: 36.8, minLon: -90.5, maxLon: -81.5 },
  TX: { minLat: 25.7, maxLat: 36.6, minLon: -106.8, maxLon: -93.4 },
  UT: { minLat: 36.9, maxLat: 42.1, minLon: -114.2, maxLon: -108.9 },
  VT: { minLat: 42.6, maxLat: 45.1, minLon: -73.6, maxLon: -71.3 },
  VA: { minLat: 36.4, maxLat: 39.6, minLon: -83.8, maxLon: -75.1 },
  WA: { minLat: 45.4, maxLat: 49.1, minLon: -125.0, maxLon: -116.8 },
  WV: { minLat: 37.1, maxLat: 40.7, minLon: -82.8, maxLon: -77.6 },
  WI: { minLat: 42.4, maxLat: 47.2, minLon: -93.0, maxLon: -86.6 },
  WY: { minLat: 40.9, maxLat: 45.1, minLon: -111.2, maxLon: -103.9 },
};

/** Approximate country boxes keyed by the lowercase canonical name used by the place parser. */
export const COUNTRY_BOUNDS: Record<string, LatLonBox[]> = {
  'united states': [
    { minLat: 24.3, maxLat: 49.5, minLon: -125.1, maxLon: -66.8 },
    US_STATE_BOUNDS.AK,
    US_STATE_BOUNDS.HI,
  ],
  canada: [{ minLat: 41.6, maxLat: 83.3, minLon: -141.2, maxLon: -52.4 }],
  'united kingdom': [{ minLat: 49.7, maxLat: 61.1, minLon: -8.8, maxLon: 1.9 }],
  ireland: [{ minLat: 51.3, maxLat: 55.6, minLon: -10.8, maxLon: -5.8 }],
  france: [{ minLat: 41.2, maxLat: 51.3, minLon: -5.3, maxLon: 9.7 }],
  germany: [{ minLat: 47.1, maxLat: 55.2, minLon: 5.7, maxLon: 15.2 }],
  spain: [{ minLat: 27.5, maxLat: 43.9, minLon: -18.3, maxLon: 4.5 }],
  italy: [{ minLat: 35.3, maxLat: 47.2, minLon: 6.5, maxLon: 18.7 }],
  portugal: [{ minLat: 32.5, maxLat: 42.3, minLon: -31.4, maxLon: -6.0 }],
  netherlands: [{ minLat: 50.6, maxLat: 53.7, minLon: 3.2, maxLon: 7.4 }],
  belgium: [{ minLat: 49.3, maxLat: 51.7, minLon: 2.4, maxLon: 6.5 }],
  switzerland: [{ minLat: 45.7, maxLat: 48.0, minLon: 5.8, maxLon: 10.6 }],
  austria: [{ minLat: 46.2, maxLat: 49.2, minLon: 9.4, maxLon: 17.3 }],
  sweden: [{ minLat: 55.2, maxLat: 69.2, minLon: 10.8, maxLon: 24.3 }],
  norway: [{ minLat: 57.8, maxLat: 71.3, minLon: 4.4, maxLon: 31.3 }],
  denmark: [{ minLat: 54.4, maxLat: 57.9, minLon: 7.9, maxLon: 15.3 }],
  finland: [{ minLat: 59.6, maxLat: 70.2, minLon: 20.4, maxLon: 31.7 }],
  poland: [{ minLat: 48.9, maxLat: 55.0, minLon: 14.0, maxLon: 24.3 }],
  greece: [{ minLat: 34.7, maxLat: 41.9, minLon: 19.2, maxLon: 29.8 }],
  turkey: [{ minLat: 35.7, maxLat: 42.3, minLon: 25.5, maxLon: 45.0 }],
  israel: [{ minLat: 29.3, maxLat: 33.5, minLon: 34.1, maxLon: 36.0 }],
  russia: [{ minLat: 41.1, maxLat: 82.1, minLon: 19.5, maxLon: 180 }],
  india: [{ minLat: 6.6, maxLat: 35.7, minLon: 68.0, maxLon: 97.6 }],
  china: [{ minLat: 18.0, maxLat: 53.7, minLon: 73.4, maxLon: 135.2 }],
  japan: [{ minLat: 23.9, maxLat: 45.7, minLon: 122.8, maxLon: 146.1 }],
  'south korea': [{ minLat: 33.0, maxLat: 38.8, minLon: 124.4, maxLon: 131.1 }],
  australia: [{ minLat: -43.8, maxLat: -10.0, minLon: 112.8, maxLon: 153.8 }],
  'new zealand': [{ minLat: -47.5, maxLat: -34.2, minLon: 166.3, maxLon: 178.7 }],
  brazil: [{ minLat: -33.9, maxLat: 5.4, minLon: -74.1, maxLon: -34.6 }],
  argentina: [{ minLat: -55.2, maxLat: -21.6, minLon: -73.7, maxLon: -53.5 }],
  mexico: [{ minLat: 14.4, maxLat: 32.9, minLon: -118.6, maxLon: -86.6 }],
  'south africa': [{ minLat: -35.0, maxLat: -22.0, minLon: 16.3, maxLon: 33.0 }],
  egypt: [{ minLat: 21.9, maxLat: 31.8, minLon: 24.6, maxLon: 37.0 }],
  philippines: [{ minLat: 4.5, maxLat: 21.3, minLon: 116.8, maxLon: 126.8 }],
  indonesia: [{ minLat: -11.2, maxLat: 6.2, minLon: 94.9, maxLon: 141.2 }],
  pakistan: [{ minLat: 23.5, maxLat: 37.2, minLon: 60.7, maxLon: 78.0 }],
  nigeria: [{ minLat: 4.1, maxLat: 14.0, minLon: 2.5, maxLon: 14.8 }],
  colombia: [{ minLat: -4.4, maxLat: 13.5, minLon: -81.9, maxLon: -66.7 }],
  chile: [{ minLat: -56.1, maxLat: -17.3, minLon: -109.6, maxLon: -66.3 }],
  peru: [{ minLat: -18.5, maxLat: 0.1, minLon: -81.5, maxLon: -68.5 }],
};

const inBox = (lat: number, lon: number, box: LatLonBox): boolean =>
  lat >= box.minLat && lat <= box.maxLat && lon >= box.minLon && lon <= box.maxLon;

/** True when the point is inside the state box (padded by `margin` degrees). */
export const isInsideUsState = (lat: number, lon: number, stateCode: string, margin = 0.15): boolean => {
  const box = US_STATE_BOUNDS[stateCode.toUpperCase()];
  if (!box) return true; // unknown state: cannot rule anything out
  return inBox(lat, lon, {
    minLat: box.minLat - margin, maxLat: box.maxLat + margin,
    minLon: box.minLon - margin, maxLon: box.maxLon + margin,
  });
};

/**
 * True when the point could be in the named country. Unknown countries return
 * true (no box to check against), so this only ever rejects clear mismatches.
 */
export const isInsideCountry = (lat: number, lon: number, country: string, margin = 0.25): boolean => {
  const boxes = COUNTRY_BOUNDS[country.toLowerCase()];
  if (!boxes) return true;
  return boxes.some(box => inBox(lat, lon, {
    minLat: box.minLat - margin, maxLat: box.maxLat + margin,
    minLon: box.minLon - margin, maxLon: box.maxLon + margin,
  }));
};

/** Great-circle distance in kilometers (haversine). */
export const distanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
};

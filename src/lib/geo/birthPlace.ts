/**
 * Birthplace resolution: a typed place name becomes precise coordinates and
 * an IANA time zone id, with an honest confidence level.
 *
 *   high    exact town or city (geocoder hit, or an exact entry in the offline
 *           city tables). Angles and houses may be calculated.
 *   medium  the zone is trustworthy but the coordinates are only city-level
 *           for a larger metro; still fine for angles (astrology services
 *           use city centers too), flagged in the audit trail.
 *   low     only a state or country was recognized. The zone is a best guess
 *           and the coordinates are a centroid: never calculate angles.
 *
 * Resolution order: stored metadata on the chart, then the local cache, then
 * the Open-Meteo geocoder (GeoNames data, no key, CORS enabled), then the
 * offline tables. The zone always comes from the place, never from the
 * browser and never from a hard-coded offset.
 */

import tzLookup from '@photostructure/tz-lookup';
import { CITY_COORDINATES } from './cityCoordinates';
import { EXTENDED_CITY_COORDINATES } from '../placidusHouses';
import { resolveCity } from '../cityResolver';
import { isValidTimeZone } from '../time/zonedTime';

export type PlaceConfidence = 'high' | 'medium' | 'low';
export type PlaceSource = 'stored' | 'geocoder' | 'offline-city' | 'offline-region' | 'manual';

export interface ResolvedBirthPlace {
  /** What the user typed or the file contained. */
  query: string;
  /** Canonical display name, e.g. "West Hills, California, United States". */
  canonicalName: string;
  latitude: number;
  longitude: number;
  /** IANA zone id, e.g. "America/Los_Angeles". */
  timezone: string;
  source: PlaceSource;
  /** Confidence in the coordinates (drives whether angles are calculated). */
  confidence: PlaceConfidence;
  /** Confidence in the zone id specifically. */
  zoneConfidence: PlaceConfidence;
  countryCode?: string;
  admin1?: string;
  /** Anything the user should know about how this place was resolved. */
  notes: string[];
}

// ── US states: names, codes, centroids, and whether one zone covers the state ──

interface UsState { code: string; name: string; lat: number; lon: number; multiZone?: boolean }

const US_STATES: UsState[] = [
  { code: 'AL', name: 'Alabama', lat: 32.8, lon: -86.8 },
  { code: 'AK', name: 'Alaska', lat: 64.2, lon: -149.5, multiZone: true },
  { code: 'AZ', name: 'Arizona', lat: 34.3, lon: -111.7, multiZone: true },
  { code: 'AR', name: 'Arkansas', lat: 34.9, lon: -92.4 },
  { code: 'CA', name: 'California', lat: 36.8, lon: -119.4 },
  { code: 'CO', name: 'Colorado', lat: 39.0, lon: -105.5 },
  { code: 'CT', name: 'Connecticut', lat: 41.6, lon: -72.7 },
  { code: 'DE', name: 'Delaware', lat: 39.0, lon: -75.5 },
  { code: 'DC', name: 'District of Columbia', lat: 38.9, lon: -77.0 },
  { code: 'FL', name: 'Florida', lat: 28.5, lon: -81.4, multiZone: true },
  { code: 'GA', name: 'Georgia', lat: 32.7, lon: -83.4 },
  { code: 'HI', name: 'Hawaii', lat: 20.8, lon: -156.3 },
  { code: 'ID', name: 'Idaho', lat: 44.1, lon: -114.7, multiZone: true },
  { code: 'IL', name: 'Illinois', lat: 40.0, lon: -89.0 },
  { code: 'IN', name: 'Indiana', lat: 39.9, lon: -86.3, multiZone: true },
  { code: 'IA', name: 'Iowa', lat: 42.0, lon: -93.5 },
  { code: 'KS', name: 'Kansas', lat: 38.5, lon: -98.4, multiZone: true },
  { code: 'KY', name: 'Kentucky', lat: 37.5, lon: -85.3, multiZone: true },
  { code: 'LA', name: 'Louisiana', lat: 31.0, lon: -92.0 },
  { code: 'ME', name: 'Maine', lat: 45.4, lon: -69.2 },
  { code: 'MD', name: 'Maryland', lat: 39.0, lon: -76.8 },
  { code: 'MA', name: 'Massachusetts', lat: 42.3, lon: -71.8 },
  { code: 'MI', name: 'Michigan', lat: 44.3, lon: -85.4, multiZone: true },
  { code: 'MN', name: 'Minnesota', lat: 46.3, lon: -94.3 },
  { code: 'MS', name: 'Mississippi', lat: 32.7, lon: -89.7 },
  { code: 'MO', name: 'Missouri', lat: 38.5, lon: -92.5 },
  { code: 'MT', name: 'Montana', lat: 47.0, lon: -109.6 },
  { code: 'NE', name: 'Nebraska', lat: 41.5, lon: -99.8, multiZone: true },
  { code: 'NV', name: 'Nevada', lat: 39.3, lon: -116.6 },
  { code: 'NH', name: 'New Hampshire', lat: 43.7, lon: -71.6 },
  { code: 'NJ', name: 'New Jersey', lat: 40.2, lon: -74.5 },
  { code: 'NM', name: 'New Mexico', lat: 34.4, lon: -106.1 },
  { code: 'NY', name: 'New York', lat: 42.9, lon: -75.5 },
  { code: 'NC', name: 'North Carolina', lat: 35.6, lon: -79.4 },
  { code: 'ND', name: 'North Dakota', lat: 47.5, lon: -100.5, multiZone: true },
  { code: 'OH', name: 'Ohio', lat: 40.3, lon: -82.8 },
  { code: 'OK', name: 'Oklahoma', lat: 35.6, lon: -97.5 },
  { code: 'OR', name: 'Oregon', lat: 43.9, lon: -120.6, multiZone: true },
  { code: 'PA', name: 'Pennsylvania', lat: 40.9, lon: -77.8 },
  { code: 'RI', name: 'Rhode Island', lat: 41.7, lon: -71.5 },
  { code: 'SC', name: 'South Carolina', lat: 33.9, lon: -80.9 },
  { code: 'SD', name: 'South Dakota', lat: 44.4, lon: -100.2, multiZone: true },
  { code: 'TN', name: 'Tennessee', lat: 35.9, lon: -86.4, multiZone: true },
  { code: 'TX', name: 'Texas', lat: 31.5, lon: -99.3, multiZone: true },
  { code: 'UT', name: 'Utah', lat: 39.3, lon: -111.7 },
  { code: 'VT', name: 'Vermont', lat: 44.1, lon: -72.7 },
  { code: 'VA', name: 'Virginia', lat: 37.5, lon: -78.9 },
  { code: 'WA', name: 'Washington', lat: 47.4, lon: -120.5 },
  { code: 'WV', name: 'West Virginia', lat: 38.6, lon: -80.6 },
  { code: 'WI', name: 'Wisconsin', lat: 44.6, lon: -89.9 },
  { code: 'WY', name: 'Wyoming', lat: 43.0, lon: -107.6 },
];

const STATE_BY_CODE = new Map(US_STATES.map(s => [s.code.toLowerCase(), s]));
const STATE_BY_NAME = new Map(US_STATES.map(s => [s.name.toLowerCase(), s]));

const COUNTRY_ALIASES: Record<string, string> = {
  'usa': 'united states', 'us': 'united states', 'u.s.': 'united states', 'u.s.a.': 'united states',
  'united states of america': 'united states', 'america': 'united states',
  'uk': 'united kingdom', 'u.k.': 'united kingdom', 'great britain': 'united kingdom', 'england': 'united kingdom',
  'scotland': 'united kingdom', 'wales': 'united kingdom', 'northern ireland': 'united kingdom',
  'uae': 'united arab emirates', 'south korea': 'south korea', 'korea': 'south korea',
};

export interface ParsedPlaceQuery {
  city: string;
  /** Lowercased qualifiers after the city: state, province, country. */
  qualifiers: string[];
  state?: UsState;
  country?: string;
}

const clean = (s: string): string =>
  s.toLowerCase().replace(/\(.*?\)/g, ' ').replace(/[.]/g, '').replace(/\s+/g, ' ').trim();

export const parsePlaceQuery = (raw: string): ParsedPlaceQuery => {
  const segments = raw.split(',').map(clean).filter(Boolean);
  if (!segments.length) return { city: '', qualifiers: [] };

  let city = segments[0];
  const qualifiers = segments.slice(1);

  // "Newton NJ" with no comma: peel a trailing state code or name.
  if (!qualifiers.length) {
    const words = city.split(' ');
    const last = words[words.length - 1];
    if (words.length > 1 && STATE_BY_CODE.has(last)) {
      city = words.slice(0, -1).join(' ');
      qualifiers.push(last);
    } else {
      for (const [name] of STATE_BY_NAME) {
        if (words.length > name.split(' ').length && city.endsWith(` ${name}`)) {
          city = city.slice(0, -name.length - 1).trim();
          qualifiers.push(name);
          break;
        }
      }
    }
  }

  let state: UsState | undefined;
  let country: string | undefined;
  // "Arizona, USA" or just "Texas": the first segment is a state, not a town.
  const cityAsState = STATE_BY_NAME.get(city) || (city.length === 2 && qualifiers.length > 0 ? STATE_BY_CODE.get(city) : undefined);
  if (cityAsState && !qualifiers.some(q => STATE_BY_CODE.get(q) || STATE_BY_NAME.get(q))) {
    state = cityAsState;
    city = '';
  }
  for (const q of qualifiers) {
    const st = STATE_BY_CODE.get(q) || STATE_BY_NAME.get(q);
    if (st && !state) state = st;
    const c = COUNTRY_ALIASES[q] || q;
    if (!st && !country && c.length > 2) country = c;
  }
  if (state && !country) country = 'united states';

  return { city, qualifiers, state, country };
};

// ── Zone from coordinates ──────────────────────────────────────────────────

export const timezoneForCoordinates = (lat: number, lon: number): string | null => {
  try {
    const zone = tzLookup(lat, lon);
    return isValidTimeZone(zone) ? zone : null;
  } catch {
    return null;
  }
};

// ── Offline tables ─────────────────────────────────────────────────────────

const OFFLINE_CITIES: Record<string, { lat: number; lon: number; tz?: string }> = {
  ...CITY_COORDINATES,
  ...EXTENDED_CITY_COORDINATES,
};

const offlineCityLookup = (parsed: ParsedPlaceQuery): { key: string; lat: number; lon: number; tz?: string } | null => {
  if (!parsed.city) return null;
  const tries: string[] = [];
  if (parsed.state) tries.push(`${parsed.city}, ${parsed.state.code.toLowerCase()}`);
  tries.push(parsed.city);

  // Canonical spelling from the city resolver ("nyc" -> "New York, NY").
  const canonical = resolveCity(parsed.qualifiers.length ? `${parsed.city}, ${parsed.qualifiers[0]}` : parsed.city);
  if (canonical && canonical.confidence >= 0.85) {
    const canon = canonical.canonical.toLowerCase();
    tries.push(canon);
    tries.push(canon.split(',')[0].trim());
  }

  for (const key of tries) {
    const hit = OFFLINE_CITIES[key];
    if (hit) return { key, ...hit };
  }
  return null;
};

export const resolveBirthPlaceOffline = (raw: string): ResolvedBirthPlace | null => {
  const query = (raw || '').trim();
  if (!query) return null;
  const parsed = parsePlaceQuery(query);

  const city = offlineCityLookup(parsed);
  if (city) {
    const zone = city.tz && isValidTimeZone(city.tz) ? city.tz : timezoneForCoordinates(city.lat, city.lon);
    if (zone) {
      return {
        query,
        canonicalName: titleCase(city.key) + (parsed.state && !city.key.includes(',') ? `, ${parsed.state.code}` : ''),
        latitude: city.lat,
        longitude: city.lon,
        timezone: zone,
        source: 'offline-city',
        confidence: 'high',
        zoneConfidence: 'high',
        notes: ['Coordinates are the city center from the built-in table.'],
      };
    }
  }

  if (parsed.state) {
    const zone = timezoneForCoordinates(parsed.state.lat, parsed.state.lon);
    if (zone) {
      return {
        query,
        canonicalName: `${parsed.state.name}, United States (state center)`,
        latitude: parsed.state.lat,
        longitude: parsed.state.lon,
        timezone: zone,
        source: 'offline-region',
        confidence: 'low',
        zoneConfidence: parsed.state.multiZone ? 'low' : 'medium',
        countryCode: 'US',
        admin1: parsed.state.name,
        notes: [
          `"${titleCase(parsed.city)}" is not in the built-in city table, so only the state was recognized.`,
          parsed.state.multiZone
            ? `${parsed.state.name} spans more than one time zone; the zone shown is for the state center and must be confirmed.`
            : 'The zone is right for the whole state, but the coordinates are a state center, so angles and houses are not calculated.',
        ],
      };
    }
  }

  return null;
};

// ── Online geocoder (Open-Meteo / GeoNames) ────────────────────────────────

interface GeocodeHit {
  name: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  feature_code?: string;
  country_code?: string;
  country?: string;
  admin1?: string;
  admin2?: string;
  population?: number;
}

const CACHE_KEY = 'birthplace-cache-v1';
const memoryCache = new Map<string, ResolvedBirthPlace>();
const pending = new Map<string, Promise<ResolvedBirthPlace | null>>();

const cacheKeyFor = (q: string) => clean(q).replace(/,/g, ' ').replace(/\s+/g, ' ');

const readCache = (): Record<string, ResolvedBirthPlace> => {
  try {
    if (typeof localStorage === 'undefined') return {};
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, ResolvedBirthPlace>) : {};
  } catch {
    return {};
  }
};

const writeCache = (key: string, place: ResolvedBirthPlace) => {
  memoryCache.set(key, place);
  try {
    if (typeof localStorage === 'undefined') return;
    const all = readCache();
    all[key] = place;
    const keys = Object.keys(all);
    if (keys.length > 400) for (const k of keys.slice(0, keys.length - 400)) delete all[k];
    localStorage.setItem(CACHE_KEY, JSON.stringify(all));
  } catch {
    /* quota or private mode: memory cache still works */
  }
};

const cachedPlace = (key: string): ResolvedBirthPlace | null => {
  const m = memoryCache.get(key);
  if (m) return m;
  const disk = readCache()[key];
  if (disk && isValidTimeZone(disk.timezone)) {
    memoryCache.set(key, disk);
    return disk;
  }
  return null;
};

const scoreHit = (hit: GeocodeHit, parsed: ParsedPlaceQuery): number => {
  let score = 0;
  const admin1 = (hit.admin1 || '').toLowerCase();
  const country = (hit.country || '').toLowerCase();
  const code = (hit.country_code || '').toLowerCase();

  if (parsed.state) {
    if (admin1 === parsed.state.name.toLowerCase() && code === 'us') score += 50;
    else score -= 30;
  }
  if (parsed.country) {
    const want = parsed.country;
    if (country === want || (want === 'united states' && code === 'us') || (want === 'united kingdom' && code === 'gb')) score += 30;
    else if (!parsed.state) score -= 15;
  }
  // Any other qualifier that matches admin1/admin2 text (provinces, counties).
  for (const q of parsed.qualifiers) {
    if (q && (admin1 === q || (hit.admin2 || '').toLowerCase() === q)) score += 10;
  }
  if (clean(hit.name) === parsed.city) score += 10;
  if (/^PPL/.test(hit.feature_code || '')) score += 8;
  if (hit.feature_code === 'PPLC' || hit.feature_code === 'PPLA') score += 3;
  score += Math.min(6, Math.log10((hit.population || 0) + 1));
  return score;
};

const geocode = async (raw: string, parsed: ParsedPlaceQuery, signal?: AbortSignal): Promise<ResolvedBirthPlace | null> => {
  if (typeof fetch === 'undefined' || !parsed.city) return null;
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(parsed.city)}&count=10&language=en&format=json`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Geocoder returned ${res.status}`);
  const json = (await res.json()) as { results?: GeocodeHit[] };
  const hits = (json.results || []).filter(h => Number.isFinite(h.latitude) && Number.isFinite(h.longitude));
  if (!hits.length) return null;

  const ranked = hits
    .map(h => ({ h, s: scoreHit(h, parsed) }))
    .sort((a, b) => b.s - a.s);
  const best = ranked[0];
  // A state or country was named and the best hit does not match it: treat as unresolved.
  if ((parsed.state || parsed.country) && best.s < 0) return null;

  const hit = best.h;
  const notes: string[] = [];
  const fromCoords = timezoneForCoordinates(hit.latitude, hit.longitude);
  let timezone = hit.timezone && isValidTimeZone(hit.timezone) ? hit.timezone : fromCoords;
  if (!timezone) return null;
  if (fromCoords && hit.timezone && fromCoords !== hit.timezone) {
    notes.push(`Zone from the place record is ${hit.timezone}; the boundary map says ${fromCoords}. Using the place record.`);
    timezone = hit.timezone;
  }
  if (ranked.length > 1 && ranked[1].s > best.s - 5 && !parsed.state && !parsed.country) {
    notes.push(`Several places share this name (for example ${ranked[1].h.name}, ${ranked[1].h.admin1 || ranked[1].h.country}). Add the state or country to be sure.`);
  }

  const nameParts = [hit.name, hit.admin1, hit.country].filter(Boolean);
  return {
    query: raw,
    canonicalName: nameParts.join(', '),
    latitude: hit.latitude,
    longitude: hit.longitude,
    timezone,
    source: 'geocoder',
    confidence: notes.some(n => n.startsWith('Several')) ? 'medium' : 'high',
    zoneConfidence: 'high',
    countryCode: hit.country_code,
    admin1: hit.admin1,
    notes,
  };
};

export interface ResolvePlaceOptions {
  /** Allow the online geocoder (default true). */
  network?: boolean;
  signal?: AbortSignal;
}

/**
 * Resolve a place name to coordinates and a zone. Returns null when nothing
 * at all could be recognized; callers must then block angle calculations.
 */
export const resolveBirthPlace = async (
  raw: string,
  options: ResolvePlaceOptions = {},
): Promise<ResolvedBirthPlace | null> => {
  const query = (raw || '').trim();
  if (!query) return null;
  const key = cacheKeyFor(query);

  const cached = cachedPlace(key);
  if (cached) return { ...cached, query };

  const offline = resolveBirthPlaceOffline(query);
  if (options.network === false) return offline;

  // Exact offline city hits are already precise; only ask the network for
  // places the tables do not know or only know at state level.
  if (offline && offline.confidence === 'high') {
    writeCache(key, offline);
    return offline;
  }

  const inflight = pending.get(key);
  if (inflight) return inflight;

  const parsed = parsePlaceQuery(query);
  const task = (async () => {
    try {
      const hit = await geocode(query, parsed, options.signal);
      if (hit) {
        writeCache(key, hit);
        return hit;
      }
    } catch {
      /* offline or blocked: fall back below */
    }
    return offline;
  })().finally(() => pending.delete(key));

  pending.set(key, task);
  return task;
};

/** Build a place record from coordinates the user or a file supplied directly. */
export const placeFromCoordinates = (
  query: string,
  latitude: number,
  longitude: number,
  timezone?: string | null,
  source: PlaceSource = 'manual',
): ResolvedBirthPlace | null => {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  const zone = timezone && isValidTimeZone(timezone) ? timezone : timezoneForCoordinates(latitude, longitude);
  if (!zone) return null;
  return {
    query,
    canonicalName: query || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    latitude,
    longitude,
    timezone: zone,
    source,
    confidence: 'high',
    zoneConfidence: 'high',
    notes: [],
  };
};

export const formatCoordinates = (lat: number, lon: number): string => {
  const f = (v: number, pos: string, neg: string) => {
    const a = Math.abs(v);
    const d = Math.floor(a);
    const m = Math.round((a - d) * 60);
    return `${d}°${String(m).padStart(2, '0')}'${v >= 0 ? pos : neg}`;
  };
  return `${f(lat, 'N', 'S')} ${f(lon, 'E', 'W')}`;
};

const titleCase = (s: string): string =>
  s.replace(/\b([a-z])/g, c => c.toUpperCase()).replace(/, ([a-z]{2})$/i, (_, code: string) => `, ${code.toUpperCase()}`);

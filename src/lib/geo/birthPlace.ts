/**
 * Birthplace resolution: a typed or imported place becomes precise coordinates
 * and an IANA time zone id, with an honest confidence level.
 *
 *   high    exact town or city (geocoder hit, printed source coordinates, or an
 *           exact entry in the offline tables). Angles and houses may be calculated.
 *   medium  the zone is trustworthy but the match could not be double-checked
 *           (offline, no geocoder); still fine for angles, flagged in the audit.
 *   low     only a state or country was recognized, or the name is AMBIGUOUS.
 *           Never calculate angles.
 *
 * Rules that exist because of real failures:
 *
 *   - Every qualifier in the source text counts. "Franklin (Sussex County),
 *     NJ (US)" is a town in Sussex County, New Jersey, and must never collapse
 *     to the biggest "Franklin" in the database (Franklin, Tennessee).
 *   - A name shared by several towns with no state/country to tell them apart
 *     is returned as AMBIGUOUS with the candidates listed. Nothing is chosen
 *     silently; the caller must ask the user.
 *   - A candidate is rejected when it lies outside the state or country the
 *     text named, whichever table it came from.
 *   - Coordinates printed by the source (74w35, 41n07) outrank every lookup.
 *
 * The zone always comes from the place, never from the browser and never from
 * a hard-coded offset.
 */

import tzLookup from '@photostructure/tz-lookup';
import { CITY_COORDINATES } from './cityCoordinates';
import { EXTENDED_CITY_COORDINATES } from '../placidusHouses';
import { resolveCity } from '../cityResolver';
import { isValidTimeZone } from '../time/zonedTime';
import { isInsideUsState, isInsideCountry, distanceKm } from './regionBounds';
import { parseSourceCoordinates, stripCoordinateText, type SourceCoordinates } from './sourcePlace';

export type PlaceConfidence = 'high' | 'medium' | 'low';
export type PlaceSource =
  | 'stored'
  | 'geocoder'
  | 'offline-city'
  | 'offline-region'
  | 'manual'
  /** Coordinates printed in the imported chart; authoritative. */
  | 'source-coordinates'
  /** The user picked this place from a list of same-name candidates. */
  | 'confirmed';

/** One of several places that share the queried name. */
export interface PlaceCandidate {
  name: string;
  /** County / district, when the source knows it. */
  admin2?: string;
  /** State / province. */
  admin1?: string;
  country?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  population?: number;
  /** Ready-made display label, e.g. "Franklin, Sussex County, New Jersey, United States". */
  label: string;
}

export interface ResolvedBirthPlace {
  /** What the user typed or the file contained. */
  query: string;
  /** Canonical display name, e.g. "Franklin, Sussex County, New Jersey, United States". */
  canonicalName: string;
  latitude: number;
  longitude: number;
  /** IANA zone id, e.g. "America/New_York". */
  timezone: string;
  source: PlaceSource;
  /** Confidence in the coordinates (drives whether angles are calculated). */
  confidence: PlaceConfidence;
  /** Confidence in the zone id specifically. */
  zoneConfidence: PlaceConfidence;
  countryCode?: string;
  admin1?: string;
  admin2?: string;
  /**
   * Several places share this name and the text did not say which. The
   * coordinates/zone are those of the first candidate FOR DISPLAY ONLY; no
   * calculation may use them until the user picks one.
   */
  ambiguous?: boolean;
  candidates?: PlaceCandidate[];
  /** For source coordinates: exactly what the file printed. */
  sourceText?: string;
  /** Anything the user should know about how this place was resolved. */
  notes: string[];
}

/** Two places closer than this are the same place for angle purposes. */
export const SAME_PLACE_KM = 20;

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

/** Aliases and ISO codes -> canonical lowercase country name. */
const COUNTRY_ALIASES: Record<string, string> = {
  'usa': 'united states', 'us': 'united states', 'u.s.': 'united states', 'u.s.a.': 'united states', 'u.s': 'united states', 'u.s.a': 'united states',
  'united states of america': 'united states', 'america': 'united states',
  'uk': 'united kingdom', 'u.k.': 'united kingdom', 'gb': 'united kingdom', 'great britain': 'united kingdom', 'england': 'united kingdom',
  'scotland': 'united kingdom', 'wales': 'united kingdom', 'northern ireland': 'united kingdom',
  'uae': 'united arab emirates', 'ae': 'united arab emirates', 'korea': 'south korea', 'kr': 'south korea',
  'ca': 'canada', 'au': 'australia', 'nz': 'new zealand', 'de': 'germany', 'deutschland': 'germany', 'fr': 'france',
  'es': 'spain', 'españa': 'spain', 'it': 'italy', 'italia': 'italy', 'pt': 'portugal', 'nl': 'netherlands', 'holland': 'netherlands',
  'be': 'belgium', 'ch': 'switzerland', 'at': 'austria', 'se': 'sweden', 'no': 'norway', 'dk': 'denmark', 'fi': 'finland',
  'pl': 'poland', 'gr': 'greece', 'tr': 'turkey', 'il': 'israel', 'ru': 'russia', 'in': 'india', 'cn': 'china', 'jp': 'japan',
  'br': 'brazil', 'brasil': 'brazil', 'ar': 'argentina', 'mx': 'mexico', 'méxico': 'mexico', 'za': 'south africa', 'eg': 'egypt',
  'ph': 'philippines', 'id': 'indonesia', 'pk': 'pakistan', 'ng': 'nigeria', 'co': 'colombia', 'cl': 'chile', 'pe': 'peru', 'ie': 'ireland',
};

/** Canadian province / territory codes: make "Toronto, ON, CA" read as Canada. */
const CANADIAN_PROVINCE_CODES = new Set(['on', 'qc', 'bc', 'ab', 'mb', 'sk', 'ns', 'nb', 'nl', 'pe', 'yt', 'nt', 'nu']);

/** Canonical lowercase country name -> ISO-3166 alpha-2 (for geocoder hits). */
const COUNTRY_CODES: Record<string, string> = {
  'united states': 'us', 'united kingdom': 'gb', 'canada': 'ca', 'australia': 'au', 'new zealand': 'nz', 'germany': 'de',
  'france': 'fr', 'spain': 'es', 'italy': 'it', 'portugal': 'pt', 'netherlands': 'nl', 'belgium': 'be', 'switzerland': 'ch',
  'austria': 'at', 'sweden': 'se', 'norway': 'no', 'denmark': 'dk', 'finland': 'fi', 'poland': 'pl', 'greece': 'gr',
  'turkey': 'tr', 'israel': 'il', 'russia': 'ru', 'india': 'in', 'china': 'cn', 'japan': 'jp', 'south korea': 'kr',
  'brazil': 'br', 'argentina': 'ar', 'mexico': 'mx', 'south africa': 'za', 'egypt': 'eg', 'philippines': 'ph',
  'indonesia': 'id', 'pakistan': 'pk', 'nigeria': 'ng', 'colombia': 'co', 'chile': 'cl', 'peru': 'pe', 'ireland': 'ie',
  'united arab emirates': 'ae',
};

export interface ParsedPlaceQuery {
  city: string;
  /** Lowercased qualifiers after the city: state, province, country, county. */
  qualifiers: string[];
  state?: UsState;
  /** County / parish / district named in the text, lowercased, without the word "county". */
  county?: string;
  /** Canonical lowercase country name, when recognized. */
  country?: string;
  countryCode?: string;
  /** Coordinates embedded in the text itself, if any. */
  coordinates?: SourceCoordinates | null;
}

const clean = (s: string): string =>
  s.toLowerCase().replace(/[.]/g, '').replace(/\s+/g, ' ').trim();

const COUNTY_WORDS = /\s+(county|co|parish|borough|district|region|province|prefecture|municipality|kreis|comarca|département|departement|dept)\.?$/i;

/** "Sussex County" -> "sussex"; "City of Franklin" -> "franklin"; "St. Mary Parish" -> "saint mary". */
export const normalizeCounty = (s: string): string =>
  s.toLowerCase()
    .replace(/^(city and county of|city of|county of)\s+/i, '')
    .replace(COUNTY_WORDS, '')
    .replace(/\bst\.?\s/g, 'saint ')
    .replace(/[.]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Town-name equality tolerant of "St." / "Saint", "Mt." / "Mount", "Ft." / "Fort". */
const normalizeTownName = (s: string): string =>
  clean(s)
    .replace(/\bst\b\.?\s/g, 'saint ')
    .replace(/\bmt\b\.?\s/g, 'mount ')
    .replace(/\bft\b\.?\s/g, 'fort ')
    .replace(/[-']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const townNamesEqual = (a: string, b: string): boolean => normalizeTownName(a) === normalizeTownName(b);

const isCountyToken = (token: string): boolean => COUNTY_WORDS.test(token.trim());

/**
 * Parse free text into city + qualifiers. Everything the source printed is
 * kept: parentheticals become qualifiers ("(Sussex County)" -> county,
 * "(US)" -> country), and coordinate tokens are lifted out.
 */
export const parsePlaceQuery = (raw: string): ParsedPlaceQuery => {
  const coordinates = parseSourceCoordinates(raw);
  let text = coordinates ? stripCoordinateText(raw) : (raw || '');

  // Lift parentheticals out as separate qualifiers, in reading order.
  const parenthetical: string[] = [];
  text = text.replace(/\(([^)]*)\)/g, (_, inner: string) => {
    const t = clean(inner);
    if (t) parenthetical.push(t);
    return ' ';
  });

  const segments = text.split(/[,;]/).map(clean).filter(Boolean);
  if (!segments.length && !parenthetical.length) return { city: '', qualifiers: [], coordinates };

  let city = segments[0] || '';
  const rest = [...segments.slice(1), ...parenthetical];

  // "Newton NJ" with no comma: peel a trailing state code or name.
  if (!rest.length && city) {
    const words = city.split(' ');
    const last = words[words.length - 1];
    if (words.length > 1 && STATE_BY_CODE.has(last)) {
      city = words.slice(0, -1).join(' ');
      rest.push(last);
    } else {
      for (const [name] of STATE_BY_NAME) {
        if (words.length > name.split(' ').length && city.endsWith(` ${name}`)) {
          city = city.slice(0, -name.length - 1).trim();
          rest.push(name);
          break;
        }
      }
    }
  }

  let state: UsState | undefined;
  let country: string | undefined;
  let county: string | undefined;
  const qualifiers: string[] = [];

  // Country first: it decides whether two-letter tokens are US states.
  // A bare two-letter token that is BOTH a US state code and a country code
  // ("CA", "IL", "IN", "DE", "CO", "ID", "AR", "NE", "PA", "MT", ...) is not
  // a country by itself: "West Hills, CA" is California, not Canada.
  // It reads as a country only when something else in the text says so:
  // a full country name, a non-state country code, or a Canadian province
  // code next to "CA".
  for (const q of rest) {
    if (STATE_BY_CODE.has(q) && !STATE_BY_NAME.has(q)) continue;
    const c = COUNTRY_ALIASES[q] || (COUNTRY_CODES[q] ? q : undefined);
    if (c && !country) country = c;
  }
  if (!country && rest.includes('ca') && rest.some(q => CANADIAN_PROVINCE_CODES.has(q))) country = 'canada';

  for (const q of rest) {
    if (isCountyToken(q)) {
      if (!county) county = normalizeCounty(q);
      qualifiers.push(q);
      continue;
    }
    const st = STATE_BY_CODE.get(q) || STATE_BY_NAME.get(q);
    const asCountry = COUNTRY_ALIASES[q] || (COUNTY_WORDS.test(q) ? undefined : COUNTRY_CODES[q] ? q : undefined);
    if (st && (!country || country === 'united states' || !asCountry)) {
      // A two-letter token that is BOTH a state and a country code ("ca", "in",
      // "de", "co", "id", "il", "ar", "ne"): country wins only when the text
      // has already named a non-US country and this is that country.
      if (!(asCountry && country && country !== 'united states' && asCountry === country)) {
        if (!state) state = st;
        qualifiers.push(q);
        continue;
      }
    }
    qualifiers.push(q);
  }

  // "Arizona, USA" or just "Texas": the first segment is a state, not a town.
  const cityAsState = STATE_BY_NAME.get(city) || (city.length === 2 && rest.length > 0 ? STATE_BY_CODE.get(city) : undefined);
  if (cityAsState && !state) {
    state = cityAsState;
    city = '';
  }

  if (state && !country) country = 'united states';
  if (state && country && country !== 'united states') {
    // "Paris, ON, Canada": "on" is not a state; but "London, CA, Canada"
    // would wrongly read CA as California. A named foreign country wins.
    state = undefined;
  }
  const countryCode = country ? COUNTRY_CODES[country] : undefined;

  return { city, qualifiers, state, county, country, countryCode, coordinates };
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

// ── Consistency of a place with the text that named it ───────────────────

export interface PlaceTextCheck { consistent: boolean; reason?: string }

/**
 * Does a point (and optional canonical name) agree with the state/country a
 * place string names? Used to reject wrong same-name matches and to detect
 * stale stored coordinates saved by an older, buggier resolver.
 */
export const checkPlaceAgainstText = (
  place: { latitude: number; longitude: number; canonicalName?: string | null },
  text: string | null | undefined,
): PlaceTextCheck => {
  if (!text) return { consistent: true };
  const parsed = parsePlaceQuery(text);
  const name = (place.canonicalName || '').toLowerCase();

  if (parsed.state) {
    if (!isInsideUsState(place.latitude, place.longitude, parsed.state.code)) {
      return { consistent: false, reason: `the coordinates are outside ${parsed.state.name}` };
    }
    // The stored canonical name names a different US state outright.
    for (const st of US_STATES) {
      if (st.code === parsed.state.code) continue;
      if (new RegExp(`\\b${st.name.toLowerCase()}\\b`).test(name) && !new RegExp(`\\b${parsed.state.name.toLowerCase()}\\b`).test(name)) {
        return { consistent: false, reason: `the saved place says ${st.name}, the text says ${parsed.state.name}` };
      }
    }
  } else if (parsed.country) {
    if (!isInsideCountry(place.latitude, place.longitude, parsed.country)) {
      return { consistent: false, reason: `the coordinates are outside ${titleCase(parsed.country)}` };
    }
  }

  // A different town altogether (only when both sides have a plain town name).
  if (parsed.city && name) {
    const storedTown = name.split(',')[0].replace(/\(.*?\)/g, '').trim();
    if (storedTown && !storedTown.includes('state center') && !townNamesEqual(storedTown, parsed.city)
      && !normalizeTownName(storedTown).startsWith(normalizeTownName(parsed.city))
      && !normalizeTownName(parsed.city).startsWith(normalizeTownName(storedTown))) {
      const canon = resolveCity(parsed.city);
      const alias = canon && canon.confidence >= 0.95 ? canon.canonical.split(',')[0].toLowerCase() : null;
      if (!alias || !townNamesEqual(alias, storedTown)) {
        return { consistent: false, reason: `the saved place is "${storedTown}", the text names "${parsed.city}"` };
      }
    }
  }
  return { consistent: true };
};

// ── Offline tables ─────────────────────────────────────────────────────────

const OFFLINE_CITIES: Record<string, { lat: number; lon: number; tz?: string }> = {
  ...CITY_COORDINATES,
  ...EXTENDED_CITY_COORDINATES,
};

/** Town-name part -> every offline key with that town name. */
const OFFLINE_BY_TOWN = new Map<string, string[]>();
for (const key of Object.keys(OFFLINE_CITIES)) {
  const town = normalizeTownName(key.split(',')[0]);
  const list = OFFLINE_BY_TOWN.get(town) || [];
  list.push(key);
  OFFLINE_BY_TOWN.set(town, list);
}

interface OfflineHit { key: string; lat: number; lon: number; tz?: string }

const offlineConsistent = (hit: OfflineHit, parsed: ParsedPlaceQuery): boolean => {
  if (parsed.state) {
    // Keys like "dover, nj" carry their own state: it must be the named one.
    const keyState = hit.key.includes(',') ? hit.key.split(',')[1].trim() : null;
    if (keyState && keyState.length === 2 && keyState !== parsed.state.code.toLowerCase()) return false;
    return isInsideUsState(hit.lat, hit.lon, parsed.state.code);
  }
  if (parsed.country) return isInsideCountry(hit.lat, hit.lon, parsed.country);
  return true;
};

const offlineCityLookup = (parsed: ParsedPlaceQuery): { hit: OfflineHit | null; alternates: OfflineHit[] } => {
  if (!parsed.city) return { hit: null, alternates: [] };
  const tries: string[] = [];
  if (parsed.state) tries.push(`${parsed.city}, ${parsed.state.code.toLowerCase()}`);
  tries.push(parsed.city);

  // Canonical spelling from the city resolver ("nyc" -> "New York, NY"), but
  // only exact alias hits: fuzzy corrections turn "Paris, TX" into Paris, France.
  const canonical = resolveCity(parsed.qualifiers.length ? `${parsed.city}, ${parsed.qualifiers[0]}` : parsed.city);
  if (canonical && canonical.confidence >= 0.999) {
    const canon = canonical.canonical.toLowerCase();
    tries.push(canon);
    tries.push(canon.split(',')[0].trim());
  }

  const town = normalizeTownName(parsed.city);
  const sameTown = (OFFLINE_BY_TOWN.get(town) || []).map(key => ({ key, ...OFFLINE_CITIES[key] }));

  for (const key of tries) {
    const raw = OFFLINE_CITIES[key];
    if (!raw) continue;
    const hit: OfflineHit = { key, ...raw };
    if (!offlineConsistent(hit, parsed)) continue;
    const alternates = sameTown.filter(o => o.key !== key && distanceKm(o.lat, o.lon, hit.lat, hit.lon) > SAME_PLACE_KM && offlineConsistent(o, parsed));
    return { hit, alternates };
  }
  return { hit: null, alternates: [] };
};

const offlineCandidate = (hit: OfflineHit): PlaceCandidate | null => {
  const tz = hit.tz && isValidTimeZone(hit.tz) ? hit.tz : timezoneForCoordinates(hit.lat, hit.lon);
  if (!tz) return null;
  return { name: titleCase(hit.key), latitude: hit.lat, longitude: hit.lon, timezone: tz, label: titleCase(hit.key) };
};

export const resolveBirthPlaceOffline = (raw: string): ResolvedBirthPlace | null => {
  const query = (raw || '').trim();
  if (!query) return null;
  const parsed = parsePlaceQuery(query);

  // Coordinates written into the place text itself win outright.
  if (parsed.coordinates) {
    const p = placeFromSourceCoordinates(query, parsed.coordinates);
    if (p) return p;
  }

  const { hit: city, alternates } = offlineCityLookup(parsed);
  if (city) {
    const zone = city.tz && isValidTimeZone(city.tz) ? city.tz : timezoneForCoordinates(city.lat, city.lon);
    if (zone) {
      const qualified = !!(parsed.state || parsed.country);
      if (!qualified && alternates.length) {
        // Same town name, different places, nothing in the text to choose by.
        const candidates = [city, ...alternates].map(offlineCandidate).filter((c): c is PlaceCandidate => !!c);
        return ambiguousPlace(query, candidates, 'offline-city');
      }
      const notes = ['Coordinates are the city center from the built-in table.'];
      if (!qualified) notes.push(`"${titleCase(parsed.city)}" was matched by name only; add the state or country if this is a different ${titleCase(parsed.city)}.`);
      return {
        query,
        canonicalName: titleCase(city.key) + (parsed.state && !city.key.includes(',') ? `, ${parsed.state.code}` : ''),
        latitude: city.lat,
        longitude: city.lon,
        timezone: zone,
        source: 'offline-city',
        confidence: qualified ? 'high' : 'medium',
        zoneConfidence: 'high',
        countryCode: parsed.countryCode,
        admin1: parsed.state?.name,
        notes,
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
          parsed.city
            ? `"${titleCase(parsed.city)}" is not in the built-in city table for ${parsed.state.name}, so only the state was recognized.`
            : `Only the state (${parsed.state.name}) was given.`,
          parsed.state.multiZone
            ? `${parsed.state.name} spans more than one time zone; the zone shown is for the state center and must be confirmed.`
            : 'The zone is right for the whole state, but the coordinates are a state center, so angles and houses are not calculated.',
        ],
      };
    }
  }

  return null;
};

const ambiguousPlace = (query: string, candidates: PlaceCandidate[], source: PlaceSource): ResolvedBirthPlace => {
  const first = candidates[0];
  const shown = candidates.slice(0, 4).map(c => c.label).join('; ');
  return {
    query,
    canonicalName: `${first.name} (ambiguous: ${candidates.length} places)`,
    latitude: first.latitude,
    longitude: first.longitude,
    timezone: first.timezone,
    source,
    confidence: 'low',
    zoneConfidence: 'low',
    ambiguous: true,
    candidates,
    notes: [
      `${candidates.length} places are named "${first.name}" and the birthplace text does not say which (${shown}${candidates.length > 4 ? '; ...' : ''}). ` +
      'Choose one, or add the state/county and country to the birthplace. Nothing is calculated until then.',
    ],
  };
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
  admin3?: string;
  population?: number;
}

const CACHE_KEY = 'birthplace-cache-v2';
const memoryCache = new Map<string, ResolvedBirthPlace>();
const pending = new Map<string, Promise<ResolvedBirthPlace | null>>();

/** The cache key keeps every qualifier so "franklin, nj" and "franklin, tn" never collide. */
const cacheKeyFor = (q: string) => {
  const p = parsePlaceQuery(q);
  return [p.city, p.county || '', p.state?.code.toLowerCase() || '', p.country || '', ...p.qualifiers.filter(x => x !== p.state?.code.toLowerCase())]
    .join('|');
};

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
  if (place.ambiguous) return; // never freeze an unanswered question
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
  if (disk && isValidTimeZone(disk.timezone) && !disk.ambiguous) {
    memoryCache.set(key, disk);
    return disk;
  }
  return null;
};

/** Tests and the "resolve again" action use this. */
export const clearBirthPlaceCache = (): void => {
  memoryCache.clear();
  pending.clear();
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem('birthplace-cache-v1');
    }
  } catch { /* ignore */ }
};

const hitCountryMatches = (hit: GeocodeHit, country: string): boolean => {
  const name = (hit.country || '').toLowerCase();
  const code = (hit.country_code || '').toLowerCase();
  if (name === country) return true;
  const want = COUNTRY_CODES[country];
  if (want && code === want) return true;
  // GeoNames spells a few countries differently.
  if (country === 'united kingdom' && code === 'gb') return true;
  if (country === 'russia' && name.startsWith('russia')) return true;
  if (country === 'south korea' && (name === 'republic of korea' || name === 'korea, republic of')) return true;
  return false;
};

const hitStateMatches = (hit: GeocodeHit, state: UsState): boolean =>
  (hit.country_code || '').toLowerCase() === 'us' && (hit.admin1 || '').toLowerCase() === state.name.toLowerCase();

const hitCountyMatches = (hit: GeocodeHit, county: string): boolean => {
  const a2 = hit.admin2 ? normalizeCounty(hit.admin2) : '';
  const a3 = hit.admin3 ? normalizeCounty(hit.admin3) : '';
  return !!county && (a2 === county || a3 === county);
};

const candidateLabel = (hit: GeocodeHit): string => {
  const admin2 = hit.admin2 && !/^\d+$/.test(hit.admin2) && hit.admin2 !== hit.name ? hit.admin2 : null;
  const admin2Label = admin2 && (hit.country_code || '').toLowerCase() === 'us' && !/county|parish|borough|city/i.test(admin2) ? `${admin2} County` : admin2;
  return [hit.name, admin2Label, hit.admin1, hit.country].filter(Boolean).join(', ');
};

const hitToCandidate = (hit: GeocodeHit): PlaceCandidate | null => {
  const tz = hit.timezone && isValidTimeZone(hit.timezone) ? hit.timezone : timezoneForCoordinates(hit.latitude, hit.longitude);
  if (!tz) return null;
  return {
    name: hit.name,
    admin2: hit.admin2,
    admin1: hit.admin1,
    country: hit.country,
    countryCode: hit.country_code,
    latitude: hit.latitude,
    longitude: hit.longitude,
    timezone: tz,
    population: hit.population,
    label: candidateLabel(hit),
  };
};

const populationOf = (h: GeocodeHit): number => (typeof h.population === 'number' && h.population > 0 ? h.population : 0);

/** Rank: populated places first, then population. */
const hitRank = (h: GeocodeHit): number => {
  let s = 0;
  if (/^PPL/.test(h.feature_code || '')) s += 100;
  if (h.feature_code === 'PPLC' || h.feature_code === 'PPLA' || h.feature_code === 'PPLA2') s += 10;
  s += Math.min(60, Math.log10(populationOf(h) + 1) * 8);
  return s;
};

/** Group hits that are really one place (within SAME_PLACE_KM of each other). */
const clusterHits = (hits: GeocodeHit[]): GeocodeHit[][] => {
  const sorted = [...hits].sort((a, b) => hitRank(b) - hitRank(a));
  const clusters: GeocodeHit[][] = [];
  for (const h of sorted) {
    const home = clusters.find(c => distanceKm(c[0].latitude, c[0].longitude, h.latitude, h.longitude) <= SAME_PLACE_KM);
    if (home) home.push(h);
    else clusters.push([h]);
  }
  return clusters;
};

type GeocodeOutcome =
  | { kind: 'resolved'; place: ResolvedBirthPlace }
  | { kind: 'ambiguous'; place: ResolvedBirthPlace }
  | { kind: 'none'; reason: string };

/** How many same-name places are offered for the user to choose from. */
const MAX_CANDIDATES = 30;

const geocode = async (raw: string, parsed: ParsedPlaceQuery, signal?: AbortSignal): Promise<GeocodeOutcome> => {
  if (typeof fetch === 'undefined' || !parsed.city) return { kind: 'none', reason: 'No town name to look up.' };
  // count=100: small towns that share a famous name sit far down the list
  // (Franklin, New Jersey is the 16th "Franklin").
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(parsed.city)}&count=100&language=en&format=json`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Geocoder returned ${res.status}`);
  const json = (await res.json()) as { results?: GeocodeHit[] };
  const all = (json.results || []).filter(h => Number.isFinite(h.latitude) && Number.isFinite(h.longitude) && h.name);
  if (!all.length) return { kind: 'none', reason: `No place named "${titleCase(parsed.city)}" was found.` };

  // Exact town-name matches only; the API also returns prefix matches
  // ("Franklin Park", "Franklinton") which are different towns.
  const named = all.filter(h => townNamesEqual(h.name, parsed.city));
  let pool = named.length ? named : all.filter(h => normalizeTownName(h.name).startsWith(normalizeTownName(parsed.city)));
  if (!pool.length) pool = all;
  const fuzzyName = !named.length;

  // Hard filters: every qualifier the text gave must hold.
  if (parsed.state) {
    pool = pool.filter(h => hitStateMatches(h, parsed.state!));
    if (!pool.length) return { kind: 'none', reason: `No place named "${titleCase(parsed.city)}" was found in ${parsed.state.name}.` };
  }
  if (parsed.country) {
    pool = pool.filter(h => hitCountryMatches(h, parsed.country!));
    if (!pool.length) return { kind: 'none', reason: `No place named "${titleCase(parsed.city)}" was found in ${titleCase(parsed.country)}.` };
  }
  // Other qualifiers (provinces, regions) narrow when they match something.
  const otherQualifiers = parsed.qualifiers.filter(q =>
    q !== parsed.state?.code.toLowerCase() && q !== parsed.state?.name.toLowerCase() &&
    !(COUNTRY_ALIASES[q] || COUNTRY_CODES[q]) && !isCountyToken(q) && q.length > 2);
  for (const q of otherQualifiers) {
    const narrowed = pool.filter(h => [h.admin1, h.admin2, h.admin3].some(a => a && clean(a) === q));
    if (narrowed.length) pool = narrowed;
  }
  const notes: string[] = [];
  let countyMatched = false;
  if (parsed.county) {
    const byCounty = pool.filter(h => hitCountyMatches(h, parsed.county!));
    if (byCounty.length) {
      pool = byCounty;
      countyMatched = true;
    } else {
      notes.push(`The county in the text ("${titleCase(parsed.county)}") did not match the place record; the town and state were used.`);
    }
  }

  const clusters = clusterHits(pool);
  const best = clusters[0][0];
  const buildPlace = (hit: GeocodeHit, confidence: PlaceConfidence): ResolvedBirthPlace | null => {
    const cand = hitToCandidate(hit);
    if (!cand) return null;
    const fromCoords = timezoneForCoordinates(hit.latitude, hit.longitude);
    if (fromCoords && cand.timezone !== fromCoords) {
      notes.push(`Zone from the place record is ${cand.timezone}; the boundary map says ${fromCoords}. Using the place record.`);
    }
    if (fuzzyName) notes.push(`No exact match for "${titleCase(parsed.city)}"; the closest name is "${hit.name}".`);
    return {
      query: raw,
      canonicalName: cand.label,
      latitude: hit.latitude,
      longitude: hit.longitude,
      timezone: cand.timezone,
      source: 'geocoder',
      confidence,
      zoneConfidence: 'high',
      countryCode: hit.country_code,
      admin1: hit.admin1,
      admin2: hit.admin2,
      notes,
    };
  };

  if (clusters.length === 1) {
    const place = buildPlace(best, fuzzyName ? 'medium' : 'high');
    return place ? { kind: 'resolved', place } : { kind: 'none', reason: 'No time zone for that place.' };
  }

  // Several distinct places share the name after every qualifier was applied.
  // Nothing is chosen silently, not even for a famous name: "London" alone
  // could be Ontario, and a wrong pick is a wrong chart. The candidates go
  // back to the user, largest first, and the choice is stored as confirmed.
  const qualified = !!(parsed.state || parsed.country);
  if (qualified && !parsed.county && clusters.length > 1 && !countyMatched) {
    // Same name, same state: still ambiguous (New Jersey has two Franklins).
    notes.push('Add the county to tell them apart.');
  }
  const candidates = clusters.slice(0, MAX_CANDIDATES).map(c => hitToCandidate(c[0])).filter((c): c is PlaceCandidate => !!c);
  if (!candidates.length) return { kind: 'none', reason: 'No time zone for that place.' };
  const place = ambiguousPlace(raw, candidates, 'geocoder');
  place.notes.push(...notes);
  return { kind: 'ambiguous', place };
};

export interface ResolvePlaceOptions {
  /** Allow the online geocoder (default true). */
  network?: boolean;
  signal?: AbortSignal;
}

/**
 * Resolve a place name to coordinates and a zone. Returns null when nothing
 * at all could be recognized; callers must then block angle calculations.
 * Returns an `ambiguous` place when the name is shared and unqualified.
 */
export const resolveBirthPlace = async (
  raw: string,
  options: ResolvePlaceOptions = {},
): Promise<ResolvedBirthPlace | null> => {
  const query = (raw || '').trim();
  if (!query) return null;
  const parsed = parsePlaceQuery(query);

  // Coordinates in the text: no lookup at all.
  if (parsed.coordinates) {
    const p = placeFromSourceCoordinates(query, parsed.coordinates);
    if (p) return p;
  }

  const key = cacheKeyFor(query);
  const cached = cachedPlace(key);
  if (cached) return { ...cached, query };

  const offline = resolveBirthPlaceOffline(query);
  if (options.network === false) return offline;

  // A qualified exact offline hit is precise and unambiguous; an unqualified
  // one still needs the network to check for namesakes.
  const qualified = !!(parsed.state || parsed.country);
  if (offline && offline.confidence === 'high' && qualified && !offline.ambiguous) {
    writeCache(key, offline);
    return offline;
  }

  const inflight = pending.get(key);
  if (inflight) return inflight;

  const task = (async (): Promise<ResolvedBirthPlace | null> => {
    try {
      const outcome = await geocode(query, parsed, options.signal);
      if (outcome.kind === 'resolved') {
        writeCache(key, outcome.place);
        return outcome.place;
      }
      if (outcome.kind === 'ambiguous') return outcome.place;
      // Nothing matched with the qualifiers given: fall back to the region,
      // never to a same-name town somewhere else.
      if (offline && !offline.ambiguous) {
        if (offline.source === 'offline-city' && qualified) return offline; // consistent offline entry
        if (offline.source === 'offline-region') return { ...offline, notes: [outcome.reason, ...offline.notes] };
        if (offline.source === 'offline-city') return { ...offline, confidence: 'medium', notes: [outcome.reason, ...offline.notes] };
      }
      return offline;
    } catch {
      // Offline or blocked. An unqualified offline hit cannot be checked for
      // namesakes, so it is only medium confidence.
      if (offline && offline.source === 'offline-city' && !qualified && !offline.ambiguous) {
        return { ...offline, confidence: 'medium', notes: [...offline.notes, 'The online place check was unavailable, so namesakes could not be ruled out.'] };
      }
      return offline;
    }
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

/**
 * Coordinates printed by the source (Astro.com "74w35, 41n07"). These are
 * what the source used, so they are authoritative: the town name is kept for
 * display and cross-checked, never re-geocoded. The zone comes from the
 * coordinates through the tz boundary map.
 */
export const placeFromSourceCoordinates = (
  placeText: string,
  coords: { latitude: number; longitude: number; text?: string },
): ResolvedBirthPlace | null => {
  if (!Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude)) return null;
  if (Math.abs(coords.latitude) > 90 || Math.abs(coords.longitude) > 180) return null;
  const zone = timezoneForCoordinates(coords.latitude, coords.longitude);
  if (!zone) return null;
  const cleanText = stripCoordinateText(placeText || '').trim();
  const parsed = parsePlaceQuery(cleanText);
  const notes = [
    `Coordinates are the ones printed in the source (${coords.text || formatCoordinates(coords.latitude, coords.longitude)}); the town name was not looked up again.`,
  ];
  if (parsed.state && !isInsideUsState(coords.latitude, coords.longitude, parsed.state.code)) {
    notes.push(`Check the source: the printed coordinates fall outside ${parsed.state.name}. The coordinates were used as printed.`);
  } else if (!parsed.state && parsed.country && !isInsideCountry(coords.latitude, coords.longitude, parsed.country)) {
    notes.push(`Check the source: the printed coordinates fall outside ${titleCase(parsed.country)}. The coordinates were used as printed.`);
  }
  return {
    query: placeText,
    canonicalName: cleanText || formatCoordinates(coords.latitude, coords.longitude),
    latitude: coords.latitude,
    longitude: coords.longitude,
    timezone: zone,
    source: 'source-coordinates',
    confidence: 'high',
    zoneConfidence: 'high',
    countryCode: parsed.countryCode?.toUpperCase(),
    admin1: parsed.state?.name,
    admin2: parsed.county ? titleCase(parsed.county) : undefined,
    sourceText: coords.text,
    notes,
  };
};

/** The user picked one of the same-name candidates. */
export const placeFromCandidate = (query: string, candidate: PlaceCandidate): ResolvedBirthPlace => ({
  query,
  canonicalName: candidate.label,
  latitude: candidate.latitude,
  longitude: candidate.longitude,
  timezone: candidate.timezone,
  source: 'confirmed',
  confidence: 'high',
  zoneConfidence: 'high',
  countryCode: candidate.countryCode,
  admin1: candidate.admin1,
  admin2: candidate.admin2,
  notes: [`Chosen by you from the places named ${candidate.name}.`],
});

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

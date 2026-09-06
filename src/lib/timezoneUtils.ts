// Timezone lookup based on location and date.
// Zone identifiers come from the offline place resolver first (coordinates +
// boundary map), then this alias map. All offsets are evaluated at the real
// local birth instant through the shared zone rules in time/zonedTime.

import { localToUtc, zoneOffsetSeconds, zoneAbbreviation, type CivilParts } from './time/zonedTime';
import { resolveBirthPlaceOffline } from './geo/birthPlace';

interface TimezoneResult {
  timezone: string;
  offset: number;
  label: string;
}

// Common location to timezone mappings
const LOCATION_TIMEZONE_MAP: Record<string, { timezone: string; label: string }> = {
  // US Cities
  'new york': { timezone: 'America/New_York', label: 'Eastern' },
  'nyc': { timezone: 'America/New_York', label: 'Eastern' },
  'manhattan': { timezone: 'America/New_York', label: 'Eastern' },
  'brooklyn': { timezone: 'America/New_York', label: 'Eastern' },
  'boston': { timezone: 'America/New_York', label: 'Eastern' },
  'philadelphia': { timezone: 'America/New_York', label: 'Eastern' },
  'miami': { timezone: 'America/New_York', label: 'Eastern' },
  'atlanta': { timezone: 'America/New_York', label: 'Eastern' },
  'washington': { timezone: 'America/New_York', label: 'Eastern' },
  'washington dc': { timezone: 'America/New_York', label: 'Eastern' },
  'dc': { timezone: 'America/New_York', label: 'Eastern' },
  'charlotte': { timezone: 'America/New_York', label: 'Eastern' },
  'detroit': { timezone: 'America/New_York', label: 'Eastern' },
  'orlando': { timezone: 'America/New_York', label: 'Eastern' },
  'tampa': { timezone: 'America/New_York', label: 'Eastern' },
  'cleveland': { timezone: 'America/New_York', label: 'Eastern' },
  'pittsburgh': { timezone: 'America/New_York', label: 'Eastern' },
  'baltimore': { timezone: 'America/New_York', label: 'Eastern' },
  'raleigh': { timezone: 'America/New_York', label: 'Eastern' },
  
  'chicago': { timezone: 'America/Chicago', label: 'Central' },
  'houston': { timezone: 'America/Chicago', label: 'Central' },
  'dallas': { timezone: 'America/Chicago', label: 'Central' },
  'austin': { timezone: 'America/Chicago', label: 'Central' },
  'san antonio': { timezone: 'America/Chicago', label: 'Central' },
  'minneapolis': { timezone: 'America/Chicago', label: 'Central' },
  'st louis': { timezone: 'America/Chicago', label: 'Central' },
  'kansas city': { timezone: 'America/Chicago', label: 'Central' },
  'new orleans': { timezone: 'America/Chicago', label: 'Central' },
  'memphis': { timezone: 'America/Chicago', label: 'Central' },
  'milwaukee': { timezone: 'America/Chicago', label: 'Central' },
  'nashville': { timezone: 'America/Chicago', label: 'Central' },
  'oklahoma city': { timezone: 'America/Chicago', label: 'Central' },
  
  'denver': { timezone: 'America/Denver', label: 'Mountain' },
  'phoenix': { timezone: 'America/Phoenix', label: 'Arizona' },
  'salt lake city': { timezone: 'America/Denver', label: 'Mountain' },
  'albuquerque': { timezone: 'America/Denver', label: 'Mountain' },
  'las vegas': { timezone: 'America/Los_Angeles', label: 'Pacific' },
  'tucson': { timezone: 'America/Phoenix', label: 'Arizona' },
  'colorado springs': { timezone: 'America/Denver', label: 'Mountain' },
  'boise': { timezone: 'America/Boise', label: 'Mountain' },
  
  'los angeles': { timezone: 'America/Los_Angeles', label: 'Pacific' },
  'la': { timezone: 'America/Los_Angeles', label: 'Pacific' },
  'san francisco': { timezone: 'America/Los_Angeles', label: 'Pacific' },
  'sf': { timezone: 'America/Los_Angeles', label: 'Pacific' },
  'san diego': { timezone: 'America/Los_Angeles', label: 'Pacific' },
  'seattle': { timezone: 'America/Los_Angeles', label: 'Pacific' },
  'portland': { timezone: 'America/Los_Angeles', label: 'Pacific' },
  'san jose': { timezone: 'America/Los_Angeles', label: 'Pacific' },
  'sacramento': { timezone: 'America/Los_Angeles', label: 'Pacific' },
  'oakland': { timezone: 'America/Los_Angeles', label: 'Pacific' },
  'fresno': { timezone: 'America/Los_Angeles', label: 'Pacific' },
  'long beach': { timezone: 'America/Los_Angeles', label: 'Pacific' },
  
  'anchorage': { timezone: 'America/Anchorage', label: 'Alaska' },
  'juneau': { timezone: 'America/Juneau', label: 'Alaska' },
  'honolulu': { timezone: 'Pacific/Honolulu', label: 'Hawaii' },
  'hawaii': { timezone: 'Pacific/Honolulu', label: 'Hawaii' },
  
  // US States (fallback for state-only entries)
  'california': { timezone: 'America/Los_Angeles', label: 'Pacific' },
  'texas': { timezone: 'America/Chicago', label: 'Central' },
  'florida': { timezone: 'America/New_York', label: 'Eastern' },
  'new york state': { timezone: 'America/New_York', label: 'Eastern' },
  'illinois': { timezone: 'America/Chicago', label: 'Central' },
  'pennsylvania': { timezone: 'America/New_York', label: 'Eastern' },
  'ohio': { timezone: 'America/New_York', label: 'Eastern' },
  'georgia': { timezone: 'America/New_York', label: 'Eastern' },
  'michigan': { timezone: 'America/New_York', label: 'Eastern' },
  'arizona': { timezone: 'America/Phoenix', label: 'Arizona' },
  'washington state': { timezone: 'America/Los_Angeles', label: 'Pacific' },
  'oregon': { timezone: 'America/Los_Angeles', label: 'Pacific' },
  'colorado': { timezone: 'America/Denver', label: 'Mountain' },
  'nevada': { timezone: 'America/Los_Angeles', label: 'Pacific' },
  
  // Canada
  'toronto': { timezone: 'America/Toronto', label: 'Eastern' },
  'montreal': { timezone: 'America/Montreal', label: 'Eastern' },
  'vancouver': { timezone: 'America/Vancouver', label: 'Pacific' },
  'calgary': { timezone: 'America/Edmonton', label: 'Mountain' },
  'edmonton': { timezone: 'America/Edmonton', label: 'Mountain' },
  'ottawa': { timezone: 'America/Toronto', label: 'Eastern' },
  'winnipeg': { timezone: 'America/Winnipeg', label: 'Central' },
  
  // UK & Ireland
  'london': { timezone: 'Europe/London', label: 'GMT/BST' },
  'manchester': { timezone: 'Europe/London', label: 'GMT/BST' },
  'birmingham': { timezone: 'Europe/London', label: 'GMT/BST' },
  'liverpool': { timezone: 'Europe/London', label: 'GMT/BST' },
  'edinburgh': { timezone: 'Europe/London', label: 'GMT/BST' },
  'glasgow': { timezone: 'Europe/London', label: 'GMT/BST' },
  'dublin': { timezone: 'Europe/Dublin', label: 'GMT/IST' },
  'uk': { timezone: 'Europe/London', label: 'GMT/BST' },
  'england': { timezone: 'Europe/London', label: 'GMT/BST' },
  'scotland': { timezone: 'Europe/London', label: 'GMT/BST' },
  'wales': { timezone: 'Europe/London', label: 'GMT/BST' },
  'ireland': { timezone: 'Europe/Dublin', label: 'GMT/IST' },
  
  // Europe
  'paris': { timezone: 'Europe/Paris', label: 'CET/CEST' },
  'berlin': { timezone: 'Europe/Berlin', label: 'CET/CEST' },
  'rome': { timezone: 'Europe/Rome', label: 'CET/CEST' },
  'madrid': { timezone: 'Europe/Madrid', label: 'CET/CEST' },
  'barcelona': { timezone: 'Europe/Madrid', label: 'CET/CEST' },
  'amsterdam': { timezone: 'Europe/Amsterdam', label: 'CET/CEST' },
  'brussels': { timezone: 'Europe/Brussels', label: 'CET/CEST' },
  'vienna': { timezone: 'Europe/Vienna', label: 'CET/CEST' },
  'zurich': { timezone: 'Europe/Zurich', label: 'CET/CEST' },
  'geneva': { timezone: 'Europe/Zurich', label: 'CET/CEST' },
  'munich': { timezone: 'Europe/Berlin', label: 'CET/CEST' },
  'frankfurt': { timezone: 'Europe/Berlin', label: 'CET/CEST' },
  'milan': { timezone: 'Europe/Rome', label: 'CET/CEST' },
  'prague': { timezone: 'Europe/Prague', label: 'CET/CEST' },
  'warsaw': { timezone: 'Europe/Warsaw', label: 'CET/CEST' },
  'budapest': { timezone: 'Europe/Budapest', label: 'CET/CEST' },
  'copenhagen': { timezone: 'Europe/Copenhagen', label: 'CET/CEST' },
  'stockholm': { timezone: 'Europe/Stockholm', label: 'CET/CEST' },
  'oslo': { timezone: 'Europe/Oslo', label: 'CET/CEST' },
  'helsinki': { timezone: 'Europe/Helsinki', label: 'EET/EEST' },
  'athens': { timezone: 'Europe/Athens', label: 'EET/EEST' },
  'lisbon': { timezone: 'Europe/Lisbon', label: 'WET/WEST' },
  'moscow': { timezone: 'Europe/Moscow', label: 'MSK' },
  'st petersburg': { timezone: 'Europe/Moscow', label: 'MSK' },
  'istanbul': { timezone: 'Europe/Istanbul', label: 'TRT' },
  
  'france': { timezone: 'Europe/Paris', label: 'CET/CEST' },
  'germany': { timezone: 'Europe/Berlin', label: 'CET/CEST' },
  'italy': { timezone: 'Europe/Rome', label: 'CET/CEST' },
  'spain': { timezone: 'Europe/Madrid', label: 'CET/CEST' },
  'netherlands': { timezone: 'Europe/Amsterdam', label: 'CET/CEST' },
  'switzerland': { timezone: 'Europe/Zurich', label: 'CET/CEST' },
  'austria': { timezone: 'Europe/Vienna', label: 'CET/CEST' },
  'belgium': { timezone: 'Europe/Brussels', label: 'CET/CEST' },
  'portugal': { timezone: 'Europe/Lisbon', label: 'WET/WEST' },
  'greece': { timezone: 'Europe/Athens', label: 'EET/EEST' },
  'russia': { timezone: 'Europe/Moscow', label: 'MSK' },
  'turkey': { timezone: 'Europe/Istanbul', label: 'TRT' },
  
  // Asia
  'tokyo': { timezone: 'Asia/Tokyo', label: 'JST' },
  'osaka': { timezone: 'Asia/Tokyo', label: 'JST' },
  'beijing': { timezone: 'Asia/Shanghai', label: 'CST' },
  'shanghai': { timezone: 'Asia/Shanghai', label: 'CST' },
  'hong kong': { timezone: 'Asia/Hong_Kong', label: 'HKT' },
  'singapore': { timezone: 'Asia/Singapore', label: 'SGT' },
  'seoul': { timezone: 'Asia/Seoul', label: 'KST' },
  'mumbai': { timezone: 'Asia/Kolkata', label: 'IST' },
  'delhi': { timezone: 'Asia/Kolkata', label: 'IST' },
  'new delhi': { timezone: 'Asia/Kolkata', label: 'IST' },
  'bangalore': { timezone: 'Asia/Kolkata', label: 'IST' },
  'chennai': { timezone: 'Asia/Kolkata', label: 'IST' },
  'kolkata': { timezone: 'Asia/Kolkata', label: 'IST' },
  'dubai': { timezone: 'Asia/Dubai', label: 'GST' },
  'abu dhabi': { timezone: 'Asia/Dubai', label: 'GST' },
  'bangkok': { timezone: 'Asia/Bangkok', label: 'ICT' },
  'jakarta': { timezone: 'Asia/Jakarta', label: 'WIB' },
  'kuala lumpur': { timezone: 'Asia/Kuala_Lumpur', label: 'MYT' },
  'manila': { timezone: 'Asia/Manila', label: 'PHT' },
  'taipei': { timezone: 'Asia/Taipei', label: 'CST' },
  'tel aviv': { timezone: 'Asia/Jerusalem', label: 'IST' },
  'jerusalem': { timezone: 'Asia/Jerusalem', label: 'IST' },
  
  'japan': { timezone: 'Asia/Tokyo', label: 'JST' },
  'china': { timezone: 'Asia/Shanghai', label: 'CST' },
  'india': { timezone: 'Asia/Kolkata', label: 'IST' },
  'south korea': { timezone: 'Asia/Seoul', label: 'KST' },
  'korea': { timezone: 'Asia/Seoul', label: 'KST' },
  'thailand': { timezone: 'Asia/Bangkok', label: 'ICT' },
  'indonesia': { timezone: 'Asia/Jakarta', label: 'WIB' },
  'malaysia': { timezone: 'Asia/Kuala_Lumpur', label: 'MYT' },
  'philippines': { timezone: 'Asia/Manila', label: 'PHT' },
  'taiwan': { timezone: 'Asia/Taipei', label: 'CST' },
  'israel': { timezone: 'Asia/Jerusalem', label: 'IST' },
  'uae': { timezone: 'Asia/Dubai', label: 'GST' },
  
  // Australia & New Zealand
  'sydney': { timezone: 'Australia/Sydney', label: 'AEST/AEDT' },
  'melbourne': { timezone: 'Australia/Melbourne', label: 'AEST/AEDT' },
  'brisbane': { timezone: 'Australia/Brisbane', label: 'AEST' },
  'perth': { timezone: 'Australia/Perth', label: 'AWST' },
  'adelaide': { timezone: 'Australia/Adelaide', label: 'ACST/ACDT' },
  'auckland': { timezone: 'Pacific/Auckland', label: 'NZST/NZDT' },
  'wellington': { timezone: 'Pacific/Auckland', label: 'NZST/NZDT' },
  
  'australia': { timezone: 'Australia/Sydney', label: 'AEST/AEDT' },
  'new zealand': { timezone: 'Pacific/Auckland', label: 'NZST/NZDT' },
  
  // South America
  'sao paulo': { timezone: 'America/Sao_Paulo', label: 'BRT' },
  'rio de janeiro': { timezone: 'America/Sao_Paulo', label: 'BRT' },
  'buenos aires': { timezone: 'America/Argentina/Buenos_Aires', label: 'ART' },
  'santiago': { timezone: 'America/Santiago', label: 'CLT' },
  'lima': { timezone: 'America/Lima', label: 'PET' },
  'bogota': { timezone: 'America/Bogota', label: 'COT' },
  'caracas': { timezone: 'America/Caracas', label: 'VET' },
  
  'brazil': { timezone: 'America/Sao_Paulo', label: 'BRT' },
  'argentina': { timezone: 'America/Argentina/Buenos_Aires', label: 'ART' },
  'chile': { timezone: 'America/Santiago', label: 'CLT' },
  'peru': { timezone: 'America/Lima', label: 'PET' },
  'colombia': { timezone: 'America/Bogota', label: 'COT' },
  
  // Africa & Middle East
  'cairo': { timezone: 'Africa/Cairo', label: 'EET' },
  'johannesburg': { timezone: 'Africa/Johannesburg', label: 'SAST' },
  'cape town': { timezone: 'Africa/Johannesburg', label: 'SAST' },
  'lagos': { timezone: 'Africa/Lagos', label: 'WAT' },
  'nairobi': { timezone: 'Africa/Nairobi', label: 'EAT' },
  
  'egypt': { timezone: 'Africa/Cairo', label: 'EET' },
  'south africa': { timezone: 'Africa/Johannesburg', label: 'SAST' },
  'nigeria': { timezone: 'Africa/Lagos', label: 'WAT' },
  'kenya': { timezone: 'Africa/Nairobi', label: 'EAT' },
  
  // Mexico & Central America
  'mexico city': { timezone: 'America/Mexico_City', label: 'CST' },
  'guadalajara': { timezone: 'America/Mexico_City', label: 'CST' },
  'monterrey': { timezone: 'America/Monterrey', label: 'CST' },
  'tijuana': { timezone: 'America/Tijuana', label: 'PST' },
  'cancun': { timezone: 'America/Cancun', label: 'EST' },
  
  'mexico': { timezone: 'America/Mexico_City', label: 'CST' },
};

/**
 * Offset in hours for a zone at a UTC instant, from the zone database (via
 * Intl), never from string round-trips through the browser's own zone.
 */
function getTimezoneOffset(timezone: string, date: Date): number {
  try {
    return zoneOffsetSeconds(timezone, date.getTime()) / 3600;
  } catch {
    return 0;
  }
}

const fmtOffsetHours = (offset: number): string => {
  const sign = offset >= 0 ? '+' : '-';
  const abs = Math.abs(offset);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return m ? `UTC${sign}${h}:${String(m).padStart(2, '0')}` : `UTC${sign}${h}`;
};

const LONG_NAMES: Record<string, string> = {
  EST: 'Eastern Standard', EDT: 'Eastern Daylight', CST: 'Central Standard', CDT: 'Central Daylight',
  MST: 'Mountain Standard', MDT: 'Mountain Daylight', PST: 'Pacific Standard', PDT: 'Pacific Daylight',
  AKST: 'Alaska Standard', AKDT: 'Alaska Daylight', HST: 'Hawaii Standard',
  GMT: 'Greenwich Mean', BST: 'British Summer', CET: 'Central European', CEST: 'Central European Summer',
  AEST: 'Eastern Standard', AEDT: 'Eastern Daylight', NZST: 'NZ Standard', NZDT: 'NZ Daylight',
};

/** "EDT (Eastern Daylight) UTC-4" style label at a UTC instant. */
function getDSTAwareLabel(timezone: string, date: Date): string {
  const offset = getTimezoneOffset(timezone, date);
  const offsetStr = fmtOffsetHours(offset);
  const abbr = zoneAbbreviation(timezone, date.getTime());
  if (!abbr || /^(GMT|UTC)[+-]/.test(abbr)) return offsetStr;
  const long = LONG_NAMES[abbr];
  return long ? `${abbr} (${long}) ${offsetStr}` : `${abbr} ${offsetStr}`;
}

/**
 * The UTC instant for a local civil date and time in a zone. When no time is
 * given, noon is used. Ambiguous (fall-back) readings take the first
 * occurrence; nonexistent (spring-forward) readings take the first real
 * reading after the jump. Forms that need to ask the user should go through
 * birthDataNormalization instead; this helper only labels and previews.
 */
export function localInstantForZone(timezone: string, birthDate?: string, birthTime?: string): Date | null {
  if (!birthDate) return null;
  const [year, month, day] = birthDate.split('-').map(Number);
  if (!year || !month || !day) return null;
  const [hh, mm, ss] = (birthTime || '12:00').split(':').map(Number);
  const parts: CivilParts = { year, month, day, hour: hh || 0, minute: mm || 0, second: ss || 0 };
  const conv = localToUtc(timezone, parts, 'earlier');
  if (conv.resolved) return conv.resolved.utc;
  if (conv.status === 'nonexistent' && conv.suggestedLocal) {
    const again = localToUtc(timezone, conv.suggestedLocal, 'earlier');
    return again.resolved?.utc ?? null;
  }
  return null;
}

// Public helper: get DST-aware label/offset for a timezone at a specific
// local birth date and time ("EDT UTC-4" vs "EST UTC-5", evaluated at the
// actual moment, so a birth on a changeover night gets the right side).
export function getTimezoneInfoForDate(
  timezone: string,
  birthDate?: string,
  birthTime?: string,
): { offset: number; label: string } {
  const instant = localInstantForZone(timezone, birthDate, birthTime) ?? new Date();
  const offset = getTimezoneOffset(timezone, instant);
  const label = getDSTAwareLabel(timezone, instant);
  return { offset, label };
}

/**
 * US state-level zones. Used only when the offline place resolver and the
 * city map have no entry, so a small birth town still gets the correct zone
 * instead of blocking calculation. State names and postal codes are matched
 * inside the normalized string (commas are already stripped, so "newton nj"
 * contains " nj").
 */
const US_STATE_TIMEZONES: Array<{ terms: string[]; timezone: string }> = [
  { terms: ['new jersey', ' nj', 'new york', ' ny', 'connecticut', ' ct', 'pennsylvania', ' pa', 'delaware', ' de', 'maryland', ' md', 'washington dc', ' dc', 'virginia', ' va', 'west virginia', ' wv', 'massachusetts', ' ma', 'vermont', ' vt', 'new hampshire', ' nh', 'maine', ' me', 'rhode island', ' ri', 'north carolina', ' nc', 'south carolina', ' sc', 'georgia', ' ga', 'florida', ' fl', 'ohio', ' oh', 'michigan', ' mi', 'indiana', ' in'], timezone: 'America/New_York' },
  { terms: ['illinois', ' il', 'wisconsin', ' wi', 'minnesota', ' mn', 'iowa', ' ia', 'missouri', ' mo', 'arkansas', ' ar', 'louisiana', ' la', 'mississippi', ' ms', 'alabama', ' al', 'tennessee', ' tn', 'kentucky', ' ky', 'texas', ' tx', 'oklahoma', ' ok', 'kansas', ' ks', 'nebraska', ' ne', 'south dakota', ' sd', 'north dakota', ' nd'], timezone: 'America/Chicago' },
  { terms: ['colorado', ' co', 'new mexico', ' nm', 'utah', ' ut', 'wyoming', ' wy', 'montana', ' mt', 'idaho', ' id'], timezone: 'America/Denver' },
  { terms: ['arizona', ' az'], timezone: 'America/Phoenix' },
  { terms: ['california', ' ca', 'oregon', ' or', 'nevada', ' nv', 'washington state', ' wa'], timezone: 'America/Los_Angeles' },
  { terms: ['alaska', ' ak'], timezone: 'America/Anchorage' },
  { terms: ['hawaii', ' hi'], timezone: 'Pacific/Honolulu' },
];

/**
 * Zone for a typed birthplace. The offline place resolver (coordinates plus
 * boundary map) is asked first, then the alias map, then US states. The
 * offset and label are evaluated at the local birth time when given.
 */
export function lookupTimezone(location: string, birthDate?: string, birthTime?: string): TimezoneResult | null {
  if (!location) return null;

  let timezone: string | null = null;
  let label: string | undefined;

  const resolved = resolveBirthPlaceOffline(location);
  if (resolved) timezone = resolved.timezone;

  if (!timezone) {
    const normalizedLocation = location.toLowerCase().trim()
      .replace(/,\s*/g, ' ')
      .replace(/\s+/g, ' ');

    const words = normalizedLocation.split(' ');
    let match = LOCATION_TIMEZONE_MAP[normalizedLocation];
    if (!match) {
      // Whole-word containment only, so "la" never matches inside "village".
      for (const [key, value] of Object.entries(LOCATION_TIMEZONE_MAP)) {
        const keyWords = key.split(' ');
        if (key.length >= 4 && keyWords.every(w => words.includes(w))) { match = value; break; }
      }
    }
    if (!match) {
      // Whole-word match only: "nowhere land" must not match Louisiana's "la".
      const zone = US_STATE_TIMEZONES.find(s =>
        s.terms.some(t => t.trim().split(' ').every(w => words.includes(w))),
      );
      if (zone) match = { timezone: zone.timezone } as typeof match;
    }
    if (match) {
      timezone = match.timezone;
      label = match.label;
    }
  }

  if (!timezone) return null;

  const info = getTimezoneInfoForDate(timezone, birthDate, birthTime);
  return { timezone, offset: info.offset, label: info.label || label || timezone };
}

// Export list of available timezones with their current offsets
export function getAvailableTimezones(): Array<{ value: string; label: string; offset: number }> {
  const now = new Date();
  const uniqueTimezones = new Map<string, { value: string; label: string; offset: number }>();

  for (const data of Object.values(LOCATION_TIMEZONE_MAP)) {
    if (!uniqueTimezones.has(data.timezone)) {
      const offset = getTimezoneOffset(data.timezone, now);
      uniqueTimezones.set(data.timezone, {
        value: data.timezone,
        label: data.label,
        offset,
      });
    }
  }

  return Array.from(uniqueTimezones.values()).sort((a, b) => a.offset - b.offset);
}

// Timezone lookup based on location and date
// Maps common locations to their timezone identifiers

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

// Calculate offset for a timezone at a specific date
function getTimezoneOffset(timezone: string, date: Date): number {
  try {
    // Get the offset by comparing UTC and local time
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const diffMs = tzDate.getTime() - utcDate.getTime();
    return diffMs / (1000 * 60 * 60); // Convert to hours
  } catch {
    return 0;
  }
}

// Check if a date is in DST for a given timezone
function isDST(timezone: string, date: Date): boolean {
  // Compare offset in January (winter) vs the given date
  const january = new Date(date.getFullYear(), 0, 15);
  const july = new Date(date.getFullYear(), 6, 15);
  
  const januaryOffset = getTimezoneOffset(timezone, january);
  const julyOffset = getTimezoneOffset(timezone, july);
  const dateOffset = getTimezoneOffset(timezone, date);
  
  // In northern hemisphere, July has larger offset (more positive or less negative)
  // In southern hemisphere, January has larger offset
  const maxOffset = Math.max(januaryOffset, julyOffset);
  
  return dateOffset === maxOffset && januaryOffset !== julyOffset;
}

// Get a specific DST-aware label for display
function getDSTAwareLabel(timezone: string, date: Date): string {
  const inDST = isDST(timezone, date);
  const offset = getTimezoneOffset(timezone, date);
  const offsetStr = offset >= 0 ? `UTC+${offset}` : `UTC${offset}`;
  
  // Map specific timezones to their standard/daylight names
  const dstLabels: Record<string, { standard: string; daylight: string }> = {
    'America/New_York': { standard: 'EST (Eastern Standard)', daylight: 'EDT (Eastern Daylight)' },
    'America/Chicago': { standard: 'CST (Central Standard)', daylight: 'CDT (Central Daylight)' },
    'America/Denver': { standard: 'MST (Mountain Standard)', daylight: 'MDT (Mountain Daylight)' },
    'America/Los_Angeles': { standard: 'PST (Pacific Standard)', daylight: 'PDT (Pacific Daylight)' },
    'America/Toronto': { standard: 'EST (Eastern Standard)', daylight: 'EDT (Eastern Daylight)' },
    'America/Vancouver': { standard: 'PST (Pacific Standard)', daylight: 'PDT (Pacific Daylight)' },
    'Europe/London': { standard: 'GMT (Greenwich Mean)', daylight: 'BST (British Summer)' },
    'Europe/Paris': { standard: 'CET (Central European)', daylight: 'CEST (Central European Summer)' },
    'Europe/Berlin': { standard: 'CET (Central European)', daylight: 'CEST (Central European Summer)' },
    'Australia/Sydney': { standard: 'AEST (Eastern Standard)', daylight: 'AEDT (Eastern Daylight)' },
    'Pacific/Auckland': { standard: 'NZST (NZ Standard)', daylight: 'NZDT (NZ Daylight)' },
  };
  
  const labels = dstLabels[timezone];
  if (labels) {
    return inDST ? `${labels.daylight} ${offsetStr}` : `${labels.standard} ${offsetStr}`;
  }
  
  // For timezones without DST or not in our map
  return `${offsetStr}`;
}

export function lookupTimezone(location: string, birthDate?: string): TimezoneResult | null {
  if (!location) return null;
  
  // Normalize the location string
  const normalizedLocation = location.toLowerCase().trim()
    .replace(/,\s*/g, ' ')
    .replace(/\s+/g, ' ');
  
  // Try exact match first
  let match = LOCATION_TIMEZONE_MAP[normalizedLocation];
  
  // Try partial matches if no exact match
  if (!match) {
    // Check if any key is contained in the location
    for (const [key, value] of Object.entries(LOCATION_TIMEZONE_MAP)) {
      if (normalizedLocation.includes(key) || key.includes(normalizedLocation)) {
        match = value;
        break;
      }
    }
  }
  
  // Try splitting by common separators and checking parts
  if (!match) {
    const parts = normalizedLocation.split(/[,\s]+/);
    for (const part of parts) {
      if (part.length > 2 && LOCATION_TIMEZONE_MAP[part]) {
        match = LOCATION_TIMEZONE_MAP[part];
        break;
      }
    }
  }
  
  if (!match) return null;
  
  // Calculate the actual offset for the given date
  const dateToCheck = birthDate ? new Date(birthDate + 'T12:00:00') : new Date();
  const offset = getTimezoneOffset(match.timezone, dateToCheck);
  const label = getDSTAwareLabel(match.timezone, dateToCheck);
  
  return {
    timezone: match.timezone,
    offset,
    label,
  };
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

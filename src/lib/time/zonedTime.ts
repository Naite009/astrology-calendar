/**
 * Exact civil-time math for IANA time zones, built on the platform's own
 * tz database (Intl). Nothing here depends on the browser's local zone.
 *
 * Every function takes or returns a UTC instant plus a zone id. Offsets are
 * measured to the second so pre-standardisation Local Mean Time zones such
 * as "America/Los_Angeles" in 1880 (UTC-07:52:58) are represented honestly.
 */

export interface CivilParts {
  year: number;
  month: number; // 1-12
  day: number;   // 1-31
  hour: number;  // 0-23
  minute: number;
  second: number;
}

export interface ZonedInstant {
  /** The UTC instant. */
  utc: Date;
  /** Offset of local civil time from UTC, in seconds (west is negative). */
  offsetSeconds: number;
  /** Short zone name at that instant, e.g. "PDT", "GMT+5:45", "LMT". */
  abbreviation: string;
}

export type LocalToUtcStatus = 'ok' | 'ambiguous' | 'nonexistent' | 'invalid-zone' | 'invalid-time';

export interface LocalToUtcResult {
  status: LocalToUtcStatus;
  /** Every valid reading of the wall-clock time (two when ambiguous, none when nonexistent). */
  candidates: ZonedInstant[];
  /** The candidate to use, or null when a decision is still needed. */
  resolved: ZonedInstant | null;
  /** For nonexistent times: how far the clocks jumped, in seconds. */
  gapSeconds?: number;
  /** For nonexistent times: what the clock would have read after the jump. */
  suggestedLocal?: CivilParts;
  /** Human readable explanation of the problem, when there is one. */
  message?: string;
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

const partsFormatter = (timeZone: string): Intl.DateTimeFormat => {
  let f = formatterCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      era: 'short',
    });
    formatterCache.set(timeZone, f);
  }
  return f;
};

const abbrevCache = new Map<string, Intl.DateTimeFormat>();

const abbrevFormatter = (timeZone: string): Intl.DateTimeFormat => {
  let f = abbrevCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short', hour: '2-digit' });
    abbrevCache.set(timeZone, f);
  }
  return f;
};

/**
 * en-US only knows short names for North American and a few European zones;
 * everything else comes back as "GMT+11". These locales know their own
 * regions' names (AEDT, NZST, IST, SAST, ...), so try them before giving up.
 */
const REGIONAL_LOCALES: Array<[RegExp, string]> = [
  [/^Australia\//, 'en-AU'],
  [/^Pacific\/(Auckland|Chatham)/, 'en-NZ'],
  [/^Europe\//, 'en-GB'],
  [/^Asia\/(Kolkata|Calcutta)/, 'en-IN'],
  [/^Africa\//, 'en-ZA'],
  [/^Asia\/(Singapore|Kuala_Lumpur)/, 'en-SG'],
  [/^Asia\/Hong_Kong/, 'en-HK'],
  [/^Asia\/Manila/, 'en-PH'],
];
const regionalAbbrevCache = new Map<string, Intl.DateTimeFormat | null>();
const regionalAbbrevFormatter = (timeZone: string): Intl.DateTimeFormat | null => {
  if (regionalAbbrevCache.has(timeZone)) return regionalAbbrevCache.get(timeZone)!;
  const locale = REGIONAL_LOCALES.find(([re]) => re.test(timeZone))?.[1];
  let f: Intl.DateTimeFormat | null = null;
  if (locale) {
    try {
      f = new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: 'short', hour: '2-digit' });
    } catch {
      f = null;
    }
  }
  regionalAbbrevCache.set(timeZone, f);
  return f;
};

export const isValidTimeZone = (timeZone: string | null | undefined): timeZone is string => {
  if (!timeZone || typeof timeZone !== 'string') return false;
  try {
    partsFormatter(timeZone);
    return true;
  } catch {
    return false;
  }
};

/** Civil (wall clock) parts in the zone for a UTC instant. */
export const civilPartsInZone = (timeZone: string, utcMs: number): CivilParts => {
  const parts = partsFormatter(timeZone).formatToParts(new Date(utcMs));
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  let year = Number(map.year);
  if (map.era && /^B/i.test(map.era)) year = 1 - year;
  return {
    year,
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour) % 24,
    minute: Number(map.minute),
    second: Number(map.second),
  };
};

const civilToPseudoUtcMs = (p: CivilParts): number => {
  // Date.UTC treats years 0-99 as 1900-1999, so set the year explicitly.
  const d = new Date(0);
  d.setUTCFullYear(p.year, p.month - 1, p.day);
  d.setUTCHours(p.hour, p.minute, p.second, 0);
  return d.getTime();
};

/** Offset (local minus UTC) in whole seconds at a UTC instant. */
export const zoneOffsetSeconds = (timeZone: string, utcMs: number): number => {
  const wholeSecondMs = Math.floor(utcMs / 1000) * 1000;
  const civil = civilPartsInZone(timeZone, wholeSecondMs);
  return Math.round((civilToPseudoUtcMs(civil) - wholeSecondMs) / 1000);
};

/** Short zone name at a UTC instant ("PDT", "CET", "GMT+5:45", "LMT"). */
export const zoneAbbreviation = (timeZone: string, utcMs: number): string => {
  try {
    const date = new Date(utcMs);
    let name = abbrevFormatter(timeZone).formatToParts(date).find(p => p.type === 'timeZoneName')?.value;
    if (!name || /^GMT[+-]/.test(name)) {
      const regional = regionalAbbrevFormatter(timeZone);
      const alt = regional?.formatToParts(date).find(p => p.type === 'timeZoneName')?.value;
      if (alt && !/^GMT[+-]/.test(alt)) name = alt;
    }
    return name || formatUtcOffset(zoneOffsetSeconds(timeZone, utcMs));
  } catch {
    return formatUtcOffset(zoneOffsetSeconds(timeZone, utcMs));
  }
};

/** "UTC-07:00", "UTC+05:45", "UTC-07:52:58". */
export const formatUtcOffset = (offsetSeconds: number): string => {
  const sign = offsetSeconds < 0 ? '-' : '+';
  const abs = Math.abs(offsetSeconds);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  const base = `UTC${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  return s ? `${base}:${String(s).padStart(2, '0')}` : base;
};

const zonedAt = (timeZone: string, utcMs: number): ZonedInstant => ({
  utc: new Date(utcMs),
  offsetSeconds: zoneOffsetSeconds(timeZone, utcMs),
  abbreviation: zoneAbbreviation(timeZone, utcMs),
});

const partsEqual = (a: CivilParts, b: CivilParts): boolean =>
  a.year === b.year && a.month === b.month && a.day === b.day &&
  a.hour === b.hour && a.minute === b.minute && a.second === b.second;

const isValidCivil = (p: CivilParts): boolean => {
  if (![p.year, p.month, p.day, p.hour, p.minute, p.second].every(Number.isFinite)) return false;
  if (p.month < 1 || p.month > 12 || p.day < 1 || p.day > 31) return false;
  if (p.hour < 0 || p.hour > 23 || p.minute < 0 || p.minute > 59 || p.second < 0 || p.second > 59) return false;
  const check = new Date(civilToPseudoUtcMs(p));
  return check.getUTCMonth() === p.month - 1 && check.getUTCDate() === p.day;
};

const DAY_MS = 86_400_000;

/**
 * Convert a wall-clock reading in a zone to UTC.
 *
 * The candidate offsets are the ones in force a day before and a day after
 * the reading, plus the one at the naive instant; each is checked by
 * round-tripping. Two distinct valid readings means the clocks were set
 * back across that time (ambiguous); none means the clocks were set
 * forward over it (nonexistent). Neither case is guessed silently.
 */
export const localToUtc = (
  timeZone: string,
  parts: CivilParts,
  fold?: 'earlier' | 'later' | null,
): LocalToUtcResult => {
  if (!isValidTimeZone(timeZone)) {
    return { status: 'invalid-zone', candidates: [], resolved: null, message: `Unknown time zone "${timeZone}".` };
  }
  if (!isValidCivil(parts)) {
    return { status: 'invalid-time', candidates: [], resolved: null, message: 'The date or time is not a valid calendar time.' };
  }

  const naive = civilToPseudoUtcMs(parts);
  const probeOffsets = new Set<number>([
    zoneOffsetSeconds(timeZone, naive - DAY_MS),
    zoneOffsetSeconds(timeZone, naive),
    zoneOffsetSeconds(timeZone, naive + DAY_MS),
  ]);

  const valid = new Map<number, ZonedInstant>();
  for (const off of probeOffsets) {
    const utcMs = naive - off * 1000;
    const back = civilPartsInZone(timeZone, utcMs);
    if (partsEqual(back, parts)) valid.set(utcMs, zonedAt(timeZone, utcMs));
  }

  const candidates = [...valid.values()].sort((a, b) => a.utc.getTime() - b.utc.getTime());

  if (candidates.length === 1) {
    return { status: 'ok', candidates, resolved: candidates[0] };
  }

  if (candidates.length > 1) {
    const chosen = fold === 'earlier' ? candidates[0] : fold === 'later' ? candidates[candidates.length - 1] : null;
    return {
      status: 'ambiguous',
      candidates,
      resolved: chosen,
      message:
        `${pad2(parts.hour)}:${pad2(parts.minute)} happened twice in ${timeZone} on that date because the clocks were set back. ` +
        `It could be ${candidates.map(c => `${c.abbreviation} (${formatUtcOffset(c.offsetSeconds)})`).join(' or ')}.`,
    };
  }

  // Nonexistent: the clocks jumped over this reading.
  const before = zoneOffsetSeconds(timeZone, naive - DAY_MS);
  const after = zoneOffsetSeconds(timeZone, naive + DAY_MS);
  const gap = Math.abs(after - before);
  const suggestedUtc = naive - before * 1000; // reading taken with the pre-jump offset
  const suggestedLocal = civilPartsInZone(timeZone, suggestedUtc);
  return {
    status: 'nonexistent',
    candidates: [],
    resolved: null,
    gapSeconds: gap,
    suggestedLocal,
    message:
      `${pad2(parts.hour)}:${pad2(parts.minute)} did not exist in ${timeZone} on that date: the clocks jumped forward ` +
      `${Math.round(gap / 60)} minutes. The next real reading was ${pad2(suggestedLocal.hour)}:${pad2(suggestedLocal.minute)}. ` +
      `Check the recorded time before trusting the chart.`,
  };
};

export const pad2 = (n: number): string => String(n).padStart(2, '0');

/** Convenience: the zoned instant for a UTC date (offset + abbreviation). */
export const describeInstantInZone = (timeZone: string, utc: Date): ZonedInstant => zonedAt(timeZone, utc.getTime());

/** Does this zone ever change its offset within the given year? */
export const zoneObservesDstInYear = (timeZone: string, year: number): boolean => {
  const jan = Date.UTC(year, 0, 15, 12);
  const jul = Date.UTC(year, 6, 15, 12);
  return zoneOffsetSeconds(timeZone, jan) !== zoneOffsetSeconds(timeZone, jul);
};

/** All IANA zone ids the platform knows, for manual override menus. */
export const listTimeZones = (): string[] => {
  const intl = Intl as unknown as { supportedValuesOf?: (key: string) => string[] };
  try {
    if (typeof intl.supportedValuesOf === 'function') {
      return intl.supportedValuesOf('timeZone');
    }
  } catch {
    /* fall through */
  }
  return FALLBACK_TIME_ZONES;
};

const FALLBACK_TIME_ZONES = [
  'Pacific/Honolulu', 'America/Anchorage', 'America/Los_Angeles', 'America/Phoenix', 'America/Denver',
  'America/Chicago', 'America/New_York', 'America/Toronto', 'America/Mexico_City', 'America/Bogota',
  'America/Lima', 'America/Caracas', 'America/Halifax', 'America/St_Johns', 'America/Santiago',
  'America/Argentina/Buenos_Aires', 'America/Sao_Paulo', 'Atlantic/Azores', 'Europe/London', 'Europe/Dublin',
  'Europe/Lisbon', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid', 'Europe/Rome', 'Europe/Amsterdam',
  'Europe/Stockholm', 'Europe/Warsaw', 'Europe/Athens', 'Europe/Istanbul', 'Europe/Moscow', 'Africa/Cairo',
  'Africa/Johannesburg', 'Africa/Lagos', 'Africa/Nairobi', 'Asia/Jerusalem', 'Asia/Dubai', 'Asia/Tehran',
  'Asia/Karachi', 'Asia/Kolkata', 'Asia/Kathmandu', 'Asia/Dhaka', 'Asia/Bangkok', 'Asia/Jakarta',
  'Asia/Singapore', 'Asia/Hong_Kong', 'Asia/Shanghai', 'Asia/Manila', 'Asia/Seoul', 'Asia/Tokyo',
  'Australia/Perth', 'Australia/Adelaide', 'Australia/Brisbane', 'Australia/Sydney', 'Australia/Melbourne',
  'Pacific/Auckland', 'Pacific/Fiji', 'Pacific/Apia', 'Pacific/Tongatapu', 'UTC',
];

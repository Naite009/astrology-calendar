/**
 * One normalized birth moment for the whole app.
 *
 * Birth date + birth time are LOCAL CIVIL TIME AT THE BIRTHPLACE. This module
 * turns them, plus the birthplace, into exactly one UTC instant with an audit
 * trail, and refuses to guess when it cannot do that honestly:
 *
 *   - the zone is the IANA zone of the place (stored, or resolved from it),
 *     never the browser zone, a state-level offset, or an abbreviation;
 *   - the historical offset for that exact civil time comes from tz rules;
 *   - times inside a fall-back overlap need a fold decision, times inside a
 *     spring-forward gap are reported as nonexistent;
 *   - seconds are kept when supplied, and the precision is recorded;
 *   - angles are only allowed when the coordinates are precise and the birth
 *     time is real (not a noon placeholder).
 *
 * Every calculator (natal, verification, progressions, sidereal, Human Design,
 * astrocartography, QA) must call resolveBirthMoment / birthMomentFromPlace and
 * pass `moment.utc` on. None of them should parse dates or offsets themselves.
 */

import {
  localToUtc,
  describeInstantInZone,
  formatUtcOffset,
  isValidTimeZone,
  zoneObservesDstInYear,
  pad2,
  type CivilParts,
  type ZonedInstant,
} from './time/zonedTime';
import {
  resolveBirthPlace,
  resolveBirthPlaceOffline,
  placeFromCoordinates,
  formatCoordinates,
  type ResolvedBirthPlace,
  type PlaceConfidence,
} from './geo/birthPlace';
import { ENGINE_INFO, DEFAULT_SETTINGS, type EphemerisSettings } from './ephemerisEngine';
import { HOUSE_SYSTEM_LABELS } from './placidusHouses';

export type TimePrecision = 'second' | 'minute' | 'unknown';
export type DstFold = 'earlier' | 'later';

/** Everything a chart record may carry about when and where. */
export interface BirthInput {
  birthDate: string | null | undefined;
  birthTime?: string | null;
  birthLocation?: string | null;
  /** Stored, preferred over re-resolving the location text. */
  timezoneId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  placeName?: string | null;
  placeConfidence?: PlaceConfidence | null;
  /** User decision for a time inside a fall-back overlap. */
  dstFold?: DstFold | null;
  /** Legacy numeric offset in hours; only used to flag disagreement. */
  timezoneOffset?: number | null;
  /** House system the source used, if known. */
  houseSystem?: EphemerisSettings['houseSystem'] | null;
  /** Node definition the source used, if known. */
  nodeVariant?: EphemerisSettings['nodeVariant'] | null;
}

export type BirthMomentStatus =
  | 'ok'
  | 'needs-fold'      // ambiguous local time, no fold chosen
  | 'nonexistent'     // local time inside a spring-forward gap
  | 'no-date'
  | 'no-place'        // nothing could be resolved and no zone/offset stored
  | 'invalid';

export interface BirthAuditTrail {
  localDateTime: string;
  timePrecision: TimePrecision;
  timeAssumed: boolean;
  place: string;
  coordinates: string;
  coordinateSource: string;
  coordinateConfidence: PlaceConfidence | 'none';
  timezoneId: string;
  offsetAtBirth: string;
  zoneSource: string;
  utcDateTime: string;
  engine: string;
  zodiac: string;
  houseSystem: string;
  nodeVariant: string;
  lilithVariant: string;
  slowBodies: string;
}

export interface BirthMoment {
  status: BirthMomentStatus;
  /** The single UTC instant every calculator must use. Null unless status is 'ok'. */
  utc: Date | null;
  local: CivilParts | null;
  timePrecision: TimePrecision;
  /** True when no birth time was given and 12:00 was substituted. */
  timeAssumed: boolean;
  zone: (ZonedInstant & { id: string }) | null;
  place: ResolvedBirthPlace | null;
  /** Precise coordinates and a real time: angles/houses may be calculated. */
  canComputeAngles: boolean;
  /** Both readings of an ambiguous time, so the UI can offer the choice. */
  foldCandidates: ZonedInstant[];
  /** For nonexistent times, the first real reading after the jump. */
  suggestedLocal: CivilParts | null;
  warnings: string[];
  /** Stored legacy offset disagrees with the zone rules. */
  legacyOffsetMismatch: { storedHours: number; actualHours: number } | null;
  settings: EphemerisSettings;
  audit: BirthAuditTrail | null;
}

// ── Parsing ────────────────────────────────────────────────────────────────

export interface ParsedDate { year: number; month: number; day: number }
export interface ParsedTime { hour: number; minute: number; second: number; precision: TimePrecision }

/** Accepts YYYY-MM-DD, YYYY/MM/DD, MM/DD/YYYY, M/D/YYYY, and "Month D, YYYY". */
export const parseBirthDate = (raw: string | null | undefined): ParsedDate | null => {
  if (!raw) return null;
  const s = String(raw).trim();
  let m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s].*)?$/);
  if (m) return checkDate(+m[1], +m[2], +m[3]);
  m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (m) return checkDate(+m[3], +m[1], +m[2]);
  m = s.match(/^([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})$/);
  if (m) {
    const month = MONTHS.findIndex(n => n.startsWith(m![1].slice(0, 3).toLowerCase()));
    if (month >= 0) return checkDate(+m[3], month + 1, +m[2]);
  }
  m = s.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\.?\s+(\d{4})$/);
  if (m) {
    const month = MONTHS.findIndex(n => n.startsWith(m![2].slice(0, 3).toLowerCase()));
    if (month >= 0) return checkDate(+m[3], month + 1, +m[1]);
  }
  return null;
};

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const checkDate = (year: number, month: number, day: number): ParsedDate | null => {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const probe = new Date(Date.UTC(2000, month - 1, day));
  probe.setUTCFullYear(year);
  if (probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) return null;
  return { year, month, day };
};

/** Accepts "18:06", "18:06:30", "6:06 PM", "6:06:30 pm", "0606", "noon". */
export const parseBirthTime = (raw: string | null | undefined): ParsedTime | null => {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim().toLowerCase();
  if (!s) return null;
  if (s === 'noon') return { hour: 12, minute: 0, second: 0, precision: 'minute' };
  if (s === 'midnight') return { hour: 0, minute: 0, second: 0, precision: 'minute' };

  let m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([ap])\.?m?\.?$/);
  if (m) {
    let hour = +m[1];
    const minute = +m[2];
    const second = m[3] !== undefined ? +m[3] : 0;
    if (hour < 1 || hour > 12) return null;
    if (m[4] === 'a') hour = hour % 12;
    else hour = (hour % 12) + 12;
    return checkTime(hour, minute, second, m[3] !== undefined ? 'second' : 'minute');
  }
  m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (m) return checkTime(+m[1], +m[2], m[3] !== undefined ? +m[3] : 0, m[3] !== undefined ? 'second' : 'minute');
  m = s.match(/^(\d{2})(\d{2})$/);
  if (m) return checkTime(+m[1], +m[2], 0, 'minute');
  return null;
};

const checkTime = (hour: number, minute: number, second: number, precision: TimePrecision): ParsedTime | null => {
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) return null;
  return { hour, minute, second, precision };
};

export const formatLocalDateTime = (p: CivilParts, precision: TimePrecision): string => {
  const date = `${p.year}-${pad2(p.month)}-${pad2(p.day)}`;
  const time = `${pad2(p.hour)}:${pad2(p.minute)}` + (precision === 'second' ? `:${pad2(p.second)}` : '');
  return `${date} ${time}`;
};

// ── Place from stored metadata ─────────────────────────────────────────────

/** Use what the record already knows before touching any lookup. */
export const placeFromStored = (input: BirthInput): ResolvedBirthPlace | null => {
  const lat = input.latitude;
  const lon = input.longitude;
  const zone = input.timezoneId;
  if (typeof lat === 'number' && typeof lon === 'number' && Number.isFinite(lat) && Number.isFinite(lon)) {
    const place = placeFromCoordinates(input.placeName || input.birthLocation || '', lat, lon, zone, 'stored');
    if (place) {
      place.confidence = input.placeConfidence || 'high';
      place.zoneConfidence = input.placeConfidence === 'low' ? 'low' : 'high';
      return place;
    }
  }
  return null;
};

// ── Core normalisation (pure, synchronous) ─────────────────────────────────

const settingsFrom = (input: BirthInput): EphemerisSettings => ({
  ...DEFAULT_SETTINGS,
  houseSystem: input.houseSystem || DEFAULT_SETTINGS.houseSystem,
  nodeVariant: input.nodeVariant || DEFAULT_SETTINGS.nodeVariant,
});

const emptyMoment = (status: BirthMomentStatus, warnings: string[], settings: EphemerisSettings, place: ResolvedBirthPlace | null = null): BirthMoment => ({
  status, utc: null, local: null, timePrecision: 'unknown', timeAssumed: false, zone: null, place,
  canComputeAngles: false, foldCandidates: [], suggestedLocal: null, warnings, legacyOffsetMismatch: null, settings, audit: null,
});

/**
 * Build the moment from parsed input and an already-resolved place. This is
 * the function tests exercise: no network, no storage, fully deterministic.
 */
export const birthMomentFromPlace = (input: BirthInput, place: ResolvedBirthPlace | null): BirthMoment => {
  const settings = settingsFrom(input);
  const warnings: string[] = [];

  const date = parseBirthDate(input.birthDate);
  if (!date) return emptyMoment('no-date', ['A valid birth date is required.'], settings, place);

  const time = parseBirthTime(input.birthTime);
  const timeAssumed = !time;
  if (input.birthTime && !time) {
    warnings.push(`The birth time "${input.birthTime}" could not be read; noon was used and angles are not calculated.`);
  }
  const local: CivilParts = {
    year: date.year, month: date.month, day: date.day,
    hour: time?.hour ?? 12, minute: time?.minute ?? 0, second: time?.second ?? 0,
  };
  const precision: TimePrecision = time ? time.precision : 'unknown';

  // Zone: from the place. A stored timezoneId with no coordinates still counts.
  let zoneId: string | null = place?.timezone ?? null;
  let zoneSource = place ? `${place.source} (${place.zoneConfidence} confidence)` : '';
  if (!zoneId && isValidTimeZone(input.timezoneId)) {
    zoneId = input.timezoneId!;
    zoneSource = 'stored zone id (no coordinates)';
  }

  // Legacy path: only a fixed numeric offset is known. Compute, but say so loudly.
  if (!zoneId) {
    if (typeof input.timezoneOffset === 'number' && Number.isFinite(input.timezoneOffset)) {
      const offsetSeconds = Math.round(input.timezoneOffset * 3600);
      const utcMs = Date.UTC(2000, local.month - 1, local.day, local.hour, local.minute, local.second);
      const d = new Date(utcMs);
      d.setUTCFullYear(local.year);
      const utc = new Date(d.getTime() - offsetSeconds * 1000);
      warnings.push(
        `The birthplace could not be resolved, so the saved fixed offset ${formatUtcOffset(offsetSeconds)} was used. ` +
        'Daylight saving rules were not applied. Add a recognizable town and country to fix this.',
      );
      const audit = buildAudit(local, precision, timeAssumed, null, 'fixed offset (legacy)', formatUtcOffset(offsetSeconds), 'saved numeric offset', utc, settings);
      return {
        status: 'ok', utc, local, timePrecision: precision, timeAssumed,
        zone: { id: 'fixed-offset', utc, offsetSeconds, abbreviation: formatUtcOffset(offsetSeconds) },
        place: null, canComputeAngles: false, foldCandidates: [], suggestedLocal: null,
        warnings, legacyOffsetMismatch: null, settings, audit,
      };
    }
    return emptyMoment('no-place', [
      input.birthLocation
        ? `"${input.birthLocation}" could not be matched to a place, so the time zone is unknown. Add the state or country, or choose the zone by hand.`
        : 'A birthplace is required to know the time zone.',
    ], settings, place);
  }

  const conv = localToUtc(zoneId, local, input.dstFold ?? null);

  if (conv.status === 'invalid-zone' || conv.status === 'invalid-time') {
    return emptyMoment('invalid', [conv.message || 'Invalid date, time or zone.'], settings, place);
  }
  if (conv.status === 'nonexistent') {
    return {
      ...emptyMoment('nonexistent', [conv.message || 'That local time did not exist.'], settings, place),
      local, timePrecision: precision, suggestedLocal: conv.suggestedLocal ?? null,
    };
  }
  if (conv.status === 'ambiguous' && !conv.resolved) {
    return {
      ...emptyMoment('needs-fold', [conv.message || 'That local time happened twice.'], settings, place),
      local, timePrecision: precision, foldCandidates: conv.candidates,
    };
  }

  const zoned = conv.resolved!;
  if (conv.status === 'ambiguous') {
    warnings.push(`${pad2(local.hour)}:${pad2(local.minute)} occurred twice that day; using the ${input.dstFold} reading (${zoned.abbreviation}).`);
  }

  // Place-quality warnings.
  if (place) {
    for (const n of place.notes) warnings.push(n);
    if (place.confidence === 'low') {
      warnings.push('Only a region was recognised for the birthplace, so the Ascendant, Midheaven, houses and Vertex are not calculated.');
    }
    if (place.zoneConfidence === 'low') {
      warnings.push(`The time zone ${zoneId} is a best guess for this region. Confirm it before trusting any position.`);
    }
  }
  if (timeAssumed) {
    warnings.push('No birth time: 12:00 local was used. The Moon can be off by up to 7 degrees and angles are not calculated.');
  }

  // Legacy numeric offset that disagrees with the zone rules (the West Hills bug).
  let legacyOffsetMismatch: BirthMoment['legacyOffsetMismatch'] = null;
  if (typeof input.timezoneOffset === 'number' && Number.isFinite(input.timezoneOffset)) {
    const actualHours = zoned.offsetSeconds / 3600;
    if (Math.abs(actualHours - input.timezoneOffset) > 1 / 120) {
      legacyOffsetMismatch = { storedHours: input.timezoneOffset, actualHours };
      warnings.push(
        `The chart was saved with a fixed offset of ${formatUtcOffset(input.timezoneOffset * 3600)}, but ${zoneId} was ` +
        `${zoned.abbreviation} (${formatUtcOffset(zoned.offsetSeconds)}) at that moment. The zone rules were used.`,
      );
    }
  }

  const canComputeAngles = !!place && place.confidence !== 'low' && !timeAssumed;

  const audit = buildAudit(
    local, precision, timeAssumed, place, zoneId, `${zoned.abbreviation} (${formatUtcOffset(zoned.offsetSeconds)})`,
    zoneSource, zoned.utc, settings,
  );

  return {
    status: 'ok',
    utc: zoned.utc,
    local,
    timePrecision: precision,
    timeAssumed,
    zone: { ...zoned, id: zoneId },
    place,
    canComputeAngles,
    foldCandidates: conv.candidates,
    suggestedLocal: null,
    warnings,
    legacyOffsetMismatch,
    settings,
    audit,
  };
};

const buildAudit = (
  local: CivilParts,
  precision: TimePrecision,
  timeAssumed: boolean,
  place: ResolvedBirthPlace | null,
  zoneId: string,
  offsetLabel: string,
  zoneSource: string,
  utc: Date,
  settings: EphemerisSettings,
): BirthAuditTrail => ({
  localDateTime: formatLocalDateTime(local, precision) + (timeAssumed ? ' (noon assumed)' : ''),
  timePrecision: precision,
  timeAssumed,
  place: place ? place.canonicalName : 'not resolved',
  coordinates: place ? `${formatCoordinates(place.latitude, place.longitude)} (${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)})` : 'unknown',
  coordinateSource: place ? place.source : 'none',
  coordinateConfidence: place ? place.confidence : 'none',
  timezoneId: zoneId,
  offsetAtBirth: offsetLabel,
  zoneSource,
  utcDateTime: utc.toISOString().replace('.000Z', 'Z'),
  engine: `${ENGINE_INFO.name} ${ENGINE_INFO.version}`,
  zodiac: settings.zodiac === 'tropical' ? 'Tropical' : settings.zodiac,
  houseSystem: HOUSE_SYSTEM_LABELS[settings.houseSystem],
  nodeVariant: settings.nodeVariant === 'true' ? 'True (osculating) node' : 'Mean node',
  lilithVariant: 'Mean Black Moon Lilith (mean lunar apogee)',
  slowBodies: ENGINE_INFO.slowBodies,
});

// ── Entry points ───────────────────────────────────────────────────────────

/**
 * Synchronous: stored metadata, then the offline tables. Good enough for
 * anything that already has coordinates + zone saved on the chart, and for
 * bulk work (progressions, transits) where a network round-trip is wrong.
 */
export const resolveBirthMomentSync = (input: BirthInput): BirthMoment => {
  const stored = placeFromStored(input);
  const place = stored ?? (input.birthLocation ? resolveBirthPlaceOffline(input.birthLocation) : null);
  return birthMomentFromPlace(input, place);
};

/**
 * Asynchronous: stored metadata, cache, geocoder, offline tables. Use this
 * from forms, imports and the verification panel.
 */
export const resolveBirthMoment = async (
  input: BirthInput,
  options: { network?: boolean; signal?: AbortSignal } = {},
): Promise<BirthMoment> => {
  const stored = placeFromStored(input);
  if (stored) return birthMomentFromPlace(input, stored);
  const place = input.birthLocation ? await resolveBirthPlace(input.birthLocation, options) : null;
  return birthMomentFromPlace(input, place);
};

/** Shape to persist on a chart once a place has been resolved. */
export interface StoredPlaceMetadata {
  timezoneId: string;
  latitude: number;
  longitude: number;
  placeName: string;
  placeConfidence: PlaceConfidence;
  placeSource: ResolvedBirthPlace['source'];
}

export const storedMetadataFromPlace = (place: ResolvedBirthPlace): StoredPlaceMetadata => ({
  timezoneId: place.timezone,
  latitude: place.latitude,
  longitude: place.longitude,
  placeName: place.canonicalName,
  placeConfidence: place.confidence,
  placeSource: place.source,
});

/** Legacy helper: the whole-hour offset a zone had at a moment (for old fields). */
export const legacyOffsetHours = (moment: BirthMoment): number | null =>
  moment.zone ? moment.zone.offsetSeconds / 3600 : null;

export const describeZoneAt = (zoneId: string, utc: Date): string => {
  const z = describeInstantInZone(zoneId, utc);
  return `${z.abbreviation} (${formatUtcOffset(z.offsetSeconds)})`;
};

export const zoneHasDst = (zoneId: string, year: number): boolean => zoneObservesDstInYear(zoneId, year);

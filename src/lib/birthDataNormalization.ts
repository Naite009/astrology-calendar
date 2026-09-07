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
  placeFromSourceCoordinates,
  checkPlaceAgainstText,
  formatCoordinates,
  type ResolvedBirthPlace,
  type PlaceConfidence,
  type PlaceSource,
  type PlaceCandidate,
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
  /** Stored, preferred over re-resolving the location text (after a consistency check). */
  timezoneId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  placeName?: string | null;
  placeConfidence?: PlaceConfidence | null;
  placeSource?: PlaceSource | null;
  /**
   * Coordinates printed by the imported source. Highest priority: when
   * present, neither stored metadata nor any lookup is consulted.
   */
  sourceLatitude?: number | null;
  sourceLongitude?: number | null;
  sourceCoordinatesText?: string | null;
  /** Universal time the source printed (HH:MM[:SS]); cross-checked, never used to calculate. */
  sourceUniversalTime?: string | null;
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
  | 'ambiguous-place' // several towns share the name; user must choose
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
  /** "matches" / "differs by ..." when the source printed a universal time. */
  sourceUniversalTime?: string;
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
  /** For ambiguous places, the towns that share the name. */
  placeCandidates: PlaceCandidate[];
  warnings: string[];
  /** Stored legacy offset disagrees with the zone rules. */
  legacyOffsetMismatch: { storedHours: number; actualHours: number } | null;
  /**
   * Stored coordinates/zone contradicted the birthplace text (saved by an
   * older resolver that picked the wrong same-name town). They were ignored
   * and the place was resolved again; the caller should persist the new one.
   */
  storedPlaceConflict: string | null;
  /** Result of comparing the computed UTC with the universal time the source printed. */
  sourceUtcCheck: { printed: string; computed: string; differenceMinutes: number; matches: boolean } | null;
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

// ── Place from what the record already carries ─────────────────────────────

/** Stored coordinates + zone, exactly as saved (no consistency check here). */
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

/** Coordinates printed by the source file, when the record carries them. */
export const placeFromSourceOnInput = (input: BirthInput): ResolvedBirthPlace | null => {
  const lat = input.sourceLatitude;
  const lon = input.sourceLongitude;
  if (typeof lat !== 'number' || typeof lon !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return placeFromSourceCoordinates(input.birthLocation || input.placeName || '', {
    latitude: lat, longitude: lon, text: input.sourceCoordinatesText || undefined,
  });
};

export interface PlaceFromInputResult {
  place: ResolvedBirthPlace | null;
  /** Set when stored metadata was rejected because it contradicts the birthplace text. */
  storedConflict: string | null;
}

/**
 * Precedence for a record's location:
 *
 *   1. coordinates printed by the source file (authoritative, never re-geocoded);
 *   2. stored coordinates + zone, but only if they agree with the birthplace
 *      text (a record saved by the old resolver as "Franklin, Tennessee" while
 *      the text says "Franklin, NJ" is a conflict, not a cache hit);
 *   3. nothing: the caller resolves the text.
 *
 * Places the user confirmed by hand ('confirmed' / 'manual') are trusted as
 * long as the text has not been changed to a different town.
 */
export const placeFromInput = (input: BirthInput): PlaceFromInputResult => {
  const fromSource = placeFromSourceOnInput(input);
  if (fromSource) {
    // The printed coordinates win, but a stored place that sits somewhere
    // else entirely is still reported so the record gets refreshed.
    const stored = placeFromStored(input);
    if (stored && distanceKm(stored.latitude, stored.longitude, fromSource.latitude, fromSource.longitude) > STALE_STORED_KM) {
      const saved = input.placeName || `${stored.latitude.toFixed(4)}, ${stored.longitude.toFixed(4)}`;
      return {
        place: fromSource,
        storedConflict:
          `The saved location (${saved}, ${stored.timezone}) is ${Math.round(distanceKm(stored.latitude, stored.longitude, fromSource.latitude, fromSource.longitude))} km ` +
          `from the coordinates printed by the source (${fromSource.latitude.toFixed(4)}, ${fromSource.longitude.toFixed(4)}). The printed coordinates were used.`,
      };
    }
    return { place: fromSource, storedConflict: null };
  }

  const stored = placeFromStored(input);
  if (!stored) return { place: null, storedConflict: null };

  if (input.birthLocation) {
    const check = checkPlaceAgainstText(
      { latitude: stored.latitude, longitude: stored.longitude, canonicalName: input.placeName || null },
      input.birthLocation,
    );
    if (!check.consistent) {
      const saved = input.placeName || `${stored.latitude.toFixed(4)}, ${stored.longitude.toFixed(4)}`;
      return {
        place: null,
        storedConflict:
          `The saved location (${saved}, ${stored.timezone}) does not fit the birthplace text "${input.birthLocation}": ${check.reason}. ` +
          'It was ignored and the birthplace was resolved again from the text.',
      };
    }
  }
  return { place: stored, storedConflict: null };
};

// ── Core normalisation (pure, synchronous) ─────────────────────────────────

const settingsFrom = (input: BirthInput): EphemerisSettings => ({
  ...DEFAULT_SETTINGS,
  houseSystem: input.houseSystem || DEFAULT_SETTINGS.houseSystem,
  nodeVariant: input.nodeVariant || DEFAULT_SETTINGS.nodeVariant,
});

const emptyMoment = (status: BirthMomentStatus, warnings: string[], settings: EphemerisSettings, place: ResolvedBirthPlace | null = null): BirthMoment => ({
  status, utc: null, local: null, timePrecision: 'unknown', timeAssumed: false, zone: null, place,
  canComputeAngles: false, foldCandidates: [], suggestedLocal: null, placeCandidates: place?.candidates || [],
  warnings, legacyOffsetMismatch: null, storedPlaceConflict: null, sourceUtcCheck: null, settings, audit: null,
});

/** "22:45" or "22:45:30" -> minutes of day, or null. */
const parseUtcClock = (raw: string | null | undefined): number | null => {
  if (!raw) return null;
  const m = String(raw).trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const h = +m[1], mi = +m[2], s = m[3] !== undefined ? +m[3] : 0;
  if (h > 23 || mi > 59 || s > 59) return null;
  return h * 60 + mi + s / 60;
};

/**
 * Build the moment from parsed input and an already-resolved place. This is
 * the function tests exercise: no network, no storage, fully deterministic.
 */
export const birthMomentFromPlace = (
  input: BirthInput,
  place: ResolvedBirthPlace | null,
  extra: { storedConflict?: string | null } = {},
): BirthMoment => {
  const settings = settingsFrom(input);
  const warnings: string[] = [];
  if (extra.storedConflict) warnings.push(extra.storedConflict);

  const date = parseBirthDate(input.birthDate);
  if (!date) return { ...emptyMoment('no-date', [...warnings, 'A valid birth date is required.'], settings, place), storedPlaceConflict: extra.storedConflict || null };

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

  // Several towns share the name and nothing in the text picks one. The
  // candidates can be in different zones, so nothing is computed at all.
  if (place?.ambiguous) {
    return {
      ...emptyMoment('ambiguous-place', [...warnings, ...place.notes], settings, place),
      local, timePrecision: precision, timeAssumed,
      placeCandidates: place.candidates || [],
      storedPlaceConflict: extra.storedConflict || null,
    };
  }

  // Zone: from the place. A stored timezoneId with no coordinates still counts.
  let zoneId: string | null = place?.timezone ?? null;
  let zoneSource = place ? `${place.source} (${place.zoneConfidence} confidence)` : '';
  if (!zoneId && isValidTimeZone(input.timezoneId) && !extra.storedConflict) {
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
      const audit = buildAudit(local, precision, timeAssumed, null, 'fixed offset (legacy)', formatUtcOffset(offsetSeconds), 'saved numeric offset', utc, settings, null);
      return {
        status: 'ok', utc, local, timePrecision: precision, timeAssumed,
        zone: { id: 'fixed-offset', utc, offsetSeconds, abbreviation: formatUtcOffset(offsetSeconds) },
        place: null, canComputeAngles: false, foldCandidates: [], suggestedLocal: null, placeCandidates: [],
        warnings, legacyOffsetMismatch: null, storedPlaceConflict: extra.storedConflict || null, sourceUtcCheck: null, settings, audit,
      };
    }
    return {
      ...emptyMoment('no-place', [
        ...warnings,
        input.birthLocation
          ? `"${input.birthLocation}" could not be matched to a place, so the time zone is unknown. Add the state or country, or choose the zone by hand.`
          : 'A birthplace is required to know the time zone.',
      ], settings, place),
      storedPlaceConflict: extra.storedConflict || null,
    };
  }

  const conv = localToUtc(zoneId, local, input.dstFold ?? null);

  if (conv.status === 'invalid-zone' || conv.status === 'invalid-time') {
    return { ...emptyMoment('invalid', [...warnings, conv.message || 'Invalid date, time or zone.'], settings, place), storedPlaceConflict: extra.storedConflict || null };
  }
  if (conv.status === 'nonexistent') {
    return {
      ...emptyMoment('nonexistent', [...warnings, conv.message || 'That local time did not exist.'], settings, place),
      local, timePrecision: precision, suggestedLocal: conv.suggestedLocal ?? null, storedPlaceConflict: extra.storedConflict || null,
    };
  }
  if (conv.status === 'ambiguous' && !conv.resolved) {
    return {
      ...emptyMoment('needs-fold', [...warnings, conv.message || 'That local time happened twice.'], settings, place),
      local, timePrecision: precision, foldCandidates: conv.candidates, storedPlaceConflict: extra.storedConflict || null,
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

  // Universal time printed by the source: an independent check of the whole
  // place -> zone -> offset chain. Never used to calculate.
  let sourceUtcCheck: BirthMoment['sourceUtcCheck'] = null;
  const printedUtc = parseUtcClock(input.sourceUniversalTime);
  if (printedUtc !== null && !timeAssumed) {
    const computedMinutes = zoned.utc.getUTCHours() * 60 + zoned.utc.getUTCMinutes() + zoned.utc.getUTCSeconds() / 60;
    let diff = Math.abs(computedMinutes - printedUtc);
    if (diff > 720) diff = 1440 - diff;
    const computedLabel = `${pad2(zoned.utc.getUTCHours())}:${pad2(zoned.utc.getUTCMinutes())}`;
    const matches = diff <= 1.5;
    sourceUtcCheck = { printed: String(input.sourceUniversalTime).trim(), computed: computedLabel, differenceMinutes: Math.round(diff * 10) / 10, matches };
    if (!matches) {
      const hours = diff / 60;
      warnings.push(
        `The source printed Univ.Time ${sourceUtcCheck.printed}, but ${zoneId} rules give ${computedLabel} UTC ` +
        `(${hours >= 1 ? `${Math.round(hours * 100) / 100} hour${hours === 1 ? '' : 's'}` : `${Math.round(diff)} minutes`} apart). ` +
        'The birthplace or its time zone is probably wrong; check both before trusting angles.',
      );
    }
  }

  const canComputeAngles = !!place && place.confidence !== 'low' && !timeAssumed;

  const audit = buildAudit(
    local, precision, timeAssumed, place, zoneId, `${zoned.abbreviation} (${formatUtcOffset(zoned.offsetSeconds)})`,
    zoneSource, zoned.utc, settings, sourceUtcCheck,
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
    placeCandidates: [],
    warnings,
    legacyOffsetMismatch,
    storedPlaceConflict: extra.storedConflict || null,
    sourceUtcCheck,
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
  sourceUtcCheck: BirthMoment['sourceUtcCheck'],
): BirthAuditTrail => ({
  localDateTime: formatLocalDateTime(local, precision) + (timeAssumed ? ' (noon assumed)' : ''),
  timePrecision: precision,
  timeAssumed,
  place: place ? place.canonicalName : 'not resolved',
  coordinates: place
    ? `${formatCoordinates(place.latitude, place.longitude)} (${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)})` +
      (place.sourceText ? `, printed as "${place.sourceText}"` : '')
    : 'unknown',
  coordinateSource: place ? place.source : 'none',
  coordinateConfidence: place ? place.confidence : 'none',
  timezoneId: zoneId,
  offsetAtBirth: offsetLabel,
  zoneSource,
  utcDateTime: utc.toISOString().replace('.000Z', 'Z'),
  sourceUniversalTime: sourceUtcCheck
    ? (sourceUtcCheck.matches
      ? `${sourceUtcCheck.printed} printed by the source: matches`
      : `${sourceUtcCheck.printed} printed by the source: differs from ${sourceUtcCheck.computed} by ${sourceUtcCheck.differenceMinutes} min`)
    : undefined,
  engine: `${ENGINE_INFO.name} ${ENGINE_INFO.version}`,
  zodiac: settings.zodiac === 'tropical' ? 'Tropical' : settings.zodiac,
  houseSystem: HOUSE_SYSTEM_LABELS[settings.houseSystem],
  nodeVariant: settings.nodeVariant === 'true' ? 'True (osculating) node' : 'Mean node',
  lilithVariant: 'Mean Black Moon Lilith (mean lunar apogee)',
  slowBodies: ENGINE_INFO.slowBodies,
});

// ── Entry points ───────────────────────────────────────────────────────────

/**
 * Synchronous: source coordinates, stored metadata (checked against the
 * text), then the offline tables. Good enough for anything that already has
 * coordinates + zone saved on the chart, and for bulk work (progressions,
 * transits) where a network round-trip is wrong.
 */
export const resolveBirthMomentSync = (input: BirthInput): BirthMoment => {
  const { place: known, storedConflict } = placeFromInput(input);
  const place = known ?? (input.birthLocation ? resolveBirthPlaceOffline(input.birthLocation) : null);
  return birthMomentFromPlace(input, place, { storedConflict });
};

/**
 * Asynchronous: source coordinates, stored metadata (checked against the
 * text), cache, geocoder, offline tables. Use this from forms, imports and
 * the verification panel.
 */
export const resolveBirthMoment = async (
  input: BirthInput,
  options: { network?: boolean; signal?: AbortSignal } = {},
): Promise<BirthMoment> => {
  const { place: known, storedConflict } = placeFromInput(input);
  if (known) return birthMomentFromPlace(input, known, { storedConflict });
  const place = input.birthLocation ? await resolveBirthPlace(input.birthLocation, options) : null;
  return birthMomentFromPlace(input, place, { storedConflict });
};

/** The birth-related fields of a stored chart, as one BirthInput. */
export const birthInputFromChart = (chart: {
  birthDate: string; birthTime?: string | null; birthLocation?: string | null;
  timezoneId?: string; latitude?: number; longitude?: number; placeName?: string;
  placeConfidence?: PlaceConfidence; placeSource?: PlaceSource;
  sourceLatitude?: number; sourceLongitude?: number; sourceCoordinatesText?: string; sourceUniversalTime?: string;
  dstFold?: DstFold; timezoneOffset?: number;
  houseSystem?: EphemerisSettings['houseSystem']; nodeVariant?: EphemerisSettings['nodeVariant'];
}): BirthInput => ({
  birthDate: chart.birthDate,
  birthTime: chart.birthTime ?? null,
  birthLocation: chart.birthLocation ?? null,
  timezoneId: chart.timezoneId,
  latitude: chart.latitude,
  longitude: chart.longitude,
  placeName: chart.placeName,
  placeConfidence: chart.placeConfidence,
  placeSource: chart.placeSource,
  sourceLatitude: chart.sourceLatitude,
  sourceLongitude: chart.sourceLongitude,
  sourceCoordinatesText: chart.sourceCoordinatesText,
  sourceUniversalTime: chart.sourceUniversalTime,
  dstFold: chart.dstFold,
  timezoneOffset: chart.timezoneOffset,
  houseSystem: chart.houseSystem,
  nodeVariant: chart.nodeVariant,
});

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

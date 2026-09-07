/**
 * Reading the birthplace and coordinates a chart SOURCE printed.
 *
 * Astro.com (and most chart services) print the place with every qualifier
 * they have plus the coordinates they actually used, for example:
 *
 *   Mike Sanders, born 29 Aug 1964, 6:45 p.m., Franklin (Sussex County), NJ (US),
 *   74w35, 41n07, Univ.Time 22:45, Sid. Time 16:00:11
 *
 * Printed coordinates are the highest-priority location for verification:
 * they are what the source used, so re-geocoding the town name can only add
 * error (or, with a duplicated town name, pick the wrong town). This module
 * extracts them, the full place string, the universal time and the house
 * system so nothing the source knew is discarded on import.
 */

export interface SourceCoordinates {
  latitude: number;
  longitude: number;
  /** Exactly what the source printed, for the audit trail. */
  text: string;
  /** How precise the printed value was. */
  precision: 'degree' | 'minute' | 'second' | 'decimal';
}

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const monthIndex = (token: string): number => {
  const t = token.toLowerCase().replace(/\./g, '');
  if (t.length < 3) return -1;
  return MONTHS.findIndex(m => m.startsWith(t.slice(0, 3)) && (t.length <= 3 || m.startsWith(t)));
};

const toSigned = (deg: number, min: number, sec: number, hemi: string): number => {
  const v = deg + min / 60 + sec / 3600;
  return /[sw]/i.test(hemi) ? -v : v;
};

/**
 * Parse printed coordinates in any common chart format. Returns null unless
 * BOTH a latitude and a longitude are found, so stray numbers never become a
 * location. Supported:
 *
 *   74w35, 41n07            Astro.com: degrees, hemisphere letter, minutes[, seconds]
 *   41n07'12  74w35'40      same with seconds
 *   41°07'N 74°35'W         DMS with trailing hemisphere
 *   N41°07' W074°35'        DMS with leading hemisphere
 *   41.1167N 74.5833W       decimal with hemisphere
 *   lat 41.1167 lon -74.5833, Latitude: 41.12 Longitude: -74.58
 *   41.1167, -74.5833       signed decimal pair (both with decimals)
 */
export const parseSourceCoordinates = (raw: string | null | undefined): SourceCoordinates | null => {
  if (!raw) return null;
  const text = String(raw).replace(/[\u2032\u2019`]/g, "'").replace(/[\u2033\u201d]/g, '"').replace(/[º]/g, '°');

  // 1) Astro.com style: 41n07, 74w35, optionally with seconds (41n07'12 or 41n0712).
  const astro = /\b(\d{1,3})\s*([nsew])\s*(\d{1,2})(?:['\s]\s*(\d{1,2}))?(?![a-z\d])/gi;
  const astroHits: Array<{ value: number; hemi: string; hasSec: boolean; text: string }> = [];
  for (const m of text.matchAll(astro)) {
    const deg = +m[1];
    const min = +m[3];
    const sec = m[4] !== undefined ? +m[4] : 0;
    const hemi = m[2].toLowerCase();
    if (min > 59 || sec > 59) continue;
    if ((hemi === 'n' || hemi === 's') && deg > 90) continue;
    if ((hemi === 'e' || hemi === 'w') && deg > 180) continue;
    astroHits.push({ value: toSigned(deg, min, sec, hemi), hemi, hasSec: m[4] !== undefined, text: m[0].trim() });
  }
  const aLat = astroHits.find(h => h.hemi === 'n' || h.hemi === 's');
  const aLon = astroHits.find(h => h.hemi === 'e' || h.hemi === 'w');
  if (aLat && aLon) {
    return {
      latitude: aLat.value, longitude: aLon.value,
      text: `${aLon.text}, ${aLat.text}`.replace(/\s+/g, ''),
      precision: aLat.hasSec || aLon.hasSec ? 'second' : 'minute',
    };
  }

  // 2) DMS with trailing hemisphere: 41°07'12"N or 41°07'N or 41° N
  const trailing = /(\d{1,3})\s*°\s*(?:(\d{1,2})\s*'?\s*(?:(\d{1,2}(?:\.\d+)?)\s*"?)?)?\s*([NSEW])\b/g;
  // 3) DMS with leading hemisphere: N41°07'12" or N 41°07'
  const leading = /\b([NSEW])\s*(\d{1,3})\s*°\s*(?:(\d{1,2})\s*'?\s*(?:(\d{1,2}(?:\.\d+)?)\s*"?)?)?/g;
  const dms: Array<{ value: number; hemi: string; precision: SourceCoordinates['precision']; text: string }> = [];
  for (const m of text.matchAll(trailing)) {
    const deg = +m[1], min = m[2] !== undefined ? +m[2] : 0, sec = m[3] !== undefined ? +m[3] : 0;
    if (min > 59 || sec >= 60) continue;
    dms.push({ value: toSigned(deg, min, sec, m[4]), hemi: m[4].toLowerCase(), precision: m[3] !== undefined ? 'second' : m[2] !== undefined ? 'minute' : 'degree', text: m[0].trim() });
  }
  for (const m of text.matchAll(leading)) {
    const deg = +m[2], min = m[3] !== undefined ? +m[3] : 0, sec = m[4] !== undefined ? +m[4] : 0;
    if (min > 59 || sec >= 60) continue;
    dms.push({ value: toSigned(deg, min, sec, m[1]), hemi: m[1].toLowerCase(), precision: m[4] !== undefined ? 'second' : m[3] !== undefined ? 'minute' : 'degree', text: m[0].trim() });
  }
  const dLat = dms.find(h => (h.hemi === 'n' || h.hemi === 's') && Math.abs(h.value) <= 90);
  const dLon = dms.find(h => (h.hemi === 'e' || h.hemi === 'w') && Math.abs(h.value) <= 180);
  if (dLat && dLon) {
    const precision: SourceCoordinates['precision'] =
      dLat.precision === 'second' || dLon.precision === 'second' ? 'second'
        : dLat.precision === 'minute' || dLon.precision === 'minute' ? 'minute' : 'degree';
    return { latitude: dLat.value, longitude: dLon.value, text: `${dLat.text}, ${dLon.text}`, precision };
  }

  // 4) Decimal with hemisphere letters: 41.1167N 74.5833W (or "41.1167 N").
  const decHemi = /(\d{1,3}\.\d+)\s*°?\s*([NSEW])\b/g;
  const dh: Array<{ value: number; hemi: string; text: string }> = [];
  for (const m of text.matchAll(decHemi)) dh.push({ value: toSigned(+m[1], 0, 0, m[2]), hemi: m[2].toLowerCase(), text: m[0] });
  const hLat = dh.find(h => (h.hemi === 'n' || h.hemi === 's') && Math.abs(h.value) <= 90);
  const hLon = dh.find(h => (h.hemi === 'e' || h.hemi === 'w') && Math.abs(h.value) <= 180);
  if (hLat && hLon) return { latitude: hLat.value, longitude: hLon.value, text: `${hLat.text}, ${hLon.text}`, precision: 'decimal' };

  // 5) Labeled decimals: lat 41.1167 / latitude: 41.1167 ; lon -74.5833 / longitude -74.5833
  const latM = text.match(/\blat(?:itude)?\b\s*[:=]?\s*(-?\d{1,3}(?:\.\d+)?)/i);
  const lonM = text.match(/\blon(?:g|gitude)?\b\.?\s*[:=]?\s*(-?\d{1,3}(?:\.\d+)?)/i);
  if (latM && lonM) {
    const la = +latM[1], lo = +lonM[1];
    if (Math.abs(la) <= 90 && Math.abs(lo) <= 180) return { latitude: la, longitude: lo, text: `${latM[0]}, ${lonM[0]}`, precision: 'decimal' };
  }

  // 6) Signed decimal pair: 41.1167, -74.5833 (both must carry decimals).
  const pair = text.match(/(?<![\d.])(-?\d{1,2}\.\d{2,})\s*,\s*(-?\d{1,3}\.\d{2,})(?![\d.])/);
  if (pair) {
    const la = +pair[1], lo = +pair[2];
    if (Math.abs(la) <= 90 && Math.abs(lo) <= 180) return { latitude: la, longitude: lo, text: pair[0], precision: 'decimal' };
  }

  return null;
};

/** Remove any printed coordinate tokens from a place string. */
export const stripCoordinateText = (raw: string): string =>
  raw
    .replace(/\b\d{1,3}\s*[nsew]\s*\d{1,2}(?:['\s]\s*\d{1,2})?(?![a-z\d])/gi, ' ')
    .replace(/\d{1,3}\s*[°º]\s*(?:\d{1,2}\s*['\u2032]?\s*(?:\d{1,2}(?:\.\d+)?\s*["\u2033]?)?)?\s*[NSEW]\b/g, ' ')
    .replace(/\b[NSEW]\s*\d{1,3}\s*[°º]\s*(?:\d{1,2}\s*['\u2032]?\s*(?:\d{1,2}(?:\.\d+)?\s*["\u2033]?)?)?/g, ' ')
    .replace(/\s*,\s*,+/g, ',')
    .replace(/^[\s,]+|[\s,]+$/g, '')
    .replace(/\s+/g, ' ');

export interface AstroHeader {
  name?: string;
  /** YYYY-MM-DD, local civil date at the birthplace. */
  birthDate?: string;
  /** HH:MM or HH:MM:SS, local civil time. */
  birthTime?: string;
  /** Full place text exactly as the source qualified it (county, state, country). */
  placeText?: string;
  coordinates?: SourceCoordinates | null;
  /** Universal time the source printed, HH:MM[:SS], for cross-checking the zone. */
  universalTime?: string;
  houseSystem?: 'placidus' | 'whole-sign' | 'equal' | 'porphyry' | 'koch' | 'regiomontanus' | 'campanus';
  sex?: 'male' | 'female';
}

const pad = (n: number) => String(n).padStart(2, '0');

const findDate = (text: string): { iso: string; index: number; length: number } | null => {
  // "29 Aug 1964", "29 August 1964", "29. August 1964"
  let m = /\b(\d{1,2})\.?\s+([A-Za-z]{3,9})\.?\s+(\d{4})\b/.exec(text);
  if (m) {
    const mi = monthIndex(m[2]);
    if (mi >= 0) return { iso: `${m[3]}-${pad(mi + 1)}-${pad(+m[1])}`, index: m.index, length: m[0].length };
  }
  // "August 29, 1964", "Aug 29 1964"
  m = /\b([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})\b/.exec(text);
  if (m) {
    const mi = monthIndex(m[1]);
    if (mi >= 0) return { iso: `${m[3]}-${pad(mi + 1)}-${pad(+m[2])}`, index: m.index, length: m[0].length };
  }
  // ISO 1964-08-29
  m = /\b(\d{4})-(\d{2})-(\d{2})\b/.exec(text);
  if (m) return { iso: `${m[1]}-${m[2]}-${m[3]}`, index: m.index, length: m[0].length };
  // European 29.8.1964 / 29.08.1964
  m = /\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/.exec(text);
  if (m) return { iso: `${m[3]}-${pad(+m[2])}-${pad(+m[1])}`, index: m.index, length: m[0].length };
  return null;
};

const findTime = (text: string): { hhmm: string; index: number; length: number } | null => {
  // 6:45 p.m. / 6:45 pm / 6:45pm / 6:45:30 PM
  let m = /\b(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([ap])\.?\s?m\.?(?![a-z])/i.exec(text);
  if (m) {
    let h = +m[1] % 12;
    if (m[4].toLowerCase() === 'p') h += 12;
    const s = m[3] !== undefined ? `:${m[3]}` : '';
    if (+m[2] < 60) return { hhmm: `${pad(h)}:${m[2]}${s}`, index: m.index, length: m[0].length };
  }
  // 18:45 or 18:45:30 (24h)
  m = /\b(\d{1,2}):(\d{2})(?::(\d{2}))?\b/.exec(text);
  if (m && +m[1] < 24 && +m[2] < 60) {
    const s = m[3] !== undefined ? `:${m[3]}` : '';
    return { hhmm: `${pad(+m[1])}:${m[2]}${s}`, index: m.index, length: m[0].length };
  }
  return null;
};

/**
 * Pull the birth data header out of pasted or scanned chart text. Every field
 * is optional; the caller decides what to fill. The place text keeps every
 * qualifier the source printed: "Franklin (Sussex County), NJ (US)" stays
 * exactly that, never "Franklin".
 */
export const parseAstroComHeader = (raw: string | null | undefined): AstroHeader => {
  const out: AstroHeader = {};
  if (!raw) return out;
  let text = String(raw).replace(/\r/g, '').replace(/[\u00a0\t]+/g, ' ');

  // Universal time and sidereal time are pulled out first so their clock
  // values are never mistaken for the birth time.
  const ut = /\b(?:Univ(?:ersal)?\.?\s*Time|UT|UTC|GMT)\s*[:=]?\s*(\d{1,2}):(\d{2})(?::(\d{2}))?/i.exec(text);
  if (ut && +ut[1] < 24 && +ut[2] < 60) {
    out.universalTime = `${pad(+ut[1])}:${ut[2]}${ut[3] !== undefined ? `:${ut[3]}` : ''}`;
    text = text.slice(0, ut.index) + ' ' + text.slice(ut.index + ut[0].length);
  }
  text = text.replace(/\bSid(?:ereal)?\.?\s*Time\s*[:=]?\s*\d{1,2}:\d{2}(?::\d{2})?/gi, ' ');

  const hs = /\b(Placidus|Whole\s*Sign|Equal|Porphyry|Koch|Regiomontanus|Campanus)\b/i.exec(text);
  if (hs) {
    const k = hs[1].toLowerCase().replace(/\s+/g, '-');
    out.houseSystem = (k === 'whole-sign' || k === 'wholesign' ? 'whole-sign' : k) as AstroHeader['houseSystem'];
  }
  const sex = /\((male|female)\)/i.exec(text);
  if (sex) out.sex = sex[1].toLowerCase() as AstroHeader['sex'];

  out.coordinates = parseSourceCoordinates(text);

  // Work on the header region only: the text up to the first planet line.
  const headerEnd = text.search(/\n\s*(?:Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto|☉|☽|Planet|Houses?)\b/i);
  const header = headerEnd > 0 ? text.slice(0, headerEnd) : text;

  const date = findDate(header);
  if (date) out.birthDate = date.iso;

  const afterDate = date ? header.slice(date.index + date.length) : header;
  const time = findTime(afterDate);
  if (time) out.birthTime = time.hhmm;

  // Name: whatever precedes "born" on the first line, minus prefixes.
  const nameM = /^(?:\s*(?:Horoscope|Chart|Natal Chart|Data)\s*(?:for|of)?\s*:?\s*)?([^\n,(]+?)\s*(?:\((?:male|female)\))?\s*,?\s*\bborn\b/im.exec(header);
  if (nameM) {
    const n = nameM[1].trim();
    if (n && n.length <= 80 && !/^\d/.test(n)) out.name = n;
  }

  // Place: after the time token, "in <place>" or ", <place>", ending at the
  // coordinates, a newline, or a known trailing label.
  if (time) {
    let rest = afterDate.slice(time.index + time.length);
    rest = rest.replace(/^\s*(?:,|\bin\b|\bat\b)?\s*/i, '');
    // Stop at a newline, at the coordinates, or at trailing labels.
    const stop = rest.search(/\n|\bPlacidus\b|\bKoch\b|\bWhole\s*Sign\b|\bEqual\b|\bMethod\b|\bType\b|\bHouse\s*system\b|\bSid\b|\bUniv\b/i);
    let place = (stop >= 0 ? rest.slice(0, stop) : rest).trim();
    place = stripCoordinateText(place);
    place = place.replace(/^[\s,;:]+|[\s,;:]+$/g, '').trim();
    if (place && place.length <= 160 && /[A-Za-z]/.test(place)) out.placeText = place;
  } else if (!time && date) {
    // No time: "born 29 Aug 1964 in Franklin, NJ"
    const m = /\bin\s+([^\n]+)/i.exec(afterDate);
    if (m) {
      const place = stripCoordinateText(m[1]).replace(/^[\s,;:]+|[\s,;:]+$/g, '').trim();
      if (place && /[A-Za-z]/.test(place)) out.placeText = place;
    }
  }

  return out;
};

/**
 * "Richer" place text keeps more qualifiers than the other: a state, county
 * or country the shorter one lacks. Used so an import never overwrites a
 * fuller place with a bare town name, and does upgrade a bare town name to
 * the full one.
 */
export const isRicherPlaceText = (candidate: string | null | undefined, current: string | null | undefined): boolean => {
  const a = (candidate || '').trim();
  const b = (current || '').trim();
  if (!a) return false;
  if (!b) return true;
  const norm = (s: string) => s.toLowerCase().replace(/[().]/g, ' ').replace(/\s+/g, ' ').trim();
  const na = norm(a), nb = norm(b);
  if (na === nb) return false;
  const tokens = (s: string) => new Set(s.split(/[\s,]+/).filter(Boolean));
  const ta = tokens(na), tb = tokens(nb);
  // The candidate must contain everything the current text has, plus more.
  for (const t of tb) if (!ta.has(t)) return false;
  return ta.size > tb.size;
};

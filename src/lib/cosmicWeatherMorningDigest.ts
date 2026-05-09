/**
 * Morning Cosmic Weather digest — HTML email body.
 * Layout inspired by the in-app Today's Cosmic Weather card, mockup-driven.
 *
 * STRICT RULE: pulls every value from existing app infrastructure
 * (astrology.ts, cosmicWeatherSkyBlock.ts, transitAspects.ts,
 * houseCalculations.ts, voidOfCourseMoon.ts). No new ephemeris math.
 */

import * as Astronomy from 'astronomy-engine';
import {
  getMoonPhase,
  getPlanetaryPositions,
  calculateDailyAspects,
  getDayType,
} from './astrology';
import {
  findNextMoonSignChange,
  getVOCMoonDetails,
  formatVOCTime,
} from './voidOfCourseMoon';
import {
  buildSkyEntries,
  getEasternDateAtTime,
  getEasternMidnightDate,
  type SkyEntry,
} from './cosmicWeatherSkyBlock';
import { getTransitPlanetHouse, HOUSE_MEANINGS } from './houseCalculations';
import {
  calculateTransitAspects,
  getTopTransitAspects,
  ASPECT_TYPES,
  getTransitPlanetSymbol,
  type TransitAspect,
} from './transitAspects';
import { getPersonalizedTransitInterpretation } from './personalizedTransitInterpretations';
import type { NatalChart } from '@/hooks/useNatalChart';

const SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

const SIGN_SYMBOL: Record<string, string> = {
  Aries:'♈', Taurus:'♉', Gemini:'♊', Cancer:'♋', Leo:'♌', Virgo:'♍',
  Libra:'♎', Scorpio:'♏', Sagittarius:'♐', Capricorn:'♑', Aquarius:'♒', Pisces:'♓',
};

const ASPECT_GLYPH: Record<string, string> = {
  conjunction:'☌', sextile:'⚹', square:'□', trine:'△', opposition:'☍',
  quincunx:'⚻', semisextile:'⚺',
};

// ─── Visual tokens (inline so emails render without external CSS) ────
const COLOR = {
  bg: '#FAF7F2',
  card: '#FFFFFF',
  border: '#E8E4DD',
  text: '#1F1B16',
  muted: '#6B675F',
  faint: '#9A9389',
  accent: '#6B46C1',
  accentSoft: '#EFEAFB',
};

const FONT = `"Iowan Old Style","Palatino Linotype",Georgia,serif`;
const SANS = `-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif`;

export interface MorningDigestArgs {
  date: Date;
  natalChart: NatalChart | null;
  recipientName?: string;
  /** Optional override for the collective sky section. If provided, this
   *  HTML/prose replaces the auto-generated collective copy. Used to inject
   *  the cosmic-weather AI prose so we don't generate it twice. */
  collectiveProseHTML?: string;
  /** Optional override for the "What Matters Most" items. If provided, these
   *  items (already AI-generated and whitelist-validated against the day's
   *  transit array) replace the deterministic personalized fallback. */
  whatMattersItems?: Array<{ headline: string; body: string }>;
}

// ─── Helpers ────────────────────────────────────────────────────────

const ordinal = (n: number) => {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return `${n}${s[(v-20)%10] || s[v] || s[0]}`;
};

const fmtDeg = (d: number, m = 0) =>
  `${Math.floor(d)}°${String(m).padStart(2,'0')}'`;

const fmtET = (value: Date, includeMin = true) =>
  value.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    ...(includeMin ? { minute: '2-digit' } : {}),
  });

const fmtETDate = (value: Date) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).format(value);

function moonLongitude(date: Date): number {
  const m = Astronomy.GeoMoon(date);
  return Astronomy.Ecliptic(m).elon;
}

function fromLongitude(lon: number): { sign: string; deg: number; min: number } {
  const norm = ((lon % 360) + 360) % 360;
  const idx = Math.floor(norm / 30);
  const inSign = norm - idx * 30;
  let deg = Math.floor(inSign);
  let min = Math.round((inSign - deg) * 60);
  if (min === 60) { deg += 1; min = 0; }
  return { sign: SIGNS[idx % 12], deg, min };
}

function signDegToLongitude(sign: string, deg: number, min = 0): number {
  return SIGNS.indexOf(sign) * 30 + deg + min / 60;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ─── Section 1: Sky at noon, in your natal houses ───────────────────

function planetGridHTML(date: Date, chart: NatalChart | null): string {
  const noon = getEasternDateAtTime(date, 12, 0);
  // Reuse existing buildSkyEntries logic — but anchored at noon.
  // buildSkyEntries hardcodes midnight, so we recompute via the same
  // primitives (longitudeOf is internal). We use astronomy-engine here
  // for parity; this is the same code that powers buildSkyEntries.
  const positions = getPlanetaryPositions(noon);
  const order: { key: keyof typeof positions; label: string; symbol: string }[] = [
    { key: 'sun', label: 'Sun', symbol: '☉' },
    { key: 'moon', label: 'Moon', symbol: '☽' },
    { key: 'mercury', label: 'Mercury', symbol: '☿' },
    { key: 'venus', label: 'Venus', symbol: '♀' },
    { key: 'mars', label: 'Mars', symbol: '♂' },
    { key: 'jupiter', label: 'Jupiter', symbol: '♃' },
    { key: 'saturn', label: 'Saturn', symbol: '♄' },
    { key: 'uranus', label: 'Uranus', symbol: '♅' },
    { key: 'neptune', label: 'Neptune', symbol: '♆' },
    { key: 'pluto', label: 'Pluto', symbol: '♇' },
  ];

  // Use the deterministic retrograde flag from buildSkyEntries (midnight is fine
  // for the daily R label — no planet flips status mid-day).
  const retroMap = new Map<string, boolean>(
    buildSkyEntries(date).map(e => [e.label, e.retrograde]),
  );

  const cards = order.map(p => {
    const pos = positions[p.key] as any;
    const sign = pos.signName;
    const deg = pos.degree;
    const min = pos.minutes || 0;
    const retro = retroMap.get(p.label);
    const house = chart ? getTransitPlanetHouse(sign, deg, chart) : null;
    const houseInfo = house ? HOUSE_MEANINGS[house] : null;
    const houseLine = houseInfo
      ? `<div style="font-size:11px;color:${COLOR.muted};margin-top:6px;line-height:1.4">
          Your <span style="color:${COLOR.accent}">${ordinal(house!)} house</span>
          · ${escapeHtml(houseInfo.keywords.toLowerCase())}
        </div>`
      : '';
    return `
      <td style="vertical-align:top;padding:6px;width:25%">
        <div style="background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:6px;padding:12px 14px">
          <div style="font-size:11px;color:${COLOR.faint};letter-spacing:0.04em;display:flex;align-items:center;gap:6px">
            <span style="font-size:14px;color:${COLOR.text}">${p.symbol}</span>
            <span>${p.label}</span>
          </div>
          <div style="font-size:15px;font-weight:600;color:${COLOR.text};margin-top:4px">
            ${fmtDeg(deg, min)} ${escapeHtml(sign)}${retro ? ' <span style="color:'+COLOR.muted+';font-weight:400">℞</span>' : ''}
          </div>
          ${houseLine}
        </div>
      </td>`;
  });

  // 4-column rows
  const rows: string[] = [];
  for (let i = 0; i < cards.length; i += 4) {
    rows.push(`<tr>${cards.slice(i, i + 4).join('')}</tr>`);
  }

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:separate;border-spacing:0">
      ${rows.join('')}
    </table>`;
}

// ─── Section 2: Moon's arc through the day ──────────────────────────
//
// New behavior:
// - If Moon stays in same sign AND same natal house all day, render ONE
//   summary line with the degree range it covered.
// - Otherwise, render an event timeline: starting position, sign changes,
//   house changes, and any EXACT aspects to natal points (orb < 0.5°),
//   ending with the closing position.

interface ArcEvent {
  time: Date;
  kind: 'sign' | 'house' | 'aspect';
  html: string;
}

function moonArcHTML(date: Date, chart: NatalChart | null): string {
  const midnight = getEasternMidnightDate(date);
  const end = getEasternDateAtTime(date, 23, 59);
  const moonPhase = getMoonPhase(midnight);
  const voc = getVOCMoonDetails(midnight);

  const startPos = fromLongitude(moonLongitude(midnight));
  const endPos = fromLongitude(moonLongitude(end));
  const startHouse = chart ? getTransitPlanetHouse(startPos.sign, startPos.deg, chart) : null;
  const endHouse = chart ? getTransitPlanetHouse(endPos.sign, endPos.deg, chart) : null;

  // Walk samples to find sign/house transition timestamps.
  const STEP_MS = 15 * 60 * 1000;
  const events: ArcEvent[] = [];
  let lastSign = startPos.sign;
  let lastHouse = startHouse;
  for (let t = midnight.getTime() + STEP_MS; t <= end.getTime(); t += STEP_MS) {
    const dt = new Date(t);
    const p = fromLongitude(moonLongitude(dt));
    const h = chart ? getTransitPlanetHouse(p.sign, p.deg, chart) : null;
    if (p.sign !== lastSign) {
      const houseInfo = h ? HOUSE_MEANINGS[h] : null;
      events.push({
        time: dt,
        kind: 'sign',
        html: `<span style="font-weight:600">☽ enters ${escapeHtml(p.sign)}</span>${
          h && h !== lastHouse
            ? ` <span style="color:${COLOR.muted}">· crosses into your <span style="color:${COLOR.accent}">${ordinal(h)} house</span>${houseInfo ? ` · ${escapeHtml(houseInfo.keywords.toLowerCase())}` : ''}</span>`
            : ''
        }`,
      });
      lastSign = p.sign;
      lastHouse = h;
      continue;
    }
    if (h !== lastHouse && h) {
      const houseInfo = HOUSE_MEANINGS[h];
      events.push({
        time: dt,
        kind: 'house',
        html: `<span style="font-weight:600">☽ crosses into your <span style="color:${COLOR.accent}">${ordinal(h)} house</span></span>${houseInfo ? ` <span style="color:${COLOR.muted}">· ${escapeHtml(houseInfo.keywords.toLowerCase())}</span>` : ''}`,
      });
      lastHouse = h;
    }
  }

  // Exact aspects to natal points during the day (orb < 0.5°).
  if (chart) {
    const exact = scanMoonHits(date, chart).filter(h => h.orb < 0.5);
    for (const h of exact) {
      const aspectWord = h.aspect;
      events.push({
        time: h.time,
        kind: 'aspect',
        html: `<span style="font-weight:600">☽ ${ASPECT_GLYPH[aspectWord] || aspectWord} natal ${escapeHtml(h.natalPlanet)}</span> <span style="color:${COLOR.muted}">in ${escapeHtml(h.natalSign)}${h.natalHouse ? `, your <span style="color:${COLOR.accent}">${ordinal(h.natalHouse)} house</span>` : ''} · ${h.orb.toFixed(1)}° orb</span>`,
      });
    }
  }

  events.sort((a, b) => a.time.getTime() - b.time.getTime());

  const tags: string[] = [];
  tags.push(`${escapeHtml(moonPhase.phaseName)} · ${Math.round(moonPhase.illumination * 100)}% illuminated`);
  if (voc.isCurrentlyVOC && voc.end) {
    tags.push(`Currently void of course until ${formatVOCTime(voc.end)} ET`);
  } else if (voc.isVOC && voc.start && voc.end) {
    tags.push(`VOC ${formatVOCTime(voc.start)} → ${formatVOCTime(voc.end)} ET`);
  }
  const tagHTML = tags
    .map(t => `<span style="display:inline-block;background:${COLOR.bg};border:1px solid ${COLOR.border};border-radius:999px;padding:4px 10px;font-size:11px;color:${COLOR.muted};margin:6px 6px 0 0">${t}</span>`)
    .join('');

  // Quiet day: no events, same sign and house all day.
  const sameSign = startPos.sign === endPos.sign;
  const sameHouse = startHouse === endHouse;
  if (events.length === 0 && sameSign && sameHouse) {
    const houseInfo = startHouse ? HOUSE_MEANINGS[startHouse] : null;
    const houseLine = startHouse
      ? ` · your <span style="color:${COLOR.accent}">${ordinal(startHouse)} house</span>${houseInfo ? ` · ${escapeHtml(houseInfo.keywords.toLowerCase())}` : ''}`
      : '';
    return `
      <div style="background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:6px;overflow:hidden">
        <div style="padding:14px 16px">
          <div style="font-size:14px;color:${COLOR.text};line-height:1.55">
            <span style="font-weight:600">☽ stays in ${escapeHtml(startPos.sign)} all day</span>${houseLine}
          </div>
          <div style="font-size:12px;color:${COLOR.muted};margin-top:6px">
            Drifts from ${fmtDeg(startPos.deg, startPos.min)} (12:00 AM ET) to ${fmtDeg(endPos.deg, endPos.min)} (11:59 PM ET).
          </div>
        </div>
        <div style="padding:10px 14px 14px;border-top:1px solid ${COLOR.border}">${tagHTML}</div>
      </div>`;
  }

  // Event timeline.
  const startHouseInfo = startHouse ? HOUSE_MEANINGS[startHouse] : null;

  // Daily overview line so the user always knows what sign/house ☽ is in
  // before reading individual natal-house hits in the table.
  const endHouseInfo = endHouse ? HOUSE_MEANINGS[endHouse] : null;
  const overviewParts: string[] = [];
  if (sameSign) {
    overviewParts.push(`☽ is in <span style="font-weight:600">${escapeHtml(startPos.sign)}</span> all day`);
  } else {
    overviewParts.push(`☽ moves from <span style="font-weight:600">${escapeHtml(startPos.sign)}</span> to <span style="font-weight:600">${escapeHtml(endPos.sign)}</span>`);
  }
  if (sameHouse && startHouse) {
    overviewParts.push(`moving through your <span style="color:${COLOR.accent};font-weight:600">${ordinal(startHouse)} house</span>${startHouseInfo ? ` · ${escapeHtml(startHouseInfo.keywords.toLowerCase())}` : ''}`);
  } else if (!sameHouse && startHouse && endHouse) {
    overviewParts.push(`moving through your <span style="color:${COLOR.accent};font-weight:600">${ordinal(startHouse)} house</span>${startHouseInfo ? ` · ${escapeHtml(startHouseInfo.keywords.toLowerCase())}` : ''} → <span style="color:${COLOR.accent};font-weight:600">${ordinal(endHouse)} house</span>${endHouseInfo ? ` · ${escapeHtml(endHouseInfo.keywords.toLowerCase())}` : ''}`);
  }
  const overviewHTML = overviewParts.join(', ');

  const startLine = `
    <tr>
      <td style="padding:10px 14px;font-size:12px;color:${COLOR.muted};white-space:nowrap;width:90px">12:00 AM</td>
      <td style="padding:10px 14px;font-size:13px;color:${COLOR.text}">
        <span style="font-weight:600">☽ ${fmtDeg(startPos.deg, startPos.min)} ${escapeHtml(startPos.sign)}</span>${
          startHouse
            ? `<span style="color:${COLOR.muted}"> · your <span style="color:${COLOR.accent}">${ordinal(startHouse)} house</span>${startHouseInfo ? ` · ${escapeHtml(startHouseInfo.keywords.toLowerCase())}` : ''}</span>`
            : ''
        }
      </td>
    </tr>`;

  const eventRows = events.map(e => `
    <tr>
      <td style="padding:8px 14px;background:${COLOR.accentSoft};border-top:1px solid ${COLOR.border};border-bottom:1px solid ${COLOR.border};font-size:12px;color:${COLOR.accent};font-weight:600;white-space:nowrap;width:90px">${fmtET(e.time)}</td>
      <td style="padding:8px 14px;background:${COLOR.accentSoft};border-top:1px solid ${COLOR.border};border-bottom:1px solid ${COLOR.border};font-size:13px;color:${COLOR.text}">${e.html}</td>
    </tr>`).join('');

  const endLine = `
    <tr>
      <td style="padding:10px 14px;font-size:12px;color:${COLOR.muted};white-space:nowrap;width:90px">11:59 PM</td>
      <td style="padding:10px 14px;font-size:13px;color:${COLOR.text}">
        <span style="font-weight:600">☽ ${fmtDeg(endPos.deg, endPos.min)} ${escapeHtml(endPos.sign)}</span>${
          endHouse
            ? `<span style="color:${COLOR.muted}"> · your <span style="color:${COLOR.accent}">${ordinal(endHouse)} house</span>${endHouseInfo ? ` · ${escapeHtml(endHouseInfo.keywords.toLowerCase())}` : ''}</span>`
            : ''
        }
      </td>
    </tr>`;

  return `
    <div style="background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:6px;overflow:hidden">
      <div style="padding:12px 16px;background:${COLOR.accentSoft};border-bottom:1px solid ${COLOR.border};font-size:13px;color:${COLOR.text}">
        ${overviewHTML}
      </div>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse">
        ${startLine}
        ${eventRows}
        ${endLine}
      </table>
      <div style="padding:10px 14px 14px;border-top:1px solid ${COLOR.border}">${tagHTML}</div>
    </div>`;
}

// ─── Section 2b: Other transits — outer planets to inner natal ──────

// Professional transit interpretation: transiting planet (what's happening now)
// → natal planet (what part of you it activates) → aspect (how it feels)
// → transiting house (where it shows up externally) → natal house (where it
// connects internally) → sign (style/temperament). 2–4 grounded sentences, no
// therapy filler, no "the lesson is", no "integrating".

const TRANSIT_PLANET_THEME: Record<string, string> = {
  Jupiter: 'expansion, opportunity, and a pull to grow or take more space',
  Saturn: 'pressure to get serious, define limits, and meet a real responsibility',
  Uranus: 'sudden change, restlessness, and a need to break a pattern',
  Neptune: 'blurring, longing, and a softer, less defined sense of things',
  Pluto: 'a slow, undeniable shift in power, control, and what you can no longer fake',
  Chiron: 'an old sore spot getting touched and asking to be handled honestly',
};

const NATAL_PLANET_PART: Record<string, string> = {
  Sun: 'your core identity and how you want to show up',
  Moon: 'your emotional baseline and what makes you feel safe',
  Mercury: 'how you think, talk, and decide',
  Venus: 'what you value, who you love, and how you relate',
  Mars: 'your drive, anger, and how you go after what you want',
  Ascendant: 'how you meet the world and what people see first',
  Midheaven: 'your public role, career direction, and reputation',
};

const ASPECT_FEEL: Record<string, string> = {
  conjunction: 'It feels fused — the two energies are stuck together and hard to separate.',
  opposition: 'It plays out as a tug-of-war, often through another person mirroring it back.',
  square: 'There is friction and pressure to act; something has to give.',
  trine: 'The flow is easy, almost too easy — it can pass without you noticing the gift.',
  sextile: 'There is an opening if you reach for it, but it will not force itself.',
  quincunx: 'It feels off-axis — two parts of you that do not quite speak the same language.',
  semisextile: 'A low, persistent itch — small adjustments rather than a big event.',
};

const HOUSE_LIFE_AREA: Record<number, string> = {
  1: 'how you present yourself and your body',
  2: 'money, resources, and self-worth',
  3: 'daily communication, siblings, short trips, and your immediate environment',
  4: 'home, family, and your private inner base',
  5: 'creativity, romance, children, and play',
  6: 'work routines, health, and daily service',
  7: 'one-on-one relationships and partnerships',
  8: 'shared resources, intimacy, and what you inherit or owe',
  9: 'beliefs, study, travel, and the bigger picture',
  10: 'career, public role, and reputation',
  11: 'friends, groups, and long-range hopes',
  12: 'private inner life, retreat, and what works behind the scenes',
};

const SIGN_TONE: Record<string, string> = {
  Aries: 'direct, fast, and a little combative',
  Taurus: 'steady, sensory, and slow to move',
  Gemini: 'curious, talkative, and easily split',
  Cancer: 'protective, moody, and family-tinged',
  Leo: 'expressive, proud, and wanting to be seen',
  Virgo: 'precise, analytical, and quietly self-critical',
  Libra: 'relational, fair-minded, and conflict-averse',
  Scorpio: 'intense, private, and all-or-nothing',
  Sagittarius: 'restless, philosophical, and looking for meaning',
  Capricorn: 'serious, ambitious, and structure-seeking',
  Aquarius: 'detached, principled, and pattern-breaking',
  Pisces: 'porous, dreamy, and emotionally absorbent',
};

function professionalTransitInterpretation(a: TransitAspect): string {
  const tTheme = TRANSIT_PLANET_THEME[a.transitPlanet] || `a ${a.transitPlanet} influence`;
  const nPart = NATAL_PLANET_PART[a.natalPlanet] || `your natal ${a.natalPlanet}`;
  const feel = ASPECT_FEEL[a.aspect] || '';
  const tHouseArea = a.transitHouse ? HOUSE_LIFE_AREA[a.transitHouse] : null;
  const nHouseArea = a.natalHouse ? HOUSE_LIFE_AREA[a.natalHouse] : null;
  const tone = SIGN_TONE[a.transitSign] || '';
  const phase = a.applying ? 'building toward exact' : 'past peak, but the residue is still active';

  const s1 = `Right now ${a.transitPlanet} is bringing ${tTheme}, and it is landing on ${nPart}.`;
  const s2 = feel;
  const s3 = tHouseArea && nHouseArea
    ? `Externally it shows up around ${tHouseArea}; internally it touches ${nHouseArea}.`
    : tHouseArea
      ? `It tends to show up externally around ${tHouseArea}.`
      : nHouseArea
        ? `Inside, it is hitting the part of you that holds ${nHouseArea}.`
        : '';
  const s4 = tone
    ? `The flavor is ${tone}, and the transit is ${phase}.`
    : `The transit is ${phase}.`;

  return [s1, s2, s3, s4].filter(Boolean).join(' ');
}

const OTHER_TRANSIT_OUTERS = new Set(['Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron']);
const OTHER_TRANSIT_INNERS = new Set(['Sun','Moon','Mercury','Venus','Mars','Ascendant','Midheaven']);
const OTHER_TRANSIT_ASPECT_LABEL: Record<string, string> = {
  conjunction: 'conjunct', opposition: 'opposite', trine: 'trine',
  square: 'square', sextile: 'sextile', quincunx: 'quincunx', semisextile: 'semisextile',
};

function otherTransitsHTML(date: Date, chart: NatalChart | null): string {
  if (!chart) {
    return `<div style="background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:6px;padding:14px;font-size:13px;color:${COLOR.muted}">
      No natal chart attached.
    </div>`;
  }
  const noon = getEasternDateAtTime(date, 12, 0);
  const positions = getPlanetaryPositions(noon);
  const aspects = calculateTransitAspects(noon, positions, chart);
  const filtered = aspects
    .filter(a => OTHER_TRANSIT_OUTERS.has(a.transitPlanet) && OTHER_TRANSIT_INNERS.has(a.natalPlanet))
    .sort((a, b) => parseFloat(a.orb) - parseFloat(b.orb))
    .slice(0, 6);

  if (filtered.length === 0) {
    return `<div style="background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:6px;padding:14px;font-size:13px;color:${COLOR.muted}">
      No outer-planet transits to your inner planets within orb today.
    </div>`;
  }

  const rows = filtered.map(a => {
    const tSym = getTransitPlanetSymbol(a.transitPlanet);
    const aspectWord = OTHER_TRANSIT_ASPECT_LABEL[a.aspect] || a.aspect;
    const natalHouseInfo = a.natalHouse ? HOUSE_MEANINGS[a.natalHouse] : null;
    return `
      <tr>
        <td style="padding:12px 14px;border-top:1px solid ${COLOR.border};vertical-align:top">
          <div style="font-size:13px;color:${COLOR.text};font-weight:600">
            Transiting ${tSym} ${escapeHtml(a.transitPlanet)} ${escapeHtml(aspectWord)} natal ${escapeHtml(a.natalPlanet)}
            <span style="font-weight:400;color:${COLOR.muted}"> · ${parseFloat(a.orb).toFixed(1)}° orb${a.applying ? ' applying' : ' separating'}</span>
          </div>
          <div style="font-size:12px;color:${COLOR.muted};margin-top:4px;line-height:1.5">
            Transiting ${escapeHtml(a.transitPlanet)} in ${escapeHtml(a.transitSign)}${a.transitHouse ? `, your <span style="color:${COLOR.accent}">${ordinal(a.transitHouse)} house</span>` : ''} · natal ${escapeHtml(a.natalPlanet)} in ${escapeHtml(a.natalSign)}${a.natalHouse ? `, your <span style="color:${COLOR.accent}">${ordinal(a.natalHouse)} house</span>${natalHouseInfo ? ` <span style="color:${COLOR.faint}">(${escapeHtml(natalHouseInfo.keywords.toLowerCase())})</span>` : ''}` : ''}
          </div>
          <div style="font-size:12px;color:${COLOR.text};margin-top:8px;line-height:1.6">${escapeHtml(professionalTransitInterpretation(a))}</div>
        </td>
      </tr>`;
  }).join('');

  return `
    <div style="background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:6px;overflow:hidden">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse">
        ${rows}
      </table>
    </div>`;
}


// ─── Section 3: Moon hits to natal chart, with timestamps ───────────

interface MoonHit {
  time: Date;
  natalPlanet: string;
  natalSign: string;
  natalDegree: number;
  natalMin: number;
  natalHouse: number | null;
  transitSign: string;
  transitDeg: number;
  transitHouse: number | null;
  aspect: string;
  orb: number;
}

function scanMoonHits(date: Date, chart: NatalChart): MoonHit[] {
  const start = getEasternMidnightDate(date);
  const end = getEasternDateAtTime(date, 23, 59);

  // Build natal planet list (mirrors calculateTransitAspects logic)
  const natalEntries: Array<{ name: string; longitude: number; sign: string; degree: number; min: number; house: number | null }> = [];
  for (const [name, p] of Object.entries(chart.planets || {})) {
    if (!p?.sign || name === 'Ascendant') continue;
    natalEntries.push({
      name,
      longitude: signDegToLongitude(p.sign, p.degree, p.minutes || 0),
      sign: p.sign,
      degree: p.degree,
      min: p.minutes || 0,
      house: getTransitPlanetHouse(p.sign, p.degree, chart),
    });
  }
  const h1 = chart.houseCusps?.house1;
  const ascData = h1?.sign ? h1 : chart.planets?.Ascendant;
  if (ascData?.sign) {
    natalEntries.push({
      name: 'Ascendant',
      longitude: signDegToLongitude(ascData.sign, ascData.degree, ascData.minutes || 0),
      sign: ascData.sign,
      degree: ascData.degree,
      min: ascData.minutes || 0,
      house: 1,
    });
  }

  const aspectAngles: Array<{ name: string; angle: number; orb: number }> = ASPECT_TYPES
    .filter(a => ['conjunction','opposition','trine','square','sextile'].includes(a.name))
    .map(a => ({ name: a.name, angle: a.angle, orb: 3 })); // tight orb for Moon hits

  const STEP_MS = 15 * 60 * 1000; // 15 min
  const samples: { t: Date; lon: number }[] = [];
  for (let t = start.getTime(); t <= end.getTime(); t += STEP_MS) {
    const dt = new Date(t);
    samples.push({ t: dt, lon: moonLongitude(dt) });
  }

  const hits: MoonHit[] = [];

  for (const natal of natalEntries) {
    for (const aspect of aspectAngles) {
      // Compute orb at each sample
      let bestIdx = -1;
      let bestOrb = Infinity;
      for (let i = 0; i < samples.length; i++) {
        let diff = Math.abs(samples[i].lon - natal.longitude);
        if (diff > 180) diff = 360 - diff;
        const o = Math.abs(diff - aspect.angle);
        if (o < bestOrb) { bestOrb = o; bestIdx = i; }
      }
      if (bestOrb <= aspect.orb && bestIdx >= 0) {
        const hitTime = samples[bestIdx].t;
        const hitLon = samples[bestIdx].lon;
        const tPos = fromLongitude(hitLon);
        const tHouse = getTransitPlanetHouse(tPos.sign, tPos.deg, chart);
        hits.push({
          time: hitTime,
          natalPlanet: natal.name,
          natalSign: natal.sign,
          natalDegree: natal.degree,
          natalMin: natal.min,
          natalHouse: natal.house,
          transitSign: tPos.sign,
          transitDeg: tPos.deg,
          transitHouse: tHouse,
          aspect: aspect.name,
          orb: bestOrb,
        });
      }
    }
  }

  hits.sort((a, b) => a.time.getTime() - b.time.getTime());
  return hits;
}

// Planet-specific felt-sense per aspect. Each entry is 1–2 sentences describing
// what the body/mind actually does, NOT recycled house-area boilerplate.
// Aspect families: 'hard' = conjunction/square/opposition, 'soft' = trine/sextile.
const MOON_HIT_FEEL: Record<string, { hard: string; soft: string }> = {
  Sun:        { hard: "Your mood and your core sense of self are out of step today. You may feel restless, like what you want emotionally and what you're trying to be aren't lining up.",
                soft: "Your feelings and your identity are on the same page. It's easy to act like yourself without second-guessing it." },
  Moon:       { hard: "Today's mood scrapes against your baseline emotional pattern — what you usually need to feel okay isn't quite available. Expect waves: hungry, then full; close, then needing distance.",
                soft: "Today's feelings line up with your normal emotional rhythm. You feel like yourself from the inside out, and your needs are simple to meet." },
  Mercury:    { hard: "Your feelings get loud right when you're trying to think or talk clearly. Expect tangled words, overthinking, or texts you'll want to rewrite.",
                soft: "It's easier than usual to put what you feel into words. Good window for honest conversations and saying the thing." },
  Venus:      { hard: "What you want and what you're actually getting from people don't match. Touchiness around love, money, or feeling undervalued is likely.",
                soft: "You feel warmer toward people and easier in your own skin. Affection, beauty, and small pleasures land softly." },
  Mars:       { hard: "A short fuse. Irritation, impatience, or a flash of anger that wants to pick a fight, slam a drawer, or push too hard. Move your body before you say something.",
                soft: "Your energy and your mood are pulling in the same direction. Good time to act on something you've been putting off." },
  Jupiter:    { hard: "Feelings get inflated. Either over-promising, overspending, overeating, or feeling like nothing is enough. Watch the urge to go big to feel better.",
                soft: "Mood lifts. Optimism, generosity, and a sense that there's more room than you thought." },
  Saturn:     { hard: "A heavy, contracted feeling. Loneliness, self-doubt, or the sense that you have to handle something alone. Tiredness is real, not a failure.",
                soft: "Emotionally steady. You can sit with hard things without falling apart, and committing to something feels possible." },
  Uranus:     { hard: "Jumpy, wired, can't-sit-still energy. Sudden mood shifts, the urge to bolt, blurt something out, or break a routine. Sleep may be twitchy.",
                soft: "A small spark of insight or freedom. You see your situation from a slightly new angle and want to try something different." },
  Neptune:    { hard: "Foggy, leaky, oversensitive. You may feel everyone else's feelings as your own, get teary at nothing, or want to escape into a screen, a drink, or sleep.",
                soft: "Imagination opens. Music, art, dreams, and quiet time all feel more nourishing than usual." },
  Pluto:      { hard: "Something underneath surfaces. An old feeling, a power struggle, or an urge to control or be controlled. Intensity is the keyword.",
                soft: "You can look at something dark without flinching. Quiet, private depth; good for honest self-reflection." },
  Chiron:     { hard: "An old wound gets touched. Something small can sting more than it should because it's hitting an old bruise.",
                soft: "Tenderness without rawness. You can be with your own hurt, or someone else's, in a useful way." },
  NorthNode:  { hard: "Pulled toward growth but uncomfortable about it. The thing you're avoiding is the thing today is pointing at.",
                soft: "A small step in the direction your life is actually trying to go. It will feel quietly right." },
  SouthNode:  { hard: "Pulled backward into an old comfort, an old role, an old relationship pattern. Easy to default to it; notice it instead of acting on it.",
                soft: "Old skills come back online. Use them, but don't move in." },
  Ascendant:  { hard: "How you're feeling and how you're coming across don't match. You may seem 'off' to people without knowing why.",
                soft: "You feel like yourself, and people receive you that way. Good face-the-world energy." },
  Midheaven:  { hard: "Feelings collide with work, reputation, or what you're 'supposed' to be doing publicly. Hard to keep a professional face.",
                soft: "Your private mood supports your public role. A good day to be seen doing your actual work." },
  Descendant: { hard: "Friction with a partner or close other. Their stuff is landing on you, or yours on them.",
                soft: "Easy give-and-take with the people closest to you." },
  IC:         { hard: "Restless at the root. Home, family, or something private feels unsettled.",
                soft: "Home feels like home. Good time to be in your own space, with your own people." },
  Ceres:      { hard: "Something in how you give or receive care feels off. You may feel under-fed (food, attention, mothering) or like you're doing all the feeding.",
                soft: "Easy day to nourish yourself and the people you love. Cooking, checking in on someone, being checked on." },
  Pallas:     { hard: "Your strategic brain and your mood are at odds. You can see the pattern or the smart move, but feelings keep getting in the way of executing it.",
                soft: "Pattern recognition is on. Good day to plan, strategize, or solve a problem you've been circling." },
  Juno:       { hard: "A sore spot in committed partnership gets pressed. Old fairness issues, who-does-what resentments, or feeling unseen by your person.",
                soft: "Easier give-and-take with a committed partner. Loyalty and the small contracts of being a 'we' feel workable." },
  Vesta:      { hard: "Hard to focus on the one thing that actually matters to you. Distraction, or feeling pulled away from your craft, your practice, your private flame.",
                soft: "You can sink into focused, devoted work. The thing you take seriously gets quiet, full attention." },
  Lilith:     { hard: "The part of you that refuses to be tamed gets activated. Anger about being managed, talked over, or made small. Don't apologize it away.",
                soft: "You feel allowed to be fully yourself, including the parts that aren't 'nice.' Honest, not performative." },
  Eris:       { hard: "Something feels unfair, and you want to name it loudly. Risk of stirring conflict to be acknowledged.",
                soft: "You can name the elephant in the room without burning the room down." },
};

// Plain-English explainer for less-known points so the lead sentence isn't
// just a name the reader doesn't know.
const PLANET_EXPLAINER: Record<string, string> = {
  Pallas: "the part of you that sees patterns and thinks strategically",
  Juno: "the part of you that does committed partnership",
  Vesta: "the part of you that's devoted to a craft or private practice",
  Ceres: "the part of you that gives and needs care",
  Lilith: "the part of you that won't be tamed or talked down to",
  Chiron: "the part of you that carries an old wound and teaches from it",
  Eris: "the part of you that names what's unfair",
  NorthNode: "the direction your life is trying to grow toward",
  SouthNode: "the comfortable old patterns you default to",
};

// Concise house labels for the dynamic sentence.
const HOUSE_LABEL: Record<number, string> = {
  1: "your sense of self", 2: "your money and self-worth",
  3: "your day-to-day talking and learning", 4: "your home and private life",
  5: "your creativity, romance, and play", 6: "your work and daily routine",
  7: "your one-on-one relationships", 8: "intimacy, shared resources, and what's hidden",
  9: "your beliefs and bigger view", 10: "your career and public role",
  11: "your friendships and future plans", 12: "your inner life and what you keep private",
};

// Concrete daily-life triggers per natal house. These are the actual things
// that get bumped when a transit lights up that house, in plain language.
const HOUSE_TRIGGER: Record<number, string> = {
  1: "the mirror, getting dressed, deciding how to walk into a room",
  2: "your bank balance, an upcoming purchase, a conversation about pay",
  3: "a text thread, a sibling, a short errand, something you're trying to learn",
  4: "something at home, a parent's voice in your head, a chore you've been putting off",
  5: "a creative project, a flirt, time with kids, a hobby you keep returning to",
  6: "your inbox, a workout, a doctor's note, a deadline you can't quite see the bottom of",
  7: "your partner, a contract, a one-on-one meeting, the person across the table",
  8: "a shared bill, a vulnerable conversation, an old debt, something you'd rather not look at",
  9: "a travel plan, a class, a strong opinion you're holding, a long-distance call",
  10: "your boss, a deadline, how you're being seen at work, your reputation",
  11: "a group chat, a friend, a future plan you've been dreaming about",
  12: "a quiet moment alone, a dream, something you've been hiding from yourself",
};

// Planet-specific closer that names where this exact natal planet (in this exact
// house) tends to fire. No template family-of-aspects sentences.
function planetHouseCloser(planet: string, house: number | null): string {
  if (!house) return '';
  const t = HOUSE_TRIGGER[house];
  if (!t) return '';
  switch (planet) {
    case 'Sun':       return `Watch for it around ${t}.`;
    case 'Moon':      return `It tends to surface around ${t}.`;
    case 'Mercury':   return `Most likely place it shows up: ${t}.`;
    case 'Venus':     return `Where you'll feel it: ${t}.`;
    case 'Mars':      return `Likely flashpoint: ${t}.`;
    case 'Jupiter':   return `Where the urge to go bigger lands: ${t}.`;
    case 'Saturn':    return `Where the weight settles: ${t}.`;
    case 'Uranus':    return `Where the surprise wants to land: ${t}.`;
    case 'Neptune':   return `Where the fog rolls in: ${t}.`;
    case 'Pluto':     return `Where the intensity collects: ${t}.`;
    case 'Chiron':    return `The bruise to keep an eye on: ${t}.`;
    case 'NorthNode': return `Where it's quietly pulling you forward: ${t}.`;
    case 'SouthNode': return `Where the old pattern reaches for you: ${t}.`;
    case 'Ascendant': return `It tends to show on your face around ${t}.`;
    case 'Midheaven': return `Where the public version of you feels it: ${t}.`;
    case 'Descendant':return `Where another person's stuff lands on you: ${t}.`;
    case 'IC':        return `Where it lives, privately: ${t}.`;
    case 'Ceres':     return `Where care, or the lack of it, shows up: ${t}.`;
    case 'Pallas':    return `Where the strategy actually applies: ${t}.`;
    case 'Juno':      return `Where the partnership rub lands: ${t}.`;
    case 'Vesta':     return `Where the focus belongs: ${t}.`;
    case 'Lilith':    return `Where the no rises up: ${t}.`;
    case 'Eris':      return `Where the unfairness wants to be named: ${t}.`;
    default:          return `Watch for it around ${t}.`;
  }
}

function moonHitInterpretation(h: MoonHit): string {
  const planetKey = h.natalPlanet.replace(/\s+/g, '');
  const feel = MOON_HIT_FEEL[planetKey];
  const isSoft = h.aspect === 'trine' || h.aspect === 'sextile';
  const body = feel ? (isSoft ? feel.soft : feel.hard) : '';
  const closer = planetHouseCloser(planetKey, h.natalHouse);
  return [body, closer].filter(Boolean).join(' ');
}

// Planet weighting for Moon-hit ranking. Luminaries + personal planets win
// over outers, nodes, asteroids. Angles count as personal-planet weight.
const MOON_HIT_PLANET_WEIGHT: Record<string, number> = {
  Sun: 5, Moon: 5, Mercury: 4, Venus: 4, Mars: 4,
  Ascendant: 4, Midheaven: 4, Descendant: 3, IC: 3,
  Jupiter: 3, Saturn: 3,
  Uranus: 2, Neptune: 2, Pluto: 2,
  Chiron: 2, NorthNode: 2, SouthNode: 2,
  Ceres: 1, Pallas: 1, Juno: 1, Vesta: 1, Lilith: 1, Eris: 1,
};

function getEasternHourFloat(d: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', hour12: false,
  }).formatToParts(d);
  const h = parseInt(parts.find(p => p.type === 'hour')?.value ?? '0', 10);
  const m = parseInt(parts.find(p => p.type === 'minute')?.value ?? '0', 10);
  return h + m / 60;
}

const WAKING_START_HOUR = 7;
const WAKING_END_HOUR = 22;
const EXCEPTIONALLY_TIGHT_ORB = 0.3; // off-hours hits keep their slot if tighter than this

function isWakingHour(d: Date): boolean {
  const h = getEasternHourFloat(d);
  return h >= WAKING_START_HOUR && h < WAKING_END_HOUR;
}

function moonHitScore(h: MoonHit): number {
  const w = MOON_HIT_PLANET_WEIGHT[h.natalPlanet.replace(/\s+/g, '')] ?? 1;
  // Lower score = higher priority. Orb dominates; weight is a tiebreaker.
  return h.orb * 2 - w * 0.5;
}

function moonHitsHTML(date: Date, chart: NatalChart | null): string {
  if (!chart) {
    return `<div style="background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:6px;padding:14px;font-size:13px;color:${COLOR.muted}">
      No natal chart attached. Add one to see how today's Moon hits your chart.
    </div>`;
  }
  const allHits = scanMoonHits(date, chart);

  // 1. Sign change during waking hours always makes the cut.
  const midnight = getEasternMidnightDate(date);
  const endOfDay = getEasternDateAtTime(date, 23, 59);
  const signChange = findNextMoonSignChange(midnight);
  const hasWakingSignChange = signChange.time <= endOfDay && isWakingHour(signChange.time);

  // 2. Filter to waking-hour aspects (or off-hours but exceptionally tight).
  const candidates = allHits.filter(
    h => isWakingHour(h.time) || h.orb < EXCEPTIONALLY_TIGHT_ORB,
  );

  // 3. Rank by orb tightness + planet weight.
  const ranked = [...candidates].sort((a, b) => moonHitScore(a) - moonHitScore(b));

  // 4. Quiet-day check: every candidate is wide (>2°) OR low weight (<=2).
  const isQuietDay = ranked.length === 0 || ranked.every(h => {
    const w = MOON_HIT_PLANET_WEIGHT[h.natalPlanet.replace(/\s+/g, '')] ?? 1;
    return h.orb > 2 || w <= 2;
  });

  const targetCount = isQuietDay ? Math.min(3, ranked.length) : Math.min(5, ranked.length);
  // Reserve a slot for sign-change line if present.
  const hitSlots = hasWakingSignChange ? Math.max(0, targetCount - 1) : targetCount;
  const selected = ranked.slice(0, Math.max(hitSlots, isQuietDay ? 2 : 3));

  // 5. Re-sort selected chronologically for display.
  selected.sort((a, b) => a.time.getTime() - b.time.getTime());

  if (!selected.length && !hasWakingSignChange) {
    return `<div style="background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:6px;padding:14px;font-size:13px;color:${COLOR.muted}">
      The Moon stays quiet against your chart today during waking hours. A good day to follow your own rhythm.
    </div>`;
  }

  // Sign-change row, if applicable.
  let signChangeRow = '';
  if (hasWakingSignChange) {
    const newPos = fromLongitude(moonLongitude(signChange.time));
    const newHouse = getTransitPlanetHouse(newPos.sign, newPos.deg, chart);
    const houseInfo = newHouse ? HOUSE_MEANINGS[newHouse] : null;
    signChangeRow = `
      <tr>
        <td style="padding:12px 14px;vertical-align:top;width:90px;font-size:12px;color:${COLOR.accent};font-weight:600;white-space:nowrap">
          ${fmtET(signChange.time)}
        </td>
        <td style="padding:12px 14px;vertical-align:top;background:${COLOR.accentSoft}">
          <div style="font-size:13px;color:${COLOR.text};font-weight:600">
            ☽ Moon enters ${escapeHtml(signChange.newSign)}
          </div>
          ${newHouse ? `<div style="font-size:12px;color:${COLOR.muted};margin-top:4px;line-height:1.5">Crosses into your <span style="color:${COLOR.accent}">${ordinal(newHouse)} house</span>${houseInfo ? ` &nbsp;·&nbsp; ${escapeHtml(houseInfo.keywords.toLowerCase())}` : ''}</div>` : ''}
        </td>
      </tr>`;
  }

  const quietNote = (isQuietDay && selected.length) ? `
    <tr>
      <td colspan="2" style="padding:10px 14px;border-top:1px solid ${COLOR.border};font-size:12px;color:${COLOR.muted};font-style:italic;line-height:1.5">
        The Moon is relatively quiet against your chart today. The items above are the closest hits, but none are dominant.
      </td>
    </tr>` : '';

  const rows = selected.map(h => {
    const natalHouseInfo = h.natalHouse ? HOUSE_MEANINGS[h.natalHouse] : null;
    const natalKeyword = natalHouseInfo ? natalHouseInfo.keywords.toLowerCase() : '';
    const transitLine = h.transitHouse
      ? `Transiting Moon in ${escapeHtml(h.transitSign)}, your <span style="color:${COLOR.accent}">${ordinal(h.transitHouse)} house</span>`
      : `Transiting Moon in ${escapeHtml(h.transitSign)}`;
    const natalLine = h.natalHouse
      ? `natal ${escapeHtml(h.natalPlanet)} in ${escapeHtml(h.natalSign)}, your <span style="color:${COLOR.accent}">${ordinal(h.natalHouse)} house</span>${natalKeyword ? ` <span style="color:${COLOR.faint}">(${escapeHtml(natalKeyword)})</span>` : ''}`
      : `natal ${escapeHtml(h.natalPlanet)} in ${escapeHtml(h.natalSign)}`;
    return `
      <tr>
        <td style="padding:12px 14px;border-top:1px solid ${COLOR.border};vertical-align:top;width:90px;font-size:12px;color:${COLOR.muted};white-space:nowrap">
          ${fmtET(h.time)}
        </td>
        <td style="padding:12px 14px;border-top:1px solid ${COLOR.border};vertical-align:top">
          <div style="font-size:13px;color:${COLOR.text};font-weight:600">
            ☽ ${ASPECT_GLYPH[h.aspect] || h.aspect} natal ${escapeHtml(h.natalPlanet)}
            <span style="font-weight:400;color:${COLOR.muted}"> · ${h.orb.toFixed(1)}° orb</span>
          </div>
          <div style="font-size:12px;color:${COLOR.muted};margin-top:4px;line-height:1.5">${transitLine} &nbsp;·&nbsp; ${natalLine}</div>
          <div style="font-size:13px;color:${COLOR.text};margin-top:8px;line-height:1.55">${moonHitInterpretation(h)}</div>
        </td>
      </tr>`;
  }).join('');

  return `
    <div style="background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:6px;overflow:hidden">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse">
        ${signChangeRow}
        ${rows}
        ${quietNote}
      </table>
    </div>`;
}

// ─── Section 4: Collective sky paragraph ────────────────────────────

// What each planet brings to a collective aspect, in plain language.
const PLANET_DOMAIN: Record<string, string> = {
  Sun: "ego, vitality, the urge to shine",
  Moon: "mood, the emotional weather of the day",
  Mercury: "thinking, talking, messages, plans",
  Venus: "love, money, what we value, social ease",
  Mars: "drive, anger, the appetite to act",
  Jupiter: "growth, optimism, going bigger",
  Saturn: "limits, responsibility, the reality check",
  Uranus: "shocks, sudden change, the urge to break free",
  Neptune: "fog, dreams, dissolving edges, longing",
  Pluto: "power, control, what's hidden underneath",
  Chiron: "old wounds asking to be tended",
};

// Felt-sense weather phrases per planet pair flavor. These are written as
// emotional-climate sentences (no jargon, no "the moon is..." openers).
// Hard = friction (conjunction/square/opposition/quincunx).
// Soft = flow (trine/sextile).
const PLANET_SCENE: Record<string, { hard: string; soft: string }> = {
  Sun:     { hard: "pride sits close to the skin", soft: "it's easier to be seen without performing" },
  Moon:    { hard: "feelings move faster than people can name them", soft: "moods land softly and pass without a fight" },
  Mercury: { hard: "conversations keep drifting into the thing nobody wanted to say out loud", soft: "the right words show up at the right time" },
  Venus:   { hard: "small slights and money twinges land harder than they should", soft: "small pleasures actually register and people are gentler with each other" },
  Mars:    { hard: "patience is thin and the urge to push back is everywhere", soft: "starting something today takes less effort than it did yesterday" },
  Jupiter: { hard: "everything wants to be bigger than it actually is, including the reactions", soft: "the day quietly opens a little more room than expected" },
  Saturn:  { hard: "the day feels heavier, slower, and more accountable than yesterday", soft: "patience and grown-up decisions come more naturally than usual" },
  Uranus:  { hard: "schedules twitch and small surprises keep clipping the edges of plans", soft: "fresh angles arrive in the middle of ordinary tasks" },
  Neptune: { hard: "the truth keeps slipping a half-step out of focus", soft: "imagination and tenderness are unusually accessible" },
  Pluto:   { hard: "ordinary interactions carry an undertow of control and intensity", soft: "honest conversations about hard things actually land" },
  Chiron:  { hard: "old sore spots get bumped by small, ordinary moments", soft: "tenderness toward old hurts is available without spiraling" },
};

// Plain-prose Moon phase line that reads like emotional weather, not a label.
const PHASE_PROSE: Record<string, string> = {
  "New Moon": "There's a quiet, inward pull underneath everything, even the busy parts of the day.",
  "Waxing Crescent": "Anything just-started is still tender and asks to be protected, not announced.",
  "First Quarter": "New things are meeting their first real friction, and that friction wants a decision.",
  "Waxing Gibbous": "There's pressure to finish, and patience runs shorter than people will admit.",
  "Full Moon": "Feelings are turned up and hidden things keep finding their way into the open.",
  "Waning Gibbous": "Honest conversations about what just happened sit closer to the surface than usual.",
  "Last Quarter": "What isn't working anymore is harder to keep ignoring today.",
  "Waning Crescent": "People are quieter and more tired than they expect to be.",
  "Balsamic": "The day moves slowly and dreamily and isn't built for big decisions.",
};

function collectiveSkyHTML(date: Date): string {
  const midnight = getEasternMidnightDate(date);
  const moonPhase = getMoonPhase(midnight);
  const planets = getPlanetaryPositions(midnight);
  const aspects = calculateDailyAspects(planets);

  // Tightest real planet-to-planet aspects in the sky today.
  const tight = [...aspects]
    .sort((a, b) => parseFloat(a.orb) - parseFloat(b.orb))
    .filter(a => parseFloat(a.orb) <= 6)
    .slice(0, 2);

  // Outer-planet retrogrades read as background emotional weather.
  const outerRetros: string[] = [];
  const outerLabels: Record<string, string> = {
    pluto: "underneath everything, slow questions about power and control are still being chewed on",
    neptune: "the longing for meaning is sharper than usual and harder to distract from",
    uranus: "the urge to break free is running inward instead of acting out",
    saturn: "old commitments keep asking to be looked at again before anything new gets built",
    jupiter: "growth is happening privately rather than out loud",
  };
  for (const key of ['pluto','neptune','uranus','saturn','jupiter']) {
    const p = (planets as any)[key];
    if (p?.isRetrograde) outerRetros.push(outerLabels[key]);
  }

  const phaseLine = PHASE_PROSE[moonPhase.phaseName] || "";

  // Build felt-sense clauses from real aspects.
  const clauses: string[] = [];
  for (const a of tight) {
    const isSoft = a.type === 'trine' || a.type === 'sextile';
    const s1 = PLANET_SCENE[a.planet1];
    const s2 = PLANET_SCENE[a.planet2];
    if (!s1 || !s2) continue;
    clauses.push(isSoft ? `${s1.soft}, and ${s2.soft}` : `${s1.hard}, while ${s2.hard}`);
  }

  // Compose 2–5 sentences. Lead with felt-sense (phase or first aspect),
  // never with "the Moon is" or other technical openers.
  const sentences: string[] = [];
  if (phaseLine) sentences.push(phaseLine);
  if (clauses[0]) sentences.push(`On top of that, ${clauses[0]}.`);
  if (clauses[1]) sentences.push(`Layered in: ${clauses[1]}.`);
  if (outerRetros[0]) sentences.push(`${outerRetros[0].charAt(0).toUpperCase()}${outerRetros[0].slice(1)}.`);

  // Fallback if nothing landed.
  if (sentences.length === 0) {
    sentences.push("The sky is quiet today, with no sharp aspects pulling the collective in any one direction.");
    sentences.push("The day will mostly take its tone from what's actually in front of you.");
  }

  // Cap at 5 sentences.
  const prose = sentences.slice(0, 5).join(' ');

  return `
    <div style="background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:6px;padding:16px 18px;font-size:14px;line-height:1.65;color:${COLOR.text}">
      ${prose}
    </div>`;
}

// ─── Section 5: What matters most for you ───────────────────────────

function whatMattersHTML(
  date: Date,
  chart: NatalChart | null,
  override?: Array<{ headline: string; body: string }>,
): string {
  if (!chart) {
    return `<div style="background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:6px;padding:14px;font-size:13px;color:${COLOR.muted}">Attach a natal chart to see personal items.</div>`;
  }

  let items: Array<{ headline: string; body: string }> = [];

  if (override && override.length) {
    items = override.slice(0, 5);
  } else {
    // Deterministic fallback (no AI). Same logic as before.
    const midnight = getEasternMidnightDate(date);
    const noon = getEasternDateAtTime(date, 12, 0);
    const planetsNoon = getPlanetaryPositions(noon);
    const personalTransits = calculateTransitAspects(midnight, getPlanetaryPositions(midnight), chart);
    const top = getTopTransitAspects(personalTransits, 4)
      .filter(t => t.transitPlanet !== 'Moon');

    const moonHouseNoon = getTransitPlanetHouse(planetsNoon.moon.signName, planetsNoon.moon.degree, chart);
    if (moonHouseNoon) {
      const info = HOUSE_MEANINGS[moonHouseNoon];
      items.push({
        headline: `The Moon spends most of today in your ${ordinal(moonHouseNoon)} house.`,
        body: `That puts the emotional charge on ${info.lifeArea}. Notice what surfaces here, this is where the day wants your attention.`,
      });
    }

    const transitKeys = new Set(
      personalTransits.map(t => `${t.transitPlanet}|${t.aspect}|${t.natalPlanet}`)
    );
    for (const t of top.slice(0, 3)) {
      if (!t.transitPlanet || !t.aspect || !t.natalPlanet) continue;
      const key = `${t.transitPlanet}|${t.aspect}|${t.natalPlanet}`;
      if (!transitKeys.has(key)) continue;
      const personalized = getPersonalizedTransitInterpretation(
        t.transitPlanet, t.aspect, t.natalPlanet, t.natalHouse, t.natalSign,
      );
      const houseInfo = t.natalHouse ? HOUSE_MEANINGS[t.natalHouse] : null;
      const headline = `${t.transitPlanet} ${t.aspect} your natal ${t.natalPlanet}${t.natalHouse ? `, ${ordinal(t.natalHouse)} house` : ''} (${t.orb}° orb).`;
      const body = personalized.howItFeels
        || (houseInfo ? `This activates ${houseInfo.lifeArea}.` : t.interpretation);
      items.push({ headline, body });
    }
  }

  if (!items.length) {
    items.push({
      headline: `Quiet personal day.`,
      body: `No tight transit is dominating your chart. Use the Moon timing above as your guide for when to act and when to rest.`,
    });
  }

  const fixedRows = items.slice(0, 5).map((it, i) => `
    <tr>
      <td style="vertical-align:top;padding:16px 8px 16px 18px;width:36px;font-size:18px;color:${COLOR.faint};font-family:${FONT};${i > 0 ? `border-top:1px solid ${COLOR.border};` : ''}">${i + 1}</td>
      <td style="vertical-align:top;padding:16px 18px 16px 0;${i > 0 ? `border-top:1px solid ${COLOR.border};` : ''}">
        <div style="font-size:14px;color:${COLOR.text};font-weight:600;line-height:1.45">${escapeHtml(it.headline)}</div>
        <div style="font-size:13px;color:${COLOR.muted};line-height:1.6;margin-top:6px">${escapeHtml(it.body)}</div>
      </td>
    </tr>`).join('');

  return `
    <div style="background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:6px;overflow:hidden">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse">
        ${fixedRows}
      </table>
    </div>`;
}

// ─── Section title helper ───────────────────────────────────────────

function sectionTitle(eyebrow: string, heading: string): string {
  return `
    <div style="margin:32px 0 14px">
      <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${COLOR.faint};font-family:${SANS}">${escapeHtml(eyebrow)}</div>
      <div style="font-size:22px;color:${COLOR.text};font-family:${FONT};margin-top:4px">${escapeHtml(heading)}</div>
    </div>`;
}

// ─── Public entry ───────────────────────────────────────────────────

export function buildMorningDigest({
  date,
  natalChart,
  recipientName,
  collectiveProseHTML,
  whatMattersItems,
}: MorningDigestArgs): string {
  const midnight = getEasternMidnightDate(date);
  const dateLabel = fmtETDate(midnight);
  const firstName = recipientName?.trim().split(/\s+/)[0];

  // If a collective prose override is provided (the cosmic-weather AI prose),
  // wrap it in the same card shell so the layout is identical.
  const collectiveSection = collectiveProseHTML
    ? `<div style="background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:6px;padding:16px 18px;font-size:14px;line-height:1.65;color:${COLOR.text}">${collectiveProseHTML}</div>`
    : collectiveSkyHTML(date);

  return `<div style="background:${COLOR.bg};padding:28px 18px;font-family:${FONT};color:${COLOR.text}">
    <div style="max-width:680px;margin:0 auto">

      <div style="margin-bottom:8px">
        <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${COLOR.faint};font-family:${SANS}">${escapeHtml(dateLabel.toUpperCase())}</div>
        <h1 style="font-size:30px;font-family:${FONT};color:${COLOR.text};margin:6px 0 0;font-weight:600;line-height:1.2">
          ${firstName ? `Good morning, ${escapeHtml(firstName)}.` : 'Good morning.'}
        </h1>
        <p style="font-size:13px;color:${COLOR.muted};margin:6px 0 0">Sky at 12:00 PM Eastern · planets placed in your natal houses.</p>
      </div>

      ${sectionTitle('Sky right now', 'Where every planet lands in your chart')}
      ${planetGridHTML(date, natalChart)}

      ${sectionTitle("The Moon today", 'Arc through your chart')}
      ${moonArcHTML(date, natalChart)}

      ${sectionTitle('Moon hits your natal chart', 'Key ☽ moments')}
      ${moonHitsHTML(date, natalChart)}

      ${sectionTitle('Other transits', 'Outer planets to your inner planets')}
      ${otherTransitsHTML(date, natalChart)}

      ${sectionTitle('The collective sky', 'What everyone is living under')}
      ${collectiveSection}

      ${sectionTitle('What matters most today', 'Personal to your chart')}
      ${whatMattersHTML(date, natalChart, whatMattersItems)}

      <div style="margin:36px 0 4px;padding-top:14px;border-top:1px solid ${COLOR.border};font-size:11px;color:${COLOR.faint};text-align:center;font-family:${SANS}">
        Generated from your live chart · all positions calculated in Eastern Time
      </div>
    </div>
  </div>`;
}

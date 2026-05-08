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

function moonArcHTML(date: Date, chart: NatalChart | null): string {
  const midnight = getEasternMidnightDate(date);
  const noon = getEasternDateAtTime(date, 12, 0);
  const end = getEasternDateAtTime(date, 23, 59);
  const moonPhase = getMoonPhase(midnight);
  const signChange = findNextMoonSignChange(midnight);
  const voc = getVOCMoonDetails(midnight);

  const checkpoint = (label: string, t: Date) => {
    const pos = fromLongitude(moonLongitude(t));
    const house = chart ? getTransitPlanetHouse(pos.sign, pos.deg, chart) : null;
    const houseInfo = house ? HOUSE_MEANINGS[house] : null;
    const houseText = houseInfo
      ? `<span style="color:${COLOR.accent}">your ${ordinal(house!)} house</span> · ${escapeHtml(houseInfo.keywords.toLowerCase())}`
      : '';
    return `
      <tr>
        <td style="padding:10px 14px;font-size:12px;color:${COLOR.muted};white-space:nowrap;width:90px">${label}</td>
        <td style="padding:10px 14px;font-size:13px;color:${COLOR.text}">
          <span style="font-weight:600">☽ ${fmtDeg(pos.deg, pos.min)} ${escapeHtml(pos.sign)}</span>
          ${houseText ? `<span style="color:${COLOR.muted}"> · ${houseText}</span>` : ''}
        </td>
      </tr>`;
  };

  const rows: string[] = [];
  rows.push(checkpoint('12:00 AM', midnight));

  if (signChange.time <= end) {
    const newPos = fromLongitude(moonLongitude(signChange.time));
    const newHouse = chart ? getTransitPlanetHouse(newPos.sign, newPos.deg, chart) : null;
    rows.push(`
      <tr>
        <td colspan="2" style="padding:8px 14px;background:${COLOR.accentSoft};border-top:1px solid ${COLOR.border};border-bottom:1px solid ${COLOR.border}">
          <span style="font-size:12px;color:${COLOR.accent};font-weight:600">→ ${fmtET(signChange.time)} ET</span>
          <span style="font-size:12px;color:${COLOR.text}"> · Moon enters ${escapeHtml(signChange.newSign)}${newHouse ? ` · moves into your <span style="color:${COLOR.accent}">${ordinal(newHouse)} house</span>` : ''}</span>
        </td>
      </tr>`);
  }

  rows.push(checkpoint('12:00 PM', noon));
  rows.push(checkpoint('11:59 PM', end));

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

  return `
    <div style="background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:6px;overflow:hidden">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse">
        ${rows.join('')}
      </table>
      <div style="padding:10px 14px 14px;border-top:1px solid ${COLOR.border}">${tagHTML}</div>
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
        hits.push({
          time: samples[bestIdx].t,
          natalPlanet: natal.name,
          natalSign: natal.sign,
          natalDegree: natal.degree,
          natalMin: natal.min,
          natalHouse: natal.house,
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
};

function moonHitInterpretation(h: MoonHit): string {
  const houseInfo = h.natalHouse ? HOUSE_MEANINGS[h.natalHouse] : null;
  const houseArea = houseInfo?.lifeArea || 'this part of your life';
  const planetKey = h.natalPlanet.replace(/\s+/g, '');
  const feel = MOON_HIT_FEEL[planetKey];
  const isHard = h.aspect === 'conjunction' || h.aspect === 'square' || h.aspect === 'opposition';
  const isSoft = h.aspect === 'trine' || h.aspect === 'sextile';
  const aspectFlavor: Record<string, string> = {
    conjunction: "merges with",
    opposition: "pulls against",
    square: "scrapes against",
    trine: "flows with",
    sextile: "opens to",
  };
  const verb = aspectFlavor[h.aspect] || "contacts";
  const lead = `Today's Moon ${verb} your natal ${h.natalPlanet} (${houseArea}).`;
  if (feel) {
    const body = isSoft ? feel.soft : isHard ? feel.hard : feel.hard;
    return `${lead} ${body}`;
  }
  return lead;
}

function moonHitsHTML(date: Date, chart: NatalChart | null): string {
  if (!chart) {
    return `<div style="background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:6px;padding:14px;font-size:13px;color:${COLOR.muted}">
      No natal chart attached. Add one to see how today's Moon hits your chart.
    </div>`;
  }
  const hits = scanMoonHits(date, chart);
  if (!hits.length) {
    return `<div style="background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:6px;padding:14px;font-size:13px;color:${COLOR.muted}">
      The Moon does not make a tight aspect to any of your natal planets today.
    </div>`;
  }

  const rows = hits.map(h => {
    const houseInfo = h.natalHouse ? HOUSE_MEANINGS[h.natalHouse] : null;
    const houseTag = h.natalHouse
      ? `<span style="color:${COLOR.accent}">${ordinal(h.natalHouse!)} house</span>${houseInfo ? ` · ${escapeHtml(houseInfo.keywords.toLowerCase())}` : ''}`
      : '';
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
          <div style="font-size:12px;color:${COLOR.muted};margin-top:2px">${houseTag}</div>
          <div style="font-size:13px;color:${COLOR.text};margin-top:6px;line-height:1.5">${escapeHtml(moonHitInterpretation(h))}</div>
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

// ─── Section 4: Collective sky paragraph ────────────────────────────

function collectiveSkyHTML(date: Date): string {
  const midnight = getEasternMidnightDate(date);
  const moonPhase = getMoonPhase(midnight);
  const planets = getPlanetaryPositions(midnight);
  const aspects = calculateDailyAspects(planets);
  const dayType = getDayType(aspects, moonPhase);
  const tightest = [...aspects]
    .sort((a, b) => parseFloat(a.orb) - parseFloat(b.orb))
    .filter(a => parseFloat(a.orb) <= 3)
    .slice(0, 2);

  const phaseLine = `The Moon is ${moonPhase.phaseName.toLowerCase()}, ${Math.round(moonPhase.illumination * 100)}% lit.`;
  const dayLine = `${dayType.description}.`;
  const aspectLine = tightest.length
    ? `The tightest sky aspect right now is ${tightest.map(a => `${a.planet1} ${a.type} ${a.planet2} (${a.orb}° orb)`).join(' and ')}.`
    : `No major collective aspects are perfecting today, the sky is relatively quiet.`;
  const closer = tightest.some(a => ['square','opposition'].includes(a.type))
    ? `Expect a little friction in the air, even if you can't name it.`
    : tightest.some(a => ['trine','sextile'].includes(a.type))
      ? `The collective tone is workable, things tend to flow if you cooperate with them.`
      : `Tone is mostly neutral, what you bring sets the mood.`;

  const paragraph = [phaseLine, dayLine, aspectLine, closer].join(' ');

  return `
    <div style="background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:6px;padding:16px 18px;font-size:14px;line-height:1.65;color:${COLOR.text}">
      ${escapeHtml(paragraph)}
    </div>`;
}

// ─── Section 5: What matters most for you ───────────────────────────

function whatMattersHTML(date: Date, chart: NatalChart | null): string {
  if (!chart) {
    return `<div style="background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:6px;padding:14px;font-size:13px;color:${COLOR.muted}">Attach a natal chart to see personal items.</div>`;
  }
  const midnight = getEasternMidnightDate(date);
  const noon = getEasternDateAtTime(date, 12, 0);
  const planetsNoon = getPlanetaryPositions(noon);
  const personalTransits = calculateTransitAspects(midnight, getPlanetaryPositions(midnight), chart);
  const top = getTopTransitAspects(personalTransits, 4)
    .filter(t => t.transitPlanet !== 'Moon'); // Moon is its own section

  // Item: Moon's house most of day (use noon as midpoint).
  const moonHouseNoon = getTransitPlanetHouse(planetsNoon.moon.signName, planetsNoon.moon.degree, chart);
  const items: Array<{ headline: string; body: string }> = [];

  if (moonHouseNoon) {
    const info = HOUSE_MEANINGS[moonHouseNoon];
    items.push({
      headline: `The Moon spends most of today in your ${ordinal(moonHouseNoon)} house.`,
      body: `That puts the emotional charge on ${info.lifeArea}. Notice what surfaces here, this is where the day wants your attention.`,
    });
  }

  // Items: top transit aspects, in plain language using existing interpreter.
  for (const t of top.slice(0, 3)) {
    const personalized = getPersonalizedTransitInterpretation(
      t.transitPlanet, t.aspect, t.natalPlanet, t.natalHouse, t.natalSign,
    );
    const houseInfo = t.natalHouse ? HOUSE_MEANINGS[t.natalHouse] : null;
    const headline = `${t.transitPlanet} ${t.aspect} your natal ${t.natalPlanet}${t.natalHouse ? `, ${ordinal(t.natalHouse)} house` : ''} (${t.orb}° orb).`;
    const body = personalized.howItFeels || houseInfo
      ? (personalized.howItFeels || `This activates ${houseInfo!.lifeArea}.`)
      : t.interpretation;
    items.push({ headline, body });
  }

  if (!items.length) {
    items.push({
      headline: `Quiet personal day.`,
      body: `No tight transit is dominating your chart. Use the Moon timing above as your guide for when to act and when to rest.`,
    });
  }

  const rows = items.slice(0, 5).map((it, i) => `
    <tr>
      <td style="vertical-align:top;padding:14px 14px 14px 18px;width:36px;font-size:18px;color:${COLOR.faint};font-family:${FONT}">${i + 1}</td>
      <td style="vertical-align:top;padding:14px 18px 14px 0;${i > 0 ? `border-top:1px solid ${COLOR.border};` : ''}">
        <div style="font-size:14px;color:${COLOR.text};font-weight:600;line-height:1.45">${escapeHtml(it.headline)}</div>
        <div style="font-size:13px;color:${COLOR.muted};line-height:1.6;margin-top:6px">${escapeHtml(it.body)}</div>
      </td>
    </tr>`).join('');

  // Add row top borders properly
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

export function buildMorningDigest({ date, natalChart, recipientName }: MorningDigestArgs): string {
  const midnight = getEasternMidnightDate(date);
  const dateLabel = fmtETDate(midnight);
  const firstName = recipientName?.trim().split(/\s+/)[0];

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

      ${sectionTitle('Moon hits your natal chart', 'Key moments today')}
      ${moonHitsHTML(date, natalChart)}

      ${sectionTitle('The collective sky', 'What everyone is living under')}
      ${collectiveSkyHTML(date)}

      ${sectionTitle('What matters most today', 'Personal to your chart')}
      ${whatMattersHTML(date, natalChart)}

      <div style="margin:36px 0 4px;padding-top:14px;border-top:1px solid ${COLOR.border};font-size:11px;color:${COLOR.faint};text-align:center;font-family:${SANS}">
        Generated from your live chart · all positions calculated in Eastern Time
      </div>
    </div>
  </div>`;
}

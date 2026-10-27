/**
 * Solar Return Year Story — the synthesis layer that runs BEFORE any section is written.
 *
 * Purpose: decide what the year is fundamentally about, rank 3 to 5 major themes using
 * multiple reinforcing chart signatures (not aspect count), and hand every downstream
 * section a story to support.
 *
 * Hierarchy of evidence (highest first):
 *   1. SR Ascendant and its ruler
 *   2. SR Sun and its house (dignity weighted)
 *   3. SR Moon and its house
 *   4. Angular planets
 *   5. Stelliums / house concentrations
 *   6. Annual profection house and Time Lord
 *   7. Rulers of major activated houses
 *   8. Very tight major aspects to Sun, Moon, Asc, MC, chart ruler or Time Lord
 *   9. Supporting aspects
 *  10. Minor bodies (may reinforce a theme, may never create one)
 *
 * Style rules: no em dashes, no guarantees, no medical predictions.
 */

import { SolarReturnAnalysis } from './solarReturnAnalysis';
import { solarReturnHouseMeaning, solarReturnProfectionMeaning } from './solarReturnClientMeaning';

export interface YearTheme {
  house: number;
  key: string;
  title: string;
  score: number;
  /** How many DIFFERENT kinds of chart evidence point here */
  reinforcements: number;
  /** Client-facing synthesis paragraph */
  summary: string;
  /** The astrology that supports it, plainly listed */
  signatures: string[];
}

export interface YearStory {
  coreStory: string;
  themes: YearTheme[];
  /** Ordered "what the chart emphasizes most" list, for transparency */
  hierarchy: { label: string; detail: string }[];
  whatYouNeedToKnow: { heading: string; body: string }[];
  reflectionQuestion: string;
}

/* ── Reference tables ── */

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const TRAD_RULER: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon', Leo: 'Sun',
  Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars', Sagittarius: 'Jupiter',
  Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};

/* Signs are never mapped to "natural" houses here: a sign describes style,
   a house describes the life area, and only real cusps/placements score houses. */

const HOUSE_TITLE: Record<number, string> = {
  1: 'Identity, Presence and How You Meet the World',
  2: 'Money, Values and Self-Worth',
  3: 'Communication, Learning and Daily Contact',
  4: 'Home, Family and Foundations',
  5: 'Creativity, Romance and Self-Expression',
  6: 'Daily Life, Work, Routines and Sustainability',
  7: 'Relationships, Partnerships and Agreements',
  8: 'Shared Resources, Depth and Psychological Change',
  9: 'Travel, Study and Worldview',
  10: 'Career, Direction, Visibility and Achievement',
  11: 'Community, Friendship and Future Plans',
  12: 'Private Reflection, Inner Patterns and Release',
};

const HOUSE_KEY: Record<number, string> = {
  1: 'identity', 2: 'money', 3: 'communication', 4: 'home', 5: 'creativity',
  6: 'daily-life', 7: 'relationships', 8: 'depth', 9: 'worldview',
  10: 'career', 11: 'community', 12: 'inner',
};

/** Planet importance for weighting (minor bodies deliberately low) */
const PLANET_WEIGHT: Record<string, number> = {
  Sun: 10, Moon: 9, Mercury: 5, Venus: 6, Mars: 6, Jupiter: 7, Saturn: 7,
  Uranus: 5, Neptune: 4, Pluto: 5, Chiron: 3, NorthNode: 3, SouthNode: 2,
};

/** Secondary bodies: may reinforce, never lead a theme or a defining aspect. */
const SECONDARY_BODIES = new Set(['Chiron', 'NorthNode', 'SouthNode']);

const MINOR_BODIES = new Set([
  'Ceres','Pallas','Juno','Vesta','Lilith','Eris','Psyche','Eros','Amor','Hygiea',
  'Nessus','Pholus','Chariklo','Sedna','Makemake','Haumea','Quaoar','Orcus','Ixion',
  'Varuna','Gonggong','Salacia','PartOfFortune','Vertex',
]);

const CORE_PLANETS = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
const MAJOR_ASPECTS = new Set(['Conjunction','Opposition','Square','Trine','Sextile']);
const STRONG_DIGNITY = new Set(['Domicile','Exaltation']);

const ordinal = (n: number): string => {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

interface Bucket {
  score: number;
  kinds: Set<string>;
  signatures: string[];
}

/* ── Main builder ── */

export function buildYearStory(analysis: SolarReturnAnalysis): YearStory {
  const buckets: Record<number, Bucket> = {};
  const bucket = (h: number): Bucket => {
    if (!buckets[h]) buckets[h] = { score: 0, kinds: new Set(), signatures: [] };
    return buckets[h];
  };
  const add = (h: number | null | undefined, pts: number, kind: string, signature?: string) => {
    if (!h || h < 1 || h > 12) return;
    const b = bucket(h);
    b.score += pts;
    b.kinds.add(kind);
    if (signature && !b.signatures.includes(signature)) b.signatures.push(signature);
  };

  const houses = analysis.planetSRHouses || {};
  const ascSign = analysis.yearlyTheme?.ascendantSign || '';
  const ascRuler = analysis.yearlyTheme?.ascendantRuler || (ascSign ? TRAD_RULER[ascSign] : '') || '';
  const ascRulerHouse = ascRuler ? (houses[ascRuler] ?? null) : null;
  const ascRulerSign = ascRuler ? signOf(analysis, ascRuler) : '';
  const sunHouse = analysis.sunHouse?.house ?? null;
  const sunSign = signOf(analysis, 'Sun');
  const sunDignity = dignityOf(analysis, 'Sun');
  const moonHouse = analysis.moonHouse?.house ?? null;
  const moonSign = analysis.moonSign || signOf(analysis, 'Moon');
  const profHouse = analysis.profectionYear?.houseNumber ?? null;
  const timeLord = analysis.profectionYear?.timeLord || '';
  const timeLordHouse = analysis.profectionYear?.timeLordSRHouse ?? null;
  const timeLordSign = analysis.profectionYear?.timeLordSRSign || '';

  /* 1. SR Ascendant sign and its ruler */
  if (ascSign) {
    add(1, 4, 'sr-ascendant', `${ascSign} rising shapes your presence and approach this year.`);
  }
  if (ascRulerHouse) {
    const dig = dignityOf(analysis, ascRuler);
    const strong = STRONG_DIGNITY.has(dig);
    add(ascRulerHouse, 7 + (strong ? 3 : 0), 'chart-ruler',
      `${ascRuler}, ruler of the Solar Return Ascendant, sits in the ${ordinal(ascRulerHouse)} house${ascRulerSign ? ` in ${ascRulerSign}` : ''}${strong ? ` and is strong there (${dig.toLowerCase()})` : ''}.`);
  }

  /* 2. SR Sun */
  if (sunHouse) {
    const bonus = STRONG_DIGNITY.has(sunDignity) ? 4 : 0;
    add(sunHouse, 16 + bonus, 'sr-sun',
      `The Solar Return Sun is in the ${ordinal(sunHouse)} house${sunSign ? ` in ${sunSign}` : ''}${bonus ? ` and is in ${sunDignity.toLowerCase()}, which strengthens it` : ''}.`);
  }

  /* 3. SR Moon */
  if (moonHouse) {
    add(moonHouse, 9, 'sr-moon',
      `The Solar Return Moon is in the ${ordinal(moonHouse)} house${moonSign ? ` in ${moonSign}` : ''}, showing where your emotional attention keeps returning.`);
  }

  /* 4. Angular planets, credited to the house they are actually in */
  for (const ang of analysis.angularPlanetsDetailed || []) {
    if (MINOR_BODIES.has(ang.planet) || SECONDARY_BODIES.has(ang.planet)) continue;
    const actual = houses[ang.planet] ?? ang.house;
    const w = (PLANET_WEIGHT[ang.planet] || 3) * 0.9;
    add(actual, w, 'angular',
      `${ang.planet} is angular, within ${ang.orb}° of the ${ang.angle}, which raises its volume all year.`);
    // A planet conjunct an angle also colors that angle's house, at lower weight,
    // without moving the planet out of its real house.
    if (actual !== ang.house) {
      add(ang.house, w * 0.5, 'angular-spillover',
        `${ang.planet} is technically in the ${ordinal(actual)} house but closely conjunct the ${ang.angle}, so it also carries ${ordinal(ang.house)} house significance.`);
    }
  }

  /* 5. Occupancy and stelliums */
  for (const planet of CORE_PLANETS) {
    const h = houses[planet];
    if (!h) continue;
    const base = planet === 'Sun' || planet === 'Moon' ? 5 : PLANET_WEIGHT[planet] >= 6 ? 3 : 2;
    add(h, base, `occupancy-${planet}`);
  }
  for (const st of analysis.stelliums || []) {
    const corePlanets = (st.planets || []).filter(p => CORE_PLANETS.includes(p));
    if (corePlanets.length < 3) continue;
    if (st.locationType === 'house') {
      const h = parseInt(String(st.location).replace(/\D/g, ''), 10);
      add(h, 12 + (corePlanets.length - 3) * 3, 'stellium',
        `A ${corePlanets.length} planet concentration in the ${ordinal(h)} house (${corePlanets.join(', ')}) makes this one of the central signatures of the return.`);
    } else {
      // A sign concentration reinforces whichever house those planets share
      const tally: Record<number, number> = {};
      for (const p of corePlanets) { const h = houses[p]; if (h) tally[h] = (tally[h] || 0) + 1; }
      const [topHouse, count] = Object.entries(tally).sort(([, a], [, b]) => b - a)[0] || [];
      if (topHouse && count && count >= 2) {
        add(parseInt(topHouse, 10), 6, 'sign-stellium',
          `A ${st.location} concentration (${corePlanets.join(', ')}) lands mostly in the ${ordinal(parseInt(topHouse, 10))} house, doubling the emphasis there.`);
      }
    }
  }

  /* 6. Annual profection and Time Lord */
  if (profHouse) {
    add(profHouse, 16, 'profection',
      `At this age the annual profection activates the ${ordinal(profHouse)} house, which is a yearly timing technique rather than a transit.`);
  }
  if (timeLordHouse) {
    // The Time Lord's own house describes HOW the profected year is worked out.
    // It must not outrank the profected house itself or the Sun's house.
    add(timeLordHouse, 5, 'time-lord',
      `${timeLord}, the annual profection Time Lord, is in the Solar Return ${ordinal(timeLordHouse)} house${timeLordSign ? ` in ${timeLordSign}` : ''}, which is how the profected year gets worked out in practice.`);
  }

  /* 7. Rulers of major activated houses */
  const activated = [profHouse, sunHouse, 10, 1].filter(Boolean) as number[];
  for (const h of activated) {
    const cuspSign = cuspSignOf(analysis, h);
    const ruler = cuspSign ? TRAD_RULER[cuspSign] : '';
    const rh = ruler ? houses[ruler] ?? null : null;
    if (ruler && rh) {
      add(rh, 4, `ruler-of-${h}`,
        `${ruler} rules the ${ordinal(h)} house cusp and sits in the ${ordinal(rh)} house, linking those two areas.`);
    }
  }

  /* 8. Very tight major aspects to the chart's key players */
  const keyPlayers = new Set(['Sun','Moon','Ascendant','MC',ascRuler,timeLord].filter(Boolean));
  // Normalize both aspect families into one shape with explicit chart layers.
  // Only a Solar Return body has a Solar Return house; a natal body never
  // inherits the SR house of the same-named SR planet.
  type PooledAspect = { body1: string; layer1: 'SR' | 'Natal'; body2: string; layer2: 'SR' | 'Natal'; type: string; orb: number; label: string };
  const normType = (t: string) => { const v = String(t || '').trim().toLowerCase(); return v ? v[0].toUpperCase() + v.slice(1) : ''; };
  const pool = (list: any[] | undefined, natalSecond: boolean): PooledAspect[] => (list || []).map((asp: any) => {
    const body1 = asp.planet1 ?? asp.srPlanet ?? '';
    const body2 = asp.planet2 ?? asp.natalPlanet ?? '';
    const layer1: 'SR' | 'Natal' = asp.planet1Source === 'Natal' ? 'Natal' : 'SR';
    const layer2: 'SR' | 'Natal' = asp.planet2Source ? (asp.planet2Source === 'Natal' ? 'Natal' : 'SR') : (natalSecond ? 'Natal' : 'SR');
    const type = normType(asp.type ?? asp.aspectType);
    const orb = Number.isFinite(asp.orb) ? asp.orb : 9;
    const label = asp.label || `${layer1} ${body1} ${type.toLowerCase()} ${layer2} ${body2}`;
    return { body1, layer1, body2, layer2, type, orb, label };
  });
  const aspectPool = [...pool(analysis.srInternalAspects as any[], false), ...pool(analysis.srToNatalAspects as any[], true)];
  const aspectCredit: Record<number, number> = {};
  const definingAspects: { label: string; orb: number; planets: string[] }[] = [];
  const isLead = (b: string) => !MINOR_BODIES.has(b) && !SECONDARY_BODIES.has(b);
  for (const asp of aspectPool) {
    const { body1: p1, body2: p2, type, orb, label } = asp;
    if (!MAJOR_ASPECTS.has(type)) continue;
    // Defining contacts are between primary factors only (no Chiron, Nodes or asteroids).
    if (!isLead(p1) || !isLead(p2)) continue;
    if (!keyPlayers.has(p1) && !keyPlayers.has(p2)) continue;
    const involvesLord = [p1, p2].some(p => p === timeLord || p === 'Sun' || p === 'Moon');
    if (orb > (involvesLord ? 3 : 2)) continue;
    if (!definingAspects.some(d => d.label === label)) definingAspects.push({ label, orb, planets: [p1, p2] });
    const srBodies = [asp.layer1 === 'SR' ? p1 : null, asp.layer2 === 'SR' ? p2 : null].filter(Boolean) as string[];
    for (const p of srBodies) {
      const h = houses[p];
      if (!h) continue;
      if ((aspectCredit[h] || 0) >= 8) continue; // cap so aspect count cannot dominate
      aspectCredit[h] = (aspectCredit[h] || 0) + 4;
      add(h, 4, 'tight-aspect', `${label} at ${orb}° is tight enough to be a defining contact of the year.`);
    }
  }
  definingAspects.sort((a, b) => a.orb - b.orb);

  /* 10. Minor bodies may only reinforce a theme that already exists */
  for (const body of Object.keys(houses)) {
    if (!MINOR_BODIES.has(body) && !SECONDARY_BODIES.has(body)) continue;
    const h = houses[body];
    if (!h) continue;
    if ((buckets[h]?.score || 0) < 8) continue;
    add(h, 1, 'minor-reinforcement');
  }

  /* ── Rank ── */
  let ranked = Object.entries(buckets)
    .map(([h, b]) => ({ house: parseInt(h, 10), ...b }))
    .sort((a, b) => (b.score - a.score) || (b.kinds.size - a.kinds.size))
    .filter(t => t.score >= 8)
    .slice(0, 5);

  // Ordering guarantee: the profected house and the Sun's house always outrank a
  // house that qualifies mainly because the Time Lord happens to sit there.
  const primaryHouses = [sunHouse, profHouse].filter(Boolean) as number[];
  const isTimeLordOnly = (t: typeof ranked[number]): boolean => {
    if (primaryHouses.includes(t.house)) return false;
    const kinds = [...t.kinds];
    const structural = kinds.filter(k => ['sr-sun', 'profection', 'stellium', 'sign-stellium', 'sr-ascendant', 'chart-ruler'].includes(k));
    return structural.length === 0 && kinds.some(k => k.startsWith('time-lord'));
  };
  ranked = [
    ...ranked.filter(t => primaryHouses.includes(t.house)).sort((a, b) => b.score - a.score),
    ...ranked.filter(t => !primaryHouses.includes(t.house) && !isTimeLordOnly(t)),
    ...ranked.filter(t => !primaryHouses.includes(t.house) && isTimeLordOnly(t)),
  ];

  const themes: YearTheme[] = ranked.map(t => ({
    house: t.house,
    key: HOUSE_KEY[t.house] || `house-${t.house}`,
    title: HOUSE_TITLE[t.house] || `House ${t.house}`,
    score: Math.round(t.score),
    reinforcements: t.kinds.size,
    signatures: t.signatures.slice(0, 5),
    summary: '',
  }));

  const ctx: StoryContext = {
    analysis, houses, ascSign, ascRuler, ascRulerHouse, ascRulerSign,
    sunHouse, sunSign, sunDignity, moonHouse, moonSign,
    profHouse, timeLord, timeLordHouse, timeLordSign,
    topHouses: themes.map(t => t.house),
    definingAspects,
  };

  for (const theme of themes) theme.summary = buildThemeSummary(theme.house, ctx);

  return {
    coreStory: buildCoreStory(themes, ctx),
    themes,
    hierarchy: buildHierarchy(ctx),
    whatYouNeedToKnow: buildWhatYouNeedToKnow(themes, ctx),
    reflectionQuestion: buildReflectionQuestion(themes, ctx),
  };
}

/* ── Helpers reading the analysis object ── */

interface StoryContext {
  analysis: SolarReturnAnalysis;
  houses: Record<string, number | null>;
  ascSign: string;
  ascRuler: string;
  ascRulerHouse: number | null;
  ascRulerSign: string;
  sunHouse: number | null;
  sunSign: string;
  sunDignity: string;
  moonHouse: number | null;
  moonSign: string;
  profHouse: number | null;
  timeLord: string;
  timeLordHouse: number | null;
  timeLordSign: string;
  topHouses: number[];
  definingAspects: { label: string; orb: number; planets: string[] }[];
}

function signOf(analysis: SolarReturnAnalysis, planet: string): string {
  const overlay = (analysis.houseOverlays || []).find(o => o.planet === planet);
  return overlay?.srSign || '';
}

function dignityOf(analysis: SolarReturnAnalysis, planet: string): string {
  const rows = (analysis.dignityReport as any)?.planets || (analysis.dignityReport as any)?.entries || [];
  const row = Array.isArray(rows) ? rows.find((r: any) => r.planet === planet) : null;
  return row?.dignity || '';
}

/** Sign on the real Solar Return cusp. No Ascendant-derived whole-sign fallback:
 *  without a stored cusp, the ruler link is simply not made. */
function cuspSignOf(analysis: SolarReturnAnalysis, house: number): string {
  return analysis.srCuspSigns?.[house] || '';
}

/* ── Copy builders (tentative language, no medical claims, no em dashes) ── */

function planetsInHouse(ctx: StoryContext, house: number): string[] {
  return CORE_PLANETS.filter(p => ctx.houses[p] === house);
}

function buildThemeSummary(house: number, ctx: StoryContext): string {
  if (house === ctx.profHouse) return solarReturnProfectionMeaning(house, ctx.timeLord, ctx.timeLordHouse);
  const planet = house === ctx.sunHouse ? 'Sun' : house === ctx.moonHouse ? 'Moon' : house === ctx.ascRulerHouse ? ctx.ascRuler : planetsInHouse(ctx, house)[0] || 'Sun';
  return solarReturnHouseMeaning(house, planet);
}

function buildCoreStory(themes: YearTheme[], ctx: StoryContext): string {
  return themes.slice(0, 2).map(t => t.summary).join('\n\n');
}

function areaPhrase(house: number): string {
  const map: Record<number, string> = {
    1: 'identity and how you present yourself',
    2: 'money, values and self-worth',
    3: 'communication and learning',
    4: 'home, family and foundations',
    5: 'creativity and romance',
    6: 'daily structure, workload and sustainability',
    7: 'relationships, partnerships and agreements',
    8: 'depth, shared resources and psychological change',
    9: 'study, travel and worldview',
    10: 'career, direction and visibility',
    11: 'community and future plans',
    12: 'private reflection and inner patterns',
  };
  return map[house] || `house ${house} matters`;
}

function buildHierarchy(ctx: StoryContext): { label: string; detail: string }[] {
  const rows: { label: string; detail: string }[] = [];
  if (ctx.ascSign) rows.push({ label: 'Solar Return Ascendant', detail: `${ctx.ascSign} rising, which sets the tone for how you meet the year.` });
  if (ctx.ascRuler) rows.push({ label: 'Solar Return chart ruler', detail: `${ctx.ascRuler}${ctx.ascRulerSign ? ` in ${ctx.ascRulerSign}` : ''}${ctx.ascRulerHouse ? `, ${ordinal(ctx.ascRulerHouse)} house` : ''}.` });
  if (ctx.sunHouse) rows.push({ label: 'Solar Return Sun', detail: `${ctx.sunSign || ''}${ctx.sunSign ? ', ' : ''}${ordinal(ctx.sunHouse)} house${ctx.sunDignity && STRONG_DIGNITY.has(ctx.sunDignity) ? `, in ${ctx.sunDignity.toLowerCase()}` : ''}.` });
  if (ctx.moonHouse) rows.push({ label: 'Solar Return Moon', detail: `${ctx.moonSign || ''}${ctx.moonSign ? ', ' : ''}${ordinal(ctx.moonHouse)} house.` });
  const ang = (ctx.analysis.angularPlanetsDetailed || []).filter(a => !MINOR_BODIES.has(a.planet) && !SECONDARY_BODIES.has(a.planet));
  if (ang.length) rows.push({ label: 'Angular planets', detail: ang.map(a => `${a.planet} near the ${a.angle} (${a.orb}°)`).join(', ') + '.' });
  const st = (ctx.analysis.stelliums || []).filter(s => (s.planets || []).filter(p => CORE_PLANETS.includes(p)).length >= 3);
  if (st.length) rows.push({ label: 'Concentrations', detail: st.map(s => `${s.location}: ${(s.planets || []).join(', ')}`).join(' | ') + '.' });
  if (ctx.profHouse) rows.push({ label: 'Annual Profection Time Lord', detail: `${ctx.timeLord || 'not available'}, from the ${ordinal(ctx.profHouse)} house profection${ctx.timeLordHouse ? `, placed in the Solar Return ${ordinal(ctx.timeLordHouse)} house` : ''}.` });
  return rows;
}

function buildWhatYouNeedToKnow(themes: YearTheme[], ctx: StoryContext): { heading: string; body: string }[] {
  return themes.slice(0, 3).map((theme, i) => ({
    heading: i === 0 ? 'What matters most' : i === 1 ? 'What also needs your time' : 'What to notice',
    body: theme.summary,
  }));
}

function buildReflectionQuestion(themes: YearTheme[], ctx: StoryContext): string {
  const t = themes.map(x => x.house);
  if (t.includes(11) && t.includes(7)) return 'Which people and which plans am I choosing on purpose, and which ones am I simply used to?';
  if (t.includes(10) && t.includes(6)) return 'Do I have a life capable of holding the growth I am asking for?';
  if (t.includes(7)) return 'Does this belong in the life I am trying to build?';
  if (t.includes(2)) return 'What am I actually willing to accept, and what is that costing me?';
  if (t.includes(12) || t.includes(4)) return 'What am I ready to stop carrying?';
  return 'What am I building, and does my daily life reflect it?';
}

const capitalise = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

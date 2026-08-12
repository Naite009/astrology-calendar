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
  /** Ordered "what the chart emphasises most" list, for transparency */
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

/** Sign to the house whose life area it naturally colours */
const SIGN_NATURAL_HOUSE: Record<string, number> = {
  Aries: 1, Taurus: 2, Gemini: 3, Cancer: 4, Leo: 5, Virgo: 6,
  Libra: 7, Scorpio: 8, Sagittarius: 9, Capricorn: 10, Aquarius: 11, Pisces: 12,
};

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
    add(SIGN_NATURAL_HOUSE[ascSign], 6, 'sr-ascendant',
      `${ascSign} rising on the Solar Return sets the tone for how you meet the year.`);
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
    if (MINOR_BODIES.has(ang.planet)) continue;
    const actual = houses[ang.planet] ?? ang.house;
    const w = (PLANET_WEIGHT[ang.planet] || 3) * 0.9;
    add(actual, w, 'angular',
      `${ang.planet} is angular, within ${ang.orb}° of the ${ang.angle}, which raises its volume all year.`);
    // A planet conjunct an angle also colours that angle's house, at lower weight,
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
  const aspectPool = [...(analysis.srInternalAspects || []), ...(analysis.srToNatalAspects || [])];
  const aspectCredit: Record<number, number> = {};
  const definingAspects: { label: string; orb: number; planets: string[] }[] = [];
  for (const asp of aspectPool) {
    const p1 = (asp as any).planet1 || '';
    const p2 = (asp as any).planet2 || '';
    const type = (asp as any).type || '';
    const orb = (asp as any).orb ?? 9;
    if (!MAJOR_ASPECTS.has(type)) continue;
    if (MINOR_BODIES.has(p1) || MINOR_BODIES.has(p2)) continue;
    if (!keyPlayers.has(p1) && !keyPlayers.has(p2)) continue;
    // Contacts involving the Time Lord or a luminary stay defining out to 3 degrees.
    const involvesLord = p1 === timeLord || p2 === timeLord || p1 === 'Sun' || p2 === 'Sun' || p1 === 'Moon' || p2 === 'Moon';
    if (orb > (involvesLord ? 3 : 2)) continue;
    const label = (asp as any).label || `${p1} ${type.toLowerCase()} ${p2}`;
    if (!definingAspects.some(d => d.label === label)) definingAspects.push({ label, orb, planets: [p1, p2] });
    for (const p of [p1, p2]) {
      const h = houses[p];
      if (!h) continue;
      if ((aspectCredit[h] || 0) >= 8) continue; // cap so aspect count cannot dominate
      aspectCredit[h] = (aspectCredit[h] || 0) + 4;
      add(h, 4, 'tight-aspect',
        `${(asp as any).label || `${p1} ${type.toLowerCase()} ${p2}`} at ${orb}° is tight enough to be a defining contact of the year.`);
    }
  }

  /* 10. Minor bodies may only reinforce a theme that already exists */
  for (const body of Object.keys(houses)) {
    if (!MINOR_BODIES.has(body)) continue;
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

function cuspSignOf(analysis: SolarReturnAnalysis, house: number): string {
  if (house === 1) return analysis.yearlyTheme?.ascendantSign || '';
  // Derive from whole-sign order off the SR Ascendant when cusp data is not exposed here.
  const asc = analysis.yearlyTheme?.ascendantSign || '';
  const idx = SIGNS.indexOf(asc);
  if (idx < 0) return '';
  return SIGNS[(idx + house - 1) % 12];
}

/* ── Copy builders (tentative language, no medical claims, no em dashes) ── */

function planetsInHouse(ctx: StoryContext, house: number): string[] {
  return CORE_PLANETS.filter(p => ctx.houses[p] === house);
}

function buildThemeSummary(house: number, ctx: StoryContext): string {
  const occupants = planetsInHouse(ctx, house);
  const list = occupants.length ? occupants.join(', ') : '';
  const isProf = ctx.profHouse === house;
  const hasTimeLord = ctx.timeLordHouse === house;
  const hasSun = ctx.sunHouse === house;
  const hasMoon = ctx.moonHouse === house;
  const hasRuler = ctx.ascRulerHouse === house;

  const parts: string[] = [];

  switch (house) {
    case 10:
      parts.push('Career, direction and visibility can become one of the loudest stories of the year.');
      if (occupants.length >= 3) {
        parts.push(`With ${list} gathered here, the chart places particular emphasis on being seen and taken seriously. The Sun makes identity and purpose visible, Mercury puts weight on how you communicate and decide, and Jupiter tends to widen the field of what is possible.`);
      }
      parts.push('This can show up as recognition, more responsibility, a change of role, or a stronger need to build something that actually reflects who you are becoming. It does not promise a specific job event.');
      break;
    case 7:
      parts.push('Relationships and agreements can become more consequential this year.');
      if (isProf) parts.push('The annual profection activates this house, which puts romantic partnerships, important one to one connections, business partners, clients and contracts near the centre of the year.');
      if (ctx.timeLordHouse === 6) parts.push('Because the Time Lord sits in the sixth house, practical realities like time, workload and routine may be what reveals which relationships and agreements can actually be sustained.');
      parts.push('Questions of commitment, reciprocity and long term compatibility may carry more weight than usual. That is not a prediction of marriage or of ending anything.');
      break;
    case 6:
      parts.push('Daily life, workload, routines and what you can realistically maintain come into focus.');
      if (hasTimeLord && ctx.timeLord === 'Saturn') parts.push('Saturn here reads as sustainability rather than restriction. The useful question is whether your current structure can hold what you are asking your life to carry.');
      parts.push('Discipline, boundaries, pacing, rest and consistency matter more than intensity. Taking physical wellbeing seriously and avoiding burnout belong in this theme, without turning symbolism into a health forecast.');
      break;
    case 2:
      parts.push('Money, values and self-worth are linked this year rather than separate.');
      if (hasMoon) parts.push(`The Moon in ${ctx.moonSign || 'this house'} here suggests that emotional security, independence and what makes you feel steady are tied to your resources and income.`);
      if (ctx.topHouses.includes(10)) parts.push('Because the career emphasis is strong, growing professionally may change what you believe you are worth, and getting clearer about your value may change what you are willing to accept at work.');
      break;
    case 12:
      parts.push('Some of the most important movement this year may happen privately.');
      if (hasRuler) parts.push(`${ctx.ascRuler}, the ruler of the year, sits here, so the outward story has an inward counterpart. You may become more conscious of old patterns, of what you do to keep things comfortable, and of what you genuinely value versus what you have learned to accommodate.`);
      parts.push('This can look like reflection, rest, therapy, closure, or quietly letting go of a version of yourself that no longer fits.');
      break;
    case 4:
      parts.push('Home, family and the foundation you are building can be under review.');
      parts.push('Your sense of security, belonging and what you want your private life to feel like may change substantially, even while the visible story is about something else.');
      break;
    case 1:
      parts.push('Identity, presence and how you meet people are emphasised.');
      if (ctx.ascSign) parts.push(`${ctx.ascSign} rising on the return shapes the approach you lead with this year.`);
      break;
    case 8:
      parts.push('Depth, shared resources and psychological change are emphasised.');
      parts.push('You may find yourself dealing with what is actually underneath a situation rather than its surface, including joint money, trust and control.');
      break;
    case 5:
      parts.push('Creativity, romance and self-expression carry more weight this year.');
      break;
    case 3:
      parts.push('Communication, learning and everyday contact are emphasised.');
      break;
    case 9:
      parts.push('Travel, study and your working worldview are emphasised.');
      break;
    case 11:
      parts.push('Community, friendship and where you are heading next are emphasised.');
      break;
  }

  if (hasSun && house !== 10) parts.push(`The Solar Return Sun is here, which keeps this area near the centre of the year.`);
  return parts.join(' ');
}

function buildCoreStory(themes: YearTheme[], ctx: StoryContext): string {
  if (!themes.length) return 'This return reads as a steadier year with no single area dominating. The chart asks for maintenance and refinement more than reinvention.';

  const [t1, t2, t3] = themes;
  const parts: string[] = [];

  parts.push(`This can be a year organised around ${areaPhrase(t1.house)}${t2 ? `, with ${areaPhrase(t2.house)} close behind` : ''}.`);

  if (ctx.sunHouse) {
    parts.push(`The Solar Return Sun in the ${ordinal(ctx.sunHouse)} house${ctx.sunSign ? ` in ${ctx.sunSign}` : ''} sets that focus, and it is repeated by other independent signatures rather than resting on one placement.`);
  }
  if (ctx.profHouse) {
    parts.push(`The annual profection to the ${ordinal(ctx.profHouse)} house adds ${areaPhrase(ctx.profHouse)} as a second layer${ctx.timeLordHouse ? `, and because ${ctx.timeLord} is in the ${ordinal(ctx.timeLordHouse)} house, that layer is likely to be worked out through ${areaPhrase(ctx.timeLordHouse)}` : ''}.`);
  }
  if (t3) {
    parts.push(`Underneath the visible part of the year there is a quieter process involving ${areaPhrase(t3.house)}.`);
  }
  parts.push('The honest summary is that your choices carry more weight this year than usual, and the chart asks you to be deliberate about what you are building and who or what belongs in it.');

  return parts.join(' ');
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
  if (ctx.ascRuler) rows.push({ label: 'Ruler of the year (Solar Return Ascendant ruler)', detail: `${ctx.ascRuler}${ctx.ascRulerSign ? ` in ${ctx.ascRulerSign}` : ''}${ctx.ascRulerHouse ? `, ${ordinal(ctx.ascRulerHouse)} house` : ''}.` });
  if (ctx.sunHouse) rows.push({ label: 'Solar Return Sun', detail: `${ctx.sunSign || ''}${ctx.sunSign ? ', ' : ''}${ordinal(ctx.sunHouse)} house${ctx.sunDignity && STRONG_DIGNITY.has(ctx.sunDignity) ? `, in ${ctx.sunDignity.toLowerCase()}` : ''}.` });
  if (ctx.moonHouse) rows.push({ label: 'Solar Return Moon', detail: `${ctx.moonSign || ''}${ctx.moonSign ? ', ' : ''}${ordinal(ctx.moonHouse)} house.` });
  const ang = (ctx.analysis.angularPlanetsDetailed || []).filter(a => !MINOR_BODIES.has(a.planet));
  if (ang.length) rows.push({ label: 'Angular planets', detail: ang.map(a => `${a.planet} near the ${a.angle} (${a.orb}°)`).join(', ') + '.' });
  const st = (ctx.analysis.stelliums || []).filter(s => (s.planets || []).filter(p => CORE_PLANETS.includes(p)).length >= 3);
  if (st.length) rows.push({ label: 'Concentrations', detail: st.map(s => `${s.location}: ${(s.planets || []).join(', ')}`).join(' | ') + '.' });
  if (ctx.profHouse) rows.push({ label: 'Annual Profection Time Lord', detail: `${ctx.timeLord || 'not available'}, from the ${ordinal(ctx.profHouse)} house profection${ctx.timeLordHouse ? `, placed in the Solar Return ${ordinal(ctx.timeLordHouse)} house` : ''}.` });
  return rows;
}

function buildWhatYouNeedToKnow(themes: YearTheme[], ctx: StoryContext): { heading: string; body: string }[] {
  const t = themes.map(x => x.house);
  const out: { heading: string; body: string }[] = [];

  out.push({
    heading: 'What is changing',
    body: themes.length
      ? `This is not a background year. ${capitalise(areaPhrase(t[0]))} is becoming more important${t[1] ? `, and ${areaPhrase(t[1])} becomes more consequential alongside it` : ''}. The chart places emphasis on a small number of areas rather than spreading itself thin.`
      : 'The year reads as steady. Refinement matters more than reinvention.',
  });

  out.push({
    heading: 'What matters most',
    body: themes.slice(0, 3).map(x => capitalise(areaPhrase(x.house))).join('. ') + '. These themes reinforce each other, so progress in one tends to move the others.',
  });

  const challengeHouse = t.includes(6) ? 6 : t.includes(12) ? 12 : t[t.length - 1];
  out.push({
    heading: 'What might be challenging',
    body: challengeHouse === 6
      ? 'Opportunity may increase, and so may responsibility. The real challenge is building routines, pacing and boundaries capable of supporting the growth you are asking for. Pushing harder is not the same as being effective.'
      : `The stretch is likely to sit in ${areaPhrase(challengeHouse)}. Expect to be asked for more honesty and more structure there than feels comfortable at first.`,
  });

  out.push({
    heading: 'Where the opportunity is',
    body: t.includes(10)
      ? 'Visibility and credibility are available this year. Saying yes to the right level of responsibility, and being clear about what you want to be known for, can move things a long way.'
      : `The opening is in ${areaPhrase(t[0] || 1)}. Deliberate, unglamorous consistency is what converts it into something real.`,
  });

  out.push({
    heading: 'What to pay attention to',
    body: [
      t.includes(2) && t.includes(10) ? 'The link between what you earn, what you believe you are worth, and what you are willing to accept professionally.' : '',
      t.includes(7) ? 'Reciprocity in your closest relationships and agreements, including the practical division of labour.' : '',
      t.includes(6) ? 'Your workload, sleep, pacing and the difference between busy and effective.' : '',
      t.includes(12) || t.includes(4) ? 'A quieter internal restructuring around security, home, old patterns and the kind of life you actually want.' : '',
    ].filter(Boolean).join(' ') || 'The small, repeated decisions rather than the dramatic ones.',
  });

  out.push({
    heading: 'What would help you use the year well',
    body: 'Choose fewer things and commit to them properly. Put structure under anything you want to grow, say the practical part out loud in your relationships and agreements, and check whether your current routine could hold the version of your life you say you want.',
  });

  return out;
}

function buildReflectionQuestion(themes: YearTheme[], ctx: StoryContext): string {
  const t = themes.map(x => x.house);
  if (t.includes(10) && t.includes(6)) return 'Do I have a life capable of holding the growth I am asking for?';
  if (t.includes(7)) return 'Does this belong in the life I am trying to build?';
  if (t.includes(2)) return 'What am I actually willing to accept, and what is that costing me?';
  if (t.includes(12) || t.includes(4)) return 'What am I ready to stop carrying?';
  return 'What am I building, and does my daily life reflect it?';
}

const capitalise = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

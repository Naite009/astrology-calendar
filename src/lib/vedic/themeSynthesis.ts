/**
 * Repeated-theme engine for the Vedic tab.
 *
 * Principle: one placement contributes to a conclusion, it never equals a
 * conclusion. Nothing here states a theme unless at least two independent parts
 * of the chart point the same way, and every theme carries its evidence trail so
 * the user can open "Why?" and see exactly what produced it.
 *
 * Sources scanned for each theme: lagna, lagna lord, Moon, Sun, house
 * occupancy, house rulers, planetary dignity, conjunctions, nakshatra lords,
 * Atmakaraka, Rahu and Ketu, and the relevant divisional chart.
 *
 * Western evidence is read from the same person's tropical chart, with Placidus
 * houses, and is only reported when it genuinely exists. Agreement is never
 * forced.
 */

import { ordinal } from '@/lib/solarReturnConstants';
import type { NatalChart } from '@/hooks/useNatalChart';
import { VedicChart, VedicBody, houseLord, bodiesInHouse } from './siderealChart';
import { VargaChart } from './divisionalCharts';
import { KarakaAssignment, findKaraka } from './karakas';
import { VedicPlanet } from './nakshatras';
import { SIGN_LORDS } from './vedicDignity';
import { houseForLongitude, toAbsoluteLongitude } from '@/lib/houseForLongitude';

export interface Evidence {
  /** The technical fact, kept precise. */
  fact: string;
  /** Why that fact supports the theme, in plain language. */
  why: string;
}

export type SynthesisState = 'repeated' | 'adds-layer' | 'tension';

export interface VedicTheme {
  key: string;
  /** Short all-caps banner, e.g. DEEP */
  label: string;
  /** One plain-English sentence a beginner can hold. */
  plain: string;
  vedic: Evidence[];
  western: Evidence[];
  /** How the two systems line up on this theme. */
  state: SynthesisState;
  synthesis: string;
  score: number;
}

const WATER = ['Cancer', 'Scorpio', 'Pisces'];
const AIR = ['Gemini', 'Libra', 'Aquarius'];
const EARTH = ['Taurus', 'Virgo', 'Capricorn'];
const FIRE = ['Aries', 'Leo', 'Sagittarius'];

const HOUSE_WORD: Record<number, string> = {
  1: 'the self and how you come across', 2: 'income, speech and self-worth',
  3: 'communication, skills and daily effort', 4: 'home, family and inner base',
  5: 'creativity, children and what you enjoy', 6: 'work, routine and problem solving',
  7: 'close one-to-one partnership', 8: 'private matters, depth and shared resources',
  9: 'belief, teachers and the bigger picture', 10: 'career, responsibility and public role',
  11: 'gains, networks and community', 12: 'privacy, retreat and inner life',
};

type Ctx = {
  chart: VedicChart;
  vargas: Record<'D2' | 'D7' | 'D9' | 'D10' | 'D12', VargaChart>;
  karakas: KarakaAssignment[];
  natal: NatalChart | null;
};

const bodyRef = (b: VedicBody) =>
  `${b.name} in ${b.sign}${b.house ? `, house ${b.house}` : ''}`;

function ak(ctx: Ctx): VedicPlanet | null {
  return findKaraka(ctx.karakas, 'Atmakaraka')?.planet || null;
}

function rulesHouses(chart: VedicChart, planet: VedicPlanet): number[] {
  const out: number[] = [];
  for (let h = 1; h <= 12; h++) {
    const hl = houseLord(chart, h);
    if (hl && hl.lord === planet) out.push(h);
  }
  return out;
}

/* ------------------------------------------------------------ Vedic scan -- */

function depthEvidence(ctx: Ctx): Evidence[] {
  const { chart } = ctx;
  const out: Evidence[] = [];
  const moon = chart.byName.Moon;
  if (moon && (moon.house === 8 || moon.house === 12 || WATER.includes(moon.sign))) {
    out.push({
      fact: bodyRef(moon),
      why: `The Moon carries emotional processing, and ${moon.house === 8 ? 'the eighth house is where private, deeper material is handled' : moon.house === 12 ? 'the twelfth house is inner and unseen territory' : 'a water sign processes through feeling rather than logic'}.`,
    });
  }
  for (const b of chart.bodies) {
    if (b.name === 'Moon') continue;
    if (b.house === 8 && b.name !== 'Ketu') {
      out.push({ fact: bodyRef(b), why: `Anything in the eighth house pulls toward what sits under the surface rather than what is announced.` });
    } else if (b.sign === 'Scorpio' && ['Jupiter', 'Sun', 'Mars', 'Mercury', 'Venus', 'Saturn'].includes(b.name)) {
      out.push({ fact: bodyRef(b), why: `Scorpio is the sign most associated with wanting to know what is actually going on beneath the polite version.` });
    }
  }
  const d9moon = ctx.vargas.D9.byName.Moon;
  if (moon && d9moon && WATER.includes(d9moon.sign)) {
    out.push({ fact: `Navamsa (D9) Moon in ${d9moon.sign}`, why: 'The D9 shows what holds up over time, and it repeats the same emotional register here.' });
  }
  return out;
}

function privacyEvidence(ctx: Ctx): Evidence[] {
  const { chart } = ctx;
  const out: Evidence[] = [];
  for (const b of chart.bodies) {
    if (b.house === 12 && b.name !== 'Ketu') {
      out.push({ fact: bodyRef(b), why: `Twelfth house placements are traditionally associated with working away from an audience and needing genuine retreat.` });
    }
  }
  const moon = chart.byName.Moon;
  if (moon?.house === 8) out.push({ fact: bodyRef(moon), why: 'An eighth house Moon tends to keep its real processing out of view.' });
  const lagnaLordBody = chart.lagnaLord ? chart.byName[chart.lagnaLord] : undefined;
  if (lagnaLordBody && (lagnaLordBody.house === 12 || lagnaLordBody.house === 8)) {
    out.push({ fact: `Lagna lord ${lagnaLordBody.name} in house ${lagnaLordBody.house}`, why: 'The planet that stands for you sits in a private house, so a lot of the real work happens off stage.' });
  }
  return out;
}

function relationshipEvidence(ctx: Ctx): Evidence[] {
  const { chart, karakas } = ctx;
  const out: Evidence[] = [];
  const seventh = houseLord(chart, 7);
  const occupants = bodiesInHouse(chart, 7).filter(b => b.name !== 'Ketu');
  occupants.forEach(b => out.push({
    fact: bodyRef(b),
    why: 'A planet sitting in the seventh house makes close one-to-one relationship a main arena of development rather than a side theme.',
  }));
  if (seventh) {
    const body = chart.byName[seventh.lord];
    if (body && body.house === 7) {
      out.push({ fact: `${seventh.lord} rules house 7 and sits in house 7`, why: 'The ruler of partnership sitting in its own house doubles the emphasis on that area.' });
    }
    if (body && body.dignity === 'own sign') {
      out.push({ fact: `${seventh.lord} in its own sign ${body.sign}`, why: 'The planet running your partnership house is on familiar ground, which classically reads as capacity rather than difficulty.' });
    }
  }
  const a = ak(ctx);
  if (a && seventh && a === seventh.lord) {
    out.push({ fact: `Atmakaraka is ${a}, which also rules house 7`, why: 'The chart\u2019s most repeated developmental theme and its partnership house run through the same planet, so much of the learning may happen inside close relationships.' });
  }
  const dk = findKaraka(karakas, 'Darakaraka');
  if (dk) out.push({ fact: `Darakaraka ${dk.planet} in ${dk.sign}${dk.house ? `, house ${dk.house}` : ''}`, why: 'One Jaimini indicator for the qualities encountered and developed through important one-to-one bonds.' });
  return out;
}

function builderEvidence(ctx: Ctx): Evidence[] {
  const { chart } = ctx;
  const out: Evidence[] = [];
  const sat = chart.byName.Saturn;
  const a = ak(ctx);
  if (sat) {
    if (sat.dignity === 'own sign' || sat.dignity === 'exalted') {
      out.push({ fact: `Saturn ${sat.dignity} in ${sat.sign}${sat.house ? `, house ${sat.house}` : ''}`, why: 'Saturn stands for development through time, repetition, discipline and accumulated experience, and it is well placed here rather than strained.' });
    }
    if ([1, 4, 7, 10].includes(sat.house || 0)) {
      out.push({ fact: `Saturn in house ${sat.house}`, why: 'Saturn on one of the four structural houses puts responsibility and long-build effort near the center of the chart.' });
    }
    if (a === 'Saturn') out.push({ fact: 'Saturn is the Atmakaraka', why: 'The repeating subject of the chart is patience, responsibility, boundaries, discipline, maturity and building things that last.' });
    const ruled = rulesHouses(chart, 'Saturn');
    if (ruled.length) out.push({ fact: `Saturn rules house ${ruled.join(' and house ')}`, why: `Those areas (${ruled.map(h => HOUSE_WORD[h]).join('; ')}) tend to develop on Saturn\u2019s timetable, which is slower and more durable.` });
  }
  const cap = chart.bodies.filter(b => EARTH.includes(b.sign) && b.name !== 'Ketu' && b.name !== 'Rahu');
  if (cap.length >= 4) out.push({ fact: `${cap.length} bodies in earth signs`, why: 'A weight of earth signs favors steady, testable results over quick ones.' });
  return out;
}

function visibilityEvidence(ctx: Ctx): Evidence[] {
  const { chart } = ctx;
  const out: Evidence[] = [];
  const tenth = houseLord(chart, 10);
  bodiesInHouse(chart, 10).forEach(b => out.push({ fact: bodyRef(b), why: 'A planet in the tenth house puts career, responsibility and public role high on the agenda.' }));
  bodiesInHouse(chart, 1).forEach(b => out.push({ fact: bodyRef(b), why: 'A planet in the first house shows up in how you come across before you say anything.' }));
  const sun = chart.byName.Sun;
  if (sun && [1, 10, 11].includes(sun.house || 0)) out.push({ fact: bodyRef(sun), why: 'The Sun in a visible house is traditionally associated with carrying authority openly.' });
  const d10sun = ctx.vargas.D10.byName.Sun;
  if (d10sun?.house === 10 || d10sun?.house === 1) out.push({ fact: `Dashamsha (D10) Sun in house ${d10sun.house}`, why: 'The career magnifying chart also puts the Sun in a visible position, which supports professional authority.' });
  if (tenth) {
    const body = chart.byName[tenth.lord];
    if (body && [1, 10].includes(body.house || 0)) out.push({ fact: `House 10 lord ${tenth.lord} in house ${body.house}`, why: 'The planet running your career sits in a prominent house.' });
  }
  return out;
}

function mindEvidence(ctx: Ctx): Evidence[] {
  const { chart } = ctx;
  const out: Evidence[] = [];
  const merc = chart.byName.Mercury;
  if (merc && [1, 3, 5, 10, 11].includes(merc.house || 0)) out.push({ fact: bodyRef(merc), why: 'Mercury covers thinking, skill and communication, and it sits somewhere it gets used publicly.' });
  if (merc && (merc.dignity === 'own sign' || merc.dignity === 'exalted')) out.push({ fact: `Mercury ${merc.dignity} in ${merc.sign}`, why: 'Classically well placed, so knowledge and articulation tend to be reliable assets.' });
  bodiesInHouse(chart, 3).filter(b => b.name !== 'Ketu').forEach(b => out.push({ fact: bodyRef(b), why: 'Third house placements emphasize communication, practice and everyday skill building.' }));
  const rahu = chart.byName.Rahu;
  if (rahu && [3, 5, 11].includes(rahu.house || 0)) out.push({ fact: bodyRef(rahu), why: 'Rahu here describes appetite for learning and expression in an area still being practiced.' });
  const airCount = chart.bodies.filter(b => AIR.includes(b.sign) && !['Rahu', 'Ketu'].includes(b.name)).length;
  if (airCount >= 4) out.push({ fact: `${airCount} bodies in air signs`, why: 'Air weight favors thinking, language and exchange as the main tools.' });
  return out;
}

function serviceEvidence(ctx: Ctx): Evidence[] {
  const { chart } = ctx;
  const out: Evidence[] = [];
  bodiesInHouse(chart, 6).filter(b => b.name !== 'Ketu').forEach(b => out.push({ fact: bodyRef(b), why: 'Sixth house placements emphasize routine, problem solving and being the person who handles what needs handling.' }));
  const moon = chart.byName.Moon;
  if (moon && [4, 6, 12].includes(moon.house || 0)) out.push({ fact: bodyRef(moon), why: 'The Moon in a caretaking house links emotional steadiness to looking after people or places.' });
  const jup = chart.byName.Jupiter;
  if (jup && [4, 9, 12].includes(jup.house || 0)) out.push({ fact: bodyRef(jup), why: 'Jupiter here is traditionally associated with guidance, teaching and care.' });
  return out;
}

function expansionEvidence(ctx: Ctx): Evidence[] {
  const { chart } = ctx;
  const out: Evidence[] = [];
  const fire = chart.bodies.filter(b => FIRE.includes(b.sign) && !['Rahu', 'Ketu'].includes(b.name)).length;
  if (fire >= 4) out.push({ fact: `${fire} bodies in fire signs`, why: 'Fire weight favors initiative, conviction and momentum.' });
  bodiesInHouse(chart, 9).filter(b => b.name !== 'Rahu').forEach(b => out.push({ fact: bodyRef(b), why: 'Ninth house placements emphasize belief, teachers, distance from where you started and the bigger picture.' }));
  const jup = chart.byName.Jupiter;
  if (jup && (jup.dignity === 'own sign' || jup.dignity === 'exalted')) out.push({ fact: `Jupiter ${jup.dignity} in ${jup.sign}`, why: 'Jupiter well placed supports perspective, learning and generosity of view.' });
  return out;
}

const THEME_DEFS: Array<{
  key: string; label: string; plain: string; scan: (ctx: Ctx) => Evidence[];
}> = [
  {
    key: 'depth', label: 'DEEP', scan: depthEvidence,
    plain: 'Several parts of this chart point toward emotional depth and a pull to understand what is happening beneath the surface.',
  },
  {
    key: 'privacy', label: 'PRIVATE', scan: privacyEvidence,
    plain: 'There is a repeated need for privacy, retreat and room to process without an audience. It does not mean visibility is unwanted.',
  },
  {
    key: 'relationships', label: 'RELATIONSHIPS MATTER', scan: relationshipEvidence,
    plain: 'Close one-to-one relationships are an important arena for development here. That covers romantic partnership and marriage, and equally important friendships, business partnerships and close collaborations.',
  },
  {
    key: 'builder', label: 'LONG-TERM BUILDER', scan: builderEvidence,
    plain: 'This chart is built more for long-term growth than for quick results. Some strengths may become more obvious with maturity, and repetition tends to pay better than chasing an immediate payoff.',
  },
  {
    key: 'visibility', label: 'RESPONSIBILITY AND VISIBILITY', scan: visibilityEvidence,
    plain: 'Career, responsibility and being accountable for something in public carry real weight in this chart.',
  },
  {
    key: 'mind', label: 'KNOWLEDGE AND COMMUNICATION', scan: mindEvidence,
    plain: 'Thinking, learning, skill and communication show up repeatedly as the main working tools.',
  },
  {
    key: 'service', label: 'CARE AND PROBLEM SOLVING', scan: serviceEvidence,
    plain: 'Looking after people, fixing what is broken and keeping things running are recurring themes.',
  },
  {
    key: 'expansion', label: 'MEANING AND PERSPECTIVE', scan: expansionEvidence,
    plain: 'Belief, learning, teaching and needing the work to mean something recur across this chart.',
  },
];

/* ---------------------------------------------------------- Western scan -- */

function westernPlacements(natal: NatalChart | null) {
  if (!natal?.planets) return [] as Array<{ name: string; sign: string; house: number | null }>;
  const keys = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'] as const;
  return keys.flatMap(k => {
    const p = (natal.planets as Record<string, { sign: string; degree: number; minutes?: number } | undefined>)[k];
    if (!p?.sign) return [];
    const abs = toAbsoluteLongitude(p);
    return [{ name: k, sign: p.sign, house: houseForLongitude(natal, abs) }];
  });
}

function westernEvidence(themeKey: string, natal: NatalChart | null): Evidence[] {
  const pl = westernPlacements(natal);
  if (!pl.length) return [];
  const out: Evidence[] = [];
  const ref = (p: { name: string; sign: string; house: number | null }) =>
    `${p.name} in ${p.sign}${p.house ? `, ${ordinal(p.house)} house` : ''} (tropical, Placidus)`;

  const push = (p: typeof pl[number], why: string) => out.push({ fact: ref(p), why });

  for (const p of pl) {
    switch (themeKey) {
      case 'depth':
        if (['Scorpio', 'Pisces', 'Cancer'].includes(p.sign) && ['Sun', 'Moon', 'Venus', 'Mars'].includes(p.name)) push(p, 'A water sign personal placement in the Western chart also reads as processing through feeling.');
        if (p.house === 8 || p.house === 4) push(p, 'The Western house placement lands in emotionally private territory too.');
        break;
      case 'privacy':
        if (p.house === 12) push(p, 'The Western chart also puts this planet in the twelfth house, the most private sector.');
        if (p.name === 'Moon' && (p.house === 8 || p.house === 12)) push(p, 'The Western Moon is also placed where feeling stays largely unseen.');
        break;
      case 'relationships':
        if (p.house === 7) push(p, 'A seventh house planet in the Western chart repeats the partnership emphasis.');
        if (p.name === 'Saturn' && p.house === 7) push(p, 'Western Saturn in the seventh independently emphasizes commitment and reciprocity as a growth arena.');
        if (p.name === 'Venus' && ['Libra', 'Taurus'].includes(p.sign)) push(p, 'Venus in a sign it rules keeps relating and fairness central.');
        break;
      case 'builder':
        if (p.name === 'Saturn' && [1, 4, 7, 10].includes(p.house || 0)) push(p, 'Western Saturn on an angle also emphasizes structure and long-build effort.');
        if (['Capricorn', 'Virgo', 'Taurus'].includes(p.sign) && ['Sun', 'Moon', 'Saturn'].includes(p.name)) push(p, 'An earth sign core placement in the Western chart supports the same steady build.');
        break;
      case 'visibility':
        if (p.house === 10 || p.house === 1) push(p, 'The Western chart also places this planet in a visible, accountable sector.');
        if (p.name === 'Sun' && ['Leo', 'Aries', 'Capricorn'].includes(p.sign)) push(p, 'The Western Sun sign carries authority comfortably.');
        break;
      case 'mind':
        if (p.name === 'Mercury' && [1, 3, 9, 10, 11].includes(p.house || 0)) push(p, 'Western Mercury is placed where thinking and communication get used publicly.');
        if (['Gemini', 'Virgo', 'Aquarius'].includes(p.sign) && ['Sun', 'Moon', 'Mercury'].includes(p.name)) push(p, 'An air or Mercury-ruled core placement repeats the mental emphasis.');
        break;
      case 'service':
        if (p.house === 6) push(p, 'A sixth house planet in the Western chart repeats the care and problem-solving theme.');
        break;
      case 'expansion':
        if (p.house === 9 || (p.name === 'Jupiter' && ['Sagittarius', 'Pisces', 'Cancer'].includes(p.sign))) push(p, 'The Western chart also emphasizes meaning, belief and perspective.');
        break;
    }
  }
  return out.slice(0, 4);
}

/* ------------------------------------------------------------- assembly -- */

export function buildVedicThemes(
  chart: VedicChart,
  vargas: Ctx['vargas'],
  karakas: KarakaAssignment[],
  natal: NatalChart | null,
): VedicTheme[] {
  const ctx: Ctx = { chart, vargas, karakas, natal };
  const themes: VedicTheme[] = [];

  for (const def of THEME_DEFS) {
    const vedic = dedupe(def.scan(ctx));
    if (vedic.length < 2) continue; // one placement is never a conclusion
    const western = westernEvidence(def.key, natal);
    const state: SynthesisState = western.length >= 2 ? 'repeated' : western.length === 1 ? 'adds-layer' : 'adds-layer';
    themes.push({
      key: def.key,
      label: def.label,
      plain: def.plain,
      vedic,
      western,
      state,
      synthesis: western.length >= 2
        ? 'Both systems independently emphasize this, which is the strongest kind of signal the app can give you.'
        : western.length === 1
          ? 'The Western chart touches this once. The Vedic chart carries more of the weight, so treat this as a layer the sidereal reading adds.'
          : 'The Western chart does not particularly emphasize this. That does not cancel it. It may describe a part of the person that is less obvious in their outward Western pattern.',
      score: vedic.length * 2 + western.length,
    });
  }

  // Apparent tension: privacy plus visibility both present is the common one.
  const priv = themes.find(t => t.key === 'privacy');
  const vis = themes.find(t => t.key === 'visibility');
  if (priv && vis) {
    vis.state = 'tension';
    vis.synthesis = 'This sits in apparent tension with the privacy theme above. Both can be true at once: the person may want responsibility, expertise and standing, while still needing the work itself to happen out of the spotlight. That combination often reads as authority built quietly and then recognized, rather than either hiding or performing.';
  }

  return themes.sort((a, b) => b.score - a.score).slice(0, 5);
}

function dedupe(list: Evidence[]): Evidence[] {
  const seen = new Set<string>();
  return list.filter(e => (seen.has(e.fact) ? false : (seen.add(e.fact), true)));
}

/* ------------------------------------------------ one-minute plain summary */

export interface OneMinute {
  paragraphs: string[];
  banners: Array<{ label: string; items: string[] }>;
}

export function buildOneMinute(
  chart: VedicChart,
  themes: VedicTheme[],
  karakas: KarakaAssignment[],
): OneMinute {
  const paragraphs: string[] = [];
  const lagna = chart.lagnaSign;
  const lagnaLordBody = chart.lagnaLord ? chart.byName[chart.lagnaLord] : undefined;
  const a = findKaraka(karakas, 'Atmakaraka');

  const outsideWord: Record<string, string> = {
    Aries: 'direct, quick to act and hard to slow down',
    Taurus: 'calm, steady and difficult to rush',
    Gemini: 'quick, verbal and easy to talk to',
    Cancer: 'warm, protective and attentive to how people are doing',
    Leo: 'strong, capable, noticeable or self-possessed',
    Virgo: 'precise, useful and quietly competent',
    Libra: 'even-handed, considerate and socially readable',
    Scorpio: 'contained, watchful and hard to read at first',
    Sagittarius: 'open, candid and interested in the bigger point',
    Capricorn: 'composed, responsible and older than your years',
    Aquarius: 'independent, slightly outside the format and unbothered by it',
    Pisces: 'gentle, absorbent and easy to be around',
  };

  if (lagna) {
    const deepThemes = themes.filter(t => t.key === 'depth' || t.key === 'privacy');
    paragraphs.push(
      `This chart describes someone who may come across as ${outsideWord[lagna] || 'distinct in their own way'} on the outside${deepThemes.length ? ', while carrying a deeper and more private inner world underneath' : ''}. ` +
      (lagnaLordBody?.house
        ? `The planet that runs the chart, ${chart.lagnaLord}, sits in the area of ${HOUSE_WORD[lagnaLordBody.house]}, so a lot of the sense of self tends to get worked out there rather than in the abstract.`
        : 'A precise birth time would sharpen this further, because the house structure depends on it.')
    );
  } else {
    paragraphs.push('Without a birth time the rising sign cannot be fixed, so this summary works from the sign-level chart only. Adding an exact time would unlock the house structure and make it considerably more specific.');
  }

  const top = themes.slice(0, 3);
  if (top.length) {
    paragraphs.push(
      `Across several independent parts of the chart, the same few subjects keep repeating: ${top.map(t => t.label.toLowerCase()).join(', ')}. That repetition is what makes them worth trusting. A single placement on its own would not be enough.`
    );
  }

  if (a) {
    const akBody = chart.byName[a.planet];
    const akTheme: Record<VedicPlanet, string> = {
      Saturn: 'patience, responsibility, boundaries, discipline, maturity and building things that last',
      Sun: 'confidence, authority and being willing to be seen as the one responsible',
      Moon: 'emotional honesty, care and knowing what actually settles you',
      Mars: 'courage, directness and using effort well',
      Mercury: 'clear thinking, skill and saying the true thing plainly',
      Jupiter: 'meaning, learning and generosity of perspective',
      Venus: 'values, pleasure, fairness and the quality of close relationships',
      Rahu: 'appetite, unfamiliar territory and learning to regulate reach',
      Ketu: 'release, focus and knowing what to stop carrying',
    };
    paragraphs.push(
      `In Jaimini astrology the Atmakaraka is the planet with the highest relevant degree, treated as a major recurring developmental theme. Think of it as a subject life keeps asking you to study. Here it is ${a.planet}, so the repeating subject is ${akTheme[a.planet]}.` +
      (akBody?.house === 7 || (chart.lagnaSign && houseLord(chart, 7)?.lord === a.planet)
        ? ' Because that same planet is tied to the seventh house, a lot of this learning may happen through close one-to-one relationships.'
        : '')
    );
  }

  paragraphs.push(
    'None of this is a prediction and none of it is a diagnosis. It is a symbolic reading of a birth sky, and it is offered as pattern rather than fact. Every statement above can be traced back to specific placements, which is what the "Why?" panels are for.'
  );

  return {
    paragraphs,
    banners: themes.map(t => ({ label: t.label, items: t.vedic.slice(0, 4).map(e => e.fact) })),
  };
}

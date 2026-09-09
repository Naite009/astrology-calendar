/**
 * Reading Guide engine — the live-reading coach behind the Chart Walkthrough tab.
 *
 * It answers five questions, in this order, for a chart the reader has never seen:
 *   1. where do I look first          -> `startHere`
 *   2. what matters most             -> importance ranking on every item
 *   3. how do these combine          -> `blends` (named, multi-factor)
 *   4. how did you get that sentence -> `chain` on each blend
 *   5. what do I say out loud        -> `whatToSay` / `askThis` / `story`
 *
 * Rules it inherits, not re-implements:
 *   - positions, houses and aspect maths come from the existing chart engine and
 *     the shared orb table (`aspectOrbs`), never from a parallel calculation;
 *   - phrasing passes through the shared language policy, so forbidden wording
 *     cannot re-enter through this surface;
 *   - only the core bodies (10 planets, Ascendant, nodes, Chiron) are used.
 */

import type { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { getHouseForLongitude } from '@/lib/houseCalculations';
import { getReliableAscendant } from '@/lib/chartDataValidation';
import { MAJOR_ASPECTS, getEffectiveOrb } from '@/lib/aspectOrbs';
import { ordinalHouse } from '@/lib/interpretation/ordinals';
import { sanitizeInterpretiveDeep } from '@/lib/interpretation/languagePolicy';
import {
  contactTier, doesNotMeanFor, signalLevelFromCount, rankByEvidence, splitTopFactors,
  type EvidenceTier,
} from '@/lib/interpretation/evidenceStandard';

import {
  AgeStage, AgeContext, buildAgeContext, houseArena, applyStageVocabulary, voiceFor,
} from './ageContext';
import {
  CORE_BODIES, HOUSE_CLUSTER_BODIES, PERSONAL_PLANETS, OUTER_PLANETS,
  BODY_MEANINGS, SIGN_MEANINGS, SIGN_ELEMENT, SIGN_MODALITY, SIGN_RULER,
  ELEMENT_MEANINGS, MODALITY_MEANINGS, LOW_ELEMENT_READING, HOUSE_KEYWORDS,
  bodyLabel, factorChip,
} from './factorMeanings';

const ZODIAC = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export type SignalStrength = 'Strong' | 'Moderate' | 'Single-placement';

export interface CoreBodyPlacement {
  body: string;
  label: string;
  sign: string;
  element: string;
  modality: string;
  degree: number;
  absDeg: number;
  house: number | null;
  isRetrograde: boolean;
}

export interface ReadingFactor {
  label: string;
  meaning: string;
}

export interface BlendCard {
  id: string;
  /** The named theme, e.g. "Competence builds confidence". */
  name: string;
  /** Exact placements that created it. */
  factors: ReadingFactor[];
  /** Visible translation chain, last line begins "Together → ". */
  chain: string[];
  why: string;
  whatToSay: string;
  askThis: string;
  strength: SignalStrength;
  supportCount: number;
  group: 'core' | 'personal-group' | 'growth' | 'outer' | 'nodes' | 'chiron';
  /** Bodies this card rests on, for the shared evidence hierarchy. */
  bodies: string[];
  /** Houses involved, used for the misreading clarifications. */
  houses: number[];
  /** Primary / secondary / supplemental. */
  tier: EvidenceTier;
  /** Concise "what this does not mean" clarifications. */
  doesNotMean: string[];
}


export interface StartHereItem {
  id: string;
  label: string;
  value: string;
  note: string;
  /** 0-100; drives the visual ranking of where to look first. */
  importance: number;
}

export interface HouseCluster {
  house: number;
  bodies: string[];
  keywords: string;
  arena: string;
  theme: string;
}

export interface RankedConnection {
  a: string;
  b: string;
  aspect: string;
  symbol: string;
  orb: number;
  importance: number;
  adds: string;
}

export interface ElementProfile {
  counts: Record<string, number>;
  dominant: string[];
  low: string[];
  lowReadings: Array<{ element: string; headline: string; lines: string[]; note: string }>;
}

export interface ReadingGuide {
  subject: { name: string; birthDate: string; birthTime: string; birthLocation: string };
  age: AgeContext;
  placements: CoreBodyPlacement[];
  bigThree: { sun?: CoreBodyPlacement; moon?: CoreBodyPlacement; ascendant?: CoreBodyPlacement };
  elements: ElementProfile;
  modalities: { counts: Record<string, number>; dominant: string[]; low: string[]; note: string };
  repeatedSigns: Array<{ sign: string; bodies: string[]; note: string }>;
  houseClusters: HouseCluster[];
  chartRuler: { sign: string; ruler: string; placement?: CoreBodyPlacement; note: string } | null;
  startHere: StartHereItem[];
  blends: BlendCard[];
  personalGroups: BlendCard[];
  growth: BlendCard[];
  outerPlanets: { elevated: BlendCard[]; secondaryNote: string };
  nodes: BlendCard | null;
  chiron: BlendCard | null;
  topConnections: RankedConnection[];
  story: string;
}

// ── position helpers ────────────────────────────────────────────────────────
function toAbsDeg(pos: NatalPlanetPosition): number {
  const idx = ZODIAC.indexOf(pos.sign);
  if (idx === -1) return -1;
  return idx * 30 + pos.degree + (pos.minutes || 0) / 60;
}

function houseOf(chart: NatalChart, absDeg: number): number | null {
  if (chart.houseCusps) {
    const h = getHouseForLongitude(absDeg, chart);
    if (h) return h;
  }
  const asc = getReliableAscendant(chart) as NatalPlanetPosition | null;
  if (asc?.sign) {
    const ascDeg = toAbsDeg(asc);
    if (ascDeg >= 0) return Math.floor(((absDeg - ascDeg + 360) % 360) / 30) + 1;
  }
  return null;
}

export function collectCoreBodies(chart: NatalChart): CoreBodyPlacement[] {
  const out: CoreBodyPlacement[] = [];
  for (const body of CORE_BODIES) {
    let pos = chart.planets?.[body as keyof typeof chart.planets] as NatalPlanetPosition | undefined;
    if (body === 'Ascendant') {
      pos = (getReliableAscendant(chart) as NatalPlanetPosition | null) ?? pos;
    }
    if (body === 'SouthNode' && !pos?.sign) {
      const nn = chart.planets?.NorthNode as NatalPlanetPosition | undefined;
      if (nn?.sign) {
        const opp = (toAbsDeg(nn) + 180) % 360;
        pos = {
          sign: ZODIAC[Math.floor(opp / 30)],
          degree: Math.floor(opp % 30),
          minutes: Math.round(((opp % 30) % 1) * 60),
          seconds: 0,
        };
      }
    }
    if (!pos?.sign || !ZODIAC.includes(pos.sign)) continue;
    const absDeg = toAbsDeg(pos);
    const isAngle = body === 'Ascendant';
    out.push({
      body,
      label: bodyLabel(body),
      sign: pos.sign,
      element: SIGN_ELEMENT[pos.sign],
      modality: SIGN_MODALITY[pos.sign],
      degree: pos.degree + (pos.minutes || 0) / 60,
      absDeg,
      house: isAngle ? null : houseOf(chart, absDeg),
      isRetrograde: !!pos.isRetrograde,
    });
  }
  return out;
}

// ── sign phrasing tables ────────────────────────────────────────────────────
/** Short noun for a theme name. */
const SIGN_NOUN: Record<string, string> = {
  Aries: 'Directness', Taurus: 'Steadiness', Gemini: 'Curiosity', Cancer: 'Care',
  Leo: 'Warmth', Virgo: 'Usefulness', Libra: 'Fairness', Scorpio: 'Depth',
  Sagittarius: 'Freedom', Capricorn: 'Competence', Aquarius: 'Independence', Pisces: 'Imagination',
};

/** Verb phrase for a spoken line: "you may feel steadiest when …". */
const SIGN_ACTION: Record<string, string> = {
  Aries: 'you can act on something straight away instead of waiting',
  Taurus: 'things are steady, unhurried, and comfortable',
  Gemini: 'you can talk it through and keep learning new things',
  Cancer: 'the people around you feel close and looked after',
  Leo: 'the effort you put in actually gets noticed',
  Virgo: 'you can make something work better than it did before',
  Libra: 'things feel fair and the atmosphere is pleasant',
  Scorpio: 'you can go all in on something that really matters to you',
  Sagittarius: 'you have room to explore without being fenced in',
  Capricorn: 'you know you are capable and can see your effort paying off',
  Aquarius: 'you can do it your own way rather than the expected way',
  Pisces: 'there is space to imagine, drift, and feel things',
};

const BODY_FRAME: Record<string, { name: (n: string) => string; say: (a: string) => string; ask: string }> = {
  Sun: {
    name: (n) => `${n} as identity`,
    say: (a) => `A lot of who ${'{sub}'} is shows up when ${a}`,
    ask: 'When do you feel most like yourself?',
  },
  Moon: {
    name: (n) => `${n} feels like safety`,
    say: (a) => `${'{Sub}'} may feel steadiest and most settled when ${a}`,
    ask: 'What kind of situation makes you feel most settled?',
  },
  Mercury: {
    name: (n) => `Thinking through ${n.toLowerCase()}`,
    say: (a) => `${'{Sub}'} may take in and explain information best when ${a}`,
    ask: 'How do you like to work something out — out loud, on paper, or in your head first?',
  },
  Venus: {
    name: (n) => `${n} in closeness`,
    say: (a) => `${'{Sub}'} probably warms to people and things most when ${a}`,
    ask: 'What makes you feel comfortable with someone?',
  },
  Mars: {
    name: (n) => `Effort powered by ${n.toLowerCase()}`,
    say: (a) => `${'{Sub}'} tends to put real energy in when ${a}`,
    ask: 'What kind of thing gets you moving without anyone pushing?',
  },
  Ascendant: {
    name: (n) => `First impression: ${n.toLowerCase()}`,
    say: (a) => `People may meet ${'{sub}'} as someone who does best when ${a}`,
    ask: 'Do people usually read you accurately when they first meet you?',
  },
  Jupiter: {
    name: (n) => `Growth comes easier through ${n.toLowerCase()}`,
    say: (a) => `Things tend to open up for ${'{sub}'} when ${a}`,
    ask: 'Where do things tend to come together for you more easily than you expected?',
  },
  Saturn: {
    name: (n) => `${n} built over time`,
    say: (a) => `This is an area where real skill and confidence can build gradually, especially when ${a}`,
    ask: 'What is something you were not good at at first and got better at?',
  },
  Uranus: {
    name: (n) => `${n} as a signature`,
    say: (a) => `There can be a preference for doing things a different way, especially when ${a}`,
    ask: 'Where do you notice you would rather not do it the standard way?',
  },
  Neptune: {
    name: (n) => `${n} and sensitivity`,
    say: (a) => `Imagination and atmosphere may matter more here than they look, especially when ${a}`,
    ask: 'Do you pick up on the mood of a room quickly?',
  },
  Pluto: {
    name: (n) => `${n} at full strength`,
    say: (a) => `When something matters here, it tends to matter completely, especially when ${a}`,
    ask: 'What is something you get properly serious about?',
  },
};

function subjectWords(stage: AgeStage) {
  return voiceFor(stage) === 'you'
    ? { sub: 'you', Sub: 'You', your: 'your', Your: 'Your' }
    : { sub: 'they', Sub: 'They', your: 'their', Your: 'Their' };
}

function speak(template: string, stage: AgeStage): string {
  const { sub, Sub, your, Your } = subjectWords(stage);
  let out = template
    .replace(/\{sub\}/g, sub)
    .replace(/\{Sub\}/g, Sub)
    .replace(/\{your\}/g, your)
    .replace(/\{Your\}/g, Your);
  out = applyStageVocabulary(out, stage);
  if (!/[.!?]$/.test(out)) out += '.';
  return out.charAt(0).toUpperCase() + out.slice(1);
}

/**
 * Signal strength comes from the shared evidence standard so the Reading Guide,
 * the natal surfaces and synastry all use the same thresholds.
 */
function strengthFor(count: number, tightCentral = false): SignalStrength {
  const level = signalLevelFromCount(count, tightCentral);
  return level === 'strong' ? 'Strong' : level === 'moderate' ? 'Moderate' : 'Single-placement';
}

/** Evidence-tier + "what this does not mean" fields for any blend card. */
function evidenceFields(
  bodies: string[],
  houses: Array<number | null | undefined>,
  opts: { retrograde?: boolean; tense?: boolean } = {}
): Pick<BlendCard, 'bodies' | 'houses' | 'tier' | 'doesNotMean'> {
  const cleanHouses = houses.filter((h): h is number => typeof h === 'number' && h > 0);
  return {
    bodies,
    houses: cleanHouses,
    tier: contactTier(bodies),
    doesNotMean: doesNotMeanFor({
      bodies,
      houses: cleanHouses,
      isRetrograde: opts.retrograde,
      aspectTone: opts.tense ? 'tense' : undefined,
    }),
  };
}


// ── aspects ─────────────────────────────────────────────────────────────────
const IMPORTANCE_WEIGHT: Record<string, number> = {
  Sun: 10, Moon: 10, Ascendant: 10, Mercury: 8, Venus: 8, Mars: 8,
  Jupiter: 6, Saturn: 6, Uranus: 4, Neptune: 4, Pluto: 5,
  NorthNode: 4, SouthNode: 3, Chiron: 3,
};

const ASPECT_ADDS: Record<string, string> = {
  conjunction: 'these two work as one unit — you rarely get one without the other',
  opposition: 'these two pull in different directions and need a working balance',
  square: 'these two create friction that usually pushes real effort',
  trine: 'these two support each other easily, often without being noticed',
  sextile: 'these two help each other when there is a reason to use them',
};

export function rankConnections(placements: CoreBodyPlacement[], limit = 5): RankedConnection[] {
  const list: RankedConnection[] = [];
  for (let i = 0; i < placements.length; i++) {
    for (let j = i + 1; j < placements.length; j++) {
      const a = placements[i];
      const b = placements[j];
      // The node axis opposition is automatic geometry, never a "top connection".
      const pair = [a.body, b.body].sort().join('|');
      if (pair === 'NorthNode|SouthNode') continue;
      let sep = Math.abs(a.absDeg - b.absDeg);
      if (sep > 180) sep = 360 - sep;
      for (const asp of MAJOR_ASPECTS) {
        const orb = Math.abs(sep - asp.angle);
        if (orb > getEffectiveOrb(a.body, b.body, asp.name)) continue;
        const weight = (IMPORTANCE_WEIGHT[a.body] ?? 3) + (IMPORTANCE_WEIGHT[b.body] ?? 3);
        const tightness = Math.max(0, 8 - orb);
        list.push({
          a: a.label,
          b: b.label,
          aspect: asp.name,
          symbol: asp.symbol,
          orb: Math.round(orb * 10) / 10,
          importance: Math.round(weight * 2 + tightness * 3),
          adds: ASPECT_ADDS[asp.name] ?? 'these two are linked in the chart',
        });
        break;
      }
    }
  }
  return list.sort((x, y) => y.importance - x.importance).slice(0, limit);
}

function aspectsTo(body: string, placements: CoreBodyPlacement[]): Array<{ other: CoreBodyPlacement; aspect: string; orb: number }> {
  const me = placements.find((p) => p.body === body);
  if (!me) return [];
  const out: Array<{ other: CoreBodyPlacement; aspect: string; orb: number }> = [];
  for (const other of placements) {
    if (other.body === me.body) continue;
    let sep = Math.abs(me.absDeg - other.absDeg);
    if (sep > 180) sep = 360 - sep;
    for (const asp of MAJOR_ASPECTS) {
      const orb = Math.abs(sep - asp.angle);
      if (orb <= getEffectiveOrb(me.body, other.body, asp.name)) {
        out.push({ other, aspect: asp.name, orb: Math.round(orb * 10) / 10 });
        break;
      }
    }
  }
  return out.sort((a, b) => a.orb - b.orb);
}

// ── the guide ───────────────────────────────────────────────────────────────
export interface ReadingGuideOptions {
  stageOverride?: AgeStage | null;
  now?: Date;
}

export function buildReadingGuide(chart: NatalChart, options: ReadingGuideOptions = {}): ReadingGuide {
  const stageCtx = buildAgeContext(chart.birthDate, options.stageOverride ?? null, options.now ?? new Date());
  const stage = stageCtx.stage;
  const placements = collectCoreBodies(chart);
  const byBody = new Map(placements.map((p) => [p.body, p]));
  const clusterBodies = placements.filter((p) => (HOUSE_CLUSTER_BODIES as readonly string[]).includes(p.body));

  // elements / modalities: 10 planets + Ascendant (the bodies a reader actually weighs)
  const weighed = placements.filter(
    (p) => (HOUSE_CLUSTER_BODIES as readonly string[]).includes(p.body) || p.body === 'Ascendant'
  );
  const elCounts: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const modCounts: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  for (const p of weighed) {
    if (p.element) elCounts[p.element]++;
    if (p.modality) modCounts[p.modality]++;
  }
  const elMax = Math.max(...Object.values(elCounts));
  const dominantElements = Object.keys(elCounts).filter((e) => elCounts[e] === elMax);
  // Under-represented: two or fewer placements, and clearly behind the leading element.
  const lowElements = Object.keys(elCounts)
    .filter((e) => elCounts[e] <= 2 && elCounts[e] < elMax - 1)
    .sort((a, b) => elCounts[a] - elCounts[b])
    .slice(0, 3);
  const modMax = Math.max(...Object.values(modCounts));
  const modMin = Math.min(...Object.values(modCounts));
  const dominantModalities = Object.keys(modCounts).filter((m) => modCounts[m] === modMax);
  const lowModalities = Object.keys(modCounts).filter((m) => modCounts[m] === modMin && modCounts[m] <= 1);

  const elements: ElementProfile = {
    counts: elCounts,
    dominant: dominantElements,
    low: lowElements,
    lowReadings: lowElements.map((el) => {
      const reading = LOW_ELEMENT_READING[el];
      return {
        element: el,
        headline: reading ? applyStageVocabulary(reading.headline, stage) : `${el} is lightly represented`,
        lines: (reading?.lines ?? []).map((l) => applyStageVocabulary(l, stage)),
        note: `${elCounts[el]} of ${weighed.length} weighed placements are ${el}. Read this as a pattern in how things get processed, not as a missing quality.`,
      };
    }),
  };

  // repeated signs (3+ of the weighed bodies)
  const signGroups = new Map<string, string[]>();
  for (const p of weighed) {
    signGroups.set(p.sign, [...(signGroups.get(p.sign) ?? []), p.label]);
  }
  const repeatedSigns = [...signGroups.entries()]
    .filter(([, bodies]) => bodies.length >= 3)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([sign, bodies]) => ({
      sign,
      bodies,
      note: `${bodies.length} placements in ${sign} — ${SIGN_MEANINGS[sign]} shows up repeatedly, across different parts of life.`,
    }));

  // house clusters (3+ of the 10 planets; nodes/Chiron/ASC never create one)
  const houseGroups = new Map<number, string[]>();
  for (const p of clusterBodies) {
    if (!p.house) continue;
    houseGroups.set(p.house, [...(houseGroups.get(p.house) ?? []), p.label]);
  }
  const houseClusters: HouseCluster[] = [...houseGroups.entries()]
    .filter(([, bodies]) => bodies.length >= 3)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([house, bodies]) => ({
      house,
      bodies,
      keywords: HOUSE_KEYWORDS[house] ?? '',
      arena: houseArena(house, stage),
      theme: applyStageVocabulary(
        `With ${bodies.length} planets here, a lot of the chart's attention lands on ${houseArena(house, stage)}. Expect this region of life to come up in the conversation on its own.`,
        stage
      ),
    }));

  // chart ruler
  const asc = byBody.get('Ascendant');
  let chartRuler: ReadingGuide['chartRuler'] = null;
  if (asc) {
    const rulerName = SIGN_RULER[asc.sign];
    const rulerPlacement = byBody.get(rulerName);
    chartRuler = {
      sign: asc.sign,
      ruler: rulerName,
      placement: rulerPlacement,
      note: rulerPlacement
        ? `${asc.sign} rising makes ${bodyLabel(rulerName)} the chart ruler, and it sits in ${rulerPlacement.sign}${rulerPlacement.house ? `, ${ordinalHouse(rulerPlacement.house)}` : ''} — a good place to steer the reading early.`
        : `${asc.sign} rising makes ${bodyLabel(rulerName)} the chart ruler.`,
    };
  }

  // ── blends ────────────────────────────────────────────────────────────────
  function buildBlend(
    bodyName: string,
    group: BlendCard['group'],
    idPrefix = 'blend'
  ): BlendCard | null {
    const p = byBody.get(bodyName);
    if (!p) return null;
    const noun = SIGN_NOUN[p.sign];
    const action = SIGN_ACTION[p.sign];
    const frame = BODY_FRAME[bodyName];
    if (!noun || !action || !frame) return null;

    const factors: ReadingFactor[] = [
      { label: `${p.label} in ${p.sign}`, meaning: `${BODY_MEANINGS[bodyName]} expressed as ${SIGN_MEANINGS[p.sign]}` },
    ];
    const chain: string[] = [
      `${p.label} = ${BODY_MEANINGS[bodyName]}`,
      `${p.sign} = ${SIGN_MEANINGS[p.sign]}`,
    ];
    let support = 1;
    const reasons: string[] = [];

    if (p.house) {
      factors.push({ label: `${p.label} in the ${ordinalHouse(p.house)}`, meaning: houseArena(p.house, stage) });
      chain.push(`${ordinalHouse(p.house)} = ${houseArena(p.house, stage)}`);
      support += 1;
      reasons.push(`the house says which part of life this plays out in (${houseArena(p.house, stage)})`);
    }
    if (dominantElements.includes(p.element) && elMax >= 4) {
      factors.push({ label: `${p.element} emphasis (${elCounts[p.element]} placements)`, meaning: ELEMENT_MEANINGS[p.element] });
      chain.push(`${p.element} emphasis = ${ELEMENT_MEANINGS[p.element]}`);
      support += 1;
      reasons.push(`the same ${p.element} flavour repeats across the chart, so it is not just this one placement`);
    }
    const cluster = houseClusters.find((c) => c.bodies.includes(p.label));
    if (cluster) {
      factors.push({ label: `${ordinalHouse(cluster.house)} concentration (${cluster.bodies.length} planets)`, meaning: cluster.arena });
      chain.push(`${ordinalHouse(cluster.house)} concentration = ${cluster.arena}`);
      support += 1;
      reasons.push(`several planets share that house, which raises how loud the theme is`);
    }
    const repeated = repeatedSigns.find((r) => r.sign === p.sign);
    if (repeated) {
      factors.push({ label: `${repeated.bodies.length} placements in ${p.sign}`, meaning: SIGN_MEANINGS[p.sign] });
      support += 1;
      reasons.push(`${p.sign} repeats (${repeated.bodies.join(', ')}), so the style shows up in more than one area`);
    }
    const linkedBodies: string[] = [];
    const linkedHouses: Array<number | null> = [];
    let hasTenseLink = false;
    for (const asp of aspectsTo(bodyName, placements).slice(0, 2)) {
      if (asp.orb > 4) continue;
      factors.push({
        label: `${p.label} ${asp.aspect} ${asp.other.label} (${asp.orb}°)`,
        meaning: ASPECT_ADDS[asp.aspect] ?? 'linked in the chart',
      });
      chain.push(`${p.label} ${asp.aspect} ${asp.other.label} = ${BODY_MEANINGS[asp.other.body]} joins in`);
      support += 1;
      linkedBodies.push(asp.other.body);
      linkedHouses.push(asp.other.house);
      if (['square', 'opposition'].includes(asp.aspect)) hasTenseLink = true;
      reasons.push(`${asp.other.label} is tied in at ${asp.orb}°, which adds ${BODY_MEANINGS[asp.other.body]}`);
    }

    if (chartRuler?.ruler === bodyName) {
      factors.push({ label: `Chart ruler (${chartRuler.sign} rising)`, meaning: 'runs the whole chart, so it carries extra weight' });
      support += 1;
      reasons.push('it is the chart ruler, so it colours everything else');
    }

    chain.push(`Together → ${applyStageVocabulary(`${noun.toLowerCase()} and ${action}`, stage)}.`);

    return {
      id: `${idPrefix}-${bodyName}`,
      name: frame.name(noun),
      factors,
      chain,
      why: reasons.length
        ? `These combine because ${reasons.join('; ')}.`
        : `This rests on one placement — ${p.label} in ${p.sign} — so hold it lightly and check it with them.`,
      whatToSay: speak(frame.say(action), stage),
      askThis: applyStageVocabulary(frame.ask, stage),
      strength: strengthFor(support),
      supportCount: support,
      group,
      ...evidenceFields([bodyName, ...linkedBodies], [p.house, ...linkedHouses], {
        retrograde: p.isRetrograde,
        tense: hasTenseLink,
      }),
    };

  }

  const coreOrder = ['Moon', 'Sun', 'Ascendant', 'Mercury', 'Venus', 'Mars'];
  // Ranked through the shared hierarchy first (primary majors/angles ahead of
  // nodes/Chiron and minor points), then by how many factors support the blend.
  const blends = rankByEvidence(
    coreOrder
      .map((b) => buildBlend(b, 'core'))
      .filter((b): b is BlendCard => !!b)
      .map((b) => ({ ...b, weight: b.supportCount }))
  ).map(({ weight: _weight, ...card }) => card as BlendCard);


  // personal planets grouped by repeated sign / shared house
  const personalGroups: BlendCard[] = [];
  const personal = placements.filter((p) => (PERSONAL_PLANETS as readonly string[]).includes(p.body));
  const groupBy = <K,>(key: (p: CoreBodyPlacement) => K) => {
    const m = new Map<K, CoreBodyPlacement[]>();
    for (const p of personal) m.set(key(p), [...(m.get(key(p)) ?? []), p]);
    return m;
  };
  for (const [sign, group] of groupBy((p) => p.sign)) {
    if (group.length < 2) continue;
    const labels = group.map((g) => g.label);
    personalGroups.push({
      id: `group-sign-${sign}`,
      name: `A repeated ${sign} style`,
      factors: group.map((g) => ({
        label: `${g.label} in ${sign}${g.house ? `, ${ordinalHouse(g.house)}` : ''}`,
        meaning: BODY_MEANINGS[g.body],
      })),
      chain: [
        ...group.map((g) => `${g.label} = ${BODY_MEANINGS[g.body]}`),
        `${sign} = ${SIGN_MEANINGS[sign]}`,
        `Together → the same ${sign} approach shows up in ${labels.length} different functions at once.`,
      ],
      why: `These are blended because ${labels.join(', ')} all sit in ${sign}. When one sign covers several personal planets, the style is consistent rather than situational — that is worth saying as one theme instead of ${labels.length} separate readings.`,
      whatToSay: speak(
        `${'{Sub}'} may show a fairly consistent ${sign} approach — ${SIGN_MEANINGS[sign]} — across ${labels
          .map((l) => PERSONAL_FUNCTION[l] ?? l.toLowerCase())
          .join(', ')}`,
        stage
      ),
      askThis: applyStageVocabulary(`Does that same approach show up in most areas, or only in some?`, stage),
      strength: strengthFor(group.length + 1),
      supportCount: group.length + 1,
      group: 'personal-group',
      ...evidenceFields(group.map((g) => g.body), group.map((g) => g.house), {
        retrograde: group.some((g) => g.isRetrograde),
      }),

    });
  }
  for (const [house, group] of groupBy((p) => p.house)) {
    if (!house || group.length < 2) continue;
    const labels = group.map((g) => g.label);
    personalGroups.push({
      id: `group-house-${house}`,
      name: `Personal focus on ${houseArena(house, stage).split(',')[0]}`,
      factors: group.map((g) => ({ label: `${g.label} in the ${ordinalHouse(house)}`, meaning: BODY_MEANINGS[g.body] })),
      chain: [
        ...group.map((g) => `${g.label} = ${BODY_MEANINGS[g.body]}`),
        `${ordinalHouse(house)} = ${houseArena(house, stage)}`,
        `Together → several personal planets point at the same part of life.`,
      ],
      why: `${labels.join(' and ')} share the ${ordinalHouse(house)}, so more than one basic function is aimed at ${houseArena(house, stage)}.`,
      whatToSay: speak(
        `Quite a lot of ${'{your}'} attention may go to ${houseArena(house, stage)} — it shows up through ${labels.join(' and ')}`,
        stage
      ),
      askThis: applyStageVocabulary(`Does that area take up more of your attention than people realise?`, stage),
      strength: strengthFor(group.length + 1),
      supportCount: group.length + 1,
      group: 'personal-group',
      ...evidenceFields(group.map((g) => g.body), [house], {
        retrograde: group.some((g) => g.isRetrograde),
      }),

    });
  }

  // Jupiter & Saturn
  const growth = ['Jupiter', 'Saturn']
    .map((b) => buildBlend(b, 'growth', 'growth'))
    .filter((b): b is BlendCard => !!b);

  // Outer planets: only elevated when personally relevant
  const elevated: BlendCard[] = [];
  for (const body of OUTER_PLANETS) {
    const p = byBody.get(body);
    if (!p) continue;
    const reasons: string[] = [];
    if (chartRuler?.ruler === body) reasons.push('it is the chart ruler');
    if (p.house && [1, 4, 7, 10].includes(p.house)) reasons.push(`it is angular (${ordinalHouse(p.house)})`);
    const tight = aspectsTo(body, placements).filter(
      (a) => a.orb <= 3 && ([...PERSONAL_PLANETS, 'Ascendant'] as readonly string[]).includes(a.other.body)
    );
    if (tight.length) {
      reasons.push(
        `it is tightly connected to ${tight.map((t) => `${t.other.label} (${t.aspect}, ${t.orb}°)`).join(' and ')}`
      );
    }
    if (!reasons.length) continue;
    const card = buildBlend(body, 'outer', 'outer');
    if (card) {
      card.why = `${card.why} This one is worth raising because ${reasons.join(', and ')}.`;
      elevated.push(card);
    }
  }

  // Nodes
  const nn = byBody.get('NorthNode');
  const sn = byBody.get('SouthNode');
  let nodes: BlendCard | null = null;
  if (nn && sn) {
    nodes = {
      id: 'nodes',
      name: 'Familiar strengths and the stretch alongside them',
      factors: [
        { label: `South Node in ${sn.sign}${sn.house ? `, ${ordinalHouse(sn.house)}` : ''}`, meaning: BODY_MEANINGS.SouthNode },
        { label: `North Node in ${nn.sign}${nn.house ? `, ${ordinalHouse(nn.house)}` : ''}`, meaning: BODY_MEANINGS.NorthNode },
      ],
      chain: [
        `South Node = ${BODY_MEANINGS.SouthNode}`,
        `${sn.sign} = ${SIGN_MEANINGS[sn.sign]}`,
        `North Node = ${BODY_MEANINGS.NorthNode}`,
        `${nn.sign} = ${SIGN_MEANINGS[nn.sign]}`,
        `Together → ${SIGN_MEANINGS[sn.sign]} is already well practised, and ${SIGN_MEANINGS[nn.sign]} is worth building alongside it.`,
      ],
      why: 'The nodes always sit opposite each other, so the opposition itself is geometry rather than evidence. What is readable is which signs and houses they fall in, and that reads as familiar skills on one side and a useful stretch on the other.',
      whatToSay: speak(
        `${'{Sub}'} probably already lean${voiceFor(stage) === 'you' ? '' : 's'} on ${SIGN_MEANINGS[sn.sign]} without thinking about it${sn.house ? `, especially around ${houseArena(sn.house, stage)}` : ''}, and there may be something useful in also practising ${SIGN_MEANINGS[nn.sign]}${nn.house ? ` in ${houseArena(nn.house, stage)}` : ''}`,
        stage
      ),
      askThis: applyStageVocabulary(
        `Which of those two feels like the easy one for you, and which one takes more effort?`,
        stage
      ),
      strength: 'Moderate',
      supportCount: 2,
      group: 'nodes',
      ...evidenceFields(['NorthNode', 'SouthNode'], [nn.house, sn.house]),

    };
  }

  // Chiron — only elevated when tightly tied to core factors
  const ch = byBody.get('Chiron');
  let chiron: BlendCard | null = null;
  if (ch) {
    const tight = aspectsTo('Chiron', placements).filter(
      (a) => a.orb <= 3 && ([...PERSONAL_PLANETS, 'Ascendant'] as readonly string[]).includes(a.other.body)
    );
    const angular = ch.house != null && [1, 4, 7, 10].includes(ch.house);
    if (tight.length || angular) {
      chiron = {
        id: 'chiron',
        name: 'An area of sensitivity that tends to become understanding',
        factors: [
          { label: `Chiron in ${ch.sign}${ch.house ? `, ${ordinalHouse(ch.house)}` : ''}`, meaning: BODY_MEANINGS.Chiron },
          ...tight.map((t) => ({
            label: `Chiron ${t.aspect} ${t.other.label} (${t.orb}°)`,
            meaning: `${BODY_MEANINGS[t.other.body]} is close to this sensitive area`,
          })),
        ],
        chain: [
          `Chiron = ${BODY_MEANINGS.Chiron}`,
          `${ch.sign} = ${SIGN_MEANINGS[ch.sign]}`,
          ...(ch.house ? [`${ordinalHouse(ch.house)} = ${houseArena(ch.house, stage)}`] : []),
          `Together → this area can feel tender early on and often turns into the place someone understands well.`,
        ],
        why: angular && !tight.length
          ? `Raised here only because Chiron is angular (${ordinalHouse(ch.house!)}). Keep it lighter than the personal planets.`
          : `Raised here because Chiron is tightly tied to ${tight.map((t) => t.other.label).join(' and ')}. Keep it as sensitivity, not as a diagnosis.`,
        whatToSay: speak(
          `There may be some extra sensitivity around ${ch.house ? houseArena(ch.house, stage) : SIGN_MEANINGS[ch.sign]}, and that is often the area someone ends up understanding better than most`,
          stage
        ),
        askThis: applyStageVocabulary(`Does that area feel a bit more tender than others for you?`, stage),
        strength: tight.length ? 'Moderate' : 'Single-placement',
        supportCount: tight.length ? 2 : 1,
        group: 'chiron',
        ...evidenceFields(['Chiron', ...tight.map((t) => t.other.body)], [ch.house, ...tight.map((t) => t.other.house)]),

      };
    }
  }

  // ── start here ────────────────────────────────────────────────────────────
  const startHere: StartHereItem[] = [];
  const sun = byBody.get('Sun');
  const moon = byBody.get('Moon');
  if (sun && moon && asc) {
    startHere.push({
      id: 'big-three',
      label: 'Big Three',
      value: `Sun ${sun.sign} · Moon ${moon.sign} · ${asc.sign} rising`,
      note: 'Identity, emotional needs, and first impression — say these three first, they orient everything else.',
      importance: 100,
    });
  }
  if (houseClusters.length) {
    const c = houseClusters[0];
    startHere.push({
      id: 'cluster',
      label: 'Strongest house concentration',
      value: `${ordinalHouse(c.house)} — ${c.bodies.join(', ')}`,
      note: c.theme,
      importance: 92,
    });
  }
  if (chartRuler) {
    startHere.push({
      id: 'chart-ruler',
      label: 'Chart ruler',
      value: chartRuler.placement
        ? `${bodyLabel(chartRuler.ruler)} in ${chartRuler.placement.sign}${chartRuler.placement.house ? `, ${ordinalHouse(chartRuler.placement.house)}` : ''}`
        : bodyLabel(chartRuler.ruler),
      note: chartRuler.note,
      importance: 88,
    });
  }
  startHere.push({
    id: 'elements',
    label: 'Dominant element',
    value: dominantElements.map((e) => `${e} ${elCounts[e]}`).join(' · '),
    note: `${dominantElements.join(' and ')} leads — ${dominantElements.map((e) => ELEMENT_MEANINGS[e]).join('; ')}.`,
    importance: 84,
  });
  if (repeatedSigns.length) {
    startHere.push({
      id: 'repeated-sign',
      label: 'Repeated sign',
      value: `${repeatedSigns[0].sign} ×${repeatedSigns[0].bodies.length}`,
      note: repeatedSigns[0].note,
      importance: 80,
    });
  }
  if (elements.low.length) {
    startHere.push({
      id: 'low-element',
      label: 'Lightly represented element',
      value: elements.low.map((e) => `${e} ${elCounts[e]}`).join(' · '),
      note: elements.lowReadings[0]
        ? `${elements.lowReadings[0].headline}. Frame it as a pattern, never as a missing quality.`
        : 'Read as a pattern, not a defect.',
      importance: 76,
    });
  }
  startHere.push({
    id: 'modality',
    label: 'Modality balance',
    value: Object.entries(modCounts).map(([m, n]) => `${m} ${n}`).join(' · '),
    note: `${dominantModalities.join(' and ')} leads — ${dominantModalities.map((m) => MODALITY_MEANINGS[m]).join('; ')}${lowModalities.length ? `. ${lowModalities.join(' and ')} is light, so ${lowModalities.map((m) => MODALITY_MEANINGS[m]).join('; ')} may take more deliberate effort.` : '.'}`,
    importance: 72,
  });
  const topConnections = rankConnections(placements, 5);
  if (topConnections.length) {
    const t = topConnections[0];
    startHere.push({
      id: 'top-aspect',
      label: 'Tightest major connection',
      value: `${t.a} ${t.symbol} ${t.b} (${t.orb}°)`,
      note: `What it adds: ${t.adds}.`,
      importance: 86,
    });
  }
  startHere.sort((a, b) => b.importance - a.importance);

  // ── the story ─────────────────────────────────────────────────────────────
  const storyParts: string[] = [];
  if (sun && moon && asc) {
    storyParts.push(
      speak(
        `Reading this as a whole: ${'{sub}'} comes across as ${SIGN_MEANINGS[asc.sign].split(',')[0]}, ${'{your}'} sense of self runs on ${SIGN_MEANINGS[sun.sign].split(',')[0]}, and what settles ${'{sub}'} is ${SIGN_MEANINGS[moon.sign].split(',')[0]}`,
        stage
      )
    );
  }
  for (const b of blends.filter((x) => x.strength === 'Strong').slice(0, 2)) {
    storyParts.push(b.whatToSay);
  }
  if (!blends.some((b) => b.strength === 'Strong') && blends[0]) storyParts.push(blends[0].whatToSay);
  if (houseClusters[0]) storyParts.push(houseClusters[0].theme);
  if (elements.lowReadings[0]) {
    storyParts.push(
      speak(`${'{Sub}'} may not lead with ${elements.low[0].toLowerCase()}-style expression — ${elements.lowReadings[0].lines[0] ?? ''}`, stage)
    );
  }
  if (growth[1]) storyParts.push(growth[1].whatToSay);
  storyParts.push(
    speak(
      `None of this is fixed — a chart describes tendencies and starting conditions, and ${'{sub}'} get${voiceFor(stage) === 'you' ? '' : 's'} to work with them`,
      stage
    )
  );

  const guide: ReadingGuide = {
    subject: {
      name: chart.name,
      birthDate: chart.birthDate,
      birthTime: chart.birthTime,
      birthLocation: chart.placeName || chart.birthLocation,
    },
    age: stageCtx,
    placements,
    bigThree: { sun, moon, ascendant: asc },
    elements,
    modalities: {
      counts: modCounts,
      dominant: dominantModalities,
      low: lowModalities,
      note: `Counted across the ten planets plus the Ascendant (${weighed.length} placements).`,
    },
    repeatedSigns,
    houseClusters,
    chartRuler,
    startHere,
    blends,
    personalGroups,
    growth,
    outerPlanets: {
      elevated,
      secondaryNote: elevated.length
        ? 'Only the outer planets with a personal hook are raised above; the rest stay background.'
        : 'No outer planet is angular, chart ruler, or tightly tied to a personal planet here, so keep Uranus, Neptune and Pluto as background rather than headline material.',
    },
    nodes,
    chiron,
    topConnections,
    story: storyParts.filter(Boolean).join(' '),
  };

  return sanitizeInterpretiveDeep(guide);
}

/** Plain-language function names used when several personal planets share a sign. */
const PERSONAL_FUNCTION: Record<string, string> = {
  Sun: 'identity',
  Moon: 'emotional needs',
  Mercury: 'thinking and talking',
  Venus: 'relating and taste',
  Mars: 'drive and effort',
};

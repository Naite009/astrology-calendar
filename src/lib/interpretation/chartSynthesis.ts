import type { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { computeRankedAspects, type RankedAspect } from '@/lib/aspectRanking';
import { getReliableAscendant } from '@/lib/chartDataValidation';
import { getHouseForLongitude, signDegreesToLongitude } from '@/lib/houseCalculations';
import { MAJOR_PLANETS } from './bodyTaxonomy';
import { getChartRulers } from './chartRuler';
import { buildElementBalanceReading, buildModalityBalanceReading, type BalancePlacement } from './elementBalance';
import { getHouseLivedInterpretation, getPsychologicalFunction, getSignStyle, type DevelopmentalStage } from './psychologicalFunctions';
import { ordinalHouse } from './ordinals';
import { sanitizeInterpretiveDeep } from './languagePolicy';
import { pairAspectReading } from '@/lib/readingGuide/aspectPairLibrary';

export type SynthesisSignal = 'Strong' | 'Moderate';

export interface ChartSynthesisDynamic {
  id: string;
  title: string;
  signal: SynthesisSignal;
  evidence: string;
  whyItMatters: string;
  realLifeTranslation: string;
  modifyingFactor: string;
  practicalTakeaway: string;
}

export interface ChartSynthesis {
  title: 'What This Chart Is Really Saying';
  subtitle: 'The strongest patterns before the details';
  summary: string[];
  recognitionPoints: string[];
  whatHelps: string;
  dynamics: ChartSynthesisDynamic[];
}

interface Placement {
  body: string;
  sign: string;
  degree: number;
  house: number | null;
}

interface Candidate extends ChartSynthesisDynamic {
  score: number;
  bodies: string[];
  houses: number[];
  summary: [string, string];
  recognition: string;
}

const ELEMENT_OF_SIGN: Record<string, string> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};

const MODALITY_OF_SIGN: Record<string, string> = {
  Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal',
  Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed',
  Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable',
};

const MAJOR_ASPECTS = new Set(['conjunction', 'opposition', 'square', 'trine', 'sextile']);
const CENTRAL_BODIES = new Set(['Sun', 'Moon', 'Ascendant', 'Mercury', 'Venus', 'Mars']);

function degreeLabel(p: Placement): string {
  const degree = Math.floor(p.degree);
  const minutes = Math.round((p.degree - degree) * 60);
  return `${p.body} ${degree}°${String(minutes).padStart(2, '0')}′ ${p.sign}${p.house ? `, ${ordinalHouse(p.house)}` : ''}`;
}

function stageText(text: string, stage: DevelopmentalStage): string {
  if (stage === 'adult') return text;
  let out = text
    .replace(/\bcareer\b/gi, stage === 'teen' ? 'future direction' : 'interests and strengths')
    .replace(/\bmarriage\b/gi, stage === 'teen' ? 'close relationships' : 'close friendships')
    .replace(/\bromance\b/gi, stage === 'teen' ? 'relationships' : 'close friendship')
    .replace(/\bsexual(?:ity)?\b/gi, 'closeness');
  if (stage === 'child') {
    out = out
      .replace(/\bYou are\b/g, 'They are').replace(/\byou are\b/g, 'they are')
      .replace(/\bYou may\b/g, 'They may').replace(/\byou may\b/g, 'they may')
      .replace(/\bYou can\b/g, 'They can').replace(/\byou can\b/g, 'they can')
      .replace(/\bYour\b/g, 'Their').replace(/\byour\b/g, 'their')
      .replace(/\bYou\b/g, 'They').replace(/\byou\b/g, 'they');
  }
  return out;
}

function collectPlacements(chart: NatalChart): Placement[] {
  const placements: Placement[] = [];
  for (const body of MAJOR_PLANETS) {
    const position = chart.planets?.[body] as NatalPlanetPosition | undefined;
    if (!position?.sign) continue;
    const longitude = signDegreesToLongitude(position.sign, position.degree, position.minutes);
    placements.push({
      body,
      sign: position.sign,
      degree: position.degree + (position.minutes ?? 0) / 60,
      house: getHouseForLongitude(longitude, chart),
    });
  }
  const asc = getReliableAscendant(chart) as NatalPlanetPosition | null;
  if (asc?.sign) placements.push({
    body: 'Ascendant', sign: asc.sign,
    degree: asc.degree + (asc.minutes ?? 0) / 60, house: 1,
  });
  return placements;
}

function aspectEvidence(aspect: RankedAspect): string {
  const outOfSign = aspect.dissociate ? ' Out of sign.' : '';
  return `${aspect.a} in ${aspect.aSign} ${aspect.aspect} ${aspect.b} in ${aspect.bSign}, ${aspect.orb.toFixed(1)}° orb.${outOfSign}`;
}

function signal(score: number): SynthesisSignal {
  return score >= 90 ? 'Strong' : 'Moderate';
}

function overlaps(candidate: Candidate, selected: Candidate[]): boolean {
  return selected.some((prior) => {
    const sharedBodies = candidate.bodies.filter((body) => prior.bodies.includes(body)).length;
    const sameHouse = candidate.houses.some((house) => prior.houses.includes(house));
    return sharedBodies >= 2 || (sameHouse && candidate.id.startsWith('house') && prior.id.startsWith('house'));
  });
}

export function buildChartSynthesis(
  chart: NatalChart,
  options: { stage?: DevelopmentalStage } = {},
): ChartSynthesis {
  const stage = options.stage ?? 'adult';
  const placements = collectPlacements(chart);
  const byBody = new Map(placements.map((placement) => [placement.body, placement]));
  const aspects = computeRankedAspects(chart).filter((aspect) => MAJOR_ASPECTS.has(aspect.aspect));
  const candidates: Candidate[] = [];
  const sun = byBody.get('Sun');
  const moon = byBody.get('Moon');
  const asc = byBody.get('Ascendant');

  if (sun && moon && asc) {
    const bigThreeAspect = aspects.find((aspect) =>
      ['Sun', 'Moon', 'Ascendant'].includes(aspect.a) && ['Sun', 'Moon', 'Ascendant'].includes(aspect.b));
    const repeated = new Set([sun.sign, moon.sign, asc.sign]).size;
    const evidence = `${degreeLabel(sun)}; ${degreeLabel(moon)}; ${degreeLabel(asc)}.${bigThreeAspect ? ` ${aspectEvidence(bigThreeAspect)}` : ''}`;
    const identity = `The Sun approaches identity in a way that is ${getSignStyle(sun.sign)}, while the Moon settles through a style that is ${getSignStyle(moon.sign)}.`;
    const outer = `The ${asc.sign} Ascendant means other people first meet an approach that is ${getSignStyle(asc.sign)}.`;
    const modifier = bigThreeAspect
      ? `${bigThreeAspect.a} ${bigThreeAspect.aspect} ${bigThreeAspect.b} means these needs do not stay separate: ${pairAspectReading(bigThreeAspect.a, bigThreeAspect.b, bigThreeAspect.aspect, bigThreeAspect.orb).howItWorks[0]}`
      : repeated === 1
        ? `All three use ${sun.sign}, so the inner aim, emotional response, and first approach reinforce the same style.`
        : `Because the three use different signs, first impressions, inner purpose, and emotional needs may not all ask for the same response at once.`;
    candidates.push({
      id: 'big-three', title: repeated === 1 ? `${sun.sign} Across the Big Three` : 'Inner Needs and Outer Approach',
      score: bigThreeAspect ? 98 : repeated <= 2 ? 95 : 88, signal: 'Strong', bodies: ['Sun', 'Moon', 'Ascendant'], houses: [sun.house, moon.house, 1].filter((h): h is number => Boolean(h)),
      evidence, whyItMatters: 'The Sun, Moon, and Ascendant describe identity, emotional needs, and the approach other people meet first.',
      realLifeTranslation: `${identity} ${outer}`,
      modifyingFactor: modifier,
      practicalTakeaway: 'Notice which response is serving the inner need and which one is mainly managing the situation in front of you.',
      summary: [
        `${evidence} Together, these describe the chart’s central relationship between identity, emotional needs, and first reactions.`,
        `${identity} ${outer} ${modifier}`,
      ],
      recognition: bigThreeAspect
        ? pairAspectReading(bigThreeAspect.a, bigThreeAspect.b, bigThreeAspect.aspect, bigThreeAspect.orb).mayShowUp[0]
        : 'You may notice that what feels natural inside is not always the same response other people see first.',
    });
  }

  const rulers = asc ? getChartRulers(asc.sign) : null;
  if (rulers) {
    const primary = byBody.get(rulers.traditional);
    const modern = rulers.modern ? byBody.get(rulers.modern) : null;
    if (primary) {
      const rulerAspect = aspects.find((aspect) => aspect.a === primary.body || aspect.b === primary.body);
      const lived = primary.house ? getHouseLivedInterpretation(primary.house) : null;
      const rulerEvidence = `${asc.sign} rising makes ${primary.body} the traditional chart ruler. ${degreeLabel(primary)}.${modern ? ` ${degreeLabel(modern)} is the modern co-ruler.` : ''}`;
      const functionName = getPsychologicalFunction(primary.body)?.shortFunction.toLowerCase() ?? primary.body;
      const modifier = rulerAspect
        ? `${rulerAspect.a} in ${rulerAspect.aSign} ${rulerAspect.aspect} ${rulerAspect.b} in ${rulerAspect.bSign}, ${rulerAspect.orb.toFixed(1)}° orb, modifies the ruler by repeatedly linking ${functionName} with ${getPsychologicalFunction(rulerAspect.a === primary.body ? rulerAspect.b : rulerAspect.a)?.shortFunction.toLowerCase() ?? 'another function'}.`
        : modern
          ? `${modern.body} adds intensity through ${modern.house ? ordinalHouse(modern.house) : modern.sign}, but it does not replace ${primary.body} as the primary ruler.`
          : 'No equally strong major aspect to the ruler is needed to make this placement relevant; its house still shows where attention repeatedly returns.';
      const arena = lived?.attention ?? (primary.house ? `the concerns of the ${ordinalHouse(primary.house)}` : 'the way choices are initiated');
      candidates.push({
        id: 'chart-ruler', title: `${primary.body} Sets the Direction`, score: 94, signal: 'Strong',
        bodies: [primary.body, ...(modern ? [modern.body] : [])], houses: [primary.house, modern?.house].filter((h): h is number => Boolean(h)),
        evidence: rulerEvidence,
        whyItMatters: 'The traditional ruler of the Ascendant describes the function that carries the chart’s approach into everyday choices.',
        realLifeTranslation: `Attention may keep returning to ${arena}. ${primary.body} handles that through a style that is ${getSignStyle(primary.sign)}.`,
        modifyingFactor: modifier,
        practicalTakeaway: lived ? `Ask the recurring house question: ${lived.question}` : `Track what helps ${functionName} make a clear, usable choice.`,
        summary: [
          `${rulerEvidence} This matters because the chart ruler carries the rising sign’s approach into everyday decisions.`,
          `Attention may keep returning to ${arena}, handled in a way that is ${getSignStyle(primary.sign)}. ${modifier}`,
        ],
        recognition: `You may notice repeated choices around ${lived?.focus ?? arena}, even when the immediate subject looks different.`,
      });
    }
  }

  const signGroups = new Map<string, Placement[]>();
  const houseGroups = new Map<number, Placement[]>();
  for (const placement of placements.filter((p) => MAJOR_PLANETS.includes(p.body as typeof MAJOR_PLANETS[number]))) {
    signGroups.set(placement.sign, [...(signGroups.get(placement.sign) ?? []), placement]);
    if (placement.house) houseGroups.set(placement.house, [...(houseGroups.get(placement.house) ?? []), placement]);
  }
  const concentrations = [
    ...[...houseGroups].filter(([, group]) => group.length >= 2).map(([house, group]) => ({ kind: 'house' as const, key: house, group })),
    ...[...signGroups].filter(([, group]) => group.length >= 3).map(([sign, group]) => ({ kind: 'sign' as const, key: sign, group })),
  ].sort((a, b) => b.group.length - a.group.length);
  const concentration = concentrations[0];
  if (concentration) {
    const names = concentration.group.map((p) => p.body);
    const isStellium = names.length >= 3;
    const house = concentration.kind === 'house' ? Number(concentration.key) : null;
    const lived = house ? getHouseLivedInterpretation(house) : null;
    const evidence = `${names.join(', ')} are concentrated in ${house ? `the ${ordinalHouse(house)}` : concentration.key}. ${isStellium ? 'Three or more major planets make this a stellium.' : 'Two major planets repeat the same life area.'}`;
    const translation = lived
      ? `This can keep attention on ${lived.attention}, with recurring choices around ${lived.repeatingPattern}.`
      : `Several different functions use a ${concentration.key} style, so the same approach repeats across identity, relating, thinking, or action.`;
    candidates.push({
      id: `${concentration.kind}-concentration`, title: house ? `${ordinalHouse(house)} Repeats` : `${concentration.key} Repeats`,
      score: isStellium ? 96 : 86, signal: isStellium ? 'Strong' : 'Moderate', bodies: names, houses: house ? [house] : concentration.group.map((p) => p.house).filter((h): h is number => Boolean(h)),
      evidence, whyItMatters: isStellium ? 'A stellium gives several major psychological functions the same repeated focus.' : 'Two major functions returning to one house makes that area more than a one-placement detail.',
      realLifeTranslation: translation,
      modifyingFactor: 'The planets do different jobs, so the concentration does not create one fixed trait; it makes several needs compete or cooperate in the same place.',
      practicalTakeaway: lived ? `Keep asking: ${lived.question}` : 'Separate what each planet is asking for before choosing one response for the whole group.',
      summary: [`${evidence} This matters because several major functions keep returning to the same concern.`, `${translation} The planets still do different jobs, so this is a repeated focus rather than one fixed trait.`],
      recognition: lived ? `Other people may notice ${lived.othersNotice}.` : `You may notice the same style appearing in several kinds of decision.`,
    });
  }

  const topAspect = aspects.find((aspect) => {
    const isPrimaryPair = CENTRAL_BODIES.has(aspect.a) || CENTRAL_BODIES.has(aspect.b);
    const notOnlyOuter = !(['Uranus', 'Neptune', 'Pluto'].includes(aspect.a) && ['Uranus', 'Neptune', 'Pluto'].includes(aspect.b));
    return isPrimaryPair && notOnlyOuter;
  });
  if (topAspect) {
    const reading = pairAspectReading(topAspect.a, topAspect.b, topAspect.aspect, topAspect.orb);
    const evidence = aspectEvidence(topAspect);
    const houses = [topAspect.aHouse, topAspect.bHouse].filter((h): h is number => Boolean(h));
    candidates.push({
      id: 'tight-aspect', title: reading.headline, score: Math.max(82, 98 - topAspect.orb * 3), signal: topAspect.orb <= 3 ? 'Strong' : 'Moderate',
      bodies: [topAspect.a, topAspect.b], houses, evidence,
      whyItMatters: `This is one of the strongest major contacts involving a personal function, and its ${topAspect.orb.toFixed(1)}° orb makes it repeat more clearly than a loose background contact.`,
      realLifeTranslation: `${reading.howItWorks[0]} ${reading.mayShowUp[0]}`,
      modifyingFactor: topAspect.dissociate
        ? 'It is out of sign: the degree geometry is real, while the signs use styles that do not naturally perform that aspect in the same way.'
        : `${topAspect.aSign} and ${topAspect.bSign} support the same by-sign geometry as the exact degree aspect.`,
      practicalTakeaway: reading.watchFor,
      summary: [`${evidence} ${reading.howItWorks[0]}`, `${reading.mayShowUp[0]} ${topAspect.dissociate ? 'Because it is out of sign, the signs modify how directly the aspect is expressed.' : reading.watchFor}`],
      recognition: reading.mayShowUp[1] ?? reading.mayShowUp[0],
    });
  }

  const balancePlacements: BalancePlacement[] = placements.filter((p) => p.body !== 'Ascendant');
  const elementCounts = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const modalityCounts = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  for (const placement of balancePlacements) {
    const element = ELEMENT_OF_SIGN[placement.sign] as keyof typeof elementCounts;
    const modality = MODALITY_OF_SIGN[placement.sign] as keyof typeof modalityCounts;
    if (element) elementCounts[element] += 1;
    if (modality) modalityCounts[modality] += 1;
  }
  const elementReading = buildElementBalanceReading(elementCounts, balancePlacements);
  const modalityReading = buildModalityBalanceReading(modalityCounts, balancePlacements);
  if (elementReading.low.length || elementReading.dominant.length === 1) {
    const low = elementReading.combined ?? elementReading.individual[0];
    const dominant = elementReading.dominant.join(' and ');
    const evidence = `Element count: Fire ${elementCounts.Fire}, Earth ${elementCounts.Earth}, Air ${elementCounts.Air}, Water ${elementCounts.Water}.`;
    const lowBehavior = low ? ('synthesis' in low ? low.synthesis : low.behavior) : '';
    const translation = low
      ? `${lowBehavior} ${low.alternative}`
      : `${dominant} leads, so ${elementReading.summary}`;
    candidates.push({
      id: 'element-balance', title: low?.label ?? `${dominant} Leads`, score: 78, signal: 'Moderate', bodies: [], houses: [],
      evidence, whyItMatters: 'The ten major planets show which processing channel is most automatic and which one may arrive later.',
      realLifeTranslation: translation,
      modifyingFactor: low?.compensation ?? modalityReading.compensation,
      practicalTakeaway: low?.support ?? 'Use the strongest channel deliberately, then check whether another kind of information changes the decision.',
      summary: [`${evidence} ${translation}`, `${low?.compensation ?? modalityReading.compensation} This modifies the count without erasing the overall pattern.`],
      recognition: low?.alternative ?? elementReading.summary,
    });
  }

  const ranked = candidates.sort((a, b) => b.score - a.score);
  const selected: Candidate[] = [];
  for (const candidate of ranked) {
    if (selected.length >= 4) break;
    if (!overlaps(candidate, selected) || selected.length < 2) selected.push(candidate);
  }
  for (const candidate of ranked) {
    if (selected.length >= 3) break;
    if (!selected.includes(candidate)) selected.push(candidate);
  }
  const final = selected.slice(0, 4).map((candidate) => ({ ...candidate, signal: signal(candidate.score) }));
  const summary = final.flatMap((candidate) => candidate.summary).slice(0, 8).map((line) => stageText(line, stage));
  const recognitionPoints = final.slice(0, 3).map((candidate) => stageText(candidate.recognition, stage));
  const whatHelps = stageText(final[0]?.practicalTakeaway ?? 'Use the strongest pattern as a question to test against ordinary life, not as a fixed verdict.', stage);

  return sanitizeInterpretiveDeep({
    title: 'What This Chart Is Really Saying',
    subtitle: 'The strongest patterns before the details',
    summary,
    recognitionPoints,
    whatHelps,
    dynamics: final.map(({ summary: _summary, recognition: _recognition, bodies: _bodies, houses: _houses, score: _score, ...dynamic }) => ({
      ...dynamic,
      evidence: stageText(dynamic.evidence, stage),
      whyItMatters: stageText(dynamic.whyItMatters, stage),
      realLifeTranslation: stageText(dynamic.realLifeTranslation, stage),
      modifyingFactor: stageText(dynamic.modifyingFactor, stage),
      practicalTakeaway: stageText(dynamic.practicalTakeaway, stage),
    })),
  });
}
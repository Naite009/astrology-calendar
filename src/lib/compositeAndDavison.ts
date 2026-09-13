import { NatalChart } from '@/hooks/useNatalChart';
import {
  calculateCompositeModel,
  majorCompositeAspects,
  type CompositeModel,
} from '@/lib/relationship/compositeEngine';
import { buildCompositeReading } from '@/lib/relationship/compositeReading';
import { buildRelationshipContext, type RelationshipContext } from '@/lib/relationship/relationshipContext';

export interface CompositeChart {
  chartType: 'composite';
  person1Name?: string;
  person2Name?: string;
  planets: Record<string, any>;
  houseCusps?: Record<number, any>;
  interceptedSigns?: any[];
}

export interface DavisonChart {
  chartType: 'davison';
  person1Name?: string;
  person2Name?: string;
  relationshipBirthDate: Date;
  relationshipBirthLocation: string;
  planets: Record<string, any>;
  houseCusps?: Record<number, any>;
  interceptedSigns?: any[];
}

export interface ChartComparisonGuide {
  whenToUse: { synastry: string; composite: string; davison: string; };
  whatTheyReveal: { synastry: string; composite: string; davison: string; };
  bestFor: { synastry: string[]; composite: string[]; davison: string[]; };
}

export const CHART_COMPARISON_GUIDE: ChartComparisonGuide = {
  whenToUse: {
    synastry: "Use synastry to see how two people meet each other: one person's planet touching the other's.",
    composite: "Use the composite to read the relationship as a chart of its own, built from midpoints.",
    davison: "Use Davison for the same question as the composite, calculated from the real sky at the moment halfway between the two births."
  },
  whatTheyReveal: {
    synastry: "Person-to-person dynamics: who tends to feel what, and where the easy and effortful contacts sit.",
    composite: "The relationship as its own entity: what it tends to organise itself around, and its tone.",
    davison: "The same relationship-as-entity view, from an actual chart moment, so houses and angles are real rather than averaged."
  },
  bestFor: {
    synastry: ["Understanding day-to-day dynamics", "Seeing where friction shows up", "Reading who experiences what"],
    composite: ["The shared tone of the pair", "Repeated themes across several factors", "What the pair keeps returning to"],
    davison: ["A chart with real angles and houses", "Cross-checking the composite", "Optional symbolic reading, clearly labelled as symbolic"]
  }
};

const ZODIAC_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

function calculateMidpoint(planet1: any, planet2: any): any {
  if (!planet1 || !planet2) return null;
  const signIndex1 = typeof planet1.sign === 'string' ? ZODIAC_SIGNS.indexOf(planet1.sign) : planet1.sign;
  const signIndex2 = typeof planet2.sign === 'string' ? ZODIAC_SIGNS.indexOf(planet2.sign) : planet2.sign;
  if (signIndex1 === -1 || signIndex2 === -1) return null;
  const pos1 = signIndex1 * 30 + planet1.degree + (planet1.minutes / 60) + ((planet1.seconds || 0) / 3600);
  const pos2 = signIndex2 * 30 + planet2.degree + (planet2.minutes / 60) + ((planet2.seconds || 0) / 3600);
  let midpoint1 = (pos1 + pos2) / 2;
  let midpoint2 = midpoint1 + 180;
  if (midpoint2 >= 360) midpoint2 -= 360;
  const diff1 = Math.min(Math.abs(pos1 - midpoint1), 360 - Math.abs(pos1 - midpoint1));
  const diff2 = Math.min(Math.abs(pos1 - midpoint2), 360 - Math.abs(pos1 - midpoint2));
  let finalMidpoint = diff1 <= diff2 ? midpoint1 : midpoint2;
  const signIndex = Math.floor(finalMidpoint / 30);
  const remainder = finalMidpoint - (signIndex * 30);
  const degree = Math.floor(remainder);
  const minutesDecimal = (remainder - degree) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = Math.round((minutesDecimal - minutes) * 60);
  return { sign: ZODIAC_SIGNS[signIndex], degree, minutes, seconds, isRetrograde: planet1.isRetrograde && planet2.isRetrograde };
}

export interface CompositeChartWithModel extends CompositeChart {
  /** Canonical composite model: midpoints, aspects with orbs, angles and houses. */
  model: CompositeModel;
}

/**
 * Delegates to the canonical composite engine. House cusps are only filled in
 * when they can genuinely be derived (both charts store a latitude and a valid
 * Midheaven); the old approach of midpointing all twelve natal cusps is not a
 * valid composite and is no longer used.
 */
export function calculateCompositeChart(
  chart1: NatalChart,
  chart2: NatalChart,
  person1Name?: string,
  person2Name?: string,
): CompositeChartWithModel {
  const model = calculateCompositeModel(chart1, chart2);
  const compositePlanets: Record<string, any> = {};
  for (const [body, pos] of Object.entries(model.positions)) {
    compositePlanets[body] = {
      sign: pos.sign,
      degree: pos.degree,
      minutes: pos.minutes,
      seconds: pos.seconds,
      longitude: pos.longitude,
      house: pos.house ?? undefined,
      isRetrograde: false,
    };
  }

  const compositeHouseCusps: Record<number, any> = {};
  if (model.angles.housesAvailable && model.angles.cuspLongitudes) {
    for (let i = 1; i <= 12; i++) {
      const lon = model.angles.cuspLongitudes[i];
      const signIndex = Math.floor(lon / 30);
      const remainder = lon - signIndex * 30;
      const degree = Math.floor(remainder);
      const minutesDecimal = (remainder - degree) * 60;
      compositeHouseCusps[i] = {
        sign: ZODIAC_SIGNS[signIndex],
        degree,
        minutes: Math.floor(minutesDecimal),
        seconds: Math.round((minutesDecimal - Math.floor(minutesDecimal)) * 60),
      };
    }
  }

  return {
    chartType: 'composite',
    planets: compositePlanets,
    houseCusps: compositeHouseCusps,
    person1Name: person1Name ?? chart1.name,
    person2Name: person2Name ?? chart2.name,
    interceptedSigns: [],
    model,
  };
}

export function calculateDavisonChart(chart1: NatalChart, chart2: NatalChart, birthDate1: Date, birthDate2: Date, birthLat1: number, birthLon1: number, birthLat2: number, birthLon2: number, person1Name?: string, person2Name?: string): DavisonChart {
  const midpointTime = new Date((birthDate1.getTime() + birthDate2.getTime()) / 2);
  const midpointLat = (birthLat1 + birthLat2) / 2;
  const midpointLon = (birthLon1 + birthLon2) / 2;
  return { chartType: 'davison', relationshipBirthDate: midpointTime, relationshipBirthLocation: `${midpointLat.toFixed(2)}°, ${midpointLon.toFixed(2)}°`, planets: {}, houseCusps: {}, person1Name, person2Name, interceptedSigns: [] };
}

export interface CompositeAnalysis {
  relationshipPurpose: string; coreTheme: string; strengths: string[]; challenges: string[]; publicImage: string; emotionalTone: string; communicationStyle: string; sharedGoals: string; longevityIndicators: string[]; whenToUseThisChart: string;
}

const COMPOSITE_ANALYSIS_UNAVAILABLE: CompositeAnalysis = {
  relationshipPurpose: 'Not available: this composite was not built from the canonical engine, so no conclusion is offered here.',
  coreTheme: 'Not available from the stored data.',
  strengths: [],
  challenges: [],
  publicImage: 'Not available: composite angles could not be derived from the stored charts.',
  emotionalTone: 'Not available from the stored data.',
  communicationStyle: 'Not available from the stored data.',
  sharedGoals: 'Not available from the stored data.',
  longevityIndicators: [],
  whenToUseThisChart: CHART_COMPARISON_GUIDE.whenToUse.composite,
};

function summaryFor(model: CompositeModel, body: string): string {
  const pos = model.positions[body];
  if (!pos) return 'Not available from the stored chart data.';
  const contacts = majorCompositeAspects(model.aspects)
    .filter((a) => a.fromBody === body || a.toBody === body)
    .slice(0, 2);
  const base = `Composite ${body} at ${pos.label}${pos.house ? `, ${pos.house} house` : ''}.`;
  return contacts.length
    ? `${base} Read with ${contacts.map((c) => `${c.fromBody} ${c.aspect} ${c.toBody} (${c.orb.toFixed(1)}\u00b0)`).join(' and ')}, which carry more weight than the sign alone.`
    : `${base} No close major aspect to it, so treat the sign as background rather than a headline.`;
}

/**
 * Derived from the canonical composite reading rather than a sign lookup table.
 * Requires a composite produced by calculateCompositeChart above.
 */
export function analyzeCompositeChart(
  composite: CompositeChart | CompositeChartWithModel,
  ctx?: RelationshipContext | null,
): CompositeAnalysis {
  const model = (composite as CompositeChartWithModel).model;
  if (!model) return COMPOSITE_ANALYSIS_UNAVAILABLE;

  const context = ctx ?? buildRelationshipContext({ kind: 'neutral', chart1: null, chart2: null });
  const reading = buildCompositeReading(model, context);
  const themes = reading.themes;

  return {
    relationshipPurpose: reading.bottomLine,
    coreTheme: themes[0] ? `${themes[0].title}: ${themes[0].interpretation}` : 'No theme is supported by several factors here, so none is headlined.',
    strengths: themes
      .filter((t) => t.signal !== 'single')
      .slice(0, 3)
      .map((t) => `${t.title} (${t.signalLabel}) \u2014 ${t.evidence[0] ?? ''}`),
    challenges: themes
      .filter((t) => t.howItShowsUp.toLowerCase().includes('trade-off'))
      .slice(0, 3)
      .map((t) => `${t.title}: ${t.howItShowsUp}`),
    publicImage: model.angles.ascendant
      ? `Composite Ascendant at ${model.angles.ascendant.label}: one expression is how the pair tends to come across to others. ${model.angles.note}`
      : model.angles.note,
    emotionalTone: summaryFor(model, 'Moon'),
    communicationStyle: summaryFor(model, 'Mercury'),
    sharedGoals: summaryFor(model, 'Sun'),
    longevityIndicators: majorCompositeAspects(model.aspects)
      .filter((a) => a.fromBody === 'Saturn' || a.toBody === 'Saturn')
      .slice(0, 3)
      .map((a) => `${a.fromBody} ${a.aspect} ${a.toBody} (orb ${a.orb.toFixed(1)}\u00b0): commitment and structure can be a live theme, without predicting how long anything lasts.`),
    whenToUseThisChart: CHART_COMPARISON_GUIDE.whenToUse.composite,
  };
}

export interface DavisonAnalysis {
  relationshipDestiny: string; karmicPurpose: string; fatedThemes: string[]; spiritualLessons: string[]; soulContract: string; evolutionaryIntent: string; whenToUseThisChart: string;
}

/**
 * The old version asserted destiny, karma and soul contracts as facts. Those
 * fields are kept for older screens, but they now describe what the chart is,
 * and any symbolic reading is explicitly optional and labelled as symbolic.
 */
export function analyzeDavisonChart(davison: DavisonChart): DavisonAnalysis {
  const moment = davison.relationshipBirthDate instanceof Date
    ? davison.relationshipBirthDate.toDateString()
    : 'the midpoint moment between the two births';
  const factual = `This chart is cast for ${moment} at ${davison.relationshipBirthLocation}, the midpoint of the two births. It is one way of reading the pair as a single chart, not a statement about what is meant to happen.`;

  return {
    relationshipDestiny: factual,
    karmicPurpose: 'No karmic claim is made here. Nothing in a chart shows a past life or an obligation between two people.',
    fatedThemes: [],
    spiritualLessons: ['If you like a symbolic reading, treat it as a lens you choose, tied to the exact placements shown in the technical view, rather than a prediction.'],
    soulContract: 'Not offered: this app does not treat chart geometry as evidence of an agreement between souls.',
    evolutionaryIntent: 'What this chart can support is a conversation about shared tone and shared themes; it does not set out a required direction.',
    whenToUseThisChart: CHART_COMPARISON_GUIDE.whenToUse.davison,
  };
}

export interface RelationshipAnalysisWorkflow {
  step1_synastry: string; step2_karmic: string; step3_composite: string; step4_davison: string; integrationGuidance: string;
}

export const RELATIONSHIP_ANALYSIS_WORKFLOW: RelationshipAnalysisWorkflow = {
  step1_synastry: "START HERE: synastry shows how the two people meet each other day to day.",
  step2_karmic: "OPTIONAL SYMBOLIC LAYER: node and Chiron contacts, read as symbolism and never as a risk or safety assessment.",
  step3_composite: "SHARED TONE: the composite reads the pair as a chart of its own, from midpoints.",
  step4_davison: "CROSS-CHECK: Davison answers the same question from a real chart moment, with real angles and houses.",
  integrationGuidance: "Synastry = how you meet each other. Composite and Davison = the pair read as one chart. None of them predicts an outcome."
};

export default { calculateCompositeChart, calculateDavisonChart, analyzeCompositeChart, analyzeDavisonChart, CHART_COMPARISON_GUIDE, RELATIONSHIP_ANALYSIS_WORKFLOW };

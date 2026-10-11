import type { NatalChart } from '@/hooks/useNatalChart';
import type { ReadingGuide, CoreBodyPlacement } from './readingGuideEngine';
import { computeRankedAspects, type RankedAspect } from '@/lib/aspectRanking';
import { detectChartPatterns } from '@/lib/chartPatterns';
import { MAJOR_PLANETS } from '@/lib/interpretation/bodyTaxonomy';
import { getChartRulers } from '@/lib/interpretation/chartRuler';
import { getEssentialDignity } from '@/lib/essentialDignity';
import { getHouseForLongitude, signDegreesToLongitude } from '@/lib/houseCalculations';
import { getHouseLivedInterpretation, getPsychologicalFunction, synthesisFromRankedAspect } from '@/lib/interpretation/psychologicalFunctions';
import { buildElementBalanceReading, buildElementPsychology, buildModalityBalanceReading } from '@/lib/interpretation/elementBalance';
import { buildTakeawayAction, type TakeawayAction } from '@/lib/interpretation/takeawayActions';
import { analyzeSignVsDegree, formatDegreeMinutes, ZODIAC_ORDER } from '@/lib/aspects/outOfSign';
import { sanitizeInterpretiveDeep } from '@/lib/interpretation/languagePolicy';
import { applyStageVocabulary, type AgeStage } from './ageContext';
import { calculateNatalDominantPlanets } from '@/lib/dominantPlanetsEngine';

export interface WalkthroughEvidence {
  id: string;
  kind: 'placement' | 'aspect' | 'rulership' | 'balance' | 'configuration';
  text: string;
  bodies: string[];
  houses: number[];
  tier: 'primary' | 'secondary';
  orb?: number;
  wide?: boolean;
  layers?: string[];
}
export interface PractitionerTheme {
  id: string;
  title: string;
  question: string;
  synthesis: string;
  gift: string;
  tension: string;
  examples: string[];
  recognition: string;
  integration: string;
  tryThis: TakeawayAction;
  evidenceIds: string[];
  reasoning: string[];
  signal: 'Strong' | 'Moderate';
  weight: number;
}
export interface PractitionerConfiguration {
  id: string;
  name: string;
  bodies: string[];
  evidenceIds: string[];
  apex?: string;
  release?: { longitude: number; sign: string; degree: number; house: number | null; occupiedBy: string[]; note: string };
  synthesis: string;
  gift: string;
  integration: string;
  tryThis: TakeawayAction;
  weight: number;
  tier: 'primary' | 'secondary';
}
export interface PractitionerWalkthrough {
  schemaVersion: 2;
  chartId: string;
  evidence: WalkthroughEvidence[];
  opening: { summary: string; signatures: Array<{ id: string; title: string; meaning: string; evidenceIds: string[]; weight: number }> };
  chartRuler: { title: string; synthesis: string; condition: string; reasoning: string[]; evidenceIds: string[]; modernNote?: string } | null;
  themes: PractitionerTheme[];
  balance: { synthesis: string; modality: string; alternative: string; compensation: string; evidenceIds: string[]; tryThis: TakeawayAction };
  configurations: PractitionerConfiguration[];
  hiddenPatterns: Array<{ title: string; observation: string; check: string; evidenceIds: string[] }>;
  closing: { threads: Array<{ text: string; evidenceIds: string[] }>; questions: Array<{ text: string; evidenceIds: string[] }>; practice: string; watchFor: string; build: string; actions: TakeawayAction[] };
  methodology: string[];
  limitations: string[];
}

type GuideInput = Pick<ReadingGuide, 'placements' | 'elements' | 'modalities' | 'synthesis' | 'age'>;
const MAJORS = new Set<string>(MAJOR_PLANETS);
const MAJOR_ASPECTS = new Set(['conjunction', 'opposition', 'square', 'trine', 'sextile']);
const CENTRAL = new Set(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Ascendant', 'MC']);
const BODY_WEIGHT: Record<string, number> = { Sun: 12, Moon: 12, Mercury: 8, Venus: 8, Mars: 8, Jupiter: 6, Saturn: 7, Uranus: 4, Neptune: 4, Pluto: 5 };
// Questions are house meanings, not a fixed list of themes rendered for every chart.
const HOUSE_TITLES: Record<number, string> = {
  1: 'Showing up without performing', 2: 'Security without proving worth', 3: 'Finding words that land',
  4: 'A private base that supports life outside', 5: 'Making room for enjoyment and expression',
  6: 'Useful work with workable limits', 7: 'Connection without losing a preference',
  8: 'Trust, privacy, and what is shared', 9: 'Beliefs tested through experience',
  10: 'Being known for something that matters', 11: 'Belonging without disappearing into the group',
  12: 'The life that happens out of view',
};
const SIGN_BEHAVIOR: Record<string, string> = {
  Aries: 'make a first move and ask the direct question', Taurus: 'take time, check what is tangible, and stay with a choice',
  Gemini: 'compare answers and try another way of explaining', Cancer: 'check who feels included and whether care is mutual',
  Leo: 'put something personal into the effort and look for a clear response', Virgo: 'notice the detail that would make the result work better',
  Libra: 'weigh both sides and check the effect on the relationship', Scorpio: 'watch first, check trust, and choose carefully what to share',
  Sagittarius: 'look for the larger reason and leave room to explore', Capricorn: 'check the responsibility, timing, and practical outcome',
  Aquarius: 'question the usual rule and compare it with a workable alternative', Pisces: 'take in the atmosphere and look for meaning through images or feeling',
};
const first = (text: string) => text.split(/(?<=[.!?])\s+(?=[A-Z])/)[0] ?? text;
const unique = <T,>(items: T[]) => [...new Set(items)];
const houseNumbers = (items: CoreBodyPlacement[]) => unique(items.flatMap(p => p.house ? [p.house] : []));
const placementLine = (p: CoreBodyPlacement) => `${p.label}${p.isRetrograde && p.body !== 'Sun' && p.body !== 'Moon' && p.body !== 'Ascendant' && p.body !== 'MC' ? ' ℞' : ''} ${formatDegreeMinutes(p.degree)} ${p.sign}${p.house ? `, House ${p.house}` : ''}`;
const aspectId = (a: RankedAspect) => `aspect:${[a.a, a.b].sort().join(':')}:${a.aspect}`;
const personalVoice = (text: string, stage: AgeStage) => applyStageVocabulary(text, stage);
const practitionerVoice = (text: string, stage: AgeStage) => personalVoice(text, stage)
  .replace(/\byou are\b/gi, 'they are').replace(/\byou have\b/gi, 'they have').replace(/\byou do\b/gi, 'they do')
  .replace(/\byou feel\b/gi, 'they feel').replace(/\byou want\b/gi, 'they want').replace(/\byou need\b/gi, 'they need')
  .replace(/\byou know\b/gi, 'they know').replace(/\byou get\b/gi, 'they get').replace(/\byou say\b/gi, 'they say')
  .replace(/\byourself\b/gi, 'themselves').replace(/\byour\b/gi, 'their').replace(/\byou\b/gi, 'they');

/** Read-only synthesis of stored placements and existing canonical geometry. No ephemeris or birth-data changes. */
export function buildPractitionerWalkthrough(chart: NatalChart, guide: GuideInput): PractitionerWalkthrough {
  const stage = guide.age.stage;
  const completeCusps = Array.from({ length: 12 }, (_, i) => chart.houseCusps?.[`house${i + 1}` as keyof NonNullable<NatalChart['houseCusps']>])
    .every(c => c?.sign && ZODIAC_ORDER.includes(c.sign as typeof ZODIAC_ORDER[number]) && Number.isFinite(c.degree));
  const placements = guide.placements.map(p => ({ ...p, house: p.body === 'Ascendant' ? 1 : completeCusps ? getHouseForLongitude(p.absDeg, chart) : null }));
  const mc = chart.houseCusps?.house10;
  if (completeCusps && mc) placements.push({ body: 'MC', label: 'MC', sign: mc.sign, degree: mc.degree + (mc.minutes ?? 0) / 60, absDeg: signDegreesToLongitude(mc.sign, mc.degree, mc.minutes), element: '', modality: '', house: 10, isRetrograde: false });
  const byBody = new Map(placements.map(p => [p.body, p]));
  const majors = placements.filter(p => MAJORS.has(p.body));
  const evidence = new Map<string, WalkthroughEvidence>();
  const add = (item: WalkthroughEvidence) => { evidence.set(item.id, item); return item.id; };
  const idsFor = (ps: CoreBodyPlacement[]) => ps.map(p => `placement:${p.body}`);
  for (const p of placements) add({ id: `placement:${p.body}`, kind: 'placement', text: placementLine(p), bodies: [p.body], houses: p.house ? [p.house] : [], tier: MAJORS.has(p.body) || ['Ascendant', 'MC'].includes(p.body) ? 'primary' : 'secondary' });
  const aspects = computeRankedAspects(chart).filter(a => byBody.has(a.a) && byBody.has(a.b));
  const pairMap = new Map(aspects.map(a => [[a.a, a.b].sort().join('|'), a]));
  const contact = (a: string, b: string, type: string, max = 8) => {
    const found = pairMap.get([a, b].sort().join('|'));
    return found?.aspect === type && found.orb <= max ? found : null;
  };
  for (const a of aspects) {
    const pa = byBody.get(a.a); const pb = byBody.get(a.b);
    if (!pa || !pb) continue;
    const layers = a.dissociate ? analyzeSignVsDegree({ labelA: pa.label, signA: pa.sign, degreeA: pa.degree, labelB: pb.label, signB: pb.sign, degreeB: pb.degree, aspect: a.aspect, aspectAngle: a.exactAngle, separation: a.separation, orb: a.orb }).lines : undefined;
    add({ id: aspectId(a), kind: 'aspect', text: `${placementLine(pa)} ${a.aspect} ${placementLine(pb)}; ${a.orb.toFixed(2)}° orb${a.isWide ? ' (wide, lower weight)' : ''}${a.dissociate ? '; Out of sign' : ''}.`, bodies: [a.a, a.b], houses: houseNumbers([pa, pb]), tier: MAJORS.has(a.a) || ['Ascendant', 'MC'].includes(a.a) ? MAJORS.has(a.b) || ['Ascendant', 'MC'].includes(a.b) ? 'primary' : 'secondary' : 'secondary', orb: a.orb, wide: a.isWide, layers });
  }
  const leadingAspects = aspects.filter(a => MAJOR_ASPECTS.has(a.aspect) && evidence.get(aspectId(a))?.tier === 'primary')
    .sort((a, b) => b.score - a.score);
  const asc = byBody.get('Ascendant');
  const rulerInfo = asc ? getChartRulers(asc.sign) : null;
  const ruler = rulerInfo ? byBody.get(rulerInfo.traditional) : undefined;
  const rulerLinks = ruler ? leadingAspects.filter(a => a.a === ruler.body || a.b === ruler.body).slice(0, 3) : [];
  const rulership = (house: number): { id: string; p: CoreBodyPlacement } | null => {
    if (!completeCusps) return null;
    const cusp = chart.houseCusps?.[`house${house}` as keyof NonNullable<NatalChart['houseCusps']>];
    const info = cusp ? getChartRulers(cusp.sign) : null;
    const p = info ? byBody.get(info.traditional) : undefined;
    if (!p || !cusp) return null;
    const id = add({ id: `ruler:house${house}`, kind: 'rulership', text: `${house === 10 ? 'MC / ' : ''}House ${house} cusp ${formatDegreeMinutes(cusp.degree, cusp.minutes)} ${cusp.sign}, traditional ruler: ${placementLine(p)}.`, bodies: [p.body], houses: unique([house, ...(p.house ? [p.house] : [])]), tier: 'primary' });
    return { id, p };
  };
  const dispositor = (p: CoreBodyPlacement) => {
    const info = getChartRulers(p.sign); const host = info ? byBody.get(info.traditional) : undefined;
    if (!host) return null;
    const id = add({ id: `dispositor:${p.body}`, kind: 'rulership', text: `${p.body} in ${p.sign} is traditionally disposed by ${placementLine(host)}${host.body === p.body ? ' (in its own sign)' : ''}.`, bodies: unique([p.body, host.body]), houses: houseNumbers([p, host]), tier: 'primary' });
    return { id, p: host };
  };
  const chartRuler = ruler && asc && rulerInfo ? (() => {
    const root = rulership(1);
    const host = dispositor(ruler);
    const lived = getHouseLivedInterpretation(ruler.house);
    const syn = rulerLinks[0] ? synthesisFromRankedAspect(rulerLinks[0], stage) : null;
    const condition = getEssentialDignity(ruler.body, ruler.sign);
    const modern = rulerInfo.modern ? byBody.get(rulerInfo.modern) : null;
    const rulerEvidence = unique([...idsFor([asc, ruler]), ...(root ? [root.id] : []), ...rulerLinks.map(aspectId), ...(host ? [host.id] : [])]);
    const reasoning = [
      `${asc.sign} rising is the first approach; ${ruler.body} carries that approach into ${lived?.focus ?? 'choices whose house cannot yet be verified'}.`,
      `${ruler.body} in ${ruler.sign} may ${SIGN_BEHAVIOR[ruler.sign]}. ${syn ? practitionerVoice(first(syn.aspectDynamic), stage) : 'Its placement matters without inventing an aspect.'}`,
      ...(host && host.p.body !== ruler.body ? [`The ruler's dispositor is ${host.p.body} in ${host.p.sign}${host.p.house ? `, House ${host.p.house}` : ''}. This links the initial approach to ${getHouseLivedInterpretation(host.p.house)?.focus ?? 'that planet’s choices'}, rather than reading the rising sign on its own.`] : []),
    ];
    return { title: `${ruler.body}: how ${asc.sign} rising finds a direction`, synthesis: practitionerVoice(`${reasoning.slice(0, 2).join(' ')}${host && host.p.body !== ruler.body ? ` The dispositor adds a second setting: ${getHouseLivedInterpretation(host.p.house)?.attention ?? host.p.sign}.` : ''}`, stage), condition: `Traditional essential dignity: ${condition.toLowerCase()}.${ruler.isRetrograde ? ` ${ruler.body} is retrograde; this is a motion fact, not a defect or a prediction.` : ''} Dignity describes the sign setting, not a rating of the person.`, reasoning, evidenceIds: rulerEvidence, ...(modern ? { modernNote: `${placementLine(modern)} is the modern co-ruler, not a replacement for ${ruler.body}.`, evidenceIds: unique([...rulerEvidence, ...idsFor([modern])]) } : {}) };
  })() : null;

  // Retain detector membership only when ALL required edges exist at the detector's own orb limits.
  // In particular, a kite needs both sextiles; an opposition to a trine alone is not enough.
  const patternChart = { ...chart, planets: { ...chart.planets, ...(chart.houseCusps?.house1 ? { Ascendant: { ...chart.houseCusps.house1, seconds: 0, isRetrograde: false } } : {}) } };
  const configurations: PractitionerConfiguration[] = [];
  const seenPatterns = new Set<string>();
  for (const candidate of detectChartPatterns(patternChart)) {
    const bodies = unique(candidate.planets).filter(b => byBody.has(b));
    if (bodies.length < 3 || bodies.length !== unique(candidate.planets).length) continue;
    const name = candidate.name.startsWith('Yod') ? 'Yod' : candidate.name;
    let edges: RankedAspect[] | null = null; let apex: string | undefined;
    const permutations = bodies.flatMap(a => bodies.filter(b => b !== a).flatMap(b => bodies.filter(c => c !== a && c !== b).map(c => [a, b, c])));
    if (name === 'T-Square') {
      for (const [a, b, c] of permutations) { const e = [contact(a, b, 'opposition'), contact(a, c, 'square'), contact(b, c, 'square')]; if (e.every(Boolean)) { edges = e.filter((x): x is RankedAspect => Boolean(x)); apex = c; break; } }
    } else if (name === 'Grand Trine' && bodies.length === 3) {
      const [a,b,c] = bodies; const e = [contact(a,b,'trine'), contact(a,c,'trine'), contact(b,c,'trine')]; if (e.every(Boolean)) edges = e.filter((x): x is RankedAspect => Boolean(x));
    } else if (name === 'Yod') {
      for (const [a,b,c] of permutations) { const e = [contact(a,b,'sextile',6),contact(a,c,'quincunx',3),contact(b,c,'quincunx',3)]; if (e.every(Boolean) && bodies.every(d => [a,b,c].includes(d) || contact(c,d,'conjunction'))) { edges=e.filter((x): x is RankedAspect => Boolean(x)); apex=c; break; } }
    } else if (['Grand Cross', 'Mystic Rectangle', 'Kite'].includes(name) && bodies.length === 4) {
      for (const [a,b,c] of permutations) {
        const d = bodies.find(x => ![a,b,c].includes(x)); if (!d) continue;
        const e = name === 'Kite' ? [contact(a,b,'trine'),contact(a,c,'trine'),contact(b,c,'trine'),contact(a,d,'opposition'),contact(b,d,'sextile'),contact(c,d,'sextile')]
          : name === 'Grand Cross' ? [contact(a,b,'opposition'),contact(c,d,'opposition'),contact(a,c,'square'),contact(a,d,'square'),contact(b,c,'square'),contact(b,d,'square')]
          : [contact(a,b,'opposition',6),contact(c,d,'opposition',6),contact(a,c,'trine',6),contact(b,d,'trine',6),contact(a,d,'sextile',6),contact(b,c,'sextile',6)];
        if (e.every(Boolean)) { edges=e.filter((x): x is RankedAspect => Boolean(x)); if (name === 'Kite') apex=d; break; }
      }
    }
    if (!edges) continue;
    const key = `${name}:${[...bodies].sort().join(':')}`; if (seenPatterns.has(key)) continue; seenPatterns.add(key);
    const ps = bodies.flatMap(b => { const p=byBody.get(b); return p ? [p] : []; });
    const tier = ps.every(p => MAJORS.has(p.body) || ['Ascendant','MC'].includes(p.body)) ? 'primary' : 'secondary';
    const apexP = apex ? byBody.get(apex) : undefined;
    const releaseLon = apexP && name === 'T-Square' ? (apexP.absDeg + 180) % 360 : null;
    const release = releaseLon !== null ? { longitude: releaseLon, sign: ZODIAC_ORDER[Math.floor(releaseLon / 30)], degree: releaseLon % 30, house: completeCusps ? getHouseForLongitude(releaseLon,chart) : null,
      occupiedBy: majors.filter(p => Math.min(Math.abs(p.absDeg-releaseLon),360-Math.abs(p.absDeg-releaseLon)) <= 8).map(p => p.body),
      note: 'The point opposite the apex is a symbolic balancing strategy, not another planet, a missing trait, a prediction, or destiny.' } : undefined;
    const patternId = add({ id: `configuration:${key}`, kind: 'configuration', text: `${name}: ${ps.map(placementLine).join('; ')}.${apexP ? ` Apex / focus: ${placementLine(apexP)}.` : ''}${release ? ` Balancing point: ${formatDegreeMinutes(release.degree)} ${release.sign}${release.house ? `, House ${release.house}` : ''}; ${release.occupiedBy.length ? `occupied near ${release.occupiedBy.join(', ')}` : 'unoccupied by a major planet within 8°'}. ${release.note}` : ''}`, bodies, houses: houseNumbers(ps), tier });
    const tensionEdge = edges.find(a => ['opposition','square','quincunx'].includes(a.aspect));
    const linked = tensionEdge ?? edges[0];
    const psychological = synthesisFromRankedAspect(linked,stage);
    const arenas = unique(ps.map(p => getHouseLivedInterpretation(p.house)?.focus).filter((x): x is string => Boolean(x)));
    const integration = release
      ? `${release.sign === 'Taurus' ? 'Try a slower pace: make or eat something with attention, enjoy music, or build one small thing patiently, without measuring its usefulness.' : `Try the balancing sign as an experiment: ${SIGN_BEHAVIOR[release.sign]}.`}${release.house === 5 ? ' Make space for play or creative work with no required result.' : release.house ? ` Apply it around ${getHouseLivedInterpretation(release.house)?.attention}.` : ''} This gives ${apex ?? 'the apex'} another way to handle the pull between ${linked.a} and ${linked.b}, rather than repeating the same response.`
      : name === 'Grand Trine' ? 'Choose one real task that uses all three functions. Check the result with another person rather than assuming an easy first attempt needs no revision.'
      : name === 'Yod' ? `Change one small part of the plan, then check whether ${apex ?? 'the focus planet'} can work with the two base functions. Adjust the method rather than judging the person.`
      : 'Name the two competing needs, set one workable limit for each, and use the supportive contacts to test a small shared solution.';
    configurations.push({ id:key,name,bodies,evidenceIds:unique([patternId,...idsFor(ps),...edges.map(aspectId)]),apex,release,
      synthesis: practitionerVoice(`${first(psychological.aspectDynamic)} ${apexP ? `${apexP.body} is where the linked needs meet, often through ${getHouseLivedInterpretation(apexP.house)?.attention ?? 'its choices'}.` : `The same functions connect across ${arenas.join('; ') || 'the signs shown in the evidence'}.`} ${name === 'Grand Trine' ? 'A response may come easily enough that the person does not notice the skill they are using.' : name === 'Yod' ? 'The base offers a workable resource, while the two quincunxes ask for different adjustments at the focus.' : 'Read the complete circuit, not just one hard contact as a verdict about character.'}`,stage),
      gift: practitionerVoice(first(psychological.whenIntegrated),stage),integration:personalVoice(integration,stage),tryThis:buildTakeawayAction(integration,{stage,category:release ? 'rest' : undefined}),
      weight:(tier === 'primary' ? 96 : 50) + (bodies.some(b => CENTRAL.has(b)) ? 5 : 0) - edges.filter(e => e.isWide).length * 4,tier });
  }
  configurations.sort((a,b) => b.weight-a.weight);
  // Full configurations own their embedded sub-patterns to avoid re-reading the same circuit.
  const selectedConfigurations = configurations.filter(c => !configurations.some(other => other.bodies.length > c.bodies.length && c.bodies.every(b => other.bodies.includes(b)) && ((c.name === 'T-Square' && other.name === 'Grand Cross') || (c.name === 'Grand Trine' && other.name === 'Kite'))));

  const themes: PractitionerTheme[]=[];
  const groups = new Map<number,CoreBodyPlacement[]>();
  for (const p of majors) if (p.house) groups.set(p.house,[...(groups.get(p.house) ?? []),p]);
  const usedPairs=new Set<string>();
  for (const [house,ps] of groups) {
    const hr=rulership(house);
    const links=leadingAspects.filter(a => ps.some(p => p.body === a.a || p.body === a.b));
    const weight=ps.reduce((sum,p)=>sum+(BODY_WEIGHT[p.body] ?? 3)+(ruler?.body===p.body ? 10 : 0),0) + ([1,4,7,10].includes(house)?8:0) + (ps.length>=3?12:0) + Math.min(links[0]?.score ?? 0,200)/20;
    if (ps.length<2 && !ps.some(p=>['Sun','Moon',ruler?.body].includes(p.body)) && weight<22) continue;
    const lead=[...ps].sort((a,b)=>(BODY_WEIGHT[b.body] ?? 0)-(BODY_WEIGHT[a.body] ?? 0))[0];
    const primaryLink=links.find(a => !usedPairs.has(aspectId(a))) ?? null;
    if (primaryLink) usedPairs.add(aspectId(primaryLink));
    const otherBody=primaryLink ? (ps.some(p=>p.body===primaryLink.a)?primaryLink.b:primaryLink.a) : null;
    const other=otherBody ? byBody.get(otherBody) : undefined;
    const lived=getHouseLivedInterpretation(house); if (!lived) continue;
    const psychology=primaryLink ? synthesisFromRankedAspect(primaryLink,stage) : null;
    const host=dispositor(lead);
    const repeated=majors.filter(p=>p.sign===lead.sign);
    const involved=unique([...ps,...(other?[other]:[]),...(hr?[hr.p]:[]),...(host?[host.p]:[])]);
    const themeEvidence=unique([...idsFor(involved),...(primaryLink?[aspectId(primaryLink)]:[]),...(hr?[hr.id]:[]),...(host?[host.id]:[])]);
    const funcs=ps.map(p=>`${p.body} (${getPsychologicalFunction(p.body)?.shortFunction.toLowerCase().replace(/&/g,'and') ?? 'its own function'})`);
    const arenaOther=other?.house && other.house!==house ? getHouseLivedInterpretation(other.house) : null;
    const tension=psychology ? first(psychology.watchFor)
      : `The person may ${SIGN_BEHAVIOR[lead.sign]}, while also needing room to decide what is enough around ${lived.focus}. ${ps.length>=2 ? `${ps[0].body} and ${ps[1].body} share a setting, not the same need.` : 'Keep the need separate from the standard used to judge it.'}`;
    const synthesis=`${ps.length >= 2 ? `${funcs.join(' and ')} return to the same life area: ${lived.attention}.` : `${lead.body} places a central need around ${lived.attention}.`} ${psychology ? first(psychology.aspectDynamic) : `In ${lead.sign}, a likely first response is to ${SIGN_BEHAVIOR[lead.sign]}.`} ${arenaOther ? `That response has to work both in ${lived.focus} and in ${arenaOther.focus}; meeting one need does not automatically settle the other.` : `The recurring choice is ${lived.repeatingPattern}.`}`;
    const reasoning=[`${ps.length} major planet${ps.length===1?'':'s'} in House ${house}${ps.length>=3 ? '; this app uses three or more for a house concentration, sometimes called a house stellium' : ''}. Their different functions share an arena, not a single personality trait.`,
      ...(primaryLink?[`${primaryLink.isWide?'Wide, lower-weight':'Supported'} ${primaryLink.aspect}, ${primaryLink.orb.toFixed(2)}° orb, joins ${primaryLink.a} with ${primaryLink.b}${primaryLink.dissociate ? '; keep the by-sign and by-degree readings distinct' : ''}.`]:[]),
      ...(hr?[`${house===10?'The MC ruler':'The house ruler'}, ${hr.p.body}, sits in ${hr.p.sign}${hr.p.house?`, House ${hr.p.house}`:''}${hr.p.house===house?', reinforcing the same setting':`. This connects ${lived.focus} to ${getHouseLivedInterpretation(hr.p.house)?.focus ?? 'a house that is not verified'}`}.`]:[]),
      ...(host && host.p.body!==lead.body?[`${lead.body}'s traditional dispositor, ${host.p.body}, places the next step around ${getHouseLivedInterpretation(host.p.house)?.attention ?? host.p.sign}.`]:[]),
      ...(ruler && involved.some(p=>p.body===ruler.body)?[`${ruler.body} is the traditional chart ruler, so this also modifies how the rising sign enters the situation.`]:[]),
      ...(repeated.length>=3?[`${lead.sign} repeats through ${repeated.map(p=>p.body).join(', ')}. The same choice style appears in several functions, but does not erase their differences.`]:[])];
    const integration=psychology ? psychology.watchFor : `Ask “${lived.question}” before agreeing to one more demand. Choose one small action that serves the need rather than only meeting an outside expectation.`;
    themes.push({id:`theme:house${house}`,title:HOUSE_TITLES[house],question:lived.question,synthesis:practitionerVoice(synthesis,stage),gift:practitionerVoice(psychology?first(psychology.whenIntegrated):`This can build skill in ${lived.focus}: ${lived.othersNotice}.`,stage),tension:practitionerVoice(tension,stage),
      examples:psychology ? psychology.howThisCanShowUp.slice(0,2).map(t=>practitionerVoice(t,stage)) : [practitionerVoice(`A repeated choice can involve ${lived.repeatingPattern}.`,stage)],
      recognition:personalVoice(psychology?.reflectionQuestion ?? lived.question,stage), integration:personalVoice(integration,stage),tryThis:buildTakeawayAction(integration,{stage,context:synthesis}), evidenceIds:themeEvidence,reasoning,signal:ps.length>=2 && links.some(a=>!a.isWide) ? 'Strong':'Moderate',weight});
  }
  // Missing houses do not become fabricated house stories. Strong degree contacts remain readable.
  for (const a of leadingAspects.filter(a=>CENTRAL.has(a.a)||CENTRAL.has(a.b)).slice(0,8)) {
    if (usedPairs.has(aspectId(a)) || themes.length>=6) continue;
    const pa=byBody.get(a.a);const pb=byBody.get(a.b);if(!pa||!pb)continue;
    const syn=synthesisFromRankedAspect(a,stage);
    const host=dispositor(pa);
    const modifier=leadingAspects.find(x=>aspectId(x)!==aspectId(a) && (x.a===a.a||x.b===a.a||x.a===a.b||x.b===a.b) && !usedPairs.has(aspectId(x)));
    usedPairs.add(aspectId(a));
    if (modifier) usedPairs.add(aspectId(modifier));
    const reasoning=[`${a.a} may ${SIGN_BEHAVIOR[pa.sign]}, while ${a.b} may ${SIGN_BEHAVIOR[pb.sign]}. The aspect connects those responses, rather than making either one the whole person.`,...(host?[`${pa.body}'s dispositor is ${host.p.body} in ${host.p.sign}${host.p.house?`, House ${host.p.house}`:''}.`]:[]),...(modifier?[`A second contact, ${modifier.a} ${modifier.aspect} ${modifier.b} (${modifier.orb.toFixed(2)}°), modifies the same function.`]:[])];
    themes.push({id:`theme:${aspectId(a)}`,title:syn.title,question:personalVoice(syn.reflectionQuestion,stage),synthesis:practitionerVoice(`${first(syn.aspectDynamic)} ${reasoning[0]}${modifier?` ${first(synthesisFromRankedAspect(modifier,stage).aspectDynamic)}`:''}`,stage),gift:practitionerVoice(first(syn.whenIntegrated),stage),tension:practitionerVoice(first(syn.watchFor),stage),examples:syn.howThisCanShowUp.slice(0,2).map(t=>practitionerVoice(t,stage)),recognition:personalVoice(syn.reflectionQuestion,stage),integration:personalVoice(syn.watchFor,stage),tryThis:buildTakeawayAction(syn.watchFor,{stage}),evidenceIds:unique([...idsFor([pa,pb]),aspectId(a),...(host?[host.id]:[]),...(modifier?[aspectId(modifier)]:[])]),reasoning,signal:a.isWide?'Moderate':'Strong',weight:Math.min(a.score/5,65)});
  }
  themes.sort((a,b)=>b.weight-a.weight);
  const selectedThemes=themes.slice(0,5);
  const balancePlacements=majors.map(p=>({body:p.body,sign:p.sign,house:p.house}));
  const elementReading=buildElementBalanceReading(guide.elements.counts,balancePlacements);
  const modalityReading=buildModalityBalanceReading(guide.modalities.counts,balancePlacements);
  const balanceId=add({id:'balance:ten-planets',kind:'balance',text:`Ten-major-planet counts (${majors.length} present): ${Object.entries(guide.elements.counts).map(([k,v])=>`${k} ${v}`).join(', ')}; ${Object.entries(guide.modalities.counts).map(([k,v])=>`${k} ${v}`).join(', ')}. Ascendant, MC, nodes, and Chiron are not counted.`,bodies:majors.map(p=>p.body),houses:[],tier:'primary'});
  const low=elementReading.combined ?? elementReading.individual[0];
  const balance={synthesis:practitionerVoice(buildElementPsychology(guide.elements.counts,guide.modalities.counts,[...balancePlacements,...(asc?[{body:asc.body,sign:asc.sign,house:1}]:[])]),stage),modality:practitionerVoice(modalityReading.summary,stage),alternative:practitionerVoice(low?.alternative ?? 'The channels have to be checked against the actual signs and aspects, rather than treated as a personality score.',stage),compensation:practitionerVoice([low?.compensation,modalityReading.compensation].filter(Boolean).join(' '),stage),evidenceIds:unique([balanceId,...idsFor(majors)]),tryThis:buildTakeawayAction(low?.support ?? 'Try one small change before committing to the whole plan.',{stage})};
  const hiddenPatterns:PractitionerWalkthrough['hiddenPatterns']=[];
  const hardRepeated=leadingAspects.filter(a=>['square','opposition'].includes(a.aspect)&&!a.isWide);
  for(const p of majors.filter(p=>CENTRAL.has(p.body)||p.body===ruler?.body)) {
    const links=hardRepeated.filter(a=>a.a===p.body||a.b===p.body);
    if(links.length<2)continue;
    const support=leadingAspects.find(a=>['trine','sextile'].includes(a.aspect)&&(a.a===p.body||a.b===p.body));
    const syn=synthesisFromRankedAspect(links[0],stage);
    hiddenPatterns.push({title:`Different situations may press the same ${p.body} need`,observation:practitionerVoice(`The person may treat these as separate problems, while ${p.body} participates in both contacts. ${first(syn.watchFor)}${support?` ${support.a} ${support.aspect} ${support.b} offers a different response: ${first(synthesisFromRankedAspect(support,stage).aspectDynamic)}`:''}`,stage),check:personalVoice('When two situations upset you in similar ways, what need is the same in both?',stage),evidenceIds:unique([...idsFor([p]),...links.slice(0,2).map(aspectId),...(support?[aspectId(support)]:[])])});
    if(hiddenPatterns.length>=2)break;
  }
  const privateMoon=byBody.get('Moon');const outwardSun=byBody.get('Sun');
  if(!hiddenPatterns.length && privateMoon?.house && [8,12].includes(privateMoon.house) && outwardSun?.house && [1,10].includes(outwardSun.house)) {
    hiddenPatterns.push({title:'The public response may not show the private need',observation:`The Sun in House ${outwardSun.house} gives self-expression a visible setting, while the Moon in House ${privateMoon.house} places emotional settling around ${getHouseLivedInterpretation(privateMoon.house)?.attention}. An outwardly engaged response may coexist with a need to process in private; it is worth asking rather than assuming.`,check:personalVoice('What do people assume from how you appear that misses what you need afterward?',stage),evidenceIds:idsFor([privateMoon,outwardSun])});
  }
  const signatureCandidates:PractitionerWalkthrough['opening']['signatures']=[];
  if(chartRuler && ruler)signatureCandidates.push({id:'chart-ruler',title:chartRuler.title,meaning:first(chartRuler.synthesis),evidenceIds:chartRuler.evidenceIds,weight:100+(rulerLinks.some(a=>a.orb<=3)?5:0)});
  for(const c of selectedConfigurations)signatureCandidates.push({id:`pattern:${c.id}`,title:c.name,meaning:first(c.synthesis),evidenceIds:c.evidenceIds,weight:c.weight});
  for(const t of selectedThemes.slice(0,3))signatureCandidates.push({id:t.id,title:t.title,meaning:first(t.synthesis),evidenceIds:t.evidenceIds,weight:t.weight+15});
  const bigThree=guide.synthesis.dynamics.find(d=>d.id==='big-three');
  if(bigThree && asc && byBody.has('Sun') && byBody.has('Moon'))signatureCandidates.push({id:'big-three',title:bigThree.title,meaning:practitionerVoice(first(bigThree.realLifeTranslation),stage),evidenceIds:['placement:Sun','placement:Moon','placement:Ascendant',...leadingAspects.filter(a=>['Sun','Moon','Ascendant'].includes(a.a)&&['Sun','Moon','Ascendant'].includes(a.b)).map(aspectId)],weight:85});
  signatureCandidates.push({id:'balance',title:`${elementReading.dominant.join(' + ')} processing, ${modalityReading.dominant.join(' + ')} timing`,meaning:first(balance.synthesis),evidenceIds:[balanceId],weight:55+Math.max(...Object.values(guide.modalities.counts))*2});
  const signatures=signatureCandidates.sort((a,b)=>b.weight-a.weight).filter((s,i,list)=>!list.slice(0,i).some(other=>s.id.startsWith('theme:')&&other.id.startsWith('pattern:')&&s.evidenceIds.filter(id=>id.startsWith('aspect:')).every(id=>other.evidenceIds.includes(id))&&s.evidenceIds.some(id=>id.startsWith('aspect:')))).slice(0,6);
  const threads=[...(chartRuler?[{text:first(chartRuler.synthesis),evidenceIds:chartRuler.evidenceIds}]:[]),...selectedThemes.slice(0,3).map(t=>({text:`${t.title}: ${first(t.tension)}`,evidenceIds:t.evidenceIds})),...(selectedConfigurations[0]?[{text:`${selectedConfigurations[0].name}: ${first(selectedConfigurations[0].integration)}`,evidenceIds:selectedConfigurations[0].evidenceIds}]:[])].slice(0,5);
  const questions=unique(selectedThemes.map(t=>t.recognition)).slice(0,4).map(text=>({text,evidenceIds:selectedThemes.find(t=>t.recognition===text)?.evidenceIds ?? []}));
  if(hiddenPatterns[0] && questions.length<5)questions.push({text:hiddenPatterns[0].check,evidenceIds:hiddenPatterns[0].evidenceIds});
  if(questions.length<3)questions.push({text:personalVoice('Which response comes first for you: a feeling, a plan, a conversation, or an action? What changes when you have more time?',stage),evidenceIds:[balanceId]});
  const practice=selectedConfigurations[0]?.integration ?? selectedThemes[0]?.integration ?? 'Test the leading interpretation against one recent example before treating it as a thread.';
  const watchFor=selectedThemes[0]?.tension ?? 'Do not turn a sparse chart into a full biography.';
  const build=selectedThemes[1]?.integration ?? 'Ask which part of the pattern fits, which does not, and what changes with context.';
  const limitations=[...(!completeCusps?['Twelve valid stored house cusps are not available. House themes and house rulers are withheld; sign and degree contacts remain visible.']:[]),...(majors.length<10?[`Only ${majors.length} of the ten major planets are present. Counts and synthesis are incomplete.`]:[]),...(!chart.birthTime?['Birth time is unknown. Stored angles and houses need independent confirmation before use.']:[]),...(stage!=='adult'?['Life examples use the selected developmental level. Geometry, evidence, and rankings do not change with age.']:[])];
  const dominance=calculateNatalDominantPlanets(chart);
  return sanitizeInterpretiveDeep({schemaVersion:2,chartId:chart.id,evidence:[...evidence.values()],opening:{summary:threads.slice(0,2).map(t=>t.text).join(' '),signatures},chartRuler,themes:selectedThemes,balance,configurations:selectedConfigurations,hiddenPatterns,closing:{threads,questions:questions.slice(0,5),practice,watchFor,build,actions:[buildTakeawayAction(practice,{stage}),buildTakeawayAction(watchFor,{stage}),buildTakeawayAction(build,{stage})]},methodology:[
    'Opening signatures are ranked by traditional chart rulership, validated configurations, luminary and personal-planet involvement, angular houses, repeated house focus, and canonical aspect weight. These are app-defined reading priorities, not objective personality measurements.',
    'Wide aspects use the shared lower-weight rule (7° or 75% of their allowed orb). Nodes and Chiron stay secondary; the automatic nodal opposition is never added as evidence.',
    'Traditional sign dispositors and house rulers are used. Modern co-rulers are named separately. Three or more major planets in one house is this app’s house-concentration convention.',
    dominance.methodologyNote,
    'Interpretations are hypotheses to check with the client, not biography, diagnosis, or predictions. Expecting respect, cooperation, and kindness in a home is reasonable; this is not the same as relying on children for self-worth.',
  ],limitations} satisfies PractitionerWalkthrough);
}

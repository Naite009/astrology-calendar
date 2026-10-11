import type { CoreBodyPlacement } from './readingGuideEngine';
import type { PractitionerConfiguration, WalkthroughEvidence } from './practitionerSynthesis';
import type { RankedAspect } from '@/lib/aspectRanking';
import { getHouseLivedInterpretation, getPsychologicalFunction, getSignStyle, getNatalSignExpression, getNatalAspectExpression } from '@/lib/interpretation/psychologicalFunctions';

export interface ExpressionModifier {
  kind: 'house' | 'aspect' | 'ruler' | 'concentration' | 'configuration' | 'balance';
  meaning: string;
  evidenceIds: string[];
}
export interface SignExpressionContrast {
  id: string;
  sign: string;
  bodies: string[];
  title: string;
  synthesis: string;
  outside: string;
  inside: string;
  modifiers: ExpressionModifier[];
  evidenceIds: string[];
  question: string;
  weight: number;
}

const BIG_THREE = new Set(['Sun', 'Moon', 'Ascendant']);
const PERSONAL = new Set(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars']);
const TONE_CHANGERS = new Set(['Mars', 'Saturn', 'Uranus', 'Neptune', 'Pluto']);
const angular = (p: CoreBodyPlacement) => p.house !== null && [1, 4, 7, 10].includes(p.house);
const pairId = (a: RankedAspect) => `aspect:${[a.a, a.b].sort().join(':')}:${a.aspect}`;
const sentence = (text: string) => text.split(/(?<=[.!?])\s+(?=[A-Z])/)[0];

/** Explains expression, not a measured mismatch. Inputs are already canonical; no chart calculations here. */
export function buildSignExpressionContrasts(input: {
  placements: CoreBodyPlacement[];
  majorBodies: Set<string>;
  aspects: RankedAspect[];
  ruler?: CoreBodyPlacement;
  rulerCondition?: string;
  configurations: PractitionerConfiguration[];
  evidence: Map<string, WalkthroughEvidence>;
  balance: { synthesis: string; modality: string; evidenceIds: string[] };
}): SignExpressionContrast[] {
  const { placements, aspects, ruler, configurations, evidence } = input;
  const majors = placements.filter(p => input.majorBodies.has(p.body));
  const groups = new Map<string, CoreBodyPlacement[]>();
  for (const p of placements.filter(p => BIG_THREE.has(p.body) || input.majorBodies.has(p.body))) {
    groups.set(p.sign, [...(groups.get(p.sign) ?? []), p]);
  }
  const contrasts: SignExpressionContrast[] = [];
  for (const [sign, ps] of groups) {
    const majorPs = ps.filter(p => input.majorBodies.has(p.body));
    if (!ps.some(p => BIG_THREE.has(p.body)) && !(majorPs.length >= 3 || majorPs.filter(p => PERSONAL.has(p.body)).length >= 2)) continue;
    const ids = ps.map(p => `placement:${p.body}`);
    const relevant = new Set(ps.map(p => p.body));
    const modifiers: ExpressionModifier[] = [];
    const add = (kind: ExpressionModifier['kind'], meaning: string, evidenceIds: string[]) => {
      const valid = [...new Set(evidenceIds)].filter(id => evidence.has(id));
      if (valid.length) modifiers.push({ kind, meaning, evidenceIds: valid });
    };
    for (const p of ps.filter(p => input.majorBodies.has(p.body) && p.house && [8, 12].includes(p.house))) {
      const functionName = getPsychologicalFunction(p.body)?.shortFunction.toLowerCase().replace(/&/g, 'and') ?? p.body;
      const human = p.house === 12
        ? `${p.body}'s ${functionName} has a private setting: ${getHouseLivedInterpretation(12)?.focus}. The ${sign} response may appear behind the scenes, in work made privately, or with trusted people before it is shown more widely.`
        : `${p.body}'s ${functionName} is brought into ${getHouseLivedInterpretation(8)?.focus}. The person may check what is safe to share and who has a say before showing that ${sign} response; an outward social style need not reveal the whole private reaction.`;
      add('house', human, [`placement:${p.body}`]);
    }
    // Only tight, primary contacts can trigger tone changes. A remote outer planet does not label the person.
    const links = aspects.filter(a => !a.isWide && a.orb <= 3 && ['conjunction', 'square', 'opposition', 'trine', 'sextile'].includes(a.aspect)
      && ((relevant.has(a.a) && (PERSONAL.has(a.a) || BIG_THREE.has(a.a))) || (relevant.has(a.b) && (PERSONAL.has(a.b) || BIG_THREE.has(a.b)))) && evidence.get(pairId(a))?.tier === 'primary'
      && ((TONE_CHANGERS.has(a.a) && !relevant.has(a.a)) || (TONE_CHANGERS.has(a.b) && !relevant.has(a.b))
        || (a.aspect === 'conjunction' && (TONE_CHANGERS.has(a.a) || TONE_CHANGERS.has(a.b)))))
      .sort((a, b) => b.score - a.score).slice(0, 2);
    for (const a of links) {
      const changed = relevant.has(a.a) ? a.a : a.b;
      const other = changed === a.a ? a.b : a.a;
      const hasAngle = ['Ascendant', 'MC'].includes(changed);
      const human = hasAngle
        ? `${other} closely contacts the ${changed === 'Ascendant' ? 'first-response angle' : 'public-direction angle'}. ${sentence(getPsychologicalFunction(other)?.relationshipExpression ?? '')} This can be noticeable before the quieter needs in the chart are expressed.`
        : `${a.a} ${a.aspect} ${a.b} connects the ${sign} response with ${getPsychologicalFunction(other)?.shortFunction.toLowerCase().replace(/&/g, 'and') ?? other}. ${getNatalAspectExpression(a)}`;
      add('aspect', human, [pairId(a), `placement:${changed}`, `placement:${other}`]);
    }
    const asc = ps.find(p => p.body === 'Ascendant');
    if (asc && ruler && ruler.body !== 'Ascendant' && (ruler.sign !== sign || [8, 12].includes(ruler.house ?? 0))) {
      add('ruler', `${sign} rising is an entry style, not the entire response. Its traditional ruler, ${ruler.body} in ${ruler.sign}, brings that approach into ${getHouseLivedInterpretation(ruler.house)?.focus ?? 'a setting whose house is unverified'}. ${[8,12].includes(ruler.house ?? 0) ? 'The first impression can therefore coexist with much more private processing.' : `Before assuming a textbook ${sign} presentation, check the ruler's ${getSignStyle(ruler.sign)} way of responding.`} ${input.rulerCondition ?? ''}`, ['ruler:house1', 'placement:Ascendant', `placement:${ruler.body}`]);
      const rulerContact = aspects.find(a => !a.isWide && a.orb <= 3 && (a.a === ruler.body || a.b === ruler.body) && evidence.get(pairId(a))?.tier === 'primary');
      if (rulerContact && !links.some(a => pairId(a) === pairId(rulerContact))) {
        add('ruler', `${ruler.body}'s tight ${rulerContact.aspect} with ${rulerContact.a === ruler.body ? rulerContact.b : rulerContact.a} modifies the same first-response route. ${getNatalAspectExpression(rulerContact)}`, [pairId(rulerContact)]);
      }
    }
    const visible = majors.filter(p => angular(p) && (TONE_CHANGERS.has(p.body) || p.body === 'Sun') && !relevant.has(p.body));
    const firstHouseCluster = visible.filter(p => p.house === 1);
    const connected = firstHouseCluster.filter(p => aspects.some(a => a.aspect === 'conjunction' && !a.isWide && a.orb <= 3 && (a.a === p.body || a.b === p.body) && firstHouseCluster.some(q => q.body !== p.body && (q.body === a.a || q.body === a.b))));
    if (connected.length >= 2) {
      const clusterLinks = aspects.filter(a => a.aspect === 'conjunction' && !a.isWide && a.orb <= 3 && connected.some(p => p.body === a.a) && connected.some(p => p.body === a.b));
      add('concentration', `${connected.map(p => p.body).join(' and ')} are tightly joined in House 1. ${clusterLinks.map(a=>getNatalAspectExpression(a)).join(' ')} This is close to the surface in first reactions, while the ${sign} response may be more apparent in what the person notices than in how gently they respond.`, [...connected.map(p => `placement:${p.body}`), ...clusterLinks.map(pairId)]);
    }
    // House emphasis alone is not an aspect or proof that an unrelated sign is overridden.
    if (!modifiers.length) continue;
    for (const c of configurations.filter(c => c.tier === 'primary' && c.bodies.some(b => relevant.has(b) || (asc && b === ruler?.body))).slice(0, 1)) {
      add('configuration', `${c.name} links this response to a wider circuit rather than leaving ${sign} on its own. ${c.synthesis}`, c.evidenceIds);
    }
    const concentration = majors.filter(p => ps.some(q => q.house !== null && q.house === p.house));
    const house = ps.find(p => p.house && concentration.filter(q => q.house === p.house).length >= 3)?.house;
    if (house) {
      const occupants = majors.filter(p => p.house === house);
      add('concentration', `${occupants.length} major planets return to House ${house}, ${getHouseLivedInterpretation(house)?.focus}. The repeated concern can be more noticeable than any one sign description. This is the app's house-concentration convention, not evidence that these planets are all conjunct.`, occupants.map(p => `placement:${p.body}`));
    }
    // Angular/cadent is a setting, not a personality trait; house 4 is angular but private.
    const settings = majorPs.filter(p => p.house !== null);
    if (settings.length) add('house', settings.map(p => `${p.body} is ${angular(p) ? 'in an angular house' : [3,6,9,12].includes(p.house ?? 0) ? 'in a cadent house' : 'in a succedent house'}: ${getHouseLivedInterpretation(p.house)?.focus}.`).join(' ') + ' Angular placement brings a need into a central life setting; it does not automatically make someone outgoing.', settings.map(p => `placement:${p.body}`));
    if (majors.length === 10) add('balance', `${input.balance.synthesis} ${input.balance.modality} These whole-chart counts describe the usual starting channel and pace, not the number of ${sign} placements or a missing quality.`, [input.balance.evidenceIds[0] ?? 'balance:ten-planets']);
    const privatePs = ps.filter(p => input.majorBodies.has(p.body) && [8,12].includes(p.house ?? 0));
    const privateSetting = privatePs.some(p => p.house === 12) ? 'solitude, private preparation, and trusted settings' : 'selective disclosure, trust, and shared stakes';
    const changedBy = links.map(a => {
      const changed = relevant.has(a.a) ? a.a : a.b;
      const other = changed === a.a ? a.b : a.a;
      const themes: Record<string,string> = {
        Mars: 'a quicker willingness to state a preference or resist being pushed',
        Uranus: 'independence and resistance to being assigned a role',
        Saturn: 'careful self-monitoring and concern about what is reliable',
        Neptune: 'sensitivity to atmosphere and imaginative responses that may be hard to explain immediately',
        Pluto: 'strong investment and close attention to what is being revealed or withheld',
      };
      return `${other}'s ${a.aspect} to ${changed} adds ${themes[other] ?? getSignStyle(placements.find(p=>p.body===other)?.sign)}${['trine','sextile'].includes(a.aspect) ? ', often available without an obvious struggle' : ', which can complicate the first impression'}`;
    });
    const cluster = modifiers.find(m=>m.kind==='concentration' && /tightly joined in House 1/.test(m.meaning));
    const rulerChanges = asc && ruler && ruler.sign !== sign;
    const outside = `${privatePs.length ? `Other people may see less of the ${sign} response than its prominence suggests: ${privatePs.map(p=>p.body).join(' and ')} operate through ${privateSetting}.` : `The ${sign} response may be visible as a tendency to ${getNatalSignExpression(sign)}.`} ${cluster ? cluster.meaning : changedBy[0] ? `${changedBy[0]}.` : rulerChanges ? `${ruler.body} in ${ruler.sign}, the traditional Ascendant ruler, means the first approach also involves a tendency to ${getNatalSignExpression(ruler.sign)}.` : ''}`;
    const personalHidden = privatePs.find(p=>p.body==='Moon') ?? privatePs.find(p=>p.body==='Sun');
    const privateMeaning = personalHidden?.body === 'Moon'
      ? 'They may understand how an exchange felt only after time alone, and decide what to disclose after they have already responded outwardly. Others can mistake a measured answer for a settled feeling, when the private response is still forming.'
      : personalHidden?.body === 'Sun'
      ? `Wanting a contribution to feel personal does not require wanting an audience. ${sign === 'Leo' ? 'Recognition from a trusted person or pride in work created privately can carry the Leo need to matter just as strongly as public attention.' : 'They may care strongly about the meaning of what they make or choose, while being selective about who sees it before it feels ready.'} Keeping something private is not the same as having little investment in it.` : '';
    const inside = `The ${sign} concern remains: they may ${getNatalSignExpression(sign)}. ${privatePs.length ? `With ${privatePs.map(p=>p.body).join(' and ')} in ${privatePs.map(p=>`House ${p.house}`).filter((h,i,a)=>a.indexOf(h)===i).join(' and ')}, this can matter deeply without being immediately apparent. ${privateMeaning}` : 'The visible response does not tell us how easily the person feels settled afterward.'} ${changedBy[1] ? `${changedBy[1]}.` : ''}`;
    const expression = `${privatePs.length ? `The ${sign} response is filtered through ${privateSetting}, rather than removed.` : ''} ${changedBy.map(line=>`${line}.`).join(' ')} ${cluster ? cluster.meaning : ''} ${rulerChanges ? `The rising sign's ruler adds a ${ruler.sign} response: they may ${getNatalSignExpression(ruler.sign)}.` : ''}`;
    contrasts.push({ id: `expression:${sign}`, sign, bodies: ps.map(p => p.body), title: `${sign}: more than the sign label`,
      synthesis: `${ps.map(p => p.body).join(', ')} ${ps.length === 1 ? 'brings' : 'bring'} ${sign} into the chart: they may ${getNatalSignExpression(sign)}. ${expression} ${privateMeaning} ${sign === 'Libra' && (cluster || links.some(a=>['Mars','Uranus','Pluto'].includes(a.a)||['Mars','Uranus','Pluto'].includes(a.b))) ? 'Libra can function here as the ability to register competing expectations, not a promise to accommodate them. A sharper response may arrive after comparing those expectations, especially when agreement would require hiding a personal limit. People may then misunderstand the earlier listening as consent, even though the person was still deciding what was fair to everyone, including themselves.' : ''}`,
      outside, inside,
      modifiers, evidenceIds: [...new Set([...ids, ...modifiers.flatMap(m => m.evidenceIds)])],
      question: privatePs.length ? `With ${privatePs.map(p=>p.body).join(' and ')} in a private setting, do people underestimate how much you notice or care about ${sign === 'Libra' ? 'the fairness and meaning of an interaction' : 'your own response'}?` : `Does the ${links.map(a=>`${a.a} ${a.aspect} ${a.b}`).join(', ') || `${ruler?.body} chart-ruler`} response describe what people notice before they know you well?`,
      weight: (ps.some(p => BIG_THREE.has(p.body)) ? 20 : 0) + links.length * 8 + modifiers.filter(m => m.kind !== 'balance').length * 3 });
  }
  return contrasts.sort((a, b) => b.weight - a.weight);
}
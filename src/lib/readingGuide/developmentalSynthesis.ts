import type { CoreBodyPlacement } from './readingGuideEngine';
import type { RankedAspect } from '@/lib/aspectRanking';
import type { WalkthroughEvidence, PractitionerConfiguration } from './practitionerSynthesis';
import { getHouseLivedInterpretation, getNatalSignExpression, getNatalDevelopmentalInteraction } from '@/lib/interpretation/psychologicalFunctions';
import type { AgeStage } from './ageContext';

export interface IdentityConclusion {
  id: string;
  title: string;
  text: string;
  evidenceIds: string[];
}
export interface DevelopmentalSection {
  id: 'development' | 'internalized' | 'presentation' | 'contradiction' | 'capacity';
  title: string;
  framing?: string;
  conclusions: IdentityConclusion[];
}
export interface DevelopmentalThread {
  id: string;
  title: string;
  synthesis: string;
  developmental: string;
  internalized: string;
  outside: string;
  inside: string;
  capacity: string;
  cost: string;
  question: string;
  evidenceIds: string[];
  weight: number;
}

const pairId = (a: RankedAspect) => `aspect:${[a.a, a.b].sort().join(':')}:${a.aspect}`;
const unique = <T,>(items: T[]) => [...new Set(items)];
const privateHouse = (p: CoreBodyPlacement) => [8, 12].includes(p.house ?? 0);
const visibleHouse = (p: CoreBodyPlacement) => [1, 10].includes(p.house ?? 0);
const framing = 'These are symbolic developmental possibilities, not recovered history. A chart cannot establish what happened at home, what a parent did, or why a pattern developed. The client may recognize, revise, or reject each hypothesis; similar patterns can develop later in life.';

/** Combines canonical evidence into developmental hypotheses; never calculates or infers life events. */
export function buildDevelopmentalSynthesis(input: {
  placements: CoreBodyPlacement[];
  aspects: RankedAspect[];
  ruler?: CoreBodyPlacement;
  configurations: PractitionerConfiguration[];
  evidence: Map<string, WalkthroughEvidence>;
  stage: AgeStage;
}): { threads: DevelopmentalThread[]; sections: DevelopmentalSection[] } {
  const { placements, aspects, ruler, configurations, evidence, stage } = input;
  const byBody = new Map(placements.map(p => [p.body, p]));
  const threads: DevelopmentalThread[] = [];
  const validIds = (ids: string[]) => unique(ids).filter(id => evidence.has(id));
  const route = (ps: CoreBodyPlacement[]) => {
    // Interpret only the actual dispositor/ruler destinations, not assumed rulers or missing houses.
    const chains = ps.flatMap(p => {
      const item = evidence.get(`dispositor:${p.body}`);
      const host = item?.bodies.find(body => body !== p.body);
      const destination = host ? byBody.get(host) : undefined;
      if (!item || !destination?.house || !ps.some(q => q.house && q.house !== destination.house)) return [];
      return [{ text: `${p.body}'s traditional dispositor, ${destination.body} in ${destination.sign}, House ${destination.house}, connects this pattern to ${getHouseLivedInterpretation(destination.house)?.focus}. The person may therefore ${getNatalSignExpression(destination.sign)}, even while the original feeling remains unfinished.`, id: item.id, placementId: `placement:${destination.body}` }];
    }).slice(0, 1);
    const chartRoute = ruler && ps.some(p => p.body === ruler.body) && evidence.has('ruler:house1')
      ? ` Because ${ruler.body} is the traditional Ascendant ruler, this is also part of the person's first way of meeting a situation, not merely an isolated concern.` : '';
    return { text: `${chains.map(c => c.text).join(' ')}${chartRoute}`.trim(), ids: [...chains.flatMap(c => [c.id, c.placementId]), ...(chartRoute ? ['ruler:house1', 'placement:Ascendant'] : [])] };
  };
  // Repeated sign + private emotions + joined visible assertion, for every sign rather than one example chart.
  const repeatedSigns = unique(placements.filter(p=>['Sun','Moon','Mercury','Venus','Ascendant'].includes(p.body)).map(p=>p.sign));
  const repeated = repeatedSigns.map(sign=>({sign, ps:placements.filter(p=>p.sign===sign && ['Sun','Moon','Mercury','Venus','Ascendant'].includes(p.body))})).filter(group=>group.ps.length>=2);
  const hidden = placements.filter(p => privateHouse(p) && ['Moon', 'Pluto', 'Sun', 'Mercury', 'Venus'].includes(p.body));
  const outward = placements.filter(p => visibleHouse(p) && ['Sun', 'Mars', 'Uranus'].includes(p.body));
  const outwardLinks = aspects.filter(a => a.aspect === 'conjunction' && !a.isWide && a.orb <= 3 && outward.some(p => p.body === a.a) && outward.some(p => p.body === a.b) && evidence.get(pairId(a))?.tier === 'primary');
  for (const emphasis of repeated.filter(()=>hidden.some(p=>p.body==='Moon') && outwardLinks.length).slice(0,1)) {
    const social=emphasis.ps;
    const socialComparison=emphasis.sign==='Libra';
    const cluster = outward.filter(p => outwardLinks.some(a => a.a === p.body || a.b === p.body));
    const hiddenLinks = aspects.filter(a => !a.isWide && a.orb <= 3 && hidden.some(p => p.body === a.a) && hidden.some(p => p.body === a.b) && evidence.get(pairId(a))?.tier === 'primary').slice(0, 1);
    const ps = unique([...social, ...hidden, ...cluster]);
    const chain = route(ps);
    const privacy = hidden.some(p => p.house === 12) ? 'feelings may need solitude before they can be named' : 'sharing feelings may depend on trust and how much influence the other person has';
    const visibleArena=unique(cluster.map(p=>p.house)).join(' and ');
    threads.push({ id: `identity:private-autonomy:${emphasis.sign}`, title: socialComparison ? 'Reading the room without agreeing to disappear into it' : `${emphasis.sign}: a visible decision with a private emotional history`,
      synthesis: `${socialComparison ? "The repeated Libra functions can make another person's reaction part of the information they gather before deciding what they think. That is social perception, not proof that agreement is their highest value." : `Repeated ${emphasis.sign} functions suggest a recurring tendency to ${getNatalSignExpression(emphasis.sign)}. That response belongs to several needs, but does not tell us how readily feelings are shared.`} With ${hidden.map(p => `${p.body} in ${p.sign}, House ${p.house}`).join('; ')}, ${privacy}; ${socialComparison ? "noticing everyone else's position" : 'a recognizable sign response'} does not mean their own emotional response is readily shareable. Meanwhile ${cluster.map(p => `${p.body} in ${p.sign}, House ${p.house}`).join('; ')} are closely joined, so a personal limit or a wish for freedom can become visible before the private reasons are explained. ${socialComparison ? 'The same person may hear both sides carefully and then refuse a role that feels imposed.' : 'A decisive outward response can coexist with a feeling that has not yet found words.'} ${chain.text}`,
      developmental: `One possible developmental expression is ${socialComparison ? 'becoming quick at comparing what different people expect' : `relying on the ${emphasis.sign} response to organize a situation`}, while taking longer to reveal a feeling that does not fit the outward response. This can describe someone who learned early to ${socialComparison ? 'understand an interaction' : 'find a recognizable way to respond'} before exposing their own reaction, but it does not tell us who taught them that or whether it began in childhood. A firm refusal may then feel like the first clear moment when their own position has room to exist, rather than a rejection of connection itself.`,
      internalized: `They may internalize a rule that a personal response should first be ${socialComparison ? 'checked against everyone else’s position' : 'understood privately before being explained'}. Private emotional processing can delay the explanation, while the joined functions in House ${visibleArena} make the refusal or initiative visible. ${socialComparison ? 'The resulting pattern is not simply indecision: there can be careful comparison inside and an unexpectedly definite response outside.' : 'The finished decision can become visible while the more vulnerable feeling behind it remains unspoken.'}`,
      outside: `Others may see someone who ${socialComparison ? 'understands both sides, then suddenly becomes direct or declines to be managed. They may mistake the earlier listening for agreement' : `expresses ${emphasis.sign} through a recognizable response, then becomes unexpectedly definite. They may mistake the outward response for the whole emotional experience`} and the later refusal for an unexplained change of character.`,
      inside: socialComparison ? 'Internally, listening and refusing can belong to the same sequence: they have registered the relationship, considered its fairness, and reached a limit they may not yet know how to describe. They may still care about the other person’s response while being unwilling to keep an arrangement solely to preserve agreement.' : `Internally, the repeated ${emphasis.sign} response and the private Moon need may run on different timelines. They may ${getNatalSignExpression(emphasis.sign)}, while needing more time to know what an interaction meant emotionally. Saying no may make a limit visible without revealing the feeling behind it.`,
      capacity: `${socialComparison ? 'Comparing viewpoints' : `Using the repeated ${emphasis.sign} response`} and recognizing an imposed role can both become strong skills. If those capacities are relied upon too heavily, the person may explain ${socialComparison ? 'everyone else’s position' : 'the decision'} more easily than the unfinished feeling that led to their own response.`,
      cost: `The emotional cost can be having to choose between ${socialComparison ? 'being understood as considerate' : 'showing what they feel'} and being allowed to be definite. People may credit their ${socialComparison ? 'perceptiveness' : 'initiative'} but miss the effort of holding a private reaction while deciding how much of it to reveal.`,
      question: 'When people are surprised by a firm no, had you already spent a long time considering their position privately, or does this reading miss how your decisions actually develop?',
      evidenceIds: validIds([...ps.map(p => `placement:${p.body}`), ...outwardLinks.map(pairId), ...hiddenLinks.map(pairId), ...chain.ids]), weight: 120 });
  }
  for (const a of aspects.filter(a => evidence.get(pairId(a))?.tier === 'primary').sort((a, b) => b.score - a.score)) {
    const interaction = getNatalDevelopmentalInteraction(a, stage);
    const pa = byBody.get(a.a); const pb = byBody.get(a.b);
    if (!interaction || !pa || !pb) continue;
    if (threads.some(t => t.evidenceIds.includes(pairId(a)))) continue;
    const ps = [pa, pb];
    const chain = route(ps);
    const pattern = configurations.find(c => c.tier === 'primary' && c.evidenceIds.includes(pairId(a)));
    const subject = ['Moon', 'Sun', 'Venus', 'Mercury', 'Mars'].find(body => ps.some(p => p.body === body));
    const p = subject ? byBody.get(subject) : undefined;
    const partner = p?.body === pa.body ? pb : pa;
    if (!p) continue;
    const lived = getHouseLivedInterpretation(p.house);
    const otherArena = getHouseLivedInterpretation(partner.house);
    const setting = lived ? `With ${p.body} in ${p.sign}, House ${p.house}, this becomes noticeable around ${lived.focus}.` : `The ${p.sign} expression belongs to ${p.body}, but without verified houses its life setting is withheld.`;
    const bridge = otherArena && partner.house !== p.house
      ? `${partner.body} in ${partner.sign}, House ${partner.house}, brings ${otherArena.focus} into the same response. A concern in one setting may therefore change what they permit themselves to show in the other.` : `${partner.body} in ${partner.sign} shares the same interaction, so the ${p.sign} response is not operating alone.`;
    const privateText = privateHouse(p) ? ` ${p.house === 12 ? 'The feeling or intention may become clear in private before it is ready to be explained.' : 'How much is revealed may depend on trust and what the exchange would put into another person’s hands.'} That privacy is not evidence that nobody cared for them.` : '';
    const patternText = pattern ? ` The ${pattern.name} ties this contact to ${pattern.bodies.filter(b => !ps.some(q => q.body === b)).join(' and ') || 'the complete configuration'}, so the same need appears in more than one interaction. ${pattern.apex ? `${pattern.apex} is the focal function, not a verdict about their character.` : 'The supportive and demanding links have to be read together.'}` : '';
    const title = p.body === 'Moon' && partner.body === 'Saturn' ? 'Being composed does not mean needing little'
      : p.body === 'Venus' && partner.body === 'Saturn' ? 'Being dependable and feeling valued are not the same thing'
      : partner.body === 'Pluto' ? `${p.body === 'Mercury' ? 'Understanding what is unsaid' : 'Strong investment'} without showing the whole reaction`
      : partner.body === 'Uranus' ? 'Wanting recognition without being assigned a role'
      : partner.body === 'Neptune' ? 'Noticing another person’s hopes before naming their own response'
      : partner.body === 'Mars' ? 'The personal meaning underneath a quick response'
      : 'A personal wish checked against an internal standard';
    threads.push({ id: `identity:${pairId(a)}`, title,
      synthesis: `${interaction.pattern} ${setting} In that setting they may ${getNatalSignExpression(p.sign)}. ${bridge}${privateText} ${chain.text}${patternText}`,
      developmental: `One possible developmental expression is learning to pair ${p.body === 'Moon' ? 'a need for comfort' : p.body === 'Venus' ? 'a wish to be valued' : p.body === 'Mercury' ? 'the wish to be understood' : p.body === 'Mars' ? 'a personal preference' : 'the wish to be recognized'} with the ${partner.body} response before letting it be seen. ${interaction.internalRule} This is a hypothesis about a possible learned pattern, not a claim about parents, childhood conditions, or the age at which it began. ${privateHouse(p) ? 'Private processing could make the pattern less visible to observers, even when it feels significant to the person.' : 'Repeated use can make the response feel ordinary to the person, even when others notice it strongly.'}`,
      internalized: `${interaction.internalRule} ${bridge} ${interaction.cost}`,
      outside: visibleHouse(p) || visibleHouse(partner) ? `The angular-house setting makes part of this response easy to notice: others may first encounter the way they ${getNatalSignExpression(visibleHouse(p) ? p.sign : partner.sign)}. ${interaction.capacity} That impression can obscure the personal wish described by ${p.body}.` : `${interaction.capacity} Others may see the result of this skill rather than the checking that preceded it, particularly when ${p.body}'s response is ${privateHouse(p) ? 'processed privately' : 'filtered through the aspect before it is expressed'}.`,
      inside: `${interaction.pattern} ${interaction.cost}`,
      capacity: `${interaction.capacity} The chart does not tell us that circumstances forced this skill to develop. When it is relied on as the only acceptable response, ${p.body}'s ${p.body === 'Moon' ? 'need for care' : p.body === 'Mercury' ? 'unfinished thinking' : p.body === 'Venus' ? 'preferences and enjoyment' : 'personal wishes'} may get less room than the practiced ${partner.body} response.`,
      cost: interaction.cost, question: interaction.question,
      evidenceIds: validIds([...ps.map(q => `placement:${q.body}`), pairId(a), ...chain.ids, ...(pattern?.evidenceIds ?? [])]),
      weight: Math.min(a.score / 4, 95) + (p.body === 'Moon' ? 10 : 0) + (ruler && ps.some(q => q.body === ruler.body) ? 8 : 0) });
    if (threads.length >= 5) break;
  }
  // Private luminaries can support an identity contrast without implying a demanding childhood.
  for (const p of placements.filter(p => ['Sun', 'Moon'].includes(p.body) && privateHouse(p))) {
    if (threads.length >= 5 || threads.some(t => t.evidenceIds.includes(`placement:${p.body}`))) continue;
    const visible = placements.find(q => ['Sun', 'Mars', 'Ascendant'].includes(q.body) && visibleHouse(q) && q.body !== p.body);
    if (!visible) continue;
    const chain = route([p, visible]);
    threads.push({id: `identity:private-${p.body}`, title: p.body === 'Sun' ? 'A personal identity that is not always offered to an audience' : 'The first response is not the whole emotional response',
      synthesis: `${p.body} in ${p.sign}, House ${p.house}, puts ${p.body === 'Sun' ? 'self-expression' : 'emotional settling'} around ${getHouseLivedInterpretation(p.house)?.focus}. They may ${getNatalSignExpression(p.sign)}, but the response may be felt or prepared privately rather than announced. ${visible.body} in ${visible.sign}, House ${visible.house}, describes a more visible way to ${getNatalSignExpression(visible.sign)}. People can therefore meet the outward response before discovering what feels personal underneath. ${chain.text}`,
      developmental: '', internalized: '',
      outside: `People may first notice ${visible.body}'s ${visible.sign} response and expect that to describe every setting. The private ${p.body} placement suggests that being seen and being emotionally known are different experiences; someone can participate visibly without disclosing what matters most.`,
      inside: `${p.body === 'Sun' ? 'Wanting recognition can coexist with wanting control over who sees a personal contribution before it is ready.' : 'An immediate response can coexist with feelings that only become clear after the exchange.'} ${p.sign === 'Leo' ? 'Leo can describe wanting a contribution to be personal and valued, rather than needing a public stage. In a private house, a trusted person’s recognition or work made out of view may matter more than being conspicuous.' : `The ${p.sign} response remains present: they may ${getNatalSignExpression(p.sign)}.`} The house changes where this is lived, not whether the need exists.`,
      capacity: 'Private preparation can become a real strength: the person may know more about their response than they reveal in the moment. If only the finished response is ever shown, others may underestimate the need for recognition or reassurance that preceded it.',
      cost: 'They may be treated as less personally invested than they are, because observers see participation without the private meaning behind it.',
      question: 'Which part of how you respond is visible immediately, and which part only makes sense after you have had time alone?',
      evidenceIds: validIds([`placement:${p.body}`, `placement:${visible.body}`, ...chain.ids]), weight: 60 });
  }
  threads.sort((a, b) => b.weight - a.weight);
  const selected = threads.slice(0, 4);
  const conclusion = (t: DevelopmentalThread, suffix: string, text: string): IdentityConclusion => ({id: `${t.id}:${suffix}`, title: t.title, text, evidenceIds: t.evidenceIds});
  const learned = selected.filter(t => t.developmental);
  const sections: DevelopmentalSection[] = [];
  if (learned.length) {
    sections.push({id: 'development', title: 'What this may have felt like growing up', framing, conclusions: learned.slice(0, 2).map(t => conclusion(t, 'development', t.developmental))});
    sections.push({id: 'internalized', title: 'What gets internalized rather than expressed', framing: 'A possible rule for preserving acceptance, privacy, or a sense of control, not proof of danger or rejection.', conclusions: learned.slice(0, 2).map(t => conclusion(t, 'internalized', t.internalized))});
  }
  if (selected.length) {
    sections.push({id: 'presentation', title: 'What people see vs. what is happening inside', conclusions: selected.slice(0, 2).map(t => conclusion(t, 'presentation', `${t.outside} ${t.inside}`))});
    const center = selected[0];
    if (center) sections.push({id: 'contradiction', title: 'The contradiction at the center of the chart', framing: 'The strongest supported tension in this reading, not the only possible organizing theme.', conclusions: [conclusion(center, 'contradiction', `${center.synthesis} ${center.cost}`)]});
    sections.push({id: 'capacity', title: 'What becomes practiced, and what may go unnoticed', framing: 'A capacity may become overused. The chart cannot show that it developed because it had to.', conclusions: selected.slice(1, 3).concat(selected.length === 1 ? selected : []).map(t => conclusion(t, 'capacity', `${t.capacity} ${t.cost}`))});
  }
  return {threads: selected, sections: sections.filter(s => s.conclusions.length)};
}
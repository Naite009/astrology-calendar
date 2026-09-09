/**
 * The pair reading: one context-aware, evidence-first reading model that the
 * screen and the PDF both render.
 *
 * Reading order (A–K):
 *   context → at a glance → what works naturally → where they misread each other
 *   → communication → emotional fit → energy / conflict / repair
 *   → house overlays → strongest aspects → advanced (optional) → bottom line
 *
 * Rules enforced here:
 *   - Every statement carries the exact contacts behind it.
 *   - Constructive expression first, qualified growth edge second.
 *   - No destiny, safety, clinical, sexual or marriage framing unless the context
 *     allows it; everything is run through the relationship language policy.
 */

import { NatalChart } from '@/hooks/useNatalChart';
import {
  CrossAspect,
  calculateCrossAspects,
  coreAspects,
  involves,
  involvesBoth,
  rankTopContacts,
  describeAspect,
  isAutomaticNodalMirror,
} from './synastryEngine';
import {
  HouseOverlayContact,
  OverlayCluster,
  calculateHouseOverlaysAccurate,
  overlayClusters,
} from './houseOverlayEngine';
import { ContextScore, scoreRelationship } from './contextScoring';
import { RelationshipContext, RelationshipSectionKey } from './relationshipContext';
import { sanitizeRelationshipDeep } from './relationshipLanguage';
import { AgeStage } from '@/lib/readingGuide/ageContext';
import { describeDirectionalContact, directionalEvidenceLines, type DirectionalContact } from './directionalRoles';
import {
  contactTier, doesNotMeanFor, rankByEvidence, signalLevel,
  type EvidenceTier, type SignalLevel,
} from '@/lib/interpretation/evidenceStandard';

export interface ReadingItem {
  title: string;
  /** Constructive/functional expression first. */
  statement: string;
  /** Qualified tendency, only when the contact really is a friction point. */
  growthEdge?: string;
  /** What the astrologer can say out loud. */
  say?: string;
  /** Exact chart evidence. */
  evidence: string[];
  strength: 'strong' | 'moderate' | 'single-contact';
  /** Shared evidence hierarchy: primary / secondary / supplemental. */
  tier: EvidenceTier;
  /** Concise clarifications for easily misread signatures. */
  doesNotMean: string[];
  /** Explicit "who feels what" breakdown for the contact behind this item. */
  directional?: DirectionalContact;
}


export interface PairSection {
  key: RelationshipSectionKey;
  title: string;
  intro?: string;
  items: ReadingItem[];
  /** Shown when there is genuinely nothing close in this area. */
  emptyNote?: string;
}

export interface SymbolicLayer {
  available: boolean;
  heading: string;
  note: string;
  items: ReadingItem[];
}

export interface PairReading {
  context: RelationshipContext;
  score: ContextScore;
  aspects: CrossAspect[];
  topContacts: CrossAspect[];
  overlays: HouseOverlayContact[];
  clusters: OverlayCluster[];
  sections: PairSection[];
  bottomLine: string;
  methodNote: string;
  /** Nodes / Chiron, clearly labelled as a symbolic layer. */
  symbolic: SymbolicLayer;
  /** True when any overlay had to fall back to whole-sign counting. */
  usesApproximateHouses: boolean;
}

// ── contact interpretation ────────────────────────────────────────────

type ContactFlavour =
  | 'moon-moon'
  | 'moon-personal'
  | 'mercury'
  | 'mars'
  | 'saturn'
  | 'sun-jupiter-venus'
  | 'outer'
  | 'nodal'
  | 'chiron'
  | 'same-body'
  | 'other';

function flavour(a: CrossAspect): ContactFlavour {
  const pair = [a.fromBody, a.toBody];
  if (pair.every((b) => b === 'Moon')) return 'moon-moon';
  if (pair.includes('NorthNode') || pair.includes('SouthNode')) return 'nodal';
  if (pair.includes('Chiron')) return 'chiron';
  if (pair.includes('Moon')) return 'moon-personal';
  if (pair.includes('Mercury')) return 'mercury';
  if (pair.includes('Mars')) return 'mars';
  if (pair.includes('Saturn')) return 'saturn';
  if (pair.some((b) => ['Uranus', 'Neptune', 'Pluto'].includes(b))) return 'outer';
  if (pair.some((b) => ['Sun', 'Jupiter', 'Venus'].includes(b))) return 'sun-jupiter-venus';
  if (a.fromBody === a.toBody) return 'same-body';
  return 'other';
}

function stageWord(stage: AgeStage, adult: string, teen: string, child: string): string {
  return stage === 'adult' ? adult : stage === 'teen' ? teen : child;
}

interface ContactCopy {
  title: string;
  constructive: string;
  growthEdge?: string;
  say: string;
}

function contactCopy(a: CrossAspect, ctx: RelationshipContext): ContactCopy {
  const f = flavour(a);
  const A = a.fromOwner;
  const B = a.toOwner;
  const tense = a.tone === 'tense';
  const stage = ctx.stage;

  switch (f) {
    case 'moon-moon':
      return {
        title: 'Emotional rhythm',
        constructive: `Both Moons are in contact, so ${A} and ${B} pick up on each other's mood quickly, often before anything is said.`,
        growthEdge: tense
          ? `Because the contact is a hard one, their comfort settings differ: what calms one can feel like the wrong move to the other, especially when both are already tired.`
          : undefined,
        say: `You two read each other's mood fast. ${tense ? 'You just settle down in different ways, which is where it can get bumpy.' : 'That makes it easy to feel understood without explaining much.'}`,
      };
    case 'moon-personal':
      return {
        title: 'Feeling understood',
        constructive: `A Moon contact links how one of them feels to how the other acts, so emotional signals land clearly between them.`,
        growthEdge: tense
          ? `Under strain this can look like one person feeling unmet and the other feeling accused, when neither intended it.`
          : undefined,
        say: `Feelings travel quickly between you. ${tense ? 'When one of you is off, the other notices immediately, and that can escalate before anyone means it to.' : 'It is easy to feel looked after here.'}`,
      };
    case 'mercury':
      return {
        title: 'How they talk',
        constructive: `A Mercury contact links their thinking styles, so explanations, jokes and plans move between them with real traction.`,
        growthEdge: tense
          ? `Their pacing is different: one wants the detail, the other wants the point. Most of their misunderstandings are likely to be wording rather than intent.`
          : undefined,
        say: `Talking is a real channel between you. ${tense ? 'You just process at different speeds, so slowing down and checking what the other actually meant goes a long way.' : 'You explain things to each other well.'}`,
      };
    case 'mars':
      return {
        title: stageWord(stage, 'Drive and conflict style', 'Energy and arguments', 'Energy and squabbles'),
        constructive: `A Mars contact means their energy genuinely engages: they can push each other into action and get things moving.`,
        growthEdge: tense
          ? `It also means friction shows up as speed. Irritation can go from nothing to loud quickly, so an agreed way to pause matters more than being right.`
          : undefined,
        say: `You spark each other's energy. ${tense ? 'That is great for getting going and less great mid-argument, so a short break beats pushing through.' : 'You can get things done side by side.'}`,
      };
    case 'saturn':
      return {
        title: stageWord(stage, 'Structure and responsibility', 'Boundaries and responsibility', 'Rules and looking after each other'),
        constructive: `A Saturn contact adds seriousness: one of them tends to hold the line on limits, follow-through and what is fair.`,
        growthEdge: tense
          ? `Held too tightly, that can feel like being corrected rather than supported. Naming the expectation out loud usually dissolves most of it.`
          : undefined,
        say: `There is a steadying, hold-the-line quality between you. ${tense ? 'It helps when the expectation is said plainly instead of assumed.' : 'It gives the relationship staying power.'}`,
      };
    case 'sun-jupiter-venus':
      return {
        title: 'Encouragement',
        constructive: `This contact links confidence and goodwill: each tends to bring out more of the other's warmth and willingness.`,
        growthEdge: tense
          ? `The generous version can tip into over-promising, or into one person carrying more of the good mood than the other.`
          : undefined,
        say: `You bring out each other's better mood. ${tense ? 'Just keep the promises realistic.' : 'That is one of the strongest things you have going.'}`,
      };
    case 'outer':
      return {
        title: 'High-intensity contact',
        constructive: `A slow-moving planet touches a personal one here, which tends to make the relationship feel significant rather than casual.`,
        growthEdge: tense
          ? `Intensity is not a diagnosis: in practice it usually means the stakes feel higher than the situation warrants, and it helps to check that with each other.`
          : undefined,
        say: `This connection carries some weight for both of you. When something here flares up, it is usually about the feeling, not the incident.`,
      };
    case 'same-body':
      return {
        title: 'Shared temperament',
        constructive: `The same planet meets itself across the two charts, so a whole layer of their style genuinely overlaps.`,
        say: `You approach this part of life in a similar way, which makes it easy to assume the other already knows what you mean.`,
      };
    case 'nodal':
      return {
        title: 'Nodal contact (symbolic layer)',
        constructive: `A nodal contact is traditionally read as a familiar-feeling connection with room to stretch. Treat it as a symbolic layer, not a fact about either person's history.`,
        say: `In symbolic terms this pairing feels familiar quickly, and it also nudges you both slightly outside your usual range.`,
      };
    case 'chiron':
      return {
        title: 'Sensitive area',
        constructive: `A Chiron contact points to a tender area where each may understand the other unusually well, and where kindness lands more than advice.`,
        growthEdge: tense
          ? `It can also be where a careless comment stings more than expected. Nothing here says either person caused the other's sensitivity.`
          : undefined,
        say: `There is a soft spot in this connection where you both understand something the other person may not say out loud. Gentleness matters more than being right.`,
      };
    default:
      return {
        title: 'Notable contact',
        constructive: `This contact adds a distinct thread between them worth noticing alongside the stronger ones.`,
        say: `This one is a smaller thread, but it is real.`,
      };
  }
}

function strengthOf(supporting: CrossAspect[]): ReadingItem['strength'] {
  if (supporting.length >= 3) return 'strong';
  if (supporting.length === 2) return 'moderate';
  return 'single-contact';
}

/** Group contacts by flavour so the reading synthesises instead of listing. */
function groupedItems(aspects: CrossAspect[], ctx: RelationshipContext, limit: number): ReadingItem[] {
  const groups = new Map<ContactFlavour, CrossAspect[]>();
  for (const a of aspects) {
    const f = flavour(a);
    groups.set(f, [...(groups.get(f) ?? []), a]);
  }
  const items: ReadingItem[] = [];
  for (const [, list] of [...groups.entries()].sort(
    (x, y) => y[1].reduce((s, a) => s + a.weight, 0) - x[1].reduce((s, a) => s + a.weight, 0)
  )) {
    const lead = list[0];
    const copy = contactCopy(lead, ctx);
    items.push({
      title: copy.title,
      statement: copy.constructive,
      growthEdge: copy.growthEdge,
      say: copy.say,
      evidence: [...list.slice(0, 4).map(describeAspect), ...directionalEvidenceLines(describeDirectionalContact(lead, ctx))],
      strength: strengthOf(list),
      directional: describeDirectionalContact(lead, ctx),
    });
    if (items.length >= limit) break;
  }
  return items;
}

// ── section builders ──────────────────────────────────────────────────

function overlayItems(
  overlays: HouseOverlayContact[],
  clusters: OverlayCluster[],
  ctx: RelationshipContext
): ReadingItem[] {
  const notable = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Saturn', 'Jupiter'];
  const items: ReadingItem[] = [];

  for (const c of clusters.slice(0, 3)) {
    items.push({
      title: `${c.bodyOwner}'s planets cluster in ${c.houseOwner}'s ${c.house}${c.house === 1 ? 'st' : c.house === 2 ? 'nd' : c.house === 3 ? 'rd' : 'th'} house`,
      statement: `${c.bodies.length} of ${c.bodyOwner}'s planets land in ${c.houseOwner}'s ${c.arena}. That is the part of ${c.houseOwner}'s life this person shows up in most.`,
      evidence: c.bodies.map(
        (b) => `${c.bodyOwner}'s ${b} falls in ${c.houseOwner}'s house ${c.house} (${c.method === 'cusps' ? 'from actual house cusps' : 'whole-sign count'})`
      ),
      say: `A lot of ${c.bodyOwner} shows up in ${c.houseOwner}'s ${c.arena.toLowerCase()}.`,
      strength: c.bodies.length >= 3 ? 'strong' : 'moderate',
    });
  }

  for (const o of overlays.filter((o) => notable.includes(o.body)).slice(0, 8)) {
    items.push({
      title: o.statement,
      statement: `That places ${o.bodyOwner}'s ${o.body} in ${o.houseOwner}'s ${o.arena.toLowerCase()}.`,
      evidence: [
        `${o.statement} (${o.method === 'cusps' ? 'calculated from ' + o.houseOwner + "'s actual house cusps" : 'whole-sign count from the Ascendant'})`,
        ...(o.approximationNote ? [o.approximationNote] : []),
      ],
      strength: 'single-contact',
    });
  }
  return items;
}

function aspectItems(top: CrossAspect[], ctx: RelationshipContext): ReadingItem[] {
  return top.map((a) => {
    const d = describeDirectionalContact(a, ctx);
    return {
    title: describeAspect(a),
    statement: `Separation ${a.separation.toFixed(2)}°, exact aspect angle ${a.aspectAngle}°, orb ${a.orb.toFixed(1)}° within the ${a.maxOrb}° allowance for these bodies. ${d.summary}`,
    directional: d,
    evidence: [
      `Direction: ${a.fromOwner}'s ${a.fromBody} → ${a.toOwner}'s ${a.toBody} (the reverse contact, if present, is listed separately).`,
      ...directionalEvidenceLines(d),
    ],
    strength: (a.weight >= 0.5 ? 'strong' : a.weight >= 0.3 ? 'moderate' : 'single-contact') as ReadingItem['strength'],
    };
  });
}

const SECTION_TITLES: Partial<Record<RelationshipSectionKey, string>> = {
  atAGlance: 'At a glance',
  worksNaturally: 'What works naturally',
  misreadEachOther: 'Where they can misread each other',
  communication: 'Communication',
  emotionalFit: 'Emotional fit',
  energyAndRepair: 'Energy, friction and repair',
  houseOverlays: 'House overlays — where each lands in the other\u2019s life',
  strongestAspects: 'Strongest contacts, with degrees',
  romanticAttraction: 'Warmth and attraction',
  trustAndSupport: 'Trust and support',
  sharedInterests: 'Shared interests and everyday fun',
  conflictAndRecovery: 'Disagreements and making up',
  boundariesAndPacing: 'Pacing and boundaries',
  confidenceAndGrowth: 'Effect on confidence and growth',
  longTermPartnership: 'Long-term partnership',
  businessCollaboration: 'Working together',
  bottomLine: 'Bottom line',
};

export interface PairReadingOptions {
  includeAdvancedBodies?: boolean;
  includeMinorAspects?: boolean;
}

export function buildPairReading(
  chart1: NatalChart,
  chart2: NatalChart,
  ctx: RelationshipContext,
  opts: PairReadingOptions = {}
): PairReading {
  const all = calculateCrossAspects(chart1, chart2, opts);
  const core = coreAspects(all).filter((a) => !isAutomaticNodalMirror(a));
  const score = scoreRelationship(all, ctx);
  const overlays = calculateHouseOverlaysAccurate(chart1, chart2, { stage: ctx.stage });
  const clusters = overlayClusters(overlays);
  const topContacts = rankTopContacts(all, 5);

  const supportive = core.filter((a) => a.tone === 'flowing' || a.tone === 'fusion');
  const frictional = core.filter((a) => a.tone === 'tense');
  const mercury = core.filter((a) => involves(a, 'Mercury'));
  const moon = core.filter((a) => involves(a, 'Moon'));
  const energy = core.filter((a) => involves(a, 'Mars', 'Saturn', 'Pluto', 'Uranus'));
  const nodalOrChiron = core.filter((a) => involves(a, 'NorthNode', 'SouthNode', 'Chiron'));

  const sections: PairSection[] = [];
  const add = (key: RelationshipSectionKey, items: ReadingItem[], intro?: string, emptyNote?: string) => {
    if (!ctx.sections.includes(key)) return;
    sections.push({ key, title: SECTION_TITLES[key] ?? key, intro, items, emptyNote: items.length ? undefined : emptyNote });
  };

  add(
    'atAGlance',
    groupedItems(core, ctx, 5),
    `The strongest themes between ${chart1.name} and ${chart2.name}, ranked by how close the contacts are and how personal the bodies involved are.`,
    'These two charts have very few close contacts, which is itself worth saying out loud: the connection is likely to feel low-key rather than intense.'
  );
  add('worksNaturally', groupedItems(supportive, ctx, 4), undefined, 'No close flowing contacts, so ease here is built by habit rather than handed over by the charts.');
  add(
    'misreadEachOther',
    groupedItems(frictional, ctx, 4).map((i) => ({
      ...i,
      statement: i.growthEdge ?? i.statement,
      growthEdge: undefined,
    })),
    'Read these as tendencies under strain, not as faults in either person.',
    'No close hard contacts between the core bodies, so friction here is more likely to come from circumstances than from a clash of styles.'
  );
  add('communication', groupedItems(mercury, ctx, 3), undefined, 'No close Mercury contacts. Talking is neither especially easy nor especially hard between them; it depends on habit.');
  add('emotionalFit', groupedItems(moon, ctx, 3), undefined, 'No close Moon contacts, so emotional attunement is learned rather than instinctive here.');
  add(
    'energyAndRepair',
    groupedItems(energy, ctx, 3),
    'What starts friction, and what helps the pair come back together.',
    'No close Mars, Saturn or outer-planet contacts, so flare-ups are likely to be short and situational.'
  );
  add('houseOverlays', overlayItems(overlays, clusters, ctx), 'Each line states the direction explicitly: whose planet lands in whose house.');
  add('strongestAspects', aspectItems(topContacts, ctx), 'Same numbers as everywhere else on this page and in the export.');

  if (ctx.allowRomantic) {
    add(
      'romanticAttraction',
      groupedItems(core.filter((a) => involves(a, 'Venus', 'Mars')), ctx, 3),
      ctx.isTeenRomance
        ? 'What the liking between them is built on: warmth, shared taste and how each shows they care.'
        : undefined,
      'No close Venus or Mars contacts, so the attraction here is built more on shared time and interests than on an instant pull.'
    );
  }
  if (ctx.isTeenRomance) {
    add(
      'trustAndSupport',
      groupedItems(core.filter((a) => involvesBoth(a, ['Moon', 'Saturn', 'Jupiter'], ['Sun', 'Moon', 'Venus', 'Saturn', 'Jupiter', 'Ascendant'])), ctx, 3),
      'Whether each one feels safe being honest, and how they back each other up.',
      'No close trust-and-reliability contacts, so trust here is built by what they actually do for each other over time.'
    );
    add(
      'sharedInterests',
      groupedItems(core.filter((a) => involves(a, 'Mercury', 'Venus', 'Jupiter', 'Uranus')), ctx, 3),
      'Where their tastes, humour and everyday interests overlap.',
      'No close contacts in this area, so shared interests are something they build rather than something they arrive with.'
    );
    add(
      'conflictAndRecovery',
      groupedItems(frictional.length ? frictional : energy, ctx, 3).map((i) => ({
        ...i,
        statement: i.growthEdge ?? i.statement,
        growthEdge: undefined,
      })),
      'How arguments are likely to start, and what helps them come back together afterwards.',
      'No close hard contacts, so disagreements are more likely to be about circumstances than about a clash of styles.'
    );
    add(
      'boundariesAndPacing',
      groupedItems(core.filter((a) => involves(a, 'Saturn', 'Mars', 'Pluto') || involvesBoth(a, ['Moon'], ['Saturn', 'Mars'])), ctx, 3),
      'How fast this connection tends to move, and where it helps to slow down, keep other friendships, and say what is and is not okay.',
      'Nothing in the charts pushes this pair to rush, which makes it easier to let things move at a comfortable pace.'
    );
    add(
      'confidenceAndGrowth',
      groupedItems(core.filter((a) => involvesBoth(a, ['Sun', 'Jupiter', 'Venus'], ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Ascendant'])), ctx, 3),
      'How being together may affect how each one feels about themselves, their school life, and their other friendships.',
      'No strong confidence-related contacts, so the effect on each person\u2019s confidence will come from how they treat each other day to day.'
    );
  }
  if (ctx.allowBusiness) {
    add('businessCollaboration', groupedItems(core.filter((a) => involves(a, 'Saturn', 'Mercury', 'Jupiter', 'Midheaven')), ctx, 3));
  }

  // Bottom line: synthesised from the two strongest themes plus the score band.
  const glance = sections.find((s) => s.key === 'atAGlance');
  const themes = (glance?.items ?? []).slice(0, 2);
  const bandWord =
    score.overall === null
      ? 'mixed'
      : score.overall >= 70
        ? 'a lot to work with'
        : score.overall >= 55
          ? 'a workable, real connection'
          : 'a connection that rewards deliberate effort';
  const bottomLine = themes.length
    ? `${chart1.name} and ${chart2.name} have ${bandWord} in a ${ctx.label.toLowerCase()} reading. The clearest threads are ${themes
        .map((t) => t.title.toLowerCase())
        .join(' and ')}. ${themes[0].say ?? ''} Where it gets bumpy, it is usually about pace and comfort settings rather than intent, and it responds to being named out loud.`
    : `${chart1.name} and ${chart2.name} have few close contacts between their charts. In a ${ctx.label.toLowerCase()} reading that usually means the relationship is shaped more by shared circumstances and habit than by strong chart pull, which is a perfectly ordinary result.`;

  const symbolic: SymbolicLayer = {
    available: nodalOrChiron.length > 0,
    heading: 'Symbolic layer: nodes and Chiron (optional)',
    note:
      nodalOrChiron.length > 0
        ? 'These are traditional symbolic readings, offered as one lens only. They are not statements about either person\u2019s history, and nothing here can be verified from a chart.'
        : 'There is no strong nodal or Chiron signature between these charts in this framework, so there is nothing to report in this layer.',
    items: nodalOrChiron.length > 0 ? groupedItems(nodalOrChiron, ctx, 3) : [],
  };

  const usesApproximateHouses = overlays.some((o) => o.method === 'whole-sign-fallback');
  const methodNote = `Contacts use the app\u2019s shared tiered orb allowances (widest for Sun and Moon, tighter for slow planets, tightest for nodes and Chiron) and only the core bodies: the ten planets, the Ascendant and Midheaven where stored, the nodes and Chiron. House overlays use ${usesApproximateHouses ? 'actual house cusps where they are stored, and a labelled whole-sign count where they are not' : 'each person\u2019s actual house cusps'}.`;

  return sanitizeRelationshipDeep(
    {
      context: ctx,
      score,
      aspects: all,
      topContacts,
      overlays,
      clusters,
      sections,
      bottomLine,
      methodNote,
      symbolic,
      usesApproximateHouses,
    },
    ctx
  );
}

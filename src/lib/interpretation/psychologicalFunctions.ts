import type { RankedAspect, AspectName } from '@/lib/aspectRanking';
import { sanitizeInterpretiveDeep } from '@/lib/interpretation/languagePolicy';

export type PsychologicalBody =
  | 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn'
  | 'Uranus' | 'Neptune' | 'Pluto' | 'Chiron' | 'NorthNode' | 'SouthNode'
  | 'Ascendant' | 'MC';

export type DevelopmentalStage = 'child' | 'teen' | 'adult';

export interface PsychologicalFunctionDefinition {
  shortFunction: string;
  psychologicalFunction: string;
  healthyExpression: string;
  protectiveOrShadowExpression: string;
  relationshipExpression: string;
  authorityAssociation?: string;
  questionsForReflection: string[];
}

export interface PsychologicalAspectContext {
  bodyA: string;
  bodyB: string;
  aspect: AspectName | string;
  orb?: number;
  signA?: string | null;
  signB?: string | null;
  houseA?: number | null;
  houseB?: number | null;
  stage?: DevelopmentalStage;
}

export interface PsychologicalAspectSynthesis {
  title: string;
  functionA: string;
  functionB: string;
  aspectDynamic: string;
  signHouseContext: string;
  howThisCanShowUp: string[];
  whenIntegrated: string;
  watchFor: string;
  reflectionQuestion: string;
  evidence: string;
}

export interface PsychologicalMapRow {
  body: string;
  psychologicalJob: string;
  placementStyle: string;
  lifeArena: string;
  strongestAspects: string[];
}

const FUNCTIONS: Record<PsychologicalBody, PsychologicalFunctionDefinition> = {
  Sun: {
    shortFunction: 'Identity, vitality & will',
    psychologicalFunction: 'The Sun describes self-definition, vitality, will, and the need to become more fully oneself.',
    healthyExpression: 'A steady sense of purpose, creative agency, and permission to take up space.',
    protectiveOrShadowExpression: 'Identity can become over-invested in proving, performing, or defending one preferred version of the self.',
    relationshipExpression: 'The Sun shows what a person wants recognized and respected in close relationships.',
    questionsForReflection: ['When do you feel most like yourself, without needing to prove it?'],
  },
  Moon: {
    shortFunction: 'Emotional safety & attachment',
    psychologicalFunction: 'The Moon describes emotional regulation, security needs, instinctive responses, and what helps the body feel settled.',
    healthyExpression: 'Emotions can be noticed, regulated, and used as information without controlling every decision.',
    protectiveOrShadowExpression: 'Under pressure, familiar safety habits may take over before conscious choice catches up.',
    relationshipExpression: 'The Moon shows how care is received, how closeness feels safe, and how someone reacts when emotionally stirred.',
    questionsForReflection: ['What helps you settle enough to know what you actually feel?'],
  },
  Mercury: {
    shortFunction: 'Thinking & meaning-making',
    psychologicalFunction: 'Mercury describes perception, thinking, learning, language, and how the mind sorts information.',
    healthyExpression: 'Curiosity, clear translation, and flexible movement between observation and explanation.',
    protectiveOrShadowExpression: 'The mind may over-explain, rush, repeat, or withhold when uncertainty feels uncomfortable.',
    relationshipExpression: 'Mercury shows how someone exchanges ideas, names needs, listens, and works through misunderstandings.',
    questionsForReflection: ['Do you understand something best out loud, on paper, or in your head first?'],
  },
  Venus: {
    shortFunction: 'Bonding, values & receptivity',
    psychologicalFunction: 'Venus describes relating, attraction, receptivity, pleasure, values, self-worth, social bonding, and resources.',
    healthyExpression: 'The ability to enjoy, receive, choose by genuine values, and build mutual connection.',
    protectiveOrShadowExpression: 'A person may over-accommodate, overvalue approval, or avoid naming preferences when connection feels uncertain.',
    relationshipExpression: 'Venus shows what feels appealing, valued, reciprocal, and worth making room for.',
    questionsForReflection: ['What helps you feel valued without having to earn every sign of care?'],
  },
  Mars: {
    shortFunction: 'Drive, assertion & boundaries',
    psychologicalFunction: 'Mars describes desire, assertion, anger, pursuit, drive, boundaries, and how someone goes after what they want.',
    healthyExpression: 'Direct action, usable anger, clear limits, and the ability to pursue a goal without overriding others.',
    protectiveOrShadowExpression: 'Pressure may come out as impatience, defensiveness, abrupt action, or delayed resentment.',
    relationshipExpression: 'Mars shows initiative, conflict style, motivation, attraction when age-appropriate, and how boundaries are defended.',
    questionsForReflection: ['What tells you it is time to act, and what tells you it is time to pause?'],
  },
  Jupiter: {
    shortFunction: 'Meaning, confidence & growth',
    psychologicalFunction: 'Jupiter describes belief, meaning, confidence, opportunity, worldview, and the appetite for growth.',
    healthyExpression: 'Hope joins judgment, allowing exploration without losing proportion.',
    protectiveOrShadowExpression: 'Confidence can become overreach, certainty, excess, or a promise made before details are checked.',
    relationshipExpression: 'Jupiter shows how encouragement, shared meaning, humor, and room to grow support connection.',
    questionsForReflection: ['What gives you confidence, and where do you need evidence before saying yes?'],
  },
  Saturn: {
    shortFunction: 'Structure, rules & mastery',
    psychologicalFunction: 'Saturn describes structure, authority, responsibility, boundaries, time, inhibition, mastery, consequence, and internalized rules.',
    healthyExpression: 'Reliable boundaries, earned skill, patience, realistic standards, and responsibility with limits.',
    protectiveOrShadowExpression: 'Caution may harden into excessive restraint, self-monitoring, or rules that outlive their purpose.',
    relationshipExpression: 'Saturn shows where commitment, reliability, pacing, duty, and fear of getting it wrong enter relationships.',
    authorityAssociation: 'Saturn can echo authority, parenting, or internalized rules. Older astrology often linked Saturn with a father archetype, but a Saturn contact cannot identify a parent or prove an event.',
    questionsForReflection: ['Which rules help you grow, and which ones do you follow mainly to avoid disapproval?'],
  },
  Uranus: {
    shortFunction: 'Freedom & individuation',
    psychologicalFunction: 'Uranus describes individuation, freedom, disruption, originality, awakening, activation, and refusal of confinement.',
    healthyExpression: 'Independent thought, useful experimentation, and change that creates more room to be genuine.',
    protectiveOrShadowExpression: 'Freedom needs may arrive as abrupt distance, contrariness, or change before the next step is ready.',
    relationshipExpression: 'Uranus shows where connection needs honesty, room, novelty, and permission not to follow a script.',
    questionsForReflection: ['Where do you need room to do it differently without cutting off support?'],
  },
  Neptune: {
    shortFunction: 'Imagination & permeability',
    psychologicalFunction: 'Neptune describes imagination, idealization, longing, spirituality, compassion, fantasy, and porous boundaries.',
    healthyExpression: 'Imagination and compassion stay connected to discernment, limits, and ordinary reality.',
    protectiveOrShadowExpression: 'Longing may blur facts, idealize a person or possibility, or make clear limits harder to hold.',
    relationshipExpression: 'Neptune shows where empathy and idealization shape what someone hopes a bond could become.',
    questionsForReflection: ['What helps you honor a hope while still checking what is actually happening?'],
  },
  Pluto: {
    shortFunction: 'Power, survival & renewal',
    psychologicalFunction: 'Pluto describes survival, power, control, compulsion, taboo, intensity, elimination, and deep renewal.',
    healthyExpression: 'Focused investment, emotional honesty, resilience, and the capacity to release what no longer works.',
    protectiveOrShadowExpression: 'Intensity may become control, secrecy, fixation, or testing when vulnerability feels risky.',
    relationshipExpression: 'Pluto shows where trust, power, depth, and strong investment need conscious handling.',
    questionsForReflection: ['Where does strong investment help you commit, and where does it make letting go harder?'],
  },
  Chiron: {
    shortFunction: 'Sensitivity becoming skill',
    psychologicalFunction: 'Chiron describes a sensitivity or vulnerability that can gradually become insight, language, or skill.',
    healthyExpression: 'Sensitivity is met with context, choice, and compassion rather than treated as an identity.',
    protectiveOrShadowExpression: 'A tender area may be avoided, overprotected, or assumed to be more visible than it is.',
    relationshipExpression: 'Chiron can show where care, pacing, and respectful language matter more than usual.',
    questionsForReflection: ['What helps this sensitive area become useful understanding rather than a verdict about you?'],
  },
  NorthNode: {
    shortFunction: 'Developmental stretch',
    psychologicalFunction: 'The North Node describes an unfamiliar direction of development that asks for practice rather than perfection.',
    healthyExpression: 'Curiosity and repeated experiments build capacity outside the familiar pattern.',
    protectiveOrShadowExpression: 'The stretch can be idealized, forced, or avoided when unfamiliarity is mistaken for failure.',
    relationshipExpression: 'The North Node can show new relational skills that become easier through practice.',
    questionsForReflection: ['What unfamiliar response would be worth practicing in a small way?'],
  },
  SouthNode: {
    shortFunction: 'Familiar capacities',
    psychologicalFunction: 'The South Node describes practiced capacities and default responses that come easily but can be over-relied upon.',
    healthyExpression: 'Familiar skills become a foundation rather than the only available response.',
    protectiveOrShadowExpression: 'Comfort with the known may keep a person repeating an effective old move after the situation has changed.',
    relationshipExpression: 'The South Node can show familiar ways of relating that feel natural and need conscious flexibility.',
    questionsForReflection: ['Which familiar strength helps you, and when does it become the only move you make?'],
  },
  Ascendant: {
    shortFunction: 'Interface with life',
    psychologicalFunction: 'The Ascendant describes the first response, embodied style, and how someone enters situations.',
    healthyExpression: 'The outer approach becomes a responsive tool rather than a fixed performance.',
    protectiveOrShadowExpression: 'The first-response style can take over before deeper needs or intentions are visible.',
    relationshipExpression: 'The Ascendant shapes first impressions, pace, boundaries, and how contact begins.',
    questionsForReflection: ['What do people meet first, and what takes longer for them to discover?'],
  },
  MC: {
    shortFunction: 'Public direction & vocation',
    psychologicalFunction: 'The Midheaven describes public direction, visible contribution, vocation, and the field of reputation.',
    healthyExpression: 'Public effort reflects real priorities and develops through sustained contribution.',
    protectiveOrShadowExpression: 'Visible achievement may become a substitute for private satisfaction or a defense against uncertainty.',
    relationshipExpression: 'The Midheaven can affect how public demands and long-range direction enter close relationships.',
    questionsForReflection: ['What kind of contribution do you want your name associated with over time?'],
  },
};

const SIGN_STYLE: Record<string, string> = {
  Aries: 'direct, fast-moving, and willing to begin before every detail is settled',
  Taurus: 'steady, sensory, deliberate, and oriented toward what can be sustained',
  Gemini: 'curious, verbal, flexible, and inclined to compare several possibilities',
  Cancer: 'protective, responsive to atmosphere, and oriented toward belonging',
  Leo: 'expressive, warm, visible, and motivated by wholehearted participation',
  Virgo: 'discerning, practical, improvement-focused, and attentive to useful detail',
  Libra: 'relational, balancing, socially aware, and attentive to fairness and proportion',
  Scorpio: 'private, concentrated, trust-conscious, and willing to stay with complexity',
  Sagittarius: 'exploratory, candid, meaning-seeking, and oriented toward a wider horizon',
  Capricorn: 'measured, strategic, responsible, and focused on durable results',
  Aquarius: 'independent, systems-aware, future-facing, and willing to question convention',
  Pisces: 'imaginative, receptive, compassionate, and responsive to subtle impressions',
};

const HOUSE_ARENA: Record<number, string> = {
  1: 'identity, embodiment, and first responses', 2: 'values, resources, and self-support',
  3: 'learning, language, siblings, and daily exchange', 4: 'home, roots, privacy, and emotional foundations',
  5: 'creativity, play, enjoyment, and self-expression', 6: 'daily work, routines, practice, and care of the body',
  7: 'one-to-one relationships, agreements, and what is met through others',
  8: 'trust, privacy, shared resources, and difficult-to-name inner material',
  9: 'beliefs, study, perspective, travel, and meaning', 10: 'public direction, responsibility, and visible contribution',
  11: 'friendship, groups, community, and future plans', 12: 'solitude, inner processing, retreat, and what operates outside immediate awareness',
};

const ASPECT_DYNAMICS: Record<string, string> = {
  conjunction: 'The two functions are fused and tend to operate as one system, so it can be hard to use one without activating the other.',
  opposition: 'The functions pull from opposite poles and may alternate or be encountered through other people until a more conscious balance develops.',
  square: 'The functions interrupt one another, creating friction that asks for active problem-solving rather than a winner.',
  trine: 'The functions cooperate easily and reinforce one another, creating a natural capacity that may be taken for granted.',
  sextile: 'The functions can cooperate productively when someone chooses to use the opening and practice the skill.',
  quincunx: 'The functions have mismatched needs and require repeated adjustment because neither can fully operate on the other’s terms.',
  semisextile: 'The functions notice one another indirectly and call for small adjustments. This is a lighter supporting influence, not a headline by itself.',
  semisquare: 'The functions create low-level friction that can become useful once the recurring irritation is named. This carries less weight than a major aspect.',
  sesquisquare: 'The functions create recurring pressure that asks for course correction. This carries less weight than a major aspect.',
};

const TITLE_OBJECT: Partial<Record<PsychologicalBody, string>> = {
  Sun: 'identity', Moon: 'emotional safety', Mercury: 'the mind', Venus: 'bonding', Mars: 'drive',
  Jupiter: 'meaning', Saturn: 'the internal rule-maker', Uranus: 'freedom', Neptune: 'imagination',
  Pluto: 'power and renewal', Chiron: 'sensitivity', NorthNode: 'developmental stretch',
  SouthNode: 'familiar pattern', Ascendant: 'first response', MC: 'public direction',
};

export function getPsychologicalFunction(body: string): PsychologicalFunctionDefinition | null {
  if (body === 'Midheaven') return FUNCTIONS.MC;
  return FUNCTIONS[body as PsychologicalBody] ?? null;
}

export function getSignStyle(sign?: string | null): string {
  return sign ? SIGN_STYLE[sign] ?? `expressed through ${sign}` : 'style not available';
}

export function getHouseArena(house?: number | null): string {
  return house ? HOUSE_ARENA[house] ?? `the ${house}th-house area of life` : 'life arena not available';
}

function stageFunction(body: string, text: string, stage: DevelopmentalStage): string {
  if (stage === 'adult') return text;
  if (body === 'Mars') return text.replace(/desire, assertion, anger, pursuit, drive/g, 'motivation, assertion, anger, pursuit, and drive').replace(/attraction when age-appropriate, /g, '');
  if (body === 'Venus') return text.replace(/relating, attraction, receptivity/g, 'relating, preference, receptivity');
  return text;
}

function functionClause(body: string, stage: DevelopmentalStage): string {
  const f = getPsychologicalFunction(body);
  return f ? stageFunction(body, f.psychologicalFunction, stage) : `${body} is a chart factor with a specific symbolic job.`;
}

function placementClause(body: string, sign?: string | null, house?: number | null): string {
  const bits: string[] = [];
  if (sign) bits.push(`${body} in ${sign} gives this function a ${getSignStyle(sign)} style`);
  if (house) bits.push(`in House ${house}, it is worked out through ${getHouseArena(house)}`);
  return bits.length ? `${bits.join('; ')}.` : '';
}

function reflectionForPair(a: string, b: string, aspect: string): string {
  const pair = [a, b].sort().join('|');
  if (pair === 'Saturn|Venus') return 'Did you learn that love is proven through duty, restraint, reliability, earning approval, or being the responsible one?';
  if (pair === 'Moon|Saturn') return 'When you need support, do internal rules make it easier to ask, or do they tell you to contain the need first?';
  if (pair === 'Jupiter|Mercury') return aspect === 'trine'
    ? 'Where does broad thinking help you explain the larger point, and which details still need checking?'
    : 'When your mind moves quickly toward the big picture, what helps you test the claim before expanding it?';
  const fa = getPsychologicalFunction(a)?.questionsForReflection[0];
  const fb = getPsychologicalFunction(b)?.questionsForReflection[0];
  return fa ?? fb ?? 'Where do you notice these two functions helping or interrupting one another in ordinary life?';
}

export function synthesizePsychologicalAspect(input: PsychologicalAspectContext): PsychologicalAspectSynthesis {
  const stage = input.stage ?? 'adult';
  const fa = getPsychologicalFunction(input.bodyA);
  const fb = getPsychologicalFunction(input.bodyB);
  const aspect = input.aspect.toLowerCase();
  const dynamic = ASPECT_DYNAMICS[aspect] ?? 'The functions are linked, but this minor contact should stay secondary to tighter major aspects.';
  const titleA = TITLE_OBJECT[input.bodyA as PsychologicalBody] ?? input.bodyA.toLowerCase();
  const titleB = TITLE_OBJECT[input.bodyB as PsychologicalBody] ?? input.bodyB.toLowerCase();
  const signContext = [
    placementClause(input.bodyA, input.signA, input.houseA),
    placementClause(input.bodyB, input.signB, input.houseB),
  ].filter(Boolean).join(' ');
  const polarity = aspect === 'opposition' ? 'alternate between the two needs or notice one side first in other people'
    : aspect === 'square' ? 'feel one function interrupt the other at decision points'
    : aspect === 'conjunction' ? 'experience both functions arriving together'
    : aspect === 'trine' ? 'use both functions together with little preparation'
    : aspect === 'sextile' ? 'discover that one function gives the other a useful opening when practiced'
    : 'need to adjust the timing and expectations of each function';
  const authorityNote = input.bodyA === 'Saturn' || input.bodyB === 'Saturn'
    ? ' In some lives this can echo authority, parenting, or internalized rules, but the chart alone cannot identify a person or event.'
    : '';
  const result: PsychologicalAspectSynthesis = {
    title: `${capitalize(titleA)} meets ${titleB}`,
    functionA: functionClause(input.bodyA, stage),
    functionB: functionClause(input.bodyB, stage),
    aspectDynamic: `${dynamic}${authorityNote}`,
    signHouseContext: signContext,
    howThisCanShowUp: [
      `A person may ${polarity}, especially when both functions are needed at once.`,
      `${fa?.shortFunction ?? input.bodyA} and ${fb?.shortFunction ?? input.bodyB} become part of the same recurring decision pattern.`,
    ],
    whenIntegrated: `When integrated, ${titleA} can make room for ${titleB}, and ${titleB} can answer without canceling the first function.`,
    watchFor: `Watch for treating ${titleA} and ${titleB} as an either-or choice. This aspect describes a tendency to work with, not a fixed outcome.`,
    reflectionQuestion: reflectionForPair(input.bodyA, input.bodyB, aspect),
    evidence: `${input.bodyA}${input.signA ? ` in ${input.signA}` : ''}${input.houseA ? `, House ${input.houseA}` : ''} ${aspect} ${input.bodyB}${input.signB ? ` in ${input.signB}` : ''}${input.houseB ? `, House ${input.houseB}` : ''}${typeof input.orb === 'number' ? `, ${input.orb.toFixed(1)}° orb` : ''}.`,
  };
  return sanitizeInterpretiveDeep(result);
}

export function synthesisFromRankedAspect(aspect: RankedAspect, stage: DevelopmentalStage = 'adult'): PsychologicalAspectSynthesis {
  return synthesizePsychologicalAspect({
    bodyA: aspect.a, bodyB: aspect.b, aspect: aspect.aspect, orb: aspect.orb,
    signA: aspect.aSign, signB: aspect.bSign, houseA: aspect.aHouse, houseB: aspect.bHouse, stage,
  });
}

function capitalize(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

export function isPsychologicalBody(body: string): body is PsychologicalBody {
  return Boolean(FUNCTIONS[body as PsychologicalBody]);
}

export const PSYCHOLOGICAL_BODIES = Object.keys(FUNCTIONS) as PsychologicalBody[];
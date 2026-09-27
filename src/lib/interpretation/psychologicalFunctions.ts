import type { RankedAspect, AspectName } from '@/lib/aspectRanking';
import { sanitizeInterpretiveDeep } from '@/lib/interpretation/languagePolicy';
import { pairAspectReading } from '@/lib/readingGuide/aspectPairLibrary';

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

export interface HouseLivedInterpretation {
  focus: string;
  attention: string;
  repeatingPattern: string;
  othersNotice: string;
  question: string;
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
  1: 'self-definition, confidence, appearance, independence, and first reactions',
  2: 'money, possessions, self-worth, stability, and what creates security',
  3: 'learning, speaking, questions, siblings or peers, and everyday mental stimulation',
  4: 'privacy, home, family patterns, emotional roots, and what makes a place feel safe',
  5: 'joy, creativity, romance, play, risk, and being seen for something personal',
  6: 'routines, work habits, usefulness, health habits, standards, and daily maintenance',
  7: 'partnership, compromise, expectations of others, and close one-to-one relationships',
  8: 'trust, vulnerability, shared money, control, privacy, and emotional depth',
  9: 'beliefs, education, travel, big-picture meaning, and changes in worldview',
  10: 'ambition, reputation, responsibility, career direction, and public evaluation',
  11: 'friendship, belonging, groups, community, and future plans',
  12: 'solitude, hidden habits, retreat, private coping, and feelings processed alone',
};

const HOUSE_LIVED: Record<number, HouseLivedInterpretation> = {
  1: {
    focus: 'becoming fully yourself',
    attention: 'how you come across, how much space you take up, and whether your choices feel true to you',
    repeatingPattern: 'choosing between acting independently and adjusting yourself to other people',
    othersNotice: 'your personality, appearance, reactions, or confidence quickly, even when you are not trying to stand out',
    question: 'Who am I when I am not reacting to everyone else?',
  },
  2: {
    focus: 'building a solid sense of worth and security',
    attention: 'money, possessions, practical stability, and what makes you feel capable or valuable',
    repeatingPattern: 'deciding what is worth keeping, spending, earning, or refusing, especially when security and self-respect pull differently',
    othersNotice: 'what you protect, what you invest in, and whether you rely on your own values or outside approval',
    question: 'What helps me feel secure without making my worth depend on what I own or produce?',
  },
  3: {
    focus: 'finding your way of learning and making yourself understood',
    attention: 'questions, words, school or everyday information, siblings or peers, and the details people exchange each day',
    repeatingPattern: 'working out when to speak, listen, ask for clarity, or change your mind after learning something new',
    othersNotice: 'your voice, curiosity, humor, questions, or the speed and style of your thinking',
    question: 'How do I learn best, and what helps other people understand what I mean?',
  },
  4: {
    focus: 'creating a private base that feels emotionally safe',
    attention: 'home, family patterns, privacy, memories, and what helps you settle after being out in the world',
    repeatingPattern: 'deciding what to carry forward from family life and what kind of home or boundaries you need now',
    othersNotice: 'your protective side, your need for privacy, or how strongly the atmosphere at home affects you',
    question: 'What makes a place, a relationship, or a routine feel like home to me?',
  },
  5: {
    focus: 'expressing something personal and enjoying being alive',
    attention: 'creativity, hobbies, romance, play, risk, and moments when you are seen for something that came from you',
    repeatingPattern: 'choosing between safe approval and the risk of showing what you genuinely enjoy, make, or care about',
    othersNotice: 'your humor, creative style, enthusiasm, playfulness, or wish to be appreciated personally',
    question: 'What do I create or enjoy when I am not doing it to earn approval?',
  },
  6: {
    focus: 'making everyday life work well',
    attention: 'routines, work or school habits, usefulness, health habits, skill-building, and the tasks that keep life running',
    repeatingPattern: 'deciding when improvement is helpful and when high standards have turned into overwork or constant correction',
    othersNotice: 'what you reliably handle, what details you catch, and how quickly you step in to fix or organize something',
    question: 'Which routines support me, and which ones keep me busy without making life better?',
  },
  7: {
    focus: 'learning how to share decisions and build fair partnerships',
    attention: 'close relationships, compromise, promises, conflict, and what you expect other people to bring',
    repeatingPattern: 'balancing your own position with another person’s needs without disappearing or expecting them to complete you',
    othersNotice: 'how strongly you respond to one-to-one connection, disagreement, fairness, or another person’s point of view',
    question: 'What do I ask from a partner, and what part of that do I also need to develop in myself?',
  },
  8: {
    focus: 'handling trust, vulnerability, and what is shared',
    attention: 'privacy, emotional exposure, shared money, dependence, control, and what happens when another person has real influence',
    repeatingPattern: 'deciding what to reveal, what to protect, and how to share power or resources without losing your footing',
    othersNotice: 'your seriousness about trust, your privacy, or your ability to stay present when a subject becomes emotionally charged',
    question: 'What helps me share honestly without giving away control of myself?',
  },
  9: {
    focus: 'building a worldview large enough to guide your choices',
    attention: 'beliefs, education, travel, culture, ethics, and ideas that change how you understand the wider world',
    repeatingPattern: 'testing what you were taught against direct experience and deciding which beliefs still deserve your trust',
    othersNotice: 'your convictions, questions about meaning, appetite for learning, or willingness to explore beyond what is familiar',
    question: 'What do I believe because I have examined it, rather than because I inherited it?',
  },
  10: {
    focus: 'deciding what you want to be known and trusted for',
    attention: 'ambition, career direction, reputation, responsibility, achievement, and how your work is evaluated publicly',
    repeatingPattern: 'choosing between outside definitions of success and the responsibilities or goals you genuinely want to claim',
    othersNotice: 'your competence, ambition, reliability, authority, or concern about how your efforts will be judged',
    question: 'What do I want my name to stand for, and whose standard of success am I using?',
  },
  11: {
    focus: 'finding where you belong and what future you want to help create',
    attention: 'friends, groups, community, shared causes, social networks, and plans that reach beyond the present',
    repeatingPattern: 'deciding when to adapt to a group, when to challenge it, and which friendships support the person you are becoming',
    othersNotice: 'the people you connect, the communities you choose, and the hopes or causes that keep pulling your attention forward',
    question: 'Where do I belong without having to edit out an important part of myself?',
  },
  12: {
    focus: 'understanding what you process in private',
    attention: 'solitude, rest, imagination, hidden habits, private fears, and feelings that need time before they can be named',
    repeatingPattern: 'deciding when retreat is restorative and when it has become a way to postpone a feeling, conversation, or practical step',
    othersNotice: 'that you need more private recovery time than they expect, or that some reactions become clear only after you have been alone',
    question: 'What do I do automatically when no one is watching, and does it restore me or keep me stuck?',
  },
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

export function getPsychologicalFunction(body: string): PsychologicalFunctionDefinition | null {
  if (body === 'Midheaven') return FUNCTIONS.MC;
  return FUNCTIONS[body as PsychologicalBody] ?? null;
}

export function getSignStyle(sign?: string | null): string {
  return sign ? SIGN_STYLE[sign] ?? `expressed through ${sign}` : 'style not available';
}

export function getHouseArena(house?: number | null): string {
  return house ? HOUSE_ARENA[house] ?? `House ${house}` : 'House not available';
}

export function getHouseLivedInterpretation(house?: number | null): HouseLivedInterpretation | null {
  return house ? HOUSE_LIVED[house] ?? null : null;
}

export function describeHouseEmphasis(
  house: number,
  majorPlanets: string[],
  options: { stage?: DevelopmentalStage; isStellium?: boolean } = {},
): string {
  const lived = getHouseLivedInterpretation(house);
  if (!lived || majorPlanets.length === 0) return '';
  const stage = options.stage ?? 'adult';
  const subject = stage === 'child' ? 'they' : 'you';
  const possessive = stage === 'child' ? 'their' : 'your';
  const be = stage === 'child' ? 'are' : 'are';
  const count = majorPlanets.length;
  const evidence = `${count} major planet${count === 1 ? '' : 's'} (${majorPlanets.join(', ')}) in ${possessive} ${house}${house === 1 ? 'st' : house === 2 ? 'nd' : house === 3 ? 'rd' : 'th'} house`;
  const weight = options.isStellium
    ? ` Because three or more major planets are gathered here, this is a stellium: several psychological needs keep returning to the same set of real-life concerns, which gives this house extra weight in the chart.`
    : '';
  const text = `With ${evidence}, a noticeable amount of attention may go toward ${lived.focus}. ${subject === 'you' ? 'You' : 'They'} may pay close attention to ${lived.attention}. A repeating choice can involve ${lived.repeatingPattern}. Other people may notice ${lived.othersNotice}. The question this house keeps asking is, “${lived.question}”${weight}`;
  return stageText(text, stage).replace(` ${be} `, ` ${be} `);
}

function stageFunction(body: string, text: string, stage: DevelopmentalStage): string {
  if (stage === 'adult') return text;
  if (body === 'Mars') return text.replace(/desire, assertion, anger, pursuit, drive/g, 'motivation, assertion, anger, pursuit, and drive').replace(/attraction when age-appropriate, /g, '');
  if (body === 'Venus') return text.replace(/relating, attraction, receptivity/g, 'relating, preference, receptivity');
  return text;
}

function stageText(text: string, stage: DevelopmentalStage): string {
  if (stage === 'adult') return text;
  return text
    .replace(/fast intimacy/gi, 'fast closeness')
    .replace(/intimacy/gi, 'closeness')
    .replace(/romantic imagination/gi, 'idealized closeness')
    .replace(/romantic/gi, 'relationship')
    .replace(/love,/gi, 'care,')
    .replace(/dating/gi, 'relationships')
    .replace(/career/gi, 'long-term direction')
    .replace(/professional/gi, 'school or project')
    .replace(/money/gi, 'resources');
}

function functionClause(body: string, stage: DevelopmentalStage): string {
  const f = getPsychologicalFunction(body);
  return f ? stageFunction(body, f.psychologicalFunction, stage) : `${body} is a chart factor with a specific symbolic job.`;
}

function placementClause(body: string, sign?: string | null, house?: number | null): string {
  const bits: string[] = [];
  if (sign) bits.push(`${body} in ${sign} gives this function a ${getSignStyle(sign)} style`);
  if (house) bits.push(`in House ${house}, it affects ${getHouseArena(house)}`);
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

function pairIntegration(bodyA: string, bodyB: string, headline: string): string {
  const a = getPsychologicalFunction(bodyA)?.shortFunction.toLowerCase() ?? bodyA.toLowerCase();
  const b = getPsychologicalFunction(bodyB)?.shortFunction.toLowerCase() ?? bodyB.toLowerCase();
  return `When integrated, ${headline.toLowerCase()}: ${a} can respond to ${b} without either function having to disappear or take over.`;
}

export function synthesizePsychologicalAspect(input: PsychologicalAspectContext): PsychologicalAspectSynthesis {
  const stage = input.stage ?? 'adult';
  const aspect = input.aspect.toLowerCase();
  const pair = pairAspectReading(input.bodyA, input.bodyB, aspect, input.orb ?? 0);
  const dynamic = pair.howItWorks.join(' ')
    || ASPECT_DYNAMICS[aspect]
    || 'The functions are linked, but this minor contact should stay secondary to tighter major aspects.';
  const signContext = [
    placementClause(input.bodyA, input.signA, input.houseA),
    placementClause(input.bodyB, input.signB, input.houseB),
  ].filter(Boolean).join(' ');
  const authorityNote = input.bodyA === 'Saturn' || input.bodyB === 'Saturn'
    ? ' In some lives this can echo authority, parenting, or internalized rules, but the chart alone cannot identify a person or event.'
    : '';
  const result: PsychologicalAspectSynthesis = {
    title: stageText(pair.headline, stage),
    functionA: functionClause(input.bodyA, stage),
    functionB: functionClause(input.bodyB, stage),
    aspectDynamic: `${stageText(dynamic, stage)}${authorityNote}`,
    signHouseContext: signContext,
    howThisCanShowUp: pair.mayShowUp.map(line => stageText(line, stage)),
    whenIntegrated: stageText(pairIntegration(input.bodyA, input.bodyB, pair.headline), stage),
    watchFor: stageText(pair.watchFor, stage),
    reflectionQuestion: ['Jupiter|Mercury', 'Moon|Saturn', 'Saturn|Venus'].includes([input.bodyA, input.bodyB].sort().join('|'))
      ? reflectionForPair(input.bodyA, input.bodyB, aspect)
      : stageText(pair.askThis, stage),
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

export function isPsychologicalBody(body: string): body is PsychologicalBody {
  return Boolean(FUNCTIONS[body as PsychologicalBody]);
}

export const PSYCHOLOGICAL_BODIES = Object.keys(FUNCTIONS) as PsychologicalBody[];
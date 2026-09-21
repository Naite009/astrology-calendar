/**
 * Aspect pair library — "what do I actually say about this contact?"
 *
 * The Reading Guide used to describe an aspect only by its geometry
 * ("these two work as one unit"). A reader already knows that. What they need
 * at the table is the *content* of the pair: what Mars with Mercury sounds
 * like, what Mercury with Jupiter does to the pace of thought, what Saturn
 * opposite the Moon tends to feel like in the early environment.
 *
 * Rules this file inherits:
 *   - nothing here is a verdict. Every line is qualified (can / may / often /
 *     one expression of this), because a chart describes a tendency, not a fact
 *     about someone's life, family, health or history;
 *   - no medical, clinical, abuse or trauma claims. Where a contact is
 *     traditionally read through the early environment, the wording describes
 *     how it is commonly *experienced or remembered*, and always offers the
 *     alternative expressions;
 *   - all output passes through the shared language policy, so forbidden
 *     phrasing cannot re-enter through this surface;
 *   - only the core bodies of this tab appear (10 planets, Ascendant, nodes,
 *     Chiron).
 */

import { sanitizeInterpretiveDeep } from '@/lib/interpretation/languagePolicy';
import { BODY_LABELS } from './factorMeanings';

export type AspectFamily = 'conjunction' | 'flowing' | 'hard';

export interface AspectPairReading {
  /** Alphabetical, canonical key, e.g. "Mercury|Mars". */
  key: string;
  aspect: string;
  family: AspectFamily;
  orb: number;
  /** One line naming the combination in plain words. */
  headline: string;
  /** How the mechanism works — 2-3 lines. */
  howItWorks: string[];
  /** Concrete, recognisable behaviour — 3-4 lines. */
  mayShowUp: string[];
  /** The qualified growth edge / where it can strain. */
  watchFor: string;
  /** What the tightness of the orb does and does not license. */
  strengthNote: string;
  /** A sentence the reader can say out loud. */
  whatToSay: string;
  /** A question to check it against the person's life. */
  askThis: string;
  /** Short misreading guards. */
  doesNotMean: string[];
  /** True when the copy came from the curated table rather than the composer. */
  curated: boolean;
}

export function aspectFamilyOf(aspect: string): AspectFamily {
  const a = aspect.toLowerCase();
  if (a === 'conjunction') return 'conjunction';
  if (a === 'trine' || a === 'sextile') return 'flowing';
  return 'hard';
}

/** Reading order that makes sentences sound natural (Sun first, Chiron last). */
const SPEAK_ORDER = [
  'Sun', 'Moon', 'Ascendant', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'NorthNode', 'SouthNode', 'Chiron',
];

function speakOrder(a: string, b: string): [string, string] {
  const ia = SPEAK_ORDER.indexOf(a);
  const ib = SPEAK_ORDER.indexOf(b);
  return (ia === -1 ? 99 : ia) <= (ib === -1 ? 99 : ib) ? [a, b] : [b, a];
}

export function pairKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

/**
 * How each body behaves, in the words a reader can use. `does` is the job,
 * `style` the verb, `much` what an over-expression looks like, `gift` the asset.
 */
const FN: Record<string, { does: string; style: string; much: string; gift: string; ask: string }> = {
  Sun: {
    does: 'identity and what someone wants to be known for',
    style: 'wanting it to count',
    much: 'taking things personally when the work is criticised',
    gift: 'a clear sense of what matters',
    ask: 'What do you want people to notice about you?',
  },
  Moon: {
    does: 'emotional needs and what settles someone',
    style: 'reacting first, explaining later',
    much: 'needing more reassurance than gets asked for',
    gift: 'quick, accurate emotional reading of a room',
    ask: 'What settles you fastest when something goes wrong?',
  },
  Ascendant: {
    does: 'the way someone enters a room and gets read by strangers',
    style: 'leading with a particular front',
    much: 'being taken as the manner rather than the person',
    gift: 'a recognisable, usable first impression',
    ask: 'What do people assume about you before they know you?',
  },
  Mercury: {
    does: 'thinking, wording, and how information gets handled',
    style: 'processing it into language',
    much: 'talking past the point, or rehearsing a conversation in advance',
    gift: 'the ability to name what is happening',
    ask: 'How do you like to work something out — out loud, on paper, or in your head first?',
  },
  Venus: {
    does: 'taste, affection, and what feels pleasant or fair',
    style: 'smoothing it and keeping it agreeable',
    much: 'keeping the peace past the point where it helps',
    gift: 'making situations and people comfortable',
    ask: 'What makes something feel worth keeping to you?',
  },
  Mars: {
    does: 'drive, effort, irritation, and how action starts',
    style: 'pushing at it directly',
    much: 'going in hot, or going in before the picture is complete',
    gift: 'starting things other people only discuss',
    ask: 'What does your irritation usually look like from the outside?',
  },
  Jupiter: {
    does: 'expansion, confidence, and how big a thing gets made',
    style: 'widening it',
    much: 'taking on more than the calendar holds',
    gift: 'a sense of possibility that keeps things moving',
    ask: 'What do you tend to say yes to too quickly?',
  },
  Saturn: {
    does: 'limits, structure, patience, and where skill is earned slowly',
    style: 'checking it before committing',
    much: 'holding a standard nobody set but you',
    gift: 'reliability, and work that survives inspection',
    ask: 'Where do you hold yourself to a standard nobody asked for?',
  },
  Uranus: {
    does: 'the pull toward a different approach, and low tolerance for pointless rules',
    style: 'breaking the pattern',
    much: 'changing the plan just to feel unboxed',
    gift: 'seeing the option nobody else raised',
    ask: 'What arrangement do you refuse to accept just because it is standard?',
  },
  Neptune: {
    does: 'imagination, sensitivity, and where edges blur',
    style: 'absorbing the atmosphere',
    much: 'filling a gap with a hoped-for version of it',
    gift: 'an unusual amount of feel for tone and mood',
    ask: 'Where do you tend to give people the benefit of the doubt?',
  },
  Pluto: {
    does: 'depth, intensity, and what gets taken seriously all the way down',
    style: 'going all in or staying out',
    much: 'holding on well past the point of usefulness',
    gift: 'staying with something long after other people quit',
    ask: 'What do you get properly serious about?',
  },
  NorthNode: {
    does: 'the less-practised side worth stretching into',
    style: 'stretching past the comfortable range',
    much: 'forcing growth on a schedule',
    gift: 'genuine development when it is chosen, not pushed',
    ask: 'What feels slightly outside your usual range but worth trying?',
  },
  SouthNode: {
    does: 'the already well-practised habits kept in reserve',
    style: 'returning to what already works',
    much: 'using the old competence when a new one is called for',
    gift: 'a reliable fallback skill',
    ask: 'What comes so easily to you that you forget it is a skill?',
  },
  Chiron: {
    does: 'an area of sensitivity that tends to turn into understanding',
    style: 'feeling it more than most people would',
    much: 'assuming the sore spot is a flaw rather than a sensitivity',
    gift: 'unusual patience with other people in the same spot',
    ask: 'Where are you gentler with other people than with yourself?',
  },
};

type Fam = {
  headline: string;
  how: [string, string];
  show: string[];
  care: string;
  say?: string;
};

interface PairEntry { c: Fam; f: Fam; h: Fam }

/**
 * Curated pairs. Keys are alphabetical (`pairKey`). `c` conjunction,
 * `f` trine/sextile, `h` square/opposition.
 */
const PAIRS: Record<string, PairEntry> = {
  // ── Sun ───────────────────────────────────────────────────────────────
  'Moon|Sun': {
    c: {
      headline: 'What they want and what they need point the same way',
      how: [
        'Identity and emotional need are not in separate departments here, so a decision usually feels right or wrong before it is argued.',
        'That makes motivation simple and consistent, and it makes disagreement feel more personal than it is meant to.',
      ],
      show: [
        'Little distance between the mood and the plan — if the mood is off, the work slows.',
        'A strong "this is just who I am" quality, sometimes stated earlier in a conversation than needed.',
        'Less internal debate than most people carry about what they want.',
      ],
      care: 'With few internal counterweights, an unchecked preference can go unquestioned; one useful habit is to ask someone else to stress-test a decision.',
    },
    f: {
      headline: 'Feelings and intentions cooperate',
      how: [
        'What settles them and what drives them tend to agree, so confidence recovers fairly quickly after a setback.',
        'This is quiet support rather than a headline: it often only shows when it is missing in someone else.',
      ],
      show: [
        'Comfortable self-description without much defensiveness.',
        'Recovery after a bad day that does not require a full rebuild.',
        'Preferences that are easy for them to state plainly.',
      ],
      care: 'Ease can go unused — this contact rewards deliberate effort more than it looks like it needs any.',
    },
    h: {
      headline: 'What they want and what they need are not the same request',
      how: [
        'One side wants to push forward, the other wants to feel secure first, and they arrive at different answers to the same question.',
        'The result is often an inner negotiation: ambition versus comfort, doing versus resting, being seen versus being safe.',
      ],
      show: [
        'Starting something confidently and then wanting reassurance about it.',
        'Feeling pulled between what is expected of them and what they actually need that week.',
        'Different reported versions of themselves at work and at home.',
      ],
      care: 'Under strain this can read as inconsistency to other people; naming both needs out loud usually costs less than choosing one.',
    },
  },
  'Mercury|Sun': {
    c: {
      headline: 'Identity runs through the way they explain things',
      how: [
        'Thinking and self are close together, so how well they put something into words affects how competent they feel.',
        'That tends to make conversation the main way they work out what they actually think.',
      ],
      show: [
        'Talking or writing themselves into clarity rather than arriving with it.',
        'Taking a correction of their wording more personally than a correction of their work.',
        'Strong interest in being understood accurately, not just agreed with.',
      ],
      care: 'The pull to be articulate can crowd out sitting with an unresolved feeling; silence is worth practising deliberately.',
    },
    f: {
      headline: 'Words and intentions line up without much effort',
      how: [
        'What they mean and what they say tend to match, which makes them easy to follow.',
        'Learning about something they care about is usually enjoyable rather than uphill.',
      ],
      show: [
        'Explaining their own reasoning clearly when asked.',
        'Picking up a subject quickly when it connects to something they already value.',
        'Fewer misunderstandings about what they intended.',
      ],
      care: 'Fluency can substitute for depth; the useful question is whether they have tested the idea, not just phrased it well.',
    },
    h: {
      headline: 'What they mean and how it lands do not always match',
      how: [
        'The intent and the wording pull at slightly different angles, so a straightforward statement can come out sharper, vaguer or more clever than intended.',
        'This often produces careful rehearsal before important conversations.',
      ],
      show: [
        'Being told they sounded blunt or distant when they felt neutral.',
        'Editing a message several times before sending it.',
        'Clearer in writing than in the moment, or the reverse.',
      ],
      care: 'One workable habit is checking how something landed rather than assuming it was received as meant.',
    },
  },
  'Sun|Venus': {
    c: {
      headline: 'Being liked and being themselves are closely tied',
      how: [
        'Identity and the sense of what is pleasant sit together, so approval carries more weight than they may admit.',
        'It usually gives an easy social front and a real interest in keeping things agreeable.',
      ],
      show: [
        'Noticeable care about presentation, tone and atmosphere.',
        'Reluctance to be the one who makes a room uncomfortable.',
        'Genuine warmth that opens doors early in a relationship.',
      ],
      care: 'The cost of being liked can be an unspoken preference; a small, direct request now prevents a large one later.',
    },
    f: {
      headline: 'Warmth supports who they are',
      how: [
        'Affection and identity reinforce each other, so being appreciated steadies them rather than distracting them.',
        'This tends to make relationships a source of energy instead of a drain.',
      ],
      show: [
        'Easy generosity with praise and attention.',
        'Taste that other people notice and borrow.',
        'Conflicts that cool down rather than escalate.',
      ],
      care: 'Ease with people can make hard conversations easier to postpone than to hold.',
    },
    h: {
      headline: 'Being true to themselves and keeping the peace ask for different things',
      how: [
        'One side wants recognition on its own terms, the other wants harmony, and they do not always agree on what to say next.',
        'The tension often shows up around worth: what they are willing to ask for, and what they settle for.',
      ],
      show: [
        'Agreeing in the moment and resenting it afterwards.',
        'Uncertainty about whether they are valued for themselves or for being easy.',
        'Fluctuating confidence about appearance, taste or likeability.',
      ],
      care: 'The growth edge is stating a preference early, while it is still small enough to be heard as information.',
    },
  },
  'Mars|Sun': {
    c: {
      headline: 'Who they are and how hard they push are the same gesture',
      how: [
        'Identity and drive fire together, so effort is immediate and identity gets defended physically rather than diplomatically.',
        'It is a real engine: competitive, direct, and quick to move.',
      ],
      show: [
        'Getting started before the discussion is finished.',
        'Visible frustration when something is slow or blocked.',
        'Strong response to a challenge, sometimes stronger than the challenge warranted.',
      ],
      care: 'With little built-in pause, the useful discipline is delay rather than restraint: a decided reaction sent later usually lands better.',
    },
    f: {
      headline: 'Drive works with identity instead of against it',
      how: [
        'Effort tends to go where it is actually wanted, which makes them productive without much internal argument.',
        'Anger, when it appears, usually arrives in proportion and leaves again.',
      ],
      show: [
        'Sustained follow-through on things they chose themselves.',
        'Physical activity that genuinely resets their mood.',
        'Confidence that shows up as doing rather than declaring.',
      ],
      care: 'An engine this cooperative can get pointed at whatever is nearest; choosing the target matters more here than raising the effort.',
    },
    h: {
      headline: 'Effort and identity rub against each other',
      how: [
        'Wanting something and going after it are slightly out of phase, so drive can arrive late, hot, or against the wrong target.',
        'A lot of the friction is about permission: whether pushing for what they want is allowed.',
      ],
      show: [
        'Holding irritation in and releasing it at the wrong moment.',
        'Starting strongly, then questioning whether it was worth it.',
        'Reading a neutral comment as a challenge to be answered.',
      ],
      care: 'Regular, deliberate physical outlet usually does more for this contact than any amount of self-talk.',
    },
  },
  'Jupiter|Sun': {
    c: {
      headline: 'Identity comes with a big setting',
      how: [
        'Self and expansion combine, so plans arrive already scaled up and confidence is easy to find.',
        'It gives genuine generosity and an appetite for more than the current situation.',
      ],
      show: [
        'Making a plan larger while describing it.',
        'Optimism that carries other people along.',
        'Restlessness with anything that feels small or capped.',
      ],
      care: 'Enthusiasm outruns logistics sometimes; the fix is usually a calendar, not less ambition.',
    },
    f: {
      headline: 'Confidence is available when needed',
      how: [
        'Opportunity and identity support each other, so doors tend to open through being known rather than through pressure.',
        'Setbacks do not usually dent the underlying belief that something can be worked out.',
      ],
      show: [
        'Recovering quickly from a no.',
        'People offering them chances unprompted.',
        'A natural teaching or encouraging role with others.',
      ],
      care: 'Easy confidence can skip preparation; this contact is better used deliberately than relied on.',
    },
    h: {
      headline: 'Ambition and realistic scale disagree',
      how: [
        'The pull to go bigger and the sense of what they can actually carry arrive at different numbers.',
        'It often swings: overcommitting, then pulling back further than necessary.',
      ],
      show: [
        'Saying yes quickly and renegotiating later.',
        'Periods of real expansion followed by a hard correction.',
        'Difficulty telling a genuine opportunity from a flattering one.',
      ],
      care: 'One practical habit is to sleep on anything with a number attached to it.',
    },
  },
  'Saturn|Sun': {
    c: {
      headline: 'Identity is built rather than assumed',
      how: [
        'Self and limit sit together, so confidence tends to be earned through demonstrated competence rather than felt in advance.',
        'That usually produces someone serious, dependable, and harder on themselves than on anyone else.',
      ],
      show: [
        'Waiting until they are sure before claiming something.',
        'Taking responsibility early, sometimes earlier than was fair.',
        'Discomfort with praise that has not been backed up by results.',
      ],
      care: 'The standard is often self-issued; checking whether anyone actually set it is usually the first useful move. Confidence tends to build with age and evidence.',
    },
    f: {
      headline: 'Structure supports who they are',
      how: [
        'Patience and identity work together: they can stay with something long enough for it to become real skill.',
        'Authority tends to sit comfortably, both accepting it and holding it.',
      ],
      show: [
        'Finishing what they start, even slowly.',
        'Being the one others rely on for the unglamorous part.',
        'Quiet, evidence-based confidence rather than display.',
      ],
      care: 'Reliability can turn into being the default carrier of everything; the limit has to be set by them.',
    },
    h: {
      headline: 'What they want and what feels permitted pull apart',
      how: [
        'Identity meets restriction, so self-expression often comes with a delay, a check, or a critical voice attached.',
        'Many people with this contact describe an early environment they remember as demanding, cautious or rule-heavy — though that is how it was experienced, not a statement about anyone involved.',
      ],
      show: [
        'Holding back until it is certain, then feeling late.',
        'Working hard for recognition and deflecting it when it arrives.',
        'A persistent sense of not being quite finished yet.',
      ],
      care: 'This is one of the contacts that reliably improves with time and evidence; the practical version is to count what has actually been done instead of measuring against the standard.',
    },
  },
  'Sun|Uranus': {
    c: {
      headline: 'Being themselves means being the different one',
      how: [
        'Identity fuses with the pull away from the standard version, so belonging by conforming rarely feels like belonging.',
        'It gives originality and a low tolerance for rules with no reason behind them.',
      ],
      show: [
        'Choosing the unconventional route even when the usual one would work.',
        'Discomfort with being grouped or labelled.',
        'Sudden changes of direction that make sense internally first.',
      ],
      care: 'Difference can become the point rather than the byproduct; the useful question is whether the change is wanted or just unboxing.',
    },
    f: {
      headline: 'Originality is available without much cost',
      how: [
        'Independence and identity cooperate, so being unusual does not have to be fought for.',
        'They can usually see the option nobody else raised and still stay in the room.',
      ],
      show: [
        'Comfortable in mixed or unconventional groups.',
        'Practical inventiveness rather than contrarianism.',
        'Freedom arranged rather than demanded.',
      ],
      care: 'Ease here is easy to waste; it works best when applied to something specific.',
    },
    h: {
      headline: 'Wanting to belong and wanting to break the pattern collide',
      how: [
        'Identity and disruption argue, so stability can feel confining and freedom can feel unmoored.',
        'It often shows as abrupt changes when a situation has quietly become too fixed.',
      ],
      show: [
        'Leaving something suddenly that looked settled from outside.',
        'Resisting structure, then missing it.',
        'Being described as unpredictable more often than they feel unpredictable.',
      ],
      care: 'Building deliberate room for change usually reduces the need for sudden change.',
    },
  },
  'Neptune|Sun': {
    c: {
      headline: 'Identity has soft edges',
      how: [
        'Self and sensitivity blend, so the sense of who they are can shift with the company and atmosphere.',
        'It gives real imaginative and emotional range, and makes a firm self-description harder.',
      ],
      show: [
        'Taking on the tone of whoever is in the room.',
        'Strong creative or spiritual pull.',
        'Difficulty answering "what do you want" directly.',
      ],
      care: 'Facts and feedback are more useful here than introspection; a second opinion is worth asking for before big commitments.',
    },
    f: {
      headline: 'Imagination supports identity',
      how: [
        'Sensitivity and self cooperate, so compassion and creativity come without losing the thread of who they are.',
        'They usually read atmosphere accurately and can use it.',
      ],
      show: [
        'Creative work that feels like an extension of them.',
        'Being trusted with things other people do not say out loud.',
        'Comfort with ambiguity that others find unsettling.',
      ],
      care: 'The generous reading of other people is a strength that benefits from occasional checking.',
    },
    h: {
      headline: 'Who they are and who they imagine being are not the same person',
      how: [
        'Identity meets blur, so self-image can run ahead of, or behind, the actual situation.',
        'Confidence may depend heavily on the mood or the company rather than the record.',
      ],
      show: [
        'Periods of uncertainty about direction that lift for no clear reason.',
        'Giving people the benefit of the doubt past the evidence.',
        'Difficulty separating their feeling about a plan from the plan.',
      ],
      care: 'Written, checkable facts steady this contact more than reflection does.',
    },
  },
  'Pluto|Sun': {
    c: {
      headline: 'Identity at full strength',
      how: [
        'Self and intensity combine, so there is little half-measure available: they are in or they are elsewhere.',
        'It gives real staying power and considerable personal weight in a room.',
      ],
      show: [
        'Privacy about what actually matters to them.',
        'Noticeable presence even when quiet.',
        'Recurring periods of deliberate self-reinvention.',
      ],
      care: 'Under strain this can show up as holding on too tightly or turning a disagreement into a contest of wills; loosening the grip is the practice.',
    },
    f: {
      headline: 'Depth is usable rather than heavy',
      how: [
        'Intensity supports identity, so they can commit hard without it costing them their footing.',
        'Change, when it comes, tends to be chosen rather than forced.',
      ],
      show: [
        'Sticking with something long after others left.',
        'Trusted with serious things by people who barely know them.',
        'Comfortable with subjects other people avoid.',
      ],
      care: 'Depth can make ordinary situations feel not worth the effort; range matters here.',
    },
    h: {
      headline: 'Identity and intensity press on each other',
      how: [
        'What they want and how completely they want it are at odds, which can make ordinary situations feel high-stakes.',
        'Control tends to be the theme: over themselves, the situation, or the outcome.',
      ],
      show: [
        'All-or-nothing decisions about things that could be partial.',
        'Strong reaction to being managed or overruled.',
        'Repeated cycles of ending and rebuilding.',
      ],
      care: 'Practising a deliberately small, low-stakes version of something is usually more useful than another full commitment.',
    },
  },
  'Chiron|Sun': {
    c: {
      headline: 'Identity is a sensitive area',
      how: [
        'Self and sensitivity sit together, so being seen or assessed registers more strongly than it does for most people.',
        'That often becomes unusual patience with other people who are unsure of themselves.',
      ],
      show: [
        'Downplaying their own competence.',
        'Noticing immediately when someone else feels out of place.',
        'Confidence that varies more with context than with ability.',
      ],
      care: 'No specific event is implied by this placement — read it as a tender spot, not a history.',
    },
    f: {
      headline: 'Sensitivity works alongside identity',
      how: [
        'The tender spot and the sense of self cooperate, so understanding gets extended outward without much cost.',
        'They tend to be steady company for people who are struggling.',
      ],
      show: [
        'Naturally reassuring to others in their own weak area.',
        'Comfortable admitting they are still learning.',
        'Mentoring appearing without being sought.',
      ],
      care: 'Being useful to others is easier than accepting the same care back.',
    },
    h: {
      headline: 'Being visible and feeling exposed overlap',
      how: [
        'Identity meets sensitivity at an angle, so recognition and self-doubt can arrive together.',
        'The pattern often improves markedly once the skill is demonstrated rather than promised.',
      ],
      show: [
        'Avoiding situations where they might be assessed.',
        'Over-preparing before being seen.',
        'Discounting genuine praise.',
      ],
      care: 'This describes sensitivity, not damage, and no specific event should be inferred from it.',
    },
  },
  'Ascendant|Sun': {
    c: {
      headline: 'What you see is roughly what is there',
      how: [
        'The front and the self are close together, so first impressions tend to be accurate.',
        'It usually gives noticeable presence on arrival, wanted or not.',
      ],
      show: [
        'Being remembered from brief meetings.',
        'Little gap between the public and private version.',
        'Difficulty being in a room unnoticed.',
      ],
      care: 'Being visible by default means privacy has to be arranged on purpose.',
    },
    f: {
      headline: 'Manner and identity agree',
      how: [
        'How they come across supports who they are, so less energy goes into managing impressions.',
        'People usually describe them roughly as they would describe themselves.',
      ],
      show: [
        'Comfortable in introductions.',
        'Consistent reports of them from different groups.',
        'Confidence that reads as ease rather than display.',
      ],
      care: 'Easy presentation can mean the deeper material never gets mentioned.',
    },
    h: {
      headline: 'The manner and the person are read differently',
      how: [
        'The front and the self are not aligned, so first impressions often need correcting later.',
        'It can produce a persistent sense of being misread.',
      ],
      show: [
        'Being called confident when they feel unsure, or the reverse.',
        'Warming up slowly with new people.',
        'Deeper qualities noticed only by people who stay.',
      ],
      care: 'Naming the mismatch early — "I know I come across as X" — saves a lot of repair work.',
    },
  },

  // ── Moon ──────────────────────────────────────────────────────────────
  'Mercury|Moon': {
    c: {
      headline: 'Feelings and words arrive together',
      how: [
        'Emotion and language are linked, so talking is how the feeling gets processed rather than how it gets reported afterwards.',
        'It gives a strong memory for conversations and for how things were said.',
      ],
      show: [
        'Needing to talk it through before it settles.',
        'Recalling the exact wording of an old conversation.',
        'Mood audible in the voice before it is stated.',
      ],
      care: 'Thinking and feeling can be hard to separate; writing it down is often the cleanest way to tell which is which.',
    },
    f: {
      headline: 'They can say what they feel',
      how: [
        'Emotion and wording cooperate, so internal states get described rather than acted out.',
        'That makes them easy to support and usually good at supporting others.',
      ],
      show: [
        'Naming a feeling accurately in the moment.',
        'Comfortable conversation about difficult subjects.',
        'Listening that people come back for.',
      ],
      care: 'Talking about a feeling can quietly replace doing something about it.',
    },
    h: {
      headline: 'What they feel and what they can explain do not match',
      how: [
        'Emotion and language pull at different angles, so the feeling is often clear and the wording is not.',
        'This can produce either flooding — too many words — or going quiet under pressure.',
      ],
      show: [
        'Knowing something is wrong and not being able to say what.',
        'Over-explaining, then feeling misunderstood anyway.',
        'Replaying conversations afterwards to find the right sentence.',
      ],
      care: 'Time helps more than pressure here: the accurate sentence usually arrives later, and asking for that time is reasonable.',
    },
  },
  'Moon|Venus': {
    c: {
      headline: 'Comfort and affection are the same need',
      how: [
        'Emotional need and the sense of what is pleasant combine, so being cared for and being comfortable are hard to separate.',
        'It tends to give real warmth and a good instinct for making a space feel good.',
      ],
      show: [
        'Noticeable care about atmosphere, food, home, texture.',
        'Soothing themselves through comfort rather than analysis.',
        'Discomfort in tense rooms, sometimes leaving them.',
      ],
      care: 'Keeping things pleasant can delay a necessary conversation past the useful point.',
    },
    f: {
      headline: 'Warmth is easy to give and receive',
      how: [
        'Affection and emotional need support each other, so relationships tend to feel replenishing.',
        'Kindness shows up as a habit rather than an effort.',
      ],
      show: [
        'People relax quickly around them.',
        'Generous without keeping score.',
        'Conflict that de-escalates naturally.',
      ],
      care: 'Ease with people can make direct requests feel unnecessary until they are overdue.',
    },
    h: {
      headline: 'What they need and what keeps things nice conflict',
      how: [
        'Emotional need and the pull toward harmony ask for different things, so the need often goes unspoken.',
        'Worth can become the theme: accepting less to stay comfortable.',
      ],
      show: [
        'Agreeing outwardly while feeling unmet.',
        'Seeking comfort in things rather than in conversation.',
        'Fluctuating sense of being valued.',
      ],
      care: 'Asking early, in small words, is the practice — the request gets harder the longer it waits.',
    },
  },
  'Mars|Moon': {
    c: {
      headline: 'Feeling and reaction fire at the same time',
      how: [
        'Emotional need and drive combine, so a feeling becomes an action or a sharp word before it has been examined.',
        'It gives genuine protectiveness and fast, decisive response when something matters.',
      ],
      show: [
        'Quick temper that clears quickly.',
        'Defending people they care about immediately.',
        'Restlessness when upset — moving rather than sitting with it.',
      ],
      care: 'The gap between feeling and response is short by design; building in a deliberate pause does more here than trying to feel less.',
    },
    f: {
      headline: 'Feelings get acted on usefully',
      how: [
        'Emotion and effort cooperate, so caring about something turns into doing something about it.',
        'Anger tends to be proportionate and briefly held.',
      ],
      show: [
        'Practical help offered rather than discussed.',
        'Physical activity that genuinely resets the mood.',
        'Clear, direct statements of what they want.',
      ],
      care: 'Action can be used to avoid stillness; not every feeling needs a task attached.',
    },
    h: {
      headline: 'The need and the reaction get in each other’s way',
      how: [
        'Emotional need and drive pull against each other, so irritation and vulnerability can arrive in the same breath.',
        'It often shows as reacting too fast, or holding it in and releasing it later at the wrong target.',
      ],
      show: [
        'Snapping, then feeling disproportionate about it.',
        'Difficulty being upset and calm in the same conversation.',
        'Frustration when their needs are not guessed correctly.',
      ],
      care: 'Naming the feeling before responding to it is the whole practice here, and it is a learnable one.',
    },
  },
  'Jupiter|Moon': {
    c: {
      headline: 'Feelings come at a generous scale',
      how: [
        'Emotional need and expansion combine, so moods, generosity and appetite all run large.',
        'It usually gives real warmth and a comforting, hopeful presence.',
      ],
      show: [
        'Caring for others openly and at volume.',
        'Optimism that recovers a bad day quickly.',
        'Comfort sought in abundance — more, bigger, fuller.',
      ],
      care: 'A generous emotional setting can absorb other people’s needs past capacity; limits are the discipline.',
    },
    f: {
      headline: 'Emotional recovery comes easily',
      how: [
        'Comfort and optimism support each other, so setbacks do not usually take hold.',
        'It gives a steady baseline that other people borrow.',
      ],
      show: [
        'Bouncing back faster than expected.',
        'Being the reassuring one in a group.',
        'Trust extended easily and usually well.',
      ],
      care: 'Ease can mean difficult feelings are moved past rather than finished.',
    },
    h: {
      headline: 'Emotional need and the wish for more do not agree',
      how: [
        'Comfort and expansion ask for different things, so reassurance can be sought in quantity rather than in the specific thing needed.',
        'It often swings between overextending emotionally and withdrawing.',
      ],
      show: [
        'Promising more support than the week holds.',
        'Feeling restless in situations that are actually fine.',
        'Comfort through excess, then a correction.',
      ],
      care: 'Asking what is actually needed — usually something small and specific — beats scaling the response up.',
    },
  },
  'Moon|Saturn': {
    c: {
      headline: 'Feelings get managed before they get expressed',
      how: [
        'Emotional need and restraint sit together, so the first instinct with a feeling is to contain it and check it.',
        'It produces real emotional reliability: they are steady in situations that unsettle other people.',
      ],
      show: [
        'Handling something serious calmly and processing it later.',
        'Reluctance to ask for support until it is unavoidable.',
        'Comfort found in routine, order and knowing what happens next.',
      ],
      care: 'Many people with this contact describe an early environment they remember as reserved, busy or rule-heavy. That is how it was experienced, not a verdict on anyone involved, and it usually eases as they build relationships where asking is allowed.',
    },
    f: {
      headline: 'Feelings have a structure to sit in',
      how: [
        'Emotional need and patience cooperate, so they can hold a feeling without being run by it.',
        'This is quiet competence rather than a headline — the kind others rely on.',
      ],
      show: [
        'Dependable in a crisis without going cold.',
        'Routines that genuinely settle them.',
        'Loyalty over long periods.',
      ],
      care: 'Being the steady one can become the only permitted role; it helps to be unsteady somewhere safe.',
    },
    h: {
      headline: 'Needing something and feeling allowed to need it pull apart',
      how: [
        'Emotional need meets restriction, so support can feel like something to be earned rather than requested.',
        'People with this contact often report an early climate they remember as demanding, cautious or short on comfort — a remembered experience, not a statement about anyone specific.',
      ],
      show: [
        'Going quiet exactly when support would help.',
        'Assuming they are too much before anyone said so.',
        'Feeling responsible for other people’s moods.',
      ],
      care: 'This is one of the contacts that reliably softens with time and with relationships where needs get met without a cost attached.',
    },
  },
  'Moon|Uranus': {
    c: {
      headline: 'Feelings move in sudden shifts',
      how: [
        'Emotional need and the pull toward change combine, so moods can turn quickly and closeness needs room in it.',
        'It gives originality and an unusual tolerance for other people’s differences.',
      ],
      show: [
        'Needing space without it meaning distance.',
        'Mood changes that surprise others more than them.',
        'Unconventional living or family arrangements suiting them.',
      ],
      care: 'Freedom and closeness are both needs here; arranging both beats choosing one.',
    },
    f: {
      headline: 'Emotional independence works for them',
      how: [
        'Need and independence cooperate, so they can be close without feeling contained.',
        'Change is usually interesting rather than destabilising.',
      ],
      show: [
        'Adapting quickly when plans change.',
        'Comfortable in unusual groups.',
        'Friendships kept across distance.',
      ],
      care: 'Ease with distance can let closeness go untended.',
    },
    h: {
      headline: 'The need for security and the need for freedom collide',
      how: [
        'Comfort and disruption argue, so settled situations can start to feel restrictive and open ones unsafe.',
        'It often shows as abrupt exits from things that looked stable.',
      ],
      show: [
        'Pulling away when a relationship gets closer.',
        'Restlessness at home rather than outside it.',
        'Mood turning sharply when they feel managed.',
      ],
      care: 'Building planned variety into ordinary life reduces the need for sudden change.',
    },
  },
  'Moon|Neptune': {
    c: {
      headline: 'Feelings absorb the whole room',
      how: [
        'Emotional need and sensitivity blend, so other people’s moods arrive as if they were their own.',
        'It gives real compassion and strong imaginative and creative range.',
      ],
      show: [
        'Coming home tired from other people’s feelings.',
        'Strong response to music, film, atmosphere.',
        'Difficulty telling their feeling from someone else’s.',
      ],
      care: 'Sorting what is theirs from what they picked up is the main practice; time alone is a requirement, not a luxury.',
    },
    f: {
      headline: 'Sensitivity is an asset here',
      how: [
        'Emotional need and imagination cooperate, so empathy comes without losing their own footing.',
        'They tend to read a situation accurately before it is explained.',
      ],
      show: [
        'Knowing something is off before it is said.',
        'Creative work that comes easily.',
        'Being sought out by people who need understanding.',
      ],
      care: 'A generous reading of people is worth pairing with evidence.',
    },
    h: {
      headline: 'What they feel and what is actually happening get mixed',
      how: [
        'Emotional need meets blur, so hope and perception can overlap in a way that is hard to separate.',
        'Disappointment tends to follow a version of the situation rather than the situation.',
      ],
      show: [
        'Filling gaps with a hoped-for explanation.',
        'Absorbing other people’s states without noticing.',
        'Moods with no traceable cause.',
      ],
      care: 'Checking the facts out loud with someone steady does more here than further reflection.',
    },
  },
  'Moon|Pluto': {
    c: {
      headline: 'Feelings run deep and stay private',
      how: [
        'Emotional need and intensity combine, so nothing registers lightly and little of it gets shown early.',
        'It gives enormous emotional stamina and real loyalty.',
      ],
      show: [
        'Strong reactions kept entirely internal.',
        'All-in attachment once trust is given.',
        'Noticing undercurrents other people miss.',
      ],
      care: 'Under strain this can become holding on too tightly; letting something be temporary is the practice.',
    },
    f: {
      headline: 'Emotional depth is usable',
      how: [
        'Need and intensity cooperate, so they can go deep without being submerged.',
        'It makes them steady with material other people find heavy.',
      ],
      show: [
        'Trusted with serious confidences.',
        'Recovering from real difficulty without hardening.',
        'Long, durable attachments.',
      ],
      care: 'Depth can make lighter company feel not worth the effort.',
    },
    h: {
      headline: 'Needing safety and needing total depth press on each other',
      how: [
        'Comfort and intensity pull against each other, so closeness can feel both necessary and risky.',
        'The theme is often control: of the feeling, the situation, or how much is revealed.',
      ],
      show: [
        'Testing people before trusting them.',
        'Strong reaction to feeling managed or left out.',
        'Cycles of closeness and withdrawal.',
      ],
      care: 'Saying a small true thing early, rather than everything later, is the workable version.',
    },
  },
  'Chiron|Moon': {
    c: {
      headline: 'Emotional needs are a sensitive area',
      how: [
        'Need and sensitivity sit together, so needing something can itself feel uncomfortable.',
        'It usually becomes real gentleness with other people who need something.',
      ],
      show: [
        'Downplaying their own needs automatically.',
        'Noticing immediately when someone else is unsettled.',
        'Caring for others more easily than being cared for.',
      ],
      care: 'This describes sensitivity, not history; no specific event should be read into it.',
    },
    f: {
      headline: 'Sensitivity turns into care',
      how: [
        'The tender area and emotional need cooperate, so understanding is extended without much strain.',
        'They are often the one people go to.',
      ],
      show: [
        'Comforting others well in exactly their own sore spot.',
        'Comfortable naming vulnerability.',
        'Steady support over time.',
      ],
      care: 'The care given out is worth accepting back occasionally.',
    },
    h: {
      headline: 'Being cared for and feeling exposed overlap',
      how: [
        'Emotional need meets sensitivity at an angle, so accepting support can feel like admitting a deficiency.',
        'The pattern generally eases in relationships where asking is uneventful.',
      ],
      show: [
        'Managing alone by default.',
        'Deflecting comfort with humour or logistics.',
        'Noticing a slight where none was intended.',
      ],
      care: 'No event is implied by this contact — read sensitivity, not a conclusion about anyone’s health or past.',
    },
  },

  // ── Mercury ───────────────────────────────────────────────────────────
  'Mercury|Venus': {
    c: {
      headline: 'Words are chosen to please',
      how: [
        'Thinking and taste combine, so language comes out smooth, tactful and often charming.',
        'It gives a good ear for tone and an instinct for how a sentence will land.',
      ],
      show: [
        'Softening a message while sending it.',
        'Enjoying words for their sound as much as their content.',
        'Skill at defusing a tense conversation.',
      ],
      care: 'Diplomacy can blur the actual message; the direct version is worth saying at least once.',
    },
    f: {
      headline: 'Pleasant, easy communication',
      how: [
        'Thinking and affection cooperate, so difficult things can be said kindly.',
        'Negotiation and mediation come naturally.',
      ],
      show: [
        'People finding them easy to talk to.',
        'Clear, warm writing.',
        'Compliments that sound sincere because they are specific.',
      ],
      care: 'Fluent pleasantness can let a real disagreement go unaddressed.',
    },
    h: {
      headline: 'Being honest and being nice disagree',
      how: [
        'Wording and harmony pull differently, so a clear statement can feel unkind and a kind one can feel dishonest.',
        'It often produces heavy editing before anything is sent.',
      ],
      show: [
        'Over-softening until the point is lost.',
        'Regretting either the bluntness or the vagueness afterwards.',
        'Second-guessing how a message reads.',
      ],
      care: 'Saying the direct thing and adding warmth separately usually works better than blending them.',
    },
  },
  'Mars|Mercury': {
    c: {
      headline: 'Thinking and fighting use the same equipment',
      how: [
        'Mind and drive are fused, so thought arrives at speed and comes out with force behind it — this is the debating, arguing, quick-answer combination.',
        'Irritation tends to be expressed verbally: a sharp reply, a cutting accuracy, a point pressed further than needed.',
      ],
      show: [
        'Answering fast, sometimes before the other person has finished.',
        'Sounding harsher than intended when annoyed — the words go out before the tone is set.',
        'Little patience with slow explanations, repetition or padding.',
        'Genuinely enjoying argument as a way of thinking, which not everyone else experiences as enjoyable.',
      ],
      care: 'The thing to work on is not the speed but the delay: a decided reply written now and sent in ten minutes keeps the sharpness and loses the damage. Directness and effectiveness are not the same thing here.',
      say: 'Your mind is quick and it is wired straight to your drive, so the answer is usually there before you have decided whether to give it. That makes you sharp in a debate, and it means annoyance can leave your mouth already pointed.',
    },
    f: {
      headline: 'Quick thinking with the edge under control',
      how: [
        'Mind and drive cooperate, so decisions get made quickly and stated clearly without much collateral.',
        'It gives mental stamina: they can stay in a demanding conversation without tiring or turning.',
      ],
      show: [
        'Being decisive without being abrasive.',
        'Strong at anything requiring fast, accurate talking — teaching, selling, briefing.',
        'Speaking up early rather than stewing.',
      ],
      care: 'The pace can leave slower thinkers behind; checking that people are still with them costs little.',
    },
    h: {
      headline: 'Speed and accuracy argue with each other',
      how: [
        'Mind and drive pull at an angle, so the impulse to answer arrives before the wording is ready.',
        'That can come out as bluntness, interruption, or a rehearsed comeback delivered late.',
      ],
      show: [
        'Being told they sounded aggressive when they felt merely clear.',
        'Winning the exchange and losing the relationship in it.',
        'Going over an argument afterwards, finding the better sentence.',
      ],
      care: 'Slowing the first sentence — even by one breath — changes the outcome more than anything said after it.',
    },
  },
  'Jupiter|Mercury': {
    c: {
      headline: 'A fast, wide-ranging mind',
      how: [
        'Thinking and expansion combine, so the mind runs quickly and reaches for the bigger version of the idea — this is the broad-interest, big-picture, many-tabs-open combination.',
        'Ideas tend to arrive already scaled up, with the implications attached before the detail is checked.',
      ],
      show: [
        'Starting with the general principle and working down to specifics reluctantly.',
        'Several subjects on the go at once, picked up quickly and enthusiastically.',
        'Talking at length about something they just discovered, and being genuinely persuasive about it.',
        'Optimistic estimates — of time, of scope, of how well it will go.',
      ],
      care: 'The content is usually good and the scale is usually too large; the useful discipline is finishing one thing and checking the small print before describing the whole plan. Enthusiasm is not the problem, capacity is.',
      say: 'Your mind runs fast and wide — you see the whole shape of an idea early. The practical part is the last twenty percent, and the detail you skipped because it was obvious.',
    },
    f: {
      headline: 'Learning is enjoyable and comes easily',
      how: [
        'Thinking and growth cooperate, so new subjects open without much resistance.',
        'It usually gives good teaching instincts and easy, confident explanation.',
      ],
      show: [
        'Picking up a field quickly to a useful level.',
        'Explaining complicated things in plain words.',
        'Interest in travel, languages, or other people’s frameworks.',
      ],
      care: 'Breadth can quietly replace depth; one subject taken all the way changes what the rest is worth.',
    },
    h: {
      headline: 'Big ideas and accurate detail disagree',
      how: [
        'Thinking and expansion pull at an angle, so the scope of an idea and the facts supporting it are not always in step.',
        'It can show as overpromising in conversation, or scattering across too many interests.',
      ],
      show: [
        'Committing verbally to more than the week holds.',
        'Exaggerating slightly without meaning to.',
        'Losing the thread across too many open projects.',
      ],
      care: 'Numbers and deadlines written down, rather than estimated aloud, do most of the work here.',
    },
  },
  'Mercury|Saturn': {
    c: {
      headline: 'A careful, checked mind',
      how: [
        'Thinking and caution combine, so nothing gets said until it has been tested — this is the precise, structured, does-not-guess combination.',
        'It gives real accuracy and depth in a subject, and makes speaking up before being sure uncomfortable.',
      ],
      show: [
        'Saying "I do not know yet" rather than improvising.',
        'Serious, exacting written work.',
        'Discomfort with brainstorming, small talk or half-formed ideas out loud.',
        'Sticking with a difficult subject long enough to actually master it.',
      ],
      care: 'The standard applied to their own sentences is usually higher than the one applied to anyone else’s; when confidence lags, the cure is evidence, not pep talk. Many people with this contact describe a slow, unglamorous start followed by genuine authority later.',
      say: 'You do not think out loud, you think and then speak. That makes you accurate and slower to volunteer, and it means your own first drafts get judged harder than anyone else’s finished ones.',
    },
    f: {
      headline: 'Structured, dependable thinking',
      how: [
        'Thinking and patience cooperate, so they can concentrate on something long and unexciting and come out with something solid.',
        'It gives a good instinct for what will hold up under questioning.',
      ],
      show: [
        'Reliable in detailed work others find tedious.',
        'Plain, unembellished explanations that turn out to be right.',
        'Learning steadily rather than in bursts.',
      ],
      care: 'Thorough is not the same as slow to start; the first version can be rough.',
    },
    h: {
      headline: 'Wanting to speak and feeling ready to speak conflict',
      how: [
        'Thinking meets restriction, so words can feel blocked exactly when they are needed, and self-criticism arrives before the sentence finishes.',
        'It often produces heavy preparation, and better performance in writing than on the spot.',
      ],
      show: [
        'Going quiet in a discussion, then having the point afterwards.',
        'Rereading their own message for errors repeatedly.',
        'Taking a question about their work as a judgement of it.',
      ],
      care: 'This contact reliably improves with practice and evidence; counting what they have actually got right is more useful than lowering the standard.',
    },
  },
  'Mercury|Uranus': {
    c: {
      headline: 'Thinking arrives in jumps',
      how: [
        'Mind and disruption combine, so conclusions appear whole rather than step by step.',
        'It gives genuine originality and impatience with the standard explanation.',
      ],
      show: [
        'Skipping the middle of the reasoning and being right anyway.',
        'Losing interest in a subject once the pattern is clear.',
        'Saying the thing nobody else in the room raised.',
      ],
      care: 'Being right and being followed are different tasks; showing the working is a courtesy worth learning.',
    },
    f: {
      headline: 'Inventive thinking that stays usable',
      how: [
        'Mind and originality cooperate, so unusual ideas arrive in a form other people can act on.',
        'Problem-solving tends to come from an unexpected angle.',
      ],
      show: [
        'Finding the workaround quickly.',
        'Comfortable with new tools and systems.',
        'Explaining an unconventional idea persuasively.',
      ],
      care: 'Novelty can become the criterion; the boring option is sometimes correct.',
    },
    h: {
      headline: 'Original thinking and steady thinking collide',
      how: [
        'Mind and disruption pull at an angle, so attention jumps and the standard method feels intolerable.',
        'It can show as brilliance in bursts and difficulty with sustained routine work.',
      ],
      show: [
        'Starting many lines of thought and finishing few.',
        'Strong resistance to being told how to do it.',
        'Restlessness in structured learning environments.',
      ],
      care: 'Short, varied working blocks tend to fit this contact better than long uniform ones. It is a description of pace, not a medical conclusion.',
    },
  },
  'Mercury|Neptune': {
    c: {
      headline: 'Thinking works in images rather than lists',
      how: [
        'Mind and imagination blend, so understanding arrives as a whole impression that is hard to put into stepwise words.',
        'It gives strong intuitive reading of people and real creative language ability.',
      ],
      show: [
        'Knowing something without being able to say how.',
        'Writing or speaking with unusual imagery.',
        'Vagueness about times, numbers and specifics.',
      ],
      care: 'Detail slips here; writing things down is a practical requirement rather than a preference.',
    },
    f: {
      headline: 'Imaginative, intuitive communication',
      how: [
        'Mind and sensitivity cooperate, so they can put words to atmosphere and feeling.',
        'It suits storytelling, teaching through metaphor and listening well.',
      ],
      show: [
        'Describing a mood accurately.',
        'Picking up the unspoken part of a conversation.',
        'Creative writing or music coming easily.',
      ],
      care: 'The intuitive read is usually good and still benefits from checking.',
    },
    h: {
      headline: 'Precision and impression disagree',
      how: [
        'Mind meets blur, so facts and impressions can get stored together and retrieved as one thing.',
        'It can show as misremembering details while remembering the feeling exactly.',
      ],
      show: [
        'Confusion over what was actually agreed.',
        'Hearing what was hoped for rather than what was said.',
        'Difficulty concentrating on dry material.',
      ],
      care: 'Confirming in writing is the single most useful habit for this contact.',
    },
  },
  'Mercury|Pluto': {
    c: {
      headline: 'Thinking goes all the way down',
      how: [
        'Mind and intensity combine, so nothing gets taken at face value and research goes further than asked.',
        'It gives penetrating insight and considerable weight when they finally say something.',
      ],
      show: [
        'Investigating until they have the real answer.',
        'Saying little, then saying something decisive.',
        'Noticing what people are avoiding saying.',
      ],
      care: 'Depth can turn into suspicion; not every surface has something underneath it.',
    },
    f: {
      headline: 'Deep thinking that stays workable',
      how: [
        'Mind and intensity cooperate, so they can handle serious subjects without being consumed.',
        'Persuasiveness here comes from substance rather than volume.',
      ],
      show: [
        'Strong at research and analysis.',
        'Trusted with confidential information.',
        'Asking the question everyone else stepped around.',
      ],
      care: 'Lighter conversation is a skill worth keeping in use.',
    },
    h: {
      headline: 'Depth and openness press on each other',
      how: [
        'Mind and intensity pull against each other, so words can carry more force than intended and disagreement can turn into a contest.',
        'Information often becomes something to control — withheld, or deployed.',
      ],
      show: [
        'Saying the cutting, accurate thing and regretting it.',
        'Reading motives into a neutral remark.',
        'Difficulty letting an argument stay unresolved.',
      ],
      care: 'Stating the observation without the interpretation attached usually lowers the temperature considerably.',
    },
  },
  'Chiron|Mercury': {
    c: {
      headline: 'Thinking and speaking are a sensitive area',
      how: [
        'Mind and sensitivity sit together, so being corrected, misunderstood or thought slow registers strongly.',
        'It tends to produce unusual patience with people who are struggling to explain themselves.',
      ],
      show: [
        'Downplaying their own intelligence.',
        'Preparing heavily before speaking publicly.',
        'Explaining things carefully so nobody feels stupid.',
      ],
      care: 'Read this as a sensitive area, not as any statement about ability, schooling or history.',
    },
    f: {
      headline: 'Sensitivity makes them a good explainer',
      how: [
        'The tender spot and the mind cooperate, so they communicate well with people in the same position.',
        'Teaching and counselling often sit comfortably here.',
      ],
      show: [
        'Making difficult material accessible.',
        'Naming what someone else cannot phrase.',
        'Comfortable saying they do not know.',
      ],
      care: 'The patience given to others is worth extending to their own first drafts.',
    },
    h: {
      headline: 'Speaking up and feeling exposed overlap',
      how: [
        'Mind meets sensitivity at an angle, so contributing an idea can feel like offering it up for judgement.',
        'It usually eases considerably once competence has been demonstrated a few times.',
      ],
      show: [
        'Holding back a good point in a meeting.',
        'Re-reading sent messages.',
        'Strong reaction to being corrected in public.',
      ],
      care: 'No event, condition or difficulty is implied here — sensitivity only.',
    },
  },

  // ── Venus ─────────────────────────────────────────────────────────────
  'Mars|Venus': {
    c: {
      headline: 'Wanting and pursuing run together',
      how: [
        'Attraction and drive combine, so liking something turns quickly into going after it.',
        'It gives warmth with initiative: they act on interest rather than waiting on it.',
      ],
      show: [
        'Making the first move rather than hinting.',
        'Strong, quick preferences about people and things.',
        'Creative energy that wants an outlet.',
      ],
      care: 'The pace of wanting can outrun the pace of the situation; checking the other side is still interested matters.',
    },
    f: {
      headline: 'Warmth and drive cooperate',
      how: [
        'Affection and effort support each other, so they can want something and pursue it without friction.',
        'It usually makes relating straightforward and enjoyable.',
      ],
      show: [
        'Comfortable initiating and being pursued.',
        'Charm that does not feel like effort.',
        'Creative or physical activity that stays fun.',
      ],
      care: 'Ease means less practice at handling a no.',
    },
    h: {
      headline: 'What they want and how they go after it disagree',
      how: [
        'Attraction and drive pull at an angle, so pursuing can feel too much and waiting can feel passive.',
        'Timing is often the theme: too fast, too late, or mixed signals in between.',
      ],
      show: [
        'Wanting something and hesitating over pursuing it.',
        'Frustration in situations that should be pleasant.',
        'Attraction to people who make things complicated.',
      ],
      care: 'Saying the plain want, once, usually resolves more than any amount of strategy.',
    },
  },
  'Jupiter|Venus': {
    c: {
      headline: 'Generous taste, generous affection',
      how: [
        'Pleasure and expansion combine, so enjoyment, warmth and spending all run at a generous setting.',
        'It gives real charm and a genuine talent for making occasions good.',
      ],
      show: [
        'Hosting, giving, celebrating.',
        'Expensive taste, or at least ambitious taste.',
        'People finding them easy to like quickly.',
      ],
      care: 'Generosity outruns the budget sometimes — of money, time or goodwill.',
    },
    f: {
      headline: 'Warmth with room in it',
      how: [
        'Affection and optimism cooperate, so relationships are approached with expectation rather than caution.',
        'Social life tends to open opportunities.',
      ],
      show: [
        'Making people feel welcome as a habit.',
        'Enjoying good things without guilt.',
        'Forgiving fairly readily.',
      ],
      care: 'Easy warmth can make the harder conversation easy to skip.',
    },
    h: {
      headline: 'Enjoyment and moderation disagree',
      how: [
        'Pleasure and expansion pull at an angle, so "enough" is a hard quantity to locate.',
        'It can swing between indulgence and self-denial.',
      ],
      show: [
        'Overdoing the good thing, then overcorrecting.',
        'Spending, then restricting.',
        'Wanting more in a relationship that is already fine.',
      ],
      care: 'Deciding the amount before starting works better than deciding during.',
    },
  },
  'Saturn|Venus': {
    c: {
      headline: 'Affection is taken seriously',
      how: [
        'Pleasure and restraint sit together, so warmth is real but rationed, and commitment is meant when it is given.',
        'It gives loyalty, and a preference for quality over quantity in everything.',
      ],
      show: [
        'Slow to open, then durable.',
        'Careful with money and with promises.',
        'Discomfort with easy compliments or fast intimacy.',
      ],
      care: 'Worth can feel like something to earn; many people with this contact report their sense of being valued improving steadily with age and evidence.',
    },
    f: {
      headline: 'Affection with structure under it',
      how: [
        'Warmth and patience cooperate, so they can commit and keep it without strain.',
        'It gives good judgement about what and who is worth the time.',
      ],
      show: [
        'Long friendships and relationships.',
        'Restrained, lasting taste.',
        'Reliable in the practical side of caring.',
      ],
      care: 'Steady affection still needs saying out loud occasionally.',
    },
    h: {
      headline: 'Wanting closeness and expecting cost conflict',
      how: [
        'Pleasure meets restriction, so affection can arrive with a sense of not-quite-deserving attached.',
        'It often shows as either holding back or settling for less than wanted.',
      ],
      show: [
        'Hesitating before accepting warmth.',
        'Attraction to reserved or unavailable situations.',
        'Difficulty asking for what they want in a relationship.',
      ],
      care: 'This contact tends to ease markedly with time; the practical step is one small, direct request rather than a change of self-image.',
    },
  },
  'Uranus|Venus': {
    c: {
      headline: 'Unconventional taste and unconventional closeness',
      how: [
        'Affection and independence combine, so attraction is drawn to the unusual and closeness needs breathing room.',
        'It gives originality in style and a genuine openness about how relationships can be arranged.',
      ],
      show: [
        'Sudden strong interests that can shift.',
        'Distinctive, self-chosen taste.',
        'Needing space inside closeness.',
      ],
      care: 'Excitement and depth are not the same currency; both are worth budgeting for.',
    },
    f: {
      headline: 'Freedom and warmth coexist',
      how: [
        'Affection and independence cooperate, so they can be close without feeling contained.',
        'Friendship often works as the base of closeness.',
      ],
      show: [
        'Wide, varied social circle.',
        'Comfortable with unconventional arrangements.',
        'Style that is theirs rather than borrowed.',
      ],
      care: 'Independence is easy to default to when closeness needs attention.',
    },
    h: {
      headline: 'Wanting stability and wanting freedom collide',
      how: [
        'Affection and disruption argue, so settled closeness can start to feel restrictive.',
        'Interest can arrive fast and change course with little warning.',
      ],
      show: [
        'Losing interest once things get predictable.',
        'On-off patterns in relationships.',
        'Changing taste or appearance abruptly.',
      ],
      care: 'Deliberate variety inside a stable situation usually reduces the pull to end it.',
    },
  },
  'Neptune|Venus': {
    c: {
      headline: 'Romantic imagination and affection blend',
      how: [
        'Pleasure and sensitivity combine, so love, beauty and art are experienced with unusual intensity and an ideal attached.',
        'It gives real artistic feeling and considerable compassion.',
      ],
      show: [
        'Falling for the potential in someone.',
        'Strong response to music, beauty, atmosphere.',
        'Giving generously without keeping account.',
      ],
      care: 'Idealising is the pattern to watch; seeing someone accurately is usually the more affectionate act.',
    },
    f: {
      headline: 'Tenderness with imagination in it',
      how: [
        'Affection and sensitivity cooperate, so kindness and creativity come easily.',
        'They usually sense what someone needs before being told.',
      ],
      show: [
        'Artistic or aesthetic ability.',
        'Forgiving and understanding by default.',
        'Comfort with emotional subtlety.',
      ],
      care: 'The generous reading of people is worth pairing with the evidence.',
    },
    h: {
      headline: 'The ideal and the actual relationship differ',
      how: [
        'Pleasure meets blur, so what is hoped for and what is present can be hard to separate.',
        'Disappointment often follows the version rather than the person.',
      ],
      show: [
        'Overlooking clear information about someone.',
        'Feeling let down by situations that were never agreed.',
        'Difficulty stating what they actually want.',
      ],
      care: 'Asking direct questions early prevents most of the disappointment this contact is known for.',
    },
  },
  'Pluto|Venus': {
    c: {
      headline: 'Affection at full intensity',
      how: [
        'Pleasure and depth combine, so closeness is all-in and rarely casual.',
        'It gives magnetism and real staying power in a relationship.',
      ],
      show: [
        'Strong attachment once given.',
        'Privacy about what they actually feel.',
        'Attraction to depth rather than ease.',
      ],
      care: 'Under strain this can show up as holding on too tightly; loosening the grip is the practice rather than feeling less.',
    },
    f: {
      headline: 'Depth in closeness that works',
      how: [
        'Affection and intensity cooperate, so they can commit deeply without losing themselves.',
        'Relationships tend to change them, usefully.',
      ],
      show: [
        'Loyal through difficulty.',
        'Comfortable with serious conversation early.',
        'Attraction that lasts past novelty.',
      ],
      care: 'Depth can make lighter enjoyment feel not worth having; keep some.',
    },
    h: {
      headline: 'Wanting ease and wanting total depth press on each other',
      how: [
        'Affection and intensity pull against each other, so closeness can feel both essential and risky.',
        'The theme is often how much to reveal and how much to hold.',
      ],
      show: [
        'Strong reaction to being left out or overlooked.',
        'Testing before trusting.',
        'Cycles of intense closeness and distance.',
      ],
      care: 'Naming the intensity directly, early, tends to work better than managing it silently.',
    },
  },
  'Chiron|Venus': {
    c: {
      headline: 'Being valued is a sensitive area',
      how: [
        'Affection and sensitivity sit together, so questions of worth and desirability register more strongly than usual.',
        'It often becomes real kindness toward people who feel unwanted.',
      ],
      show: [
        'Discounting compliments.',
        'Giving more than they ask for.',
        'Noticing immediately when someone is excluded.',
      ],
      care: 'No history, event or relationship is implied by this placement — sensitivity only.',
    },
    f: {
      headline: 'Sensitivity turns into warmth',
      how: [
        'The tender area and affection cooperate, so understanding gets offered easily.',
        'People often feel accepted quickly around them.',
      ],
      show: [
        'Making others feel wanted.',
        'Comfortable with imperfection in people.',
        'Steady, undramatic loyalty.',
      ],
      care: 'The acceptance they hand out is worth applying inward.',
    },
    h: {
      headline: 'Wanting closeness and feeling exposed overlap',
      how: [
        'Affection meets sensitivity at an angle, so being wanted can feel unsafe to rely on.',
        'This generally eases in relationships where being valued becomes unremarkable.',
      ],
      show: [
        'Pre-empting rejection.',
        'Choosing situations that confirm the doubt.',
        'Difficulty accepting straightforward affection.',
      ],
      care: 'Read this as a tender area, never as a statement about anyone’s past relationships.',
    },
  },

  // ── Mars / outer ──────────────────────────────────────────────────────
  'Jupiter|Mars': {
    c: {
      headline: 'Drive with a big setting',
      how: [
        'Effort and expansion combine, so action is confident and scaled up before it is measured.',
        'It gives real courage and appetite for a challenge.',
      ],
      show: [
        'Going in enthusiastically and worrying about scope later.',
        'Physical or competitive energy needing an outlet.',
        'Persuading others to join something ambitious.',
      ],
      care: 'The energy is rarely the problem; the estimate is. Halving the first plan usually keeps it.',
    },
    f: {
      headline: 'Confident, sustainable effort',
      how: [
        'Drive and optimism cooperate, so they push without burning out or turning sour.',
        'Setbacks rarely stop the next attempt.',
      ],
      show: [
        'Good timing on when to act.',
        'Recovering from a knock quickly.',
        'Motivating others by example.',
      ],
      care: 'Easy confidence can skip the preparation stage.',
    },
    h: {
      headline: 'How hard to push and how far to go disagree',
      how: [
        'Drive and expansion pull at an angle, so effort can overshoot or arrive in bursts.',
        'It often swings between overcommitting and abandoning.',
      ],
      show: [
        'Taking on more than can be finished.',
        'Impatience with anything slow.',
        'Risk-taking that looks confident and is not always calculated.',
      ],
      care: 'One thing at a time, finished, does more for this contact than any increase in effort.',
    },
  },
  'Mars|Saturn': {
    c: {
      headline: 'Effort that is controlled before it is released',
      how: [
        'Drive and restraint sit together, so energy is disciplined, deliberate and often held back.',
        'It gives genuine endurance: they finish things that take years.',
      ],
      show: [
        'Working steadily rather than in bursts.',
        'Anger contained and rarely shown.',
        'Frustration with situations they cannot control.',
      ],
      care: 'Held effort needs a route out; regular physical outlet does more here than analysis. The endurance is real and worth naming to them.',
    },
    f: {
      headline: 'Disciplined drive',
      how: [
        'Effort and patience cooperate, so they can work hard over long periods without losing the thread.',
        'It suits anything requiring craft or training.',
      ],
      show: [
        'Sustained practice.',
        'Reliable under pressure.',
        'Proportionate, useful assertion.',
      ],
      care: 'Discipline can become the only mode; rest needs scheduling too.',
    },
    h: {
      headline: 'Wanting to act and feeling blocked conflict',
      how: [
        'Drive meets restriction, so effort can feel stopped, delayed or not permitted.',
        'It often produces held frustration that surfaces later, and a strong dislike of being obstructed.',
      ],
      show: [
        'Starting and stopping, then pushing hard at the deadline.',
        'Irritation that goes inward rather than outward.',
        'Strong reaction to arbitrary authority.',
      ],
      care: 'This contact typically improves with skill: the frustration lowers as competence makes the obstruction smaller. Consistent physical outlet matters more than motivation.',
    },
  },
  'Mars|Uranus': {
    c: {
      headline: 'Action arrives suddenly',
      how: [
        'Drive and disruption combine, so decisions get acted on quickly and unpredictably.',
        'It gives real nerve and fast reflexes in a changing situation.',
      ],
      show: [
        'Making abrupt moves that make sense to them.',
        'Strong reaction to being told what to do.',
        'Thriving where things change fast.',
      ],
      care: 'The speed is usable and the direction needs checking; a pause before an irreversible move is the whole discipline.',
    },
    f: {
      headline: 'Quick, independent action',
      how: [
        'Drive and originality cooperate, so they act fast and unconventionally without much collateral.',
        'Good in situations others find chaotic.',
      ],
      show: [
        'Improvising well.',
        'Working best with autonomy.',
        'Physical or technical quickness.',
      ],
      care: 'Independence can make collaboration feel slower than it needs to.',
    },
    h: {
      headline: 'Steady effort and sudden change collide',
      how: [
        'Drive and disruption pull at an angle, so energy comes in bursts and routine feels intolerable.',
        'Impatience is usually the pressure point.',
      ],
      show: [
        'Abandoning something the moment it becomes repetitive.',
        'Acting on irritation before thinking.',
        'Accident-prone when rushing.',
      ],
      care: 'Varying the method rather than abandoning the task usually holds more of the work.',
    },
  },
  'Mars|Neptune': {
    c: {
      headline: 'Drive with soft edges',
      how: [
        'Effort and sensitivity blend, so motivation rises and falls with mood and atmosphere.',
        'It gives imaginative, artistic or compassionate action rather than blunt force.',
      ],
      show: [
        'Working in inspired stretches rather than steadily.',
        'Difficulty pushing for themselves specifically.',
        'Energy going into creative or caring work.',
      ],
      care: 'Direction is the weak point, not effort; a clear, written next step is worth more than motivation.',
    },
    f: {
      headline: 'Effort guided by feel',
      how: [
        'Drive and imagination cooperate, so action follows instinct and usually lands well.',
        'Physical activity often has an artistic or flowing quality.',
      ],
      show: [
        'Good timing without calculation.',
        'Motivated by meaning rather than reward.',
        'Helping others without being asked.',
      ],
      care: 'Feel-led effort still benefits from a deadline.',
    },
    h: {
      headline: 'Wanting to act and being sure what to act on disagree',
      how: [
        'Drive meets blur, so energy can dissipate or get aimed at the wrong target.',
        'Frustration often comes from uncertainty rather than obstruction.',
      ],
      show: [
        'Losing momentum without a clear reason.',
        'Difficulty asserting on their own behalf.',
        'Energy dropping when the situation is ambiguous.',
      ],
      care: 'Defining one concrete next action does more here than any increase in effort.',
    },
  },
  'Mars|Pluto': {
    c: {
      headline: 'Effort at full strength',
      how: [
        'Drive and intensity combine, so when they commit to something the whole weight goes behind it.',
        'It gives formidable stamina and considerable force of will.',
      ],
      show: [
        'Working past the point others stop.',
        'Strong response to being blocked or controlled.',
        'Little interest in anything half-hearted.',
      ],
      care: 'Under strain this can turn a disagreement into a contest of wills; naming the goal rather than winning the exchange is the practice.',
    },
    f: {
      headline: 'Powerful, usable drive',
      how: [
        'Effort and intensity cooperate, so they can push hard without it costing the relationship or the plan.',
        'Pressure tends to focus them rather than fray them.',
      ],
      show: [
        'Performing well when the stakes rise.',
        'Finishing difficult, long projects.',
        'Physical or professional endurance.',
      ],
      care: 'High capacity attracts more load; the limit has to be their own.',
    },
    h: {
      headline: 'Force and control press on each other',
      how: [
        'Drive and intensity pull against each other, so effort can arrive with more pressure than the situation needs.',
        'Power — having it, losing it, resisting it — is usually the theme.',
      ],
      show: [
        'Escalating rather than dropping a disagreement.',
        'Strong reaction to being overruled.',
        'Bursts of effort followed by depletion.',
      ],
      care: 'Deliberately stepping back from a winnable argument builds more here than winning it. Nothing about danger or harm should be read from this contact.',
    },
  },
  'Chiron|Mars': {
    c: {
      headline: 'Asserting is a sensitive area',
      how: [
        'Drive and sensitivity sit together, so pushing for themselves can feel riskier than it looks.',
        'It often becomes real care about not steamrolling other people.',
      ],
      show: [
        'Hesitating before stating what they want.',
        'Anger arriving with guilt attached.',
        'Protective of people who cannot push back.',
      ],
      care: 'Read sensitivity, never a history of conflict or harm.',
    },
    f: {
      headline: 'Assertion with care in it',
      how: [
        'Drive and sensitivity cooperate, so they can be direct without damage.',
        'Often effective at standing up for others.',
      ],
      show: [
        'Firm without being harsh.',
        'Good at defending someone else’s position.',
        'Comfortable with measured confrontation.',
      ],
      care: 'The advocacy given to others is worth using for themselves.',
    },
    h: {
      headline: 'Wanting to push and feeling exposed overlap',
      how: [
        'Drive meets sensitivity at an angle, so assertion can feel unsafe and then arrive over-strongly.',
        'It usually improves as they collect evidence that being direct is survivable.',
      ],
      show: [
        'Avoiding confrontation, then over-reacting.',
        'Apologising for a reasonable request.',
        'Reading a refusal as a rejection.',
      ],
      care: 'No specific event, relationship or history is implied by this contact.',
    },
  },

  // ── Jupiter / Saturn / outer pairs ────────────────────────────────────
  'Jupiter|Saturn': {
    c: {
      headline: 'Ambition and caution in one decision',
      how: [
        'Expansion and limit sit together, so plans get made big and then trimmed to what will actually hold.',
        'It gives realistic ambition: slower than they would like, more durable than most.',
      ],
      show: [
        'Wanting to grow and checking the cost first.',
        'Long-horizon planning.',
        'Frustration at their own caution.',
      ],
      care: 'Both settings are useful; the trap is letting them argue instead of taking turns.',
    },
    f: {
      headline: 'Growth with structure under it',
      how: [
        'Expansion and patience cooperate, so progress tends to be steady and keeps what it gains.',
        'Good judgement about which opportunity is real.',
      ],
      show: [
        'Building something gradually and keeping it.',
        'Sensible risk-taking.',
        'Trusted with responsibility and growth at once.',
      ],
      care: 'Steady progress can be mistaken for lack of ambition, including by them.',
    },
    h: {
      headline: 'Expansion and restriction argue',
      how: [
        'Growth and limit pull against each other, so confidence and doubt can arrive about the same decision.',
        'It often swings: overreach, then contraction.',
      ],
      show: [
        'Enthusiasm followed by cold feet.',
        'Feeling either too cautious or overextended, rarely in between.',
        'Timing that feels slightly off.',
      ],
      care: 'Deciding the size of the step in advance, in writing, stops most of the swing.',
    },
  },
  'Saturn|Uranus': {
    c: {
      headline: 'Wanting to change it and wanting it to hold',
      how: [
        'Structure and disruption sit together, so reform comes with a plan attached rather than as rebellion.',
        'It gives the ability to change a system from inside it.',
      ],
      show: [
        'Questioning a rule and then proposing the replacement.',
        'Impatience with both chaos and bureaucracy.',
        'Practical innovation.',
      ],
      care: 'The two settings can stall each other; picking which one leads this month helps.',
    },
    f: {
      headline: 'Innovation that survives contact with reality',
      how: [
        'Structure and originality cooperate, so new ideas get built rather than just proposed.',
        'Useful anywhere reform is needed.',
      ],
      show: [
        'Improving an existing system rather than replacing it.',
        'Comfortable with both tradition and change.',
        'Steady progress on unconventional work.',
      ],
      care: 'Competence here attracts the difficult projects.',
    },
    h: {
      headline: 'Stability and freedom collide',
      how: [
        'Structure and disruption pull against each other, so commitments start to feel like cages and freedom feels unfooted.',
        'It often shows as sudden breaks from long, stable situations.',
      ],
      show: [
        'Building something, then dismantling it.',
        'Strong reaction to rules with no reason.',
        'Periods of restlessness in an established situation.',
      ],
      care: 'Building planned flexibility into commitments reduces the pull to break them.',
    },
  },
  'Neptune|Saturn': {
    c: {
      headline: 'Making something imagined real',
      how: [
        'Structure and imagination sit together, so a vision gets a plan and a plan gets a point.',
        'It suits work where something intangible has to become concrete.',
      ],
      show: [
        'Practical creative work.',
        'Discipline applied to something imaginative.',
        'Disappointment when reality lags the image.',
      ],
      care: 'The two settings can cancel: dream dismissed as impractical, plan dismissed as uninspiring. Both are worth keeping.',
    },
    f: {
      headline: 'Imagination with a frame around it',
      how: [
        'Patience and sensitivity cooperate, so creative or caring work gets finished.',
        'They can sustain something that needs both feel and structure.',
      ],
      show: [
        'Long-term creative or service work.',
        'Realistic compassion.',
        'Quiet, durable faith in something.',
      ],
      care: 'Steady work here rarely announces itself; the value has to be counted deliberately.',
    },
    h: {
      headline: 'The plan and the hope do not match',
      how: [
        'Structure meets blur, so a clear-eyed view and a hoped-for one arrive at the same time.',
        'Doubt can attach to something that is actually going fine.',
      ],
      show: [
        'Losing confidence in a plan without new information.',
        'Difficulty telling realism from pessimism.',
        'Vagueness exactly where a decision is needed.',
      ],
      care: 'Written facts and a second opinion steady this more than further thinking.',
    },
  },
  'Pluto|Saturn': {
    c: {
      headline: 'Serious, and all the way serious',
      how: [
        'Limit and intensity combine, so commitment is heavy, deliberate and hard to shift.',
        'It gives extraordinary endurance under pressure — the capacity to stay with something genuinely difficult.',
      ],
      show: [
        'Carrying more than they mention.',
        'Strong control over their own responses.',
        'Rebuilding after a setback rather than moving on.',
      ],
      care: 'Load accumulates quietly here; naming what they are carrying is the practice, and the capacity is not an obligation.',
    },
    f: {
      headline: 'Depth and discipline together',
      how: [
        'Patience and intensity cooperate, so they can work on something serious over a long stretch.',
        'Pressure tends to focus rather than fray them.',
      ],
      show: [
        'Steady through difficulty.',
        'Trusted with the hard part.',
        'Real change achieved slowly.',
      ],
      care: 'High capacity attracts more weight; the limit is theirs to set.',
    },
    h: {
      headline: 'Control and limitation press on each other',
      how: [
        'Restriction and intensity pull against each other, so obstruction can feel much heavier than the situation warrants.',
        'It often shows as strain between having to endure and wanting to force change.',
      ],
      show: [
        'Pushing hard against something that will not move.',
        'Strong reaction to powerlessness.',
        'Periods of pressure followed by real reorganisation.',
      ],
      care: 'Choosing where the effort goes, rather than applying it everywhere, is the useful move. No conclusion about hardship or harm should be drawn from this contact.',
    },
  },
  'Chiron|Saturn': {
    c: {
      headline: 'Being competent is a sensitive area',
      how: [
        'Limit and sensitivity sit together, so falling short registers strongly and standards get set high.',
        'It usually becomes real patience with other people who are still learning.',
      ],
      show: [
        'Over-preparing.',
        'Discounting their own qualifications.',
        'Generous with beginners.',
      ],
      care: 'Read sensitivity about competence, never a statement about ability or history.',
    },
    f: {
      headline: 'Sensitivity plus staying power',
      how: [
        'Patience and sensitivity cooperate, so they can work on a sore area rather than avoid it.',
        'Often ends up mentoring in exactly that area.',
      ],
      show: [
        'Steady improvement where they once felt weak.',
        'Comfortable admitting limits.',
        'Trusted by people who feel behind.',
      ],
      care: 'The patience extended outward is worth turning inward.',
    },
    h: {
      headline: 'Trying and feeling exposed overlap',
      how: [
        'Restriction meets sensitivity at an angle, so effort and self-doubt arrive together.',
        'This contact tends to improve considerably with accumulated evidence.',
      ],
      show: [
        'Avoiding situations where they might fall short.',
        'Holding a standard nobody set.',
        'Discounting progress already made.',
      ],
      care: 'Counting completed work is more useful here than adjusting the self-image.',
    },
  },
};

// Some entries above carry an extra field; strip it defensively.
type LooseFam = Fam & { show_extra?: string };

function famFor(entry: PairEntry, family: AspectFamily): LooseFam {
  return (family === 'conjunction' ? entry.c : family === 'flowing' ? entry.f : entry.h) as LooseFam;
}

// ── generic composer (uncurated pairs) ─────────────────────────────────
function compose(a: string, b: string, family: AspectFamily): Fam {
  const A = FN[a];
  const B = FN[b];
  const la = BODY_LABELS[a] ?? a;
  const lb = BODY_LABELS[b] ?? b;
  if (!A || !B) {
    return {
      headline: `${la} and ${lb} are linked in this chart`,
      how: [
        `${la} covers ${'\u2014'} ${la}, and ${lb} covers ${lb}.`,
        'Read them together rather than separately.',
      ],
      show: ['Look for both themes appearing in the same situations.'],
      care: 'Check this against the person’s own experience before relying on it.',
    };
  }
  if (family === 'conjunction') {
    return {
      headline: `${la} and ${lb} operate as one move`,
      how: [
        `${la} handles ${A.does}; ${lb} handles ${B.does}. Here they are not separable, so ${A.style} and ${B.style} happen in the same gesture.`,
        `The useful consequence is ${A.gift} arriving together with ${B.gift}; the cost is that there is little internal counterweight between them.`,
      ],
      show: [
        `${A.does.charAt(0).toUpperCase() + A.does.slice(1)} rarely shows up without ${B.does} coming with it.`,
        `Other people tend to experience the two as a single trait rather than two.`,
        `Under pressure, this can read as ${A.much}, with ${B.much} close behind.`,
      ],
      care: `Because nothing here moderates anything else, the practical step is an outside check rather than more self-observation.`,
    };
  }
  if (family === 'flowing') {
    return {
      headline: `${la} and ${lb} support each other`,
      how: [
        `${la} (${A.does}) and ${lb} (${B.does}) cooperate, so using one tends to make the other easier.`,
        'This is quiet support rather than a headline; it is usually only noticed when it is absent in someone else.',
      ],
      show: [
        `${A.gift.charAt(0).toUpperCase() + A.gift.slice(1)} available without much effort.`,
        `${B.gift.charAt(0).toUpperCase() + B.gift.slice(1)} showing up in the same situations.`,
        'Recovery after a setback in this area that does not need a rebuild.',
      ],
      care: 'Ease can go unused; this contact rewards deliberate application more than it appears to need any.',
    };
  }
  return {
    headline: `${la} and ${lb} ask for different things`,
    how: [
      `${la} wants ${A.does} handled by ${A.style}; ${lb} wants ${B.does} handled by ${B.style}. Those are different instructions for the same moment.`,
      'The friction is usually productive: it is the contact that makes someone practise, rather than coast.',
    ],
    show: [
      `Swinging between ${A.much} and ${B.much}.`,
      'Feeling pulled two ways about the same decision.',
      'Other people reporting two different versions of them.',
    ],
    care: 'Naming both needs out loud usually costs less than choosing one of them permanently.',
  };
}

function tightnessNote(orb: number, aspect: string): string {
  if (orb <= 1) {
    return `At ${orb.toFixed(1)}° this is close to exact, so it is worth leading with — it will usually be recognisable to the person straight away.`;
  }
  if (orb <= 3) {
    return `At ${orb.toFixed(1)}° this is tight enough to treat as a main theme rather than a footnote.`;
  }
  if (orb <= 5) {
    return `At ${orb.toFixed(1)}° this is present but moderate; mention it as one factor among several, not as the headline.`;
  }
  return `At ${orb.toFixed(1)}° this is wide. Treat it as background colour and only raise it if other placements say the same thing.`;
}

const GENERIC_GUARDS = [
  'It does not describe anyone else in the person’s life, or anything that happened to them.',
  'It is a tendency, not an outcome — how strongly it shows depends on age, choice and circumstance.',
];

function guardsFor(a: string, b: string, family: AspectFamily): string[] {
  const out = [...GENERIC_GUARDS];
  const set = new Set([a, b]);
  if (set.has('Chiron')) {
    out.unshift('Chiron here marks a sensitive area. It is not evidence of an injury, illness or any specific experience.');
  }
  if (set.has('Saturn') && (set.has('Moon') || set.has('Sun'))) {
    out.unshift('Where this is read through the early environment, that is how it tends to be remembered and described — not a factual claim about any family member.');
  }
  if (set.has('Pluto')) {
    out.unshift('Intensity here says nothing about safety, control or harm in any relationship.');
  }
  if (family === 'hard') {
    out.push('A square or opposition is friction, not damage; these contacts are commonly the most developed part of a chart by mid-life.');
  }
  return out.slice(0, 4);
}

/**
 * Full reading for one aspect between two core bodies.
 * Curated copy where it exists, an evidence-shaped composition otherwise.
 */
export function pairAspectReading(
  bodyA: string,
  bodyB: string,
  aspect: string,
  orb: number
): AspectPairReading {
  const family = aspectFamilyOf(aspect);
  const key = pairKey(bodyA, bodyB);
  const [first, second] = speakOrder(bodyA, bodyB);
  const entry = PAIRS[key];
  const fam = entry ? famFor(entry, family) : compose(first, second, family);

  const la = BODY_LABELS[first] ?? first;
  const lb = BODY_LABELS[second] ?? second;

  const how = [...fam.how];
  if (family === 'hard') {
    how.push(
      aspect.toLowerCase() === 'opposition'
        ? 'Because this is an opposition, it often plays out between them and other people, or as swinging between the two settings rather than blending them.'
        : 'Because this is a square, it is usually felt internally first — as pressure that pushes action rather than as a conflict with someone else.'
    );
  }

  const reading: AspectPairReading = {
    key,
    aspect,
    family,
    orb,
    headline: fam.headline,
    howItWorks: how,
    mayShowUp: fam.show.filter(Boolean),
    watchFor: fam.care,
    strengthNote: tightnessNote(orb, aspect),
    whatToSay:
      fam.say ??
      `${la} ${aspect} ${lb}: ${fam.headline.charAt(0).toLowerCase() + fam.headline.slice(1)}. ${fam.show[0]}`,
    askThis: FN[first]?.ask ?? FN[second]?.ask ?? 'Does that match how it actually works for you?',
    doesNotMean: guardsFor(first, second, family),
    curated: Boolean(entry),
  };

  return sanitizeInterpretiveDeep(reading);
}

/** Exposed for tests / QA: which pairs have hand-written copy. */
export const CURATED_PAIR_KEYS = Object.keys(PAIRS);

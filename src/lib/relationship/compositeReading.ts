/**
 * The composite reading: one context-aware, evidence-first model that the
 * Composite tab, the composite card and the printable report all render.
 *
 * Structure (fixed, so the reader learns how to read a composite chart):
 *   what this chart is → look here first → core themes (with signal strength)
 *   → why (exact factors) → how it may show up → what this does not mean
 *   → deeper technical view
 *
 * Rules enforced here:
 *   - Structure first: aspects, angularity, house emphasis and repeated themes
 *     outrank single sign placements. No sign lookup ever stands alone.
 *   - Every conclusion carries the exact placements and aspects behind it.
 *   - Signal strength is stated: strong / moderate / single placement.
 *   - Composite is never written directionally. It describes how the
 *     relationship tends to function, not "A feels X and B feels Y".
 *   - Age and context aware: teen pairs get friendship, affection, tone,
 *     communication, fun, trust, pacing and repair; adult marriage,
 *     cohabitation, sexual and family-building framing is switched off.
 */

import {
  type CompositeAspect,
  type CompositeModel,
  type CompositePosition,
  aspectBetween,
  aspectsInvolving,
  majorCompositeAspects,
} from './compositeEngine';
import type { RelationshipContext } from './relationshipContext';
import { sanitizeRelationshipDeep } from './relationshipLanguage';
import {
  DOES_NOT_MEAN_HEADING,
  SIGNAL_DISCLAIMER,
  SIGNAL_LABEL,
  TOP_FACTOR_MAX,
  contactTier,
  doesNotMeanFor,
  evidenceTier,
  signalLevel,
  type EvidenceTier,
  type SignalLevel,
} from '@/lib/interpretation/evidenceStandard';
import type { Element } from '@/lib/aspects/outOfSign';

export interface CompositeReadingItem {
  key: string;
  title: string;
  tier: EvidenceTier;
  signal: SignalLevel;
  signalLabel: string;
  /** Exact chart factors: positions, aspects with orbs, houses. */
  evidence: string[];
  /** "Why am I saying this?" — how those factors combine. */
  derivation: string[];
  /** What the factors mean for the relationship as an entity. */
  interpretation: string;
  /** Plain English, age and context appropriate. */
  howItShowsUp: string;
  doesNotMean: string[];
}

export interface CompositeReading {
  model: CompositeModel;
  context: RelationshipContext;
  /** Section 1. */
  whatThisChartIs: { heading: string; body: string[] };
  /** Synastry vs composite, spelled out so the two are never mixed. */
  distinction: { synastry: string; composite: string };
  /** Section 2 — the strongest 5–8 factors. */
  lookHereFirst: CompositeReadingItem[];
  /** Section 3–6 — 3 to 5 blended themes. */
  themes: CompositeReadingItem[];
  /** Weighted balance, as texture rather than a verdict. */
  balance: { line: string; note: string };
  /** Houses and angles: what was possible and what was not. */
  housesNote: string;
  housesAvailable: boolean;
  /** Same-sign coincidences and midpoint caveats. Observations, not conclusions. */
  observations: string[];
  bottomLine: string;
  methodNote: string;
  signalDisclaimer: string;
  doesNotMeanHeading: string;
}

// ── shared vocabulary ────────────────────────────────────────────────────────

/** One neutral tone phrase per sign. A layer, never a conclusion. */
const SIGN_TONE: Record<string, string> = {
  Aries: 'direct and quick to start things',
  Taurus: 'steady, comfort-seeking and slow to change course',
  Gemini: 'curious, talkative and variety-seeking',
  Cancer: 'protective, home-centred and led by feeling',
  Leo: 'warm, expressive and happiest when noticed',
  Virgo: 'practical, improving and detail-aware',
  Libra: 'balancing, fairness-minded and aware of the other person',
  Scorpio: 'private, all-in and interested in what is real',
  Sagittarius: 'adventurous, big-picture and freedom-loving',
  Capricorn: 'goal-minded, patient and structure-building',
  Aquarius: 'independent, unconventional and friendship-first',
  Pisces: 'imaginative, sensitive and easily coloured by mood',
};

/** What each body does in a composite chart. */
const BODY_FUNCTION: Record<string, string> = {
  Sun: 'what the relationship organises itself around',
  Moon: 'its emotional tone, and what makes it feel settled',
  Mercury: 'how it talks and thinks things through',
  Venus: 'what it enjoys and treats as valuable',
  Mars: 'how it acts, and how it handles friction',
  Jupiter: 'where it grows and takes on more',
  Saturn: 'where it steadies, commits and takes responsibility',
  Uranus: 'where it wants room and does things its own way',
  Neptune: 'where it idealises and blurs edges',
  Pluto: 'where it goes deep and where intensity gathers',
  Ascendant: 'how the relationship presents itself to other people',
  Midheaven: 'what it is aiming at, and how it is seen from outside',
};

const HOUSE_AREA: Record<number, string> = {
  1: 'how the relationship presents itself',
  2: 'what it values and treats as worth keeping',
  3: 'everyday talk, messages and small shared routines',
  4: 'home base and the feeling of belonging',
  5: 'fun, play, creativity and enjoyment',
  6: 'daily habits, helping out and practical routine',
  7: 'one-to-one fairness and give and take',
  8: 'trust, things that matter deeply and what is shared',
  9: 'shared beliefs, learning and wanting a bigger view',
  10: 'how the pair looks from outside, and what it is working toward',
  11: 'friendship, group life and shared hopes',
  12: 'private, behind-the-scenes and quiet time',
};

function stageWord(ctx: RelationshipContext, adult: string, teen: string, child: string): string {
  return ctx.stage === 'adult' ? adult : ctx.stage === 'teen' ? teen : child;
}

function positionLine(pos: CompositePosition): string {
  const house = pos.house ? `, composite ${ordinalWord(pos.house)} house` : '';
  return `Composite ${pos.body} at ${pos.label}${house}`;
}

function ordinalWord(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

function aspectLine(a: CompositeAspect): string {
  return `${a.label}${a.isOutOfSign ? ` — ${a.signVsDegree.signLine} ${a.signVsDegree.degreeLine}` : ''}`;
}

// ── factors ──────────────────────────────────────────────────────────────────

interface Factor {
  text: string;
  tier: EvidenceTier;
  bodies: string[];
  houses: number[];
  tense: boolean;
}

function aspectFactor(a: CompositeAspect): Factor {
  return {
    text: aspectLine(a),
    tier: contactTier([a.fromBody, a.toBody]),
    bodies: [a.fromBody, a.toBody],
    houses: [],
    tense: a.tone === 'tense',
  };
}

function positionFactor(pos: CompositePosition): Factor {
  return {
    text: positionLine(pos),
    tier: evidenceTier(pos.body),
    bodies: [pos.body],
    houses: pos.house ? [pos.house] : [],
    tense: false,
  };
}

function balanceFactor(model: CompositeModel, element: Element): Factor | null {
  const { balance } = model;
  const weight = balance.elements[element];
  if (!balance.totalWeight) return null;
  const share = weight / balance.totalWeight;
  if (share < 0.34) return null;
  const bodies = Object.values(model.positions)
    .filter((p) => p.element === element && BODY_IN_BALANCE.has(p.body))
    .map((p) => `${p.body} in ${p.sign}`);
  return {
    text: `Weighted ${element} emphasis: ${Math.round(share * 100)}% of the weighted total (${bodies.join(', ')})`,
    tier: 'primary',
    bodies: [],
    houses: [],
    tense: false,
  };
}

const BODY_IN_BALANCE = new Set([
  'Sun', 'Moon', 'Ascendant', 'Midheaven', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
]);

function houseEmphasisFactor(model: CompositeModel, houses: number[]): Factor | null {
  const hit = model.houseEmphasis.find((h) => houses.includes(h.house));
  if (!hit) return null;
  return {
    text: `Composite ${ordinalWord(hit.house)}-house emphasis: ${hit.bodies.join(', ')} (${HOUSE_AREA[hit.house]})`,
    tier: 'primary',
    bodies: hit.bodies,
    houses: [hit.house],
    tense: false,
  };
}

function bodyInSignFactor(
  model: CompositeModel,
  body: string,
  signs: string[],
): Factor | null {
  const pos = model.positions[body];
  if (!pos || !signs.includes(pos.sign)) return null;
  return positionFactor(pos);
}

function bodyInHouseFactor(model: CompositeModel, body: string, houses: number[]): Factor | null {
  const pos = model.positions[body];
  if (!pos || pos.house === null || !houses.includes(pos.house)) return null;
  return positionFactor(pos);
}

// ── themes ───────────────────────────────────────────────────────────────────

type ThemeKey =
  | 'steadiness'
  | 'emotionalTone'
  | 'communication'
  | 'funAndEnergy'
  | 'depthAndIntensity'
  | 'freedomAndSpace'
  | 'growthAndOptimism'
  | 'imaginationAndIdeals';

interface ThemeCopy {
  title: string;
  interpretation: string;
  adult: string;
  teen: string;
}

const THEME_COPY: Record<ThemeKey, ThemeCopy> = {
  steadiness: {
    title: 'Steadiness and follow-through',
    interpretation:
      'Several factors point the same way: this relationship can hold a shape. Plans made together tend to be kept, and it often prefers a known rhythm to constant change.',
    adult:
      'One expression is a pair that builds routines, keeps agreements and takes practical responsibility for each other. The trade-off can be that change feels like a bigger deal than it needs to be, and that either person may treat effort as proof of care.',
    teen:
      'One expression is a couple who are reliable with each other: they turn up when they say they will, keep plans, and settle into habits like the same walk home, the same messages at the same time. The trade-off can be that changes to the routine feel unsettling, and that being serious can crowd out being silly.',
  },
  emotionalTone: {
    title: 'Emotional tone and closeness',
    interpretation:
      'The composite Moon is well connected, so emotional atmosphere is a real feature of this relationship rather than a background detail. Moods register quickly between the two.',
    adult:
      'One expression is a pair who read each other quickly and can soothe each other without much explanation. The trade-off can be that one person\'s mood colours the whole day, so saying the mood out loud early helps.',
    teen:
      'One expression is a couple who notice each other\'s moods fast: a short reply or a flat tone gets picked up straight away. That can feel close and comforting. The trade-off can be reading too much into a mood, so asking instead of guessing helps a lot here.',
  },
  communication: {
    title: 'Talking and thinking things through',
    interpretation:
      'Mercury is emphasised, so this relationship tends to process things in words. Conversation is one of the ways it functions rather than just something it does.',
    adult:
      'One expression is a pair who talk a lot, compare notes and sort problems out verbally. The trade-off can be talking around a feeling instead of naming it, or debating a point past the moment it mattered.',
    teen:
      'One expression is a couple who message constantly, joke in their own shorthand and work things out by talking. The trade-off can be that a misread message causes more trouble than the actual thing, so a voice note or a face-to-face check clears it faster than more typing.',
  },
  funAndEnergy: {
    title: 'Fun, energy and getting things going',
    interpretation:
      'Several active factors line up, so this relationship has drive. It tends to want something happening rather than sitting still.',
    adult:
      'One expression is a pair who plan things, take initiative and enjoy having momentum together. The trade-off can be starting more than gets finished, and friction when both want to lead at once.',
    teen:
      'One expression is a couple who make plans, get restless when nothing is going on, and like doing things rather than only talking. The trade-off can be that boredom turns into bickering, so having something to do together is genuinely useful for this pair.',
  },
  depthAndIntensity: {
    title: 'Depth and intensity',
    interpretation:
      'Pluto or an eighth-house emphasis is in the mix, so this relationship does not stay on the surface easily. It tends to matter a lot to both people.',
    adult:
      'One expression is a pair who take each other seriously, notice what is unsaid and are affected by each other. The trade-off can be that small things carry more weight than intended, so naming the size of a feeling early keeps it proportionate.',
    teen:
      'One expression is a couple where the relationship feels important, feelings run strong, and neither of them is casual about it. The trade-off can be that a small disagreement feels much bigger in the moment. Space, a night\'s sleep and a check-in the next day usually shrink it back to its real size.',
  },
  freedomAndSpace: {
    title: 'Independence and needing space',
    interpretation:
      'Uranus is involved, or an eleventh-house emphasis is present, so this relationship works better with room in it than with constant closeness.',
    adult:
      'One expression is a pair who keep their own interests and come back with something to say. The trade-off can be that closeness gets read as pressure, so being explicit about when to check in prevents guesswork.',
    teen:
      'One expression is a couple who like their own friends, hobbies and time, and who feel better when neither is expected to be available all the time. The trade-off can be one person reading space as losing interest, so saying "I need a quiet evening, talk tomorrow" out loud helps.',
  },
  growthAndOptimism: {
    title: 'Growth, optimism and encouragement',
    interpretation:
      'Jupiter is well placed here, so this relationship tends to have a lift in it. Both people can end up doing a bit more than they would alone.',
    adult:
      'One expression is a pair who encourage each other, learn things together and keep a wide view when problems arrive. The trade-off can be over-promising, or skipping the boring detail.',
    teen:
      'One expression is a couple who cheer each other on, try things because the other one is up for it, and generally make each other braver. The trade-off can be being over-optimistic about plans, so it helps if one of them checks the practical part.',
  },
  imaginationAndIdeals: {
    title: 'Imagination and ideals',
    interpretation:
      'Neptune is emphasised, so this relationship carries a picture of itself as well as the reality. Imagination, music, art and shared atmosphere often matter here.',
    adult:
      'One expression is a pair with real tenderness and a shared imaginative world. The trade-off can be filling in gaps with hope, so checking assumptions against what was actually said keeps the picture accurate.',
    teen:
      'One expression is a couple with a shared world of music, films, in-jokes and how things feel. The trade-off can be imagining what the other one meant instead of asking, so plain questions are worth more here than they might seem.',
  },
};

interface ThemeBuild {
  key: ThemeKey;
  factors: Factor[];
}

function buildThemeFactors(model: CompositeModel): ThemeBuild[] {
  const majors = majorCompositeAspects(model.aspects);
  const luminAngle = ['Sun', 'Moon', 'Ascendant', 'Midheaven'];
  const personal = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Ascendant'];
  const push = (list: Array<Factor | null>): Factor[] => list.filter(Boolean) as Factor[];

  const builds: ThemeBuild[] = [
    {
      key: 'steadiness',
      factors: push([
        balanceFactor(model, 'Earth'),
        ...aspectBetween(majors, ['Saturn'], personal).map(aspectFactor),
        bodyInSignFactor(model, 'Moon', ['Taurus', 'Virgo', 'Capricorn']),
        bodyInSignFactor(model, 'Sun', ['Taurus', 'Virgo', 'Capricorn']),
        bodyInHouseFactor(model, 'Saturn', [1, 4, 7, 10]),
        houseEmphasisFactor(model, [2, 4, 6, 10]),
      ]),
    },
    {
      key: 'emotionalTone',
      factors: push([
        ...aspectBetween(majors, ['Moon'], ['Sun', 'Venus', 'Jupiter', 'Saturn', 'Neptune', 'Ascendant']).map(aspectFactor),
        balanceFactor(model, 'Water'),
        bodyInSignFactor(model, 'Moon', ['Cancer', 'Scorpio', 'Pisces']),
        bodyInHouseFactor(model, 'Moon', [1, 4, 7, 10]),
        houseEmphasisFactor(model, [4, 12]),
      ]),
    },
    {
      key: 'communication',
      factors: push([
        ...aspectsInvolving(majors, 'Mercury').map(aspectFactor),
        balanceFactor(model, 'Air'),
        bodyInSignFactor(model, 'Mercury', ['Gemini', 'Libra', 'Aquarius', 'Virgo']),
        bodyInHouseFactor(model, 'Mercury', [1, 3, 9, 10, 11]),
        houseEmphasisFactor(model, [3, 11]),
      ]),
    },
    {
      key: 'funAndEnergy',
      factors: push([
        balanceFactor(model, 'Fire'),
        ...aspectBetween(majors, ['Mars'], ['Sun', 'Moon', 'Venus', 'Jupiter', 'Ascendant']).map(aspectFactor),
        bodyInSignFactor(model, 'Sun', ['Aries', 'Leo', 'Sagittarius']),
        bodyInHouseFactor(model, 'Mars', [1, 5, 10]),
        houseEmphasisFactor(model, [1, 5]),
      ]),
    },
    {
      key: 'depthAndIntensity',
      factors: push([
        ...aspectBetween(majors, ['Pluto'], personal).map(aspectFactor),
        bodyInSignFactor(model, 'Sun', ['Scorpio']),
        bodyInSignFactor(model, 'Moon', ['Scorpio']),
        bodyInHouseFactor(model, 'Pluto', [1, 4, 7, 8, 10]),
        houseEmphasisFactor(model, [8]),
      ]),
    },
    {
      key: 'freedomAndSpace',
      factors: push([
        ...aspectBetween(majors, ['Uranus'], luminAngle.concat(['Venus', 'Mars'])).map(aspectFactor),
        bodyInSignFactor(model, 'Sun', ['Aquarius']),
        bodyInSignFactor(model, 'Moon', ['Aquarius', 'Sagittarius']),
        bodyInHouseFactor(model, 'Uranus', [1, 7, 11]),
        houseEmphasisFactor(model, [11]),
      ]),
    },
    {
      key: 'growthAndOptimism',
      factors: push([
        ...aspectBetween(majors, ['Jupiter'], luminAngle.concat(['Venus', 'Mercury'])).map(aspectFactor),
        bodyInSignFactor(model, 'Sun', ['Sagittarius', 'Pisces']),
        bodyInHouseFactor(model, 'Jupiter', [1, 5, 9, 10]),
        houseEmphasisFactor(model, [9]),
      ]),
    },
    {
      key: 'imaginationAndIdeals',
      factors: push([
        ...aspectBetween(majors, ['Neptune'], ['Sun', 'Moon', 'Venus', 'Ascendant']).map(aspectFactor),
        bodyInSignFactor(model, 'Moon', ['Pisces']),
        bodyInSignFactor(model, 'Venus', ['Pisces']),
        bodyInHouseFactor(model, 'Neptune', [1, 4, 7, 12]),
        houseEmphasisFactor(model, [12]),
      ]),
    },
  ];

  // De-duplicate identical evidence lines inside a theme.
  return builds.map((b) => {
    const seen = new Set<string>();
    return { key: b.key, factors: b.factors.filter((f) => (seen.has(f.text) ? false : (seen.add(f.text), true))) };
  });
}

function themeItem(build: ThemeBuild, ctx: RelationshipContext): CompositeReadingItem {
  const copy = THEME_COPY[build.key];
  const primaryFactors = build.factors.filter((f) => f.tier === 'primary').length;
  const secondaryFactors = build.factors.filter((f) => f.tier === 'secondary').length;
  const signal = signalLevel({ primaryFactors, secondaryFactors });
  const bodies = [...new Set(build.factors.flatMap((f) => f.bodies))];
  const houses = [...new Set(build.factors.flatMap((f) => f.houses))];
  const anyTense = build.factors.some((f) => f.tense);

  const derivation = [
    `${build.factors.length} composite factor${build.factors.length === 1 ? '' : 's'} feed this theme, listed above with their exact degrees and orbs.`,
    signal === 'strong'
      ? 'Several major factors point the same way, which is why this is treated as a main theme.'
      : signal === 'moderate'
      ? 'Two or three major factors point this way, so it is a real theme but not the loudest one.'
      : 'This rests on a single placement, so it is worth noticing and is deliberately not headlined.',
    'Aspects, angles and house emphasis were weighed before sign placements; a sign on its own never carries a theme here.',
  ];

  return {
    key: build.key,
    title: copy.title,
    tier: primaryFactors > 0 ? 'primary' : secondaryFactors > 0 ? 'secondary' : 'supplemental',
    signal,
    signalLabel: SIGNAL_LABEL[signal],
    evidence: build.factors.map((f) => f.text),
    derivation,
    interpretation: copy.interpretation,
    howItShowsUp: stageWord(ctx, copy.adult, copy.teen, copy.teen),
    doesNotMean: (() => {
      const notes = doesNotMeanFor({
        bodies,
        houses,
        aspectTone: anyTense ? 'tense' : 'neutral',
        isOutOfSign: false,
      });
      return notes.length
        ? notes
        : [
            'This theme describes a tendency the two of you can lean into, not something fixed about either person.',
          ];
    })(),
  };
}

// ── look here first ──────────────────────────────────────────────────────────

function placementItem(
  model: CompositeModel,
  body: string,
  ctx: RelationshipContext,
): CompositeReadingItem | null {
  const pos = model.positions[body];
  if (!pos) return null;
  const contacts = aspectsInvolving(majorCompositeAspects(model.aspects), body).slice(0, 4);
  const evidence = [positionLine(pos), ...contacts.map(aspectLine)];
  if (pos.midpointAmbiguous) {
    evidence.push('The two natal positions were exactly opposite, so this midpoint is one of two equally valid options.');
  }

  const signal = signalLevel({
    primaryFactors: 1 + contacts.filter((c) => contactTier([c.fromBody, c.toBody]) === 'primary').length,
  });

  const houseLine = pos.house ? ` It sits in the composite ${ordinalWord(pos.house)} house, so ${HOUSE_AREA[pos.house]} is where this shows up most.` : '';

  return {
    key: `placement-${body}`,
    title: `Composite ${body} in ${pos.sign} (${pos.label})`,
    tier: evidenceTier(body),
    signal,
    signalLabel: SIGNAL_LABEL[signal],
    evidence,
    derivation: [
      `Composite ${body} is the midpoint of the two natal ${body} positions (${pos.sourceA.toFixed(2)}° and ${pos.sourceB.toFixed(2)}° absolute longitude).`,
      contacts.length
        ? `${contacts.length} major composite aspect${contacts.length === 1 ? '' : 's'} to it, listed above, shape how it works.`
        : 'It makes no close major composite aspect, so the sign is read lightly rather than as a headline.',
    ],
    interpretation: `${BODY_FUNCTION[body] ? `In a composite chart ${body} describes ${BODY_FUNCTION[body]}.` : ''} In ${pos.sign} that tends to be ${SIGN_TONE[pos.sign]}.${houseLine} Read it together with the aspects above rather than on its own.`,
    howItShowsUp: contacts.length
      ? stageWord(
          ctx,
          'The aspects listed matter more than the sign: they say whether this function runs smoothly or takes effort.',
          'The aspects listed matter more than the sign here. They are the part that says whether this comes easily or takes work.',
          'The aspects listed matter more than the sign here.',
        )
      : stageWord(
          ctx,
          'With no close aspect, treat this as background flavour rather than a defining feature.',
          'With no close aspect, this is background flavour, not a defining feature of the relationship.',
          'With no close aspect, this is background flavour only.',
        ),
    doesNotMean: doesNotMeanFor({
      bodies: [body, ...contacts.flatMap((c) => [c.fromBody, c.toBody])],
      houses: pos.house ? [pos.house] : [],
      aspectTone: contacts.some((c) => c.tone === 'tense') ? 'tense' : 'neutral',
    }),
  };
}

function aspectItem(a: CompositeAspect, ctx: RelationshipContext): CompositeReadingItem {
  const signal = signalLevel({
    primaryFactors: contactTier([a.fromBody, a.toBody]) === 'primary' ? 1 : 0,
    secondaryFactors: contactTier([a.fromBody, a.toBody]) === 'secondary' ? 1 : 0,
    tightCentralSignature: a.orb <= 2 && contactTier([a.fromBody, a.toBody]) === 'primary',
  });

  const evidence = [aspectLine(a), ...(a.isOutOfSign ? a.signVsDegree.lines : [])];

  return {
    key: `aspect-${a.fromBody}-${a.aspect}-${a.toBody}`,
    title: `Composite ${a.fromBody} ${a.symbol} ${a.toBody} — ${a.orb.toFixed(1)}° orb`,
    tier: contactTier([a.fromBody, a.toBody]),
    signal,
    signalLabel: SIGNAL_LABEL[signal],
    evidence,
    derivation: [
      `Separation ${a.separation.toFixed(2)}°, exact ${a.aspect} is ${a.aspectAngle}°, so the orb is ${a.orb.toFixed(1)}° inside the ${a.maxOrb}° allowance used for these two bodies.`,
      a.isOutOfSign
        ? 'The aspect is real by degree even though the signs do not make it, so the degree layer and the sign layer are both reported above.'
        : 'Sign layer and degree layer agree here.',
    ],
    interpretation: `${BODY_FUNCTION[a.fromBody] ?? a.fromBody} and ${BODY_FUNCTION[a.toBody] ?? a.toBody} are linked in this relationship${
      a.tone === 'flowing'
        ? ', and the link tends to run easily.'
        : a.tone === 'fusion'
        ? ', and they work as one unit rather than separately.'
        : ', and the link takes some managing.'
    }`,
    howItShowsUp: stageWord(
      ctx,
      a.tone === 'tense'
        ? 'One expression is friction between these two drives that improves with an agreed way of handling it, rather than one that disappears.'
        : 'One expression is that these two functions support each other without much effort, which can make them easy to take for granted.',
      a.tone === 'tense'
        ? 'One expression is that these two parts of the relationship pull against each other now and then. It is workable, and it usually needs a plan rather than a winner.'
        : 'One expression is that these two parts fit together easily, which can be easy to take for granted.',
      'These two parts of the relationship are connected.',
    ),
    doesNotMean: doesNotMeanFor({
      bodies: [a.fromBody, a.toBody],
      aspectTone: a.tone === 'tense' ? 'tense' : 'neutral',
      isOutOfSign: a.isOutOfSign,
    }),
  };
}

// ── the reading ──────────────────────────────────────────────────────────────

const WHAT_THIS_CHART_IS_HEADING = 'What this chart is';

function whatThisChartIs(model: CompositeModel, ctx: RelationshipContext): string[] {
  return [
    model.method === 'composite'
      ? 'A composite chart is a midpoint chart. Every position here is the halfway point between the two natal positions, which makes it a symbolic chart of the relationship itself rather than of either person.'
      : 'A Davison chart uses the real sky for the midpoint in time between the two births, so the relationship gets a moment of its own rather than an average of degrees.',
    'Nothing in this section describes what one person feels about the other. That is synastry. Here, every sentence is about how the relationship tends to function as a unit.',
    ctx.isTeenRomance
      ? 'This reading is written for a teen dating relationship: friendship, liking, emotional tone, communication, fun, trust, pacing and repair. Adult partnership, living-together, sexual and family-building material is switched off.'
      : ctx.contextNote,
    'Structure comes first: aspects, angles, house emphasis where it is available, and repeated themes. Single sign placements are shown, but a sign on its own never defines the relationship.',
  ];
}

function balanceLine(model: CompositeModel): string {
  const b = model.balance;
  const parts = (Object.entries(b.elements) as Array<[Element, number]>)
    .map(([el, w]) => `${el} ${w.toFixed(1)}`)
    .join(' · ');
  const dominant = b.dominantElement
    ? `${b.dominantElement} carries the most weight (${Math.round(b.dominantElementShare * 100)}%, mainly ${b.dominantElementBodies.slice(0, 3).join(', ')})`
    : 'No element carries a clear majority, so the balance is mixed';
  const modality = b.dominantModality ? `, and ${b.dominantModality} is the leading modality` : ', and the modalities are close to level';
  return `Weighted totals — ${parts}. ${dominant}${modality}.`;
}

function bottomLineFrom(themes: CompositeReadingItem[], ctx: RelationshipContext): string {
  const headline = themes.filter((t) => t.signal !== 'single').slice(0, 2);
  if (!headline.length) {
    return stageWord(
      ctx,
      'No theme here is reinforced by several major factors, so this composite is best read as a set of individual placements rather than one strong storyline.',
      'Nothing here is backed by several major factors at once, so this chart is better read as a few separate notes than as one big storyline about the relationship.',
      'Nothing here is strongly reinforced, so read the notes separately.',
    );
  }
  const names = headline.map((t) => t.title.toLowerCase()).join(' and ');
  return stageWord(
    ctx,
    `Read as a whole, this composite leans toward ${names}. Those are the themes with the most support behind them; everything else is texture.`,
    `Taken together, this chart leans toward ${names}. Those are the parts with the most evidence behind them, and the rest is detail.`,
    `Taken together, this chart leans toward ${names}.`,
  );
}

const SYNASTRY_VS_COMPOSITE = {
  synastry:
    'Synastry compares the two charts directly. It describes how each person affects the other: who feels what, and where the two styles meet or grate.',
  composite:
    'Composite is a single chart built from midpoints. It describes the relationship as its own entity: how the pair tends to function, not what either person feels.',
};

export function buildCompositeReading(
  model: CompositeModel,
  ctx: RelationshipContext,
): CompositeReading {
  const majors = majorCompositeAspects(model.aspects);

  // Look here first: Sun, Moon, angles, house emphasis, then the tightest aspects.
  const lookHere: CompositeReadingItem[] = [];
  for (const body of ['Sun', 'Moon']) {
    const item = placementItem(model, body, ctx);
    if (item) lookHere.push(item);
  }
  if (model.angles.ascendant) {
    const item = placementItem(model, 'Ascendant', ctx);
    if (item) lookHere.push(item);
  }
  if (model.angles.midheaven) {
    const item = placementItem(model, 'Midheaven', ctx);
    if (item) lookHere.push(item);
  }
  for (const emphasis of model.houseEmphasis.slice(0, 1)) {
    const signal = signalLevel({ primaryFactors: emphasis.bodies.length });
    lookHere.push({
      key: `house-${emphasis.house}`,
      title: `Composite ${ordinalWord(emphasis.house)}-house emphasis (${emphasis.bodies.length} bodies)`,
      tier: 'primary',
      signal,
      signalLabel: SIGNAL_LABEL[signal],
      evidence: emphasis.bodies.map((b) => positionLine(model.positions[b])),
      derivation: [
        `${emphasis.bodies.length} composite bodies fall in the same derived house.`,
        model.angles.note,
      ],
      interpretation: `A cluster like this puts ${HOUSE_AREA[emphasis.house]} near the centre of how this relationship spends its attention.`,
      howItShowsUp: stageWord(
        ctx,
        'One expression is that this is where most of the shared effort and most of the friction both turn up.',
        'One expression is that this is where most of the time, energy and occasional arguments end up going.',
        'This is where most of the shared attention goes.',
      ),
      doesNotMean: doesNotMeanFor({ bodies: emphasis.bodies, houses: [emphasis.house] }),
    });
  }
  for (const a of majors.slice(0, TOP_FACTOR_MAX)) {
    if (lookHere.length >= TOP_FACTOR_MAX) break;
    lookHere.push(aspectItem(a, ctx));
  }

  const themes = buildThemeFactors(model)
    .filter((b) => b.factors.length > 0)
    .map((b) => themeItem(b, ctx))
    .sort((x, y) => {
      const rank: Record<SignalLevel, number> = { strong: 0, moderate: 1, single: 2 };
      if (rank[x.signal] !== rank[y.signal]) return rank[x.signal] - rank[y.signal];
      return y.evidence.length - x.evidence.length;
    })
    .slice(0, 5);

  const reading: CompositeReading = {
    model,
    context: ctx,
    whatThisChartIs: { heading: WHAT_THIS_CHART_IS_HEADING, body: whatThisChartIs(model, ctx) },
    distinction: SYNASTRY_VS_COMPOSITE,
    lookHereFirst: lookHere.slice(0, TOP_FACTOR_MAX),
    themes,
    balance: { line: balanceLine(model), note: model.balance.note },
    housesNote: model.angles.note,
    housesAvailable: model.angles.housesAvailable,
    observations: model.observations.map((o) => o.text),
    bottomLine: bottomLineFrom(themes, ctx),
    methodNote: model.methodNote,
    signalDisclaimer: SIGNAL_DISCLAIMER,
    doesNotMeanHeading: DOES_NOT_MEAN_HEADING,
  };

  return sanitizeRelationshipDeep(reading, ctx);
}

// ── legacy adapter ───────────────────────────────────────────────────────────

/**
 * The old four-field shape, derived from the synthesis rather than from sign
 * lookup tables, so screens still on that interface do not keep their own logic.
 */
export interface LegacyCompositeInterpretation {
  sunSign: string;
  moonSign: string;
  venusSign: string;
  marsSign: string;
  relationshipStyle: string;
  emotionalCore: string;
  loveLanguage: string;
  passionStyle: string;
  challenges: string[];
  strengths: string[];
  overallTheme: string;
}

function placementSentence(model: CompositeModel, body: string): string {
  const pos = model.positions[body];
  if (!pos) return 'Not available from the stored chart data.';
  const contacts = aspectsInvolving(majorCompositeAspects(model.aspects), body).slice(0, 2);
  const base = `Composite ${body} at ${pos.label}${pos.house ? `, ${ordinalWord(pos.house)} house` : ''}: ${BODY_FUNCTION[body] ?? body} tends to be ${SIGN_TONE[pos.sign]}.`;
  return contacts.length
    ? `${base} Read with ${contacts.map((c) => `${c.fromBody} ${c.aspect} ${c.toBody} (${c.orb.toFixed(1)}°)`).join(' and ')}, which carry more weight than the sign.`
    : `${base} No close major aspect to it, so treat the sign as background rather than a headline.`;
}

export function legacyCompositeInterpretation(
  model: CompositeModel,
  reading: CompositeReading,
): LegacyCompositeInterpretation {
  const strong = reading.themes.filter((t) => t.signal === 'strong');
  const moderate = reading.themes.filter((t) => t.signal === 'moderate');

  return {
    sunSign: model.positions.Sun?.sign ?? 'Unknown',
    moonSign: model.positions.Moon?.sign ?? 'Unknown',
    venusSign: model.positions.Venus?.sign ?? 'Unknown',
    marsSign: model.positions.Mars?.sign ?? 'Unknown',
    relationshipStyle: placementSentence(model, 'Sun'),
    emotionalCore: placementSentence(model, 'Moon'),
    loveLanguage: placementSentence(model, 'Venus'),
    passionStyle: placementSentence(model, 'Mars'),
    strengths: [...strong, ...moderate].slice(0, 3).map((t) => `${t.title} (${t.signalLabel}) — ${t.evidence[0] ?? ''}`),
    challenges: reading.themes
      .flatMap((t) => (t.howItShowsUp.includes('trade-off') ? [`${t.title}: ${t.howItShowsUp.split('The trade-off').slice(1).join('The trade-off').replace(/^ ?can be/, 'watch for').trim()}`] : []))
      .slice(0, 3),
    overallTheme: reading.bottomLine,
  };
}

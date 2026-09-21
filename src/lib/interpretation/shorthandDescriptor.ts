/**
 * Shorthand Descriptor Standard
 * =============================
 *
 * Every natal surface that synthesises two or three factors (Big Three, element
 * or modality emphasis, repeated signs, house concentrations, chart-ruler
 * blends, aspect clusters, any 2-3 placement blend) must open with a SHORT
 * 1-3 word phrase describing what the combination can look like in a person,
 * and only then explain it.
 *
 * Rules enforced here:
 *  - The label is generated from the ACTUAL symbolism of the factors passed in.
 *    Nothing is keyed to a person, a name or a stored chart.
 *  - When two factors pull against each other, the label carries the tension
 *    ("Private Performer", "Grounded Rebel") instead of pretending they agree,
 *    and the card says which factor modifies which.
 *  - Vague labels ("Complex Person", "Unique Energy", "Balanced Individual")
 *    are rejected and replaced with a factor-specific phrase.
 *  - Every card ships the full eight-part pattern: label, factors, what each
 *    factor contributes, the blend, what to say out loud, how it may show up,
 *    a qualified growth edge, and the reasoning chain.
 */

export type Element = 'Fire' | 'Earth' | 'Air' | 'Water';
export type Modality = 'Cardinal' | 'Fixed' | 'Mutable';

export const SIGN_ELEMENT: Record<string, Element> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};

export const SIGN_MODALITY: Record<string, Modality> = {
  Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal',
  Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed',
  Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable',
};

/** Adjective side of a sign — the flavour it adds to another factor. */
const SIGN_ADJ: Record<string, string> = {
  Aries: 'Direct', Taurus: 'Grounded', Gemini: 'Quick', Cancer: 'Protective',
  Leo: 'Warm', Virgo: 'Precise', Libra: 'Diplomatic', Scorpio: 'Private',
  Sagittarius: 'Far-Seeing', Capricorn: 'Strategic', Aquarius: 'Independent',
  Pisces: 'Intuitive',
};

/** Role side of a sign — the kind of person it reads as. */
const SIGN_NOUN: Record<string, string> = {
  Aries: 'Starter', Taurus: 'Builder', Gemini: 'Communicator', Cancer: 'Carer',
  Leo: 'Performer', Virgo: 'Craftsperson', Libra: 'Harmonizer', Scorpio: 'Investigator',
  Sagittarius: 'Explorer', Capricorn: 'Strategist', Aquarius: 'Rebel',
  Pisces: 'Dreamer',
};

/** What a sign wants, in plain words — used for Moon (need) framing. */
const SIGN_NEED: Record<string, string> = {
  Aries: 'movement and a clear go-ahead',
  Taurus: 'steadiness and no sudden changes',
  Gemini: 'talking it through and something new to think about',
  Cancer: 'closeness and the feeling of being looked after',
  Leo: 'warmth, recognition and being genuinely seen',
  Virgo: 'order, usefulness and knowing the details are handled',
  Libra: 'fairness, company and an even atmosphere',
  Scorpio: 'privacy, honesty and knowing where they stand',
  Sagittarius: 'room to roam and a bigger picture to aim at',
  Capricorn: 'competence, structure and being taken seriously',
  Aquarius: 'space, independence and a reason that makes sense',
  Pisces: 'gentleness, quiet and time to feel things out',
};

/** How a sign approaches a situation — used for Ascendant framing. */
const SIGN_APPROACH: Record<string, string> = {
  Aries: 'goes first and adjusts afterwards',
  Taurus: 'slows the pace and checks it is solid',
  Gemini: 'asks questions and keeps things light',
  Cancer: 'reads the mood before committing',
  Leo: 'shows up with presence and warmth',
  Virgo: 'looks for what needs fixing and gets useful',
  Libra: 'weighs it, includes people and keeps it pleasant',
  Scorpio: 'watches first and gives little away',
  Sagittarius: 'says what they think and looks for the wider point',
  Capricorn: 'sizes up the task and takes it seriously',
  Aquarius: 'keeps a little distance and thinks independently',
  Pisces: 'feels the atmosphere and moves gently',
};

const ELEMENT_ADJ: Record<Element, string> = {
  Fire: 'Momentum-Driven', Earth: 'Grounded', Air: 'Idea-Driven', Water: 'Feeling-Led',
};

const ELEMENT_NOUN: Record<Element, string> = {
  Fire: 'Starter', Earth: 'Builder', Air: 'Communicator', Water: 'Sensor',
};

const MODALITY_ADJ: Record<Modality, string> = {
  Cardinal: 'Initiating', Fixed: 'Steady', Mutable: 'Adaptable',
};

const MODALITY_NOUN: Record<Modality, string> = {
  Cardinal: 'Initiator', Fixed: 'Sustainer', Mutable: 'Adapter',
};

const ELEMENT_STYLE: Record<Element, { style: string; strengths: string; needs: string; overuse: string }> = {
  Fire: {
    style: 'thinks by moving — decides fast, starts things, gets bored by long build-ups',
    strengths: 'gets things off the ground, brings energy into a room, recovers quickly from setbacks',
    needs: 'something to aim at, permission to move, and honest answers rather than careful ones',
    overuse: 'starting more than can be finished, or pushing through when slowing down would work better',
  },
  Earth: {
    style: 'thinks by handling the thing — wants proof, steps, and something usable at the end',
    strengths: 'follows through, notices what is actually broken, can be relied on over time',
    needs: 'time, a plan, and results that can be pointed at',
    overuse: 'staying with what works long after it stopped working, or measuring worth by output',
  },
  Air: {
    style: 'thinks by talking and comparing — needs to put it into words before it feels settled',
    strengths: 'explains things clearly, sees several sides, connects people and ideas',
    needs: 'mental stimulation, conversation, and a reason that makes sense',
    overuse: 'staying in the head under stress — analysing a feeling instead of feeling it',
  },
  Water: {
    style: 'reads atmosphere first — picks up mood, tone and undercurrent before content',
    strengths: 'notices what is unsaid, offers real comfort, remembers what matters to people',
    needs: 'privacy, time to process, and people who do not rush them',
    overuse: 'carrying other people\u2019s moods as if they were their own',
  },
};

const MODALITY_STYLE: Record<Modality, { style: string; strengths: string; needs: string; overuse: string }> = {
  Cardinal: {
    style: 'opens things — new phases, new projects, the first move',
    strengths: 'gets things started, takes initiative without being asked',
    needs: 'something to launch, and a say in the direction',
    overuse: 'beginning again instead of finishing what is already open',
  },
  Fixed: {
    style: 'holds things — sees a commitment through and dislikes being moved off course',
    strengths: 'stamina, loyalty, and finishing what was agreed',
    needs: 'a reason before a change, and time to adjust to it',
    overuse: 'staying with a plan past the point where changing it would be easier',
  },
  Mutable: {
    style: 'adjusts things — shifts approach as the situation changes',
    strengths: 'flexible, quick to re-read a room, good in changing conditions',
    needs: 'variety, and freedom not to be locked in too early',
    overuse: 'changing direction before any one approach has had time to work',
  },
};

/** What each body contributes — the teaching layer for the Big Three hierarchy. */
export const FACTOR_JOB: Record<string, string> = {
  Sun: 'what this person is trying to become and express at the centre',
  Moon: 'what they need emotionally, and how they react when something lands',
  Ascendant: 'how they approach life, and what people meet first',
  Mercury: 'how they think, process and put things into words',
  Venus: 'what they value, and how they relate and enjoy',
  Mars: 'how they push, act and handle wanting something',
  Jupiter: 'where they expand and take a bigger view',
  Saturn: 'where they take it seriously and build competence slowly',
  Uranus: 'where they break the pattern',
  Neptune: 'where the imagination runs, and where edges blur',
  Pluto: 'where they go deep and do not do things by halves',
  Chiron: 'a sensitive area they end up understanding well',
  NorthNode: 'the direction that stretches them',
};

export const VAGUE_LABELS = [
  'complex person', 'unique energy', 'balanced individual', 'interesting mix',
  'special soul', 'well rounded', 'well-rounded', 'mixed energy', 'core blend',
  'complicated', 'old soul',
];

export function isVagueLabel(label: string): boolean {
  const l = (label || '').trim().toLowerCase();
  if (!l) return true;
  if (VAGUE_LABELS.includes(l)) return true;
  return l.split(/\s+/).length > 3;
}

export const CONFLICTING_ELEMENTS: Array<[Element, Element]> = [
  ['Fire', 'Water'],
  ['Earth', 'Air'],
];

export function elementsConflict(a?: string | null, b?: string | null): boolean {
  if (!a || !b || a === b) return false;
  return CONFLICTING_ELEMENTS.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
}

export function modalitiesConflict(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  return (a === 'Fixed' && b === 'Mutable') || (a === 'Mutable' && b === 'Fixed');
}

/** A single factor going into a shorthand label. */
export interface DescriptorFactor {
  /** e.g. "Sun in Libra", "Air emphasis (5 placements)", "8th-house concentration". */
  label: string;
  /** What this factor's job is, in plain words. */
  contributes: string;
  /** Sign, when the factor is a placement. */
  sign?: string | null;
  /** Element / modality when the factor is an emphasis. */
  element?: Element | null;
  modality?: Modality | null;
  /** Body name, when the factor is a placement. */
  body?: string | null;
  house?: number | null;
}

export interface ShorthandCard {
  /** 1-3 words. Always present. */
  label: string;
  /** True when the label deliberately carries a tension between the factors. */
  tension: boolean;
  /** Exact placements / aspects used. */
  factors: DescriptorFactor[];
  /** What the blend becomes together — not three canned meanings pasted up. */
  blend: string;
  /** One polished sentence an astrologer can say out loud. */
  whatToSay: string;
  /** Concrete ordinary-life examples. */
  howItMayShowUp: string[];
  /** Qualified, non-pathologising. */
  growthEdge: string;
  /** "Why am I saying this?" — the evidence and the reasoning chain. */
  why: string;
}

const adj = (sign?: string | null) => (sign && SIGN_ADJ[sign]) || '';
const noun = (sign?: string | null) => (sign && SIGN_NOUN[sign]) || '';

function composeLabel(first: string, second: string, fallback: string): string {
  const out = [first, second].filter(Boolean).join(' ').trim();
  if (!out || isVagueLabel(out)) return fallback;
  return out;
}

/**
 * Generic label generator: an adjective from the modifying factor plus a role
 * noun from the leading factor. When the two conflict, the resulting phrase
 * carries that contrast on purpose ("Private Performer", "Grounded Rebel").
 */
export function shorthandLabel(
  leading: DescriptorFactor,
  modifier?: DescriptorFactor | null,
  fallbackNoun = 'Blend'
): { label: string; tension: boolean } {
  const leadNoun =
    noun(leading.sign) ||
    (leading.element ? ELEMENT_NOUN[leading.element] : '') ||
    (leading.modality ? MODALITY_NOUN[leading.modality] : '') ||
    fallbackNoun;
  const modAdj = modifier
    ? adj(modifier.sign) ||
      (modifier.element ? ELEMENT_ADJ[modifier.element] : '') ||
      (modifier.modality ? MODALITY_ADJ[modifier.modality] : '')
    : '';

  const elA = leading.element ?? (leading.sign ? SIGN_ELEMENT[leading.sign] : null);
  const elB = modifier?.element ?? (modifier?.sign ? SIGN_ELEMENT[modifier.sign] : null);
  const modA = leading.modality ?? (leading.sign ? SIGN_MODALITY[leading.sign] : null);
  const modB = modifier?.modality ?? (modifier?.sign ? SIGN_MODALITY[modifier.sign] : null);
  const tension = elementsConflict(elA, elB) || modalitiesConflict(modA, modB);

  return {
    label: composeLabel(modAdj, leadNoun, leadNoun || fallbackNoun),
    tension,
  };
}

/**
 * BIG THREE card. Teaches the hierarchy (Sun = becoming, Moon = need,
 * Ascendant = approach), then gives the combined 1-3 word descriptor and
 * explains how the rising sign changes how the inner combination presents.
 */
export function bigThreeCard(input: {
  sunSign?: string | null;
  moonSign?: string | null;
  risingSign?: string | null;
  sunHouse?: number | null;
  moonHouse?: number | null;
}): ShorthandCard | null {
  const { sunSign, moonSign, risingSign } = input;
  if (!sunSign || !SIGN_ADJ[sunSign]) return null;

  const factors: DescriptorFactor[] = [
    {
      label: `Sun in ${sunSign}${input.sunHouse ? `, house ${input.sunHouse}` : ''}`,
      contributes: FACTOR_JOB.Sun,
      sign: sunSign,
      body: 'Sun',
      house: input.sunHouse ?? null,
    },
  ];
  if (moonSign && SIGN_ADJ[moonSign]) {
    factors.push({
      label: `Moon in ${moonSign}${input.moonHouse ? `, house ${input.moonHouse}` : ''}`,
      contributes: FACTOR_JOB.Moon,
      sign: moonSign,
      body: 'Moon',
      house: input.moonHouse ?? null,
    });
  }
  if (risingSign && SIGN_ADJ[risingSign]) {
    factors.push({
      label: `${risingSign} Ascendant`,
      contributes: FACTOR_JOB.Ascendant,
      sign: risingSign,
      body: 'Ascendant',
    });
  }

  // The Sun carries the role; the Moon (or, absent a Moon, the Ascendant)
  // supplies the adjective, because it colours how that role is actually lived.
  const modifierSign = moonSign && SIGN_ADJ[moonSign] ? moonSign : risingSign;
  const { label, tension } = shorthandLabel(
    { label: `Sun in ${sunSign}`, contributes: FACTOR_JOB.Sun, sign: sunSign },
    modifierSign ? { label: `${modifierSign}`, contributes: '', sign: modifierSign } : null,
    SIGN_NOUN[sunSign]
  );

  const sameSign = moonSign === sunSign;
  const blendParts: string[] = [];
  if (moonSign) {
    blendParts.push(
      sameSign
        ? `Sun and Moon both in ${sunSign} means what this person is reaching for and what they need to feel steady point the same way — less internal argument, and less built-in contrast to fall back on.`
        : tension
          ? `${sunSign} wants to ${SIGN_APPROACH[sunSign]}, while the ${moonSign} Moon needs ${SIGN_NEED[moonSign]}. Those two do not naturally agree, so the same person can look ${adj(sunSign).toLowerCase()} in public and want something quite different in private.`
          : `The ${sunSign} centre is lived through a ${moonSign} need for ${SIGN_NEED[moonSign]}, so the drive rarely shows up raw — it comes filtered through that need.`
    );
  }
  if (risingSign && SIGN_APPROACH[risingSign]) {
    blendParts.push(
      risingSign === sunSign
        ? `${risingSign} rising matches the Sun, so what people meet first is close to what is actually there.`
        : `${risingSign} rising changes the packaging: the first approach ${SIGN_APPROACH[risingSign]}, so people can read them as ${adj(risingSign).toLowerCase()} before they ever see the ${sunSign} part.`
    );
  }

  const showUp: string[] = [];
  if (moonSign) {
    showUp.push(`Under pressure, the ${moonSign} side leads: they reach for ${SIGN_NEED[moonSign]} before they reach for a plan.`);
  }
  if (risingSign) {
    showUp.push(`On a first meeting they ${SIGN_APPROACH[risingSign]}, which is often mistaken for the whole picture.`);
  }
  showUp.push(`Given a free choice, the ${sunSign} preference shows: they ${SIGN_APPROACH[sunSign]}.`);

  return {
    label,
    tension,
    factors,
    blend: blendParts.join(' '),
    whatToSay: moonSign
      ? `At the centre you are working on being ${adj(sunSign).toLowerCase()} and ${SIGN_NOUN[sunSign].toLowerCase()}-like, but you settle only when you get ${SIGN_NEED[moonSign]}${risingSign ? `, and what people meet first is the part of you that ${SIGN_APPROACH[risingSign]}` : ''}.`
      : `At the centre you are working on being ${adj(sunSign).toLowerCase()} and ${SIGN_NOUN[sunSign].toLowerCase()}-like${risingSign ? `, and what people meet first is the part of you that ${SIGN_APPROACH[risingSign]}` : ''}.`,
    howItMayShowUp: showUp,
    growthEdge: tension
      ? `The growth edge is not picking a side. It usually helps to name the need out loud early, so the ${sunSign} drive is not read as the whole story.`
      : `Because these factors agree, the useful edge is deliberately borrowing the qualities this combination does not reach for on its own.`,
    why: `Sun in ${sunSign}${moonSign ? `, Moon in ${moonSign}` : ''}${risingSign ? `, ${risingSign} Ascendant` : ''}. Sun = ${FACTOR_JOB.Sun}; Moon = ${FACTOR_JOB.Moon}; Ascendant = ${FACTOR_JOB.Ascendant}. The label puts the Sun's role at the end and the ${modifierSign ?? 'second factor'} flavour in front, because that is the order the chart itself sets.`,
  };
}

/**
 * ELEMENT or MODALITY emphasis card. Answers "so what?": likely style,
 * strengths, needs, and one possible overuse pattern — never just a count.
 */
export function emphasisCard(input: {
  kind: 'element' | 'modality';
  value: string;
  count: number;
  total: number;
  bodies?: string[];
  /** The second-weighted element/modality, used to sharpen the label. */
  secondary?: string | null;
}): ShorthandCard | null {
  const { kind, value, count, total } = input;
  const table = kind === 'element' ? ELEMENT_STYLE : MODALITY_STYLE;
  const info = (table as Record<string, { style: string; strengths: string; needs: string; overuse: string }>)[value];
  if (!info) return null;

  const leading: DescriptorFactor =
    kind === 'element'
      ? { label: `${value} emphasis`, contributes: 'the raw material this chart works with', element: value as Element }
      : { label: `${value} emphasis`, contributes: 'how this chart handles change', modality: value as Modality };
  const modifier: DescriptorFactor | null = input.secondary
    ? kind === 'element'
      ? { label: `${input.secondary} second`, contributes: '', element: input.secondary as Element }
      : { label: `${input.secondary} second`, contributes: '', modality: input.secondary as Modality }
    : null;

  const base =
    kind === 'element'
      ? `${ELEMENT_ADJ[value as Element]} ${ELEMENT_NOUN[value as Element]}`
      : `${MODALITY_ADJ[value as Modality]} ${MODALITY_NOUN[value as Modality]}`;
  const { tension } = shorthandLabel(leading, modifier, base);

  const bodyList = input.bodies?.length ? ` (${input.bodies.join(', ')})` : '';
  const strong = count >= 4;

  return {
    label: base,
    tension,
    factors: [
      {
        label: `${count} of ${total} weighed placements in ${value}${bodyList}`,
        contributes: kind === 'element' ? 'the raw material this chart works with' : 'how this chart handles change',
        element: kind === 'element' ? (value as Element) : null,
        modality: kind === 'modality' ? (value as Modality) : null,
      },
      ...(input.secondary
        ? [
            {
              label: `${input.secondary} runs second`,
              contributes: 'the flavour the leading emphasis gets filtered through',
              element: kind === 'element' ? (input.secondary as Element) : null,
              modality: kind === 'modality' ? (input.secondary as Modality) : null,
            },
          ]
        : []),
    ],
    blend: `With ${count} of ${total} weighed placements in ${value}, this is a repeated pattern rather than one placement. In practice it ${info.style}${input.secondary ? `, and it gets filtered through a ${input.secondary} second layer` : ''}.`,
    whatToSay: `A lot of this chart sits in ${value}, so you probably ${info.style.replace(/^[a-z]+s by /, 'work things out by ')}.`,
    howItMayShowUp: [
      `Strengths: ${info.strengths}.`,
      `What tends to be needed: ${info.needs}.`,
      strong
        ? `Because ${count} placements share this, expect it in most areas rather than only one.`
        : `With ${count} placements this is a leaning, not a headline — check it before leaning on it.`,
    ],
    growthEdge: `One possible overuse pattern: ${info.overuse}. That is a tendency to watch, not a fault, and it is worth checking against their own experience.`,
    why: `${count} of ${total} weighed placements${bodyList} are ${value}${input.secondary ? `, with ${input.secondary} next` : ''}. A ${kind} emphasis is read as a repeated style because the same flavour turns up across different functions, not because any single placement is unusual.`,
  };
}

/**
 * Generic 2-3 factor blend card — used for repeated signs, house
 * concentrations, chart-ruler blends and aspect clusters.
 */
export function blendCard(input: {
  factors: DescriptorFactor[];
  /** Optional plain-language theme, used in the spoken line. */
  theme?: string;
  /** Extra evidence sentences appended to "why". */
  evidence?: string[];
  fallbackNoun?: string;
}): ShorthandCard | null {
  const factors = input.factors.filter((f) => f.label);
  if (!factors.length) return null;
  const leading = factors[0];
  const modifier = factors[1] ?? null;
  const { label, tension } = shorthandLabel(leading, modifier, input.fallbackNoun ?? 'Blend');

  const names = factors.map((f) => f.label);
  const contributions = factors.map((f) => `${f.label} = ${f.contributes}`);

  return {
    label,
    tension,
    factors,
    blend: tension
      ? `${names.join(' and ')} pull in different directions, so the combination is a working tension rather than a single note: ${modifier?.label ?? 'the second factor'} keeps modifying how ${leading.label} gets expressed.`
      : `${names.join(' and ')} point the same way, so ${leading.label} does not stand alone — ${modifier?.label ?? 'the rest of the chart'} reinforces it.`,
    whatToSay: input.theme
      ? input.theme
      : `This part of the chart reads as ${label.toLowerCase()} — it comes from ${names.join(' plus ')}.`,
    howItMayShowUp: [
      `It shows up wherever ${leading.contributes} is in play.`,
      ...(modifier ? [`${modifier.label} changes the delivery rather than the aim.`] : []),
    ],
    growthEdge: tension
      ? `Growth edge: naming which factor is driving in the moment, instead of treating the pull as a personal failing.`
      : `Growth edge: because these agree, the blind spot is usually the quality this combination does not naturally reach for.`,
    why: [`These are blended because ${contributions.join('; ')}.`, ...(input.evidence ?? [])].join(' '),
  };
}

/** Flat lines, for PDFs, exports and print. */
export function shorthandCardLines(card: ShorthandCard): string[] {
  return [
    `Shorthand: ${card.label}${card.tension ? ' (a tension, not an agreement)' : ''}`,
    `Factors: ${card.factors.map((f) => f.label).join('; ')}`,
    ...card.factors.map((f) => `${f.label} contributes ${f.contributes}`),
    `The blend: ${card.blend}`,
    `What to say: ${card.whatToSay}`,
    ...card.howItMayShowUp.map((l) => `How it may show up: ${l}`),
    `Growth edge: ${card.growthEdge}`,
    `Why am I saying this? ${card.why}`,
  ];
}

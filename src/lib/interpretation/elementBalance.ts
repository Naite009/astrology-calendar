export type ElementName = 'Fire' | 'Earth' | 'Air' | 'Water';
export type ModalityName = 'Cardinal' | 'Fixed' | 'Mutable';

export interface BalancePlacement {
  body: string;
  sign: string;
  house?: number | null;
}

export interface LightElementReading {
  element: ElementName;
  count: number;
  label: string;
  behavior: string;
  alternative: string;
  support: string;
  compensation: string;
  evidence: string;
}

export interface CombinedLightElementReading {
  elements: ElementName[];
  label: string;
  evidence: string;
  synthesis: string;
  alternative: string;
  support: string;
  compensation: string;
}

export interface ModalityBalanceReading {
  dominant: ModalityName[];
  low: ModalityName[];
  label: string;
  summary: string;
  compensation: string;
  evidence: string;
}

export interface ElementBalanceReading {
  counts: Record<ElementName, number>;
  dominant: ElementName[];
  low: ElementName[];
  individual: LightElementReading[];
  combined: CombinedLightElementReading | null;
  summary: string;
}

const ELEMENTS: ElementName[] = ['Fire', 'Earth', 'Air', 'Water'];
const MODALITIES: ModalityName[] = ['Cardinal', 'Fixed', 'Mutable'];

const ELEMENT_SIGNS: Record<ElementName, string[]> = {
  Fire: ['Aries', 'Leo', 'Sagittarius'],
  Earth: ['Taurus', 'Virgo', 'Capricorn'],
  Air: ['Gemini', 'Libra', 'Aquarius'],
  Water: ['Cancer', 'Scorpio', 'Pisces'],
};

const ELEMENT_HOUSES: Record<ElementName, number[]> = {
  Fire: [1, 5, 9], Earth: [2, 6, 10], Air: [3, 7, 11], Water: [4, 8, 12],
};

const ELEMENT_BODIES: Record<ElementName, string[]> = {
  Fire: ['Sun', 'Mars', 'Jupiter'], Earth: ['Saturn'], Air: ['Mercury', 'Uranus'], Water: ['Moon', 'Neptune'],
};

const ELEMENT_COPY: Record<ElementName, Omit<LightElementReading, 'element' | 'count' | 'compensation' | 'evidence'>> = {
  Earth: {
    label: 'Ideas Before Logistics',
    behavior: 'Practical structure may not be the first instinct. An idea, feeling, or possibility can arrive before the schedule, steps, money, materials, or follow-through have been checked.',
    alternative: 'The person may lead with thinking, feeling, or enthusiasm, then work out how to make it concrete.',
    support: 'Visible plans can help: calendars, lists, deadlines, routines, budgets, and a clear next step.',
  },
  Water: {
    label: 'Feelings Process Later',
    behavior: 'Feelings may not be the first thing noticed or expressed. The person may explain, analyze, act, joke, organize, or move on before naming an emotional response.',
    alternative: 'Emotional depth can still be strong, but it may be private, selective, or understood after some time has passed.',
    support: 'Quiet time, a feeling word, journaling, music, or one trusted person can make the emotional information easier to recognize.',
  },
  Fire: {
    label: 'Purpose Before Action',
    behavior: 'Enthusiasm may be less likely to appear as instant confidence or a quick “just go for it” response.',
    alternative: 'The person may wait for a reason, plan, invitation, deadline, or outside spark before starting, then rely on persistence or responsibility once engaged.',
    support: 'A meaningful reason, encouragement, movement, and one manageable first step can help create momentum.',
  },
  Air: {
    label: 'Knowing Before Words',
    behavior: 'The person may know something before being able to explain it clearly, especially when asked for an immediate answer.',
    alternative: 'They may rely more on feeling, direct experience, instinct, action, or concrete evidence than on talking through every possibility.',
    support: 'Writing, time to think, a diagram, or a trusted person to bounce ideas off can help turn the knowing into words.',
  },
};

const DOMINANT_ALTERNATIVE: Record<ElementName, string> = {
  Fire: 'action, enthusiasm, or a clear desire',
  Earth: 'practical facts, routines, and what can be done now',
  Air: 'thinking, explaining, comparing, or talking it through',
  Water: 'feeling, atmosphere, trust, and private reflection',
};

const COMBINED_LABELS: Record<string, string> = {
  'Earth|Water': 'Ideas Before Grounding',
  'Air|Earth': 'Instinct Before Explanation',
  'Earth|Fire': 'Response Before Launch',
  'Air|Water': 'Action Before Processing',
  'Fire|Water': 'Thought Before Reaction',
  'Air|Fire': 'Steady Before Spontaneous',
};

const MODALITY_COPY: Record<ModalityName, { dominant: string; low: string; support: string }> = {
  Cardinal: {
    dominant: 'Starting is often easier than waiting. The person may propose the plan, make the first move, or change direction when a situation stalls.',
    low: 'Starting from a blank page may take longer. The person may respond well once there is a request, deadline, model, or clear reason to begin.',
    support: 'A defined first step, permission to choose a direction, or another person opening the door can help.',
  },
  Fixed: {
    dominant: 'Staying with a choice is often easier than changing it. The person may protect commitments, repeat what works, and carry a project through the long middle.',
    low: 'Holding one course through boredom, delay, or pressure may take more effort. The person may revise, restart, or move on before a method has had time to work.',
    support: 'Fewer active priorities, visible progress, and a reason to keep going can strengthen follow-through.',
  },
  Mutable: {
    dominant: 'Adjusting is often easier than forcing one fixed plan. The person may notice new information quickly, improvise, and change method when conditions shift.',
    low: 'Changing plans midstream may not be the first response. The person may prefer to decide, commit, and keep going until there is a concrete reason to revise.',
    support: 'Advance notice, two workable options, and time to test a change can make flexibility easier.',
  },
};

function normalizeCounts<T extends string>(names: T[], counts: Record<string, number>): Record<T, number> {
  return Object.fromEntries(names.map((name) => [name, Number(counts[name] ?? 0)])) as Record<T, number>;
}

function list(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function houseLabel(house: number): string {
  const mod100 = house % 100;
  const suffix = mod100 >= 11 && mod100 <= 13 ? 'th' : house % 10 === 1 ? 'st' : house % 10 === 2 ? 'nd' : house % 10 === 3 ? 'rd' : 'th';
  return `${house}${suffix}`;
}

function compensationForElement(element: ElementName, placements: BalancePlacement[]): string {
  const evidence: string[] = [];
  const signHits = placements.filter((p) => ELEMENT_SIGNS[element].includes(p.sign));
  const houseHits = placements.filter((p) => p.house && ELEMENT_HOUSES[element].includes(p.house));
  const angularBodies = placements.filter((p) => ELEMENT_BODIES[element].includes(p.body) && p.house && [1, 4, 7, 10].includes(p.house));
  if (angularBodies.length) evidence.push(`${list(angularBodies.map((p) => `${p.body} in the ${houseLabel(p.house ?? 0)} house`))} gives the related function extra visibility`);
  if (signHits.length) evidence.push(`${list(signHits.map((p) => `${p.body} in ${p.sign}`))} carries ${element.toLowerCase()} style directly`);
  const houseGroups = ELEMENT_HOUSES[element]
    .map((house) => ({ house, bodies: houseHits.filter((p) => p.house === house).map((p) => p.body) }))
    .filter((group) => group.bodies.length >= 2);
  if (houseGroups.length) evidence.push(`${list(houseGroups.map((g) => `${g.bodies.join(' and ')} in the ${houseLabel(g.house)} house`))} repeats related real-life concerns`);
  if (!evidence.length) return `No strong ${element.toLowerCase()} compensation stands out from the associated signs, planets, or houses, so practical supports may matter more.`;
  return `The low count is modified by ${evidence.join('; ')}. This means the quality may be available through those specific parts of the chart even if it is not the default response.`;
}

function lowNames<T extends string>(names: T[], counts: Record<T, number>): T[] {
  const max = Math.max(...names.map((name) => counts[name]));
  return names.filter((name) => counts[name] <= 2 && counts[name] < max - 1).sort((a, b) => counts[a] - counts[b]);
}

export function buildElementBalanceReading(
  rawCounts: Record<string, number>,
  placements: BalancePlacement[],
): ElementBalanceReading {
  const counts = normalizeCounts(ELEMENTS, rawCounts);
  const max = Math.max(...Object.values(counts));
  const dominant = ELEMENTS.filter((element) => counts[element] === max);
  const low = lowNames(ELEMENTS, counts);
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const individual = low.map((element): LightElementReading => ({
    element,
    count: counts[element],
    ...ELEMENT_COPY[element],
    compensation: compensationForElement(element, placements),
    evidence: `${element} has ${counts[element]} of ${total} counted placements.`,
  }));
  const paired = low.slice(0, 2);
  const combined = paired.length === 2 ? (() => {
    const key = [...paired].sort().join('|');
    const dominantText = dominant.map((element) => DOMINANT_ALTERNATIVE[element]).join(' and ');
    return {
      elements: paired,
      label: COMBINED_LABELS[key] ?? `${paired[0]} + ${paired[1]} Light`,
      evidence: `${paired[0]} ${counts[paired[0]]} · ${paired[1]} ${counts[paired[1]]}`,
      synthesis: `${ELEMENT_COPY[paired[0]].behavior} ${ELEMENT_COPY[paired[1]].behavior}`,
      alternative: dominant.length === 1
        ? `With ${dominant[0]} leading, the person may use ${dominantText} first. They may decide through that channel before checking both ${paired[0].toLowerCase()} and ${paired[1].toLowerCase()} information.`
        : `The stronger channels are ${dominant.join(' and ')}, so the person may use ${dominantText} before checking both ${paired[0].toLowerCase()} and ${paired[1].toLowerCase()} information.`,
      support: `What can balance this: ${ELEMENT_COPY[paired[0]].support} ${ELEMENT_COPY[paired[1]].support}`,
      compensation: individual.map((reading) => reading.compensation).join(' '),
    };
  })() : null;
  const lead = dominant.length === 1
    ? `${dominant[0]} leads, so ${DOMINANT_ALTERNATIVE[dominant[0]]} is often the first channel used.`
    : `${dominant.join(' and ')} are tied, so there is no single default processing channel.`;
  const lowSummary = combined
    ? `${combined.label}: ${combined.synthesis} ${combined.alternative} ${combined.support} ${combined.compensation}`
    : individual[0]
      ? `${individual[0].label}: ${individual[0].behavior} ${individual[0].alternative} ${individual[0].support} ${individual[0].compensation}`
      : 'No element is lightly represented enough to treat as a separate pattern.';
  return { counts, dominant, low, individual, combined, summary: `${lead} ${lowSummary}` };
}

function compensationForModality(modality: ModalityName, placements: BalancePlacement[]): string {
  const signs = modality === 'Cardinal'
    ? ['Aries', 'Cancer', 'Libra', 'Capricorn']
    : modality === 'Fixed'
      ? ['Taurus', 'Leo', 'Scorpio', 'Aquarius']
      : ['Gemini', 'Virgo', 'Sagittarius', 'Pisces'];
  const houses = modality === 'Cardinal' ? [1, 4, 7, 10] : modality === 'Fixed' ? [2, 5, 8, 11] : [3, 6, 9, 12];
  const relevant = placements.filter((p) => signs.includes(p.sign) || (p.house ? houses.includes(p.house) : false));
  if (!relevant.length) return `No strong ${modality.toLowerCase()} compensation stands out in the related signs or houses.`;
  return `What may compensate: ${list(relevant.slice(0, 4).map((p) => `${p.body} in ${p.sign}${p.house ? `, house ${p.house}` : ''}`))} can provide this behavior in specific situations.`;
}

export function buildModalityBalanceReading(
  rawCounts: Record<string, number>,
  placements: BalancePlacement[],
): ModalityBalanceReading {
  const counts = normalizeCounts(MODALITIES, rawCounts);
  const max = Math.max(...Object.values(counts));
  const min = Math.min(...Object.values(counts));
  const dominant = MODALITIES.filter((modality) => counts[modality] === max);
  const low = MODALITIES.filter((modality) => counts[modality] === min && counts[modality] <= 1);
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const lead = dominant.length === 1
    ? MODALITY_COPY[dominant[0]].dominant
    : `${dominant.join(' and ')} are tied, so the person can both ${dominant.map((m) => m === 'Cardinal' ? 'start' : m === 'Fixed' ? 'sustain' : 'adjust').join(' and ')} depending on the situation.`;
  const lowText = low.map((modality) => `${MODALITY_COPY[modality].low} ${MODALITY_COPY[modality].support}`).join(' ');
  const compensation = low.map((modality) => compensationForModality(modality, placements)).join(' ');
  return {
    dominant,
    low,
    label: dominant.length === 1 ? `${dominant[0]} Leads` : `${dominant.join(' + ')} Balance`,
    summary: `${lead}${lowText ? ` ${lowText}` : ''}`,
    compensation,
    evidence: `${MODALITIES.map((modality) => `${modality} ${counts[modality]}`).join(' · ')} (${total} counted placements).`,
  };
}
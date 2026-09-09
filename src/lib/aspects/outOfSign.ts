/**
 * CANONICAL sign-vs-degree ("out of sign") aspect analysis.
 *
 * An aspect is geometric: it exists because two bodies are a certain number of
 * degrees apart. Sign symbolism is a separate layer. When a body is near the
 * start or end of a sign, the two layers can disagree — e.g. 28°42' Taurus and
 * 1°17' Aquarius are ~117°25' apart (a valid trine within orb) even though
 * Taurus and Aquarius are square by sign, Earth vs Air, both fixed.
 *
 * Rules enforced here:
 *  - Never flatten to "trine = harmony" when the signs disagree.
 *  - Always report the real degrees, the real separation, the sign-to-sign
 *    relationship (with element / modality contrast), and a synthesis that
 *    keeps BOTH truths.
 *  - Generic for any pair of bodies, any aspect, natal or synastry. No
 *    hard-coded pairs.
 */

export const ZODIAC_ORDER = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

export type ZodiacSign = (typeof ZODIAC_ORDER)[number];
export type Element = 'Fire' | 'Earth' | 'Air' | 'Water';
export type Modality = 'Cardinal' | 'Fixed' | 'Mutable';

export const SIGN_ELEMENT: Record<string, Element> = {
  Aries: 'Fire',
  Leo: 'Fire',
  Sagittarius: 'Fire',
  Taurus: 'Earth',
  Virgo: 'Earth',
  Capricorn: 'Earth',
  Gemini: 'Air',
  Libra: 'Air',
  Aquarius: 'Air',
  Cancer: 'Water',
  Scorpio: 'Water',
  Pisces: 'Water',
};

export const SIGN_MODALITY: Record<string, Modality> = {
  Aries: 'Cardinal',
  Cancer: 'Cardinal',
  Libra: 'Cardinal',
  Capricorn: 'Cardinal',
  Taurus: 'Fixed',
  Leo: 'Fixed',
  Scorpio: 'Fixed',
  Aquarius: 'Fixed',
  Gemini: 'Mutable',
  Virgo: 'Mutable',
  Sagittarius: 'Mutable',
  Pisces: 'Mutable',
};

/** Short keyword pair per sign, used only for the sign-layer sentence. */
const SIGN_KEYWORD: Record<string, string> = {
  Aries: 'directness and initiative',
  Taurus: 'stability and steadiness',
  Gemini: 'curiosity and variety',
  Cancer: 'closeness and protectiveness',
  Leo: 'visibility and warmth',
  Virgo: 'precision and usefulness',
  Libra: 'fairness and harmony',
  Scorpio: 'depth and privacy',
  Sagittarius: 'freedom and big-picture thinking',
  Capricorn: 'structure and long-term effort',
  Aquarius: 'independence and originality',
  Pisces: 'sensitivity and imagination',
};

/** Aspect name for a whole-sign distance of 0..6 signs. */
const SIGN_DISTANCE_ASPECT: Record<number, { name: string; angle: number; tone: 'flowing' | 'tense' | 'fusion' | 'adjusting' }> = {
  0: { name: 'conjunction', angle: 0, tone: 'fusion' },
  1: { name: 'semisextile', angle: 30, tone: 'adjusting' },
  2: { name: 'sextile', angle: 60, tone: 'flowing' },
  3: { name: 'square', angle: 90, tone: 'tense' },
  4: { name: 'trine', angle: 120, tone: 'flowing' },
  5: { name: 'quincunx', angle: 150, tone: 'adjusting' },
  6: { name: 'opposition', angle: 180, tone: 'tense' },
};

export interface SignVsDegreeInput {
  /** Display label for body A, e.g. "Ava's Sun" or "Sun". */
  labelA: string;
  signA: string;
  /** Degree within the sign (0-29). */
  degreeA: number;
  minutesA?: number;
  labelB: string;
  signB: string;
  degreeB: number;
  minutesB?: number;
  /** Aspect name actually found by degree geometry. */
  aspect: string;
  /** Exact angle of that aspect (0/60/90/120/180…). */
  aspectAngle: number;
  /** Actual angular separation in degrees (optional; derived when absent). */
  separation?: number;
  /** Distance from exact, in degrees (optional; derived when absent). */
  orb?: number;
}

export interface SignVsDegreeAnalysis {
  /** True when the sign-to-sign relationship is not the aspect found by degree. */
  isOutOfSign: boolean;
  /** UI badge text, or null when the layers agree. */
  badge: 'Out of sign' | null;
  /** "Ava's Sun 28°42' Taurus / Max's Sun 1°17' Aquarius" */
  positionsLine: string;
  positionA: string;
  positionB: string;
  /** "trine, 117°25' apart, 2°35' from exact 120°" */
  aspectLine: string;
  /** "By sign: …" */
  signLine: string;
  /** "By degree: …" */
  degreeLine: string;
  /** "Synthesis: …" */
  synthesisLine: string;
  /** Aspect the signs alone would make. */
  signAspect: string;
  signAspectAngle: number;
  sameElement: boolean;
  sameModality: boolean;
  elementA: Element | null;
  elementB: Element | null;
  modalityA: Modality | null;
  modalityB: Modality | null;
  /** Flat lines for PDFs / exports. */
  lines: string[];
}

function signIndex(sign: string): number {
  return ZODIAC_ORDER.indexOf((sign || '').trim() as ZodiacSign);
}

/** 12°34' style formatting from a decimal degree-in-sign plus optional minutes. */
export function formatDegreeMinutes(degree: number, minutes?: number): string {
  const total = (Number(degree) || 0) + (Number(minutes) || 0) / 60;
  let deg = Math.floor(total);
  let min = Math.round((total - deg) * 60);
  if (min === 60) {
    deg += 1;
    min = 0;
  }
  return `${deg}°${String(min).padStart(2, '0')}'`;
}

/** Decimal degrees → "2°35'". */
export function formatArc(degrees: number): string {
  const abs = Math.abs(Number(degrees) || 0);
  return formatDegreeMinutes(Math.floor(abs), Math.round((abs - Math.floor(abs)) * 60));
}

function longitudeOf(sign: string, degree: number, minutes?: number): number {
  const idx = signIndex(sign);
  const within = (Number(degree) || 0) + (Number(minutes) || 0) / 60;
  return (idx < 0 ? 0 : idx * 30) + within;
}

function angularSeparation(a: number, b: number): number {
  let diff = Math.abs(a - b) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

function contrastPhrase(
  signA: string,
  signB: string,
  elementA: Element | null,
  elementB: Element | null,
  modalityA: Modality | null,
  modalityB: Modality | null
): string {
  const parts: string[] = [];
  if (elementA && elementB) {
    parts.push(elementA === elementB ? `both ${elementA}` : `${elementA} vs ${elementB}`);
  }
  const kwA = SIGN_KEYWORD[signA];
  const kwB = SIGN_KEYWORD[signB];
  if (kwA && kwB) parts.push(kwA === kwB ? kwA : `${kwA} vs ${kwB}`);
  if (modalityA && modalityB) {
    parts.push(modalityA === modalityB ? `both ${modalityA.toLowerCase()}` : `${modalityA.toLowerCase()} vs ${modalityB.toLowerCase()}`);
  }
  return parts.join(', ');
}

const SIGN_RELATION_STYLE: Record<string, string> = {
  conjunction: 'same-sign blending',
  semisextile: 'slightly-off, adjusting',
  sextile: 'easy, cooperative',
  square: 'square-style tension',
  trine: 'flowing, same-element ease',
  quincunx: 'awkward, hard-to-compare',
  opposition: 'opposite-ends pull',
};

const DEGREE_TONE_NOTE: Record<string, string> = {
  conjunction: 'the two work as one unit whether or not the signs match',
  sextile: 'there is a workable, low-effort channel between them',
  trine: 'the geometry supports ease and mutual appreciation',
  square: 'the geometry creates friction that asks for adjustment',
  opposition: 'the geometry sets up a see-saw that needs balancing',
  quincunx: 'the geometry is genuinely awkward to reconcile',
  semisextile: 'the geometry nudges rather than pushes',
};

/**
 * Compare the sign layer against the degree layer for one aspect.
 * Works for natal aspects and cross-chart (synastry) contacts alike.
 */
export function analyzeSignVsDegree(input: SignVsDegreeInput): SignVsDegreeAnalysis {
  const lonA = longitudeOf(input.signA, input.degreeA, input.minutesA);
  const lonB = longitudeOf(input.signB, input.degreeB, input.minutesB);
  const separation = input.separation ?? angularSeparation(lonA, lonB);
  const orb = input.orb ?? Math.abs(separation - input.aspectAngle);

  const idxA = signIndex(input.signA);
  const idxB = signIndex(input.signB);
  let signDistance = idxA >= 0 && idxB >= 0 ? Math.abs(idxA - idxB) % 12 : 0;
  if (signDistance > 6) signDistance = 12 - signDistance;
  const signRel = SIGN_DISTANCE_ASPECT[signDistance] ?? SIGN_DISTANCE_ASPECT[0];

  const elementA = SIGN_ELEMENT[input.signA] ?? null;
  const elementB = SIGN_ELEMENT[input.signB] ?? null;
  const modalityA = SIGN_MODALITY[input.signA] ?? null;
  const modalityB = SIGN_MODALITY[input.signB] ?? null;

  const isOutOfSign = idxA >= 0 && idxB >= 0 && signRel.angle !== input.aspectAngle;

  const positionA = `${input.labelA} ${formatDegreeMinutes(input.degreeA, input.minutesA)} ${input.signA}`;
  const positionB = `${input.labelB} ${formatDegreeMinutes(input.degreeB, input.minutesB)} ${input.signB}`;
  const positionsLine = `${positionA} · ${positionB}`;

  const aspectLine = `${input.aspect}, ${formatArc(separation)} apart, ${formatArc(orb)} from an exact ${input.aspectAngle}°`;

  const contrast = contrastPhrase(input.signA, input.signB, elementA, elementB, modalityA, modalityB);
  const relStyle = SIGN_RELATION_STYLE[signRel.name] ?? signRel.name;
  const signLine =
    idxA >= 0 && idxB >= 0
      ? `By sign: ${input.signA}–${input.signB} is a ${relStyle} pairing${contrast ? `: ${contrast}` : ''}.`
      : `By sign: sign data incomplete, so only the degree layer is reliable here.`;

  const degreeNote = DEGREE_TONE_NOTE[input.aspect] ?? 'the geometry is what creates the contact';
  const degreeLine = `By degree: the two are about ${formatArc(separation)} apart, only ${formatArc(
    orb
  )} from an exact ${input.aspectAngle}° ${input.aspect}, so ${degreeNote}.`;

  const easyDegree = input.aspect === 'trine' || input.aspect === 'sextile' || input.aspect === 'conjunction';
  const easySign = signRel.name === 'trine' || signRel.name === 'sextile' || signRel.name === 'conjunction';

  let synthesisLine: string;
  if (!isOutOfSign) {
    synthesisLine = `Synthesis: the sign pairing and the degree geometry agree here, so this reads the same on both layers.`;
  } else if (easyDegree && !easySign) {
    synthesisLine = `Synthesis: the geometry is more supportive than the sign pairing alone suggests, so these two parts may get along or appreciate each other more easily than a ${signRel.name}-by-sign reading would imply. The ${input.signA}/${input.signB} difference (${contrast}) is still real and can show up in style and pace.`;
  } else if (!easyDegree && easySign) {
    synthesisLine = `Synthesis: the signs share a comfortable relationship, but the degrees form a ${input.aspect}, so the friction is real even though the two signs seem compatible on paper. Expect familiarity plus a genuine point of adjustment.`;
  } else {
    synthesisLine = `Synthesis: the degree aspect (${input.aspect}) and the sign relationship (${signRel.name} by sign) describe different things at once, so hold both: the geometry sets the contact, the signs colour how it feels.`;
  }

  const lines = [
    positionsLine,
    `Aspect: ${aspectLine}${isOutOfSign ? ' — OUT OF SIGN' : ''}`,
    signLine,
    degreeLine,
    synthesisLine,
  ];

  return {
    isOutOfSign,
    badge: isOutOfSign ? 'Out of sign' : null,
    positionsLine,
    positionA,
    positionB,
    aspectLine,
    signLine,
    degreeLine,
    synthesisLine,
    signAspect: signRel.name,
    signAspectAngle: signRel.angle,
    sameElement: !!elementA && elementA === elementB,
    sameModality: !!modalityA && modalityA === modalityB,
    elementA,
    elementB,
    modalityA,
    modalityB,
    lines,
  };
}

/** Convenience: is this contact out of sign, without building the full text? */
export function isOutOfSignAspect(
  signA: string,
  signB: string,
  aspectAngle: number
): boolean {
  const idxA = signIndex(signA);
  const idxB = signIndex(signB);
  if (idxA < 0 || idxB < 0) return false;
  let d = Math.abs(idxA - idxB) % 12;
  if (d > 6) d = 12 - d;
  return (SIGN_DISTANCE_ASPECT[d]?.angle ?? 0) !== aspectAngle;
}

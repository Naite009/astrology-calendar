/**
 * CANONICAL directional synastry interpretation.
 *
 * Every relationship surface must answer "who feels what?". A contact between
 * two charts is not symmetrical: the person who owns the Venus experiences it
 * differently from the person who owns the Pluto. This module turns a
 * `CrossAspect` into an explicit two-sided, stage-appropriate description.
 *
 * Rules enforced here:
 *  - Both roles are always named, with the exact aspect and orb attached.
 *  - Wording is possibility-shaped ("may", "can"), never a verdict.
 *  - Teen / child stages get age-appropriate vocabulary (attraction, strong
 *    interest, intensity, pacing) and never sexualised, dominance/surrender or
 *    obsession language.
 */

import type { CrossAspect } from './synastryEngine';
import type { RelationshipContext } from './relationshipContext';
import type { AgeStage } from '@/lib/readingGuide/ageContext';

export interface DirectionalRole {
  owner: string;
  body: string;
  /** "Ava is the Venus person here" */
  roleLine: string;
  /** What that person is more likely to feel, phrased as a possibility. */
  feels: string;
}

export interface DirectionalContact {
  /** "Ava's Venus trine Max's Pluto" */
  aspectLine: string;
  /** "orb 1.2° (allowance 6°)" */
  orbLine: string;
  /** "Ava's Venus 5°12' Taurus · Max's Pluto 6°30' Capricorn" */
  positionsLine: string;
  a: DirectionalRole;
  b: DirectionalRole;
  worksWell: string;
  growthEdge: string;
  /** One plain-English line. */
  summary: string;
  /** True when the sign relationship is not the aspect the degrees make. */
  isOutOfSign: boolean;
  /** "Out of sign" or null. */
  badge: string | null;
  /** "By sign: …" */
  signLine: string;
  /** "By degree: …" */
  degreeLine: string;
  /** "Synthesis: …" holding both layers. */
  synthesisLine: string;
}


type Feel = { role: string; adult: string; teen: string; child: string };

/**
 * What owning this body tends to feel like when someone else's planet contacts it.
 * Deliberately behavioural, never a personality verdict.
 */
const BODY_ROLE: Record<string, Feel> = {
  Sun: {
    role: 'Sun person',
    adult: 'may feel seen, recognised, or challenged in who they are and how they want to show up',
    teen: 'may feel noticed for who they actually are, encouraged, or sometimes put on the spot',
    child: 'may feel noticed and encouraged for being themselves',
  },
  Moon: {
    role: 'Moon person',
    adult: 'may feel emotionally affected quickly, either comforted or unsettled, and notices the other\u2019s mood early',
    teen: 'may feel things quickly around the other person, comforted when it goes well and easily thrown off when it does not',
    child: 'may pick up on the other person\u2019s mood fast and feel it in their own',
  },
  Mercury: {
    role: 'Mercury person',
    adult: 'may feel mentally engaged, keen to explain and be understood in detail',
    teen: 'may feel like talking more, explaining things, or wanting to be understood exactly',
    child: 'may want to talk, ask questions and be listened to',
  },
  Venus: {
    role: 'Venus person',
    adult: 'may feel drawn in, valued, and affected in how they relate, give affection and read what is appealing',
    teen: 'may feel strongly drawn to the other person, flattered or valued, and more affected than usual in how they like and relate to someone',
    child: 'may feel fond of the other person and want their approval',
  },
  Mars: {
    role: 'Mars person',
    adult: 'may feel activated: keener to act, pursue, compete or push',
    teen: 'may feel more energised, more up for teasing or competing, and quicker to react',
    child: 'may feel more excitable and quicker to react around them',
  },
  Jupiter: {
    role: 'Jupiter person',
    adult: 'may feel generous and encouraging toward the other, sometimes promising more than is practical',
    teen: 'may feel like hyping the other person up and being optimistic about them',
    child: 'may feel cheerful and generous around them',
  },
  Saturn: {
    role: 'Saturn person',
    adult: 'may feel responsible for keeping things realistic, and can slip into correcting or holding back',
    teen: 'may feel like the sensible one, holding limits or pointing out what is fair',
    child: 'may feel like the one keeping to the rules',
  },
  Uranus: {
    role: 'Uranus person',
    adult: 'may feel restless for change or freedom, and can be unpredictable in how much closeness they want',
    teen: 'may feel like shaking things up, or want space one day and closeness the next',
    child: 'may feel like doing things a different way than expected',
  },
  Neptune: {
    role: 'Neptune person',
    adult: 'may feel idealising or merged, seeing the other\u2019s potential more clearly than the details',
    teen: 'may build a picture of the other person that is a little rosier than the day-to-day reality',
    child: 'may imagine the other person as better than anyone else',
  },
  Pluto: {
    role: 'Pluto person',
    adult: 'may feel unusually focused and invested, fascinated by the other and reluctant to let the connection stay light',
    teen: 'may feel unusually focused on the other person, fascinated and strongly invested, so it rarely feels casual',
    child: 'may feel very attached and think about them a lot',
  },
  Ascendant: {
    role: 'Ascendant person',
    adult: 'may feel personally involved, as if the contact touches how they come across day to day',
    teen: 'may feel it personally, in how they act around the other person',
    child: 'may act differently when the other person is around',
  },
  Midheaven: {
    role: 'Midheaven person',
    adult: 'may feel the connection touching their direction, reputation or ambitions',
    teen: 'may feel the connection touching school, goals or how they are seen by others',
    child: 'may feel the connection touching what they want to be good at',
  },
  NorthNode: {
    role: 'North Node person',
    adult: 'may feel nudged slightly outside their usual range (symbolic reading, not a fact about either life)',
    teen: 'may feel gently stretched into something a bit new (symbolic reading only)',
    child: 'may try something a bit new around them (symbolic reading only)',
  },
  SouthNode: {
    role: 'South Node person',
    adult: 'may feel a familiar, easy pull toward what they already know (symbolic reading only)',
    teen: 'may feel comfortable fast, in a familiar sort of way (symbolic reading only)',
    child: 'may feel comfortable with them very quickly (symbolic reading only)',
  },
  Chiron: {
    role: 'Chiron person',
    adult: 'may feel a tender spot touched, and can be unusually understanding about the same thing in the other',
    teen: 'may feel a soft spot touched, and can be very understanding about it in return',
    child: 'may feel a sensitive spot, and needs gentleness there',
  },
};

const FALLBACK: Feel = {
  role: 'contact person',
  adult: 'may feel this contact in how they engage with the other',
  teen: 'may notice this in how they act around the other',
  child: 'may notice this around the other person',
};

function feelFor(body: string, stage: AgeStage): { role: string; feels: string } {
  const f = BODY_ROLE[body] ?? FALLBACK;
  const feels = stage === 'adult' ? f.adult : stage === 'teen' ? f.teen : f.child;
  return { role: f.role, feels };
}

const ASPECT_PHRASE: Record<string, string> = {
  conjunction: 'sits right on top of',
  trine: 'flows easily with',
  sextile: 'opens a workable channel with',
  square: 'pulls against',
  opposition: 'sits opposite',
  quincunx: 'sits awkwardly with',
  semisextile: 'sits just off',
};

/** Build the explicit two-sided description of one contact. */
export function describeDirectionalContact(
  a: CrossAspect,
  ctx: RelationshipContext
): DirectionalContact {
  const stage: AgeStage = ctx.stage;
  const tense = a.tone === 'tense' || a.tone === 'adjusting';
  const fa = feelFor(a.fromBody, stage);
  const fb = feelFor(a.toBody, stage);

  const layers = a.signVsDegree;
  const aspectLine = `${a.fromOwner}'s ${a.fromBody} ${a.aspect} ${a.toOwner}'s ${a.toBody}${
    layers?.isOutOfSign ? ' (out of sign)' : ''
  }`;
  const orbLine = `orb ${a.orb.toFixed(1)}° (allowance ${a.maxOrb}° for these bodies, exact angle ${a.aspectAngle}°)`;

  const worksWell = tense
    ? `At its best, the difference is useful: ${a.fromOwner} brings the ${a.fromBody} side and ${a.toOwner} brings the ${a.toBody} side, and naming that out loud turns the pull into something they can work with.`
    : `At its best, ${a.fromOwner}'s ${a.fromBody} and ${a.toOwner}'s ${a.toBody} reinforce each other, so this part of the connection tends to feel natural rather than effortful.`;

  const growthEdge = tense
    ? `Under strain the same contact can feel like ${a.fromOwner} pushing and ${a.toOwner} bracing, or the reverse. It is a tendency in this pairing, not a fault in either of them.`
    : `Because it comes easily, both can lean on it and skip the conversation. It helps to check that what feels obvious to one is actually landing for the other.`;

  const summaryVerb = ASPECT_PHRASE[a.aspect] ?? 'contacts';
  const oosNote = layers?.isOutOfSign
    ? ` The signs (${a.fromSign}–${a.toSign}) do not match that aspect, so read both layers rather than the aspect name alone.`
    : '';
  const summary = `${a.fromOwner}'s ${a.fromBody} ${summaryVerb} ${a.toOwner}'s ${a.toBody}, so ${a.fromOwner} ${fa.feels.split(',')[0]} while ${a.toOwner} ${fb.feels.split(',')[0]}.${oosNote}`;

  return {
    aspectLine,
    orbLine,
    positionsLine: layers?.positionsLine ?? '',
    a: {
      owner: a.fromOwner,
      body: a.fromBody,
      roleLine: `${a.fromOwner} is the ${fa.role} here`,
      feels: `${a.fromOwner} ${fa.feels}.`,
    },
    b: {
      owner: a.toOwner,
      body: a.toBody,
      roleLine: `${a.toOwner} is the ${fb.role} here`,
      feels: `${a.toOwner} ${fb.feels}.`,
    },
    worksWell,
    growthEdge,
    summary,
    isOutOfSign: !!layers?.isOutOfSign,
    badge: layers?.badge ?? null,
    signLine: layers?.signLine ?? '',
    degreeLine: layers?.degreeLine ?? '',
    synthesisLine: layers?.synthesisLine ?? '',
  };
}

/** Flat evidence lines, for exports and PDFs that cannot render the card. */
export function directionalEvidenceLines(d: DirectionalContact): string[] {
  return [
    d.positionsLine ? `Positions: ${d.positionsLine}` : '',
    `${d.aspectLine} — ${d.orbLine}`,
    d.isOutOfSign ? 'OUT OF SIGN: the sign relationship and the degree aspect disagree.' : '',
    d.signLine,
    d.degreeLine,
    d.synthesisLine,
    `${d.a.roleLine}: ${d.a.feels}`,
    `${d.b.roleLine}: ${d.b.feels}`,
    `How it can work well: ${d.worksWell}`,
    `Possible friction / growth edge: ${d.growthEdge}`,
    `In one line: ${d.summary}`,
  ].filter(Boolean);
}


/** Aspect angles used when building a directional description from loose parts. */
const ASPECT_ANGLE: Record<string, number> = {
  conjunction: 0,
  conjunct: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180,
  quincunx: 150,
  semisextile: 30,
};

/**
 * Same directional output, for legacy surfaces that only hold loose parts
 * (planet names + orb) rather than a full CrossAspect.
 */
export function describeDirectionalFromParts(
  parts: {
    fromOwner: string;
    fromBody: string;
    toOwner: string;
    toBody: string;
    aspect: string;
    orb?: number;
    maxOrb?: number;
  },
  ctx: RelationshipContext
): DirectionalContact {
  const aspect = parts.aspect === 'conjunct' ? 'conjunction' : parts.aspect;
  const angle = ASPECT_ANGLE[aspect] ?? 0;
  const tone =
    aspect === 'square' || aspect === 'opposition'
      ? 'tense'
      : aspect === 'conjunction'
        ? 'fusion'
        : aspect === 'quincunx' || aspect === 'semisextile'
          ? 'adjusting'
          : 'flowing';
  const pseudo = {
    fromOwner: parts.fromOwner,
    fromBody: parts.fromBody,
    toOwner: parts.toOwner,
    toBody: parts.toBody,
    aspect,
    symbol: '',
    aspectAngle: angle,
    separation: angle,
    orb: parts.orb ?? 0,
    maxOrb: parts.maxOrb ?? 6,
    closeness: 1,
    tone,
    weight: 0.5,
    isCoreContact: true,
    label: '',
  } as CrossAspect;
  return describeDirectionalContact(pseudo, ctx);
}

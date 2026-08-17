/**
 * Plain-English meaning layer for the Vedic tab.
 *
 * Rules this file exists to enforce:
 *  - Every Sanskrit or technical term gets an immediate plain definition.
 *  - Copy describes tendencies, motivations, strengths and tensions.
 *  - Copy never invents circumstances (no assumed jobs, illnesses, spouses,
 *    inheritances or events).
 *  - No em dashes anywhere.
 */

import { VedicPlanet } from '../nakshatras';
import { VedicDignity } from '../vedicDignity';

/** One sentence definition of what each graha actually describes. */
export const PLANET_PLAIN: Record<VedicPlanet, string> = {
  Sun: 'the Sun describes your sense of self, your confidence, and how comfortable you are being the one in charge',
  Moon: 'the Moon describes your emotional instincts and what helps you feel secure',
  Mars: 'Mars describes your drive, your courage, and how you handle conflict and effort',
  Mercury: 'Mercury describes how you think, learn, explain things and make decisions',
  Jupiter: 'Jupiter describes what you believe, how you learn from experience, and where you look for meaning and growth',
  Venus: 'Venus describes what you value, what you enjoy, and how you relate to people you care about',
  Saturn: 'Saturn describes where you feel responsibility, where progress is slow, and where maturity is built through repetition',
  Rahu: 'Rahu, the north node of the Moon, describes what you are strongly drawn toward even though you have little experience with it',
  Ketu: 'Ketu, the south node of the Moon, describes what already comes easily to you and therefore holds less pull',
};

/** What the planet is motivated by, phrased as tendency rather than event. */
export const PLANET_MOTIVE: Record<VedicPlanet, string> = {
  Sun: 'being respected for who you actually are rather than for what you produce',
  Moon: 'emotional steadiness and knowing where you belong',
  Mars: 'acting on what you believe instead of waiting for permission',
  Mercury: 'understanding things clearly enough to explain them',
  Jupiter: 'meaning, perspective and something worth believing in',
  Venus: 'harmony, beauty and relationships that feel mutual',
  Saturn: 'building something durable, even slowly',
  Rahu: 'stretching past what is familiar',
  Ketu: 'simplicity, and letting go of what you have already mastered',
};

/** Plain description of the life area each whole sign house covers. */
export const HOUSE_PLAIN: Record<number, string> = {
  1: 'your identity, vitality and how you naturally come across',
  2: 'your resources, your speech, and your sense of security and self-worth',
  3: 'communication, skill-building, courage and daily effort',
  4: 'home, family roots, emotional foundation and inner peace',
  5: 'creativity, learning, self-expression, romance and children',
  6: 'daily work, routines, service, discipline and problem solving',
  7: 'partnership, close one-to-one relationships and negotiation',
  8: 'depth, research, shared resources, and change you did not plan',
  9: 'beliefs, higher learning, teachers, ethics and long-range perspective',
  10: 'career direction, responsibility and public reputation',
  11: 'goals, gains, networks, communities and long-term hopes',
  12: 'privacy, inner life, rest, release and what you do away from an audience',
};

export function housePlain(house: number | null): string {
  return house ? HOUSE_PLAIN[house] : 'an area of life that needs an accurate birth time before it can be named';
}

/**
 * How a planet tends to behave in each sign, phrased as tendency.
 * These describe approach, not circumstances.
 */
export const SIGN_TENDENCY: Record<string, string> = {
  Aries: 'directly, quickly, and with a preference for acting first and adjusting afterward',
  Taurus: 'steadily, with a strong need for stability and a resistance to being rushed',
  Gemini: 'flexibly and verbally, keeping options open and thinking out loud',
  Cancer: 'protectively and emotionally, checking whether something feels safe before committing',
  Leo: 'visibly and wholeheartedly, needing what you do to matter and to be acknowledged',
  Virgo: 'precisely and practically, improving details other people overlook',
  Libra: 'diplomatically and relationally, weighing fairness and the effect on others',
  Scorpio: 'intensely and privately, going all in once trust is established',
  Sagittarius: 'expansively and honestly, preferring the big picture to the fine print',
  Capricorn: 'patiently and strategically, willing to take the long route for a solid result',
  Aquarius: 'independently and unconventionally, keeping some distance from the obvious answer',
  Pisces: 'imaginatively and empathetically, absorbing atmosphere and blurring boundaries',
};

export function signTendency(sign: string): string {
  return SIGN_TENDENCY[sign] || 'in a way distinct to that sign';
}

/** Dignity explained in plain language, with the classical label kept visible. */
export function dignityPlain(planet: VedicPlanet, sign: string, dignity: VedicDignity): string | null {
  switch (dignity) {
    case 'exalted':
      return `${planet} is exalted in ${sign}, which in Vedic astrology means it is in the sign where it functions at full strength. Practically, this is a part of you that works well without much effort and that other people tend to rely on.`;
    case 'own sign':
    case 'moolatrikona':
      return `${planet} is in its own sign, ${sign}, meaning it is on familiar ground. This function tends to be stable and available to you rather than something you have to fight for.`;
    case 'debilitated':
      return `${planet} is debilitated in ${sign}, which means it is in the sign where it operates least comfortably. That does not make it weak or bad. It usually means this function develops later, works differently from the standard version, and improves through experience rather than arriving ready-made.`;
    default:
      return null;
  }
}

/**
 * What each Vimshottari dasha lord emphasizes. A dasha is a long life period
 * ruled by one planet. These describe emphasis, never guaranteed events.
 */
export const DASHA_EMPHASIS: Record<VedicPlanet, { label: string; emphasis: string; grows: string; strain: string }> = {
  Sun: {
    label: 'a period emphasizing identity, authority and visibility',
    emphasis: 'questions of confidence, recognition, leadership and whether your position matches who you have become',
    grows: 'clearer self-definition and more comfort with being responsible for outcomes',
    strain: 'measuring yourself against other people\u2019s approval',
  },
  Moon: {
    label: 'a period emphasizing emotional life, home and belonging',
    emphasis: 'family, emotional security, care, and how much your inner state drives your decisions',
    grows: 'closer relationships and a better sense of what actually settles you',
    strain: 'making long-term decisions from a temporary mood',
  },
  Mars: {
    label: 'a period emphasizing drive, effort and directness',
    emphasis: 'initiative, competition, physical energy, and how you handle conflict',
    grows: 'courage, momentum and results that came from your own push',
    strain: 'reacting faster than the situation requires',
  },
  Mercury: {
    label: 'a period emphasizing thinking, learning and communication',
    emphasis: 'skills, study, negotiation, writing, planning and decision making',
    grows: 'competence you can articulate, and opportunities that come through what you know',
    strain: 'gathering information as a substitute for committing to something',
  },
  Jupiter: {
    label: 'a period emphasizing growth, belief and perspective',
    emphasis: 'learning, mentors, ethics, expansion and the search for meaning',
    grows: 'wider perspective, useful guidance and a sense of direction',
    strain: 'expanding faster than the foundation can support',
  },
  Venus: {
    label: 'a period emphasizing relationships, values and enjoyment',
    emphasis: 'love, comfort, aesthetics, money as it relates to values, and the quality of your close relationships',
    grows: 'more warmth, more pleasure, and clearer standards about what you want',
    strain: 'keeping the peace at your own expense',
  },
  Saturn: {
    label: 'a long period emphasizing responsibility, maturity, discipline, limits and building something that can last',
    emphasis: 'commitment, structure, patience, and the difference between what is real and what was only hoped for',
    grows: 'competence, credibility and results that hold up',
    strain: 'reading slowness as failure',
  },
  Rahu: {
    label: 'a period emphasizing unfamiliar territory and ambition',
    emphasis: 'new environments, risk, appetite for more, and areas where you have desire but little track record',
    grows: 'reach, exposure and experience outside what you were raised with',
    strain: 'restlessness that keeps moving the goalpost',
  },
  Ketu: {
    label: 'a period emphasizing release and inward focus',
    emphasis: 'letting go, refining what you already know, and losing interest in things that used to motivate you',
    grows: 'clarity, expertise that runs on its own, and freedom from old attachments',
    strain: 'withdrawing from things that still matter to you',
  },
};

/**
 * Money and security patterns by the house of the relevant wealth lord.
 * Written as tendency and possibility, never as an assumed job or event.
 */
export const MONEY_PATTERN: Record<number, string> = {
  1: 'Earning is closely tied to you personally rather than to a title. You tend to do well when your own initiative, presence and reputation are part of what is being valued, and less well when your contribution is invisible.',
  2: 'Earning is tied to steadiness and to your own voice. You tend to do well where income is predictable enough to plan around, and where speaking, explaining or valuing things accurately is part of the work.',
  3: 'Earning is tied to communication, skill and repeated effort. You tend to do well with variety, practical ability and work where output can be measured in what you actually completed.',
  4: 'Earning is tied to a stable base. You tend to do well when work is connected to home, land, property, family resources, or an environment you control, and you value security more than most people admit to.',
  5: 'Earning is tied to what you create. You tend to do well when your own ideas, teaching, creative judgment or willingness to take a calculated risk are part of the value.',
  6: 'Earning is tied to consistency and problem solving. You tend to do well where reliability compounds, where systems need improving, and where difficult or unglamorous work is respected.',
  7: 'Money and security are closely connected with other people. You may do particularly well when earning involves communication, negotiation, collaboration, advising, selling, or building strong one-to-one professional relationships.',
  8: 'Earning is tied to depth rather than to a steady drip. You may do well where research, investigation, shared or managed resources, or handling things other people find uncomfortable are part of the value. Timing tends to be uneven rather than smooth.',
  9: 'Earning is tied to knowledge and perspective. You may do well where teaching, advising, publishing, ethics, travel or distance from where you started are part of the picture, and mentors matter more for you than for most.',
  10: 'Earning is tied to responsibility and track record. You tend to do well when you are visibly accountable for something, and pay tends to follow reputation rather than effort alone.',
  11: 'Earning is tied to networks and scale. You tend to do well through groups, communities, many contacts rather than one source, and gains that come from being connected to the right circles.',
  12: 'Earning is tied to work done away from an audience. You may do well in behind-the-scenes roles, with people or places far from home, or in care, research and contemplative fields. Visibility is not where your value lives.',
}

export function moneyPattern(house: number | null): string {
  return house
    ? MONEY_PATTERN[house]
    : 'The specific pattern needs an accurate birth time before it can be named, because it depends on house placement.';
}

/** Plain definitions for the Jaimini karakas. */
export const KARAKA_PLAIN: Record<string, string> = {
  Atmakaraka: 'the planet that travelled furthest into its sign. Tradition treats it as the single loudest theme in the life, the lesson that keeps returning until it is dealt with consciously.',
  Amatyakaraka: 'the second highest degree planet, read as the function your work and career naturally run through.',
  Darakaraka: 'the planet at the lowest degree, read as the qualities that matter most in close partnership, both the ones you look for and the ones you have to develop yourself.',
};

/** Nakshatra explained once, in plain words. */
export const NAKSHATRA_DEFINITION =
  'A nakshatra is one of 27 lunar segments, a finer division inside each sign. It narrows a placement from a general style to a more specific flavor, and the pada is the quarter of that segment.';

export const DASHA_DEFINITION =
  'Vimshottari dasha divides life into long periods, each ruled by one planet. The mahadasha is the main period and the antardasha is the sub-period inside it. A period emphasizes that planet\u2019s themes. It does not restrict those themes to that period only.';

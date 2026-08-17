/**
 * Planet, sign and house copy for the Vedic layer.
 * All behavioral. No jargon inside the sentences themselves.
 */

import { VedicPlanet } from '../nakshatras';

export const PLANET_ROLE: Record<VedicPlanet, string> = {
  Sun: 'your sense of self and the authority you either claim or hand away',
  Moon: 'your emotional weather and what makes you feel safe',
  Mars: 'how you fight, protect and push',
  Mercury: 'how you think, sell, negotiate and explain',
  Jupiter: 'where you grow, teach and get lucky through people',
  Venus: 'what you enjoy, what you value and how you attract',
  Saturn: 'where life makes you slow down and earn it',
  Rahu: 'the hunger that pulls you into unfamiliar territory',
  Ketu: 'the place you are already fluent and quietly bored',
};

export const PLANET_BEHAVIOR: Record<VedicPlanet, string> = {
  Sun: 'you take the front seat',
  Moon: 'you read the room emotionally before anyone speaks',
  Mars: 'you move on it directly',
  Mercury: 'you talk it through and make a plan',
  Jupiter: 'you widen the frame and look for the opportunity',
  Venus: 'you make it pleasant and bring people in',
  Saturn: 'you slow down, check it twice and carry the weight',
  Rahu: 'you reach for more than you have earned yet',
  Ketu: 'you detach and let it go before others do',
};

/** What each whole-sign house governs, in lived terms. */
export const HOUSE_THEME: Record<number, string> = {
  1: 'your body, your presence and the way you come across before you say anything',
  2: 'money you earn and keep, your voice, food and family resources',
  3: 'siblings, courage, hands-on skill and short daily effort',
  4: 'home, mother, your inner floor and the place you retreat to',
  5: 'children, creativity, risk, romance and what you make for the joy of it',
  6: 'work, routine, health, debt and the daily friction you handle',
  7: 'partnership, marriage, negotiation and the people who mirror you',
  8: 'hidden matters, other people\u2019s money, sudden change and what you research in private',
  9: 'belief, teachers, long journeys, father and the philosophy you live by',
  10: 'career, reputation and what the world credits you with',
  11: 'income, networks, gains, older siblings and the groups you belong to',
  12: 'release, foreign places, sleep, spiritual life and where you lose or let go',
};

/** How the sign colors the behavior. Short, behavioral, no adjective lists. */
export const SIGN_STYLE: Record<string, string> = {
  Aries: 'you start before you are ready and correct on the move',
  Taurus: 'you go slowly, then refuse to be rushed off your position',
  Gemini: 'you keep several options open and talk your way to clarity',
  Cancer: 'you protect first and decide from how safe it feels',
  Leo: 'you want it to matter and you want it seen',
  Virgo: 'you fix the details and quietly keep the whole thing running',
  Libra: 'you weigh both sides and stall rather than upset the balance',
  Scorpio: 'you commit completely and watch closely before you do',
  Sagittarius: 'you aim at the bigger version and lose patience with the fine print',
  Capricorn: 'you build the structure and take the long route on purpose',
  Aquarius: 'you keep an outsider view and resist the obvious answer',
  Pisces: 'you absorb the atmosphere and let boundaries blur',
};

/**
 * How income concretely shows up when the money ruler sits in a given house.
 * Written as recognizable, real-world earning routes, not body metaphors.
 */
export const MONEY_ROUTE: Record<number, string> = {
  1: 'people hire you, not your resume. Work comes because someone met you, watched how you handled yourself and decided they wanted you on it. Referrals, being in the room, your own name on the thing.',
  2: 'steady pay you can predict, plus anything that uses your voice: speaking, teaching, selling, negotiating a rate out loud.',
  3: 'many small jobs rather than one big one. Writing, messaging, hands-on skill, local work, and pay that tracks how much you actually did that week.',
  4: 'home and property, family money, or working out of your own space for a small set of clients who stay for years.',
  5: 'something you made. Creative work, teaching or coaching, kids-adjacent work, or a calculated bet that pays because you had the taste to place it.',
  6: 'showing up daily and solving problems other people avoid. Salaried or service work, health or admin fields, and pay that rises with reliability rather than flash.',
  7: 'one-to-one deals. Clients, contracts, a business partner, or a spouse-linked income. Your earning goes up when someone signs with you and down when you work alone.',
  8: 'other people\u2019s money: investments, insurance, inheritance, research, or fixing things behind the scenes. Lumpy timing, bigger amounts.',
  9: 'teaching, publishing, advising, travel or work tied to people far from where you started, often through a mentor who opens a door.',
  10: 'title and track record. Promotion, visibility, a role with your name on it, pay driven by reputation.',
  11: 'networks and volume. Groups, communities, commissions, bonuses, many buyers rather than one boss.',
  12: 'work that is quiet or offshore: behind-the-scenes roles, foreign clients, care and spiritual work, or income that arrives without a public audience.',
};

export function moneyRoute(house: number | null): string {
  return house
    ? MONEY_ROUTE[house]
    : 'a route that needs an accurate birth time before it can be named';
}

export function houseTheme(house: number | null): string {
  return house ? HOUSE_THEME[house] : 'a house that needs an accurate birth time to place';
}


export function signStyle(sign: string): string {
  return SIGN_STYLE[sign] || 'a distinct way of handling pressure';
}

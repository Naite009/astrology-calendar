// ============================================================================
// ELECTIONAL GUIDANCE ENRICHMENT
// Gives every calculated year the same depth of written guidance that the
// hand-curated 2026 notes have: a real "why", a real workaround, and a
// concrete way to work with the day.
// ============================================================================

import * as Astronomy from 'astronomy-engine';
import type { ElectionalDay } from './electionalCalendar';

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

/** Where the energy of a sign actually shows up in ordinary life. */
const SIGN_ARENA: Record<string, string> = {
  Aries: 'speed, temper and who moves first',
  Taurus: 'money, food, comfort and refusing to be rushed',
  Gemini: 'words, texts, paperwork and half-heard information',
  Cancer: 'home, family, food and who feels left out',
  Leo: 'pride, recognition and being seen doing it',
  Virgo: 'details, health, cleaning up other people\'s work',
  Libra: 'fairness, other people\'s opinions and keeping the peace',
  Scorpio: 'money you share, secrets and who has the real say',
  Sagittarius: 'travel, beliefs, teaching and saying too much',
  Capricorn: 'work, authority, rules and the long clock',
  Aquarius: 'groups, technology and going against the expected answer',
  Pisces: 'boundaries, sleep, mood and picking up other people\'s feelings',
};

/** Concrete behavior each sign produces when a day is tense. */
const SIGN_TENSION: Record<string, string> = {
  Aries: 'people snap first and apologize later',
  Taurus: 'people dig in and refuse to move an inch',
  Gemini: 'the story changes twice before lunch',
  Cancer: 'feelings get hurt and nobody names it',
  Leo: 'somebody needs credit and will not ask for it',
  Virgo: 'small mistakes get treated like character flaws',
  Libra: 'people agree out loud and resent it privately',
  Scorpio: 'nothing is said directly and everything is remembered',
  Sagittarius: 'a joke lands wrong and turns into a lecture',
  Capricorn: 'the rule wins over the person',
  Aquarius: 'someone detaches instead of arguing',
  Pisces: 'nobody can tell whose mood it is',
};

/** What the sign supports when a day is easy. */
const SIGN_SUPPORT: Record<string, string> = {
  Aries: 'starting something before you feel ready',
  Taurus: 'asking for money and holding your number',
  Gemini: 'sending the message, signing, pitching, explaining',
  Cancer: 'feeding people and repairing something at home',
  Leo: 'showing your work in public and letting it be admired',
  Virgo: 'fixing the system, the body or the calendar',
  Libra: 'making an agreement, a date or a partnership official',
  Scorpio: 'deep talks, negotiations and shared finances',
  Sagittarius: 'booking travel, teaching, studying, publishing',
  Capricorn: 'career moves, contracts and building the long thing',
  Aquarius: 'community projects, tech launches, unorthodox plans',
  Pisces: 'creative work, rest, forgiveness and quiet devotion',
};

const getLon = (date: Date, planet: string): number => {
  try {
    if (planet === 'moon') return Astronomy.EclipticGeoMoon(date).lon;
    const body = (Astronomy.Body as Record<string, Astronomy.Body>)[
      planet.charAt(0).toUpperCase() + planet.slice(1)
    ];
    const vector = Astronomy.GeoVector(body, date, false);
    return Astronomy.Ecliptic(vector).elon;
  } catch {
    return 0;
  }
};

const signOf = (date: Date, planet: string): string =>
  SIGNS[Math.floor((((getLon(date, planet) % 360) + 360) % 360) / 30)];

const moonPhaseLabel = (date: Date): string => {
  try {
    const angle = Astronomy.MoonPhase(date);
    if (angle < 22.5 || angle >= 337.5) return 'New Moon';
    if (angle < 67.5) return 'waxing crescent';
    if (angle < 112.5) return 'first quarter';
    if (angle < 157.5) return 'waxing gibbous';
    if (angle < 202.5) return 'Full Moon';
    if (angle < 247.5) return 'waning gibbous';
    if (angle < 292.5) return 'last quarter';
    return 'balsamic, the last days before the New Moon';
  } catch {
    return '';
  }
};

/** A moon line that gives the day a practical handle, same job the 2026 notes did. */
const moonHandle = (date: Date): string => {
  const sign = signOf(date, 'moon');
  const phase = moonPhaseLabel(date);
  const arena = SIGN_ARENA[sign] || 'daily life';
  const building = ['New Moon', 'waxing crescent', 'first quarter', 'waxing gibbous'].includes(phase);
  return `The Moon is in ${sign} that day and the phase is ${phase}, so the mood runs through ${arena}, and it is ${
    building ? 'a building phase, better for starting and asking' : 'a releasing phase, better for finishing, editing and letting go'
  }.`;
};

/** Second and third sentence for hard days, per category. */
const HARD_DETAIL: Record<string, (bodies: string[]) => string> = {
  eclipse: () =>
    'Eclipses are not evil, they are unstable. Information you did not have arrives late, so a decision made today gets remade in a week.',
  'mercury-rx': () =>
    'This is not a curse on your phone. Mercury retrograde means details get skipped, so wrong times, missed attachments and half-read replies are the real risk.',
  'mars-pluto': () =>
    'Small disagreements turn into who is in charge. Somebody pushes to win rather than to solve, and it escalates faster than the topic deserves.',
  'venus-saturn': () =>
    'Warmth costs more effort today. People read a normal silence as rejection, and affection feels like it has to be earned.',
  'venus-pluto': () =>
    'Wanting turns into needing. Jealousy, testing and reading meaning into a short reply are the standard traps.',
  'mars-chiron': () =>
    'Ordinary criticism lands on an old bruise. People react to the tone rather than the sentence, and defend a hurt they will not name.',
  'mars-saturn': () =>
    'You will do the work and still hit a wall: a delay, a form, a person who is not available. Force makes it slower, not faster.',
  'mars-node': () =>
    'There is real fuel here, but no brakes. Anything already tense gets said out loud today.',
};

const HARD_WORKAROUND: Record<string, string> = {
  eclipse: 'If the date cannot move, keep it reversible. Sign nothing final, and revisit it three days later before it counts.',
  'mercury-rx': 'Read it twice, confirm the time in writing, and back up before you buy. Reviving old projects goes well now, launching new ones does not.',
  'mars-pluto': 'Decide in advance what you will not argue about, and keep the conversation under ten minutes. Leave before you get the last word.',
  'venus-saturn': 'Say the affection out loud instead of assuming it is obvious. Good day for a boundary, poor day for a first date.',
  'venus-pluto': 'Do not test anyone today. Ask the plain question you actually want answered, then stop.',
  'mars-chiron': 'Lower your volume, not your point. Ask instead of correcting, and skip feedback you can give tomorrow.',
  'mars-saturn': 'Pick one task and finish it. Move deadlines forward rather than pushing harder against a closed door.',
  'mars-node': 'Use the energy on something physical. Do not put two touchy people in the same room.',
};

/** Second and third sentence for good days, per category. */
const GOOD_DETAIL: Record<string, (sign: string) => string> = {
  'venus-jupiter': (sign) =>
    `Both benefics agree, which in practice means people say yes more easily. With the pair in ${sign}, the yes tends to come through ${SIGN_SUPPORT[sign] || 'generosity'}.`,
  'mars-jupiter': (sign) =>
    `Effort gets a return today rather than resistance. In ${sign} the useful move is ${SIGN_SUPPORT[sign] || 'bold action'}.`,
  cazimi: (sign) =>
    `The planet sits in the heart of the Sun, hidden and at full strength. In ${sign} that strength shows up through ${SIGN_SUPPORT[sign] || 'clear expression'}.`,
  'new-moon': (sign) =>
    `A New Moon is a start with no visible proof yet, so plant it and expect evidence at the Full Moon two weeks on. In ${sign} the theme is ${SIGN_ARENA[sign] || 'a fresh chapter'}.`,
  'venus-domicile': (sign) =>
    `Venus is in her own sign, so relating, spending and self-presentation all get easier. Best used for ${SIGN_SUPPORT[sign] || 'partnership'}.`,
  'venus-exalted': () =>
    'Venus is exalted, which is the most generous version of her: forgiving, artistic, magnetic. Ask for the thing you have been rehearsing.',
  'mercury-venus': (sign) =>
    `Words and warmth agree, so difficult conversations go softer than usual. In ${sign} lead with ${SIGN_SUPPORT[sign] || 'plain speech'}.`,
  'rare-saturn-neptune': () =>
    'This is a rare pairing of structure and dream, so it is good for making something imagined actually concrete. It will not repeat for decades.',
};

const bodiesFromCategory = (category: string): string[] =>
  category.split('-').filter(w => ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'neptune', 'pluto', 'chiron'].includes(w));

/**
 * Adds the missing depth to a calculated electional day so any year reads
 * as fully as the hand-written 2026 notes.
 */
export const enrichElectionalDay = (day: ElectionalDay): ElectionalDay => {
  const isHard = day.rating === 'RED' || day.rating === 'YELLOW';
  const bodies = bodiesFromCategory(day.category);
  const primary = bodies[0] || 'moon';
  const primarySign = signOf(day.date, primary);

  const detail = isHard
    ? HARD_DETAIL[day.category]?.(bodies)
    : GOOD_DETAIL[day.category]?.(primarySign);

  const signLine = isHard
    ? `With ${primary.charAt(0).toUpperCase() + primary.slice(1)} in ${primarySign}, the pressure lands on ${SIGN_ARENA[primarySign] || 'daily life'}, and ${SIGN_TENSION[primarySign] || 'people get short with each other'}.`
    : '';

  const why = [day.why, detail, signLine, moonHandle(day.date)]
    .filter(Boolean)
    .join(' ');

  const workaround = isHard
    ? [day.workaround, HARD_WORKAROUND[day.category]].filter(Boolean).join(' ')
    : day.workaround;

  const power = !isHard
    ? [day.power, `Use it on one specific thing rather than the whole list: ${SIGN_SUPPORT[primarySign] || 'the move you keep postponing'}.`]
        .filter(Boolean)
        .join(' ')
    : day.power;

  return { ...day, why, workaround, power };
};

export const enrichElectionalDays = (days: ElectionalDay[]): ElectionalDay[] =>
  days.map(enrichElectionalDay);

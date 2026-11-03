// ============= Annual & Monthly Profections =============
// Deterministic profection math. Profections advance one whole sign per
// year of life from the rising sign, birthday to birthday. Monthly
// profections advance one sign per month from the annual profected sign,
// starting on the birthday. All dates use local civil dates; no AI math.

import { computeBody, longitudeToSignPosition, type BodyKey } from './ephemerisEngine';

export const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

export const TRADITIONAL_RULERS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};

/** Short, concrete life-area labels for each profected house. */
export const PROFECTION_HOUSE_THEMES: Record<number, { label: string; focus: string }> = {
  1:  { label: 'You, your body, your direction', focus: 'This year puts you yourself at the center: your energy, your appearance, and the direction you want your life to take.' },
  2:  { label: 'Money and what you own', focus: 'This year spotlights income, spending, and the things you rely on for security.' },
  3:  { label: 'Daily life, siblings, learning', focus: 'This year highlights your everyday routines, short trips, siblings and neighbors, and picking up new skills.' },
  4:  { label: 'Home and family', focus: 'This year turns attention to where you live, your family, and your private foundations.' },
  5:  { label: 'Fun, creativity, kids, romance', focus: 'This year emphasizes enjoyment: creative projects, children, dating, and things you do just because they light you up.' },
  6:  { label: 'Work, health, daily habits', focus: 'This year focuses on your job, your body\'s upkeep, and the habits that structure your days.' },
  7:  { label: 'Partnerships', focus: 'This year centers on one-on-one relationships: romantic partners, close collaborators, and agreements.' },
  8:  { label: 'Shared money and deep change', focus: 'This year deals with money you share with others, debts, inheritances, and letting go of what has run its course.' },
  9:  { label: 'Travel, study, beliefs', focus: 'This year opens up the bigger picture: long trips, higher education, publishing, and what you believe.' },
  10: { label: 'Career and public life', focus: 'This year puts your work in the world and your reputation in the spotlight.' },
  11: { label: 'Friends and community', focus: 'This year highlights friendships, groups you belong to, and the causes you care about.' },
  12: { label: 'Rest, retreat, behind the scenes', focus: 'This year is more inward: rest, recovery, solitude, and wrapping up loose ends before a new cycle.' },
};

/** What each timelord planet tends to bring when it runs the year. */
export const TIME_LORD_THEMES: Record<string, string> = {
  Sun: 'visibility, confidence, and being seen for who you are',
  Moon: 'feelings, home life, and your changing needs',
  Mercury: 'thinking, talking, writing, and day-to-day logistics',
  Venus: 'relationships, pleasure, money, and what you value',
  Mars: 'drive, conflict, physical energy, and getting things done',
  Jupiter: 'growth, opportunity, learning, and support from others',
  Saturn: 'responsibility, structure, patience, and long-term commitments',
};

export interface AnnualProfection {
  /** Age the person turns on the birthday that starts this profection year. */
  age: number;
  /** Profected whole-sign house, 1-12. */
  house: number;
  /** Sign of the profected house (whole-sign from the rising sign). */
  sign: string;
  /** Traditional ruler of the profected sign: the year's timelord. */
  timeLord: string;
  /** Local date this profection year begins (the birthday). */
  yearStart: Date;
  /** Local date this profection year ends (the next birthday). */
  yearEnd: Date;
}

export interface MonthlyProfection {
  /** 0-11, months since the birthday. */
  monthIndex: number;
  /** Local date this monthly profection begins. */
  start: Date;
  /** Profected whole-sign house for this month, 1-12. */
  house: number;
  sign: string;
  lord: string;
  /** True when `at` falls inside this month. */
  isCurrent: boolean;
}

const parseLocalDate = (iso: string): Date | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isFinite(d.getTime()) ? d : null;
};

/** The most recent birthday on or before `at` (local dates). */
export const lastBirthday = (birthDate: string, at: Date): Date | null => {
  const birth = parseLocalDate(birthDate);
  if (!birth) return null;
  let y = at.getFullYear();
  let bday = new Date(y, birth.getMonth(), birth.getDate());
  if (bday.getTime() > at.getTime()) {
    bday = new Date(y - 1, birth.getMonth(), birth.getDate());
  }
  return bday;
};

/**
 * Annual profection for the moment `at`. Profections run birthday to
 * birthday, so this works for any date, not just the new year.
 * Returns null when the birth date or rising sign is missing.
 */
export const getAnnualProfection = (
  birthDate: string,
  risingSign: string | undefined,
  at: Date = new Date(),
): AnnualProfection | null => {
  const birth = parseLocalDate(birthDate);
  const ascIdx = SIGNS.indexOf(risingSign as (typeof SIGNS)[number]);
  if (!birth || ascIdx < 0) return null;

  const start = lastBirthday(birthDate, at);
  if (!start) return null;
  const age = start.getFullYear() - birth.getFullYear();
  const house = (age % 12) + 1;
  const sign = SIGNS[(ascIdx + house - 1) % 12];
  const yearEnd = new Date(start.getFullYear() + 1, birth.getMonth(), birth.getDate());

  return {
    age,
    house,
    sign,
    timeLord: TRADITIONAL_RULERS[sign],
    yearStart: start,
    yearEnd,
  };
};

/**
 * The 12 monthly profections of an annual profection year. Month 0 starts
 * on the birthday in the annual profected sign; each following month
 * advances one whole sign.
 */
export const getMonthlyProfections = (
  annual: AnnualProfection,
  risingSign: string,
  at: Date = new Date(),
): MonthlyProfection[] => {
  const ascIdx = SIGNS.indexOf(risingSign as (typeof SIGNS)[number]);
  if (ascIdx < 0) return [];
  const birthDay = annual.yearStart.getDate();

  const months: MonthlyProfection[] = [];
  for (let i = 0; i < 12; i++) {
    const start = new Date(annual.yearStart.getFullYear(), annual.yearStart.getMonth() + i, birthDay);
    const end = i === 11
      ? annual.yearEnd
      : new Date(annual.yearStart.getFullYear(), annual.yearStart.getMonth() + i + 1, birthDay);
    const house = ((annual.house - 1 + i) % 12) + 1;
    const sign = SIGNS[(ascIdx + house - 1) % 12];
    months.push({
      monthIndex: i,
      start,
      house,
      sign,
      lord: TRADITIONAL_RULERS[sign],
      isCurrent: at.getTime() >= start.getTime() && at.getTime() < end.getTime(),
    });
  }
  return months;
};

export interface SignIngress {
  /** Exact moment the planet crosses the sign boundary (ephemeris-solved). */
  date: Date;
  fromSign: string;
  toSign: string;
  /** Whole-sign house of the new sign, from the natal rising sign. */
  toHouse: number;
  /** True when the planet is retrograde at the crossing. */
  retrograde: boolean;
}

export interface YearTransit {
  planet: string;
  glyph: string;
  /** Sign the planet is in at the start of the profection year. */
  startSign: string;
  /** Sign at the end of the year (same as startSign unless it changes). */
  endSign: string;
  /** Whole-sign house from the natal rising sign, at year start. */
  startHouse: number;
  endHouse: number;
  changesSign: boolean;
  /**
   * Every sign crossing inside the year, in order, solved against the
   * ephemeris. Includes retrograde dips in and back out of a sign.
   */
  ingresses: SignIngress[];
}

const TRANSIT_BODIES: { key: BodyKey; glyph: string }[] = [
  { key: 'Jupiter', glyph: '♃' },
  { key: 'Saturn', glyph: '♄' },
  { key: 'Uranus', glyph: '♅' },
  { key: 'Neptune', glyph: '♆' },
  { key: 'Pluto', glyph: '♇' },
];

const wholeSignHouse = (sign: string, risingSign: string): number => {
  const a = SIGNS.indexOf(risingSign as (typeof SIGNS)[number]);
  const s = SIGNS.indexOf(sign as (typeof SIGNS)[number]);
  if (a < 0 || s < 0) return 0;
  return ((s - a + 12) % 12) + 1;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

const signAt = (key: BodyKey, at: Date): { sign: string; retrograde: boolean } | null => {
  const r = computeBody(key, at);
  if (!r.ok) return null;
  return { sign: longitudeToSignPosition(r.longitude).sign, retrograde: r.retrograde };
};

/**
 * Bisect a known sign change between `before` (in fromSign) and `after`
 * (in the next sign) down to about one hour of precision.
 */
const solveIngress = (
  key: BodyKey,
  before: Date,
  after: Date,
  fromSign: string,
): { date: Date; toSign: string; retrograde: boolean } | null => {
  let lo = before.getTime();
  let hi = after.getTime();
  const to = signAt(key, after);
  if (!to) return null;
  while (hi - lo > HOUR_MS) {
    const mid = new Date((lo + hi) / 2);
    const atMid = signAt(key, mid);
    if (!atMid) return null;
    if (atMid.sign === fromSign) lo = mid.getTime();
    else hi = mid.getTime();
  }
  return { date: new Date(hi), toSign: to.sign, retrograde: to.retrograde };
};

/**
 * Exact sign positions and ingresses for the five slow planets across the
 * profection year, mapped to whole-sign houses from the natal rising sign.
 * Scans the ephemeris day by day and solves each crossing to the hour, so
 * retrograde dips into a sign and back out are all reported. Uses the same
 * astronomy-engine positions as the rest of the app; no AI math.
 */
export const getYearTransits = (
  annual: AnnualProfection,
  risingSign: string,
): YearTransit[] => {
  const out: YearTransit[] = [];
  const startMs = annual.yearStart.getTime();
  const endMs = annual.yearEnd.getTime() - HOUR_MS;

  for (const { key, glyph } of TRANSIT_BODIES) {
    const first = signAt(key, annual.yearStart);
    const last = signAt(key, new Date(endMs));
    if (!first || !last) continue;

    const ingresses: SignIngress[] = [];
    let prevDate = new Date(startMs);
    let prevSign = first.sign;

    for (let t = startMs + DAY_MS; t <= endMs; t += DAY_MS) {
      const cur = signAt(key, new Date(t));
      if (!cur) break;
      if (cur.sign !== prevSign) {
        const solved = solveIngress(key, prevDate, new Date(t), prevSign);
        if (solved) {
          ingresses.push({
            date: solved.date,
            fromSign: prevSign,
            toSign: solved.toSign,
            toHouse: wholeSignHouse(solved.toSign, risingSign),
            retrograde: solved.retrograde,
          });
          prevSign = solved.toSign;
        }
      }
      prevDate = new Date(t);
    }

    out.push({
      planet: key,
      glyph,
      startSign: first.sign,
      endSign: last.sign,
      startHouse: wholeSignHouse(first.sign, risingSign),
      endHouse: wholeSignHouse(last.sign, risingSign),
      changesSign: ingresses.length > 0,
      ingresses,
    });
  }
  return out;
};

/**
 * Best Days Summary Calculator
 * 
 * Shows the single best day for each activity category at a glance,
 * with specific sub-activities per category.
 */

import { calculateBestTimes, calculateAllDayScores, BestTimesCategory, BestTimeResult, CATEGORY_INFO } from './bestTimes';
import { NatalChart } from '@/hooks/useNatalChart';
import { format, differenceInDays, getDay } from 'date-fns';
import { getPlanetaryHourAt } from './planetaryHours';
import { getMoonPhase } from './astrology';

export interface SubActivity {
  id: string;
  label: string;
  emoji: string;
  /** Which categories to blend for scoring (uses first as primary) */
  blendCategories?: BestTimesCategory[];
  description: string;
  /** Which parent category scoring to use */
  category: BestTimesCategory;
  /** Score modifier — multiplied by the base category score */
  modifier: number;
  /** Favorable planetary hour rulers for bonus scoring */
  favorableHourPlanets?: string[];
  /** Preferred moon phase keywords for bonus */
  favorableMoonPhases?: string[];
  /** Preferred days of week (0=Sun, 1=Mon, ..., 6=Sat) */
  favorableDaysOfWeek?: number[];
}

export interface BestDaySummary {
  category: BestTimesCategory;
  emoji: string;
  label: string;
  bestDay: Date;
  score: number;
  rating: string;
  topReason: string;
}

export interface SubActivityDayScore {
  date: Date;
  score: number;
  rating: string;
  reason: string;
}

export interface SubActivityResult {
  activity: SubActivity;
  bestDay: Date;
  score: number;
  rating: string;
  topReason: string;
  /** Top 3 best days for this activity, spread across the month */
  topDays: SubActivityDayScore[];
  /** Today's score for this activity */
  todayScore: number;
  todayRating: string;
  /** All 30 days with scores for wave chart */
  allDays: SubActivityDayScore[];
}

export interface BestDaysSummaryResult {
  summaries: BestDaySummary[];
  overallBestDay: { date: Date; categories: BestTimesCategory[] };
  period: { start: Date; end: Date };
}

// ── Sub-activities per category ──────────────────────────────────

export const SUB_ACTIVITIES: Record<BestTimesCategory, SubActivity[]> = {
  love: [
    { id: 'find-partner', label: 'Find a Partner', emoji: '💘', description: 'Best day to meet someone new', category: 'love', modifier: 1.0, favorableHourPlanets: ['Venus', 'Jupiter'], favorableMoonPhases: ['Waxing Crescent', 'First Quarter'], favorableDaysOfWeek: [5, 6] },
    { id: 'go-on-date', label: 'Go on a Date', emoji: '🥂', description: 'Ideal energy for romantic outings', category: 'love', modifier: 0.95, favorableHourPlanets: ['Venus', 'Moon'], favorableMoonPhases: ['Waxing Gibbous', 'Full Moon'], favorableDaysOfWeek: [5, 6, 4] },
    { id: 'propose', label: 'Propose / Commit', emoji: '💍', description: 'Best day for big romantic gestures', category: 'love', modifier: 1.05, favorableHourPlanets: ['Sun', 'Jupiter'], favorableMoonPhases: ['Full Moon'], favorableDaysOfWeek: [0, 4] },
    { id: 'rekindle', label: 'Rekindle a Flame', emoji: '🔥', description: 'Great energy to reconnect with a past love', category: 'love', modifier: 0.9, favorableHourPlanets: ['Mars', 'Venus'], favorableMoonPhases: ['Waning Gibbous', 'Last Quarter'], favorableDaysOfWeek: [2, 5] },
    { id: 'love-letter', label: 'Write a Love Letter', emoji: '💌', description: 'Express deep feelings in words', category: 'love', modifier: 0.85, favorableHourPlanets: ['Mercury', 'Venus'], favorableMoonPhases: ['Waxing Crescent', 'Waxing Gibbous'], favorableDaysOfWeek: [3, 5] },
  ],
  finance: [
    { id: 'buy-stocks', label: 'Buy Stocks', emoji: '📈', description: 'Favorable energy for investments', category: 'finance', modifier: 1.0, favorableHourPlanets: ['Jupiter', 'Sun'], favorableMoonPhases: ['Waxing Crescent', 'First Quarter'], favorableDaysOfWeek: [1, 4] },
    { id: 'sell-stocks', label: 'Sell Stocks', emoji: '📉', description: 'Good timing for profit-taking', category: 'finance', modifier: 0.95, favorableHourPlanets: ['Saturn', 'Mercury'], favorableMoonPhases: ['Full Moon', 'Waning Gibbous'], favorableDaysOfWeek: [3, 6] },
    { id: 'negotiate', label: 'Negotiate a Deal', emoji: '🤝', description: 'Strong alignment for negotiations', category: 'finance', modifier: 1.05, favorableHourPlanets: ['Mercury', 'Jupiter'], favorableMoonPhases: ['First Quarter', 'Waxing Gibbous'], favorableDaysOfWeek: [2, 3] },
    { id: 'ask-raise', label: 'Ask for a Raise', emoji: '💵', description: 'Aligned for compensation conversations', category: 'finance', modifier: 1.0, favorableHourPlanets: ['Sun', 'Jupiter'], favorableMoonPhases: ['Waxing Gibbous', 'Full Moon'], favorableDaysOfWeek: [1, 2, 4] },
    { id: 'budget', label: 'Create a Budget', emoji: '📊', description: 'Clarity for financial planning', category: 'finance', modifier: 0.85, favorableHourPlanets: ['Saturn', 'Mercury'], favorableMoonPhases: ['Last Quarter', 'Waning Crescent'], favorableDaysOfWeek: [6, 1] },
    { id: 'real-estate', label: 'Buy Property', emoji: '🏠', description: 'Favorable for real estate decisions', category: 'finance', modifier: 1.1, favorableHourPlanets: ['Jupiter', 'Venus'], favorableMoonPhases: ['Waxing Gibbous', 'Full Moon'], favorableDaysOfWeek: [4, 1] },
  ],
  health: [
    { id: 'start-diet', label: 'Start a Diet', emoji: '🥗', description: 'Best energy for new health routines', category: 'health', modifier: 1.0, favorableHourPlanets: ['Moon', 'Mercury'], favorableMoonPhases: ['New Moon', 'Waxing Crescent'], favorableDaysOfWeek: [1, 3] },
    { id: 'surgery', label: 'Schedule Surgery', emoji: '🏥', description: 'Optimal for medical procedures', category: 'health', modifier: 1.1, favorableHourPlanets: ['Mars', 'Saturn'], favorableMoonPhases: ['Waning Gibbous', 'Last Quarter'], favorableDaysOfWeek: [2, 4] },
    { id: 'begin-exercise', label: 'Start an Exercise Plan', emoji: '🏋️', description: 'Great energy for physical training', category: 'health', modifier: 1.0, favorableHourPlanets: ['Mars', 'Sun'], favorableMoonPhases: ['Waxing Crescent', 'First Quarter'], favorableDaysOfWeek: [2, 4, 1] },
    { id: 'detox', label: 'Detox / Cleanse', emoji: '🧘', description: 'Aligned for purification routines', category: 'health', modifier: 0.9, favorableHourPlanets: ['Moon', 'Saturn'], favorableMoonPhases: ['Waning Crescent', 'New Moon'], favorableDaysOfWeek: [1, 6] },
    { id: 'quit-habit', label: 'Quit a Bad Habit', emoji: '🚫', description: 'Willpower is at its peak', category: 'health', modifier: 0.95, favorableHourPlanets: ['Saturn', 'Mars'], favorableMoonPhases: ['Last Quarter', 'Waning Crescent'], favorableDaysOfWeek: [6, 2] },
  ],
  beauty: [
    { id: 'haircut', label: 'Get a Haircut', emoji: '💇', description: 'Hair grows back healthier', category: 'beauty', modifier: 1.0, favorableHourPlanets: ['Venus', 'Moon'], favorableMoonPhases: ['Waxing Crescent', 'Waxing Gibbous'], favorableDaysOfWeek: [5, 3] },
    { id: 'spa-day', label: 'Spa Day', emoji: '🧖', description: 'Ideal for pampering and relaxation', category: 'beauty', modifier: 0.95, favorableHourPlanets: ['Venus', 'Moon'], favorableMoonPhases: ['Full Moon', 'Waning Gibbous'], favorableDaysOfWeek: [5, 6, 0] },
    { id: 'new-look', label: 'Try a New Look', emoji: '🪞', description: 'Bold style changes favored', category: 'beauty', modifier: 1.05, favorableHourPlanets: ['Sun', 'Mars'], favorableMoonPhases: ['New Moon', 'Waxing Crescent'], favorableDaysOfWeek: [2, 0] },
    { id: 'skincare', label: 'Start Skincare Routine', emoji: '✨', description: 'Best for new beauty rituals', category: 'beauty', modifier: 0.9, favorableHourPlanets: ['Moon', 'Venus'], favorableMoonPhases: ['Waxing Crescent', 'First Quarter'], favorableDaysOfWeek: [1, 3] },
    { id: 'photo-shoot', label: 'Schedule a Photo Shoot', emoji: '📸', description: 'You will look your most radiant', category: 'beauty', modifier: 1.0, favorableHourPlanets: ['Sun', 'Venus'], favorableMoonPhases: ['Full Moon', 'Waxing Gibbous'], favorableDaysOfWeek: [0, 5, 6] },
  ],
  career: [
    { id: 'job-interview', label: 'Job Interview', emoji: '🎯', description: 'Strong impression energy', category: 'career', modifier: 1.05, favorableHourPlanets: ['Sun', 'Mercury'], favorableMoonPhases: ['Waxing Gibbous', 'First Quarter'], favorableDaysOfWeek: [2, 3, 4] },
    { id: 'launch-business', label: 'Launch a Business', emoji: '🚀', description: 'Auspicious for new ventures', category: 'career', modifier: 1.1, favorableHourPlanets: ['Jupiter', 'Sun'], favorableMoonPhases: ['New Moon', 'Waxing Crescent'], favorableDaysOfWeek: [4, 1] },
    { id: 'sign-contract', label: 'Sign a Contract', emoji: '📝', description: 'Favorable for commitments', category: 'career', modifier: 1.0, favorableHourPlanets: ['Saturn', 'Mercury'], favorableMoonPhases: ['Waxing Gibbous', 'Full Moon'], favorableDaysOfWeek: [6, 3] },
    { id: 'network', label: 'Networking Event', emoji: '🤝', description: 'Great connections ahead', category: 'career', modifier: 0.95, favorableHourPlanets: ['Mercury', 'Venus'], favorableMoonPhases: ['First Quarter', 'Waxing Gibbous'], favorableDaysOfWeek: [3, 4, 5] },
    { id: 'presentation', label: 'Give a Presentation', emoji: '🎤', description: 'Communication is strong', category: 'career', modifier: 1.0, favorableHourPlanets: ['Mercury', 'Sun'], favorableMoonPhases: ['Full Moon', 'Waxing Gibbous'], favorableDaysOfWeek: [2, 3] },
  ],
  travel: [
    { id: 'vacation', label: 'Start a Vacation', emoji: '🏖️', description: 'Smooth travels and good vibes', category: 'travel', modifier: 1.0, favorableHourPlanets: ['Jupiter', 'Venus'], favorableMoonPhases: ['Waxing Gibbous', 'Full Moon'], favorableDaysOfWeek: [5, 6, 0] },
    { id: 'road-trip', label: 'Road Trip', emoji: '🚗', description: 'Adventurous energy', category: 'travel', modifier: 0.95, favorableHourPlanets: ['Mars', 'Mercury'], favorableMoonPhases: ['First Quarter', 'Waxing Gibbous'], favorableDaysOfWeek: [6, 0, 5] },
    { id: 'book-flights', label: 'Book Flights', emoji: '🎫', description: 'Good deals and clear plans', category: 'travel', modifier: 0.9, favorableHourPlanets: ['Mercury', 'Saturn'], favorableMoonPhases: ['Waning Gibbous', 'Last Quarter'], favorableDaysOfWeek: [2, 3] },
    { id: 'relocate', label: 'Move / Relocate', emoji: '📦', description: 'Favorable for big moves', category: 'travel', modifier: 1.1, favorableHourPlanets: ['Jupiter', 'Saturn'], favorableMoonPhases: ['New Moon', 'Waxing Crescent'], favorableDaysOfWeek: [1, 6] },
    { id: 'international', label: 'International Travel', emoji: '🌍', description: 'Great time for overseas trips', category: 'travel', modifier: 1.05, favorableHourPlanets: ['Jupiter', 'Sun'], favorableMoonPhases: ['Full Moon', 'Waxing Gibbous'], favorableDaysOfWeek: [4, 0] },
  ],
};

// ── Add chance/luck category ────────────────────────────────────

export type ExtendedCategory = BestTimesCategory | 'chance';

export const CHANCE_ACTIVITIES: SubActivity[] = [
  { id: 'play-lottery', label: 'Play the Lottery', emoji: '🎰', description: 'Jupiter luck + Moon intuition peak', category: 'finance', blendCategories: ['finance', 'travel'], modifier: 1.0, favorableHourPlanets: ['Jupiter', 'Moon'], favorableMoonPhases: ['Full Moon', 'Waxing Gibbous'], favorableDaysOfWeek: [4, 0] },
  { id: 'gamble-casino', label: 'Gamble at a Casino', emoji: '🎲', description: 'Risk-taking energy is amplified', category: 'career', blendCategories: ['career', 'finance'], modifier: 1.0, favorableHourPlanets: ['Mars', 'Jupiter'], favorableMoonPhases: ['First Quarter', 'Full Moon'], favorableDaysOfWeek: [2, 6] },
  { id: 'raffle', label: 'Enter a Raffle / Contest', emoji: '🎟️', description: 'Passive luck channels are open', category: 'love', blendCategories: ['love', 'finance'], modifier: 1.0, favorableHourPlanets: ['Venus', 'Jupiter'], favorableMoonPhases: ['Waxing Crescent', 'Waxing Gibbous'], favorableDaysOfWeek: [5, 3] },
  { id: 'scratch-off', label: 'Buy Scratch-Offs', emoji: '🍀', description: 'Small windfalls favored', category: 'health', blendCategories: ['health', 'finance'], modifier: 1.0, favorableHourPlanets: ['Moon', 'Venus'], favorableMoonPhases: ['Waxing Crescent', 'First Quarter'], favorableDaysOfWeek: [1, 5] },
  { id: 'bet-sports', label: 'Sports Betting', emoji: '⚽', description: 'Analytical intuition is sharpest', category: 'career', blendCategories: ['career', 'travel'], modifier: 1.0, favorableHourPlanets: ['Mercury', 'Mars'], favorableMoonPhases: ['Waxing Gibbous', 'Full Moon'], favorableDaysOfWeek: [6, 0, 3] },
];

const CATEGORIES: BestTimesCategory[] = ['love', 'career', 'health', 'travel', 'finance', 'beauty'];

/**
 * Get the best day for each activity category
 */
export function getBestDaysSummary(
  natalChart: NatalChart | null,
  startDate: Date = new Date(),
  days: number = 30
): BestDaysSummaryResult {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days);
  
  const summaries: BestDaySummary[] = [];
  const dayScores: Record<string, { date: Date; categories: BestTimesCategory[]; totalScore: number }> = {};
  
  for (const category of CATEGORIES) {
    const results = calculateBestTimes(category, natalChart, startDate, endDate);
    
    if (results.length > 0) {
      const best = results[0];
      const info = CATEGORY_INFO[category];
      
      summaries.push({
        category,
        emoji: info.emoji,
        label: info.label,
        bestDay: best.date,
        score: best.score,
        rating: best.rating,
        topReason: best.reasons[0] || 'Favorable alignments'
      });
      
      const dateKey = format(best.date, 'yyyy-MM-dd');
      if (!dayScores[dateKey]) {
        dayScores[dateKey] = { date: best.date, categories: [], totalScore: 0 };
      }
      dayScores[dateKey].categories.push(category);
      dayScores[dateKey].totalScore += best.score;
    }
  }
  
  const sortedDays = Object.values(dayScores).sort((a, b) => {
    if (b.categories.length !== a.categories.length) {
      return b.categories.length - a.categories.length;
    }
    return b.totalScore - a.totalScore;
  });
  
  const overallBestDay = sortedDays[0] || { date: startDate, categories: [] };
  
  return {
    summaries,
    overallBestDay: {
      date: overallBestDay.date,
      categories: overallBestDay.categories
    },
    period: { start: startDate, end: endDate }
  };
}

/**
 * Get best day for a specific sub-activity.
 * When blendCategories is set, combines scores from multiple categories
 * so each activity can land on a different best day.
 */
export function getSubActivityBestDay(
  activity: SubActivity,
  natalChart: NatalChart | null,
  startDate: Date = new Date(),
  days: number = 30
): SubActivityResult {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days);

  const cats = activity.blendCategories && activity.blendCategories.length > 0
    ? activity.blendCategories
    : [activity.category];

  // Use calculateAllDayScores so every day in the range has a data point
  const dayMap: Record<string, { date: Date; score: number; reasons: string[] }> = {};

  for (const cat of cats) {
    const allResults = calculateAllDayScores(cat, natalChart, startDate, endDate);
    for (const r of allResults) {
      const key = format(r.date, 'yyyy-MM-dd');
      if (!dayMap[key]) {
        dayMap[key] = { date: r.date, score: 0, reasons: [] };
      }
      dayMap[key].score += r.score;
      if (r.reasons.length > 0 && r.reasons[0] !== 'No strong alignments') {
        dayMap[key].reasons.push(...r.reasons);
      }
    }
  }

  // Apply modifier AND sub-activity-specific bonuses (planetary hour, moon phase, day of week)
  const entries = Object.values(dayMap).map(d => {
    let bonus = 0;
    const bonusReasons: string[] = [];

    // Planetary hour bonus — check noon of that day (strong weight)
    if (activity.favorableHourPlanets && activity.favorableHourPlanets.length > 0) {
      const noon = new Date(d.date);
      noon.setHours(12, 0, 0, 0);
      const hourInfo = getPlanetaryHourAt(noon);
      if (hourInfo && activity.favorableHourPlanets[0] === hourInfo.planet) {
        bonus += 50;
        bonusReasons.push(`${hourInfo.symbol} ${hourInfo.planet} Hour (primary)`);
      } else if (hourInfo && activity.favorableHourPlanets.includes(hourInfo.planet)) {
        bonus += 30;
        bonusReasons.push(`${hourInfo.symbol} ${hourInfo.planet} Hour`);
      }
    }

    // Moon phase bonus (strong weight)
    if (activity.favorableMoonPhases && activity.favorableMoonPhases.length > 0) {
      const moonPhase = getMoonPhase(d.date);
      if (activity.favorableMoonPhases[0] && moonPhase.phaseName.includes(activity.favorableMoonPhases[0])) {
        bonus += 40;
        bonusReasons.push(`${moonPhase.phaseName} (ideal)`);
      } else if (activity.favorableMoonPhases.some(p => moonPhase.phaseName.includes(p))) {
        bonus += 25;
        bonusReasons.push(`${moonPhase.phaseName}`);
      }
    }

    // Day of week bonus (moderate weight)
    if (activity.favorableDaysOfWeek && activity.favorableDaysOfWeek.length > 0) {
      const dow = getDay(d.date);
      if (activity.favorableDaysOfWeek[0] === dow) {
        bonus += 25;
      } else if (activity.favorableDaysOfWeek.includes(dow)) {
        bonus += 15;
      }
    }

    const allReasons = [...bonusReasons, ...d.reasons];
    return {
      date: d.date,
      score: Math.round((d.score + bonus) * activity.modifier),
      reason: allReasons[0] || 'Favorable alignments',
      reasons: allReasons,
    };
  });

  // Sort chronologically for allDays (wave chart) — but only the requested range
  const chronological = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Sort by score for top days
  const sorted = [...entries].sort((a, b) => b.score - a.score);

  // --- Normalize scores so the best day = 130 (maps to "Exceptional") ---
  const rawMax = sorted.length > 0 ? sorted[0].score : 1;
  const TARGET_MAX = 130; // maps to ★★★★★ Exceptional
  const scaleFactor = rawMax > 0 ? TARGET_MAX / rawMax : 1;

  const normalize = (raw: number) => Math.round(raw * scaleFactor);

  // Pick top 3 from the already-computed 30-day data (no extra scan)
  const topDays: SubActivityDayScore[] = [];
  for (const entry of sorted) {
    if (topDays.length >= 3) break;
    const tooClose = topDays.some(t => Math.abs(differenceInDays(t.date, entry.date)) < 7);
    if (!tooClose && entry.score > 0) {
      topDays.push({
        date: entry.date,
        score: normalize(entry.score),
        rating: scoreToRating(normalize(entry.score)),
        reason: entry.reason,
      });
    }
  }

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const todayEntry = entries.find(e => format(e.date, 'yyyy-MM-dd') === todayKey);
  const todayScoreRaw = todayEntry ? todayEntry.score : 0;
  const todayScoreNorm = normalize(todayScoreRaw);

  const allDays: SubActivityDayScore[] = chronological.map(d => ({
    date: d.date,
    score: normalize(d.score),
    rating: scoreToRating(normalize(d.score)),
    reason: d.reason,
  }));

  if (sorted.length > 0) {
    const best = sorted[0];
    return {
      activity,
      bestDay: best.date,
      score: normalize(best.score),
      rating: scoreToRating(normalize(best.score)),
      topReason: best.reason,
      topDays,
      todayScore: todayScoreNorm,
      todayRating: scoreToRating(todayScoreNorm),
      allDays,
    };
  }

  return {
    activity,
    bestDay: startDate,
    score: 0,
    rating: '—',
    topReason: 'No data available',
    topDays: [],
    todayScore: 0,
    todayRating: scoreToRating(0),
    allDays,
  };
}

/** Convert numeric score to a human-readable rating */
function scoreToRating(score: number): string {
  if (score >= 120) return '★★★★★ Exceptional';
  if (score >= 90) return '★★★★ Excellent';
  if (score >= 60) return '★★★ Good';
  if (score >= 30) return '★★ Fair';
  return '★ Low';
}

/**
 * Get category color class
 */
export function getCategoryColor(category: BestTimesCategory | 'chance'): string {
  const colors: Record<string, string> = {
    love: 'text-pink-500',
    career: 'text-amber-500',
    health: 'text-green-500',
    travel: 'text-blue-500',
    finance: 'text-emerald-500',
    beauty: 'text-purple-500',
    chance: 'text-yellow-500',
  };
  return colors[category] || 'text-muted-foreground';
}

/**
 * Get category background class
 */
export function getCategoryBg(category: BestTimesCategory | 'chance'): string {
  const colors: Record<string, string> = {
    love: 'bg-pink-100 dark:bg-pink-900/20',
    career: 'bg-amber-100 dark:bg-amber-900/20',
    health: 'bg-green-100 dark:bg-green-900/20',
    travel: 'bg-blue-100 dark:bg-blue-900/20',
    finance: 'bg-emerald-100 dark:bg-emerald-900/20',
    beauty: 'bg-purple-100 dark:bg-purple-900/20',
    chance: 'bg-yellow-100 dark:bg-yellow-900/20',
  };
  return colors[category] || 'bg-muted/20';
}

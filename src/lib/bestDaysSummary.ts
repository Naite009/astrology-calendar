/**
 * Best Days Summary Calculator
 * 
 * Shows the single best day for each activity category at a glance,
 * with specific sub-activities per category.
 */

import { calculateBestTimes, calculateAllDayScores, BestTimesCategory, BestTimeResult, CATEGORY_INFO } from './bestTimes';
import { NatalChart } from '@/hooks/useNatalChart';
import { format, differenceInDays } from 'date-fns';

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
    { id: 'find-partner', label: 'Find a Partner', emoji: '💘', description: 'Best day to meet someone new', category: 'love', modifier: 1.0 },
    { id: 'go-on-date', label: 'Go on a Date', emoji: '🥂', description: 'Ideal energy for romantic outings', category: 'love', modifier: 0.95 },
    { id: 'propose', label: 'Propose / Commit', emoji: '💍', description: 'Best day for big romantic gestures', category: 'love', modifier: 1.05 },
    { id: 'rekindle', label: 'Rekindle a Flame', emoji: '🔥', description: 'Great energy to reconnect with a past love', category: 'love', modifier: 0.9 },
    { id: 'love-letter', label: 'Write a Love Letter', emoji: '💌', description: 'Express deep feelings in words', category: 'love', modifier: 0.85 },
  ],
  finance: [
    { id: 'buy-stocks', label: 'Buy Stocks', emoji: '📈', description: 'Favorable energy for investments', category: 'finance', modifier: 1.0 },
    { id: 'sell-stocks', label: 'Sell Stocks', emoji: '📉', description: 'Good timing for profit-taking', category: 'finance', modifier: 0.95 },
    { id: 'negotiate', label: 'Negotiate a Deal', emoji: '🤝', description: 'Strong alignment for negotiations', category: 'finance', modifier: 1.05 },
    { id: 'ask-raise', label: 'Ask for a Raise', emoji: '💵', description: 'Aligned for compensation conversations', category: 'finance', modifier: 1.0 },
    { id: 'budget', label: 'Create a Budget', emoji: '📊', description: 'Clarity for financial planning', category: 'finance', modifier: 0.85 },
    { id: 'real-estate', label: 'Buy Property', emoji: '🏠', description: 'Favorable for real estate decisions', category: 'finance', modifier: 1.1 },
  ],
  health: [
    { id: 'start-diet', label: 'Start a Diet', emoji: '🥗', description: 'Best energy for new health routines', category: 'health', modifier: 1.0 },
    { id: 'surgery', label: 'Schedule Surgery', emoji: '🏥', description: 'Optimal for medical procedures', category: 'health', modifier: 1.1 },
    { id: 'begin-exercise', label: 'Start an Exercise Plan', emoji: '🏋️', description: 'Great energy for physical training', category: 'health', modifier: 1.0 },
    { id: 'detox', label: 'Detox / Cleanse', emoji: '🧘', description: 'Aligned for purification routines', category: 'health', modifier: 0.9 },
    { id: 'quit-habit', label: 'Quit a Bad Habit', emoji: '🚫', description: 'Willpower is at its peak', category: 'health', modifier: 0.95 },
  ],
  beauty: [
    { id: 'haircut', label: 'Get a Haircut', emoji: '💇', description: 'Hair grows back healthier', category: 'beauty', modifier: 1.0 },
    { id: 'spa-day', label: 'Spa Day', emoji: '🧖', description: 'Ideal for pampering and relaxation', category: 'beauty', modifier: 0.95 },
    { id: 'new-look', label: 'Try a New Look', emoji: '🪞', description: 'Bold style changes favored', category: 'beauty', modifier: 1.05 },
    { id: 'skincare', label: 'Start Skincare Routine', emoji: '✨', description: 'Best for new beauty rituals', category: 'beauty', modifier: 0.9 },
    { id: 'photo-shoot', label: 'Schedule a Photo Shoot', emoji: '📸', description: 'You will look your most radiant', category: 'beauty', modifier: 1.0 },
  ],
  career: [
    { id: 'job-interview', label: 'Job Interview', emoji: '🎯', description: 'Strong impression energy', category: 'career', modifier: 1.05 },
    { id: 'launch-business', label: 'Launch a Business', emoji: '🚀', description: 'Auspicious for new ventures', category: 'career', modifier: 1.1 },
    { id: 'sign-contract', label: 'Sign a Contract', emoji: '📝', description: 'Favorable for commitments', category: 'career', modifier: 1.0 },
    { id: 'network', label: 'Networking Event', emoji: '🤝', description: 'Great connections ahead', category: 'career', modifier: 0.95 },
    { id: 'presentation', label: 'Give a Presentation', emoji: '🎤', description: 'Communication is strong', category: 'career', modifier: 1.0 },
  ],
  travel: [
    { id: 'vacation', label: 'Start a Vacation', emoji: '🏖️', description: 'Smooth travels and good vibes', category: 'travel', modifier: 1.0 },
    { id: 'road-trip', label: 'Road Trip', emoji: '🚗', description: 'Adventurous energy', category: 'travel', modifier: 0.95 },
    { id: 'book-flights', label: 'Book Flights', emoji: '🎫', description: 'Good deals and clear plans', category: 'travel', modifier: 0.9 },
    { id: 'relocate', label: 'Move / Relocate', emoji: '📦', description: 'Favorable for big moves', category: 'travel', modifier: 1.1 },
    { id: 'international', label: 'International Travel', emoji: '🌍', description: 'Great time for overseas trips', category: 'travel', modifier: 1.05 },
  ],
};

// ── Add chance/luck category ────────────────────────────────────

export type ExtendedCategory = BestTimesCategory | 'chance';

export const CHANCE_ACTIVITIES: SubActivity[] = [
  { id: 'play-lottery', label: 'Play the Lottery', emoji: '🎰', description: 'Jupiter luck + Moon intuition peak', category: 'finance', blendCategories: ['finance', 'travel'], modifier: 0.8 },
  { id: 'gamble-casino', label: 'Gamble at a Casino', emoji: '🎲', description: 'Risk-taking energy is amplified', category: 'career', blendCategories: ['career', 'finance'], modifier: 0.75 },
  { id: 'raffle', label: 'Enter a Raffle / Contest', emoji: '🎟️', description: 'Passive luck channels are open', category: 'love', blendCategories: ['love', 'finance'], modifier: 0.7 },
  { id: 'scratch-off', label: 'Buy Scratch-Offs', emoji: '🍀', description: 'Small windfalls favored', category: 'health', blendCategories: ['health', 'finance'], modifier: 0.65 },
  { id: 'bet-sports', label: 'Sports Betting', emoji: '⚽', description: 'Analytical intuition is sharpest', category: 'career', blendCategories: ['career', 'travel'], modifier: 0.7 },
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

  // Apply modifier
  const entries = Object.values(dayMap).map(d => ({
    date: d.date,
    score: Math.round(d.score * activity.modifier),
    reason: d.reasons[0] || 'Favorable alignments',
    reasons: d.reasons,
  }));

  // Sort chronologically for allDays (wave chart)
  const chronological = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Sort by score for top days
  const sorted = [...entries].sort((a, b) => b.score - a.score);

  // Pick top 3 that are spread out (at least 3 days apart)
  const topDays: SubActivityDayScore[] = [];
  for (const entry of sorted) {
    if (topDays.length >= 3) break;
    const tooClose = topDays.some(t => Math.abs(differenceInDays(t.date, entry.date)) < 3);
    if (!tooClose) {
      topDays.push({
        date: entry.date,
        score: entry.score,
        rating: scoreToRating(entry.score),
        reason: entry.reason,
      });
    }
  }

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const todayEntry = entries.find(e => format(e.date, 'yyyy-MM-dd') === todayKey);
  const todayScore = todayEntry ? todayEntry.score : 0;

  const allDays: SubActivityDayScore[] = chronological.map(d => ({
    date: d.date,
    score: d.score,
    rating: scoreToRating(d.score),
    reason: d.reason,
  }));

  if (sorted.length > 0) {
    const best = sorted[0];
    return {
      activity,
      bestDay: best.date,
      score: best.score,
      rating: scoreToRating(best.score),
      topReason: best.reason,
      topDays,
      todayScore,
      todayRating: scoreToRating(todayScore),
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

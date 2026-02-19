/**
 * Best Days Summary Calculator
 * 
 * Shows the single best day for each activity category at a glance,
 * with specific sub-activities per category.
 */

import { calculateBestTimes, BestTimesCategory, BestTimeResult, CATEGORY_INFO } from './bestTimes';
import { NatalChart } from '@/hooks/useNatalChart';
import { format } from 'date-fns';

export interface SubActivity {
  id: string;
  label: string;
  emoji: string;
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

export interface SubActivityResult {
  activity: SubActivity;
  bestDay: Date;
  score: number;
  rating: string;
  topReason: string;
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
  { id: 'play-lottery', label: 'Play the Lottery', emoji: '🎰', description: 'Lucky numbers energy is high', category: 'finance', modifier: 0.8 },
  { id: 'gamble-casino', label: 'Gamble at a Casino', emoji: '🎲', description: 'Fortune favors the bold', category: 'finance', modifier: 0.75 },
  { id: 'raffle', label: 'Enter a Raffle / Contest', emoji: '🎟️', description: 'Chance of winning is elevated', category: 'finance', modifier: 0.7 },
  { id: 'scratch-off', label: 'Buy Scratch-Offs', emoji: '🍀', description: 'Small luck is sparkling', category: 'finance', modifier: 0.65 },
  { id: 'bet-sports', label: 'Sports Betting', emoji: '⚽', description: 'Intuition for outcomes is sharp', category: 'finance', modifier: 0.7 },
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
 * Get best day for a specific sub-activity
 */
export function getSubActivityBestDay(
  activity: SubActivity,
  natalChart: NatalChart | null,
  startDate: Date = new Date(),
  days: number = 30
): SubActivityResult {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days);
  
  const results = calculateBestTimes(activity.category, natalChart, startDate, endDate);
  
  if (results.length > 0) {
    // Apply modifier to scores and re-sort
    const modified = results.map(r => ({
      ...r,
      score: Math.round(r.score * activity.modifier)
    })).sort((a, b) => b.score - a.score);
    
    const best = modified[0];
    return {
      activity,
      bestDay: best.date,
      score: best.score,
      rating: best.rating,
      topReason: best.reasons[0] || 'Favorable alignments'
    };
  }
  
  return {
    activity,
    bestDay: startDate,
    score: 0,
    rating: '—',
    topReason: 'No data available'
  };
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

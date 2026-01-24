/**
 * Best Days Summary Calculator
 * 
 * Shows the single best day for each activity category at a glance.
 */

import { calculateBestTimes, BestTimesCategory, BestTimeResult, CATEGORY_INFO } from './bestTimes';
import { NatalChart } from '@/hooks/useNatalChart';
import { format } from 'date-fns';

export interface BestDaySummary {
  category: BestTimesCategory;
  emoji: string;
  label: string;
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
      const best = results[0]; // Already sorted by score
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
      
      // Track day scores for overall best
      const dateKey = format(best.date, 'yyyy-MM-dd');
      if (!dayScores[dateKey]) {
        dayScores[dateKey] = { date: best.date, categories: [], totalScore: 0 };
      }
      dayScores[dateKey].categories.push(category);
      dayScores[dateKey].totalScore += best.score;
    }
  }
  
  // Find overall best day (most categories or highest combined score)
  const sortedDays = Object.values(dayScores).sort((a, b) => {
    // First by number of categories
    if (b.categories.length !== a.categories.length) {
      return b.categories.length - a.categories.length;
    }
    // Then by total score
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
 * Get category color class
 */
export function getCategoryColor(category: BestTimesCategory): string {
  const colors: Record<BestTimesCategory, string> = {
    love: 'text-pink-500',
    career: 'text-amber-500',
    health: 'text-green-500',
    travel: 'text-blue-500',
    finance: 'text-emerald-500',
    beauty: 'text-purple-500'
  };
  return colors[category];
}

/**
 * Get category background class
 */
export function getCategoryBg(category: BestTimesCategory): string {
  const colors: Record<BestTimesCategory, string> = {
    love: 'bg-pink-100 dark:bg-pink-900/20',
    career: 'bg-amber-100 dark:bg-amber-900/20',
    health: 'bg-green-100 dark:bg-green-900/20',
    travel: 'bg-blue-100 dark:bg-blue-900/20',
    finance: 'bg-emerald-100 dark:bg-emerald-900/20',
    beauty: 'bg-purple-100 dark:bg-purple-900/20'
  };
  return colors[category];
}

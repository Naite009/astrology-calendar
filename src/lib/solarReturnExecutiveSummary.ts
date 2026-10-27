/**
 * Executive summary = a view over the ranked, validated year story. It has no
 * interpretation language of its own: no benefic/malefic opportunity-vs-challenge
 * split, no archetype certainty, no eclipse or cycle-repetition claims.
 */
import type { SolarReturnAnalysis } from './solarReturnAnalysis';
import type { NatalChart } from '@/hooks/useNatalChart';
import { buildYearStory } from './solarReturnYearStory';
import { validateSolarReturnProse } from '../../supabase/functions/_shared/solarReturnProseQuality';

export interface RankedPriority {
  rank: number;
  title: string;
  /** Client meaning from the shared, quality-gated translator ('' when withheld). */
  description: string;
  /** Exact chart evidence labels, never rewritten. */
  source: string;
  house: number | null;
  /** Number of different kinds of chart evidence pointing here. */
  reinforcements: number;
}

export interface ExecutiveSummary {
  leadTheme: string;
  coreFocus: string;
  priorities: RankedPriority[];
  /** Factual emphasis labels from the year story hierarchy. */
  evidenceHierarchy: { label: string; detail: string }[];
  methodNote: string;
}

const safe = (text: string) => (text && !validateSolarReturnProse(text).length ? text : '');

export function generateExecutiveSummary(analysis: SolarReturnAnalysis, _natalChart?: NatalChart): ExecutiveSummary {
  const story = buildYearStory(analysis);
  const priorities = story.themes.slice(0, 3).map((theme, i) => ({
    rank: i + 1,
    title: theme.title,
    description: safe(theme.summary),
    source: theme.signatures.join('; '),
    house: theme.house ?? null,
    reinforcements: theme.reinforcements,
  }));
  return {
    leadTheme: story.themes[0]?.title || '',
    coreFocus: story.coreStory.split('\n').map(safe).filter(Boolean).join('\n'),
    priorities,
    evidenceHierarchy: story.hierarchy,
    methodNote: 'Ranked by how many different kinds of chart evidence repeat a life area (profection, Sun house, angles, tight contacts). The ranking shows emphasis, not good or bad outcomes.',
  };
}

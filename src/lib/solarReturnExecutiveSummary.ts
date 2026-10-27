/** Executive summaries reuse the ranked year story, never benefic/malefic event forecasts. */
import type { SolarReturnAnalysis } from './solarReturnAnalysis';
import type { NatalChart } from '@/hooks/useNatalChart';
import { buildYearStory } from './solarReturnYearStory';
export interface OpportunityChallenge {
  type: 'opportunity' | 'challenge';
  title: string;
  description: string;
  source: string;       // what generated this (e.g. "Jupiter in 10th", "Venus trine Sun")
  house?: number | null;
  intensity: number;     // 1-10
}

export interface PatternRecognition {
  pattern: string;
  description: string;
  connection: string;    // how it links to natal/past
  category: 'recurring' | 'eclipse' | 'cycle' | 'natal-echo';
}

export interface ExecutiveSummary {
  coreFocus: string;                    // 1 sentence
  opportunities: OpportunityChallenge[];  // top 3
  challenges: OpportunityChallenge[];     // top 3
  patterns: PatternRecognition[];
  yearArchetype: string;                // e.g. "A Builder's Year", "A Year of Harvest"
  yearArchetypeDescription: string;
}


export function generateExecutiveSummary(analysis: SolarReturnAnalysis, _natalChart: NatalChart): ExecutiveSummary {
  const story = buildYearStory(analysis);
  const opportunities: OpportunityChallenge[] = story.themes.slice(0, 3).map(theme => ({
    type: 'opportunity', title: theme.title, description: theme.summary, house: theme.house,
    source: theme.signatures.join(' '), intensity: Math.min(10, theme.reinforcements),
  }));
  return { coreFocus: story.coreStory, opportunities, challenges: [], patterns: [],
    yearArchetype: story.themes[0]?.title || 'Annual priorities',
    yearArchetypeDescription: story.themes[0]?.summary || '' };
}

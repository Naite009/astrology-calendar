/**
 * Tier-specific AI prompts for PDF narrative sections.
 */
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';
import { buildChartDataBlock } from './oraclePrompt';

/** Tier 3 PDF — student astrologer / enthusiast audience */
export const buildTier3PDFPrompt = (
  analysis: SolarReturnAnalysis,
  srChart: SolarReturnChart,
  natalChart: NatalChart,
): string => {
  const chartData = buildChartDataBlock(analysis, srChart, natalChart);

  return `You are writing a personalized year-ahead reading for someone who 
knows some astrology but is not a professional. They understand basic terms 
like Mercury retrograde, Sun sign, and house meanings, but don't need 
advanced technique names.

Write 350–450 words as flowing paragraphs.
Use warm, clear language with occasional astrology terms when helpful.
No bullet points. No section headers in the narrative itself.
Ground every statement in the chart data below.
Never invent placements, aspects, or dates not listed in the data.
The SR Moon is a STATIC SNAPSHOT — it does NOT advance 1°/month.

CHART DATA:
${chartData}

Focus on: what this year is about, how it will feel, what to lean into,
what to watch for. Make it feel personal and true to this specific chart.`;
};

/** Tier 4-5 PDF — serious student / practitioner audience */
export const buildTier45PDFPrompt = (
  analysis: SolarReturnAnalysis,
  srChart: SolarReturnChart,
  natalChart: NatalChart,
): string => {
  const chartData = buildChartDataBlock(analysis, srChart, natalChart);

  return `You are a professional astrologer writing a detailed year-ahead 
synthesis for a client who studies astrology seriously.

Write 500–700 words as flowing paragraphs.
Technical terms are appropriate and welcome.
Synthesize multiple techniques into a coherent narrative.
Never separate techniques into sections — weave them together.
Ground every statement in the chart data below.
Never invent placements, aspects, or dates not listed in the data.
The SR Moon is a STATIC SNAPSHOT — it does NOT advance 1°/month.

CHART DATA:
${chartData}

Techniques to synthesize: profection year + Time Lord condition + 
SR Moon + stelliums + key SR-to-natal aspects + degree conduits + 
repeated themes. Show how they reinforce or tension each other.`;
};

/**
 * Final Advice — "How to Use This Year"
 * The closing section of the report. Warm, practical, personalized.
 * Mirrors the tone of the "Take This With You" PDF page.
 */

import { SolarReturnAnalysis } from './solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { buildYearSummary } from './solarReturnYearSummary';

export interface FinalAdvice {
  leanInto: string[];
  avoid: string[];
  bestTiming: string[];
  mostIntenseMonths: string[];
  howToUseThisYear: string;
  closingMessage: string;
}

const PROFECTION_HOUSE_FOCUS: Record<number, string> = {
  1: 'your identity and how you show up in the world',
  2: 'your finances, income, and sense of self-worth',
  3: 'your voice, your ideas, and everyday connections',
  4: 'home, family, and your emotional foundation',
  5: 'creativity, joy, and the things that make you feel alive',
  6: 'your health, daily routines, and work habits',
  7: 'partnerships and the relationships that matter most',
  8: 'transformation, shared resources, and personal breakthroughs',
  9: 'expansion — travel, learning, and a bigger worldview',
  10: 'your career, public reputation, and long-term direction',
  11: 'friendships, community, and your vision for the future',
  12: 'rest, reflection, and the quiet inner work that matters most',
};

const CLOSING_QUOTES: Record<number, { quote: string; author: string }> = {
  1: { quote: 'Becoming is better than being.', author: 'Carol Dweck' },
  2: { quote: 'Know your worth, then add tax.', author: '' },
  3: { quote: 'The right word may be effective, but no word was ever as effective as a rightly timed pause.', author: 'Mark Twain' },
  4: { quote: 'Where we love is home — home that our feet may leave, but not our hearts.', author: 'Oliver Wendell Holmes' },
  5: { quote: 'You cannot use up creativity. The more you use, the more you have.', author: 'Maya Angelou' },
  6: { quote: 'Take care of your body. It is the only place you have to live.', author: 'Jim Rohn' },
  7: { quote: 'The meeting of two personalities is like the contact of two chemical substances: if there is any reaction, both are transformed.', author: 'C.G. Jung' },
  8: { quote: 'What we do not need in the midst of struggle is shame for being human.', author: 'Brené Brown' },
  9: { quote: 'The world is a book, and those who do not travel read only one page.', author: 'Saint Augustine' },
  10: { quote: 'Whatever you are, be a good one.', author: 'Abraham Lincoln' },
  11: { quote: 'The glory of friendship is the spiritual inspiration that comes when you discover that someone else believes in you.', author: 'Ralph Waldo Emerson' },
  12: { quote: 'Almost everything will work again if you unplug it for a few minutes — including you.', author: 'Anne Lamott' },
};

export function buildFinalAdvice(
  analysis: SolarReturnAnalysis,
  natalChart: NatalChart,
  srChart: SolarReturnChart,
): FinalAdvice {
  const yearSummary = buildYearSummary(analysis, natalChart, srChart);
  const name = natalChart.name || 'You';
  const profH = analysis.profectionYear?.houseNumber || 1;
  const profFocus = PROFECTION_HOUSE_FOCUS[profH] || 'the work that matters most';
  const moonPhase = analysis.moonPhase?.phase || '';
  const isBalsamic = moonPhase.toLowerCase().includes('balsamic');
  const isNew = moonPhase.toLowerCase().includes('new');

  // Lean into — warm, plain language
  const leanInto = yearSummary.advice.leanInto.map(item => warmify(item));
  if (leanInto.length === 0) leanInto.push('Honest self-expression and meaningful conversations');

  // Avoid — reframed as gentle warnings
  const avoid = yearSummary.advice.beCarefulOf.map(item => warmifyAvoid(item));
  if (avoid.length === 0) avoid.push('Spreading yourself too thin — protect your energy');

  // Best timing
  const bestTiming = yearSummary.advice.bestMonths.length > 0
    ? yearSummary.advice.bestMonths
    : ['The first three months after your birthday carry the strongest momentum'];

  const mostIntenseMonths = yearSummary.advice.mostIntenseMonths.length > 0
    ? yearSummary.advice.mostIntenseMonths
    : ['Check your activation windows for the most important dates'];

  // How to use this year — personalized paragraph
  const howToUseThisYear = buildHowToUse(name, profFocus, profH, isBalsamic, isNew, yearSummary);

  // Closing message — warm, matches "Take This With You" tone
  const quoteData = CLOSING_QUOTES[profH] || CLOSING_QUOTES[1];
  const closingMessage = [
    `${name}, this report is a map, not a mandate.`,
    `The themes described here are the weather of your year — they do not decide what you build in it.`,
    `Use what resonates. Return to these pages when you need orientation.`,
    ``,
    `"${quoteData.quote}"`,
    quoteData.author ? `— ${quoteData.author}` : '',
    ``,
    `Happy Birthday. Trust your inner wisdom.`,
  ].filter(Boolean).join('\n');

  return {
    leanInto,
    avoid,
    bestTiming,
    mostIntenseMonths,
    howToUseThisYear,
    closingMessage,
  };
}

function buildHowToUse(
  name: string, profFocus: string, profH: number,
  isBalsamic: boolean, isNew: boolean, yearSummary: any,
): string {
  const parts: string[] = [];

  parts.push(`This year calls you toward ${profFocus}.`);

  if (isBalsamic) {
    parts.push(`This is a completion year — the most important work happens quietly. Finish what you started, release what no longer fits, and make space for the fresh cycle that begins next year.`);
  } else if (isNew) {
    parts.push(`This is a beginning year — plant seeds boldly. You have a window to start something genuinely new, and the momentum is on your side.`);
  } else {
    parts.push(`Trust the process. Not every year is about dramatic breakthroughs — some years are about showing up consistently and building something real.`);
  }

  if (yearSummary.focusAreas.length > 0) {
    parts.push(`Your biggest areas of focus are: ${yearSummary.focusAreas.join(', ')}.`);
  }

  if (yearSummary.topOpportunities.length > 0) {
    parts.push(`Watch for opportunities around: ${yearSummary.topOpportunities[0].split('.')[0]}.`);
  }

  parts.push(`When in doubt, come back to what feels true rather than what feels urgent.`);

  return parts.join(' ');
}

function warmify(item: string): string {
  return item
    .replace(/lean into discomfort/gi, 'stretch beyond your comfort zone')
    .replace(/say yes to expansion/gi, 'say yes to growth')
    .replace(/channel intensity into action, not conflict/gi, 'put your energy into action, not arguments');
}

function warmifyAvoid(item: string): string {
  return item
    .replace(/control issues/gi, 'trying to control outcomes')
    .replace(/self-deception/gi, 'wishful thinking')
    .replace(/anger and impatience/gi, 'reacting too quickly')
    .replace(/reopened wounds — healing hurts before it helps/gi, 'old hurts resurfacing — be gentle with yourself as they heal');
}

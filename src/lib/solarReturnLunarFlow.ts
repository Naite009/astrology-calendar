/**
 * Lunar Year Flow — SR Moon phase, emotional theme, important moon months.
 * This is the unique angle that differentiates the report.
 */

import { SolarReturnAnalysis } from './solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';

export interface ImportantMoonMonth {
  month: string;
  theme: string;
}

export interface LunarFlow {
  srMoonPhase: string;
  srMoonSign: string;
  srMoonHouse: number | null;
  emotionalTheme: string;
  monthlyEmotionalReset: boolean;
  importantMoonMonths: ImportantMoonMonth[];
}

// Phase themes are hedged Rudhyar cycle-stage readings; sign-only emotional
// stereotypes are not published (the Moon's house meaning is used instead).
const MOON_PHASE_THEMES: Record<string, { theme: string; reset: boolean }> = {
  'New Moon':        { theme: 'You may want to start a plan or project rather than finish old ones this year.', reset: true },
  'Crescent':        { theme: 'A plan you started may need steady effort before it feels settled.', reset: true },
  'Waxing Crescent': { theme: 'A plan you started may need steady effort before it feels settled.', reset: true },
  'First Quarter':   { theme: 'You may face a decision about a plan that asks you to act rather than wait.', reset: false },
  'Gibbous':         { theme: 'You may want to review and adjust a project before you show it to others.', reset: false },
  'Waxing Gibbous':  { theme: 'You may want to review and adjust a project before you show it to others.', reset: false },
  'Full Moon':       { theme: 'You may see the results of a plan more clearly, including how other people respond.', reset: false },
  'Disseminating':   { theme: 'You may want to share or teach what you have learned from a recent project.', reset: false },
  'Waning Gibbous':  { theme: 'You may want to share or teach what you have learned from a recent project.', reset: false },
  'Last Quarter':    { theme: 'You may decide to change or stop a routine that no longer fits your plans.', reset: true },
  'Balsamic':        { theme: 'You may want to finish projects and clear your schedule before starting something new.', reset: true },
  'Waning Crescent': { theme: 'You may want to finish projects and clear your schedule before starting something new.', reset: true },
};

const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function buildLunarFlow(
  analysis: SolarReturnAnalysis,
  srChart: SolarReturnChart,
  natalChart: NatalChart,
): LunarFlow {
  const moonPhaseRaw = analysis.moonPhase;
  const moonPhaseStr = typeof moonPhaseRaw === 'string' ? moonPhaseRaw : (moonPhaseRaw?.phase || 'New Moon');
  const moonSign = analysis.moonSign || srChart.planets?.Moon?.sign || '';
  const moonHouse = analysis.moonHouse?.house ?? null;

  const phaseData = MOON_PHASE_THEMES[moonPhaseStr] || MOON_PHASE_THEMES['New Moon'];
  const emotionalTheme = phaseData.theme;

  // Important moon months based on sign transits and SR aspects
  const importantMoonMonths: ImportantMoonMonth[] = [];

  // Months when transiting Moon returns to SR Moon sign (lunar returns)
  const natalMoonSign = natalChart.planets?.Moon?.sign || '';
  const srMoonSign = moonSign;

  // Month where SR Moon sign matches the solar month
  const SIGN_MONTH: Record<string, number> = {
    Aries: 3, Taurus: 4, Gemini: 5, Cancer: 6, Leo: 7, Virgo: 8,
    Libra: 9, Scorpio: 10, Sagittarius: 11, Capricorn: 0, Aquarius: 1, Pisces: 2,
  };

  // Add key months
  if (srMoonSign) {
    const srMoonMonth = SIGN_MONTH[srMoonSign];
    if (srMoonMonth !== undefined) {
      importantMoonMonths.push({
        month: MONTHS_FULL[srMoonMonth],
        theme: `Approximate month: the Sun is in ${srMoonSign}, the sign of your Solar Return Moon. You may notice what helps you feel settled more around this time.`,
      });
    }
  }

  // Full/New moon in SR Moon sign (roughly the month when Sun opposes/conjoins)
  if (srMoonSign) {
    // Sun opposite the Moon's sign falls six solar months later.
    const oppMonthIdx = SIGN_MONTH[srMoonSign] !== undefined ? (SIGN_MONTH[srMoonSign] + 6) % 12 : undefined;
    if (oppMonthIdx !== undefined) {
      importantMoonMonths.push({
        month: MONTHS_FULL[oppMonthIdx],
        theme: `Approximate month: the Sun is opposite ${srMoonSign}, so the Full Moon falls in your Solar Return Moon sign. You may review how your routines are working.`,
      });
    }
  }

  // Eclipse months if eclipse sensitivity exists
  const eclipses = analysis.eclipseSensitivity || [];
  for (const ecl of eclipses.slice(0, 2)) {
    const eclDate = (ecl as any).date || (ecl as any).dateLabel;
    if (eclDate) {
      importantMoonMonths.push({
        month: typeof eclDate === 'string' ? eclDate.split(' ')[0] : 'Eclipse month',
        theme: `An eclipse listed for this chart falls in this month. It is timing context, not a forecast of a specific event.`,
      });
    }
  }

  // Moon VOC year = very important emotional dynamics
  if (analysis.moonVOC) {
    importantMoonMonths.push({
      month: 'All year',
      theme: 'The Solar Return Moon is void of course (no further major aspects before it changes sign).',
    });
  }

  return {
    srMoonPhase: moonPhaseStr,
    srMoonSign: moonSign,
    srMoonHouse: moonHouse,
    emotionalTheme,
    monthlyEmotionalReset: phaseData.reset,
    importantMoonMonths: importantMoonMonths.slice(0, 5),
  };
}

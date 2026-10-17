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

const MOON_PHASE_THEMES: Record<string, { theme: string; reset: boolean }> = {
  'New Moon':        { theme: 'A year of new emotional beginnings. Your feelings are fresh and uncertain — trust the instinct to plant seeds rather than harvest.', reset: true },
  'Waxing Crescent': { theme: 'Emerging emotional clarity after a quiet period. This year you start to see what you want and take tentative steps toward it.', reset: true },
  'First Quarter':   { theme: 'Plans may ask for concrete decisions. Friction can sharpen priorities rather than signal failure.', reset: false },
  'Waxing Gibbous':  { theme: 'Building emotional momentum. Your feelings gain structure and direction — this is a year of refinement, not revolution.', reset: false },
  'Full Moon':       { theme: 'Results and other people\'s responses may be easier to see. Relationships can act as a mirror.', reset: false },
  'Waning Gibbous':  { theme: 'Sharing what you\'ve learned emotionally. This year you teach, mentor, or integrate hard-won emotional wisdom.', reset: false },
  'Last Quarter':    { theme: 'Releasing emotional patterns that no longer serve you. Some habits or commitments may be questioned. Sorting what to keep from what to change is the work.', reset: true },
  'Waning Crescent': { theme: 'Deep emotional rest before a new cycle. This year favors solitude, reflection, and tying up loose ends before the next chapter.', reset: true },
  'Crescent':        { theme: 'Early effort on recent beginnings. Some plans may need patience before they feel settled.', reset: true },
  'Gibbous':         { theme: 'Refining what already exists. Adjustments may matter more than new starts.', reset: false },
  'Disseminating':   { theme: 'Sharing what experience has taught you. Explaining or mentoring may feel natural.', reset: false },
  'Balsamic':        { theme: 'Finishing and reflecting may matter more than starting. This does not predict isolation or low energy.', reset: true },
};

const SIGN_EMOTIONAL_FLAVOR: Record<string, string> = {
  Aries: 'Emotional life is direct and impulsive — you feel things fast and move on quickly',
  Taurus: 'Emotional life is slow and sensual — you need physical comfort and stability to feel safe',
  Gemini: 'Emotional life is curious and restless — you process feelings through talking and thinking',
  Cancer: 'Emotional life is deep and protective — home and family dominate your inner world',
  Leo: 'Emotional life is dramatic and warm — you need to be seen, appreciated, and celebrated',
  Virgo: 'Emotional life is analytical and service-oriented — you process feelings through fixing and helping',
  Libra: 'Emotional life centers on relationships — you feel most alive in partnership and harmony',
  Scorpio: 'Emotional life is intense and private — you feel everything deeply and share selectively',
  Sagittarius: 'Emotional life is optimistic and restless — you need adventure and meaning to feel alive',
  Capricorn: 'Emotional life is controlled and purposeful — you process feelings through achievement and structure',
  Aquarius: 'Emotional life is detached and idealistic — you process feelings through community and ideas',
  Pisces: 'Emotional life is boundless and empathic — you absorb everyone else\'s feelings along with your own',
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
  const signFlavor = SIGN_EMOTIONAL_FLAVOR[moonSign] || '';
  const emotionalTheme = `${phaseData.theme} ${signFlavor ? `This year: ${signFlavor}.` : ''}`;

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
        theme: `Sun enters ${srMoonSign} — your SR Moon sign is activated. Emotional themes of the year peak.`,
      });
    }
  }

  // Full/New moon in SR Moon sign (roughly the month when Sun opposes/conjoins)
  if (srMoonSign) {
    const oppSignIdx = (Object.values(SIGN_MONTH).indexOf(SIGN_MONTH[srMoonSign]) + 6) % 12;
    const oppMonth = Object.entries(SIGN_MONTH).find(([, v]) => v === oppSignIdx);
    if (oppMonth) {
      importantMoonMonths.push({
        month: MONTHS_FULL[oppSignIdx],
        theme: `Full Moon illuminates your SR Moon themes — emotional culmination point for the year.`,
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
        theme: `Eclipse activates your chart — unexpected emotional shifts and accelerated changes.`,
      });
    }
  }

  // Moon VOC year = very important emotional dynamics
  if (analysis.moonVOC) {
    importantMoonMonths.push({
      month: 'All year',
      theme: 'Moon Void of Course — emotional life operates independently. Trust your internal compass.',
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

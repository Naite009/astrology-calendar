/**
 * Pattern Tracking Hooks — connects this SR year to larger life cycles.
 * Designed for future journaling/past-data integration.
 */

import { SolarReturnAnalysis } from './solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';

export interface PatternTracking {
  eclipseConnections: string[];
  repeatingThemesFromPastYears: string[];
  saturnCycleConnection: boolean;
  saturnCycleNote: string;
  jupiterCycleConnection: boolean;
  jupiterCycleNote: string;
  metonicReturn: boolean;
  metonicNote: string;
  notes: string;
}

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

export function buildPatternTracking(
  analysis: SolarReturnAnalysis,
  natalChart: NatalChart,
  srChart: SolarReturnChart,
): PatternTracking {
  const eclipseConnections: string[] = [];
  const repeatingThemes: string[] = [];

  // Factual cycle labels only. Eclipses, cycles and echoes are listed as timing
  // context; no event forecasts, destiny claims or "fast-forward" language.
  for (const ecl of (analysis.eclipseSensitivity || [])) {
    const sign = (ecl as any).sign || (ecl as any).eclipseSign || '';
    const type = (ecl as any).type || 'Eclipse';
    eclipseConnections.push(`${type}${sign ? ` in ${sign}` : ''} is listed as a sensitive point for this chart.`);
  }

  const natalSaturnSign = natalChart.planets?.Saturn?.sign || '';
  const srSaturnSign = srChart.planets?.Saturn?.sign || '';
  const saturnCycleConnection = !!natalSaturnSign && natalSaturnSign === srSaturnSign;
  let saturnCycleNote = '';
  if (saturnCycleConnection) {
    saturnCycleNote = `Solar Return Saturn is in ${srSaturnSign}, the same sign as natal Saturn.`;
  } else {
    const nIdx = SIGNS.indexOf(natalSaturnSign);
    const sIdx = SIGNS.indexOf(srSaturnSign);
    if (nIdx >= 0 && sIdx >= 0) {
      const dist = ((sIdx - nIdx) + 12) % 12;
      if (dist === 3 || dist === 9) saturnCycleNote = `Solar Return Saturn in ${srSaturnSign} is a square sign from natal Saturn in ${natalSaturnSign} (quarter of the Saturn cycle, by sign).`;
      else if (dist === 6) saturnCycleNote = `Solar Return Saturn in ${srSaturnSign} is opposite natal Saturn's sign, ${natalSaturnSign} (half of the Saturn cycle, by sign).`;
    }
  }

  const natalJupiterSign = natalChart.planets?.Jupiter?.sign || '';
  const srJupiterSign = srChart.planets?.Jupiter?.sign || '';
  const jupiterCycleConnection = !!natalJupiterSign && natalJupiterSign === srJupiterSign;
  const jupiterCycleNote = jupiterCycleConnection ? `Solar Return Jupiter is in ${srJupiterSign}, the same sign as natal Jupiter (roughly a 12-year cycle).` : '';

  const metonicAges = analysis.moonMetonicAges || [];
  const metonicReturn = metonicAges.length > 0;
  const metonicNote = metonicReturn ? `The Solar Return Moon is near its position at age${metonicAges.length > 1 ? 's' : ''} ${metonicAges.join(', ')} (19-year Moon cycle).` : '';

  const natalNNSign = natalChart.planets?.NorthNode?.sign || '';
  const srNNSign = srChart.planets?.NorthNode?.sign || '';
  if (natalNNSign && srNNSign) {
    if (natalNNSign === srNNSign) repeatingThemes.push(`Solar Return North Node is in ${srNNSign}, the same sign as the natal North Node (sign-level nodal return).`);
    const nIdx = SIGNS.indexOf(natalNNSign);
    const sIdx = SIGNS.indexOf(srNNSign);
    if (nIdx >= 0 && sIdx >= 0 && ((sIdx - nIdx + 12) % 12) === 6) repeatingThemes.push(`Solar Return North Node in ${srNNSign} is opposite the natal North Node sign, ${natalNNSign}.`);
  }

  const profYear = analysis.profectionYear;
  if (profYear?.houseNumber && profYear.age >= 12) {
    repeatingThemes.push(`Annual profection house ${profYear.houseNumber} was also the profection house at age ${profYear.age - 12}.`);
  }

  const notes = [
    eclipseConnections.length ? `${eclipseConnections.length} eclipse sensitive point(s) listed.` : '',
    saturnCycleConnection ? 'Saturn sign repeat.' : '',
    jupiterCycleConnection ? 'Jupiter sign repeat.' : '',
    metonicReturn ? '19-year Moon cycle echo.' : '',
  ].filter(Boolean).join(' ') || 'No sign-level cycle repeats detected.';

  return {
    eclipseConnections,
    repeatingThemesFromPastYears: repeatingThemes,
    saturnCycleConnection: !!saturnCycleConnection,
    saturnCycleNote,
    jupiterCycleConnection,
    jupiterCycleNote,
    metonicReturn,
    metonicNote,
    notes,
  };
}

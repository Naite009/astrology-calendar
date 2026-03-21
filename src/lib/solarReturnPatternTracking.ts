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

  // Eclipse connections
  for (const ecl of (analysis.eclipseSensitivity || [])) {
    const sign = (ecl as any).sign || (ecl as any).eclipseSign || '';
    const type = (ecl as any).type || 'eclipse';
    eclipseConnections.push(`${type} in ${sign} activates your chart — fast-forward button for life events in this area.`);
  }

  // Saturn cycle — does SR Saturn return to natal Saturn's sign or house?
  const natalSaturnSign = natalChart.planets?.Saturn?.sign || '';
  const srSaturnSign = srChart.planets?.Saturn?.sign || '';
  const natalSaturnHouse = natalChart.planets?.Saturn?.house;
  const srSaturnHouse = analysis.planetSRHouses?.Saturn;

  const saturnCycleConnection = natalSaturnSign === srSaturnSign ||
    (natalSaturnHouse && srSaturnHouse && String(natalSaturnHouse) === String(srSaturnHouse));

  let saturnCycleNote = '';
  if (natalSaturnSign === srSaturnSign) {
    saturnCycleNote = `Saturn is in ${srSaturnSign} — the same sign as your natal Saturn. Saturn cycle themes (responsibility, maturity, structure) are echoing loudly this year.`;
  } else {
    const nIdx = SIGNS.indexOf(natalSaturnSign);
    const sIdx = SIGNS.indexOf(srSaturnSign);
    if (nIdx >= 0 && sIdx >= 0) {
      const dist = ((sIdx - nIdx) + 12) % 12;
      if (dist === 3 || dist === 9) {
        saturnCycleNote = `Saturn squares your natal Saturn — a quarter-cycle pressure point. Expect structural tests.`;
      } else if (dist === 6) {
        saturnCycleNote = `Saturn opposes your natal Saturn — a half-cycle reckoning. What you built is being tested.`;
      }
    }
  }

  // Jupiter cycle — does SR Jupiter return to natal Jupiter's sign?
  const natalJupiterSign = natalChart.planets?.Jupiter?.sign || '';
  const srJupiterSign = srChart.planets?.Jupiter?.sign || '';
  const jupiterCycleConnection = natalJupiterSign === srJupiterSign;
  const jupiterCycleNote = jupiterCycleConnection
    ? `Jupiter returns to ${srJupiterSign} — your natal Jupiter sign. A 12-year growth cycle completes and restarts. Opportunities echo themes from ~12 years ago.`
    : '';

  // Metonic return (19-year Moon cycle)
  const metonicAges = analysis.moonMetonicAges || [];
  const metonicReturn = metonicAges.length > 0;
  const metonicNote = metonicReturn
    ? `Your SR Moon echoes the position from age${metonicAges.length > 1 ? 's' : ''} ${metonicAges.join(', ')}. Emotional patterns from those periods resurface.`
    : '';

  // Repeating themes from node positions
  const natalNNSign = natalChart.planets?.NorthNode?.sign || '';
  const srNNSign = srChart.planets?.NorthNode?.sign || '';
  if (natalNNSign && srNNSign) {
    if (natalNNSign === srNNSign) {
      repeatingThemes.push(`North Node returns to ${natalNNSign} — a nodal return year. Destiny-level events possible. This only happens every ~18.6 years.`);
    }
    const nIdx = SIGNS.indexOf(natalNNSign);
    const sIdx = SIGNS.indexOf(srNNSign);
    if (nIdx >= 0 && sIdx >= 0 && ((sIdx - nIdx + 12) % 12) === 6) {
      repeatingThemes.push(`North Node opposes your natal nodes — a nodal reversal year. What felt destined now requires conscious choice.`);
    }
  }

  // Profection echoes
  const profYear = analysis.profectionYear;
  if (profYear) {
    const house = (profYear as any).house || (profYear as any).houseNumber;
    if (house) {
      repeatingThemes.push(`Profection year activates House ${house} — themes from age ${((profYear as any).age || 0) - 12} may echo.`);
    }
  }

  const notes = [
    eclipseConnections.length > 0 ? `${eclipseConnections.length} eclipse connection(s) this year.` : '',
    saturnCycleConnection ? 'Saturn cycle is active.' : '',
    jupiterCycleConnection ? 'Jupiter return year.' : '',
    metonicReturn ? '19-year Moon cycle echo active.' : '',
  ].filter(Boolean).join(' ') || 'No major cycle connections detected this year — a relatively independent chapter.';

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

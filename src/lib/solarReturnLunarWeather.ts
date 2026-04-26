/**
 * Lunar Emotional Weather Map
 * Lunar return triggers, monthly emotional resets, Moon transit checkpoints every ~2.5 days
 */

import { SolarReturnAnalysis } from './solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

export interface LunarReturnEvent {
  month: string;           // "Jan", "Feb", etc.
  monthIndex: number;      // 0-11 from birthday
  lunarReturnSign: string; // Moon returns to its natal sign
  emotionalTheme: string;  // what this reset brings
  intensity: number;       // 1-5
}

export interface MoonTransitCheckpoint {
  dayOffset: number;       // days from birthday
  sign: string;            // what sign Moon is transiting
  emotionalTone: string;   // brief emotional flavor
  dateLabel: string;       // approximate date
}

export interface LunarWeatherMonth {
  month: string;
  monthIndex: number;
  lunarReturn: LunarReturnEvent;
  checkpoints: MoonTransitCheckpoint[];
  overallTone: string;
  peakDay: number;         // day offset of highest intensity
  interpretation: string;  // narrative of what this month feels like emotionally
}

export interface LunarWeatherMap {
  natalMoonSign: string;
  months: LunarWeatherMonth[];
  yearPattern: string;     // overall emotional narrative
  emotionalPeaks: string[];  // months with highest intensity
  quietMonths: string[];     // months with lowest intensity
}

const MOON_SIGN_EMOTIONAL: Record<string, { tone: string; theme: string; intensity: number }> = {
  Aries:       { tone: 'impulsive energy', theme: 'Emotional restarts and instinctive reactions. Your feelings move fast — honor the impulse without burning bridges.', intensity: 4 },
  Taurus:      { tone: 'grounded comfort', theme: 'Emotional stability and sensory comfort. You crave security, good food, and physical affection. Slow down.', intensity: 2 },
  Gemini:      { tone: 'mental restlessness', theme: 'Scattered emotional energy. Talking helps process feelings. Journaling, texting, social interaction all serve as emotional outlets.', intensity: 3 },
  Cancer:      { tone: 'deep sensitivity', theme: 'Heightened emotional receptivity. Home, family, and nurturing instincts dominate. You absorb others\' moods like a sponge.', intensity: 5 },
  Leo:         { tone: 'warm expressiveness', theme: 'Dramatic emotional expression. You need recognition and warmth. Creativity becomes an emotional outlet.', intensity: 3 },
  Virgo:       { tone: 'analytical processing', theme: 'Emotions filtered through analysis. You organize feelings by problem-solving. Health and routines provide emotional stability.', intensity: 2 },
  Libra:       { tone: 'harmony seeking', theme: 'Emotional equilibrium through relationships. Conflict feels destabilizing. Beauty and fairness become emotional anchors.', intensity: 2 },
  Scorpio:     { tone: 'emotional intensity', theme: 'Deep, probing emotional states. Nothing surface-level satisfies. You need truth, intimacy, and transformation.', intensity: 5 },
  Sagittarius: { tone: 'restless optimism', theme: 'Emotional freedom and philosophical processing. Movement — physical or intellectual — is how you regulate.', intensity: 3 },
  Capricorn:   { tone: 'controlled composure', theme: 'Emotions held in check. You process through work, structure, and long-term planning. Vulnerability feels risky.', intensity: 2 },
  Aquarius:    { tone: 'detached observation', theme: 'Emotional distance as a coping mechanism. You intellectualize feelings. Community and ideals matter more than personal drama.', intensity: 2 },
  Pisces:      { tone: 'oceanic sensitivity', theme: 'Boundless emotional receptivity. Dreams intensify, boundaries dissolve. Art, music, and solitude become essential.', intensity: 5 },
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function generateLunarWeatherMap(
  analysis: SolarReturnAnalysis,
  srChart: SolarReturnChart,
  natalChart: NatalChart
): LunarWeatherMap {
  const natalMoon = natalChart.planets?.Moon;
  const natalMoonSign = natalMoon?.sign || 'Cancer';

  // Birthday month
  const bd = natalChart.birthDate || '';
  const parts = bd.split('-');
  const bMonth = parts.length >= 2 ? parseInt(parts[1], 10) - 1 : 0;

  const months: LunarWeatherMonth[] = [];
  const emotionalPeaks: string[] = [];
  const quietMonths: string[] = [];

  // Natal Moon sign index (used to compute lunar return month + as fallback)
  const natalMoonIdx = SIGNS.indexOf(natalMoonSign);

  for (let i = 0; i < 12; i++) {
    const calMonth = (bMonth + i) % 12;
    const monthName = MONTH_NAMES[calMonth];

    // Per-month dominant transiting Moon sign.
    // The Moon advances ~1 sign per 2.3 days. Across a calendar month it visits all 12,
    // so the "dominant" sign per month is the one the lunation (new/full moon) falls in,
    // which we approximate as the Sun's current sign at mid-month — Moon at lunation
    // is conjunct (new) or opposite (full) the Sun. We rotate through the zodiac so each
    // month gets a different felt-sense tone.
    // Use Sun sign rotation starting from the SR Sun sign as a stable, varying anchor.
    const srSunSign = srChart?.planets?.Sun?.sign || SIGNS[(bMonth + 9) % 12];
    const srSunIdx = Math.max(0, SIGNS.indexOf(srSunSign));
    const monthDominantIdx = (srSunIdx + i) % 12;
    const monthDominantSign = SIGNS[monthDominantIdx];

    // Lunar return: Moon returns to its NATAL sign each month — that's the emotional reset.
    // The lunarReturn.lunarReturnSign stays the natal Moon sign (this is the definition
    // of a lunar return). What varies per month is the dominant transiting tone.
    const lunarReturn = generateLunarReturn(natalMoonSign, monthName, i);

    // Moon transits through ~12 signs per month (~2.5 days each)
    const checkpoints = generateMonthCheckpoints(i, calMonth, srChart.solarReturnYear, bMonth);

    // Modify intensity based on aspects active that month
    let monthIntensity = lunarReturn.intensity;

    // Eclipse months get boosted
    if (analysis.eclipseSensitivity.some(e => {
      // approximate: if eclipse is in this month range
      return true; // simplified — all eclipse sensitivity applies
    })) {
      monthIntensity = Math.min(5, monthIntensity + 1);
    }

    // Peak day — day in month when Moon crosses natal Moon degree
    const peakDay = Math.round(i * 30.4 + 14); // approximately mid-month

    // Overall tone now uses the per-month transiting dominant sign so each month feels distinct
    const overallTone = getMonthTone(i, monthDominantSign, natalMoonSign, analysis);
    const interpretation = getMonthInterpretation(i, natalMoonSign, monthDominantSign, monthIntensity, monthName);

    months.push({
      month: monthName,
      monthIndex: i,
      lunarReturn,
      checkpoints,
      overallTone,
      peakDay,
      interpretation,
    });

    if (lunarReturn.intensity >= 4) emotionalPeaks.push(monthName);
    if (lunarReturn.intensity <= 2) quietMonths.push(monthName);
  }

  const yearPattern = buildYearPattern(natalMoonSign, analysis, emotionalPeaks);

  return {
    natalMoonSign,
    months,
    yearPattern,
    emotionalPeaks,
    quietMonths,
  };
}

function generateLunarReturn(natalMoonSign: string, monthName: string, monthOffset: number): LunarReturnEvent {
  const signData = MOON_SIGN_EMOTIONAL[natalMoonSign] || MOON_SIGN_EMOTIONAL.Cancer;

  // Every month the Moon returns to natal sign — this is the "emotional reset"
  // Intensity varies by season of the SR year
  let intensity = signData.intensity;
  // First and last months of SR year tend to be more emotionally charged
  if (monthOffset === 0 || monthOffset === 11) intensity = Math.min(5, intensity + 1);
  // Mid-year is usually steadier
  if (monthOffset >= 4 && monthOffset <= 7) intensity = Math.max(1, intensity - 1);

  return {
    month: monthName,
    monthIndex: monthOffset,
    lunarReturnSign: natalMoonSign,
    emotionalTheme: signData.theme,
    intensity,
  };
}

function generateMonthCheckpoints(monthOffset: number, calMonth: number, year: number, bMonth: number): MoonTransitCheckpoint[] {
  const checkpoints: MoonTransitCheckpoint[] = [];
  const baseDay = monthOffset * 30;

  // Moon moves through ~12 signs per 27.3 days, so ~2.3 days per sign
  // Generate 12 checkpoints per month (one per sign transit)
  for (let s = 0; s < 12; s++) {
    const dayInMonth = Math.round(s * 2.5);
    const dayOffset = baseDay + dayInMonth;
    const sign = SIGNS[(calMonth + s) % 12]; // simplified rotation
    const signData = MOON_SIGN_EMOTIONAL[sign] || MOON_SIGN_EMOTIONAL.Cancer;

    // Calculate approximate date
    const actualMonth = (bMonth + monthOffset) % 12;
    const dayNum = Math.min(28, dayInMonth + 1);

    checkpoints.push({
      dayOffset,
      sign,
      emotionalTone: signData.tone,
      dateLabel: `${MONTH_NAMES[actualMonth]} ${dayNum}`,
    });
  }

  return checkpoints;
}

function getMonthTone(monthOffset: number, monthDominantSign: string, natalMoonSign: string, analysis: SolarReturnAnalysis): string {
  const phases = ['settling in', 'building momentum', 'gaining clarity', 'finding rhythm',
    'mid-year plateau', 'deepening', 'harvesting', 'integrating',
    'reflecting', 'shifting gears', 'winding down', 'completing the cycle'];

  const base = phases[monthOffset] || 'transitioning';
  const dominantData = MOON_SIGN_EMOTIONAL[monthDominantSign] || MOON_SIGN_EMOTIONAL.Cancer;
  const natalData = MOON_SIGN_EMOTIONAL[natalMoonSign] || MOON_SIGN_EMOTIONAL.Cancer;

  return `A month of ${base} — the lunation in ${monthDominantSign} colors this period with ${dominantData.tone}, while your ${natalMoonSign} Moon keeps ${natalData.tone} as the underlying baseline.`;
}

function getMonthInterpretation(monthOffset: number, natalMoonSign: string, monthDominantSign: string, intensity: number, monthName: string): string {
  const natalData = MOON_SIGN_EMOTIONAL[natalMoonSign] || MOON_SIGN_EMOTIONAL.Cancer;
  const dominantData = MOON_SIGN_EMOTIONAL[monthDominantSign] || MOON_SIGN_EMOTIONAL.Cancer;
  const phase = monthOffset <= 2 ? 'early' : monthOffset <= 5 ? 'building' : monthOffset <= 8 ? 'mid-year' : 'closing';
  const intensityDesc = intensity >= 4 ? 'emotionally charged' : intensity >= 3 ? 'moderately active' : 'relatively calm';

  const phaseNarrative: Record<string, string> = {
    early: `${monthName} falls in the opening months of your birthday year. Your emotional radar is resetting, adjusting to the new annual themes.`,
    building: `${monthName} is a building phase. The emotional patterns of the year are becoming clearer and more established.`,
    'mid-year': `${monthName} sits at the year's midpoint. Emotional themes that started earlier are now at their peak or require conscious attention.`,
    closing: `${monthName} is in the closing stretch of the birthday year. Emotional integration and reflection on what this year has taught you.`,
  };

  return `${phaseNarrative[phase]} This month's lunation falls in ${monthDominantSign}, bringing ${dominantData.tone} to the foreground — ${dominantData.theme} It is a ${intensityDesc} month overall. When the Moon returns to your natal ${natalMoonSign} this month, you'll feel the familiar pull back to ${natalData.tone}: take time to check in with your core emotional needs.`;
}

function buildYearPattern(natalMoonSign: string, analysis: SolarReturnAnalysis, peaks: string[]): string {
  const moonData = MOON_SIGN_EMOTIONAL[natalMoonSign];
  const peakStr = peaks.length > 0 ? peaks.join(', ') : 'no particular month';

  return `With your natal Moon in ${natalMoonSign}, your emotional baseline this year runs on ${moonData?.tone || 'steady processing'}. Each month when the Moon returns to ${natalMoonSign}, you experience an emotional reset, a chance to reconnect with your core needs. Emotional peaks cluster around ${peakStr}. Between these resets, the Moon's journey through all twelve signs creates a 2.5-day rhythm of shifting moods and emotional textures.`;
}

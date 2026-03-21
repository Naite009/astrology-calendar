/**
 * Year Summary Object — the single most important object in the export.
 * Synthesizes all analysis into a front-page overview.
 */

import { SolarReturnAnalysis } from './solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { generateExecutiveSummary } from './solarReturnExecutiveSummary';
import { calculateLifeDomainScores } from './solarReturnLifeDomainScores';
import { generateIdentityShift } from './solarReturnIdentityShift';
import { generateLunarWeatherMap } from './solarReturnLunarWeather';

export interface YearSummaryAdvice {
  leanInto: string[];
  beCarefulOf: string[];
  bestMonths: string[];
  mostIntenseMonths: string[];
}

export interface YearSummary {
  coreTheme: string;
  topOpportunities: string[];
  topChallenges: string[];
  focusAreas: string[];
  identityShift: string;
  relationshipTheme: string;
  careerMoneyTheme: string;
  emotionalTheme: string;
  advice: YearSummaryAdvice;
}

const HOUSE_FOCUS: Record<number, string> = {
  1: 'Identity & Self-Image', 2: 'Finances & Self-Worth', 3: 'Communication & Learning',
  4: 'Home & Family', 5: 'Creativity & Romance', 6: 'Health & Daily Routines',
  7: 'Partnerships & Marriage', 8: 'Transformation & Shared Resources',
  9: 'Travel & Higher Learning', 10: 'Career & Public Image',
  11: 'Community & Future Vision', 12: 'Spiritual Growth & Inner Work',
};

const PLANET_LEAN_IN: Record<string, string> = {
  Jupiter: 'growth opportunities — say yes to expansion',
  Venus: 'relationships and beauty — invest in what you love',
  Sun: 'self-expression — take center stage when invited',
  Moon: 'emotional honesty — trust your gut feelings',
  Mercury: 'learning and communication — write, teach, connect',
  Mars: 'bold action — start what you\'ve been putting off',
  NorthNode: 'your growth edge — lean into discomfort',
};

const PLANET_CAREFUL: Record<string, string> = {
  Saturn: 'overwork and rigidity — structure is good, obsession is not',
  Pluto: 'control issues — let transformation happen instead of forcing it',
  Neptune: 'escapism and self-deception — stay grounded in reality',
  Uranus: 'impulsive changes — not every urge to blow things up is wisdom',
  Mars: 'anger and impatience — channel intensity into action, not conflict',
  Chiron: 'reopened wounds — healing hurts before it helps',
};

export function buildYearSummary(
  analysis: SolarReturnAnalysis,
  natalChart: NatalChart,
  srChart: SolarReturnChart,
): YearSummary {
  const exec = generateExecutiveSummary(analysis, natalChart);
  const domains = calculateLifeDomainScores(analysis);
  const identity = generateIdentityShift(analysis, srChart, natalChart);
  const lunar = generateLunarWeatherMap(analysis, srChart, natalChart);

  // Core theme from executive summary
  const coreTheme = exec.coreFocus || `A ${exec.yearArchetype} year focused on ${analysis.yearlyTheme?.ascendantSign || 'growth'}.`;

  // Top opportunities
  const topOpportunities = exec.opportunities.slice(0, 3).map(o => o.description || o.title);

  // Top challenges
  const topChallenges = exec.challenges.slice(0, 3).map(c => c.description || c.title);

  // Focus areas from most active houses
  const houseActivity: Record<number, number> = {};
  for (const overlay of (analysis.houseOverlays || [])) {
    const h = overlay.srHouse || overlay.natalHouse;
    if (h) houseActivity[h] = (houseActivity[h] || 0) + 1;
  }
  const topHouses = Object.entries(houseActivity)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([h]) => parseInt(h));
  const focusAreas = topHouses.map(h => HOUSE_FOCUS[h] || `House ${h}`);

  // Identity shift narrative
  const identityShiftText = identity?.headline
    ? `${identity.headline}. ${identity.becomingNarrative?.split('.').slice(0, 2).join('.') || ''}.`
    : 'Subtle identity evolution — the changes are internal this year.';

  // Domain themes
  const relationshipTheme = buildDomainTheme(domains, 'love', analysis);
  const careerMoneyTheme = buildDomainTheme(domains, 'career', analysis) + ' ' + buildDomainTheme(domains, 'money', analysis);
  const emotionalTheme = lunar?.yearPattern || buildDomainTheme(domains, 'home', analysis);

  // Advice
  const leanInto: string[] = [];
  const beCarefulOf: string[] = [];

  // Angular benefics → lean in
  for (const ap of (analysis.angularPlanets || [])) {
    const planet = typeof ap === 'string' ? ap : (ap as any).planet;
    if (PLANET_LEAN_IN[planet]) leanInto.push(PLANET_LEAN_IN[planet]);
  }

  // House placements → lean in
  const srHouses = analysis.planetSRHouses || {};
  for (const [planet, house] of Object.entries(srHouses)) {
    if (['Jupiter', 'Venus'].includes(planet) && PLANET_LEAN_IN[planet] && !leanInto.includes(PLANET_LEAN_IN[planet])) {
      leanInto.push(PLANET_LEAN_IN[planet]);
    }
    if (['Saturn', 'Pluto', 'Neptune'].includes(planet) && PLANET_CAREFUL[planet] && !beCarefulOf.includes(PLANET_CAREFUL[planet])) {
      beCarefulOf.push(PLANET_CAREFUL[planet]);
    }
  }

  // Retrogrades → careful
  for (const retro of (analysis.retrogrades || [])) {
    const planet = typeof retro === 'string' ? retro : (retro as any).planet;
    if (PLANET_CAREFUL[planet] && !beCarefulOf.includes(PLANET_CAREFUL[planet])) {
      beCarefulOf.push(PLANET_CAREFUL[planet]);
    }
  }

  if (leanInto.length === 0) leanInto.push('Self-expression and honest conversations');
  if (beCarefulOf.length === 0) beCarefulOf.push('Spreading yourself too thin');

  // Best / most intense months from monthly themes or activation data
  const bestMonths: string[] = [];
  const mostIntenseMonths: string[] = [];

  // Use domain scores to figure out which domains have benefic tone
  for (const d of domains) {
    if (d.tone > 2 && d.activity >= 4) {
      const monthHint = getMonthHintForDomain(d.domain, analysis);
      if (monthHint && !bestMonths.includes(monthHint)) bestMonths.push(monthHint);
    }
    if (d.tone < -1 && d.activity >= 5) {
      const monthHint = getMonthHintForDomain(d.domain, analysis);
      if (monthHint && !mostIntenseMonths.includes(monthHint)) mostIntenseMonths.push(monthHint);
    }
  }

  // Fallback: use lunar peaks
  if (bestMonths.length === 0 && lunar?.emotionalPeaks) {
    bestMonths.push(...lunar.emotionalPeaks.slice(0, 2));
  }
  if (mostIntenseMonths.length === 0) {
    // Eclipse months or Saturn transit months
    mostIntenseMonths.push('Check activation windows for timing');
  }

  return {
    coreTheme,
    topOpportunities,
    topChallenges,
    focusAreas,
    identityShift: identityShiftText,
    relationshipTheme,
    careerMoneyTheme: careerMoneyTheme.trim(),
    emotionalTheme,
    advice: {
      leanInto: leanInto.slice(0, 4),
      beCarefulOf: beCarefulOf.slice(0, 4),
      bestMonths: bestMonths.slice(0, 3),
      mostIntenseMonths: mostIntenseMonths.slice(0, 3),
    },
  };
}

function buildDomainTheme(domains: any[], domainId: string, analysis: SolarReturnAnalysis): string {
  const d = domains.find((x: any) => x.domain === domainId || x.id === domainId);
  if (!d) return '';
  const toneLabel = d.tone > 2 ? 'Supportive energy' : d.tone < -1 ? 'Challenging pressure' : 'Mixed energy';
  const drivers = (d.drivers || []).slice(0, 2).map((dr: any) => dr.planet || dr.source || '').filter(Boolean).join(' and ');
  return `${toneLabel}${drivers ? ` driven by ${drivers}` : ''}.`;
}

function getMonthHintForDomain(domain: string, analysis: SolarReturnAnalysis): string | null {
  // Map domains to approximate months based on profection timing
  const profYear = (analysis as any).profectionYear;
  if (!profYear) return null;
  const houseMap: Record<string, number[]> = {
    love: [5, 7], career: [6, 10], money: [2, 8], health: [1, 6],
    home: [4], creativity: [5], growth: [9], spirituality: [12],
  };
  const houses = houseMap[domain];
  if (!houses) return null;
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  // Use profection house as offset
  const startMonth = (profYear.house || 1) - 1;
  return MONTHS[(startMonth + houses[0]) % 12];
}

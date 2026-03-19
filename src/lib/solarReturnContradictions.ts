/**
 * Contradiction Resolution (T5 Oracle)
 * Detects opposing placements and generates synthesis narratives
 */

import { SolarReturnAnalysis } from './solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';

export interface ContradictionResolution {
  title: string;          // e.g. "Visibility vs Privacy"
  tension: string;        // "You may feel pulled between X and Y because..."
  synthesis: string;      // how to integrate both
  placement1: string;     // e.g. "Sun in 10th House"
  placement2: string;     // e.g. "Moon in 12th House"
  category: 'house-axis' | 'element-clash' | 'planet-tension' | 'mode-conflict';
}

interface PlacementInfo {
  planet: string;
  house: number;
  sign: string;
}

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const ELEMENT: Record<string, string> = {
  Aries: 'Fire', Taurus: 'Earth', Gemini: 'Air', Cancer: 'Water',
  Leo: 'Fire', Virgo: 'Earth', Libra: 'Air', Scorpio: 'Water',
  Sagittarius: 'Fire', Capricorn: 'Earth', Aquarius: 'Air', Pisces: 'Water',
};

const MODE: Record<string, string> = {
  Aries: 'Cardinal', Taurus: 'Fixed', Gemini: 'Mutable', Cancer: 'Cardinal',
  Leo: 'Fixed', Virgo: 'Mutable', Libra: 'Cardinal', Scorpio: 'Fixed',
  Sagittarius: 'Mutable', Capricorn: 'Cardinal', Aquarius: 'Fixed', Pisces: 'Mutable',
};

const HOUSE_THEME: Record<number, string> = {
  1: 'self-focus', 2: 'material security', 3: 'communication', 4: 'private life',
  5: 'creative expression', 6: 'daily routines', 7: 'partnerships',
  8: 'deep transformation', 9: 'expansion', 10: 'public visibility',
  11: 'community', 12: 'solitude and inner work',
};

const AXIS_TENSIONS: [number, number, string, string][] = [
  [1, 7, 'Independence vs Partnership', 'Your need for self-assertion and your pull toward committed relationships'],
  [2, 8, 'Self-Sufficiency vs Shared Resources', 'Your drive for financial independence and the necessity of merging resources or surrendering control'],
  [3, 9, 'Local Knowledge vs Big Picture', 'Everyday learning and communication vs the call to expand your worldview'],
  [4, 10, 'Private Life vs Public Ambition', 'Your need for emotional security at home and the demand to show up publicly'],
  [5, 11, 'Personal Creativity vs Group Purpose', 'Your individual self-expression and the needs of your community or social circle'],
  [6, 12, 'Practical Routines vs Spiritual Surrender', 'The structure of daily work and health vs the call to let go and trust the unseen'],
];

export function detectContradictions(
  analysis: SolarReturnAnalysis,
  srChart: SolarReturnChart
): ContradictionResolution[] {
  const results: ContradictionResolution[] = [];
  const placements = gatherPlacements(analysis, srChart);

  // 1. House axis tensions — planets on opposite sides
  for (const [h1, h2, title, tensionBase] of AXIS_TENSIONS) {
    const inH1 = placements.filter(p => p.house === h1);
    const inH2 = placements.filter(p => p.house === h2);

    if (inH1.length > 0 && inH2.length > 0) {
      const p1 = inH1[0];
      const p2 = inH2[0];
      results.push({
        title,
        tension: `You may feel pulled between ${HOUSE_THEME[h1]} and ${HOUSE_THEME[h2]} because ${p1.planet} occupies your ${ordinal(h1)} House while ${p2.planet} sits in the ${ordinal(h2)} House. ${tensionBase} are both activated simultaneously.`,
        synthesis: buildAxisSynthesis(p1, p2, h1, h2),
        placement1: `${p1.planet} in ${ordinal(h1)} House (${p1.sign})`,
        placement2: `${p2.planet} in ${ordinal(h2)} House (${p2.sign})`,
        category: 'house-axis',
      });
    }
  }

  // 2. Sun-Moon element clash
  const sunPlace = placements.find(p => p.planet === 'Sun');
  const moonPlace = placements.find(p => p.planet === 'Moon');
  if (sunPlace && moonPlace) {
    const sunEl = ELEMENT[sunPlace.sign];
    const moonEl = ELEMENT[moonPlace.sign];
    if (sunEl && moonEl && sunEl !== moonEl && areClashingElements(sunEl, moonEl)) {
      results.push({
        title: `${sunEl} Purpose vs ${moonEl} Emotions`,
        tension: `You may feel pulled between your ${sunEl} Sun's drive for ${elementDrive(sunEl)} and your ${moonEl} Moon's need for ${elementDrive(moonEl)}. Your conscious goals and emotional instincts speak different languages this year.`,
        synthesis: `The resolution lives in alternation rather than choice. Give your ${sunEl} Sun time to lead during active hours and your ${moonEl} Moon space to process in quieter moments. Neither is wrong — they are two instruments playing different parts of the same composition.`,
        placement1: `Sun in ${sunPlace.sign}`,
        placement2: `Moon in ${moonPlace.sign}`,
        category: 'element-clash',
      });
    }
  }

  // 3. Saturn-Jupiter tension (restriction vs expansion)
  const saturnPlace = placements.find(p => p.planet === 'Saturn');
  const jupiterPlace = placements.find(p => p.planet === 'Jupiter');
  if (saturnPlace && jupiterPlace) {
    const satH = saturnPlace.house;
    const jupH = jupiterPlace.house;
    if (satH && jupH && satH !== jupH) {
      // Check if they're in tensional aspect
      const hasTension = analysis.srInternalAspects.some(
        a => ((a.planet1 === 'Saturn' && a.planet2 === 'Jupiter') || (a.planet1 === 'Jupiter' && a.planet2 === 'Saturn'))
          && ['Square', 'Opposition', 'Quincunx'].includes(a.type)
      );
      if (hasTension) {
        results.push({
          title: 'Expansion vs Restriction',
          tension: `You may feel pulled between Jupiter's desire to expand in ${HOUSE_THEME[jupH] || 'this area'} and Saturn's demand for discipline in ${HOUSE_THEME[satH] || 'that area'}. One foot on the gas, one on the brake.`,
          synthesis: `Saturn is not blocking Jupiter — it's providing the container. Growth without structure collapses. Use Saturn's ${ordinal(satH)} House discipline as the scaffolding for Jupiter's ${ordinal(jupH)} House expansion. Build slowly and the growth will be lasting.`,
          placement1: `Jupiter in ${ordinal(jupH)} House (${jupiterPlace.sign})`,
          placement2: `Saturn in ${ordinal(satH)} House (${saturnPlace.sign})`,
          category: 'planet-tension',
        });
      }
    }
  }

  // 4. Mars-Venus tension
  const marsPlace = placements.find(p => p.planet === 'Mars');
  const venusPlace = placements.find(p => p.planet === 'Venus');
  if (marsPlace && venusPlace) {
    const marsMode = MODE[marsPlace.sign];
    const venusMode = MODE[venusPlace.sign];
    if (marsMode && venusMode && marsMode !== venusMode) {
      const hasTension = analysis.srInternalAspects.some(
        a => ((a.planet1 === 'Mars' && a.planet2 === 'Venus') || (a.planet1 === 'Venus' && a.planet2 === 'Mars'))
          && ['Square', 'Opposition', 'Quincunx'].includes(a.type)
      );
      if (hasTension) {
        results.push({
          title: 'Desire vs Assertion',
          tension: `You may feel pulled between Venus's ${venusMode} approach to pleasure and connection (${venusPlace.sign}) and Mars's ${marsMode} drive for action (${marsPlace.sign}). What you want and how you go after it are operating on different rhythms.`,
          synthesis: `Let Venus lead in matters of the heart and aesthetic choices. Let Mars take charge of ambition and physical energy. The friction between them creates heat — and that heat can be channeled into creative or romantic intensity if you don't force alignment.`,
          placement1: `Venus in ${venusPlace.sign} (${ordinal(venusPlace.house)} House)`,
          placement2: `Mars in ${marsPlace.sign} (${ordinal(marsPlace.house)} House)`,
          category: 'mode-conflict',
        });
      }
    }
  }

  return results.slice(0, 5); // cap at 5 most relevant
}

function gatherPlacements(analysis: SolarReturnAnalysis, srChart: SolarReturnChart): PlacementInfo[] {
  const result: PlacementInfo[] = [];
  const corePlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'NorthNode'];

  for (const planet of corePlanets) {
    const pos = srChart.planets?.[planet as keyof typeof srChart.planets];
    const house = analysis.planetSRHouses[planet];
    if (pos?.sign && house) {
      result.push({ planet, house, sign: pos.sign });
    }
  }
  return result;
}

function buildAxisSynthesis(p1: PlacementInfo, p2: PlacementInfo, h1: number, h2: number): string {
  return `The resolution is not choosing ${HOUSE_THEME[h1]} over ${HOUSE_THEME[h2]} — it's finding the rhythm between both. ${p1.planet} in ${p1.sign} asks you to honor ${HOUSE_THEME[h1]}, while ${p2.planet} in ${p2.sign} ensures ${HOUSE_THEME[h2]} stays in the conversation. Integrate by giving each sphere its own dedicated time rather than trying to do both simultaneously.`;
}

function areClashingElements(e1: string, e2: string): boolean {
  return (e1 === 'Fire' && e2 === 'Water') || (e1 === 'Water' && e2 === 'Fire')
      || (e1 === 'Earth' && e2 === 'Air') || (e1 === 'Air' && e2 === 'Earth');
}

function elementDrive(el: string): string {
  if (el === 'Fire') return 'action, spontaneity, and forward momentum';
  if (el === 'Water') return 'emotional depth, reflection, and intuitive processing';
  if (el === 'Earth') return 'stability, tangible results, and practical progress';
  return 'intellectual stimulation, social connection, and mental freedom';
}

function ordinal(n: number): string {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

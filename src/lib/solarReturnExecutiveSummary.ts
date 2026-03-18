/**
 * Executive Summary + Pattern Recognition
 * 
 * Top 3 Opportunities, Top 3 Challenges, Core Focus sentence,
 * and pattern recognition linking SR themes to natal patterns.
 */

import { SolarReturnAnalysis, SRKeyAspect, SRStellium } from './solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';

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

const HOUSE_KEYWORDS: Record<number, string> = {
  1: 'identity', 2: 'finances', 3: 'communication', 4: 'home',
  5: 'creativity', 6: 'health', 7: 'relationships', 8: 'transformation',
  9: 'expansion', 10: 'career', 11: 'community', 12: 'inner work',
};

const PLANET_NOUNS: Record<string, string> = {
  Sun: 'purpose', Moon: 'emotional life', Mercury: 'communication', Venus: 'relationships',
  Mars: 'drive', Jupiter: 'growth', Saturn: 'discipline', Uranus: 'change',
  Neptune: 'intuition', Pluto: 'transformation',
};

function scoreAspectOpportunity(asp: SRKeyAspect): { score: number; isOpp: boolean } {
  const benefic = ['Trine', 'Sextile', 'Conjunction'];
  const malefic = ['Square', 'Opposition', 'Quincunx'];
  const isBenefic = benefic.includes(asp.type);

  // Jupiter/Venus aspects are more opportunity-oriented
  const beneficPlanets = ['Jupiter', 'Venus'];
  const p1Benefic = beneficPlanets.includes(asp.planet1);
  const p2Benefic = beneficPlanets.includes(asp.planet2);

  // Saturn/Pluto aspects are more challenge-oriented
  const maleficPlanets = ['Saturn', 'Pluto', 'Mars'];
  const p1Malefic = maleficPlanets.includes(asp.planet1);
  const p2Malefic = maleficPlanets.includes(asp.planet2);

  let score = 10 - (asp.orb * 2); // tighter orb = higher score

  if (isBenefic && (p1Benefic || p2Benefic)) return { score: score + 3, isOpp: true };
  if (!isBenefic && (p1Malefic || p2Malefic)) return { score: score + 2, isOpp: false };
  if (isBenefic) return { score, isOpp: true };
  return { score, isOpp: false };
}

function getYearArchetype(analysis: SolarReturnAnalysis): { name: string; description: string } {
  const sunH = analysis.sunHouse?.house || 1;
  const moonPhase = analysis.moonPhase?.phase || '';
  const saturnH = analysis.saturnFocus?.house;
  const jupiterH = analysis.planetSRHouses?.Jupiter;

  // Moon phase archetypes
  if (moonPhase.includes('New')) return {
    name: 'A Year of New Beginnings',
    description: 'This is a planting year — seeds sown now grow for years. Trust impulse over analysis. Start things.',
  };
  if (moonPhase.includes('Full')) return {
    name: 'A Year of Harvest',
    description: 'What you\'ve been building is becoming visible. Relationships reveal their truth. Culmination energy.',
  };
  if (moonPhase.includes('Balsamic')) return {
    name: 'A Year of Completion',
    description: 'Finish, release, and prepare. This is the quiet before a new cycle. Honor endings as sacred.',
  };
  if (moonPhase.includes('First Quarter')) return {
    name: 'A Year of Decision',
    description: 'The fence is uncomfortable — pick a side. This year forces action through productive friction.',
  };
  if (moonPhase.includes('Last Quarter')) return {
    name: 'A Year of Release',
    description: 'Old structures that served you no longer fit. The discomfort is evolution, not punishment.',
  };

  // Sun house archetypes
  if (sunH === 1) return { name: 'A Year of Self-Reinvention', description: 'You are the project. Everything else follows from how you show up.' };
  if (sunH === 10) return { name: 'A Builder\'s Year', description: 'Career, reputation, and visible achievement define this chapter. Build something lasting.' };
  if (sunH === 7) return { name: 'A Year of Partnership', description: 'Growth happens through others. Relationships are the classroom and the gift.' };
  if (sunH === 4) return { name: 'A Year of Roots', description: 'Home, family, and emotional foundation are the priority. Build from the inside out.' };
  if (sunH === 8) return { name: 'A Year of Transformation', description: 'Something old must die for something real to live. Deep psychological work and financial restructuring.' };
  if (sunH === 12) return { name: 'A Year of Inner Work', description: 'The most private, introspective year possible. Rest is the work. Dreams carry messages.' };

  return { name: 'A Year of Growth', description: 'Multiple areas of your life are activated — focus on what matters most, not what\'s loudest.' };
}

export function generateExecutiveSummary(
  analysis: SolarReturnAnalysis,
  natalChart: NatalChart,
): ExecutiveSummary {
  const items: OpportunityChallenge[] = [];

  // Score aspects
  for (const asp of analysis.srToNatalAspects.slice(0, 15)) {
    const { score, isOpp } = scoreAspectOpportunity(asp);
    const p1Noun = PLANET_NOUNS[asp.planet1] || asp.planet1;
    const p2Noun = PLANET_NOUNS[asp.planet2] || asp.planet2;

    items.push({
      type: isOpp ? 'opportunity' : 'challenge',
      title: `${asp.planet1} ${asp.type} ${asp.planet2}`,
      description: isOpp
        ? `Your ${p1Noun} flows naturally with your natal ${p2Noun} this year — doors open when you engage with this energy.`
        : `Your ${p1Noun} creates friction with your natal ${p2Noun} — growth comes through working with this tension, not avoiding it.`,
      source: `${asp.planet1} ${asp.type} natal ${asp.planet2} (${asp.orb}° orb)`,
      intensity: Math.round(score),
    });
  }

  // Score stelliums as opportunities
  for (const st of analysis.stelliums) {
    items.push({
      type: 'opportunity',
      title: `Stellium in ${st.location}`,
      description: `${st.planets.length} planets concentrate power in ${st.location}. This is where the year\'s biggest breakthroughs happen.`,
      source: `${st.planets.join(', ')} in ${st.location}`,
      intensity: st.planets.length * 2 + 2,
    });
  }

  // Jupiter placement = opportunity
  const jupH = analysis.planetSRHouses?.Jupiter;
  if (jupH) {
    items.push({
      type: 'opportunity',
      title: `Jupiter expands ${HOUSE_KEYWORDS[jupH] || 'life area'}`,
      description: `Jupiter in your ${jupH}${getOrd(jupH)} house opens doors in ${HOUSE_KEYWORDS[jupH] || 'this area'}. Growth is available — reach for it.`,
      source: `Jupiter in SR House ${jupH}`,
      house: jupH,
      intensity: 8,
    });
  }

  // Saturn placement = challenge
  if (analysis.saturnFocus) {
    const sH = analysis.saturnFocus.house;
    items.push({
      type: 'challenge',
      title: `Saturn tests ${HOUSE_KEYWORDS[sH!] || 'life area'}`,
      description: analysis.saturnFocus.interpretation.slice(0, 200),
      source: `Saturn in SR House ${sH}`,
      house: sH,
      intensity: 8,
    });
  }

  // Pluto placement = challenge/transformation
  const plutoH = analysis.planetSRHouses?.Pluto;
  if (plutoH) {
    items.push({
      type: 'challenge',
      title: `Pluto transforms ${HOUSE_KEYWORDS[plutoH] || 'life area'}`,
      description: `Deep, unavoidable change in ${HOUSE_KEYWORDS[plutoH] || 'this area'}. What isn't real will be stripped away.`,
      source: `Pluto in SR House ${plutoH}`,
      house: plutoH,
      intensity: 7,
    });
  }

  // Sort and pick top 3 each
  const opps = items.filter(i => i.type === 'opportunity').sort((a, b) => b.intensity - a.intensity).slice(0, 3);
  const chals = items.filter(i => i.type === 'challenge').sort((a, b) => b.intensity - a.intensity).slice(0, 3);

  // Core focus sentence
  const sunH = analysis.sunHouse?.house;
  const moonSign = analysis.moonSign;
  const profH = analysis.profectionYear?.houseNumber;
  const coreFocus = buildCoreFocus(sunH, moonSign, profH, analysis);

  // Pattern recognition
  const patterns = buildPatternRecognition(analysis, natalChart);

  // Year archetype
  const archetype = getYearArchetype(analysis);

  return {
    coreFocus,
    opportunities: opps,
    challenges: chals,
    patterns,
    yearArchetype: archetype.name,
    yearArchetypeDescription: archetype.description,
  };
}

function buildCoreFocus(sunH: number | null | undefined, moonSign: string, profH: number | undefined, analysis: SolarReturnAnalysis): string {
  const sunArea = sunH ? HOUSE_KEYWORDS[sunH] : 'personal growth';
  const profArea = profH ? HOUSE_KEYWORDS[profH] : '';

  if (sunH === profH && sunH) {
    return `This is a powerfully focused year: both your Sun placement and profection year point to ${sunArea} as the central theme — lean in completely.`;
  }

  if (profArea && sunArea) {
    return `Your year's energy flows primarily toward ${sunArea}, while your profection year activates ${profArea} — these two threads weave together throughout the year.`;
  }

  return `This year's core focus is ${sunArea} — let this be your compass when decisions feel complicated.`;
}

function buildPatternRecognition(analysis: SolarReturnAnalysis, natalChart: NatalChart): PatternRecognition[] {
  const patterns: PatternRecognition[] = [];

  // Repeated natal themes
  if (analysis.repeatedThemes.length > 0) {
    for (const theme of analysis.repeatedThemes.slice(0, 3)) {
      patterns.push({
        pattern: theme.description,
        description: theme.significance,
        connection: 'This pattern from your birth chart is being re-activated by your Solar Return. Pay attention — life is highlighting a core lesson.',
        category: 'natal-echo',
      });
    }
  }

  // Profection + Saturn cycle connection
  if (analysis.profectionYear && analysis.saturnFocus) {
    const profH = analysis.profectionYear.houseNumber;
    const satH = analysis.saturnFocus.house;
    if (profH === satH) {
      patterns.push({
        pattern: `Profection year and Saturn converge on House ${profH}`,
        description: `Both your annual profection AND Saturn land in your ${HOUSE_KEYWORDS[profH] || ''} house — this is not coincidence. Life is demanding maturity in this area.`,
        connection: 'When the profection year aligns with Saturn\'s house, the theme is amplified. This happens roughly every 12 years.',
        category: 'cycle',
      });
    }
  }

  // Eclipse sensitivity patterns
  if (analysis.eclipseSensitivity && analysis.eclipseSensitivity.length > 0) {
    const eclipseCount = analysis.eclipseSensitivity.length;
    if (eclipseCount > 0) {
      patterns.push({
        pattern: 'Eclipse activation in your chart',
        description: `Eclipses are touching sensitive points in your chart — these are accelerators of fate. Events around eclipse dates carry more weight and longer consequences.`,
        connection: 'Eclipse cycles repeat every 18.6 years (Saros) — check if similar themes appeared that many years ago.',
        category: 'eclipse',
      });
    }
  }

  // Moon metonic cycle
  if (analysis.moonMetonicAges && analysis.moonMetonicAges.length > 1) {
    const pastAges = analysis.moonMetonicAges.filter(a => a < (analysis.profectionYear?.age || 0));
    if (pastAges.length > 0) {
      const echoAge = pastAges[pastAges.length - 1];
      patterns.push({
        pattern: `Emotional echo from age ${echoAge}`,
        description: `Your SR Moon was in the same sign at age ${echoAge}. The emotional themes from that year are reverberating now — not repeating exactly, but rhyming.`,
        connection: 'The Metonic cycle (19 years) returns the Moon to the same sign. What was happening emotionally at that age? The lesson is deepening.',
        category: 'recurring',
      });
    }
  }

  // Stellium as pattern
  if (analysis.stelliums.length > 0) {
    for (const st of analysis.stelliums) {
      // Check if natal chart has planets in the same sign
      const natalPlanetsInSign: string[] = [];
      const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'] as const;
      for (const p of planets) {
        const pos = natalChart.planets?.[p];
        if (pos && (pos as any).sign === st.location) {
          natalPlanetsInSign.push(p);
        }
      }
      if (natalPlanetsInSign.length > 0) {
        patterns.push({
          pattern: `${st.location} activation mirrors natal placement`,
          description: `Your SR stellium in ${st.location} lands where you already have natal ${natalPlanetsInSign.join(', ')} — this amplifies a lifelong pattern, not creating a new one.`,
          connection: `You've always had ${natalPlanetsInSign.join(' and ')} energy in ${st.location}. This year turns the volume up.`,
          category: 'natal-echo',
        });
      }
    }
  }

  return patterns.slice(0, 6);
}

function getOrd(n: number): string {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}

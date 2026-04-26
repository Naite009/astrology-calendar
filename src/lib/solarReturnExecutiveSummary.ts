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
  Chiron: 'healing', NorthNode: 'soul direction', Ceres: 'nurturing',
  Pallas: 'strategy', Juno: 'partnership needs', Vesta: 'devotion',
};

// What each planet actually DOES in your life — plain language
const PLANET_PLAIN: Record<string, { does: string; examples: string }> = {
  Sun: { does: 'how you express who you are and what gives you energy', examples: 'career choices, creative projects, how you spend your best hours' },
  Moon: { does: 'how you process emotions and what makes you feel safe', examples: 'eating habits, sleep patterns, who you call when you\'re upset, what makes you cry' },
  Mercury: { does: 'how you think, talk, and make decisions', examples: 'emails, conversations, study habits, how you argue, what you read' },
  Venus: { does: 'what you value and how you connect with people you care about', examples: 'dating, friendships, spending money, decorating your space, what you find beautiful' },
  Mars: { does: 'how you take action and what motivates you', examples: 'exercise, competitive situations, how you handle deadlines and challenges' },
  Jupiter: { does: 'where you feel lucky and how you grow', examples: 'travel, education, promotions, feeling optimistic, saying yes to big opportunities' },
  Saturn: { does: 'where you work hardest and what you\'re building long-term', examples: 'career responsibilities, setting boundaries, long-term commitments' },
  Uranus: { does: 'where you need freedom and where exciting changes happen', examples: 'unexpected events, technology, breaking old habits, sudden insights' },
  Neptune: { does: 'where your imagination and intuition are strongest', examples: 'dreams, creative inspiration, spiritual experiences, moments of deep knowing' },
  Pluto: { does: 'where deep change is happening in your life', examples: 'personal breakthroughs, letting go of old patterns, discovering hidden strengths' },
  Chiron: { does: 'where your old pain becomes your ability to help others', examples: 'mentoring, therapy, teaching from experience, the thing you\'re sensitive about' },
  NorthNode: { does: 'the direction your life is growing toward even if it feels unfamiliar', examples: 'new roles, skills you\'re developing, situations that scare you but feel important' },
  Ceres: { does: 'how you take care of people and how you need to be taken care of', examples: 'cooking for others, physical comfort, mothering style, self-care routines' },
  Pallas: { does: 'how you solve problems and see patterns others miss', examples: 'strategy at work, creative problem-solving, seeing connections between events' },
  Juno: { does: 'what you need from a committed partner to feel secure', examples: 'relationship expectations, loyalty needs, deal-breakers in partnership' },
  Vesta: { does: 'what you\'re deeply devoted to and protect as sacred', examples: 'work you do for its own sake, spiritual practices, the cause you won\'t give up on' },
};

// Build meaningful titles — warm, jargon-free
function buildAspectTitle(p1: string, p2: string, aspectType: string, tightLabel: string): string {
  const p1Noun = PLANET_NOUNS[p1] || p1.toLowerCase();
  const p2Noun = PLANET_NOUNS[p2] || p2.toLowerCase();
  const ASPECT_VERB: Record<string, string> = {
    Conjunction: 'aligns with',
    Trine: 'supports',
    Sextile: 'opens doors for',
    Square: 'stretches',
    Opposition: 'balances',
    Quincunx: 'fine-tunes',
  };
  const verb = ASPECT_VERB[aspectType] || 'connects to';
  const tightTag = tightLabel === 'exact' || tightLabel === 'very tight' ? ' (strong)' : '';
  return `Your ${p1Noun} ${verb} your ${p2Noun}${tightTag}`;
}

// Natural prose descriptions — warm, opportunity-focused, no mad-libs
function buildAspectDescription(p1: string, p2: string, aspectType: string, isOpp: boolean): string {
  const p1Info = PLANET_PLAIN[p1];
  const p2Info = PLANET_PLAIN[p2];

  if (!p1Info || !p2Info) {
    return isOpp
      ? `Two important parts of your life are working together beautifully this year. Pay attention to where things flow naturally.`
      : `Two important parts of your life are asking you to grow this year. The stretch is worthwhile — it's building something stronger.`;
  }

  if (isOpp) {
    switch (aspectType) {
      case 'Conjunction':
        return `This year, ${p1Info.does} and ${p2Info.does} merge into one story. They strengthen each other — when you invest in one, the other responds. You'll notice this in moments where ${p1Info.examples} and ${p2Info.examples} happen at the same time.`;
      case 'Trine':
        return `${p1Info.does} and ${p2Info.does} are beautifully aligned this year. When you follow your instincts around ${p1Info.examples}, good things naturally happen around ${p2Info.examples}. This is one of the easier, more rewarding connections in your year.`;
      case 'Sextile':
        return `There's a lovely opportunity where ${p1Info.does} and ${p2Info.does} can work together this year. It's subtle — look for small openings where ${p1Info.examples} connects to ${p2Info.examples}. When you spot it, say yes.`;
      default:
        return `${p1Info.does} and ${p2Info.does} are supporting each other this year — let them work together naturally.`;
    }
  } else {
    switch (aspectType) {
      case 'Square':
        return `${p1Info.does} and ${p2Info.does} are pulling you in two directions this year — think of it as a creative stretch. For example, ${p1Info.examples} may compete with ${p2Info.examples} for your attention. The opportunity is learning to honor both without choosing one over the other.`;
      case 'Opposition':
        return `You may feel a balancing act between ${p1Info.does} and ${p2Info.does}. Sometimes ${p1Info.examples} gets all your attention, other times ${p2Info.examples} takes over. The opportunity is finding a middle ground where both parts of your life feel honored.`;
      case 'Quincunx':
        return `${p1Info.does} and ${p2Info.does} don't naturally speak the same language this year — you'll notice small adjustments needed between ${p1Info.examples} and ${p2Info.examples}. Small, flexible tweaks work better than big dramatic changes.`;
      default:
        return `There's a growth area between ${p1Info.does} and ${p2Info.does}. You'll feel it around ${p1Info.examples} and ${p2Info.examples}. Working with this stretch rather than avoiding it leads to real progress.`;
    }
  }
}

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
    description: 'This is a year for starting fresh — the projects, relationships, and habits you begin now will shape the next several years of your life.',
  };
  if (moonPhase.includes('Full')) return {
    name: 'A Year of Harvest',
    description: 'The things you have been working on over the past few years are starting to show real, visible results, and your relationships are reaching important turning points.',
  };
  if (moonPhase.includes('Balsamic')) return {
    name: 'A Year of Completion',
    description: 'This year is about finishing what you started, releasing what no longer fits, and making space for the entirely new chapter that begins next year.',
  };
  if (moonPhase.includes('First Quarter')) return {
    name: 'A Year of Decision',
    description: 'You will face clear moments this year where you need to choose a direction and commit to it, and the decisions you make now will define the next several years.',
  };
  if (moonPhase.includes('Last Quarter')) return {
    name: 'A Year of Release',
    description: 'Structures and routines that once supported you are naturally falling away to make room for something better — these changes are growth, not loss.',
  };

  // Sun house archetypes
  if (sunH === 1) return { name: 'A Year of Self-Reinvention', description: 'This year puts you at the center of your own story — how you present yourself, what you look like, and how you carry yourself all undergo meaningful changes.' };
  if (sunH === 10) return { name: 'A Builder\'s Year', description: 'Your career, public reputation, and long-term ambitions take center stage this year, and the work you put in now builds something that lasts well beyond this birthday.' };
  if (sunH === 7) return { name: 'A Year of Partnership', description: 'Your most important growth this year happens through other people — close relationships, business partnerships, and one-on-one connections are where the real action is.' };
  if (sunH === 4) return { name: 'A Year of Roots', description: 'Home, family, and your emotional foundation are the priority this year — you may move, renovate, reconnect with family, or do deep inner work that changes how you feel about yourself.' };
  if (sunH === 8) return { name: 'A Year of Transformation', description: 'Something important is shifting at a deep level this year — you may experience personal breakthroughs, financial changes, or emotional realizations that fundamentally change how you see yourself.' };
  if (sunH === 12) return { name: 'A Year of Inner Work', description: 'This is your most private and introspective year — the real progress happens through rest, reflection, therapy, creative solitude, and honest self-examination.' };

  return { name: 'A Year of Growth', description: 'Multiple areas of your life are activated this year, so your main challenge is focusing your energy on what truly matters rather than spreading yourself too thin.' };
}

export function generateExecutiveSummary(
  analysis: SolarReturnAnalysis,
  natalChart: NatalChart,
): ExecutiveSummary {
  const items: OpportunityChallenge[] = [];

  // Score aspects — use tighter aspects first for more meaningful results
  const sortedAspects = [...analysis.srToNatalAspects].sort((a, b) => a.orb - b.orb);
  for (const asp of sortedAspects.slice(0, 15)) {
    const { score, isOpp } = scoreAspectOpportunity(asp);
    const p1Info = PLANET_PLAIN[asp.planet1];
    const p2Info = PLANET_PLAIN[asp.planet2];

    // Skip aspects where we don't have real content for BOTH planets.
    // We need both sides to produce a meaningful, non-degenerate sentence.
    // This filters out Lilith, Chiron, Vertex, Part of Fortune, asteroids etc.
    // when no plain-language meaning is available.
    if (!p1Info || !p2Info) continue;
    if (!PLANET_NOUNS[asp.planet1] || !PLANET_NOUNS[asp.planet2]) continue;

    const tightLabel = asp.orb <= 0.5 ? 'exact' : asp.orb <= 1 ? 'very tight' : asp.orb <= 2 ? 'close' : 'present';
    const tightNote = asp.orb <= 1 ? ' This is one of the strongest aspects in your chart this year — you\'ll feel it clearly.' : '';

    items.push({
      type: isOpp ? 'opportunity' : 'challenge',
      title: buildAspectTitle(asp.planet1, asp.planet2, asp.type, tightLabel),
      description: buildAspectDescription(asp.planet1, asp.planet2, asp.type, isOpp) + tightNote,
      source: `${asp.planet1} ${asp.type} natal ${asp.planet2} (${asp.orb.toFixed(1)}° orb — ${tightLabel})`,
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

  // Growth energy placement = opportunity
  const jupH = analysis.planetSRHouses?.Jupiter;
  if (jupH) {
    items.push({
      type: 'opportunity',
      title: `Growth energy expands your ${HOUSE_KEYWORDS[jupH] || 'life area'}`,
      description: `Your growth and expansion energy this year is focused on ${HOUSE_KEYWORDS[jupH] || 'this area'} — doors are opening here. Reach for the opportunities.`,
      source: `Growth energy in ${HOUSE_KEYWORDS[jupH] || 'life area'}`,
      house: jupH,
      intensity: 8,
    });
  }

  // Commitment placement = growth area
  if (analysis.saturnFocus) {
    const sH = analysis.saturnFocus.house;
    items.push({
      type: 'challenge',
      title: `Building something real in your ${HOUSE_KEYWORDS[sH!] || 'life'} area`,
      description: `Your ${HOUSE_KEYWORDS[sH!] || 'personal'} life is a major growth area this year. Expect to do real, meaningful work here — the effort builds something that lasts.`,
      source: `Commitment focus in ${HOUSE_KEYWORDS[sH!] || 'life area'}`,
      house: sH,
      intensity: 8,
    });
  }

  // Deep change placement = transformation
  const plutoH = analysis.planetSRHouses?.Pluto;
  if (plutoH) {
    items.push({
      type: 'challenge',
      title: `Deep evolution in your ${HOUSE_KEYWORDS[plutoH] || 'life'} area`,
      description: `Something in your ${HOUSE_KEYWORDS[plutoH] || 'personal'} life is evolving at a fundamental level. Old patterns are clearing space for something more authentic and powerful.`,
      source: `Transformation focus in ${HOUSE_KEYWORDS[plutoH] || 'life area'}`,
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
        connection: 'This same pattern exists in your birth chart — meaning it\'s a lifelong theme for you, not just this year. The fact that it shows up again now means this is a year where that part of your life gets extra attention. Notice what\'s familiar.',
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
        pattern: `Two timing cycles converge on your ${HOUSE_KEYWORDS[profH] || ''} area`,
        description: `Both your annual cycle AND your commitment/responsibility focus land in your ${HOUSE_KEYWORDS[profH] || ''} area — this isn't random. Two different timing systems are pointing at the same part of your life, which means ${HOUSE_KEYWORDS[profH] || 'this area'} requires serious attention, hard work, and honesty this year.`,
        connection: 'When two independent timing cycles converge on the same life area, it amplifies that theme — things you\'ve been putting off will get your full attention. This alignment happens roughly every 12 years.',
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
        description: `Eclipses this year touch sensitive points in your chart. Think of eclipses as "fast-forward" buttons — events around eclipse dates tend to happen faster, feel more significant, and have longer-lasting effects than normal. Mark the eclipse dates on your calendar and pay attention to what happens within two weeks of each one.`,
        connection: 'Eclipse cycles repeat every 18.6 years. Think back to what was happening in your life that many years ago — similar themes may reappear now in a new form.',
        category: 'eclipse',
      });
    }
  }

  // Moon metonic cycle — list ALL past echo ages with calendar years
  if (analysis.moonMetonicAges && analysis.moonMetonicAges.length > 1) {
    const currentAge = analysis.profectionYear?.age || 0;
    const pastAges = analysis.moonMetonicAges.filter(a => a < currentAge);
    if (pastAges.length > 0) {
      // Derive birth year from natalChart.birthDate
      const birthYearNum = natalChart.birthDate ? parseInt(natalChart.birthDate.split(/[-/]/)[0].length === 4 ? natalChart.birthDate.split(/[-/]/)[0] : natalChart.birthDate.split(/[-/]/)[2]) : 0;
      const echoLines = pastAges.map(a => {
        const calYear = birthYearNum ? `${birthYearNum + a}` : '';
        return calYear ? `Age ${a} (${calYear})` : `Age ${a}`;
      });
      const mostRecent = pastAges[pastAges.length - 1];
      const mostRecentYear = birthYearNum ? ` (${birthYearNum + mostRecent})` : '';
      patterns.push({
        pattern: `Emotional echo from age ${mostRecent}${mostRecentYear}`,
        description: `Your emotional cycle was in the same sign at: ${echoLines.join(' → ')}. The emotional themes from those years are reverberating now — not repeating exactly, but rhyming. The most recent echo was age ${mostRecent}${mostRecentYear}.`,
        connection: `This emotional cycle returns every ~19 years. Think back to what was happening emotionally at each of those ages — the pattern is deepening.`,
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
          description: `Your concentration of energy in ${st.location} lands where you already have strong natal themes — this amplifies a lifelong pattern, not creating a new one.`,
          connection: `You've always had strong energy in ${st.location}. This year turns the volume up.`,
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

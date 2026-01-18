import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Copy, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import {
  ChartPlanet,
  ChartAspect,
  computeDignity,
  computeDispositorChain,
  getSignRuler,
  getPlanetSymbol,
  getSignSymbol,
  getAspectSymbol,
  getAspectNature,
  PLANET_MEANINGS,
  DIGNITY_EXPLAINERS,
  DignityType
} from '@/lib/chartDecoderLogic';
import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { detectChartPatterns, ChartPattern } from '@/lib/chartPatterns';
import { PLANET_IN_SIGN } from '@/lib/planetSignExpressions';
import { SIGN_COSTUMES, RISING_SIGN_PSYCHOLOGY } from '@/lib/cinematicNarrative';
import { 
  DEEP_HOUSE_INTERPRETATIONS, 
  PLANET_IN_HOUSE_EFFECTS,
  getHouseInterpretationForAge,
  getSaturnReturnContext
} from '@/lib/houseInterpretations';
import { getContextualAspectExplanation } from '@/lib/aspectContextInterpreter';
import { analyzeChartStrengths } from '@/lib/chartStrengths';

interface ReadingScriptGeneratorProps {
  planets: ChartPlanet[];
  aspects: ChartAspect[];
  chartName: string;
  useTraditional: boolean;
  natalChart?: NatalChart | null;
  age?: number;
}

interface ScriptSection {
  title: string;
  content: string[];
}

// Generate experiential language for placements
function getPlacementFeeling(planet: string, sign: string, dignity: DignityType, house?: number): string {
  const dignityFeelings: Record<DignityType, string> = {
    rulership: `This energy flows naturally and consistently for you — ${planet} is at home here.`,
    exaltation: `This placement often feels like a gift or natural talent — ${planet} is elevated here.`,
    detriment: `This requires more conscious navigation. You may feel pulled between what ${planet} wants and how ${sign} expresses.`,
    fall: `This is where you build earned confidence. Not weakness — mastery develops through practice.`,
    peregrine: house 
      ? `This energy expresses most clearly through the ${house}${house === 1 ? 'st' : house === 2 ? 'nd' : house === 3 ? 'rd' : 'th'} house themes and its aspects.`
      : `A free agent — its expression comes through aspects and the life areas it touches.`
  };
  return dignityFeelings[dignity];
}

// House descriptions for WHERE the energy expresses
const HOUSE_CONTEXTS: Record<number, { area: string; meaning: string }> = {
  1: { area: 'identity and first impressions', meaning: 'This is front and center — it\'s how you present yourself and what people notice immediately about you.' },
  2: { area: 'money, possessions, and self-worth', meaning: 'This operates through what you own, earn, and value. Your sense of security is tied to this energy.' },
  3: { area: 'communication, siblings, and daily environment', meaning: 'This shows up in how you talk, write, and move through your neighborhood and daily routines.' },
  4: { area: 'home, family, and emotional foundations', meaning: 'This operates in private — at home, with family, in your inner emotional world. It\'s not for public display.' },
  5: { area: 'creativity, romance, and self-expression', meaning: 'This wants to play, create, and be seen. It expresses through hobbies, dating, children, and what brings you joy.' },
  6: { area: 'work, health, and daily routines', meaning: 'This shows up in your job, your health habits, and how you structure your days. It\'s about service and maintenance.' },
  7: { area: 'partnerships and one-on-one relationships', meaning: 'This operates through others — you experience it most clearly in marriage, close partnerships, and committed relationships.' },
  8: { area: 'shared resources, intimacy, and transformation', meaning: 'This goes deep — other people\'s money, sex, death, psychological intensity. It\'s hidden but powerful.' },
  9: { area: 'philosophy, travel, and higher learning', meaning: 'This seeks meaning — through education, travel, publishing, spirituality, and big-picture thinking.' },
  10: { area: 'career, reputation, and public role', meaning: 'This is visible to everyone. It\'s your profession, your legacy, what you\'re known for in the world.' },
  11: { area: 'friends, groups, and future visions', meaning: 'This operates through community — your social circles, causes, hopes for the future, and sense of belonging to something larger.' },
  12: { area: 'the unconscious, solitude, and hidden realms', meaning: 'This operates behind the scenes — in dreams, isolation, institutions, spirituality, and what you hide even from yourself.' }
};

// Enhanced house context that includes life-stage and how others respond
function getEnhancedHouseContext(house: number | undefined, planetName: string, age: number): { basic: string; lifeStage: string; othersRespond: string; childContext?: string } | null {
  if (!house) return null;
  const context = HOUSE_CONTEXTS[house];
  const deepInterp = DEEP_HOUSE_INTERPRETATIONS[house];
  const planetEffects = PLANET_IN_HOUSE_EFFECTS[planetName]?.[house];
  
  if (!context || !deepInterp) return null;
  
  // Get life stage specific interpretation
  const lifeStageKey = age < 12 ? 'child' : age < 21 ? 'adolescent' : age < 30 ? 'youngAdult' : age < 50 ? 'adult' : 'elder';
  
  return {
    basic: `In the ${house}${house === 1 ? 'st' : house === 2 ? 'nd' : house === 3 ? 'rd' : 'th'} house of ${context.area}: ${context.meaning}`,
    lifeStage: deepInterp.lifeStages[lifeStageKey],
    othersRespond: planetEffects?.othersRespond || deepInterp.othersPerceive,
    childContext: age < 12 ? planetEffects?.childContext : undefined
  };
}

// Simple house context for backward compatibility
function getHouseContext(house: number | undefined, planetName: string): string {
  if (!house) return '';
  const context = HOUSE_CONTEXTS[house];
  if (!context) return '';
  return `In the ${house}${house === 1 ? 'st' : house === 2 ? 'nd' : house === 3 ? 'rd' : 'th'} house of ${context.area}: ${context.meaning}`;
}

// Mercury synthesis that weaves sign + house coherently
function getMercurySynthesis(sign: string, house: number | undefined): string {
  if (!house) return '';
  
  const signStyle: Record<string, string> = {
    Aries: 'thinks fast, speaks directly, and processes through action',
    Taurus: 'thinks slowly and thoroughly, speaks deliberately, and grounds ideas in practical reality',
    Gemini: 'thinks in connections, speaks constantly, and needs endless mental variety',
    Cancer: 'thinks through feeling, speaks from emotional memory, and processes intuitively',
    Leo: 'thinks creatively, speaks with authority, and needs ideas to shine',
    Virgo: 'thinks analytically, speaks precisely, and needs to understand the details',
    Libra: 'thinks relationally, speaks diplomatically, and weighs every perspective before deciding',
    Scorpio: 'thinks penetratingly, speaks strategically, and seeks the hidden truth',
    Sagittarius: 'thinks expansively, speaks bluntly, and needs ideas to mean something',
    Capricorn: 'thinks strategically, speaks with authority, and values practical knowledge',
    Aquarius: 'thinks unconventionally, speaks progressively, and values intellectual freedom',
    Pisces: 'thinks in images and impressions, speaks poetically, and absorbs information intuitively'
  };
  
  const houseContext: Record<number, string> = {
    1: 'Your mind IS your identity — people know you by how you think and speak. You lead with your intellect.',
    2: 'Your mind serves your survival — you think about money, resources, and what knowledge is worth.',
    3: 'Your mind is in its home — communication, learning, and daily mental engagement are central to your life.',
    4: 'Your mind lives in private spaces — you think best at home, may keep your best ideas to yourself, and your inner dialogue is rich.',
    5: 'Your mind wants to create and play — thinking is a form of self-expression, and you need intellectual joy.',
    6: 'Your mind serves work and health — you think in terms of improvement, problem-solving, and practical service.',
    7: 'Your mind comes alive through others — you think best in dialogue and need a partner to process with.',
    8: 'Your mind goes into hidden depths — you research obsessively, think psychologically, and communicate about what others avoid.',
    9: 'Your mind seeks ultimate meaning — you think philosophically, learn through travel or higher education, and need big ideas.',
    10: 'Your mind builds your reputation — you\'re known for your ideas, and your thinking style shapes your career.',
    11: 'Your mind serves the collective — you think about the future, connect across groups, and your ideas need a cause.',
    12: 'Your mind operates behind the veil — you think in solitude, process through dreams or meditation, and may communicate through art or spiritual channels.'
  };
  
  const style = signStyle[sign] || 'expresses through your sign';
  const context = houseContext[house] || '';
  
  return `Your Mercury ${style}. ${context}`;
}

// Venus synthesis that weaves sign + house coherently
function getVenusSynthesis(sign: string, house: number | undefined): string {
  if (!house) return '';
  
  const signStyle: Record<string, string> = {
    Aries: 'loves through pursuit and conquest — you want the chase and need passion',
    Taurus: 'loves through devotion and sensory pleasure — you want stability and need comfort',
    Gemini: 'loves through conversation and curiosity — you want mental connection and need variety',
    Cancer: 'loves through nurturing and protection — you want emotional safety and need belonging',
    Leo: 'loves through adoration and generosity — you want to be celebrated and need appreciation',
    Virgo: 'loves through service and attention — you want to be useful and need to improve what you love',
    Libra: 'loves through partnership and harmony — you want balance and need relationship to feel complete',
    Scorpio: 'loves through intensity and merging — you want depth and need emotional truth',
    Sagittarius: 'loves through adventure and expansion — you want freedom and need growth together',
    Capricorn: 'loves through commitment and building — you want to invest and need lasting structures',
    Aquarius: 'loves through friendship and ideals — you want independence and need intellectual respect',
    Pisces: 'loves through merging and transcendence — you want to dissolve into love and need spiritual connection'
  };
  
  const houseContext: Record<number, string> = {
    1: 'You attract through your presence — beauty, charm, and values are immediately visible. You lead with grace.',
    2: 'You attract resources — money flows toward you, and your self-worth is tied to what you value and possess.',
    3: 'You attract through words — communication is charming, siblings may be significant, and you find beauty in learning.',
    4: 'You attract through home — you need a beautiful private sanctuary, and love lives in your family roots.',
    5: 'You attract through creativity and romance — love is playful, dramatic, and expressed through self-expression.',
    6: 'You attract through service — you love by helping, and daily work must feel harmonious.',
    7: 'You attract through partnership — relationship is essential, and you come alive in committed connection.',
    8: 'You attract through intensity — intimacy transforms you, and you may draw resources through others.',
    9: 'You attract through meaning — love needs freedom and expansion, and you\'re drawn to wisdom seekers.',
    10: 'You attract through achievement — your public image has charm, and relationships affect your career.',
    11: 'You attract through community — friendships matter deeply, and love connects to causes and groups.',
    12: 'You attract through the unseen — love is private or spiritual, and you may sacrifice for those you love.'
  };
  
  const style = signStyle[sign] || 'expresses love through your sign';
  const context = houseContext[house] || '';
  
  return `Your Venus ${style}. ${context}`;
}

// Mars synthesis that weaves sign + house coherently  
function getMarsSynthesis(sign: string, house: number | undefined): string {
  if (!house) return '';
  
  const signStyle: Record<string, string> = {
    Aries: 'acts with instinctive courage — anger is direct and brief, and you need to be first',
    Taurus: 'acts with patient determination — anger builds slowly but erupts powerfully, and you fight for security',
    Gemini: 'acts through words and versatility — anger is verbal, and your energy scatters across many pursuits',
    Cancer: 'acts to protect — anger is defensive and moody, and you fight for emotional security',
    Leo: 'acts with dramatic confidence — anger is proud, and your energy needs recognition',
    Virgo: 'acts with precise efficiency — anger is critical, and your energy goes into work and improvement',
    Libra: 'acts through diplomacy — anger is aestheticized or passive-aggressive, and you need a partner or cause to act for',
    Scorpio: 'acts with strategic intensity — anger is volcanic and controlled, and you pursue psychological power',
    Sagittarius: 'acts with bold enthusiasm — anger is righteous but brief, and you fight for truth and freedom',
    Capricorn: 'acts with disciplined ambition — anger is cold and calculated, and you pursue long-term goals',
    Aquarius: 'acts for causes and revolution — anger is detached, and your energy serves the collective',
    Pisces: 'acts through inspiration and compassion — anger is confused or turned inward, and you fight for the unseen'
  };
  
  const houseContext: Record<number, string> = {
    1: 'Your energy IS your identity — people see your drive immediately. You lead with action.',
    2: 'Your energy builds resources — you fight for financial security and pour drive into earning.',
    3: 'Your energy expresses through words — you debate, argue, and communicate forcefully.',
    4: 'Your energy lives at home — you may fight with family, and your drive needs a private base.',
    5: 'Your energy is creative and romantic — you pursue love dramatically and compete through play.',
    6: 'Your energy serves work and health — you\'re a workhorse, and your body needs physical outlet.',
    7: 'Your energy activates through partnership — you fight with or for partners, and relationships energize you.',
    8: 'Your energy goes deep — you pursue power and transformation, and your drive is sexually intense.',
    9: 'Your energy seeks meaning — you take action through travel, education, or belief, and fight for truth.',
    10: 'Your energy builds your career — you\'re ambitious, and your drive is visible in your public role.',
    11: 'Your energy serves causes — you fight for the future, and groups activate your drive.',
    12: 'Your energy operates behind the scenes — you may turn anger inward, and your drive connects to the unconscious.'
  };
  
  const style = signStyle[sign] || 'expresses drive through your sign';
  const context = houseContext[house] || '';
  
  return `Your Mars ${style}. ${context}`;
}


// Jupiter synthesis that actually weaves sign + house together
function getJupiterSynthesis(sign: string, house: number | undefined): string {
  if (!house) return '';
  
  // Sign qualities for Jupiter
  const signQualities: Record<string, { how: string; through: string }> = {
    Aries: { how: 'through bold action and being first', through: 'courage and initiative' },
    Taurus: { how: 'slowly and steadily through patient accumulation', through: 'building something tangible and lasting' },
    Gemini: { how: 'through learning, connections, and variety', through: 'curiosity and communication' },
    Cancer: { how: 'through nurturing and emotional investment', through: 'caring for others and building security' },
    Leo: { how: 'through creative self-expression and generosity', through: 'shining brightly and inspiring others' },
    Virgo: { how: 'through practical service and attention to detail', through: 'being useful and improving things' },
    Libra: { how: 'through partnership and creating harmony', through: 'relationships and aesthetic refinement' },
    Scorpio: { how: 'through intensity and psychological depth', through: 'transformation and facing what others avoid' },
    Sagittarius: { how: 'through adventure, philosophy, and faith', through: 'following your vision and staying optimistic' },
    Capricorn: { how: 'through discipline and long-term strategy', through: 'earning authority and building structures' },
    Aquarius: { how: 'through innovation and serving the collective', through: 'thinking differently and breaking conventions' },
    Pisces: { how: 'through compassion and spiritual surrender', through: 'dissolving boundaries and trusting the universe' }
  };
  
  // House areas for Jupiter
  const houseAreas: Record<number, { area: string; luck: string }> = {
    1: { area: 'your identity and how you present yourself', luck: 'You attract opportunities just by being yourself — people see your optimism immediately.' },
    2: { area: 'money, possessions, and self-worth', luck: 'Financial abundance comes when you invest in what you truly value.' },
    3: { area: 'communication, learning, and daily connections', luck: 'Luck finds you through conversations, siblings, neighbors, or local travel.' },
    4: { area: 'home, family, and emotional foundations', luck: 'Your family or home base is a source of abundance — you may need a large space or come from a supportive lineage.' },
    5: { area: 'creativity, romance, and self-expression', luck: 'Love, children, and creative projects bring you joy and growth. You attract romance easily.' },
    6: { area: 'work, health, and daily routines', luck: 'Luck comes through your job and service to others. Your health benefits from optimism.' },
    7: { area: 'partnerships and committed relationships', luck: 'Your partners bring you luck. Marriage or business partnerships expand your world.' },
    8: { area: 'shared resources, intimacy, and transformation', luck: 'Luck comes through other people\'s resources — inheritance, investments, partnership money. Deep intimacy transforms you.' },
    9: { area: 'philosophy, travel, and higher learning', luck: 'This is Jupiter\'s home turf. Education, travel, publishing, and spiritual seeking all flow naturally.' },
    10: { area: 'career, reputation, and public role', luck: 'Your profession brings abundance. You\'re known for your optimism or wisdom. Public recognition comes.' },
    11: { area: 'friends, groups, and future visions', luck: 'Your social network is your abundance. Friends bring opportunities. Causes you believe in prosper.' },
    12: { area: 'the unconscious, solitude, and hidden realms', luck: 'Luck comes from behind the scenes — through retreat, spiritual practice, or anonymous service. You\'re protected in ways you can\'t see.' }
  };
  
  const sq = signQualities[sign];
  const ha = houseAreas[house];
  if (!sq || !ha) return '';
  
  return `Jupiter brings growth and luck to ${ha.area}. You grow ${sq.how}. ${ha.luck}`;
}

// Saturn synthesis that actually weaves sign + house together  
function getSaturnSynthesis(sign: string, house: number | undefined): string {
  if (!house) return '';
  
  // Sign qualities for Saturn
  const signQualities: Record<string, { lesson: string; mastery: string }> = {
    Aries: { lesson: 'patience with your impulses — you can\'t always go first', mastery: 'disciplined courage that doesn\'t burn out' },
    Taurus: { lesson: 'that security must be earned, not assumed', mastery: 'building lasting wealth through patience' },
    Gemini: { lesson: 'focused thinking — your mind can\'t chase every idea', mastery: 'structured communication and deep knowledge' },
    Cancer: { lesson: 'emotional boundaries and mature nurturing', mastery: 'building inner security that doesn\'t depend on others' },
    Leo: { lesson: 'that recognition must be earned, not demanded', mastery: 'authentic self-expression that inspires rather than performs' },
    Virgo: { lesson: 'that perfectionism is a trap — good enough is sometimes enough', mastery: 'practical excellence through disciplined service' },
    Libra: { lesson: 'that relationships require commitment, not just charm', mastery: 'mature partnership built on fairness and accountability' },
    Scorpio: { lesson: 'that control is an illusion — surrender is the real power', mastery: 'psychological depth through facing your shadows' },
    Sagittarius: { lesson: 'that freedom must be earned and beliefs must be tested', mastery: 'grounded wisdom that comes from real experience' },
    Capricorn: { lesson: 'that authority is a responsibility, not a reward', mastery: 'becoming a true elder who earns respect through integrity' },
    Aquarius: { lesson: 'that being different isn\'t enough — your ideas must work', mastery: 'sustainable innovation that actually helps the collective' },
    Pisces: { lesson: 'that escape isn\'t healing — you must face reality', mastery: 'structured spirituality and grounded compassion' }
  };
  
  // House areas for Saturn
  const houseAreas: Record<number, { area: string; challenge: string }> = {
    1: { area: 'your identity and self-presentation', challenge: 'You may have felt unseen or criticized early on. You come across as serious, mature, sometimes guarded.' },
    2: { area: 'money, possessions, and self-worth', challenge: 'Financial security doesn\'t come easy. You may have felt "not enough." Everything must be earned.' },
    3: { area: 'communication and learning', challenge: 'You may have felt slow, blocked, or misunderstood early on. Speaking up doesn\'t come naturally.' },
    4: { area: 'home, family, and emotional foundations', challenge: 'Family may have felt cold, demanding, or absent. You carry ancestral weight. Home requires work.' },
    5: { area: 'creativity, romance, and self-expression', challenge: 'Play didn\'t come easy. Romance feels serious. You may have blocked your creative side.' },
    6: { area: 'work and health', challenge: 'Work is demanding. Health requires constant attention. You take responsibility for everything.' },
    7: { area: 'partnerships and committed relationships', challenge: 'Relationships feel karmic and heavy. You may marry late or choose a serious partner. Commitment isn\'t casual.' },
    8: { area: 'shared resources, intimacy, and transformation', challenge: 'Trust comes hard. Intimacy requires control to release. Other people\'s resources may be restricted.' },
    9: { area: 'philosophy, travel, and higher learning', challenge: 'Beliefs were tested early. Education may have been delayed or difficult. You earn your wisdom.' },
    10: { area: 'career and public reputation', challenge: 'Ambition runs deep but success comes slowly. You may fear failure publicly. Authority is earned over decades.' },
    11: { area: 'friends, groups, and future visions', challenge: 'You may feel like an outsider. Friendships require work. Groups can feel restricting.' },
    12: { area: 'the unconscious and hidden realms', challenge: 'You carry unconscious burdens — possibly karmic. Solitude is necessary. The unseen feels heavy.' }
  };
  
  const sq = signQualities[sign];
  const ha = houseAreas[house];
  if (!sq || !ha) return '';
  
  return `Saturn tests you in ${ha.area}. Your core lesson is ${sq.lesson}. ${ha.challenge} The payoff: ${sq.mastery}.`;
}

function getSynthesis(planetName: string, sign: string, house: number | undefined): string {
  if (!house) return '';
  
  // Use dedicated synthesis functions for each planet
  if (planetName === 'Mercury') return getMercurySynthesis(sign, house);
  if (planetName === 'Venus') return getVenusSynthesis(sign, house);
  if (planetName === 'Mars') return getMarsSynthesis(sign, house);
  if (planetName === 'Jupiter') return getJupiterSynthesis(sign, house);
  if (planetName === 'Saturn') return getSaturnSynthesis(sign, house);
  
  return '';
}

// Get aspect feeling based on type and orb
function getAspectFeeling(aspect: ChartAspect, planet1Meaning: string, planet2Meaning: string): string {
  const isTight = aspect.orb < 3;
  const tightNote = isTight ? " This is a tight aspect — you feel it strongly and consistently." : "";
  
  const nature = getAspectNature(aspect.aspectType);
  
  if (nature === 'flowing') {
    return `${aspect.planet1} and ${aspect.planet2} work together harmoniously. Your ${planet1Meaning.toLowerCase()} naturally supports your ${planet2Meaning.toLowerCase()}.${tightNote}`;
  } else if (nature === 'challenging') {
    return `${aspect.planet1} and ${aspect.planet2} create dynamic tension. Your ${planet1Meaning.toLowerCase()} and ${planet2Meaning.toLowerCase()} don't always agree, which can create friction but also drives growth.${tightNote}`;
  } else {
    return `${aspect.planet1} and ${aspect.planet2} are fused together. Your ${planet1Meaning.toLowerCase()} and ${planet2Meaning.toLowerCase()} act as one force.${tightNote}`;
  }
}

export const ReadingScriptGenerator: React.FC<ReadingScriptGeneratorProps> = ({
  planets,
  aspects,
  chartName,
  useTraditional,
  natalChart,
  age = 35
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get life stage label
  const lifeStage = useMemo(() => {
    if (age < 12) return 'child';
    if (age < 21) return 'adolescent';
    if (age < 30) return 'youngAdult';
    if (age < 50) return 'adult';
    return 'elder';
  }, [age]);

  const script = useMemo(() => {
    const sections: ScriptSection[] = [];
    
    // Get key planets first (needed for opening)
    const sun = planets.find(p => p.name === 'Sun');
    const moon = planets.find(p => p.name === 'Moon');
    const asc = planets.find(p => p.name === 'Ascendant');
    
    // 1. OPENING — Core Patterns & Highest Potential
    const chartRuler = asc ? getSignRuler(asc.sign, useTraditional) : null;
    const chartRulerPlanet = chartRuler ? planets.find(p => p.name === chartRuler) : null;
    
    // Saturn Return context
    const saturnContext = getSaturnReturnContext(age);
    
    const openingContent = [
      `"Your natal chart is a map of your psyche at the moment of your first breath. Each planet represents a different part of you — a drive, a need, a way of processing experience — that seeks expression in your life."`,
      `"These aren't external forces acting on you. They ARE you. The Sun is your conscious identity. The Moon is your emotional body. Mercury is how your mind works. Venus is what you love and value. Mars is how you take action. Jupiter is where you grow. Saturn is where you master through challenge."`,
      `"The signs show HOW each part of you operates. The houses show WHERE in life that energy plays out. The aspects show how these parts of you relate to each other — do they cooperate, or create inner tension?"`,
      chartRulerPlanet 
        ? `"Your chart is ruled by ${chartRuler} (because your Ascendant is ${asc?.sign}). This means ${chartRuler} is the director of your life story — its condition, house, and aspects shape your entire path. When ${chartRuler} is activated by transit, your whole life feels it."`
        : `"Your chart ruler directs the overall story of your life."`,
      `"Your highest potential lives in conscious relationship with ALL these parts of yourself. The goal isn't to 'fix' challenging placements — it's to understand them deeply enough that you can work WITH them instead of against them."`
    ];
    
    // Add life-stage context
    if (age < 12) {
      openingContent.push(`\n**READING FOR A CHILD (age ${age})**`);
      openingContent.push(`"When reading for a child, we focus on understanding their natural temperament, learning style, and emotional needs. The chart shows potentials — not fixed destiny. Our job is to support their development."`);
    } else if (age < 21) {
      openingContent.push(`\n**READING FOR AN ADOLESCENT (age ${age})**`);
      openingContent.push(`"At this age, the chart reveals how identity is forming, social dynamics, and the journey toward independence. Challenging placements may feel more acute as the person learns to work with their nature."`);
    }
    
    // Add Saturn Return context if applicable
    if (saturnContext) {
      openingContent.push(`\n**${saturnContext.phase.toUpperCase()}**`);
      openingContent.push(`"${saturnContext.description}"`);
    }
    
    sections.push({
      title: "Your Core Patterns & Highest Potential",
      content: openingContent
    });

    // 1.5 STRENGTHS & SUPPORTS (Traditional Techniques)
    if (natalChart) {
      const strengthsAnalysis = analyzeChartStrengths(planets, aspects, natalChart, useTraditional);
      const strengthsContent: string[] = [];
      
      strengthsContent.push(`"Not everything in your chart requires work. Some placements offer natural gifts, ease, and support. Traditional astrology calls these your 'benefic' influences — areas where life tends to help you."`);
      
      strengthsContent.push(`\n**YOUR GUIDING LIGHT: ${strengthsAnalysis.sectLight.planet}**`);
      strengthsContent.push(`"${strengthsAnalysis.sectLight.interpretation}"`);
      strengthsContent.push(`"${strengthsAnalysis.sectLight.guidance}"`);
      
      strengthsContent.push(`\n**YOUR PRIMARY HELPER: ${strengthsAnalysis.sectBenefic.planet}**`);
      strengthsContent.push(`"${strengthsAnalysis.sectBenefic.interpretation}"`);
      if (strengthsAnalysis.sectBenefic.easeZones.length > 0) {
        strengthsContent.push(`"Where luck flows: ${strengthsAnalysis.sectBenefic.easeZones.slice(0, 2).join('; ')}."`);
      }
      
      if (strengthsAnalysis.wellPlacedPlanets.length > 0) {
        strengthsContent.push(`\n**YOUR NATURAL RESOURCES**`);
        strengthsAnalysis.wellPlacedPlanets.slice(0, 3).forEach(planet => {
          strengthsContent.push(`"${planet.planet} (${planet.qualityRating}): ${planet.traditionalInterpretation}"`);
        });
      }
      
      strengthsContent.push(`\n**THE ROLE OF ${strengthsAnalysis.sectMalefic.planet.toUpperCase()}**`);
      strengthsContent.push(`"${strengthsAnalysis.sectMalefic.interpretation}"`);
      strengthsContent.push(`"${strengthsAnalysis.sectMalefic.missionSupport}"`);
      
      strengthsContent.push(`\n**CONTENTMENT INDICATORS**`);
      strengthsContent.push(`"${strengthsAnalysis.contentment.overall}"`);
      
      sections.push({
        title: "Your Strengths & Supports",
        content: strengthsContent
      });
    }

    // 2. THE BIG THREE (Sun, Moon, Ascendant)
    const bigThreeContent: string[] = [];
    
    if (sun) {
      const sunDignity = computeDignity('Sun', sun.sign, useTraditional);
      const sunDescription = PLANET_IN_SIGN.Sun?.[sun.sign] || `Your core identity expresses through ${sun.sign}.`;
      bigThreeContent.push(`"Your Sun is in ${sun.sign} at ${sun.degree.toFixed(0)}°${sun.house ? ` in the ${sun.house}${sun.house === 1 ? 'st' : sun.house === 2 ? 'nd' : sun.house === 3 ? 'rd' : 'th'} house` : ''}."`);
      bigThreeContent.push(`"${sunDescription}"`);
      if (sunDignity !== 'peregrine') {
        bigThreeContent.push(`"${getPlacementFeeling('Sun', sun.sign, sunDignity, sun.house)}"`);
      }
    }
    
    if (moon) {
      const moonDignity = computeDignity('Moon', moon.sign, useTraditional);
      const moonDescription = PLANET_IN_SIGN.Moon?.[moon.sign] || `Your emotional nature expresses through ${moon.sign}.`;
      bigThreeContent.push(`"Your Moon is in ${moon.sign}${moon.house ? ` in the ${moon.house}${moon.house === 1 ? 'st' : moon.house === 2 ? 'nd' : moon.house === 3 ? 'rd' : 'th'} house` : ''}."`);
      bigThreeContent.push(`"${moonDescription}"`);
      if (moonDignity !== 'peregrine') {
        bigThreeContent.push(`"${getPlacementFeeling('Moon', moon.sign, moonDignity, moon.house)}"`);
      }
    }
    
    if (asc) {
      const ascPsychology = RISING_SIGN_PSYCHOLOGY[asc.sign];
      const ascDescription = ascPsychology || `Your Ascendant in ${asc.sign} shapes how you approach life and how others first experience you.`;
      bigThreeContent.push(`"Your Ascendant is in ${asc.sign}."`);
      bigThreeContent.push(`"${ascDescription}"`);
    }
    
    sections.push({
      title: "The Big Three — Sun, Moon, Rising",
      content: bigThreeContent
    });

    // 3. PERSONAL PLANETS (Mercury, Venus, Mars)
    const mercury = planets.find(p => p.name === 'Mercury');
    const venus = planets.find(p => p.name === 'Venus');
    const mars = planets.find(p => p.name === 'Mars');
    
    const personalContent: string[] = [];
    
    if (mercury) {
      const mercuryDignity = computeDignity('Mercury', mercury.sign, useTraditional);
      const mercuryDescription = PLANET_IN_SIGN.Mercury?.[mercury.sign] || `Your Mercury expresses through ${mercury.sign}.`;
      const mercuryHouse = getHouseContext(mercury.house, 'Mercury');
      const mercurySynthesis = getSynthesis('Mercury', mercury.sign, mercury.house);
      personalContent.push(`"Mercury in ${mercury.sign}${mercury.house ? ` (${mercury.house}${mercury.house === 1 ? 'st' : mercury.house === 2 ? 'nd' : mercury.house === 3 ? 'rd' : 'th'} house)` : ''}:"`);
      personalContent.push(`"${mercuryDescription}"`);
      if (mercuryHouse) {
        personalContent.push(`"${mercuryHouse}"`);
      }
      if (mercurySynthesis) {
        personalContent.push(`"THE SYNTHESIS: ${mercurySynthesis}"`);
      }
      if (mercury.retrograde) {
        personalContent.push(`"Mercury retrograde: You process internally before speaking. Ideas gestate longer. You may revise, reconsider, and return to old thoughts. Communication flows better in writing or after reflection."`);
      }
      if (mercuryDignity !== 'peregrine') {
        personalContent.push(`"${getPlacementFeeling('Mercury', mercury.sign, mercuryDignity, mercury.house)}"`);
      }
    }
    
    if (venus) {
      const venusDignity = computeDignity('Venus', venus.sign, useTraditional);
      const venusDescription = PLANET_IN_SIGN.Venus?.[venus.sign] || `Your Venus expresses through ${venus.sign}.`;
      const venusHouse = getHouseContext(venus.house, 'Venus');
      const venusSynthesis = getSynthesis('Venus', venus.sign, venus.house);
      personalContent.push(`"Venus in ${venus.sign}${venus.house ? ` (${venus.house}${venus.house === 1 ? 'st' : venus.house === 2 ? 'nd' : venus.house === 3 ? 'rd' : 'th'} house)` : ''}:"`);
      personalContent.push(`"${venusDescription}"`);
      if (venusHouse) {
        personalContent.push(`"${venusHouse}"`);
      }
      if (venusSynthesis) {
        personalContent.push(`"THE SYNTHESIS: ${venusSynthesis}"`);
      }
      if (venusDignity !== 'peregrine') {
        personalContent.push(`"${getPlacementFeeling('Venus', venus.sign, venusDignity, venus.house)}"`);
      }
    }
    
    if (mars) {
      const marsDignity = computeDignity('Mars', mars.sign, useTraditional);
      const marsDescription = PLANET_IN_SIGN.Mars?.[mars.sign] || `Your Mars expresses through ${mars.sign}.`;
      const marsHouse = getHouseContext(mars.house, 'Mars');
      const marsSynthesis = getSynthesis('Mars', mars.sign, mars.house);
      personalContent.push(`"Mars in ${mars.sign}${mars.house ? ` (${mars.house}${mars.house === 1 ? 'st' : mars.house === 2 ? 'nd' : mars.house === 3 ? 'rd' : 'th'} house)` : ''}:"`);
      personalContent.push(`"${marsDescription}"`);
      if (marsHouse) {
        personalContent.push(`"${marsHouse}"`);
      }
      if (marsSynthesis) {
        personalContent.push(`"THE SYNTHESIS: ${marsSynthesis}"`);
      }
      if (marsDignity !== 'peregrine') {
        personalContent.push(`"${getPlacementFeeling('Mars', mars.sign, marsDignity, mars.house)}"`);
      }
    }
    
    if (personalContent.length > 0) {
      sections.push({
        title: "Personal Planets — How You Operate",
        content: personalContent
      });
    }

    // 3.5 SOCIAL PLANETS (Jupiter, Saturn)
    const jupiter = planets.find(p => p.name === 'Jupiter');
    const saturn = planets.find(p => p.name === 'Saturn');
    
    const socialContent: string[] = [];
    
    if (jupiter) {
      const jupiterDignity = computeDignity('Jupiter', jupiter.sign, useTraditional);
      const jupiterDescription = PLANET_IN_SIGN.Jupiter?.[jupiter.sign] || `Your Jupiter expresses through ${jupiter.sign}.`;
      const jupiterHouse = getHouseContext(jupiter.house, 'Jupiter');
      const jupiterSynthesis = getSynthesis('Jupiter', jupiter.sign, jupiter.house);
      socialContent.push(`"Jupiter in ${jupiter.sign}${jupiter.house ? ` (${jupiter.house}${jupiter.house === 1 ? 'st' : jupiter.house === 2 ? 'nd' : jupiter.house === 3 ? 'rd' : 'th'} house)` : ''} — WHERE YOU EXPAND:"`);
      socialContent.push(`"${jupiterDescription}"`);
      if (jupiterHouse) {
        socialContent.push(`"${jupiterHouse}"`);
      }
      if (jupiterSynthesis) {
        socialContent.push(`"THE SYNTHESIS: ${jupiterSynthesis}"`);
      }
      if (jupiterDignity !== 'peregrine') {
        socialContent.push(`"${getPlacementFeeling('Jupiter', jupiter.sign, jupiterDignity, jupiter.house)}"`);
      }
    }
    
    if (saturn) {
      const saturnDignity = computeDignity('Saturn', saturn.sign, useTraditional);
      const saturnDescription = PLANET_IN_SIGN.Saturn?.[saturn.sign] || `Your Saturn expresses through ${saturn.sign}.`;
      const saturnHouse = getHouseContext(saturn.house, 'Saturn');
      const saturnSynthesis = getSynthesis('Saturn', saturn.sign, saturn.house);
      socialContent.push(`"Saturn in ${saturn.sign}${saturn.house ? ` (${saturn.house}${saturn.house === 1 ? 'st' : saturn.house === 2 ? 'nd' : saturn.house === 3 ? 'rd' : 'th'} house)` : ''} — WHERE YOU MASTER THROUGH CHALLENGE:"`);
      socialContent.push(`"${saturnDescription}"`);
      if (saturnHouse) {
        socialContent.push(`"${saturnHouse}"`);
      }
      if (saturnSynthesis) {
        socialContent.push(`"THE SYNTHESIS: ${saturnSynthesis}"`);
      }
      if (saturnDignity !== 'peregrine') {
        socialContent.push(`"${getPlacementFeeling('Saturn', saturn.sign, saturnDignity, saturn.house)}"`);
      }
    }
    
    if (socialContent.length > 0) {
      sections.push({
        title: "Social Planets — Growth & Mastery",
        content: socialContent
      });
    }

    // 4. KEY ASPECTS (tight ones first) - with contextual explanations
    const tightAspects = aspects.filter(a => a.orb < 3).slice(0, 5);
    const aspectContent: string[] = [];
    
    if (tightAspects.length > 0) {
      aspectContent.push(`"Now let's look at the strongest connections in your chart — aspects under 3° that you feel intensely."`);
      
      tightAspects.forEach(aspect => {
        const p1 = planets.find(p => p.name === aspect.planet1);
        const p2 = planets.find(p => p.name === aspect.planet2);
        const p1Meaning = PLANET_MEANINGS[aspect.planet1]?.split(',')[0] || aspect.planet1;
        const p2Meaning = PLANET_MEANINGS[aspect.planet2]?.split(',')[0] || aspect.planet2;
        const symbol = getAspectSymbol(aspect.aspectType);
        
        aspectContent.push(`"${aspect.planet1} ${symbol} ${aspect.planet2} (${aspect.orb.toFixed(1)}°): ${getAspectFeeling(aspect, p1Meaning, p2Meaning)}"`);
        
        // Add contextual explanation if we have sign/house data
        if (p1 && p2) {
          const contextual = getContextualAspectExplanation(
            aspect.planet1,
            p1.sign,
            p1.house || 1,
            aspect.planet2,
            p2.sign,
            p2.house || 1,
            aspect.aspectType
          );
          
          // Add the "why" explanation
          aspectContent.push(`"Why this matters: ${contextual.whyTensionExists.slice(0, 300)}${contextual.whyTensionExists.length > 300 ? '...' : ''}"`);
          
          // Add how others perceive this
          aspectContent.push(`"Others sense this: ${contextual.othersPerceive}"`);
          
          // Add one key remedy
          if (contextual.whatHelps.length > 0) {
            aspectContent.push(`"What helps: ${contextual.whatHelps[0]}"`);
          }
        }
      });
    } else {
      aspectContent.push(`"Your aspects are more diffuse — no single connection dominates. This can mean more flexibility in how these energies express."`);
    }
    
    sections.push({
      title: "Key Aspects — The Conversations Between Planets",
      content: aspectContent
    });

    // 5. DISPOSITOR CHAIN / COMMAND CENTER
    const dispositorContent: string[] = [];
    
    // Find mutual receptions
    const mutualReceptions: Array<[string, string]> = [];
    planets.forEach(p1 => {
      planets.forEach(p2 => {
        if (p1.name !== p2.name) {
          const ruler1 = getSignRuler(p1.sign, useTraditional);
          const ruler2 = getSignRuler(p2.sign, useTraditional);
          if (ruler1 === p2.name && ruler2 === p1.name) {
            if (!mutualReceptions.some(([a, b]) => 
              (a === p1.name && b === p2.name) || (a === p2.name && b === p1.name)
            )) {
              mutualReceptions.push([p1.name, p2.name]);
            }
          }
        }
      });
    });
    
    // Find planets in own sign
    const selfRulers = planets.filter(p => getSignRuler(p.sign, useTraditional) === p.name);
    
    if (mutualReceptions.length > 0) {
      const [p1, p2] = mutualReceptions[0];
      dispositorContent.push(`"Your chart has a powerful command center: ${p1} and ${p2} are in mutual reception — they rule each other's signs."`);
      dispositorContent.push(`"This means every planet in your chart eventually reports up to these two. All your decisions filter through ${p1} and ${p2} themes."`);
      dispositorContent.push(`"When making choices, you'll naturally ask: 'Does this align with my ${PLANET_MEANINGS[p1]?.split(',')[0]?.toLowerCase() || p1}?' AND 'Does this serve my ${PLANET_MEANINGS[p2]?.split(',')[0]?.toLowerCase() || p2}?'"`);
    } else if (selfRulers.length > 0) {
      dispositorContent.push(`"${selfRulers.map(p => p.name).join(' and ')} ${selfRulers.length > 1 ? 'are' : 'is'} in ${selfRulers.length > 1 ? 'their' : 'its'} own sign — acting as final dispositor(s) in your chart."`);
      dispositorContent.push(`"Energy flows cleanly to ${selfRulers.length > 1 ? 'these points' : 'this point'}. ${selfRulers[0].name} themes run through much of your chart."`);
    } else {
      dispositorContent.push(`"Your chart has a dispositor loop — planets circulate energy without a single 'boss.' This can feel like going in circles until you consciously choose a starting point."`);
    }
    
    sections.push({
      title: "The Command Center — Who Calls the Shots",
      content: dispositorContent
    });

    // 6. CHALLENGES & GROWTH EDGES
    const challengeContent: string[] = [];
    
    const challengingPlacements = planets.filter(p => {
      const dignity = computeDignity(p.name, p.sign, useTraditional);
      return dignity === 'detriment' || dignity === 'fall';
    });
    
    if (challengingPlacements.length > 0) {
      challengeContent.push(`"Let's talk about where you build mastery through practice rather than having it handed to you."`);
      
      challengingPlacements.slice(0, 3).forEach(p => {
        const dignity = computeDignity(p.name, p.sign, useTraditional);
        challengeContent.push(`"${p.name} in ${p.sign} (${dignity}): ${DIGNITY_EXPLAINERS[dignity]}"`);
      });
      
      challengeContent.push(`"Remember: these aren't weaknesses. They're where you develop hard-won expertise that others may never fully understand."`);
    } else {
      challengeContent.push(`"Your planets are mostly in neutral or supported positions — you may not face as many internal friction points, but watch for taking natural gifts for granted."`);
    }
    
    sections.push({
      title: "Growth Edges — Where You Build Mastery",
      content: challengeContent
    });

    // 7. CHART PATTERNS (Yod, T-Square, etc.)
    if (natalChart) {
      const patterns = detectChartPatterns(natalChart);
      
      if (patterns.length > 0) {
        const patternContent: string[] = [];
        patternContent.push(`"Your chart contains some significant patterns — geometric configurations that amplify certain themes."`);
        
        patterns.forEach(pattern => {
          if (pattern.name.includes('Yod')) {
            patternContent.push(`\n**⚲ YOD (FINGER OF GOD)**`);
            patternContent.push(`"This is one of the most significant patterns in astrology — it indicates a special mission or destiny."`);
            
            // Parse the detailed description
            const descLines = pattern.description.split('\n').filter(l => l.trim());
            descLines.forEach(line => {
              if (line.startsWith('**')) {
                patternContent.push(line);
              } else {
                patternContent.push(`"${line}"`);
              }
            });
            
            patternContent.push(`\n**The Challenge:**`);
            patternContent.push(`"${pattern.challenge}"`);
            
            patternContent.push(`\n**The Gift:**`);
            patternContent.push(`"${pattern.gift}"`);
          } else {
            patternContent.push(`\n**${pattern.symbol} ${pattern.name.toUpperCase()}**`);
            patternContent.push(`"Planets involved: ${pattern.planets.join(', ')}"`);
            patternContent.push(`"${pattern.meaning}"`);
            if (pattern.challenge) {
              patternContent.push(`"Challenge: ${pattern.challenge}"`);
            }
            if (pattern.gift) {
              patternContent.push(`"Gift: ${pattern.gift}"`);
            }
          }
        });
        
        sections.push({
          title: "Chart Patterns — Geometry of Destiny",
          content: patternContent
        });
      }
    }

    // 8. CLOSING
    sections.push({
      title: "Closing",
      content: [
        `"This is your unique cosmic blueprint. The chart shows tendencies, not destiny — you always have choice in how you express these energies."`,
        `"What questions do you have? What resonated most strongly?"`
      ]
    });

    return sections;
  }, [planets, aspects, chartName, useTraditional, natalChart, age, lifeStage]);

  const copyToClipboard = () => {
    const fullScript = script.map(section => 
      `## ${section.title}\n\n${section.content.join('\n\n')}`
    ).join('\n\n---\n\n');
    
    navigator.clipboard.writeText(fullScript);
    toast.success('Reading script copied to clipboard!');
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <CollapsibleTrigger className="w-full">
            <CardTitle className="text-sm font-medium flex items-center justify-between cursor-pointer hover:text-primary transition-colors">
              <div className="flex items-center gap-2">
                <FileText size={16} />
                Chart Reading Script
              </div>
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </CardTitle>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                A step-by-step narrative script for giving readings. Copy and customize for your style.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyToClipboard}
                className="flex items-center gap-2"
              >
                <Copy size={14} />
                Copy Script
              </Button>
            </div>
            
            <ScrollArea className="h-[500px] rounded-md border p-4">
              <div className="space-y-6">
                {script.map((section, i) => (
                  <div key={i}>
                    <h4 className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                        {i + 1}
                      </span>
                      {section.title}
                    </h4>
                    <div className="space-y-3 pl-8">
                      {section.content.map((paragraph, j) => (
                        <p 
                          key={j} 
                          className={`text-sm leading-relaxed ${
                            paragraph.startsWith('"') 
                              ? 'italic text-foreground' 
                              : 'text-muted-foreground'
                          }`}
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {i < script.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="bg-secondary/30 p-3 rounded-md">
              <p className="text-[10px] text-muted-foreground">
                <strong>Tip:</strong> Pause after each section and invite questions. The best readings are conversations, not monologues.
                Adjust the language to match your style — these are starting points, not scripts to read verbatim.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

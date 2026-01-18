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

interface ReadingScriptGeneratorProps {
  planets: ChartPlanet[];
  aspects: ChartAspect[];
  chartName: string;
  useTraditional: boolean;
  natalChart?: NatalChart | null;
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

function getHouseContext(house: number | undefined, planetName: string): string {
  if (!house) return '';
  const context = HOUSE_CONTEXTS[house];
  if (!context) return '';
  return `In the ${house}${house === 1 ? 'st' : house === 2 ? 'nd' : house === 3 ? 'rd' : 'th'} house of ${context.area}: ${context.meaning}`;
}

// Synthesis statements that weave sign + house together
const SIGN_HOUSE_SYNTHESIS: Record<string, Record<number, string>> = {
  Mercury: {
    1: 'Your thinking IS your identity — you lead with your mind and people know you by how you communicate.',
    2: 'Your mind is wired for practical value — you think about money, resources, and what ideas are actually worth.',
    3: 'Your mind is in its natural habitat — constant communication, learning, and mental stimulation are your daily bread.',
    4: 'Your thinking happens at home, in private — you process best in familiar environments and may keep your best ideas to yourself.',
    5: 'Your mind wants to play and create — you think best when you\'re having fun, and communication is a form of self-expression.',
    6: 'Your mind is wired for work and problem-solving — you think in terms of improvement, efficiency, and practical service.',
    7: 'Your thinking happens through others — you process best in dialogue, and your mind needs a partner to bounce ideas off.',
    8: 'Your mind goes deep — you think about what\'s hidden, you research obsessively, and your communication carries psychological weight.',
    9: 'Your mind seeks meaning — you think in big pictures, philosophies, and need your ideas to connect to something larger.',
    10: 'Your thinking is public — you\'re known for your ideas, your communication style is part of your career, and your mind builds your reputation.',
    11: 'Your mind is wired for the collective — you think about the future, connect ideas across groups, and your thoughts serve causes larger than yourself.',
    12: 'Your thinking happens behind the scenes — you process best in solitude, your mind connects to the unconscious, and you may communicate through dreams, art, or private writing.'
  },
  Venus: {
    1: 'Your values and aesthetics ARE your identity — beauty, grace, and harmony are immediately visible in how you present yourself.',
    2: 'Your values are tied to what you own — you attract money, you spend on beauty, and self-worth connects to material security.',
    3: 'Your love language is communication — you charm through words, value mental connection, and find beauty in learning.',
    4: 'Your love lives at home — you need a beautiful sanctuary, you nurture through comfort, and your deepest values are private.',
    5: 'Your love is playful and creative — romance is dramatic, you attract through self-expression, and love feels like celebration.',
    6: 'Your love shows through service — you care by helping, you find beauty in useful things, and daily routines must feel harmonious.',
    7: 'Your love needs partnership to exist — you come alive in relationship, you value balance above all, and you attract significant others easily.',
    8: 'Your love goes deep — you merge intensely, you\'re attracted to power and transformation, and love feels like psychological rebirth.',
    9: 'Your love needs freedom and meaning — you\'re attracted to wisdom, adventure, and partners who expand your world.',
    10: 'Your love is public — relationships affect your reputation, you may attract through your career, and you value achievement in partners.',
    11: 'Your love flows through friendship — you value independence in relationships, you\'re attracted to unique individuals, and love connects to causes.',
    12: 'Your love is hidden or spiritual — you may have secret relationships, you\'re attracted to transcendence, and love can feel sacrificial or boundless.'
  },
  Mars: {
    1: 'Your drive IS your identity — you come across as assertive, competitive, and action-oriented. People see your energy immediately.',
    2: 'Your drive is wired for earning — you fight for financial security, you\'re aggressive about money, and your energy goes into building resources.',
    3: 'Your drive expresses through communication — you argue, debate, and your words have force. Mental activity is how you take action.',
    4: 'Your drive lives at home — you may fight with family, you\'re protective of your private space, and your energy needs a base to operate from.',
    5: 'Your drive is creative and romantic — you pursue love dramatically, you compete in play, and your energy needs creative outlet.',
    6: 'Your drive goes into work and health — you\'re a workhorse, you push your body, and your energy is most focused on daily tasks and service.',
    7: 'Your drive expresses through partnership — you may fight with or for partners, you\'re attracted to assertive people, and relationships activate your energy.',
    8: 'Your drive goes into depth and transformation — you pursue power, you\'re sexually intense, and your energy is focused on psychological change.',
    9: 'Your drive seeks meaning and freedom — you fight for your beliefs, you take action through travel or education, and your energy needs a cause.',
    10: 'Your drive is career-focused — you\'re ambitious, you fight for status, and your energy builds your public reputation.',
    11: 'Your drive serves the collective — you fight for causes, you\'re energized by groups, and your action needs to connect to future visions.',
    12: 'Your drive is hidden or self-sabotaging — you may turn anger inward, you act behind the scenes, and your energy connects to the unconscious or spiritual realms.'
  },
  // Jupiter and Saturn need sign+house combined syntheses, not generic house statements
  // These will be generated dynamically in getJupiterSynthesis and getSaturnSynthesis functions
};

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
  
  // For Jupiter and Saturn, use the dedicated functions
  if (planetName === 'Jupiter') return getJupiterSynthesis(sign, house);
  if (planetName === 'Saturn') return getSaturnSynthesis(sign, house);
  
  const planetSyntheses = SIGN_HOUSE_SYNTHESIS[planetName];
  if (!planetSyntheses) return '';
  return planetSyntheses[house] || '';
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
  natalChart
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const script = useMemo(() => {
    const sections: ScriptSection[] = [];
    
    // 1. OPENING
    sections.push({
      title: "Opening",
      content: [
        `"Let's explore ${chartName}'s natal chart together. I'll walk you through the key patterns I see."`,
        `"Remember: nothing in your chart is 'bad.' Some placements require more conscious work, but those often become your greatest strengths."`
      ]
    });

    // 2. THE BIG THREE (Sun, Moon, Ascendant)
    const sun = planets.find(p => p.name === 'Sun');
    const moon = planets.find(p => p.name === 'Moon');
    const asc = planets.find(p => p.name === 'Ascendant');
    
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

    // 4. KEY ASPECTS (tight ones first)
    const tightAspects = aspects.filter(a => a.orb < 3).slice(0, 5);
    const aspectContent: string[] = [];
    
    if (tightAspects.length > 0) {
      aspectContent.push(`"Now let's look at the strongest connections in your chart — aspects under 3° that you feel intensely."`);
      
      tightAspects.forEach(aspect => {
        const p1Meaning = PLANET_MEANINGS[aspect.planet1]?.split(',')[0] || aspect.planet1;
        const p2Meaning = PLANET_MEANINGS[aspect.planet2]?.split(',')[0] || aspect.planet2;
        const symbol = getAspectSymbol(aspect.aspectType);
        
        aspectContent.push(`"${aspect.planet1} ${symbol} ${aspect.planet2} (${aspect.orb.toFixed(1)}°): ${getAspectFeeling(aspect, p1Meaning, p2Meaning)}"`);
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
  }, [planets, aspects, chartName, useTraditional, natalChart]);

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

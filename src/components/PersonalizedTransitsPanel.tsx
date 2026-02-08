import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { NatalChart } from '@/hooks/useNatalChart';
import { PlanetaryPositions } from '@/lib/astrology';
import { calculateTransitAspects, getTransitPlanetSymbol } from '@/lib/transitAspects';
import { getNatalPlanetHouse, getTransitPlanetHouse } from '@/lib/houseCalculations';
import { Sparkles, Heart, Zap, ChevronDown, ChevronUp, Loader2, Info } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓"
};

// Major planets and angles that users understand
const MAJOR_BODIES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'Ascendant', 'Midheaven'
];

// Minor bodies (asteroids, nodes, etc.)
const MINOR_BODIES = [
  'NorthNode', 'SouthNode', 'Chiron', 'Ceres', 'Pallas', 'Juno', 'Vesta',
  'Lilith', 'Pholus', 'Nessus', 'Orcus', 'Ixion', 'Varuna', 'Quaoar',
  'Makemake', 'Haumea', 'Eris', 'Sedna', 'Gonggong'
];

// Descriptions for celestial bodies
const BODY_DESCRIPTIONS: Record<string, { name: string; symbol: string; meaning: string }> = {
  Sun: { name: 'Sun', symbol: '☉', meaning: 'Your core identity, ego, vitality, and life purpose. Where you shine.' },
  Moon: { name: 'Moon', symbol: '☽', meaning: 'Your emotions, instincts, comfort needs, and inner world.' },
  Mercury: { name: 'Mercury', symbol: '☿', meaning: 'How you think, communicate, learn, and process information.' },
  Venus: { name: 'Venus', symbol: '♀', meaning: 'Love, beauty, values, pleasure, and what you attract.' },
  Mars: { name: 'Mars', symbol: '♂', meaning: 'Action, drive, desire, anger, and how you assert yourself.' },
  Jupiter: { name: 'Jupiter', symbol: '♃', meaning: 'Expansion, luck, wisdom, growth, and where you find meaning.' },
  Saturn: { name: 'Saturn', symbol: '♄', meaning: 'Discipline, structure, limits, responsibility, and life lessons.' },
  Uranus: { name: 'Uranus', symbol: '♅', meaning: 'Revolution, awakening, freedom, innovation, and sudden change.' },
  Neptune: { name: 'Neptune', symbol: '♆', meaning: 'Dreams, intuition, spirituality, illusion, and transcendence.' },
  Pluto: { name: 'Pluto', symbol: '♇', meaning: 'Transformation, power, death/rebirth, and deep psychology.' },
  Ascendant: { name: 'Ascendant', symbol: 'AC', meaning: 'Your rising sign. How you appear to others and approach life.' },
  Midheaven: { name: 'Midheaven', symbol: 'MC', meaning: 'Your public image, career, reputation, and life direction.' },
  NorthNode: { name: 'North Node', symbol: '☊', meaning: 'Your soul\'s growth direction and life purpose in this lifetime.' },
  SouthNode: { name: 'South Node', symbol: '☋', meaning: 'Past life gifts and patterns. Comfort zone to move beyond.' },
  Chiron: { name: 'Chiron', symbol: '⚷', meaning: 'The Wounded Healer. Your deepest wound that becomes your gift to others.' },
  Ceres: { name: 'Ceres', symbol: '⚳', meaning: 'Nurturing, food, mothering, loss/return cycles, and self-care.' },
  Pallas: { name: 'Pallas Athena', symbol: '⚴', meaning: 'Wisdom, strategy, pattern recognition, and creative intelligence.' },
  Juno: { name: 'Juno', symbol: '⚵', meaning: 'Partnership, marriage, commitment, and what you need in a mate.' },
  Vesta: { name: 'Vesta', symbol: '⚶', meaning: 'Sacred devotion, focus, purity, and what you dedicate yourself to.' },
  Lilith: { name: 'Black Moon Lilith', symbol: '⚸', meaning: 'Your wild, untamed feminine. Shadow desires and rejection wounds.' },
  Pholus: { name: 'Pholus', symbol: '⯛', meaning: 'Small cause, big effect. Uncorking ancestral patterns. Catalyst energy.' },
  Nessus: { name: 'Nessus', symbol: '⯜', meaning: 'Abuse cycles, karma, the poison and its cure. Accountability.' },
  Orcus: { name: 'Orcus', symbol: '🜨', meaning: 'Oaths, promises, integrity. What you\'re bound to karmically.' },
  Ixion: { name: 'Ixion', symbol: '⯝', meaning: 'Lawlessness, betrayal, testing boundaries. Where we repeat mistakes.' },
  Varuna: { name: 'Varuna', symbol: '⯞', meaning: 'Fame, reputation, the all-seeing eye. Cosmic order and lies.' },
  Quaoar: { name: 'Quaoar', symbol: '🝾', meaning: 'Creation, dance, the playful origins of existence.' },
  Makemake: { name: 'Makemake', symbol: '🝻', meaning: 'Environmental awareness, fertility, connection to nature.' },
  Haumea: { name: 'Haumea', symbol: '🝼', meaning: 'Rebirth, fertility, Hawaiian creation goddess energy.' },
  Eris: { name: 'Eris', symbol: '⯙', meaning: 'Discord, awakening, the uninvited truth that disrupts.' },
  Sedna: { name: 'Sedna', symbol: '⯲', meaning: 'Deep trauma, abandonment, victimization, and transcendence.' },
  Gonggong: { name: 'Gonggong', symbol: '共', meaning: 'Chaos, climate, collective upheaval, the flood myth.' },
};

// Aspect descriptions
const ASPECT_DESCRIPTIONS: Record<string, { name: string; symbol: string; meaning: string }> = {
  conjunction: { name: 'Conjunction', symbol: '☌', meaning: 'Energies merge and intensify. Powerful blending of forces.' },
  opposition: { name: 'Opposition', symbol: '☍', meaning: 'Tension and awareness. Two forces pulling you in different directions.' },
  trine: { name: 'Trine', symbol: '△', meaning: 'Easy flow and harmony. Natural talents and gifts.' },
  square: { name: 'Square', symbol: '□', meaning: 'Friction and challenge. Growth through tension and action.' },
  sextile: { name: 'Sextile', symbol: '⚹', meaning: 'Opportunity and cooperation. Gentle support requiring effort to activate.' },
};

// Get interpretations for where Moon lands in natal houses
const getMoonInHouseInterpretation = (house: number | null): string => {
  if (!house) return '';
  const interpretations: Record<number, string> = {
    1: 'The Moon lights up your sense of self today. Your emotions are visible to others. Lead with your feelings.',
    2: 'Emotional focus on security, finances, and what you value. Good for self-care and comfort.',
    3: 'Communication is emotionally charged. Write, speak, connect with siblings or neighbors.',
    4: 'Home and family draw your attention. Nurture your roots. Privacy feels healing.',
    5: 'Creative expression and pleasure are highlighted. Romance, children, play—follow your joy.',
    6: 'Focus on daily routines and health. Emotional satisfaction comes through service.',
    7: 'Partnerships need attention. Your emotional needs are tied to others today.',
    8: 'Deep feelings surface. Transformation, intimacy, shared resources are activated.',
    9: 'Seek meaning and expansion. Travel, learning, philosophy speak to your soul.',
    10: 'Career and public image are emotionally important. Recognition matters today.',
    11: 'Friends and community fulfill you. Group activities and future visions inspire.',
    12: 'Retreat and reflection needed. Dreams are vivid. Solitude restores you.',
  };
  return interpretations[house] || '';
};

// Get interpretation for where a transit planet falls in natal house
// Returns: { meaning: what it means, feeling: how it feels }
const getTransitInHouseInterpretation = (planet: string, house: number | null): { meaning: string; feeling: string } | null => {
  if (!house) return null;
  
  const interpretations: Record<string, Record<number, { meaning: string; feeling: string }>> = {
    Pluto: {
      1: { meaning: "Deep identity transformation is underway - who you are is evolving at the core.", feeling: "You feel compelled to shed old versions of yourself, sometimes uncomfortably." },
      2: { meaning: "Your relationship with money, possessions, and self-worth is being transformed.", feeling: "You may feel obsessed with financial security or purging what you own." },
      3: { meaning: "Your thinking patterns and communication style are undergoing profound change.", feeling: "Conversations feel heavier; you are drawn to deeper truths and uncomfortable topics." },
      4: { meaning: "Family dynamics, home life, and emotional roots are being transformed.", feeling: "You feel like you are excavating your past - old family patterns demand attention." },
      5: { meaning: "Your creative expression, romance, and relationship with joy are intensifying.", feeling: "Creative projects feel all-consuming; love affairs are transformative, not casual." },
      6: { meaning: "Your daily routines, health habits, and work patterns are undergoing deep change.", feeling: "You may feel compelled to overhaul your diet, job, or how you serve others." },
      7: { meaning: "Partnerships and one-on-one relationships are transforming profoundly.", feeling: "Relationships feel intense - power dynamics surface and demand renegotiation." },
      8: { meaning: "Shared resources, intimacy, and psychological depths are being transformed.", feeling: "You are drawn to investigate taboos, death, sex, or other people's money." },
      9: { meaning: "Your beliefs, worldview, and search for meaning are being deeply transformed.", feeling: "Old philosophies feel hollow; you are searching for a truth that resonates in your bones." },
      10: { meaning: "Your career, public image, and life direction are undergoing major transformation.", feeling: "You feel driven to claim power in your career - or tear down false success." },
      11: { meaning: "Your friendships, community ties, and future visions are transforming.", feeling: "You are outgrowing old friend groups and feeling called to impact the collective." },
      12: { meaning: "Your subconscious, spirituality, and hidden patterns are being transformed.", feeling: "You may feel haunted by the past, drawn to therapy, or experiencing vivid dreams." },
    },
    Neptune: {
      1: { meaning: "Your identity and self-image are becoming more fluid and spiritualized.", feeling: "You may feel confused about who you are, or more intuitive and creative." },
      2: { meaning: "Your relationship with money and values is becoming idealistic or confused.", feeling: "Finances feel slippery; you are drawn to spend on art, spirituality, or escapism." },
      3: { meaning: "Your thinking and communication are becoming more intuitive and imaginative.", feeling: "Your mind drifts; conversations feel poetic but sometimes lack clarity." },
      4: { meaning: "Your home and family life are becoming more idealized or confusing.", feeling: "Home feels like a sanctuary or a source of longing; family dynamics are hazy." },
      5: { meaning: "Your creativity, romance, and self-expression are becoming more inspired.", feeling: "You are drawn to artistic pursuits; romance feels magical but potentially illusory." },
      6: { meaning: "Your daily routines and health are influenced by intuition or confusion.", feeling: "Work boundaries blur; you may be drawn to healing arts or feel drained by service." },
      7: { meaning: "Your partnerships are becoming more idealized or confusing.", feeling: "You may project fantasy onto partners or feel spiritually connected - or deceived." },
      8: { meaning: "Your experience of intimacy and shared resources is becoming more spiritual.", feeling: "Boundaries dissolve in close relationships; you are drawn to mystical transformation." },
      9: { meaning: "Your beliefs and search for meaning are expanding into spiritual realms.", feeling: "You are drawn to transcendent experiences, travel, or escaping through philosophy." },
      10: { meaning: "Your career and public image are becoming more idealistic or unclear.", feeling: "You may feel lost about your calling, or drawn to creative/healing professions." },
      11: { meaning: "Your friendships and future visions are becoming more idealistic.", feeling: "You are drawn to spiritual communities; some friends may disappoint or inspire." },
      12: { meaning: "Your spirituality and subconscious are extremely activated.", feeling: "You are deeply intuitive, possibly psychic - but may struggle with boundaries or escapism." },
    },
    Uranus: {
      1: { meaning: "Your identity and self-expression are becoming more independent and unpredictable.", feeling: "You feel restless in your own skin - drawn to reinvent yourself unexpectedly." },
      2: { meaning: "Your finances and values are undergoing sudden changes.", feeling: "Income may be erratic; you are questioning what truly matters to you." },
      3: { meaning: "Your thinking and communication style are becoming more original.", feeling: "Your mind races with new ideas; you may shock others with what you say." },
      4: { meaning: "Your home and family life are experiencing unexpected changes.", feeling: "Home feels unstable; you may relocate suddenly or break from family patterns." },
      5: { meaning: "Your creativity, romance, and self-expression are becoming more unconventional.", feeling: "You are drawn to unusual creative outlets; love affairs may be sudden or unusual." },
      6: { meaning: "Your daily routines and work are disrupted by change and innovation.", feeling: "You cannot stand boring routines; drawn to freelance, tech, or alternative health." },
      7: { meaning: "Your partnerships are experiencing sudden changes and need for freedom.", feeling: "Relationships feel electric but unstable; you need more independence." },
      8: { meaning: "Your experience of intimacy and shared resources is becoming unpredictable.", feeling: "Sudden financial changes through others; intimacy needs freedom and experimentation." },
      9: { meaning: "Your beliefs and worldview are being revolutionized.", feeling: "Old beliefs shatter; you are drawn to radical ideas, sudden travel, or unconventional teachers." },
      10: { meaning: "Your career and public image are undergoing sudden changes.", feeling: "Career path feels unpredictable; you may pivot suddenly or seek more freedom." },
      11: { meaning: "Your friendships and future visions are electrified.", feeling: "You are drawn to unconventional friends; group activities feel exciting but unstable." },
      12: { meaning: "Your subconscious and spiritual life are experiencing awakenings.", feeling: "Sudden insights from dreams; you may feel like an outsider or have psychic flashes." },
    },
    Saturn: {
      1: { meaning: "You are being called to take responsibility for who you are.", feeling: "Life feels heavier; you are learning to define yourself through discipline and maturity." },
      2: { meaning: "You are learning lessons about money, resources, and self-worth.", feeling: "Finances feel restricted; you are building lasting security through hard work." },
      3: { meaning: "You are developing more disciplined thinking and communication.", feeling: "Learning feels serious; you may struggle with siblings or feel mentally burdened." },
      4: { meaning: "You are facing responsibilities around home and family.", feeling: "Home feels like work; you are dealing with family obligations or building foundations." },
      5: { meaning: "You are learning to take your creativity and joy more seriously.", feeling: "Fun feels like a responsibility; romance may feel restricted or more mature." },
      6: { meaning: "You are being called to master your daily routines and health.", feeling: "Work feels demanding; you are building better habits through discipline." },
      7: { meaning: "You are facing lessons about commitment and partnership.", feeling: "Relationships feel tested; you are learning what you need from a mature partner." },
      8: { meaning: "You are learning about shared resources, intimacy, and transformation.", feeling: "Deep topics feel heavy; you are facing fears and building psychological strength." },
      9: { meaning: "You are being tested on your beliefs and search for meaning.", feeling: "Education or travel may feel restricted; you are building a solid philosophy." },
      10: { meaning: "You are facing major responsibilities around career and life direction.", feeling: "Career feels demanding; you are building something lasting through hard work." },
      11: { meaning: "You are learning lessons about friendship and your role in community.", feeling: "Friend groups may shrink; you are identifying who your true allies are." },
      12: { meaning: "You are facing hidden fears and learning to work with solitude.", feeling: "You may feel isolated; spiritual practices become more disciplined and grounding." },
    },
    Jupiter: {
      1: { meaning: "Opportunities for growth in your identity and self-expression are expanding.", feeling: "You feel optimistic, larger than life - possibly taking on too much." },
      2: { meaning: "Financial growth and abundance opportunities are increasing.", feeling: "Money flows more easily; you feel generous and value expansion." },
      3: { meaning: "Learning, communication, and short journeys are expanding.", feeling: "Your mind is hungry for knowledge; conversations open doors." },
      4: { meaning: "Home, family, and emotional foundations are expanding.", feeling: "Home feels abundant; you may move to a larger space or feel rooted." },
      5: { meaning: "Creativity, romance, and joy are expanding.", feeling: "Life feels more playful; love and creative projects flourish." },
      6: { meaning: "Opportunities in work and health improvement are increasing.", feeling: "Work flows well; you are motivated to improve health habits." },
      7: { meaning: "Partnership opportunities and relationship growth are expanding.", feeling: "Relationships feel supportive and growth-oriented; you attract beneficial partners." },
      8: { meaning: "Shared resources and transformative experiences are expanding.", feeling: "You may receive through others; deep experiences feel lucky and meaningful." },
      9: { meaning: "Education, travel, and spiritual growth are extremely favored.", feeling: "You are hungry for meaning; travel and learning feel life-changing." },
      10: { meaning: "Career opportunities and public recognition are expanding.", feeling: "Professional life feels blessed; you are seen as an authority or leader." },
      11: { meaning: "Friendships, networking, and future visions are expanding.", feeling: "Social life blossoms; you attract helpful connections and feel hopeful." },
      12: { meaning: "Spiritual growth and inner expansion are highlighted.", feeling: "You find meaning in solitude; hidden blessings and intuition increase." },
    },
    Mars: {
      1: { meaning: "Your drive, energy, and assertiveness are heightened.", feeling: "You feel more combative and energetic - ready to take action on your own behalf." },
      2: { meaning: "Energy is directed toward earning money and protecting your resources.", feeling: "You are motivated to make money and may be defensive about possessions." },
      3: { meaning: "Communication becomes more direct and potentially aggressive.", feeling: "You speak your mind forcefully; debates and arguments are likely." },
      4: { meaning: "Energy is focused on home and family matters.", feeling: "You may be doing home projects or experiencing family conflicts." },
      5: { meaning: "Creative and romantic energy is heightened.", feeling: "You pursue pleasure aggressively; passion runs high in romance and creativity." },
      6: { meaning: "Drive toward work and health improvements intensifies.", feeling: "You are working harder than usual; exercise and productivity surge." },
      7: { meaning: "Conflict and passion in partnerships are activated.", feeling: "Relationships feel heated; you are either fighting with or for your partner." },
      8: { meaning: "Intense energy around intimacy, shared resources, and transformation.", feeling: "Sexual energy is high; you may be dealing with other people's money or power." },
      9: { meaning: "Energy toward travel, education, and defending beliefs increases.", feeling: "You want to go somewhere or learn something; you will fight for your beliefs." },
      10: { meaning: "Ambition and drive for career success are activated.", feeling: "You are pushing hard for professional goals; conflicts with authority possible." },
      11: { meaning: "Energy directed toward friends, groups, and future goals.", feeling: "You are actively pursuing your dreams; group dynamics may be competitive." },
      12: { meaning: "Hidden anger and subconscious drives are activated.", feeling: "You may feel tired or passive-aggressive; spiritual action behind the scenes." },
    },
  };
  
  return interpretations[planet]?.[house] || null;
};

// Get Moon-to-natal-planet aspects with personalized meaning
const getMoonToNatalInterpretation = (natalPlanet: string, aspect: string, moonSign: string): string => {
  const planetMeanings: Record<string, Record<string, string>> = {
    Sun: {
      conjunction: `Your emotions and identity merge today. You feel most authentically yourself.`,
      opposition: `Full Moon energy in YOUR chart. Emotions about who you are reach a peak.`,
      trine: `Easy flow between feelings and self-expression. Confidence comes naturally.`,
      square: `Tension between what you feel and who you think you should be. Honor both.`,
      sextile: `Gentle support for being yourself. Small emotional wins today.`,
    },
    Moon: {
      conjunction: `Lunar Return! Emotional reset point. New emotional cycle begins.`,
      opposition: `Your emotional needs are highlighted through others. Reflection point.`,
      trine: `Emotions flow harmoniously. Trust your instincts.`,
      square: `Internal friction between old and current feelings. What needs adjustment?`,
      sextile: `Subtle emotional support. Intuition is reliable.`,
    },
    Ascendant: {
      conjunction: `Moon crosses your rising sign. You're emotionally visible. Others sense your mood.`,
      opposition: `Emotions focused on partnerships. Others reflect your feelings back.`,
      trine: `How you feel aligns with how you present yourself. Authentic expression.`,
      square: `Emotions may conflict with your usual persona. Inner vs outer tension.`,
      sextile: `Subtle emotional support for self-expression.`,
    },
    Mercury: {
      conjunction: `Feelings and thoughts merge. Speak from the heart.`,
      opposition: `Mind and emotions need balance. Listen before reacting.`,
      trine: `Easy emotional expression. Conversations flow.`,
      square: `Head vs heart conflict. Which wisdom serves you?`,
      sextile: `Gentle mental-emotional harmony.`,
    },
    Venus: {
      conjunction: `Love and comfort merge. Beautiful emotional day for relationships.`,
      opposition: `Relationship feelings peak. Express affection or address needs.`,
      trine: `Harmony in love. Pleasant connections flow naturally.`,
      square: `Love vs comfort tension. What do you truly need?`,
      sextile: `Sweet moments. Small pleasures bring joy.`,
    },
    Mars: {
      conjunction: `Emotions fuel action. Passionate, possibly irritable energy.`,
      opposition: `Feelings and drive may clash. Channel constructively.`,
      trine: `Emotions empower your actions. Motivated and effective.`,
      square: `Irritability possible. Breathe before reacting.`,
      sextile: `Gentle emotional motivation. Steady forward momentum.`,
    },
    Jupiter: {
      conjunction: `Emotional expansion! Joy, optimism, and generosity flow.`,
      opposition: `Big feelings. Don't overcommit based on emotion.`,
      trine: `Lucky feelings. Trust your emotional guidance.`,
      square: `Over-feeling. Where are emotions running away with you?`,
      sextile: `Optimistic mood. Emotional abundance.`,
    },
    Saturn: {
      conjunction: `Emotional maturity called for. Feel deeply but act wisely.`,
      opposition: `Responsibility weighs on emotions. Stay grounded.`,
      trine: `Stable emotions. Discipline supports feelings.`,
      square: `Emotional restriction. What feeling needs healthy boundaries?`,
      sextile: `Practical emotions. Steady inner strength.`,
    },
    Uranus: {
      conjunction: `Unexpected emotions. Embrace spontaneity.`,
      opposition: `Others may disrupt your emotional equilibrium.`,
      trine: `Exciting feelings. Fresh emotional perspectives.`,
      square: `Emotional restlessness. Freedom vs security.`,
      sextile: `Refreshing emotional insights.`,
    },
    Neptune: {
      conjunction: `Dreamy, intuitive, possibly confused. Trust your gut.`,
      opposition: `Clarity vs confusion. Ground yourself before deciding.`,
      trine: `Spiritual, creative, inspired feelings.`,
      square: `Emotional fog. Wait for clarity before action.`,
      sextile: `Gentle intuitions. Compassion deepens.`,
    },
    Pluto: {
      conjunction: `DEEP emotional power activated. Transformation possible.`,
      opposition: `Others may trigger your depths. Power dynamics surface.`,
      trine: `Emotional depth feels safe. Transform gently.`,
      square: `Power struggles with emotions. What are you controlling?`,
      sextile: `Subtle emotional healing. Insight arrives.`,
    },
    NorthNode: {
      conjunction: `Emotions align with your life path. Follow this feeling.`,
      opposition: `Old emotional patterns vs growth direction. Choose forward.`,
      trine: `Emotional support for your destiny. Trust the pull.`,
      square: `Feelings conflict with growth. What must you release?`,
      sextile: `Gentle guidance toward your purpose.`,
    },
    Chiron: {
      conjunction: `Old wounds surface for healing. Be gentle with yourself.`,
      opposition: `Others may trigger your sensitive spots. An opportunity to heal.`,
      trine: `Healing happens naturally today. Wisdom from pain.`,
      square: `Wound activated. Self-compassion is medicine.`,
      sextile: `Subtle healing energy available.`,
    },
  };
  
  return planetMeanings[natalPlanet]?.[aspect] || 
    `The Moon's current position ${aspect}s your natal ${natalPlanet}. Notice how this affects your emotional state.`;
};

// Note: getTransitPlanetHouse is imported from '@/lib/houseCalculations'

interface PersonalizedTransitsPanelProps {
  chart: NatalChart;
  transitPositions: PlanetaryPositions;
  moonSign: string;
  moonDegree: number;
  planetPositions?: Array<{ name: string; sign: string; degree: number }>;
}

export const PersonalizedTransitsPanel = ({ 
  chart, 
  transitPositions, 
  moonSign, 
  moonDegree,
  planetPositions = []
}: PersonalizedTransitsPanelProps) => {
  const [showMinorBodies, setShowMinorBodies] = useState(false);
  const [aiReading, setAiReading] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Build planetPositions from transitPositions if not provided
  const computedPlanetPositions = useMemo(() => {
    if (planetPositions && planetPositions.length > 0) return planetPositions;
    return Object.entries(transitPositions).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      sign: data?.sign || 'Unknown',
      degree: data?.degree || 0
    }));
  }, [transitPositions, planetPositions]);

  // Calculate all transit aspects
  const transitAspects = useMemo(() => {
    return calculateTransitAspects(new Date(), transitPositions, chart);
  }, [transitPositions, chart]);

  // Priority scoring for natal planets (what we FEEL when aspected)
  const NATAL_PRIORITY: Record<string, number> = {
    Sun: 100, Moon: 98, Ascendant: 95, MC: 90, IC: 85, Descendant: 80,
    Mercury: 55, Venus: 55, Mars: 55, Jupiter: 40, Saturn: 40,
    Uranus: 30, Neptune: 30, Pluto: 30, NorthNode: 25, Chiron: 35,
    Lilith: 25, Ceres: 20, Pallas: 15, Juno: 15, Vesta: 15,
  };

  // Sort function: exact first, then by tighter orb, then by natal planet importance
  const sortByImpact = (aspects: typeof transitAspects) => {
    return [...aspects].sort((a, b) => {
      // Exact aspects always first
      if (a.isExact && !b.isExact) return -1;
      if (!a.isExact && b.isExact) return 1;
      
      // Then by natal planet priority (personal points first)
      const natalDiff = (NATAL_PRIORITY[b.natalPlanet] || 10) - (NATAL_PRIORITY[a.natalPlanet] || 10);
      if (natalDiff !== 0) return natalDiff;
      
      // Finally by orb (tighter first)
      return parseFloat(a.orb) - parseFloat(b.orb);
    });
  };

  // Filter for Moon aspects specifically - separated by major vs minor bodies
  const { majorMoonAspects, minorMoonAspects } = useMemo(() => {
    const moonAspects = transitAspects.filter(a => a.transitPlanet === 'Moon');
    return {
      majorMoonAspects: sortByImpact(moonAspects.filter(a => MAJOR_BODIES.includes(a.natalPlanet))),
      minorMoonAspects: sortByImpact(moonAspects.filter(a => MINOR_BODIES.includes(a.natalPlanet))),
    };
  }, [transitAspects]);

  // Priority for TRANSIT planets (outer = slower = more impactful)
  const TRANSIT_PRIORITY: Record<string, number> = {
    Pluto: 100, Neptune: 95, Uranus: 90, Saturn: 85, Jupiter: 75,
    Mars: 50, Sun: 40, Venus: 35, Mercury: 30, Moon: 20,
  };

  // Filter and sort other significant transits (outer planets to personal points first)
  const significantTransits = useMemo(() => {
    const filtered = transitAspects
      .filter(a => a.transitPlanet !== 'Moon' && parseFloat(a.orb) < 5);
    
    // Sort: outer planet transits to personal points first, exact first, tight orbs first
    return filtered.sort((a, b) => {
      // Exact always first
      if (a.isExact && !b.isExact) return -1;
      if (!a.isExact && b.isExact) return 1;
      
      // Transit planet priority (outer planets first)
      const transitDiff = (TRANSIT_PRIORITY[b.transitPlanet] || 15) - (TRANSIT_PRIORITY[a.transitPlanet] || 15);
      if (transitDiff !== 0) return transitDiff;
      
      // Natal planet priority (personal points first)
      const natalDiff = (NATAL_PRIORITY[b.natalPlanet] || 10) - (NATAL_PRIORITY[a.natalPlanet] || 10);
      if (natalDiff !== 0) return natalDiff;
      
      // Finally by orb (tighter first)
      return parseFloat(a.orb) - parseFloat(b.orb);
    }).slice(0, 8); // Show more since they're better prioritized now
  }, [transitAspects]);

  // Get where Moon currently falls in their houses (using actual house cusps)
  const moonHouse = useMemo(() => {
    const house = getTransitPlanetHouse(moonSign, moonDegree, chart);
    // Debug logging
    console.log('[TransitPanel] Moon house calculation:', {
      moonSign,
      moonDegree,
      calculatedHouse: house,
      hasHouseCusps: !!chart.houseCusps,
      chartName: chart.name
    });
    return house;
  }, [moonSign, moonDegree, chart]);
  const moonHouseInterpretation = getMoonInHouseInterpretation(moonHouse);

  // Generate personalized AI reading
  const generatePersonalizedReading = async () => {
    setIsLoadingAI(true);
    try {
      // Build natal chart context WITH calculated house positions (not inferred from sign!)
      const natalPlanetsWithHouses = Object.entries(chart.planets)
        .filter(([_, data]) => data?.sign && data?.degree !== undefined)
        .map(([name, data]) => {
          const house = getNatalPlanetHouse(name, chart);
          const houseLabel = house ? ` [HOUSE ${house}]` : '';
          const deg = data!.degree ?? 0;
          const min = data!.minutes ?? 0;
          return `${name}: ${deg}°${min > 0 ? min.toString().padStart(2, '0') + "'" : ''} ${data!.sign}${houseLabel}`;
        })
        .join('\n');

      // Build house cusps with EXACT degrees for reference
      const natalHouseCusps = chart.houseCusps ? Object.entries(chart.houseCusps)
        .filter(([key]) => key.startsWith('house'))
        .sort((a, b) => {
          const numA = parseInt(a[0].replace('house', ''));
          const numB = parseInt(b[0].replace('house', ''));
          return numA - numB;
        })
        .map(([key, data]) => {
          const houseNum = key.replace('house', '');
          return `House ${houseNum} cusp: ${data.degree}°${data.minutes ? data.minutes.toString().padStart(2, '0') + "'" : ''} ${data.sign}`;
        })
        .join('\n') : '';

      // Detect intercepted signs and double-signed houses
      const interceptedSigns = chart.interceptedSigns || [];
      
      // Calculate double-signed houses (same sign on two consecutive house cusps)
      const doubleSignedHouses: string[] = [];
      if (chart.houseCusps) {
        const houseKeys = ['house1', 'house2', 'house3', 'house4', 'house5', 'house6', 
                          'house7', 'house8', 'house9', 'house10', 'house11', 'house12'] as const;
        const signs = houseKeys.map(k => chart.houseCusps?.[k]?.sign).filter(Boolean);
        
        // Check for repeated signs (indicating a sign rules two houses)
        const signCounts: Record<string, number[]> = {};
        signs.forEach((sign, i) => {
          if (sign) {
            if (!signCounts[sign]) signCounts[sign] = [];
            signCounts[sign].push(i + 1);
          }
        });
        
        Object.entries(signCounts).forEach(([sign, houses]) => {
          if (houses.length >= 2) {
            doubleSignedHouses.push(`${sign} rules houses ${houses.join(' and ')}`);
          }
        });
      }

      const interceptedInfo = interceptedSigns.length > 0 
        ? `INTERCEPTED SIGNS: ${interceptedSigns.join(', ')}
   - These signs are "trapped" within houses and their energy is harder to access
   - Planets in intercepted signs may feel blocked or require extra effort to express
   - Transits to intercepted areas can feel more intense when they finally activate`
        : 'INTERCEPTED SIGNS: NONE (this chart has no intercepted signs - do NOT mention interceptions)';

      const doubleSignedInfo = doubleSignedHouses.length > 0
        ? `DOUBLE-SIGNED HOUSES: ${doubleSignedHouses.join('; ')}
   - These signs have extra emphasis and influence in the chart
   - The themes of these signs are expressed across multiple life areas`
        : '';

      const moonAspectsList = majorMoonAspects.map(a => {
        const natalHouse = getNatalPlanetHouse(a.natalPlanet, chart);
        const houseLabel = natalHouse ? ` in H${natalHouse}` : '';
        return `Moon ${a.aspect} natal ${a.natalPlanet}${houseLabel} (${a.orb}° orb)`;
      }).join(', ');

      const transitList = significantTransits.map(a => {
        const natalHouse = getNatalPlanetHouse(a.natalPlanet, chart);
        const houseLabel = natalHouse ? ` in H${natalHouse}` : '';
        return `Transit ${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet}${houseLabel}`;
      }).join(', ');

      // Check if Moon is transiting an intercepted sign in their chart
      const moonInIntercepted = interceptedSigns.includes(moonSign);

      const customPrompt = `Generate a personalized transit reading for ${chart.name}.

CRITICAL STYLE RULES:
- NO greetings, pleasantries, or flowery openings (NO "Hello", "What a lovely...", "Dear one")
- NO mystical clichés ("the universe wants", "cosmic currents", "celestial dance")
- Start IMMEDIATELY with the astrological substance
- Write like a professional astrologer giving a consultation, not a greeting card
- Be direct, specific, and psychologically insightful

THEIR NATAL CHART (with CALCULATED house positions - use these, do NOT infer from sign):
${natalPlanetsWithHouses}

HOUSE CUSPS (for reference - these determine house placement):
${natalHouseCusps}

${interceptedInfo}

${doubleSignedInfo}

TODAY'S PERSONAL TRANSITS:
**MOON HOUSE PLACEMENT (CALCULATED FROM THEIR EXACT HOUSE CUSPS - DO NOT OVERRIDE):**
- Moon at ${moonDegree.toFixed(1)}° ${moonSign} is in their ${moonHouse}${moonHouse === 1 ? 'ST' : moonHouse === 2 ? 'ND' : moonHouse === 3 ? 'RD' : 'TH'} HOUSE
- Their ${moonHouse}${moonHouse === 1 ? 'st' : moonHouse === 2 ? 'nd' : moonHouse === 3 ? 'rd' : 'th'} house cusp is at ${chart.houseCusps?.house1?.degree || 0}° ${chart.houseCusps?.house1?.sign || ''} (House 1), so ${moonDegree.toFixed(0)}° ${moonSign} falls in house ${moonHouse}
${moonInIntercepted ? '- THIS IS AN INTERCEPTED SIGN IN THEIR CHART - pay special attention!' : ''}

- Moon aspects to natal planets: ${moonAspectsList || 'none major'}
- Other active transits: ${transitList || 'none significant'}

Write a reading that:
1. Opens with the most significant transit happening RIGHT NOW - no preamble
2. References SPECIFIC placements (e.g., "Your natal Venus at 14° Scorpio in the 8th...")
3. **CRITICAL**: When mentioning the Moon's house, you MUST say "${moonHouse}${moonHouse === 1 ? 'st' : moonHouse === 2 ? 'nd' : moonHouse === 3 ? 'rd' : 'th'} house" - this is calculated from their exact house cusps. Do NOT say a different house number.
${interceptedSigns.length > 0 ? `4. If the Moon is transiting an intercepted sign, explain the unlocking/activation
5. If any natal planets are in intercepted signs, note how transits there feel more significant` : `4. DO NOT mention "intercepted" signs - this chart has NO interceptions
5. DO NOT invent or hallucinate interceptions - stick to the data provided`}
6. Interprets aspects with psychological depth - what does it FEEL like internally?
7. Gives ONE concrete, practical action or focus for the day
8. End with the takeaway, not a blessing

CRITICAL ANTI-HALLUCINATION RULES:
- **HOUSE PLACEMENTS ARE PRE-CALCULATED** - Each natal planet above has [HOUSE X] next to it. USE THESE EXACT HOUSE NUMBERS.
- DO NOT infer house from sign! Example: Moon in Libra does NOT mean 1st house. Check the [HOUSE X] tag.
- The transiting Moon is in the ${moonHouse}${moonHouse === 1 ? 'ST' : moonHouse === 2 ? 'ND' : moonHouse === 3 ? 'RD' : 'TH'} house. If you say ANY other house number for the Moon, you are hallucinating.
- Only reference interceptions if INTERCEPTED SIGNS data above is non-empty. If empty, do NOT mention interceptions.
- Use ONLY the data provided. Do not infer, assume, or calculate house placements yourself.

Format with ## headers. Be chart-specific - no generic advice that could apply to anyone.`;

      const { data, error } = await supabase.functions.invoke('cosmic-weather', {
        body: {
          date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          moonPhase: 'current',
          moonSign,
          planetPositions: computedPlanetPositions,
          customPrompt,
        }
      });

      if (error) {
        console.error('Personalized reading error:', error);
        toast.error('Could not generate personalized reading');
        return;
      }

      setAiReading(data.insight);
    } catch (err) {
      console.error('Failed to generate personalized reading:', err);
      toast.error('Failed to connect to cosmic wisdom');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Simple markdown to HTML conversion
  const formatReading = (text: string) => {
    return text
      .replace(/## (.*)/g, '<h3 class="text-lg font-semibold mt-4 mb-2 text-primary">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/- (.*)/g, '<li class="ml-4">$1</li>')
      .replace(/\n/g, '<br/>');
  };

  const renderBodyDescription = (bodyName: string) => {
    const body = BODY_DESCRIPTIONS[bodyName];
    if (!body) return null;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3 w-3 text-muted-foreground cursor-help inline-block ml-1" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-medium">{body.symbol} {body.name}</p>
            <p className="text-xs text-muted-foreground">{body.meaning}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const renderAspectDescription = (aspectName: string) => {
    const aspect = ASPECT_DESCRIPTIONS[aspectName];
    if (!aspect) return null;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help underline decoration-dotted">{aspect.symbol}</span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-medium">{aspect.symbol} {aspect.name}</p>
            <p className="text-xs text-muted-foreground">{aspect.meaning}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="border-b border-primary/10">
        <CardTitle className="font-serif text-xl font-light flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary" />
          Personalized for {chart.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          How today's cosmic energy affects your natal chart
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* AI Personalized Reading Button */}
        <div className="space-y-4">
          <Button 
            onClick={generatePersonalizedReading}
            disabled={isLoadingAI}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {isLoadingAI ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Consulting the stars for {chart.name}...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Get AI Personalized Reading
              </>
            )}
          </Button>

          {/* AI Reading Display */}
          {aiReading && (
            <div className="p-4 rounded-lg bg-background/50 border border-primary/20">
              <div 
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: formatReading(aiReading) }}
              />
            </div>
          )}
        </div>

        {/* Moon in House */}
        {moonHouse && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10">
                ☽ Moon in Your {moonHouse}
                {moonHouse === 1 ? 'st' : moonHouse === 2 ? 'nd' : moonHouse === 3 ? 'rd' : 'th'} House
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {moonHouseInterpretation}
            </p>
            <p className="text-xs text-muted-foreground italic">
              {moonSign} is in your {moonHouse}
              {moonHouse === 1 ? 'st' : moonHouse === 2 ? 'nd' : moonHouse === 3 ? 'rd' : 'th'} house
              {(chart.houseCusps?.house1?.sign || chart.planets.Ascendant?.sign) && ` (you have ${chart.houseCusps?.house1?.sign || chart.planets.Ascendant?.sign} rising)`}
            </p>
          </div>
        )}

        {/* Major Moon Aspects to Natal Planets */}
        {majorMoonAspects.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              Moon Touching Your Major Planets
            </h4>
            <div className="space-y-3">
              {majorMoonAspects.map((aspect, i) => (
                <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-lg">☽</span>
                    <span style={{ color: aspect.color }} className="font-medium">
                      {renderAspectDescription(aspect.aspect)}
                    </span>
                    <span className="text-sm">
                      {aspect.natalPlanet}
                      {renderBodyDescription(aspect.natalPlanet)}
                    </span>
                    <Badge variant={aspect.isExact ? "default" : "outline"} className="text-xs">
                      {aspect.isExact ? 'EXACT!' : `${aspect.orb}° orb`}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getMoonToNatalInterpretation(aspect.natalPlanet, aspect.aspect, moonSign)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Minor Body Moon Aspects (Collapsible) */}
        {minorMoonAspects.length > 0 && (
          <Collapsible open={showMinorBodies} onOpenChange={setShowMinorBodies}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                <span className="text-sm font-medium flex items-center gap-2">
                  🌟 Moon Aspects to Asteroids & Minor Bodies ({minorMoonAspects.length})
                </span>
                {showMinorBodies ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-2">
              <p className="text-xs text-muted-foreground italic px-3">
                Hover over body names and aspect symbols to learn what they mean
              </p>
              {minorMoonAspects.map((aspect, i) => (
                <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-lg">☽</span>
                    <span style={{ color: aspect.color }} className="font-medium">
                      {renderAspectDescription(aspect.aspect)}
                    </span>
                    <span className="text-sm">
                      {BODY_DESCRIPTIONS[aspect.natalPlanet]?.name || aspect.natalPlanet}
                      {renderBodyDescription(aspect.natalPlanet)}
                    </span>
                    <Badge variant={aspect.isExact ? "default" : "outline"} className="text-xs">
                      {aspect.isExact ? 'EXACT!' : `${aspect.orb}° orb`}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getMoonToNatalInterpretation(aspect.natalPlanet, aspect.aspect, moonSign)}
                  </p>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Other Significant Transits */}
        {significantTransits.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Active Transits Today
            </h4>
            <div className="space-y-2">
              {significantTransits.map((aspect, i) => (
                <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-sm">
                      {getTransitPlanetSymbol(aspect.transitPlanet)} {aspect.transitPlanet}
                      {renderBodyDescription(aspect.transitPlanet)}
                    </span>
                    <span style={{ color: aspect.color }}>
                      {renderAspectDescription(aspect.aspect)}
                    </span>
                    <span className="text-sm">
                      your {aspect.natalPlanet}
                      {renderBodyDescription(aspect.natalPlanet)}
                    </span>
                    <Badge 
                      variant={aspect.isExact ? "destructive" : "outline"} 
                      className="text-xs"
                    >
                      {aspect.isExact ? 'EXACT!' : `${aspect.orb}°`}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {aspect.detailedInterpretation?.header || aspect.interpretation}
                  </p>
                  {aspect.transitHouse && (() => {
                    const houseInterp = getTransitInHouseInterpretation(aspect.transitPlanet, aspect.transitHouse);
                    const suffix = aspect.transitHouse === 1 ? 'st' : aspect.transitHouse === 2 ? 'nd' : aspect.transitHouse === 3 ? 'rd' : 'th';
                    return (
                      <div className="mt-2 pt-2 border-t border-border/30">
                        <p className="text-xs font-medium text-foreground/80">
                          Transit {aspect.transitPlanet} is in your {aspect.transitHouse}{suffix} house:
                        </p>
                        {houseInterp ? (
                          <>
                            <p className="text-xs text-muted-foreground mt-1">
                              {houseInterp.meaning}
                            </p>
                            <p className="text-xs text-muted-foreground/80 italic mt-1">
                              How it feels: {houseInterp.feeling}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground italic mt-1">
                            This transit activates themes of your {aspect.transitHouse}{suffix} house.
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No aspects message */}
        {majorMoonAspects.length === 0 && significantTransits.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <p>No major aspects to your natal planets right now.</p>
            <p className="text-sm">The cosmic energy is more general today.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

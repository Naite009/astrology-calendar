/**
 * Five Essential Questions - Relationship Analysis Framework
 * 
 * The primary educational structure for synastry analysis:
 * 1. What are the relationship dynamics? (Aspects with light/shadow)
 * 2. Why did you meet? (Soul purpose/karmic)
 * 3. What are you building together? (Composite)
 * 4. How long will this last? (Timeline)
 * 5. What are you here to learn? (Lessons)
 */

import { useState, useMemo } from 'react';
import { NatalChart } from '@/hooks/useNatalChart';
import { AdvancedSynastryReport, KarmicIndicator as SynastryKarmicIndicator } from '@/lib/synastryAdvanced';
import { KarmicAnalysis } from '@/lib/karmicAnalysis';
import { CompositeInterpretation, getPlanetSymbol } from '@/lib/compositeChart';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeBreakdownGuide } from '@/components/ThemeBreakdownGuide';
import { 
  ChevronDown, ChevronUp, Sun, Moon, Heart, Sparkles, Users, 
  Clock, GraduationCap, BookOpen, Lightbulb, AlertTriangle, 
  CheckCircle2, Target, Infinity, Compass, Shield
} from 'lucide-react';

interface FiveEssentialQuestionsProps {
  chart1: NatalChart;
  chart2: NatalChart;
  report: AdvancedSynastryReport;
  karmicAnalysis: KarmicAnalysis | null;
  compositeInterpretation: CompositeInterpretation | null;
}

// Planet symbols for display
const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  NorthNode: '☊', SouthNode: '☋', Chiron: '⚷', Ascendant: 'AC', MC: 'MC'
};

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌', opposition: '☍', trine: '△', square: '□', sextile: '⚹'
};

// Karmic type base info (descriptions only - indicators are generated dynamically)
const KARMIC_TYPE_BASE: Record<string, { label: string; duration: string; description: string }> = {
  soul_family: {
    label: 'Soul Family Connection',
    duration: 'Potentially Lifetime',
    description: 'Soul Family connections are supportive relationships without a specific karmic "completion" point. They grow and evolve naturally based on mutual choice, not karmic obligation.'
  },
  twin_flame: {
    label: 'Twin Flame Connection',
    duration: 'Cyclical - May reunite multiple times',
    description: 'Twin Flame connections are intensely transformative. They often involve periods of separation and reunion as both souls integrate lessons.'
  },
  catalyst: {
    label: 'Catalyst Connection',
    duration: 'Usually Short to Medium Term',
    description: 'Catalyst connections arrive to shake things up and accelerate growth. They are intense but typically not meant to last forever.'
  },
  completion: {
    label: 'Karmic Completion',
    duration: 'Until karma is resolved',
    description: 'Completion karma means unfinished business from past lives. This relationship is here to resolve old patterns and debts.'
  },
  new_contract: {
    label: 'New Soul Contract',
    duration: 'Variable - Based on soul agreement',
    description: 'A New Contract means you\'re creating something fresh together, not repeating old patterns. This is forward-focused soul work.'
  },
  karmic_lesson: {
    label: 'Karmic Lesson Connection',
    duration: '1-5 years typically',
    description: 'This connection is teaching you specific karmic lessons. Once integrated, the relationship may naturally transform or complete.'
  }
};

/**
 * Generate chart-specific thriving indicators based on actual karmic analysis
 */
function generateChartSpecificThrivingIndicators(
  karmicAnalysis: KarmicAnalysis | null,
  chart1Name: string,
  chart2Name: string
): string[] {
  if (!karmicAnalysis || karmicAnalysis.indicators.length === 0) {
    return ['The relationship continues to feel supportive', 'Both feel free to grow'];
  }
  
  const indicators: string[] = [];
  const { indicators: karmicIndicators, karmicType } = karmicAnalysis;
  
  // Find the most significant indicators by type/theme
  const northNodeIndicators = karmicIndicators.filter(i => i.type === 'north_node');
  const plutoIndicators = karmicIndicators.filter(i => i.type === 'pluto');
  const saturnIndicators = karmicIndicators.filter(i => i.type === 'saturn');
  const chironIndicators = karmicIndicators.filter(i => i.type === 'chiron');
  const southNodeIndicators = karmicIndicators.filter(i => i.type === 'south_node');
  
  // Generate specific indicators based on what's in the chart
  if (northNodeIndicators.length > 0) {
    const topNorth = northNodeIndicators[0];
    const planet = topNorth.planet2 || topNorth.planet1;
    indicators.push(`${chart1Name} continues helping ${chart2Name} grow into their destiny (${planet} evolution)`);
  }
  
  if (plutoIndicators.length > 0) {
    const topPluto = plutoIndicators[0];
    indicators.push(`The ${topPluto.aspect || 'Pluto'} intensity is transforming both of you consciously, not destructively`);
  }
  
  if (saturnIndicators.length > 0) {
    indicators.push(`The Saturn lessons feel like growth rather than restriction`);
  }
  
  if (chironIndicators.length > 0) {
    const topChiron = chironIndicators[0];
    indicators.push(`${chart2Name}'s old wounds (${topChiron.planet2}) are healing rather than being triggered`);
  }
  
  // Add type-specific thriving indicators
  switch (karmicType) {
    case 'twin_flame':
      indicators.push(`Mirror-like recognition: you see yourself clearly through ${chart2Name}`);
      if (plutoIndicators.length > 0) {
        indicators.push(`Power struggles are becoming conscious co-creation`);
      }
      break;
    case 'soul_family':
      indicators.push(`Both ${chart1Name} and ${chart2Name} feel free to grow as individuals`);
      if (northNodeIndicators.length > 0) {
        indicators.push(`${chart2Name}'s North Node journey is supported, not controlled`);
      }
      break;
    case 'catalyst':
      indicators.push(`Rapid transformation is exciting, not destabilizing`);
      if (saturnIndicators.length > 0) {
        indicators.push(`Saturn's structure helps ground the catalytic energy`);
      }
      break;
    case 'completion':
      indicators.push(`Old patterns are being resolved, not repeated`);
      if (southNodeIndicators.length > 0) {
        indicators.push(`Past life karma is clearing - you feel "lighter" together`);
      }
      break;
  }
  
  // Ensure we have at least 3 indicators
  while (indicators.length < 3) {
    indicators.push('The connection continues to evolve naturally');
  }
  
  return indicators.slice(0, 5);
}

/**
 * Generate chart-specific completion indicators based on actual karmic analysis
 */
function generateChartSpecificCompletionIndicators(
  karmicAnalysis: KarmicAnalysis | null,
  chart1Name: string,
  chart2Name: string
): string[] {
  if (!karmicAnalysis || karmicAnalysis.indicators.length === 0) {
    return ['The lessons feel complete', 'Natural gratitude for what was shared'];
  }
  
  const indicators: string[] = [];
  const { indicators: karmicIndicators, karmicType } = karmicAnalysis;
  
  // Find the most significant indicators by type
  const northNodeIndicators = karmicIndicators.filter(i => i.type === 'north_node');
  const plutoIndicators = karmicIndicators.filter(i => i.type === 'pluto');
  const saturnIndicators = karmicIndicators.filter(i => i.type === 'saturn');
  const chironIndicators = karmicIndicators.filter(i => i.type === 'chiron');
  const southNodeIndicators = karmicIndicators.filter(i => i.type === 'south_node');
  
  // Generate specific completion indicators based on actual chart contacts
  if (northNodeIndicators.length > 0) {
    const topNorth = northNodeIndicators[0];
    const planet = topNorth.planet2 || topNorth.planet1;
    indicators.push(`${chart2Name} has integrated the ${planet} lessons ${chart1Name} brought`);
    indicators.push(`${chart2Name}'s North Node growth no longer requires ${chart1Name}'s presence to progress`);
  }
  
  if (plutoIndicators.length > 0) {
    const topPluto = plutoIndicators[0];
    indicators.push(`The ${topPluto.planet1}-${topPluto.planet2} intensity has transformed both - you're both different people now`);
  }
  
  if (saturnIndicators.length > 0) {
    indicators.push(`The Saturn tests are passed - you've earned what this relationship taught`);
  }
  
  if (chironIndicators.length > 0) {
    const topChiron = chironIndicators[0];
    indicators.push(`${chart2Name}'s ${topChiron.planet2} wound is healed - the medicine has been delivered`);
  }
  
  if (southNodeIndicators.length > 0) {
    indicators.push(`Past life patterns are cleared - you feel "complete" rather than "stuck"`);
  }
  
  // Add type-specific completion indicators
  switch (karmicType) {
    case 'twin_flame':
      indicators.push(`You can love ${chart2Name} from a distance without longing`);
      indicators.push(`The mirror has done its work - you see yourself clearly now`);
      break;
    case 'soul_family':
      indicators.push(`Gratitude for what ${chart1Name} and ${chart2Name} shared`);
      indicators.push(`Natural drift without drama - you wish each other well`);
      break;
    case 'catalyst':
      indicators.push(`The "shake-up" energy has integrated - life is different now`);
      indicators.push(`You appreciate what ${chart2Name} catalyzed without needing more`);
      break;
    case 'completion':
      indicators.push(`The karmic debt between ${chart1Name} and ${chart2Name} feels repaid`);
      indicators.push(`Freedom from obligation - you stay by choice, not karma`);
      break;
  }
  
  // Ensure we have at least 3 indicators
  while (indicators.length < 3) {
    indicators.push('Natural sense of completion without trauma');
  }
  
  return indicators.slice(0, 5);
}

// Legacy fallback (kept for compatibility)
const KARMIC_TYPE_INFO: Record<string, { label: string; duration: string; description: string; thrivingIndicators: string[]; completionIndicators: string[] }> = {
  soul_family: {
    ...KARMIC_TYPE_BASE.soul_family,
    thrivingIndicators: ['Connection feels nourishing', 'Freedom to grow individually'],
    completionIndicators: ['Growth feels complete', 'Natural gratitude']
  },
  twin_flame: {
    ...KARMIC_TYPE_BASE.twin_flame,
    thrivingIndicators: ['Intense growth', 'Mirror recognition'],
    completionIndicators: ['Integration complete', 'Peace with cycles']
  },
  catalyst: {
    ...KARMIC_TYPE_BASE.catalyst,
    thrivingIndicators: ['Rapid transformation', 'Feeling alive'],
    completionIndicators: ['Changes integrated', 'Less urgency']
  },
  completion: {
    ...KARMIC_TYPE_BASE.completion,
    thrivingIndicators: ['Working through patterns', 'Deep forgiveness'],
    completionIndicators: ['Debt feels repaid', 'Closure achieved']
  },
  new_contract: {
    ...KARMIC_TYPE_BASE.new_contract,
    thrivingIndicators: [
      'Building something new together',
      'Collaborative creation energy',
      'Mutual support for individual growth',
      'Sense of shared mission or purpose'
    ],
    completionIndicators: [
      'The project/mission is complete',
      'Natural evolution apart',
      'What you came to create exists',
      'New paths calling each separately'
    ]
  },
  karmic_lesson: {
    label: 'Karmic Lesson',
    duration: 'Until the lesson is learned',
    description: 'This connection is primarily a teaching relationship - you\'re here to learn specific lessons from each other.',
    thrivingIndicators: [
      'Active learning and growth',
      'Willingness to be uncomfortable',
      'Seeing patterns clearly',
      'Integrating the teachings'
    ],
    completionIndicators: [
      'The lesson is internalized',
      'Patterns no longer repeat',
      'Gratitude for the teaching',
      'Ready to apply elsewhere'
    ]
  }
};

/**
 * Generate light and shadow expressions for an aspect
 */
function generateAspectExpressions(
  planet1: string,
  planet2: string,
  aspect: string,
  personAName: string,
  personBName: string
): {
  energy: string;
  lightExpressions: string[];
  shadowExpressions: string[];
  personAAdvice: string;
  personBAdvice: string;
  growthEdge: string;
} {
  // Default structure
  const defaultResult = {
    energy: `This creates a ${aspect === 'trine' || aspect === 'sextile' ? 'harmonious' : 'dynamic'} connection between your ${planet1} and ${planet2} energies.`,
    lightExpressions: [
      `${personAName} and ${personBName} can work together constructively`,
      'Mutual respect for each other\'s expression',
      'Growth through understanding different approaches'
    ],
    shadowExpressions: [
      'Tension when needs aren\'t communicated',
      'Misunderstandings about intentions',
      'Taking each other\'s expression personally'
    ],
    personAAdvice: `Be mindful of how your ${planet1} energy impacts ${personBName}.`,
    personBAdvice: `Communicate your ${planet2} needs clearly to ${personAName}.`,
    growthEdge: 'Learning to honor both expressions while finding middle ground.'
  };

  // Specific aspect interpretations
  const aspectKey = `${planet1}-${planet2}-${aspect}`;
  const reverseKey = `${planet2}-${planet1}-${aspect}`;

  const aspectLibrary: Record<string, typeof defaultResult> = {
    'Pluto-Moon-square': {
      energy: 'This creates intense emotional depth and transformation potential between you.',
      lightExpressions: [
        `${personAName} helps ${personBName} access deep emotional truth and healing`,
        `${personAName} empowers ${personBName} to transform old emotional patterns`,
        'Profound emotional intimacy and trust',
        `${personBName} feels seen at a soul level by ${personAName}`
      ],
      shadowExpressions: [
        `${personAName} may unconsciously trigger intense emotional reactions in ${personBName}`,
        `${personBName} might feel their emotions are "too much" or controlled`,
        'Power struggles around emotional expression',
        `${personAName} trying to "fix" rather than witness ${personBName}'s feelings`
      ],
      personAAdvice: `Your intensity is a gift when you empower rather than manage their emotions. Notice if you're trying to change how ${personBName} feels.`,
      personBAdvice: `Your emotional depth is safe to express. Speak up if you feel overwhelmed or controlled.`,
      growthEdge: 'Deep emotional transformation happens when both people stay conscious of the power dynamic.'
    },
    'Pluto-Venus-opposition': {
      energy: 'Magnetic attraction with transformative potential in love and values.',
      lightExpressions: [
        'Powerful, transformative love connection',
        `${personAName} helps ${personBName} discover deeper capacity for love`,
        'Intense passion and chemistry',
        'Profound values transformation through the relationship'
      ],
      shadowExpressions: [
        'Obsessive attraction or possessiveness',
        'Jealousy or control around love/affection',
        'Power games in romance',
        'Difficulty with autonomy in the relationship'
      ],
      personAAdvice: `Your magnetic pull is powerful - use it to empower ${personBName}'s heart, not possess it.`,
      personBAdvice: `The intensity is real, but you can set boundaries while staying open to transformation.`,
      growthEdge: 'Learning that deep love and personal freedom can coexist.'
    },
    'Pluto-Sun-square': {
      energy: 'Power dynamics around identity and ego transformation.',
      lightExpressions: [
        `${personAName} catalyzes profound identity evolution in ${personBName}`,
        `${personBName} becomes more authentically themselves`,
        'Deep mutual respect for each other\'s power',
        'Transformative impact on self-confidence'
      ],
      shadowExpressions: [
        'Power struggles over who leads',
        `${personBName} may feel dominated or eclipsed`,
        'Competition rather than collaboration',
        'Control battles that undermine both'
      ],
      personAAdvice: `Your transformative power works best when you support ${personBName}'s light, not overshadow it.`,
      personBAdvice: `Stand in your authentic power. Don't shrink yourself.`,
      growthEdge: 'Both can be powerful without diminishing the other.'
    },
    'Pluto-Sun-conjunction': {
      energy: 'Intense identity transformation through merging energies.',
      lightExpressions: [
        `${personAName}'s transformative power fuses with ${personBName}'s core identity`,
        'Profound capacity for mutual empowerment',
        'Deep understanding of each other\'s shadows and light',
        'Potential for soul-level recognition'
      ],
      shadowExpressions: [
        'Risk of identity fusion or enmeshment',
        `${personBName} may feel consumed by ${personAName}'s intensity`,
        'Obsessive focus on each other',
        'Difficulty separating individual identities'
      ],
      personAAdvice: 'Your intensity is felt deeply. Use it to witness and empower, not consume.',
      personBAdvice: 'You can be transformed by this connection while keeping your own light.',
      growthEdge: 'Profound transformation through conscious power-sharing.'
    },
    'Pluto-Mars-square': {
      energy: 'Intense power dynamics around action, desire, and will.',
      lightExpressions: [
        'Powerful motivation to achieve together',
        'Sexual chemistry that transforms both',
        'Courage to face difficult truths together',
        'Mutual empowerment to take bold action'
      ],
      shadowExpressions: [
        'Power struggles over who controls what',
        'Explosive anger or arguments',
        'Compulsive or obsessive pursuit',
        'Physical tension or aggression'
      ],
      personAAdvice: 'Channel intensity into shared goals rather than competition.',
      personBAdvice: 'Assert your will without escalating into power battles.',
      growthEdge: 'Learning to wield power together, not against each other.'
    },
    // Neptune aspects
    'Neptune-Venus-conjunction': {
      energy: 'Romantic idealization with spiritual love potential.',
      lightExpressions: [
        'Soul-mate feeling and spiritual connection',
        'Unconditional love and compassion',
        'Artistic and creative inspiration together',
        'Deep empathy and emotional attunement'
      ],
      shadowExpressions: [
        'Idealization that leads to disappointment',
        'Difficulty seeing each other clearly',
        'Sacrificing too much for love',
        'Confusion about relationship boundaries'
      ],
      personAAdvice: 'Your love is real, but keep one foot grounded in reality.',
      personBAdvice: 'Enjoy the magic, but communicate your real needs.',
      growthEdge: 'Balancing spiritual love with practical partnership.'
    },
    'Neptune-Venus-square': {
      energy: 'Romantic confusion with a call for unconditional love.',
      lightExpressions: [
        'Learning to love without conditions',
        'Spiritual growth through relationship challenges',
        'Compassion deepened through difficulty',
        'Creative inspiration from longing'
      ],
      shadowExpressions: [
        'Deception or self-deception about love',
        'Unrealistic expectations leading to disappointment',
        `${personBName} may feel ${personAName} is unavailable or confusing`,
        'Escapism or avoidance in the relationship'
      ],
      personAAdvice: 'Be honest about what you can offer. Clarity is kindness.',
      personBAdvice: 'Trust your feelings, but verify with direct communication.',
      growthEdge: 'Developing discernment while keeping the heart open.'
    },
    'Neptune-Moon-square': {
      energy: 'Emotional confusion with psychic sensitivity.',
      lightExpressions: [
        'Deep psychic and emotional connection',
        'Intuitive understanding of each other\'s moods',
        'Compassion for emotional vulnerabilities',
        'Spiritual bonding through shared feelings'
      ],
      shadowExpressions: [
        'Emotional boundaries may dissolve unhealthily',
        `${personBName} may absorb ${personAName}'s moods`,
        'Confusion about whose emotions are whose',
        'Emotional martyrdom or victimhood patterns'
      ],
      personAAdvice: 'Be clear about your emotional state so others don\'t get lost in your fog.',
      personBAdvice: 'Check in with yourself - are these your feelings or theirs?',
      growthEdge: 'Maintaining emotional boundaries while staying compassionately connected.'
    },
    // Uranus aspects
    'Uranus-Venus-conjunction': {
      energy: 'Electric attraction with freedom as a core value.',
      lightExpressions: [
        'Exciting, unconventional love connection',
        'Freedom to be authentic with each other',
        'Innovation and experimentation in love',
        'Mutual liberation from old relationship patterns'
      ],
      shadowExpressions: [
        'Instability or unpredictability in love',
        'Difficulty with commitment or consistency',
        'Sudden changes that destabilize the bond',
        'One or both may fear being "tied down"'
      ],
      personAAdvice: 'Your need for freedom is valid - communicate it as a need, not a rejection.',
      personBAdvice: 'Excitement is part of the package. Build security through trust, not control.',
      growthEdge: 'Creating a relationship that honors both connection and autonomy.'
    },
    'Uranus-Moon-square': {
      energy: 'Emotional volatility with a need for authentic feeling.',
      lightExpressions: [
        'Emotional breakthroughs and awakenings',
        'Freedom to feel authentically without judgment',
        'Innovation in nurturing and home life',
        'Breaking free from family patterns'
      ],
      shadowExpressions: [
        'Emotional instability or unpredictability',
        `${personBName} may feel unsettled by ${personAName}'s detachment`,
        'Difficulty creating consistent emotional security',
        'Sudden mood shifts that confuse the partner'
      ],
      personAAdvice: 'Your emotional authenticity is a gift, but consistency builds trust.',
      personBAdvice: 'Accept that their emotions run on an unusual frequency. Find your own stability.',
      growthEdge: 'Creating emotional freedom within secure connection.'
    },
    'Uranus-Sun-opposition': {
      energy: 'Push-pull between individuality and partnership.',
      lightExpressions: [
        'Each person inspires the other to be more authentic',
        'Mutual respect for individual paths',
        'Electric attraction through difference',
        'Growth through honoring uniqueness'
      ],
      shadowExpressions: [
        'Sudden disruptions to identity or life direction',
        'Rebellion against the partner\'s expectations',
        'Unpredictable behavior that creates insecurity',
        'Difficulty finding middle ground'
      ],
      personAAdvice: 'Your uniqueness enriches the relationship - share it, don\'t weaponize it.',
      personBAdvice: 'Let them be different. Your security comes from within, not from controlling them.',
      growthEdge: 'Celebrating individuality while choosing partnership.'
    },
    'Saturn-Moon-conjunction': {
      energy: 'Emotional structure and security through commitment.',
      lightExpressions: [
        `${personAName} provides emotional stability for ${personBName}`,
        'Mature, lasting emotional bond',
        'Security through consistent support',
        'Building emotional trust over time'
      ],
      shadowExpressions: [
        `${personBName} may feel emotionally restricted or judged`,
        `${personAName} might seem cold or critical`,
        'Fear of emotional vulnerability',
        'Parental dynamics instead of partnership'
      ],
      personAAdvice: `Your stability is valuable, but make sure it feels supportive, not restrictive.`,
      personBAdvice: `Communicate when you need warmth. ${personAName}'s structure isn't rejection.`,
      growthEdge: 'Creating security that allows emotional freedom.'
    },
    'Saturn-Venus-square': {
      energy: 'Testing love through commitment and responsibility.',
      lightExpressions: [
        'Love that grows stronger through challenges',
        'Commitment that deepens over time',
        'Learning what love really means',
        'Practical, grounded partnership'
      ],
      shadowExpressions: [
        'Feeling unloved or unappreciated',
        'Love expressed through duty rather than warmth',
        'Financial or practical tensions',
        'One partner feeling like a burden'
      ],
      personAAdvice: `Show love in warm ways, not just practical ones. ${personBName} needs affection.`,
      personBAdvice: `Recognize ${personAName}'s practical support as love. Ask for warmth directly.`,
      growthEdge: 'Learning that real love includes both support and sweetness.'
    },
    'Saturn-Sun-square': {
      energy: 'Authority dynamics and tests of self-worth.',
      lightExpressions: [
        'Growth through structure and discipline',
        'Maturity developing through challenges',
        'Respect earned through demonstrated reliability',
        'Building a solid foundation together'
      ],
      shadowExpressions: [
        `${personBName} may feel criticized or inadequate around ${personAName}`,
        'Authority or control issues between you',
        'Coldness or withholding of warmth',
        'Fear of not being "good enough"'
      ],
      personAAdvice: 'Your standards are valuable, but express them with warmth, not judgment.',
      personBAdvice: 'Their expectations feel heavy, but your worth isn\'t defined by meeting them.',
      growthEdge: 'Developing inner authority while respecting each other\'s autonomy.'
    },
    'Venus-Mars-conjunction': {
      energy: 'Powerful romantic and sexual chemistry.',
      lightExpressions: [
        'Magnetic attraction and desire',
        'Passion that keeps the relationship alive',
        'Balance of pursuing and receiving',
        'Playful, exciting romance'
      ],
      shadowExpressions: [
        'Desire overwhelming other needs',
        'One person always pursuing',
        'Passion that burns too hot',
        'Difficulty when chemistry fades'
      ],
      personAAdvice: `Your attraction is a gift. Make sure you also nurture the deeper connection.`,
      personBAdvice: `Enjoy the chemistry, but communicate your needs beyond the physical.`,
      growthEdge: 'Building a relationship that thrives when the initial heat becomes steady warmth.'
    },
    'Sun-Moon-conjunction': {
      energy: 'Deep, natural understanding between your core selves.',
      lightExpressions: [
        'Feeling "at home" with each other',
        'Natural understanding of each other\'s needs',
        'Complementary masculine and feminine energies',
        'Easy emotional and identity resonance'
      ],
      shadowExpressions: [
        'Taking each other for granted',
        'Losing individual identity in the merge',
        'Assuming you know what the other needs',
        'Enmeshment without healthy boundaries'
      ],
      personAAdvice: `Your connection is natural - don't forget to keep growing individually.`,
      personBAdvice: `The ease between you is a gift. Stay curious about each other.`,
      growthEdge: 'Maintaining individual identity within deep connection.'
    },
    'NorthNode-Sun-conjunction': {
      energy: 'Destiny connection - you illuminate each other\'s life path.',
      lightExpressions: [
        `${personAName} illuminates ${personBName}'s life purpose and destiny path`,
        `${personBName} helps ${personAName} step into their authentic self`,
        'Feeling destined to meet',
        'Mutual evolution through the connection'
      ],
      shadowExpressions: [
        'Pressure to fulfill a "purpose"',
        'Feeling like the relationship is obligatory',
        'Losing sight of present joy for future goals',
        'Teacher-student imbalance'
      ],
      personAAdvice: `You're a guide for ${personBName}'s evolution. Lead by example, not direction.`,
      personBAdvice: `Embrace the growth this connection offers while staying true to yourself.`,
      growthEdge: 'Destiny is a direction, not a demand. Enjoy the journey.'
    },
    'NorthNode-Venus-conjunction': {
      energy: 'This relationship teaches about love and values.',
      lightExpressions: [
        `${personAName} teaches ${personBName} about healthy love and values`,
        `${personBName} is learning what they truly value through this connection`,
        'The relationship itself is part of soul curriculum',
        'Love as a path to evolution'
      ],
      shadowExpressions: [
        'One person being the "love teacher"',
        'Losing yourself in what you think you should value',
        'Pressure to love a certain way',
        'Confusing soul lessons with relationship rules'
      ],
      personAAdvice: `Share your love freely without expecting ${personBName} to adopt your values.`,
      personBAdvice: `Learn from this love, but trust your own evolving values.`,
      growthEdge: 'Love as teacher, not dictator.'
    },
    'NorthNode-Mercury-conjunction': {
      energy: 'Communication and thinking evolution through connection.',
      lightExpressions: [
        `${personAName} helps ${personBName} find and communicate their authentic voice`,
        `${personBName} is learning new ways of thinking through ${personAName}`,
        'Mental/communication evolution is a key theme',
        'Conversations that change perspectives'
      ],
      shadowExpressions: [
        'One person dominating conversations',
        'Feeling stupid or inferior intellectually',
        'Communication styles that clash',
        'Over-intellectualizing the relationship'
      ],
      personAAdvice: `Share your ideas but create space for ${personBName}'s voice to emerge.`,
      personBAdvice: `Speak up. Your thoughts matter and are evolving.`,
      growthEdge: 'Finding your unique voice through dialogue.'
    },
    'NorthNode-Moon-conjunction': {
      energy: 'Emotional evolution through the relationship.',
      lightExpressions: [
        `${personBName} is learning about emotional security through ${personAName}`,
        'The relationship nurtures soul growth',
        'Emotional patterns are destined to evolve',
        'Home and belonging as growth themes'
      ],
      shadowExpressions: [
        'Emotional dependency on the relationship for growth',
        'Over-reliance on one person for nurturing',
        'Confusing need with destiny',
        'Difficulty moving forward independently'
      ],
      personAAdvice: 'Your nurturing helps their growth, but don\'t become their only source of comfort.',
      personBAdvice: 'Learn the emotional lessons, then practice them on your own too.',
      growthEdge: 'Growing into emotional maturity together while maintaining independence.'
    },
    'Chiron-Venus-conjunction': {
      energy: 'Healing old love wounds through this relationship.',
      lightExpressions: [
        'This relationship can heal old love patterns',
        'Deep compassion for each other\'s romantic wounds',
        'Learning to love despite past hurts',
        'Transforming relationship pain into wisdom'
      ],
      shadowExpressions: [
        'Old wounds may be triggered by the relationship',
        'Pain from past relationships may resurface',
        'Feeling inadequate in love',
        'Avoiding vulnerability to prevent hurt'
      ],
      personAAdvice: 'Your presence touches old wounds. Be gentle and patient.',
      personBAdvice: 'If old pain surfaces, it\'s for healing, not repeating.',
      growthEdge: 'Allowing love to heal rather than retraumatize.'
    },
    'Chiron-Moon-square': {
      energy: 'Emotional wounds surfacing for potential healing.',
      lightExpressions: [
        'Opportunity for deep emotional healing',
        'Understanding each other\'s emotional vulnerabilities',
        'Compassion developed through shared pain',
        'Breaking generational emotional patterns'
      ],
      shadowExpressions: [
        'Triggering each other\'s deepest insecurities',
        'Emotional reactions that seem "too much"',
        'Feeling unsafe emotionally',
        'Old family wounds playing out in the relationship'
      ],
      personAAdvice: 'Your presence triggers old wounds. Stay present with compassion, not defensiveness.',
      personBAdvice: 'If you\'re over-reacting, ask: "Is this about now, or about then?"',
      growthEdge: 'Conscious healing replaces unconscious re-wounding.'
    }
  };

  // Check for exact match or reverse
  if (aspectLibrary[aspectKey]) {
    return aspectLibrary[aspectKey];
  }
  if (aspectLibrary[reverseKey]) {
    const reversed = aspectLibrary[reverseKey];
    return {
      ...reversed,
      personAAdvice: reversed.personBAdvice,
      personBAdvice: reversed.personAAdvice
    };
  }

  // Generate reasonable defaults for other aspects
  if (aspect === 'trine' || aspect === 'sextile') {
    return {
      energy: `Harmonious flow between ${personAName}'s ${planet1} and ${personBName}'s ${planet2}.`,
      lightExpressions: [
        'Natural ease and support between these energies',
        `${personAName} and ${personBName} work well together here`,
        'Mutual understanding in this area',
        'Gifts that flow naturally'
      ],
      shadowExpressions: [
        'May take this harmony for granted',
        'Not utilizing the gift actively',
        'Laziness in developing the potential',
        'Assuming it will always be easy'
      ],
      personAAdvice: `Your ${planet1} naturally supports ${personBName}. Appreciate and cultivate this.`,
      personBAdvice: `Receive ${personAName}'s support gracefully. It's a genuine gift.`,
      growthEdge: 'Actively cultivating the natural gift rather than taking it for granted.'
    };
  }

  return defaultResult;
}

/**
 * Generate lessons for each person based on the synastry
 */
function generateLessons(
  chart1: NatalChart,
  chart2: NatalChart,
  report: AdvancedSynastryReport,
  karmicAnalysis: KarmicAnalysis | null
): {
  person1Lessons: string[];
  person2Lessons: string[];
  togetherLessons: string[];
} {
  const person1Lessons: string[] = [];
  const person2Lessons: string[] = [];
  const togetherLessons: string[] = [];

  // Extract lessons from karmic indicators
  if (karmicAnalysis) {
    karmicAnalysis.indicators.forEach(ind => {
      if (ind.planet1.includes(chart1.name) || ind.interpretation.includes(chart1.name)) {
        // Lesson involves person 1's planet
        const lesson = ind.interpretation;
        if (lesson && !person1Lessons.includes(lesson)) {
          person1Lessons.push(lesson.length > 100 ? lesson.substring(0, 100) + '...' : lesson);
        }
      }
      if (ind.planet2.includes(chart2.name) || ind.interpretation.includes(chart2.name)) {
        const lesson = ind.interpretation;
        if (lesson && !person2Lessons.includes(lesson)) {
          person2Lessons.push(lesson.length > 100 ? lesson.substring(0, 100) + '...' : lesson);
        }
      }
    });

    // Add key lessons from timeline
    if (karmicAnalysis.timeline.key_lessons) {
      karmicAnalysis.timeline.key_lessons.forEach(lesson => {
        if (!togetherLessons.includes(lesson)) {
          togetherLessons.push(lesson);
        }
      });
    }
  }

  // Add conflict triggers as growth opportunities
  report.conflictTriggers.forEach(trigger => {
    togetherLessons.push(`Working through ${trigger.name.toLowerCase()} patterns`);
  });

  // Add growth opportunities
  report.growthOpportunities.forEach(opp => {
    if (!togetherLessons.includes(opp)) {
      togetherLessons.push(opp);
    }
  });

  // Ensure we have at least some lessons
  if (person1Lessons.length === 0) {
    person1Lessons.push(`Balancing your energy with ${chart2.name}'s needs`);
    person1Lessons.push('Learning to express your truth while staying connected');
  }
  if (person2Lessons.length === 0) {
    person2Lessons.push(`Understanding ${chart1.name}'s way of showing up`);
    person2Lessons.push('Receiving support while maintaining your sovereignty');
  }
  if (togetherLessons.length === 0) {
    togetherLessons.push('Finding the balance between togetherness and individuality');
    togetherLessons.push('Transforming challenges into mutual growth');
  }

  return {
    person1Lessons: person1Lessons.slice(0, 5),
    person2Lessons: person2Lessons.slice(0, 5),
    togetherLessons: togetherLessons.slice(0, 5)
  };
}

// Section Header Component
const SectionHeader = ({ number, title, icon }: { number: number; title: string; icon: React.ReactNode }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
      {number}
    </div>
    <div className="flex items-center gap-2">
      {icon}
      <h2 className="text-2xl font-serif">{title}</h2>
    </div>
  </div>
);

// Aspect Card Component - Shows light and shadow
const AspectCard = ({ 
  planet1, 
  planet2, 
  aspect, 
  personAName, 
  personBName,
  orb
}: { 
  planet1: string; 
  planet2: string; 
  aspect: string; 
  personAName: string; 
  personBName: string;
  orb?: number;
}) => {
  const [expanded, setExpanded] = useState(false);
  const expressions = generateAspectExpressions(planet1, planet2, aspect, personAName, personBName);
  
  const p1Symbol = PLANET_SYMBOLS[planet1] || planet1;
  const p2Symbol = PLANET_SYMBOLS[planet2] || planet2;
  const aspectSymbol = ASPECT_SYMBOLS[aspect] || aspect;

  return (
    <div className="border rounded-xl overflow-hidden bg-card">
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger className="w-full text-left">
          <div className="p-4 bg-secondary/30 hover:bg-secondary/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-lg font-medium">
                  <span>{personAName}'s {planet1} ({p1Symbol})</span>
                  <span className="text-primary">{aspectSymbol} {aspect}</span>
                  <span>{personBName}'s {planet2} ({p2Symbol})</span>
                </div>
                {orb !== undefined && (
                  <Badge variant="outline" className="mt-1 text-xs">{orb.toFixed(1)}° orb</Badge>
                )}
              </div>
              {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-4 space-y-4">
            {/* The Energy */}
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-medium text-sm mb-1 text-primary">The Energy</h4>
              <p className="text-sm">{expressions.energy}</p>
            </div>

            <p className="text-sm text-muted-foreground italic">
              How it can show up (depending on consciousness):
            </p>

            {/* Light Expression */}
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-green-700 dark:text-green-400">
                <Sun size={16} />
                Light Expression
              </h4>
              <ul className="text-sm space-y-1">
                {expressions.lightExpressions.map((exp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Shadow Expression */}
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Moon size={16} />
                Shadow Expression
              </h4>
              <ul className="text-sm space-y-1">
                {expressions.shadowExpressions.map((exp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <AlertTriangle size={14} className="mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What Each Person Should Know */}
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Lightbulb size={16} />
                What Each Person Should Know
              </h4>
              <div className="space-y-2 text-sm">
                <p><strong>{personAName}:</strong> {expressions.personAAdvice}</p>
                <p><strong>{personBName}:</strong> {expressions.personBAdvice}</p>
              </div>
            </div>

            {/* Growth Edge */}
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
              <h4 className="font-medium text-sm mb-1 flex items-center gap-2 text-purple-700 dark:text-purple-400">
                <Target size={16} />
                The Growth Edge
              </h4>
              <p className="text-sm">{expressions.growthEdge}</p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

// Main Component
export const FiveEssentialQuestions = ({
  chart1,
  chart2,
  report,
  karmicAnalysis,
  compositeInterpretation
}: FiveEssentialQuestionsProps) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    allAspects: false,
    calculations: false,
    symbols: false,
    composite: false,
    karmic: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Get significant aspects from the report
  const significantAspects = useMemo(() => {
    const aspects: Array<{
      planet1: string;
      planet2: string;
      aspect: string;
      owner1: string;
      owner2: string;
      orb?: number;
    }> = [];

    // Add conflict triggers (these are the tense aspects)
    report.conflictTriggers.forEach(trigger => {
      if (trigger.planets.length >= 2) {
        aspects.push({
          planet1: trigger.planets[0],
          planet2: trigger.planets[1],
          aspect: trigger.aspectType,
          owner1: chart1.name,
          owner2: chart2.name
        });
      }
    });

    // Add karmic indicators as aspects
    if (karmicAnalysis) {
      karmicAnalysis.indicators.forEach(ind => {
        if (ind.aspect && !aspects.some(a => 
          (a.planet1 === ind.planet1 && a.planet2 === ind.planet2) ||
          (a.planet1 === ind.planet2 && a.planet2 === ind.planet1)
        )) {
          aspects.push({
            planet1: ind.planet1,
            planet2: ind.planet2,
            aspect: ind.aspect,
            owner1: chart1.name,
            owner2: chart2.name
          });
        }
      });
    }

    // Add attraction dynamics
    report.attractionDynamics.forEach(dyn => {
      if (dyn.planets.length >= 2) {
        aspects.push({
          planet1: dyn.planets[0],
          planet2: dyn.planets[1],
          aspect: 'conjunction',
          owner1: chart1.name,
          owner2: chart2.name
        });
      }
    });

    return aspects.slice(0, 8); // Limit to top 8 aspects
  }, [report, karmicAnalysis, chart1.name, chart2.name]);

  // Generate lessons
  const lessons = useMemo(() => 
    generateLessons(chart1, chart2, report, karmicAnalysis),
    [chart1, chart2, report, karmicAnalysis]
  );

  // Get karmic type base info
  const karmicTypeBase = karmicAnalysis 
    ? KARMIC_TYPE_BASE[karmicAnalysis.karmicType] || KARMIC_TYPE_BASE.soul_family
    : KARMIC_TYPE_BASE.new_contract;

  // Generate chart-specific indicators
  const chartSpecificThrivingIndicators = useMemo(() => 
    generateChartSpecificThrivingIndicators(karmicAnalysis, chart1.name, chart2.name),
    [karmicAnalysis, chart1.name, chart2.name]
  );
  
  const chartSpecificCompletionIndicators = useMemo(() => 
    generateChartSpecificCompletionIndicators(karmicAnalysis, chart1.name, chart2.name),
    [karmicAnalysis, chart1.name, chart2.name]
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-serif mb-2">The 5 Essential Questions</h1>
        <p className="text-muted-foreground">
          Understanding {chart1.name} & {chart2.name}'s Connection
        </p>
      </div>

      {/* Question 1: What Are The Relationship Dynamics? */}
      <section className="space-y-4">
        <SectionHeader 
          number={1} 
          title="What Are The Relationship Dynamics?" 
          icon={<Heart className="text-primary" size={24} />}
        />
        
        <p className="text-muted-foreground mb-4">
          These are the key astrological connections between you. Each aspect shows both the gift (light expression) 
          and the challenge (shadow expression). Click to expand.
        </p>

        <div className="space-y-4">
          {significantAspects.length > 0 ? (
            significantAspects.map((asp, i) => (
              <AspectCard
                key={i}
                planet1={asp.planet1}
                planet2={asp.planet2}
                aspect={asp.aspect}
                personAName={asp.owner1}
                personBName={asp.owner2}
                orb={asp.orb}
              />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Detailed aspect analysis requires complete birth data for both charts.
            </p>
          )}
        </div>
      </section>

      {/* Question 2: Why Did You Meet? */}
      <section className="space-y-4">
        <SectionHeader 
          number={2} 
          title="Why Did You Meet? (Soul Purpose)" 
          icon={<Compass className="text-purple-500" size={24} />}
        />
        
        {karmicAnalysis ? (
          <div className="space-y-4">
            {/* Karmic Type Badge */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-serif">{karmicTypeBase.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    Past Life Probability: {karmicAnalysis.pastLifeProbability}% • 
                    Soul Growth Focus: {100 - karmicAnalysis.pastLifeProbability}%
                  </p>
                </div>
              </div>
              
              <div className="text-sm space-y-3">
                <p className="font-medium">Why your paths crossed:</p>
                <p>{karmicAnalysis.soulPurpose}</p>
              </div>
            </div>

            {/* Node contacts */}
            {karmicAnalysis.indicators.filter(ind => 
              ind.type === 'north_node' || ind.type === 'south_node'
            ).map((ind, i) => (
              <div key={i} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{ind.type.replace('_', ' ')}</Badge>
                  <span className="font-medium">{ind.planet1} {ind.aspect} {ind.planet2}</span>
                </div>
                <p className="text-sm text-muted-foreground">{ind.interpretation}</p>
              </div>
            ))}

            {/* The Big Picture */}
            <div className="p-4 rounded-lg bg-secondary/30 border">
              <h4 className="font-medium mb-2">The Big Picture</h4>
              <p className="text-sm text-muted-foreground">{karmicTypeBase.description}</p>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-card border text-center">
                <div className="text-2xl font-bold text-primary">{karmicAnalysis.totalKarmicScore}</div>
                <div className="text-xs text-muted-foreground">Total Karmic Score</div>
              </div>
              <div className="p-3 rounded-lg bg-card border text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {karmicAnalysis.indicators.filter(i => i.theme === 'soul_growth').length}
                </div>
                <div className="text-xs text-muted-foreground">Soul Growth</div>
              </div>
              <div className="p-3 rounded-lg bg-card border text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {karmicAnalysis.indicators.filter(i => i.theme === 'past_life').length}
                </div>
                <div className="text-xs text-muted-foreground">Past Life</div>
              </div>
              <div className="p-3 rounded-lg bg-card border text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {karmicAnalysis.indicators.filter(i => i.theme === 'transformation' || i.theme === 'healing').length}
                </div>
                <div className="text-xs text-muted-foreground">Transformation</div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Soul purpose analysis requires complete birth data for both charts.
          </p>
        )}
      </section>

      {/* Question 3: What Are You Building Together? */}
      <section className="space-y-4">
        <SectionHeader 
          number={3} 
          title="What Are You Building Together? (Composite Chart)" 
          icon={<Users className="text-blue-500" size={24} />}
        />
        
        {compositeInterpretation ? (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Sun size={16} className="text-amber-600" />
                  Composite Sun in {compositeInterpretation.sunSign || 'Unknown'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  <strong>Your collective purpose:</strong> {compositeInterpretation.overallTheme || 'A partnership of mutual growth and discovery.'}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Moon size={16} className="text-blue-600" />
                  Composite Moon in {compositeInterpretation.moonSign || 'Unknown'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  <strong>Your emotional foundation:</strong> {compositeInterpretation.emotionalCore || 'A nurturing emotional bond.'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Heart size={16} className="text-pink-600" />
                Composite Venus in {compositeInterpretation.venusSign || 'Unknown'}
              </h4>
              <p className="text-sm text-muted-foreground">
                <strong>How you love as a unit:</strong> {compositeInterpretation.loveLanguage || 'A partnership that values connection and harmony.'}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-secondary/30 border">
              <h4 className="font-medium mb-2">What you're creating together</h4>
              <p className="text-sm text-muted-foreground">
                {compositeInterpretation.relationshipStyle || 
                  'This relationship combines your individual energies into something greater than the sum of its parts.'}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Composite chart analysis requires complete birth data for both charts.
          </p>
        )}
      </section>

      {/* Question 4: How Long Will This Last? */}
      <section className="space-y-4">
        <SectionHeader 
          number={4} 
          title="How Long Will This Last?" 
          icon={<Infinity className="text-green-500" size={24} />}
        />
        
        <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="text-green-600 dark:text-green-400" size={24} />
            <div>
              <h3 className="text-xl font-serif">{karmicTypeBase.label} Timeline</h3>
              <p className="text-sm text-green-700 dark:text-green-400">{karmicTypeBase.duration}</p>
            </div>
          </div>
          
          <p className="text-sm mb-4">{karmicTypeBase.description}</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20">
              <h4 className="font-medium text-sm mb-2 text-green-700 dark:text-green-400">
                What indicates it's thriving (specific to {chart1.name} & {chart2.name}):
              </h4>
              <ul className="text-sm space-y-1">
                {chartSpecificThrivingIndicators.map((ind, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="mt-0.5 text-green-600 flex-shrink-0" />
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20">
              <h4 className="font-medium text-sm mb-2 text-amber-700 dark:text-amber-400">
                What indicates natural completion (specific to this relationship):
              </h4>
              <ul className="text-sm space-y-1">
                {chartSpecificCompletionIndicators.map((ind, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Compass size={14} className="mt-0.5 text-amber-600 flex-shrink-0" />
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {karmicAnalysis && karmicAnalysis.timeline.key_lessons.length > 0 && (
          <div className="p-4 rounded-lg border bg-card">
            <h4 className="font-medium mb-2">Key lessons for this connection:</h4>
            <ul className="text-sm space-y-1">
              {karmicAnalysis.timeline.key_lessons.map((lesson, i) => (
                <li key={i} className="flex items-start gap-2">
                  <GraduationCap size={14} className="mt-0.5 text-primary flex-shrink-0" />
                  <span>{lesson}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Question 5: What Are You Here To Learn? */}
      <section className="space-y-4">
        <SectionHeader 
          number={5} 
          title="What Are You Here To Learn?" 
          icon={<GraduationCap className="text-amber-500" size={24} />}
        />
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* Person 1 Lessons */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <span className="text-xl">{chart1.name}</span>
            </h4>
            <ul className="text-sm space-y-2">
              {lessons.person1Lessons.map((lesson, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Lightbulb size={14} className="mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>{lesson}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Person 2 Lessons */}
          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <span className="text-xl">{chart2.name}</span>
            </h4>
            <ul className="text-sm space-y-2">
              {lessons.person2Lessons.map((lesson, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Lightbulb size={14} className="mt-0.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <span>{lesson}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Together Lessons */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            <span>Together</span>
          </h4>
          <ul className="text-sm space-y-2">
            {lessons.togetherLessons.map((lesson, i) => (
              <li key={i} className="flex items-start gap-2">
                <Target size={14} className="mt-0.5 text-primary flex-shrink-0" />
                <span>{lesson}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* EXPLORE DEEPER Section */}
      <section className="space-y-3 pt-8 border-t">
        <h2 className="text-xl font-serif mb-4 flex items-center gap-2">
          <BookOpen className="text-muted-foreground" size={20} />
          Explore Deeper
        </h2>

        {/* All Aspects Detected */}
        <Collapsible open={expandedSections.allAspects} onOpenChange={() => toggleSection('allAspects')}>
          <CollapsibleTrigger className="w-full flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-secondary/30 transition-colors">
            <span className="font-medium">See All Aspects Detected</span>
            {expandedSections.allAspects ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground mb-4">
              Full technical breakdown of all detected synastry aspects.
            </p>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {report.karmicIndicators.map((ind, i) => (
                  <div key={i} className="p-2 rounded border bg-secondary/20 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{ind.aspectType}</Badge>
                      <span>{ind.planet1} - {ind.planet2}</span>
                      <span className="text-xs text-muted-foreground">({ind.orb}° orb)</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>

        {/* Symbol Legend */}
        <Collapsible open={expandedSections.symbols} onOpenChange={() => toggleSection('symbols')}>
          <CollapsibleTrigger className="w-full flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-secondary/30 transition-colors">
            <span className="font-medium">Learn About These Symbols</span>
            {expandedSections.symbols ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 p-4 rounded-lg border bg-card">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <h4 className="font-medium mb-2">Planets</h4>
                <div className="space-y-1 text-sm">
                  {Object.entries(PLANET_SYMBOLS).slice(0, 10).map(([name, symbol]) => (
                    <div key={name} className="flex items-center gap-2">
                      <span className="text-lg">{symbol}</span>
                      <span className="text-muted-foreground">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Points</h4>
                <div className="space-y-1 text-sm">
                  {Object.entries(PLANET_SYMBOLS).slice(10).map(([name, symbol]) => (
                    <div key={name} className="flex items-center gap-2">
                      <span className="text-lg">{symbol}</span>
                      <span className="text-muted-foreground">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Aspects</h4>
                <div className="space-y-1 text-sm">
                  {Object.entries(ASPECT_SYMBOLS).map(([name, symbol]) => (
                    <div key={name} className="flex items-center gap-2">
                      <span className="text-lg">{symbol}</span>
                      <span className="text-muted-foreground">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Aspect Types</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>☌ <strong>Conjunction</strong>: Same place (0°)</p>
                  <p>☍ <strong>Opposition</strong>: Opposite (180°)</p>
                  <p>□ <strong>Square</strong>: Tension (90°)</p>
                  <p>△ <strong>Trine</strong>: Harmony (120°)</p>
                  <p>⚹ <strong>Sextile</strong>: Opportunity (60°)</p>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Theme Breakdown Guide - Educational Section */}
        {karmicAnalysis && (
          <Collapsible open={expandedSections.calculations} onOpenChange={() => toggleSection('calculations')}>
            <CollapsibleTrigger className="w-full flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-secondary/30 transition-colors">
              <span className="font-medium">How We Determined These Themes (Teaching Guide)</span>
              {expandedSections.calculations ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 p-4 rounded-lg border bg-card">
              <ThemeBreakdownGuide 
                chart1={chart1}
                chart2={chart2}
                karmicAnalysis={karmicAnalysis}
              />
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Karmic Breakdown */}
        {karmicAnalysis && (
          <Collapsible open={expandedSections.karmic} onOpenChange={() => toggleSection('karmic')}>
            <CollapsibleTrigger className="w-full flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-secondary/30 transition-colors">
              <span className="font-medium">View Karmic Indicators Breakdown</span>
              {expandedSections.karmic ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 p-4 rounded-lg border bg-card">
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {karmicAnalysis.indicators.map((ind, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-secondary/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">{ind.type.replace('_', ' ')}</Badge>
                        <span className="font-medium text-sm">{ind.planet1} {ind.aspect} {ind.planet2}</span>
                        <Badge variant="outline" className="ml-auto">+{ind.weight} pts</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{ind.interpretation}</p>
                      <p className="text-xs mt-1"><strong>Theme:</strong> {ind.theme.replace('_', ' ')}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>
        )}
      </section>
    </div>
  );
};

export default FiveEssentialQuestions;

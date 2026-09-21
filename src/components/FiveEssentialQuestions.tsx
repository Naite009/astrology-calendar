/**
 * Five Essential Questions - Relationship Analysis Framework
 * 
 * The primary educational structure for synastry analysis:
 * 1. What are the relationship dynamics? (Aspects with light/shadow)
 * 2. Why this connection may feel significant (symbolic contacts)
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
import { DirectionalAspectCard } from '@/components/synastry/DirectionalAspectCard';
import { getDirectionalInterpretation } from '@/data/directionalAspectData';
import {
  calculateCrossAspects,
  sanitizeRelationshipText,
  type CrossAspect,
  type RelationshipContext,
  SYMBOLIC_LENS_NOTE,
  symbolicEmphasisLine,
  describeDirectionalFromParts,
  buildKarmicSummary,
  karmicContactLine,
  formatKarmicOrb,
} from '@/lib/relationship';
import { KarmicSummaryCard } from '@/components/relationship/KarmicSummaryCard';
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
  focus?: 'romance' | 'friendship' | 'business' | 'creative' | 'family';
  /** Canonical relationship context; drives vocabulary and which questions apply. */
  context?: RelationshipContext;
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

/**
 * Evidence-derived lists. There are no relationship archetypes here: nothing
 * classifies a pairing as a twin flame, catalyst, karmic completion or soul family,
 * and nothing predicts duration or "completion". Both lists come straight from the
 * contacts the canonical engine actually found, and stay empty when it found none.
 */
function supportLines(karmicAnalysis: KarmicAnalysis | null): string[] {
  return (karmicAnalysis?.supportingFactors ?? []).slice(0, 5);
}

function strainLines(karmicAnalysis: KarmicAnalysis | null): string[] {
  return (karmicAnalysis?.strainingFactors ?? []).slice(0, 5);
}


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
        `${personBName} feels deeply understood by ${personAName}`
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
        'Intensity that can tip into wanting constant reassurance',
        'Sensitivity about attention and reassurance',
        'Push and pull about who leads',
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
        `${personBName} becomes more honestly themselves`,
        'Deep mutual respect for each other\'s power',
        'Transformative impact on self-confidence'
      ],
      shadowExpressions: [
        'Power struggles over who leads',
        `${personBName} may feel overshadowed`,
        'Competition rather than collaboration',
        'Repeated tugs-of-war about who decides'
      ],
      personAAdvice: `Your transformative power works best when you support ${personBName}'s light, not overshadow it.`,
      personBAdvice: `Stand in your honest power. Don't shrink yourself.`,
      growthEdge: 'Both can be powerful without diminishing the other.'
    },
    'Pluto-Sun-conjunction': {
      energy: 'Intense identity transformation through merging energies.',
      lightExpressions: [
        `${personAName}'s transformative power fuses with ${personBName}'s core identity`,
        'Profound capacity for mutual empowerment',
        'Deep understanding of each other\'s shadows and light',
        'A sense of being recognised at a deep level (a symbolic reading, not a fact)'
      ],
      shadowExpressions: [
        'The two lives can blend so closely that separate interests get thin',
        `${personBName} may feel swept along by ${personAName}’s intensity`,
        'A lot of attention going to each other, leaving little room for other parts of life',
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
        'A strong pull that changes how both people see themselves',
        'Courage to face difficult truths together',
        'Mutual empowerment to take bold action'
      ],
      shadowExpressions: [
        'Power struggles over who controls what',
        'Explosive anger or arguments',
        'Pushing hard when it would be better to pause',
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
        'A sense of easy recognition and shared ideals',
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
        'Freedom to be honest with each other',
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
      energy: 'Emotional volatility with a need for honest feeling.',
      lightExpressions: [
        'Emotional breakthroughs and awakenings',
        'Freedom to feel honestly without judgment',
        'Innovation in nurturing and home life',
        'Breaking free from family patterns'
      ],
      shadowExpressions: [
        'Emotional instability or unpredictability',
        `${personBName} may feel unsettled by ${personAName}'s detachment`,
        'Difficulty creating consistent emotional security',
        'Sudden mood shifts that confuse the partner'
      ],
      personAAdvice: 'Your emotional honesty is a gift, but consistency builds trust.',
      personBAdvice: 'Accept that their emotions run on an unusual frequency. Find your own stability.',
      growthEdge: 'Creating emotional freedom within secure connection.'
    },
    'Uranus-Sun-opposition': {
      energy: 'Push-pull between individuality and partnership.',
      lightExpressions: [
        'Each person inspires the other to be more honest',
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
      energy: 'A strong romantic pull and easy warmth.',
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
        'Closeness that leaves little separate space'
      ],
      personAAdvice: `Your connection is natural - don't forget to keep growing individually.`,
      personBAdvice: `The ease between you is a gift. Stay curious about each other.`,
      growthEdge: 'Maintaining individual identity within deep connection.'
    },
    'NorthNode-Sun-conjunction': {
      energy: 'A contact many astrologers read as significant for direction; each person tends to light up the other\'s sense of where they are going.',
      lightExpressions: [
        `${personAName} illuminates ${personBName}'s life purpose and destiny path`,
        `${personBName} helps ${personAName} step into their honest self`,
        'Feeling well placed to meet',
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
        `${personAName} helps ${personBName} find and communicate their honest voice`,
        `${personBName} is learning new ways of thinking through ${personAName}`,
        'Mental/communication evolution is a key theme',
        'Conversations that change perspectives'
      ],
      shadowExpressions: [
        'One person taking up most of the conversation',
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
        'Emotional patterns are well placed to evolve',
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
        'Touching each other\'s sore spots',
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

    // Practice items, each derived from an actual contact (never filler)
    karmicAnalysis.practiceFocus.forEach(item => {
      if (!togetherLessons.includes(item)) togetherLessons.push(item);
    });

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
  orb,
  focus = 'romance',
  context,
  fromSign,
  fromDegreeInSign,
  toSign,
  toDegreeInSign
}: { 
  planet1: string; 
  planet2: string; 
  aspect: string; 
  personAName: string; 
  personBName: string;
  orb?: number;
  focus?: 'romance' | 'friendship' | 'business' | 'creative' | 'family';
  context?: RelationshipContext;
  fromSign?: string;
  fromDegreeInSign?: number;
  toSign?: string;
  toDegreeInSign?: number;
}) => {
  const [expanded, setExpanded] = useState(false);
  const expressions = generateAspectExpressions(planet1, planet2, aspect, personAName, personBName);

  // Canonical "who feels what" breakdown. Always available, every aspect.
  const directional = useMemo(() => {
    if (!context) return null;
    return describeDirectionalFromParts(
      {
        fromOwner: personAName,
        fromBody: planet1,
        toOwner: personBName,
        toBody: planet2,
        aspect,
        orb,
        fromSign,
        fromDegreeInSign,
        toSign,
        toDegreeInSign,
      },
      context
    );
  }, [context, personAName, planet1, personBName, planet2, aspect, orb, fromSign, fromDegreeInSign, toSign, toDegreeInSign]);


  // Curated long-form directional interpretation, when one exists for this pair.
  // Suppressed for minors: the curated copy is written for adult relationships.
  const directionalInterp = useMemo(() => {
    if (context?.involvesMinor) return null;
    return getDirectionalInterpretation(planet1, aspect, planet2, focus);
  }, [planet1, aspect, planet2, focus, context?.involvesMinor]);
  
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
                <div className="flex items-center gap-2 mt-1">
                  {orb !== undefined && (
                    <Badge variant="outline" className="text-xs">{orb.toFixed(1)}° orb</Badge>
                  )}
                  {(directional || directionalInterp) && (
                    <Badge variant="secondary" className="text-xs">
                      Who feels what
                    </Badge>
                  )}
                </div>
              </div>
              {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-4 space-y-4">
            {/* Canonical directional breakdown: exact aspect, both roles, both sides */}
            {directional && (
              <div className="p-3 rounded-lg border bg-secondary/20 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">
                    {directional.aspectLine} · {directional.orbLine}
                  </p>
                  {directional.isOutOfSign && (
                    <Badge variant="outline" className="text-xs whitespace-nowrap border-amber-500/60 text-amber-600 dark:text-amber-400">
                      Out of sign
                    </Badge>
                  )}
                </div>
                {directional.positionsLine && (
                  <p className="text-xs text-muted-foreground">{directional.positionsLine}</p>
                )}
                {directional.isOutOfSign && (
                  <div className="rounded border border-amber-500/30 bg-amber-500/5 p-2 space-y-1">
                    <p className="text-xs">{directional.signLine}</p>
                    <p className="text-xs">{directional.degreeLine}</p>
                    <p className="text-xs">{directional.synthesisLine}</p>
                  </div>
                )}

                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium">{directional.a.roleLine}</p>
                    <p className="text-xs text-muted-foreground">{directional.a.feels}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium">{directional.b.roleLine}</p>
                    <p className="text-xs text-muted-foreground">{directional.b.feels}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">How it can work well: </span>
                  {directional.worksWell}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">Possible friction / growth edge: </span>
                  {directional.growthEdge}
                </p>
                <p className="text-xs">
                  <span className="font-medium">In one line: </span>
                  {directional.summary}
                </p>
              </div>
            )}

            {/* Curated long-form directional analysis (adults only) */}
            {directionalInterp && (
              <DirectionalAspectCard
                interpretation={directionalInterp}
                context={focus}
                personAName={personAName}
                personBName={personBName}
              />
            )}
            
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
  compositeInterpretation,
  focus = 'friendship',
  context
}: FiveEssentialQuestionsProps) => {
  /** Canonical cross-aspects: the single source of truth for aspect type and orb. */
  const canonicalAspects = useMemo(
    () => calculateCrossAspects(chart1, chart2),
    [chart1, chart2]
  );

  /** Find the real contact between two bodies instead of assuming a conjunction. */
  const findCanonical = (a: string, b: string): CrossAspect | undefined =>
    canonicalAspects.find(
      (asp) =>
        (asp.fromBody === a && asp.toBody === b) || (asp.fromBody === b && asp.toBody === a)
    );

  const say = (text: string) => sanitizeRelationshipText(text, context);

  /** Canonical, evidence-first symbolic summary shared with every other surface. */
  const karmicSummary = useMemo(
    () => buildKarmicSummary(karmicAnalysis, context, chart1.name, chart2.name),
    [karmicAnalysis, context, chart1.name, chart2.name]
  );
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

    // Add attraction dynamics. The aspect type and orb come from the canonical
    // engine — previously every one of these was displayed as a conjunction even
    // when the real contact was a trine, square or opposition.
    report.attractionDynamics.forEach(dyn => {
      if (dyn.planets.length >= 2) {
        const real = findCanonical(dyn.planets[0], dyn.planets[1]);
        if (!real) return; // never display a contact the maths does not support
        aspects.push({
          planet1: real.fromBody,
          planet2: real.toBody,
          aspect: real.aspect,
          orb: real.orb,
          owner1: real.fromOwner,
          owner2: real.toOwner
        });
      }
    });

    // Attach real sign + degree for each side so the sign-vs-degree ("out of
    // sign") layer can be shown. Generic: any body, any pair.
    const posOf = (chart: typeof chart1, body: string) => {
      const src =
        body === 'Ascendant'
          ? chart.houseCusps?.house1 ?? chart.planets?.Ascendant
          : body === 'Midheaven'
            ? chart.houseCusps?.house10
            : (chart.planets as Record<string, { sign?: string; degree?: number; minutes?: number }> | undefined)?.[body];
      if (!src?.sign) return {};
      return {
        sign: src.sign as string,
        degreeInSign: (Number(src.degree) || 0) + (Number(src.minutes) || 0) / 60,
      };
    };

    return aspects.slice(0, 8).map((a) => {
      const chartFor = (owner: string) => (owner === chart2.name ? chart2 : chart1);
      const p1 = posOf(chartFor(a.owner1), a.planet1);
      const p2 = posOf(chartFor(a.owner2), a.planet2);
      return {
        ...a,
        fromSign: p1.sign,
        fromDegreeInSign: p1.degreeInSign,
        toSign: p2.sign,
        toDegreeInSign: p2.degreeInSign,
      };
    }); // Limit to top 8 aspects
  }, [report, karmicAnalysis, chart1, chart2, canonicalAspects]);


  // Generate lessons
  const lessons = useMemo(() => 
    generateLessons(chart1, chart2, report, karmicAnalysis),
    [chart1, chart2, report, karmicAnalysis]
  );

  // Evidence-derived support/strain lists (no archetype labels, no duration claims)
  const chartSpecificThrivingIndicators = useMemo(
    () => supportLines(karmicAnalysis),
    [karmicAnalysis]
  );

  const chartSpecificStrainIndicators = useMemo(
    () => strainLines(karmicAnalysis),
    [karmicAnalysis]
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
                focus={focus}
                context={context}
                fromSign={asp.fromSign}
                fromDegreeInSign={asp.fromDegreeInSign}
                toSign={asp.toSign}
                toDegreeInSign={asp.toDegreeInSign}

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
          title="Why This Connection May Feel Significant" 
          icon={<Compass className="text-purple-500" size={24} />}
        />
        
        {karmicAnalysis ? (
          <div className="space-y-4">
            {/* Node contacts, each with its own evidence line */}
            {karmicAnalysis.indicators.filter(ind => 
              ind.type === 'north_node' || ind.type === 'south_node'
            ).map((ind, i) => (
              <div key={i} className="p-4 rounded-lg border bg-card">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="secondary">{ind.type === 'north_node' ? 'nodal (North Node)' : 'nodal (South Node)'}</Badge>
                  <span className="font-medium">{karmicContactLine(ind, chart1.name, chart2.name)}</span>
                  <span className="text-xs text-muted-foreground">({formatKarmicOrb(ind.orb)})</span>
                </div>
                <p className="text-sm text-muted-foreground">{say(ind.interpretation)}</p>
              </div>
            ))}

            {/* Plain-language, evidence-first summary (shared with all Synastry surfaces) */}
            <KarmicSummaryCard summary={karmicSummary} />
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            This section needs complete birth data for both charts.
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
          title="What Sustains This Connection?" 
          icon={<Infinity className="text-green-500" size={24} />}
        />
        
        <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="text-green-600 dark:text-green-400" size={24} />
            <div>
              <h3 className="text-xl font-serif">What tends to support this connection, and what can strain it</h3>
              <p className="text-sm text-green-700 dark:text-green-400">
                A chart cannot say how long a relationship lasts or when it is finished. Each line below
                names the exact contact it comes from, with its orb and whose planet is whose.
              </p>
            </div>
          </div>

          <p className="text-sm mb-4">{say(karmicAnalysis?.emphasis || 'No contacts of this kind were found between these two charts.')}</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20">
              <h4 className="font-medium text-sm mb-2 text-green-700 dark:text-green-400">
                What tends to support this connection:
              </h4>
              {chartSpecificThrivingIndicators.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No supporting contacts of this kind were found, so nothing is listed here.
                </p>
              ) : (
                <ul className="text-sm space-y-1">
                  {chartSpecificThrivingIndicators.map((ind, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="mt-0.5 text-green-600 flex-shrink-0" />
                      <span>{say(ind)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20">
              <h4 className="font-medium text-sm mb-2 text-amber-700 dark:text-amber-400">
                What can strain it:
              </h4>
              {chartSpecificStrainIndicators.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No tense contacts of this kind were found, so nothing is listed here.
                </p>
              ) : (
                <ul className="text-sm space-y-1">
                  {chartSpecificStrainIndicators.map((ind, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Compass size={14} className="mt-0.5 text-amber-600 flex-shrink-0" />
                      <span>{say(ind)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {karmicAnalysis && karmicAnalysis.careAreas.length > 0 && (
          <div className="p-4 rounded-lg border bg-card">
            <h4 className="font-medium mb-2">Areas worth a little care and awareness:</h4>
            <ul className="text-sm space-y-1">
              {karmicAnalysis.careAreas.map((area, i) => (
                <li key={i} className="flex items-start gap-2">
                  <GraduationCap size={14} className="mt-0.5 text-primary flex-shrink-0" />
                  <span>{say(area)}</span>
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
          title="What This Relationship May Help Each Person Practice" 
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

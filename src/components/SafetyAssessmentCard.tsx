import { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, CheckCircle2, Heart, Sparkles, BookOpen, Users, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';

export type SafetyLevel = 'high_risk' | 'moderate_risk' | 'low_risk' | 'safe';

export interface DangerIndicator {
  type: string;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  description: string;
  mitigation: string;
}

export interface SafetyAssessment {
  safetyLevel: SafetyLevel;
  riskScore: number;
  dangerIndicators: DangerIndicator[];
  greenFlags: string[];
  proceedWithCaution: boolean;
  professionalSupportRecommended: boolean;
}

interface SafetyAssessmentCardProps {
  assessment: SafetyAssessment;
  chart1Name: string;
  chart2Name: string;
}

// Planet symbols for educational display
const planetSymbols: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  NorthNode: '☊', SouthNode: '☋', Chiron: '⚷'
};

// Aspect symbols
const aspectSymbols: Record<string, string> = {
  conjunction: '☌', opposition: '☍', square: '□', trine: '△', sextile: '⚹'
};

// Educational labels instead of severity
const intensityLabels: Record<DangerIndicator['severity'], { label: string; color: string }> = {
  critical: { label: 'Intense pattern worth understanding', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  high: { label: 'Complex dynamic requiring awareness', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' },
  moderate: { label: 'Growth opportunity', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  low: { label: 'Minor pattern to notice', color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300' }
};

// Educational framing based on level
const educationalConfig: Record<SafetyLevel, {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  bgGradient: string;
  borderColor: string;
}> = {
  high_risk: {
    title: 'Relationship Dynamics to Understand',
    subtitle: 'This relationship has several intense patterns that benefit from conscious awareness',
    icon: <BookOpen size={24} />,
    bgGradient: 'from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800'
  },
  moderate_risk: {
    title: 'Relationship Dynamics to Understand',
    subtitle: 'This relationship has some intense patterns worth being conscious of',
    icon: <BookOpen size={24} />,
    bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  low_risk: {
    title: 'Generally Harmonious Connection',
    subtitle: 'This relationship has mostly supportive patterns with a few growth areas',
    icon: <Sparkles size={24} />,
    bgGradient: 'from-teal-50 to-green-50 dark:from-teal-950/20 dark:to-green-950/20',
    borderColor: 'border-teal-200 dark:border-teal-800'
  },
  safe: {
    title: 'Naturally Supportive Connection',
    subtitle: 'This relationship has strong harmonious patterns and healthy foundations',
    icon: <Heart size={24} />,
    bgGradient: 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20',
    borderColor: 'border-green-200 dark:border-green-800'
  }
};

// Parse description to extract planets and aspect
function parseAspectDescription(description: string): {
  planet1: string;
  planet2: string;
  aspect: string;
} | null {
  // Match patterns like "Pluto square Moon" or "Pluto conjunction Venus"
  const aspectMatch = description.match(/(Pluto|Saturn|Mars|Neptune|Uranus|Chiron)\s+(square|conjunction|opposition|trine|sextile)\s+(Sun|Moon|Venus|Mars|Mercury)/i);
  if (aspectMatch) {
    return {
      planet1: aspectMatch[1],
      aspect: aspectMatch[2].toLowerCase(),
      planet2: aspectMatch[3]
    };
  }
  
  // Match "8th house" patterns
  if (description.includes('8th house')) {
    return { planet1: 'Multiple planets', aspect: 'overlay', planet2: '8th House' };
  }
  
  return null;
}

// Generate personalized explanation based on the dynamic
function generatePersonalizedExplanation(
  description: string,
  personAName: string,
  personBName: string
): {
  whatThisMeans: string;
  howItShowsUp: string[];
  whatToBeAwareOf: { forA: string; forB: string };
  growthOpportunity: string;
  planetMeanings?: { planet1: string; planet2: string };
} {
  const parsed = parseAspectDescription(description);
  
  // Pluto-Moon dynamics
  if (description.includes('Pluto') && description.includes('Moon')) {
    return {
      whatThisMeans: `${personAName} may unconsciously trigger deep emotional responses in ${personBName}. ${personBName} might feel emotionally controlled or manipulated, even if ${personAName} doesn't intend this.`,
      howItShowsUp: [
        `${personBName} feels like they can't express emotions freely around ${personAName}`,
        `${personAName} may try to "fix" or control ${personBName}'s emotional reactions`,
        `Intense emotional moments where ${personBName} feels overwhelmed`
      ],
      whatToBeAwareOf: {
        forA: `Notice if you're trying to change how ${personBName} feels. Let them have their emotions without needing to transform or fix them.`,
        forB: `Your emotions are valid. If you feel controlled or manipulated, speak up early. You don't need permission to feel.`
      },
      growthOpportunity: `This aspect can lead to profound emotional transformation if ${personBName} learns emotional sovereignty and ${personAName} learns to respect emotional boundaries. The intensity can become healing rather than overwhelming.`,
      planetMeanings: {
        planet1: 'Pluto represents deep transformation, power, and unconscious drives. In relationships, Pluto brings intensity and the urge to transform.',
        planet2: 'Moon represents emotions, nurturing needs, and our inner child. In relationships, Moon shows how we need to feel safe and emotionally connected.'
      }
    };
  }
  
  // Pluto-Venus dynamics
  if (description.includes('Pluto') && description.includes('Venus')) {
    return {
      whatThisMeans: `${personAName} and ${personBName} experience intense attraction that can feel almost obsessive. This creates deep bonding but also potential for jealousy or possessiveness.`,
      howItShowsUp: [
        `Magnetic attraction that feels fated or "meant to be"`,
        `${personAName} may feel possessive or want to "own" the relationship`,
        `Power dynamics around love, affection, or money`,
        `Difficulty letting go if the relationship ends`
      ],
      whatToBeAwareOf: {
        forA: `Notice when attraction becomes possessiveness. Love freely without needing to control.`,
        forB: `Your worthiness isn't determined by how much they desire you. Maintain your sense of self.`
      },
      growthOpportunity: `This aspect creates the potential for deeply transformative love that changes both of you forever. The key is channeling intensity into growth rather than control.`,
      planetMeanings: {
        planet1: 'Pluto represents obsessive desire, transformation through crisis, and the urge to merge completely.',
        planet2: 'Venus represents love, values, and what we find beautiful. In relationships, Venus shows how we give and receive affection.'
      }
    };
  }
  
  // Saturn-Moon dynamics
  if (description.includes('Saturn') && description.includes('Moon')) {
    return {
      whatThisMeans: `${personAName} may come across as emotionally cold or critical to ${personBName}. ${personBName} might feel their emotions aren't validated or that they need to "grow up."`,
      howItShowsUp: [
        `${personBName} feels emotionally unsupported or criticized`,
        `${personAName} may seem dismissive of ${personBName}'s feelings`,
        `A parent-child dynamic where ${personAName} seems like the "adult"`,
        `${personBName} suppresses emotions to seem more acceptable`
      ],
      whatToBeAwareOf: {
        forA: `Validate emotions before offering solutions. Not everything needs to be fixed—sometimes people just need to feel heard.`,
        forB: `Your emotional needs are legitimate, not immature. Don't shrink yourself to seem more acceptable.`
      },
      growthOpportunity: `This aspect can create deep emotional maturity and stability if ${personAName} learns to nurture rather than critique, and ${personBName} learns that boundaries aren't rejection.`,
      planetMeanings: {
        planet1: 'Saturn represents structure, responsibility, and lessons. In relationships, Saturn brings commitment but also criticism and restriction.',
        planet2: 'Moon represents emotional needs and the inner child. It shows what we need to feel safe and nurtured.'
      }
    };
  }
  
  // Saturn-Sun dynamics
  if (description.includes('Saturn') && description.includes('Sun')) {
    return {
      whatThisMeans: `${personAName} may seem to restrict or criticize ${personBName}'s self-expression. ${personBName} might feel judged or like they can never quite measure up.`,
      howItShowsUp: [
        `${personBName} feels their confidence diminished around ${personAName}`,
        `${personAName} takes on an authority role, intentionally or not`,
        `${personBName} works harder to "earn" approval`
      ],
      whatToBeAwareOf: {
        forA: `Celebrate their wins. Your respect means more to them than you realize.`,
        forB: `Your worth isn't measured by their approval. Shine regardless.`
      },
      growthOpportunity: `This aspect can build lasting respect and help ${personBName} develop genuine self-confidence that doesn't depend on external validation.`,
      planetMeanings: {
        planet1: 'Saturn represents authority, criticism, and structure.',
        planet2: 'Sun represents identity, ego, and life force—our core sense of self.'
      }
    };
  }

  // 8th house dynamics
  if (description.includes('8th house')) {
    return {
      whatThisMeans: `Multiple planets falling into the 8th house creates intense psychological connection. This can feel like you're merging at a soul level—which is powerful but requires boundaries.`,
      howItShowsUp: [
        `Conversations naturally go to deep, taboo, or psychological topics`,
        `Difficulty maintaining separate identities`,
        `Intense physical and emotional attraction`,
        `Shared resources or finances become complicated`
      ],
      whatToBeAwareOf: {
        forA: `Maintain your separate identity. You can connect deeply without losing yourself.`,
        forB: `Same applies—merging completely isn't love, it's enmeshment.`
      },
      growthOpportunity: `This connection can facilitate profound transformation if both people maintain their separate sense of self while choosing to be vulnerable with each other.`
    };
  }
  
  // Mars dynamics
  if (description.includes('Mars')) {
    return {
      whatThisMeans: `There's significant activation energy between you. This creates passion but also potential for conflict if anger isn't expressed healthily.`,
      howItShowsUp: [
        `Arguments can escalate quickly`,
        `Strong physical/sexual chemistry`,
        `Competitiveness with each other`,
        `Both feeling the need to "win" disagreements`
      ],
      whatToBeAwareOf: {
        forA: `Pause before reacting. Your intensity can feel aggressive even when you don't intend it.`,
        forB: `You don't have to match their energy. De-escalation is strength, not weakness.`
      },
      growthOpportunity: `This dynamic creates the energy to actually DO things together. Channel the fire into shared goals rather than conflict.`
    };
  }
  
  // Default fallback
  return {
    whatThisMeans: `This pattern creates intensity in your relationship that benefits from conscious awareness.`,
    howItShowsUp: [
      `Moments of tension that feel bigger than the situation warrants`,
      `Strong reactions that seem to come from nowhere`,
      `Patterns that repeat despite wanting to change`
    ],
    whatToBeAwareOf: {
      forA: `Stay curious about your reactions. Ask "why does this trigger me?" instead of just reacting.`,
      forB: `Same for you—your reactions carry information worth understanding.`
    },
    growthOpportunity: `Awareness is the first step. By understanding this pattern, you can work with it consciously rather than being controlled by it.`
  };
}

export const SafetyAssessmentCard = ({ assessment, chart1Name, chart2Name }: SafetyAssessmentCardProps) => {
  const [showDetails, setShowDetails] = useState(assessment.dangerIndicators.length > 0);
  const config = educationalConfig[assessment.safetyLevel];
  
  const hasPatterns = assessment.dangerIndicators.length > 0;
  
  return (
    <div className={`rounded-xl border-2 ${config.borderColor} bg-gradient-to-br ${config.bgGradient} overflow-hidden`}>
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-background/80 text-primary flex-shrink-0">
            {config.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-foreground mb-1">
              {config.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {config.subtitle}
            </p>
          </div>
        </div>
        
        {/* Context Message - Educational framing */}
        {hasPatterns && (
          <div className="mt-4 p-4 rounded-lg bg-background/80 border">
            <div className="flex items-start gap-3">
              <Lightbulb size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">Understanding these patterns</p>
                <p className="text-muted-foreground">
                  Having challenging aspects doesn't mean the relationship is doomed—it means there are 
                  specific growth areas to be conscious of. Many deeply fulfilling relationships have 
                  intense aspects; what matters is how you work with them.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Green Flags Section */}
        {assessment.greenFlags.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-green-100/50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300 mb-2">
              <Heart size={16} />
              What's Working Well
            </div>
            <ul className="space-y-1">
              {assessment.greenFlags.map((flag, i) => (
                <li key={i} className="text-sm text-green-700 dark:text-green-300 flex items-start gap-2">
                  <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" />
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Expandable Dynamics Education */}
      {hasPatterns && (
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <CollapsibleTrigger className="w-full px-6 py-3 border-t bg-background/50 hover:bg-background/80 transition-colors flex items-center justify-center gap-2 text-sm">
            <Users size={16} className="text-primary" />
            {showDetails ? (
              <>
                <ChevronUp size={16} />
                Hide dynamics breakdown
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Understand the {assessment.dangerIndicators.length} pattern{assessment.dangerIndicators.length !== 1 ? 's' : ''} between {chart1Name} & {chart2Name}
              </>
            )}
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-6 py-4 border-t bg-background/30 space-y-6">
              <ScrollArea className="max-h-[600px]">
                {assessment.dangerIndicators.map((indicator, i) => {
                  const parsed = parseAspectDescription(indicator.description);
                  const explanation = generatePersonalizedExplanation(
                    indicator.description,
                    chart1Name,
                    chart2Name
                  );
                  
                  return (
                    <div key={i} className="mb-6 last:mb-0 p-4 rounded-xl border bg-background">
                      {/* Pattern Header */}
                      <div className="mb-4">
                        <Badge className={intensityLabels[indicator.severity].color} variant="secondary">
                          {intensityLabels[indicator.severity].label}
                        </Badge>
                        
                        {/* Show the actual relationship dynamic with names */}
                        {parsed && (
                          <div className="mt-3">
                            <div className="text-lg font-semibold text-foreground">
                              {chart1Name}'s {parsed.planet1} {parsed.aspect} {chart2Name}'s {parsed.planet2}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1 font-mono">
                              {parsed.planet1} ({planetSymbols[parsed.planet1] || '?'}) {aspectSymbols[parsed.aspect] || '–'} {parsed.planet2} ({planetSymbols[parsed.planet2] || '?'})
                            </div>
                          </div>
                        )}
                        
                        {!parsed && (
                          <div className="mt-3 text-lg font-semibold text-foreground">
                            {indicator.type}: {indicator.description}
                          </div>
                        )}
                      </div>
                      
                      {/* Planet Meanings - Educational */}
                      {explanation.planetMeanings && (
                        <div className="mb-4 p-3 rounded-lg bg-muted/50 text-xs space-y-1">
                          <div><strong>{parsed?.planet1}:</strong> {explanation.planetMeanings.planet1}</div>
                          <div><strong>{parsed?.planet2}:</strong> {explanation.planetMeanings.planet2}</div>
                        </div>
                      )}
                      
                      {/* What This Means */}
                      <div className="mb-4">
                        <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <Lightbulb size={14} className="text-amber-500" />
                          What this means
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          {explanation.whatThisMeans}
                        </p>
                      </div>
                      
                      {/* How It Shows Up */}
                      <div className="mb-4">
                        <h5 className="font-medium text-sm mb-2">How it can show up</h5>
                        <ul className="space-y-1">
                          {explanation.howItShowsUp.map((item, j) => (
                            <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                              <ArrowRight size={12} className="mt-1 flex-shrink-0 text-muted-foreground/50" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* What to be Aware Of - Personalized */}
                      <div className="mb-4 grid md:grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <h6 className="font-medium text-xs mb-1 text-primary">For {chart1Name}:</h6>
                          <p className="text-xs text-muted-foreground">{explanation.whatToBeAwareOf.forA}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <h6 className="font-medium text-xs mb-1 text-primary">For {chart2Name}:</h6>
                          <p className="text-xs text-muted-foreground">{explanation.whatToBeAwareOf.forB}</p>
                        </div>
                      </div>
                      
                      {/* Growth Opportunity */}
                      <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                        <h5 className="font-medium text-sm mb-1 text-green-700 dark:text-green-300 flex items-center gap-2">
                          <Sparkles size={14} />
                          The growth opportunity
                        </h5>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {explanation.growthOpportunity}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </ScrollArea>
              
              {/* Bottom educational note */}
              <div className="p-4 rounded-lg bg-muted/50 border text-center">
                <p className="text-xs text-muted-foreground">
                  Remember: These patterns describe <em>tendencies</em>, not destinies. 
                  Conscious awareness transforms challenging dynamics into opportunities for growth.
                  Many long-term relationships thrive <em>because of</em> working through difficult aspects together.
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

export default SafetyAssessmentCard;

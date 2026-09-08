import { NatalChart } from '@/hooks/useNatalChart';
import calculateKarmicAnalysis, { KarmicAnalysis } from './karmicAnalysis';
import {
  calculateCompositeChart,
  calculateDavisonChart,
  analyzeCompositeChart,
  analyzeDavisonChart,
  CompositeChart,
  DavisonChart,
  CompositeAnalysis,
  DavisonAnalysis,
  CHART_COMPARISON_GUIDE,
  RELATIONSHIP_ANALYSIS_WORKFLOW
} from './compositeAndDavison';

export type RelationshipFocus = 'romance' | 'business' | 'friendship' | 'family' | 'creative';

export interface ComprehensiveRelationshipAnalysis {
  // Basic Info
  person1Name: string;
  person2Name: string;
  focus: RelationshipFocus;
  analysisDate: Date;

  // Chart Data
  chart1: NatalChart;
  chart2: NatalChart;
  compositeChart: CompositeChart;
  davisonChart?: DavisonChart;

  // Analyzes
  synastryAnalysis: any; // Your existing synastry analysis
  karmicAnalysis: KarmicAnalysis;
  compositeAnalysis: CompositeAnalysis;
  davisonAnalysis?: DavisonAnalysis;

  // Integrated Insights
  overallCompatibility: CompatibilityReport;
  intensityAssessment: IntensityAssessment;
  purposeAlignment: PurposeAlignment;
  recommendations: string[];
  
  // Warnings & Opportunities
  criticalWarnings: string[];
  growthOpportunities: string[];
  relationshipPotential: RelationshipPotential;
}

export interface CompatibilityReport {
  overallScore: number; // 0-100
  categories: {
    emotional: number;
    mental: number;
    physical: number;
    spiritual: number;
    practical: number;
  };
  summary: string;
  topStrengths: string[];
  topChallenges: string[];
}

/**
 * Communication-dynamics model.
 *
 * This replaces the old "safety assessment". A chart cannot indicate danger,
 * abuse or clinical risk, and it must never recommend or discourage professional
 * help. What close Pluto/Saturn/Mars contacts genuinely describe is *intensity*:
 * conversations that escalate quickly and need deliberate handling. That is what
 * this model reports, with no risk score and no verdicts about either person.
 */
export interface IntensityAssessment {
  /** How charged the strongest contacts are — a description, not a warning. */
  intensityLevel: 'high' | 'moderate' | 'low';
  /** 0-100 index of contact intensity. Not a risk or danger score. */
  intensityIndex: number;
  highIntensityDynamics: {
    type: string;
    prominence: 'high' | 'moderate' | 'low';
    description: string;
    /** Practical communication suggestion. Never clinical advice. */
    workingWithIt: string;
  }[];
  supportiveFactors: string[];
  /** True when the pair is likely to benefit from explicit ground rules. */
  benefitsFromExplicitAgreements: boolean;
}

export interface PurposeAlignment {
  aligned: boolean;
  alignmentScore: number; // 0-100
  sharedPurpose: string;
  individualGoals: {
    person1: string;
    person2: string;
  };
  conflictingGoals: string[];
  synergies: string[];
}

export interface RelationshipPotential {
  shortTerm: {
    score: number;
    description: string;
  };
  longTerm: {
    score: number;
    description: string;
  };
  marriagePotential?: {
    score: number;
    considerations: string[];
  };
  businessPotential?: {
    score: number;
    considerations: string[];
  };
  growthPotential: {
    individual: string;
    collective: string;
  };
}

/**
 * MAIN ANALYSIS FUNCTION
 * This is what you call to get the complete professional analysis
 */
export function analyzeRelationship(
  chart1: NatalChart,
  chart2: NatalChart,
  person1Name: string,
  person2Name: string,
  focus: RelationshipFocus,
  birthData?: {
    date1: Date;
    date2: Date;
    lat1: number;
    lon1: number;
    lat2: number;
    lon2: number;
  }
): ComprehensiveRelationshipAnalysis {
  
  // 1. Run your existing synastry analysis
  const synastryAnalysis = {}; // Your existing synastry function here
  
  // 2. Run karmic analysis with focus
  const karmicAnalysis = calculateKarmicAnalysis(chart1, chart2, focus);
  
  // 3. Calculate composite chart
  const compositeChart = calculateCompositeChart(chart1, chart2, person1Name, person2Name);
  const compositeAnalysis = analyzeCompositeChart(compositeChart);
  
  // 4. Calculate Davison if birth data provided
  let davisonChart: DavisonChart | undefined;
  let davisonAnalysis: DavisonAnalysis | undefined;
  
  if (birthData) {
    davisonChart = calculateDavisonChart(
      chart1,
      chart2,
      birthData.date1,
      birthData.date2,
      birthData.lat1,
      birthData.lon1,
      birthData.lat2,
      birthData.lon2,
      person1Name,
      person2Name
    );
    davisonAnalysis = analyzeDavisonChart(davisonChart);
  }
  
  // 5. Assess safety
  const intensityAssessment = assessIntensity(karmicAnalysis, synastryAnalysis);
  
  // 6. Calculate overall compatibility
  const overallCompatibility = calculateOverallCompatibility(
    synastryAnalysis,
    karmicAnalysis,
    compositeAnalysis,
    focus
  );
  
  // 7. Check purpose alignment
  const purposeAlignment = assessPurposeAlignment(
    compositeAnalysis,
    davisonAnalysis,
    focus
  );
  
  // 8. Generate relationship potential assessment
  const relationshipPotential = assessRelationshipPotential(
    overallCompatibility,
    karmicAnalysis,
    compositeAnalysis,
    intensityAssessment,
    focus
  );
  
  // 9. Generate integrated recommendations
  const recommendations = generateRecommendations(
    karmicAnalysis,
    intensityAssessment,
    purposeAlignment,
    focus,
    relationshipPotential
  );
  
  // 10. Compile critical warnings and growth opportunities
  const criticalWarnings = compileCriticalWarnings(
    karmicAnalysis,
    intensityAssessment
  );
  
  const growthOpportunities = compileGrowthOpportunities(
    karmicAnalysis,
    compositeAnalysis,
    davisonAnalysis
  );
  
  return {
    person1Name,
    person2Name,
    focus,
    analysisDate: new Date(),
    chart1,
    chart2,
    compositeChart,
    davisonChart,
    synastryAnalysis,
    karmicAnalysis,
    compositeAnalysis,
    davisonAnalysis,
    overallCompatibility,
    intensityAssessment,
    purposeAlignment,
    relationshipPotential,
    recommendations,
    criticalWarnings,
    growthOpportunities
  };
}

/**
 * Communication-intensity logic (formerly "safety").
 */
function assessIntensity(karmic: KarmicAnalysis, synastry: any): IntensityAssessment {
  const highIntensityDynamics: IntensityAssessment['highIntensityDynamics'] = [];
  let intensityIndex = 0;

  karmic.dangerFlags.forEach(flag => {
    let prominence: 'high' | 'moderate' | 'low' = 'moderate';
    if (flag.includes('Pluto') && (flag.includes('Venus') || flag.includes('Moon'))) {
      prominence = 'high';
      intensityIndex += 30;
    } else if (flag.includes('Saturn') && flag.includes('Moon')) {
      prominence = 'high';
      intensityIndex += 25;
    } else if (flag.includes('8th house') && flag.includes('Multiple')) {
      prominence = 'moderate';
      intensityIndex += 20;
    } else {
      intensityIndex += 15;
    }

    highIntensityDynamics.push({
      type: extractIndicatorType(flag),
      prominence,
      description: flag,
      workingWithIt: getWorkingWithIt(flag)
    });
  });

  const intensityLevel: IntensityAssessment['intensityLevel'] =
    intensityIndex >= 50 ? 'high' : intensityIndex >= 25 ? 'moderate' : 'low';

  return {
    intensityLevel,
    intensityIndex: Math.min(100, intensityIndex),
    highIntensityDynamics,
    supportiveFactors: identifyGreenFlags(karmic, synastry),
    benefitsFromExplicitAgreements: intensityIndex >= 30
  };
}

function extractIndicatorType(flag: string): string {
  if (flag.includes('Pluto')) return 'Power Dynamics';
  if (flag.includes('Saturn')) return 'Caution and commitment';
  if (flag.includes('8th house')) return 'Depth and closeness';
  if (flag.includes('Mars')) return 'Directness and friction';
  return 'High-intensity pattern';
}

function getWorkingWithIt(flag: string): string {
  if (flag.includes('Pluto')) {
    return 'Conversations here can go deep fast. It helps to agree in advance how to pause a heavy talk and come back to it, and to keep other friendships and interests going alongside the relationship.';
  }
  if (flag.includes('Saturn')) {
    return 'Feedback can land heavier than it is meant to. Saying what is meant plainly, and checking how it was heard, does most of the work.';
  }
  if (flag.includes('8th house')) {
    return 'Closeness comes easily here, so deliberately keeping separate routines and outside friendships keeps it comfortable.';
  }
  return 'Naming the pattern out loud when it shows up is usually enough to keep it workable.';
}

function identifyGreenFlags(karmic: KarmicAnalysis, synastry: any): string[] {
  const flags: string[] = [];
  
  // North Node contacts = growth-oriented
  const northNodeContacts = karmic.indicators.filter(i => i.theme === 'soul_growth');
  if (northNodeContacts.length >= 2) {
    flags.push('Multiple North Node contacts - this relationship supports mutual evolution');
  }

  // Healing opportunities
  if (karmic.healingOpportunities.length >= 3) {
    flags.push('Strong healing potential - opportunity to resolve old wounds together');
  }

  // Soul family type
  if (karmic.karmicType === 'soul_family' || karmic.karmicType === 'new_contract') {
    flags.push('Healthy soul connection without heavy karmic baggage');
  }

  return flags;
}

/**
 * Overall Compatibility Calculation
 */
function calculateOverallCompatibility(
  synastry: any,
  karmic: KarmicAnalysis,
  composite: CompositeAnalysis,
  focus: RelationshipFocus
): CompatibilityReport {
  // This would integrate your existing synastry scoring
  // For now, showing the structure:
  
  const categories = {
    emotional: 70, // From synastry Moon aspects + composite Moon
    mental: 80,    // From synastry Mercury aspects + composite Mercury
    physical: 75,  // From synastry Mars/Venus aspects
    spiritual: 85, // From karmic analysis + davison
    practical: 65  // From Saturn aspects + composite purpose
  };

  // Weight categories based on focus
  const weights = getFocusWeights(focus);
  const overallScore = Object.entries(categories).reduce((sum, [key, score]) => {
    return sum + (score * weights[key]);
  }, 0);

  return {
    overallScore: Math.round(overallScore),
    categories,
    summary: generateCompatibilitySummary(overallScore, focus),
    topStrengths: ['Example strength 1', 'Example strength 2'],
    topChallenges: ['Example challenge 1', 'Example challenge 2']
  };
}

function getFocusWeights(focus: RelationshipFocus): Record<string, number> {
  const weights = {
    romance: { emotional: 0.25, mental: 0.15, physical: 0.25, spiritual: 0.20, practical: 0.15 },
    business: { emotional: 0.10, mental: 0.25, physical: 0.05, spiritual: 0.10, practical: 0.50 },
    friendship: { emotional: 0.20, mental: 0.30, physical: 0.05, spiritual: 0.25, practical: 0.20 },
    family: { emotional: 0.30, mental: 0.15, physical: 0.05, spiritual: 0.30, practical: 0.20 },
    creative: { emotional: 0.20, mental: 0.20, physical: 0.15, spiritual: 0.25, practical: 0.20 }
  };
  return weights[focus];
}

function generateCompatibilitySummary(score: number, focus: RelationshipFocus): string {
  if (score >= 80) return `Excellent compatibility for ${focus}. Strong foundation with aligned energies.`;
  if (score >= 65) return `Good compatibility for ${focus}. Solid potential with some areas to navigate.`;
  if (score >= 50) return `Moderate compatibility for ${focus}. Requires conscious effort and understanding.`;
  return `Challenging compatibility for ${focus}. Significant work needed or reconsider fit.`;
}

/**
 * Purpose Alignment Assessment
 */
function assessPurposeAlignment(
  composite: CompositeAnalysis,
  davison: DavisonAnalysis | undefined,
  focus: RelationshipFocus
): PurposeAlignment {
  // Would analyze composite purpose against individual goals
  return {
    aligned: true,
    alignmentScore: 75,
    sharedPurpose: composite.relationshipPurpose,
    individualGoals: {
      person1: 'Individual goal analysis needed',
      person2: 'Individual goal analysis needed'
    },
    conflictingGoals: [],
    synergies: composite.strengths
  };
}

/**
 * Relationship Potential Assessment
 */
function assessRelationshipPotential(
  compatibility: CompatibilityReport,
  karmic: KarmicAnalysis,
  composite: CompositeAnalysis,
  safety: IntensityAssessment,
  focus: RelationshipFocus
): RelationshipPotential {
  
  const shortTermScore = calculateShortTermPotential(compatibility, karmic);
  const longTermScore = calculateLongTermPotential(composite, karmic, safety);

  return {
    shortTerm: {
      score: shortTermScore,
      description: getShortTermDescription(shortTermScore, karmic)
    },
    longTerm: {
      score: longTermScore,
      description: getLongTermDescription(longTermScore, karmic)
    },
    marriagePotential: focus === 'romance' ? {
      score: longTermScore,
      considerations: getMarriageConsiderations(composite, karmic, safety)
    } : undefined,
    businessPotential: focus === 'business' ? {
      score: calculateBusinessPotential(composite, compatibility),
      considerations: getBusinessConsiderations(composite)
    } : undefined,
    growthPotential: {
      individual: 'Individual growth assessment',
      collective: composite.relationshipPurpose
    }
  };
}

function calculateShortTermPotential(compatibility: CompatibilityReport, karmic: KarmicAnalysis): number {
  let score = compatibility.overallScore;
  
  // Intense karmic connections often great short-term
  if (karmic.karmicType === 'catalyst') score += 10;
  if (karmic.karmicType === 'twin_flame') score += 5;
  
  return Math.min(100, score);
}

function calculateLongTermPotential(
  composite: CompositeAnalysis,
  karmic: KarmicAnalysis,
  safety: IntensityAssessment
): number {
  let score = 50;
  
  // High-intensity contacts ask more of the pair; they are not a danger signal.
  if (safety.intensityLevel === 'high') score -= 15;
  else if (safety.intensityLevel === 'moderate') score -= 5;
  else score += 10;
  
  // Karmic type matters
  if (karmic.karmicType === 'soul_family' || karmic.karmicType === 'new_contract') score += 30;
  if (karmic.karmicType === 'completion') score -= 20; // Short-term by nature
  if (karmic.karmicType === 'catalyst') score -= 15; // Often temporary
  
  // Composite longevity indicators
  score += composite.longevityIndicators.length * 5;
  
  return Math.max(0, Math.min(100, score));
}

function getShortTermDescription(score: number, karmic: KarmicAnalysis): string {
  if (score >= 80) return `Excellent short-term potential. ${karmic.timeline.likely_duration}`;
  if (score >= 60) return `Good short-term experience likely. ${karmic.timeline.likely_duration}`;
  return `Challenging short-term dynamics. ${karmic.timeline.likely_duration}`;
}

function getLongTermDescription(score: number, karmic: KarmicAnalysis): string {
  if (score >= 75) return 'Strong long-term potential with conscious work.';
  if (score >= 50) return 'Moderate long-term potential. Success depends on both partners\' commitment to growth.';
  return 'Limited long-term potential. May be meant as shorter-term catalyst or lesson.';
}

function getMarriageConsiderations(
  composite: CompositeAnalysis,
  karmic: KarmicAnalysis,
  safety: IntensityAssessment
): string[] {
  const considerations: string[] = [];
  
  if (safety.benefitsFromExplicitAgreements) {
    considerations.push('Several contacts here are high-intensity, so it is worth agreeing explicitly how you both handle disagreement, money and time apart.');
  }
  
  considerations.push(composite.relationshipPurpose);
  considerations.push(`Karmic type: ${karmic.karmicType} - ${karmic.soulPurpose}`);
  considerations.push(karmic.recommendedApproach);
  
  return considerations;
}

function calculateBusinessPotential(composite: CompositeAnalysis, compatibility: CompatibilityReport): number {
  return compatibility.categories.practical * 0.5 + compatibility.categories.mental * 0.5;
}

function getBusinessConsiderations(composite: CompositeAnalysis): string[] {
  return [
    composite.relationshipPurpose,
    composite.communicationStyle,
    composite.sharedGoals
  ];
}

/**
 * Generate Integrated Recommendations
 */
function generateRecommendations(
  karmic: KarmicAnalysis,
  safety: IntensityAssessment,
  purpose: PurposeAlignment,
  focus: RelationshipFocus,
  potential: RelationshipPotential
): string[] {
  const recommendations: string[] = [];

  // Intensity, described rather than diagnosed. A chart cannot assess safety or
  // recommend clinical support, so it does neither.
  if (safety.intensityLevel === 'high') {
    recommendations.push('Several contacts between these charts are high-intensity, which tends to mean strong reactions in both directions. Agreeing how to pause and resume difficult conversations matters more here than in a low-key pairing.');
  } else if (safety.intensityLevel === 'moderate') {
    recommendations.push('There are a few charged contacts here. Regular, low-stakes check-ins usually keep them from building up.');
  }

  // Karmic guidance
  recommendations.push(karmic.recommendedApproach);

  // Focus-specific recommendations
  recommendations.push(...getFocusSpecificRecommendations(focus, potential, purpose));

  // Timeline awareness
  recommendations.push(`Timeline awareness: ${karmic.timeline.likely_duration}`);
  recommendations.push(`Key lessons: ${karmic.timeline.key_lessons.join(', ')}`);

  return recommendations;
}

function getFocusSpecificRecommendations(
  focus: RelationshipFocus,
  potential: RelationshipPotential,
  purpose: PurposeAlignment
): string[] {
  const recommendations: string[] = [];
  
  switch (focus) {
    case 'romance':
      if (potential.marriagePotential && potential.marriagePotential.score >= 70) {
        recommendations.push('Marriage potential is strong. Focus on: ' + purpose.sharedPurpose);
      }
      break;
    case 'business':
      if (potential.businessPotential && potential.businessPotential.score >= 70) {
        recommendations.push('Business partnership has solid potential. Key: clear roles and communication structures.');
      }
      break;
    // Add other focus types
  }
  
  return recommendations;
}

function compileCriticalWarnings(karmic: KarmicAnalysis, safety: IntensityAssessment): string[] {
  const warnings: string[] = [];
  
  // Things worth naming out loud — patterns to watch, not warnings about people.
  safety.highIntensityDynamics
    .filter(d => d.prominence === 'high')
    .forEach(d => warnings.push(`${d.description} ${d.workingWithIt}`));

  karmic.dangerFlags.forEach(flag => warnings.push(flag));
  
  return warnings;
}

function compileGrowthOpportunities(
  karmic: KarmicAnalysis,
  composite: CompositeAnalysis,
  davison?: DavisonAnalysis
): string[] {
  const opportunities: string[] = [];
  
  opportunities.push(...karmic.healingOpportunities);
  opportunities.push(...composite.strengths);
  
  if (davison) {
    opportunities.push(...davison.spiritualLessons);
  }
  
  return opportunities;
}

/**
 * UI HELPER: Get analysis workflow guide for user
 */
export function getAnalysisWorkflowGuide(): string {
  return RELATIONSHIP_ANALYSIS_WORKFLOW.integrationGuidance;
}

/**
 * UI HELPER: Get chart comparison guide
 */
export function getChartComparisonGuide() {
  return CHART_COMPARISON_GUIDE;
}

export default analyzeRelationship;

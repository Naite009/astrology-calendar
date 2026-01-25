/**
 * Family Relationship Types and Context
 * 
 * Comprehensive type system for family astrology that captures:
 * - Relationship category (parent-child, siblings, etc.)
 * - Direction (who is who)
 * - Generation dynamics
 * - Interpretation context
 */

export type FamilyRelationType = 
  | 'parent-child'
  | 'child-parent'
  | 'siblings'
  | 'grandparent-grandchild'
  | 'grandchild-grandparent'
  | 'aunt-uncle-niece-nephew'
  | 'niece-nephew-aunt-uncle'
  | 'cousins'
  | 'in-law-parent'
  | 'in-law-child'
  | 'in-law-sibling'
  | 'step-parent'
  | 'step-child'
  | 'step-sibling'
  | 'other';

export type FamilyDirection = 
  | 'i-am-elder'      // User is the older/authority figure
  | 'i-am-younger'    // User is the younger/dependent figure
  | 'same-generation' // Peers (siblings, cousins)
  | 'in-law'          // Married into family
  | 'step'            // Blended family
  | 'other';

export type UserRole = 
  | 'parent'
  | 'child'
  | 'older-sibling'
  | 'younger-sibling'
  | 'grandparent'
  | 'grandchild'
  | 'aunt-uncle'
  | 'niece-nephew'
  | 'cousin'
  | 'parent-in-law'
  | 'child-in-law'
  | 'sibling-in-law'
  | 'step-parent'
  | 'step-child'
  | 'step-sibling'
  | 'other';

export interface FamilyRelationshipContext {
  relationType: FamilyRelationType;
  direction: FamilyDirection;
  userRole: UserRole;
  otherPersonRole: UserRole;
  // Display names based on context
  userLabel: string;      // e.g., "You (as parent)"
  otherLabel: string;     // e.g., "Your Daughter"
  relationshipLabel: string; // e.g., "Parent-Child Relationship"
  // Generation info
  generationGap: number;  // 0 = same gen, 1 = one apart, 2 = grandparent, etc.
  isBloodRelated: boolean;
  hasAuthorityDynamic: boolean;
}

// Relationship options for the dropdown
export const FAMILY_RELATIONSHIP_OPTIONS: Array<{
  value: FamilyRelationType;
  label: string;
  description: string;
  hasSubOptions: boolean;
}> = [
  { value: 'parent-child', label: 'Parent → Child (I am the parent)', description: 'You are raising/raised this person', hasSubOptions: false },
  { value: 'child-parent', label: 'Child → Parent (I am the child)', description: 'This person raised/is raising you', hasSubOptions: false },
  { value: 'siblings', label: 'Siblings (same generation)', description: 'Brothers and sisters', hasSubOptions: false },
  { value: 'grandparent-grandchild', label: 'Grandparent → Grandchild', description: 'You are the grandparent', hasSubOptions: false },
  { value: 'grandchild-grandparent', label: 'Grandchild → Grandparent', description: 'You are the grandchild', hasSubOptions: false },
  { value: 'aunt-uncle-niece-nephew', label: 'Aunt/Uncle → Niece/Nephew', description: 'You are the aunt or uncle', hasSubOptions: false },
  { value: 'niece-nephew-aunt-uncle', label: 'Niece/Nephew → Aunt/Uncle', description: 'You are the niece or nephew', hasSubOptions: false },
  { value: 'cousins', label: 'Cousins', description: 'Same generation, different parents', hasSubOptions: false },
  { value: 'in-law-parent', label: 'In-Laws (Parent-in-Law)', description: 'Your spouse\'s parent or your child\'s spouse', hasSubOptions: false },
  { value: 'in-law-child', label: 'In-Laws (Child-in-Law)', description: 'Married to your child', hasSubOptions: false },
  { value: 'in-law-sibling', label: 'In-Laws (Sibling-in-Law)', description: 'Your spouse\'s sibling or sibling\'s spouse', hasSubOptions: false },
  { value: 'step-parent', label: 'Step-Family (Step-Parent)', description: 'You are the step-parent', hasSubOptions: false },
  { value: 'step-child', label: 'Step-Family (Step-Child)', description: 'You are the step-child', hasSubOptions: false },
  { value: 'step-sibling', label: 'Step-Family (Step-Sibling)', description: 'Step-brothers/sisters', hasSubOptions: false },
  { value: 'other', label: 'Other Family Connection', description: 'Extended or unique family bond', hasSubOptions: false }
];

/**
 * Build the full context from relationship type selection
 */
export function buildFamilyContext(
  relationType: FamilyRelationType,
  userName: string,
  otherName: string
): FamilyRelationshipContext {
  const contextMap: Record<FamilyRelationType, Omit<FamilyRelationshipContext, 'userLabel' | 'otherLabel' | 'relationshipLabel'>> = {
    'parent-child': {
      relationType: 'parent-child',
      direction: 'i-am-elder',
      userRole: 'parent',
      otherPersonRole: 'child',
      generationGap: 1,
      isBloodRelated: true,
      hasAuthorityDynamic: true
    },
    'child-parent': {
      relationType: 'child-parent',
      direction: 'i-am-younger',
      userRole: 'child',
      otherPersonRole: 'parent',
      generationGap: 1,
      isBloodRelated: true,
      hasAuthorityDynamic: true
    },
    'siblings': {
      relationType: 'siblings',
      direction: 'same-generation',
      userRole: 'older-sibling', // Default, could be refined
      otherPersonRole: 'younger-sibling',
      generationGap: 0,
      isBloodRelated: true,
      hasAuthorityDynamic: false
    },
    'grandparent-grandchild': {
      relationType: 'grandparent-grandchild',
      direction: 'i-am-elder',
      userRole: 'grandparent',
      otherPersonRole: 'grandchild',
      generationGap: 2,
      isBloodRelated: true,
      hasAuthorityDynamic: true
    },
    'grandchild-grandparent': {
      relationType: 'grandchild-grandparent',
      direction: 'i-am-younger',
      userRole: 'grandchild',
      otherPersonRole: 'grandparent',
      generationGap: 2,
      isBloodRelated: true,
      hasAuthorityDynamic: true
    },
    'aunt-uncle-niece-nephew': {
      relationType: 'aunt-uncle-niece-nephew',
      direction: 'i-am-elder',
      userRole: 'aunt-uncle',
      otherPersonRole: 'niece-nephew',
      generationGap: 1,
      isBloodRelated: true,
      hasAuthorityDynamic: false
    },
    'niece-nephew-aunt-uncle': {
      relationType: 'niece-nephew-aunt-uncle',
      direction: 'i-am-younger',
      userRole: 'niece-nephew',
      otherPersonRole: 'aunt-uncle',
      generationGap: 1,
      isBloodRelated: true,
      hasAuthorityDynamic: false
    },
    'cousins': {
      relationType: 'cousins',
      direction: 'same-generation',
      userRole: 'cousin',
      otherPersonRole: 'cousin',
      generationGap: 0,
      isBloodRelated: true,
      hasAuthorityDynamic: false
    },
    'in-law-parent': {
      relationType: 'in-law-parent',
      direction: 'in-law',
      userRole: 'child-in-law',
      otherPersonRole: 'parent-in-law',
      generationGap: 1,
      isBloodRelated: false,
      hasAuthorityDynamic: true
    },
    'in-law-child': {
      relationType: 'in-law-child',
      direction: 'in-law',
      userRole: 'parent-in-law',
      otherPersonRole: 'child-in-law',
      generationGap: 1,
      isBloodRelated: false,
      hasAuthorityDynamic: true
    },
    'in-law-sibling': {
      relationType: 'in-law-sibling',
      direction: 'in-law',
      userRole: 'sibling-in-law',
      otherPersonRole: 'sibling-in-law',
      generationGap: 0,
      isBloodRelated: false,
      hasAuthorityDynamic: false
    },
    'step-parent': {
      relationType: 'step-parent',
      direction: 'step',
      userRole: 'step-parent',
      otherPersonRole: 'step-child',
      generationGap: 1,
      isBloodRelated: false,
      hasAuthorityDynamic: true
    },
    'step-child': {
      relationType: 'step-child',
      direction: 'step',
      userRole: 'step-child',
      otherPersonRole: 'step-parent',
      generationGap: 1,
      isBloodRelated: false,
      hasAuthorityDynamic: true
    },
    'step-sibling': {
      relationType: 'step-sibling',
      direction: 'step',
      userRole: 'step-sibling',
      otherPersonRole: 'step-sibling',
      generationGap: 0,
      isBloodRelated: false,
      hasAuthorityDynamic: false
    },
    'other': {
      relationType: 'other',
      direction: 'other',
      userRole: 'other',
      otherPersonRole: 'other',
      generationGap: 0,
      isBloodRelated: true,
      hasAuthorityDynamic: false
    }
  };

  const base = contextMap[relationType];
  
  // Generate labels
  const labelMap: Record<FamilyRelationType, { userLabel: string; otherLabel: string; relationshipLabel: string }> = {
    'parent-child': {
      userLabel: `You (as ${userName}'s parent)`,
      otherLabel: `Your Child (${otherName})`,
      relationshipLabel: 'Parent-Child Relationship'
    },
    'child-parent': {
      userLabel: `You (as ${otherName}'s child)`,
      otherLabel: `Your Parent (${otherName})`,
      relationshipLabel: 'Child-Parent Relationship'
    },
    'siblings': {
      userLabel: `You`,
      otherLabel: `Your Sibling (${otherName})`,
      relationshipLabel: 'Sibling Relationship'
    },
    'grandparent-grandchild': {
      userLabel: `You (as grandparent)`,
      otherLabel: `Your Grandchild (${otherName})`,
      relationshipLabel: 'Grandparent-Grandchild Relationship'
    },
    'grandchild-grandparent': {
      userLabel: `You (as grandchild)`,
      otherLabel: `Your Grandparent (${otherName})`,
      relationshipLabel: 'Grandchild-Grandparent Relationship'
    },
    'aunt-uncle-niece-nephew': {
      userLabel: `You (as aunt/uncle)`,
      otherLabel: `Your Niece/Nephew (${otherName})`,
      relationshipLabel: 'Aunt/Uncle-Niece/Nephew Relationship'
    },
    'niece-nephew-aunt-uncle': {
      userLabel: `You (as niece/nephew)`,
      otherLabel: `Your Aunt/Uncle (${otherName})`,
      relationshipLabel: 'Niece/Nephew-Aunt/Uncle Relationship'
    },
    'cousins': {
      userLabel: `You`,
      otherLabel: `Your Cousin (${otherName})`,
      relationshipLabel: 'Cousin Relationship'
    },
    'in-law-parent': {
      userLabel: `You`,
      otherLabel: `Your Parent-in-Law (${otherName})`,
      relationshipLabel: 'In-Law Relationship (Parent)'
    },
    'in-law-child': {
      userLabel: `You`,
      otherLabel: `Your Child-in-Law (${otherName})`,
      relationshipLabel: 'In-Law Relationship (Child)'
    },
    'in-law-sibling': {
      userLabel: `You`,
      otherLabel: `Your Sibling-in-Law (${otherName})`,
      relationshipLabel: 'In-Law Relationship (Sibling)'
    },
    'step-parent': {
      userLabel: `You (as step-parent)`,
      otherLabel: `Your Step-Child (${otherName})`,
      relationshipLabel: 'Step-Parent Relationship'
    },
    'step-child': {
      userLabel: `You (as step-child)`,
      otherLabel: `Your Step-Parent (${otherName})`,
      relationshipLabel: 'Step-Child Relationship'
    },
    'step-sibling': {
      userLabel: `You`,
      otherLabel: `Your Step-Sibling (${otherName})`,
      relationshipLabel: 'Step-Sibling Relationship'
    },
    'other': {
      userLabel: `You`,
      otherLabel: `${otherName}`,
      relationshipLabel: 'Family Relationship'
    }
  };

  const labels = labelMap[relationType];

  return {
    ...base,
    ...labels
  };
}

/**
 * Get family-specific question frameworks
 */
export function getFamilyQuestionFrameworks(context: FamilyRelationshipContext): {
  dynamicsQuestion: string;
  learningQuestion: string;
  evolutionQuestion: string;
  karmicContext: string;
} {
  const { relationType, userRole, otherPersonRole, otherLabel } = context;

  // Parent-Child dynamics
  if (relationType === 'parent-child') {
    return {
      dynamicsQuestion: 'What are the parent-child dynamics between you?',
      learningQuestion: `What is ${otherLabel} here to learn from you as their parent?`,
      evolutionQuestion: 'How does this relationship evolve through the stages: dependency → rebellion → adult connection?',
      karmicContext: 'Parent-child bonds often carry ancestral karma. Patterns you see may have been passed down through generations.'
    };
  }

  if (relationType === 'child-parent') {
    return {
      dynamicsQuestion: 'What are the parent-child dynamics between you?',
      learningQuestion: `What are you here to learn from ${otherLabel}?`,
      evolutionQuestion: 'How does this relationship evolve: from looking up → questioning → understanding?',
      karmicContext: 'Your parent carries ancestral patterns that you may be here to transform or continue. This is generational healing work.'
    };
  }

  // Sibling dynamics
  if (relationType === 'siblings' || relationType === 'step-sibling') {
    return {
      dynamicsQuestion: 'What are the sibling dynamics between you?',
      learningQuestion: 'What childhood patterns are still playing out between you?',
      evolutionQuestion: 'How can you relate as adults rather than replaying childhood roles?',
      karmicContext: 'Sibling relationships show rivalry, comparison, and alliance patterns. The goal is adult equality without childhood competition.'
    };
  }

  // Grandparent dynamics
  if (relationType === 'grandparent-grandchild' || relationType === 'grandchild-grandparent') {
    return {
      dynamicsQuestion: 'What is the special grandparent-grandchild connection?',
      learningQuestion: relationType === 'grandparent-grandchild' 
        ? 'What wisdom are you meant to pass on to this grandchild?'
        : 'What wisdom is this grandparent meant to share with you?',
      evolutionQuestion: 'How does skipping a generation create a unique, less pressured bond?',
      karmicContext: 'Grandparent-grandchild bonds skip the intensity of direct parenting. There\'s often a soul-level recognition without the daily friction.'
    };
  }

  // Extended family
  if (relationType === 'aunt-uncle-niece-nephew' || relationType === 'niece-nephew-aunt-uncle') {
    return {
      dynamicsQuestion: 'What is the special aunt/uncle-niece/nephew dynamic?',
      learningQuestion: 'What perspective does this relationship offer that parents/children can\'t?',
      evolutionQuestion: 'How can you be a supportive influence without parental pressure?',
      karmicContext: 'Extended family offers a safer container for certain lessons—the love without the daily responsibility.'
    };
  }

  // Cousins
  if (relationType === 'cousins') {
    return {
      dynamicsQuestion: 'What is the cousin connection between you?',
      learningQuestion: 'What do you share and what sets you apart?',
      evolutionQuestion: 'How can this relationship grow as adults beyond family gatherings?',
      karmicContext: 'Cousin relationships show family patterns expressed in parallel—you can see your family dynamics reflected sideways.'
    };
  }

  // In-laws
  if (relationType.includes('in-law')) {
    return {
      dynamicsQuestion: 'What are the in-law dynamics between you?',
      learningQuestion: 'What is this relationship teaching you about chosen family?',
      evolutionQuestion: 'How can you build connection beyond obligation?',
      karmicContext: 'In-law relationships are chosen through love for another. They test our ability to expand our definition of family.'
    };
  }

  // Step-family
  if (relationType.includes('step')) {
    return {
      dynamicsQuestion: 'What are the step-family dynamics between you?',
      learningQuestion: 'What is this blended family teaching both of you?',
      evolutionQuestion: 'How can you build authentic connection without forcing traditional roles?',
      karmicContext: 'Step-family relationships create new karma rather than continuing old patterns. You\'re writing a new story together.'
    };
  }

  // Default
  return {
    dynamicsQuestion: 'What are the family dynamics between you?',
    learningQuestion: 'What is this family relationship teaching you?',
    evolutionQuestion: 'How can this relationship continue to evolve?',
    karmicContext: 'Family connections carry deep soul agreements and generational patterns.'
  };
}

/**
 * Get family-specific interpretation for a planetary aspect
 */
export function getFamilyAspectInterpretation(
  planet1: string,
  planet2: string,
  aspect: string,
  context: FamilyRelationshipContext
): {
  interpretation: string;
  forUser: string;
  forOther: string;
  generationalPattern: string;
} {
  const { relationType, userRole, otherLabel, isBloodRelated, hasAuthorityDynamic } = context;
  
  // Pluto-Moon dynamics by family type
  if ((planet1 === 'Pluto' && planet2 === 'Moon') || (planet1 === 'Moon' && planet2 === 'Pluto')) {
    const isUserPluto = planet1 === 'Pluto';
    
    if (relationType === 'parent-child' && isUserPluto) {
      return {
        interpretation: `As the parent, your intensity (Pluto) can overwhelm your child's emotions (Moon). Your transformative power is felt deeply by them.`,
        forUser: `Notice when you're being too controlling or intense about your child's feelings. Their emotions are theirs to have.`,
        forOther: `Your parent's intensity may feel overwhelming at times. You're allowed to have boundaries around your emotional space.`,
        generationalPattern: `This power-emotion dynamic may repeat across generations in your family. Consciousness breaks the chain.`
      };
    }
    
    if (relationType === 'child-parent' && !isUserPluto) {
      return {
        interpretation: `Your parent's intensity (Pluto) triggers deep emotional responses in you. They may push your buttons in ways no one else can.`,
        forUser: `When your parent triggers you deeply, it's often touching old wounds. Not all of it is about them—some is about healing.`,
        forOther: `Your intensity affects your child deeply. What feels normal to you may be overwhelming to them.`,
        generationalPattern: `Your parent learned this intensity from their parent. You can choose to transform it rather than pass it on.`
      };
    }
    
    if (relationType === 'siblings') {
      return {
        interpretation: `Power struggles around emotions between siblings. One may feel dominated or controlled by the other's emotional intensity.`,
        forUser: `Notice if you're trying to control your sibling's emotions or if they're controlling yours. Siblings deserve emotional autonomy.`,
        forOther: `This sibling dynamic involves intensity that may have roots in childhood competition for emotional space in the family.`,
        generationalPattern: `This sibling pattern may mirror your parents' dynamics. You can create a different story.`
      };
    }
  }

  // Saturn dynamics by family type
  if (planet1 === 'Saturn' || planet2 === 'Saturn') {
    if (hasAuthorityDynamic) {
      const elderHasSaturn = (relationType.includes('parent') && userRole === 'parent') ||
                            (relationType.includes('grandparent') && userRole === 'grandparent');
      
      if (elderHasSaturn) {
        return {
          interpretation: `Your authority (Saturn) creates structure but may feel restrictive to ${otherLabel}. The challenge is being firm without being cold.`,
          forUser: `Your role includes teaching limits and boundaries. Make sure your discipline includes warmth and explanation.`,
          forOther: `The authority in this relationship is meant to help you, even when it feels limiting. Over time, you'll understand the lessons.`,
          generationalPattern: `Authority patterns are passed down through families. You can add warmth to the discipline you received.`
        };
      } else {
        return {
          interpretation: `${otherLabel}'s authority (Saturn) shapes your sense of structure and limits. This may feel supportive or restrictive depending on how it's expressed.`,
          forUser: `Authority from family can feel heavy. As an adult, you get to decide which limits serve you and which to outgrow.`,
          forOther: `Your role as the authority figure carries weight. The structure you provide shapes how they understand the world.`,
          generationalPattern: `How you experience authority in this relationship reflects patterns going back generations.`
        };
      }
    }
  }

  // North Node dynamics (destiny patterns)
  if (planet1 === 'NorthNode' || planet2 === 'NorthNode') {
    if (isBloodRelated) {
      return {
        interpretation: `This family connection is part of your soul's evolution. ${otherLabel} helps you grow toward your destiny.`,
        forUser: `This family member is placed in your life to help you develop qualities you're meant to embody. Even friction serves your growth.`,
        forOther: `Your presence in this person's life serves their soul evolution. You may be teaching without even trying.`,
        generationalPattern: `Destiny patterns in families show souls choosing to incarnate together for mutual evolution.`
      };
    }
  }

  // South Node dynamics (past patterns)
  if (planet1 === 'SouthNode' || planet2 === 'SouthNode') {
    if (isBloodRelated) {
      return {
        interpretation: `This family pattern is inherited—it feels familiar because it's been in your family line for generations.`,
        forUser: `You may be continuing a pattern that your parent learned from their parent. Awareness is the first step to transformation.`,
        forOther: `This connection activates patterns that run deep in your family history. You're not starting from scratch—you're working with inheritance.`,
        generationalPattern: `This is literally a pattern that runs in your family. Your parent learned it from THEIR parent. You can be the one who transforms it.`
      };
    }
  }

  // Default interpretation
  return {
    interpretation: `This ${aspect} between ${planet1} and ${planet2} creates a specific dynamic in your ${context.relationshipLabel.toLowerCase()}.`,
    forUser: `Be aware of how this energy plays out in your family dynamic.`,
    forOther: `This aspect affects both of you in the context of your family connection.`,
    generationalPattern: isBloodRelated 
      ? `Blood family patterns often carry generational weight. This may be an inherited dynamic.`
      : `Chosen family (in-law/step) patterns create new karma rather than continuing old.`
  };
}

export default {
  buildFamilyContext,
  getFamilyQuestionFrameworks,
  getFamilyAspectInterpretation,
  FAMILY_RELATIONSHIP_OPTIONS
};

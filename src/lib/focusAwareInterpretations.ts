/**
 * Focus-Aware Interpretations
 * Provides context-specific interpretations for house overlays and karmic connections
 * based on the selected relationship focus (business, friendship, romantic, creative, family)
 */

import { HouseOverlay, KarmicIndicator } from './synastryAdvanced';

export type RelationshipFocus = 'all' | 'romantic' | 'friendship' | 'business' | 'creative' | 'family';

// ============================================
// FOCUS-SPECIFIC HOUSE OVERLAY INTERPRETATIONS
// ============================================

interface FocusHouseInterpretation {
  interpretation: string;
  relevance: 'high' | 'medium' | 'low';
  keyInsight: string;
}

const HOUSE_FOCUS_INTERPRETATIONS: Record<RelationshipFocus, Record<number, Record<string, FocusHouseInterpretation>>> = {
  business: {
    1: {
      Sun: { interpretation: "Their presence elevates your professional visibility and personal brand. They see your leadership potential.", relevance: 'high', keyInsight: 'Strong for co-branding and public-facing partnerships' },
      Moon: { interpretation: "They intuitively understand your professional instincts. This can create seamless collaboration but may blur work-life boundaries.", relevance: 'medium', keyInsight: 'Good for client-facing roles together' },
      Venus: { interpretation: "They appreciate your professional style and presentation. Beneficial for marketing, design, or client relations.", relevance: 'medium', keyInsight: 'Aesthetic collaboration potential' },
      Mars: { interpretation: "They energize your initiative and drive. Good for startups and action-oriented ventures.", relevance: 'high', keyInsight: 'Dynamic business initiators' },
      Jupiter: { interpretation: "They expand your professional identity and opportunities. Lucky for joint ventures.", relevance: 'high', keyInsight: 'Growth catalyst for your brand' },
      Saturn: { interpretation: "They bring structure and accountability to your professional presence. May feel limiting but creates credibility.", relevance: 'high', keyInsight: 'Professional discipline and mentorship' }
    },
    2: {
      Sun: { interpretation: "They illuminate your earning potential and resource management. Good for financial planning together.", relevance: 'high', keyInsight: 'Strengthens financial vision' },
      Moon: { interpretation: "They influence your financial security instincts. Can help or destabilize depending on aspects.", relevance: 'medium', keyInsight: 'Emotional investment in shared finances' },
      Venus: { interpretation: "Shared values around money and resources. Harmonious financial partnership potential.", relevance: 'high', keyInsight: 'Aligned financial values' },
      Mars: { interpretation: "They activate your earning drive. Good for competitive industries or sales.", relevance: 'high', keyInsight: 'Revenue generation energy' },
      Jupiter: { interpretation: "They expand your financial potential. Lucky for investments and growth.", relevance: 'high', keyInsight: 'Financial expansion catalyst' },
      Saturn: { interpretation: "They bring discipline to finances. May feel restrictive but builds long-term security.", relevance: 'high', keyInsight: 'Financial structure and accountability' }
    },
    3: {
      Sun: { interpretation: "They enhance your communication and networking abilities. Great for negotiations and presentations.", relevance: 'high', keyInsight: 'Strong communication synergy' },
      Mercury: { interpretation: "Natural mental connection for business planning and strategy discussions.", relevance: 'high', keyInsight: 'Strategic thinking alignment' },
      Mars: { interpretation: "Stimulating but potentially contentious discussions. Channel into productive debates and problem-solving.", relevance: 'medium', keyInsight: 'Challenging but productive discourse' },
      Jupiter: { interpretation: "Big ideas in communication. Great for marketing, publishing, or educational ventures.", relevance: 'high', keyInsight: 'Expansive communication potential' }
    },
    6: {
      Sun: { interpretation: "They impact your work ethic and daily operations. Good for process improvement.", relevance: 'high', keyInsight: 'Operational excellence support' },
      Mars: { interpretation: "They push your work productivity. Can feel demanding but gets results.", relevance: 'high', keyInsight: 'Productivity driver' },
      Saturn: { interpretation: "Strong work structure together. Excellent for systems and processes.", relevance: 'high', keyInsight: 'Systematic operational partnership' }
    },
    7: {
      Sun: { interpretation: "Strong formal partnership indicator. They embody qualities you seek in a business partner.", relevance: 'high', keyInsight: 'Ideal partner placement for contracts and agreements' },
      Venus: { interpretation: "Harmonious partnership potential. Good for client relations and negotiations.", relevance: 'high', keyInsight: 'Diplomatic partnership energy' },
      Saturn: { interpretation: "Serious, committed partnership. Long-term business relationship potential with clear boundaries.", relevance: 'high', keyInsight: 'Structured, enduring business bond' }
    },
    8: {
      Sun: { interpretation: "They activate shared resources and investments. Good for mergers, acquisitions, or investor relations.", relevance: 'high', keyInsight: 'Shared financial power dynamics' },
      Pluto: { interpretation: "Intense transformation in shared resources. Power dynamics need conscious management.", relevance: 'medium', keyInsight: 'Transformative financial partnership' }
    },
    10: {
      Sun: { interpretation: "They directly impact your career and public reputation. Strong for professional advancement.", relevance: 'high', keyInsight: 'Career elevation potential' },
      Moon: { interpretation: "They emotionally support your career goals. Good for public-facing roles.", relevance: 'medium', keyInsight: 'Emotional career support' },
      Venus: { interpretation: "They enhance your professional image and public appeal. Power couple potential.", relevance: 'high', keyInsight: 'Professional image enhancement' },
      Mars: { interpretation: "They push your career ambitions. May compete or collaborate in public arenas.", relevance: 'high', keyInsight: 'Career drive activation' },
      Jupiter: { interpretation: "Career luck! They expand your professional opportunities and reputation.", relevance: 'high', keyInsight: 'Professional growth catalyst' },
      Saturn: { interpretation: "Career mentor or authority dynamic. Structured professional growth together.", relevance: 'high', keyInsight: 'Professional mentorship' }
    },
    11: {
      Sun: { interpretation: "They fit into your professional network and support long-term business goals.", relevance: 'high', keyInsight: 'Strategic networking ally' },
      Jupiter: { interpretation: "They expand your professional network and future vision for the business.", relevance: 'high', keyInsight: 'Network expansion potential' }
    }
  },
  friendship: {
    1: {
      Sun: { interpretation: "They see and appreciate the real you. Your presence feels affirming to each other.", relevance: 'high', keyInsight: 'Authentic connection' },
      Moon: { interpretation: "They understand your moods and emotional expressions intuitively.", relevance: 'high', keyInsight: 'Emotional attunement' },
      Venus: { interpretation: "Natural affection and appreciation for who you are. Easy companionship.", relevance: 'high', keyInsight: 'Natural affection' },
      Mars: { interpretation: "They energize you but may sometimes clash. Activity partners.", relevance: 'medium', keyInsight: 'Active friendship dynamic' },
      Jupiter: { interpretation: "They make you feel expansive and optimistic about yourself.", relevance: 'high', keyInsight: 'Uplifting presence' }
    },
    3: {
      Sun: { interpretation: "Great conversations! They light up your intellectual world.", relevance: 'high', keyInsight: 'Stimulating dialogue' },
      Moon: { interpretation: "Easy emotional communication. You can share feelings openly.", relevance: 'high', keyInsight: 'Open emotional sharing' },
      Mercury: { interpretation: "Mental rapport is strong. You could talk for hours.", relevance: 'high', keyInsight: 'Natural mental connection' },
      Venus: { interpretation: "Sweet, pleasant communication. Enjoyable conversations.", relevance: 'high', keyInsight: 'Enjoyable conversation' }
    },
    4: {
      Sun: { interpretation: "They feel like family. Deep comfort and belonging.", relevance: 'high', keyInsight: 'Family-like bond' },
      Moon: { interpretation: "Profound emotional safety. They are a refuge.", relevance: 'high', keyInsight: 'Emotional sanctuary' },
      Venus: { interpretation: "Cozy, comfortable togetherness. Home feels sweeter with them.", relevance: 'high', keyInsight: 'Domestic comfort' }
    },
    5: {
      Sun: { interpretation: "Fun and playfulness together! They bring out your creative, joyful side.", relevance: 'high', keyInsight: 'Playful connection' },
      Venus: { interpretation: "Shared pleasures and good times. Activities together are enjoyable.", relevance: 'high', keyInsight: 'Shared enjoyment' },
      Mars: { interpretation: "Adventure and activity partners. Competitive fun.", relevance: 'high', keyInsight: 'Activity partners' },
      Jupiter: { interpretation: "Joy and luck together! Celebrations and good times.", relevance: 'high', keyInsight: 'Joyful expansion' }
    },
    9: {
      Sun: { interpretation: "They expand your worldview. Travel and adventure buddies.", relevance: 'high', keyInsight: 'Adventure companions' },
      Jupiter: { interpretation: "Growth and exploration together. Shared philosophies and journeys.", relevance: 'high', keyInsight: 'Philosophical alignment' }
    },
    11: {
      Sun: { interpretation: "They fit naturally into your social circle and share your vision for the future.", relevance: 'high', keyInsight: 'Social circle integration' },
      Moon: { interpretation: "Emotional investment in your hopes and dreams. Supportive friendship.", relevance: 'high', keyInsight: 'Dream supporter' },
      Venus: { interpretation: "Love through friendship. They appreciate your ideals.", relevance: 'high', keyInsight: 'Idealistic friendship' },
      Jupiter: { interpretation: "They expand your social world and future possibilities.", relevance: 'high', keyInsight: 'Social expansion' },
      Uranus: { interpretation: "Unique, exciting friendship. Never boring together.", relevance: 'high', keyInsight: 'Exciting uniqueness' }
    }
  },
  romantic: {
    1: {
      Sun: { interpretation: "They find you captivating. Strong attraction to your core essence.", relevance: 'high', keyInsight: 'Core attraction' },
      Venus: { interpretation: "They find you beautiful and charming. Natural romantic interest.", relevance: 'high', keyInsight: 'Physical/aesthetic attraction' },
      Mars: { interpretation: "Physical attraction is strong. They want to pursue you.", relevance: 'high', keyInsight: 'Physical magnetism' }
    },
    4: {
      Moon: { interpretation: "Deep emotional bonding potential. Home and family together feels right.", relevance: 'high', keyInsight: 'Domestic partnership potential' },
      Venus: { interpretation: "Love of home life together. Cozy romance.", relevance: 'high', keyInsight: 'Domestic bliss' }
    },
    5: {
      Sun: { interpretation: "Romance and passion! They light up your heart.", relevance: 'high', keyInsight: 'Heart activation' },
      Venus: { interpretation: "Classic romantic placement. Love, pleasure, and creativity together.", relevance: 'high', keyInsight: 'Romantic chemistry' },
      Mars: { interpretation: "Passionate romance. Strong sexual and creative chemistry.", relevance: 'high', keyInsight: 'Passionate attraction' },
      Jupiter: { interpretation: "Joy and abundance in love. Lucky romance.", relevance: 'high', keyInsight: 'Lucky love' }
    },
    7: {
      Sun: { interpretation: "Strong partnership indicator. They embody your relationship ideals.", relevance: 'high', keyInsight: 'Partnership potential' },
      Moon: { interpretation: "Emotional partnership needs are met. Deep relational bonding.", relevance: 'high', keyInsight: 'Emotional partnership' },
      Venus: { interpretation: "Ideal partner placement. Strong marriage potential.", relevance: 'high', keyInsight: 'Marriage indicator' },
      Mars: { interpretation: "Partnership drive. Passionate commitment.", relevance: 'high', keyInsight: 'Active commitment' }
    },
    8: {
      Sun: { interpretation: "Intense, transformative love. Deep psychological bonding.", relevance: 'high', keyInsight: 'Transformative intimacy' },
      Moon: { interpretation: "Deep emotional and physical intimacy. Soul-level connection.", relevance: 'high', keyInsight: 'Soul intimacy' },
      Venus: { interpretation: "Intense, passionate love. Magnetic attraction and deep bonding.", relevance: 'high', keyInsight: 'Magnetic passion' },
      Mars: { interpretation: "Powerful sexual chemistry. Intense desire.", relevance: 'high', keyInsight: 'Sexual intensity' },
      Pluto: { interpretation: "Transformative, all-consuming passion. Life-changing love.", relevance: 'high', keyInsight: 'Transformative passion' }
    }
  },
  creative: {
    1: {
      Sun: { interpretation: "They inspire your creative self-expression. Your presence sparks their creativity too.", relevance: 'high', keyInsight: 'Mutual creative inspiration' },
      Venus: { interpretation: "Aesthetic harmony. They appreciate your creative style.", relevance: 'high', keyInsight: 'Aesthetic alignment' },
      Neptune: { interpretation: "They inspire your imagination and artistic vision.", relevance: 'high', keyInsight: 'Imaginative inspiration' }
    },
    3: {
      Mercury: { interpretation: "Ideas flow between you. Great for writing, communication arts.", relevance: 'high', keyInsight: 'Creative communication' },
      Venus: { interpretation: "Beautiful words together. Harmonious creative dialogue.", relevance: 'high', keyInsight: 'Artistic dialogue' },
      Neptune: { interpretation: "Imaginative communication. Poetry and dreamlike expression.", relevance: 'high', keyInsight: 'Poetic expression' }
    },
    5: {
      Sun: { interpretation: "Creative fire together! They activate your artistic expression.", relevance: 'high', keyInsight: 'Creative activation' },
      Venus: { interpretation: "Artistic collaboration flows naturally. Shared creative pleasures.", relevance: 'high', keyInsight: 'Artistic harmony' },
      Mars: { interpretation: "Creative drive and passion. Bold artistic expression together.", relevance: 'high', keyInsight: 'Bold creativity' },
      Neptune: { interpretation: "Dreamlike creative inspiration. Music, art, and imagination.", relevance: 'high', keyInsight: 'Imaginative artistry' }
    },
    9: {
      Jupiter: { interpretation: "Big creative visions. Publishing, teaching, sharing art with the world.", relevance: 'high', keyInsight: 'Expansive creative vision' },
      Neptune: { interpretation: "Spiritual and philosophical inspiration for creative work.", relevance: 'high', keyInsight: 'Spiritual creativity' }
    },
    12: {
      Neptune: { interpretation: "Deep subconscious creative connection. Channeled art and music.", relevance: 'high', keyInsight: 'Channeled creativity' },
      Venus: { interpretation: "Hidden or spiritual creative bond. Art as healing.", relevance: 'high', keyInsight: 'Healing art' }
    }
  },
  family: {
    1: {
      Sun: { interpretation: "They see you clearly as an individual within the family context.", relevance: 'high', keyInsight: 'Individual recognition' },
      Moon: { interpretation: "Deep emotional understanding within family dynamics.", relevance: 'high', keyInsight: 'Emotional attunement' }
    },
    4: {
      Sun: { interpretation: "Strong family connection. Home and heritage are important between you.", relevance: 'high', keyInsight: 'Home and heritage bond' },
      Moon: { interpretation: "Profound family bond. Emotional safety and belonging.", relevance: 'high', keyInsight: 'Deep family connection' },
      Saturn: { interpretation: "Family responsibility and structure. Generational patterns.", relevance: 'high', keyInsight: 'Generational responsibility' }
    },
    5: {
      Sun: { interpretation: "Joy and play within family. Creative expression together.", relevance: 'high', keyInsight: 'Family joy' },
      Moon: { interpretation: "Nurturing playfulness. Emotional creativity in family.", relevance: 'high', keyInsight: 'Nurturing play' }
    },
    6: {
      Saturn: { interpretation: "Daily family routines and responsibilities. Service to each other.", relevance: 'medium', keyInsight: 'Daily care routines' }
    },
    10: {
      Saturn: { interpretation: "Family authority dynamics. Parental influence.", relevance: 'high', keyInsight: 'Authority and parenting' },
      Sun: { interpretation: "Family pride and legacy. Carrying forward the family name.", relevance: 'high', keyInsight: 'Family legacy' }
    },
    12: {
      Moon: { interpretation: "Subconscious family patterns. Ancestral healing.", relevance: 'high', keyInsight: 'Ancestral patterns' },
      Saturn: { interpretation: "Hidden family karma. Generational healing work.", relevance: 'medium', keyInsight: 'Generational karma' }
    }
  },
  all: {} // No specific filtering for 'all' focus
};

// ============================================
// FOCUS-SPECIFIC KARMIC INTERPRETATIONS
// ============================================

const KARMIC_FOCUS_INTERPRETATIONS: Record<RelationshipFocus, Record<string, { relevance: 'high' | 'medium' | 'low'; focusedInterpretation: string }>> = {
  business: {
    'NorthNode-Sun': { relevance: 'high', focusedInterpretation: 'Fated professional partnership. This person represents your business destiny path—they show you who you can become professionally.' },
    'NorthNode-Saturn': { relevance: 'high', focusedInterpretation: 'Karmic business mentor. They teach you the structures and disciplines needed for professional success.' },
    'Saturn-Venus': { relevance: 'medium', focusedInterpretation: 'Lessons around value and worth in professional contexts. Learning to balance what you appreciate with what is practical.' },
    'Chiron-Mercury': { relevance: 'high', focusedInterpretation: 'Healing around professional communication and ideas. They help you overcome imposter syndrome or speaking up in business contexts.' }
  },
  friendship: {
    'NorthNode-Moon': { relevance: 'high', focusedInterpretation: 'Fated emotional connection. This friendship is meant to nurture your soul growth and emotional development.' },
    'NorthNode-Venus': { relevance: 'high', focusedInterpretation: 'Destined to appreciate each other. This friendship brings joy and helps you understand what you truly value.' },
    'Chiron-Moon': { relevance: 'high', focusedInterpretation: 'Healing old emotional wounds through friendship. They help you feel safe to be vulnerable.' },
    'Chiron-Sun': { relevance: 'high', focusedInterpretation: 'They see your wounds but also your potential. A healing friendship that helps you become more yourself.' }
  },
  romantic: {
    'NorthNode-Venus': { relevance: 'high', focusedInterpretation: 'FATED LOVE. This is one of the strongest indicators that you are meant to experience this love as part of your soul evolution.' },
    'NorthNode-Moon': { relevance: 'high', focusedInterpretation: 'Emotionally destined connection. This relationship nurtures your deepest soul needs.' },
    'Chiron-Venus': { relevance: 'high', focusedInterpretation: 'Healing love wounds. This relationship helps you overcome past romantic trauma and learn to receive love.' },
    'Saturn-Venus': { relevance: 'high', focusedInterpretation: 'Karmic love lessons. Learning about commitment, worthiness, and mature love together.' },
    'Pluto-Moon': { relevance: 'high', focusedInterpretation: 'Transformative emotional bond. Deep psychological intimacy that changes you both.' }
  },
  creative: {
    'NorthNode-Neptune': { relevance: 'high', focusedInterpretation: 'Destined creative inspiration. This connection awakens your artistic and spiritual potential.' },
    'NorthNode-Venus': { relevance: 'high', focusedInterpretation: 'Fated aesthetic and creative partnership. You help each other discover beauty and artistic expression.' },
    'Chiron-Venus': { relevance: 'high', focusedInterpretation: 'Healing through creative expression together. Art as medicine for old wounds.' },
    'Neptune-Venus': { relevance: 'high', focusedInterpretation: 'Spiritual and artistic union. Creating beauty that transcends the ordinary.' }
  },
  family: {
    'NorthNode-Moon': { relevance: 'high', focusedInterpretation: 'Karmic family bond. This family connection is meant to teach you about emotional security and nurturing.' },
    'NorthNode-Saturn': { relevance: 'high', focusedInterpretation: 'Family karma around responsibility. Learning about duty, structure, and generational patterns.' },
    'Chiron-Moon': { relevance: 'high', focusedInterpretation: 'Healing family wounds. This connection helps process ancestral emotional patterns.' },
    'SouthNode-Saturn': { relevance: 'medium', focusedInterpretation: 'Past-life family karma. Familiar patterns of responsibility and restriction from other lifetimes.' }
  },
  all: {}
};

// ============================================
// FUNCTIONS
// ============================================

export function getHouseOverlayForFocus(overlay: HouseOverlay, focus: RelationshipFocus): HouseOverlay & { focusRelevance: 'high' | 'medium' | 'low'; focusInterpretation: string } {
  if (focus === 'all') {
    return { ...overlay, focusRelevance: 'medium', focusInterpretation: overlay.interpretation };
  }

  const focusData = HOUSE_FOCUS_INTERPRETATIONS[focus]?.[overlay.house]?.[overlay.planet];
  
  if (focusData) {
    return {
      ...overlay,
      focusRelevance: focusData.relevance,
      focusInterpretation: `${focusData.interpretation} (${focusData.keyInsight})`
    };
  }

  // Determine default relevance based on house for this focus
  const highRelevanceHouses: Record<RelationshipFocus, number[]> = {
    business: [2, 6, 7, 8, 10],
    friendship: [3, 5, 9, 11],
    romantic: [1, 5, 7, 8],
    creative: [3, 5, 9, 12],
    family: [4, 6, 10, 12],
    all: []
  };

  const isHighRelevanceHouse = highRelevanceHouses[focus].includes(overlay.house);
  
  return {
    ...overlay,
    focusRelevance: isHighRelevanceHouse ? 'medium' : 'low',
    focusInterpretation: overlay.interpretation
  };
}

export function filterHouseOverlaysForFocus(overlays: HouseOverlay[], focus: RelationshipFocus): (HouseOverlay & { focusRelevance: 'high' | 'medium' | 'low'; focusInterpretation: string })[] {
  const enhanced = overlays.map(o => getHouseOverlayForFocus(o, focus));
  
  if (focus === 'all') {
    return enhanced;
  }
  
  // Sort by relevance and filter out low relevance
  return enhanced
    .filter(o => o.focusRelevance !== 'low')
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.focusRelevance] - order[b.focusRelevance];
    });
}

export function getKarmicIndicatorForFocus(indicator: KarmicIndicator, focus: RelationshipFocus): KarmicIndicator & { focusRelevance: 'high' | 'medium' | 'low'; focusInterpretation: string } {
  if (focus === 'all') {
    return { ...indicator, focusRelevance: 'high', focusInterpretation: indicator.interpretation };
  }

  // Build key from planets
  const key1 = `${indicator.planet1}-${indicator.planet2}`;
  const key2 = `${indicator.planet2}-${indicator.planet1}`;
  
  const focusData = KARMIC_FOCUS_INTERPRETATIONS[focus]?.[key1] || KARMIC_FOCUS_INTERPRETATIONS[focus]?.[key2];
  
  if (focusData) {
    return {
      ...indicator,
      focusRelevance: focusData.relevance,
      focusInterpretation: focusData.focusedInterpretation
    };
  }

  // Default based on focus type
  const highRelevancePlanets: Record<RelationshipFocus, string[]> = {
    business: ['Saturn', 'Jupiter', 'Mercury', 'NorthNode'],
    friendship: ['Moon', 'Mercury', 'Venus', 'Jupiter', 'NorthNode'],
    romantic: ['Venus', 'Mars', 'Moon', 'NorthNode', 'Chiron', 'Pluto'],
    creative: ['Neptune', 'Venus', 'Uranus', 'NorthNode'],
    family: ['Moon', 'Saturn', 'NorthNode', 'SouthNode', 'Chiron'],
    all: []
  };

  const relevantPlanets = highRelevancePlanets[focus];
  const hasRelevantPlanet = relevantPlanets.includes(indicator.planet1) || relevantPlanets.includes(indicator.planet2);

  return {
    ...indicator,
    focusRelevance: hasRelevantPlanet ? 'medium' : 'low',
    focusInterpretation: indicator.interpretation
  };
}

export function filterKarmicIndicatorsForFocus(indicators: KarmicIndicator[], focus: RelationshipFocus): (KarmicIndicator & { focusRelevance: 'high' | 'medium' | 'low'; focusInterpretation: string })[] {
  const enhanced = indicators.map(i => getKarmicIndicatorForFocus(i, focus));
  
  if (focus === 'all') {
    return enhanced;
  }
  
  return enhanced
    .filter(i => i.focusRelevance !== 'low')
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.focusRelevance] - order[b.focusRelevance];
    });
}

// ============================================
// FOCUS-SPECIFIC SUMMARIES
// ============================================

export function generateFocusedSoulContractTheme(
  originalTheme: string, 
  focus: RelationshipFocus,
  chart1Name: string,
  chart2Name: string
): string {
  const focusPrefixes: Record<RelationshipFocus, string> = {
    all: originalTheme,
    business: `Business Soul Contract: ${chart1Name} and ${chart2Name} have come together to learn professional lessons around `,
    friendship: `Friendship Soul Contract: ${chart1Name} and ${chart2Name} share a soul agreement for mutual growth through companionship, teaching each other about `,
    romantic: `Romantic Soul Contract: ${chart1Name} and ${chart2Name} have a love agreement across lifetimes, here to explore `,
    creative: `Creative Soul Contract: ${chart1Name} and ${chart2Name} are meant to create together, channeling their connection into `,
    family: `Family Soul Contract: ${chart1Name} and ${chart2Name} share ancestral karma, working through generational patterns of `
  };

  if (focus === 'all') {
    return originalTheme;
  }

  // Extract the core theme and reframe it
  const coreTheme = originalTheme.toLowerCase();
  
  if (coreTheme.includes('growth') || coreTheme.includes('expansion')) {
    return focusPrefixes[focus] + 'expansion and mutual empowerment.';
  } else if (coreTheme.includes('healing') || coreTheme.includes('wound')) {
    return focusPrefixes[focus] + 'healing past patterns and supporting each other\'s wholeness.';
  } else if (coreTheme.includes('karmic') || coreTheme.includes('past life')) {
    return focusPrefixes[focus] + 'resolving unfinished business from other lifetimes.';
  } else if (coreTheme.includes('teaching') || coreTheme.includes('learning')) {
    return focusPrefixes[focus] + 'teaching and learning from each other\'s experiences.';
  }

  return focusPrefixes[focus] + 'mutual evolution and shared purpose.';
}

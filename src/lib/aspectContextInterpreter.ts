// Contextual Aspect Interpreter - explains WHY aspects work the way they do based on sign/house

export interface ContextualAspectExplanation {
  whyTensionExists: string;
  howItManifests: string;
  whatHelps: string[];
  othersPerceive: string;
}

// Sign element and modality for context
const SIGN_ELEMENTS: Record<string, 'fire' | 'earth' | 'air' | 'water'> = {
  Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
  Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
  Gemini: 'air', Libra: 'air', Aquarius: 'air',
  Cancer: 'water', Scorpio: 'water', Pisces: 'water',
};

const SIGN_MODALITIES: Record<string, 'cardinal' | 'fixed' | 'mutable'> = {
  Aries: 'cardinal', Cancer: 'cardinal', Libra: 'cardinal', Capricorn: 'cardinal',
  Taurus: 'fixed', Leo: 'fixed', Scorpio: 'fixed', Aquarius: 'fixed',
  Gemini: 'mutable', Virgo: 'mutable', Sagittarius: 'mutable', Pisces: 'mutable',
};

const SIGN_KEYWORDS: Record<string, { mode: string; desire: string; approach: string }> = {
  Aries: { mode: 'initiating action', desire: 'to be first, to conquer', approach: 'direct and impulsive' },
  Taurus: { mode: 'building stability', desire: 'to possess and enjoy', approach: 'slow, sensual, and persistent' },
  Gemini: { mode: 'gathering information', desire: 'to learn and communicate', approach: 'curious and adaptable' },
  Cancer: { mode: 'nurturing emotionally', desire: 'to protect and belong', approach: 'indirect and protective' },
  Leo: { mode: 'expressing creatively', desire: 'to shine and be recognized', approach: 'dramatic and generous' },
  Virgo: { mode: 'analyzing and improving', desire: 'to perfect and serve', approach: 'precise and critical' },
  Libra: { mode: 'relating to others', desire: 'to harmonize and partner', approach: 'diplomatic and aesthetic' },
  Scorpio: { mode: 'transforming intensely', desire: 'to merge and empower', approach: 'deep and investigative' },
  Sagittarius: { mode: 'expanding horizons', desire: 'to explore and understand meaning', approach: 'optimistic and philosophical' },
  Capricorn: { mode: 'achieving mastery', desire: 'to succeed and lead', approach: 'disciplined and ambitious' },
  Aquarius: { mode: 'innovating systems', desire: 'to reform and liberate', approach: 'detached and progressive' },
  Pisces: { mode: 'transcending boundaries', desire: 'to merge spiritually', approach: 'empathic and imaginative' },
};

const HOUSE_ARENAS: Record<number, { arena: string; lifeArea: string; concerns: string }> = {
  1: { arena: 'self-presentation', lifeArea: 'identity and appearance', concerns: 'how you show up in the world' },
  2: { arena: 'resources and values', lifeArea: 'money and self-worth', concerns: 'what you possess and value' },
  3: { arena: 'communication and learning', lifeArea: 'siblings, neighbors, early education', concerns: 'daily exchanges and mental activity' },
  4: { arena: 'home and roots', lifeArea: 'family, ancestry, emotional foundation', concerns: 'private life and inner security' },
  5: { arena: 'creativity and pleasure', lifeArea: 'romance, children, self-expression', concerns: 'what you create and enjoy' },
  6: { arena: 'service and health', lifeArea: 'work routines, wellness, daily rituals', concerns: 'what you improve and maintain' },
  7: { arena: 'partnerships', lifeArea: 'marriage, contracts, open enemies', concerns: 'how you relate one-on-one' },
  8: { arena: 'transformation and shared resources', lifeArea: 'death, taxes, intimacy, others\' money', concerns: 'what you merge with others' },
  9: { arena: 'expansion and belief', lifeArea: 'travel, higher education, philosophy', concerns: 'your worldview and meaning-making' },
  10: { arena: 'career and reputation', lifeArea: 'public life, authority, achievement', concerns: 'your legacy and public role' },
  11: { arena: 'community and hopes', lifeArea: 'friends, groups, future visions', concerns: 'your place in the collective' },
  12: { arena: 'transcendence and hidden matters', lifeArea: 'spirituality, isolation, the unconscious', concerns: 'what you must release or surrender' },
};

const PLANET_NATURE: Record<string, { essence: string; wants: string; style: string }> = {
  Sun: { essence: 'core identity', wants: 'to shine and be recognized', style: 'direct and confident' },
  Moon: { essence: 'emotional needs', wants: 'security and nurturing', style: 'responsive and protective' },
  Mercury: { essence: 'mind and communication', wants: 'to understand and connect', style: 'curious and articulate' },
  Venus: { essence: 'love and values', wants: 'harmony and pleasure', style: 'receptive and aesthetic' },
  Mars: { essence: 'drive and action', wants: 'to assert and conquer', style: 'direct and competitive' },
  Jupiter: { essence: 'expansion and meaning', wants: 'growth and wisdom', style: 'generous and optimistic' },
  Saturn: { essence: 'structure and mastery', wants: 'achievement through discipline', style: 'cautious and authoritative' },
  Uranus: { essence: 'liberation and innovation', wants: 'freedom and originality', style: 'sudden and unconventional' },
  Neptune: { essence: 'transcendence and imagination', wants: 'spiritual connection', style: 'subtle and dissolving' },
  Pluto: { essence: 'transformation and power', wants: 'deep change and empowerment', style: 'intense and regenerative' },
  Chiron: { essence: 'wounds and healing', wants: 'to heal and teach', style: 'vulnerable yet wise' },
  'North Node': { essence: 'soul growth direction', wants: 'evolutionary development', style: 'uncomfortable but necessary' },
  'South Node': { essence: 'past patterns', wants: 'familiar territory', style: 'comfortable but limiting' },
  Ascendant: { essence: 'how you appear', wants: 'authentic self-presentation', style: 'your interface with the world' },
  Midheaven: { essence: 'public purpose', wants: 'recognition and legacy', style: 'how you achieve' },
};

export function getContextualAspectExplanation(
  planet1: string,
  sign1: string,
  house1: number,
  planet2: string,
  sign2: string,
  house2: number,
  aspectType: string
): ContextualAspectExplanation {
  const p1 = PLANET_NATURE[planet1] || { essence: planet1.toLowerCase(), wants: 'expression', style: 'unique' };
  const p2 = PLANET_NATURE[planet2] || { essence: planet2.toLowerCase(), wants: 'expression', style: 'unique' };
  
  const s1 = SIGN_KEYWORDS[sign1] || { mode: sign1.toLowerCase(), desire: 'expression', approach: 'unique' };
  const s2 = SIGN_KEYWORDS[sign2] || { mode: sign2.toLowerCase(), desire: 'expression', approach: 'unique' };
  
  const h1 = HOUSE_ARENAS[house1] || { arena: `house ${house1}`, lifeArea: 'life area', concerns: 'concerns' };
  const h2 = HOUSE_ARENAS[house2] || { arena: `house ${house2}`, lifeArea: 'life area', concerns: 'concerns' };
  
  const elem1 = SIGN_ELEMENTS[sign1] || 'unknown';
  const elem2 = SIGN_ELEMENTS[sign2] || 'unknown';
  const mod1 = SIGN_MODALITIES[sign1] || 'unknown';
  const mod2 = SIGN_MODALITIES[sign2] || 'unknown';

  switch (aspectType) {
    case 'quincunx':
      return getQuincunxExplanation(planet1, p1, sign1, s1, house1, h1, planet2, p2, sign2, s2, house2, h2, elem1, elem2);
    case 'opposition':
      return getOppositionExplanation(planet1, p1, sign1, s1, house1, h1, planet2, p2, sign2, s2, house2, h2);
    case 'conjunction':
      return getConjunctionExplanation(planet1, p1, sign1, s1, house1, h1, planet2, p2, sign2, s2, house2, h2);
    case 'square':
      return getSquareExplanation(planet1, p1, sign1, s1, house1, h1, planet2, p2, sign2, s2, house2, h2, mod1, mod2);
    case 'trine':
      return getTrineExplanation(planet1, p1, sign1, s1, house1, h1, planet2, p2, sign2, s2, house2, h2, elem1, elem2);
    case 'sextile':
      return getSextileExplanation(planet1, p1, sign1, s1, house1, h1, planet2, p2, sign2, s2, house2, h2);
    default:
      return getGenericExplanation(planet1, p1, sign1, s1, house1, h1, planet2, p2, sign2, s2, house2, h2, aspectType);
  }
}

function getQuincunxExplanation(
  planet1: string, p1: any, sign1: string, s1: any, house1: number, h1: any,
  planet2: string, p2: any, sign2: string, s2: any, house2: number, h2: any,
  elem1: string, elem2: string
): ContextualAspectExplanation {
  // Quincunx signs share nothing - different element AND modality
  const elementClash = elem1 !== elem2 ? 
    `${sign1} operates through ${elem1} (${elem1 === 'fire' ? 'action and inspiration' : elem1 === 'earth' ? 'material reality' : elem1 === 'air' ? 'ideas and communication' : 'feelings and intuition'}) while ${sign2} works through ${elem2} (${elem2 === 'fire' ? 'action and inspiration' : elem2 === 'earth' ? 'material reality' : elem2 === 'air' ? 'ideas and communication' : 'feelings and intuition'})—they literally speak different languages.` :
    `Though they share an element, their timing and approach are fundamentally mismatched.`;

  return {
    whyTensionExists: `Your ${planet1} in ${sign1} (${h1.arena}) and ${planet2} in ${sign2} (${h2.arena}) don't share any common ground. ${planet1} expresses through ${s1.mode}—${s1.approach}—while ${planet2} operates through ${s2.mode}—${s2.approach}. ${elementClash} The ${h1.arena} and ${h2.arena} feel like separate departments that never coordinate. This creates that classic quincunx feeling: "Why can't I have BOTH?"`,
    
    howItManifests: `When you pursue ${p1.wants} through ${sign1}'s style in ${h1.lifeArea}, it somehow undermines your ${planet2} needs. Conversely, attending to ${p2.wants} in ${h2.lifeArea} creates blind spots in ${h1.concerns}. You may experience this as chronic dissatisfaction, mysterious health issues connected to the tension between these life areas, or timing problems—opportunities arise in one area just when you're committed to the other.`,
    
    whatHelps: [
      `Accept that you can't satisfy both simultaneously—alternate consciously rather than trying to merge them`,
      `Build "translation rituals" between these energies: after focusing on ${h1.arena}, take a moment to honor ${h2.arena} before switching`,
      `Use the irritation as a signal—when you feel that "something's off," check which of these needs you're neglecting`,
      `Schedule dedicated time for each area rather than expecting them to cooperate naturally`,
      `The healing comes through conscious adjustment, not resolution—this aspect asks you to become skilled at pivoting between incompatible modes`
    ],
    
    othersPerceive: `Others may see you as inconsistent or hard to pin down when these energies activate. One moment you're expressing ${sign1}'s ${s1.approach} style, the next you shift unexpectedly to ${sign2}'s ${s2.approach} mode. This can seem erratic, but it's actually sophisticated adaptation—you're managing energies that don't blend naturally.`
  };
}

function getOppositionExplanation(
  planet1: string, p1: any, sign1: string, s1: any, house1: number, h1: any,
  planet2: string, p2: any, sign2: string, s2: any, house2: number, h2: any
): ContextualAspectExplanation {
  return {
    whyTensionExists: `Your ${planet1} in ${sign1} (${h1.arena}) sits directly across the zodiac from ${planet2} in ${sign2} (${h2.arena}). Opposition signs are actually deeply related—${sign1} and ${sign2} are two sides of the same axis, sharing a modality but opposite elements. ${planet1}'s drive ${p1.wants} is constantly aware of ${planet2}'s need ${p2.wants}. The ${h1.arena} and ${h2.arena} are natural partners that must learn to share resources rather than compete.`,
    
    howItManifests: `You may experience this opposition as an inner tug-of-war between ${h1.concerns} and ${h2.concerns}. More often, you PROJECT one end onto others: you might identify strongly with ${planet1} in ${sign1} while attracting partners, friends, or situations that embody ${planet2} in ${sign2}. Relationships become the classroom where you learn to integrate both. When balanced, oppositions create tremendous awareness—you see both perspectives with unusual clarity.`,
    
    whatHelps: [
      `Own both sides consciously—notice when you're projecting ${planet2}'s qualities onto others instead of expressing them yourself`,
      `When in conflict with someone, ask: "What quality in them am I refusing to own in myself?"`,
      `Use the opposition like a seesaw—extremes in one direction will trigger the other`,
      `Practice the "both/and" mindset: you need ${s1.mode} AND ${s2.mode}, not one or the other`,
      `Relationships are your teacher—what you attract reflects what you're learning to integrate`
    ],
    
    othersPerceive: `Others often experience you as seeking balance, sometimes to the point of ambivalence. They may sense you're pulled in two directions. In relationships, they feel a complementary or challenging dynamic—you tend to attract what you need to integrate. Your ${planet1} side draws out their ${planet2} qualities and vice versa.`
  };
}

function getConjunctionExplanation(
  planet1: string, p1: any, sign1: string, s1: any, house1: number, h1: any,
  planet2: string, p2: any, sign2: string, s2: any, house2: number, h2: any
): ContextualAspectExplanation {
  return {
    whyTensionExists: `Your ${planet1} and ${planet2} are fused in ${sign1}—they can't act independently. ${planet1}'s ${p1.essence} is permanently colored by ${planet2}'s ${p2.essence}. This isn't tension in the usual sense; it's intensity. Everything involving ${p1.wants} automatically involves ${p2.wants}. In the ${h1.arena}, these merged energies express as one powerful force.`,
    
    howItManifests: `You can't access ${planet1} without ${planet2} coming along. When your ${p1.essence} is activated, ${p2.style} is immediately present. This creates concentration of power in ${h1.lifeArea}—you have amplified energy here, for better or worse. The challenge is lack of perspective; you can't step back and see these as separate drives because they've never been separate for you.`,
    
    whatHelps: [
      `Recognize this fusion as a strength—concentrated energy is powerful when directed`,
      `Develop awareness of how ${planet2} always colors your ${planet1} expression`,
      `Give this combined energy adequate outlets—suppressing one means suppressing both`,
      `Seek feedback from others about how this conjunction appears from outside`,
      `Use the intensity consciously in ${h1.lifeArea} rather than letting it overwhelm`
    ],
    
    othersPerceive: `Others experience you as intense in ${h1.arena} matters. Your ${planet1} has unmistakable ${planet2} undertones. This can be charismatic or overwhelming depending on how you wield it. People notice the concentration of energy and respond accordingly—they may be drawn to or intimidated by this focused power.`
  };
}

function getSquareExplanation(
  planet1: string, p1: any, sign1: string, s1: any, house1: number, h1: any,
  planet2: string, p2: any, sign2: string, s2: any, house2: number, h2: any,
  mod1: string, mod2: string
): ContextualAspectExplanation {
  return {
    whyTensionExists: `Your ${planet1} in ${sign1} and ${planet2} in ${sign2} share the same modality (${mod1})—they're both trying to be ${mod1 === 'cardinal' ? 'first to act' : mod1 === 'fixed' ? 'in control' : 'adaptable'}, but through incompatible elements. ${planet1}'s ${p1.wants} and ${planet2}'s ${p2.wants} compete for the same timing and resources. The ${h1.arena} and ${h2.arena} create friction: progress in one seems to block progress in the other.`,
    
    howItManifests: `This square creates internal and external friction. When you push forward with ${planet1} in ${h1.lifeArea}, ${planet2} in ${h2.lifeArea} seems to object. You may feel frustrated, blocked, or pressured. BUT—this is the engine of achievement. Squares build strength through resistance. Every time you work through this tension, you develop capacity you wouldn't have otherwise.`,
    
    whatHelps: [
      `Stop trying to eliminate the tension—it's your engine for growth`,
      `When frustrated, ask: "What is ${planet2} trying to protect or achieve that I'm ignoring?"`,
      `Find ways to honor both needs, even if imperfectly—partial satisfaction beats total neglect`,
      `Use the friction for motivation—boredom is never your problem with this aspect`,
      `Physical activity often helps discharge the excess tension productively`
    ],
    
    othersPerceive: `Others sense your driven, sometimes tense energy around ${h1.arena} and ${h2.arena} matters. You may come across as ambitious, stressed, or intensely motivated. They can feel the friction you carry—and they may also admire your ability to push through obstacles that would stop others.`
  };
}

function getTrineExplanation(
  planet1: string, p1: any, sign1: string, s1: any, house1: number, h1: any,
  planet2: string, p2: any, sign2: string, s2: any, house2: number, h2: any,
  elem1: string, elem2: string
): ContextualAspectExplanation {
  return {
    whyTensionExists: `There IS no tension—that's the gift and the challenge. Your ${planet1} in ${sign1} and ${planet2} in ${sign2} share the same element (${elem1}), creating natural flow between ${h1.arena} and ${h2.arena}. ${planet1}'s ${p1.wants} and ${planet2}'s ${p2.wants} support each other effortlessly. The energy moves naturally between these life areas.`,
    
    howItManifests: `This trine manifests as natural talent and ease. ${h1.lifeArea} and ${h2.lifeArea} cooperate without effort. You may not even notice this gift because it's always been there. The danger is complacency—because this flows so easily, you may not develop it fully or appreciate what you have. Others struggle with what comes naturally to you.`,
    
    whatHelps: [
      `Recognize this natural gift and develop it intentionally—don't take it for granted`,
      `Challenge yourself in this area to keep growing—ease can lead to stagnation`,
      `Share this gift with others—it's meant to flow outward, not just benefit you`,
      `Notice when you're coasting—sometimes you need to add challenge to this comfortable area`,
      `Use this as your foundation of strength when dealing with harder aspects in your chart`
    ],
    
    othersPerceive: `Others see you as naturally gifted or lucky in areas combining ${h1.arena} and ${h2.arena}. You make it look easy, which can inspire or frustrate them. They sense the grace and flow you have here—things that feel hard for them seem to come naturally to you.`
  };
}

function getSextileExplanation(
  planet1: string, p1: any, sign1: string, s1: any, house1: number, h1: any,
  planet2: string, p2: any, sign2: string, s2: any, house2: number, h2: any
): ContextualAspectExplanation {
  return {
    whyTensionExists: `Minimal tension—sextiles represent opportunity and compatible elements. Your ${planet1} in ${sign1} (${h1.arena}) and ${planet2} in ${sign2} (${h2.arena}) can work together easily, but unlike a trine, the connection requires some initiative to activate. These are complementary energies that support each other when you make the effort.`,
    
    howItManifests: `This sextile offers opportunities connecting ${h1.lifeArea} and ${h2.lifeArea}. Skills from one area translate usefully to the other. People and situations that bridge these domains appear when you're open. However, sextiles require action—the door is open, but you must walk through it. Passive waiting means the opportunity passes.`,
    
    whatHelps: [
      `Stay alert for opportunities linking these areas—they're your easy wins`,
      `Take initiative when you sense potential connections forming`,
      `Network and communicate—sextiles often activate through social connections`,
      `Use ${planet1} skills to support ${planet2} goals and vice versa`,
      `Don't wait for things to happen—this aspect rewards action and engagement`
    ],
    
    othersPerceive: `Others experience you as resourceful and able to make helpful connections between ${h1.arena} and ${h2.arena}. You spot opportunities and have practical skills that complement each other. This gives you an adaptable, competent quality when these energies are engaged.`
  };
}

function getGenericExplanation(
  planet1: string, p1: any, sign1: string, s1: any, house1: number, h1: any,
  planet2: string, p2: any, sign2: string, s2: any, house2: number, h2: any,
  aspectType: string
): ContextualAspectExplanation {
  return {
    whyTensionExists: `Your ${planet1} in ${sign1} (${h1.arena}) forms a ${aspectType} with ${planet2} in ${sign2} (${h2.arena}). This creates a specific relationship between ${p1.essence} and ${p2.essence} that colors how both energies express. The houses involved—${h1.lifeArea} and ${h2.lifeArea}—become linked through this connection.`,
    
    howItManifests: `When ${planet1} is activated, ${planet2} responds. The ${aspectType} aspect shapes how energy flows (or doesn't) between these life areas. Pay attention to patterns connecting ${h1.concerns} and ${h2.concerns}—they're cosmically linked in your chart.`,
    
    whatHelps: [
      `Study this aspect's nature and work with it consciously`,
      `Notice patterns connecting ${h1.arena} and ${h2.arena} in your life`,
      `Use the strengths of both planets intentionally`,
      `When one planet is activated, check in with the other`
    ],
    
    othersPerceive: `Others notice how your ${planet1} and ${planet2} expressions are connected. The ${aspectType} relationship between them creates a recognizable pattern in how you handle ${h1.arena} and ${h2.arena} matters.`
  };
}

// Convenience function to get just the "how others respond" piece
export function getOthersResponseToAspect(
  planet1: string,
  sign1: string,
  house1: number,
  planet2: string,
  sign2: string,
  house2: number,
  aspectType: string
): string {
  const explanation = getContextualAspectExplanation(planet1, sign1, house1, planet2, sign2, house2, aspectType);
  return explanation.othersPerceive;
}

// Get remediation suggestions specifically
export function getAspectRemediation(
  planet1: string,
  sign1: string,
  house1: number,
  planet2: string,
  sign2: string,
  house2: number,
  aspectType: string
): string[] {
  const explanation = getContextualAspectExplanation(planet1, sign1, house1, planet2, sign2, house2, aspectType);
  return explanation.whatHelps;
}

import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { NatalPlanetPosition } from '@/hooks/useNatalChart';
import {
  PLANET_DIGNITIES,
  SIGN_PROPERTIES,
  HOUSE_TYPES,
  TRIPLICITY_RULERS,
  AVERAGE_SPEEDS,
  SATURN_SYMBOLS,
  getElementSymbol,
  getDecanName,
  getTermRuler,
  getDecanRuler,
  getDignityStatus,
  getSectStatus,
  getHousesRuled,
  calculateDeclination
} from '@/lib/planetDignities';

// ============================================================================
// PERSONALIZED INTERPRETATION GENERATORS
// ============================================================================

const getPositionInterpretation = (planet: string, degree: number, sign: string): string => {
  const decanNum = Math.floor(degree / 10) + 1;
  const decanDescriptions: Record<string, Record<number, string>> = {
    Aries: {
      1: "pioneering energy and raw courage",
      2: "creative leadership and heart-centered action", 
      3: "diplomatic assertion and refined initiative"
    },
    Taurus: {
      1: "intellectual grounding and practical thinking",
      2: "emotional security and nurturing stability",
      3: "disciplined building and structured growth"
    },
    Gemini: {
      1: "expansive curiosity and optimistic communication",
      2: "dynamic ideas and energetic expression",
      3: "radiant intellect and creative thinking"
    },
    Cancer: {
      1: "harmonious nurturing and beautiful care",
      2: "communicative emotions and mental sensitivity",
      3: "intuitive depth and emotional wisdom"
    },
    Leo: {
      1: "structured creativity and disciplined expression",
      2: "generous expansion and joyful abundance",
      3: "passionate action and bold creativity"
    },
    Virgo: {
      1: "illuminated service and conscious improvement",
      2: "harmonious analysis and beautiful precision",
      3: "intellectual refinement and communicative skill"
    },
    Libra: {
      1: "intuitive balance and emotional diplomacy",
      2: "structured harmony and committed partnership",
      3: "expansive justice and philosophical fairness"
    },
    Scorpio: {
      1: "intense transformation and powerful depth",
      2: "illuminated mystery and conscious power",
      3: "passionate intensity and harmonious transformation"
    },
    Sagittarius: {
      1: "grounded wisdom and practical philosophy",
      2: "emotional faith and intuitive expansion",
      3: "disciplined seeking and structured belief"
    },
    Capricorn: {
      1: "abundant ambition and expansive achievement",
      2: "dynamic mastery and energetic building",
      3: "radiant authority and creative leadership"
    },
    Aquarius: {
      1: "harmonious innovation and beautiful vision",
      2: "intellectual revolution and communicative change",
      3: "intuitive humanity and emotional idealism"
    },
    Pisces: {
      1: "structured spirituality and disciplined surrender",
      2: "expansive compassion and abundant faith",
      3: "transformative transcendence and deep mysticism"
    }
  };

  const decanQuality = decanDescriptions[sign]?.[decanNum] || "unique expression";
  
  return `Your ${planet} at ${degree}° ${sign} sits in the ${decanNum === 1 ? 'first' : decanNum === 2 ? 'second' : 'third'} decan, expressing through ${decanQuality}. This specific degree gives your ${planet} a particular flavor within ${sign}'s broader themes.`;
};

const getElementInterpretation = (planet: string, element: string, sign: string): string => {
  const elementMeanings: Record<string, { quality: string; process: string; gift: string }> = {
    Fire: {
      quality: "inspiration, initiative, and enthusiasm",
      process: "through action, courage, and spontaneous expression",
      gift: "the ability to inspire others and take bold action"
    },
    Earth: {
      quality: "practicality, stability, and material awareness",
      process: "through building, sensory experience, and concrete results",
      gift: "the ability to manifest ideas into tangible reality"
    },
    Air: {
      quality: "intellect, communication, and social connection",
      process: "through ideas, conversation, and mental analysis",
      gift: "the ability to see multiple perspectives and connect concepts"
    },
    Water: {
      quality: "emotion, intuition, and empathic awareness",
      process: "through feeling, instinct, and emotional intelligence",
      gift: "the ability to sense what others need and heal through compassion"
    }
  };

  const meaning = elementMeanings[element];
  if (!meaning) return "";

  return `Your ${planet} in ${sign} operates through the ${element} element, giving it ${meaning.quality}. This means your ${planet} expresses ${meaning.process}. The ${element} element grants your ${planet} ${meaning.gift}.`;
};

const getModeInterpretation = (planet: string, mode: string, sign: string): string => {
  const modeMeanings: Record<string, { action: string; strength: string; challenge: string }> = {
    Cardinal: {
      action: "initiating new beginnings and taking the lead",
      strength: "starting projects and catalyzing change",
      challenge: "following through after the initial spark"
    },
    Fixed: {
      action: "sustaining effort and maintaining focus",
      strength: "perseverance, loyalty, and depth of commitment",
      challenge: "adapting when circumstances require change"
    },
    Mutable: {
      action: "adapting to circumstances and facilitating transitions",
      strength: "flexibility, versatility, and bridging different perspectives",
      challenge: "maintaining consistency and firm boundaries"
    }
  };

  const meaning = modeMeanings[mode];
  if (!meaning) return "";

  return `Your ${planet} in ${sign} is in ${mode} mode, naturally oriented toward ${meaning.action}. This gives your ${planet} the strength of ${meaning.strength}. The growth edge is ${meaning.challenge}.`;
};

const getAngularityInterpretation = (planet: string, houseType: string, house: number): string => {
  const typeInterpretations: Record<string, string> = {
    Angular: `Your ${planet} in the ${house}${getOrdinal(house)} house is in an angular position—the most powerful and visible placement. Angular planets are front and center in your life, actively shaping your identity and how others perceive you. This ${planet} is a major player in your chart.`,
    Succedent: `Your ${planet} in the ${house}${getOrdinal(house)} house is in a succedent position—a place of building, resources, and sustained effort. Succedent planets work steadily behind the scenes, accumulating power and value over time. This ${planet} grows stronger as you invest in it.`,
    Cadent: `Your ${planet} in the ${house}${getOrdinal(house)} house is in a cadent position—a place of learning, processing, and mental activity. Cadent planets work through analysis, communication, and adaptation. This ${planet} expresses through study, thought, and service to others.`
  };

  return typeInterpretations[houseType] || "";
};

const getMotionInterpretation = (planet: string, isRetrograde: boolean): string => {
  if (isRetrograde) {
    return `Your ${planet} is retrograde (℞), meaning its energy turns inward. Rather than expressing outwardly in typical ${planet} ways, you process these themes internally first. You may have unique insights about ${planet} matters that differ from mainstream views. Past life astrologers see retrograde planets as carrying unfinished business requiring deeper integration this lifetime.`;
  }
  return `Your ${planet} is direct, moving forward through the zodiac in its natural rhythm. This allows ${planet}'s energy to flow outward naturally, expressing in expected ways. You likely engage with ${planet} themes in a straightforward manner that others easily recognize.`;
};

const getSpeedInterpretation = (planet: string, isRetrograde: boolean): string => {
  const speedNotes: Record<string, string> = {
    Sun: "moves approximately 1° per day, marking your solar return each year",
    Moon: "is the fastest-moving body, changing signs every 2-3 days and cycling through the zodiac monthly",
    Mercury: "moves quickly but retrogrades 3 times yearly, revisiting themes of communication",
    Venus: "moves moderately, spending about a month in each sign, with a retrograde every 18 months",
    Mars: "takes about 2 years to complete the zodiac, with a retrograde every 2 years",
    Jupiter: "spends about a year in each sign, bringing expansion to that area annually",
    Saturn: "spends 2-3 years per sign, bringing long-term lessons and structure",
    Uranus: "spends 7 years per sign, marking generational shifts in innovation",
    Neptune: "spends 14 years per sign, creating generational spiritual themes",
    Pluto: "spends 12-30 years per sign (varying due to elliptical orbit), transforming generations"
  };

  const note = speedNotes[planet] || "moves through the zodiac at its own pace";
  const retroNote = isRetrograde ? " Currently retrograde, it appears to slow or pause from Earth's view." : "";

  return `Your ${planet} ${note}.${retroNote} This rhythm affects how quickly ${planet} themes unfold in your life—faster planets bring rapid changes while slower planets indicate long-term processes.`;
};

const getDignityInterpretation = (planet: string, sign: string, dignityType: string): string => {
  const interpretations: Record<string, string> = {
    Ruler: `Your ${planet} is in its own sign of ${sign}—a position of rulership! This is like being at home: ${planet} can express its nature purely and powerfully. You have natural authority in ${planet} matters and others recognize your competence here. This is a significant strength in your chart.`,
    Exaltation: `Your ${planet} is exalted in ${sign}—a position of honor and elevation! ${planet} is celebrated and functions at a high level here. Think of it as being a respected guest: not at home, but given special treatment. ${planet} themes come to you with grace and often bring recognition.`,
    Detriment: `Your ${planet} is in detriment in ${sign}—the sign opposite its rulership. This doesn't mean "bad," but ${planet} must work harder to express itself clearly. You may approach ${planet} matters unconventionally, learning through challenge. This placement often produces unique mastery through effort.`,
    Fall: `Your ${planet} is in fall in ${sign}—the sign opposite its exaltation. ${planet} must work to express its nature here, often feeling unsupported or misunderstood. However, this placement can develop profound humility and hard-won wisdom in ${planet} matters. Many successful people have fallen planets—they develop resilience.`,
    Peregrine: `Your ${planet} in ${sign} has no essential dignity—it's "peregrine" or wandering. This is neutral: ${planet} isn't especially strong or weak by sign. It relies more on aspects, house placement, and other factors to determine how it functions. This gives flexibility in how you express ${planet} themes.`
  };

  return interpretations[dignityType] || "";
};

const getDispositorInterpretation = (planet: string, sign: string, dispositor: string): string => {
  if (planet === dispositor) {
    return `Your ${planet} is in its own sign, so it "disposes itself." This means ${planet} has final authority over its own expression—no other planet is its boss. This gives your ${planet} autonomy and self-direction.`;
  }
  return `Your ${planet} in ${sign} is "disposed" by ${dispositor} (${sign}'s ruler). This means ${dispositor} influences how your ${planet} expresses. Look to where ${dispositor} is placed in your chart—that planet colors and directs your ${planet}'s energy. ${dispositor} is like the landlord of the house where ${planet} lives.`;
};

const getTriplicityInterpretation = (planet: string, element: string, rulers: { day: string; night: string; participating: string }, isDayChart: boolean | null): string => {
  // Detailed meanings for each planet as triplicity ruler
  const planetMeanings: Record<string, string> = {
    Sun: "brings visibility, vitality, and conscious awareness",
    Moon: "brings intuition, emotional attunement, and nurturing support",
    Mercury: "brings mental agility, communication skills, and adaptability",
    Venus: "brings harmony, attraction, pleasure, and relational ease",
    Mars: "brings drive, courage, initiative, and competitive edge",
    Jupiter: "brings expansion, optimism, opportunity, and faith",
    Saturn: "brings structure, discipline, endurance, and long-term planning"
  };

  if (isDayChart === null) {
    return `Your ${planet} is in a ${element} sign with triplicity rulers: ${rulers.day} (day), ${rulers.night} (night), and ${rulers.participating} (participating). These planets support your ${planet}'s expression. Check if your chart is day or night to know which ruler is primary.`;
  }

  if (isDayChart) {
    const dayMeaning = planetMeanings[rulers.day] || "supports your planet";
    const nightMeaning = planetMeanings[rulers.night] || "offers secondary support";
    const partMeaning = planetMeanings[rulers.participating] || "provides backup";
    
    return `You have a DAY CHART (Sun above horizon), so ${rulers.day} is your primary ${element} triplicity ruler for your ${planet}.

**What this means for you:** ${rulers.day} ${dayMeaning} to your ${planet}. Look at where ${rulers.day} is placed in your chart—its condition (sign, house, aspects) directly affects how well your ${planet} can thrive. A strong ${rulers.day} = strong support for your ${planet}.

${rulers.night} (night ruler) ${nightMeaning}—it's secondary but still helps. ${rulers.participating} (participating ruler) ${partMeaning} as a third layer of support.

**Practical tip:** When ${rulers.day} is activated by transit, your ${planet} also gets a boost.`;
  } else {
    const nightMeaning = planetMeanings[rulers.night] || "supports your planet";
    const dayMeaning = planetMeanings[rulers.day] || "offers secondary support";
    const partMeaning = planetMeanings[rulers.participating] || "provides backup";
    
    return `You have a NIGHT CHART (Sun below horizon), so ${rulers.night} is your primary ${element} triplicity ruler for your ${planet}.

**What this means for you:** ${rulers.night} ${nightMeaning} to your ${planet}. Look at where ${rulers.night} is placed in your chart—its condition (sign, house, aspects) directly affects how well your ${planet} can thrive. A strong ${rulers.night} = strong support for your ${planet}.

${rulers.day} (day ruler) ${dayMeaning}—it's secondary but still helps. ${rulers.participating} (participating ruler) ${partMeaning} as a third layer of support.

**Practical tip:** When ${rulers.night} is activated by transit, your ${planet} also gets a boost.`;
  }
};

const getTermInterpretation = (
  planet: string, 
  termRuler: string, 
  degree: number, 
  sign: string,
  allPlanets?: Record<string, NatalPlanetPosition>
): string => {
  let termRulerAnalysis = "";
  
  if (allPlanets && termRuler) {
    const rulerData = allPlanets[termRuler];
    if (rulerData?.sign) {
      const rulerDignity = getDignityStatus(termRuler, rulerData.sign);
      const isStrong = rulerDignity.type === 'Ruler' || rulerDignity.type === 'Exaltation';
      const isWeak = rulerDignity.type === 'Detriment' || rulerDignity.type === 'Fall';
      
      if (isStrong) {
        termRulerAnalysis = `

**Looking at YOUR ${termRuler}:** It's in ${rulerData.sign} (${rulerDignity.type}) — this is STRONG placement! Your ${termRuler} is well-positioned, which means it CAN effectively support your ${planet}. You likely feel this as: ${planet} matters flowing more smoothly, ${termRuler} themes naturally enhancing your ${planet} expression.`;
      } else if (isWeak) {
        termRulerAnalysis = `

**Looking at YOUR ${termRuler}:** It's in ${rulerData.sign} (${rulerDignity.type}) — this is a CHALLENGED placement. Your ${termRuler} has to work harder, which means its support for your ${planet} may feel inconsistent or require more effort. You might notice: needing to consciously develop ${termRuler} skills to help your ${planet} shine.`;
      } else {
        termRulerAnalysis = `

**Looking at YOUR ${termRuler}:** It's in ${rulerData.sign} (Peregrine/neutral). This is neither especially strong nor weak—${termRuler}'s support for your ${planet} depends more on aspects and house placement than sign dignity.`;
      }
    }
  }
  
  return `At ${degree}° ${sign}, your ${planet} falls in the terms (bounds) of ${termRuler}. Terms are ancient dignity divisions—think of ${termRuler} as a "minor landlord" for this specific degree, adding its subtle flavor to your ${planet}.${termRulerAnalysis}`;
};

const getDecanInterpretation = (
  planet: string, 
  decanRuler: string, 
  decanIndex: number, 
  sign: string,
  allPlanets?: Record<string, NatalPlanetPosition>
): string => {
  const decanName = decanIndex === 0 ? "first" : decanIndex === 1 ? "second" : "third";
  const degreeRange = `${decanIndex * 10}°-${(decanIndex + 1) * 10}°`;
  
  // How each planet as decan ruler FEELS
  const decanFeelings: Record<string, string> = {
    Sun: "a drive for recognition, leadership, and shining brightly in ${planet} matters",
    Moon: "emotional sensitivity, intuitive responses, and nurturing instincts in ${planet} areas",
    Mercury: "mental curiosity, communication needs, and adaptability in how ${planet} expresses",
    Venus: "a desire for harmony, beauty, and pleasure connected to ${planet} themes",
    Mars: "assertiveness, competitive drive, and action-orientation in ${planet} expression",
    Jupiter: "optimism, expansion, and a generous, philosophical approach to ${planet} matters",
    Saturn: "seriousness, discipline, and a need for structure in ${planet} expression"
  };

  let rulerAnalysis = "";
  const feeling = decanFeelings[decanRuler]?.replace('${planet}', planet) || `${decanRuler} qualities`;
  
  if (allPlanets && decanRuler) {
    const rulerData = allPlanets[decanRuler];
    if (rulerData?.sign) {
      const rulerDignity = getDignityStatus(decanRuler, rulerData.sign);
      const isStrong = rulerDignity.type === 'Ruler' || rulerDignity.type === 'Exaltation';
      
      if (isStrong) {
        rulerAnalysis = `

**YOUR ${decanRuler} is in ${rulerData.sign} (${rulerDignity.type})** — strong! This amplifies the ${decanRuler} flavor in your ${planet}. You likely FEEL this as: ${feeling}. This comes naturally to you.`;
      } else if (rulerDignity.type === 'Detriment' || rulerDignity.type === 'Fall') {
        rulerAnalysis = `

**YOUR ${decanRuler} is in ${rulerData.sign} (${rulerDignity.type})** — challenged. The ${decanRuler} sub-tone in your ${planet} may feel like something you have to work at. You might experience: ${feeling}, but it requires conscious effort to express smoothly.`;
      } else {
        rulerAnalysis = `

**YOUR ${decanRuler} is in ${rulerData.sign}** (neutral). The ${decanRuler} flavor adds ${feeling}. This influence is moderate—neither amplified nor diminished.`;
      }
    }
  }
  
  return `Your ${planet} at ${degreeRange} ${sign} is in the ${decanName} decan, ruled by ${decanRuler}. 

**How you FEEL this:** The decan ruler adds a secondary "flavor" to your ${planet}. With ${decanRuler} ruling this decan, you experience ${feeling}.${rulerAnalysis}`;
};

const getHouseRulershipInterpretation = (planet: string, housesRuled: string): string => {
  if (housesRuled === 'None' || housesRuled === 'Unknown') {
    return `Your ${planet} doesn't rule any house cusps in your chart (based on traditional rulership). Its influence flows through aspects and its house placement rather than through house lordship.`;
  }
  return `Your ${planet} rules the ${housesRuled} house${housesRuled.includes(',') ? 's' : ''} in your chart. This means ${planet} themes directly connect to those life areas. When ${planet} is activated by transit or progression, those house matters come into focus. ${planet} is a "lord" of those domains.`;
};

const getSectInterpretation = (planet: string, sectStatus: string, isDayChart: boolean | null): string => {
  // Experiential descriptions of out-of-sect planets
  const outOfSectFeelings: Record<string, string> = {
    Sun: `**How you might FEEL this:** Your core identity and vitality may feel like they have to fight for expression. In a night chart, the Sun's need for visibility and recognition doesn't get automatic support from the environment. You might experience:
• Feeling like you have to work harder to be seen or acknowledged
• Your confidence coming in waves rather than being steady
• A sense that your true self is sometimes misunderstood
• Developing resilience and self-validation skills others don't have to develop

**The gift:** People with out-of-sect Suns often develop profound inner strength and don't rely on external validation. You know who you are regardless of recognition.`,
    
    Moon: `**How you might FEEL this:** Your emotional needs and instincts may feel at odds with your environment. In a day chart, the Moon's need for nurturing and security doesn't flow as naturally. You might experience:
• Emotions feeling inconvenient or poorly timed
• Having to consciously create emotional safety
• Nurturing instincts that don't always get validated
• Learning to trust your feelings despite external dismissal

**The gift:** You develop emotional self-sufficiency and can nurture yourself and others deliberately.`,
    
    Jupiter: `**How you might FEEL this:** Your optimism and growth opportunities may require more effort. In a night chart, Jupiter's gifts don't arrive as easily. You might experience:
• Having to work for luck rather than it finding you
• Faith and optimism requiring conscious cultivation
• Growth coming through effort rather than grace
• Needing to create your own opportunities

**The gift:** You develop earned wisdom and appreciation for what you achieve.`,
    
    Saturn: `**How you might FEEL this:** Your discipline and structure may feel heavy or restrictive. In a night chart, Saturn's challenges are more prominent. You might experience:
• Responsibilities feeling burdensome rather than purposeful
• Authority figures being more critical or demanding
• Delays and obstacles feeling more frustrating
• Having to prove yourself repeatedly

**The gift:** You develop exceptional resilience and unshakeable competence through overcoming real obstacles.`,
    
    Venus: `**How you might FEEL this:** Your relationship needs and values may feel unsupported. In a day chart, Venus's gifts require more cultivation. You might experience:
• Harmony not coming naturally in relationships
• Having to work at pleasure and enjoyment
• Aesthetic sensibilities that others don't immediately appreciate
• Learning to value yourself independently

**The gift:** You develop authentic self-worth and conscious relationship skills.`,
    
    Mars: `**How you might FEEL this:** Your assertiveness and drive may feel misplaced or excessive. In a day chart, Mars's fire doesn't harmonize as well. You might experience:
• Anger or frustration being harder to channel productively
• Initiative sometimes coming across as aggressive
• Having to learn when to push and when to pause
• Competitive instincts needing conscious management

**The gift:** You develop controlled power and strategic action rather than reactive impulse.`
  };

  const inSectFeelings: Record<string, string> = {
    Sun: `**How you FEEL this:** Your identity shines naturally in a day chart. Visibility, confidence, and vitality flow more easily. Others recognize and validate who you are without you having to fight for it.`,
    Moon: `**How you FEEL this:** Your emotions and nurturing instincts are supported in a night chart. Intuition flows, emotional needs get met more easily, and caring for others feels natural.`,
    Jupiter: `**How you FEEL this:** Luck and expansion come more gracefully in a day chart. Opportunities appear, optimism is rewarded, and growth happens through trust and openness.`,
    Saturn: `**How you FEEL this:** Discipline and responsibility feel purposeful in a day chart. Hard work pays off, structures support you, and authority figures are helpful rather than obstructive.`,
    Venus: `**How you FEEL this:** Love, beauty, and pleasure flow easily in a night chart. Relationships harmonize naturally, and your values attract appreciation.`,
    Mars: `**How you FEEL this:** Action and assertion work smoothly in a night chart. Your drive gets results, anger is productive, and initiative is well-received.`
  };
  
  if (sectStatus.includes('In Sect')) {
    const feeling = inSectFeelings[planet] || `Your ${planet} functions smoothly—its positive qualities are supported by your chart type.`;
    return `Your ${planet} is "in sect," meaning it matches your chart type (${isDayChart ? 'day' : 'night'} chart). In-sect planets work WITH the flow of the chart.

${feeling}`;
  } else if (sectStatus.includes('Out of Sect')) {
    const feeling = outOfSectFeelings[planet] || `Your ${planet} works harder to express its gifts and may face more challenges. However, this builds character and unique strengths.`;
    return `Your ${planet} is "out of sect," meaning it doesn't match your chart type (${isDayChart ? 'day' : 'night'} chart). Out-of-sect planets swim against the current—but this builds strength.

${feeling}`;
  }
  return `${planet} (Mercury and outer planets) is neutral regarding sect—it works with both day and night charts. It adapts to whatever environment it's in, taking on the qualities of planets it aspects.`;
};

const getDeclinationInterpretation = (planet: string, declination: string): string => {
  const isNorth = declination.includes('N');
  const direction = isNorth ? "north" : "south";
  
  return `Your ${planet} has a declination of ${declination}, meaning it sits ${direction} of the celestial equator. Planets at similar declinations form "parallel" aspects (north-north or south-south) or "contraparallel" aspects (north-south), creating hidden connections. High declination planets (near 23°) are "out of bounds" and can express in unusual, amplified ways.`;
};

const getSaturnSymbolInterpretation = (sign: string, symbol: { symbol: string; meaning: string }): string => {
  return `Saturn in ${sign} carries special symbolism: ${symbol.symbol}. ${symbol.meaning}. This represents your particular Saturn lesson—the area where you're called to develop mastery, accept responsibility, and eventually become an authority through dedicated effort over time.`;
};

// ============================================================================
// HELPER
// ============================================================================

const getOrdinal = (n: number): string => {
  if (n === 1 || n === 21 || n === 31) return 'st';
  if (n === 2 || n === 22) return 'nd';
  if (n === 3 || n === 23) return 'rd';
  return 'th';
};

// ============================================================================
// COMPONENTS
// ============================================================================

interface DetailRowProps {
  label: string;
  value: string;
  description?: string;
  interpretation?: string;
}

const DetailRow = ({ label, value, description, interpretation }: DetailRowProps) => {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="py-3 border-b border-border/50">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-foreground mb-0.5">
            {label}
          </div>
          <div className="text-sm text-foreground/80">
            {value}
          </div>
          {description && (
            <div className="text-xs text-muted-foreground mt-0.5 italic">
              {description}
            </div>
          )}
        </div>
        {interpretation && (
          <button
            onClick={() => setShowMore(!showMore)}
            className="text-xs text-primary hover:underline flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <Info size={10} />
            {showMore ? 'Hide' : 'What does this mean?'}
          </button>
        )}
      </div>
      {showMore && interpretation && (
        <div className="mt-2 p-3 bg-primary/5 rounded text-xs text-foreground/80 leading-relaxed border-l-2 border-primary/30">
          {interpretation}
        </div>
      )}
    </div>
  );
};

interface EnhancedPlanetDetailsProps {
  planetName: string;
  planetData: NatalPlanetPosition;
  house: number | null;
  sunHouse?: number | null;
  houseCusps?: Record<string, { sign: string; degree: number; minutes?: number }>;
  allPlanets?: Record<string, NatalPlanetPosition>;
}

export const EnhancedPlanetDetails = ({
  planetName,
  planetData,
  house,
  sunHouse,
  houseCusps,
  allPlanets
}: EnhancedPlanetDetailsProps) => {
  const [expanded, setExpanded] = useState(false);

  const sign = planetData.sign;
  const degree = planetData.degree;
  const isRetrograde = planetData.isRetrograde;

  // Get sign properties
  const signProps = SIGN_PROPERTIES[sign];
  if (!signProps) return null;

  // Get house type
  const houseType = house ? HOUSE_TYPES[house] : null;

  // Get dignities
  const dignities = PLANET_DIGNITIES[planetName];
  const dignityStatus = getDignityStatus(planetName, sign);

  // Get dispositor (ruler of the sign)
  const dispositor = signProps.ruler;

  // Get triplicity rulers
  const triplicityRulers = TRIPLICITY_RULERS[signProps.element];

  // Get decan ruler
  const decanIndex = Math.min(2, Math.floor(degree / 10));
  const decanRuler = getDecanRuler(sign, degree);

  // Get term ruler
  const termRuler = getTermRuler(sign, degree);

  // Calculate speed with retrograde consideration
  const baseSpeed = AVERAGE_SPEEDS[planetName] || 'Unknown';
  const speed = isRetrograde ? `-${baseSpeed}` : `+${baseSpeed}`;

  // Determine if day chart (Sun above horizon = houses 7-12)
  const isDayChart = sunHouse ? sunHouse >= 7 : null;

  // Get sect status
  const sectInfo = getSectStatus(planetName, sunHouse || null, isDayChart);

  // Get houses ruled
  const housesRuled = getHousesRuled(planetName, houseCusps);

  // Get declination
  const declination = calculateDeclination(sign, degree);

  // Saturn symbol (only for Saturn)
  const saturnSymbol = planetName === 'Saturn' ? SATURN_SYMBOLS[sign] : null;

  return (
    <div className="mt-3">
      {/* Expand/Collapse Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 bg-secondary/50 hover:bg-secondary rounded text-xs font-medium text-foreground/80 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          🔍 View Details
        </span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Expanded Technical Details */}
      {expanded && (
        <div className="mt-3 p-4 bg-secondary/30 rounded-md space-y-0">
          {/* Position & Movement Section */}
          <div className="pb-2 mb-2 border-b-2 border-primary/20">
            <h4 className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-2">
              Position & Movement
            </h4>
          </div>

          <DetailRow
            label="Position"
            value={`${degree}° ${sign}`}
            interpretation={getPositionInterpretation(planetName, degree, sign)}
          />

          <DetailRow
            label="Element"
            value={`${getElementSymbol(signProps.element)} ${signProps.element}`}
            interpretation={getElementInterpretation(planetName, signProps.element, sign)}
          />

          <DetailRow
            label="Mode"
            value={signProps.mode}
            interpretation={getModeInterpretation(planetName, signProps.mode, sign)}
          />

          {houseType && house && (
            <DetailRow
              label="Angularity"
              value={houseType}
              description={`${house}${getOrdinal(house)} house is ${houseType.toLowerCase()}`}
              interpretation={getAngularityInterpretation(planetName, houseType, house)}
            />
          )}

          <DetailRow
            label="Motion"
            value={isRetrograde ? `Retrograde ℞` : 'Direct'}
            description={isRetrograde ? "Planet appears to move backward from Earth's perspective" : 'Planet moving forward in normal direction'}
            interpretation={getMotionInterpretation(planetName, isRetrograde || false)}
          />

          <DetailRow
            label="Speed"
            value={speed}
            interpretation={getSpeedInterpretation(planetName, isRetrograde || false)}
          />

          {/* Dignity Status Section */}
          {dignities && (
            <>
              <div className="pt-4 pb-2 mb-2 border-b-2 border-primary/20">
                <h4 className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-2">
                  Dignity Status
                </h4>
              </div>

              <DignityBox 
                planetName={planetName}
                sign={sign}
                dignityStatus={dignityStatus} 
                dignities={dignities} 
              />
            </>
          )}

          {/* Rulership Chain Section */}
          <div className="pt-4 pb-2 mb-2 border-b-2 border-primary/20">
            <h4 className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-2">
              Rulership Chain
            </h4>
          </div>

          <DetailRow
            label="Dispositor"
            value={dispositor}
            description={`${sign} is ruled by ${dispositor}`}
            interpretation={getDispositorInterpretation(planetName, sign, dispositor)}
          />

          {triplicityRulers && (
            <DetailRow
              label="Triplicity Rulers"
              value={`${triplicityRulers.day}, ${triplicityRulers.night}, ${triplicityRulers.participating}`}
              description={`Day: ${triplicityRulers.day} | Night: ${triplicityRulers.night} | Participating: ${triplicityRulers.participating}`}
              interpretation={getTriplicityInterpretation(planetName, signProps.element, triplicityRulers, isDayChart)}
            />
          )}

          <DetailRow
            label="Term Ruler"
            value={termRuler}
            description={`Egyptian/Ptolemaic terms for ${degree}° ${sign}`}
            interpretation={getTermInterpretation(planetName, termRuler, degree, sign, allPlanets)}
          />

          <DetailRow
            label="Decan Ruler"
            value={decanRuler}
            description={`${degree}° is in the ${getDecanName(decanIndex)} decan (${decanIndex * 10}°-${(decanIndex + 1) * 10}°)`}
            interpretation={getDecanInterpretation(planetName, decanRuler, decanIndex, sign, allPlanets)}
          />

          <DetailRow
            label="Houses Ruled"
            value={housesRuled}
            description="Houses where this planet is the traditional ruler"
            interpretation={getHouseRulershipInterpretation(planetName, housesRuled)}
          />

          {/* Condition Section */}
          <div className="pt-4 pb-2 mb-2 border-b-2 border-primary/20">
            <h4 className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-2">
              Condition
            </h4>
          </div>

          <DetailRow
            label="Sect Status"
            value={sectInfo.status}
            description={sectInfo.description}
            interpretation={getSectInterpretation(planetName, sectInfo.status, isDayChart)}
          />

          <DetailRow
            label="Declination"
            value={declination}
            interpretation={getDeclinationInterpretation(planetName, declination)}
          />

          {/* Saturn Symbol (only for Saturn) */}
          {saturnSymbol && (
            <DetailRow
              label="Saturn Symbol"
              value={saturnSymbol.symbol}
              description={saturnSymbol.meaning}
              interpretation={getSaturnSymbolInterpretation(sign, saturnSymbol)}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Separate component for the dignity box with its own interpretation
const DignityBox = ({ 
  planetName,
  sign,
  dignityStatus, 
  dignities 
}: { 
  planetName: string;
  sign: string;
  dignityStatus: { type: string; color: string; bgColor: string };
  dignities: { rulership: string | string[]; exaltation: string; detriment: string | string[]; fall: string };
}) => {
  const [showMore, setShowMore] = useState(false);
  const interpretation = getDignityInterpretation(planetName, sign, dignityStatus.type);

  return (
    <div 
      className="p-3 rounded mb-3"
      style={{ 
        backgroundColor: dignityStatus.bgColor,
        borderLeft: `4px solid ${dignityStatus.color}`
      }}
    >
      <div className="text-sm font-bold mb-2" style={{ color: dignityStatus.color }}>
        {dignityStatus.type === 'Ruler' && '🏛️ '}
        {dignityStatus.type === 'Exaltation' && '⬆️ '}
        {dignityStatus.type === 'Detriment' && '⬇️ '}
        {dignityStatus.type === 'Fall' && '❌ '}
        {dignityStatus.type === 'Peregrine' && '⚪ '}
        Rulership Status: {dignityStatus.type}
      </div>
      <div className="text-xs space-y-1.5 text-foreground/80">
        <div>
          <span className="font-medium">🏛️ Ruler:</span>{' '}
          {Array.isArray(dignities.rulership) ? dignities.rulership.join(', ') : dignities.rulership}
          <span className="text-muted-foreground ml-1">(home sign)</span>
        </div>
        <div>
          <span className="font-medium">⬆️ Exaltation:</span> {dignities.exaltation}
          <span className="text-muted-foreground ml-1">(peak power degree)</span>
        </div>
        <div>
          <span className="font-medium">⬇️ Detriment:</span>{' '}
          {Array.isArray(dignities.detriment) ? dignities.detriment.join(', ') : dignities.detriment}
          <span className="text-muted-foreground ml-1">(opposite home)</span>
        </div>
        <div>
          <span className="font-medium">❌ Fall:</span> {dignities.fall}
          <span className="text-muted-foreground ml-1">(lowest power degree)</span>
        </div>
      </div>
      <div className="mt-2 text-[10px] text-muted-foreground italic border-t border-border/30 pt-2">
        💡 The degrees shown (like 19°) are the <strong>exact exaltation/fall points</strong> from ancient astrology—where the planet reaches peak strength or greatest challenge. The closer your planet is to that exact degree, the more intensely you experience the dignity.
      </div>
      <button
        onClick={() => setShowMore(!showMore)}
        className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
      >
        <Info size={10} />
        {showMore ? 'Hide' : 'What does this mean for me?'}
      </button>
      {showMore && (
        <div className="mt-2 p-3 bg-background/50 rounded text-xs text-foreground/80 leading-relaxed border-l-2 border-primary/30">
          {interpretation}
        </div>
      )}
    </div>
  );
};

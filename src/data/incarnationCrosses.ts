export interface IncarnationCross {
  name: string;
  type: 'Right Angle' | 'Left Angle' | 'Juxtaposition';
  gates: {
    consciousSun: number;
    consciousEarth: number;
    unconsciousSun: number;
    unconsciousEarth: number;
  };
  quarter: 'Initiation' | 'Civilization' | 'Duality' | 'Mutation';
  theme: string;
  description: string;
  // Optional extended fields (available for detailed cross entries)
  lifeWork?: string;
  collectiveContribution?: string;
  gateIntegration?: string;
  livingYourCross?: string;
}

// Helper to determine quarter based on Sun gate position
function getQuarterForGate(gate: number): 'Initiation' | 'Civilization' | 'Duality' | 'Mutation' {
  // Quarter of Initiation: Gates 13, 25, 36, 22, 63, 37, 55, 30, 49, 19, 41, 60, 3, 50, 27, 24
  const initiationGates = [13, 25, 36, 22, 63, 37, 55, 30, 49, 19, 41, 60, 3, 50, 27, 24];
  // Quarter of Civilization: Gates 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33
  const civilizationGates = [2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33];
  // Quarter of Duality: Gates 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44
  const dualityGates = [7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 28, 44];
  // Quarter of Mutation: remaining gates
  
  if (initiationGates.includes(gate)) return 'Initiation';
  if (civilizationGates.includes(gate)) return 'Civilization';
  if (dualityGates.includes(gate)) return 'Duality';
  return 'Mutation';
}

export const incarnationCrosses: IncarnationCross[] = [
  // ========== JUXTAPOSITION CROSSES ==========
  {
    name: "Juxtaposition Cross of Beginnings",
    type: "Juxtaposition",
    gates: { consciousSun: 53, consciousEarth: 54, unconsciousSun: 42, unconsciousEarth: 32 },
    quarter: "Civilization",
    theme: "Initiating new cycles and transformations",
    description: "This incarnation cross embodies the energy of new beginnings and initiations. People born under this cross are often the initiators of new projects and enterprises, driving progress and growth."
  },
  {
    name: "Juxtaposition Cross of Bargains",
    type: "Juxtaposition",
    gates: { consciousSun: 37, consciousEarth: 40, unconsciousSun: 5, unconsciousEarth: 35 },
    quarter: "Initiation",
    theme: "Negotiating fair exchanges",
    description: "Those under this cross are born negotiators and dealmakers. They inherently understand the principle of give and take, making them adept at creating mutually beneficial situations."
  },
  {
    name: "Juxtaposition Cross of Caring",
    type: "Juxtaposition",
    gates: { consciousSun: 27, consciousEarth: 28, unconsciousSun: 19, unconsciousEarth: 33 },
    quarter: "Initiation",
    theme: "Nurturing and protecting others",
    description: "People with this cross have a deep drive to care for others. They are often found in nurturing roles and are capable of immense self-sacrifice for the sake of those they care about."
  },
  {
    name: "Juxtaposition Cross of Behavior",
    type: "Juxtaposition",
    gates: { consciousSun: 10, consciousEarth: 15, unconsciousSun: 18, unconsciousEarth: 17 },
    quarter: "Mutation",
    theme: "Understanding patterns of behavior",
    description: "Individuals with this cross have a profound understanding of human behavior. They are natural observers and can read people exceptionally well."
  },
  {
    name: "Juxtaposition Cross of Ambition",
    type: "Juxtaposition",
    gates: { consciousSun: 54, consciousEarth: 53, unconsciousSun: 32, unconsciousEarth: 42 },
    quarter: "Civilization",
    theme: "Driving toward success",
    description: "This incarnation cross embodies ambition and the drive for success. Those born under it are often highly motivated and set big goals."
  },
  {
    name: "Juxtaposition Cross of Alertness",
    type: "Juxtaposition",
    gates: { consciousSun: 44, consciousEarth: 24, unconsciousSun: 7, unconsciousEarth: 13 },
    quarter: "Duality",
    theme: "Heightened awareness and perception",
    description: "People born under this cross have a natural alertness to their surroundings. They are quick to notice changes and details others may miss."
  },
  {
    name: "Juxtaposition Cross of Assimilation",
    type: "Juxtaposition",
    gates: { consciousSun: 23, consciousEarth: 43, unconsciousSun: 30, unconsciousEarth: 29 },
    quarter: "Civilization",
    theme: "Integrating diverse knowledge",
    description: "This cross embodies the ability to understand and assimilate complex information. These individuals often possess a unique perspective, allowing them to make connections others cannot."
  },
  {
    name: "Juxtaposition Cross of Articulation",
    type: "Juxtaposition",
    gates: { consciousSun: 12, consciousEarth: 11, unconsciousSun: 25, unconsciousEarth: 46 },
    quarter: "Civilization",
    theme: "Expressing truth through words",
    description: "Those under this cross have a gift for articulation. They are able to express thoughts, feelings, and concepts clearly and effectively, making them excellent communicators."
  },
  {
    name: "Juxtaposition Cross of Completion",
    type: "Juxtaposition",
    gates: { consciousSun: 42, consciousEarth: 32, unconsciousSun: 60, unconsciousEarth: 56 },
    quarter: "Duality",
    theme: "Seeing things through to the end",
    description: "Individuals with this cross are dedicated to seeing things through to completion. They value persistence and follow-through, and they excel in roles where attention to detail is required."
  },
  {
    name: "Juxtaposition Cross of Commitment",
    type: "Juxtaposition",
    gates: { consciousSun: 29, consciousEarth: 30, unconsciousSun: 20, unconsciousEarth: 34 },
    quarter: "Duality",
    theme: "Dedicated to purpose",
    description: "People with this cross are all about commitment. They are dedicated and steadfast, capable of great loyalty."
  },
  {
    name: "Juxtaposition Cross of Mutation",
    type: "Juxtaposition",
    gates: { consciousSun: 3, consciousEarth: 50, unconsciousSun: 41, unconsciousEarth: 31 },
    quarter: "Initiation",
    theme: "Catalyzing change and transformation",
    description: "This cross embodies the energy of transformation and mutation. Those under it are catalysts for change, often disrupting the status quo."
  },
  {
    name: "Juxtaposition Cross of Moods",
    type: "Juxtaposition",
    gates: { consciousSun: 55, consciousEarth: 59, unconsciousSun: 9, unconsciousEarth: 16 },
    quarter: "Initiation",
    theme: "Navigating emotional waves",
    description: "People born under this cross are deeply in tune with their emotions and moods. They often possess a high level of emotional intelligence."
  },
  {
    name: "Juxtaposition Cross of The Now",
    type: "Juxtaposition",
    gates: { consciousSun: 20, consciousEarth: 34, unconsciousSun: 37, unconsciousEarth: 40 },
    quarter: "Civilization",
    theme: "Living in the present moment",
    description: "Those with this cross are highly present individuals, often instinctively understanding the need to live in the moment. They are usually action-oriented and pragmatic."
  },
  {
    name: "Juxtaposition Cross of Need",
    type: "Juxtaposition",
    gates: { consciousSun: 19, consciousEarth: 33, unconsciousSun: 1, unconsciousEarth: 2 },
    quarter: "Initiation",
    theme: "Sensing and meeting needs",
    description: "Individuals with this cross are sensitive to the needs of others. They are often in positions where they provide support and help."
  },
  {
    name: "Juxtaposition Cross of Opposition",
    type: "Juxtaposition",
    gates: { consciousSun: 38, consciousEarth: 39, unconsciousSun: 57, unconsciousEarth: 51 },
    quarter: "Mutation",
    theme: "Standing firm in conviction",
    description: "This incarnation cross embodies the energy of opposition. Those born under it often find themselves challenging the status quo and standing up for what they believe in."
  },
  {
    name: "Juxtaposition Cross of Opinions",
    type: "Juxtaposition",
    gates: { consciousSun: 17, consciousEarth: 18, unconsciousSun: 38, unconsciousEarth: 39 },
    quarter: "Mutation",
    theme: "Expressing strong viewpoints",
    description: "People with this cross often have strong opinions and are not afraid to share them. They are likely to be articulate and persuasive."
  },
  {
    name: "Juxtaposition Cross of Possession",
    type: "Juxtaposition",
    gates: { consciousSun: 45, consciousEarth: 26, unconsciousSun: 36, unconsciousEarth: 6 },
    quarter: "Civilization",
    theme: "Gathering and managing resources",
    description: "This cross is about possession and control. Individuals under it often strive for stability and security through control over their surroundings."
  },
  {
    name: "Juxtaposition Cross of Oppression",
    type: "Juxtaposition",
    gates: { consciousSun: 47, consciousEarth: 22, unconsciousSun: 12, unconsciousEarth: 11 },
    quarter: "Duality",
    theme: "Breaking free from constraints",
    description: "People with this cross may struggle with feelings of oppression, often fighting against constraints and limitations. They can become powerful advocates for freedom."
  },
  {
    name: "Juxtaposition Cross of Principles",
    type: "Juxtaposition",
    gates: { consciousSun: 49, consciousEarth: 4, unconsciousSun: 14, unconsciousEarth: 8 },
    quarter: "Initiation",
    theme: "Standing on moral ground",
    description: "Those under this cross are driven by a strong sense of principles. They often stand up for what they believe in and are not easily swayed."
  },
  {
    name: "Juxtaposition Cross of Power",
    type: "Juxtaposition",
    gates: { consciousSun: 34, consciousEarth: 20, unconsciousSun: 40, unconsciousEarth: 37 },
    quarter: "Mutation",
    theme: "Wielding personal power",
    description: "This incarnation cross embodies the energy of power. Individuals with this cross often have a strong drive to achieve and succeed."
  },
  {
    name: "Juxtaposition Cross of Provocation",
    type: "Juxtaposition",
    gates: { consciousSun: 39, consciousEarth: 38, unconsciousSun: 51, unconsciousEarth: 57 },
    quarter: "Civilization",
    theme: "Sparking action through challenge",
    description: "This cross is associated with provocation. Individuals with this cross are often seen challenging the status quo, encouraging others to question their beliefs."
  },
  {
    name: "Juxtaposition Cross of Rationalization",
    type: "Juxtaposition",
    gates: { consciousSun: 24, consciousEarth: 44, unconsciousSun: 13, unconsciousEarth: 7 },
    quarter: "Initiation",
    theme: "Making sense of complexity",
    description: "This incarnation cross represents a strong capacity for rational thought. Those with this cross often possess the ability to rationalize complex situations and ideas."
  },
  {
    name: "Juxtaposition Cross of Retreat",
    type: "Juxtaposition",
    gates: { consciousSun: 33, consciousEarth: 19, unconsciousSun: 2, unconsciousEarth: 1 },
    quarter: "Civilization",
    theme: "Strategic withdrawal for renewal",
    description: "Individuals with this cross often feel a strong pull towards solitude and retreat. They need periods of isolation to recharge and reflect."
  },
  {
    name: "Juxtaposition Cross of Risks",
    type: "Juxtaposition",
    gates: { consciousSun: 28, consciousEarth: 27, unconsciousSun: 33, unconsciousEarth: 19 },
    quarter: "Duality",
    theme: "Embracing life's challenges",
    description: "This cross is associated with a willingness to take risks. Those born under this cross are often adventurers at heart, embracing the uncertainty of life."
  },
  {
    name: "Juxtaposition Cross of Self-expression",
    type: "Juxtaposition",
    gates: { consciousSun: 1, consciousEarth: 2, unconsciousSun: 4, unconsciousEarth: 49 },
    quarter: "Initiation",
    theme: "Authentic creative expression",
    description: "Individuals under this cross are gifted with self-expression. They are often creative and artistic, finding unique ways to express their individuality."
  },
  {
    name: "Juxtaposition Cross of Serendipity",
    type: "Juxtaposition",
    gates: { consciousSun: 46, consciousEarth: 25, unconsciousSun: 52, unconsciousEarth: 58 },
    quarter: "Duality",
    theme: "Embracing fortunate encounters",
    description: "This incarnation cross embodies the essence of serendipity. People with this cross often encounter unexpected opportunities and fortuitous coincidences."
  },
  {
    name: "Juxtaposition Cross of Shock",
    type: "Juxtaposition",
    gates: { consciousSun: 51, consciousEarth: 57, unconsciousSun: 61, unconsciousEarth: 62 },
    quarter: "Mutation",
    theme: "Awakening through disruption",
    description: "Individuals with this cross often serve as catalysts for awakening in others. They may shock others into awareness, challenging their complacency."
  },
  {
    name: "Juxtaposition Cross of Stillness",
    type: "Juxtaposition",
    gates: { consciousSun: 52, consciousEarth: 58, unconsciousSun: 21, unconsciousEarth: 48 },
    quarter: "Civilization",
    theme: "Finding peace in presence",
    description: "This cross embodies the energy of stillness. People with this cross often have a calming presence, bringing tranquility to those around them."
  },
  {
    name: "Juxtaposition Cross of Stimulation",
    type: "Juxtaposition",
    gates: { consciousSun: 56, consciousEarth: 60, unconsciousSun: 27, unconsciousEarth: 28 },
    quarter: "Civilization",
    theme: "Inspiring through storytelling",
    description: "This incarnation cross embodies the energy of stimulation. Those born under it often stimulate change, growth, and innovation."
  },
  {
    name: "Juxtaposition Cross of Strategy",
    type: "Juxtaposition",
    gates: { consciousSun: 59, consciousEarth: 55, unconsciousSun: 16, unconsciousEarth: 9 },
    quarter: "Duality",
    theme: "Planning for success",
    description: "Individuals with this cross have a natural knack for strategy. They are adept at planning and often foresee potential obstacles."
  },
  {
    name: "Juxtaposition Cross of Vitality",
    type: "Juxtaposition",
    gates: { consciousSun: 58, consciousEarth: 52, unconsciousSun: 48, unconsciousEarth: 21 },
    quarter: "Mutation",
    theme: "Radiating life force",
    description: "This cross is associated with vitality and the joy of being alive. Those born under this cross often radiate energy and enthusiasm."
  },
  {
    name: "Juxtaposition Cross of Values",
    type: "Juxtaposition",
    gates: { consciousSun: 50, consciousEarth: 3, unconsciousSun: 31, unconsciousEarth: 41 },
    quarter: "Initiation",
    theme: "Upholding what matters",
    description: "Individuals with this cross are often deeply values-driven. They stand for what they believe in and often inspire others with their integrity."
  },
  {
    name: "Juxtaposition Cross of The Trickster",
    type: "Juxtaposition",
    gates: { consciousSun: 26, consciousEarth: 45, unconsciousSun: 6, unconsciousEarth: 36 },
    quarter: "Mutation",
    theme: "Transforming through clever insight",
    description: "This incarnation cross is often associated with those who bring change in unexpected ways, like a trickster. These individuals are clever, creative, and often unpredictable."
  },
  {
    name: "Juxtaposition Cross of Thinking",
    type: "Juxtaposition",
    gates: { consciousSun: 61, consciousEarth: 62, unconsciousSun: 50, unconsciousEarth: 3 },
    quarter: "Mutation",
    theme: "Penetrating mental clarity",
    description: "People with this cross have a strong capacity for critical thought. They often provide fresh perspectives and innovative solutions."
  },
  {
    name: "Juxtaposition Cross of Control",
    type: "Juxtaposition",
    gates: { consciousSun: 21, consciousEarth: 48, unconsciousSun: 54, unconsciousEarth: 53 },
    quarter: "Duality",
    theme: "Managing resources and situations",
    description: "Individuals with this cross have a natural ability to take control of situations, making decisions efficiently and effectively."
  },
  {
    name: "Juxtaposition Cross of Correction",
    type: "Juxtaposition",
    gates: { consciousSun: 18, consciousEarth: 17, unconsciousSun: 39, unconsciousEarth: 38 },
    quarter: "Duality",
    theme: "Improving and perfecting",
    description: "This incarnation cross represents individuals who are naturally good at identifying what needs to be corrected or improved."
  },
  {
    name: "Juxtaposition Cross of Crisis",
    type: "Juxtaposition",
    gates: { consciousSun: 36, consciousEarth: 6, unconsciousSun: 10, unconsciousEarth: 15 },
    quarter: "Initiation",
    theme: "Navigating through turmoil",
    description: "Those with this cross often find themselves in the middle of crises, either as the ones experiencing them or as the ones providing help."
  },
  {
    name: "Juxtaposition Cross of Denial",
    type: "Juxtaposition",
    gates: { consciousSun: 40, consciousEarth: 37, unconsciousSun: 35, unconsciousEarth: 5 },
    quarter: "Duality",
    theme: "Setting boundaries",
    description: "This incarnation cross signifies individuals who may find themselves frequently denying or being denied. They learn valuable lessons about patience and acceptance."
  },
  {
    name: "Juxtaposition Cross of Conflict",
    type: "Juxtaposition",
    gates: { consciousSun: 6, consciousEarth: 36, unconsciousSun: 15, unconsciousEarth: 10 },
    quarter: "Duality",
    theme: "Resolving through friction",
    description: "Individuals with this cross often find themselves in the midst of conflicts. They possess the ability to understand different perspectives and mediate disputes."
  },
  {
    name: "Juxtaposition Cross of Confusion",
    type: "Juxtaposition",
    gates: { consciousSun: 64, consciousEarth: 63, unconsciousSun: 45, unconsciousEarth: 26 },
    quarter: "Duality",
    theme: "Finding clarity through chaos",
    description: "Those with this cross may experience periods of confusion but are adept at finding clarity. They may be excellent problem-solvers."
  },
  {
    name: "Juxtaposition Cross of Conservation",
    type: "Juxtaposition",
    gates: { consciousSun: 32, consciousEarth: 42, unconsciousSun: 56, unconsciousEarth: 60 },
    quarter: "Duality",
    theme: "Preserving what has value",
    description: "This incarnation cross represents individuals who value conservation and preservation. They are often deeply connected to traditions, history, or nature."
  },
  {
    name: "Juxtaposition Cross of Contribution",
    type: "Juxtaposition",
    gates: { consciousSun: 8, consciousEarth: 14, unconsciousSun: 55, unconsciousEarth: 59 },
    quarter: "Civilization",
    theme: "Making a meaningful impact",
    description: "Individuals with this cross are often driven by a desire to contribute to their community or society. They are usually highly energetic and passionate."
  },
  {
    name: "Juxtaposition Cross of Depth",
    type: "Juxtaposition",
    gates: { consciousSun: 48, consciousEarth: 21, unconsciousSun: 53, unconsciousEarth: 54 },
    quarter: "Duality",
    theme: "Seeking profound understanding",
    description: "This incarnation cross signifies individuals who have a deep understanding of certain subjects. They are often thinkers and seekers."
  },
  {
    name: "Juxtaposition Cross of Detail",
    type: "Juxtaposition",
    gates: { consciousSun: 62, consciousEarth: 61, unconsciousSun: 3, unconsciousEarth: 50 },
    quarter: "Civilization",
    theme: "Precision and accuracy",
    description: "Those with this cross are often meticulous and detail-oriented. They have an innate ability to notice the small things that others may overlook."
  },
  {
    name: "Juxtaposition Cross of Fates",
    type: "Juxtaposition",
    gates: { consciousSun: 30, consciousEarth: 29, unconsciousSun: 34, unconsciousEarth: 20 },
    quarter: "Initiation",
    theme: "Embracing destiny's path",
    description: "Individuals with this cross often feel like they are at the mercy of fate. They may experience sudden and unexpected changes in their life."
  },
  {
    name: "Juxtaposition Cross of Fantasy",
    type: "Juxtaposition",
    gates: { consciousSun: 41, consciousEarth: 31, unconsciousSun: 44, unconsciousEarth: 24 },
    quarter: "Initiation",
    theme: "Dreaming new possibilities",
    description: "This incarnation cross signifies individuals who often live in a world of imagination and fantasy. They may be highly creative."
  },
  {
    name: "Juxtaposition Cross of Extremes",
    type: "Juxtaposition",
    gates: { consciousSun: 15, consciousEarth: 10, unconsciousSun: 17, unconsciousEarth: 18 },
    quarter: "Civilization",
    theme: "Navigating polarities",
    description: "Those with this cross often experience life in extremes. They might find themselves going from highs to lows quickly."
  },
  {
    name: "Juxtaposition Cross of Experimentation",
    type: "Juxtaposition",
    gates: { consciousSun: 16, consciousEarth: 9, unconsciousSun: 63, unconsciousEarth: 64 },
    quarter: "Civilization",
    theme: "Testing and refining",
    description: "This incarnation cross represents individuals who thrive on experimentation. They often enjoy pushing boundaries and trying new things."
  },
  {
    name: "Juxtaposition Cross of Experience",
    type: "Juxtaposition",
    gates: { consciousSun: 35, consciousEarth: 5, unconsciousSun: 22, unconsciousEarth: 47 },
    quarter: "Civilization",
    theme: "Learning through living",
    description: "Individuals with this cross value experience above all else. They often prefer to learn by doing."
  },
  {
    name: "Juxtaposition Cross of Empowering",
    type: "Juxtaposition",
    gates: { consciousSun: 14, consciousEarth: 8, unconsciousSun: 59, unconsciousEarth: 55 },
    quarter: "Mutation",
    theme: "Lifting others up",
    description: "This incarnation cross signifies individuals who have a knack for empowering others. They often possess a strong drive and can inspire those around them."
  },
  {
    name: "Juxtaposition Cross of The Driver",
    type: "Juxtaposition",
    gates: { consciousSun: 2, consciousEarth: 1, unconsciousSun: 49, unconsciousEarth: 4 },
    quarter: "Civilization",
    theme: "Moving toward direction",
    description: "Individuals with this cross often feel a strong urge to drive forward and achieve their goals. They may be highly motivated and determined."
  },
  {
    name: "Juxtaposition Cross of Doubts",
    type: "Juxtaposition",
    gates: { consciousSun: 63, consciousEarth: 64, unconsciousSun: 26, unconsciousEarth: 45 },
    quarter: "Initiation",
    theme: "Questioning toward truth",
    description: "Those with this cross often experience doubts and uncertainties. They may often question themselves and their decisions."
  },
  {
    name: "Juxtaposition Cross of Formulization",
    type: "Juxtaposition",
    gates: { consciousSun: 4, consciousEarth: 49, unconsciousSun: 8, unconsciousEarth: 14 },
    quarter: "Duality",
    theme: "Creating systems and structures",
    description: "This incarnation cross represents individuals who have a knack for creating formulas or systems. They are often logical and methodical."
  },
  {
    name: "Juxtaposition Cross of Focus",
    type: "Juxtaposition",
    gates: { consciousSun: 9, consciousEarth: 16, unconsciousSun: 64, unconsciousEarth: 63 },
    quarter: "Mutation",
    theme: "Concentrated attention",
    description: "Individuals with this cross often have an exceptional ability to focus. They can concentrate on tasks and problems with intense precision."
  },
  {
    name: "Juxtaposition Cross of Interaction",
    type: "Juxtaposition",
    gates: { consciousSun: 7, consciousEarth: 13, unconsciousSun: 23, unconsciousEarth: 43 },
    quarter: "Duality",
    theme: "Engaging with others",
    description: "Individuals with this incarnation cross are often social butterflies. They thrive on interaction, dialogue, and the exchange of ideas."
  },
  {
    name: "Juxtaposition Cross of Intuition",
    type: "Juxtaposition",
    gates: { consciousSun: 57, consciousEarth: 51, unconsciousSun: 62, unconsciousEarth: 61 },
    quarter: "Duality",
    theme: "Trusting inner knowing",
    description: "This incarnation cross is linked with individuals who have a strong intuitive sense. They often have an uncanny ability to predict outcomes."
  },
  {
    name: "Juxtaposition Cross of Innocence",
    type: "Juxtaposition",
    gates: { consciousSun: 25, consciousEarth: 46, unconsciousSun: 58, unconsciousEarth: 52 },
    quarter: "Initiation",
    theme: "Approaching life with wonder",
    description: "Those with this cross often possess a sense of innocence and purity. They may approach life with a sense of wonder and awe."
  },
  {
    name: "Juxtaposition Cross of Insight",
    type: "Juxtaposition",
    gates: { consciousSun: 43, consciousEarth: 23, unconsciousSun: 29, unconsciousEarth: 30 },
    quarter: "Duality",
    theme: "Seeing beneath the surface",
    description: "This incarnation cross signifies individuals who are often gifted with deep insight. They may have a unique perspective on life."
  },
  {
    name: "Juxtaposition Cross of Ideas",
    type: "Juxtaposition",
    gates: { consciousSun: 11, consciousEarth: 12, unconsciousSun: 46, unconsciousEarth: 25 },
    quarter: "Mutation",
    theme: "Generating new concepts",
    description: "Individuals with this cross are often brimming with ideas. They can think outside the box and may be drawn to innovative fields."
  },
  {
    name: "Juxtaposition Cross of Influence",
    type: "Juxtaposition",
    gates: { consciousSun: 31, consciousEarth: 41, unconsciousSun: 24, unconsciousEarth: 44 },
    quarter: "Civilization",
    theme: "Shaping collective direction",
    description: "This incarnation cross signifies individuals who often have a strong influence on those around them. They may be natural leaders or role models."
  },
  {
    name: "Juxtaposition Cross of Grace",
    type: "Juxtaposition",
    gates: { consciousSun: 22, consciousEarth: 47, unconsciousSun: 11, unconsciousEarth: 12 },
    quarter: "Initiation",
    theme: "Moving with elegance",
    description: "Those with this cross often move through life with grace and elegance. They may have a natural sense of style and aesthetic."
  },
  {
    name: "Juxtaposition Cross of Habits",
    type: "Juxtaposition",
    gates: { consciousSun: 5, consciousEarth: 35, unconsciousSun: 47, unconsciousEarth: 22 },
    quarter: "Mutation",
    theme: "Establishing rhythm and routine",
    description: "Individuals with this cross often have a strong tendency towards routine and habit. They may find comfort and stability in routine."
  },
  {
    name: "Juxtaposition Cross of Limitation",
    type: "Juxtaposition",
    gates: { consciousSun: 60, consciousEarth: 56, unconsciousSun: 28, unconsciousEarth: 27 },
    quarter: "Initiation",
    theme: "Transcending constraints",
    description: "This incarnation cross signifies individuals who often feel limited or restricted in some way. They may have a strong desire to break free."
  },
  {
    name: "Juxtaposition Cross of Listening",
    type: "Juxtaposition",
    gates: { consciousSun: 13, consciousEarth: 7, unconsciousSun: 43, unconsciousEarth: 23 },
    quarter: "Initiation",
    theme: "Hearing what others need",
    description: "Individuals with this cross often have exceptional listening skills. They can be empathetic and understanding, making them excellent confidantes."
  },
  // ========== LEFT ANGLE CROSSES ==========
  {
    name: "Left Angle Cross of The Alpha",
    type: "Left Angle",
    gates: { consciousSun: 41, consciousEarth: 31, unconsciousSun: 44, unconsciousEarth: 24 },
    quarter: "Initiation",
    theme: "Leading through vision",
    description: "Those born under this cross are often natural leaders. They have a strong sense of direction and a capacity to inspire others."
  },
  {
    name: "Left Angle Cross of The Alpha 2",
    type: "Left Angle",
    gates: { consciousSun: 31, consciousEarth: 41, unconsciousSun: 24, unconsciousEarth: 44 },
    quarter: "Civilization",
    theme: "Democratic leadership",
    description: "This incarnation cross represents a natural inclination towards leadership with slightly different dynamics. Those with this cross often feel a deep desire to pioneer new paths."
  },
  {
    name: "Left Angle Cross of Alignment",
    type: "Left Angle",
    gates: { consciousSun: 28, consciousEarth: 27, unconsciousSun: 33, unconsciousEarth: 19 },
    quarter: "Duality",
    theme: "Finding your true path",
    description: "Individuals with this cross have a unique ability to align themselves with their true path. They are often in tune with their inner compass."
  },
  {
    name: "Left Angle Cross of Alignment 2",
    type: "Left Angle",
    gates: { consciousSun: 27, consciousEarth: 28, unconsciousSun: 19, unconsciousEarth: 33 },
    quarter: "Initiation",
    theme: "Aligning others to purpose",
    description: "This cross represents the drive to align oneself and others with their core values and principles. These individuals often have an innate ability to help others find their path."
  },
  {
    name: "Left Angle Cross of The Clarion",
    type: "Left Angle",
    gates: { consciousSun: 57, consciousEarth: 51, unconsciousSun: 62, unconsciousEarth: 61 },
    quarter: "Duality",
    theme: "Awakening through intuition",
    description: "This cross represents a calling to awaken others. Those with this cross often have a unique ability to alert others to important truths."
  },
  {
    name: "Left Angle Cross of The Clarion 2",
    type: "Left Angle",
    gates: { consciousSun: 51, consciousEarth: 57, unconsciousSun: 61, unconsciousEarth: 62 },
    quarter: "Mutation",
    theme: "Shocking into awareness",
    description: "Similar to the first Clarion cross, these individuals also have the ability to awaken others to truths. They may be more introspective in their process of spreading awareness."
  },
  {
    name: "Left Angle Cross of Cycles",
    type: "Left Angle",
    gates: { consciousSun: 53, consciousEarth: 54, unconsciousSun: 42, unconsciousEarth: 32 },
    quarter: "Civilization",
    theme: "Understanding life's rhythms",
    description: "This cross represents individuals who are naturally attuned to the cycles of life and can anticipate and adapt to change effectively."
  },
  {
    name: "Left Angle Cross of Cycles 2",
    type: "Left Angle",
    gates: { consciousSun: 54, consciousEarth: 53, unconsciousSun: 32, unconsciousEarth: 42 },
    quarter: "Civilization",
    theme: "Evolving through transitions",
    description: "Individuals with this cross still have a profound understanding of life's cycles, but they may be more focused on the evolution of situations and relationships."
  },
  {
    name: "Left Angle Cross of Confrontation",
    type: "Left Angle",
    gates: { consciousSun: 45, consciousEarth: 26, unconsciousSun: 36, unconsciousEarth: 6 },
    quarter: "Civilization",
    theme: "Facing challenges directly",
    description: "This incarnation cross signifies individuals who aren't afraid to face challenges head-on. They may have a natural ability to confront and resolve conflicts."
  },
  {
    name: "Left Angle Cross of Confrontation 2",
    type: "Left Angle",
    gates: { consciousSun: 26, consciousEarth: 45, unconsciousSun: 6, unconsciousEarth: 36 },
    quarter: "Mutation",
    theme: "Proactive problem-solving",
    description: "Individuals with this cross have similar traits but may be more proactive in seeking out opportunities for growth and improvement."
  },
  {
    name: "Left Angle Cross of Defiance",
    type: "Left Angle",
    gates: { consciousSun: 2, consciousEarth: 1, unconsciousSun: 49, unconsciousEarth: 4 },
    quarter: "Civilization",
    theme: "Challenging the status quo",
    description: "This incarnation cross represents individuals with a strong spirit of defiance and a desire to challenge the status quo."
  },
  {
    name: "Left Angle Cross of Defiance 2",
    type: "Left Angle",
    gates: { consciousSun: 1, consciousEarth: 2, unconsciousSun: 4, unconsciousEarth: 49 },
    quarter: "Initiation",
    theme: "Authentic self-discovery",
    description: "Those with this cross share the defiant spirit but may place more emphasis on self-discovery and personal development."
  },
  {
    name: "Left Angle Cross of Dedication",
    type: "Left Angle",
    gates: { consciousSun: 23, consciousEarth: 43, unconsciousSun: 30, unconsciousEarth: 29 },
    quarter: "Civilization",
    theme: "Committed to ideals",
    description: "This cross signifies individuals who are dedicated to their ideals and goals. They often possess a deep sense of purpose that drives them to persevere."
  },
  {
    name: "Left Angle Cross of Dedication 2",
    type: "Left Angle",
    gates: { consciousSun: 43, consciousEarth: 23, unconsciousSun: 29, unconsciousEarth: 30 },
    quarter: "Duality",
    theme: "Pursuing truth relentlessly",
    description: "Individuals with this cross are similarly dedicated but may be more focused on the pursuit of truth and understanding."
  },
  {
    name: "Left Angle Cross of Demands",
    type: "Left Angle",
    gates: { consciousSun: 52, consciousEarth: 58, unconsciousSun: 21, unconsciousEarth: 48 },
    quarter: "Civilization",
    theme: "Asserting personal needs",
    description: "This incarnation cross represents individuals who are not afraid to make demands and assert their needs. They often have a strong sense of self-worth."
  },
  {
    name: "Left Angle Cross of Demands 2",
    type: "Left Angle",
    gates: { consciousSun: 58, consciousEarth: 52, unconsciousSun: 48, unconsciousEarth: 21 },
    quarter: "Mutation",
    theme: "Seeking joy and fulfillment",
    description: "Those with this cross are similarly assertive but may place more emphasis on seeking pleasure and joy in life."
  },
  {
    name: "Left Angle Cross of Dominion",
    type: "Left Angle",
    gates: { consciousSun: 64, consciousEarth: 63, unconsciousSun: 45, unconsciousEarth: 26 },
    quarter: "Duality",
    theme: "Commanding through mental clarity",
    description: "Those with this cross often have a strong desire to be in control. They may be naturally dominant and assertive, and they prefer to take the lead in most situations."
  },
  {
    name: "Left Angle Cross of Dominion 2",
    type: "Left Angle",
    gates: { consciousSun: 63, consciousEarth: 64, unconsciousSun: 26, unconsciousEarth: 45 },
    quarter: "Initiation",
    theme: "Transforming through proof and stewardship",
    description: "People under this cross are often authoritative and prefer to have control over their environment. They can be natural leaders, commanding respect and authority."
  },
  {
    name: "Left Angle Cross of Industry",
    type: "Left Angle",
    gates: { consciousSun: 30, consciousEarth: 29, unconsciousSun: 34, unconsciousEarth: 20 },
    quarter: "Initiation",
    theme: "Working toward fulfillment",
    description: "People with this incarnation cross are usually hard workers, often finding fulfillment in their industriousness."
  },
  {
    name: "Left Angle Cross of Industry 2",
    type: "Left Angle",
    gates: { consciousSun: 29, consciousEarth: 30, unconsciousSun: 20, unconsciousEarth: 34 },
    quarter: "Duality",
    theme: "Tireless dedication to creation",
    description: "Individuals with this incarnation cross are known for their tireless work ethic. They're often driven by an internal need to create and accomplish."
  },
  {
    name: "Left Angle Cross of Incarnation",
    type: "Left Angle",
    gates: { consciousSun: 24, consciousEarth: 44, unconsciousSun: 13, unconsciousEarth: 7 },
    quarter: "Initiation",
    theme: "Deep introspection on existence",
    description: "Those with this cross are typically deeply introspective, often pondering life's deeper meanings and their place within the world."
  },
  {
    name: "Left Angle Cross of Incarnation 2",
    type: "Left Angle",
    gates: { consciousSun: 44, consciousEarth: 24, unconsciousSun: 7, unconsciousEarth: 13 },
    quarter: "Duality",
    theme: "Reflective nature seeking purpose",
    description: "People with this incarnation cross are often characterized by their reflective nature. They frequently question the nature of their existence."
  },
  {
    name: "Left Angle Cross of Individualism",
    type: "Left Angle",
    gates: { consciousSun: 39, consciousEarth: 38, unconsciousSun: 51, unconsciousEarth: 57 },
    quarter: "Civilization",
    theme: "Forging your own path",
    description: "Individuals with this cross are usually independent, preferring to forge their own path rather than follow the crowd."
  },
  {
    name: "Left Angle Cross of Individualism 2",
    type: "Left Angle",
    gates: { consciousSun: 38, consciousEarth: 39, unconsciousSun: 57, unconsciousEarth: 51 },
    quarter: "Mutation",
    theme: "Fierce self-reliance",
    description: "Those with this incarnation cross are often characterized by their fierce individuality. They are typically self-reliant and comfortable with charting their own course."
  },
  {
    name: "Left Angle Cross of Healing",
    type: "Left Angle",
    gates: { consciousSun: 25, consciousEarth: 46, unconsciousSun: 58, unconsciousEarth: 52 },
    quarter: "Initiation",
    theme: "Bringing restoration to others",
    description: "People with this incarnation cross often have a natural ability to heal, whether it's physical, emotional, or spiritual healing."
  },
  {
    name: "Left Angle Cross of Healing 2",
    type: "Left Angle",
    gates: { consciousSun: 46, consciousEarth: 25, unconsciousSun: 52, unconsciousEarth: 58 },
    quarter: "Duality",
    theme: "Natural affinity for wellness",
    description: "Individuals with this cross have a natural affinity for healing. They may be instinctively drawn to helping others."
  },
  {
    name: "Left Angle Cross of Identification",
    type: "Left Angle",
    gates: { consciousSun: 16, consciousEarth: 9, unconsciousSun: 63, unconsciousEarth: 64 },
    quarter: "Civilization",
    theme: "Strong sense of self",
    description: "Individuals with this cross often have a strong sense of self and a clear understanding of their identity."
  },
  {
    name: "Left Angle Cross of Identification 2",
    type: "Left Angle",
    gates: { consciousSun: 9, consciousEarth: 16, unconsciousSun: 64, unconsciousEarth: 63 },
    quarter: "Mutation",
    theme: "Secure in authentic expression",
    description: "Those with this incarnation cross are typically secure in their identity. They have a clear understanding of who they are."
  },
  {
    name: "Left Angle Cross of Endeavor",
    type: "Left Angle",
    gates: { consciousSun: 48, consciousEarth: 21, unconsciousSun: 53, unconsciousEarth: 54 },
    quarter: "Duality",
    theme: "Relentless pursuit of goals",
    description: "Those with this incarnation cross are known for their relentless pursuit of their goals. They are not easily deterred by obstacles."
  },
  {
    name: "Left Angle Cross of Endeavor 2",
    type: "Left Angle",
    gates: { consciousSun: 21, consciousEarth: 48, unconsciousSun: 54, unconsciousEarth: 53 },
    quarter: "Duality",
    theme: "Hard work and commitment",
    description: "People under this cross are typically hard workers, committed to their work, and are often able to concentrate on their goals."
  },
  {
    name: "Left Angle Cross of Duality",
    type: "Left Angle",
    gates: { consciousSun: 34, consciousEarth: 20, unconsciousSun: 40, unconsciousEarth: 37 },
    quarter: "Mutation",
    theme: "Seeing multiple perspectives",
    description: "This cross denotes individuals who often see both sides of a situation. They have the ability to consider different perspectives, making them effective mediators."
  },
  {
    name: "Left Angle Cross of Duality 2",
    type: "Left Angle",
    gates: { consciousSun: 20, consciousEarth: 34, unconsciousSun: 37, unconsciousEarth: 40 },
    quarter: "Civilization",
    theme: "Balanced and objective",
    description: "These individuals possess a balanced perspective. They are often seen to be level-headed, objective, and considerate of multiple perspectives."
  },
  {
    name: "Left Angle Cross of Education",
    type: "Left Angle",
    gates: { consciousSun: 11, consciousEarth: 12, unconsciousSun: 46, unconsciousEarth: 25 },
    quarter: "Mutation",
    theme: "Love of learning and teaching",
    description: "Individuals with this incarnation cross often have a deep love for learning and education. They are usually eager to broaden their knowledge."
  },
  {
    name: "Left Angle Cross of Education 2",
    type: "Left Angle",
    gates: { consciousSun: 12, consciousEarth: 11, unconsciousSun: 25, unconsciousEarth: 46 },
    quarter: "Civilization",
    theme: "Lifelong pursuit of knowledge",
    description: "The people under this cross possess a deep-rooted curiosity and passion for knowledge. They are typically life-long learners."
  },
  {
    name: "Left Angle Cross of Distraction",
    type: "Left Angle",
    gates: { consciousSun: 60, consciousEarth: 56, unconsciousSun: 28, unconsciousEarth: 27 },
    quarter: "Initiation",
    theme: "Drawn to many interests",
    description: "This incarnation cross suggests individuals who can easily get distracted. They may be drawn to various interests, activities, and ideas."
  },
  {
    name: "Left Angle Cross of Distraction 2",
    type: "Left Angle",
    gates: { consciousSun: 56, consciousEarth: 60, unconsciousSun: 27, unconsciousEarth: 28 },
    quarter: "Civilization",
    theme: "Multiple creative pursuits",
    description: "The individuals under this cross are often pulled in multiple directions due to their varied interests. They may struggle with focusing their attention."
  },
  {
    name: "Left Angle Cross of Masks",
    type: "Left Angle",
    gates: { consciousSun: 13, consciousEarth: 7, unconsciousSun: 43, unconsciousEarth: 23 },
    quarter: "Initiation",
    theme: "Adapting to different roles",
    description: "This cross suggests individuals who often find themselves playing different roles or 'wearing different masks' in their interactions with others."
  },
  {
    name: "Left Angle Cross of Masks 2",
    type: "Left Angle",
    gates: { consciousSun: 7, consciousEarth: 13, unconsciousSun: 23, unconsciousEarth: 43 },
    quarter: "Duality",
    theme: "Versatile communication",
    description: "Individuals with this cross often have the ability to shift their persona depending on their environment or the people they interact with."
  },
  {
    name: "Left Angle Cross of Migration",
    type: "Left Angle",
    gates: { consciousSun: 37, consciousEarth: 40, unconsciousSun: 5, unconsciousEarth: 35 },
    quarter: "Initiation",
    theme: "Seeking change and growth",
    description: "This incarnation cross often indicates individuals who are constantly seeking change, growth, and new experiences."
  },
  {
    name: "Left Angle Cross of Migration 2",
    type: "Left Angle",
    gates: { consciousSun: 40, consciousEarth: 37, unconsciousSun: 35, unconsciousEarth: 5 },
    quarter: "Duality",
    theme: "Constant evolution",
    description: "These individuals often feel a strong need for constant change and evolution. This may manifest as a literal desire for physical movement."
  },
  {
    name: "Left Angle Cross of Informing",
    type: "Left Angle",
    gates: { consciousSun: 22, consciousEarth: 47, unconsciousSun: 11, unconsciousEarth: 12 },
    quarter: "Initiation",
    theme: "Sharing knowledge",
    description: "Individuals with this incarnation cross often possess a natural ability to collect, process, and disseminate information."
  },
  {
    name: "Left Angle Cross of Informing 2",
    type: "Left Angle",
    gates: { consciousSun: 47, consciousEarth: 22, unconsciousSun: 12, unconsciousEarth: 11 },
    quarter: "Duality",
    theme: "Researching and distributing",
    description: "Individuals with this cross have a talent for gathering and distributing information. They may thrive in careers that involve research or communication."
  },
  {
    name: "Left Angle Cross of Limitation",
    type: "Left Angle",
    gates: { consciousSun: 42, consciousEarth: 32, unconsciousSun: 60, unconsciousEarth: 56 },
    quarter: "Duality",
    theme: "Understanding boundaries",
    description: "Individuals with this cross often have a keen understanding of boundaries and limitations. They may excel in roles where this understanding can be put to good use."
  },
  {
    name: "Left Angle Cross of Limitation 2",
    type: "Left Angle",
    gates: { consciousSun: 32, consciousEarth: 42, unconsciousSun: 56, unconsciousEarth: 60 },
    quarter: "Duality",
    theme: "Strategic constraint awareness",
    description: "Those with this incarnation cross often have a deep understanding of limitations and boundaries. They could thrive in roles that require careful planning."
  },
  {
    name: "Left Angle Cross of Obscuration",
    type: "Left Angle",
    gates: { consciousSun: 62, consciousEarth: 61, unconsciousSun: 3, unconsciousEarth: 50 },
    quarter: "Civilization",
    theme: "Uncovering hidden truths",
    description: "This incarnation cross suggests individuals who have the ability to uncover hidden or obscured information."
  },
  {
    name: "Left Angle Cross of Obscuration 2",
    type: "Left Angle",
    gates: { consciousSun: 61, consciousEarth: 62, unconsciousSun: 50, unconsciousEarth: 3 },
    quarter: "Mutation",
    theme: "Revealing deeper realities",
    description: "Individuals with this incarnation cross often possess a talent for revealing hidden truths or obscured information."
  },
  {
    name: "Left Angle Cross of Wishes",
    type: "Left Angle",
    gates: { consciousSun: 3, consciousEarth: 50, unconsciousSun: 41, unconsciousEarth: 31 },
    quarter: "Initiation",
    theme: "Manifesting dreams",
    description: "Individuals with this incarnation cross are often driven by their dreams and desires. They are likely to be creative, with an ability to conceive of possibilities."
  },
  {
    name: "Left Angle Cross of Wishes 2",
    type: "Left Angle",
    gates: { consciousSun: 50, consciousEarth: 3, unconsciousSun: 31, unconsciousEarth: 41 },
    quarter: "Initiation",
    theme: "Values-driven dreaming",
    description: "Similar to the previous cross, these individuals are often driven by their dreams and desires but with a stronger focus on values and responsibility."
  },
  // ========== RIGHT ANGLE CROSSES ==========
  {
    name: "Right Angle Cross of Explanation",
    type: "Right Angle",
    gates: { consciousSun: 49, consciousEarth: 4, unconsciousSun: 43, unconsciousEarth: 23 },
    quarter: "Initiation",
    theme: "Making complex ideas accessible",
    description: "Those with this cross often have an inherent ability to articulate complex ideas in a simplified, understandable manner."
  },
  {
    name: "Right Angle Cross of Explanation 2",
    type: "Right Angle",
    gates: { consciousSun: 23, consciousEarth: 43, unconsciousSun: 49, unconsciousEarth: 4 },
    quarter: "Civilization",
    theme: "Teaching and clarifying",
    description: "Individuals with this incarnation cross are often proficient at making intricate concepts accessible to others."
  },
  {
    name: "Right Angle Cross of Explanation 3",
    type: "Right Angle",
    gates: { consciousSun: 4, consciousEarth: 49, unconsciousSun: 23, unconsciousEarth: 43 },
    quarter: "Duality",
    theme: "Analytical interpretation",
    description: "People with this incarnation cross are typically good at deciphering complex ideas and communicating them effectively."
  },
  {
    name: "Right Angle Cross of Explanation 4",
    type: "Right Angle",
    gates: { consciousSun: 43, consciousEarth: 23, unconsciousSun: 4, unconsciousEarth: 49 },
    quarter: "Duality",
    theme: "Simplifying complexity",
    description: "Those with this cross are often gifted at making sense of complex ideas and explaining them in simple terms."
  },
  {
    name: "Right Angle Cross of The Four Ways",
    type: "Right Angle",
    gates: { consciousSun: 24, consciousEarth: 44, unconsciousSun: 19, unconsciousEarth: 33 },
    quarter: "Initiation",
    theme: "Multiple perspective awareness",
    description: "Individuals with this incarnation cross often have an ability to see things from multiple perspectives."
  },
  {
    name: "Right Angle Cross of The Four Ways 2",
    type: "Right Angle",
    gates: { consciousSun: 33, consciousEarth: 19, unconsciousSun: 24, unconsciousEarth: 44 },
    quarter: "Civilization",
    theme: "Flexible thinking",
    description: "Those with this incarnation cross are typically able to perceive things from various perspectives and are usually flexible thinkers."
  },
  {
    name: "Right Angle Cross of The Four Ways 3",
    type: "Right Angle",
    gates: { consciousSun: 44, consciousEarth: 24, unconsciousSun: 33, unconsciousEarth: 19 },
    quarter: "Duality",
    theme: "Adaptable viewpoint",
    description: "People with this incarnation cross often have the ability to perceive things from different angles."
  },
  {
    name: "Right Angle Cross of The Four Ways 4",
    type: "Right Angle",
    gates: { consciousSun: 19, consciousEarth: 33, unconsciousSun: 44, unconsciousEarth: 24 },
    quarter: "Initiation",
    theme: "Intuitive perspective shifting",
    description: "Those with this cross typically have the ability to view things from various perspectives and can shift their viewpoint to suit the situation."
  },
  {
    name: "Right Angle Cross of Laws",
    type: "Right Angle",
    gates: { consciousSun: 3, consciousEarth: 50, unconsciousSun: 60, unconsciousEarth: 56 },
    quarter: "Initiation",
    theme: "Establishing order through mutation",
    description: "This cross carries the energy of bringing order out of chaos through accepting limitation and then transcending it."
  },
  {
    name: "Right Angle Cross of Laws 2",
    type: "Right Angle",
    gates: { consciousSun: 50, consciousEarth: 3, unconsciousSun: 56, unconsciousEarth: 60 },
    quarter: "Initiation",
    theme: "Guardian of tribal values",
    description: "This cross carries the energy of preserving and upholding what is correct for the community."
  },
  {
    name: "Right Angle Cross of Laws 3",
    type: "Right Angle",
    gates: { consciousSun: 56, consciousEarth: 60, unconsciousSun: 3, unconsciousEarth: 50 },
    quarter: "Civilization",
    theme: "Communicating structure",
    description: "People with this incarnation cross typically have a natural understanding of order and structure."
  },
  {
    name: "Right Angle Cross of Laws 4",
    type: "Right Angle",
    gates: { consciousSun: 60, consciousEarth: 56, unconsciousSun: 50, unconsciousEarth: 3 },
    quarter: "Initiation",
    theme: "Accepting necessary limits",
    description: "This incarnation cross often produces people who are deeply interested in rules, structures, and the ways societies govern themselves."
  },
  {
    name: "Right Angle Cross of Planning",
    type: "Right Angle",
    gates: { consciousSun: 40, consciousEarth: 37, unconsciousSun: 16, unconsciousEarth: 9 },
    quarter: "Duality",
    theme: "Strategic preparation",
    description: "People with this cross often have a natural aptitude for strategic planning and organization."
  },
  {
    name: "Right Angle Cross of Planning 2",
    type: "Right Angle",
    gates: { consciousSun: 9, consciousEarth: 16, unconsciousSun: 40, unconsciousEarth: 37 },
    quarter: "Mutation",
    theme: "Focused foresight",
    description: "Individuals with this cross are often skilled in planning and foresight. They have a knack for seeing the bigger picture."
  },
  {
    name: "Right Angle Cross of Planning 3",
    type: "Right Angle",
    gates: { consciousSun: 37, consciousEarth: 40, unconsciousSun: 9, unconsciousEarth: 16 },
    quarter: "Initiation",
    theme: "Community-focused planning",
    description: "People with this cross are typically adept at crafting plans and strategies with community needs in mind."
  },
  {
    name: "Right Angle Cross of Planning 4",
    type: "Right Angle",
    gates: { consciousSun: 16, consciousEarth: 9, unconsciousSun: 37, unconsciousEarth: 40 },
    quarter: "Civilization",
    theme: "Mastery through planning",
    description: "Those with this cross are often proficient in strategic planning, skillfully navigating future possibilities."
  },
  {
    name: "Right Angle Cross of Rulership",
    type: "Right Angle",
    gates: { consciousSun: 47, consciousEarth: 22, unconsciousSun: 45, unconsciousEarth: 26 },
    quarter: "Duality",
    theme: "Natural leadership ability",
    description: "Individuals with this incarnation cross often have natural leadership abilities."
  },
  {
    name: "Right Angle Cross of Rulership 2",
    type: "Right Angle",
    gates: { consciousSun: 26, consciousEarth: 45, unconsciousSun: 47, unconsciousEarth: 22 },
    quarter: "Mutation",
    theme: "Navigating power structures",
    description: "People with this cross typically possess innate leadership qualities. They are adept at understanding and navigating power structures."
  },
  {
    name: "Right Angle Cross of Rulership 3",
    type: "Right Angle",
    gates: { consciousSun: 22, consciousEarth: 47, unconsciousSun: 26, unconsciousEarth: 45 },
    quarter: "Initiation",
    theme: "Leading with emotional intelligence",
    description: "Those with this incarnation cross often have a natural talent for leadership, understanding complex systems and structures."
  },
  {
    name: "Right Angle Cross of Rulership 4",
    type: "Right Angle",
    gates: { consciousSun: 45, consciousEarth: 26, unconsciousSun: 22, unconsciousEarth: 47 },
    quarter: "Civilization",
    theme: "Responsible authority",
    description: "Individuals with this incarnation cross often have a natural aptitude for leadership. They understand systems and can effectively step into roles of authority."
  },
  {
    name: "Right Angle Cross of Service",
    type: "Right Angle",
    gates: { consciousSun: 17, consciousEarth: 18, unconsciousSun: 58, unconsciousEarth: 52 },
    quarter: "Mutation",
    theme: "Dedicated to helping others",
    description: "Individuals with this incarnation cross often feel a natural call to serve others."
  },
  {
    name: "Right Angle Cross of Service 2",
    type: "Right Angle",
    gates: { consciousSun: 52, consciousEarth: 58, unconsciousSun: 17, unconsciousEarth: 18 },
    quarter: "Civilization",
    theme: "Still service",
    description: "Those with this incarnation cross are often driven by a desire to serve others."
  },
  {
    name: "Right Angle Cross of Service 3",
    type: "Right Angle",
    gates: { consciousSun: 58, consciousEarth: 52, unconsciousSun: 18, unconsciousEarth: 17 },
    quarter: "Mutation",
    theme: "Joyful contribution",
    description: "This incarnation cross suggests a calling towards service to others with an emphasis on joy."
  },
  {
    name: "Right Angle Cross of Service 4",
    type: "Right Angle",
    gates: { consciousSun: 18, consciousEarth: 17, unconsciousSun: 52, unconsciousEarth: 58 },
    quarter: "Duality",
    theme: "Corrective service",
    description: "Individuals with this incarnation cross often feel a strong calling towards service with a focus on improvement."
  },
  {
    name: "Right Angle Cross of Maya",
    type: "Right Angle",
    gates: { consciousSun: 62, consciousEarth: 61, unconsciousSun: 42, unconsciousEarth: 32 },
    quarter: "Civilization",
    theme: "Understanding intricate systems",
    description: "Individuals with this incarnation cross often have a knack for understanding the intricacies of the world around them."
  },
  {
    name: "Right Angle Cross of Maya 2",
    type: "Right Angle",
    gates: { consciousSun: 42, consciousEarth: 32, unconsciousSun: 61, unconsciousEarth: 62 },
    quarter: "Duality",
    theme: "Navigating complex systems",
    description: "Individuals with this cross may have a talent for understanding and navigating complex systems."
  },
  {
    name: "Right Angle Cross of Maya 3",
    type: "Right Angle",
    gates: { consciousSun: 61, consciousEarth: 62, unconsciousSun: 32, unconsciousEarth: 42 },
    quarter: "Mutation",
    theme: "Detail-oriented analysis",
    description: "This incarnation cross often suggests a person who is adept at understanding complex systems and structures."
  },
  {
    name: "Right Angle Cross of Maya 4",
    type: "Right Angle",
    gates: { consciousSun: 32, consciousEarth: 42, unconsciousSun: 62, unconsciousEarth: 61 },
    quarter: "Duality",
    theme: "Preserving complex knowledge",
    description: "Individuals with this incarnation cross are often skilled at understanding and working with intricate systems."
  },
  {
    name: "Right Angle Cross of Penetration",
    type: "Right Angle",
    gates: { consciousSun: 53, consciousEarth: 54, unconsciousSun: 51, unconsciousEarth: 57 },
    quarter: "Civilization",
    theme: "Getting to the heart of matters",
    description: "People with this incarnation cross often have a natural ability to get to the heart of matters."
  },
  {
    name: "Right Angle Cross of Penetration 2",
    type: "Right Angle",
    gates: { consciousSun: 51, consciousEarth: 57, unconsciousSun: 54, unconsciousEarth: 53 },
    quarter: "Mutation",
    theme: "Sharp perceptiveness",
    description: "Individuals with this cross often possess a sharp perceptiveness. They are able to cut through surface appearances."
  },
  {
    name: "Right Angle Cross of Penetration 3",
    type: "Right Angle",
    gates: { consciousSun: 54, consciousEarth: 53, unconsciousSun: 57, unconsciousEarth: 51 },
    quarter: "Civilization",
    theme: "Deep truth seeking",
    description: "Those with this incarnation cross are often highly perceptive. They have an innate ability to see beneath the surface."
  },
  {
    name: "Right Angle Cross of Penetration 4",
    type: "Right Angle",
    gates: { consciousSun: 57, consciousEarth: 51, unconsciousSun: 53, unconsciousEarth: 54 },
    quarter: "Duality",
    theme: "Intuitive insight",
    description: "Individuals with this incarnation cross are typically very perceptive. They have a knack for seeing beyond surface appearances."
  },
  {
    name: "Right Angle Cross of The Sleeping Phoenix",
    type: "Right Angle",
    gates: { consciousSun: 20, consciousEarth: 34, unconsciousSun: 55, unconsciousEarth: 59 },
    quarter: "Civilization",
    theme: "Dormant transformative power",
    description: "People with this incarnation cross often possess a transformative energy that can lie dormant until the right circumstances arise."
  },
  {
    name: "Right Angle Cross of The Sleeping Phoenix 2",
    type: "Right Angle",
    gates: { consciousSun: 55, consciousEarth: 59, unconsciousSun: 34, unconsciousEarth: 20 },
    quarter: "Initiation",
    theme: "Awakening potential",
    description: "These individuals may also possess a potential for significant transformation. The challenge lies in recognizing when to awaken this transformative power."
  },
  {
    name: "Right Angle Cross of The Sleeping Phoenix 3",
    type: "Right Angle",
    gates: { consciousSun: 34, consciousEarth: 20, unconsciousSun: 59, unconsciousEarth: 55 },
    quarter: "Mutation",
    theme: "Power waiting to emerge",
    description: "These individuals often possess a transformative energy that can lie dormant until the right circumstances. When awakened, this energy can inspire and lead others."
  },
  {
    name: "Right Angle Cross of The Sleeping Phoenix 4",
    type: "Right Angle",
    gates: { consciousSun: 59, consciousEarth: 55, unconsciousSun: 20, unconsciousEarth: 34 },
    quarter: "Duality",
    theme: "Intimate transformation",
    description: "Individuals with this cross also have the potential for significant transformation. The challenge lies in recognizing when the circumstances are right."
  },
  {
    name: "Right Angle Cross of The Sphinx",
    type: "Right Angle",
    gates: { consciousSun: 2, consciousEarth: 1, unconsciousSun: 13, unconsciousEarth: 7 },
    quarter: "Civilization",
    theme: "Curiosity and direction",
    description: "Individuals with this incarnation cross often possess a deep sense of curiosity and a desire for understanding."
  },
  {
    name: "Right Angle Cross of The Sphinx 2",
    type: "Right Angle",
    gates: { consciousSun: 13, consciousEarth: 7, unconsciousSun: 1, unconsciousEarth: 2 },
    quarter: "Initiation",
    theme: "Universal listener",
    description: "This cross carries the energy of listening to all of humanity and holding space for collective direction."
  },
  {
    name: "Right Angle Cross of The Sphinx 3",
    type: "Right Angle",
    gates: { consciousSun: 1, consciousEarth: 2, unconsciousSun: 7, unconsciousEarth: 13 },
    quarter: "Initiation",
    theme: "Creative direction seeking",
    description: "Those with this incarnation cross often possess a deep curiosity and desire to uncover the unknown."
  },
  {
    name: "Right Angle Cross of The Sphinx 4",
    type: "Right Angle",
    gates: { consciousSun: 7, consciousEarth: 13, unconsciousSun: 2, unconsciousEarth: 1 },
    quarter: "Duality",
    theme: "Leadership through listening",
    description: "These individuals often have a strong desire for understanding and exploration. They might excel in roles that allow them to delve into mysteries."
  },
  {
    name: "Right Angle Cross of Tension",
    type: "Right Angle",
    gates: { consciousSun: 38, consciousEarth: 39, unconsciousSun: 48, unconsciousEarth: 21 },
    quarter: "Mutation",
    theme: "Pressure as catalyst",
    description: "This cross carries the energy of creative tension that drives growth and innovation."
  },
  {
    name: "Right Angle Cross of Tension 2",
    type: "Right Angle",
    gates: { consciousSun: 39, consciousEarth: 38, unconsciousSun: 21, unconsciousEarth: 48 },
    quarter: "Civilization",
    theme: "Provoking depth",
    description: "Individuals with this cross often experience and create tension that leads to deeper understanding."
  },
  {
    name: "Right Angle Cross of Tension 3",
    type: "Right Angle",
    gates: { consciousSun: 48, consciousEarth: 21, unconsciousSun: 38, unconsciousEarth: 39 },
    quarter: "Duality",
    theme: "Depth through struggle",
    description: "Those with this cross often find wisdom through navigating tension and challenge."
  },
  {
    name: "Right Angle Cross of Tension 4",
    type: "Right Angle",
    gates: { consciousSun: 21, consciousEarth: 48, unconsciousSun: 39, unconsciousEarth: 38 },
    quarter: "Duality",
    theme: "Controlling through challenge",
    description: "People with this cross often transform tension into productive outcomes through their will and depth."
  },
  {
    name: "Right Angle Cross of Eden",
    type: "Right Angle",
    gates: { consciousSun: 12, consciousEarth: 11, unconsciousSun: 36, unconsciousEarth: 6 },
    quarter: "Civilization",
    theme: "Expressing the ideal",
    description: "This cross carries the energy of communicating visions of what could be - the potential paradise."
  },
  {
    name: "Right Angle Cross of Eden 2",
    type: "Right Angle",
    gates: { consciousSun: 11, consciousEarth: 12, unconsciousSun: 6, unconsciousEarth: 36 },
    quarter: "Mutation",
    theme: "Envisioning possibility",
    description: "Those with this cross often see the ideal potential in situations and can articulate this vision."
  },
  {
    name: "Right Angle Cross of Eden 3",
    type: "Right Angle",
    gates: { consciousSun: 36, consciousEarth: 6, unconsciousSun: 11, unconsciousEarth: 12 },
    quarter: "Initiation",
    theme: "Crisis as gateway",
    description: "Individuals with this cross often navigate crisis as a path to greater understanding and expression."
  },
  {
    name: "Right Angle Cross of Eden 4",
    type: "Right Angle",
    gates: { consciousSun: 6, consciousEarth: 36, unconsciousSun: 12, unconsciousEarth: 11 },
    quarter: "Duality",
    theme: "Intimacy and expression",
    description: "People with this cross often find their path through emotional depth and authentic expression."
  },
  {
    name: "Right Angle Cross of Consciousness",
    type: "Right Angle",
    gates: { consciousSun: 64, consciousEarth: 63, unconsciousSun: 5, unconsciousEarth: 35 },
    quarter: "Duality",
    theme: "Mental pressure for awareness",
    description: "This cross carries the energy of mental processing that leads to expanded consciousness."
  },
  {
    name: "Right Angle Cross of Consciousness 2",
    type: "Right Angle",
    gates: { consciousSun: 63, consciousEarth: 64, unconsciousSun: 35, unconsciousEarth: 5 },
    quarter: "Initiation",
    theme: "Doubt as path to clarity",
    description: "Those with this cross often use doubt and questioning as tools for deeper understanding."
  },
  {
    name: "Right Angle Cross of Consciousness 3",
    type: "Right Angle",
    gates: { consciousSun: 5, consciousEarth: 35, unconsciousSun: 64, unconsciousEarth: 63 },
    quarter: "Mutation",
    theme: "Rhythm of awareness",
    description: "Individuals with this cross often find consciousness through natural rhythms and experience."
  },
  {
    name: "Right Angle Cross of Consciousness 4",
    type: "Right Angle",
    gates: { consciousSun: 35, consciousEarth: 5, unconsciousSun: 63, unconsciousEarth: 64 },
    quarter: "Civilization",
    theme: "Experience as teacher",
    description: "People with this cross often gain awareness through their variety of life experiences."
  },
  {
    name: "Right Angle Cross of Contagion",
    type: "Right Angle",
    gates: { consciousSun: 30, consciousEarth: 29, unconsciousSun: 14, unconsciousEarth: 8 },
    quarter: "Initiation",
    theme: "Spreading passion",
    description: "This cross carries the energy of infectious enthusiasm and emotional drive."
  },
  {
    name: "Right Angle Cross of Contagion 2",
    type: "Right Angle",
    gates: { consciousSun: 29, consciousEarth: 30, unconsciousSun: 8, unconsciousEarth: 14 },
    quarter: "Duality",
    theme: "Committed passion",
    description: "Those with this cross often spread their dedication and emotional fire to others."
  },
  {
    name: "Right Angle Cross of Contagion 3",
    type: "Right Angle",
    gates: { consciousSun: 14, consciousEarth: 8, unconsciousSun: 29, unconsciousEarth: 30 },
    quarter: "Mutation",
    theme: "Powerful contribution",
    description: "Individuals with this cross often inspire others through their empowered expression."
  },
  {
    name: "Right Angle Cross of Contagion 4",
    type: "Right Angle",
    gates: { consciousSun: 8, consciousEarth: 14, unconsciousSun: 30, unconsciousEarth: 29 },
    quarter: "Civilization",
    theme: "Contributing passion",
    description: "People with this cross often spread their unique expression and power to their community."
  },
  {
    name: "Right Angle Cross of The Unexpected",
    type: "Right Angle",
    gates: { consciousSun: 28, consciousEarth: 27, unconsciousSun: 41, unconsciousEarth: 31 },
    quarter: "Duality",
    theme: "Risk and meaning",
    description: "This cross carries the energy of finding purpose through unexpected challenges."
  },
  {
    name: "Right Angle Cross of The Unexpected 2",
    type: "Right Angle",
    gates: { consciousSun: 27, consciousEarth: 28, unconsciousSun: 31, unconsciousEarth: 41 },
    quarter: "Initiation",
    theme: "Caring through challenge",
    description: "Those with this cross often find their nurturing role through navigating the unexpected."
  },
  {
    name: "Right Angle Cross of The Unexpected 3",
    type: "Right Angle",
    gates: { consciousSun: 41, consciousEarth: 31, unconsciousSun: 27, unconsciousEarth: 28 },
    quarter: "Initiation",
    theme: "Fantasy meeting reality",
    description: "Individuals with this cross often bridge imagination and practical care."
  },
  {
    name: "Right Angle Cross of The Unexpected 4",
    type: "Right Angle",
    gates: { consciousSun: 31, consciousEarth: 41, unconsciousSun: 28, unconsciousEarth: 27 },
    quarter: "Civilization",
    theme: "Leadership through the unknown",
    description: "People with this cross often lead others through unexpected territory."
  },
  {
    name: "Right Angle Cross of The Vessel of Love",
    type: "Right Angle",
    gates: { consciousSun: 10, consciousEarth: 15, unconsciousSun: 25, unconsciousEarth: 46 },
    quarter: "Mutation",
    theme: "Authentic love expression",
    description: "This cross carries the energy of embodying and expressing universal love through authentic behavior."
  },
  {
    name: "Right Angle Cross of The Vessel of Love 2",
    type: "Right Angle",
    gates: { consciousSun: 15, consciousEarth: 10, unconsciousSun: 46, unconsciousEarth: 25 },
    quarter: "Civilization",
    theme: "Rhythmic love",
    description: "Those with this cross often express love through their natural rhythms and extreme patterns."
  },
  {
    name: "Right Angle Cross of The Vessel of Love 3",
    type: "Right Angle",
    gates: { consciousSun: 25, consciousEarth: 46, unconsciousSun: 10, unconsciousEarth: 15 },
    quarter: "Initiation",
    theme: "Innocent love embodied",
    description: "Individuals with this cross often carry the energy of pure, innocent love in physical form."
  },
  {
    name: "Right Angle Cross of The Vessel of Love 4",
    type: "Right Angle",
    gates: { consciousSun: 46, consciousEarth: 25, unconsciousSun: 15, unconsciousEarth: 10 },
    quarter: "Duality",
    theme: "Love of the body",
    description: "People with this cross often express love through physical presence and serendipitous encounters."
  }
];

export function determineIncarnationCross(
  consciousSun: number,
  consciousEarth: number,
  unconsciousSun: number,
  unconsciousEarth: number,
  preferredType?: IncarnationCross['type']
): IncarnationCross | undefined {
  // Some datasets may include multiple entries with identical gate sets but different
  // cross geometries (Right/Left/Juxtaposition). When we *know* the geometry from the
  // profile line, prefer an entry that matches that type.
  const matches = incarnationCrosses.filter(
    (cross) =>
      cross.gates.consciousSun === consciousSun &&
      cross.gates.consciousEarth === consciousEarth &&
      cross.gates.unconsciousSun === unconsciousSun &&
      cross.gates.unconsciousEarth === unconsciousEarth
  );

  if (!matches.length) return undefined;
  if (preferredType) {
    return matches.find((m) => m.type === preferredType) ?? matches[0];
  }
  return matches[0];
}

export function determineQuarter(sunGate: number): 'Initiation' | 'Civilization' | 'Duality' | 'Mutation' {
  return getQuarterForGate(sunGate);
}

export const quarterDescriptions = {
  Initiation: {
    theme: "Purpose through Mind",
    description: "The Quarter of Initiation is about initiating consciousness and bringing awareness through mental processes. People with this quarter are here to ask questions, seek understanding, and bring new perspectives that initiate change in collective consciousness."
  },
  Civilization: {
    theme: "Purpose through Form",
    description: "The Quarter of Civilization is about building structures, systems, and forms that support human civilization. People with this quarter are here to create, manifest, and give form to ideas that serve the collective good."
  },
  Duality: {
    theme: "Purpose through Bonding",
    description: "The Quarter of Duality is about relationships, bonding, and the interplay between self and other. People with this quarter are here to explore connection, intimacy, and the dynamics that emerge through human interaction."
  },
  Mutation: {
    theme: "Purpose through Transformation",
    description: "The Quarter of Mutation is about transformation, change, and evolutionary pressure. People with this quarter are here to bring mutation and change that serves human evolution, often through challenge and transformation."
  }
};

export const crossTypeDescriptions = {
  'Right Angle': {
    percentage: 70,
    theme: "Personal Destiny",
    description: "Right Angle Crosses represent personal destiny. People with Right Angle crosses are absorbed in their own process and life journey. They are not here for others specifically but rather to live out their own unique purpose. Their impact on others is a byproduct of living authentically rather than the primary focus."
  },
  'Left Angle': {
    percentage: 25,
    theme: "Transpersonal/Fixed Fate",
    description: "Left Angle Crosses represent transpersonal karma and fixed fate. People with Left Angle crosses are here for others - their life purpose is intimately connected to specific people, relationships, and transpersonal connections. Their destiny unfolds through 'fated' meetings and relationships."
  },
  'Juxtaposition': {
    percentage: 5,
    theme: "Fixed Fate Bridge",
    description: "Juxtaposition Crosses are the rarest, representing a bridge between personal and transpersonal destiny. People with Juxtaposition crosses have a very fixed and specific purpose - they are geometry itself, serving as a bridge or transition point. Their life is highly specific and often involves being in the right place at the right time."
  }
};

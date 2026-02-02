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
  lifeWork: string;
  collectiveContribution: string;
  gateIntegration: string;
  livingYourCross: string;
}

export const incarnationCrosses: IncarnationCross[] = [
  {
    name: "Right Angle Cross of Laws 1",
    type: "Right Angle",
    gates: {
      consciousSun: 3,
      consciousEarth: 50,
      unconsciousSun: 60,
      unconsciousEarth: 56
    },
    quarter: "Mutation",
    theme: "Establishing order through embracing chaos and mutation",
    description: "This cross carries the energy of bringing order out of chaos through accepting limitation and then transcending it. You are here to establish new laws and patterns that emerge from mutation and transformation.",
    lifeWork: "To embody the transition from chaos to order, establishing laws and patterns that support evolution while honoring the need for limitation and structure.",
    collectiveContribution: "Brings wisdom about how to navigate change and mutation, establishing new norms and structures that emerge from transformative experiences.",
    gateIntegration: "Gate 3 (Ordering/Difficulty at the Beginning) initiates new patterns. Gate 50 (Values/Laws) establishes what is correct for the tribe. Gate 60 (Limitation/Acceptance) embraces constraints as creative fuel. Gate 56 (Stimulation/Storytelling) shares the wisdom of the journey.",
    livingYourCross: "Trust the chaos before the clarity. Your role is to go through difficulty and mutation yourself, then establish the laws and values that emerge from your transformation. Share your stories of overcoming limitation."
  },
  {
    name: "Right Angle Cross of Laws 2",
    type: "Right Angle",
    gates: {
      consciousSun: 50,
      consciousEarth: 3,
      unconsciousSun: 56,
      unconsciousEarth: 60
    },
    quarter: "Civilization",
    theme: "Guardian of tribal values and laws",
    description: "This cross carries the energy of preserving and upholding what is correct for the community. You are here to be a guardian of laws and values that protect and nurture the tribe.",
    lifeWork: "To establish and uphold values that serve the wellbeing of your community, taking responsibility for what is correct and healthy for the collective.",
    collectiveContribution: "Provides moral and ethical guidance, establishing and maintaining the laws that keep the community safe, healthy, and functioning properly.",
    gateIntegration: "Gate 50 (Values/Laws) leads with responsibility for what is correct. Gate 3 (Ordering) brings new order when needed. Gate 56 (Storytelling) conveys wisdom through narrative. Gate 60 (Limitation) accepts necessary boundaries.",
    livingYourCross: "Take your role as a guardian of values seriously. Your responsibility is to know what is correct for your community and to maintain those standards. Share your wisdom through stories and accept the limitations inherent in this protective role."
  },
  {
    name: "Right Angle Cross of The Sphinx 1",
    type: "Right Angle",
    gates: {
      consciousSun: 13,
      consciousEarth: 7,
      unconsciousSun: 1,
      unconsciousEarth: 2
    },
    quarter: "Initiation",
    theme: "Universal listener and direction keeper",
    description: "This cross carries the energy of listening to all of humanity and holding space for collective direction. The Sphinx represents the mystery of human purpose and the ability to witness the unfolding of human stories without judgment.",
    lifeWork: "To listen deeply to humanity's stories and secrets, creating safe space for others to share their truth while maintaining awareness of universal patterns and direction.",
    collectiveContribution: "Provides humanity with the gift of deep listening and witnessing, allowing people to feel heard and seen without agenda or judgment.",
    gateIntegration: "Gate 13 (Fellowship) combines with Gate 7 (Role of Self) to create leadership through listening. Gate 1 (Creative expression) and Gate 2 (Receptive direction) ground this in unique creative direction guided by higher receptivity.",
    livingYourCross: "Practice being the listener rather than the talker. Create safe containers for others to share. Trust your unique creative direction while remaining receptive to universal guidance. Your presence alone serves as a mirror for others' self-discovery."
  },
  {
    name: "Right Angle Cross of Planning 1",
    type: "Right Angle",
    gates: {
      consciousSun: 16,
      consciousEarth: 9,
      unconsciousSun: 37,
      unconsciousEarth: 40
    },
    quarter: "Duality",
    theme: "Mastery through enthusiastic experimentation and planning",
    description: "This cross is about developing skills and mastery through enthusiastic practice and strategic planning. It carries the energy of building competence through dedicated focus and perseverance.",
    lifeWork: "To master skills through enthusiastic repetition and strategic planning, creating systems and structures that support excellence and competence.",
    collectiveContribution: "Demonstrates the power of dedication and practice in achieving mastery, inspiring others through the joy of skill development and strategic preparation.",
    gateIntegration: "Gate 16 (Skills/Enthusiasm) with Gate 9 (Focus/Detail) creates mastery through enthusiastic attention to detail. Gate 37 (Family/Community) and Gate 40 (Aloneness/Restoration) balance community contribution with necessary alone time for restoration and planning.",
    livingYourCross: "Embrace the joy of practice and skill development. Plan strategically while maintaining enthusiasm. Balance community contribution with restorative alone time. Trust that mastery comes through dedicated repetition."
  }
  ,
  {
    name: "Left Angle Cross of Dominion",
    type: "Left Angle",
    gates: {
      consciousSun: 63,
      consciousEarth: 64,
      unconsciousSun: 26,
      unconsciousEarth: 45
    },
    quarter: "Mutation",
    theme: "Transforming collective direction through pressure to prove and lead",
    description: "This cross carries a transformative drive to question, test, and refine what can be trusted, then translate that insight into influence and stewardship of resources. Your purpose unfolds through challenging assumptions and shaping how leadership and material support are organized.",
    lifeWork: "To apply discerning pressure (Gate 63/64) to ideas and narratives, then use willpower and persuasion (Gate 26) in service of responsible stewardship and leadership (Gate 45).",
    collectiveContribution: "Brings the gift of critical inquiry and visionary insight, helping communities reorganize authority, resources, and trust through more honest leadership structures.",
    gateIntegration: "Gate 63 (Doubt) and Gate 64 (Confusion) generate pressure to find truth and clarity. Gate 26 (Egoist/Trickster) provides the capacity to persuade and transmit value. Gate 45 (Gatherer/King/Queen) anchors leadership and the management of collective resources.",
    livingYourCross: "Let doubt and confusion do their job: pressure creates clarity. Share only what you can stand behind. Use persuasion ethically, and lead by organizing resources in ways that build trust. Your impact is transpersonal—your questions and stewardship change others’ direction."
  }
];

export function determineIncarnationCross(
  consciousSun: number,
  consciousEarth: number,
  unconsciousSun: number,
  unconsciousEarth: number
): IncarnationCross | undefined {
  return incarnationCrosses.find(
    cross =>
      cross.gates.consciousSun === consciousSun &&
      cross.gates.consciousEarth === consciousEarth &&
      cross.gates.unconsciousSun === unconsciousSun &&
      cross.gates.unconsciousEarth === unconsciousEarth
  );
}

export function determineQuarter(sunGate: number): 'Initiation' | 'Civilization' | 'Duality' | 'Mutation' {
  if (sunGate >= 13 && sunGate <= 24) return 'Initiation';
  if (sunGate >= 2 && sunGate <= 33) return 'Civilization';
  if (sunGate >= 7 && sunGate <= 44) return 'Duality';
  return 'Mutation';
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

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

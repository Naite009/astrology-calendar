// Complete 36-Channel Human Design Library
// Each channel connects two centers and creates definition when both gates are activated

export interface HDChannel {
  gates: [number, number];
  name: string;
  centers: [string, string];
  circuit: string;
  type: 'Generated' | 'Projected' | 'Manifested' | 'Manifestation';
  keynotes: string[];
  description: string;
  gifts: string[];
  challenges: string[];
}

export const HUMAN_DESIGN_CHANNELS: HDChannel[] = [
  // Individual Circuits - Knowing
  {
    gates: [3, 60],
    name: "Channel of Mutation",
    centers: ["Sacral", "Root"],
    circuit: "Individual - Knowing",
    type: "Generated",
    keynotes: ["Pulse", "Innovation", "Mutation through limitation"],
    description: "The Channel of Mutation connects the pressure for change (Gate 60) with the energy to order chaos (Gate 3). This is the channel of evolutionary change that operates in pulses. When the pulse is on, mutation is possible; when it's off, patience is required.",
    gifts: ["Evolutionary change", "Innovation through constraint", "Transformative energy", "Breaking through limitations"],
    challenges: ["Melancholy when pulse is off", "Frustration with timing", "Others not understanding the pulse"]
  },
  {
    gates: [12, 22],
    name: "Channel of Openness",
    centers: ["Throat", "Solar Plexus"],
    circuit: "Individual - Knowing",
    type: "Manifested",
    keynotes: ["Social being", "Mood expression", "Emotional articulation"],
    description: "The Channel of Openness connects emotional mood (Gate 22) with cautious expression (Gate 12). This channel carries the potential to express deep emotional and creative states to others. Timing is everything - expression must wait for the right mood.",
    gifts: ["Emotional expression", "Social grace", "Mood articulation", "Creative communication"],
    challenges: ["Moodiness affecting expression", "Social withdrawal", "Waiting for right timing"]
  },
  {
    gates: [14, 2],
    name: "Channel of the Beat",
    centers: ["Sacral", "G"],
    circuit: "Individual - Knowing",
    type: "Generated",
    keynotes: ["Direction through response", "Power skills", "Empowered direction"],
    description: "The Channel of the Beat connects direction (Gate 2) with powerful resources (Gate 14). This channel provides the energy to follow your unique direction with power. The beat is the rhythm of your own direction.",
    gifts: ["Empowered direction", "Resource mastery", "Following your path", "Power in purpose"],
    challenges: ["Direction uncertainty", "Power without direction", "Not trusting the beat"]
  },
  {
    gates: [28, 38],
    name: "Channel of Struggle",
    centers: ["Spleen", "Root"],
    circuit: "Individual - Knowing",
    type: "Projected",
    keynotes: ["Stubbornness", "Purpose through struggle", "Life meaning"],
    description: "The Channel of Struggle connects the fight for meaning (Gate 38) with the search for purpose (Gate 28). This channel is about finding what makes life worth living through struggle. The struggle itself reveals meaning.",
    gifts: ["Finding meaning", "Purpose through challenge", "Stubborn determination", "Life worth living"],
    challenges: ["Struggling with wrong things", "Existential crisis", "Never finding enough meaning"]
  },
  {
    gates: [39, 55],
    name: "Channel of Emoting",
    centers: ["Root", "Solar Plexus"],
    circuit: "Individual - Knowing",
    type: "Projected",
    keynotes: ["Moodiness", "Spirit", "Emotional provocation"],
    description: "The Channel of Emoting connects spiritual abundance (Gate 55) with provocation (Gate 39). This channel carries intense emotional energy that can provoke others into emotional awareness. The spirit rides on emotional waves.",
    gifts: ["Emotional depth", "Spiritual awareness", "Provoking awakening", "Intense feeling"],
    challenges: ["Mood swings", "Provoking unnecessarily", "Spiritual depression"]
  },
  {
    gates: [43, 23],
    name: "Channel of Structuring",
    centers: ["Ajna", "Throat"],
    circuit: "Individual - Knowing",
    type: "Projected",
    keynotes: ["Genius to freak", "Individual expression", "Unique insights"],
    description: "The Channel of Structuring connects breakthrough insights (Gate 43) with expression of the new (Gate 23). This channel carries the capacity to share revolutionary ideas. The challenge is timing - sharing insights before others are ready leads to being seen as a freak rather than a genius.",
    gifts: ["Revolutionary insights", "Unique expression", "Genius communication", "Breaking new ground"],
    challenges: ["Being misunderstood", "Sharing too soon", "Feeling like a freak"]
  },
  {
    gates: [57, 20],
    name: "Channel of Brain Wave",
    centers: ["Spleen", "Throat"],
    circuit: "Individual - Knowing",
    type: "Manifested",
    keynotes: ["Intuitive awareness in the now", "Penetrating voice", "Present-moment expression"],
    description: "The Channel of Brain Wave connects intuitive knowing (Gate 57) with present-moment expression (Gate 20). This channel allows for the direct expression of intuition in the now. The voice speaks what is known in the moment.",
    gifts: ["Intuitive expression", "Present awareness", "Penetrating clarity", "Immediate knowing voice"],
    challenges: ["Speaking before invited", "Intuition not being heard", "Living only in the now"]
  },
  {
    gates: [61, 24],
    name: "Channel of Awareness",
    centers: ["Head", "Ajna"],
    circuit: "Individual - Knowing",
    type: "Projected",
    keynotes: ["A thinker", "Mystery and rationalization", "Inspired mental process"],
    description: "The Channel of Awareness connects the pressure to know mysteries (Gate 61) with the rationalizing mind (Gate 24). This channel is about thinking through mysteries until understanding comes. The mind returns again and again to the unknown.",
    gifts: ["Deep thinking", "Mystery exploration", "Mental breakthroughs", "Inspired rationalization"],
    challenges: ["Mental obsession", "Never-ending questions", "Thought loops"]
  },

  // Individual Circuits - Centering
  {
    gates: [1, 8],
    name: "Channel of Inspiration",
    centers: ["G", "Throat"],
    circuit: "Individual - Centering",
    type: "Manifestation",
    keynotes: ["Creative role model", "Unique self-expression", "Inspiring through being"],
    description: "The Channel of Inspiration connects creative direction (Gate 1) with contribution (Gate 8). This is the channel of the creative role model who inspires others simply by being themselves. The inspiration is in the authentic expression of uniqueness.",
    gifts: ["Creative inspiration", "Unique role modeling", "Authentic contribution", "Being yourself as gift"],
    challenges: ["Feeling alone in uniqueness", "Waiting for recognition", "Not trusting creative direction"]
  },
  {
    gates: [10, 20],
    name: "Channel of Awakening",
    centers: ["G", "Throat"],
    circuit: "Individual - Centering",
    type: "Manifested",
    keynotes: ["Self-love in the now", "Being yourself", "Authentic expression"],
    description: "The Channel of Awakening connects self-love (Gate 10) with present awareness (Gate 20). This channel is about expressing who you are in each moment. True awakening is simply being yourself now.",
    gifts: ["Self-love", "Present authenticity", "Being yourself", "Spontaneous self-expression"],
    challenges: ["Self-criticism", "Not being in the now", "Trying to be what you're not"]
  },
  {
    gates: [10, 34],
    name: "Channel of Exploration",
    centers: ["G", "Sacral"],
    circuit: "Individual - Centering",
    type: "Generated",
    keynotes: ["Following your convictions", "Powerful individuality", "Exploring as yourself"],
    description: "The Channel of Exploration connects self-love (Gate 10) with pure power (Gate 34). This channel provides enormous power to be yourself and follow your own convictions. Exploration happens through response.",
    gifts: ["Powerful individuality", "Self-directed exploration", "Following convictions", "Authentic power"],
    challenges: ["Power without direction", "Selfishness vs self-love", "Overwhelming others with energy"]
  },
  {
    gates: [25, 51],
    name: "Channel of Initiation",
    centers: ["G", "Heart"],
    circuit: "Individual - Centering",
    type: "Projected",
    keynotes: ["Needing to be first", "Spiritual warrior", "Shock and love"],
    description: "The Channel of Initiation connects universal love (Gate 25) with shock (Gate 51). This is the channel of the spiritual warrior who initiates others through shock. The shock comes from the courage to love universally.",
    gifts: ["Spiritual initiation", "Courageous love", "Awakening others", "Being first"],
    challenges: ["Unnecessary shocking", "Competitive spirit", "Not waiting to be invited"]
  },
  {
    gates: [34, 20],
    name: "Channel of Charisma",
    centers: ["Sacral", "Throat"],
    circuit: "Individual - Centering",
    type: "Manifested",
    keynotes: ["Immediate action", "Busy-ness", "Pure response to now"],
    description: "The Channel of Charisma connects sacral power (Gate 34) with present awareness (Gate 20). This is the only purely Manifesting Generator channel. It allows for immediate response in the now with full sacral power.",
    gifts: ["Immediate response", "Powerful presence", "Charismatic action", "Present-moment power"],
    challenges: ["Busy-ness without purpose", "Acting before responding", "Burnout from constant action"]
  },

  // Tribal Circuits - Ego
  {
    gates: [19, 49],
    name: "Channel of Synthesis",
    centers: ["Root", "Solar Plexus"],
    circuit: "Tribal - Defense",
    type: "Projected",
    keynotes: ["Sensitivity", "Emotional needs", "Principles of need"],
    description: "The Channel of Synthesis connects need sensitivity (Gate 19) with principles (Gate 49). This channel is about the emotional awareness of what the tribe needs. Revolutionary change happens when tribal needs aren't met.",
    gifts: ["Need awareness", "Emotional sensitivity", "Principled support", "Tribal revolution"],
    challenges: ["Over-sensitivity to needs", "Rejection based on principles", "Emotional overwhelm"]
  },
  {
    gates: [21, 45],
    name: "Channel of Money",
    centers: ["Heart", "Throat"],
    circuit: "Tribal - Ego",
    type: "Manifested",
    keynotes: ["Materialist", "Control and direction", "Tribal leadership"],
    description: "The Channel of Money connects willpower control (Gate 21) with tribal gathering (Gate 45). This is the channel of material manifestation and tribal leadership through resources. The will to control creates material success.",
    gifts: ["Material manifestation", "Tribal leadership", "Resource control", "Willpower in action"],
    challenges: ["Over-control", "Materialism", "Power struggles"]
  },
  {
    gates: [26, 44],
    name: "Channel of Surrender",
    centers: ["Heart", "Spleen"],
    circuit: "Tribal - Ego",
    type: "Projected",
    keynotes: ["Transmitter", "Selling the memory", "Pattern recognition for survival"],
    description: "The Channel of Surrender connects sales energy (Gate 26) with pattern alertness (Gate 44). This channel transmits what the tribe needs through selling. Success comes from recognizing what patterns have worked.",
    gifts: ["Sales mastery", "Pattern memory", "Tribal transmission", "Successful selling"],
    challenges: ["Manipulation", "Selling wrong things", "Exhausting willpower"]
  },
  {
    gates: [32, 54],
    name: "Channel of Transformation",
    centers: ["Spleen", "Root"],
    circuit: "Tribal - Ego",
    type: "Projected",
    keynotes: ["Driven ambition", "Rising through continuity", "Material success"],
    description: "The Channel of Transformation connects ambition (Gate 54) with continuity instinct (Gate 32). This channel drives material transformation through ambition. Success comes from sensing what will endure.",
    gifts: ["Driven ambition", "Material transformation", "Rising in status", "Continuity sensing"],
    challenges: ["Ruthless ambition", "Fear of failure", "Never satisfied"]
  },
  {
    gates: [37, 40],
    name: "Channel of Community",
    centers: ["Solar Plexus", "Heart"],
    circuit: "Tribal - Ego",
    type: "Projected",
    keynotes: ["Part seeking whole", "Bargains of support", "Family/community building"],
    description: "The Channel of Community connects friendship (Gate 37) with aloneness (Gate 40). This channel is about the bargain between the individual and the community. Support flows both ways through emotional agreements.",
    gifts: ["Community building", "Healthy bargains", "Family support", "Balanced giving"],
    challenges: ["Unbalanced bargains", "Burnout from over-giving", "Emotional conditions"]
  },

  // Tribal Circuits - Defense
  {
    gates: [6, 59],
    name: "Channel of Mating",
    centers: ["Solar Plexus", "Sacral"],
    circuit: "Tribal - Defense",
    type: "Generated",
    keynotes: ["Intimacy", "Emotional fertility", "Creating bonds"],
    description: "The Channel of Mating connects emotional intimacy (Gate 6) with barrier-breaking (Gate 59). This is the channel of reproduction and deep bonding. Emotional waves govern the timing of intimate connection.",
    gifts: ["Deep intimacy", "Reproductive power", "Bond creation", "Emotional connection"],
    challenges: ["Emotional volatility in intimacy", "Inappropriate bonding", "Fertility pressure"]
  },
  {
    gates: [27, 50],
    name: "Channel of Preservation",
    centers: ["Sacral", "Spleen"],
    circuit: "Tribal - Defense",
    type: "Generated",
    keynotes: ["A custodian", "Caring responsibility", "Nurturing and values"],
    description: "The Channel of Preservation connects nurturing (Gate 27) with responsibility (Gate 50). This channel is about caring for and preserving what's valuable. The custodian protects through nurturing.",
    gifts: ["Caregiving", "Value preservation", "Nurturing instinct", "Responsible protection"],
    challenges: ["Over-caring", "Martyrdom", "Guilt about not doing enough"]
  },

  // Collective Circuits - Logic
  {
    gates: [4, 63],
    name: "Channel of Logic",
    centers: ["Ajna", "Head"],
    circuit: "Collective - Logic",
    type: "Projected",
    keynotes: ["Mental ease mixed with doubt", "Logical questioning", "Formula seeking"],
    description: "The Channel of Logic connects logical doubt (Gate 63) with mental formulas (Gate 4). This channel is constantly questioning and seeking logical answers. The pressure to doubt drives the search for reliable formulas.",
    gifts: ["Logical thinking", "Formula creation", "Healthy doubt", "Pattern questioning"],
    challenges: ["Excessive doubt", "Never satisfied with answers", "Mental anxiety"]
  },
  {
    gates: [5, 15],
    name: "Channel of Rhythm",
    centers: ["Sacral", "G"],
    circuit: "Collective - Logic",
    type: "Generated",
    keynotes: ["Being in the flow", "Life rhythms", "Universal timing"],
    description: "The Channel of Rhythm connects fixed rhythms (Gate 5) with extremes (Gate 15). This channel is about being in the flow of life's rhythms. Universal timing governs the rhythm of living.",
    gifts: ["Natural rhythm", "Life flow", "Universal timing", "Rhythmic consistency"],
    challenges: ["Rhythm disruption", "Extreme swings", "Imposing rhythm on others"]
  },
  {
    gates: [7, 31],
    name: "Channel of the Alpha",
    centers: ["G", "Throat"],
    circuit: "Collective - Logic",
    type: "Projected",
    keynotes: ["Leadership for good or ill", "Democratic leadership", "Influential direction"],
    description: "The Channel of the Alpha connects democratic leadership (Gate 7) with influential voice (Gate 31). This is the channel of the leader who influences through voice and direction. Leadership must be invited.",
    gifts: ["Democratic leadership", "Influential voice", "Direction provision", "Leading by example"],
    challenges: ["Uninvited leadership", "Ego in leadership", "Misusing influence"]
  },
  {
    gates: [9, 52],
    name: "Channel of Concentration",
    centers: ["Sacral", "Root"],
    circuit: "Collective - Logic",
    type: "Generated",
    keynotes: ["Determination", "Deep focus", "Stillness and detail"],
    description: "The Channel of Concentration connects stillness (Gate 52) with focus (Gate 9). This channel provides the energy for deep concentration and detailed work. Stillness enables focused determination.",
    gifts: ["Deep concentration", "Detailed focus", "Determined work", "Stillness power"],
    challenges: ["Restlessness", "Getting lost in details", "Forced stillness"]
  },
  {
    gates: [16, 48],
    name: "Channel of the Wavelength",
    centers: ["Throat", "Spleen"],
    circuit: "Collective - Logic",
    type: "Projected",
    keynotes: ["Talent", "Depth of skill", "Enthusiastic mastery"],
    description: "The Channel of the Wavelength connects depth (Gate 48) with enthusiasm (Gate 16). This channel is about developing talent through enthusiastic practice. Skill emerges from deep resources.",
    gifts: ["Talent development", "Skill mastery", "Enthusiastic depth", "Deep practice"],
    challenges: ["Fear of inadequacy", "Scattered enthusiasm", "Not accessing depth"]
  },
  {
    gates: [17, 62],
    name: "Channel of Acceptance",
    centers: ["Ajna", "Throat"],
    circuit: "Collective - Logic",
    type: "Projected",
    keynotes: ["Organizational being", "Logical expression", "Detailed opinions"],
    description: "The Channel of Acceptance connects opinions (Gate 17) with details (Gate 62). This channel expresses logical organization through detailed facts. Opinions need factual support for acceptance.",
    gifts: ["Logical organization", "Detailed expression", "Factual opinions", "Mental clarity"],
    challenges: ["Rigidity of opinion", "Too much detail", "Seeking acceptance"]
  },
  {
    gates: [18, 58],
    name: "Channel of Judgment",
    centers: ["Spleen", "Root"],
    circuit: "Collective - Logic",
    type: "Projected",
    keynotes: ["Insatiability", "Correction pressure", "Joyful improvement"],
    description: "The Channel of Judgment connects joy (Gate 58) with correction (Gate 18). This channel drives the improvement of patterns through joyful critique. The vitality to perfect is insatiable.",
    gifts: ["Pattern improvement", "Joyful correction", "Vitality for perfection", "Insatiable drive"],
    challenges: ["Over-criticism", "Never satisfied", "Correcting without invitation"]
  },

  // Collective Circuits - Sensing/Abstract
  {
    gates: [11, 56],
    name: "Channel of Curiosity",
    centers: ["Ajna", "Throat"],
    circuit: "Collective - Sensing",
    type: "Projected",
    keynotes: ["A searcher", "Ideas and stories", "Stimulating curiosity"],
    description: "The Channel of Curiosity connects ideas (Gate 11) with storytelling (Gate 56). This channel shares ideas and experiences through story. Curiosity drives the search for stimulating experiences to share.",
    gifts: ["Storytelling", "Idea sharing", "Curious exploration", "Stimulating communication"],
    challenges: ["Scattered ideas", "All talk", "Never acting on ideas"]
  },
  {
    gates: [13, 33],
    name: "Channel of the Prodigal",
    centers: ["G", "Throat"],
    circuit: "Collective - Sensing",
    type: "Manifested",
    keynotes: ["A witness", "Listening and remembering", "Story transmission"],
    description: "The Channel of the Prodigal connects listening (Gate 13) with retreat (Gate 33). This is the channel of the witness who listens, remembers, and later shares. Stories need time to ripen before transmission.",
    gifts: ["Witnessing", "Story preservation", "Deep listening", "Wisdom sharing"],
    challenges: ["Carrying too many stories", "Premature sharing", "Retreat becoming isolation"]
  },
  {
    gates: [29, 46],
    name: "Channel of Discovery",
    centers: ["Sacral", "G"],
    circuit: "Collective - Sensing",
    type: "Generated",
    keynotes: ["Succeeding where others fail", "Body wisdom", "Commitment to experience"],
    description: "The Channel of Discovery connects body love (Gate 46) with commitment (Gate 29). This channel commits fully to experiences through body wisdom. Discovery comes from saying yes to the right experiences.",
    gifts: ["Body wisdom", "Full commitment", "Experiential discovery", "Physical intuition"],
    challenges: ["Over-commitment", "Body disconnection", "Wrong commitments"]
  },
  {
    gates: [30, 41],
    name: "Channel of Recognition",
    centers: ["Solar Plexus", "Root"],
    circuit: "Collective - Sensing",
    type: "Projected",
    keynotes: ["Focused energy", "Fantasy and feeling", "Emotional dreaming"],
    description: "The Channel of Recognition connects imagination (Gate 41) with feelings (Gate 30). This channel is about the pressure to feel and experience. Fantasy fuels the desire for new emotional experiences.",
    gifts: ["Emotional imagination", "Experience seeking", "Feeling depth", "Creative fantasy"],
    challenges: ["Unfulfilled desires", "Fantasy vs reality", "Emotional pressure"]
  },
  {
    gates: [35, 36],
    name: "Channel of Transitoriness",
    centers: ["Throat", "Solar Plexus"],
    circuit: "Collective - Sensing",
    type: "Manifested",
    keynotes: ["Jack of all trades", "Crisis and change", "Experiential expression"],
    description: "The Channel of Transitoriness connects experience-seeking (Gate 35) with emotional crisis (Gate 36). This channel moves through experiences seeking feeling. Change and crisis fuel the journey.",
    gifts: ["Diverse experience", "Crisis navigation", "Adaptability", "Emotional courage"],
    challenges: ["Scattered focus", "Crisis creation", "Never mastering anything"]
  },
  {
    gates: [42, 53],
    name: "Channel of Maturation",
    centers: ["Sacral", "Root"],
    circuit: "Collective - Sensing",
    type: "Generated",
    keynotes: ["Cyclic development", "Starting and completing", "Growth through cycles"],
    description: "The Channel of Maturation connects starting (Gate 53) with completing (Gate 42). This channel is about growing through complete cycles. Maturation requires both beginning and ending experiences.",
    gifts: ["Cycle completion", "Maturation", "Growth through experience", "Development"],
    challenges: ["Not completing", "Pressure to start new things", "Stuck in wrong cycles"]
  },
  {
    gates: [47, 64],
    name: "Channel of Abstraction",
    centers: ["Ajna", "Head"],
    circuit: "Collective - Sensing",
    type: "Projected",
    keynotes: ["Mental activity mixed with clarity", "Making sense of the past", "Abstract processing"],
    description: "The Channel of Abstraction connects confusion (Gate 64) with realization (Gate 47). This channel processes the past into meaning. Mental activity works through confusion toward clarity.",
    gifts: ["Meaning-making", "Abstract processing", "Clarity from confusion", "Past wisdom"],
    challenges: ["Mental confusion", "Overwhelm by abstractions", "Difficulty with present"]
  }
];

// Helper functions
export const getChannelByGates = (gate1: number, gate2: number): HDChannel | undefined => {
  return HUMAN_DESIGN_CHANNELS.find(
    ch => (ch.gates[0] === gate1 && ch.gates[1] === gate2) ||
          (ch.gates[0] === gate2 && ch.gates[1] === gate1)
  );
};

export const getChannelsByCircuit = (circuit: string): HDChannel[] => {
  return HUMAN_DESIGN_CHANNELS.filter(ch => ch.circuit.includes(circuit));
};

export const getChannelsByCenter = (center: string): HDChannel[] => {
  return HUMAN_DESIGN_CHANNELS.filter(ch => ch.centers.includes(center));
};

// Complete Human Design Profiles Encyclopedia
// All 12 Profiles with comprehensive interpretations

export interface HDProfileData {
  profile: string;
  name: string;
  lines: {
    conscious: number;
    unconscious: number;
    consciousName: string;
    unconsciousName: string;
  };
  overview: string;
  lifeTheme: string;
  trajectory: string;
  howLinesWorkTogether: string;
  relationshipPatterns: string;
  careerThemes: string;
  commonConditioning: string[];
  deconditioningPractices: string[];
  personalVsTranspersonal: 'Personal Destiny' | 'Transpersonal Karma' | 'Fixed Fate';
  specialNotes?: string;
}

export const PROFILE_DATA: Record<string, HDProfileData> = {
  '1/3': {
    profile: '1/3',
    name: 'Investigator/Martyr',
    lines: {
      conscious: 1,
      unconscious: 3,
      consciousName: 'Investigator',
      unconsciousName: 'Martyr'
    },
    overview: "The 1/3 profile is the foundational discoverer. You consciously seek security through deep investigation, while unconsciously learning through trial and error. This creates a powerful combination of research and experiential wisdom.",
    lifeTheme: "Building unshakeable foundations through thorough investigation while discovering what works and doesn't through lived experience. You're here to find out what's truly reliable.",
    trajectory: "Your life path involves deep dives into whatever captures your interest, followed by real-world testing. You'll discover many things that don't work, which is exactly how you find what does.",
    howLinesWorkTogether: "Your conscious 1 seeks to understand deeply before committing, while your unconscious 3 tests everything in practice. You research, then experiment, then research again based on your discoveries.",
    relationshipPatterns: "You need partners who understand your need to investigate and your tendency to discover what doesn't work. Relationships are testing grounds for you. You're building an understanding of what makes relationships reliable.",
    careerThemes: "Research, investigation, testing, quality assurance, any field where deep knowledge plus practical testing is valued. You excel where thoroughness and experimentation are both needed.",
    commonConditioning: [
      "Feeling like failures are personal failings rather than discovery",
      "Being pressured to move on before you've investigated enough",
      "Being told you're too cautious or too experimental",
      "Shame about relationships or jobs that 'didn't work out'"
    ],
    deconditioningPractices: [
      "Reframe 'failures' as successful discoveries of what doesn't work",
      "Give yourself permission to research as long as you need",
      "Journal about the wisdom you've gained through trial and error",
      "Celebrate your experiential knowledge as valid expertise"
    ],
    personalVsTranspersonal: 'Personal Destiny'
  },
  
  '1/4': {
    profile: '1/4',
    name: 'Investigator/Opportunist',
    lines: {
      conscious: 1,
      unconscious: 4,
      consciousName: 'Investigator',
      unconsciousName: 'Opportunist'
    },
    overview: "The 1/4 profile combines deep investigation with networked influence. You consciously build solid foundations of knowledge, while unconsciously your impact flows through your network and community.",
    lifeTheme: "Becoming an authoritative resource within your network. You develop deep expertise and share it with those you're connected to, influencing others through relationships.",
    trajectory: "Your path involves becoming the knowledgeable friend everyone turns to. You build foundations and then your network naturally spreads that knowledge.",
    howLinesWorkTogether: "Your 1 investigates thoroughly, and your 4 shares what you've learned through your network. Your research becomes relational - you study things that matter to your community.",
    relationshipPatterns: "You need deep, lasting friendships and partnerships. Your relationships are the vehicle for your knowledge sharing. You're the friend everyone goes to for solid information.",
    careerThemes: "Any field where expertise meets networking: consulting, teaching within organizations, being the 'go-to' expert, roles that leverage both knowledge and relationships.",
    commonConditioning: [
      "Pressure to share knowledge before you've investigated enough",
      "Being pushed to network when you need to study",
      "Feeling like you need to know everyone when quality matters more",
      "Being told your need for depth makes you antisocial"
    ],
    deconditioningPractices: [
      "Balance research time with relationship time",
      "Trust that your network will find you when you're ready",
      "Share incomplete knowledge with trusted friends to develop it",
      "Remember that your depth IS your value to your network"
    ],
    personalVsTranspersonal: 'Fixed Fate'
  },
  
  '2/4': {
    profile: '2/4',
    name: 'Hermit/Opportunist',
    lines: {
      conscious: 2,
      unconscious: 4,
      consciousName: 'Hermit',
      unconsciousName: 'Opportunist'
    },
    overview: "The 2/4 profile is the natural talent who influences through relationships. You consciously need alone time to develop your gifts, while unconsciously you impact the world through your network.",
    lifeTheme: "Being called out from your hermit space to share your natural gifts with your network. You have talents you may not even recognize, and others see them clearly.",
    trajectory: "Your life alternates between solitude and social engagement. You retreat to develop your gifts, then emerge when called to share them with your people.",
    howLinesWorkTogether: "Your 2 needs privacy and often doesn't see its own talents. Your 4 draws people to you who recognize what you offer. Others call out what you might not see in yourself.",
    relationshipPatterns: "You need relationships that respect your need for solitude while also calling you out to engage. You're deeply influential within your network but need space to recharge.",
    careerThemes: "Natural talent-based work that comes through your network. Roles where you can work somewhat independently but are recognized and called upon by others.",
    commonConditioning: [
      "Being forced to engage when you need hermit time",
      "Not recognizing your own natural gifts",
      "Thinking your need for alone time is antisocial",
      "Waiting to be called out instead of trusting your Strategy"
    ],
    deconditioningPractices: [
      "Create firm boundaries around your hermit time",
      "Ask trusted friends what they see as your natural gifts",
      "Trust that the right opportunities will find you through your network",
      "Don't force yourself to be social - quality relationships over quantity"
    ],
    personalVsTranspersonal: 'Fixed Fate'
  },
  
  '2/5': {
    profile: '2/5',
    name: 'Hermit/Heretic',
    lines: {
      conscious: 2,
      unconscious: 5,
      consciousName: 'Hermit',
      unconsciousName: 'Heretic'
    },
    overview: "The 2/5 profile is the called-out savior. You consciously need privacy and have natural gifts you may not see, while unconsciously you project solutions that others desperately seek.",
    lifeTheme: "Being called out from your hermit cave to solve problems for others using your natural talents. You're projected upon as having universal solutions.",
    trajectory: "Your life involves being 'discovered' and called to help, followed by retreats to restore yourself. The projection field of the 5 can be intense, and you need hermit time to discharge it.",
    howLinesWorkTogether: "Your 2 develops gifts in private, often unaware of their power. Your 5 attracts people who project that you can save them. Managing this projection while honoring your need for solitude is your dance.",
    relationshipPatterns: "Partners project expectations onto you that you may not meet. You need relationships where you can be yourself, not just the projected savior. Solitude is essential for healthy relating.",
    careerThemes: "Problem-solving roles where you can work somewhat independently, consulting, crisis management, any field where you can retreat after delivering solutions.",
    commonConditioning: [
      "Living up to others' projections of who you should be",
      "Never getting enough hermit time",
      "Not recognizing your own gifts because they come so naturally",
      "Burning out from too many 'calls' to save others"
    ],
    deconditioningPractices: [
      "Fiercely protect your hermit time - it's non-negotiable",
      "Set boundaries around others' expectations",
      "Remember you don't have to save everyone",
      "Trust your natural timing to emerge"
    ],
    personalVsTranspersonal: 'Transpersonal Karma'
  },
  
  '3/5': {
    profile: '3/5',
    name: 'Martyr/Heretic',
    lines: {
      conscious: 3,
      unconscious: 5,
      consciousName: 'Martyr',
      unconsciousName: 'Heretic'
    },
    overview: "The 3/5 profile is the experiential problem-solver. You consciously learn through trial and error, discovering what works, while unconsciously offering universalizing solutions to others.",
    lifeTheme: "Learning through experience and then being called to help others with what you've discovered. Your 'failures' become the foundation for practical solutions others need.",
    trajectory: "Your life is full of experiments and discoveries. What you learn through bumping into life becomes the wisdom others project onto you as their solution.",
    howLinesWorkTogether: "Your 3 experiments and discovers, often through 'failure.' Your 5 is projected upon as having answers. Your experiential knowledge becomes the solutions others seek.",
    relationshipPatterns: "Relationships are learning experiences for you, and partners may project unrealistic expectations. You need someone who celebrates your experimental nature and doesn't expect you to be the savior.",
    careerThemes: "Troubleshooting, consulting, any role where practical experience matters. You're the one who's 'been there, done that' and can advise from real knowledge.",
    commonConditioning: [
      "Shame about 'failed' experiments",
      "Pressure to be the projected solution before you've experimented",
      "Being blamed when projections aren't met",
      "Not valuing your experiential wisdom"
    ],
    deconditioningPractices: [
      "Celebrate every 'failure' as a discovery",
      "Be transparent about your experimental nature",
      "Set realistic expectations with others about what you can solve",
      "Share the wisdom of your experiments without needing to be perfect"
    ],
    personalVsTranspersonal: 'Transpersonal Karma'
  },
  
  '3/6': {
    profile: '3/6',
    name: 'Martyr/Role Model',
    lines: {
      conscious: 3,
      unconscious: 6,
      consciousName: 'Martyr',
      unconsciousName: 'Role Model'
    },
    overview: "The 3/6 profile is the experiential sage. You consciously learn through trial and error throughout life, while unconsciously developing into a role model through three distinct life phases.",
    lifeTheme: "Experimenting your way to wisdom and eventually embodying that wisdom for others. Your life is a journey from experimentation to exemplification.",
    trajectory: "Your life has three phases: Until ~30, intense experimentation (trial and error). 30-50, going 'on the roof' to observe and heal. After 50, descending as a wise role model.",
    howLinesWorkTogether: "Your 3 never stops experimenting, even as your 6 matures through its phases. You learn by doing throughout life, and this experiential wisdom is what makes you the eventual role model.",
    relationshipPatterns: "Relationships evolve dramatically through your three phases. Early relationships are experimental; roof phase is more observational; later relationships embody wisdom from lived experience.",
    careerThemes: "Work that allows for experimentation and eventually mentorship. Roles that value the wisdom of experience. Leadership through having 'lived it.'",
    commonConditioning: [
      "Expecting to be the role model before going through the process",
      "Shame about experimental phase 'failures'",
      "Impatience with the roof phase's observation period",
      "Trying to skip steps in the three-phase process"
    ],
    deconditioningPractices: [
      "Honor which phase you're in without rushing",
      "Value your experiential wisdom at every age",
      "Use the roof phase to integrate, not hide",
      "Trust that your role model phase will come naturally"
    ],
    personalVsTranspersonal: 'Personal Destiny',
    specialNotes: "The 3/6 lives three distinct life phases: (1) Until ~30: Intense trial and error, lots of 'failures' that are actually discoveries. (2) 30-50: Going 'on the roof' - still experimenting but also observing, integrating wisdom. (3) After 50: Descending from the roof as a lived example, a true role model from experience."
  },
  
  '4/6': {
    profile: '4/6',
    name: 'Opportunist/Role Model',
    lines: {
      conscious: 4,
      unconscious: 6,
      consciousName: 'Opportunist',
      unconsciousName: 'Role Model'
    },
    overview: "The 4/6 profile is the influential sage. You consciously impact through your network and relationships, while unconsciously developing into a role model through three life phases.",
    lifeTheme: "Influencing your community while maturing into someone who embodies wisdom. Your network is where your role modeling has the most impact.",
    trajectory: "Your life phases: Until ~30, building network and experiencing life intensely. 30-50, on the roof observing and healing. After 50, descending as a wise networker.",
    howLinesWorkTogether: "Your 4 creates influence through relationships at every phase. Your 6 adds depth and eventual authority. You become the role model within your community.",
    relationshipPatterns: "Relationships are central throughout all phases. Your network evolves with you. In later phases, you become the trusted advisor within your community.",
    careerThemes: "Community leadership, mentorship, roles that leverage both networking and wisdom. Careers that grow deeper and more influential with age.",
    commonConditioning: [
      "Pressure to be the role model before maturity",
      "Losing your network during the roof phase",
      "Thinking influence should come through strangers, not your circle",
      "Impatience with the maturation process"
    ],
    deconditioningPractices: [
      "Nurture your network through all three phases",
      "Trust that your influence will deepen with time",
      "Don't abandon community for the roof - observe from within",
      "Let your role model status emerge naturally"
    ],
    personalVsTranspersonal: 'Fixed Fate',
    specialNotes: "Like the 3/6 and 6/2 and 6/3, the 4/6 lives three life phases. Unlike other 6-line profiles, your phases are filtered through your network (4). Your community is where your role model energy lands."
  },
  
  '4/1': {
    profile: '4/1',
    name: 'Opportunist/Investigator',
    lines: {
      conscious: 4,
      unconscious: 1,
      consciousName: 'Opportunist',
      unconsciousName: 'Investigator'
    },
    overview: "The 4/1 profile is the authoritative networker. You consciously influence through relationships, while unconsciously building deep foundations of knowledge.",
    lifeTheme: "Sharing well-researched knowledge through your network. You become the deeply knowledgeable person your community relies upon for solid information.",
    trajectory: "Your path involves building both expertise and relationships. Your network amplifies your knowledge, and your knowledge makes you valuable to your network.",
    howLinesWorkTogether: "Your 4 spreads influence through relationships, while your 1 gives that influence substance. You're not just popular - you're reliably knowledgeable.",
    relationshipPatterns: "You need relationships where your expertise is valued. Friends and partners who appreciate both your social nature and your need to go deep into topics.",
    careerThemes: "Expert networking, thought leadership within communities, consulting, teaching, any role where deep knowledge flows through relationships.",
    commonConditioning: [
      "Sharing information before you've researched enough",
      "Prioritizing networking over knowledge building",
      "Feeling pressure to always know the answer for your network",
      "Neglecting either your social or investigative needs"
    ],
    deconditioningPractices: [
      "Balance deep research time with networking time",
      "Trust that your knowledge earns you your network",
      "Don't pretend to know more than you do to maintain status",
      "Let your expertise speak for itself within your community"
    ],
    personalVsTranspersonal: 'Fixed Fate'
  },
  
  '5/1': {
    profile: '5/1',
    name: 'Heretic/Investigator',
    lines: {
      conscious: 5,
      unconscious: 1,
      consciousName: 'Heretic',
      unconsciousName: 'Investigator'
    },
    overview: "The 5/1 profile is the projected expert. You consciously carry the projection of being a problem-solver, while unconsciously building the solid foundations to actually deliver.",
    lifeTheme: "Being seen as having universal solutions and backing that up with thorough investigation. Your projections are met because you actually research deeply.",
    trajectory: "Your path involves being called upon to solve problems and having the expertise to actually help. Managing the projection field while building real knowledge.",
    howLinesWorkTogether: "Your 5 attracts projections and expectations. Your 1 builds the foundation to meet them. When projections are realistic and your research is solid, you deliver.",
    relationshipPatterns: "Partners project expectations onto you. You need relationships where you can be a real person, not just the projected savior. Your investigative nature should be respected.",
    careerThemes: "Problem-solving roles that require expertise: consulting, crisis management, specialized knowledge work, leadership positions that require both charisma and competence.",
    commonConditioning: [
      "Trying to meet projections without doing the research",
      "Being projected upon as expert before you are",
      "Hiding when projections become too intense",
      "Shame when you can't meet unrealistic expectations"
    ],
    deconditioningPractices: [
      "Always do your 1-line research before engaging 5-line solutions",
      "Be transparent about what you know and don't know",
      "Set realistic expectations with others",
      "Trust your foundations - they're what make projections meet reality"
    ],
    personalVsTranspersonal: 'Transpersonal Karma'
  },
  
  '5/2': {
    profile: '5/2',
    name: 'Heretic/Hermit',
    lines: {
      conscious: 5,
      unconscious: 2,
      consciousName: 'Heretic',
      unconsciousName: 'Hermit'
    },
    overview: "The 5/2 profile is the called-out natural. You consciously carry projections as a problem-solver, while unconsciously having natural talents and needing hermit time.",
    lifeTheme: "Being called out to solve problems using your natural gifts, then retreating to restore yourself. Your talents often emerge without formal training.",
    trajectory: "Your path alternates between being called upon and retreating. You're projected upon, you help using natural abilities, you need solitude to recover.",
    howLinesWorkTogether: "Your 5 attracts expectations and calls. Your 2 provides natural talent to meet them but also needs privacy. Managing projection while honoring hermit needs is your balance.",
    relationshipPatterns: "Projections plus privacy needs can create tension. You need partners who understand you can't always be 'on' and who don't project unrealistic expectations.",
    careerThemes: "Work that uses natural talents and allows for retreat. Consulting, creative work, any role where you can engage intensely then withdraw to restore.",
    commonConditioning: [
      "Never getting enough hermit time",
      "Not recognizing your natural talents",
      "Living only for others' projections",
      "Burning out from constant calls"
    ],
    deconditioningPractices: [
      "Protect hermit time fiercely",
      "Let your natural gifts be called out rather than forcing them",
      "Set boundaries around availability",
      "Trust your talents even if you can't explain them"
    ],
    personalVsTranspersonal: 'Transpersonal Karma'
  },
  
  '6/2': {
    profile: '6/2',
    name: 'Role Model/Hermit',
    lines: {
      conscious: 6,
      unconscious: 2,
      consciousName: 'Role Model',
      unconsciousName: 'Hermit'
    },
    overview: "The 6/2 profile is the natural role model. You consciously develop through three life phases into an exemplar, while unconsciously possessing natural talents and needing solitude.",
    lifeTheme: "Maturing into a role model who leads by natural example. Your hermit nature allows integration, and your eventual leadership emerges from authentic being.",
    trajectory: "Three phases: Until ~30, living like a 3rd line (trial and error). 30-50, on the roof observing while developing talents. After 50, embodying wisdom through natural gifts.",
    howLinesWorkTogether: "Your 6 goes through life phases to develop wisdom. Your 2 provides natural talent that matures with you. Your role modeling is effortless because it's natural.",
    relationshipPatterns: "Relationships evolve through your phases. You need partners who respect your need for solitude and see your developing wisdom. Later relationships are more stable.",
    careerThemes: "Work that allows for maturation and uses natural gifts. Leadership that emerges rather than is forced. Roles that value lived wisdom and authentic presence.",
    commonConditioning: [
      "Pressure to be the role model before living the process",
      "Not being allowed hermit time during any phase",
      "Trying to force talents that should emerge naturally",
      "Impatience with the roof phase"
    ],
    deconditioningPractices: [
      "Honor each life phase without rushing",
      "Use hermit time for integration at every phase",
      "Trust your natural talents to be called out",
      "Let wisdom develop through lived experience"
    ],
    personalVsTranspersonal: 'Personal Destiny',
    specialNotes: "The 6/2 experiences three phases like all 6-lines, but with a hermit quality throughout. Even on the roof, you need significant alone time. Your role modeling in later life is natural and effortless - leading by being."
  },
  
  '6/3': {
    profile: '6/3',
    name: 'Role Model/Martyr',
    lines: {
      conscious: 6,
      unconscious: 3,
      consciousName: 'Role Model',
      unconsciousName: 'Martyr'
    },
    overview: "The 6/3 profile is the experiential role model. You consciously develop through three life phases, while unconsciously always learning through trial and error.",
    lifeTheme: "Never stopping your experimentation even as you mature into a role model. Your role modeling is based on extensive lived experience and ongoing discovery.",
    trajectory: "Three phases with continuous experimentation: Until ~30, double trial and error. 30-50, on the roof but still experimenting. After 50, a role model who never stops learning.",
    howLinesWorkTogether: "Your 6 develops through life phases. Your 3 never stops experimenting. This creates a role model who leads from perpetual experience rather than finished wisdom.",
    relationshipPatterns: "Relationships are always experiments for you, even as you mature. Partners need to embrace your ongoing discovery process. You never 'figure it out' completely - and that's the wisdom.",
    careerThemes: "Perpetual learning roles, research and development, leadership that values ongoing discovery. Teaching from experience, especially experience of 'failure.'",
    commonConditioning: [
      "Thinking the experimentation should stop at some point",
      "Shame about continuing to 'fail' even as a role model",
      "Pressure to have it all figured out",
      "Not valuing the ongoing discovery as wisdom itself"
    ],
    deconditioningPractices: [
      "Celebrate that you never stop learning",
      "Share the wisdom of current experiments, not just past ones",
      "Embrace being a role model who's still discovering",
      "Reframe 'late in life experiments' as courageous leadership"
    ],
    personalVsTranspersonal: 'Personal Destiny',
    specialNotes: "The 6/3 experiences three phases but with constant experimentation. The first phase is particularly intense (double trial and error energy). Even as you descend from the roof, you're still experimenting - this makes you a unique kind of role model: one who leads by never stopping the quest."
  }
};

// Line explanations for educational content
export const LINE_DESCRIPTIONS: Record<number, { name: string; theme: string; description: string }> = {
  1: {
    name: 'The Investigator',
    theme: 'Foundation, Security, Research',
    description: 'Line 1 is about building solid foundations through deep investigation. You need to understand things thoroughly before you feel secure. Research, study, and knowing the basics is essential for you.'
  },
  2: {
    name: 'The Hermit',
    theme: 'Natural Talent, Being Called Out',
    description: 'Line 2 is about natural gifts and the need for privacy. You have talents you may not even recognize, and others see them clearly. You need to be called out to share your gifts - pushing yourself rarely works.'
  },
  3: {
    name: 'The Martyr',
    theme: 'Trial and Error, Discovery',
    description: 'Line 3 is about learning through experience. You discover what works by finding out what doesn\'t. Every "failure" is a successful discovery. Your wisdom comes from having tried things firsthand.'
  },
  4: {
    name: 'The Opportunist',
    theme: 'Network, Influence',
    description: 'Line 4 is about influence through relationships. Your network is your opportunity. You impact the world through who you know and who knows you. Deep friendships matter more than many acquaintances.'
  },
  5: {
    name: 'The Heretic',
    theme: 'Projection, Universal Solutions',
    description: 'Line 5 is about being projected upon as a problem-solver. Others see you as having solutions to their problems. Managing these projections - and meeting the realistic ones - is your journey.'
  },
  6: {
    name: 'The Role Model',
    theme: 'Three Life Phases, Wisdom',
    description: 'Line 6 is about becoming a living example through three life phases. Until ~30: living like a 3rd line (trial and error). 30-50: going "on the roof" to observe and heal. After 50: descending as a wise role model.'
  }
};

// Get profile data by profile string
export const getProfileData = (profile: string): HDProfileData | undefined => {
  return PROFILE_DATA[profile];
};

// Get all profiles
export const ALL_PROFILES = Object.keys(PROFILE_DATA);

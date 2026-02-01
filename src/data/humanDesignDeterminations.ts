// Human Design PHS Determination Data
// Complete database of all 12 Determinations (6 Left/Strategic + 6 Right/Receptive)

export interface DeterminationData {
  name: string;
  direction: 'Left' | 'Right';
  category: 'Strategic' | 'Receptive';
  description: string;
  implementation: string;
  mealStructure: string[];
  benefits: string;
  commonMistakes: string[];
  practicalTips: string[];
  experimentationGuide: string;
  journalPrompts: string[];
}

export const determinationData: Record<string, DeterminationData> = {
  // ============================================
  // LEFT / STRATEGIC DETERMINATIONS
  // ============================================
  
  Consecutive: {
    name: "Consecutive",
    direction: "Left",
    category: "Strategic",
    description: "Consecutive determination means eating one food at a time, allowing each food to be fully digested before introducing another. Your system processes foods best when they don't mix. This creates clarity in how your body breaks down and uses nutrients.",
    implementation: "Eat single foods or very simple combinations. Complete one food before starting another. Space different foods apart if eaten in same meal. Avoid complex dishes with many ingredients mixed together.",
    mealStructure: [
      "One protein source at a time",
      "Vegetables separate from starches",
      "Fruit eaten alone, not with meals",
      "Simple preparations over complex dishes",
      "Clear sequence: protein → vegetables → starch",
      "Wait between different foods"
    ],
    benefits: "Clearer digestion, easier to identify food sensitivities, less bloating, more energy from meals, better nutrient absorption.",
    commonMistakes: [
      "Eating casseroles or mixed dishes",
      "Combining many foods simultaneously",
      "Rushing between foods",
      "Complex sauces with multiple ingredients",
      "Smoothies with too many ingredients"
    ],
    practicalTips: [
      "Prepare simple, single-ingredient dishes",
      "Eat courses rather than everything at once",
      "Keep meal prep simple",
      "When dining out, order simple preparations",
      "Notice how you feel after simple vs complex meals",
      "Start with protein, then move to other foods"
    ],
    experimentationGuide: "For 30 days, eat foods sequentially. Notice digestion, energy, and mental clarity. Track which combinations work and which don't.",
    journalPrompts: [
      "Did I eat foods one at a time today?",
      "How did my digestion feel after simple vs mixed meals?",
      "What sequence of foods worked best?",
      "Did I notice more energy with sequential eating?"
    ]
  },

  Alternating: {
    name: "Alternating",
    direction: "Left",
    category: "Strategic",
    description: "Alternating determination means your digestion thrives on variety and rotation. You need to alternate between different foods, not eating the same thing repeatedly. Your body craves diversity in nutrients and flavors.",
    implementation: "Rotate your foods daily and weekly. Don't eat the same meal twice in a row. Keep variety high. Your body needs different nutrients on different days.",
    mealStructure: [
      "Different protein each day",
      "Rotate vegetables daily",
      "Vary grains and starches",
      "New recipes regularly",
      "Seasonal eating supports this naturally",
      "Different cuisines throughout week"
    ],
    benefits: "Broader nutrient intake, prevents food sensitivities from overexposure, keeps digestion active, satisfies natural craving for variety.",
    commonMistakes: [
      "Meal prepping same meals all week",
      "Getting stuck in food ruts",
      "Eating same breakfast daily",
      "Limited grocery rotation",
      "Same restaurant orders"
    ],
    practicalTips: [
      "Plan weekly menus with variety",
      "Shop for diverse ingredients",
      "Try new recipes weekly",
      "Rotate protein sources",
      "Keep a food log to ensure variety",
      "Explore different cuisines"
    ],
    experimentationGuide: "Track your meals for 30 days. Ensure you're not repeating meals within 3 days. Notice energy and satisfaction with high variety.",
    journalPrompts: [
      "How much variety did I have today?",
      "Did I repeat any meals this week?",
      "What new foods did I try?",
      "How does variety affect my satisfaction?"
    ]
  },

  Open: {
    name: "Open",
    direction: "Left",
    category: "Strategic",
    description: "Open determination means eating in open, airy environments with good ventilation. Fresh air and open spaces support your digestion. Stuffy, closed environments can impair how you process food.",
    implementation: "Eat outdoors when possible. Choose restaurants with outdoor seating or good ventilation. Open windows while eating at home. Avoid stuffy, crowded spaces for meals.",
    mealStructure: [
      "Outdoor meals preferred",
      "Open windows while eating",
      "Well-ventilated restaurants",
      "Picnics and al fresco dining",
      "Avoid crowded, stuffy spaces",
      "Fresh air circulation essential"
    ],
    benefits: "Better digestion, more oxygen during meals, connection to environment, reduced digestive issues, more relaxed eating experience.",
    commonMistakes: [
      "Eating in stuffy offices",
      "Closed, windowless rooms",
      "Crowded restaurants",
      "Eating in cars with windows up",
      "Basement or interior dining"
    ],
    practicalTips: [
      "Set up outdoor eating space",
      "Open windows before meals",
      "Choose restaurants with patios",
      "Take lunch breaks outside",
      "Notice how ventilation affects digestion",
      "Create airy dining environment at home"
    ],
    experimentationGuide: "For 30 days, prioritize eating in open, ventilated spaces. Compare digestion and energy between open and closed environments.",
    journalPrompts: [
      "Where did I eat today - open or closed?",
      "How did the environment affect my meal?",
      "Did I feel better eating outdoors?",
      "What's my ideal eating environment?"
    ]
  },

  Calm: {
    name: "Calm",
    direction: "Left",
    category: "Strategic",
    description: "Calm determination means eating in peaceful, quiet environments without stress or stimulation. Your nervous system needs calm to properly digest. Chaos and noise disrupt your food processing.",
    implementation: "Create peaceful eating environments. No TV, phones, or stressful conversations during meals. Eat alone or with calm company. Avoid rushed or stressful mealtimes.",
    mealStructure: [
      "Silent or quiet meals",
      "No screens during eating",
      "Peaceful company only",
      "Calm environment setup",
      "No rushed eating",
      "Mindful, present eating"
    ],
    benefits: "Improved digestion, reduced stress eating, better food awareness, parasympathetic activation, more satisfaction from meals.",
    commonMistakes: [
      "Eating while working",
      "TV or phone during meals",
      "Stressful conversations while eating",
      "Rushed lunches",
      "Noisy, chaotic environments"
    ],
    practicalTips: [
      "Create a peaceful eating space",
      "Put devices away during meals",
      "Eat before getting too hungry/stressed",
      "Choose quiet restaurants",
      "Take 3 breaths before eating",
      "Eat alone if company is stressful"
    ],
    experimentationGuide: "For 30 days, create calm for every meal. No devices, peaceful environment, relaxed pace. Notice digestion and satisfaction differences.",
    journalPrompts: [
      "Was my eating environment calm today?",
      "Did I have any screens during meals?",
      "How did stress level affect my digestion?",
      "What helps me eat most peacefully?"
    ]
  },

  "Hot Thirst": {
    name: "Hot Thirst",
    direction: "Left",
    category: "Strategic",
    description: "Hot Thirst determination means you digest best with warm or hot foods and beverages. Your system needs heat to properly break down food. Cold foods and drinks can slow your digestion.",
    implementation: "Eat warm, cooked foods. Drink room temperature or warm beverages. Avoid ice-cold drinks and raw/cold foods. Warm your digestive fire.",
    mealStructure: [
      "Cooked foods preferred",
      "Warm beverages with meals",
      "No ice in drinks",
      "Soups and stews beneficial",
      "Warming spices helpful",
      "Room temperature minimum"
    ],
    benefits: "Stronger digestion, better nutrient absorption, less bloating, supports digestive fire, more satisfying meals.",
    commonMistakes: [
      "Ice cold beverages",
      "Raw food diets",
      "Cold smoothies",
      "Iced coffee or drinks",
      "Refrigerated leftovers eaten cold"
    ],
    practicalTips: [
      "Warm up leftovers",
      "Order drinks without ice",
      "Cook vegetables vs raw",
      "Use warming spices: ginger, cinnamon",
      "Start meals with warm soup",
      "Keep thermos of warm water"
    ],
    experimentationGuide: "For 30 days, eat only warm/hot foods and drinks. Notice digestion, energy, and satisfaction compared to cold food periods.",
    journalPrompts: [
      "Were my foods/drinks warm today?",
      "How did warm vs cold foods affect me?",
      "Did I notice better digestion with heat?",
      "What warming foods satisfy me most?"
    ]
  },

  "Direct Light": {
    name: "Direct Light",
    direction: "Left",
    category: "Strategic",
    description: "Direct Light determination means eating in bright, well-lit environments, ideally with natural daylight. Your body uses light cues for proper digestion. Dark or dim environments can impair your food processing.",
    implementation: "Eat in bright, naturally lit spaces. Position yourself near windows. Eat your main meal during daylight hours. Avoid dark restaurants or dim dinner settings.",
    mealStructure: [
      "Breakfast and lunch as main meals",
      "Eat near windows in daylight",
      "Bright lighting for all meals",
      "Lighter dinner, eaten earlier",
      "Outdoor meals when possible",
      "Avoid late-night heavy eating"
    ],
    benefits: "Aligned with circadian rhythm, better daytime digestion, more energy from meals, natural eating pattern, improved metabolism.",
    commonMistakes: [
      "Heavy dinners in dim settings",
      "Eating in dark rooms",
      "Late night heavy meals",
      "Candlelit dinners as primary pattern",
      "Missing daylight eating windows"
    ],
    practicalTips: [
      "Make lunch your biggest meal",
      "Set up eating area near windows",
      "Eat earlier in evening",
      "Get bright light exposure with meals",
      "Notice how lighting affects appetite",
      "Front-load calories to daytime"
    ],
    experimentationGuide: "For 30 days, eat your main meals in bright light during daytime. Keep dinner lighter and earlier. Track energy and digestion.",
    journalPrompts: [
      "Did I eat in bright light today?",
      "Was my main meal during daylight?",
      "How did lighting affect my appetite?",
      "What time was my last meal vs sunset?"
    ]
  },

  // ============================================
  // RIGHT / RECEPTIVE DETERMINATIONS
  // ============================================

  Appetite: {
    name: "Appetite",
    direction: "Right",
    category: "Receptive",
    description: "Appetite determination means eating only when you have true physical hunger. Your body tells you when and what it needs. Eating by the clock or because 'it's time' disturbs your natural appetite rhythm.",
    implementation: "Wait for genuine hunger signals before eating. Honor cravings - they're your body's wisdom. Don't eat just because it's mealtime. Your appetite timing is unique and variable.",
    mealStructure: [
      "No fixed meal times",
      "Wait for true hunger",
      "Honor what you're craving",
      "Eat when body signals, not clock",
      "Meal size varies by appetite",
      "Trust your hunger cues"
    ],
    benefits: "Natural weight regulation, eating what body truly needs, improved hunger awareness, trusting body wisdom, no overeating.",
    commonMistakes: [
      "Eating by the clock",
      "Forcing breakfast if not hungry",
      "Ignoring cravings",
      "Scheduled meals when not hungry",
      "Overriding appetite signals"
    ],
    practicalTips: [
      "Check in with hunger before eating",
      "Skip meals if not hungry",
      "Honor cravings without judgment",
      "Keep flexible eating schedule",
      "Notice true hunger vs. boredom",
      "Trust your appetite timing"
    ],
    experimentationGuide: "For 30 days, eat only when genuinely hungry. Track when natural hunger arises and what foods your body craves. Notice patterns and trust signals.",
    journalPrompts: [
      "Was I truly hungry when I ate?",
      "What was I craving?",
      "Did I honor my appetite today?",
      "What does true hunger feel like for me?",
      "When does my appetite naturally arise?"
    ]
  },

  Taste: {
    name: "Taste",
    direction: "Right",
    category: "Receptive",
    description: "Taste determination means following your taste preferences and allowing variety based on what tastes good to you. Your taste buds guide you to what your body needs. Trust your palate over nutritional dogma.",
    implementation: "Eat what tastes good to you in the moment. Flavor preferences change based on body needs. Allow wide variety. Your taste is your nutritional compass.",
    mealStructure: [
      "Follow taste preferences daily",
      "Allow flavor variety",
      "Eat what tastes best today",
      "Honor changing preferences",
      "Quality ingredients for better taste",
      "Explore diverse flavors"
    ],
    benefits: "Intuitive eating, microbiome diversity, enjoyment of food, natural nutritional balance, trusting body intelligence.",
    commonMistakes: [
      "Eating 'healthy' foods you don't enjoy",
      "Restricting food variety",
      "Ignoring taste preferences",
      "Food rules over taste",
      "Monotonous diet"
    ],
    practicalTips: [
      "Stock diverse, quality ingredients",
      "Notice daily taste preferences",
      "Try new flavors regularly",
      "Cook with quality seasonings",
      "Honor changing preferences",
      "Trust taste over trends"
    ],
    experimentationGuide: "Follow your taste exclusively for 30 days. Notice if your body naturally seeks nutritional balance through flavor variety.",
    journalPrompts: [
      "What did I genuinely want to taste today?",
      "Did I honor my taste preferences?",
      "How does my palate change day to day?",
      "What flavors am I drawn to lately?"
    ]
  },

  Thirst: {
    name: "Thirst",
    direction: "Right",
    category: "Receptive",
    description: "Thirst determination means eating based on your body's temperature state - cold food when body is hot, warm food when body is cold. Also includes tactile connection to food through preparation.",
    implementation: "Notice your body temperature before eating. Eat cold foods when overheated, warm foods when cold. Handle and prepare your own food when possible for energetic connection.",
    mealStructure: [
      "Check body temperature first",
      "Hot day = cold foods",
      "Cold day = warm foods",
      "Handle and prepare food yourself",
      "Connect tactilely with ingredients",
      "Seasonal temperature adjustment"
    ],
    benefits: "Temperature regulation support, energetic connection to food, improved satisfaction, body awareness.",
    commonMistakes: [
      "Ignoring body temperature",
      "Always eating same temperature food",
      "Not preparing own food",
      "Missing tactile connection"
    ],
    practicalTips: [
      "Cook your own meals when possible",
      "Check in with body temperature",
      "Adjust food temperature accordingly",
      "Touch and handle ingredients",
      "Seasonal eating naturally supports this"
    ],
    experimentationGuide: "For 30 days, match food temperature to body state. Notice if this improves satisfaction and body regulation.",
    journalPrompts: [
      "What was my body temperature before eating?",
      "Did food temperature match my body state?",
      "Did I prepare my own food?",
      "How did tactile preparation affect satisfaction?"
    ]
  },

  Nervous: {
    name: "Nervous",
    direction: "Right",
    category: "Receptive",
    description: "Nervous determination means you can eat in any environment - your system is flexible and adaptable. You don't need specific environmental conditions for digestion.",
    implementation: "Eat wherever and whenever feels right. No environmental restrictions. Your system adapts to all conditions. Trust your nervous system's flexibility.",
    mealStructure: [
      "Flexible eating environments",
      "No environmental requirements",
      "Adapt to any setting",
      "Social or solo both fine",
      "Busy or calm both work"
    ],
    benefits: "Ultimate flexibility, easy social eating, travel-friendly, no environmental anxiety, adaptable digestion.",
    commonMistakes: [
      "Thinking you need special conditions",
      "Creating unnecessary food rules",
      "Feeling limited by environment"
    ],
    practicalTips: [
      "Embrace eating flexibility",
      "Don't overthink environment",
      "Enjoy spontaneous meals",
      "Travel easily",
      "Adapt naturally"
    ],
    experimentationGuide: "Notice that you digest fine in various environments. Don't restrict yourself unnecessarily.",
    journalPrompts: [
      "Did I digest well regardless of environment?",
      "Am I creating unnecessary restrictions?",
      "How does flexibility serve me?"
    ]
  },

  "Low Sound": {
    name: "Low Sound",
    direction: "Right",
    category: "Receptive",
    description: "Low Sound determination means quiet, calm environments support your digestion best. Similar to Calm but from a receptive rather than strategic place.",
    implementation: "Choose quieter environments. Your system is sensitive to noise while digesting. Gentle, peaceful settings allow better processing.",
    mealStructure: [
      "Quiet eating spaces",
      "Minimal external stimulation",
      "Peaceful environments",
      "Solo meals often helpful",
      "Soft background sounds okay"
    ],
    benefits: "Reduced digestive stress, better nutrient absorption, peaceful eating experience, nervous system support.",
    commonMistakes: [
      "Forcing social noisy meals",
      "Eating in chaos",
      "Not honoring sensitivity",
      "Loud restaurants"
    ],
    practicalTips: [
      "Choose quiet restaurants",
      "Eat in peaceful spaces",
      "Request quieter seating",
      "Home meals often easier",
      "Honor your sensitivity"
    ],
    experimentationGuide: "Notice digestion difference between quiet and loud environments. Honor your system's preference for low stimulation.",
    journalPrompts: [
      "Was my eating environment quiet enough?",
      "How did noise level affect digestion?",
      "What's my ideal sound level while eating?"
    ]
  },

  "Indirect Light": {
    name: "Indirect Light",
    direction: "Right",
    category: "Receptive",
    description: "Indirect Light determination means eating in softer, indirect lighting - evening, candlelight, or shaded areas. Bright direct light can disturb your digestion.",
    implementation: "Eat in evening hours or softer lighting. Avoid bright overhead lights or direct sunlight while eating. Your digestion is connected to softer light conditions.",
    mealStructure: [
      "Evening meals natural",
      "Dim or indirect lighting",
      "Candlelit dinners beneficial",
      "Shaded outdoor eating",
      "Avoid harsh bright lights"
    ],
    benefits: "Relaxed digestion, evening eating supported, romantic dinner preference, softer nervous system response.",
    commonMistakes: [
      "Forcing bright daylight eating",
      "Harsh overhead lighting",
      "Not honoring evening preference"
    ],
    practicalTips: [
      "Dim lights at dinner",
      "Use candles",
      "Evening meals primary",
      "Shaded outdoor seating",
      "Avoid fluorescent lighting"
    ],
    experimentationGuide: "Track digestion in bright vs. soft light. Notice if evening meals feel more natural and digest better.",
    journalPrompts: [
      "What was the lighting during meals?",
      "Did I digest better in softer light?",
      "How do evening meals feel for me?"
    ]
  }
};

// Helper function to get determination by name
export const getDetermination = (name: string): DeterminationData | undefined => {
  return determinationData[name];
};

// Get all Left/Strategic determinations
export const getLeftDeterminations = (): DeterminationData[] => {
  return Object.values(determinationData).filter(d => d.direction === 'Left');
};

// Get all Right/Receptive determinations  
export const getRightDeterminations = (): DeterminationData[] => {
  return Object.values(determinationData).filter(d => d.direction === 'Right');
};

// Get determination pairs (Left vs Right equivalents)
export const getDeterminationPairs = (): Array<{ left: DeterminationData; right: DeterminationData }> => {
  return [
    { left: determinationData['Consecutive'], right: determinationData['Appetite'] },
    { left: determinationData['Alternating'], right: determinationData['Taste'] },
    { left: determinationData['Open'], right: determinationData['Nervous'] },
    { left: determinationData['Calm'], right: determinationData['Low Sound'] },
    { left: determinationData['Hot Thirst'], right: determinationData['Thirst'] },
    { left: determinationData['Direct Light'], right: determinationData['Indirect Light'] }
  ];
};

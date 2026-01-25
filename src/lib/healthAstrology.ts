// Health Astrology Data & Logic
// Core data structures for medical astrology interpretations

export interface PlanetaryHealthInfo {
  symbol: string;
  bodyParts: string[];
  healthThemes: string[];
  signEffects: Record<string, string>;
}

export interface SignNutritionInfo {
  ruledBy: string;
  cellSalt: string;
  nutritionalNeeds: string[];
  beneficialFoods: string[];
  avoid: string[];
  healthFocus: string;
}

export interface ElementNutritionInfo {
  characteristics: string;
  foods: string[];
  avoid: string[];
  mealTiming: string;
}

export interface HouseHealthInfo {
  healthSignificance: string;
  bodyParts: string[];
  rulerPlacement: string;
  planetsPresent: string;
}

// Planetary Health Rulers
export const PLANETARY_HEALTH_RULERS: Record<string, PlanetaryHealthInfo> = {
  Sun: {
    symbol: '☉',
    bodyParts: ['Heart', 'Spine', 'Right eye (men)', 'General vitality'],
    healthThemes: ['Cardiovascular system', 'Vitality levels', 'Ego-health connection', 'Life force'],
    signEffects: {
      Aries: 'Strong vitality with tendency toward head-related issues, fevers',
      Taurus: 'Sturdy constitution, throat sensitivity, slow metabolism',
      Gemini: 'Nervous energy affecting heart, need for mental rest',
      Cancer: 'Emotional health affects physical, digestive sensitivity',
      Leo: 'Generally robust heart, but watch for overexertion',
      Virgo: 'Health-conscious, tendency toward worry affecting digestion',
      Libra: 'Balance-seeking in health, kidney/adrenal connection',
      Scorpio: 'Regenerative power, intensity can affect heart',
      Sagittarius: 'Optimistic health outlook, liver connection',
      Capricorn: 'Endurance focus, bones and skin need attention',
      Aquarius: 'Unconventional health approaches, circulation focus',
      Pisces: 'Sensitive vitality, immune system connection'
    }
  },
  Moon: {
    symbol: '☽',
    bodyParts: ['Stomach', 'Breasts', 'Fluids', 'Left eye (women)', 'Lymphatic system'],
    healthThemes: ['Digestive health', 'Emotional eating', 'Water retention', 'Menstrual health', 'Hormonal cycles'],
    signEffects: {
      Aries: 'Impulsive eating, stress affects digestion quickly',
      Taurus: 'Comfort food tendencies, stable but slow digestion',
      Gemini: 'Nervous stomach, eating while distracted',
      Cancer: 'Deep emotional connection to food, nurturing through eating',
      Leo: 'Generous portions, dramatic emotional eating patterns',
      Virgo: 'Picky eater, health-conscious but anxious about food',
      Libra: 'Social eating, needs pleasant dining environment',
      Scorpio: 'Intense food cravings, all-or-nothing eating',
      Sagittarius: 'Adventurous eating, overeating when happy',
      Capricorn: 'Disciplined but may skip meals when stressed',
      Aquarius: 'Unusual food preferences, detached from hunger signals',
      Pisces: 'Absorbs others\' eating habits, comfort eating tendency'
    }
  },
  Mercury: {
    symbol: '☿',
    bodyParts: ['Nervous system', 'Respiratory system', 'Hands', 'Shoulders', 'Intestines'],
    healthThemes: ['Anxiety & stress', 'Communication-breath connection', 'Intestinal health', 'Mental health'],
    signEffects: {
      Aries: 'Quick-thinking but prone to mental burnout, headaches',
      Taurus: 'Slow, deliberate mental processing, throat issues',
      Gemini: 'Highly active mind, nervous system needs rest',
      Cancer: 'Emotional thinking affects breathing patterns',
      Leo: 'Dramatic expression, voice strain potential',
      Virgo: 'Analytical mind prone to overthinking, intestinal sensitivity',
      Libra: 'Mental balance needed, decision stress affects nerves',
      Scorpio: 'Deep thinking, respiratory depth important',
      Sagittarius: 'Expansive thinking, restless nervous energy',
      Capricorn: 'Structured thinking, tension in shoulders',
      Aquarius: 'Innovative mind, unusual nervous system responses',
      Pisces: 'Intuitive thinking, boundary issues affect mental health'
    }
  },
  Venus: {
    symbol: '♀',
    bodyParts: ['Kidneys', 'Throat', 'Lower back', 'Venous system', 'Skin'],
    healthThemes: ['Sugar balance', 'Kidney function', 'Beauty & skin health', 'Pleasure-health connection'],
    signEffects: {
      Aries: 'Active approach to beauty, may push through discomfort',
      Taurus: 'Sensual approach to health, throat sensitivity',
      Gemini: 'Social wellness activities, skin reflects nervous state',
      Cancer: 'Nurturing self-care, water retention tendencies',
      Leo: 'Luxurious self-care, heart-beauty connection',
      Virgo: 'Precise beauty routines, critical of appearance',
      Libra: 'Balance-focused, kidneys need support',
      Scorpio: 'Intense beauty transformations, reproductive health focus',
      Sagittarius: 'Natural beauty approach, liver-skin connection',
      Capricorn: 'Structured beauty routines, skin aging focus',
      Aquarius: 'Unique beauty standards, circulation affects skin',
      Pisces: 'Dreamy beauty ideals, lymphatic skin connection'
    }
  },
  Mars: {
    symbol: '♂',
    bodyParts: ['Muscles', 'Head', 'Adrenal glands', 'Red blood cells', 'Male reproductive system'],
    healthThemes: ['Inflammation', 'Fever', 'Accidents & injuries', 'Energy burns', 'Athletic capacity'],
    signEffects: {
      Aries: 'High energy, prone to head injuries and fevers',
      Taurus: 'Slow to anger but stubborn inflammation patterns',
      Gemini: 'Scattered energy, hand/arm injuries possible',
      Cancer: 'Protective energy, stomach inflammation tendencies',
      Leo: 'Dramatic energy output, heart needs monitoring during exercise',
      Virgo: 'Precise energy use, intestinal inflammation risk',
      Libra: 'Balanced energy, lower back strain potential',
      Scorpio: 'Intense stamina, reproductive system focus',
      Sagittarius: 'Adventurous energy, hip/thigh injuries',
      Capricorn: 'Enduring energy, knee/joint stress',
      Aquarius: 'Erratic energy bursts, ankle vulnerability',
      Pisces: 'Diffuse energy, foot issues and immune sensitivity'
    }
  },
  Jupiter: {
    symbol: '♃',
    bodyParts: ['Liver', 'Hips', 'Thighs', 'Pituitary gland', 'Arterial system'],
    healthThemes: ['Growth & expansion', 'Liver function', 'Weight gain tendency', 'Optimism & health'],
    signEffects: {
      Aries: 'Enthusiastic health approach, may overdo exercise',
      Taurus: 'Abundance in eating, liver processing rich foods',
      Gemini: 'Multiple health interests, scattered approach',
      Cancer: 'Nurturing through food, emotional liver connection',
      Leo: 'Generous portions, heart-liver connection',
      Virgo: 'Analytical health approach, digestion optimization',
      Libra: 'Social eating expansion, balance in indulgence',
      Scorpio: 'Intense transformation potential, deep healing',
      Sagittarius: 'Natural optimism aids healing, liver needs care',
      Capricorn: 'Structured growth, bone-building focus',
      Aquarius: 'Innovative healing approaches, unusual remedies',
      Pisces: 'Spiritual healing connection, liver sensitivity'
    }
  },
  Saturn: {
    symbol: '♄',
    bodyParts: ['Bones', 'Teeth', 'Knees', 'Skin', 'Gallbladder', 'Spleen'],
    healthThemes: ['Chronic conditions', 'Structural integrity', 'Aging process', 'Mineral deficiencies'],
    signEffects: {
      Aries: 'Structural impatience, head/skull tension',
      Taurus: 'Slow metabolism, dental and throat focus',
      Gemini: 'Nervous system discipline needed, respiratory structure',
      Cancer: 'Emotional armoring, digestive structure',
      Leo: 'Heart discipline required, spine support needed',
      Virgo: 'Health discipline natural, intestinal structure',
      Libra: 'Kidney structure, lower back support needed',
      Scorpio: 'Deep structural transformation, elimination focus',
      Sagittarius: 'Hip/thigh structure, philosophy of aging',
      Capricorn: 'Strong bones but needs calcium, knee care essential',
      Aquarius: 'Circulation structure, ankle vulnerability',
      Pisces: 'Foot structure, immune system building'
    }
  },
  Uranus: {
    symbol: '♅',
    bodyParts: ['Ankles', 'Calves', 'Electrical nervous system', 'Circulatory rhythm'],
    healthThemes: ['Sudden health changes', 'Nervous system irregularities', 'Innovative healing', 'Electrical sensitivity'],
    signEffects: {
      Aries: 'Sudden energy shifts, head-related breakthroughs',
      Taurus: 'Unexpected metabolic changes, unusual food reactions',
      Gemini: 'Electrical nervous system sensitivity',
      Cancer: 'Sudden emotional shifts affecting health',
      Leo: 'Heart rhythm awareness, creative healing',
      Virgo: 'Unconventional health routines, digestive innovation',
      Libra: 'Sudden balance disruptions, circulatory innovation',
      Scorpio: 'Transformative breakthroughs, reproductive innovation',
      Sagittarius: 'Freedom in healing approach, travel affects health',
      Capricorn: 'Structural breakthroughs, bone innovation',
      Aquarius: 'Circulatory innovation, ankle-related issues',
      Pisces: 'Intuitive healing breakthroughs, immune innovation'
    }
  },
  Neptune: {
    symbol: '♆',
    bodyParts: ['Feet', 'Lymphatic system', 'Pineal gland', 'Immune system'],
    healthThemes: ['Sensitivities & allergies', 'Psychosomatic illness', 'Spiritual health', 'Addiction tendencies'],
    signEffects: {
      Aries: 'Confusion about energy levels, identity-health link',
      Taurus: 'Sensitivity to foods, grounding needed',
      Gemini: 'Mental-spiritual connection, communication sensitivity',
      Cancer: 'Deep emotional sensitivity, boundary dissolution',
      Leo: 'Creative-spiritual health link, ego dissolution',
      Virgo: 'Health anxiety, sensitivity to treatments',
      Libra: 'Relationship-health sensitivity, beauty idealization',
      Scorpio: 'Deep spiritual transformation, addiction awareness',
      Sagittarius: 'Spiritual seeking affecting health, liver sensitivity',
      Capricorn: 'Dissolving old structures, bone sensitivity',
      Aquarius: 'Collective health sensitivity, humanitarian healing',
      Pisces: 'Peak sensitivity, profound spiritual health connection'
    }
  },
  Pluto: {
    symbol: '♇',
    bodyParts: ['Reproductive system', 'Elimination system', 'Cellular regeneration'],
    healthThemes: ['Transformation & healing', 'Deep cellular health', 'Toxin elimination', 'Regenerative capacity'],
    signEffects: {
      Aries: 'Identity transformation, regenerative power',
      Taurus: 'Deep metabolic transformation, material health',
      Gemini: 'Mental transformation, communication power',
      Cancer: 'Emotional transformation, family health patterns',
      Leo: 'Heart transformation, creative regeneration',
      Virgo: 'Health routine transformation, analytical healing',
      Libra: 'Relationship health transformation, balance power',
      Scorpio: 'Peak regenerative power, profound transformation',
      Sagittarius: 'Belief transformation, liver regeneration',
      Capricorn: 'Structural transformation, bone regeneration',
      Aquarius: 'Collective transformation, circulatory regeneration',
      Pisces: 'Spiritual transformation, immune regeneration'
    }
  }
};

// Element-Based Nutrition
export const ELEMENTAL_NUTRITION: Record<string, ElementNutritionInfo> = {
  Fire: {
    characteristics: 'High metabolism, needs protein and B vitamins for sustained energy',
    foods: ['Lean proteins', 'Whole grains', 'Foods rich in B vitamins', 'Warming spices', 'Iron-rich foods'],
    avoid: ['Excessive stimulants', 'Too much sugar', 'Inflammatory foods', 'Alcohol excess'],
    mealTiming: 'Regular meals to sustain energy, smaller portions more frequently'
  },
  Earth: {
    characteristics: 'Slower metabolism, builds easily, needs fiber and minerals',
    foods: ['Root vegetables', 'Whole grains', 'Lean proteins', 'Mineral-rich foods', 'Leafy greens'],
    avoid: ['Heavy dairy', 'Excessive carbs', 'Processed foods', 'Overindulgence'],
    mealTiming: 'Smaller, frequent meals; avoid eating late at night'
  },
  Air: {
    characteristics: 'Fast metabolism, needs nervous system support and grounding foods',
    foods: ['Leafy greens', 'Nuts and seeds', 'Omega-3 fatty acids', 'Calming herbs', 'Complex carbs'],
    avoid: ['Caffeine excess', 'Sugar spikes', 'Processed foods', 'Eating while distracted'],
    mealTiming: 'Light, frequent meals; regular eating schedule important'
  },
  Water: {
    characteristics: 'Emotional eating tendency, fluid retention, needs clean proteins',
    foods: ['Fresh fruits', 'Vegetables', 'Lean proteins', 'Natural diuretics', 'Seaweed'],
    avoid: ['Excessive salt', 'Dairy', 'Heavy foods', 'Alcohol', 'Processed foods'],
    mealTiming: 'Mindful eating, avoid emotional triggers, eat in calm environment'
  }
};

// Sign-Specific Nutrition
export const SIGN_NUTRITION: Record<string, SignNutritionInfo> = {
  Aries: {
    ruledBy: 'Mars',
    cellSalt: 'Potassium Phosphate (Kali Phos)',
    nutritionalNeeds: ['Protein', 'Iron', 'B vitamins', 'Potassium'],
    beneficialFoods: ['Lean red meat', 'Spinach', 'Lentils', 'Beets', 'Radishes', 'Onions', 'Garlic', 'Tomatoes'],
    avoid: ['Excess salt', 'Alcohol', 'Stimulants', 'Spicy food excess'],
    healthFocus: 'Head, brain, adrenals'
  },
  Taurus: {
    ruledBy: 'Venus',
    cellSalt: 'Sodium Sulphate (Nat Sulph)',
    nutritionalNeeds: ['Vitamin E', 'Copper', 'Sodium', 'Iodine'],
    beneficialFoods: ['Leafy greens', 'Apples', 'Grapes', 'Whole grains', 'Spinach', 'Pumpkin', 'Cranberries'],
    avoid: ['Rich foods', 'Excess sugar', 'Overeating', 'Heavy starches'],
    healthFocus: 'Throat, thyroid, metabolism'
  },
  Gemini: {
    ruledBy: 'Mercury',
    cellSalt: 'Potassium Chloride (Kali Mur)',
    nutritionalNeeds: ['B vitamins', 'Omega-3', 'Magnesium', 'Potassium'],
    beneficialFoods: ['Nuts', 'Seeds', 'Leafy greens', 'Celery', 'Green beans', 'Peaches', 'Plums'],
    avoid: ['Caffeine', 'Stimulants', 'White flour', 'Eating while multitasking'],
    healthFocus: 'Nervous system, lungs, hands, shoulders'
  },
  Cancer: {
    ruledBy: 'Moon',
    cellSalt: 'Calcium Fluoride (Calc Fluor)',
    nutritionalNeeds: ['Calcium', 'Selenium', 'Protein', 'Vitamin B'],
    beneficialFoods: ['Milk products', 'Cabbage', 'Watercress', 'Cucumber', 'Melon', 'Fish', 'Eggs'],
    avoid: ['Excess sugar', 'Starchy foods', 'Alcohol', 'Eating when emotional'],
    healthFocus: 'Stomach, breasts, digestion'
  },
  Leo: {
    ruledBy: 'Sun',
    cellSalt: 'Magnesium Phosphate (Mag Phos)',
    nutritionalNeeds: ['Magnesium', 'Vitamin C', 'Vitamin E', 'Protein'],
    beneficialFoods: ['Citrus', 'Whole grains', 'Nuts', 'Sunflower seeds', 'Coconut', 'Rice', 'Honey'],
    avoid: ['Fatty foods', 'Excess meat', 'Alcohol', 'Rich desserts'],
    healthFocus: 'Heart, spine, circulation'
  },
  Virgo: {
    ruledBy: 'Mercury',
    cellSalt: 'Potassium Sulphate (Kali Sulph)',
    nutritionalNeeds: ['Fiber', 'Potassium', 'Digestive enzymes', 'Probiotics'],
    beneficialFoods: ['Whole grains', 'Oats', 'Root vegetables', 'Almonds', 'Cheese', 'Yogurt', 'Papaya'],
    avoid: ['Rich foods', 'Chocolate', 'Coffee', 'Processed foods'],
    healthFocus: 'Intestines, digestive system'
  },
  Libra: {
    ruledBy: 'Venus',
    cellSalt: 'Sodium Phosphate (Nat Phos)',
    nutritionalNeeds: ['Vitamin E', 'Copper', 'Sodium', 'Phosphorus'],
    beneficialFoods: ['Strawberries', 'Apples', 'Raisins', 'Almonds', 'Asparagus', 'Peas', 'Corn'],
    avoid: ['Alcohol', 'Carbonated drinks', 'Excess sugar', 'Refined foods'],
    healthFocus: 'Kidneys, lower back, skin'
  },
  Scorpio: {
    ruledBy: 'Mars/Pluto',
    cellSalt: 'Calcium Sulphate (Calc Sulph)',
    nutritionalNeeds: ['Calcium', 'Iron', 'Zinc', 'Vitamin C'],
    beneficialFoods: ['Asparagus', 'Radishes', 'Onions', 'Tomatoes', 'Black cherries', 'Prunes', 'Coconut'],
    avoid: ['Alcohol', 'Excess protein', 'Rich foods', 'Yeast products'],
    healthFocus: 'Reproductive system, elimination'
  },
  Sagittarius: {
    ruledBy: 'Jupiter',
    cellSalt: 'Silica (Silicea)',
    nutritionalNeeds: ['Silica', 'Manganese', 'Vitamin C', 'B vitamins'],
    beneficialFoods: ['Cherries', 'Oranges', 'Asparagus', 'Oats', 'Strawberries', 'Figs', 'Plums'],
    avoid: ['Rich foods', 'Excess fat', 'Alcohol', 'Overindulgence'],
    healthFocus: 'Hips, thighs, liver'
  },
  Capricorn: {
    ruledBy: 'Saturn',
    cellSalt: 'Calcium Phosphate (Calc Phos)',
    nutritionalNeeds: ['Calcium', 'Phosphorus', 'Vitamin D', 'Protein'],
    beneficialFoods: ['Dairy', 'Spinach', 'Oranges', 'Lemons', 'Almonds', 'Whole wheat', 'Eggs'],
    avoid: ['Excess meat', 'Rich foods', 'Cold foods', 'Skipping meals'],
    healthFocus: 'Bones, teeth, knees, skin'
  },
  Aquarius: {
    ruledBy: 'Saturn/Uranus',
    cellSalt: 'Sodium Chloride (Nat Mur)',
    nutritionalNeeds: ['Sodium', 'Trace minerals', 'Omega-3', 'Vitamin B'],
    beneficialFoods: ['Ocean fish', 'Spinach', 'Radishes', 'Lentils', 'Apples', 'Peaches', 'Pears'],
    avoid: ['Excess salt', 'Preservatives', 'Artificial foods', 'Caffeine'],
    healthFocus: 'Circulation, ankles, nervous system'
  },
  Pisces: {
    ruledBy: 'Jupiter/Neptune',
    cellSalt: 'Ferrum Phosphate (Ferr Phos)',
    nutritionalNeeds: ['Iron', 'Phosphorus', 'Vitamin C', 'Iodine'],
    beneficialFoods: ['Ocean fish', 'Liver', 'Lean beef', 'Raisins', 'Lettuce', 'Walnuts', 'Spinach'],
    avoid: ['Alcohol', 'Drugs', 'Coffee', 'Oily foods', 'Processed foods'],
    healthFocus: 'Feet, lymphatic system, immune system'
  }
};

// House System Health
export const HOUSE_HEALTH: Record<number, HouseHealthInfo> = {
  1: {
    healthSignificance: 'Physical body, appearance, vitality, health constitution',
    bodyParts: ['Physical body', 'Head', 'Face', 'General vitality'],
    rulerPlacement: 'Shows where you direct physical energy and how you present your health',
    planetsPresent: 'Direct influence on physical health, appearance, and vitality expression'
  },
  2: {
    healthSignificance: 'Throat, neck, thyroid, resources for health, food values',
    bodyParts: ['Throat', 'Neck', 'Thyroid', 'Voice'],
    rulerPlacement: 'How you value and resource your health, spending on wellness',
    planetsPresent: 'Relationship with food, physical comfort, and material health resources'
  },
  3: {
    healthSignificance: 'Lungs, shoulders, arms, hands, nervous system, health communication',
    bodyParts: ['Lungs', 'Shoulders', 'Arms', 'Hands'],
    rulerPlacement: 'How you think and communicate about health, learning wellness',
    planetsPresent: 'Mental approach to wellness, sibling health patterns'
  },
  4: {
    healthSignificance: 'Stomach, breasts, emotional foundation of health, home environment',
    bodyParts: ['Stomach', 'Breasts', 'Chest'],
    rulerPlacement: 'Emotional roots of health patterns, family health legacy',
    planetsPresent: 'Family health patterns, emotional eating, home healing environment'
  },
  5: {
    healthSignificance: 'Heart, back, creative expression, pleasure and health, children\'s health',
    bodyParts: ['Heart', 'Upper back', 'Spine'],
    rulerPlacement: 'Joy and playfulness in health, creative approach to wellness',
    planetsPresent: 'Creative approach to wellness, romantic influence on health'
  },
  6: {
    healthSignificance: 'PRIMARY HEALTH HOUSE - daily routines, work-life balance, service, specific health issues',
    bodyParts: ['Intestines', 'Lower digestive system', 'Daily body maintenance'],
    rulerPlacement: 'Key to understanding health management and daily wellness practices',
    planetsPresent: 'Direct health indicators, specific conditions, relationship with health professionals'
  },
  7: {
    healthSignificance: 'Kidneys, lower back, partnerships affecting health, balance',
    bodyParts: ['Kidneys', 'Lower back', 'Ovaries'],
    rulerPlacement: 'Health through relationships, partner influence on wellness',
    planetsPresent: 'Partner influence on health habits, relationship stress effects'
  },
  8: {
    healthSignificance: 'Reproductive organs, elimination, transformation, regeneration, surgery',
    bodyParts: ['Reproductive organs', 'Elimination system', 'Regeneration'],
    rulerPlacement: 'Deep healing and transformation capacity, shared health resources',
    planetsPresent: 'Regenerative abilities, sexual health, surgery outcomes'
  },
  9: {
    healthSignificance: 'Hips, thighs, liver, health philosophy, alternative medicine',
    bodyParts: ['Hips', 'Thighs', 'Liver'],
    rulerPlacement: 'Belief systems about health, foreign/alternative healing approaches',
    planetsPresent: 'Approach to healing modalities, travel effects on health'
  },
  10: {
    healthSignificance: 'Knees, bones, skin, public health reputation, career stress',
    bodyParts: ['Knees', 'Bones', 'Skin'],
    rulerPlacement: 'Health responsibilities and achievements, public health image',
    planetsPresent: 'Career impact on health, public health role'
  },
  11: {
    healthSignificance: 'Ankles, calves, circulation, group health activities, health goals',
    bodyParts: ['Ankles', 'Calves', 'Circulatory system'],
    rulerPlacement: 'Social support for health, community wellness involvement',
    planetsPresent: 'Community wellness, future health vision, group healing'
  },
  12: {
    healthSignificance: 'Feet, immune system, lymphatic system, hidden health issues, spiritual healing',
    bodyParts: ['Feet', 'Immune system', 'Lymphatic system'],
    rulerPlacement: 'Unconscious health patterns, hidden vulnerabilities',
    planetsPresent: 'Karmic health, service through healing, spiritual wellness practices'
  }
};

// Challenging Aspects
export const CHALLENGING_HEALTH_ASPECTS: Record<string, string> = {
  'Sun-Saturn': 'Vitality challenges requiring structure; may experience low energy periods needing disciplined health routines',
  'Moon-Mars': 'Digestive inflammation patterns; emotional eating with anger triggers; need for cooling foods',
  'Mercury-Neptune': 'Nervous system sensitivity; mental clarity issues; need for grounding practices',
  'Venus-Jupiter': 'Overindulgence tendencies; liver and kidney stress from excess; portion control important',
  'Mars-Saturn': 'Blocked energy patterns; chronic inflammation; bone and muscle tension',
  'Jupiter-Neptune': 'Sensitivity to substances; liver stress; tendency toward escapism affecting health',
  'Sun-Uranus': 'Heart rhythm awareness needed; erratic energy patterns; needs freedom in health routine',
  'Moon-Saturn': 'Digestive restriction; emotional eating from depression; need for nurturing',
  'Venus-Pluto': 'Intense relationship with pleasure and food; transformation through diet possible'
};

// Supportive Aspects
export const SUPPORTIVE_HEALTH_ASPECTS: Record<string, string> = {
  'Sun-Jupiter': 'Strong natural vitality; good recuperation; optimistic health outlook aids healing',
  'Moon-Venus': 'Good digestion; pleasure in healthy foods; hormonal balance supported',
  'Mercury-Uranus': 'Innovative health approaches; resilient nervous system; quick mental recovery',
  'Venus-Neptune': 'Spiritual approach to healing; natural sensitivity to remedies; artistic healing',
  'Mars-Jupiter': 'Good energy reserves; strong immune system; natural athletic ability',
  'Sun-Moon': 'Harmony between vitality and emotional health; integrated wellness approach',
  'Venus-Saturn': 'Discipline in health habits; long-term beauty; structured self-care',
  'Mars-Pluto': 'Strong regenerative power; excellent healing capacity; transformative exercise'
};

// Lunar Cycle Health
export const LUNAR_CYCLE_HEALTH: Record<string, string> = {
  'New Moon': 'Start new health routines, set wellness intentions, begin detox programs',
  'Waxing Crescent': 'Build momentum for new habits, take supplements, nourish the body',
  'First Quarter': 'Push through resistance, increase exercise intensity, address challenges',
  'Waxing Gibbous': 'Refine health practices, adjust routines, prepare for peak energy',
  'Full Moon': 'Peak energy available, surgeries heal well (if planned properly), emotions high—practice self-care',
  'Waning Gibbous': 'Begin to release what doesn\'t serve, reduce intensity, reflect on practices',
  'Last Quarter': 'Release toxins, eliminate old habits, deep cleansing appropriate',
  'Waning Crescent': 'Rest and recover, minimal new starts, prepare for new cycle'
};

// Element-Based Healing Modalities
export const ELEMENT_HEALING_MODALITIES: Record<string, string[]> = {
  Fire: ['Movement therapies', 'Martial arts', 'Dance therapy', 'Heat therapies (sauna)', 'Cardiovascular exercise', 'Hot yoga'],
  Earth: ['Massage', 'Bodywork', 'Gardening therapy', 'Grounding practices', 'Strength training', 'Herbal medicine'],
  Air: ['Breathwork', 'Meditation', 'Talk therapy', 'Aromatherapy', 'Yoga', 'Journaling', 'Sound therapy'],
  Water: ['Swimming', 'Hydrotherapy', 'Energy healing', 'Emotional release work', 'Intuitive practices', 'Floatation therapy']
};

// Get dominant element from chart
export const getDominantElement = (planets: Record<string, { sign: string }>): string => {
  const fireSignes = ['Aries', 'Leo', 'Sagittarius'];
  const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
  const airSigns = ['Gemini', 'Libra', 'Aquarius'];
  const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];

  const counts = { Fire: 0, Earth: 0, Air: 0, Water: 0 };

  Object.values(planets).forEach(planet => {
    if (!planet.sign) return;
    if (fireSignes.includes(planet.sign)) counts.Fire++;
    else if (earthSigns.includes(planet.sign)) counts.Earth++;
    else if (airSigns.includes(planet.sign)) counts.Air++;
    else if (waterSigns.includes(planet.sign)) counts.Water++;
  });

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
};

// Get element for a sign
export const getElementForSign = (sign: string): string => {
  const fireSignes = ['Aries', 'Leo', 'Sagittarius'];
  const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
  const airSigns = ['Gemini', 'Libra', 'Aquarius'];
  
  if (fireSignes.includes(sign)) return 'Fire';
  if (earthSigns.includes(sign)) return 'Earth';
  if (airSigns.includes(sign)) return 'Air';
  return 'Water';
};

// Planetary Hours for Health (from planetaryHours.ts, extended)
export const PLANETARY_HEALTH_TIMING: Record<string, string[]> = {
  Sun: ['Vitality treatments', 'Heart health', 'Meeting with specialists', 'Energy boosting activities'],
  Moon: ['Digestive healing', 'Emotional wellness', 'Water therapies', 'Hormonal treatments'],
  Mercury: ['Nervous system treatments', 'Health consultations', 'Breathwork', 'Mental health practices'],
  Venus: ['Beauty treatments', 'Kidney/bladder care', 'Pleasure-based healing', 'Skin treatments'],
  Mars: ['Physical exercise', 'Surgery', 'Muscular therapy', 'Starting new exercise programs'],
  Jupiter: ['Liver treatments', 'Holistic healing sessions', 'Health education', 'Expansion practices'],
  Saturn: ['Bone/joint treatments', 'Chronic condition management', 'Dental work', 'Structural healing']
};

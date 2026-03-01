// House Encyclopedia — comprehensive data for all 12 houses

export interface SourcedInsight {
  text: string;
  source: string; // e.g. "Moses Siregar III, Secrets of the 12 Houses"
}

export interface HouseData {
  number: number;
  name: string;
  nickname: string;
  naturalSign: string;
  naturalRuler: string;
  rulerSymbol: string;
  keywords: string[];
  lifeExplanation: string;
  angularity: 'Angular' | 'Succedent' | 'Cadent';
  angularityMeaning: string;
  quadrant: number;
  quadrantName: string;
  quadrantMantra: string;
  hemisphere: { vertical: 'Northern' | 'Southern'; horizontal: 'Eastern' | 'Western' };
  houseType: 'Initiation' | 'Consolidation';
  houseTypeDescription: string;
  bodyPart: string;
  core: string;
  emptyHouse: string;
  rulerGuidance: string;
  teaching: string;
  // Sourced perspectives from published authors
  perspectives?: {
    esoteric?: SourcedInsight;      // Soul-level / spiritual dimension
    relational?: SourcedInsight;    // Intimate / relationship dimension
    shadow?: SourcedInsight;        // Danger / pitfall dimension
    soulQuestion?: SourcedInsight;  // The deep question this house asks
  };
}

// Quadrant and Hemisphere descriptions
export const QUADRANT_INFO = [
  {
    number: 1,
    name: 'Self Development',
    mantra: 'I AM BECOMING',
    houses: [1, 2, 3],
    description: 'The first quadrant (Houses 1-3) is about the development of the individual self. This is where you discover who you are, what you value, and how you think. Planets here focus your energy inward — on identity, resources, and immediate environment. People with many planets in Q1 are self-starters who develop through personal initiative.',
    hemisphere: 'Below the horizon (private) & Eastern (self-directed)',
  },
  {
    number: 2,
    name: 'Creative Expression',
    mantra: 'I AM EXPRESSING',
    houses: [4, 5, 6],
    description: 'The second quadrant (Houses 4-6) is about creative self-expression rooted in emotional foundations. From family (4th) through creative play (5th) to service (6th), you are expressing what you discovered in Q1 into form. Many planets here indicate someone who builds from emotional roots — deeply personal, creative, and service-oriented.',
    hemisphere: 'Below the horizon (private) & Western (other-oriented)',
  },
  {
    number: 3,
    name: 'Relationships',
    mantra: 'I AM RELATING',
    houses: [7, 8, 9],
    description: 'The third quadrant (Houses 7-9) is about encountering the "other." Partnership (7th), shared resources and transformation (8th), and expanding through philosophy and travel (9th). You grow by engaging with other people and their worldviews. Many planets here indicate someone who develops through relationships and external experience.',
    hemisphere: 'Above the horizon (public) & Western (other-oriented)',
  },
  {
    number: 4,
    name: 'Social Achievement',
    mantra: 'I AM ACHIEVING',
    houses: [10, 11, 12],
    description: 'The fourth quadrant (Houses 10-12) is about your contribution to the world. Career and reputation (10th), community and vision (11th), and spiritual transcendence (12th). Many planets here indicate someone whose life purpose is public, collective, and ultimately transcendent — building a legacy beyond the personal.',
    hemisphere: 'Above the horizon (public) & Eastern (self-directed)',
  },
];

export const HEMISPHERE_INFO = {
  northern: {
    name: 'Northern Hemisphere (Below Horizon)',
    houses: [1, 2, 3, 4, 5, 6],
    meaning: 'Private, subjective, self-focused. You process life internally before sharing it. Your development is personal — you build from the inside out. Many planets below the horizon indicate an introspective nature, even if your Sun sign seems outgoing.',
  },
  southern: {
    name: 'Southern Hemisphere (Above Horizon)',
    houses: [7, 8, 9, 10, 11, 12],
    meaning: 'Public, objective, outer-focused. You develop through engagement with the world, other people, and society. Many planets above the horizon indicate someone whose life plays out on a public stage — your growth comes through external experience.',
  },
  eastern: {
    name: 'Eastern Hemisphere (Left Side)',
    houses: [10, 11, 12, 1, 2, 3],
    meaning: 'Self-directed, initiating, autonomous. You make things happen through personal will. Many planets on the eastern side indicate someone who creates their own opportunities rather than waiting for them.',
  },
  western: {
    name: 'Western Hemisphere (Right Side)',
    houses: [4, 5, 6, 7, 8, 9],
    meaning: 'Other-directed, responsive, relational. You develop through responding to others and adapting to circumstances. Many planets on the western side indicate someone who grows through partnerships and external input.',
  },
};

export const ANGLE_INFO = [
  {
    abbreviation: 'AC',
    name: 'Ascendant (Rising Sign)',
    house: 1,
    meaning: 'The mask you wear, your first impression, your physical body, and how you instinctively approach new situations. The AC is the most personal angle — it is YOUR interface with the world. The sign on the AC colors everything in your chart.',
  },
  {
    abbreviation: 'IC',
    name: 'Imum Coeli (Bottom of the Sky)',
    house: 4,
    meaning: 'Your roots, private self, emotional foundation, and family of origin. The IC is the most hidden angle — it shows who you are when nobody is watching. It connects to your ancestry, your childhood, and where you retreat for emotional safety.',
  },
  {
    abbreviation: 'DC',
    name: 'Descendant',
    house: 7,
    meaning: 'What you seek in partners, your shadow self projected onto others, and how you relate one-on-one. The DC is the opposite of the AC — it is what you attract and what you need from others to feel complete.',
  },
  {
    abbreviation: 'MC',
    name: 'Medium Coeli (Midheaven)',
    house: 10,
    meaning: 'Your public reputation, career direction, legacy, and how the world sees you at your most accomplished. The MC is the most visible angle — it is your highest potential in worldly terms. The sign here describes the energy of your career and public life.',
  },
];

export const INTERCEPTED_HOUSES_INFO = {
  title: 'Intercepted Houses & Signs',
  description: 'An interception occurs when a sign is completely contained within a house, with no house cusp in that sign. The energy of the intercepted sign is "locked" — it develops slowly, operates beneath the surface, and may not be accessible until later in life.',
  keyPoints: [
    'Interceptions always occur in pairs — if one sign is intercepted, its opposite sign is too.',
    'Planets in intercepted signs may feel blocked or delayed in expression.',
    'The house rulers of the intercepted houses become critically important — they are the "key" to unlocking the intercepted energy.',
    'Interceptions are more common at higher latitudes and may not appear in every chart.',
    'Working with intercepted energy often requires conscious effort — it does not come naturally.',
    'Look to the ruling planet of the intercepted sign and its house placement for clues on how to access this energy.',
  ],
};

export const EMPTY_HOUSES_INFO = {
  title: 'Empty Houses',
  description: 'An empty house has no planets in it. This does NOT mean that area of life is unimportant or missing. It simply means there is no extra emphasis or complexity there. The house still functions — it just runs on autopilot through its ruling planet.',
  keyPoints: [
    'Find the ruler of the empty house (the planet that rules the sign on the cusp).',
    'Look at where that ruling planet is placed by sign and house — this is where the empty house\'s energy is being directed.',
    'If the ruling planet is well-aspected, the empty house functions smoothly without drama.',
    'If the ruling planet is challenged, the empty house area may have hidden difficulties you don\'t notice until transits activate it.',
    'Empty houses are activated by transits — when a planet transits through an empty house, that life area temporarily becomes a focus.',
    'Most people have 4-6 empty houses. This is completely normal.',
  ],
};

export const HOUSES_DATA: HouseData[] = [
  {
    number: 1, name: 'House of Self', nickname: 'The House of Initiation',
    naturalSign: 'Aries', naturalRuler: 'Mars', rulerSymbol: '♂',
    keywords: ['Identity', 'Body', 'First impressions', 'Vitality', 'Self-image', 'Physical appearance', 'Persona'],
    lifeExplanation: 'Rules your physical body, your automatic first impression, and how you instinctively approach every new situation. This is your default setting — the energy people feel when you walk into a room before you even speak.',
    angularity: 'Angular', angularityMeaning: 'Angular houses (1, 4, 7, 10) are the most powerful and visible. Planets here ACT — they demand expression and are immediately noticeable to others.',
    quadrant: 1, quadrantName: 'Self Development', quadrantMantra: 'I AM BECOMING',
    hemisphere: { vertical: 'Northern', horizontal: 'Eastern' },
    houseType: 'Initiation', houseTypeDescription: 'Odd-numbered houses (1, 3, 5, 7, 9, 11) are houses of INITIATION — they start things, push outward, and generate new energy.',
    bodyPart: 'Head, face, brain',
    core: 'The 1st house is YOU — your physical body, your automatic approach to life, and how others experience you before you say a word. This is not your soul (Sun) or your emotions (Moon) — it is your vehicle, your interface, your first impression.',
    emptyHouse: 'An empty 1st house is common and simply means your identity expression runs through the sign on the cusp (your Rising sign) and its ruling planet. No extra complexity — you present clearly as your Rising sign.',
    rulerGuidance: 'The ruler of your 1st house (your chart ruler) is the single most important planet in your chart. Its sign, house, and aspects describe how you navigate ALL of life. Find it and study it deeply.',
    teaching: 'The 1st house is the house of becoming. You are not born finished — you are born with a vehicle (this house) and a direction (its ruler). Your entire life is the process of growing into this house\'s full potential.',
    perspectives: {
      esoteric: { text: 'The soul chooses the body and persona it needs for this incarnation. The 1st house is the vehicle the soul selected — not random, but intentional. Your physical form and instinctive approach are spiritual tools.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      relational: { text: 'In relationships, the 1st house represents how you assert your individuality. Partners must learn to respect this energy, and you must learn not to bulldoze others with it. Healthy relationships require you to show up as yourself without dominating.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      shadow: { text: 'The danger of the 1st house is narcissism — becoming so identified with your persona that you lose access to your deeper self. The mask becomes the face. Alternatively, rejecting your body or appearance entirely, living only in your head.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      soulQuestion: { text: 'Who am I when I stop performing? What is the authentic self beneath the persona?', source: 'Moses Siregar III, Secrets of the 12 Houses' },
    },
  },
  {
    number: 2, name: 'House of Resources', nickname: 'The House of Consolidation',
    naturalSign: 'Taurus', naturalRuler: 'Venus', rulerSymbol: '♀',
    keywords: ['Money', 'Values', 'Self-worth', 'Possessions', 'Talents', 'Earning power', 'Material security'],
    lifeExplanation: 'Rules your money, possessions, personal talents, and deep sense of self-worth. This reveals how you earn, what you spend on, and what makes you feel materially and emotionally secure.',
    angularity: 'Succedent', angularityMeaning: 'Succedent houses (2, 5, 8, 11) stabilize and consolidate what the angular houses initiated. They provide resources, sustenance, and depth.',
    quadrant: 1, quadrantName: 'Self Development', quadrantMantra: 'I AM BECOMING',
    hemisphere: { vertical: 'Northern', horizontal: 'Eastern' },
    houseType: 'Consolidation', houseTypeDescription: 'Even-numbered houses (2, 4, 6, 8, 10, 12) are houses of CONSOLIDATION — they absorb, stabilize, and process what the odd houses started.',
    bodyPart: 'Throat, neck, thyroid',
    core: 'The 2nd house is what you HAVE — money, possessions, talents, and most importantly, your sense of self-worth. This house answers: "What am I worth? What do I value? How do I sustain myself?"',
    emptyHouse: 'An empty 2nd house means money and values are not a major life theme requiring extra attention. Look to the ruler of the sign on the cusp to see how and where your financial energy flows.',
    rulerGuidance: 'The ruler of your 2nd house shows HOW you make money and what you naturally value. Its house placement shows WHERE your earning power is directed.',
    teaching: 'True security comes from knowing your worth independent of your bank account. The 2nd house teaches that what you value determines what you attract.',
    perspectives: {
      esoteric: { text: 'The 2nd house is the soul\'s relationship with the material plane. Spiritual traditions warn against attachment to possessions, but the esoteric truth is that the material world is sacred — how you earn and spend reflects your spiritual values in action.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      relational: { text: 'In intimate relationships, 2nd house issues manifest as codependency around money and worth. One partner may control finances while the other loses their sense of personal value. Healthy relating requires each person to maintain their own sense of worth.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      shadow: { text: 'Addiction is the shadow of the 2nd house — seeking material comfort to fill a spiritual void. Compulsive spending, hoarding, or using substances to feel "full" when the inner well is empty.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      soulQuestion: { text: 'What am I truly worth, beyond what I own or earn? What do I value enough to sacrifice for?', source: 'Moses Siregar III, Secrets of the 12 Houses' },
    },
  },
  {
    number: 3, name: 'House of Communication', nickname: 'The House of Initiation',
    naturalSign: 'Gemini', naturalRuler: 'Mercury', rulerSymbol: '☿',
    keywords: ['Communication', 'Siblings', 'Learning', 'Local travel', 'Mind', 'Neighbors', 'Early education', 'Writing'],
    lifeExplanation: 'Rules early school life, siblings, neighbors, short trips, and your everyday thinking style. This reveals your attitude toward learning and being around peers — how you process information and communicate daily.',
    angularity: 'Cadent', angularityMeaning: 'Cadent houses (3, 6, 9, 12) are houses of transition and adaptation. Planets here process, learn, and prepare for the next angular house. They are mental and flexible.',
    quadrant: 1, quadrantName: 'Self Development', quadrantMantra: 'I AM BECOMING',
    hemisphere: { vertical: 'Northern', horizontal: 'Eastern' },
    houseType: 'Initiation', houseTypeDescription: 'Odd-numbered houses are houses of INITIATION — active, outward-pushing energy.',
    bodyPart: 'Lungs, arms, hands, nervous system',
    core: 'The 3rd house is how you THINK and communicate — your daily mental activity, learning style, relationship with siblings, and local environment. This is not deep philosophy (9th house) but everyday cognition.',
    emptyHouse: 'An empty 3rd house means communication and learning happen naturally through the sign on the cusp. No drama or complexity around siblings or mental processes — they just work.',
    rulerGuidance: 'The ruler of your 3rd house shows the style and direction of your mind. Its house shows what area of life your thinking is most focused on.',
    teaching: 'The 3rd house teaches that how you think shapes how you experience reality. Your words create your world.',
    perspectives: {
      esoteric: { text: 'The 3rd house represents the mind as a spiritual instrument. The quality of your thoughts creates your reality. Esoteric traditions emphasize that naming something gives you power over it — the 3rd house is where you learn to use the Word consciously.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      relational: { text: 'Communication breakdowns in relationships almost always trace to 3rd house dynamics. How you speak to your partner daily — the tone, the assumptions, the willingness to listen — determines the quality of your bond more than any grand gesture.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      shadow: { text: 'The shadow of the 3rd house is using words as weapons — gossip, manipulation, intellectualizing emotions to avoid feeling them, or going silent as punishment. The mind can become a prison when it refuses to connect to the heart.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      soulQuestion: { text: 'Am I using my mind to connect or to separate? Do my words build bridges or walls?', source: 'Moses Siregar III, Secrets of the 12 Houses' },
    },
  },
  {
    number: 4, name: 'House of Home & Roots', nickname: 'The House of Consolidation',
    naturalSign: 'Cancer', naturalRuler: 'Moon', rulerSymbol: '☽',
    keywords: ['Home', 'Family', 'Roots', 'Mother', 'Emotional foundation', 'Ancestry', 'Private life', 'Real estate'],
    lifeExplanation: 'Rules your home environment, family of origin, one parent (traditionally the mother), ancestry, and your most private emotional self. This is where you retreat to recharge and the foundation everything in your life is built upon.',
    angularity: 'Angular', angularityMeaning: 'Angular — powerful and foundational. The IC (4th house cusp) is one of the four angles.',
    quadrant: 2, quadrantName: 'Creative Expression', quadrantMantra: 'I AM EXPRESSING',
    hemisphere: { vertical: 'Northern', horizontal: 'Western' },
    houseType: 'Consolidation', houseTypeDescription: 'Even-numbered — absorbs, processes, and stabilizes.',
    bodyPart: 'Stomach, breasts, womb',
    core: 'The 4th house is your FOUNDATION — home, family, ancestry, and your most private self. The IC (cusp of the 4th) is the bottom of the chart and the bottom of your being. This is where you come from and what you retreat to.',
    emptyHouse: 'An empty 4th house means home and family are not a major source of complexity. Your emotional foundation functions through the cusp sign and its ruler without extra drama.',
    rulerGuidance: 'The ruler of the 4th house shows what drives your need for security and where your family patterns play out.',
    teaching: 'You cannot build a life on an unstable foundation. The 4th house teaches that healing your roots heals everything above them.',
    perspectives: {
      esoteric: { text: 'The 4th house is the soul\'s anchor point in this lifetime — the karmic family you chose and the ancestral lineage you carry. Your roots are not accidental; they are the soil your soul planted itself in for specific lessons.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      relational: { text: 'How you were parented becomes how you parent — or how you rebel against parenting. The 4th house in synastry shows whether two people can truly make a home together, not just date. It reveals the deepest emotional compatibility or incompatibility.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      shadow: { text: 'The shadow of the 4th house is emotional regression — retreating into childhood patterns when stressed, expecting partners to parent you, or refusing to grow up. Nostalgia that prevents presence. Building walls instead of homes.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      soulQuestion: { text: 'Where do I truly belong? Can I create safety within myself rather than depending on external structures?', source: 'Moses Siregar III, Secrets of the 12 Houses' },
    },
  },
  {
    number: 5, name: 'House of Creativity', nickname: 'The House of Initiation',
    naturalSign: 'Leo', naturalRuler: 'Sun', rulerSymbol: '☉',
    keywords: ['Creativity', 'Romance', 'Children', 'Joy', 'Play', 'Performance', 'Hobbies', 'Self-expression'],
    lifeExplanation: 'Rules creative self-expression, romantic love affairs (not marriage), children, hobbies, gambling, and anything done purely for the joy of it. This reveals what lights you up and how you play.',
    angularity: 'Succedent', angularityMeaning: 'Succedent — stabilizes and deepens the creative/emotional foundation built in Q2.',
    quadrant: 2, quadrantName: 'Creative Expression', quadrantMantra: 'I AM EXPRESSING',
    hemisphere: { vertical: 'Northern', horizontal: 'Western' },
    houseType: 'Initiation', houseTypeDescription: 'Odd-numbered — active, outward-pushing creative energy.',
    bodyPart: 'Heart, upper back, spine',
    core: 'The 5th house is CREATIVE JOY — what you create, how you play, romantic love (not commitment), and your relationship with children. Planets here need to be SEEN and appreciated. This is where life should be fun.',
    emptyHouse: 'An empty 5th house does NOT mean no creativity or romance. It means these areas flow naturally through the cusp sign. Creativity is accessible without internal conflict.',
    rulerGuidance: 'The ruler of the 5th shows how and where your creative energy naturally flows. Its aspects show what supports or blocks your joy.',
    teaching: 'The 5th house teaches that play is not frivolous — it is essential. Joy is a spiritual practice.',
    perspectives: {
      esoteric: { text: 'The 5th house is where the soul creates — not just art, but reality itself. Creative expression is a divine act: bringing something from nothing into form. Children are the ultimate 5th house creation, but so is any authentic self-expression that didn\'t exist before you made it.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      relational: { text: 'Romantic love lives in the 5th house — the intoxication, the drama, the falling. But this is love as performance, not partnership (7th house). In long-term relationships, maintaining 5th house energy means keeping courtship alive — date nights, surprises, seeing your partner as fascinating rather than familiar.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      shadow: { text: 'The shadow of the 5th house is ego inflation through creation — believing your art, your children, or your romantic conquests make you special. Using creativity to avoid responsibility. Gambling addiction. Drama addiction. Living as if life is a stage and you must always be performing.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      soulQuestion: { text: 'What do I create that is uniquely mine? Can I express myself without needing applause?', source: 'Moses Siregar III, Secrets of the 12 Houses' },
    },
  },
  {
    number: 6, name: 'House of Service & Health', nickname: 'The House of Consolidation',
    naturalSign: 'Virgo', naturalRuler: 'Mercury', rulerSymbol: '☿',
    keywords: ['Health', 'Work', 'Routines', 'Service', 'Habits', 'Pets', 'Daily rituals', 'Coworkers'],
    lifeExplanation: 'Rules your daily work (not career — that\'s the 10th), health and body maintenance, routines, habits, pets, and acts of service. This reveals your relationship with discipline, self-care, and being useful to others.',
    angularity: 'Cadent', angularityMeaning: 'Cadent — transitional, adaptive, preparing for the relationship quadrant.',
    quadrant: 2, quadrantName: 'Creative Expression', quadrantMantra: 'I AM EXPRESSING',
    hemisphere: { vertical: 'Northern', horizontal: 'Western' },
    houseType: 'Consolidation', houseTypeDescription: 'Even-numbered — absorbs and processes.',
    bodyPart: 'Intestines, digestive system',
    core: 'The 6th house is DAILY LIFE — your work (not career), health, routines, and how you serve others. This is the house of maintenance, improvement, and function. Planets here want things to WORK properly.',
    emptyHouse: 'An empty 6th house means health and daily work run smoothly without major drama. Routines are natural. Look to the ruler for subtle health tendencies.',
    rulerGuidance: 'The ruler of the 6th house shows your natural approach to health and daily work. Its condition indicates whether maintenance comes easily or requires effort.',
    teaching: 'The 6th house teaches that sacred service is not sacrifice — it is finding meaning in the mundane.',
    perspectives: {
      esoteric: { text: 'The 6th house is the house of purification — the soul refining itself through discipline, service, and health. Illness in the esoteric view is not punishment but information: the body communicating what the mind won\'t acknowledge. The 6th house is where spirit meets matter in daily practice.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      relational: { text: 'The 6th house in relationships is about practical love — who does the dishes, who manages the calendar, who takes care of the other when sick. Unglamorous but essential. Many relationships fail not from lack of passion but from 6th house resentment over unequal daily labor.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      shadow: { text: 'The shadow of the 6th house is martyrdom through service — giving until you\'re empty, then resenting everyone for not noticing. Perfectionism that paralyzes. Hypochondria as a cry for attention. Using busyness to avoid inner stillness.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      soulQuestion: { text: 'Am I serving from fullness or from emptiness? Do my routines nourish me or numb me?', source: 'Moses Siregar III, Secrets of the 12 Houses' },
    },
  },
  {
    number: 7, name: 'House of Partnership', nickname: 'The House of Initiation',
    naturalSign: 'Libra', naturalRuler: 'Venus', rulerSymbol: '♀',
    keywords: ['Marriage', 'Partnership', 'Open enemies', 'Contracts', 'One-on-one relationships', 'Business partners', 'Shadow projection'],
    lifeExplanation: 'Rules committed partnerships (marriage, business partners), contracts, legal agreements, and open adversaries. This is also your shadow — the qualities you don\'t own in yourself that you attract or project onto your partner.',
    angularity: 'Angular', angularityMeaning: 'Angular — one of the four most powerful houses. The DC (7th house cusp) is a major angle.',
    quadrant: 3, quadrantName: 'Relationships', quadrantMantra: 'I AM RELATING',
    hemisphere: { vertical: 'Southern', horizontal: 'Western' },
    houseType: 'Initiation', houseTypeDescription: 'Odd-numbered — initiates the encounter with the "other."',
    bodyPart: 'Kidneys, lower back, adrenal glands',
    core: 'The 7th house is the OTHER — committed partnerships, marriage, business partners, and anyone you engage with one-on-one. It is also your shadow — what you project onto others because you don\'t own it in yourself. The DC is opposite the AC: what you attract is what you suppress.',
    emptyHouse: 'An empty 7th house does NOT mean no marriage or partnership. It means relationships function through the cusp sign without extra complexity. Partnership is straightforward.',
    rulerGuidance: 'The ruler of the 7th describes the TYPE of partner you attract and how partnerships unfold. Its house shows where partnership energy is directed.',
    teaching: 'The 7th house teaches that your partner is your mirror. What you love and hate in them is what you haven\'t integrated in yourself.',
    perspectives: {
      esoteric: { text: 'The 7th house is the soul\'s mirror — you incarnated to meet yourself through the other. Every significant partnership is a soul agreement. The DC (Descendant) reveals the qualities your soul specifically chose to encounter through others, not because you lack them, but because you need to see them reflected.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      relational: { text: 'The 7th house reveals your relationship blind spots. What you project onto partners — the idealization and the demonization — is your own unlived life. True partnership begins when projection ends and you start seeing the actual person, not your fantasy or fear.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      shadow: { text: 'The shadow of the 7th house is losing yourself in the other — becoming whatever your partner needs, abandoning your own identity for the relationship. Or the opposite: controlling partners to manage your own anxiety. "Open enemies" as a keyword reminds us that those we oppose most fiercely mirror us most clearly.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      soulQuestion: { text: 'Am I seeking a partner or seeking myself through a partner? Can I love without losing who I am?', source: 'Moses Siregar III, Secrets of the 12 Houses' },
    },
  },
  {
    number: 8, name: 'House of Transformation', nickname: 'The House of Consolidation',
    naturalSign: 'Scorpio', naturalRuler: 'Pluto', rulerSymbol: '♇',
    keywords: ['Death', 'Rebirth', 'Shared resources', 'Intimacy', 'Taxes', 'Psychology', 'Occult', 'Inheritance'],
    lifeExplanation: 'Rules shared finances (joint accounts, inheritance, taxes, debt), sexual intimacy, psychological transformation, death and rebirth cycles, and the occult. This reveals how you handle power, merge with others, and transform through crisis.',
    angularity: 'Succedent', angularityMeaning: 'Succedent — deepens and intensifies the relationship experience.',
    quadrant: 3, quadrantName: 'Relationships', quadrantMantra: 'I AM RELATING',
    hemisphere: { vertical: 'Southern', horizontal: 'Western' },
    houseType: 'Consolidation', houseTypeDescription: 'Even-numbered — absorbs, transforms, and processes at the deepest level.',
    bodyPart: 'Reproductive organs, elimination',
    core: 'The 8th house is where you MERGE with another — sexually, financially, psychologically. It rules shared resources, inheritance, debt, taxes, death, and transformation. This is the house of crisis that leads to rebirth. Nothing is surface-level here.',
    emptyHouse: 'An empty 8th house means transformation and shared resources are not a constant focus. Deep psychological crises are not your primary mode of growth. Look to the ruler for how these themes play out when activated.',
    rulerGuidance: 'The ruler of the 8th shows how you handle intimacy, shared power, and transformation. Its condition reveals your relationship with control and surrender.',
    teaching: 'The 8th house teaches that death is not the end — it is the doorway. What you fear losing is what you must transform.',
    perspectives: {
      esoteric: { text: 'The 8th house is the alchemical crucible — where the lead of ego is transformed into spiritual gold. Every crisis, every loss, every "death" in your life is an initiation. The soul specifically seeks 8th house experiences to burn away what is false and reveal what is eternal.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      relational: { text: 'The 8th house is where true intimacy lives — not the romance of the 5th but the raw vulnerability of merging with another person psychologically, sexually, and financially. This house reveals your capacity for trust, your relationship with power, and whether you can surrender control without losing yourself.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      shadow: { text: 'The shadow of the 8th house is manipulation — using intimacy, money, sex, or psychological insight as tools of control. Obsession. Power struggles. Refusing to let go of what has died. Or the opposite: self-destructive behavior as an attempt to force transformation before you\'re ready.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      soulQuestion: { text: 'What must I allow to die so something new can be born? Can I trust another person with my vulnerability?', source: 'Moses Siregar III, Secrets of the 12 Houses' },
    },
  },
  {
    number: 9, name: 'House of Philosophy', nickname: 'The House of Initiation',
    naturalSign: 'Sagittarius', naturalRuler: 'Jupiter', rulerSymbol: '♃',
    keywords: ['Travel', 'Higher education', 'Philosophy', 'Religion', 'Law', 'Publishing', 'Foreign cultures', 'Mentors'],
    lifeExplanation: 'Rules long-distance and foreign travel, university-level education, religion, philosophy, law, publishing, and mentors/gurus. This reveals your worldview, what you believe in, and how you search for meaning beyond your immediate environment.',
    angularity: 'Cadent', angularityMeaning: 'Cadent — transitional, mental, preparing for the achievement quadrant.',
    quadrant: 3, quadrantName: 'Relationships', quadrantMantra: 'I AM RELATING',
    hemisphere: { vertical: 'Southern', horizontal: 'Western' },
    houseType: 'Initiation', houseTypeDescription: 'Odd-numbered — pushes outward toward meaning and expansion.',
    bodyPart: 'Hips, thighs, liver',
    core: 'The 9th house is where you EXPAND — through travel, higher education, philosophy, religion, and the search for meaning. This is not everyday learning (3rd house) but the Big Questions: Why am I here? What do I believe? What is true?',
    emptyHouse: 'An empty 9th house means philosophy and higher education are not a major focus of complexity. You may still travel and learn, but it happens naturally through the cusp sign.',
    rulerGuidance: 'The ruler of the 9th shows how you seek meaning and where your philosophical nature expresses itself.',
    teaching: 'The 9th house teaches that truth is not fixed — it is a journey. The map is not the territory.',
    perspectives: {
      esoteric: { text: 'The 9th house is the soul\'s search for God — or for whatever lies beyond the individual self. Whether through religion, philosophy, travel, or higher education, the 9th house drives you toward the Big Picture. This is the house of the guru, the teacher, and the pilgrim.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      relational: { text: 'The 9th house in relationships shows whether partners can grow together — sharing a worldview, traveling together, learning together. When 9th house energies clash between partners, one feels intellectually or spiritually stifled. Shared meaning is the foundation of lasting connection.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      shadow: { text: 'The shadow of the 9th house is dogmatism — believing your truth is THE truth and everyone else is wrong. Spiritual bypassing. Using philosophy to judge others. Perpetual seeking that never lands — always the next teacher, the next trip, the next belief system, never committing to depth.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      soulQuestion: { text: 'What do I believe with my whole being, not just my intellect? Can I seek truth without becoming righteous?', source: 'Moses Siregar III, Secrets of the 12 Houses' },
    },
  },
  {
    number: 10, name: 'House of Career & Legacy', nickname: 'The House of Consolidation',
    naturalSign: 'Capricorn', naturalRuler: 'Saturn', rulerSymbol: '♄',
    keywords: ['Career', 'Reputation', 'Public image', 'Authority', 'Father', 'Achievement', 'Legacy', 'Social status'],
    lifeExplanation: 'Rules your career path, public reputation, social status, authority figures, one parent (traditionally the father), and the legacy you build over a lifetime. This is how the world sees you at your most accomplished.',
    angularity: 'Angular', angularityMeaning: 'Angular — the MOST visible house. The MC (Midheaven) is the highest point of the chart and your most public expression.',
    quadrant: 4, quadrantName: 'Social Achievement', quadrantMantra: 'I AM ACHIEVING',
    hemisphere: { vertical: 'Southern', horizontal: 'Eastern' },
    houseType: 'Consolidation', houseTypeDescription: 'Even-numbered — consolidates your public contribution.',
    bodyPart: 'Knees, bones, skeletal structure, skin',
    core: 'The 10th house is your LEGACY — career, public reputation, and how the world remembers you. The MC (Midheaven) at the cusp is the highest point of the chart — literally what you are seen for from a distance. Planets here are visible to the world.',
    emptyHouse: 'An empty 10th house does NOT mean no career. It means your career direction is straightforward — look to the MC sign and its ruling planet for your professional path.',
    rulerGuidance: 'The ruler of the 10th (the MC ruler) describes your career path, the type of authority you build, and how you achieve public recognition.',
    teaching: 'The 10th house teaches that legacy is built one day at a time. What you do consistently becomes what you\'re known for.',
    perspectives: {
      esoteric: { text: 'The 10th house is the soul\'s public purpose — your dharma, your contribution to the world that only you can make. The MC is the point of highest spiritual visibility. Esoterically, the 10th house is not about ambition but about answering the call of your vocation — literally, your "voice."', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      relational: { text: 'The 10th house in relationships shows how career and public life affect your partnership. When one partner\'s 10th house dominates, the other may feel eclipsed. The challenge is building a shared public life without one person becoming the other\'s audience. Both need their own 10th house expression.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      shadow: { text: 'The shadow of the 10th house is sacrificing everything for status — your health, your relationships, your joy, all burned on the altar of achievement. Or the opposite: fear of visibility, hiding your gifts because being seen feels dangerous. Authoritarian behavior. Defining your worth entirely by your title.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      soulQuestion: { text: 'What would I build if I weren\'t afraid of being seen? Is my ambition serving my soul or my ego?', source: 'Moses Siregar III, Secrets of the 12 Houses' },
    },
  },
  {
    number: 11, name: 'House of Community', nickname: 'The House of Initiation',
    naturalSign: 'Aquarius', naturalRuler: 'Uranus', rulerSymbol: '♅',
    keywords: ['Friends', 'Groups', 'Hopes', 'Wishes', 'Humanitarian goals', 'Networks', 'Innovation', 'Social causes'],
    lifeExplanation: 'Rules friendships, social networks, group affiliations, humanitarian goals, hopes and wishes for the future, and your vision for society. This reveals the type of community you\'re drawn to and the causes you champion.',
    angularity: 'Succedent', angularityMeaning: 'Succedent — stabilizes and sustains the achievement energy of Q4.',
    quadrant: 4, quadrantName: 'Social Achievement', quadrantMantra: 'I AM ACHIEVING',
    hemisphere: { vertical: 'Southern', horizontal: 'Eastern' },
    houseType: 'Initiation', houseTypeDescription: 'Odd-numbered — initiates connection to collective vision.',
    bodyPart: 'Ankles, circulatory system',
    core: 'The 11th house is your TRIBE — friends, groups, organizations, and your vision for the future. This is not one-on-one relationship (7th) but your place in the collective. Planets here show how you connect to community and what you hope for.',
    emptyHouse: 'An empty 11th house means friendships and group involvement happen naturally without drama. You are part of communities without it being a major life theme.',
    rulerGuidance: 'The ruler of the 11th shows how you find your tribe and what kind of groups you\'re drawn to.',
    teaching: 'The 11th house teaches that your individual gifts are meant for the collective. Your dreams are bigger than you.',
    perspectives: {
      esoteric: { text: 'The 11th house is the soul\'s vision for humanity — not just your personal hopes but your part in the collective dream. The friends and groups you attract are your spiritual family, chosen not by blood but by resonance. The 11th house asks: what future are you building?', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      relational: { text: 'The 11th house in relationships shows how a couple relates to the world beyond their partnership — shared friendships, causes they champion together, their social identity as a pair. Relationships that lack 11th house connection can become isolated and stagnant.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      shadow: { text: 'The shadow of the 11th house is conformity — losing your individuality to belong, or alternately, being so rebellious that you can never truly connect with any group. Utopian idealism that rejects imperfect reality. Friendships based on ideology rather than genuine human warmth.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      soulQuestion: { text: 'What is my vision for the world? Can I belong to a group without losing my individuality?', source: 'Moses Siregar III, Secrets of the 12 Houses' },
    },
  },
  {
    number: 12, name: 'House of the Unconscious', nickname: 'The House of Consolidation',
    naturalSign: 'Pisces', naturalRuler: 'Neptune', rulerSymbol: '♆',
    keywords: ['Unconscious', 'Spirituality', 'Hidden enemies', 'Isolation', 'Dreams', 'Karma', 'Transcendence', 'Self-undoing'],
    lifeExplanation: 'Rules the unconscious mind, dreams, spirituality, solitude, hidden enemies (including self-sabotage), hospitals, prisons, and past-life karma. This reveals what operates beneath the surface — your blind spots, spiritual gifts, and where you need to surrender control.',
    angularity: 'Cadent', angularityMeaning: 'Cadent — the final dissolving before rebirth at the 1st house. Transitional, spiritual, and hidden.',
    quadrant: 4, quadrantName: 'Social Achievement', quadrantMantra: 'I AM ACHIEVING',
    hemisphere: { vertical: 'Southern', horizontal: 'Eastern' },
    houseType: 'Consolidation', houseTypeDescription: 'Even-numbered — the final consolidation: dissolving ego into spirit.',
    bodyPart: 'Feet, lymphatic system, immune system',
    core: 'The 12th house is what lies BENEATH — the unconscious, dreams, spirituality, hidden enemies (including self-sabotage), isolation, and transcendence. Planets here operate invisibly, influencing you from behind the scenes. This is the house of everything you can\'t see but deeply feel.',
    emptyHouse: 'An empty 12th house means the unconscious realm is not a major source of visible struggle. Spiritual life and solitude function through the cusp sign. Hidden patterns still exist but are less intense.',
    rulerGuidance: 'The ruler of the 12th shows what pulls you toward solitude, spiritual practice, or unconscious patterns. Its house placement reveals where your hidden life plays out.',
    teaching: 'The 12th house teaches that ego dissolution is not death — it is liberation. What you surrender becomes your greatest strength.',
    perspectives: {
      esoteric: { text: 'The 12th house is the soul\'s return to source — the dissolution of individual identity back into the infinite. This is the most mystical house: dreams, meditation, past lives, and the thin veil between worlds. Planets here operate in dimensions beyond the rational mind. What is hidden in the 12th house is often your greatest spiritual gift, accessible only through surrender.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      relational: { text: 'The 12th house in relationships reveals the unconscious dynamics between partners — what is never spoken but always felt. Secret attractions, hidden resentments, spiritual bonds that transcend explanation. The most powerful connections often have strong 12th house overlays: they feel destined but inexplicable.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      shadow: { text: 'The shadow of the 12th house is escapism — using substances, fantasy, sleep, or spiritual practice to avoid reality. Self-undoing through unconscious patterns. Victim consciousness. Martyrdom. Isolation that masquerades as spirituality. The most dangerous shadow: not knowing your own shadow because it operates entirely beneath awareness.', source: 'Moses Siregar III, Secrets of the 12 Houses' },
      soulQuestion: { text: 'What am I hiding from — even from myself? Can I surrender control without losing my way?', source: 'Moses Siregar III, Secrets of the 12 Houses' },
    },
  },
];

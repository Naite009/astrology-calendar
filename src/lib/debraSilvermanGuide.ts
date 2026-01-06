// Debra Silverman Astrology - Beginner Guide Content
// Source: Beginner Astrology Booklet

// ============================================================================
// SIGN ARCHETYPES - Full descriptions with Life Lessons & Esoteric meanings
// ============================================================================

export interface SignArchetype {
  sign: string;
  dateRange: string;
  mantras: string[];
  archetypes: string[];
  element: string;
  modality: string;
  rulingPlanet: string;
  planetKeyword: string;
  bodyPart: string;
  traits: string[];
  lifeLessons: string[];
  esotericMeaning: string[];
  treeOfLifeGift: string;
  treeOfLifeMessage: string;
}

export const SIGN_ARCHETYPES: Record<string, SignArchetype> = {
  Aries: {
    sign: 'Aries',
    dateRange: 'March 21 - April 19',
    mantras: ['I AM'],
    archetypes: ['The Warrior', 'The Pioneer', 'The Daredevil'],
    element: 'Fire',
    modality: 'Cardinal',
    rulingPlanet: 'Mars',
    planetKeyword: 'Planet of Energy',
    bodyPart: 'Head',
    traits: ['Direct', 'Leader', 'Enthusiastic', 'Pushy', 'Domineering', 'Insensitive', 'Bossy', 'Straight-forward', 'Ambitious'],
    lifeLessons: [
      'Be OK with being independent',
      'Coordinate with the other',
      'Open the heart and forgive',
      'Know when to stop'
    ],
    esotericMeaning: [
      'To fight for love',
      'To stand up against all odds',
      'Determined to go beyond limits',
      'Passionate lover of that which is worthy'
    ],
    treeOfLifeGift: 'Self Esteem',
    treeOfLifeMessage: 'To you Aries, I give the seed first that you might have the honor of planting it. That for every seed you plant, one million more will multiply in your hand. You will not have time to see the seed grow, for everything you plant creates more that must be planted. You will be the first to penetrate the soil of men\'s minds with My Idea. But it is not your job to nourish the Idea nor to question it. Your life is action and the only action I ascribe to you is to begin making men aware of My Creation.'
  },
  Taurus: {
    sign: 'Taurus',
    dateRange: 'April 20 - May 20',
    mantras: ['I HAVE'],
    archetypes: ['The Earth Spirit', 'The Musician', 'The Silent One', 'The Buddha'],
    element: 'Earth',
    modality: 'Fixed',
    rulingPlanet: 'Venus',
    planetKeyword: 'Planet of Love',
    bodyPart: 'Neck / Throat',
    traits: ['Practical', 'Understanding', 'Sweet', 'Solid and Steady', 'Loyal', 'Stubborn', 'Steadfast', 'Slow', 'Turtle-like'],
    lifeLessons: [
      'To go slow',
      'Accept and share sensuality',
      'Value simplicity'
    ],
    esotericMeaning: [
      'Holding steady regardless of others',
      'Brings loyalty and consistency',
      'Non-attachment to results',
      'Connected to Mother Earth'
    ],
    treeOfLifeGift: 'Strength',
    treeOfLifeMessage: 'To you Taurus, I give the power to build the seed into substance. Your job is a great one requiring patience for you must finish all that has been started or the seeds will be wasted to the wind. You are not to question, nor change your mind in the middle, nor to depend on others for what I ask you to do.'
  },
  Gemini: {
    sign: 'Gemini',
    dateRange: 'May 21 - June 20',
    mantras: ['I THINK'],
    archetypes: ['The Observer', 'The Teacher', 'The Story Teller'],
    element: 'Air',
    modality: 'Mutable',
    rulingPlanet: 'Mercury',
    planetKeyword: 'Planet of Communication',
    bodyPart: 'Lungs / Arms / Fingers',
    traits: ['Communication', 'Verbal', 'Changeable', 'Flexible', 'Intellectual', 'Thinker', 'Scientist', 'Speedy', 'Efficient'],
    lifeLessons: [
      'To still the mind',
      'To connect heart, feeling and word',
      'Know when not to talk'
    ],
    esotericMeaning: [
      'Messenger of the Gods',
      'Good listener',
      'Connects and networks the tribe'
    ],
    treeOfLifeGift: 'Knowledge',
    treeOfLifeMessage: 'To you Gemini, I give the questions without answers, so that you may bring to all an understanding of what man sees around him. You will never know why men speak or listen, but in your quest for the answer you will find my gift of Knowledge.'
  },
  Cancer: {
    sign: 'Cancer',
    dateRange: 'June 21 - July 22',
    mantras: ['I FEEL'],
    archetypes: ['The Mother', 'The Healer', 'The Group'],
    element: 'Water',
    modality: 'Cardinal',
    rulingPlanet: 'Moon',
    planetKeyword: 'Planet of Emotion',
    bodyPart: 'Stomach / Breasts',
    traits: ['Emotional', 'Sensitive', 'Moody', 'Humor', 'Tenacious', 'Committed to family', 'Nurturing', 'Caretakers', 'Psychic sponges', 'Body builders'],
    lifeLessons: [
      'To accept your tears',
      'To discern without judgement',
      'To marry human and divine'
    ],
    esotericMeaning: [
      'Incarnation through feelings',
      'Human and divine merge',
      'Accepts raw vulnerability as beauty'
    ],
    treeOfLifeGift: 'Family',
    treeOfLifeMessage: 'To you Cancer, I ascribe the task of teaching men about emotion. My Idea is for you to cause them laughter and tears so that all they see and think develops fullness from inside.'
  },
  Leo: {
    sign: 'Leo',
    dateRange: 'July 23 - August 22',
    mantras: ['I WILL'],
    archetypes: ['The King or Queen', 'The Performer', 'The Child', 'The Clown'],
    element: 'Fire',
    modality: 'Fixed',
    rulingPlanet: 'Sun',
    planetKeyword: 'Planet of Life Force',
    bodyPart: 'Backbone / Heart',
    traits: ['Wilful', 'Conviction', 'Ego', 'Self-centred', 'Attention seeker', 'Happy', 'Fun', 'Creative', 'Dramatic flair', 'Childlike', 'Playful'],
    lifeLessons: [
      'Self recognition',
      'To share power',
      'Vulnerability is a strength'
    ],
    esotericMeaning: [
      'Healthy ego without aggrandizement',
      'To acknowledge God\'s power beyond all else'
    ],
    treeOfLifeGift: 'Honor',
    treeOfLifeMessage: 'To you Leo, I give the job of displaying My Creation in all its brilliance to the world. But you must be careful of pride and always remember that it is My Creation, not yours. For if you forget this, men will scorn you. There is much joy in the job I give you if you but do it well.'
  },
  Virgo: {
    sign: 'Virgo',
    dateRange: 'August 23 - September 22',
    mantras: ['I ANALYZE'],
    archetypes: ['The Servant', 'The Martyr', 'The Perfectionist', 'The Analyzer'],
    element: 'Earth',
    modality: 'Mutable',
    rulingPlanet: 'Mercury',
    planetKeyword: 'Planet of Intellect',
    bodyPart: 'Kidneys / Intestines',
    traits: ['Perfectionists', 'Clarity', 'Precision', 'Analytical', 'Critical', 'Shoulds', 'Methodical', 'Organizers', 'Servers', 'Function-oriented'],
    lifeLessons: [
      'Difference between judgment and perception',
      'Open heart',
      'Keep criticism to a minimum'
    ],
    esotericMeaning: [
      'Purity of thought, body, mind',
      'Accurate perception',
      'Connection to Mother Mary / Gaia'
    ],
    treeOfLifeGift: 'Purity of Thought',
    treeOfLifeMessage: 'To you Virgo, I ask for an examination of all man has done with My Creation. You are to scrutinize his ways sharply and remind him of his errors so that through him My Creation may be perfected.'
  },
  Libra: {
    sign: 'Libra',
    dateRange: 'September 23 - October 22',
    mantras: ['I BALANCE', 'WE BALANCE'],
    archetypes: ['The Lover', 'The Artist', 'The Peacemaker'],
    element: 'Air',
    modality: 'Cardinal',
    rulingPlanet: 'Venus',
    planetKeyword: 'Planet of Love',
    bodyPart: 'Bladder',
    traits: ['Relationship', 'Harmonizer', 'Pleaser', 'Diplomat', 'Peace at all costs', 'Justice', 'Lawyer', 'Judge', 'Indecision', 'Communicator', 'Other-oriented'],
    lifeLessons: [
      'To put attention on self',
      'Relationship is a necessity',
      'Friendship is as important as romance'
    ],
    esotericMeaning: [
      'End of duality',
      'Male and female in tandem',
      'Personality and soul balanced'
    ],
    treeOfLifeGift: 'Love',
    treeOfLifeMessage: 'To you Libra, I give the mission of service, that man may be mindful of his duties to others. That he may learn cooperation as well as the ability to reflect the other side of his actions. I will put you everywhere there is discord.'
  },
  Scorpio: {
    sign: 'Scorpio',
    dateRange: 'October 23 - November 21',
    mantras: ['I DESIRE'],
    archetypes: ['The Detective', 'The Sorcerer', 'The Therapist', 'The Surgeon'],
    element: 'Water',
    modality: 'Fixed',
    rulingPlanet: 'Pluto',
    planetKeyword: 'Planet of Transformation',
    bodyPart: 'Genitals',
    traits: ['Intensity', 'Strong non-verbal feelings', 'Power', 'Controller', 'Transformation', 'The healer', 'Sexuality', 'Intimacy', 'Spiritual union', 'Occult', 'Mysteries'],
    lifeLessons: [
      'Emotional honesty',
      'Letting go of control – it\'s safe',
      'It\'s good to cry'
    ],
    esotericMeaning: [
      'Destruction of personality',
      'Soul as singular purpose',
      'Tenderness is acceptable'
    ],
    treeOfLifeGift: 'Purpose',
    treeOfLifeMessage: 'To you Scorpio, I give a very difficult task. You will have the ability to know the minds of men, but I do not permit you to speak about what you learn. Many times you will be pained by what you see, and in your pain you will turn away from Me and forget that it is not I but the perversion of My Idea that is causing your pain. You will see so much of man that you will come to know him as an animal, and wrestle so much with his animal instincts in yourself that you will lose your way; but when you finally come back to Me, Scorpio, I have for you the supreme gift of Purpose.'
  },
  Sagittarius: {
    sign: 'Sagittarius',
    dateRange: 'November 22 - December 21',
    mantras: ['I SEEK', 'I SEE'],
    archetypes: ['The Gypsy', 'The Student', 'The Philosopher', 'The Shaman'],
    element: 'Fire',
    modality: 'Mutable',
    rulingPlanet: 'Jupiter',
    planetKeyword: 'Planet of Expansion',
    bodyPart: 'Thighs',
    traits: ['Overview', 'The big picture', 'Spirituality', 'Endless optimist', 'Travel', 'The seeker', 'Higher Education', 'Universities'],
    lifeLessons: [
      'Moderation',
      'Emotional honesty',
      'Open mind'
    ],
    esotericMeaning: [
      'Seeking your truth first',
      'Awakening through disruption',
      'Release idealism'
    ],
    treeOfLifeGift: 'Infinite Abundance',
    treeOfLifeMessage: 'Sagittarius, I ask that you make men laugh, for amidst their misunderstanding of My Idea they become bitter. Through laughter you are to give man hope, and through hope turn his eyes back to Me. You will touch many lives if but for a moment, and you will know the restlessness in every life you touch.'
  },
  Capricorn: {
    sign: 'Capricorn',
    dateRange: 'December 22 - January 19',
    mantras: ['I USE'],
    archetypes: ['The Hermit', 'The Father', 'World Leader', 'The Timeless', 'Teacher'],
    element: 'Earth',
    modality: 'Cardinal',
    rulingPlanet: 'Saturn',
    planetKeyword: 'Planet of Life Lessons',
    bodyPart: 'Knees',
    traits: ['Ambition', 'Destiny', 'Political', 'Quality', 'Status conscious', 'Business', 'Corporate executive', 'Wisdom', 'Aged', 'Maturity', 'Conservative', 'Cautious'],
    lifeLessons: [
      'Being humble',
      'Acceptance',
      'Assume the role of the teacher'
    ],
    esotericMeaning: [
      'Purposeful',
      'Timeless wisdom',
      'Not concerned with personality'
    ],
    treeOfLifeGift: 'Responsibility',
    treeOfLifeMessage: 'Of you Capricorn, I ask the toil of your brow, that you might teach men to work. Your task is not an easy one for you will feel all of man\'s labors on your shoulders; but the yoke of your burden contains the responsibility of man, which I put into your hands.'
  },
  Aquarius: {
    sign: 'Aquarius',
    dateRange: 'January 20 - February 18',
    mantras: ['I KNOW'],
    archetypes: ['The Genius', 'The Revolutionary', 'The Truth Sayer'],
    element: 'Air',
    modality: 'Fixed',
    rulingPlanet: 'Uranus',
    planetKeyword: 'Planet of Eccentricity',
    bodyPart: 'Calves',
    traits: ['Individuality', 'Non-conformist', 'Humanitarians', 'Friendship', 'Futurists', 'Inventors', 'Technology', 'Computers', 'Detached', 'Freedom lovers'],
    lifeLessons: [
      'Accept your eccentricity',
      "You're not normal – so what?",
      'Be yourself'
    ],
    esotericMeaning: [
      'Ambassadors for humanity',
      'Compassion for the collective',
      'Pioneers in consciousness'
    ],
    treeOfLifeGift: 'Freedom',
    treeOfLifeMessage: 'To you Aquarius, I give the concept of future that man might see other possibilities. You will have the pain of loneliness, for I do not allow you to personalize My Love. But for turning man\'s eyes to new possibilities I give the gift of freedom, that in your liberty you may continue to serve mankind wherever he needs you.'
  },
  Pisces: {
    sign: 'Pisces',
    dateRange: 'February 19 - March 20',
    mantras: ['I DREAM', 'I BELIEVE'],
    archetypes: ['The Mystic', 'The Dreamer', 'The Poet', 'The Dancer'],
    element: 'Water',
    modality: 'Mutable',
    rulingPlanet: 'Neptune',
    planetKeyword: 'Planet of Dreams and Illusions',
    bodyPart: 'Feet',
    traits: ['Idealism', 'Romantic poets', 'Artistic', 'Photographers', 'Film', 'Mystical', 'Psychics', 'Secretive', 'Sensitive', 'Escapism through drugs and alcohol'],
    lifeLessons: [
      'Establish boundaries',
      'Acknowledge your wisdom',
      'Let go of unconscious fear'
    ],
    esotericMeaning: [
      'Spiritual saviour',
      'Selfless service',
      'Seeking oneness'
    ],
    treeOfLifeGift: 'Understanding',
    treeOfLifeMessage: 'To you Pisces, I give the most difficult task of all. I ask you to collect all of man\'s sorrows and return them to me. Your tears are to be ultimately My Tears. The sorrow you will absorb is the effect of man\'s misunderstanding of My Idea, but you are to be given the greatest gift of all. You will be the only one of my twelve children to understand Me. But this gift of understanding is for you, Pisces, for when you try to spread it to man he will not listen.'
  },
};

// ============================================================================
// ELEMENT DETAILED DESCRIPTIONS with Debra's Questions
// ============================================================================

export interface ElementDescription {
  element: string;
  signs: string[];
  keywords: string[];
  questions: string[];
}

export const ELEMENT_DESCRIPTIONS: Record<string, ElementDescription> = {
  Fire: {
    element: 'Fire',
    signs: ['Aries', 'Leo', 'Sagittarius'],
    keywords: ['Enthusiastic', 'Impulsive', 'Inspirational', 'Humor'],
    questions: [
      'Can you push yourself to honesty, physical challenges and starting something new?',
      'Do you give yourself the right to your joy and passion?'
    ]
  },
  Earth: {
    element: 'Earth',
    signs: ['Taurus', 'Virgo', 'Capricorn'],
    keywords: ['Practical', 'Fix-it person', 'Goal-oriented', 'Service', 'Dependable', 'Loners'],
    questions: [
      'Can you follow through to manifestation?',
      'Do you care for your body, health and diet?',
      'Do you believe in abundance?'
    ]
  },
  Air: {
    element: 'Air',
    signs: ['Gemini', 'Libra', 'Aquarius'],
    keywords: ['Independent', 'Freedom', 'Thinker', 'Curious', 'Talkative', 'Observant'],
    questions: [
      'Do your words match your truth/insights/thoughts?',
      'Do you allow yourself the freedom to think for yourself?'
    ]
  },
  Water: {
    element: 'Water',
    signs: ['Cancer', 'Scorpio', 'Pisces'],
    keywords: ['Intuitive', 'Deep Feelings', 'Vibrationally Aware', 'Instinctual', 'Private', 'Secretive', 'Spiritual'],
    questions: [
      'Can you allow your instinct/feelings/intuition to flow?',
      'Can you rest in the quiet of solitude and silence?'
    ]
  }
};

// ============================================================================
// MODALITY (MODE) DESCRIPTIONS
// ============================================================================

export interface ModalityDescription {
  modality: string;
  signs: string[];
  keywords: string[];
  energy: string;
  conversations: Record<string, string>;
}

export const MODALITY_DESCRIPTIONS: Record<string, ModalityDescription> = {
  Cardinal: {
    modality: 'Cardinal',
    signs: ['Aries', 'Cancer', 'Libra', 'Capricorn'],
    keywords: ['Forceful', 'Generating', 'Authoritative', 'Get Energy', 'Active', 'Up and Go', 'Ambitious', 'Leader', 'Opportunistic'],
    energy: 'Generating energy - the initiators',
    conversations: {
      Aries: '"Me me me me..."',
      Cancer: '"You\'re hurting my feelings..."',
      Libra: '"We we we we..."',
      Capricorn: '"I\'m going to work..."'
    }
  },
  Fixed: {
    modality: 'Fixed',
    signs: ['Taurus', 'Leo', 'Scorpio', 'Aquarius'],
    keywords: ['Masterful', 'Determined', 'Purposeful', 'Stubborn', 'Persistent', 'Holding down the fort'],
    energy: 'Masterful energy - the stabilizers',
    conversations: {
      Taurus: '"Be gentle, be kind..."',
      Leo: '"No, it\'s my way..."',
      Scorpio: '"I want power, I want control..."',
      Aquarius: '"I\'m leaving, you\'re all idiots, I don\'t want to play..."'
    }
  },
  Mutable: {
    modality: 'Mutable',
    signs: ['Gemini', 'Virgo', 'Sagittarius', 'Pisces'],
    keywords: ['Adaptable', 'Versatile', 'Personable', 'Transferring energy', 'Multi-tasking', 'Easily influenced', 'Scattered'],
    energy: 'Transferring energy - the adapters',
    conversations: {
      Gemini: '"I have so many ideas, I want to think, think, think..."',
      Virgo: '"No, you need to organize and clean..."',
      Sagittarius: '"I have even more ideas..."',
      Pisces: '"I\'m meditating, you\'re all bugging me..."'
    }
  }
};

// ============================================================================
// OPPOSITION PAIRS - How they integrate
// ============================================================================

export interface OppositionPair {
  sign1: string;
  sign2: string;
  sign1Voice: string;
  sign2Voice: string;
  integration: string;
  integrationTitle: string;
}

export const OPPOSITION_PAIRS: OppositionPair[] = [
  {
    sign1: 'Aries',
    sign2: 'Libra',
    sign1Voice: 'I AM. WE\'LL DO IT MY WAY. I\'LL PUSH, LET\'S GO! INITIATOR, WARRIOR. I AM PUSHY, ENTHUSIASTIC, AND HEAD STRONG.',
    sign2Voice: 'WE BALANCE IT TOGETHER. WE\'LL DO IT OUR WAY. WHAT DO YOU WANT? HARMONIZER, PEACEMAKER. I AM GENTLE, BALANCING, AND COMPROMISING.',
    integration: 'I want to lead and I want to make sure that everyone is participating and enjoying themselves.',
    integrationTitle: 'COOPERATIVE LEADER'
  },
  {
    sign1: 'Taurus',
    sign2: 'Scorpio',
    sign1Voice: 'I HAVE. THIS IS MY FAMILY, MY THINGS, MY MONEY. I AM SWEET, SIMPLE AND LOVING.',
    sign2Voice: 'THIS IS MY COMPANY, MY MANUFACTURER. I OWN THE BANK. I AM INTENSE, POWERFUL, AND PASSIONATE.',
    integration: 'I enjoy pleasure with intensity.',
    integrationTitle: 'GENTLE POWER'
  },
  {
    sign1: 'Gemini',
    sign2: 'Sagittarius',
    sign1Voice: 'I THINK ABOUT MY THOUGHTS, MY FRIENDS, AND MY SOCIAL RESPONSIBILITIES. I LOVE TO DO THINGS SMALL AND QUICK. I LOVE TO READ, WRITE, AND DO THE DETAILS. I AM LIGHT, BOUNCY, AND PICKY.',
    sign2Voice: 'I CONSIDER THE LARGER PICTURE, WORLD\'S THOUGHTS, THE WORLD\'S POLITICS, AND FOREIGN COUNTRIES. EVERYTHING I DO IS BIG. I AM BIG, EXPANSIVE, AND EXAGGERATED.',
    integration: 'I have the ability to put size and quality together; thinking big and coupling it with detail.',
    integrationTitle: 'BIG THINKER'
  },
  {
    sign1: 'Cancer',
    sign2: 'Capricorn',
    sign1Voice: 'I WANT TO FEEL, CUDDLE, STAY AT HOME, AND COOK. I WANT TO SERVE MY FAMILY AND FEEL MY EMOTIONS. I AM SWEET, SENSITIVE, AND DEDICATED TO MY FAMILY.',
    sign2Voice: 'I USE EVERYTHING: PEOPLE, PLACES, AND ME. IT IS OFF TO WORK I GO. I AM AN ENTREPRENEUR WHO LOVES TO WORK… WHAT EMOTIONS? I AM PRACTICAL, AMBITIOUS, AND DEDICATED TO WORK.',
    integration: 'I have the ability to be ambitious with compassion and dedication to sensitivity.',
    integrationTitle: 'FAMILY IS WORK'
  },
  {
    sign1: 'Leo',
    sign2: 'Aquarius',
    sign1Voice: 'I WILL, MY WILL. I WANT TO BE SEEN, RECOGNIZED, AND APPLAUDED. UNTIL THE WORLD REFLECTS ME, IT CAN\'T BE TRUE. I DOUBT MY EXISTENCE. I AM DRAMATIC, HAPPY, AND SELF-SEEKING.',
    sign2Voice: 'I KNOW, AND I KNOW THAT I KNOW. I AM DETACHED. I DON\'T NEED ANYONE TO BELIEVE ME. I AM A SELFLESS HUMANITARIAN WHOSE INTENTIONS ARE TO SERVE THE MASSES.',
    integration: 'I am an eccentric who is concerned about other people\'s opinions.',
    integrationTitle: 'DETACHED ATTENTION SEEKER'
  },
  {
    sign1: 'Virgo',
    sign2: 'Pisces',
    sign1Voice: 'I ANALYZE EVERYTHING. I ANALYZE ME, YOU, THEM, AND I CAN HARDLY SEE THE DREAM THROUGH THE DETAIL. I AM A PERFECTIONIST WHO LOVES TO COUNT, ORGANIZE, AND CRITICIZE.',
    sign2Voice: 'I DREAM, AND I HOPE, AND WISH FOR THE IDEAL REALITY. I DON\'T CARE ABOUT THE DETAIL… JUST THE DREAM. I AM WHIMSICAL, SPACEY, AND CARE-FREE.',
    integration: 'I see the dream and apply the detail.',
    integrationTitle: 'PRACTICAL DREAMER'
  }
];

// ============================================================================
// 7 STEPS TO PREPARE FOR A READING
// ============================================================================

export const SEVEN_STEPS_READING = [
  {
    step: 1,
    title: 'Name the Sun, Moon and Rising',
    description: 'Every reading, say out loud where their Sun, Moon and Rising is. Pay attention to the distribution of elements amongst these three.',
    subPoints: [
      'Fire + Air = Energized',
      'Water + Earth = Calm',
      'Mixed bag = Versatile',
      'Squaring = Challenging personality'
    ],
    question: 'Imagine how these three influences would get along if they were put in the same room. Who would take over or be opposed?'
  },
  {
    step: 2,
    title: 'What house is the Sun in?',
    description: 'This is the theme of the entire chart and is very important. Refer back to this position whenever you are in doubt about the theme of someone\'s chart. It\'s more important than you would think.',
    subPoints: [],
    question: ''
  },
  {
    step: 3,
    title: 'Planets conjunct with Sun, Moon, Rising?',
    description: 'Once a year an outer planet is conjunct a personal planet. So it is important to pay attention to this configuration. This indicator becomes a signature of the chart. This kind of conjunction is very significant and impactful.',
    subPoints: [],
    question: ''
  },
  {
    step: 4,
    title: 'Distribution of all the elements',
    description: 'If there is none or one in a particular element, it is as significant as having four or more in one element.',
    subPoints: [
      'Someone with no Air can talk all the time, or not be able to find a word',
      'Somebody with lots of Fire can be very shy - it can go either way',
      'A balanced chart would look like 3, 3, 2 and 2 or 4, 2, 2 and 2',
      'Just because someone is missing an element does not mean they are out of balance'
    ],
    question: 'Did God not give them this element, or do they have a lot of this element because they already know it, or do they have to learn about it?'
  },
  {
    step: 5,
    title: 'Life Lesson - Saturn',
    description: 'What house and sign is Saturn in? Breathe into this one. Think it through, separate first what sign Saturn is in, and then what house. In addition to Saturn, the North Node also deals with major life lessons.',
    subPoints: [],
    question: ''
  },
  {
    step: 6,
    title: 'North Node',
    description: "It's not necessary to tell the client, but it's necessary for you to know where to aim them when it comes to the conversation about their purpose.",
    subPoints: [
      'Combine Saturn, the Rising Sign and the North Node to identify someone\'s purpose',
      'This is poetic and whimsical - it will be your job to sew them together'
    ],
    question: ''
  },
  {
    step: 7,
    title: 'Aspects',
    description: 'When you first look at the chart, what stands out for you and grabs your attention? Pay attention to that. Was it the Grand Trine? A T-Square or Opposition? Use your intuition.',
    subPoints: [
      'Is there one standing alone with no aspect?',
      'Is there one planet aspected both positively and negatively that stands out?',
      'Which ones are conjunct, opposing, trining or squaring?'
    ],
    question: ''
  }
];

// ============================================================================
// MAJOR CONFIGURATIONS
// ============================================================================

export interface MajorConfiguration {
  name: string;
  description: string;
  interpretation: string;
}

export const MAJOR_CONFIGURATIONS: Record<string, MajorConfiguration> = {
  Yod: {
    name: 'Yod (Finger of God)',
    description: 'Two planets that are 60°, the third is opposite the midpoint at 150°. Has to be within a 3° orb.',
    interpretation: 'You have been chosen. Yod is the Hebrew word for hand or finger. You\'ve been pointed at. The planet that is pointed at determines the significant focus for your fate.'
  },
  GrandTrine: {
    name: 'Grand Trine',
    description: 'Three planets all in the same element, each separated by 120°. It does not matter what houses.',
    interpretation: 'A God-given gift or ease. This effortless quality can lead to laziness, or an inability to see one\'s own talents.'
  },
  GrandCross: {
    name: 'Grand Cross',
    description: 'Four planets all in the same mode, each separated by 90°.',
    interpretation: 'A God-given challenge. This individual draws life lessons to themselves to promote their awareness. Not always easy!'
  },
  TSquare: {
    name: 'T-Square',
    description: 'Three planets all in the same mode. Two planets 180° apart and the third 90° from those two.',
    interpretation: 'These individuals have "ants in their pants", extra energy, constant movement. They must utilize their release point to decrease the tension from the squares.'
  }
};

// ============================================================================
// PLANET DESCRIPTIONS
// ============================================================================

export interface PlanetDescription {
  planet: string;
  influences: string[];
  rules: string[];
  exaltedIn: string;
}

export const PLANET_DESCRIPTIONS: Record<string, PlanetDescription> = {
  Sun: {
    planet: 'Sun',
    influences: ['Self-expression', 'Energy', 'Male energy'],
    rules: ['Leo'],
    exaltedIn: 'Aries'
  },
  Moon: {
    planet: 'Moon',
    influences: ['Intuition', 'Female energy', 'Emotional temperament'],
    rules: ['Cancer'],
    exaltedIn: 'Taurus'
  },
  Mercury: {
    planet: 'Mercury',
    influences: ['Intellect', 'Communication', 'The way you think'],
    rules: ['Gemini', 'Virgo'],
    exaltedIn: 'Aquarius'
  },
  Venus: {
    planet: 'Venus',
    influences: ['How and what you love', 'What you are attracted to'],
    rules: ['Taurus', 'Libra'],
    exaltedIn: 'Pisces'
  },
  Mars: {
    planet: 'Mars',
    influences: ['Expenditure of energy', 'Assertiveness'],
    rules: ['Aries'],
    exaltedIn: 'Capricorn'
  },
  Jupiter: {
    planet: 'Jupiter',
    influences: ['Expansion', 'What you enjoy the most', 'Luck'],
    rules: ['Sagittarius'],
    exaltedIn: 'Pisces'
  },
  Saturn: {
    planet: 'Saturn',
    influences: ['Life lessons', 'Destiny', 'Discipline', 'Old man of the zodiac'],
    rules: ['Capricorn'],
    exaltedIn: 'Libra'
  },
  Uranus: {
    planet: 'Uranus',
    influences: ['Eccentricity', 'Unpredictability', 'Genius'],
    rules: ['Aquarius'],
    exaltedIn: ''
  },
  Neptune: {
    planet: 'Neptune',
    influences: ['Dreams and illusions', 'Idealism', 'Mystic / Magician'],
    rules: ['Pisces'],
    exaltedIn: ''
  },
  Pluto: {
    planet: 'Pluto',
    influences: ['Transformation', 'Passion', 'Compulsion', 'Unconscious'],
    rules: ['Scorpio'],
    exaltedIn: ''
  }
};

// ============================================================================
// ASPECT DESCRIPTIONS
// ============================================================================

export interface AspectDescription {
  name: string;
  symbol: string;
  degrees: string;
  orb: string;
  nature: string;
  description: string;
}

export const ASPECT_DESCRIPTIONS: Record<string, AspectDescription> = {
  Conjunction: {
    name: 'Conjunction',
    symbol: '☌',
    degrees: '0°',
    orb: '5° (10° for Sun, Moon, Ascendant)',
    nature: 'Act as One',
    description: '2 or more planets within 5º of each other - they blend and act as one force'
  },
  Opposition: {
    name: 'Opposition',
    symbol: '☍',
    degrees: '180°',
    orb: '5° (10° for Sun, Moon, Ascendant)',
    nature: 'Harmonize / Dialogue',
    description: '2 planets at 180º apart - creates tension that requires balance and integration'
  },
  Trine: {
    name: 'Trine',
    symbol: '△',
    degrees: '120°',
    orb: '5° (10° for Sun, Moon, Ascendant)',
    nature: 'Effortless Gift',
    description: '2 planets in the same Element (e.g. Water + Water) - natural flow and ease'
  },
  Square: {
    name: 'Square',
    symbol: '□',
    degrees: '90°',
    orb: '5° (10° for Sun, Moon, Ascendant)',
    nature: 'Creates Tension',
    description: '2 planets in the same Mode - challenging aspect that promotes growth through friction'
  },
  Sextile: {
    name: 'Sextile',
    symbol: '⚹',
    degrees: '60°',
    orb: '5° (10° for Sun, Moon, Ascendant)',
    nature: 'Harmonious',
    description: 'Fire + Air, Water + Earth - comfortable and supportive energy'
  }
};

// ============================================================================
// HOUSE DESCRIPTIONS (from the guide)
// ============================================================================

export interface HouseGuideDescription {
  house: number;
  keywords: string[];
  themes: string[];
}

export const HOUSE_GUIDE_DESCRIPTIONS: HouseGuideDescription[] = [
  { house: 1, keywords: ['Physical Appearance', 'Ego', 'Action', 'Initiation'], themes: ['Self', 'Warrior'] },
  { house: 2, keywords: ['Finances', 'Values', 'Spirituality', 'Simplicity'], themes: ['Values', 'Money'] },
  { house: 3, keywords: ['Consciousness', 'Designers', 'Intellect\'s Expression'], themes: ['Intellect', 'Communication'] },
  { house: 4, keywords: ['Families', 'Psychologist', 'Parental Figure', 'The Unconscious'], themes: ['Home', 'Subconscious'] },
  { house: 5, keywords: ['Entertainment', 'Love Affairs', 'Children', 'Creative Expression'], themes: ['Love', 'Creativity'] },
  { house: 6, keywords: ['Work', 'Health', 'Details', 'Planning', 'Serving Women'], themes: ['Service', 'Perfection'] },
  { house: 7, keywords: ['Marriage Partners', 'Legal Affairs', 'Cooperation'], themes: ['Harmony', 'Partnership'] },
  { house: 8, keywords: ['Therapists', 'Big Change', 'Legacies', 'Taxes', 'Rebirth', 'Sex'], themes: ['Transformation'] },
  { house: 9, keywords: ['Higher Education', 'Religion', 'Philosophy', 'Travel'], themes: ['Overseer', 'Optimist', 'Seeker'] },
  { house: 10, keywords: ['Career', 'Reputation', 'Results', 'Responsibility'], themes: ['Reputation', 'Ambition'] },
  { house: 11, keywords: ['Friends', 'Eccentric', 'Future Technology', 'Social Alliances'], themes: ['Eccentric', 'Futurist'] },
  { house: 12, keywords: ['Magic', 'Past Lives', 'Secrets', 'Privacy', 'Dreams'], themes: ['Behind the Scenes', 'Psychic'] },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getSignArchetype = (sign: string): SignArchetype | undefined => {
  return SIGN_ARCHETYPES[sign];
};

export const getOppositionPairForSign = (sign: string): OppositionPair | undefined => {
  return OPPOSITION_PAIRS.find(pair => pair.sign1 === sign || pair.sign2 === sign);
};

export const getElementDescription = (element: string): ElementDescription | undefined => {
  return ELEMENT_DESCRIPTIONS[element];
};

export const getModalityDescription = (modality: string): ModalityDescription | undefined => {
  return MODALITY_DESCRIPTIONS[modality];
};

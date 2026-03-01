// Debra Silverman Level 1 Handbook - Complete Element Teachings
// Source: Level 1 Student Handbook V18

// ============================================================================
// ELEMENT DETAILED TEACHINGS
// ============================================================================

export interface ElementTeaching {
  element: string;
  signs: string[];
  story: string;
  quote: string;
  
  // Self-Assessment Questions
  selfAssessment: string[];
  
  // Themes & Wisdom
  themes: string[];
  
  // Keywords
  keywords: string[];
  
  // Gender Expression
  menExpression: string;
  womenExpression: string;
  
  // Permissions (what to allow yourself)
  permissions: string[];
  
  // Shadow Side
  shadows: string[];
  
  // Self-Exercises
  exercises: string[];
  
  // Element Blending
  withOtherElements: Record<string, string>;
  
  // Evolved State
  evolved: string[];
  
  // Lack of Element
  lackSymptoms: string[];
  
  // Medicine / Balancing Suggestions
  medicine: string[];
}

export const ELEMENT_TEACHINGS: Record<string, ElementTeaching> = {
  Water: {
    element: 'Water',
    signs: ['Cancer', 'Scorpio', 'Pisces'],
    story: 'Charlie is a handsome guy. For twenty some years, he was a lieutenant in a New York City fire department. On September 11, 2001, he was on a plane leaving New Jersey when he looked out and saw smoke billowing from the World Trade Center. He returned to Ground Zero for months, doing "sacred work" seeking to return evidence of his friends back to their families. Water people feel pain as a universal sensation. They are the people who watch the news and cry.',
    quote: 'Through love, all pain turns to medicine. The cure for anything is sweat, tears, or the sea. ~ Isaak Dinesen',
    
    selfAssessment: [
      'I cry easily',
      'I am sentimental (like to save sentimental objects)',
      'I become non-verbal when upset',
      'My body gets immediate gut reactions to people',
      'I second-guess myself',
      'My self-talk tends to be negative',
      'I am a private person and I cherish private time',
      'I can be hypersensitive, emotionally or physically',
      'I am fascinated by the super-natural (mystics attract me)',
      'Music is a necessity in my life'
    ],
    
    themes: [
      'Learn how to deal with sensitivity and release the past (childhood memories) to be here now',
      'Learn and practice the art of forgiveness',
      'Listen to the language of symbols, dreams, and intuition to make the unconscious conscious. Water has the most developed capacity for psychic phenomenon, reading minds',
      'Water is the unconscious mind. It offers the opportunity to become aware of feelings that have been stored. Bringing them to awareness allows you to release old wounds',
      'Develop boundaries. Learn how to manage sensitivity as a gift and not a curse. Water absorbs what is around it',
      'Water is responsive and can go to either compassion or to pain. At the highest level, water is Christ energy, loves everyone and wants to heal. The low level is excessive empathy that takes on others\' pain and wallows in it'
    ],
    
    keywords: [
      'Tears, emotions, and feelings',
      'Music, meditation, and yoga',
      'Too much water—drowning in feelings',
      'Must be able to release',
      'Too little water—frozen ice cubes don\'t feel feelings',
      'Reactive and highly emotional',
      'Perceptive and receptive',
      'Beginning of every cycle—womb and gestation',
      'First intuition, gut feelings, instinct, and non-verbal',
      'Family of origin',
      'Quiet, introverted',
      'Mysteries of life, including occult and magic—psychic abilities',
      'Great capacity to feel',
      'Compassion and intuition',
      'Sensuality, loves nature, and intimacy',
      'Healers',
      'Childhood fears',
      'Mother, comfort, home',
      'Homebody',
      'Love antiques and anything old',
      'Saves and collects things of sentimental value',
      'Absorbs negativity—psychic sponges',
      'Decorator, interior design, great aesthetic, and sacred spaces',
      'Personal space and quiet',
      'Rules unconscious—easily influenced, easily hypnotized',
      'Nurturer, loves to cook',
      'Poet, visionary, creative dreamer, and rich imagination',
      '"Yum yum" factor—pleasures of senses',
      'Ecological vision—huge compassion for physical earth',
      'Memories',
      'Merges, no boundaries',
      'Permeable',
      'Feels pain. Pain can get stuck in their body'
    ],
    
    menExpression: 'Water men tend to not talk much and don\'t care to socialize. They express their love by providing, but not talking. Can be overly sexual. They are highly sensitive and emotionally reactive (either temper or withdrawn).',
    womenExpression: 'Watery women can talk and share process. On the other hand they can be very secretive and withdrawn if they sense you neglecting them for one minute. They make really good friends, but like to have just a few. They love being mom. They have a very difficult time asking for what they need, until they\'ve reached a crisis point.',
    
    permissions: [
      'Allow yourself to feel and listen deeply… your soul longs for quiet',
      'It is safe for you to open up to those you love. (Water people are overly protective and shield themselves from being open)',
      'It is okay to only want to be around a few chosen people',
      'Allow yourself time off guilt free far away from people. Your home is a sacred temple',
      'It is okay to hate superficial parties',
      'Allow yourself to release feelings in the moment, to prevent emotional backup. (Alcoholism, sexual, and fear based addictions can result if the emotional body is harboring pain)',
      'It is okay to just sit with those who are in pain. You are a natural healer with your hands and with your heart',
      'It is totally okay to be quiet, in your silence, and comfortable. You don\'t have to talk',
      'Stay in yourself and be aware of your need to please and shape-shift like a chameleon',
      'Be grateful as much as possible',
      'It is okay to cry and to get angry',
      'It is okay to ask for what you need without waiting for a crisis. Practice receiving from others',
      'Allow yourself guilt-free time to read, meditate, watch TV, take naps, and downtime',
      'Listen to your own truth, and take time to be alone',
      'Practice saying "yes" to your soul. Go through a spiritual door, meditate, pray, or do yoga',
      'Give thanks for all things in a consistent spiritual practice of a morning prayer',
      'Know when therapy is over—seek joy as a spiritual practice'
    ],
    
    shadows: [
      'Losing boundaries, causing you to complain that you\'re always giving and not getting',
      'Indulging in alcohol, drugs, and sex',
      'Prone to depression, complaining, and wallowing in emotions',
      'Fear-ridden with paranoia or phobias',
      'Hypochondriac. Gets sick a lot, feelings cause symptoms in their bodies',
      'Fear of dying and fear of loss is always present',
      'Cold and limiting beliefs—become like ice, addicted to negativity',
      'Family issues are unresolved, causing past wounds to be carried constantly in the present',
      'Project their own faults onto others because they can\'t see outside their own compelling emotional experience',
      'Lack of impulse control',
      'Can get caught in occult, death, dying, and spirits; become overly affected by the invisible world'
    ],
    
    exercises: [
      '"Where am I in pain?", "What am I feeling?" Give yourself permission to fully experience and release it, even if you have to cry',
      '"How much do I let myself feel?" Score it 0 to 10',
      '"What am I feeling right now?" Find it in your body. Ask yourself, "Where in my body am I feeling that?" Sit with it compassionately',
      'Once you identify the feeling ask, "What am I scared of?" Rate it 0 to 10',
      'Using your breath, take the pain up from the belly and down your back/spine and into the cord going down into mother earth'
    ],
    
    withOtherElements: {
      Water: 'Very compatible together. Both prefer to be gentle, non-verbal, and nurturing of the other. These two get along great. They just might not talk very much.',
      Air: 'The poet. An ability to listen to intuition and speak it in a whimsical, free-flowing way.',
      Earth: 'A natural ally. Just as a plant in the earth loves to be watered, so does water love to be with earth; these two are natural friends. Water is about emotional security and earth is about financial and material security.',
      Fire: 'Water is confused because fire\'s impulse is to stand up and stand out while water\'s impulse is to go inside, retreat, and pull back. But if there is a container for the water, the fire can heat it up with a nice result, like a hot cup of tea or a delicious hot tub.'
    },
    
    evolved: [
      'The best example of evolved water is the Dalai Lama',
      'The ability to be in stillness, accept pain, and pleasure without preference',
      'To master the art of forgiveness by having compassion for the perpetrator',
      'To have intact boundaries, which allow feelings to come and be released',
      'To practice the art of consciously letting go',
      'To easily know when to say "no" in order to maintain one\'s own well-being as a first priority above all else'
    ],
    
    lackSymptoms: [
      'You can\'t feel, or you feel too much',
      'Lack of empathy',
      'Doesn\'t understand the notion of romance',
      'It\'s very easy for you to let go of things, and you can\'t understand why people are so attached',
      'You move very quickly through your emotional issues',
      'Human nature itself seems a mystery to you because you really don\'t understand attachment'
    ],
    
    medicine: [
      'If it\'s hard to cry, watch sad films like Ordinary People, Love Story, My Life as a House, or The Color Purple. These will help you re-establish your tear ducts',
      'If you have lots of water, or not enough, you may cry at commercials. Consider if you have a chemical imbalance that affects your ability to control your emotional body',
      'Learning meditation is a short answer to the question of how to cultivate emotional stability. Try sitting quietly and breathing deeply. Yoga, qi gong, tai chi can be very helpful',
      'The wisdom of water is to allow someone\'s pain without trying to fix it. To simply rest in the depth of sadness, despair, or grief with a gentle touch'
    ]
  },
  
  Air: {
    element: 'Air',
    signs: ['Gemini', 'Libra', 'Aquarius'],
    story: 'Kenny spent twenty-seven years in San Quentin with a life sentence for kidnapping and robbery. Four angels - who didn\'t all know each other - were drawn to a friendship with him out of pure synchronicity. Air people have a way of blending and crossing boundaries. They are gifted to see without judgment. For air people, we\'re all sharing the same air and, therefore, we\'re all friends. Friendships and relationships are Holy for Air people.',
    quote: 'Air people love freedom. They think outside the box. Synchronicity is a specialty of Air people; their timing is a sequence of magical events that occurs far beyond reason.',
    
    selfAssessment: [
      'I find words easily and others consider me talkative',
      'I enjoy watching people and asking questions',
      'I fill in or finish people\'s sentences',
      'I observe and analyze people',
      'I easily get bored with people and want to move on',
      'It is easy for me to remember numbers and details',
      'I am easily distracted by external stimulus',
      'I change plans/directions easily',
      'I frequently forget where I put things',
      'Harmony is essential, even if the cost is high'
    ],
    
    themes: [
      'People, people everywhere—into friendships, love, and harmony',
      'Detached, live in their heads, which makes it hard to feel, and therefore they\'re indecisive',
      'Feeling different and separate, alienated, especially from their own family of origin',
      'Relationships—harmony at all costs, even at expense of the self',
      'Thrive on novelty, adventure; hate being bored, consistent, repetitious, therefore impatient',
      'Independent, freedom—loving, thinker, curious, talkative, observant',
      'Sociable pretence often assumed at expense of authenticity'
    ],
    
    keywords: [
      'Verbalize, talk, interrupt',
      'Telephone—email—computers, technology geeks',
      'Mediators, lawyers, negotiators, therapists, coaches',
      'Articulate',
      'Mind, intellect, school',
      'Reading and writing',
      'Break the rules',
      'Keen observation',
      'Charming, pleaser personality—politicians—schmoozer, can work the room',
      'Not connected—detached, disappear, evaporate suddenly, unpredictable',
      'Designer—loves color, feng shui',
      'Mathematical, good with numbers (but never think so)',
      'Auditory',
      'Nosy—gossip',
      'Loves people and avoids conflict',
      'Curious—always studying, reading',
      'Provoke and stimulate new thought',
      'Love conversation',
      'Visionaries—ahead of their time',
      'Consciousness—perky, awake',
      'Observer, spectator',
      'Out of box',
      'Research and modern science',
      'Reads anything',
      'Minds insatiable',
      'Get bored easily',
      'Great listener',
      'Comforted by books—libraries—bookstores',
      'Flaky, forgetful "airhead"'
    ],
    
    menExpression: 'Intellects who are mad scientists, humanitarians who forget their children\'s names. Can appear detached and disinterested in human psyche or can be excessively charming, romantic, and almost feminine in respect to relationship.',
    womenExpression: 'Social, friendly, value community, and networking. Love clothes, jewellery and design. Great sense of style. They are playful, entertaining, they love to talk, shop, and spend money. Change is their middle name; they change their mind often. Far more sensitive than they appear. Emotionally unpredictable.',
    
    permissions: [
      'Learn to talk from the heart and the body—use the body to stay in the moment and not get lost in words',
      'Ask yourself, "Why are you speaking and who are you serving?" Practice saying: "I need you." "I miss you." "I feel sad." "I was wrong." "I need help."',
      'Agree to disagree. Disharmony can be healthy. Know when not to talk',
      'When you can\'t make decisions, seek counsel from those you respect who will give you back to yourself',
      'Beware of leaving yourself out and always being curious about the other person to the exclusion of yourself',
      'Journalling to establish your own voice is medicine for you, so that you can hear your own thoughts',
      'Learn to use the "gut" as your discernment tool so you don\'t suffer from indecisiveness',
      'Everyone has their own rhythm—it is OK for others to go slow—don\'t judge them',
      'Know that you are an intellectual person even if you feel there is so much more to learn',
      'Speak to the unspeakable. Speak truth and avoid mixed messages',
      'At the personality level, air loves to talk, while soulful air loves to listen',
      'Find a good listener, coach or therapist, talk and talk without censor… "air conditioning"',
      'It is okay to speak the negative in order to "clear the air"',
      'Identify the core beliefs and the stories you repetitively tell yourself, are they true?'
    ],
    
    shadows: [
      'They think they are flaky and sometimes they are—can appear flaky even if they\'re not',
      'They lie by omission—don\'t tell the whole truth',
      'Very flirtatious, even if it\'s only in their head, guilty for being a flirt',
      'Dilettantes dabbling in many things and master of none',
      'Codependent and don\'t like being alone',
      'An "idea factory" with no practical application—dreamers who don\'t manifest because they don\'t think it through',
      'When feeling left out, they will talk more and more, or stand in silence on the sidelines appearing arrogant and separate',
      'Beware of becoming know-it-all; you read enough to get the gist and pretend you know all'
    ],
    
    exercises: [
      'What am I confused about?',
      'Do my words match my truth, insights, and thoughts?',
      'Who have I not communicated honestly to? Write a letter—you don\'t have to give it to them',
      'Do I allow myself the freedom to think for myself or is my "pleaser" keeping me in a relationship that no longer serves me?'
    ],
    
    withOtherElements: {
      Water: 'Letting someone be non-verbal and leaving empty space rather than filling in words for them all the time.',
      Air: 'Will go off and have a party at the speed of light, change their mind, and forget to tell you where they were going just after promising to meet you for dinner.',
      Earth: 'Providing ideas and then listening to the practical advice of earth, so you don\'t feel criticized but rather supported to take your idea into the practical realm.',
      Fire: 'Add air to a fire, the fire gets bigger, it\'s a very energizing combination. These two are extremely compatible.'
    },
    
    evolved: [
      'Know when not to talk',
      'Empty mind—meditation',
      'Wisdom carrier, teacher',
      'Poets',
      'Use words to bless and heal rather than puncture and hurt',
      'Can gracefully and effortlessly speak to unspeakable',
      'Spacious, gracious, inclusive',
      'Diplomats, ambassadors, messenger'
    ],
    
    lackSymptoms: [
      'Either they don\'t talk at all, or they talk all the time',
      'Their minds go in many directions at the same time',
      'They can\'t finish a book',
      'Sitting still for too long is impossible',
      'Can\'t socialize comfortably'
    ],
    
    medicine: [
      'Take a class focused on public speaking or conscious communication to strengthen your voice',
      'Practice deep listening—let others finish before responding, and notice what you learn when you give space',
      'Write in a journal and "air" your thoughts and feelings—let the words flow without editing',
      'Ask questions. The single most powerful gift that an air person knows is how to ask questions and engage the other in telling their story',
      'If you\'ve been told you talk too much, ask for feedback. "Did you understand what I just said?" Then listen to those around you'
    ]
  },
  
  Earth: {
    element: 'Earth',
    signs: ['Taurus', 'Virgo', 'Capricorn'],
    story: 'Meet Dave and Ann, who run a family-owned lumber business. They pay off employees\' debts, put them through school, and give money for down payments on homes. They bought dozens of acres to protect against development and created a wildlife refuge. "It\'s simply doing the right thing," Dave said. "We\'re creating community - a place where people can raise families and help one another."',
    quote: 'When all the trees have been cut down, when all the animals have been hunted, when all the waters are polluted, when all the air is unsafe to breathe, only then will you discover you cannot eat money. ~ Cree Prophecy',
    
    selfAssessment: [
      'Saving money is important to me',
      'Others consider me to be practical and grounded',
      'I clean when I am upset',
      'I am thorough and deliberate when I work',
      'I love to eat and am sensitive to tastes and smells',
      'I prefer to be in control',
      'Being in nature is essential for me',
      'I am goal oriented and I get results',
      'People can rely on me and consider me dependable',
      'I am slow to change'
    ],
    
    themes: [
      'Manifest, money, job, getting things done, and values results',
      'Must have security—obsessed with money; loves getting a good deal',
      'Laws, practicality, government, rules, paperwork, and being on time',
      'Captains of worry wart team',
      'Always thinking of what needs to happen next; there is work to be done',
      'Kinaesthetic and sensual—like being in body, eating, get off on giving gifts, and cleaning',
      'Works hard and forgets to have fun',
      'Wishes everybody was like them—neat, dependable, on time, and gets everything done perfectly'
    ],
    
    keywords: [
      'Consistent, solid',
      'Good at money and finances',
      'Grounded—sustainability, environmentalists',
      'Maintenance',
      'Perfectionist',
      'Practical',
      'Nature lovers—love being outside',
      'Control freaks—they get off on checking things off of their lists',
      'Obsessed with plants, herbs, natural medicine',
      'Physical',
      'Manifestor',
      'Substantial—designer labels, into high quality',
      'Hard to move—stubborn, highly opinionated',
      'Buildings, architecture',
      'Loyal',
      'Likes how-to books',
      'Wants insurance policy',
      'Likes routine, repetition, buys the same brands, eats the same food',
      'Functional, practical, purposeful things are valued',
      'Quality',
      'Research',
      'Clean, clean, clean',
      'Kind of boring—slow and simple',
      'Stable',
      'Critical',
      'Knows how to connect to core',
      'Integrity',
      'Abundance'
    ],
    
    menExpression: 'Earth men embody the best of Earth values: the joy of working, serving out of a pure desire to give, and strong perseverance to never quit - even when the task ahead is tedious, repetitive, and predictable. Work is their pleasure.',
    womenExpression: 'Earth women are wisdom born out of deep experience. They don\'t complain or play into the victim role. Their work ethic and ability to care for those less fortunate is exceptional. They are emotionally wise and have done the serious study required to heal their wounds.',
    
    permissions: [
      'Allow yourself to not have everything perfect all the time',
      'It is okay to take breaks and rest without feeling guilty',
      'Give yourself permission to receive help from others',
      'It is okay to not always be productive - rest is productive too',
      'Allow yourself to enjoy pleasure without needing to earn it first',
      'It is okay to delegate tasks to others',
      'Give yourself permission to be spontaneous sometimes',
      'Allow yourself to make mistakes - perfectionism is exhausting',
      'It is okay to say no to additional responsibilities',
      'Give yourself credit for all that you accomplish'
    ],
    
    shadows: [
      'Excessive worry about money and security',
      'Over-critical of self and others',
      'Stubbornness that prevents growth',
      'Workaholic tendencies that neglect relationships',
      'Control issues that push others away',
      'Resistance to change even when change is needed',
      'Judgmental attitude toward those who are less organized',
      'Perfectionism that paralyzes action',
      'Hoarding - difficulty letting go of material possessions',
      'Pessimism disguised as "being realistic"'
    ],
    
    exercises: [
      'What am I worried about right now? Rate it 0-10',
      'Where am I being too rigid in my life?',
      'When did I last allow myself to play without purpose?',
      'What am I trying to control that I need to let go of?',
      'How can I practice receiving without needing to give something back immediately?'
    ],
    
    withOtherElements: {
      Water: 'Earth provides the container for water\'s emotions. These two are natural allies, creating security together - earth provides material security, water provides emotional security.',
      Air: 'Air brings ideas while earth grounds them into reality. Earth can help air manifest their visions, while air can help earth think more flexibly.',
      Earth: 'Two earth people together create stability and reliability. They understand each other\'s need for routine and quality. May need to remember to have fun.',
      Fire: 'Fire can inspire earth to take action and risks. Earth can help fire slow down and build something lasting. Fire may feel restricted by earth\'s caution.'
    },
    
    evolved: [
      'Uses work as a spiritual practice',
      'Gives generously without expecting return',
      'Finds balance between work and rest',
      'Embraces imperfection as part of being human',
      'Creates community and takes care of others',
      'Has learned that true security comes from within',
      'Can be flexible when circumstances require it',
      'Trusts in abundance rather than scarcity'
    ],
    
    lackSymptoms: [
      'Difficulty manifesting ideas into reality',
      'Struggles with money management',
      'Can\'t seem to follow through on commitments',
      'Feels ungrounded or spacey',
      'Has trouble with routine and structure',
      'May neglect body and health',
      'Difficulty with time management and being on time'
    ],
    
    medicine: [
      'Develop a daily routine and stick to it',
      'Practice being in your body through exercise, yoga, or martial arts',
      'Create a budget and track your spending',
      'Spend time in nature regularly',
      'Make lists and check things off',
      'Work with your hands - gardening, cooking, crafts',
      'Set small achievable goals and celebrate completing them',
      'Practice being on time for appointments'
    ]
  },
  
  Fire: {
    element: 'Fire',
    signs: ['Aries', 'Leo', 'Sagittarius'],
    story: 'Fire people are the athletes, the loud ones, and the inspirers who push, shout, and demand that we get into our bodies and get a life. They are bossy and full of Fire. If they get out of balance, they become obsessive athletes who need to stand out and demand to be noticed.',
    quote: 'Fire is enthusiasm, inspiration, passion, and the driving force of will. It transforms everything it touches.',
    
    selfAssessment: [
      'I thrive on exercise, athletics and expending physical energy',
      'I am outspoken and frequently say things that get me in trouble',
      'I have lots of energy and am enthusiastic and passionate',
      'People would like to turn my volume down or think I\'m too intense',
      'It is easy for me to laugh and find the humor in life',
      'I am deeply into philosophy and/or spirituality',
      'I inspire others to take action',
      'People get mad at me – anger can be an issue either my own or others\'',
      'I can be the life of a party',
      'I fight for the underdog and/or love to argue and debate'
    ],
    
    themes: [
      'Action, initiative, and leadership',
      'Physical energy and athleticism',
      'Enthusiasm and inspiration',
      'Spirituality and philosophy',
      'Truth-seeking and speaking',
      'Passion and intensity',
      'Drama and performance',
      'Fighting for what is right'
    ],
    
    keywords: [
      'Enthusiasm, energy, inspiration',
      'Action-oriented, athletic',
      'Passionate, intense',
      'Leader, initiator',
      'Outspoken, direct, honest',
      'Optimistic, humorous',
      'Dramatic, performative',
      'Spiritual seeker',
      'Fighter, warrior',
      'Impatient, impulsive',
      'Bossy, domineering',
      'Angry, temper',
      'Needs attention and recognition',
      'Loves adventure and risk',
      'Physical, in the body',
      'Loud, boisterous',
      'Inspiring, motivating',
      'Playful, childlike',
      'Philosophical',
      'Truth-seeker'
    ],
    
    menExpression: 'Fire men are leaders, athletes, and warriors. They take action and initiative. They can be bossy and need to be in charge. They are passionate and physical. They may struggle with anger and impulsivity.',
    womenExpression: 'Fire women are dynamic, inspiring, and full of life. They are not afraid to speak their truth and fight for what they believe in. They can be dramatic and need recognition. They bring joy and enthusiasm to everything they do.',
    
    permissions: [
      'It is okay to be passionate and enthusiastic',
      'Allow yourself to take up space and be seen',
      'It is okay to speak your truth even when it\'s uncomfortable',
      'Give yourself permission to rest - you don\'t always have to be in action',
      'It is okay to have needs for recognition and appreciation',
      'Allow yourself to feel and express anger in healthy ways',
      'It is okay to take the lead and be in charge',
      'Give yourself permission to play and have fun',
      'It is okay to be intense - your passion is a gift',
      'Allow yourself to slow down sometimes - not everything is urgent'
    ],
    
    shadows: [
      'Anger and rage that is out of control',
      'Impulsivity that leads to regret',
      'Domineering behavior that alienates others',
      'Need for attention that becomes exhausting',
      'Arrogance and self-righteousness',
      'Burnout from excessive action without rest',
      'Insensitivity to others\' feelings',
      'Impatience with those who move slower',
      'Competitiveness that damages relationships',
      'Drama-seeking that creates unnecessary conflict'
    ],
    
    exercises: [
      'Where am I pushing too hard right now?',
      'What anger am I holding that needs healthy expression?',
      'When did I last rest without guilt?',
      'How can I inspire others without overwhelming them?',
      'Where am I being impatient with myself or others?'
    ],
    
    withOtherElements: {
      Water: 'Fire heats water - can create steam (passion meeting emotion). Fire needs to be careful not to evaporate water with too much intensity. Water can help fire cool down and feel.',
      Air: 'Air feeds fire - these two are extremely compatible. Air brings ideas and fire takes action. Together they create enthusiasm and movement.',
      Earth: 'Earth can contain fire - helps fire build something lasting. Fire can inspire earth to take risks. Earth may feel burned by fire\'s intensity.',
      Fire: 'Two fires together create more fire - high energy, excitement, and potential combustion. They understand each other\'s passion but may compete for attention.'
    },
    
    evolved: [
      'Uses passion to inspire and uplift others',
      'Has learned to balance action with rest',
      'Expresses anger in healthy, constructive ways',
      'Leads with humility and serves others',
      'Channels intensity into creative and spiritual pursuits',
      'Knows when to step back and let others lead',
      'Uses truth-speaking to heal rather than wound',
      'Has transmuted personal will into divine will'
    ],
    
    lackSymptoms: [
      'Difficulty taking action and initiative',
      'Low energy and enthusiasm',
      'Can\'t seem to get motivated',
      'Avoids conflict and speaking truth',
      'Feels flat or depressed',
      'No passion or excitement about life',
      'Difficulty being seen or taking up space',
      'Lacks physical vitality'
    ],
    
    medicine: [
      'Engage in regular vigorous exercise',
      'Practice speaking your truth in small ways',
      'Find something you\'re passionate about and pursue it',
      'Spend time in the sun and near actual fires (safely)',
      'Take up a competitive sport or martial art',
      'Practice saying yes to adventure and new experiences',
      'Find healthy outlets for anger - boxing, running, shouting into pillows',
      'Celebrate your victories and let yourself be recognized'
    ]
  }
};

// ============================================================================
// MERCURY / MINDSET TEACHINGS
// ============================================================================

export interface MercuryInSign {
  sign: string;
  mindset: string;
  thinkingStyle: string;
  communicationStyle: string;
  challenges: string[];
  gifts: string[];
}

export const MERCURY_IN_SIGNS: Record<string, MercuryInSign> = {
  Aries: {
    sign: 'Aries',
    mindset: 'The Pioneer Mind',
    thinkingStyle: 'Quick, impulsive, direct, and competitive. Thinks in action and wants immediate results.',
    communicationStyle: 'Blunt, direct, and to the point. May interrupt or speak before thinking. Leaders in conversation.',
    challenges: [
      'Impatience with slower thinkers',
      'Speaking before thinking through consequences',
      'May miss details in rush to action',
      'Can come across as aggressive or domineering'
    ],
    gifts: [
      'Quick decision-making',
      'Courage to speak truth',
      'Natural leadership in discussions',
      'Ability to cut through confusion'
    ]
  },
  Taurus: {
    sign: 'Taurus',
    mindset: 'The Steady Mind',
    thinkingStyle: 'Slow, deliberate, and thorough. Thinks through practical applications and values.',
    communicationStyle: 'Calm, measured, and grounded. Takes time to formulate thoughts. Values quality over quantity in speech.',
    challenges: [
      'Can be stubborn once mind is made up',
      'Slow to change perspective',
      'May resist new ideas',
      'Can seem rigid or inflexible'
    ],
    gifts: [
      'Reliable and consistent thinking',
      'Practical wisdom',
      'Ability to see things through to completion',
      'Grounded perspective'
    ]
  },
  Gemini: {
    sign: 'Gemini',
    mindset: 'The Curious Mind',
    thinkingStyle: 'Quick, versatile, and curious. Can hold multiple perspectives simultaneously. Loves learning.',
    communicationStyle: 'Talkative, witty, and engaging. Excellent at networking and gathering information. Asks lots of questions.',
    challenges: [
      'Scattered thinking - too many ideas at once',
      'Difficulty focusing on one topic',
      'May speak without depth',
      'Can be inconsistent or unreliable with words'
    ],
    gifts: [
      'Natural teacher and communicator',
      'Quick learner',
      'Versatile and adaptable thinking',
      'Excellent networker and connector'
    ]
  },
  Cancer: {
    sign: 'Cancer',
    mindset: 'The Feeling Mind',
    thinkingStyle: 'Intuitive, emotional, and memory-based. Thinks through feelings and past experiences.',
    communicationStyle: 'Nurturing, protective, and often indirect. May communicate through caring actions rather than words.',
    challenges: [
      'Thinking colored by emotions',
      'Can be moody in communication',
      'May hold onto past hurts in thinking',
      'Difficulty with objective analysis'
    ],
    gifts: [
      'Emotional intelligence',
      'Excellent memory especially for feelings',
      'Intuitive understanding of others',
      'Nurturing communication style'
    ]
  },
  Leo: {
    sign: 'Leo',
    mindset: 'The Creative Mind',
    thinkingStyle: 'Creative, dramatic, and confident. Thinks in terms of self-expression and impact.',
    communicationStyle: 'Expressive, warm, and attention-getting. Natural storyteller. Speaks with confidence and flair.',
    challenges: [
      'May dominate conversations',
      'Ego can cloud judgment',
      'Difficulty accepting criticism',
      'May exaggerate or dramatize'
    ],
    gifts: [
      'Inspiring and motivating speaker',
      'Creative and original thinking',
      'Natural confidence in expression',
      'Ability to make others feel special'
    ]
  },
  Virgo: {
    sign: 'Virgo',
    mindset: 'The Analytical Mind',
    thinkingStyle: 'Precise, analytical, and detail-oriented. Thinks in terms of improvement and perfection.',
    communicationStyle: 'Careful, precise, and helpful. May critique or offer solutions. Excellent editor and organizer of information.',
    challenges: [
      'Overly critical of self and others',
      'Anxiety and worry in thinking',
      'Can get lost in details',
      'Perfectionism that blocks communication'
    ],
    gifts: [
      'Excellent problem-solving ability',
      'Attention to detail',
      'Practical and helpful communication',
      'Ability to improve and refine ideas'
    ]
  },
  Libra: {
    sign: 'Libra',
    mindset: 'The Diplomatic Mind',
    thinkingStyle: 'Balanced, fair, and relationship-oriented. Considers multiple perspectives before deciding.',
    communicationStyle: 'Charming, diplomatic, and focused on harmony. Excellent mediator. May avoid conflict in communication.',
    challenges: [
      'Indecisive - can see all sides too well',
      'May compromise truth for harmony',
      'Can be superficial to keep peace',
      'Difficulty with direct confrontation'
    ],
    gifts: [
      'Natural diplomat and peacemaker',
      'Ability to see all perspectives',
      'Charming and engaging speaker',
      'Creates harmony in communication'
    ]
  },
  Scorpio: {
    sign: 'Scorpio',
    mindset: 'The Investigative Mind',
    thinkingStyle: 'Deep, penetrating, and investigative. Thinks in terms of hidden truths and transformation.',
    communicationStyle: 'Intense, probing, and often secretive. Speaks with power and purpose. Excellent at uncovering truth.',
    challenges: [
      'Suspicious or paranoid thinking',
      'Can be manipulative with information',
      'Difficulty with surface-level conversation',
      'May use words as weapons'
    ],
    gifts: [
      'Ability to see beneath the surface',
      'Powerful and transformative communication',
      'Excellent researcher and investigator',
      'Speaks with depth and meaning'
    ]
  },
  Sagittarius: {
    sign: 'Sagittarius',
    mindset: 'The Philosophical Mind',
    thinkingStyle: 'Big-picture, philosophical, and optimistic. Thinks in terms of meaning, truth, and expansion.',
    communicationStyle: 'Enthusiastic, honest, and expansive. Natural teacher and storyteller. May be blunt or tactless.',
    challenges: [
      'Overlooks details for big picture',
      'Foot-in-mouth syndrome - too blunt',
      'May exaggerate or overpromise',
      'Impatient with practical matters'
    ],
    gifts: [
      'Inspiring and uplifting speaker',
      'Sees the larger meaning and purpose',
      'Natural teacher and philosopher',
      'Optimistic and encouraging'
    ]
  },
  Capricorn: {
    sign: 'Capricorn',
    mindset: 'The Strategic Mind',
    thinkingStyle: 'Practical, strategic, and goal-oriented. Thinks in terms of achievement and long-term results.',
    communicationStyle: 'Reserved, authoritative, and businesslike. Speaks with purpose and efficiency. Values substance over style.',
    challenges: [
      'Can be too serious or pessimistic',
      'Difficulty with playful communication',
      'May dismiss emotional considerations',
      'Can seem cold or calculating'
    ],
    gifts: [
      'Excellent strategic thinking',
      'Authoritative and credible speaker',
      'Practical and realistic perspective',
      'Ability to plan and execute'
    ]
  },
  Aquarius: {
    sign: 'Aquarius',
    mindset: 'The Revolutionary Mind',
    thinkingStyle: 'Original, innovative, and humanitarian. Thinks in terms of progress and the collective good.',
    communicationStyle: 'Unique, progressive, and sometimes shocking. Speaks for the underdog. May seem detached or eccentric.',
    challenges: [
      'Can be too detached or impersonal',
      'May seem aloof or uncaring',
      'Difficulty with emotional communication',
      'Can be stubborn about ideas'
    ],
    gifts: [
      'Original and innovative thinking',
      'Ability to see future possibilities',
      'Speaks for the collective good',
      'Comfortable with unconventional ideas'
    ]
  },
  Pisces: {
    sign: 'Pisces',
    mindset: 'The Intuitive Mind',
    thinkingStyle: 'Imaginative, intuitive, and dreamy. Thinks in images, feelings, and spiritual impressions.',
    communicationStyle: 'Poetic, compassionate, and sometimes vague. May communicate through art, music, or silence.',
    challenges: [
      'Difficulty with clear, logical thinking',
      'May escape into fantasy',
      'Can be confused or unclear',
      'Difficulty with boundaries in communication'
    ],
    gifts: [
      'Deeply intuitive and psychic',
      'Creative and artistic expression',
      'Compassionate and understanding listener',
      'Speaks the language of the soul'
    ]
  }
};

// ============================================================================
// SATURN: YOUR SOUL'S PURPOSE (Debra Silverman)
// ============================================================================

export interface SaturnTeaching {
  sign: string;
  soulPurpose: string;
  lifeLesson: string;
  directive: string;
  challenge: string;
  mastery: string;
  questions: string[];
  firstReturn: string;
  secondReturn: string;
  // Liz Greene "Beast & Prince" framework
  beast: string;       // unconscious/shadow expression
  prince: string;      // conscious/gold expression  
  greeneInsight: string; // key psychological insight from the book
}

// Liz Greene "Beast & Prince" Saturn in Houses data
export interface SaturnHouseGreene {
  house: number;
  beast: string;
  prince: string;
  greeneInsight: string;
  coreWound: string;
  goldPotential: string;
}

export const SATURN_IN_HOUSES_GREENE: Record<number, SaturnHouseGreene> = {
  1: {
    house: 1,
    beast: 'Deep insecurity about the right to exist. A sense that you must earn the right to take up space. Self-consciousness, shyness, or overcompensation through rigid self-control. You may feel like the world is hostile and that you must defend yourself at every turn.',
    prince: 'Hard-won self-authority and a presence that commands respect without demanding it. You become your own authority figure — someone whose identity was forged in fire and is therefore unshakeable. Leadership through earned wisdom, not inherited privilege.',
    greeneInsight: 'Saturn in the 1st house creates a personality built through effort rather than ease. The individual must construct their sense of self consciously, brick by brick, which ultimately produces a far more durable and authentic identity than one that came without struggle.',
    coreWound: 'Feeling invisible, inadequate, or "not enough" — as if your very existence requires justification.',
    goldPotential: 'A self-made identity of extraordinary integrity. You become the person others turn to for strength because yours was hard-won.',
  },
  2: {
    house: 2,
    beast: 'Intense anxiety about money, resources, and survival. A feeling that you never have enough — or that what you have could be taken away at any moment. You may hoard, or conversely, be reckless with money as a way of proving you don\'t need it.',
    prince: 'A profound understanding of true value — both material and spiritual. You learn that real security comes from within, and once this is internalized, you often become remarkably capable with resources. Patience and persistence in building lasting wealth.',
    greeneInsight: 'Saturn in the 2nd attempts to make tangible what is essentially an inner sense of worth. The translation usually fails because material things cannot satisfy an emotional need. The real work is building an unshakeable sense of self-value.',
    coreWound: 'Feeling worthless or undeserving. A deep fear that without money or possessions, you are nothing.',
    goldPotential: 'Mastery over the material world, combined with the wisdom to know what is truly valuable.',
  },
  3: {
    house: 3,
    beast: 'Difficulty expressing ideas freely. A feeling that your thoughts are not valued, or that you must have absolute authority before speaking. Shyness in communication, or conversely, rigid opinions that mask deep intellectual insecurity. Difficult sibling relationships.',
    prince: 'A powerful and precise communicator whose words carry weight precisely because they were earned through struggle. Depth of thought, careful reasoning, and the ability to teach complex subjects with authority.',
    greeneInsight: 'Saturn in the 3rd creates a mind that feels inadequate yet works harder than any other to compensate. The result is often someone who becomes an authority in precisely the area where they once felt most inferior.',
    coreWound: 'Feeling stupid, unheard, or intellectually inadequate. Early experiences of being silenced or dismissed.',
    goldPotential: 'Mastery of communication and thought. The teacher who earns authority through deep, disciplined study.',
  },
  4: {
    house: 4,
    beast: 'A sense of being emotionally unsupported in childhood. The father may have been cold, absent, authoritarian, or simply unable to provide emotional warmth. This creates a deep mistrust of emotional intimacy and a craving for security that can never quite be satisfied through external means. Compulsive need to accumulate land or property.',
    prince: 'The ability to become your own inner parent — to provide yourself the emotional foundation that was missing. Once the wound is understood, you develop extraordinary inner strength and the capacity to create genuine sanctuary for yourself and others.',
    greeneInsight: 'Saturn in the 4th works as an unconscious factor from the plane of feelings. It can cripple emotional life for decades if not understood. The individual is never truly indifferent to family — something necessary for emotional development was missing, and the entire psyche develops lopsided to compensate.',
    coreWound: 'Feeling unloved, unwanted, or emotionally abandoned. A sense that home was never truly safe.',
    goldPotential: 'Becoming your own authority on emotional matters. Creating the family and home you never had — from the inside out.',
  },
  5: {
    house: 5,
    beast: 'Fear of self-expression, creativity, and spontaneous joy. A sense that play is irresponsible and that one must always be productive. Difficulty with romance — either avoiding it entirely or pursuing it with desperate intensity. Creative blocks rooted in fear of judgment.',
    prince: 'Disciplined creativity that produces lasting works. Love that deepens with time rather than burning out. The ability to play with purpose and to find joy in the process of mastering a craft. Mature, faithful romantic partnerships.',
    greeneInsight: 'Saturn in the 5th restricts the natural child within — the capacity for spontaneous joy and creative expression. Yet the individual who works through this restriction often becomes the most disciplined artist or the most faithful lover, precisely because nothing came without effort.',
    coreWound: 'Feeling that joy and pleasure are not allowed. That you must earn the right to play, create, or be loved.',
    goldPotential: 'Creative mastery achieved through discipline. The ability to bring structure to inspiration and produce enduring works.',
  },
  6: {
    house: 6,
    beast: 'Obsessive concern with health, work routine, and perfection. A feeling of being trapped in meaningless labor. Psychosomatic illness as a way of avoiding the deeper need for integration. Compulsive ordering of the external environment while inner chaos reigns.',
    prince: 'True service — not "good works" done for approval, but an innate quality of inner alignment where mind, body, and spirit work as one. Real healing ability. The capacity to order one\'s life as a sacred practice.',
    greeneInsight: 'Saturn in the 6th reflects an imperative need for inner integration which, if avoided, may produce illness and, if forced into a material channel, may produce frustration and depression. The gold is the power to synthesize mind and body into a finely balanced vehicle.',
    coreWound: 'Feeling stuck in a rut, imprisoned by routine, unable to find meaning in daily work.',
    goldPotential: 'Genuine healing ability and the wisdom to serve from a place of inner balance rather than obligation.',
  },
  7: {
    house: 7,
    beast: 'Difficulty in relationships — either avoiding commitment entirely or entering partnerships with much older, authoritarian, or cold partners. Projecting one\'s inner authority onto others and then resenting their control. Marriage as duty rather than love.',
    prince: 'Deep, committed partnerships built on mutual respect and earned trust. The ability to be a true equal in relationship — neither dominant nor submissive. Loyalty and faithfulness that comes from understanding what love truly costs.',
    greeneInsight: 'Saturn in the 7th often attracts Saturnian partners — those who are older, more authoritative, or more restrictive — because the individual has not yet claimed their own inner authority in relationship. Once this projection is withdrawn, partnerships become genuinely equal.',
    coreWound: 'Feeling unworthy of love, or believing that relationships always require sacrifice and suffering.',
    goldPotential: 'Mature, enduring partnerships. The wisdom to love without losing yourself.',
  },
  8: {
    house: 8,
    beast: 'Fear of emotional and sexual vulnerability. Difficulty trusting others with your deepest feelings. Control issues around shared resources, inheritance, and intimacy. A fascination with death and taboo that is simultaneously compelling and terrifying.',
    prince: 'Profound psychological depth and the ability to guide others through their own transformations. Mastery of emotional and financial power through understanding rather than control. The courage to face death — psychological and literal — without flinching.',
    greeneInsight: 'Saturn in the 8th demands that the individual confront the shared world of emotions, finances, and sexuality with honesty. The fear is of being consumed or controlled by another\'s power; the gold is discovering that true power comes from the willingness to be vulnerable.',
    coreWound: 'Fear of being emotionally or financially consumed by others. Trust issues at the deepest level.',
    goldPotential: 'The capacity for genuine intimacy and shared power. The therapist, the guide through the underworld.',
  },
  9: {
    house: 9,
    beast: 'Rigid belief systems or, conversely, a complete lack of faith. Fear of the unknown, of travel, of expanding beyond the familiar. Dogmatism that masks a terror of meaninglessness. Using philosophy or religion as armor rather than illumination.',
    prince: 'Hard-won wisdom and a personal philosophy forged through experience, not borrowed from books. The ability to teach from lived truth. A faith that has been tested and therefore cannot be shaken by circumstance.',
    greeneInsight: 'Saturn in the 9th limits the natural expansiveness of belief until the individual earns their own truth through direct experience. The resulting philosophy is far more genuine and powerful than any inherited belief system could ever be.',
    coreWound: 'Feeling that the universe is meaningless, or that truth is always just out of reach.',
    goldPotential: 'Becoming a genuine teacher of wisdom earned through life experience rather than academic study.',
  },
  10: {
    house: 10,
    beast: 'Intense ambition driven by a deep need to prove yourself — often to a mother who was cold, controlling, or who shaped your social attitudes with an iron will. Fear of failure so intense it can paralyze. Workaholism as identity.',
    prince: 'Earned authority and lasting achievement. The capacity to build something of real value in the world — not for applause, but because mastery itself is the reward. Leadership that inspires through example and integrity.',
    greeneInsight: 'Saturn in the 10th — Saturn\'s own house — shows ambition running in direct proportion to the suppression of identity in early life. The drive to achieve is ultimately a drive to prove that you exist, that you matter. When this is understood, achievement becomes joyful rather than desperate.',
    coreWound: 'Feeling that you must achieve to be worthy of love. That failure means annihilation.',
    goldPotential: 'True mastery and earned respect. The elder whose authority comes from integrity, not position.',
  },
  11: {
    house: 11,
    beast: 'Difficulty belonging to groups. Feeling like a perpetual outsider, unable to find your "tribe." Fear that your ideals are foolish or impractical. Loneliness within crowds. Friendships that feel obligatory rather than nourishing.',
    prince: 'The ability to lead communities with wisdom and to hold space for collective vision. Friendships built on genuine respect rather than social convenience. The capacity to turn idealistic visions into practical realities.',
    greeneInsight: 'Saturn in the 11th creates a person who feels excluded from the group — yet it is precisely this outsider status that eventually allows them to lead it. Their vision for the collective is grounded in hard experience rather than naive idealism.',
    coreWound: 'Feeling that you don\'t belong anywhere. That your vision for a better world is foolish.',
    goldPotential: 'Community leadership grounded in experience. The reformer who builds lasting structures for collective good.',
  },
  12: {
    house: 12,
    beast: 'A vague, generalized fear that fate or destiny will destroy you. Isolation, helplessness, and the feeling that you are powerless against forces larger than yourself. Guilt that has no specific source. Self-undoing through unconscious patterns.',
    prince: 'The power to serve — not to "do good" (which is not service at all) but to experience genuine unity with life. The capacity for profound inner peace, meditation, and spiritual surrender. Wisdom that comes from releasing the need to control.',
    greeneInsight: 'Saturn in the 12th is the most difficult from the personality\'s perspective because the Saturnian defense mechanisms are rendered ineffectual. The individual must eventually sacrifice personal control — and this sacrifice, when willingly made, becomes the last door between the person and genuine inner freedom.',
    coreWound: 'Feeling helpless, isolated from life, unable to control your own destiny. Guilt without a name.',
    goldPotential: 'The mystic\'s inner peace. The capacity to serve life itself, not from obligation but from experienced unity.',
  },
};

// Saturn aspect Beast/Prince interpretations from Liz Greene
export interface SaturnAspectGreene {
  planets: string;
  beast: string;
  prince: string;
  greeneInsight: string;
}

export const SATURN_ASPECTS_GREENE: Record<string, SaturnAspectGreene> = {
  'Saturn-Sun': {
    planets: 'Saturn-Sun',
    beast: 'A crushing inner authority figure that undermines confidence and vitality. You may feel that the father — or life itself — disapproves of who you are. Chronic self-doubt, heaviness, and a feeling that joy is not permitted. You work compulsively to earn the right to exist.',
    prince: 'Self-mastery and earned authority. Once you stop trying to win the approval of the inner father, you become your own authority — disciplined, reliable, and capable of lasting achievement. Your light shines steadier and longer than those who never had to fight for it.',
    greeneInsight: 'Saturn-Sun aspects create a fundamental tension between the ego\'s need to shine and Saturn\'s demand that nothing be given freely. The father is often experienced as cold, critical, or absent. The individual must eventually become their own father — providing the structure and approval they never received.',
  },
  'Saturn-Moon': {
    planets: 'Saturn-Moon',
    beast: 'Emotional suppression and a deep fear of vulnerability. The mother may have been cold, depressed, or emotionally unavailable, teaching the child that feelings are dangerous. You may control your emotions rigidly, creating an interior desert while longing desperately for warmth.',
    prince: 'Emotional maturity and the ability to hold space for deep feeling without being destroyed by it. You become someone others trust with their pain because you have learned to contain your own. Genuine emotional wisdom earned through suffering.',
    greeneInsight: 'Saturn-Moon contacts are among the most painful because they strike at the root of emotional security. The individual learns early that emotional needs will not be met and develops elaborate defenses. The gold emerges when these defenses are consciously recognized and gradually softened.',
  },
  'Saturn-Mercury': {
    planets: 'Saturn-Mercury',
    beast: 'Mental rigidity, pessimistic thinking, and a fear of being intellectually inadequate. You may have been told you were stupid, or your ideas were dismissed in childhood. This creates either painful shyness in communication or an overcompensating need to be the smartest person in the room.',
    prince: 'A powerful, disciplined mind capable of deep concentration and structured thinking. Your words carry weight because they are chosen carefully. The scholar, the strategist, the person whose intellectual authority is beyond question because it was built through years of patient effort.',
    greeneInsight: 'Saturn-Mercury aspects often produce the most serious and careful thinkers, precisely because the mind was never allowed to be lazy. What begins as intellectual insecurity becomes intellectual mastery through sheer determination.',
  },
  'Saturn-Venus': {
    planets: 'Saturn-Venus',
    beast: 'A deep fear of not being lovable. Difficulty receiving affection, or choosing partners who are cold, unavailable, or punishing. You may sacrifice pleasure and beauty for duty, believing you don\'t deserve joy. Loneliness that feels permanent.',
    prince: 'Love that endures and deepens with time. Loyalty and faithfulness that is not naive but earned through understanding what love truly costs. An appreciation for beauty that is refined rather than superficial. The capacity to create lasting art and lasting relationships.',
    greeneInsight: 'Saturn-Venus contacts often produce individuals who experience profound loneliness in youth but develop the most enduring and genuine capacity for love in maturity. The restriction teaches the true value of what is restricted.',
  },
  'Saturn-Mars': {
    planets: 'Saturn-Mars',
    beast: 'Frustration and suppressed anger. Your drive and initiative feel blocked at every turn. You may explode periodically after long periods of bottling up aggression, or you may turn the anger inward, creating depression and self-punishment. Fear of your own power.',
    prince: 'Controlled, strategic power. The capacity for sustained effort over long periods. Endurance, stamina, and the ability to work toward a goal with relentless patience. The warrior who has learned discipline — far more dangerous and effective than raw aggression.',
    greeneInsight: 'Saturn-Mars is often experienced as a brake on the accelerator — enormous energy that cannot find release. The key is learning that controlled force is exponentially more powerful than uncontrolled force. The individual must learn to express anger cleanly rather than swallowing it.',
  },
  'Saturn-Jupiter': {
    planets: 'Saturn-Jupiter',
    beast: 'A perpetual tension between optimism and pessimism, expansion and contraction. You start projects with enthusiasm and then abandon them when reality sets in. Or you never start at all, fearing that faith is foolish. Chronic dissatisfaction — nothing is ever enough, yet you\'re afraid to ask for more.',
    prince: 'The wisdom to balance vision with pragmatism. The ability to build big dreams on solid foundations. You become someone who can see the possibility AND the plan — the entrepreneur, the builder, the leader who knows when to expand and when to consolidate.',
    greeneInsight: 'Saturn-Jupiter is the great balancing act of the psyche. When these two are in harmony, the individual can achieve remarkable things because they combine faith with discipline. The tension between them is ultimately productive — it prevents both reckless overexpansion and paralyzing caution.',
  },
  'Saturn-Uranus': {
    planets: 'Saturn-Uranus',
    beast: 'A painful tension between the need for security and the need for freedom. You may swing between rigid conformity and explosive rebellion, never finding a middle ground. Fear of change combined with an equal fear of stagnation. Nervous anxiety from trying to control the uncontrollable.',
    prince: 'The capacity to reform systems from within — to innovate without destroying. You become someone who can bring the future into the present through disciplined, practical change. The revolutionary who builds rather than merely tears down.',
    greeneInsight: 'Saturn-Uranus aspects create individuals who are perpetually caught between the old and the new. The tension can be agonizing, but it also produces the most effective agents of change — those who understand both tradition and innovation.',
  },
  'Saturn-Neptune': {
    planets: 'Saturn-Neptune',
    beast: 'A painful collision between dreams and reality. Your ideals are perpetually crushed by circumstance, creating cynicism and disillusionment. You may feel that spiritual meaning is just an illusion, or conversely, escape into fantasy to avoid the harsh demands of the real world.',
    prince: 'The ability to give form to the formless — to bring spiritual vision into concrete reality. The artist who creates transcendent beauty within the constraints of a medium. The mystic who remains grounded. The healer who translates compassion into practical action.',
    greeneInsight: 'Saturn-Neptune is the alchemist\'s aspect — the marriage of lead and gold, matter and spirit. The suffering it produces is often the crucible in which genuine spiritual wisdom is forged. Neither pure idealism nor pure pragmatism works; only their synthesis produces gold.',
  },
  'Saturn-Pluto': {
    planets: 'Saturn-Pluto',
    beast: 'A confrontation with absolute power and absolute powerlessness. You may experience crushing external authority, systemic oppression, or situations where control is ripped away entirely. The response is often to become ruthlessly controlling yourself, or to collapse into helpless submission.',
    prince: 'The capacity to endure what would destroy others and to rebuild from total devastation. Profound psychological strength and the wisdom that comes from surviving the unsurvivable. You become someone who understands power at its deepest level — and uses it with integrity.',
    greeneInsight: 'Saturn-Pluto aspects bring the individual face to face with the darkest expressions of power. Whether this manifests as abuse, institutional control, or psychological crisis, the purpose is the same: to forge an individual who understands power so thoroughly that they can never be corrupted by it.',
  },
  'Saturn-Chiron': {
    planets: 'Saturn-Chiron',
    beast: 'The wound that becomes a wall. Your deepest pain solidifies into rigid structures — rules, defenses, and beliefs that protect you from ever being hurt again. But these same walls prevent healing, creating a cycle of chronic suffering that feels permanent and inescapable.',
    prince: 'The wounded healer whose authority comes from having fully faced their own pain. You become someone who can guide others through their darkest passages because you have navigated your own. Your wound becomes your teaching credential.',
    greeneInsight: 'Saturn-Chiron asks the individual to build something lasting from their deepest wound. The temptation is to wall off the pain, but the invitation is to make it the foundation of genuine wisdom and service to others.',
  },
};

export const SATURN_IN_SIGNS: Record<string, SaturnTeaching> = {
  Aries: {
    sign: 'Aries',
    soulPurpose: 'To learn courage and self-reliance. To act independently without waiting for permission.',
    lifeLesson: 'You are learning to trust your own initiative and take action even when afraid. The lesson is about healthy self-assertion and pioneering new paths.',
    directive: 'Take action. Don\'t wait for permission. Your spark comes from doing, not planning.',
    challenge: 'Fear of acting independently. Waiting for others to go first. Suppressed anger or aggression.',
    mastery: 'The ability to initiate action with wisdom. Courageous leadership tempered by experience.',
    questions: ['Where do you hold back from taking initiative?', 'What would you do if you weren\'t afraid?', 'How do you handle your anger?'],
    firstReturn: 'Major restructuring around identity and independence. Time to stop waiting for permission and become the leader of your own life.',
    secondReturn: 'Wisdom about when to act and when to wait. Teaching others about courage and initiative.',
    beast: 'Fear of asserting yourself, suppressed anger that erupts unpredictably, hiding behind passivity while secretly seething. You may let others go first in everything — jobs, relationships, arguments — and then resent them for it.',
    prince: 'Courageous, decisive leadership earned through overcoming deep self-doubt. Your initiative carries weight precisely because it was hard-won. You become the person who acts when everyone else freezes.',
    greeneInsight: 'Saturn in Aries creates the paradox of a warrior afraid of their own sword. The individual must learn that assertion is not aggression, and that the right to act does not need to be earned from anyone else.',
  },
  Taurus: {
    sign: 'Taurus',
    soulPurpose: 'To build lasting security through patience and persistence. To learn true self-worth.',
    lifeLesson: 'You are learning that real security comes from within, not from possessions. The lesson is about stability, self-worth, and building something that lasts.',
    directive: 'Ground yourself. Build something tangible. Trust the physical world and your own value.',
    challenge: 'Insecurity about money and resources. Stubbornness. Difficulty with change.',
    mastery: 'The ability to create lasting value. Patience that produces results. Unshakeable self-worth.',
    questions: ['What does security mean to you?', 'Where do you struggle with self-worth?', 'What are you building that will last?'],
    firstReturn: 'Major restructuring around values, money, and self-worth. Time to build a foundation that truly supports you.',
    secondReturn: 'Wisdom about what truly matters. Teaching others about patience and lasting value.',
    beast: 'Hoarding resources out of deep survival fear. Measuring your worth by what you own. Refusing to change or adapt because the unknown feels like annihilation. Financial anxiety that dominates your inner life.',
    prince: 'Profound understanding of true value — both material and spiritual. You build things that last because you understand the difference between having and being. Unshakeable inner worth that no external loss can touch.',
    greeneInsight: 'Saturn in Taurus attempts to make tangible what is essentially an inner sense of worth. Material things cannot satisfy an emotional need, but once the individual discovers that real security is internal, they often become remarkably capable with resources.',
  },
  Gemini: {
    sign: 'Gemini',
    soulPurpose: 'To master communication and commit to learning. To focus the mind and speak truth.',
    lifeLesson: 'You are learning to focus your scattered mind and complete what you start. The lesson is about clear communication and intellectual discipline.',
    directive: 'Focus your mind. Finish what you start. Speak your truth clearly.',
    challenge: 'Scattered energy. Difficulty completing projects. Superficial learning. Nervous anxiety.',
    mastery: 'The ability to communicate profound ideas clearly. Mental discipline with flexibility.',
    questions: ['What ideas do you need to commit to fully?', 'Where do you scatter your mental energy?', 'What truth needs to be spoken?'],
    firstReturn: 'Major restructuring around communication and learning. Time to focus your mind on what truly matters.',
    secondReturn: 'Wisdom about the power of words. Teaching others through clear, disciplined communication.',
    beast: 'Intellectual insecurity disguised as either painful shyness or compulsive over-talking. The feeling that your ideas are not good enough, that you must know everything before speaking. Nervous mental energy that never settles.',
    prince: 'A precise, authoritative communicator whose words carry weight. Your mental discipline produces deep understanding where others skim surfaces. You become the teacher, writer, or thinker whose ideas endure.',
    greeneInsight: 'Saturn in Gemini creates a mind that works harder than any other to compensate for a feeling of intellectual inadequacy. The result is often mastery of precisely the area where the individual once felt most inferior.',
  },
  Cancer: {
    sign: 'Cancer',
    soulPurpose: 'To create emotional security and nurture responsibly. To learn healthy boundaries in caring.',
    lifeLesson: 'You are learning to nurture without smothering and to create true emotional safety. The lesson is about family, belonging, and emotional maturity.',
    directive: 'Create a safe container. Nurture without attachment. Let go of the past.',
    challenge: 'Fear of abandonment. Over-protective tendencies. Difficulty letting go of family wounds.',
    mastery: 'The ability to create emotional safety for yourself and others. Nurturing with wisdom.',
    questions: ['What does home mean to you?', 'How do family patterns affect you now?', 'Where do you over-give or under-receive?'],
    firstReturn: 'Major restructuring around family and emotional patterns. Time to create your own definition of home.',
    secondReturn: 'Wisdom about emotional bonds. Becoming the wise elder of your family.',
    beast: 'Deep mistrust of emotional intimacy alongside a desperate craving for it. Coldness that masks vulnerability. A childhood where emotional support was absent — the father may have been cold, absent, or a burden. You may be inordinately tied to family or completely cut off.',
    prince: 'The ability to become your own inner parent. You develop extraordinary emotional strength precisely because nothing was given freely. You create genuine sanctuary — not from need, but from hard-won wisdom about what love truly requires.',
    greeneInsight: 'Saturn in Cancer works as an unconscious factor from the plane of feelings. Something necessary for emotional development was missing, and the entire psyche develops lopsided to compensate. The individual is never truly indifferent — the gold is learning to provide internally what was missing externally.',
  },
  Leo: {
    sign: 'Leo',
    soulPurpose: 'To develop authentic self-expression and creative authority. To shine without needing applause.',
    lifeLesson: 'You are learning authentic self-expression without seeking external validation. The lesson is about creative power and generous leadership.',
    directive: 'Express yourself authentically. Lead from the heart. Shine without needing permission.',
    challenge: 'Need for validation. Fear of being seen. Creative blocks. Pride that masks insecurity.',
    mastery: 'The ability to lead with warmth and creativity. Authentic self-expression that inspires others.',
    questions: ['Where do you hide your light?', 'What would you create if no one was watching?', 'How do you handle not being recognized?'],
    firstReturn: 'Major restructuring around self-expression and recognition. Time to stop performing and start being authentic.',
    secondReturn: 'Wisdom about true creative power. Teaching others to find their own light.',
    beast: 'Fear of being seen, or its opposite — a desperate need for recognition that never feels satisfied. Creative blocks rooted in shame. You may suppress your natural warmth and playfulness, believing joy is irresponsible.',
    prince: 'Disciplined creativity that produces lasting works of genuine beauty. Your self-expression carries authority because it cost you everything to find it. A warm, generous leader whose light is steady because it was hard-won.',
    greeneInsight: 'Saturn in Leo restricts the natural child within — the capacity for spontaneous joy and creative expression. The individual who works through this often becomes the most disciplined artist or most faithful lover, because nothing came without effort.',
  },
  Virgo: {
    sign: 'Virgo',
    soulPurpose: 'To perfect your skills and serve with practical wisdom. To learn when good enough is perfect.',
    lifeLesson: 'You are learning when "good enough" is perfect and how to serve without martyrdom. The lesson is about practical mastery and healthy service.',
    directive: 'Master your craft. Serve with boundaries. Trust that imperfection is human.',
    challenge: 'Perfectionism. Self-criticism. Worrying about details. Difficulty receiving help.',
    mastery: 'The ability to discern what truly needs fixing. Service that heals without depleting.',
    questions: ['Where is your inner critic too harsh?', 'What would "good enough" look like?', 'How do you serve without losing yourself?'],
    firstReturn: 'Major restructuring around work, health, and service. Time to find the balance between excellence and self-acceptance.',
    secondReturn: 'Wisdom about practical mastery. Teaching others through grounded, helpful guidance.',
    beast: 'Obsessive perfectionism and compulsive ordering of the external environment while inner chaos reigns. Psychosomatic illness as avoidance. Feeling trapped in meaningless routine. A deep anxiety over physical or mental disintegration.',
    prince: 'True service — not "good works" done for approval, but inner alignment where mind, body, and spirit work as one. Genuine healing ability. The capacity to integrate yourself so thoroughly that you become a conduit for others\' healing.',
    greeneInsight: 'Saturn in Virgo reflects an imperative need for inner integration which, if avoided, produces illness, and if forced into a material channel, produces frustration. The gold is making mind and body not two interrelated things but one — a finely balanced vehicle for the inner self.',
  },
  Libra: {
    sign: 'Libra',
    soulPurpose: 'To master relationships and create balanced partnerships. To be fair to yourself and others.',
    lifeLesson: 'You are learning balance in relationships and how to be fair to yourself AND others. The lesson is about partnership, justice, and harmony.',
    directive: 'Balance self and other. Speak up for yourself. Create harmony without losing yourself.',
    challenge: 'People-pleasing. Indecision. Avoiding conflict at any cost. Losing self in relationships.',
    mastery: 'The ability to create true partnership. Diplomacy that serves justice and beauty.',
    questions: ['Where do you lose yourself in relationships?', 'What conflict are you avoiding?', 'How do you balance your needs with others?'],
    firstReturn: 'Major restructuring around relationships and fairness. Time to stop people-pleasing and create true balance.',
    secondReturn: 'Wisdom about partnership. Teaching others about justice, beauty, and relating.',
    beast: 'Attracting controlling or cold partners because you haven\'t claimed your own inner authority in relationship. Giving away your power to keep the peace. Marriage as duty rather than joy. A terror of being alone that drives you into one-sided partnerships.',
    prince: 'Genuine partnership between equals. You develop the rare ability to be both independent and intimately connected. Your relationships are built on earned mutual respect, not need or obligation.',
    greeneInsight: 'Saturn in Libra often attracts Saturnian partners — older, more authoritative, or restrictive — because the individual has not yet claimed their own authority in relationship. Once this projection is withdrawn, partnerships become genuinely balanced.',
  },
  Scorpio: {
    sign: 'Scorpio',
    soulPurpose: 'To transform through facing shadows and sharing resources. To trust and be trusted.',
    lifeLesson: 'You are learning to trust, transform, and share power appropriately. The lesson is about intimacy, death/rebirth, and emotional honesty.',
    directive: 'Face your shadows. Transform what needs to die. Trust deeply—and wisely.',
    challenge: 'Control issues. Fear of vulnerability. Difficulty trusting. Holding onto resentments.',
    mastery: 'The ability to transform crisis into growth. Deep intimacy with appropriate boundaries.',
    questions: ['What are you afraid to let go of?', 'Where do control issues show up?', 'What needs to die so something new can be born?'],
    firstReturn: 'Major restructuring around trust, power, and intimacy. Time to face your shadows and transform.',
    secondReturn: 'Wisdom about transformation. Teaching others about the power of letting go.',
    beast: 'Fear of emotional and sexual vulnerability so intense that you build walls of control around your deepest self. You may manipulate others to avoid being manipulated yourself, or withdraw completely from intimacy. A fascination with power that terrifies you.',
    prince: 'Profound psychological depth and the courage to face what others flee from. You become the guide through the underworld — the therapist, the healer, the one who can hold space for the darkest human experiences without flinching.',
    greeneInsight: 'Saturn in Scorpio demands that the individual confront the shared world of emotions, sexuality, and power with total honesty. The fear is of being consumed; the gold is discovering that true power comes from the willingness to be completely vulnerable.',
  },
  Sagittarius: {
    sign: 'Sagittarius',
    soulPurpose: 'To develop wisdom through experience and honest seeking. To commit to truth.',
    lifeLesson: 'You are learning to commit to your truth and follow through on your ideals. The lesson is about meaning, faith, and the pursuit of wisdom.',
    directive: 'Seek meaning, not just experience. Commit to your truth. Walk your talk.',
    challenge: 'Overcommitting and under-delivering. Escaping through adventure. Preaching without practicing.',
    mastery: 'The ability to teach from lived experience. Optimism grounded in reality.',
    questions: ['What do you truly believe?', 'Where do you escape instead of committing?', 'How do you walk your talk?'],
    firstReturn: 'Major restructuring around beliefs and purpose. Time to commit to your truth and stop running.',
    secondReturn: 'Wisdom about meaning and faith. Becoming the teacher and philosopher.',
    beast: 'Rigid belief systems that mask a terror of meaninglessness, or a complete collapse of faith. Using philosophy, religion, or adventure as armor against the emptiness. Dogmatism that refuses to question its own assumptions.',
    prince: 'A personal philosophy forged through direct experience, not borrowed from books. Your faith has been tested and therefore cannot be shaken. You become the genuine teacher — one who speaks from lived truth, not theory.',
    greeneInsight: 'Saturn in Sagittarius limits the natural expansiveness of belief until the individual earns their own truth through experience. The resulting philosophy is far more genuine and powerful than any inherited belief system.',
  },
  Capricorn: {
    sign: 'Capricorn',
    soulPurpose: 'To achieve mastery through discipline and integrity. To lead with responsibility.',
    lifeLesson: 'You are learning mastery through consistent effort and responsible leadership. The lesson is about achievement, authority, and integrity.',
    directive: 'Build your legacy. Lead by example. Master your craft through steady effort.',
    challenge: 'Fear of failure. Over-responsibility. Coldness or emotional restriction. Workaholic tendencies.',
    mastery: 'The ability to achieve lasting success with integrity. Leadership that earns respect.',
    questions: ['What legacy do you want to leave?', 'Where do you fear failure?', 'How do you balance achievement with connection?'],
    firstReturn: 'Major restructuring around career and authority. Time to become your own authority figure.',
    secondReturn: 'Wisdom about true success. Teaching others about integrity and lasting achievement.',
    beast: 'Ambition so intense it consumes everything else — relationships, joy, spontaneity. A fear of failure so deep it can paralyze. You may justify any means by the end, overcompensating for a childhood where your identity was suppressed by becoming ruthlessly driven.',
    prince: 'Earned mastery and natural authority that inspires rather than intimidates. You become the elder whose leadership comes from integrity, not position. Achievement becomes joyful rather than desperate once you stop proving yourself.',
    greeneInsight: 'Saturn in Capricorn — his own sign — shows ambition running in direct proportion to the suppression of identity in early life. The drive to achieve is ultimately a drive to prove that you exist, that you matter. When understood, achievement becomes an expression of joy rather than desperation.',
  },
  Aquarius: {
    sign: 'Aquarius',
    soulPurpose: 'To bring your unconventional ideas into forms that actually help people. To stop choosing between fitting in and standing out.',
    lifeLesson: 'You are learning that your "weird" is your superpower — but only when you channel it into something concrete. The lesson is turning brilliant ideas into real-world results, and letting people in close enough to collaborate.',
    directive: 'Pick ONE idea you believe in and build it. Stop theorizing and start doing. Let people help you — their input won\'t dilute your vision, it\'ll ground it.',
    challenge: 'Feeling alienated. Rebellion for its own sake. Detachment from emotions. Fear of intimacy.',
    mastery: 'The ability to bring innovative ideas into practical form. Community leadership.',
    questions: ['Where do you feel like an outsider?', 'How do you balance individuality with belonging?', 'What vision do you have for the future?'],
    firstReturn: 'Major restructuring around individuality and community. Time to find your tribe while being yourself.',
    secondReturn: 'Wisdom about innovation and humanity. Teaching others about the future.',
    beast: 'Chronic outsider syndrome — feeling that you don\'t belong anywhere. Rebellion that destroys rather than reforms. Emotional detachment disguised as independence. Using ideology to avoid genuine human connection.',
    prince: 'The capacity to lead communities with wisdom grounded in experience, not naive idealism. You become the reformer who builds lasting structures for collective good — precisely because your outsider perspective lets you see what insiders miss.',
    greeneInsight: 'Saturn in Aquarius creates a person who feels excluded from the group, yet it is precisely this outsider status that eventually allows them to lead it. Their vision for the collective is grounded in hard experience rather than utopian fantasy.',
  },
  Pisces: {
    sign: 'Pisces',
    soulPurpose: 'To bring spiritual wisdom into practical form. To serve with healthy boundaries.',
    lifeLesson: 'You are learning healthy boundaries while maintaining compassion and spiritual connection. The lesson is about faith, surrender, and transcendence.',
    directive: 'Trust your intuition. Your sensitive, intuitive mind is not a weakness—it is a gift that must be disciplined, trusted, and expressed with courage.',
    challenge: 'Escapism. Martyrdom. Boundary confusion. Difficulty with practical reality.',
    mastery: 'The ability to be in the world but not of it. Spiritual service with groundedness.',
    questions: ['Where do you escape instead of facing reality?', 'How do you maintain boundaries while staying compassionate?', 'What is your spiritual practice?'],
    firstReturn: 'Major restructuring around spirituality and service. Time to ground your dreams in reality.',
    secondReturn: 'Wisdom about the nature of existence. Becoming the mystic and healer.',
    beast: 'A vague fear that fate will destroy you. Isolation, helplessness, and guilt without a specific source. Escapism through substances, fantasy, or self-sacrifice. You may dedicate your life to caring for others at the cost of your own development — not from genuine service but from fear of facing your own life.',
    prince: 'The power to serve life itself — not to "do good," which is not service at all, but to experience genuine unity with existence. Inner peace, meditation, and spiritual surrender become your greatest strengths. The last door between you and real freedom.',
    greeneInsight: 'Saturn in Pisces is most difficult from the personality\'s perspective because Saturnian defenses are rendered ineffectual. The individual must eventually sacrifice personal control, and this sacrifice, when willingly made, becomes the gateway to genuine inner freedom and spiritual wisdom.',
  }
};

export const getSaturnTeaching = (sign: string): SaturnTeaching | undefined => {
  return SATURN_IN_SIGNS[sign];
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getElementTeaching = (element: string): ElementTeaching | undefined => {
  return ELEMENT_TEACHINGS[element];
};

export const getMercuryInSign = (sign: string): MercuryInSign | undefined => {
  return MERCURY_IN_SIGNS[sign];
};

export const getElementForSign = (sign: string): string => {
  const fireSignss = ['Aries', 'Leo', 'Sagittarius'];
  const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
  const airSigns = ['Gemini', 'Libra', 'Aquarius'];
  const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];
  
  if (fireSignss.includes(sign)) return 'Fire';
  if (earthSigns.includes(sign)) return 'Earth';
  if (airSigns.includes(sign)) return 'Air';
  if (waterSigns.includes(sign)) return 'Water';
  return 'Unknown';
};

// Daily Element Cycle
export const DAILY_ELEMENT_CYCLE = {
  morning: {
    element: 'Water',
    activities: 'Go to the bathroom, wash face, take a shower, make tea or coffee, have juice',
    description: 'We begin every morning with a Water cycle'
  },
  midMorning: {
    element: 'Air',
    activities: 'Check calendars, make lists, check email, communicate - What is on my list today? Who do I need to call?',
    description: 'After water comes the Air cycle of planning and communication'
  },
  afternoon: {
    element: 'Earth',
    activities: 'Accomplish items on list, dotting i\'s, crossing T\'s, making sure everything is completed, doing work',
    description: 'The Earth cycle is when we do the actual work and manifest'
  },
  evening: {
    element: 'Fire',
    activities: 'Gather around stove, share day, sit by hearth, celebration, joy, or venting frustrations',
    description: 'In the evening, we enter the Fire cycle of warmth and sharing'
  }
};

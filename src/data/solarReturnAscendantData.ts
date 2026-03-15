// ─── SR Ascendant Sign Extended Interpretations ─────────────────────
// Sources: "A Complete Guide on Solar Returns" (Cafe Astrology), Brian Clark
// Attribution preserved per source.

export interface SRAscendantInterp {
  sign: string;
  overview: string;
  temperament: string;
  health: string;
  relationships: string;
  source: string;
}

export const SR_ASCENDANT_SIGN: Record<string, SRAscendantInterp> = {
  Aries: {
    sign: 'Aries',
    overview: 'This year will bring new initiatives and projects. You will feel the desire to undertake new enterprises and take a new path. You will also feel impatient with your usual daily routine. If you are calm and slow by nature, this influence will make you more energetic, but if you are already a very active person, you will become more aggressive, perhaps even explosive and argumentative. You will definitely be energized this year.',
    temperament: 'If you would like to make a radical change in your life, or just want to assert your individuality more, this is the year to do it. The Mars energy will give you more courage and the will to take action, but you can also be more prone to accidents because you act hastily or impulsively, not thinking before you leap. Your own personal needs are more important to you at this time than the needs of others. You will also feel the desire to impose your opinions and will on others.',
    health: 'Under this influence you will feel stronger and more energetic. It would be a good time to take care of any health problem that arises. However, it is not a good year to have surgery if it can be put off. It would be advisable to engage in some physical activity or sport during this year. You may suffer from fevers or headaches more frequently.',
    relationships: 'During this period you may find yourself wanting to spend time with Libra friends and associates as they can be a calming influence on you. It is possible for you to get involved in a new romantic relationship or better your relationships with business associates.',
    source: 'Complete Guide on Solar Returns',
  },
  Taurus: {
    sign: 'Taurus',
    overview: 'Material matters will be very important to you this year. This is a favorable period for increasing your financial position. You may start looking for new ways to increase your income and, if other indications are favorable, you will find the means to do so. You could find yourself being more realistic and stubborn than usual. You will be more tenacious and persevering in pursuing your dreams.',
    temperament: 'It is important not to be so obstinate and unwilling to compromise that you cause undue tension and resentment in others. You may find yourself having the desire to acquire beautiful or expensive things. This year will bring you in contact with practical people with whom you could possibly form a productive business arrangement. If you have artistic inclinations, it will be a positive year for expanding your creative talents.',
    health: 'Physically, Taurus rules the throat, the neck, the vocal cords and the thyroid glands. You will be more inclined to have sore throats, colds, or laryngitis. You may be more tempted than usual to over-indulge in rich foods which could cause you to gain unwanted weight.',
    relationships: 'During this period you will find yourself wanting more stability in your life. Emotionally you could experience contradictory feelings. You will find yourself encountering Scorpio types of people who could have a strong influence on you. Be careful not to get involved in scenarios which create tension, jealousy or possessiveness.',
    source: 'Complete Guide on Solar Returns',
  },
  Gemini: {
    sign: 'Gemini',
    overview: 'You won\'t be bored this year as it promises to bring a great deal of diverse activities, perhaps too many interests for you to choose from. There will be a tendency to start many things without being able to finish them. Short trips and more moving around than you usually do will be favorable during this period.',
    temperament: 'Your mental and intellectual activity will be increased, causing a desire to engage in some type of learning. Your mind will be very alert, clear and quick, enabling you to find immediate solutions to the problems that may arise. If by nature you are calm and easy going, this year you will accelerate and become more talkative and curious. The emphasis is on positive communication with many people on a daily basis.',
    health: 'Due to the fact that you will probably be more tense and restless than usual, it is important that you guard against possible health problems, such as respiratory difficulties like colds, flu, pulmonary congestion and bronchitis, by getting adequate exercise and relaxation.',
    relationships: 'You will tend to meet people who have different beliefs than you who will open up new possibilities. You will be especially attracted to Sagittarians who will be a positive influence on you. This general uncertainty has the same effect on your love life, where it could produce changes or even new conquests.',
    source: 'Complete Guide on Solar Returns',
  },
  Cancer: {
    sign: 'Cancer',
    overview: 'This year domestic and family matters will be of great importance to you. It may bring up memories of your relationship with your parents and the effect they had on you. Your sensitivity will increase considerably and you will be more susceptible to sudden, unexpected mood changes. You will be more emotional than usual and more likely to express these feelings openly.',
    temperament: 'During this period you could be confronted with an act or circumstance that touches you deeply. Although the result may not be completely favorable, you will realize that it is necessary for your growth. Be aware that you could be more trusting than usual, thereby exposing yourself to undue pain or suffering.',
    health: 'During this period you may have some digestive problems brought on by too much anxiety or hypersensitivity. It is important that you don\'t eat when you feel tense. Avoid red meats and fried or very oily foods that are difficult to digest. In women, this influence can increase fertility and the possibility of pregnancy.',
    relationships: 'If you are involved in politics, this will be a good year to get more involved. It is also a good time to put down roots. Purchasing real estate, redecorating your present home, and strengthening love bonds and family ties are all very favorable now. You may find more Capricornian traditional and conservative people crossing your path.',
    source: 'Complete Guide on Solar Returns',
  },
  Leo: {
    sign: 'Leo',
    overview: 'This year you will be inclined to express yourself in a more intense and dramatic way. Your authority will increase and you will try to impose your opinions on others. In no way will you be unnoticed during this period and you will continually search for the approval of the public. Increased energy will impel you to undertake new activities or work intensely on your projects.',
    temperament: 'Your creativity will be notable and it could manifest at all levels. If you have artistic abilities, this is the year to dedicate your time to them. Your personal magnetism is also accentuated, bringing love affairs, conquests and adventures. You will have high physical energy and will enjoy the practice of any sport.',
    health: 'It is important that you maintain a good balance and alternate your activities with periods of rest. You run the risk of over-extending your efforts and arriving at a point of exhaustion. If you have any problems with your heart, you should be especially careful this year. However, a serious illness is not likely due to your strong vitality.',
    relationships: 'You will be guided more by your feelings than by reason during this time and your romantic encounters are inclined to be less conventional. If you are in a committed relationship, it would be advisable not to try to dominate your partner as you will probably come on a little too strong.',
    source: 'Complete Guide on Solar Returns',
  },
  Virgo: {
    sign: 'Virgo',
    overview: 'Your mental and intellectual activity will increase considerably this year. Your capacity to analyze and your attention to detail will be greater. You may feel the desire to study something new, or improve the way you do your present work. You may get more interested in service projects which improve the lives of others.',
    temperament: 'You could get so engrossed in your work that you lose yourself in details. Having a practical outlook is the key to finding good solutions. Don\'t spend too much time analyzing data and avoid wasting time on unimportant things. If by nature you are less than meticulous, you may find it easier to organize your thoughts this year. If you are already very detailed, try to take time for physical activity.',
    health: 'Physically, you could be more nervous than usual which could result in intestinal disorders or other illnesses caused by nervous tension. It could also cause insomnia, brought on by too much mental work. It would be advisable to practice techniques such as Yoga. You will be inclined to want to improve your body and health this year.',
    relationships: 'You will find yourself being more cautious and critical in your relationships. Things that never used to bother you will now become issues. You may find Pisces natives entering your life this year. Although you will find them appealing, you could also be annoyed by their emotional approach.',
    source: 'Complete Guide on Solar Returns',
  },
  Libra: {
    sign: 'Libra',
    overview: 'Your social life will flourish this year. Your attitude will be more open and agreeable, bringing new people into your life and also strengthening old friendships. You will prefer to be with others rather than being alone. You will meet people who will play an important part in your future. There is a possibility of beginning a significant professional or business relationship.',
    temperament: 'Your artistic inspirations and a need for harmony in your environment will be emphasized. Most of the time you will find it easier to be diplomatic and agreeable. You could be plagued by doubt and more than once confronted with the difficult task of choosing between two or more options. Your need for balance and fairness won\'t allow you to take lightly the decisions you have to make.',
    health: 'Libra rules the kidneys and it would be wise to drink a lot of fluids to eliminate toxins in the system. Under this influence you are inclined to become lazy as far as physical exercise is concerned, which could lead to circulation problems. You may develop a sweet tooth during this time.',
    relationships: 'If you are single, you may establish a relationship that could turn into a committed partnership. If you are already in a relationship, you will feel inclined to share many activities with your partner. In spite of your desire for balance and peace, you might find that you attract Aries types who will challenge you to confrontation.',
    source: 'Complete Guide on Solar Returns',
  },
  Scorpio: {
    sign: 'Scorpio',
    overview: 'This will be a year of internal regeneration. You will be prompted to go within to confront your most profound feelings and your deepest inner self, which always produces tension until you are ready to come to terms with yourself. Your attitude will be very confrontational and authoritative. You should be aware of how you handle yourself and maintain control. This year you will be tested.',
    temperament: 'Don\'t let negative emotions like anger, bitterness, jealousy, hate and vengeance control you. This makes it more difficult to deal with matters successfully. It will be a year to work on those emotions and undo the blockages that have stood in your way too long. Your interest in extrasensory perception and the paranormal will be increased. Trust your impressions — they will be quite accurate.',
    health: 'If you are naturally calm, you will find yourself being more demanding and explosive. In either situation, it would be advisable to engage in physical activity. Some type of psychological counseling or therapy should prove to be extremely beneficial during this time. Physically, you could be subject to sexual infections or inflammations.',
    relationships: 'You may also be dealing with money matters, mostly concerning the possessions and finances of others. You may be involved in an intense, or even tragic, romance. There could be jealousy and scandal involved. However, it is also possible to establish lasting, stable relationships by expending a little effort.',
    source: 'Complete Guide on Solar Returns',
  },
  Sagittarius: {
    sign: 'Sagittarius',
    overview: 'This is a period of expansion, personal growth and general good luck. You will feel a desire to expand your sphere of interest beyond that with which you are familiar. Your idealism will also increase, and you will have a strong interest in religion, philosophy, law, metaphysics, and advanced science. You will draw people to you who are positive and helpful.',
    temperament: 'Your desire for independence will be strong, along with a desire to travel and become acquainted with distant lands. You may feel discontented and restless with your normal daily routine. There will be a tendency to exaggerate, to be overly optimistic, and to be so preoccupied with the outcome that you ignore potential dangers. Be positive but realistic!',
    health: 'Under the influence of Jupiter, there is a tendency to gain weight, particularly in the hips and thighs. Therefore, you should be more than usually careful about your diet. And getting a lot of exercise is desirable.',
    relationships: 'You are likely to meet some interesting people who will stimulate your intellect and expose you to new and exciting ideas. If you are single, you will have the opportunity to meet other unattached people. If you are in a committed relationship, you might feel a little restless with the restrictions that it places upon you.',
    source: 'Complete Guide on Solar Returns',
  },
  Capricorn: {
    sign: 'Capricorn',
    overview: 'During this year you will be more focused on your ambitions and goals. You will give more consideration to your financial situation. You will also be inclined to look seriously at the work you do. If you are not completely satisfied with it, you will start looking around for something you like better — one that gives you more responsibility and rewards for your efforts.',
    temperament: 'Maturing is the key for this year. You will feel your needs changing, and in spite of an inner resistance, a part of you wants to take on new responsibilities and forge ahead. Whatever you undertake now will bring you satisfaction for a long time to come. Now is the time to make the effort and to even sacrifice in order to realize your most important goals.',
    health: 'This influence could bring some problems with your bones and joints. It would be a good time to have your teeth checked and also to pay more attention to the care of your skin, fingernails and hair. Be sure to eat foods that are rich in minerals. Your ambition could cause you to over-work and become run down, resulting in depression or frustration.',
    relationships: 'Others will notice the dedication you are making. They will recognize that you are serious and respond in like fashion. This year you will approach your love life more seriously as well, seeking depth and commitment over casual encounters.',
    source: 'Complete Guide on Solar Returns',
  },
  Aquarius: {
    sign: 'Aquarius',
    overview: 'Your need for independence and individuality is strong this year. You may break out of your shell and express a "new you." Some level of emotional detachment and stability is likely. If you are not normally stubborn or individualistic, people around you might be surprised by your behavior this year.',
    temperament: 'You are drawn to innovation, technology, and unconventional approaches. Group activities and humanitarian concerns become more important. You may feel a strong urge to reform or revolutionize some area of your life. Original thinking is your greatest asset this year, but be careful not to alienate those close to you.',
    health: 'The nervous system and circulation may need attention. Anxiety from an overstimulated mind can manifest as restless legs, insomnia, or sudden energy crashes. Regular grounding practices — walking in nature, structured sleep — counterbalance the electrical Aquarian energy.',
    relationships: 'Be careful not to alienate those close to you as you branch out and feel the need to express your individuality. You attract fellow free-thinkers and rebels. Leo types may challenge you to balance detachment with warmth and heart-centered connection.',
    source: 'Complete Guide on Solar Returns',
  },
  Pisces: {
    sign: 'Pisces',
    overview: 'This could be a very dreamy, possibly directionless year when you tend to prefer to live in a dream world rather than attend to picky details of everyday life. It could be a time when you hide yourself away, work on something behind the scenes, or have a greater need for solitude. Something hidden or private may occupy a good portion of your thoughts and time.',
    temperament: 'Some restlessness is likely, and you may have some concerns about what lies ahead, which could be at the root of your need to escape. Artistic and spiritual sensitivity is heightened. You may feel more compassionate than usual, drawn to service, healing work, or creative expression. Boundaries between yourself and others may blur.',
    health: 'The immune system may need extra support this year. Sensitivity to alcohol, medications, and environmental toxins is increased. Feet and lymphatic system are vulnerable areas. Water-based therapies — swimming, baths, hydrotherapy — are especially beneficial.',
    relationships: 'Your empathy draws people to you who need help, but you must distinguish between genuine connection and codependency. Virgo types may enter your life to help you ground your dreamy nature. If single, be wary of idealizing a new love interest.',
    source: 'Complete Guide on Solar Returns',
  },
};

// ─── SR Ascendant in Natal House (Natal House Brought to ASC) ───────
// Source: "Keys to Interpreting Solar Returns" & Brian Clark

export const SR_ASC_IN_NATAL_HOUSE: Record<number, { theme: string; description: string }> = {
  1: {
    theme: 'Identity Reinforced',
    description: 'The SR Ascendant falls in your natal 1st house — your natal Ascendant sign may even repeat. This is a deeply personal year. You are more "yourself" than usual. Identity themes are front and center. This is a power year when you feel most aligned with who you fundamentally are. Self-initiated projects flourish.',
  },
  2: {
    theme: 'Values & Resources Activated',
    description: 'The SR Ascendant brings your natal 2nd house to the fore. Finances, self-worth, and what you own or want to acquire become central concerns. Your approach to the year is filtered through questions of value — what is worth investing your time, energy, and money in. Building material security is a priority.',
  },
  3: {
    theme: 'Communication & Learning',
    description: 'Your natal 3rd house is brought to the Ascendant. Communication, learning, writing, teaching, and interactions with siblings and neighbors become primary focuses. Your immediate environment and how you process information shape the year. Short trips and intellectual pursuits are highlighted.',
  },
  4: {
    theme: 'Home & Roots',
    description: 'The SR Ascendant activates your natal 4th house. Home, family, domestic matters, and your emotional foundation become the lens through which you experience the year. Moving, renovating, dealing with family, or building a secure inner foundation are likely themes. A parent may be prominent.',
  },
  5: {
    theme: 'Creativity & Romance',
    description: 'Your natal 5th house is brought to the forefront. Creative self-expression, romance, children, pleasure, and risk-taking become the primary approaches to life this year. You are drawn to follow your heart, create, play, and put your unique stamp on the world. Love affairs and creative projects are highlighted.',
  },
  6: {
    theme: 'Work & Health',
    description: 'The SR Ascendant falls in your natal 6th house. Daily work, health, routines, and service become your primary focus. You feel a persistent pull to improve — fixing inefficiencies in your schedule, addressing health concerns you\'ve postponed, and finding greater precision in your work. Perfectionism intensifies; you notice flaws you previously tolerated.',
  },
  7: {
    theme: 'Partnerships & Others',
    description: 'Your natal 7th house is brought to the Ascendant. Relationships — romantic, business, or legal — dominate the year. You may feel unusually dependent on others\' opinions, or define your next steps through partnership dynamics. Contracts, counseling, mediation, and one-on-one negotiations consume significant emotional bandwidth. You see yourself most clearly through how others respond to you.',
  },
  8: {
    theme: 'Transformation & Shared Resources',
    description: 'The SR Ascendant activates your natal 8th house. Deep transformation, shared finances, intimacy, and psychological intensity surface whether you seek them or not. You feel pulled toward uncomfortable truths — about money owed, power dynamics in relationships, or emotional patterns you\'ve avoided. Inheritance, taxes, debt, insurance, or psychological excavation may feature.',
  },
  9: {
    theme: 'Expansion & Philosophy',
    description: 'Your natal 9th house is brought to the fore. Higher education, long-distance travel, publishing, legal matters, and your worldview are activated. You feel restless with the familiar — a hunger for meaning, growth, and experiences beyond your usual boundaries pulls you outward. A teacher, mentor, or foreign connection may catalyze a shift in perspective.',
  },
  10: {
    theme: 'Career & Public Life',
    description: 'The SR Ascendant falls in your natal 10th house. Career, reputation, ambition, and public standing become your primary focus. You are visible, purposeful, and driven to achieve. Authority figures are prominent. Your professional identity is being actively shaped or reshaped this year.',
  },
  11: {
    theme: 'Community & Future Vision',
    description: 'Your natal 11th house is brought to the Ascendant. Friends, groups, social networks, and your vision for the future define the year. You approach life through collective concerns — what you want for the world, who you want to build it with, and where you see yourself in 5-10 years.',
  },
  12: {
    theme: 'Retreat & Spiritual Work',
    description: 'The SR Ascendant activates your natal 12th house. This is a year of retreat, solitude, spiritual deepening, and processing what lies behind the scenes. Hidden matters may surface. Rest, meditation, and letting go of the past are essential. You may work in institutional settings or behind closed doors.',
  },
};

// ─── MC Sign Interpretations in SR ──────────────────────────────────
// Source: Brian Clark — "Working with Solar Returns"

export const SR_MC_SIGN: Record<string, string> = {
  Aries: 'The MC in Aries signals a year when career initiative is paramount. You are called to be bold, pioneering, and independent in your professional direction. Leadership roles or solo ventures are favored. Patience with slow-moving authority structures will be tested.',
  Taurus: 'Career stability, financial security in work, and building something tangible define the year\'s vocational themes. Artistic or beauty-related professions flourish. Stubborn persistence in career goals pays off, but inflexibility can create friction with superiors.',
  Gemini: 'Communication, versatility, and intellectual agility define your career direction this year. Writing, teaching, media, and networking are emphasized. Multiple professional interests compete for attention. Your voice and ideas are your primary career tools.',
  Cancer: 'Nurturing, caregiving, and emotional intelligence in the workplace are highlighted. Home-based work or family business may feature. Your professional identity is tied to creating emotional security — for yourself and others.',
  Leo: 'Creative leadership, public visibility, and a desire for recognition drive your career this year. You want to shine professionally. Performance, entertainment, or positions of authority are favored. Be mindful that ego doesn\'t overshadow teamwork.',
  Virgo: 'Precision, service, and craftsmanship define your professional focus. Health professions, analysis, editing, and detail-oriented work are emphasized. Your value this year comes from doing excellent work rather than seeking the spotlight.',
  Libra: 'Diplomacy, partnership, and aesthetics shape your career direction. Negotiations, collaborations, and creative partnerships are favored. Legal matters related to career may arise. Your professional success depends on relationships and the ability to create harmony.',
  Scorpio: 'Intensity, strategic thinking, and the ability to navigate power dynamics define your career year. Research, psychology, finance, and transformative work are emphasized. You may be drawn to positions that require handling crises or secrets.',
  Sagittarius: 'Career expansion through education, travel, publishing, or international connections is highlighted. Your professional identity is tied to belief systems, teaching, or promoting a broader worldview. Overcommitment and overoptimism are risks.',
  Capricorn: 'Maximum professional ambition and responsibility. This is the natural sign for the MC — career achievements, authority, and building a legacy are front and center. Hard work earns lasting rewards. The pressure is real but so is the potential for enduring success.',
  Aquarius: 'Innovation, technology, and unconventional career paths define the year. You may be drawn to humanitarian work, group leadership, or disrupting established professional norms. Your unique perspective is your greatest career asset.',
  Pisces: 'Intuition, creativity, and spiritual purpose guide your career direction. Arts, healing professions, and service-oriented work are emphasized. Career boundaries may blur — be careful not to lose yourself in work or let others take advantage of your compassion.',
};

// ─── Chart Shape Interpretations for SR ─────────────────────────────
// Source: Brian Clark — Jones patterns applied to SR context

export const SR_CHART_SHAPES: Record<string, { name: string; meaning: string; guidance: string }> = {
  Bundle: {
    name: 'Bundle (Cluster)',
    meaning: 'All planets occupy approximately 120° or less of the zodiac. Energy is intensely concentrated and specialized. This year has a laser-like focus — all of your resources, attention, and life force are channeled into a narrow band of experience.',
    guidance: 'Lean into the concentration. This is not a year for diversification — it is a year for mastery in a specific area. The houses and signs occupied tell you exactly where. The unoccupied houses represent areas of life that may feel neglected but are simply not where the energy lives this year.',
  },
  Bowl: {
    name: 'Bowl',
    meaning: 'All planets occupy approximately 180° of the zodiac, leaving half the chart empty. There is a sense of self-containment and purpose but also an awareness of what is missing. The leading planet (the one at the edge of the occupied half) acts as a "scoop" — the planet that reaches toward the unfamiliar.',
    guidance: 'The occupied hemisphere shows where you are resourceful and self-sufficient. The empty hemisphere represents what you need to reach toward or integrate. The leading planet is your key to growth — follow its sign and house themes.',
  },
  Bucket: {
    name: 'Bucket (Funnel)',
    meaning: 'All planets but one are in approximately 180°, with a singleton "handle" planet in the opposite hemisphere. The handle planet is THE most important planet in the SR chart — it channels all the energy of the year into a single focal point.',
    guidance: 'Everything filters through the handle planet. Its sign, house, and aspects define the year\'s central theme more than any other single factor. If the handle is a benefic (Venus, Jupiter), the channeling is productive. If a malefic (Mars, Saturn), the year demands discipline at that focal point.',
  },
  Locomotive: {
    name: 'Locomotive',
    meaning: 'Planets span about 240° of the zodiac with a 120° empty gap. There is a strong sense of drive, momentum, and forward motion. The leading planet (at the clockwise edge of the occupied area) is the engine — it pulls the entire year forward.',
    guidance: 'This is a year of determined progress. The empty trine represents an area of life that provides space and potential rather than activity. The leading planet determines HOW you drive — its nature sets the year\'s operating style.',
  },
  Seesaw: {
    name: 'Seesaw (Hourglass)',
    meaning: 'Planets cluster into two groups on opposite sides of the chart, creating a push-pull dynamic. There is a constant balancing act between two areas of life, two priorities, or two aspects of self. Neither side can be ignored.',
    guidance: 'The tension IS the point. This year teaches integration through contrast. Look at which houses are occupied on each side — those represent the two major themes you are balancing. The tighter the opposition aspects between the groups, the more urgent the balancing act.',
  },
  Splash: {
    name: 'Splash',
    meaning: 'Planets are distributed relatively evenly around the entire chart. No single area dominates — attention and energy are spread across all areas of life. There is versatility and breadth but potentially a lack of focus.',
    guidance: 'This is a year where many life areas are active simultaneously. Your challenge is prioritization. Look for the tightest aspects to find where the most significant energy exchanges are happening. Without conscious choice, you risk spreading too thin.',
  },
  Splay: {
    name: 'Splay',
    meaning: 'Planets form irregular clusters with large empty spaces between them. This creates a pattern of strong, individualistic emphasis in specific areas with deliberate gaps. The person operates according to their own unique pattern rather than any conventional structure.',
    guidance: 'Honor the irregular distribution. This is not a "balanced" year and is not meant to be. The clusters represent areas of intense, passionate involvement. The empty spaces are areas where you consciously or unconsciously disengage. This is the pattern of an individualist — follow your own rhythm.',
  },
};

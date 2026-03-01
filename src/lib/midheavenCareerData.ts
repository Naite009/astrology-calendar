// Jan Spiller "Astrology for Success" — Midheaven (MC) Career Framework
// Source attribution on every entry for traceability

export const MC_CAREER_SOURCE = 'Jan Spiller, Astrology for Success';

export interface MCCareerData {
  sign: string;
  creatingSuccess: string;
  achillesHeel: string;
  selfActualization: string;
  homeBase: string;
  goodCareerChoices: string[];
  keyPrinciple: string;
}

export const MC_CAREER_DATA: Record<string, MCCareerData> = {
  Aries: {
    sign: 'Aries',
    creatingSuccess: 'You create successful outcomes when you openly express your own point of view. By revealing the way you would like things to go, you create clarity for others. Happiness enters every area of life you approach from the standpoint of directly revealing your intentions, rather than manipulating situations to gain support.',
    achillesHeel: 'You so deeply fear losing the safety of your role as "nice person" that you may never experience the satisfaction of being a person in your own right. Your desire to appear accommodating and diplomatic can keep you from asserting your independence. This stance is a survival tool from childhood that no longer serves you.',
    selfActualization: 'When you abandon your preoccupation with pleasing people, you are free to concentrate on asserting your true identity. Your independent spirit and pioneering ideas begin to emerge, leading you to the unabashed joy of experiencing yourself as a person in your own right.',
    homeBase: 'Your early conditioning was in many ways very peaceful and harmonious. Personal compromise for the sake of getting along was emphasized. Past lives spent developing strong partnerships for survival are indicated. In this life, your instincts best guide your way.',
    goodCareerChoices: ['Self-starter roles', 'Independent ventures', 'Leadership positions', 'Pioneering fields', 'Athletics / sports', 'Entrepreneurship', 'Military / emergency services'],
    keyPrinciple: 'Reveal your true intentions directly. Stop manipulating for harmony.',
  },
  Taurus: {
    sign: 'Taurus',
    creatingSuccess: 'You achieve successful outcomes when you openly express your own values. Your profession needs to reflect those values, perhaps by building something that furthers what you feel is a worthy principle. As you implement your values, success follows.',
    achillesHeel: 'You are deeply perceptive of others\' values and fear losing the safety of keeping your perceptions secret. By continually altering your values to harmonize with those around you, you may feel you can manipulate others and remain in control. While maintaining this position, your power cannot be validated.',
    selfActualization: 'When you surround yourself with people whose values align with yours, you naturally support your sense of self-esteem. By openly acknowledging what you have to contribute, you reveal the penetrating quality of your mind and enable transformative processes in others.',
    homeBase: 'Your early conditioning was in many ways very disruptive and disturbing. Power struggles within the home accustomed you to "living on the edge." Past lives spent navigating others\' power dynamics are indicated. You are learning that self-sufficiency builds true security.',
    goodCareerChoices: ['Building / construction', 'Finance / money management', 'Farming / floral arts', 'Massage / healing arts', 'Music / singing', 'Cooking / catering', 'Art / beauty industries'],
    keyPrinciple: 'Express your own values openly. Build something that endures.',
  },
  Gemini: {
    sign: 'Gemini',
    creatingSuccess: 'You achieve successful outcomes when you keep talking! Openly communicating your own opinions and ideas, and listening to others\' perspectives. Self-censorship is replaced with healthy disclosure. Open communication is your key.',
    achillesHeel: 'You fear losing the safety of your role as "the teacher" — releasing your purposeful philosophical perspective on how things are. This stance of righteousness leads others to put little stock in your lofty thoughts. When excessive pride keeps you from communicating insecurities, it creates distance.',
    selfActualization: 'Happiness enters every area of life where you replace "being right" with openness to differing perspectives. Curiosity is your friend. Your best communication is based on lightness and easy sharing. Letting go of needing to be right leaves you free to communicate fully.',
    homeBase: 'Your early conditioning was in many ways very positive and expansive. One parent seemed "bigger than life." There may have been strong beliefs about how life is, leading to your belief that to be safe, you must be right. Spiritual and religious past lives are indicated.',
    goodCareerChoices: ['Writing / publishing', 'Teaching / education', 'Sales / marketing', 'Internet / media', 'Public speaking', 'Journalism', 'Social media / communications'],
    keyPrinciple: 'Stay curious. Ask questions. Replace being right with being interested.',
  },
  Cancer: {
    sign: 'Cancer',
    creatingSuccess: 'You achieve successful outcomes when you express yourself with awareness of others\' feelings. You feel empowered by a position of caring about other people. Your concern for others\' lives opens the way for you to support them and achieve your own aims.',
    achillesHeel: 'You fear losing the safety of your role as the perennial "authority," always sufficient unto yourself. You avoid being emotionally vulnerable for fear of losing total control. This leads to the unhappiness of self-isolation and remaining so rigidly in control that no one can interact with you deeply.',
    selfActualization: 'Happiness enters every area where rigid rules are replaced with wanting to share yourself and care for other people. You "win" by being willing to relate on an emotional level, letting others see your vulnerability, humanness, and the truth of your deepest nature.',
    homeBase: 'Your early conditioning was in many ways very restrictive — one parent was more authority figure than caregiver. You were programmed early on, told who to be and what job to have. Past lives spent being the person in charge are indicated.',
    goodCareerChoices: ['Real estate', 'Interior decorating', 'Cooking / catering', 'Childcare / education', 'Nursing / caregiving', 'Counseling / therapy', 'Hospitality industry'],
    keyPrinciple: 'Care for others openly. Let vulnerability be your strength.',
  },
  Leo: {
    sign: 'Leo',
    creatingSuccess: 'You achieve successful outcomes when you allow yourself to become fully involved in creating results that are important to you. This includes listening to others\' responses and being willing to change your presentation. Like a comedian onstage, tailor your performance to what delights the audience.',
    achillesHeel: 'You fear losing the safety of your emotionally detached and objective outlook on life. This impersonal approach leads to the dry disappointment of not experiencing intimate relationships. When decisions are based exclusively on detached intellectual ideals, you create upheaval around you without understanding the cause.',
    selfActualization: 'Happiness enters every area of life where detachment gives way to the dramatic, inspiring display of genuine positive emotions! When you no longer allow intellect to dictate to feelings, you are free to express emotions clearly and compellingly. At last you can project love in a way that communicates "love" to others.',
    homeBase: 'Your early conditioning was in many ways very cool and detached. Parents were so burdened by tasks that it was difficult to see you as an individual. You were never recognized for your specialness. Past lives spent within strong group bonds are indicated.',
    goodCareerChoices: ['Entertainment / performing arts', 'Creative direction', 'Working with children', 'Leadership / management', 'Fashion / styling', 'Event planning', 'Motivational speaking'],
    keyPrinciple: 'Take center stage. Express from the heart, not the head.',
  },
  Virgo: {
    sign: 'Virgo',
    creatingSuccess: 'You achieve successful outcomes when you focus on your intended goal and carefully plan how you will get there. Analyzing details, making a realistic schedule, and sticking to your routine — these are your keys to manifesting goals and feeling in charge.',
    achillesHeel: 'You fear losing the safety of your role as a tender, compassionate victim, in contact with the "cosmic whole" yet unable to organize yourself on Earth. By refusing to focus or define your direction, you become less visible — experiencing the unhappiness of nobody noticing your plight.',
    selfActualization: 'Happiness enters every area where "cosmic helplessness" is replaced by down-to-earth helpfulness. By releasing utopian fantasies, you free yourself to envision a new ideal of service based on practical application. You experience unparalleled joy as an active participant in bringing your spiritual vision alive.',
    homeBase: 'Your early conditioning was in many ways very confusing and disorienting. Chaos was part of the picture. Your capacity to create order was undermined through lack of encouragement. Past lifetimes in monasteries or other physically isolated places are indicated.',
    goodCareerChoices: ['Healthcare / healing', 'Holistic wellness', 'Organization / consulting', 'Detailed analytical work', 'Editing / quality control', 'Spiritual advising', 'Veterinary / animal care'],
    keyPrinciple: 'Make a plan and stick to it. Service is your superpower.',
  },
  Libra: {
    sign: 'Libra',
    creatingSuccess: 'You achieve successful outcomes when you link with another in a partnership effort. Your ideal profession involves one-on-one dealings. In every area of life you approach as a team player seeking cooperation and mutual support, you will gain confidence.',
    achillesHeel: 'You fear losing the safety of your role as the impulsive, independent, self-reliant person who always goes their own way. By failing to consider other people\'s needs before making decisions, you open yourself to unhappiness, since others may not support your actions.',
    selfActualization: 'Happiness enters every area of life where you expand your "me first" attitude to include other people on your winning team. Joy comes through the realization that only when everyone wins do you achieve true victory. Gentleness and concern take root as you strive for harmony.',
    homeBase: 'Your early conditioning was in many ways very supportive of independence. You were given abundant attention that empowered you to grow on your own. Past lives spent as a warrior or pioneer are indicated. In this life, your key to success lies in partnering.',
    goodCareerChoices: ['Diplomacy / mediation', 'Counseling / consulting', 'Interior design', 'Law / justice', 'Public relations', 'Art / aesthetics', 'Marriage counseling'],
    keyPrinciple: 'Partner with others. Cooperation creates more than competition.',
  },
  Scorpio: {
    sign: 'Scorpio',
    creatingSuccess: 'You achieve successful outcomes when you link with a powerful partner. Through wholehearted efforts to support them, you are transformed and empowered, blossoming into an expanded sense of self. Exploring other people\'s goals shows you the next partner to link with.',
    achillesHeel: 'You fear losing your position as a practical person with solid, reliable material values. Yet the image projected is boring and the cost of maintaining it is exorbitant. Stubbornly maintaining fixed beliefs leads to feeling continually on the defensive.',
    selfActualization: 'Happiness enters every area where you relinquish intolerance and strive to recognize what others consider valuable. By moving out of your comfort zone to establish your true personal power, you experience joy in relating to others in significant ways. Willingness to experience personal transformation empowers you.',
    homeBase: 'Your early environment was in many ways safe, dependable, and comfortable. Money was not scarce and you were provided with physical necessities. You were taught strong family values: persistence, ownership, self-reliance. Past lives focused on comfortable lifestyle and tangible assets are indicated.',
    goodCareerChoices: ['Psychology / therapy', 'Politics / power dynamics', 'Crisis management', 'Research / investigation', 'Surgery / medical specialties', 'Financial consulting', 'Transformation coaching'],
    keyPrinciple: 'Embrace change over the status quo. Link with powerful partners.',
  },
  Sagittarius: {
    sign: 'Sagittarius',
    creatingSuccess: 'You achieve successful outcomes when you choose personal freedom over acceptance by others. When you put ethics and morality first, your rewards are peace of mind and trust in positive outcomes. Your active mind can bounce back and forth until an epiphany occurs.',
    achillesHeel: 'You fear losing the security of relating to a variety of people and ideas, and the safety of being "Mr. or Ms. Jack of All Trades." Lack of focus invites the unhappiness of being thought scattered and not taken seriously. By communicating with everyone, you diffuse your basic energies.',
    selfActualization: 'Happiness enters those areas of life where flirtatious superficiality is replaced by the earnest desire for a larger perspective. Relying on philosophical or religious overviews gives you access to collected mental-emotional strength. By traveling the high road of ethics and truth, you gain self-respect.',
    homeBase: 'Your early conditioning was in many ways filled with trickery and mental manipulations. You developed high intelligence at a young age to cope with intrigue. Past lives as students and teachers are indicated — making it easy to fall into perpetual learning.',
    goodCareerChoices: ['Foreign travel / import-export', 'Publishing / higher education', 'Philosophy / religious leadership', 'Adventure tourism', 'Law / ethics', 'Motivational speaking', 'Cultural exchange'],
    keyPrinciple: 'Speak your truth directly. Choose freedom and ethics over fitting in.',
  },
  Capricorn: {
    sign: 'Capricorn',
    creatingSuccess: 'You achieve successful outcomes when you take a nurturing, empathetic approach to leadership. By combining emotional sensitivity with practical competence, you create structures that serve both people and purpose. Your authority is strongest when rooted in genuine care.',
    achillesHeel: 'You fear losing the safety of your emotional world — the familiar comfort of family bonds and private feelings. This can keep you from stepping into public roles where your competence is needed. You may use emotional sensitivity as an excuse to avoid the responsibilities you were born to carry.',
    selfActualization: 'Happiness enters every area where you allow your emotional wisdom to inform your leadership. By channeling your nurturing instincts into building something of lasting value for the community, you discover that the structures you create can hold both ambition and heart.',
    homeBase: 'Your early conditioning was emotionally rich but may have lacked structure or worldly ambition. One parent may have been deeply nurturing but uncertain about the outer world. Past lives spent in domestic or emotionally supportive roles are indicated.',
    goodCareerChoices: ['Business leadership / CEO', 'Government / public service', 'Architecture / engineering', 'Financial planning', 'Project management', 'Organizational development', 'Legacy building'],
    keyPrinciple: 'Lead with both competence and heart. Build structures that endure.',
  },
  Aquarius: {
    sign: 'Aquarius',
    creatingSuccess: 'You achieve successful outcomes when you channel your powerful creative energy toward humanitarian goals. Rather than seeking personal glory, directing your talents toward the collective good brings both recognition and fulfillment. Innovation in service of the many is your gift.',
    achillesHeel: 'You fear losing the safety of being the center of attention — the dramatic, creative star of your own story. This can lead to an attachment to personal recognition that prevents you from embracing the truly revolutionary ideas you are here to share. Pride may isolate you from the very communities that would amplify your work.',
    selfActualization: 'Happiness enters every area where personal drama gives way to genuine innovation. When you direct your considerable creative gifts toward serving the future rather than glorifying the past, you find a satisfaction deeper than any applause — the satisfaction of making a real difference.',
    homeBase: 'Your early conditioning was in many ways very dramatic and attention-oriented. Creativity and self-expression were encouraged, perhaps to the point where everything revolved around personal desires. Past lives as performers, royalty, or creative leaders are indicated.',
    goodCareerChoices: ['Technology / innovation', 'Humanitarian organizations', 'Science / research', 'Social reform / activism', 'Community organizing', 'Astrology / futurism', 'Nonprofit leadership'],
    keyPrinciple: 'Innovate for the collective. Let your genius serve the future.',
  },
  Pisces: {
    sign: 'Pisces',
    creatingSuccess: 'You achieve successful outcomes when you allow your powerful analytical mind to serve a higher vision. By combining practical competence with spiritual sensitivity, you create works that bridge the material and the transcendent. Your greatest success comes through inspired service.',
    achillesHeel: 'You fear losing the safety of your well-organized, efficient approach to life. The urge to control every detail can prevent you from surrendering to the creative and spiritual flow that is your true source of power. Perfectionism may keep you stuck in analysis while your vision remains unrealized.',
    selfActualization: 'Happiness enters every area where rigid perfectionism gives way to compassionate creation. When you trust your intuition as much as your analysis, you discover that the universe supports your most inspired visions. Your practical skills become the vessel for something truly transcendent.',
    homeBase: 'Your early conditioning was in many ways very orderly and detail-oriented. Work ethic and practical achievement were highly valued. Past lives spent in service roles requiring precision and competence are indicated. Now you are learning to let spiritual guidance complement your earthly skills.',
    goodCareerChoices: ['Healing arts / holistic medicine', 'Music / film / photography', 'Spiritual counseling', 'Ocean / marine work', 'Charitable organizations', 'Inspired art / poetry', 'Dream work / therapy'],
    keyPrinciple: 'Trust your vision. Let spiritual sensitivity guide your practical skills.',
  },
};

// MC ruler placement — what house your MC ruler is in determines
// the specific arena where you pursue career success
export const MC_RULER_IN_HOUSE: Record<number, string> = {
  1: 'Your career success is directly tied to your personal identity and self-presentation. You ARE your brand. Physical appearance, personal initiative, and how you present yourself to the world directly fuel your professional rise.',
  2: 'Your career is the gateway through which you express your personal values. Financial acumen and building material resources are central to your professional path. You succeed by knowing what things are worth.',
  3: 'Communication, writing, teaching, and local connections fuel your career. Your professional success comes through intellectual exchange, networking, and the ability to gather and share information.',
  4: 'Your career is rooted in family, home, or emotional foundation. Success comes through real estate, family business, nurturing professions, or work that creates a sense of belonging for others.',
  5: 'Your career thrives when it involves creativity, entertainment, children, or personal self-expression. You succeed by putting your heart into your work and making it playful and engaging.',
  6: 'Your career is fueled by daily work, health, service, and attention to detail. You succeed through being helpful, efficient, and developing practical skills that others depend on.',
  7: 'Partnership is essential to your professional success. Whether through marriage, business partnerships, or one-on-one client work, you achieve your goals through collaboration with significant others.',
  8: 'Your career involves transformation, shared resources, psychology, or crisis management. You succeed through deep investigation, handling others\' resources, or guiding transformative processes.',
  9: 'Your career is connected to higher education, travel, publishing, philosophy, or law. You succeed by expanding horizons — yours and others\' — and by sharing wisdom gained through experience.',
  10: 'Your career ruler is in its own house — a powerful indicator of someone whose professional identity is central to their life purpose. Career achievement comes naturally; the challenge is balancing it with personal life.',
  11: 'Your career is connected to groups, humanitarian causes, technology, or innovation. You succeed through friendships, networking, and aligning your professional goals with a larger collective vision.',
  12: 'Your career involves behind-the-scenes work, institutions, spiritual pursuits, or healing. You succeed through serving something larger than yourself, often in ways that are not publicly visible.',
};

// The sign rulers used for the MC → ruler → house calculation
export const SIGN_RULERS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Pluto',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune',
};

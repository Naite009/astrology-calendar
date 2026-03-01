// Karmic Astrology — 12th House Past Lives, Saturn Karmic Lessons, Jupiter Karmic Gifts, Retrograde Blocked Energies
// Source: Karmic Astrology (anonymous compilation)

export const KARMIC_SOURCE = 'Karmic Astrology';

export interface TwelfthHousePastLife {
  sign: string;
  pastLifeDescription: string;
  subconscious: string;
  pastLifeOccupation: string;
  karmicAdvice: string;
}

export const TWELFTH_HOUSE_PAST_LIVES: Record<string, TwelfthHousePastLife> = {
  Aries: {
    sign: 'Aries',
    pastLifeDescription: 'In past lives you lived in connection with the military, metalworking, architecture, mechanics, or adventures of exploration. Your subconscious always bustles with new plans and strategies.',
    subconscious: 'Your deep psyche works energetically, suddenly, vibrantly, and passionately — always in battle for something or someone.',
    pastLifeOccupation: 'Military leader, architect, explorer, metalworker, or adventurer',
    karmicAdvice: 'Channel impulsive inner energy into intense physical activities. Avoid letting stubbornness and irritability control you.',
  },
  Taurus: {
    sign: 'Taurus',
    pastLifeDescription: 'In previous lives you were a craftsman, musician, farmer, or someone related to banking or finance. You are subconsciously attracted to material comfort and accumulation of goods.',
    subconscious: 'Your deep psyche revolves around good manners, tranquility, love of nature, sensory pleasures, and the need for emotional and material stabilization.',
    pastLifeOccupation: 'Craftsman, musician, farmer, banker, or artisan',
    karmicAdvice: 'Moderate natural inclinations to adopt repetitive routines or become obsessive. Find balance between material comfort and spiritual growth.',
  },
  Gemini: {
    sign: 'Gemini',
    pastLifeDescription: 'In a previous life you were a writer, bookseller, press worker, merchant, or someone in communication. You are subconsciously attracted to the intellectual world and exchange of ideas.',
    subconscious: 'Your deep psyche works by continually relating all incoming information. The diversity of thoughts and original ideas is enormous, but doubt and needing to choose between opposing tendencies requires energy.',
    pastLifeOccupation: 'Writer, merchant, bookseller, journalist, or diplomat',
    karmicAdvice: 'You possess great intellectual talent. Channel your need for constant internal dialogue into writing or teaching. Manage nervous energy through mindful communication.',
  },
  Cancer: {
    sign: 'Cancer',
    pastLifeDescription: 'In an earlier life you were someone related to children, the world of the feminine, food, the coast and the sea. Your home is truly your "sanctuary" — you need protection and tranquility for psychic balance.',
    subconscious: 'You are more romantic than you show in appearance. Your great subconscious need for family doesn\'t mean you get it easily — there will be tests and limitations.',
    pastLifeOccupation: 'Caregiver, cook, fisher, midwife, or maternal figure',
    karmicAdvice: 'Express your sweetness and good feelings more openly. Build the family connections you crave through authentic emotional vulnerability.',
  },
  Leo: {
    sign: 'Leo',
    pastLifeDescription: 'In an earlier life you developed a leadership position — social, military, political, or business. You have great inner psychic vitality and creative potential that is largely dormant.',
    subconscious: 'Hidden within you are leadership skills suitable for carrying out important projects. Your deep psyche is a lover of life, dynamic and expansive.',
    pastLifeOccupation: 'Ruler, political leader, military commander, or public figure',
    karmicAdvice: 'Try not to overvalue your abilities internally — this can make you a "king without a kingdom." Connect to your creative force through deliberate internalization.',
  },
  Virgo: {
    sign: 'Virgo',
    pastLifeDescription: 'In a previous life you were connected to administrative, commercial, accounting, or precision work. Your subconscious psychic world works in an analytical, rationalist, critical way.',
    subconscious: 'You separate what may be convenient from what could be harmful in both things and people. You have great capacity for objective evaluation and common sense.',
    pastLifeOccupation: 'Administrator, accountant, analyst, or precision craftsman',
    karmicAdvice: 'Avoid being overly perfectionist in evaluating things you do or the people around you. Your analytical gifts are powerful — use them with compassion.',
  },
  Libra: {
    sign: 'Libra',
    pastLifeDescription: 'In a previous cycle you were a person linked to art and aesthetics, public relations, justice, democracy, or fashion. Your inner psyche especially needs balance and moderation.',
    subconscious: 'Your best way to overcome karmic difficulties is through good manners, justice, cultivation of social relationships, and refinement of aesthetics.',
    pastLifeOccupation: 'Artist, diplomat, judge, fashion designer, or social coordinator',
    karmicAdvice: 'Avoid banal attitudes and the pretense of seeing everything through rose-colored glasses. Genuine balance — not artificial harmony — is your path.',
  },
  Scorpio: {
    sign: 'Scorpio',
    pastLifeDescription: 'You may have been linked to the world of underground exploration, fighting crime, esotericism and magic, or deep psychology. Your subconscious psyche is highly magnetic, deep, and intense.',
    subconscious: 'You know that emotions, desires, and subtle perception are magic — you can internally perceive what others do not see. You are a born transformer who always draws energy from where it seemed none could sprout.',
    pastLifeOccupation: 'Occultist, detective, psychologist, alchemist, or underground worker',
    karmicAdvice: 'Never get carried away by obsession with jealousy or revenge. Your transformative power is real — direct it toward self-realization, not destruction.',
  },
  Sagittarius: {
    sign: 'Sagittarius',
    pastLifeDescription: 'In a previous cycle you were linked to travel and foreign contacts, philosophy, culture, entertainment, diplomacy, or banking. Your internal psychic world is generally optimistic and idealistic.',
    subconscious: 'You have internal qualities for the ability to see expansive medium and long-term objectives. Your moral values are so ingrained they may go unnoticed, even by you.',
    pastLifeOccupation: 'Traveler, philosopher, diplomat, banker, or cultural leader',
    karmicAdvice: 'Avoid being self-indulgent or letting the surrounding social environment absorb you. Your spiritual and philosophical leanings are trying to find an outlet.',
  },
  Capricorn: {
    sign: 'Capricorn',
    pastLifeDescription: 'In a previous cycle you were a born worker, dedicated to concrete labor and the construction of tangible works. Your inner subconscious world needs realism, constancy, and responsibility.',
    subconscious: 'You are more pessimistic or realistic than it might seem from the outside. You have a subconscious urge to control time, finances, work plans, and long-term goals.',
    pastLifeOccupation: 'Builder, bureaucrat, farmer, administrator, historian, or anthropologist',
    karmicAdvice: 'Avoid melancholy and excessive isolation from social life. You are firm with great specific weight, but you need to become more flexible and less suspicious.',
  },
  Aquarius: {
    sign: 'Aquarius',
    pastLifeDescription: 'In a past life you broke free from social conventions, prejudices, and taboos, opening your mind and investigating the revolutionary. This generated problems and even the need to change your life completely.',
    subconscious: 'Your subconscious sometimes works with lightning speed, quickly assimilating what happens externally. The feeling of freedom is essential for your emotional harmony.',
    pastLifeOccupation: 'Scientist, revolutionary, social reformer, inventor, or astrologer',
    karmicAdvice: 'To be truly free, you must free yourself internally from tensions. Utopia can become an achievable ideal when combined with responsibility. Avoid hasty decisions.',
  },
  Pisces: {
    sign: 'Pisces',
    pastLifeDescription: 'In a previous life you were related to the world of religion, hospitals, the sea, the needy, or inspired art. You have much greater psychic sensitivity than it might seem at first glance.',
    subconscious: 'Experiences of internalization and spirituality can awaken another important facet of your life. You express yourself better through art, meditation, or creative leisure.',
    pastLifeOccupation: 'Priest/ess, hospital worker, sailor, charity worker, or inspired artist',
    karmicAdvice: 'Never use evasive methods (alcohol, drugs) to cope with hypersensitivity. You need faith, prayer, and charity to feel better about yourself. See the divine in daily life.',
  },
};

// Planets in the 12th House — karmic past-life interpretations
export interface PlanetIn12thHouse {
  planet: string;
  pastLife: string;
  karmicLesson: string;
  presentManifestations: string;
}

export const PLANETS_IN_12TH: Record<string, PlanetIn12thHouse> = {
  Sun: {
    planet: 'Sun',
    pastLife: 'In a previous life you had power and command over other people — authority which could have been exercised arrogantly while being quite effective.',
    karmicLesson: 'Need to learn to understand those with less power, while submitting to those above you at times. THE GREATEST GREATNESS IS HUMILITY.',
    presentManifestations: 'Difficulties may arise in relation to superiors or authority figures. Childhood may have been hard to identify the role of your father.',
  },
  Moon: {
    planet: 'Moon',
    pastLife: 'Reminiscences of a past life where you had difficulties with home, family, and children. You may have been overly protective, causing loved ones to pull away.',
    karmicLesson: 'Emotional security must be based on seeing loved ones as capable beings with their own individuality. PROTECTING OTHERS IS GOOD, BUT ATTRACTING OTHERS TO PROTECT YOURSELF IS NOT.',
    presentManifestations: 'Certain limitations in affective expression that need continued strengthening, along with pure love.',
  },
  Mercury: {
    planet: 'Mercury',
    pastLife: 'In a previous life you may have used and abused communication, relationships, and information.',
    karmicLesson: 'The mind needs to renew itself to be continuously young and ready for learning. GOOD JUDGMENT DETERMINES WHAT SHOULD BE COMMUNICATED AND WHAT MUST BE KEPT QUIET.',
    presentManifestations: 'Limitations in studies, travel, friendship. Be careful with writings, agreements, misunderstandings, and talking more than necessary.',
  },
  Venus: {
    planet: 'Venus',
    pastLife: 'In other times you judged the merits and value of everything by its beauty and attractiveness.',
    karmicLesson: 'Value others for what they are, not for what they seem, and they will do the same with you. INTERIOR BEAUTY IS LONGER LASTING THAN EXTERNAL.',
    presentManifestations: 'Some people may not accept their personal image and style. Your capacity for love is great but sometimes feels limited by circumstances.',
  },
  Mars: {
    planet: 'Mars',
    pastLife: 'In a previous existence you may have made excessive use of hardness and were not lenient with others, though you exhibited heroic qualities and sacrifice for an ideal.',
    karmicLesson: 'Balance physical and mental activity. Learn to be firm without frontal confrontation. THE FEARS THAT SEEM OVERWHELMING, ONCE BROUGHT TO LIGHT, BECOME INSIGNIFICANT.',
    presentManifestations: 'You usually win some enemies without realizing it. Physical activity and achieving goals costs many battles and arduous efforts.',
  },
  Jupiter: {
    planet: 'Jupiter',
    pastLife: 'In a previous existence you may have had difficulties for ideological, political, or philosophical reasons, as well as a tendency to waste resources. You were also characterized by altruism and universalist vision.',
    karmicLesson: '"Luck" is only one extreme of the abundance pendulum. ORGANIZE CORRECTLY AND THINK POSITIVELY ABOUT BOTH ABUNDANCE AND SHORTAGE.',
    presentManifestations: 'Innate subconscious optimism, but the natural inclination to do things in a big way is sometimes limited.',
  },
  Saturn: {
    planet: 'Saturn',
    pastLife: 'In a previous existence you lived solitary and far from social life, dedicated mostly to work and reflection.',
    karmicLesson: 'The threads that handle matter are in the hands of superior forces. OF MATTER WE ONLY REMAIN WITH THE EXPERIENCE WE GOT FROM WORKING AND MAKING IT FRUCTIFY.',
    presentManifestations: 'Need for interior security, stability, and control. Don\'t be afraid of spontaneity. Firm, responsible, and disciplined internally but needs more flexibility.',
  },
  Uranus: {
    planet: 'Uranus',
    pastLife: 'In a previous life you opposed the established order and revolutionized circumstances through research, thought, or defense of freedom.',
    karmicLesson: 'To be truly free, it is necessary to free yourself internally from tensions. UTOPIA CAN BECOME AN ACHIEVABLE IDEAL IF COMBINED WITH RESPONSIBILITY.',
    presentManifestations: 'Tendency to make decisions by mere mental impulse. Sometimes feels freedom is limited. Inclination to detach easily from things or people.',
  },
  Neptune: {
    planet: 'Neptune',
    pastLife: 'In a previous life you were very sensitive and inspired, but escaped from material reality. Psychic abilities were great but overused, creating internal imbalance.',
    karmicLesson: 'GOD IS IN HEAVEN, ON EARTH AND EVERYWHERE.',
    presentManifestations: 'Rich, suggestive imagination with great symbolism. Must avoid evasive methods at all costs. Will discover great internal truths if you stay in touch with reality.',
  },
  Pluto: {
    planet: 'Pluto',
    pastLife: 'In a past life you were a person of great internal energy, maverick and transformer. This created enemies because you "cut it short" whenever you perceived something crooked.',
    karmicLesson: 'THERE IS NO REVOLUTION OR CHANGE THAT LASTS IF IT HAS NOT BEEN SEALED BEFORE WITH FIRE AT THE LEVEL OF CONSCIOUSNESS.',
    presentManifestations: 'Feel the true power to change the environment resides in yourself. Practice self-actualization methods in leisure, work, and love life.',
  },
};

// Saturn in Houses — Karmic great teacher lessons
export interface SaturnKarmicHouse {
  house: number;
  pastLife: string;
  presentLesson: string;
  positive: string;
  negative: string;
}

export const SATURN_KARMIC_HOUSES: Record<number, SaturnKarmicHouse> = {
  1: { house: 1, pastLife: 'In previous lives you forged your character based on self-control, discipline, and loneliness.', presentLesson: 'Very self-sufficient and knows how to self-program goals and tasks.', positive: 'Over time, childhood limitations transform into inner strength to achieve goals.', negative: 'Tendency to take on more responsibilities than you can comfortably carry.' },
  2: { house: 2, pastLife: 'In a previous life you and those around you suffered shortage of basic human needs.', presentLesson: 'Fully aware of the true hidden value of money and administration of resources.', positive: 'Able to "hold your belt" when circumstances require. Slow and steady financial climb.', negative: 'Can stay in unsatisfying work for stable income. Fear of losing economic base.' },
  3: { house: 3, pastLife: 'In a previous life you received retaliation or punishment for speaking publicly and transmitting concepts freely.', presentLesson: 'Confident and realistic in logical schemes. Knows how to listen and delve into messages.', positive: 'With patience and capacity for prolonged mental work, can take on tasks requiring concentration.', negative: 'Tends to close mentally, with rigid rational schemes that prevent flexible thinking.' },
  4: { house: 4, pastLife: 'In a past life you were too demanding and authoritarian in the home.', presentLesson: 'Carry out family responsibilities with love and maturity to leave life foundations well laid.', positive: 'Overcoming the experience of early maturity with a deep sense of family duty.', negative: 'Other goals delayed due to energy invested in caring for relatives.' },
  5: { house: 5, pastLife: 'In a previous life you suffered blockade in relation to business, creative works, children, or loves.', presentLesson: 'Takes romantic encounters with great seriousness. Sees love as a commitment.', positive: 'Deep and mature relationships with children. Can be happy applying prudence in creative expression.', negative: 'Difficult to bring out creativity. May sin by shyness in romance.' },
  6: { house: 6, pastLife: 'In a previous life you were too rigid and demanding with those who worked for you or were at your service.', presentLesson: 'Must start from the bottom and gradually rise through work and effort.', positive: 'Able to delegate and apply executive skills within your work area.', negative: 'Tends to take on more work responsibilities than you can handle. Physical exhaustion.' },
  7: { house: 7, pastLife: 'In a past life you suffered loneliness, obstacles, and limitations due to lack of collaboration.', presentLesson: 'Very prudent in personal relationships. Greatly appreciates a trusted, responsible partner.', positive: 'Overcoming limitations in important relationships through stability.', negative: 'May see partner as too attached to reality and routine habits.' },
  8: { house: 8, pastLife: 'In a previous life you tried to hide or put aside your responsibilities, or isolated yourself in a selfish attitude.', presentLesson: 'Taking and finalizing responsibilities, patience, and compliance with daily tasks will profoundly change your character.', positive: 'From the phase of deep transformation, you emerge with much higher specific weight.', negative: 'Great potential abilities are quite hidden until activated through challenges.' },
  9: { house: 9, pastLife: 'In a past life you suffered limitations from not being able to travel or having excessively rigid philosophy.', presentLesson: 'Your "religion" is human responsibility and mature fulfillment of role.', positive: 'Vision and opinions about the world grow cumulatively through the passage of time.', negative: 'Tends to put a "ceiling" on ideals, limiting them to practical objectives.' },
  10: { house: 10, pastLife: 'In a previous life you already knew what it was like to lose social position and start from below.', presentLesson: 'That experience generated talent and insight to move safely toward current goals.', positive: 'Over time can reach everything realistically proposed within the professional field.', negative: 'Must balance social ambitions with personal happiness. Avoid rigid social roles.' },
  11: { house: 11, pastLife: 'In a past life you and your friends suffered injustice, isolation, and limitations in communication.', presentLesson: 'A person who can be trusted from a group perspective — fulfills undertakings.', positive: 'Long-term relationships, well-selected, in which you can deeply trust.', negative: 'Tends to use people in friendship relationships for practical purposes.' },
  12: { house: 12, pastLife: 'In a previous life you lived through an important period of social isolation, perhaps in exile.', presentLesson: 'Will acquire more self-confidence, perceiving the great strength of faith and conviction.', positive: 'Great capacity for sacrifice. Knows how to work intensely for what inspires highest feelings.', negative: 'Fear of success and expansion. Needs long moments of solitude.' },
};

// Retrograde planets — karmic blocked energies
export interface RetrogradeKarmicMeaning {
  planet: string;
  blockedEnergy: string;
  pastLifePattern: string;
  presentWork: string;
}

export const RETROGRADE_KARMIC: Record<string, RetrogradeKarmicMeaning> = {
  Mercury: { planet: 'Mercury', blockedEnergy: 'Communication and thinking are internalized. Ideas may not flow freely outward.', pastLifePattern: 'Misuse of information, broken agreements, or punishment for speaking truth.', presentWork: 'Develop inner wisdom before speaking. Review, revise, and refine communication.' },
  Venus: { planet: 'Venus', blockedEnergy: 'Love and values are turned inward. Difficulty expressing affection openly.', pastLifePattern: 'Superficial judgment of beauty, or love given with conditions and expectations.', presentWork: 'Develop inner beauty and self-worth. Re-examine what you truly value.' },
  Mars: { planet: 'Mars', blockedEnergy: 'Action and assertion are delayed or internalized. May struggle to act decisively.', pastLifePattern: 'Excessive aggression, or failure to act when courage was needed.', presentWork: 'Develop patient, strategic action. Channel energy through inner discipline.' },
  Jupiter: { planet: 'Jupiter', blockedEnergy: 'Expansion and faith are internalized. External opportunities may feel limited.', pastLifePattern: 'Waste of resources or excessive indulgence. Misplaced faith.', presentWork: 'Develop inner philosophy and wisdom. Practice gratitude and moderation.' },
  Saturn: { planet: 'Saturn', blockedEnergy: 'Discipline and structure are internalized. Authority issues surface.', pastLifePattern: 'Abuse of authority, or avoidance of responsibility and commitment.', presentWork: 'Build inner structure and self-discipline. Take responsibility without rigidity.' },
  Uranus: { planet: 'Uranus', blockedEnergy: 'Innovation and freedom are expressed unconventionally or belatedly.', pastLifePattern: 'Revolution without responsibility, or radical change that harmed others.', presentWork: 'Develop inner liberation. True freedom comes from internal transformation.' },
  Neptune: { planet: 'Neptune', blockedEnergy: 'Spirituality and imagination are deeply internalized. May struggle to share visions.', pastLifePattern: 'Escapism, deception, or misuse of spiritual power.', presentWork: 'Develop discernment in spiritual matters. Ground intuition in reality.' },
  Pluto: { planet: 'Pluto', blockedEnergy: 'Transformative power is deeply internalized. Control issues surface subtly.', pastLifePattern: 'Manipulation, abuse of power, or refusal to transform when needed.', presentWork: 'Develop inner empowerment. Transform yourself before trying to transform others.' },
};

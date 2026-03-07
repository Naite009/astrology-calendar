// Moon in Signs & Houses — Steven Forrest, "The Book of the Moon"
// Source: Chapter 1 key concepts tables

export interface ForrestMoonSign {
  sign: string;
  evolutionaryGoal: string;
  mood: string;
  reigningNeed: string;
  secretOfHappiness: string;
  shadow: string;
}

export interface ForrestMoonHouse {
  house: number;
  soulIntention: string;
  moodSensitiveTo: string;
  reigningNeed: string;
  criticalWhimsy: string;
  soulCage: string;
}

export const FORREST_MOON_SIGNS: ForrestMoonSign[] = [
  {
    sign: 'Aries',
    evolutionaryGoal: 'Courage; Capacity to claim one\'s rights',
    mood: 'Edgy; Competitive; Heroic',
    reigningNeed: 'Victory',
    secretOfHappiness: 'Regular adventures involving conquest of fear',
    shadow: 'Cruelty; Rage; Insensitivity',
  },
  {
    sign: 'Taurus',
    evolutionaryGoal: 'Grounding; Calming; Centering; Stability; Comfort',
    mood: 'Pragmatic; Down-to-earth; Realistic',
    reigningNeed: 'Attunement to the Inner Animal Wisdom',
    secretOfHappiness: 'Simple pleasures; physical comfort; nature',
    shadow: 'Rigidity; Boring one\'s self',
  },
  {
    sign: 'Gemini',
    evolutionaryGoal: 'A wide-open mind; Finding one\'s own voice',
    mood: 'Curious; Restless; Outgoing',
    reigningNeed: 'Stimulation; Novelty; Surprise',
    secretOfHappiness: 'Fresh conversation & experience; Listening',
    shadow: 'Distraction; Living from the neck up',
  },
  {
    sign: 'Cancer',
    evolutionaryGoal: 'Healing Power, first inwardly then outwardly',
    mood: 'Sensitive; Sweet sorrow',
    reigningNeed: 'Safety; Quiet; Home',
    secretOfHappiness: 'Silent, soulful hours, alone and with dear ones',
    shadow: 'Fearful withdrawal; Hiding behind care-giving',
  },
  {
    sign: 'Leo',
    evolutionaryGoal: 'Spontaneous, confident self-expression',
    mood: 'Quiet dignity',
    reigningNeed: 'Appreciation; Attention',
    secretOfHappiness: 'Free-flowing creativity before the right audience',
    shadow: 'Self-importance',
  },
  {
    sign: 'Virgo',
    evolutionaryGoal: 'Perfection of a skillful service; Self-improvement',
    mood: 'Discontent with the status quo',
    reigningNeed: 'To make something "just a little bit better"',
    secretOfHappiness: 'Finding work that matters; Balancing self-love with endless effort',
    shadow: 'Crippling criticism of self and others',
  },
  {
    sign: 'Libra',
    evolutionaryGoal: 'Serenity; Release of tension',
    mood: 'Aesthetic; Affiliative; Graceful',
    reigningNeed: 'Harmony with people, sounds, colors, and within the psyche',
    secretOfHappiness: 'Relationship skills; Choosing the right partners; Valuing aesthetics',
    shadow: 'Too much compromise; Dithering; Codependency',
  },
  {
    sign: 'Scorpio',
    evolutionaryGoal: 'Honest connection with strong emotion',
    mood: 'Intense; Probing; Suspicious',
    reigningNeed: 'To get to the bottom of things; Intense encounter',
    secretOfHappiness: 'Facing inner and interpersonal fears',
    shadow: 'Moodiness; Isolation; Self-absorption',
  },
  {
    sign: 'Sagittarius',
    evolutionaryGoal: 'Broad experience digested and turned into meaning',
    mood: 'Expansive; Adventurous; Colorful; Philosophical',
    reigningNeed: 'To divine the meaning of life from broad experience',
    secretOfHappiness: 'To treat boredom and predictability as Cardinal Sins',
    shadow: 'Restless escapism; Superficial philosophizing',
  },
  {
    sign: 'Capricorn',
    evolutionaryGoal: 'Integrity and Great Works',
    mood: 'Serious; Driven; Solitary',
    reigningNeed: 'Achievement; Respect',
    secretOfHappiness: 'Worthy work; The Discipline of Spontaneity',
    shadow: 'Time-serving despair; Futility',
  },
  {
    sign: 'Aquarius',
    evolutionaryGoal: 'Individuation; Gathering experience outside consensual reality',
    mood: 'Questioning; Independent; Iconoclastic',
    reigningNeed: 'Freedom of Thought and Action',
    secretOfHappiness: 'Casting off the pitiful need for approval',
    shadow: 'Coldness; Dissociation',
  },
  {
    sign: 'Pisces',
    evolutionaryGoal: 'Transparency of ego; Surrender to Spirit',
    mood: 'Sensitive; Attuned; Generous; Fanciful; Humorous',
    reigningNeed: 'Contact with the world beyond material rationality',
    secretOfHappiness: 'Meditative trance-time; Anything that supports the visionary imagination',
    shadow: 'Dissipation of vital energies; Dreaming the life away',
  },
];

export const FORREST_MOON_HOUSES: ForrestMoonHouse[] = [
  {
    house: 1,
    soulIntention: 'Learning to follow the heart',
    moodSensitiveTo: 'Everything; How the self is being seen',
    reigningNeed: 'To give and receive care & attention',
    criticalWhimsy: 'To make big decisions intuitively and quickly',
    soulCage: 'Giving too much power to the fear of getting hurt',
  },
  {
    house: 2,
    soulIntention: 'Learning to feel worthy & legitimate via meaningful attainments',
    moodSensitiveTo: 'Dismissal; Humiliation; Perceived lack of resources',
    reigningNeed: 'To prove one\'s self; To accomplish; To establish security',
    criticalWhimsy: 'Supplying one\'s self with necessary tools and resources',
    soulCage: 'Under-achievement; Mediocrity',
  },
  {
    house: 3,
    soulIntention: 'Learning; Teaching; Finding one\'s true voice',
    moodSensitiveTo: 'Rapid shifts in the ambient energy; Nuances of speech',
    reigningNeed: 'Communication; Being heard and understood',
    criticalWhimsy: 'Speaking up before thinking it through — and trusting the result',
    soulCage: 'Superficiality; Getting lost in information without meaning',
  },
  {
    house: 4,
    soulIntention: 'To deepen one\'s soul within the context of long, trusting relationships',
    moodSensitiveTo: 'The quality of the home life; Rejection; The ambiance of place',
    reigningNeed: 'To create roots; Emotional safety',
    criticalWhimsy: 'Trusting intuition about home and partners',
    soulCage: 'Withdrawal into inner world',
  },
  {
    house: 5,
    soulIntention: 'To leave tangible evidence of one\'s inner life in the hands of the world',
    moodSensitiveTo: 'Audience reaction; Rebuff; Applause',
    reigningNeed: 'The joy of being appreciated',
    criticalWhimsy: 'Confidently plunging ahead in self-expression',
    soulCage: 'Giving too much power to the opinions of others',
  },
  {
    house: 6,
    soulIntention: 'Service; Finding one\'s natural skill; Seeking mentors',
    moodSensitiveTo: 'Others\' needs; The presence of true Teachers; Respect and disrespect',
    reigningNeed: 'To be competent and useful',
    criticalWhimsy: 'Opening spontaneously to teachers and role models',
    soulCage: 'Slavery; A life defined by meaningless duties',
  },
  {
    house: 7,
    soulIntention: 'Learning who to trust and how to trust',
    moodSensitiveTo: 'Other people\'s moods',
    reigningNeed: 'A sense of connection',
    criticalWhimsy: 'Taking the risk of initiating intimacy',
    soulCage: 'Projecting one\'s own emotions onto others',
  },
  {
    house: 8,
    soulIntention: 'Deepening; Healing; Marrying passion and wisdom',
    moodSensitiveTo: 'Undercurrents of emotion; "Chemistry" between people',
    reigningNeed: 'A feeling of being deeply bonded',
    criticalWhimsy: 'Overcoming inhibition and self-protection',
    soulCage: 'Moody isolation',
  },
  {
    house: 9,
    soulIntention: 'Immersion in broad experience; Stepping outside one\'s cultural limits',
    moodSensitiveTo: 'Alternative paradigms; Philosophical & moral issues',
    reigningNeed: 'A meaningful life; Fresh experience',
    criticalWhimsy: 'A willingness to leap into the Unknown',
    soulCage: 'Stultifying adherence to opinion & "religion"',
  },
  {
    house: 10,
    soulIntention: 'To bear fruit in the community; To leave a mark',
    moodSensitiveTo: 'The social ambiance: Opportunity; Status',
    reigningNeed: 'A sense of mission; Recognition',
    criticalWhimsy: 'Stepping outside of a "job description"',
    soulCage: 'Accepting external social definition',
  },
  {
    house: 11,
    soulIntention: 'To cultivate commitment to long-term strategy; To establish strategic alliances',
    moodSensitiveTo: '"Tribal" undercurrents; Group dynamics',
    reigningNeed: 'A sense of progress; Meaningful membership',
    criticalWhimsy: 'Letting the heart set the initial goals',
    soulCage: 'Being consumed by the will and style of a tribal group',
  },
  {
    house: 12,
    soulIntention: 'To behave as if spiritual growth were the main purpose of life',
    moodSensitiveTo: 'Psychic undercurrents; Energy; Subtle influences',
    reigningNeed: 'Communion with deep psyche, God, soul — pick your term',
    criticalWhimsy: 'Heeding the call to withdraw momentarily from the world',
    soulCage: 'A state of being psychically overwhelmed; Escapism',
  },
];

/** Core Forrest Moon concepts — applicable regardless of sign/house */
export const FORREST_MOON_CONCEPTS = {
  summary: 'The Moon is your heart — the thing that balances your head. It is your mood averaged over a lifetime, your reigning need, and the secret of your happiness.',
  reigningNeed: 'Meeting the needs of the Moon is the secret of happiness. The Moon\'s needs often masquerade as logic, but they are fundamentally emotional and instinctual.',
  secretOfHappiness: 'The Sun is the Secret of Sanity, and the Moon is the Secret of Happiness. Listening to the Moon — heeding our hearts — keeps life feeling soulful and worth living.',
  whimsy: 'One of the arts of living well is to recognize opportunities to indulge in whimsy and to take advantage of them. The Moon conveys its precious information in the form of whimsy.',
  healer: 'We heal by trusting the laws of the inner world, by paying attention to our hearts, by not compromising too much on our reigning needs, and by surrendering to the whimsy of the moment.',
  moonSpeed: {
    fast: 'Quick to trust and connect; Initially revealing; Quick to process information; Quick to adapt; Inclined to say "yes"; Alert and immediate; Good at seeing patterns',
    slow: 'Slow to trust and connect; Initially more guarded; Careful in processing information; More resistant to new circumstances; Inclined to say "no"; Deliberate; Good at noticing details',
    average: '13°10\'35" per day',
    note: 'Moon speed has no bearing on intelligence, but it says a lot about the style and flow of mental processes.',
  },
  source: 'Steven Forrest, The Book of the Moon',
};

/** Lookup helpers */
export function getForrestMoonSign(sign: string): ForrestMoonSign | undefined {
  return FORREST_MOON_SIGNS.find(m => m.sign === sign);
}

export function getForrestMoonHouse(house: number): ForrestMoonHouse | undefined {
  return FORREST_MOON_HOUSES.find(m => m.house === house);
}

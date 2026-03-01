// April Elliott Kent "Astrological Transits" — Practical Transit Guidance
// Retrograde do's/don'ts, transit echo concept, planning frameworks

export const KENT_SOURCE = 'April Elliott Kent, Astrological Transits';

export interface RetrogradGuidance {
  planet: string;
  duration: string;
  frequency: string;
  doThis: string[];
  avoidThis: string[];
  theme: string;
}

export const RETROGRADE_GUIDANCE: Record<string, RetrogradGuidance> = {
  Mercury: {
    planet: 'Mercury',
    duration: 'About 3 weeks',
    frequency: '3 times each year',
    doThis: [
      'Catch up with old friends',
      'Visit places you\'ve been before',
      'Review contracts and agreements',
      'Finish old projects',
      'Revisit and revise plans',
    ],
    avoidThis: [
      'Purchasing cars, computers, or phones',
      'Signing important agreements',
      'Traveling to new places on a tight schedule',
      'Starting new communication projects',
    ],
    theme: 'Communication, technology, transportation, siblings, learning',
  },
  Venus: {
    planet: 'Venus',
    duration: 'About 40-43 days',
    frequency: 'Every 18 months',
    doThis: [
      'Recover money owed to you',
      'Review your finances',
      'Redecorate your space',
      'Reunite with people from your past',
      'Reflect on your values and what you truly want in love',
    ],
    avoidThis: [
      'Getting married or forming legal partnerships',
      'Making major purchases',
      'Undergoing cosmetic surgery',
      'Making radical changes to your appearance',
    ],
    theme: 'Relationships, finances, beauty, values, self-worth',
  },
  Mars: {
    planet: 'Mars',
    duration: 'About 58-81 days',
    frequency: 'Every 2 years',
    doThis: [
      'Examine how you deal with anger and assertiveness',
      'Return to a former workplace or profession',
      'Catch up on rest and recovery',
      'Resolve old conflicts',
      'Reflect on how you use your energy',
    ],
    avoidThis: [
      'Starting a new job or business',
      'Entering a competition',
      'Picking fights or escalating conflicts',
      'Elective surgery',
    ],
    theme: 'Work, conflict, assertiveness, competition, sexuality',
  },
  Jupiter: {
    planet: 'Jupiter',
    duration: 'About 4 months',
    frequency: 'Annually (half of each year)',
    doThis: [
      'Go back to school or continue education',
      'Take a long-delayed trip',
      'Reread favorite books',
      'Reflect on your beliefs and philosophy',
      'Reconnect with teachers or mentors',
    ],
    avoidThis: [
      'Gambling or risky speculation',
      'Launching major performances or publications',
      'Beginning a teaching career',
      'Expanding too quickly in business',
    ],
    theme: 'Education, travel, philosophy, expansion, faith',
  },
  Saturn: {
    planet: 'Saturn',
    duration: 'About 4.5 months',
    frequency: 'Annually (half of each year)',
    doThis: [
      'Review existing commitments',
      'Address structural problems in home or work',
      'Reorganize and restructure',
      'Work on self-discipline',
      'Reassess long-term goals',
    ],
    avoidThis: [
      'Making major new commitments',
      'Officially incorporating a business',
      'Taking on heavy new responsibilities',
      'Saying yes when you should say no',
    ],
    theme: 'Career, responsibility, structure, maturity, boundaries',
  },
  Uranus: {
    planet: 'Uranus',
    duration: 'About 5 months',
    frequency: 'Annually (half of each year)',
    doThis: [
      'Reconnect with distant friends and former associates',
      'Revive old networks',
      'Process inner restlessness thoughtfully',
      'Reflect on where you need authentic change',
    ],
    avoidThis: [
      'Making sudden dramatic life changes',
      'Burning bridges impulsively',
      'Acting on restlessness without reflection',
    ],
    theme: 'Change, disruption, rebellion, freedom, innovation',
  },
  Neptune: {
    planet: 'Neptune',
    duration: 'About 5 months',
    frequency: 'Annually (half of each year)',
    doThis: [
      'Spiritual retreat and reflection',
      'Return to spiritually meaningful places',
      'Psychic and intuitive work',
      'Creative and artistic pursuits',
      'See reality more clearly — willing to accept what you see',
    ],
    avoidThis: [
      'Making decisions based on fantasy or wishful thinking',
      'Ignoring the reality you can now see more clearly',
      'Starting addictive habits',
    ],
    theme: 'Spirituality, illusion, disillusion, dreams, compassion',
  },
  Pluto: {
    planet: 'Pluto',
    duration: 'About 5-6 months',
    frequency: 'Annually (half of each year)',
    doThis: [
      'Psychological and physical healing',
      'Cleansing and purging — physical and emotional',
      'Breaking addictive habits',
      'Addressing phobias, fears, and obsessive tendencies',
      'Controlling and empowering yourself',
    ],
    avoidThis: [
      'Trying to control others (will backfire)',
      'Power plays in relationships',
      'Manipulating outcomes',
    ],
    theme: 'Transformation, power, regeneration, inner strength',
  },
};

// Transit Echo concept — when a transit triggers the same natal aspect
export const TRANSIT_ECHO_CONCEPT = {
  source: KENT_SOURCE,
  title: 'Transit Echoes',
  description: 'The effect of a transit is usually much more pronounced if it echoes an aspect in your birth chart. If you were born with Venus and Pluto in difficult aspect, you are extraordinarily sensitive to this combination. When transiting Pluto connects with your natal Venus, it triggers every Venus/Pluto hurt and betrayal you\'ve ever felt — like a doctor testing your reflexes with his hammer.',
  implication: 'When you see a transit activating the same planet pair that exists as a natal aspect in your chart, expect the impact to be significantly amplified. This is one of the most important concepts in transit interpretation.',
};

// Planetary cycle key ages (from Kent)
export const PLANETARY_CYCLE_AGES: Record<string, { cycle: number; keyAges: number[]; description: string }> = {
  Saturn: { cycle: 29.5, keyAges: [7, 14, 22, 29, 36, 44, 51, 59, 66, 73, 81, 88], description: 'Saturn quarters and returns demand greater maturity, self-mastery, and authority.' },
  Jupiter: { cycle: 12, keyAges: [12, 24, 36, 48, 60, 72, 84], description: 'Jupiter returns bring expansion, good breaks, and new cycles of adventure and learning.' },
  Uranus: { cycle: 84, keyAges: [21, 42, 63, 84], description: 'Uranus quarters bring identity crises and the need for authentic change and liberation.' },
};

// Transit orbs recommendation (Kent's system)
export const KENT_TRANSIT_ORBS: Record<string, number> = {
  Moon: 1,
  Sun: 3, Mercury: 3, Venus: 3,
  Mars: 5, Jupiter: 5, Saturn: 5,
  Uranus: 7, Neptune: 7, Pluto: 7,
};

// Daily planning based on the Sun's diurnal motion through houses
export const SUN_DIURNAL_HOUSES: Record<string, { house: number; activity: string }> = {
  '6-8am': { house: 12, activity: 'Sleepy, unformed selves move by rote to get ready for the world.' },
  '8-10am': { house: 11, activity: 'Social tasks — greeting coworkers, returning emails, networking.' },
  '10am-noon': { house: 10, activity: 'Finally dig in to get work done. Career-focused productivity.' },
  'noon-2pm': { house: 9, activity: 'Ready for a break from routine. Freedom to explore and enjoy.' },
  '2-4pm': { house: 8, activity: 'Breakthroughs come. Unconscious mind works things out. Research.' },
  '4-6pm': { house: 7, activity: 'Even out the day. Partnership time. Close up shop.' },
  '6-8pm': { house: 6, activity: 'Dinner, chores, laundry — the practical maintenance of life.' },
  '8-10pm': { house: 5, activity: 'Fun, TV, creative projects, relaxation, romance.' },
  '10pm-midnight': { house: 4, activity: 'Winding down. Rest, retreat, emotional processing.' },
  'midnight-2am': { house: 3, activity: 'Mind still active. Haven\'t reached deepest sleep yet.' },
  '2-4am': { house: 2, activity: 'Physically restorative and healing deep sleep.' },
  '4-6am': { house: 1, activity: 'Brain reinforces learning and commits new skills to memory.' },
};

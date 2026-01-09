// ============================================================================
// ELECTIONAL CALENDAR 2026 - COMPLETE DATABASE
// HARDCODED - All dates from CHANI + Traditional Electional Astrology
// ============================================================================

export interface ElectionalDayData {
  date: string;
  warning?: 'RED' | 'YELLOW' | 'PURPLE';
  rating?: 'GREEN' | 'BLUE' | 'PURPLE';
  reason: string;
  avoid?: string[];
  best_for?: string[];
  why: string;
  workaround?: string;
  power?: string;
}

export const DATES_TO_AVOID_2026: ElectionalDayData[] = [
  // JANUARY 2026
  {
    date: '2026-01-03',
    warning: 'RED',
    reason: 'Full Moon in Cancer opposite Mars',
    avoid: ['Weddings', 'Business launches', 'Major agreements', 'Family gatherings'],
    why: 'Emotions charged, tempers flare. Mars opposition = conflict potential.',
    workaround: "If must proceed: Schedule AFTER 12pm PT when Moon closer to supportive Jupiter. Don't take the bait if someone picks a fight."
  },
  {
    date: '2026-01-05',
    warning: 'RED',
    reason: 'Mars square Pluto',
    avoid: ['Power negotiations', 'Contracts', 'Partnerships', 'Authority confrontations'],
    why: 'Ego clashes, power struggles. Control issues surface. Warrior meets underworld.',
    workaround: "Protect your energy. Let others mind their business. Don't get involved."
  },

  // FEBRUARY 2026
  {
    date: '2026-02-01',
    warning: 'YELLOW',
    reason: 'Venus square Saturn',
    avoid: ['First dates', 'Weddings', 'Marriage proposals', 'Fun ventures'],
    why: 'Limiting, stifling. Saturn reality check on Venus pleasure. Downer energy.',
    workaround: 'Good for setting boundaries in relationships. May have to learn the hard way.'
  },
  {
    date: '2026-02-17',
    warning: 'RED',
    reason: "Solar Eclipse in Aquarius (28°49')",
    avoid: ['ALL major launches', 'Weddings', 'Travel', 'Contracts', 'Big decisions'],
    why: 'Eclipse = power surge/outage. Unpredictable shifts. Things hidden come to light.',
    workaround: 'Wait at least 3 days before OR after. Eclipse window too volatile for planning.'
  },
  {
    date: '2026-02-20',
    warning: 'PURPLE',
    reason: "Saturn conjunct Neptune (0°44' Aries) - Every 36 years!",
    avoid: ['Unrealistic ventures', 'Signing under delusion', 'Wishful thinking contracts'],
    why: 'Dreams meet reality. Can be disillusionment OR practical magic.',
    workaround: 'Good IF you have solid, realistic plan. Bad if being delusional or avoiding reality.'
  },
  {
    date: '2026-02-25',
    warning: 'YELLOW',
    reason: 'Mercury Retrograde begins in Pisces (through March 20)',
    avoid: ['New contracts', 'Electronics purchases', 'Starting new projects', 'Travel if avoidable'],
    why: 'Classic Mercury Rx: delays, miscommunications, tech issues, things need redoing.',
    workaround: "Good for: Review, revise, reconnect with old contacts. Don't start new things."
  },

  // MARCH 2026
  {
    date: '2026-03-03',
    warning: 'RED',
    reason: "Lunar Eclipse in Virgo (12°54')",
    avoid: ['All major launches', 'Weddings', 'Big decisions', 'Commitments'],
    why: 'Eclipse = release, catharsis. Things come to light. Emotional revelations.',
    workaround: 'Wait 3 days either side. Use for endings, not beginnings.'
  },
  {
    date: '2026-03-13',
    warning: 'YELLOW',
    reason: 'Mars conjunct North Node',
    avoid: ["Weddings (don't seat angry cousins together!)", 'Sensitive negotiations', 'Diplomacy'],
    why: 'Frustrations get megaphone. Abundant energy for action BUT tempers/tensions high.',
    workaround: 'Good for: Competition, sports, taking bold action. Bad for: Keeping peace.'
  },

  // APRIL 2026
  {
    date: '2026-04-10',
    warning: 'YELLOW',
    reason: 'Venus square Pluto',
    avoid: ['Relationship milestones', 'Declarations under pressure', 'Financial agreements with manipulation'],
    why: 'Drama potential HIGH. Power-obsessed Pluto crashes Venus party. Jealousy, control.',
    workaround: "Resist urge to make mountains out of molehills. Don't force intensity."
  },

  // MAY 2026
  {
    date: '2026-05-17',
    warning: 'YELLOW',
    reason: 'Mars square Chiron',
    avoid: ['Confrontations', 'Aggressive action', 'Triggering wounded people'],
    why: 'Conflict planet Mars hits deepest wounds (Chiron). Very uncomfortable combo.',
    workaround: 'Extra compassion needed. Tread lightly. People are extra sensitive.'
  },
  {
    date: '2026-05-29',
    warning: 'YELLOW',
    reason: 'Mars opposite Pluto',
    avoid: ['Contract signings', 'Power negotiations', 'Authority confrontations'],
    why: 'Control issues, power struggles likely. Force meets resistance.',
    workaround: "Be extra clear about needs. Direct communication. Don't play power games."
  },

  // JUNE 2026
  {
    date: '2026-06-29',
    warning: 'YELLOW',
    reason: 'Mercury Retrograde begins in Cancer (through July 23)',
    avoid: ['New contracts', 'Electronics', 'Starting projects', 'Travel'],
    why: 'Mercury Rx strikes again. Extra emotional in Cancer. Communication issues.',
    workaround: 'Good for: Family reconciliations, emotional healing. Bad for: New starts.'
  },

  // JULY 2026
  {
    date: '2026-07-19',
    warning: 'YELLOW',
    reason: 'Venus square Uranus',
    avoid: ['Traditional weddings', 'Conventional partnerships', 'Conservative ventures'],
    why: 'Uranus brings sudden changes. Venus relationships disrupted. Unpredictability.',
    workaround: 'Good for: Unconventional unions, innovative partnerships. Bad for: Traditional.'
  },

  // AUGUST 2026
  {
    date: '2026-08-12',
    warning: 'RED',
    reason: "Solar Eclipse in Leo (20°01')",
    avoid: ['All major launches', 'Weddings', 'Big decisions', 'Travel'],
    why: 'Eclipse energy = unpredictable power shifts. Things hidden revealed.',
    workaround: 'Wait at least 3 days before or after. Use eclipse for reflection, not action.'
  },
  {
    date: '2026-08-27',
    warning: 'RED',
    reason: 'Lunar Eclipse in Pisces',
    avoid: ['All major launches', 'Commitments', 'New ventures'],
    why: 'Eclipse = things revealed, released. Emotional catharsis. Endings.',
    workaround: 'Good for: Letting go, endings, closure. Bad for: New beginnings.'
  },

  // OCTOBER 2026
  {
    date: '2026-10-24',
    warning: 'YELLOW',
    reason: 'Mercury Retrograde begins in Scorpio (through Nov 13)',
    avoid: ['Financial contracts', 'Business mergers', 'Major purchases'],
    why: 'Mercury Rx in intense Scorpio = hidden issues surface. Financial miscommunication.',
    workaround: 'Good for: Therapy, shadow work, investigating past. Bad for: New financial deals.'
  },

  // DECEMBER 2026
  {
    date: '2026-12-16',
    warning: 'YELLOW',
    reason: 'Mars square Saturn',
    avoid: ['Forcing things', 'Aggressive action', 'Impatient decisions'],
    why: 'Drive (Mars) hits limits (Saturn). Frustration, delays, obstacles.',
    workaround: 'Patience required. Strategic action beats brute force. Slow and steady.'
  }
];

export const BEST_DAYS_2026: ElectionalDayData[] = [
  // JANUARY 2026
  {
    date: '2026-01-06',
    rating: 'PURPLE',
    reason: "Venus Cazimi + Triple Conjunction ☉♀♂ at 16°22' Capricorn",
    best_for: ['Love commitments', 'Business partnerships', 'Financial deals', 'Professional achievement'],
    why: 'EXTREMELY RARE! Happens every 32 years. Venus empowered by Sun, Mars adds drive.',
    power: 'Professional partnerships through balance and strength. Achievement through relationships.'
  },
  {
    date: '2026-01-09',
    rating: 'GREEN',
    reason: "Mars Cazimi at 19°09' Capricorn",
    best_for: ['Launches', 'Bold action', 'Competition', 'Starting athletic training'],
    why: 'Mars empowered by Sun. Peak drive, courage, and action energy.',
    power: 'Start businesses, begin training programs, assert yourself. Courage is maximum.'
  },
  {
    date: '2026-01-18',
    rating: 'GREEN',
    reason: "New Moon in Capricorn (28°43')",
    best_for: ['Business launches', 'Career moves', 'Long-term plans', 'Professional ventures'],
    why: 'New Moon = new beginnings. Capricorn = structure that lasts. Build foundations.',
    power: 'Set intentions for professional success, career advancement, building empire.'
  },
  {
    date: '2026-01-21',
    rating: 'BLUE',
    reason: "Mercury Cazimi in Aquarius (1°37')",
    best_for: ['Contracts', 'Communication launches', 'Website launches', 'Innovation'],
    why: 'Mercury empowered by Sun. Brilliant ideas, clear communication, mental peak.',
    power: 'Sign important papers, launch websites, announce plans, share innovations.'
  },
  {
    date: '2026-01-29',
    rating: 'BLUE',
    reason: 'Mercury conjunct Venus',
    best_for: ['Love letters', 'Creative projects', 'Sweet conversations', 'Artistic communication'],
    why: 'Words of love flow easily! Heart on sleeve energy. Express yourself.',
    power: "Don't wait for Valentine's Day! Say what needs saying with grace."
  },

  // FEBRUARY 2026
  {
    date: '2026-02-10',
    rating: 'GREEN',
    reason: 'Venus enters Pisces (exalted)',
    best_for: ['Romance', 'Weddings', 'Artistic ventures', 'Spiritual love'],
    why: 'Venus at PEAK powers in Pisces. Magnetism off the charts!',
    power: 'Lead with your heart. Make real-life magic. Love flows.'
  },
  {
    date: '2026-02-11',
    rating: 'BLUE',
    reason: "Mercury conjunct North Node (9°05' Pisces)",
    best_for: ['Important conversations', 'Destiny discussions', 'Purpose talks'],
    why: 'Communication aligned with life path and destiny point.',
    power: 'Talk about your purpose, future direction, soul mission.'
  },
  {
    date: '2026-02-17',
    rating: 'BLUE',
    reason: "Venus conjunct North Node (8°56' Pisces)",
    best_for: ['Fated connections', 'Soulmate meetings', 'Destiny relationships'],
    why: 'Love planet meets destiny point. Relationships that change life.',
    power: 'Pay attention to who you meet. This could be significant.'
  },
  {
    date: '2026-02-22',
    rating: 'GREEN',
    reason: "Venus trine Jupiter (15°31' Pisces-Cancer)",
    best_for: ['Abundance', 'Joy', 'Celebrations', 'Money opportunities'],
    why: 'Two benefics in harmony! Lucky in love and money. Expansive joy.',
    power: 'Ask for raise, propose, throw party, enjoy pleasures.'
  },

  // MARCH 2026
  {
    date: '2026-03-07',
    rating: 'BLUE',
    reason: "Mercury Cazimi in Pisces (16°52')",
    best_for: ['Creative writing', 'Spiritual contracts', 'Intuitive communication'],
    why: 'Mercury empowered in intuitive Pisces. Inspiration flows.',
    power: 'Write poetry, music, spiritual content. Channel inspiration.'
  },
  {
    date: '2026-03-18',
    rating: 'GREEN',
    reason: "Venus square Jupiter (15°10' Aries-Cancer) + New Moon in Pisces",
    best_for: ['Bold love moves', 'Risk-taking in relationships', 'Expansion'],
    why: 'Go big or go home energy! Venus-Jupiter = abundance through boldness.',
    power: 'Take romantic risks. Expand your capacity for love.'
  },
  {
    date: '2026-03-21',
    rating: 'GREEN',
    reason: "Mars trine Jupiter (15°16' Pisces-Cancer)",
    best_for: ['Bold action', 'Sports', 'Competition', 'Military/athletic ventures'],
    why: 'Action planet harmonizes with luck planet. Courage + wisdom.',
    power: "Take bold action with divine support. You're protected. Go for it!"
  },
  {
    date: '2026-03-22',
    rating: 'PURPLE',
    reason: "Neptune Cazimi (1°50' Aries) - First time in Aries!",
    best_for: ['Visionary launches', 'Artistic innovation', 'Spiritual boldness'],
    why: 'Neptune empowered in NEW sign for 14 years! Generational shift.',
    power: 'Imagine boldly. Act on dreams. Pioneer new spiritual/artistic paths.'
  },
  {
    date: '2026-03-25',
    rating: 'BLUE',
    reason: "Saturn Cazimi (4°43' Aries)",
    best_for: ['Structures', 'Commitments', 'Long-term plans', 'Serious ventures'],
    why: 'Discipline planet empowered. Maximum responsibility energy.',
    power: 'Make serious commitments that last. Build structures. Get real.'
  },

  // APRIL 2026
  {
    date: '2026-04-13',
    rating: 'GREEN',
    reason: 'Venus sextile Jupiter',
    best_for: ['Social ventures', 'Creative projects', 'Fun', 'Connection opportunities'],
    why: 'Easy flow between pleasure and expansion. Opportunities abound.',
    power: 'Explore opportunities for connection. Make friend dates. Curate joy.'
  },
  {
    date: '2026-04-16',
    rating: 'BLUE',
    reason: "Chiron Cazimi (26°38' Aries)",
    best_for: ['Healing work', 'Therapy launches', 'Vulnerability', 'Wound work'],
    why: 'Wounded healer empowered by Sun. Turn wounds into gifts.',
    power: 'Launch healing practices. Do deep work. Transform pain to purpose.'
  },
  {
    date: '2026-04-17',
    rating: 'GREEN',
    reason: "New Moon in Aries (27°29')",
    best_for: ['Bold launches', 'Independence', 'Courage', 'New beginnings'],
    why: 'Aries New Moon = fresh start with fire! Pioneering energy.',
    power: "Begin something you've been scared to start. Be bold."
  },

  // MAY 2026
  {
    date: '2026-05-16',
    rating: 'GREEN',
    reason: "New Moon in Taurus (25°57')",
    best_for: ['Financial ventures', 'Stability', 'Sensual pleasures', 'Building value'],
    why: 'Taurus New Moon = build lasting value. Material security.',
    power: 'Start businesses that make money. Build assets. Ground in pleasure.'
  },

  // JUNE 2026
  {
    date: '2026-06-09',
    rating: 'GREEN',
    reason: 'Venus conjunct Jupiter',
    best_for: ['BIGGEST LOVE/MONEY DAY OF YEAR', 'Celebrations', 'Abundance', 'Pure joy'],
    why: 'Two benefics together = JACKPOT! Maximum luck in love and money.',
    power: "Plunge into life's pleasures. Rally crew for pool party. Indulge with intention."
  },
  {
    date: '2026-06-14',
    rating: 'GREEN',
    reason: "New Moon in Gemini (24°02')",
    best_for: ['Communication projects', 'Learning', 'Social media launches', 'Networking'],
    why: 'Gemini New Moon = share ideas, connect, communicate.',
    power: 'Launch podcasts, blogs, social media. Start learning programs.'
  },

  // JULY 2026
  {
    date: '2026-07-12',
    rating: 'BLUE',
    reason: "Mercury Cazimi in Cancer (20°42')",
    best_for: ['Family discussions', 'Home contracts', 'Emotional intelligence work'],
    why: 'Mercury empowered in nurturing Cancer. Clear emotional communication.',
    power: 'Have the big talk with family. Sign home contracts. Process feelings.'
  },
  {
    date: '2026-07-14',
    rating: 'GREEN',
    reason: "New Moon in Cancer (21°59')",
    best_for: ['Home purchases', 'Family ventures', 'Nurturing businesses', 'Emotional security'],
    why: 'Cancer New Moon = create emotional security, nurture, care.',
    power: 'Set intentions for home and family. Start care-based businesses.'
  },

  // AUGUST 2026
  {
    date: '2026-08-06',
    rating: 'GREEN',
    reason: 'Venus enters Libra (at home!)',
    best_for: ['Weddings', 'Partnerships', 'Beauty ventures', 'Collaborations'],
    why: 'Venus at HOME in Libra. Peak relationship and beauty power!',
    power: 'Get married, form partnerships, create beauty, harmonize relationships.'
  },

  // SEPTEMBER 2026
  {
    date: '2026-09-11',
    rating: 'GREEN',
    reason: 'New Moon in Virgo',
    best_for: ['Health businesses', 'Service', 'Organization', 'Wellness ventures'],
    why: 'Virgo New Moon = practical perfection, health, service.',
    power: 'Launch wellness businesses, organize life, start health programs.'
  },

  // OCTOBER 2026
  {
    date: '2026-10-10',
    rating: 'GREEN',
    reason: 'New Moon in Libra',
    best_for: ['Partnerships', 'Weddings', 'Collaborations', 'Balance work'],
    why: 'Libra New Moon = relationships thrive, partnerships formed.',
    power: 'BEST TIME FOR MARRIAGE ALL YEAR (if NOT during Mercury Rx later!).'
  },

  // NOVEMBER 2026
  {
    date: '2026-11-04',
    rating: 'BLUE',
    reason: "Mercury Cazimi in Scorpio (12°10')",
    best_for: ['Deep research', 'Psychological work', 'Investigations', 'Shadow work'],
    why: 'Mercury empowered in intense Scorpio. Penetrating insights.',
    power: 'Do deep research, therapy work, investigate mysteries.'
  },
  {
    date: '2026-11-08',
    rating: 'GREEN',
    reason: 'New Moon in Scorpio',
    best_for: ['Transformation', 'Intimacy', 'Power', 'Rebirth'],
    why: 'Scorpio New Moon = shed old skin, transform, empower.',
    power: 'Set intentions for deep change, intimacy, personal power.'
  },

  // DECEMBER 2026
  {
    date: '2026-12-07',
    rating: 'GREEN',
    reason: 'New Moon in Sagittarius',
    best_for: ['Travel ventures', 'Education', 'Philosophy', 'Adventure'],
    why: 'Sagittarius New Moon = expand horizons, learn, explore.',
    power: 'Book trip, enroll in school, start teaching, adventure out.'
  }
];

// Helper to get all 2026 electional data by date
export const getElectional2026Data = (date: Date): ElectionalDayData | null => {
  const dateStr = date.toISOString().split('T')[0];
  
  const avoidDay = DATES_TO_AVOID_2026.find(d => d.date === dateStr);
  if (avoidDay) return avoidDay;
  
  const bestDay = BEST_DAYS_2026.find(d => d.date === dateStr);
  if (bestDay) return bestDay;
  
  return null;
};

// Get all data for a specific month
export const get2026MonthData = (month: number): ElectionalDayData[] => {
  const allData = [...DATES_TO_AVOID_2026, ...BEST_DAYS_2026];
  return allData.filter(d => {
    const date = new Date(d.date);
    return date.getMonth() === month && date.getFullYear() === 2026;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

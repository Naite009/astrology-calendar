// ============================================================================
// COMPLETE ASTROLOGICAL DATA FOR ENHANCED PLANET DETAILS
// ============================================================================

export const PLANET_DIGNITIES: Record<string, {
  rulership: string | string[];
  exaltation: string;
  detriment: string | string[];
  fall: string;
}> = {
  Sun: {
    rulership: 'Leo',
    exaltation: 'Aries (19°)',
    detriment: 'Aquarius',
    fall: 'Libra (19°)'
  },
  Moon: {
    rulership: 'Cancer',
    exaltation: 'Taurus (3°)',
    detriment: 'Capricorn',
    fall: 'Scorpio (3°)'
  },
  Mercury: {
    rulership: ['Gemini', 'Virgo'],
    exaltation: 'Virgo (15°)',
    detriment: ['Sagittarius', 'Pisces'],
    fall: 'Pisces (15°)'
  },
  Venus: {
    rulership: ['Taurus', 'Libra'],
    exaltation: 'Pisces (27°)',
    detriment: ['Scorpio', 'Aries'],
    fall: 'Virgo (27°)'
  },
  Mars: {
    rulership: ['Aries', 'Scorpio'],
    exaltation: 'Capricorn (28°)',
    detriment: ['Libra', 'Taurus'],
    fall: 'Cancer (28°)'
  },
  Jupiter: {
    rulership: ['Sagittarius', 'Pisces'],
    exaltation: 'Cancer (15°)',
    detriment: ['Gemini', 'Virgo'],
    fall: 'Capricorn (15°)'
  },
  Saturn: {
    rulership: ['Capricorn', 'Aquarius'],
    exaltation: 'Libra (21°)',
    detriment: ['Cancer', 'Leo'],
    fall: 'Aries (21°)'
  },
  Uranus: {
    rulership: 'Aquarius',
    exaltation: 'Scorpio',
    detriment: 'Leo',
    fall: 'Taurus'
  },
  Neptune: {
    rulership: 'Pisces',
    exaltation: 'Cancer',
    detriment: 'Virgo',
    fall: 'Capricorn'
  },
  Pluto: {
    rulership: 'Scorpio',
    exaltation: 'Aries',
    detriment: 'Taurus',
    fall: 'Libra'
  }
};

export const SIGN_PROPERTIES: Record<string, { element: string; mode: string; ruler: string }> = {
  Aries: { element: 'Fire', mode: 'Cardinal', ruler: 'Mars' },
  Taurus: { element: 'Earth', mode: 'Fixed', ruler: 'Venus' },
  Gemini: { element: 'Air', mode: 'Mutable', ruler: 'Mercury' },
  Cancer: { element: 'Water', mode: 'Cardinal', ruler: 'Moon' },
  Leo: { element: 'Fire', mode: 'Fixed', ruler: 'Sun' },
  Virgo: { element: 'Earth', mode: 'Mutable', ruler: 'Mercury' },
  Libra: { element: 'Air', mode: 'Cardinal', ruler: 'Venus' },
  Scorpio: { element: 'Water', mode: 'Fixed', ruler: 'Mars' },
  Sagittarius: { element: 'Fire', mode: 'Mutable', ruler: 'Jupiter' },
  Capricorn: { element: 'Earth', mode: 'Cardinal', ruler: 'Saturn' },
  Aquarius: { element: 'Air', mode: 'Fixed', ruler: 'Saturn' },
  Pisces: { element: 'Water', mode: 'Mutable', ruler: 'Jupiter' }
};

export const HOUSE_TYPES: Record<number, string> = {
  1: 'Angular', 2: 'Succedent', 3: 'Cadent',
  4: 'Angular', 5: 'Succedent', 6: 'Cadent',
  7: 'Angular', 8: 'Succedent', 9: 'Cadent',
  10: 'Angular', 11: 'Succedent', 12: 'Cadent'
};

export const TRIPLICITY_RULERS: Record<string, { day: string; night: string; participating: string }> = {
  Fire: { day: 'Sun', night: 'Jupiter', participating: 'Saturn' },
  Earth: { day: 'Venus', night: 'Moon', participating: 'Mars' },
  Air: { day: 'Saturn', night: 'Mercury', participating: 'Jupiter' },
  Water: { day: 'Venus', night: 'Mars', participating: 'Moon' }
};

export const DECAN_RULERS: Record<string, [string, string, string]> = {
  // Each sign divided into 3 decans (0-10°, 10-20°, 20-30°)
  Aries: ['Mars', 'Sun', 'Venus'],
  Taurus: ['Mercury', 'Moon', 'Saturn'],
  Gemini: ['Jupiter', 'Mars', 'Sun'],
  Cancer: ['Venus', 'Mercury', 'Moon'],
  Leo: ['Saturn', 'Jupiter', 'Mars'],
  Virgo: ['Sun', 'Venus', 'Mercury'],
  Libra: ['Moon', 'Saturn', 'Jupiter'],
  Scorpio: ['Mars', 'Sun', 'Venus'],
  Sagittarius: ['Mercury', 'Moon', 'Saturn'],
  Capricorn: ['Jupiter', 'Mars', 'Sun'],
  Aquarius: ['Venus', 'Mercury', 'Moon'],
  Pisces: ['Saturn', 'Jupiter', 'Mars']
};

// Egyptian Terms (Bounds) - Ptolemaic
export const EGYPTIAN_TERMS: Record<string, Array<{ ruler: string; end: number }>> = {
  Aries: [
    { ruler: 'Jupiter', end: 6 },
    { ruler: 'Venus', end: 12 },
    { ruler: 'Mercury', end: 20 },
    { ruler: 'Mars', end: 25 },
    { ruler: 'Saturn', end: 30 }
  ],
  Taurus: [
    { ruler: 'Venus', end: 8 },
    { ruler: 'Mercury', end: 14 },
    { ruler: 'Jupiter', end: 22 },
    { ruler: 'Saturn', end: 27 },
    { ruler: 'Mars', end: 30 }
  ],
  Gemini: [
    { ruler: 'Mercury', end: 6 },
    { ruler: 'Jupiter', end: 12 },
    { ruler: 'Venus', end: 17 },
    { ruler: 'Mars', end: 24 },
    { ruler: 'Saturn', end: 30 }
  ],
  Cancer: [
    { ruler: 'Mars', end: 7 },
    { ruler: 'Venus', end: 13 },
    { ruler: 'Mercury', end: 19 },
    { ruler: 'Jupiter', end: 26 },
    { ruler: 'Saturn', end: 30 }
  ],
  Leo: [
    { ruler: 'Jupiter', end: 6 },
    { ruler: 'Venus', end: 11 },
    { ruler: 'Saturn', end: 18 },
    { ruler: 'Mercury', end: 24 },
    { ruler: 'Mars', end: 30 }
  ],
  Virgo: [
    { ruler: 'Mercury', end: 7 },
    { ruler: 'Venus', end: 17 },
    { ruler: 'Jupiter', end: 21 },
    { ruler: 'Mars', end: 28 },
    { ruler: 'Saturn', end: 30 }
  ],
  Libra: [
    { ruler: 'Saturn', end: 6 },
    { ruler: 'Mercury', end: 14 },
    { ruler: 'Jupiter', end: 21 },
    { ruler: 'Venus', end: 28 },
    { ruler: 'Mars', end: 30 }
  ],
  Scorpio: [
    { ruler: 'Mars', end: 7 },
    { ruler: 'Venus', end: 11 },
    { ruler: 'Mercury', end: 19 },
    { ruler: 'Jupiter', end: 24 },
    { ruler: 'Saturn', end: 30 }
  ],
  Sagittarius: [
    { ruler: 'Jupiter', end: 12 },
    { ruler: 'Venus', end: 17 },
    { ruler: 'Mercury', end: 21 },
    { ruler: 'Saturn', end: 26 },
    { ruler: 'Mars', end: 30 }
  ],
  Capricorn: [
    { ruler: 'Mercury', end: 7 },
    { ruler: 'Jupiter', end: 14 },
    { ruler: 'Venus', end: 22 },
    { ruler: 'Saturn', end: 26 },
    { ruler: 'Mars', end: 30 }
  ],
  Aquarius: [
    { ruler: 'Mercury', end: 7 },
    { ruler: 'Venus', end: 13 },
    { ruler: 'Jupiter', end: 20 },
    { ruler: 'Mars', end: 25 },
    { ruler: 'Saturn', end: 30 }
  ],
  Pisces: [
    { ruler: 'Venus', end: 12 },
    { ruler: 'Jupiter', end: 16 },
    { ruler: 'Mercury', end: 19 },
    { ruler: 'Mars', end: 28 },
    { ruler: 'Saturn', end: 30 }
  ]
};

// Average planetary speeds (degrees per day)
export const AVERAGE_SPEEDS: Record<string, string> = {
  Sun: '0° 59\' / day',
  Moon: '13° 10\' / day',
  Mercury: '1° 23\' / day',
  Venus: '1° 12\' / day',
  Mars: '0° 31\' / day',
  Jupiter: '0° 5\' / day',
  Saturn: '0° 2\' / day',
  Uranus: '0° 0.5\' / day',
  Neptune: '0° 0.2\' / day',
  Pluto: '0° 0.1\' / day'
};

// ============================================================================
// COMPREHENSIVE PLANETARY MOTION DATA
// ============================================================================

export interface CelestialBodySpeed {
  name: string;
  symbol: string;
  category: 'luminaries' | 'personal' | 'social' | 'transpersonal' | 'points' | 'asteroids' | 'tno';
  averageSpeed: string;      // degrees per day
  degreesPerDay: number;     // numeric for sorting
  orbitalPeriod: string;     // around the zodiac
  orbitalYears: number;      // numeric years
  timeInSign: string;        // average time in each sign
  retrogradeFrequency?: string;
  retrogradeDuration?: string;
  retrogradeDetails?: string; // Detailed explanation of retrograde cycle
  speedNote: string;         // Why this matters
  summary: string;           // What this body represents
  discovery?: string;        // When discovered (for minor planets)
  diameter?: string;         // Physical size context
  fixedStarSignificance?: string; // How fixed stars become personally significant
}

export const CELESTIAL_BODY_SPEEDS: CelestialBodySpeed[] = [
  // LUMINARIES
  {
    name: 'Sun',
    symbol: '☉',
    category: 'luminaries',
    averageSpeed: '0° 59\' / day',
    degreesPerDay: 0.9856,
    orbitalPeriod: '365.25 days',
    orbitalYears: 1,
    timeInSign: '~30 days',
    speedNote: 'The Sun moves almost exactly 1° per day, completing the zodiac in one year. This is why your "birthday degree" returns each year.',
    summary: 'Your core identity, ego, life force, and conscious self. The Sun represents what you are becoming and your essential vitality.'
  },
  {
    name: 'Moon',
    symbol: '☽',
    category: 'luminaries',
    averageSpeed: '13° 10\' / day',
    degreesPerDay: 13.176,
    orbitalPeriod: '27.3 days (sidereal) / 29.5 days (synodic)',
    orbitalYears: 0.0748,
    timeInSign: '~2.5 days',
    speedNote: 'The fastest-moving body used in astrology. The Moon changes signs every 2-3 days, which is why knowing your exact birth time matters so much for Moon sign accuracy.',
    summary: 'Your emotional nature, instinctive reactions, needs, and inner child. The Moon shows how you nurture and need to be nurtured.'
  },
  
  // PERSONAL PLANETS
  {
    name: 'Mercury',
    symbol: '☿',
    category: 'personal',
    averageSpeed: '1° 23\' / day',
    degreesPerDay: 1.383,
    orbitalPeriod: '88 days',
    orbitalYears: 0.24,
    timeInSign: '14-30 days (varies due to retrograde)',
    retrogradeFrequency: '3-4 times per year',
    retrogradeDuration: '~3 weeks each',
    retrogradeDetails: `Mercury goes retrograde 3-4 times per year in a predictable pattern:
• Each retrograde lasts about 3 weeks (21-24 days)
• Pre-retrograde shadow: ~2 weeks before (Mercury slows, themes emerge)
• Post-retrograde shadow: ~2 weeks after (re-processing lessons)
• Total cycle: ~7-8 weeks from first shadow to clear

The 3 retrogrades each year move backwards through elements:
• 2025: Aries (Mar), Leo/Virgo (Jul-Aug), Sagittarius (Nov)
• 2026: Pisces/Aries (Feb-Mar), Cancer/Leo (Jun-Jul), Scorpio (Oct-Nov)

Why 3 times? Mercury orbits the Sun 4x per year. Each orbit, it passes between Earth and Sun once, creating the apparent backward motion. The 4th retrograde sometimes squeezes into late December/January.

During retrograde: Mercury appears to move backwards ~10-15°, revisiting degrees it already crossed. This is why old issues, ex-partners, and past miscommunications resurface.`,
    speedNote: 'Mercury never strays more than 28° from the Sun. Its speed varies dramatically—sometimes 2°/day direct, sometimes appearing stationary before retrograde.',
    summary: 'Communication, thinking patterns, learning style, and how you process and share information. Mercury rules the mind and connections.'
  },
  {
    name: 'Venus',
    symbol: '♀',
    category: 'personal',
    averageSpeed: '1° 12\' / day',
    degreesPerDay: 1.2,
    orbitalPeriod: '225 days',
    orbitalYears: 0.615,
    timeInSign: '23-60 days (varies due to retrograde)',
    retrogradeFrequency: 'Every 18 months',
    retrogradeDuration: '~40 days',
    retrogradeDetails: `Venus retrograde is rare and intense—only every 18 months:
• Each retrograde lasts ~40-43 days
• Pre-retrograde shadow: ~3 weeks before
• Post-retrograde shadow: ~3 weeks after
• Total cycle: ~10-11 weeks

Venus retrogrades follow an 8-year pattern (the Venus Star Point):
• 2025: Pisces/Aries (Mar-Apr 2025)
• 2026: Leo/Virgo (Jul-Sep 2026)
• 2028: Capricorn/Aquarius (Dec 2027-Jan 2028)

The 5 Venus retrograde points over 8 years create a perfect pentagram in the sky—this is why the 5-pointed star is associated with Venus/Aphrodite.

During retrograde: Old loves return, relationship issues surface for review, and your values undergo deep reassessment. Not ideal for starting new relationships, major purchases, or aesthetic changes (haircuts, cosmetic procedures). Great for reuniting with lost loves if the connection has substance.`,
    speedNote: 'Venus never strays more than 48° from the Sun. When retrograde, Venus can spend up to 4 months in one sign, intensifying its themes there.',
    summary: 'Love, beauty, values, pleasure, and how you attract and appreciate. Venus shows what you find beautiful and how you relate.'
  },
  {
    name: 'Mars',
    symbol: '♂',
    category: 'personal',
    averageSpeed: '0° 31\' / day',
    degreesPerDay: 0.524,
    orbitalPeriod: '687 days (1.88 years)',
    orbitalYears: 1.88,
    timeInSign: '6-7 weeks (up to 7 months when retrograde)',
    retrogradeFrequency: 'Every 26 months',
    retrogradeDuration: '~2.5 months',
    retrogradeDetails: `Mars retrograde is the rarest of the personal planets—only every 26 months (2+ years):
• Each retrograde lasts ~58-80 days (2-2.5 months)
• Pre-retrograde shadow: ~6-8 weeks before
• Post-retrograde shadow: ~6-8 weeks after
• Total cycle: ~5-6 months from first shadow to clear

Recent and upcoming Mars retrogrades:
• Dec 2024 - Feb 2025: Leo/Cancer (just ended!)
• Jan 2027 - Apr 2027: Virgo/Leo
• Mar 2029 - May 2029: Libra/Virgo

Mars spends 6-7 months in the retrograde sign, making it the longest-lasting personal planet transit. This is why Mars retrograde years feel so significant—one area of life gets intensely worked over.

During retrograde: Physical energy decreases, anger can simmer rather than express, projects stall. Not ideal for starting aggressive campaigns, surgeries (if avoidable), or new physical training regimes. Great for reviewing strategies, healing from old conflicts, and addressing buried anger.`,
    speedNote: 'Mars has the most eccentric orbit of the personal planets. When retrograde, Mars can spend 6-7 months in one sign, creating prolonged action themes.',
    summary: 'Drive, ambition, anger, sexuality, and how you assert yourself. Mars shows how you fight for what you want and your physical energy.'
  },
  
  // SOCIAL PLANETS
  {
    name: 'Jupiter',
    symbol: '♃',
    category: 'social',
    averageSpeed: '0° 5\' / day',
    degreesPerDay: 0.0833,
    orbitalPeriod: '11.86 years',
    orbitalYears: 11.86,
    timeInSign: '~12 months',
    retrogradeFrequency: 'Once per year',
    retrogradeDuration: '~4 months',
    retrogradeDetails: `Jupiter goes retrograde once per year like clockwork:
• Each retrograde lasts ~4 months (120 days)
• Retrogrades every year, shifting ~10-11 degrees through the zodiac
• Jupiter is retrograde about 30% of the time

Jupiter retrograde isn't as disruptive as inner planet retrogrades. During this time:
• Expansion turns inward—internal growth over external success
• Beliefs and philosophy are reconsidered
• Over-extension from the direct period is corrected
• Legal matters may slow or require review

Because Jupiter retrograde is so common, many people are born with natal Jupiter retrograde (~30% of the population). These individuals often find their luck comes from internal wisdom rather than external opportunities.`,
    speedNote: 'Jupiter spends about one year in each sign, making its annual sign change a major astrological event affecting collective optimism and growth areas.',
    summary: 'Expansion, luck, wisdom, higher learning, and beliefs. Jupiter shows where you seek growth, meaning, and abundance.'
  },
  {
    name: 'Saturn',
    symbol: '♄',
    category: 'social',
    averageSpeed: '0° 2\' / day',
    degreesPerDay: 0.0333,
    orbitalPeriod: '29.46 years',
    orbitalYears: 29.46,
    timeInSign: '~2.5 years',
    retrogradeFrequency: 'Once per year',
    retrogradeDuration: '~4.5 months',
    retrogradeDetails: `Saturn goes retrograde once per year:
• Each retrograde lasts ~4.5 months (135-140 days)
• Saturn is retrograde about 36% of the time
• Like Jupiter, many people have natal Saturn retrograde

Saturn retrograde effects:
• Delays and obstacles are internalized—you question your own structures
• Authority issues surface for review
• Karmic debts come due or are released
• Responsibilities that aren't truly yours become clearer

With Saturn retrograde, the hard work doesn't stop—but it becomes more about internal discipline and restructuring your relationship with responsibility, rather than meeting external demands.`,
    speedNote: 'Saturn\'s 29.5-year cycle creates the famous "Saturn Return" at ages 28-30, 58-60, and 87-90. These are major life restructuring periods.',
    summary: 'Discipline, responsibility, limitations, karma, and mastery. Saturn shows where you must work hard and develop maturity.'
  },
  
  // TRANSPERSONAL PLANETS
  {
    name: 'Uranus',
    symbol: '♅',
    category: 'transpersonal',
    averageSpeed: '0° 0.5\' / day',
    degreesPerDay: 0.0117,
    orbitalPeriod: '84 years',
    orbitalYears: 84,
    timeInSign: '~7 years',
    retrogradeFrequency: 'Once per year',
    retrogradeDuration: '~5 months',
    retrogradeDetails: `Uranus goes retrograde once per year for about 5 months:
• Retrograde about 40% of the time
• Very common to have natal Uranus retrograde

Outer planet retrogrades are less personally disruptive because they're so common and move so slowly. Uranus retrograde effects are subtle:
• Inner rebellion and awakening rather than external revolution
• Reviewing where you've been too radical OR too conformist
• Technology and innovation projects may stall for internal restructuring
• Sudden insights come from within rather than external breakthroughs`,
    speedNote: 'Uranus takes 84 years to complete the zodiac—roughly a human lifespan. Its 7-year sign transits mark generational shifts in innovation and rebellion.',
    summary: 'Revolution, awakening, individuality, and sudden change. Uranus shows where you break free from convention and embrace your uniqueness.'
  },
  {
    name: 'Neptune',
    symbol: '♆',
    category: 'transpersonal',
    averageSpeed: '0° 0.2\' / day',
    degreesPerDay: 0.00667,
    orbitalPeriod: '165 years',
    orbitalYears: 165,
    timeInSign: '~14 years',
    retrogradeFrequency: 'Once per year',
    retrogradeDuration: '~5.5 months',
    retrogradeDetails: `Neptune goes retrograde once per year for about 5-6 months:
• Retrograde about 40% of the time
• Very common to have natal Neptune retrograde

Neptune retrograde effects are the subtlest of all:
• Dreams and spiritual experiences become more internal/private
• Illusions and delusions you've been under may become clearer
• Creative projects enter an incubation phase
• Addictive patterns may surface for review and release

Neptune is currently in Pisces (2012-2026), its home sign, making this an especially spiritually potent time. When it enters Aries in 2026, a new 165-year cycle of collective imagination begins.`,
    speedNote: 'Neptune spends 14 years in each sign, shaping the spiritual and artistic sensibilities of entire generations. Currently in Pisces (2012-2026), its home sign.',
    summary: 'Dreams, spirituality, illusion, and transcendence. Neptune shows where you dissolve boundaries and connect to the divine or deceive yourself.'
  },
  {
    name: 'Pluto',
    symbol: '♇',
    category: 'transpersonal',
    averageSpeed: '0° 0.1\' / day',
    degreesPerDay: 0.00417,
    orbitalPeriod: '248 years',
    orbitalYears: 248,
    timeInSign: '12-30 years (varies due to eccentric orbit)',
    retrogradeFrequency: 'Once per year',
    retrogradeDuration: '~6 months',
    retrogradeDetails: `Pluto goes retrograde once per year for about 5-6 months:
• Retrograde about 44% of the time—the most of any planet
• Very common to have natal Pluto retrograde

Pluto's eccentric orbit creates dramatic speed variations:
• Fastest through Scorpio & Sagittarius: ~12 years per sign
• Slowest through Taurus & Gemini: ~30 years per sign
• Currently in Aquarius (2024-2044): ~20 years

Pluto retrograde effects:
• Transformation work becomes internal and psychological
• Power dynamics you've been ignoring surface for review
• Obsessive patterns are confronted from within
• Shadow work intensifies—what's buried demands attention

Pluto won't return to its current zodiac position for 248 years. The "Pluto in Scorpio" generation (1983-1995) won't see Pluto in Scorpio again in their lifetimes.`,
    speedNote: 'Pluto\'s highly elliptical orbit means it spends 12 years in Scorpio but 30 years in Taurus. It moves fastest through Scorpio and Sagittarius.',
    summary: 'Transformation, power, death/rebirth, and the shadow self. Pluto shows where you experience profound change and must confront your depths.'
  },
  
  // POINTS
  {
    name: 'North Node',
    symbol: '☊',
    category: 'points',
    averageSpeed: '-0° 3\' / day (retrograde)',
    degreesPerDay: -0.0528,
    orbitalPeriod: '18.6 years',
    orbitalYears: 18.6,
    timeInSign: '~18 months',
    speedNote: 'The Lunar Nodes always move retrograde (backwards through the zodiac). The Node Return at 18-19 years marks a major karmic turning point.',
    summary: 'Your soul\'s growth direction and destiny. The North Node shows where you\'re meant to evolve, even though it feels uncomfortable.'
  },
  {
    name: 'South Node',
    symbol: '☋',
    category: 'points',
    averageSpeed: '-0° 3\' / day (retrograde)',
    degreesPerDay: -0.0528,
    orbitalPeriod: '18.6 years',
    orbitalYears: 18.6,
    timeInSign: '~18 months',
    speedNote: 'Always exactly opposite the North Node. Represents your karmic past and what comes naturally but may need releasing.',
    summary: 'Past life gifts and karmic baggage. The South Node shows your comfort zone and where you may over-rely on old patterns.'
  },
  {
    name: 'Chiron',
    symbol: '⚷',
    category: 'points',
    averageSpeed: '0° 1.2\' / day (avg)',
    degreesPerDay: 0.02,
    orbitalPeriod: '50.7 years',
    orbitalYears: 50.7,
    timeInSign: '2-8 years (highly eccentric orbit)',
    retrogradeFrequency: 'Once per year',
    retrogradeDuration: '~5 months',
    discovery: '1977',
    speedNote: 'Chiron\'s eccentric orbit means it races through Libra in ~2 years but crawls through Aries for ~8 years. The Chiron Return at 50 is a major healing crisis.',
    summary: 'The "wounded healer." Chiron shows your deepest wound and your greatest gift for healing others through your own pain.'
  },
  {
    name: 'Lilith (Mean)',
    symbol: '⚸',
    category: 'points',
    averageSpeed: '3° 23\' / month',
    degreesPerDay: 0.111,
    orbitalPeriod: '8.85 years',
    orbitalYears: 8.85,
    timeInSign: '~9 months',
    speedNote: 'Black Moon Lilith is the lunar apogee—a calculated point, not a physical body. It represents the Moon\'s farthest point from Earth.',
    summary: 'Your shadow feminine, repressed desires, and raw power. Lilith shows where you refuse to be tamed and may face exile for your authenticity.'
  },
  {
    name: 'Part of Fortune',
    symbol: '⊕',
    category: 'points',
    averageSpeed: 'N/A (calculated)',
    degreesPerDay: 0,
    orbitalPeriod: 'N/A',
    orbitalYears: 0,
    timeInSign: 'Fixed in natal chart',
    speedNote: 'Calculated from Sun, Moon, and Ascendant. Shows where luck, prosperity, and joy naturally flow in your life.',
    summary: 'Your point of greatest fortune and ease. Where the Part of Fortune falls shows natural gifts and paths to happiness.'
  },
  {
    name: 'Vertex',
    symbol: 'Vx',
    category: 'points',
    averageSpeed: 'N/A (calculated)',
    degreesPerDay: 0,
    orbitalPeriod: 'N/A',
    orbitalYears: 0,
    timeInSign: 'Fixed in natal chart',
    speedNote: 'The Vertex is a mathematically calculated point in the western hemisphere of the chart. It\'s called the "fated encounter" point.',
    summary: 'Fated meetings and destined events. The Vertex shows where karmic connections and turning points enter your life through others.'
  },
  
  // ASTEROIDS
  {
    name: 'Ceres',
    symbol: '⚳',
    category: 'asteroids',
    averageSpeed: '0° 12\' / day (avg)',
    degreesPerDay: 0.214,
    orbitalPeriod: '4.6 years',
    orbitalYears: 4.6,
    timeInSign: '~4.5 months',
    retrogradeFrequency: 'Once per year',
    retrogradeDuration: '~3 months',
    discovery: '1801 (first asteroid discovered)',
    diameter: '940 km (largest asteroid)',
    speedNote: 'Ceres was reclassified as a "dwarf planet" in 2006 along with Pluto. It\'s the largest body in the asteroid belt.',
    summary: 'Nurturing, food, agriculture, and the mother-child bond. Ceres shows how you nurture and need to be nurtured, including your relationship with food and nature.'
  },
  {
    name: 'Pallas',
    symbol: '⚴',
    category: 'asteroids',
    averageSpeed: '0° 13\' / day (avg)',
    degreesPerDay: 0.214,
    orbitalPeriod: '4.62 years',
    orbitalYears: 4.62,
    timeInSign: '~4.5 months',
    discovery: '1802',
    diameter: '512 km',
    speedNote: 'Named for Pallas Athena. Moves at similar speed to Ceres through the main asteroid belt.',
    summary: 'Wisdom, strategy, pattern recognition, and creative intelligence. Pallas shows your ability to see the big picture and solve problems creatively.'
  },
  {
    name: 'Juno',
    symbol: '⚵',
    category: 'asteroids',
    averageSpeed: '0° 14\' / day (avg)',
    degreesPerDay: 0.227,
    orbitalPeriod: '4.36 years',
    orbitalYears: 4.36,
    timeInSign: '~4 months',
    discovery: '1804',
    diameter: '233 km',
    speedNote: 'Named for Jupiter\'s wife. Important in synastry and marriage charts.',
    summary: 'Marriage, commitment, partnership equality, and jealousy. Juno shows what you need in a committed partner and issues of fairness in relationships.'
  },
  {
    name: 'Vesta',
    symbol: '⚶',
    category: 'asteroids',
    averageSpeed: '0° 16\' / day (avg)',
    degreesPerDay: 0.272,
    orbitalPeriod: '3.63 years',
    orbitalYears: 3.63,
    timeInSign: '~3.5 months',
    discovery: '1807',
    diameter: '525 km',
    speedNote: 'Named for the goddess of the hearth. Vesta is the brightest asteroid and occasionally visible to naked eye.',
    summary: 'Devotion, sacred sexuality, focus, and the sacred flame. Vesta shows where you devote yourself completely and what you hold sacred.'
  },
  
  // TRANS-NEPTUNIAN OBJECTS (TNOs) / DWARF PLANETS
  {
    name: 'Eris',
    symbol: '⯰',
    category: 'tno',
    averageSpeed: '0° 0.5\' / year',
    degreesPerDay: 0.00137,
    orbitalPeriod: '559 years',
    orbitalYears: 559,
    timeInSign: '~46 years (average)',
    discovery: '2005 (caused Pluto\'s reclassification)',
    diameter: '2,326 km (larger than Pluto)',
    speedNote: 'Eris is EXTREMELY slow—slower than Pluto. It has been in Aries since 1926 and will be there until 2048. Everyone alive has Eris in Aries or Pisces.',
    summary: 'Discord, strife, competition, and the outsider. Eris shows where you create chaos to expose truth and fight for inclusion.'
  },
  {
    name: 'Sedna',
    symbol: '⯲',
    category: 'tno',
    averageSpeed: '0° 0.15\' / year',
    degreesPerDay: 0.00041,
    orbitalPeriod: '11,400 years',
    orbitalYears: 11400,
    timeInSign: '~950 years',
    discovery: '2003',
    diameter: '~1,000 km',
    speedNote: 'Sedna has the longest known orbital period of any observed Solar System object. It takes 11,400 years to orbit the Sun! Currently in late Taurus, moving less than 1° per decade.',
    summary: 'Deep isolation, victimization, and transcendent survival. Named for the Inuit goddess of the sea, Sedna shows themes of betrayal and finding power in extreme isolation.'
  },
  {
    name: 'Makemake',
    symbol: '🜨',
    category: 'tno',
    averageSpeed: '0° 1.1\' / year',
    degreesPerDay: 0.003,
    orbitalPeriod: '306 years',
    orbitalYears: 306,
    timeInSign: '~25 years',
    discovery: '2005',
    diameter: '1,430 km',
    speedNote: 'Named for the Rapa Nui (Easter Island) creator god. Makemake has been in Libra since 2000 and enters Scorpio around 2025.',
    summary: 'Creation, fertility, environmental awareness, and connection to nature. Makemake shows where you create something from nothing and your relationship to Earth\'s resources.'
  },
  {
    name: 'Haumea',
    symbol: '🜵',
    category: 'tno',
    averageSpeed: '0° 1.3\' / year',
    degreesPerDay: 0.0036,
    orbitalPeriod: '285 years',
    orbitalYears: 285,
    timeInSign: '~24 years',
    discovery: '2004',
    diameter: '~1,600 km (elongated shape)',
    speedNote: 'Haumea has the fastest rotation of any large body in the Solar System (4 hours). This gives it an elongated shape. Named for Hawaiian goddess of childbirth.',
    summary: 'Rebirth, regeneration, fertility, and the life cycle. Haumea shows where you experience renewal and connection to the creative life force.'
  },
  {
    name: 'Quaoar',
    symbol: '🝾',
    category: 'tno',
    averageSpeed: '0° 1.2\' / year',
    degreesPerDay: 0.0033,
    orbitalPeriod: '288 years',
    orbitalYears: 288,
    timeInSign: '~24 years',
    discovery: '2002',
    diameter: '1,110 km',
    speedNote: 'Named for the creation god of the Tongva people of Southern California. Quaoar has been in Capricorn since 2000 and stays there until around 2025.',
    summary: 'Creation through dance and song, manifestation, and sacred creativity. Quaoar shows where you bring things into being through rhythm and resonance.'
  },
  {
    name: 'Orcus',
    symbol: '🝿',
    category: 'tno',
    averageSpeed: '0° 1.4\' / year',
    degreesPerDay: 0.0038,
    orbitalPeriod: '247.5 years',
    orbitalYears: 247.5,
    timeInSign: '~20 years',
    discovery: '2004',
    diameter: '910 km',
    speedNote: 'Orcus is called the "anti-Pluto" because its orbit is almost a mirror image of Pluto\'s. When Pluto is at perihelion, Orcus is at aphelion. Currently in Virgo (since ~2011), moving about 1.4° per year.',
    summary: 'Oaths, promises, punishment for broken vows, and the underworld. Named for the Etruscan god of the dead, Orcus shows where you must keep your word or face consequences.'
  },
  {
    name: 'Ixion',
    symbol: '⯳',
    category: 'tno',
    averageSpeed: '0° 1.3\' / year',
    degreesPerDay: 0.0036,
    orbitalPeriod: '250 years',
    orbitalYears: 250,
    timeInSign: '~21 years',
    discovery: '2001',
    diameter: '~650 km',
    speedNote: 'Named for the first human murderer in Greek mythology. Ixion has been in Sagittarius since the mid-2000s and will be there until the late 2020s.',
    summary: 'Transgression, lust, ingratitude, and the consequences of violating sacred trust. Ixion shows where you may cross ethical lines or be tempted by forbidden desires.'
  },
  {
    name: 'Varuna',
    symbol: '⯴',
    category: 'tno',
    averageSpeed: '0° 1.2\' / year',
    degreesPerDay: 0.0033,
    orbitalPeriod: '282 years',
    orbitalYears: 282,
    timeInSign: '~23 years',
    discovery: '2000',
    diameter: '~700 km',
    speedNote: 'Named for the Vedic god of the cosmic ocean and moral law. One of the first large TNOs discovered. Currently in Leo.',
    summary: 'Cosmic order, fame, the waters of life, and natural law. Varuna shows where you connect to universal truth and may achieve lasting recognition.'
  },
  
  // FIXED STARS
  {
    name: 'Regulus',
    symbol: '★',
    category: 'points',
    averageSpeed: '0° 0.8\' / century',
    degreesPerDay: 0.0000219,
    orbitalPeriod: 'Fixed (precesses ~1° per 72 years)',
    orbitalYears: 25920,
    timeInSign: '~2,160 years',
    speedNote: 'Fixed stars move only due to precession of the equinoxes (~1° every 72 years). Regulus moved from Leo to Virgo in 2012—a once-in-2160-years event! Currently at ~0° Virgo.',
    summary: 'The "Heart of the Lion" (Alpha Leonis). One of the four Royal Stars of Persia (along with Aldebaran, Antares, and Fomalhaut). Regulus brings success, fame, military honors, and leadership ability. It confers the "touch of greatness" on those who have planets or angles conjunct it. However, it carries a warning: if success is achieved through revenge or cruelty, what was gained will be lost. The star promises glory but demands nobility of character. In ancient times, kings were crowned when planets transited Regulus.',
    fixedStarSignificance: `Yes, everyone born in the same century has Regulus at essentially the same zodiacal degree—so how does it become personally significant?

**Fixed stars become uniquely yours through:**

1. **Conjunction to natal planets (within 1-2°)**: If your Sun, Moon, or any planet is at 0° Virgo (Regulus's current position), that planet is "crowned" by the royal star. Your Sun at 0° Virgo = Regulus on the Sun = leadership themes amplified.

2. **Conjunction to chart angles (within 1°)**: Even more powerful! Regulus on your Ascendant, Midheaven, Descendant, or IC makes the star prominently personal to YOU. Someone born at 3am might have Regulus on the Ascendant while someone born at 3pm doesn't.

3. **Aspects from personal planets**: A planet at 0° Sagittarius (square) or 0° Aries (trine) activates Regulus.

**Why the slowness matters:**
- Regulus moved from 29° Leo to 0° Virgo in 2012
- Everyone born 2012+ has Regulus in Virgo (humble service vs. kingly Leo)
- This is a 2,160-year generational shift! A "Great Month" in the Platonic Year
- Your grandparents had Regulus in Leo; your grandchildren will have it in Virgo

**The key**: The FIXED position of stars means they're like landmarks—your moving planets and angles either touch them or don't. That's what makes them personal.`
  },
  {
    name: 'Spica',
    symbol: '★',
    category: 'points',
    averageSpeed: '0° 0.8\' / century',
    degreesPerDay: 0.0000219,
    orbitalPeriod: 'Fixed (precesses ~1° per 72 years)',
    orbitalYears: 25920,
    timeInSign: '~2,160 years',
    speedNote: 'Currently at ~24° Libra. One of the brightest stars in the sky (the 16th brightest). Moves only by precession, shifting about 1° every 72 years.',
    summary: 'The "Ear of Wheat" held by the Virgin goddess (Alpha Virginis). The most fortunate of all fixed stars, bringing gifts, honors, and success that seems to come without struggle. Spica grants artistic and scientific ability, love of beauty, and the capacity for refined pleasures. Unlike some powerful stars, Spica has no negative side—it is purely benefic. Associated with harvest, abundance, and the reaping of what was sown. Those with Spica prominent are often "lucky" in ways that seem almost magical.',
    fixedStarSignificance: `Spica at 24° Libra becomes personal through the same mechanisms as all fixed stars:

**Personal activation:**
1. **Planets at 24° Libra**: Your Venus, Mercury, or any planet at 24° Libra = conjunct Spica = blessed with gifts
2. **Chart angles at 24° Libra**: MC at 24° Libra = Spica crowning your career point
3. **Aspects**: Planets at 24° Cancer/Capricorn (square) or 24° Gemini/Aquarius (trine) also feel Spica

**Historical consistency:**
- For the past several centuries, Spica has been in late Libra
- This "fixed" quality is actually its power—it's a stable point of fortune
- Ancient temples were aligned to Spica's rising

**Practical interpretation:**
If your chart has nothing near 24° Libra, Spica won't feature in your natal chart. But when a transit or progression reaches 24° Libra, it "touches" Spica and activates that benefic energy temporarily for everyone.`
  },
  {
    name: 'Algol',
    symbol: '★',
    category: 'points',
    averageSpeed: '0° 0.8\' / century',
    degreesPerDay: 0.0000219,
    orbitalPeriod: 'Fixed (precesses ~1° per 72 years)',
    orbitalYears: 25920,
    timeInSign: '~2,160 years',
    speedNote: 'Currently at ~26° Taurus. Known as the "Demon Star" because it visibly blinks (it\'s an eclipsing binary). Arabs called it "Ra\'s al-Ghul" (Head of the Demon).',
    summary: 'The "Demon Star" representing the severed head of Medusa. Despite its fearsome reputation, Algol is not purely malefic—it represents raw primal power, the feminine rage that transforms, and the ability to face what others cannot. Those with Algol prominent often deal with intense themes: loss of the head (literal or metaphorical), confronting monsters, channeling dangerous forces. It grants protection against evil to those who can handle its intensity. Many successful people have Algol contacts, having learned to wield rather than fear its power.',
    fixedStarSignificance: `Algol at 26° Taurus activates when your planets or angles touch that degree:

**Activation points:**
- Planets at 26° Taurus = direct conjunction
- Planets at 26° Scorpio = opposition (also powerful)
- Planets at 26° Leo or Aquarius = square (challenging)

**Why Algol's reputation:**
- Visible "winking" made ancients think it was alive/demonic
- Associated with Medusa—whose gaze turned people to stone
- But Perseus used that head as a WEAPON—this is Algol's secret

**Modern interpretation:**
Algol prominent = ability to handle the shadow, to face what others flee. Many surgeons, psychologists, and crisis workers have strong Algol. It's not bad luck—it's intense transformative power that requires conscious handling.`
  }
];

// Helper to get category label
export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    luminaries: 'Luminaries',
    personal: 'Personal Planets',
    social: 'Social Planets',
    transpersonal: 'Transpersonal/Outer Planets',
    points: 'Sensitive Points',
    asteroids: 'Asteroids',
    tno: 'Trans-Neptunian Objects (Dwarf Planets)'
  };
  return labels[category] || category;
};

// Helper to format speed comparison
export const getSpeedComparison = (body: CelestialBodySpeed): string => {
  if (body.degreesPerDay >= 1) {
    return `Fast-moving: completes the zodiac in ${body.orbitalPeriod}`;
  } else if (body.degreesPerDay >= 0.01) {
    return `Moderate: spends ${body.timeInSign} in each sign`;
  } else if (body.degreesPerDay > 0) {
    return `Very slow: generational influence, in each sign for ${body.timeInSign}`;
  } else {
    return 'Calculated point based on other factors';
  }
};

// Saturn symbols by sign
export const SATURN_SYMBOLS: Record<string, { symbol: string; meaning: string }> = {
  Libra: { 
    symbol: 'Scales ⚖️', 
    meaning: 'Humanity seeking to bridge the chasm of separate knowledge'
  },
  Capricorn: { 
    symbol: 'Goat 🐐', 
    meaning: 'Making of oneself the perfect instrument to construct a new future society'
  },
  Aquarius: { 
    symbol: 'Water Bearer 🏺', 
    meaning: 'Water of life - spiritual essence nourishing humanity'
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getElementSymbol = (element: string): string => {
  const symbols: Record<string, string> = { 
    Fire: '🔥', 
    Earth: '🌍', 
    Air: '💨', 
    Water: '💧' 
  };
  return symbols[element] || '';
};

export const getDecanName = (index: number): string => {
  return ['first', 'second', 'third'][index] || '';
};

export const getTermRuler = (sign: string, degree: number): string => {
  const terms = EGYPTIAN_TERMS[sign];
  if (!terms) return 'Unknown';
  
  for (const term of terms) {
    if (degree < term.end) {
      return term.ruler;
    }
  }
  return terms[terms.length - 1]?.ruler || 'Unknown';
};

export const getDecanRuler = (sign: string, degree: number): string => {
  const decans = DECAN_RULERS[sign];
  if (!decans) return 'Unknown';
  
  const decanIndex = Math.min(2, Math.floor(degree / 10));
  return decans[decanIndex];
};

export type DignityStatus = {
  type: 'Ruler' | 'Exaltation' | 'Detriment' | 'Fall' | 'Peregrine';
  color: string;
  bgColor: string;
};

export const getDignityStatus = (planetName: string, sign: string): DignityStatus => {
  const dignities = PLANET_DIGNITIES[planetName];
  if (!dignities) {
    return { type: 'Peregrine', color: 'hsl(var(--muted-foreground))', bgColor: 'hsl(var(--muted) / 0.3)' };
  }

  // Check rulership
  if (Array.isArray(dignities.rulership)) {
    if (dignities.rulership.includes(sign)) {
      return { type: 'Ruler', color: '#43A047', bgColor: 'rgba(67, 160, 71, 0.15)' };
    }
  } else {
    if (dignities.rulership === sign) {
      return { type: 'Ruler', color: '#43A047', bgColor: 'rgba(67, 160, 71, 0.15)' };
    }
  }

  // Check exaltation
  if (dignities.exaltation.includes(sign)) {
    return { type: 'Exaltation', color: '#1976D2', bgColor: 'rgba(25, 118, 210, 0.15)' };
  }

  // Check detriment
  if (Array.isArray(dignities.detriment)) {
    if (dignities.detriment.includes(sign)) {
      return { type: 'Detriment', color: '#FBC02D', bgColor: 'rgba(251, 192, 45, 0.15)' };
    }
  } else {
    if (dignities.detriment === sign) {
      return { type: 'Detriment', color: '#FBC02D', bgColor: 'rgba(251, 192, 45, 0.15)' };
    }
  }

  // Check fall
  if (dignities.fall.includes(sign)) {
    return { type: 'Fall', color: '#E53935', bgColor: 'rgba(229, 57, 53, 0.15)' };
  }

  return { type: 'Peregrine', color: 'hsl(var(--muted-foreground))', bgColor: 'hsl(var(--muted) / 0.3)' };
};

export const getSectStatus = (
  planetName: string, 
  sunHouse: number | null,
  isDayChart: boolean | null
): { status: string; description: string } => {
  if (isDayChart === null || sunHouse === null) {
    return { status: 'Unknown', description: 'Chart type could not be determined' };
  }

  const diurnalPlanets = ['Sun', 'Jupiter', 'Saturn'];
  const nocturnalPlanets = ['Moon', 'Venus', 'Mars'];

  if (diurnalPlanets.includes(planetName)) {
    if (isDayChart) {
      return { 
        status: 'In Sect (Day Chart)', 
        description: 'Planet functions well - in harmony with chart type'
      };
    }
    return { 
      status: 'Out of Sect (Night Chart)', 
      description: 'Planet challenged - out of harmony with chart type'
    };
  }

  if (nocturnalPlanets.includes(planetName)) {
    if (!isDayChart) {
      return { 
        status: 'In Sect (Night Chart)', 
        description: 'Planet functions well - in harmony with chart type'
      };
    }
    return { 
      status: 'Out of Sect (Day Chart)', 
      description: 'Planet challenged - out of harmony with chart type'
    };
  }

  return { status: 'Neutral', description: 'Mercury and outer planets are neutral regarding sect' };
};

export const getHousesRuled = (
  planetName: string,
  houseCusps: Record<string, { sign: string; degree: number; minutes?: number }> | undefined
): string => {
  if (!houseCusps) return 'Unknown';

  const ruledHouses: number[] = [];

  for (let i = 1; i <= 12; i++) {
    const cusp = houseCusps[`house${i}`];
    if (cusp?.sign) {
      const signProps = SIGN_PROPERTIES[cusp.sign];
      if (signProps?.ruler === planetName) {
        ruledHouses.push(i);
      }
    }
  }

  if (ruledHouses.length === 0) return 'None';
  
  return ruledHouses.map(h => {
    const suffix = h === 1 ? 'st' : h === 2 ? 'nd' : h === 3 ? 'rd' : 'th';
    return `${h}${suffix}`;
  }).join(', ');
};

// Calculate declination from ecliptic longitude using standard astronomical formula
// This is accurate to within 1' for ecliptic-based declination
export const calculateDeclination = (sign: string, degree: number): string => {
  // Maximum declination is ~23.44° (obliquity of the ecliptic)
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const signIndex = signs.indexOf(sign);
  if (signIndex === -1) return 'Unknown';

  const longitude = signIndex * 30 + degree;
  // Approximate declination using obliquity
  const obliquity = 23.44;
  const declination = Math.asin(Math.sin(longitude * Math.PI / 180) * Math.sin(obliquity * Math.PI / 180)) * 180 / Math.PI;
  
  const absDec = Math.abs(declination);
  const degrees = Math.floor(absDec);
  const minutes = Math.round((absDec - degrees) * 60);
  const direction = declination >= 0 ? 'N' : 'S';
  
  return `${degrees}° ${minutes}' ${direction}`;
};

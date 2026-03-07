// ─── Planetary Cycles in Solar Returns ──────────────────────────────
// Source: Brian Clark — "Working with Solar Returns"
// These describe the annual movement patterns observable across a lifetime of SR charts.

export interface SRPlanetCycle {
  planet: string;
  symbol: string;
  annualMovement: string;
  cycleLength: string;
  keyAges: number[];
  keyAgesDescription: string;
  directionNotes: string;
  practicalInsight: string;
}

export const SR_PLANET_CYCLES: SRPlanetCycle[] = [
  {
    planet: 'Midheaven (MC)',
    symbol: 'MC',
    annualMovement: 'Advances approximately 87–93° (about three signs) each year through the zodiac',
    cycleLength: '~4 years to complete the zodiac; natal angles repeat at specific ages',
    keyAges: [29, 33, 58, 62],
    keyAgesDescription: 'Check the ages of 29 or 33; 58 or 62 to see which years repeat the natal angles. When the SR MC returns to the natal MC sign, the year has a special resonance with your fundamental career and life direction.',
    directionNotes: 'The MC sign changes every year, cycling through all 12 signs roughly every 4 years. Each year brings a different vocational tone.',
    practicalInsight: 'The MC is the fastest-moving angle in the SR. Its sign tells you the vocational flavor of the year. When your SR MC matches your natal MC, that year\'s career themes are deeply personal — a return to core purpose.',
  },
  {
    planet: 'Moon',
    symbol: '☽',
    annualMovement: 'Moves forward approximately a trine (120°+) each year; follows the elements in sequence',
    cycleLength: '19-year Metonic cycle — the Moon repeats its SR position every 19 years',
    keyAges: [19, 38, 57, 76, 95],
    keyAgesDescription: 'At age 19 (and every 19 years after), the SR Moon returns to approximately the same position as your natal Moon. This creates emotional resonance with your original emotional imprint. The Moon also spends 2–3 consecutive SRs in one element before moving to the next.',
    directionNotes: 'The Moon travels counter-clockwise through the SR houses, progressing 0–3 houses each year. Follow the Moon through the elements — it spends 2–3 SRs in Fire, then Earth, then Air, then Water, taking 8–10 years to complete the sequence.',
    practicalInsight: 'Compare your current SR Moon to where it was 19 years ago. The emotional themes rhyme. If you\'re 39, your emotional landscape echoes age 20 and birth. This is the most personal cycle in the SR system — your emotional biography written in 19-year chapters.',
  },
  {
    planet: 'Sun',
    symbol: '☉',
    annualMovement: 'Moves about three houses clockwise each year, highlighting one quadrant',
    cycleLength: '~10–11 years in angular houses, then ~10–11 years in succedent houses',
    keyAges: [],
    keyAgesDescription: 'The Sun\'s house movement depends on latitude of the SR location. On average, the Sun spends 10–11 years in angular houses (1, 4, 7, 10) and then shifts to succedent houses (2, 5, 8, 11). This creates decades-long patterns of either high-visibility or stabilizing years.',
    directionNotes: 'Since the Sun is always at the same zodiacal degree (your natal Sun position), its sign never changes in the SR. Only the house changes — and this is determined by the time of the solar return and the latitude.',
    practicalInsight: 'The Sun\'s house is the single most important variable in your SR. Mary Fortier Shea emphasizes that in solar returns, the house position of a planet matters MORE than the sign. The Sun\'s house shows where your vitality is directed this year — where you want to shine.',
  },
  {
    planet: 'Mercury',
    symbol: '☿',
    annualMovement: 'Always within 28° of the Sun; near natal position at specific ages',
    cycleLength: 'Retrograde approximately every 6th solar return',
    keyAges: [13, 33, 46],
    keyAgesDescription: 'Mercury returns near its natal position at ages 13, 33, and 46 — these are years when your original mental patterns, communication style, and learning approach are reactivated. At 33, this coincides with the MC angle return, creating a powerful convergence.',
    directionNotes: 'Check which years Mercury goes retrograde in the SR. Mercury Rx years emphasize revision, re-learning, and re-thinking communication patterns. Approximately every 6th SR features Mercury retrograde.',
    practicalInsight: 'Mercury\'s sign placement is limited (only ±1 sign from the Sun), so focus on its house and retrograde status. A retrograde Mercury SR year is for reviewing mental habits, rewriting, and reconnecting with old contacts or ideas.',
  },
  {
    planet: 'Venus',
    symbol: '♀',
    annualMovement: 'Always within 48° of the Sun; has only 8 possible positions',
    cycleLength: '8-year cycle — positions repeat every 8 years',
    keyAges: [8, 16, 24, 32, 40, 48, 56, 64, 72, 80],
    keyAgesDescription: 'Venus repeats its SR position every 8 years. Your love life and relationship patterns follow an 8-year rhythm. Compare your current SR Venus to where it was 8 years ago — the relationship and financial themes rhyme. Mary Fortier Shea: "You can tell a lot about your love life by ascertaining what these eight positions are."',
    directionNotes: 'Check the years when Venus goes retrograde in the SR — these are years of relationship review, reconnection with past lovers, and re-evaluation of values and self-worth.',
    practicalInsight: 'Venus has only 8 possible SR positions. Once you know all 8, you know the entire love and money cycle for your lifetime. This makes Venus the most predictable planet in the SR system — and therefore one of the most useful for planning.',
  },
  {
    planet: 'Mars',
    symbol: '♂',
    annualMovement: 'Generally follows the elements through the zodiac, spending 3–4 SRs in one element',
    cycleLength: 'Irregular — Mars is the only "free" planet that changes signs regularly and freely',
    keyAges: [],
    keyAgesDescription: 'Mars has no fixed return cycle in the SR. Mary Fortier Shea calls Mars "the only planet which is erratic and changes signs regularly and freely" — making it the only SR planet where the SIGN is as important as the house. Each SR Mars sign brings a genuinely different energetic quality.',
    directionNotes: 'Check the years when Mars goes retrograde in the SR. Mars Rx years indicate a need to redirect energy inward, review ambitions, and reconsider how you assert yourself. Frustration with progress requires patience.',
    practicalInsight: 'Because Mars is the only SR planet where sign genuinely matters (all others have limited or fixed sign patterns), pay special attention to the Mars sign/house combination. This is where your drive, ambition, and physical energy are directed this year.',
  },
  {
    planet: 'Jupiter',
    symbol: '♃',
    annualMovement: 'Moves approximately one zodiacal sign each SR; moves clockwise about two houses per year',
    cycleLength: '~12-year cycle through the zodiac',
    keyAges: [12, 24, 36, 48, 60, 72, 84],
    keyAgesDescription: 'Jupiter completes a full cycle approximately every 12 years, echoing the profection cycle. Jupiter return years (ages 12, 24, 36, etc.) bring expansion, opportunity, and growth in whichever SR house Jupiter occupies.',
    directionNotes: 'Check if Jupiter has changed direction (retrograde to direct or vice versa) from last year\'s SR. A direction change signals a shift in how you experience growth — from internal reflection to external expansion, or vice versa.',
    practicalInsight: 'Jupiter\'s house placement shows where your greatest opportunities and growth potential lie this year. Combined with the profection house, Jupiter\'s SR position reveals the year\'s "growth story."',
  },
  {
    planet: 'Saturn',
    symbol: '♄',
    annualMovement: 'Moves an average of about 12° each year; about 2–3 houses clockwise per year',
    cycleLength: '~29.5-year cycle',
    keyAges: [29, 58, 87],
    keyAgesDescription: 'Saturn return years are among the most significant in the SR system. At ages 29 and 58, Saturn returns to its natal position, coinciding with the SR angle return. These are years of structural reckoning — what you have built is tested for durability.',
    directionNotes: 'Note when Saturn changes direction in the SR. Saturn turning direct in the SR after being retrograde the previous year often signals a shift from internal restructuring to external building. Saturn turning retrograde may indicate a year of karmic review.',
    practicalInsight: 'Saturn\'s SR house shows where your greatest responsibilities and hardest work lie this year. It is also where you build the most lasting achievements. Combined with the natal Saturn position, this reveals the year\'s "maturation assignment."',
  },
  {
    planet: 'Uranus',
    symbol: '♅',
    annualMovement: 'Moves about 4° forward each year; about three houses per year clockwise',
    cycleLength: '~84-year cycle; tenants each SR house over approximately 14 years',
    keyAges: [21, 42, 63, 84],
    keyAgesDescription: 'Uranus quarter-cycle points (ages 21, 42, 63) are crisis points of individuation. At these ages, the SR Uranus is at a hard angle to its natal position, triggering breakthroughs in self-expression and liberation from outdated structures.',
    directionNotes: 'Check if Uranus has changed direction in the SR. A direction change signals a shift in the individual\'s relationship with freedom, rebellion, and authenticity.',
    practicalInsight: 'Uranus spends about 14 years cycling through all 12 SR houses. Its current house shows where sudden changes, breakthroughs, and the need for freedom are most active.',
  },
  {
    planet: 'Neptune',
    symbol: '♆',
    annualMovement: 'Moves about 2° per year; approximately 3 houses clockwise',
    cycleLength: '~165-year cycle (does not complete in a human lifetime)',
    keyAges: [41, 82],
    keyAgesDescription: 'Neptune\'s half-cycle square (around age 41) is a spiritual crisis point — illusions that have sustained you dissolve, forcing a deeper encounter with reality and spiritual truth.',
    directionNotes: 'Check if Neptune has changed direction. Neptune direction changes can coincide with shifts in spiritual orientation, creative inspiration, or the dissolution/clarification of important illusions.',
    practicalInsight: 'Neptune\'s SR house shows where boundaries dissolve, where intuition is heightened, and where confusion or escapism may arise. Creative and spiritual opportunities exist here alongside the need for discernment.',
  },
  {
    planet: 'Pluto',
    symbol: '♇',
    annualMovement: 'Speed varies — currently about 2° forward per year; about three houses clockwise',
    cycleLength: '~248-year cycle (does not complete in a human lifetime)',
    keyAges: [],
    keyAgesDescription: 'Pluto\'s SR house position shifts slowly over years, creating long periods of transformative focus in specific life areas. When Pluto changes SR houses, a new multi-year cycle of deep transformation begins.',
    directionNotes: 'Check if Pluto has changed direction. Pluto direction changes can coincide with shifts in power dynamics, psychological breakthroughs, or the beginning/ending of transformative processes.',
    practicalInsight: 'Pluto\'s SR house shows where the deepest transformation is occurring — slowly, relentlessly, and irreversibly. This is where you are being fundamentally remade over multiple years.',
  },
];

// ─── Helper: Get cycle notes for a specific age ─────────────────────

export const getCycleNotesForAge = (age: number): { planet: string; note: string }[] => {
  const notes: { planet: string; note: string }[] = [];

  // Moon 19-year cycle
  if (age >= 19) {
    const prevAge = age - 19;
    const prevPrevAge = age - 38;
    notes.push({
      planet: 'Moon',
      note: `At age ${age}, your SR Moon is in a similar position to age ${prevAge}${prevPrevAge >= 0 ? ` and age ${prevPrevAge}` : ''}. The emotional themes of those years echo now. This is the 19-year Metonic cycle.`,
    });
  }

  // Venus 8-year cycle
  if (age >= 8) {
    const venusAges = [];
    for (let a = age % 8; a <= age; a += 8) {
      if (a !== age && a >= 0) venusAges.push(a);
    }
    if (venusAges.length > 0) {
      notes.push({
        planet: 'Venus',
        note: `Your SR Venus is in a similar position to ages ${venusAges.slice(-3).join(', ')}. Relationship and financial patterns from those years are repeating in a new context.`,
      });
    }
  }

  // Mercury natal return ages
  if ([13, 33, 46].includes(age)) {
    notes.push({
      planet: 'Mercury',
      note: `Mercury returns near its natal position at age ${age}. Your original mental patterns, communication style, and learning approach are reactivated this year.`,
    });
  }

  // MC angle return
  if ([29, 33, 58, 62].includes(age)) {
    notes.push({
      planet: 'MC',
      note: `At age ${age}, the SR may mirror your natal angles. This is a year of special resonance with your fundamental career direction and life purpose.`,
    });
  }

  // Saturn return
  if (Math.abs(age - 29) <= 1 || Math.abs(age - 58) <= 1 || Math.abs(age - 87) <= 1) {
    notes.push({
      planet: 'Saturn',
      note: `Near your Saturn Return. What you have built is being tested for durability. This is a year of structural reckoning and maturation.`,
    });
  }

  // Jupiter return
  if (age > 0 && age % 12 === 0) {
    notes.push({
      planet: 'Jupiter',
      note: `Jupiter Return year — expansion, opportunity, and growth are available in whichever SR house Jupiter occupies.`,
    });
  }

  // Uranus quarter cycles
  if (Math.abs(age - 21) <= 1) {
    notes.push({ planet: 'Uranus', note: 'Near the Uranus quarter-cycle — a crisis of individuation. Breakthroughs in self-expression and liberation from outdated structures.' });
  }
  if (Math.abs(age - 42) <= 1) {
    notes.push({ planet: 'Uranus', note: 'Near the Uranus opposition (midlife) — the most powerful individuation crisis. The authentic self demands full expression.' });
  }

  // Neptune square
  if (Math.abs(age - 41) <= 1) {
    notes.push({ planet: 'Neptune', note: 'Near the Neptune square — a spiritual crisis point. Illusions that have sustained you dissolve, forcing a deeper encounter with truth.' });
  }

  return notes;
};

// ─── Sacred Moment Guidance ─────────────────────────────────────────
// Source: Ray Merriman — "Solar Return Report"

export const SACRED_MOMENT_GUIDANCE = {
  title: 'The Sacred Moment of Your Solar Return',
  overview: 'The exact time of your solar return is a sacred annual event. It happens at only one specific moment each year — when the Earth/Sun relationship is exactly the same as when you were born. The quality of that "moment" becomes the "seed" of that annual cycle.',
  preparation: [
    'Set the stage at least 10 minutes before your exact SR moment. Choose a location where you feel comfortable, happy, and in harmony.',
    'Consider having a candle burning, music playing, or artifacts that have personal meaning displayed in your space.',
    'Perhaps there is a special person you wish to share this moment with.',
    'Begin a meditation as you enter the 10-minute window before the SR moment. Visualize the areas of interest coming up in the next year — see yourself happy and successful in each situation.',
    'Continue the meditation into and slightly beyond the SR moment. Once it has passed, give thanks in whatever form is sacred to you.',
  ],
  warnings: [
    'You cannot be late for this moment — otherwise, you might be symbolically late throughout the entire year.',
    'Do not take this moment lightly — otherwise, all of your affairs may be symbolically taken lightly all year.',
    'It would not be a favorable omen if you engaged in an argument, sat home brooding, or went to work in an atmosphere of frustration.',
  ],
  source: 'Ray Merriman — The Solar Return Book of Prediction',
};

// Moon Phase Enrichments — Steven Forrest, "The Book of the Moon"
// Evolutionary framework for the 8 lunar phases

export interface ForrestPhaseData {
  phase: string;
  evolutionaryKeyword: string;
  forrestInsight: string;
  highExpression: string;
  darkSide: string;
  rudhyarLineage: string;
}

export const FORREST_PHASE_DATA: Record<string, ForrestPhaseData> = {
  'New Moon': {
    phase: 'New Moon',
    evolutionaryKeyword: 'Emergence',
    forrestInsight: 'You were born at the start of a new cycle. Sun and Moon are fused — your identity and emotional needs are one. You act instinctively, planting seeds in darkness without knowing what will grow. This is the phase of pure potential, the cosmic blank slate.',
    highExpression: 'Trusting instinct over logic; beginner\'s mind; the courage to start from nothing; visionary impulse uncontaminated by past failures',
    darkSide: 'Blindness to consequences; self-absorption; repeating patterns unconsciously because the past feels invisible; difficulty learning from experience',
    rudhyarLineage: 'Dane Rudhyar called this the "soli-lunar" conjunction — a moment of total subjective unity. The seed holds the entire tree in potential.',
  },
  'Waxing Crescent': {
    phase: 'Waxing Crescent',
    evolutionaryKeyword: 'Struggle',
    forrestInsight: 'You were born fighting for your right to exist. The new impulse meets the world\'s resistance — and yours. There\'s a scrappy, determined energy to this phase. You\'re here to prove that your vision deserves space in the world.',
    highExpression: 'Resilience; resourcefulness; the warrior-gardener who fights for every inch of growth; fierce commitment to what wants to be born',
    darkSide: 'Chronic insecurity; feeling like you always have to fight; difficulty receiving help; mistaking struggle for purpose',
    rudhyarLineage: 'Rudhyar saw this as the "struggle for existence" — the moment when the new impulse must prove itself against the gravitational pull of the old cycle.',
  },
  'First Quarter': {
    phase: 'First Quarter',
    evolutionaryKeyword: 'Crisis in Action',
    forrestInsight: 'You were born at a crisis point — a square between Sun and Moon. This is productive tension that demands action. You\'re here to build structures, make hard decisions, and turn vision into reality through willpower and commitment.',
    highExpression: 'Decisiveness under pressure; turning ideas into tangible form; the builder who thrives when the stakes are high; creative tension as fuel',
    darkSide: 'Creating crises when none exist; impatience with peace; difficulty relaxing; burning bridges unnecessarily',
    rudhyarLineage: 'Rudhyar called this the "crisis in action" — the square aspect demands that the growing seed break through the soil and meet the light.',
  },
  'Waxing Gibbous': {
    phase: 'Waxing Gibbous',
    evolutionaryKeyword: 'Refinement',
    forrestInsight: 'You were born in a phase of analysis and devotion. Your soul is here to refine, perfect, and prepare something for its ultimate expression. You sense what\'s almost ready and know exactly what adjustment is needed.',
    highExpression: 'Discernment; the editor who improves everything they touch; devotion to excellence; service to a vision larger than yourself',
    darkSide: 'Perfectionism paralysis; never feeling "good enough"; over-analysis; self-criticism disguised as high standards',
    rudhyarLineage: 'Rudhyar associated this phase with "overcoming" — the final internal adjustments before the seed becomes the fully open flower at the Full Moon.',
  },
  'Full Moon': {
    phase: 'Full Moon',
    evolutionaryKeyword: 'Illumination',
    forrestInsight: 'You were born at maximum illumination — Sun and Moon in opposition. Your soul seeks to integrate polarities through relationship. Everything is visible, nothing can be hidden. You are here to be seen and to see yourself through others\' eyes.',
    highExpression: 'Objectivity; seeing all sides; relationship wisdom; magnetic presence; the mirror who helps others know themselves',
    darkSide: 'Over-dependency on others\' perception; difficulty being alone; projection; living for audience approval; inner emptiness without a partner',
    rudhyarLineage: 'For Rudhyar, the Full Moon is the moment of "fulfillment and revelation" — the seed\'s purpose becomes fully visible under maximum light.',
  },
  'Waning Gibbous': {
    phase: 'Waning Gibbous',
    evolutionaryKeyword: 'Dissemination',
    forrestInsight: 'You were born after the peak, beginning the journey of sharing what was illuminated. Your soul carries knowledge that wants to be transmitted. The fruit is ripe — now it must be distributed so that its seeds can take root in new soil.',
    highExpression: 'Teaching ability; distilling complex wisdom into accessible form; mentorship; sharing experience generously; the evangelist of meaning',
    darkSide: 'Preachy tone; believing you\'ve "figured it out"; difficulty receiving new input; guru complex; condescension disguised as helpfulness',
    rudhyarLineage: 'Rudhyar called this the "disseminating" phase — the moment when personal insight becomes social currency, offered to the collective.',
  },
  'Last Quarter': {
    phase: 'Last Quarter',
    evolutionaryKeyword: 'Crisis in Consciousness',
    forrestInsight: 'You were born at another crisis — but this one is internal. The square of release demands that you question what no longer serves, break down old structures, and clear space for what comes next. You challenge the status quo, including your own.',
    highExpression: 'Seeing what needs to end; courage to release; revolutionary energy directed at liberation; clearing old patterns for the next generation',
    darkSide: 'Iconoclasm for its own sake; difficulty building (easier to tear down); feeling stuck between worlds; nihilism',
    rudhyarLineage: 'Rudhyar\'s "crisis in consciousness" — unlike the First Quarter\'s external crisis, this one is internal. Old forms of understanding must shatter.',
  },
  'Balsamic': {
    phase: 'Balsamic',
    evolutionaryKeyword: 'Release',
    forrestInsight: 'You were born just before a new cycle — the darkest, most inward phase. Your soul is completing something ancient. You carry old wisdom and karma ready for release. You are the seed buried in winter soil, waiting for spring.',
    highExpression: 'Prophetic sense; ancient wisdom; letting go with grace; faith in the unseen; preparing the future you will never see; the mystic who trusts the dark',
    darkSide: 'Feeling out of time; chronic exhaustion; difficulty engaging with "normal" life; isolation; feeling spiritually "done" before the body is done',
    rudhyarLineage: 'For Rudhyar, the Balsamic phase is the "seed" moment — the dying plant releases its seeds into the soil. Everything essential is distilled and preserved.',
  },
};

export const FORREST_PHASE_SOURCE = 'Steven Forrest, The Book of the Moon';

export function getForrestPhaseData(phase: string): ForrestPhaseData | undefined {
  return FORREST_PHASE_DATA[phase];
}

// Eclipse & Phase Timing Rules — Terri McCartney, "Astrology Resources Quarterly"
// Practical guidance on using Moon phases and eclipses for timing

export interface PhaseTimingRule {
  phase: string;
  influencePeriod: string;
  description: string;
  practicalGuidance: string;
}

export interface EclipseTimingRule {
  type: 'solar' | 'lunar';
  influencePeriod: string;
  meaning: string;
  practicalGuidance: string;
  watchFor: string;
}

export const PHASE_TIMING_RULES: PhaseTimingRule[] = [
  {
    phase: 'New Moon',
    influencePeriod: '1 month',
    description: 'The New Moon corresponds to all new beginnings. Excellent time to begin a new project related to the areas of life indicated by the house in the natal chart where the New Moon falls.',
    practicalGuidance: 'If the New Moon aspects a natal planet within 5° orb, the natal planet aspected provides more information about what is being "initiated" that month. Sextiles and trines represent flow; squares and oppositions represent challenges to overcome.',
  },
  {
    phase: 'First Quarter',
    influencePeriod: '1 week',
    description: 'The transiting Moon forms a 90° square to the transiting Sun. This stressful aspect brings minor irritative events and can trigger mini-crises if it also aspects natal planets.',
    practicalGuidance: 'If the Quarter Moon makes a stressful aspect to a natal planet within 1°, expect a mini-crisis. Favorable aspects to natal planets show the means through which issues can be resolved.',
  },
  {
    phase: 'Full Moon',
    influencePeriod: '2 weeks',
    description: 'The Sun and Moon oppose each other. This phase corresponds to the culmination of plans and completion. Things you\'ve been working on will "bear fruit" or come to fruition.',
    practicalGuidance: 'The Full Moon often occurs in the house opposite the preceding New Moon, so concrete results for something initiated at the New Moon may now appear.',
  },
  {
    phase: 'Last Quarter',
    influencePeriod: '1 week',
    description: 'Another square aspect between Sun and Moon. Like the First Quarter, this brings tension, but now oriented toward release and reorientation rather than building.',
    practicalGuidance: 'Use this period for review and adjustment. If stressful natal aspects are triggered, expect situations requiring difficult choices about what to let go.',
  },
];

export const ECLIPSE_TIMING_RULES: EclipseTimingRule[] = [
  {
    type: 'solar',
    influencePeriod: '1 year',
    meaning: 'A Solar Eclipse is a supercharged New Moon — it represents a powerful new beginning in the house where it occurs in your chart.',
    practicalGuidance: 'The effects unfold over an entire year. Watch for other transiting planets aspecting the eclipse degree, especially the planet that rules the eclipse sign.',
    watchFor: 'If the eclipse is in Leo, watch the transiting Sun\'s aspects to the eclipse degree. If in Aquarius, watch transiting Uranus and Saturn.',
  },
  {
    type: 'lunar',
    influencePeriod: '6 months',
    meaning: 'A Lunar Eclipse is a supercharged Full Moon — it represents a powerful culmination, completion, or revelation in the houses where the Sun and Moon fall.',
    practicalGuidance: 'The effects unfold over six months. Things that have been building come to a head. Completions are often dramatic, sudden, or unavoidable.',
    watchFor: 'Transiting planets aspecting the eclipse degree will trigger developments. The closer the orb to a natal planet, the more personal the impact.',
  },
];

export const ECLIPSE_ASPECT_ORB = 5; // degrees

export const ECLIPSE_DEGREE_TRIGGERS = {
  description: 'After an eclipse, watch for other transiting planets making aspects to the eclipse degree. These transits can "set off" the eclipse energy weeks or months later.',
  mostImportant: 'The ruler of the eclipse sign making an aspect to the eclipse degree is the most significant trigger.',
  example: 'If a Solar Eclipse occurs at 15° Leo, watch for the Sun (Leo\'s ruler) making conjunctions, squares, or oppositions to 15° of any fixed sign.',
};

/** VOC interpretive text — synthesized from McCartney & Forrest */
export const VOC_INTERPRETIVE_TEXT = {
  headline: 'Moon Void of Course',
  shortDescription: 'The Moon\'s instincts are on hold — like a compass between readings.',
  fullDescription: 'When the Moon is Void of Course (VOC), she has made her last major aspect to a planet before changing signs. Her instinctual "knowing" is temporarily suspended. People sensitive to lunar energy may feel scattered, vague, undirected, or spacey.',
  doThis: [
    'Stick with routine activities',
    'Reflect on recent events',
    'Meditate or journal',
    'Rest and recharge',
    'Practice self-care',
    'Catch up on mundane tasks',
  ],
  avoidThis: [
    'Starting important new projects',
    'Making major decisions',
    'Signing contracts',
    'Job interviews or pitches',
    'First dates or important meetings',
    'Launching anything you want to succeed',
  ],
  forrestInsight: 'The VOC Moon is a pause between conversations — the Moon has said her last word in this sign and is walking silently to the next room. Honor the silence.',
  mcCartneyInsight: 'Plans or decisions made while the Moon is VOC may not work out. Without the instinctual "knowing" the Moon provides as she touches each planet, we can be ungrounded, unrealistic, or lacking in good judgment.',
  source: 'Terri McCartney, Astrology Resources Quarterly; Steven Forrest, The Book of the Moon',
};

export const MCCARTNEY_SOURCE = 'Terri McCartney, Astrology Resources Quarterly (July 1998)';

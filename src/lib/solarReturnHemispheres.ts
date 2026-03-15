// Solar Return Hemispheric Emphasis — Expert-level interpretations

// ============================================================================
// TYPES
// ============================================================================

export interface HemisphereDetail {
  title: string;
  summary: string;
  bodyParagraphs: string[];
  focusAreas: string[];
  challenges: string[];
  practicalAdvice: string[];
}

export interface SRHemisphericResult {
  upper: number;
  lower: number;
  east: number;
  west: number;
  upperPlanets: string[];
  lowerPlanets: string[];
  eastPlanets: string[];
  westPlanets: string[];
  totalCounted: number;
  verticalLabel: string;   // e.g. "Balanced Upper/Lower" or "Upper Dominant"
  horizontalLabel: string; // e.g. "Extreme Eastern"
  verticalDetail: HemisphereDetail;
  horizontalDetail: HemisphereDetail;
  combinedInsight: string;
}

// ============================================================================
// VERTICAL AXIS: UPPER (Houses 7–12) vs LOWER (Houses 1–6)
// Upper = life shaped by others, external forces, and larger systems
// Lower = life shaped by personal agency and self-development
// NOTE: "Upper" does NOT mean "public/visible" — House 12 is deeply private.
//       "Lower" does NOT mean "hidden" — House 1 is the most visible house.
// ============================================================================

function getVerticalDetail(upper: number, lower: number, total: number): { label: string; detail: HemisphereDetail } {
  const upperPct = total > 0 ? (upper / total) * 100 : 50;
  const lowerPct = total > 0 ? (lower / total) * 100 : 50;
  const diff = Math.abs(upper - lower);

  if (diff <= 1) {
    return {
      label: 'Balanced Upper/Lower',
      detail: {
        title: 'Balanced Horizon — Integration Year',
        summary: 'Your Solar Return planets are evenly split above and below the horizon. This is a year where personal development and your relationships with the outer world receive equal weight.',
        bodyParagraphs: [
          'When planets divide evenly across the horizon line, neither self-directed work nor other-directed engagement dominates. This balance suggests a year of integration — you are building personal foundations AND navigating partnerships, institutions, and collective dynamics simultaneously.',
          'A balanced horizon means your inner growth directly feeds your external relationships and vice versa. What you process internally (identity, health, creativity, values) supports how you engage with others (partnerships, career, community, spiritual practice). There is no disconnect between personal development and relational engagement.',
          'The risk of a balanced year is diffusion — when everything gets equal weight, you may struggle to prioritize. Let the specific house placements of individual planets guide where to invest your energy.'
        ],
        focusAreas: [
          'Integration: bridge personal insights into your partnerships and commitments',
          'Time management: equal demands from self-development and relational spheres',
          'Check in quarterly to see if one hemisphere is being neglected'
        ],
        challenges: [
          'Diffusion of focus — everything feels equally important',
          'Difficulty prioritizing between inner needs and relational obligations',
          'May not feel like a dramatic year because no single axis is strongly activated'
        ],
        practicalAdvice: [
          'Track both personal growth goals and relational milestones side by side',
          'Let the individual planet houses guide your priorities since the hemispheres alone are balanced',
          'Schedule both solo reflection time and collaborative engagement deliberately'
        ]
      }
    };
  }

  if (upperPct > 60) {
    const intensity = diff >= 6 ? 'extreme' : 'moderate';
    return {
      label: intensity === 'extreme' ? 'Strong Upper Dominance' : 'Upper-Leaning',
      detail: {
        title: intensity === 'extreme'
          ? 'Above the Horizon — Life Shaped by Others and External Forces'
          : 'Upper Hemisphere Emphasis — Other-Directed Year',
        summary: `${upper} of your ${total} planets sit above the horizon (Houses 7–12). This year, your growth comes THROUGH engagement with others — partners, institutions, communities, and forces larger than yourself.`,
        bodyParagraphs: [
          `With ${upper} planets above the horizon versus only ${lower} below, this Solar Return emphasizes the upper hemisphere. This does NOT simply mean "public and visible" — it means your life this year is shaped by how you relate to others and to systems beyond your personal control.`,
          'The upper hemisphere includes one-on-one partnerships (7th), deep shared resources and transformation (8th), expanded worldview through travel and study (9th), career and reputation within institutions (10th), community and collective vision (11th), and solitude, spiritual surrender, and endings (12th). Notice that the 12th house — the most inward, private house — is part of this hemisphere. Upper emphasis means engagement with forces beyond yourself, whether that looks like a marriage, a career shift, a spiritual retreat, or an institutional reckoning.',
          intensity === 'extreme'
            ? 'With such a dramatic upper concentration, this year\'s lessons arrive THROUGH other people, institutions, and circumstances rather than through solo initiative. Whether through partnerships, career demands, community involvement, or even enforced solitude (12th house), the common thread is that external forces set the agenda. You are responding, adapting, and growing through engagement rather than setting your own terms.'
            : 'This moderate upper lean suggests a year where relational engagement and external systems take priority without completely eclipsing your personal agency. You\'ll spend more time navigating partnerships, career dynamics, or collective responsibilities.',
          'Upper-hemisphere Solar Returns often coincide with partnership milestones, career transitions, involvement in larger organizations, spiritual deepening, or years when you must surrender personal control and trust the process.'
        ],
        focusAreas: [
          'Partnerships — business, romantic, and collaborative',
          'Career navigation within larger organizations or institutions',
          'Community involvement and collective responsibilities',
          'Spiritual practice, therapy, or inner work (12th house)',
          'Higher education, travel, or expanded perspective'
        ],
        challenges: [
          'Feeling like others set the agenda rather than you',
          'Burnout from constant relational or institutional demands',
          'Loss of personal autonomy — needing to compromise and adapt',
          'If 12th house is activated: enforced solitude or endings that feel beyond your control'
        ],
        practicalAdvice: [
          'Recognize that growth through others IS personal growth — it\'s just not solo',
          'Invest in your key partnerships since they carry extra weight this year',
          'If the 12th house is activated, honor the need for retreat and closure — this is not failure, it\'s preparation',
          'Be strategic about which commitments and obligations you accept',
          'Maintain some personal practices (exercise, journaling) to stay grounded amid external demands'
        ]
      }
    };
  }

  // Lower dominant
  const intensity = diff >= 6 ? 'extreme' : 'moderate';
  return {
    label: intensity === 'extreme' ? 'Strong Lower Dominance' : 'Lower-Leaning',
    detail: {
      title: intensity === 'extreme'
        ? 'Below the Horizon — A Self-Directed, Foundation-Building Year'
        : 'Lower Hemisphere Emphasis — Personal Agency Year',
      summary: `${lower} of your ${total} planets sit below the horizon (Houses 1–6). This is a year where YOU set the agenda — personal development, self-expression, and building your own foundations take priority.`,
      bodyParagraphs: [
        `With ${lower} planets below the horizon versus only ${upper} above, this Solar Return emphasizes the lower hemisphere. This does NOT mean "hidden" or "invisible" — the 1st house (your most visible, outward-facing house) is part of this hemisphere. Lower emphasis means your life is driven by personal agency: you are the initiator, the builder, the one setting terms.`,
        'The lower hemisphere encompasses self-identity and how you present to the world (1st), personal finances and values (2nd), communication and local connections (3rd), home and family foundations (4th), creative self-expression and romance (5th), and daily health and work routines (6th). Planets clustering here signal a year of self-directed action.',
        intensity === 'extreme'
          ? 'With such a strong lower concentration, this is emphatically a year where you build from the ground up on your own terms. You are shaping your identity, stabilizing your resources, creating from your own vision, and perfecting your craft. This is NOT a year of passivity — it\'s a year of personal initiative. The results of this self-directed work will become relational and institutional in subsequent Solar Returns.'
          : 'This moderate lower lean suggests a year where personal initiative takes priority without completely removing you from partnerships and external systems. You\'ll naturally gravitate toward self-improvement, creative projects, and foundation-building.',
        'Lower-hemisphere years often coincide with personal reinvention, financial restructuring, creative breakthroughs, home changes, health transformations, or periods of deliberate self-development.'
      ],
      focusAreas: [
        'Personal identity and self-presentation',
        'Financial stability and resource management',
        'Home environment — renovations, moves, or family foundations',
        'Creative projects driven by your own vision',
        'Physical health and daily routine optimization'
      ],
      challenges: [
        'Over-reliance on self — difficulty asking for help or collaborating',
        'Frustration if partnerships or institutions don\'t align with your personal agenda',
        'Risk of isolation if you neglect relational engagement entirely',
        'Others may not understand your focus on personal foundations'
      ],
      practicalAdvice: [
        'Lean into your personal agency — this is YOUR year to build',
        'Invest in your physical health, home, finances, and creative skills',
        'Don\'t neglect key partnerships entirely, but recognize they\'re not the primary driver this year',
        'Journal, take classes, start creative projects — this is a year for self-directed growth',
        'Trust that the foundations you build now will support future relational and career chapters'
      ]
    }
  };
}

// ============================================================================
// HORIZONTAL AXIS: EASTERN (Self-Initiated) vs WESTERN (Other-Oriented)
// ============================================================================

function getHorizontalDetail(east: number, west: number, total: number): { label: string; detail: HemisphereDetail } {
  const eastPct = total > 0 ? (east / total) * 100 : 50;
  const diff = Math.abs(east - west);

  if (diff <= 1) {
    return {
      label: 'Balanced East/West',
      detail: {
        title: 'Balanced Initiative — Self-Direction Meets Collaboration',
        summary: 'Your Solar Return planets are equally divided between eastern and western hemispheres. You have equal capacity for self-initiated action and responsive collaboration.',
        bodyParagraphs: [
          'When the eastern and western hemispheres hold equal planetary weight, you are neither purely self-directed nor purely dependent on others for direction. This balance suggests a year where both your own initiatives and your responses to others\' needs shape outcomes.',
          'This is generally a favorable balance — you can start your own projects when inspiration strikes AND effectively collaborate when opportunities arrive through others. The key is knowing which mode to use when.',
          'This balanced east-west axis means you have genuine free will AND the social awareness to use it wisely. Neither isolation nor over-dependence on others defines your year.'
        ],
        focusAreas: [
          'Developing discernment about when to lead vs. when to follow',
          'Projects that require both personal vision and teamwork',
          'Maintaining autonomy within relationships'
        ],
        challenges: [
          'Indecision about whether to act independently or wait for input',
          'Possible see-sawing between assertive and passive modes'
        ],
        practicalAdvice: [
          'For each major decision, consciously ask: "Is this one where I lead or where I listen?"',
          'Use the specific planet placements to determine which areas call for initiative vs. collaboration'
        ]
      }
    };
  }

  if (eastPct > 60) {
    const isExtreme = diff >= 6;
    const isNearTotal = eastPct >= 85;
    return {
      label: isNearTotal ? 'Extreme Eastern Dominance' : isExtreme ? 'Strong Eastern Emphasis' : 'Eastern-Leaning',
      detail: {
        title: isNearTotal
          ? 'Near-Total Eastern Dominance — Your Year, Your Rules'
          : isExtreme
            ? 'Strong Eastern Emphasis — Self-Determination Drives This Year'
            : 'Eastern Hemisphere Emphasis — Initiative & Independence',
        summary: `${east} of your ${total} planets occupy the eastern hemisphere (Houses 10, 11, 12, 1, 2, 3). This is one of the strongest possible indicators of personal agency in a Solar Return. YOU are the architect of this year.`,
        bodyParagraphs: [
          `With ${east} out of ${total} planets in the eastern hemisphere and only ${west} in the west, this Solar Return places an extraordinary amount of power and responsibility in your own hands. An eastern emphasis of this magnitude means that your actions, decisions, and initiatives — not other people\'s — determine how the year unfolds. You are not waiting for permission, invitations, or opportunities to come to you. You are creating them.`,

          'The eastern hemisphere (Houses 1, 2, 3, 10, 11, 12) encompasses identity and self-presentation (1st), personal finances and values (2nd), communication and local environment (3rd), career and public standing (10th), community and future vision (11th), and the inner spiritual/unconscious realm (12th). When nearly all your planets cluster here, these houses become your active theater of operations. You are personally driving changes in your identity, income, how you communicate, your career path, your social circles, and your inner world.',

          isNearTotal
            ? 'This near-total eastern concentration is rare and extremely significant. This is a "protagonist year" — the plot of your life revolves entirely around your choices. There is very little buffering from others; what you do (or fail to do) produces direct, undiluted consequences. This is simultaneously empowering and daunting. You cannot blame circumstances or other people for where you end up by next birthday. The flip side is exhilarating freedom: if you want to change direction, rebrand yourself, start a business, move across the country, or radically alter your life — this is the year the cosmos is giving you maximum latitude to do so.'
            : 'This strong eastern concentration indicates significant personal agency. You are the primary mover in most areas of your life this year. While others will still play supporting roles, the initiative and decision-making fall predominantly on you.',

          'Extreme eastern years often correlate with major personal launches — new businesses, solo creative projects, geographic moves, or bold identity shifts. These are years when you don\'t consult committees; you act from your own authority. Eastern emphasis in Solar Returns is especially powerful when it echoes the natal chart\'s emphasis, amplifying a natural tendency toward independence.',

          'Extreme eastern emphasis can manifest as loneliness or a feeling that nobody else understands your vision. Because you are so far ahead of the curve in terms of self-direction, others may lag behind, unable to keep up with your pace of change. This is not a rejection of relationship — it is a recognition that THIS year, you are meant to be the author, not the editor, of your story.',

          'Solar Returns with strong eastern emphasis favor independent professional ventures, self-employment decisions, personal fitness transformations, solo travel, and any situation where the outcome depends primarily on individual effort rather than team consensus or market conditions.'
        ],
        focusAreas: [
          'Personal initiative — launch projects, businesses, or creative works under your own name',
          'Self-presentation and identity — how you brand, style, and present yourself to the world matters enormously',
          'Financial independence — your earning power is tied to your own efforts, not partnerships or employer generosity',
          'Communication — writing, speaking, teaching, or publishing from your personal perspective',
          'Career moves driven by YOUR ambition, not corporate restructuring or others\' agendas',
          'Future vision — your dreams and goals for the coming years are being planted and shaped by your own hands this year'
        ],
        challenges: [
          'Loneliness or isolation — others may not share your intensity of purpose',
          'Over-independence — refusing help or collaboration when it would genuinely serve you',
          'Decision fatigue — when everything depends on your choices, the volume of decisions can be overwhelming',
          'Accountability — with no one else to blame, you must fully own both successes and failures',
          'Potential for selfishness or tunnel vision if self-focus becomes excessive',
          'Partners or close relationships may feel sidelined or secondary to your personal agenda'
        ],
        practicalAdvice: [
          'Set 3–5 major personal goals at the start of this Solar Return year and pursue them with conviction — the cosmos is backing YOUR initiative',
          'Don\'t wait for consensus, approval, or perfect conditions. ACT. Eastern years reward action over deliberation',
          'Check in with close relationships monthly — your intense self-focus this year is natural but can inadvertently distance people you care about',
          'Channel the self-determination into one or two major projects rather than scattering energy across too many fronts',
          'Physical exercise, especially solo practices (running, swimming, yoga, martial arts), aligns with the eastern energy and helps process the intensity',
          'Make important decisions early in the SR year when the eastern momentum is strongest',
          'Keep a journal — with this much self-directed energy, tracking your evolution across the year will be invaluable for future reference',
          'If you\'ve been waiting for "the right time" to go out on your own — professionally, creatively, or personally — this is the strongest cosmic signal you\'ll get'
        ]
      }
    };
  }

  // Western dominant
  const isExtreme = diff >= 6;
  const isNearTotal = (100 - eastPct) >= 85;
  return {
    label: isNearTotal ? 'Extreme Western Dominance' : isExtreme ? 'Strong Western Emphasis' : 'Western-Leaning',
    detail: {
      title: isNearTotal
        ? 'Near-Total Western Dominance — Others Shape Your Year'
        : isExtreme
          ? 'Strong Western Emphasis — Relationships & Responsiveness Define This Year'
          : 'Western Hemisphere Emphasis — Collaborative & Responsive',
      summary: `${west} of your ${total} planets occupy the western hemisphere (Houses 4, 5, 6, 7, 8, 9). This year unfolds through other people — partnerships, collaborations, and how you respond to external circumstances.`,
      bodyParagraphs: [
        `With ${west} out of ${total} planets in the western hemisphere and only ${east} in the east, this Solar Return places you in a responsive rather than initiating role. Western emphasis means your most important growth comes through engaging with others and responding to circumstances you did not create.`,

        'The western hemisphere (Houses 4, 5, 6, 7, 8, 9) encompasses home and family roots (4th), creative expression and romance (5th), health and service (6th), committed partnerships (7th), shared resources and transformation (8th), and higher learning and travel (9th). Planets clustering here signal a year where these relational and experiential domains dominate.',

        isNearTotal
          ? 'With nearly all planets in the west, this is one of the most other-oriented Solar Returns possible. Your personal fate this year is deeply intertwined with the actions, decisions, and needs of other people. Major life changes may come through a partner\'s career move, a family member\'s health, a business partner\'s decision, or a teacher/mentor\'s influence. The lesson is profound surrender to the collaborative process.'
          : 'This strong western emphasis means relationships and collaborations are the primary vehicles through which this year\'s story unfolds. Your growth comes not from solo initiative but from how you engage, negotiate, and respond.',

        'Western-emphasis Solar Returns often bring significant relationship developments — marriages, business partnerships, important new friendships, or the need to renegotiate existing relationships. These are years to practice the art of compromise, negotiation, and receptivity.',

        'Western years teach us that fulfillment doesn\'t always come from personal ambition. Sometimes the deepest growth arrives when we open ourselves to what others bring us — their perspectives, needs, challenges, and gifts.'
      ],
      focusAreas: [
        'Partnerships — romantic, business, and creative collaborations',
        'Responsiveness — learning to receive, adapt, and flow with external circumstances',
        'Service — contributing your skills to others\' needs',
        'Shared resources — joint finances, inheritances, investments involving others',
        'Learning from mentors, teachers, or peers',
        'Travel or educational experiences that expand your worldview through exposure to others'
      ],
      challenges: [
        'Feeling powerless or at the mercy of others\' decisions',
        'Codependency — losing your own identity in relationships',
        'Frustration from lack of personal control over the pace of change',
        'Resentment if others don\'t reciprocate your responsiveness',
        'Difficulty asserting personal needs when the emphasis is on serving others'
      ],
      practicalAdvice: [
        'Strengthen your negotiation and communication skills — they are your primary tools this year',
        'Enter partnerships with clear boundaries and written agreements',
        'Practice discernment: not every request from others deserves your energy',
        'Trust the process of collaboration even when it feels slower than acting alone',
        'Maintain a personal creative outlet or solo practice to keep your sense of self grounded',
        'If significant others make major decisions that affect you, advocate for your needs rather than passively accepting'
      ]
    }
  };
}

// ============================================================================
// COMBINED INSIGHT — cross-axis synthesis
// ============================================================================

function getCombinedInsight(upper: number, lower: number, east: number, west: number, total: number): string {
  const upperDom = upper > lower + 1;
  const lowerDom = lower > upper + 1;
  const eastDom = east > west + 2;
  const westDom = west > east + 2;
  const balanced_v = !upperDom && !lowerDom;
  const balanced_h = !eastDom && !westDom;

  if (balanced_v && eastDom) {
    return 'Your equal upper/lower split combined with strong eastern emphasis creates a unique signature: you have balanced access to both public and private life, but in BOTH spheres you are the initiator. This means you can drive change at home just as effectively as in your career — and the choice of where to focus is entirely yours. Use this rare combination of balance and agency wisely: you can direct energy into any life area with equal force.';
  }
  if (balanced_v && westDom) {
    return 'Your equal upper/lower split combined with western emphasis means you move freely between public and private spheres, but in both areas your growth comes through responding to others rather than initiating solo. This year favors deep listening — at home and at work.';
  }
  if (upperDom && eastDom) {
    return 'Upper + Eastern: This is the classic "CEO year." You are publicly visible AND driving the agenda. Career advancement, public launches, and visible leadership define this Solar Return. The risk is burnout from constant high-visibility initiative. Ensure you schedule genuine downtime.';
  }
  if (upperDom && westDom) {
    return 'Upper + Western: You are publicly visible but in a responsive role — partnerships, collaborations, and others\' invitations shape your public trajectory. This is a year to be an excellent collaborator in high-visibility settings.';
  }
  if (lowerDom && eastDom) {
    return 'Lower + Eastern: You are building private foundations on your own terms. Solo creative projects, independent financial planning, personal health transformation, or solo entrepreneurial groundwork characterize this year. You are self-directed but focused inward — laying foundations nobody can see yet.';
  }
  if (lowerDom && westDom) {
    return 'Lower + Western: Both axes point toward receptivity and privacy. This is a deeply relational, intimate year — family dynamics, close partnerships, and private emotional work dominate. External ambition takes a back seat to personal relationships and inner healing.';
  }
  if (balanced_v && balanced_h) {
    return 'All four quadrants receive roughly equal attention. This is a year of broad versatility — no single life area dominates. Look to the specific planet positions and aspects for your primary themes, as the hemispheric distribution alone does not reveal a strong directional pull.';
  }

  return 'Your hemisphere distribution offers a nuanced blend of influences. Consult the specific house placements of each planet for the clearest guidance on where to direct your energy this year.';
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

export function analyzeSRHemispheres(
  planetHouses: Record<string, number | null>,
  planetNames: string[]
): SRHemisphericResult {
  let upper = 0, lower = 0, east = 0, west = 0;
  const upperPlanets: string[] = [], lowerPlanets: string[] = [];
  const eastPlanets: string[] = [], westPlanets: string[] = [];

  for (const name of planetNames) {
    const h = planetHouses[name];
    if (h == null) continue;
    if (h >= 7 && h <= 12) { upper++; upperPlanets.push(name); } else { lower++; lowerPlanets.push(name); }
    if (h >= 10 || h <= 3) { east++; eastPlanets.push(name); } else { west++; westPlanets.push(name); }
  }

  const total = upper + lower;
  const { label: verticalLabel, detail: verticalDetail } = getVerticalDetail(upper, lower, total);
  const { label: horizontalLabel, detail: horizontalDetail } = getHorizontalDetail(east, west, total);
  const combinedInsight = getCombinedInsight(upper, lower, east, west, total);

  return {
    upper, lower, east, west,
    upperPlanets, lowerPlanets, eastPlanets, westPlanets,
    totalCounted: total,
    verticalLabel,
    horizontalLabel,
    verticalDetail,
    horizontalDetail,
    combinedInsight
  };
}

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
  totalCounted: number;
  verticalLabel: string;   // e.g. "Balanced Upper/Lower" or "Upper Dominant"
  horizontalLabel: string; // e.g. "Extreme Eastern"
  verticalDetail: HemisphereDetail;
  horizontalDetail: HemisphereDetail;
  combinedInsight: string;
}

// ============================================================================
// VERTICAL AXIS: UPPER (Southern/Public) vs LOWER (Northern/Private)
// ============================================================================

function getVerticalDetail(upper: number, lower: number, total: number): { label: string; detail: HemisphereDetail } {
  const upperPct = total > 0 ? (upper / total) * 100 : 50;
  const lowerPct = total > 0 ? (lower / total) * 100 : 50;
  const diff = Math.abs(upper - lower);

  if (diff <= 1) {
    return {
      label: 'Balanced Upper/Lower',
      detail: {
        title: 'Balanced Horizon — Equal Public & Private',
        summary: 'Your Solar Return planets are evenly split above and below the horizon. This is a year where your private inner world and your public outer world receive equal attention and energy.',
        bodyParagraphs: [
          'When planets divide evenly across the horizon line, neither the public nor private sphere dominates your year. This balance suggests a year of integration — you are not being pushed exclusively into the spotlight or pulled entirely into retreat. Instead, you move fluidly between both domains.',
          'A balanced horizon in the Solar Return means internal development supports external achievement and vice versa. What you process privately (emotional work, family matters, self-care) feeds directly into what you accomplish publicly (career moves, social engagements, reputation building). There is no disconnect between inner and outer worlds.',
          'This balance can also signal that no single life area is in crisis — you have the bandwidth to attend to both personal foundations and professional or social responsibilities. The risk, however, is a lack of clear direction: when everything gets equal weight, you may struggle to prioritize or feel pulled in too many directions simultaneously.'
        ],
        focusAreas: [
          'Integration: consciously bridge your private insights into your public actions',
          'Time management: with equal demands from both spheres, scheduling becomes critical',
          'Check in quarterly to see if one hemisphere is being neglected despite the theoretical balance'
        ],
        challenges: [
          'Diffusion of focus — everything feels equally important',
          'Difficulty prioritizing between inner needs and outer obligations',
          'May not feel like a "big" year because no single area is being dramatically activated'
        ],
        practicalAdvice: [
          'Use a planner that tracks both personal growth goals and professional milestones side by side',
          'Schedule dedicated private retreat time alongside social/career commitments',
          'Let the SR house placements of individual planets guide where to invest energy since the hemispheres alone don\'t provide a strong directional signal'
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
          ? 'Above the Horizon — A Highly Visible, Public Year'
          : 'Upper Hemisphere Emphasis — External Focus',
        summary: `${upper} of your ${total} planets sit above the horizon (Houses 7–12). This is a year where your life is lived more publicly — through relationships, career, community, and collective engagement.`,
        bodyParagraphs: [
          `With ${upper} planets above the horizon versus only ${lower} below, the Solar Return strongly emphasizes the southern (upper) hemisphere. This pattern indicates a year when you are "out there" — visible, engaged with the world, and focused on how you relate to others and to society at large. Your private inner world takes a back seat to external demands and opportunities.`,
          'The upper hemisphere encompasses partnerships (7th), shared resources and transformation (8th), higher learning and travel (9th), career and public standing (10th), community and future visions (11th), and spiritual/institutional matters (12th). When planets cluster here, events in these domains drive your year. You may find yourself in the public eye, entering or deepening partnerships, traveling, receiving recognition, or participating in group causes.',
          intensity === 'extreme'
            ? 'With such a dramatic upper concentration, this year\'s lessons arrive THROUGH other people and external circumstances rather than through solitary introspection. The universe is asking you to engage, to show up, and to let your actions be witnessed. Privacy may feel hard to come by — even if you try to retreat, circumstances pull you back out. This is a year where reputation and public perception matter significantly.'
            : 'This moderate upper lean suggests a year where external engagement is emphasized without completely eclipsing your inner world. You\'ll spend more time interacting with others and handling career or social obligations, while still having some capacity for private reflection.',
          'Upper-hemisphere Solar Returns often coincide with years of professional advancement, important relationship milestones, or increased social responsibility. The work you\'ve done privately in previous years now gets "shown to the world."'
        ],
        focusAreas: [
          'Career advancement and public reputation',
          'Partnerships — business and romantic',
          'Social networking and community involvement',
          'How others perceive you — your public image',
          'Higher education, publishing, or legal matters'
        ],
        challenges: [
          'Neglecting personal needs and self-care in favor of external demands',
          'Burnout from constant public engagement',
          'Feeling like your identity is defined by others\' expectations',
          'Privacy may feel compromised or hard to maintain'
        ],
        practicalAdvice: [
          'Deliberately carve out private time — it won\'t happen naturally this year',
          'Invest in your professional image and reputation since they carry extra weight',
          'Be strategic about which partnerships and social obligations you commit to',
          'Use the momentum — this is a year to launch, publish, present, or otherwise make your mark',
          'Don\'t ignore physical and emotional health even as external demands intensify'
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
        ? 'Below the Horizon — A Private, Foundation-Building Year'
        : 'Lower Hemisphere Emphasis — Internal Focus',
      summary: `${lower} of your ${total} planets sit below the horizon (Houses 1–6). This is a year focused on personal development, building foundations, and private inner work.`,
      bodyParagraphs: [
        `With ${lower} planets below the horizon versus only ${upper} above, the Solar Return emphasizes the northern (lower) hemisphere. This is a year when the work is internal, subjective, and personal. You are building or rebuilding the foundations of your life — identity, finances, communication skills, home, family, creativity, health, and daily routines.`,
        'The lower hemisphere encompasses self-identity and appearance (1st), personal resources and values (2nd), communication and learning (3rd), home and family (4th), creativity and romance (5th), and health and daily work (6th). Planets clustering here signal a year where these personally-rooted areas demand your attention.',
        intensity === 'extreme'
          ? 'With such a strong lower concentration, this is emphatically a building year. You are "constructing from the ground up" — laying foundations that will support future public achievements. This is NOT the year to force a public debut or major career push. Instead, honor the inward pull: heal what needs healing, stabilize your finances, deepen your self-understanding, and perfect your craft. The results of this work will become visible in subsequent Solar Returns.'
          : 'This moderate lower lean suggests a year where personal development takes priority without completely removing you from public life. You\'ll naturally gravitate toward home improvements, creative projects, health routines, and self-discovery while maintaining some external engagements.',
        'Lower-hemisphere years often coincide with moves, home renovations, starting a personal creative project, therapy or healing work, or simply a period where you need to "come home to yourself" before re-engaging with the wider world.'
      ],
      focusAreas: [
        'Self-discovery and personal identity work',
        'Financial stability and resource management',
        'Home environment — renovations, moves, or family matters',
        'Creative projects that don\'t yet need an audience',
        'Physical health and daily routine optimization'
      ],
      challenges: [
        'Feeling invisible or disconnected from your social/professional world',
        'Frustration if you try to force external achievements during an inward year',
        'Isolation or excessive self-focus',
        'Others may not understand your need for privacy'
      ],
      practicalAdvice: [
        'Trust the process — foundation work is not glamorous but it\'s essential',
        'Use this year to invest in your physical health, home, and creative skills',
        'Don\'t compare your progress to others\' public achievements this year',
        'Journal, go to therapy, take classes — this is a year for inner enrichment',
        'Plan for future public visibility but don\'t force it now'
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
        `With ${west} out of ${total} planets in the western hemisphere and only ${east} in the east, this Solar Return places you in a responsive rather than initiating role. Mary Fortier Shea describes western emphasis as years when "fate" plays a stronger hand — not because you lack free will, but because your most important growth comes through engaging with others and responding to circumstances you did not create.`,

        'The western hemisphere (Houses 4, 5, 6, 7, 8, 9) encompasses home and family roots (4th), creative expression and romance (5th), health and service (6th), committed partnerships (7th), shared resources and transformation (8th), and higher learning and travel (9th). Planets clustering here signal a year where these relational and experiential domains dominate.',

        isNearTotal
          ? 'With nearly all planets in the west, this is one of the most other-oriented Solar Returns possible. Your personal fate this year is deeply intertwined with the actions, decisions, and needs of other people. Major life changes may come through a partner\'s career move, a family member\'s health, a business partner\'s decision, or a teacher/mentor\'s influence. The lesson is profound surrender to the collaborative process.'
          : 'This strong western emphasis means relationships and collaborations are the primary vehicles through which this year\'s story unfolds. Your growth comes not from solo initiative but from how you engage, negotiate, and respond.',

        'Lynn Bell notes that western-emphasis Solar Returns often bring significant relationship developments — marriages, business partnerships, important new friendships, or the need to renegotiate existing relationships. These are years to practice the art of compromise, negotiation, and receptivity.',

        'Brian Clark observes that western years teach us that fulfillment doesn\'t always come from personal ambition. Sometimes the deepest growth arrives when we open ourselves to what others bring us — their perspectives, needs, challenges, and gifts.'
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

  for (const name of planetNames) {
    const h = planetHouses[name];
    if (h == null) continue;
    if (h >= 7 && h <= 12) upper++; else lower++;
    if (h >= 10 || h <= 3) east++; else west++;
  }

  const total = upper + lower;
  const { label: verticalLabel, detail: verticalDetail } = getVerticalDetail(upper, lower, total);
  const { label: horizontalLabel, detail: horizontalDetail } = getHorizontalDetail(east, west, total);
  const combinedInsight = getCombinedInsight(upper, lower, east, west, total);

  return {
    upper, lower, east, west,
    totalCounted: total,
    verticalLabel,
    horizontalLabel,
    verticalDetail,
    horizontalDetail,
    combinedInsight
  };
}

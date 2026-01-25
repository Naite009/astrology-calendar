import { NatalChart } from '@/hooks/useNatalChart';

// Relationship focus type
export type RelationshipFocus = 'romance' | 'friendship' | 'business' | 'family' | 'creative';

// Karmic weight constants
const KARMIC_WEIGHTS = {
  southNode: {
    conjunction: 15,
    opposition: 10,
    square: 8,
    trine: 6,
    sextile: 4
  },
  northNode: {
    conjunction: 12,
    opposition: 8,
    square: 6,
    trine: 5,
    sextile: 3
  },
  saturn: {
    conjunction: 12,
    opposition: 10,
    square: 10,
    trine: 5,
    sextile: 3
  },
  pluto: {
    conjunction: 14,
    opposition: 12,
    square: 11,
    trine: 6,
    sextile: 4
  },
  chiron: {
    conjunction: 10,
    opposition: 8,
    square: 7,
    trine: 4,
    sextile: 3
  },
  twelfthHouse: 8,
  eighthHouse: 6,
  vertex: 10
};

const PERSONAL_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];

export interface KarmicIndicator {
  type: 'south_node' | 'north_node' | 'saturn' | 'pluto' | 'chiron' | 'twelfth_house' | 'eighth_house' | 'vertex';
  planet1: string;
  planet2: string;
  aspect?: string;
  weight: number;
  interpretation: string;
  theme: 'past_life' | 'soul_growth' | 'karmic_debt' | 'transformation' | 'healing' | 'fated';
}

export interface KarmicAnalysis {
  totalKarmicScore: number;
  pastLifeProbability: number;
  karmicType: 'completion' | 'new_contract' | 'soul_family' | 'catalyst' | 'twin_flame' | 'karmic_lesson';
  indicators: KarmicIndicator[];
  dangerFlags: string[];
  healingOpportunities: string[];
  soulPurpose: string;
  recommendedApproach: string;
  timeline: { likely_duration: string; key_lessons: string[]; completion_indicators: string[]; };
  focus: RelationshipFocus;
}

const ZODIAC_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

function calculateAspect(planet1: any, planet2: any): string | null {
  if (!planet1 || !planet2) return null;
  const signIndex1 = typeof planet1.sign === 'string' ? ZODIAC_SIGNS.indexOf(planet1.sign) : planet1.sign;
  const signIndex2 = typeof planet2.sign === 'string' ? ZODIAC_SIGNS.indexOf(planet2.sign) : planet2.sign;
  if (signIndex1 === -1 || signIndex2 === -1) return null;
  const pos1 = signIndex1 * 30 + planet1.degree + (planet1.minutes / 60);
  const pos2 = signIndex2 * 30 + planet2.degree + (planet2.minutes / 60);
  let diff = Math.abs(pos1 - pos2);
  if (diff > 180) diff = 360 - diff;
  if (diff <= 8) return 'conjunction';
  if (Math.abs(diff - 180) <= 8) return 'opposition';
  if (Math.abs(diff - 120) <= 8) return 'trine';
  if (Math.abs(diff - 90) <= 7) return 'square';
  if (Math.abs(diff - 60) <= 6) return 'sextile';
  return null;
}

function isPlanetInHouse(planet: any, houseCusp: any, nextHouseCusp: any): boolean {
  if (!planet || !houseCusp || !nextHouseCusp) return false;
  const planetSignIndex = typeof planet.sign === 'string' ? ZODIAC_SIGNS.indexOf(planet.sign) : planet.sign;
  const cuspSignIndex = typeof houseCusp.sign === 'string' ? ZODIAC_SIGNS.indexOf(houseCusp.sign) : houseCusp.sign;
  const nextCuspSignIndex = typeof nextHouseCusp.sign === 'string' ? ZODIAC_SIGNS.indexOf(nextHouseCusp.sign) : nextHouseCusp.sign;
  if (planetSignIndex === -1 || cuspSignIndex === -1 || nextCuspSignIndex === -1) return false;
  const planetPos = planetSignIndex * 30 + planet.degree + (planet.minutes / 60);
  const cuspPos = cuspSignIndex * 30 + houseCusp.degree + (houseCusp.minutes / 60);
  let nextCuspPos = nextCuspSignIndex * 30 + nextHouseCusp.degree + (nextHouseCusp.minutes / 60);
  if (nextCuspPos < cuspPos) nextCuspPos += 360;
  let adjustedPlanetPos = planetPos;
  if (adjustedPlanetPos < cuspPos) adjustedPlanetPos += 360;
  return adjustedPlanetPos >= cuspPos && adjustedPlanetPos < nextCuspPos;
}

// ============================================================================
// FOCUS-AWARE INTERPRETATION FUNCTIONS
// ============================================================================

/**
 * Get North Node interpretation based on relationship focus
 */
function getNorthNodeInterpretation(planet: string, aspect: string, focus: RelationshipFocus): string {
  const aspectDescriptor = aspect === 'conjunction' ? 'directly activates' 
    : aspect === 'opposition' ? 'challenges and balances'
    : aspect === 'square' ? 'creates growth tension with'
    : aspect === 'trine' ? 'harmoniously supports'
    : 'gently encourages';

  const interpretations: Record<string, Record<RelationshipFocus, string>> = {
    Sun: {
      romance: `This person ${aspectDescriptor} your life purpose through love. They illuminate who you're becoming in this lifetime, and romantic partnership is a vehicle for that evolution.`,
      friendship: `This friend ${aspectDescriptor} your life direction. Through this friendship, you discover more about your authentic identity and the person you're meant to become.`,
      business: `This person ${aspectDescriptor} your professional destiny. In business together, you're pushed toward your highest potential and true career path.`,
      family: `This family member ${aspectDescriptor} your identity evolution. Through this bond, you learn essential lessons about who you truly are.`,
      creative: `This creative partner ${aspectDescriptor} your artistic destiny. Your collaboration pushes you toward the creative expression you're meant to develop.`
    },
    Moon: {
      romance: `This person ${aspectDescriptor} your emotional evolution. In romantic partnership, you learn new ways to nurture and be nurtured—essential for your soul's growth.`,
      friendship: `This friend ${aspectDescriptor} your emotional development. Through this friendship, you learn healthier patterns of emotional support and security.`,
      business: `This person ${aspectDescriptor} your intuitive business sense. Working together develops your ability to read situations and trust your instincts professionally.`,
      family: `This family member ${aspectDescriptor} your emotional inheritance patterns. Through this bond, you heal and evolve family emotional dynamics.`,
      creative: `This creative partner ${aspectDescriptor} your emotional expression. Your collaboration helps you access and channel deeper feelings in your work.`
    },
    Mercury: {
      romance: `This person ${aspectDescriptor} how you think and communicate about love. Through this relationship, you develop new ways of expressing your romantic needs.`,
      friendship: `This friend ${aspectDescriptor} your communication evolution. Through dialogue, you discover new ways of thinking and expressing your ideas.`,
      business: `This person ${aspectDescriptor} your professional communication style. Working together sharpens how you negotiate, present, and strategize.`,
      family: `This family member ${aspectDescriptor} family communication patterns. Through this bond, you learn healthier ways to talk and listen within family.`,
      creative: `This creative partner ${aspectDescriptor} your artistic voice. Collaboration helps you find and refine your unique creative expression.`
    },
    Venus: {
      romance: `This person ${aspectDescriptor} your capacity for romantic love. They teach you what you truly value in partnership and how to receive love fully.`,
      friendship: `This friend ${aspectDescriptor} what you value in friendship. Through this bond, you learn about genuine appreciation and reciprocal care.`,
      business: `This person ${aspectDescriptor} your professional values. Working together clarifies what matters to you in business—ethics, aesthetics, partnerships.`,
      family: `This family member ${aspectDescriptor} family values and traditions. Through this bond, you evolve what love and appreciation mean in family contexts.`,
      creative: `This creative partner ${aspectDescriptor} your aesthetic evolution. Collaboration refines your taste and sense of beauty in your work.`
    },
    Mars: {
      romance: `This person ${aspectDescriptor} how you pursue love. Through this relationship, you learn healthier ways to assert your romantic desires and boundaries.`,
      friendship: `This friend ${aspectDescriptor} your courage and initiative. Through this friendship, you become bolder in going after what you want.`,
      business: `This person ${aspectDescriptor} your professional drive. Working together sharpens your competitive edge and ability to take decisive action.`,
      family: `This family member ${aspectDescriptor} healthy assertion in family. Through this bond, you learn to stand your ground while maintaining connection.`,
      creative: `This creative partner ${aspectDescriptor} your artistic courage. Collaboration helps you take bolder creative risks.`
    }
  };

  return interpretations[planet]?.[focus] || `This person ${aspectDescriptor} your soul growth through their ${planet} energy, specifically in your ${focus} connection.`;
}

/**
 * Get South Node interpretation based on relationship focus
 */
function getSouthNodeInterpretation(planet: string, aspect: string, focus: RelationshipFocus): string {
  const aspectDescriptor = aspect === 'conjunction' ? 'directly connects to' 
    : aspect === 'opposition' ? 'mirrors and reflects'
    : aspect === 'square' ? 'challenges'
    : aspect === 'trine' ? 'flows easily with'
    : 'subtly links to';

  const interpretations: Record<string, Record<RelationshipFocus, string>> = {
    Sun: {
      romance: `This person ${aspectDescriptor} familiar romantic patterns from the past. You may have loved before—there's instant recognition. Be aware of falling into old roles.`,
      friendship: `This friend ${aspectDescriptor} past-life friendship patterns. The connection feels instantly comfortable, but watch for falling into outdated dynamics.`,
      business: `This person ${aspectDescriptor} past professional patterns. You may have worked together before—there's familiarity. Avoid repeating old business mistakes.`,
      family: `This family member ${aspectDescriptor} ancestral identity patterns. Through this bond, old family dynamics around identity may replay unless made conscious.`,
      creative: `This creative partner ${aspectDescriptor} past creative patterns. There's familiar artistic chemistry, but push beyond comfort zones together.`
    },
    Moon: {
      romance: `This person ${aspectDescriptor} deep emotional familiarity. You may have nurtured each other before. Watch for codependent patterns from past connections.`,
      friendship: `This friend ${aspectDescriptor} familiar emotional comfort. There's instant emotional ease, but don't let comfort prevent new emotional growth.`,
      business: `This person ${aspectDescriptor} familiar intuitive patterns in work. You read each other easily, but watch for outdated assumptions.`,
      family: `This family member ${aspectDescriptor} ancestral emotional patterns. Old family emotional dynamics may surface for healing.`,
      creative: `This creative partner ${aspectDescriptor} familiar emotional expression. Don't let comfort prevent emotional depth in your work.`
    },
    Mercury: {
      romance: `This person ${aspectDescriptor} familiar communication patterns in love. You understand each other easily, but watch for assumptions and unspoken expectations.`,
      friendship: `This friend ${aspectDescriptor} comfortable communication styles. Conversation flows, but push beyond surface familiarity.`,
      business: `This person ${aspectDescriptor} familiar business communication. You negotiate well together, but avoid repeating past agreements.`,
      family: `This family member ${aspectDescriptor} ancestral communication patterns. Old family ways of talking may surface—some helpful, some needing evolution.`,
      creative: `This creative partner ${aspectDescriptor} familiar creative dialogue. Push beyond comfortable exchanges to new ideas.`
    },
    Venus: {
      romance: `This person ${aspectDescriptor} deep romantic familiarity. Love feels comfortable and known—perhaps too comfortable. Push toward new expressions of love.`,
      friendship: `This friend ${aspectDescriptor} familiar friendship values. The appreciation is easy, but grow your values together rather than staying stuck.`,
      business: `This person ${aspectDescriptor} familiar professional values. You share business ethics, but ensure they're evolved for present needs.`,
      family: `This family member ${aspectDescriptor} ancestral value patterns. Family traditions and values from the past surface—honor what serves, release what doesn't.`,
      creative: `This creative partner ${aspectDescriptor} familiar aesthetic preferences. The taste alignment is easy, but push into new artistic territory.`
    },
    Mars: {
      romance: `This person ${aspectDescriptor} familiar desire patterns. Passion follows known paths—watch for old conflicts resurfacing alongside the chemistry.`,
      friendship: `This friend ${aspectDescriptor} familiar action patterns. You motivate each other in familiar ways, but challenge each other to new actions.`,
      business: `This person ${aspectDescriptor} familiar competitive patterns. You know how to work together, but avoid old power struggles.`,
      family: `This family member ${aspectDescriptor} ancestral conflict patterns. Old family battles may echo—choose conscious resolution.`,
      creative: `This creative partner ${aspectDescriptor} familiar creative drive. The working style is comfortable, but push into unfamiliar creative territory.`
    }
  };

  return interpretations[planet]?.[focus] || `This person ${aspectDescriptor} past patterns through their ${planet} energy in your ${focus} connection. Familiarity can be comfortable or constraining.`;
}

/**
 * Get Saturn interpretation based on relationship focus
 */
function getSaturnInterpretation(planet: string, aspect: string, focus: RelationshipFocus): string {
  const aspectDescriptor = aspect === 'conjunction' ? 'brings structure and tests to' 
    : aspect === 'opposition' ? 'demands maturity around'
    : aspect === 'square' ? 'creates karmic lessons about'
    : aspect === 'trine' ? 'provides stable support for'
    : 'offers gentle lessons for';

  const interpretations: Record<string, Record<RelationshipFocus, string>> = {
    Sun: {
      romance: `Saturn ${aspectDescriptor} identity in this romance. One partner may feel judged or restricted. The lesson is building confidence through consistent love.`,
      friendship: `Saturn ${aspectDescriptor} identity in this friendship. Respect is earned over time. The lesson is mutual recognition of each other's authentic selves.`,
      business: `Saturn ${aspectDescriptor} professional identity. Authority and leadership are tested. The lesson is building credibility through reliable performance.`,
      family: `Saturn ${aspectDescriptor} family identity patterns. Authority figures and family roles are prominent. The lesson is healthy autonomy within family structure.`,
      creative: `Saturn ${aspectDescriptor} creative identity. Artistic confidence is tested. The lesson is disciplined development of creative vision.`
    },
    Moon: {
      romance: `Saturn ${aspectDescriptor} emotional expression in this romance. Feelings may feel restricted or judged. The lesson is building emotional security through patience.`,
      friendship: `Saturn ${aspectDescriptor} emotional safety in this friendship. Trust builds slowly but deeply. The lesson is reliable emotional support.`,
      business: `Saturn ${aspectDescriptor} intuition in business. Gut feelings are tested against reality. The lesson is balancing emotion with practicality.`,
      family: `Saturn ${aspectDescriptor} family emotional patterns. Old wounds around nurturing surface. The lesson is mature emotional boundaries.`,
      creative: `Saturn ${aspectDescriptor} emotional depth in creative work. Feelings are structured into lasting art. The lesson is disciplined emotional expression.`
    },
    Mercury: {
      romance: `Saturn ${aspectDescriptor} communication in this romance. Words carry weight—perhaps too much. The lesson is thoughtful, committed communication.`,
      friendship: `Saturn ${aspectDescriptor} communication in this friendship. Conversations may feel serious. The lesson is honest dialogue that builds trust.`,
      business: `Saturn ${aspectDescriptor} professional communication. Contracts and agreements are binding. The lesson is clear, accountable business talk.`,
      family: `Saturn ${aspectDescriptor} family communication patterns. Words have lasting impact. The lesson is responsible speech within family.`,
      creative: `Saturn ${aspectDescriptor} creative communication. Ideas are refined through discipline. The lesson is polished artistic expression.`
    },
    Venus: {
      romance: `Saturn ${aspectDescriptor} love expression in this romance. Affection may feel earned rather than given freely. The lesson is love that grows through commitment.`,
      friendship: `Saturn ${aspectDescriptor} appreciation in this friendship. Value is demonstrated through consistency. The lesson is loyal, lasting friendship.`,
      business: `Saturn ${aspectDescriptor} professional values. Ethics and aesthetics are tested. The lesson is values that withstand pressure.`,
      family: `Saturn ${aspectDescriptor} family values. Traditions carry weight. The lesson is honoring what's worth keeping while releasing the rest.`,
      creative: `Saturn ${aspectDescriptor} aesthetic values. Taste is refined through discipline. The lesson is creating beauty that endures.`
    },
    Mars: {
      romance: `Saturn ${aspectDescriptor} desire and assertion in this romance. Passion may feel blocked or controlled. The lesson is patient pursuit and controlled passion.`,
      friendship: `Saturn ${aspectDescriptor} action in this friendship. Initiative may feel restricted. The lesson is aligned action toward shared goals.`,
      business: `Saturn ${aspectDescriptor} professional drive. Ambition is tested against reality. The lesson is sustained effort toward career goals.`,
      family: `Saturn ${aspectDescriptor} family assertion patterns. Conflict is controlled. The lesson is responsible action within family dynamics.`,
      creative: `Saturn ${aspectDescriptor} creative action. Artistic risks are calculated. The lesson is disciplined creative drive.`
    }
  };

  return interpretations[planet]?.[focus] || `Saturn ${aspectDescriptor} ${planet} themes in your ${focus} connection. This creates karmic homework requiring maturity and patience.`;
}

/**
 * Get Pluto interpretation based on relationship focus
 */
function getPlutoInterpretation(planet: string, aspect: string, focus: RelationshipFocus): string {
  const aspectDescriptor = aspect === 'conjunction' ? 'intensely transforms' 
    : aspect === 'opposition' ? 'creates power dynamics around'
    : aspect === 'square' ? 'forces transformation of'
    : aspect === 'trine' ? 'empowers evolution of'
    : 'subtly transforms';

  const interpretations: Record<string, Record<RelationshipFocus, string>> = {
    Sun: {
      romance: `Pluto ${aspectDescriptor} identity in this romance. One or both will be profoundly changed. Watch for power struggles; embrace conscious transformation.`,
      friendship: `Pluto ${aspectDescriptor} identity in this friendship. The connection has depth that can transform who you both are. Stay conscious of influence dynamics.`,
      business: `Pluto ${aspectDescriptor} professional identity. Business partnership involves power and transformation. Navigate leadership dynamics consciously.`,
      family: `Pluto ${aspectDescriptor} family identity patterns. Ancestral power dynamics surface for healing. The opportunity is conscious family transformation.`,
      creative: `Pluto ${aspectDescriptor} creative identity. Artistic partnership transforms both creators. Channel intensity into powerful work.`
    },
    Moon: {
      romance: `Pluto ${aspectDescriptor} emotions in this romance. Feelings run deep—sometimes too deep. Watch for emotional manipulation; embrace emotional honesty.`,
      friendship: `Pluto ${aspectDescriptor} emotions in this friendship. Deep emotional bonds that can heal or wound. Maintain healthy emotional boundaries.`,
      business: `Pluto ${aspectDescriptor} intuition in business. Trust your gut but verify. Navigate emotional undercurrents in professional settings.`,
      family: `Pluto ${aspectDescriptor} family emotional patterns. Deep family wounds surface for transformation. The opportunity is generational healing.`,
      creative: `Pluto ${aspectDescriptor} emotional expression in art. Creative work accesses profound depths. Channel intensity into transformative art.`
    },
    Mercury: {
      romance: `Pluto ${aspectDescriptor} communication in this romance. Words have power to heal or hurt deeply. Use this power for honest, transformative dialogue.`,
      friendship: `Pluto ${aspectDescriptor} communication in this friendship. Conversations can transform perspectives. Speak truth with compassion.`,
      business: `Pluto ${aspectDescriptor} professional communication. Negotiations involve power. Use influence ethically for mutual transformation.`,
      family: `Pluto ${aspectDescriptor} family communication patterns. Words carry ancestral weight. The opportunity is transforming how your family talks.`,
      creative: `Pluto ${aspectDescriptor} creative communication. Ideas have transformative power. Channel this into art that changes perspectives.`
    },
    Venus: {
      romance: `Pluto ${aspectDescriptor} love expression in this romance. Love is intense, potentially obsessive. Transform possession into profound intimacy.`,
      friendship: `Pluto ${aspectDescriptor} appreciation in this friendship. Values may clash intensely. Transform through mutual respect and growth.`,
      business: `Pluto ${aspectDescriptor} professional values. Business ethics are tested at depth. The opportunity is transforming your professional principles.`,
      family: `Pluto ${aspectDescriptor} family values. Ancestral values undergo transformation. The opportunity is evolving what your family stands for.`,
      creative: `Pluto ${aspectDescriptor} aesthetic values. Artistic taste transforms through this partnership. Create work that changes what beauty means.`
    },
    Mars: {
      romance: `Pluto ${aspectDescriptor} desire in this romance. Passion is intense, potentially explosive. Transform raw energy into profound connection.`,
      friendship: `Pluto ${aspectDescriptor} action in this friendship. Motivation runs deep. Transform competitive energy into mutual empowerment.`,
      business: `Pluto ${aspectDescriptor} professional drive. Ambition is intense. Navigate power struggles by aligning toward shared transformation.`,
      family: `Pluto ${aspectDescriptor} family action patterns. Ancestral conflicts surface for resolution. The opportunity is breaking destructive cycles.`,
      creative: `Pluto ${aspectDescriptor} creative drive. Artistic action is intense. Channel this power into work that transforms viewers.`
    }
  };

  return interpretations[planet]?.[focus] || `Pluto ${aspectDescriptor} ${planet} themes in your ${focus} connection. Expect intensity and the potential for profound transformation.`;
}

/**
 * Get Chiron interpretation based on relationship focus
 */
function getChironInterpretation(planet: string, aspect: string, focus: RelationshipFocus): string {
  const aspectDescriptor = aspect === 'conjunction' ? 'directly touches wounds around' 
    : aspect === 'opposition' ? 'mirrors wounds related to'
    : aspect === 'square' ? 'triggers healing crisis around'
    : aspect === 'trine' ? 'offers gentle healing for'
    : 'provides subtle healing opportunities for';

  const interpretations: Record<string, Record<RelationshipFocus, string>> = {
    Sun: {
      romance: `Chiron ${aspectDescriptor} identity in this romance. Old wounds about being seen and valued surface. This relationship can heal or re-wound—consciousness is key.`,
      friendship: `Chiron ${aspectDescriptor} identity in this friendship. Wounds about belonging and being accepted surface. Heal through unconditional recognition.`,
      business: `Chiron ${aspectDescriptor} professional identity. Career wounds surface. This partnership can heal professional self-doubt through mutual validation.`,
      family: `Chiron ${aspectDescriptor} family identity wounds. Old hurts about family roles surface. The opportunity is healing ancestral identity patterns.`,
      creative: `Chiron ${aspectDescriptor} creative identity. Artist wounds about worthiness surface. This partnership can heal creative blocks through mutual encouragement.`
    },
    Moon: {
      romance: `Chiron ${aspectDescriptor} emotional wounds in this romance. Old nurturing wounds surface. Conscious care can heal what was broken in past relationships.`,
      friendship: `Chiron ${aspectDescriptor} emotional wounds in this friendship. Old wounds about emotional safety surface. Heal through consistent emotional presence.`,
      business: `Chiron ${aspectDescriptor} intuitive wounds in business. Past professional betrayals may surface. Heal through trustworthy collaboration.`,
      family: `Chiron ${aspectDescriptor} family emotional wounds. Ancestral nurturing wounds surface. The opportunity is breaking patterns of emotional neglect.`,
      creative: `Chiron ${aspectDescriptor} emotional expression wounds in art. Creative blocks from emotional suppression surface. Heal by expressing feelings through art.`
    },
    Mercury: {
      romance: `Chiron ${aspectDescriptor} communication wounds in this romance. Old hurts about being heard surface. Heal through patient, attentive listening.`,
      friendship: `Chiron ${aspectDescriptor} communication wounds in this friendship. Wounds about being understood surface. Heal through careful dialogue.`,
      business: `Chiron ${aspectDescriptor} professional communication wounds. Past misunderstandings haunt. Heal through clear, honest business communication.`,
      family: `Chiron ${aspectDescriptor} family communication wounds. Ancestral patterns of not listening surface. The opportunity is new ways of family dialogue.`,
      creative: `Chiron ${aspectDescriptor} creative voice wounds. Old silencing surfaces. This partnership can heal creative expression blocks.`
    },
    Venus: {
      romance: `Chiron ${aspectDescriptor} love wounds in this romance. Old heartbreaks surface for healing. This relationship can mend what past loves broke.`,
      friendship: `Chiron ${aspectDescriptor} appreciation wounds in this friendship. Old wounds about being valued surface. Heal through genuine mutual appreciation.`,
      business: `Chiron ${aspectDescriptor} professional value wounds. Past undervaluation surfaces. This partnership can heal your sense of professional worth.`,
      family: `Chiron ${aspectDescriptor} family love wounds. Ancestral patterns of conditional love surface. The opportunity is unconditional family love.`,
      creative: `Chiron ${aspectDescriptor} aesthetic wounds. Old criticism of your taste surfaces. This partnership can heal your artistic confidence.`
    },
    Mars: {
      romance: `Chiron ${aspectDescriptor} desire wounds in this romance. Old hurts about assertion and passion surface. Heal through safe expression of desire.`,
      friendship: `Chiron ${aspectDescriptor} action wounds in this friendship. Wounds about initiative and courage surface. Heal through mutual encouragement.`,
      business: `Chiron ${aspectDescriptor} professional drive wounds. Past career defeats surface. This partnership can heal your professional confidence.`,
      family: `Chiron ${aspectDescriptor} family assertion wounds. Ancestral patterns of aggression or passivity surface. The opportunity is healthy family boundaries.`,
      creative: `Chiron ${aspectDescriptor} creative courage wounds. Old fear of artistic risk surfaces. This partnership can heal creative timidity.`
    }
  };

  return interpretations[planet]?.[focus] || `Chiron ${aspectDescriptor} ${planet} themes in your ${focus} connection. This can trigger old wounds for healing or re-wounding—approach with compassion.`;
}

/**
 * Get 12th House interpretation based on relationship focus
 */
function getTwelfthHouseInterpretation(planet: string, focus: RelationshipFocus): string {
  const interpretations: Record<string, Record<RelationshipFocus, string>> = {
    Sun: {
      romance: `Their identity feels mysteriously familiar—like you knew them before. There's a spiritual dimension to this romantic connection, but watch for projections.`,
      friendship: `Their presence triggers something deep and spiritual in you. This friendship has past-life undertones—familiar yet hard to pin down.`,
      business: `Their professional identity activates your unconscious. In business, there may be hidden agendas or unspoken understandings. Bring things into the light.`,
      family: `Their identity connects to ancestral patterns in your psyche. Family karma runs deep here—some of it hidden from conscious awareness.`,
      creative: `Their creative identity speaks to your unconscious muse. Collaboration may feel divinely inspired but also confusing at times.`
    },
    Moon: {
      romance: `Their emotions touch your deepest psyche. This romantic connection has a soul-deep quality—you may feel you've comforted each other before.`,
      friendship: `Their emotional presence activates your spiritual side. This friendship offers psychic connection but may also trigger old, unconscious patterns.`,
      business: `Their emotions influence your unconscious business instincts. There may be unspoken emotional dynamics affecting professional decisions.`,
      family: `Their emotional patterns connect to ancestral family wounds. Deep healing is possible if unconscious patterns are made conscious.`,
      creative: `Their emotional expression inspires your deepest creativity. Art made together may channel unconscious material into form.`
    },
    Venus: {
      romance: `Their love feels like coming home to something ancient. This romance has past-life love undertones—beautiful but potentially confusing.`,
      friendship: `Their appreciation activates your spiritual values. This friendship may feel divinely ordained but also mysteriously complicated.`,
      business: `Their values influence your unconscious business instincts. There may be unspoken agreements or hidden financial dynamics.`,
      family: `Their values connect to ancestral family patterns. Deep love is possible if unconscious expectations are made conscious.`,
      creative: `Their aesthetic sense inspires your unconscious creativity. Art made together channels beauty from mysterious depths.`
    },
    Mars: {
      romance: `Their desire activates your deepest passion. This romance has intense, possibly karmic sexual undertones requiring conscious navigation.`,
      friendship: `Their action style triggers your unconscious motivations. This friendship can energize or exhaust depending on awareness.`,
      business: `Their drive influences your unconscious ambitions. There may be hidden competition or unspoken power dynamics.`,
      family: `Their assertion patterns connect to ancestral conflict. Hidden anger or passive aggression may need conscious attention.`,
      creative: `Their creative drive channels your unconscious creative fire. Collaboration may produce powerful work from mysterious sources.`
    },
    Mercury: {
      romance: `Their thoughts and words feel telepathic. Communication in this romance happens on multiple levels—some spoken, some psychic.`,
      friendship: `Their communication activates your intuitive understanding. Conversations may feel like continuing discussions from other lifetimes.`,
      business: `Their thinking influences your unconscious business mind. Watch for assumptions based on unspoken understanding—verify explicitly.`,
      family: `Their communication patterns connect to ancestral family stories. Words carry generational weight requiring conscious unpacking.`,
      creative: `Their ideas inspire your unconscious creativity. Collaboration may produce work that channels collective unconscious material.`
    }
  };

  return interpretations[planet]?.[focus] || `Their ${planet} energy falls in your 12th house, activating unconscious dimensions of your ${focus} connection. Past-life echoes are possible.`;
}

/**
 * Get 8th House interpretation based on relationship focus
 */
function getEighthHouseInterpretation(planet: string, focus: RelationshipFocus): string {
  const interpretations: Record<string, Record<RelationshipFocus, string>> = {
    Sun: {
      romance: `Their identity activates your deepest intimacy needs. This romance demands authentic vulnerability and has transformative potential.`,
      friendship: `Their presence transforms your trust patterns. This friendship will deepen or expose trust issues—surface relating won't satisfy.`,
      business: `Their professional identity affects shared resources. Business involves deep financial entanglement and power dynamics requiring consciousness.`,
      family: `Their identity activates inheritance and family resource patterns. Issues of what's passed down may be prominent.`,
      creative: `Their creative identity transforms your art. Collaboration demands vulnerability and produces deeply transformative work.`
    },
    Moon: {
      romance: `Their emotions penetrate your deepest walls. This romance offers profound intimacy but demands complete emotional honesty.`,
      friendship: `Their emotional presence transforms your comfort with closeness. This friendship will heal or expose intimacy wounds.`,
      business: `Their emotions affect your financial instincts. Business intuition is powerful but requires processing through emotional intelligence.`,
      family: `Their emotional patterns activate family inheritance dynamics. Emotional legacies—good and difficult—are prominent.`,
      creative: `Their emotions transform your creative vulnerability. Art made together comes from deep, potentially painful places.`
    },
    Venus: {
      romance: `Their love activates your deepest capacity for intimacy. This romance transforms what love means to you—nothing superficial will do.`,
      friendship: `Their appreciation transforms your trust in being valued. This friendship offers deep knowing but demands authentic vulnerability.`,
      business: `Their values deeply affect shared finances. Business involves merging resources with all the trust that requires.`,
      family: `Their values activate inheritance patterns. What's valued in the family lineage becomes prominent in this connection.`,
      creative: `Their aesthetic transforms your creative depth. Collaboration accesses profound beauty through vulnerability.`
    },
    Mars: {
      romance: `Their desire activates your deepest passion. This romance has profound sexual transformation potential—intensity is unavoidable.`,
      friendship: `Their action style transforms your trust in others' motivations. This friendship exposes or heals control issues.`,
      business: `Their drive affects your financial ambition. Business involves intense shared goals around power and resources.`,
      family: `Their assertion activates family power dynamics. Inheritance of power patterns becomes conscious through this connection.`,
      creative: `Their creative drive transforms your artistic courage. Collaboration demands raw creative power with no holding back.`
    },
    Mercury: {
      romance: `Their mind penetrates your secrets. Communication in this romance goes deep—taboo topics will eventually surface.`,
      friendship: `Their thinking transforms what you share. This friendship involves secrets, research into hidden matters, or psychological depth.`,
      business: `Their communication affects confidential business matters. Negotiations involve hidden information and strategic depth.`,
      family: `Their words activate family secrets. Hidden family information may come to light through this connection.`,
      creative: `Their ideas transform your creative depth. Collaboration involves exploring taboo or hidden themes.`
    }
  };

  return interpretations[planet]?.[focus] || `Their ${planet} energy falls in your 8th house, activating transformation, shared resources, and deep intimacy in your ${focus} connection.`;
}

/**
 * Get Vertex interpretation based on relationship focus
 */
function getVertexInterpretation(planet: string, focus: RelationshipFocus): string {
  const interpretations: Record<string, Record<RelationshipFocus, string>> = {
    Sun: {
      romance: `Meeting this person feels fated—their identity arrived at a pivotal moment in your romantic life. Pay attention: this encounter has purpose.`,
      friendship: `This friendship feels destined. They appeared when you needed exactly what their personality offers. Honor this fated connection.`,
      business: `This professional connection feels fated. They arrived at a career turning point. The business relationship has larger purpose.`,
      family: `This family bond carries destiny. Their role in your life is part of your soul's plan, even if it's challenging.`,
      creative: `This creative partnership feels fated. They appeared when your art needed exactly what they bring. Collaborate with purpose.`
    },
    Moon: {
      romance: `Their emotional presence arrived at a fated moment. This romance nurtures something essential to your destiny.`,
      friendship: `Their emotional support feels destined. This friendship arrived when you needed exactly this kind of nurturing.`,
      business: `Their emotional intelligence arrived at a pivotal business moment. The intuitive connection has professional purpose.`,
      family: `Their nurturing presence feels fated in your family. They provide emotional support that's part of your life plan.`,
      creative: `Their emotional expression arrived when your art needed depth. This collaboration serves your creative destiny.`
    },
    Venus: {
      romance: `Their love feels fated—arrived at a destined moment. This romance is part of your soul's plan for learning about love.`,
      friendship: `Their appreciation feels destined. This friendship arrived when you needed to learn about value and connection.`,
      business: `Their values arrived at a pivotal moment. This business relationship teaches important lessons about professional principles.`,
      family: `Their love in your family feels fated. They teach you about family values as part of your life purpose.`,
      creative: `Their aesthetic sense arrived when your art needed exactly this. Creative collaboration serves your destiny.`
    },
    Mars: {
      romance: `Their passionate energy arrived at a fated moment. This romance activates your destiny through desire and action.`,
      friendship: `Their courage feels destined. This friendship pushes you toward fated action and initiative.`,
      business: `Their drive arrived at a career turning point. Business collaboration accelerates your professional destiny.`,
      family: `Their energy in your family feels fated. They activate family dynamics that are part of your soul's plan.`,
      creative: `Their creative courage arrived when your art needed exactly this. Collaboration propels your artistic destiny.`
    },
    Mercury: {
      romance: `Their mind arrived at a fated moment. Communication in this romance serves your destiny—listen carefully.`,
      friendship: `Their thinking feels destined to intersect with yours. Conversations in this friendship have larger purpose.`,
      business: `Their ideas arrived at a pivotal moment. Business communication with them serves your professional destiny.`,
      family: `Their voice in your family feels fated. They bring messages that are part of your life's larger story.`,
      creative: `Their ideas arrived when your art needed exactly this perspective. Creative dialogue serves your destiny.`
    }
  };

  return interpretations[planet]?.[focus] || `Their ${planet} conjuncts your Vertex, marking this as a fated encounter in your ${focus} life. Pay attention—this meeting has purpose.`;
}

// ============================================================================
// ANALYSIS FUNCTIONS (Updated to use focus-aware interpretations)
// ============================================================================

function analyzeSouthNodeConnections(
  chart1: NatalChart, 
  chart2: NatalChart, 
  indicators: KarmicIndicator[],
  focus: RelationshipFocus
) {
  const southNode1 = chart1.planets.SouthNode;
  if (!southNode1) return;
  PERSONAL_PLANETS.forEach(planetName => {
    const planet2 = chart2.planets[planetName];
    if (!planet2) return;
    const aspect = calculateAspect(southNode1, planet2);
    if (aspect) {
      indicators.push({ 
        type: 'south_node', 
        planet1: 'SouthNode', 
        planet2: planetName, 
        aspect, 
        weight: KARMIC_WEIGHTS.southNode[aspect] || 0, 
        interpretation: getSouthNodeInterpretation(planetName, aspect, focus), 
        theme: 'past_life' 
      });
    }
  });
}

function analyzeNorthNodeConnections(
  chart1: NatalChart, 
  chart2: NatalChart, 
  indicators: KarmicIndicator[],
  focus: RelationshipFocus
) {
  const northNode1 = chart1.planets.NorthNode;
  if (!northNode1) return;
  PERSONAL_PLANETS.forEach(planetName => {
    const planet2 = chart2.planets[planetName];
    if (!planet2) return;
    const aspect = calculateAspect(northNode1, planet2);
    if (aspect) {
      indicators.push({ 
        type: 'north_node', 
        planet1: 'NorthNode', 
        planet2: planetName, 
        aspect, 
        weight: KARMIC_WEIGHTS.northNode[aspect] || 0, 
        interpretation: getNorthNodeInterpretation(planetName, aspect, focus), 
        theme: 'soul_growth' 
      });
    }
  });
}

function analyzeSaturnKarma(
  chart1: NatalChart, 
  chart2: NatalChart, 
  indicators: KarmicIndicator[], 
  dangerFlags: string[],
  focus: RelationshipFocus
) {
  const saturn1 = chart1.planets.Saturn;
  if (!saturn1) return;
  PERSONAL_PLANETS.forEach(planetName => {
    const planet2 = chart2.planets[planetName];
    if (!planet2) return;
    const aspect = calculateAspect(saturn1, planet2);
    if (aspect) {
      indicators.push({ 
        type: 'saturn', 
        planet1: 'Saturn', 
        planet2: planetName, 
        aspect, 
        weight: KARMIC_WEIGHTS.saturn[aspect] || 0, 
        interpretation: getSaturnInterpretation(planetName, aspect, focus), 
        theme: 'karmic_debt' 
      });
      if ((aspect === 'conjunction' || aspect === 'square' || aspect === 'opposition') && ['Moon', 'Sun', 'Venus'].includes(planetName)) {
        const focusContext = focus === 'romance' ? 'romantic' : focus === 'business' ? 'professional' : focus;
        dangerFlags.push(`Saturn ${aspect} ${planetName}: Potential ${focusContext} restriction/control dynamics`);
      }
    }
  });
}

function analyzePlutoTransformation(
  chart1: NatalChart, 
  chart2: NatalChart, 
  indicators: KarmicIndicator[], 
  dangerFlags: string[],
  focus: RelationshipFocus
) {
  const pluto1 = chart1.planets.Pluto;
  if (!pluto1) return;
  PERSONAL_PLANETS.forEach(planetName => {
    const planet2 = chart2.planets[planetName];
    if (!planet2) return;
    const aspect = calculateAspect(pluto1, planet2);
    if (aspect) {
      indicators.push({ 
        type: 'pluto', 
        planet1: 'Pluto', 
        planet2: planetName, 
        aspect, 
        weight: KARMIC_WEIGHTS.pluto[aspect] || 0, 
        interpretation: getPlutoInterpretation(planetName, aspect, focus), 
        theme: 'transformation' 
      });
      if ((aspect === 'conjunction' || aspect === 'square' || aspect === 'opposition') && ['Venus', 'Mars', 'Moon'].includes(planetName)) {
        const focusContext = focus === 'romance' ? 'romantic' : focus === 'business' ? 'professional' : focus;
        dangerFlags.push(`Pluto ${aspect} ${planetName}: Intense ${focusContext} power dynamics`);
      }
    }
  });
}

function analyzeChironHealing(
  chart1: NatalChart, 
  chart2: NatalChart, 
  indicators: KarmicIndicator[], 
  healingOpportunities: string[],
  focus: RelationshipFocus
) {
  const chiron1 = chart1.planets.Chiron;
  if (!chiron1) return;
  PERSONAL_PLANETS.forEach(planetName => {
    const planet2 = chart2.planets[planetName];
    if (!planet2) return;
    const aspect = calculateAspect(chiron1, planet2);
    if (aspect) {
      indicators.push({ 
        type: 'chiron', 
        planet1: 'Chiron', 
        planet2: planetName, 
        aspect, 
        weight: KARMIC_WEIGHTS.chiron[aspect] || 0, 
        interpretation: getChironInterpretation(planetName, aspect, focus), 
        theme: 'healing' 
      });
      const focusContext = focus === 'romance' ? 'love' : focus === 'business' ? 'professional' : focus;
      healingOpportunities.push(`Chiron ${aspect} ${planetName}: ${focusContext} healing opportunity`);
    }
  });
}

function analyzeTwelfthHouseOverlays(
  chart1: NatalChart, 
  chart2: NatalChart, 
  indicators: KarmicIndicator[],
  focus: RelationshipFocus
) {
  const twelfthHouseCusp = chart1.houseCusps?.[12];
  const nextHouseCusp = chart1.houseCusps?.[1];
  if (!twelfthHouseCusp || !nextHouseCusp) return;
  PERSONAL_PLANETS.forEach(planetName => {
    const planet2 = chart2.planets[planetName];
    if (!planet2) return;
    if (isPlanetInHouse(planet2, twelfthHouseCusp, nextHouseCusp)) {
      indicators.push({ 
        type: 'twelfth_house', 
        planet1: planetName, 
        planet2: '12th House', 
        weight: KARMIC_WEIGHTS.twelfthHouse, 
        interpretation: getTwelfthHouseInterpretation(planetName, focus), 
        theme: 'past_life' 
      });
    }
  });
}

function analyzeEighthHouseOverlays(
  chart1: NatalChart, 
  chart2: NatalChart, 
  indicators: KarmicIndicator[], 
  dangerFlags: string[],
  focus: RelationshipFocus
) {
  const eighthHouseCusp = chart1.houseCusps?.[8];
  const ninthHouseCusp = chart1.houseCusps?.[9];
  if (!eighthHouseCusp || !ninthHouseCusp) return;
  let count = 0;
  PERSONAL_PLANETS.forEach(planetName => {
    const planet2 = chart2.planets[planetName];
    if (!planet2) return;
    if (isPlanetInHouse(planet2, eighthHouseCusp, ninthHouseCusp)) {
      count++;
      indicators.push({ 
        type: 'eighth_house', 
        planet1: planetName, 
        planet2: '8th House', 
        weight: KARMIC_WEIGHTS.eighthHouse, 
        interpretation: getEighthHouseInterpretation(planetName, focus), 
        theme: 'transformation' 
      });
    }
  });
  if (count >= 3) {
    const focusContext = focus === 'romance' ? 'romantic' : focus === 'business' ? 'financial' : focus;
    dangerFlags.push(`Multiple 8th house overlays: High ${focusContext} intensity`);
  }
}

function analyzeVertexContacts(
  chart1: NatalChart, 
  chart2: NatalChart, 
  indicators: KarmicIndicator[],
  focus: RelationshipFocus
) {
  const vertex1 = chart1.planets.Vertex;
  if (!vertex1) return;
  PERSONAL_PLANETS.forEach(planetName => {
    const planet2 = chart2.planets[planetName];
    if (!planet2) return;
    const aspect = calculateAspect(vertex1, planet2);
    if (aspect === 'conjunction') {
      indicators.push({ 
        type: 'vertex', 
        planet1: 'Vertex', 
        planet2: planetName, 
        aspect: 'conjunction', 
        weight: KARMIC_WEIGHTS.vertex, 
        interpretation: getVertexInterpretation(planetName, focus), 
        theme: 'fated' 
      });
    }
  });
}

function determineKarmicType(indicators: KarmicIndicator[], totalScore: number): KarmicAnalysis['karmicType'] {
  const pastLifeCount = indicators.filter(i => i.theme === 'past_life').length;
  const transformationCount = indicators.filter(i => i.theme === 'transformation').length;
  const fatedCount = indicators.filter(i => i.theme === 'fated').length;
  const growthCount = indicators.filter(i => i.theme === 'soul_growth').length;
  const healingCount = indicators.filter(i => i.theme === 'healing').length;
  if (totalScore >= 100 && pastLifeCount >= 4 && transformationCount >= 3) return 'twin_flame';
  if (pastLifeCount >= 5) return 'completion';
  if (transformationCount >= 4 && totalScore >= 60) return 'catalyst';
  if (growthCount >= 2 || fatedCount >= 2) return 'soul_family';
  if (totalScore >= 40 && growthCount >= 1) return 'soul_family';
  if (totalScore >= 50 && pastLifeCount >= 2) return 'karmic_lesson';
  if (healingCount >= 3) return 'soul_family';
  if (totalScore < 30 && pastLifeCount === 0 && growthCount === 0 && transformationCount === 0) return 'new_contract';
  return 'soul_family';
}

/**
 * Get focus-specific soul purpose
 */
function getSoulPurpose(karmicType: KarmicAnalysis['karmicType'], focus: RelationshipFocus): string {
  const purposes: Record<KarmicAnalysis['karmicType'], Record<RelationshipFocus, string>> = {
    twin_flame: {
      romance: 'Mirror relationship for radical romantic self-awareness and love transformation.',
      friendship: 'Mirror friendship for profound self-discovery through deep platonic connection.',
      business: 'Mirror partnership for radical professional transformation and authentic work expression.',
      family: 'Mirror family bond for ancestral healing and identity transformation.',
      creative: 'Mirror collaboration for radical artistic evolution and creative breakthrough.'
    },
    completion: {
      romance: 'Complete unfinished romantic karma from past connections.',
      friendship: 'Resolve past-life friendship dynamics and clear old platonic patterns.',
      business: 'Complete unfinished professional karma and release old work patterns.',
      family: 'Resolve ancestral family karma through conscious relationship.',
      creative: 'Complete unfinished creative karma and release old artistic blocks.'
    },
    catalyst: {
      romance: 'Rapid romantic growth through intense love experiences.',
      friendship: 'Accelerated personal growth through transformative friendship.',
      business: 'Rapid professional evolution through catalytic partnership.',
      family: 'Accelerated family healing through intensity and truth-telling.',
      creative: 'Rapid artistic evolution through high-energy collaboration.'
    },
    soul_family: {
      romance: 'Supportive soul love connection for mutual romantic flourishing.',
      friendship: 'Precious soul friendship for mutual support and authentic connection.',
      business: 'Aligned professional partnership for mutual career success.',
      family: 'Soul family reunion for healing and joyful connection.',
      creative: 'Soul-aligned creative partnership for inspired collaboration.'
    },
    karmic_lesson: {
      romance: 'Specific romantic lesson to master through this love connection.',
      friendship: 'Specific friendship lesson about connection and boundaries.',
      business: 'Specific professional lesson to master through this partnership.',
      family: 'Specific family lesson about belonging and individuation.',
      creative: 'Specific artistic lesson about expression and collaboration.'
    },
    new_contract: {
      romance: 'New romantic soul agreement—build fresh love patterns together.',
      friendship: 'New friendship soul agreement—create your own connection style.',
      business: 'New professional soul agreement—build innovative partnership.',
      family: 'New family soul agreement—create healthy new dynamics.',
      creative: 'New creative soul agreement—invent your collaborative approach.'
    }
  };

  return purposes[karmicType]?.[focus] || purposes[karmicType]?.romance || 'Soul connection for mutual growth.';
}

/**
 * Get focus-specific approach
 */
function getApproach(karmicType: KarmicAnalysis['karmicType'], focus: RelationshipFocus): string {
  const approaches: Record<KarmicAnalysis['karmicType'], Record<RelationshipFocus, string>> = {
    twin_flame: {
      romance: 'Requires both partners in active healing. Individual therapy and clear boundaries essential.',
      friendship: 'Maintain individual identity while honoring the depth. Don\'t lose yourself.',
      business: 'Professional boundaries are critical. Don\'t let intensity derail work focus.',
      family: 'Individual healing work is essential. Don\'t expect the family member to complete you.',
      creative: 'Channel intensity into the work. Maintain creative autonomy within collaboration.'
    },
    completion: {
      romance: 'Focus on resolution, forgiveness, and release. Don\'t recreate old dramas.',
      friendship: 'Let go of old patterns. Don\'t repeat past friendship dynamics.',
      business: 'Clear old agreements consciously. Build fresh professional foundations.',
      family: 'Consciously resolve ancestral patterns. Break unhealthy cycles.',
      creative: 'Release old creative blocks. Don\'t recreate past artistic struggles.'
    },
    catalyst: {
      romance: 'Embrace transformation but protect your heart. Set boundaries around intensity.',
      friendship: 'Embrace growth but maintain stability. Don\'t let change destabilize everything.',
      business: 'Embrace professional evolution but protect resources. Calculated risks only.',
      family: 'Embrace family healing but protect yourself. Not all intensity is healthy.',
      creative: 'Embrace artistic breakthrough but finish projects. Channel rather than scatter energy.'
    },
    soul_family: {
      romance: 'Nurture this precious love connection. It\'s genuine support.',
      friendship: 'Treasure this friendship. Easy connection is a gift.',
      business: 'Nurture this aligned partnership. Mutual success is possible.',
      family: 'Honor this soul family reunion. Enjoy the connection.',
      creative: 'Nurture this creative alignment. The collaboration is blessed.'
    },
    karmic_lesson: {
      romance: 'Stay conscious of the lesson. Don\'t repeat the pattern.',
      friendship: 'Learn the friendship lesson consciously. Then choose to stay or evolve.',
      business: 'Identify the professional lesson. Master it rather than avoiding it.',
      family: 'The family lesson will repeat until learned. Face it consciously.',
      creative: 'The artistic lesson is here for you. Lean into the growth edge.'
    },
    new_contract: {
      romance: 'Build healthy love patterns from scratch. No past templates.',
      friendship: 'Create your unique friendship style. Write new rules.',
      business: 'Innovate your partnership. No inherited business patterns needed.',
      family: 'Create new family dynamics. You\'re not bound by the past.',
      creative: 'Invent your collaboration. No artistic precedent required.'
    }
  };

  return approaches[karmicType]?.[focus] || approaches[karmicType]?.romance || 'Approach with consciousness and intention.';
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

export function calculateKarmicAnalysis(
  chart1: NatalChart, 
  chart2: NatalChart,
  focus: RelationshipFocus = 'romance'
): KarmicAnalysis {
  const indicators: KarmicIndicator[] = [];
  const dangerFlags: string[] = [];
  const healingOpportunities: string[] = [];

  analyzeSouthNodeConnections(chart1, chart2, indicators, focus);
  analyzeSouthNodeConnections(chart2, chart1, indicators, focus);
  analyzeNorthNodeConnections(chart1, chart2, indicators, focus);
  analyzeNorthNodeConnections(chart2, chart1, indicators, focus);
  analyzeSaturnKarma(chart1, chart2, indicators, dangerFlags, focus);
  analyzeSaturnKarma(chart2, chart1, indicators, dangerFlags, focus);
  analyzePlutoTransformation(chart1, chart2, indicators, dangerFlags, focus);
  analyzePlutoTransformation(chart2, chart1, indicators, dangerFlags, focus);
  analyzeChironHealing(chart1, chart2, indicators, healingOpportunities, focus);
  analyzeChironHealing(chart2, chart1, indicators, healingOpportunities, focus);
  analyzeTwelfthHouseOverlays(chart1, chart2, indicators, focus);
  analyzeTwelfthHouseOverlays(chart2, chart1, indicators, focus);
  analyzeEighthHouseOverlays(chart1, chart2, indicators, dangerFlags, focus);
  analyzeEighthHouseOverlays(chart2, chart1, indicators, dangerFlags, focus);
  analyzeVertexContacts(chart1, chart2, indicators, focus);

  const totalKarmicScore = indicators.reduce((sum, ind) => sum + ind.weight, 0);
  const pastLifeScore = indicators.filter(ind => ind.theme === 'past_life').reduce((sum, ind) => sum + ind.weight, 0);
  const pastLifeProbability = Math.min(100, Math.round((pastLifeScore / 80) * 100));
  const karmicType = determineKarmicType(indicators, totalKarmicScore);

  const timelines: Record<KarmicAnalysis['karmicType'], { likely_duration: string; key_lessons: string[]; completion_indicators: string[]; }> = {
    twin_flame: { likely_duration: '7-14 years', key_lessons: ['Self-love', 'Boundaries'], completion_indicators: ['Drama decreases', 'Peace emerges'] },
    completion: { likely_duration: '6 months to 3 years', key_lessons: ['Forgiveness', 'Release'], completion_indicators: ['Resolution feeling', 'Natural drift'] },
    catalyst: { likely_duration: '3 months to 2 years', key_lessons: ['Rapid transformation'], completion_indicators: ['Major life change'] },
    soul_family: { likely_duration: 'Potentially lifetime', key_lessons: ['Unconditional love'], completion_indicators: ['Continues nourishing'] },
    karmic_lesson: { likely_duration: '1-5 years', key_lessons: ['Wound healing'], completion_indicators: ['Pattern no longer triggers'] },
    new_contract: { likely_duration: 'Variable', key_lessons: ['Present-moment relating'], completion_indicators: ['Based on choice'] }
  };

  let approach = dangerFlags.length >= 3 ? '⚠️ HIGH ALERT: Multiple intensity indicators. ' : dangerFlags.length > 0 ? '⚠️ CAUTION: ' : '';
  approach += getApproach(karmicType, focus);

  return {
    totalKarmicScore,
    pastLifeProbability,
    karmicType,
    indicators,
    dangerFlags,
    healingOpportunities,
    soulPurpose: getSoulPurpose(karmicType, focus),
    recommendedApproach: approach,
    timeline: timelines[karmicType],
    focus
  };
}

export default calculateKarmicAnalysis;

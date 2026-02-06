/**
 * TRANSIT PLANET IN SIGN INTERPRETATIONS
 * 
 * Complete behavioral interpretations for outer planet transits through signs.
 * Each explains: What this feels like, How it manifests, What to do.
 * 
 * This replaces vague phrases like "expresses through X's energy" with
 * concrete, actionable descriptions.
 */

export interface TransitSignInterpretation {
  whatItFeelsLike: string;
  howItManifests: string;
  whatToDo: string;
}

/**
 * Get interpretation for a transiting planet in a sign
 */
export const getTransitSignInterpretation = (planet: string, sign: string): TransitSignInterpretation => {
  const key = `${planet}-${sign}`;
  return TRANSIT_SIGN_INTERPRETATIONS[key] || getFallbackInterpretation(planet, sign);
};

/**
 * Get a formatted paragraph interpretation
 */
export const getTransitSignParagraph = (planet: string, sign: string): string => {
  const interp = getTransitSignInterpretation(planet, sign);
  return `**What it feels like:** ${interp.whatItFeelsLike}\n\n**How it manifests:** ${interp.howItManifests}\n\n**What to do:** ${interp.whatToDo}`;
};

/**
 * Get a short one-liner for display
 */
export const getTransitSignShort = (planet: string, sign: string): string => {
  const interp = getTransitSignInterpretation(planet, sign);
  return interp.whatItFeelsLike;
};

// Fallback that still provides meaningful content
const getFallbackInterpretation = (planet: string, sign: string): TransitSignInterpretation => {
  const planetThemes: Record<string, { focus: string; action: string }> = {
    'Jupiter': { focus: 'growth and expansion', action: 'Take opportunities in this area' },
    'Saturn': { focus: 'discipline and structure', action: 'Build foundations patiently' },
    'Uranus': { focus: 'sudden change and awakening', action: 'Embrace the unexpected' },
    'Neptune': { focus: 'dreams and spirituality', action: 'Trust intuition but verify reality' },
    'Pluto': { focus: 'deep transformation', action: 'Let go of what no longer serves' },
    'Chiron': { focus: 'healing through vulnerability', action: 'Face wounds to transform them' },
    'Mars': { focus: 'action and assertion', action: 'Channel energy constructively' },
    'Venus': { focus: 'love and values', action: 'Pursue what you truly appreciate' },
    'Mercury': { focus: 'thinking and communication', action: 'Express ideas clearly' },
    'Sun': { focus: 'identity and vitality', action: 'Shine in this area of life' },
    'Moon': { focus: 'emotions and needs', action: 'Nurture yourself and others' },
  };
  
  const signQualities: Record<string, { style: string; arena: string }> = {
    'Aries': { style: 'with bold initiative and pioneering spirit', arena: 'new beginnings and independence' },
    'Taurus': { style: 'with patient determination and sensual groundedness', arena: 'material security and lasting value' },
    'Gemini': { style: 'through curiosity, communication, and mental agility', arena: 'learning, connecting, and sharing ideas' },
    'Cancer': { style: 'through emotional depth and protective care', arena: 'home, family, and emotional security' },
    'Leo': { style: 'with creative confidence and generous heart', arena: 'self-expression, joy, and recognition' },
    'Virgo': { style: 'through careful analysis and practical service', arena: 'health, work, and improvement' },
    'Libra': { style: 'through balance, diplomacy, and partnership', arena: 'relationships, fairness, and beauty' },
    'Scorpio': { style: 'with intense focus and transformative power', arena: 'depth, intimacy, and regeneration' },
    'Sagittarius': { style: 'through adventure, philosophy, and expansive vision', arena: 'meaning, travel, and higher learning' },
    'Capricorn': { style: 'with disciplined ambition and strategic patience', arena: 'career, achievement, and mastery' },
    'Aquarius': { style: 'through innovation, rebellion, and humanitarian vision', arena: 'community, technology, and social change' },
    'Pisces': { style: 'with compassionate sensitivity and spiritual openness', arena: 'dreams, healing, and transcendence' },
  };
  
  const p = planetThemes[planet] || { focus: 'this planetary energy', action: 'Work consciously with this energy' };
  const s = signQualities[sign] || { style: 'in this sign\'s unique way', arena: 'this area of life' };
  
  return {
    whatItFeelsLike: `Transit ${planet} activates ${p.focus} ${s.style}. The collective is experiencing themes around ${s.arena}.`,
    howItManifests: `You may notice increased activity, change, or focus in areas related to ${s.arena}. This is a time when ${p.focus} becomes prominent.`,
    whatToDo: `${p.action}. Pay attention to opportunities and challenges in ${s.arena}.`
  };
};

/**
 * Complete database of transit planet-in-sign interpretations
 */
export const TRANSIT_SIGN_INTERPRETATIONS: Record<string, TransitSignInterpretation> = {
  // ============================================================================
  // JUPITER TRANSITS
  // ============================================================================
  
  'Jupiter-Aries': {
    whatItFeelsLike: "The collective is hungry for new beginnings and bold action. There's a 'just do it' energy in the air—people feel braver, more impatient, and ready to start fresh.",
    howItManifests: "New businesses launching, people taking risks they wouldn't before, entrepreneurship rising, athletic and competitive pursuits thriving. Also: impatience, overconfidence, and 'me first' attitudes.",
    whatToDo: "Launch what you've been putting off. Take the first step. But check your enthusiasm against reality—don't overcommit or burn bridges."
  },
  
  'Jupiter-Taurus': {
    whatItFeelsLike: "Growth through patience, pleasure, and building real value. The collective slows down from Aries urgency to ask: 'But is this sustainable? Does it feel GOOD?'",
    howItManifests: "Focus on finances, food, nature, luxury, and comfort. Economic growth (or excess). Investments in agriculture, real estate, and physical well-being. Also: stubbornness, overindulgence, materialism.",
    whatToDo: "Build wealth slowly and sustainably. Invest in quality over quantity. Enjoy sensory pleasures without excess. Ground big dreams in practical steps."
  },
  
  'Jupiter-Gemini': {
    whatItFeelsLike: "Mental expansion and information overload. The collective wants to LEARN, TALK, and CONNECT. Curiosity peaks. Everyone has something to say.",
    howItManifests: "Media expansion, social networking booms, education accessible, short courses popular. Also: scattered thinking, superficiality, too many options, restlessness.",
    whatToDo: "Learn something new. Write, teach, or share ideas. But go deep on something—don't just skim everything. Focus your curiosity."
  },
  
  'Jupiter-Cancer': {
    whatItFeelsLike: "Growth through nurturing, family, and emotional connection. The collective values home, security, and care. Patriotism and nostalgia rise.",
    howItManifests: "Focus on family expansion, real estate, home improvement, caregiving industries. Also: clannishness, over-protection, emotional excess, nationalism.",
    whatToDo: "Invest in your home and family. Nurture yourself and others generously. Connect with your roots. But avoid using security as an excuse for fear."
  },
  
  'Jupiter-Leo': {
    whatItFeelsLike: "The collective wants to SHINE. Creativity, self-expression, and drama peak. People feel more confident, generous, and attention-seeking.",
    howItManifests: "Entertainment industry thrives, celebrity culture amplifies, children's issues get focus, creativity booms. Also: ego inflation, showing off, extravagance.",
    whatToDo: "Create boldly. Share your gifts without apology. Be generous with praise and resources. But keep your ego in check—confidence without humility becomes arrogance."
  },
  
  'Jupiter-Virgo': {
    whatItFeelsLike: "Growth through improvement, service, and attention to detail. The collective focuses on health, efficiency, and getting things RIGHT.",
    howItManifests: "Healthcare expansion, wellness trends, organization methods trending, practical solutions valued. Also: perfectionism paralysis, nitpicking, health anxiety.",
    whatToDo: "Improve your systems, health routines, and work methods. Serve others practically. But don't let perfect be the enemy of good—'good enough' is sometimes wisdom."
  },
  
  'Jupiter-Libra': {
    whatItFeelsLike: "Growth through partnership, diplomacy, and beauty. The collective seeks balance, fairness, and harmonious relationships.",
    howItManifests: "Marriage rates may rise, diplomacy efforts, art and design thrive, justice issues front and center. Also: people-pleasing, indecision, superficial harmony.",
    whatToDo: "Invest in relationships. Seek win-win solutions. Appreciate beauty and culture. But don't sacrifice truth for peace—real harmony includes honest conflict."
  },
  
  'Jupiter-Scorpio': {
    whatItFeelsLike: "Growth through depth, intensity, and transformation. The collective is drawn to secrets, psychology, and hidden truths. 'Surface level' doesn't satisfy.",
    howItManifests: "Therapy, research, and investigation thrive. Sexual and financial matters in focus. Inheritances, joint resources. Also: obsession, power struggles, paranoia.",
    whatToDo: "Go deep. Face what you've been avoiding. Transform through honest confrontation with shadows. But don't mistake intensity for truth—not everything hidden is gold."
  },
  
  'Jupiter-Sagittarius': {
    whatItFeelsLike: "Jupiter's home! Maximum expansion, optimism, and meaning-seeking. The collective wants ADVENTURE, TRUTH, and BIG PICTURE understanding.",
    howItManifests: "Travel booms, higher education valued, philosophy and religion prominent, international connections. Also: excess, preachiness, over-promising, dogmatism.",
    whatToDo: "Expand your horizons—literally or philosophically. Travel, study, publish, teach. But stay humble—your truth isn't THE truth."
  },
  
  'Jupiter-Capricorn': {
    whatItFeelsLike: "Growth through discipline, achievement, and building lasting structures. Jupiter is in fall here—expansion feels constrained but becomes more REAL.",
    howItManifests: "Focus on career, institutions, government, long-term planning. Practical ambition valued. Also: excessive ambition, materialism, coldness, slow growth.",
    whatToDo: "Build your career and reputation. Set long-term goals. Invest in mastery. But don't sacrifice joy for achievement—success without fulfillment is hollow."
  },
  
  'Jupiter-Aquarius': {
    whatItFeelsLike: "Growth through innovation, community, and humanitarian vision. The collective is future-focused, tech-oriented, and socially conscious.",
    howItManifests: "Technology advances, social movements, community organizing, unconventional solutions. Also: detachment, contrarianism, utopianism without grounding.",
    whatToDo: "Connect with groups aligned with your values. Embrace innovation. Think about collective good, not just personal benefit. But stay connected to real humans, not just ideals."
  },
  
  'Jupiter-Pisces': {
    whatItFeelsLike: "Jupiter's traditional home! Growth through compassion, spirituality, and imagination. The collective is more sensitive, artistic, and seeking transcendence.",
    howItManifests: "Spirituality rises, arts flourish, compassion movements, escape industries (entertainment, substances) expand. Also: escapism, victimhood, confusion, boundary issues.",
    whatToDo: "Develop your spiritual life. Create art. Practice compassion. But stay grounded—transcendence that ignores reality becomes delusion."
  },

  // ============================================================================
  // SATURN TRANSITS
  // ============================================================================
  
  'Saturn-Aries': {
    whatItFeelsLike: "The collective learns discipline around identity, independence, and initiative. 'Who am I REALLY?' becomes a serious question. Impulsive action meets hard reality.",
    howItManifests: "Leaders tested, authority figures challenged, identity crises, forced to act with more discipline. Also: frustration, blocked action, identity pressure.",
    whatToDo: "Build a solid sense of self through testing. Take responsibility for your independence. Learn patience with beginnings. Your authority comes through proving yourself."
  },
  
  'Saturn-Taurus': {
    whatItFeelsLike: "The collective learns discipline around money, resources, and values. 'What do I REALLY value?' Financial and material reality checks.",
    howItManifests: "Economic restructuring, values tested, possessions requiring work, security through effort. Also: financial restriction, scarcity fears, stubborn resistance.",
    whatToDo: "Build lasting financial structures. Earn your security through patience. Simplify what you don't truly value. Your worth isn't your bank account—but your bank account needs discipline."
  },
  
  'Saturn-Gemini': {
    whatItFeelsLike: "The collective learns discipline around thinking and communication. 'Do my words have WEIGHT?' Mental structures get tested.",
    howItManifests: "Serious study valued, communication becoming more careful, mental discipline required. Also: communication blocks, mental anxiety, learning challenges.",
    whatToDo: "Study something deeply—no more skimming. Say less but mean it more. Develop your thinking through rigor. Your ideas gain credibility through demonstrated expertise."
  },
  
  'Saturn-Cancer': {
    whatItFeelsLike: "Saturn in fall—emotional discipline is HARD. The collective learns about emotional boundaries, family responsibilities, and the weight of belonging.",
    howItManifests: "Family obligations, home responsibilities, emotional maturation through hardship. Also: emotional coldness, family burdens, security fears, depression.",
    whatToDo: "Build emotional resilience through challenge. Take responsibility for your emotional patterns. Create real security, not just the feeling of it. Parent yourself well."
  },
  
  'Saturn-Leo': {
    whatItFeelsLike: "The collective learns discipline around self-expression and creativity. 'Is my shine AUTHENTIC?' Ego tested, creativity earning respect through work.",
    howItManifests: "Creative efforts requiring serious work, recognition through merit, ego humbling, leadership responsibilities. Also: creative blocks, recognition denied, pride wounded.",
    whatToDo: "Earn your spotlight through real skill. Lead with responsibility, not just charisma. Make your creativity serve something beyond ego. Your light shines brighter for being tempered."
  },
  
  'Saturn-Virgo': {
    whatItFeelsLike: "The collective learns discipline around health, work, and service. 'Am I actually USEFUL?' Perfectionism meets reality.",
    howItManifests: "Health requiring serious attention, work demanding excellence, systems needing improvement. Also: health anxieties, work stress, perfectionism paralysis.",
    whatToDo: "Build better health habits for the long term. Develop real competence in your work. Serve effectively, not perfectly. Your value comes through consistent improvement."
  },
  
  'Saturn-Libra': {
    whatItFeelsLike: "Saturn is exalted here—relationships get REAL. The collective learns about commitment, fairness, and the work of partnership.",
    howItManifests: "Serious relationships, commitment tested, justice demanded, partnerships becoming formal. Also: relationship difficulties, loneliness, forced decisions.",
    whatToDo: "Commit to what's real or release what isn't. Build lasting partnerships through work. Stand for fairness even when it's hard. Your relationships mature through honesty."
  },
  
  'Saturn-Scorpio': {
    whatItFeelsLike: "The collective learns discipline around power, depth, and shared resources. 'Am I willing to truly TRANSFORM?' Deep emotional work required.",
    howItManifests: "Financial obligations, psychological depth work, power dynamics confronted, death/taxes/debts demanding attention. Also: control issues, financial pressure, emotional intensity.",
    whatToDo: "Face your shadows with discipline. Build power through integrity, not manipulation. Deal with shared resources responsibly. Your transformation is earned through confronting what you avoid."
  },
  
  'Saturn-Sagittarius': {
    whatItFeelsLike: "The collective learns discipline around beliefs, truth, and meaning. 'Is what I believe ACTUALLY TRUE?' Faith tested by reality.",
    howItManifests: "Belief systems challenged, education becoming serious, travel having purpose, philosophy meeting practicality. Also: faith crises, dogmatism tested, freedom restricted.",
    whatToDo: "Examine your beliefs critically. Study with discipline, not just enthusiasm. Make your philosophy practical. Your wisdom is earned through tested truth, not comfortable beliefs."
  },
  
  'Saturn-Capricorn': {
    whatItFeelsLike: "Saturn's home—maximum authority and reality. The collective confronts THE SYSTEM. Career, institutions, and structures are tested for integrity.",
    howItManifests: "Institutional reckoning, career demands, authority figures tested, ambition requiring discipline. Also: systemic failures, career pressure, authority problems.",
    whatToDo: "Build your career on solid foundations. Take authority responsibly. Work with the system or rebuild it—but no shortcuts. Your mastery is proven through time and testing."
  },
  
  'Saturn-Aquarius': {
    whatItFeelsLike: "Saturn's traditional home—collective responsibility gets real. 'What do I owe the community?' Social structures tested and rebuilt.",
    howItManifests: "Social systems restructured, technology regulated, groups organized seriously, collective responsibility. Also: social isolation, group conflicts, freedom vs. obligation.",
    whatToDo: "Take responsibility for your role in community. Build structures that serve the collective. Balance individual freedom with social obligation. Your innovation matters when it actually works."
  },
  
  'Saturn-Pisces': {
    whatItFeelsLike: "The collective learns discipline around spirituality, compassion, and boundaries. 'Is my transcendence grounded?' Dreams meet reality.",
    howItManifests: "Spiritual practices becoming serious, art requiring discipline, boundaries learned through pain, collective suffering addressed. Also: depression, confusion, escapism confronted.",
    whatToDo: "Ground your spirituality in practice, not just feelings. Build boundaries with compassion. Make your dreams real through disciplined work. Your sensitivity becomes wisdom through experience."
  },

  // ============================================================================
  // URANUS TRANSITS (7-year periods)
  // ============================================================================
  
  'Uranus-Aries': {
    whatItFeelsLike: "Revolution in identity and action. The collective awakens to 'I can do what I want.' Sudden independence, breakthrough through boldness.",
    howItManifests: "New identities emerge, pioneers and disruptors rise, impulsive revolutions, technology for individuals. (2010-2019) Also: recklessness, anger, fragmentation.",
    whatToDo: "Embrace your authentic self even if it disrupts. Take risks for freedom. But channel rebellion constructively—chaos without purpose is just chaos."
  },
  
  'Uranus-Taurus': {
    whatItFeelsLike: "Revolution in values, money, and the material world. What we VALUE is being shaken up. The earth itself—and our relationship to it—changes.",
    howItManifests: "Financial disruption (crypto, banking changes), environmental awakening, food systems transforming, body autonomy issues. (2018-2026) Also: economic instability, values confusion.",
    whatToDo: "Liberate your relationship with money and stuff. Embrace sustainable innovations. Let go of possessions that don't serve authentic values. Your security is in adaptability, not accumulation."
  },
  
  'Uranus-Gemini': {
    whatItFeelsLike: "Revolution in communication and thinking. How we LEARN, TALK, and CONNECT transforms radically. Mind-expanding technologies emerge.",
    howItManifests: "Communication technology breakthroughs, education disrupted, media transformed, information revolution. Also: mental overstimulation, misinformation, attention fragmentation.",
    whatToDo: "Embrace new ways of learning and connecting. Let your thinking break free of old patterns. But cultivate discernment—not every new idea is a good idea."
  },
  
  'Uranus-Cancer': {
    whatItFeelsLike: "Revolution in home, family, and belonging. What 'HOME' and 'FAMILY' mean gets redefined. Emotional breakthroughs through disruption.",
    howItManifests: "Family structures changing, home life disrupted, ancestral patterns breaking, nationalism vs. globalism. Also: rootlessness, family chaos, emotional instability.",
    whatToDo: "Free yourself from outdated family patterns. Create home that reflects your authentic self. Let emotional breakthroughs happen. Your security is in emotional authenticity, not familiar patterns."
  },
  
  'Uranus-Leo': {
    whatItFeelsLike: "Revolution in self-expression and creativity. Who we ARE and how we SHINE breaks free. Individual genius emerges unexpectedly.",
    howItManifests: "Creative breakthroughs, unexpected fame, children/youth culture changing, entertainment revolution. Also: ego disruption, recognition lost, drama and chaos.",
    whatToDo: "Express your unique genius without apology. Let creativity surprise you. Free yourself from needing approval for your light. Your shine is authentic when it can't be controlled."
  },
  
  'Uranus-Virgo': {
    whatItFeelsLike: "Revolution in work, health, and service. HOW we work and care for bodies transforms. Technology meets healing.",
    howItManifests: "Healthcare technology, work automation, service industries disrupted, environmental health. Also: health anxiety, job instability, perfectionism crisis.",
    whatToDo: "Embrace new approaches to health and work. Let go of perfectionism that limits innovation. Serve in ways that are authentic, not just expected. Your usefulness is in adaptability."
  },
  
  'Uranus-Libra': {
    whatItFeelsLike: "Revolution in relationships and justice. HOW we partner and what 'FAIRNESS' means transforms. Social contracts rewritten.",
    howItManifests: "Relationship norms changing, marriage/partnership redefined, justice system challenged, art revolution. Also: relationship instability, fairness battles, commitment fears.",
    whatToDo: "Free your relationships from outdated expectations. Partner in authentic ways. Fight for real fairness, not comfortable harmony. Your connections thrive through honest freedom."
  },
  
  'Uranus-Scorpio': {
    whatItFeelsLike: "Revolution in power, sexuality, and transformation. What was HIDDEN comes to light. Deep structures of control are exposed and challenged.",
    howItManifests: "Power structures exposed, sexual revolution, death/dying transformed, financial systems disrupted. Also: power struggles, obsession, destructive impulses.",
    whatToDo: "Let go of controlling what can't be controlled. Embrace radical transformation. Face shadows that demand acknowledgment. Your power is in conscious surrender to change."
  },
  
  'Uranus-Sagittarius': {
    whatItFeelsLike: "Revolution in beliefs, education, and meaning. WHAT WE BELIEVE is liberated—or fragmented. Truth becomes personal and diverse.",
    howItManifests: "Religious and philosophical upheaval, education transformed, global travel/connection, ideology disrupted. Also: extremism, meaning crisis, scattered beliefs.",
    whatToDo: "Free yourself from inherited beliefs. Seek truth through direct experience. Embrace the adventure of not-knowing. Your meaning is found through authentic exploration."
  },
  
  'Uranus-Capricorn': {
    whatItFeelsLike: "Revolution in structures, institutions, and authority. The SYSTEMS we've built are challenged and transformed. Old authorities fall.",
    howItManifests: "Government/corporate disruption, career paths changed, authority redefined, ambition taking new forms. Also: institutional chaos, career instability, authority crisis.",
    whatToDo: "Build new structures that serve real purpose. Lead in innovative ways. Don't cling to positions that need to change. Your authority is authentic when it serves evolution."
  },
  
  'Uranus-Aquarius': {
    whatItFeelsLike: "Uranus is home—maximum revolution. The COLLECTIVE itself transforms. Technology, community, and humanity's future are all in flux.",
    howItManifests: "Technological revolution, social movements, collective awakening, future being invented now. Also: alienation, extremism, dehumanization through tech.",
    whatToDo: "Embrace your role in collective evolution. Innovate for the future. Connect with like-minded revolutionaries. Your uniqueness serves humanity best when it's in community."
  },
  
  'Uranus-Pisces': {
    whatItFeelsLike: "Revolution in spirituality, imagination, and transcendence. How we DREAM and ESCAPE transforms. Collective unconscious is stirred.",
    howItManifests: "Spiritual awakening, artistic revolution, escape methods changing, compassion movements. Also: confusion, escapism, boundary dissolution, collective overwhelm.",
    whatToDo: "Let your spirituality be authentically weird. Create art that surprises even you. Transcend in ways that are YOUR own. Your mysticism is valid when it frees rather than escapes."
  },

  // ============================================================================
  // NEPTUNE TRANSITS (14-year periods)
  // ============================================================================
  
  'Neptune-Aries': {
    whatItFeelsLike: "Spiritualizing the warrior. Collective dreams turn to action and identity. 'Who am I?' becomes a mystical question.",
    howItManifests: "Spiritual pioneers emerging, identity becoming fluid, action guided by intuition. Also: identity confusion, impulsive escapism, angry idealism.",
    whatToDo: "Let your actions be guided by higher purpose. Pioneer spiritual territory. But stay grounded—not every impulse is divine guidance."
  },
  
  'Neptune-Taurus': {
    whatItFeelsLike: "Spiritualizing the material. Value becomes meaning. What we own, eat, and enjoy takes on spiritual dimension.",
    howItManifests: "Material values dissolving, earth spirituality rising, beauty as transcendence. Also: financial illusion, material escapism, values confusion.",
    whatToDo: "Find the sacred in the sensual. Let money serve meaning. Connect with nature spiritually. But don't confuse abundance thinking with actual abundance."
  },
  
  'Neptune-Gemini': {
    whatItFeelsLike: "Spiritualizing communication. Words become poetry. Information becomes overwhelming and confusing—or inspired and channeled.",
    howItManifests: "Communication becoming more artistic, mental boundaries dissolving, media manipulation, channeled writing. Also: information overload, lies spreading, mental confusion.",
    whatToDo: "Let your words carry spiritual weight. Listen for messages from beyond. But verify—not everything intuitive is true. Discernment in communication is essential."
  },
  
  'Neptune-Cancer': {
    whatItFeelsLike: "Spiritualizing home and family. Mother becomes Mary. Family bonds become soul bonds—or dissolve into illusion.",
    howItManifests: "Family idealization, home as sanctuary, ancestral healing, collective nostalgia. Also: family illusion, boundary issues, escape into domesticity.",
    whatToDo: "Create home as spiritual practice. Heal ancestral patterns through compassion. But see family clearly—idealization isn't love."
  },
  
  'Neptune-Leo': {
    whatItFeelsLike: "Spiritualizing creativity and self. The artist becomes the mystic. Self-expression takes on transcendent quality—or becomes grandiose illusion.",
    howItManifests: "Inspired art, celebrity as spirituality, children as divine, creative flow states. Also: ego inflation, fame addiction, creative delusion.",
    whatToDo: "Create as channeling, not just expressing. Let your light be in service to something beyond ego. But stay humble—not every creation is genius."
  },
  
  'Neptune-Virgo': {
    whatItFeelsLike: "Spiritualizing service and health. Healing becomes sacred work. The body becomes a spiritual instrument—or a source of confusion and anxiety.",
    howItManifests: "Holistic health rising, work as spiritual service, environmental compassion. Also: health illusions, work confusion, perfectionism as escape.",
    whatToDo: "See your work as offering. Heal with compassion, not just technique. But stay practical—not every intuition about health is accurate."
  },
  
  'Neptune-Libra': {
    whatItFeelsLike: "Spiritualizing relationship. Love becomes divine union. Partnership takes on transcendent meaning—or becomes romantic illusion.",
    howItManifests: "Soulmate seeking, artistic partnership, idealized love, peace movements. Also: romantic illusion, codependency, conflict avoidance.",
    whatToDo: "Love as spiritual practice. See the divine in your partner. But love real people, not fantasies—the human IS the divine."
  },
  
  'Neptune-Scorpio': {
    whatItFeelsLike: "Spiritualizing power and transformation. Death becomes transcendence. Sexuality becomes tantra. Deep psychology becomes shamanism.",
    howItManifests: "Psychological/spiritual merging, transformative spirituality, occult fascination. Also: power confusion, sexual illusion, obsessive spirituality.",
    whatToDo: "Transform through surrender, not control. Explore depth with spiritual intention. But don't confuse intensity with truth."
  },
  
  'Neptune-Sagittarius': {
    whatItFeelsLike: "Spiritualizing meaning itself. Faith becomes vision. Religion dissolves into direct experience—or fragments into confusion.",
    howItManifests: "Spiritual seeking, travel as pilgrimage, belief diversity, prophetic vision. Also: spiritual bypassing, guru worship, belief confusion.",
    whatToDo: "Seek direct experience of the divine. Travel as spiritual journey. But stay grounded in ethics—transcendence without integrity is escape."
  },
  
  'Neptune-Capricorn': {
    whatItFeelsLike: "Spiritualizing structure and achievement. Ambition serves higher purpose—or institutions reveal their emptiness.",
    howItManifests: "Business with purpose, leadership as service, institutional illusions exposed. Also: career confusion, authority dissolution, spiritual materialism.",
    whatToDo: "Build structures that serve spirit. Lead with vision beyond profit. But keep your idealism grounded—real change happens through real work."
  },
  
  'Neptune-Aquarius': {
    whatItFeelsLike: "Spiritualizing the collective. Technology becomes tool for transcendence—or source of mass illusion. Humanity's oneness becomes experiential.",
    howItManifests: "Digital spirituality, collective consciousness rising, utopian visions, humanitarian compassion. Also: collective escapism, tech addiction, ideological confusion.",
    whatToDo: "Use technology for genuine connection. Serve collective healing. But stay human—virtual isn't the same as real."
  },
  
  'Neptune-Pisces': {
    whatItFeelsLike: "Neptune is home—maximum spirituality, compassion, and transcendence. The collective is awash in feeling, imagination, and yearning for unity. (2012-2026)",
    howItManifests: "Spiritual awakening widespread, arts flourishing, compassion movements, collective healing. Also: confusion, escapism, boundary dissolution, addiction epidemics.",
    whatToDo: "Embrace your spiritual nature fully. Create from inspiration. Practice compassion. But build boundaries—infinite love still needs a vessel."
  },

  // ============================================================================
  // PLUTO TRANSITS (12-30 year periods)
  // ============================================================================
  
  'Pluto-Aries': {
    whatItFeelsLike: "Power through will and identity. The collective transforms HOW IT ACTS. Pioneering power—for creation or destruction.",
    howItManifests: "Revolutionary action, power through courage, identity transformation at collective level. Also: violence, will-to-power excess, destructive impulsivity.",
    whatToDo: "Transform through courageous action. Pioneer new ways of being. But channel power constructively—raw will needs direction."
  },
  
  'Pluto-Taurus': {
    whatItFeelsLike: "Power through resources and values. The collective transforms WHAT IT VALUES. Money, food, and earth become arenas of deep change.",
    howItManifests: "Economic transformation, values revolution, earth changes, resource wars. Also: materialism exposed, greed confronted, scarcity fears.",
    whatToDo: "Transform your relationship with resources. Build sustainable power. But release attachment—what you cling to controls you."
  },
  
  'Pluto-Gemini': {
    whatItFeelsLike: "Power through information and communication. The collective transforms HOW IT THINKS. Knowledge becomes power—for liberation or control.",
    howItManifests: "Information revolution, communication power shifts, mind control exposed, learning transformed. Also: propaganda, mental manipulation, information warfare.",
    whatToDo: "Transform through knowledge and communication. Speak truth to power. But verify—not all information is true, and power corrupts truth."
  },
  
  'Pluto-Cancer': {
    whatItFeelsLike: "Power through home, family, and belonging. The collective transforms WHAT HOME MEANS. Deep emotional transformation—personal and national.",
    howItManifests: "Family structure transformation, homeland issues, emotional depth work, ancestral healing. Also: nationalism, family power dynamics, emotional manipulation.",
    whatToDo: "Transform family patterns. Heal ancestral wounds. But don't weaponize belonging—tribalism is power corrupted."
  },
  
  'Pluto-Leo': {
    whatItFeelsLike: "Power through creativity and self-expression. The collective transforms WHO IT IS. Personal power becomes collective transformation.",
    howItManifests: "Creative power wielded, celebrity culture transformed, children as change agents, ego death/rebirth. Also: megalomania, power through spectacle, ego destruction.",
    whatToDo: "Transform through authentic self-expression. Create from power, not for approval. But keep ego in check—your light isn't just for you."
  },
  
  'Pluto-Virgo': {
    whatItFeelsLike: "Power through service and improvement. The collective transforms HOW IT WORKS and HEALS. Systems are overhauled—often painfully.",
    howItManifests: "Healthcare transformation, work revolution, environmental crisis, service as power. Also: criticism weaponized, health crises, perfectionism as control.",
    whatToDo: "Transform through dedicated service. Improve what's broken at the root. But don't use 'helping' as control—service isn't superiority."
  },
  
  'Pluto-Libra': {
    whatItFeelsLike: "Power through relationship and justice. The collective transforms HOW IT RELATES. Partnership, fairness, and beauty become arenas of deep change.",
    howItManifests: "Relationship patterns transformed, justice system overhauled, power dynamics in partnership exposed. Also: codependency, manipulation through charm, justice corrupted.",
    whatToDo: "Transform your relationship patterns. Fight for real justice. But examine your own power dynamics—balance requires honest self-awareness."
  },
  
  'Pluto-Scorpio': {
    whatItFeelsLike: "Pluto is home—maximum power and transformation. The collective confronts SEX, DEATH, MONEY, and HIDDEN POWER directly. Nothing stays buried. (1983-1995 generation)",
    howItManifests: "Sexual revolution, death/dying transformed, hidden power exposed, psychological intensity, the 'Scorpio Pluto' generation carrying deep transformation.",
    whatToDo: "Face your shadows completely. Transform through honest confrontation with power and death. But don't become what you're fighting—power corrupts."
  },
  
  'Pluto-Sagittarius': {
    whatItFeelsLike: "Power through belief and meaning. The collective transforms WHAT IT BELIEVES. Religion, philosophy, and truth itself are up for transformation. (1995-2008 generation)",
    howItManifests: "Religious extremism and transformation, globalization, publishing/media power shifts, belief wars. Also: dogmatism, truth manipulation, zealotry.",
    whatToDo: "Transform your beliefs through deep questioning. Seek truth that transforms, not just comforts. But stay humble—your truth isn't THE truth."
  },
  
  'Pluto-Capricorn': {
    whatItFeelsLike: "Power through structure and achievement. The collective transforms ITS INSTITUTIONS. Government, business, and authority itself undergo death and rebirth. (2008-2024)",
    howItManifests: "Institutional collapse and rebuilding, corporate power confronted, authority questioned, ambition transformed. Also: authoritarianism, systemic corruption exposed, power struggles.",
    whatToDo: "Transform structures from the inside or build new ones. Take responsibility for your power. But don't become the new tyrant—power serves best when it's shared."
  },
  
  'Pluto-Aquarius': {
    whatItFeelsLike: "Power through collective and technology. The collective transforms ITSELF. Humanity, technology, and social organization undergo fundamental change. (2024-2044)",
    howItManifests: "AI transformation, social power shifts, collective awakening or control, technology as power. Also: techno-authoritarianism, dehumanization, collective shadow work.",
    whatToDo: "Transform through collective action. Use technology for liberation. But stay human—power over others isn't the same as power WITH others."
  },
  
  'Pluto-Pisces': {
    whatItFeelsLike: "Power through spirituality and dissolution. The collective transforms its RELATIONSHIP WITH THE INFINITE. Transcendence becomes power—or escape.",
    howItManifests: "Spiritual power structures, compassion movements, collective unconscious transformation. Also: spiritual manipulation, escapism as control, confusion.",
    whatToDo: "Transform through surrender to something greater. Let go of what must die. But stay grounded—spiritual power still needs ethical direction."
  },

  // ============================================================================
  // CHIRON TRANSITS
  // ============================================================================
  
  'Chiron-Aries': {
    whatItFeelsLike: "The collective wound is around identity and courage. 'Am I allowed to BE myself?' The healing comes through brave self-assertion. (2018-2027)",
    howItManifests: "Identity wounds surfacing, courage to be authentic, healing through action, wounded warriors teaching. Also: identity crisis, aggression from wounding, fear of assertion.",
    whatToDo: "Heal by taking courageous action anyway. Your wounds around identity become your teaching. But don't weaponize victimhood—healing requires moving forward."
  },
  
  'Chiron-Taurus': {
    whatItFeelsLike: "The collective wound is around value and resources. 'Am I worthy? Is there enough?' The healing comes through self-worth and sustainable abundance.",
    howItManifests: "Worth wounds surfacing, healing relationship with money/body, valuing the wounded. Also: scarcity wounds, body shame, materialism as compensation.",
    whatToDo: "Heal your sense of inherent worth. Your wounds around value become your teaching about real abundance. But don't mistake accumulation for healing."
  },
  
  'Chiron-Gemini': {
    whatItFeelsLike: "The collective wound is around communication and thinking. 'Is my voice valid? Do I understand?' The healing comes through speaking and learning.",
    howItManifests: "Communication wounds surfacing, healing through teaching, wounded messengers. Also: learning disabilities acknowledged, voice suppression, mental health awareness.",
    whatToDo: "Heal by speaking your truth anyway. Your communication wounds become your gift for understanding. But don't over-explain to compensate—sometimes silence heals."
  },
  
  'Chiron-Cancer': {
    whatItFeelsLike: "The collective wound is around home and belonging. 'Am I safe? Do I belong?' The healing comes through creating real emotional security.",
    howItManifests: "Family wounds surfacing, healing through nurturing, wounded caregivers teaching. Also: abandonment issues, home instability, mothering wounds.",
    whatToDo: "Heal by creating the safety you needed. Your family wounds become your gift for nurturing. But don't over-protect—sometimes growth requires discomfort."
  },
  
  'Chiron-Leo': {
    whatItFeelsLike: "The collective wound is around self-expression and recognition. 'Am I special? Am I seen?' The healing comes through creating anyway.",
    howItManifests: "Creative wounds surfacing, healing through expression, wounded artists teaching. Also: recognition hunger, spotlight wounds, creative blocks.",
    whatToDo: "Heal by creating and expressing anyway. Your visibility wounds become your gift for authentic expression. But don't perform for healing—create for truth."
  },
  
  'Chiron-Virgo': {
    whatItFeelsLike: "The collective wound is around service and perfectionism. 'Am I useful? Am I good enough?' The healing comes through imperfect service.",
    howItManifests: "Perfectionism wounds surfacing, healing through service, wounded healers teaching. Also: health anxiety, work wounds, criticism sensitivity.",
    whatToDo: "Heal by serving anyway, imperfectly. Your perfectionism wounds become your gift for compassionate improvement. But don't help to feel worthy—you already are."
  },
  
  'Chiron-Libra': {
    whatItFeelsLike: "The collective wound is around relationship and fairness. 'Am I lovable? Is life fair?' The healing comes through authentic relating.",
    howItManifests: "Relationship wounds surfacing, healing through partnership, wounded mediators. Also: codependency, rejection wounds, justice rage.",
    whatToDo: "Heal by relating authentically anyway. Your relationship wounds become your gift for genuine connection. But don't partner to heal—heal to partner."
  },
  
  'Chiron-Scorpio': {
    whatItFeelsLike: "The collective wound is around power and intimacy. 'Can I trust? Can I be vulnerable?' The healing comes through deep, scary honesty.",
    howItManifests: "Trust wounds surfacing, healing through transformation, wounded shamans. Also: betrayal sensitivity, control issues, intimacy fears.",
    whatToDo: "Heal by going deep anyway. Your trust wounds become your gift for profound transformation. But don't trauma-bond—shared wounds aren't the same as connection."
  },
  
  'Chiron-Sagittarius': {
    whatItFeelsLike: "The collective wound is around meaning and truth. 'Is there meaning? Can I believe?' The healing comes through seeking anyway.",
    howItManifests: "Faith wounds surfacing, healing through teaching truth, wounded philosophers. Also: meaning crisis, belief betrayal, spiritual cynicism.",
    whatToDo: "Heal by seeking meaning anyway. Your faith wounds become your gift for authentic truth. But don't preach from wound—teach from healing."
  },
  
  'Chiron-Capricorn': {
    whatItFeelsLike: "The collective wound is around achievement and authority. 'Have I accomplished enough? Am I legitimate?' The healing comes through earned mastery.",
    howItManifests: "Achievement wounds surfacing, healing through responsibility, wounded authorities. Also: imposter syndrome, father wounds, success anxiety.",
    whatToDo: "Heal by building anyway. Your authority wounds become your gift for genuine leadership. But don't achieve to prove—prove through authentic achievement."
  },
  
  'Chiron-Aquarius': {
    whatItFeelsLike: "The collective wound is around belonging and difference. 'Am I too weird? Do I fit?' The healing comes through authentic community.",
    howItManifests: "Belonging wounds surfacing, healing through groups, wounded visionaries. Also: outsider pain, social anxiety, idealism wounded.",
    whatToDo: "Heal by being yourself in community anyway. Your belonging wounds become your gift for inclusive vision. But don't rebel to belong—belong to evolve."
  },
  
  'Chiron-Pisces': {
    whatItFeelsLike: "The collective wound is around spirituality and boundaries. 'Am I too sensitive? Is there meaning beyond this?' The healing comes through grounded transcendence.",
    howItManifests: "Spiritual wounds surfacing, healing through compassion, wounded mystics. Also: boundary issues, escapism, victim/savior dynamics.",
    whatToDo: "Heal by feeling everything anyway, with boundaries. Your sensitivity wounds become your gift for compassion. But don't dissolve to heal—transcend with form."
  },
};

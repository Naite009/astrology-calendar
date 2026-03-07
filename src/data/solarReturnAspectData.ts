// ─── SR Sun Aspect Interpretations ──────────────────────────────────
// Sources: "A Complete Guide on Solar Returns", Ray Merriman "Solar Return Report"

export interface SRSunAspectInterp {
  planet: string;
  conjunction: string;
  opposition: string;
  square: string;
  trine: string;
  sextile: string;
}

export const SR_SUN_ASPECTS: Record<string, SRSunAspectInterp> = {
  Moon: {
    planet: 'Moon',
    conjunction: 'Sun-Moon conjunction in the SR is the most powerful indicator of a NEW BEGINNING. Whatever house this falls in, a completely fresh chapter is starting. Conscious will and emotional needs are unified — you know what you want and you feel it in your bones. This is a "big year" marker. When both lights occupy the same house, Mary Fortier Shea notes this is the clearest sign that a new cycle is beginning in that life area.',
    opposition: 'Sun-Moon opposition brings the themes of the Full Moon to your entire year — culmination, maximum awareness, and relationship tension. What you want (Sun) and what you need (Moon) are in direct conflict. Partnerships are highlighted. Others mirror back to you what you cannot see in yourself.',
    square: 'Sun-Moon square creates internal friction between your conscious direction and emotional needs. This is a year of crisis in action — you cannot stay passive. Decisions must be made, and compromise between head and heart is required. According to the Complete Guide, the upcoming year will be a "big" one when Sun forms a hard angle with Moon.',
    trine: 'Sun-Moon trine brings ease and flow between your identity and emotions. What you want is what you need — there is no internal conflict. Life feels harmonious and intentions manifest more easily. Relationships are supportive. Creativity flows naturally.',
    sextile: 'Sun-Moon sextile provides gentle opportunities to align your outer direction with inner needs. Emotional intelligence is heightened. You can read situations and people with unusual clarity. Cooperative relationships are productive.',
  },
  Mercury: {
    planet: 'Mercury',
    conjunction: 'Sun-Mercury conjunction sharpens mental focus and communication. Your identity is expressed through ideas, words, and intellectual pursuits. This is an excellent year for writing, studying, teaching, or any work that requires mental clarity. Your mind and your will are aligned.',
    opposition: 'Sun-Mercury opposition creates tension between your direction and your thinking process. Communication misunderstandings are possible. Others may challenge your ideas. This aspect is rare (Mercury stays close to the Sun) — if present, it indicates a year of significant mental re-evaluation.',
    square: 'Sun-Mercury square brings mental tension and communication challenges. Your ideas may meet resistance, or you struggle to articulate what you truly mean. Nervous energy is high. The challenge is to slow down and think before speaking.',
    trine: 'Sun-Mercury trine supports intellectual pursuits and smooth communication. Ideas flow easily and others are receptive to your thinking. Writing, teaching, and networking are favored. Mental clarity enhances decision-making.',
    sextile: 'Sun-Mercury sextile provides opportunities through communication and learning. New contacts, short trips, and intellectual exchanges open doors. Your mind is alert and adaptive.',
  },
  Venus: {
    planet: 'Venus',
    conjunction: 'Sun-Venus conjunction brings love, beauty, and social pleasure to your core identity. You attract others naturally this year — charm, grace, and aesthetic sensibility are heightened. Romance, creative expression, and financial improvement are all favored. This is one of the most pleasant SR aspects.',
    opposition: 'Sun-Venus opposition creates tension in relationships and finances. What you want for yourself may conflict with what a partner wants. Overspending or overindulgence is possible. Beauty and pleasure are present but demand negotiation with others.',
    square: 'Sun-Venus square brings challenges in love, money, or self-worth. Relationships require effort. Financial decisions may involve difficult trade-offs. Your values are tested — what matters most becomes clear through friction.',
    trine: 'Sun-Venus trine is one of the most beneficial SR aspects. Love, beauty, financial ease, and social harmony flow naturally. Creative projects succeed. Relationships are supportive and pleasurable. You feel attractive and attracted.',
    sextile: 'Sun-Venus sextile provides gentle opportunities in love, social life, and finances. New relationships or creative ventures are possible with modest effort. Aesthetic improvements to your life or appearance are favored.',
  },
  Mars: {
    planet: 'Mars',
    conjunction: 'Sun-Mars conjunction creates forceful, assertive energy — you are driven to ACT on your identity. This is a year of courage, competition, initiative, and potentially conflict. Physical energy is high. You cannot stay passive. Your life force demands direct expression. Watch for impulsiveness.',
    opposition: 'Sun-Mars opposition brings conflict with others — partners, competitors, or authority figures. Your will is challenged directly. This aspect demands that you stand up for yourself while learning when to compromise. Legal battles or open confrontations are possible.',
    square: 'Sun-Mars square creates internal frustration and external friction. Anger needs management. Impulsive decisions can lead to regret. However, this aspect also provides tremendous drive and motivation — channel it into physical activity and purposeful action.',
    trine: 'Sun-Mars trine gives confident, productive energy. You know what you want and you have the drive to pursue it effectively. Physical vitality is strong. Leadership feels natural. Competitive situations go in your favor.',
    sextile: 'Sun-Mars sextile provides opportunities through initiative and action. Moderate assertiveness is well-received. Physical activity and competitive pursuits are rewarding without being overwhelming.',
  },
  Jupiter: {
    planet: 'Jupiter',
    conjunction: 'Sun-Jupiter conjunction is one of the most fortunate SR aspects. Growth, opportunity, abundance, and optimism characterize the year. Travel, education, and philosophical expansion are favored. Financial improvement is possible. The risk is overconfidence or overextension.',
    opposition: 'Sun-Jupiter opposition brings opportunities that require negotiation with others. Promises may be made but not kept. Over-optimism about partnerships or financial arrangements needs tempering with realism. Legal matters may arise.',
    square: 'Sun-Jupiter square creates growth through excess and its consequences. You may take on too much, spend too much, or promise more than you can deliver. The lesson is moderation — Jupiter expands, but the square ensures you learn WHERE to expand wisely.',
    trine: 'Sun-Jupiter trine brings easy, flowing growth and good fortune. Opportunities come naturally. Travel, education, and philosophical pursuits enrich the year. Generosity flows both ways. This is a year when things tend to work out.',
    sextile: 'Sun-Jupiter sextile provides modest opportunities for growth through small, conscious choices. Good judgment is enhanced. Helpful people appear at the right time.',
  },
  Saturn: {
    planet: 'Saturn',
    conjunction: 'Sun-Saturn conjunction brings a year of serious purpose, responsibility, and hard work. This is a defining year — you are building something that will last. Authority figures are prominent. The weight is real, but so is the accomplishment. Maturity is not optional; it is required.',
    opposition: 'Sun-Saturn opposition creates tension with authority, obligations, or external limitations. Others (bosses, institutions, the government) may restrict your freedom. Relationships with older or more powerful people are challenging but can be deeply instructive.',
    square: 'Sun-Saturn square is one of the most challenging SR aspects. Obstacles, delays, and frustrations test your resolve. Self-doubt may surface. This is a year of character building through difficulty. What you achieve under this aspect, you truly earn.',
    trine: 'Sun-Saturn trine brings disciplined, productive energy. Structure supports your goals. Authority figures are helpful. Long-term planning pays off. You feel capable of sustained effort and are rewarded for it.',
    sextile: 'Sun-Saturn sextile provides opportunities through discipline, organization, and working with established systems. Modest but lasting achievements are possible through steady effort.',
  },
  Uranus: {
    planet: 'Uranus',
    conjunction: 'Sun-Uranus conjunction electrifies the year with sudden changes, breakthroughs, and a powerful need for freedom. Your identity is undergoing a revolution. The unexpected is the norm. Resist the urge to blow everything up — channel Uranian energy into creative innovation.',
    opposition: 'Sun-Uranus opposition brings sudden disruptions from others or external circumstances. Relationships may end abruptly. Freedom vs. commitment is a central tension. Others may behave unpredictably. Flexibility and adaptability are essential.',
    square: 'Sun-Uranus square creates tension between your need for security and your need for freedom. Restlessness, impulsive decisions, and disruptions force change. The question is: will you initiate the change consciously, or will it be imposed?',
    trine: 'Sun-Uranus trine brings exciting, positive changes and creative insights. Innovation is well-received. You feel free to be yourself without alienating others. Technology, unconventional approaches, and original thinking are assets.',
    sextile: 'Sun-Uranus sextile provides gentle opportunities for innovation and positive change. Small shifts in perspective open unexpected doors. You are more open to new ideas and experiences.',
  },
  Neptune: {
    planet: 'Neptune',
    conjunction: 'Sun-Neptune conjunction dissolves boundaries and heightens sensitivity. Spiritual, artistic, and compassionate impulses are strong — but so is the potential for confusion, self-deception, or escapism. The year demands discernment: what is inspiration vs. illusion?',
    opposition: 'Sun-Neptune opposition creates vulnerability to deception or disillusionment through others. Relationships may involve idealization or codependency. Boundaries need reinforcement. Creative and spiritual sensitivity is heightened but must be grounded.',
    square: 'Sun-Neptune square brings confusion, escapism, or a crisis of faith. Reality and fantasy collide. Substances, unhealthy relationships, or avoidance patterns may need addressing. The gift is: what lies beneath the confusion is a deeper truth seeking expression.',
    trine: 'Sun-Neptune trine enhances creativity, intuition, and spiritual connection without the confusion of harder aspects. Artistic projects are inspired. Compassion flows naturally. Dreams and meditation are productive.',
    sextile: 'Sun-Neptune sextile provides gentle opportunities for spiritual growth and creative inspiration. Intuition is reliable. Helping others comes naturally and is personally fulfilling.',
  },
  Pluto: {
    planet: 'Pluto',
    conjunction: 'Sun-Pluto conjunction brings transformation to your very identity. This is not a gentle year — you are being remade at a fundamental level. Power dynamics, psychological depth, and letting go of who you used to be are central. Death and rebirth of the ego.',
    opposition: 'Sun-Pluto opposition brings power struggles with others. Someone may attempt to control or manipulate you — or you may be projecting your own power issues onto others. Psychological awareness is essential. This aspect demands that you own your power.',
    square: 'Sun-Pluto square creates intense internal pressure and external power conflicts. Obsession, control, and compulsive behavior are risks. The gift is psychological insight — what you excavate under this aspect heals at the deepest level.',
    trine: 'Sun-Pluto trine brings empowered transformation. Change feels natural and productive. Your personal power is enhanced without the drama of harder aspects. Psychological insight is acute. Leadership and influence increase.',
    sextile: 'Sun-Pluto sextile provides opportunities for personal growth through psychological insight. Small but meaningful transformations occur. You can influence situations subtly and effectively.',
  },
};

// ─── SR Planet Aspects to Horizon (ASC/DSC) ─────────────────────────
// Source: Ray Merriman — "Solar Return Report"

export interface SRHorizonAspect {
  planet: string;
  harmonious: string;
  discordant: string;
}

export const SR_HORIZON_ASPECTS: Record<string, SRHorizonAspect> = {
  Sun: {
    planet: 'Sun',
    harmonious: 'This year favors recognition and personal growth. You tend to feel favorably identified with your work and "calling in life." Confidence is strong, and you attract positive attention. Clarity of purpose enhances your sense of self.',
    discordant: 'Your ego may be challenged by others, or you may feel your identity is not being properly recognized. Conflicts with authority or self-doubt may surface. Adjust expectations and focus on building from within.',
  },
  Moon: {
    planet: 'Moon',
    harmonious: 'You notice positive changes within your home and close relationships. Emotional fulfillment is likely. You attract affection and your power of attraction is quite strong. This favors romance and dealings with women.',
    discordant: 'This year may present many special emotional challenges. You tend to be very sensitive, and perhaps easily hurt or offended. There could be unique problems involving a woman. Relocation may not go smoothly. A sense of loneliness or restlessness may be pervasive.',
  },
  Mercury: {
    planet: 'Mercury',
    harmonious: 'This year is favorable for communications of all kinds: writings, speeches, business transactions, negotiations. The mind is highly alert and active, ripe for new learning. You tend to exhibit excellent organizational skills.',
    discordant: 'Misunderstandings and communication breakdowns are possible. Nervous energy is high. Be careful with contracts and written agreements — read the fine print. Travel plans may face disruptions.',
  },
  Venus: {
    planet: 'Venus',
    harmonious: 'Agreements and relationships of a very positive nature may unfold. Others find you most agreeable and pleasant. Your personal appearance is very attractive — even you like the way you look! Financially, you tend to do very well this year.',
    discordant: 'Relationship disappointments or financial setbacks are possible. You may feel undervalued or unattractive. Social situations may feel awkward. Adjust expectations in love and money.',
  },
  Mars: {
    planet: 'Mars',
    harmonious: 'High energy, initiative, and the ability to take decisive action. Physical vitality is strong. Competitive situations favor you. Leadership is natural and well-received.',
    discordant: 'Accidents, arguments, and impulsive behavior are risks. Others may perceive you as aggressive or abrasive. Anger management is essential. Channel physical energy into constructive outlets.',
  },
  Jupiter: {
    planet: 'Jupiter',
    harmonious: 'Luck, expansion, and opportunity greet you this year. Travel, education, and cultural experiences enrich your life. Generosity flows both ways. Legal matters resolve favorably.',
    discordant: 'Overconfidence, excess, and poor judgment are risks. You may take on too much or promise more than you can deliver. Weight gain is possible. Moderation in all things is advised.',
  },
  Saturn: {
    planet: 'Saturn',
    harmonious: 'Gaining respect and prestige through solid work. Your reputation as an authority or expert strengthens. A sense of fulfillment from understanding your "calling in life." Years of solid work now give credibility.',
    discordant: 'Restrictions, delays, and obstacles from external circumstances or authority figures. You may feel overburdened by responsibilities. Health issues may demand attention. Patience and perseverance are essential.',
  },
  Uranus: {
    planet: 'Uranus',
    harmonious: 'Exciting, positive changes unfold. Unusual opportunities and unexpected breakthroughs. You feel free to express your individuality. Technology and innovation are assets.',
    discordant: 'Sudden disruptions, separations, or unexpected events disrupt your plans. Nervousness and instability may affect health and relationships. Flexibility is essential — rigid plans will be overturned.',
  },
  Neptune: {
    planet: 'Neptune',
    harmonious: 'Spiritual sensitivity, artistic inspiration, and compassion are heightened. Intuition is reliable. Creative work and healing are favored. You attract kindred spirits.',
    discordant: 'This is a year of great confusion and possibly deception. You are likely very vulnerable. A bond of trust may be broken. Be careful of romantic involvement with others who are disloyal. Your reputation may come up for questioning.',
  },
  Pluto: {
    planet: 'Pluto',
    harmonious: 'You might feel and express tremendous power and influence over others. You have the ability to positively affect the lives of others. This year favors research, intense study, and getting rid of things that are no longer relevant.',
    discordant: 'Power struggles, manipulation, and psychological intensity dominate interactions. Someone may try to control you, or you may project your own power issues. Compulsive behavior needs management. Seek therapy if needed.',
  },
};

// ─── SR Planet Aspects to Meridian (MC/IC) ──────────────────────────
// Source: Ray Merriman — "Solar Return Report"

export const SR_MERIDIAN_ASPECTS: Record<string, SRHorizonAspect> = {
  Sun: {
    planet: 'Sun',
    harmonious: 'This year favors recognition in your profession. Financial gains may accompany professional success. Great growth and success in regard to your work and home directly enhance your confidence. Clarity of purpose and sense of "calling."',
    discordant: 'Career setbacks or conflicts with authority figures may arise. Your professional direction feels unclear or blocked. Home and family matters create tension that affects your public life.',
  },
  Moon: {
    planet: 'Moon',
    harmonious: 'Positive changes in home and family life. Domestic happiness and emotional security increase. Improvements in your living situation. A favorable year for real estate and family relationships.',
    discordant: 'Serious conflicts between family and work duties. Demands on both ends cause ultra-sensitivity. Relocation may not go smoothly. A feeling of great unrest in your personal and professional life.',
  },
  Mercury: {
    planet: 'Mercury',
    harmonious: 'Great success in business, especially sales and negotiations. Effective and timely communication is the key to success. Excellent year to learn or teach new skills. If you have writing ability, a major project may be completed.',
    discordant: 'Professional communication breakdowns. Misunderstandings with superiors or business partners. Important messages may be lost or misinterpreted. Double-check all professional correspondence.',
  },
  Venus: {
    planet: 'Venus',
    harmonious: 'Social charm aids career advancement. Professional relationships are pleasant and productive. You may receive recognition for artistic or diplomatic abilities. Family celebrations are possible — perhaps a birth, marriage, or happy reunion.',
    discordant: 'Career advancement is blocked by interpersonal issues or financial problems at home. Professional relationships feel strained. Aesthetic or artistic work faces criticism.',
  },
  Mars: {
    planet: 'Mars',
    harmonious: 'Energetic pursuit of career goals. Physical stamina supports professional ambitions. Competitive drive is an asset. You take initiative that is well-received by authority figures.',
    discordant: 'Career conflicts, arguments with superiors, or aggressive competition. Domestic disputes affect professional performance. Burnout from overwork is a risk.',
  },
  Jupiter: {
    planet: 'Jupiter',
    harmonious: 'Great success and growth in work and home setting. Opportunities abound. Along with this comes the possibility of a large bonus or increase in income. Cause to celebrate in your family — perhaps a birth, marriage, or joyful event. One of the most favorable possible setups.',
    discordant: 'Professional overextension or unrealistic career expectations. Domestic expenses may spiral. Promising too much at work while neglecting home, or vice versa.',
  },
  Saturn: {
    planet: 'Saturn',
    harmonious: 'Gaining respect and prestige in your work or community. You get what you deserve according to the amount and quality of effort. Many years of solid work now give credibility. A sense of fulfillment in understanding your "calling in life."',
    discordant: 'Heavy professional responsibilities with little reward. Career stagnation or demotion. Family obligations feel burdensome. A difficult year for both career and home — endurance is required.',
  },
  Uranus: {
    planet: 'Uranus',
    harmonious: 'Exciting career changes and unexpected professional opportunities. Innovation is rewarded. Technology plays a positive role in your work. Home life benefits from creative solutions.',
    discordant: 'Sudden career disruptions — layoffs, restructuring, or radical changes in professional direction. Home instability through moves or family upheaval. Flexibility is essential.',
  },
  Neptune: {
    planet: 'Neptune',
    harmonious: 'Creative or spiritual dimensions enhance your career. Intuition guides professional decisions productively. Artistic pursuits are recognized. Home life has a quality of sanctuary and peace.',
    discordant: 'Career confusion or deception. You may be the victim of professional slander or misrepresentation. Goals feel unclear. Home life may involve secrets, escapism, or boundary issues.',
  },
  Pluto: {
    planet: 'Pluto',
    harmonious: 'You may work with a large and powerful group. Given a position of great influence, you have the power to change things for the better. Research or investigation efforts may turn up valuable discoveries. A year of professional transformation.',
    discordant: 'Power struggles in the workplace. Professional or domestic crises demand confrontation. Someone in a position of authority may abuse their power. Career transformation through crisis.',
  },
};

// ─── Critical Degrees Guidance ──────────────────────────────────────
// Source: "A Complete Guide on Solar Returns"

export const CRITICAL_DEGREES_TEXT = {
  degree29: 'A planet or angle at 29° of any sign in the SR chart is at a critical degree — this is the final degree, representing culmination, urgency, and endings. Significant events surrounding the energy of this planet/point are likely. There is a sense of "last chance" or "now or never" energy. The house it rules in the SR chart is also activated by this urgency.',
  degree0: 'A planet or angle at 0° of any sign in the SR chart is at an initiatory degree — this is the very first degree, representing new beginnings, raw potential, and fresh starts. The energy of this planet/point is in its most pure and unrefined state. Whatever this planet represents is beginning a new chapter.',
  general: 'Critical degrees (29° and 0°) are among the most significant indicators in Solar Return interpretation. When found in the SR chart, there can be significant events surrounding the energy of the planet/point itself, and/or the house it rules in the chart.',
};

/**
 * Expert-level planet-in-SR-house interpretations
 * Sources: Ciro Discepolo (Jupiter), Mary Fortier Shea, Brian Clark, Ray Merriman
 * These are DEEP multi-paragraph readings, not the short 1-liner overlays.
 */

export interface SRPlanetHouseDeep {
  title: string;
  overview: string;
  practical: string;
  caution: string;
  source?: string;
}

// ─── JUPITER IN SR HOUSES (Ciro Discepolo + MFS) ────────────────────

export const srJupiterInHouseDeep: Record<number, SRPlanetHouseDeep> = {
  1: {
    title: 'Jupiter as Guardian Angel',
    overview: 'Jupiter in the 1st house of your Solar Return is a powerful antidepressant and personal protector. This placement brings recovery from depression, physical or mental exhaustion, or any prior period of difficulty. You emerge with renewed optimism and confidence. Others perceive you as warmer, more open, and more approachable.',
    practical: 'Your guard drops — you trust people more easily, which opens doors socially and professionally. Physical well-being improves. Weight gain is possible as you relax and enjoy life more. This is one of the best positions for recovering from any kind of breakdown — financial, sentimental, or health-related. If close to the Ascendant, Jupiter acts as a genuine cosmic antidepressant.',
    caution: 'Greater naivety means vulnerability to being swindled. You may over-trust, overindulge, or overestimate. Watch for physical proliferation (weight, growths). Despite these risks, Jupiter here is fundamentally protective of your health and general well-being.',
    source: 'Ciro Discepolo, Mary Fortier Shea',
  },
  2: {
    title: 'The Bistable Oscillator — Money in Motion',
    overview: 'Jupiter in the 2nd house operates as a "bistable oscillator" — it dramatically increases the circulation of money, but the direction (incoming or outgoing) depends on the rest of the chart and your current life situation. This is NOT automatically "getting rich." It means money MOVES — in large amounts.',
    practical: 'If you are in a stable financial period with favorable transits, Jupiter here brings income, raises, and financial luck. If you are already in financial difficulty, or if the SR shows stressed houses (12th, 6th, 8th), it can mean hemorrhaging money — major expenses, losses, or poor financial decisions. Examine the full SR context. This position also brings increased public visibility — your image or presence may be featured in media or public events. You may invest in appearance improvements (new look, dental work, wardrobe).',
    caution: 'Do NOT assume this is automatically positive for finances. The "bistable" effect means it amplifies whatever financial trajectory you are already on. If unlucky with money since birth, expect continued difficulty. Read the surrounding chart carefully.',
    source: 'Ciro Discepolo',
  },
  3: {
    title: 'The Year of Movement and Communication',
    overview: 'Jupiter in the 3rd house of SR is one of the most dynamic communication and travel placements. It indicates the purchase of a vehicle, much physical movement, and expanded communication channels. Learning, teaching, writing, and all forms of intellectual exchange are supercharged.',
    practical: 'You may purchase a new car, phone, computer, or communication device. Good news arrives by any medium. University students pass exams brilliantly. You win contests and tenders. Courses, seminars, workshops, and language study are all favored. Writing success is possible. Siblings, cousins, and in-laws bring positive developments. Pulmonary health may improve. This is the year many people learn to use new technology or master a new skill.',
    caution: 'The mental stimulation is exciting but can scatter your focus. Choose the most important learning opportunity rather than trying to do everything.',
    source: 'Ciro Discepolo',
  },
  4: {
    title: 'The Year of Real Estate and Home Blessing',
    overview: 'Jupiter in the 4th house almost inevitably means advantages from real estate and domestic improvements. This is the best placement for purchasing property, renovating, moving to a better home, or finally settling down after a period of instability.',
    practical: 'Property transactions are favored. Renovations succeed. If you have been wanting to buy a home, seize this opportunity. Your relationship with parents (especially father) may improve. You may inherit property. A bank clerk gets transferred to a better branch; an employee gets a more comfortable office. Jupiter here also brings inner serenity — you recover peace at home after turbulence. It can indicate purchasing memory-expanding devices (hard drives, storage) or increasing your "inner storage" through therapy.',
    caution: 'Ironically, this placement can also mean enjoying time at home because you are recuperating from illness. The domestic pleasure is real, but check why you are home-bound.',
    source: 'Ciro Discepolo',
  },
  5: {
    title: 'The Year of Love, Fun and Fertility',
    overview: 'Jupiter in the 5th house is spectacular for romance, creativity, and pleasure. New love affairs, rekindled passions, and increased fertility are all hallmarks. Fun is not optional — it is what the universe is prescribing.',
    practical: 'A new romantic encounter or the return of an old flame is likely — provided realistic conditions for romance exist. Even if the exact person you want does not appear, Jupiter finds ways to bring joy. Sports, theatre, cinema, dining out, concerts, and creative hobbies all increase. Fertility dramatically increases (both male and female) — unplanned pregnancies are possible. Good news about children. Teachers receive satisfaction from students. You may overcome a previous inability (learning to swim, overcoming a phobia).',
    caution: 'Jupiter here does not guarantee romantic success if external conditions are unfavorable (the furs-in-the-tropics principle). Also, the fertility increase is real — plan accordingly.',
    source: 'Ciro Discepolo',
  },
  6: {
    title: 'The Year of Health Recovery and Work Grace',
    overview: 'Jupiter in the 6th house of SR is one of the most healing placements available. It amends bad health situations, supports convalescence, offers unexpected resources for wellbeing, and creates better working conditions.',
    practical: 'Therapies begun under this SR have superior chances of success. Excellent for surgery (especially cosmetic). Work relationships improve. You may hire excellent new employees or collaborators. Old workplace grudges resolve. Jupiter here favors all forms of health maintenance: fitness, diet, spa treatments, physiotherapy, alternative medicine. Satisfaction from pets. If combined with Venus in the 6th, 1st, or 12th, this is one of the most protective positions for health in any Solar Return.',
    caution: 'While fundamentally positive for health, do not become complacent. Jupiter expands, and in the 6th this can occasionally mean expanding health issues if they are already present. Use the protective energy proactively.',
    source: 'Ciro Discepolo',
  },
  7: {
    title: 'The Bistable Oscillator — Partnerships Amplified',
    overview: 'Jupiter in the 7th house operates with the same "bistable" effect as in the 2nd and 8th. If your love life or legal matters have been troubled, Jupiter provides miraculous help and resolution. If everything has been wonderful, it may paradoxically bring quarrels, separations, or legal troubles.',
    practical: 'If single and genuinely seeking, a significant relationship is likely. If experiencing a relationship crisis, reconciliation is possible. Legal matters resolve favorably — lawsuits find unexpected support. However, if no problems exist, Jupiter may CREATE drama: huge quarrels, divorce, or legal attacks. Your partner may stand out for some reason — professional growth, recovered health, or increased social status. An excellent time to formalize partnerships.',
    caution: 'The bistable effect is consistent across thousands of cases. Do NOT assume Jupiter in the 7th is always benign. It amplifies whatever dynamic already exists. If your relationship is solid, it grows; if it is fragile, it may break spectacularly.',
    source: 'Ciro Discepolo',
  },
  8: {
    title: 'The Bistable Oscillator — Transformation and Flow',
    overview: 'Jupiter in the 8th house, like the 2nd, means a definite increased flow of money — but the direction depends entirely on context. Inheritance, loans, insurance payouts, donations, gambling wins, or severance pay may arrive. Equally possible: theft, fraud, bad speculation, or unrecoverable loans.',
    practical: 'Jupiter here can help you obtain financing or loans, sometimes for large amounts — but repayment may be difficult later, making the initial "help" deceptive. Positive sexual developments are consistent and not subject to the bistable effect: sexual life improves, intimacy deepens, and new love affairs often begin. Psychic powers may amplify. Underground research of any kind (psychological, academic, or literal) is favored.',
    caution: 'Financial vigilance is essential. Do not over-leverage. The money flows are real but their direction requires careful contextual reading. Benefits from death or endings are possible but emotionally complex.',
    source: 'Ciro Discepolo',
  },
  9: {
    title: 'The Year of Magnificent Journeys',
    overview: 'Jupiter in the 9th house almost always forecasts long, wonderful travels and benefits from foreign connections. Everything "far away" and "abroad" favors you — foreign people, foreign places, distant opportunities.',
    practical: 'Travel to distant places brings concrete benefits: work, health, love, or fame. Foreign doctors, foreign universities, foreign collaborations — all favored. Advanced studies thrive, especially in unconventional fields: philosophy, astrology, yoga, programming languages. You may get your first flying experience if you have been afraid of planes. Moving to another city or reaching agreements with distant institutions is well-supported. Learning a foreign language or mastering complex software comes more easily.',
    caution: 'The expansiveness can lead to over-extension. The 9th house is about breadth, and Jupiter amplifies this — make sure the journey has a destination, not just motion.',
    source: 'Ciro Discepolo',
  },
  10: {
    title: 'The Year of Irreversible Growth',
    overview: 'Jupiter in the 10th house is almost always a positive signal for professional growth. Strictly conjunct the MC, it is arguably the best single combination obtainable in a Solar Return chart. Results achieved under this position are typically irreversible.',
    practical: 'Professional advancement, emancipation, overcoming fears, completing education, purchasing dream property, marriage, becoming a parent — growth takes many forms. A mother figure may experience significant positive developments. The gains are less dramatic than an SR Ascendant in the natal 10th house, but they come without contraindications. Jupiter-MC conjunction is Discepolo\'s "golden placement."',
    caution: 'While universally positive, this placement is "less powerful" than an SR Ascendant in the natal 10th. Do not expect miracles — expect solid, lasting growth that compounds over time.',
    source: 'Ciro Discepolo',
  },
  11: {
    title: 'The Year of Friends in High Places',
    overview: 'Jupiter in the 11th house brings assistance through influential contacts, powerful acquaintances, and friends in strategic positions. Politicians, judges, officials, and other well-placed individuals offer concrete help.',
    practical: 'People in power may offer you jobs, contracts, introductions, or preferential treatment in any field. Medical specialists become accessible through connections. Existing friendships deepen with concrete expressions of support. New, beneficial friendships form. Projects achieve desired results. Professional growth through networking. Possible benefits from a death. Jupiter in the 11th is always positive — only one rung below Jupiter conjunct MC.',
    caution: 'The help arrives through relationships — make sure you reciprocate and do not become dependent on the good will of others. Build genuine connections, not transactional ones.',
    source: 'Ciro Discepolo',
  },
  12: {
    title: 'The Universal Guardian Angel',
    overview: 'Jupiter in the 12th house is perhaps its BEST position overall — not because it brings spectacular success, but because it works as a universal wild card and guardian angel. It helps you recover from every negative situation, avoid dangers, and rehabilitate from any kind of difficulty.',
    practical: 'This Jupiter is your safety net. It protects against dramatic experiences from any direction: health, legal, financial, romantic. Disease recovery, legal trouble resolution, financial crisis management, and grief processing all benefit. The effects are not flashy — they are quietly, consistently protective. Walking on a rope between skyscrapers? Jupiter 12th is the net below you. This is the position that most convincingly demonstrates Jupiter as a genuinely benefic planet.',
    caution: 'The protection is real but subtle — you may not even notice it until the year ends and you realize how many potential disasters simply did not happen. Do not mistake quiet protection for "nothing happening."',
    source: 'Ciro Discepolo',
  },
};

// ─── MERCURY IN SR HOUSES (Expert) ──────────────────────────────────

export const srMercuryInHouseDeep: Record<number, SRPlanetHouseDeep> = {
  1: {
    title: 'The Year of Your Voice',
    overview: 'Mercury in the 1st house makes your thinking, speech, and intellectual presence the centerpiece of how others perceive you. You are identified by your ideas, your words, and your mental agility. This is a year to speak, write, teach, or negotiate on your own behalf.',
    practical: 'Personal branding through communication. Writing a blog, giving talks, or becoming known as "the smart one" in your circles. Your appearance may reflect mental energy — nervous energy, animated gestures, youthful presentation. Short trips and learning dominate your personal agenda.',
    caution: 'Overthinking and nervous anxiety are risks. You may intellectualize emotions rather than feeling them. Mental restlessness can exhaust you and others.',
    source: 'Mary Fortier Shea, Brian Clark',
  },
  2: {
    title: 'The Year of Financial Intelligence',
    overview: 'Mercury in the 2nd house directs your mental energy toward money, financial planning, and value assessment. Income may come through communication, writing, teaching, or intellectual work. You think about money more than usual.',
    practical: 'Financial negotiations, budget planning, and income diversification strategies dominate. You may earn through Mercury-ruled activities: writing, speaking, consulting, trading, or brokerage. Research into investments or financial literacy pays off. Buying and selling items of intellectual value.',
    caution: 'Analysis paralysis around financial decisions. Overthinking purchases. Money anxiety from too much number-crunching without action.',
    source: 'Mary Fortier Shea',
  },
  3: {
    title: 'Mercury at Home — Mental Overdrive',
    overview: 'Mercury in the 3rd house is in its natural domain — communication, learning, writing, teaching, and local connections are all supercharged. This is one of the mentally busiest years possible.',
    practical: 'Writing projects succeed. Courses, workshops, and study programs are highly productive. Sibling relationships are active. Short trips are frequent and mentally stimulating. You may purchase new communication technology. Public speaking, podcasting, or media work is favored. Your neighborhood or local environment becomes more interesting and engaging.',
    caution: 'Information overload is real. You cannot read every book, take every course, or have every conversation. Prioritize depth over breadth or risk burning out your mental circuits.',
    source: 'Mary Fortier Shea',
  },
  4: {
    title: 'The Year of Thinking About Home',
    overview: 'Mercury in the 4th house directs mental energy toward home, family, and your private foundation. Real estate negotiations, family discussions, and thinking about your roots or heritage are central.',
    practical: 'Home office setup or improvement. Working from home becomes more productive. Family communication improves or becomes a focus. Researching ancestry or family history. Making important decisions about living arrangements. A parent may need to be communicated with about difficult topics.',
    caution: 'Bringing work-mind home can prevent genuine rest. Domestic overthinking. Family arguments that are more intellectual than emotional may miss the real point.',
    source: 'Mary Fortier Shea',
  },
  5: {
    title: 'The Year of Creative Communication',
    overview: 'Mercury in the 5th house combines intellectual brilliance with creative expression. Writing for pleasure, intellectual games, witty romance, and playful learning dominate.',
    practical: 'Creative writing, blogging, comedy, or performing arts involving words. Romance through conversation — you attract through wit and intelligence. Teaching children or young people. Board games, puzzles, and intellectual hobbies become sources of genuine pleasure.',
    caution: 'Intellectualizing romance can prevent genuine emotional connection. All play and no substance leads to creative restlessness.',
    source: 'Mary Fortier Shea',
  },
  6: {
    title: 'The Year of Work Communication',
    overview: 'Mercury in the 6th house intensifies all workplace communication — emails, meetings, task management, and coordination become your primary work tools. Health research and medical consultations are highlighted.',
    practical: 'Organizing your work life with new systems, software, or processes. Medical second opinions. Researching health conditions and treatment options. Detailed analysis of daily routines for efficiency. Technical writing or documentation projects at work.',
    caution: 'Work email anxiety. Over-managing details. Health anxiety from too much WebMD research. Let some things be simple.',
    source: 'Mary Fortier Shea',
  },
  7: {
    title: 'The Year of Negotiation',
    overview: 'Mercury in the 7th house makes dialogue, negotiation, and contracts the centerpiece of your relationship life. You and a significant other are working things out through words.',
    practical: 'Couple\'s therapy or structured relationship conversations. Contract negotiations. Legal consultations. Finding a partnership that stimulates you intellectually. Business partnerships based on complementary thinking styles.',
    caution: 'Talking about the relationship can replace actually experiencing it. Over-rationalizing emotional dynamics. Contractual thinking applied to love creates distance.',
    source: 'Mary Fortier Shea',
  },
  8: {
    title: 'The Year of Research and Investigation',
    overview: 'Mercury in the 8th house brings deep, investigative thinking. Financial negotiations involving other people\'s resources, therapeutic conversations, and research into hidden matters dominate.',
    practical: 'Tax planning, estate management, insurance negotiations. Psychological therapy is especially effective with Mercury here — you can articulate what is normally hidden. Research into occult, psychological, or taboo subjects. Forensic or investigative work thrives.',
    caution: 'Obsessive thinking about dark subjects. Mental fixation on worst-case scenarios. Paranoia about what others are hiding.',
    source: 'Mary Fortier Shea',
  },
  9: {
    title: 'The Year of the Expansive Mind',
    overview: 'Mercury in the 9th house reaches for big ideas — philosophy, religion, foreign cultures, higher education, publishing, and legal matters. Your thinking goes global.',
    practical: 'Enrolling in university or advanced study. Publishing articles, books, or academic papers. Travel planning and booking. Legal consultations and document preparation. Learning a foreign language. Engaging with worldviews different from your own.',
    caution: 'Thinking too big without attending to details. Philosophical debate without practical application. Mental restlessness that refuses to settle on any single belief system.',
    source: 'Mary Fortier Shea',
  },
  10: {
    title: 'The Year of Professional Communication',
    overview: 'Mercury in the 10th house makes professional communication critical to your career trajectory. Presentations, branding, networking, and public speaking carry career-changing weight.',
    practical: 'Updating your resume, LinkedIn, or professional website. Public speaking engagements. Media appearances. Networking that leads to career advancement. Your ideas gain professional traction and visibility.',
    caution: 'Every word counts professionally — a careless email or off-hand remark can have outsized consequences. Think before you speak in professional contexts.',
    source: 'Mary Fortier Shea',
  },
  11: {
    title: 'The Year of Collaborative Thinking',
    overview: 'Mercury in the 11th house connects your intellect to group settings, collaborative projects, and future-oriented planning. Networking and group communication dominate.',
    practical: 'Joining think tanks, study groups, or collaborative projects. Social media engagement becomes productive. Planning for the future with clarity and detail. Communicating your vision to allies who can help implement it.',
    caution: 'Group think can replace original thought. Too many collaborators can dilute your message. Choose your intellectual community carefully.',
    source: 'Mary Fortier Shea',
  },
  12: {
    title: 'The Year of Silent Thought',
    overview: 'Mercury in the 12th house turns communication inward. Private thinking, journaling, and internal dialogue replace public expression. Important thoughts may be kept secret.',
    practical: 'Journaling as a therapeutic tool. Meditation on ideas before sharing them. Research conducted in private. Working behind the scenes on communication projects. Dream journaling reveals insights.',
    caution: 'Isolation of thoughts can lead to misunderstandings with others who don\'t know what you\'re thinking. Secrets create distance. Share when necessary.',
    source: 'Mary Fortier Shea',
  },
};

// ─── VENUS IN SR HOUSES (Expert) ────────────────────────────────────

export const srVenusInHouseDeep: Record<number, SRPlanetHouseDeep> = {
  1: {
    title: 'The Year You Shine',
    overview: 'Venus in the 1st house of your Solar Return is one of the most personally favorable placements. You are more attractive, charming, and socially magnetic. Your appearance improves — through effort or simply through an inner glow that others respond to.',
    practical: 'Investments in appearance pay off: new wardrobe, haircut, skincare, fitness. Social invitations increase. People are drawn to you without effort. Diplomacy comes naturally. Starting new relationships is favored. Art, beauty, and aesthetic pleasures become central to your identity.',
    caution: 'Vanity and superficiality. Relying on charm rather than substance. Attracting people for the wrong reasons — beauty without depth creates shallow connections.',
    source: 'Mary Fortier Shea, Ciro Discepolo',
  },
  2: {
    title: 'The Year of Beautiful Abundance',
    overview: 'Venus in the 2nd house brings financial luck through Venusian means — art, beauty, relationships, and social connections. Income may come through creative or socially-connected channels. Material comfort and luxury appeal strongly.',
    practical: 'Financial improvements through artistic work, beauty industry, fashion, design, or relationship-based income. Gift-giving and receiving increases. Shopping for quality items that bring lasting pleasure. Developing a luxury skill or collecting beautiful objects.',
    caution: 'Overspending on luxury. Confusing wanting beautiful things with needing them. Financial pleasure-seeking that creates debt.',
    source: 'Mary Fortier Shea',
  },
  3: {
    title: 'The Year of Sweet Communication',
    overview: 'Venus in the 3rd house brings harmony and grace to all communication. Conversations are pleasant, diplomacy comes easily, and relationships with siblings and neighbors are warm.',
    practical: 'Love letters, sweet messages, and charming conversations. Writing with aesthetic beauty. Pleasant interactions in your local environment. Learning art, music, or any subject connected to beauty. Social media presence becomes more polished and attractive.',
    caution: 'Avoiding difficult conversations because you prefer harmony. Saying what people want to hear rather than what is true. Sweetness without substance.',
    source: 'Mary Fortier Shea',
  },
  4: {
    title: 'The Year of Domestic Beauty',
    overview: 'Venus in the 4th house turns your home into a sanctuary of beauty and comfort. Interior decorating, harmonious family relationships, and domestic pleasure dominate.',
    practical: 'Home renovation with aesthetic focus. Hosting dinner parties and social gatherings at home. Family relationships become more loving and supportive. Creating a beautiful, comfortable living space that nourishes your soul. Real estate purchases of attractive properties.',
    caution: 'Excessive nesting that prevents engagement with the outside world. Spending too much on home décor. Using domestic beauty as an escape from external challenges.',
    source: 'Mary Fortier Shea',
  },
  5: {
    title: 'The Year of Romance and Creative Joy',
    overview: 'Venus in the 5th house is one of the strongest placements for new love, creative success, and pure pleasure. This is the classic "falling in love" placement. Artistic expression is not only satisfying but may bring recognition.',
    practical: 'New romantic relationships begin under beautiful circumstances. Existing relationships experience renewed passion. Creative projects — art, music, writing, performance — are inspired and well-received. Children bring joy. Social outings, dates, and entertainment are frequent and delightful.',
    caution: 'The honeymoon glow can prevent realistic assessment of a new relationship. Creative self-indulgence without discipline. Pleasure-seeking that avoids responsibility.',
    source: 'Mary Fortier Shea, Ciro Discepolo',
  },
  6: {
    title: 'The Year of Graceful Service',
    overview: 'Venus in the 6th house creates a pleasant work environment and a gentle approach to health. Work relationships become friendly and supportive. Daily routines include more beauty and pleasure.',
    practical: 'Workplace friendships deepen. Job satisfaction increases. Health routines become enjoyable rather than punitive — yoga, spa treatments, beautiful meal preparation. Hiring pleasant, competent coworkers. Finding artistic satisfaction in practical work. Combined with Jupiter in the 6th, this is one of the most health-protective SR configurations possible.',
    caution: 'Avoiding necessary confrontation at work because harmony feels better. Neglecting difficult health issues because "everything feels fine." Procrastinating through pleasure.',
    source: 'Mary Fortier Shea, Ciro Discepolo',
  },
  7: {
    title: 'The Year of Partnership Blessing',
    overview: 'Venus in the 7th house is one of the best possible placements for love and partnership. Engagements, marriages, deepening commitment, and meeting a genuinely compatible partner are all strongly favored.',
    practical: 'If single, meeting a partner who embodies your values. If partnered, the relationship reaches a new level of harmony and appreciation. Legal matters resolve favorably. Business partnerships formed now are harmonious and mutually beneficial. Counseling or couples work is productive and healing.',
    caution: 'Idealizing a partner. Compromising too much for the sake of peace. Entering a relationship because it is beautiful rather than because it is real.',
    source: 'Mary Fortier Shea',
  },
  8: {
    title: 'The Year of Intimate Depth',
    overview: 'Venus in the 8th house deepens intimacy and brings financial benefits through a partner or shared resources. The experience of love involves vulnerability, surrender, and transformation.',
    practical: 'Physical intimacy reaches new depth and meaning. Financial benefits through a partner, inheritance, or insurance. Love that transforms your understanding of yourself. Art or beauty connected to themes of death, rebirth, and the hidden. Therapy that heals through the beauty of being truly seen.',
    caution: 'Love that borders on obsession. Financial dependency on a partner. Confusing intensity with intimacy. Power dynamics in relationships need conscious management.',
    source: 'Mary Fortier Shea',
  },
  9: {
    title: 'The Year of Love and Horizons',
    overview: 'Venus in the 9th house brings romance through travel, education, or cross-cultural connections. You may fall in love with a person, a place, a philosophy, or a culture that is different from your own.',
    practical: 'Romance on a foreign trip. Studying art, beauty, or aesthetics in an academic setting. Publishing work on beauty, love, or values. Legal matters involving partnership or assets resolve favorably. Beauty experienced through travel — visiting beautiful places transforms your aesthetic sense.',
    caution: 'Long-distance relationships that are beautiful in theory but impractical in reality. Romanticizing foreign cultures. Seeking beauty so far away that you cannot appreciate what is close.',
    source: 'Mary Fortier Shea',
  },
  10: {
    title: 'The Year of Professional Charm',
    overview: 'Venus in the 10th house brings social charm to career advancement. Your professional relationships are pleasant, and you may be recognized for artistic, diplomatic, or aesthetic abilities.',
    practical: 'Career advancement through likability and social skill. Professional recognition in creative or beauty-related fields. A female authority figure is supportive. Public reputation becomes more attractive. Networking success through genuine warmth.',
    caution: 'Using charm as a substitute for competence. Being promoted for likability rather than substance. Professional jealousy from those who feel you have it too easy.',
    source: 'Mary Fortier Shea',
  },
  11: {
    title: 'The Year of Social Harmony',
    overview: 'Venus in the 11th house brings joy through friendships, group activities, and community involvement. Social gatherings are frequent and genuinely pleasant.',
    practical: 'New friendships that enrich your life. Joining groups aligned with your aesthetic or social values. Community involvement brings satisfaction. Meeting romantic interests through friends or social organizations. Technology connects you to like-minded people.',
    caution: 'Spreading yourself too thin socially. Friendships based on appearances rather than depth. Group belonging that requires suppressing your individuality.',
    source: 'Mary Fortier Shea',
  },
  12: {
    title: 'The Year of Hidden Love',
    overview: 'Venus in the 12th house brings secret or private love, artistic inspiration from solitude, and compassionate service to others. Love may require sacrifice or exist behind closed doors.',
    practical: 'Private romances. Artistic creation in solitude — painting, writing, composing alone. Volunteer work at hospitals, shelters, or retreats. Spiritual love that transcends physical presence. Beauty discovered in quiet, hidden places. Combined with Jupiter in the 12th or 1st, this is highly protective of health and wellbeing.',
    caution: 'Secret affairs that damage trust. Self-sacrificing love that depletes you. Using art as escapism rather than expression. Idealizing someone you cannot have.',
    source: 'Mary Fortier Shea, Ciro Discepolo',
  },
};

// ─── MARS IN SR HOUSES (Expert) ─────────────────────────────────────

export const srMarsInHouseDeep: Record<number, SRPlanetHouseDeep> = {
  1: {
    title: 'The Year of Action',
    overview: 'Mars in the 1st house supercharges your personal energy, initiative, and assertiveness. You are driven to ACT — on personal goals, physical fitness, and self-assertion. Others experience you as more forceful, competitive, and dynamic.',
    practical: 'Physical energy peaks — exercise, sports, and physical challenges are favored. You take initiative rather than waiting. Arguments and confrontations are more likely because your patience is thin. Starting new ventures, especially solo projects, benefits from this aggressive forward momentum. Surgical procedures on the body may be indicated.',
    caution: 'Impatience, irritability, and anger are elevated. Accident-prone if energy is not channeled constructively. Others may find you too aggressive or dominating. Physical injuries from recklessness.',
    source: 'Mary Fortier Shea, Brian Clark',
  },
  2: {
    title: 'The Year of Financial Drive',
    overview: 'Mars in the 2nd house drives aggressive pursuit of income and financial goals. Money is earned through effort, competition, and forceful initiative. Spending is also impulsive.',
    practical: 'Active income generation — sales, commissions, competitive bidding, physical labor. Purchasing tools, sports equipment, or items related to Mars (cars, weapons, gym equipment). Fighting for a raise or financial recognition. Values-based conflicts with others.',
    caution: 'Impulsive spending. Financial arguments with partners. Earning money through methods that conflict with your deeper values. Material aggression replacing emotional processing.',
    source: 'Mary Fortier Shea',
  },
  3: {
    title: 'The Year of Forceful Communication',
    overview: 'Mars in the 3rd house makes your communication style direct, assertive, and sometimes combative. Arguments, debates, and forceful advocacy for your ideas dominate.',
    practical: 'Debate, argumentation, and intellectual competition. Writing with passion and force. Fast-paced learning. Sibling conflicts or dynamic sibling interactions. Assertive driving — traffic incidents are possible. Activist communication and advocacy.',
    caution: 'Words become weapons. Arguments that escalate unnecessarily. Reckless driving. Mental exhaustion from constant intellectual combat. Speaking before thinking.',
    source: 'Mary Fortier Shea',
  },
  4: {
    title: 'The Year of Domestic Action',
    overview: 'Mars in the 4th house directs energy toward home improvements, family dynamics, and domestic power struggles. Renovation projects and family conflicts are both common.',
    practical: 'Home renovation, construction, or major repairs. Physical work on the property. Family arguments — especially involving a father figure or authority at home. Moving homes through forceful decision-making. Clearing out physical spaces with aggressive efficiency.',
    caution: 'Home becomes a battleground if anger is not managed. Power struggles with family members. Accidents at home during renovation work. Using home as an arena for displaced anger from other areas.',
    source: 'Mary Fortier Shea',
  },
  5: {
    title: 'The Year of Passionate Pursuit',
    overview: 'Mars in the 5th house creates passionate romance, bold creative expression, and competitive hobbies. Risk-taking in love and art is heightened.',
    practical: 'Intense romantic attraction — pursuing someone with vigor and determination. Competitive sports and physical hobbies. Bold creative projects that take risks. High energy with children — sports coaching, active play. Performance arts with physical intensity.',
    caution: 'Romantic aggression that crosses boundaries. Gambling with too much at stake. Conflicts with children. Creative ego battles. Sexual intensity that confuses passion with compatibility.',
    source: 'Mary Fortier Shea',
  },
  6: {
    title: 'The Year of Work Intensity',
    overview: 'Mars in the 6th house dramatically increases work intensity — longer hours, competitive environments, and physical labor. Exercise becomes essential, and acute health issues may demand attention.',
    practical: 'Heavy workload that demands physical and mental stamina. Competitive workplace dynamics. Starting a fitness regimen. Addressing acute health issues (inflammation, fevers, injuries). Surgery may be indicated. Conflict with coworkers or employees.',
    caution: 'Burnout from overwork. Workplace confrontations. Health inflammation from stress. Pushing your body past its limits. Not resting when injured.',
    source: 'Mary Fortier Shea',
  },
  7: {
    title: 'The Year of Relationship Fire',
    overview: 'Mars in the 7th house brings either passionate attraction or significant conflict (or both) into partnerships. A partner pushes you, challenges you, or energizes you.',
    practical: 'Attracting assertive, energetic partners. Relationship conflicts that demand resolution. Legal battles or competitive negotiations. A partner who motivates you toward action. Physical activities done together strengthen bonds.',
    caution: 'Relationship anger and power struggles. Attracting aggressive or dominating partners. Legal disputes that escalate. Projecting your own anger onto a partner.',
    source: 'Mary Fortier Shea',
  },
  8: {
    title: 'The Year of Psychological Warfare',
    overview: 'Mars in the 8th house intensifies power struggles, financial conflicts involving others, and deep psychological processing. Surgical procedures and crisis management are common themes.',
    practical: 'Financial negotiations with intensity — inheritance disputes, insurance claims, tax battles. Psychological therapy with a confrontational edge. Surgical procedures. Sexual intensity and power dynamics in intimate relationships. Facing death or endings with courage.',
    caution: 'Manipulation and control in intimate relationships. Obsessive behavior around power and resources. Rage that has been buried and surfaces destructively. Financial vendettas.',
    source: 'Mary Fortier Shea',
  },
  9: {
    title: 'The Year of Adventurous Pursuit',
    overview: 'Mars in the 9th house drives adventure travel, competitive academic pursuits, and fighting for justice or beliefs. Legal battles and philosophical confrontations are likely.',
    practical: 'Physically demanding travel — hiking, trekking, adventure tourism. Competitive academic environments. Legal advocacy. Fighting for a philosophical or political cause. Military or strategic studies. Physical education or sports coaching abroad.',
    caution: 'Dogmatism — fighting for beliefs without listening. Legal battles that consume energy. Physical risks during travel. Crusading that alienates potential allies.',
    source: 'Mary Fortier Shea',
  },
  10: {
    title: 'The Year of Career Aggression',
    overview: 'Mars in the 10th house puts career ambition into overdrive. Competitive professional environments, conflicts with authority, and aggressive pursuit of professional goals dominate.',
    practical: 'Going after the promotion, the contract, the leadership position with full force. Entrepreneurial ventures launched with energy. Military, athletics, or physical career focus. Conflicts with bosses that either resolve through assertion or through departure.',
    caution: 'Career sabotage through excessive aggression. Making enemies of authority figures. Burnout from relentless professional ambition. Winning the battle but losing the war.',
    source: 'Mary Fortier Shea',
  },
  11: {
    title: 'The Year of Group Leadership',
    overview: 'Mars in the 11th house channels energy into group dynamics, activist causes, and leadership within organizations. Group conflicts and competitive friendships are possible.',
    practical: 'Leading organizations or community groups. Activist energy — marching, organizing, campaigning. Dynamic friendships that push you toward your goals. Competitive team sports. Technology projects that require aggressive timelines.',
    caution: 'Group power struggles. Friendships ruined by competition. Forcing your vision on a group. Alienating allies through excessive assertiveness.',
    source: 'Mary Fortier Shea',
  },
  12: {
    title: 'The Year of Hidden Anger',
    overview: 'Mars in the 12th house buries anger, aggression, and assertive energy beneath the surface. It may emerge through passive-aggression, self-sabotage, or channeling into spiritual practice.',
    practical: 'Working behind the scenes with focused intensity. Martial arts, yoga, or physical practices with a spiritual dimension. Volunteering in institutional settings (hospitals, prisons). Confronting hidden enemies or self-destructive patterns. Energy directed toward spiritual discipline.',
    caution: 'Suppressed anger that explodes unpredictably. Self-sabotage through passive-aggression. Exhaustion from fighting invisible battles. Institutional conflicts you did not anticipate. Substance use as anger management.',
    source: 'Mary Fortier Shea',
  },
};

// ─── SATURN IN SR HOUSES ────────────────────────────────────────────
export const srSaturnInHouseDeep: Record<number, SRPlanetHouseDeep> = {
  1: {
    title: 'The Year of Personal Reckoning',
    overview: 'Saturn in the 1st house places a heavy mantle on your shoulders. You feel older, more serious, and more aware of your limitations. This is a year of taking full responsibility for who you are. Others may see you as more authoritative — or more burdened.',
    practical: 'Health demands attention — dental work, bone density, skin issues, or chronic conditions surface. You may lose weight or look more angular. Career responsibilities increase. You take on a leadership role you didn\'t necessarily want. Self-discipline reaches a peak.',
    caution: 'Depression and isolation are real risks. Don\'t withdraw completely. The heaviness is temporary — Saturn is testing your backbone, not trying to break it. Physical exercise is essential to move the stuck energy.',
    source: 'Mary Fortier Shea, Ray Merriman',
  },
  2: {
    title: 'Financial Contraction & Rebuilding',
    overview: 'Saturn in the 2nd house restricts finances — income may decrease or expenses feel crushing. But this is the year you learn what you TRULY need versus what you\'ve been wasting money on. Financial discipline becomes non-negotiable.',
    practical: 'Budgeting, debt repayment, eliminating luxury spending. Income from hard work rather than luck. You may feel poor even if you\'re not — Saturn creates a scarcity mindset. Real estate or long-term investments made now tend to hold value. Your sense of self-worth gets restructured.',
    caution: 'Don\'t make fear-based financial decisions. The restriction is teaching you sustainability, not punishing you. Avoid hoarding or becoming miserly — Saturn wants you lean, not starving.',
    source: 'Mary Fortier Shea',
  },
  3: {
    title: 'Serious Thinking & Heavy Conversations',
    overview: 'Saturn in the 3rd house makes your mind more focused, serious, and methodical. You study with discipline, write with authority, and communicate with weight. But casual chatting feels exhausting — every word matters.',
    practical: 'Formal education, certification programs, serious writing projects. Relationships with siblings or neighbors require boundary-setting. Short trips feel burdensome. You may feel mentally isolated or struggle with negative thought patterns. Structured learning brings lasting results.',
    caution: 'Watch for pessimistic thinking spirals. Difficulty with siblings or neighbors. Communication feels heavy — say what needs to be said, but don\'t over-edit yourself into silence.',
    source: 'Mary Fortier Shea',
  },
  4: {
    title: 'The Foundation Year',
    overview: 'Saturn in the 4th house puts pressure on home and family. You may move, renovate, or deal with aging parents. The emotional foundation of your life is being tested — what\'s solid stays, what\'s built on sand crumbles.',
    practical: 'Home repairs, downsizing, or taking on mortgage responsibility. A parent may need care. Family obligations feel heavier. You confront childhood patterns. If you build or buy property now, it tends to last. Emotional self-sufficiency is the lesson.',
    caution: 'Don\'t neglect your emotional needs while caretaking others. The home should feel like a sanctuary, not a prison. If family dynamics are toxic, Saturn gives you permission to set firm boundaries.',
    source: 'Mary Fortier Shea, Ray Merriman',
  },
  5: {
    title: 'Disciplined Creativity & Cautious Romance',
    overview: 'Saturn in the 5th house cools the fires of romance and play. Fun requires effort. Creative projects need structure and discipline to succeed. Children may bring responsibilities rather than pure joy.',
    practical: 'Serious creative work — finishing the novel, completing the portfolio, mastering the craft. Romance with older or more mature partners. Pregnancy may involve complications or require planning. Hobbies become professions. Gambling and speculation fail.',
    caution: 'Don\'t stop playing entirely — Saturn wants you to take joy seriously, not eliminate it. If you\'re dating, look for substance over sparkle. Don\'t have children just because you feel time pressure.',
    source: 'Mary Fortier Shea',
  },
  6: {
    title: 'Health Reckoning & Work Endurance',
    overview: 'Saturn in the 6th house demands you take your body seriously. Health issues that have been ignored surface and demand treatment. Work becomes grinding but productive — you earn through sustained effort.',
    practical: 'Medical checkups, establishing health routines, addressing chronic conditions. Work overload is common — you may take on two jobs\' worth of responsibility. Employees or coworkers become burdensome. Diet and exercise require military discipline.',
    caution: 'Don\'t ignore symptoms — Saturn in the 6th is your body\'s final warning system. Work boundaries are essential or burnout is guaranteed. This isn\'t the year to skip the dentist.',
    source: 'Mary Fortier Shea',
  },
  7: {
    title: 'Relationship Reality Check',
    overview: 'Saturn in the 7th house tests partnerships — romantic, business, or legal. Weak relationships break under the pressure. Strong ones deepen into genuine commitment. You attract serious, older, or Saturnian partners.',
    practical: 'Marriage counseling, contract negotiations, legal proceedings. You may formalize a relationship or end one that lacks substance. Business partnerships require clear agreements. You learn what commitment actually costs. Loneliness is possible if you\'re single — Saturn delays but doesn\'t deny.',
    caution: 'Don\'t stay in a dead relationship out of duty. Don\'t rush into marriage out of fear of being alone. Saturn wants you to choose partners who can carry their own weight.',
    source: 'Mary Fortier Shea, Ray Merriman',
  },
  8: {
    title: 'Financial Entanglements & Deep Transformation',
    overview: 'Saturn in the 8th house brings reckoning with shared resources — taxes, debts, inheritance, insurance, and your partner\'s finances. Psychological depth work is intense but unavoidable.',
    practical: 'Tax audits, estate planning, debt restructuring. Power dynamics in intimate relationships surface and demand resolution. Therapy goes deep. Sexual issues may need addressing. You confront mortality — your own or someone close. Financial dependence on others feels unbearable.',
    caution: 'Don\'t avoid the financial paperwork — it won\'t go away. If you owe, pay. If others owe you, collect. Psychological avoidance makes this placement much harder than it needs to be.',
    source: 'Mary Fortier Shea',
  },
  9: {
    title: 'Beliefs Under Pressure',
    overview: 'Saturn in the 9th house challenges your worldview, philosophy, and faith. What you believed without question now requires evidence. Education becomes serious and goal-oriented. Travel involves obstacles or responsibilities.',
    practical: 'Graduate school, professional licensing, legal matters involving foreign entities. Religious or philosophical crisis that leads to a more grounded faith. International business with heavy regulation. Publishing with a serious, authoritative tone. Teaching with real expertise.',
    caution: 'Don\'t become a rigid dogmatist. Saturn wants you to EARN your beliefs through experience, not just adopt them from authority figures. Travel plans may face delays — plan extra time.',
    source: 'Mary Fortier Shea',
  },
  10: {
    title: 'Career Culmination or Crisis',
    overview: 'Saturn in the 10th house is one of the most career-defining placements. You are publicly tested — your professional reputation, authority, and achievements are all under scrutiny. This is the mountaintop year: you either summit or realize you\'ve been climbing the wrong mountain.',
    practical: 'Promotions with heavy responsibility. Professional recognition earned through years of effort. Career change if the current path lacks integrity. Authority figures (bosses, fathers) play a major role. Public accountability increases.',
    caution: 'Don\'t cut corners — everything is visible. If you\'ve been doing good work, this is your reward year. If you\'ve been faking it, Saturn exposes the gaps. Your reputation is being built or rebuilt — every professional decision counts.',
    source: 'Mary Fortier Shea, Ray Merriman',
  },
  11: {
    title: 'Social Circle Contraction',
    overview: 'Saturn in the 11th house reduces your friend circle to its essential members. Fair-weather friends disappear. Group activities feel burdensome. Your long-term goals and hopes undergo serious revision.',
    practical: 'Leaving organizations that no longer serve you. Taking on leadership in groups you care about. Older or more established friends become important. Your vision for the future gets realistic. Networking requires effort but yields lasting connections.',
    caution: 'Loneliness within groups is paradoxically common. Don\'t isolate — maintain the friendships that matter. Your dreams aren\'t dying, they\'re being pruned to what\'s actually achievable.',
    source: 'Mary Fortier Shea',
  },
  12: {
    title: 'Confronting the Inner Prison',
    overview: 'Saturn in the 12th house is one of the hardest placements — it brings you face-to-face with your deepest fears, unconscious patterns, and self-imposed limitations. But it\'s also where the most profound inner work happens.',
    practical: 'Therapy, meditation retreats, spiritual discipline. Institutional involvement (hospitals, monasteries, prisons — as helper or patient). Hidden enemies may surface. Chronic health issues with psychological roots. Solitude becomes productive rather than isolating.',
    caution: 'Depression risk is highest here. Don\'t suffer in silence — get professional support. The 12th house Saturn is dismantling the inner walls you built for protection that have become your prison. Let them fall.',
    source: 'Mary Fortier Shea, Ray Merriman',
  },
};

// ─── URANUS IN SR HOUSES ────────────────────────────────────────────
export const srUranusInHouseDeep: Record<number, SRPlanetHouseDeep> = {
  1: {
    title: 'The Year You Reinvent Yourself',
    overview: 'Uranus in the 1st house electrifies your identity. You feel restless, rebellious, and ready to break free from who you\'ve been. Your appearance, behavior, and entire self-presentation may change dramatically — often surprising even you.',
    practical: 'Radical changes in appearance, lifestyle, or personality. Others find you unpredictable. You need freedom above all else. New interests come out of nowhere. You may feel like a different person compared to last year.',
    caution: 'Don\'t burn bridges just for the thrill of rebellion. Channel the restlessness into genuine self-discovery rather than chaos. The changes you make this year tend to stick — make sure they\'re actually you, not just reactions.',
    source: 'Mary Fortier Shea',
  },
  2: {
    title: 'Financial Earthquakes',
    overview: 'Uranus in the 2nd house creates sudden, unpredictable shifts in income and values. Money comes from unexpected sources and leaves just as suddenly. Your relationship with material security gets completely rewired.',
    practical: 'Freelance or gig income. Cryptocurrency, tech investments, or unconventional income streams. Values shift — what mattered last year may feel irrelevant now. Impulse spending on technology or gadgets. Self-worth disconnected from net worth.',
    caution: 'Build an emergency fund — financial surprises go both ways. Don\'t quit your day job on a whim. The instability is teaching you to derive security from within, not from your bank balance.',
    source: 'Mary Fortier Shea',
  },
  3: {
    title: 'Mind Lightning',
    overview: 'Uranus in the 3rd house accelerates your thinking and communication. Ideas come in flashes. You may become interested in radically different subjects. Your way of speaking, writing, or learning undergoes a revolution.',
    practical: 'Learning new technology, coding, or unconventional subjects. Social media presence changes. Surprising news or messages arrive. Relationships with siblings shift unexpectedly. Short trips happen spontaneously.',
    caution: 'Your mind is moving faster than your mouth — slow down enough to be understood. Don\'t dismiss established knowledge just because it feels old. Nervousness and mental overstimulation are risks.',
    source: 'Mary Fortier Shea',
  },
  4: {
    title: 'Domestic Revolution',
    overview: 'Uranus in the 4th house disrupts your home life, family dynamics, and emotional foundations. Moves, renovations, or family upheavals are common. The place you call "home" — physically and emotionally — gets redefined.',
    practical: 'Sudden moves or living arrangement changes. Smart home technology. Family secrets revealed. A parent does something unexpected. Your emotional base shifts — what used to comfort you no longer works. Living independently for the first time, or in an unconventional arrangement.',
    caution: 'Don\'t move impulsively — Uranus can make anywhere feel suffocating. The real revolution is internal: learning that home is a state of being, not a physical address.',
    source: 'Mary Fortier Shea',
  },
  5: {
    title: 'Unexpected Romance & Creative Breakthroughs',
    overview: 'Uranus in the 5th house brings surprise in love, creativity, and children. Romance starts or ends suddenly. Creative inspiration strikes like lightning. Your relationship with fun, play, and self-expression becomes wildly unpredictable.',
    practical: 'Love at first sight or sudden breakups. Creative experimentation in new mediums. Unexpected pregnancy or surprising developments with children. Hobbies that become obsessions overnight. Risk-taking in speculation (usually ill-advised).',
    caution: 'Enjoy the excitement but don\'t mistake adrenaline for love. Creative impulses are genuine — follow them. But don\'t gamble your savings on a "sure thing."',
    source: 'Mary Fortier Shea',
  },
  6: {
    title: 'Health & Work Disruption',
    overview: 'Uranus in the 6th house shakes up your daily routines, health practices, and work environment. Sudden job changes, unexpected health diagnoses (often nerve or stress-related), and complete overhauls of daily habits.',
    practical: 'Changing jobs suddenly. Alternative health approaches. Stress-related conditions (nervous system, anxiety, insomnia). New exercise regimes that are unconventional. Technology changing your work process. Freelancing or flexible schedules.',
    caution: 'Don\'t ignore stress symptoms — Uranus in the 6th often manifests as the body forcing change your mind resists. Sudden dietary changes need gradual implementation.',
    source: 'Mary Fortier Shea',
  },
  7: {
    title: 'Relationship Lightning',
    overview: 'Uranus in the 7th house electrifies partnerships. Existing relationships need more space and freedom, or they crack. New relationships start suddenly and with unusual people. You are attracted to the unconventional.',
    practical: 'Meeting someone completely different from your "type." Open relationships or unconventional arrangements. Business partnerships with innovative people. Divorce if the relationship has been confining. Excitement and instability in equal measure.',
    caution: 'Freedom within relationship, not freedom FROM relationship, is the lesson. Don\'t destroy something good because it feels "boring." If you\'re single, don\'t rush commitment with someone exciting but unstable.',
    source: 'Mary Fortier Shea',
  },
  8: {
    title: 'Sudden Transformation',
    overview: 'Uranus in the 8th house brings abrupt psychological shifts, unexpected financial changes through others\' resources, and sudden encounters with mortality or taboo. Nothing about the deep, hidden layers of your life stays static.',
    practical: 'Unexpected inheritance or insurance payouts. Sudden debt. Sexual awakening or experimentation. Psychotherapy breakthroughs that happen in one session. Near-death experiences or close calls that rewire your priorities.',
    caution: 'Financial surprises from shared resources require attention to contracts and fine print. Psychological breakthroughs can feel destabilizing — have support in place.',
    source: 'Mary Fortier Shea',
  },
  9: {
    title: 'Belief System Reboot',
    overview: 'Uranus in the 9th house blows up your worldview. Everything you took for granted about religion, philosophy, education, or foreign cultures gets questioned and replaced with something more authentic and original.',
    practical: 'Sudden travel opportunities. Dropping out of or enrolling in unconventional education. Meeting people from radically different cultures who change your perspective. Publishing or broadcasting innovative ideas. Legal surprises.',
    caution: 'Don\'t throw out all your beliefs at once — some of them were serving you well. Integrate the new with the still-valid old. Travel insurance is wise this year.',
    source: 'Mary Fortier Shea',
  },
  10: {
    title: 'Career Earthquake',
    overview: 'Uranus in the 10th house brings sudden, often dramatic career changes. You may quit, get fired, start something completely new, or become unexpectedly famous. Your public identity undergoes a radical shift.',
    practical: 'Career pivot into technology, innovation, or unconventional fields. Sudden promotion or termination. Going viral. Entrepreneurship. Authority figures behave unpredictably. Your reputation for being "different" grows.',
    caution: 'Don\'t quit in a blaze of glory without a plan. Uranus wants authentic career expression, not just rebellion against the boss. If you\'re being pushed out, it\'s pushing you toward something more "you."',
    source: 'Mary Fortier Shea',
  },
  11: {
    title: 'Social Circle Revolution',
    overview: 'Uranus in the 11th house (its natural home) brings new, unusual friends and groups into your life while old ones fade away. Your vision for the future changes radically. You join movements, communities, or networks you never expected.',
    practical: 'Joining activist groups, tech communities, or countercultural movements. Friendships with eccentric or brilliant people. Crowdfunding success. Your long-term goals shift toward something more authentic. Group dynamics are electric but unstable.',
    caution: 'Don\'t abandon old friends just because new ones are more exciting. Uranus here can make you a joiner-and-leaver. Find the groups worth committing to.',
    source: 'Mary Fortier Shea',
  },
  12: {
    title: 'Awakening From the Unconscious',
    overview: 'Uranus in the 12th house brings sudden insights from dreams, meditation, or unexpected spiritual experiences. Your unconscious mind is being electrically stimulated — revelations come from within, often when you\'re alone or in retreat.',
    practical: 'Vivid, revelatory dreams. Sudden interest in meditation, psychedelics (proceed carefully), or esoteric practices. Hidden aspects of yourself surface without warning. Anonymous online activity. Institutions you\'re connected to undergo upheaval.',
    caution: 'Don\'t confuse spiritual insight with spiritual bypassing. Ground the revelations in daily practice. If anxiety or insomnia spike, your nervous system is overloaded — slow down the inner exploration.',
    source: 'Mary Fortier Shea',
  },
};

// ─── NEPTUNE IN SR HOUSES ───────────────────────────────────────────
export const srNeptuneInHouseDeep: Record<number, SRPlanetHouseDeep> = {
  1: {
    title: 'The Dissolving Self',
    overview: 'Neptune in the 1st house dissolves your usual sense of identity. You become more porous, empathic, and impressionable. Others project onto you — you may appear mysterious, glamorous, or confusing. Your sense of "who I am" gets beautifully (or frustratingly) blurry.',
    practical: 'Increased sensitivity to environments and people. Artistic or spiritual self-expression. Others see what they want to see in you. You may be photographed well, appear more attractive, or seem otherworldly. Health issues may be hard to diagnose — symptoms are vague.',
    caution: 'Boundary dissolution is the primary risk. Learn to say no. Don\'t let others define you. Substances hit harder this year — moderation is essential. If you feel "lost," that\'s Neptune\'s process — you\'re becoming, not disappearing.',
    source: 'Mary Fortier Shea',
  },
  2: {
    title: 'Financial Fog',
    overview: 'Neptune in the 2nd house creates confusion around money and values. Income may come from creative, spiritual, or healing work — or it may simply be unclear where the money is going. Your relationship with material security gets idealized or neglected.',
    practical: 'Income from art, music, film, healing, or spiritual work. Financial confusion — lost receipts, unclear accounts, forgetting to invoice. Generosity to the point of self-sacrifice. Values shift toward the immaterial. You may give away possessions.',
    caution: 'Get an accountant. Seriously. Neptune in the 2nd is the classic "money slips through your fingers" placement. Don\'t lend money you can\'t afford to lose. Don\'t sign financial documents without reading every word.',
    source: 'Mary Fortier Shea',
  },
  3: {
    title: 'The Poetic Mind',
    overview: 'Neptune in the 3rd house makes your thinking more intuitive, imaginative, and creative — but less precise. You communicate through metaphor, art, and feeling rather than facts. Misunderstandings are common.',
    practical: 'Writing poetry, fiction, or lyrics. Intuitive learning. Miscommunication with siblings or neighbors — things get lost in translation. Daydreaming increases. You may forget appointments or confuse directions. Psychic impressions come through everyday encounters.',
    caution: 'Double-check all written communications. Don\'t sign contracts without careful review. Your mind is brilliant for creativity but unreliable for logistics. Use a planner.',
    source: 'Mary Fortier Shea',
  },
  4: {
    title: 'The Enchanted Home',
    overview: 'Neptune in the 4th house idealizes (or confuses) your home and family life. You may create a beautiful, sanctuary-like living space — or you may be dealing with family secrets, confusion about your roots, or a parent\'s health decline.',
    practical: 'Making your home more beautiful and spiritual. Water damage or plumbing issues (Neptune = water). A parent may need care, especially for unclear health issues. Childhood memories surface in new light. Moving to be near water.',
    caution: 'Get a home inspection before buying. Family dynamics may involve deception or unclear boundaries. Your desire for a "perfect" home can lead to overspending on aesthetics while ignoring structural issues.',
    source: 'Mary Fortier Shea',
  },
  5: {
    title: 'Romantic Enchantment',
    overview: 'Neptune in the 5th house brings fairy-tale romance — or romantic delusion. Creative inspiration flows effortlessly. Your imagination is at its peak. Children may be sources of both wonder and worry.',
    practical: 'Falling in love with an idealized version of someone. Artistic breakthroughs in film, photography, music, dance. Pregnancy may involve complications or be surrounded by unusual circumstances. Creative projects that touch people emotionally.',
    caution: 'See your romantic partner clearly — not who you wish they were. Creative work may lack commercial viability (beautiful but impractical). Don\'t gamble — Neptune in the 5th guarantees clouded judgment about risk.',
    source: 'Mary Fortier Shea',
  },
  6: {
    title: 'Health Mystery & Compassionate Service',
    overview: 'Neptune in the 6th house creates elusive health issues and a pull toward service and healing. Symptoms may be hard to pin down — allergies, sensitivities, fatigue with no clear cause. Work takes on a more spiritual or compassionate dimension.',
    practical: 'Alternative healing modalities. Working in hospitals, shelters, or healing centers. Food sensitivities or environmental allergies. Adopting a pet (especially a rescue). Work boundaries dissolve — you take on others\' burdens.',
    caution: 'Don\'t accept a vague diagnosis — push for clarity. Workplace boundaries are essential — you\'re not responsible for saving everyone. Alcohol and drug sensitivity increases.',
    source: 'Mary Fortier Shea',
  },
  7: {
    title: 'The Soulmate Illusion',
    overview: 'Neptune in the 7th house can bring a soulmate connection — or the most convincing illusion of one. Partnerships are bathed in a romantic, spiritual glow. The challenge: seeing your partner as a real person, not a fantasy.',
    practical: 'Meeting someone who feels "destined." Business partners who promise the world. Couples therapy or spiritual partnership work. Legal matters involving confusion or deception. You attract artists, healers, or addicts — sometimes all three in one person.',
    caution: 'This is the #1 placement for being deceived in partnerships. Verify everything. Don\'t merge finances with someone you haven\'t known long enough. The soul connection may be real, but so is the need for discernment.',
    source: 'Mary Fortier Shea',
  },
  8: {
    title: 'Psychic Depths & Financial Confusion',
    overview: 'Neptune in the 8th house deepens your psychic sensitivity and intuition while creating fog around shared finances. You may have profound spiritual or sexual experiences — but also encounter deception in financial dealings.',
    practical: 'Deep meditation, energy healing, or psychic development. Confusion around taxes, insurance, or inheritance. Sexual experiences with a transcendent quality. Grief processing that opens spiritual doors. Past-life memories or déjà vu.',
    caution: 'Don\'t co-sign loans. Read all financial fine print twice. If something sounds too good to be true financially, it is. Channel the depth into genuine spiritual practice rather than escapism.',
    source: 'Mary Fortier Shea',
  },
  9: {
    title: 'Spiritual Pilgrimage',
    overview: 'Neptune in the 9th house calls you toward spiritual seeking, foreign enchantment, and philosophical wonder. Travel has a mystical quality. Education in healing arts or spirituality attracts you. But discernment is needed — not every guru is genuine.',
    practical: 'Pilgrimages, spiritual retreats, or travel to sacred sites. Studying astrology, mysticism, or comparative religion. Publishing creative or spiritual work. Legal matters involve confusion. Foreign connections with a karmic flavor.',
    caution: 'Don\'t follow a teacher blindly. Don\'t idealize foreign cultures. Legal matters may be delayed or confusing — get a good lawyer. The spiritual seeking is genuine, but keep your feet on the ground.',
    source: 'Mary Fortier Shea',
  },
  10: {
    title: 'The Invisible Career',
    overview: 'Neptune in the 10th house blurs your public image and career direction. You may feel directionless professionally — or you may be drawn to creative, healing, or spiritual careers. Your reputation becomes either glamorous or confusing.',
    practical: 'Career in arts, film, music, healing, or spiritual counseling. Public image becomes mysterious or attractive. Career confusion — not knowing what you want to "be." A boss who is deceptive or absent. Your work may go unrecognized (for now).',
    caution: 'Don\'t make career decisions in a fog — wait for clarity. If your workplace involves deception, document everything. The career that calls you this year may not pay well but feeds your soul.',
    source: 'Mary Fortier Shea',
  },
  11: {
    title: 'Idealistic Friendships',
    overview: 'Neptune in the 11th house idealizes friendships and group involvement. You\'re drawn to communities with spiritual or artistic missions. But group dynamics may involve deception, unclear roles, or savior-victim patterns.',
    practical: 'Joining spiritual communities, art collectives, or charitable organizations. Friends who need saving (or who try to save you). Online communities where identity is fluid. Group meditation or creative collaboration. Dreams about the future feel vivid but vague.',
    caution: 'Don\'t lend money to friends. Don\'t join groups that demand blind loyalty. Your vision for the future is beautiful but needs practical grounding. Not everyone in the group has pure motives.',
    source: 'Mary Fortier Shea',
  },
  12: {
    title: 'The Mystical Year',
    overview: 'Neptune in its own house is profoundly spiritual — or profoundly disorienting. Your connection to the unconscious, the divine, and the invisible world is at its strongest. This is the year for deep inner work, meditation, and creative surrender.',
    practical: 'Retreat, meditation, and contemplative practice. Vivid dreams with prophetic or healing quality. Working with the dying, the addicted, or the marginalized. Creative work that channels something beyond yourself. Past-life memories or mystical experiences.',
    caution: 'The boundary between inspiration and delusion is thin. Stay connected to at least one grounded person who can reality-check your experiences. Addiction risk is elevated. The isolation can be golden or toxic — choose wisely.',
    source: 'Mary Fortier Shea',
  },
};

// ─── PLUTO IN SR HOUSES ─────────────────────────────────────────────
export const srPlutoInHouseDeep: Record<number, SRPlanetHouseDeep> = {
  1: {
    title: 'Total Self-Transformation',
    overview: 'Pluto in the 1st house transforms your entire identity from the inside out. You may look different, act different, and feel like a completely different person by the end of this year. The old self must die for the new self to emerge.',
    practical: 'Dramatic changes in appearance, personality, or life direction. Power struggles with others who resist your transformation. Intense physical energy. Others find you more magnetic — or more intimidating. You stop pretending and start being real.',
    caution: 'Don\'t force transformation on others just because you\'re changing. The intensity can alienate people who preferred the old you. Channel the power constructively — Pluto without direction becomes destructive.',
    source: 'Mary Fortier Shea',
  },
  2: {
    title: 'Financial Power Shift',
    overview: 'Pluto in the 2nd house transforms your relationship with money, possessions, and self-worth. Financial power struggles — with employers, partners, or institutions — force you to claim your value. You may accumulate or lose significant resources.',
    practical: 'Negotiating for what you\'re worth. Purging possessions. Financial power plays — insurance battles, salary negotiations, inheritance disputes. Your values undergo a complete overhaul. You discover what you\'re truly willing to fight for.',
    caution: 'Don\'t let financial obsession consume you. The transformation is about WORTH, not just wealth. Let go of possessions that hold toxic energy.',
    source: 'Mary Fortier Shea',
  },
  3: {
    title: 'Words as Weapons & Healing',
    overview: 'Pluto in the 3rd house gives your words power — to heal or to wound. Communication becomes intense, probing, and transformative. Research and investigation skills peak. Sibling relationships undergo deep change.',
    practical: 'Investigative journalism, research, therapy training. Words that change people. Intense conversations that can\'t be taken back. Discovering hidden information. A sibling going through crisis. Propaganda awareness — you see through manipulation.',
    caution: 'Use your verbal power carefully — words said this year leave permanent marks. Don\'t weaponize information. If you discover secrets, handle them with integrity.',
    source: 'Mary Fortier Shea',
  },
  4: {
    title: 'Family Transformation',
    overview: 'Pluto in the 4th house digs up family foundations and transforms them. Family secrets emerge. Power dynamics with parents shift dramatically. Your home may undergo major renovation — literally and emotionally.',
    practical: 'Uncovering family history or secrets. A parent\'s health crisis. Moving to a completely different environment. Renovation that transforms your living space. Confronting childhood trauma in therapy. Establishing psychological independence from family.',
    caution: 'Family power struggles can become consuming. Set boundaries but don\'t cut off — unless genuine abuse is involved. The transformation of "home" is also internal — your emotional foundation is being rebuilt.',
    source: 'Mary Fortier Shea',
  },
  5: {
    title: 'Passionate Creation & Intense Love',
    overview: 'Pluto in the 5th house brings obsessive creative energy and all-or-nothing romance. Love affairs are intense, transformative, and potentially consuming. Creative work comes from the deepest places within you.',
    practical: 'Art that comes from pain or transformation. Love that feels fated and consuming. Power struggles with children. Creative projects that demand everything you have. Sexual intensity in romance. Performing or creating with raw authenticity.',
    caution: 'Obsessive love is not healthy love — learn the difference. Don\'t try to control children or creative outcomes. Let the intensity flow through you into your art rather than directing it at other people.',
    source: 'Mary Fortier Shea',
  },
  6: {
    title: 'Health Crisis as Catalyst',
    overview: 'Pluto in the 6th house uses health issues as transformation catalysts. A diagnosis, surgery, or health scare fundamentally changes how you live. Work environments involve power struggles or complete overhaul.',
    practical: 'Healing crisis that leads to lifestyle transformation. Surgery or intensive treatment. Workplace power politics. Becoming passionate about health, nutrition, or fitness. Healing others through deep, transformative work. Eliminating everything toxic from daily life.',
    caution: 'Don\'t ignore health warnings — Pluto in the 6th doesn\'t bluff. Workplace power struggles require strategic thinking, not emotional reaction. The crisis IS the healing — work with it, not against it.',
    source: 'Mary Fortier Shea',
  },
  7: {
    title: 'Relationship Metamorphosis',
    overview: 'Pluto in the 7th house transforms partnerships through intensity, power struggles, and deep psychological confrontation. Relationships that survive become unbreakable. Those that don\'t were already dying.',
    practical: 'Intense couples therapy or relationship renegotiation. Meeting someone who changes your life. Business partnerships involving power dynamics. Legal battles. Projecting your shadow onto partners — then having to own it.',
    caution: 'Don\'t try to control your partner. Don\'t stay in a relationship powered by fear rather than love. The transformation is about becoming an EQUAL partner — neither dominant nor submissive.',
    source: 'Mary Fortier Shea',
  },
  8: {
    title: 'The Phoenix Year',
    overview: 'Pluto in its natural house is at maximum intensity. Death and rebirth themes dominate — not necessarily literal death, but the complete end of a chapter in your life. Shared resources, intimacy, and psychological depth reach extremes.',
    practical: 'Major financial transformation through inheritance, insurance, or debt. Deep therapy or shamanic work. Sexual healing. Confronting mortality directly. Power over shared resources shifts. Research into hidden or taboo subjects.',
    caution: 'This is the most intense Pluto placement. Professional psychological support is strongly recommended. Don\'t go through the underworld alone. The rebirth on the other side is profound, but the journey is not for the faint-hearted.',
    source: 'Mary Fortier Shea',
  },
  9: {
    title: 'Belief System Demolition & Rebirth',
    overview: 'Pluto in the 9th house destroys outdated belief systems and replaces them with hard-won wisdom. Your philosophy of life, religious views, and understanding of truth undergo radical transformation.',
    practical: 'Leaving a religion or finding a deeper faith. Transformative travel experiences. Legal power struggles. Publishing work that challenges the status quo. Higher education that changes your worldview completely. Meeting a teacher who transforms your thinking.',
    caution: 'Don\'t become a zealot for your new beliefs. The transformation of worldview is genuine, but proselytizing alienates others. Let your changed life be the evidence, not your arguments.',
    source: 'Mary Fortier Shea',
  },
  10: {
    title: 'Career Death & Rebirth',
    overview: 'Pluto in the 10th house transforms your career, public image, and life direction at the deepest level. You may leave a career entirely, expose corruption, or rise to unprecedented power. Nothing about your professional life stays the same.',
    practical: 'Career transformation — sometimes forced by external circumstances. Power struggles with bosses or authority. Whistleblowing or exposure of workplace corruption. Becoming an authority in your field. Public recognition for transformative work.',
    caution: 'Power corrupts — if you rise, stay ethical. If you fall, it\'s clearing the ground for something more authentic. Don\'t make enemies unnecessarily — Pluto in the 10th makes everything public.',
    source: 'Mary Fortier Shea',
  },
  11: {
    title: 'Social Power & Group Transformation',
    overview: 'Pluto in the 11th house transforms your social circle and your vision for the future. You may join powerful groups, become a leader in a cause, or discover that your "tribe" has been toxic all along.',
    practical: 'Joining organizations focused on social transformation. Friendships that are intense and life-changing. Leaving groups that no longer align with your evolution. Becoming a leader or power player in community. Your long-term goals undergo radical revision.',
    caution: 'Group dynamics can become manipulative — stay aware. Don\'t let a charismatic group leader override your own judgment. The friendships formed now are deep and lasting, but they require honesty.',
    source: 'Mary Fortier Shea',
  },
  12: {
    title: 'The Deepest Dive',
    overview: 'Pluto in the 12th house brings transformation from the deepest unconscious levels. This is shamanic territory — the old self dissolves in the invisible realm before a new self can emerge. Dreams, therapy, and solitude are the laboratories.',
    practical: 'Profound dream work, past-life exploration, or depth psychology. Confronting addictions or self-sabotage patterns. Working with marginalized populations. Hidden power dynamics surface. Psychic abilities intensify. A period of withdrawal before rebirth.',
    caution: 'This placement can feel like losing your mind — it\'s actually losing your ego, which feels the same but isn\'t. Professional support is essential. Don\'t isolate completely. The transformation happening in the dark will eventually reach the light.',
    source: 'Mary Fortier Shea',
  },
};

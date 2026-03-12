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

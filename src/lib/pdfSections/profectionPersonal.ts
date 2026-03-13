import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { P } from '@/components/SolarReturnPDFExport';

/** Detailed personal profection year + time lord analysis */

const HOUSE_RULER_SIGN: Record<number, string> = {
  1: 'your natal 1st house cusp sign',
  2: 'your natal 2nd house cusp sign',
  3: 'your natal 3rd house cusp sign',
  4: 'your natal 4th house cusp sign',
  5: 'your natal 5th house cusp sign',
  6: 'your natal 6th house cusp sign',
  7: 'your natal 7th house cusp sign',
  8: 'your natal 8th house cusp sign',
  9: 'your natal 9th house cusp sign',
  10: 'your natal 10th house cusp sign',
  11: 'your natal 11th house cusp sign',
  12: 'your natal 12th house cusp sign',
};

const PROFECTION_DEEP: Record<number, string> = {
  1: 'House 1 profection years are the most personal. Your body, appearance, health, and sense of identity are the focal point. You may feel compelled to change how you look, how you present yourself, or fundamentally who you are. Decisions made this year have outsized personal impact — this is YOUR year to define YOUR direction. Physical health may demand attention. First impressions carry more weight than usual.',
  2: 'House 2 profection years center on money, material security, and self-worth. Income may change — up or down. Financial decisions made this year set the tone for the next several years. More importantly, you are being asked to examine what you VALUE — not just monetarily, but what is genuinely worth your time, energy, and emotional investment. Self-worth issues that have been simmering will surface and demand resolution.',
  3: 'House 3 profection years activate your mind, communication, and immediate environment. You may write more, teach, learn something new, or have conversations that reshape your perspective. Sibling relationships may become more prominent. Short trips, daily routines, and your neighborhood or local community become unexpectedly significant. The way you THINK is the way you live this year.',
  4: 'House 4 profection years bring focus to home, family, roots, and emotional foundations. You may move, renovate, or deal with family dynamics that require your full attention. This is a foundational year — what you build (or repair) at the root level affects everything else. Your relationship with a parent may shift. Questions about where you belong and what "home" truly means are central.',
  5: 'House 5 profection years activate creativity, romance, children, and self-expression. This is a year where you are asked to CREATE — whether through art, a project, a relationship, or literally through parenthood. Joy and pleasure are not optional; they are the curriculum. Risk-taking is required, but it must be CREATIVE risk, not reckless. Dating, performing, teaching, artistic projects, and anything that requires you to put yourself out there are the themes. If you have children, they may be a primary focus. The 5th house is where we discover what makes us come alive — and this year demands you find out.',
  6: 'House 6 profection years focus on daily routines, physical health, and work. The mundane is the spiritual path this year. Your body is sending messages — listen to them. Work may require reorganization or improvement. This is not a year for grand gestures but for building sustainable systems. Health check-ups, exercise routines, and dietary changes initiated now have lasting impact.',
  7: 'House 7 profection years are defined by partnerships and one-on-one relationships. If single, you may meet someone significant. If partnered, the relationship demands a new level of engagement. Business partnerships and legal matters are also activated. The lesson: how you show up in close relationships determines the quality of your entire year.',
  8: 'House 8 profection years bring intensity, transformation, and encounters with shared resources. Joint finances, debts, inheritances, and other people\'s money are in focus. Psychologically, something needs to die — a pattern, a belief, a way of being — so something authentic can emerge. Therapy is especially productive. Intimacy deepens or reveals its absence.',
  9: 'House 9 profection years expand your world through travel, education, publishing, or philosophical exploration. Your current worldview is too small — this year stretches it. Legal matters, international connections, and higher learning are activated. The search for MEANING drives decisions. You are being asked to believe in something bigger than your daily routine.',
  10: 'House 10 profection years put career, public reputation, and legacy in the spotlight. Professional responsibilities increase but so does recognition. You are more visible than usual — what you produce this year is seen and judged by a wider audience. Authority figures play a role. The question: what do you want to be known for?',
  11: 'House 11 profection years activate friendships, community, and collective purpose. Your social circle is being restructured — some friendships deepen while others naturally end. Group involvement, causes, and shared visions are the classroom. The quality of your friendships directly affects the quality of your year.',
  12: 'House 12 profection years are the most deeply internal. Solitude, spiritual practice, and unconscious patterns are the focus. You may feel more tired, more introspective, or more drawn to retreat. Dreams may be vivid and meaningful. This is a completion year — tying loose ends before the next cycle begins at House 1. Rest is not laziness; it is preparation.',
};

const TIME_LORD_DEEP: Record<string, string> = {
  Sun: 'The Sun as your Time Lord means your IDENTITY is the story of the year. Everything that happens filters through the question: who am I becoming? You will feel more visible, more scrutinized, and more creatively alive. Authority — both your own and others\' authority over you — is a running theme. Vitality and health are tied to how aligned you feel with your purpose. When the Sun is Time Lord, ego work is the assignment: not shrinking it, not inflating it, but making it accurate.',
  Moon: 'The Moon as your Time Lord makes this fundamentally an EMOTIONAL year. Your feelings are the primary navigation system. Intuition is louder but so is reactivity. Home, family, mother figures, and nurturing relationships dominate. You may feel more vulnerable, more nostalgic, or more aware of your emotional needs. The body responds to emotional states more directly than usual — what you feel, you feel physically. Nourishment in all forms is the key.',
  Mercury: 'Mercury as your Time Lord puts your MIND at the center of everything. How you think, communicate, learn, and process information determines the quality of the year. Conversations carry more weight. Contracts, negotiations, and written communication require extra attention. This is an excellent year for studying, writing, or developing any intellectual skill. If Mercury is retrograde in the SR chart, there is a built-in "review and revise" quality — old ideas, unfinished writing, or past conversations may hold the breakthrough.',
  Venus: 'Venus as your Time Lord makes this a year about LOVE, VALUES, and BEAUTY. Relationships — romantic, artistic, financial — are the primary arena. What you love and how you love are being examined. Financial patterns reflect value patterns: how you spend reveals what you actually care about. Aesthetic sensitivity is heightened. If Venus is well-aspected, the year has a quality of grace and ease. If challenged, relationships and finances test your boundaries.',
  Mars: 'Mars as your Time Lord brings raw ENERGY, DRIVE, and potentially CONFLICT. You have more fuel than usual — the question is how you channel it. Physical activity, competitive situations, and bold initiatives are favored. Anger surfaces faster but so does courage. This is a year where passivity is punished and action is rewarded. The shadow: aggression, impulsiveness, or burning through energy without strategy. Channel the fire.',
  Jupiter: 'Jupiter as your Time Lord is traditionally considered fortunate — expansion, opportunity, and growth are the themes. Something in your life is ready to get bigger: a career, a relationship, a worldview, a bank account. The danger is overcommitment, overoptimism, or saying yes to everything because everything seems possible. Jupiter rewards faith but punishes arrogance. Travel, education, and publishing are favored. Generosity — given and received — opens doors.',
  Saturn: 'Saturn as your Time Lord signals a SERIOUS year. This is not a punishment — it is a promotion that comes with a test. Saturn years are when structures are tested: if what you have built is real, it gets stronger. If it is superficial, it collapses. Responsibilities increase. Shortcuts fail spectacularly. Authority figures make demands. Your relationship with time, discipline, and maturity is being examined. The reward for doing the hard work — the real work, not performative effort — is lasting achievement that no one can take from you. Saturn years are often remembered as the years when life got real.',
  Uranus: 'Uranus as your Time Lord brings DISRUPTION, INNOVATION, and sudden change. Plans made before this year may be overturned. Expect the unexpected — and learn to work with it rather than against it. Freedom and independence become non-negotiable needs. Relationships or structures that feel confining may break suddenly. The gift: breakthroughs, original ideas, and liberation from patterns that were holding you back.',
  Neptune: 'Neptune as your Time Lord dissolves boundaries between the real and the imagined. Creativity and intuition are heightened but so is confusion. Dreams may be vivid and meaningful. Spiritual experiences are more accessible. The danger: self-deception, escapism, or difficulty distinguishing what you want to be true from what IS true. Artistic and healing pursuits are favored. Boundaries need conscious maintenance.',
  Pluto: 'Pluto as your Time Lord brings deep TRANSFORMATION and encounters with power. Something in your life is being fundamentally restructured — a relationship, a career, a psychological pattern. Resistance to the change makes it harder. Surrender to the process makes it productive. Power dynamics in relationships are unavoidable. Therapy, depth psychology, and shadow work are especially effective.',
};

export function generateProfectionPersonalSection(
  ctx: PDFContext, doc: jsPDF,
  houseNumber: number, timeLord: string, age: number,
  timeLordSRHouse: number | null, timeLordSRSign: string
) {
  const { colors } = ctx;

  // YOUR PROFECTION YEAR — WHAT IT MEANS FOR YOU
  ctx.sectionTitle(doc, 'Your Profection Year — What To Expect');

  // House deep dive
  ctx.drawCard(doc, () => {
    ctx.writeBold(doc, `House ${houseNumber} Profection Year (Age ${age})`, colors.gold, 12);
    ctx.y += 4;
    if (PROFECTION_DEEP[houseNumber]) {
      ctx.writeBody(doc, PROFECTION_DEEP[houseNumber], colors.bodyText, 10, 14);
    }
  });

  // WHY is this planet the Time Lord
  ctx.checkPage(200);
  ctx.drawCard(doc, () => {
    const tlName = P[timeLord] || timeLord;
    ctx.writeBold(doc, `Why ${tlName} Is Your Time Lord`, colors.gold, 12);
    ctx.y += 4;
    ctx.writeBody(doc, `Your natal ${houseNumber}${houseNumber === 1 ? 'st' : houseNumber === 2 ? 'nd' : houseNumber === 3 ? 'rd' : 'th'} house cusp falls in a sign ruled by ${tlName}. In Hellenistic astrology, the planet that rules the sign on your activated profection house cusp becomes the "Time Lord" — the planet whose agenda dominates the year. Every transit to ${tlName}, every aspect involving ${tlName}, and ${tlName}'s condition in both your natal and Solar Return charts carry amplified significance.`, colors.bodyText, 10, 14);
  });

  // Time Lord detailed meaning
  ctx.checkPage(200);
  ctx.drawCard(doc, () => {
    const tlName = P[timeLord] || timeLord;
    ctx.writeBold(doc, `${tlName} as Time Lord — Your Year in Detail`, colors.gold, 12);
    ctx.y += 4;
    if (TIME_LORD_DEEP[timeLord]) {
      ctx.writeBody(doc, TIME_LORD_DEEP[timeLord], colors.bodyText, 10, 14);
    }
    // Where the Time Lord is in the SR chart
    if (timeLordSRHouse && timeLordSRSign) {
      ctx.y += 6;
      ctx.writeCardSection(doc, `${tlName} in SR House ${timeLordSRHouse} (${timeLordSRSign})`,
        `Your Time Lord currently sits in the Solar Return ${timeLordSRHouse}${timeLordSRHouse === 1 ? 'st' : timeLordSRHouse === 2 ? 'nd' : timeLordSRHouse === 3 ? 'rd' : 'th'} house in ${timeLordSRSign}. This means the Time Lord's agenda — the themes described above — plays out primarily through ${timeLordSRHouse === 1 ? 'your identity and personal presentation' : timeLordSRHouse === 2 ? 'finances and values' : timeLordSRHouse === 3 ? 'communication and learning' : timeLordSRHouse === 4 ? 'home and family' : timeLordSRHouse === 5 ? 'creativity, romance, and self-expression' : timeLordSRHouse === 6 ? 'daily routines and health' : timeLordSRHouse === 7 ? 'partnerships and relationships' : timeLordSRHouse === 8 ? 'transformation and shared resources' : timeLordSRHouse === 9 ? 'travel, education, and beliefs' : timeLordSRHouse === 10 ? 'career and public reputation' : timeLordSRHouse === 11 ? 'friendships and community' : 'solitude and inner work'}.`,
        colors.accentGreen);
    }
  });
}

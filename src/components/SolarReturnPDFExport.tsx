import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';
import { Download, Loader2 } from 'lucide-react';
import { vertexInSign } from '@/lib/solarReturnVertex';
import { srJupiterInHouseDeep, srMercuryInHouseDeep, srVenusInHouseDeep, srMarsInHouseDeep, srSaturnInHouseDeep, srUranusInHouseDeep, srNeptuneInHouseDeep, srPlutoInHouseDeep } from '@/lib/solarReturnPlanetInHouseDeep';
import { generateSRtoNatalInterpretation, planetLifeMeanings } from '@/lib/solarReturnAspectInterp';
import { useState } from 'react';
import { moonSignDeep, moonShiftNarrative } from '@/lib/moonSignShiftData';
import { generatePDFCover } from '@/lib/pdfSections/cover';
import { generatePDFTableOfContents, addTOCLinks } from '@/lib/pdfSections/tableOfContents';
import { generatePDFYearAtAGlance } from '@/lib/pdfSections/yearAtAGlance';
import { drawProfectionWheel } from '@/lib/pdfSections/profectionWheel';
import { PDFContext, createPDFContext } from '@/lib/pdfSections/pdfContext';
import { signColorThemes } from '@/lib/pdfSections/signColorThemes';
import { generateStrengthsPortrait } from '@/lib/pdfSections/strengthsPortrait';
import { generateHighlightsPage } from '@/lib/pdfSections/highlightsAndForecasts';
import { generateAffirmationCard } from '@/lib/pdfSections/affirmationCard';
import { generateHowToReadPage } from '@/lib/pdfSections/howToRead';
import { generateProfectionPersonalSection } from '@/lib/pdfSections/profectionPersonal';
import { generateKeyDatesSection } from '@/lib/pdfSections/keyDates';
import { generateQuarterlySummary } from '@/lib/pdfSections/quarterlySummary';
import { generateTier1SolarReturnPDF } from '@/lib/pdfSections/tier1Report';

// Cake image imports
import cakeAries from '@/assets/cakes/aries.png';
import cakeTaurus from '@/assets/cakes/taurus.png';
import cakeGemini from '@/assets/cakes/gemini.png';
import cakeCancer from '@/assets/cakes/cancer.png';
import cakeLeo from '@/assets/cakes/leo.png';
import cakeVirgo from '@/assets/cakes/virgo.png';
import cakeLibra from '@/assets/cakes/libra.png';
import cakeScorpio from '@/assets/cakes/scorpio.png';
import cakeSagittarius from '@/assets/cakes/sagittarius.png';
import cakeCapricorn from '@/assets/cakes/capricorn.png';
import cakeAquarius from '@/assets/cakes/aquarius.png';
import cakePisces from '@/assets/cakes/pisces.png';

export const CAKE_IMAGES: Record<string, string> = {
  Aries: cakeAries, Taurus: cakeTaurus, Gemini: cakeGemini, Cancer: cakeCancer,
  Leo: cakeLeo, Virgo: cakeVirgo, Libra: cakeLibra, Scorpio: cakeScorpio,
  Sagittarius: cakeSagittarius, Capricorn: cakeCapricorn, Aquarius: cakeAquarius, Pisces: cakePisces,
};

export const P: Record<string, string> = {
  Sun: 'Sun', Moon: 'Moon', Mercury: 'Mercury', Venus: 'Venus', Mars: 'Mars',
  Jupiter: 'Jupiter', Saturn: 'Saturn', Uranus: 'Uranus', Neptune: 'Neptune', Pluto: 'Pluto',
  Chiron: 'Chiron', NorthNode: 'N.Node', SouthNode: 'S.Node', Ascendant: 'ASC',
  Juno: 'Juno', Ceres: 'Ceres', Pallas: 'Pallas', Vesta: 'Vesta', Lilith: 'Lilith',
};

export const S: Record<string, string> = {
  Aries: 'Ari', Taurus: 'Tau', Gemini: 'Gem', Cancer: 'Can', Leo: 'Leo', Virgo: 'Vir',
  Libra: 'Lib', Scorpio: 'Sco', Sagittarius: 'Sag', Capricorn: 'Cap', Aquarius: 'Aqu', Pisces: 'Pis',
};

export const MOON_PHASE_EXPLANATIONS: Record<string, string> = {
  'New Moon': 'Fresh start energy. A year of planting seeds and beginning new chapters. Act on impulse toward what feels genuinely alive.',
  'Waxing Crescent': 'Gathering momentum. Push through doubt. This year rewards early effort and showing up before you feel ready.',
  'First Quarter': 'Crisis of action. Decisions are required — sitting on the fence creates more stress than choosing.',
  'Waxing Gibbous': 'Refining and adjusting. The gap between where you are and where you want to be is productive. Edit, don\'t scrap.',
  'Full Moon': 'Peak illumination. Everything becomes visible — relationships, results, truths. Culmination of something that began years ago.',
  'Waning Gibbous': 'Time to teach and share. Generosity opens unexpected doors. You have something the world needs.',
  'Last Quarter': 'Old structures that no longer serve you become intolerable. The discomfort is pushing you to evolve.',
  'Balsamic': 'Completion phase. The Sun-Moon cycle is ending, and a new one begins next year. Balsamic years are historically associated with tying up unfinished business, releasing what no longer serves the next chapter, and consolidating lessons from the past several years. Energy is lower — not because something is wrong, but because the system is preparing for a reset. Practically: finish projects rather than starting new ones, reduce overcommitments, and make space. The Balsamic phase precedes a New Moon year, which will bring fresh momentum.',
  'Balsamic Moon': 'Completion phase. The Sun-Moon cycle is ending, and a new one begins next year. Balsamic years are historically associated with tying up unfinished business, releasing what no longer serves the next chapter, and consolidating lessons from the past several years. Energy is lower — not because something is wrong, but because the system is preparing for a reset. Practically: finish projects rather than starting new ones, reduce overcommitments, and make space. The Balsamic phase precedes a New Moon year, which will bring fresh momentum.',
};

export const stelliumPlanetRoles: Record<string, string> = {
  Sun: 'your core identity and sense of purpose',
  Moon: 'your emotional needs and instinctive reactions',
  Mercury: 'how you think, communicate, and process information',
  Venus: 'what you love, value, and find beautiful',
  Mars: 'your drive, ambition, and how you assert yourself',
  Jupiter: 'where you expand, grow, and find opportunity',
  Saturn: 'where you face limits, responsibility, and mastery',
  Uranus: 'where you rebel, innovate, and break free',
  Neptune: 'where you dream, dissolve boundaries, and access intuition',
  Pluto: 'where deep transformation and power dynamics play out',
  Chiron: 'your deepest wound and greatest healing gift',
  NorthNode: 'your soul\'s growth direction this lifetime',
};

export const stelliumHouseMeaning: Record<number, string> = {
  1: 'This is YOUR year. Your identity, body, and personal direction are being completely rewired. You may change your appearance, take bold action, or feel an irresistible urge to reinvent yourself.',
  2: 'Money, possessions, and self-worth are consuming your attention. Financial decisions carry enormous weight. You are being forced to answer: what do I actually VALUE?',
  3: 'Your mind is on fire. Communication, learning, writing, and daily connections absorb most of your energy. Expect more conversations that change your perspective.',
  4: 'Home and family dominate. You may move, renovate, deal with family issues, or feel a powerful pull to nest. What does "home" really mean to you?',
  5: 'Creative self-expression, romance, and joy are center stage. Multiple planets here demand you PLAY, create, and take emotional risks.',
  6: 'Daily routines, health, and work are being overhauled. Your body is sending messages — listen to them. Small daily changes create the biggest transformation.',
  7: 'Relationships are the main event. Partnerships demand your full attention. The lesson: balancing your needs with someone else\'s.',
  8: 'Deep transformation, shared finances, and psychological intensity define this year. Something needs to die so something authentic can be born.',
  9: 'Your worldview is expanding. Travel, education, publishing, and philosophical exploration absorb your energy. You are searching for MEANING.',
  10: 'Career and public reputation are being forged. The world is watching. Professional responsibilities increase, but so does recognition.',
  11: 'Community, friendships, and collective purpose are center stage. Your social circle is being reshuffled.',
  12: 'The most deeply private year possible. Inner work, spiritual exploration, and solitude are the assignment. Dreams may be vivid, intuition heightened.',
};

export const timeLordDetailedMeaning: Record<string, string> = {
  Sun: 'The Sun as Time Lord puts your IDENTITY center stage. This year is about YOU — your confidence, your creativity, your sense of purpose. You will feel more visible, more scrutinized, and more alive.',
  Moon: 'The Moon as Time Lord makes this an EMOTIONAL year. Your feelings are running the show. Intuition is stronger but so is reactivity. Home, family, and nurturing relationships dominate.',
  Mercury: 'Mercury as Time Lord makes your MIND the main character. How you think, communicate, and process information determines everything this year. Conversations, writing, contracts, and learning are amplified. When Mercury is your Time Lord AND retrograde in the SR chart, the year has a built-in "review and revise" quality — ideas from the past may hold the key to breakthroughs.',
  Venus: 'Venus as Time Lord makes this a year about RELATIONSHIPS, VALUES, and PLEASURE. What you love, who you love, and how you spend your money are all being examined. The question: does your daily life reflect what you actually value?',
  Mars: 'Mars as Time Lord brings ENERGY, DRIVE, and potentially CONFLICT. You have more fuel than usual — channel it into projects, exercise, or bold moves. The question: what are you fighting for, and is it worth it?',
  Jupiter: 'Jupiter as Time Lord is a gift — expansion, opportunity, and optimism. Something in your life is ready to grow. The danger: overcommitment or saying yes to everything.',
  Saturn: 'Saturn as Time Lord means this year is SERIOUS. Responsibilities increase. Structures you have been building are tested. Shortcuts fail. What is real survives; what is superficial collapses. The reward for doing the work: lasting achievement.',
};

export const stelliumSignMeaning: Record<string, string> = {
  'Aries': 'Identity rebuilt from scratch. Everything feels personal. Decisions faster but need impulse control.',
  'Taurus': 'Material reality dominates — money, body, possessions. Build slowly; not a year for shortcuts.',
  'Gemini': 'Mind is the main character. Learning, communicating, networking dominate.',
  'Cancer': 'Home, family, emotional foundations. Emotional world is the priority.',
  'Leo': 'Creative self-expression and visibility. Step into the spotlight.',
  'Virgo': 'Systems, health, daily function under review. Master the mundane.',
  'Libra': 'Relationships and balance of giving and receiving.',
  'Scorpio': 'Power dynamics, financial entanglements, transformation.',
  'Sagittarius': 'Expand your world. Searching for MEANING in work, beliefs, life direction.',
  'Capricorn': 'Ambition, authority, lasting structures. Career and reputation are priority.',
  'Aquarius': 'Your place in the collective. Friendships, groups, technology become central.',
  'Pisces': 'Boundaries dissolve. Creativity, spirituality, healing dominate.',
};

export const stelliumFeltSense: Record<string, string> = {
  'Aries': 'Restless energy, constant urge to START. Patience drops. Courage surges.',
  'Taurus': 'Deep craving for stability and sensory pleasure. Body wants comfort and security.',
  'Gemini': 'Mental overstimulation, racing thoughts. Mind has 40 tabs open.',
  'Cancer': 'Emotional waves, sensitivity to atmosphere. Gut tells you things before your mind catches up.',
  'Leo': 'Warm expansion in your chest, need to create and be seen.',
  'Virgo': 'Tension in stomach and shoulders, compulsion to organize and perfect.',
  'Libra': 'Heightened sensitivity to discord. Crave harmony in environment and relationships.',
  'Scorpio': 'Intensity in your gut, magnetic pull toward hidden truths.',
  'Sagittarius': 'Restlessness in your legs, urge to GO somewhere and learn something.',
  'Capricorn': 'Weight on shoulders, sobering awareness of time and responsibility.',
  'Aquarius': 'Electric buzzing under your skin, sudden insights, urge to break free.',
  'Pisces': 'Dissolving of normal boundaries, heightened empathy, vivid dreams.',
};

export const saturnHouseMeaning: Record<number, string> = {
  1: 'YOU are the project. Your body, appearance, and sense of self are being restructured from the ground up. You feel heavier, more serious, older. Others may perceive you as more authoritative. Health demands attention — dental work, bones, skin, chronic issues. The gift: genuine self-authority that no one can take from you. The test: doing the hard inner work instead of performing confidence.',
  2: 'Finances, values, and self-worth are under Saturn\'s microscope. You may earn less, spend more carefully, or face financial limits that force you to distinguish needs from wants. The real lesson: what you genuinely value vs. what you spend on out of habit or anxiety. Building a real budget, paying off debt, or establishing financial independence are the assignments.',
  3: 'Communication requires more effort and carries more weight. You may struggle to express yourself clearly, deal with difficult conversations, or face a demanding learning curve. Sibling or neighbor relationships may feel strained. The growth: learning to say what matters with precision and authority.',
  4: 'Home and family are the classroom. You may renovate, move, deal with aging parents, or confront deep family patterns that have shaped you. The domestic sphere feels heavy but productive. Building real emotional foundations — not just decorating the surface — is the assignment.',
  5: 'Creativity, romance, and fun require WORK. Joy doesn\'t come easily — spontaneity feels blocked. Dating is serious, creative projects need discipline, and your relationship to pleasure is being matured. Children may demand more responsibility. The reward: creative output with real substance and lasting relationships built on reality.',
  6: 'Daily routines, work habits, and health are being restructured. Bad habits catch up. The body insists on better care. Work may feel burdensome or demand systems you\'ve been avoiding. Building sustainable health practices and efficient work systems is the assignment.',
  7: 'Partnerships are tested. Relationships lacking real commitment or genuine reciprocity may end. Solid partnerships deepen through shared struggle. You may attract a more serious partner, or an existing partner becomes more demanding. The lesson: what does real partnership actually require?',
  8: 'Deep transformation. Shared finances, debts, inheritances, and psychological patterns are under review. Power dynamics in intimate relationships demand honest reckoning. Therapy works harder this year. The area where you\'ve been avoiding depth is exactly where Saturn insists you go.',
  9: 'Beliefs are tested against reality. Higher education demands serious commitment. Travel may be restricted or purposeful rather than recreational. You are being asked: do you actually believe what you say you believe?',
  10: 'Career and professional reputation are THE priority. Responsibilities increase — you may be promoted, scrutinized, or given more authority than you feel ready for. Professional standards are higher. The world is watching. Build something real.',
  11: 'Friendships restructured. Fair-weather friends fall away. The groups you belong to either prove their worth or become obligations. You may feel isolated or take on leadership. Quality over quantity in every social connection.',
  12: 'The most deeply internal Saturn placement. Unconscious patterns, hidden fears, and spiritual foundations are under review. Solitude may be imposed. Dreams may be heavy. Therapy, meditation, and inner work are productive but demanding.',
};

export const nodeHouseMeaning: Record<number, string> = {
  1: 'Growth edge: SELF-assertion. Your soul is being pulled toward independence and defining yourself on your own terms. Stop deferring to others. The universe rewards you every time you choose yourself — not selfishly, but authentically. What do YOU want?',
  2: 'Growth: building financial independence and clarifying your values. What is worth your time, money, and energy? Stop borrowing from others\' value systems. Develop your own resources and trust your own worth.',
  3: 'Growth: communication, learning, and intellectual curiosity. Speak up. Write. Teach. Ask questions. The growth happens in everyday conversations, not grand gestures. Your local environment holds the lessons.',
  4: 'Growth: home, family, emotional foundations. Put down roots — emotionally and literally. Stop chasing external achievement at the expense of inner security. What does "home" mean to you on a soul level?',
  5: 'Growth: creative self-expression, romance, and taking emotional risks. Stop playing it safe. Create something. Love someone. Let yourself be seen in your joy and your vulnerability.',
  6: 'Growth: daily habits, health, and service to others. Mastery of the mundane IS the spiritual path this year. Your body is your teacher. Build routines that actually serve your wellbeing.',
  7: 'Growth: partnership, collaboration, and learning to receive. Stop doing everything alone. The lesson is in the mirror of relationship — what a committed other shows you about yourself.',
  8: 'Growth: emotional depth, shared vulnerability, and letting someone truly know you. Intimacy requires surrender. Financial entanglements teach you about trust. Let something old die so something real can live.',
  9: 'Growth: expanding your worldview through travel, education, or encounter with the unfamiliar. Your current perspective is too small. Something out there — a place, an idea, a teacher — will crack you open.',
  10: 'Growth: stepping into authority and accepting public responsibility. You are being called to lead, to build, to create a legacy. Stop hiding behind others\' authority.',
  11: 'Growth: community, friendship, and collective purpose. Your individual ambitions are being redirected toward something larger. Find your people. Contribute to a cause bigger than yourself.',
  12: 'Growth: surrender, release, and spiritual trust. The ego\'s agenda is being dissolved — not destroyed, but softened. Meditation, dreams, and quiet contemplation reveal what striving cannot.',
};

// ─── How This Year Meets You (v3 section) ───────────────────────────
import type jsPDF from 'jspdf';

const HTYM_SUN_BODY: Record<number, string> = {
  1: 'Your core identity is being refreshed and redefined. People see a more authentic version of you emerging — the year amplifies who you really are. The 1st house placement puts you at the center of your own story.',
  2: 'Your energy this year flows toward finances, possessions, and defining what you truly value. The 2nd house Sun draws attention to material security and self-worth in practical, tangible ways.',
  3: 'Your mind and voice are the main characters. The 3rd house Sun activates learning, communication, writing, and everyday connections. Ideas carry unusual weight this year.',
  4: 'Home, family, and emotional roots demand your full attention. The 4th house Sun turns energy inward — toward ancestry, domestic life, and the foundations that hold everything else together.',
  5: 'Joy, creativity, and self-expression light up this year. The 5th house Sun invites you to play, create, and take emotional risks. Romance and children may also feature prominently.',
  6: 'Daily routines, health, and work efficiency are being restructured. The 6th house Sun asks you to refine the mundane — small, consistent changes produce the biggest results this year.',
  7: 'Relationships define this year. The 7th house Sun places partnerships — romantic, business, or creative — at the center. Growth happens through the mirror of another person.',
  8: 'Transformation runs deep. The 8th house Sun activates shared resources, psychological depth, and emotional honesty. Something old must end for something authentic to begin.',
  9: 'Your world is expanding through travel, education, or a fundamental shift in perspective. The 9th house Sun seeks meaning beyond the familiar — philosophy, culture, and big-picture thinking.',
  10: 'Career and public reputation are the priority. The 10th house Sun makes you more visible — professional responsibilities increase, but so does recognition and authority.',
  11: 'Community, friendship, and collective purpose shape the year. The 11th house Sun redirects personal ambition toward something larger — your social circle is being restructured.',
  12: 'The most introspective placement. The 12th house Sun turns energy toward solitude, spiritual practice, and unconscious patterns. Rest and inner work are not extras — they are the curriculum.',
};

const HTYM_MOON_BODY: Record<string, string> = {
  Aries: 'Your emotional landscape shifts toward directness and independence. Where your natal Moon processes feelings in its familiar way, this year the emotional body wants action, speed, and autonomy.',
  Taurus: 'Your emotional world this year craves stability, comfort, and sensory grounding. The shift is toward patience — feelings are processed slowly and deliberately.',
  Gemini: 'Your emotional processing becomes more verbal and social. You think through feelings rather than sitting with them — conversation and writing become emotional outlets.',
  Cancer: 'Your emotional world deepens significantly. Sensitivity increases, intuition sharpens, and the need for emotional safety becomes non-negotiable.',
  Leo: 'Your emotional world warms and expands. The need to feel seen, appreciated, and creatively expressed intensifies. Heart-centered decisions carry more weight.',
  Virgo: 'Your emotional processing becomes more analytical and service-oriented. Feelings are examined, organized, and channeled into practical improvements.',
  Libra: 'Your emotional world seeks balance and harmony. Relationship dynamics color everything — discord feels more disruptive, and the pull toward partnership strengthens.',
  Scorpio: 'Your emotional world intensifies and deepens. Surface-level engagement becomes intolerable. The pull toward truth, transformation, and psychological depth is powerful.',
  Sagittarius: 'Your emotional world opens and lifts. Restlessness increases, optimism grows, and the need for meaning and adventure colors your inner life.',
  Capricorn: 'Your emotional world becomes more disciplined and pragmatic. Feelings are managed rather than indulged — emotional maturity deepens.',
  Aquarius: 'Your emotional processing becomes more detached and cerebral. You observe feelings from a slight distance, preferring clarity and independence over intensity.',
  Pisces: 'Your emotional world becomes fluid and permeable. Boundaries thin, empathy deepens, and the unconscious sends vivid signals through dreams and intuition.',
};

const HTYM_RISING_BODY: Record<string, string> = {
  Aries: 'Your public presence shifts toward boldness, directness, and initiative. Others perceive you as more courageous and action-oriented. The Aries Rising year energy favors starting things.',
  Taurus: 'Your public presence becomes more grounded, patient, and reliable. Others see stability in you — the Taurus Rising year rewards building slowly and deliberately.',
  Gemini: 'Your public presence becomes lighter, more curious, and verbally agile. The Gemini Rising year energy makes you a connector — ideas, people, and information flow through you.',
  Cancer: 'Your public presence softens and becomes more nurturing. Others feel safe in your company — the Cancer Rising year opens doors through emotional intelligence.',
  Leo: 'Your public presence becomes more visible, warm, and magnetic. The Leo Rising year demands that you step forward and let yourself be seen.',
  Virgo: 'Your public presence sharpens and becomes more purposeful. The Virgo Rising year rewards precision, competence, and attention to detail.',
  Libra: 'Your public presence becomes more diplomatic, graceful, and partnership-oriented. The Libra Rising year shapes your path through relationships more than solo ambition.',
  Scorpio: 'Your public presence deepens and becomes more intense. The Scorpio Rising year gives you a magnetic, transformative quality that others either gravitate toward or resist.',
  Sagittarius: 'Your public presence opens and expands. The Sagittarius Rising year rewards adventure, teaching, and philosophical engagement with the world.',
  Capricorn: 'Your public presence becomes more authoritative and focused. The Capricorn Rising year rewards ambition, structure, and taking on greater responsibility.',
  Aquarius: 'Your public presence becomes more independent and original. The Aquarius Rising year rewards unconventional thinking and trusting your own vision.',
  Pisces: 'Your public presence becomes gentler and more intuitive. The Pisces Rising year opens doors through compassion, creativity, and subtle connection.',
};

function generateHowThisYearMeetsYou(
  ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis,
  srChart: SolarReturnChart, natalChart: NatalChart,
) {
  const { margin, contentW, colors } = ctx;
  const natalSun = natalChart.planets?.Sun?.sign || '';
  const natalMoon = natalChart.planets?.Moon?.sign || '';
  const natalRising = natalChart.houseCusps?.house1?.sign || natalChart.planets?.Ascendant?.sign || '';
  const srSunSign = srChart.planets.Sun?.sign || natalSun;
  const srMoonSign = a.moonSign || srChart.planets.Moon?.sign || '';
  const srRisingSign = srChart.planets.Ascendant?.sign || a.yearlyTheme?.ascendantSign || '';
  const sunH = a.sunHouse?.house || 1;

  ctx.sectionTitle(doc, 'HOW THIS YEAR MEETS YOU', 'Natal vs Solar Return');

  // Intro
  doc.setFont('times', 'italic'); doc.setFontSize(9);
  doc.setTextColor(...colors.muted);
  const introLines: string[] = doc.splitTextToSize(
    'Your natal chart is who you are. Your Solar Return shows how this year\'s energy meets that.',
    contentW,
  );
  for (const l of introLines) { doc.text(l, margin, ctx.y); ctx.y += 13; }
  ctx.y += 8;

  const cards = [
    {
      label: 'YOUR SUN', natalTag: natalSun, srTag: `${srSunSign} · H${sunH}`,
      headline: `Your core self ${sunH === 1 ? 'takes center stage' : sunH === 7 ? 'meets itself through others' : sunH === 10 ? 'steps into the spotlight' : 'enters new territory'}`,
      body: HTYM_SUN_BODY[sunH] || 'Your energy is directed toward a new area of life this year.',
    },
    {
      label: 'YOUR MOON', natalTag: natalMoon, srTag: srMoonSign,
      headline: natalMoon === srMoonSign ? 'Your emotional world stays in familiar territory' : `Your emotional world shifts from ${natalMoon} to ${srMoonSign}`,
      body: HTYM_MOON_BODY[srMoonSign] || 'Your emotional world enters a new rhythm this year.',
    },
    {
      label: 'YOUR RISING', natalTag: natalRising, srTag: srRisingSign,
      headline: natalRising === srRisingSign ? 'Your natural presence amplifies' : `Your presence shifts from ${natalRising} to ${srRisingSign}`,
      body: HTYM_RISING_BODY[srRisingSign] || 'The way you show up in the world takes on a new quality.',
    },
  ];

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    ctx.checkPage(110);

    // Tracked caps label
    ctx.trackedLabel(doc, card.label, margin, ctx.y, { size: 7, charSpace: 3 });

    // Tags: natal → SR
    doc.setFont('times', 'normal'); doc.setFontSize(8);
    doc.setTextColor(...colors.muted);
    doc.text(`${card.natalTag}  →  ${card.srTag}`, margin + contentW, ctx.y, { align: 'right' });
    ctx.y += 12;

    // Headline
    doc.setFont('times', 'bold'); doc.setFontSize(11);
    doc.setTextColor(...colors.ink);
    const hlLines: string[] = doc.splitTextToSize(card.headline, contentW - 16);
    for (const hl of hlLines) { doc.text(hl, margin + 8, ctx.y); ctx.y += 14; }
    ctx.y += 4;

    // Body
    doc.setFont('times', 'normal'); doc.setFontSize(9);
    doc.setTextColor(...colors.ink);
    const bdLines: string[] = doc.splitTextToSize(card.body, contentW - 16);
    for (const bl of bdLines.slice(0, 4)) { doc.text(bl, margin + 8, ctx.y); ctx.y += 13; }
    ctx.y += 4;

    // Hairline rule
    doc.setDrawColor(...colors.rule); doc.setLineWidth(0.25);
    doc.line(margin, ctx.y, margin + contentW, ctx.y);
    ctx.y += 12;
  }
}

interface Props {
  analysis: SolarReturnAnalysis;
  srChart: SolarReturnChart;
  natalChart: NatalChart;
  narrative: string;
}

const MAJOR_BODIES = new Set(['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','NorthNode','SouthNode','Ascendant']);
const PLANET_ORDER = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','NorthNode'];
const SPOTLIGHT_ORDER = ['Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];

// Personalized stellium interpretation based on sign + house + planets
function getPersonalizedStelliumText(sign: string, house: number | null, planets: string[]): string {
  const planetNames = planets.map(p => P[p] || p).join(', ');
  const houseContext = house ? ` in your ${house}${house === 1 ? 'st' : house === 2 ? 'nd' : house === 3 ? 'rd' : 'th'} house` : '';
  
  const signPersonal: Record<string, string> = {
    'Aries': `With ${planetNames} clustered in Aries${houseContext}, your identity is being rebuilt from the ground up this year. Decisions come faster. Patience drops. Everything feels personal: career decisions feel like identity decisions, relationship conversations feel like self-definition moments. Your body may feel restless, charged, or like it needs to MOVE. The risk is impulsivity. The gift is courage you did not know you had.`,
    'Taurus': `With ${planetNames} clustered in Taurus${houseContext}, material reality is the main event. Your body, your bank account, your physical space — these are the arenas. You will feel a deep pull toward stability and things you can TOUCH. The challenge: resistance to necessary change. The gift: anything you build this year has staying power.`,
    'Gemini': `With ${planetNames} clustered in Gemini${houseContext}, your mind is the main character. You will feel mentally overstimulated — processing multiple streams of information, having conversations that shift your perspective. Writing, teaching, and networking are amplified. The challenge: scattered attention. The gift: ideas that connect dots no one else sees.`,
    'Cancer': `With ${planetNames} clustered in Cancer${houseContext}, home, family, and emotional foundations dominate. Gut instincts are louder, emotional reactions are stronger, and your need for safety is non-negotiable. Family dynamics may require your full attention. The challenge: mood swings and emotional overwhelm. The gift: deep emotional wisdom and the ability to create sanctuary.`,
    'Leo': `With ${planetNames} clustered in Leo${houseContext}, creative self-expression and visibility are the assignment. You will feel an expanding warmth, a need to CREATE and be SEEN. Whether through art, romance, children, or leadership — step forward. The challenge: needing external validation. The gift: authentic creative power that inspires.`,
    'Virgo': `With ${planetNames} clustered in Virgo${houseContext}, systems, health, and daily function are under review. You will feel a compulsion to organize, fix, and improve. Your analytical powers are at peak strength. The body sends clear messages. The challenge: paralysis through perfectionism. The gift: mastery of the practical.`,
    'Libra': `With ${planetNames} clustered in Libra${houseContext}, relationships and balance are central. You will feel heightened sensitivity to discord. Partnership decisions carry enormous weight. The challenge: people-pleasing. The gift: the ability to create genuine harmony.`,
    'Scorpio': `With ${planetNames} clustered in Scorpio${houseContext}, transformation and intensity define the year. You are pulled toward hidden truths and situations that demand depth. Surface-level engagement is not an option. The challenge: controlling tendencies. The gift: profound psychological insight and capacity for rebirth.`,
    'Sagittarius': `With ${planetNames} clustered in Sagittarius${houseContext}, your worldview is expanding. You will feel restlessness — a physical urge to GO, learn, find MEANING. Travel, education, and philosophical exploration absorb your energy. The challenge: overcommitting. The gift: breakthroughs in understanding.`,
    'Capricorn': `With ${planetNames} clustered in Capricorn${houseContext}, ambition, structure, and lasting achievement are the focus. You will feel the weight of responsibility — in your shoulders, jaw, and spine. Professional demands increase. The challenge: emotional suppression. The gift: building something that lasts.`,
    'Aquarius': `With ${planetNames} clustered in Aquarius${houseContext}, your place in the collective is being restructured. Sudden insights, unconventional ideas, and a pull toward innovation. The challenge: emotional detachment. The gift: original thinking that solves problems no one else can.`,
    'Pisces': `With ${planetNames} clustered in Pisces${houseContext}, your sensitivity is amplified — this does NOT mean your identity dissolves. It means you absorb the emotional frequency of every room. Creativity, intuition, and spiritual awareness are heightened. Dreams may be vivid and meaningful. The challenge: knowing which feelings are yours vs someone else's. Boundaries require conscious effort. The gift: access to compassion and creative vision most people never reach. Practically: you may need more solitude, and meditation or artistic expression become essential rather than optional.`,
  };
  
  return signPersonal[sign] || `${planetNames} are clustered in ${sign}${houseContext}, concentrating this year's energy into a focused area.`;
}

export const SolarReturnPDFExport = ({ analysis, srChart, natalChart, narrative }: Props) => {
  const [generating, setGenerating] = useState(false);
  const [generatingTier1, setGeneratingTier1] = useState(false);
  const [birthdayMode, setBirthdayMode] = useState(false);
  const [personalMessage, setPersonalMessage] = useState('');
  const [goldBorders, setGoldBorders] = useState(false);

  const generateTier1 = async () => {
    setGeneratingTier1(true);
    try {
      await generateTier1SolarReturnPDF(analysis, srChart, natalChart, birthdayMode, personalMessage, CAKE_IMAGES);
    } catch (err) {
      console.error('Tier 1 PDF error:', err);
    } finally {
      setGeneratingTier1(false);
    }
  };

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();
      const margin = 50;
      const contentW = pw - margin * 2;

      // Always apply sign-specific color theme keyed to NATAL SUN SIGN
      const sunSign = natalChart.planets?.Sun?.sign || '';
      const signTheme = sunSign ? signColorThemes[sunSign] : undefined;
      const ctx = createPDFContext(doc, pw, ph, margin, contentW, signTheme);

      // =============================================
      // PAGE 1: COVER
      // =============================================
      await generatePDFCover(ctx, doc, analysis, srChart, natalChart, birthdayMode, personalMessage, CAKE_IMAGES);

      // =============================================
      // PAGE 2: TABLE OF CONTENTS
      // =============================================
      doc.addPage(); ctx.y = margin;
      const tocPageNumber = doc.getNumberOfPages();
      const tocEntries = generatePDFTableOfContents(ctx, doc, analysis, narrative, birthdayMode);

      // =============================================
      // HOW TO READ THIS REPORT
      // =============================================
      doc.addPage(); ctx.y = margin;
      ctx.sectionPages.set('HOW TO READ THIS REPORT', doc.getNumberOfPages());
      generateHowToReadPage(ctx, doc);

      // =============================================
      // BIG THREE
      // =============================================
      doc.addPage(); ctx.y = margin;
      ctx.sectionPages.set('YOUR BIG THREE', doc.getNumberOfPages());
      generateStrengthsPortrait(ctx, doc, natalChart, analysis);

      // =============================================
      // HOW THIS YEAR MEETS YOU (new v3 section)
      // =============================================
      doc.addPage(); ctx.y = margin;
      ctx.sectionPages.set('HOW THIS YEAR MEETS YOU', doc.getNumberOfPages());
      generateHowThisYearMeetsYou(ctx, doc, analysis, srChart, natalChart);

      // =============================================
      // PAGE 3+: YEAR AT A GLANCE (own page)
      // =============================================
      doc.addPage(); ctx.y = margin;
      ctx.sectionPages.set('YEAR AT A GLANCE', doc.getNumberOfPages());
      generatePDFYearAtAGlance(ctx, doc, analysis, srChart, natalChart);

      // =============================================
      // PROFECTION WHEEL
      // =============================================
      if (analysis.profectionYear) {
        ctx.checkPage(280);
        ctx.sectionPages.set('PROFECTION WHEEL', doc.getNumberOfPages());
        drawProfectionWheel(ctx, doc, analysis.profectionYear.age, analysis.profectionYear.houseNumber, analysis.profectionYear.timeLord);


        // PERSONAL PROFECTION DEEP DIVE
        generateProfectionPersonalSection(ctx, doc,
          analysis.profectionYear.houseNumber,
          analysis.profectionYear.timeLord,
          analysis.profectionYear.age,
          analysis.profectionYear.timeLordSRHouse ?? null,
          analysis.profectionYear.timeLordSRSign || ''
        );
      }

      // =============================================
      // KEY DATES — When Time Lord activates natal planets
      // =============================================
      if (analysis.profectionYear) {
        generateKeyDatesSection(ctx, doc, analysis.profectionYear.timeLord, natalChart, srChart);
      }

      // ==============================================
      // MOON SIGN SHIFT — own page
      // =============================================
      const natalMoonSign = natalChart.planets.Moon?.sign;
      const srMoonSignFull = analysis.moonSign;
      if (natalMoonSign && srMoonSignFull) {
        doc.addPage(); ctx.y = margin; ctx.pageBg(doc);
        ctx.sectionPages.set('MOON SIGN SHIFT', doc.getNumberOfPages());
        ctx.sectionTitle(doc, 'MOON SIGN SHIFT', 'Your Emotional Year');

        const halfW = (contentW - 16) / 2;
        const natalDeep = moonSignDeep[natalMoonSign];
        const srDeep = moonSignDeep[srMoonSignFull];

        // Natal Moon
        ctx.trackedLabel(doc, 'NATAL MOON', margin + 8, ctx.y, { size: 7, charSpace: 3 });
        doc.setFont('times', 'normal'); doc.setFontSize(8);
        doc.setTextColor(...ctx.colors.muted);
        doc.text(`THIS YEAR'S MOON`, margin + halfW + 24, ctx.y);
        ctx.y += 10;
        
        doc.setFont('times', 'bold'); doc.setFontSize(14);
        doc.setTextColor(...ctx.colors.ink);
        doc.text(natalMoonSign.toUpperCase(), margin + 8, ctx.y);
        doc.text(srMoonSignFull.toUpperCase(), margin + halfW + 24, ctx.y);
        ctx.y += 14;

        // Two-column body
        doc.setFont('times', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...ctx.colors.ink);
        const natalMoonLines = doc.splitTextToSize(natalDeep?.emotional || '', halfW - 16);
        const srMoonLines = doc.splitTextToSize(srDeep?.emotional || '', halfW - 16);
        const maxLines = Math.max(natalMoonLines.length, srMoonLines.length);
        for (let li = 0; li < Math.min(maxLines, 6); li++) {
          if (natalMoonLines[li]) doc.text(natalMoonLines[li], margin + 8, ctx.y);
          if (srMoonLines[li]) doc.text(srMoonLines[li], margin + halfW + 24, ctx.y);
          ctx.y += 11;
        }
        // Vertical divider
        doc.setDrawColor(...ctx.colors.rule); doc.setLineWidth(0.25);
        doc.line(margin + halfW + 8, ctx.y - maxLines * 11 - 14, margin + halfW + 8, ctx.y);
        ctx.y += 8;

        if (natalMoonSign !== srMoonSignFull) {
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, `The Shift: ${natalMoonSign} --> ${srMoonSignFull}`);
            ctx.y += 2;
            const specificNarrative = moonShiftNarrative[natalMoonSign]?.[srMoonSignFull];
            if (specificNarrative) ctx.writeBody(doc, specificNarrative);
            ctx.y += 4;
            if (srDeep) {
              ctx.writeCardSection(doc, 'Body', srDeep.body);
              ctx.writeCardSection(doc, 'Apply', srDeep.apply);
              ctx.writeCardSection(doc, 'Daily Life', srDeep.looksLike);
            }
          });
        } else {
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, `Moon Stays in ${natalMoonSign} — Emotional Continuity`);
            ctx.writeBody(doc, 'Your SR Moon matches natal. This year amplifies your emotional instincts. Trust your gut.');
          });
        }
      }

      // =============================================
      // SOLAR RETURN VS NATAL — own page
      // =============================================
      doc.addPage(); ctx.y = margin; ctx.pageBg(doc);
      ctx.sectionPages.set('SOLAR RETURN VS NATAL', doc.getNumberOfPages());
      ctx.sectionTitle(doc, 'SOLAR RETURN VS NATAL');
      
      // Table header
      const cols = [
        margin + 8,
        margin + contentW * 0.12,
        margin + contentW * 0.32,
        margin + contentW * 0.40,
        margin + contentW * 0.60,
        margin + contentW * 0.70,
      ];
      doc.setFont('times', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...ctx.colors.muted);
      doc.setCharSpace(1);
      ['PLANET', 'SR POSITION', 'SR H', 'NATAL POSITION', 'NAT H', 'SHIFT'].forEach((h, i) => doc.text(h, cols[i], ctx.y));
      doc.setCharSpace(0);
      ctx.y += 6;
      doc.setDrawColor(...ctx.colors.rule); doc.setLineWidth(0.3);
      doc.line(margin, ctx.y, margin + contentW, ctx.y);
      ctx.y += 10;

      for (const p of PLANET_ORDER) {
        const srPos = srChart.planets[p as keyof typeof srChart.planets];
        const natPos = natalChart.planets[p as keyof typeof natalChart.planets];
        if (!srPos && !natPos) continue;
        const srH = analysis.planetSRHouses?.[p];
        const overlay = analysis.houseOverlays.find(o => o.planet === p);
        const natH = overlay?.natalHouse;
        const shift = srPos?.sign && natPos?.sign
          ? (srPos.sign === natPos.sign ? 'Same' : `${S[natPos.sign] || natPos.sign} > ${S[srPos.sign] || srPos.sign}`)
          : '';
        ctx.checkPage(18);
        doc.setFont('times', 'bold'); doc.setFontSize(9); doc.setTextColor(...ctx.colors.ink);
        doc.text(P[p] || p, cols[0], ctx.y);
        doc.setFont('times', 'normal'); doc.setFontSize(9); doc.setTextColor(...ctx.colors.ink);
        doc.text(srPos ? `${srPos.sign} ${srPos.degree}'` : '--', cols[1], ctx.y);
        doc.setFont('times', 'bold'); doc.setFontSize(8); doc.setTextColor(...ctx.colors.accent);
        doc.text(srH != null ? `H${srH}` : '--', cols[2], ctx.y);
        doc.setFont('times', 'normal'); doc.setFontSize(9); doc.setTextColor(...ctx.colors.ink);
        doc.text(natPos ? `${natPos.sign} ${natPos.degree}'` : '--', cols[3], ctx.y);
        doc.setFont('times', 'bold'); doc.setFontSize(8); doc.setTextColor(...ctx.colors.accent);
        doc.text(natH != null ? `H${natH}` : '--', cols[4], ctx.y);
        doc.setFont('times', 'italic'); doc.setFontSize(8); doc.setTextColor(...ctx.colors.muted); 
        doc.text(shift, cols[5], ctx.y);
        ctx.y += 17;
      }
      // Bottom rule
      doc.setDrawColor(...ctx.colors.rule); doc.setLineWidth(0.25);
      doc.line(margin, ctx.y, margin + contentW, ctx.y);
      ctx.y += 10;

      // =============================================
      // STELLIUMS — personalized with house context
      // =============================================
      if (analysis.stelliums.length > 0) {
        // Separate stelliums into sign vs house groups
        const signStelliums = analysis.stelliums.filter(s => !/^\d+$/.test(String(s.location)) && !s.location.startsWith('House'));
        const houseStelliums = analysis.stelliums.filter(s => /^\d+$/.test(String(s.location)) || s.location.startsWith('House'));

        // Helper to render a single stellium card (compact)
        const renderStelliumCard = (s: typeof analysis.stelliums[0]) => {
          const planets = s.planets.map(pp => P[pp] || pp).join(', ');
          const isHouseStellium = /^\d+$/.test(String(s.location)) || s.location.startsWith('House');
          const houseNum = parseInt(String(s.location).replace('House ', '').replace('House', ''));
          const planetHouses = s.planets.map(pp => analysis.planetSRHouses?.[pp]).filter(Boolean) as number[];
          const primaryHouse = planetHouses.length > 0 ? planetHouses[0] : null;

          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, `${s.planets.length}-Planet Stellium in ${isHouseStellium ? 'House ' + houseNum : s.location}`);
            ctx.y += 2;

            // Planet list
            doc.setFont('times', 'bold'); doc.setFontSize(10); doc.setTextColor(...ctx.colors.ink);
            doc.text(planets, margin + 8, ctx.y);
            ctx.y += 16;

            if (!isHouseStellium) {
              const signName = s.location;
              const signHouse = primaryHouse;
              ctx.writeBold(doc, 'What This Means For You', ctx.colors.deepBrown, 10);
              const personalizedStellium = getPersonalizedStelliumText(signName, signHouse, s.planets);
              ctx.writeBody(doc, personalizedStellium, ctx.colors.bodyText, 9.5, 13);
              ctx.y += 4;

              const felt = stelliumFeltSense[s.location];
              if (felt) {
                ctx.writeCardSection(doc, 'How You Will Feel This', felt, ctx.colors.accentGreen);
              }

              // Compact planet roles — inline list instead of individual boxes
              const roleLines = s.planets.map(pp => {
                const role = stelliumPlanetRoles[pp];
                const ppH = analysis.planetSRHouses?.[pp];
                const houseTag = ppH ? `  •  SR House ${ppH}` : '';
                return role ? `${P[pp] || pp}${houseTag} — ${role}` : null;
              }).filter(Boolean);
              
              if (roleLines.length > 0) {
                ctx.writeBold(doc, 'Planet Roles:', ctx.colors.gold, 9.5);
                for (const line of roleLines) {
                  ctx.writeBody(doc, `• ${line}`, ctx.colors.bodyText, 9, 12);
                }
              }
            } else if (!isNaN(houseNum)) {
              const houseMeaning = stelliumHouseMeaning[houseNum];
              if (houseMeaning) ctx.writeBody(doc, houseMeaning, ctx.colors.bodyText, 9.5, 13);
            }
          });
          ctx.y += 4; // minimal gap between cards
        };

        // --- SIGN STELLIUMS ---
        if (signStelliums.length > 0) {
          ctx.sectionTitle(doc, 'STELLIUMS — YOUR POWER ZONES');
          ctx.sectionPages.set('STELLIUMS', doc.getNumberOfPages());
          
          if (signStelliums.length > 1) {
            ctx.writeBody(doc, `You have ${signStelliums.length} sign stelliums this year — concentrated energy demanding attention.`, ctx.colors.dimText, 9.5);
            ctx.y += 6;
          }
          for (const s of signStelliums) {
            renderStelliumCard(s);
          }
        }

        // --- HOUSE STELLIUMS (new page only if sign stelliums already used space) ---
        if (houseStelliums.length > 0) {
          if (signStelliums.length > 0) {
            // Check if there's room, otherwise new page
            ctx.checkPage(200);
            ctx.y += 10;
            ctx.drawRule(doc); ctx.y += 16;
            ctx.trackedLabel(doc, 'STELLIUMS BY HOUSE', margin, ctx.y);
            ctx.y += 16;
          } else {
            ctx.sectionTitle(doc, 'STELLIUMS — YOUR POWER ZONES');
            ctx.sectionPages.set('STELLIUMS', doc.getNumberOfPages());
          }
          for (const s of houseStelliums) {
            renderStelliumCard(s);
          }
        }
      }

      // =============================================
      // ELEMENT & MODALITY + WHERE YOUR ENERGY LIVES + ANGULAR — one page
      // =============================================
      {
        const hasElements = !!analysis.elementBalance;
        const hasHemisphere = !!analysis.hemisphericEmphasis;
        
        if (hasElements || hasHemisphere) {
          ctx.sectionTitle(doc, 'ELEMENT, MODALITY & ENERGY');
          ctx.sectionPages.set('ELEMENT AND MODALITY', doc.getNumberOfPages());
          if (hasHemisphere) ctx.sectionPages.set('WHERE YOUR ENERGY LIVES', doc.getNumberOfPages());
        }

        if (hasElements) {
          const eb = analysis.elementBalance;
          const mb = analysis.modalityBalance;

          // Elements — editorial inline with hairline dividers
          ctx.writeBold(doc, 'Elemental Balance');
          ctx.y += 6;
          const elemW = (contentW - 12) / 4;
          const elemStartY = ctx.y;
          const elements = [
            { name: 'Fire', val: eb.fire },
            { name: 'Earth', val: eb.earth },
            { name: 'Air', val: eb.air },
            { name: 'Water', val: eb.water },
          ];
          elements.forEach((el, i) => {
            const x = margin + i * elemW;
            const isDom = el.name.toLowerCase() === (eb.dominant || '').toLowerCase();
            doc.setFont('times', 'bold'); doc.setFontSize(22);
            doc.setTextColor(...(isDom ? ctx.colors.ink : ctx.colors.muted));
            doc.text(String(el.val), x + elemW / 2, elemStartY + 20, { align: 'center' });
            doc.setFont('times', 'normal'); doc.setFontSize(9);
            doc.setTextColor(...ctx.colors.ink);
            doc.text(el.name, x + elemW / 2, elemStartY + 34, { align: 'center' });
            if (isDom) {
              ctx.trackedLabel(doc, 'DOMINANT', x + elemW / 2, elemStartY + 44, { align: 'center', size: 6.5, charSpace: 2 });
            }
            // Vertical divider
            if (i < 3) {
              doc.setDrawColor(...ctx.colors.rule); doc.setLineWidth(0.25);
              doc.line(x + elemW, elemStartY, x + elemW, elemStartY + 48);
            }
          });
          ctx.y = elemStartY + 54;

          // Modalities — editorial inline
          ctx.writeBold(doc, 'Modality Balance');
          ctx.y += 6;
          const modW = (contentW - 8) / 3;
          const modalities = [
            { name: 'Cardinal', val: mb.cardinal, desc: 'Initiating' },
            { name: 'Fixed', val: mb.fixed, desc: 'Sustaining' },
            { name: 'Mutable', val: mb.mutable, desc: 'Adapting' },
          ];
          const modStartY = ctx.y;
          modalities.forEach((mod, i) => {
            const x = margin + i * modW;
            const isDom = mod.name.toLowerCase() === mb.dominant;
            doc.setFont('times', 'bold'); doc.setFontSize(20);
            doc.setTextColor(...(isDom ? ctx.colors.ink : ctx.colors.muted));
            doc.text(String(mod.val), x + modW / 2, modStartY + 18, { align: 'center' });
            doc.setFont('times', 'normal'); doc.setFontSize(9);
            doc.setTextColor(...ctx.colors.ink);
            doc.text(`${mod.name} · ${mod.desc}`, x + modW / 2, modStartY + 32, { align: 'center' });
            if (i < 2) {
              doc.setDrawColor(...ctx.colors.rule); doc.setLineWidth(0.25);
              doc.line(x + modW, modStartY, x + modW, modStartY + 38);
            }
          });
          ctx.y = modStartY + 44;
        }

        // WHERE YOUR ENERGY LIVES — continues on same page
        if (hasHemisphere) {
          const hem = analysis.hemisphericEmphasis;
          const total = hem.totalCounted;
          const quadPlanets: Record<string, string[]> = { upper: [], lower: [], east: [], west: [] };
          for (const p of PLANET_ORDER) {
            const h = analysis.planetSRHouses?.[p];
            if (h == null) continue;
            if (h >= 7 && h <= 12) quadPlanets.upper.push(P[p] || p); else quadPlanets.lower.push(P[p] || p);
            if (h >= 10 || h <= 3) quadPlanets.east.push(P[p] || p); else quadPlanets.west.push(P[p] || p);
          }

          ctx.drawRule(doc); ctx.y += 12;
          ctx.writeBold(doc, 'Where Your Energy Lives');
          ctx.y += 6;

          // 2x2 grid — compact
          const boxW = (contentW - 40) / 2;
          const boxH = 65;
          const gridData = [
            { label: 'UPPER', sub: 'Public & Visible', count: hem.upper, planets: quadPlanets.upper, bg: [240, 245, 255] as [number, number, number], row: 0, col: 0 },
            { label: 'LOWER', sub: 'Private & Internal', count: hem.lower, planets: quadPlanets.lower, bg: [255, 248, 240] as [number, number, number], row: 0, col: 1 },
            { label: 'EASTERN', sub: 'Self-Initiated', count: hem.east, planets: quadPlanets.east, bg: [240, 252, 245] as [number, number, number], row: 1, col: 0 },
            { label: 'WESTERN', sub: 'Other-Oriented', count: hem.west, planets: quadPlanets.west, bg: [252, 242, 245] as [number, number, number], row: 1, col: 1 },
          ];
          const gridStartY = ctx.y;
          for (const g of gridData) {
            const x = margin + 8 + g.col * (boxW + 12);
            const by = gridStartY + g.row * (boxH + 6);
            const isDom = g.count > total / 2;
            doc.setFont('times', 'bold'); doc.setFontSize(22);
            doc.setTextColor(...(isDom ? ctx.colors.ink : ctx.colors.muted));
            doc.text(String(g.count), x + 16, by + 24);
            doc.setFont('times', 'bold'); doc.setFontSize(9);
            doc.setTextColor(...ctx.colors.ink);
            doc.text(g.label, x + 46, by + 16);
            doc.setFont('times', 'italic'); doc.setFontSize(8);
            doc.setTextColor(...ctx.colors.muted);
            doc.text(g.sub, x + 46, by + 26);
            if (g.planets.length > 0) {
              doc.setFont('times', 'normal'); doc.setFontSize(7.5);
              doc.setTextColor(...ctx.colors.ink);
              const planetLines = doc.splitTextToSize(g.planets.join(', '), boxW - 30);
              planetLines.forEach((line: string, li: number) => doc.text(line, x + 16, by + 40 + li * 10));
            }
            if (isDom) {
              ctx.trackedLabel(doc, 'DOMINANT', x + boxW - 8, by + 10, { align: 'right', size: 6.5, charSpace: 2 });
            }
            // Vertical divider between columns
            if (g.col === 0) {
              doc.setDrawColor(...ctx.colors.rule); doc.setLineWidth(0.25);
              doc.line(x + boxW + 6, by, x + boxW + 6, by + boxH);
            }
          }
          ctx.y = gridStartY + (boxH + 6) * 2 + 6;

          // Angular Planets — continues on same page
          if (analysis.angularPlanets && analysis.angularPlanets.length > 0) {
            ctx.y += 6;
            ctx.drawRule(doc); ctx.y += 10;
            ctx.writeBold(doc, 'Angular Planets — Most Powerful This Year');
            ctx.y += 6;
            
            const angBoxW = (contentW - 16) / Math.min(analysis.angularPlanets.length, 3);
            const angBoxH = 75;
            const angStartY = ctx.y;
            
            analysis.angularPlanets.forEach((ap, i) => {
              const col = i % 3;
              const row = Math.floor(i / 3);
              const x = margin + col * (angBoxW + 8);
              const by = angStartY + row * (angBoxH + 6);
              
              doc.setFont('times', 'bold'); doc.setFontSize(11); doc.setTextColor(...ctx.colors.ink);
              doc.text(P[ap] || ap, x + 10, by + 18);
              
              const pm = planetLifeMeanings[ap] || planetLifeMeanings[ap.replace('NorthNode','North Node')];
              if (pm) {
                doc.setFont('times', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...ctx.colors.ink);
                const pmLines = doc.splitTextToSize(pm.inYourLife, angBoxW - 28);
                pmLines.slice(0, 5).forEach((line: string, li: number) => doc.text(line, x + 10, by + 32 + li * 9));
              }
            });
            ctx.y = angStartY + (Math.ceil(analysis.angularPlanets.length / 3)) * (angBoxH + 6);
          }
        }
      }

      // =============================================
      // LORD OF THE YEAR — uses profection Time Lord (the correct Hellenistic concept)
      // lordOfTheYear is actually the natal chart ruler — a fixed planet, NOT yearly
      // The true "Lord of the Year" in Hellenistic astrology = profection Time Lord
      // =============================================
      if (analysis.profectionYear?.timeLord) {
        doc.addPage(); ctx.y = margin; ctx.pageBg(doc);
        ctx.sectionPages.set('LORD OF THE YEAR', doc.getNumberOfPages());
        ctx.sectionTitle(doc, 'LORD OF THE YEAR');

        const tlPlanet = analysis.profectionYear.timeLord;
        const tlSRHouse = analysis.profectionYear.timeLordSRHouse;
        const tlSRSign = analysis.profectionYear.timeLordSRSign;
        const houseNum = analysis.profectionYear.houseNumber;
        
        const tlSRPos = srChart.planets[tlPlanet as keyof typeof srChart.planets];
        const tlIsRetro = !!(tlSRPos as any)?.isRetrograde;
        const tlDignity = (analysis.lordOfTheYear && analysis.lordOfTheYear.planet === tlPlanet) 
          ? analysis.lordOfTheYear.dignity : '';

        // Header — editorial style
        doc.setFont('times', 'bold'); doc.setFontSize(18);
        doc.setTextColor(...ctx.colors.ink);
        doc.text(`${P[tlPlanet] || tlPlanet}`, margin + 8, ctx.y);
        doc.setFont('times', 'normal'); doc.setFontSize(11);
        doc.setTextColor(...ctx.colors.ink);
        doc.text(`${tlSRSign || '--'} — SR House ${tlSRHouse || '--'}`, margin + 8, ctx.y + 18);
        if (tlDignity) {
          doc.setFont('times', 'italic'); doc.setFontSize(9);
          doc.setTextColor(...ctx.colors.muted);
          doc.text(`Dignity: ${tlDignity}`, margin + contentW, ctx.y, { align: 'right' });
        }
        if (tlIsRetro) {
          ctx.trackedLabel(doc, 'RETROGRADE', margin + contentW, ctx.y + 12, { align: 'right', size: 7, charSpace: 2 });
        }
        ctx.y += 30;
        doc.setDrawColor(...ctx.colors.rule); doc.setLineWidth(0.25);
        doc.line(margin, ctx.y, margin + contentW, ctx.y);
        ctx.y += 14;

        // Why this planet — link to profection
        ctx.drawCard(doc, () => {
          ctx.writeBold(doc, `Why ${P[tlPlanet] || tlPlanet} Is Your Lord of the Year`, ctx.colors.gold, 11);
          ctx.y += 2;
          ctx.writeBody(doc, `You are ${analysis.profectionYear!.age} years old, placing you in a ${houseNum}${houseNum === 1 ? 'st' : houseNum === 2 ? 'nd' : houseNum === 3 ? 'rd' : 'th'} house profection year. The traditional ruler of your natal ${houseNum}${houseNum === 1 ? 'st' : houseNum === 2 ? 'nd' : houseNum === 3 ? 'rd' : 'th'} house cusp is ${P[tlPlanet] || tlPlanet}, making it the planet running the show — every transit to or from ${P[tlPlanet] || tlPlanet} hits harder this year.`, ctx.colors.bodyText, 10, 14);
        });

        // Detailed meaning
        const detailedMeaning = timeLordDetailedMeaning[tlPlanet];
        if (detailedMeaning) {
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, 'What This Means For Your Year', ctx.colors.accentGreen, 11);
            ctx.y += 2;
            ctx.writeBody(doc, detailedMeaning, ctx.colors.bodyText, 10, 14);
          });
        }

        const pm = planetLifeMeanings[tlPlanet];
        if (pm) {
          ctx.drawCard(doc, () => {
            ctx.writeCardSection(doc, 'What It Rules', pm.inYourLife, ctx.colors.gold);
            ctx.writeCardSection(doc, 'How You Feel It', pm.bodyFeeling, ctx.colors.accentRust);
          });
        }

        // Where the Lord sits in the SR chart
        if (tlSRHouse) {
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, `${P[tlPlanet] || tlPlanet} in SR House ${tlSRHouse} — Where the Year Plays Out`, ctx.colors.gold, 11);
            ctx.y += 2;
            const lordHouseInterp: Record<number, string> = {
              1: 'The Lord of the Year in your 1st house means YOUR identity, body, and personal direction are the main arena. Every decision this year is filtered through "who am I becoming?" You are visibly the main character.',
              2: 'The Lord of the Year in your 2nd house directs the year\'s energy toward money, possessions, and self-worth. Financial decisions carry unusual weight. The question: what do you actually value enough to work for?',
              3: 'The Lord of the Year in your 3rd house channels the year through communication, learning, and your immediate environment. Your words carry more power. Sibling or neighbor dynamics may be unusually significant.',
              4: 'The Lord of the Year in your 4th house roots this year\'s story in home, family, and emotional foundations. You may move, renovate, or face family dynamics that demand resolution. Build from the inside out.',
              5: 'The Lord of the Year in your 5th house directs the year toward creativity, romance, children, and self-expression. Joy is not optional — it is the curriculum. Create something. Take an emotional risk.',
              6: 'The Lord of the Year in your 6th house channels the year through daily routines, health, and work. The mundane IS the meaningful. Your body sends messages. Sustainable systems produce the biggest results.',
              7: 'The Lord of the Year in your 7th house means partnerships define the year. Relationships — romantic, business, or legal — are where growth happens. The mirror of another person shows you what you cannot see alone.',
              8: 'The Lord of the Year in your 8th house directs the year toward transformation, shared resources, and psychological depth. Something needs to end so something real can begin. Therapy and deep honesty are productive.',
              9: 'The Lord of the Year in your 9th house expands the year through travel, education, and philosophical exploration. Your current worldview is too small. Something out there will crack it open.',
              10: 'The Lord of the Year in your 10th house puts career and public reputation at the center. You are more visible than usual. Professional decisions have outsized impact. Build something the world can see.',
              11: 'The Lord of the Year in your 11th house channels the year through friendships, community, and collective purpose. Your social circle is being restructured. The quality of your connections determines the quality of your year.',
              12: 'The Lord of the Year in your 12th house turns the year inward. Solitude, spiritual practice, and unconscious patterns are the focus. Rest, dreams, and inner work are not extras — they are the assignment.',
            };
            const hInterp = lordHouseInterp[tlSRHouse!];
            if (hInterp) ctx.writeBody(doc, hInterp, ctx.colors.bodyText, 10, 14);
          });
        }

        if (tlDignity === 'Detriment' || tlDignity === 'Fall') {
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, 'Dignity Warning', ctx.colors.accentRust, 10);
            ctx.writeBody(doc, `Your Lord of the Year is in ${tlDignity}. This means ${P[tlPlanet] || tlPlanet} is working outside its comfort zone — plans may require more effort, communication needs extra clarity. The growth is deeper and the lessons stick.`, ctx.colors.bodyText, 10);
          }, ctx.colors.accentRust);
        }
        if (tlDignity === 'Domicile' || tlDignity === 'Exaltation') {
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, 'Dignity Advantage', ctx.colors.accentGreen, 10);
            ctx.writeBody(doc, `Your Lord of the Year is in ${tlDignity} — this is ${P[tlPlanet] || tlPlanet} at ${tlDignity === 'Domicile' ? 'full strength, operating in its own sign' : 'peak performance, elevated and supported by sign'}. The year's agenda flows more naturally. ${P[tlPlanet] || tlPlanet}'s themes are expressed with clarity and authority. Results come with less friction.`, ctx.colors.bodyText, 10);
          }, ctx.colors.accentGreen);
        }
        if (tlIsRetro) {
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, 'Retrograde Effect', ctx.colors.accentRust, 10);
            ctx.writeBody(doc, `${P[tlPlanet] || tlPlanet} retrograde as Lord of the Year means this year has a built-in "review and revise" quality. Things from the past resurface — old projects, unfinished conversations, former connections. What comes back around deserves a second look. New initiatives may stall until you address what was left incomplete. The retrograde does not block progress — it redirects it through revision.`, ctx.colors.bodyText, 10);
          }, ctx.colors.accentRust);
        }
      }

      // =============================================
      // SATURN & NORTH NODE — own page
      // =============================================
      if (analysis.saturnFocus || analysis.nodesFocus) {
        doc.addPage(); ctx.y = margin; ctx.pageBg(doc);
        ctx.sectionPages.set('SATURN AND NORTH NODE', doc.getNumberOfPages());
        ctx.sectionTitle(doc, 'SATURN & NORTH NODE');

        // Brief why card
        ctx.drawCard(doc, () => {
          ctx.writeBold(doc, 'Why These Two Matter', ctx.colors.gold, 11);
          ctx.writeBody(doc, 'Saturn = WHERE YOU ARE TESTED. The area of life where shortcuts fail and real work produces lasting results. North Node = WHERE YOUR SOUL IS GROWING. The direction that feels unfamiliar but is exactly what this year requires.', ctx.colors.bodyText, 10, 14);
        });

        if (analysis.saturnFocus) {
          ctx.drawCard(doc, () => {
            // Saturn header — editorial
            doc.setFont('times', 'bold'); doc.setFontSize(12); doc.setTextColor(...ctx.colors.ink);
            doc.text(`Saturn in ${analysis.saturnFocus!.sign} — House ${analysis.saturnFocus!.house || '--'}${analysis.saturnFocus!.isRetrograde ? ' (Rx)' : ''}`, margin + 8, ctx.y);
            ctx.y += 16;
            const satMeaning = saturnHouseMeaning[analysis.saturnFocus!.house];
            if (satMeaning) ctx.writeBody(doc, satMeaning);
            
            // Saturn sign-specific behavior
            const satSignBehavior: Record<string, string> = {
              Aries: 'Saturn in Aries tests your ability to act independently without being reckless. Patience and impulsivity are at war. Leadership must be earned through accountability, not aggression.',
              Taurus: 'Saturn in Taurus demands financial discipline and forces you to distinguish real security from comfort-seeking. Material foundations are being stress-tested.',
              Gemini: 'Saturn in Gemini requires mental discipline. Superficial learning is not enough — depth and precision in communication are demanded. Contracts and written agreements need extra care.',
              Cancer: 'Saturn in Cancer tests emotional boundaries. Family obligations feel heavier. Building genuine emotional security — not just avoiding vulnerability — is the work.',
              Leo: 'Saturn in Leo tests creative confidence. Self-expression feels risky or blocked. The work: creating something real without needing applause to keep going.',
              Virgo: 'Saturn in Virgo amplifies perfectionism — useful for detail work, destructive when paralysis sets in. Health routines and daily systems need restructuring from the ground up.',
              Libra: 'Saturn in Libra (exalted) tests relationships through fairness and accountability. Partnerships that are genuinely equitable strengthen; those built on convenience dissolve. Justice themes are prominent.',
              Scorpio: 'Saturn in Scorpio demands emotional honesty at the deepest level. Power dynamics, financial entanglements, and psychological patterns you have been avoiding are no longer avoidable.',
              Sagittarius: 'Saturn in Sagittarius tests your beliefs against reality. Dogma collapses. Education and travel require commitment, not just enthusiasm. Wisdom must be earned through experience.',
              Capricorn: 'Saturn in Capricorn (domicile) is Saturn at full strength. Ambition is focused, disciplined, and relentless. Career structures solidify. Authority is earned through consistent effort. This is Saturn doing exactly what Saturn does.',
              Aquarius: 'Saturn in Aquarius (traditional domicile) restructures your relationship to community and collective purpose. Social circles are audited. Innovation requires discipline to become real.',
              Pisces: 'Saturn in Pisces brings structure to the spiritual and creative. Boundaries around empathy are essential. Escapism is punished; disciplined imagination produces lasting art, healing, or spiritual growth.',
            };
            const satSign = analysis.saturnFocus!.sign;
            if (satSignBehavior[satSign]) {
              ctx.y += 6;
              ctx.writeCardSection(doc, `Saturn in ${satSign} — Sign Behavior`, satSignBehavior[satSign], ctx.colors.accentRust);
            }
            
            // Retrograde Saturn note
            if (analysis.saturnFocus!.isRetrograde) {
              ctx.y += 4;
              ctx.writeCardSection(doc, 'Saturn Retrograde in the SR', 'Saturn retrograde in the Solar Return means the testing is INTERNAL. External authority figures are less prominent — the examiner is your own conscience. Standards you have been avoiding or compromises you have been making are no longer sustainable. The restructuring happens from the inside out.', ctx.colors.accentRust);
            }
          });
        }
        if (analysis.nodesFocus) {
          ctx.checkPage(150);
          ctx.drawCard(doc, () => {
            doc.setFont('times', 'bold'); doc.setFontSize(12); doc.setTextColor(...ctx.colors.ink);
            doc.text(`North Node in ${analysis.nodesFocus!.sign} — House ${analysis.nodesFocus!.house || '--'}`, margin + 8, ctx.y);
            ctx.y += 16;
            const nodeMeaning = nodeHouseMeaning[analysis.nodesFocus!.house];
            if (nodeMeaning) ctx.writeBody(doc, nodeMeaning);
            
            // Node sign-specific growth direction
            const nodeSignGrowth: Record<string, string> = {
              Aries: 'The North Node in Aries says: stop deferring, start asserting. Your soul growth requires putting yourself first — not selfishly, but as a necessary correction. Independence is the lesson.',
              Taurus: 'The North Node in Taurus says: slow down, build something real. Your growth comes through material stability, sensory presence, and learning to trust your own values over others\' opinions.',
              Gemini: 'The North Node in Gemini says: stay curious, communicate more. Growth comes through asking questions, learning new skills, and engaging with your immediate environment rather than clinging to ideology.',
              Cancer: 'The North Node in Cancer says: let yourself feel. Growth comes through vulnerability, nurturing, and creating emotional safety — for yourself and others.',
              Leo: 'The North Node in Leo says: step into the spotlight. Growth comes through creative self-expression, taking emotional risks, and allowing yourself to be seen without hiding behind the group.',
              Virgo: 'The North Node in Virgo says: master the details. Growth comes through practical service, health routines, and bringing order to chaos — not through grand visions but daily discipline.',
              Libra: 'The North Node in Libra says: learn to partner. Growth comes through collaboration, diplomacy, and considering others\' needs as seriously as your own.',
              Scorpio: 'The North Node in Scorpio says: go deeper. Growth comes through emotional vulnerability, shared resources, and allowing transformation even when it feels like loss.',
              Sagittarius: 'The North Node in Sagittarius says: expand your world. Growth comes through travel, education, and forming your own philosophy based on direct experience rather than data.',
              Capricorn: 'The North Node in Capricorn says: take responsibility. Growth comes through career ambition, public contribution, and building structures that outlast your comfort zone.',
              Aquarius: 'The North Node in Aquarius says: serve the collective. Growth comes through community involvement, innovation, and detaching from personal drama to focus on the bigger picture.',
              Pisces: 'The North Node in Pisces says: trust the unseen. Growth comes through faith, artistic expression, and surrendering the need to control every outcome.',
            };
            const nodeSign = analysis.nodesFocus!.sign;
            if (nodeSignGrowth[nodeSign]) {
              ctx.y += 6;
              ctx.writeCardSection(doc, `Growth Direction: ${nodeSign}`, nodeSignGrowth[nodeSign], ctx.colors.accentGreen);
            }
          });
        }
        
        // Saturn-Node synthesis when both exist
        if (analysis.saturnFocus && analysis.nodesFocus) {
          ctx.checkPage(120);
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, 'Saturn + North Node: The Tension That Drives Growth', ctx.colors.gold, 11);
            ctx.y += 2;
            ctx.writeBody(doc, `Saturn in House ${analysis.saturnFocus!.house || '--'} tests you through ${analysis.saturnFocus!.house ? (analysis.saturnFocus!.house <= 6 ? 'personal' : 'interpersonal') : 'specific'} demands: structure, accountability, and hard work. The North Node in House ${analysis.nodesFocus!.house || '--'} pulls your soul toward unfamiliar growth territory. The dynamic: Saturn is WHERE you are being made stronger through difficulty. The Node is WHERE you are being made wiser through new experience. They are not the same — and that tension between duty and growth is the engine of your year.`, ctx.colors.bodyText, 10, 14);
          });
        }
      }

      // =============================================
      // KEY ASPECTS — own page with box layout
      // =============================================
      if (analysis.srToNatalAspects.length > 0) {
        const allAspects = analysis.srToNatalAspects.filter(asp => !(asp.planet1 === 'Sun' && asp.planet2 === 'Sun' && asp.type === 'Conjunction'));
        const majorAspects = allAspects.filter(asp => MAJOR_BODIES.has(asp.planet1) && MAJOR_BODIES.has(asp.planet2));
        
        doc.addPage(); ctx.y = margin; ctx.pageBg(doc);
        ctx.sectionPages.set('KEY ASPECTS', doc.getNumberOfPages());
        ctx.sectionTitle(doc, 'KEY ASPECTS', 'How Solar Return planets activate your natal chart');

        for (let i = 0; i < Math.min(majorAspects.length, 8); i++) {
          const asp = majorAspects[i];
          const interp = generateSRtoNatalInterpretation(asp.planet1, asp.planet2, asp.type, asp.orb);
          const isHard = ['Square', 'Opposition', 'Quincunx'].includes(asp.type);
          const srH = analysis.planetSRHouses?.[asp.planet1];
          const natalH = natalChart.planets?.[asp.planet2]?.house;
          
          ctx.checkPage(160);
          
          ctx.drawCard(doc, () => {
            // Title line
            doc.setFont('times', 'bold'); doc.setFontSize(10);
            doc.setTextColor(...ctx.colors.ink);
            doc.text(`SR ${P[asp.planet1] || asp.planet1}  ${asp.type}  Natal ${P[asp.planet2] || asp.planet2}`, margin + 8, ctx.y);
            doc.setFont('times', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...ctx.colors.muted);
            const orbHouse = `${asp.orb}' orb${srH ? `  |  SR H${srH}` : ''}${natalH ? `  |  Natal H${natalH}` : ''}`;
            doc.text(orbHouse, margin + contentW, ctx.y, { align: 'right' });
            ctx.y += 14;

            ctx.writeCardSection(doc, 'How It Feels', interp.howItFeels);
            ctx.writeCardSection(doc, 'What It Means', interp.whatItMeans);
            ctx.writeCardSection(doc, 'What To Do', interp.whatToDo);
          });
        }
      }

      // =============================================
      // YOUR MOON THIS YEAR — own page
      // =============================================
      if (analysis.srMoonAspects || analysis.moonVOC || analysis.moonAngularity) {
        doc.addPage(); ctx.y = margin; ctx.pageBg(doc);
        ctx.sectionPages.set('YOUR MOON THIS YEAR', doc.getNumberOfPages());
        ctx.sectionTitle(doc, 'YOUR MOON THIS YEAR', 'Emotional Climate');

        // Moon VOC
        if (analysis.moonVOC) {
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, 'Moon Void of Course — The Unaspected Moon');
            ctx.y += 6;
            ctx.writeBody(doc, 'Your Solar Return Moon makes no major aspects to any other planet in the SR chart. This is a rare and significant condition.');
            ctx.y += 4;
            ctx.writeCardSection(doc, 'What This Means', 'An unaspected SR Moon operates in isolation — your emotional life this year runs on its own track. Feelings are vivid but disconnected from the rest of the chart\'s story.');
            ctx.writeCardSection(doc, 'The Gift', 'Without planetary aspects pulling it in different directions, the Moon is free. Your emotional compass this year is entirely your own.');
            ctx.writeCardSection(doc, 'The Challenge', 'Without aspects to ground or activate the Moon, emotional needs may go unmet unless you consciously name and honor them.');
          });
        }

        // Angularity
        if (analysis.moonAngularity) {
          const angDesc: Record<string, string> = {
            angular: 'Your SR Moon is angular (close to an angle). Emotional responses are instinctive, automatic, and highly reactive. You are close to every situation — perspective is harder, but feelings are powerfully felt and visible to others.',
            succedent: 'Your SR Moon is in a succedent house. Emotional responses are stable and grounded this year. You can step back and examine situations without being overwhelmed.',
            cadent: 'Your SR Moon is in a cadent house. Emotional responses are more adaptive this year. You process feelings internally, preparing rather than reacting.',
          };
          ctx.drawCard(doc, () => {
            doc.setFont('times', 'bold'); doc.setFontSize(11); doc.setTextColor(...ctx.colors.ink);
            doc.text(`Moon: ${analysis.moonSign || ''} in House ${analysis.moonHouse?.house || '--'}`, margin + 8, ctx.y);
            ctx.y += 14;
            ctx.writeBody(doc, angDesc[analysis.moonAngularity!]);
            if (analysis.moonLateDegree) {
              ctx.y += 4;
              ctx.writeCardSection(doc, 'Late-Degree Moon', 'Your SR Moon is in the late degrees of its sign (25+). Something emotional is reaching completion or about to change. Endings, transitions, and a sense of "moving on" characterize the year.', ctx.colors.accentRust);
            }
            if (analysis.moonMetonicAges && analysis.moonMetonicAges.length > 0) {
              ctx.y += 4;
              ctx.writeCardSection(doc, '19-Year Metonic Cycle', `Your SR Moon was in approximately this position at age${analysis.moonMetonicAges.length > 1 ? 's' : ''} ${analysis.moonMetonicAges.join(', ')}. The emotional themes of this year echo those earlier chapters.`, ctx.colors.gold);
            }
          });
        }

        // SR Moon aspects
        if (analysis.srMoonAspects && analysis.srMoonAspects.length > 0) {
          ctx.y += 6;
          ctx.writeBold(doc, 'Moon Aspects This Year');
          ctx.y += 6;
          for (const asp of analysis.srMoonAspects.slice(0, 6)) {
            const isHard = ['Square', 'Opposition', 'Quincunx'].includes(asp.aspectType);
            ctx.checkPage(80);
            ctx.drawCard(doc, () => {
              doc.setFont('times', 'bold'); doc.setFontSize(9.5);
              doc.setTextColor(...ctx.colors.ink);
              doc.text(`Moon ${asp.aspectType} ${P[asp.targetPlanet] || asp.targetPlanet}`, margin + 8, ctx.y);
              doc.setFont('times', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...ctx.colors.muted);
              doc.text(`${asp.orb}' orb${asp.targetSRHouse ? `  |  H${asp.targetSRHouse}` : ''}`, margin + contentW, ctx.y, { align: 'right' });
              ctx.y += 12;
              ctx.writeBody(doc, asp.interpretation);
            });
          }
        }
      }

      // =============================================
      // VERTEX
      // =============================================
      if (analysis.vertex) {
        ctx.checkPage(200);
        if (ctx.y > margin + 100) { doc.addPage(); ctx.y = margin; ctx.pageBg(doc); }
        ctx.sectionPages.set('VERTEX', doc.getNumberOfPages());
        ctx.sectionTitle(doc, 'VERTEX — FATED ENCOUNTERS');
        ctx.drawCard(doc, () => {
          ctx.writeBold(doc, `Vertex: ${analysis.vertex!.sign} ${analysis.vertex!.degree}' ${analysis.vertex!.house ? `(House ${analysis.vertex!.house})` : ''}`);
          const vSign = vertexInSign[analysis.vertex!.sign];
          if (vSign) {
            ctx.writeCardSection(doc, 'Fated Theme', vSign.fatedTheme);
            ctx.writeCardSection(doc, 'Who May Appear', vSign.encounters);
          }
        });
      }

      // =============================================
      // PLANET SPOTLIGHT — own page with box layout
      // =============================================
      const deepData: Record<string, Record<number, any>> = {
        Mercury: srMercuryInHouseDeep, Venus: srVenusInHouseDeep, Mars: srMarsInHouseDeep,
        Jupiter: srJupiterInHouseDeep, Saturn: srSaturnInHouseDeep, Uranus: srUranusInHouseDeep,
        Neptune: srNeptuneInHouseDeep, Pluto: srPlutoInHouseDeep,
      };
      const spotlightPlanets = SPOTLIGHT_ORDER.filter(p => {
        const h = analysis.planetSRHouses?.[p];
        return h !== null && h !== undefined && deepData[p]?.[h];
      });
      if (spotlightPlanets.length > 0) {
        doc.addPage(); ctx.y = margin; ctx.pageBg(doc);
        ctx.sectionPages.set('PLANET SPOTLIGHT', doc.getNumberOfPages());
        ctx.sectionTitle(doc, 'PLANET SPOTLIGHT', 'Each planet\'s placement in your Solar Return and what it means for the year');

        for (const planet of spotlightPlanets) {
          const h = analysis.planetSRHouses[planet]!;
          const data = deepData[planet][h];
          if (!data) continue;
          ctx.checkPage(180);
          ctx.drawCard(doc, () => {
            // Planet header — editorial
            doc.setFont('times', 'bold'); doc.setFontSize(12);
            doc.setTextColor(...ctx.colors.ink);
            doc.text(`${P[planet] || planet} in House ${h}`, margin + 8, ctx.y);
            doc.setFont('times', 'italic'); doc.setFontSize(8); doc.setTextColor(...ctx.colors.muted);
            const titleText = (data.title || '').substring(0, 40);
            doc.text(titleText, margin + contentW, ctx.y, { align: 'right' });
            ctx.y += 16;

            if (data.overview) {
              ctx.writeBody(doc, data.overview, ctx.colors.darkText, 10, 14);
              ctx.y += 6;
            }
            ctx.writeCardSection(doc, 'What This Looks Like', data.practical, ctx.colors.accentGreen);
            if (data.caution) ctx.writeCardSection(doc, 'Watch For', data.caution, ctx.colors.accentRust);
          });
        }
      }

      // =============================================
      // NARRATIVE
      // =============================================
      if (narrative) {
        doc.addPage(); ctx.y = margin; ctx.pageBg(doc);
        ctx.sectionPages.set('YEAR-AHEAD READING', doc.getNumberOfPages());
        ctx.sectionTitle(doc, 'YEAR-AHEAD READING');

        const lines = narrative.split('\n');
        let paraBuffer: string[] = [];
        let paraCount = 0;

        const flushPara = () => {
          if (paraBuffer.length === 0) return;
          const fullText = paraBuffer.join(' ').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/[^\x00-\x7F]/g, '');
          paraCount++;

          // Every other paragraph gets a pull quote treatment for the first sentence
          if (paraCount % 2 === 0) {
            const firstSentenceEnd = fullText.search(/[.!?]\s/);
            if (firstSentenceEnd > 20 && firstSentenceEnd < 120) {
              const pullQuote = fullText.substring(0, firstSentenceEnd + 1);
              const remainder = fullText.substring(firstSentenceEnd + 2);
              ctx.checkPage(80);
              ctx.y += 8;
              doc.setFont('times', 'italic'); doc.setFontSize(12);
              doc.setTextColor(...ctx.colors.accent);
              const pqLines = doc.splitTextToSize(pullQuote, contentW - 60);
              pqLines.forEach((line: string) => {
                doc.text(line, pw / 2, ctx.y, { align: 'center' });
                ctx.y += 16;
              });
              ctx.y += 6;
              if (remainder) {
                doc.setFont('times', 'normal'); doc.setFontSize(9.5);
                doc.setTextColor(...ctx.colors.ink);
                const rLines = doc.splitTextToSize(remainder, contentW);
                rLines.forEach((line: string) => {
                  ctx.checkPage(14);
                  doc.text(line, margin, ctx.y);
                  ctx.y += 14;
                });
              }
            } else {
              doc.setFont('times', 'normal'); doc.setFontSize(9.5);
              doc.setTextColor(...ctx.colors.ink);
              const bLines = doc.splitTextToSize(fullText, contentW);
              bLines.forEach((line: string) => {
                ctx.checkPage(14);
                doc.text(line, margin, ctx.y);
                ctx.y += 14;
              });
            }
          } else {
            doc.setFont('times', 'normal'); doc.setFontSize(9.5);
            doc.setTextColor(...ctx.colors.ink);
            const bLines = doc.splitTextToSize(fullText, contentW);
            bLines.forEach((line: string) => {
              ctx.checkPage(14);
              doc.text(line, margin, ctx.y);
              ctx.y += 14;
            });
          }
          ctx.y += 12;
          paraBuffer = [];
        };

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) {
            flushPara();
            continue;
          }
          if (trimmed.startsWith('## ')) {
            flushPara();
            ctx.checkPage(50); ctx.y += 16;
            ctx.trackedLabel(doc, trimmed.replace('## ', '').toUpperCase(), margin, ctx.y);
            ctx.y += 4;
            doc.setDrawColor(...ctx.colors.rule);
            doc.setLineWidth(0.3);
            doc.line(margin, ctx.y, pw - margin, ctx.y);
            ctx.y += 14;
          } else {
            paraBuffer.push(trimmed.replace(/\*\*/g, '').replace(/\*/g, ''));
          }
        }
        flushPara();
      }

      // =============================================
      // YEAR-AHEAD HIGHLIGHTS & MONTHLY FORECASTS
      // =============================================
      doc.addPage(); ctx.y = margin;
      ctx.sectionPages.set('BEST MONTHS AND HIGHLIGHTS', doc.getNumberOfPages());
      generateHighlightsPage(ctx, doc, analysis, srChart, natalChart);

      // =============================================
      // QUARTERLY SUMMARY — YOUR YEAR IN FOUR SEASONS
      // =============================================
      doc.addPage(); ctx.y = margin;
      ctx.sectionPages.set('YOUR YEAR IN FOUR SEASONS', doc.getNumberOfPages());
      generateQuarterlySummary(ctx, doc, analysis, srChart, natalChart);

      // =============================================
      // BIRTHDAY AFFIRMATION CARD (birthday mode)
      // =============================================
      if (birthdayMode) {
        // Only add a new page if we're not already at the top of one
        if (ctx.y > margin + 10) {
          doc.addPage();
        }
        ctx.y = margin;
        ctx.sectionPages.set('BIRTHDAY AFFIRMATION CARD', doc.getNumberOfPages());
        generateAffirmationCard(ctx, doc, analysis, natalChart, srChart);
      }

      // =============================================
      // GOLD BORDERS on all pages
      // =============================================
      if (goldBorders) {
        const totalPages = doc.getNumberOfPages();
        const realGold: [number, number, number] = [190, 155, 80];
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setDrawColor(...realGold); doc.setLineWidth(2.5);
          doc.rect(18, 18, pw - 36, ph - 36);
          doc.setLineWidth(0.8);
          doc.rect(23, 23, pw - 46, ph - 46);
          // Corner ornaments
          const corners = [[27, 27], [pw - 27, 27], [27, ph - 27], [pw - 27, ph - 27]];
          doc.setFillColor(...realGold);
          for (const [cx2, cy2] of corners) {
            doc.circle(cx2, cy2, 3.5, 'F');
          }
          // Small diamond ornaments at midpoints
          const midX = pw / 2;
          const midY = ph / 2;
          doc.setFillColor(...realGold);
          // Top center
          doc.triangle(midX, 15, midX - 4, 20, midX + 4, 20, 'F');
          doc.triangle(midX, 25, midX - 4, 20, midX + 4, 20, 'F');
          // Bottom center
          doc.triangle(midX, ph - 15, midX - 4, ph - 20, midX + 4, ph - 20, 'F');
          doc.triangle(midX, ph - 25, midX - 4, ph - 20, midX + 4, ph - 20, 'F');
        }
      }

      // Add clickable links to the Table of Contents
      addTOCLinks(doc, tocPageNumber, tocEntries, ctx);

      // No page numbers per v3 spec

      const name2 = natalChart.name || 'Chart';
      doc.save(`Solar-Return-${srChart.solarReturnYear}-${name2.replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start gap-4">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={birthdayMode} onChange={(e) => setBirthdayMode(e.target.checked)}
            className="rounded border-border accent-primary w-4 h-4" />
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Birthday Gift Mode</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={goldBorders} onChange={(e) => setGoldBorders(e.target.checked)}
            className="rounded border-border accent-primary w-4 h-4" />
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Decorative Gold Borders</span>
        </label>
      </div>

      {birthdayMode && (
        <div className="border border-primary/20 rounded-sm p-3 bg-primary/5 space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-primary block">Personal Message</label>
          <textarea value={personalMessage} onChange={(e) => setPersonalMessage(e.target.value)}
            placeholder="Happy birthday! Wishing you an amazing year ahead..." rows={3}
            className="w-full border border-border bg-background text-foreground rounded-sm px-3 py-2 text-sm resize-none placeholder:text-muted-foreground/50" />
        </div>
      )}

      {narrative && narrative.trim().length > 0 && (
        <button onClick={generatePDF} disabled={generating}
          className="text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-sm inline-flex items-center gap-1 disabled:opacity-50 bg-[hsl(var(--tier-3))] text-[hsl(var(--tier-3-accent))] border border-[hsl(var(--tier-3-accent)/0.3)] hover:border-[hsl(var(--tier-3-accent)/0.6)]">
          {generating ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
          {generating ? 'Generating...' : 'Birthday Gift PDF'}
        </button>
      )}
    </div>
  );
};

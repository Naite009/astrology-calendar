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
  const [birthdayMode, setBirthdayMode] = useState(false);
  const [personalMessage, setPersonalMessage] = useState('');
  const [goldBorders, setGoldBorders] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();
      const margin = 50;
      const contentW = pw - margin * 2;

      // Apply sign-specific color theme if birthday mode
      const sunSign = natalChart.planets?.Sun?.sign || '';
      const signTheme = birthdayMode && sunSign ? signColorThemes[sunSign] : undefined;
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
      // BIG THREE (birthday mode) or always
      // =============================================
      doc.addPage(); ctx.y = margin;
      ctx.sectionPages.set('YOUR BIG THREE', doc.getNumberOfPages());
      generateStrengthsPortrait(ctx, doc, natalChart, analysis);

      // =============================================
      // PAGE 3+: YEAR AT A GLANCE (own page, beautiful)
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
        doc.addPage(); ctx.y = margin;
        ctx.sectionPages.set('MOON SIGN SHIFT', doc.getNumberOfPages());
        ctx.drawGoldRule(doc); ctx.y += 20;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
        doc.setTextColor(...ctx.colors.gold);
        doc.text('MOON SIGN SHIFT — YOUR EMOTIONAL YEAR', margin, ctx.y); ctx.y += 20;

        const halfW = (contentW - 16) / 2;
        const natalDeep = moonSignDeep[natalMoonSign];
        const srDeep = moonSignDeep[srMoonSignFull];
        const boxH = 110;
        const moonBoxY = ctx.y;

        ctx.drawContentBox(doc, margin, moonBoxY, halfW, boxH, ctx.colors.softGold);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...ctx.colors.deepBrown);
        doc.text('NATAL MOON', margin + 12, moonBoxY + 16);
        doc.setFontSize(16); doc.setTextColor(...ctx.colors.gold);
        doc.text(natalMoonSign.toUpperCase(), margin + 12, moonBoxY + 35);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...ctx.colors.bodyText);
        const natalMoonLines = doc.splitTextToSize(natalDeep?.emotional || '', halfW - 24);
        natalMoonLines.slice(0, 6).forEach((line: string, i: number) => {
          doc.text(line, margin + 12, moonBoxY + 50 + i * 11);
        });

        const srBoxX = margin + halfW + 16;
        ctx.drawContentBox(doc, srBoxX, moonBoxY, halfW, boxH, ctx.colors.softBlue);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...ctx.colors.deepBrown);
        doc.text('THIS YEAR\'S MOON', srBoxX + 12, moonBoxY + 16);
        doc.setFontSize(16); doc.setTextColor(...ctx.colors.gold);
        doc.text(srMoonSignFull.toUpperCase(), srBoxX + 12, moonBoxY + 35);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...ctx.colors.bodyText);
        const srMoonLines = doc.splitTextToSize(srDeep?.emotional || '', halfW - 24);
        srMoonLines.slice(0, 6).forEach((line: string, i: number) => {
          doc.text(line, srBoxX + 12, moonBoxY + 50 + i * 11);
        });

        ctx.y = moonBoxY + boxH + 12;

        if (natalMoonSign !== srMoonSignFull) {
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, `The Shift: ${natalMoonSign} --> ${srMoonSignFull}`, ctx.colors.deepBrown, 11);
            ctx.y += 2;
            const specificNarrative = moonShiftNarrative[natalMoonSign]?.[srMoonSignFull];
            if (specificNarrative) ctx.writeBody(doc, specificNarrative, ctx.colors.bodyText, 9.5);
            ctx.y += 4;
            if (srDeep) {
              ctx.writeCardSection(doc, 'Body', srDeep.body, ctx.colors.accentGreen);
              ctx.writeCardSection(doc, 'Apply', srDeep.apply, ctx.colors.gold);
              ctx.writeCardSection(doc, 'Daily Life', srDeep.looksLike, ctx.colors.accentRust);
            }
          });
        } else {
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, `Moon Stays in ${natalMoonSign} — Emotional Continuity`, ctx.colors.deepBrown, 11);
            ctx.writeBody(doc, 'Your SR Moon matches natal. This year amplifies your emotional instincts. Trust your gut.');
          });
        }
      }

      // =============================================
      // SOLAR RETURN VS NATAL — own page
      // =============================================
      doc.addPage(); ctx.y = margin;
      ctx.sectionPages.set('SOLAR RETURN VS NATAL', doc.getNumberOfPages());
      ctx.drawGoldRule(doc); ctx.y += 20;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
      doc.setTextColor(...ctx.colors.gold);
      doc.text('SOLAR RETURN VS NATAL', margin, ctx.y); ctx.y += 20;
      
      // Table with rounded container
      const tableStartY = ctx.y;
      
      // Header row with full-width gold background
      doc.setFillColor(...ctx.colors.gold);
      doc.roundedRect(margin, ctx.y - 12, contentW, 20, 4, 4, 'F');
      const cols = [margin + 8, margin + 68, margin + 180, margin + 222, margin + 335, margin + 378];
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(255, 255, 255);
      ['PLANET', 'SR POSITION', 'SR H', 'NATAL POSITION', 'NAT H', 'SHIFT'].forEach((h, i) => doc.text(h, cols[i], ctx.y));
      ctx.y += 14;

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
        const rowIdx = PLANET_ORDER.indexOf(p);
        if (rowIdx % 2 === 0) { 
          doc.setFillColor(...ctx.colors.softGold); 
          doc.rect(margin, ctx.y - 11, contentW, 17, 'F'); 
        }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...ctx.colors.deepBrown);
        doc.text(P[p] || p, cols[0], ctx.y);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...ctx.colors.bodyText);
        doc.text(srPos ? `${srPos.sign} ${srPos.degree}'` : '--', cols[1], ctx.y);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...ctx.colors.gold);
        doc.text(srH != null ? `H${srH}` : '--', cols[2], ctx.y);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...ctx.colors.bodyText);
        doc.text(natPos ? `${natPos.sign} ${natPos.degree}'` : '--', cols[3], ctx.y);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...ctx.colors.gold);
        doc.text(natH != null ? `H${natH}` : '--', cols[4], ctx.y);
        doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(...ctx.colors.dimText); 
        doc.text(shift, cols[5], ctx.y);
        ctx.y += 17;
      }
      // Table border
      doc.setDrawColor(...ctx.colors.warmBorder); doc.setLineWidth(0.5);
      doc.roundedRect(margin, tableStartY - 12, contentW, ctx.y - tableStartY + 16, 4, 4, 'S');
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
            ctx.writeBold(doc, `${s.planets.length}-Planet Stellium in ${isHouseStellium ? 'House ' + houseNum : s.location}`, ctx.colors.gold, 12);
            ctx.y += 2;

            // Planet chips inline
            doc.setFillColor(...ctx.colors.softGold);
            doc.roundedRect(margin + 6, ctx.y, contentW - 12, 22, 4, 4, 'F');
            doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...ctx.colors.deepBrown);
            doc.text(planets, margin + 16, ctx.y + 15);
            ctx.y += 28;

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
            ctx.drawGoldRule(doc); ctx.y += 16;
            doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
            doc.setTextColor(...ctx.colors.gold);
            doc.text('STELLIUMS BY HOUSE', margin, ctx.y); ctx.y += 16;
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
      if (analysis.elementBalance) {
        ctx.sectionTitle(doc, 'ELEMENT & MODALITY');
        ctx.sectionPages.set('ELEMENT AND MODALITY', doc.getNumberOfPages());
        ctx.drawGoldRule(doc); ctx.y += 20;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
        doc.setTextColor(...ctx.colors.gold);
        doc.text('WHERE YOUR ENERGY LIVES', margin, ctx.y); ctx.y += 20;

        const hem = analysis.hemisphericEmphasis;
        const total = hem.totalCounted;
        const quadPlanets: Record<string, string[]> = { upper: [], lower: [], east: [], west: [] };
        for (const p of PLANET_ORDER) {
          const h = analysis.planetSRHouses?.[p];
          if (h == null) continue;
          if (h >= 7 && h <= 12) quadPlanets.upper.push(P[p] || p); else quadPlanets.lower.push(P[p] || p);
          if (h >= 10 || h <= 3) quadPlanets.east.push(P[p] || p); else quadPlanets.west.push(P[p] || p);
        }

        // 2x2 grid
        ctx.drawCard(doc, () => {
          const boxW = (contentW - 40) / 2;
          const boxH = 80;
          const gridData = [
            { label: 'UPPER', sub: 'Public & Visible', count: hem.upper, planets: quadPlanets.upper, bg: [240, 245, 255] as [number, number, number], row: 0, col: 0 },
            { label: 'LOWER', sub: 'Private & Internal', count: hem.lower, planets: quadPlanets.lower, bg: [255, 248, 240] as [number, number, number], row: 0, col: 1 },
            { label: 'EASTERN', sub: 'Self-Initiated', count: hem.east, planets: quadPlanets.east, bg: [240, 252, 245] as [number, number, number], row: 1, col: 0 },
            { label: 'WESTERN', sub: 'Other-Oriented', count: hem.west, planets: quadPlanets.west, bg: [252, 242, 245] as [number, number, number], row: 1, col: 1 },
          ];
          const gridStartY = ctx.y;
          for (const g of gridData) {
            const x = margin + 8 + g.col * (boxW + 12);
            const by = gridStartY + g.row * (boxH + 8);
            const isDom = g.count > total / 2;
            doc.setFillColor(...g.bg);
            doc.setDrawColor(...(isDom ? ctx.colors.gold : ctx.colors.warmBorder));
            doc.setLineWidth(isDom ? 2.5 : 0.5);
            doc.roundedRect(x, by, boxW, boxH, 6, 6, 'FD');
            doc.setFont('helvetica', 'bold'); doc.setFontSize(26);
            doc.setTextColor(...(isDom ? ctx.colors.gold : ctx.colors.darkText));
            doc.text(String(g.count), x + 18, by + 28);
            doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
            doc.setTextColor(...ctx.colors.deepBrown);
            doc.text(g.label, x + 52, by + 18);
            doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5);
            doc.setTextColor(...ctx.colors.dimText);
            doc.text(g.sub, x + 52, by + 30);
            if (g.planets.length > 0) {
              doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
              doc.setTextColor(...ctx.colors.bodyText);
              const planetLines = doc.splitTextToSize(g.planets.join(', '), boxW - 30);
              planetLines.forEach((line: string, li: number) => doc.text(line, x + 18, by + 46 + li * 11));
            }
            if (isDom) {
              doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
              doc.setTextColor(...ctx.colors.gold);
              doc.text('DOMINANT', x + boxW - 8, by + 12, { align: 'right' });
            }
          }
          ctx.y = gridStartY + (boxH + 8) * 2 + 4;
        });

        // Angular Planets — on same page
        if (analysis.angularPlanets && analysis.angularPlanets.length > 0) {
          ctx.y += 10;
          ctx.writeBold(doc, 'ANGULAR PLANETS — Most Powerful This Year', ctx.colors.gold, 12);
          ctx.y += 8;
          
          // Render each angular planet as a mini box
          const angBoxW = (contentW - 16) / Math.min(analysis.angularPlanets.length, 3);
          const angBoxH = 90;
          const angStartY = ctx.y;
          
          analysis.angularPlanets.forEach((ap, i) => {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const x = margin + col * (angBoxW + 8);
            const by = angStartY + row * (angBoxH + 8);
            
            ctx.drawContentBox(doc, x, by, angBoxW - 8, angBoxH, ctx.colors.softGold);
            doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(...ctx.colors.gold);
            doc.text(P[ap] || ap, x + 10, by + 20);
            
            const pm = planetLifeMeanings[ap] || planetLifeMeanings[ap.replace('NorthNode','North Node')];
            if (pm) {
              doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...ctx.colors.bodyText);
              const pmLines = doc.splitTextToSize(pm.inYourLife, angBoxW - 28);
              pmLines.slice(0, 5).forEach((line: string, li: number) => doc.text(line, x + 10, by + 36 + li * 10));
            }
          });
          ctx.y = angStartY + (Math.ceil(analysis.angularPlanets.length / 3)) * (angBoxH + 8);
        }
      }

      // =============================================
      // LORD OF THE YEAR — own page
      // =============================================
      if (analysis.lordOfTheYear) {
        doc.addPage(); ctx.y = margin;
        ctx.sectionPages.set('LORD OF THE YEAR', doc.getNumberOfPages());
        ctx.drawGoldRule(doc); ctx.y += 20;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
        doc.setTextColor(...ctx.colors.gold);
        doc.text('LORD OF THE YEAR', margin, ctx.y); ctx.y += 20;

        const lord = analysis.lordOfTheYear;

        // Header box with key info
        doc.setFillColor(...ctx.colors.softGold);
        doc.setDrawColor(...ctx.colors.gold); doc.setLineWidth(2);
        doc.roundedRect(margin, ctx.y, contentW, 60, 6, 6, 'FD');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(20);
        doc.setTextColor(...ctx.colors.gold);
        doc.text(`${P[lord.planet] || lord.planet}`, margin + 20, ctx.y + 28);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
        doc.setTextColor(...ctx.colors.bodyText);
        doc.text(`${lord.srSign} — SR House ${lord.srHouse || '--'}`, margin + 20, ctx.y + 46);
        // Dignity + Rx badges on right
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
        doc.setTextColor(...ctx.colors.deepBrown);
        doc.text(`Dignity: ${lord.dignity}`, pw - margin - 120, ctx.y + 28);
        if (lord.isRetrograde) {
          doc.setTextColor(...ctx.colors.accentRust);
          doc.text('RETROGRADE', pw - margin - 120, ctx.y + 42);
        }
        ctx.y += 70;

        // Detailed meaning
        const detailedMeaning = timeLordDetailedMeaning[lord.planet];
        if (detailedMeaning) {
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, 'What This Means For Your Year', ctx.colors.accentGreen, 11);
            ctx.y += 2;
            ctx.writeBody(doc, detailedMeaning, ctx.colors.bodyText, 10, 14);
          });
        }

        const pm = planetLifeMeanings[lord.planet];
        if (pm) {
          ctx.drawCard(doc, () => {
            ctx.writeCardSection(doc, 'What It Rules', pm.inYourLife, ctx.colors.gold);
            ctx.writeCardSection(doc, 'How You Feel It', pm.bodyFeeling, ctx.colors.accentRust);
          });
        }

        // Where the Lord sits natally — the activation area
        if (lord.srHouse) {
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, `${P[lord.planet] || lord.planet} in SR House ${lord.srHouse} — Where the Year Plays Out`, ctx.colors.gold, 11);
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
            const hInterp = lordHouseInterp[lord.srHouse!];
            if (hInterp) ctx.writeBody(doc, hInterp, ctx.colors.bodyText, 10, 14);
          });
        }

        if (lord.dignity === 'Detriment' || lord.dignity === 'Fall') {
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, 'Dignity Warning', ctx.colors.accentRust, 10);
            ctx.writeBody(doc, `Your Time Lord is in ${lord.dignity}. This means ${P[lord.planet] || lord.planet} is working outside its comfort zone — plans may require more effort, communication needs extra clarity. The growth is deeper and the lessons stick.`, ctx.colors.bodyText, 10);
          }, ctx.colors.accentRust);
        }
        if (lord.dignity === 'Domicile' || lord.dignity === 'Exaltation') {
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, 'Dignity Advantage', ctx.colors.accentGreen, 10);
            ctx.writeBody(doc, `Your Time Lord is in ${lord.dignity} — this is ${P[lord.planet] || lord.planet} at ${lord.dignity === 'Domicile' ? 'full strength, operating in its own sign' : 'peak performance, elevated and supported by sign'}. The year's agenda flows more naturally. ${P[lord.planet] || lord.planet}'s themes are expressed with clarity and authority. Results come with less friction.`, ctx.colors.bodyText, 10);
          }, ctx.colors.accentGreen);
        }
        if (lord.isRetrograde) {
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, 'Retrograde Effect', ctx.colors.accentRust, 10);
            ctx.writeBody(doc, `${P[lord.planet] || lord.planet} retrograde as Time Lord means this year has a built-in "review and revise" quality. Things from the past resurface — old projects, unfinished conversations, former connections. What comes back around deserves a second look. New initiatives may stall until you address what was left incomplete. The retrograde does not block progress — it redirects it through revision.`, ctx.colors.bodyText, 10);
          }, ctx.colors.accentRust);
        }
      }

      // =============================================
      // SATURN & NORTH NODE — own page
      // =============================================
      if (analysis.saturnFocus || analysis.nodesFocus) {
        doc.addPage(); ctx.y = margin;
        ctx.sectionPages.set('SATURN AND NORTH NODE', doc.getNumberOfPages());
        ctx.drawGoldRule(doc); ctx.y += 20;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
        doc.setTextColor(...ctx.colors.gold);
        doc.text('SATURN & NORTH NODE', margin, ctx.y); ctx.y += 20;

        // Brief why card
        ctx.drawCard(doc, () => {
          ctx.writeBold(doc, 'Why These Two Matter', ctx.colors.gold, 11);
          ctx.writeBody(doc, 'Saturn = WHERE YOU ARE TESTED. The area of life where shortcuts fail and real work produces lasting results. North Node = WHERE YOUR SOUL IS GROWING. The direction that feels unfamiliar but is exactly what this year requires.', ctx.colors.bodyText, 10, 14);
        });

        if (analysis.saturnFocus) {
          ctx.drawCard(doc, () => {
            // Saturn header box
            doc.setFillColor(...ctx.colors.softGold);
            doc.roundedRect(margin + 6, ctx.y - 4, contentW - 12, 30, 4, 4, 'F');
            doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(...ctx.colors.gold);
            doc.text(`Saturn in ${analysis.saturnFocus!.sign} — House ${analysis.saturnFocus!.house || '--'}${analysis.saturnFocus!.isRetrograde ? ' (Rx)' : ''}`, margin + 16, ctx.y + 14);
            ctx.y += 34;
            const satMeaning = saturnHouseMeaning[analysis.saturnFocus!.house];
            if (satMeaning) ctx.writeBody(doc, satMeaning, ctx.colors.bodyText, 10, 14);
            
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
            doc.setFillColor(...ctx.colors.softBlue);
            doc.roundedRect(margin + 6, ctx.y - 4, contentW - 12, 30, 4, 4, 'F');
            doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(...ctx.colors.gold);
            doc.text(`North Node in ${analysis.nodesFocus!.sign} — House ${analysis.nodesFocus!.house || '--'}`, margin + 16, ctx.y + 14);
            ctx.y += 34;
            const nodeMeaning = nodeHouseMeaning[analysis.nodesFocus!.house];
            if (nodeMeaning) ctx.writeBody(doc, nodeMeaning, ctx.colors.bodyText, 10, 14);
            
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
        
        doc.addPage(); ctx.y = margin;
        ctx.sectionPages.set('KEY ASPECTS', doc.getNumberOfPages());
        ctx.drawGoldRule(doc); ctx.y += 20;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
        doc.setTextColor(...ctx.colors.gold);
        doc.text('KEY ASPECTS', margin, ctx.y); ctx.y += 8;
        doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.setTextColor(...ctx.colors.dimText);
        doc.text('How Solar Return planets activate your natal chart', margin, ctx.y); ctx.y += 16;

        for (let i = 0; i < Math.min(majorAspects.length, 8); i++) {
          const asp = majorAspects[i];
          const interp = generateSRtoNatalInterpretation(asp.planet1, asp.planet2, asp.type, asp.orb);
          const isHard = ['Square', 'Opposition', 'Quincunx'].includes(asp.type);
          const srH = analysis.planetSRHouses?.[asp.planet1];
          const natalH = natalChart.planets?.[asp.planet2]?.house;
          
          ctx.checkPage(160);
          
          // Aspect header with colored accent
          const accentColor = isHard ? [180, 100, 60] as [number, number, number] : ctx.colors.gold;
          ctx.drawCard(doc, () => {
            // Title bar
            doc.setFillColor(...(isHard ? [255, 245, 240] as [number, number, number] : ctx.colors.softGold));
            doc.roundedRect(margin + 6, ctx.y - 4, contentW - 12, 26, 4, 4, 'F');
            doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5);
            doc.setTextColor(...accentColor);
            doc.text(`SR ${P[asp.planet1] || asp.planet1}  ${asp.type}  Natal ${P[asp.planet2] || asp.planet2}`, margin + 16, ctx.y + 10);
            doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...ctx.colors.dimText);
            const orbHouse = `${asp.orb}' orb${srH ? `  |  SR H${srH}` : ''}${natalH ? `  |  Natal H${natalH}` : ''}`;
            doc.text(orbHouse, pw - margin - 12, ctx.y + 10, { align: 'right' });
            ctx.y += 30;

            ctx.writeCardSection(doc, 'How It Feels', interp.howItFeels, ctx.colors.accentGreen);
            ctx.writeCardSection(doc, 'What It Means', interp.whatItMeans, ctx.colors.gold);
            ctx.writeCardSection(doc, 'What To Do', interp.whatToDo, ctx.colors.accentRust);
          }, accentColor);
        }
      }

      // =============================================
      // YOUR MOON THIS YEAR — own page
      // =============================================
      if (analysis.srMoonAspects || analysis.moonVOC || analysis.moonAngularity) {
        doc.addPage(); ctx.y = margin;
        ctx.sectionPages.set('YOUR MOON THIS YEAR', doc.getNumberOfPages());
        ctx.drawGoldRule(doc); ctx.y += 20;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
        doc.setTextColor(...ctx.colors.gold);
        doc.text('YOUR MOON THIS YEAR — EMOTIONAL CLIMATE', margin, ctx.y); ctx.y += 20;

        // Moon VOC
        if (analysis.moonVOC) {
          ctx.drawCard(doc, () => {
            doc.setFillColor(255, 248, 235);
            doc.roundedRect(margin + 6, ctx.y - 4, contentW - 12, 26, 4, 4, 'F');
            doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(180, 130, 40);
            doc.text('Moon Void of Course — The Unaspected Moon', margin + 16, ctx.y + 10);
            ctx.y += 30;
            ctx.writeBody(doc, 'Your Solar Return Moon makes no major aspects to any other planet in the SR chart. This is a rare and significant condition.', ctx.colors.darkText, 10);
            ctx.y += 4;
            ctx.writeCardSection(doc, 'What This Means', 'An unaspected SR Moon operates in isolation — your emotional life this year runs on its own track. Feelings are vivid but disconnected from the rest of the chart\'s story.', [180, 130, 40]);
            ctx.writeCardSection(doc, 'The Gift', 'Without planetary aspects pulling it in different directions, the Moon is free. Your emotional compass this year is entirely your own.', ctx.colors.accentGreen);
            ctx.writeCardSection(doc, 'The Challenge', 'Without aspects to ground or activate the Moon, emotional needs may go unmet unless you consciously name and honor them.', ctx.colors.accentRust);
          }, [180, 130, 40]);
        }

        // Angularity
        if (analysis.moonAngularity) {
          const angDesc: Record<string, string> = {
            angular: 'Your SR Moon is angular (close to an angle). Emotional responses are instinctive, automatic, and highly reactive. You are close to every situation — perspective is harder, but feelings are powerfully felt and visible to others.',
            succedent: 'Your SR Moon is in a succedent house. Emotional responses are stable and grounded this year. You can step back and examine situations without being overwhelmed.',
            cadent: 'Your SR Moon is in a cadent house. Emotional responses are more adaptive this year. You process feelings internally, preparing rather than reacting.',
          };
          ctx.drawCard(doc, () => {
            doc.setFillColor(...ctx.colors.softGold);
            doc.roundedRect(margin + 6, ctx.y - 4, contentW - 12, 26, 4, 4, 'F');
            doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...ctx.colors.gold);
            doc.text(`Moon: ${analysis.moonSign || ''} in House ${analysis.moonHouse?.house || '--'}`, margin + 16, ctx.y + 10);
            ctx.y += 30;
            ctx.writeBody(doc, angDesc[analysis.moonAngularity!], ctx.colors.bodyText, 10, 14);
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
          ctx.writeBold(doc, 'Moon Aspects This Year', ctx.colors.gold, 11);
          ctx.y += 6;
          for (const asp of analysis.srMoonAspects.slice(0, 6)) {
            const isHard = ['Square', 'Opposition', 'Quincunx'].includes(asp.aspectType);
            ctx.checkPage(80);
            ctx.drawCard(doc, () => {
              doc.setFillColor(...(isHard ? [255, 245, 240] as [number, number, number] : ctx.colors.softGold));
              doc.roundedRect(margin + 6, ctx.y - 4, contentW - 12, 22, 4, 4, 'F');
              doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
              doc.setTextColor(...(isHard ? [180, 100, 60] as [number, number, number] : ctx.colors.gold));
              doc.text(`Moon ${asp.aspectType} ${P[asp.targetPlanet] || asp.targetPlanet}`, margin + 16, ctx.y + 10);
              doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...ctx.colors.dimText);
              doc.text(`${asp.orb}' orb${asp.targetSRHouse ? `  |  H${asp.targetSRHouse}` : ''}`, pw - margin - 12, ctx.y + 10, { align: 'right' });
              ctx.y += 26;
              ctx.writeBody(doc, asp.interpretation, ctx.colors.bodyText, 9.5, 13);
            }, isHard ? [180, 100, 60] : ctx.colors.gold);
          }
        }
      }

      // =============================================
      // VERTEX
      // =============================================
      if (analysis.vertex) {
        ctx.checkPage(200);
        if (ctx.y > margin + 100) { doc.addPage(); ctx.y = margin; }
        ctx.sectionPages.set('VERTEX', doc.getNumberOfPages());
        ctx.drawGoldRule(doc); ctx.y += 20;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
        doc.setTextColor(...ctx.colors.gold);
        doc.text('VERTEX — FATED ENCOUNTERS', margin, ctx.y); ctx.y += 20;
        ctx.drawCard(doc, () => {
          ctx.writeBold(doc, `Vertex: ${analysis.vertex!.sign} ${analysis.vertex!.degree}' ${analysis.vertex!.house ? `(House ${analysis.vertex!.house})` : ''}`, ctx.colors.deepBrown, 11);
          const vSign = vertexInSign[analysis.vertex!.sign];
          if (vSign) {
            ctx.writeCardSection(doc, 'Fated Theme', vSign.fatedTheme, ctx.colors.gold);
            ctx.writeCardSection(doc, 'Who May Appear', vSign.encounters, ctx.colors.accentGreen);
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
        doc.addPage(); ctx.y = margin;
        ctx.sectionPages.set('PLANET SPOTLIGHT', doc.getNumberOfPages());
        ctx.drawGoldRule(doc); ctx.y += 20;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
        doc.setTextColor(...ctx.colors.gold);
        doc.text('PLANET SPOTLIGHT', margin, ctx.y); ctx.y += 8;
        doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.setTextColor(...ctx.colors.dimText);
        doc.text('Each planet\'s placement in your Solar Return and what it means for the year', margin, ctx.y); ctx.y += 16;

        for (const planet of spotlightPlanets) {
          const h = analysis.planetSRHouses[planet]!;
          const data = deepData[planet][h];
          if (!data) continue;
          ctx.checkPage(180);
          ctx.drawCard(doc, () => {
            // Planet header box
            doc.setFillColor(...ctx.colors.softGold);
            doc.roundedRect(margin + 6, ctx.y - 4, contentW - 12, 26, 4, 4, 'F');
            doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
            doc.setTextColor(...ctx.colors.gold);
            doc.text(`${P[planet] || planet} in House ${h}`, margin + 16, ctx.y + 10);
            doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...ctx.colors.deepBrown);
            doc.text(data.title || '', pw - margin - 12, ctx.y + 10, { align: 'right' });
            ctx.y += 32;

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
        doc.addPage(); ctx.y = margin;
        ctx.sectionPages.set('YEAR-AHEAD READING', doc.getNumberOfPages());
        ctx.drawGoldRule(doc); ctx.y += 20;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
        doc.setTextColor(...ctx.colors.gold);
        doc.text('YEAR-AHEAD READING', margin, ctx.y); ctx.y += 20;

        const lines = narrative.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) { ctx.y += 6; continue; }
          if (trimmed.startsWith('## ')) {
            ctx.checkPage(60); ctx.y += 10;
            doc.setDrawColor(...ctx.colors.softGold); doc.setLineWidth(0.5); doc.line(margin, ctx.y, pw - margin, ctx.y);
            ctx.y += 12;
            ctx.writeBold(doc, trimmed.replace('## ', '').toUpperCase(), ctx.colors.gold, 11); ctx.y += 4;
          } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
            ctx.checkPage(30); ctx.writeBold(doc, trimmed.replace(/\*\*/g, ''), ctx.colors.darkText, 10);
          } else {
            const clean = trimmed.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/[^\x00-\x7F]/g, '');
            ctx.writeBody(doc, clean, ctx.colors.bodyText, 9.5, 14);
          }
        }
      }

      // =============================================
      // YEAR-AHEAD HIGHLIGHTS & MONTHLY FORECASTS
      // =============================================
      doc.addPage(); ctx.y = margin;
      ctx.sectionPages.set('BEST MONTHS AND HIGHLIGHTS', doc.getNumberOfPages());
      generateHighlightsPage(ctx, doc, analysis);

      // =============================================
      // BIRTHDAY AFFIRMATION CARD (birthday mode)
      // =============================================
      if (birthdayMode) {
        doc.addPage(); ctx.y = margin;
        ctx.sectionPages.set('BIRTHDAY AFFIRMATION CARD', doc.getNumberOfPages());
        generateAffirmationCard(ctx, doc, analysis, natalChart);
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

      // Add page numbers to every page (skip cover page 1; skip in birthday mode for clean frameable pages)
      if (!birthdayMode) {
        const totalPages = doc.getNumberOfPages();
        for (let i = 2; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(...ctx.colors.dimText);
          doc.text(`${i}`, pw / 2, ph - 28, { align: 'center' });
        }
      }

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

      <button onClick={generatePDF} disabled={generating}
        className="text-[11px] uppercase tracking-widest px-3 py-1.5 border border-border rounded-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 disabled:opacity-50">
        {generating ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
        {generating ? 'Generating...' : birthdayMode ? 'Download Birthday Gift PDF' : 'Download PDF'}
      </button>
    </div>
  );
};

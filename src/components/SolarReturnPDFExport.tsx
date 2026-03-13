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
  'Balsamic': 'Completion and surrender. The quietest, most inward phase. This is a year for rest, reflection, and tying up loose ends. Honor the ending — what comes next will arrive on its own timing.',
  'Balsamic Moon': 'Completion and surrender. The quietest, most inward phase. This is a year for rest, reflection, and tying up loose ends. Honor the ending — what comes next will arrive on its own timing.',
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
      // PERSONAL STRENGTHS PORTRAIT (birthday mode)
      // =============================================
      if (birthdayMode) {
        doc.addPage(); ctx.y = margin;
        ctx.sectionPages.set('YOUR NATAL FOUNDATION', doc.getNumberOfPages());
        generateStrengthsPortrait(ctx, doc, natalChart);
      }

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

        // Profection explanation
        ctx.y += 12;
        ctx.drawCard(doc, () => {
          ctx.writeBold(doc, 'What Is a Profection Year?', ctx.colors.gold, 11);
          ctx.writeBody(doc, 'Annual Profections are a Hellenistic timing technique that assigns one house of your chart to each year of life. Starting at House 1 when you\'re born, each birthday advances to the next house. At age 12 you\'re back to House 1, and the cycle repeats. The house activated this year tells you WHERE life is asking you to focus — it\'s like a spotlight shining on one department of your life.');
          ctx.y += 4;
          ctx.writeBold(doc, 'What Is a Time Lord?', ctx.colors.gold, 11);
          ctx.writeBody(doc, 'The planet that RULES your activated profection house becomes your "Time Lord" — the planet running the show this year. Every transit to or from your Time Lord hits harder. Every aspect involving your Time Lord matters more. Think of the Time Lord as the CEO of your year: all the other planets are employees, but the Time Lord sets the agenda. When you see your Time Lord show up in aspects, transits, or SR placements, pay extra attention — that\'s where the year\'s most important story is being told.');
        });
      }

      // =============================================
      // MOON SIGN SHIFT
      // =============================================
      const natalMoonSign = natalChart.planets.Moon?.sign;
      const srMoonSignFull = analysis.moonSign;
      if (natalMoonSign && srMoonSignFull) {
        ctx.sectionTitle(doc, 'Moon Sign Shift -- Your Emotional Year');

        const halfW = (contentW - 16) / 2;
        const natalDeep = moonSignDeep[natalMoonSign];
        const srDeep = moonSignDeep[srMoonSignFull];
        const boxH = 110;
        ctx.checkPage(boxH + 180);
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
          ctx.checkPage(160);
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
          ctx.checkPage(60);
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, `Moon Stays in ${natalMoonSign} -- Emotional Continuity`, ctx.colors.deepBrown, 11);
            ctx.writeBody(doc, 'Your SR Moon matches natal. This year amplifies your emotional instincts. Trust your gut.');
          });
        }
        ctx.y += 6;
      }

      // =============================================
      // COMPARISON TABLE — Beautiful card style
      // =============================================
      ctx.sectionTitle(doc, 'Solar Return vs Natal');
      
      // Table with rounded container
      const tableStartY = ctx.y;
      ctx.checkPage(16);
      
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
      // STELLIUMS
      // =============================================
      if (analysis.stelliums.length > 0) {
        ctx.sectionTitle(doc, 'Stelliums');
        for (const s of analysis.stelliums) {
          const planets = s.planets.map(pp => P[pp] || pp).join(', ');
          const isHouseStellium = /^\d+$/.test(String(s.location)) || s.location.startsWith('House');
          const houseNum = parseInt(String(s.location).replace('House ', '').replace('House', ''));
          ctx.checkPage(200);
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, `${s.planets.length}-Planet Stellium in ${isHouseStellium ? 'House ' + houseNum : s.location}`, ctx.colors.deepBrown, 12);
            doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...ctx.colors.gold);
            doc.text(planets, margin + 14, ctx.y); ctx.y += 16;
            if (!isHouseStellium) {
              const signMeaning = stelliumSignMeaning[s.location];
              if (signMeaning) ctx.writeCardSection(doc, 'Theme', signMeaning, ctx.colors.gold);
              const felt = stelliumFeltSense[s.location];
              if (felt) ctx.writeCardSection(doc, 'Felt Sense', felt, ctx.colors.accentGreen);
              ctx.y += 2;
              ctx.writeBold(doc, 'What These Planets Bring Together:', ctx.colors.accentRust, 9.5);
              for (const pp of s.planets) {
                const role = stelliumPlanetRoles[pp];
                if (role) {
                  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...ctx.colors.deepBrown);
                  ctx.checkPage(14);
                  doc.text(`${P[pp] || pp}:`, margin + 16, ctx.y);
                  const labelW = doc.getTextWidth(`${P[pp] || pp}: `);
                  doc.setFont('helvetica', 'normal'); doc.setTextColor(...ctx.colors.bodyText);
                  const roleLines = doc.splitTextToSize(role, contentW - 32 - labelW);
                  doc.text(roleLines[0] || '', margin + 16 + labelW, ctx.y);
                  ctx.y += 14;
                }
              }
            } else if (!isNaN(houseNum)) {
              const houseMeaning = stelliumHouseMeaning[houseNum];
              if (houseMeaning) ctx.writeBody(doc, houseMeaning);
            }
          });
        }
      }

      // =============================================
      // ELEMENTS & MODALITY — Polished card style
      // =============================================
      if (analysis.elementBalance) {
        ctx.sectionTitle(doc, 'Element & Modality');
        const eb = analysis.elementBalance;
        const mb = analysis.modalityBalance;

        // Elements card
        ctx.checkPage(160);
        ctx.drawCard(doc, () => {
          ctx.writeBold(doc, 'Elemental Balance', ctx.colors.gold, 11);
          ctx.y += 8;
          const elemW = (contentW - 56) / 4;
          const elemH = 60;
          const elements = [
            { name: 'Fire', val: eb.fire, bg: [255, 240, 230] as [number, number, number] },
            { name: 'Earth', val: eb.earth, bg: [235, 245, 230] as [number, number, number] },
            { name: 'Air', val: eb.air, bg: [232, 240, 252] as [number, number, number] },
            { name: 'Water', val: eb.water, bg: [230, 240, 252] as [number, number, number] },
          ];
          const elemStartY = ctx.y;
          elements.forEach((el, i) => {
            const x = margin + 12 + i * (elemW + 10);
            const isDom = el.name.toLowerCase() === eb.dominant;
            doc.setFillColor(...el.bg);
            doc.setDrawColor(...(isDom ? ctx.colors.gold : ctx.colors.warmBorder));
            doc.setLineWidth(isDom ? 2.5 : 0.5);
            doc.roundedRect(x, elemStartY, elemW, elemH, 6, 6, 'FD');
            doc.setFont('helvetica', 'bold'); doc.setFontSize(26);
            doc.setTextColor(...(isDom ? ctx.colors.gold : ctx.colors.darkText));
            doc.text(String(el.val), x + elemW / 2, elemStartY + 28, { align: 'center' });
            doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
            doc.setTextColor(...ctx.colors.bodyText);
            doc.text(el.name, x + elemW / 2, elemStartY + 46, { align: 'center' });
            if (isDom) {
              doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
              doc.setTextColor(...ctx.colors.gold);
              doc.text('DOMINANT', x + elemW / 2, elemStartY + 56, { align: 'center' });
            }
          });
          ctx.y = elemStartY + elemH + 12;

          // Modalities
          ctx.writeBold(doc, 'Modality Balance', ctx.colors.gold, 11);
          ctx.y += 8;
          const modW = (contentW - 44) / 3;
          const modH = 55;
          const modalities = [
            { name: 'Cardinal', val: mb.cardinal, desc: 'Initiating' },
            { name: 'Fixed', val: mb.fixed, desc: 'Sustaining' },
            { name: 'Mutable', val: mb.mutable, desc: 'Adapting' },
          ];
          const modStartY = ctx.y;
          modalities.forEach((mod, i) => {
            const x = margin + 12 + i * (modW + 10);
            const isDom = mod.name.toLowerCase() === mb.dominant;
            doc.setFillColor(...ctx.colors.softGold);
            doc.setDrawColor(...(isDom ? ctx.colors.gold : ctx.colors.warmBorder));
            doc.setLineWidth(isDom ? 2.5 : 0.5);
            doc.roundedRect(x, modStartY, modW, modH, 6, 6, 'FD');
            doc.setFont('helvetica', 'bold'); doc.setFontSize(24);
            doc.setTextColor(...(isDom ? ctx.colors.gold : ctx.colors.darkText));
            doc.text(String(mod.val), x + modW / 2, modStartY + 24, { align: 'center' });
            doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
            doc.setTextColor(...ctx.colors.bodyText);
            doc.text(mod.name, x + modW / 2, modStartY + 38, { align: 'center' });
            doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5);
            doc.setTextColor(...ctx.colors.dimText);
            doc.text(mod.desc, x + modW / 2, modStartY + 48, { align: 'center' });
          });
          ctx.y = modStartY + modH + 4;
        });
      }

      // =============================================
      // HEMISPHERIC — Polished card style
      // =============================================
      if (analysis.hemisphericEmphasis) {
        ctx.sectionTitle(doc, 'Where Your Energy Lives');
        const hem = analysis.hemisphericEmphasis;
        const total = hem.totalCounted;
        const quadPlanets: Record<string, string[]> = { upper: [], lower: [], east: [], west: [] };
        for (const p of PLANET_ORDER) {
          const h = analysis.planetSRHouses?.[p];
          if (h == null) continue;
          if (h >= 7 && h <= 12) quadPlanets.upper.push(P[p] || p); else quadPlanets.lower.push(P[p] || p);
          if (h >= 10 || h <= 3) quadPlanets.east.push(P[p] || p); else quadPlanets.west.push(P[p] || p);
        }

        // 2x2 grid inside a card
        ctx.checkPage(250);
        ctx.drawCard(doc, () => {
          ctx.writeBold(doc, 'Hemispheric Distribution', ctx.colors.gold, 11);
          ctx.y += 10;
          const boxW = (contentW - 40) / 2;
          const boxH = 85;
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
            // Count
            doc.setFont('helvetica', 'bold'); doc.setFontSize(28);
            doc.setTextColor(...(isDom ? ctx.colors.gold : ctx.colors.darkText));
            doc.text(String(g.count), x + 18, by + 30);
            // Label
            doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
            doc.setTextColor(...ctx.colors.deepBrown);
            doc.text(g.label, x + 52, by + 20);
            // Sub
            doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5);
            doc.setTextColor(...ctx.colors.dimText);
            doc.text(g.sub, x + 52, by + 32);
            // Planets
            if (g.planets.length > 0) {
              doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
              doc.setTextColor(...ctx.colors.bodyText);
              const planetLines = doc.splitTextToSize(g.planets.join(', '), boxW - 30);
              planetLines.forEach((line: string, li: number) => doc.text(line, x + 18, by + 50 + li * 11));
            }
            if (isDom) {
              doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
              doc.setTextColor(...ctx.colors.gold);
              doc.text('DOMINANT', x + boxW - 8, by + 12, { align: 'right' });
            }
          }
          ctx.y = gridStartY + (boxH + 8) * 2 + 4;
        });
      }

      // =============================================
      // ANGULAR PLANETS
      // =============================================
      if (analysis.angularPlanets && analysis.angularPlanets.length > 0) {
        ctx.sectionTitle(doc, 'Angular Planets -- Most Powerful This Year');
        const angularList = analysis.angularPlanets.map(p => P[p] || p).join(', ');
        ctx.checkPage(100);
        ctx.drawCard(doc, () => {
          ctx.writeBold(doc, angularList, ctx.colors.gold, 13);
          ctx.y += 2;
          ctx.writeBody(doc, 'Planets on the angles (houses 1, 4, 7, 10) produce visible, undeniable results all year.', ctx.colors.dimText);
          for (const ap of analysis.angularPlanets) {
            const pm = planetLifeMeanings[ap] || planetLifeMeanings[ap.replace('NorthNode','North Node')];
            if (pm) {
              ctx.y += 4; ctx.writeBold(doc, `${P[ap] || ap}:`, ctx.colors.deepBrown, 10);
              ctx.writeBody(doc, `${pm.inYourLife} ${pm.bodyFeeling}`, ctx.colors.bodyText, 9.5);
            }
          }
        });
      }

      // =============================================
      // LORD OF THE YEAR — EXPANDED
      // =============================================
      if (analysis.lordOfTheYear) {
        ctx.sectionTitle(doc, 'Lord of the Year');
        const lord = analysis.lordOfTheYear;
        ctx.checkPage(200);
        ctx.drawCard(doc, () => {
          ctx.writeBold(doc, `${P[lord.planet] || lord.planet} -- Time Lord`, ctx.colors.gold, 13);
          ctx.writeLabel(doc, 'Position:', `${lord.srSign} (SR House ${lord.srHouse || '--'})`);
          ctx.writeLabel(doc, 'Dignity:', lord.dignity);
          if (lord.isRetrograde) ctx.writeLabel(doc, 'Status:', 'Retrograde');
          ctx.y += 4;
          const detailedMeaning = timeLordDetailedMeaning[lord.planet];
          if (detailedMeaning) ctx.writeCardSection(doc, 'What This Means For Your Year', detailedMeaning, ctx.colors.accentGreen);
          const pm = planetLifeMeanings[lord.planet];
          if (pm) {
            ctx.writeCardSection(doc, 'Rules', pm.inYourLife, ctx.colors.gold);
            ctx.writeCardSection(doc, 'Body Sensation', pm.bodyFeeling, ctx.colors.accentRust);
          }
          if (lord.dignity === 'Detriment' || lord.dignity === 'Fall') {
            ctx.y += 4;
            ctx.writeBold(doc, 'Dignity Warning:', ctx.colors.accentRust, 10);
            ctx.writeBody(doc, `Your Time Lord is in ${lord.dignity}. This means ${P[lord.planet] || lord.planet} is working outside its comfort zone — plans may require more effort, communication needs extra clarity. This is not "bad" — the growth is deeper and the lessons stick.`, ctx.colors.bodyText, 9.5);
          }
          if (lord.isRetrograde) {
            ctx.y += 4;
            ctx.writeBold(doc, 'Retrograde Effect:', ctx.colors.accentRust, 10);
            ctx.writeBody(doc, `${P[lord.planet] || lord.planet} retrograde as Time Lord means this year has a built-in "review and revise" quality. Things from the past resurface. What comes back around deserves a second look.`, ctx.colors.bodyText, 9.5);
          }
        });
      }

      // =============================================
      // SATURN & NORTH NODE — with rich WHY explanations
      // =============================================
      if (analysis.saturnFocus || analysis.nodesFocus) {
        ctx.sectionTitle(doc, 'Saturn & North Node');
        // WHY section
        ctx.drawCard(doc, () => {
          ctx.writeBold(doc, 'Why Saturn and the North Node Matter in Your Solar Return', ctx.colors.gold, 11);
          ctx.writeBody(doc, 'Saturn and the North Node are singled out because they represent the two most important growth axes in any year. Saturn shows WHERE YOU ARE BEING TESTED — the area of life where shortcuts fail, where you must build something real through effort and discipline. Saturn\'s house placement reveals your hardest assignment but also your most lasting achievement. The North Node shows WHERE YOUR SOUL IS BEING PULLED — the direction of growth that feels unfamiliar but is exactly what you need. Together, they answer two essential questions: "What must I master?" (Saturn) and "What must I become?" (North Node). Ignoring either one creates the feeling of a year spent treading water.');
        });

        if (analysis.saturnFocus) {
          ctx.checkPage(100);
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, `Saturn: ${analysis.saturnFocus!.sign} -- House ${analysis.saturnFocus!.house || '--'}${analysis.saturnFocus!.isRetrograde ? ' (Rx)' : ''}`, ctx.colors.gold, 11);
            const satMeaning = saturnHouseMeaning[analysis.saturnFocus!.house];
            if (satMeaning) ctx.writeBody(doc, satMeaning);
          });
        }
        if (analysis.nodesFocus) {
          ctx.checkPage(100);
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, `North Node: ${analysis.nodesFocus!.sign} -- House ${analysis.nodesFocus!.house || '--'}`, ctx.colors.gold, 11);
            const nodeMeaning = nodeHouseMeaning[analysis.nodesFocus!.house];
            if (nodeMeaning) ctx.writeBody(doc, nodeMeaning);
          });
        }
      }

      // =============================================
      // KEY ASPECTS
      // =============================================
      if (analysis.srToNatalAspects.length > 0) {
        const allAspects = analysis.srToNatalAspects.filter(asp => !(asp.planet1 === 'Sun' && asp.planet2 === 'Sun' && asp.type === 'Conjunction'));
        const majorAspects = allAspects.filter(asp => MAJOR_BODIES.has(asp.planet1) && MAJOR_BODIES.has(asp.planet2));
        ctx.sectionTitle(doc, 'Key Aspects');
        for (let i = 0; i < Math.min(majorAspects.length, 8); i++) {
          const asp = majorAspects[i];
          const interp = generateSRtoNatalInterpretation(asp.planet1, asp.planet2, asp.type, asp.orb);
          const isHard = ['Square', 'Opposition', 'Quincunx'].includes(asp.type);
          // Add house context
          const srH = analysis.planetSRHouses?.[asp.planet1];
          const natalH = natalChart.planets?.[asp.planet2]?.house;
          const houseContext = (srH || natalH) ? ` — SR ${P[asp.planet1] || asp.planet1}${srH ? ` in SR House ${srH}` : ''}${natalH ? `, Natal ${P[asp.planet2] || asp.planet2} in Natal House ${natalH}` : ''}` : '';
          ctx.checkPage(140);
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, `SR ${P[asp.planet1] || asp.planet1}  ${asp.type}  Natal ${P[asp.planet2] || asp.planet2}  (${asp.orb}')`, ctx.colors.darkText, 10);
            if (houseContext) {
              doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5);
              doc.setTextColor(...ctx.colors.dimText);
              const hcLines = doc.splitTextToSize(houseContext, contentW - 16);
              hcLines.forEach((line: string) => { ctx.checkPage(12); doc.text(line, margin + 8, ctx.y); ctx.y += 12; });
            }
            ctx.y += 4;
            ctx.writeCardSection(doc, 'How It Feels', interp.howItFeels, ctx.colors.accentGreen);
            ctx.writeCardSection(doc, 'What It Means', interp.whatItMeans, ctx.colors.gold);
            ctx.writeCardSection(doc, 'What To Do', interp.whatToDo, ctx.colors.accentRust);
          }, isHard ? [180, 100, 60] : ctx.colors.gold);
        }
      }

      // =============================================
      // SR MOON EMOTIONAL CLIMATE (replaces old Moon Timing)
      // =============================================
      if (analysis.srMoonAspects || analysis.moonVOC || analysis.moonAngularity) {
        ctx.sectionTitle(doc, 'Your Moon This Year -- Emotional Climate');

        // Moon VOC — Unaspected Moon (must come first, before aspects)
        if (analysis.moonVOC) {
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, 'Moon Void of Course — The Unaspected Moon', [180, 130, 40], 11);
            ctx.y += 2;
            ctx.writeBody(doc, 'Your Solar Return Moon makes no major aspects to any other planet in the SR chart. This is a rare and significant condition.', ctx.colors.darkText, 10);
            ctx.y += 4;
            ctx.writeCardSection(doc, 'What This Means', 'An unaspected SR Moon operates in isolation — your emotional life this year runs on its own track, without direct planetary support or challenge. Feelings are vivid but disconnected from the rest of the chart\'s story. You may feel emotionally "untethered" — deeply feeling but unsure what to do with those feelings.', [180, 130, 40]);
            ctx.writeCardSection(doc, 'The Gift', 'Without planetary aspects pulling it in different directions, the Moon is free. Your emotional compass this year is entirely your own — uncorrupted by external pressures. This can bring a rare emotional clarity and independence.', ctx.colors.accentGreen);
            ctx.writeCardSection(doc, 'The Challenge', 'Without aspects to ground or activate the Moon, emotional needs may go unmet unless you consciously name and honor them. Others may not instinctively "get" what you need this year.', ctx.colors.accentRust);
            ctx.writeCardSection(doc, 'How to Work With It', 'Journaling, therapy, and creative expression become essential outlets. The unaspected Moon often produces artists, writers, and deep feelers who channel emotion into form. Give your feelings a container — they won\'t find one automatically this year.', ctx.colors.gold);
          }, [180, 130, 40]);
        }

        // Angularity description
        if (analysis.moonAngularity) {
          const angDesc: Record<string, string> = {
            angular: 'Your SR Moon is angular (close to an angle). Emotional responses this year are instinctive, automatic, and highly reactive. You are close to every situation — perspective is harder to achieve, but your feelings are powerfully felt and visible to others.',
            succedent: 'Your SR Moon is in a succedent house. Emotional responses are more stable and grounded this year. You can step back and examine situations without being overwhelmed. Emotional resilience is a strength.',
            cadent: 'Your SR Moon is in a cadent house. Emotional responses are more passive and adaptive this year. You may process feelings internally, preparing for what comes next rather than reacting in the moment.',
          };
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, `Moon Position: ${analysis.moonSign || ''} in House ${analysis.moonHouse?.house || '--'}`, ctx.colors.gold, 11);
            ctx.y += 4;
            ctx.writeBody(doc, angDesc[analysis.moonAngularity!], ctx.colors.bodyText, 9.5);
            if (analysis.moonLateDegree) {
              ctx.y += 4;
              ctx.writeBold(doc, 'Late-Degree Moon', ctx.colors.accentRust, 10);
              ctx.writeBody(doc, 'Your SR Moon is in the late degrees of its sign (25+). This often signals that something emotional is reaching completion or is about to change. Endings, transitions, and a sense of "moving on" may characterize the year.', ctx.colors.bodyText, 9.5);
            }
            if (analysis.moonMetonicAges && analysis.moonMetonicAges.length > 0) {
              ctx.y += 4;
              ctx.writeBold(doc, '19-Year Metonic Cycle', ctx.colors.gold, 10);
              ctx.writeBody(doc, `Your SR Moon was in approximately this same position at age${analysis.moonMetonicAges.length > 1 ? 's' : ''} ${analysis.moonMetonicAges.join(', ')}. The emotional themes of this year echo those earlier chapters. What was happening in your life then? The threads connect.`, ctx.colors.bodyText, 9.5);
            }
          });
        }

        // SR Moon aspects to other SR planets
        if (analysis.srMoonAspects && analysis.srMoonAspects.length > 0) {
          ctx.y += 4;
          for (const asp of analysis.srMoonAspects.slice(0, 6)) {
            const isHard = ['Square', 'Opposition', 'Quincunx'].includes(asp.aspectType);
            ctx.checkPage(80);
            ctx.drawCard(doc, () => {
              ctx.writeBold(doc, `Moon ${asp.aspectType} ${P[asp.targetPlanet] || asp.targetPlanet} (${asp.orb}')`, ctx.colors.darkText, 10);
              if (asp.targetSRHouse) {
                doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5);
                doc.setTextColor(...ctx.colors.dimText);
                doc.text(`${P[asp.targetPlanet] || asp.targetPlanet} in SR House ${asp.targetSRHouse}`, margin + 8, ctx.y);
                ctx.y += 12;
              }
              ctx.y += 2;
              ctx.writeBody(doc, asp.interpretation, ctx.colors.bodyText, 9.5);
            }, isHard ? [180, 100, 60] : ctx.colors.gold);
          }
        }
      }

      // =============================================
      // VERTEX
      // =============================================
      if (analysis.vertex) {
        ctx.sectionTitle(doc, 'Vertex -- Fated Encounters');
        ctx.checkPage(100);
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
      // PLANET SPOTLIGHT
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
        ctx.sectionTitle(doc, 'Planet Spotlight');
        for (const planet of spotlightPlanets) {
          const h = analysis.planetSRHouses[planet]!;
          const data = deepData[planet][h];
          if (!data) continue;
          ctx.checkPage(100);
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, `${P[planet] || planet} in House ${h}: ${data.title}`, ctx.colors.gold, 12);
            ctx.y += 4;
            if (data.overview) {
              ctx.writeBody(doc, data.overview, ctx.colors.darkText, 10, 15);
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
        ctx.sectionTitle(doc, 'Year-Ahead Reading');
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
      generateHighlightsPage(ctx, doc, analysis);

      // =============================================
      // BIRTHDAY AFFIRMATION CARD (birthday mode)
      // =============================================
      if (birthdayMode) {
        doc.addPage(); ctx.y = margin;
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

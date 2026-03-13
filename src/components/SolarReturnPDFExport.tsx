import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';
import { Download, Loader2 } from 'lucide-react';
import { vertexInSign, vertexInHouse } from '@/lib/solarReturnVertex';
import { srJupiterInHouseDeep, srMercuryInHouseDeep, srVenusInHouseDeep, srMarsInHouseDeep, srSaturnInHouseDeep, srUranusInHouseDeep, srNeptuneInHouseDeep, srPlutoInHouseDeep } from '@/lib/solarReturnPlanetInHouseDeep';
import { generateSRtoNatalInterpretation, planetLifeMeanings } from '@/lib/solarReturnAspectInterp';
import { useState } from 'react';
import { moonSignDeep, moonShiftNarrative } from '@/lib/moonSignShiftData';

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

const CAKE_IMAGES: Record<string, string> = {
  Aries: cakeAries, Taurus: cakeTaurus, Gemini: cakeGemini, Cancer: cakeCancer,
  Leo: cakeLeo, Virgo: cakeVirgo, Libra: cakeLibra, Scorpio: cakeScorpio,
  Sagittarius: cakeSagittarius, Capricorn: cakeCapricorn, Aquarius: cakeAquarius, Pisces: cakePisces,
};

const P: Record<string, string> = {
  Sun: 'Sun', Moon: 'Moon', Mercury: 'Mercury', Venus: 'Venus', Mars: 'Mars',
  Jupiter: 'Jupiter', Saturn: 'Saturn', Uranus: 'Uranus', Neptune: 'Neptune', Pluto: 'Pluto',
  Chiron: 'Chiron', NorthNode: 'N.Node', SouthNode: 'S.Node', Ascendant: 'ASC',
  Juno: 'Juno', Ceres: 'Ceres', Pallas: 'Pallas', Vesta: 'Vesta', Lilith: 'Lilith',
};

const S: Record<string, string> = {
  Aries: 'Ari', Taurus: 'Tau', Gemini: 'Gem', Cancer: 'Can', Leo: 'Leo', Virgo: 'Vir',
  Libra: 'Lib', Scorpio: 'Sco', Sagittarius: 'Sag', Capricorn: 'Cap', Aquarius: 'Aqu', Pisces: 'Pis',
};

const MOON_PHASE_EXPLANATIONS: Record<string, string> = {
  'New Moon': 'Fresh start energy. A year of planting seeds and beginning new chapters. Act on impulse toward what feels genuinely alive.',
  'Waxing Crescent': 'Gathering momentum. Push through doubt. This year rewards early effort and showing up before you feel ready.',
  'First Quarter': 'Crisis of action. Decisions are required — sitting on the fence creates more stress than choosing.',
  'Waxing Gibbous': 'Refining and adjusting. The gap between where you are and where you want to be is productive. Edit, don\'t scrap.',
  'Full Moon': 'Peak illumination. Everything becomes visible — relationships, results, truths. Culmination of something that began years ago.',
  'Waning Gibbous': 'Time to teach and share. Generosity opens unexpected doors. You have something the world needs.',
  'Last Quarter': 'Old structures that no longer serve you become intolerable. The discomfort is pushing you to evolve.',
  'Balsamic': 'Completion and surrender. The quietest, most inward phase. This is a year for rest, reflection, and tying up loose ends. Trying to start something brand new will feel like pushing a boulder uphill. Honor the ending — what comes next will arrive on its own timing.',
  'Balsamic Moon': 'Completion and surrender. The quietest, most inward phase. This is a year for rest, reflection, and tying up loose ends. Trying to start something brand new will feel like pushing a boulder uphill. Honor the ending — what comes next will arrive on its own timing.',
};

// What stellium planets actually DO in combination
const stelliumPlanetRoles: Record<string, string> = {
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

// House stellium meanings — what a pile-up in that house DOES to your year
const stelliumHouseMeaning: Record<number, string> = {
  1: 'This is YOUR year. All this energy landing in your 1st house means your identity, body, and personal direction are being completely rewired. People will notice you differently. You may change your appearance, take bold action, or feel an irresistible urge to reinvent yourself. The danger is becoming so self-focused that you forget to check in with others.',
  2: 'Money, possessions, and self-worth are consuming your attention this year. Multiple planets here means financial decisions carry enormous weight. You are being forced to answer: what do I actually VALUE? Not what society says — what makes YOU feel secure and worthy. Expect income fluctuations and opportunities to build something more aligned.',
  3: 'Your mind is on fire this year. Communication, learning, writing, and daily connections absorb most of your energy. Expect more emails, calls, short trips, and conversations that change your perspective. Siblings or neighbors may play a bigger role. The challenge: saying yes to everything and finishing nothing.',
  4: 'Home and family dominate this year. You may move, renovate, deal with family issues, or feel a powerful pull to nest. Emotional foundations are being rebuilt from the ground up. Old family patterns surface — not to haunt you, but to be resolved. What does "home" really mean to you?',
  5: 'Creative self-expression, romance, and joy are center stage. Multiple planets here demand you PLAY, create, and take emotional risks. Dating, artistic projects, or children may absorb your attention. The challenge: self-indulgence vs. genuine creative expression.',
  6: 'Daily routines, health, and work are being overhauled. Multiple planets in your 6th house means your body is sending messages — listen to them. Work habits, employment situations, and how you serve others are all being restructured. Small daily changes create the biggest transformation.',
  7: 'Relationships are the main event. Partnerships — romantic, business, and creative — demand your full attention. You may commit, break up, or completely renegotiate the terms of an important relationship. The lesson: balancing your needs with someone else\'s.',
  8: 'Deep transformation, shared finances, and psychological intensity define this year. Something needs to die — a habit, a relationship dynamic, an old identity — so something authentic can be born. Power struggles and intimacy issues surface. This is not comfortable, but it is profoundly productive.',
  9: 'Your worldview is expanding. Travel, education, publishing, and philosophical exploration absorb your energy. You are searching for MEANING. Beliefs that once felt certain may crumble — and that\'s the point. The challenge: restlessness and over-commitment to new ideas.',
  10: 'Career and public reputation are being forged. Multiple planets in your 10th house means the world is watching. Professional responsibilities increase, but so does recognition. Authority figures play a key role. The question: are you climbing the right mountain?',
  11: 'Community, friendships, and collective purpose are center stage. Your social circle is being reshuffled — some friends leave, new allies appear. Group activities and social causes become central. The challenge: maintaining individuality within the group.',
  12: 'The most deeply private year possible. Multiple planets in your 12th house means inner work, spiritual exploration, and solitude are not optional — they are the assignment. You are processing at a level below conscious awareness. Dreams may be vivid, intuition heightened. The danger is isolation; the gift is profound inner wisdom.',
};

// Time Lord detailed context
const timeLordDetailedMeaning: Record<string, string> = {
  Sun: 'The Sun as Time Lord puts your IDENTITY center stage. This year is about YOU — your confidence, your creativity, your sense of purpose. You will feel more visible, more scrutinized, and more alive. Decisions you make this year reflect who you truly are. The question: what makes you feel genuinely proud?',
  Moon: 'The Moon as Time Lord makes this an EMOTIONAL year. Your feelings are running the show — for better or worse. Intuition is stronger but so is reactivity. Home, family, and nurturing relationships dominate. The question: are you caring for yourself as well as you care for others?',
  Mercury: 'Mercury as Time Lord makes your MIND the main character. How you think, communicate, and process information determines everything this year. Conversations, writing, contracts, and learning curve are amplified. Important: Mercury asks you to be precise. Miscommunication has bigger consequences. When Mercury is your Time Lord AND retrograde in the SR chart, the year has a built-in "review and revise" quality — ideas that come back around from the past may hold the key to this year\'s breakthroughs.',
  Venus: 'Venus as Time Lord makes this a year about RELATIONSHIPS, VALUES, and PLEASURE. What you love, who you love, and how you spend your money are all being examined. Aesthetic upgrades, new romances, or financial adjustments are likely. The question: does your daily life reflect what you actually value?',
  Mars: 'Mars as Time Lord brings ENERGY, DRIVE, and potentially CONFLICT. You have more fuel than usual — channel it into projects, exercise, or bold moves. The danger is aggression, impatience, or burning bridges. The question: what are you fighting for, and is it worth it?',
  Jupiter: 'Jupiter as Time Lord is a gift — expansion, opportunity, and optimism. Something in your life is ready to grow. Travel, education, publishing, or legal matters may be favored. The danger: overcommitment, weight gain, or saying yes to everything. The question: where should you grow vs. where are you just inflating?',
  Saturn: 'Saturn as Time Lord means this year is SERIOUS. Responsibilities increase. Structures you have been building are tested. Shortcuts fail. What is real survives; what is superficial collapses. This is not punishment — it is Saturn asking you to earn your place. The reward for doing the work: lasting achievement and genuine self-respect.',
};

const stelliumSignMeaning: Record<string, string> = {
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

const stelliumFeltSense: Record<string, string> = {
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

const saturnHouseMeaning: Record<number, string> = {
  1: 'YOU are the project. Body, appearance, sense of self restructured. The gift: genuine self-authority.',
  2: 'Finances, values, self-worth tested. The real lesson: what you genuinely value vs. what you spend on out of habit.',
  3: 'Communication requires more effort. Words carry weight. Difficult conversations, important writing, or challenging learning.',
  4: 'Home and family are the classroom. You may renovate, move, or confront deep family patterns.',
  5: 'Creativity, romance, fun require WORK. Joy doesn\'t come easily — you have to earn it.',
  6: 'Daily routines, work habits, health restructured. Bad habits catch up. Build better systems this year.',
  7: 'Partnerships tested. Relationships lacking real commitment may end. Solid ones deepen through shared hardship.',
  8: 'Deep transformation, shared finances, psychological patterns under review. Face what you\'ve been avoiding.',
  9: 'Beliefs tested against reality. Higher education demands serious commitment. Do your beliefs actually work?',
  10: 'Career and reputation are the priority. Professional responsibilities increase. Your reputation is being forged.',
  11: 'Friendships restructured. Fair-weather friends fall away. Learning who your real allies are.',
  12: 'Inner life and unconscious patterns under review. Deeply private year. Rest and solitude are Saturn\'s assignment.',
};

const nodeHouseMeaning: Record<number, string> = {
  1: 'Growth edge: SELF-assertion. Stop deferring. The universe rewards independence.',
  2: 'Growth: building financial independence and clarifying values.',
  3: 'Growth: communication and learning. Speak up. Have the conversations you\'ve been avoiding.',
  4: 'Growth: home, family, emotional foundations. Put down roots.',
  5: 'Growth: creative self-expression and taking emotional risks. Stop hiding. Play.',
  6: 'Growth: daily habits, health, service. Big breakthroughs happen in small moments.',
  7: 'Growth: partnership and collaboration. Stop doing everything alone.',
  8: 'Growth: emotional depth and shared vulnerability. Let someone see the real you.',
  9: 'Growth: expanding your worldview. Your comfort zone is too small.',
  10: 'Growth: career and stepping into authority. Stop playing small.',
  11: 'Growth: community, friendship, collective purpose.',
  12: 'Growth: surrender and releasing control. Deepest wisdom arrives in stillness.',
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

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '--';
  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 4) return `${parts[1]}-${parts[2]}-${parts[0]}`;
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}-${d.getFullYear()}`;
    }
  } catch { /* fall through */ }
  return dateStr;
};

const capitalizeLocation = (loc: string | undefined): string => {
  if (!loc) return '--';
  return loc.replace(/\b\w+/g, word => {
    if (word.length <= 2) return word.toUpperCase();
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
};

async function loadImageDataUrl(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(null); return; }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export const SolarReturnPDFExport = ({ analysis, srChart, natalChart, narrative }: Props) => {
  const [generating, setGenerating] = useState(false);
  const [birthdayMode, setBirthdayMode] = useState(false);
  const [personalMessage, setPersonalMessage] = useState('');

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();
      const margin = 50;
      const contentW = pw - margin * 2;
      let y = margin;

      // -- Color palette --
      const gold: [number, number, number] = [162, 128, 72];
      const darkText: [number, number, number] = [30, 28, 26];
      const bodyText: [number, number, number] = [55, 50, 45];
      const dimText: [number, number, number] = [120, 112, 105];
      const warmBorder: [number, number, number] = [210, 200, 185];
      const creamBg: [number, number, number] = [250, 247, 242];
      const softGold: [number, number, number] = [245, 238, 225];
      const deepBrown: [number, number, number] = [90, 70, 45];
      const softBlue: [number, number, number] = [230, 240, 250];
      const accentGreen: [number, number, number] = [34, 120, 80];
      const accentRust: [number, number, number] = [160, 90, 50];

      const checkPage = (needed: number) => {
        if (y + needed > ph - 55) { doc.addPage(); y = margin; }
      };

      const drawGoldRule = () => {
        doc.setDrawColor(...gold); doc.setLineWidth(1.5);
        doc.line(margin, y, pw - margin, y);
      };

      const drawHorizontalRule = (color: [number, number, number] = warmBorder, width = 0.5) => {
        doc.setDrawColor(...color); doc.setLineWidth(width);
        doc.line(margin, y, pw - margin, y);
      };

      const drawContentBox = (x: number, yStart: number, w: number, h: number, bg: [number, number, number] = creamBg) => {
        doc.setFillColor(...bg); doc.setDrawColor(...warmBorder); doc.setLineWidth(0.5);
        doc.roundedRect(x, yStart, w, h, 6, 6, 'FD');
      };

      // BIGGER section titles
      const sectionTitle = (title: string) => {
        checkPage(120);
        y += 24; drawGoldRule(); y += 20;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(...gold);
        doc.text(title.toUpperCase(), margin, y); y += 20;
      };

      // BIGGER body text
      const writeBody = (text: string, color: [number, number, number] = bodyText, size = 10, lineH = 15) => {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(size); doc.setTextColor(...color);
        const lines: string[] = doc.splitTextToSize(text, contentW - 16);
        for (const line of lines) { checkPage(lineH); doc.text(line, margin + 8, y); y += lineH; }
      };

      const writeBold = (text: string, color: [number, number, number] = darkText, size = 11) => {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(size); doc.setTextColor(...color);
        const lines: string[] = doc.splitTextToSize(text, contentW - 16);
        for (const line of lines) { checkPage(16); doc.text(line, margin + 8, y); y += 15; }
      };

      const writeLabel = (label: string, value: string, labelColor: [number, number, number] = dimText, valueColor: [number, number, number] = darkText) => {
        checkPage(16);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...labelColor);
        doc.text(label, margin + 8, y);
        const labelW = doc.getTextWidth(label);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(...valueColor);
        doc.text(value, margin + 8 + labelW + 6, y); y += 16;
      };

      const drawCard = (renderContent: () => void, accentColor: [number, number, number] = gold) => {
        const cardStartY = y; y += 14;
        renderContent(); y += 12;
        const cardH = y - cardStartY;
        doc.setDrawColor(...warmBorder); doc.setLineWidth(0.5);
        doc.roundedRect(margin, cardStartY, contentW, cardH, 6, 6, 'S');
        doc.setDrawColor(...accentColor); doc.setLineWidth(3);
        doc.line(margin + 1, cardStartY + 3, margin + 1, cardStartY + cardH - 3);
        y += 8;
      };

      const writeCardSection = (label: string, text: string, labelColor: [number, number, number] = accentGreen) => {
        writeBold(label, labelColor, 9.5); writeBody(text, bodyText, 9.5); y += 4;
      };

      // =============================================
      // PAGE 1: COVER
      // =============================================
      const a = analysis;
      const name = natalChart.name || 'Chart';
      const year = srChart.solarReturnYear;

      // USE SOLAR RETURN signs, NOT natal
      const srSunSign = srChart.planets.Sun?.sign || natalChart.planets.Sun?.sign || '';
      const srMoonSign = a.moonSign || srChart.planets.Moon?.sign || '';
      const srRisingSign = srChart.planets.Ascendant?.sign || a.yearlyTheme?.ascendantSign || '';

      y = 50;

      // --- BIRTHDAY HEADER ---
      if (birthdayMode) {
        const cakeImgSrc = CAKE_IMAGES[srSunSign];
        let cakeDataUrl: string | null = null;
        if (cakeImgSrc) {
          cakeDataUrl = await loadImageDataUrl(cakeImgSrc);
        }

        doc.setDrawColor(...gold); doc.setLineWidth(2);
        doc.line(margin, y, pw - margin, y);
        y += 30;

        // WIDER cake image — landscape proportions
        const cakeW = 200;
        const cakeH = 170;
        const textStartX = margin + cakeW + 30;

        if (cakeDataUrl) {
          doc.addImage(cakeDataUrl, 'PNG', margin, y - 10, cakeW, cakeH);
        }

        // "Happy Birthday!" — BIG fun font
        doc.setFont('times', 'bolditalic');
        doc.setFontSize(44);
        doc.setTextColor(188, 120, 60);
        doc.text('Happy', textStartX, y + 30);
        doc.setFontSize(52);
        doc.text('Birthday!', textStartX, y + 75);

        // Sparkle line
        doc.setFontSize(16); doc.setTextColor(...gold);
        doc.text('*  .  *  .  *', textStartX, y + 95);

        // Big 3 display — SR signs, BIG
        const big3Y = y + 116;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
        doc.setTextColor(...deepBrown);
        if (srSunSign) doc.text(`${srSunSign} Sun`, textStartX, big3Y);
        if (srMoonSign) doc.text(`${srMoonSign} Moon`, textStartX, big3Y + 20);
        if (srRisingSign) doc.text(`${srRisingSign} Rising`, textStartX, big3Y + 40);

        y += cakeH + 10;

        // Personal message
        if (personalMessage.trim()) {
          y += 8;
          const msgLines: string[] = doc.splitTextToSize(personalMessage.trim(), contentW - 60);
          const msgH = msgLines.length * 16 + 28;
          doc.setFillColor(252, 248, 240); doc.setDrawColor(...gold); doc.setLineWidth(1);
          doc.roundedRect(margin + 20, y, contentW - 40, msgH, 8, 8, 'FD');
          doc.setFont('times', 'italic'); doc.setFontSize(12); doc.setTextColor(100, 80, 50);
          let msgY = y + 18;
          for (const line of msgLines) { doc.text(line, pw / 2, msgY, { align: 'center' }); msgY += 16; }
          y += msgH + 12;
        }

        doc.setDrawColor(...gold); doc.setLineWidth(2);
        doc.line(margin, y, pw - margin, y);
        y += 24;
      }

      // --- TITLE AREA ---
      if (!birthdayMode) {
        doc.setDrawColor(...gold); doc.setLineWidth(2.5);
        doc.line(margin, y, pw - margin, y);
        y += 1; doc.setLineWidth(0.5);
        doc.line(margin, y + 2, pw - margin, y + 2);
        y += 45;
      }

      doc.setFont('helvetica', 'normal'); doc.setFontSize(13); doc.setTextColor(...gold);
      doc.text('S O L A R   R E T U R N', pw / 2, y, { align: 'center' });
      y += 32;

      doc.setFont('helvetica', 'bold'); doc.setFontSize(32); doc.setTextColor(...darkText);
      doc.text(String(year), pw / 2, y, { align: 'center' });
      y += 28;

      // Ornament
      doc.setDrawColor(...gold); doc.setLineWidth(0.5);
      const ornW = 60;
      doc.line(pw / 2 - ornW, y, pw / 2 - 8, y);
      doc.line(pw / 2 + 8, y, pw / 2 + ornW, y);
      const cx = pw / 2, cy = y;
      doc.setFillColor(...gold);
      doc.triangle(cx, cy - 3, cx - 3, cy, cx + 3, cy, 'F');
      doc.triangle(cx, cy + 3, cx - 3, cy, cx + 3, cy, 'F');
      y += 26;

      doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(...deepBrown);
      doc.text(name.toUpperCase(), pw / 2, y, { align: 'center' });
      y += 24;

      // Big 3 on cover — SR SIGNS
      if (srSunSign || srMoonSign || srRisingSign) {
        const big3BoxW = 220;
        const big3BoxH = 78;
        const big3X = (pw - big3BoxW) / 2;
        doc.setFillColor(...softGold); doc.setDrawColor(...gold); doc.setLineWidth(1.5);
        doc.roundedRect(big3X, y, big3BoxW, big3BoxH, 8, 8, 'FD');

        doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
        doc.setTextColor(...deepBrown);
        let by = y + 22;
        if (srSunSign) { doc.text(`SUN:  ${srSunSign}`, pw / 2, by, { align: 'center' }); by += 20; }
        if (srMoonSign) { doc.text(`MOON:  ${srMoonSign}`, pw / 2, by, { align: 'center' }); by += 20; }
        if (srRisingSign) { doc.text(`RISING:  ${srRisingSign}`, pw / 2, by, { align: 'center' }); }
        y += big3BoxH + 14;
      }

      // Birth info
      const birthLoc = capitalizeLocation(natalChart.birthLocation);
      const srLoc = capitalizeLocation(srChart.solarReturnLocation);

      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...dimText);
      doc.text(`Born: ${formatDate(natalChart.birthDate)}   |   ${birthLoc}`, pw / 2, y, { align: 'center' });
      if (srChart.solarReturnLocation) {
        y += 14;
        doc.text(`SR Location: ${srLoc}`, pw / 2, y, { align: 'center' });
      }
      y += 24;

      // Ornament
      doc.setDrawColor(...gold); doc.setLineWidth(0.5);
      const ornW = 60;
      doc.line(pw / 2 - ornW, y, pw / 2 - 8, y);
      doc.line(pw / 2 + 8, y, pw / 2 + ornW, y);
      const cx = pw / 2, cy = y;
      doc.setFillColor(...gold);
      doc.triangle(cx, cy - 3, cx - 3, cy, cx + 3, cy, 'F');
      doc.triangle(cx, cy + 3, cx - 3, cy, cx + 3, cy, 'F');
      y += 22;

      doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(...deepBrown);
      doc.text(name.toUpperCase(), pw / 2, y, { align: 'center' });
      y += 20;

      // Big 3 on cover page — CLEAN TEXT LABELS
      if (sunSign || moonSign || risingSign) {
        const big3BoxW = 200;
        const big3BoxH = 68;
        const big3X = (pw - big3BoxW) / 2;
        doc.setFillColor(...softGold); doc.setDrawColor(...gold); doc.setLineWidth(1);
        doc.roundedRect(big3X, y, big3BoxW, big3BoxH, 6, 6, 'FD');

        doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
        doc.setTextColor(...deepBrown);
        let by = y + 20;
        if (sunSign) {
          doc.text(`SUN:  ${sunSign}`, pw / 2, by, { align: 'center' }); by += 18;
        }
        if (moonSign) {
          doc.text(`MOON:  ${moonSign}`, pw / 2, by, { align: 'center' }); by += 18;
        }
        if (risingSign) {
          doc.text(`RISING:  ${risingSign}`, pw / 2, by, { align: 'center' });
        }
        y += big3BoxH + 12;
      }

      // Birth info — proper capitalization and consistent formatting
      const birthLoc = capitalizeLocation(natalChart.birthLocation);
      const srLoc = capitalizeLocation(srChart.solarReturnLocation);

      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...dimText);
      doc.text(`Born: ${formatDate(natalChart.birthDate)}   |   ${birthLoc}`, pw / 2, y, { align: 'center' });
      if (srChart.solarReturnLocation) {
        y += 12;
        doc.text(`SR Location: ${srLoc}`, pw / 2, y, { align: 'center' });
      }
      y += 20;

      // =============================================
      // YEAR AT A GLANCE
      // =============================================
      sectionTitle('Year at a Glance');

      // Pre-calculate how much space we need so Moon stays on this page
      const moonPhaseText = a.moonPhase?.phase || '';

      const glanceStartY = y; y += 14;
      if (a.yearlyTheme) {
        writeLabel('SR Ascendant:', `${a.yearlyTheme.ascendantSign} Rising`);
        writeLabel('Ruler:', `${P[a.yearlyTheme.ascendantRuler] || a.yearlyTheme.ascendantRuler} in ${a.yearlyTheme.ascendantRulerSign}`);
        y += 4;
      }
      if (a.srAscRulerInNatal) {
        writeBold('Where This Year Plays Out', deepBrown, 10);
        writeBody(`${P[a.srAscRulerInNatal.rulerPlanet] || a.srAscRulerInNatal.rulerPlanet} in ${a.srAscRulerInNatal.rulerNatalSign || '--'} -- Natal House ${a.srAscRulerInNatal.rulerNatalHouse || '--'}`, darkText, 10);
        writeBody(a.srAscRulerInNatal.interpretation, bodyText, 9.5);
        y += 4;
      }
      if (a.profectionYear) {
        writeLabel('Profection:', `House ${a.profectionYear.houseNumber} (Age ${a.profectionYear.age})`);
        writeLabel('Time Lord:', P[a.profectionYear.timeLord] || a.profectionYear.timeLord);
      }

      // Moon line + phase — ALL ON SAME PAGE
      writeLabel('Moon:', `${a.moonSign} in SR House ${a.moonHouse?.house || '--'}   ${moonPhaseText}`);

      if (moonPhaseText) {
        const phaseExplanation = MOON_PHASE_EXPLANATIONS[moonPhaseText] || MOON_PHASE_EXPLANATIONS[moonPhaseText.replace(' Moon', '')] || MOON_PHASE_EXPLANATIONS[moonPhaseText + ' Moon'];
        if (phaseExplanation) {
          y += 4;
          drawCard(() => {
            writeBold(`Moon Phase: ${moonPhaseText}`, gold, 11);
            y += 2;
            writeBody(phaseExplanation, bodyText, 10);
          });
        }
      }
      y += 8;

      const glanceEndY = y;
      doc.setDrawColor(...gold); doc.setLineWidth(3);
      doc.line(margin, glanceStartY, margin, glanceEndY);

      // =============================================
      // MOON SIGN SHIFT
      // =============================================
      const natalMoonSign = natalChart.planets.Moon?.sign;
      const srMoonSignFull = a.moonSign;
      if (natalMoonSign && srMoonSignFull) {
        sectionTitle('Moon Sign Shift -- Your Emotional Year');

        const halfW = (contentW - 16) / 2;
        const natalDeep = moonSignDeep[natalMoonSign];
        const srDeep = moonSignDeep[srMoonSignFull];
        const boxH = 110;
        checkPage(boxH + 180);
        const moonBoxY = y;

        // Natal Moon box
        drawContentBox(margin, moonBoxY, halfW, boxH, softGold);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...deepBrown);
        doc.text('NATAL MOON', margin + 12, moonBoxY + 16);
        doc.setFontSize(16); doc.setTextColor(...gold);
        doc.text(natalMoonSign.toUpperCase(), margin + 12, moonBoxY + 35);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...bodyText);
        const natalMoonLines = doc.splitTextToSize(natalDeep?.emotional || '', halfW - 24);
        natalMoonLines.slice(0, 6).forEach((line: string, i: number) => {
          doc.text(line, margin + 12, moonBoxY + 50 + i * 11);
        });

        // SR Moon box
        const srBoxX = margin + halfW + 16;
        drawContentBox(srBoxX, moonBoxY, halfW, boxH, softBlue);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...deepBrown);
        doc.text('THIS YEAR\'S MOON', srBoxX + 12, moonBoxY + 16);
        doc.setFontSize(16); doc.setTextColor(...gold);
        doc.text(srMoonSignFull.toUpperCase(), srBoxX + 12, moonBoxY + 35);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...bodyText);
        const srMoonLines = doc.splitTextToSize(srDeep?.emotional || '', halfW - 24);
        srMoonLines.slice(0, 6).forEach((line: string, i: number) => {
          doc.text(line, srBoxX + 12, moonBoxY + 50 + i * 11);
        });

        y = moonBoxY + boxH + 12;

        if (natalMoonSign !== srMoonSignFull) {
          checkPage(160);
          drawCard(() => {
            writeBold(`The Shift: ${natalMoonSign} --> ${srMoonSignFull}`, deepBrown, 11);
            y += 2;
            const specificNarrative = moonShiftNarrative[natalMoonSign]?.[srMoonSignFull];
            if (specificNarrative) {
              writeBody(specificNarrative, bodyText, 9.5);
            }
            y += 4;
            if (srDeep) {
              writeCardSection('Body', srDeep.body, accentGreen);
              writeCardSection('Apply', srDeep.apply, gold);
              writeCardSection('Daily Life', srDeep.looksLike, accentRust);
            }
          });
        } else {
          checkPage(60);
          drawCard(() => {
            writeBold(`Moon Stays in ${natalMoonSign} -- Emotional Continuity`, deepBrown, 11);
            writeBody('Your SR Moon matches natal. This year amplifies your emotional instincts. Trust your gut.', bodyText, 10);
          });
        }
        y += 6;
      }

      // =============================================
      // COMPARISON TABLE
      // =============================================
      sectionTitle('Solar Return vs Natal');

      const cols = [margin + 4, margin + 65, margin + 178, margin + 220, margin + 333, margin + 375];
      checkPage(16);
      doc.setFillColor(...softGold); doc.rect(margin, y - 10, contentW, 16, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...deepBrown);
      ['PLANET', 'SR POSITION', 'SR H', 'NATAL POSITION', 'NAT H', 'SHIFT'].forEach((h, i) => doc.text(h, cols[i], y));
      y += 10; drawHorizontalRule(warmBorder, 0.5); y += 12;

      for (const p of PLANET_ORDER) {
        const srPos = srChart.planets[p as keyof typeof srChart.planets];
        const natPos = natalChart.planets[p as keyof typeof natalChart.planets];
        if (!srPos && !natPos) continue;
        const srH = a.planetSRHouses?.[p];
        const overlay = a.houseOverlays.find(o => o.planet === p);
        const natH = overlay?.natalHouse;
        const shift = srPos?.sign && natPos?.sign
          ? (srPos.sign === natPos.sign ? 'Same' : `${S[natPos.sign] || natPos.sign} --> ${S[srPos.sign] || srPos.sign}`)
          : '';

        checkPage(14);
        const rowIdx = PLANET_ORDER.indexOf(p);
        if (rowIdx % 2 === 0) { doc.setFillColor(252, 250, 247); doc.rect(margin, y - 10, contentW, 14, 'F'); }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...darkText);
        doc.text(P[p] || p, cols[0], y);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...bodyText);
        doc.text(srPos ? `${srPos.sign} ${srPos.degree}'` : '--', cols[1], y);
        doc.text(srH != null ? `H${srH}` : '--', cols[2], y);
        doc.text(natPos ? `${natPos.sign} ${natPos.degree}'` : '--', cols[3], y);
        doc.text(natH != null ? `H${natH}` : '--', cols[4], y);
        doc.setTextColor(...dimText); doc.text(shift, cols[5], y);
        y += 14;
      }
      y += 8;

      // =============================================
      // STELLIUMS — with planet-specific explanations + house meanings
      // =============================================
      if (a.stelliums.length > 0) {
        sectionTitle('Stelliums');
        for (const s of a.stelliums) {
          const planets = s.planets.map(pp => P[pp] || pp).join(', ');
          const isHouseStellium = /^\d+$/.test(String(s.location)) || s.location.startsWith('House');
          const houseNum = parseInt(String(s.location).replace('House ', '').replace('House', ''));

          checkPage(200);
          drawCard(() => {
            writeBold(`${s.planets.length}-Planet Stellium in ${isHouseStellium ? 'House ' + houseNum : s.location}`, deepBrown, 12);
            doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...gold);
            doc.text(planets, margin + 14, y); y += 16;

            if (!isHouseStellium) {
              // Sign stellium — explain each planet's role
              const signMeaning = stelliumSignMeaning[s.location];
              if (signMeaning) writeCardSection('Theme', signMeaning, gold);
              const felt = stelliumFeltSense[s.location];
              if (felt) writeCardSection('Felt Sense', felt, accentGreen);

              // WHAT THESE SPECIFIC PLANETS BRING
              y += 2;
              writeBold('What These Planets Bring Together:', accentRust, 9.5);
              for (const pp of s.planets) {
                const role = stelliumPlanetRoles[pp];
                if (role) {
                  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...deepBrown);
                  checkPage(14);
                  doc.text(`${P[pp] || pp}:`, margin + 16, y);
                  const labelW = doc.getTextWidth(`${P[pp] || pp}: `);
                  doc.setFont('helvetica', 'normal'); doc.setTextColor(...bodyText);
                  const roleLines = doc.splitTextToSize(role, contentW - 32 - labelW);
                  doc.text(roleLines[0] || '', margin + 16 + labelW, y);
                  y += 14;
                }
              }
              y += 4;
              // Practical synthesis
              if (s.location === 'Pisces' && s.planets.includes('Sun') && s.planets.includes('Mercury') && s.planets.includes('Mars')) {
                writeBody('With your Sun, Mercury, and Mars all in Pisces: your identity (Sun), your mind (Mercury), and your drive (Mars) are all swimming in the same intuitive, boundary-dissolving water. In practice, this means you think and act on FEELING more than logic this year. Your decisions are guided by empathy and imagination. The danger is real: you can absorb other people\'s emotions as if they were your own, lose track of what YOU want vs. what others need, and exhaust yourself through over-giving. The gift is equally real: creative breakthroughs, spiritual depth, and a healing presence that others feel just by being near you.', bodyText, 9.5);
              }
            } else if (!isNaN(houseNum)) {
              // House stellium — FULL explanation
              const houseMeaning = stelliumHouseMeaning[houseNum];
              if (houseMeaning) {
                writeBody(houseMeaning, bodyText, 10);
              }
            }
          });
        }
      }

      // =============================================
      // ELEMENTS & MODALITY
      // =============================================
      if (a.elementBalance) {
        sectionTitle('Element & Modality');
        const eb = a.elementBalance;
        const mb = a.modalityBalance;

        checkPage(100);
        const elemW = (contentW - 24) / 4;
        const elemH = 55;
        const elements = [
          { name: 'Fire', val: eb.fire, bg: [255, 245, 235] as [number, number, number] },
          { name: 'Earth', val: eb.earth, bg: [240, 248, 240] as [number, number, number] },
          { name: 'Air', val: eb.air, bg: [240, 245, 255] as [number, number, number] },
          { name: 'Water', val: eb.water, bg: [235, 243, 255] as [number, number, number] },
        ];

        const elemStartY = y;
        elements.forEach((el, i) => {
          const x = margin + i * (elemW + 8);
          const isDom = el.name.toLowerCase() === eb.dominant;
          doc.setFillColor(...el.bg);
          doc.setDrawColor(...(isDom ? gold : warmBorder));
          doc.setLineWidth(isDom ? 2 : 0.5);
          doc.roundedRect(x, elemStartY, elemW, elemH, 4, 4, 'FD');
          doc.setFont('helvetica', 'bold'); doc.setFontSize(22);
          doc.setTextColor(...(isDom ? gold : darkText));
          doc.text(String(el.val), x + elemW / 2, elemStartY + 26, { align: 'center' });
          doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...bodyText);
          doc.text(el.name, x + elemW / 2, elemStartY + 42, { align: 'center' });
        });
        y = elemStartY + elemH + 10;

        const modW = (contentW - 16) / 3;
        const modH = 50;
        const modalities = [
          { name: 'Cardinal', val: mb.cardinal },
          { name: 'Fixed', val: mb.fixed },
          { name: 'Mutable', val: mb.mutable },
        ];

        checkPage(modH + 20);
        const modStartY = y;
        modalities.forEach((mod, i) => {
          const x = margin + i * (modW + 8);
          const isDom = mod.name.toLowerCase() === mb.dominant;
          doc.setFillColor(...softGold);
          doc.setDrawColor(...(isDom ? gold : warmBorder));
          doc.setLineWidth(isDom ? 2 : 0.5);
          doc.roundedRect(x, modStartY, modW, modH, 4, 4, 'FD');
          doc.setFont('helvetica', 'bold'); doc.setFontSize(20);
          doc.setTextColor(...(isDom ? gold : darkText));
          doc.text(String(mod.val), x + modW / 2, modStartY + 24, { align: 'center' });
          doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...bodyText);
          doc.text(mod.name, x + modW / 2, modStartY + 40, { align: 'center' });
        });
        y = modStartY + modH + 10;
      }

      // =============================================
      // HEMISPHERIC — with multi-line planet lists
      // =============================================
      if (a.hemisphericEmphasis) {
        sectionTitle('Where Your Energy Lives');
        const hem = a.hemisphericEmphasis;
        const total = hem.totalCounted;

        const quadPlanets: Record<string, string[]> = { upper: [], lower: [], east: [], west: [] };
        for (const p of PLANET_ORDER) {
          const h = a.planetSRHouses?.[p];
          if (h == null) continue;
          if (h >= 7 && h <= 12) quadPlanets.upper.push(P[p] || p); else quadPlanets.lower.push(P[p] || p);
          if (h >= 10 || h <= 3) quadPlanets.east.push(P[p] || p); else quadPlanets.west.push(P[p] || p);
        }

        checkPage(200);
        const boxW = (contentW - 16) / 2;
        const boxH = 80; // taller for multi-line
        const gridData = [
          { label: 'UPPER', sub: 'Public & Visible', count: hem.upper, planets: quadPlanets.upper, bg: [245, 248, 255] as [number, number, number], row: 0, col: 0 },
          { label: 'LOWER', sub: 'Private & Internal', count: hem.lower, planets: quadPlanets.lower, bg: [255, 250, 242] as [number, number, number], row: 0, col: 1 },
          { label: 'EASTERN', sub: 'Self-Initiated', count: hem.east, planets: quadPlanets.east, bg: [242, 255, 248] as [number, number, number], row: 1, col: 0 },
          { label: 'WESTERN', sub: 'Other-Oriented', count: hem.west, planets: quadPlanets.west, bg: [255, 245, 248] as [number, number, number], row: 1, col: 1 },
        ];

        const gridStartY = y;
        for (const g of gridData) {
          const x = margin + g.col * (boxW + 16);
          const by = gridStartY + g.row * (boxH + 10);
          const isDom = g.count > total / 2;
          doc.setFillColor(...g.bg);
          doc.setDrawColor(...(isDom ? gold : warmBorder));
          doc.setLineWidth(isDom ? 2 : 0.5);
          doc.roundedRect(x, by, boxW, boxH, 6, 6, 'FD');

          doc.setFont('helvetica', 'bold'); doc.setFontSize(24);
          doc.setTextColor(...(isDom ? gold : darkText));
          doc.text(String(g.count), x + 16, by + 28);

          doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...deepBrown);
          doc.text(g.label, x + 50, by + 18);
          doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...dimText);
          doc.text(g.sub, x + 50, by + 30);

          // Multi-line planet list
          if (g.planets.length > 0) {
            doc.setFontSize(8.5); doc.setTextColor(...bodyText);
            const planetText = g.planets.join(', ');
            const planetLines = doc.splitTextToSize(planetText, boxW - 30);
            planetLines.forEach((line: string, li: number) => {
              doc.text(line, x + 16, by + 48 + li * 11);
            });
          }
        }
        y = gridStartY + (boxH + 10) * 2 + 10;
      }

      // =============================================
      // ANGULAR PLANETS
      // =============================================
      if (a.angularPlanets && a.angularPlanets.length > 0) {
        sectionTitle('Angular Planets -- Most Powerful This Year');
        const angularList = a.angularPlanets.map(p => P[p] || p).join(', ');
        checkPage(100);
        drawCard(() => {
          writeBold(angularList, gold, 13);
          y += 2;
          writeBody('Planets on the angles (houses 1, 4, 7, 10) produce visible, undeniable results all year.', dimText, 10);
          for (const ap of a.angularPlanets) {
            const pm = planetLifeMeanings[ap] || planetLifeMeanings[ap.replace('NorthNode','North Node')];
            if (pm) {
              y += 4; writeBold(`${P[ap] || ap}:`, deepBrown, 10);
              writeBody(`${pm.inYourLife} ${pm.bodyFeeling}`, bodyText, 9.5);
            }
          }
        });
      }

      // =============================================
      // LORD OF THE YEAR — EXPANDED
      // =============================================
      if (a.lordOfTheYear) {
        sectionTitle('Lord of the Year');
        const lord = a.lordOfTheYear;
        checkPage(200);
        drawCard(() => {
          writeBold(`${P[lord.planet] || lord.planet} -- Time Lord`, gold, 13);
          writeLabel('Position:', `${lord.srSign} (SR House ${lord.srHouse || '--'})`);
          writeLabel('Dignity:', lord.dignity);
          if (lord.isRetrograde) writeLabel('Status:', 'Retrograde');
          y += 4;

          // Detailed Time Lord explanation
          const detailedMeaning = timeLordDetailedMeaning[lord.planet];
          if (detailedMeaning) {
            writeCardSection('What This Means For Your Year', detailedMeaning, accentGreen);
          }

          // Planet life meaning
          const pm = planetLifeMeanings[lord.planet];
          if (pm) {
            writeCardSection('Rules', pm.inYourLife, gold);
            writeCardSection('Body Sensation', pm.bodyFeeling, accentRust);
          }

          // How dignity + retrograde status affects the experience
          if (lord.dignity === 'Detriment' || lord.dignity === 'Fall') {
            y += 4;
            writeBold('Dignity Warning:', accentRust, 10);
            writeBody(`Your Time Lord is in ${lord.dignity}. This means ${P[lord.planet] || lord.planet} is working outside its comfort zone — it has to try harder to do its job. Plans may require more effort, communication may need extra clarity, and what used to come easily now takes deliberate work. This is not "bad" — it means the growth is deeper and the lessons stick.`, bodyText, 9.5);
          }
          if (lord.isRetrograde) {
            y += 4;
            writeBold('Retrograde Effect:', accentRust, 10);
            writeBody(`${P[lord.planet] || lord.planet} retrograde as Time Lord means this year has a built-in "review and revise" quality. Things from the past resurface — old projects, old conversations, old decisions. The key: what comes back around deserves a second look. Don\'t force new starts; instead, perfect what already exists.`, bodyText, 9.5);
          }
        });
      }

      // =============================================
      // SATURN & NORTH NODE
      // =============================================
      if (a.saturnFocus || a.nodesFocus) {
        sectionTitle('Saturn & North Node');
        if (a.saturnFocus) {
          checkPage(100);
          drawCard(() => {
            writeBold(`Saturn: ${a.saturnFocus!.sign} -- House ${a.saturnFocus!.house || '--'}${a.saturnFocus!.isRetrograde ? ' (Rx)' : ''}`, gold, 11);
            const satMeaning = saturnHouseMeaning[a.saturnFocus!.house];
            if (satMeaning) writeBody(satMeaning, bodyText, 10);
          });
        }
        if (a.nodesFocus) {
          checkPage(100);
          drawCard(() => {
            writeBold(`North Node: ${a.nodesFocus!.sign} -- House ${a.nodesFocus!.house || '--'}`, gold, 11);
            const nodeMeaning = nodeHouseMeaning[a.nodesFocus!.house];
            if (nodeMeaning) writeBody(nodeMeaning, bodyText, 10);
          });
        }
      }

      // =============================================
      // KEY ASPECTS (top 8)
      // =============================================
      if (a.srToNatalAspects.length > 0) {
        const allAspects = a.srToNatalAspects.filter(
          asp => !(asp.planet1 === 'Sun' && asp.planet2 === 'Sun' && asp.type === 'Conjunction')
        );
        const majorAspects = allAspects.filter(asp => MAJOR_BODIES.has(asp.planet1) && MAJOR_BODIES.has(asp.planet2));

        sectionTitle('Key Aspects');
        for (let i = 0; i < Math.min(majorAspects.length, 8); i++) {
          const asp = majorAspects[i];
          const interp = generateSRtoNatalInterpretation(asp.planet1, asp.planet2, asp.type, asp.orb);
          const isHard = ['Square', 'Opposition', 'Quincunx'].includes(asp.type);

          checkPage(120);
          drawCard(() => {
            writeBold(`SR ${P[asp.planet1] || asp.planet1}  ${asp.type}  Natal ${P[asp.planet2] || asp.planet2}  (${asp.orb}')`, darkText, 10);
            y += 4;
            writeCardSection('Feels', interp.howItFeels, accentGreen);
            writeCardSection('Means', interp.whatItMeans, gold);
            writeCardSection('Do', interp.whatToDo, accentRust);
          }, isHard ? [180, 100, 60] : gold);
        }
      }

      // =============================================
      // MOON TIMING
      // =============================================
      if (a.moonTimingEvents.length > 0) {
        sectionTitle('Moon Timing -- When Things Happen');
        const mc = [margin + 4, margin + 90, margin + 250];
        checkPage(16);
        doc.setFillColor(...softGold); doc.rect(margin, y - 10, contentW, 16, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...deepBrown);
        ['MONTH', 'ASPECT', 'SIGNIFICANCE'].forEach((h, i) => doc.text(h, mc[i], y));
        y += 10; drawHorizontalRule(warmBorder, 0.5); y += 12;

        for (let i = 0; i < Math.min(a.moonTimingEvents.length, 12); i++) {
          const evt = a.moonTimingEvents[i];
          checkPage(14);
          if (i % 2 === 0) { doc.setFillColor(252, 250, 247); doc.rect(margin, y - 10, contentW, 14, 'F'); }
          doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...gold);
          doc.text(evt.approximateMonth, mc[0], y);
          doc.setFont('helvetica', 'normal'); doc.setTextColor(...darkText);
          doc.text(`Moon ${evt.aspectType} ${P[evt.targetPlanet] || evt.targetPlanet}`, mc[1], y);
          doc.setTextColor(...dimText); doc.setFontSize(8);
          doc.text((evt.interpretation || '').substring(0, 50), mc[2], y);
          y += 14;
        }
        y += 8;
      }

      // =============================================
      // VERTEX
      // =============================================
      if (a.vertex) {
        sectionTitle('Vertex -- Fated Encounters');
        checkPage(100);
        drawCard(() => {
          writeBold(`Vertex: ${a.vertex!.sign} ${a.vertex!.degree}' ${a.vertex!.house ? `(House ${a.vertex!.house})` : ''}`, deepBrown, 11);
          const vSign = vertexInSign[a.vertex!.sign];
          if (vSign) {
            writeCardSection('Fated Theme', vSign.fatedTheme, gold);
            writeCardSection('Who May Appear', vSign.encounters, accentGreen);
          }
        });
      }

      // =============================================
      // PLANET SPOTLIGHT (top 5)
      // =============================================
      const deepData: Record<string, Record<number, any>> = {
        Mercury: srMercuryInHouseDeep, Venus: srVenusInHouseDeep, Mars: srMarsInHouseDeep,
        Jupiter: srJupiterInHouseDeep, Saturn: srSaturnInHouseDeep, Uranus: srUranusInHouseDeep,
        Neptune: srNeptuneInHouseDeep, Pluto: srPlutoInHouseDeep,
      };
      const spotlightPlanets = SPOTLIGHT_ORDER.filter(p => {
        const h = a.planetSRHouses?.[p];
        return h !== null && h !== undefined && deepData[p]?.[h];
      });
      if (spotlightPlanets.length > 0) {
        sectionTitle('Planet Spotlight');
        for (const planet of spotlightPlanets.slice(0, 5)) {
          const h = a.planetSRHouses[planet]!;
          const data = deepData[planet][h];
          if (!data) continue;
          checkPage(100);
          drawCard(() => {
            writeBold(`${P[planet] || planet} in House ${h}: ${data.title}`, gold, 11);
            y += 2;
            writeBody(data.practical, bodyText, 9.5);
            if (data.caution) writeCardSection('Watch For', data.caution, accentRust);
          });
        }
      }

      // =============================================
      // NARRATIVE
      // =============================================
      if (narrative) {
        sectionTitle('Year-Ahead Reading');
        const lines = narrative.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) { y += 6; continue; }
          if (trimmed.startsWith('## ')) {
            checkPage(60); y += 10; drawHorizontalRule(softGold); y += 12;
            writeBold(trimmed.replace('## ', '').toUpperCase(), gold, 11); y += 4;
          } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
            checkPage(30); writeBold(trimmed.replace(/\*\*/g, ''), darkText, 10);
          } else {
            const clean = trimmed.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/[^\x00-\x7F]/g, '');
            writeBody(clean, bodyText, 9.5, 14);
          }
        }
      }

      doc.save(`Solar-Return-${year}-${name.replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={birthdayMode}
            onChange={(e) => setBirthdayMode(e.target.checked)}
            className="rounded border-border accent-primary w-4 h-4"
          />
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Birthday Gift Mode
          </span>
        </label>
      </div>

      {birthdayMode && (
        <div className="border border-primary/20 rounded-sm p-3 bg-primary/5 space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-primary block">Personal Message</label>
          <textarea
            value={personalMessage}
            onChange={(e) => setPersonalMessage(e.target.value)}
            placeholder="Happy birthday! Wishing you an amazing year ahead..."
            rows={3}
            className="w-full border border-border bg-background text-foreground rounded-sm px-3 py-2 text-sm resize-none placeholder:text-muted-foreground/50"
          />
        </div>
      )}

      <button
        onClick={generatePDF}
        disabled={generating}
        className="text-[11px] uppercase tracking-widest px-3 py-1.5 border border-border rounded-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 disabled:opacity-50"
      >
        {generating ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
        {generating ? 'Generating...' : birthdayMode ? 'Download Birthday Gift PDF' : 'Download PDF'}
      </button>
    </div>
  );
};

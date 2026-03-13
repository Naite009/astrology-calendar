import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';
import { Download, Loader2 } from 'lucide-react';
import { vertexInSign, vertexInHouse } from '@/lib/solarReturnVertex';
import { srJupiterInHouseDeep, srMercuryInHouseDeep, srVenusInHouseDeep, srMarsInHouseDeep, srSaturnInHouseDeep, srUranusInHouseDeep, srNeptuneInHouseDeep, srPlutoInHouseDeep } from '@/lib/solarReturnPlanetInHouseDeep';
import { generateSRtoNatalInterpretation, planetLifeMeanings } from '@/lib/solarReturnAspectInterp';
import { useState } from 'react';
import { moonSignDeep, moonShiftNarrative } from '@/lib/moonSignShiftData';

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

/** Format a date string to MM-DD-YYYY */
const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '--';
  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[1]}-${parts[2]}-${parts[0]}`;
  }
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${mm}-${dd}-${yyyy}`;
    }
  } catch { /* fall through */ }
  return dateStr;
};

const MAJOR_BODIES = new Set(['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','NorthNode','SouthNode','Ascendant']);
const PLANET_ORDER = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','NorthNode'];
const SPOTLIGHT_ORDER = ['Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];

// moonSignDeep and moonShiftNarrative imported from @/lib/moonSignShiftData

// ── Stellium felt-sense ──
const stelliumFeltSense: Record<string, string> = {
  'Aries': 'You will physically feel this as restless energy in your body, a constant urge to START something. Your patience drops. Your courage surges. You wake up ready to fight for what matters. The danger is exhaustion from never slowing down.',
  'Taurus': 'You will physically feel this as a deep craving for stability, comfort, and sensory pleasure. Your body wants good food, soft textures, and financial security. There is a stubbornness in your bones that refuses to be rushed. The danger is getting stuck.',
  'Gemini': 'You will physically feel this as mental overstimulation, racing thoughts, and an inability to sit still with one idea. Your hands want to text, write, gesture. Your mind is a browser with 40 tabs open. The danger is saying yes to everything and finishing nothing.',
  'Cancer': 'You will physically feel this as emotional waves, sensitivity to atmosphere, and a powerful pull toward home and family. Your gut tells you things before your mind catches up. Tears come more easily, both from joy and from overwhelm. The danger is retreating too far inward.',
  'Leo': 'You will physically feel this as a warm expansion in your chest, a need to create and be seen. Your heart opens wider. Your desire for recognition intensifies. You radiate warmth naturally. The danger is confusing applause with love.',
  'Virgo': 'You will physically feel this as tension in your stomach and shoulders, a compulsion to organize, fix, and perfect. Your eyes notice every flaw. Your body demands better habits. Anxiety spikes when things are messy. The danger is paralyzing perfectionism.',
  'Libra': 'You will physically feel this as a heightened sensitivity to discord and ugliness. You crave harmony in your environment and relationships. Decisions feel agonizing because you see every side. Your body softens around beauty. The danger is losing yourself in others\' preferences.',
  'Scorpio': 'You will physically feel this as intensity in your gut, a magnetic pull toward hidden truths and transformative experiences. Superficial interactions feel intolerable. Your instincts sharpen. Power dynamics become visible everywhere. The danger is obsession and control.',
  'Sagittarius': 'You will physically feel this as restlessness in your legs, an urge to GO somewhere, learn something, expand beyond current limits. Optimism floods your system. Small talk feels insufferable. The danger is overcommitment and escapism through constant motion.',
  'Capricorn': 'You will physically feel this as weight on your shoulders, a sobering awareness of time and responsibility. Your spine straightens. Ambition crystallizes. You want to build something REAL. The danger is working yourself into isolation or emotional suppression.',
  'Aquarius': 'You will physically feel this as an electric buzzing under your skin, sudden insights, and an urge to break free from anything conventional. Your nervous system speeds up. You want to innovate, rebel, connect with your tribe. The danger is detachment from your own emotions.',
  'Pisces': 'You will physically feel this as a dissolving of your normal boundaries, heightened empathy, and vivid dreams. Your intuition becomes almost psychic. Music, art, and water soothe you. The danger is losing yourself in others\' pain or escaping into fantasy.',
};

// ── What stellium sign dominance MEANS practically ──
const stelliumSignMeaning: Record<string, string> = {
  'Aries': 'This year your identity is being rebuilt from scratch. Everything feels personal. You are learning what you want independent of what others expect. Decisions are faster but need impulse control. Physical energy is high — use it or it turns to irritability.',
  'Taurus': 'This year is about material reality: money, body, possessions, what you own and what owns you. Financial decisions carry extra weight. Your relationship with comfort, food, and physical pleasure is under review. Build slowly; this is not a year for shortcuts.',
  'Gemini': 'This year your mind is the main character. Learning, communicating, writing, and networking are the dominant activities. You may take a course, start a blog, or have more conversations than usual. The challenge: depth vs. breadth. Choose fewer topics and go deeper.',
  'Cancer': 'This year is about home, family, and emotional foundations. Where you live, who you live with, and how you feel in your private space become central themes. Family relationships — especially with parents or children — demand attention. Your emotional world is the priority.',
  'Leo': 'This year demands creative self-expression and visibility. You are called to step into the spotlight — at work, in love, or in creative projects. Children, romance, and recreational activities take center stage. The question: are you performing or are you genuinely expressing yourself?',
  'Virgo': 'This year is about systems, health, and daily function. Your routines, your body, your work habits — all under review. You may start a health protocol, reorganize your workspace, or become hyper-aware of what is and is not working in your daily life. Perfectionism is the trap; practical improvement is the gift.',
  'Libra': 'This year is about relationships and the balance of giving and receiving. Partnerships — romantic, business, or creative — are the stage where growth happens. You are learning about fairness, compromise, and what you will and will not tolerate from others.',
  'Scorpio': 'This year takes you underground. Power dynamics, financial entanglements, sexual energy, psychological patterns, and transformative experiences are front and center. Something in your life needs to die so something more authentic can be born. This is not a gentle year — it is a necessary one.',
  'Sagittarius': 'This year expands your world. Travel, education, philosophy, legal matters, and publishing are all amplified. You are searching for MEANING — in your work, your beliefs, your life direction. The danger is spreading too thin. The gift is a broader perspective that permanently changes how you see the world.',
  'Capricorn': 'This year is about ambition, authority, and building lasting structures. Career, reputation, and long-term goals are the dominant themes. You are being asked to take MORE responsibility, not less. The question: are you climbing the right mountain, or just the nearest one?',
  'Aquarius': 'This year is about your place in the collective. Friendships, groups, networks, technology, and social causes become central. You may feel detached from personal dramas because bigger-picture concerns capture your attention. The lesson: being part of something larger without losing your individuality.',
  'Pisces': 'This year dissolves boundaries — between you and others, between reality and imagination, between the mundane and the sacred. Creativity, spirituality, healing, and compassion are the dominant frequencies. You are more intuitive, more empathic, and more vulnerable. Protect your energy while staying open to magic.',
};

// ── Saturn in SR house: specific grounded meaning ──
const saturnHouseMeaning: Record<number, string> = {
  1: 'Saturn in your 1st house means YOU are the project this year. Your body, your appearance, your sense of self — all being restructured. You may feel older, more serious, or more aware of your limitations. The gift: genuine self-authority. The cost: you cannot fake confidence anymore.',
  2: 'Saturn in your 2nd house means your finances, values, and self-worth are being tested. Spending may need to be cut. Income may feel restricted. The real lesson is not about money — it is about what you genuinely value vs. what you have been spending time and energy on out of habit.',
  3: 'Saturn in your 3rd house means communication and learning require more effort this year. Words carry weight. You may need to have difficult conversations, write something important, or take a course that challenges you. Siblings or neighbors may bring responsibilities.',
  4: 'Saturn in your 4th house means home and family are the classroom this year. You may renovate, move, deal with aging parents, or confront deep family patterns. Your emotional foundations are being rebuilt — it feels heavy, but what you build here will hold you for decades.',
  5: 'Saturn in your 5th house means creativity, romance, and fun require WORK this year. Joy does not come easily — you have to earn it. Creative projects demand discipline. Romance feels serious, not playful. If you have children, parenting responsibilities increase.',
  6: 'Saturn in your 6th house means your daily routines, work habits, and health are being restructured. Bad habits catch up with you. A health issue may demand attention. Work becomes more demanding. The gift: if you build better systems this year, they will serve you for years.',
  7: 'Saturn in your 7th house means partnerships are being tested. Relationships that lack real commitment or mutual respect may end. If a relationship is solid, it deepens through shared hardship. You are learning what genuine partnership actually requires — and it is more than you thought.',
  8: 'Saturn in your 8th house means deep transformation, shared finances, and psychological patterns are under review. Debts (financial and emotional) must be addressed. Power dynamics in relationships become visible. This is the year you face what you have been avoiding.',
  9: 'Saturn in your 9th house means your beliefs, education, and worldview are being tested against reality. Travel may be limited or carry responsibilities. Higher education demands serious commitment. You are being asked: do your beliefs actually work, or are they comfortable fictions?',
  10: 'Saturn in your 10th house means career and public reputation are the priority. Professional responsibilities increase. Authority figures scrutinize your work. Promotions come with heavier burdens. This is the year your professional reputation is forged — for better or worse.',
  11: 'Saturn in your 11th house means friendships and community involvement are being restructured. Fair-weather friends fall away. The groups you belong to may change. You are learning who your real allies are — and what role you play in the larger social fabric.',
  12: 'Saturn in your 12th house means your inner life, spirituality, and unconscious patterns are under Saturn\'s review. This is a deeply private, often lonely-feeling year. Hidden fears surface. Rest and solitude are not optional — they are Saturn\'s assignment. Old karma is being cleared.',
};

// ── North Node in SR house: specific grounded meaning ──
const nodeHouseMeaning: Record<number, string> = {
  1: 'North Node in your 1st house means your growth edge is SELF-assertion. Stop deferring to others. Stop asking permission. This year, the universe rewards independence, self-advocacy, and the courage to say "this is who I am" without apology.',
  2: 'North Node in your 2nd house means your growth comes through building financial independence and clarifying your values. Stop relying on others\' resources. Start earning, saving, and investing in yourself. Your self-worth is the real currency.',
  3: 'North Node in your 3rd house means growth comes through communication, learning, and your immediate environment. Speak up. Write. Teach. Have the conversations you have been avoiding. Short trips and local connections bring unexpected growth.',
  4: 'North Node in your 4th house means growth comes through home, family, and emotional foundations. Put down roots. Address family dynamics. Create a physical space that genuinely reflects who you are. Career ambitions need to be balanced with inner peace.',
  5: 'North Node in your 5th house means growth comes through creative self-expression, joy, and taking emotional risks. Stop hiding behind responsibilities. Play. Create. Fall in love — with a person, a project, or life itself. Your heart is the compass.',
  6: 'North Node in your 6th house means growth comes through daily habits, health, and service. The big breakthroughs happen in the small moments — your morning routine, your eating habits, how you show up at work. Master the mundane.',
  7: 'North Node in your 7th house means growth comes through partnership and collaboration. Stop doing everything alone. Learn to compromise without losing yourself. The right relationship — romantic or professional — accelerates your evolution this year.',
  8: 'North Node in your 8th house means growth comes through emotional depth, shared vulnerability, and transformation. Let someone see the real you. Address financial entanglements. Let something die that needs to die. Rebirth is on the other side.',
  9: 'North Node in your 9th house means growth comes through expanding your worldview. Travel. Study. Explore unfamiliar philosophies. Your comfort zone is too small for who you are becoming. The answers you need are in places you have never been.',
  10: 'North Node in your 10th house means growth comes through career, public contribution, and stepping into authority. Stop playing small. Take the promotion, start the business, accept the leadership role. The world is waiting for what you can build.',
  11: 'North Node in your 11th house means growth comes through community, friendship, and collective purpose. Join groups. Network. Connect your personal goals to a larger vision. Your individual success this year is tied to your willingness to be part of something bigger.',
  12: 'North Node in your 12th house means growth comes through surrender, spirituality, and releasing control. Meditate. Rest. Let go of the need to manage every outcome. Your deepest wisdom arrives in stillness, dreams, and moments of quiet faith.',
};

interface Props {
  analysis: SolarReturnAnalysis;
  srChart: SolarReturnChart;
  natalChart: NatalChart;
  narrative: string;
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
      const bodyText: [number, number, number] = [60, 55, 50];
      const dimText: [number, number, number] = [120, 112, 105];
      const warmBorder: [number, number, number] = [210, 200, 185];
      const creamBg: [number, number, number] = [250, 247, 242];
      const softGold: [number, number, number] = [245, 238, 225];
      const deepBrown: [number, number, number] = [90, 70, 45];
      const softBlue: [number, number, number] = [230, 240, 250];
      const accentGreen: [number, number, number] = [34, 120, 80];
      const accentRust: [number, number, number] = [160, 90, 50];

      // Ensure title + at least N pts of content stay together
      const checkPage = (needed: number) => {
        if (y + needed > ph - 55) {
          doc.addPage();
          y = margin;
        }
      };

      // -- Drawing helpers --
      const drawHorizontalRule = (color: [number, number, number] = warmBorder, width = 0.5) => {
        doc.setDrawColor(...color);
        doc.setLineWidth(width);
        doc.line(margin, y, pw - margin, y);
      };

      const drawGoldRule = () => {
        doc.setDrawColor(...gold);
        doc.setLineWidth(1);
        doc.line(margin, y, pw - margin, y);
      };

      const drawContentBox = (x: number, yStart: number, w: number, h: number, bg: [number, number, number] = creamBg) => {
        doc.setFillColor(...bg);
        doc.setDrawColor(...warmBorder);
        doc.setLineWidth(0.5);
        doc.roundedRect(x, yStart, w, h, 4, 4, 'FD');
      };

      // Section title — ALWAYS check that title + at least 100pt of body stays together
      const sectionTitle = (title: string) => {
        checkPage(120);
        y += 20;
        drawGoldRule();
        y += 16;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(...gold);
        doc.text(title.toUpperCase(), margin, y);
        y += 16;
      };

      const writeBody = (text: string, color: [number, number, number] = bodyText, size = 9, lineH = 13.5) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(size);
        doc.setTextColor(...color);
        const lines: string[] = doc.splitTextToSize(text, contentW - 16);
        for (const line of lines) {
          checkPage(lineH);
          doc.text(line, margin + 8, y);
          y += lineH;
        }
      };

      const writeBold = (text: string, color: [number, number, number] = darkText, size = 10) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(size);
        doc.setTextColor(...color);
        const lines: string[] = doc.splitTextToSize(text, contentW - 16);
        for (const line of lines) {
          checkPage(15);
          doc.text(line, margin + 8, y);
          y += 14;
        }
      };

      const writeLabel = (label: string, value: string, labelColor: [number, number, number] = dimText, valueColor: [number, number, number] = darkText) => {
        checkPage(14);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...labelColor);
        doc.text(label, margin + 8, y);
        const labelW = doc.getTextWidth(label);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...valueColor);
        doc.text(value, margin + 8 + labelW + 4, y);
        y += 14;
      };

      // Draw a beautiful card with gold left accent — always check space first
      const drawCard = (renderContent: () => void, accentColor: [number, number, number] = gold) => {
        // Render to a temp position, then draw the box around it
        const cardStartY = y;
        y += 12;
        renderContent();
        y += 10;
        const cardH = y - cardStartY;
        doc.setDrawColor(...warmBorder);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, cardStartY, contentW, cardH, 4, 4, 'S');
        doc.setDrawColor(...accentColor);
        doc.setLineWidth(2.5);
        doc.line(margin + 1, cardStartY + 2, margin + 1, cardStartY + cardH - 2);
        y += 6;
      };

      // Labeled card — a small titled box with specific content
      const writeCardSection = (label: string, text: string, labelColor: [number, number, number] = accentGreen) => {
        writeBold(label, labelColor, 8);
        writeBody(text, bodyText, 8);
        y += 3;
      };

      // --- PAGE 1: TITLE ---
      const a = analysis;
      const name = natalChart.name || 'Chart';
      const year = srChart.solarReturnYear;

      y = 50;

      // --- BIRTHDAY HEADER (optional) ---
      if (birthdayMode) {
        // Fun decorative "Happy Birthday!" in a warm script-like style
        doc.setFont('times', 'bolditalic');
        doc.setFontSize(42);
        doc.setTextColor(188, 120, 60);
        doc.text('Happy Birthday!', pw / 2, y + 10, { align: 'center' });
        y += 30;

        // Decorative stars/sparkles
        doc.setFontSize(16);
        doc.setTextColor(...gold);
        doc.text('✦  ·  ✦  ·  ✦', pw / 2, y + 6, { align: 'center' });
        y += 20;

        // Personal message in an elegant box
        if (personalMessage.trim()) {
          const msgLines: string[] = doc.splitTextToSize(personalMessage.trim(), contentW - 60);
          const msgH = msgLines.length * 14 + 30;
          
          // Soft rounded box
          doc.setFillColor(252, 248, 240);
          doc.setDrawColor(...gold);
          doc.setLineWidth(1);
          doc.roundedRect(margin + 20, y, contentW - 40, msgH, 6, 6, 'FD');
          
          doc.setFont('times', 'italic');
          doc.setFontSize(10);
          doc.setTextColor(100, 80, 50);
          let msgY = y + 18;
          for (const line of msgLines) {
            doc.text(line, pw / 2, msgY, { align: 'center' });
            msgY += 14;
          }
          y += msgH + 16;
        }
      }

      doc.setDrawColor(...gold);
      doc.setLineWidth(2);
      doc.line(margin, y, pw - margin, y);
      y += 1;
      doc.setLineWidth(0.5);
      doc.line(margin, y + 2, pw - margin, y + 2);

      y += 40;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(...gold);
      doc.text('S O L A R   R E T U R N', pw / 2, y, { align: 'center' });

      y += 28;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.setTextColor(...darkText);
      doc.text(String(year), pw / 2, y, { align: 'center' });

      y += 24;
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.5);
      const ornW = 60;
      doc.line(pw / 2 - ornW, y, pw / 2 - 8, y);
      doc.line(pw / 2 + 8, y, pw / 2 + ornW, y);
      const cx = pw / 2, cy = y;
      doc.setFillColor(...gold);
      doc.triangle(cx, cy - 3, cx - 3, cy, cx + 3, cy, 'F');
      doc.triangle(cx, cy + 3, cx - 3, cy, cx + 3, cy, 'F');

      y += 22;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(...deepBrown);
      doc.text(name.toUpperCase(), pw / 2, y, { align: 'center' });

      y += 22;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...dimText);
      doc.text(`Born: ${formatDate(natalChart.birthDate)}   ${natalChart.birthLocation || '--'}`, pw / 2, y, { align: 'center' });

      if (srChart.solarReturnLocation) {
        y += 14;
        doc.text(`Solar Return Location: ${srChart.solarReturnLocation}`, pw / 2, y, { align: 'center' });
      }

      y += 12;
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.5);
      doc.line(pw / 2 - ornW, y, pw / 2 + ornW, y);
      y += 30;

      // --- YEAR AT A GLANCE ---
      sectionTitle('Year at a Glance');

      const glanceStartY = y;
      y += 12;
      if (a.yearlyTheme) {
        writeLabel('SR Ascendant:', `${a.yearlyTheme.ascendantSign} Rising`);
        writeLabel('Ruler:', `${P[a.yearlyTheme.ascendantRuler] || a.yearlyTheme.ascendantRuler} in ${a.yearlyTheme.ascendantRulerSign}`);
        y += 6;
      }
      if (a.srAscRulerInNatal) {
        writeBold('Where This Year Plays Out', deepBrown, 9);
        y += 2;
        writeBody(`${P[a.srAscRulerInNatal.rulerPlanet] || a.srAscRulerInNatal.rulerPlanet} in ${a.srAscRulerInNatal.rulerNatalSign || '--'} -- Natal House ${a.srAscRulerInNatal.rulerNatalHouse || '--'}`, darkText, 9);
        writeBody(a.srAscRulerInNatal.rulerNatalHouseTheme || '', dimText, 8);
        y += 2;
        writeBody(a.srAscRulerInNatal.interpretation, bodyText, 8);
        y += 6;
      }
      if (a.profectionYear) {
        writeLabel('Profection:', `House ${a.profectionYear.houseNumber} (Age ${a.profectionYear.age})`);
        writeLabel('Time Lord:', P[a.profectionYear.timeLord] || a.profectionYear.timeLord);
        y += 4;
      }
      writeLabel('Moon:', `${a.moonSign} in SR House ${a.moonHouse?.house || '--'}   ${a.moonPhase?.phase || ''}`);
      y += 12;

      const glanceEndY = y;
      doc.setDrawColor(...gold);
      doc.setLineWidth(2.5);
      doc.line(margin, glanceStartY, margin, glanceEndY);

      // --- MOON SIGN SHIFT (the beautiful two-column card) ---
      const natalMoonSign = natalChart.planets.Moon?.sign;
      const srMoonSign = a.moonSign;
      if (natalMoonSign && srMoonSign) {
        sectionTitle('Moon Sign Shift -- Your Emotional Year');

        // Two side-by-side boxes (like the Cancer/Capricorn card the user loved)
        const halfW = (contentW - 16) / 2;
        const natalDeep = moonSignDeep[natalMoonSign];
        const srDeep = moonSignDeep[srMoonSign];

        // Calculate box height to fit content
        const boxH = 110;
        checkPage(boxH + 200);
        const moonBoxY = y;

        // -- Natal Moon box --
        drawContentBox(margin, moonBoxY, halfW, boxH, softGold);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(...deepBrown);
        doc.text('NATAL MOON', margin + 10, moonBoxY + 14);
        doc.setFontSize(13);
        doc.setTextColor(...gold);
        doc.text(natalMoonSign.toUpperCase(), margin + 10, moonBoxY + 30);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...bodyText);
        const natalMoonLines = doc.splitTextToSize(natalDeep?.emotional || '', halfW - 20);
        natalMoonLines.slice(0, 7).forEach((line: string, i: number) => {
          doc.text(line, margin + 10, moonBoxY + 42 + i * 9);
        });

        // -- SR Moon box --
        const srBoxX = margin + halfW + 16;
        drawContentBox(srBoxX, moonBoxY, halfW, boxH, softBlue);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(...deepBrown);
        doc.text('SR MOON (THIS YEAR)', srBoxX + 10, moonBoxY + 14);
        doc.setFontSize(13);
        doc.setTextColor(...gold);
        doc.text(srMoonSign.toUpperCase(), srBoxX + 10, moonBoxY + 30);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...bodyText);
        const srMoonLines = doc.splitTextToSize(srDeep?.emotional || '', halfW - 20);
        srMoonLines.slice(0, 7).forEach((line: string, i: number) => {
          doc.text(line, srBoxX + 10, moonBoxY + 42 + i * 9);
        });

        y = moonBoxY + boxH + 10;

        // The shift narrative — specific and grounded
        if (natalMoonSign !== srMoonSign) {
          checkPage(180);
          drawCard(() => {
            writeBold(`The Shift: ${natalMoonSign} --> ${srMoonSign}`, deepBrown, 10);
            y += 4;

            // Use the specific transit narrative if available
            const specificNarrative = moonShiftNarrative[natalMoonSign]?.[srMoonSign];
            if (specificNarrative) {
              writeBody(specificNarrative, bodyText, 8);
            } else {
              // Fallback: build from the deep data
              writeBody(`Your natal ${natalMoonSign} Moon is your emotional home base: ${natalDeep?.emotional || ''} This year, the SR ${srMoonSign} Moon layers a completely different emotional frequency on top: ${srDeep?.emotional || ''}`, bodyText, 8);
            }
            y += 6;

            // Four-column deep dive
            if (srDeep) {
              writeCardSection('How It Feels in Your Body', srDeep.body, accentGreen);
              writeCardSection('How To Apply It', srDeep.apply, gold);
              writeCardSection('What It Looks Like in Daily Life', srDeep.looksLike, accentRust);
            }
          });
        } else {
          checkPage(80);
          drawCard(() => {
            writeBold(`Moon Stays in ${natalMoonSign} -- Emotional Continuity`, deepBrown, 10);
            y += 4;
            writeBody(`Your SR Moon matches your natal Moon sign. This year reinforces your emotional instincts rather than challenging them. You feel at home in your own skin emotionally. Trust your gut more than usual -- it is running on native software.`, bodyText, 8);
            if (natalDeep) {
              y += 4;
              writeCardSection('Your Emotional Baseline (amplified)', natalDeep.emotional, gold);
              writeCardSection('Watch For', `Because this energy is doubled, both its gifts AND its shadows are stronger. ${natalDeep.looksLike}`, accentRust);
            }
          });
        }
        y += 8;
      }

      // --- SR vs NATAL COMPARISON TABLE ---
      sectionTitle('Solar Return vs Natal -- Side by Side');

      const cols = [margin + 4, margin + 65, margin + 178, margin + 220, margin + 333, margin + 375];

      checkPage(16);
      doc.setFillColor(...softGold);
      doc.rect(margin, y - 10, contentW, 14, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...deepBrown);
      const headers = ['PLANET', 'SR POSITION', 'SR H', 'NATAL POSITION', 'NAT H', 'SHIFT'];
      headers.forEach((h, i) => doc.text(h, cols[i], y));
      y += 8;
      drawHorizontalRule(warmBorder, 0.5);
      y += 10;

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

        checkPage(13);
        const rowIdx = PLANET_ORDER.indexOf(p);
        if (rowIdx % 2 === 0) {
          doc.setFillColor(252, 250, 247);
          doc.rect(margin, y - 9, contentW, 12, 'F');
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...darkText);
        doc.text(P[p] || p, cols[0], y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...bodyText);
        doc.text(srPos ? `${srPos.sign} ${srPos.degree}' ${srPos.minutes || 0}'` : '--', cols[1], y);
        doc.text(srH != null ? `H${srH}` : '--', cols[2], y);
        doc.text(natPos ? `${natPos.sign} ${natPos.degree}' ${natPos.minutes || 0}'` : '--', cols[3], y);
        doc.text(natH != null ? `H${natH}` : '--', cols[4], y);
        doc.setTextColor(...dimText);
        doc.text(shift, cols[5], y);
        y += 12;
      }
      y += 6;

      // --- HOUSE OVERLAYS TABLE ---
      if (a.houseOverlays.length > 0) {
        sectionTitle('House Overlays -- SR Planets in Natal Houses');
        const oc = [margin + 4, margin + 75, margin + 190, margin + 260, margin + 340];

        checkPage(16);
        doc.setFillColor(...softGold);
        doc.rect(margin, y - 10, contentW, 14, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...deepBrown);
        ['PLANET', 'POSITION', 'SR HOUSE', 'NATAL HOUSE', 'THEME'].forEach((h, i) => doc.text(h, oc[i], y));
        y += 8;
        drawHorizontalRule(warmBorder, 0.5);
        y += 10;

        const sortedOverlays = [...a.houseOverlays].sort((aa, b) => {
          const ai = PLANET_ORDER.indexOf(aa.planet);
          const bi = PLANET_ORDER.indexOf(b.planet);
          return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        });

        for (let i = 0; i < sortedOverlays.length; i++) {
          const o = sortedOverlays[i];
          checkPage(13);
          if (i % 2 === 0) {
            doc.setFillColor(252, 250, 247);
            doc.rect(margin, y - 9, contentW, 12, 'F');
          }
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(...darkText);
          doc.text(P[o.planet] || o.planet, oc[0], y);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...bodyText);
          doc.text(`${o.srSign} ${o.srDegree}`, oc[1], y);
          doc.text(o.srHouse ? `H${o.srHouse}` : '--', oc[2], y);
          doc.text(o.natalHouse ? `H${o.natalHouse}` : '--', oc[3], y);
          doc.setTextColor(...dimText);
          doc.setFontSize(7.5);
          doc.text((o.houseTheme || '').substring(0, 38), oc[4], y);
          y += 12;
        }
        y += 6;
      }

      // --- STELLIUMS ---
      if (a.stelliums.length > 0) {
        sectionTitle('Stelliums -- Concentrated Energy');
        for (const s of a.stelliums) {
          const planets = s.planets.map(pp => P[pp] || pp).join(', ');
          checkPage(220);

          drawCard(() => {
            writeBold(`${s.planets.length}-Planet Stellium in ${s.location}`, deepBrown, 10);
            y += 2;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(...gold);
            doc.text(planets, margin + 14, y);
            y += 14;

            // What this sign dominance means practically
            const signMeaning = stelliumSignMeaning[s.location];
            if (signMeaning) {
              writeCardSection('What This Means for Your Year', signMeaning, gold);
            }

            // How you will physically feel this
            const felt = stelliumFeltSense[s.location];
            if (felt) {
              writeCardSection('How You Will Feel This in Your Body', felt, accentGreen);
            }

            // Blend meaning — the specific planet combination
            if (s.blendMeaning) {
              writeCardSection(`This Specific Combination: ${planets}`, s.blendMeaning.replace(/\n\n/g, ' '), accentRust);
            }
          });
        }
      }

      // --- ELEMENT & MODALITY BALANCE ---
      if (a.elementBalance) {
        sectionTitle('Element & Modality Balance');
        const eb = a.elementBalance;
        const mb = a.modalityBalance;

        checkPage(180);

        const elemW = (contentW - 24) / 4;
        const elemH = 65;
        const elements = [
          { name: 'Fire', val: eb.fire, planets: eb.firePlanets, bg: [255, 245, 235] as [number, number, number] },
          { name: 'Earth', val: eb.earth, planets: eb.earthPlanets, bg: [240, 248, 240] as [number, number, number] },
          { name: 'Air', val: eb.air, planets: eb.airPlanets, bg: [240, 245, 255] as [number, number, number] },
          { name: 'Water', val: eb.water, planets: eb.waterPlanets, bg: [235, 243, 255] as [number, number, number] },
        ];

        const elemStartY = y;
        elements.forEach((el, i) => {
          const x = margin + i * (elemW + 8);
          const isDominant = el.name.toLowerCase() === eb.dominant;

          doc.setFillColor(...el.bg);
          doc.setDrawColor(...(isDominant ? gold : warmBorder));
          doc.setLineWidth(isDominant ? 1.5 : 0.5);
          doc.roundedRect(x, elemStartY, elemW, elemH, 3, 3, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(18);
          doc.setTextColor(...(isDominant ? gold : darkText));
          doc.text(String(el.val), x + elemW / 2, elemStartY + 24, { align: 'center' });

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(...bodyText);
          doc.text(el.name, x + elemW / 2, elemStartY + 36, { align: 'center' });

          if (el.planets.length > 0) {
            doc.setFontSize(7);
            doc.setTextColor(...dimText);
            const symbolStr = el.planets.map(pp => P[pp] || pp).join(', ');
            const symLines = doc.splitTextToSize(symbolStr, elemW - 8);
            symLines.slice(0, 2).forEach((line: string, li: number) => {
              doc.text(line, x + elemW / 2, elemStartY + 48 + li * 9, { align: 'center' });
            });
          }
        });
        y = elemStartY + elemH + 8;

        writeBody(eb.interpretation, bodyText, 8);
        y += 8;

        // Modality
        const modW = (contentW - 16) / 3;
        const modH = 55;
        const modalities = [
          { name: 'Cardinal', val: mb.cardinal, planets: mb.cardinalPlanets },
          { name: 'Fixed', val: mb.fixed, planets: mb.fixedPlanets },
          { name: 'Mutable', val: mb.mutable, planets: mb.mutablePlanets },
        ];

        checkPage(modH + 60);
        const modStartY = y;
        modalities.forEach((mod, i) => {
          const x = margin + i * (modW + 8);
          const isDominant = mod.name.toLowerCase() === mb.dominant;

          doc.setFillColor(...softGold);
          doc.setDrawColor(...(isDominant ? gold : warmBorder));
          doc.setLineWidth(isDominant ? 1.5 : 0.5);
          doc.roundedRect(x, modStartY, modW, modH, 3, 3, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(16);
          doc.setTextColor(...(isDominant ? gold : darkText));
          doc.text(String(mod.val), x + modW / 2, modStartY + 22, { align: 'center' });

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(...bodyText);
          doc.text(mod.name, x + modW / 2, modStartY + 34, { align: 'center' });

          if (mod.planets.length > 0) {
            doc.setFontSize(7);
            doc.setTextColor(...dimText);
            doc.text(mod.planets.map(pp => P[pp] || pp).join(', '), x + modW / 2, modStartY + 46, { align: 'center' });
          }
        });
        y = modStartY + modH + 8;

        writeBody(mb.interpretation, bodyText, 8);
        y += 6;
      }

      // --- HEMISPHERIC EMPHASIS ---
      if (a.hemisphericEmphasis) {
        sectionTitle('Hemispheric Emphasis -- Where Your Energy Lives');
        const hem = a.hemisphericEmphasis;
        const total = hem.totalCounted;

        checkPage(200);

        const quadPlanets: Record<string, string[]> = { upper: [], lower: [], east: [], west: [] };
        for (const p of PLANET_ORDER) {
          const h = a.planetSRHouses?.[p];
          if (h == null) continue;
          if (h >= 7 && h <= 12) quadPlanets.upper.push(P[p] || p);
          else quadPlanets.lower.push(P[p] || p);
          if (h >= 10 || h <= 3) quadPlanets.east.push(P[p] || p);
          else quadPlanets.west.push(P[p] || p);
        }

        const boxW = (contentW - 12) / 2;
        const boxH = 80;
        const gridData = [
          { label: 'UPPER HEMISPHERE', sub: 'Houses 7-12 -- Public & Visible', count: hem.upper, planets: quadPlanets.upper, bg: [245, 248, 255] as [number, number, number], row: 0, col: 0 },
          { label: 'LOWER HEMISPHERE', sub: 'Houses 1-6 -- Private & Internal', count: hem.lower, planets: quadPlanets.lower, bg: [255, 250, 242] as [number, number, number], row: 0, col: 1 },
          { label: 'EASTERN HEMISPHERE', sub: 'Houses 10-3 -- Self-Initiated', count: hem.east, planets: quadPlanets.east, bg: [242, 255, 248] as [number, number, number], row: 1, col: 0 },
          { label: 'WESTERN HEMISPHERE', sub: 'Houses 4-9 -- Other-Oriented', count: hem.west, planets: quadPlanets.west, bg: [255, 245, 248] as [number, number, number], row: 1, col: 1 },
        ];

        const gridStartY = y;
        for (const g of gridData) {
          const x = margin + g.col * (boxW + 12);
          const by = gridStartY + g.row * (boxH + 8);
          const isDom = g.count > total / 2;

          doc.setFillColor(...g.bg);
          doc.setDrawColor(...(isDom ? gold : warmBorder));
          doc.setLineWidth(isDom ? 1.5 : 0.5);
          doc.roundedRect(x, by, boxW, boxH, 4, 4, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(22);
          doc.setTextColor(...(isDom ? gold : darkText));
          doc.text(String(g.count), x + 16, by + 28);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(...deepBrown);
          doc.text(g.label, x + 46, by + 18);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(...dimText);
          doc.text(g.sub, x + 46, by + 30);

          const pct = total > 0 ? g.count / total : 0;
          const barW = boxW - 60;
          doc.setFillColor(230, 225, 218);
          doc.roundedRect(x + 46, by + 38, barW, 6, 2, 2, 'F');
          if (pct > 0) {
            doc.setFillColor(...gold);
            doc.roundedRect(x + 46, by + 38, barW * pct, 6, 2, 2, 'F');
          }
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(...gold);
          doc.text(`${Math.round(pct * 100)}%`, x + 48 + barW * pct + 4, by + 43);

          if (g.planets.length > 0) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(...bodyText);
            const pStr = g.planets.join(', ');
            const pLines = doc.splitTextToSize(pStr, boxW - 24);
            pLines.slice(0, 2).forEach((line: string, li: number) => {
              doc.text(line, x + 14, by + 58 + li * 9);
            });
          }
        }
        y = gridStartY + (boxH + 8) * 2 + 6;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...deepBrown);
        doc.text(`Vertical: ${hem.verticalLabel}`, margin + 8, y);
        doc.text(`Horizontal: ${hem.horizontalLabel}`, margin + contentW / 2, y);
        y += 14;

        checkPage(120);
        drawCard(() => {
          writeBold(hem.verticalDetail.title, gold, 9);
          writeBody(hem.verticalDetail.summary, bodyText, 8);
          y += 4;
          if (hem.verticalDetail.practicalAdvice.length > 0) {
            writeBold('How To Apply This:', accentGreen, 8);
            for (const tip of hem.verticalDetail.practicalAdvice.slice(0, 3)) {
              writeBody(`  --> ${tip}`, bodyText, 7.5, 11);
            }
          }
        });

        checkPage(120);
        drawCard(() => {
          writeBold(hem.horizontalDetail.title, gold, 9);
          writeBody(hem.horizontalDetail.summary, bodyText, 8);
          y += 4;
          if (hem.horizontalDetail.practicalAdvice.length > 0) {
            writeBold('How To Apply This:', accentGreen, 8);
            for (const tip of hem.horizontalDetail.practicalAdvice.slice(0, 3)) {
              writeBody(`  --> ${tip}`, bodyText, 7.5, 11);
            }
          }
        });

        if (hem.combinedInsight) {
          y += 4;
          writeBold('Combined Reading:', gold, 8);
          writeBody(hem.combinedInsight, bodyText, 8);
        }
        y += 8;
      }

      // --- ANGULAR PLANETS ---
      if (a.angularPlanets && a.angularPlanets.length > 0) {
        sectionTitle('Angular Planets -- Year\'s Most Powerful Players');
        writeBody('Planets on the angles (1st, 4th, 7th, 10th house cusps) are the loudest forces in any Solar Return. They produce visible, undeniable results in the areas of life they rule.', dimText, 8);
        y += 6;
        const angularList = a.angularPlanets.map(p => P[p] || p).join(', ');
        checkPage(80);
        drawCard(() => {
          writeBold(`Angular: ${angularList}`, gold, 10);
          y += 4;
          for (const ap of a.angularPlanets) {
            const pm = planetLifeMeanings[ap] || planetLifeMeanings[ap.replace('NorthNode','North Node')];
            if (pm) {
              writeBold(`${P[ap] || ap}:`, deepBrown, 8);
              writeBody(`${pm.inYourLife} On an angle, this energy operates at maximum volume all year. ${pm.bodyFeeling}`, bodyText, 8);
              y += 3;
            }
          }
        });
      }

      // --- LORD OF THE YEAR ---
      if (a.lordOfTheYear) {
        sectionTitle('Lord of the Year (Profection)');
        const lord = a.lordOfTheYear;
        checkPage(120);
        drawCard(() => {
          writeBold(`${P[lord.planet] || lord.planet} -- Time Lord for This Year`, gold, 10);
          y += 2;
          writeLabel('Position:', `${lord.srSign} (SR House ${lord.srHouse || '--'})`);
          writeLabel('Dignity:', lord.dignity);
          if (lord.isRetrograde) writeLabel('Status:', 'Retrograde -- revisiting old themes');
          y += 4;
          const pm = planetLifeMeanings[lord.planet];
          if (pm) {
            writeCardSection('What This Planet Rules in Your Life', pm.inYourLife, accentGreen);
            writeCardSection('How You Will Feel It', pm.bodyFeeling, accentRust);
          }
          writeBody(lord.interpretation, bodyText, 8);
        });
      }

      // --- SR ASCENDANT IN NATAL HOUSE ---
      if (a.srAscInNatalHouse) {
        sectionTitle('SR Ascendant in Your Natal Chart');
        const ascNat = a.srAscInNatalHouse;
        checkPage(90);
        drawCard(() => {
          writeBold(`SR Ascendant Falls in Natal House ${ascNat.natalHouse}`, gold, 10);
          writeLabel('Natal House Theme:', ascNat.natalHouseTheme);
          y += 4;
          writeBody(ascNat.interpretation, bodyText, 8);
        });
      }

      // --- REPEATED THEMES ---
      if (a.repeatedThemes && a.repeatedThemes.length > 0) {
        sectionTitle('Repeated Themes -- The Year\'s Core Messages');
        writeBody('When the same theme appears through multiple independent techniques, it is the year\'s central message. Pay close attention — these are the threads that weave through every layer of your Solar Return.', dimText, 8);
        y += 6;
        for (const theme of a.repeatedThemes) {
          checkPage(80);
          drawCard(() => {
            writeBold(theme.description, gold, 9);
            writeBody(theme.significance, bodyText, 8);
          });
        }
      }

      // --- SATURN & NORTH NODE ---
      if (a.saturnFocus || a.nodesFocus) {
        sectionTitle('Saturn & North Node -- Year\'s Structural Themes');

        writeBody('Why these two are singled out: Saturn is the planet of consequences. Whatever house Saturn occupies in your Solar Return is the area of life where shortcuts fail and discipline produces real results. The North Node is your evolutionary direction — the growth edge where life is pulling you forward, even when it feels uncomfortable.', bodyText, 8);
        y += 8;

        if (a.saturnFocus) {
          checkPage(140);
          drawCard(() => {
            writeBold('Saturn\'s Assignment This Year', gold, 10);
            writeBold(`${a.saturnFocus!.sign} -- SR House ${a.saturnFocus!.house || '--'}, Natal House ${a.saturnFocus!.natalHouse || '--'}${a.saturnFocus!.isRetrograde ? ' (Rx)' : ''}`, deepBrown, 9);
            y += 4;
            // Use house-specific meaning
            const satMeaning = saturnHouseMeaning[a.saturnFocus!.house];
            if (satMeaning) {
              writeCardSection('What This Means', satMeaning, accentGreen);
            }
            writeBody(a.saturnFocus!.interpretation, bodyText, 8);
          });
        }

        if (a.nodesFocus) {
          checkPage(140);
          drawCard(() => {
            writeBold('Growth Edge (North Node)', gold, 10);
            writeBold(`${a.nodesFocus!.sign} -- SR House ${a.nodesFocus!.house || '--'}`, deepBrown, 9);
            y += 4;
            const nodeMeaning = nodeHouseMeaning[a.nodesFocus!.house];
            if (nodeMeaning) {
              writeCardSection('What This Means', nodeMeaning, accentGreen);
            }
            writeBody(a.nodesFocus!.interpretation, bodyText, 8);
          });
        }
      }

      // --- SR-TO-NATAL ASPECTS (with full felt interpretation in cards) ---
      if (a.srToNatalAspects.length > 0) {
        const allAspects = a.srToNatalAspects.filter(
          asp => !(asp.planet1 === 'Sun' && asp.planet2 === 'Sun' && asp.type === 'Conjunction')
        );

        const majorAspects = allAspects.filter(asp => MAJOR_BODIES.has(asp.planet1) && MAJOR_BODIES.has(asp.planet2));
        const minorAspects = allAspects.filter(asp => !MAJOR_BODIES.has(asp.planet1) || !MAJOR_BODIES.has(asp.planet2));

        sectionTitle('Key SR-to-Natal Aspects');

        for (let i = 0; i < Math.min(majorAspects.length, 15); i++) {
          const asp = majorAspects[i];
          const interp = generateSRtoNatalInterpretation(asp.planet1, asp.planet2, asp.type, asp.orb);
          const isHard = ['Square', 'Opposition', 'Quincunx'].includes(asp.type);

          checkPage(120);
          drawCard(() => {
            writeBold(`SR ${P[asp.planet1] || asp.planet1}  ${asp.type}  Natal ${P[asp.planet2] || asp.planet2}`, darkText, 9);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(...dimText);
            doc.text(`(${asp.orb}' orb)`, margin + 14, y);
            y += 12;

            writeCardSection('How It Feels', interp.howItFeels, accentGreen);
            writeCardSection('What It Means', interp.whatItMeans, gold);
            writeCardSection('What To Do', interp.whatToDo, accentRust);
          }, isHard ? [180, 100, 60] : gold);
        }

        if (minorAspects.length > 0) {
          y += 8;
          writeBold('Asteroid & Minor Body Aspects', dimText, 8);
          y += 4;
          for (const asp of minorAspects.slice(0, 8)) {
            checkPage(12);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(...bodyText);
            doc.text(`SR ${P[asp.planet1] || asp.planet1} ${asp.type} Natal ${P[asp.planet2] || asp.planet2} (${asp.orb}')`, margin + 12, y);
            y += 11;
          }
        }
        y += 6;
      }

      // --- NATAL DEGREE CONNECTIONS ---
      if (a.natalDegreeConduits.length > 0) {
        sectionTitle('Natal Degree Connections');
        writeBody('When a Solar Return planet lands on the exact degree of a natal planet, it creates a powerful direct activation — like flipping a switch that has been dormant. That natal planet\'s themes become central to the year.', dimText, 8);
        y += 6;
        for (const cd of a.natalDegreeConduits) {
          checkPage(14);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(...darkText);
          const srText = `SR ${P[cd.srPlanet] || cd.srPlanet} in ${cd.srSign} ${cd.degree}`;
          doc.text(srText, margin + 8, y);
          const srW = doc.getTextWidth(srText);
          doc.setTextColor(...gold);
          doc.text('  -->  ', margin + 8 + srW, y);
          const arrowW = doc.getTextWidth('  -->  ');
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...bodyText);
          doc.text(`Natal ${P[cd.natalPlanet] || cd.natalPlanet} (${cd.orb.toFixed(1)}')`, margin + 8 + srW + arrowW, y);
          y += 13;
        }
        y += 6;
      }

      // --- MOON TIMING ---
      if (a.moonTimingEvents.length > 0) {
        sectionTitle('Moon Timing -- When Things Happen');
        writeBody('The SR Moon moves approximately 1 degree per month from your birthday. When it perfects an aspect to another planet, that month becomes an emotional turning point — the time when themes crystallize into events.', dimText, 8);
        y += 6;

        const mc = [margin + 4, margin + 85, margin + 240];
        checkPage(16);
        doc.setFillColor(...softGold);
        doc.rect(margin, y - 10, contentW, 14, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...deepBrown);
        ['MONTH', 'ASPECT', 'SIGNIFICANCE'].forEach((h, i) => doc.text(h, mc[i], y));
        y += 8;
        drawHorizontalRule(warmBorder, 0.5);
        y += 10;

        for (let i = 0; i < Math.min(a.moonTimingEvents.length, 12); i++) {
          const evt = a.moonTimingEvents[i];
          checkPage(13);
          if (i % 2 === 0) {
            doc.setFillColor(252, 250, 247);
            doc.rect(margin, y - 9, contentW, 12, 'F');
          }
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(...gold);
          doc.text(evt.approximateMonth, mc[0], y);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...darkText);
          doc.text(`Moon ${evt.aspectType} ${P[evt.targetPlanet] || evt.targetPlanet}`, mc[1], y);
          doc.setTextColor(...dimText);
          doc.setFontSize(7.5);
          doc.text((evt.interpretation || '').substring(0, 50), mc[2], y);
          y += 12;
        }
        y += 6;
      }

      // --- RETROGRADES ---
      if (a.retrogrades && a.retrogrades.count > 0) {
        sectionTitle('Retrograde Planets');
        const retList = a.retrogrades.planets.map(pp => P[pp] || pp).join(', ');
        checkPage(80);
        drawCard(() => {
          writeBold(`${a.retrogrades.count} Retrograde: ${retList}`, darkText, 9);
          y += 4;
          writeBody(a.retrogrades.interpretation, bodyText, 8);
        });
      }

      // --- VERTEX ---
      if (a.vertex) {
        sectionTitle('Vertex -- Fated Encounters');
        checkPage(120);
        drawCard(() => {
          writeBold(`Vertex: ${a.vertex!.sign} ${a.vertex!.degree}' ${a.vertex!.minutes}' ${a.vertex!.house ? `(SR House ${a.vertex!.house})` : ''}`, deepBrown, 9);
          const vSign = vertexInSign[a.vertex!.sign];
          if (vSign) {
            writeCardSection('Fated Theme', vSign.fatedTheme, gold);
            writeCardSection('Who May Appear', vSign.encounters, accentGreen);
            writeCardSection('The Lesson', vSign.lesson, accentRust);
          }
          if (a.vertex!.house && vertexInHouse[a.vertex!.house]) {
            const vH = vertexInHouse[a.vertex!.house];
            writeBold(`${vH.title} (House ${a.vertex!.house})`, darkText, 8);
            writeBody(vH.description, bodyText, 8);
            writeBody(`Fated Areas: ${vH.fatedArea}`, dimText, 7);
            y += 4;
          }
          if (a.vertex!.aspects.length > 0) {
            writeBold('Planets Aspecting Vertex:', gold, 8);
            for (const asp of a.vertex!.aspects.slice(0, 6)) {
              writeBody(`${P[asp.planet.replace('Natal ', '')] || asp.planet} ${asp.aspectType} Vertex (${asp.orb}')`, bodyText, 8);
            }
          }
        });
      }

      // --- PLANET SPOTLIGHT ---
      const deepData: Record<string, Record<number, any>> = {
        Mercury: srMercuryInHouseDeep,
        Venus: srVenusInHouseDeep,
        Mars: srMarsInHouseDeep,
        Jupiter: srJupiterInHouseDeep,
        Saturn: srSaturnInHouseDeep,
        Uranus: srUranusInHouseDeep,
        Neptune: srNeptuneInHouseDeep,
        Pluto: srPlutoInHouseDeep,
      };
      const spotlightPlanets = SPOTLIGHT_ORDER.filter(p => {
        const h = a.planetSRHouses?.[p];
        return h !== null && h !== undefined && deepData[p]?.[h];
      });
      if (spotlightPlanets.length > 0) {
        sectionTitle('Planet Spotlight -- Expert Analysis');
        for (const planet of spotlightPlanets) {
          const h = a.planetSRHouses[planet]!;
          const data = deepData[planet][h];
          if (!data) continue;
          checkPage(140);

          drawCard(() => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(...gold);
            doc.text(`${P[planet] || planet} in SR House ${h}`, margin + 14, y);
            y += 14;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(...darkText);
            doc.text(data.title, margin + 14, y);
            y += 12;

            writeBody(data.overview, bodyText, 8);
            y += 4;
            writeCardSection('Practical Manifestation', data.practical, accentGreen);
            writeCardSection('Caution', data.caution, accentRust);
          });
        }
      }

      // --- SR MOON ASPECTS ---
      const moonSRAspects = a.srInternalAspects.filter(
        asp => asp.planet1 === 'Moon' || asp.planet2 === 'Moon'
      );
      const moonNatalAspects = a.srToNatalAspects.filter(asp => asp.planet1 === 'Moon');
      if (moonSRAspects.length > 0 || moonNatalAspects.length > 0) {
        sectionTitle('Moon Aspects');
        if (moonSRAspects.length > 0) {
          writeBold('Moon Aspects to SR Planets:', gold, 8);
          for (const asp of moonSRAspects.slice(0, 8)) {
            const other = asp.planet1 === 'Moon' ? asp.planet2 : asp.planet1;
            const isHard = ['Square', 'Opposition', 'Quincunx'].includes(asp.type);
            writeBody(`Moon ${asp.type} ${P[other] || other} (${asp.orb}') -- ${isHard ? 'Tension' : 'Flow'}`, bodyText, 8);
          }
          y += 4;
        }
        if (moonNatalAspects.length > 0) {
          writeBold('SR Moon Aspects to Natal Planets:', gold, 8);
          for (const asp of moonNatalAspects.slice(0, 8)) {
            const isHard = ['Square', 'Opposition', 'Quincunx'].includes(asp.type);
            writeBody(`SR Moon ${asp.type} Natal ${P[asp.planet2] || asp.planet2} (${asp.orb}') -- ${isHard ? 'Tension' : 'Flow'}`, bodyText, 8);
          }
          y += 4;
        }
      }

      // --- YEAR-AHEAD NARRATIVE ---
      if (narrative) {
        sectionTitle('Year-Ahead Reading');
        const lines = narrative.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) { y += 5; continue; }
          if (trimmed.startsWith('## ')) {
            checkPage(60);
            y += 8;
            drawHorizontalRule(softGold);
            y += 10;
            writeBold(trimmed.replace('## ', '').toUpperCase(), gold, 9);
            y += 4;
          } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
            checkPage(30);
            writeBold(trimmed.replace(/\*\*/g, ''), darkText, 9);
          } else {
            const clean = trimmed
              .replace(/\*\*(.*?)\*\*/g, '$1')
              .replace(/\*(.*?)\*/g, '$1')
              .replace(/[^\x00-\x7F]/g, '');
            writeBody(clean, bodyText, 8, 12);
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
      {/* Birthday mode toggle + personal message */}
      <div className="flex items-start gap-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={birthdayMode}
            onChange={(e) => setBirthdayMode(e.target.checked)}
            className="rounded border-border accent-primary w-4 h-4"
          />
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
            🎂 Birthday Gift Mode
          </span>
        </label>
      </div>

      {birthdayMode && (
        <div className="border border-primary/20 rounded-sm p-3 bg-primary/5 space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-primary block">Personal Message</label>
          <textarea
            value={personalMessage}
            onChange={(e) => setPersonalMessage(e.target.value)}
            placeholder="Happy birthday! Wishing you an amazing year ahead filled with cosmic magic..."
            rows={3}
            className="w-full border border-border bg-background text-foreground rounded-sm px-3 py-2 text-sm resize-none placeholder:text-muted-foreground/50"
          />
          <p className="text-[10px] text-muted-foreground">This message will appear at the top of the PDF under "Happy Birthday!"</p>
        </div>
      )}

      <button
        onClick={generatePDF}
        disabled={generating}
        className="text-[11px] uppercase tracking-widest px-3 py-1.5 border border-border rounded-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 disabled:opacity-50"
      >
        {generating ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
        {generating ? 'Generating PDF...' : birthdayMode ? 'Download Birthday Gift PDF' : 'Download PDF Report'}
      </button>
    </div>
  );
};

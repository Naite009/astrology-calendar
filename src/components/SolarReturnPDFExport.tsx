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

const SIGN_SYMBOLS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

// Grid positions for each sign in the 4x3 cake image
const CAKE_GRID: Record<string, { row: number; col: number }> = {
  Aries: { row: 0, col: 0 }, Taurus: { row: 0, col: 1 }, Gemini: { row: 0, col: 2 }, Cancer: { row: 0, col: 3 },
  Leo: { row: 1, col: 0 }, Virgo: { row: 1, col: 1 }, Libra: { row: 1, col: 2 }, Scorpio: { row: 1, col: 3 },
  Sagittarius: { row: 2, col: 0 }, Capricorn: { row: 2, col: 1 }, Aquarius: { row: 2, col: 2 }, Pisces: { row: 2, col: 3 },
};

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

const MAJOR_BODIES = new Set(['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','NorthNode','SouthNode','Ascendant']);
const PLANET_ORDER = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','NorthNode'];
const SPOTLIGHT_ORDER = ['Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];

// Stellium felt-sense — SHORTENED for PDF
const stelliumFeltSense: Record<string, string> = {
  'Aries': 'Restless energy, constant urge to START. Patience drops. Courage surges. Danger: exhaustion from never slowing down.',
  'Taurus': 'Deep craving for stability and sensory pleasure. Body wants good food, soft textures, financial security. Danger: getting stuck.',
  'Gemini': 'Mental overstimulation, racing thoughts. Mind is a browser with 40 tabs open. Danger: saying yes to everything, finishing nothing.',
  'Cancer': 'Emotional waves, sensitivity to atmosphere, powerful pull toward home. Gut tells you things before your mind catches up. Danger: retreating too far inward.',
  'Leo': 'Warm expansion in your chest, need to create and be seen. Heart opens wider. Danger: confusing applause with love.',
  'Virgo': 'Tension in stomach and shoulders, compulsion to organize and perfect. Body demands better habits. Danger: paralyzing perfectionism.',
  'Libra': 'Heightened sensitivity to discord. Crave harmony in environment and relationships. Danger: losing yourself in others\' preferences.',
  'Scorpio': 'Intensity in your gut, magnetic pull toward hidden truths. Superficial interactions feel intolerable. Danger: obsession and control.',
  'Sagittarius': 'Restlessness in your legs, urge to GO somewhere and learn something. Small talk feels insufferable. Danger: overcommitment.',
  'Capricorn': 'Weight on shoulders, sobering awareness of time and responsibility. Spine straightens. Danger: working into isolation.',
  'Aquarius': 'Electric buzzing under your skin, sudden insights, urge to break free. Nervous system speeds up. Danger: detachment from emotions.',
  'Pisces': 'Dissolving of normal boundaries, heightened empathy, vivid dreams. Intuition becomes almost psychic. Danger: losing yourself in others\' pain.',
};

const stelliumSignMeaning: Record<string, string> = {
  'Aries': 'Identity rebuilt from scratch. Everything feels personal. Decisions faster but need impulse control. Physical energy high — use it or it becomes irritability.',
  'Taurus': 'Material reality: money, body, possessions. Financial decisions carry extra weight. Build slowly; not a year for shortcuts.',
  'Gemini': 'Mind is the main character. Learning, communicating, networking dominate. Challenge: depth vs. breadth.',
  'Cancer': 'Home, family, emotional foundations. Where you live and who you live with become central. Emotional world is the priority.',
  'Leo': 'Creative self-expression and visibility. Step into the spotlight. Question: performing or genuinely expressing yourself?',
  'Virgo': 'Systems, health, daily function. Routines and work habits under review. Perfectionism is the trap; practical improvement the gift.',
  'Libra': 'Relationships and balance of giving and receiving. Learning about fairness, compromise, and what you will not tolerate.',
  'Scorpio': 'Power dynamics, financial entanglements, transformation. Something needs to die so something authentic can be born.',
  'Sagittarius': 'Expand your world. Travel, education, philosophy amplified. Searching for MEANING in work, beliefs, life direction.',
  'Capricorn': 'Ambition, authority, lasting structures. Career and reputation are priority. Question: climbing the right mountain?',
  'Aquarius': 'Your place in the collective. Friendships, groups, technology, social causes become central.',
  'Pisces': 'Boundaries dissolve. Creativity, spirituality, healing dominate. More intuitive, more empathic, more vulnerable.',
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
  1: 'Growth edge: SELF-assertion. Stop deferring. The universe rewards independence and self-advocacy.',
  2: 'Growth: building financial independence and clarifying values. Your self-worth is the real currency.',
  3: 'Growth: communication and learning. Speak up. Write. Have the conversations you\'ve been avoiding.',
  4: 'Growth: home, family, emotional foundations. Put down roots. Create space that reflects who you are.',
  5: 'Growth: creative self-expression and taking emotional risks. Stop hiding behind responsibilities. Play.',
  6: 'Growth: daily habits, health, service. Big breakthroughs happen in small moments. Master the mundane.',
  7: 'Growth: partnership and collaboration. Stop doing everything alone. The right relationship accelerates evolution.',
  8: 'Growth: emotional depth and shared vulnerability. Let someone see the real you.',
  9: 'Growth: expanding your worldview. Travel. Study. Your comfort zone is too small for who you\'re becoming.',
  10: 'Growth: career and stepping into authority. Stop playing small. Take the promotion, start the business.',
  11: 'Growth: community, friendship, collective purpose. Connect personal goals to a larger vision.',
  12: 'Growth: surrender and releasing control. Meditate. Rest. Deepest wisdom arrives in stillness.',
};

/** Crop a specific sign's cake from the grid image */
async function getCakeImageDataUrl(sunSign: string): Promise<string | null> {
  const grid = CAKE_GRID[sunSign];
  if (!grid) return null;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const cellW = img.width / 4;
      const cellH = img.height / 3;
      const canvas = document.createElement('canvas');
      canvas.width = cellW;
      canvas.height = cellH;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(null); return; }
      ctx.drawImage(img, grid.col * cellW, grid.row * cellH, cellW, cellH, 0, 0, cellW, cellH);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = '/images/zodiac-cakes.png';
  });
}

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

      const checkPage = (needed: number) => {
        if (y + needed > ph - 55) { doc.addPage(); y = margin; }
      };

      const drawHorizontalRule = (color: [number, number, number] = warmBorder, width = 0.5) => {
        doc.setDrawColor(...color); doc.setLineWidth(width);
        doc.line(margin, y, pw - margin, y);
      };

      const drawGoldRule = () => {
        doc.setDrawColor(...gold); doc.setLineWidth(1);
        doc.line(margin, y, pw - margin, y);
      };

      const drawContentBox = (x: number, yStart: number, w: number, h: number, bg: [number, number, number] = creamBg) => {
        doc.setFillColor(...bg); doc.setDrawColor(...warmBorder); doc.setLineWidth(0.5);
        doc.roundedRect(x, yStart, w, h, 4, 4, 'FD');
      };

      const sectionTitle = (title: string) => {
        checkPage(120);
        y += 20; drawGoldRule(); y += 16;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(...gold);
        doc.text(title.toUpperCase(), margin, y); y += 16;
      };

      const writeBody = (text: string, color: [number, number, number] = bodyText, size = 9, lineH = 13.5) => {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(size); doc.setTextColor(...color);
        const lines: string[] = doc.splitTextToSize(text, contentW - 16);
        for (const line of lines) { checkPage(lineH); doc.text(line, margin + 8, y); y += lineH; }
      };

      const writeBold = (text: string, color: [number, number, number] = darkText, size = 10) => {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(size); doc.setTextColor(...color);
        const lines: string[] = doc.splitTextToSize(text, contentW - 16);
        for (const line of lines) { checkPage(15); doc.text(line, margin + 8, y); y += 14; }
      };

      const writeLabel = (label: string, value: string, labelColor: [number, number, number] = dimText, valueColor: [number, number, number] = darkText) => {
        checkPage(14);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...labelColor);
        doc.text(label, margin + 8, y);
        const labelW = doc.getTextWidth(label);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...valueColor);
        doc.text(value, margin + 8 + labelW + 4, y); y += 14;
      };

      const drawCard = (renderContent: () => void, accentColor: [number, number, number] = gold) => {
        const cardStartY = y; y += 12;
        renderContent(); y += 10;
        const cardH = y - cardStartY;
        doc.setDrawColor(...warmBorder); doc.setLineWidth(0.5);
        doc.roundedRect(margin, cardStartY, contentW, cardH, 4, 4, 'S');
        doc.setDrawColor(...accentColor); doc.setLineWidth(2.5);
        doc.line(margin + 1, cardStartY + 2, margin + 1, cardStartY + cardH - 2);
        y += 6;
      };

      const writeCardSection = (label: string, text: string, labelColor: [number, number, number] = accentGreen) => {
        writeBold(label, labelColor, 8); writeBody(text, bodyText, 8); y += 3;
      };

      // ═══════════════════════════════════════════════
      // PAGE 1: COVER PAGE
      // ═══════════════════════════════════════════════
      const a = analysis;
      const name = natalChart.name || 'Chart';
      const year = srChart.solarReturnYear;

      // Get the sun sign for the cake
      const sunSign = natalChart.planets.Sun?.sign || '';
      const moonSign = natalChart.planets.Moon?.sign || '';
      const risingSign = natalChart.planets.Ascendant?.sign || '';

      y = 50;

      // --- BIRTHDAY HEADER with cake image ---
      if (birthdayMode) {
        // Load cake image
        const cakeDataUrl = await getCakeImageDataUrl(sunSign);

        // Decorative top line
        doc.setDrawColor(...gold); doc.setLineWidth(1.5);
        doc.line(margin, y, pw - margin, y);
        y += 30;

        // Layout: cake on left, Happy Birthday + Big 3 on right
        const cakeSize = 140;
        const textStartX = margin + cakeSize + 24;
        const textW = contentW - cakeSize - 24;

        if (cakeDataUrl) {
          doc.addImage(cakeDataUrl, 'PNG', margin, y - 10, cakeSize, cakeSize);
        }

        // "Happy Birthday!" in decorative style
        doc.setFont('times', 'bolditalic');
        doc.setFontSize(36);
        doc.setTextColor(188, 120, 60);
        doc.text('Happy', textStartX, y + 20);
        doc.setFontSize(44);
        doc.text('Birthday!', textStartX, y + 58);

        // Sparkle line
        doc.setFontSize(14); doc.setTextColor(...gold);
        doc.text('✦  ·  ✦  ·  ✦', textStartX, y + 76);

        // Big 3 display
        const big3Y = y + 96;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
        doc.setTextColor(...deepBrown);
        if (sunSign) {
          doc.text(`☉  ${sunSign} Sun`, textStartX, big3Y);
        }
        if (moonSign) {
          doc.text(`☽  ${moonSign} Moon`, textStartX, big3Y + 16);
        }
        if (risingSign) {
          doc.text(`↑  ${risingSign} Rising`, textStartX, big3Y + 32);
        }

        y += cakeSize + 10;

        // Personal message
        if (personalMessage.trim()) {
          y += 8;
          const msgLines: string[] = doc.splitTextToSize(personalMessage.trim(), contentW - 60);
          const msgH = msgLines.length * 14 + 24;
          doc.setFillColor(252, 248, 240); doc.setDrawColor(...gold); doc.setLineWidth(1);
          doc.roundedRect(margin + 20, y, contentW - 40, msgH, 6, 6, 'FD');
          doc.setFont('times', 'italic'); doc.setFontSize(10); doc.setTextColor(100, 80, 50);
          let msgY = y + 16;
          for (const line of msgLines) { doc.text(line, pw / 2, msgY, { align: 'center' }); msgY += 14; }
          y += msgH + 12;
        }

        // Decorative bottom line
        doc.setDrawColor(...gold); doc.setLineWidth(1.5);
        doc.line(margin, y, pw - margin, y);
        y += 20;
      }

      // --- TITLE AREA ---
      if (!birthdayMode) {
        doc.setDrawColor(...gold); doc.setLineWidth(2);
        doc.line(margin, y, pw - margin, y);
        y += 1; doc.setLineWidth(0.5);
        doc.line(margin, y + 2, pw - margin, y + 2);
        y += 40;
      }

      doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(...gold);
      doc.text('S O L A R   R E T U R N', pw / 2, y, { align: 'center' });
      y += 28;

      doc.setFont('helvetica', 'bold'); doc.setFontSize(28); doc.setTextColor(...darkText);
      doc.text(String(year), pw / 2, y, { align: 'center' });
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

      // Big 3 on cover page (always show, not just birthday mode)
      if (sunSign || moonSign || risingSign) {
        const big3BoxW = 180;
        const big3BoxH = 60;
        const big3X = (pw - big3BoxW) / 2;
        doc.setFillColor(...softGold); doc.setDrawColor(...gold); doc.setLineWidth(1);
        doc.roundedRect(big3X, y, big3BoxW, big3BoxH, 6, 6, 'FD');
        
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...deepBrown);
        let by = y + 18;
        if (sunSign) {
          doc.text(`☉  ${sunSign}`, pw / 2, by, { align: 'center' }); by += 16;
        }
        if (moonSign) {
          doc.text(`☽  ${moonSign}`, pw / 2, by, { align: 'center' }); by += 16;
        }
        if (risingSign) {
          doc.text(`↑  ${risingSign} Rising`, pw / 2, by, { align: 'center' });
        }
        y += big3BoxH + 12;
      }

      // Birth info
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...dimText);
      doc.text(`Born: ${formatDate(natalChart.birthDate)}   ${natalChart.birthLocation || ''}`, pw / 2, y, { align: 'center' });
      if (srChart.solarReturnLocation) {
        y += 12;
        doc.text(`SR Location: ${srChart.solarReturnLocation}`, pw / 2, y, { align: 'center' });
      }
      y += 20;

      // ═══════════════════════════════════════════════
      // YEAR AT A GLANCE
      // ═══════════════════════════════════════════════
      sectionTitle('Year at a Glance');

      const glanceStartY = y; y += 12;
      if (a.yearlyTheme) {
        writeLabel('SR Ascendant:', `${a.yearlyTheme.ascendantSign} Rising`);
        writeLabel('Ruler:', `${P[a.yearlyTheme.ascendantRuler] || a.yearlyTheme.ascendantRuler} in ${a.yearlyTheme.ascendantRulerSign}`);
        y += 4;
      }
      if (a.srAscRulerInNatal) {
        writeBold('Where This Year Plays Out', deepBrown, 9);
        writeBody(`${P[a.srAscRulerInNatal.rulerPlanet] || a.srAscRulerInNatal.rulerPlanet} in ${a.srAscRulerInNatal.rulerNatalSign || '--'} -- Natal House ${a.srAscRulerInNatal.rulerNatalHouse || '--'}`, darkText, 9);
        writeBody(a.srAscRulerInNatal.interpretation, bodyText, 8);
        y += 4;
      }
      if (a.profectionYear) {
        writeLabel('Profection:', `House ${a.profectionYear.houseNumber} (Age ${a.profectionYear.age})`);
        writeLabel('Time Lord:', P[a.profectionYear.timeLord] || a.profectionYear.timeLord);
      }
      writeLabel('Moon:', `${a.moonSign} in SR House ${a.moonHouse?.house || '--'}   ${a.moonPhase?.phase || ''}`);
      y += 8;

      const glanceEndY = y;
      doc.setDrawColor(...gold); doc.setLineWidth(2.5);
      doc.line(margin, glanceStartY, margin, glanceEndY);

      // ═══════════════════════════════════════════════
      // MOON SIGN SHIFT
      // ═══════════════════════════════════════════════
      const natalMoonSign = natalChart.planets.Moon?.sign;
      const srMoonSign = a.moonSign;
      if (natalMoonSign && srMoonSign) {
        sectionTitle('Moon Sign Shift -- Your Emotional Year');

        const halfW = (contentW - 16) / 2;
        const natalDeep = moonSignDeep[natalMoonSign];
        const srDeep = moonSignDeep[srMoonSign];
        const boxH = 100;
        checkPage(boxH + 160);
        const moonBoxY = y;

        // Natal Moon box
        drawContentBox(margin, moonBoxY, halfW, boxH, softGold);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...deepBrown);
        doc.text('NATAL MOON', margin + 10, moonBoxY + 14);
        doc.setFontSize(13); doc.setTextColor(...gold);
        doc.text(`${SIGN_SYMBOLS[natalMoonSign] || ''} ${natalMoonSign.toUpperCase()}`, margin + 10, moonBoxY + 30);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...bodyText);
        const natalMoonLines = doc.splitTextToSize(natalDeep?.emotional || '', halfW - 20);
        natalMoonLines.slice(0, 6).forEach((line: string, i: number) => {
          doc.text(line, margin + 10, moonBoxY + 42 + i * 9);
        });

        // SR Moon box
        const srBoxX = margin + halfW + 16;
        drawContentBox(srBoxX, moonBoxY, halfW, boxH, softBlue);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...deepBrown);
        doc.text('THIS YEAR\'S MOON', srBoxX + 10, moonBoxY + 14);
        doc.setFontSize(13); doc.setTextColor(...gold);
        doc.text(`${SIGN_SYMBOLS[srMoonSign] || ''} ${srMoonSign.toUpperCase()}`, srBoxX + 10, moonBoxY + 30);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...bodyText);
        const srMoonLines = doc.splitTextToSize(srDeep?.emotional || '', halfW - 20);
        srMoonLines.slice(0, 6).forEach((line: string, i: number) => {
          doc.text(line, srBoxX + 10, moonBoxY + 42 + i * 9);
        });

        y = moonBoxY + boxH + 10;

        if (natalMoonSign !== srMoonSign) {
          checkPage(140);
          drawCard(() => {
            writeBold(`The Shift: ${natalMoonSign} --> ${srMoonSign}`, deepBrown, 10);
            y += 2;
            const specificNarrative = moonShiftNarrative[natalMoonSign]?.[srMoonSign];
            if (specificNarrative) {
              writeBody(specificNarrative, bodyText, 8);
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
            writeBold(`Moon Stays in ${natalMoonSign} -- Emotional Continuity`, deepBrown, 10);
            writeBody(`Your SR Moon matches natal. This year amplifies your emotional instincts. Trust your gut — it\'s running on native software.`, bodyText, 8);
          });
        }
        y += 6;
      }

      // ═══════════════════════════════════════════════
      // COMPARISON TABLE (compact)
      // ═══════════════════════════════════════════════
      sectionTitle('Solar Return vs Natal');

      const cols = [margin + 4, margin + 65, margin + 178, margin + 220, margin + 333, margin + 375];
      checkPage(16);
      doc.setFillColor(...softGold); doc.rect(margin, y - 10, contentW, 14, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...deepBrown);
      ['PLANET', 'SR POSITION', 'SR H', 'NATAL POSITION', 'NAT H', 'SHIFT'].forEach((h, i) => doc.text(h, cols[i], y));
      y += 8; drawHorizontalRule(warmBorder, 0.5); y += 10;

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
        if (rowIdx % 2 === 0) { doc.setFillColor(252, 250, 247); doc.rect(margin, y - 9, contentW, 12, 'F'); }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...darkText);
        doc.text(P[p] || p, cols[0], y);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...bodyText);
        doc.text(srPos ? `${srPos.sign} ${srPos.degree}'` : '--', cols[1], y);
        doc.text(srH != null ? `H${srH}` : '--', cols[2], y);
        doc.text(natPos ? `${natPos.sign} ${natPos.degree}'` : '--', cols[3], y);
        doc.text(natH != null ? `H${natH}` : '--', cols[4], y);
        doc.setTextColor(...dimText); doc.text(shift, cols[5], y);
        y += 12;
      }
      y += 6;

      // ═══════════════════════════════════════════════
      // STELLIUMS (shortened)
      // ═══════════════════════════════════════════════
      if (a.stelliums.length > 0) {
        sectionTitle('Stelliums');
        for (const s of a.stelliums) {
          const planets = s.planets.map(pp => P[pp] || pp).join(', ');
          checkPage(160);
          drawCard(() => {
            writeBold(`${s.planets.length}-Planet Stellium in ${s.location}`, deepBrown, 10);
            doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...gold);
            doc.text(planets, margin + 14, y); y += 14;
            const signMeaning = stelliumSignMeaning[s.location];
            if (signMeaning) writeCardSection('Meaning', signMeaning, gold);
            const felt = stelliumFeltSense[s.location];
            if (felt) writeCardSection('Felt Sense', felt, accentGreen);
          });
        }
      }

      // ═══════════════════════════════════════════════
      // ELEMENTS & MODALITY (visual only, minimal text)
      // ═══════════════════════════════════════════════
      if (a.elementBalance) {
        sectionTitle('Element & Modality');
        const eb = a.elementBalance;
        const mb = a.modalityBalance;

        checkPage(90);
        const elemW = (contentW - 24) / 4;
        const elemH = 50;
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
          doc.setLineWidth(isDom ? 1.5 : 0.5);
          doc.roundedRect(x, elemStartY, elemW, elemH, 3, 3, 'FD');
          doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
          doc.setTextColor(...(isDom ? gold : darkText));
          doc.text(String(el.val), x + elemW / 2, elemStartY + 22, { align: 'center' });
          doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...bodyText);
          doc.text(el.name, x + elemW / 2, elemStartY + 36, { align: 'center' });
        });
        y = elemStartY + elemH + 8;

        // Modality — same visual approach
        const modW = (contentW - 16) / 3;
        const modH = 45;
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
          doc.setLineWidth(isDom ? 1.5 : 0.5);
          doc.roundedRect(x, modStartY, modW, modH, 3, 3, 'FD');
          doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
          doc.setTextColor(...(isDom ? gold : darkText));
          doc.text(String(mod.val), x + modW / 2, modStartY + 20, { align: 'center' });
          doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...bodyText);
          doc.text(mod.name, x + modW / 2, modStartY + 34, { align: 'center' });
        });
        y = modStartY + modH + 8;
      }

      // ═══════════════════════════════════════════════
      // HEMISPHERIC (visual 2x2 grid, no long explanations)
      // ═══════════════════════════════════════════════
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

        checkPage(180);
        const boxW = (contentW - 12) / 2;
        const boxH = 60;
        const gridData = [
          { label: 'UPPER', sub: 'Public & Visible', count: hem.upper, planets: quadPlanets.upper, bg: [245, 248, 255] as [number, number, number], row: 0, col: 0 },
          { label: 'LOWER', sub: 'Private & Internal', count: hem.lower, planets: quadPlanets.lower, bg: [255, 250, 242] as [number, number, number], row: 0, col: 1 },
          { label: 'EASTERN', sub: 'Self-Initiated', count: hem.east, planets: quadPlanets.east, bg: [242, 255, 248] as [number, number, number], row: 1, col: 0 },
          { label: 'WESTERN', sub: 'Other-Oriented', count: hem.west, planets: quadPlanets.west, bg: [255, 245, 248] as [number, number, number], row: 1, col: 1 },
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

          doc.setFont('helvetica', 'bold'); doc.setFontSize(20);
          doc.setTextColor(...(isDom ? gold : darkText));
          doc.text(String(g.count), x + 14, by + 24);

          doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...deepBrown);
          doc.text(g.label, x + 42, by + 16);
          doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...dimText);
          doc.text(g.sub, x + 42, by + 27);

          if (g.planets.length > 0) {
            doc.setFontSize(7); doc.setTextColor(...bodyText);
            doc.text(g.planets.join(', '), x + 14, by + 46);
          }
        }
        y = gridStartY + (boxH + 8) * 2 + 8;
      }

      // ═══════════════════════════════════════════════
      // ANGULAR PLANETS (short)
      // ═══════════════════════════════════════════════
      if (a.angularPlanets && a.angularPlanets.length > 0) {
        sectionTitle('Angular Planets -- Most Powerful This Year');
        const angularList = a.angularPlanets.map(p => P[p] || p).join(', ');
        checkPage(80);
        drawCard(() => {
          writeBold(angularList, gold, 11);
          y += 2;
          writeBody('Planets on the angles (houses 1, 4, 7, 10) produce visible, undeniable results all year.', dimText, 8);
          for (const ap of a.angularPlanets) {
            const pm = planetLifeMeanings[ap] || planetLifeMeanings[ap.replace('NorthNode','North Node')];
            if (pm) {
              y += 2; writeBold(`${P[ap] || ap}:`, deepBrown, 8);
              writeBody(`${pm.inYourLife} ${pm.bodyFeeling}`, bodyText, 7.5);
            }
          }
        });
      }

      // ═══════════════════════════════════════════════
      // LORD OF THE YEAR
      // ═══════════════════════════════════════════════
      if (a.lordOfTheYear) {
        sectionTitle('Lord of the Year');
        const lord = a.lordOfTheYear;
        checkPage(100);
        drawCard(() => {
          writeBold(`${P[lord.planet] || lord.planet} -- Time Lord`, gold, 10);
          writeLabel('Position:', `${lord.srSign} (SR House ${lord.srHouse || '--'})`);
          writeLabel('Dignity:', lord.dignity);
          if (lord.isRetrograde) writeLabel('Status:', 'Retrograde');
          const pm = planetLifeMeanings[lord.planet];
          if (pm) {
            writeCardSection('Rules', pm.inYourLife, accentGreen);
          }
        });
      }

      // ═══════════════════════════════════════════════
      // SATURN & NORTH NODE (shortened)
      // ═══════════════════════════════════════════════
      if (a.saturnFocus || a.nodesFocus) {
        sectionTitle('Saturn & North Node');

        if (a.saturnFocus) {
          checkPage(100);
          drawCard(() => {
            writeBold(`Saturn: ${a.saturnFocus!.sign} -- House ${a.saturnFocus!.house || '--'}${a.saturnFocus!.isRetrograde ? ' (Rx)' : ''}`, gold, 10);
            const satMeaning = saturnHouseMeaning[a.saturnFocus!.house];
            if (satMeaning) writeBody(satMeaning, bodyText, 8);
          });
        }

        if (a.nodesFocus) {
          checkPage(100);
          drawCard(() => {
            writeBold(`North Node: ${a.nodesFocus!.sign} -- House ${a.nodesFocus!.house || '--'}`, gold, 10);
            const nodeMeaning = nodeHouseMeaning[a.nodesFocus!.house];
            if (nodeMeaning) writeBody(nodeMeaning, bodyText, 8);
          });
        }
      }

      // ═══════════════════════════════════════════════
      // KEY ASPECTS (top 8 only, concise cards)
      // ═══════════════════════════════════════════════
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

          checkPage(100);
          drawCard(() => {
            writeBold(`SR ${P[asp.planet1] || asp.planet1}  ${asp.type}  Natal ${P[asp.planet2] || asp.planet2}  (${asp.orb}')`, darkText, 9);
            y += 4;
            writeCardSection('Feels', interp.howItFeels, accentGreen);
            writeCardSection('Means', interp.whatItMeans, gold);
            writeCardSection('Do', interp.whatToDo, accentRust);
          }, isHard ? [180, 100, 60] : gold);
        }
      }

      // ═══════════════════════════════════════════════
      // MOON TIMING (table only, no explanation)
      // ═══════════════════════════════════════════════
      if (a.moonTimingEvents.length > 0) {
        sectionTitle('Moon Timing -- When Things Happen');
        const mc = [margin + 4, margin + 85, margin + 240];
        checkPage(16);
        doc.setFillColor(...softGold); doc.rect(margin, y - 10, contentW, 14, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...deepBrown);
        ['MONTH', 'ASPECT', 'SIGNIFICANCE'].forEach((h, i) => doc.text(h, mc[i], y));
        y += 8; drawHorizontalRule(warmBorder, 0.5); y += 10;

        for (let i = 0; i < Math.min(a.moonTimingEvents.length, 12); i++) {
          const evt = a.moonTimingEvents[i];
          checkPage(13);
          if (i % 2 === 0) { doc.setFillColor(252, 250, 247); doc.rect(margin, y - 9, contentW, 12, 'F'); }
          doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...gold);
          doc.text(evt.approximateMonth, mc[0], y);
          doc.setFont('helvetica', 'normal'); doc.setTextColor(...darkText);
          doc.text(`Moon ${evt.aspectType} ${P[evt.targetPlanet] || evt.targetPlanet}`, mc[1], y);
          doc.setTextColor(...dimText); doc.setFontSize(7.5);
          doc.text((evt.interpretation || '').substring(0, 50), mc[2], y);
          y += 12;
        }
        y += 6;
      }

      // ═══════════════════════════════════════════════
      // VERTEX (shortened)
      // ═══════════════════════════════════════════════
      if (a.vertex) {
        sectionTitle('Vertex -- Fated Encounters');
        checkPage(100);
        drawCard(() => {
          writeBold(`Vertex: ${a.vertex!.sign} ${a.vertex!.degree}' ${a.vertex!.house ? `(House ${a.vertex!.house})` : ''}`, deepBrown, 9);
          const vSign = vertexInSign[a.vertex!.sign];
          if (vSign) {
            writeCardSection('Fated Theme', vSign.fatedTheme, gold);
            writeCardSection('Who May Appear', vSign.encounters, accentGreen);
          }
        });
      }

      // ═══════════════════════════════════════════════
      // PLANET SPOTLIGHT (top 4 only)
      // ═══════════════════════════════════════════════
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
            writeBold(`${P[planet] || planet} in House ${h}: ${data.title}`, gold, 9);
            y += 2;
            writeBody(data.practical, bodyText, 8);
            if (data.caution) writeCardSection('Watch For', data.caution, accentRust);
          });
        }
      }

      // ═══════════════════════════════════════════════
      // NARRATIVE (if generated)
      // ═══════════════════════════════════════════════
      if (narrative) {
        sectionTitle('Year-Ahead Reading');
        const lines = narrative.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) { y += 5; continue; }
          if (trimmed.startsWith('## ')) {
            checkPage(60); y += 8; drawHorizontalRule(softGold); y += 10;
            writeBold(trimmed.replace('## ', '').toUpperCase(), gold, 9); y += 4;
          } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
            checkPage(30); writeBold(trimmed.replace(/\*\*/g, ''), darkText, 9);
          } else {
            const clean = trimmed.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/[^\x00-\x7F]/g, '');
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

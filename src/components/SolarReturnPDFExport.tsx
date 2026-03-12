import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';
import { Download, Loader2 } from 'lucide-react';
import { vertexInSign, vertexInHouse } from '@/lib/solarReturnVertex';
import { srJupiterInHouseDeep, srMercuryInHouseDeep, srVenusInHouseDeep, srMarsInHouseDeep, srSaturnInHouseDeep, srUranusInHouseDeep, srNeptuneInHouseDeep, srPlutoInHouseDeep } from '@/lib/solarReturnPlanetInHouseDeep';
import { generateSRtoNatalInterpretation, planetLifeMeanings } from '@/lib/solarReturnAspectInterp';
import { useState } from 'react';

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

// Planets considered "major" for SR-to-Natal aspects
const MAJOR_BODIES = new Set(['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','NorthNode','SouthNode','Ascendant']);

// Correct planetary order
const PLANET_ORDER = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','NorthNode'];
const SPOTLIGHT_ORDER = ['Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];

// Moon sign change felt-sense interpretations
const moonSignChangeFelt: Record<string, string> = {
  'Aries': 'Your emotional responses are fast, direct, and instinctive. You react before thinking and need physical outlets for feelings. Impatience and courage define your inner landscape.',
  'Taurus': 'Your emotions move slowly and seek stability. You need physical comfort, routine, and sensory pleasure to feel safe. Change feels threatening; beauty feels essential.',
  'Gemini': 'Your emotions process through words and ideas. You need to talk about feelings to understand them. Mental stimulation keeps you emotionally balanced; boredom makes you anxious.',
  'Cancer': 'Your emotions run deep and protective. You absorb others\' moods like a sponge. Home, family, and belonging are emotional necessities. Vulnerability is your strength and your tender spot.',
  'Leo': 'Your emotions are warm, dramatic, and expressive. You need recognition and creative outlets to feel alive. Generosity flows naturally but wounded pride cuts deep.',
  'Virgo': 'Your emotions express through service and practical care. You process feelings by analyzing and fixing things. Anxiety lives in the details; calm comes from useful work.',
  'Libra': 'Your emotions seek harmony and partnership. You process feelings through relationships and struggle with conflict. Beauty and balance are emotional needs, not luxuries.',
  'Scorpio': 'Your emotions are intense, private, and transformative. You feel everything at maximum depth. Trust is earned slowly, but once given, your loyalty is fierce and permanent.',
  'Sagittarius': 'Your emotions are buoyant, philosophical, and freedom-seeking. You process feelings through adventure, humor, and big-picture meaning. Confinement of any kind feels suffocating.',
  'Capricorn': 'Your emotions are controlled, serious, and goal-oriented. You process feelings through achievement and responsibility. Emotional vulnerability feels risky; earned accomplishment feels safe.',
  'Aquarius': 'Your emotions are detached, intellectual, and humanitarian. You process feelings through ideas and community rather than personal intimacy. Freedom and authenticity are emotional requirements.',
  'Pisces': 'Your emotions are boundless, intuitive, and deeply empathic. You absorb the collective mood and need solitude to decompress. Creativity and spirituality are emotional lifelines.',
};

// Stellium felt-sense additions
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

interface Props {
  analysis: SolarReturnAnalysis;
  srChart: SolarReturnChart;
  natalChart: NatalChart;
  narrative: string;
}

export const SolarReturnPDFExport = ({ analysis, srChart, natalChart, narrative }: Props) => {
  const [generating, setGenerating] = useState(false);

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

      const checkPage = (needed: number) => {
        if (y + needed > ph - 50) {
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

      const sectionTitle = (title: string) => {
        checkPage(36);
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

      // Draw a beautiful card with gold left accent
      const drawCard = (renderContent: () => void) => {
        const cardStartY = y;
        y += 12;
        renderContent();
        y += 10;
        const cardH = y - cardStartY;
        doc.setDrawColor(...warmBorder);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, cardStartY, contentW, cardH, 4, 4, 'S');
        doc.setDrawColor(...gold);
        doc.setLineWidth(2.5);
        doc.line(margin + 1, cardStartY + 2, margin + 1, cardStartY + cardH - 2);
        y += 6;
      };

      // --- PAGE 1: TITLE ---
      const a = analysis;
      const name = natalChart.name || 'Chart';
      const year = srChart.solarReturnYear;

      y = 60;
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

      // --- MOON SIGN CHANGE TABLE ---
      const natalMoonSign = natalChart.planets.Moon?.sign;
      const srMoonSign = a.moonSign;
      if (natalMoonSign && srMoonSign) {
        sectionTitle('Moon Sign Shift -- Your Emotional Year');

        checkPage(140);
        // Two-column layout
        const halfW = (contentW - 16) / 2;

        // Natal Moon box
        const moonBoxY = y;
        drawContentBox(margin, moonBoxY, halfW, 80, softGold);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...deepBrown);
        doc.text('NATAL MOON', margin + 10, moonBoxY + 14);
        doc.setFontSize(13);
        doc.setTextColor(...gold);
        doc.text(natalMoonSign.toUpperCase(), margin + 10, moonBoxY + 32);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...bodyText);
        const natalMoonLines = doc.splitTextToSize(moonSignChangeFelt[natalMoonSign] || '', halfW - 20);
        natalMoonLines.slice(0, 4).forEach((line: string, i: number) => {
          doc.text(line, margin + 10, moonBoxY + 44 + i * 10);
        });

        // SR Moon box
        const srBoxX = margin + halfW + 16;
        drawContentBox(srBoxX, moonBoxY, halfW, 80, softBlue);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...deepBrown);
        doc.text('SR MOON (THIS YEAR)', srBoxX + 10, moonBoxY + 14);
        doc.setFontSize(13);
        doc.setTextColor(...gold);
        doc.text(srMoonSign.toUpperCase(), srBoxX + 10, moonBoxY + 32);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...bodyText);
        const srMoonLines = doc.splitTextToSize(moonSignChangeFelt[srMoonSign] || '', halfW - 20);
        srMoonLines.slice(0, 4).forEach((line: string, i: number) => {
          doc.text(line, srBoxX + 10, moonBoxY + 44 + i * 10);
        });

        y = moonBoxY + 88;

        // Arrow between them
        if (natalMoonSign !== srMoonSign) {
          writeBold(`The Shift: ${natalMoonSign} --> ${srMoonSign}`, deepBrown, 9);
          writeBody(`Your emotional baseline shifts this year. Where you normally process feelings through ${natalMoonSign} instincts, this year asks you to develop ${srMoonSign} emotional responses. This doesn't replace your natal Moon -- it layers a new emotional frequency on top. Pay attention to situations where your usual emotional reactions don't quite fit; that's the SR Moon asking you to try a different approach.`, bodyText, 8);
        } else {
          writeBold(`Moon Stays in ${natalMoonSign} -- Emotional Continuity`, deepBrown, 9);
          writeBody(`Your SR Moon matches your natal Moon sign. This year your emotional instincts are reinforced rather than challenged. You feel at home in your own skin emotionally. Trust your gut more than usual -- it's running on native software.`, bodyText, 8);
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

        const sortedOverlays = [...a.houseOverlays].sort((a, b) => {
          const ai = PLANET_ORDER.indexOf(a.planet);
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
          // Ensure enough space for the full card (title + planets + interp + felt sense)
          checkPage(160);
          
          drawCard(() => {
            writeBold(`${s.planets.length}-Planet Stellium in ${s.location}`, deepBrown, 10);
            y += 2;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(...gold);
            doc.text(planets, margin + 14, y);
            y += 14;
            
            writeBody(s.interpretation, bodyText, 8);
            y += 4;

            // Sign meaning
            if (s.signMeaning) {
              writeBold(`What ${s.location} Dominance Means`, gold, 8);
              writeBody(s.signMeaning, bodyText, 8);
              y += 4;
            }

            // FELT SENSE -- how the native physically feels this
            const felt = stelliumFeltSense[s.location];
            if (felt) {
              writeBold('How You Will Feel This', accentGreen, 8);
              writeBody(felt, bodyText, 8);
              y += 4;
            }

            // Blend meaning
            if (s.blendMeaning) {
              writeBold('This Specific Combination', gold, 8);
              const paras = s.blendMeaning.split('\n\n');
              for (const para of paras) {
                writeBody(para, bodyText, 8);
                y += 2;
              }
            }
          });
        }
      }

      // --- ELEMENT & MODALITY BALANCE (beautiful visual) ---
      if (a.elementBalance) {
        sectionTitle('Element & Modality Balance');
        const eb = a.elementBalance;
        const mb = a.modalityBalance;

        checkPage(180);

        // Element balance -- 4 boxes in a row
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
          
          // Box with border highlight for dominant
          doc.setFillColor(...el.bg);
          doc.setDrawColor(...(isDominant ? gold : warmBorder));
          doc.setLineWidth(isDominant ? 1.5 : 0.5);
          doc.roundedRect(x, elemStartY, elemW, elemH, 3, 3, 'FD');

          // Count (large)
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(18);
          doc.setTextColor(...(isDominant ? gold : darkText));
          doc.text(String(el.val), x + elemW / 2, elemStartY + 24, { align: 'center' });

          // Element name
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(...bodyText);
          doc.text(el.name, x + elemW / 2, elemStartY + 36, { align: 'center' });

          // Planet symbols
          if (el.planets.length > 0) {
            doc.setFontSize(7);
            doc.setTextColor(...dimText);
            const symbolStr = el.planets.map(p => P[p] || p).join(', ');
            const symLines = doc.splitTextToSize(symbolStr, elemW - 8);
            symLines.slice(0, 2).forEach((line: string, li: number) => {
              doc.text(line, x + elemW / 2, elemStartY + 48 + li * 9, { align: 'center' });
            });
          }
        });
        y = elemStartY + elemH + 8;

        // Interpretation
        writeBody(eb.interpretation, bodyText, 8);
        y += 8;

        // Modality balance -- 3 boxes in a row
        const modW = (contentW - 16) / 3;
        const modH = 55;
        const modalities = [
          { name: 'Cardinal', val: mb.cardinal, planets: mb.cardinalPlanets },
          { name: 'Fixed', val: mb.fixed, planets: mb.fixedPlanets },
          { name: 'Mutable', val: mb.mutable, planets: mb.mutablePlanets },
        ];

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
            doc.text(mod.planets.map(p => P[p] || p).join(', '), x + modW / 2, modStartY + 46, { align: 'center' });
          }
        });
        y = modStartY + modH + 8;

        writeBody(mb.interpretation, bodyText, 8);
        y += 6;
      }

      // --- HEMISPHERIC EMPHASIS (beautiful 4-quadrant visual) ---
      if (a.hemisphericEmphasis) {
        sectionTitle('Hemispheric Emphasis -- Where Your Energy Lives');
        const hem = a.hemisphericEmphasis;
        const total = hem.totalCounted;

        checkPage(200);

        // Build planet lists per quadrant from planetSRHouses
        const quadPlanets: Record<string, string[]> = { upper: [], lower: [], east: [], west: [] };
        for (const p of PLANET_ORDER) {
          const h = a.planetSRHouses?.[p];
          if (h == null) continue;
          if (h >= 7 && h <= 12) quadPlanets.upper.push(P[p] || p);
          else quadPlanets.lower.push(P[p] || p);
          if (h >= 10 || h <= 3) quadPlanets.east.push(P[p] || p);
          else quadPlanets.west.push(P[p] || p);
        }

        // 2x2 grid layout
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

          // Count badge
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(22);
          doc.setTextColor(...(isDom ? gold : darkText));
          doc.text(String(g.count), x + 16, by + 28);

          // Label
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(...deepBrown);
          doc.text(g.label, x + 46, by + 18);

          // Sub
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(...dimText);
          doc.text(g.sub, x + 46, by + 30);

          // Pct bar
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

          // Planet list
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

        // Labels
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...deepBrown);
        doc.text(`Vertical: ${hem.verticalLabel}`, margin + 8, y);
        doc.text(`Horizontal: ${hem.horizontalLabel}`, margin + contentW / 2, y);
        y += 14;

        // Interpretation cards
        checkPage(120);
        drawCard(() => {
          writeBold(hem.verticalDetail.title, gold, 9);
          writeBody(hem.verticalDetail.summary, bodyText, 8);
          y += 4;
          if (hem.verticalDetail.practicalAdvice.length > 0) {
            writeBold('Practical Advice:', deepBrown, 8);
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
            writeBold('Practical Advice:', deepBrown, 8);
            for (const tip of hem.horizontalDetail.practicalAdvice.slice(0, 3)) {
              writeBody(`  --> ${tip}`, bodyText, 7.5, 11);
            }
          }
        });

        // Combined insight
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
        writeBody('Planets on the angles (1st, 4th, 7th, 10th house cusps) are the most powerful forces in any Solar Return. They act with maximum volume -- they cannot be ignored.', dimText, 8);
        y += 6;
        const angularList = a.angularPlanets.map(p => P[p] || p).join(', ');
        checkPage(50);
        drawCard(() => {
          writeBold(`Angular: ${angularList}`, gold, 10);
          writeBody(`${a.angularPlanets.length} planet${a.angularPlanets.length > 1 ? 's sit' : ' sits'} on the angles of this Solar Return, making ${a.angularPlanets.length > 1 ? 'them' : 'it'} the loudest voice in your year. Whatever these planets represent will demand attention and produce visible results.`, bodyText, 8);
        });
      }

      // --- LORD OF THE YEAR ---
      if (a.lordOfTheYear) {
        sectionTitle('Lord of the Year (Profection)');
        const lord = a.lordOfTheYear;
        checkPage(90);
        drawCard(() => {
          writeBold(`${P[lord.planet] || lord.planet} -- Time Lord for This Year`, gold, 10);
          y += 2;
          writeLabel('Position:', `${lord.srSign} (SR House ${lord.srHouse || '--'})`);
          writeLabel('Dignity:', lord.dignity);
          if (lord.isRetrograde) writeLabel('Status:', 'Retrograde -- revisiting old themes');
          y += 4;
          writeBody(lord.interpretation, bodyText, 8);
        });
      }

      // --- SR ASCENDANT IN NATAL HOUSE ---
      if (a.srAscInNatalHouse) {
        sectionTitle('SR Ascendant in Your Natal Chart');
        const ascNat = a.srAscInNatalHouse;
        checkPage(70);
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
        writeBody('When the same theme appears through multiple independent techniques, it is no longer a suggestion -- it is the year\'s central message. These are the threads that weave through every layer of your Solar Return.', dimText, 8);
        y += 6;
        for (const theme of a.repeatedThemes) {
          checkPage(60);
          drawCard(() => {
            writeBold(theme.description, gold, 9);
            writeBody(theme.significance, bodyText, 8);
          });
        }
      }

      // --- SR-TO-NATAL ASPECTS (with felt interpretations) ---
      if (a.srToNatalAspects.length > 0) {
        const allAspects = a.srToNatalAspects.filter(
          asp => !(asp.planet1 === 'Sun' && asp.planet2 === 'Sun' && asp.type === 'Conjunction')
        );

        const majorAspects = allAspects.filter(asp => MAJOR_BODIES.has(asp.planet1) && MAJOR_BODIES.has(asp.planet2));
        const minorAspects = allAspects.filter(asp => !MAJOR_BODIES.has(asp.planet1) || !MAJOR_BODIES.has(asp.planet2));

        // Ensure title + header + first few rows stay together
        sectionTitle('Key SR-to-Natal Aspects');
        
        // Two-column layout: left = aspect, right = what it feels like
        for (let i = 0; i < Math.min(majorAspects.length, 15); i++) {
          const asp = majorAspects[i];
          const interp = generateSRtoNatalInterpretation(asp.planet1, asp.planet2, asp.type, asp.orb);
          
          // Each aspect as a mini card
          checkPage(70);
          const cardY = y;
          y += 8;
          
          // Left: aspect name
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(...darkText);
          doc.text(`SR ${P[asp.planet1] || asp.planet1}  ${asp.type}  Natal ${P[asp.planet2] || asp.planet2}`, margin + 12, y);
          
          // Orb badge
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(...dimText);
          doc.text(`(${asp.orb}' orb)`, margin + 12 + doc.getTextWidth(`SR ${P[asp.planet1] || asp.planet1}  ${asp.type}  Natal ${P[asp.planet2] || asp.planet2}`) + 6, y);
          y += 13;

          // Right-side: how it feels
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(7.5);
          doc.setTextColor(...gold);
          doc.text('How it feels:', margin + 12, y);
          y += 10;
          writeBody(interp.howItFeels, bodyText, 7.5, 11);
          y += 4;

          // Draw card border
          const cardH = y - cardY;
          doc.setDrawColor(...warmBorder);
          doc.setLineWidth(0.3);
          doc.roundedRect(margin + 2, cardY, contentW - 4, cardH, 3, 3, 'S');

          // Gold left accent
          const isHard = ['Square', 'Opposition', 'Quincunx'].includes(asp.type);
          doc.setDrawColor(...(isHard ? [180, 100, 60] as [number, number, number] : gold));
          doc.setLineWidth(2);
          doc.line(margin + 3, cardY + 2, margin + 3, cardY + cardH - 2);

          y += 4;
        }

        // Minor body aspects
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
        writeBody('When a Solar Return planet lands on the same degree as a natal planet, it creates a powerful direct link -- activating that natal planet\'s themes throughout the year.', dimText, 8);
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
        writeBody('The SR Moon advances approximately 1 degree per month from your birthday. When it perfects an aspect to another planet, that month becomes a turning point.', dimText, 8);
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

      // --- SATURN & NORTH NODE ---
      if (a.saturnFocus || a.nodesFocus) {
        sectionTitle('Saturn & North Node -- Year\'s Structural Themes');
        
        writeBody('Saturn and the North Node are singled out because they define the year\'s deepest structural lessons. Saturn shows where maturity, discipline, and hard-won growth are required -- the area of life where you cannot cut corners. The North Node reveals your evolutionary direction -- the growth edge calling you forward, often uncomfortable but always meaningful.', bodyText, 8);
        y += 8;

        if (a.saturnFocus) {
          checkPage(80);
          drawCard(() => {
            writeBold('Saturn\'s Assignment', gold, 9);
            writeBold(`${a.saturnFocus!.sign} -- SR House ${a.saturnFocus!.house || '--'}, Natal House ${a.saturnFocus!.natalHouse || '--'}${a.saturnFocus!.isRetrograde ? ' (Rx)' : ''}`, deepBrown, 9);
            y += 2;
            writeBody(a.saturnFocus!.interpretation, bodyText, 8);
          });
        }
        if (a.nodesFocus) {
          checkPage(80);
          drawCard(() => {
            writeBold('Growth Edge (North Node)', gold, 9);
            writeBold(`${a.nodesFocus!.sign} -- SR House ${a.nodesFocus!.house || '--'}`, deepBrown, 9);
            y += 2;
            writeBody(a.nodesFocus!.interpretation, bodyText, 8);
          });
        }
      }

      // --- RETROGRADES ---
      if (a.retrogrades && a.retrogrades.count > 0) {
        sectionTitle('Retrograde Planets');
        const retList = a.retrogrades.planets.map(pp => P[pp] || pp).join(', ');
        writeBold(`${a.retrogrades.count} Retrograde: ${retList}`, darkText, 9);
        writeBody(a.retrogrades.interpretation, bodyText, 8);
        y += 6;
      }

      // --- VERTEX ---
      if (a.vertex) {
        sectionTitle('Vertex -- Fated Encounters');
        checkPage(80);
        drawCard(() => {
          writeBold(`Vertex: ${a.vertex!.sign} ${a.vertex!.degree}' ${a.vertex!.minutes}' ${a.vertex!.house ? `(SR House ${a.vertex!.house})` : ''}`, deepBrown, 9);
          const vSign = vertexInSign[a.vertex!.sign];
          if (vSign) {
            writeBody(vSign.fatedTheme, bodyText, 8);
            y += 4;
            writeBold('Who May Appear:', gold, 8);
            writeBody(vSign.encounters, bodyText, 8);
            y += 4;
            writeBold('The Lesson:', gold, 8);
            writeBody(vSign.lesson, bodyText, 8);
            y += 4;
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
          checkPage(100);

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
            writeBold('Practical:', gold, 8);
            writeBody(data.practical, bodyText, 8);
            y += 4;
            writeBold('Caution:', gold, 8);
            writeBody(data.caution, bodyText, 8);
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
            writeBody(`Moon ${asp.type} ${P[other] || other} (${asp.orb}') -- ${isHard ? 'Hard' : 'Soft'}`, bodyText, 8);
          }
          y += 4;
        }
        if (moonNatalAspects.length > 0) {
          writeBold('SR Moon Aspects to Natal Planets:', gold, 8);
          for (const asp of moonNatalAspects.slice(0, 8)) {
            const isHard = ['Square', 'Opposition', 'Quincunx'].includes(asp.type);
            writeBody(`SR Moon ${asp.type} Natal ${P[asp.planet2] || asp.planet2} (${asp.orb}') -- ${isHard ? 'Hard' : 'Soft'}`, bodyText, 8);
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
            y += 8;
            doc.setDrawColor(...softGold);
            doc.setLineWidth(0.5);
            drawHorizontalRule(softGold);
            y += 10;
            writeBold(trimmed.replace('## ', '').toUpperCase(), gold, 9);
            y += 4;
          } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
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

      // --- FOOTER ---
      y += 20;
      checkPage(30);
      drawGoldRule();
      y += 14;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...dimText);
      doc.text(
        `Generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
        pw / 2, y, { align: 'center' }
      );

      // Page numbers
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.5);
        doc.line(margin, ph - 32, pw - margin, ph - 32);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...dimText);
        doc.text(`-- ${i} of ${totalPages} --`, pw / 2, ph - 20, { align: 'center' });
      }

      doc.save(`Solar-Return-${year}-${name.replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={generating}
      className="text-[11px] uppercase tracking-widest px-3 py-1.5 border border-border rounded-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 disabled:opacity-50"
    >
      {generating ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
      {generating ? 'Generating PDF...' : 'Download PDF Report'}
    </button>
  );
};

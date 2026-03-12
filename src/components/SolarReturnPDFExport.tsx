import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';
import { Download, Loader2 } from 'lucide-react';
import { vertexInSign, vertexInHouse } from '@/lib/solarReturnVertex';
import { srJupiterInHouseDeep, srMercuryInHouseDeep, srVenusInHouseDeep, srMarsInHouseDeep, srSaturnInHouseDeep, srUranusInHouseDeep, srNeptuneInHouseDeep, srPlutoInHouseDeep } from '@/lib/solarReturnPlanetInHouseDeep';
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
  // Handle YYYY-MM-DD format
  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[1]}-${parts[2]}-${parts[0]}`;
  }
  // Try parsing as a date
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

      // ── Color palette ──────────────────────────────────────────
      const gold: [number, number, number] = [162, 128, 72];
      const darkText: [number, number, number] = [30, 28, 26];
      const bodyText: [number, number, number] = [60, 55, 50];
      const dimText: [number, number, number] = [120, 112, 105];
      const warmBorder: [number, number, number] = [210, 200, 185];
      const creamBg: [number, number, number] = [250, 247, 242];
      const softGold: [number, number, number] = [245, 238, 225];
      const deepBrown: [number, number, number] = [90, 70, 45];

      const checkPage = (needed: number) => {
        if (y + needed > ph - 50) {
          doc.addPage();
          y = margin;
        }
      };

      // ── Drawing helpers ──────────────────────────────────────
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

      // ─── PAGE 1: TITLE ───────────────────────────────────────
      const a = analysis;
      const name = natalChart.name || 'Chart';
      const year = srChart.solarReturnYear;

      // Decorative top line
      y = 60;
      doc.setDrawColor(...gold);
      doc.setLineWidth(2);
      doc.line(margin, y, pw - margin, y);
      y += 1;
      doc.setLineWidth(0.5);
      doc.line(margin, y + 2, pw - margin, y + 2);

      // Title
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
      // Small diamond ornament
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

      // Bottom decorative line
      y += 12;
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.5);
      doc.line(pw / 2 - ornW, y, pw / 2 + ornW, y);

      y += 30;

      // ─── YEAR AT A GLANCE ───────────────────────────────────
      sectionTitle('Year at a Glance');

      // Measure content first, then draw box behind it
      const glanceItems: Array<() => void> = [];
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
        writeBody(`${P[a.srAscRulerInNatal.rulerPlanet] || a.srAscRulerInNatal.rulerPlanet} in ${a.srAscRulerInNatal.rulerNatalSign || '--'} — Natal House ${a.srAscRulerInNatal.rulerNatalHouse || '--'}`, darkText, 9);
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

      // Draw box BEHIND content — using pages trick: save content, draw box on earlier layer
      // jsPDF doesn't support z-ordering, so we use a clean approach: colored box first is impossible since we need to measure.
      // Instead, we'll use a left accent bar approach
      const glanceEndY = y;
      doc.setDrawColor(...gold);
      doc.setLineWidth(2.5);
      doc.line(margin, glanceStartY, margin, glanceEndY);

      // ─── SR vs NATAL COMPARISON TABLE ────────────────────────
      sectionTitle('Solar Return vs Natal — Side by Side');

      // Table header
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

      // Arrow character for shift column
      const arrow = ' → ';

      for (const p of PLANET_ORDER) {
        const srPos = srChart.planets[p as keyof typeof srChart.planets];
        const natPos = natalChart.planets[p as keyof typeof natalChart.planets];
        if (!srPos && !natPos) continue;
        const srH = a.planetSRHouses?.[p];
        const overlay = a.houseOverlays.find(o => o.planet === p);
        const natH = overlay?.natalHouse;
        const shift = srPos?.sign && natPos?.sign
          ? (srPos.sign === natPos.sign ? 'Same' : `${S[natPos.sign] || natPos.sign}${arrow}${S[srPos.sign] || srPos.sign}`)
          : '';

        checkPage(13);
        // Alternate row shading
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
        doc.text(srPos ? `${srPos.sign} ${srPos.degree}° ${srPos.minutes || 0}'` : '--', cols[1], y);
        doc.text(srH != null ? `H${srH}` : '--', cols[2], y);
        doc.text(natPos ? `${natPos.sign} ${natPos.degree}° ${natPos.minutes || 0}'` : '--', cols[3], y);
        doc.text(natH != null ? `H${natH}` : '--', cols[4], y);
        doc.setTextColor(...dimText);
        doc.text(shift, cols[5], y);
        y += 12;
      }
      y += 6;

      // ─── HOUSE OVERLAYS TABLE ────────────────────────────────
      if (a.houseOverlays.length > 0) {
        sectionTitle('House Overlays — SR Planets in Natal Houses');
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

        // Sort overlays by planetary order
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

      // ─── STELLIUMS ───────────────────────────────────────────
      if (a.stelliums.length > 0) {
        sectionTitle('Stelliums');
        for (const s of a.stelliums) {
          const planets = s.planets.map(pp => P[pp] || pp).join(', ');
          checkPage(40);
          const boxStartY = y;
          y += 10;
          writeBold(`${s.planets.length}-Planet Stellium in ${s.location}`, deepBrown, 9);
          writeBody(planets, gold, 8);
          y += 2;
          writeBody(s.interpretation, bodyText, 8);
          y += 10;
          // Left accent bar
          doc.setDrawColor(...gold);
          doc.setLineWidth(2);
          doc.line(margin, boxStartY, margin, y);
        }
      }

      // ─── SR-TO-NATAL ASPECTS ─────────────────────────────────
      if (a.srToNatalAspects.length > 0) {
        // Filter out Sun conjunct Sun
        const allAspects = a.srToNatalAspects.filter(
          asp => !(asp.planet1 === 'Sun' && asp.planet2 === 'Sun' && asp.type === 'Conjunction')
        );

        // Split into major vs minor bodies
        const majorAspects = allAspects.filter(asp => MAJOR_BODIES.has(asp.planet1) && MAJOR_BODIES.has(asp.planet2));
        const minorAspects = allAspects.filter(asp => !MAJOR_BODIES.has(asp.planet1) || !MAJOR_BODIES.has(asp.planet2));

        sectionTitle('Key SR-to-Natal Aspects');
        
        const ac = [margin + 4, margin + 110, margin + 200, margin + 330];
        checkPage(16);
        doc.setFillColor(...softGold);
        doc.rect(margin, y - 10, contentW, 14, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...deepBrown);
        ['SR PLANET', 'ASPECT', 'NATAL PLANET', 'ORB'].forEach((h, i) => doc.text(h, ac[i], y));
        y += 8;
        drawHorizontalRule(warmBorder, 0.5);
        y += 10;

        for (let i = 0; i < Math.min(majorAspects.length, 15); i++) {
          const asp = majorAspects[i];
          checkPage(13);
          if (i % 2 === 0) {
            doc.setFillColor(252, 250, 247);
            doc.rect(margin, y - 9, contentW, 12, 'F');
          }
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(...darkText);
          doc.text(`SR ${P[asp.planet1] || asp.planet1}`, ac[0], y);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...gold);
          doc.text(asp.type, ac[1], y);
          doc.setTextColor(...darkText);
          doc.text(`Natal ${P[asp.planet2] || asp.planet2}`, ac[2], y);
          doc.setTextColor(...dimText);
          doc.text(`${asp.orb}°`, ac[3], y);
          y += 12;
        }

        // Minor body aspects (Ceres, Vesta, Pallas, Juno, Lilith)
        if (minorAspects.length > 0) {
          y += 8;
          writeBold('Asteroid & Minor Body Aspects', dimText, 8);
          y += 4;
          for (const asp of minorAspects.slice(0, 8)) {
            checkPage(12);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(...bodyText);
            doc.text(`SR ${P[asp.planet1] || asp.planet1} ${asp.type} Natal ${P[asp.planet2] || asp.planet2} (${asp.orb}°)`, margin + 12, y);
            y += 11;
          }
        }
        y += 6;
      }

      // ─── NATAL DEGREE CONNECTIONS ────────────────────────────
      if (a.natalDegreeConduits.length > 0) {
        sectionTitle('Natal Degree Connections');
        writeBody('When a Solar Return planet lands on the same degree as a natal planet, it creates a powerful direct link — activating that natal planet\'s themes throughout the year.', dimText, 8);
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
          doc.text('  →  ', margin + 8 + srW, y);
          const arrowW = doc.getTextWidth('  →  ');
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...bodyText);
          doc.text(`Natal ${P[cd.natalPlanet] || cd.natalPlanet} (${cd.orb.toFixed(1)}°)`, margin + 8 + srW + arrowW, y);
          y += 13;
        }
        y += 6;
      }

      // ─── MOON TIMING ────────────────────────────────────────
      if (a.moonTimingEvents.length > 0) {
        sectionTitle('Moon Timing — When Things Happen');
        writeBody('The SR Moon advances approximately 1° per month from your birthday. When it perfects an aspect to another planet, that month becomes a turning point.', dimText, 8);
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

      // ─── ELEMENT & MODALITY ──────────────────────────────────
      if (a.elementBalance) {
        sectionTitle('Element & Modality Balance');
        const eb = a.elementBalance;
        const mb = a.modalityBalance;

        // Two mini boxes side by side
        const boxW = (contentW - 12) / 2;
        const boxH = 60;
        checkPage(boxH + 10);

        // Element box
        drawContentBox(margin, y, boxW, boxH, softGold);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...deepBrown);
        doc.text('DOMINANT ELEMENT', margin + 10, y + 14);
        doc.setFontSize(12);
        doc.setTextColor(...gold);
        doc.text(eb.dominant.toUpperCase(), margin + 10, y + 30);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...bodyText);
        doc.text(`Fire ${eb.fire}  |  Earth ${eb.earth}  |  Air ${eb.air}  |  Water ${eb.water}`, margin + 10, y + 44);

        // Modality box
        const box2X = margin + boxW + 12;
        drawContentBox(box2X, y, boxW, boxH, softGold);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...deepBrown);
        doc.text('DOMINANT MODALITY', box2X + 10, y + 14);
        doc.setFontSize(12);
        doc.setTextColor(...gold);
        doc.text(mb.dominant.toUpperCase(), box2X + 10, y + 30);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...bodyText);
        doc.text(`Cardinal ${mb.cardinal}  |  Fixed ${mb.fixed}  |  Mutable ${mb.mutable}`, box2X + 10, y + 44);

        y += boxH + 8;
        if (eb.missing.length > 0) {
          writeBody(`Missing elements: ${eb.missing.join(', ')}`, dimText, 7.5);
        }
        writeBody(eb.interpretation, bodyText, 8);
        y += 4;
        writeBody(mb.interpretation, bodyText, 8);
        y += 6;
      }

      // ─── SATURN & NODE — EXPLAINED ───────────────────────────
      if (a.saturnFocus || a.nodesFocus) {
        sectionTitle('Saturn & North Node — Year\'s Structural Themes');
        
        writeBody('Saturn and the North Node are singled out because they define the year\'s deepest structural lessons. Saturn shows where maturity, discipline, and hard-won growth are required — the area of life where you cannot cut corners. The North Node reveals your evolutionary direction — the growth edge calling you forward, often uncomfortable but always meaningful.', bodyText, 8);
        y += 8;

        if (a.saturnFocus) {
          checkPage(50);
          const satStartY = y;
          y += 10;
          writeBold(`Saturn in ${a.saturnFocus.sign} — SR House ${a.saturnFocus.house || '--'}, Natal House ${a.saturnFocus.natalHouse || '--'}${a.saturnFocus.isRetrograde ? ' (Rx)' : ''}`, deepBrown, 9);
          y += 2;
          writeBody(a.saturnFocus.interpretation, bodyText, 8);
          y += 10;
          doc.setDrawColor(...gold);
          doc.setLineWidth(2);
          doc.line(margin, satStartY, margin, y);
        }
        if (a.nodesFocus) {
          checkPage(50);
          const nodeStartY = y;
          y += 10;
          writeBold(`North Node in ${a.nodesFocus.sign} — SR House ${a.nodesFocus.house || '--'}`, deepBrown, 9);
          y += 2;
          writeBody(a.nodesFocus.interpretation, bodyText, 8);
          y += 10;
          doc.setDrawColor(...gold);
          doc.setLineWidth(2);
          doc.line(margin, nodeStartY, margin, y);
        }
      }

      // ─── RETROGRADES ─────────────────────────────────────────
      if (a.retrogrades && a.retrogrades.count > 0) {
        sectionTitle('Retrograde Planets');
        const retList = a.retrogrades.planets.map(pp => P[pp] || pp).join(', ');
        writeBold(`${a.retrogrades.count} Retrograde: ${retList}`, darkText, 9);
        writeBody(a.retrogrades.interpretation, bodyText, 8);
        y += 6;
      }

      // ─── VERTEX ────────────────────────────────────────────
      if (a.vertex) {
        sectionTitle('Vertex — Fated Encounters');
        writeBold(`Vertex: ${a.vertex.sign} ${a.vertex.degree}° ${a.vertex.minutes}' ${a.vertex.house ? `(SR House ${a.vertex.house})` : ''}`, deepBrown, 9);
        const vSign = vertexInSign[a.vertex.sign];
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
        if (a.vertex.house && vertexInHouse[a.vertex.house]) {
          const vH = vertexInHouse[a.vertex.house];
          writeBold(`${vH.title} (House ${a.vertex.house})`, darkText, 8);
          writeBody(vH.description, bodyText, 8);
          writeBody(`Fated Areas: ${vH.fatedArea}`, dimText, 7);
          y += 4;
        }
        if (a.vertex.aspects.length > 0) {
          writeBold('Planets Aspecting Vertex:', gold, 8);
          for (const asp of a.vertex.aspects.slice(0, 6)) {
            writeBody(`${P[asp.planet.replace('Natal ', '')] || asp.planet} ${asp.aspectType} Vertex (${asp.orb}°)`, bodyText, 8);
          }
          y += 4;
        }
      }

      // ─── PLANET SPOTLIGHT ────────────────────────────────────
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
        sectionTitle('Planet Spotlight — Expert Analysis');
        for (const planet of spotlightPlanets) {
          const h = a.planetSRHouses[planet]!;
          const data = deepData[planet][h];
          if (!data) continue;
          checkPage(80);

          // Beautiful card-style box
          const cardStartY = y;
          y += 14;

          // Planet name + house title
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
          y += 10;

          // Draw card border
          const cardH = y - cardStartY;
          doc.setDrawColor(...warmBorder);
          doc.setLineWidth(0.5);
          doc.roundedRect(margin, cardStartY, contentW, cardH, 4, 4, 'S');
          // Gold top accent line
          doc.setDrawColor(...gold);
          doc.setLineWidth(2);
          doc.line(margin + 1, cardStartY, margin + 1, cardStartY + cardH);

          y += 6;
        }
      }

      // ─── SR MOON ASPECTS ─────────────────────────────────────
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
            writeBody(`Moon ${asp.type} ${P[other] || other} (${asp.orb}°) — ${isHard ? 'Hard' : 'Soft'}`, bodyText, 8);
          }
          y += 4;
        }
        if (moonNatalAspects.length > 0) {
          writeBold('SR Moon Aspects to Natal Planets:', gold, 8);
          for (const asp of moonNatalAspects.slice(0, 8)) {
            const isHard = ['Square', 'Opposition', 'Quincunx'].includes(asp.type);
            writeBody(`SR Moon ${asp.type} Natal ${P[asp.planet2] || asp.planet2} (${asp.orb}°) — ${isHard ? 'Hard' : 'Soft'}`, bodyText, 8);
          }
          y += 4;
        }
      }

      // ─── YEAR-AHEAD NARRATIVE ────────────────────────────────
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

      // ─── FOOTER ──────────────────────────────────────────────
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

      // Page numbers with decorative style
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        // Bottom gold line
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.5);
        doc.line(margin, ph - 32, pw - margin, ph - 32);
        // Page number
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...dimText);
        doc.text(`— ${i} of ${totalPages} —`, pw / 2, ph - 20, { align: 'center' });
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

import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';
import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';

// Plain-text abbreviations safe for jsPDF default fonts (no Unicode glyphs)
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

const ordinal = (n: number) => n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`;

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
      const margin = 48;
      const contentW = pw - margin * 2;
      let y = margin;

      // Print-friendly colors: white bg, dark text
      const accentRGB: [number, number, number] = [140, 80, 30];
      const mainRGB: [number, number, number] = [25, 25, 30];
      const mutedRGB: [number, number, number] = [70, 65, 60];
      const dimRGB: [number, number, number] = [120, 115, 110];
      const borderRGB: [number, number, number] = [200, 195, 190];
      const boxBg: [number, number, number] = [245, 243, 240];

      const checkPage = (needed: number) => {
        if (y + needed > ph - 40) {
          doc.addPage();
          y = margin;
        }
      };

      // ── Drawing helpers ──────────────────────────────────────

      const drawBox = (x: number, yStart: number, w: number, h: number) => {
        doc.setFillColor(...boxBg);
        doc.setDrawColor(...borderRGB);
        doc.setLineWidth(0.5);
        doc.roundedRect(x, yStart, w, h, 3, 3, 'FD');
      };

      const sectionTitle = (title: string) => {
        checkPage(30);
        y += 16;
        doc.setDrawColor(...borderRGB);
        doc.setLineWidth(0.75);
        doc.line(margin, y, pw - margin, y);
        y += 14;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...accentRGB);
        doc.text(title.toUpperCase(), margin, y);
        y += 14;
      };

      const bodyText = (text: string, color: [number, number, number] = mutedRGB, size = 9, lineH = 13) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(size);
        doc.setTextColor(...color);
        const lines: string[] = doc.splitTextToSize(text, contentW - 8);
        for (const line of lines) {
          checkPage(lineH);
          doc.text(line, margin + 4, y);
          y += lineH;
        }
      };

      const boldLine = (text: string, color: [number, number, number] = mainRGB, size = 10) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(size);
        doc.setTextColor(...color);
        const lines: string[] = doc.splitTextToSize(text, contentW - 8);
        for (const line of lines) {
          checkPage(14);
          doc.text(line, margin + 4, y);
          y += 14;
        }
      };

      const drawTableRow = (cells: { text: string; x: number; bold?: boolean; color?: [number, number, number] }[]) => {
        checkPage(13);
        for (const cell of cells) {
          doc.setFont('helvetica', cell.bold ? 'bold' : 'normal');
          doc.setFontSize(8);
          doc.setTextColor(...(cell.color || mutedRGB));
          doc.text(cell.text, cell.x, y);
        }
        y += 11;
      };

      const drawTableHeader = (headers: { text: string; x: number }[]) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...dimRGB);
        for (const h of headers) doc.text(h.text.toUpperCase(), h.x, y);
        y += 3;
        doc.setDrawColor(...borderRGB);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pw - margin, y);
        y += 10;
      };

      // ── Helper to render text in a box ───────────────────────
      const renderInBox = (renderFn: () => number) => {
        const startY = y;
        y += 8;
        const contentStartY = y;
        renderFn();
        y += 8;
        const boxH = y - startY;
        // Draw box behind (need to re-render content)
        // Instead, measure first then draw
        drawBox(margin - 4, startY, contentW + 8, boxH);
        // Re-render content on top — simpler approach: just draw box first with estimated height
      };

      // ─── PAGE 1: TITLE ───────────────────────────────────────
      const a = analysis;
      const name = natalChart.name || 'Chart';
      const year = srChart.solarReturnYear;

      y = 100;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.setTextColor(...mainRGB);
      doc.text(`SOLAR RETURN ${year}`, pw / 2, y, { align: 'center' });

      y += 28;
      doc.setFontSize(14);
      doc.setTextColor(...accentRGB);
      doc.text(name.toUpperCase(), pw / 2, y, { align: 'center' });

      y += 18;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...dimRGB);
      const birthLine = `Born: ${natalChart.birthDate || '--'}  |  ${natalChart.birthLocation || '--'}`;
      doc.text(birthLine, pw / 2, y, { align: 'center' });

      if (srChart.solarReturnLocation) {
        y += 14;
        doc.text(`SR Location: ${srChart.solarReturnLocation}`, pw / 2, y, { align: 'center' });
      }

      y += 8;
      doc.setDrawColor(...accentRGB);
      doc.setLineWidth(1.5);
      doc.line(pw / 2 - 80, y, pw / 2 + 80, y);
      y += 24;

      // ─── YEAR AT A GLANCE (boxed) ───────────────────────────
      sectionTitle('Year at a Glance');

      // Draw a summary box
      const glanceStartY = y;
      y += 10;
      if (a.yearlyTheme) {
        boldLine(`SR Ascendant: ${a.yearlyTheme.ascendantSign} Rising`);
        bodyText(`Ruler: ${P[a.yearlyTheme.ascendantRuler] || a.yearlyTheme.ascendantRuler} in ${a.yearlyTheme.ascendantRulerSign}`, mutedRGB, 8);
        y += 4;
      }
      if (a.srAscRulerInNatal) {
        boldLine('Where This Year Plays Out:');
        bodyText(`${P[a.srAscRulerInNatal.rulerPlanet] || a.srAscRulerInNatal.rulerPlanet} in ${a.srAscRulerInNatal.rulerNatalSign || '--'} -- Natal House ${a.srAscRulerInNatal.rulerNatalHouse || '--'}`, mainRGB, 9);
        bodyText(a.srAscRulerInNatal.rulerNatalHouseTheme || '', dimRGB, 8);
        y += 2;
        bodyText(a.srAscRulerInNatal.interpretation, mutedRGB, 8);
        y += 4;
      }
      if (a.profectionYear) {
        boldLine(`Profection: House ${a.profectionYear.houseNumber} (Age ${a.profectionYear.age})`);
        bodyText(`Time Lord: ${P[a.profectionYear.timeLord] || a.profectionYear.timeLord}`, mutedRGB, 8);
        y += 4;
      }
      boldLine(`Moon: ${a.moonSign} in SR House ${a.moonHouse?.house || '--'}  |  ${a.moonPhase?.phase || ''}`);
      y += 10;
      // Draw box behind
      drawBox(margin - 6, glanceStartY, contentW + 12, y - glanceStartY);

      // Re-render content on top of the box (jsPDF draws in order, so we need to render content AFTER box)
      // The issue: we drew text first, then box covers it. Let's restructure to measure first.
      // SIMPLER APPROACH: Don't use background boxes for narrative sections, use bordered boxes only for tables.

      // ─── SR vs NATAL COMPARISON TABLE ────────────────────────
      sectionTitle('Solar Return vs Natal -- Side by Side');
      const planetKeys = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','NorthNode'];

      const c = [margin, margin + 65, margin + 175, margin + 215, margin + 325, margin + 365];
      drawTableHeader([
        { text: 'Planet', x: c[0] }, { text: 'SR Position', x: c[1] },
        { text: 'SR H', x: c[2] }, { text: 'Natal Position', x: c[3] },
        { text: 'Nat H', x: c[4] }, { text: 'Shift', x: c[5] },
      ]);

      for (const p of planetKeys) {
        const srPos = srChart.planets[p as keyof typeof srChart.planets];
        const natPos = natalChart.planets[p as keyof typeof natalChart.planets];
        if (!srPos && !natPos) continue;
        const srH = a.planetSRHouses?.[p];
        const overlay = a.houseOverlays.find(o => o.planet === p);
        const natH = overlay?.natalHouse;
        const shift = srPos?.sign && natPos?.sign
          ? (srPos.sign === natPos.sign ? 'Same' : `${S[natPos.sign] || natPos.sign} > ${S[srPos.sign] || srPos.sign}`)
          : '';

        drawTableRow([
          { text: P[p] || p, x: c[0], bold: true, color: mainRGB },
          { text: srPos ? `${srPos.sign} ${srPos.degree}deg ${srPos.minutes || 0}'` : '--', x: c[1] },
          { text: srH != null ? `H${srH}` : '--', x: c[2] },
          { text: natPos ? `${natPos.sign} ${natPos.degree}deg ${natPos.minutes || 0}'` : '--', x: c[3] },
          { text: natH != null ? `H${natH}` : '--', x: c[4] },
          { text: shift, x: c[5], color: dimRGB },
        ]);
      }
      y += 6;

      // ─── HOUSE OVERLAYS TABLE ────────────────────────────────
      if (a.houseOverlays.length > 0) {
        sectionTitle('House Overlays -- SR Planets in Natal Houses');
        const oc = [margin, margin + 75, margin + 185, margin + 260, margin + 340];
        drawTableHeader([
          { text: 'Planet', x: oc[0] }, { text: 'Position', x: oc[1] },
          { text: 'SR House', x: oc[2] }, { text: 'Natal House', x: oc[3] },
          { text: 'Theme', x: oc[4] },
        ]);
        for (const o of a.houseOverlays) {
          const themeShort = (o.houseTheme || '').substring(0, 35);
          drawTableRow([
            { text: P[o.planet] || o.planet, x: oc[0], bold: true, color: mainRGB },
            { text: `${o.srSign} ${o.srDegree}`, x: oc[1] },
            { text: o.srHouse ? `H${o.srHouse}` : '--', x: oc[2] },
            { text: o.natalHouse ? `H${o.natalHouse}` : '--', x: oc[3] },
            { text: themeShort, x: oc[4], color: dimRGB },
          ]);
        }
        y += 6;
      }

      // ─── STELLIUMS ───────────────────────────────────────────
      if (a.stelliums.length > 0) {
        sectionTitle('Stelliums');
        for (const s of a.stelliums) {
          const planets = s.planets.map(pp => P[pp] || pp).join(', ');
          boldLine(`${s.planets.length}-Planet Stellium in ${s.location}: ${planets}`);
          bodyText(s.interpretation, mutedRGB, 8);
          y += 6;
        }
      }

      // ─── SR-TO-NATAL ASPECTS ─────────────────────────────────
      if (a.srToNatalAspects.length > 0) {
        sectionTitle('Key SR-to-Natal Aspects');
        const ac2 = [margin, margin + 100, margin + 180, margin + 290];
        drawTableHeader([
          { text: 'SR Planet', x: ac2[0] }, { text: 'Aspect', x: ac2[1] },
          { text: 'Natal Planet', x: ac2[2] }, { text: 'Orb', x: ac2[3] },
        ]);
        for (const asp of a.srToNatalAspects.slice(0, 15)) {
          drawTableRow([
            { text: `SR ${P[asp.planet1] || asp.planet1}`, x: ac2[0], bold: true, color: mainRGB },
            { text: asp.type, x: ac2[1], color: accentRGB },
            { text: `Natal ${P[asp.planet2] || asp.planet2}`, x: ac2[2], color: mainRGB },
            { text: `${asp.orb} deg orb`, x: ac2[3], color: dimRGB },
          ]);
        }
        y += 6;
      }

      // ─── NATAL DEGREE CONDUITS ───────────────────────────────
      if (a.natalDegreeConduits.length > 0) {
        sectionTitle('Natal Degree Connections (Lynn Bell)');
        for (const cd of a.natalDegreeConduits) {
          bodyText(
            `SR ${P[cd.srPlanet] || cd.srPlanet} in ${cd.srSign} ${cd.degree} <> Natal ${P[cd.natalPlanet] || cd.natalPlanet} (${cd.orb.toFixed(1)} deg orb)`,
            mutedRGB, 8
          );
        }
        y += 6;
      }

      // ─── MOON TIMING ────────────────────────────────────────
      if (a.moonTimingEvents.length > 0) {
        sectionTitle('Moon Timing -- When Things Happen');
        bodyText('The SR Moon advances approx. 1 degree per month. When it perfects an aspect, that month is a turning point.', dimRGB, 7);
        y += 4;
        const mc = [margin, margin + 80, margin + 230];
        drawTableHeader([
          { text: 'Month', x: mc[0] }, { text: 'Aspect', x: mc[1] }, { text: 'Meaning', x: mc[2] },
        ]);
        for (const evt of a.moonTimingEvents.slice(0, 12)) {
          checkPage(22);
          // Month
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(...accentRGB);
          doc.text(evt.approximateMonth, mc[0], y);
          // Aspect
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...mainRGB);
          doc.text(`Moon ${evt.aspectType} ${P[evt.targetPlanet] || evt.targetPlanet}`, mc[1], y);
          // Meaning (truncated to fit)
          doc.setTextColor(...dimRGB);
          const meaning = (evt.interpretation || '').substring(0, 55);
          doc.text(meaning, mc[2], y);
          y += 11;
        }
        y += 6;
      }

      // ─── ELEMENT & MODALITY ──────────────────────────────────
      if (a.elementBalance) {
        sectionTitle('Element & Modality Balance');
        const eb = a.elementBalance;
        boldLine(`Dominant Element: ${eb.dominant}  |  Fire ${eb.fire}  Earth ${eb.earth}  Air ${eb.air}  Water ${eb.water}`);
        if (eb.missing.length > 0) bodyText(`Missing elements: ${eb.missing.join(', ')}`, dimRGB, 8);
        bodyText(eb.interpretation, mutedRGB, 8);
        y += 4;
        const mb = a.modalityBalance;
        boldLine(`Dominant Modality: ${mb.dominant}  |  Cardinal ${mb.cardinal}  Fixed ${mb.fixed}  Mutable ${mb.mutable}`);
        bodyText(mb.interpretation, mutedRGB, 8);
        y += 6;
      }

      // ─── SATURN & NODES ──────────────────────────────────────
      if (a.saturnFocus) {
        sectionTitle('Saturn Focus');
        boldLine(`${a.saturnFocus.sign} | SR House ${a.saturnFocus.house || '--'} | Natal House ${a.saturnFocus.natalHouse || '--'}${a.saturnFocus.isRetrograde ? ' (Retrograde)' : ''}`);
        bodyText(a.saturnFocus.interpretation, mutedRGB, 8);
        y += 4;
      }
      if (a.nodesFocus) {
        sectionTitle('North Node Focus');
        boldLine(`${a.nodesFocus.sign} | SR House ${a.nodesFocus.house || '--'}`);
        bodyText(a.nodesFocus.interpretation, mutedRGB, 8);
        y += 4;
      }

      // ─── RETROGRADES ─────────────────────────────────────────
      if (a.retrogrades && a.retrogrades.count > 0) {
        sectionTitle('Retrograde Planets');
        const retList = a.retrogrades.planets.map(pp => P[pp] || pp).join(', ');
        boldLine(`${a.retrogrades.count} Retrograde: ${retList}`);
        bodyText(a.retrogrades.interpretation, mutedRGB, 8);
        y += 4;
      }

      // ─── YEAR-AHEAD NARRATIVE ────────────────────────────────
      if (narrative) {
        sectionTitle('Year-Ahead Reading');
        const lines = narrative.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) { y += 5; continue; }
          if (trimmed.startsWith('## ')) {
            y += 6;
            boldLine(trimmed.replace('## ', '').toUpperCase(), accentRGB, 9);
            y += 2;
          } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
            boldLine(trimmed.replace(/\*\*/g, ''), mainRGB, 9);
          } else {
            // Strip markdown formatting
            const clean = trimmed
              .replace(/\*\*(.*?)\*\*/g, '$1')
              .replace(/\*(.*?)\*/g, '$1')
              .replace(/[^\x00-\x7F]/g, ''); // Strip any remaining non-ASCII
            bodyText(clean, mutedRGB, 8, 12);
          }
        }
      }

      // ─── FOOTER ──────────────────────────────────────────────
      y += 16;
      checkPage(30);
      doc.setDrawColor(...borderRGB);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pw - margin, y);
      y += 12;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...dimRGB);
      doc.text(
        `Generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
        pw / 2, y, { align: 'center' }
      );

      // Page numbers
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...dimRGB);
        doc.text(`Page ${i} of ${totalPages}`, pw / 2, ph - 20, { align: 'center' });
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

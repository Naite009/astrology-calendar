import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';
import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';

const PLANET_SYMBOLS: Record<string, string> = {
  Sun:'\u2609', Moon:'\u263D', Mercury:'\u263F', Venus:'\u2640', Mars:'\u2642',
  Jupiter:'\u2643', Saturn:'\u2644', Uranus:'\u2645', Neptune:'\u2646', Pluto:'\u2647',
  Chiron:'Ch', NorthNode:'NN', SouthNode:'SN', Ascendant:'ASC',
  Juno:'Ju', Ceres:'Ce', Pallas:'Pa', Vesta:'Ve', Lilith:'Li',
};

const SIGN_SYMBOLS: Record<string, string> = {
  Aries:'\u2648', Taurus:'\u2649', Gemini:'\u264A', Cancer:'\u264B', Leo:'\u264C', Virgo:'\u264D',
  Libra:'\u264E', Scorpio:'\u264F', Sagittarius:'\u2650', Capricorn:'\u2651', Aquarius:'\u2652', Pisces:'\u2653',
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
      const margin = 50;
      const contentW = pw - margin * 2;
      let y = margin;

      const accent = [196, 149, 106]; // #c4956a
      const textMain = [232, 224, 212];
      const textMuted = [154, 148, 144];
      const textDim = [106, 101, 96];
      const bg: [number, number, number] = [10, 10, 15];
      const cardBg: [number, number, number] = [18, 18, 26];
      const borderC: [number, number, number] = [42, 42, 53];

      const drawBg = () => {
        doc.setFillColor(...bg);
        doc.rect(0, 0, pw, ph, 'F');
      };

      const checkPage = (needed: number) => {
        if (y + needed > ph - margin) {
          doc.addPage();
          drawBg();
          y = margin;
        }
      };

      const sectionTitle = (title: string) => {
        checkPage(40);
        y += 12;
        doc.setDrawColor(...borderC);
        doc.line(margin, y, pw - margin, y);
        y += 16;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...accent);
        doc.text(title.toUpperCase(), margin, y);
        y += 16;
      };

      const bodyText = (text: string, color = textMuted, size = 9, lineH = 14) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(size);
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(text, contentW);
        for (const line of lines) {
          checkPage(lineH);
          doc.text(line, margin, y);
          y += lineH;
        }
      };

      const boldText = (text: string, color = textMain, size = 10) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(size);
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(text, contentW);
        for (const line of lines) {
          checkPage(14);
          doc.text(line, margin, y);
          y += 14;
        }
      };

      const drawCard = (innerFn: () => void) => {
        const startY = y;
        y += 10;
        innerFn();
        y += 10;
        const endY = y;
        // Draw card background behind content
        doc.setFillColor(...cardBg);
        doc.setDrawColor(...borderC);
        doc.roundedRect(margin - 5, startY, contentW + 10, endY - startY, 3, 3, 'FD');
        // Re-render content on top (since we drew bg after)
        // Actually, let's just use the card as a visual separator
      };

      // ─── Page 1: Title ───────────────────────────────────────
      drawBg();
      const a = analysis;
      const name = natalChart.name || 'Chart';
      const year = srChart.solarReturnYear;

      // Title header
      y = 120;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(28);
      doc.setTextColor(...textMain);
      doc.text(`SOLAR RETURN ${year}`, pw / 2, y, { align: 'center' });
      y += 30;
      doc.setFontSize(14);
      doc.setTextColor(...accent);
      doc.text(name.toUpperCase(), pw / 2, y, { align: 'center' });
      y += 20;
      doc.setFontSize(9);
      doc.setTextColor(...textDim);
      doc.text(`Born ${natalChart.birthDate || '\u2014'} \u2022 ${natalChart.birthLocation || '\u2014'}`, pw / 2, y, { align: 'center' });
      if (srChart.solarReturnLocation) {
        y += 14;
        doc.text(`SR Location: ${srChart.solarReturnLocation}`, pw / 2, y, { align: 'center' });
      }
      y += 10;
      doc.setDrawColor(...accent);
      doc.setLineWidth(1.5);
      doc.line(margin + 60, y, pw - margin - 60, y);
      y += 30;

      // ─── Year at a Glance ────────────────────────────────────
      sectionTitle('Year at a Glance');
      if (a.yearlyTheme) {
        boldText(`SR Ascendant: ${SIGN_SYMBOLS[a.yearlyTheme.ascendantSign] || ''} ${a.yearlyTheme.ascendantSign} Rising`);
        bodyText(`Ruler: ${PLANET_SYMBOLS[a.yearlyTheme.ascendantRuler] || ''} ${a.yearlyTheme.ascendantRuler} in ${a.yearlyTheme.ascendantRulerSign}`);
        y += 4;
      }
      if (a.srAscRulerInNatal) {
        boldText(`Where This Year Plays Out:`);
        bodyText(`${PLANET_SYMBOLS[a.srAscRulerInNatal.rulerPlanet] || ''} ${a.srAscRulerInNatal.rulerPlanet} (natal) in ${SIGN_SYMBOLS[a.srAscRulerInNatal.rulerNatalSign] || ''} ${a.srAscRulerInNatal.rulerNatalSign} \u2014 Natal House ${a.srAscRulerInNatal.rulerNatalHouse || '\u2014'}`);
        bodyText(`${a.srAscRulerInNatal.rulerNatalHouseTheme || ''}`);
        y += 4;
        bodyText(a.srAscRulerInNatal.interpretation, textMuted, 8);
        y += 4;
      }
      if (a.profectionYear) {
        boldText(`Profection: House ${a.profectionYear.houseNumber} (Age ${a.profectionYear.age})`);
        bodyText(`Time Lord: ${PLANET_SYMBOLS[a.profectionYear.timeLord] || ''} ${a.profectionYear.timeLord}`);
        y += 4;
      }
      boldText(`Moon: ${SIGN_SYMBOLS[a.moonSign] || ''} ${a.moonSign} \u2022 SR House ${a.moonHouse?.house || '\u2014'} \u2022 ${a.moonPhase?.phase || ''}`);
      y += 8;

      // ─── SR vs Natal Comparison Table ────────────────────────
      sectionTitle('SR \u2194 Natal Comparison');
      const planetKeys = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','NorthNode'];
      
      // Table header
      const cols = [margin, margin + 70, margin + 180, margin + 240, margin + 350, margin + 410];
      const headers = ['Planet', 'SR Position', 'SR H', 'Natal Position', 'Nat H', 'Move'];
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...textDim);
      headers.forEach((h, i) => doc.text(h.toUpperCase(), cols[i], y));
      y += 4;
      doc.setDrawColor(...borderC);
      doc.line(margin, y, pw - margin, y);
      y += 10;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      for (const p of planetKeys) {
        const srPos = srChart.planets[p as keyof typeof srChart.planets];
        const natPos = natalChart.planets[p as keyof typeof natalChart.planets];
        if (!srPos && !natPos) continue;
        checkPage(14);
        doc.setTextColor(...textMain);
        doc.text(`${PLANET_SYMBOLS[p] || ''} ${p}`, cols[0], y);
        doc.setTextColor(...textMuted);
        if (srPos) doc.text(`${SIGN_SYMBOLS[srPos.sign] || ''} ${srPos.sign} ${srPos.degree}\u00B0`, cols[1], y);
        const srH = a.planetSRHouses?.[p];
        if (srH != null) doc.text(`H${srH}`, cols[2], y);
        if (natPos) doc.text(`${SIGN_SYMBOLS[natPos.sign] || ''} ${natPos.sign} ${natPos.degree}\u00B0`, cols[3], y);
        // Find natal house from overlays
        const overlay = a.houseOverlays.find(o => o.planet === p);
        if (overlay?.natalHouse) doc.text(`H${overlay.natalHouse}`, cols[4], y);
        doc.setTextColor(...textDim);
        if (srPos?.sign && natPos?.sign) {
          doc.text(srPos.sign === natPos.sign ? 'Same' : `${natPos.sign}\u2192${srPos.sign}`, cols[5], y);
        }
        y += 12;
      }
      y += 8;

      // ─── House Overlays ──────────────────────────────────────
      if (a.houseOverlays.length > 0) {
        sectionTitle('House Overlays \u2014 SR Planets in Natal Houses');
        const oCols = [margin, margin + 80, margin + 195, margin + 275, margin + 355];
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...textDim);
        ['Planet', 'Position', 'SR House', 'Natal House', 'Theme'].forEach((h, i) => doc.text(h.toUpperCase(), oCols[i], y));
        y += 4;
        doc.line(margin, y, pw - margin, y);
        y += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        for (const o of a.houseOverlays) {
          checkPage(14);
          doc.setTextColor(...textMain);
          doc.text(`${PLANET_SYMBOLS[o.planet] || ''} ${o.planet}`, oCols[0], y);
          doc.setTextColor(...textMuted);
          doc.text(`${SIGN_SYMBOLS[o.srSign] || ''} ${o.srSign} ${o.srDegree}`, oCols[1], y);
          doc.text(`H${o.srHouse || '\u2014'}`, oCols[2], y);
          doc.text(`H${o.natalHouse || '\u2014'}`, oCols[3], y);
          doc.setTextColor(...textDim);
          const themeText = doc.splitTextToSize(o.houseTheme || '', pw - margin - oCols[4]);
          doc.text(themeText[0] || '', oCols[4], y);
          y += 12;
        }
        y += 8;
      }

      // ─── Stelliums ───────────────────────────────────────────
      if (a.stelliums.length > 0) {
        sectionTitle('Stelliums');
        for (const s of a.stelliums) {
          const planets = s.planets.map(p => `${PLANET_SYMBOLS[p] || ''} ${p}`).join(', ');
          boldText(`${s.planets.length}-Planet Stellium in ${s.location}: ${planets}`);
          bodyText(s.interpretation, textMuted, 8);
          y += 6;
        }
      }

      // ─── SR-to-Natal Aspects ─────────────────────────────────
      if (a.srToNatalAspects.length > 0) {
        sectionTitle('Key SR-to-Natal Aspects');
        for (const asp of a.srToNatalAspects.slice(0, 15)) {
          checkPage(14);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(...textMain);
          doc.text(`SR ${PLANET_SYMBOLS[asp.planet1] || ''} ${asp.planet1}`, margin, y);
          doc.setTextColor(...accent);
          doc.text(asp.type, margin + 100, y);
          doc.setTextColor(...textMain);
          doc.text(`Natal ${PLANET_SYMBOLS[asp.planet2] || ''} ${asp.planet2}`, margin + 175, y);
          doc.setTextColor(...textDim);
          doc.text(`${asp.orb}\u00B0 orb`, margin + 280, y);
          y += 12;
        }
        y += 8;
      }

      // ─── Natal Degree Conduits ───────────────────────────────
      if (a.natalDegreeConduits.length > 0) {
        sectionTitle('Natal Degree Connections (Lynn Bell)');
        for (const c of a.natalDegreeConduits) {
          bodyText(`SR ${PLANET_SYMBOLS[c.srPlanet] || ''} ${c.srPlanet} in ${c.srSign} ${c.degree} \u2194 Natal ${PLANET_SYMBOLS[c.natalPlanet] || ''} ${c.natalPlanet} (${c.orb.toFixed(1)}\u00B0 orb)`, textMuted, 8);
        }
        y += 8;
      }

      // ─── Moon Timing ─────────────────────────────────────────
      if (a.moonTimingEvents.length > 0) {
        sectionTitle('Moon Timing \u2014 When Things Happen');
        bodyText('The SR Moon advances ~1\u00B0 per month. When it perfects an aspect to another planet, that month marks a turning point.', textDim, 7);
        y += 6;
        for (const evt of a.moonTimingEvents.slice(0, 12)) {
          checkPage(14);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(...accent);
          doc.text(evt.approximateMonth, margin, y);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...textMain);
          doc.text(`Moon ${evt.aspectType} ${PLANET_SYMBOLS[evt.targetPlanet] || ''} ${evt.targetPlanet}`, margin + 80, y);
          doc.setTextColor(...textDim);
          const interpLines = doc.splitTextToSize(evt.interpretation, contentW - 240);
          doc.text(interpLines[0] || '', margin + 220, y);
          y += 12;
        }
        y += 8;
      }

      // ─── Element & Modality ──────────────────────────────────
      if (a.elementBalance) {
        sectionTitle('Element & Modality Balance');
        const eb = a.elementBalance;
        boldText(`Dominant Element: ${eb.dominant} | Fire ${eb.fire} \u2022 Earth ${eb.earth} \u2022 Air ${eb.air} \u2022 Water ${eb.water}`);
        if (eb.missing.length > 0) bodyText(`Missing: ${eb.missing.join(', ')}`, textDim, 8);
        bodyText(eb.interpretation, textMuted, 8);
        y += 4;
        const mb = a.modalityBalance;
        boldText(`Dominant Modality: ${mb.dominant} | Cardinal ${mb.cardinal} \u2022 Fixed ${mb.fixed} \u2022 Mutable ${mb.mutable}`);
        bodyText(mb.interpretation, textMuted, 8);
        y += 8;
      }

      // ─── Saturn & Nodes ──────────────────────────────────────
      if (a.saturnFocus) {
        sectionTitle('Saturn Focus');
        boldText(`${SIGN_SYMBOLS[a.saturnFocus.sign] || ''} ${a.saturnFocus.sign} \u2022 SR House ${a.saturnFocus.house || '\u2014'} \u2022 Natal House ${a.saturnFocus.natalHouse || '\u2014'}${a.saturnFocus.isRetrograde ? ' (Rx)' : ''}`);
        bodyText(a.saturnFocus.interpretation, textMuted, 8);
        y += 4;
      }
      if (a.nodesFocus) {
        sectionTitle('North Node Focus');
        boldText(`${SIGN_SYMBOLS[a.nodesFocus.sign] || ''} ${a.nodesFocus.sign} \u2022 SR House ${a.nodesFocus.house || '\u2014'}`);
        bodyText(a.nodesFocus.interpretation, textMuted, 8);
        y += 4;
      }

      // ─── Year-Ahead Narrative ────────────────────────────────
      if (narrative) {
        sectionTitle('Year-Ahead Reading');
        // Parse markdown simply
        const lines = narrative.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) { y += 6; continue; }
          if (trimmed.startsWith('## ')) {
            y += 8;
            boldText(trimmed.replace('## ', '').toUpperCase(), accent, 9);
            y += 2;
          } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
            boldText(trimmed.replace(/\*\*/g, ''), textMain, 9);
          } else {
            const clean = trimmed.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
            bodyText(clean, textMuted, 8, 12);
          }
        }
      }

      // ─── Footer on last page ─────────────────────────────────
      y += 20;
      checkPage(30);
      doc.setDrawColor(...borderC);
      doc.line(margin, y, pw - margin, y);
      y += 14;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...textDim);
      doc.text(`Generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, pw / 2, y, { align: 'center' });

      // Page numbers
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(...textDim);
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

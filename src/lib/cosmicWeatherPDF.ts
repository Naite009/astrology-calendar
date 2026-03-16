import jsPDF from 'jspdf';

type Color = [number, number, number];

const CREAM:   Color = [250, 247, 242];
const INK:     Color = [38, 34, 30];
const GOLD:    Color = [184, 150, 62];
const MUTED:   Color = [130, 125, 118];
const RULE:    Color = [210, 205, 198];
const CARD_BG: Color = [245, 241, 234];
const ACCENT:  Color = [90, 70, 140]; // deep purple for personalization badge

interface CosmicWeatherPDFOptions {
  date: string; // e.g. "Sunday, March 16, 2025"
  personName?: string;
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  moonPhase: string;
  moonPosition: string; // e.g. "♓ Pisces 14°22'"
  sunPosition: string;
  illumination: number; // 0-100
  insight: string; // the markdown narrative
  voiceStyle: string;
  isPersonalized: boolean;
}

function pageBg(doc: jsPDF, pw: number, ph: number) {
  doc.setFillColor(...CREAM);
  doc.rect(0, 0, pw, ph, 'F');
}

function trackedLabel(doc: jsPDF, text: string, x: number, y: number, opts?: { align?: 'left' | 'center' | 'right'; size?: number; charSpace?: number }) {
  const size = opts?.size ?? 8;
  const cs = opts?.charSpace ?? 3;
  doc.setFont('times', 'normal');
  doc.setFontSize(size);
  doc.setCharSpace(cs);
  doc.text(text.toUpperCase(), x, y, { align: opts?.align || 'center' });
  doc.setCharSpace(0);
}

/** Parse markdown into simple segments for PDF rendering */
function parseMarkdownSegments(text: string): Array<{ type: 'h2' | 'bold' | 'body' | 'bullet'; text: string }> {
  // Strip recipe blocks
  const cleaned = text.replace(/\*\*RECIPE_START\*\*[\s\S]*?\*\*RECIPE_END\*\*/, '').trim();
  const lines = cleaned.split('\n');
  const segments: Array<{ type: 'h2' | 'bold' | 'body' | 'bullet'; text: string }> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('## ')) {
      segments.push({ type: 'h2', text: trimmed.replace(/^##\s*/, '') });
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      segments.push({ type: 'bullet', text: trimmed.replace(/^[-•]\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1') });
    } else if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
      segments.push({ type: 'bold', text: trimmed.replace(/\*\*/g, '') });
    } else {
      // Inline bold → just treat as body with bold stripped visually (jsPDF can't do inline bold easily)
      segments.push({ type: 'body', text: trimmed.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') });
    }
  }
  return segments;
}

export function generateCosmicWeatherPDF(opts: CosmicWeatherPDFOptions) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 54;
  const contentW = pw - margin * 2;
  let y = 0;

  const checkPage = (needed: number) => {
    if (y + needed > ph - 60) {
      doc.addPage();
      pageBg(doc, pw, ph);
      y = margin;
      // footer on new page
      addFooter(doc);
    }
  };

  const addFooter = (d: jsPDF) => {
    const page = d.getNumberOfPages();
    d.setFont('times', 'normal');
    d.setFontSize(7);
    d.setTextColor(...MUTED);
    if (opts.isPersonalized && opts.personName) {
      d.text(`Personalized for ${opts.personName}`, margin, ph - 28);
    }
    d.text(`${opts.date}`, pw / 2, ph - 28, { align: 'center' });
    d.text(`${page}`, pw - margin, ph - 28, { align: 'right' });
  };

  // ═══════════════════════════════════════════════════════════════
  // PAGE 1 — COVER
  // ═══════════════════════════════════════════════════════════════
  pageBg(doc, pw, ph);
  y = 80;

  // Top label
  doc.setTextColor(...GOLD);
  trackedLabel(doc, '—   Cosmic Weather   —', pw / 2, y, { size: 9, charSpace: 4 });
  y += 50;

  // Date
  doc.setFont('times', 'normal');
  doc.setFontSize(32);
  doc.setTextColor(...INK);
  const dateLines: string[] = doc.splitTextToSize(opts.date, contentW);
  for (const line of dateLines) {
    doc.text(line, pw / 2, y, { align: 'center' });
    y += 38;
  }
  y += 10;

  // Gold rule
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(pw / 2 - 80, y, pw / 2 + 80, y);
  y += 30;

  // Moon phase + position
  doc.setFont('times', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(...MUTED);
  doc.text(`${opts.moonPhase}`, pw / 2, y, { align: 'center' });
  y += 22;
  doc.setFontSize(12);
  doc.text(`Moon: ${opts.moonPosition}   •   Sun: ${opts.sunPosition}`, pw / 2, y, { align: 'center' });
  y += 18;
  doc.text(`Illumination: ${opts.illumination}%`, pw / 2, y, { align: 'center' });
  y += 40;

  // ── Personalization badge ──
  if (opts.isPersonalized && opts.personName) {
    const badgeW = 340;
    const badgeH = 90;
    const badgeX = (pw - badgeW) / 2;

    // Badge background
    doc.setFillColor(240, 237, 250); // light purple
    doc.roundedRect(badgeX, y, badgeW, badgeH, 6, 6, 'F');
    doc.setDrawColor(...ACCENT);
    doc.setLineWidth(0.8);
    doc.roundedRect(badgeX, y, badgeW, badgeH, 6, 6, 'S');

    // "PERSONALIZED FOR" label
    doc.setTextColor(...ACCENT);
    trackedLabel(doc, 'Personalized For', pw / 2, y + 26, { size: 8, charSpace: 3 });

    // Name
    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...INK);
    doc.text(opts.personName, pw / 2, y + 52, { align: 'center' });

    // Big Three
    if (opts.sunSign || opts.moonSign || opts.risingSign) {
      doc.setFont('times', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      const bigThree = [
        opts.sunSign ? `☉ ${opts.sunSign} Sun` : '',
        opts.moonSign ? `☽ ${opts.moonSign} Moon` : '',
        opts.risingSign ? `ASC ${opts.risingSign}` : '',
      ].filter(Boolean).join('   •   ');
      doc.text(bigThree, pw / 2, y + 72, { align: 'center' });
    }

    y += badgeH + 30;
  }

  // Voice style
  const voiceLabels: Record<string, string> = {
    tara: 'Tara Vogel', chris: 'Chris Brennan', anne: 'Anne Ortelee',
    kathy: 'Kathy Rose', krs: 'KRS Channel', malika: 'Malika Siemper',
    sarah: "Sarah L'Harar", astrodienst: 'Astrodienst', cafe: 'Cafe Astrology',
    astrotwins: 'AstroTwins', chani: 'CHANI',
  };
  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(`Voice: ${voiceLabels[opts.voiceStyle] || opts.voiceStyle}`, pw / 2, y, { align: 'center' });

  addFooter(doc);

  // ═══════════════════════════════════════════════════════════════
  // PAGE 2+ — NARRATIVE CONTENT
  // ═══════════════════════════════════════════════════════════════
  doc.addPage();
  pageBg(doc, pw, ph);
  y = margin;

  const segments = parseMarkdownSegments(opts.insight);

  for (const seg of segments) {
    switch (seg.type) {
      case 'h2': {
        checkPage(40);
        y += 10;
        // Gold rule above heading
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(0.4);
        doc.line(margin, y, margin + contentW, y);
        y += 18;
        doc.setFont('times', 'bold');
        doc.setFontSize(15);
        doc.setTextColor(...INK);
        const h2Lines: string[] = doc.splitTextToSize(seg.text, contentW);
        for (const l of h2Lines) {
          checkPage(20);
          doc.text(l, margin, y);
          y += 20;
        }
        y += 4;
        break;
      }
      case 'bold': {
        checkPage(22);
        doc.setFont('times', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(...INK);
        const bLines: string[] = doc.splitTextToSize(seg.text, contentW);
        for (const l of bLines) {
          checkPage(14);
          doc.text(l, margin, y);
          y += 14;
        }
        y += 3;
        break;
      }
      case 'bullet': {
        checkPage(16);
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...INK);
        const bulletLines: string[] = doc.splitTextToSize(seg.text, contentW - 16);
        for (let i = 0; i < bulletLines.length; i++) {
          checkPage(14);
          if (i === 0) {
            doc.setTextColor(...GOLD);
            doc.text('•', margin + 2, y);
            doc.setTextColor(...INK);
          }
          doc.text(bulletLines[i], margin + 16, y);
          y += 14;
        }
        y += 2;
        break;
      }
      case 'body':
      default: {
        checkPage(16);
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...INK);
        const bodyLines: string[] = doc.splitTextToSize(seg.text, contentW);
        for (const l of bodyLines) {
          checkPage(14);
          doc.text(l, margin, y);
          y += 14;
        }
        y += 6;
        break;
      }
    }
  }

  // Add footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('times', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    if (opts.isPersonalized && opts.personName) {
      doc.text(`Personalized for ${opts.personName}`, margin, ph - 28);
    }
    doc.text(opts.date, pw / 2, ph - 28, { align: 'center' });
    doc.text(`${i} / ${totalPages}`, pw - margin, ph - 28, { align: 'right' });
  }

  // Download
  const safeName = opts.personName?.replace(/[^a-zA-Z0-9]/g, '-') || 'general';
  const dateSlug = new Date().toISOString().split('T')[0];
  doc.save(`cosmic-weather-${safeName}-${dateSlug}.pdf`);
}

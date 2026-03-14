import jsPDF from 'jspdf';
import { SignColorTheme } from './signColorThemes';

type Color = [number, number, number];

// ─── V3 EDITORIAL PALETTE ───────────────────────────────────────────
const CREAM:   Color = [250, 247, 242];
const CARD_BG: Color = [245, 241, 234];
const INK:     Color = [18,  16,  14];
const MUTED:   Color = [130, 125, 118];
const GOLD:    Color = [184, 150, 62];
const RULE:    Color = [200, 195, 188];
const DARK:    Color = [38,  34,  30];

export interface PDFContext {
  y: number;
  pw: number;
  ph: number;
  margin: number;
  contentW: number;
  cardCount: number;
  colors: {
    cream: Color; cardBg: Color; ink: Color; muted: Color; gold: Color;
    accent: Color; rule: Color; dark: Color;
    deep: Color; purple: Color; lilac: Color; rust: Color; warm: Color;
    border: Color; dimText: Color; bodyText: Color; darkText: Color;
    softGold: Color; deepBrown: Color; warmBorder: Color; creamBg: Color;
    softBlue: Color; accentGreen: Color; accentRust: Color;
  };
  sectionPages: Map<string, number>;
  sectionNum: number;
  checkPage: (needed: number) => void;
  sectionTitle: (doc: jsPDF, title: string, subtitle?: string) => void;
  writeBody: (doc: jsPDF, text: string, color?: Color, size?: number, lineH?: number) => void;
  writeBold: (doc: jsPDF, text: string, color?: Color, size?: number) => void;
  writeLabel: (doc: jsPDF, label: string, value: string, labelColor?: Color, valueColor?: Color) => void;
  drawCard: (doc: jsPDF, renderContent: () => void, accentColor?: Color) => void;
  writeCardSection: (doc: jsPDF, label: string, text: string, labelColor?: Color) => void;
  drawContentBox: (doc: jsPDF, x: number, yStart: number, w: number, h: number, bg?: Color) => void;
  drawGoldRule: (doc: jsPDF) => void;
  drawRule: (doc: jsPDF) => void;
  trackedLabel: (doc: jsPDF, text: string, x: number, y: number, opts?: { align?: 'left' | 'center' | 'right'; size?: number; charSpace?: number }) => void;
  pageBg: (doc: jsPDF) => void;
}

export interface ColorOverrides {
  gold?: Color; softGold?: Color; deepBrown?: Color; warmBorder?: Color;
  creamBg?: Color; accentGreen?: Color; accentRust?: Color; softBlue?: Color;
}

export function createPDFContext(
  doc: jsPDF, pw: number, ph: number, margin: number, contentW: number,
  _themeOrOverrides?: SignColorTheme | ColorOverrides,
): PDFContext {
  const colors = {
    cream: CREAM, cardBg: CARD_BG, ink: INK, muted: MUTED, gold: GOLD,
    accent: GOLD, rule: RULE, dark: DARK,
    deep: INK, purple: GOLD, lilac: MUTED, rust: DARK, warm: CREAM,
    border: RULE, dimText: MUTED, bodyText: INK, darkText: INK,
    softGold: CARD_BG, deepBrown: DARK, warmBorder: RULE, creamBg: CREAM,
    softBlue: CARD_BG, accentGreen: GOLD, accentRust: DARK,
  };

  const sectionPages = new Map<string, number>();

  const ctx: PDFContext = {
    y: margin,
    pw, ph, margin, contentW, colors,
    sectionPages,
    sectionNum: 0,
    cardCount: 0,

    checkPage(needed: number) {
      if (ctx.y + needed > ph - 55) {
        doc.addPage(); ctx.y = margin; ctx.pageBg(doc);
      }
    },

    pageBg(d: jsPDF) {
      d.setFillColor(...CREAM);
      d.rect(0, 0, pw, ph, 'F');
    },

    trackedLabel(d: jsPDF, text: string, x: number, y: number, opts) {
      const align     = opts?.align     || 'left';
      const size      = opts?.size      || 7.5;
      const cs        = opts?.charSpace || 3.5;
      d.setFont('times', 'bold');
      d.setFontSize(size);
      d.setTextColor(...GOLD);
      d.setCharSpace(cs);
      d.text(text, x, y, { align });
      d.setCharSpace(0);
    },

    drawGoldRule(d: jsPDF) {
      d.setDrawColor(...GOLD); d.setLineWidth(0.4);
      d.line(margin, ctx.y, pw - margin, ctx.y);
    },

    drawRule(d: jsPDF) {
      d.setDrawColor(...RULE); d.setLineWidth(0.25);
      d.line(margin, ctx.y, pw - margin, ctx.y);
    },

    sectionTitle(d: jsPDF, title: string, subtitle?: string) {
      ctx.checkPage(140);
      ctx.sectionNum++;
      ctx.cardCount = 0; // reset card alternation per section
      const pageNum = d.getNumberOfPages();
      sectionPages.set(title.toUpperCase(), pageNum);

      // More breathing room at top of section
      const topPad = ctx.y < margin + 20 ? 12 : 32;
      ctx.y += topPad;

      // Gold tracked section label
      const numStr    = String(ctx.sectionNum).padStart(2, '0');
      const labelText = `${numStr} · ${title.toUpperCase()}`;
      ctx.trackedLabel(d, labelText, margin, ctx.y);
      ctx.y += 10;

      // Hairline rule
      d.setDrawColor(...RULE); d.setLineWidth(0.3);
      d.line(margin, ctx.y, pw - margin, ctx.y);
      ctx.y += 22; // more space after rule before title

      // Large serif display title
      if (subtitle) {
        d.setFont('times', 'normal'); d.setFontSize(26);
        d.setTextColor(...INK);
        const subLines: string[] = d.splitTextToSize(subtitle, contentW);
        for (const line of subLines) {
          d.text(line, margin, ctx.y);
          ctx.y += 32; // generous line spacing for display text
        }
        ctx.y += 10;
      }
    },

    writeBody(d: jsPDF, text: string, _color: Color = INK, size = 10.5, lineH = 17) {
      d.setFont('times', 'normal'); d.setFontSize(size);
      d.setTextColor(...INK);
      const lines: string[]  = d.splitTextToSize(text, contentW - 28);
      const totalH           = lines.length * lineH;
      const remaining        = ph - 55 - ctx.y;

      if (totalH <= remaining) {
        for (const line of lines) { d.text(line, margin + 14, ctx.y); ctx.y += lineH; }
        return;
      }
      const linesFit       = Math.floor(remaining / lineH);
      const linesRemaining = lines.length - linesFit;
      if (linesFit < 4 || linesRemaining < 4) {
        doc.addPage(); ctx.y = margin; ctx.pageBg(doc);
        for (const line of lines) { d.text(line, margin + 14, ctx.y); ctx.y += lineH; }
        return;
      }
      for (let i = 0; i < linesFit; i++) { d.text(lines[i], margin + 14, ctx.y); ctx.y += lineH; }
      doc.addPage(); ctx.y = margin; ctx.pageBg(doc);
      for (let i = linesFit; i < lines.length; i++) { d.text(lines[i], margin + 14, ctx.y); ctx.y += lineH; }
    },

    writeBold(d: jsPDF, text: string, _color: Color = INK, size = 11.5) {
      d.setFont('times', 'bold'); d.setFontSize(size);
      d.setTextColor(...INK);
      const lines: string[] = d.splitTextToSize(text, contentW - 28);
      const totalH          = lines.length * 17;
      if (ctx.y + totalH > ph - 55) { doc.addPage(); ctx.y = margin; ctx.pageBg(doc); }
      for (const line of lines) { d.text(line, margin + 14, ctx.y); ctx.y += 17; }
      ctx.y += 6;
    },

    writeLabel(d: jsPDF, label: string, value: string, _lc: Color = MUTED, _vc: Color = INK) {
      ctx.checkPage(20);
      d.setFont('times', 'normal'); d.setFontSize(9);
      d.setTextColor(...MUTED);
      d.text(label, margin + 14, ctx.y);
      const labelW = d.getTextWidth(label);
      d.setFont('times', 'bold'); d.setFontSize(11);
      d.setTextColor(...INK);
      d.text(value, margin + 14 + labelW + 6, ctx.y);
      ctx.y += 18;
    },

    drawCard(d: jsPDF, renderContent: () => void, _accentColor: Color = GOLD) {
      ctx.cardCount++;
      const isShaded = ctx.cardCount % 2 === 1; // odd = shaded, even = white
      const cardBgColor: Color = isShaded ? CARD_BG : CREAM;
      const startY     = ctx.y;
      const estimatedH = Math.min(500, ph - startY - 10);

      // Card background — alternates shaded/white
      d.setFillColor(...cardBgColor);
      d.roundedRect(margin, startY, contentW, estimatedH, 3, 3, 'F');

      // Gold left accent bar
      d.setFillColor(...GOLD);
      d.rect(margin, startY, 3, estimatedH, 'F');

      // Render content with generous top padding
      ctx.y = startY + 20;
      renderContent();
      ctx.y += 18; // generous bottom padding

      const actualH = ctx.y - startY;

      // Erase overshoot
      d.setFillColor(...CREAM);
      d.rect(margin - 1, startY + actualH, contentW + 2, estimatedH - actualH + 10, 'F');

      // Border at actual height
      d.setDrawColor(...RULE); d.setLineWidth(0.3);
      d.roundedRect(margin, startY, contentW, actualH, 3, 3, 'S');

      // Redraw accent bar at correct height
      d.setFillColor(...GOLD);
      d.rect(margin, startY, 3, actualH, 'F');

      ctx.y += 16; // space after card
    },

    writeCardSection(d: jsPDF, label: string, text: string, _labelColor: Color = GOLD) {
      const nestedStartY = ctx.y;
      const nestedEstH   = Math.min(300, ph - ctx.y - 10);

      d.setFillColor(...CARD_BG);
      d.roundedRect(margin + 10, nestedStartY, contentW - 20, nestedEstH, 2, 2, 'F');
      d.setFillColor(...GOLD);
      d.rect(margin + 10, nestedStartY, 2.5, nestedEstH, 'F');

      ctx.y = nestedStartY + 14;
      ctx.trackedLabel(d, label.toUpperCase(), margin + 18, ctx.y, { size: 7, charSpace: 3 });
      ctx.y += 14;

      d.setFont('times', 'normal'); d.setFontSize(10);
      d.setTextColor(...INK);
      const lines: string[] = d.splitTextToSize(text, contentW - 40);
      for (const line of lines) { d.text(line, margin + 18, ctx.y); ctx.y += 15; }

      ctx.y += 10;
      const nestedH = ctx.y - nestedStartY;

      d.setFillColor(...CARD_BG);
      d.rect(margin + 9, nestedStartY + nestedH, contentW - 18, nestedEstH - nestedH + 5, 'F');
      d.setDrawColor(...RULE); d.setLineWidth(0.25);
      d.roundedRect(margin + 10, nestedStartY, contentW - 20, nestedH, 2, 2, 'S');
      d.setFillColor(...GOLD);
      d.rect(margin + 10, nestedStartY, 2.5, nestedH, 'F');

      ctx.y += 8;
    },

    drawContentBox(d: jsPDF, x: number, yStart: number, w: number, h: number, _bg: Color = CARD_BG) {
      d.setFillColor(...CARD_BG);
      d.roundedRect(x, yStart, w, h, 3, 3, 'F');
      d.setDrawColor(...RULE); d.setLineWidth(0.3);
      d.roundedRect(x, yStart, w, h, 3, 3, 'S');
    },
  };

  return ctx;
}

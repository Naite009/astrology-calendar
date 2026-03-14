import jsPDF from 'jspdf';
import { SignColorTheme } from './signColorThemes';

type Color = [number, number, number];

// ─── V3 EDITORIAL PALETTE ───────────────────────────────────────────
const CREAM:   Color = [250, 247, 242];
const CARD_BG: Color = [245, 241, 234]; // slightly warmer than page
const INK:     Color = [18,  16,  14];
const MUTED:   Color = [130, 125, 118];
const GOLD:    Color = [184, 150, 62];  // warm gold for accents & labels
const RULE:    Color = [200, 195, 188];
const DARK:    Color = [38,  34,  30];

export interface PDFContext {
  y: number;
  pw: number;
  ph: number;
  margin: number;
  contentW: number;
  colors: {
    cream: Color;
    cardBg: Color;
    ink: Color;
    muted: Color;
    gold: Color;
    accent: Color;
    rule: Color;
    dark: Color;
    // Legacy aliases kept for backward compat
    deep: Color;
    purple: Color;
    lilac: Color;
    rust: Color;
    warm: Color;
    border: Color;
    dimText: Color;
    bodyText: Color;
    darkText: Color;
    softGold: Color;
    deepBrown: Color;
    warmBorder: Color;
    creamBg: Color;
    softBlue: Color;
    accentGreen: Color;
    accentRust: Color;
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
  gold?: Color;
  softGold?: Color;
  deepBrown?: Color;
  warmBorder?: Color;
  creamBg?: Color;
  accentGreen?: Color;
  accentRust?: Color;
  softBlue?: Color;
}

export function createPDFContext(
  doc: jsPDF, pw: number, ph: number, margin: number, contentW: number,
  _themeOrOverrides?: SignColorTheme | ColorOverrides,
): PDFContext {
  const colors = {
    cream: CREAM,
    cardBg: CARD_BG,
    ink: INK,
    muted: MUTED,
    gold: GOLD,
    accent: GOLD,
    rule: RULE,
    dark: DARK,
    // Legacy aliases — all mapped to v3 equivalents
    deep: INK,
    purple: GOLD,
    lilac: MUTED,
    rust: DARK,
    warm: CREAM,
    border: RULE,
    dimText: MUTED,
    bodyText: INK,
    darkText: INK,
    softGold: CARD_BG,
    deepBrown: DARK,
    warmBorder: RULE,
    creamBg: CREAM,
    softBlue: CARD_BG,
    accentGreen: GOLD,
    accentRust: DARK,
  };

  const sectionPages = new Map<string, number>();

  const ctx: PDFContext = {
    y: margin,
    pw, ph, margin, contentW, colors,
    sectionPages,
    sectionNum: 0,

    checkPage(needed: number) {
      if (ctx.y + needed > ph - 55) { doc.addPage(); ctx.y = margin; ctx.pageBg(doc); }
    },

    pageBg(d: jsPDF) {
      d.setFillColor(...CREAM);
      d.rect(0, 0, pw, ph, 'F');
    },

    trackedLabel(d: jsPDF, text: string, x: number, y: number, opts) {
      const align = opts?.align || 'left';
      const size = opts?.size || 7.5;
      const cs = opts?.charSpace || 3.5;
      d.setFont('times', 'bold'); d.setFontSize(size);
      d.setTextColor(...GOLD);
      d.setCharSpace(cs);
      d.text(text, x, y, { align });
      d.setCharSpace(0);
    },

    drawGoldRule(d: jsPDF) {
      d.setDrawColor(...RULE); d.setLineWidth(0.3);
      d.line(margin, ctx.y, pw - margin, ctx.y);
    },

    drawRule(d: jsPDF) {
      d.setDrawColor(...RULE); d.setLineWidth(0.25);
      d.line(margin, ctx.y, pw - margin, ctx.y);
    },

    sectionTitle(d: jsPDF, title: string, subtitle?: string) {
      ctx.checkPage(120);
      ctx.sectionNum++;
      const pageNum = d.getNumberOfPages();
      sectionPages.set(title.toUpperCase(), pageNum);
      const topPad = ctx.y < margin + 20 ? 8 : 24;
      ctx.y += topPad;

      // Tracked caps section label in gold
      const numStr = String(ctx.sectionNum).padStart(2, '0');
      const labelText = `${numStr} · ${title.toUpperCase()}`;
      ctx.trackedLabel(d, labelText, margin, ctx.y);
      ctx.y += 8;

      // Hairline rule
      d.setDrawColor(...RULE); d.setLineWidth(0.3);
      d.line(margin, ctx.y, pw - margin, ctx.y);
      ctx.y += 18;

      // Large serif display title
      if (subtitle) {
        d.setFont('times', 'normal'); d.setFontSize(24);
        d.setTextColor(...INK);
        const subLines: string[] = d.splitTextToSize(subtitle, contentW);
        for (const line of subLines) { d.text(line, margin, ctx.y); ctx.y += 30; }
        ctx.y += 6;
      }
    },

    writeBody(d: jsPDF, text: string, _color: Color = INK, size = 10, lineH = 15) {
      d.setFont('times', 'normal'); d.setFontSize(size);
      d.setTextColor(...INK);
      const lines: string[] = d.splitTextToSize(text, contentW - 28);
      const totalH = lines.length * lineH;
      const remaining = ph - 55 - ctx.y;
      if (totalH <= remaining) {
        for (const line of lines) { d.text(line, margin + 14, ctx.y); ctx.y += lineH; }
        return;
      }
      const linesFit = Math.floor(remaining / lineH);
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

    writeBold(d: jsPDF, text: string, _color: Color = INK, size = 11) {
      d.setFont('times', 'bold'); d.setFontSize(size);
      d.setTextColor(...INK);
      const lines: string[] = d.splitTextToSize(text, contentW - 28);
      const totalH = lines.length * 15;
      if (ctx.y + totalH > ph - 55) { doc.addPage(); ctx.y = margin; ctx.pageBg(doc); }
      for (const line of lines) { d.text(line, margin + 14, ctx.y); ctx.y += 15; }
      ctx.y += 4;
    },

    writeLabel(d: jsPDF, label: string, value: string, _labelColor: Color = MUTED, _valueColor: Color = INK) {
      ctx.checkPage(16);
      d.setFont('times', 'normal'); d.setFontSize(9);
      d.setTextColor(...MUTED);
      d.text(label, margin + 14, ctx.y);
      const labelW = d.getTextWidth(label);
      d.setFont('times', 'bold'); d.setFontSize(10.5);
      d.setTextColor(...INK);
      d.text(value, margin + 14 + labelW + 6, ctx.y); ctx.y += 16;
    },

    drawCard(d: jsPDF, renderContent: () => void, _accentColor: Color = GOLD) {
      const startY = ctx.y;

      // 1. Draw cream background with generous estimated height
      const estimatedH = Math.min(500, ph - startY - 10);
      d.setFillColor(...CARD_BG);
      d.roundedRect(margin, startY, contentW, estimatedH, 3, 3, 'F');

      // 2. Gold left accent bar (3pt wide)
      d.setFillColor(...GOLD);
      d.rect(margin, startY, 3, estimatedH, 'F');

      // 3. Render content on top with padding
      ctx.y = startY + 16;
      renderContent();
      ctx.y += 14;

      // 4. Calculate actual card height
      const actualH = ctx.y - startY;

      // 5. Erase excess background below actual card
      d.setFillColor(...CREAM);
      d.rect(margin - 1, startY + actualH, contentW + 2, estimatedH - actualH + 10, 'F');

      // 6. Draw border at actual height
      d.setDrawColor(...RULE);
      d.setLineWidth(0.3);
      d.roundedRect(margin, startY, contentW, actualH, 3, 3, 'S');

      // 7. Redraw gold accent bar at correct height
      d.setFillColor(...GOLD);
      d.rect(margin, startY, 3, actualH, 'F');

      ctx.y += 10; // spacing after card
    },

    writeCardSection(d: jsPDF, label: string, text: string, _labelColor: Color = GOLD) {
      // Nested card section with gold tracked label
      const nestedStartY = ctx.y;

      // Draw nested cream bg
      const nestedEstH = Math.min(300, ph - ctx.y - 10);
      d.setFillColor(...CARD_BG);
      d.roundedRect(margin + 10, nestedStartY, contentW - 20, nestedEstH, 2, 2, 'F');

      // Gold accent bar on nested card
      d.setFillColor(...GOLD);
      d.rect(margin + 10, nestedStartY, 2.5, nestedEstH, 'F');

      ctx.y = nestedStartY + 10;

      // Gold tracked caps label
      ctx.trackedLabel(d, label.toUpperCase(), margin + 18, ctx.y, { size: 7, charSpace: 3 });
      ctx.y += 12;

      // Body text
      d.setFont('times', 'normal'); d.setFontSize(9.5);
      d.setTextColor(...INK);
      const lines: string[] = d.splitTextToSize(text, contentW - 40);
      for (const line of lines) { d.text(line, margin + 18, ctx.y); ctx.y += 14; }

      ctx.y += 8;
      const nestedH = ctx.y - nestedStartY;

      // Erase excess
      d.setFillColor(...CARD_BG); // erase with parent card bg
      d.rect(margin + 9, nestedStartY + nestedH, contentW - 18, nestedEstH - nestedH + 5, 'F');

      // Border
      d.setDrawColor(...RULE);
      d.setLineWidth(0.25);
      d.roundedRect(margin + 10, nestedStartY, contentW - 20, nestedH, 2, 2, 'S');

      // Redraw nested accent
      d.setFillColor(...GOLD);
      d.rect(margin + 10, nestedStartY, 2.5, nestedH, 'F');

      ctx.y += 6;
    },

    drawContentBox(d: jsPDF, x: number, yStart: number, w: number, h: number, _bg: Color = CARD_BG) {
      // Cream filled box with border
      d.setFillColor(...CARD_BG);
      d.roundedRect(x, yStart, w, h, 3, 3, 'F');
      d.setDrawColor(...RULE);
      d.setLineWidth(0.3);
      d.roundedRect(x, yStart, w, h, 3, 3, 'S');
    },
  };

  return ctx;
}

import jsPDF from 'jspdf';
import { SignColorTheme } from './signColorThemes';

type Color = [number, number, number];

export interface PDFContext {
  y: number;
  pw: number;
  ph: number;
  margin: number;
  contentW: number;
  colors: {
    deep: Color;
    purple: Color;
    gold: Color;
    lilac: Color;
    rust: Color;
    cream: Color;
    warm: Color;
    border: Color;
    rule: Color;
    dimText: Color;
    bodyText: Color;
    ink: Color;
    // Legacy aliases
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
  themeOrOverrides?: SignColorTheme | ColorOverrides,
): PDFContext {
  // Detect if it's a full SignColorTheme or legacy ColorOverrides
  const isFullTheme = themeOrOverrides && 'deep' in themeOrOverrides;

  const colors = isFullTheme
    ? {
        deep: (themeOrOverrides as SignColorTheme).deep,
        purple: (themeOrOverrides as SignColorTheme).purple,
        gold: (themeOrOverrides as SignColorTheme).gold,
        lilac: (themeOrOverrides as SignColorTheme).lilac,
        rust: (themeOrOverrides as SignColorTheme).rust,
        cream: (themeOrOverrides as SignColorTheme).cream,
        warm: (themeOrOverrides as SignColorTheme).warm,
        border: (themeOrOverrides as SignColorTheme).border,
        rule: (themeOrOverrides as SignColorTheme).rule,
        dimText: (themeOrOverrides as SignColorTheme).dimText,
        bodyText: (themeOrOverrides as SignColorTheme).bodyText,
        ink: (themeOrOverrides as SignColorTheme).ink,
        darkText: (themeOrOverrides as SignColorTheme).ink,
        softGold: (themeOrOverrides as SignColorTheme).warm,
        deepBrown: (themeOrOverrides as SignColorTheme).deep,
        warmBorder: (themeOrOverrides as SignColorTheme).border,
        creamBg: (themeOrOverrides as SignColorTheme).cream,
        softBlue: (themeOrOverrides as SignColorTheme).softBlue || [230, 240, 250] as Color,
        accentGreen: (themeOrOverrides as SignColorTheme).purple,
        accentRust: (themeOrOverrides as SignColorTheme).rust,
      }
    : {
        // Default / legacy fallback
        deep: [30, 28, 26] as Color,
        purple: [107, 79, 160] as Color,
        gold: (themeOrOverrides as ColorOverrides)?.gold || [162, 128, 72] as Color,
        lilac: [155, 142, 196] as Color,
        rust: [196, 98, 45] as Color,
        cream: [253, 250, 245] as Color,
        warm: [245, 240, 232] as Color,
        border: [224, 216, 204] as Color,
        rule: [216, 210, 200] as Color,
        dimText: [160, 144, 128] as Color,
        bodyText: [92, 84, 80] as Color,
        ink: [30, 28, 26] as Color,
        darkText: [30, 28, 26] as Color,
        softGold: (themeOrOverrides as ColorOverrides)?.softGold || [245, 238, 225] as Color,
        deepBrown: (themeOrOverrides as ColorOverrides)?.deepBrown || [90, 70, 45] as Color,
        warmBorder: (themeOrOverrides as ColorOverrides)?.warmBorder || [210, 200, 185] as Color,
        creamBg: (themeOrOverrides as ColorOverrides)?.creamBg || [250, 247, 242] as Color,
        softBlue: (themeOrOverrides as ColorOverrides)?.softBlue || [230, 240, 250] as Color,
        accentGreen: (themeOrOverrides as ColorOverrides)?.accentGreen || [34, 120, 80] as Color,
        accentRust: (themeOrOverrides as ColorOverrides)?.accentRust || [160, 90, 50] as Color,
      };

  const sectionPages = new Map<string, number>();

  const ctx: PDFContext = {
    y: margin,
    pw, ph, margin, contentW, colors,
    sectionPages,
    sectionNum: 0,

    checkPage(needed: number) {
      if (ctx.y + needed > ph - 55) { doc.addPage(); ctx.y = margin; }
    },

    drawGoldRule(d: jsPDF) {
      d.setDrawColor(...colors.gold); d.setLineWidth(1);
      d.line(margin, ctx.y, pw - margin, ctx.y);
    },

    drawRule(d: jsPDF) {
      d.setDrawColor(...colors.rule); d.setLineWidth(0.5);
      d.line(margin, ctx.y, pw - margin, ctx.y);
    },

    sectionTitle(d: jsPDF, title: string, subtitle?: string) {
      ctx.checkPage(120);
      ctx.sectionNum++;
      const pageNum = d.getNumberOfPages();
      sectionPages.set(title.toUpperCase(), pageNum);
      const topPad = ctx.y < margin + 20 ? 8 : 24;
      ctx.y += topPad;

      // v3 section header: number in gold, title in Georgia bold, subtitle in dim
      const numStr = String(ctx.sectionNum).padStart(2, '0');
      d.setFont('helvetica', 'bold'); d.setFontSize(10);
      d.setTextColor(...colors.gold);
      d.text(numStr, margin, ctx.y);
      const numW = d.getTextWidth(numStr) + 8;

      d.setFont('Georgia', 'bold'); d.setFontSize(12);
      d.setTextColor(...colors.ink);
      d.setCharSpace(0.8);
      d.text(title.toUpperCase(), margin + numW, ctx.y);
      d.setCharSpace(0);

      if (subtitle) {
        d.setFont('helvetica', 'normal'); d.setFontSize(8.5);
        d.setTextColor(...colors.dimText);
        d.text(subtitle, pw - margin, ctx.y, { align: 'right' });
      }

      ctx.y += 8;
      d.setDrawColor(...colors.rule); d.setLineWidth(0.5);
      d.line(margin, ctx.y, pw - margin, ctx.y);
      ctx.y += 16;
    },

    writeBody(d: jsPDF, text: string, color: Color = colors.bodyText, size = 10, lineH = 15) {
      d.setFont('helvetica', 'normal'); d.setFontSize(size);
      d.setTextColor(...color);
      const lines: string[] = d.splitTextToSize(text, contentW - 28);
      const totalH = lines.length * lineH;
      const remaining = ph - 55 - ctx.y;
      if (totalH <= remaining) {
        for (const line of lines) { d.text(line, margin + 8, ctx.y); ctx.y += lineH; }
        return;
      }
      const linesFit = Math.floor(remaining / lineH);
      const linesRemaining = lines.length - linesFit;
      if (linesFit < 4 || linesRemaining < 4) {
        doc.addPage(); ctx.y = margin;
        for (const line of lines) { d.text(line, margin + 8, ctx.y); ctx.y += lineH; }
        return;
      }
      for (let i = 0; i < linesFit; i++) { d.text(lines[i], margin + 8, ctx.y); ctx.y += lineH; }
      doc.addPage(); ctx.y = margin;
      for (let i = linesFit; i < lines.length; i++) { d.text(lines[i], margin + 8, ctx.y); ctx.y += lineH; }
    },

    writeBold(d: jsPDF, text: string, color: Color = colors.ink, size = 11) {
      d.setFont('helvetica', 'bold'); d.setFontSize(size);
      d.setTextColor(...color);
      const lines: string[] = d.splitTextToSize(text, contentW - 28);
      const totalH = lines.length * 15;
      if (ctx.y + totalH > ph - 55) { doc.addPage(); ctx.y = margin; }
      for (const line of lines) { d.text(line, margin + 8, ctx.y); ctx.y += 15; }
      ctx.y += 4;
    },

    writeLabel(d: jsPDF, label: string, value: string, labelColor: Color = colors.dimText, valueColor: Color = colors.ink) {
      ctx.checkPage(16);
      d.setFont('helvetica', 'normal'); d.setFontSize(9);
      d.setTextColor(...labelColor);
      d.text(label, margin + 8, ctx.y);
      const labelW = d.getTextWidth(label);
      d.setFont('helvetica', 'bold'); d.setFontSize(10.5);
      d.setTextColor(...valueColor);
      d.text(value, margin + 8 + labelW + 6, ctx.y); ctx.y += 16;
    },

    drawCard(d: jsPDF, renderContent: () => void, accentColor: Color = colors.gold) {
      const startPage = d.getNumberOfPages();
      const cardStartY = ctx.y; ctx.y += 14;
      renderContent(); ctx.y += 12;
      const endPage = d.getNumberOfPages();

      if (endPage === startPage) {
        const cardH = ctx.y - cardStartY;
        d.setDrawColor(...colors.border); d.setLineWidth(0.5);
        d.roundedRect(margin, cardStartY, contentW, cardH, 3, 3, 'S');
        d.setFillColor(...accentColor);
        d.rect(margin, cardStartY, 2.5, cardH, 'F');
      } else {
        d.setPage(startPage);
        const firstPageBottom = ph - 40;
        const firstH = firstPageBottom - cardStartY;
        d.setDrawColor(...colors.border); d.setLineWidth(0.5);
        d.roundedRect(margin, cardStartY, contentW, firstH, 3, 3, 'S');
        d.setFillColor(...accentColor);
        d.rect(margin, cardStartY, 2.5, firstH, 'F');
        d.setPage(endPage);
        const lastH = ctx.y - margin;
        d.setDrawColor(...colors.border); d.setLineWidth(0.5);
        d.roundedRect(margin, margin, contentW, lastH, 3, 3, 'S');
        d.setFillColor(...accentColor);
        d.rect(margin, margin, 2.5, lastH, 'F');
      }
      ctx.y += 8;
    },

    writeCardSection(d: jsPDF, label: string, text: string, labelColor: Color = colors.purple) {
      ctx.writeBold(d, label, labelColor, 9.5); ctx.writeBody(d, text, colors.bodyText, 9.5); ctx.y += 6;
    },

    drawContentBox(d: jsPDF, x: number, yStart: number, w: number, h: number, bg: Color = colors.cream) {
      d.setFillColor(...bg);
      d.setDrawColor(...colors.border);
      d.setLineWidth(0.5);
      d.roundedRect(x, yStart, w, h, 3, 3, 'FD');
    },
  };

  return ctx;
}

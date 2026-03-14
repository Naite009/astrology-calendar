import jsPDF from 'jspdf';
import { SignColorTheme } from './signColorThemes';

type Color = [number, number, number];

// ─── V3 EDITORIAL PALETTE ───────────────────────────────────────────
const CREAM: Color = [250, 247, 242];
const CARD_BG: Color = [245, 241, 234];
const INK: Color = [18, 16, 14];
const MUTED: Color = [130, 125, 118];
const GOLD: Color = [184, 150, 62];
const RULE: Color = [200, 195, 188];
const DARK: Color = [38, 34, 30];

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
  sectionDivider: (doc: jsPDF) => void;
  writeBody: (doc: jsPDF, text: string, color?: Color, size?: number, lineH?: number) => void;
  writeBold: (doc: jsPDF, text: string, color?: Color, size?: number) => void;
  writeLabel: (doc: jsPDF, label: string, value: string, labelColor?: Color, valueColor?: Color) => void;
  drawCard: (doc: jsPDF, renderContent: () => void, accentColor?: Color) => void;
  writeCardSection: (doc: jsPDF, label: string, text: string, labelColor?: Color) => void;
  drawContentBox: (doc: jsPDF, x: number, yStart: number, w: number, h: number, bg?: Color) => void;
  drawGoldRule: (doc: jsPDF) => void;
  drawRule: (doc: jsPDF) => void;
  drawInfoBox: (doc: jsPDF, x: number, yStart: number, w: number, h: number, label: string, value: string, body?: string, bgColor?: Color) => number;
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
  const pageBottom = () => ph - 58;

  const ctx: PDFContext = {
    y: margin,
    pw, ph, margin, contentW, colors,
    sectionPages,
    sectionNum: 0,
    cardCount: 0,

    checkPage(needed: number) {
      if (ctx.y + needed > pageBottom()) {
        doc.addPage();
        ctx.y = margin;
        ctx.pageBg(doc);
      }
    },

    pageBg(d: jsPDF) {
      d.setFillColor(...CREAM);
      d.rect(0, 0, pw, ph, 'F');
    },

    trackedLabel(d: jsPDF, text: string, x: number, y: number, opts) {
      const align = opts?.align || 'left';
      const size = opts?.size || 7.5;
      const cs = opts?.charSpace || 3.5;
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
      ctx.checkPage(145);
      ctx.sectionNum++;
      ctx.cardCount = 0;
      const pageNum = d.getNumberOfPages();
      sectionPages.set(title.toUpperCase(), pageNum);

      const topPad = ctx.y < margin + 20 ? 14 : 34;
      ctx.y += topPad;

      const numStr = String(ctx.sectionNum).padStart(2, '0');
      const labelText = `${numStr} · ${title.toUpperCase()}`;
      ctx.trackedLabel(d, labelText, margin, ctx.y);
      ctx.y += 11;

      d.setDrawColor(...RULE); d.setLineWidth(0.3);
      d.line(margin, ctx.y, pw - margin, ctx.y);
      ctx.y += 24;

      if (subtitle) {
        d.setFont('times', 'normal'); d.setFontSize(28);
        d.setTextColor(...INK);
        const subLines: string[] = d.splitTextToSize(subtitle, contentW);
        for (const line of subLines) {
          ctx.checkPage(36);
          d.text(line, margin, ctx.y);
          ctx.y += 34;
        }
        ctx.y += 10;
      }
    },

    writeBody(d: jsPDF, text: string, _color: Color = INK, size = 11, lineH = 17) {
      d.setFont('times', 'normal');
      d.setFontSize(size);
      d.setTextColor(...INK);

      const lines: string[] = d.splitTextToSize(text, contentW - 26);
      for (const line of lines) {
        if (ctx.y + lineH > pageBottom()) {
          doc.addPage();
          ctx.y = margin;
          ctx.pageBg(doc);
        }
        d.text(line, margin + 13, ctx.y);
        ctx.y += lineH;
      }
    },

    writeBold(d: jsPDF, text: string, _color: Color = INK, size = 12) {
      d.setFont('times', 'bold');
      d.setFontSize(size);
      d.setTextColor(...INK);

      const lineH = 18;
      const lines: string[] = d.splitTextToSize(text, contentW - 26);
      for (const line of lines) {
        if (ctx.y + lineH > pageBottom()) {
          doc.addPage();
          ctx.y = margin;
          ctx.pageBg(doc);
        }
        d.text(line, margin + 13, ctx.y);
        ctx.y += lineH;
      }
      ctx.y += 7;
    },

    writeLabel(d: jsPDF, label: string, value: string, _lc: Color = MUTED, _vc: Color = INK) {
      ctx.checkPage(22);
      d.setFont('times', 'normal'); d.setFontSize(9);
      d.setTextColor(...MUTED);
      d.text(label, margin + 13, ctx.y);
      const labelW = d.getTextWidth(label);
      d.setFont('times', 'bold'); d.setFontSize(11.5);
      d.setTextColor(...INK);
      d.text(value, margin + 13 + labelW + 6, ctx.y);
      ctx.y += 20;
    },

    drawCard(d: jsPDF, renderContent: () => void, _accentColor: Color = GOLD) {
      ctx.checkPage(80);
      ctx.cardCount += 1;

      const isShaded = ctx.cardCount % 2 === 1;
      const cardBgColor: Color = isShaded ? CARD_BG : CREAM;
      const startPage = d.getNumberOfPages();
      const startY = ctx.y;
      const maxCardH = Math.max(75, ph - startY - 12);

      d.setFillColor(...cardBgColor);
      d.roundedRect(margin, startY, contentW, maxCardH, 3, 3, 'F');

      d.setFillColor(...GOLD);
      d.rect(margin, startY, 3, maxCardH, 'F');

      ctx.y = startY + 18;
      renderContent();
      ctx.y += 16;

      const endPage = d.getNumberOfPages();
      if (endPage !== startPage) {
        ctx.y += 10;
        return;
      }

      const actualH = Math.max(60, Math.min(ctx.y - startY, maxCardH));

      d.setFillColor(...CREAM);
      d.rect(margin - 1, startY + actualH, contentW + 2, maxCardH - actualH + 12, 'F');

      d.setDrawColor(...RULE); d.setLineWidth(0.3);
      d.roundedRect(margin, startY, contentW, actualH, 3, 3, 'S');

      d.setFillColor(...GOLD);
      d.rect(margin, startY, 3, actualH, 'F');

      ctx.y += 12;
    },

    writeCardSection(d: jsPDF, label: string, text: string, _labelColor: Color = GOLD) {
      ctx.checkPage(60);
      const nestedStartY = ctx.y;
      const nestedEstH = Math.min(280, ph - ctx.y - 10);

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
      const lineH = 14.5;
      for (const line of lines) {
        if (ctx.y + lineH > pageBottom()) break;
        d.text(line, margin + 18, ctx.y);
        ctx.y += lineH;
      }

      ctx.y += 8;
      const nestedH = Math.max(44, ctx.y - nestedStartY);

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

import jsPDF from 'jspdf';
import { SignColorTheme } from './signColorThemes';

type Color = [number, number, number];

// ─── V3 EDITORIAL PALETTE ───────────────────────────────────────────
const CREAM: Color = [250, 247, 242];
const CARD_BG: Color = [245, 241, 234];
const INK: Color = [58, 54, 50]; // Charcoal grey for print safety
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
      d.setFillColor(255, 255, 255);
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

      const topPad = ctx.y < margin + 20 ? 14 : 40;
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
      const MIN_CARD_SPACE = 150;
      ctx.checkPage(MIN_CARD_SPACE);
      ctx.cardCount += 1;

      const isShaded = ctx.cardCount % 2 === 1;
      const cardBgColor: Color = isShaded ? CARD_BG : CREAM;
      const startPage = d.getNumberOfPages();
      const startY = ctx.y;
      const availableH = Math.max(120, pageBottom() - startY - 6);

      d.setFillColor(...cardBgColor);
      d.roundedRect(margin, startY, contentW, availableH, 3, 3, 'F');

      d.setFillColor(...GOLD);
      d.rect(margin, startY, 3, availableH, 'F');

      ctx.y = startY + 18;
      renderContent();
      ctx.y += 16;

      const endPage = d.getNumberOfPages();
      if (endPage !== startPage) {
        if (ctx.y > pageBottom() - 18) {
          d.addPage();
          ctx.y = margin;
          ctx.pageBg(d);
        } else {
          ctx.y += 8;
        }
        return;
      }

      const actualH = Math.max(64, Math.min(ctx.y - startY, availableH));
      const cleanupH = Math.max(0, availableH - actualH + 12);

      if (cleanupH > 0) {
        d.setFillColor(...CREAM);
        d.rect(margin - 1, startY + actualH, contentW + 2, cleanupH, 'F');
      }

      d.setDrawColor(...RULE); d.setLineWidth(0.3);
      d.roundedRect(margin, startY, contentW, actualH, 3, 3, 'S');

      d.setFillColor(...GOLD);
      d.rect(margin, startY, 3, actualH, 'F');

      if (ctx.y > pageBottom() - 14) {
        d.addPage();
        ctx.y = margin;
        ctx.pageBg(d);
      } else {
        ctx.y += 12;
      }
    },

    writeCardSection(d: jsPDF, label: string, text: string, _labelColor: Color = GOLD) {
      const innerX = margin + 10;
      const innerW = contentW - 20;
      const bodyX = margin + 18;
      const textW = contentW - 40;
      const lineH = 16;
      const lines: string[] = d.splitTextToSize(text, textW);

      const minBodyLines = Math.max(1, lines.length);
      const nestedH = Math.max(62, 14 + 14 + minBodyLines * lineH + 14);

      ctx.checkPage(nestedH + 10);
      const nestedStartY = ctx.y;

      d.setFillColor(...CARD_BG);
      d.roundedRect(innerX, nestedStartY, innerW, nestedH, 2, 2, 'F');
      d.setDrawColor(...RULE); d.setLineWidth(0.25);
      d.roundedRect(innerX, nestedStartY, innerW, nestedH, 2, 2, 'S');
      d.setFillColor(...GOLD);
      d.rect(innerX, nestedStartY, 2.5, nestedH, 'F');

      ctx.y = nestedStartY + 14;
      ctx.trackedLabel(d, label.toUpperCase(), bodyX, ctx.y, { size: 7, charSpace: 3 });
      ctx.y += 14;

      d.setFont('times', 'normal'); d.setFontSize(11);
      d.setTextColor(...INK);
      for (const line of lines) {
        d.text(line, bodyX, ctx.y);
        ctx.y += lineH;
      }

      ctx.y = nestedStartY + nestedH + 8;
    },

    drawContentBox(d: jsPDF, x: number, yStart: number, w: number, h: number, _bg: Color = CARD_BG) {
      d.setFillColor(...CARD_BG);
      d.roundedRect(x, yStart, w, h, 3, 3, 'F');
      d.setDrawColor(...RULE); d.setLineWidth(0.3);
      d.roundedRect(x, yStart, w, h, 3, 3, 'S');
    },

    sectionDivider(d: jsPDF) {
      ctx.checkPage(60);
      ctx.y += 20;
      const cx = pw / 2;
      // Three small gold diamonds as editorial divider
      d.setFillColor(...GOLD);
      for (const offset of [-18, 0, 18]) {
        const dx = cx + offset;
        const dy = ctx.y;
        d.triangle(dx, dy - 3, dx + 3, dy, dx, dy + 3, 'F');
        d.triangle(dx, dy - 3, dx - 3, dy, dx, dy + 3, 'F');
      }
      ctx.y += 6;
      d.setDrawColor(...RULE); d.setLineWidth(0.2);
      d.line(margin + 20, ctx.y, cx - 30, ctx.y);
      d.line(cx + 30, ctx.y, pw - margin - 20, ctx.y);
      ctx.y += 24;
    },

    drawInfoBox(d: jsPDF, x: number, yStart: number, w: number, h: number, label: string, value: string, body?: string, bgColor: Color = CARD_BG): number {
      const pad = 14;
      let cy = yStart + pad;

      d.setFillColor(...bgColor);
      d.roundedRect(x, yStart, w, h, 4, 4, 'F');

      // Top accent bar
      d.setFillColor(...GOLD);
      d.rect(x, yStart, w, 3, 'F');

      // Label
      ctx.trackedLabel(d, label, x + pad, cy + 4, { size: 6.5, charSpace: 2 });
      cy += 18;

      // Value
      d.setFont('times', 'bold'); d.setFontSize(16);
      d.setTextColor(...INK);
      const valLines: string[] = d.splitTextToSize(value, w - pad * 2);
      for (const vl of valLines.slice(0, 2)) { d.text(vl, x + pad, cy); cy += 20; }

      // Body (optional)
      if (body) {
        cy += 16; // Extra spacing below bold heading
        d.setFont('times', 'normal'); d.setFontSize(9.5);
        d.setTextColor(...MUTED);
        const bLines: string[] = d.splitTextToSize(body, w - pad * 2);
        for (const bl of bLines.slice(0, 3)) { d.text(bl, x + pad, cy); cy += 13; }
      }

      d.setDrawColor(...RULE); d.setLineWidth(0.3);
      d.roundedRect(x, yStart, w, h, 4, 4, 'S');

      return cy;
    },
  };

  return ctx;
}

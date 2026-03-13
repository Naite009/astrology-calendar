import jsPDF from 'jspdf';

type Color = [number, number, number];

export interface PDFContext {
  y: number;
  pw: number;
  ph: number;
  margin: number;
  contentW: number;
  colors: {
    gold: Color;
    darkText: Color;
    bodyText: Color;
    dimText: Color;
    warmBorder: Color;
    creamBg: Color;
    softGold: Color;
    deepBrown: Color;
    softBlue: Color;
    accentGreen: Color;
    accentRust: Color;
  };
  /** Maps section title (uppercase) → page number (1-indexed) for clickable TOC */
  sectionPages: Map<string, number>;
  checkPage: (needed: number) => void;
  sectionTitle: (doc: jsPDF, title: string) => void;
  writeBody: (doc: jsPDF, text: string, color?: Color, size?: number, lineH?: number) => void;
  writeBold: (doc: jsPDF, text: string, color?: Color, size?: number) => void;
  writeLabel: (doc: jsPDF, label: string, value: string, labelColor?: Color, valueColor?: Color) => void;
  drawCard: (doc: jsPDF, renderContent: () => void, accentColor?: Color) => void;
  writeCardSection: (doc: jsPDF, label: string, text: string, labelColor?: Color) => void;
  drawContentBox: (doc: jsPDF, x: number, yStart: number, w: number, h: number, bg?: Color) => void;
  drawGoldRule: (doc: jsPDF) => void;
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

export function createPDFContext(doc: jsPDF, pw: number, ph: number, margin: number, contentW: number, overrides?: ColorOverrides): PDFContext {
  const colors = {
    gold: overrides?.gold || [162, 128, 72] as Color,
    darkText: [30, 28, 26] as Color,
    bodyText: [55, 50, 45] as Color,
    dimText: [120, 112, 105] as Color,
    warmBorder: overrides?.warmBorder || [210, 200, 185] as Color,
    creamBg: overrides?.creamBg || [250, 247, 242] as Color,
    softGold: overrides?.softGold || [245, 238, 225] as Color,
    deepBrown: overrides?.deepBrown || [90, 70, 45] as Color,
    softBlue: overrides?.softBlue || [230, 240, 250] as Color,
    accentGreen: overrides?.accentGreen || [34, 120, 80] as Color,
    accentRust: overrides?.accentRust || [160, 90, 50] as Color,
  };

  const sectionPages = new Map<string, number>();

  const ctx: PDFContext = {
    y: margin,
    pw, ph, margin, contentW, colors,
    sectionPages,

    checkPage(needed: number) {
      if (ctx.y + needed > ph - 55) { doc.addPage(); ctx.y = margin; }
    },

    drawGoldRule(d: jsPDF) {
      d.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]); d.setLineWidth(1.5);
      d.line(margin, ctx.y, pw - margin, ctx.y);
    },

    sectionTitle(d: jsPDF, title: string) {
      ctx.checkPage(120);
      // Record page number for this section (for clickable TOC)
      const pageNum = d.getNumberOfPages();
      sectionPages.set(title.toUpperCase(), pageNum);
      ctx.y += 24; ctx.drawGoldRule(d); ctx.y += 20;
      d.setFont('helvetica', 'bold'); d.setFontSize(14);
      d.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
      d.text(title.toUpperCase(), margin, ctx.y); ctx.y += 20;
    },

    writeBody(d: jsPDF, text: string, color: Color = colors.bodyText, size = 10, lineH = 15) {
      d.setFont('helvetica', 'normal'); d.setFontSize(size);
      d.setTextColor(color[0], color[1], color[2]);
      const lines: string[] = d.splitTextToSize(text, contentW - 16);
      for (const line of lines) { ctx.checkPage(lineH); d.text(line, margin + 8, ctx.y); ctx.y += lineH; }
    },

    writeBold(d: jsPDF, text: string, color: Color = colors.darkText, size = 11) {
      d.setFont('helvetica', 'bold'); d.setFontSize(size);
      d.setTextColor(color[0], color[1], color[2]);
      const lines: string[] = d.splitTextToSize(text, contentW - 16);
      for (const line of lines) { ctx.checkPage(16); d.text(line, margin + 8, ctx.y); ctx.y += 15; }
    },

    writeLabel(d: jsPDF, label: string, value: string, labelColor: Color = colors.dimText, valueColor: Color = colors.darkText) {
      ctx.checkPage(16);
      d.setFont('helvetica', 'normal'); d.setFontSize(9);
      d.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
      d.text(label, margin + 8, ctx.y);
      const labelW = d.getTextWidth(label);
      d.setFont('helvetica', 'bold'); d.setFontSize(10.5);
      d.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
      d.text(value, margin + 8 + labelW + 6, ctx.y); ctx.y += 16;
    },

    drawCard(d: jsPDF, renderContent: () => void, accentColor: Color = colors.gold) {
      const startPage = d.getNumberOfPages();
      const cardStartY = ctx.y; ctx.y += 14;
      renderContent(); ctx.y += 12;
      const endPage = d.getNumberOfPages();
      
      if (endPage === startPage) {
        // Normal case: card fits on one page
        const cardH = ctx.y - cardStartY;
        d.setDrawColor(colors.warmBorder[0], colors.warmBorder[1], colors.warmBorder[2]); d.setLineWidth(0.5);
        d.roundedRect(margin, cardStartY, contentW, cardH, 6, 6, 'S');
        d.setDrawColor(accentColor[0], accentColor[1], accentColor[2]); d.setLineWidth(3);
        d.line(margin + 1.5, cardStartY + 1, margin + 1.5, cardStartY + cardH - 1);
      } else {
        // Card spans pages — draw border on each page segment
        // First page: from cardStartY to bottom
        d.setPage(startPage);
        const firstPageBottom = ph - 40;
        const firstH = firstPageBottom - cardStartY;
        d.setDrawColor(colors.warmBorder[0], colors.warmBorder[1], colors.warmBorder[2]); d.setLineWidth(0.5);
        d.roundedRect(margin, cardStartY, contentW, firstH, 6, 6, 'S');
        d.setDrawColor(accentColor[0], accentColor[1], accentColor[2]); d.setLineWidth(3);
        d.line(margin + 1.5, cardStartY + 1, margin + 1.5, cardStartY + firstH - 1);
        
        // Last page: from top margin to ctx.y
        d.setPage(endPage);
        const lastH = ctx.y - margin;
        d.setDrawColor(colors.warmBorder[0], colors.warmBorder[1], colors.warmBorder[2]); d.setLineWidth(0.5);
        d.roundedRect(margin, margin, contentW, lastH, 6, 6, 'S');
        d.setDrawColor(accentColor[0], accentColor[1], accentColor[2]); d.setLineWidth(3);
        d.line(margin + 1.5, margin + 1, margin + 1.5, margin + lastH - 1);
      }
      ctx.y += 8;
    },

    writeCardSection(d: jsPDF, label: string, text: string, labelColor: Color = colors.accentGreen) {
      ctx.writeBold(d, label, labelColor, 9.5); ctx.writeBody(d, text, colors.bodyText, 9.5); ctx.y += 4;
    },

    drawContentBox(d: jsPDF, x: number, yStart: number, w: number, h: number, bg: Color = colors.creamBg) {
      d.setFillColor(bg[0], bg[1], bg[2]);
      d.setDrawColor(colors.warmBorder[0], colors.warmBorder[1], colors.warmBorder[2]);
      d.setLineWidth(0.5);
      d.roundedRect(x, yStart, w, h, 6, 6, 'FD');
    },
  };

  return ctx;
}

import jsPDF from 'jspdf';
import { SignColorTheme } from './signColorThemes';

type Color = [number, number, number];

// ─── EDITORIAL PALETTE ──────────────────────────────────────────────
const CREAM:  Color = [250, 247, 242];
const INK:    Color = [18,  16,  14];
const MUTED:  Color = [130, 125, 118];
const ACCENT: Color = [90,  80,  68];
const RULE:   Color = [200, 195, 188];
const DARK:   Color = [38,  34,  30];

export interface PDFContext {
  y: number;
  pw: number;
  ph: number;
  margin: number;
  contentW: number;
  colors: {
    cream: Color;
    ink: Color;
    muted: Color;
    accent: Color;
    rule: Color;
    dark: Color;
    // Legacy aliases kept for backward compat
    deep: Color;
    purple: Color;
    gold: Color;
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
  /** Tracked caps label — editorial style */
  trackedLabel: (doc: jsPDF, text: string, x: number, y: number, opts?: { align?: 'left' | 'center' | 'right'; size?: number; charSpace?: number }) => void;
  /** Cream page background */
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
  // All themes now map to the editorial palette
  const colors = {
    cream: CREAM,
    ink: INK,
    muted: MUTED,
    accent: ACCENT,
    rule: RULE,
    dark: DARK,
    // Legacy aliases — all mapped to editorial equivalents
    deep: INK,
    purple: ACCENT,
    gold: ACCENT,
    lilac: MUTED,
    rust: DARK,
    warm: CREAM,
    border: RULE,
    dimText: MUTED,
    bodyText: INK,
    darkText: INK,
    softGold: CREAM,
    deepBrown: DARK,
    warmBorder: RULE,
    creamBg: CREAM,
    softBlue: CREAM,
    accentGreen: ACCENT,
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
      d.setFont('times', 'normal'); d.setFontSize(size);
      d.setTextColor(...MUTED);
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

      // Tracked caps section label
      const numStr = String(ctx.sectionNum).padStart(2, '0');
      const labelText = `${numStr} · ${title.toUpperCase()}`;
      ctx.trackedLabel(d, labelText, margin, ctx.y);

      if (subtitle) {
        d.setFont('times', 'italic'); d.setFontSize(8);
        d.setTextColor(...MUTED);
        d.text(subtitle, pw - margin, ctx.y, { align: 'right' });
      }

      ctx.y += 8;
      d.setDrawColor(...RULE); d.setLineWidth(0.3);
      d.line(margin, ctx.y, pw - margin, ctx.y);
      ctx.y += 16;
    },

    writeBody(d: jsPDF, text: string, _color: Color = INK, size = 10, lineH = 15) {
      d.setFont('times', 'normal'); d.setFontSize(size);
      d.setTextColor(...INK);
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
        doc.addPage(); ctx.y = margin; ctx.pageBg(doc);
        for (const line of lines) { d.text(line, margin + 8, ctx.y); ctx.y += lineH; }
        return;
      }
      for (let i = 0; i < linesFit; i++) { d.text(lines[i], margin + 8, ctx.y); ctx.y += lineH; }
      doc.addPage(); ctx.y = margin; ctx.pageBg(doc);
      for (let i = linesFit; i < lines.length; i++) { d.text(lines[i], margin + 8, ctx.y); ctx.y += lineH; }
    },

    writeBold(d: jsPDF, text: string, _color: Color = INK, size = 11) {
      d.setFont('times', 'bold'); d.setFontSize(size);
      d.setTextColor(...INK);
      const lines: string[] = d.splitTextToSize(text, contentW - 28);
      const totalH = lines.length * 15;
      if (ctx.y + totalH > ph - 55) { doc.addPage(); ctx.y = margin; ctx.pageBg(doc); }
      for (const line of lines) { d.text(line, margin + 8, ctx.y); ctx.y += 15; }
      ctx.y += 4;
    },

    writeLabel(d: jsPDF, label: string, value: string, _labelColor: Color = MUTED, _valueColor: Color = INK) {
      ctx.checkPage(16);
      d.setFont('times', 'normal'); d.setFontSize(9);
      d.setTextColor(...MUTED);
      d.text(label, margin + 8, ctx.y);
      const labelW = d.getTextWidth(label);
      d.setFont('times', 'bold'); d.setFontSize(10.5);
      d.setTextColor(...INK);
      d.text(value, margin + 8 + labelW + 6, ctx.y); ctx.y += 16;
    },

    drawCard(d: jsPDF, renderContent: () => void, _accentColor: Color = ACCENT) {
      // Editorial: no card borders, just content with hairline rule after
      const startY = ctx.y;
      ctx.y += 8;
      renderContent();
      ctx.y += 8;
      // Hairline rule below
      d.setDrawColor(...RULE); d.setLineWidth(0.25);
      d.line(margin, ctx.y, pw - margin, ctx.y);
      ctx.y += 8;
    },

    writeCardSection(d: jsPDF, label: string, text: string, _labelColor: Color = MUTED) {
      // Tracked caps label + body
      ctx.trackedLabel(d, label.toUpperCase(), margin + 8, ctx.y, { size: 7, charSpace: 3 });
      ctx.y += 10;
      ctx.writeBody(d, text, INK, 9.5);
      ctx.y += 6;
    },

    drawContentBox(_d: jsPDF, _x: number, _yStart: number, _w: number, _h: number, _bg: Color = CREAM) {
      // No-op in editorial design — no filled boxes
    },
  };

  return ctx;
}

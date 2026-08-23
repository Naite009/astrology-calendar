/**
 * Shared jsPDF document engine for client-ready reading exports.
 * Provides the page geometry, palette, layout primitives (eyebrow, title,
 * body, bullets, measured boxes) and the cover page used by every
 * reading export in the app.
 */

import jsPDF from "jspdf";

export interface BoxBlock {
  p?: string;
  italic?: boolean;
  list?: string[];
}

export const PAGE_W = 210;
export const PAGE_H = 297;
export const MARGIN = 22;
export const CONTENT_W = PAGE_W - MARGIN * 2;

export const C = {
  gold: [160, 130, 60] as [number, number, number],
  heading: [38, 36, 42] as [number, number, number],
  body: [58, 56, 62] as [number, number, number],
  muted: [132, 128, 138] as [number, number, number],
  card: [249, 247, 242] as [number, number, number],
  cardBorder: [223, 216, 202] as [number, number, number],
  soft: [252, 249, 240] as [number, number, number],
};

export interface ExportMeta {
  name: string;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
}

export const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "reading";

export const today = () => new Date().toISOString().slice(0, 10);

export function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export class Doc {
  d: jsPDF;
  y = MARGIN;

  constructor() {
    this.d = new jsPDF({ unit: "mm", format: "a4" });
  }

  need(h: number) {
    if (this.y + h > PAGE_H - MARGIN) {
      this.d.addPage();
      this.y = MARGIN;
    }
  }

  newPage() {
    this.d.addPage();
    this.y = MARGIN;
  }

  rule() {
    this.d.setDrawColor(...C.cardBorder);
    this.d.setLineWidth(0.3);
    this.d.line(MARGIN, this.y, PAGE_W - MARGIN, this.y);
    this.y += 6;
  }

  eyebrow(text: string) {
    this.y += 2;
    this.need(10);
    this.d.setFont("helvetica", "bold");
    this.d.setFontSize(7.5);
    this.d.setTextColor(...C.gold);
    this.d.text(text.toUpperCase(), MARGIN, this.y, { charSpace: 0.7 });
    this.y += 6;
  }

  title(text: string, size = 17) {
    this.need(size * 0.7 + 6);
    this.d.setFont("times", "normal");
    this.d.setFontSize(size);
    this.d.setTextColor(...C.heading);
    const lines = this.d.splitTextToSize(text, CONTENT_W);
    lines.forEach((ln: string) => {
      this.need(size * 0.55);
      this.d.text(ln, MARGIN, this.y);
      this.y += size * 0.55;
    });
    this.y += 3;
  }

  sub(text: string) {
    if (!text) return;
    this.d.setFont("helvetica", "italic");
    this.d.setFontSize(8.5);
    this.d.setTextColor(...C.muted);
    const lines = this.d.splitTextToSize(text, CONTENT_W);
    lines.forEach((ln: string) => {
      this.need(5);
      this.d.text(ln, MARGIN, this.y);
      this.y += 4.4;
    });
    this.y += 3;
  }

  body(text: string, size = 10) {
    this.d.setFont("helvetica", "normal");
    this.d.setFontSize(size);
    this.d.setTextColor(...C.body);
    const paragraphs = String(text || "").split(/\n{2,}/);
    paragraphs.forEach((para, pi) => {
      const lines = this.d.splitTextToSize(para.replace(/\n/g, " ").trim(), CONTENT_W);
      lines.forEach((ln: string) => {
        this.need(6);
        this.d.text(ln, MARGIN, this.y);
        this.y += size * 0.52;
      });
      if (pi < paragraphs.length - 1) this.y += 3;
    });
    this.y += 3;
  }

  bullets(items: string[], marker = "\u2022") {
    this.d.setFont("helvetica", "normal");
    this.d.setFontSize(9.5);
    items.filter(Boolean).forEach((item) => {
      const lines = this.d.splitTextToSize(String(item).replace(/^[-\u2022\u2713\u2726\u2192]\s*/, ""), CONTENT_W - 6);
      lines.forEach((ln: string, i: number) => {
        this.need(6);
        this.d.setTextColor(...C.gold);
        if (i === 0) this.d.text(marker, MARGIN, this.y);
        this.d.setTextColor(...C.body);
        this.d.text(ln, MARGIN + 5, this.y);
        this.y += 5;
      });
      this.y += 1.5;
    });
    this.y += 2;
  }

  /**
   * Two-column key/value rows, used for placement tables.
   */
  rows(items: Array<{ key: string; sub?: string; value: string }>) {
    const keyW = 42;
    items.forEach((item) => {
      this.d.setFont("helvetica", "normal");
      this.d.setFontSize(9.5);
      const valueLines: string[] = this.d.splitTextToSize(item.value || "", CONTENT_W - keyW - 4);
      const blockH = Math.max(valueLines.length * 5, item.sub ? 9 : 5) + 3;
      this.need(blockH);
      const top = this.y;

      this.d.setFont("helvetica", "bold");
      this.d.setFontSize(9.5);
      this.d.setTextColor(...C.heading);
      this.d.text(item.key, MARGIN, top);
      if (item.sub) {
        this.d.setFont("helvetica", "normal");
        this.d.setFontSize(7.5);
        this.d.setTextColor(...C.muted);
        this.d.text(item.sub, MARGIN, top + 4);
      }

      this.d.setFont("helvetica", "normal");
      this.d.setFontSize(9.5);
      this.d.setTextColor(...C.body);
      valueLines.forEach((ln, i) => {
        this.d.text(ln, MARGIN + keyW, top + i * 5);
      });

      this.y = top + blockH;
    });
    this.y += 2;
  }

  /**
   * Boxed card. Measured before drawing, so a card never splits across a
   * page break and the frame is always the right size.
   */
  box(label: string, blocks: BoxBlock[], tint = C.card) {
    const pad = 5;
    const innerLeft = MARGIN + pad;
    const innerW = CONTENT_W - pad * 2;

    type Line = { text: string; x: number; italic: boolean; bullet: boolean; gap: number };
    const lines: Line[] = [];

    const measureParagraph = (text: string, italic: boolean) => {
      this.d.setFont("helvetica", italic ? "italic" : "normal");
      this.d.setFontSize(italic ? 8.5 : 9.5);
      const paras = String(text || "").split(/\n{2,}/).filter((p) => p.trim());
      paras.forEach((para, pi) => {
        const wrapped: string[] = this.d.splitTextToSize(para.replace(/\n/g, " ").trim(), innerW);
        wrapped.forEach((ln, li) => {
          lines.push({
            text: ln,
            x: innerLeft,
            italic,
            bullet: false,
            gap: li === wrapped.length - 1 && pi < paras.length - 1 ? 2.5 : 0,
          });
        });
      });
    };

    blocks.forEach((block) => {
      if (block.p !== undefined) measureParagraph(block.p, Boolean(block.italic));
      if (block.list) {
        this.d.setFont("helvetica", "normal");
        this.d.setFontSize(9.5);
        block.list.filter(Boolean).forEach((item) => {
          const wrapped: string[] = this.d.splitTextToSize(
            String(item).replace(/^[-\u2022\u2713]\s*/, ""),
            innerW - 5,
          );
          wrapped.forEach((ln, li) => {
            lines.push({
              text: ln,
              x: innerLeft + 4.5,
              italic: false,
              bullet: li === 0,
              gap: li === wrapped.length - 1 ? 1 : 0,
            });
          });
        });
      }
    });

    const lineH = (l: Line) => (l.italic ? 4.4 : 5) + l.gap;
    const contentH = lines.reduce((sum, l) => sum + lineH(l), 0);
    const labelH = label ? 9.5 : 0;
    const boxH = pad * 2 + labelH + contentH;

    // Keep the whole card together when it fits on a page by itself.
    if (this.y + boxH > PAGE_H - MARGIN && boxH <= PAGE_H - MARGIN * 2) {
      this.newPage();
    }

    const top = this.y;
    this.d.setDrawColor(...C.cardBorder);
    this.d.setLineWidth(0.3);
    this.d.setFillColor(...tint);
    this.d.rect(MARGIN, top, CONTENT_W, Math.min(boxH, PAGE_H - MARGIN - top), "S");

    this.y = top + pad + 3;
    if (label) {
      this.d.setFont("helvetica", "bold");
      this.d.setFontSize(7.5);
      this.d.setTextColor(...C.gold);
      this.d.text(label.toUpperCase(), innerLeft, this.y, { charSpace: 0.7 });
      this.y += labelH;
    }

    lines.forEach((l) => {
      this.need(6);
      if (l.bullet) {
        this.d.setFont("helvetica", "normal");
        this.d.setFontSize(9.5);
        this.d.setTextColor(...C.gold);
        this.d.text("\u2022", innerLeft, this.y);
      }
      this.d.setFont("helvetica", l.italic ? "italic" : "normal");
      this.d.setFontSize(l.italic ? 8.5 : 9.5);
      this.d.setTextColor(...(l.italic ? C.muted : C.body));
      this.d.text(l.text, l.x, this.y);
      this.y += lineH(l);
    });

    this.y = top + boxH + 6;
    if (this.y > PAGE_H - MARGIN) this.newPage();
  }

  footers(name: string, documentLabel: string) {
    const total = this.d.getNumberOfPages();
    for (let p = 2; p <= total; p++) {
      this.d.setPage(p);
      this.d.setFont("helvetica", "normal");
      this.d.setFontSize(7.5);
      this.d.setTextColor(...C.muted);
      this.d.text(`${name} \u00b7 ${documentLabel}`, MARGIN, PAGE_H - 12);
      this.d.text(`${p - 1}`, PAGE_W - MARGIN, PAGE_H - 12, { align: "right" });
    }
  }
}

/** Renders the cover page and advances to a fresh content page. */
export function cover(doc: Doc, meta: ExportMeta, kicker: string, subtitle: string) {
  const d = doc.d;
  d.setFillColor(...C.soft);
  d.rect(0, 0, PAGE_W, PAGE_H, "F");
  d.setDrawColor(...C.gold);
  d.setLineWidth(0.5);
  d.rect(14, 14, PAGE_W - 28, PAGE_H - 28, "S");

  d.setFont("helvetica", "bold");
  d.setFontSize(8);
  d.setTextColor(...C.gold);
  d.text(kicker.toUpperCase(), PAGE_W / 2, 74, { align: "center", charSpace: 1.4 });

  d.setFont("times", "normal");
  d.setFontSize(30);
  d.setTextColor(...C.heading);
  d.text(meta.name, PAGE_W / 2, 100, { align: "center" });

  d.setDrawColor(...C.gold);
  d.setLineWidth(0.4);
  d.line(PAGE_W / 2 - 22, 110, PAGE_W / 2 + 22, 110);

  d.setFont("helvetica", "italic");
  d.setFontSize(11);
  d.setTextColor(...C.body);
  d.splitTextToSize(subtitle, CONTENT_W - 30).forEach((ln: string, i: number) => {
    d.text(ln, PAGE_W / 2, 124 + i * 6, { align: "center" });
  });

  const birth = [meta.birthDate, meta.birthTime, meta.birthLocation].filter(Boolean).join("  \u00b7  ");
  if (birth) {
    d.setFont("helvetica", "normal");
    d.setFontSize(9);
    d.setTextColor(...C.muted);
    d.text(birth, PAGE_W / 2, 168, { align: "center" });
  }

  d.setFontSize(8);
  d.setTextColor(...C.muted);
  d.text("Reflective, not predictive. Prepared " + today(), PAGE_W / 2, PAGE_H - 34, { align: "center" });

  doc.newPage();
}

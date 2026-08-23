/**
 * Soul Agreements export: per-section and full-reading PDF + JSON.
 * Designed as a client-ready document: cover page, contents, one
 * section per spread, strength-based contract at the close.
 */

import jsPDF from "jspdf";
import type { StrengthContract } from "@/lib/soulStrengthContract";

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 22;
const CONTENT_W = PAGE_W - MARGIN * 2;

const C = {
  gold: [160, 130, 60] as [number, number, number],
  heading: [38, 36, 42] as [number, number, number],
  body: [58, 56, 62] as [number, number, number],
  muted: [132, 128, 138] as [number, number, number],
  card: [249, 247, 242] as [number, number, number],
  cardBorder: [223, 216, 202] as [number, number, number],
  soft: [252, 249, 240] as [number, number, number],
};

export interface ExportSection {
  key: string;
  label: string;
  sub: string;
  interpretation: string;
  question: string;
}

export interface ExportSummary {
  whatToPractice: string;
  whatToWatchFor: string;
  whatToBuild: string;
  whatToGive: string;
  integration?: string;
  growthSigns?: string[];
}

export interface ExportMeta {
  name: string;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
}

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "reading";

const today = () => new Date().toISOString().slice(0, 10);

/* ─────────────────────────── layout helpers ─────────────────────────── */

class Doc {
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

  bullets(items: string[]) {
    this.d.setFont("helvetica", "normal");
    this.d.setFontSize(9.5);
    items.filter(Boolean).forEach((item) => {
      const lines = this.d.splitTextToSize(String(item).replace(/^[-•✓]\s*/, ""), CONTENT_W - 6);
      lines.forEach((ln: string, i: number) => {
        this.need(6);
        this.d.setTextColor(...C.gold);
        if (i === 0) this.d.text("•", MARGIN, this.y);
        this.d.setTextColor(...C.body);
        this.d.text(ln, MARGIN + 5, this.y);
        this.y += 5;
      });
      this.y += 1.5;
    });
    this.y += 2;
  }

  /** Boxed block. Renders content via callback with padded width. */
  box(label: string, render: (write: (t: string) => void, list: (i: string[]) => void) => void, tint = C.card) {
    const startPage = this.d.getNumberOfPages();
    const top = this.y;
    // Measure by rendering to a buffer of strings first is complex; instead
    // render content, then draw the frame behind it on the same page when the
    // block did not break across pages.
    const pad = 5;
    this.y += pad + (label ? 9.5 : 0);
    const innerLeft = MARGIN + pad;
    const innerW = CONTENT_W - pad * 2;

    const write = (t: string) => {
      this.d.setFont("helvetica", "normal");
      this.d.setFontSize(9.5);
      this.d.setTextColor(...C.body);
      String(t || "").split(/\n{2,}/).forEach((para, pi, arr) => {
        const lines = this.d.splitTextToSize(para.replace(/\n/g, " ").trim(), innerW);
        lines.forEach((ln: string) => {
          this.need(6);
          this.d.text(ln, innerLeft, this.y);
          this.y += 5;
        });
        if (pi < arr.length - 1) this.y += 2.5;
      });
    };
    const list = (items: string[]) => {
      this.d.setFont("helvetica", "normal");
      this.d.setFontSize(9.5);
      items.filter(Boolean).forEach((item) => {
        const lines = this.d.splitTextToSize(String(item).replace(/^[-•✓]\s*/, ""), innerW - 5);
        lines.forEach((ln: string, i: number) => {
          this.need(6);
          this.d.setTextColor(...C.gold);
          if (i === 0) this.d.text("•", innerLeft, this.y);
          this.d.setTextColor(...C.body);
          this.d.text(ln, innerLeft + 4.5, this.y);
          this.y += 5;
        });
        this.y += 1;
      });
      this.y += 1;
    };

    render(write, list);
    const bottom = this.y + pad;

    if (this.d.getNumberOfPages() === startPage) {
      // Draw frame behind the already-written text.
      this.d.setFillColor(...tint);
      this.d.setDrawColor(...C.cardBorder);
      this.d.setLineWidth(0.3);
      this.d.rect(MARGIN, top, CONTENT_W, bottom - top, "S");
      if (label) {
        this.d.setFont("helvetica", "bold");
        this.d.setFontSize(7.5);
        this.d.setTextColor(...C.gold);
        this.d.text(label.toUpperCase(), innerLeft, top + pad + 3, { charSpace: 0.7 });
      }
    } else if (label) {
      // Block broke across pages: keep the label inline, skip the frame.
      this.d.setFont("helvetica", "bold");
      this.d.setFontSize(7.5);
      this.d.setTextColor(...C.gold);
      this.d.text(label.toUpperCase(), MARGIN, top + 4, { charSpace: 0.7 });
    }
    this.y = bottom + 6;
  }

  footers(name: string) {
    const total = this.d.getNumberOfPages();
    for (let p = 2; p <= total; p++) {
      this.d.setPage(p);
      this.d.setFont("helvetica", "normal");
      this.d.setFontSize(7.5);
      this.d.setTextColor(...C.muted);
      this.d.text(`${name} · Soul Agreements`, MARGIN, PAGE_H - 12);
      if (p > 1) this.d.text(`${p - 1}`, PAGE_W - MARGIN, PAGE_H - 12, { align: "right" });
    }
  }
}

function cover(doc: Doc, meta: ExportMeta, subtitle: string) {
  const d = doc.d;
  d.setFillColor(...C.soft);
  d.rect(0, 0, PAGE_W, PAGE_H, "F");
  d.setDrawColor(...C.gold);
  d.setLineWidth(0.5);
  d.rect(14, 14, PAGE_W - 28, PAGE_H - 28, "S");

  d.setFont("helvetica", "bold");
  d.setFontSize(8);
  d.setTextColor(...C.gold);
  d.text("SOUL AGREEMENTS", PAGE_W / 2, 74, { align: "center", charSpace: 1.4 });

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

  const birth = [meta.birthDate, meta.birthTime, meta.birthLocation].filter(Boolean).join("  ·  ");
  if (birth) {
    d.setFont("helvetica", "normal");
    d.setFontSize(9);
    d.setTextColor(...C.muted);
    d.text(birth, PAGE_W / 2, 168, { align: "center" });
  }

  d.setFontSize(8);
  d.setTextColor(...C.muted);
  d.text("Reflective, not predictive. Prepared " + today(), PAGE_W / 2, PAGE_H - 34, { align: "center" });

  d.addPage();
  doc.y = MARGIN;
}

function renderSection(doc: Doc, s: ExportSection) {
  doc.eyebrow(s.label);
  doc.title(s.sub, 14);
  doc.rule();
  doc.body(s.interpretation);
  if (s.question?.trim()) {
    doc.box("Recognition Check", (write) => write(s.question.replace(/\n+/g, "\n\n")));
  }
}

function renderContract(doc: Doc, contract: StrengthContract) {
  doc.eyebrow("Strength-Based Contract");
  doc.title("What already works in you, and how to use it on purpose", 14);
  doc.rule();
  doc.body(contract.coreStrength);

  contract.strengths.forEach((st) => {
    doc.box(st.title, (write) => {
      write(st.plain);
      doc.d.setFont("helvetica", "italic");
      doc.d.setFontSize(8.5);
      doc.d.setTextColor(...C.muted);
      doc.d.splitTextToSize(st.chartReason, CONTENT_W - 10).forEach((ln: string) => {
        doc.need(6);
        doc.d.text(ln, MARGIN + 5, doc.y);
        doc.y += 4.4;
      });
      doc.y += 1;
    });
  });

  doc.eyebrow("How to use it");
  doc.bullets(contract.howToUse);
  doc.eyebrow("What it costs when it runs unchecked");
  doc.body(contract.costWhenOverused);
  doc.box("The Commitment", (write) => write(contract.commitment), C.soft);
}

function renderSummary(doc: Doc, summary: ExportSummary) {
  doc.eyebrow("Soul Contract Summary");
  doc.title("The reading in four lines", 14);
  doc.rule();
  doc.box("", (write) => {
    write(`What to practice: ${summary.whatToPractice}`);
    write(`What to watch for: ${summary.whatToWatchFor}`);
    write(`What to build: ${summary.whatToBuild}`);
    write(`What to give: ${summary.whatToGive}`);
  });
  if (summary.integration) doc.body(summary.integration);
  if (summary.growthSigns?.length) {
    doc.eyebrow("How to know you're growing");
    doc.bullets(summary.growthSigns);
  }
}

/* ─────────────────────────── public API ─────────────────────────── */

export function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSectionPdf(meta: ExportMeta, section: ExportSection) {
  const doc = new Doc();
  cover(doc, meta, section.label);
  renderSection(doc, section);
  doc.footers(meta.name);
  doc.d.save(`${slug(meta.name)}-${slug(section.label)}-${today()}.pdf`);
}

export function exportSectionJson(meta: ExportMeta, section: ExportSection) {
  downloadJson(`${slug(meta.name)}-${slug(section.label)}-${today()}.json`, {
    document: "Soul Agreements — single section",
    generatedAt: new Date().toISOString(),
    person: meta,
    section,
  });
}

export function exportContractPdf(meta: ExportMeta, contract: StrengthContract) {
  const doc = new Doc();
  cover(doc, meta, "Strength-Based Contract");
  renderContract(doc, contract);
  doc.footers(meta.name);
  doc.d.save(`${slug(meta.name)}-strength-based-contract-${today()}.pdf`);
}

export function exportContractJson(meta: ExportMeta, contract: StrengthContract) {
  downloadJson(`${slug(meta.name)}-strength-based-contract-${today()}.json`, {
    document: "Strength-Based Contract",
    generatedAt: new Date().toISOString(),
    person: meta,
    contract,
  });
}

/** Builds the full-reading document. Exported for layout testing. */
export function buildFullPdfDoc(
  meta: ExportMeta,
  sections: ExportSection[],
  summary: ExportSummary,
  contract: StrengthContract,
): jsPDF {
  const doc = new Doc();
  cover(doc, meta, "A reflective reading of the long-standing patterns in your chart");

  // Contents
  doc.eyebrow("Contents");
  doc.y += 2;
  const entries = [...sections.map((s) => s.label), "Soul Contract Summary", "Strength-Based Contract"];
  doc.d.setFont("helvetica", "normal");
  doc.d.setFontSize(10);
  entries.forEach((label, i) => {
    doc.need(8);
    doc.d.setTextColor(...C.body);
    doc.d.text(`${i + 1}.  ${label}`, MARGIN, doc.y);
    doc.y += 7;
  });
  doc.y += 4;
  doc.d.setFont("helvetica", "italic");
  doc.d.setFontSize(8.5);
  doc.d.setTextColor(...C.muted);
  doc.d
    .splitTextToSize(
      "Read in order. Family comes first because it is the earliest layer, and the later sections build on it. The order is the story order, not a ranking of importance.",
      CONTENT_W,
    )
    .forEach((ln: string) => {
      doc.d.text(ln, MARGIN, doc.y);
      doc.y += 4.6;
    });

  sections.forEach((s) => {
    doc.d.addPage();
    doc.y = MARGIN;
    renderSection(doc, s);
  });

  doc.d.addPage();
  doc.y = MARGIN;
  renderSummary(doc, summary);

  doc.d.addPage();
  doc.y = MARGIN;
  renderContract(doc, contract);

  doc.footers(meta.name);
  return doc.d;
}

export function exportFullPdf(
  meta: ExportMeta,
  sections: ExportSection[],
  summary: ExportSummary,
  contract: StrengthContract,
) {
  buildFullPdfDoc(meta, sections, summary, contract).save(
    `${slug(meta.name)}-soul-agreements-full-${today()}.pdf`,
  );
}

export function exportFullJson(
  meta: ExportMeta,
  sections: ExportSection[],
  summary: ExportSummary,
  contract: StrengthContract,
) {
  downloadJson(`${slug(meta.name)}-soul-agreements-full-${today()}.json`, {
    document: "Soul Agreements — full reading",
    generatedAt: new Date().toISOString(),
    note: "Section order is story order (Family first, earliest layer), not a ranking of importance.",
    person: meta,
    sections,
    summary,
    strengthContract: contract,
  });
}

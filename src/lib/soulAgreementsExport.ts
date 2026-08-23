/**
 * Soul Agreements export: per-section and full-reading PDF + JSON.
 * Uses the shared document engine in pdfDocEngine.ts.
 */

import jsPDF from "jspdf";
import type { StrengthContract } from "@/lib/soulStrengthContract";
import {
  Doc, cover, C, MARGIN, CONTENT_W, slug, today, downloadJson,
  type ExportMeta,
} from "@/lib/pdfDocEngine";

export type { ExportMeta };

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

export { downloadJson };

const DOC_LABEL = "Soul Agreements";

function renderSection(doc: Doc, s: ExportSection) {
  doc.eyebrow(s.label);
  doc.title(s.sub, 14);
  doc.rule();
  doc.body(s.interpretation);
  if (s.question?.trim()) {
    doc.box("Recognition Check", [{ p: s.question.replace(/\n+/g, "\n\n") }]);
  }
}

function renderContract(doc: Doc, contract: StrengthContract) {
  doc.eyebrow("Strength-Based Contract");
  doc.title("What already works in you, and how to use it on purpose", 14);
  doc.rule();
  doc.body(contract.coreStrength);

  contract.strengths.forEach((st) => {
    doc.box(st.title, [{ p: st.plain }, { p: st.chartReason, italic: true }]);
  });

  doc.eyebrow("How to use it");
  doc.bullets(contract.howToUse);
  doc.eyebrow("What it costs when it runs unchecked");
  doc.body(contract.costWhenOverused);
  doc.box("The Commitment", [{ p: contract.commitment }], C.soft);
}

function renderSummary(doc: Doc, summary: ExportSummary) {
  doc.eyebrow("Soul Contract Summary");
  doc.title("The reading in four lines", 14);
  doc.rule();
  doc.box("", [
    { p: `What to practice: ${summary.whatToPractice}` },
    { p: `What to watch for: ${summary.whatToWatchFor}` },
    { p: `What to build: ${summary.whatToBuild}` },
    { p: `What to give: ${summary.whatToGive}` },
  ]);
  if (summary.integration) doc.body(summary.integration);
  if (summary.growthSigns?.length) {
    doc.eyebrow("How to know you're growing");
    doc.bullets(summary.growthSigns);
  }
}

/* ─────────────────────────── public API ─────────────────────────── */

export function exportSectionPdf(meta: ExportMeta, section: ExportSection) {
  const doc = new Doc();
  cover(doc, meta, DOC_LABEL, section.label);
  renderSection(doc, section);
  doc.footers(meta.name, DOC_LABEL);
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
  cover(doc, meta, DOC_LABEL, "Strength-Based Contract");
  renderContract(doc, contract);
  doc.footers(meta.name, DOC_LABEL);
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
  cover(doc, meta, DOC_LABEL, "A reflective reading of the long-standing patterns in your chart");

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

  doc.newPage();
  renderSummary(doc, summary);

  doc.newPage();
  renderContract(doc, contract);

  doc.footers(meta.name, DOC_LABEL);
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

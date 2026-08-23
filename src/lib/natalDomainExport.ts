/**
 * Natal Portrait domain exports (Relationship Blueprint, Career & Money Map,
 * Emotional Architecture, and the other deep-dive sections).
 * One PDF and one JSON per section, built with the shared document engine.
 */

import { Doc, cover, C, slug, today, downloadJson, type ExportMeta } from "@/lib/pdfDocEngine";
import type { DomainDeepDive } from "@/lib/natalPortraitEngine";

const DOC_LABEL = "Natal Portrait";

const SUBTITLES: Record<string, string> = {
  "Relationship Blueprint": "How you love, who you are drawn to, and what closeness asks of you",
  "Career & Money Map": "What you build, how you earn, and where mastery is slow on purpose",
  "Emotional Architecture": "How your inner weather works and what settles it",
  "Health & Vitality": "Where your energy comes from and how it drains",
  "Shadow & Growth": "The part you avoid, and what changes when you stop",
  "Spiritual & Karmic": "The long arc: what you carry and what you are growing toward",
};

function renderDomain(doc: Doc, domain: DomainDeepDive) {
  doc.eyebrow(domain.title);
  doc.title(SUBTITLES[domain.title] || "A deep dive into this area of your chart", 14);
  doc.rule();
  doc.body(domain.summary);

  if (domain.keyPlanets?.length) {
    doc.eyebrow("Key players");
    doc.rows(
      domain.keyPlanets.map((p) => ({
        key: p.name,
        sub: `${p.sign} \u00b7 House ${p.house}${p.isRetrograde ? " \u00b7 retrograde" : ""}`,
        value: p.role,
      })),
    );
  }

  if (domain.houseActivations?.length) {
    doc.eyebrow("House focus");
    doc.rows(
      domain.houseActivations.map((h) => ({
        key: `House ${h.house}`,
        value: `${h.theme}${h.planets.length ? `  (${h.planets.join(", ")})` : "  (no planets here)"}`,
      })),
    );
  }

  if (domain.strengths?.length) {
    doc.eyebrow("Strengths");
    doc.bullets(domain.strengths);
  }

  if (domain.challenges?.length) {
    doc.eyebrow("Growth areas");
    doc.bullets(domain.challenges);
  }

  if (domain.advice) {
    doc.box("What to do with this", [{ p: domain.advice }], C.soft);
  }
}

export function exportDomainPdf(meta: ExportMeta, domain: DomainDeepDive) {
  const doc = new Doc();
  cover(doc, meta, domain.title, SUBTITLES[domain.title] || "A section of your natal portrait");
  renderDomain(doc, domain);
  doc.footers(meta.name, `${DOC_LABEL} \u00b7 ${domain.title}`);
  doc.d.save(`${slug(meta.name)}-${slug(domain.title)}-${today()}.pdf`);
}

export function exportDomainJson(meta: ExportMeta, domain: DomainDeepDive) {
  downloadJson(`${slug(meta.name)}-${slug(domain.title)}-${today()}.json`, {
    document: `Natal Portrait \u2014 ${domain.title}`,
    generatedAt: new Date().toISOString(),
    person: meta,
    section: domain,
  });
}

/** Full-tab document: every domain deep dive in reading order. */
export function exportPortraitDomainsPdf(meta: ExportMeta, domains: DomainDeepDive[]) {
  const doc = new Doc();
  cover(doc, meta, DOC_LABEL, "Your chart read area by area: love, work, feeling, body, shadow, and the long arc");

  doc.eyebrow("Contents");
  doc.y += 2;
  doc.d.setFont("helvetica", "normal");
  doc.d.setFontSize(10);
  domains.forEach((d, i) => {
    doc.need(8);
    doc.d.setTextColor(...C.body);
    doc.d.text(`${i + 1}.  ${d.title}`, 22, doc.y);
    doc.y += 7;
  });

  domains.forEach((d) => {
    doc.newPage();
    renderDomain(doc, d);
  });

  doc.footers(meta.name, DOC_LABEL);
  doc.d.save(`${slug(meta.name)}-natal-portrait-sections-${today()}.pdf`);
}

export function exportPortraitDomainsJson(meta: ExportMeta, domains: DomainDeepDive[]) {
  downloadJson(`${slug(meta.name)}-natal-portrait-sections-${today()}.json`, {
    document: "Natal Portrait \u2014 all sections",
    generatedAt: new Date().toISOString(),
    person: meta,
    sections: domains,
  });
}

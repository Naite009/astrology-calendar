import jsPDF from "jspdf";
import { NatalChart } from "@/hooks/useNatalChart";
import type { StructuredReading, ReadingSection } from "@/components/AskReadingRenderer";
import { normalizeCity, normalizeSummaryItem, normalizeBullet, isBlank } from "@/lib/normalizeReadingSection";
import { formatLocationTitleCase } from "@/lib/locationFormat";

const COLORS = {
  bg: [255, 255, 255] as [number, number, number],
  card: [248, 246, 242] as [number, number, number],
  cardBorder: [220, 215, 205] as [number, number, number],
  gold: [160, 130, 60] as [number, number, number],
  heading: [40, 40, 45] as [number, number, number],
  body: [55, 55, 60] as [number, number, number],
  muted: [130, 130, 140] as [number, number, number],
  accent: [110, 90, 50] as [number, number, number],
  highlight: [255, 250, 235] as [number, number, number],
  highlightBorder: [210, 190, 130] as [number, number, number],
};

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 22;
const CONTENT_W = PAGE_W - MARGIN * 2;

export function generateAskPdf(chart: NatalChart, readings: StructuredReading[]) {
  // ─────────────────────────────────────────────────────────────────────────
  // FULL PAYLOAD LOGGING — captures the exact JSON used to render every PDF.
  // This is the equivalent of the "request body" you'd see if a remote PDF
  // server existed. The PDF is rendered locally by jsPDF, so this object IS
  // the source of truth for what gets printed on the page.
  // ─────────────────────────────────────────────────────────────────────────
  try {
    // eslint-disable-next-line no-console
    console.groupCollapsed(
      `%c[askPdfExport] PDF payload for ${chart?.name ?? 'unknown'}`,
      'color:#a08232;font-weight:bold;',
    );
    // eslint-disable-next-line no-console
    console.log('chart.name:', chart?.name);
    // eslint-disable-next-line no-console
    console.log('readings count:', readings?.length ?? 0);
    // eslint-disable-next-line no-console
    console.log('FULL readings JSON:', JSON.parse(JSON.stringify(readings)));

    // Surface every timing_section explicitly with its transits/windows so
    // empty-card sources are obvious without expanding the whole tree.
    readings?.forEach((r, ri) => {
      r.sections?.forEach((s: ReadingSection, si: number) => {
        if ((s as { type?: string }).type === 'timing_section') {
          const ts = s as { title: string; transits: unknown[]; windows: unknown[] };
          // eslint-disable-next-line no-console
          console.log(
            `  timing_section [reading ${ri} / section ${si}] "${ts.title}" — ` +
            `${ts.transits?.length ?? 0} transits, ${ts.windows?.length ?? 0} windows`,
            { transits: ts.transits, windows: ts.windows },
          );
          (ts.windows ?? []).forEach((w, wi) => {
            const win = w as { label?: unknown; description?: unknown };
            const labelStr = typeof win.label === 'string' ? win.label : '';
            const descStr = typeof win.description === 'string' ? win.description : '';
            const labelEmpty = !labelStr.trim();
            const descEmpty = !descStr.trim();
            if (labelEmpty || descEmpty) {
              // eslint-disable-next-line no-console
              console.error(
                `    🚨 EMPTY WINDOW at reading[${ri}].sections[${si}].windows[${wi}] — ` +
                `labelEmpty=${labelEmpty}, descEmpty=${descEmpty}`,
                JSON.parse(JSON.stringify(win)),
              );
            }
          });
          (ts.transits ?? []).forEach((t, ti) => {
            const tr = t as { interpretation?: unknown; planet?: unknown; date_range?: unknown };
            const interpStr = typeof tr.interpretation === 'string' ? tr.interpretation : '';
            if (!interpStr.trim()) {
              // eslint-disable-next-line no-console
              console.error(
                `    🚨 EMPTY TRANSIT at reading[${ri}].sections[${si}].transits[${ti}]`,
                JSON.parse(JSON.stringify(tr)),
              );
            }
          });
        }
      });
    });
    // eslint-disable-next-line no-console
    console.groupEnd();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[askPdfExport] payload logging failed', err);
  }

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = 0;
  let pageNum = 0;

  const ensureSpace = (needed: number) => {
    if (y + needed > PAGE_H - 22) {
      addFooter();
      pdf.addPage();
      pageNum++;
      y = MARGIN;
    }
  };

  const addFooter = () => {
    pdf.setDrawColor(...COLORS.cardBorder);
    pdf.setLineWidth(0.3);
    pdf.line(MARGIN, PAGE_H - 16, PAGE_W - MARGIN, PAGE_H - 16);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...COLORS.muted);
    pdf.text(`${chart.name} · Chart Reading`, MARGIN, PAGE_H - 11);
    pdf.text(`Page ${pdf.getNumberOfPages()}`, PAGE_W - MARGIN, PAGE_H - 11, { align: "right" });
  };

  // --- COVER PAGE ---
  pdf.setFillColor(...COLORS.gold);
  pdf.rect(0, 0, PAGE_W, 4, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(32);
  pdf.setTextColor(...COLORS.heading);
  pdf.text("Chart Reading", PAGE_W / 2, 55, { align: "center" });

  pdf.setDrawColor(...COLORS.gold);
  pdf.setLineWidth(0.8);
  pdf.line(PAGE_W / 2 - 30, 62, PAGE_W / 2 + 30, 62);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(...COLORS.accent);
  pdf.text(chart.name || "Natal Chart", PAGE_W / 2, 76, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(...COLORS.body);
  const birthInfo: string[] = [];
  if (chart.birthDate) birthInfo.push(chart.birthDate);
  if (chart.birthTime) birthInfo.push(chart.birthTime);
  if (chart.birthLocation) birthInfo.push(formatLocationTitleCase(chart.birthLocation));
  pdf.text(birthInfo.join("  ·  "), PAGE_W / 2, 88, { align: "center" });

  pdf.setFontSize(9);
  pdf.setTextColor(...COLORS.muted);
  pdf.text(`Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`, PAGE_W / 2, 98, { align: "center" });

  addFooter();

  // --- CONTENT PAGES ---
  for (const reading of readings) {
    for (const section of reading.sections) {
      renderSection(pdf, section);
    }
  }

  function renderSection(pdf: jsPDF, section: ReadingSection) {
    switch (section.type) {
      case "placement_table":
        renderPlacementTable(section);
        break;
      case "narrative_section":
        renderNarrative(section);
        break;
      case "timing_section":
        renderTiming(section);
        break;
      case "summary_box":
        renderSummary(section);
        break;
      case "city_comparison":
        renderCityComparison(section);
        break;
      case "modality_element":
        renderModalityElement(section);
        break;
    }
  }

  function renderPlacementTable(section: { title: string; rows: any[] }) {
    // Only force a new page if the current page already has content. Otherwise
    // we get a blank page (e.g., when the previous section ended exactly at a
    // page break and the cursor is already at the top of a fresh page — the
    // unconditional addPage would then leave the prior page empty except for
    // whatever symbol/divider was last drawn on it).
    if (y > MARGIN) {
      addFooter();
      pdf.addPage();
      pageNum++;
    }
    y = MARGIN;

    // Title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(...COLORS.heading);
    pdf.text(section.title, MARGIN, y);
    y += 3;
    pdf.setDrawColor(...COLORS.gold);
    pdf.setLineWidth(0.5);
    pdf.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 8;

    // Table header
    const colX = [MARGIN, MARGIN + 50, MARGIN + 85, MARGIN + 120, MARGIN + 145];
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(...COLORS.muted);
    pdf.text("Planet", colX[0], y);
    pdf.text("Symbol", colX[1], y);
    pdf.text("Degrees", colX[2], y);
    pdf.text("Sign", colX[3], y);
    pdf.text("House", colX[4], y);
    y += 3;
    pdf.setDrawColor(...COLORS.cardBorder);
    pdf.setLineWidth(0.3);
    pdf.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 5;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    for (const row of section.rows) {
      ensureSpace(7);
      pdf.setTextColor(...COLORS.body);
      pdf.text(row.planet || "", colX[0], y);
      pdf.setTextColor(...COLORS.gold);
      pdf.text(row.symbol || "", colX[1], y);
      pdf.setTextColor(...COLORS.body);
      pdf.text(row.degrees || "", colX[2], y);
      pdf.text(row.sign || "", colX[3], y);
      pdf.text(String(row.house ?? ""), colX[4], y);
      y += 7;
    }
    y += 4;
  }

  function renderNarrative(section: { title: string; subtitle?: string; body: string; bullets: any[] }) {
    // Filter blank bullets up-front using the shared normalizer so the PDF
    // matches the on-screen renderer (which already drops empty bullets).
    const safeBullets = (section.bullets ?? [])
      .map((b) => normalizeBullet(b))
      .filter((b): b is { label?: string; text?: string } => b != null);
    const hasBody = !isBlank(section.body);

    // If the section has nothing meaningful to show, skip it entirely
    // rather than printing an orphan title with empty space below.
    if (!hasBody && safeBullets.length === 0) {
      // eslint-disable-next-line no-console
      console.warn(`[askPdfExport.renderNarrative] skipping empty section "${section.title}"`);
      return;
    }

    ensureSpace(40);
    y += 4;

    // Title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(...COLORS.heading);
    pdf.text(section.title, MARGIN, y);
    y += 6;

    if (section.subtitle) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(...COLORS.muted);
      pdf.text(section.subtitle, MARGIN, y);
      y += 5;
    }

    if (hasBody) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(...COLORS.body);
      const bodyLines = pdf.splitTextToSize(section.body, CONTENT_W);
      for (const line of bodyLines) {
        ensureSpace(6);
        pdf.text(line, MARGIN, y);
        y += 6;
      }
      y += 3;
    }

    for (const bullet of safeBullets) {
      ensureSpace(12);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(...COLORS.accent);
      const label = bullet.label || "Note";
      pdf.text(`${label}:`, MARGIN + 3, y);
      const labelW = pdf.getTextWidth(`${label}: `);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...COLORS.body);
      const bulletLines = pdf.splitTextToSize(bullet.text || "", CONTENT_W - labelW - 6);
      pdf.text(bulletLines[0] || "", MARGIN + 3 + labelW, y);
      y += 6;
      for (let i = 1; i < bulletLines.length; i++) {
        ensureSpace(6);
        pdf.text(bulletLines[i], MARGIN + 6, y);
        y += 6;
      }
    }
    y += 4;
  }
  function renderTiming(section: { title: string; transits: any[]; windows: any[] }) {
    ensureSpace(30);
    y += 4;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(...COLORS.heading);
    pdf.text(section.title, MARGIN, y);
    y += 8;

    // Render-side safety net: drop any transit whose interpretation is empty
    // after trimming. The real fix lives in the data builder, but this
    // guarantees a malformed entry can never produce a blank card on the page.
    const safeTransits = (section.transits ?? []).filter((t) => {
      const interp = typeof t?.interpretation === 'string' ? t.interpretation.trim() : '';
      if (!interp) {
        // eslint-disable-next-line no-console
        console.error('[askPdfExport.renderTiming] DROPPING transit with empty interpretation', t);
        return false;
      }
      return true;
    });

    if (safeTransits.length) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(...COLORS.muted);
      pdf.text("ACTIVE TRANSITS", MARGIN, y);
      y += 6;

      for (const t of safeTransits) {
        ensureSpace(16);
        // Highlighted box
        const interpLines = pdf.splitTextToSize(t.interpretation, CONTENT_W - 12);
        const boxH = 10 + interpLines.length * 5;
        pdf.setFillColor(...COLORS.highlight);
        pdf.setDrawColor(...COLORS.highlightBorder);
        pdf.setLineWidth(0.3);
        pdf.roundedRect(MARGIN, y - 3, CONTENT_W, boxH, 1.5, 1.5, "FD");

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(...COLORS.accent);
        pdf.text(`${t.symbol} ${t.planet}`, MARGIN + 4, y + 2);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(...COLORS.muted);
        pdf.text(t.position, MARGIN + 4 + pdf.getTextWidth(`${t.symbol} ${t.planet}  `), y + 2);

        y += 8;
        pdf.setFontSize(10);
        pdf.setTextColor(...COLORS.body);
        for (const il of interpLines) {
          pdf.text(il, MARGIN + 6, y);
          y += 5;
        }
        y += 4;
      }
    }

    // Same safety net for windows: skip any window where label OR description
    // is empty/whitespace. This is what was producing the "Feb 1 to Oct 17,
    // 2027" blank card on page 11.
    const safeWindows = (section.windows ?? []).filter((w) => {
      const label = typeof w?.label === 'string' ? w.label.trim() : '';
      const desc = typeof w?.description === 'string' ? w.description.trim() : '';
      if (!label || !desc) {
        // eslint-disable-next-line no-console
        console.error(
          `[askPdfExport.renderTiming] DROPPING empty window — labelEmpty=${!label}, descEmpty=${!desc}`,
          w,
        );
        return false;
      }
      return true;
    });

    if (safeWindows.length) {
      ensureSpace(10);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(...COLORS.muted);
      pdf.text("KEY DATES", MARGIN, y);
      y += 6;

      for (const w of safeWindows) {
        // Pre-measure the entire card (label + all wrapped description lines)
        // and reserve space for it as a single unit. Without this, the label
        // can render at the bottom of a page and the description gets pushed
        // to the next page — producing what looks like a "blank card" with
        // only a date range and no body text. This was the actual cause of
        // the "Feb 2 to Oct 18, 2027" empty-card bug, NOT empty data.
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        const dLines = pdf.splitTextToSize(w.description, CONTENT_W - 6);
        const cardHeight = 5 /* label */ + dLines.length * 5 + 3 /* trailing gap */;
        ensureSpace(cardHeight);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(...COLORS.accent);
        pdf.text(w.label, MARGIN + 3, y);
        y += 5;
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...COLORS.body);
        for (const dl of dLines) {
          pdf.text(dl, MARGIN + 6, y);
          y += 5;
        }
        y += 3;
      }
    }
    y += 4;
  }

  function renderSummary(section: { title: string; body?: string; items: any[] }) {
    const safeItems = (section.items ?? [])
      .map((it) => normalizeSummaryItem(it))
      .filter((it): it is { label?: string; value?: string } => it != null);
    const hasBody = !isBlank(section.body);

    if (!hasBody && safeItems.length === 0) {
      console.warn(`[askPdfExport.renderSummary] skipping empty summary "${section.title}"`);
      return;
    }

    ensureSpace(20);
    y += 4;

    const bodyLines = hasBody ? pdf.splitTextToSize(section.body || "", CONTENT_W - 16) : [];
    const itemLines: string[][] = [];
    let totalH = 14 + (hasBody ? bodyLines.length * 5 + 4 : 0);
    for (const item of safeItems) {
      const lines = pdf.splitTextToSize(item.value || "", CONTENT_W - 30);
      itemLines.push(lines);
      totalH += 6 + lines.length * 5 + 2;
    }

    pdf.setFillColor(...COLORS.highlight);
    pdf.setDrawColor(...COLORS.gold);
    pdf.setLineWidth(0.6);
    pdf.roundedRect(MARGIN, y - 2, CONTENT_W, totalH, 2, 2, "FD");
    pdf.setFillColor(...COLORS.gold);
    pdf.rect(MARGIN, y - 2, 3, totalH, "F");

    y += 5;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(...COLORS.heading);
    pdf.text(section.title, MARGIN + 8, y);
    y += 8;

    if (hasBody) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(...COLORS.body);
      for (const line of bodyLines) {
        pdf.text(line, MARGIN + 8, y);
        y += 5;
      }
      y += 2;
    }

    for (let i = 0; i < safeItems.length; i++) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(...COLORS.accent);
      pdf.text(safeItems[i].label || "Note", MARGIN + 8, y);
      y += 5;
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...COLORS.body);
      for (const vl of itemLines[i]) {
        pdf.text(vl, MARGIN + 10, y);
        y += 5;
      }
      y += 2;
    }
    y += 4;
  }

  function renderModalityElement(section: { title: string; body?: string; balance_interpretation?: string; elements?: any[]; modalities?: any[]; polarity?: any[]; dominant_element?: string; dominant_modality?: string; dominant_polarity?: string }) {
    const hasBody = !isBlank(section.body);
    const synthesis = !isBlank(section.balance_interpretation) ? String(section.balance_interpretation) : "";
    const elements = Array.isArray(section.elements) ? section.elements : [];
    const modalities = Array.isArray(section.modalities) ? section.modalities : [];
    const polarity = Array.isArray(section.polarity) ? section.polarity : [];
    const detailLines: string[] = [];

    for (const el of elements) {
      const line = `${el?.name || "Element"}: ${el?.count ?? "–"}${Array.isArray(el?.planets) && el.planets.length ? ` (${el.planets.join(", ")})` : ""}`;
      detailLines.push(line);
      if (!isBlank(el?.interpretation)) detailLines.push(String(el.interpretation));
    }
    for (const mod of modalities) {
      const line = `${mod?.name || "Modality"}: ${mod?.count ?? "–"}${Array.isArray(mod?.planets) && mod.planets.length ? ` (${mod.planets.join(", ")})` : ""}`;
      detailLines.push(line);
      if (!isBlank(mod?.interpretation)) detailLines.push(String(mod.interpretation));
    }
    for (const pol of polarity) {
      const line = `${pol?.name || "Polarity"}: ${pol?.count ?? "–"}${Array.isArray(pol?.planets) && pol.planets.length ? ` (${pol.planets.join(", ")})` : ""}`;
      detailLines.push(line);
      if (!isBlank(pol?.interpretation)) detailLines.push(String(pol.interpretation));
    }

    if (!hasBody && isBlank(synthesis) && detailLines.length === 0) return;

    ensureSpace(28);
    y += 4;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(...COLORS.heading);
    pdf.text(section.title, MARGIN, y);
    y += 6;

    if (hasBody) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(...COLORS.body);
      const bodyLines = pdf.splitTextToSize(section.body || "", CONTENT_W);
      for (const line of bodyLines) {
        ensureSpace(6);
        pdf.text(line, MARGIN, y);
        y += 6;
      }
      y += 2;
    }

    const dominantLine = [section.dominant_element, section.dominant_modality, section.dominant_polarity].filter(Boolean).join(" · ");
    if (!isBlank(dominantLine)) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(...COLORS.accent);
      pdf.text(`Dominant: ${dominantLine}`, MARGIN, y);
      y += 6;
    }

    if (!isBlank(synthesis)) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(...COLORS.body);
      const synthLines = pdf.splitTextToSize(synthesis, CONTENT_W);
      for (const line of synthLines) {
        ensureSpace(5);
        pdf.text(line, MARGIN, y);
        y += 5;
      }
      y += 2;
    }

    for (const entry of detailLines) {
      const isHeading = /^(Fire|Earth|Air|Water|Cardinal|Fixed|Mutable|Yang|Yin|Yang \(Active\)|Yin \(Receptive\)):/i.test(entry);
      pdf.setFont("helvetica", isHeading ? "bold" : "normal");
      pdf.setFontSize(isHeading ? 9.5 : 9);
      pdf.setTextColor(...(isHeading ? COLORS.heading : COLORS.body));
      const lines = pdf.splitTextToSize(entry, CONTENT_W);
      for (const line of lines) {
        ensureSpace(5);
        pdf.text(line, MARGIN, y);
        y += 5;
      }
      y += 1;
    }

    y += 4;
  }
  function renderCityComparison(section: { title: string; cities: any[] }) {
    ensureSpace(30);
    y += 4;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(...COLORS.heading);
    pdf.text(section.title, MARGIN, y);
    y += 8;

    // Run every city through the shared normalizer — same helper the
    // on-screen renderer uses, so a missing AI field produces an
    // identical fallback in both surfaces.
    const safeCities = (section.cities ?? []).map((c) => normalizeCity(c) as any);

    for (const city of safeCities) {
      ensureSpace(20);
      pdf.setFillColor(...COLORS.card);
      pdf.setDrawColor(...COLORS.cardBorder);
      pdf.setLineWidth(0.3);
      const linesLen = Array.isArray(city.lines) ? city.lines.length : 0;
      const cityH = 22 + Math.ceil(linesLen / 3) * 6;
      pdf.roundedRect(MARGIN, y - 3, CONTENT_W, cityH, 1.5, 1.5, "FD");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(...COLORS.heading);
      pdf.text(city.name || "Unnamed city", MARGIN + 4, y + 2);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(...COLORS.gold);
      const scoreLabel = typeof city.score === 'number' ? `${city.score}/10` : '–';
      pdf.text(scoreLabel, PAGE_W - MARGIN - 4, y + 2, { align: "right" });

      y += 7;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(...COLORS.muted);
      // theme is guaranteed non-blank by normalizeCity().
      pdf.text(city.theme || "Overall match", MARGIN + 6, y);
      y += 5;

      if (Array.isArray(city.lines) && city.lines.length > 0) {
        pdf.setTextColor(...COLORS.body);
        pdf.text(city.lines.join("  ·  "), MARGIN + 6, y);
        y += 5;
      }
      y += 5;
    }
    y += 4;
  }
  addFooter();

  // Filename mirrors the JSON export EXACTLY — same slug rules (hyphens, not
  // underscores), same multi-reading label, same full ISO timestamp suffix.
  // JSON pattern (AskView.handleDownloadJson):
  //   <person-slug>_<reading-type>_<YYYY-MM-DD_HH-MM-SSZ>.json
  // PDF must match so the two downloads sit side-by-side in the user's
  // Downloads folder with identical names except for the extension.
  const slug = (s: string) =>
    (s || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const personSlug = slug(chart?.name || "") || "chart";
  const types = Array.from(
    new Set(
      (readings || [])
        .map((r) => slug((r as { question_type?: string })?.question_type || ""))
        .filter(Boolean)
    )
  );
  const typeSlug =
    types.length === 0 ? "reading" : types.length === 1 ? types[0] : "multi-reading";
  const ts = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .replace(/-\d{3}Z$/, "Z"); // 2026-04-21_14-32-05Z
  pdf.save(`${personSlug}_${typeSlug}_${ts}.pdf`);
}

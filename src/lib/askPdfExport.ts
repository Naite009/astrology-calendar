import jsPDF from "jspdf";
import { NatalChart } from "@/hooks/useNatalChart";
import type { StructuredReading, ReadingSection } from "@/components/AskReadingRenderer";

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
  if (chart.birthLocation) birthInfo.push(chart.birthLocation);
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
    }
  }

  function renderPlacementTable(section: { title: string; rows: any[] }) {
    pdf.addPage();
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

    // Body
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

    // Bullets
    for (const bullet of section.bullets) {
      ensureSpace(12);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(...COLORS.accent);
      pdf.text(`${bullet.label}:`, MARGIN + 3, y);
      const labelW = pdf.getTextWidth(`${bullet.label}: `);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...COLORS.body);
      const bulletLines = pdf.splitTextToSize(bullet.text, CONTENT_W - labelW - 6);
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

    if (section.transits?.length) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(...COLORS.muted);
      pdf.text("ACTIVE TRANSITS", MARGIN, y);
      y += 6;

      for (const t of section.transits) {
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

    if (section.windows?.length) {
      ensureSpace(10);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(...COLORS.muted);
      pdf.text("KEY DATES", MARGIN, y);
      y += 6;

      for (const w of section.windows) {
        ensureSpace(10);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(...COLORS.accent);
        pdf.text(w.label, MARGIN + 3, y);
        y += 5;
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...COLORS.body);
        const dLines = pdf.splitTextToSize(w.description, CONTENT_W - 6);
        for (const dl of dLines) {
          ensureSpace(6);
          pdf.text(dl, MARGIN + 6, y);
          y += 5;
        }
        y += 3;
      }
    }
    y += 4;
  }

  function renderSummary(section: { title: string; items: any[] }) {
    ensureSpace(20);
    y += 4;

    // Gold-bordered summary box
    const itemLines: string[][] = [];
    let totalH = 14;
    for (const item of section.items) {
      const lines = pdf.splitTextToSize(item.value, CONTENT_W - 30);
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

    for (let i = 0; i < section.items.length; i++) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(...COLORS.accent);
      pdf.text(section.items[i].label, MARGIN + 8, y);
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

  function renderCityComparison(section: { title: string; cities: any[] }) {
    ensureSpace(30);
    y += 4;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(...COLORS.heading);
    pdf.text(section.title, MARGIN, y);
    y += 8;

    for (const city of section.cities) {
      ensureSpace(20);
      pdf.setFillColor(...COLORS.card);
      pdf.setDrawColor(...COLORS.cardBorder);
      pdf.setLineWidth(0.3);
      const cityH = 22 + Math.ceil(city.lines?.length / 3) * 6;
      pdf.roundedRect(MARGIN, y - 3, CONTENT_W, cityH, 1.5, 1.5, "FD");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(...COLORS.heading);
      pdf.text(city.name, MARGIN + 4, y + 2);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(...COLORS.gold);
      pdf.text(`${city.score}/10`, PAGE_W - MARGIN - 4, y + 2, { align: "right" });

      y += 7;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(...COLORS.muted);
      pdf.text(city.theme || "", MARGIN + 6, y);
      y += 5;

      if (city.lines?.length) {
        pdf.setTextColor(...COLORS.body);
        pdf.text(city.lines.join("  ·  "), MARGIN + 6, y);
        y += 5;
      }
      y += 5;
    }
    y += 4;
  }

  addFooter();
  const safeName = (chart.name || "chart").replace(/[^a-zA-Z0-9]/g, "_");
  pdf.save(`${safeName}_reading_${new Date().toISOString().slice(0, 10)}.pdf`);
}

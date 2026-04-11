import jsPDF from "jspdf";
import { NatalChart } from "@/hooks/useNatalChart";

interface Message {
  role: "user" | "assistant";
  content: string;
}

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

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s*/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/^[-*]\s+/gm, "• ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

// Detect lines that are likely important callouts
function isCalloutLine(line: string): boolean {
  const lower = line.toLowerCase();
  return (
    lower.startsWith("key takeaway") ||
    lower.startsWith("important") ||
    lower.startsWith("note:") ||
    lower.startsWith("bottom line") ||
    lower.startsWith("summary") ||
    lower.startsWith("in short") ||
    lower.startsWith("the core") ||
    lower.startsWith("what this means")
  );
}

export function generateAskPdf(chart: NatalChart, assistantMessages: Message[]) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = 0;

  const ensureSpace = (needed: number) => {
    if (y + needed > PAGE_H - 22) {
      addFooter();
      pdf.addPage();
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
  // Decorative top band
  pdf.setFillColor(...COLORS.gold);
  pdf.rect(0, 0, PAGE_W, 4, "F");

  // Title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(32);
  pdf.setTextColor(...COLORS.heading);
  pdf.text("Chart Reading", PAGE_W / 2, 55, { align: "center" });

  // Decorative line
  pdf.setDrawColor(...COLORS.gold);
  pdf.setLineWidth(0.8);
  pdf.line(PAGE_W / 2 - 30, 62, PAGE_W / 2 + 30, 62);

  // Name
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(...COLORS.accent);
  pdf.text(chart.name || "Natal Chart", PAGE_W / 2, 76, { align: "center" });

  // Birth info
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(...COLORS.body);
  const birthInfo: string[] = [];
  if (chart.birthDate) birthInfo.push(chart.birthDate);
  if (chart.birthTime) birthInfo.push(chart.birthTime);
  if (chart.birthLocation) birthInfo.push(chart.birthLocation);
  pdf.text(birthInfo.join("  ·  "), PAGE_W / 2, 88, { align: "center" });

  // Date
  pdf.setFontSize(9);
  pdf.setTextColor(...COLORS.muted);
  pdf.text(`Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`, PAGE_W / 2, 98, { align: "center" });

  // Key Placements box
  const planets = chart.planets || {};
  const ZODIAC = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const houseCusps = chart.houseCusps || {};
  const cuspLongitudes: number[] = [];
  if (Object.keys(houseCusps).length > 0) {
    for (let i = 1; i <= 12; i++) {
      const cusp = houseCusps[`house${i}` as keyof typeof houseCusps];
      if (cusp && typeof cusp === 'object' && 'sign' in cusp) {
        const c = cusp as { sign: string; degree: number; minutes?: number };
        cuspLongitudes.push(ZODIAC.indexOf(c.sign) * 30 + c.degree + (c.minutes || 0) / 60);
      }
    }
  }
  const calcHouse = (absDeg: number): number | null => {
    if (cuspLongitudes.length !== 12) return null;
    for (let i = 0; i < 12; i++) {
      const nextI = (i + 1) % 12;
      let start = cuspLongitudes[i];
      let end = cuspLongitudes[nextI];
      if (end < start) end += 360;
      let d = absDeg;
      if (d < start) d += 360;
      if (d >= start && d < end) return i + 1;
    }
    return 1;
  };

  const keyPlanets = ['Sun', 'Moon', 'Ascendant', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  const planetLines: string[] = [];
  for (const name of keyPlanets) {
    const p = planets[name as keyof typeof planets];
    if (p && typeof p === 'object' && 'sign' in p) {
      const pos = p as { sign: string; degree: number; minutes?: number; isRetrograde?: boolean };
      const absDeg = ZODIAC.indexOf(pos.sign) * 30 + pos.degree + (pos.minutes || 0) / 60;
      const house = calcHouse(absDeg);
      const retro = pos.isRetrograde ? "  ℞" : "";
      const houseStr = house ? `  ·  House ${house}` : "";
      planetLines.push(`${name}:  ${pos.degree}°${pos.minutes || 0}' ${pos.sign}${houseStr}${retro}`);
    }
  }

  const boxH = 12 + planetLines.length * 7;
  const boxY = 112;

  // Card background
  pdf.setFillColor(...COLORS.card);
  pdf.setDrawColor(...COLORS.cardBorder);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(MARGIN + 10, boxY, CONTENT_W - 20, boxH, 2, 2, "FD");

  // Gold left accent
  pdf.setFillColor(...COLORS.gold);
  pdf.rect(MARGIN + 10, boxY, 3, boxH, "F");

  y = boxY + 8;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...COLORS.accent);
  pdf.text("KEY PLACEMENTS", MARGIN + 20, y);
  y += 6;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(...COLORS.body);
  for (const line of planetLines) {
    pdf.text(line, MARGIN + 20, y);
    y += 7;
  }

  addFooter();

  // --- CONTENT PAGES ---
  // Merge all assistant answers into one continuous reading
  const allText = assistantMessages.map(m => stripMarkdown(m.content)).join("\n\n");
  const allParagraphs = allText.split(/\n\n+/).filter(p => p.trim());

  pdf.addPage();
  y = MARGIN;

  // Single title for the whole reading
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(...COLORS.heading);
  pdf.text("Your Reading", MARGIN, y);
  y += 4;
  pdf.setDrawColor(...COLORS.gold);
  pdf.setLineWidth(0.6);
  pdf.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 10;

  {
    const paragraphs = allParagraphs;

    for (const para of paragraphs) {
      const lines = para.split(/\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const isBullet = trimmed.startsWith("• ");
        const indent = isBullet ? 5 : 0;

        // Callout box for important lines
        if (isCalloutLine(trimmed)) {
          ensureSpace(18);
          y += 3;
          const wrappedCallout = pdf.splitTextToSize(trimmed, CONTENT_W - 18);
          const calloutH = wrappedCallout.length * 6 + 10;

          pdf.setFillColor(...COLORS.highlight);
          pdf.setDrawColor(...COLORS.highlightBorder);
          pdf.setLineWidth(0.4);
          pdf.roundedRect(MARGIN, y - 4, CONTENT_W, calloutH, 2, 2, "FD");
          pdf.setFillColor(...COLORS.gold);
          pdf.rect(MARGIN, y - 4, 3, calloutH, "F");

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(10);
          pdf.setTextColor(...COLORS.accent);
          let cy = y + 3;
          for (const wl of wrappedCallout) {
            pdf.text(wl, MARGIN + 8, cy);
            cy += 6;
          }
          y = cy + 4;
          continue;
        }

        // Heading detection
        const isHeading = trimmed.length < 70 && !trimmed.endsWith(".") && !isBullet && trimmed.length > 3 && !trimmed.startsWith("•");

        if (isHeading) {
          ensureSpace(16);
          y += 4;
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(13);
          pdf.setTextColor(...COLORS.heading);
          pdf.text(trimmed, MARGIN + indent, y);
          y += 8;
        } else {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(11);
          pdf.setTextColor(...COLORS.body);

          const wrapped = pdf.splitTextToSize(trimmed, CONTENT_W - indent - 2);
          for (const wl of wrapped) {
            ensureSpace(7);
            pdf.text(wl, MARGIN + indent, y);
            y += 6;
          }
          y += 3;
        }
      }
      y += 4;
    }
  }

  addFooter();

  const safeName = (chart.name || "chart").replace(/[^a-zA-Z0-9]/g, "_");
  pdf.save(`${safeName}_reading_${new Date().toISOString().slice(0, 10)}.pdf`);
}

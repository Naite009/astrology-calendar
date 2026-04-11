import jsPDF from "jspdf";
import { NatalChart } from "@/hooks/useNatalChart";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const COLORS = {
  bg: [26, 26, 30] as [number, number, number],
  card: [35, 35, 42] as [number, number, number],
  gold: [212, 175, 55] as [number, number, number],
  cream: [245, 240, 230] as [number, number, number],
  muted: [160, 160, 170] as [number, number, number],
  accent: [180, 160, 120] as [number, number, number],
};

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s*/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/^[-*]\s+/gm, "• ")
    .replace(/^\d+\.\s+/gm, (m) => m)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

export function generateAskPdf(chart: NatalChart, assistantMessages: Message[]) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = 0;

  const ensureSpace = (needed: number) => {
    if (y + needed > PAGE_H - 25) {
      addFooter();
      pdf.addPage();
      y = MARGIN;
      drawPageBg();
    }
  };

  const drawPageBg = () => {
    pdf.setFillColor(...COLORS.bg);
    pdf.rect(0, 0, PAGE_W, PAGE_H, "F");
  };

  const addFooter = () => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(...COLORS.muted);
    pdf.text(`${chart.name} · Chart Reading`, MARGIN, PAGE_H - 10);
    pdf.text(`Page ${pdf.getNumberOfPages()}`, PAGE_W - MARGIN, PAGE_H - 10, { align: "right" });
  };

  // --- COVER PAGE ---
  drawPageBg();

  // Decorative line
  pdf.setDrawColor(...COLORS.gold);
  pdf.setLineWidth(0.5);
  pdf.line(MARGIN, 60, PAGE_W - MARGIN, 60);

  // Title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(28);
  pdf.setTextColor(...COLORS.cream);
  pdf.text("Chart Reading", PAGE_W / 2, 80, { align: "center" });

  // Subtitle
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(14);
  pdf.setTextColor(...COLORS.gold);
  pdf.text(chart.name || "Natal Chart", PAGE_W / 2, 92, { align: "center" });

  // Birth info
  pdf.setFontSize(10);
  pdf.setTextColor(...COLORS.muted);
  const birthInfo: string[] = [];
  if (chart.birthDate) birthInfo.push(chart.birthDate);
  if (chart.birthTime) birthInfo.push(chart.birthTime);
  if (chart.birthLocation) birthInfo.push(chart.birthLocation);
  pdf.text(birthInfo.join(" · "), PAGE_W / 2, 104, { align: "center" });

  // Date generated
  pdf.setFontSize(8);
  pdf.text(`Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`, PAGE_W / 2, 114, { align: "center" });

  pdf.setDrawColor(...COLORS.gold);
  pdf.line(MARGIN, 125, PAGE_W - MARGIN, 125);

  // Planetary summary card on cover
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
  y = 135;
  pdf.setFillColor(...COLORS.card);
  pdf.roundedRect(MARGIN, y, CONTENT_W, 4 + keyPlanets.length * 6 + 4, 3, 3, "F");

  // Gold accent bar
  pdf.setFillColor(...COLORS.gold);
  pdf.rect(MARGIN, y, 2, 4 + keyPlanets.length * 6 + 4, "F");

  y += 6;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(...COLORS.gold);
  pdf.text("KEY PLACEMENTS", MARGIN + 8, y);
  y += 5;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...COLORS.cream);

  for (const name of keyPlanets) {
    const p = planets[name as keyof typeof planets];
    if (p && typeof p === 'object' && 'sign' in p) {
      const pos = p as { sign: string; degree: number; minutes?: number; isRetrograde?: boolean };
      const absDeg = ZODIAC.indexOf(pos.sign) * 30 + pos.degree + (pos.minutes || 0) / 60;
      const house = calcHouse(absDeg);
      const retro = pos.isRetrograde ? " ℞" : "";
      const houseStr = house ? ` · House ${house}` : "";
      pdf.text(`${name}: ${pos.degree}°${pos.minutes || 0}' ${pos.sign}${houseStr}${retro}`, MARGIN + 8, y);
      y += 6;
    }
  }

  addFooter();

  // --- CONTENT PAGES ---
  pdf.addPage();
  drawPageBg();
  y = MARGIN;

  for (let i = 0; i < assistantMessages.length; i++) {
    const msg = assistantMessages[i];
    const cleanText = stripMarkdown(msg.content);
    const paragraphs = cleanText.split(/\n\n+/).filter(p => p.trim());

    // Section header
    ensureSpace(20);
    pdf.setFillColor(...COLORS.gold);
    pdf.rect(MARGIN, y, CONTENT_W, 0.5, "F");
    y += 6;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(...COLORS.gold);
    pdf.text(`Interpretation ${i + 1}`, MARGIN, y);
    y += 8;

    for (const para of paragraphs) {
      const lines = para.split(/\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const isBullet = trimmed.startsWith("• ");
        const indent = isBullet ? 6 : 0;

        // Check if this looks like a heading (short line, no period)
        const isHeading = trimmed.length < 60 && !trimmed.endsWith(".") && !isBullet && !trimmed.startsWith("•");

        if (isHeading && trimmed.length > 3) {
          ensureSpace(14);
          y += 3;
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(9);
          pdf.setTextColor(...COLORS.accent);
          pdf.text(trimmed, MARGIN + indent, y);
          y += 6;
        } else {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8.5);
          pdf.setTextColor(...COLORS.cream);

          const wrapped = pdf.splitTextToSize(trimmed, CONTENT_W - indent - 4);
          for (const wl of wrapped) {
            ensureSpace(5);
            pdf.text(wl, MARGIN + indent, y);
            y += 4.5;
          }
          y += 2;
        }
      }
      y += 3;
    }
    y += 6;
  }

  addFooter();

  // Save
  const safeName = (chart.name || "chart").replace(/[^a-zA-Z0-9]/g, "_");
  pdf.save(`${safeName}_reading_${new Date().toISOString().slice(0, 10)}.pdf`);
}

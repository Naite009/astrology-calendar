// PDF section: Year Priority Engine + Natal Overlay + Angle Activations
import type jsPDF from 'jspdf';
import type { PDFContext } from './pdfContext';
import type { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import type { NatalChart } from '@/hooks/useNatalChart';
import type { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { computeYearPriorities } from '@/lib/yearPriorityScoring';

const HOUSE_MEANINGS: Record<number, string> = {
  1: 'identity, body, self-definition',
  2: 'money, resources, self-worth',
  3: 'communication, learning, siblings',
  4: 'home, family, roots, private life',
  5: 'creativity, romance, children',
  6: 'work, routines, health',
  7: 'relationships, partnership',
  8: 'shared resources, intimacy, transformation',
  9: 'beliefs, travel, higher learning',
  10: 'career, calling, reputation',
  11: 'friends, networks, future goals',
  12: 'rest, retreat, healing, spirituality',
};

function ord(n: number): string {
  if (n === 1) return 'st'; if (n === 2) return 'nd'; if (n === 3) return 'rd'; return 'th';
}

// ─── Natal Overlay Section ──────────────────────────────────────
export function generatePDFNatalOverlay(
  ctx: PDFContext, doc: jsPDF,
  analysis: SolarReturnAnalysis,
) {
  ctx.sectionTitle(doc, 'HOW THIS YEAR LANDS IN YOUR NATAL CHART', 'Solar Return to Natal House Overlay');

  interface Point { label: string; house: number; meaning: string; }
  const points: Point[] = [];
  const houseCounts: Record<number, string[]> = {};

  const addPt = (label: string, house: number | null) => {
    if (!house) return;
    points.push({ label, house, meaning: HOUSE_MEANINGS[house] || '' });
    if (!houseCounts[house]) houseCounts[house] = [];
    houseCounts[house].push(label);
  };

  if (analysis.srAscInNatalHouse) addPt('SR Ascendant', analysis.srAscInNatalHouse.natalHouse);
  addPt('SR Sun', analysis.sunNatalHouse?.house ?? null);
  addPt('SR Moon', analysis.moonNatalHouse?.house ?? null);
  for (const ov of analysis.houseOverlays || []) {
    if (ov.planet === 'Saturn' || ov.planet === 'Jupiter') addPt(`SR ${ov.planet}`, ov.natalHouse);
  }

  // Dominant house
  let dominant: { house: number; count: number; labels: string[] } | null = null;
  for (const [h, labels] of Object.entries(houseCounts)) {
    if (labels.length >= 2 && (!dominant || labels.length > dominant.count))
      dominant = { house: Number(h), count: labels.length, labels };
  }

  if (dominant) {
    ctx.checkPage(60);
    ctx.drawCard(doc, () => {
      ctx.writeCardSection(doc, `MAIN ARENA -- NATAL ${dominant!.house}${ord(dominant!.house).toUpperCase()} HOUSE`,
        `${dominant!.labels.join(', ')} all land in your natal ${dominant!.house}${ord(dominant!.house)} house, emphasizing ${HOUSE_MEANINGS[dominant!.house] || ''}.`);
    }, ctx.colors.gold);
    ctx.y += 8;
  }

  for (const p of points) {
    ctx.checkPage(40);
    doc.setFont('times', 'bold'); doc.setFontSize(9);
    doc.setTextColor(...ctx.colors.ink);
    doc.text(`${p.label} --> Natal ${p.house}${ord(p.house)} House`, ctx.margin, ctx.y);
    ctx.y += 12;
    doc.setFont('times', 'normal'); doc.setFontSize(8.5);
    doc.setTextColor(...ctx.colors.muted);
    const lines = doc.splitTextToSize(`(${p.meaning})`, ctx.contentW - 16);
    for (const l of lines) { doc.text(l, ctx.margin + 8, ctx.y); ctx.y += 11; }
    ctx.y += 4;
  }
}

// ─── Angle Activations Section ──────────────────────────────────
const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const toAbsDeg = (pos: { sign: string; degree: number; minutes?: number } | undefined): number | null => {
  if (!pos) return null;
  const idx = SIGNS.indexOf(pos.sign);
  if (idx < 0) return null;
  return idx * 30 + (pos.degree || 0) + ((pos as any).minutes || 0) / 60;
};

const ASPECT_DEFS = [
  { name: 'conjunct', angle: 0, glyph: 'conj' },
  { name: 'opposite', angle: 180, glyph: 'opp' },
  { name: 'square', angle: 90, glyph: 'sq' },
  { name: 'trine', angle: 120, glyph: 'tri' },
  { name: 'sextile', angle: 60, glyph: 'sxt' },
];
const ORB = 3;

export function generatePDFAngleActivations(
  ctx: PDFContext, doc: jsPDF,
  natalChart: NatalChart, srChart: SolarReturnChart,
) {
  ctx.sectionTitle(doc, 'MAJOR PLANETARY ACTIVATIONS', 'SR Angles to Natal Planets & SR Planets to Natal Angles');

  interface Act { label: string; aspectName: string; orb: number; narrative: string; priority: number; }
  const acts: Act[] = [];

  // SR angles
  const srAngles: { name: string; deg: number | null }[] = [];
  const srAsc = srChart.houseCusps?.house1; const srMC = srChart.houseCusps?.house10;
  if (srAsc) { const d = toAbsDeg(srAsc); srAngles.push({ name: 'Ascendant', deg: d }); if (d !== null) srAngles.push({ name: 'Descendant', deg: (d + 180) % 360 }); }
  if (srMC) { const d = toAbsDeg(srMC); srAngles.push({ name: 'Midheaven', deg: d }); if (d !== null) srAngles.push({ name: 'IC', deg: (d + 180) % 360 }); }

  // Natal angles
  const natalAngles: { name: string; deg: number | null }[] = [];
  const nAsc = natalChart.houseCusps?.house1; const nMC = natalChart.houseCusps?.house10;
  if (nAsc) { const d = toAbsDeg(nAsc); natalAngles.push({ name: 'Ascendant', deg: d }); if (d !== null) natalAngles.push({ name: 'Descendant', deg: (d + 180) % 360 }); }
  if (nMC) { const d = toAbsDeg(nMC); natalAngles.push({ name: 'Midheaven', deg: d }); if (d !== null) natalAngles.push({ name: 'IC', deg: (d + 180) % 360 }); }

  const planetNames = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','NorthNode','Chiron'];

  // SR angles --> natal planets
  for (const angle of srAngles) {
    if (angle.deg === null) continue;
    for (const pName of planetNames) {
      const pos = natalChart.planets[pName as keyof typeof natalChart.planets];
      if (!pos) continue;
      const pDeg = toAbsDeg(pos); if (pDeg === null) continue;
      for (const asp of ASPECT_DEFS) {
        let diff = Math.abs(angle.deg - pDeg); if (diff > 180) diff = 360 - diff;
        const orb = Math.abs(diff - asp.angle);
        if (orb <= ORB) {
          const dp = pName === 'NorthNode' ? 'N.Node' : pName;
          acts.push({ label: `SR ${angle.name} ${asp.glyph} Natal ${dp}`, aspectName: asp.name, orb: Math.round(orb * 10) / 10, narrative: `SR ${angle.name} ${asp.name}s natal ${dp} -- this contact activates ${dp} themes through the year.`, priority: asp.angle === 0 ? 1 : 2 });
        }
      }
    }
  }

  // SR planets --> natal angles
  for (const pName of planetNames) {
    const srPos = srChart.planets[pName as keyof typeof srChart.planets];
    if (!srPos) continue;
    const srDeg = toAbsDeg(srPos); if (srDeg === null) continue;
    for (const angle of natalAngles) {
      if (angle.deg === null) continue;
      for (const asp of ASPECT_DEFS) {
        let diff = Math.abs(srDeg - angle.deg); if (diff > 180) diff = 360 - diff;
        const orb = Math.abs(diff - asp.angle);
        if (orb <= ORB) {
          const dp = pName === 'NorthNode' ? 'N.Node' : pName;
          acts.push({ label: `SR ${dp} ${asp.glyph} Natal ${angle.name}`, aspectName: asp.name, orb: Math.round(orb * 10) / 10, narrative: `SR ${dp} ${asp.name}s natal ${angle.name} -- visible activation of ${angle.name} themes.`, priority: asp.angle === 0 ? 1 : 3 });
        }
      }
    }
  }

  acts.sort((a, b) => a.priority - b.priority || a.orb - b.orb);

  if (acts.length === 0) {
    ctx.writeBody(doc, 'No significant angle-to-planet contacts detected within 3 degrees orb.');
    return;
  }

  for (const act of acts.slice(0, 8)) {
    ctx.checkPage(40);
    doc.setFont('times', 'bold'); doc.setFontSize(9);
    doc.setTextColor(...ctx.colors.ink);
    doc.text(`${act.label} (${act.orb} deg)`, ctx.margin, ctx.y);
    ctx.y += 12;
    doc.setFont('times', 'normal'); doc.setFontSize(8.5);
    doc.setTextColor(...ctx.colors.muted);
    const lines = doc.splitTextToSize(act.narrative, ctx.contentW - 16);
    for (const l of lines) { doc.text(l, ctx.margin + 8, ctx.y); ctx.y += 11; }
    ctx.y += 4;
  }
}

// ─── Year Priority Engine Section ───────────────────────────────
export function generatePDFYearPriority(
  ctx: PDFContext, doc: jsPDF,
  analysis: SolarReturnAnalysis, natalChart: NatalChart, srChart: SolarReturnChart,
) {
  ctx.sectionTitle(doc, 'YEAR PRIORITY ENGINE', 'Top Themes Ranked by Signal Strength');

  const ranked = computeYearPriorities(analysis, natalChart, srChart);
  const top3 = ranked.slice(0, 3);

  if (top3.length === 0) {
    ctx.writeBody(doc, 'Insufficient data to rank year themes.');
    return;
  }

  for (let i = 0; i < top3.length; i++) {
    const theme = top3[i];
    ctx.checkPage(80);

    ctx.drawCard(doc, () => {
      // Rank + label
      doc.setFont('times', 'bold'); doc.setFontSize(12);
      doc.setTextColor(...(i === 0 ? ctx.colors.gold : ctx.colors.ink));
      doc.text(`#${i + 1}  ${theme.label}`, ctx.margin + 12, ctx.y);
      ctx.y += 14;

      // Confidence + score
      doc.setFont('times', 'normal'); doc.setFontSize(8);
      doc.setTextColor(...ctx.colors.muted);
      doc.text(`${theme.confidence} confidence  --  ${theme.score} points`, ctx.margin + 12, ctx.y);
      ctx.y += 14;

      // Key drivers (top 3)
      ctx.trackedLabel(doc, 'KEY DRIVERS', ctx.margin + 12, ctx.y, { size: 6, charSpace: 2 });
      ctx.y += 10;
      for (const d of theme.drivers.slice(0, 3)) {
        doc.setFont('times', 'normal'); doc.setFontSize(8);
        doc.setTextColor(...ctx.colors.ink);
        doc.text(`- ${d.source} (+${d.weight})`, ctx.margin + 16, ctx.y);
        ctx.y += 11;
      }
    }, i === 0 ? ctx.colors.gold : ctx.colors.rule);

    ctx.y += 8;
  }

  // Compact remaining
  const rest = ranked.slice(3, 8);
  if (rest.length > 0) {
    ctx.checkPage(60);
    ctx.trackedLabel(doc, 'OTHER ACTIVE THEMES', ctx.margin, ctx.y, { size: 7, charSpace: 3 });
    ctx.y += 14;
    for (const theme of rest) {
      doc.setFont('times', 'normal'); doc.setFontSize(8);
      doc.setTextColor(...ctx.colors.ink);
      doc.text(`${theme.label} -- ${theme.score} pts (${theme.confidence})`, ctx.margin + 8, ctx.y);
      ctx.y += 11;
    }
  }
}

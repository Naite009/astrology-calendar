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
  ctx.sectionTitle(doc, 'SOLAR RETURN TO NATAL HOUSE OVERLAY');

  interface Point { label: string; house: number; meaning: string; }
  const points: Point[] = [];
  const houseCounts: Record<number, string[]> = {};

  const addPt = (label: string, house: number | null) => {
    if (!house) return;
    points.push({ label, house, meaning: HOUSE_MEANINGS[house] || '' });
    if (!houseCounts[house]) houseCounts[house] = [];
    houseCounts[house].push(label);
  };

  if (analysis.srAscInNatalHouse) addPt('Solar Return Ascendant', analysis.srAscInNatalHouse.natalHouse);
  addPt('Solar Return Sun', analysis.sunNatalHouse?.house ?? null);
  addPt('Solar Return Moon', analysis.moonNatalHouse?.house ?? null);
  for (const ov of analysis.houseOverlays || []) {
    if (ov.planet === 'Saturn' || ov.planet === 'Jupiter') addPt(`Solar Return ${ov.planet}`, ov.natalHouse);
  }

  // Dominant house
  let dominant: { house: number; count: number; labels: string[] } | null = null;
  for (const [h, labels] of Object.entries(houseCounts)) {
    if (labels.length >= 2 && (!dominant || labels.length > dominant.count))
      dominant = { house: Number(h), count: labels.length, labels };
  }

  if (dominant) {
    ctx.checkPage(50);
    ctx.drawCard(doc, () => {
      ctx.writeCardSection(doc, `MAIN ARENA -- NATAL ${dominant!.house}${ord(dominant!.house).toUpperCase()} HOUSE`,
        `${dominant!.labels.join(', ')} all land in your natal ${dominant!.house}${ord(dominant!.house)} house, emphasizing ${HOUSE_MEANINGS[dominant!.house] || ''}.`);
    }, ctx.colors.gold);
    ctx.y += 4;
  }

  // Two-column layout for overlay points
  const col2W = (ctx.contentW - 14) / 2;
  let colIdx = 0;
  const rowStartY = ctx.y;
  let maxColY = ctx.y;

  for (const p of points) {
    const col = colIdx % 2;
    const x = ctx.margin + col * (col2W + 14);
    if (col === 0 && colIdx > 0) {
      ctx.y = maxColY + 4;
      maxColY = ctx.y;
    }
    const drawY = col === 0 ? ctx.y : (colIdx === 1 ? rowStartY : ctx.y - (maxColY - (colIdx > 1 ? maxColY : ctx.y)));

    // For simplicity, use the current ctx.y for left column, track for right
    const yPos = col === 0 ? ctx.y : ctx.y;

    doc.setFont('times', 'bold'); doc.setFontSize(8.5);
    doc.setTextColor(...ctx.colors.ink);
    doc.text(`${p.label} --> Natal ${p.house}${ord(p.house)}`, x + 4, yPos);

    doc.setFont('times', 'normal'); doc.setFontSize(8);
    doc.setTextColor(...ctx.colors.muted);
    doc.text(`(${p.meaning})`, x + 4, yPos + 10);

    if (col === 1) {
      ctx.y += 24;
    }
    colIdx++;
  }
  // If odd number of points, advance
  if (colIdx % 2 === 1) ctx.y += 24;
  ctx.y += 8;
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

// ─── Felt-sense narratives for angle activations ────────────────
const ANGLE_FELT: Record<string, string> = {
  Ascendant: 'your physical presence, first impressions, and how you instinctively approach new situations. You feel this in your body — posture shifts, energy levels change, and people respond to you differently without knowing why.',
  Descendant: 'your closest partnerships and how you relate one-on-one. Relationship dynamics feel electric — you attract new connections or existing partnerships undergo visible restructuring. Compromise and projection patterns surface.',
  Midheaven: 'your career, public reputation, and life direction. Professional visibility increases — you feel more exposed, more scrutinized, and more driven toward what you want the world to see.',
  IC: 'your home, family roots, and emotional foundations. Something shifts at the base of your life — living situations change, family dynamics surface, or your private inner world demands attention you cannot postpone.',
};

const PLANET_FELT: Record<string, string> = {
  Sun: 'your core identity and sense of purpose. You feel more visible, more yourself, and more aware of whether your daily life matches who you actually are.',
  Moon: 'your emotional needs and instinctive reactions. Feelings run stronger, intuition sharpens, and your body tells you what your mind hasn\'t caught up to yet.',
  Mercury: 'your thinking patterns, communication style, and daily information processing. Conversations carry more weight, ideas come faster, and what you say (or don\'t say) has consequences.',
  Venus: 'your values, relationships, and what you find beautiful. You feel more attuned to pleasure and more aware of where your relationships need honesty.',
  Mars: 'your drive, ambition, and how you handle conflict. Energy surges — you feel restless, competitive, or motivated to push through obstacles that previously stopped you.',
  Jupiter: 'your growth, optimism, and where life feels expansive. Opportunities appear. The danger is overcommitting. The gift is genuine expansion.',
  Saturn: 'your responsibilities, limits, and long-term structures. You feel the weight of what matters — bones, boundaries, and commitments that demand follow-through.',
  Uranus: 'your need for freedom, originality, and sudden change. Expect the unexpected — disruptions that feel destabilizing in the moment but liberating afterward.',
  Neptune: 'your intuition, imagination, and where boundaries dissolve. Reality feels softer, dreams are vivid, and the line between what you want and what is actually happening blurs.',
  Pluto: 'deep transformation and power dynamics. Something hidden surfaces — control patterns, buried emotions, or situations that force you to let go of what you\'ve outgrown.',
  'N.Node': 'your soul\'s growth direction. Life events push you toward unfamiliar territory that feels uncomfortable but necessary — the discomfort is the signal you\'re growing.',
  NorthNode: 'your soul\'s growth direction. Life events push you toward unfamiliar territory that feels uncomfortable but necessary.',
  Chiron: 'your deepest wound and greatest healing gift. Old pain resurfaces — not to retraumatize, but to show you how far you\'ve come and where compassion still needs to reach.',
};

export function generatePDFAngleActivations(
  ctx: PDFContext, doc: jsPDF,
  natalChart: NatalChart, srChart: SolarReturnChart,
  maxOrb: number = ORB,
) {
  ctx.sectionTitle(doc, 'MAJOR PLANETARY ACTIVATIONS', 'SR Angles to Natal Planets & SR Planets to Natal Angles');

  interface Act { label: string; aspectName: string; orb: number; narrative: string; priority: number; }
  const acts: Act[] = [];

  const buildNarrative = (srBody: string, aspectName: string, natalBody: string, natalKey: string, srKey: string): string => {
    const feltTarget = PLANET_FELT[natalKey] || ANGLE_FELT[natalBody] || '';
    const feltSource = PLANET_FELT[srKey] || ANGLE_FELT[srBody] || '';
    if (feltTarget) {
      return `SR ${srBody} ${aspectName}s natal ${natalBody} — this directly touches ${feltTarget}`;
    }
    if (feltSource) {
      return `SR ${srBody} ${aspectName}s natal ${natalBody} — this channels ${feltSource}`;
    }
    return `SR ${srBody} ${aspectName}s natal ${natalBody}.`;
  };

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
        if (orb <= maxOrb) {
          const dp = pName === 'NorthNode' ? 'N.Node' : pName;
          acts.push({ label: `SR ${angle.name} ${asp.glyph} Natal ${dp}`, aspectName: asp.name, orb: Math.round(orb * 10) / 10, narrative: buildNarrative(angle.name, asp.name, dp, pName, angle.name), priority: asp.angle === 0 ? 1 : 2 });
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
        if (orb <= maxOrb) {
          const dp = pName === 'NorthNode' ? 'N.Node' : pName;
          acts.push({ label: `SR ${dp} ${asp.glyph} Natal ${angle.name}`, aspectName: asp.name, orb: Math.round(orb * 10) / 10, narrative: buildNarrative(dp, asp.name, angle.name, angle.name, pName), priority: asp.angle === 0 ? 1 : 3 });
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
    ctx.checkPage(50);
    doc.setFont('times', 'bold'); doc.setFontSize(9);
    doc.setTextColor(...ctx.colors.ink);
    doc.text(`${act.label} (${act.orb} deg)`, ctx.margin, ctx.y);
    ctx.y += 12;
    doc.setFont('times', 'normal'); doc.setFontSize(8.5);
    doc.setTextColor(...ctx.colors.muted);
    const lines = doc.splitTextToSize(act.narrative, ctx.contentW - 16);
    for (const l of lines) { doc.text(l, ctx.margin + 8, ctx.y); ctx.y += 11; }
    ctx.y += 6;
  }
}

// ─── Year Priority Engine Section ───────────────────────────────
export function generatePDFYearPriority(
  ctx: PDFContext, doc: jsPDF,
  analysis: SolarReturnAnalysis, natalChart: NatalChart, srChart: SolarReturnChart,
) {
  ctx.sectionTitle(doc, 'YEAR PRIORITY ENGINE', 'Top Themes Ranked by House Placements and Angle Contacts');

  const ranked = computeYearPriorities(analysis, natalChart, srChart);
  const top3 = ranked.slice(0, 3);

  if (top3.length === 0) {
    ctx.writeBody(doc, 'Insufficient data to rank year themes.');
    return;
  }

  for (let i = 0; i < top3.length; i++) {
    const theme = top3[i];
    ctx.checkPage(100);

    ctx.drawCard(doc, () => {
      // Rank + label
      doc.setFont('times', 'bold'); doc.setFontSize(12);
      doc.setTextColor(...(i === 0 ? ctx.colors.gold : ctx.colors.ink));
      doc.text(`#${i + 1}  ${theme.label}`, ctx.margin + 12, ctx.y);
      ctx.y += 14;

      // Confidence
      doc.setFont('times', 'normal'); doc.setFontSize(8);
      doc.setTextColor(...ctx.colors.muted);
      doc.text(`${theme.confidence} confidence`, ctx.margin + 12, ctx.y);
      ctx.y += 14;

      // Why this ranks
      ctx.trackedLabel(doc, 'WHY THIS RANKS', ctx.margin + 12, ctx.y, { size: 6, charSpace: 2 });
      ctx.y += 10;
      for (const d of theme.drivers.slice(0, 4)) {
        doc.setFont('times', 'normal'); doc.setFontSize(8);
        doc.setTextColor(...ctx.colors.ink);
        const lines = doc.splitTextToSize(`- ${d.source}`, ctx.contentW - 32);
        for (const l of lines) { doc.text(l, ctx.margin + 16, ctx.y); ctx.y += 11; }
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
      doc.text(`${theme.label} (${theme.confidence})`, ctx.margin + 8, ctx.y);
      ctx.y += 11;
    }
  }
}

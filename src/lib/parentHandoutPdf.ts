/**
 * One-page printable Parent Handout (US Letter portrait).
 *
 * This is a deliberate SUMMARY of the long on-screen Parent-Child report:
 * it selects the most usable material (rhythms, the child's emotional
 * language, the dynamic, needs vs learning, conflict moves, boundaries and
 * one key message) and lays it out as a designed keepsake rather than a
 * data dump. Everything is derived from the generated reading payload, so
 * nothing here is hard-coded to a specific family.
 */

import jsPDF from "jspdf";
import type { PairReadingResponse } from "@/lib/parentChildSynastry";

// ─── Page + palette ────────────────────────────────────────────────────────
const PW = 215.9;
const PH = 279.4;
const M = 14;
const CW = PW - M * 2;

type RGB = [number, number, number];
const IVORY: RGB = [251, 247, 239];
const CARD: RGB = [246, 240, 230];
const INK: RGB = [44, 40, 37];
const SOFT: RGB = [104, 96, 88];
const GOLD: RGB = [176, 141, 62];
const BURGUNDY: RGB = [122, 46, 58];
const SAGE: RGB = [110, 127, 99];
const HAIR: RGB = [214, 203, 184];

// jsPDF's built-in fonts are WinAnsi only, so the printed labels use words
// rather than astrological glyphs. Glyphs coming back from the model are
// normalized into those words.
const GLYPH_TO_WORD: Record<string, string> = {
  "\u260C": "conjunct", "\u260D": "opposite", "\u25B3": "trine", "\u25B2": "trine",
  "\u25A1": "square", "\u26B9": "sextile", "\u2733": "sextile",
  "\u26BB": "quincunx", "\u26BA": "semisextile", "\u2313": "quincunx",
};

// ─── Text helpers ──────────────────────────────────────────────────────────

const clean = (s?: string | null) =>
  String(s ?? "")
    .replace(/\s*\n\s*/g, " ")
    .replace(/\u2014/g, ", ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();

/** Keeps the first `n` sentences of a passage. */
function sentences(text: string, n: number): string {
  const parts = clean(text).match(/[^.!?]+[.!?]*/g) ?? [];
  return parts.slice(0, n).join(" ").trim();
}

/** Strips arrow lines out of prose so they only appear in the rhythm band. */
const withoutArrows = (s?: string | null) =>
  clean(
    String(s ?? "")
      .split("\n")
      .filter((l) => !l.includes("\u2192"))
      .join(" "),
  );

/** Shortens a bullet to a printable length at a word boundary. */
function shorten(s: string, maxWords: number): string {
  // Parenthetical chart citations belong in the on-screen report, not the handout.
  const base = clean(s).replace(/\s*\([^)]*\)?\s*/g, " ").replace(/\s{2,}/g, " ").trim();
  const words = base.split(/\s+/);
  if (words.length <= maxWords) return base.replace(/[,;:]$/, "");
  // Cut at the last clean word boundary, dropping dangling connectors.
  const kept = words.slice(0, maxWords);
  while (kept.length && /^(and|or|but|to|of|for|the|a|when|that|his|her|their|because|instead|even)$/i.test(kept[kept.length - 1])) kept.pop();
  return kept.join(" ").replace(/[,;:]$/, "") + "\u2026";
}

/** Compact auditable aspect label, e.g. "Saturn \u25B3 Venus 0.2\u00B0". */
const PLANET_RE =
  /\b(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto|Chiron|North\s?Node|South\s?Node|Lilith|Juno|Ascendant|Midheaven)\b/g;
const ASPECT_RE =
  /(conjunction|conjunct|opposition|opposite|trine|square|sextile|quincunx|semisextile|\u260C|\u260D|\u25B3|\u25A1|\u26B9|\u2733|\u26BB|\u26BA|\u2313)/i;

function compactAspect(label: string, orb: number): string {
  const orbStr = `${orb.toFixed(1)}\u00B0`;
  const planets = [...clean(label).matchAll(PLANET_RE)].map((m) => m[1].replace(/\s+/g, " "));
  const asp = clean(label).match(ASPECT_RE)?.[1] ?? "";
  if (planets.length < 2 || !asp) return `${shorten(label, 8)} ${orbStr}`;
  const word = GLYPH_TO_WORD[asp] ?? asp.toLowerCase().replace("conjunction", "conjunct").replace("opposition", "opposite");
  return `${planets[0]} ${word} ${planets[1]} ${orbStr}`;
}

// ─── Content selection ─────────────────────────────────────────────────────

export interface HandoutInput {
  reading: PairReadingResponse;
  parentName: string;
  childName: string;
  childMoonSign?: string | null;
}

interface HandoutContent {
  parentRhythm: string;
  childRhythm: string;
  emotionalLanguage: string;
  dynamic: string;
  sourceLabels: string[];
  needs: string[];
  learning: string[];
  whenHard: string[];
  yours: string[];
  notYours: string[];
  keyMessage: string;
}

export function buildHandoutContent({
  reading: r,
  parentName,
  childName,
}: HandoutInput): HandoutContent {
  // Rhythms: prefer the first-class field, fall back to arrow lines in prose.
  let parentRhythm = clean(r.rhythms?.parent);
  let childRhythm = clean(r.rhythms?.child);
  if (!parentRhythm || !childRhythm) {
    const source = `${r.connectionMisfire?.framing ?? ""}\n${r.repairProfile?.plainEnglish ?? ""}`;
    const arrows = source
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.includes("\u2192"))
      .map((l) => l.replace(/^[^:]{1,40}:\s*/, "").trim());
    parentRhythm = parentRhythm || arrows[0] || "";
    childRhythm = childRhythm || arrows[1] || "";
  }

  // The child's emotional language: Moon bridge + what may be underneath.
  const moonChild = (() => {
    const summary = clean(r.moonBridge?.summary);
    const parts = summary.match(/[^.!?]+[.!?]*/g) ?? [];
    const childPart = parts.find((p) => p.includes(childName)) ?? parts[1] ?? "";
    return clean(childPart);
  })();
  const emotionalLanguage =
    [moonChild, sentences(r.perceptionTranslation?.underneath ?? "", 1)]
      .filter(Boolean)
      .join(" ") ||
    sentences(r.pressureProfile?.plainEnglish ?? "", 2) ||
    sentences(r.essence?.[1] ?? r.essence?.[0] ?? "", 2);

  // The dynamic: honest framing first, then how the parent's intent lands.
  const dynamic =
    [
      sentences(withoutArrows(r.connectionMisfire?.framing), 2),
      sentences(clean(r.connectionMisfire?.childExperience), 1),
    ]
      .filter(Boolean)
      .join(" ") || sentences(r.essence?.[0] ?? "", 3);

  // Auditable sources: tightest contacts first, supportive kept in view.
  const trace = [...(r.traceableAspects ?? [])].sort((a, b) => a.orb - b.orb);
  const soft = trace.filter((t) => t.tone === "supportive");
  const hard = trace.filter((t) => t.tone !== "supportive");
  const picked = [...soft.slice(0, 2), ...hard.slice(0, 2)]
    .sort((a, b) => a.orb - b.orb)
    .slice(0, 4);
  const sourceLabels = picked
    .map((t) => compactAspect(t.label, t.orb))
    .filter((l, i, a) => a.findIndex((x) => x.split(" ").slice(0, 3).join(" ") === l.split(" ").slice(0, 3).join(" ")) === i)
    .slice(0, 3);

  const needs = (
    r.whatThisChildNeedsFromYou?.lines?.map((l) => l.text) ??
    r.respondsBestWhen ??
    r.pressureProfile?.whatHelps ??
    []
  )
    .filter(Boolean)
    .slice(0, 4)
    .map((s) => shorten(s, 16));

  const learning = (r.bothAreLearning?.childIsLearning?.map((l) => l.text) ?? [])
    .filter(Boolean)
    .slice(0, 4)
    .map((s) => shorten(s, 16));

  const whenHard = [
    ...(r.connectionMisfire?.whatHelpsInTheMoment ?? []),
    ...(r.inTheMoment?.[0]?.actions ?? []),
    ...(r.repairProfile?.whatHelps ?? []),
  ]
    .filter(Boolean)
    .map((s) => shorten(s, 12))
    .filter((s, i, a) => a.indexOf(s) === i)
    .slice(0, 4);

  const notYours = (r.responsibilities?.notTheParents ?? [])
    .filter(Boolean)
    .slice(0, 3)
    .map((s) => shorten(s, 15));
  const yours = [
    ...(r.bothAreLearning?.parentIsLearning?.map((l) => l.text) ?? []),
  ]
    .filter(Boolean)
    .slice(0, 3)
    .map((s) => shorten(s, 15));

  const keyMessage =
    clean(r.keyMessage) ||
    sentences(r.bothAreLearning?.sharedNote ?? "", 2) ||
    sentences(r.practice ?? "", 1);

  return {
    parentRhythm,
    childRhythm,
    emotionalLanguage,
    dynamic,
    sourceLabels,
    needs,
    learning,
    whenHard,
    yours,
    notYours,
    keyMessage,
  };
}

// ─── Drawing primitives ────────────────────────────────────────────────────

class Sheet {
  d: jsPDF;
  constructor() {
    this.d = new jsPDF({ unit: "mm", format: "letter", orientation: "portrait" });
    this.d.setFillColor(...IVORY);
    this.d.rect(0, 0, PW, PH, "F");
  }

  smallCaps(text: string, x: number, y: number, color: RGB, size = 7, align: "left" | "center" = "left") {
    this.d.setFont("helvetica", "bold");
    this.d.setFontSize(size);
    this.d.setTextColor(...color);
    this.d.setCharSpace(1.1);
    this.d.text(text.toUpperCase(), x, y, { align });
    this.d.setCharSpace(0);
  }

  /** Wrapped body copy clamped to a line budget so the page can never overflow. */
  paragraph(text: string, x: number, y: number, w: number, maxLines: number, size = 9.2, lead = 4.4, color: RGB = INK) {
    this.d.setFont("times", "normal");
    this.d.setFontSize(size);
    this.d.setTextColor(...color);
    // Trim by whole sentences so the handout never ends a thought mid-clause.
    let source = text;
    let lines: string[] = this.d.splitTextToSize(source, w);
    if (lines.length > maxLines) {
      const parts = source.match(/[^.!?]+[.!?]+/g) ?? [source];
      let kept = "";
      for (const part of parts) {
        const next = (kept + " " + part).trim();
        if ((this.d.splitTextToSize(next, w) as string[]).length > maxLines) break;
        kept = next;
      }
      source = kept || parts[0];
      lines = this.d.splitTextToSize(source, w) as string[];
      if (lines.length > maxLines) {
        lines = lines.slice(0, maxLines);
        lines[maxLines - 1] = lines[maxLines - 1].replace(/[\s,;:.]+$/, "") + "\u2026";
      }
    }
    lines.forEach((ln, i) => this.d.text(ln, x, y + i * lead));
    return y + lines.length * lead;
  }

  bulletList(items: string[], x: number, y: number, w: number, maxLines: number, marker: RGB = GOLD, size = 8.8, lead = 4.2) {
    let cy = y;
    let used = 0;
    for (const item of items) {
      this.d.setFont("times", "normal");
      this.d.setFontSize(size);
      const lines: string[] = this.d.splitTextToSize(item, w - 4.5);
      if (used + lines.length > maxLines) break;
      this.d.setFillColor(...marker);
      this.d.circle(x + 1, cy - 1.1, 0.7, "F");
      this.d.setTextColor(...INK);
      lines.forEach((ln, i) => this.d.text(ln, x + 4.5, cy + i * lead));
      cy += lines.length * lead + 1.4;
      used += lines.length;
    }
    return cy;
  }

  frame(x: number, y: number, w: number, h: number, fill?: RGB, accent?: RGB) {
    if (fill) {
      this.d.setFillColor(...fill);
      this.d.roundedRect(x, y, w, h, 1.6, 1.6, "F");
    }
    this.d.setDrawColor(...HAIR);
    this.d.setLineWidth(0.25);
    this.d.roundedRect(x, y, w, h, 1.6, 1.6, "S");
    if (accent) {
      this.d.setFillColor(...accent);
      this.d.rect(x, y, 1.1, h, "F");
    }
  }

  hair(x1: number, y: number, x2: number, color: RGB = HAIR, weight = 0.25) {
    this.d.setDrawColor(...color);
    this.d.setLineWidth(weight);
    this.d.line(x1, y, x2, y);
  }

  /** Small vector ornament: a crescent flanked by rays of dots. */
  ornament(cx: number, y: number) {
    const d = this.d;
    d.setFillColor(...GOLD);
    d.circle(cx, y, 2.1, "F");
    d.setFillColor(...IVORY);
    d.circle(cx + 1.0, y - 0.4, 1.7, "F");
    for (let i = 1; i <= 5; i++) {
      const r = 0.55 - i * 0.06;
      d.setFillColor(...GOLD);
      d.circle(cx - 4 - i * 3.4, y, r, "F");
      d.circle(cx + 4 + i * 3.4, y, r, "F");
    }
  }

  /** Sparse botanical sprig used as a corner accent. */
  sprig(x: number, y: number, dir: 1 | -1) {
    const d = this.d;
    d.setDrawColor(...SAGE);
    d.setLineWidth(0.3);
    d.line(x, y, x + dir * 13, y - 6);
    for (let i = 1; i <= 4; i++) {
      const px = x + dir * (i * 3);
      const py = y - i * 1.4;
      d.setFillColor(...SAGE);
      d.circle(px, py - 1.5, 0.75, "F");
      d.circle(px + dir * 1.2, py + 1.4, 0.6, "F");
    }
  }
}

// ─── The handout ───────────────────────────────────────────────────────────

export function generateParentHandout(input: HandoutInput): jsPDF {
  const c = buildHandoutContent(input);
  const { parentName, childName } = input;
  const s = new Sheet();
  const d = s.d;

  // Outer keepsake border
  d.setDrawColor(...GOLD);
  d.setLineWidth(0.6);
  d.rect(8, 8, PW - 16, PH - 16, "S");
  d.setDrawColor(...HAIR);
  d.setLineWidth(0.2);
  d.rect(10.4, 10.4, PW - 20.8, PH - 20.8, "S");

  // ── Header
  s.ornament(PW / 2, 20);
  d.setFont("times", "normal");
  d.setFontSize(26);
  d.setTextColor(...INK);
  d.text("Parent\u2013Child Connection", PW / 2, 32.5, { align: "center" });

  s.smallCaps(`${parentName}  \u00B7  ${childName}`, PW / 2, 40, BURGUNDY, 8.4, "center");

  d.setFont("times", "italic");
  d.setFontSize(9.6);
  d.setTextColor(...SOFT);
  d.text("A practical guide to understanding your relationship.", PW / 2, 46.6, { align: "center" });

  s.hair(M + 30, 51.5, PW - M - 30);

  // The takeaway panel and footer own a fixed zone at the foot of the sheet,
  // so every block above is measured and capped to finish above it.
  const MSG_TOP = PH - 58;
  const MSG_H = 30;
  const CONTENT_BOTTOM = MSG_TOP - 5;

  const colW = (CW - 8) / 2;
  const colX2 = M + colW + 8;

  const measurePara = (text: string, w: number, cap: number, size = 9.2) => {
    d.setFont("times", "normal");
    d.setFontSize(size);
    return Math.min(cap, (d.splitTextToSize(text, w) as string[]).length);
  };
  const measureBullets = (items: string[], w: number, cap: number, size = 8.8, lead = 4.2) => {
    d.setFont("times", "normal");
    d.setFontSize(size);
    let used = 0;
    let h = 0;
    for (const it of items) {
      const n = (d.splitTextToSize(it, w - 4.5) as string[]).length;
      if (used + n > cap) break;
      used += n;
      h += n * lead + 1.4;
    }
    return h;
  };

  // Progressive caps: the first set that fits the page is used.
  const capSets = [
    { para: 7, panel: 7, hard: 5, bound: 6 },
    { para: 6, panel: 6, hard: 4, bound: 5 },
    { para: 5, panel: 5, hard: 4, bound: 4 },
    { para: 4, panel: 4, hard: 3, bound: 3 },
    { para: 3, panel: 3, hard: 2, bound: 2 },
  ];
  const rhythmH = c.parentRhythm && c.childRhythm ? 22 : 16;
  const hardRows = Math.max(1, Math.ceil(c.whenHard.length / 2));

  const plan = (caps: (typeof capSets)[number]) => {
    const paraLines = Math.max(
      measurePara(c.emotionalLanguage, colW, caps.para),
      measurePara(c.dynamic, colW, caps.para),
    );
    const colH = 8 + paraLines * 4.4 + (c.sourceLabels.length ? 9 : 0);
    const panelH = Math.max(
      30,
      13.5 +
        Math.max(
          measureBullets(c.needs, colW - 10, caps.panel),
          measureBullets(c.learning, colW - 10, caps.panel),
        ) +
        5,
    );
    const hardH = 9 + measureBullets(c.whenHard.slice(0, hardRows), colW - 2, caps.hard, 9, 4.6) + 1;
    const boundH = Math.max(
      26,
      13 +
        Math.max(
          measureBullets(c.yours, colW - 12, caps.bound, 8.6, 4.1),
          measureBullets(c.notYours, colW - 8, caps.bound, 8.6, 4.1),
        ) +
        6,
    );
    const total = 54 + rhythmH + 6 + colH + 6 + panelH + 6 + hardH + 5 + boundH;
    return { caps, colH, panelH, hardH, boundH, total };
  };

  let layout = plan(capSets[0]);
  for (const caps of capSets) {
    layout = plan(caps);
    if (layout.total <= CONTENT_BOTTOM) break;
  }

  // ── Your Different Rhythms
  let y = 54;
  s.frame(M, y, CW, rhythmH, CARD, GOLD);
  s.smallCaps("Your Different Rhythms", M + 6, y + 7, GOLD, 7.4);
  d.setFont("times", "italic");
  d.setFontSize(8.2);
  d.setTextColor(...SOFT);
  d.text("Same moment, two sequences.", CW + M - 6, y + 7, { align: "right" });

  const rhythmRow = (name: string, seq: string, ry: number, color: RGB) => {
    d.setFont("helvetica", "bold");
    d.setFontSize(8);
    d.setTextColor(...color);
    const label = `${name}:`;
    d.text(label, M + 6, ry);
    const lw = d.getTextWidth(label);
    d.setFont("times", "normal");
    d.setFontSize(9.2);
    d.setTextColor(...INK);
    // WinAnsi has no arrow glyph, so the printed sequence uses a chevron.
    const printable = seq.replace(/\u2192/g, "\u203A");
    const line = (d.splitTextToSize(printable, CW - 14 - lw) as string[])[0];
    d.text(line, M + 8 + lw, ry);
  };
  if (c.parentRhythm) rhythmRow(parentName, c.parentRhythm, y + 13.5, BURGUNDY);
  if (c.childRhythm) rhythmRow(childName, c.childRhythm, y + 19.5, SAGE);
  y += rhythmH + 6;

  // ── Two columns: emotional language / the dynamic
  const colTop = y;
  s.smallCaps(`${childName}'s Emotional Language`, M, colTop, BURGUNDY, 7.4);
  s.smallCaps("The Dynamic Between You", colX2, colTop, BURGUNDY, 7.4);
  s.hair(M, colTop + 2.4, M + colW);
  s.hair(colX2, colTop + 2.4, colX2 + colW);

  s.paragraph(c.emotionalLanguage, M, colTop + 8, colW, layout.caps.para);
  s.paragraph(c.dynamic, colX2, colTop + 8, colW, layout.caps.para);

  if (c.sourceLabels.length) {
    d.setFont("helvetica", "normal");
    d.setFontSize(6.8);
    d.setTextColor(...SOFT);
    const labels = c.sourceLabels.join("   \u00B7   ");
    const wrapped: string[] = d.splitTextToSize(labels, CW);
    wrapped.slice(0, 2).forEach((ln, i) => d.text(ln, M, colTop + layout.colH - 1 + i * 3.2));
  }
  y = colTop + layout.colH + 6;

  // ── Balanced mini-panels
  s.frame(M, y, colW, layout.panelH, CARD, GOLD);
  s.frame(colX2, y, colW, layout.panelH, CARD, SAGE);
  s.smallCaps(`What ${childName} Needs From You`, M + 5, y + 7, GOLD, 7);
  s.smallCaps(`What ${childName} Is Learning`, colX2 + 5, y + 7, SAGE, 7);
  s.bulletList(c.needs, M + 5, y + 13.5, colW - 10, layout.caps.panel, GOLD);
  s.bulletList(c.learning, colX2 + 5, y + 13.5, colW - 10, layout.caps.panel, SAGE);
  y += layout.panelH + 6;

  // ── When Things Get Hard
  s.smallCaps("When Things Get Hard", M, y, BURGUNDY, 7.4);
  d.setFont("times", "italic");
  d.setFontSize(8);
  d.setTextColor(...SOFT);
  d.text("Pause the argument. Keep the expectation. Return at an agreed time.", PW - M, y, { align: "right" });
  s.hair(M, y + 2.4, PW - M);
  s.bulletList(c.whenHard.slice(0, hardRows), M, y + 9, colW - 2, layout.caps.hard, BURGUNDY, 9, 4.3);
  s.bulletList(c.whenHard.slice(hardRows), colX2, y + 9, colW - 2, layout.caps.hard, BURGUNDY, 9, 4.3);
  y += layout.hardH + 5;

  // ── What is yours / what is not yours
  s.frame(M, y, CW, layout.boundH, undefined, BURGUNDY);
  s.smallCaps("What Is Yours", M + 6, y + 7, BURGUNDY, 7);
  s.smallCaps("What Is Not Yours To Carry", colX2 + 1, y + 7, BURGUNDY, 7);
  s.bulletList(c.yours, M + 6, y + 13, colW - 12, layout.caps.bound, BURGUNDY, 8.6, 4.1);
  s.bulletList(c.notYours, colX2 + 1, y + 13, colW - 8, layout.caps.bound, BURGUNDY, 8.6, 4.1);

  // ── Most Important Message (fixed foot zone)
  d.setFillColor(...CARD);
  d.roundedRect(M, MSG_TOP, CW, MSG_H, 2, 2, "F");
  d.setDrawColor(...BURGUNDY);
  d.setLineWidth(0.5);
  d.roundedRect(M, MSG_TOP, CW, MSG_H, 2, 2, "S");
  s.sprig(M + 7, MSG_TOP + 8, 1);
  s.sprig(PW - M - 7, MSG_TOP + 8, -1);
  s.smallCaps("The Most Important Message", PW / 2, MSG_TOP + 7.5, BURGUNDY, 7, "center");

  d.setFont("times", "italic");
  d.setFontSize(10.4);
  d.setTextColor(...INK);
  const msgLines: string[] = d.splitTextToSize(c.keyMessage, CW - 40);
  const shown = msgLines.slice(0, 3);
  if (msgLines.length > 3) shown[2] = shown[2].replace(/[\s,;:.]+$/, "") + "\u2026";
  shown.forEach((ln, i) => d.text(ln, PW / 2, MSG_TOP + 14.5 + i * 4.9, { align: "center" }));

  // ── Footer
  d.setFont("helvetica", "normal");
  d.setFontSize(6.8);
  d.setTextColor(...SOFT);
  d.text(
    "Use this as a relationship lens, not a diagnosis or a prediction.",
    PW / 2,
    PH - 21,
    { align: "center" },
  );
  s.hair(PW / 2 - 22, PH - 17.5, PW / 2 + 22, GOLD, 0.3);


  return d;
}

export function downloadParentHandout(input: HandoutInput) {
  const doc = generateParentHandout(input);
  const file = `${input.parentName}-${input.childName}-parent-guide`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  doc.save(`${file}.pdf`);
}

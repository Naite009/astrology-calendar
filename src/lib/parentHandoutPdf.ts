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
    // Inline orb citations live in the tiny source labels instead of the prose.
    .replace(/\s*\([^()]*\u00B0[^()]*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();

/** Keeps the first `n` sentences of a passage. */
// Splits into sentences without breaking decimals such as "0.6" or degree orbs.
function splitSentences(text: string): string[] {
  return (clean(text).match(/[^.!?]+(?:[.!?](?!\d)|$)+/g) ?? [])
    .map((x) => x.trim())
    // Drop orphan fragments left behind by stray punctuation or numbers.
    .filter((x) => /^[A-Za-z"\u2018\u201C]/.test(x) && x.split(/\s+/).length > 2);
}

function sentences(text: string, n: number): string {
  const parts = splitSentences(clean(text));
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
  const base = clean(s)
    .replace(/\s*\([^)]*\)?\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/[.,;:]+$/, "")
    .trim();
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
  parentEmotionalLanguage: string;
  dynamic: string;
  sourceLabels: string[];
  needs: string[];
  learning: string[];
  harder: string[];
  whenHard: string[];
  yours: string[];
  notYours: string[];
  notMineToCarry: string;
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
    const parts = splitSentences(summary);
    // Only use a Moon-bridge sentence that actually describes this child.
    const childPart =
      parts.find((p) => p.includes(childName.split(/\s+/)[0]) && /Moon/i.test(p)) ??
      parts.find((p) => /Moon/i.test(p) && !p.includes(parentName.split(/\s+/)[0])) ??
      "";
    // Drop any comparative clause about the parent so the line is about the child.
    let out = clean(childPart);
    const parentFirst = parentName.split(/\s+/)[0];
    const childFirst = childName.split(/\s+/)[0];
    if (parentFirst && out.includes(parentFirst)) {
      const clause = out
        .split(/\b(?:whereas|while|but)\b/i)
        .map((x) => x.trim())
        .find((x) => x.includes(childFirst));
      if (clause) out = clause.charAt(0).toUpperCase() + clause.slice(1);
    }
    return out.replace(/^,\s*/, "");
  })();
  const emotionalLanguage =
    [moonChild, sentences(r.perceptionTranslation?.underneath ?? "", 1)]
      .filter(Boolean)
      .join(" ") ||
    sentences(r.pressureProfile?.plainEnglish ?? "", 2) ||
    sentences(r.essence?.[1] ?? r.essence?.[0] ?? "", 2);

  // The parent's own emotional language, drawn from the Moon bridge.
  const parentEmotionalLanguage = (() => {
    const parts = splitSentences(r.moonBridge?.summary ?? "");
    const parentFirst = parentName.split(/\s+/)[0];
    const childFirst = childName.split(/\s+/)[0];
    let pick =
      parts.find((p) => p.includes(parentFirst) && /Moon/i.test(p)) ??
      parts.find((p) => /Moon/i.test(p) && !p.includes(childFirst)) ??
      "";
    if (pick && childFirst && pick.includes(childFirst)) {
      const clause = pick
        .split(/\b(?:whereas|while|but)\b/i)
        .map((x) => x.trim())
        .find((x) => x.includes(parentFirst));
      if (clause) pick = clause.charAt(0).toUpperCase() + clause.slice(1);
    }
    // A second line only if it is genuinely about the parent, so this column
    // never drifts into describing the child.
    const second =
      parts.find((p) => p !== pick && p.includes(parentFirst) && !p.includes(childFirst)) ??
      sentences(clean(r.connectionMisfire?.parentIntent), 1);
    const toSecondPerson = (t: string) =>
      clean(
        t
          .replace(new RegExp(`\\b${parentFirst}(?:'s|\\u2019s)`, "g"), "your")
          .replace(new RegExp(`\\b${parentFirst} is\\b`, "g"), "you are")
          .replace(new RegExp(`\\b${parentFirst}\\b`, "g"), "you"),
      ).replace(/^([a-z])/, (m) => m.toUpperCase());
    const joined = [pick, second]
      .filter(Boolean)
      .map(toSecondPerson)
      .map((t) => t.replace(/[,;:]\s*$/, "").replace(/([^.!?])$/, "$1."))
      .join(" ");
    return joined || sentences(clean(r.repairProfile?.plainEnglish), 2);
  })();

  // The dynamic: honest framing first, then how the parent's intent lands.
  const dynamic =
    [
      sentences(withoutArrows(r.connectionMisfire?.framing), 2),
      sentences(clean(r.connectionMisfire?.childExperience), 1),
    ]
      .filter(Boolean)
      .join(" ")
      .replace(
        /\b(he|she|they|[A-Z][a-z]+)\s+(experiences|feels|hears|reads|takes)\b/g,
        (_m, p1, p2) => `${p1} may ${p2.replace(/s$/, "")}`,
      )
      || sentences(r.essence?.[0] ?? "", 3);

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

  const harder = [
    ...(r.whatMakesItWorse ?? []),
    ...(r.pressureProfile?.whatMakesItWorse ?? []),
    ...(r.repairProfile?.whatMakesItWorse ?? []),
  ]
    .filter(Boolean)
    .map((s) => shorten(s, 15))
    .filter((s, i, a) => a.indexOf(s) === i)
    .slice(0, 3);

  const whenHard = [
    ...(r.connectionMisfire?.whatHelpsInTheMoment ?? []),
    ...(r.inTheMoment?.[0]?.actions ?? []),
    ...(r.repairProfile?.whatHelps ?? []),
  ]
    .filter(Boolean)
    .map((s) => shorten(s, 15))
    .filter((s, i, a) => a.indexOf(s) === i)
    .slice(0, 3);

  // The child's side of the ledger: age-appropriate accountability, never a
  // list of things the parent must absorb.
  const notYours = [
    ...splitSentences(r.connectionMisfire?.accountabilityNote ?? ""),
    ...(r.bothAreLearning?.childIsLearning?.slice(2).map((l) => l.text) ?? []),
  ]
    .filter(Boolean)
    .map((s) => shorten(s, 17))
    .filter((s, i, a) => a.indexOf(s) === i)
    .slice(0, 3);
  const yours = (r.bothAreLearning?.parentIsLearning?.map((l) => l.text) ?? [])
    .filter(Boolean)
    .map((s) => shorten(s, 17))
    .filter((s, i, a) => a.indexOf(s) === i)
    .slice(0, 3);
  const notMineToCarry = shorten((r.responsibilities?.notTheParents ?? [])[0] ?? "", 16);

  const keyMessage =
    clean(r.keyMessage) ||
    sentences(r.bothAreLearning?.sharedNote ?? "", 2) ||
    sentences(r.practice ?? "", 1);

  return {
    parentRhythm,
    childRhythm,
    emotionalLanguage,
    parentEmotionalLanguage,
    dynamic,
    sourceLabels,
    needs,
    learning,
    harder,
    whenHard,
    yours,
    notYours,
    notMineToCarry,
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

  smallCaps(
    text: string,
    x: number,
    y: number,
    color: RGB,
    size = 7,
    align: "left" | "center" = "left",
    maxW?: number,
  ) {
    const label = text.toUpperCase();
    this.d.setFont("helvetica", "bold");
    this.d.setTextColor(...color);
    let fs = size;
    let cs = 1.1;
    if (maxW) {
      // Shrink tracking first, then type size, so headings never run past a column.
      for (;;) {
        this.d.setFontSize(fs);
        const w = this.d.getTextWidth(label) + cs * (label.length - 1);
        if (w <= maxW || fs <= 5.6) break;
        if (cs > 0.2) cs -= 0.15;
        else fs -= 0.2;
      }
    }
    this.d.setFontSize(fs);
    this.d.setCharSpace(cs);
    this.d.text(label, x, y, { align });
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
      const parts = splitSentences(source);
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
  const parentFirstName = parentName.split(/\s+/)[0];
  const childFirstName = childName.split(/\s+/)[0];
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
    { para: 5, dyn: 3, panel: 6, hard: 5, bound: 5 },
    { para: 4, dyn: 3, panel: 5, hard: 4, bound: 4 },
    { para: 4, dyn: 2, panel: 4, hard: 4, bound: 3 },
    { para: 3, dyn: 2, panel: 4, hard: 3, bound: 3 },
    { para: 3, dyn: 2, panel: 3, hard: 3, bound: 2 },
    { para: 2, dyn: 2, panel: 3, hard: 2, bound: 2 },
  ];
  const rhythmH = c.parentRhythm && c.childRhythm ? 20 : 15;

  const plan = (caps: (typeof capSets)[number]) => {
    const langLines = Math.max(
      measurePara(c.emotionalLanguage, colW, caps.para),
      measurePara(c.parentEmotionalLanguage, colW, caps.para),
    );
    const langH = 8 + langLines * 4.4;
    const dynLines = measurePara(c.dynamic, CW, caps.dyn);
    const dynH = 8 + dynLines * 4.4 + (c.sourceLabels.length ? 5.5 : 0);
    const panelH = Math.max(
      23,
      13.5 +
        Math.max(
          measureBullets(c.needs, colW - 10, caps.panel),
          measureBullets(c.learning, colW - 10, caps.panel),
        ) +
        4,
    );
    const hardH =
      9 +
      Math.max(
        measureBullets(c.harder, colW - 2, caps.hard, 8.8, 4.3),
        measureBullets(c.whenHard, colW - 2, caps.hard, 8.8, 4.3),
      ) +
      1;
    const boundH = Math.max(
      20,
      13 +
        Math.max(
          measureBullets(c.yours, colW - 12, caps.bound, 8.4, 4.0),
          measureBullets(c.notYours, colW - 8, caps.bound, 8.4, 4.0),
        ) +
        (c.notMineToCarry ? 5.5 : 0) +
        5,
    );
    const total = 50 + rhythmH + 5 + langH + 4 + dynH + 4 + panelH + 4 + hardH + 4 + boundH;
    return { caps, langH, dynH, panelH, hardH, boundH, total };
  };

  let layout = plan(capSets[0]);
  for (const caps of capSets) {
    layout = plan(caps);
    if (layout.total <= CONTENT_BOTTOM) break;
  }
  // Spend any leftover vertical slack on fewer truncated lines.
  for (const key of ["panel", "hard", "para", "bound", "dyn"] as const) {
    for (let i = 0; i < 4; i += 1) {
      const trial = plan({ ...layout.caps, [key]: layout.caps[key] + 1 });
      if (trial.total > CONTENT_BOTTOM) break;
      layout = trial;
    }
  }

  // ── How We Are Different (processing rhythms)
  let y = 54;
  s.frame(M, y, CW, rhythmH, CARD, GOLD);
  s.smallCaps("How We Are Different", M + 6, y + 7, GOLD, 7.4, "left", CW * 0.45);
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
  if (c.parentRhythm) rhythmRow(parentName, c.parentRhythm, y + 12.8, BURGUNDY);
  if (c.childRhythm) rhythmRow(childName, c.childRhythm, y + 18.4, SAGE);
  y += rhythmH + 6;

  // ── Two columns: child's emotional language / parent's emotional language
  const langTop = y;
  s.smallCaps(`${childFirstName}'s Emotional Language`, M, langTop, BURGUNDY, 7.4, "left", colW);
  s.smallCaps(`${parentFirstName}'s Emotional Language`, colX2, langTop, BURGUNDY, 7.4, "left", colW);
  s.hair(M, langTop + 2.4, M + colW);
  s.hair(colX2, langTop + 2.4, colX2 + colW);
  s.paragraph(c.emotionalLanguage, M, langTop + 8, colW, layout.caps.para);
  s.paragraph(c.parentEmotionalLanguage, colX2, langTop + 8, colW, layout.caps.para);
  y = langTop + layout.langH + 5;

  // ── The dynamic between you (full width, with auditable sources)
  const dynTop = y;
  s.smallCaps("The Dynamic Between You", M, dynTop, BURGUNDY, 7.4);
  s.hair(M, dynTop + 2.4, PW - M);
  s.paragraph(c.dynamic, M, dynTop + 8, CW, layout.caps.dyn);
  if (c.sourceLabels.length) {
    d.setFont("helvetica", "normal");
    d.setFontSize(6.8);
    d.setTextColor(...SOFT);
    const labels = c.sourceLabels.join("   \u00B7   ");
    const line = (d.splitTextToSize(labels, CW) as string[])[0];
    d.text(line, M, dynTop + layout.dynH - 1);
  }
  y = dynTop + layout.dynH + 5;

  // ── Balanced mini-panels
  s.frame(M, y, colW, layout.panelH, CARD, GOLD);
  s.frame(colX2, y, colW, layout.panelH, CARD, SAGE);
  s.smallCaps(`What ${childFirstName} Needs From Me`, M + 5, y + 7, GOLD, 7, "left", colW - 10);
  s.smallCaps(`What ${childFirstName} Is Learning From Me`, colX2 + 5, y + 7, SAGE, 7, "left", colW - 10);
  s.bulletList(c.needs, M + 5, y + 13.5, colW - 10, layout.caps.panel, GOLD);
  s.bulletList(c.learning, colX2 + 5, y + 13.5, colW - 10, layout.caps.panel, SAGE);
  y += layout.panelH + 5;

  // ── What makes things harder / what helps
  s.smallCaps("What Makes Things Harder", M, y, BURGUNDY, 7.4);
  s.smallCaps("What Helps", colX2, y, SAGE, 7.4);
  s.hair(M, y + 2.4, M + colW);
  s.hair(colX2, y + 2.4, colX2 + colW);
  s.bulletList(c.harder, M, y + 9, colW - 2, layout.caps.hard, BURGUNDY, 8.8, 4.3);
  s.bulletList(c.whenHard, colX2, y + 9, colW - 2, layout.caps.hard, SAGE, 8.8, 4.3);
  y += layout.hardH + 5;

  // ── Parent's responsibility / child's responsibility
  const boundH = Math.min(layout.boundH, MSG_TOP - 5 - y);
  s.frame(M, y, CW, boundH, undefined, BURGUNDY);
  s.smallCaps(`${parentFirstName}'s Responsibility`, M + 6, y + 7, BURGUNDY, 7, "left", colW - 12);
  s.smallCaps(`${childFirstName}'s Responsibility`, colX2 + 1, y + 7, SAGE, 7, "left", colW - 8);
  s.bulletList(c.yours, M + 6, y + 13, colW - 12, layout.caps.bound, BURGUNDY, 8.4, 4.0);
  s.bulletList(c.notYours, colX2 + 1, y + 13, colW - 8, layout.caps.bound, SAGE, 8.4, 4.0);
  if (c.notMineToCarry) {
    d.setFont("times", "italic");
    d.setFontSize(7.8);
    d.setTextColor(...SOFT);
    const note = `Not mine to carry: ${c.notMineToCarry}`;
    const line = (d.splitTextToSize(note, CW - 14) as string[])[0];
    d.text(line, M + 6, y + boundH - 4);
  }


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

import React, { useState, useMemo, useCallback } from "react";
import { Search, ChevronDown, ChevronUp, LayoutGrid, Table2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { normalizeCity, normalizeSummaryItem, normalizeBullet, isBlank } from "@/lib/normalizeReadingSection";
import { DriftBanner } from "./DriftBanner";
import { GateBanner, GateReport } from "./GateBanner";

// Types for structured reading
export interface PlacementRow {
  planet: string;
  symbol: string;
  degrees: string;
  sign: string;
  house: number | string;
}

export interface NarrativeBullet {
  label: string;
  text: string;
}

export interface PlacementTableSection {
  type: "placement_table";
  title: string;
  rows: PlacementRow[];
}

export interface NarrativeSection {
  type: "narrative_section";
  title: string;
  subtitle?: string;
  body: string;
  bullets: NarrativeBullet[];
}

export interface TimingTransit {
  planet: string;
  symbol: string;
  position: string;
  interpretation: string;
  // Rich fields from deterministic timing (optional for backward compatibility)
  aspect?: string;
  exact_degree?: string;
  natal_point?: string;
  first_applying_date?: string;
  exact_hit_date?: string;
  separating_end_date?: string;
  pass_label?: string;
  date_range?: string;
  tag?: string;
}

export interface TimingWindow {
  label: string;
  description: string;
}

export interface TimingSection {
  type: "timing_section";
  title: string;
  transits: TimingTransit[];
  windows: TimingWindow[];
}

const TAG_DETAILS: Record<string, { label: string; tone: string; watch: string }> = {
  meeting:    { label: "Meeting energy",          tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30", watch: "Say yes to invitations and introductions you'd normally skip — this is when new people enter through unexpected doors." },
  attraction: { label: "Attraction spike",        tone: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/30",             watch: "Chemistry feels louder than usual. Notice who you keep thinking about, but wait two weeks before deciding if it's real connection or just heat." },
  commitment: { label: "Define-the-relationship", tone: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",             watch: "This is the window for the honest conversation — what are we, where is this going, what do I actually need? Lukewarm answers are an answer." },
  test:       { label: "Pressure test",           tone: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",         watch: "Old patterns and unspoken doubts surface. Don't make permanent decisions in the heat of it — let it show you what's true, then act." },
  rupture:    { label: "Sudden shift",            tone: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30",                 watch: "Something changes faster than expected — a person leaves, a feeling flips, a need for space gets loud. Resist forcing it back." },
  healing:    { label: "Repair window",           tone: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/30",     watch: "A softer opening to repair, forgive, or be vulnerable. Reach out to the person you've been avoiding the conversation with." },
};

export interface SummaryItem {
  label: string;
  value: string;
}

export interface SummaryBoxSection {
  type: "summary_box";
  title: string;
  body?: string;
  items: SummaryItem[];
}

export interface ElementEntry {
  name: string;
  symbol: string;
  count: number;
  planets: string[];
  interpretation: string;
}

export interface ModalityEntry {
  name: string;
  count: number;
  planets: string[];
  interpretation: string;
}

export interface PolarityEntry {
  name: string;
  symbol: string;
  signs?: string[];
  count: number;
  planets: string[];
  interpretation: string;
}

export interface ModalityElementSection {
  type: "modality_element";
  title: string;
  body?: string;
  elements: ElementEntry[];
  modalities: ModalityEntry[];
  polarity?: PolarityEntry[];
  dominant_element: string;
  dominant_modality: string;
  dominant_polarity?: string;
  balance_interpretation: string;
}

export interface CityEntry {
  name: string;
  lines: string[];
  theme: string;
  score: number;
  mode?: string;
  country?: string;
  region?: string;
  tags?: string[];
  home_score?: number;
  career_score?: number;
  love_score?: number;
  healing_score?: number;
  vitality_score?: number;
  risk_score?: number;
  supports?: string;
  cautions?: string;
  explanation?: string;
  // Future fields for astrocartography / relocated chart modes
  planetary_lines?: string[];
  line_distance_km?: number;
  line_strength?: string;
  relocated_chart_notes?: string;
  benefics_on_angles?: string[];
  challenging_planets_on_angles?: string[];
  // Expanded detail fields
  why_it_works?: string;
  tradeoffs?: string;
  best_for?: string;
  timeframe_notes?: string;
  mode_explainer?: string;
}

export interface CityComparisonSection {
  type: "city_comparison";
  title: string;
  cities: CityEntry[];
}

export type ReadingSection =
  | PlacementTableSection
  | NarrativeSection
  | TimingSection
  | SummaryBoxSection
  | CityComparisonSection
  | ModalityElementSection;

export interface StructuredReading {
  subject: string;
  birth_info: string;
  question_type: string;
  question_asked: string;
  generated_date: string;
  sections: ReadingSection[];
  _validation?: {
    fixed_counts?: Array<{ section: string; from: string; to: string }>;
    stripped_aspects?: Array<{ section: string; phrase: string; reason?: string }>;
    stripped_dates?: Array<{ section: string; phrase: string }>;
    stripped_planets?: Array<{ section: string; phrase: string }>;
    drift_count?: number;
  };
  _gate?: GateReport;
}

function PlacementTable({ section }: { section: PlacementTableSection }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="bg-primary/5 px-4 py-2.5 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase">{section.title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Planet</th>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Degrees</th>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Sign</th>
              <th className="text-center px-3 py-2 font-medium text-muted-foreground">House</th>
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, i) => (
              <tr key={i} className={`border-b border-border/50 ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                <td className="px-3 py-2 font-medium text-foreground">
                  <span className="text-primary mr-1.5">{row.symbol}</span>
                  {row.planet}
                </td>
                <td className="px-3 py-2 text-foreground tabular-nums">{row.degrees}</td>
                <td className="px-3 py-2 text-foreground">{row.sign}</td>
                <td className="px-3 py-2 text-center text-foreground font-medium">{row.house}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Shared "is this string actually meaningful?" guard ───────────────
// Used by every renderer that displays AI-generated text. Catches blanks,
// whitespace-only strings, NBSP/zero-width chars, lone punctuation/dashes
// ("—", "..."), and common filler placeholders ("n/a", "tbd", etc.).
function isEffectivelyEmpty(raw?: string | null): boolean {
  if (!raw) return true;
  const cleaned = raw
    .replace(/[\u00A0\u200B-\u200D\uFEFF]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length === 0) return true;
  const stripped = cleaned.replace(/[\s\-–—•·.,:;…"'`*_()[\]{}]/g, "");
  if (stripped.length < 3) return true;
  const lower = cleaned.toLowerCase();
  const fillers = ["n/a", "tbd", "todo", "placeholder", "—", "...", "tba", "none"];
  if (fillers.includes(lower)) return true;
  return false;
}

function NarrativeCard({ section }: { section: NarrativeSection }) {
  const validBullets = (section.bullets ?? []).filter((b) => {
    if (isEffectivelyEmpty(b.text)) {
      console.warn("[NarrativeCard] Suppressing empty bullet", { label: b.label, text: b.text });
      return false;
    }
    return true;
  });
  const hasBody = !isEffectivelyEmpty(section.body);
  if (!hasBody && validBullets.length === 0) {
    console.warn("[NarrativeCard] Suppressing empty section", { title: section.title });
    return null;
  }
  return (
    <Card className="border-border">
      <CardContent className="pt-5 pb-4 space-y-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
          {section.subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{section.subtitle}</p>
          )}
        </div>
        {hasBody && (
          <p className="text-sm text-foreground/90 leading-relaxed">{section.body}</p>
        )}
        {validBullets.length > 0 && (
          <div className="space-y-2 pt-1">
            {validBullets.map((b, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-primary font-semibold text-sm shrink-0">{b.label}:</span>
                <span className="text-sm text-foreground/80">{b.text}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TimingCard({ section }: { section: TimingSection }) {
  // Bug 1 — defensive client-side guard: skip any transit entry that has no
  // *meaningful* interpretation body OR no natal target. Uses the shared
  // isEffectivelyEmpty util defined at module scope.
  const validTransits = (section.transits ?? []).filter((t) => {
    const hasBody = !isEffectivelyEmpty(t.interpretation);
    const hasNatalTarget = !!t.natal_point && t.natal_point.trim().length > 0;
    if (!hasBody || !hasNatalTarget) {
      console.warn("[TimingCard] Suppressing empty transit entry", {
        planet: t.planet,
        natal_point: t.natal_point,
        date_range: t.date_range,
        interpretation: t.interpretation,
      });
      return false;
    }
    return true;
  });

  // Same guard for the "Window Overview" cards at the bottom — a label
  // without a real description is just a dangling header.
  const validWindows = (section.windows ?? []).filter((w) => {
    const hasLabel = !!w.label && w.label.trim().length > 0;
    const hasDesc = !isEffectivelyEmpty(w.description);
    if (!hasLabel || !hasDesc) {
      console.warn("[TimingCard] Suppressing empty window", { label: w.label, description: w.description });
      return false;
    }
    return true;
  });

  // Group multi-pass transits (same planet + aspect + natal_point) so users see the whole cycle as one chapter
  const grouped = validTransits.reduce<Record<string, TimingTransit[]>>((acc, t) => {
    const key = `${t.planet}|${t.aspect ?? ""}|${t.natal_point ?? t.position}`;
    (acc[key] ||= []).push(t);
    return acc;
  }, {});

  // If both transits and windows are empty, suppress the entire timing card
  if (Object.keys(grouped).length === 0 && validWindows.length === 0) {
    console.warn("[TimingCard] Suppressing empty timing section", { title: section.title });
    return null;
  }


  return (
    <Card className="border-border">
      <CardContent className="pt-5 pb-4 space-y-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Each window below is a real moment in your relationship world. The dates are calculated from your chart — not guessed. Read the tag, the date range, and the "what to watch for" line together.
          </p>
        </div>

        {Object.values(grouped).length > 0 && (
          <div className="space-y-4">
            {Object.values(grouped).map((passes, gi) => {
              const head = passes[0];
              const tagInfo = head.tag ? TAG_DETAILS[head.tag] : null;
              const isMultiPass = passes.length > 1;

              return (
                <div key={gi} className="rounded-lg border border-border bg-card/40 overflow-hidden">
                  {/* Header: planet · aspect · natal target · tag chip */}
                  <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-muted/40 border-b border-border">
                    <span className="text-primary text-base">{head.symbol}</span>
                    <span className="text-sm font-semibold text-foreground">
                      {head.planet}
                      {head.aspect ? <span className="text-muted-foreground font-normal"> {head.aspect} </span> : " "}
                      {head.natal_point ? <span className="text-foreground/80">natal {head.natal_point}</span> : null}
                    </span>
                    {tagInfo && (
                      <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full border font-medium ${tagInfo.tone}`}>
                        {tagInfo.label}
                      </span>
                    )}
                  </div>

                  {/* Each pass */}
                  <div className="divide-y divide-border">
                    {passes.map((t, i) => (
                      <div key={i} className="px-3 py-3 space-y-2">
                        {/* Date strip */}
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          {t.date_range && (
                            <span className="text-sm font-semibold text-primary">{t.date_range}</span>
                          )}
                          {isMultiPass && t.pass_label && t.pass_label !== "single pass" && (
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                              {t.pass_label}
                            </span>
                          )}
                          {/retrograde|\bR\b|\(R\)/i.test(t.exact_degree ?? "") && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold">
                              Retrograde
                            </span>
                          )}
                        </div>

                        {/* Applying → Exact → Separating timeline */}
                        {(t.first_applying_date || t.exact_hit_date || t.separating_end_date) && (
                          <div className="grid grid-cols-3 gap-2 text-[11px]">
                            <div>
                              <div className="text-muted-foreground uppercase tracking-wider text-[9px]">Builds</div>
                              <div className="text-foreground/85">{t.first_applying_date || "—"}</div>
                            </div>
                            <div>
                              <div className="text-primary uppercase tracking-wider text-[9px] font-semibold">Peaks</div>
                              <div className="text-foreground font-medium">{t.exact_hit_date || "—"}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground uppercase tracking-wider text-[9px]">Settles</div>
                              <div className="text-foreground/85">{t.separating_end_date || "—"}</div>
                            </div>
                          </div>
                        )}

                        {/* Felt-sense interpretation */}
                        <p className="text-sm text-foreground/90 leading-relaxed">{t.interpretation}</p>

                        {/* What to watch for — actionable, derived from tag */}
                        {tagInfo?.watch && (
                          <div className="text-[12px] text-foreground/80 bg-muted/40 rounded px-2.5 py-2 border-l-2 border-primary/50">
                            <span className="font-semibold text-primary">What to watch for:</span> {tagInfo.watch}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {validWindows.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Window Overview</p>
            {validWindows.map((w, i) => (
              <div key={i} className="rounded-md bg-muted/30 p-3">
                <div className="text-sm font-semibold text-primary mb-1">{w.label}</div>
                <p className="text-sm text-foreground/85 leading-relaxed">{w.description}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryBox({ section }: { section: SummaryBoxSection }) {
  const validItems = (section.items ?? []).filter((item) => {
    if (isEffectivelyEmpty(item.value)) {
      console.warn("[SummaryBox] Suppressing empty item", { label: item.label, value: item.value });
      return false;
    }
    return true;
  });
  const hasBody = !isEffectivelyEmpty(section.body);
  if (!hasBody && validItems.length === 0) {
    console.warn("[SummaryBox] Suppressing empty summary box", { title: section.title });
    return null;
  }
  return (
    <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
      <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
      {hasBody && (
        <p className="text-sm text-foreground/90 leading-relaxed">{section.body}</p>
      )}
      {validItems.length > 0 && (
        <div className="space-y-2">
          {validItems.map((item, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-sm font-bold text-primary shrink-0 min-w-[60px]">{item.label}</span>
              <span className="text-sm text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Score utilities ───────────────────────────────────────────────────

function scorePillClass(value: number, isRisk = false): string {
  if (isRisk) {
    if (value <= 3) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
    if (value <= 6) return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
    return "bg-red-500/15 text-red-700 dark:text-red-400";
  }
  if (value >= 9) return "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold";
  if (value >= 7) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
  if (value >= 4) return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  return "bg-red-500/15 text-red-700 dark:text-red-400";
}

function ScorePill({ value, isRisk = false }: { value?: number; isRisk?: boolean }) {
  if (value == null) return <span className="text-muted-foreground">–</span>;
  return (
    <span className={`inline-flex items-center justify-center min-w-[28px] px-1.5 py-0.5 rounded-md text-[11px] font-semibold tabular-nums ${scorePillClass(value, isRisk)}`}>
      {value}
    </span>
  );
}

function ScoreBar({ label, value, max = 10 }: { label: string; value?: number; max?: number }) {
  if (value == null) return null;
  const pct = (value / max) * 100;
  const isRisk = label.toLowerCase() === "risk";
  const barColor = isRisk
    ? (value <= 3 ? "bg-emerald-500/70" : value <= 6 ? "bg-amber-500/70" : "bg-red-500/70")
    : (value >= 7 ? "bg-emerald-500/70" : value >= 4 ? "bg-amber-500/70" : "bg-red-500/70");
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-12 shrink-0">{label}</span>
      <div className="flex-1 bg-muted rounded-full h-1.5">
        <div className={`${barColor} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <ScorePill value={value} isRisk={isRisk} />
    </div>
  );
}

// ─── Analysis mode banner ─────────────────────────────────────────────

function AnalysisModeBanner({ mode }: { mode: string }) {
  const isAstrocartography = mode?.toLowerCase().includes("astrocartography");
  const isRelocated = mode?.toLowerCase().includes("relocated");

  if (isAstrocartography) {
    return (
      <div className="rounded-md px-3 py-2 text-xs border bg-blue-500/10 border-blue-500/30 text-blue-800 dark:text-blue-300">
        <span className="font-semibold">🗺️ Astrocartography-Based Recommendation</span>
        <span className="block mt-0.5 opacity-80">
          These recommendations include calculated planetary angular lines with measured distances.
        </span>
      </div>
    );
  }
  if (isRelocated) {
    return (
      <div className="rounded-md px-3 py-2 text-xs border bg-violet-500/10 border-violet-500/30 text-violet-800 dark:text-violet-300">
        <span className="font-semibold">📐 Relocated Chart Analysis</span>
        <span className="block mt-0.5 opacity-80">
          These recommendations include relocated chart interpretation showing shifted angles and houses for each city.
        </span>
      </div>
    );
  }
  return (
    <div className="rounded-md px-3 py-2 text-xs border bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300">
      <span className="font-semibold">📊 Astrology-Based Relocation Guidance</span>
      <span className="block mt-0.5 opacity-80">
        City recommendations are derived from natal chart themes and solar return patterns — not from calculated planetary map lines. Scores reflect symbolic environmental fit, not geographic line proximity.
      </span>
    </div>
  );
}

// ─── Expanded city detail panel ───────────────────────────────────────

function CityDetailPanel({ city }: { city: CityEntry }) {
  const details = [
    { key: "why_it_works", label: "Why It Works", value: city.why_it_works || city.explanation },
    { key: "tradeoffs", label: "Tradeoffs", value: city.tradeoffs },
    { key: "best_for", label: "Best For", value: city.best_for },
    { key: "timeframe_notes", label: "Timeframe Notes", value: city.timeframe_notes },
    { key: "mode_explainer", label: "Analysis Note", value: city.mode_explainer },
  ].filter(d => d.value);

  if (details.length === 0) return null;

  return (
    <div className="mt-2 pt-2 border-t border-border space-y-2">
      {details.map(d => (
        <div key={d.key}>
          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">{d.label}</span>
          <p className="text-xs text-foreground/80 leading-relaxed mt-0.5">{d.value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Card view ────────────────────────────────────────────────────────

function CityCardView({ city }: { city: CityEntry }) {
  const [expanded, setExpanded] = useState(false);
  const hasSubScores = city.home_score != null || city.career_score != null;
  const isCaution = (city.risk_score ?? 0) >= 7 || city.score <= 4;
  const displayName = city.country ? `${city.name}, ${city.country}` : city.name;
  const isAstrocartography = city.mode?.toLowerCase().includes("astrocartography");

  return (
    <div
      className={`rounded-lg border p-3 cursor-pointer transition-all hover:shadow-sm ${
        isCaution ? "border-destructive/30 bg-destructive/5" : "border-border"
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-foreground">{displayName}</span>
          {city.mode && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
              isAstrocartography
                ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
            }`}>{city.mode}</span>
          )}
          {city.region && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/50 text-accent-foreground">{city.region}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <ScorePill value={city.score} />
          {expanded ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-2">{city.theme}</p>

      {/* Tags */}
      {city.tags && city.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {city.tags.map((tag, j) => (
            <span key={j} className="text-[10px] px-1.5 py-0.5 rounded-full border border-primary/20 text-primary/80 bg-primary/5">{tag}</span>
          ))}
        </div>
      )}

      {/* Sub-scores */}
      {hasSubScores && (
        <div className="space-y-1 mb-2">
          <ScoreBar label="Home" value={city.home_score} />
          <ScoreBar label="Career" value={city.career_score} />
          <ScoreBar label="Love" value={city.love_score} />
          <ScoreBar label="Healing" value={city.healing_score} />
          <ScoreBar label="Vitality" value={city.vitality_score} />
          <ScoreBar label="Risk" value={city.risk_score} />
        </div>
      )}

      {/* Chart basis / Lines */}
      {city.lines && city.lines.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          <span className="text-[10px] font-medium text-muted-foreground mr-0.5">
            {isAstrocartography ? "Lines:" : "Chart Basis:"}
          </span>
          {city.lines.map((line, j) => (
            <span key={j} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-foreground/80">{line}</span>
          ))}
        </div>
      )}

      {/* Supports / Cautions */}
      {city.supports && (
        <p className="text-[11px] text-emerald-700 dark:text-emerald-400">✓ {city.supports}</p>
      )}
      {city.cautions && (
        <p className="text-[11px] text-destructive">⚠ {city.cautions}</p>
      )}

      {/* Expanded detail */}
      {expanded && <CityDetailPanel city={city} />}
      {!expanded && (city.explanation || city.why_it_works) && (
        <p className="text-[10px] text-muted-foreground mt-1">Tap to expand details →</p>
      )}
    </div>
  );
}

// ─── Sorting ──────────────────────────────────────────────────────────

type SortKey = "overall" | "home" | "career" | "love" | "healing" | "vitality" | "risk" | "city";
type SortDir = "asc" | "desc";

function sortCities(cities: CityEntry[], sortBy: SortKey, dir: SortDir = "desc"): CityEntry[] {
  const getVal = (c: CityEntry): number | string => {
    switch (sortBy) {
      case "home": return c.home_score ?? 0;
      case "career": return c.career_score ?? 0;
      case "love": return c.love_score ?? 0;
      case "healing": return c.healing_score ?? 0;
      case "vitality": return c.vitality_score ?? 0;
      case "risk": return c.risk_score ?? 10;
      case "city": return c.name.toLowerCase();
      default: return c.score;
    }
  };
  return [...cities].sort((a, b) => {
    const va = getVal(a); const vb = getVal(b);
    if (typeof va === "string" && typeof vb === "string") return dir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    const na = va as number; const nb = vb as number;
    // For risk, lower is better in "desc" (best first)
    if (sortBy === "risk") return dir === "desc" ? na - nb : nb - na;
    return dir === "desc" ? nb - na : na - nb;
  });
}

// ─── Table view ───────────────────────────────────────────────────────

function CityTableView({ cities, sortBy, sortDir, onSort }: {
  cities: CityEntry[];
  sortBy: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const hasSubScores = cities.some(c => c.home_score != null);
  const isAstrocartography = cities.some(c => c.mode?.toLowerCase().includes("astrocartography"));
  const hasRelocated = cities.some(c => c.relocated_chart_notes);

  const SortHeader = ({ label, colKey }: { label: string; colKey: SortKey }) => (
    <th
      className="text-center px-1.5 py-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
      onClick={() => onSort(colKey)}
    >
      <span className="inline-flex items-center gap-0.5">
        {label}
        {sortBy === colKey && (
          <span className="text-primary text-[9px]">{sortDir === "desc" ? "▼" : "▲"}</span>
        )}
      </span>
    </th>
  );

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <SortHeader label="City" colKey="city" />
            {hasSubScores && (
              <>
                <SortHeader label="Home" colKey="home" />
                <SortHeader label="Career" colKey="career" />
                <SortHeader label="Love" colKey="love" />
                <SortHeader label="Heal" colKey="healing" />
                <SortHeader label="Vital" colKey="vitality" />
                <SortHeader label="Risk" colKey="risk" />
              </>
            )}
            <SortHeader label="Overall" colKey="overall" />
            <th className="text-left px-2 py-2 font-medium text-muted-foreground">Theme</th>
            {isAstrocartography && (
              <th className="text-left px-2 py-2 font-medium text-muted-foreground">Lines</th>
            )}
            {hasRelocated && (
              <th className="text-left px-2 py-2 font-medium text-muted-foreground">Relocated Notes</th>
            )}
          </tr>
        </thead>
        <tbody>
          {cities.map((city, i) => {
            const isCaution = (city.risk_score ?? 0) >= 7 || city.score <= 4;
            const displayName = city.country ? `${city.name}, ${city.country}` : city.name;
            const isExpanded = expandedIdx === i;

            return (
              <React.Fragment key={i}>
                <tr
                  className={`border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/20 ${
                    isCaution ? "bg-destructive/5" : i % 2 === 0 ? "" : "bg-muted/10"
                  }`}
                  onClick={() => setExpandedIdx(isExpanded ? null : i)}
                >
                  <td className="px-2 py-2 font-medium text-foreground whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {isExpanded ? <ChevronUp className="h-3 w-3 text-muted-foreground shrink-0" /> : <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />}
                      <span>{displayName}</span>
                      {city.region && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-accent/40 text-accent-foreground">{city.region}</span>
                      )}
                    </div>
                  </td>
                  {hasSubScores && (
                    <>
                      <td className="text-center px-1 py-2"><ScorePill value={city.home_score} /></td>
                      <td className="text-center px-1 py-2"><ScorePill value={city.career_score} /></td>
                      <td className="text-center px-1 py-2"><ScorePill value={city.love_score} /></td>
                      <td className="text-center px-1 py-2"><ScorePill value={city.healing_score} /></td>
                      <td className="text-center px-1 py-2"><ScorePill value={city.vitality_score} /></td>
                      <td className="text-center px-1 py-2"><ScorePill value={city.risk_score} isRisk /></td>
                    </>
                  )}
                  <td className="text-center px-1 py-2">
                    <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-md text-xs font-bold bg-primary/15 text-primary tabular-nums">
                      {city.score}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-foreground/80 max-w-[200px] truncate">{city.theme}</td>
                  {isAstrocartography && (
                    <td className="px-2 py-2">
                      {city.planetary_lines?.map((l, j) => (
                        <span key={j} className="text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-400 px-1 py-0.5 rounded mr-0.5">{l}</span>
                      )) || (city.lines?.map((l, j) => (
                        <span key={j} className="text-[10px] bg-muted px-1 py-0.5 rounded mr-0.5">{l}</span>
                      )))}
                    </td>
                  )}
                  {hasRelocated && (
                    <td className="px-2 py-2 text-foreground/70 max-w-[180px] truncate">{city.relocated_chart_notes || "–"}</td>
                  )}
                </tr>
                {isExpanded && (
                  <tr className="bg-muted/5">
                    <td colSpan={20} className="px-4 py-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Left: details */}
                        <div className="space-y-2">
                          <CityDetailPanel city={city} />
                          {city.supports && (
                            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">✓ Supports: {city.supports}</p>
                          )}
                          {city.cautions && (
                            <p className="text-[11px] text-destructive">⚠ Cautions: {city.cautions}</p>
                          )}
                        </div>
                        {/* Right: tags + lines */}
                        <div className="space-y-2">
                          {city.tags && city.tags.length > 0 && (
                            <div>
                              <span className="text-[10px] font-semibold text-muted-foreground uppercase">Tags</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {city.tags.map((tag, j) => (
                                  <span key={j} className="text-[10px] px-1.5 py-0.5 rounded-full border border-primary/20 text-primary/80 bg-primary/5">{tag}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {city.lines && city.lines.length > 0 && (
                            <div>
                              <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                                {city.mode?.toLowerCase().includes("astrocartography") ? "Planetary Lines" : "Chart Basis"}
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {city.lines.map((line, j) => (
                                  <span key={j} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-foreground/80">{line}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {city.benefics_on_angles && city.benefics_on_angles.length > 0 && (
                            <div>
                              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">Benefics on Angles</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {city.benefics_on_angles.map((b, j) => (
                                  <span key={j} className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded">{b}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {city.challenging_planets_on_angles && city.challenging_planets_on_angles.length > 0 && (
                            <div>
                              <span className="text-[10px] font-semibold text-destructive uppercase">Challenging Angles</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {city.challenging_planets_on_angles.map((c, j) => (
                                  <span key={j} className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">{c}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main CityComparison component ────────────────────────────────────

const ALL_TAGS = [
  "Water-Supportive", "Structured", "Social", "Quiet", "Career-Active",
  "Healing-Oriented", "High-Intensity", "Romantic", "Grounding", "Transformational",
];

const SORT_OPTIONS: { key: SortKey; dir: SortDir; label: string }[] = [
  { key: "overall", dir: "desc", label: "Highest Overall" },
  { key: "home", dir: "desc", label: "Best for Home" },
  { key: "career", dir: "desc", label: "Best for Career" },
  { key: "love", dir: "desc", label: "Best for Love" },
  { key: "healing", dir: "desc", label: "Best for Healing" },
  { key: "vitality", dir: "desc", label: "Best for Vitality" },
  { key: "risk", dir: "desc", label: "Lowest Risk" },
  { key: "city", dir: "asc", label: "Alphabetical" },
];

function CityComparison({ section }: { section: CityComparisonSection }) {
  const [viewMode, setViewMode] = useState<"card" | "table">("table");
  const [sortBy, setSortBy] = useState<SortKey>("overall");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [regionFilter, setRegionFilter] = useState("All");

  // Run every city through the shared normalizer so that a missing AI
  // field (theme, supports, explanation, lines, ...) can never produce a
  // blank slot in the card or table. Same helper feeds the PDF exporter,
  // so on-screen and printed output stay in sync.
  const normalizedCities = useMemo<CityEntry[]>(
    () => (section.cities ?? []).map((c) => normalizeCity(c) as CityEntry),
    [section.cities],
  );

  const isCautionSection = /caution/i.test(section.title);
  const hasSubScores = normalizedCities.some(c => c.home_score != null);
  const sectionMode = normalizedCities[0]?.mode || "Astrology-Based";

  // Available regions from data
  const regions = useMemo(() => {
    const r = new Set(normalizedCities.map(c => c.region).filter(Boolean) as string[]);
    return ["All", ...Array.from(r).sort()];
  }, [normalizedCities]);

  // Available tags from data
  const availableTags = useMemo(() => {
    const t = new Set<string>();
    normalizedCities.forEach(c => c.tags?.forEach(tag => t.add(tag)));
    return ALL_TAGS.filter(tag => t.has(tag));
  }, [normalizedCities]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
  }, []);

  const handleSort = useCallback((key: SortKey) => {
    if (key === sortBy) {
      setSortDir(d => d === "desc" ? "asc" : "desc");
    } else {
      setSortBy(key);
      setSortDir(key === "city" ? "asc" : "desc");
    }
  }, [sortBy]);

  const filteredCities = useMemo(() => {
    let result = normalizedCities;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.country?.toLowerCase().includes(q)) ||
        (c.region?.toLowerCase().includes(q)) ||
        (c.theme?.toLowerCase().includes(q))
      );
    }

    // Region
    if (regionFilter !== "All") {
      result = result.filter(c => c.region === regionFilter);
    }

    // Tags
    if (selectedTags.size > 0) {
      result = result.filter(c =>
        c.tags?.some(t => selectedTags.has(t))
      );
    }

    return sortCities(result, sortBy, sortDir);
  }, [normalizedCities, searchQuery, regionFilter, selectedTags, sortBy, sortDir]);

  return (
    <Card className={`border-border ${isCautionSection ? "border-destructive/20" : ""}`}>
      <CardContent className="pt-5 pb-4 space-y-3">
        {/* Title row */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className={`text-sm font-semibold tracking-wide uppercase ${isCautionSection ? "text-destructive" : "text-foreground"}`}>
            {isCautionSection ? "⚠ " : ""}{section.title}
          </h3>
          <div className="flex gap-1 items-center">
            <button
              onClick={() => setViewMode("card")}
              className={`p-1 rounded ${viewMode === "card" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
              title="Card view"
            ><LayoutGrid className="h-3.5 w-3.5" /></button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1 rounded ${viewMode === "table" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
              title="Table view"
            ><Table2 className="h-3.5 w-3.5" /></button>
          </div>
        </div>

        {/* Mode banner */}
        <AnalysisModeBanner mode={sectionMode} />

        {/* Filters bar */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[160px] max-w-[260px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search city, country, theme…"
              className="w-full text-xs pl-6 pr-2 py-1.5 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>

          {/* Region filter */}
          {regions.length > 2 && (
            <select
              value={regionFilter}
              onChange={e => setRegionFilter(e.target.value)}
              className="text-xs px-2 py-1.5 rounded-md border border-border bg-background text-foreground"
            >
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          )}

          {/* Sort */}
          {hasSubScores && (
            <select
              value={`${sortBy}:${sortDir}`}
              onChange={e => {
                const opt = SORT_OPTIONS.find(o => `${o.key}:${o.dir}` === e.target.value);
                if (opt) { setSortBy(opt.key); setSortDir(opt.dir); }
              }}
              className="text-xs px-2 py-1.5 rounded-md border border-border bg-background text-foreground"
            >
              {SORT_OPTIONS.map(o => (
                <option key={`${o.key}:${o.dir}`} value={`${o.key}:${o.dir}`}>{o.label}</option>
              ))}
            </select>
          )}
        </div>

        {/* Tag chips */}
        {availableTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                  selectedTags.has(tag)
                    ? "border-primary bg-primary/15 text-primary font-semibold"
                    : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >{tag}</button>
            ))}
            {selectedTags.size > 0 && (
              <button
                onClick={() => setSelectedTags(new Set())}
                className="text-[10px] px-2 py-0.5 rounded-full text-muted-foreground hover:text-foreground"
              >Clear</button>
            )}
          </div>
        )}

        {/* Content */}
        {filteredCities.length === 0 ? (
          <div className="text-center py-6 space-y-1">
            <p className="text-sm font-medium text-foreground">No cities match these filters</p>
            <p className="text-xs text-muted-foreground">Try removing a tag, changing the region, or clearing the search.</p>
          </div>
        ) : viewMode === "card" ? (
          <div className="space-y-3">
            {filteredCities.map((city, i) => (
              <CityCardView key={i} city={city} />
            ))}
          </div>
        ) : (
          <CityTableView cities={filteredCities} sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
        )}

        {/* Footer count */}
        <p className="text-[10px] text-muted-foreground text-right">
          {filteredCities.length} of {section.cities.length} cities
          {selectedTags.size > 0 || regionFilter !== "All" || searchQuery ? " (filtered)" : ""}
        </p>
      </CardContent>
    </Card>
  );
}
function ModalityElementCard({ section }: { section: ModalityElementSection }) {
  const totalPlanets = section.elements.reduce((s, e) => s + e.count, 0) || 10;
  const hasBody = !isEffectivelyEmpty(section.body);
  return (
    <Card className="border-border bg-card/50">
      <CardContent className="p-4 space-y-4">
        <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase">{section.title}</h3>
        {hasBody && (
          <p className="text-sm text-foreground/90 leading-relaxed">{section.body}</p>
        )}

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Elements</p>
          <div className="grid grid-cols-2 gap-2">
            {section.elements.map((el, i) => (
              <div key={i} className="rounded-lg border border-border p-2.5 bg-muted/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{el.symbol} {el.name}</span>
                  <span className="text-xs font-semibold text-primary">{el.count}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mb-1.5">
                  <div className="bg-primary/70 h-1.5 rounded-full transition-all" style={{ width: `${(el.count / totalPlanets) * 100}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">{(el.planets ?? []).join(", ")}</p>
                <p className="text-xs text-foreground/70 mt-1">{el.interpretation}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Modalities</p>
          <div className="space-y-2">
            {section.modalities.map((mod, i) => (
              <div key={i} className="rounded-lg border border-border p-2.5 bg-muted/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{mod.name}</span>
                  <span className="text-xs font-semibold text-primary">{mod.count}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mb-1.5">
                  <div className="bg-primary/70 h-1.5 rounded-full transition-all" style={{ width: `${(mod.count / totalPlanets) * 100}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">{(mod.planets ?? []).join(", ")}</p>
                <p className="text-xs text-foreground/70 mt-1">{mod.interpretation}</p>
              </div>
            ))}
          </div>
        </div>

        {section.polarity && section.polarity.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Polarity (Yin / Yang)</p>
            <div className="grid grid-cols-2 gap-2">
              {section.polarity.map((pol, i) => (
                <div key={i} className="rounded-lg border border-border p-2.5 bg-muted/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{pol.symbol} {pol.name}</span>
                    <span className="text-xs font-semibold text-primary">{pol.count}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 mb-1.5">
                    <div className="bg-primary/70 h-1.5 rounded-full transition-all" style={{ width: `${(pol.count / totalPlanets) * 100}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{(pol.planets ?? []).join(", ")}</p>
                  <p className="text-xs text-foreground/70 mt-1">{pol.interpretation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1">
          <p className="text-xs font-semibold text-primary">
            Dominant: {section.dominant_element} · {section.dominant_modality}{section.dominant_polarity ? ` · ${section.dominant_polarity}` : ''}
          </p>
          <p className="text-xs text-foreground/80">{section.balance_interpretation}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReadingRenderer({
  reading,
  onRegenerate,
}: {
  reading: StructuredReading;
  onRegenerate?: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Gate banner — only renders if Replit validation gate failed */}
      <GateBanner report={reading._gate} onRegenerate={onRegenerate} />

      {/* Drift banner — only renders if validator caught issues */}
      <DriftBanner report={reading._validation} onRegenerate={onRegenerate} />

      {/* Header */}
      <div className="text-center space-y-1 pb-2">
        <p className="text-xs text-muted-foreground">{reading.birth_info}</p>
        <p className="text-xs text-muted-foreground/60">{reading.generated_date}</p>
      </div>

      {/* Sections */}
      {reading.sections.map((section, i) => {
        switch (section.type) {
          case "placement_table":
            return <PlacementTable key={i} section={section} />;
          case "narrative_section":
            return <NarrativeCard key={i} section={section} />;
          case "timing_section":
            return <TimingCard key={i} section={section} />;
          case "summary_box":
            return <SummaryBox key={i} section={section} />;
          case "city_comparison":
            return <CityComparison key={i} section={section} />;
          case "modality_element":
            return <ModalityElementCard key={i} section={section} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

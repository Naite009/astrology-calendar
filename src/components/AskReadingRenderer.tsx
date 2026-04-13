import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";

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

export interface SummaryItem {
  label: string;
  value: string;
}

export interface SummaryBoxSection {
  type: "summary_box";
  title: string;
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

function NarrativeCard({ section }: { section: NarrativeSection }) {
  return (
    <Card className="border-border">
      <CardContent className="pt-5 pb-4 space-y-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
          {section.subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{section.subtitle}</p>
          )}
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed">{section.body}</p>
        {section.bullets.length > 0 && (
          <div className="space-y-2 pt-1">
            {section.bullets.map((b, i) => (
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
  return (
    <Card className="border-border">
      <CardContent className="pt-5 pb-4 space-y-4">
        <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
        {section.transits.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Active Transits</p>
            {section.transits.map((t, i) => (
              <div key={i} className="rounded-md bg-muted/40 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-primary">{t.symbol}</span>
                  <span className="text-sm font-medium text-foreground">{t.planet}</span>
                  <span className="text-xs text-muted-foreground ml-1">{t.position}</span>
                </div>
                <p className="text-sm text-foreground/80">{t.interpretation}</p>
              </div>
            ))}
          </div>
        )}
        {section.windows.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Key Dates</p>
            {section.windows.map((w, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-sm font-semibold text-primary shrink-0 min-w-[100px]">{w.label}</span>
                <span className="text-sm text-foreground/80">{w.description}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryBox({ section }: { section: SummaryBoxSection }) {
  return (
    <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
      <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
      <div className="space-y-2">
        {section.items.map((item, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-sm font-bold text-primary shrink-0 min-w-[60px]">{item.label}</span>
            <span className="text-sm text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreBar({ label, value, max = 10 }: { label: string; value?: number; max?: number }) {
  if (value == null) return null;
  const pct = (value / max) * 100;
  const color = value >= 7 ? "bg-green-500/70" : value >= 5 ? "bg-yellow-500/70" : "bg-red-500/70";
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-12 shrink-0">{label}</span>
      <div className="flex-1 bg-muted rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-semibold text-foreground w-4 text-right">{value}</span>
    </div>
  );
}

function CityCardView({ city }: { city: CityEntry }) {
  const [expanded, setExpanded] = useState(false);
  const hasSubScores = city.home_score != null || city.career_score != null;
  const isCaution = (city.risk_score ?? 0) >= 7 || city.score <= 4;
  const displayName = city.country ? `${city.name}, ${city.country}` : city.name;

  return (
    <div
      className={`rounded-lg border p-3 cursor-pointer transition-all hover:shadow-sm ${
        isCaution ? "border-red-500/30 bg-red-500/5" : "border-border"
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-foreground">{displayName}</span>
          {city.mode && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{city.mode}</span>
          )}
          {city.region && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/50 text-accent-foreground">{city.region}</span>
          )}
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
          isCaution ? "bg-red-500/10 text-red-600" : "bg-primary/10 text-primary"
        }`}>{city.score}/10</span>
      </div>
      <p className="text-xs text-muted-foreground mb-2">{city.theme}</p>

      {city.tags && city.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {city.tags.map((tag, j) => (
            <span key={j} className="text-[10px] px-1.5 py-0.5 rounded-full border border-primary/20 text-primary/80 bg-primary/5">{tag}</span>
          ))}
        </div>
      )}

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

      {city.lines && city.lines.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          <span className="text-[10px] font-medium text-muted-foreground mr-0.5">
            {city.mode?.toLowerCase().includes("astrocartography") ? "Lines:" : "Chart Basis:"}
          </span>
          {city.lines.map((line, j) => (
            <span key={j} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-foreground/80">{line}</span>
          ))}
        </div>
      )}

      {city.supports && (
        <p className="text-[11px] text-green-700 dark:text-green-400">✓ {city.supports}</p>
      )}
      {city.cautions && (
        <p className="text-[11px] text-red-600 dark:text-red-400">⚠ {city.cautions}</p>
      )}

      {expanded && city.explanation && (
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-xs text-foreground/80 leading-relaxed">{city.explanation}</p>
        </div>
      )}
      {!expanded && city.explanation && (
        <p className="text-[10px] text-muted-foreground mt-1">Tap to expand details →</p>
      )}
    </div>
  );
}

type SortKey = "overall" | "home" | "career" | "love" | "healing" | "vitality" | "risk";

function sortCities(cities: CityEntry[], sortBy: SortKey): CityEntry[] {
  const getVal = (c: CityEntry): number => {
    switch (sortBy) {
      case "home": return c.home_score ?? 0;
      case "career": return c.career_score ?? 0;
      case "love": return c.love_score ?? 0;
      case "healing": return c.healing_score ?? 0;
      case "vitality": return c.vitality_score ?? 0;
      case "risk": return -(c.risk_score ?? 10); // lower risk = better
      default: return c.score;
    }
  };
  return [...cities].sort((a, b) => getVal(b) - getVal(a));
}

function CityTableView({ cities }: { cities: CityEntry[] }) {
  const hasSubScores = cities.some(c => c.home_score != null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">City</th>
            {hasSubScores && (
              <>
                <th className="text-center px-1 py-1.5 font-medium text-muted-foreground">Home</th>
                <th className="text-center px-1 py-1.5 font-medium text-muted-foreground">Career</th>
                <th className="text-center px-1 py-1.5 font-medium text-muted-foreground">Love</th>
                <th className="text-center px-1 py-1.5 font-medium text-muted-foreground">Heal</th>
                <th className="text-center px-1 py-1.5 font-medium text-muted-foreground">Vital</th>
                <th className="text-center px-1 py-1.5 font-medium text-muted-foreground">Risk</th>
              </>
            )}
            <th className="text-center px-1 py-1.5 font-medium text-muted-foreground">Score</th>
            <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">Theme</th>
          </tr>
        </thead>
        <tbody>
          {cities.map((city, i) => {
            const isCaution = (city.risk_score ?? 0) >= 7 || city.score <= 4;
            const displayName = city.country ? `${city.name}, ${city.country}` : city.name;
            return (
              <tr key={i} className={`border-b border-border/50 ${isCaution ? "bg-red-500/5" : i % 2 === 0 ? "" : "bg-muted/10"}`}>
                <td className="px-2 py-1.5 font-medium text-foreground whitespace-nowrap">{displayName}</td>
                {hasSubScores && (
                  <>
                    <td className="text-center px-1 py-1.5 tabular-nums">{city.home_score ?? "–"}</td>
                    <td className="text-center px-1 py-1.5 tabular-nums">{city.career_score ?? "–"}</td>
                    <td className="text-center px-1 py-1.5 tabular-nums">{city.love_score ?? "–"}</td>
                    <td className="text-center px-1 py-1.5 tabular-nums">{city.healing_score ?? "–"}</td>
                    <td className="text-center px-1 py-1.5 tabular-nums">{city.vitality_score ?? "–"}</td>
                    <td className="text-center px-1 py-1.5 tabular-nums">{city.risk_score ?? "–"}</td>
                  </>
                )}
                <td className="text-center px-1 py-1.5 font-bold text-primary tabular-nums">{city.score}</td>
                <td className="px-2 py-1.5 text-foreground/80">{city.theme}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AnalysisModeBanner({ mode }: { mode: string }) {
  const isAstrology = !mode || mode.toLowerCase().includes("astrology");
  return (
    <div className={`rounded-md px-3 py-2 text-xs border ${
      isAstrology
        ? "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300"
        : "bg-blue-500/10 border-blue-500/30 text-blue-800 dark:text-blue-300"
    }`}>
      <span className="font-semibold">{isAstrology ? "📊 Astrology-Based Relocation Guidance" : "🗺️ Astrocartography-Based Recommendation"}</span>
      <span className="block mt-0.5 opacity-80">
        {isAstrology
          ? "City recommendations are derived from natal chart themes and solar return patterns — not from calculated planetary map lines. Scores reflect symbolic environmental fit, not geographic line proximity."
          : "City recommendations use calculated planetary angular lines with measured distances. Scores reflect line proximity and angular activation."}
      </span>
    </div>
  );
}

function CityComparison({ section }: { section: CityComparisonSection }) {
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [sortBy, setSortBy] = useState<SortKey>("overall");
  const isCautionSection = /caution/i.test(section.title);
  const hasSubScores = section.cities.some(c => c.home_score != null);

  const sortedCities = useMemo(() => sortCities(section.cities, sortBy), [section.cities, sortBy]);

  // Determine mode from the first city
  const sectionMode = section.cities[0]?.mode || "Astrology-Based";

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "overall", label: "Overall" },
    { key: "home", label: "Home" },
    { key: "career", label: "Career" },
    { key: "love", label: "Love" },
    { key: "healing", label: "Healing" },
    { key: "vitality", label: "Vitality" },
    { key: "risk", label: "Low Risk" },
  ];

  return (
    <Card className={`border-border ${isCautionSection ? "border-red-500/20" : ""}`}>
      <CardContent className="pt-5 pb-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className={`text-sm font-semibold tracking-wide uppercase ${isCautionSection ? "text-red-600 dark:text-red-400" : "text-foreground"}`}>
            {isCautionSection ? "⚠ " : ""}{section.title}
          </h3>
          <div className="flex gap-1 items-center">
            {hasSubScores && (
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-background text-foreground"
              >
                {sortOptions.map(o => (
                  <option key={o.key} value={o.key}>{o.label}</option>
                ))}
              </select>
            )}
            <button
              onClick={() => setViewMode("card")}
              className={`text-[10px] px-2 py-0.5 rounded ${viewMode === "card" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
            >Cards</button>
            <button
              onClick={() => setViewMode("table")}
              className={`text-[10px] px-2 py-0.5 rounded ${viewMode === "table" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
            >Table</button>
          </div>
        </div>
        <AnalysisModeBanner mode={sectionMode} />
        {viewMode === "card" ? (
          <div className="space-y-3">
            {sortedCities.map((city, i) => (
              <CityCardView key={i} city={city} />
            ))}
          </div>
        ) : (
          <CityTableView cities={sortedCities} />
        )}
      </CardContent>
    </Card>
  );
}
function ModalityElementCard({ section }: { section: ModalityElementSection }) {
  const totalPlanets = section.elements.reduce((s, e) => s + e.count, 0) || 10;
  return (
    <Card className="border-border bg-card/50">
      <CardContent className="p-4 space-y-4">
        <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase">{section.title}</h3>

        {/* Elements */}
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
                <p className="text-xs text-muted-foreground">{el.planets.join(", ")}</p>
                <p className="text-xs text-foreground/70 mt-1">{el.interpretation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Modalities */}
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
                <p className="text-xs text-muted-foreground">{mod.planets.join(", ")}</p>
                <p className="text-xs text-foreground/70 mt-1">{mod.interpretation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Polarity */}
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
                  <p className="text-xs text-muted-foreground">{pol.planets.join(", ")}</p>
                  <p className="text-xs text-foreground/70 mt-1">{pol.interpretation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dominant + Synthesis */}
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

export function ReadingRenderer({ reading }: { reading: StructuredReading }) {
  return (
    <div className="space-y-4">
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

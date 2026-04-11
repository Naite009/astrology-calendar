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

export interface ModalityElementSection {
  type: "modality_element";
  title: string;
  elements: ElementEntry[];
  modalities: ModalityEntry[];
  dominant_element: string;
  dominant_modality: string;
  balance_interpretation: string;
}

export interface CityEntry {
  name: string;
  lines: string[];
  theme: string;
  score: number;
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

function CityComparison({ section }: { section: CityComparisonSection }) {
  return (
    <Card className="border-border">
      <CardContent className="pt-5 pb-4 space-y-3">
        <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
        <div className="space-y-3">
          {section.cities.map((city, i) => (
            <div key={i} className="rounded-md border border-border p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-foreground">{city.name}</span>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{city.score}/10</span>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{city.theme}</p>
              <div className="flex flex-wrap gap-1">
                {city.lines.map((line, j) => (
                  <span key={j} className="text-xs bg-muted px-2 py-0.5 rounded text-foreground/80">{line}</span>
                ))}
              </div>
            </div>
          ))}
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
          default:
            return null;
        }
      })}
    </div>
  );
}

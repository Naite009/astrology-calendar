import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Baby, Anchor, BookOpen, Shield, Star, ChevronsUpDown, Check, AlertTriangle, Lightbulb, HeartHandshake, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { NatalChart } from "@/hooks/useNatalChart";
import type { FamilyRole } from "@/lib/parentChildSynastry";
import { buildChildPortrait } from "@/lib/childPortrait";
import { composePortrait } from "@/lib/portraitComposer";
import { validateChart } from "@/lib/chartValidator";

interface Member {
  chart: NatalChart;
  role: FamilyRole | string;
}

interface Props {
  members: Member[];
  primaryChartId?: string | null;
  viewerAge?: number | null;
}

function ord(n: number): string {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function ChildPortraitCard({ members, primaryChartId, viewerAge }: Props) {
  const people = useMemo(() => {
    const filtered = members.filter((m) => !!m.chart?.id);
    return filtered.sort((a, b) => {
      const aPrimary = primaryChartId && a.chart.id === primaryChartId;
      const bPrimary = primaryChartId && b.chart.id === primaryChartId;
      if (aPrimary && !bPrimary) return -1;
      if (!aPrimary && bPrimary) return 1;
      return (a.chart.name ?? "").localeCompare(b.chart.name ?? "");
    });
  }, [members, primaryChartId]);

  const [selectedId, setSelectedId] = useState<string | null>(
    people.length === 1 ? people[0].chart.id : null,
  );
  const [open, setOpen] = useState(false);

  if (people.length === 0) return null;

  const selected = people.find((c) => c.chart.id === selectedId) ?? null;
  const portrait = selected ? buildChildPortrait(selected.chart, viewerAge ?? null) : null;
  const composed = portrait ? composePortrait(portrait) : null;
  const validation = selected ? validateChart(selected.chart) : null;

  return (
    <Card className="border-primary/50">
      <CardHeader className="pb-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-t-lg">
        <CardTitle className="text-base flex items-center gap-2">
          <Baby className="h-4 w-4 text-primary" />
          Portrait
        </CardTitle>
        <CardDescription className="pt-1">
          A focused portrait that picks only the 3–5 things that actually matter for this person at this life stage,
          and translates them into language a parent or partner can act on.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 space-y-5 text-sm">
        {/* Person selector */}
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Choose a person</div>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal">
                  <span className="truncate flex items-center gap-1.5">
                    {selected ? (
                      <>
                        {primaryChartId && selected.chart.id === primaryChartId && (
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        )}
                        {selected.chart.name}
                      </>
                    ) : (
                      "Select a person"
                    )}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-0 z-50 bg-background" align="start">
                <Command>
                  <CommandInput placeholder="Search people..." />
                  <CommandList className="max-h-[300px]">
                    <CommandEmpty>No person found.</CommandEmpty>
                    <CommandGroup>
                      {people.map((c) => {
                        const isPrimary = primaryChartId && c.chart.id === primaryChartId;
                        return (
                          <CommandItem
                            key={c.chart.id}
                            value={c.chart.name ?? c.chart.id}
                            onSelect={() => { setSelectedId(c.chart.id); setOpen(false); }}
                            className="cursor-pointer"
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedId === c.chart.id ? "opacity-100" : "opacity-0")} />
                            {isPrimary && <Star className="mr-1.5 h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />}
                            <span className="truncate">{c.chart.name}</span>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {!portrait && (
          <p className="text-muted-foreground italic">Pick a person above to generate their portrait.</p>
        )}

        {portrait && composed && (
          <div className="space-y-5">
            {/* Chart-data warnings */}
            {validation && validation.issues.length > 0 && (
              <div className="rounded-md border border-amber-400/60 bg-amber-50 dark:bg-amber-950/30 p-3 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-semibold text-xs uppercase tracking-wider">
                  <AlertTriangle className="h-4 w-4" />
                  Chart data check ({validation.issues.length} {validation.issues.length === 1 ? "issue" : "issues"})
                </div>
                <ul className="space-y-1.5 text-xs text-amber-900 dark:text-amber-100">
                  {validation.issues.map((iss, i) => (
                    <li key={i} className="leading-snug">
                      <span className={cn("font-semibold", iss.severity === "error" ? "text-red-700 dark:text-red-300" : "text-amber-800 dark:text-amber-200")}>
                        {iss.severity === "error" ? "ERROR:" : "Check:"}
                      </span>{" "}
                      {iss.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 1. One-Sentence Portrait */}
            <section className="rounded-md border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-transparent p-4">
              <div className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-2">
                One-Sentence Portrait
              </div>
              <p className="text-base font-medium leading-relaxed">{composed.oneSentence}</p>
              {portrait.age != null && (
                <div className="text-xs text-muted-foreground mt-2">
                  {portrait.name} · age {portrait.age} · {portrait.lifePhase}
                </div>
              )}
            </section>

            {/* 1b. How The System Works — driver / translator / trigger */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                <div className="font-semibold text-base">How The System Works</div>
              </div>
              <div className="rounded-md border border-primary/30 bg-background/40 p-4 space-y-3">
                <p className="leading-relaxed text-foreground/90">{composed.systemMechanism.synthesis}</p>
                <div className="grid sm:grid-cols-3 gap-2 pt-2 border-t border-border">
                  <div className="rounded border border-border bg-background/60 p-2.5">
                    <div className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">Driver</div>
                    <div className="text-sm font-medium">{composed.systemMechanism.driver.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{composed.systemMechanism.driver.detail}</div>
                  </div>
                  <div className="rounded border border-border bg-background/60 p-2.5">
                    <div className="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold mb-1">Translator</div>
                    <div className="text-sm font-medium">{composed.systemMechanism.translator.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{composed.systemMechanism.translator.detail}</div>
                  </div>
                  <div className="rounded border border-border bg-background/60 p-2.5">
                    <div className="text-[10px] uppercase tracking-wider text-amber-600 font-semibold mb-1">Stress Trigger</div>
                    <div className="text-sm font-medium">{composed.systemMechanism.trigger.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{composed.systemMechanism.trigger.detail}</div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. What This Stage Is Asking */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Anchor className="h-4 w-4 text-primary" />
                <div className="font-semibold text-base">What This Stage Is Asking</div>
                <Badge variant="outline" className="text-[10px]">{composed.stageAsk.title}</Badge>
              </div>
              <div className="rounded-md border border-border bg-background/40 p-3">
                <p className="leading-relaxed text-foreground/90">{composed.stageAsk.body}</p>
              </div>
            </section>

            {/* 3. What Gets Misread */}
            {composed.misreads.length > 0 && (
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <div className="font-semibold text-base">What Gets Misread</div>
                </div>
                <div className="space-y-2">
                  {composed.misreads.map((m, i) => (
                    <div key={i} className="rounded-md border border-amber-400/40 bg-amber-50/50 dark:bg-amber-950/20 p-3">
                      <div className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-300 font-semibold mb-1">
                        Looks like
                      </div>
                      <p className="text-sm mb-2">{m.looksLike}</p>
                      <div className="text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
                        Actually is
                      </div>
                      <p className="text-sm">{m.actuallyIs}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 4. What Helps */}
            {composed.whatHelps.length > 0 && (
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4 text-emerald-600" />
                  <div className="font-semibold text-base">What Helps</div>
                </div>
                <ul className="space-y-2">
                  {composed.whatHelps.map((h, i) => (
                    <li key={i} className="rounded-md border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-3 text-sm leading-relaxed">
                      {h}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* 5. The Chart Story Behind It */}
            {composed.chartStory && (
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <div className="font-semibold text-base">The Chart Story Behind It</div>
                </div>
                <div className="rounded-md border border-border bg-background/40 p-3">
                  <p className="leading-relaxed text-muted-foreground">{composed.chartStory}</p>
                  <div className="mt-2 text-[10px] text-muted-foreground/70 italic">
                    Themes selected: {composed.themesPicked.join(" · ")}
                  </div>
                </div>
              </section>
            )}

            {/* 6. Optional Deep Dive */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-muted-foreground" />
                <div className="font-semibold text-base">Optional Deep Dive</div>
              </div>

              {portrait.chartRuler && (
                <details className="rounded-md border border-dashed border-border bg-background/40 group">
                  <summary className="cursor-pointer p-3 font-medium text-sm hover:bg-muted/40 rounded-md">
                    Chart Ruler · {portrait.chartRuler.rulerName} in {portrait.chartRuler.rulerSign}
                  </summary>
                  <div className="p-3 pt-1 border-t border-border text-sm leading-relaxed text-muted-foreground">
                    {portrait.chartRuler.line}
                  </div>
                </details>
              )}

              {portrait.moonPhaseProfile && (
                <details className="rounded-md border border-dashed border-border bg-background/40 group">
                  <summary className="cursor-pointer p-3 font-medium text-sm hover:bg-muted/40 rounded-md">
                    Moon Phase · {portrait.moonPhaseProfile.label}
                  </summary>
                  <div className="p-3 pt-1 border-t border-border text-sm space-y-2 text-muted-foreground">
                    <p><span className="font-semibold text-foreground">Instinct:</span> {portrait.moonPhaseProfile.instinct}</p>
                    <p><span className="font-semibold text-foreground">True work:</span> {portrait.moonPhaseProfile.trueWork}</p>
                  </div>
                </details>
              )}

              {(portrait.masterySpot.chiron || portrait.masterySpot.saturn) && (
                <details className="rounded-md border border-dashed border-border bg-background/40 group">
                  <summary className="cursor-pointer p-3 font-medium text-sm hover:bg-muted/40 rounded-md">
                    Chiron and Saturn (the tender places)
                  </summary>
                  <div className="p-3 pt-1 border-t border-border text-sm space-y-3 text-muted-foreground">
                    {portrait.masterySpot.saturn && (
                      <div>
                        <div className="font-semibold text-foreground mb-1">
                          Saturn in {portrait.masterySpot.saturn.sign}
                          {portrait.masterySpot.saturn.house && ` · ${ord(portrait.masterySpot.saturn.house)} house`}
                        </div>
                        <p>{portrait.masterySpot.saturn.struggle}</p>
                      </div>
                    )}
                    {portrait.masterySpot.chiron && (
                      <div>
                        <div className="font-semibold text-foreground mb-1">
                          Chiron in {portrait.masterySpot.chiron.sign}
                          {portrait.masterySpot.chiron.house && ` · ${ord(portrait.masterySpot.chiron.house)} house`}
                        </div>
                        <p>{portrait.masterySpot.chiron.tender}</p>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {portrait.nodeHouseSynthesis && (
                <details className="rounded-md border border-dashed border-border bg-background/40 group">
                  <summary className="cursor-pointer p-3 font-medium text-sm hover:bg-muted/40 rounded-md">
                    Nodes · comfort vs. growth edge
                  </summary>
                  <div className="p-3 pt-1 border-t border-border text-sm text-muted-foreground leading-relaxed">
                    {portrait.nodeHouseSynthesis.line}
                  </div>
                </details>
              )}

              {portrait.ascDegree != null && (portrait.ascDegree <= 1 || portrait.ascDegree >= 29) && (
                <details className="rounded-md border border-dashed border-border bg-background/40 group">
                  <summary className="cursor-pointer p-3 font-medium text-sm hover:bg-muted/40 rounded-md">
                    Extreme degree · Ascendant at {portrait.ascDegree.toFixed(1)}°
                  </summary>
                  <div className="p-3 pt-1 border-t border-border text-sm text-muted-foreground leading-relaxed">
                    A Rising sign at the very start (0°) or very end (29°) tends to act like a doorway in motion —
                    the surface presentation shifts noticeably across life stages.
                  </div>
                </details>
              )}

              <details className="rounded-md border border-dashed border-border bg-background/40 group">
                <summary className="cursor-pointer p-3 font-medium text-sm hover:bg-muted/40 rounded-md">
                  Math Check · the raw aspects this reading is grounded in
                </summary>
                <div className="p-3 pt-1 border-t border-border text-xs space-y-2 text-muted-foreground">
                  {portrait.mathCheck.sunAspects.length > 0 && (
                    <div>
                      <div className="font-semibold text-foreground mb-1">Major aspects to the Sun</div>
                      <ul className="space-y-0.5">
                        {portrait.mathCheck.sunAspects.map((a, i) => (
                          <li key={i}>Sun {a.aspect} {a.to} <span className="opacity-60">(orb {a.orb.toFixed(1)}°)</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {portrait.mathCheck.moonAspects.length > 0 && (
                    <div>
                      <div className="font-semibold text-foreground mb-1">Major aspects to the Moon</div>
                      <ul className="space-y-0.5">
                        {portrait.mathCheck.moonAspects.map((a, i) => (
                          <li key={i}>Moon {a.aspect} {a.to} <span className="opacity-60">(orb {a.orb.toFixed(1)}°)</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </details>
            </section>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

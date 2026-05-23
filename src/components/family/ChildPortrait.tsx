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
  const composed = portrait && selected ? composePortrait(portrait, selected.chart) : null;
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

            {/* 0. Life-stage chapter (one-sentence frame above Core Portrait) */}
            {composed.lifeStageChapter && (
              <section className="rounded-md border border-primary/30 bg-primary/5 px-4 py-3">
                <div className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-1">
                  Life-Stage Chapter
                </div>
                <p className="text-sm leading-relaxed">{composed.lifeStageChapter}</p>
              </section>
            )}

            {/* 1. Core Portrait */}
            <section className="rounded-md border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-transparent p-4">
              <div className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-2">
                Core Portrait
              </div>
              <p className="text-base font-medium leading-relaxed">{composed.corePortrait}</p>
              {portrait.age != null && (
                <div className="text-xs text-muted-foreground mt-2">
                  {portrait.name} · age {portrait.age} · {portrait.lifePhase}
                </div>
              )}
            </section>

            {/* ── NEW · WHAT ACTUALLY RUNS THE MOMENT ── ranked real-time activation */}
            {composed.realTimeSequence && composed.realTimeSequence.steps.length > 0 && (
              <section className="rounded-lg border-2 border-rose-500/50 bg-rose-50/60 dark:bg-rose-950/20 p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500" aria-hidden />
                  <div className="text-[10px] uppercase tracking-widest text-rose-700 dark:text-rose-300 font-bold">
                    What Actually Runs The Moment
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {composed.realTimeSequence.intro}
                </p>
                <ol className="space-y-3">
                  {composed.realTimeSequence.steps.map((s, i) => (
                    <li key={i} className="rounded-md border border-rose-500/30 bg-background/60 p-3">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-[10px] uppercase tracking-wider text-rose-700 dark:text-rose-300 font-bold">
                          {s.cue}
                        </span>
                        <span className="font-semibold text-sm">{s.lead}</span>
                      </div>
                      <p className="text-sm leading-relaxed mt-1.5">{s.action}</p>
                      <div className="text-[10px] text-muted-foreground/70 italic mt-1.5">{s.rank}</div>
                    </li>
                  ))}
                </ol>
                <div className="rounded border border-rose-500/20 bg-background/40 p-2.5 text-[11px] text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Priority used:</span> {composed.realTimeSequence.priorityNote}
                </div>
              </section>
            )}

            {/* ── BOX 1 · REAL LIFE (green) ── what to do, no astrology language */}
            <section className="rounded-lg border-2 border-emerald-500/50 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 space-y-5">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden />
                <div className="text-[10px] uppercase tracking-widest text-emerald-700 dark:text-emerald-300 font-bold">
                  Real Life · What To Do
                </div>
              </div>

              {/* What This Stage Is Asking */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Anchor className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                  <div className="font-semibold text-base">What This Stage Is Asking</div>
                  <Badge variant="outline" className="text-[10px]">{composed.stageAsk.title}</Badge>
                </div>
                <p className="leading-relaxed text-foreground/90">{composed.stageAsk.body}</p>
              </div>

              {/* What Gets Misread */}
              {composed.misreads.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <div className="font-semibold text-base">What Gets Misread</div>
                  </div>
                  <div className="space-y-2">
                    {composed.misreads.map((m, i) => (
                      <div key={i} className="rounded-md border border-amber-400/40 bg-background/60 p-3">
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
                </div>
              )}

              {/* What Helps */}
              {composed.whatHelps.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                    <div className="font-semibold text-base">What Helps</div>
                  </div>
                  <ul className="space-y-2">
                    {composed.whatHelps.map((h, i) => (
                      <li key={i} className="rounded-md border border-emerald-500/30 bg-background/60 p-3 text-sm leading-relaxed">
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* ── BOX 2 · WHY THIS WORKS (yellow) ── the bridge */}
            {composed.bridge && (
              <section className="rounded-lg border-2 border-amber-500/60 bg-amber-50/70 dark:bg-amber-950/25 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" aria-hidden />
                  <div className="text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-300 font-bold">
                    The Bridge · Why This Works
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                  <div className="font-semibold text-base">Why This Works</div>
                </div>
                <p className="leading-relaxed text-foreground/90 text-[15px]">{composed.bridge.paragraph}</p>
                <div className="text-[10px] text-muted-foreground/80 italic pt-1">
                  Connecting: {composed.bridge.placements.join(" + ")}
                </div>
              </section>
            )}

            {/* ── BOX 3 · THE ASTROLOGY (blue) ── deep logic, behavioral phrasing */}
            <section className="rounded-lg border-2 border-sky-500/50 bg-sky-50/60 dark:bg-sky-950/20 p-4 space-y-5">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-sky-500" aria-hidden />
                <div className="text-[10px] uppercase tracking-widest text-sky-700 dark:text-sky-300 font-bold">
                  The Astrology · Chart Story Behind It
                </div>
              </div>

              {/* How The System Works */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-sky-700 dark:text-sky-300" />
                  <div className="font-semibold text-base">How The System Works</div>
                </div>
                <p className="leading-relaxed text-foreground/90">{composed.systemMechanism.synthesis}</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-2">
                  <div className="rounded border border-sky-500/30 bg-background/60 p-2.5">
                    <div className="text-[10px] uppercase tracking-wider text-sky-700 dark:text-sky-300 font-semibold mb-1">Driver</div>
                    <div className="text-sm font-medium">{composed.systemMechanism.driver.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{composed.systemMechanism.driver.detail}</div>
                  </div>
                  <div className="rounded border border-sky-500/30 bg-background/60 p-2.5">
                    <div className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300 font-semibold mb-1">Translator</div>
                    <div className="text-sm font-medium">{composed.systemMechanism.translator.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{composed.systemMechanism.translator.detail}</div>
                  </div>
                  <div className="rounded border border-sky-500/30 bg-background/60 p-2.5">
                    <div className="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-300 font-semibold mb-1">Stress Trigger</div>
                    <div className="text-sm font-medium">{composed.systemMechanism.trigger.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{composed.systemMechanism.trigger.detail}</div>
                  </div>
                  <div className="rounded border border-violet-500/30 bg-background/60 p-2.5">
                    <div className="text-[10px] uppercase tracking-wider text-violet-700 dark:text-violet-300 font-semibold mb-1">Dispositor</div>
                    {composed.chainOfCommand?.finalDispositor ? (
                      <>
                        <div className="text-sm font-medium">
                          {composed.chainOfCommand.finalDispositor.planet} in {composed.chainOfCommand.finalDispositor.sign}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">the final boss — every other planet eventually reports here</div>
                      </>
                    ) : composed.chainOfCommand?.mutualReception ? (
                      <>
                        <div className="text-sm font-medium">
                          {composed.chainOfCommand.mutualReception.a} ↔ {composed.chainOfCommand.mutualReception.b}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">mutual reception — authority passes back and forth between them</div>
                      </>
                    ) : composed.chainOfCommand?.loop ? (
                      <>
                        <div className="text-sm font-medium">{composed.chainOfCommand.loop.join(" → ")}</div>
                        <div className="text-xs text-muted-foreground mt-1">dispositor loop — authority circulates, no single boss</div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm font-medium">—</div>
                        <div className="text-xs text-muted-foreground mt-1">no final dispositor resolved</div>
                      </>
                    )}
                  </div>
                </div>


                {/* How the Stress Trigger was derived */}
                <div className="rounded border border-amber-500/30 bg-background/40 mt-2 p-3">
                  <div className="font-bold text-xs text-amber-700 dark:text-amber-300 mb-1.5">
                    How was the stress trigger picked?
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    {composed.systemMechanism.trigger.derivation}
                  </div>
                </div>
              </div>

              {/* Chain of Command (Dispositor walk) */}
              {composed.chainOfCommand && composed.chainOfCommand.steps.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-sky-700 dark:text-sky-300" />
                    <div className="font-semibold text-base">Chain of Command (Who Reports To Whom)</div>
                  </div>
                  <div className="rounded-md border border-sky-500/40 bg-background/60 p-3 space-y-3">
                    {/* Visual chain */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {composed.chainOfCommand.steps.map((s, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5">
                          <span className="inline-block rounded border border-sky-500/40 bg-sky-50 dark:bg-sky-950/40 px-2 py-1 text-xs font-medium">
                            {s.planet} <span className="opacity-60">in {s.sign}</span>
                          </span>
                          {i < composed.chainOfCommand!.steps.length - 1 && (
                            <span className="text-sky-600/70" aria-hidden>→</span>
                          )}
                        </span>
                      ))}
                    </div>

                    {/* Step-by-step reasoning */}
                    <ol className="space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
                      {composed.chainOfCommand.steps.map((s, i) => (
                        <li key={i} className="leading-relaxed">
                          <span className="font-medium text-foreground">{s.planet} in {s.sign}.</span>{" "}
                          {s.reason}
                        </li>
                      ))}
                    </ol>

                    {/* Plain-language narrative: what this means for the person */}
                    <p className="text-sm leading-relaxed text-foreground/90 pt-2 border-t border-border">
                      {composed.chainOfCommand.narrative}
                    </p>

                    {/* Tag the resolution */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {composed.chainOfCommand.finalDispositor && (
                        <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-700 dark:text-emerald-300">
                          Final dispositor: {composed.chainOfCommand.finalDispositor.planet}
                        </Badge>
                      )}
                      {composed.chainOfCommand.mutualReception && (
                        <Badge variant="outline" className="text-[10px] border-violet-500/40 text-violet-700 dark:text-violet-300">
                          Mutual reception: {composed.chainOfCommand.mutualReception.a} ↔ {composed.chainOfCommand.mutualReception.b}
                        </Badge>
                      )}
                      {composed.chainOfCommand.loop && (
                        <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-700 dark:text-amber-300">
                          Loop: {composed.chainOfCommand.loop.join(" → ")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Chart Story */}
              {composed.chartStory && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-sky-700 dark:text-sky-300" />
                    <div className="font-semibold text-base">The Chart Story Behind It</div>
                  </div>
                  <p className="leading-relaxed text-foreground/90">{composed.chartStory}</p>
                </div>
              )}
            </section>





            {/* ── BOX 4 · DEEP DIVE (purple) ── always-visible details */}
            <section className="rounded-lg border-2 border-violet-500/40 bg-violet-50/40 dark:bg-violet-950/15 p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-violet-500" aria-hidden />
                <Compass className="h-4 w-4 text-violet-700 dark:text-violet-300" />
                <div className="font-semibold text-base">Deep Dive</div>
              </div>

              {portrait.chartRuler && (
                <div className="rounded-md border border-dashed border-border bg-background/40 p-3">
                  <div className="font-bold text-sm mb-1.5">
                    Chart Ruler · {portrait.chartRuler.rulerName} in {portrait.chartRuler.rulerSign}
                  </div>
                  <div className="text-sm leading-relaxed text-muted-foreground">
                    {portrait.chartRuler.line}
                  </div>
                </div>
              )}

              {portrait.moonPhaseProfile && (
                <div className="rounded-md border border-dashed border-border bg-background/40 p-3">
                  <div className="font-bold text-sm mb-1.5">
                    Moon Phase · {portrait.moonPhaseProfile.label}
                  </div>
                  <div className="text-sm space-y-2 text-muted-foreground">
                    <p><span className="font-semibold text-foreground">Instinct:</span> {portrait.moonPhaseProfile.instinct}</p>
                    <p><span className="font-semibold text-foreground">True work:</span> {portrait.moonPhaseProfile.trueWork}</p>
                  </div>
                </div>
              )}

              {(portrait.masterySpot.chiron || portrait.masterySpot.saturn) && (
                <div className="rounded-md border border-dashed border-border bg-background/40 p-3">
                  <div className="font-bold text-sm mb-1.5">
                    Chiron and Saturn (the tender places)
                  </div>
                  <div className="text-sm space-y-3 text-muted-foreground">
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
                </div>
              )}

              {portrait.nodeHouseSynthesis && (
                <div className="rounded-md border border-dashed border-border bg-background/40 p-3">
                  <div className="font-bold text-sm mb-1.5">
                    Nodes · comfort vs. growth edge
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {portrait.nodeHouseSynthesis.line}
                  </div>
                </div>
              )}

              {portrait.ascDegree != null && (portrait.ascDegree <= 1 || portrait.ascDegree >= 29) && (
                <div className="rounded-md border border-dashed border-border bg-background/40 p-3">
                  <div className="font-bold text-sm mb-1.5">
                    Extreme degree · Ascendant at {portrait.ascDegree.toFixed(1)}°
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    A Rising sign at the very start (0°) or very end (29°) tends to act like a doorway in motion,
                    the outer style shifts noticeably across life stages.
                  </div>
                </div>
              )}

              <div className="rounded-md border border-dashed border-border bg-background/40 p-3">
                <div className="font-bold text-sm mb-1.5">
                  Math Check · the raw aspects this reading is grounded in
                </div>
                <div className="text-xs space-y-2 text-muted-foreground">
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
              </div>
            </section>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

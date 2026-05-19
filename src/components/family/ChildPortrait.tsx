import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Baby, Sparkles, Mountain, Heart, Anchor, BookOpen, Shield, Star, ChevronsUpDown, Check, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { NatalChart } from "@/hooks/useNatalChart";
import type { FamilyRole } from "@/lib/parentChildSynastry";
import { buildChildPortrait } from "@/lib/childPortrait";
import { validateChart } from "@/lib/chartValidator";
import { AlertTriangle } from "lucide-react";

interface Member {
  chart: NatalChart;
  role: FamilyRole | string;
}

// Decipher toggle — swaps a section's prose for its blunt "Real Talk"
// translation. Lives inline so each section gets its own local state.
function DecipherToggle({
  original,
  realTalk,
  textClass,
}: {
  original: string;
  realTalk?: string;
  textClass: string;
}) {
  const [show, setShow] = useState(false);
  if (!realTalk) {
    return <p className={textClass}>{original}</p>;
  }
  return (
    <div className="space-y-2">
      <p className={textClass}>{show ? realTalk : original}</p>
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="inline-flex items-center gap-1.5 rounded-full border border-current/30 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider opacity-70 hover:opacity-100 transition-opacity"
      >
        {show ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
        {show ? "Hide Decipher" : "Decipher · Real Talk"}
      </button>
    </div>
  );
}



interface Props {
  members: Member[];
  primaryChartId?: string | null;
  viewerAge?: number | null;
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
  const validation = selected ? validateChart(selected.chart) : null;


  return (
    <Card className="border-primary/50">
      <CardHeader className="pb-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-t-lg">
        <CardTitle className="text-base flex items-center gap-2">
          <Baby className="h-4 w-4 text-primary" />
          Portrait
        </CardTitle>
        <CardDescription className="pt-1">
          A warm, expert deep-dive for any person on your family list, child or adult. The reading auto-adapts to their
          life stage: the Moon for the youngest, Mercury and Mars for school-age and teens, then the Saturn Returns,
          Uranus Opposition (around 42), Chiron Return (around 50), and the eldering thresholds beyond.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-5 text-sm">
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Choose a person</div>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between font-normal"
                >
                  <span className="truncate flex items-center gap-1.5">
                    {selected ? (
                      <>
                        {primaryChartId && selected.chart.id === primaryChartId && (
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        )}
                        {selected.chart.name}
                      </>
                    ) : (
                      "Select a person to see their portrait"
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
                            onSelect={() => {
                              setSelectedId(c.chart.id);
                              setOpen(false);
                            }}
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


        {portrait && (
          <div className="space-y-5">
            {validation && validation.issues.length > 0 && (
              <div className="rounded-md border border-amber-400/60 bg-amber-50 dark:bg-amber-950/30 p-3 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-semibold text-xs uppercase tracking-wider">
                  <AlertTriangle className="h-4 w-4" />
                  Chart data check ({validation.issues.length} {validation.issues.length === 1 ? "issue" : "issues"})
                </div>
                <p className="text-xs text-amber-900 dark:text-amber-100">
                  The reading below uses the chart data exactly as stored. These items could make a house assignment wrong, please verify against the original chart wheel before trusting any house-specific text.
                </p>
                <ul className="space-y-1.5 text-xs text-amber-900 dark:text-amber-100">
                  {validation.issues.map((iss, i) => (
                    <li key={i} className="leading-snug">
                      <span className={cn("font-semibold", iss.severity === "error" ? "text-red-700 dark:text-red-300" : "text-amber-800 dark:text-amber-200")}>
                        {iss.severity === "error" ? "ERROR:" : "Check:"}
                      </span>{" "}
                      {iss.message}
                      {iss.fix && <span className="block text-amber-700 dark:text-amber-300/80 italic mt-0.5">→ {iss.fix}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(() => {
              const isChild = portrait.lifePhase === "child";
              const isElder = portrait.lifePhase === "elder";
              const openingBody = isChild
                ? "what follows is not a horoscope. It is a portrait of the developmental work this specific child is doing right now, and what they need from the adults around them to do it well."
                : isElder
                  ? "what follows is not a horoscope. It is a portrait of the soul story they have lived and the wisdom now ready to be transmitted: what was carried, what was healed, and what is being handed to the next generation."
                  : "what follows is not a horoscope. It is a portrait of the developmental work this person is doing at this exact life stage, the outer-planet cycles activating now, and how to meet themselves with more truth and less performance.";
              const curriculumTitle = isChild
                ? "The Soul Curriculum"
                : isElder
                  ? "The Soul Curriculum — Lessons Mastered"
                  : "The Soul Curriculum — Habitual Past & Unfolding Future";
              const nnLabel = isChild ? "North Node · The Stretch" : isElder ? "North Node · Wisdom Earned" : "North Node · The Vitalizing Edge";
              const snLabel = isChild ? "South Node · Default Mode Under Stress" : isElder ? "South Node · The Old Friend No Longer Needed" : "South Node · The Tired Habit";
              return (
                <>
                  <div className="rounded-md border border-primary/40 bg-background/60 p-4">
                    <p className="text-sm leading-relaxed">
                      A note about <span className="font-semibold">{portrait.name}</span>
                      {portrait.age != null && <span className="text-muted-foreground"> (age {portrait.age})</span>}:{" "}
                      {openingBody}
                    </p>
                  </div>

                  <section className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Anchor className="h-4 w-4 text-primary" />
                      <div className="font-semibold text-base">The Developmental Anchor</div>
                      <Badge variant="outline" className="text-[10px]">{portrait.developmentalAnchor.stage}</Badge>
                    </div>
                    <div className="rounded-md border border-border bg-background/40 p-3 space-y-2">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Where the work lives right now</div>
                      <div className="font-medium">{portrait.developmentalAnchor.focus}</div>
                      <p className="text-muted-foreground leading-relaxed">{portrait.developmentalAnchor.body}</p>
                      {portrait.developmentalAnchor.extraHolding && (
                        <div className="rounded border-l-4 border-amber-500/70 bg-amber-50 dark:bg-amber-950/30 p-3 mt-2">
                          <div className="text-[10px] uppercase tracking-wider font-bold text-amber-700 dark:text-amber-300 mb-1">
                            {isChild ? "Extra holding needed" : "Tender area to honor"}
                          </div>
                          <p className="text-amber-950 dark:text-amber-50 text-sm">{portrait.developmentalAnchor.extraHolding}</p>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <div className="font-semibold text-base">{curriculumTitle}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {portrait.identityInvitation.rising && (
                        <div className="rounded-md border border-sky-300/60 bg-sky-50 dark:bg-sky-950/30 p-3 space-y-1">
                          <div className="text-[10px] uppercase tracking-wider font-bold text-sky-700 dark:text-sky-300">
                            Rising · The Filter
                          </div>
                          <p className="text-sky-950 dark:text-sky-50 text-sm">{portrait.identityInvitation.rising.line}</p>
                        </div>
                      )}
                      {portrait.identityInvitation.sun && (
                        <div className="rounded-md border border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 p-3 space-y-1">
                          <div className="text-[10px] uppercase tracking-wider font-bold text-amber-700 dark:text-amber-300">
                            Sun · What They're Practicing
                          </div>
                          <p className="text-amber-950 dark:text-amber-50 text-sm">{portrait.identityInvitation.sun.line}</p>
                        </div>
                      )}
                      {portrait.identityInvitation.northNode && (
                        <div className="rounded-md border border-emerald-300/60 bg-emerald-50 dark:bg-emerald-950/30 p-3 space-y-1">
                          <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-300">
                            {nnLabel}
                          </div>
                          <p className="text-emerald-950 dark:text-emerald-50 text-sm">{portrait.identityInvitation.northNode.line}</p>
                        </div>
                      )}
                      {portrait.identityInvitation.southNode && (
                        <div className="rounded-md border border-purple-300/60 bg-purple-50 dark:bg-purple-950/30 p-3 space-y-1">
                          <div className="text-[10px] uppercase tracking-wider font-bold text-purple-700 dark:text-purple-300">
                            {snLabel}
                          </div>
                          <p className="text-purple-950 dark:text-purple-50 text-sm">{portrait.identityInvitation.southNode.line}</p>
                        </div>
                      )}
                    </div>
                    {portrait.identityInvitation.tradeLine && (
                      <div className="rounded-md border-l-4 border-fuchsia-500/70 bg-fuchsia-50 dark:bg-fuchsia-950/30 p-3 mt-2">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-fuchsia-700 dark:text-fuchsia-300 mb-1">
                          The Pivot · Trade Tired Habit for Vitalizing Edge
                        </div>
                        <p className="text-fuchsia-950 dark:text-fuchsia-50 text-sm leading-relaxed">{portrait.identityInvitation.tradeLine}</p>
                      </div>
                    )}
                  </section>
                </>
              );
            })()}

            {/* Captain of the Ship — Chart Ruler */}
            {portrait.chartRuler && (
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <Anchor className="h-4 w-4 text-cyan-600" />
                  <div className="font-semibold text-base">The Captain of the Ship</div>
                </div>
                <div className="rounded-md border-l-4 border-cyan-500/70 bg-cyan-50 dark:bg-cyan-950/30 p-3 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-cyan-700 dark:text-cyan-300">
                    {portrait.chartRuler.ascSign} Rising · ruled by {portrait.chartRuler.rulerName} in {portrait.chartRuler.rulerSign}
                    {portrait.chartRuler.rulerHouse ? ` · ${portrait.chartRuler.rulerHouse}th house` : ""}
                  </div>
                  <DecipherToggle original={portrait.chartRuler.line} realTalk={portrait.chartRuler.realTalk} textClass="text-cyan-950 dark:text-cyan-50 text-sm leading-relaxed" />
                </div>
              </section>
            )}

            {/* Moon Phase Profile — names Balsamic etc. */}
            {portrait.moonPhaseProfile && (
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-600" />
                  <div className="font-semibold text-base">Moon Phase: {portrait.moonPhaseProfile.phase} — {portrait.moonPhaseProfile.label}</div>
                  <Badge variant="outline" className="text-[10px]">Sun–Moon {portrait.moonPhaseProfile.angle.toFixed(1)}°</Badge>
                </div>
                <div className="rounded-md border-l-4 border-violet-500/70 bg-violet-50 dark:bg-violet-950/30 p-3 space-y-2">
                  <p className="text-sm text-violet-950 dark:text-violet-50 leading-relaxed">
                    <span className="font-semibold">Instinct:</span> {portrait.moonPhaseProfile.instinct}
                  </p>
                  <p className="text-sm text-violet-950 dark:text-violet-50 leading-relaxed">
                    <span className="font-semibold">Stop being told:</span> {portrait.moonPhaseProfile.banTold}
                  </p>
                  <p className="text-sm text-violet-950 dark:text-violet-50 leading-relaxed">
                    <span className="font-semibold">True work:</span> {portrait.moonPhaseProfile.trueWork}
                  </p>
                </div>
              </section>
            )}

            {/* Node–House Synthesis (comfort of / edge of) */}
            {portrait.nodeHouseSynthesis && (
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <Anchor className="h-4 w-4 text-emerald-600" />
                  <div className="font-semibold text-base">The Node Axis — comfort of the past, edge of the now</div>
                </div>
                <div className="rounded-md border-l-4 border-emerald-500/70 bg-emerald-50 dark:bg-emerald-950/30 p-3 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-300">
                    {portrait.nodeHouseSynthesis.snSign} South Node ({portrait.nodeHouseSynthesis.snHouse}th) → {portrait.nodeHouseSynthesis.nnSign} North Node ({portrait.nodeHouseSynthesis.nnHouse}th)
                  </div>
                  <p className="text-emerald-950 dark:text-emerald-50 text-sm leading-relaxed">{portrait.nodeHouseSynthesis.line}</p>
                </div>
              </section>
            )}

            {/* PRESSURE RULE · Captain/Engine in 12th, Scorpio, or hard Pluto aspect */}
            {portrait.pressureSignature && (
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <div className="font-semibold text-base">The Pressure Signature — what feels "too big" for the room</div>
                  <Badge variant="outline" className="text-[10px]">Pressure Rule · {portrait.pressureSignature.trigger}</Badge>
                </div>
                <div className="rounded-md border-l-4 border-purple-500/70 bg-purple-50 dark:bg-purple-950/30 p-3 space-y-2">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-purple-700 dark:text-purple-300">
                    {portrait.pressureSignature.bodySign} {portrait.pressureSignature.body}
                    {portrait.pressureSignature.bodyHouse ? ` · ${portrait.pressureSignature.bodyHouse}th house` : ""} · needs {portrait.pressureSignature.needLabel}
                  </div>
                  <DecipherToggle original={portrait.pressureSignature.line} realTalk={portrait.pressureSignature.realTalk} textClass="text-purple-950 dark:text-purple-50 text-sm leading-relaxed" />
                </div>
              </section>
            )}

            {/* Core Conflict — lead story (luminary in hard aspect to outer planet) */}

            {portrait.coreConflict && (
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mountain className="h-4 w-4 text-amber-600" />
                  <div className="font-semibold text-base">The Core Conflict — the lead story</div>
                </div>
                <div className="rounded-md border-l-4 border-amber-500/80 bg-amber-50 dark:bg-amber-950/30 p-3 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-amber-700 dark:text-amber-300">
                    {portrait.coreConflict.luminarySign} {portrait.coreConflict.luminary} {portrait.coreConflict.aspect} {portrait.coreConflict.outerPlanet} in {portrait.coreConflict.outerSign}
                  </div>
                  <DecipherToggle original={portrait.coreConflict.synthesis} realTalk={portrait.coreConflict.realTalk} textClass="text-amber-950 dark:text-amber-50 text-sm leading-relaxed" />
                </div>
              </section>
            )}

            {/* Hidden Engine — 3rd house ruler synthesis */}
            {portrait.hiddenEngine && (
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                  <div className="font-semibold text-base">The Hidden Engine — what's under their voice</div>
                </div>
                <div className="rounded-md border-l-4 border-indigo-500/70 bg-indigo-50 dark:bg-indigo-950/30 p-3 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-indigo-700 dark:text-indigo-300">
                    3rd house in {portrait.hiddenEngine.thirdSign} · ruled by {portrait.hiddenEngine.rulerName} in {portrait.hiddenEngine.rulerSign}
                    {portrait.hiddenEngine.rulerHouse ? ` · ${portrait.hiddenEngine.rulerHouse}th house` : ""}
                  </div>
                  <DecipherToggle original={portrait.hiddenEngine.synthesis} realTalk={portrait.hiddenEngine.realTalk} textClass="text-indigo-950 dark:text-indigo-50 text-sm leading-relaxed" />
                </div>
              </section>
            )}

            {/* TRANSLATION RULE 1 · The Cognitive Clash (Friction Rule) */}
            {portrait.cognitiveClash && (
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-fuchsia-600" />
                  <div className="font-semibold text-base">The Cognitive Clash — surface language vs. inner OS</div>
                  <Badge variant="outline" className="text-[10px]">Friction Rule</Badge>
                </div>
                <div className="rounded-md border-l-4 border-fuchsia-500/70 bg-fuchsia-50 dark:bg-fuchsia-950/30 p-3 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-fuchsia-700 dark:text-fuchsia-300">
                    Speaks {portrait.cognitiveClash.cuspSign} · runs on {portrait.cognitiveClash.rulerName} in {portrait.cognitiveClash.rulerSign}
                    {portrait.cognitiveClash.rulerHouse ? ` · ${portrait.cognitiveClash.rulerHouse}th house` : ""}
                  </div>
                  <DecipherToggle original={portrait.cognitiveClash.line} realTalk={portrait.cognitiveClash.realTalk} textClass="text-fuchsia-950 dark:text-fuchsia-50 text-sm leading-relaxed" />
                </div>
              </section>
            )}

            {/* TRANSLATION RULE 2 · The Energy Discharge (Mars-by-house) */}
            {portrait.energyDischarge && (
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-600" />
                  <div className="font-semibold text-base">The Energy Discharge — where the drive needs to land</div>
                  <Badge variant="outline" className="text-[10px]">Energy Rule</Badge>
                </div>
                <div className="rounded-md border-l-4 border-red-500/70 bg-red-50 dark:bg-red-950/30 p-3 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-red-700 dark:text-red-300">
                    {portrait.energyDischarge.marsSign} Mars · {portrait.energyDischarge.marsHouse}th house
                  </div>
                  <p className="text-red-950 dark:text-red-50 text-sm leading-relaxed">{portrait.energyDischarge.line}</p>
                </div>
              </section>
            )}

            {/* TRANSLATION RULE 3 · The Internal Tug-of-War (tightest aspect under 2°) */}
            {portrait.internalTugOfWar && (
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mountain className="h-4 w-4 text-orange-600" />
                  <div className="font-semibold text-base">The Internal Tug-of-War — the lead story</div>
                  <Badge variant="outline" className="text-[10px]">Aspect Rule · orb {portrait.internalTugOfWar.orb.toFixed(1)}°</Badge>
                </div>
                <div className="rounded-md border-l-4 border-orange-500/70 bg-orange-50 dark:bg-orange-950/30 p-3 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-orange-700 dark:text-orange-300">
                    {portrait.internalTugOfWar.aSign} {portrait.internalTugOfWar.a} {portrait.internalTugOfWar.aspect} {portrait.internalTugOfWar.bSign} {portrait.internalTugOfWar.b}
                  </div>
                  <p className="text-orange-950 dark:text-orange-50 text-sm leading-relaxed">{portrait.internalTugOfWar.line}</p>
                </div>
              </section>
            )}

            {/* TRANSLATION RULE 4 · Cloaking Time (personal planet or chart ruler in 12th) */}
            {portrait.cloakingNote && (
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-slate-600" />
                  <div className="font-semibold text-base">Cloaking Time — privacy requirement</div>
                  <Badge variant="outline" className="text-[10px]">12th House Rule</Badge>
                </div>
                <div className="rounded-md border-l-4 border-slate-500/70 bg-slate-50 dark:bg-slate-900/40 p-3 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300">
                    {portrait.cloakingNote.bodies.map(b => `${b.sign} ${b.name}`).join(" · ")} · in the 12th
                  </div>
                  <p className="text-slate-900 dark:text-slate-50 text-sm leading-relaxed">{portrait.cloakingNote.line}</p>
                </div>
              </section>
            )}



            {/* 3. Mastery Spot */}

            {(portrait.masterySpot.saturn || portrait.masterySpot.chiron) && (() => {
              const masteryTitle = portrait.lifePhase === "child"
                ? "The Mastery Spot — Where they need a witness"
                : portrait.lifePhase === "elder"
                  ? "The Mastery Spot — Wisdom they carry for the next generation"
                  : "The Mastery Spot — Area of professional and personal mastery";
              const masterySub = portrait.lifePhase === "child"
                ? "Not wounds. Practice rooms. These are the places mastery is built, slowly, with a witness."
                : portrait.lifePhase === "elder"
                  ? "These are the places they've earned the right to mentor from. The scar is now the credential."
                  : "These are the places mastery has been built through repetition and pressure. This is where the credential lives.";
              const supportLabel = portrait.lifePhase === "child"
                ? "How to support"
                : "How to partner with this energy";
              return (
                <section className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mountain className="h-4 w-4 text-primary" />
                    <div className="font-semibold text-base">{masteryTitle}</div>
                  </div>
                  <p className="text-xs text-muted-foreground">{masterySub}</p>
                  <div className="space-y-2">
                    {portrait.masterySpot.saturn && (
                      <div className="rounded-md border-l-4 border-slate-500/70 bg-slate-50 dark:bg-slate-900/40 p-3 space-y-1">
                        <div className="font-semibold text-sm flex items-center gap-2 flex-wrap">
                          <span>
                            Saturn in {portrait.masterySpot.saturn.sign}
                            {portrait.masterySpot.saturn.house ? ` · ${portrait.masterySpot.saturn.house}th house` : ""}
                          </span>
                          {portrait.masterySpot.saturn.adultStandardLabel && (
                            <Badge variant="secondary" className="text-[10px]">
                              {portrait.masterySpot.saturn.adultStandardLabel}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">
                          <span className="font-semibold">The struggle:</span> {portrait.masterySpot.saturn.struggle}.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">{supportLabel}:</span> {portrait.masterySpot.saturn.howToSupport}
                        </p>
                      </div>
                    )}
                    {portrait.masterySpot.chiron && (
                      <div className="rounded-md border-l-4 border-rose-500/70 bg-rose-50 dark:bg-rose-950/30 p-3 space-y-1">
                        <div className="font-semibold text-sm">
                          Chiron in {portrait.masterySpot.chiron.sign}
                          {portrait.masterySpot.chiron.house ? ` · ${portrait.masterySpot.chiron.house}th house` : ""}
                        </div>
                        <p className="text-sm">
                          <span className="font-semibold">The tender spot:</span> {portrait.masterySpot.chiron.tender}.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">{supportLabel}:</span> {portrait.masterySpot.chiron.howToSupport}
                        </p>
                      </div>
                    )}
                  </div>
                  {portrait.tightestAspects && portrait.tightestAspects.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                        Tightest planetary conversations
                      </div>
                      {portrait.tightestAspects.map((a, i) => (
                        <div
                          key={i}
                          className={cn(
                            "rounded-md border-l-4 p-3 text-sm leading-relaxed",
                            a.quality === "hard"
                              ? "border-amber-500/70 bg-amber-50 dark:bg-amber-950/20 text-amber-950 dark:text-amber-50"
                              : "border-emerald-500/70 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-50",
                          )}
                        >
                          {a.line}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })()}

            {/* Chiron Return Spotlight (ages 45-52): the soul of the reading */}
            {portrait.chironReturnSpotlight && (
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-rose-600" />
                  <div className="font-semibold text-base">{portrait.chironReturnSpotlight.title}</div>
                  <Badge variant="outline" className="text-[10px]">Soul of the reading</Badge>
                </div>
                <div className="rounded-md border-2 border-rose-400/60 bg-gradient-to-br from-rose-50 to-amber-50 dark:from-rose-950/40 dark:to-amber-950/30 p-4">
                  <p className="text-rose-950 dark:text-rose-50 text-sm leading-relaxed">{portrait.chironReturnSpotlight.body}</p>
                </div>
              </section>
            )}

            {/* View from the Bridge — visible only when viewer is older than subject */}
            {portrait.viewFromBridge && (
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <Anchor className="h-4 w-4 text-teal-600" />
                  <div className="font-semibold text-base">The View from the Bridge</div>
                  <Badge variant="outline" className="text-[10px]">For the elder witness</Badge>
                </div>
                <div className="rounded-md border-l-4 border-teal-500/70 bg-teal-50 dark:bg-teal-950/30 p-4">
                  <p className="text-teal-950 dark:text-teal-50 text-sm leading-relaxed">{portrait.viewFromBridge.body}</p>
                </div>
              </section>
            )}


            {/* 4. How-To Executive Summary */}
            {(() => {
              const isChild = portrait.lifePhase === "child";
              const ritualLabel = isChild ? "The Ritual" : "Energy Management";
              const boundaryLabel = isChild ? "The Boundary" : "Personal Standards";
              const sectionTitle = isChild ? "The How-To Summary" : "The Interaction Guide";
              return (
                <section className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <div className="font-semibold text-base">{sectionTitle}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="rounded-md border border-rose-300/60 bg-rose-50/60 dark:bg-rose-950/20 p-3 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-rose-700 dark:text-rose-300">
                        <Heart className="h-3 w-3" /> {ritualLabel}
                      </div>
                      <p className="text-sm">{portrait.howTo.ritual}</p>
                    </div>

                    {/* Consolidated Cognitive Map — replaces duplicate Learning Style + Cognitive Profile */}
                    {portrait.cognitiveProfile ? (
                      <div className="rounded-md border border-sky-300/60 bg-sky-50/60 dark:bg-sky-950/20 p-3 space-y-2">
                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-sky-700 dark:text-sky-300">
                          <BookOpen className="h-3 w-3" /> The Cognitive Map
                        </div>
                        <div className="font-semibold text-sm text-sky-950 dark:text-sky-50">
                          {portrait.cognitiveProfile.label}
                        </div>
                        <p className="text-sm text-sky-950 dark:text-sky-50 leading-relaxed">
                          <span className="font-semibold">How they process:</span> {portrait.cognitiveProfile.processing}
                        </p>
                        <p className="text-sm text-sky-950 dark:text-sky-50 leading-relaxed">
                          <span className="font-semibold">What blocks the intake:</span> {portrait.cognitiveProfile.blocker}
                        </p>
                        <p className="text-sm text-sky-950 dark:text-sky-50 leading-relaxed">
                          <span className="font-semibold">So what:</span> {portrait.cognitiveProfile.application}
                        </p>
                        {portrait.cognitiveProfile.intakeStyle && (
                          <p className="text-xs text-sky-900 dark:text-sky-100 leading-relaxed italic">
                            Intake note (3rd-house cusp in {portrait.cognitiveProfile.thirdCuspSign}): {portrait.cognitiveProfile.intakeStyle}
                          </p>
                        )}
                        {portrait.cognitiveProfile.rulerNudge && (
                          <p className="text-xs text-sky-900 dark:text-sky-100 leading-relaxed italic">
                            Plus: {portrait.cognitiveProfile.rulerNudge}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-md border border-sky-300/60 bg-sky-50/60 dark:bg-sky-950/20 p-3 space-y-1">
                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-sky-700 dark:text-sky-300">
                          <BookOpen className="h-3 w-3" /> The Cognitive Map
                        </div>
                        <p className="text-sm">{portrait.howTo.learningStyle}</p>
                      </div>
                    )}

                    <div className="rounded-md border border-emerald-300/60 bg-emerald-50/60 dark:bg-emerald-950/20 p-3 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-300">
                        <Shield className="h-3 w-3" /> {boundaryLabel}
                      </div>
                      <p className="text-sm">{portrait.howTo.boundary}</p>
                    </div>
                  </div>
                </section>
              );
            })()}

            {/* Shadow Guidance — South Node in hidden house (6/8/12) */}
            {portrait.shadowGuidance && (
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <div className="font-semibold text-base">Shadow Handling — how to address stress with them</div>
                </div>
                <div className="rounded-md border-l-4 border-purple-500/70 bg-purple-50 dark:bg-purple-950/30 p-3 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-purple-700 dark:text-purple-300">
                    South Node in the {portrait.shadowGuidance.southHouse}th house
                  </div>
                  <p className="text-purple-950 dark:text-purple-50 text-sm leading-relaxed">{portrait.shadowGuidance.instruction}</p>
                </div>
              </section>
            )}



            {/* 5. Math Check (collapsible) */}
            <details className="rounded-md border border-dashed border-border bg-background/40 group">
              <summary className="cursor-pointer select-none p-3 font-semibold text-sm flex items-center justify-between hover:bg-muted/40 rounded-md">
                <span>🔭 Math Check — what this reading is grounded in</span>
                <span className="text-xs text-muted-foreground group-open:hidden">click to expand</span>
                <span className="text-xs text-muted-foreground hidden group-open:inline">click to collapse</span>
              </summary>
              <div className="p-3 pt-1 space-y-3 border-t border-border text-xs">
                {portrait.mathCheck.thirdHouseSign && (
                  <div>
                    <div className="font-semibold mb-1">3rd-house operating system</div>
                    <p className="text-muted-foreground">
                      3rd-house cusp in {portrait.mathCheck.thirdHouseSign}, ruled by{" "}
                      <span className="font-medium text-foreground">{portrait.mathCheck.thirdHouseRuler ?? "—"}</span>
                      {portrait.mathCheck.thirdHouseRulerSign && ` in ${portrait.mathCheck.thirdHouseRulerSign}`}
                      {portrait.mathCheck.thirdHouseRulerHouse && ` · ${portrait.mathCheck.thirdHouseRulerHouse}th house`}.
                    </p>
                  </div>
                )}
                {portrait.mathCheck.sunAspects.length > 0 && (
                  <div>
                    <div className="font-semibold mb-1">Major aspects to the Sun</div>
                    <ul className="text-muted-foreground space-y-0.5">
                      {portrait.mathCheck.sunAspects.map((a, i) => (
                        <li key={i}>
                          Sun {a.aspect} {a.to} <span className="opacity-60">(orb {a.orb.toFixed(1)}°)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {portrait.mathCheck.moonAspects.length > 0 && (
                  <div>
                    <div className="font-semibold mb-1">Major aspects to the Moon</div>
                    <ul className="text-muted-foreground space-y-0.5">
                      {portrait.mathCheck.moonAspects.map((a, i) => (
                        <li key={i}>
                          Moon {a.aspect} {a.to} <span className="opacity-60">(orb {a.orb.toFixed(1)}°)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

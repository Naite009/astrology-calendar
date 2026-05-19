import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Baby, Sparkles, Mountain, Heart, Anchor, BookOpen, Shield } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { NatalChart } from "@/hooks/useNatalChart";
import type { FamilyRole } from "@/lib/parentChildSynastry";
import { buildChildPortrait } from "@/lib/childPortrait";

interface Member {
  chart: NatalChart;
  role: FamilyRole | string;
}


interface Props {
  members: Member[];
}

export function ChildPortraitCard({ members }: Props) {
  const people = useMemo(() => members.filter((m) => !!m.chart?.id), [members]);
  const [selectedId, setSelectedId] = useState<string | null>(
    people.length === 1 ? people[0].chart.id : null,
  );

  if (people.length === 0) return null;

  const selected = people.find((c) => c.chart.id === selectedId) ?? null;
  const portrait = selected ? buildChildPortrait(selected.chart) : null;

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
            <Select value={selectedId ?? ""} onValueChange={(v) => setSelectedId(v || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a person to see their portrait" />
              </SelectTrigger>
              <SelectContent>
                {people.map((c) => (
                  <SelectItem key={c.chart.id} value={c.chart.id}>
                    {c.chart.name} <span className="opacity-60">· {c.role}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!portrait && (
          <p className="text-muted-foreground italic">Pick a person above to generate their portrait.</p>
        )}


        {portrait && (
          <div className="space-y-5">
            {/* Letter opening */}
            <div className="rounded-md border border-primary/40 bg-background/60 p-4">
              <p className="text-sm leading-relaxed">
                A note about <span className="font-semibold">{portrait.name}</span>
                {portrait.age != null && <span className="text-muted-foreground"> (age {portrait.age})</span>}:
                what follows is not a horoscope. It is a portrait of the developmental work this specific child is doing
                right now, and what they need from the adults around them to do it well.
              </p>
            </div>

            {/* 1. Developmental Anchor */}
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
                      Extra holding needed
                    </div>
                    <p className="text-amber-950 dark:text-amber-50 text-sm">{portrait.developmentalAnchor.extraHolding}</p>
                  </div>
                )}
              </div>
            </section>

            {/* 2. Identity Invitation */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <div className="font-semibold text-base">The Identity Invitation</div>
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
                      North Node · The Stretch
                    </div>
                    <p className="text-emerald-950 dark:text-emerald-50 text-sm">{portrait.identityInvitation.northNode.line}</p>
                  </div>
                )}
                {portrait.identityInvitation.southNode && (
                  <div className="rounded-md border border-purple-300/60 bg-purple-50 dark:bg-purple-950/30 p-3 space-y-1">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-purple-700 dark:text-purple-300">
                      South Node · Default Mode Under Stress
                    </div>
                    <p className="text-purple-950 dark:text-purple-50 text-sm">{portrait.identityInvitation.southNode.line}</p>
                  </div>
                )}
              </div>
            </section>

            {/* 3. Mastery Spot */}
            {(portrait.masterySpot.saturn || portrait.masterySpot.chiron) && (
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mountain className="h-4 w-4 text-primary" />
                  <div className="font-semibold text-base">The Mastery Spot (Sacred Struggles)</div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Not wounds. Practice rooms. These are the places mastery is built, slowly, with a witness.
                </p>
                <div className="space-y-2">
                  {portrait.masterySpot.saturn && (
                    <div className="rounded-md border-l-4 border-slate-500/70 bg-slate-50 dark:bg-slate-900/40 p-3 space-y-1">
                      <div className="font-semibold text-sm">
                        Saturn in {portrait.masterySpot.saturn.sign}
                        {portrait.masterySpot.saturn.house ? ` · ${portrait.masterySpot.saturn.house}th house` : ""}
                      </div>
                      <p className="text-sm">
                        <span className="font-semibold">The struggle:</span> {portrait.masterySpot.saturn.struggle}.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">How to support:</span> {portrait.masterySpot.saturn.howToSupport}
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
                        <span className="font-semibold text-foreground">How to support:</span> {portrait.masterySpot.chiron.howToSupport}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 4. How-To Executive Summary */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <div className="font-semibold text-base">The How-To Summary</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="rounded-md border border-rose-300/60 bg-rose-50/60 dark:bg-rose-950/20 p-3 space-y-1">
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-rose-700 dark:text-rose-300">
                    <Heart className="h-3 w-3" /> The Ritual
                  </div>
                  <p className="text-sm">{portrait.howTo.ritual}</p>
                </div>
                <div className="rounded-md border border-sky-300/60 bg-sky-50/60 dark:bg-sky-950/20 p-3 space-y-1">
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-sky-700 dark:text-sky-300">
                    <BookOpen className="h-3 w-3" /> The Learning Style
                  </div>
                  <p className="text-sm">{portrait.howTo.learningStyle}</p>
                </div>
                <div className="rounded-md border border-emerald-300/60 bg-emerald-50/60 dark:bg-emerald-950/20 p-3 space-y-1">
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-300">
                    <Shield className="h-3 w-3" /> The Boundary
                  </div>
                  <p className="text-sm">{portrait.howTo.boundary}</p>
                </div>
              </div>
            </section>

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

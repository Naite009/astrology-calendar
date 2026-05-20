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

// Decipher for Mastery Spot: shows a small button that reveals the Real Talk
// paragraph beneath the existing struggle/support copy (instead of replacing it).
function MasteryDecipher({ realTalk }: { realTalk: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2 pt-1">
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="inline-flex items-center gap-1.5 rounded-full border border-foreground/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider opacity-70 hover:opacity-100 transition-opacity"
      >
        {show ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
        {show ? "Hide Decipher" : "Decipher · Real Talk"}
      </button>
      {show && (
        <p className="text-sm leading-relaxed italic text-foreground/90 border-l-2 border-foreground/30 pl-3">
          {realTalk}
        </p>
      )}
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

                  {/* === Narrative Briefing ============================================
                      A single deep prose read built from three connected arcs:
                      Protective Strategy · Identity Collision · Pressure & the Dark Room.
                      Wit + Grit voice only. No generic definitions, no header skeletons. */}
                  {(() => {
                    const N = portrait.name;
                    const cr = portrait.chartRuler;
                    const sun = portrait.identityInvitation.sun;
                    const venus = (portrait as any).venusPlacement as { sign: string; house: number | null } | undefined;
                    const chiron = (portrait as any).chironPlacement as { sign: string; house: number | null } | undefined;
                    const drive = portrait.energyDischarge;
                    const pressure = portrait.pressureSignature;
                    const cloak = portrait.cloakingNote;
                    const twelfth = (portrait as any).twelfthHouseBodies as Array<{ name: string; sign: string }> | undefined;
                    const ord = (n: number | null | undefined) => {
                      if (!n) return "";
                      const s = ["th","st","nd","rd"], v = n % 100;
                      return n + (s[(v - 20) % 10] || s[v] || s[0]);
                    };

                    // Arc 1 — Protective Strategy (Rising + Venus)
                    let arc1: string | null = null;
                    if (cr && venus) {
                      const sameAsRuler = cr.rulerName === "Venus";
                      const venusClause = sameAsRuler
                        ? `Venus is also the captain of the chart, so the ${venus.sign} heart in the ${ord(venus.house)} house is what the ${cr.ascSign} surface is actually defending`
                        : `underneath the ${cr.ascSign} surface, a Venus in ${venus.sign} (${ord(venus.house)} house) heart is what the mask is actually defending`;
                      arc1 =
                        `${N} wears the ${cr.ascSign} mask like a tactical peace treaty. The smile, the leveling of voices, the small adjustments that get the room to settle — none of it is performance for its own sake. It is a way to lower the volume so a ${venus.sign} heart underneath doesn't feel trapped or crowded. ${venusClause}, and what it values is room to move. ` +
                        `Watch the eight-in-the-morning kitchen and you'll see it: ${N} reads the tension first, smooths the edges, hands out the coffee, agrees with the easier opinion. It looks like graciousness. What it actually buys is an exit. The diplomat work clears a corridor so the ${venus.sign} part of them can keep options open later in the day. Treat the niceness as a doorway, not a verdict — if the doorway starts closing, the charm drops fast.`;
                    }

                    // Arc 2 — Identity Collision (Sun + Chiron + Sun house)
                    let arc2: string | null = null;
                    if (sun) {
                      const sunHousePhrase = sun.house ? `in the ${ord(sun.house)} house` : "";
                      const seenPhrase = sun.house === 1
                        ? "the 1st-house Sun makes self-visibility the actual job — the work is to be seen as themselves, in their own body, without translation"
                        : `the Sun ${sunHousePhrase} carries the need to be seen on their own terms`;
                      const chironPhrase = chiron
                        ? `Chiron sits in ${chiron.sign}${chiron.house ? ` in the ${ord(chiron.house)} house` : ""}, running a quiet audit in the background: is this too much? is this fair? am I allowed? ` +
                          (chiron.house === 7
                            ? `The 7th-house location of that audit means the question gets routed through other people — every move forward feels like it has to be approved by the room before it counts. `
                            : `That audit fires before ${N} has even finished the sentence. `)
                        : "";
                      arc2 =
                        `Inside, ${seenPhrase}. ${chironPhrase}` +
                        `Life starts to feel like a long audition where the role is "themselves" and the casting director is invisible. The mastery here is not a slogan about self-advocacy. It is something more physical: standing in the center of the room, taking up the full square footage of their body, and not scanning anyone's face for an apology. When ${N} stops asking permission to exist out loud, the audit goes quiet, because there is no longer anything for it to police.`;
                    }

                    // Arc 3 — Pressure & The Dark Room (Mars + Moon/Mercury 12th)
                    let arc3: string | null = null;
                    if (drive || cloak || twelfth) {
                      const marsPart = drive
                        ? `The engine underneath is a ${drive.marsSign} Mars in the ${ord(drive.marsHouse)} house. It is intense, private, and does not waste motion. ${drive.marsSign === "Scorpio" ? "Scorpio Mars does not flare for attention; it flares when it has been chased into a corner it was already trying to leave. " : ""}`
                        : "";
                      const cloakBodies = cloak?.bodies?.length
                        ? cloak.bodies.map(b => `${b.sign} ${b.name}`).join(" and ")
                        : (twelfth && twelfth.length ? twelfth.map(b => `${b.sign} ${b.name}`).join(" and ") : null);
                      const cloakPart = cloakBodies
                        ? `Layered over that engine is a 12th-house cloaking need — ${cloakBodies} sit${cloakBodies.includes(" and ") ? "" : "s"} in the back room of the chart, which means ${N} has to go inward to come back to themselves. The silence is not withdrawal from you. It is a return to their own body, the place where the thinking actually finishes. `
                        : `${N} also needs a closed door to come back to themselves. The silence is not withdrawal from you; it is a return to their own body, where the thinking actually finishes. `;
                      const triggerPart = pressure
                        ? `Trigger to watch: ${pressure.trigger}. `
                        : "";
                      arc3 =
                        marsPart + cloakPart + triggerPart +
                        `Warning for the people around them: if you chase ${N} into the silence before they've processed, the ${drive?.marsSign ?? "Mars"} engine will flare, and what comes back will be sharper than anyone meant. Let them cloak. When they come back out, the answer will already be finished, and the conversation can be short. That's the deal.`;
                    }

                    const arcs = [
                      { key: "protective", label: "The Protective Strategy", sub: "Rising + Venus",                body: arc1, accent: "border-cyan-300/60 bg-cyan-50/60 dark:bg-cyan-950/20" },
                      { key: "identity",   label: "The Identity Collision",  sub: "Sun + Chiron + 1st House",      body: arc2, accent: "border-amber-300/60 bg-amber-50/60 dark:bg-amber-950/20" },
                      { key: "pressure",   label: "The Pressure & The Dark Room", sub: "Mars + Moon + 12th House", body: arc3, accent: "border-purple-300/60 bg-purple-50/60 dark:bg-purple-950/20" },
                    ].filter(a => a.body);

                    if (arcs.length === 0) return null;

                    return (
                      <section className="space-y-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <div className="font-semibold text-base">Narrative Briefing</div>
                          <Badge variant="outline" className="text-[10px]">Deep Read</Badge>
                        </div>
                        <div className="space-y-3">
                          {arcs.map(a => (
                            <div key={a.key} className={cn("rounded-md border p-4 space-y-2", a.accent)}>
                              <div className="flex items-baseline gap-2 flex-wrap">
                                <div className="font-semibold text-sm">{a.label}</div>
                                <div className="text-[10px] uppercase tracking-wider opacity-60">{a.sub}</div>
                              </div>
                              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">{a.body}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  })()}



                </>
              );
            })()}



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

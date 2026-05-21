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

// Decipher toggle, swaps a section's prose for its blunt "Real Talk"
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

                  {/* === Behavioral Portrait =========================================
                      Color-coded sections, each with three layers:
                      • Math   – the technical anchor (sign, house, degree, orb)
                      • Visual – what the parent / partner actually sees
                      • Internal – what is happening structurally underneath
                      Sections:
                        2. Social Strategy   (Rising + Chart Ruler)   – emerald
                        3. Identity Core     (Sun · Chiron opposition) – amber
                        4. Functioning Engine (Mars vs 12H Mercury)    – rose
                      The Developmental Anchor above is Section 1. */}
                  {(() => {
                    const N = portrait.name;
                    const cr = portrait.chartRuler;
                    const sun = portrait.identityInvitation.sun;
                    const venus = portrait.venusPlacement;
                    const chiron = portrait.chironPlacement;
                    const ascDegree = portrait.ascDegree;
                    const drive = portrait.energyDischarge;
                    const pressure = portrait.pressureSignature;
                    const cloak = portrait.cloakingNote;
                    const twelfth = portrait.twelfthHouseBodies;
                    const cog = portrait.cognitiveProfile;
                    const math = portrait.mathCheck;

                    const ord = (n: number | null | undefined) => {
                      if (!n) return "";
                      const s = ["th", "st", "nd", "rd"], v = n % 100;
                      return n + (s[(v - 20) % 10] || s[v] || s[0]);
                    };
                    const fmtDeg = (d: number | null | undefined) =>
                      typeof d === "number" ? `${d.toFixed(1)}°` : null;

                    const sunChiron = math.sunAspects?.find(a => a.to === "Chiron");
                    const twelfthList = (cloak?.bodies && cloak.bodies.length ? cloak.bodies : (twelfth ?? [])) as Array<{ name: string; sign: string }>;
                    const hasMoon12 = twelfthList.some(b => b.name === "Moon");
                    const hasMerc12 = twelfthList.some(b => b.name === "Mercury");

                    type Section = {
                      key: string;
                      title: string;
                      tag: string;
                      tone: "emerald" | "amber" | "rose";
                      icon: JSX.Element;
                      math: string;
                      visual: string;
                      internal: string;
                    };
                    const sections: Section[] = [];

                    // ── 2. The Social Strategy (Rising + Chart Ruler) ─────────────────
                    if (cr && venus) {
                      const ascStr = `${cr.ascSign} Rising${fmtDeg(ascDegree) ? ` at ${fmtDeg(ascDegree)}` : ""}`;
                      const rulerStr = `${cr.rulerName} in ${cr.rulerSign}${fmtDeg(venus.degree) && cr.rulerName === "Venus" ? ` at ${fmtDeg(venus.degree)}` : ""}${cr.rulerHouse ? `, ${ord(cr.rulerHouse)} house` : ""}`;
                      const pureIntent = cr.rulerName === "Venus" && typeof venus.degree === "number" && venus.degree < 1;
                      sections.push({
                        key: "social",
                        title: "The Social Strategy",
                        tag: "Rising · Chart Ruler",
                        tone: "emerald",
                        icon: <Shield className="h-4 w-4" />,
                        math: `${ascStr}, ruled by ${rulerStr}.`,
                        visual: `A "helpful" person. ${N} reads the temperature of the room, levels the volume, and hands out the small kindness that will get the group to settle before anyone has to ask. It looks like graciousness, an agreeable nod, a soft pivot at 8 AM in the kitchen.`,
                        internal: `The Chart Ruler is the motive behind the Mask. The ${cr.ascSign} diplomacy is a tactical buffer, its job is to lower the cost of being in the room so the ${cr.rulerSign} engine underneath can keep its options open. That engine is ${cr.rulerName}${cr.rulerHouse === 2 ? `, parked in the 2nd house, where freedom and self-worth and resources are the same currency` : ""}. ${pureIntent ? `Venus at 0° Sagittarius sits on the degree of Pure Intent, which makes the need for freedom non-negotiable, not a preference. ` : ""}${N} is not being nice. ${N} is being Sustainable, leveling the room so her ${cr.rulerSign} sense of self-worth is not drained by other people's chaos.`,
                      });
                    }

                    // ── 3. The Identity Core (Sun · Chiron) ───────────────────────────
                    if (sun && chiron && sunChiron) {
                      const orbStr = `${sunChiron.orb.toFixed(1)}°`;
                      const tight = sunChiron.orb <= 2;
                      const isOpp = sunChiron.aspect === "opposition";
                      const cardinal = ["Aries", "Cancer", "Libra", "Capricorn"].includes(sun.sign) && ["Aries", "Cancer", "Libra", "Capricorn"].includes(chiron.sign);
                      sections.push({
                        key: "identity",
                        title: "The Identity Core",
                        tag: "Sun · Chiron · Visibility Paradox",
                        tone: "amber",
                        icon: <Eye className="h-4 w-4" />,
                        math: `Sun in ${sun.sign}${sun.house ? ` (${ord(sun.house)} house)` : ""} ${sunChiron.aspect} Chiron in ${chiron.sign}${chiron.house ? ` (${ord(chiron.house)} house)` : ""} at ${orbStr} orb.`,
                        visual: `${N} looks like she is checking for a green light before she acts. She can seem to audition for her own life instead of inhabiting it, scanning the nearest face for whether the version of her in the room is the version she is allowed to have.`,
                        internal: `${cardinal && isOpp ? `This is a Cardinal Opposition on the Angle of Identity. ` : ""}The Sun is "Who I Am." Chiron is "Where I Am Sensitive." Because the orb is ${tight ? "this tight" : "active"} (${orbStr}), the two parts are in permanent tug-of-war. The ${ord(sun.house)}-house Sun wants to take up the full square footage of the body without apology; the ${chiron.house ? `${ord(chiron.house)}-house` : ""} Chiron feels everyone else's reaction first and runs a quiet Permission Audit before any visible move. This is not low self-esteem, it is a high-speed collision between her own light and other people's shadows, happening behind her face in real time.`,
                      });
                    }

                    // ── 4. The Functioning Engine (Mars vs 12H Mercury) ───────────────
                    if (drive) {
                      const marsStr = `${drive.marsSign} Mars in the ${ord(drive.marsHouse)} house`;
                      const isMars1 = drive.marsHouse === 1;
                      const isScorpio = drive.marsSign === "Scorpio";
                      const translators: string[] = [];
                      if (hasMoon12) translators.push("Moon");
                      if (hasMerc12) translators.push(`${cog?.mercurySign ? cog.mercurySign + " " : ""}Mercury`);
                      const translatorMath = translators.length
                        ? `${translators.join(" and ")} in the 12th house.`
                        : (cog?.mercurySign ? `${cog.mercurySign} Mercury as the translator.` : "translator placement.");

                      sections.push({
                        key: "engine",
                        title: "The Functioning Engine",
                        tag: "Mars · 12th House · The Dark Room",
                        tone: "rose",
                        icon: <Mountain className="h-4 w-4" />,
                        math: `${marsStr} vs ${translatorMath}`,
                        visual: `A pressure cooker with a delay. ${N} feels things physically and immediately, but the words arrive late, sometimes hours late, sometimes through a closed door first. From the outside this can read as stubborn, withdrawn, or moody. It is none of those.`,
                        internal: `This is a Mutual Injunction between Action (Mars) and Expression (${translators.length ? translators.join("/") : "Mercury"}). ${isMars1 ? `${drive.marsSign} Mars in the 1st is a high-pressure steam engine, the temperature shows up in the body before there is time to choose a face for it. ` : ""}${(hasMoon12 || hasMerc12) ? `But the translator sits in the 12th, the house of the unconscious, the Dark Room. Thoughts have to travel through deep water before they can be spoken. ` : ""}This creates the Signal Gap: feeling at 100 mph, language at 10. ${N} is not being silent, she is literally translating ${isMars1 ? "1st-house heat" : "Mars heat"} into ${(hasMoon12 || hasMerc12) ? "12th-house language" : "language"}. ${pressure ? `${pressure.trigger.replace(/\.$/, "")}, that is what turns the gap dangerous. ` : ""}${isScorpio ? `A Scorpio Mars under pressure does not negotiate, it disappears, and the disappearance is the warning shot. ` : ""}If you chase ${N} into the silence before the engine has cooled, you will hit a wall. Let her cloak. When she comes back, the answer will be finished.`,
                      });
                    }

                    if (sections.length === 0) return null;

                    const toneStyles: Record<Section["tone"], { wrap: string; bar: string; chip: string; mathBox: string; visualBox: string; internalBox: string; iconWrap: string; }> = {
                      emerald: {
                        wrap: "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20",
                        bar: "bg-emerald-500/80",
                        chip: "border-emerald-500/50 text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-950/40",
                        mathBox: "border-l-2 border-emerald-500/60 bg-emerald-100/40 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100",
                        visualBox: "border border-emerald-500/30 bg-background/60",
                        internalBox: "border border-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-950/30",
                        iconWrap: "text-emerald-600 dark:text-emerald-400",
                      },
                      amber: {
                        wrap: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
                        bar: "bg-amber-500/80",
                        chip: "border-amber-500/50 text-amber-800 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-950/40",
                        mathBox: "border-l-2 border-amber-500/60 bg-amber-100/40 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100",
                        visualBox: "border border-amber-500/30 bg-background/60",
                        internalBox: "border border-amber-500/40 bg-amber-50/70 dark:bg-amber-950/30",
                        iconWrap: "text-amber-600 dark:text-amber-400",
                      },
                      rose: {
                        wrap: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20",
                        bar: "bg-rose-500/80",
                        chip: "border-rose-500/50 text-rose-700 dark:text-rose-300 bg-rose-100/60 dark:bg-rose-950/40",
                        mathBox: "border-l-2 border-rose-500/60 bg-rose-100/40 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100",
                        visualBox: "border border-rose-500/30 bg-background/60",
                        internalBox: "border border-rose-500/40 bg-rose-50/70 dark:bg-rose-950/30",
                        iconWrap: "text-rose-600 dark:text-rose-400",
                      },
                    };

                    return (
                      <>
                        {sections.map((s) => {
                          const t = toneStyles[s.tone];
                          return (
                            <section key={s.key} className={cn("rounded-lg border overflow-hidden", t.wrap)}>
                              <div className={cn("h-1 w-full", t.bar)} />
                              <div className="p-4 space-y-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={t.iconWrap}>{s.icon}</span>
                                  <div className="font-semibold text-base">{s.title}</div>
                                  <Badge variant="outline" className={cn("text-[10px]", t.chip)}>{s.tag}</Badge>
                                </div>

                                <div className={cn("rounded-md p-3", t.mathBox)}>
                                  <div className="text-[10px] uppercase tracking-wider font-bold opacity-70 mb-1">The Math</div>
                                  <p className="text-xs leading-relaxed font-mono">{s.math}</p>
                                </div>

                                <div className={cn("rounded-md p-3", t.visualBox)}>
                                  <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">The Visual · What the parent sees</div>
                                  <p className="text-sm leading-relaxed text-foreground/90">{s.visual}</p>
                                </div>

                                <div className={cn("rounded-md p-3", t.internalBox)}>
                                  <div className="text-[10px] uppercase tracking-wider font-bold opacity-70 mb-1">The Internal · The Astrology Math</div>
                                  <p className="text-sm leading-relaxed text-foreground/90">{s.internal}</p>
                                </div>
                              </div>
                            </section>
                          );
                        })}
                      </>
                    );
                  })()}




                </>
              );
            })()}




            {/* Shadow Guidance, South Node in hidden house (6/8/12) */}
            {portrait.shadowGuidance && (
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <div className="font-semibold text-base">Shadow Handling, how to address stress with them</div>
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
                <span>🔭 Math Check, what this reading is grounded in</span>
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

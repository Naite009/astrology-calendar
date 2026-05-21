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

                  {/* === Behavioral Portrait — Synthesis of Friction ================
                      Flowing prose, no bullets, no boxes. Bold math anchors live
                      inline inside the paragraphs. Framed by the Chiron Return
                      where applicable. Four movements:
                        I.   The Energy Debt        (Rising + Chart Ruler)
                        II.  The Phantom Auditor    (Sun · Chiron opposition)
                        III. The Contentious Silence(Mars · 12H Mercury/Moon)
                        IV.  The Grand Finale       (Chiron Return framing)
                  ================================================================= */}
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
                    const age = portrait.age;

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

                    // Chiron Return window: ~ages 48–51 (Chiron transit to natal Chiron)
                    const inChironReturn = typeof age === "number" && age >= 48 && age <= 51;

                    // Reusable bold inline math anchor
                    const M = ({ children }: { children: React.ReactNode }) => (
                      <strong className="font-semibold text-foreground">{children}</strong>
                    );

                    type Movement = {
                      key: string;
                      roman: string;
                      title: string;
                      tag: string;
                      tone: "emerald" | "amber" | "rose" | "indigo";
                      icon: JSX.Element;
                      body: JSX.Element;
                    };
                    const movements: Movement[] = [];

                    // ── I. The Energy Debt ────────────────────────────────────────────
                    if (cr && venus) {
                      const ascStr = `${cr.ascSign} Rising${fmtDeg(ascDegree) ? ` at ${fmtDeg(ascDegree)}` : ""}`;
                      const venusDeg = fmtDeg(venus.degree);
                      const zeroDeg = cr.rulerName === "Venus" && typeof venus.degree === "number" && venus.degree < 1;
                      const rulerStr = `${cr.rulerName} in ${cr.rulerSign}${venusDeg && cr.rulerName === "Venus" ? ` at ${venusDeg}` : ""}${cr.rulerHouse ? `, ${ord(cr.rulerHouse)} house` : ""}`;
                      movements.push({
                        key: "energy-debt",
                        roman: "I",
                        title: "The Energy Debt",
                        tag: "The Mask vs. The Heart",
                        tone: "emerald",
                        icon: <Shield className="h-4 w-4" />,
                        body: (
                          <>
                            Here is the straight version. {N}'s "front door" is <M>{ascStr}</M>, and that door is wired to keep the room calm. If the volume goes up, if two people are bickering, if someone is hurt, she feels physical pressure to step in and smooth it out. From the outside this looks like niceness. It is not. The reason she works that hard is sitting one layer down: her chart is run by <M>{rulerStr}</M>, and {cr.rulerSign === "Sagittarius" ? "Sagittarius is claustrophobic" : `${cr.rulerSign} needs room`}. When the room gets heavy with other people's problems, she feels trapped. So she works the mask, lowers the temperature, hands out the small kindness, all so the room will finally settle and she can have five minutes to herself. {zeroDeg ? <>Her Venus sits at <M>0° Sagittarius</M>, the very first degree, which makes that need for open space non-negotiable, not a preference. </> : null}She is not a people-pleaser. She is an <em>Over-Functioner</em>, doing twice the emotional work everyone else is doing, just to buy back her own breathing room. That is the cost, and it is invisible to almost everyone in her life.
                          </>
                        ),
                      });
                    }

                    // ── II. The Permission Audit ──────────────────────────────────────
                    if (sun && chiron && sunChiron) {
                      const orbStr = `${sunChiron.orb.toFixed(1)}°`;
                      const tight = sunChiron.orb <= 2;
                      const sunStr = `${sun.sign} Sun${sun.house ? ` in the ${ord(sun.house)} house` : ""}`;
                      const chiStr = `Chiron in ${chiron.sign}${chiron.house ? `, ${ord(chiron.house)} house` : ""}`;
                      movements.push({
                        key: "permission-audit",
                        roman: "II",
                        title: "The Permission Audit",
                        tag: "The Ghost in the Room",
                        tone: "amber",
                        icon: <Eye className="h-4 w-4" />,
                        body: (
                          <>
                            Here is the part that costs her the most. Her <M>{sunStr}</M> is the natural part of her that wants to lead, have an opinion, pick the restaurant, take up space. But it sits in a {tight ? "tight " : ""}<M>{orbStr} {sunChiron.aspect}</M> to <M>{chiStr}</M>, and that Chiron is essentially her physical sensitivity to other people's reactions. The two are wired directly across from each other, which means she cannot just <em>be herself</em> without scanning the nearest face to see how it landed. If she wants something, her brain checks your expression first. If she sees even a flicker of annoyance, she shuts her own preference down to keep you comfortable. The honest way to say it is this: {N} feels like she needs a <em>permission slip</em> from the people around her just to exist as herself. She is constantly auditing the volume of her own personality to make sure she is not "too much" for the room. That audit is happening behind her eyes every single day, and it is exhausting.
                          </>
                        ),
                      });
                    }

                    // ── III. The Signal Gap ──────────────────────────────────────────
                    if (drive) {
                      const marsStr = `${drive.marsSign} Mars in the ${ord(drive.marsHouse)} house`;
                      const isMars1 = drive.marsHouse === 1;
                      const isScorpio = drive.marsSign === "Scorpio";
                      const translators: string[] = [];
                      if (hasMoon12) translators.push("Moon");
                      if (hasMerc12) translators.push(`${cog?.mercurySign ? cog.mercurySign + " " : ""}Mercury`);
                      const translatorStr = translators.length
                        ? `${translators.join(" and ")} in the 12th house`
                        : (cog?.mercurySign ? `${cog.mercurySign} Mercury in the 12th house` : "her translator placement in the 12th house");
                      movements.push({
                        key: "signal-gap",
                        roman: "III",
                        title: "The Signal Gap",
                        tag: "The Engine vs. The Dark Room",
                        tone: "rose",
                        icon: <Mountain className="h-4 w-4" />,
                        body: (
                          <>
                            When she goes silent, the room reads it wrong. Here is what is actually happening. {N} has a high-heat engine: <M>{marsStr}</M>{isMars1 ? ", sitting right at the front of the chart" : ""}. When she gets angry, excited, or hurt, she feels it in her body instantly, like a flash of heat. {isScorpio ? <>And a <M>Scorpio Mars</M> does not run at room temperature, it runs hot. </> : null}But the part of her that finds the <em>words</em> for that heat is <M>{translatorStr}</M>, which functions like a soundproof, dimly lit back room. Feelings have to travel through that room before they can come out as language. That creates a Signal Gap: feeling at full speed, words at quarter speed. When she gets quiet, she is not stonewalling and she is not sulking. She is in the dark room cooling the engine and looking for words that will not burn the person in front of her. {pressure ? <>{pressure.trigger.replace(/\.$/, "")}, that is exactly when the valve gets dangerous. </> : null}If you follow her into that silence and keep asking "what's wrong," you are forcing her to open the door before the heat is down, and that is when something sharp comes out that she will regret. Her silence is her way of protecting you from her intensity. Let her have it. When she comes back, the answer will be clean.
                          </>
                        ),
                      });
                    }


                    if (movements.length === 0) return null;

                    const toneStyles: Record<Movement["tone"], { wrap: string; bar: string; chip: string; iconWrap: string; roman: string; body: string; }> = {
                      emerald: {
                        wrap: "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20",
                        bar: "bg-emerald-500/80",
                        chip: "border-emerald-500/50 text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-950/40",
                        iconWrap: "text-emerald-600 dark:text-emerald-400",
                        roman: "text-emerald-600/70 dark:text-emerald-400/70",
                        body: "text-emerald-950/90 dark:text-emerald-50/90",
                      },
                      amber: {
                        wrap: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
                        bar: "bg-amber-500/80",
                        chip: "border-amber-500/50 text-amber-800 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-950/40",
                        iconWrap: "text-amber-600 dark:text-amber-400",
                        roman: "text-amber-600/70 dark:text-amber-400/70",
                        body: "text-amber-950/90 dark:text-amber-50/90",
                      },
                      rose: {
                        wrap: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20",
                        bar: "bg-rose-500/80",
                        chip: "border-rose-500/50 text-rose-700 dark:text-rose-300 bg-rose-100/60 dark:bg-rose-950/40",
                        iconWrap: "text-rose-600 dark:text-rose-400",
                        roman: "text-rose-600/70 dark:text-rose-400/70",
                        body: "text-rose-950/90 dark:text-rose-50/90",
                      },
                      indigo: {
                        wrap: "border-indigo-500/40 bg-indigo-50/40 dark:bg-indigo-950/20",
                        bar: "bg-indigo-500/80",
                        chip: "border-indigo-500/50 text-indigo-700 dark:text-indigo-300 bg-indigo-100/60 dark:bg-indigo-950/40",
                        iconWrap: "text-indigo-600 dark:text-indigo-400",
                        roman: "text-indigo-600/70 dark:text-indigo-400/70",
                        body: "text-indigo-950/90 dark:text-indigo-50/90",
                      },
                    };

                    return (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <div className="font-semibold text-base">Behavioral Portrait, Synthesis of Friction</div>
                        </div>
                        {movements.map((m) => {
                          const t = toneStyles[m.tone];
                          return (
                            <section key={m.key} className={cn("rounded-lg border overflow-hidden", t.wrap)}>
                              <div className={cn("h-1 w-full", t.bar)} />
                              <div className="p-5 space-y-3">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <span className={cn("text-2xl font-bold leading-none", t.roman)}>{m.roman}</span>
                                  <span className={t.iconWrap}>{m.icon}</span>
                                  <div className="font-semibold text-base">{m.title}</div>
                                  <Badge variant="outline" className={cn("text-[10px]", t.chip)}>{m.tag}</Badge>
                                </div>
                                <p className={cn("text-[15px] leading-[1.85]", t.body)}>{m.body}</p>
                              </div>
                            </section>
                          );
                        })}
                      </div>
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

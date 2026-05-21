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

                    // Small subheader used inside each movement body
                    const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
                      <div className="mt-3 first:mt-0">
                        <div className="text-[11px] font-semibold uppercase tracking-wider opacity-70 mb-1">{label}</div>
                        <div>{children}</div>
                      </div>
                    );

                    // ── I. The Environmental Baseline ─────────────────────────────────
                    if (cr && venus) {
                      const ascStr = `${cr.ascSign} Rising${fmtDeg(ascDegree) ? ` (${fmtDeg(ascDegree)})` : ""}`;
                      const venusDeg = fmtDeg(venus.degree);
                      const zeroDeg = cr.rulerName === "Venus" && typeof venus.degree === "number" && venus.degree < 1;
                      const rulerStr = `${cr.rulerName} in ${cr.rulerSign}${venusDeg && cr.rulerName === "Venus" ? ` (${venusDeg})` : ""}${cr.rulerHouse ? `, ${ord(cr.rulerHouse)} House` : ""}`;
                      movements.push({
                        key: "environmental-baseline",
                        roman: "I",
                        title: "The Environmental Baseline",
                        tag: "Rising / Chart Ruler",
                        tone: "emerald",
                        icon: <Shield className="h-4 w-4" />,
                        body: (
                          <>
                            <Row label="The Math"><M>{ascStr}</M> ruled by <M>{rulerStr}</M></Row>
                            <Row label="The Physics">
                              The Rising sign is the <strong>front door</strong>, but the Chart Ruler decides <em>what the door is for</em>. {N}'s door is <M>{ascStr}</M>, so on the surface it looks like a standard Libra setup: read the room, smooth the edges, keep things pleasant. That is the cover story. The actual operator behind the door is <M>{rulerStr}</M>{zeroDeg ? <>, sitting at the <M>0° anaretic</M> opening of the sign</> : null}, and {cr.rulerSign === "Sagittarius" ? "Sagittarius has exactly one non-negotiable requirement: freedom to move" : `${cr.rulerSign} has its own non-negotiable requirement`}. {zeroDeg ? <>The <M>0.0°</M> degree is the rawest, most uncompromising expression of the sign, there is no nuance layered on top yet, so the demand for open space runs at <strong>maximum amplitude</strong>. </> : null}
                            </Row>
                            <Row label="The Truth">
                              That changes the entire function of her Libra Rising. It is not "wants to be liked." It is a <strong>Tactical Tool</strong>. Generic Libra Rising soothes the room because it wants approval. {N}'s Libra Rising soothes the room because her <M>{cr.rulerName} at {venusDeg} {cr.rulerSign}</M> cannot tolerate being trapped, and a calm room is the fastest exit from emotional captivity. The diplomacy is not the goal, it is the <strong>tradecraft</strong>. She greases the social tracks so her {cr.rulerSign === "Sagittarius" ? "Sagittarius" : cr.rulerSign} ruler can keep its independence intact. The mask exists to protect the freedom of the operator behind it. Every smoothed conflict, every defused tension, every "I'm fine" is the {cr.rulerName === "Venus" ? "Venus" : cr.rulerName}-ruler buying back its right to leave the conversation, the room, or the relationship on its own terms.
                            </Row>
                          </>
                        ),
                      });
                    }

                    // ── II. The Identity Glitch ───────────────────────────────────────
                    if (sun && chiron && sunChiron) {
                      const orbStr = `${sunChiron.orb.toFixed(1)}°`;
                      const tight = sunChiron.orb <= 2;
                      const sunStr = `${sun.sign} Sun${sun.house ? ` (${ord(sun.house)} House)` : ""}`;
                      const chiStr = `Chiron in ${chiron.sign}${chiron.house ? ` (${ord(chiron.house)} House)` : ""}`;
                      movements.push({
                        key: "identity-glitch",
                        roman: "II",
                        title: "The Identity Glitch",
                        tag: "Sun · Chiron Collision",
                        tone: "amber",
                        icon: <Eye className="h-4 w-4" />,
                        body: (
                          <>
                            <Row label="The Math"><M>{sunStr}</M> opposite <M>{chiStr}</M> at a <M>{tight ? "tight " : ""}{orbStr} orb</M></Row>
                            <Row label="The Physics">
                              This is a <strong>literal internal collision</strong> between the <em>Need to Be</em> (Sun) and the <em>Fear of Reaction</em> (Chiron). Opposition means the two ends are wired directly across from each other, every time one fires, the other fires back. At <M>{orbStr}</M> there is no buffer between them.
                            </Row>
                            <Row label="The Truth">
                              Call this the <strong>Permission Audit</strong>. Because the orb is so tight, she feels a physical <em>sting</em> in her identity the moment she takes up space without first checking that it is "legal." She is not scanning faces for approval. She is fighting an <strong>internal glitch</strong> that tells her being herself is a violation. The audit runs behind her eyes every day, and it costs energy whether anyone in the room is reacting or not.
                            </Row>
                          </>
                        ),
                      });
                    }

                    // ── III. The Signal Failure ───────────────────────────────────────
                    if (drive) {
                      const marsStr = `${drive.marsSign} Mars (${ord(drive.marsHouse)} House)`;
                      const isScorpio = drive.marsSign === "Scorpio";
                      const translators: string[] = [];
                      if (hasMoon12) translators.push("Moon");
                      if (hasMerc12) translators.push(`${cog?.mercurySign ? cog.mercurySign + " " : ""}Mercury`);
                      const translatorStr = translators.length
                        ? `${translators.join(" / ")} in the 12th House`
                        : (cog?.mercurySign ? `${cog.mercurySign} Mercury in the 12th House` : "translator placement in the 12th House");
                      movements.push({
                        key: "signal-failure",
                        roman: "III",
                        title: "The Signal Failure",
                        tag: "Mars · Mercury Wiring",
                        tone: "rose",
                        icon: <Mountain className="h-4 w-4" />,
                        body: (
                          <>
                            <Row label="The Math"><M>{marsStr}</M> vs. <M>{translatorStr}</M></Row>
                            <Row label="The Physics">
                              Direct conflict between a <strong>High-Heat Engine</strong> and a <strong>Buffered Translator</strong>. {isScorpio ? <>A <M>Scorpio Mars</M> does not idle, it runs at full combustion. </> : null}But the part of her that converts that heat into <em>words</em> sits inside the <strong>Dark Room</strong> of the 12th House, which routes every signal through a sound-dampening layer before language can form.
                            </Row>
                            <Row label="The Truth">
                              Call this the <strong>Technical Lag</strong>. She feels intensity at <strong>100mph</strong>, but the signal cannot travel from the engine to her mouth fast enough. She is not <em>choosing</em> to be silent. The wiring physically delays the output. Her silence is a byproduct of her internal architecture, not a social move. Push her before the signal completes and what comes out is jagged, not because she meant it, but because you forced an incomplete transmission.
                            </Row>
                          </>
                        ),
                      });
                    }

                    // ── IV. The Developmental Threshold ───────────────────────────────
                    if (inChironReturn) {
                      movements.push({
                        key: "developmental-threshold",
                        roman: "IV",
                        title: "The Developmental Threshold",
                        tag: `Chiron Return · Age ${age}`,
                        tone: "indigo",
                        icon: <BookOpen className="h-4 w-4" />,
                        body: (
                          <>
                            <Row label="The Math"><M>Transit Chiron conjunct Natal Chiron</M> · window <M>ages 48–51</M></Row>
                            <Row label="The Physics">
                              Once every ~50 years, Chiron returns to its natal degree. The sore spot stops being a wound the system tries to patch and becomes a piece of <strong>mastered hardware</strong>.
                            </Row>
                            <Row label="The Truth">
                              This is the moment {N} stops trying to <em>fix</em> the glitches above, the Permission Audit, the Technical Lag, the Over-Functioning, and starts <strong>owning the power of her intensity</strong>. The Audit gets retired. The silence stops being apologized for. The Sagittarius heart stops asking permission for its own oxygen. The whole system reboots with the same wiring, but with the operator finally at the controls.
                            </Row>
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

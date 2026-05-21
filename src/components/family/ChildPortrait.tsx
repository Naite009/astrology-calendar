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

                    // ── I. The Chain of Command + Mutual Reception Loop ──────────────
                    if (cr && venus) {
                      const ascStr = `${cr.ascSign} Rising${fmtDeg(ascDegree) ? ` (${fmtDeg(ascDegree)})` : ""}`;
                      const venusDeg = fmtDeg(venus.degree);
                      const zeroDeg = cr.rulerName === "Venus" && typeof venus.degree === "number" && venus.degree < 1;
                      const rulerStr = `${cr.rulerName} in ${cr.rulerSign}${venusDeg && cr.rulerName === "Venus" ? ` (${venusDeg})` : ""}${cr.rulerHouse ? `, ${ord(cr.rulerHouse)} House` : ""}`;
                      const dispo = cr.dispositor;
                      const dispoDeg = fmtDeg(dispo?.degree ?? null);
                      const dispoStr = dispo
                        ? `${dispo.name} in ${dispo.sign}${dispoDeg ? ` (${dispoDeg})` : ""}${dispo.house ? `, ${ord(dispo.house)} House` : ""}`
                        : null;

                      // Mutual Reception: does the dispositor's sign loop back to the chart ruler?
                      const SIGN_RULERS: Record<string, string> = {
                        Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
                        Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars",
                        Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter",
                      };
                      const mutualReception = !!dispo && SIGN_RULERS[dispo.sign] === cr.rulerName;

                      // Out-of-sign opposition by absolute degree between ruler and dispositor
                      const SIGN_INDEX: Record<string, number> = {
                        Aries: 0, Taurus: 1, Gemini: 2, Cancer: 3, Leo: 4, Virgo: 5,
                        Libra: 6, Scorpio: 7, Sagittarius: 8, Capricorn: 9, Aquarius: 10, Pisces: 11,
                      };
                      let pairOrb: number | null = null;
                      if (dispo && typeof venus.degree === "number" && typeof dispo.degree === "number" && SIGN_INDEX[cr.rulerSign] != null && SIGN_INDEX[dispo.sign] != null) {
                        const a = SIGN_INDEX[cr.rulerSign] * 30 + venus.degree;
                        const b = SIGN_INDEX[dispo.sign] * 30 + dispo.degree;
                        let d = Math.abs(a - b) % 360;
                        if (d > 180) d = 360 - d;
                        pairOrb = Math.abs(d - 180);
                      }
                      const isDegreeOpposition = pairOrb !== null && pairOrb <= 5;

                      // ── Voltage labels for extreme degrees ──
                      const rulerIsExplorer = zeroDeg && cr.rulerSign === "Sagittarius"; // 0° Sag Venus = The Explorer
                      const rulerIsAnyZero = zeroDeg; // any 0° ruler = raw, uncompromising opening
                      const dispoIsAnaretic = !!dispo && typeof dispo.degree === "number" && dispo.degree >= 29;
                      const dispoIsCFO = dispoIsAnaretic && dispo!.sign === "Taurus" && dispo!.name === "Jupiter"; // 29° Taurus Jupiter = Expert CFO
                      const explorerLabel = rulerIsExplorer ? "the Explorer" : (rulerIsAnyZero ? `the raw ${cr.rulerSign} opener` : `the ${cr.rulerSign} operator`);
                      const cfoLabel = dispoIsCFO ? "the Expert CFO" : (dispoIsAnaretic ? `the ${dispo!.sign} master at the closing degree` : (dispo ? `the ${dispo!.sign} anchor` : ""));
                      const hasVoltage = rulerIsAnyZero || dispoIsAnaretic;

                      // ── Retrograde physics ──
                      const dispoRx = !!dispo?.retrograde;
                      const chironRx = !!chiron?.retrograde;
                      const sunIsAnaretic = !!sun && typeof (sun as any).degree === "number" && (sun as any).degree >= 28;
                      const chironIsAnaretic = !!chiron && typeof (chiron as any).degree === "number" && (chiron as any).degree >= 29;
                      const hasRetroLayer = dispoRx || chironRx;

                      const inChironReturnSec1 = inChironReturn;
                      movements.push({
                        key: "chain-of-command",
                        roman: "I",
                        title: mutualReception ? "The Chain of Command, A Closed Loop" : "The Chain of Command",
                        tag: mutualReception ? "Mutual Reception · Closed Loop" : "Rising · Ruler · Dispositor",
                        tone: "emerald",
                        icon: <Shield className="h-4 w-4" />,
                        body: (
                          <>
                            <Row label="The Math">
                              <M>{ascStr}</M> is ruled by <M>{rulerStr}</M>{dispoStr ? <>, which is hosted by <M>{dispoStr}</M></> : null}{mutualReception ? <>, and {dispo!.name} in {dispo!.sign} points right back to <M>{cr.rulerName}</M>. The chain closes on itself.</> : "."}
                            </Row>
                            {hasVoltage ? (
                              <Row label="The Anchor, The Extreme Degrees">
                                {rulerIsAnyZero ? <>The Chart Ruler sits at <M>0° {cr.rulerSign}</M>, the <strong>Aries Point</strong> of the sign. This is not a tourist version of {cr.rulerSign}. It is <strong>{explorerLabel}</strong>, raw, uncompromising, zero filter, an <strong>absolute, non-negotiable need</strong> for {cr.rulerSign === "Sagittarius" ? "freedom and open horizon" : "what this sign demands"}. </> : null}
                                {dispoIsAnaretic ? <>The Dispositor sits at <M>{fmtDeg(dispo!.degree)} {dispo!.sign}</M>, the <strong>anaretic</strong> closing degree. This is not background comfort and it is not "staying put." It is <strong>{cfoLabel}</strong>, high-pressure, seasoned, urgent, a felt mandate to build <strong>Leveraged Expertise</strong>, the kind of high-stakes resource and knowledge mastery {dispo!.house === 8 ? <>that belongs to the <strong>8th House</strong>, shared money, other people's capital, deep specialist knowledge</> : dispo!.house ? <>worked out inside the <strong>{ord(dispo!.house)} House</strong></> : <>worked out inside the dispositor's house</>}.</> : null}
                              </Row>
                            ) : null}
                            <Row label="The Physics">
                              The Rising sign is the <strong>front door</strong>, the Chart Ruler is the <strong>operator</strong> behind it, and the Dispositor is normally the <strong>final anchor</strong> the whole system reports to. {N}'s door is <M>{ascStr}</M>, so the surface looks like standard Libra: read the room, smooth the edges, keep things pleasant. The operator is <M>{rulerStr}</M>{rulerIsAnyZero ? <>, running at the rawest amplitude {cr.rulerSign} can produce</> : null}, and {cr.rulerSign === "Sagittarius" ? "Sagittarius has one non-negotiable requirement: freedom to move" : `${cr.rulerSign} has its own non-negotiable requirement`}. {dispoStr ? <>That operator reports up to <M>{dispoStr}</M>, which {dispo!.sign === "Taurus" ? "is built to convert lived experience into durable expertise and real-world resource, the kind that compounds and can be drawn on later" : `is built to convert experience into resource`}. </> : null}{mutualReception ? <>But here the chain does something unusual. {dispo!.name} in {dispo!.sign} is itself ruled by {cr.rulerName}, so it hands authority right back to where it came from. There is no final boss. The two planets host each other inside a <strong>Mutual Reception</strong>, a closed loop where <M>{cr.rulerName}</M> and <M>{dispo!.name}</M> are co-signing every decision. </> : null}
                            </Row>
                            {mutualReception ? (
                              <Row label="The Internal Partnership">
                                {N} does not experience herself as having a single inner boss. She runs a constant partnership between a <strong>High-Energy Launch</strong> ({rulerIsAnyZero ? "0° " : ""}{cr.rulerName} in {cr.rulerSign}) and a <strong>Strategic Financier</strong> ({dispoIsAnaretic ? `${fmtDeg(dispo!.degree)} ` : ""}{dispo!.name} in {dispo!.sign}). The {dispoIsCFO ? "CFO" : dispo!.name} side is <em>not</em> a brake meant to stop the {rulerIsExplorer ? "Explorer" : cr.rulerName}. It is the <strong>Financier</strong> that funds the launch. She is a <strong>Grounded {rulerIsExplorer ? "Explorer" : cr.rulerSign}</strong> who builds massive internal value on the {dispo!.sign} side <em>specifically so she can remain un-tethered on the {cr.rulerSign} side</em>. Every dollar of expertise, body knowledge, and resource gets stacked for one reason: to buy <strong>Strategic Autonomy</strong>, the right to move without ever having to ask permission or money again.
                              </Row>
                            ) : null}
                            {hasRetroLayer ? (
                              <Row label="The Retrograde Layer, Internalized Mandate">
                                {dispoRx ? <>The {dispoIsCFO ? "CFO" : dispo!.name} is <strong>Retrograde</strong>. That means the foundation is <strong>Internalized</strong>. {N} does not trust outside experts or borrowed templates to tell her what her resource is worth. The {dispoIsCFO ? "Expert CFO" : dispo!.sign + " anchor"} is <strong>self-taught and self-audited</strong>, the sole architect of her own security. The world did not hand her the manual, so she wrote it from the inside. </> : null}
                                {chironRx ? <>Chiron is <strong>Retrograde</strong> too. The "sting" is not actually coming from the room. It is a <strong>re-run of an internal tape</strong>, a self-generated security check. The Permission Audit is an <strong>internal loop</strong>; {N} is her own harshest auditor, and the permission she keeps scanning for is permission from herself. </> : null}
                                {dispoRx && chironRx ? <>Put together, this is a <strong>Self-Sourcing Power Plant</strong>. The Explorer breaks free using a <strong>Private Bank</strong> that no one else can sign off on, audited by an <strong>Internal Auditor</strong> who answers only to her. Nothing in this loop needs outside approval to operate. </> : null}
                              </Row>
                            ) : null}
                            {(sunIsAnaretic || chironIsAnaretic || dispoIsAnaretic) ? (
                              <Row label="The Anaretic Stack, Deadline Mechanic">
                                {N} carries multiple bodies parked at the <strong>Maximum Pressure Threshold</strong>{(() => {
                                  const parts: string[] = [];
                                  if (sunIsAnaretic) parts.push(`Sun at ${fmtDeg((sun as any).degree)} ${sun.sign}`);
                                  if (dispoIsAnaretic) parts.push(`${dispo!.name} at ${fmtDeg(dispo!.degree)} ${dispo!.sign}${dispoRx ? " Rx" : ""}`);
                                  if (chironIsAnaretic) parts.push(`Chiron at ${fmtDeg((chiron as any).degree)} ${chiron.sign}${chironRx ? " Rx" : ""}`);
                                  return parts.length ? <> ({parts.join(", ")})</> : null;
                                })()}. This is not a personality trait. It is a <strong>Deadline Mechanic</strong>, a felt mandate to ship the definitive version of each lesson before the sign closes. Every movement above carries that "now-or-never" voltage.
                              </Row>
                            ) : null}
                            {isDegreeOpposition ? (
                              <Row label="The Opposition Layer">
                                On top of the loop, the two co-rulers are sitting across from each other by degree, <M>{cr.rulerName} at {fmtDeg(venus.degree)} {cr.rulerSign}</M> and <M>{dispo!.name} at {fmtDeg(dispo!.degree)} {dispo!.sign}</M> form a tight <M>{pairOrb!.toFixed(1)}° opposition</M> across the wheel. That is the <strong>Launch desk</strong> (Freedom) and the <strong>Financier desk</strong> (Leveraged Expertise) firing at the same time, in direct dialogue across the chart. It is not indecision. It is two real needs paired in tension so each one stays honest, the launch never gets reckless because the financier is watching, and the financier never hoards because the launch is pulling.
                              </Row>
                            ) : null}
                            <Row label="The Truth">
                              Her Libra Rising is not "wants to be liked." It is the <strong>Tactical Tool</strong> the loop uses to keep both desks operating. {mutualReception ? <>The diplomacy buys the {rulerIsExplorer ? "Explorer" : cr.rulerName} side the freedom to move, and the same diplomacy buys the {dispoIsCFO ? "Financier" : dispo!.name} side the deal flow and shared capital it needs to keep building leverage. Both desks need the room calm to keep operating. </> : null}{inChironReturnSec1 ? <>At <M>age {age}</M>, inside the Chiron Return window, the developmental work is learning that <strong>she does not have to choose</strong>. The loop is not a glitch to fix. She can stop running the Permission Audit and start <strong>owning the {rulerIsExplorer && dispoIsCFO ? "Explorer/Financier" : "co-ruler"} loop</strong> as her actual operating system: mastery stacked to fund freedom, freedom that justifies the mastery. </> : null}
                            </Row>

                          </>
                        ),
                      });

                      // ── IV. The Voltage Scale (clickable key) ──
                      if (hasVoltage || mutualReception) {
                        movements.push({
                          key: "voltage-scale",
                          roman: "II",
                          title: "The Voltage Scale, A Clickable Key",
                          tag: "Math Reference",
                          tone: "indigo",
                          icon: <BookOpen className="h-4 w-4" />,
                          body: (
                            <>
                              <Row label="Why This Reading Hits Harder">
                                Most charts run at <strong>middle voltage</strong>, settled degrees, linear chains, predictable outputs. {N}'s wiring sits at the <strong>extreme ends</strong> of the scale, which is why the intensity she feels is not a personality quirk, it is a measurable difference in the math. Use this key to see exactly where her voltage diverges from a standard build.
                              </Row>
                              <div className="mt-4 overflow-x-auto">
                                <table className="w-full text-[13px] border-collapse">
                                  <thead>
                                    <tr className="border-b border-emerald-500/40">
                                      <th className="text-left font-semibold py-2 pr-3 align-top w-[22%]">Placement</th>
                                      <th className="text-left font-semibold py-2 pr-3 align-top w-[39%]">{N}'s Voltage</th>
                                      <th className="text-left font-semibold py-2 align-top w-[39%]">The Standard (Middle Degree)</th>
                                    </tr>
                                  </thead>
                                  <tbody className="align-top">
                                    {rulerIsAnyZero ? (
                                      <tr className="border-b border-emerald-500/20">
                                        <td className="py-3 pr-3">
                                          <strong>0° (Aries Point)</strong>
                                          <details className="mt-1">
                                            <summary className="cursor-pointer text-[11px] uppercase tracking-wider opacity-70 hover:opacity-100 select-none">What 0° means →</summary>
                                            <div className="mt-2 text-[12px] opacity-90 leading-relaxed font-normal">
                                              0° is the very first degree of a sign, called the <strong>Aries Point</strong> because it acts like a fresh ignition no matter which sign it lands in. There is no prior experience in the sign yet, no polish, no caution, no learned filter. The placement fires at full strength the moment it is touched. {N} feels it as raw, loud, uncompromising, almost public, like the need announces itself before she can edit it. It is the loudest voltage on the scale.
                                            </div>
                                          </details>
                                        </td>
                                        <td className="py-3 pr-3"><strong>{rulerIsExplorer ? "The Explorer" : "The Raw Opener"}</strong>, raw, loudest, uncompromising intensity. No filter between need and action.</td>
                                        <td className="py-3"><strong>The Tourist</strong>, 10°–20°. Settled, predictable, moderate. Knows the sign's rules and stays inside them.</td>
                                      </tr>
                                    ) : null}
                                    {dispoIsAnaretic ? (
                                      <tr className="border-b border-emerald-500/20">
                                        <td className="py-3 pr-3">
                                          <strong>29° (Anaretic)</strong>
                                          <details className="mt-1">
                                            <summary className="cursor-pointer text-[11px] uppercase tracking-wider opacity-70 hover:opacity-100 select-none">What 29° means →</summary>
                                            <div className="mt-2 text-[12px] opacity-90 leading-relaxed font-normal">
                                              29° is the very last degree of a sign, called <strong>anaretic</strong> or the "degree of fate." The placement has lived the entire sign already and is one breath from changing signs forever. That creates a now-or-never pressure, like a senior expert on their last day, trying to ship the final, definitive version of the lesson. It feels urgent, high-stakes, slightly impatient, and carries a felt responsibility to get this sign <em>right</em> before time runs out.
                                            </div>
                                          </details>
                                        </td>
                                        <td className="py-3 pr-3"><strong>{dispoIsCFO ? "The Expert CFO" : "The Closing-Degree Master"}</strong>, urgent, high-stakes, "now-or-never" mastery. Carries the full weight of the sign's lesson.</td>
                                        <td className="py-3"><strong>The Manager</strong>, 10°–20°. Routine, calm, ongoing work. No deadline pressure inside the placement.</td>
                                      </tr>
                                    ) : null}
                                    {mutualReception ? (
                                      <tr>
                                        <td className="py-3 pr-3">
                                          <strong>Mutual Reception</strong>
                                          <details className="mt-1">
                                            <summary className="cursor-pointer text-[11px] uppercase tracking-wider opacity-70 hover:opacity-100 select-none">Closed Loop vs Linear Chain →</summary>
                                            <div className="mt-2 text-[12px] opacity-90 leading-relaxed font-normal space-y-2">
                                              <p>Every planet has a "boss," the ruler of the sign it sits in. Normally that boss has its own boss, who has its own boss, until the chain ends at one final anchor planet somewhere else in the chart. That is a <strong>Linear Chain</strong>. It looks outward. Decisions wait on permission from a single final authority.</p>
                                              <p>A <strong>Closed Loop</strong> (mutual reception) is different. Two planets sit in each other's signs, so each one is the other's boss. {N}'s Venus sits in Jupiter's sign (Sagittarius), and Jupiter sits in Venus's sign (Taurus). They co-sign every decision in real time, with no outside referee. Nothing leaves the loop until both desks agree. That is why the inner negotiation feels constant and self-contained, freedom and security checking each other on every move, instead of one planet quietly running the show.</p>
                                            </div>
                                          </details>
                                        </td>
                                        <td className="py-3 pr-3"><strong>Closed Loop</strong>, self-sustaining, high-speed internal feedback. The two co-rulers co-sign every decision in real time.</td>
                                        <td className="py-3"><strong>Linear Chain</strong>, follows a boss. Looks outward for permission, waits on a final anchor that lives somewhere else in the chart.</td>
                                      </tr>
                                    ) : null}
                                  </tbody>
                                </table>
                              </div>

                              <details className="mt-5 group rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-3">
                                <summary className="cursor-pointer text-sm font-semibold select-none flex items-center justify-between gap-3">
                                  <span>The Full Zodiac Voltage Map</span>
                                  <span className="text-[11px] uppercase tracking-wider opacity-70 group-open:hidden">Tap to open</span>
                                  <span className="text-[11px] uppercase tracking-wider opacity-70 hidden group-open:inline">Tap to close</span>
                                </summary>
                                <div className="mt-3 text-[13px] opacity-90">
                                  Every sign has the same two extreme settings. Here is where {N}'s <strong>Explorer</strong> (0° Sagittarius) and <strong>CFO</strong> (29° Taurus) sit inside the larger system, and what the other ten signs sound like at the same extremes.
                                </div>
                                <div className="mt-3 overflow-x-auto">
                                  <table className="w-full text-[12.5px] border-collapse">
                                    <thead>
                                      <tr className="border-b border-indigo-500/40">
                                        <th className="text-left font-semibold py-2 pr-3 align-top w-[14%]">Sign</th>
                                        <th className="text-left font-semibold py-2 pr-3 align-top w-[43%]">0° Archetype (The Raw Opener)</th>
                                        <th className="text-left font-semibold py-2 align-top w-[43%]">29° Archetype (The Anaretic Master)</th>
                                      </tr>
                                    </thead>
                                    <tbody className="align-top">
                                      {([
                                        ["Aries",       "The Spark, raw ignition, pure initiative with no filter.",                          "The Veteran Fighter, urgent self-assertion, last-call courage."],
                                        ["Taurus",      "The Settler, first claim on the land, body before logic.",                          "The Expert CFO, urgent mastery of resource, body, and value."],
                                        ["Gemini",      "The First Question, raw curiosity, unfiltered talk.",                               "The Closing Reporter, urgent translator, must get the story out now."],
                                        ["Cancer",      "The First Cry, raw need for belonging, no defense yet.",                            "The Veteran Caretaker, urgent feeding of the home, last-call nurture."],
                                        ["Leo",         "The First Roar, raw self-expression, no audience check.",                           "The Closing Performer, urgent visibility, last-call self-claim."],
                                        ["Virgo",       "The First Sort, raw analysis, no polish yet.",                                      "The Expert Editor, urgent refinement, last-call precision."],
                                        ["Libra",       "The First Mirror, raw need for the other, no diplomacy yet.",                      "The Closing Diplomat, urgent fairness, last-call balance."],
                                        ["Scorpio",     "The First Plunge, raw merge, no exit strategy.",                                    "The Veteran Investigator, urgent truth, last-call power audit."],
                                        ["Sagittarius", "The Explorer, raw freedom, uncompromising open horizon.",                           "The Closing Prophet, urgent meaning, last-call belief."],
                                        ["Capricorn",   "The First Climb, raw ambition, structure with no résumé yet.",                     "The Veteran Executive, urgent authority, last-call legacy build."],
                                        ["Aquarius",    "The First Outsider, raw difference, no group to test it against.",                 "The Closing Architect, urgent system design, last-call reform."],
                                        ["Pisces",      "The First Dissolve, raw empathy, no boundary yet.",                                 "The Closing Mystic, urgent surrender, last-call compassion."],
                                      ] as Array<[string, string, string]>).map(([sign, zero, ana]) => {
                                        const isRuler = rulerIsAnyZero && cr.rulerSign === sign;
                                        const isDispo = dispoIsAnaretic && dispo!.sign === sign;
                                        const highlight = isRuler || isDispo;
                                        return (
                                          <tr key={sign} className={cn("border-b border-indigo-500/15", highlight && "bg-indigo-500/10")}>
                                            <td className="py-2.5 pr-3">
                                              <strong>{sign}</strong>
                                              {isRuler ? <div className="text-[10px] uppercase tracking-wider opacity-70 mt-0.5">{N}'s 0° Ruler</div> : null}
                                              {isDispo ? <div className="text-[10px] uppercase tracking-wider opacity-70 mt-0.5">{N}'s 29° Dispositor</div> : null}
                                            </td>
                                            <td className={cn("py-2.5 pr-3", isRuler && "font-semibold")}>{zero}</td>
                                            <td className={cn("py-2.5", isDispo && "font-semibold")}>{ana}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                  <div className="mt-2 text-[11px] opacity-70">Middle degrees (10°–20°) of any sign run as <strong>The Manager</strong> or <strong>The Tourist</strong>, routine voltage, no opening rawness and no closing urgency.</div>
                                </div>
                              </details>

                              {inChironReturnSec1 ? (
                                <Row label="The Chiron Return Frame">
                                  At <M>age {age}</M>, the work is not lowering the voltage. The work is <strong>stopping the audit</strong> that has been treating the voltage as a defect for forty-nine years, and <strong>owning the {rulerIsExplorer && dispoIsCFO ? "Explorer/CFO" : "extreme-degree"} loop</strong> as the actual instrument.
                                </Row>
                              ) : null}
                            </>
                          ),
                        });
                      }
                    }



                    // ── II. The Identity Glitch ───────────────────────────────────────
                    // GATE: Sun-Chiron must exist AND orb < 3° to trigger Collision/Sting/Permission Audit.
                    // Math triggers the label. The blueprint is now law: any chart with this signature fires this section.
                    const stingOrbCap = 3;
                    if (sun && chiron && sunChiron && sunChiron.orb < stingOrbCap) {
                      const orbStr = `${sunChiron.orb.toFixed(1)}°`;
                      const tight = sunChiron.orb <= 1.5;
                      const aspectName = sunChiron.aspect || "opposition";
                      const sunStr = `${sun.sign} Sun${sun.house ? ` (${ord(sun.house)} House)` : ""}`;
                      const chiStr = `Chiron in ${chiron.sign}${chiron.house ? ` (${ord(chiron.house)} House)` : ""}`;
                      movements.push({
                        key: "identity-glitch",
                        roman: "III",
                        title: "The Identity Glitch",
                        tag: `Sun · Chiron Collision · ${orbStr}`,
                        tone: "amber",
                        icon: <Eye className="h-4 w-4" />,
                        body: (
                          <>
                            <Row label="The Math"><M>{sunStr}</M> {aspectName} <M>{chiStr}</M> at a <M>{tight ? "razor-tight " : "tight "}{orbStr} orb</M> (under the {stingOrbCap}° Sting threshold)</Row>
                            <Row label="The Physics">
                              This is a <strong>literal internal collision</strong> between the <em>Need to Be</em> (Sun) and the <em>Fear of Reaction</em> (Chiron). The two ends are wired directly across from each other, every time one fires, the other fires back. At <M>{orbStr}</M> there is no buffer between them.
                            </Row>
                            <Row label="The Truth">
                              Call this the <strong>Permission Audit</strong>. Because the orb is under {stingOrbCap}°, {N} feels a physical <em>sting</em> in identity the moment {N} takes up space without first checking that it is "legal." This is not scanning faces for approval. This is fighting an <strong>internal glitch</strong> that says being oneself is a violation. The audit runs behind the eyes every day, and it costs energy whether anyone in the room is reacting or not.
                            </Row>
                          </>
                        ),
                      });
                    }

                    // ── III. The Signal Failure ───────────────────────────────────────
                    // GATE: Mercury OR Moon in House 12 fires this section. Mars context is optional.
                    // The math is universal: house === 12 for a translator body triggers Buffered Translator / Technical Lag.
                    if (hasMoon12 || hasMerc12) {
                      const marsStr = drive ? `${drive.marsSign} Mars (${ord(drive.marsHouse)} House)` : null;
                      const isScorpio = drive?.marsSign === "Scorpio";
                      const translators: string[] = [];
                      if (hasMoon12) translators.push("Moon");
                      if (hasMerc12) translators.push(`${cog?.mercurySign ? cog.mercurySign + " " : ""}Mercury`);
                      const translatorStr = `${translators.join(" / ")} in the 12th House`;
                      movements.push({
                        key: "signal-failure",
                        roman: "IV",
                        title: "The Signal Failure",
                        tag: "12th House · Buffered Translator",
                        tone: "rose",
                        icon: <Mountain className="h-4 w-4" />,
                        body: (
                          <>
                            <Row label="The Math">{marsStr ? <><M>{marsStr}</M> vs. <M>{translatorStr}</M></> : <><M>{translatorStr}</M></>}</Row>
                            <Row label="The Physics">
                              {marsStr ? <>Direct conflict between a <strong>High-Heat Engine</strong> and a <strong>Buffered Translator</strong>. {isScorpio ? <>A <M>Scorpio Mars</M> does not idle, it runs at full combustion. </> : null}But the part of {N} that converts that heat into <em>words</em> sits inside the <strong>Dark Room</strong> of the 12th House, which routes every signal through a sound-dampening layer before language can form.</> : <>The translator that converts inner signal into <em>words</em> sits inside the <strong>Dark Room</strong> of the 12th House, which routes every signal through a sound-dampening layer before language can form. Whatever pressure builds inside has to pass through that buffer before it can leave the mouth.</>}
                            </Row>
                            <Row label="The Truth">
                              Call this the <strong>Technical Lag</strong>. {N} feels intensity at <strong>100mph</strong>, but the signal cannot travel from the engine to the mouth fast enough. {N} is not <em>choosing</em> to be silent. The wiring physically delays the output. The silence is a byproduct of internal architecture, not a social move. Push {N} before the signal completes and what comes out is jagged, not because {N} meant it, but because you forced an incomplete transmission.
                            </Row>
                          </>
                        ),
                      });
                    }

                    // ── IV. The Developmental Threshold ───────────────────────────────
                    if (inChironReturn) {
                      movements.push({
                        key: "developmental-threshold",
                        roman: "V",
                        title: "The Developmental Anchor, Chiron Return",
                        tag: `Chiron Return · Age ${age}`,
                        tone: "indigo",
                        icon: <BookOpen className="h-4 w-4" />,
                        body: (
                          <>
                            <Row label="The Math"><M>Transit Chiron conjunct Natal Chiron</M> · window <M>ages 48–51</M></Row>
                            <Row label="The Physics">
                              Once every ~50 years, Chiron returns to its natal degree. The sore spot stops being a wound the system tries to patch and becomes a piece of <strong>mastered hardware</strong>. The <strong>Expert CFO</strong> at 29° Taurus has already done the slow accumulation work, and the Chiron Return is the moment that <strong>lived evidence</strong> gets cashed in, the foundation is real, the resource is real, the body knowledge is real.
                            </Row>
                            {chiron?.retrograde ? (
                              <Row label="The Retrograde Turns Direct">
                                Natal Chiron is <strong>Retrograde</strong>, which means the Permission Audit has been running <em>inward</em> for almost five decades, {N} auditing herself with no outside referee. The Chiron Return is the moment the audit <strong>turns Direct in her mind</strong>. The internal loop opens. The verdict she has been waiting on, from herself, finally clears.
                              </Row>
                            ) : null}
                            <Row label="The Truth">
                              This is the moment {N} stops trying to <em>fix</em> the glitches above, the Permission Audit, the Technical Lag, and starts <strong>owning the power of her intensity</strong>. The Audit can finally retire because the <strong>CFO and the Explorer have agreed on the budget for her life</strong>. The Taurus side has receipts. The Sagittarius side has open road. She is not auditioning for permission to be the Grounded Explorer anymore. The wiring is the same. The operator is finally at the controls.
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
                        {movements.sort((a, b) => {
                          const r = (s: string) => ({ I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6 } as Record<string, number>)[s] ?? 99;
                          return r(a.roman) - r(b.roman);
                        }).map((m) => {
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

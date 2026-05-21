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

                  {/* === Behavioral Portrait, Synthesis of Friction ================
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
                      const dispoIsCFO = dispoIsAnaretic && dispo!.sign === "Taurus" && dispo!.name === "Jupiter"; // 29° Taurus Jupiter = Safety Builder
                      const explorerLabel = rulerIsExplorer ? "the Explorer" : (rulerIsAnyZero ? `the raw ${cr.rulerSign} opener` : `the ${cr.rulerSign} operator`);
                      const cfoLabel = dispoIsCFO ? "the urgent Taurus safety-builder" : (dispoIsAnaretic ? `the ${dispo!.sign} part at the closing degree` : (dispo ? `the ${dispo!.sign} anchor` : ""));
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
                            <Row label="The Math, In Plain English">
                              The chain of command has three links. Link 1 is the <strong>Rising sign</strong> (the front door): <M>{ascStr}</M>. Link 2 is the <strong>Chart Ruler</strong>, which is the planet that rules the Rising sign and runs the show behind the door: <M>{rulerStr}</M>. Link 3 is the <strong>Dispositor</strong>, which is the planet that rules <em>the sign the Chart Ruler is sitting in</em>. {dispoStr ? <>{cr.rulerName} is in <strong>{cr.rulerSign}</strong>, and {cr.rulerSign} is ruled by <strong>{dispo!.name}</strong>, so {dispo!.name} is the Dispositor: <M>{dispoStr}</M>.</> : <>The Chart Ruler hosts itself in its own sign, so there is no separate Dispositor.</>} {mutualReception ? <>And here is the twist: {dispo!.name} is sitting in <strong>{dispo!.sign}</strong>, which is ruled by <strong>{cr.rulerName}</strong>. So the chain bends back on itself. The two planets host each other. That is called a <strong>Mutual Reception</strong>. <strong>This is not indecision.</strong> It means {N} has two real needs tied together. The {cr.rulerSign} side says, "I need room to move, choose, and leave if I have to." The {dispo!.sign} side says, "I need my body, money, time, and peace to feel safe." A real yes has to respect both. A vacation can be a yes if it feels free and does not leave her stressed after. A job can be a yes if it gives her growth and does not trap her. A purchase can be a yes if it feels good now and still feels responsible later. When one side feels excited but the other side feels tight, her body may say no fast. That is not overthinking. It is her system noticing that one real need is being ignored.</> : null}
                            </Row>
                            {hasVoltage ? (
                              <Row label="Why The Degrees Change The Reading">
                                {rulerIsAnyZero ? <>The Chart Ruler sits at <M>0° {cr.rulerSign}</M>, the very first degree of the sign. That spot is called the <strong>Aries Point</strong>. A normal {cr.rulerSign} placement reads as {cr.rulerSign === "Sagittarius" ? <>experienced and philosophical, the person who has travelled and formed opinions</> : <>a settled, learned version of {cr.rulerSign}</>}. At 0°, none of that experience has been earned yet, so the need shows up raw and loud, with no filter and no compromise. For {N} that means a strong, public need for {cr.rulerSign === "Sagittarius" ? "freedom, honesty, and an open horizon" : "what this sign wants"}. </> : null}
                                {dispoIsAnaretic ? <>The Dispositor sits at <M>{fmtDeg(dispo!.degree)} {dispo!.sign}</M>, the very last degree of the sign. That spot is called the <strong>anaretic degree</strong>, sometimes "the degree of fate." A normal {dispo!.name} in {dispo!.sign} would read as {dispo!.sign === "Taurus" ? <>quiet comfort: stay put, build slow security, eat well, do not move</> : <>a relaxed mid-sign version of {dispo!.sign}</>}. <strong>That reading does not apply here.</strong> At 29°, {dispo!.name} has already lived the whole sign and is one breath from leaving it. The placement behaves like someone on their last day in a job they have mastered, urgently trying to put the lessons of {dispo!.sign === "Taurus" ? <>Taurus, money, the body, food, comfort, and lasting value</> : dispo!.sign} into something real before time runs out. So {dispo!.name} here is not the calm Taurus couch. It is urgent, focused, and unwilling to let the lesson go to waste. It wants {N} to build <strong>real skill and real safety</strong> ({dispo!.house === 8 ? <>through the <strong>8th House</strong>: shared money, trust, debt, secrets, and deep specialist knowledge</> : dispo!.house ? <>through the <strong>{ord(dispo!.house)} House</strong></> : <>through the dispositor's house</>}).</> : null}
                              </Row>
                            ) : null}
                            <Row label="How These Three Links Actually Work">
                              The Rising sign is the part of {N} other people meet first. The Chart Ruler is the planet that quietly drives what that Rising sign is really after. The Dispositor is the planet the Chart Ruler answers to. {N}'s Rising is <M>{ascStr}</M>, so on the surface she reads as classic Libra: she scans the room, smooths the edges, and keeps things pleasant. Underneath, the Chart Ruler is <M>{rulerStr}</M>{rulerIsAnyZero ? <>, at the loudest possible degree of {cr.rulerSign}</> : null}, and {cr.rulerSign === "Sagittarius" ? "Sagittarius needs space, honesty, movement, and a way out" : `${cr.rulerSign} has its own strong need`}. {dispoStr ? <>That ruler then answers to <M>{dispoStr}</M>, which {dispo!.sign === "Taurus" ? "asks simple body questions: Will this leave me steady? Will I still have enough money, time, calm, and control over my own life?" : "asks what would make the choice feel solid"}. </> : null}{mutualReception ? <>Normally the chain ends there. Here it does not. {dispo!.name} in {dispo!.sign} is itself ruled by {cr.rulerName}, so the decision gets handed straight back. No other planet has the final word. <M>{cr.rulerName}</M> and <M>{dispo!.name}</M> keep checking with each other, which is why both needs have to be honored before a real yes can land. </> : null}
                            </Row>
                            {mutualReception ? (
                              <Row label="The Two Sides Of Her">
                                {N} does not feel like she has one simple inner voice. She has one side that wants movement, truth, and freedom ({rulerIsAnyZero ? "0° " : ""}{cr.rulerName} in {cr.rulerSign}) and another side that needs steadiness, proof, and real safety ({dispoIsAnaretic ? `${fmtDeg(dispo!.degree)} ` : ""}{dispo!.name} in {dispo!.sign}). The {dispo!.name} side is not trying to shut the {rulerIsExplorer ? "free" : cr.rulerName} side down. It is asking, "Will I still feel okay after this?" When both sides agree, she moves fast. When freedom would cost her peace, or safety would make her feel trapped, she slows down.
                              </Row>
                            ) : null}
                            {hasRetroLayer ? (
                              <Row label="The Retrograde Layer">
                                {dispoRx ? <>The {dispo!.name} side is <strong>Retrograde</strong>, which means the safety check happens on the inside first. {N} does not really trust outside experts or borrowed advice to tell her what her time, skill, body, and money are worth. She figured out her own version of what safe looks like, and she trusts that version more than anyone else's. </> : null}
                                {chironRx ? <>Chiron is <strong>Retrograde</strong> too. The hurt of feeling like she has to prove she is allowed to take up space is not coming from the room. It is coming from her own head. The voice asking "is this okay, am I allowed?" is her own voice, and the permission she keeps waiting on is permission from herself. </> : null}
                                {dispoRx && chironRx ? <>Put together: the answer has to feel true inside her before she can act on it. The free side will not move if the safe side feels ignored. The safe side will not relax if the free side feels trapped. Nothing in this is waiting on outside approval. </> : null}
                              </Row>
                            ) : null}
                            {(sunIsAnaretic || chironIsAnaretic || dispoIsAnaretic) ? (
                              <Row label="The Anaretic Stack">
                                {N} has more than one planet sitting at the very last degree of a sign{(() => {
                                  const parts: string[] = [];
                                  if (sunIsAnaretic) parts.push(`Sun at ${fmtDeg((sun as any).degree)} ${sun.sign}`);
                                  if (dispoIsAnaretic) parts.push(`${dispo!.name} at ${fmtDeg(dispo!.degree)} ${dispo!.sign}${dispoRx ? " Rx" : ""}`);
                                  if (chironIsAnaretic) parts.push(`Chiron at ${fmtDeg((chiron as any).degree)} ${chiron.sign}${chironRx ? " Rx" : ""}`);
                                  return parts.length ? <> ({parts.join(", ")})</> : null;
                                })()}. The anaretic degree (29°) carries a "now or never" feeling because the planet is about to leave the sign for good. Having more than one body parked there is not a personality trait. It is a felt sense that the lesson of each sign is on a deadline. That urgency shows up underneath everything written above.
                              </Row>
                            ) : null}
                            {isDegreeOpposition ? (
                              <Row label="The Opposition Layer">
                                On top of the loop, the two co-rulers sit directly across the wheel from each other by degree: <M>{cr.rulerName} at {fmtDeg(venus.degree)} {cr.rulerSign}</M> and <M>{dispo!.name} at {fmtDeg(dispo!.degree)} {dispo!.sign}</M> form a tight <M>{pairOrb!.toFixed(1)}° opposition</M>. An opposition means both needs get loud at the same time. One side wants movement, honesty, risk, and space. The other side wants steadiness, comfort, money, and control over the pace. This is not indecision. It is her body checking whether a choice gives her freedom without making her feel unsafe, and safety without making her feel trapped.
                              </Row>
                            ) : null}
                            <Row label="The Bottom Line">
                              Her Libra Rising is not "wants to be liked." It is how she keeps the room calm enough to hear herself clearly. {mutualReception ? <>A calm room helps the {cr.rulerName} side say what it actually wants, and helps the {dispo!.name} side notice what would actually feel safe. When the room gets chaotic, she may lose track of her own answer and start managing everyone else instead. </> : null}{inChironReturnSec1 ? <>At <M>age {age}</M>, inside her Chiron Return window, the work is learning that <strong>she does not have to pick one side and abandon the other</strong>. She can say both out loud: "I need room to move" and "I need to feel steady after I move." </> : null}
                            </Row>

                          </>
                        ),
                      });

                      // ── IV. The Voltage Scale (clickable key) ──
                      if (hasVoltage || mutualReception) {
                        movements.push({
                          key: "voltage-scale",
                          roman: "II",
                          title: "Why The Extreme Degrees Read Differently",
                          tag: "Degree Reference",
                          tone: "indigo",
                          icon: <BookOpen className="h-4 w-4" />,
                          body: (
                            <>
                              <Row label="Why This Reading Hits Harder">
                                Most planets sit in the middle of a sign (around 10°–20°), where the placement reads as steady and predictable. {N}'s key planets sit at the <strong>very first</strong> and <strong>very last</strong> degree of their signs. Those two spots have specific names in astrology and they change the reading. The intensity she feels is not a personality quirk: it is what those degrees actually do.
                              </Row>
                              <div className="mt-4 overflow-x-auto">
                                <table className="w-full text-[13px] border-collapse">
                                  <thead>
                                    <tr className="border-b border-emerald-500/40">
                                      <th className="text-left font-semibold py-2 pr-3 align-top w-[22%]">Placement</th>
                                      <th className="text-left font-semibold py-2 pr-3 align-top w-[39%]">How It Reads For {N}</th>
                                      <th className="text-left font-semibold py-2 align-top w-[39%]">How A Middle Degree Reads</th>
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
                                        <td className="py-3 pr-3"><strong>{dispoIsCFO ? "The Safety Builder" : "The Closing-Degree Master"}</strong>, urgent, high-stakes, "now-or-never" mastery. Carries the full weight of the sign's lesson.</td>
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
                                              <p>Every planet answers to the ruler of the sign it sits in. Normally that ruler answers to another ruler, and the chain eventually ends somewhere else in the chart. That is a <strong>Linear Chain</strong>. It can look outward for one final answer.</p>
                                              <p>A <strong>Closed Loop</strong> (mutual reception) is different. Two planets sit in each other's signs, so each one answers back to the other. {N}'s Venus sits in Jupiter's sign (Sagittarius), and Jupiter sits in Venus's sign (Taurus). That means the freedom need and the safety need keep checking each other. She is not being flaky. She is trying to choose something that lets her breathe and still feel okay after.</p>
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
                                  Every sign has the same two extreme settings. Here is where {N}'s <strong>Explorer</strong> (0° Sagittarius) and <strong>Safety Builder</strong> (29° Taurus) sit inside the larger system, and what the other ten signs sound like at the same extremes.
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
                                        ["Taurus",      "The Settler, first claim on the land, body before logic.",                          "The Safety Builder, urgent focus on money, body, comfort, and value."],
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
                                  At <M>age {age}</M>, the work is not lowering the voltage. The work is <strong>stopping the audit</strong> that has been treating the voltage as a defect for forty-nine years, and <strong>owning the {rulerIsExplorer && dispoIsCFO ? "freedom and safety" : "extreme-degree"} loop</strong> as the actual instrument.
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
                              Once every ~50 years, Chiron returns to its natal degree. The sore spot stops being something the system keeps trying to patch. The <strong>Safety Builder</strong> at 29° Taurus has spent years learning what actually makes {N} feel steady, and the Chiron Return is the moment that lived proof starts to matter: the body knows, the money lessons are real, the boundaries are real, and the foundation is not pretend.
                            </Row>
                            {chiron?.retrograde ? (
                              <Row label="The Retrograde Turns Direct">
                                Natal Chiron is <strong>Retrograde</strong>, which means the Permission Audit has been running <em>inward</em> for almost five decades, {N} auditing herself with no outside referee. The Chiron Return is the moment the audit <strong>turns Direct in her mind</strong>. The internal loop opens. The verdict she has been waiting on, from herself, finally clears.
                              </Row>
                            ) : null}
                            <Row label="The Truth">
                              This is the moment {N} stops trying to <em>fix</em> the glitches above, the Permission Audit, the Technical Lag, and starts <strong>owning the power of her intensity</strong>. The Audit can finally relax because the Taurus side knows what keeps her steady, and the Sagittarius side knows what keeps her alive inside. She is not auditioning for permission to need both. The wiring is the same. She is finally allowed to trust it.
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
                      <span className="font-medium text-foreground">{portrait.mathCheck.thirdHouseRuler ?? ","}</span>
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

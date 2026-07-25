import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, Moon as MoonIcon, AlertTriangle, Heart } from "lucide-react";
import type { NatalChart } from "@/hooks/useNatalChart";
import { getPlanetaryPositions } from "@/lib/astrology";
import { calculateTransitAspects, type TransitAspect } from "@/lib/transitAspects";
import { formatMoonHouseSchedule } from "@/lib/moonHouseSchedule";
import { buildPersonalDailyGuidance } from "@/lib/personalDailyGuidance";

const PLANET_GLYPH: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
  Chiron: "⚷", Lilith: "⚸", NorthNode: "☊", Ascendant: "ASC", Midheaven: "MC",
};
const ASPECT_GLYPH: Record<string, string> = {
  conjunction: "☌", opposition: "☍", square: "□", trine: "△", sextile: "✶",
};

// Which combinations tend to correlate with anxiety / nervous-system pressure.
const NERVOUS_TRANSITS = new Set(["Saturn", "Neptune", "Pluto", "Mars", "Chiron"]);
const NERVOUS_NATAL = new Set(["Sun", "Moon", "Mercury", "Ascendant"]);
const HARD_ASPECTS = new Set(["conjunction", "square", "opposition"]);

const HOUSE_ARENA_SHORT: Record<number, string> = {
  1: "how they're showing up in their body",
  2: "what feels safe and steady",
  3: "the sentences running through their head",
  4: "home, family, and their emotional floor",
  5: "play, creativity, being seen",
  6: "routines, school, health, daily loops",
  7: "friends and one-on-ones",
  8: "what's underneath, what's unsaid",
  9: "the story they're telling themselves",
  10: "how they're being seen out in the world",
  11: "peers, community, the future",
  12: "quiet, rest, what's dissolving",
};

interface Props {
  charts: NatalChart[];
  defaultName?: string; // e.g. "Ben"
}

function parseOrb(a: TransitAspect): number {
  const n = parseFloat(a.orb);
  return Number.isFinite(n) ? n : 99;
}

function anxietyFlag(a: TransitAspect): boolean {
  if (parseOrb(a) > 3) return false;
  // Slow-planet hard hits to personal points
  if (
    NERVOUS_TRANSITS.has(a.transitPlanet) &&
    NERVOUS_NATAL.has(a.natalPlanet) &&
    HARD_ASPECTS.has(a.aspect)
  ) return true;
  // Moon square/opp natal Saturn/Neptune/Mercury today
  if (
    a.transitPlanet === "Moon" &&
    HARD_ASPECTS.has(a.aspect) &&
    ["Saturn", "Neptune", "Mercury"].includes(a.natalPlanet)
  ) return true;
  return false;
}

function whatHelpsLine(flags: TransitAspect[], firstName: string): string {
  if (!flags.length) {
    return `No hard transits landing on ${firstName}'s personal points today. Whatever is going on is either running on a longer pattern from earlier in the week, something environmental (school, friends, sleep, food), or simply a light day. The sky isn't pressing on him right now.`;
  }
  const top = flags[0];
  const t = top.transitPlanet;
  const n = top.natalPlanet;
  const asp = top.aspect;

  // Concrete parent action per transit flavor
  let action = "";
  if (t === "Saturn") action = `Saturn shows up as heaviness, self-criticism, or feeling like something is his job to carry. Sit next to ${firstName}, keep your voice low, name the weight out loud, and offer ONE small doable next step, not five.`;
  else if (t === "Neptune") action = `Neptune shows up as foggy, tired, tender, or "I don't know what's wrong." Cut screens, feed him, get him outside or near water, and don't require a clear reason for the feeling.`;
  else if (t === "Pluto") action = `Pluto shows up as something underneath asking to be seen: control, intensity, a fixation, or a quiet withdrawal. Don't demand he open up, but make it obvious you're available. A car ride or a walk works better than eye contact at the kitchen table.`;
  else if (t === "Mars") action = `Mars shows up as irritation, a short fuse, or physical restlessness. Get it out of the body before you try to talk. Movement, a hard run, a chore that uses arms, then the conversation lands.`;
  else if (t === "Chiron") action = `Chiron shows up as an old sore spot getting touched: not-good-enough, left out, misunderstood. Don't try to fix or reassure it away. Acknowledge it: "That one always hurts, doesn't it." Presence is the medicine.`;
  else if (t === "Moon") action = `The Moon is temporary but real. Let ${firstName} feel today's mood without making it a diagnosis. Feed him, keep the day simple, don't schedule anything hard tonight.`;
  else action = `Slow the day down. Fewer demands, more presence.`;

  const contactWord =
    asp === "conjunction" ? "landing directly on" :
    asp === "opposition" ? "pulling against" :
    asp === "square" ? "pressing on" : "in contact with";

  return `Today, transiting ${t} is ${contactWord} ${firstName}'s natal ${n} (${asp}, orb ${top.orb}°). That's what the sky is doing to him today. ${action}`;
}


export function TodayForPersonPanel({ charts, defaultName }: Props) {
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    if (selectedId) return;
    if (!charts.length) return;
    if (defaultName) {
      const match = charts.find(c =>
        c.name?.toLowerCase().startsWith(defaultName.toLowerCase())
      );
      if (match) { setSelectedId(match.id); return; }
    }
    setSelectedId(charts[0].id);
  }, [charts, defaultName, selectedId]);

  const chart = charts.find(c => c.id === selectedId) || null;

  const data = useMemo(() => {
    if (!chart) return null;
    const now = new Date();
    const positions = getPlanetaryPositions(now);
    const aspects = calculateTransitAspects(now, positions, chart);

    // Tightest overall
    const sorted = [...aspects].sort((a, b) => parseOrb(a) - parseOrb(b));

    // Split
    const moonAspects = sorted.filter(a => a.transitPlanet === "Moon").slice(0, 3);
    const slowAspects = sorted.filter(
      a => ["Saturn", "Neptune", "Pluto", "Uranus", "Jupiter", "Chiron"].includes(a.transitPlanet)
        && parseOrb(a) <= 3
    ).slice(0, 4);

    const anxietyHits = sorted.filter(anxietyFlag).slice(0, 4);

    const moonHouseLine = formatMoonHouseSchedule(chart, now) || "";
    const moon = positions.moon;
    const guidance = buildPersonalDailyGuidance({
      moonSign: moon?.signName || moon?.sign || "",
      moonDegree: moon?.degree ?? 0,
      moonMinutes: moon?.minutes ?? 0,
      moonPhaseName: (positions as any).moonPhase?.name || "Waxing Crescent",
      isBalsamic: false,
      chart,
      transitAspects: aspects,
    });

    return { moonHouseLine, moonAspects, slowAspects, anxietyHits, guidance };
  }, [chart]);

  const firstName = (chart?.name || "").split(" ")[0] || "them";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <Card className="border-primary/40 bg-gradient-to-br from-primary/5 via-background to-background">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="font-serif text-xl font-light flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Today for {chart ? firstName : "…"}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Read for</span>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="h-8 w-[180px] text-sm">
                <SelectValue placeholder="Choose person" />
              </SelectTrigger>
              <SelectContent>
                {charts.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{today}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {!chart || !data ? (
          <p className="text-sm text-muted-foreground">Pick a person to see today's sky against their natal chart.</p>
        ) : (
          <>
            {/* Anxiety watch — the answer to "what's going on with them today" */}
            <div className={`rounded-lg border p-3 ${data.anxietyHits.length ? "border-destructive/40 bg-destructive/5" : "border-muted bg-muted/30"}`}>
              <div className="flex items-center gap-2 mb-2">
                {data.anxietyHits.length ? (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                ) : (
                  <Heart className="h-4 w-4 text-primary" />
                )}
                <span className="text-sm font-semibold">
                  {data.anxietyHits.length ? "Anxiety watch" : "Nervous system today"}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                {whatHelpsLine(data.anxietyHits, firstName)}
              </p>
              {data.anxietyHits.length > 0 && (
                <div className="mt-3 space-y-1">
                  {data.anxietyHits.map((a, i) => (
                    <div key={i} className="text-xs font-mono text-muted-foreground">
                      t.{PLANET_GLYPH[a.transitPlanet] || a.transitPlanet} {a.transitSign} {ASPECT_GLYPH[a.aspect] || a.aspect} n.{PLANET_GLYPH[a.natalPlanet] || a.natalPlanet} {a.natalSign}
                      {a.natalHouse ? ` (${a.natalHouse}H)` : ""} — orb {a.orb}°{a.applying ? ", applying" : ", separating"}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Moon situation */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MoonIcon className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Where today's Moon lands for {firstName}</span>
              </div>
              {data.moonHouseLine && (
                <p className="text-sm text-foreground leading-relaxed">{data.moonHouseLine}</p>
              )}
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                {data.guidance.reflection}
              </p>
              {data.moonAspects.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {data.moonAspects.map((a, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] font-mono">
                      t.☽ {ASPECT_GLYPH[a.aspect] || a.aspect} n.{PLANET_GLYPH[a.natalPlanet] || a.natalPlanet} {a.natalSign} · {a.orb}°
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Longer-arc transits */}
            {data.slowAspects.length > 0 && (
              <div>
                <div className="text-sm font-semibold mb-1">The longer weather on {firstName} right now</div>
                <p className="text-xs text-muted-foreground mb-2">Outer planets active within 3°. These aren't a today-only mood, they're the season.</p>
                <div className="space-y-1.5">
                  {data.slowAspects.map((a, i) => {
                    const house = a.natalHouse;
                    const arena = house ? HOUSE_ARENA_SHORT[house] : null;
                    return (
                      <div key={i} className="text-sm p-2 rounded border bg-card">
                        <div className="font-mono text-xs mb-0.5">
                          t.{PLANET_GLYPH[a.transitPlanet] || a.transitPlanet} {a.transitSign} {ASPECT_GLYPH[a.aspect] || a.aspect} n.{PLANET_GLYPH[a.natalPlanet] || a.natalPlanet} {a.natalSign}
                          {house ? ` in ${house}H` : ""} · orb {a.orb}°
                        </div>
                        {arena && (
                          <div className="text-xs text-muted-foreground">
                            Pressure landing on {arena}.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

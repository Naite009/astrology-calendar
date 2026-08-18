import { useEffect, useMemo, useState } from "react";
import * as Astronomy from "astronomy-engine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { getSignLunationData } from "@/lib/signLunationData";
import { getSignPractice } from "@/data/signAsPractice";
import { getPlanetaryPositions } from "@/lib/astrology";
import { formatLocalDateKey } from "@/lib/localDate";

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const ASPECTS: Array<{ name: string; angle: number; orb: number; symbol: string; tone: string }> = [
  { name: "conjunction", angle: 0, orb: 6, symbol: "☌", tone: "fuses with" },
  { name: "opposition", angle: 180, orb: 6, symbol: "☍", tone: "pulls against" },
  { name: "square", angle: 90, orb: 5, symbol: "□", tone: "pressures" },
  { name: "trine", angle: 120, orb: 5, symbol: "△", tone: "supports" },
  { name: "sextile", angle: 60, orb: 4, symbol: "⚹", tone: "opens a door for" },
];

const PLANET_WEATHER: Record<string, string> = {
  Mercury: "conversations, plans, paperwork and how clearly you can say what you mean",
  Venus: "money, comfort, affection and what you are willing to accept",
  Mars: "energy, conflict, pace and how hard you push",
  Jupiter: "opportunity, appetite, over-committing and where you want more",
  Saturn: "limits, responsibility, delays and what has to be done properly",
  Uranus: "sudden changes of plan and the urge to break routine",
  Neptune: "fog, tiredness, imagination and blurred boundaries",
  Pluto: "control, power moves and things you cannot un-see",
};

interface CycleWeatherPanelProps {
  chartId?: string;
}

function signOf(lon: number) {
  const l = ((lon % 360) + 360) % 360;
  return { sign: ZODIAC_SIGNS[Math.floor(l / 30)], degree: Math.floor(l % 30) };
}

function absLon(pos: { signName: string; rawDegree: number }) {
  const idx = ZODIAC_SIGNS.indexOf(pos.signName);
  return idx < 0 ? 0 : idx * 30 + pos.rawDegree;
}

function fmt(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export const CycleWeatherPanel = ({ chartId }: CycleWeatherPanelProps) => {
  const [journal, setJournal] = useState<{
    new_moon_intentions?: string | null;
    ai_suggested_intentions?: string | null;
    tarot_card_name?: string | null;
    tarot_ai_interpretation?: string | null;
  } | null>(null);

  const cycle = useMemo(() => {
    const now = new Date();
    const prev = Astronomy.SearchMoonPhase(0, now, -30)?.date
      || new Date(now.getTime() - 29.5 * 864e5);
    const next = Astronomy.SearchMoonPhase(0, now, 30)?.date
      || new Date(now.getTime() + 29.5 * 864e5);

    const nmEcl = Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Moon, prev, false));
    const nmLon = ((nmEcl.elon % 360) + 360) % 360;
    const nm = signOf(nmLon);

    const phase = (target: number, limit: number) => {
      const found = Astronomy.SearchMoonPhase(target, prev, limit)?.date;
      if (!found) return null;
      const e = Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Moon, found, false));
      return { date: found, ...signOf(e.elon) };
    };

    // General sky weather: aspects to the New Moon degree at the moment of the New Moon
    const positions = getPlanetaryPositions(prev);
    const contacts: Array<{ planet: string; symbol: string; aspect: string; tone: string; sign: string; orb: number }> = [];
    (["Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"] as const).forEach((name) => {
      const pos = (positions as any)[name.toLowerCase()];
      if (!pos) return;
      const lon = absLon(pos);
      let diff = Math.abs(lon - nmLon) % 360;
      if (diff > 180) diff = 360 - diff;
      for (const a of ASPECTS) {
        const orb = Math.abs(diff - a.angle);
        if (orb <= a.orb) {
          contacts.push({ planet: name, symbol: a.symbol, aspect: a.name, tone: a.tone, sign: pos.signName, orb: Math.round(orb * 10) / 10 });
          break;
        }
      }
    });
    contacts.sort((a, b) => a.orb - b.orb);

    return {
      newMoonDate: prev,
      nextNewMoonDate: next,
      sign: nm.sign,
      degree: nm.degree,
      firstQuarter: phase(90, 15),
      fullMoon: phase(180, 20),
      lastQuarter: phase(270, 25),
      contacts: contacts.slice(0, 4),
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      const deviceId = localStorage.getItem("device_id") || "";
      if (!deviceId) return;
      let q = supabase
        .from("lunar_cycle_journals")
        .select("new_moon_intentions, ai_suggested_intentions, tarot_card_name, tarot_ai_interpretation")
        .eq("device_id", deviceId)
        .eq("cycle_start_date", formatLocalDateKey(cycle.newMoonDate))
        .limit(1);
      if (chartId) q = q.eq("chart_id", chartId);
      const { data } = await q;
      if (data && data.length > 0) setJournal(data[0] as typeof journal);
    };
    load();
  }, [cycle.newMoonDate, chartId]);

  const lunation = getSignLunationData(cycle.sign);
  const practice = getSignPractice(cycle.sign);

  return (
    <div className="space-y-4">
      <Card className="bg-background border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-sm font-medium">
              🌑 This cycle's weather · New Moon in {cycle.sign} {cycle.degree}°
            </CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              {fmt(cycle.newMoonDate)} to {fmt(cycle.nextNewMoonDate)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            This part is the same for everyone. It is the sky, not your journal. Your intentions and your card
            pull sit underneath as your personal layer.
          </p>

          {lunation && (
            <div className="space-y-2">
              <p className="text-sm text-foreground/90 leading-relaxed">{lunation.overview}</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{lunation.seedGuidance}</p>
            </div>
          )}

          {/* Phase timeline */}
          <div className="grid gap-2 sm:grid-cols-4">
            {[
              { label: "🌑 New Moon", date: cycle.newMoonDate, sign: cycle.sign, degree: cycle.degree, note: "Plant it" },
              cycle.firstQuarter && { label: "🌓 First Quarter", date: cycle.firstQuarter.date, sign: cycle.firstQuarter.sign, degree: cycle.firstQuarter.degree, note: "First friction" },
              cycle.fullMoon && { label: "🌕 Full Moon", date: cycle.fullMoon.date, sign: cycle.fullMoon.sign, degree: cycle.fullMoon.degree, note: "It becomes visible" },
              cycle.lastQuarter && { label: "🌗 Last Quarter", date: cycle.lastQuarter.date, sign: cycle.lastQuarter.sign, degree: cycle.lastQuarter.degree, note: "Trim and release" },
            ]
              .filter(Boolean)
              .map((p: any) => (
                <div key={p.label} className="rounded-lg border border-border bg-muted/30 p-2.5">
                  <p className="text-[11px] font-medium">{p.label}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {fmt(p.date)} · {p.sign} {p.degree}°
                  </p>
                  <p className="text-[11px] text-foreground/70 mt-1">{p.note}</p>
                </div>
              ))}
          </div>

          {/* Sky contacts to the New Moon */}
          {cycle.contacts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-primary">What else the sky put on this New Moon</p>
              <ul className="space-y-1.5">
                {cycle.contacts.map((c) => (
                  <li key={c.planet} className="text-sm text-foreground/85 leading-relaxed">
                    <span className="font-mono text-xs text-muted-foreground mr-1">
                      (sky ☽ {c.symbol} {c.planet} {c.sign}, {c.orb}°)
                    </span>
                    {c.planet} {c.tone} this reset, so expect {PLANET_WEATHER[c.planet]} to show up in the story
                    of the month.
                  </li>
                ))}
              </ul>
            </div>
          )}

          {lunation && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] uppercase tracking-wide text-primary mb-1">Runs well as</p>
                <p className="text-sm text-foreground/85">{lunation.expressions.slice(0, 6).join(", ")}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] uppercase tracking-wide text-destructive/80 mb-1">Goes sideways as</p>
                <p className="text-sm text-foreground/85">{lunation.shadow.slice(0, 5).join(", ")}</p>
              </div>
            </div>
          )}

          {lunation?.themes && lunation.themes.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-primary">Themes of the month</p>
              {lunation.themes.map((t) => (
                <div key={t.title} className="rounded-lg bg-muted/30 p-2.5">
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-sm text-foreground/80">{t.description}</p>
                </div>
              ))}
            </div>
          )}

          {practice && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Questions this cycle asks</p>
                <ul className="space-y-1">
                  {practice.prompts.slice(0, 3).map((p) => (
                    <li key={p} className="text-sm text-foreground/85">• {p}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Simple things to do</p>
                <p className="text-sm text-foreground/85">{practice.ritualIdeas.join(", ")}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal layer: intentions + tarot */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">✨ Your layer on top of this cycle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {journal?.new_moon_intentions ? (
            <div>
              <p className="text-[11px] uppercase tracking-wide text-primary mb-1">Your intention</p>
              <p className="text-sm text-foreground/90 whitespace-pre-line">{journal.new_moon_intentions}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No intention saved for this cycle yet. Write one in the Dashboard tab and it will appear here.
            </p>
          )}

          {journal?.ai_suggested_intentions && (
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Generated examples kept for this cycle</p>
              <p className="text-sm text-foreground/80 whitespace-pre-line">{journal.ai_suggested_intentions}</p>
            </div>
          )}

          {journal?.tarot_card_name && (
            <div>
              <p className="text-[11px] uppercase tracking-wide text-primary mb-1">🃏 Card for this cycle</p>
              <p className="text-sm font-medium">{journal.tarot_card_name}</p>
              {journal.tarot_ai_interpretation && (
                <p className="text-sm text-foreground/80 whitespace-pre-line mt-1">
                  {journal.tarot_ai_interpretation}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CycleWeatherPanel;

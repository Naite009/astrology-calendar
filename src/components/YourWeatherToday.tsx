import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { NatalChart } from "@/hooks/useNatalChart";
import { PlanetaryPositions } from "@/lib/astrology";
import { calculateTransitAspects } from "@/lib/transitAspects";
import { getTransitPlanetHouse } from "@/lib/houseCalculations";
import { formatLocalDateKey } from "@/lib/localDate";

interface YourWeatherTodayProps {
  chart: NatalChart;
  transitPositions: PlanetaryPositions;
  recipientName?: string;
}

const SLOW_PLANETS = new Set(["Pluto", "Neptune", "Uranus", "Saturn", "Jupiter", "Chiron"]);
const PERSONAL_TARGETS = new Set([
  "Sun", "Moon", "Mercury", "Venus", "Mars",
  "Ascendant", "Midheaven", "Descendant", "IC",
]);

export function YourWeatherToday({ chart, transitPositions, recipientName }: YourWeatherTodayProps) {
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);
  const dateKey = formatLocalDateKey(today);
  const cacheKey = `your-weather-today:${chart.id || chart.name || "primary"}:${dateKey}`;

  const computePayload = useMemo(() => {
    try {
      const transits = calculateTransitAspects(today, transitPositions, chart);
      const moon = transitPositions.moon;
      const transitMoonSign = (moon?.signName || moon?.sign || "").toString();
      const transitMoonHouse = moon
        ? getTransitPlanetHouse(transitMoonSign, moon.degree ?? 0, chart)
        : null;

      // Strongest Moon-to-natal aspect (tightest orb where transit planet === Moon)
      const moonHits = transits
        .filter((t: any) => t.transitPlanet === "Moon")
        .sort((a: any, b: any) => parseFloat(a.orb) - parseFloat(b.orb));
      const topMoonAspect = moonHits[0] || null;

      // Strongest longer transit: outer planets to personal points, tightest orb
      const longerHits = transits
        .filter((t: any) =>
          SLOW_PLANETS.has(t.transitPlanet) && PERSONAL_TARGETS.has(t.natalPlanet)
        )
        .sort((a: any, b: any) => parseFloat(a.orb) - parseFloat(b.orb));
      const topLongerTransit = longerHits[0] || null;

      return {
        recipientName: recipientName || chart.name,
        dateLabel: today.toLocaleDateString("en-US", {
          weekday: "long", month: "long", day: "numeric", year: "numeric",
        }),
        transitMoonSign,
        transitMoonHouse,
        topMoonAspect: topMoonAspect && {
          natalPlanet: topMoonAspect.natalPlanet,
          aspect: topMoonAspect.aspect,
          natalSign: topMoonAspect.natalSign,
          natalHouse: topMoonAspect.natalHouse ?? null,
          orb: topMoonAspect.orb,
        },
        topLongerTransit: topLongerTransit && {
          transitPlanet: topLongerTransit.transitPlanet,
          aspect: topLongerTransit.aspect,
          natalPlanet: topLongerTransit.natalPlanet,
          natalSign: topLongerTransit.natalSign,
          natalHouse: topLongerTransit.natalHouse ?? null,
          orb: topLongerTransit.orb,
          applying: topLongerTransit.applying,
        },
      };
    } catch (e) {
      console.error("YourWeatherToday payload error:", e);
      return null;
    }
  }, [chart, transitPositions, today, recipientName]);

  const fetchWeather = async (force = false) => {
    if (!computePayload) return;
    setLoading(true);
    setError(null);
    try {
      if (!force) {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          setText(cached);
          setLoading(false);
          return;
        }
      }
      const { data, error: fnErr } = await supabase.functions.invoke("your-weather-today", {
        body: computePayload,
      });
      if (fnErr) throw fnErr;
      const t = (data?.text || "").trim();
      if (!t) throw new Error("Empty response");
      setText(t);
      sessionStorage.setItem(cacheKey, t);
    } catch (e: any) {
      console.error("YourWeatherToday fetch error:", e);
      setError(e?.message || "Could not load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  return (
    <Card className="mt-6 border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-lg font-light flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Your Weather Today
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchWeather(true)}
            disabled={loading}
            className="h-7 px-2"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          How today's sky lands in your chart
        </p>
      </CardHeader>
      <CardContent>
        {loading && !text ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Reading your sky...
          </div>
        ) : error && !text ? (
          <p className="text-sm text-muted-foreground">
            Could not load today's personal weather. Try refresh.
          </p>
        ) : (
          <p className="text-base leading-relaxed text-foreground">{text}</p>
        )}
      </CardContent>
    </Card>
  );
}

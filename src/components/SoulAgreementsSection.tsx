/**
 * Soul Agreements Section — symbolic evolutionary-astrology layer
 * Sits inside the Natal Portrait, directly after Top 5 Life Themes.
 */

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NatalChart } from "@/hooks/useNatalChart";
import { computeAllSignals } from "@/lib/narrativeAnalysisEngine";
import { ChevronDown, ChevronUp, Loader2, Sparkles, RefreshCw } from "lucide-react";

const SIGN_RULERS: Record<string, string> = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
  Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Pluto",
  Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Uranus", Pisces: "Neptune",
};

interface AgreementSection {
  interpretation: string;
  question: string;
}

interface SoulAgreements {
  family: AgreementSection;
  wound: AgreementSection;
  purpose: AgreementSection;
  relationship: AgreementSection;
  gift: AgreementSection;
  timing: AgreementSection;
  legacy: AgreementSection;
  strength?: AgreementSection;
  reset?: AgreementSection;
  summary: {
    whatToPractice: string;
    whatToWatchFor: string;
    whatToBuild: string;
    whatToGive: string;
    integration?: string;
  };
}

const SECTION_META: Array<{ key: keyof Omit<SoulAgreements, "summary">; label: string; sub: string }> = [
  { key: "family", label: "Family Agreement", sub: "What kind of emotional environment shaped your soul's development?" },
  { key: "wound", label: "Wound Agreement", sub: "What pain became your growth catalyst?" },
  { key: "purpose", label: "Purpose Agreement", sub: "What did your soul come here to become?" },
  { key: "relationship", label: "Relationship Agreement", sub: "Who helps evolve your soul?" },
  { key: "gift", label: "Gift Agreement", sub: "What did you bring into this life already developed?" },
  { key: "timing", label: "Timing Agreement", sub: "How does growth tend to unfold in your life?" },
  { key: "legacy", label: "Legacy Agreement", sub: "What are you here to leave behind?" },
  { key: "strength", label: "Strength Under Stress", sub: "Who do you become when life gets hard?" },
  { key: "reset", label: "What Helps You Reset", sub: "What helps you feel grounded again?" },
];

const cacheKey = (chartId: string) => `soulAgreements_v1_${chartId}`;

const RECOGNITION_HEADING = /(^|\n)\s*(?:\*\*\s*Recognition Check\s*\*\*|#{1,6}\s*Recognition Check|Recognition Check)\s*:?(?=\n|$)/gi;

const sanitizeSection = (section?: AgreementSection): AgreementSection | undefined => {
  if (!section) return section;
  const matches = [...section.interpretation.matchAll(RECOGNITION_HEADING)];
  const interpretation = matches.length
    ? section.interpretation.slice(0, (matches[0].index ?? 0) + (matches[0][1] ? matches[0][1].length : 0)).trim()
    : section.interpretation.trim();
  const question = section.question.replace(RECOGNITION_HEADING, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return { interpretation, question };
};

const sanitizeAgreements = (agreements: SoulAgreements): SoulAgreements => ({
  ...agreements,
  family: sanitizeSection(agreements.family)!,
  wound: sanitizeSection(agreements.wound)!,
  purpose: sanitizeSection(agreements.purpose)!,
  relationship: sanitizeSection(agreements.relationship)!,
  gift: sanitizeSection(agreements.gift)!,
  timing: sanitizeSection(agreements.timing)!,
  legacy: sanitizeSection(agreements.legacy)!,
  strength: sanitizeSection(agreements.strength),
  reset: sanitizeSection(agreements.reset),
});

export const SoulAgreementsSection = ({ chart }: { chart: NatalChart }) => {
  const [open, setOpen] = useState(true);
  const [data, setData] = useState<SoulAgreements | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build deterministic payload from chart
  const payload = useMemo(() => {
    const signals = computeAllSignals(chart);
    const placements = signals.planetHouses.map((p) => ({
      planet: p.planet,
      sign: p.sign,
      degree: p.degree,
      house: p.house,
      isRetrograde: p.isRetrograde,
    }));

    const cusps = chart.houseCusps || ({} as any);
    const houseList = [4, 7, 8, 10, 12].map((n) => {
      const c = cusps[`house${n}`];
      const cuspSign = c?.sign;
      const ruler = cuspSign ? SIGN_RULERS[cuspSign] : undefined;
      const rulerPlanet = ruler ? signals.planetHouses.find((ph) => ph.planet === ruler) : undefined;
      return {
        house: n,
        cuspSign,
        cuspDegree: c?.degree,
        ruler,
        rulerSign: rulerPlanet?.sign,
        rulerHouse: rulerPlanet?.house,
      };
    });

    // Filter aspects to luminaries/Asc/MC + supportive trines/conjunctions involving Jupiter/Venus
    const KEY_BODIES = new Set([
      "Sun", "Moon", "Ascendant", "Midheaven", "Chiron", "Saturn",
      "Venus", "Mars", "Jupiter", "Pluto", "NorthNode", "SouthNode",
    ]);
    const aspects = signals.natalAspects
      .filter((a) => KEY_BODIES.has(a.planet1) || KEY_BODIES.has(a.planet2))
      .map((a) => ({ planet1: a.planet1, planet2: a.planet2, type: a.type, orb: a.orb }));

    return {
      chartName: chart.name,
      placements,
      houses: houseList,
      aspects,
    };
  }, [chart]);

  // Load cached
  useEffect(() => {
    setData(null);
    setError(null);
    try {
      const raw = localStorage.getItem(cacheKey(chart.id));
      if (raw) setData(sanitizeAgreements(JSON.parse(raw)));
    } catch {/* ignore */}
  }, [chart.id]);

  const summaryComplete = (s?: SoulAgreements["summary"]) => {
    if (!s) return false;
    const fields = [s.whatToPractice, s.whatToWatchFor, s.whatToBuild, s.whatToGive, s.integration];
    return fields.every((f) => typeof f === "string" && f.trim().split(/\s+/).filter(Boolean).length >= 5 && !/\bregenerate\b/i.test(f));
  };

  const callOnce = async () => {
    const { data: resp, error: invokeErr } = await supabase.functions.invoke("soul-agreements", { body: payload });
    if (invokeErr) throw invokeErr;
    return sanitizeAgreements((resp as any)?.agreements as SoulAgreements);
  };

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      let agreements = await callOnce();
      // Internal retry if summary block is incomplete — never expose failure
      let attempts = 0;
      while ((!agreements?.family || !summaryComplete(agreements?.summary)) && attempts < 2) {
        attempts++;
        agreements = await callOnce();
      }
      if (!agreements?.family || !agreements?.summary) throw new Error("Malformed response");
      setData(agreements);
      try { localStorage.setItem(cacheKey(chart.id), JSON.stringify(agreements)); } catch {/* quota */}
    } catch (e: any) {
      console.error("soul-agreements failed:", e);
      setError(e?.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-primary/30 rounded-sm bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-center justify-between border-b border-border hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          <span className="text-sm font-medium uppercase tracking-widest text-foreground">Soul Agreements (Life Patterns)</span>
        </div>
        {open ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
      </button>

      {open && (
        <div className="p-5 space-y-4">
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            This section looks at the deeper life patterns your chart may point to: your emotional patterns, growth lessons, natural strengths, and the kinds of experiences and relationships that shape you. This is reflective, not predictive.
          </p>

          {!data && !loading && (
            <button
              onClick={generate}
              className="px-4 py-2 text-xs bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity"
            >
              Generate Soul Agreements
            </button>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground py-6">
              <Loader2 size={14} className="animate-spin" />
              Reading your chart's soul layer...
            </div>
          )}

          {error && (
            <div className="text-xs text-destructive bg-destructive/10 p-3 rounded-sm">
              {error}
              <button onClick={generate} className="ml-3 underline">Try again</button>
            </div>
          )}

          {data && (
            <div className="space-y-4">
              {SECTION_META.map(({ key, label, sub }) => {
                const sec = data[key];
                if (!sec) return null;
                return (
                  <div key={key} className="p-4 bg-secondary/30 rounded-sm border-l-2 border-primary">
                    <div className="mb-2">
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">{sub}</p>
                    </div>
                    <p className="text-[12px] text-foreground leading-relaxed whitespace-pre-line">
                      {sec.interpretation}
                    </p>
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-[10px] uppercase tracking-widest text-primary mb-1">Recognition Check</p>
                      <p className="text-[12px] text-foreground/90 whitespace-pre-line">{sec.question}</p>
                    </div>
                  </div>
                );
              })}

              {/* Summary */}
              {data.summary && (
                <div className="p-4 bg-primary/5 border border-primary/30 rounded-sm">
                  <p className="text-[10px] uppercase tracking-widest text-primary font-medium mb-3">Soul Contract Summary</p>
                  <div className="space-y-2 text-[12px] text-foreground">
                    <div><span className="font-medium">What to practice:</span> {data.summary.whatToPractice}</div>
                    <div><span className="font-medium">What to watch for:</span> {data.summary.whatToWatchFor}</div>
                    <div><span className="font-medium">What to build:</span> {data.summary.whatToBuild}</div>
                    <div><span className="font-medium">What to give:</span> {data.summary.whatToGive}</div>
                  </div>
                  {data.summary.integration && (
                    <p className="mt-4 pt-3 border-t border-primary/20 text-[12px] text-foreground italic leading-relaxed">
                      {data.summary.integration}
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={generate}
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors"
              >
                <RefreshCw size={11} /> Refresh reading
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

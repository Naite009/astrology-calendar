import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, AlertCircle, Stethoscope } from "lucide-react";
import { NatalChart } from "@/hooks/useNatalChart";
import { supabase } from "@/integrations/supabase/client";
import { getPlanetaryPositions } from "@/lib/astrology";
import ReactMarkdown from "react-markdown";

interface SymptomAnalyzerCardProps {
  natalChart: NatalChart;
}

function buildChartContext(chart: NatalChart): string {
  const lines: string[] = [];
  lines.push(`Name: ${chart.name}`);
  lines.push(`Birth: ${chart.birthDate} ${chart.birthTime} ${chart.birthLocation}`);
  lines.push('');
  lines.push('PLANETARY PLACEMENTS (with calculated house positions):');

  const ZODIAC = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const cuspLongitudes: number[] = [];
  if (chart.houseCusps) {
    for (let i = 1; i <= 12; i++) {
      const key = `house${i}` as keyof typeof chart.houseCusps;
      const cusp = chart.houseCusps[key];
      if (cusp) {
        cuspLongitudes.push(ZODIAC.indexOf(cusp.sign) * 30 + cusp.degree + (cusp.minutes || 0) / 60);
      }
    }
  }
  const calcHouse = (absDeg: number): number | null => {
    if (cuspLongitudes.length !== 12) return null;
    for (let i = 0; i < 12; i++) {
      const nextI = (i + 1) % 12;
      let start = cuspLongitudes[i];
      let end = cuspLongitudes[nextI];
      if (end < start) end += 360;
      let d = absDeg;
      if (d < start) d += 360;
      if (d >= start && d < end) return i + 1;
    }
    return 1;
  };

  const planetNames = [
    'Sun', 'Moon', 'Ascendant', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
    'Chiron', 'NorthNode', 'SouthNode', 'Lilith', 'PartOfFortune', 'Vertex',
    'Ceres', 'Pallas', 'Juno', 'Vesta',
    'Psyche', 'Eros', 'Amor', 'Hygiea', 'Nessus', 'Pholus', 'Chariklo',
    'Eris', 'Sedna', 'Makemake', 'Haumea', 'Quaoar', 'Orcus', 'Ixion', 'Varuna', 'Gonggong', 'Salacia',
  ];
  for (const name of planetNames) {
    const p = chart.planets[name as keyof typeof chart.planets];
    if (p?.sign) {
      const retro = ('isRetrograde' in p && p.isRetrograde) ? ' (Rx)' : '';
      const deg = p.degree + (p.minutes || 0) / 60;
      const absDeg = ZODIAC.indexOf(p.sign) * 30 + deg;
      const house = calcHouse(absDeg);
      lines.push(`  ${name}: ${p.degree}°${p.minutes || 0}' ${p.sign}${house ? ` (House ${house})` : ''}${retro}`);
    }
  }

  if (chart.houseCusps) {
    lines.push('');
    lines.push('HOUSE CUSPS:');
    for (let i = 1; i <= 12; i++) {
      const key = `house${i}` as keyof typeof chart.houseCusps;
      const cusp = chart.houseCusps[key];
      if (cusp) {
        lines.push(`  ${i}H: ${cusp.degree}°${cusp.minutes}' ${cusp.sign}`);
      }
    }
  }

  return lines.join('\n');
}

function buildTransitContext(): string {
  const today = new Date();
  const positions = getPlanetaryPositions(today);
  const lines: string[] = [`Transit positions for ${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}:`];

  const outerPlanets = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'Mars', 'Venus'];
  for (const name of outerPlanets) {
    const p = positions[name as keyof typeof positions];
    if (p?.sign) {
      const mins = 'minutes' in p ? p.minutes : 0;
      lines.push(`  ${name}: ${p.degree}°${mins}' ${p.sign}`);
    }
  }

  return lines.join('\n');
}

const EXAMPLE_SYMPTOMS = [
  "I've been having eye trouble",
  "Constant anxiety and can't breathe",
  "Severe headaches every afternoon",
  "Digestive issues after eating",
  "Joint pain in my knees",
  "Trouble sleeping, waking at 3am",
  "Skin breakouts and rashes"
];

export const SymptomAnalyzerCard = ({ natalChart }: SymptomAnalyzerCardProps) => {
  const [symptom, setSymptom] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!symptom.trim()) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const chartContext = buildChartContext(natalChart);
      const transitContext = buildTransitContext();

      const { data, error: fnError } = await supabase.functions.invoke('analyze-health-symptom', {
        body: { symptom: symptom.trim(), chartContext, transitContext }
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      setAnalysis(data.analysis);
    } catch (err) {
      console.error('Symptom analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze symptom. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="py-3">
          <p className="text-xs text-amber-700">
            <strong>⚠️ Medical Disclaimer:</strong> This AI-powered symptom analyzer uses astrological
            correlations for educational and self-awareness purposes only. It does NOT replace professional
            medical advice, diagnosis, or treatment. Always consult healthcare providers for medical concerns.
          </p>
        </CardContent>
      </Card>

      {/* Input Card */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Stethoscope className="h-5 w-5 text-primary" />
            AI Symptom Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Describe a symptom or health concern. The analyzer will cross-reference your natal chart
            and current transits to identify astrological correlations and provide holistic support recommendations.
          </p>

          <div className="space-y-3">
            <Textarea
              placeholder="What are you experiencing? e.g., 'I've been having eye trouble' or 'Constant anxiety'"
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              className="min-h-[80px] resize-none"
            />

            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-muted-foreground mr-1">Try:</span>
              {EXAMPLE_SYMPTOMS.slice(0, 4).map((ex, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => setSymptom(ex)}
                >
                  {ex}
                </Badge>
              ))}
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={!symptom.trim() || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing natal chart + transits...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Analyze Symptom
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="rounded-sm border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Result */}
      {analysis && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5 text-primary" />
              Symptom Analysis: {symptom}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-p:text-muted-foreground">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

import { useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { NatalChart } from '@/hooks/useNatalChart';
import { analyzeRelationshipFocus, FocusAnalysis } from '@/lib/relationshipFocusAnalysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, Briefcase, Palette, Home } from 'lucide-react';

interface CompatibilityRadarChartProps {
  chart1: NatalChart;
  chart2: NatalChart;
}

export const CompatibilityRadarChart = ({ chart1, chart2 }: CompatibilityRadarChartProps) => {
  const analyses = useMemo(() => {
    const focuses = ['romantic', 'friendship', 'business', 'creative', 'family'] as const;
    return focuses.map(focus => analyzeRelationshipFocus(chart1, chart2, focus));
  }, [chart1, chart2]);

  const radarData = useMemo(() => {
    return analyses.map(analysis => ({
      focus: analysis.title.replace(' Analysis', '').replace(' Partnership', ''),
      score: analysis.overallStrength,
      fullMark: 100,
    }));
  }, [analyses]);

  const averageScore = useMemo(() => {
    const total = analyses.reduce((sum, a) => sum + a.overallStrength, 0);
    return Math.round(total / analyses.length);
  }, [analyses]);

  const strongestArea = useMemo(() => {
    return analyses.reduce((max, a) => a.overallStrength > max.overallStrength ? a : max);
  }, [analyses]);

  const weakestArea = useMemo(() => {
    return analyses.reduce((min, a) => a.overallStrength < min.overallStrength ? a : min);
  }, [analyses]);

  const getFocusIcon = (focusTitle: string) => {
    if (focusTitle.includes('Romantic')) return <Heart size={14} className="text-primary" />;
    if (focusTitle.includes('Friendship')) return <Users size={14} className="text-primary" />;
    if (focusTitle.includes('Business')) return <Briefcase size={14} className="text-primary" />;
    if (focusTitle.includes('Creative')) return <Palette size={14} className="text-primary" />;
    if (focusTitle.includes('Family')) return <Home size={14} className="text-primary" />;
    return null;
  };

  return (
    <Card className="border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span>Compatibility Summary</span>
          <span className="ml-auto text-2xl font-bold text-primary">{averageScore}%</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Overall compatibility across all relationship types
        </p>
      </CardHeader>
      <CardContent>
        {/* Radar Chart */}
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis 
                dataKey="focus" 
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickCount={5}
              />
              <Radar
                name="Compatibility"
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value}%`, 'Score']}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-5 gap-2 mt-4">
          {analyses.map((analysis, i) => (
            <div 
              key={i} 
              className="text-center p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex justify-center mb-1">
                {getFocusIcon(analysis.title)}
              </div>
              <div className="text-lg font-bold text-primary">{analysis.overallStrength}%</div>
              <div className="text-[10px] text-muted-foreground leading-tight">
                {analysis.title.replace(' Analysis', '').replace(' Partnership', '')}
              </div>
            </div>
          ))}
        </div>

        {/* Insights */}
        <div className="mt-4 p-3 rounded-lg bg-muted/50 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-primary">★</span>
            <span>
              <strong>Strongest:</strong> {strongestArea.title.replace(' Analysis', '')} at {strongestArea.overallStrength}%
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">○</span>
            <span>
              <strong>Growth Area:</strong> {weakestArea.title.replace(' Analysis', '')} at {weakestArea.overallStrength}%
            </span>
          </div>
        </div>

        {/* Interpretation */}
        <p className="mt-4 text-sm text-muted-foreground">
          {averageScore >= 65 
            ? `This pairing shows strong overall compatibility with natural synergy in ${strongestArea.title.replace(' Analysis', '').toLowerCase()}.`
            : averageScore >= 45
            ? `This pairing has moderate compatibility with particular strength in ${strongestArea.title.replace(' Analysis', '').toLowerCase()}. Other areas benefit from conscious effort.`
            : `This pairing requires intentional work across most areas, with the most potential in ${strongestArea.title.replace(' Analysis', '').toLowerCase()}.`
          }
        </p>
      </CardContent>
    </Card>
  );
};

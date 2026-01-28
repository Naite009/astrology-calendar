import { CycleSummary } from '@/lib/structuralStressEngine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface CycleSummaryCardProps {
  summary: CycleSummary;
}

const CYCLE_LABELS: Record<string, string> = {
  saturn_return: 'Saturn Return',
  saturn_opposition: 'Saturn Opposition',
  uranus_opposition: 'Uranus Opposition',
  pluto_square: 'Pluto Square'
};

export const CycleSummaryCard = ({ summary }: CycleSummaryCardProps) => {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="font-serif text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {CYCLE_LABELS[summary.cycle_type]} Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Story Summary */}
        <p className="text-foreground/80 leading-relaxed">
          {summary.story_summary}
        </p>

        {/* Lessons */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Lessons Integrated
          </h4>
          <ul className="space-y-1.5">
            {summary.lessons.map((lesson, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                <span className="text-primary mt-0.5">•</span>
                <span>{lesson}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Next Steps */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Next Steps
          </h4>
          <ul className="space-y-1.5">
            {summary.next_steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                <span className="text-primary mt-0.5">→</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

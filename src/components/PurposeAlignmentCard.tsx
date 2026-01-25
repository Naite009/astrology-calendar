import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Compass, Target, Handshake, AlertTriangle, Sparkles, Users, CheckCircle2, XCircle } from 'lucide-react';
import { CompositeAnalysis } from '@/lib/compositeAndDavison';

export interface PurposeAlignment {
  aligned: boolean;
  alignmentScore: number;
  sharedPurpose: string;
  individualGoals: {
    person1: string;
    person2: string;
  };
  conflictingGoals: string[];
  synergies: string[];
  missionStatement: string;
  coreValues: string[];
  jointVision: string;
}

interface PurposeAlignmentCardProps {
  alignment: PurposeAlignment;
  compositeAnalysis?: CompositeAnalysis;
  chart1Name: string;
  chart2Name: string;
}

const getAlignmentColor = (score: number): string => {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-blue-600 dark:text-blue-400';
  if (score >= 40) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
};

const getAlignmentBadge = (score: number): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } => {
  if (score >= 80) return { label: 'Highly Aligned', variant: 'default' };
  if (score >= 60) return { label: 'Well Aligned', variant: 'secondary' };
  if (score >= 40) return { label: 'Partially Aligned', variant: 'outline' };
  return { label: 'Needs Work', variant: 'destructive' };
};

export function PurposeAlignmentCard({ 
  alignment, 
  compositeAnalysis,
  chart1Name, 
  chart2Name 
}: PurposeAlignmentCardProps) {
  const badge = getAlignmentBadge(alignment.alignmentScore);

  return (
    <Card className="border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg">
            <Compass className="text-indigo-500" size={20} />
            Purpose Alignment
          </div>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Shared goals, conflicting drives, and synergies between {chart1Name} & {chart2Name}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alignment Score */}
        <div className="text-center p-4 rounded-xl bg-card border">
          <div className={`text-4xl font-bold mb-2 ${getAlignmentColor(alignment.alignmentScore)}`}>
            {alignment.alignmentScore}%
          </div>
          <p className="text-sm text-muted-foreground">Purpose Alignment Score</p>
          <Progress value={alignment.alignmentScore} className="mt-3 h-2" />
        </div>

        {/* Shared Purpose / Mission Statement */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-primary" size={18} />
            <span className="font-medium text-sm">Shared Purpose</span>
          </div>
          <p className="text-sm font-medium">{alignment.sharedPurpose}</p>
          {alignment.missionStatement && (
            <p className="text-xs text-muted-foreground mt-2 italic">
              "{alignment.missionStatement}"
            </p>
          )}
        </div>

        {/* Individual Goals */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-card border">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-muted-foreground" size={14} />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {chart1Name}'s Drive
              </span>
            </div>
            <p className="text-sm">{alignment.individualGoals.person1}</p>
          </div>
          <div className="p-3 rounded-lg bg-card border">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-muted-foreground" size={14} />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {chart2Name}'s Drive
              </span>
            </div>
            <p className="text-sm">{alignment.individualGoals.person2}</p>
          </div>
        </div>

        {/* Synergies & Conflicts */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Synergies */}
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-3">
              <Handshake className="text-green-500" size={18} />
              <span className="font-medium text-sm">Synergies</span>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                {alignment.synergies.length} found
              </Badge>
            </div>
            {alignment.synergies.length > 0 ? (
              <ul className="space-y-2">
                {alignment.synergies.map((synergy, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{synergy}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No major synergies detected</p>
            )}
          </div>

          {/* Conflicting Goals */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="text-amber-500" size={18} />
              <span className="font-medium text-sm">Conflicting Goals</span>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                {alignment.conflictingGoals.length} found
              </Badge>
            </div>
            {alignment.conflictingGoals.length > 0 ? (
              <ul className="space-y-2">
                {alignment.conflictingGoals.map((conflict, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <XCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{conflict}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No major conflicts detected</p>
            )}
          </div>
        </div>

        {/* Core Values */}
        {alignment.coreValues.length > 0 && (
          <div className="p-4 rounded-xl bg-card border">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-purple-500" size={18} />
              <span className="font-medium text-sm">Shared Core Values</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {alignment.coreValues.map((value, i) => (
                <Badge key={i} variant="outline" className="bg-purple-50 dark:bg-purple-950/30">
                  {value}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Joint Vision */}
        {alignment.jointVision && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-100/50 to-purple-100/50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-2 mb-2">
              <Compass className="text-indigo-500" size={16} />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Joint Vision
              </span>
            </div>
            <p className="text-sm font-medium text-primary">{alignment.jointVision}</p>
          </div>
        )}

        {/* Composite Analysis Integration */}
        {compositeAnalysis && (
          <div className="p-3 rounded-lg bg-muted/30 border text-center">
            <p className="text-xs text-muted-foreground">
              Based on your Composite chart's {compositeAnalysis.relationshipPurpose?.slice(0, 80)}...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PurposeAlignmentCard;

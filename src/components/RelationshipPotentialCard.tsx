import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, Heart, Briefcase, Zap, Target, Clock, Infinity } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface RelationshipPotential {
  shortTerm: {
    score: number;
    description: string;
    factors: string[];
  };
  longTerm: {
    score: number;
    description: string;
    factors: string[];
  };
  marriagePotential: {
    score: number;
    considerations: string[];
    timing?: string;
  };
  businessPotential: {
    score: number;
    considerations: string[];
    bestAreas?: string[];
  };
  growthPotential: {
    individual: string;
    collective: string;
    evolutionaryPath: string;
  };
}

interface RelationshipPotentialCardProps {
  potential: RelationshipPotential;
  chart1Name: string;
  chart2Name: string;
  focus?: string;
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 65) return 'text-blue-600 dark:text-blue-400';
  if (score >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
};

const getScoreLabel = (score: number): string => {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Strong';
  if (score >= 55) return 'Moderate';
  if (score >= 40) return 'Challenging';
  return 'Difficult';
};

const getProgressColor = (score: number): string => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 65) return 'bg-blue-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
};

export function RelationshipPotentialCard({ 
  potential, 
  chart1Name, 
  chart2Name,
  focus 
}: RelationshipPotentialCardProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="text-primary" size={20} />
          Relationship Potential
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Short-term chemistry vs. long-term sustainability for {chart1Name} & {chart2Name}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Short-Term vs Long-Term Comparison */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Short-Term */}
          <Collapsible open={expandedSection === 'short'} onOpenChange={() => toggleSection('short')}>
            <div className="p-4 rounded-xl bg-card border">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="text-amber-500" size={18} />
                    <span className="font-medium">Short-Term</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getScoreColor(potential.shortTerm.score)}`}>
                      {potential.shortTerm.score}%
                    </span>
                    {expandedSection === 'short' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>
                <Progress 
                  value={potential.shortTerm.score} 
                  className="h-2" 
                />
                <Badge variant="secondary" className="mt-2">
                  {getScoreLabel(potential.shortTerm.score)}
                </Badge>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">{potential.shortTerm.description}</p>
                {potential.shortTerm.factors.length > 0 && (
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {potential.shortTerm.factors.map((factor, i) => (
                      <li key={i}>• {factor}</li>
                    ))}
                  </ul>
                )}
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Long-Term */}
          <Collapsible open={expandedSection === 'long'} onOpenChange={() => toggleSection('long')}>
            <div className="p-4 rounded-xl bg-card border">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Infinity className="text-blue-500" size={18} />
                    <span className="font-medium">Long-Term</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getScoreColor(potential.longTerm.score)}`}>
                      {potential.longTerm.score}%
                    </span>
                    {expandedSection === 'long' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>
                <Progress 
                  value={potential.longTerm.score} 
                  className="h-2" 
                />
                <Badge variant="secondary" className="mt-2">
                  {getScoreLabel(potential.longTerm.score)}
                </Badge>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">{potential.longTerm.description}</p>
                {potential.longTerm.factors.length > 0 && (
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {potential.longTerm.factors.map((factor, i) => (
                      <li key={i}>• {factor}</li>
                    ))}
                  </ul>
                )}
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>

        {/* Marriage & Business Potential */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Marriage Potential */}
          <Collapsible open={expandedSection === 'marriage'} onOpenChange={() => toggleSection('marriage')}>
            <div className="p-4 rounded-xl bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Heart className="text-pink-500" size={18} />
                    <span className="font-medium text-sm">Marriage Potential</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-bold ${getScoreColor(potential.marriagePotential.score)}`}>
                      {potential.marriagePotential.score}%
                    </span>
                    {expandedSection === 'marriage' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>
                <Progress 
                  value={potential.marriagePotential.score} 
                  className="h-1.5" 
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 pt-3 border-t border-pink-200 dark:border-pink-800">
                {potential.marriagePotential.timing && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Clock size={12} />
                    <span>{potential.marriagePotential.timing}</span>
                  </div>
                )}
                <ul className="text-xs text-muted-foreground space-y-1">
                  {potential.marriagePotential.considerations.map((c, i) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Business Potential */}
          <Collapsible open={expandedSection === 'business'} onOpenChange={() => toggleSection('business')}>
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="text-emerald-500" size={18} />
                    <span className="font-medium text-sm">Business Potential</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-bold ${getScoreColor(potential.businessPotential.score)}`}>
                      {potential.businessPotential.score}%
                    </span>
                    {expandedSection === 'business' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>
                <Progress 
                  value={potential.businessPotential.score} 
                  className="h-1.5" 
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800">
                {potential.businessPotential.bestAreas && potential.businessPotential.bestAreas.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {potential.businessPotential.bestAreas.map((area, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">{area}</Badge>
                    ))}
                  </div>
                )}
                <ul className="text-xs text-muted-foreground space-y-1">
                  {potential.businessPotential.considerations.map((c, i) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>

        {/* Growth Potential Summary */}
        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-3">
            <Target className="text-purple-500" size={18} />
            <span className="font-medium text-sm">Growth & Evolution</span>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Individual Growth</span>
              <p className="text-muted-foreground">{potential.growthPotential.individual}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Collective Growth</span>
              <p className="text-muted-foreground">{potential.growthPotential.collective}</p>
            </div>
            <div className="pt-2 border-t border-purple-200 dark:border-purple-800">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Evolutionary Path</span>
              <p className="text-primary font-medium">{potential.growthPotential.evolutionaryPath}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RelationshipPotentialCard;

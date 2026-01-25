import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Users, TrendingUp, AlertTriangle, Clock, Sparkles } from 'lucide-react';
import { DirectionalAspectInterpretation, RelationshipContext } from '@/types/directionalAspects';

interface DirectionalAspectCardProps {
  interpretation: DirectionalAspectInterpretation;
  context: RelationshipContext;
  personAName: string;
  personBName: string;
}

export const DirectionalAspectCard: React.FC<DirectionalAspectCardProps> = ({
  interpretation,
  context,
  personAName,
  personBName,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getIntensityColor = (level: number) => {
    if (level >= 8) return 'bg-destructive/80 text-destructive-foreground';
    if (level >= 5) return 'bg-orange-500/80 text-white';
    return 'bg-yellow-500/80 text-black';
  };

  const getGrowthColor = (level: number) => {
    if (level >= 8) return 'bg-green-500/80 text-white';
    if (level >= 5) return 'bg-blue-500/80 text-white';
    return 'bg-muted text-muted-foreground';
  };

  const getChallengeColor = (level: number) => {
    if (level >= 8) return 'bg-destructive/80 text-destructive-foreground';
    if (level >= 5) return 'bg-orange-500/80 text-white';
    return 'bg-green-500/80 text-white';
  };

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader 
        className="cursor-pointer hover:bg-accent/50 transition-colors rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users size={18} className="text-primary" />
            Who Feels What
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <Badge className={getIntensityColor(interpretation.intensityLevel)}>
            <Sparkles size={12} className="mr-1" />
            Intensity: {interpretation.intensityLevel}/10
          </Badge>
          <Badge className={getGrowthColor(interpretation.growthPotential)}>
            <TrendingUp size={12} className="mr-1" />
            Growth: {interpretation.growthPotential}/10
          </Badge>
          <Badge className={getChallengeColor(interpretation.challengeLevel)}>
            <AlertTriangle size={12} className="mr-1" />
            Challenge: {interpretation.challengeLevel}/10
          </Badge>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 pt-2">
          {/* Person A Experience */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <h4 className="font-semibold text-foreground">
                {personAName}'s Experience ({interpretation.personARole})
              </h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {interpretation.personAExperience[context]}
            </p>
          </div>

          {/* Person B Experience */}
          <div className="p-4 rounded-lg bg-secondary/50 border border-secondary">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-secondary-foreground/60" />
              <h4 className="font-semibold text-foreground">
                {personBName}'s Experience ({interpretation.personBRole})
              </h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {interpretation.personBExperience[context]}
            </p>
          </div>

          {/* Mutual Work */}
          <div className="p-4 rounded-lg bg-accent/30 border border-accent">
            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              Growth Work for Both
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {interpretation.mutualWork}
            </p>
          </div>

          {/* Evolution Timeline */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              How This Dynamic Evolves
            </h4>
            <p className="text-xs text-muted-foreground mb-3 italic">
              {context === 'family' 
                ? "How this dynamic shifts through life stages"
                : "Based on years together in this relationship"
              }
            </p>
            <div className="relative">
              <div className="absolute left-[7px] top-3 bottom-3 w-0.5 bg-border" />
              <div className="space-y-4">
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-primary/20 border-2 border-primary" />
                  <h5 className="font-medium text-sm text-foreground">
                    {context === 'family' ? "Childhood & Early Years" : "First 1-3 Years Together"}
                  </h5>
                  <p className="text-sm text-muted-foreground mt-1">
                    {interpretation.evolutionTimeline.year1_3}
                  </p>
                </div>
                
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-primary/40 border-2 border-primary" />
                  <h5 className="font-medium text-sm text-foreground">
                    {context === 'family' ? "Adolescence & Young Adulthood" : "Years 4-7 Together"}
                  </h5>
                  <p className="text-sm text-muted-foreground mt-1">
                    {interpretation.evolutionTimeline.year4_7}
                  </p>
                </div>
                
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-primary border-2 border-primary" />
                  <h5 className="font-medium text-sm text-foreground">
                    {context === 'family' ? "Adult Relationship" : "7+ Years Together"}
                  </h5>
                  <p className="text-sm text-muted-foreground mt-1">
                    {interpretation.evolutionTimeline.year7_plus}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Star, TrendingUp, TrendingDown, Eye, EyeOff, Minus } from 'lucide-react';
import { PlanetaryCondition } from '@/lib/planetaryCondition';

interface PlanetaryConditionDashboardProps {
  conditions: PlanetaryCondition[];
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇'
};

const QUALITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Excellent': { bg: 'bg-emerald-500/15', text: 'text-emerald-600', border: 'border-emerald-500/30' },
  'Good': { bg: 'bg-green-500/15', text: 'text-green-600', border: 'border-green-500/30' },
  'Moderate': { bg: 'bg-sky-500/15', text: 'text-sky-600', border: 'border-sky-500/30' },
  'Challenged': { bg: 'bg-amber-500/15', text: 'text-amber-600', border: 'border-amber-500/30' },
  'Difficult': { bg: 'bg-rose-500/15', text: 'text-rose-600', border: 'border-rose-500/30' }
};

const VISIBILITY_ICONS: Record<string, React.ReactNode> = {
  'Highly Visible': <Eye size={12} className="text-amber-500" />,
  'Stable': <Minus size={12} className="text-sky-500" />,
  'Behind the Scenes': <EyeOff size={12} className="text-violet-500" />
};

export const PlanetaryConditionDashboard: React.FC<PlanetaryConditionDashboardProps> = ({ conditions }) => {
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null);

  // Group by quality
  const wellPlaced = conditions.filter(c => c.qualityRating === 'Excellent' || c.qualityRating === 'Good');
  const moderate = conditions.filter(c => c.qualityRating === 'Moderate');
  const challenged = conditions.filter(c => c.qualityRating === 'Challenged' || c.qualityRating === 'Difficult');

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Star size={16} className="text-primary" />
            Planetary Condition Dashboard
          </CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp size={12} className="text-emerald-500" />
              {wellPlaced.length} strong
            </span>
            <span className="flex items-center gap-1">
              <TrendingDown size={12} className="text-amber-500" />
              {challenged.length} challenged
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Ranked by overall condition — essential dignity, house placement, sect, and aspects
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Planet List */}
        {conditions.map((condition) => {
          const colors = QUALITY_COLORS[condition.qualityRating];
          const isExpanded = expandedPlanet === condition.planet;
          
          return (
            <Collapsible
              key={condition.planet}
              open={isExpanded}
              onOpenChange={(open) => setExpandedPlanet(open ? condition.planet : null)}
            >
              <CollapsibleTrigger asChild>
                <div 
                  className={`flex items-center gap-3 p-3 rounded-sm border cursor-pointer hover:bg-muted/50 transition-colors ${colors.border} ${colors.bg}`}
                >
                  {/* Planet Symbol & Name */}
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <span className="text-xl">{PLANET_SYMBOLS[condition.planet] || '⚫'}</span>
                    <div>
                      <div className="font-medium text-sm">{condition.planet}</div>
                      <div className="text-xs text-muted-foreground">
                        {condition.sign} {condition.house && `• H${condition.house}`}
                      </div>
                    </div>
                  </div>
                  
                  {/* Score Bar */}
                  <div className="flex-1 max-w-[200px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            condition.totalScore >= 5 ? 'bg-emerald-500' :
                            condition.totalScore >= 2 ? 'bg-sky-500' :
                            condition.totalScore >= 0 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ 
                            width: `${Math.max(10, Math.min(100, ((condition.totalScore + 5) / 15) * 100))}%` 
                          }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${colors.text}`}>
                        {condition.totalScore > 0 ? '+' : ''}{condition.totalScore}
                      </span>
                    </div>
                  </div>
                  
                  {/* Quality Badge */}
                  <Badge 
                    variant="outline" 
                    className={`${colors.text} ${colors.border} text-xs font-normal`}
                  >
                    {condition.qualityRating}
                  </Badge>
                  
                  {/* Visibility */}
                  <div className="flex items-center gap-1" title={condition.visibility}>
                    {VISIBILITY_ICONS[condition.visibility]}
                  </div>
                  
                  {/* Expand Icon */}
                  <div className="text-muted-foreground">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className={`mt-1 p-4 rounded-sm border ${colors.border} bg-card space-y-4`}>
                  {/* Score Breakdown */}
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="p-2 bg-muted/30 rounded">
                      <div className="text-xs text-muted-foreground">Essential</div>
                      <div className={`text-sm font-medium ${condition.essentialDignityScore >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {condition.essentialDignityScore >= 0 ? '+' : ''}{condition.essentialDignityScore}
                      </div>
                    </div>
                    <div className="p-2 bg-muted/30 rounded">
                      <div className="text-xs text-muted-foreground">Accidental</div>
                      <div className={`text-sm font-medium ${condition.accidentalDignityScore >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {condition.accidentalDignityScore >= 0 ? '+' : ''}{condition.accidentalDignityScore}
                      </div>
                    </div>
                    <div className="p-2 bg-muted/30 rounded">
                      <div className="text-xs text-muted-foreground">Sect</div>
                      <div className={`text-sm font-medium ${condition.sectScore >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {condition.sectScore >= 0 ? '+' : ''}{condition.sectScore}
                      </div>
                    </div>
                    <div className="p-2 bg-muted/30 rounded">
                      <div className="text-xs text-muted-foreground">Aspects</div>
                      <div className={`text-sm font-medium ${condition.aspectScore >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {condition.aspectScore >= 0 ? '+' : ''}{condition.aspectScore}
                      </div>
                    </div>
                  </div>
                  
                  {/* Dignity Details */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="secondary" className={
                      condition.essentialDignity === 'rulership' ? 'bg-emerald-500/20 text-emerald-700' :
                      condition.essentialDignity === 'exaltation' ? 'bg-sky-500/20 text-sky-700' :
                      condition.essentialDignity === 'detriment' ? 'bg-amber-500/20 text-amber-700' :
                      condition.essentialDignity === 'fall' ? 'bg-rose-500/20 text-rose-700' :
                      'bg-muted text-muted-foreground'
                    }>
                      {condition.essentialDignity.charAt(0).toUpperCase() + condition.essentialDignity.slice(1)}
                    </Badge>
                    {condition.hasTriplicityDignity && (
                      <Badge variant="secondary" className="bg-sky-500/10 text-sky-600">
                        Triplicity
                      </Badge>
                    )}
                    {condition.hasTermDignity && (
                      <Badge variant="secondary" className="bg-violet-500/10 text-violet-600">
                        Terms
                      </Badge>
                    )}
                    {condition.hasDecanDignity && (
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                        Decan
                      </Badge>
                    )}
                    {condition.isInSect && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        In Sect
                      </Badge>
                    )}
                  </div>
                  
                  {/* Interpretation */}
                  <p className="text-sm text-foreground leading-relaxed">
                    {condition.traditionalInterpretation}
                  </p>
                  
                  {/* Strengths & Challenges */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {condition.strengthFactors.length > 0 && (
                      <div>
                        <h5 className="text-xs font-medium text-emerald-600 mb-2 flex items-center gap-1">
                          <TrendingUp size={12} />
                          Strengths
                        </h5>
                        <ul className="space-y-1">
                          {condition.strengthFactors.map((factor, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-emerald-500 mt-0.5">✓</span>
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {condition.challengeFactors.length > 0 && (
                      <div>
                        <h5 className="text-xs font-medium text-amber-600 mb-2 flex items-center gap-1">
                          <TrendingDown size={12} />
                          Growth Edges
                        </h5>
                        <ul className="space-y-1">
                          {condition.challengeFactors.map((factor, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-amber-500 mt-0.5">⚡</span>
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default PlanetaryConditionDashboard;

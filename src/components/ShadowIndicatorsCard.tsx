import { useState } from 'react';
import { AlertTriangle, Shield, ChevronDown, ChevronUp, Heart, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ShadowIndicator, ShadowAnalysis, RiskLevel } from '@/lib/shadowIndicators';

interface ShadowIndicatorsCardProps {
  analysis: ShadowAnalysis;
  chart1Name: string;
  chart2Name: string;
}

const getRiskBadge = (level: RiskLevel) => {
  switch (level) {
    case 'significant':
      return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">Significant</Badge>;
    case 'caution':
      return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Caution</Badge>;
    case 'watch':
      return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Watch</Badge>;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'power-control': return '👑';
    case 'manipulation': return '🎭';
    case 'codependency': return '🔗';
    case 'boundary': return '🚧';
    case 'rage': return '🌋';
    case 'addiction': return '⚗️';
    default: return '⚡';
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'power-control': return 'Power & Control';
    case 'manipulation': return 'Manipulation Risk';
    case 'codependency': return 'Codependency';
    case 'boundary': return 'Boundary Issues';
    case 'rage': return 'Anger Dynamics';
    case 'addiction': return 'Addiction Enabling';
    default: return 'Shadow Pattern';
  }
};

const IndicatorCard = ({ indicator }: { indicator: ShadowIndicator }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="p-3 rounded-lg border border-border hover:border-amber-300 dark:hover:border-amber-700 bg-card cursor-pointer transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <span className="text-lg">{getCategoryIcon(indicator.category)}</span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{indicator.name}</span>
                  {getRiskBadge(indicator.riskLevel)}
                </div>
                {/* Show planet ownership if available */}
                {indicator.planetOwnership && (
                  <p className="text-xs font-medium text-primary mt-1">
                    {indicator.planetOwnership.planet1Owner}'s {indicator.planetOwnership.planet1} → {indicator.planetOwnership.planet2Owner}'s {indicator.planetOwnership.planet2}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">{indicator.description}</p>
              </div>
            </div>
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-2 p-4 rounded-lg bg-secondary/30 space-y-4">
          {/* HEALTHY EXPRESSION FIRST - emphasize the positive potential */}
          <div className="p-3 rounded-lg bg-green-50/50 dark:bg-green-950/20 border-2 border-green-300 dark:border-green-800">
            <h5 className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Heart size={12} />
              ✨ Healthy Expression (The Gift)
            </h5>
            <p className="text-sm text-green-800 dark:text-green-200">{indicator.healthyExpression}</p>
          </div>

          {/* Dynamic Explanation */}
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              How This Pattern Can Manifest
            </h5>
            <p className="text-sm">{indicator.dynamicExplanation}</p>
          </div>

          {/* Warning Behaviors */}
          <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
            <h5 className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1">
              <AlertCircle size={12} />
              Signs It's Moving Toward Shadow
            </h5>
            <ul className="text-sm space-y-1">
              {indicator.warningBehaviors.map((behavior, i) => (
                <li key={i} className="flex items-start gap-2 text-amber-800 dark:text-amber-200">
                  <span className="shrink-0">•</span>
                  <span>{behavior}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Healing Path */}
          <div className="p-3 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/30">
            <h5 className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Shield size={12} />
              Path to Conscious Expression
            </h5>
            <p className="text-sm text-purple-800 dark:text-purple-200">{indicator.healingPath}</p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export const ShadowIndicatorsCard = ({ analysis, chart1Name, chart2Name }: ShadowIndicatorsCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (analysis.overallRiskLevel === 'low' && analysis.indicators.length === 0) {
    return null;
  }

  const getOverallBadge = () => {
    switch (analysis.overallRiskLevel) {
      case 'significant':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">Significant Patterns</Badge>;
      case 'caution':
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Caution Advised</Badge>;
      case 'watch':
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Minor Patterns</Badge>;
      default:
        return null;
    }
  };

  const groupedByCategory = analysis.indicators.reduce((acc, indicator) => {
    if (!acc[indicator.category]) {
      acc[indicator.category] = [];
    }
    acc[indicator.category].push(indicator);
    return acc;
  }, {} as Record<string, ShadowIndicator[]>);

  return (
    <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-sm flex items-center gap-2">
              Shadow Dynamics
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info size={14} className="text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      These are energetic patterns that may require conscious awareness. They are not predictions—all patterns can be transformed with consciousness.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h3>
            <p className="text-xs text-muted-foreground">{chart1Name} & {chart2Name}</p>
          </div>
        </div>
        {getOverallBadge()}
      </div>

      {/* Summary */}
      <p className="text-sm mb-4">{analysis.summary}</p>

      {/* Collapsible Detail Section */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-2 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors text-sm">
            <span className="flex items-center gap-2">
              <Shield size={14} />
              {analysis.indicators.length} Pattern{analysis.indicators.length !== 1 ? 's' : ''} Identified
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">View details</span>
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-4 space-y-4">
            {Object.entries(groupedByCategory).map(([category, indicators]) => (
              <div key={category}>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                  {getCategoryIcon(category)} {getCategoryLabel(category)}
                </h4>
                <div className="space-y-2">
                  {indicators.map((indicator, i) => (
                    <IndicatorCard key={i} indicator={indicator} />
                  ))}
                </div>
              </div>
            ))}

            {/* Important Disclaimer */}
            <Alert className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
              <Info className="h-4 w-4" />
              <AlertTitle className="text-sm">Important Context</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                {analysis.disclaimer}
              </AlertDescription>
            </Alert>

            {/* Resources Link - safety-focused, no couples therapy recommendation */}
            {analysis.overallRiskLevel === 'significant' && (
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Your safety comes first.</strong> If any of these patterns feel concerning:
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a 
                    href="https://www.thehotline.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    National Domestic Violence Hotline (1-800-799-7233) <ExternalLink size={10} />
                  </a>
                  <span className="text-xs text-muted-foreground">|</span>
                  <a 
                    href="https://www.psychologytoday.com/us/therapists" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    Find Individual Support <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
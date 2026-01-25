import { useState } from 'react';
import { AlertTriangle, Shield, ShieldCheck, ShieldAlert, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

export type SafetyLevel = 'high_risk' | 'moderate_risk' | 'low_risk' | 'safe';

export interface DangerIndicator {
  type: string;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  description: string;
  mitigation: string;
}

export interface SafetyAssessment {
  safetyLevel: SafetyLevel;
  riskScore: number;
  dangerIndicators: DangerIndicator[];
  greenFlags: string[];
  proceedWithCaution: boolean;
  professionalSupportRecommended: boolean;
}

interface SafetyAssessmentCardProps {
  assessment: SafetyAssessment;
  chart1Name: string;
  chart2Name: string;
}

const safetyConfig: Record<SafetyLevel, { 
  icon: React.ReactNode; 
  color: string; 
  bgColor: string; 
  borderColor: string;
  label: string;
  description: string;
}> = {
  high_risk: {
    icon: <ShieldAlert size={28} />,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive',
    label: 'High Risk',
    description: 'Multiple concerning patterns detected. Professional guidance strongly recommended.'
  },
  moderate_risk: {
    icon: <AlertTriangle size={28} />,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-400',
    label: 'Moderate Risk',
    description: 'Some challenging dynamics present. Proceed with awareness and clear boundaries.'
  },
  low_risk: {
    icon: <Shield size={28} />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-400',
    label: 'Low Risk',
    description: 'Minor growth areas to navigate. Generally healthy connection.'
  },
  safe: {
    icon: <ShieldCheck size={28} />,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    borderColor: 'border-green-400',
    label: 'Safe',
    description: 'Healthy connection with strong green flags. Foundation for growth.'
  }
};

const severityColors: Record<DangerIndicator['severity'], string> = {
  critical: 'bg-destructive text-destructive-foreground',
  high: 'bg-red-500 text-white',
  moderate: 'bg-amber-500 text-white',
  low: 'bg-yellow-500 text-black'
};

export const SafetyAssessmentCard = ({ assessment, chart1Name, chart2Name }: SafetyAssessmentCardProps) => {
  const [showDetails, setShowDetails] = useState(assessment.safetyLevel === 'high_risk');
  const config = safetyConfig[assessment.safetyLevel];
  
  return (
    <div className={`rounded-xl border-2 ${config.borderColor} ${config.bgColor} overflow-hidden`}>
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className={`${config.color} flex-shrink-0`}>
            {config.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className={`text-xl font-semibold ${config.color}`}>
                {config.label}
              </h3>
              <Badge variant="outline" className="font-mono">
                {100 - assessment.riskScore}% Safety Score
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
            
            {/* Risk Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Risk Level</span>
                <span>{assessment.riskScore}%</span>
              </div>
              <Progress 
                value={assessment.riskScore} 
                className={`h-2 ${
                  assessment.riskScore >= 60 ? '[&>div]:bg-destructive' :
                  assessment.riskScore >= 40 ? '[&>div]:bg-amber-500' :
                  assessment.riskScore >= 20 ? '[&>div]:bg-yellow-500' :
                  '[&>div]:bg-green-500'
                }`}
              />
            </div>
          </div>
        </div>
        
        {/* Critical Warnings - Always visible for high/moderate risk */}
        {assessment.safetyLevel !== 'safe' && assessment.safetyLevel !== 'low_risk' && (
          <div className="mt-4 p-4 rounded-lg bg-background/80 border">
            {assessment.professionalSupportRecommended && (
              <div className="flex items-center gap-2 text-sm font-medium text-destructive mb-2">
                <AlertCircle size={16} />
                Professional support recommended before deepening this connection
              </div>
            )}
            {assessment.proceedWithCaution && !assessment.professionalSupportRecommended && (
              <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                <AlertTriangle size={16} />
                Proceed with clear boundaries and self-awareness
              </div>
            )}
          </div>
        )}
        
        {/* Green Flags for safe relationships */}
        {(assessment.safetyLevel === 'safe' || assessment.safetyLevel === 'low_risk') && assessment.greenFlags.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-green-100/50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300 mb-2">
              <Heart size={16} />
              Green Flags Detected
            </div>
            <ul className="space-y-1">
              {assessment.greenFlags.map((flag, i) => (
                <li key={i} className="text-sm text-green-700 dark:text-green-300 flex items-start gap-2">
                  <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" />
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Expandable Details */}
      {(assessment.dangerIndicators.length > 0 || assessment.greenFlags.length > 0) && (
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <CollapsibleTrigger className="w-full px-6 py-3 border-t bg-background/50 hover:bg-background/80 transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground">
            {showDetails ? (
              <>
                <ChevronUp size={16} />
                Hide detailed analysis
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                View detailed analysis ({assessment.dangerIndicators.length} indicator{assessment.dangerIndicators.length !== 1 ? 's' : ''})
              </>
            )}
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-6 py-4 border-t bg-background/30 space-y-4">
              {/* Danger Indicators */}
              {assessment.dangerIndicators.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-3">Areas Requiring Awareness</h4>
                  <ScrollArea className="max-h-64">
                    <div className="space-y-3">
                      {assessment.dangerIndicators.map((indicator, i) => (
                        <div 
                          key={i} 
                          className="p-3 rounded-lg border bg-background"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={severityColors[indicator.severity]}>
                              {indicator.severity}
                            </Badge>
                            <span className="font-medium text-sm">{indicator.type}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {indicator.description}
                          </p>
                          <div className="text-xs text-primary border-t pt-2 mt-2">
                            <strong>Path Forward:</strong> {indicator.mitigation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              
              {/* Green Flags - for high/moderate risk, show what's working */}
              {assessment.greenFlags.length > 0 && (assessment.safetyLevel === 'high_risk' || assessment.safetyLevel === 'moderate_risk') && (
                <div className="p-4 rounded-lg bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-sm mb-2 text-green-700 dark:text-green-300">
                    ✨ What's Working
                  </h4>
                  <ul className="space-y-1">
                    {assessment.greenFlags.map((flag, i) => (
                      <li key={i} className="text-sm text-green-700 dark:text-green-300">
                        • {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

export default SafetyAssessmentCard;

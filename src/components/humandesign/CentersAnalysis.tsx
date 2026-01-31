import { HumanDesignChart } from '@/types/humanDesign';
import { CENTERS_DATA, HDCenterData } from '@/data/humanDesignCenters';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface CentersAnalysisProps {
  chart: HumanDesignChart;
}

export const CentersAnalysis = ({ chart }: CentersAnalysisProps) => {
  const allCenters = ['Head', 'Ajna', 'Throat', 'G', 'Heart', 'SolarPlexus', 'Sacral', 'Spleen', 'Root'];
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="font-serif text-xl">Your Centers</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {chart.definedCenters.length} Defined • {chart.undefinedCenters.length} Open
        </p>
      </div>

      <div className="space-y-3">
        {allCenters.map(centerName => {
          const centerData = CENTERS_DATA[centerName];
          const isDefined = chart.definedCenters.includes(centerName as any);
          
          if (!centerData) return null;
          
          return (
            <Collapsible key={centerName}>
              <CollapsibleTrigger className={`w-full p-4 rounded border text-left transition-colors hover:bg-muted/50 ${
                isDefined ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-4 w-4 rounded-full ${isDefined ? 'bg-primary' : 'border-2 border-muted-foreground'}`} />
                    <div>
                      <span className="font-medium">{centerData.name}</span>
                      <span className={`ml-2 text-xs ${isDefined ? 'text-primary' : 'text-muted-foreground'}`}>
                        {isDefined ? 'Defined' : 'Open'}
                      </span>
                    </div>
                  </div>
                  <ChevronDown size={16} className="text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{centerData.theme}</p>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="px-4 pb-4 pt-2 border-x border-b rounded-b border-border">
                {isDefined ? (
                  <DefinedCenterContent centerData={centerData} chart={chart} />
                ) : (
                  <UndefinedCenterContent centerData={centerData} />
                )}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};

const DefinedCenterContent = ({ centerData, chart }: { centerData: HDCenterData; chart: HumanDesignChart }) => {
  const activatedGates = chart.activatedGates?.filter(g => centerData.gates.includes(g.gate)) || [];
  
  return (
    <div className="space-y-4 text-sm">
      <div>
        <h4 className="font-medium text-primary mb-2">Consistent Energy</h4>
        <p className="text-muted-foreground">{centerData.defined.consistentEnergy}</p>
      </div>
      
      <div>
        <h4 className="font-medium mb-2">Gifts & Strengths</h4>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          {centerData.defined.gifts.map((gift, i) => <li key={i}>{gift}</li>)}
        </ul>
      </div>
      
      <div>
        <h4 className="font-medium mb-2">How to Use This Energy</h4>
        <p className="text-muted-foreground">{centerData.defined.howToUse}</p>
      </div>
      
      <div>
        <h4 className="font-medium text-amber-600 mb-2">Potential Shadow</h4>
        <p className="text-muted-foreground">{centerData.defined.shadow}</p>
      </div>
      
      {activatedGates.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Your Activated Gates Here</h4>
          <div className="flex flex-wrap gap-2">
            {activatedGates.map((g, i) => (
              <span key={i} className={`px-2 py-1 rounded text-xs ${g.isConscious ? 'bg-foreground/10' : 'bg-destructive/10 text-destructive'}`}>
                Gate {g.gate}.{g.line}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">{centerData.frequency} • {centerData.biologicalCorrelation}</p>
    </div>
  );
};

const UndefinedCenterContent = ({ centerData }: { centerData: HDCenterData }) => (
  <div className="space-y-4 text-sm">
    <div>
      <h4 className="font-medium text-blue-600 mb-2">Wisdom Potential</h4>
      <p className="text-muted-foreground">{centerData.undefined.wisdomPotential}</p>
    </div>
    
    <div>
      <h4 className="font-medium mb-2">Conditioning Patterns to Watch</h4>
      <ul className="list-disc list-inside text-muted-foreground space-y-1">
        {centerData.undefined.conditioningPatterns.map((p, i) => <li key={i}>{p}</li>)}
      </ul>
    </div>
    
    <div>
      <h4 className="font-medium mb-2">Questions This Center Asks</h4>
      <ul className="list-disc list-inside text-muted-foreground space-y-1">
        {centerData.undefined.questionsYouAsk.map((q, i) => <li key={i}>{q}</li>)}
      </ul>
    </div>
    
    <div>
      <h4 className="font-medium mb-2">Deconditioning Guidance</h4>
      <p className="text-muted-foreground">{centerData.undefined.howToAvoidConditioning}</p>
    </div>
    
    <div>
      <h4 className="font-medium text-amber-600 mb-2">Amplification Awareness</h4>
      <p className="text-muted-foreground">{centerData.undefined.amplificationAwareness}</p>
    </div>
    
    <p className="text-xs text-muted-foreground">{centerData.frequency} • {centerData.biologicalCorrelation}</p>
  </div>
);

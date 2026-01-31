import { HumanDesignChart } from '@/types/humanDesign';
import { TYPE_DATA, getTypeData } from '@/data/humanDesignTypes';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface TypeAnalysisProps {
  chart: HumanDesignChart;
}

export const TypeAnalysis = ({ chart }: TypeAnalysisProps) => {
  const typeData = getTypeData(chart.type);
  
  if (!typeData) {
    return <div className="text-muted-foreground">Type data not found for {chart.type}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Type Header */}
      <div className="text-center p-6 rounded border border-primary/30 bg-primary/5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Your Type</p>
        <h3 className="font-serif text-3xl text-primary">{chart.type}</h3>
        <p className="text-sm text-muted-foreground mt-2">{typeData.percentage}</p>
      </div>

      {/* Core Mechanics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded border border-border">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Strategy</p>
          <p className="font-medium">{typeData.strategy}</p>
        </div>
        <div className="p-4 rounded border border-border">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Signature</p>
          <p className="font-medium text-green-600">{typeData.signature.split(' - ')[0]}</p>
        </div>
        <div className="p-4 rounded border border-border col-span-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Not-Self Theme</p>
          <p className="font-medium text-amber-600">{typeData.notSelfTheme.split(' - ')[0]}</p>
        </div>
      </div>

      {/* Aura */}
      <div className="rounded border border-border p-4">
        <h4 className="font-medium mb-2">Your Aura</h4>
        <p className="text-sm text-muted-foreground">{typeData.auraDescription}</p>
      </div>

      {/* Strategy Detailed */}
      <div className="rounded border border-primary/30 bg-primary/5 p-4">
        <h4 className="font-medium text-primary mb-2">Strategy in Depth</h4>
        <p className="text-sm">{typeData.strategyDetailed}</p>
      </div>

      {/* Main Sections */}
      <Section title="How Your Energy Works" content={typeData.howEnergyWorks} />
      <Section title="Your Role in the World" content={typeData.roleInWorld} />
      <Section title="Decision Making" content={typeData.decisionMaking} />
      <Section title="Relationships" content={typeData.relationshipDynamics} />
      <Section title="Work & Career" content={typeData.workAndCareer} />
      <Section title="Health & Rest" content={typeData.healthAndRest} />

      {/* Conditioning */}
      <div className="rounded border border-amber-500/20 bg-amber-500/5 p-4">
        <h4 className="font-medium text-amber-600 mb-3">Common Conditioning</h4>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          {typeData.commonConditioning.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      </div>

      {/* Deconditioning */}
      <div className="rounded border border-border p-4">
        <h4 className="font-medium mb-3">Deconditioning Practices</h4>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          {typeData.deconditioningPractices.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      </div>

      {/* Success Indicators */}
      <div className="rounded border border-green-500/20 bg-green-500/5 p-4">
        <h4 className="font-medium text-green-600 mb-3">Success Indicators</h4>
        <ul className="list-disc list-inside text-sm space-y-1">
          {typeData.successIndicators.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>

      {/* Specific Guidance Collapsibles */}
      {typeData.specificGuidance.map((section, i) => (
        <Collapsible key={i}>
          <CollapsibleTrigger className="w-full p-4 rounded border border-border text-left hover:bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="font-medium">{section.title}</span>
              <ChevronDown size={16} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 border-x border-b rounded-b">
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              {section.points.map((p, j) => <li key={j}>{p}</li>)}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};

const Section = ({ title, content }: { title: string; content: string }) => (
  <div className="rounded border border-border p-4">
    <h4 className="font-medium mb-2">{title}</h4>
    <p className="text-sm text-muted-foreground">{content}</p>
  </div>
);

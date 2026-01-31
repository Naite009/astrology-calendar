import { HumanDesignChart } from '@/types/humanDesign';
import { PROFILE_DATA, LINE_DESCRIPTIONS, getProfileData } from '@/data/humanDesignProfiles';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface ProfileAnalysisProps {
  chart: HumanDesignChart;
}

export const ProfileAnalysis = ({ chart }: ProfileAnalysisProps) => {
  const profileData = getProfileData(chart.profile);
  
  if (!profileData) {
    return <div className="text-muted-foreground">Profile data not found for {chart.profile}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="text-center p-6 rounded border border-primary/30 bg-primary/5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Your Profile</p>
        <h3 className="font-serif text-2xl text-primary">{chart.profile}</h3>
        <p className="text-lg">{profileData.name}</p>
      </div>

      {/* Line Meanings */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded border border-foreground/20 bg-foreground/5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Conscious (Personality)</p>
          <p className="font-medium">Line {profileData.lines.conscious} - {profileData.lines.consciousName}</p>
          <p className="text-sm text-muted-foreground mt-2">What you identify with</p>
        </div>
        <div className="p-4 rounded border border-destructive/20 bg-destructive/5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Unconscious (Design)</p>
          <p className="font-medium">Line {profileData.lines.unconscious} - {profileData.lines.unconsciousName}</p>
          <p className="text-sm text-muted-foreground mt-2">What others experience</p>
        </div>
      </div>

      {/* Profile Details */}
      <div className="space-y-4">
        <Section title="Overview" content={profileData.overview} />
        <Section title="Life Theme & Trajectory" content={`${profileData.lifeTheme}\n\n${profileData.trajectory}`} />
        <Section title="How Your Lines Work Together" content={profileData.howLinesWorkTogether} />
        <Section title="Relationship Patterns" content={profileData.relationshipPatterns} />
        <Section title="Career & Life Purpose" content={profileData.careerThemes} />
        
        <div className="rounded border border-border p-4">
          <h4 className="font-medium mb-2">Common Conditioning</h4>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {profileData.commonConditioning.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
        
        <div className="rounded border border-border p-4">
          <h4 className="font-medium mb-2">Deconditioning Practices</h4>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {profileData.deconditioningPractices.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
        
        {profileData.specialNotes && (
          <div className="rounded border border-primary/30 bg-primary/5 p-4">
            <h4 className="font-medium text-primary mb-2">Special Notes</h4>
            <p className="text-sm">{profileData.specialNotes}</p>
          </div>
        )}
      </div>

      {/* 6 Lines Education */}
      <Collapsible>
        <CollapsibleTrigger className="w-full p-4 rounded border border-border text-left hover:bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="font-medium">Learn About the 6 Lines</span>
            <ChevronDown size={16} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4 border-x border-b rounded-b space-y-4">
          {Object.entries(LINE_DESCRIPTIONS).map(([num, line]) => (
            <div key={num} className="pb-3 border-b border-border last:border-0">
              <h5 className="font-medium">Line {num}: {line.name}</h5>
              <p className="text-xs text-primary mb-1">{line.theme}</p>
              <p className="text-sm text-muted-foreground">{line.description}</p>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

const Section = ({ title, content }: { title: string; content: string }) => (
  <div className="rounded border border-border p-4">
    <h4 className="font-medium mb-2">{title}</h4>
    <p className="text-sm text-muted-foreground whitespace-pre-line">{content}</p>
  </div>
);

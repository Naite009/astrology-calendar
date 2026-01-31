import { HumanDesignChart } from '@/types/humanDesign';
import { AUTHORITY_DATA, getAuthorityData } from '@/data/humanDesignAuthorities';

interface AuthorityGuideProps {
  chart: HumanDesignChart;
}

export const AuthorityGuide = ({ chart }: AuthorityGuideProps) => {
  const authorityData = getAuthorityData(chart.authority);
  
  if (!authorityData) {
    return <div className="text-muted-foreground">Authority data not found for {chart.authority}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Authority Header */}
      <div className="text-center p-6 rounded border border-primary/30 bg-primary/5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Your Authority</p>
        <h3 className="font-serif text-2xl text-primary">{chart.authority}</h3>
        <p className="text-sm text-muted-foreground mt-1">{authorityData.center}</p>
      </div>

      {/* Overview */}
      <div className="rounded border border-border p-4">
        <p className="text-sm">{authorityData.overview}</p>
      </div>

      {/* How It Works */}
      <Section title="How It Works" content={authorityData.howItWorks} />

      {/* Decision Process */}
      <div className="rounded border border-border p-4">
        <h4 className="font-medium mb-3">Decision-Making Process</h4>
        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
          {authorityData.decisionProcess.map((step, i) => <li key={i}>{step}</li>)}
        </ol>
      </div>

      {/* Timeline */}
      <div className="rounded border border-primary/20 bg-primary/5 p-4">
        <h4 className="font-medium text-primary mb-2">Timeline</h4>
        <p className="text-sm">{authorityData.timeline}</p>
      </div>

      {/* What It Feels Like */}
      <Section title="What It Feels Like" content={authorityData.whatItFeelsLike} />

      {/* Practice Exercises */}
      <div className="rounded border border-border p-4">
        <h4 className="font-medium mb-3">Practice Exercises</h4>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
          {authorityData.practiceExercises.map((ex, i) => <li key={i}>{ex}</li>)}
        </ul>
      </div>

      {/* Common Mistakes */}
      <div className="rounded border border-amber-500/20 bg-amber-500/5 p-4">
        <h4 className="font-medium text-amber-600 mb-3">Common Mistakes</h4>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          {authorityData.commonMistakes.map((m, i) => <li key={i}>{m}</li>)}
        </ul>
      </div>

      {/* Questions to Ask */}
      <div className="rounded border border-border p-4">
        <h4 className="font-medium mb-3">Questions to Ask Yourself</h4>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          {authorityData.questionsToAsk.map((q, i) => <li key={i}>{q}</li>)}
        </ul>
      </div>

      {/* Integration with Strategy */}
      <div className="rounded border border-primary/30 bg-primary/5 p-4">
        <h4 className="font-medium text-primary mb-2">Strategy + Authority Integration</h4>
        <p className="text-sm">{authorityData.integrationWithStrategy}</p>
      </div>
    </div>
  );
};

const Section = ({ title, content }: { title: string; content: string }) => (
  <div className="rounded border border-border p-4">
    <h4 className="font-medium mb-2">{title}</h4>
    <p className="text-sm text-muted-foreground">{content}</p>
  </div>
);

import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { buildYearStory } from '@/lib/solarReturnYearStory';
import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  analysis: SolarReturnAnalysis;
  year?: number;
}

/**
 * The synthesis that comes BEFORE the detail sections: what the year is about,
 * the themes ranked by how many independent chart signatures point to them,
 * and one question to carry through the year.
 */
export const YearStoryPanel = ({ analysis, year }: Props) => {
  const story = useMemo(() => buildYearStory(analysis), [analysis]);

  return (
    <div className="space-y-4">
      <div className="border border-primary/30 rounded-sm p-5 bg-card">
        <h3 className="text-sm uppercase tracking-widest font-medium text-foreground mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          The Story of Your Year{year ? ` — ${year}` : ''}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{story.coreStory}</p>
      </div>

      {story.themes.length > 0 && (
        <div className="border border-border rounded-sm p-5 bg-card space-y-4">
          <div>
            <h4 className="text-sm uppercase tracking-widest font-medium text-foreground">
              The Themes, in Order of Weight
            </h4>
            <p className="text-[11px] text-muted-foreground mt-1">
              Ranked by how many independent chart signatures point to them, not by how many aspects they collect.
            </p>
          </div>
          {story.themes.map((theme, i) => (
            <div key={theme.key} className="border-l-2 border-primary/40 pl-3">
              <p className="text-sm font-medium text-foreground">
                {i + 1}. {theme.title}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">{theme.summary}</p>
              {theme.signatures.length > 0 && (
                <p className="text-[11px] text-muted-foreground/80 mt-2">
                  <span className="uppercase tracking-widest">Why: </span>
                  {theme.signatures.join(' ')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {story.hierarchy.length > 0 && (
        <div className="border border-border rounded-sm p-5 bg-card">
          <h4 className="text-sm uppercase tracking-widest font-medium text-foreground mb-3">
            What the Chart Emphasises Most
          </h4>
          <ul className="space-y-2">
            {story.hierarchy.map(row => (
              <li key={row.label} className="text-sm text-muted-foreground leading-relaxed">
                <span className="text-foreground font-medium">{row.label}: </span>
                {row.detail}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border border-border rounded-sm p-5 bg-card space-y-3">
        <h4 className="text-sm uppercase tracking-widest font-medium text-foreground">What You Need to Know</h4>
        {story.whatYouNeedToKnow.map(item => (
          <div key={item.heading}>
            <p className="text-xs uppercase tracking-widest text-primary">{item.heading}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1">{item.body}</p>
          </div>
        ))}
        <div className="pt-3 border-t border-border">
          <p className="text-xs uppercase tracking-widest text-primary">One question to carry through the year</p>
          <p className="text-base text-foreground leading-relaxed mt-1 font-serif">{story.reflectionQuestion}</p>
        </div>
      </div>
    </div>
  );
};

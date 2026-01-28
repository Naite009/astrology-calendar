import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface ContextTagsPanelProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  tagLabels: Record<string, string>;
}

export const ContextTagsPanel = ({ 
  selectedTags, 
  onTagsChange, 
  tagLabels 
}: ContextTagsPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-secondary/30 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Context Tags</span>
          <span className="text-xs text-muted-foreground">(optional)</span>
          {selectedTags.length > 0 && (
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              {selectedTags.length} selected
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Select any areas that apply to help personalize the interpretation. This is entirely optional.
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(tagLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => toggleTag(key)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                  selectedTags.includes(key)
                    ? key === 'safety'
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/50'
                      : 'bg-primary/20 text-primary border border-primary/50'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80 border border-transparent'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Element Self-Assessment Questions from Debra Silverman Level 1 Handbook

import { useState } from 'react';
import { ChevronDown, ClipboardList } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { getElementTeaching, ElementTeaching } from '@/lib/elementTeachings';

interface ElementSelfAssessmentProps {
  elements: string[];
  title?: string;
}

export const ElementSelfAssessment = ({ elements, title = "Element Self-Assessment" }: ElementSelfAssessmentProps) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  const toggleItem = (key: string) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const getElementScore = (element: string): { checked: number; total: number } => {
    const teaching = getElementTeaching(element);
    if (!teaching) return { checked: 0, total: 0 };
    
    const totalQuestions = teaching.selfAssessment.length;
    const checked = teaching.selfAssessment.filter((_, i) => 
      checkedItems[`${element}-${i}`]
    ).length;
    
    return { checked, total: totalQuestions };
  };
  
  const elementColors: Record<string, { bg: string; border: string; text: string }> = {
    Fire: { bg: 'from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-400' },
    Earth: { bg: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30', border: 'border-green-200 dark:border-green-800', text: 'text-green-700 dark:text-green-400' },
    Air: { bg: 'from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30', border: 'border-sky-200 dark:border-sky-800', text: 'text-sky-700 dark:text-sky-400' },
    Water: { bg: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-400' }
  };
  
  return (
    <details className="group">
      <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2">
        <ClipboardList size={16} />
        <span>{title}</span>
        <ChevronDown size={16} className="group-open:rotate-180 transition-transform ml-auto" />
      </summary>
      <div className="mt-4 space-y-6">
        <p className="text-sm text-muted-foreground italic">
          Check each statement that resonates with you. This helps identify elemental patterns and where to focus during the reading.
        </p>
        
        {elements.map(element => {
          const teaching = getElementTeaching(element);
          if (!teaching) return null;
          
          const colors = elementColors[element];
          const score = getElementScore(element);
          
          return (
            <div key={element} className={`bg-gradient-to-r ${colors.bg} p-5 rounded-lg border ${colors.border}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className={`font-medium ${colors.text} flex items-center gap-2`}>
                  {element === 'Fire' && '🔥'}
                  {element === 'Earth' && '🌍'}
                  {element === 'Air' && '💨'}
                  {element === 'Water' && '💧'}
                  {element} Element Assessment
                </h4>
                <span className="text-sm text-muted-foreground">
                  {score.checked} / {score.total} checked
                </span>
              </div>
              
              <div className="space-y-3">
                {teaching.selfAssessment.map((question, i) => {
                  const key = `${element}-${i}`;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <Checkbox 
                        id={key}
                        checked={checkedItems[key] || false}
                        onCheckedChange={() => toggleItem(key)}
                        className="mt-0.5"
                      />
                      <label 
                        htmlFor={key}
                        className={`text-sm cursor-pointer ${checkedItems[key] ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {question}
                      </label>
                    </div>
                  );
                })}
              </div>
              
              {/* Interpretation based on score */}
              <div className="mt-4 pt-3 border-t border-current/10">
                {score.checked >= 7 && (
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                    ✓ Strong {element} identification ({score.checked}/10) — This element is a dominant force in your nature.
                  </p>
                )}
                {score.checked >= 4 && score.checked < 7 && (
                  <p className="text-sm text-muted-foreground">
                    Moderate {element} traits ({score.checked}/10) — {element} influences are present but balanced with other elements.
                  </p>
                )}
                {score.checked < 4 && (
                  <p className="text-sm text-rose-700 dark:text-rose-400">
                    Low {element} identification ({score.checked}/10) — This element may be an area for growth.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </details>
  );
};

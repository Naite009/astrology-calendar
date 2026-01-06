// Element Stories and Quotes from Debra Silverman Level 1 Handbook

import { Flame, Mountain, Wind, Droplets, Quote } from 'lucide-react';
import { getElementTeaching } from '@/lib/elementTeachings';

interface ElementStoryCardProps {
  element: string;
  showExercises?: boolean;
}

const ElementIcon = ({ element, size = 20 }: { element: string; size?: number }) => {
  switch (element) {
    case 'Fire': return <Flame className="text-orange-500" size={size} />;
    case 'Earth': return <Mountain className="text-green-700" size={size} />;
    case 'Air': return <Wind className="text-sky-500" size={size} />;
    case 'Water': return <Droplets className="text-blue-500" size={size} />;
    default: return null;
  }
};

export const ElementStoryCard = ({ element, showExercises = true }: ElementStoryCardProps) => {
  const teaching = getElementTeaching(element);
  if (!teaching) return null;
  
  const elementColors: Record<string, { bg: string; border: string; accent: string }> = {
    Fire: { bg: 'from-orange-50 via-red-50 to-amber-50 dark:from-orange-950/40 dark:via-red-950/40 dark:to-amber-950/40', border: 'border-orange-300 dark:border-orange-700', accent: 'text-orange-700 dark:text-orange-300' },
    Earth: { bg: 'from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/40 dark:via-emerald-950/40 dark:to-teal-950/40', border: 'border-green-300 dark:border-green-700', accent: 'text-green-700 dark:text-green-300' },
    Air: { bg: 'from-sky-50 via-blue-50 to-indigo-50 dark:from-sky-950/40 dark:via-blue-950/40 dark:to-indigo-950/40', border: 'border-sky-300 dark:border-sky-700', accent: 'text-sky-700 dark:text-sky-300' },
    Water: { bg: 'from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-violet-950/40', border: 'border-blue-300 dark:border-blue-700', accent: 'text-blue-700 dark:text-blue-300' }
  };
  
  const colors = elementColors[element];
  
  return (
    <div className={`bg-gradient-to-br ${colors.bg} p-6 rounded-xl border ${colors.border} shadow-sm`}>
      {/* Header with Element */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-white/50 dark:bg-black/30 flex items-center justify-center">
          <ElementIcon element={element} size={28} />
        </div>
        <div>
          <h3 className={`font-serif text-xl font-medium ${colors.accent}`}>The Story of {element}</h3>
          <p className="text-sm text-muted-foreground">{teaching.signs.join(' • ')}</p>
        </div>
      </div>
      
      {/* Quote */}
      <div className="relative bg-white/60 dark:bg-black/40 p-4 rounded-lg mb-4">
        <Quote className={`absolute -top-2 -left-2 ${colors.accent} opacity-50`} size={24} />
        <p className="text-sm italic leading-relaxed pl-4">
          {teaching.quote}
        </p>
      </div>
      
      {/* Story */}
      <div className="mb-4">
        <h4 className={`text-sm font-medium ${colors.accent} mb-2`}>The Teaching Story</h4>
        <p className="text-sm leading-relaxed text-foreground/90">
          {teaching.story}
        </p>
      </div>
      
      {/* Gender Expression */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="bg-white/40 dark:bg-black/20 p-3 rounded-lg">
          <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
            {element} in Men
          </h5>
          <p className="text-sm">{teaching.menExpression}</p>
        </div>
        <div className="bg-white/40 dark:bg-black/20 p-3 rounded-lg">
          <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
            {element} in Women
          </h5>
          <p className="text-sm">{teaching.womenExpression}</p>
        </div>
      </div>
      
      {/* Exercises */}
      {showExercises && teaching.exercises.length > 0 && (
        <div className="bg-white/50 dark:bg-black/30 p-4 rounded-lg">
          <h4 className={`text-sm font-medium ${colors.accent} mb-2`}>{element} Self-Exercises</h4>
          <ul className="space-y-2">
            {teaching.exercises.map((exercise, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className={colors.accent}>•</span>
                <span>{exercise}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Element Blending (optional, could expand) */}
      <details className="mt-4 group">
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
          {element} with Other Elements...
        </summary>
        <div className="mt-2 space-y-2">
          {Object.entries(teaching.withOtherElements).map(([other, description]) => (
            <div key={other} className="bg-white/40 dark:bg-black/20 p-3 rounded text-sm">
              <span className="font-medium">{element} + {other}:</span> {description}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};

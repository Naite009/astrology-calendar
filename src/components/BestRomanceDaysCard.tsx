import { useMemo, useState } from 'react';
import { Heart, Sparkles, Calendar, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { getBestRomanceDays, getMoodEmoji, getRatingStars, RomanceDay } from '@/lib/bestRomanceDays';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface BestRomanceDaysCardProps {
  birthDate: Date | null;
  partnerBirthDate?: Date | null;
  days?: number;
}

const RomanceDayItem = ({ day, index }: { day: RomanceDay; index: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border border-pink-100 dark:border-pink-900/30 cursor-pointer hover:shadow-md transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {index + 1}
            </div>
            <div>
              <p className="font-medium text-sm">
                {format(day.date, 'EEEE, MMM d')}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span>{getMoodEmoji(day.romanticMood)}</span>
                <span className="capitalize">{day.romanticMood}</span>
                <span className="mx-1">•</span>
                <span>{day.moonPhase}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs text-amber-500 font-medium">
                {getRatingStars(day.rating)}
              </p>
              <p className="text-xs text-muted-foreground">
                Score: {day.score}
              </p>
            </div>
            {isOpen ? (
              <ChevronUp size={16} className="text-muted-foreground" />
            ) : (
              <ChevronDown size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </div>
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="mt-2 p-3 rounded-lg bg-card border border-border space-y-2">
          {/* Highlights */}
          {day.highlights.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Why this day:</p>
              <div className="flex flex-wrap gap-1">
                {day.highlights.map((h, i) => (
                  <Badge key={i} variant="secondary" className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300">
                    {h}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Best activities */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Best for:</p>
            <div className="flex flex-wrap gap-1">
              {day.bestFor.map((activity, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {activity}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Moon info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
            <span>🌙 Moon in {day.moonSign}</span>
            <span>💫 Biorhythm: {day.biorhythmEnergy}%</span>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export const BestRomanceDaysCard = ({ 
  birthDate, 
  partnerBirthDate,
  days = 30 
}: BestRomanceDaysCardProps) => {
  const romanceDays = useMemo(() => {
    if (!birthDate) return null;
    return getBestRomanceDays(birthDate, partnerBirthDate || null, new Date(), days);
  }, [birthDate, partnerBirthDate, days]);
  
  if (!birthDate) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-pink-200 dark:border-pink-800 bg-pink-50/50 dark:bg-pink-950/20">
        <div className="flex items-center gap-2 text-pink-500 mb-2">
          <Heart size={18} />
          <h3 className="font-medium">Best Romance Days</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Add your birth chart to see your best romance days
        </p>
      </div>
    );
  }
  
  if (!romanceDays) return null;
  
  return (
    <div className="p-4 rounded-xl border border-pink-200 dark:border-pink-800 bg-gradient-to-br from-pink-50/50 to-rose-50/50 dark:from-pink-950/20 dark:to-rose-950/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 text-white">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Best Romance Days</h3>
            <p className="text-xs text-muted-foreground">
              Top 5 in next {days} days {partnerBirthDate ? '(with partner)' : '(solo)'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-pink-500">
          <Calendar size={14} />
          <span>{format(romanceDays.period.start, 'MMM d')} - {format(romanceDays.period.end, 'MMM d')}</span>
        </div>
      </div>
      
      {/* Recommendation */}
      <div className="mb-4 p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-pink-100 dark:border-pink-900/30">
        <p className="text-sm text-foreground flex items-start gap-2">
          <Heart size={14} className="text-pink-500 mt-0.5 flex-shrink-0" />
          {romanceDays.recommendation}
        </p>
      </div>
      
      {/* Top Days List */}
      <div className="space-y-2">
        {romanceDays.topDays.map((day, index) => (
          <RomanceDayItem key={index} day={day} index={index} />
        ))}
      </div>
    </div>
  );
};

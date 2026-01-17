import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { getBirthConditions, BirthMoonPhaseData, SectData, TimeOfDayData } from '@/lib/birthConditions';
import { ELEMENT_TEACHINGS, ElementTeaching } from '@/lib/elementTeachings';
import { SIGN_PROPERTIES } from '@/lib/planetDignities';

interface BirthConditionsDisplayProps {
  chart: NatalChart;
}

export const BirthConditionsDisplay: React.FC<BirthConditionsDisplayProps> = ({ chart }) => {
  const conditions = getBirthConditions(chart);
  const { moonPhase, sect, timeOfDay } = conditions;
  
  // Get Moon's element
  const moonSign = chart.planets.Moon?.sign;
  const moonElement = moonSign ? SIGN_PROPERTIES[moonSign]?.element : null;
  const moonElementTeaching = moonElement ? ELEMENT_TEACHINGS[moonElement] : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-serif text-foreground">The Stage Was Set</h3>
        <p className="text-sm text-muted-foreground">
          These foundational conditions color your entire chart's expression
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Birth Moon Phase */}
        {moonPhase && (
          <MoonPhaseCard moonPhase={moonPhase} />
        )}

        {/* Day/Night Sect */}
        <SectCard sect={sect} />

        {/* Time of Day */}
        {timeOfDay && (
          <TimeOfDayCard timeOfDay={timeOfDay} />
        )}
      </div>

      {/* Quick Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4">
          <p className="text-sm text-foreground">
            <span className="font-medium">Your Birth Story: </span>
            You were born during a <span className="text-primary font-medium">{moonPhase?.phase || 'moon phase'}</span>
            {timeOfDay && <span> at <span className="text-primary font-medium">{timeOfDay.timeOfDay.replace('_', ' ')}</span></span>}
            , giving you a <span className="text-primary font-medium">{sect.sect} Chart</span>.
            {moonPhase && ` Your soul archetype is ${moonPhase.archetype}.`}
          </p>
        </CardContent>
      </Card>

      {/* Moon Element Section */}
      {moonSign && moonElement && moonElementTeaching && (
        <MoonElementCard 
          moonSign={moonSign} 
          element={moonElement} 
          teaching={moonElementTeaching} 
        />
      )}
    </div>
  );
};

// Moon Element Card - Full element teachings for the Moon
interface MoonElementCardProps {
  moonSign: string;
  element: string;
  teaching: ElementTeaching;
}

const MoonElementCard: React.FC<MoonElementCardProps> = ({ moonSign, element, teaching }) => {
  const [expanded, setExpanded] = useState(false);
  
  const elementColors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    Fire: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-500', icon: '🔥' },
    Earth: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-500', icon: '🌍' },
    Air: { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-500', icon: '💨' },
    Water: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-500', icon: '💧' }
  };
  
  const colors = elementColors[element] || elementColors.Water;

  return (
    <Card className={`${colors.bg} ${colors.border}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="text-2xl">{colors.icon}</span>
            Working with Your {element} Moon
          </CardTitle>
          <Badge variant="outline" className={`${colors.text} border-current`}>
            ☽ {moonSign}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quote */}
        <blockquote className="text-sm italic text-muted-foreground border-l-2 border-current pl-3" style={{ borderColor: colors.text.replace('text-', '') }}>
          "{teaching.quote}"
        </blockquote>

        {/* Core Emotional Nature */}
        <div>
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Your Emotional Nature ({element})
          </h4>
          <p className="text-sm text-foreground">
            {getMoonElementDescription(element)}
          </p>
        </div>

        {/* Key Permissions for the Moon */}
        <div>
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Permissions for Your {element} Moon
          </h4>
          <ul className="space-y-1.5">
            {teaching.permissions.slice(0, 4).map((permission, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className={`${colors.text} mt-0.5`}>✓</span>
                <span className="text-foreground">{permission}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Medicine for This Element */}
        <div className="bg-background/50 rounded-md p-3">
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Medicine for Your Moon
          </h4>
          <ul className="space-y-1.5">
            {teaching.medicine.slice(0, 2).map((med, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-0.5">💊</span>
                <span className="text-muted-foreground">{med}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Expand/Collapse for more */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setExpanded(!expanded)}
          className="w-full text-xs"
        >
          {expanded ? (
            <>Show Less <ChevronUp size={14} className="ml-1" /></>
          ) : (
            <>Show Full Element Teaching <ChevronDown size={14} className="ml-1" /></>
          )}
        </Button>

        {/* Expanded Content */}
        {expanded && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            {/* Themes */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                {element} Themes & Wisdom
              </h4>
              <ul className="space-y-2">
                {teaching.themes.map((theme, i) => (
                  <li key={i} className="text-sm text-foreground pl-4 border-l-2 border-primary/30">
                    {theme}
                  </li>
                ))}
              </ul>
            </div>

            {/* Shadows */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-amber-500 mb-2">
                {element} Shadow Side (Watch For)
              </h4>
              <ul className="space-y-1.5">
                {teaching.shadows.slice(0, 5).map((shadow, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-500 mt-0.5">⚠</span>
                    <span className="text-muted-foreground">{shadow}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Evolved State */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-emerald-500 mb-2">
                {element} at Its Best (Evolved Expression)
              </h4>
              <ul className="space-y-1.5">
                {teaching.evolved.map((ev, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-500 mt-0.5">✦</span>
                    <span className="text-foreground">{ev}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* All Permissions */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                All {element} Permissions
              </h4>
              <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
                {teaching.permissions.map((permission, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className={`${colors.text} mt-0.5 shrink-0`}>✓</span>
                    <span className="text-foreground">{permission}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Self-Exercises */}
            <div className="bg-background/50 rounded-md p-3">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Self-Inquiry Exercises for {element} Moons
              </h4>
              <ul className="space-y-2">
                {teaching.exercises.map((ex, i) => (
                  <li key={i} className="text-sm text-foreground italic">
                    {i + 1}. {ex}
                  </li>
                ))}
              </ul>
            </div>

            {/* All Medicine */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                All {element} Medicine
              </h4>
              <ul className="space-y-1.5">
                {teaching.medicine.map((med, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">💊</span>
                    <span className="text-muted-foreground">{med}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function for Moon element description
function getMoonElementDescription(element: string): string {
  const descriptions: Record<string, string> = {
    Water: 'Your emotional nature runs DEEP. You feel everything intensely—your own feelings and often others\' too. You need quiet, solitude, and safe spaces to process. Tears are your release valve. Music, water, and sacred spaces are your medicine. Your intuition is highly developed, but you must learn boundaries to prevent emotional overwhelm.',
    Fire: 'Your emotional nature is DYNAMIC. You need action, movement, and passion to feel alive. Stagnation is your enemy. You express emotions through doing, not discussing. You need physical outlets for feelings—movement, adventure, creativity. Your enthusiasm is contagious, but impatience and burnout are your shadows.',
    Air: 'Your emotional nature is MENTAL. You process feelings through thinking, talking, and understanding. You need to articulate your emotions to release them. Journaling, conversation, and mental stimulation are your medicine. You may intellectualize feelings rather than fully experiencing them—the work is dropping from head to heart.',
    Earth: 'Your emotional nature is GROUNDED. You need physical comfort, routine, and tangible security to feel safe. You process slowly and need time. Touch, nature, good food, and stable environments are your medicine. You may hold onto feelings too long—the work is learning to let things flow rather than crystallize.'
  };
  return descriptions[element] || 'Your emotional nature is unique and complex.';
}

// Sub-components
const MoonPhaseCard: React.FC<{ moonPhase: BirthMoonPhaseData }> = ({ moonPhase }) => (
  <Card className="h-full">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="text-2xl">{moonPhase.symbol}</span>
          Birth Moon Phase
        </CardTitle>
        <Badge variant="outline" className="text-xs">
          {moonPhase.illumination}% lit
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <div>
        <h4 className="font-serif text-lg text-foreground">{moonPhase.phase}</h4>
        <p className="text-xs text-primary font-medium">{moonPhase.archetype}</p>
      </div>
      
      <div className="space-y-2 text-xs">
        <div>
          <span className="text-muted-foreground font-medium">Soul Purpose:</span>
          <p className="text-foreground mt-0.5">{moonPhase.soulPurpose.split('.')[0]}.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
          <div>
            <span className="text-emerald-500 font-medium">Gift:</span>
            <p className="text-muted-foreground">{moonPhase.gift.split(',')[0]}</p>
          </div>
          <div>
            <span className="text-amber-500 font-medium">Challenge:</span>
            <p className="text-muted-foreground">{moonPhase.challenge.split(',')[0]}</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const SectCard: React.FC<{ sect: SectData }> = ({ sect }) => (
  <Card className="h-full">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="text-2xl">{sect.sect === 'Day' ? '☀️' : '🌙'}</span>
          {sect.sect} Chart
        </CardTitle>
        <Badge 
          variant="outline" 
          className={sect.sect === 'Day' ? 'border-amber-500 text-amber-500' : 'border-indigo-500 text-indigo-500'}
        >
          {sect.sect} Sect
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <p className="text-xs text-foreground">
        {sect.description.split('.')[0]}.
      </p>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-emerald-500">✦</span>
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{sect.sectBenefic}</span> is your Sect Benefic — luck flows naturally
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-500">✦</span>
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{sect.sectMalefic}</span> is your Sect Malefic — challenges are manageable
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-rose-400">✦</span>
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{sect.outOfSectMalefic}</span> is out of sect — may need more conscious work
          </span>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground italic pt-2 border-t border-border/50">
        {sect.overallMeaning.split('.')[0]}.
      </p>
    </CardContent>
  </Card>
);

const TimeOfDayCard: React.FC<{ timeOfDay: TimeOfDayData }> = ({ timeOfDay }) => {
  const timeEmojis: Record<string, string> = {
    'dawn': '🌅',
    'morning': '☀️',
    'midday': '🌞',
    'afternoon': '🌤️',
    'dusk': '🌆',
    'evening': '🌇',
    'night': '🌃',
    'deep_night': '🌌'
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="text-2xl">{timeEmojis[timeOfDay.timeOfDay] || '⏰'}</span>
            Time of Birth
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-serif text-lg text-foreground">{timeOfDay.description}</h4>
          <p className="text-xs text-muted-foreground">{timeOfDay.sunPosition}</p>
        </div>
        
        <div className="space-y-2 text-xs">
          <div>
            <span className="text-primary font-medium">Symbolism:</span>
            <p className="text-muted-foreground mt-0.5">{timeOfDay.symbolism.split('.')[0]}.</p>
          </div>
          
          <div className="pt-2 border-t border-border/50">
            <span className="text-foreground font-medium">Life Expression:</span>
            <p className="text-muted-foreground mt-0.5">{timeOfDay.lifeExpression.split('.')[0]}.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BirthConditionsDisplay;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NatalChart } from '@/hooks/useNatalChart';
import { getBirthConditions, BirthMoonPhaseData, SectData, TimeOfDayData } from '@/lib/birthConditions';

interface BirthConditionsDisplayProps {
  chart: NatalChart;
}

export const BirthConditionsDisplay: React.FC<BirthConditionsDisplayProps> = ({ chart }) => {
  const conditions = getBirthConditions(chart);
  const { moonPhase, sect, timeOfDay } = conditions;

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
    </div>
  );
};

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

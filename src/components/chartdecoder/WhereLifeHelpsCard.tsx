import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Heart, TrendingUp, Moon } from 'lucide-react';
import { ChartStrengthsAnalysis, ContentmentIndicator } from '@/lib/chartStrengths';

interface WhereLifeHelpsCardProps {
  analysis: ChartStrengthsAnalysis;
}

const HOUSE_ICONS: Record<number, string> = {
  1: '🪞',   // identity
  2: '💰',   // money
  3: '💬',   // communication
  4: '🏠',   // home
  5: '🎨',   // creativity
  6: '⚙️',   // work/health
  7: '💍',   // partnerships
  8: '🔮',   // transformation
  9: '✈️',   // travel/philosophy
  10: '🏆',  // career
  11: '👥',  // friends/groups
  12: '🧘'   // spirituality
};

const HOUSE_NAMES: Record<number, string> = {
  1: 'Identity & First Impressions',
  2: 'Money & Self-Worth',
  3: 'Communication & Learning',
  4: 'Home & Family',
  5: 'Creativity & Romance',
  6: 'Work & Health',
  7: 'Partnerships',
  8: 'Transformation & Intimacy',
  9: 'Travel & Philosophy',
  10: 'Career & Reputation',
  11: 'Friends & Visions',
  12: 'Spirituality & Solitude'
};

const ContentmentIndicatorRow: React.FC<{ indicator: ContentmentIndicator; icon: React.ReactNode }> = ({ 
  indicator, 
  icon 
}) => (
  <div className={`flex items-start gap-3 p-3 rounded-sm ${
    indicator.isSupported ? 'bg-emerald-500/10' : 'bg-muted/30'
  }`}>
    <div className={`mt-0.5 ${indicator.isSupported ? 'text-emerald-500' : 'text-muted-foreground'}`}>
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-medium">{indicator.area}</span>
        <Badge 
          variant="outline" 
          className={`text-xs ${
            indicator.isSupported 
              ? 'border-emerald-500/30 text-emerald-600' 
              : 'border-amber-500/30 text-amber-600'
          }`}
        >
          {indicator.isSupported ? 'Flows Naturally' : 'Conscious Work'}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">{indicator.interpretation}</p>
    </div>
  </div>
);

export const WhereLifeHelpsCard: React.FC<WhereLifeHelpsCardProps> = ({ analysis }) => {
  const { areasOfEase, contentment, sectBenefic, wellPlacedPlanets } = analysis;
  
  // Take top 3 areas of ease
  const topAreas = areasOfEase.slice(0, 3);
  
  return (
    <Card className="bg-gradient-to-br from-emerald-500/5 to-sky-500/5 border-emerald-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-500" />
            Where Life Helps You
          </CardTitle>
          <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-600">
            {topAreas.length} Ease Zones
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          These areas of life tend to flow with less resistance — your natural resources
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Top Ease Zones */}
        {topAreas.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground">
              Your Luck Zones
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {topAreas.map((area, i) => (
                <div 
                  key={i}
                  className="p-4 bg-card rounded-sm border border-emerald-500/20 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{HOUSE_ICONS[area.house] || '✦'}</span>
                    <div>
                      <div className="text-xs text-muted-foreground">House {area.house}</div>
                      <div className="text-sm font-medium">{HOUSE_NAMES[area.house]}</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {area.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Sect Benefic Summary */}
        {sectBenefic.condition && (
          <div className="p-4 bg-primary/5 rounded-sm border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{sectBenefic.planet === 'Jupiter' ? '♃' : '♀'}</span>
              <div>
                <div className="text-sm font-medium">Your Primary Helper: {sectBenefic.planet}</div>
                <div className="text-xs text-muted-foreground">
                  {sectBenefic.sign} {sectBenefic.house && `• House ${sectBenefic.house}`}
                  {sectBenefic.isWellPlaced && ' • Well-Placed'}
                </div>
              </div>
            </div>
            <p className="text-xs text-foreground leading-relaxed">
              {sectBenefic.interpretation.split('.')[0]}.
            </p>
            {sectBenefic.easeZones.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-xs text-muted-foreground">Brings ease to:</span>
                {sectBenefic.easeZones.slice(0, 2).map((zone, i) => (
                  <Badge key={i} variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-700">
                    {zone.split(' (')[0]}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Contentment Indicators */}
        <div className="space-y-2">
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground">
            Contentment Indicators
          </h4>
          <p className="text-sm text-foreground mb-3">
            {contentment.overall}
          </p>
          <div className="space-y-2">
            <ContentmentIndicatorRow 
              indicator={contentment.venus} 
              icon={<Heart size={16} />}
            />
            <ContentmentIndicatorRow 
              indicator={contentment.jupiter} 
              icon={<TrendingUp size={16} />}
            />
            <ContentmentIndicatorRow 
              indicator={contentment.moon} 
              icon={<Moon size={16} />}
            />
          </div>
        </div>
        
        {/* Natural Resources Summary */}
        {wellPlacedPlanets.length > 0 && (
          <div className="p-3 bg-muted/30 rounded-sm">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-primary" />
              <span className="text-xs font-medium">Your Strongest Resources</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {wellPlacedPlanets.slice(0, 4).map((planet, i) => (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className="text-xs border-emerald-500/30 text-emerald-700"
                >
                  {planet.planet} ({planet.qualityRating})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WhereLifeHelpsCard;

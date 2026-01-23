import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, ChevronDown, ChevronUp, Sparkles, AlertTriangle, Circle } from 'lucide-react';
import { ChartAspect, getAspectSymbol, getAspectMeaning } from '@/lib/chartDecoderLogic';

interface NatalAspectsSummaryProps {
  aspects: ChartAspect[];
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  Chiron: '⚷', NorthNode: '☊', Ascendant: 'ASC'
};

const ASPECT_CONFIG: Record<string, { 
  name: string; 
  nature: 'flowing' | 'challenging' | 'neutral';
  color: string;
  bgColor: string;
  description: string;
}> = {
  conjunction: { 
    name: 'Conjunctions', 
    nature: 'neutral',
    color: 'text-violet-600',
    bgColor: 'bg-violet-500/10 border-violet-500/30',
    description: 'Planets merged into one force. Intense focus, blended energies, amplification.'
  },
  trine: { 
    name: 'Trines', 
    nature: 'flowing',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10 border-emerald-500/30',
    description: 'Natural talents and easy flow. Gifts that work effortlessly—sometimes taken for granted.'
  },
  sextile: { 
    name: 'Sextiles', 
    nature: 'flowing',
    color: 'text-sky-600',
    bgColor: 'bg-sky-500/10 border-sky-500/30',
    description: 'Opportunities that require action. Supportive connections that need activation.'
  },
  square: { 
    name: 'Squares', 
    nature: 'challenging',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/10 border-orange-500/30',
    description: 'Friction that drives growth. Internal tension that builds strength through integration.'
  },
  opposition: { 
    name: 'Oppositions', 
    nature: 'challenging',
    color: 'text-rose-600',
    bgColor: 'bg-rose-500/10 border-rose-500/30',
    description: 'Awareness through polarity. Push-pull dynamics often projected onto relationships.'
  },
  quincunx: { 
    name: 'Quincunxes', 
    nature: 'challenging',
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
    description: 'Constant adjustment needed. Energies that don\'t naturally understand each other.'
  }
};

export const NatalAspectsSummary: React.FC<NatalAspectsSummaryProps> = ({ aspects }) => {
  const [expandedType, setExpandedType] = useState<string | null>(null);
  
  if (aspects.length === 0) return null;

  // Group aspects by type
  const groupedAspects: Record<string, ChartAspect[]> = {
    conjunction: [],
    trine: [],
    sextile: [],
    square: [],
    opposition: [],
    quincunx: []
  };
  
  aspects.forEach(aspect => {
    if (groupedAspects[aspect.aspectType]) {
      groupedAspects[aspect.aspectType].push(aspect);
    }
  });

  // Count flowing vs challenging
  const flowingCount = groupedAspects.trine.length + groupedAspects.sextile.length;
  const challengingCount = groupedAspects.square.length + groupedAspects.opposition.length + groupedAspects.quincunx.length;
  const neutralCount = groupedAspects.conjunction.length;

  // Determine overall chart character
  const getChartCharacter = () => {
    const total = flowingCount + challengingCount;
    if (total === 0) return 'balanced';
    const ratio = flowingCount / total;
    if (ratio > 0.65) return 'flowing';
    if (ratio < 0.35) return 'dynamic';
    return 'balanced';
  };
  
  const chartCharacter = getChartCharacter();

  return (
    <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="text-indigo-500" size={16} />
            Natal Aspects Summary
          </CardTitle>
          <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-600 border-indigo-500/30">
            {aspects.length} Aspects
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-emerald-500/10 rounded-md">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Sparkles size={12} className="text-emerald-500" />
              <span className="text-xs text-muted-foreground">Flowing</span>
            </div>
            <div className="text-lg font-semibold text-emerald-600">{flowingCount}</div>
          </div>
          <div className="p-2 bg-violet-500/10 rounded-md">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Circle size={12} className="text-violet-500" />
              <span className="text-xs text-muted-foreground">Neutral</span>
            </div>
            <div className="text-lg font-semibold text-violet-600">{neutralCount}</div>
          </div>
          <div className="p-2 bg-orange-500/10 rounded-md">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertTriangle size={12} className="text-orange-500" />
              <span className="text-xs text-muted-foreground">Dynamic</span>
            </div>
            <div className="text-lg font-semibold text-orange-600">{challengingCount}</div>
          </div>
        </div>

        {/* Chart Character */}
        <div className="bg-background/50 rounded-md p-3">
          <div className="text-xs font-medium text-foreground mb-1">
            Your Chart Character: {chartCharacter === 'flowing' ? '✨ Flowing' : chartCharacter === 'dynamic' ? '⚡ Dynamic' : '☯ Balanced'}
          </div>
          <p className="text-xs text-muted-foreground">
            {chartCharacter === 'flowing' && 
              'Your chart has more harmonious aspects. Talents come naturally, but growth requires conscious effort to push yourself.'}
            {chartCharacter === 'dynamic' && 
              'Your chart has more challenging aspects. You build strength through friction—life pushes you to integrate opposites.'}
            {chartCharacter === 'balanced' && 
              'Your chart balances ease and challenge. You have natural gifts AND growth edges that drive evolution.'}
          </p>
        </div>

        {/* Aspect Groups */}
        <div className="space-y-2">
          {Object.entries(groupedAspects).map(([type, typeAspects]) => {
            if (typeAspects.length === 0) return null;
            
            const config = ASPECT_CONFIG[type];
            const isExpanded = expandedType === type;
            
            return (
              <div key={type} className={`rounded-md border ${config.bgColor}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedType(isExpanded ? null : type)}
                  className="w-full justify-between h-auto py-2 px-3"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-lg ${config.color}`}>{getAspectSymbol(type)}</span>
                    <span className="text-sm font-medium">{config.name}</span>
                    <Badge variant="outline" className="text-[10px] ml-1">
                      {typeAspects.length}
                    </Badge>
                  </div>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </Button>
                
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2">
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                    
                    {typeAspects.map((aspect, i) => (
                      <div key={i} className="p-2 bg-background/50 rounded text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {PLANET_SYMBOLS[aspect.planet1]} {aspect.planet1}
                          </span>
                          <span className={config.color}>{getAspectSymbol(aspect.aspectType)}</span>
                          <span className="font-medium">
                            {PLANET_SYMBOLS[aspect.planet2]} {aspect.planet2}
                          </span>
                          <span className="text-muted-foreground ml-auto">
                            {aspect.orb.toFixed(1)}° orb
                          </span>
                        </div>
                        <p className="text-muted-foreground">
                          {getAspectMeaning(aspect.planet1, aspect.planet2, aspect.aspectType)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Key Insight */}
        <div className="bg-background/50 rounded-md p-3">
          <p className="text-xs text-muted-foreground italic">
            💡 <span className="text-foreground font-medium">How to read aspects:</span> Tight orbs (under 3°) are felt 
            most intensely. Applying aspects (moving toward exact) are still developing; separating aspects are lessons 
            you're integrating.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

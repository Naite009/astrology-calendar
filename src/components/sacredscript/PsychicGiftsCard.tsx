// Psychic Gifts Card - Dedicated summary of intuitive abilities for readings

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Sparkles, Eye, Moon } from 'lucide-react';
import { useState } from 'react';
import { PsychicIndicator } from '@/lib/sacredScriptHelpers';

interface PsychicGiftsCardProps {
  indicators: PsychicIndicator[];
  chartName?: string;
}

// Category display info
const CATEGORY_INFO: Record<string, { icon: string; label: string; color: string }> = {
  neptune: { icon: '♆', label: 'Neptune Gifts', color: 'from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border-purple-300 dark:border-purple-700' },
  'pluto-moon': { icon: '♇☽', label: 'Mediumship', color: 'from-slate-50 to-zinc-50 dark:from-slate-950/40 dark:to-zinc-950/40 border-slate-400 dark:border-slate-600' },
  'twelfth-house': { icon: '12H', label: '12th House Mysticism', color: 'from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border-indigo-300 dark:border-indigo-700' },
  'eighth-house': { icon: '8H', label: '8th House Depth', color: 'from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40 border-rose-300 dark:border-rose-700' },
  water: { icon: '♋♏♓', label: 'Water Intuition', color: 'from-cyan-50 to-teal-50 dark:from-cyan-950/40 dark:to-teal-950/40 border-cyan-300 dark:border-cyan-700' },
  nodes: { icon: '☊', label: 'Karmic Sensitivity', color: 'from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40 border-amber-300 dark:border-amber-700' },
  chiron: { icon: '⚷', label: 'Wounded Healer', color: 'from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40 border-emerald-300 dark:border-emerald-700' },
  angular: { icon: '☌', label: 'Angular Neptune', color: 'from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/40 border-violet-300 dark:border-violet-700' },
  midpoint: { icon: '⊗', label: 'Psychic Midpoints', color: 'from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/40 dark:to-pink-950/40 border-fuchsia-300 dark:border-fuchsia-700' },
  tno: { icon: '🜨', label: 'Trans-Neptunian', color: 'from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/40 border-sky-300 dark:border-sky-700' },
};

// Get overall psychic profile assessment
const getPsychicProfile = (indicators: PsychicIndicator[]): { level: string; description: string; gifts: string[] } => {
  const strongCount = indicators.filter(i => i.strength === 'strong').length;
  const moderateCount = indicators.filter(i => i.strength === 'moderate').length;
  const totalScore = strongCount * 3 + moderateCount * 1.5;
  
  // Identify specific gifts based on categories
  const gifts: string[] = [];
  const categories = new Set(indicators.map(i => i.category));
  
  if (categories.has('neptune')) gifts.push('Clairvoyance/Visions');
  if (categories.has('pluto-moon')) gifts.push('Mediumship/Spirit Contact');
  if (categories.has('twelfth-house')) gifts.push('Dream Work/Astral Travel');
  if (categories.has('eighth-house')) gifts.push('Death Midwifery/Shadow Work');
  if (categories.has('water')) gifts.push('Empathy/Clairsentience');
  if (categories.has('nodes')) gifts.push('Past Life Recall');
  if (categories.has('chiron')) gifts.push('Healing/Energy Work');
  if (categories.has('angular')) gifts.push('Public Psychic Presence');
  if (categories.has('midpoint')) gifts.push('Intuitive Downloads');
  if (categories.has('tno')) gifts.push('Collective/Generational Channeling');
  
  // Neptune-Mercury specifically
  if (indicators.some(i => i.symbol?.includes('☿'))) gifts.push('Clairaudience/Channeling');
  
  if (totalScore >= 10) {
    return {
      level: 'HIGHLY GIFTED',
      description: 'This chart shows exceptional psychic and intuitive potential. Multiple strong indicators suggest natural abilities that have likely been present since childhood. This person is meant to work with the unseen realms.',
      gifts
    };
  } else if (totalScore >= 5) {
    return {
      level: 'NOTABLY INTUITIVE',
      description: 'This chart shows significant intuitive sensitivity. With development and practice, these abilities can become reliable tools for guidance and healing. The native likely already has "hunches" that prove accurate.',
      gifts
    };
  } else if (totalScore >= 2) {
    return {
      level: 'SENSITIVELY ATTUNED',
      description: 'This chart shows genuine intuitive capacity. While not a dominant theme, the native has access to subtle perception that can be developed. Trust and practice will strengthen these gifts.',
      gifts
    };
  } else {
    return {
      level: 'SUBTLY RECEPTIVE',
      description: 'Intuitive gifts are present but subtle. The native may not identify as "psychic" but likely has quiet knowing, gut feelings, or sensitivity to atmosphere. These gifts work best when not forced.',
      gifts
    };
  }
};

export const PsychicGiftsCard = ({ indicators, chartName }: PsychicGiftsCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  if (indicators.length === 0) return null;
  
  const profile = getPsychicProfile(indicators);
  
  // Group by category
  const groupedIndicators = indicators.reduce((acc, indicator) => {
    const cat = indicator.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(indicator);
    return acc;
  }, {} as Record<string, PsychicIndicator[]>);
  
  // Sort categories by strength of strongest indicator
  const sortedCategories = Object.entries(groupedIndicators).sort((a, b) => {
    const aMax = Math.max(...a[1].map(i => i.strength === 'strong' ? 3 : i.strength === 'moderate' ? 2 : 1));
    const bMax = Math.max(...b[1].map(i => i.strength === 'strong' ? 3 : i.strength === 'moderate' ? 2 : 1));
    return bMax - aMax;
  });
  
  return (
    <Card className="border-2 border-indigo-300 dark:border-indigo-700 shadow-lg overflow-hidden">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-gradient-to-r from-indigo-100 via-purple-100 to-violet-100 dark:from-indigo-950/60 dark:via-purple-950/60 dark:to-violet-950/60 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Eye className="text-white" size={20} />
                </div>
                <div className="text-left">
                  <CardTitle className="text-lg font-serif flex items-center gap-2">
                    Psychic Gifts Summary
                    <span className={`text-xs px-2 py-0.5 rounded font-sans ${
                      profile.level === 'HIGHLY GIFTED' 
                        ? 'bg-indigo-600 text-white' 
                        : profile.level === 'NOTABLY INTUITIVE'
                        ? 'bg-purple-500 text-white'
                        : 'bg-violet-400 text-white'
                    }`}>
                      {profile.level}
                    </span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {chartName ? `${chartName}'s intuitive abilities` : 'Intuitive abilities at a glance'}
                  </p>
                </div>
              </div>
              <ChevronDown 
                size={20} 
                className={`text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-4 space-y-4">
            {/* Overall Assessment */}
            <div className="bg-gradient-to-r from-slate-50 to-zinc-50 dark:from-slate-900/50 dark:to-zinc-900/50 p-4 rounded-lg border">
              <p className="text-sm leading-relaxed mb-3">{profile.description}</p>
              
              {profile.gifts.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-xs font-medium text-muted-foreground">Potential gifts:</span>
                  {profile.gifts.map((gift, i) => (
                    <span 
                      key={i} 
                      className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded"
                    >
                      {gift}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Quick Client Summary */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1">
                <Sparkles size={14} />
                📋 Quick Client Summary (What to Say):
              </p>
              <p className="text-sm italic leading-relaxed">
                {indicators.length >= 4 
                  ? `"Your chart shows you came in with significant psychic gifts. ${indicators[0].clientDescription.split('.')[0]}. ${indicators.length > 1 ? indicators[1].clientDescription.split('.')[0] + '.' : ''} This isn't something you need to develop—you already have it. The question is how to work WITH it."`
                  : indicators.length >= 2
                  ? `"You have genuine intuitive sensitivity—${indicators[0].clientDescription.split('.')[0].toLowerCase()}. Trust those hunches. They're real."`
                  : `"You have a subtle intuitive gift here—${indicators[0]?.clientDescription.split('.')[0].toLowerCase() || 'a quiet inner knowing'}. It works best when you don't force it."`
                }
              </p>
            </div>
            
            {/* Grouped Indicators */}
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-3">
                {sortedCategories.map(([category, catIndicators]) => {
                  const catInfo = CATEGORY_INFO[category] || { icon: '✧', label: category, color: 'from-slate-50 to-gray-50 dark:from-slate-950/40 dark:to-gray-950/40 border-slate-300' };
                  
                  return (
                    <div 
                      key={category} 
                      className={`bg-gradient-to-r ${catInfo.color} p-3 rounded-lg border`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-mono">{catInfo.icon}</span>
                        <span className="font-medium text-sm">{catInfo.label}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {catIndicators.length} indicator{catIndicators.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {catIndicators.map((indicator, idx) => (
                          <div key={idx} className="bg-background/60 rounded p-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-mono">{indicator.symbol}</span>
                              <span className="text-sm font-medium">{indicator.name}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ml-auto ${
                                indicator.strength === 'strong' 
                                  ? 'bg-indigo-500 text-white' 
                                  : indicator.strength === 'moderate'
                                  ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300'
                                  : 'bg-secondary text-muted-foreground'
                              }`}>
                                {indicator.strength.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{indicator.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            
            {/* Development Tips */}
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                <Moon size={14} />
                Development & Protection Tips
                <ChevronDown size={14} className="ml-1 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-2 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-lg text-sm space-y-2">
                <p><strong>Grounding:</strong> With strong water/Neptune signatures, daily grounding is essential. Walk barefoot, work with crystals, visualize roots.</p>
                <p><strong>Shielding:</strong> Teach the client to visualize protective light before entering crowds or intense situations.</p>
                <p><strong>Dreams:</strong> Keep a dream journal. Much psychic information comes through sleep, especially with 12th house and Neptune placements.</p>
                <p><strong>Boundaries:</strong> Learn to distinguish "yours" from "theirs." Ask: "Is this feeling mine?" before reacting.</p>
                {indicators.some(i => i.category === 'pluto-moon') && (
                  <p><strong>Mediumship:</strong> If seeing spirits, establish clear boundaries. Work with a mentor. You can say "not now."</p>
                )}
              </div>
            </details>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

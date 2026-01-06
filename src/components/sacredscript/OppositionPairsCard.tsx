// Opposition Pairs Teaching from Debra Silverman Guide

import { ArrowLeftRight, Sparkles } from 'lucide-react';
import { OPPOSITION_PAIRS, getOppositionPairForSign } from '@/lib/debraSilvermanGuide';

interface OppositionPairsCardProps {
  sunSign: string;
  moonSign: string;
}

export const OppositionPairsCard = ({ sunSign, moonSign }: OppositionPairsCardProps) => {
  // Check if Sun and Moon are in opposing signs
  const sunOpposition = getOppositionPairForSign(sunSign);
  const moonOpposition = getOppositionPairForSign(moonSign);
  
  const areOpposed = sunOpposition && 
    (sunOpposition.sign1 === moonSign || sunOpposition.sign2 === moonSign);
  
  if (!areOpposed || !sunOpposition) return null;
  
  return (
    <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-rose-950/40 p-6 rounded-xl border-2 border-amber-400 dark:border-amber-600">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <ArrowLeftRight className="text-white" size={20} />
        </div>
        <div>
          <h3 className="font-serif text-lg font-medium text-amber-800 dark:text-amber-200">
            Opposition Integration: {sunSign} ↔ {moonSign}
          </h3>
          <p className="text-sm text-muted-foreground">
            Your Sun and Moon are in opposing signs—a powerful integration journey
          </p>
        </div>
      </div>
      
      {/* The Teaching */}
      <div className="bg-white/60 dark:bg-black/40 p-5 rounded-lg mb-4">
        <div className="flex items-start gap-3">
          <Sparkles className="text-amber-500 mt-1 flex-shrink-0" size={18} />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
              {sunOpposition.integrationTitle}
            </p>
            <div className="space-y-3 text-sm">
              <div className="bg-white/50 dark:bg-black/20 p-2 rounded">
                <span className="font-medium">{sunOpposition.sign1}:</span> {sunOpposition.sign1Voice}
              </div>
              <div className="bg-white/50 dark:bg-black/20 p-2 rounded">
                <span className="font-medium">{sunOpposition.sign2}:</span> {sunOpposition.sign2Voice}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Integration Path */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
        <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
          <span>✓</span> Path to Integration
        </h4>
        <p className="text-sm leading-relaxed">
          {sunOpposition.integration}
        </p>
      </div>
      
      {/* Coaching Note */}
      <div className="mt-4 text-xs text-muted-foreground italic">
        <strong>Coaching Note:</strong> People with Sun-Moon oppositions often feel pulled between two ways of being.
        The goal isn't to choose one over the other, but to find the balance point where both can be honored.
      </div>
    </div>
  );
};

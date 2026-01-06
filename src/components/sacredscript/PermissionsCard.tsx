// Personalized Permissions Card from Debra Silverman Level 1 Handbook

import { CheckCircle, Printer, Heart } from 'lucide-react';
import { getElementTeaching } from '@/lib/elementTeachings';

interface PermissionsCardProps {
  dominantElements: string[];
  clientName: string;
}

export const PermissionsCard = ({ dominantElements, clientName }: PermissionsCardProps) => {
  // Collect permissions from dominant elements
  const allPermissions: { element: string; permission: string }[] = [];
  
  dominantElements.forEach(element => {
    const teaching = getElementTeaching(element);
    if (teaching) {
      teaching.permissions.forEach(permission => {
        allPermissions.push({ element, permission });
      });
    }
  });
  
  // Select key permissions (up to 10 total, distributed across elements)
  const maxPerElement = Math.ceil(10 / dominantElements.length);
  const selectedPermissions: { element: string; permission: string }[] = [];
  
  dominantElements.forEach(element => {
    const teaching = getElementTeaching(element);
    if (teaching) {
      // Select most impactful permissions (first few tend to be most important)
      teaching.permissions.slice(0, maxPerElement).forEach(permission => {
        selectedPermissions.push({ element, permission });
      });
    }
  });
  
  const handlePrint = () => {
    window.print();
  };
  
  const elementEmoji: Record<string, string> = {
    Fire: '🔥',
    Earth: '🌍',
    Air: '💨',
    Water: '💧'
  };
  
  return (
    <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/40 dark:via-purple-950/40 dark:to-fuchsia-950/40 p-6 rounded-xl border-2 border-violet-300 dark:border-violet-700 print:border-black">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
            <Heart className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-serif text-xl font-medium text-violet-800 dark:text-violet-200">
              {clientName}'s Permissions
            </h3>
            <p className="text-sm text-muted-foreground">
              Based on your {dominantElements.join(' & ')} nature
            </p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-3 py-1.5 text-sm border border-violet-300 dark:border-violet-600 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors print:hidden"
        >
          <Printer size={14} />
          Print
        </button>
      </div>
      
      {/* Intro Text */}
      <div className="bg-white/60 dark:bg-black/40 p-4 rounded-lg mb-6 text-center">
        <p className="text-sm italic text-violet-700 dark:text-violet-300">
          "These are your sacred permissions. Allow yourself to embody them fully.
          Post them where you can see them. Read them when you need reminding."
        </p>
      </div>
      
      {/* Permissions List */}
      <div className="space-y-3">
        {selectedPermissions.map((item, i) => (
          <div 
            key={i} 
            className="flex items-start gap-3 bg-white/50 dark:bg-black/30 p-3 rounded-lg"
          >
            <CheckCircle className="text-violet-500 mt-0.5 flex-shrink-0" size={18} />
            <div className="flex-1">
              <p className="text-sm">{item.permission}</p>
            </div>
            <span className="text-sm flex-shrink-0">{elementEmoji[item.element]}</span>
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-violet-200 dark:border-violet-700">
        <p className="text-center text-xs text-muted-foreground">
          From the Debra Silverman Astrology Level 1 Handbook • {dominantElements.map(e => elementEmoji[e]).join(' ')}
        </p>
      </div>
    </div>
  );
};

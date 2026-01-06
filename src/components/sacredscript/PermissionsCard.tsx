// Personalized Permissions Card from Debra Silverman Level 1 Handbook
// Enhanced with "WHY" explanations tied to elemental tendencies

import { CheckCircle, Printer, Heart, HelpCircle } from 'lucide-react';
import { getElementTeaching } from '@/lib/elementTeachings';

interface PermissionsCardProps {
  dominantElements: string[];
  clientName: string;
}

// Permissions with explanations of WHY they're needed for each element
interface PermissionWithReason {
  permission: string;
  why: string;
  tendency: string; // What the element naturally does that creates the need
}

const getElementPermissionsWithReasons = (element: string): PermissionWithReason[] => {
  const permissionsData: Record<string, PermissionWithReason[]> = {
    Air: [
      {
        permission: "Learn to talk from the heart and the body—use the body to stay in the moment",
        why: "Because Air lives in the mind, you can get lost in thoughts and words, disconnecting from what you actually FEEL. Grounding into the body brings your brilliant ideas into emotional truth.",
        tendency: "Air's natural tendency: Living in the head, intellectualizing emotions instead of feeling them"
      },
      {
        permission: "Ask yourself: 'Why am I speaking and who am I serving?'",
        why: "Because Air can talk just to talk, filling silence with words. This question helps you speak with intention rather than nervous energy, making your communication more powerful.",
        tendency: "Air's natural tendency: Talking to process, sometimes oversharing or dominating conversations"
      },
      {
        permission: "Practice saying: 'I need you.' 'I miss you.' 'I feel sad.' 'I was wrong.' 'I need help.'",
        why: "Because Air struggles with vulnerability. These phrases feel risky because they're emotional and direct. But they're exactly what creates real intimacy—which Air secretly craves.",
        tendency: "Air's natural tendency: Staying detached, keeping relationships light, avoiding emotional exposure"
      },
      {
        permission: "Allow yourself to need others and ask for help",
        why: "Because Air prides itself on independence and self-sufficiency. Admitting need feels like weakness. But connection IS a need, and pretending otherwise creates loneliness.",
        tendency: "Air's natural tendency: Fiercely independent, reluctant to show vulnerability or dependence"
      },
      {
        permission: "Slow down and be present instead of always moving to the next thing",
        why: "Because Air's mind races constantly—always thinking ahead, planning, analyzing. Stillness feels uncomfortable but it's where depth lives.",
        tendency: "Air's natural tendency: Mental restlessness, difficulty with stillness and presence"
      },
    ],
    Water: [
      {
        permission: "Allow yourself to feel and listen deeply—your soul longs for quiet",
        why: "Because Water absorbs everything around them. You need permission to retreat, to have solitude, because you're processing not just your feelings but everyone else's too.",
        tendency: "Water's natural tendency: Absorbing emotions from the environment, becoming overwhelmed"
      },
      {
        permission: "It is safe to open up to those you love",
        why: "Because Water protects itself by withdrawing. You've been hurt before, so you shield your tender heart. But isolation creates more pain than vulnerability does.",
        tendency: "Water's natural tendency: Building emotional walls, hiding true feelings, fearing rejection"
      },
      {
        permission: "You are allowed to have boundaries",
        why: "Because Water merges with others so completely that you lose where you end and they begin. Boundaries aren't rejection—they're self-preservation.",
        tendency: "Water's natural tendency: Over-giving, losing self in relationships, difficulty saying no"
      },
      {
        permission: "Your feelings are valid and don't need to be explained or justified",
        why: "Because Water often gets told they're 'too sensitive' or 'overreacting.' Your emotional intelligence IS your gift. Trust what you feel.",
        tendency: "Water's natural tendency: Doubting their own feelings when others don't understand"
      },
      {
        permission: "Ask for what you need BEFORE reaching crisis point",
        why: "Because Water waits until they're drowning before speaking up. You hint, you hope others will notice. But direct asking—while terrifying—prevents resentment.",
        tendency: "Water's natural tendency: Hinting instead of asking directly, expecting others to read their mind"
      },
    ],
    Earth: [
      {
        permission: "Allow yourself to not have everything perfect all the time",
        why: "Because Earth equates worth with productivity and getting it right. But perfectionism is exhausting and ultimately impossible. 'Good enough' IS enough.",
        tendency: "Earth's natural tendency: Perfectionism, self-criticism, never feeling 'done'"
      },
      {
        permission: "It is okay to take breaks and rest without feeling guilty",
        why: "Because Earth sees rest as laziness. You feel you must always be DOING something productive. But rest is productive—it's how you sustain the long game.",
        tendency: "Earth's natural tendency: Workaholism, guilt around leisure, equating busyness with worth"
      },
      {
        permission: "You are allowed to receive help and delegate",
        why: "Because Earth thinks 'if you want it done right, do it yourself.' But carrying everything alone leads to burnout and resentment. Let others contribute.",
        tendency: "Earth's natural tendency: Over-responsibility, difficulty trusting others to do things 'right'"
      },
      {
        permission: "Change doesn't mean failure—it means growth",
        why: "Because Earth values stability so much that any change feels like loss. But sometimes the structure you built needs to evolve. Flexibility serves longevity.",
        tendency: "Earth's natural tendency: Resistance to change, staying too long in situations that no longer serve"
      },
      {
        permission: "Your worth is not measured by what you produce",
        why: "Because Earth ties identity to achievement and tangible results. But you are valuable simply for existing—not for what you DO.",
        tendency: "Earth's natural tendency: Defining self-worth through accomplishments and usefulness"
      },
    ],
    Fire: [
      {
        permission: "It is okay to be passionate and enthusiastic",
        why: "Because Fire often gets told to 'calm down' or 'be realistic.' Your enthusiasm is contagious and inspiring—don't let others dim your flame.",
        tendency: "Fire's natural tendency: Being judged as 'too much' and learning to dampen their energy"
      },
      {
        permission: "Allow yourself to take up space and be seen",
        why: "Because Fire's natural radiance can trigger others' insecurity. You may have learned to shrink. But you came here to SHINE—that's not arrogance, it's your purpose.",
        tendency: "Fire's natural tendency: Dimming their light to avoid making others uncomfortable"
      },
      {
        permission: "You can slow down without losing your spark",
        why: "Because Fire fears that stopping means dying out. But sustainable flame burns longer than a flash. Pacing isn't defeat—it's wisdom.",
        tendency: "Fire's natural tendency: Burnout from constant action, fear of losing momentum"
      },
      {
        permission: "You are allowed to not know the answer immediately",
        why: "Because Fire wants to lead and act NOW. Admitting uncertainty feels like weakness. But pause creates space for better decisions.",
        tendency: "Fire's natural tendency: Impulsivity, acting before thinking, needing to appear confident always"
      },
      {
        permission: "It is okay to need others—independence isn't the only strength",
        why: "Because Fire values self-sufficiency as a core identity. But lone wolves get lonely. Interdependence is mature, not weak.",
        tendency: "Fire's natural tendency: Fierce independence, difficulty receiving or asking for support"
      },
    ],
  };
  
  return permissionsData[element] || [];
};

export const PermissionsCard = ({ dominantElements, clientName }: PermissionsCardProps) => {
  const handlePrint = () => {
    window.print();
  };
  
  const elementEmoji: Record<string, string> = {
    Fire: '🔥',
    Earth: '🌍',
    Air: '💨',
    Water: '💧'
  };
  
  const elementColors: Record<string, string> = {
    Fire: 'border-l-orange-400',
    Earth: 'border-l-green-500',
    Air: 'border-l-sky-400',
    Water: 'border-l-blue-500'
  };
  
  // Get permissions for each dominant element
  const allPermissions = dominantElements.flatMap(element => 
    getElementPermissionsWithReasons(element).slice(0, 3).map(p => ({ ...p, element }))
  );
  
  return (
    <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/40 dark:via-purple-950/40 dark:to-fuchsia-950/40 p-6 rounded-xl border-2 border-violet-300 dark:border-violet-700 print:border-black">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
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
      
      {/* Explanation */}
      <div className="bg-white/60 dark:bg-black/40 p-4 rounded-lg mb-5">
        <p className="text-sm text-violet-700 dark:text-violet-300">
          <span className="font-medium">Why permissions?</span> Each element has natural tendencies—patterns that served you but may now limit you. 
          These permissions address your specific element's blind spots, giving you explicit permission to do what feels uncomfortable but necessary for growth.
        </p>
      </div>
      
      {/* Permissions List with WHY */}
      <div className="space-y-4">
        {allPermissions.map((item, i) => (
          <div 
            key={i} 
            className={`bg-white/50 dark:bg-black/30 p-4 rounded-lg border-l-4 ${elementColors[item.element]}`}
          >
            {/* The Permission */}
            <div className="flex items-start gap-3 mb-2">
              <CheckCircle className="text-violet-500 mt-0.5 flex-shrink-0" size={18} />
              <p className="text-sm font-medium flex-1">{item.permission}</p>
              <span className="text-sm flex-shrink-0">{elementEmoji[item.element]}</span>
            </div>
            
            {/* The Tendency (what creates the need) */}
            <div className="ml-7 mb-2">
              <p className="text-xs text-muted-foreground italic">
                {item.tendency}
              </p>
            </div>
            
            {/* The WHY */}
            <div className="ml-7 bg-violet-100/50 dark:bg-violet-900/30 p-2 rounded">
              <div className="flex items-start gap-2">
                <HelpCircle className="text-violet-400 flex-shrink-0 mt-0.5" size={14} />
                <p className="text-xs text-violet-700 dark:text-violet-300">
                  <span className="font-medium">Why this matters:</span> {item.why}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Reflection Questions */}
      <div className="mt-5 p-4 bg-white/40 dark:bg-black/20 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Reflection Questions:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Which permission feels most uncomfortable? That's likely your growth edge.</li>
          <li>• Which tendency do you recognize most strongly in yourself?</li>
          <li>• What would change if you fully gave yourself this permission?</li>
        </ul>
      </div>
      
      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-violet-200 dark:border-violet-700">
        <p className="text-center text-xs text-muted-foreground">
          From the Debra Silverman Astrology Level 1 Handbook • {dominantElements.map(e => elementEmoji[e]).join(' ')}
        </p>
      </div>
    </div>
  );
};
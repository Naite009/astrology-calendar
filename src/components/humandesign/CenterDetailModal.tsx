import { X } from 'lucide-react';
import { HumanDesignChart, HDCenterName } from '@/types/humanDesign';
import { getGatesByCenter } from '@/data/humanDesignGates';

interface CenterDetailModalProps {
  centerName: HDCenterName;
  chart: HumanDesignChart;
  onClose: () => void;
}

// Center data with full descriptions
const CENTER_DATA: Record<string, {
  function: string;
  themes: string;
  biologicalCorrelation: string;
  whenDefined: {
    description: string;
    gifts: string[];
    shadow: string;
  };
  whenUndefined: {
    wisdom: string;
    conditioning: string[];
    notSelfBehavior: string;
  };
}> = {
  Head: {
    function: "Inspiration, mental pressure to answer questions",
    themes: "What should I be thinking about?",
    biologicalCorrelation: "Pineal gland",
    whenDefined: {
      description: "You have consistent mental pressure and inspiration. Your questions are fixed, and you're designed to inspire others with specific mental themes.",
      gifts: ["Consistent inspiration", "Fixed mental pressure", "Inspiring others with questions"],
      shadow: "Overwhelming others with your mental pressure, or feeling pressured by your own consistent thoughts."
    },
    whenUndefined: {
      wisdom: "You can sample all types of inspiration and questions. Your wisdom is in knowing which questions are truly worth pursuing.",
      conditioning: ["Trying to answer everyone's questions", "Mental overwhelm from amplified pressure", "Thinking you should know what to think about"],
      notSelfBehavior: "Becoming fixated on questions that aren't yours, feeling pressured to have answers for everything."
    }
  },
  Ajna: {
    function: "Conceptualization, mental processing, forming opinions",
    themes: "How do I make sense of this? What do I think?",
    biologicalCorrelation: "Pituitary gland, anterior/posterior",
    whenDefined: {
      description: "You have a fixed way of processing information and forming opinions. Your thinking style is consistent and reliable.",
      gifts: ["Consistent mental processing", "Fixed opinions when appropriate", "Reliable way of thinking"],
      shadow: "Mental rigidity, unwillingness to see other perspectives, over-identification with thoughts."
    },
    whenUndefined: {
      wisdom: "You can see all perspectives and ways of thinking. You're not meant to be certain – your gift is flexibility of mind.",
      conditioning: ["Pretending to be certain", "Trying to have fixed opinions", "Feeling stupid or less intelligent"],
      notSelfBehavior: "Holding onto opinions that aren't yours, trying to appear mentally consistent when you're designed to be flexible."
    }
  },
  Throat: {
    function: "Communication, manifestation, expression, action",
    themes: "How do I express myself? What do I manifest?",
    biologicalCorrelation: "Thyroid and parathyroid glands",
    whenDefined: {
      description: "You have consistent access to expression and manifestation. Your voice and actions have a reliable quality.",
      gifts: ["Consistent communication style", "Ability to manifest and act", "Reliable self-expression"],
      shadow: "Speaking without awareness, manifesting impulsively, dominating conversations."
    },
    whenUndefined: {
      wisdom: "You can express in many different ways. Your wisdom is in knowing when to speak and when silence is more powerful.",
      conditioning: ["Pressure to speak to be noticed", "Trying to prove worth through talking", "Speaking before it's time"],
      notSelfBehavior: "Talking too much to get attention, initiating action before waiting for the right timing."
    }
  },
  G: {
    function: "Identity, direction, love, the magnetic monopole",
    themes: "Who am I? Where am I going? Who do I love?",
    biologicalCorrelation: "Liver, blood",
    whenDefined: {
      description: "You have a fixed sense of identity and direction. You know who you are and where you're going at a deep level.",
      gifts: ["Strong sense of self", "Clear direction", "Consistent love and identity"],
      shadow: "Inflexibility about identity, attachment to a fixed self-image, trying to control direction."
    },
    whenUndefined: {
      wisdom: "You can be different with different people. Your gift is flexibility of identity and being able to sense others' direction.",
      conditioning: ["Not knowing who you are", "Searching for love and direction externally", "Identity confusion"],
      notSelfBehavior: "Desperately searching for identity and direction outside yourself, staying in wrong places hoping to find yourself."
    }
  },
  Heart: {
    function: "Willpower, ego, self-worth, material world mastery",
    themes: "Am I worthy? What am I willing to do? What do I have?",
    biologicalCorrelation: "Heart, stomach, gallbladder, thymus",
    whenDefined: {
      description: "You have consistent willpower and can make promises. You have natural self-worth and are designed to prove and compete.",
      gifts: ["Reliable willpower", "Ability to make and keep promises", "Natural self-worth"],
      shadow: "Over-promising, ego inflation, pushing too hard, using willpower unsustainably."
    },
    whenUndefined: {
      wisdom: "You can sense the true worth of things and people. You're not designed to prove yourself or compete constantly.",
      conditioning: ["Constantly proving your worth", "Making promises you can't keep", "Pushing beyond your willpower"],
      notSelfBehavior: "Overworking to prove yourself, staying in competitive situations that drain you, tying worth to achievement."
    }
  },
  Sacral: {
    function: "Life force energy, fertility, sexuality, work energy",
    themes: "Do I have energy for this? Is this correct for me?",
    biologicalCorrelation: "Ovaries, testes",
    whenDefined: {
      description: "You have sustainable life force energy. You're designed to respond to life and do work you love. You're a Generator or Manifesting Generator.",
      gifts: ["Sustainable work energy", "Sacral response for decisions", "Life force that builds and creates"],
      shadow: "Burnout from not following response, doing work you hate, ignoring your gut response."
    },
    whenUndefined: {
      wisdom: "You can sense who has healthy life force. You're not designed for sustainable work in the same way – rest is crucial.",
      conditioning: ["Trying to keep up with Generators", "Not knowing when enough is enough", "Overworking"],
      notSelfBehavior: "Working until completely depleted, not knowing when to stop, becoming a workaholic or burning out repeatedly."
    }
  },
  'Solar Plexus': {
    function: "Emotions, feelings, moods, spirit, nervous system",
    themes: "How do I feel? What do I want emotionally?",
    biologicalCorrelation: "Solar plexus, kidneys, pancreas, lungs",
    whenDefined: {
      description: "You experience emotional waves. There's no truth in the now for you – you must wait through your emotional wave before making decisions.",
      gifts: ["Emotional depth and range", "Passion and spirit", "Emotional authority for decisions"],
      shadow: "Making decisions in emotional highs or lows, emotional volatility, projecting emotions onto others."
    },
    whenUndefined: {
      wisdom: "You can sense others' emotional truth. You're not naturally emotional – you amplify and reflect others' emotions.",
      conditioning: ["Avoiding confrontation to keep peace", "Taking on others' emotions as your own", "Emotional avoidance"],
      notSelfBehavior: "Becoming an emotional sponge, making decisions to avoid emotional discomfort, emotional people-pleasing."
    }
  },
  Spleen: {
    function: "Intuition, survival instincts, immune system, time (now)",
    themes: "Is this safe? Is this healthy for me? What do I instinctively know?",
    biologicalCorrelation: "Spleen, lymph system, T-cells",
    whenDefined: {
      description: "You have consistent intuitive awareness and survival instincts. Your intuition speaks once, quietly, in the moment.",
      gifts: ["Reliable intuition", "Strong immune awareness", "In-the-moment knowing"],
      shadow: "Ignoring the quiet intuitive voice, not trusting instincts, acting on fear instead of intuition."
    },
    whenUndefined: {
      wisdom: "You can sense when environments and people are healthy or unhealthy. You amplify intuitive and fear-based information.",
      conditioning: ["Holding onto things too long", "Staying in unhealthy situations", "Fear-based decisions"],
      notSelfBehavior: "Holding onto relationships, jobs, or possessions past their healthy time, being governed by amplified fears."
    }
  },
  Root: {
    function: "Adrenaline, pressure, stress, fuel for action",
    themes: "What pressure am I under? What needs to be done?",
    biologicalCorrelation: "Adrenal glands",
    whenDefined: {
      description: "You have consistent pressure and adrenaline. You're designed to handle stress and use pressure productively.",
      gifts: ["Ability to handle pressure", "Consistent adrenaline", "Productive use of stress"],
      shadow: "Pressuring others, addiction to stress, inability to relax, creating urgency where none exists."
    },
    whenUndefined: {
      wisdom: "You can sense what's truly urgent. You're not designed to be constantly under pressure – rest from pressure is essential.",
      conditioning: ["Always feeling rushed", "Trying to get rid of pressure quickly", "Stress addiction"],
      notSelfBehavior: "Hurrying through life, taking on tasks just to release pressure, becoming stressed about others' deadlines."
    }
  }
};

export const CenterDetailModal = ({ centerName, chart, onClose }: CenterDetailModalProps) => {
  const centerInfo = CENTER_DATA[centerName];
  const isDefined = chart.definedCenters.includes(centerName);
  const gates = getGatesByCenter(centerName);
  
  // Get activated gates for this center
  const activatedGates = new Set<number>();
  chart.personalityActivations.forEach(a => activatedGates.add(a.gate));
  chart.designActivations.forEach(a => activatedGates.add(a.gate));
  
  const centerGatesActivated = gates.filter(g => activatedGates.has(g.number));

  if (!centerInfo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-card border border-border rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-start justify-between">
          <div>
            <h2 className="font-serif text-xl text-foreground">{centerName} Center</h2>
            <p className="text-sm text-muted-foreground mt-1">{centerInfo.function}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Status */}
          <div className="flex gap-2 flex-wrap">
            <span className={`px-2 py-1 text-xs rounded border ${
              isDefined 
                ? 'bg-primary/20 text-primary border-primary/30'
                : 'bg-muted text-muted-foreground border-border'
            }`}>
              {isDefined ? 'Defined' : 'Undefined'}
            </span>
            <span className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">
              {gates.length} gates
            </span>
          </div>

          {/* Core theme */}
          <div className="bg-muted/30 rounded p-3">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Core Question
            </span>
            <p className="mt-1 text-sm font-medium text-foreground italic">
              "{centerInfo.themes}"
            </p>
          </div>

          {/* Biological correlation */}
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Biological correlation:</span> {centerInfo.biologicalCorrelation}
          </p>

          {/* Your activation */}
          {centerGatesActivated.length > 0 && (
            <div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Your Activated Gates in This Center
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {centerGatesActivated.map(gate => (
                  <span key={gate.number} className="px-2 py-1 text-xs bg-primary/10 rounded">
                    {gate.number}: {gate.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Defined or Undefined information */}
          {isDefined ? (
            <div className="space-y-3">
              <div className="bg-primary/5 border border-primary/20 rounded p-3">
                <span className="text-[10px] uppercase tracking-widest text-primary/70">
                  When Defined (Your Experience)
                </span>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {centerInfo.whenDefined.description}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Your Gifts
                </span>
                <ul className="mt-2 space-y-1">
                  {centerInfo.whenDefined.gifts.map((gift, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">+</span>
                      {gift}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Potential Shadow
                </span>
                <p className="mt-1 text-sm text-muted-foreground">
                  {centerInfo.whenDefined.shadow}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-muted/50 border border-border rounded p-3">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  When Undefined (Your Experience)
                </span>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {centerInfo.whenUndefined.wisdom}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Common Conditioning
                </span>
                <ul className="mt-2 space-y-1">
                  {centerInfo.whenUndefined.conditioning.map((cond, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-yellow-500">!</span>
                      {cond}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Not-Self Behavior
                </span>
                <p className="mt-1 text-sm text-muted-foreground">
                  {centerInfo.whenUndefined.notSelfBehavior}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

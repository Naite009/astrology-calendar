import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Complete planet data with symbols, names, and descriptions
const PLANET_DATA: Record<string, { symbol: string; name: string; brief: string }> = {
  // Classical planets
  sun: { symbol: '☉', name: 'Sun', brief: 'Core identity, vitality, life force, ego' },
  moon: { symbol: '☽', name: 'Moon', brief: 'Emotions, instincts, inner world, mother' },
  mercury: { symbol: '☿', name: 'Mercury', brief: 'Mind, communication, thinking, learning' },
  venus: { symbol: '♀', name: 'Venus', brief: 'Love, beauty, values, relationships, money' },
  mars: { symbol: '♂', name: 'Mars', brief: 'Drive, desire, action, anger, passion' },
  jupiter: { symbol: '♃', name: 'Jupiter', brief: 'Expansion, luck, faith, meaning, growth' },
  saturn: { symbol: '♄', name: 'Saturn', brief: 'Discipline, structure, limits, mastery, time' },
  uranus: { symbol: '♅', name: 'Uranus', brief: 'Freedom, rebellion, innovation, awakening' },
  neptune: { symbol: '♆', name: 'Neptune', brief: 'Dreams, spirituality, illusion, transcendence' },
  pluto: { symbol: '♇', name: 'Pluto', brief: 'Power, transformation, death/rebirth, shadow' },
  
  // Points
  ascendant: { symbol: 'AC', name: 'Ascendant', brief: 'Rising sign, persona, first impressions' },
  midheaven: { symbol: 'MC', name: 'Midheaven', brief: 'Career, public image, life direction' },
  mc: { symbol: 'MC', name: 'Midheaven', brief: 'Career, public image, life direction' },
  ic: { symbol: 'IC', name: 'Imum Coeli', brief: 'Roots, home, private self, foundation' },
  descendant: { symbol: 'DC', name: 'Descendant', brief: 'Partnerships, others, what you attract' },
  northnode: { symbol: '☊', name: 'North Node', brief: 'Destiny, soul growth direction, dharma' },
  southnode: { symbol: '☋', name: 'South Node', brief: 'Past life gifts, comfort zone, karma' },
  
  // Asteroids
  chiron: { symbol: '⚷', name: 'Chiron', brief: 'Deepest wound, healing gift, mentor' },
  lilith: { symbol: '⚸', name: 'Black Moon Lilith', brief: 'Wild feminine, rage, untamed power' },
  ceres: { symbol: '⚳', name: 'Ceres', brief: 'Nurturing, mothering, nourishment, cycles' },
  pallas: { symbol: '⚴', name: 'Pallas', brief: 'Wisdom, strategy, pattern recognition' },
  juno: { symbol: '⚵', name: 'Juno', brief: 'Partnership, commitment, marriage needs' },
  vesta: { symbol: '⚶', name: 'Vesta', brief: 'Sacred focus, devotion, ritual dedication' },
  partoffortune: { symbol: '⊕', name: 'Part of Fortune', brief: 'Luck, abundance, worldly success' },
  vertex: { symbol: 'Vx', name: 'Vertex', brief: 'Fated encounters, destiny points' },
  
  // Dwarf planets / TNOs
  eris: { symbol: '⯰', name: 'Eris', brief: 'Soul purpose, feminine warrior, necessary discord' },
  sedna: { symbol: '⯲', name: 'Sedna', brief: 'Deep betrayal, victim to sovereign, ancestral trauma' },
  makemake: { symbol: '🜨', name: 'Makemake', brief: 'Primal creation, environmental awareness' },
  haumea: { symbol: '🜵', name: 'Haumea', brief: 'Rebirth, regeneration, creative life force' },
  quaoar: { symbol: '🝾', name: 'Quaoar', brief: 'Creation through rhythm, sacred manifestation' },
  orcus: { symbol: '🝿', name: 'Orcus', brief: 'Oaths, promises, karmic contracts, integrity' },
  ixion: { symbol: '⯳', name: 'Ixion', brief: 'Entitlement vs gratitude, ethical lessons' },
  varuna: { symbol: '⯴', name: 'Varuna', brief: 'Cosmic law, vast vision, truth/lies' },
  pholus: { symbol: '⯛', name: 'Pholus', brief: 'Small cause → big effect, catalyst, turning points' },
  nessus: { symbol: '⯜', name: 'Nessus', brief: 'Ending abuse cycles, "the buck stops here"' },
  gonggong: { symbol: '🝻', name: 'Gonggong', brief: 'Chaos, floods, upheaval, necessary destruction' },
  salacia: { symbol: '🝼', name: 'Salacia', brief: 'Ocean depths, mystery, hidden realms' },
};

// Get symbol for a planet key
export const getPlanetSymbol = (planet: string): string => {
  const key = planet.toLowerCase().replace(/\s/g, '');
  return PLANET_DATA[key]?.symbol || planet.charAt(0);
};

// Get full name for a planet key
export const getPlanetName = (planet: string): string => {
  const key = planet.toLowerCase().replace(/\s/g, '');
  return PLANET_DATA[key]?.name || planet;
};

// Get brief description for a planet key
export const getPlanetBrief = (planet: string): string => {
  const key = planet.toLowerCase().replace(/\s/g, '');
  return PLANET_DATA[key]?.brief || '';
};

interface PlanetSymbolProps {
  planet: string;
  className?: string;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Renders a planet symbol with a tooltip showing full name and description.
 * Use this component anywhere planet symbols are displayed to provide consistent tooltips.
 */
export const PlanetSymbol = ({ 
  planet, 
  className = '', 
  showName = false,
  size = 'md'
}: PlanetSymbolProps) => {
  const key = planet.toLowerCase().replace(/\s/g, '');
  const data = PLANET_DATA[key];
  const symbol = data?.symbol || planet.charAt(0);
  const name = data?.name || planet;
  const brief = data?.brief || '';

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 cursor-help ${className}`}>
            <span className={sizeClasses[size]}>{symbol}</span>
            {showName && <span className="text-sm">{name}</span>}
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs bg-popover border border-border shadow-lg"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-medium">
              <span className="text-lg">{symbol}</span>
              <span>{name}</span>
            </div>
            {brief && (
              <p className="text-xs text-muted-foreground">{brief}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PlanetSymbol;

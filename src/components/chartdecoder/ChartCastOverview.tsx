import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartPlanet, getPlanetSymbol, getSignSymbol, computeDignity } from '@/lib/chartDecoderLogic';
import { getDignityStatus } from '@/lib/planetDignities';
import { generateCharacterProfile, CharacterProfile, PLANET_ROLES, HOUSE_STAGES } from '@/lib/cinematicNarrative';

// Traditional rulers for determining chart ruler
const SIGN_RULERS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter'
};

interface ChartCastOverviewProps {
  planets: ChartPlanet[];
  onSelectPlanet: (planetName: string) => void;
  selectedPlanet: string | null;
  useTraditional?: boolean;
}

export const ChartCastOverview: React.FC<ChartCastOverviewProps> = ({
  planets,
  onSelectPlanet,
  selectedPlanet,
  useTraditional = true
}) => {
  // Determine chart ruler based on Ascendant sign
  const ascendant = planets.find(p => p.name === 'Ascendant');
  const chartRuler = ascendant ? SIGN_RULERS[ascendant.sign] : null;
  
  // Find signs of Sun, Moon, Ascendant to determine which planets rule key placements
  const sunSign = planets.find(p => p.name === 'Sun')?.sign;
  const moonSign = planets.find(p => p.name === 'Moon')?.sign;
  const ascSign = ascendant?.sign;
  
  // Planets that rule key placements get elevated importance
  const rulingPlanets = new Set<string>();
  if (sunSign) rulingPlanets.add(SIGN_RULERS[sunSign]);
  if (moonSign) rulingPlanets.add(SIGN_RULERS[moonSign]);
  if (ascSign) rulingPlanets.add(SIGN_RULERS[ascSign]);

  // Generate profiles for all planets with adjusted importance
  const profiles = React.useMemo(() => 
    planets.map(p => {
      const profile = generateCharacterProfile(p, useTraditional);
      
      // Elevate chart ruler and planets ruling Sun/Moon/Asc to lead status
      if (rulingPlanets.has(p.name) && profile.who.importance !== 'lead') {
        const isChartRuler = p.name === chartRuler;
        return {
          ...profile,
          who: {
            ...profile.who,
            importance: 'lead' as const,
            role: isChartRuler 
              ? `The Chart Ruler / ${profile.who.role}`
              : `Key Ruler / ${profile.who.role}`
          }
        };
      }
      return profile;
    }),
    [planets, useTraditional, chartRuler, rulingPlanets]
  );

  // Group by importance
  const leadCharacters = profiles.filter(p => p.who.importance === 'lead');
  const supportingCast = profiles.filter(p => p.who.importance === 'supporting');
  const backgroundPlayers = profiles.filter(p => p.who.importance === 'background');
  const specialGuests = profiles.filter(p => p.who.importance === 'special_guest');

  return (
    <div className="space-y-6">
      {/* Movie Poster Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-serif text-foreground">🎬 Your Cast of Characters</h3>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Every planet is an actor in your life's movie. Tap any character to see their full profile.
        </p>
      </div>

      {/* Lead Characters */}
      <CastSection 
        title="🌟 Lead Characters"
        subtitle="The main players whose stories drive your narrative"
        profiles={leadCharacters}
        selectedPlanet={selectedPlanet}
        onSelectPlanet={onSelectPlanet}
        featured
      />

      {/* Supporting Cast */}
      <CastSection 
        title="🎭 Supporting Cast"
        subtitle="Essential characters who enrich your story"
        profiles={supportingCast}
        selectedPlanet={selectedPlanet}
        onSelectPlanet={onSelectPlanet}
      />

      {/* Background & Special Guests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CastSection 
          title="🌌 Background Players"
          subtitle="Generational themes shaping your era"
          profiles={backgroundPlayers}
          selectedPlanet={selectedPlanet}
          onSelectPlanet={onSelectPlanet}
          compact
        />
        <CastSection 
          title="✨ Special Guests"
          subtitle="Unique points & asteroids"
          profiles={specialGuests}
          selectedPlanet={selectedPlanet}
          onSelectPlanet={onSelectPlanet}
          compact
        />
      </div>
    </div>
  );
};

// Sub-components
interface CastSectionProps {
  title: string;
  subtitle: string;
  profiles: CharacterProfile[];
  selectedPlanet: string | null;
  onSelectPlanet: (name: string) => void;
  featured?: boolean;
  compact?: boolean;
}

const CastSection: React.FC<CastSectionProps> = ({
  title,
  subtitle,
  profiles,
  selectedPlanet,
  onSelectPlanet,
  featured = false,
  compact = false
}) => {
  if (profiles.length === 0) return null;

  return (
    <Card className={featured ? 'border-primary/30 bg-primary/5' : ''}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-3 ${
          featured ? 'grid-cols-1 md:grid-cols-3' : 
          compact ? 'grid-cols-2 sm:grid-cols-3' : 
          'grid-cols-2 md:grid-cols-4'
        }`}>
          {profiles.map(profile => (
            <CharacterCard 
              key={profile.planet.name}
              profile={profile}
              isSelected={selectedPlanet === profile.planet.name}
              onClick={() => onSelectPlanet(profile.planet.name)}
              featured={featured}
              compact={compact}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface CharacterCardProps {
  profile: CharacterProfile;
  isSelected: boolean;
  onClick: () => void;
  featured?: boolean;
  compact?: boolean;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  profile,
  isSelected,
  onClick,
  featured = false,
  compact = false
}) => {
  const { planet, who, how, where, dignity } = profile;
  const status = getDignityStatus(planet.name, planet.sign);
  
  // Volume indicator
  const volumeIcon = where.volume === 'loud' ? '🔊' : where.volume === 'quiet' ? '🔇' : '🔉';

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`
          p-2 rounded-lg border text-left transition-all
          ${isSelected 
            ? 'border-primary bg-primary/10 ring-1 ring-primary' 
            : 'border-border/50 hover:border-primary/50 hover:bg-secondary/30'
          }
        `}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl" style={{ color: status.color }}>
            {getPlanetSymbol(planet.name)}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate">{planet.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">
              {getSignSymbol(planet.sign)} H{planet.house || '?'}
            </p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`
        p-3 rounded-lg border text-left transition-all
        ${isSelected 
          ? 'border-primary bg-primary/10 ring-2 ring-primary' 
          : 'border-border/50 hover:border-primary/50 hover:bg-secondary/30'
        }
        ${featured ? 'min-h-[140px]' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl" style={{ color: status.color }}>
          {getPlanetSymbol(planet.name)}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-xs" title={`Volume: ${where.volume}`}>{volumeIcon}</span>
          {planet.retrograde && <span className="text-xs text-amber-500" title="Retrograde">℞</span>}
        </div>
      </div>

      {/* Name & Role */}
      <h4 className="font-medium text-sm text-foreground">{planet.name}</h4>
      <p className="text-[10px] text-primary font-medium">{who.role}</p>

      {/* WHO / HOW / WHERE */}
      <div className="mt-2 space-y-1 text-[10px]">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">HOW:</span>
          <span className="text-foreground">{getSignSymbol(planet.sign)} {planet.sign}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">WHERE:</span>
          <span className="text-foreground">House {planet.house || '?'}</span>
        </div>
      </div>

      {/* Dignity Badge */}
      <div className="mt-2">
        <Badge 
          variant="outline" 
          className="text-[9px] px-1.5"
          style={{ borderColor: status.color, color: status.color }}
        >
          {dignity}
        </Badge>
      </div>

      {/* Featured: Show costume snippet */}
      {featured && (
        <p className="mt-2 text-[10px] text-muted-foreground line-clamp-2">
          Wearing {how.costume}
        </p>
      )}
    </button>
  );
};

export default ChartCastOverview;

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { getMoonPhase } from '@/lib/astrology';
import { PLANET_IN_SIGN } from '@/lib/planetSignExpressions';
import { PLANET_ESSENCES, HOUSE_MEANINGS } from '@/lib/detailedInterpretations';
import { getDecan } from '@/lib/decans';
import { SABIAN_SYMBOLS } from '@/lib/sabianSymbols';
import { getPlanetSignInterpretation } from '@/lib/planetSignInterpretations';
import { BookOpen, Star, Moon, Sun, Compass, Sparkles, GraduationCap, Quote, Zap, CloudLightning } from 'lucide-react';

interface PlanetData {
  name: string;
  symbol: string;
  degree: number;
  signName: string;
  sign: string;
  isRetrograde: boolean;
}

interface PlanetDetailModalProps {
  planet: PlanetData | null;
  isOpen: boolean;
  onClose: () => void;
  currentTime: Date;
}

// Get element for a sign
const getElement = (sign: string): { element: string; quality: string } => {
  const elements: Record<string, { element: string; quality: string }> = {
    Aries: { element: 'Fire', quality: 'Cardinal' },
    Taurus: { element: 'Earth', quality: 'Fixed' },
    Gemini: { element: 'Air', quality: 'Mutable' },
    Cancer: { element: 'Water', quality: 'Cardinal' },
    Leo: { element: 'Fire', quality: 'Fixed' },
    Virgo: { element: 'Earth', quality: 'Mutable' },
    Libra: { element: 'Air', quality: 'Cardinal' },
    Scorpio: { element: 'Water', quality: 'Fixed' },
    Sagittarius: { element: 'Fire', quality: 'Mutable' },
    Capricorn: { element: 'Earth', quality: 'Cardinal' },
    Aquarius: { element: 'Air', quality: 'Fixed' },
    Pisces: { element: 'Water', quality: 'Mutable' },
  };
  return elements[sign] || { element: 'Unknown', quality: 'Unknown' };
};

// Get planetary dignity
const getDignity = (planet: string, sign: string): { status: string; description: string } | null => {
  const dignities: Record<string, Record<string, { status: string; description: string }>> = {
    Sun: {
      Leo: { status: 'Domicile', description: 'The Sun rules Leo — it\'s at home here, expressing with full vitality and creative power.' },
      Aries: { status: 'Exalted', description: 'The Sun is exalted in Aries — the ego and identity are emboldened with pioneering courage.' },
      Aquarius: { status: 'Detriment', description: 'The Sun in Aquarius must work harder — individual ego meets collective consciousness.' },
      Libra: { status: 'Fall', description: 'The Sun falls in Libra — identity diffuses through relationship, requiring balance.' },
    },
    Moon: {
      Cancer: { status: 'Domicile', description: 'The Moon rules Cancer — emotions flow naturally, nurturing comes instinctively.' },
      Taurus: { status: 'Exalted', description: 'The Moon is exalted in Taurus — emotions stabilize in earthy comfort and security.' },
      Capricorn: { status: 'Detriment', description: 'The Moon in Capricorn must structure feelings — emotions require discipline.' },
      Scorpio: { status: 'Fall', description: 'The Moon falls in Scorpio — emotions intensify, requiring transformation.' },
    },
    Mercury: {
      Gemini: { status: 'Domicile', description: 'Mercury rules Gemini — the mind is quick, curious, and endlessly adaptive.' },
      Virgo: { status: 'Domicile & Exalted', description: 'Mercury both rules and is exalted in Virgo — analytical precision at its peak.' },
      Sagittarius: { status: 'Detriment', description: 'Mercury in Sagittarius thinks big — details may blur in the search for meaning.' },
      Pisces: { status: 'Detriment & Fall', description: 'Mercury in Pisces thinks in dreams — logic dissolves into intuition.' },
    },
    Venus: {
      Taurus: { status: 'Domicile', description: 'Venus rules Taurus — love is sensual, stable, and deeply appreciative of beauty.' },
      Libra: { status: 'Domicile', description: 'Venus rules Libra — love expresses through harmony, partnership, and aesthetic grace.' },
      Pisces: { status: 'Exalted', description: 'Venus is exalted in Pisces — love becomes unconditional, boundless, transcendent.' },
      Aries: { status: 'Detriment', description: 'Venus in Aries loves passionately but impatiently — the chase excites.' },
      Scorpio: { status: 'Detriment', description: 'Venus in Scorpio loves intensely — attraction becomes obsession.' },
      Virgo: { status: 'Fall', description: 'Venus falls in Virgo — love is analytical, perhaps too critical.' },
    },
    Mars: {
      Aries: { status: 'Domicile', description: 'Mars rules Aries — pure warrior energy, direct action, unstoppable will.' },
      Scorpio: { status: 'Traditional Domicile', description: 'Mars traditionally ruled Scorpio — strategic power, controlled intensity.' },
      Capricorn: { status: 'Exalted', description: 'Mars is exalted in Capricorn — ambition combines with disciplined action.' },
      Libra: { status: 'Detriment', description: 'Mars in Libra acts through partnership — aggression becomes diplomacy.' },
      Taurus: { status: 'Detriment', description: 'Mars in Taurus acts slowly but unstoppably — patience as power.' },
      Cancer: { status: 'Fall', description: 'Mars falls in Cancer — action filtered through emotion, defensive rather than offensive.' },
    },
    Jupiter: {
      Sagittarius: { status: 'Domicile', description: 'Jupiter rules Sagittarius — expansion is natural, wisdom flows freely.' },
      Pisces: { status: 'Traditional Domicile', description: 'Jupiter traditionally ruled Pisces — spiritual growth, boundless compassion.' },
      Cancer: { status: 'Exalted', description: 'Jupiter is exalted in Cancer — growth through nurturing, emotional generosity.' },
      Gemini: { status: 'Detriment', description: 'Jupiter in Gemini scatters wisdom — many ideas, less depth.' },
      Virgo: { status: 'Detriment', description: 'Jupiter in Virgo expands through details — growth through service.' },
      Capricorn: { status: 'Fall', description: 'Jupiter falls in Capricorn — optimism meets pragmatic limits.' },
    },
    Saturn: {
      Capricorn: { status: 'Domicile', description: 'Saturn rules Capricorn — structure, discipline, and mastery are natural.' },
      Aquarius: { status: 'Traditional Domicile', description: 'Saturn traditionally ruled Aquarius — innovation through discipline.' },
      Libra: { status: 'Exalted', description: 'Saturn is exalted in Libra — justice, fair judgment, balanced authority.' },
      Cancer: { status: 'Detriment', description: 'Saturn in Cancer restricts emotions — feelings need structure.' },
      Leo: { status: 'Detriment', description: 'Saturn in Leo limits self-expression — creativity requires discipline.' },
      Aries: { status: 'Fall', description: 'Saturn falls in Aries — patience conflicts with impulse.' },
    },
  };
  return dignities[planet]?.[sign] || null;
};

// Chris Brennan-style Hellenistic interpretation
const getHellenisticPerspective = (planet: string, sign: string): string => {
  const rich = getPlanetSignInterpretation(planet, sign);
  if (rich) return rich.hellenistic;
  return `The ${planet} in ${sign} represents a significant archetypal combination. In the Hellenistic tradition, we examine the condition of this planet by its essential dignities, sect, and relationship to other planets. This placement shapes how the ${planet}'s core significations manifest in the native's life.`;
};

// Modern psychological perspective
const getModernPerspective = (planet: string, sign: string): string => {
  const rich = getPlanetSignInterpretation(planet, sign);
  if (rich) return rich.modern;
  const expression = PLANET_IN_SIGN[planet]?.[sign];
  if (expression) return expression;
  return `${planet} in ${sign} represents a core archetypal pattern in your psyche. This placement shapes how you express the ${planet}'s function through ${sign} themes and qualities.`;
};

// Practical guidance
const getPracticalGuidance = (planet: string, sign: string): string => {
  const rich = getPlanetSignInterpretation(planet, sign);
  if (rich) return rich.practical;
  return `Work with ${planet} in ${sign} by understanding how this archetypal pattern wants to express in your life. Notice when you're aligned with its highest expression versus its shadow.`;
};

// Superpower & Shadow
const getSuperpower = (planet: string, sign: string): string | null => {
  return getPlanetSignInterpretation(planet, sign)?.superpower ?? null;
};
const getShadow = (planet: string, sign: string): string | null => {
  return getPlanetSignInterpretation(planet, sign)?.shadow ?? null;
};

export const PlanetDetailModal = ({ planet, isOpen, onClose, currentTime }: PlanetDetailModalProps) => {
  if (!planet) return null;
  
  const moonPhase = planet.name === 'Moon' ? getMoonPhase(currentTime) : null;
  const { element, quality } = getElement(planet.signName);
  const decan = getDecan(planet.degree, planet.signName);
  const dignity = getDignity(planet.name, planet.signName);
  
  // Get Sabian symbol (degrees are 1-30 in Sabian system)
  const sabianKey = `${planet.degree + 1}-${planet.signName}`;
  const sabianSymbol = SABIAN_SYMBOLS[sabianKey];
  
  // Get planet essence
  const planetKey = planet.name.toLowerCase().replace(' ', '');
  const planetEssence = PLANET_ESSENCES[planetKey];
  
  // Get interpretations
  const hellenisticView = getHellenisticPerspective(planet.name, planet.signName);
  const modernView = getModernPerspective(planet.name, planet.signName);
  const practicalView = getPracticalGuidance(planet.name, planet.signName);
  const superpower = getSuperpower(planet.name, planet.signName);
  const shadow = getShadow(planet.name, planet.signName);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6 space-y-6">
            {/* Header */}
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{planet.symbol}</div>
                <div>
                  <DialogTitle className="text-2xl font-serif flex items-center gap-2">
                    {planet.name} in {planet.signName}
                    {planet.isRetrograde && <span className="text-red-500 text-lg">℞</span>}
                  </DialogTitle>
                  <DialogDescription className="text-lg text-primary font-medium">
                    {planet.degree}° {planet.sign} — {decan.degrees} ({decan.number}{decan.number === 1 ? 'st' : decan.number === 2 ? 'nd' : 'rd'} Decan)
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-secondary rounded-sm text-center">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Element</div>
                <div className="font-medium text-foreground">{element}</div>
              </div>
              <div className="p-3 bg-secondary rounded-sm text-center">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Quality</div>
                <div className="font-medium text-foreground">{quality}</div>
              </div>
              <div className="p-3 bg-secondary rounded-sm text-center">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Decan Ruler</div>
                <div className="font-medium text-foreground">{decan.rulerSymbol} {decan.ruler}</div>
              </div>
              {moonPhase && (
                <div className="p-3 bg-secondary rounded-sm text-center">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Moon Phase</div>
                  <div className="font-medium text-foreground">{moonPhase.phaseIcon} {moonPhase.phaseName}</div>
                </div>
              )}
              {!moonPhase && dignity && (
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-sm text-center">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Dignity</div>
                  <div className="font-medium text-amber-700 dark:text-amber-400">{dignity.status}</div>
                </div>
              )}
            </div>

            {/* Dignity explanation if applicable */}
            {dignity && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-sm border border-amber-200 dark:border-amber-700">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="text-amber-600" size={18} />
                  <span className="font-medium text-foreground">Essential Dignity: {dignity.status}</span>
                </div>
                <p className="text-sm text-muted-foreground">{dignity.description}</p>
              </div>
            )}

            {/* Planet Essence */}
            {planetEssence && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-primary" size={18} />
                    <h3 className="font-serif text-lg">What {planet.name} Represents</h3>
                  </div>
                  <p className="text-foreground">{planetEssence.essence}</p>
                  <p className="text-sm text-muted-foreground italic">Keywords: {planetEssence.represents}</p>
                </div>
              </>
            )}

            {/* Sabian Symbol */}
            {sabianSymbol && (
              <>
                <Separator />
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-sm border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Compass className="text-purple-600" size={18} />
                    <span className="font-medium text-foreground">Sabian Symbol: {planet.degree + 1}° {planet.signName}</span>
                  </div>
                  <p className="text-foreground font-serif text-lg mb-2">"{sabianSymbol.symbol}"</p>
                  <p className="text-sm text-muted-foreground">{sabianSymbol.meaning}</p>
                </div>
              </>
            )}

            {/* Decan Description */}
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sun className="text-primary" size={18} />
                <h3 className="font-serif text-lg">Decan Influence</h3>
              </div>
              <p className="text-muted-foreground">{decan.description}</p>
            </div>

            {/* Moon Phase Details */}
            {moonPhase && (
              <>
                <Separator />
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-sm border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Moon className="text-blue-600" size={18} />
                    <span className="font-medium text-foreground">Current Lunar Phase</span>
                  </div>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-4xl">{moonPhase.phaseIcon}</span>
                    <div>
                      <p className="text-lg font-medium text-foreground">{moonPhase.phaseName}</p>
                      <p className="text-sm text-muted-foreground">{Math.round(moonPhase.illumination * 100)}% illuminated</p>
                    </div>
                  </div>
                  {moonPhase.isBalsamic && (
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      🌙 Balsamic Moon — Time for release, rest, and reflection before the new cycle.
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Hellenistic/Traditional Perspective */}
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Quote className="text-primary" size={18} />
                <h3 className="font-serif text-lg">Hellenistic Perspective</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">{hellenisticView}</p>
            </div>

            {/* Modern Psychological View */}
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="text-primary" size={18} />
                <h3 className="font-serif text-lg">Modern Psychological Expression</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">{modernView}</p>
            </div>

            {/* Superpower & Shadow */}
            {(superpower || shadow) && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {superpower && (
                    <div className="p-4 bg-primary/5 rounded-sm border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="text-primary" size={18} />
                        <span className="font-medium text-foreground">Superpower</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{superpower}</p>
                    </div>
                  )}
                  {shadow && (
                    <div className="p-4 bg-accent/5 rounded-sm border border-accent/20">
                      <div className="flex items-center gap-2 mb-2">
                        <CloudLightning className="text-accent-foreground" size={18} />
                        <span className="font-medium text-foreground">Shadow</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{shadow}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Practical Guidance */}
            <Separator />
            <div className="p-4 bg-primary/5 rounded-sm border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="text-primary" size={18} />
                <span className="font-medium text-foreground">Working With This Placement</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">{practicalView}</p>
            </div>

            {/* Educational Footer */}
            <div className="pt-4 text-xs text-muted-foreground text-center border-t border-border">
              <p>This interpretation draws from Hellenistic tradition (Demetra George), 
              modern psychological astrology, and the Sabian Symbols (Marc Edmund Jones, Dane Rudhyar).</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

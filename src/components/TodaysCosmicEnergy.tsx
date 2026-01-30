import { useState, useEffect } from "react";
import { Sparkles, Moon, Sun, Clock, ArrowRight, Loader2, RefreshCw, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { getMoonPhase, getPlanetaryPositions, calculateDailyAspects, PlanetaryPositions } from "@/lib/astrology";
import ReactMarkdown from "react-markdown";

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓"
};

interface CosmicData {
  date: string;
  moonPhase: string;
  moonSign: string;
  moonDegrees: number;
  sunSign: string;
  sunDegrees: number;
  insight: string;
}

// Simple stellium detection
function findStelliums(planets: PlanetaryPositions): Array<{ sign: string; planets: string[] }> {
  const signCounts: Record<string, string[]> = {};
  
  Object.entries(planets).forEach(([name, data]) => {
    if (data?.sign) {
      if (!signCounts[data.sign]) {
        signCounts[data.sign] = [];
      }
      signCounts[data.sign].push(name);
    }
  });
  
  return Object.entries(signCounts)
    .filter(([_, names]) => names.length >= 3)
    .map(([sign, names]) => ({ sign, planets: names }));
}

export const TodaysCosmicEnergy = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cosmicData, setCosmicData] = useState<CosmicData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const fetchCosmicWeather = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current astronomical data
      const moonPhase = getMoonPhase(today);
      const planets = getPlanetaryPositions(today);
      const aspects = calculateDailyAspects(planets);
      const stelliums = findStelliums(planets);

      // Build planet positions array for the edge function
      const planetPositions = Object.entries(planets).map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        sign: data?.sign || 'Unknown',
        degree: data?.degree || 0
      }));

      // Call edge function
      const { data, error: fnError } = await supabase.functions.invoke('cosmic-weather', {
        body: {
          date: todayStr,
          moonPhase: moonPhase.phaseName,
          moonSign: planets.moon?.sign || 'Unknown',
          planetPositions,
          aspects: aspects.slice(0, 5).map(a => ({
            planet1: a.planet1.toLowerCase(),
            planet2: a.planet2.toLowerCase(),
            symbol: a.type === 'Conjunction' ? '☌' : a.type === 'Trine' ? '△' : a.type === 'Square' ? '□' : a.type === 'Opposition' ? '☍' : a.type === 'Sextile' ? '⚹' : '●'
          })),
          stelliums: stelliums.map(s => ({
            sign: s.sign,
            count: s.planets.length,
            planets: s.planets.map(p => ({ name: p }))
          })),
          mercuryRetro: false
        }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to fetch cosmic weather');
      }

      setCosmicData({
        date: todayStr,
        moonPhase: moonPhase.phaseName,
        moonSign: planets.moon?.sign || 'Unknown',
        moonDegrees: planets.moon?.degree || 0,
        sunSign: planets.sun?.sign || 'Unknown',
        sunDegrees: planets.sun?.degree || 0,
        insight: data.insight
      });
      setLastFetched(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Cosmic weather error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load cosmic weather');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !cosmicData && !isLoading) {
      fetchCosmicWeather();
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Get current moon phase quickly for the button
  const moonPhase = getMoonPhase(today);
  const planets = getPlanetaryPositions(today);

  return (
    <>
      {/* Large Prominent Button */}
      <div className="mb-6 print:hidden">
        <Button
          onClick={handleOpen}
          size="lg"
          className="w-full h-16 text-lg font-serif bg-gradient-to-r from-primary via-primary/90 to-primary hover:from-primary/90 hover:via-primary/80 hover:to-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <div className="flex items-center justify-center gap-4 w-full">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 animate-pulse" />
              <span className="tracking-wide">Today's Cosmic Energy</span>
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div className="hidden sm:flex items-center gap-2 text-primary-foreground/80 text-sm font-sans">
              <Moon className="h-4 w-4" />
              <span>{moonPhase.phaseName}</span>
              <span>in</span>
              <span>{ZODIAC_SYMBOLS[planets.moon?.sign || ''] || ''} {planets.moon?.sign}</span>
            </div>
            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </Button>
      </div>

      {/* Full-Screen Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen px-4 py-8 md:px-8">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="fixed top-4 right-4 z-50 h-12 w-12 rounded-full bg-secondary/80 hover:bg-secondary"
            >
              <X className="h-6 w-6" />
            </Button>

            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="font-serif text-4xl md:text-5xl font-light tracking-wide text-foreground mb-4">
                  Today's Cosmic Energy
                </h1>
                <p className="text-lg text-muted-foreground">{todayStr}</p>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <Moon className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Moon Phase</p>
                    <p className="font-medium">{moonPhase.phaseName}</p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <Moon className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Moon Sign</p>
                    <p className="font-medium">
                      {ZODIAC_SYMBOLS[planets.moon?.sign || '']} {planets.moon?.sign}
                      <span className="text-muted-foreground text-sm ml-1">
                        ({planets.moon?.degree || 0}°)
                      </span>
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-amber-500/5 border-amber-500/20">
                  <CardContent className="p-4 text-center">
                    <Sun className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Sun Sign</p>
                    <p className="font-medium">
                      {ZODIAC_SYMBOLS[planets.sun?.sign || '']} {planets.sun?.sign}
                      <span className="text-muted-foreground text-sm ml-1">
                        ({planets.sun?.degree || 0}°)
                      </span>
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-secondary border-border">
                  <CardContent className="p-4 text-center">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Illumination</p>
                    <p className="font-medium">{Math.round(moonPhase.illumination * 100)}%</p>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Card */}
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif text-2xl font-light flex items-center gap-3">
                      <Sparkles className="h-6 w-6 text-primary" />
                      Cosmic Weather
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchCosmicWeather}
                      disabled={isLoading}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                  {lastFetched && (
                    <p className="text-xs text-muted-foreground">Last updated: {lastFetched}</p>
                  )}
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-muted-foreground">Reading the cosmic weather...</p>
                    </div>
                  )}

                  {error && (
                    <div className="text-center py-8">
                      <p className="text-destructive mb-4">{error}</p>
                      <Button variant="outline" onClick={fetchCosmicWeather}>
                        Try Again
                      </Button>
                    </div>
                  )}

                  {!isLoading && !error && cosmicData && (
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          h2: ({ children }) => (
                            <h2 className="font-serif text-xl font-medium text-foreground mt-6 mb-3 pb-2 border-b border-primary/10 first:mt-0">
                              {children}
                            </h2>
                          ),
                          ul: ({ children }) => (
                            <ul className="space-y-2 my-4">{children}</ul>
                          ),
                          li: ({ children }) => (
                            <li className="flex items-start gap-2">
                              <span className="text-primary mt-1.5">•</span>
                              <span>{children}</span>
                            </li>
                          ),
                          p: ({ children }) => (
                            <p className="text-foreground/90 leading-relaxed my-3">{children}</p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-foreground">{children}</strong>
                          ),
                        }}
                      >
                        {cosmicData.insight}
                      </ReactMarkdown>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Current Planetary Positions */}
              <Card className="mt-6 border-border">
                <CardHeader>
                  <CardTitle className="font-serif text-lg font-light">Current Planetary Positions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(planets).map(([planet, data]) => {
                      if (!data || !data.sign) return null;
                      return (
                        <Badge 
                          key={planet} 
                          variant="secondary" 
                          className="text-sm py-1.5 px-3"
                        >
                          <span className="mr-1">{ZODIAC_SYMBOLS[data.sign] || ''}</span>
                          <span className="capitalize">{planet}</span>
                          <span className="text-muted-foreground ml-1">
                            {data.degree}° {data.sign}
                          </span>
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Back Button */}
              <div className="mt-8 text-center">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleClose}
                  className="px-8"
                >
                  Return to Calendar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

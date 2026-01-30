import { useState, useEffect, useRef } from "react";
import { Sparkles, Moon, Sun, Clock, ArrowRight, Loader2, RefreshCw, X, Utensils, Download, Share2, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { getMoonPhase, getPlanetaryPositions, calculateDailyAspects, PlanetaryPositions } from "@/lib/astrology";
import ReactMarkdown from "react-markdown";
import html2canvas from "html2canvas";
import { toast } from "@/hooks/use-toast";

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
  generatedAt: string;
  sunSign: string;
  sunDegrees: number;
  insight: string;
}

interface WeekDay {
  date: Date;
  dateStr: string;
  dayName: string;
  moonSign: string;
  moonPhase: string;
  sunSign: string;
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

// Get next 7 days forecast data
function getWeekForecast(): WeekDay[] {
  const days: WeekDay[] = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const planets = getPlanetaryPositions(date);
    const moonPhase = getMoonPhase(date);
    
    days.push({
      date,
      dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' }),
      moonSign: planets.moon?.sign || 'Unknown',
      moonPhase: moonPhase.phaseName,
      sunSign: planets.sun?.sign || 'Unknown',
    });
  }
  
  return days;
}

// Get moon phase emoji
function getMoonPhaseEmoji(phase: string): string {
  const phaseMap: Record<string, string> = {
    'New Moon': '🌑',
    'Waxing Crescent': '🌒',
    'First Quarter': '🌓',
    'Waxing Gibbous': '🌔',
    'Full Moon': '🌕',
    'Waning Gibbous': '🌖',
    'Last Quarter': '🌗',
    'Waning Crescent': '🌘',
  };
  return phaseMap[phase] || '🌙';
}

export const TodaysCosmicEnergy = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cosmicData, setCosmicData] = useState<CosmicData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  const [weekForecast, setWeekForecast] = useState<WeekDay[]>([]);
  const [currentMoonDegree, setCurrentMoonDegree] = useState<number>(0);
  const [currentMoonSign, setCurrentMoonSign] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // Update moon position in real-time when modal is open
  useEffect(() => {
    if (!isOpen) return;
    
    const updateMoonPosition = () => {
      const now = new Date();
      const planets = getPlanetaryPositions(now);
      setCurrentMoonDegree(planets.moon?.degree || 0);
      setCurrentMoonSign(planets.moon?.sign || 'Unknown');
    };
    
    updateMoonPosition();
    // Update every minute since moon moves ~0.5° per hour
    const interval = setInterval(updateMoonPosition, 60000);
    
    return () => clearInterval(interval);
  }, [isOpen]);

  const fetchCosmicWeather = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const now = new Date();
      // Get current astronomical data at the exact moment of request
      const moonPhase = getMoonPhase(now);
      const planets = getPlanetaryPositions(now);
      const aspects = calculateDailyAspects(planets);
      const stelliums = findStelliums(planets);

      // Update current moon position
      setCurrentMoonDegree(planets.moon?.degree || 0);
      setCurrentMoonSign(planets.moon?.sign || 'Unknown');

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

      const generatedTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      
      setCosmicData({
        date: todayStr,
        moonPhase: moonPhase.phaseName,
        moonSign: planets.moon?.sign || 'Unknown',
        moonDegrees: planets.moon?.degree || 0,
        generatedAt: generatedTime,
        sunSign: planets.sun?.sign || 'Unknown',
        sunDegrees: planets.sun?.degree || 0,
        insight: data.insight
      });
      setLastFetched(generatedTime);
      
      // Generate week forecast
      setWeekForecast(getWeekForecast());
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

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    
    try {
      toast({ title: "Generating image...", description: "Please wait a moment." });
      
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `cosmic-weather-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast({ title: "Downloaded!", description: "Your cosmic weather has been saved." });
    } catch (err) {
      console.error('Download error:', err);
      toast({ title: "Download failed", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    if (!cosmicData) return;
    
    const shareText = `✨ Today's Cosmic Energy - ${todayStr}\n\n☽ Moon in ${cosmicData.moonSign} (${currentMoonDegree.toFixed(1)}°)\n☉ Sun in ${cosmicData.sunSign}\n🌙 ${cosmicData.moonPhase}\n\n#astrology #cosmicweather`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Today's Cosmic Energy",
          text: shareText,
        });
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText);
      toast({ title: "Copied to clipboard!", description: "Share text has been copied." });
    }
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

            <div className="max-w-4xl mx-auto" ref={contentRef}>
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
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Moon Position</p>
                    <p className="font-medium">
                      {ZODIAC_SYMBOLS[currentMoonSign || planets.moon?.sign || '']} {currentMoonSign || planets.moon?.sign}
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {currentMoonDegree.toFixed(1)}°
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Updates in real-time
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
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="font-serif text-2xl font-light flex items-center gap-3">
                      <Sparkles className="h-6 w-6 text-primary" />
                      Cosmic Weather
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        disabled={!cosmicData}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadPDF}
                        disabled={!cosmicData}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Save Image
                      </Button>
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
                  </div>
                  {lastFetched && (
                    <p className="text-xs text-muted-foreground">
                      Generated at {lastFetched} • Moon position updates live
                    </p>
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
                          h2: ({ children }) => {
                            const text = String(children);
                            const isKitchen = text.toLowerCase().includes('kitchen') || text.toLowerCase().includes('menu');
                            return (
                              <h2 className={`font-serif text-xl font-medium text-foreground mt-6 mb-3 pb-2 border-b first:mt-0 ${isKitchen ? 'border-amber-500/30 flex items-center gap-2' : 'border-primary/10'}`}>
                                {isKitchen && <Utensils className="h-5 w-5 text-amber-600" />}
                                {children}
                              </h2>
                            );
                          },
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

              {/* 7-Day Forecast */}
              {weekForecast.length > 0 && (
                <Card className="mt-6 border-border">
                  <CardHeader>
                    <CardTitle className="font-serif text-lg font-light flex items-center gap-2">
                      <ChevronRight className="h-5 w-5 text-primary" />
                      7-Day Cosmic Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                      {weekForecast.map((day, idx) => (
                        <div 
                          key={idx} 
                          className={`text-center p-3 rounded-lg ${idx === 0 ? 'bg-primary/10 border border-primary/30' : 'bg-secondary/50'}`}
                        >
                          <p className="text-xs font-medium text-muted-foreground mb-1">{day.dayName}</p>
                          <p className="text-xs text-muted-foreground">{day.dateStr}</p>
                          <div className="my-2 text-2xl">{getMoonPhaseEmoji(day.moonPhase)}</div>
                          <p className="text-sm font-medium">
                            {ZODIAC_SYMBOLS[day.moonSign]}
                          </p>
                          <p className="text-xs text-muted-foreground">{day.moonSign}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      Moon sign shown for each day • Click refresh for updated readings
                    </p>
                  </CardContent>
                </Card>
              )}

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

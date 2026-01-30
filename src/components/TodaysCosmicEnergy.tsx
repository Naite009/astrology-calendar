import { useState, useEffect, useRef } from "react";
import { Sparkles, Moon, Sun, Clock, Loader2, RefreshCw, X, Utensils, Download, Share2, ChevronRight, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { getMoonPhase, getPlanetaryPositions, calculateDailyAspects, PlanetaryPositions } from "@/lib/astrology";
import { getVOCMoonDetails } from "@/lib/voidOfCourseMoon";
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

interface VOCInfo {
  isVOC: boolean;
  isCurrentlyVOC?: boolean;
  start?: Date;
  end?: Date;
  lastAspect?: {
    planet: string;
    symbol: string;
  };
  moonEntersSign?: string;
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

// Format time for display
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// Component for the header button with hover preview
export const CosmicEnergyButton = ({ onClick }: { onClick: () => void }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Get current cosmic data for preview
  const today = new Date();
  const moonPhase = getMoonPhase(today);
  const planets = getPlanetaryPositions(today);
  
  const moonSign = planets.moon?.sign || 'Unknown';
  const sunSign = planets.sun?.sign || 'Unknown';
  const phaseEmoji = getMoonPhaseEmoji(moonPhase.phaseName);
  
  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex h-20 items-center gap-3 px-8 border-2 border-primary bg-primary/10 text-primary font-medium transition-all duration-200 hover:bg-primary hover:text-primary-foreground rounded-md shadow-md hover:shadow-lg"
        aria-label="Today's Cosmic Energy"
      >
        <span className="text-lg">
          Click for Today's Cosmic Weather
        </span>
      </button>
      
      {/* Hover Tooltip Preview */}
      {isHovered && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-background border border-border rounded-lg shadow-xl p-4 min-w-[200px] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Sun</p>
              <p className="text-lg font-medium">
                {ZODIAC_SYMBOLS[sunSign]} {sunSign}
              </p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Moon</p>
              <p className="text-lg font-medium">
                <span className="mr-1">{phaseEmoji}</span>
                ☽ {ZODIAC_SYMBOLS[moonSign]} {moonSign}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">{moonPhase.phaseName}</p>
        </div>
      )}
    </div>
  );
};

interface TodaysCosmicEnergyProps {
  onClose?: () => void;
}

export const TodaysCosmicEnergy = ({ onClose }: TodaysCosmicEnergyProps) => {
  const [isOpen, setIsOpen] = useState(true); // Start open when rendered
  const [isLoading, setIsLoading] = useState(false);
  const [cosmicData, setCosmicData] = useState<CosmicData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  const [weekForecast, setWeekForecast] = useState<WeekDay[]>([]);
  const [currentMoonDegree, setCurrentMoonDegree] = useState<number>(0);
  const [currentMoonSign, setCurrentMoonSign] = useState<string>('');
  const [vocInfo, setVocInfo] = useState<VOCInfo>({ isVOC: false });
  const [selectedWeekDay, setSelectedWeekDay] = useState<number>(0); // 0 = today
  const [weekDayLoading, setWeekDayLoading] = useState<number | null>(null);
  const [weekDayInsights, setWeekDayInsights] = useState<Record<number, string>>({});
  const contentRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const todayKey = today.toISOString().split('T')[0]; // YYYY-MM-DD for cache key

  // Load cached data on mount
  useEffect(() => {
    const cached = localStorage.getItem(`cosmic-weather-${todayKey}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setCosmicData(parsed);
        setLastFetched(parsed.generatedAt);
      } catch (e) {
        console.error('Failed to parse cached cosmic data:', e);
      }
    }
  }, [todayKey]);

  // Update moon position and VOC in real-time when modal is open
  useEffect(() => {
    if (!isOpen) return;
    
    const updateMoonPosition = () => {
      const now = new Date();
      const planets = getPlanetaryPositions(now);
      setCurrentMoonDegree(planets.moon?.degree || 0);
      setCurrentMoonSign(planets.moon?.sign || 'Unknown');
      
      // Get VOC info
      const voc = getVOCMoonDetails(now);
      setVocInfo(voc);
    };
    
    updateMoonPosition();
    // Update every minute
    const interval = setInterval(updateMoonPosition, 60000);
    
    return () => clearInterval(interval);
  }, [isOpen]);

  const fetchCosmicWeather = async (forceRefresh = false, targetDate?: Date) => {
    // If we have cached data and not forcing refresh and it's for today, don't fetch
    if (cosmicData && !forceRefresh && !targetDate) {
      setWeekForecast(getWeekForecast());
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const now = targetDate || new Date();
      const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      
      // Get current astronomical data at the exact moment of request
      const moonPhase = getMoonPhase(now);
      const planets = getPlanetaryPositions(now);
      const aspects = calculateDailyAspects(planets);
      const stelliums = findStelliums(planets);
      const voc = getVOCMoonDetails(now);

      // Update current moon position
      if (!targetDate) {
        setCurrentMoonDegree(planets.moon?.degree || 0);
        setCurrentMoonSign(planets.moon?.sign || 'Unknown');
        setVocInfo(voc);
      }

      // Build planet positions array for the edge function
      const planetPositions = Object.entries(planets).map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        sign: data?.sign || 'Unknown',
        degree: data?.degree || 0
      }));

      // Call edge function
      const { data, error: fnError } = await supabase.functions.invoke('cosmic-weather', {
        body: {
          date: dateStr,
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

      const generatedTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      
      if (targetDate) {
        // Store for the specific day
        return data.insight;
      }
      
      const newCosmicData: CosmicData = {
        date: dateStr,
        moonPhase: moonPhase.phaseName,
        moonSign: planets.moon?.sign || 'Unknown',
        moonDegrees: planets.moon?.degree || 0,
        generatedAt: generatedTime,
        sunSign: planets.sun?.sign || 'Unknown',
        sunDegrees: planets.sun?.degree || 0,
        insight: data.insight
      };
      
      // Save to localStorage for the day
      localStorage.setItem(`cosmic-weather-${todayKey}`, JSON.stringify(newCosmicData));
      
      setCosmicData(newCosmicData);
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

  const fetchWeekDayWeather = async (dayIndex: number) => {
    if (dayIndex === 0) {
      setSelectedWeekDay(0);
      return;
    }
    
    // Check if we already have this day's insight
    if (weekDayInsights[dayIndex]) {
      setSelectedWeekDay(dayIndex);
      return;
    }
    
    setWeekDayLoading(dayIndex);
    setSelectedWeekDay(dayIndex);
    
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + dayIndex);
      const insight = await fetchCosmicWeather(true, targetDate);
      
      setWeekDayInsights(prev => ({ ...prev, [dayIndex]: insight }));
    } catch (err) {
      console.error('Failed to fetch week day weather:', err);
    } finally {
      setWeekDayLoading(null);
    }
  };

  useEffect(() => {
    if (isOpen && !isLoading) {
      // Always update week forecast and moon position when opening
      setWeekForecast(getWeekForecast());
      const planets = getPlanetaryPositions(new Date());
      setCurrentMoonDegree(planets.moon?.degree || 0);
      setCurrentMoonSign(planets.moon?.sign || 'Unknown');
      const voc = getVOCMoonDetails(new Date());
      setVocInfo(voc);
      
      // Only fetch if no cached data
      if (!cosmicData) {
        fetchCosmicWeather(false);
      }
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
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

  // Get the insight to display based on selected day
  const displayInsight = selectedWeekDay === 0 
    ? cosmicData?.insight 
    : weekDayInsights[selectedWeekDay];

  return (
    <>
      {/* Icon Button for Header - exported separately */}
      <CosmicEnergyButton onClick={handleOpen} />

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
                  {selectedWeekDay === 0 ? "Today's Cosmic Energy" : weekForecast[selectedWeekDay]?.dayName + "'s Cosmic Energy"}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {selectedWeekDay === 0 ? todayStr : weekForecast[selectedWeekDay]?.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
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
                      Live position
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

              {/* Void of Course Moon Alert */}
              {vocInfo.isVOC && vocInfo.start && vocInfo.end && (
                <Card className={`mb-6 ${vocInfo.isCurrentlyVOC ? 'bg-amber-500/10 border-amber-500/40' : 'bg-muted/50 border-border'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`h-5 w-5 mt-0.5 ${vocInfo.isCurrentlyVOC ? 'text-amber-500' : 'text-muted-foreground'}`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {vocInfo.isCurrentlyVOC ? '☽ Moon is Currently Void of Course' : '☽ Void of Course Moon Today'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatTime(vocInfo.start)} – {formatTime(vocInfo.end)}
                          {vocInfo.lastAspect && (
                            <span className="ml-2">
                              (after {vocInfo.lastAspect.symbol} {vocInfo.lastAspect.planet})
                            </span>
                          )}
                          {vocInfo.moonEntersSign && (
                            <span className="ml-2">
                              → Moon enters {ZODIAC_SYMBOLS[vocInfo.moonEntersSign]} {vocInfo.moonEntersSign}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          Avoid starting new projects, signing contracts, or making major purchases during VOC periods.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                        onClick={() => fetchCosmicWeather(true)}
                        disabled={isLoading}
                        className="text-muted-foreground hover:text-foreground"
                        title="Generate a new version of today's reading"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                  {lastFetched && selectedWeekDay === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Today's reading generated at {lastFetched} • <span className="italic">Preserved for the day</span> • Moon position updates live
                    </p>
                  )}
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  {(isLoading || weekDayLoading !== null) && (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-muted-foreground">Reading the cosmic weather...</p>
                    </div>
                  )}

                  {error && (
                    <div className="text-center py-8">
                      <p className="text-destructive mb-4">{error}</p>
                      <Button variant="outline" onClick={() => fetchCosmicWeather(true)}>
                        Try Again
                      </Button>
                    </div>
                  )}

                  {!isLoading && weekDayLoading === null && !error && displayInsight && (
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
                        {displayInsight}
                      </ReactMarkdown>
                    </div>
                  )}

                  {!isLoading && weekDayLoading === null && !error && !displayInsight && selectedWeekDay !== 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Click a day to load its cosmic weather</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 7-Day Forecast - Clickable */}
              {weekForecast.length > 0 && (
                <Card className="mt-6 border-border">
                  <CardHeader>
                    <CardTitle className="font-serif text-lg font-light flex items-center gap-2">
                      <ChevronRight className="h-5 w-5 text-primary" />
                      7-Day Cosmic Forecast
                      <span className="text-xs font-normal text-muted-foreground ml-2">(click any day for details)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                      {weekForecast.map((day, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => fetchWeekDayWeather(idx)}
                          className={`text-center p-3 rounded-lg transition-all cursor-pointer hover:scale-105 ${
                            selectedWeekDay === idx 
                              ? 'bg-primary/20 border-2 border-primary shadow-md' 
                              : idx === 0 
                                ? 'bg-primary/10 border border-primary/30 hover:bg-primary/15' 
                                : 'bg-secondary/50 hover:bg-secondary/80'
                          }`}
                        >
                          <p className="text-xs font-medium text-muted-foreground mb-1">{day.dayName}</p>
                          <p className="text-xs text-muted-foreground">{day.dateStr}</p>
                          <div className="my-2 text-2xl">{getMoonPhaseEmoji(day.moonPhase)}</div>
                          <p className="text-sm font-medium">
                            {ZODIAC_SYMBOLS[day.moonSign]}
                          </p>
                          <p className="text-xs text-muted-foreground">{day.moonSign}</p>
                          {weekDayLoading === idx && (
                            <Loader2 className="h-3 w-3 animate-spin mx-auto mt-1 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
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

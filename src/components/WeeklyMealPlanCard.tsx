import { useState, useRef, useEffect, useMemo } from 'react';
import { Loader2, Download, Utensils, ChefHat, Sparkles, RefreshCw, Printer, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getMoonPhase, getPlanetaryPositions } from '@/lib/astrology';
import { toast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓"
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ELEMENT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Fire: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-600' },
  Earth: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-600' },
  Air: { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-600' },
  Water: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-600' },
};

const getElementFromSign = (sign: string): string => {
  const fireSign = ['Aries', 'Leo', 'Sagittarius'];
  const earthSign = ['Taurus', 'Virgo', 'Capricorn'];
  const airSign = ['Gemini', 'Libra', 'Aquarius'];
  if (fireSign.includes(sign)) return 'Fire';
  if (earthSign.includes(sign)) return 'Earth';
  if (airSign.includes(sign)) return 'Air';
  return 'Water';
};

interface WeekDay {
  date: Date;
  dateStr: string;
  dayName: string;
  shortDayName: string;
  moonSign: string;
  moonPhase: string;
  isToday: boolean;
}

// Get ISO week number for cache key
function getWeekKey(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
}

const MEAL_PLAN_CACHE_KEY = 'cosmic-meal-plan';
const RECIPE_CACHE_KEY = 'cosmic-weekly-recipe';

// Get week starting from the most recent Sunday
function getWeekForecast(): WeekDay[] {
  const days: WeekDay[] = [];
  const today = new Date();
  const todayDayOfWeek = today.getDay(); // 0 = Sunday
  
  // Start from the most recent Sunday
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - todayDayOfWeek);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    
    const planets = getPlanetaryPositions(date);
    const moonPhase = getMoonPhase(date);
    const isToday = date.toDateString() === today.toDateString();
    
    days.push({
      date,
      dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayName: DAY_NAMES[i],
      shortDayName: DAY_NAMES[i].slice(0, 3),
      moonSign: planets.moon?.sign || 'Unknown',
      moonPhase: moonPhase.phaseName,
      isToday,
    });
  }
  
  return days;
}

export const WeeklyMealPlanCard = () => {
  const [mealPlan, setMealPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [weeklyRecipe, setWeeklyRecipe] = useState<string | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(() => new Date().getDay());
  const contentRef = useRef<HTMLDivElement>(null);
  const weekKey = getWeekKey();

  const weekData = useMemo(() => getWeekForecast(), []);
  const selectedDay = weekData[selectedDayIndex];

  // Load cached data and auto-fetch if not cached
  useEffect(() => {
    const cachedMealPlan = localStorage.getItem(`${MEAL_PLAN_CACHE_KEY}-${weekKey}`);
    const cachedRecipe = localStorage.getItem(`${RECIPE_CACHE_KEY}-${weekKey}`);
    
    if (cachedMealPlan) {
      setMealPlan(cachedMealPlan);
    } else {
      // Auto-fetch if not cached
      fetchWeeklyMealPlan(false);
    }
    
    if (cachedRecipe) {
      setWeeklyRecipe(cachedRecipe);
    } else {
      // Auto-fetch recipe if not cached
      fetchWeeklyRecipe(false);
    }
  }, [weekKey]);

  const fetchWeeklyMealPlan = async (forceRegenerate = false) => {
    if (mealPlan && !forceRegenerate) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('cosmic-weather', {
        body: {
          date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          moonPhase: weekData[new Date().getDay()].moonPhase,
          moonSign: weekData[new Date().getDay()].moonSign,
          customPrompt: `Create a WEEKLY COSMIC MEAL PLAN for this week (Sunday through Saturday).

MOON SIGNS THIS WEEK:
${weekData.map((d) => `- ${d.dayName} (${d.dateStr}): Moon in ${d.moonSign}`).join('\n')}

FORMAT - Make this EASY TO READ with clear structure:

# 🍽️ Weekly Cosmic Meal Plan
*${weekData[0].dateStr} - ${weekData[6].dateStr}*

${weekData.map((d) => `
## ${d.dayName} - ${d.dateStr}
**☽ Moon in ${d.moonSign} ${ZODIAC_SYMBOLS[d.moonSign] || ''}**

| Meal | Dish | Why It Works |
|------|------|--------------|
| 🍳 Breakfast | [Dish name] | [Brief reason tied to ${d.moonSign} energy] |
| 🥗 Lunch | [Dish name] | [Brief reason] |
| 🍽️ Dinner | [Dish name] | [Brief reason] |
| 🥜 Snacks | [2-3 snacks] | [Brief reason] |
| 🍵 Drink | [Beverage] | [Brief reason] |
`).join('\n---\n')}

MOON SIGN FOOD THEMES:
- Fire Moons (Aries/Leo/Sag): Spicy, bold, protein-rich
- Earth Moons (Taurus/Virgo/Cap): Grounding, comfort, substantial
- Air Moons (Gemini/Libra/Aqua): Light, varied, interesting combos
- Water Moons (Cancer/Scorpio/Pisces): Soul food, soups, nourishing

Keep descriptions SHORT and punchy. Make it scannable.`
        }
      });

      if (error) throw error;
      setMealPlan(data.insight);
      localStorage.setItem(`${MEAL_PLAN_CACHE_KEY}-${weekKey}`, data.insight);
      
    } catch (err) {
      console.error('Failed to fetch meal plan:', err);
      toast({ title: 'Error', description: 'Failed to generate meal plan', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyRecipe = async (forceRegenerate = false) => {
    if (weeklyRecipe && !forceRegenerate) return;
    
    setLoading(true);
    
    try {
      const dominantElement = getMostCommonElement(weekData.map(d => d.moonSign));
      
      const { data, error } = await supabase.functions.invoke('cosmic-weather', {
        body: {
          date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          moonPhase: weekData[new Date().getDay()].moonPhase,
          moonSign: weekData[new Date().getDay()].moonSign,
          customPrompt: `Create ONE special "Recipe of the Week" that captures this week's lunar journey.

MOON SIGNS THIS WEEK: ${weekData.map(d => d.moonSign).join(' → ')}
DOMINANT ELEMENT: ${dominantElement}

Create a BATCH-PREP or MEAL-PREP friendly recipe that:
1. Can be made on the weekend and enjoyed throughout the week
2. Captures the energy of the Moon's journey through these signs
3. Is practical and family-friendly

FORMAT:

# ✨ Recipe of the Week
**[Creative Recipe Name]**

*This dish captures the ${dominantElement} energy dominant in this week's lunar cycle, traveling through ${[...new Set(weekData.map(d => d.moonSign))].join(', ')}.*

## At a Glance
- **Servings:** [number]
- **Prep Time:** [time]
- **Cook Time:** [time]
- **Keeps For:** [how long it stores]
- **Element:** ${dominantElement}

## Ingredients
- [Full measurements - e.g., "2 cups rice" not "rice"]
- [8-12 ingredients total]

## Instructions
1. [Clear step with times/temps]
2. [Continue...]

## Cosmic Connection
[2-3 sentences about why this recipe matches the week's energy]

## Weekly Tip
[One sentence about when during the week this dish will taste best based on Moon signs]`
        }
      });

      if (error) throw error;
      setWeeklyRecipe(data.insight);
      localStorage.setItem(`${RECIPE_CACHE_KEY}-${weekKey}`, data.insight);
      
    } catch (err) {
      console.error('Failed to fetch weekly recipe:', err);
      toast({ title: 'Error', description: 'Failed to generate weekly recipe', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getMostCommonElement = (signs: string[]): string => {
    const elements = signs.map(getElementFromSign);
    const counts: Record<string, number> = {};
    elements.forEach(e => counts[e] = (counts[e] || 0) + 1);
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  };

  const handleDownload = async () => {
    if (!contentRef.current) return;
    
    try {
      toast({ title: "Generating image...", description: "Please wait." });
      
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      const dateRange = `${new Date().toISOString().split('T')[0]}`;
      link.download = `weekly-meal-plan-${dateRange}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast({ title: "Downloaded!", description: "Your meal plan has been saved." });
    } catch (err) {
      console.error('Download error:', err);
      toast({ title: "Download failed", variant: "destructive" });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Extract the selected day's content from the full meal plan
  const getSelectedDayContent = (): string | null => {
    if (!mealPlan) return null;
    
    const dayName = selectedDay.dayName;
    const regex = new RegExp(`## ${dayName}[\\s\\S]*?(?=## |$)`, 'i');
    const match = mealPlan.match(regex);
    
    return match ? match[0] : null;
  };

  const selectedDayContent = getSelectedDayContent();

  return (
    <Card className="border-primary/20 shadow-lg print:shadow-none print:border-0">
      <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-amber-500/10 to-orange-500/5 print:bg-transparent">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="font-serif text-xl font-light flex items-center gap-2">
            <Utensils className="h-5 w-5 text-amber-600" />
            Cosmic Kitchen
          </CardTitle>
          
          <div className="flex gap-2 flex-wrap print:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                fetchWeeklyMealPlan(true);
                fetchWeeklyRecipe(true);
              }}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
        
        {/* Week day selector - Sunday to Saturday */}
        <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
          {weekData.map((day, i) => {
            const element = getElementFromSign(day.moonSign);
            const colors = ELEMENT_COLORS[element];
            const isSelected = i === selectedDayIndex;
            
            return (
              <button 
                key={i}
                onClick={() => setSelectedDayIndex(i)}
                className={`
                  flex-shrink-0 px-3 py-2 rounded-md text-xs transition-all relative
                  ${isSelected 
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary/50' 
                    : `${colors.bg} ${colors.border} border hover:opacity-80`
                  }
                `}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{day.shortDayName}</span>
                    {day.isToday && (
                      <Star className="h-3 w-3 fill-current" />
                    )}
                  </div>
                  <span className={`text-[10px] ${isSelected ? 'opacity-80' : 'opacity-60'}`}>
                    ☽{ZODIAC_SYMBOLS[day.moonSign]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 md:p-6">
        {loading && !mealPlan && !weeklyRecipe && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Generating your cosmic meal plan...</p>
          </div>
        )}
        
        {/* Content for download */}
        <div ref={contentRef} className={mealPlan || weeklyRecipe ? 'bg-background p-4 rounded-lg space-y-6' : ''}>
          {/* Selected Day's Meal Plan */}
          {selectedDayContent && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ChefHat className="h-5 w-5 text-amber-600" />
                <h2 className="font-serif text-lg font-medium">
                  {selectedDay.dayName}'s Menu
                </h2>
                <span className="text-sm text-muted-foreground">
                  {selectedDay.dateStr} · Moon in {selectedDay.moonSign} {ZODIAC_SYMBOLS[selectedDay.moonSign]}
                </span>
              </div>
              
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h2: () => null, // Hide the h2 since we have our own header
                    table: ({ children }) => (
                      <table className="w-full text-sm border-collapse my-2">
                        {children}
                      </table>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-muted/50">{children}</thead>
                    ),
                    tbody: ({ children }) => (
                      <tbody className="[&>tr:nth-child(odd)]:bg-muted/30 [&>tr:nth-child(even)]:bg-background">{children}</tbody>
                    ),
                    th: ({ children }) => (
                      <th className="text-left p-2 border border-border font-medium">{children}</th>
                    ),
                    td: ({ children }) => (
                      <td className="p-2 border border-border">{children}</td>
                    ),
                    p: ({ children }) => (
                      <p className="text-foreground/90 leading-relaxed my-2">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-foreground">{children}</strong>
                    ),
                  }}
                >
                  {selectedDayContent}
                </ReactMarkdown>
              </div>
            </div>
          )}
          
          {/* Recipe of the Week */}
          {weeklyRecipe && (
            <div className="border-t border-border pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-amber-600" />
                <h2 className="font-serif text-lg font-medium">Recipe of the Week</h2>
              </div>
              
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="font-serif text-xl font-medium text-foreground mb-2 flex items-center gap-2">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="font-serif text-base font-medium text-foreground mt-4 mb-2">
                        {children}
                      </h2>
                    ),
                    ul: ({ children }) => (
                      <ul className="space-y-1 my-2 list-disc list-inside">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="space-y-2 my-2 list-decimal list-inside">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-foreground/90">{children}</li>
                    ),
                    p: ({ children }) => (
                      <p className="text-foreground/90 leading-relaxed my-2">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-foreground">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="text-muted-foreground">{children}</em>
                    ),
                  }}
                >
                  {weeklyRecipe}
                </ReactMarkdown>
              </div>
            </div>
          )}
          
          {!mealPlan && !weeklyRecipe && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <ChefHat className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Loading your cosmic meal plan...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

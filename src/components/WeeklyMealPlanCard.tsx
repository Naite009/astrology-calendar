import { useState, useRef, useEffect, useMemo } from 'react';
import { Loader2, Download, Utensils, ChefHat, Sparkles, RefreshCw, Printer, Star, Settings2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getMoonPhase, getPlanetaryPositions } from '@/lib/astrology';
import { toast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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

// Dietary preference options - HD PHS Determination types + Ayurvedic
const DIETARY_PREFERENCES = [
  { value: 'default', label: 'Standard', description: 'General cosmic recommendations' },
  { value: 'consecutive', label: 'Consecutive (HD)', description: 'One food at a time, simple meals' },
  { value: 'alternating', label: 'Alternating (HD)', description: 'Variety, rotating ingredients' },
  { value: 'open', label: 'Open Taste (HD)', description: 'Mild flavors, calming foods' },
  { value: 'closed', label: 'Closed Taste (HD)', description: 'Strong, bold flavors' },
  { value: 'hot', label: 'Hot Thirst (HD)', description: 'Warm/hot foods and drinks' },
  { value: 'cold', label: 'Cold Thirst (HD)', description: 'Cool/cold foods and drinks' },
  { value: 'high-sound', label: 'High Sound (HD)', description: 'Crunchy, noisy textures' },
  { value: 'low-sound', label: 'Low Sound (HD)', description: 'Soft, quiet textures' },
  { value: 'direct-light', label: 'Direct Light (HD)', description: 'Eat in bright light/outdoors' },
  { value: 'indirect-light', label: 'Indirect Light (HD)', description: 'Eat in dim/soft lighting' },
  { value: 'calm', label: 'Calm (HD)', description: 'Peaceful eating environment' },
  { value: 'nervous', label: 'Nervous (HD)', description: 'Active environment while eating' },
  { value: 'vata', label: 'Vata (Ayurveda)', description: 'Grounding, warm, oily foods' },
  { value: 'pitta', label: 'Pitta (Ayurveda)', description: 'Cooling, sweet, bitter foods' },
  { value: 'kapha', label: 'Kapha (Ayurveda)', description: 'Light, dry, spicy foods' },
];

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
const DIETARY_PREF_KEY = 'cosmic-dietary-preference';

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
  const [dietaryPreference, setDietaryPreference] = useState<string>(() => 
    localStorage.getItem(DIETARY_PREF_KEY) || 'default'
  );
  const contentRef = useRef<HTMLDivElement>(null);
  const weekKey = getWeekKey();

  const weekData = useMemo(() => getWeekForecast(), []);
  const selectedDay = weekData[selectedDayIndex];
  const todayData = weekData.find(d => d.isToday) || weekData[new Date().getDay()];

  // Save dietary preference when changed
  const handleDietaryChange = (value: string) => {
    setDietaryPreference(value);
    localStorage.setItem(DIETARY_PREF_KEY, value);
    // Clear cache when preference changes
    localStorage.removeItem(`${MEAL_PLAN_CACHE_KEY}-${weekKey}`);
    localStorage.removeItem(`${RECIPE_CACHE_KEY}-${weekKey}`);
    setMealPlan(null);
    setWeeklyRecipe(null);
    // Auto-regenerate with new preference
    fetchWeeklyMealPlan(true);
    fetchWeeklyRecipe(true);
  };

  // Load cached data and auto-fetch if not cached
  useEffect(() => {
    const cachedMealPlan = localStorage.getItem(`${MEAL_PLAN_CACHE_KEY}-${weekKey}`);
    const cachedRecipe = localStorage.getItem(`${RECIPE_CACHE_KEY}-${weekKey}`);
    
    if (cachedMealPlan) {
      setMealPlan(cachedMealPlan);
    } else {
      fetchWeeklyMealPlan(false);
    }
    
    if (cachedRecipe) {
      setWeeklyRecipe(cachedRecipe);
    } else {
      fetchWeeklyRecipe(false);
    }
  }, [weekKey]);

  const getDietaryPromptAddition = (): string => {
    const pref = DIETARY_PREFERENCES.find(p => p.value === dietaryPreference);
    if (!pref || dietaryPreference === 'default') return '';
    
    const hdPrefs: Record<string, string> = {
      consecutive: 'HUMAN DESIGN DIETARY PREFERENCE: The person needs CONSECUTIVE/SINGLE FOODS - simple meals with one main ingredient at a time, not complex combinations. Think single-ingredient focus, easy to digest, minimal mixing.',
      alternating: 'HUMAN DESIGN DIETARY PREFERENCE: The person needs ALTERNATING variety - rotating ingredients, different foods each meal, sampling multiple dishes rather than one big plate.',
      open: 'HUMAN DESIGN DIETARY PREFERENCE: The person needs OPEN TASTE - mild, gentle flavors that calm the nervous system. Avoid bold spices or overwhelming tastes.',
      closed: 'HUMAN DESIGN DIETARY PREFERENCE: The person needs CLOSED TASTE - strong, bold, intense flavors. They digest better with spicy, rich, or potent tastes.',
      hot: 'HUMAN DESIGN DIETARY PREFERENCE: The person needs HOT THIRST - warm and hot foods/drinks aid their digestion. Avoid cold or iced items.',
      cold: 'HUMAN DESIGN DIETARY PREFERENCE: The person needs COLD THIRST - cool and cold foods/drinks work best. Room temp or chilled is ideal.',
      'high-sound': 'HUMAN DESIGN DIETARY PREFERENCE: The person needs HIGH SOUND foods - crunchy, crispy textures that make noise when eaten. Think raw veggies, nuts, crackers.',
      'low-sound': 'HUMAN DESIGN DIETARY PREFERENCE: The person needs LOW SOUND foods - soft, quiet textures. Soups, stews, smoothies, soft-cooked foods.',
      'direct-light': 'HUMAN DESIGN DIETARY PREFERENCE: The person digests best with DIRECT LIGHT - eating outdoors, by a window, or in bright lighting.',
      'indirect-light': 'HUMAN DESIGN DIETARY PREFERENCE: The person digests best with INDIRECT LIGHT - eating in dim, soft, or candlelit environments.',
      calm: 'HUMAN DESIGN DIETARY PREFERENCE: The person needs a CALM environment to eat - peaceful, quiet, no distractions, focused eating.',
      nervous: 'HUMAN DESIGN DIETARY PREFERENCE: The person needs a NERVOUS/ACTIVE environment - eating while doing something else, background activity, not isolated meals.',
      vata: 'AYURVEDIC DOSHA: The person is VATA dominant - prioritize warm, grounding, oily, nourishing foods. Avoid cold, dry, raw foods. Root vegetables, warm soups, healthy fats.',
      pitta: 'AYURVEDIC DOSHA: The person is PITTA dominant - prioritize cooling, sweet, bitter foods. Avoid spicy, sour, salty. Fresh fruits, leafy greens, cooling herbs.',
      kapha: 'AYURVEDIC DOSHA: The person is KAPHA dominant - prioritize light, dry, warming, spicy foods. Avoid heavy, oily, cold. Legumes, steamed veggies, warming spices.',
    };
    
    return hdPrefs[dietaryPreference] || '';
  };

  const fetchWeeklyMealPlan = async (forceRegenerate = false) => {
    if (mealPlan && !forceRegenerate) return;
    
    setLoading(true);
    
    const dietaryAddition = getDietaryPromptAddition();
    
    try {
      const { data, error } = await supabase.functions.invoke('cosmic-weather', {
        body: {
          date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          moonPhase: todayData.moonPhase,
          moonSign: todayData.moonSign,
          customPrompt: `Create a WEEKLY COSMIC MEAL PLAN for this week (Sunday through Saturday).

TODAY IS: ${todayData.dayName}, ${todayData.dateStr} - Moon in ${todayData.moonSign} ${ZODIAC_SYMBOLS[todayData.moonSign] || ''}

MOON SIGNS THIS WEEK (calculated from astronomical ephemeris):
${weekData.map((d) => `- ${d.dayName} (${d.dateStr}): Moon in ${d.moonSign} ${ZODIAC_SYMBOLS[d.moonSign] || ''}`).join('\n')}

${dietaryAddition ? `\n${dietaryAddition}\n` : ''}

FORMAT - Make this EASY TO READ with clear structure:

# 🍽️ Weekly Cosmic Meal Plan
*${weekData[0].dateStr} - ${weekData[6].dateStr}*

${weekData.map((d) => `
## ${d.dayName} - ${d.dateStr}
**☽ Moon in ${d.moonSign} ${ZODIAC_SYMBOLS[d.moonSign] || ''}**

| Meal | Dish | Why It Works |
|------|------|--------------|
| 🍳 Breakfast | [Dish name] | [Brief reason tied to ${d.moonSign} energy${dietaryAddition ? ' + dietary preference' : ''}] |
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

SEASONAL CONSIDERATION: It's currently winter - favor warming, hearty, seasonal foods.

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
    
    const dietaryAddition = getDietaryPromptAddition();
    
    try {
      const dominantElement = getMostCommonElement(weekData.map(d => d.moonSign));
      
      const { data, error } = await supabase.functions.invoke('cosmic-weather', {
        body: {
          date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          moonPhase: todayData.moonPhase,
          moonSign: todayData.moonSign,
          customPrompt: `Create ONE special "Recipe of the Week" that captures this week's lunar journey.

TODAY IS: ${todayData.dayName}, ${todayData.dateStr}
MOON SIGNS THIS WEEK: ${weekData.map(d => `${d.moonSign} ${ZODIAC_SYMBOLS[d.moonSign]}`).join(' → ')}
DOMINANT ELEMENT: ${dominantElement}

${dietaryAddition ? `\n${dietaryAddition}\n` : ''}

Create a BATCH-PREP or MEAL-PREP friendly recipe that:
1. Can be made on the weekend and enjoyed throughout the week
2. Captures the energy of the Moon's journey through these signs
3. Is practical and family-friendly
4. Considers it's currently WINTER - warming, seasonal ingredients
${dietaryAddition ? '5. Honors the specific dietary preference noted above' : ''}

FORMAT:

# ✨ Recipe of the Week
**[Creative Recipe Name]**

*This dish captures the ${dominantElement} energy dominant in this week's lunar cycle, traveling through ${[...new Set(weekData.map(d => d.moonSign))].map(s => `${s} ${ZODIAC_SYMBOLS[s]}`).join(', ')}.*

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
[2-3 sentences about why this recipe matches the week's energy${dietaryAddition ? ' and the dietary preference' : ''}]

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

  const selectedPref = DIETARY_PREFERENCES.find(p => p.value === dietaryPreference);

  return (
    <Card className="border-primary/20 shadow-lg print:shadow-none print:border-0">
      <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-primary/5 to-primary/10 print:bg-transparent">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="font-serif text-xl font-light flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            Cosmic Kitchen
          </CardTitle>
          
          <div className="flex gap-2 flex-wrap print:hidden items-center">
            {/* Dietary Preferences Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings2 className="h-4 w-4" />
                  <span className="hidden sm:inline">{selectedPref?.label || 'Diet'}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-2 bg-popover border border-border shadow-lg z-50" align="end">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground px-2 py-1">Dietary Preference</p>
                  {DIETARY_PREFERENCES.map((pref) => (
                    <button
                      key={pref.value}
                      onClick={() => handleDietaryChange(pref.value)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        dietaryPreference === pref.value 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="font-medium">{pref.label}</div>
                      <div className={`text-xs ${dietaryPreference === pref.value ? 'opacity-80' : 'text-muted-foreground'}`}>
                        {pref.description}
                      </div>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
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
              <span className="hidden sm:inline">Regenerate</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
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
                <ChefHat className="h-5 w-5 text-primary" />
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
                <Sparkles className="h-5 w-5 text-primary" />
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

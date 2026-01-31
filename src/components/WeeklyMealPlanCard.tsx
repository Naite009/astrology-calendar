import { useState, useRef } from 'react';
import { Loader2, Download, Utensils, ChefHat, Sparkles } from 'lucide-react';
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

const ELEMENT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Fire: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700' },
  Earth: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700' },
  Air: { bg: 'bg-sky-50', border: 'border-sky-300', text: 'text-sky-700' },
  Water: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
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
  moonSign: string;
  moonPhase: string;
}

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
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'long' }),
      moonSign: planets.moon?.sign || 'Unknown',
      moonPhase: moonPhase.phaseName,
    });
  }
  
  return days;
}

export const WeeklyMealPlanCard = () => {
  const [mealPlan, setMealPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [weeklyRecipe, setWeeklyRecipe] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const fetchWeeklyMealPlan = async () => {
    if (mealPlan) return; // Already have it
    
    setLoading(true);
    
    try {
      const weekData = getWeekForecast();
      
      const { data, error } = await supabase.functions.invoke('cosmic-weather', {
        body: {
          date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          moonPhase: weekData[0].moonPhase,
          moonSign: weekData[0].moonSign,
          customPrompt: `Create a WEEKLY COSMIC MEAL PLAN for the next 7 days.

MOON SIGNS THIS WEEK:
${weekData.map((d, i) => `- ${d.dayName} (${d.dateStr}): Moon in ${d.moonSign}`).join('\n')}

FORMAT - Make this EASY TO READ with clear structure:

# 🍽️ Weekly Cosmic Meal Plan
*${weekData[0].dateStr} - ${weekData[6].dateStr}*

${weekData.map((d, i) => `
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
      
    } catch (err) {
      console.error('Failed to fetch meal plan:', err);
      toast({ title: 'Error', description: 'Failed to generate meal plan', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyRecipe = async () => {
    if (weeklyRecipe) return;
    
    setLoading(true);
    
    try {
      const weekData = getWeekForecast();
      const dominantElement = getMostCommonElement(weekData.map(d => d.moonSign));
      
      const { data, error } = await supabase.functions.invoke('cosmic-weather', {
        body: {
          date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          moonPhase: weekData[0].moonPhase,
          moonSign: weekData[0].moonSign,
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

  const weekData = getWeekForecast();

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-amber-500/10 to-orange-500/5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="font-serif text-xl font-light flex items-center gap-2">
            <Utensils className="h-5 w-5 text-amber-600" />
            Cosmic Kitchen: Weekly Planning
          </CardTitle>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchWeeklyMealPlan}
              disabled={loading}
              className="gap-2"
            >
              {loading && !weeklyRecipe ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChefHat className="h-4 w-4" />}
              Weekly Meal Plan
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={fetchWeeklyRecipe}
              disabled={loading}
              className="gap-2"
            >
              {loading && !mealPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Recipe of the Week
            </Button>
            
            {(mealPlan || weeklyRecipe) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            )}
          </div>
        </div>
        
        {/* Week preview */}
        <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
          {weekData.map((day, i) => {
            const element = getElementFromSign(day.moonSign);
            const colors = ELEMENT_COLORS[element];
            return (
              <div 
                key={i}
                className={`flex-shrink-0 px-2 py-1 rounded text-xs ${colors.bg} ${colors.border} border`}
              >
                <span className="font-medium">{day.dayName.slice(0, 3)}</span>
                <span className="ml-1 opacity-70">☽{ZODIAC_SYMBOLS[day.moonSign]}</span>
              </div>
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
        
        {!loading && !mealPlan && !weeklyRecipe && (
          <div className="text-center py-8 text-muted-foreground">
            <ChefHat className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Click a button above to generate your weekly cosmic meal plan</p>
          </div>
        )}
        
        {/* Content for download */}
        <div ref={contentRef} className={mealPlan || weeklyRecipe ? 'bg-white p-4 rounded-lg' : ''}>
          {mealPlan && (
            <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="font-serif text-2xl font-medium text-foreground mb-4 flex items-center gap-2">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="font-serif text-lg font-medium text-foreground mt-6 mb-2 pb-1 border-b border-primary/10">
                      {children}
                    </h2>
                  ),
                  table: ({ children }) => (
                    <table className="w-full text-sm border-collapse my-2">
                      {children}
                    </table>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-muted/50">{children}</thead>
                  ),
                  th: ({ children }) => (
                    <th className="text-left p-2 border border-border font-medium">{children}</th>
                  ),
                  td: ({ children }) => (
                    <td className="p-2 border border-border">{children}</td>
                  ),
                  hr: () => <hr className="my-4 border-primary/20" />,
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
                {mealPlan}
              </ReactMarkdown>
            </div>
          )}
          
          {weeklyRecipe && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="font-serif text-2xl font-medium text-foreground mb-2 flex items-center gap-2">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="font-serif text-lg font-medium text-foreground mt-5 mb-2">
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
          )}
        </div>
      </CardContent>
    </Card>
  );
};

import { useRef } from "react";
import { Download, Clock, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import html2canvas from "html2canvas";
import { toast } from "@/hooks/use-toast";

interface RecipeData {
  name: string;
  tagline: string;
  servings: string;
  prepTime: string;
  cookTime: string;
  moonSign: string;
  element: string;
  ingredients: string[];
  instructions: string[];
  cosmicNote: string;
}

interface CosmicRecipeCardProps {
  recipe: RecipeData;
  date: string;
}

const ELEMENT_GRADIENTS: Record<string, string> = {
  Fire: "from-red-600 via-orange-500 to-amber-400",
  Earth: "from-emerald-700 via-green-600 to-lime-500",
  Air: "from-sky-500 via-cyan-400 to-teal-300",
  Water: "from-blue-700 via-indigo-500 to-purple-400",
};

const ELEMENT_BORDERS: Record<string, string> = {
  Fire: "border-orange-400/50",
  Earth: "border-emerald-400/50",
  Air: "border-sky-400/50",
  Water: "border-indigo-400/50",
};

const ELEMENT_ACCENTS: Record<string, string> = {
  Fire: "text-orange-300",
  Earth: "text-emerald-300",
  Air: "text-cyan-300",
  Water: "text-indigo-300",
};

export function parseRecipeFromContent(content: string): RecipeData | null {
  const recipeMatch = content.match(/\*\*RECIPE_START\*\*([\s\S]*?)\*\*RECIPE_END\*\*/);
  if (!recipeMatch) return null;

  const recipeText = recipeMatch[1];
  
  const getValue = (key: string): string => {
    const match = recipeText.match(new RegExp(`${key}:\\s*(.+?)(?=\\n[A-Z_]+:|$)`, 's'));
    return match ? match[1].trim() : '';
  };

  const getList = (key: string): string[] => {
    const match = recipeText.match(new RegExp(`${key}:\\s*([\\s\\S]*?)(?=\\n[A-Z_]+:|$)`));
    if (!match) return [];
    return match[1]
      .split('\n')
      .map(line => line.replace(/^[-\d.)\s]+/, '').trim())
      .filter(line => line.length > 0);
  };

  return {
    name: getValue('RECIPE_NAME'),
    tagline: getValue('RECIPE_TAGLINE'),
    servings: getValue('SERVINGS'),
    prepTime: getValue('PREP_TIME'),
    cookTime: getValue('COOK_TIME'),
    moonSign: getValue('MOON_SIGN'),
    element: getValue('ELEMENT'),
    ingredients: getList('INGREDIENTS'),
    instructions: getList('INSTRUCTIONS'),
    cosmicNote: getValue('COSMIC_NOTE'),
  };
}

export const CosmicRecipeCard = ({ recipe, date }: CosmicRecipeCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `cosmic-recipe-${date.replace(/[^a-z0-9]/gi, '-')}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast({ title: "Recipe card downloaded!", description: "Share your cosmic recipe ✨" });
    } catch (error) {
      console.error("Download failed:", error);
      toast({ title: "Download failed", description: "Please try again", variant: "destructive" });
    }
  };

  const gradient = ELEMENT_GRADIENTS[recipe.element] || ELEMENT_GRADIENTS.Water;
  const border = ELEMENT_BORDERS[recipe.element] || ELEMENT_BORDERS.Water;
  const accent = ELEMENT_ACCENTS[recipe.element] || ELEMENT_ACCENTS.Water;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-medium text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Featured Recipe of the Day
        </h3>
        <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          Download Card
        </Button>
      </div>

      <div
        ref={cardRef}
        className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-1`}
      >
        <Card className={`bg-slate-900/95 backdrop-blur-sm ${border} border-2 rounded-lg overflow-hidden`}>
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4">
            <div className="absolute top-4 right-4 text-4xl opacity-80">
              {recipe.moonSign.split(' ')[0]}
            </div>
            <p className={`text-xs uppercase tracking-[0.2em] ${accent} mb-2`}>
              {recipe.element} Element • {recipe.moonSign}
            </p>
            <h2 className="font-serif text-2xl md:text-3xl text-white font-medium leading-tight pr-12">
              {recipe.name}
            </h2>
            <p className="text-white/70 italic mt-2 text-sm">{recipe.tagline}</p>
            
            {/* Meta */}
            <div className="flex gap-4 mt-4 text-white/80 text-sm">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" /> {recipe.servings}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> Prep: {recipe.prepTime}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> Cook: {recipe.cookTime}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 grid md:grid-cols-2 gap-6">
            {/* Ingredients */}
            <div>
              <h3 className={`font-semibold ${accent} mb-3 text-sm uppercase tracking-wider`}>
                Ingredients
              </h3>
              <ul className="space-y-1.5 text-white/90 text-sm">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className={accent}>•</span>
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h3 className={`font-semibold ${accent} mb-3 text-sm uppercase tracking-wider`}>
                Instructions
              </h3>
              <ol className="space-y-2 text-white/90 text-sm">
                {recipe.instructions.map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className={`${accent} font-bold min-w-[1.5rem]`}>{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Cosmic Note Footer */}
          <div className="px-6 py-4 bg-white/5 border-t border-white/10">
            <p className="text-white/80 text-sm italic">
              <span className={`${accent} not-italic`}>✨ Cosmic Note:</span> {recipe.cosmicNote}
            </p>
          </div>

          {/* Watermark */}
          <div className="absolute bottom-2 right-4 text-white/30 text-xs">
            astro-calendar • {date}
          </div>
        </Card>
      </div>
    </div>
  );
};

import { useRef } from "react";
import { Download, Clock, Users, Sparkles, Printer } from "lucide-react";
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

// Print-friendly colors (darker for visibility on white background)
const ELEMENT_PRINT_COLORS: Record<string, string> = {
  Fire: "#c2410c", // orange-700
  Earth: "#047857", // emerald-700
  Air: "#0e7490", // cyan-700
  Water: "#4338ca", // indigo-700
};

function normalizeIngredientMeasurement(input: string): string {
  let s = (input ?? "").trim();
  if (!s) return s;

  // Fix broken leading fractions like "/2" -> "1/2"
  s = s.replace(/^\/(\d)\b/, "1/$1");

  // If a line starts with a unit/descriptor but no number, default to 1.
  const startsWithUnit = /^(tablespoon|teaspoon|cup|cups|clove|cloves|pinch|dash)\b/i;
  const startsWithSizeWord = /^(small|medium|large)\b/i;
  const startsWithNumeric = /^\d+(?:[\s-]\d+)?(?:\/\d+)?\b/;

  if (!startsWithNumeric.test(s) && (startsWithUnit.test(s) || startsWithSizeWord.test(s))) {
    s = `1 ${s}`;
  }

  // If it starts with plural "cups" with no number, normalize to singular with 1.
  s = s.replace(/^1\s+cups\b/i, "1 cup");

  return s;
}

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
  const printCardRef = useRef<HTMLDivElement>(null);

  const printColor = ELEMENT_PRINT_COLORS[recipe.element] || ELEMENT_PRINT_COLORS.Water;

  const handleDownload = async () => {
    if (!printCardRef.current) return;

    try {
      // Temporarily show the print-friendly card for capture
      printCardRef.current.style.position = 'absolute';
      printCardRef.current.style.left = '-9999px';
      printCardRef.current.style.display = 'block';

      const canvas = await html2canvas(printCardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      // Hide it again
      printCardRef.current.style.display = 'none';

      const link = document.createElement("a");
      link.download = `cosmic-recipe-${date.replace(/[^a-z0-9]/gi, '-')}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast({ title: "Recipe card downloaded!", description: "Printer-friendly version saved ✨" });
    } catch (error) {
      console.error("Download failed:", error);
      toast({ title: "Download failed", description: "Please try again", variant: "destructive" });
    }
  };

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${recipe.name} - Cosmic Recipe</title>
        <style>
          @page { margin: 0.5in; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Georgia, 'Times New Roman', serif; 
            padding: 0; 
            color: #1f2937;
            line-height: 1.5;
            font-size: 12px;
          }
          .header { 
            border-bottom: 3px solid ${printColor}; 
            padding-bottom: 10px; 
            margin-bottom: 14px; 
          }
          .element-badge {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: ${printColor};
            margin-bottom: 8px;
          }
          h1 { 
            font-size: 26px; 
            font-weight: 600; 
            color: #111827;
            margin-bottom: 4px;
          }
          .tagline { 
            font-style: italic; 
            color: #6b7280; 
            font-size: 14px;
          }
          .meta { 
            display: flex; 
            gap: 16px; 
            margin-top: 8px; 
            font-size: 11px;
            color: #4b5563;
          }
          .content { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-top: 14px;
          }
          h2 { 
            font-size: 12px; 
            text-transform: uppercase; 
            letter-spacing: 1px;
            color: ${printColor}; 
            margin-bottom: 8px;
            font-weight: 600;
          }
          ul, ol { 
            padding-left: 0; 
            list-style: none;
          }
          li { 
            margin-bottom: 4px; 
            font-size: 11px;
            display: flex;
            gap: 6px;
          }
          .bullet { color: ${printColor}; font-weight: bold; }
          .step-num { 
            color: ${printColor}; 
            font-weight: bold; 
            min-width: 24px;
          }
          .cosmic-note {
            margin-top: 14px;
            padding: 10px;
            border: 1px solid ${printColor};
            border-radius: 6px;
            background: #f9fafb;
          }
          .cosmic-note-label {
            color: ${printColor};
            font-weight: 600;
            font-size: 11px;
          }
          .cosmic-note p {
            font-style: italic;
            font-size: 11px;
            color: #4b5563;
            margin-top: 2px;
          }
          .watermark {
            margin-top: 14px;
            text-align: right;
            font-size: 10px;
            color: #9ca3af;
          }
          @media print {
            body { padding: 0; }
            .content { page-break-inside: auto; }
            li { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="element-badge">${recipe.element} Element • ${recipe.moonSign}</div>
          <h1>${recipe.name}</h1>
          <div class="tagline">${recipe.tagline}</div>
          <div class="meta">
            <span>Serves: ${recipe.servings}</span>
            <span>Prep: ${recipe.prepTime}</span>
            <span>Cook: ${recipe.cookTime}</span>
          </div>
        </div>
        
        <div class="content">
          <div>
            <h2>Ingredients</h2>
            <ul>
              ${recipe.ingredients.map(ing => `<li><span class="bullet">•</span><span>${normalizeIngredientMeasurement(ing)}</span></li>`).join('')}
            </ul>
          </div>
          
          <div>
            <h2>Instructions</h2>
            <ol>
              ${recipe.instructions.map((step, i) => `<li><span class="step-num">${i + 1}.</span><span>${step}</span></li>`).join('')}
            </ol>
          </div>
        </div>
        
        <div class="cosmic-note">
          <span class="cosmic-note-label">✨ Cosmic Note</span>
          <p>${recipe.cosmicNote}</p>
        </div>
        
        <div class="watermark">astro-calendar • ${date}</div>
      </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;left:-9999px;width:0;height:0;border:none;';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    
    doc.open();
    doc.write(printContent);
    doc.close();
    
    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    };
  };

  const gradient = ELEMENT_GRADIENTS[recipe.element] || ELEMENT_GRADIENTS.Water;
  const border = ELEMENT_BORDERS[recipe.element] || ELEMENT_BORDERS.Water;
  const accent = ELEMENT_ACCENTS[recipe.element] || ELEMENT_ACCENTS.Water;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-serif text-lg font-medium text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Featured Recipe of the Day
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
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
                    <span>{normalizeIngredientMeasurement(ing)}</span>
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

      {/* Hidden printer-friendly card for download */}
      <div
        ref={printCardRef}
        style={{ display: 'none', width: '800px', padding: '40px', fontFamily: 'Georgia, serif' }}
      >
        <div style={{ borderBottom: `3px solid ${printColor}`, paddingBottom: '16px', marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: printColor, marginBottom: '8px' }}>
            {recipe.element} Element • {recipe.moonSign}
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>
            {recipe.name}
          </h1>
          <div style={{ fontStyle: 'italic', color: '#6b7280', fontSize: '14px' }}>
            {recipe.tagline}
          </div>
          <div style={{ display: 'flex', gap: '24px', marginTop: '16px', fontSize: '13px', color: '#4b5563' }}>
            <span>Serves: {recipe.servings}</span>
            <span>Prep: {recipe.prepTime}</span>
            <span>Cook: {recipe.cookTime}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          <div>
            <h2 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: printColor, marginBottom: '12px', fontWeight: 600 }}>
              Ingredients
            </h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {recipe.ingredients.map((ing, i) => (
                <li key={i} style={{ marginBottom: '8px', fontSize: '13px', display: 'flex', gap: '8px' }}>
                  <span style={{ color: printColor, fontWeight: 'bold' }}>•</span>
                  <span>{normalizeIngredientMeasurement(ing)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: printColor, marginBottom: '12px', fontWeight: 600 }}>
              Instructions
            </h2>
            <ol style={{ listStyle: 'none', padding: 0 }}>
              {recipe.instructions.map((step, i) => (
                <li key={i} style={{ marginBottom: '8px', fontSize: '13px', display: 'flex', gap: '8px' }}>
                  <span style={{ color: printColor, fontWeight: 'bold', minWidth: '24px' }}>{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div style={{ marginTop: '32px', padding: '16px', border: `1px solid ${printColor}`, borderRadius: '8px', background: '#f9fafb' }}>
          <span style={{ color: printColor, fontWeight: 600, fontSize: '13px' }}>✨ Cosmic Note</span>
          <p style={{ fontStyle: 'italic', fontSize: '13px', color: '#4b5563', marginTop: '4px' }}>
            {recipe.cosmicNote}
          </p>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'right', fontSize: '11px', color: '#9ca3af' }}>
          astro-calendar • {date}
        </div>
      </div>
    </div>
  );
};

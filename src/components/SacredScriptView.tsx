// Sacred Script - Professional Astrology Reading Framework
// Based on Debra Silverman methodology with 9-section structure

import { useState, useRef } from 'react';
import { NatalChart } from '@/hooks/useNatalChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Printer, ChevronDown, ChevronUp, Scroll, Star, Moon, Sun, Flame, Mountain, Wind, Droplets } from 'lucide-react';
import { 
  calculateElementalBalance, 
  getCharacterCards, 
  getLifeLesson, 
  generateFinalDirective,
  getElementGuidance,
  calculateAge,
  ElementalBalance,
  CharacterCard,
  getPlanetHouse,
} from '@/lib/sacredScriptHelpers';
import { generateCharacterSynthesis, CharacterSynthesis, HOUSE_DEEP_MEANINGS } from '@/lib/characterSynthesis';
import { getDecan } from '@/lib/decans';
import { 
  calculateDetailedSaturnCycles, 
  formatCycleDate,
  SaturnCyclePhase,
  DetailedSaturnCycles 
} from '@/lib/saturnCycleCalculator';
import { detectChartPatterns, ChartPattern } from '@/lib/chartPatterns';
import { calculateSecondaryProgressions, getProgressedMoonInfo, ProgressedMoonInfo } from '@/lib/secondaryProgressions';

interface SacredScriptViewProps {
  natalChart: NatalChart;
  allCharts?: NatalChart[];
}

// Section wrapper with collapsible and color coding
const Section = ({ 
  title, 
  color, 
  icon, 
  children, 
  defaultOpen = true 
}: { 
  title: string; 
  color: string; 
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="print:!block">
      <Card className={`border-l-4 ${color} shadow-sm print:shadow-none print:break-inside-avoid`}>
        <CollapsibleTrigger className="w-full text-left">
          <CardHeader className="py-4 print:py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {icon}
                <CardTitle className="text-lg font-serif">{title}</CardTitle>
              </div>
              <span className="print:hidden">
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </span>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent className="print:!block print:!h-auto">
          <CardContent className="pt-0 print:pt-2">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

// Note-taking area
const NoteArea = ({ placeholder }: { placeholder: string }) => {
  const [note, setNote] = useState('');
  return (
    <Textarea
      placeholder={placeholder}
      value={note}
      onChange={(e) => setNote(e.target.value)}
      className="mt-3 min-h-[60px] text-sm bg-secondary/30 border-dashed print:border-solid print:min-h-[40px]"
    />
  );
};

// Checklist item
const CheckItem = ({ label }: { label: string }) => {
  const [checked, setChecked] = useState(false);
  return (
    <div className="flex items-center gap-2 py-1">
      <Checkbox checked={checked} onCheckedChange={() => setChecked(!checked)} />
      <span className={`text-sm ${checked ? 'line-through text-muted-foreground' : ''}`}>{label}</span>
    </div>
  );
};

// Element icon component
const ElementIcon = ({ element }: { element: string }) => {
  const icons: Record<string, React.ReactNode> = {
    Fire: <Flame className="text-orange-500" size={16} />,
    Earth: <Mountain className="text-green-700" size={16} />,
    Air: <Wind className="text-sky-500" size={16} />,
    Water: <Droplets className="text-blue-500" size={16} />,
  };
  return icons[element] || null;
};

export const SacredScriptView = ({ natalChart: initialChart, allCharts = [] }: SacredScriptViewProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const currentDate = new Date();
  const [selectedChartId, setSelectedChartId] = useState<string>(initialChart?.id || '');
  
  // Get sorted charts alphabetically
  const sortedCharts = [...allCharts].sort((a, b) => a.name.localeCompare(b.name));
  
  // Get the selected chart
  const natalChart = sortedCharts.find(c => c.id === selectedChartId) || initialChart;
  
  // Calculate all data
  const age = calculateAge(natalChart.birthDate);
  const detailedSaturnCycles = calculateDetailedSaturnCycles(natalChart, currentDate);
  const elements = calculateElementalBalance(natalChart);
  const characterCards = getCharacterCards(natalChart);
  const patterns = detectChartPatterns(natalChart);
  const lifeLesson = getLifeLesson(natalChart);
  const finalDirective = generateFinalDirective(natalChart, elements);
  
  // Get house positions for deep synthesis
  const sunHouse = getPlanetHouse(natalChart, 'Sun');
  const moonHouse = getPlanetHouse(natalChart, 'Moon');
  
  // Generate deep character synthesis
  const characterSynthesis = generateCharacterSynthesis(natalChart, sunHouse, moonHouse);
  
  // Progressed Moon
  const progressions = calculateSecondaryProgressions(natalChart, currentDate);
  const progressedMoon = progressions ? getProgressedMoonInfo(progressions, natalChart) : null;
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div ref={printRef} className="max-w-4xl mx-auto space-y-4">
      {/* Chart Selector */}
      {sortedCharts.length > 1 && (
        <div className="flex items-center gap-3 mb-6 print:hidden">
          <label className="text-sm font-medium text-muted-foreground">Select Chart:</label>
          <select
            value={selectedChartId}
            onChange={(e) => setSelectedChartId(e.target.value)}
            className="flex-1 max-w-xs border border-border bg-background px-3 py-2 text-sm rounded-sm focus:border-primary focus:outline-none"
          >
            {sortedCharts.map(chart => (
              <option key={chart.id} value={chart.id}>
                {chart.name}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
        <div className="flex items-center gap-4">
          <Scroll className="text-primary" size={32} />
          <div>
            <h2 className="text-2xl font-serif tracking-wide">{natalChart.name}'s Sacred Script</h2>
            <p className="text-sm text-muted-foreground">
              Born {natalChart.birthDate} at {natalChart.birthTime} • {natalChart.birthLocation} • Age {age}
            </p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 border border-border hover:bg-secondary transition-colors print:hidden"
        >
          <Printer size={16} />
          Print
        </button>
      </div>
      
      {/* 1. Introduction */}
      <Section 
        title="1. Introduction" 
        color="border-l-blue-500" 
        icon={<div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600 text-xs font-bold">1</div>}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Opening Questions</h4>
            <CheckItem label="What brings you here today?" />
            <CheckItem label="What are you hoping to understand or receive from this reading?" />
            <CheckItem label="Is there a specific area of life you want to focus on?" />
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">Reading Structure:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Saturn cycles (timing)</li>
              <li>Character: Sun, Moon, Rising</li>
              <li>What stands out in the chart</li>
              <li>Current transits & progressions</li>
              <li>Life lesson (Saturn) & direction</li>
            </ol>
          </div>
          
          <NoteArea placeholder="Client's initial questions and concerns..." />
        </div>
      </Section>
      
      {/* 2. Saturn Cycles */}
      <Section 
        title="2. Saturn Cycles (Timing)" 
        color="border-l-green-500" 
        icon={<div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-600 text-xs font-bold">♄</div>}
      >
        {detailedSaturnCycles ? (
          <div className="space-y-4">
            {/* Natal Saturn Position */}
            <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-300 dark:border-slate-700">
              <h4 className="font-medium mb-1">Natal Saturn Position</h4>
              <p className="text-lg font-serif">
                ♄ {detailedSaturnCycles.natalSaturn.degree}°{detailedSaturnCycles.natalSaturn.minutes.toString().padStart(2, '0')}' {detailedSaturnCycles.natalSaturn.sign}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                All cycles are calculated from this exact position ({detailedSaturnCycles.natalSaturn.absoluteDegree.toFixed(2)}° zodiacal longitude)
              </p>
            </div>
            
            {/* First Saturn Cycle (Birth to ~29.5) */}
            <div className="space-y-2">
              <h4 className="font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                <span className="text-lg">①</span> First Saturn Cycle (Birth to ~Age 29)
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {detailedSaturnCycles.cycles
                  .filter(c => c.cycleNumber === 1)
                  .map((cycle, idx) => (
                    <DetailedSaturnCycleCard key={`1-${idx}`} cycle={cycle} birthDate={natalChart.birthDate} />
                  ))}
              </div>
            </div>
            
            {/* Second Saturn Cycle (~29.5 to ~59) */}
            <div className="space-y-2">
              <h4 className="font-medium text-blue-700 dark:text-blue-400 flex items-center gap-2">
                <span className="text-lg">②</span> Second Saturn Cycle (~Age 29 to ~59)
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {detailedSaturnCycles.cycles
                  .filter(c => c.cycleNumber === 2)
                  .map((cycle, idx) => (
                    <DetailedSaturnCycleCard key={`2-${idx}`} cycle={cycle} birthDate={natalChart.birthDate} />
                  ))}
              </div>
            </div>
            
            {/* Third Saturn Cycle (~59 to ~88) */}
            <div className="space-y-2">
              <h4 className="font-medium text-purple-700 dark:text-purple-400 flex items-center gap-2">
                <span className="text-lg">③</span> Third Saturn Cycle (~Age 59 to ~88)
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {detailedSaturnCycles.cycles
                  .filter(c => c.cycleNumber === 3)
                  .map((cycle, idx) => (
                    <DetailedSaturnCycleCard key={`3-${idx}`} cycle={cycle} birthDate={natalChart.birthDate} />
                  ))}
              </div>
            </div>
            
            {/* Fourth Saturn Cycle if any events exist */}
            {detailedSaturnCycles.cycles.some(c => c.cycleNumber === 4) && (
              <div className="space-y-2">
                <h4 className="font-medium text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <span className="text-lg">④</span> Fourth Saturn Cycle (~Age 88+)
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {detailedSaturnCycles.cycles
                    .filter(c => c.cycleNumber === 4)
                    .map((cycle, idx) => (
                      <DetailedSaturnCycleCard key={`4-${idx}`} cycle={cycle} birthDate={natalChart.birthDate} />
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No Saturn position found in natal chart. Please ensure Saturn is included in chart data.
          </p>
        )}
      </Section>
      
      {/* 3. Character */}
      <Section 
        title="3. Character (Sun/Moon/Rising)" 
        color="border-l-amber-500" 
        icon={<Sun className="text-amber-500" size={20} />}
      >
        <div className="space-y-6">
          {/* Opening Statement */}
          <p className="text-sm italic text-muted-foreground mb-4">
            "Your Sun is in {characterCards.find(c => c.planet === 'Sun')?.sign || '...'}, 
            your Moon is in {characterCards.find(c => c.planet === 'Moon')?.sign || '...'}, 
            and your Rising sign is {characterCards.find(c => c.planet === 'Rising')?.sign || '...'}."
          </p>
          
          {/* Overview - How the Trinity Works Together */}
          {characterSynthesis && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 p-5 rounded-lg border border-amber-200 dark:border-amber-800">
              <h4 className="font-serif text-lg font-medium text-amber-800 dark:text-amber-300 mb-3">The Big Picture</h4>
              <p className="text-sm leading-relaxed">{characterSynthesis.overview}</p>
            </div>
          )}
          
          {/* Trinity Synthesis Narrative */}
          {characterSynthesis && (
            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-lg border border-slate-200 dark:border-slate-700">
              <h4 className="font-serif text-lg font-medium mb-3">How Your Big Three Work Together</h4>
              <p className="text-sm leading-relaxed whitespace-pre-line">{characterSynthesis.trinitySynthesis}</p>
            </div>
          )}
          
          {/* Detailed Cards with Decan, Degree, and House */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-medium">Detailed Breakdown</h4>
            
            {/* SUN DEEP DIVE */}
            {characterSynthesis?.sunDeep && (
              <div className="bg-orange-50 dark:bg-orange-950/30 p-5 rounded-lg border-l-4 border-orange-500">
                <div className="flex items-center gap-2 mb-3">
                  <Sun className="text-orange-500" size={24} />
                  <h5 className="font-medium text-lg">Sun in {characterSynthesis.sunDeep.sign}</h5>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {characterSynthesis.sunDeep.degree}° • {characterSynthesis.sunDeep.decan.number === 1 ? '1st' : characterSynthesis.sunDeep.decan.number === 2 ? '2nd' : '3rd'} Decan
                    {characterSynthesis.sunDeep.house && ` • House ${characterSynthesis.sunDeep.house}`}
                  </span>
                </div>
                
                <div className="space-y-3 text-sm">
                  {/* Decan Info */}
                  <div className="bg-orange-100/50 dark:bg-orange-900/30 p-3 rounded">
                    <p className="font-medium text-orange-700 dark:text-orange-400 mb-1">
                      {characterSynthesis.sunDeep.decan.degrees} — Ruled by {characterSynthesis.sunDeep.decan.rulerSymbol} {characterSynthesis.sunDeep.decan.ruler}
                    </p>
                    <p>{characterSynthesis.sunDeep.decan.description}</p>
                  </div>
                  
                  {/* Degree Meaning */}
                  <div className={`p-3 rounded ${characterSynthesis.sunDeep.degreeMeaning.critical ? 'bg-rose-100/50 dark:bg-rose-900/30 border border-rose-300 dark:border-rose-700' : 'bg-slate-100/50 dark:bg-slate-800/30'}`}>
                    <p className="font-medium mb-1">
                      {characterSynthesis.sunDeep.degreeMeaning.critical && '⚡ '}
                      Degree Meaning ({characterSynthesis.sunDeep.degree}°)
                    </p>
                    <p>{characterSynthesis.sunDeep.degreeMeaning.meaning}</p>
                  </div>
                  
                  {/* House Meaning */}
                  {characterSynthesis.sunDeep.house && characterSynthesis.sunDeep.houseMeaning && (
                    <div className="bg-amber-100/50 dark:bg-amber-900/30 p-3 rounded">
                      <p className="font-medium text-amber-700 dark:text-amber-400 mb-1">
                        House {characterSynthesis.sunDeep.house}: {HOUSE_DEEP_MEANINGS[characterSynthesis.sunDeep.house]?.theme}
                      </p>
                      <p>{characterSynthesis.sunDeep.houseMeaning}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* MOON DEEP DIVE */}
            {characterSynthesis?.moonDeep && (
              <div className="bg-teal-50 dark:bg-teal-950/30 p-5 rounded-lg border-l-4 border-teal-500">
                <div className="flex items-center gap-2 mb-3">
                  <Moon className="text-teal-500" size={24} />
                  <h5 className="font-medium text-lg">Moon in {characterSynthesis.moonDeep.sign}</h5>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {characterSynthesis.moonDeep.degree}° • {characterSynthesis.moonDeep.decan.number === 1 ? '1st' : characterSynthesis.moonDeep.decan.number === 2 ? '2nd' : '3rd'} Decan
                    {characterSynthesis.moonDeep.house && ` • House ${characterSynthesis.moonDeep.house}`}
                  </span>
                </div>
                
                <div className="space-y-3 text-sm">
                  {/* Decan Info */}
                  <div className="bg-teal-100/50 dark:bg-teal-900/30 p-3 rounded">
                    <p className="font-medium text-teal-700 dark:text-teal-400 mb-1">
                      {characterSynthesis.moonDeep.decan.degrees} — Ruled by {characterSynthesis.moonDeep.decan.rulerSymbol} {characterSynthesis.moonDeep.decan.ruler}
                    </p>
                    <p>{characterSynthesis.moonDeep.decan.description}</p>
                  </div>
                  
                  {/* Degree Meaning */}
                  <div className={`p-3 rounded ${characterSynthesis.moonDeep.degreeMeaning.critical ? 'bg-rose-100/50 dark:bg-rose-900/30 border border-rose-300 dark:border-rose-700' : 'bg-slate-100/50 dark:bg-slate-800/30'}`}>
                    <p className="font-medium mb-1">
                      {characterSynthesis.moonDeep.degreeMeaning.critical && '⚡ '}
                      Degree Meaning ({characterSynthesis.moonDeep.degree}°)
                    </p>
                    <p>{characterSynthesis.moonDeep.degreeMeaning.meaning}</p>
                  </div>
                  
                  {/* House Meaning */}
                  {characterSynthesis.moonDeep.house && characterSynthesis.moonDeep.houseMeaning && (
                    <div className="bg-cyan-100/50 dark:bg-cyan-900/30 p-3 rounded">
                      <p className="font-medium text-cyan-700 dark:text-cyan-400 mb-1">
                        House {characterSynthesis.moonDeep.house}: {HOUSE_DEEP_MEANINGS[characterSynthesis.moonDeep.house]?.theme}
                      </p>
                      <p>{characterSynthesis.moonDeep.houseMeaning}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* RISING DEEP DIVE */}
            {characterSynthesis?.risingDeep && (
              <div className="bg-purple-50 dark:bg-purple-950/30 p-5 rounded-lg border-l-4 border-purple-500">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="text-purple-500" size={24} />
                  <h5 className="font-medium text-lg">Rising in {characterSynthesis.risingDeep.sign}</h5>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {characterSynthesis.risingDeep.degree}° • {characterSynthesis.risingDeep.decan.number === 1 ? '1st' : characterSynthesis.risingDeep.decan.number === 2 ? '2nd' : '3rd'} Decan
                    {' • House 1'}
                  </span>
                </div>
                
                <div className="space-y-3 text-sm">
                  {/* Decan Info */}
                  <div className="bg-purple-100/50 dark:bg-purple-900/30 p-3 rounded">
                    <p className="font-medium text-purple-700 dark:text-purple-400 mb-1">
                      {characterSynthesis.risingDeep.decan.degrees} — Ruled by {characterSynthesis.risingDeep.decan.rulerSymbol} {characterSynthesis.risingDeep.decan.ruler}
                    </p>
                    <p>{characterSynthesis.risingDeep.decan.description}</p>
                  </div>
                  
                  {/* Degree Meaning */}
                  <div className={`p-3 rounded ${characterSynthesis.risingDeep.degreeMeaning.critical ? 'bg-rose-100/50 dark:bg-rose-900/30 border border-rose-300 dark:border-rose-700' : 'bg-slate-100/50 dark:bg-slate-800/30'}`}>
                    <p className="font-medium mb-1">
                      {characterSynthesis.risingDeep.degreeMeaning.critical && '⚡ '}
                      Degree Meaning ({characterSynthesis.risingDeep.degree}°)
                    </p>
                    <p>{characterSynthesis.risingDeep.degreeMeaning.meaning}</p>
                  </div>
                  
                  {/* Rising/1st House Always */}
                  <div className="bg-violet-100/50 dark:bg-violet-900/30 p-3 rounded">
                    <p className="font-medium text-violet-700 dark:text-violet-400 mb-1">
                      House 1: Self, Identity, Physical Presence
                    </p>
                    <p>Your Rising sign is always in the 1st House—it IS the cusp of the 1st House. This is how you meet the world, your physical appearance, your immediate reactions, and the lens through which all other experiences are filtered.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Element & Modality Dynamics */}
          {characterSynthesis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Element Dynamic */}
              <div className="bg-gradient-to-br from-red-50 via-green-50 to-blue-50 dark:from-red-950/30 dark:via-green-950/30 dark:to-blue-950/30 p-4 rounded-lg border">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Flame className="text-orange-500" size={18} />
                  <span>Element Dynamic</span>
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded ml-auto">{characterSynthesis.elementDynamic.combination}</span>
                </h4>
                <p className="text-sm mb-2">{characterSynthesis.elementDynamic.description}</p>
                {characterSynthesis.elementDynamic.dynamic && (
                  <p className="text-sm text-muted-foreground mb-2"><strong>Dynamic:</strong> {characterSynthesis.elementDynamic.dynamic}</p>
                )}
                {characterSynthesis.elementDynamic.gift && (
                  <p className="text-sm text-green-700 dark:text-green-400"><strong>Gift:</strong> {characterSynthesis.elementDynamic.gift}</p>
                )}
                {characterSynthesis.elementDynamic.challenge && (
                  <p className="text-sm text-rose-700 dark:text-rose-400 mt-1"><strong>Challenge:</strong> {characterSynthesis.elementDynamic.challenge}</p>
                )}
              </div>
              
              {/* Modality Dynamic */}
              <div className="bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 dark:from-violet-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 p-4 rounded-lg border">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Star className="text-indigo-500" size={18} />
                  <span>Modality Dynamic</span>
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded ml-auto">{characterSynthesis.modalityDynamic.combination}</span>
                </h4>
                <p className="text-sm mb-2">{characterSynthesis.modalityDynamic.description}</p>
                {characterSynthesis.modalityDynamic.energy && (
                  <p className="text-sm text-muted-foreground mb-2"><strong>Energy:</strong> {characterSynthesis.modalityDynamic.energy}</p>
                )}
                {characterSynthesis.modalityDynamic.challenge && (
                  <p className="text-sm text-rose-700 dark:text-rose-400"><strong>Challenge:</strong> {characterSynthesis.modalityDynamic.challenge}</p>
                )}
              </div>
            </div>
          )}
          
          {/* Elemental Balance Visual */}
          <ElementalBalanceVisual elements={elements} />
          
          {/* Quick Reference Cards - Keep the original simple view */}
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2">
              <ChevronDown size={16} className="group-open:rotate-180 transition-transform" />
              Quick Reference Cards
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              {characterCards.map((card) => (
                <CharacterCardComponent key={card.planet} card={card} />
              ))}
            </div>
          </details>
          
          <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Check-in Questions</h4>
            <CheckItem label="Does this Big Three combination feel accurate to you?" />
            <CheckItem label="How do you experience the tension/harmony between your Sun and Moon elements?" />
            <CheckItem label="Do people often comment on your Rising sign energy?" />
            <CheckItem label="Can you feel the decan ruler's influence in how you express these placements?" />
          </div>
          
          <NoteArea placeholder="Client's response to character synthesis. How do they experience their element/modality combination? Any resistance to the interpretation?" />
        </div>
      </Section>
      
      {/* 4. What Stands Out */}
      <Section 
        title="4. What Stands Out" 
        color="border-l-purple-500" 
        icon={<Star className="text-purple-500" size={20} />}
      >
        <div className="space-y-4">
          {patterns.length > 0 ? (
            <div className="space-y-3">
              {patterns.map((pattern, i) => (
                <PatternCard key={i} pattern={pattern} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No major patterns (Grand Trine, T-Square, etc.) detected. Focus on individual planetary aspects.
            </p>
          )}
          
          <NoteArea placeholder="Additional patterns or aspects to discuss..." />
        </div>
      </Section>
      
      {/* 5. Missing/Abundant Elements */}
      <Section 
        title="5. Missing & Abundant Elements" 
        color="border-l-rose-500" 
        icon={<div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-600 text-xs font-bold">5</div>}
      >
        <div className="space-y-4">
          {elements.missing.length > 0 && (
            <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-lg border border-rose-200 dark:border-rose-800">
              <h4 className="font-medium text-rose-700 dark:text-rose-400 mb-2 flex items-center gap-2">
                Missing Element{elements.missing.length > 1 ? 's' : ''}: {elements.missing.join(', ')}
              </h4>
              {elements.missing.map(el => (
                <p key={el} className="text-sm mt-2">
                  <ElementIcon element={el} /> <strong>{el}:</strong> {getElementGuidance(el, 'missing')}
                </p>
              ))}
            </div>
          )}
          
          {elements.abundant.length > 0 && (
            <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                Abundant Element{elements.abundant.length > 1 ? 's' : ''}: {elements.abundant.join(', ')}
              </h4>
              {elements.abundant.map(el => (
                <p key={el} className="text-sm mt-2">
                  <ElementIcon element={el} /> <strong>{el}:</strong> {getElementGuidance(el, 'abundant')}
                </p>
              ))}
            </div>
          )}
          
          {elements.missing.length === 0 && elements.abundant.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Elemental balance is relatively even. No strong deficiencies or abundances.
            </p>
          )}
          
          <NoteArea placeholder="How client relates to missing/abundant elements..." />
        </div>
      </Section>
      
      {/* 6. Current Transits */}
      <Section 
        title="6. Current Transits" 
        color="border-l-cyan-500" 
        icon={<div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-600 text-xs font-bold">6</div>}
      >
        <p className="text-sm text-muted-foreground mb-4">
          Check the calendar's Day Detail view for current transits to {natalChart.name}'s chart.
          Focus on outer planet transits (Saturn, Jupiter, Uranus, Neptune, Pluto) within 1° orb.
        </p>
        
        <div className="bg-cyan-50 dark:bg-cyan-950/30 p-4 rounded-lg">
          <CheckItem label="Check Saturn transits (structure, lessons)" />
          <CheckItem label="Check Jupiter transits (expansion, opportunity)" />
          <CheckItem label="Check Uranus transits (change, awakening)" />
          <CheckItem label="Check Neptune transits (dissolution, dreams)" />
          <CheckItem label="Check Pluto transits (transformation, power)" />
        </div>
        
        <NoteArea placeholder="Current transits affecting the client..." />
      </Section>
      
      {/* 7. Progressed Moon */}
      <Section 
        title="7. Progressed Moon" 
        color="border-l-indigo-500" 
        icon={<Moon className="text-indigo-500" size={20} />}
      >
        {progressedMoon ? (
          <ProgressedMoonCard moon={progressedMoon} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Unable to calculate progressed Moon. Check birth data.
          </p>
        )}
        
        <NoteArea placeholder="How client is experiencing progressed Moon themes..." />
      </Section>
      
      {/* 8. Life Lesson */}
      <Section 
        title="8. Life Lesson (Saturn)" 
        color="border-l-slate-500" 
        icon={<div className="w-6 h-6 rounded-full bg-slate-500/20 flex items-center justify-center text-slate-600 text-xs font-bold">8</div>}
      >
        <div className="space-y-4">
          {lifeLesson.saturn && (
            <div className="bg-slate-50 dark:bg-slate-950/30 p-4 rounded-lg">
              <h4 className="font-medium mb-2">
                Saturn in {lifeLesson.saturn.sign}
                {lifeLesson.saturn.house && ` (House ${lifeLesson.saturn.house})`}
              </h4>
              <p className="text-sm mb-3">{lifeLesson.saturn.lesson}</p>
              <p className="text-sm font-medium text-primary">
                Directive: {lifeLesson.saturn.directive}
              </p>
            </div>
          )}
          
          {lifeLesson.northNode && (
            <div className="bg-slate-100 dark:bg-slate-900/30 p-4 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
              <h4 className="font-medium mb-2 text-muted-foreground">
                North Node in {lifeLesson.northNode.sign}
                {lifeLesson.northNode.house && ` (House ${lifeLesson.northNode.house})`}
              </h4>
              <p className="text-sm text-muted-foreground italic">
                (For your reference—don't necessarily tell the client)
              </p>
              <p className="text-sm mt-2">{lifeLesson.northNode.direction}</p>
            </div>
          )}
          
          <NoteArea placeholder="How Saturn themes show up in client's life..." />
        </div>
      </Section>
      
      {/* 9. Final Directive */}
      <Section 
        title="9. Final Directive" 
        color="border-l-yellow-500" 
        icon={<Star className="text-yellow-500" size={20} />}
        defaultOpen={true}
      >
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-muted-foreground mb-2 italic">
            "When you leave, remember this one thing..."
          </p>
          <p className="text-xl font-serif text-foreground">
            {finalDirective}
          </p>
        </div>
        
        <NoteArea placeholder="Personalized closing message for client..." />
      </Section>
    </div>
  );
};

// Detailed Saturn Cycle Card with retrograde passes and sign themes
const DetailedSaturnCycleCard = ({ 
  cycle, 
  birthDate 
}: { 
  cycle: SaturnCyclePhase; 
  birthDate: string;
}) => {
  const [showThemes, setShowThemes] = useState(false);
  
  const bgColor = cycle.isPast 
    ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' 
    : cycle.isUpcoming 
      ? 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 ring-2 ring-yellow-400' 
      : 'bg-secondary/30 border-border';
  
  const phaseColors: Record<string, string> = {
    'First Quarter': 'text-orange-600 dark:text-orange-400',
    'Opposition': 'text-red-600 dark:text-red-400',
    'Third Quarter': 'text-blue-600 dark:text-blue-400',
    'Return': 'text-purple-600 dark:text-purple-400'
  };
  
  const phaseTypeLabels: Record<string, string> = {
    'waxing': '↗️ WAXING (Building)',
    'culmination': '🔆 CULMINATION (Peak)',
    'waning': '↘️ WANING (Releasing)',
    'conjunction': '🔄 RETURN (Reset)'
  };
  
  const elementIcons: Record<string, string> = {
    'Fire': '🔥',
    'Earth': '🌍',
    'Air': '💨',
    'Water': '💧'
  };
  
  const typeLabels: Record<string, string> = {
    'exact': '① First Pass (Direct)',
    'retrograde_pass': '② Retrograde Pass',
    'direct_pass': '③ Final Pass (Direct)'
  };
  
  return (
    <div className={`p-4 rounded-lg border ${bgColor}`}>
      {/* Header with phase and transiting sign */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-xl font-bold ${phaseColors[cycle.phaseName]}`}>
            {cycle.phaseSymbol}
          </span>
          <div>
            <span className="font-medium">{cycle.phaseName}</span>
            <span className="text-xs text-muted-foreground ml-2">
              {phaseTypeLabels[cycle.phaseType]}
            </span>
          </div>
        </div>
      </div>
      
      {/* Transiting Sign - THE KEY ADDITION */}
      <div className="bg-background/70 rounded-lg p-3 mb-3 border border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Saturn Transiting</p>
            <p className="text-lg font-serif font-medium">
              ♄ in {cycle.transitingSign} {elementIcons[cycle.transitingElement]}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Natal ♄</p>
            <p className="text-sm">{cycle.natalSign}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {cycle.natalSign} → {cycle.transitingSign} ({cycle.phaseSymbol} {cycle.phaseName.toLowerCase()})
        </p>
      </div>
      
      <p className="text-sm text-muted-foreground mb-3">
        {cycle.description}
      </p>
      
      {/* All transit events with dates */}
      <div className="bg-background/50 rounded p-3 mb-3 space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Exact Transits Over {cycle.targetDegree.toFixed(1)}° {cycle.transitingSign}
        </p>
        {cycle.events.map((event, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{typeLabels[event.type] || event.type}</span>
            <div className="text-right">
              <span className="font-medium">{formatCycleDate(event.date)}</span>
              <span className="text-muted-foreground ml-2">(Age {event.age})</span>
            </div>
          </div>
        ))}
        {cycle.events.length > 1 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 pt-2 border-t border-border/50">
            ⚠️ Saturn retrograded over this degree — triple pass
          </p>
        )}
      </div>
      
      {/* Toggle for detailed themes */}
      <button 
        onClick={() => setShowThemes(!showThemes)}
        className="text-xs text-primary hover:underline mb-3 flex items-center gap-1"
      >
        {showThemes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {showThemes ? 'Hide' : 'Show'} detailed themes for ♄ in {cycle.transitingSign}
      </button>
      
      {showThemes && (
        <div className="space-y-3 mb-3">
          {/* Phase Themes */}
          <div className="bg-slate-100 dark:bg-slate-900/50 rounded p-3 text-sm">
            <p className="font-medium mb-2 text-slate-700 dark:text-slate-300">
              {cycle.phaseType === 'waxing' ? '↗️' : cycle.phaseType === 'waning' ? '↘️' : '🔄'} Phase Meaning:
            </p>
            <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line text-xs leading-relaxed">
              {cycle.phaseThemes}
            </p>
          </div>
          
          {/* Sign Themes */}
          <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded p-3 text-sm">
            <p className="font-medium mb-2 text-indigo-700 dark:text-indigo-300">
              {elementIcons[cycle.transitingElement]} Sign Themes ({cycle.transitingSign}):
            </p>
            <p className="text-indigo-600 dark:text-indigo-400 whitespace-pre-line text-xs leading-relaxed">
              {cycle.signThemes}
            </p>
          </div>
        </div>
      )}
      
      <p className="text-sm italic text-foreground/80 mb-2">"{cycle.question}"</p>
      
      <NoteArea placeholder="Client's response about this time period..." />
    </div>
  );
};

// Character Card Component
const CharacterCardComponent = ({ card }: { card: CharacterCard }) => {
  const colors: Record<string, string> = {
    Sun: 'bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-700',
    Moon: 'bg-teal-50 dark:bg-teal-950/30 border-teal-300 dark:border-teal-700',
    Rising: 'bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700',
  };
  
  const icons: Record<string, React.ReactNode> = {
    Sun: <Sun className="text-orange-500" size={24} />,
    Moon: <Moon className="text-teal-500" size={24} />,
    Rising: <Star className="text-purple-500" size={24} />,
  };
  
  return (
    <div className={`p-4 rounded-lg border ${colors[card.planet]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icons[card.planet]}
        <h4 className="font-medium">{card.planet}</h4>
      </div>
      <p className="text-lg font-serif mb-1">{card.sign}</p>
      <p className="text-xs text-muted-foreground mb-2">
        {card.degree}° • {card.element} • {card.modality}
        {card.house && ` • House ${card.house}`}
      </p>
      <p className="text-sm">{card.description}</p>
      <div className="flex flex-wrap gap-1 mt-2">
        {card.keywords.map((kw, i) => (
          <span key={i} className="text-xs bg-background/50 px-2 py-0.5 rounded">
            {kw}
          </span>
        ))}
      </div>
    </div>
  );
};

// Elemental Balance Visual
const ElementalBalanceVisual = ({ elements }: { elements: ElementalBalance }) => {
  const total = elements.Fire + elements.Earth + elements.Air + elements.Water;
  
  const bars = [
    { name: 'Fire', count: elements.Fire, color: 'bg-orange-500', planets: elements.planets.Fire },
    { name: 'Earth', count: elements.Earth, color: 'bg-green-600', planets: elements.planets.Earth },
    { name: 'Air', count: elements.Air, color: 'bg-sky-500', planets: elements.planets.Air },
    { name: 'Water', count: elements.Water, color: 'bg-blue-600', planets: elements.planets.Water },
  ];
  
  return (
    <div className="bg-secondary/30 p-4 rounded-lg mt-4">
      <h4 className="font-medium mb-3">Elemental Balance</h4>
      <div className="space-y-2">
        {bars.map((bar) => (
          <div key={bar.name} className="flex items-center gap-2">
            <span className="w-12 text-sm">{bar.name}</span>
            <div className="flex-1 h-4 bg-background rounded overflow-hidden">
              <div 
                className={`h-full ${bar.color}`} 
                style={{ width: `${(bar.count / total) * 100}%` }}
              />
            </div>
            <span className="w-8 text-sm text-right">{bar.count}</span>
            <span className="text-xs text-muted-foreground w-32 truncate">
              {bar.planets.join(', ')}
            </span>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground mt-3">
        Energy Pattern: <span className="font-medium">{elements.pattern}</span>
        {elements.pattern === 'Energized' && ' (Fire+Air dominant = outward, active)'}
        {elements.pattern === 'Grounded' && ' (Earth+Water dominant = inward, receptive)'}
      </p>
    </div>
  );
};

// Pattern Card
const PatternCard = ({ pattern }: { pattern: ChartPattern }) => {
  return (
    <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{pattern.symbol}</span>
        <h4 className="font-medium">{pattern.name}</h4>
      </div>
      <p className="text-sm text-muted-foreground mb-2">
        Planets: {pattern.planets.join(' • ')}
      </p>
      <p className="text-sm">{pattern.meaning}</p>
      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
        <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded">
          <span className="font-medium">Challenge:</span> {pattern.challenge}
        </div>
        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
          <span className="font-medium">Gift:</span> {pattern.gift}
        </div>
      </div>
    </div>
  );
};

// Progressed Moon Card
const ProgressedMoonCard = ({ moon }: { moon: ProgressedMoonInfo }) => {
  const alertUpcoming = moon.monthsUntilSignChange <= 6;
  
  return (
    <div className="space-y-4">
      <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <Moon className="text-indigo-500" size={28} />
          <div>
            <h4 className="font-medium text-lg">Progressed Moon in {moon.sign}</h4>
            <p className="text-sm text-muted-foreground">
              {moon.degree}° • {moon.phase} Phase • {moon.house && `House ${moon.house}`}
            </p>
          </div>
        </div>
        
        <p className="text-sm mb-2">
          <strong>Theme:</strong> {moon.signMeaning?.theme}
        </p>
        <p className="text-sm mb-2">
          <strong>Focus:</strong> {moon.signMeaning?.focus}
        </p>
        <p className="text-sm mb-2">
          <strong>Phase:</strong> {moon.phaseDescription}
        </p>
        
        {moon.houseMeaning && (
          <p className="text-sm">
            <strong>House {moon.house}:</strong> {moon.houseMeaning.themes}
          </p>
        )}
      </div>
      
      {alertUpcoming && (
        <div className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg border border-yellow-300 dark:border-yellow-700">
          <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
            ⚠️ Sign change approaching! Moon enters {moon.nextSign} around {moon.signChangeDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        {moon.signMeaning?.keywords.map((kw, i) => (
          <span key={i} className="text-xs bg-indigo-100 dark:bg-indigo-900/50 px-2 py-1 rounded">
            {kw}
          </span>
        ))}
      </div>
    </div>
  );
};

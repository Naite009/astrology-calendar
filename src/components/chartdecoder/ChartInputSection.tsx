import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Upload, FileJson, Edit3, Settings } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChartPlanet, AspectOrbs, DEFAULT_ORBS } from '@/lib/chartDecoderLogic';
import { toast } from 'sonner';

interface ChartInputSectionProps {
  onChartDataLoaded: (planets: ChartPlanet[]) => void;
  houseSystem: string;
  setHouseSystem: (system: string) => void;
  useTraditional: boolean;
  setUseTraditional: (val: boolean) => void;
  aspectOrbs: AspectOrbs;
  setAspectOrbs: (orbs: AspectOrbs) => void;
}

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const PLANET_NAMES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn',
  'Uranus', 'Neptune', 'Pluto', 'Chiron', 'NorthNode', 'Ascendant', 'Midheaven'
];

export const ChartInputSection: React.FC<ChartInputSectionProps> = ({
  onChartDataLoaded,
  houseSystem,
  setHouseSystem,
  useTraditional,
  setUseTraditional,
  aspectOrbs,
  setAspectOrbs
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [manualPlanets, setManualPlanets] = useState<Partial<ChartPlanet>[]>(
    PLANET_NAMES.map(name => ({ name, sign: '', degree: 0, retrograde: false, house: null }))
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inputMode, setInputMode] = useState<'json' | 'manual'>('manual');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        if (data.planets && Array.isArray(data.planets)) {
          onChartDataLoaded(data.planets);
          toast.success('Chart data loaded from JSON');
        } else {
          toast.error('Invalid JSON format - expected { planets: [...] }');
        }
      } catch (e) {
        toast.error('Failed to parse JSON file');
      }
    } else if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      toast.info('Image/PDF upload detected. Use manual entry for now.');
    }
  };

  const handleJsonPaste = () => {
    try {
      const data = JSON.parse(jsonInput);
      if (data.planets && Array.isArray(data.planets)) {
        onChartDataLoaded(data.planets);
        toast.success('Chart data loaded from JSON');
      } else if (Array.isArray(data)) {
        onChartDataLoaded(data);
        toast.success('Chart data loaded');
      } else {
        toast.error('Invalid JSON format');
      }
    } catch (e) {
      toast.error('Failed to parse JSON');
    }
  };

  const handleManualUpdate = (index: number, field: keyof ChartPlanet, value: string | number | boolean) => {
    const updated = [...manualPlanets];
    updated[index] = { ...updated[index], [field]: value };
    setManualPlanets(updated);
  };

  const handleManualSubmit = () => {
    const validPlanets = manualPlanets.filter(p => p.name && p.sign) as ChartPlanet[];
    if (validPlanets.length === 0) {
      toast.error('Please fill in at least one planet placement');
      return;
    }
    onChartDataLoaded(validPlanets);
    toast.success(`Loaded ${validPlanets.length} planet placements`);
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <Upload size={18} />
          Upload or Enter Your Chart
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload */}
        <div>
          <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Upload chart image/PDF or JSON
          </Label>
          <Input
            type="file"
            accept="image/png,image/jpeg,application/pdf,application/json"
            onChange={handleFileUpload}
            className="mt-1"
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            Upload your chart wheel screenshot, PDF, or JSON export
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={inputMode === 'json' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputMode('json')}
            className="flex-1"
          >
            <FileJson size={14} className="mr-1" />
            Paste JSON
          </Button>
          <Button
            variant={inputMode === 'manual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputMode('manual')}
            className="flex-1"
          >
            <Edit3 size={14} className="mr-1" />
            Manual Entry
          </Button>
        </div>

        {/* JSON Input */}
        {inputMode === 'json' && (
          <div className="space-y-2">
            <Textarea
              placeholder='{ "planets": [{"name":"Sun","sign":"Libra","degree":28}] }'
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={4}
              className="font-mono text-xs"
            />
            <Button onClick={handleJsonPaste} size="sm" className="w-full">
              Load from JSON
            </Button>
          </div>
        )}

        {/* Manual Entry */}
        {inputMode === 'manual' && (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {manualPlanets.map((planet, i) => (
              <div key={planet.name} className="grid grid-cols-12 gap-1 items-center">
                <span className="col-span-3 text-xs font-medium truncate">{planet.name}</span>
                <Select
                  value={planet.sign || ''}
                  onValueChange={(val) => handleManualUpdate(i, 'sign', val)}
                >
                  <SelectTrigger className="col-span-4 h-8 text-xs">
                    <SelectValue placeholder="Sign" />
                  </SelectTrigger>
                  <SelectContent>
                    {ZODIAC_SIGNS.map(sign => (
                      <SelectItem key={sign} value={sign}>{sign}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={0}
                  max={29.99}
                  step={0.1}
                  placeholder="°"
                  value={planet.degree || ''}
                  onChange={(e) => handleManualUpdate(i, 'degree', parseFloat(e.target.value) || 0)}
                  className="col-span-3 h-8 text-xs"
                />
                <div className="col-span-2 flex items-center justify-center">
                  <Switch
                    checked={planet.retrograde || false}
                    onCheckedChange={(val) => handleManualUpdate(i, 'retrograde', val)}
                  />
                  <span className="text-[10px] ml-1 text-muted-foreground">℞</span>
                </div>
              </div>
            ))}
            <Button onClick={handleManualSubmit} size="sm" className="w-full mt-3">
              Apply Placements
            </Button>
          </div>
        )}

        {/* Settings */}
        <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Settings size={14} />
                Settings
              </span>
              <span className="text-xs text-muted-foreground">
                {settingsOpen ? '▲' : '▼'}
              </span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            {/* House System */}
            <div className="flex items-center justify-between">
              <Label className="text-xs">House System</Label>
              <Select value={houseSystem} onValueChange={setHouseSystem}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto_from_chart">Auto</SelectItem>
                  <SelectItem value="placidus">Placidus</SelectItem>
                  <SelectItem value="whole_sign">Whole Sign</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Traditional Rulers */}
            <div className="flex items-center justify-between">
              <Label className="text-xs">Use Traditional Rulers</Label>
              <Switch
                checked={useTraditional}
                onCheckedChange={setUseTraditional}
              />
            </div>

            {/* Orbs */}
            <div className="space-y-2">
              <Label className="text-xs">Aspect Orbs</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(aspectOrbs).map(([aspect, orb]) => (
                  <div key={aspect} className="flex items-center gap-2">
                    <span className="text-[10px] capitalize w-16">{aspect}</span>
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      step={0.5}
                      value={orb}
                      onChange={(e) => setAspectOrbs({
                        ...aspectOrbs,
                        [aspect]: parseFloat(e.target.value) || 0
                      })}
                      className="h-7 w-14 text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

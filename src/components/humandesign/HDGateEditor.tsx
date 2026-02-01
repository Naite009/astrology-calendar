import { useState } from 'react';
import { HDPlanetaryActivation } from '@/types/humanDesign';
import { ChevronDown, ChevronUp, AlertCircle, Check } from 'lucide-react';

interface HDGateEditorProps {
  personalityActivations: HDPlanetaryActivation[];
  designActivations: HDPlanetaryActivation[];
  onPersonalityChange: (activations: HDPlanetaryActivation[]) => void;
  onDesignChange: (activations: HDPlanetaryActivation[]) => void;
  warnings?: string[];
}

const PLANETS = [
  'Sun', 'Earth', 'NorthNode', 'SouthNode', 'Moon',
  'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn',
  'Uranus', 'Neptune', 'Pluto'
];

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Earth: '⊕',
  Moon: '☽',
  NorthNode: '☊',
  SouthNode: '☋',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
};

export function HDGateEditor({
  personalityActivations,
  designActivations,
  onPersonalityChange,
  onDesignChange,
  warnings = [],
}: HDGateEditorProps) {
  const [personalityExpanded, setPersonalityExpanded] = useState(true);
  const [designExpanded, setDesignExpanded] = useState(true);

  const updateActivation = (
    activations: HDPlanetaryActivation[],
    planet: string,
    field: 'gate' | 'line',
    value: number,
    onChange: (activations: HDPlanetaryActivation[]) => void
  ) => {
    const updated = [...activations];
    const idx = updated.findIndex(a => a.planet === planet);
    
    if (idx >= 0) {
      updated[idx] = { ...updated[idx], [field]: value };
    } else {
      updated.push({
        planet,
        gate: field === 'gate' ? value : 1,
        line: field === 'line' ? value : 1,
        longitude: 0,
        isConscious: activations === personalityActivations,
      });
    }
    
    onChange(updated);
  };

  const getActivation = (activations: HDPlanetaryActivation[], planet: string) => {
    return activations.find(a => a.planet === planet);
  };

  const renderPlanetRow = (
    planet: string,
    activations: HDPlanetaryActivation[],
    onChange: (activations: HDPlanetaryActivation[]) => void,
    isConscious: boolean
  ) => {
    const activation = getActivation(activations, planet);
    const gate = activation?.gate || '';
    const line = activation?.line || '';
    const hasValue = gate && line;

    return (
      <div key={planet} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
        <div className="flex items-center gap-2 w-28">
          <span className="text-lg">{PLANET_SYMBOLS[planet]}</span>
          <span className="text-sm text-muted-foreground">{planet}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={1}
            max={64}
            value={gate}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              if (val >= 0 && val <= 64) {
                updateActivation(activations, planet, 'gate', val, onChange);
              }
            }}
            placeholder="Gate"
            className={`w-16 border bg-background px-2 py-1.5 text-sm text-center font-mono ${
              isConscious ? 'border-border' : 'border-destructive/30'
            } focus:border-primary focus:outline-none`}
          />
          <span className="text-muted-foreground">.</span>
          <input
            type="number"
            min={1}
            max={6}
            value={line}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              if (val >= 0 && val <= 6) {
                updateActivation(activations, planet, 'line', val, onChange);
              }
            }}
            placeholder="Line"
            className={`w-12 border bg-background px-2 py-1.5 text-sm text-center font-mono ${
              isConscious ? 'border-border' : 'border-destructive/30'
            } focus:border-primary focus:outline-none`}
          />
        </div>

        {hasValue ? (
          <Check size={14} className="text-primary" />
        ) : (
          <AlertCircle size={14} className="text-muted-foreground" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {warnings.length > 0 && (
        <div className="rounded border border-muted bg-muted/30 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Parsing warnings:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Personality (Conscious) Section */}
      <div className="border border-border rounded">
        <button
          onClick={() => setPersonalityExpanded(!personalityExpanded)}
          className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-foreground" />
            <span className="text-sm font-medium">Personality (Conscious)</span>
            <span className="text-xs text-muted-foreground">— Birth moment</span>
          </div>
          {personalityExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {personalityExpanded && (
          <div className="p-3 pt-0 border-t border-border">
            {PLANETS.map(planet => renderPlanetRow(planet, personalityActivations, onPersonalityChange, true))}
          </div>
        )}
      </div>

      {/* Design (Unconscious) Section */}
      <div className="border border-destructive/30 rounded">
        <button
          onClick={() => setDesignExpanded(!designExpanded)}
          className="w-full flex items-center justify-between p-3 hover:bg-destructive/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-sm font-medium text-destructive">Design (Unconscious)</span>
            <span className="text-xs text-muted-foreground">— 88° before birth</span>
          </div>
          {designExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {designExpanded && (
          <div className="p-3 pt-0 border-t border-destructive/20">
            {PLANETS.map(planet => renderPlanetRow(planet, designActivations, onDesignChange, false))}
          </div>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground">
        Gates: 1-64 • Lines: 1-6 • Verify all values match your official chart before saving.
      </p>
    </div>
  );
}
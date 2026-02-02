import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { incarnationCrosses, IncarnationCross } from '@/data/incarnationCrosses';

interface IncarnationCrossComboboxProps {
  value: string;
  onChange: (value: string, gates?: { 
    consciousSun: number; 
    consciousEarth: number; 
    unconsciousSun: number; 
    unconsciousEarth: number 
  }) => void;
}

// Helper to format cross display with gates - gate numbers FIRST for easier matching
const formatCrossLabel = (cross: IncarnationCross): string => {
  const { consciousSun, consciousEarth, unconsciousSun, unconsciousEarth } = cross.gates;
  return `${cross.name} (${consciousSun}/${consciousEarth} | ${unconsciousSun}/${unconsciousEarth})`;
};

// Helper to find cross by gates (exact match)
export const findCrossByGates = (
  consciousSun: number,
  consciousEarth: number,
  unconsciousSun: number,
  unconsciousEarth: number
): IncarnationCross | undefined => {
  return incarnationCrosses.find(
    cross =>
      cross.gates.consciousSun === consciousSun &&
      cross.gates.consciousEarth === consciousEarth &&
      cross.gates.unconsciousSun === unconsciousSun &&
      cross.gates.unconsciousEarth === unconsciousEarth
  );
};

export const IncarnationCrossCombobox = ({ value, onChange }: IncarnationCrossComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [manualInput, setManualInput] = useState(false);

  // Filter and sort crosses based on search - prioritize exact gate matches
  const filteredCrosses = useMemo(() => {
    if (!searchQuery) return incarnationCrosses;
    const query = searchQuery.toLowerCase().trim();
    
    // Check if query contains gate numbers (e.g., "63/64" or "63 64" or just "63")
    const gateNumbers = query.match(/\d+/g)?.map(Number) || [];
    
    const filtered = incarnationCrosses.filter(cross => {
      const nameMatch = cross.name.toLowerCase().includes(query);
      const labelMatch = formatCrossLabel(cross).toLowerCase().includes(query);
      
      // Gate number matching
      const crossGates = [
        cross.gates.consciousSun,
        cross.gates.consciousEarth,
        cross.gates.unconsciousSun,
        cross.gates.unconsciousEarth
      ];
      const gateMatch = gateNumbers.length > 0 && gateNumbers.every(g => crossGates.includes(g));
      
      return nameMatch || labelMatch || gateMatch;
    });
    
    // Sort: exact gate matches first, then alphabetical
    return filtered.sort((a, b) => {
      const aGates = [a.gates.consciousSun, a.gates.consciousEarth, a.gates.unconsciousSun, a.gates.unconsciousEarth];
      const bGates = [b.gates.consciousSun, b.gates.consciousEarth, b.gates.unconsciousSun, b.gates.unconsciousEarth];
      
      const aGateMatch = gateNumbers.length > 0 && gateNumbers.every(g => aGates.includes(g));
      const bGateMatch = gateNumbers.length > 0 && gateNumbers.every(g => bGates.includes(g));
      
      if (aGateMatch && !bGateMatch) return -1;
      if (!aGateMatch && bGateMatch) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [searchQuery]);

  // Find selected cross from database
  const selectedCross = useMemo(() => {
    return incarnationCrosses.find(cross => 
      cross.name === value || formatCrossLabel(cross) === value
    );
  }, [value]);

  const handleSelect = (cross: IncarnationCross) => {
    onChange(cross.name, cross.gates);
    setOpen(false);
    setManualInput(false);
  };

  const handleManualEntry = () => {
    setManualInput(true);
    setOpen(false);
  };

  if (manualInput) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g., Right Angle Cross of Laws"
            className="flex-1 border border-border bg-background px-3 py-2 text-sm rounded focus:border-primary focus:outline-none"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setManualInput(false)}
            className="text-xs"
          >
            Search
          </Button>
        </div>
        <p className="text-[9px] text-muted-foreground">
          Manual entry mode. Click "Search" to browse database.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal h-auto py-2 px-3"
          >
            <span className="truncate text-sm">
              {selectedCross ? formatCrossLabel(selectedCross) : value || "Search incarnation crosses..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0 z-50 bg-background" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Search crosses (e.g. 'laws', 'sphinx')..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="border-none focus:ring-0"
            />
            <CommandList className="max-h-[300px]">
              <CommandEmpty className="py-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  No crosses found for "{searchQuery}"
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleManualEntry}
                  className="text-xs"
                >
                  Enter manually instead
                </Button>
              </CommandEmpty>
              
              <CommandGroup heading="Database Crosses">
                {filteredCrosses.map((cross) => (
                  <CommandItem
                    key={cross.name}
                    value={cross.name}
                    onSelect={() => handleSelect(cross)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCross?.name === cross.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{cross.name}</span>
                      <span className="text-xs text-muted-foreground">
                        Gates: {cross.gates.consciousSun}/{cross.gates.consciousEarth} | {cross.gates.unconsciousSun}/{cross.gates.unconsciousEarth}
                        {' • '}{cross.quarter} Quarter
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandGroup>
                <CommandItem
                  onSelect={handleManualEntry}
                  className="cursor-pointer border-t border-border"
                >
                  <Search className="mr-2 h-4 w-4" />
                  <span className="text-sm text-muted-foreground">
                    Enter cross name manually...
                  </span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <p className="text-[9px] text-muted-foreground">
        Search database or enter manually if cross not listed
      </p>
    </div>
  );
};
